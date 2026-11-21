import { GALLERY_SCENES, SCENE_IDS, STORE_KEYS } from '../../shared/constants';
import type { AppearanceSettings, SceneParamMap, VendorRendererInstance } from '../../shared/types';
import { getCachedSchemas, schemaOf } from '../api';
import {
	getCurrentStage,
	newStage,
	paintFallback,
	resolveSceneLayerBg,
	retireStage,
	setLayerBackground,
} from './layer';
import { attachPsScene, disposePsEditor } from './pixel-sculpt';
import { disposeShallowOceanController, getShallowOceanController } from './shallow-ocean';
import { ensureGallery, ensureGallerySelection, ensureVendorScene, registry } from './vendor-loader';
import { renderWallpaper } from './wallpaper';

const GALLERY_OWNED_KEYS = new Set(['selectedImageIds', 'activeImageId']);
const STORE_MIGRATION_KEY = 'dsh-ap:scene-stores-v2';

let bgInstance: VendorRendererInstance | null = null;
let bgSceneId: string | null = null;
let renderSeq = 0;
let lastRenderSig: string | null = null;
let lastParamsSig: string | null = null;

export function getBgInstance(): VendorRendererInstance | null {
	return bgInstance;
}

export function getBgSceneId(): string | null {
	return bgSceneId;
}

export function clearRenderSignature(): void {
	lastRenderSig = null;
}

export function writeSceneSetting(sceneId: string, patch: Record<string, unknown>): void {
	const key = STORE_KEYS[sceneId];
	if (!key) return;
	try {
		let cur: Record<string, unknown> = {};
		try {
			cur = JSON.parse(localStorage.getItem(key) ?? '{}') || {};
		} catch {
			cur = {};
		}
		localStorage.setItem(key, JSON.stringify({ ...cur, ...patch }));
	} catch {
		// Ignore localStorage failures
	}
}

/**
 * Full settings object for a scene store: schema defaults merged with persisted overrides.
 */
export function buildStoreSettings(sceneId: string, state: AppearanceSettings | null): SceneParamMap {
	const schemas = getCachedSchemas();
	const sch = schemas?.[sceneId] ?? schemaOf(sceneId);
	const base: SceneParamMap = sch?.defaults ? { ...sch.defaults } : {};
	const overrides = state?.sceneParams?.[sceneId];
	if (overrides && typeof overrides === 'object') {
		for (const k of Object.keys(overrides)) {
			base[k] = overrides[k];
		}
	}
	if (GALLERY_SCENES[sceneId]) {
		for (const gk of GALLERY_OWNED_KEYS) {
			if (!(overrides && Object.prototype.hasOwnProperty.call(overrides, gk))) {
				delete base[gk];
			}
		}
	}
	return base;
}

export function pushLiveSettings(inst: VendorRendererInstance | null, full: SceneParamMap): boolean {
	if (!inst) return false;
	const fn = inst.setSettings || inst.updateSettings || inst.setRenderSettings;
	if (typeof fn !== 'function') return false;
	try {
		fn.call(inst, full);
		return true;
	} catch {
		return false;
	}
}

export function replayActiveScene(sceneId: string): void {
	const inst = bgInstance && bgSceneId === sceneId ? bgInstance : null;
	if (!inst) return;
	if (typeof inst.replayOpening === 'function') {
		try {
			inst.replayOpening();
		} catch {
			// Ignore
		}
		return;
	}
	if (typeof inst.replay === 'function') {
		try {
			inst.replay();
		} catch {
			// Ignore
		}
	}
}

export function disposeBgInstance(): void {
	bgSceneId = null;
	if (bgInstance) {
		try {
			bgInstance.dispose?.();
		} catch {
			// Ignore
		}
		bgInstance = null;
	}
	retireStage(getCurrentStage());
}

export function migratePoisonedStores(): void {
	try {
		if (localStorage.getItem(STORE_MIGRATION_KEY)) return;
		for (const id of Object.keys(STORE_KEYS)) {
			if (GALLERY_SCENES[id]) continue;
			try {
				localStorage.removeItem(STORE_KEYS[id]);
			} catch {
				// Ignore
			}
		}
		localStorage.setItem(STORE_MIGRATION_KEY, '1');
	} catch {
		// Ignore
	}
}

function paramsSignature(state: AppearanceSettings | null): string {
	if (!state) return '{}';
	return JSON.stringify(state.sceneParams?.[state.scene] || {});
}

function renderSignature(state: AppearanceSettings | null): string | null {
	if (!(state && state.enabled && state.mode === 'scene')) return null;
	return `${state.mode}:${state.scene}`;
}

export interface RunnerCallbacks {
	getState: () => AppearanceSettings | null;
	onStatus: (msg: string, isError?: boolean) => void;
}

export function syncBackgroundRunner(cb: RunnerCallbacks): void {
	const state = cb.getState();
	if (!state) return;

	const bgOn = state.enabled && state.mode !== 'off';
	if (bgOn && state.mode === 'scene') {
		const sig = renderSignature(state);
		const pSig = paramsSignature(state);
		if (sig !== lastRenderSig) {
			renderScene(cb);
		} else if (pSig !== lastParamsSig) {
			lastParamsSig = pSig;
			const fullSettings = buildStoreSettings(state.scene, state);
			writeSceneSetting(state.scene, fullSettings);
			if (!(bgInstance && bgSceneId === state.scene && pushLiveSettings(bgInstance, fullSettings))) {
				renderScene(cb);
			}
		}
		return;
	}

	if (bgOn && state.mode === 'wallpaper') {
		renderSeq++;
		lastRenderSig = null;
		disposeBgInstance();
		renderWallpaper(state);
		return;
	}

	renderSeq++;
	disposeBgInstance();
	lastRenderSig = null;
}

export function renderScene(cb: RunnerCallbacks): void {
	const seq = ++renderSeq;
	const state = cb.getState();
	const sig = renderSignature(state);
	lastRenderSig = sig;
	lastParamsSig = paramsSignature(state);

	if (!sig || !state) {
		disposeBgInstance();
		return;
	}

	const id = SCENE_IDS.includes(state.scene) ? state.scene : 'milky-way';
	setLayerBackground(resolveSceneLayerBg(id, state));
	const initialSettings = buildStoreSettings(id, state);
	writeSceneSetting(id, initialSettings);

	const prepared = GALLERY_SCENES[id]
		? ensureGallery(id).then(() => {
				const entry0 = registry()?.get(id);
				if (entry0 && typeof entry0.prepareDefaults === 'function') {
					return entry0.prepareDefaults();
				}
				return null;
			})
		: Promise.resolve(null);

	const isStillCurrent = () => {
		const cur = cb.getState();
		return seq === renderSeq && Boolean(cur && cur.enabled && cur.mode === 'scene' && cur.scene === id);
	};

	prepared
		.then(() => ensureGallerySelection(id))
		.then(() => {
			if (id === 'shallow-ocean') {
				if (!isStillCurrent()) return;
				disposeBgInstance();
				const stage = newStage();
				const controller = getShallowOceanController();
				return controller
					.mount(
						stage,
						buildStoreSettings('shallow-ocean', cb.getState()),
						(msg) => {
							if (seq === renderSeq && msg) cb.onStatus(`场景提示：${String(msg).slice(0, 60)}`);
						},
						isStillCurrent,
					)
					.then((inst) => {
						if (!isStillCurrent()) {
							try {
								inst.dispose?.();
							} catch {
								// Ignore
							}
							return;
						}
						bgInstance = inst;
						bgSceneId = id;
						if (inst.ready && typeof inst.ready.then === 'function') {
							inst.ready.catch((err) => {
								if (seq === renderSeq) {
									cb.onStatus(`场景未就绪：${String((err as Error)?.message || err).slice(0, 60)}`, true);
								}
							});
						}
					});
			}

			return ensureVendorScene(id).then((entry) => {
				if (!isStillCurrent()) return;
				disposeBgInstance();

				if (id === 'pixel-sculpt') {
					attachPsScene(
						newStage(),
						cb.getState,
						cb.onStatus,
						isStillCurrent,
						(adapter) => {
							bgInstance = adapter;
							bgSceneId = id;
						},
						(err) => {
							paintFallback(`Pixel Sculpt 启动失败：${String((err as Error)?.message || err).slice(0, 50)}`);
							cb.onStatus('Pixel Sculpt 启动失败', true);
						},
					);
					return;
				}

				const stage = newStage();
				try {
					const inst = entry.startup(stage, (msg?: string) => {
						if (seq === renderSeq && msg) cb.onStatus(`场景提示：${String(msg).slice(0, 60)}`);
					});
					bgInstance = inst;
					bgSceneId = id;
					if (inst.ready && typeof inst.ready.then === 'function') {
						inst.ready.catch((err) => {
							if (seq === renderSeq) {
								cb.onStatus(`场景未就绪：${String((err as Error)?.message || err).slice(0, 60)}`, true);
							}
						});
					}
				} catch (err) {
					bgInstance = null;
					paintFallback(`场景渲染器启动失败：${id}（${String((err as Error)?.message || err).slice(0, 60)}）`);
					cb.onStatus(`场景渲染器启动失败：${id}`, true);
				}
			});
		})
		.catch((err) => {
			if (seq !== renderSeq) return;
			if (String((err as Error)?.message || err) === 'stale mount') return;
			disposeBgInstance();
			paintFallback(`场景加载失败：${id}（${String((err as Error)?.message || err).slice(0, 50)}）`);
			cb.onStatus(`场景加载失败：${id}`, true);
		});
}

export function disposeAllRunners(): void {
	renderSeq++;
	lastRenderSig = null;
	lastParamsSig = null;
	disposeBgInstance();
	disposePsEditor();
	disposeShallowOceanController();
}
