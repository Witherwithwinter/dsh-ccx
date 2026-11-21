import { SCENE_LAYER_BG } from '../../shared/constants';
import { clamp, finiteNum } from '../../shared/sanitize';
import type { AppearanceSettings } from '../../shared/types';
import { DIM_ID, LAYER_ID } from '../surfaces/surface-css';

export interface LayerNodes {
	layer: HTMLDivElement;
	bgWrap: HTMLDivElement;
	bgHost: HTMLDivElement;
	dimEl: HTMLDivElement;
}

const STAGE_RETIRE_DELAY_MS = 4000;
const HEX6_RE = /^#[\da-fA-F]{6}$/;

let nodes: LayerNodes | null = null;
let currentStage: HTMLDivElement | null = null;
const retireTimers = new Set<ReturnType<typeof setTimeout>>();

export function ensureLayer(): LayerNodes {
	if (nodes && document.body && document.body.contains(nodes.layer)) {
		return nodes;
	}
	const layer = document.createElement('div');
	layer.id = LAYER_ID;
	layer.setAttribute('data-dsh-ccx', 'background');
	layer.style.cssText =
		'position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;' +
		'width:100vw;height:100vh;margin:0;padding:0;contain:strict;background:#000;--ap-layer-bg:#000;';

	const bgWrap = document.createElement('div');
	bgWrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;';

	const bgHost = document.createElement('div');
	bgHost.style.cssText = 'position:absolute;inset:0;';

	const dimEl = document.createElement('div');
	dimEl.id = DIM_ID;
	dimEl.style.cssText =
		'position:absolute;inset:0;background:transparent;--ap-dim-bg:transparent;';

	bgWrap.appendChild(bgHost);
	layer.appendChild(bgWrap);
	layer.appendChild(dimEl);

	const body = document.body || document.documentElement;
	body.prepend(layer);

	nodes = { layer, bgWrap, bgHost, dimEl };
	return nodes;
}

export function getLayer(): LayerNodes | null {
	return nodes;
}

export function setLayerBackground(color: string): void {
	const { layer } = ensureLayer();
	layer.style.setProperty('--ap-layer-bg', color || '#000000');
}

export function resolveSceneLayerBg(sceneId: string, state: AppearanceSettings | null): string {
	if (
		sceneId === 'particle-image' ||
		sceneId === 'blinking-squares' ||
		sceneId === 'ascii-tiles' ||
		sceneId === 'spectral-drape'
	) {
		const params = state?.sceneParams?.[sceneId];
		const c = params && typeof params.backgroundColor === 'string' ? params.backgroundColor : null;
		if (c && HEX6_RE.test(c)) return c;
	}
	return SCENE_LAYER_BG[sceneId] || '#000000';
}

export function newStage(): HTMLDivElement {
	const { bgHost } = ensureLayer();
	const stage = document.createElement('div');
	stage.style.cssText = 'position:absolute;inset:0;';
	bgHost.appendChild(stage);
	currentStage = stage;
	return stage;
}

export function activeStage(): HTMLDivElement {
	const { bgHost } = ensureLayer();
	if (!currentStage || !bgHost.contains(currentStage)) {
		return newStage();
	}
	return currentStage;
}

export function getCurrentStage(): HTMLDivElement | null {
	return currentStage;
}

export function releaseMediaInStage(stage: HTMLElement): void {
	try {
		const videos = stage.querySelectorAll('video');
		for (let i = 0; i < videos.length; i++) {
			const v = videos[i];
			try {
				v.pause();
				v.removeAttribute('src');
				v.load();
			} catch {
				// Ignore media cleanup failures during detach
			}
		}
	} catch {
		// Ignore DOM query errors on detached stage
	}
}

/**
 * Retire an old stage without breaking particle-framework startup-hold coordination.
 * Immediately hides it visually to avoid overlapping two scenes, then removes DOM after 4s.
 */
export function retireStage(stage: HTMLDivElement | null): void {
	if (!stage) return;
	if (stage === currentStage) currentStage = null;
	try {
		stage.style.visibility = 'hidden';
		stage.style.pointerEvents = 'none';
	} catch {
		// Ignore style errors
	}
	releaseMediaInStage(stage);
	const timer = setTimeout(() => {
		retireTimers.delete(timer);
		try {
			stage.parentNode?.removeChild(stage);
		} catch {
			// Already removed
		}
	}, STAGE_RETIRE_DELAY_MS);
	retireTimers.add(timer);
}

export function paintFallback(text: string): void {
	const stage = activeStage();
	releaseMediaInStage(stage);
	stage.textContent = '';
	const tip = document.createElement('div');
	tip.style.cssText =
		'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
		'color:#4d5a78;font-size:13px;font-family:system-ui,sans-serif;background:' +
		'radial-gradient(120% 90% at 50% 110%,#101a33 0%,#07090f 60%);';
	tip.textContent = text || '';
	stage.appendChild(tip);
}

export function applyLayerAdjustments(state: AppearanceSettings): void {
	const { layer, bgWrap, dimEl } = ensureLayer();
	const bgOn = state.enabled && state.mode !== 'off';
	layer.style.display = bgOn ? '' : 'none';

	const blurPx = clamp(finiteNum(state.blur, 0), 0, 20);
	bgWrap.style.filter = blurPx > 0 ? `blur(${blurPx}px)` : '';
	bgWrap.style.transform =
		blurPx > 0 ? `scale(${(1 + Math.min(0.08, blurPx * 0.006)).toFixed(3)})` : '';

	const dimAlpha = bgOn ? clamp(finiteNum(state.dim, 0), 0, 0.8) : 0;
	const dimBg = bgOn ? `rgba(3,6,14,${dimAlpha.toFixed(3)})` : 'transparent';
	dimEl.style.background = dimBg;
	dimEl.style.setProperty('--ap-dim-bg', dimBg);
}

export function disposeLayer(): void {
	for (const timer of retireTimers) {
		clearTimeout(timer);
	}
	retireTimers.clear();
	if (currentStage) {
		releaseMediaInStage(currentStage);
		currentStage = null;
	}
	if (nodes) {
		releaseMediaInStage(nodes.layer);
		try {
			nodes.layer.parentNode?.removeChild(nodes.layer);
		} catch {
			// Ignore
		}
		nodes = null;
	}
}
