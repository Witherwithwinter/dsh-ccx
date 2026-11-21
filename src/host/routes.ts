import fs from 'node:fs';
import fsp from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  API_BASE,
  DEFAULT_SETTINGS,
  MEDIA_FILE_RE,
  SCENE_IDS,
  WALLPAPER_MAX_BYTES,
  WALLPAPER_MIMES,
} from '../shared/constants';
import { sanitizeSettings } from '../shared/sanitize';
import { selfRejection, type HostContextLike } from './fence';
import {
  clearAllWallpapers,
  deleteWallpaperById,
  listWallpapers,
  readSettings,
  saveWallpaperBytes,
  wallpapersDir,
  writeSettings,
} from './storage';
import { menuBarDebugInfo } from './window-chrome';

export interface RouteDef {
  kind: 'exact';
  path: string;
  handler: (req: IncomingMessage, res: ServerResponse) => unknown;
}

export interface WebServerServiceLike {
  register: (route: RouteDef) => () => void;
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': String(Buffer.byteLength(body)),
  });
  res.end(body);
}

function readBody(req: IncomingMessage, maxBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    let done = false;
    req.on('data', (chunk: Buffer) => {
      if (done) return;
      total += chunk.length;
      if (total > maxBytes) {
        done = true;
        reject(new Error('payload too large'));
        req.destroy?.();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!done) resolve(Buffer.concat(chunks));
    });
    req.on('error', (err) => {
      if (!done) reject(err);
    });
  });
}

function resolveVendorDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // Bundled output sits in lib/index.js; source tests may run from src/host/routes.ts
  const direct = path.join(here, 'vendor', 'code-codex');
  if (fs.existsSync(direct)) return direct;
  return path.resolve(here, '../../lib/vendor/code-codex');
}

function parseByteRange(rangeHeader: string | undefined, size: number): { start: number; end: number } | 'invalid' | null {
  if (!rangeHeader) return null;
  const m = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!m) return 'invalid';
  const rawStart = m[1];
  const rawEnd = m[2];
  if (rawStart === '' && rawEnd === '') return 'invalid';
  let start: number;
  let end: number;
  if (rawStart === '') {
    const suffixLen = Number(rawEnd);
    if (!Number.isFinite(suffixLen) || suffixLen <= 0) return 'invalid';
    start = Math.max(0, size - suffixLen);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === '' ? size - 1 : Math.min(size - 1, Number(rawEnd));
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= size) {
      return 'invalid';
    }
  }
  return { start, end };
}

async function sendFileRangeAware(
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string,
  mime: string,
): Promise<void> {
  const st = await fsp.stat(filePath);
  const size = st.size;
  const range = parseByteRange(req.headers?.range, size);
  if (range === 'invalid') {
    res.writeHead(416, { 'Content-Range': `bytes */${size}`, 'Content-Length': '0' });
    res.end();
    return;
  }
  const canPipe = typeof (res as unknown as { write?: unknown }).write === 'function' && typeof res.on === 'function';
  if (range) {
    const len = range.end - range.start + 1;
    res.writeHead(206, {
      'Content-Type': mime,
      'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${range.start}-${range.end}/${size}`,
      'Content-Length': String(len),
      'Cache-Control': 'no-store',
    });
    if (canPipe) {
      fs.createReadStream(filePath, { start: range.start, end: range.end }).pipe(res);
    } else {
      const fh = await fsp.open(filePath, 'r');
      try {
        const buf = Buffer.allocUnsafe(len);
        await fh.read(buf, 0, len, range.start);
        res.end(buf);
      } finally {
        await fh.close();
      }
    }
    return;
  }

  res.writeHead(200, {
    'Content-Type': mime,
    'Accept-Ranges': 'bytes',
    'Content-Length': String(size),
    'Cache-Control': 'no-store',
  });
  if (canPipe) {
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.end(await fsp.readFile(filePath));
  }
}

export function registerAppearanceRoutes(
  ctx: HostContextLike & { webServer: WebServerServiceLike },
): () => void {
  const disposers: Array<() => void> = [];
  const vendorDir = resolveVendorDir();

  function registerRoute(route: RouteDef): void {
    const inner = route.handler;
    disposers.push(
      ctx.webServer.register({
        kind: route.kind,
        path: route.path,
        handler: async (req, res) => {
          const code = selfRejection(req, ctx);
          if (code) {
            sendJson(res, code, { ok: false, error: 'rejected by trust fence' });
            return;
          }
          return inner(req, res);
        },
      }),
    );
  }

  const serveVendorFile = (file: string, contentType: string) => async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const bytes = await fsp.readFile(path.join(vendorDir, file));
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'Content-Length': String(bytes.length),
      });
      res.end(bytes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(res, 404, { ok: false, error: msg.slice(0, 120) });
    }
  };

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/wininfo.json`,
    handler: (_req, res) => sendJson(res, 200, { ok: true, win: menuBarDebugInfo() }),
  });

  for (const sceneId of SCENE_IDS) {
    registerRoute({
      kind: 'exact',
      path: `${API_BASE}/vendor/${sceneId}.js`,
      handler: serveVendorFile(`${sceneId}.js`, 'text/javascript; charset=utf-8'),
    });
  }

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/vendor-galleries.json`,
    handler: serveVendorFile('galleries.json', 'application/json; charset=utf-8'),
  });

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/vendor-shallow-ocean-thumbs.json`,
    handler: serveVendorFile('shallow-ocean-thumbnails.json', 'application/json; charset=utf-8'),
  });

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/vendor-media`,
    handler: async (req, res) => {
      try {
        const u = new URL(req.url || '/', 'http://localhost');
        const name = u.searchParams.get('file') || '';
        const match = MEDIA_FILE_RE.exec(name);
        if (!match) throw new Error('bad media file');
        const bytes = await fsp.readFile(path.join(vendorDir, match[1], 'media', name));
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store',
          'Content-Length': String(bytes.length),
        });
        res.end(bytes);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 404, { ok: false, error: msg.slice(0, 120) });
      }
    },
  });

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/scene-schemas.json`,
    handler: serveVendorFile('scene-schemas.json', 'application/json; charset=utf-8'),
  });

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/state.json`,
    handler: (_req, res) => {
      const settings = readSettings();
      const wallpapers = listWallpapers();
      sendJson(res, 200, {
        ok: true,
        settings,
        defaults: DEFAULT_SETTINGS,
        scenes: SCENE_IDS,
        wallpapers,
      });
    },
  });

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/state-save.json`,
    handler: async (req, res) => {
      try {
        const raw = await readBody(req, 64 * 1024);
        const parsed = JSON.parse(raw.toString('utf8')) as { settings?: unknown };
        const settings = sanitizeSettings(parsed?.settings ?? parsed);
        settings.savedAt = Date.now();
        writeSettings(settings);
        sendJson(res, 200, { ok: true, settings });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 400, { ok: false, error: msg.slice(0, 200) });
      }
    },
  });

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/wallpaper-upload`,
    handler: async (req, res) => {
      try {
        if (req.method !== 'POST') throw new Error('method not allowed');
        const u = new URL(req.url || '/', 'http://localhost');
        const rawName = String(u.searchParams.get('name') || '');
        const ext = path.extname(rawName).toLowerCase();
        if (!WALLPAPER_MIMES[ext]) throw new Error(`unsupported file type: ${ext || '(none)'}`);
        const bytes = await readBody(req, WALLPAPER_MAX_BYTES);
        if (!bytes.length) throw new Error('empty body');
        const item = await saveWallpaperBytes(ext, bytes);
        sendJson(res, 200, {
          ok: true,
          wallpaper: item,
          wallpapers: listWallpapers(),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 400, { ok: false, error: msg.slice(0, 200) });
      }
    },
  });

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/wallpaper-delete.json`,
    handler: async (req, res) => {
      try {
        const raw = await readBody(req, 4 * 1024);
        const parsed = JSON.parse(raw.toString('utf8')) as { id?: unknown };
        const id = String(parsed?.id ?? '');
        if (!/^[\w-]+$/.test(id)) throw new Error('bad wallpaper id');
        await deleteWallpaperById(id);
        sendJson(res, 200, { ok: true, wallpapers: listWallpapers() });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 400, { ok: false, error: msg.slice(0, 200) });
      }
    },
  });

  registerRoute({
    kind: 'exact',
    path: `${API_BASE}/wallpaper-clear.json`,
    handler: async (_req, res) => {
      try {
        await clearAllWallpapers();
        sendJson(res, 200, { ok: true, wallpapers: [] });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 400, { ok: false, error: msg.slice(0, 200) });
      }
    },
  });

  const serveWallpaper = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const u = new URL(req.url || '/', 'http://localhost');
      const id = String(u.searchParams.get('id') || '');
      if (!/^[\w-]+$/.test(id)) throw new Error('bad wallpaper id');
      const item = listWallpapers().find((w) => w.id === id);
      if (!item) throw new Error('wallpaper not found');
      await sendFileRangeAware(req, res, path.join(wallpapersDir(), item.name), item.mime);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(res, 404, { ok: false, error: msg.slice(0, 200) });
    }
  };

  registerRoute({ kind: 'exact', path: `${API_BASE}/wallpaper`, handler: serveWallpaper });
  registerRoute({ kind: 'exact', path: `${API_BASE}/wallpaper.png`, handler: serveWallpaper });

  return () => {
    for (const d of disposers) {
      try {
        d();
      } catch {
        /* ignore cleanup errors */
      }
    }
  };
}
