import { CLAMPS, DEFAULT_SETTINGS, SCENE_IDS, SURFACE_REGIONS } from './constants';
import type { AppearanceSettings, SceneParamMap, SurfaceSettings } from './types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function finiteNum(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function sanitizeSurfaces(input: unknown): SurfaceSettings {
  const src = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const out: SurfaceSettings = { ...DEFAULT_SETTINGS.surfaces };
  out.enabled = src.enabled === true;
  for (const key of SURFACE_REGIONS) {
    const n = Number(src[key]);
    if (Number.isFinite(n)) out[key] = Math.round(clamp(n, 0, 100));
  }
  return out;
}

export function sanitizeSettings(input: unknown): AppearanceSettings {
  const src = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const out: AppearanceSettings = {
    ...DEFAULT_SETTINGS,
    surfaces: { ...DEFAULT_SETTINGS.surfaces },
    sceneParams: {},
  };

  if (typeof src.enabled === 'boolean') out.enabled = src.enabled;
  if (src.mode === 'scene' || src.mode === 'wallpaper' || src.mode === 'off') out.mode = src.mode;
  if (typeof src.scene === 'string' && SCENE_IDS.includes(src.scene)) out.scene = src.scene;
  if (typeof src.wallpaperId === 'string' && /^[\w-]+$/.test(src.wallpaperId)) {
    out.wallpaperId = src.wallpaperId;
  } else if (src.wallpaperId === null) {
    out.wallpaperId = null;
  }
  if (src.wallpaperFit === 'cover' || src.wallpaperFit === 'contain' || src.wallpaperFit === 'tile') {
    out.wallpaperFit = src.wallpaperFit;
  }
  if (
    src.wallpaperPosition === 'center' ||
    src.wallpaperPosition === 'top' ||
    src.wallpaperPosition === 'bottom' ||
    src.wallpaperPosition === 'left' ||
    src.wallpaperPosition === 'right'
  ) {
    out.wallpaperPosition = src.wallpaperPosition;
  }

  for (const key of Object.keys(CLAMPS) as (keyof typeof CLAMPS)[]) {
    const n = Number(src[key]);
    if (Number.isFinite(n)) out[key] = clamp(n, CLAMPS[key][0], CLAMPS[key][1]);
  }

  // v1/v2 legacy surfaceOpacity migration
  let surfacesSrc: unknown = src.surfaces;
  if (!surfacesSrc && Number.isFinite(Number(src.surfaceOpacity))) {
    const legacy = Math.round(clamp(Number(src.surfaceOpacity), 0.05, 1) * 100);
    surfacesSrc = {
      enabled: true,
      sidebar: legacy,
      conversation: legacy,
      composer: Math.min(100, legacy + 20),
      right: legacy,
    };
  }

  const paramsSrc =
    src.sceneParams && typeof src.sceneParams === 'object'
      ? (src.sceneParams as Record<string, unknown>)
      : {};
  const paramsOut: Record<string, SceneParamMap> = {};
  for (const key of Object.keys(paramsSrc)) {
    if (!/^[a-z-]+$/.test(key)) continue;
    const val = paramsSrc[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      paramsOut[key] = { ...(val as SceneParamMap) };
    }
  }
  out.sceneParams = paramsOut;
  out.surfaces = sanitizeSurfaces(surfacesSrc);

  // v5 -> v6 composer default bump (only migrate untouched v5 default 58 -> 86)
  if (Number(src.version) < 6 && out.surfaces.composer === 58) {
    out.surfaces.composer = 86;
  }
  if (Number.isFinite(Number(src.savedAt))) {
    out.savedAt = Number(src.savedAt);
  }
  return out;
}

export function pickVisual(s: Partial<AppearanceSettings> | null | undefined) {
  if (!s) return null;
  return {
    enabled: s.enabled,
    mode: s.mode,
    scene: s.scene,
    wallpaperId: s.wallpaperId,
    wallpaperFit: s.wallpaperFit,
    wallpaperPosition: s.wallpaperPosition,
    surfaces: s.surfaces,
    dim: s.dim,
    blur: s.blur,
    sceneParams: s.sceneParams,
  };
}
