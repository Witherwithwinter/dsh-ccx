import { API_BASE } from '../shared/constants';
import type { SceneSchema, StateResponse, WallpaperItem } from '../shared/types';

export function apiGet<T>(path: string): Promise<T> {
  return fetch(API_BASE + path, { credentials: 'omit' }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<T>;
  });
}

export function apiPostJson<T>(path: string, payload: unknown): Promise<T> {
  return fetch(API_BASE + path, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(async (r) => {
    const data = (await r.json()) as T & { ok?: boolean; error?: string };
    if (!r.ok && data && typeof data === 'object' && !('ok' in data)) {
      throw new Error(`HTTP ${r.status}`);
    }
    return data;
  });
}

export function uploadWallpaper(
  name: string,
  bytes: ArrayBuffer,
): Promise<{ ok: boolean; error?: string; wallpaper?: WallpaperItem; wallpapers?: WallpaperItem[] }> {
  return fetch(`${API_BASE}/wallpaper-upload?name=${encodeURIComponent(name)}`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: bytes,
  }).then((r) => r.json());
}

export function fetchState(): Promise<StateResponse> {
  return apiGet<StateResponse>('/state.json');
}

let cachedSchemas: Record<string, SceneSchema> | null = null;
let schemasPromise: Promise<Record<string, SceneSchema>> | null = null;

export function getCachedSchemas(): Record<string, SceneSchema> | null {
  return cachedSchemas;
}

export function schemaOf(sceneId: string): SceneSchema | null {
  return cachedSchemas && cachedSchemas[sceneId] ? cachedSchemas[sceneId] : null;
}

export function ensureSchemas(): Promise<Record<string, SceneSchema>> {
  if (cachedSchemas) return Promise.resolve(cachedSchemas);
  if (!schemasPromise) {
    schemasPromise = apiGet<Record<string, SceneSchema>>('/scene-schemas.json')
      .then((s) => {
        cachedSchemas = s && typeof s === 'object' ? s : {};
        return cachedSchemas;
      })
      .catch(() => {
        schemasPromise = null;
        return {};
      });
  }
  return schemasPromise;
}

let cachedOceanThumbs: Record<string, string> | null = null;
let oceanThumbsPromise: Promise<Record<string, string>> | null = null;

export function getCachedOceanThumbs(): Record<string, string> | null {
  return cachedOceanThumbs;
}

export function ensureOceanThumbs(): Promise<Record<string, string>> {
  if (cachedOceanThumbs) return Promise.resolve(cachedOceanThumbs);
  if (!oceanThumbsPromise) {
    oceanThumbsPromise = apiGet<Record<string, string>>('/vendor-shallow-ocean-thumbs.json')
      .then((t) => {
        cachedOceanThumbs = t && typeof t === 'object' ? t : {};
        return cachedOceanThumbs;
      })
      .catch(() => {
        oceanThumbsPromise = null;
        return {};
      });
  }
  return oceanThumbsPromise;
}
