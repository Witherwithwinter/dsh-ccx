import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { API_BASE, DEFAULT_SETTINGS, WALLPAPER_MIMES } from '../shared/constants';
import { sanitizeSettings } from '../shared/sanitize';
import type { AppearanceSettings, WallpaperItem } from '../shared/types';

export function dshHome(): string {
  return process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
}

export function dataDir(): string {
  return path.join(dshHome(), 'appearances');
}

export function wallpapersDir(): string {
  return path.join(dataDir(), 'wallpapers');
}

export function settingsPath(): string {
  return path.join(dataDir(), 'settings.json');
}

export function wallpaperUrl(id: string): string {
  return `${API_BASE}/wallpaper?id=${encodeURIComponent(id)}`;
}

export function cloneDefaultSettings(): AppearanceSettings {
  return {
    ...DEFAULT_SETTINGS,
    surfaces: { ...DEFAULT_SETTINGS.surfaces },
    sceneParams: {},
  };
}

export function readSettings(): AppearanceSettings {
  try {
    return sanitizeSettings(JSON.parse(fs.readFileSync(settingsPath(), 'utf8')));
  } catch {
    return cloneDefaultSettings();
  }
}

export function writeSettings(value: AppearanceSettings): void {
  fs.mkdirSync(dataDir(), { recursive: true });
  const target = settingsPath();
  const tmp = `${target}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, target);
}

export function listWallpapers(): WallpaperItem[] {
  const dir = wallpapersDir();
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  const items: WallpaperItem[] = [];
  for (const name of entries) {
    const ext = path.extname(name).toLowerCase();
    const mime = WALLPAPER_MIMES[ext];
    if (!mime) continue;
    const id = name.slice(0, name.length - ext.length);
    try {
      const st = fs.statSync(path.join(dir, name));
      if (!st.isFile()) continue;
      items.push({ id, name, mime, size: st.size, mtimeMs: st.mtimeMs, url: wallpaperUrl(id) });
    } catch {
      /* ignore vanishing file */
    }
  }
  items.sort((a, b) => (b.mtimeMs ?? 0) - (a.mtimeMs ?? 0));
  return items;
}

export async function saveWallpaperBytes(ext: string, bytes: Buffer): Promise<WallpaperItem> {
  const dir = wallpapersDir();
  await fsp.mkdir(dir, { recursive: true });
  const id = crypto.randomBytes(8).toString('hex');
  const name = id + ext;
  const file = path.join(dir, name);
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  await fsp.writeFile(tmp, bytes);
  await fsp.rename(tmp, file);
  return {
    id,
    name,
    mime: WALLPAPER_MIMES[ext],
    size: bytes.length,
    url: wallpaperUrl(id),
  };
}

export async function deleteWallpaperById(id: string): Promise<void> {
  const item = listWallpapers().find((w) => w.id === id);
  if (!item) return;
  await fsp.rm(path.join(wallpapersDir(), item.name), { force: true });
}

export async function clearAllWallpapers(): Promise<void> {
  const items = listWallpapers();
  await Promise.all(
    items.map((w) => fsp.rm(path.join(wallpapersDir(), w.name), { force: true })),
  );
}
