import { PLUGIN_ID, SCENE_IDS } from '../shared/constants';
import { finiteNum, pickVisual, sanitizeSettings } from '../shared/sanitize';
import type { AppearanceSettings, WallpaperItem } from '../shared/types';
import { apiPostJson, ensureSchemas, fetchState } from './api';
import { applyLayerAdjustments, disposeLayer, ensureLayer } from './background/layer';
import { disposeAllRunners, migratePoisonedStores, syncBackgroundRunner } from './background/scene-runner';
import { disposeCornerPatch, syncCornerPatch } from './surfaces/corner-patch';
import { applySurfaceStyles, clearSurfaceStyles } from './surfaces/surface-css';
import {
	ensurePanel,
	getSettingsId,
	isSettingsOpen,
	positionSettingsPanel,
	refreshPanel,
	renderSettings,
	setPanelStatus,
	syncPanelTheme,
	syncSidebarCollapsed,
	teardownPanel,
} from './ui/panel';

interface CordisClientContext {
	effect: (fn: () => () => void, label?: string) => void;
}

const POLL_INTERVAL_MS = 8000;
const SAVE_DEBOUNCE_MS = 280;

let state: AppearanceSettings | null = null;
let wallpapersCache: WallpaperItem[] = [];
let savedAtLocal = 0;
let saveSeq = 0;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
let themeObserver: MutationObserver | null = null;
let layoutObserver: MutationObserver | null = null;
let layoutRaf = 0;
let started = false;

function scheduleSave(): void {
	if (!state) return;
	if (saveTimer) clearTimeout(saveTimer);
	saveTimer = setTimeout(() => {
		saveTimer = null;
		if (!state) return;
		const seq = ++saveSeq;
		const payload = sanitizeSettings(state);
		void apiPostJson<{ ok?: boolean; settings?: AppearanceSettings; error?: string }>('/state-save.json', {
			settings: payload,
		})
			.then((res) => {
				if (seq !== saveSeq) return;
				if (res?.ok && res.settings) {
					state = sanitizeSettings(res.settings);
					savedAtLocal = finiteNum(state.savedAt, 0);
				}
			})
			.catch((err) => {
				if (seq !== saveSeq) return;
				setPanelStatus(`保存失败：${String((err as Error)?.message || err)}`, true);
			});
	}, SAVE_DEBOUNCE_MS);
}

function applyAll(): void {
	if (!state) return;
	const { layer } = ensureLayer();

	ensurePanel({
		getState: () => state,
		getWallpapers: () => wallpapersCache,
		setWallpapers: (list) => {
			wallpapersCache = list;
		},
		scheduleSave,
		applyAll,
		onStatus: setPanelStatus,
	});

	applyLayerAdjustments(state);
	syncBackgroundRunner({
		getState: () => state,
		onStatus: setPanelStatus,
	});
	applySurfaceStyles(state, layer);
	syncCornerPatch(state, layer);
	refreshPanel(state);
}

function startPolling(): void {
	if (pollTimer) return;
	pollTimer = setInterval(() => {
		if (document.hidden) return;
		void fetchState()
			.then((data) => {
				if (!data?.settings) return;
				const remote = sanitizeSettings(data.settings);
				const remoteAt = finiteNum(remote.savedAt, 0);
				if (remoteAt && remoteAt !== savedAtLocal) {
					const before = state ? JSON.stringify(pickVisual(state)) : '';
					state = remote;
					savedAtLocal = remoteAt;
					if (Array.isArray(data.wallpapers)) {
						wallpapersCache = data.wallpapers;
					}
					if (before !== JSON.stringify(pickVisual(state))) {
						applyAll();
					}
				}
			})
			.catch(() => {});
	}, POLL_INTERVAL_MS);
}

function scheduleLayoutSync(): void {
	if (layoutRaf) return;
	layoutRaf = requestAnimationFrame(() => {
		layoutRaf = 0;
		if (!started) return;
		syncSidebarCollapsed();
		if (state) {
			const layer = ensureLayer().layer;
			syncCornerPatch(state, layer);
		}
		if (isSettingsOpen()) {
			positionSettingsPanel();
		}
	});
}

function startObservers(): void {
	if (!themeObserver && document.body) {
		themeObserver = new MutationObserver(() => {
			syncPanelTheme();
			if (state) {
				applySurfaceStyles(state, ensureLayer().layer);
			}
		});
		themeObserver.observe(document.body, {
			attributes: true,
			attributeFilter: ['data-ds-dark-theme', 'class'],
		});
	}

	const rootEl = document.getElementById('root') || document.body;
	if (!layoutObserver && rootEl) {
		layoutObserver = new MutationObserver(() => {
			scheduleLayoutSync();
		});
		layoutObserver.observe(rootEl, {
			attributes: true,
			attributeFilter: ['class', 'style', 'data-collapsed'],
			subtree: false,
			childList: true,
		});
	}
}

function onResize(): void {
	if (resizeTimer) clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => {
		resizeTimer = null;
		scheduleLayoutSync();
	}, 120);
}

function teardown(): void {
	if (saveTimer) {
		clearTimeout(saveTimer);
		saveTimer = null;
	}
	if (pollTimer) {
		clearInterval(pollTimer);
		pollTimer = null;
	}
	if (resizeTimer) {
		clearTimeout(resizeTimer);
		resizeTimer = null;
	}
	if (layoutRaf) {
		cancelAnimationFrame(layoutRaf);
		layoutRaf = 0;
	}
	if (themeObserver) {
		themeObserver.disconnect();
		themeObserver = null;
	}
	if (layoutObserver) {
		layoutObserver.disconnect();
		layoutObserver = null;
	}
	window.removeEventListener('resize', onResize);

	disposeCornerPatch();
	clearSurfaceStyles();
	disposeAllRunners();
	disposeLayer();
	teardownPanel();
	state = null;
	wallpapersCache = [];
	savedAtLocal = 0;
}

export function apply(ctx: CordisClientContext): void {
	if (started) return;
	started = true;

	ctx.effect(() => {
		return () => {
			started = false;
			teardown();
		};
	}, `${PLUGIN_ID}: reset apply guard`);

	migratePoisonedStores();
	ensureLayer();
	void ensureSchemas().then(() => {
		const sid = getSettingsId();
		if (isSettingsOpen() && sid && SCENE_IDS.includes(sid)) {
			renderSettings(sid);
		}
	});

	void fetchState()
		.then((data) => {
			if (!started) return;
			state = sanitizeSettings(data?.settings);
			if (Array.isArray(data?.wallpapers)) {
				wallpapersCache = data.wallpapers;
			}
			savedAtLocal = finiteNum(state.savedAt, 0);
			applyAll();
			startPolling();
			startObservers();
		})
		.catch(() => {
			if (!started) return;
			state = sanitizeSettings(null);
			applyAll();
			startObservers();
		});

	window.addEventListener('resize', onResize);
}

export const inject: string[] = [];
