import type { AppearanceSettings, VendorRendererInstance } from '../../shared/types';
import { ensureGallery, ensureVendorScene } from './vendor-loader';

export interface PixelSculptEditor {
	stage: HTMLDivElement;
	canvas: HTMLCanvasElement;
	inst: {
		setActive: (active: boolean, opts?: { paused?: boolean }) => void;
		setSettings: (s: Record<string, unknown>) => void;
		mountControls: (host: HTMLElement, locale?: string) => void;
		reset: () => void;
		replay: () => void;
	} | null;
	ready: Promise<PixelSculptEditor>;
}

let psEd: PixelSculptEditor | null = null;

export function isPsActive(state: AppearanceSettings | null): boolean {
	return Boolean(state && state.enabled && state.mode === 'scene' && state.scene === 'pixel-sculpt');
}

export function isPsPaused(state: AppearanceSettings | null): boolean {
	const p = state?.sceneParams?.['pixel-sculpt'];
	return Boolean(p && typeof p === 'object' && p.paused);
}

export function getPsEditor(): PixelSculptEditor | null {
	return psEd;
}

export function ensurePsEditor(
	getState: () => AppearanceSettings | null,
	onStatus: (msg: string, isError?: boolean) => void,
): Promise<PixelSculptEditor> {
	if (psEd) return psEd.ready;

	const stage = document.createElement('div');
	stage.style.cssText = 'position:absolute;inset:0;';
	const canvas = document.createElement('canvas');
	canvas.style.cssText = 'width:100%;height:100%;display:block';
	stage.appendChild(canvas);

	const holder: PixelSculptEditor = {
		stage,
		canvas,
		inst: null,
		ready: null as unknown as Promise<PixelSculptEditor>,
	};

	holder.ready = ensureGallery('pixel-sculpt')
		.catch(() => null)
		.then(() => ensureVendorScene('pixel-sculpt'))
		.then((entry) => {
			const seed = entry.prepareDefaults ? entry.prepareDefaults() : null;
			return Promise.resolve(seed)
				.catch(() => null)
				.then(() => {
					const Ctor = entry.exports?.PixelSculptRenderer as
						| (new (
								stage: HTMLElement,
								canvas: HTMLCanvasElement,
								settings: unknown,
								onStatus: (msg: string) => void,
								persist: boolean,
						  ) => PixelSculptEditor['inst'])
						| undefined;
					if (typeof Ctor !== 'function') {
						throw new Error('PixelSculptRenderer 不可用');
					}
					holder.inst = new Ctor(
						stage,
						canvas,
						null,
						(msg: string) => {
							if (msg && isPsActive(getState())) {
								onStatus(`Pixel Sculpt：${String(msg).slice(0, 60)}`, true);
							}
						},
						true,
					);
					return holder;
				});
		});

	holder.ready.catch(() => {
		if (psEd === holder) psEd = null;
	});

	psEd = holder;
	return holder.ready;
}

export function attachPsScene(
	stage: HTMLDivElement,
	getState: () => AppearanceSettings | null,
	onStatus: (msg: string, isError?: boolean) => void,
	isStillCurrent: () => boolean,
	onAttached: (instance: VendorRendererInstance) => void,
	onError: (err: unknown) => void,
): void {
	ensurePsEditor(getState, onStatus)
		.then((ed) => {
			if (!isStillCurrent() || !isPsActive(getState())) return;
			stage.appendChild(ed.stage);
			try {
				ed.inst?.setActive(true, { paused: isPsPaused(getState()) });
			} catch {
				// Ignore vendor lifecycle glitch
			}
			const adapter: VendorRendererInstance = {
				setSettings: (s) => {
					try {
						ed.inst?.setSettings(s || {});
					} catch {
						// Ignore
					}
				},
				reset: () => {
					try {
						ed.inst?.reset();
					} catch {
						// Ignore
					}
				},
				replay: () => {
					try {
						ed.inst?.replay();
					} catch {
						// Ignore
					}
				},
				dispose: () => {
					try {
						ed.stage.parentNode?.removeChild(ed.stage);
					} catch {
						// Ignore
					}
					try {
						ed.inst?.setActive(false, { paused: isPsPaused(getState()) });
					} catch {
						// Ignore
					}
				},
			};
			onAttached(adapter);
		})
		.catch((err) => {
			if (!isStillCurrent()) return;
			onError(err);
		});
}

export function disposePsEditor(): void {
	if (!psEd) return;
	try {
		psEd.inst?.setActive(false, { paused: true });
	} catch {
		// Ignore
	}
	try {
		psEd.stage.parentNode?.removeChild(psEd.stage);
	} catch {
		// Ignore
	}
	psEd = null;
}
