import { clamp, finiteNum } from '../../shared/sanitize';
import type { SceneField, SceneParamMap, SceneSchema } from '../../shared/types';

const HEX6_RE = /^#[\da-fA-F]{6}$/;

export function escapeHtml(str: unknown): string {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function sanitizeDraft(sch: SceneSchema | null, input: unknown): SceneParamMap {
	const out: SceneParamMap =
		input && typeof input === 'object' ? { ...(input as SceneParamMap) } : {};
	if (!sch) return out;

	if (typeof sch.qualityDefault === 'string') {
		const q = out.quality;
		if (q !== 'low' && q !== 'medium' && q !== 'high') {
			out.quality = sch.qualityDefault;
		}
	}

	if (typeof sch.defaults?.performanceMode === 'number') {
		const pm = Number(out.performanceMode);
		out.performanceMode = Number.isFinite(pm)
			? clamp(Math.round(pm), 0, 3)
			: sch.defaults.performanceMode;
	}

	for (const f of sch.fields || []) {
		const n = Number(out[f.key]);
		if (!Number.isFinite(n)) {
			out[f.key] = finiteNum(sch.defaults?.[f.key], f.min);
		} else {
			out[f.key] = clamp(n, f.min, f.max);
		}
	}

	if (Array.isArray(sch.colors)) {
		const cols = Array.isArray(out.colors) ? out.colors : sch.colors;
		out.colors = sch.colors.map((c, idx) =>
			typeof cols[idx] === 'string' && HEX6_RE.test(cols[idx]) ? cols[idx] : c,
		);
	}

	for (const cf of sch.colorFields || []) {
		const cv = out[cf.key];
		out[cf.key] =
			typeof cv === 'string' && HEX6_RE.test(cv)
				? cv
				: (typeof sch.defaults?.[cf.key] === 'string' ? (sch.defaults[cf.key] as string) : '#ffffff');
	}

	for (const tg of sch.toggles || []) {
		const defaultVal = sch.defaults?.[tg.key];
		const rawVal = out[tg.key];
		if (typeof defaultVal === 'number') {
			out[tg.key] = Number(rawVal) === 1 || rawVal === true ? 1 : 0;
		} else {
			out[tg.key] = Boolean(rawVal);
		}
	}

	return out;
}

export function mergeSceneDraft(
	sch: SceneSchema | null,
	savedOverrides: SceneParamMap | undefined,
): SceneParamMap {
	const base: SceneParamMap = sch?.defaults ? { ...sch.defaults } : {};
	if (savedOverrides && typeof savedOverrides === 'object') {
		for (const k of Object.keys(savedOverrides)) {
			base[k] = savedOverrides[k];
		}
	}
	return sanitizeDraft(sch, base);
}

export function fmtFieldVal(f: Pick<SceneField, 'percent' | 'precision' | 'step' | 'unit'>, value: number): string {
	if (f.percent) return `${Math.round(value * 100)}%`;
	const stepStr = String(f.step);
	const inferredDec = stepStr.includes('.') ? (stepStr.split('.')[1] || '').length : 0;
	const dec = f.precision != null ? f.precision : inferredDec;
	return `${Number(value).toFixed(dec)}${f.unit || ''}`;
}

export function draftDeltaObj(
	sch: SceneSchema | null,
	draft: SceneParamMap | null,
): { delta: SceneParamMap; full: SceneParamMap; base: SceneParamMap } {
	const base: SceneParamMap = sch?.defaults ? { ...sch.defaults } : {};
	const full = sanitizeDraft(sch, draft);
	const delta: SceneParamMap = {};
	for (const k of Object.keys(full)) {
		if (k === 'quality' && !(k in base)) continue;
		if (JSON.stringify(full[k]) !== JSON.stringify(base[k])) {
			delta[k] = full[k];
		}
	}
	return { delta, full, base };
}
