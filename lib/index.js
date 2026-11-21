// Built from src/host/index.ts — do not edit lib/index.js directly.


// src/shared/constants.ts
var PLUGIN_ID = "dsh-ccx";
var API_BASE = "/dsh-appearances";
var SCENES = [
  {
    id: "milky-way",
    label: "\u94F6\u6CB3",
    en: "Milky Way",
    cardTitle: "Milky Way Background",
    icon: "milky-way",
    ext: "",
    layerBg: "#02090d",
    storeKey: "code-codex:milky-way-background:v1"
  },
  {
    id: "glow-horizon",
    label: "\u8F89\u5149\u5730\u5E73\u7EBF",
    en: "Glow Horizon",
    cardTitle: "Glow Horizon Background",
    icon: "glow-horizon",
    ext: "ext-glowhorizon",
    layerBg: "#050507",
    storeKey: "code-codex:glow-horizon-background:v1"
  },
  {
    id: "mountain",
    label: "\u5C42\u5CE6",
    en: "Layered Mountain",
    cardTitle: "Layered Mountain Background",
    icon: "mountain",
    ext: "",
    layerBg: "#02090d",
    storeKey: "code-codex:mountain-settings:v1"
  },
  {
    id: "heavenly-cloud",
    label: "\u4E91\u7A79",
    en: "Heavenly Cloud",
    cardTitle: "Heavenly Cloud Background",
    icon: "heavenly-cloud",
    ext: "ext-heavenlycloud",
    layerBg: "#020408",
    storeKey: "code-codex:heavenly-cloud-background:v1"
  },
  {
    id: "aurora-ionosphere",
    label: "\u6781\u5149\u7535\u79BB\u5C42",
    en: "Aurora Ionosphere",
    cardTitle: "Aurora Ionosphere Background",
    icon: "aurora-ionosphere",
    ext: "",
    layerBg: "#02090d",
    storeKey: "code-codex:aurora-ionosphere-background:v1"
  },
  {
    id: "black-hole",
    label: "\u9ED1\u6D1E",
    en: "Black Hole",
    cardTitle: "Black Hole Background",
    icon: "black-hole",
    ext: "ext-blackhole",
    layerBg: "#000000",
    storeKey: "code-codex:black-hole-background:v1"
  },
  {
    id: "cloud-train",
    label: "\u4E91\u5217\u8F66",
    en: "Cloud Train",
    cardTitle: "Cloud Train Background",
    icon: "cloud-train",
    ext: "",
    layerBg: "#02090d",
    storeKey: "code-codex:cloud-train-settings:v1"
  },
  {
    id: "particle-image",
    label: "\u7C92\u5B50\u6210\u50CF",
    en: "Particle Image",
    cardTitle: "Particle Image Background",
    icon: "particle-image",
    ext: "ext-particle",
    layerBg: "#000000",
    bgColorKey: "backgroundColor",
    storeKey: "code-codex:particle-image-background:v1"
  },
  {
    id: "pixel-sculpt",
    label: "\u50CF\u7D20\u96D5\u5851",
    en: "Pixel Sculpt",
    cardTitle: "Pixel Sculpt Background",
    icon: "pixel-sculpt",
    ext: "",
    layerBg: "#02090d",
    storeKey: "code-codex:pixel-sculpt-settings:v1"
  },
  {
    id: "blinking-squares",
    label: "\u95EA\u70C1\u65B9\u5757",
    en: "Blinking Squares",
    cardTitle: "Blinking Squares Background",
    icon: "blinking-squares",
    ext: "",
    layerBg: "#000000",
    bgColorKey: "backgroundColor",
    storeKey: "code-codex:blinking-squares-background:v1"
  },
  {
    id: "ascii-tiles",
    label: "ASCII \u5B57\u7B26\u7816\u5757",
    en: "ASCII Tiles",
    cardTitle: "ASCII Tiles Background",
    icon: "ascii-tiles",
    ext: "ext-asciitiles",
    layerBg: "#000000",
    bgColorKey: "backgroundColor",
    storeKey: "code-codex:ascii-tiles-background:v1"
  },
  {
    id: "shallow-ocean",
    label: "\u6D45\u6D77\u6765\u4FE1",
    en: "Shallow Ocean Letters",
    cardTitle: "Shallow Ocean Letters Background",
    icon: "shallow-ocean",
    ext: "ext-shallowocean",
    layerBg: "#181818",
    storeKey: "code-codex:shallow-ocean-background:v1"
  },
  {
    id: "spectral-drape",
    label: "\u5149\u8C31\u70B9\u9635\u5E37\u5E55",
    en: "Spectral Drape",
    cardTitle: "Spectral Drape Background",
    icon: "spectral-drape",
    ext: "ext-spectraldrape",
    layerBg: "#0a0a0a",
    bgColorKey: "backgroundColor",
    storeKey: "code-codex:spectral-drape-background:v1"
  }
];
var SCENE_IDS = SCENES.map((s) => s.id);
var SCENE_META_MAP = Object.fromEntries(
  SCENES.map((s) => [s.id, s])
);
var STORE_KEYS = Object.fromEntries(
  SCENES.map((s) => [s.id, s.storeKey])
);
var SCENE_LAYER_BG = Object.fromEntries(
  SCENES.map((s) => [s.id, s.layerBg])
);
var SURFACE_REGIONS = [
  "sidebar",
  "conversation",
  "composer",
  "right"
];
var DEFAULT_SETTINGS = Object.freeze({
  version: 6,
  enabled: true,
  mode: "scene",
  scene: "milky-way",
  wallpaperId: null,
  wallpaperFit: "cover",
  wallpaperPosition: "center",
  surfaces: Object.freeze({
    enabled: true,
    sidebar: 66,
    conversation: 58,
    composer: 86,
    right: 66
  }),
  sceneParams: {},
  dim: 0,
  blur: 0,
  savedAt: 0
});
var CLAMPS = {
  dim: [0, 0.8],
  blur: [0, 20]
};
var MEDIA_FILE_RE = /^CodeCodex-background-(particle-image|pixel-sculpt)-(image|thumbnail)-[0-9a-f]{16}\.png$/;
var WALLPAPER_MIMES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime"
};
var WALLPAPER_MAX_BYTES = 200 * 1024 * 1024;

// src/shared/sanitize.ts
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function sanitizeSurfaces(input) {
  const src = input && typeof input === "object" ? input : {};
  const out = { ...DEFAULT_SETTINGS.surfaces };
  out.enabled = src.enabled === true;
  for (const key of SURFACE_REGIONS) {
    const n = Number(src[key]);
    if (Number.isFinite(n)) out[key] = Math.round(clamp(n, 0, 100));
  }
  return out;
}
function sanitizeSettings(input) {
  const src = input && typeof input === "object" ? input : {};
  const out = {
    ...DEFAULT_SETTINGS,
    surfaces: { ...DEFAULT_SETTINGS.surfaces },
    sceneParams: {}
  };
  if (typeof src.enabled === "boolean") out.enabled = src.enabled;
  if (src.mode === "scene" || src.mode === "wallpaper" || src.mode === "off") out.mode = src.mode;
  if (typeof src.scene === "string" && SCENE_IDS.includes(src.scene)) out.scene = src.scene;
  if (typeof src.wallpaperId === "string" && /^[\w-]+$/.test(src.wallpaperId)) {
    out.wallpaperId = src.wallpaperId;
  } else if (src.wallpaperId === null) {
    out.wallpaperId = null;
  }
  if (src.wallpaperFit === "cover" || src.wallpaperFit === "contain" || src.wallpaperFit === "tile") {
    out.wallpaperFit = src.wallpaperFit;
  }
  if (src.wallpaperPosition === "center" || src.wallpaperPosition === "top" || src.wallpaperPosition === "bottom" || src.wallpaperPosition === "left" || src.wallpaperPosition === "right") {
    out.wallpaperPosition = src.wallpaperPosition;
  }
  for (const key of Object.keys(CLAMPS)) {
    const n = Number(src[key]);
    if (Number.isFinite(n)) out[key] = clamp(n, CLAMPS[key][0], CLAMPS[key][1]);
  }
  let surfacesSrc = src.surfaces;
  if (!surfacesSrc && Number.isFinite(Number(src.surfaceOpacity))) {
    const legacy = Math.round(clamp(Number(src.surfaceOpacity), 0.05, 1) * 100);
    surfacesSrc = {
      enabled: true,
      sidebar: legacy,
      conversation: legacy,
      composer: Math.min(100, legacy + 20),
      right: legacy
    };
  }
  const paramsSrc = src.sceneParams && typeof src.sceneParams === "object" ? src.sceneParams : {};
  const paramsOut = {};
  for (const key of Object.keys(paramsSrc)) {
    if (!/^[a-z-]+$/.test(key)) continue;
    const val = paramsSrc[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      paramsOut[key] = { ...val };
    }
  }
  out.sceneParams = paramsOut;
  out.surfaces = sanitizeSurfaces(surfacesSrc);
  if (Number(src.version) < 6 && out.surfaces.composer === 58) {
    out.surfaces.composer = 86;
  }
  if (Number.isFinite(Number(src.savedAt))) {
    out.savedAt = Number(src.savedAt);
  }
  return out;
}

// src/host/routes.ts
import fs2 from "node:fs";
import fsp2 from "node:fs/promises";
import path2 from "node:path";
import { fileURLToPath } from "node:url";

// src/host/fence.ts
function isLoopbackHostname(hn) {
  const h = String(hn || "").toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
  if (!h) return false;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "::1") return true;
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (!m) return false;
  if (Number(m[1]) !== 127) return false;
  return [m[2], m[3], m[4]].every((x) => Number(x) <= 255);
}
function getConnectionFence(ctx) {
  try {
    const conn = (typeof ctx.get === "function" ? ctx.get("connection") : null) || ctx.connection;
    if (conn && typeof conn === "object" && "requestRejection" in conn && typeof conn.requestRejection === "function") {
      return conn;
    }
    return null;
  } catch {
    return null;
  }
}
function selfRejection(req, ctx) {
  try {
    const headers = req?.headers || {};
    let hostUrl;
    try {
      hostUrl = new URL(`http://${String(headers.host || "")}`);
    } catch {
      return 403;
    }
    const fence = getConnectionFence(ctx);
    if (fence) {
      const delegated = fence.requestRejection(req);
      if (delegated) return delegated;
    } else if (!isLoopbackHostname(hostUrl.hostname)) {
      return 403;
    }
    const site = String(headers["sec-fetch-site"] || "").toLowerCase();
    if (site === "cross-site") return 403;
    const origin = headers.origin;
    if (typeof origin === "string" && origin && origin !== "null") {
      let originUrl;
      try {
        originUrl = new URL(origin);
      } catch {
        return 403;
      }
      if (originUrl.host.toLowerCase() !== hostUrl.host.toLowerCase()) return 403;
    }
    return null;
  } catch {
    return 403;
  }
}

// src/host/storage.ts
import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
function dshHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
}
function dataDir() {
  return path.join(dshHome(), "appearances");
}
function wallpapersDir() {
  return path.join(dataDir(), "wallpapers");
}
function settingsPath() {
  return path.join(dataDir(), "settings.json");
}
function wallpaperUrl(id) {
  return `${API_BASE}/wallpaper?id=${encodeURIComponent(id)}`;
}
function cloneDefaultSettings() {
  return {
    ...DEFAULT_SETTINGS,
    surfaces: { ...DEFAULT_SETTINGS.surfaces },
    sceneParams: {}
  };
}
function readSettings() {
  try {
    return sanitizeSettings(JSON.parse(fs.readFileSync(settingsPath(), "utf8")));
  } catch {
    return cloneDefaultSettings();
  }
}
function writeSettings(value) {
  fs.mkdirSync(dataDir(), { recursive: true });
  const target = settingsPath();
  const tmp = `${target}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, target);
}
function listWallpapers() {
  const dir = wallpapersDir();
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  const items = [];
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
    }
  }
  items.sort((a, b) => (b.mtimeMs ?? 0) - (a.mtimeMs ?? 0));
  return items;
}
async function saveWallpaperBytes(ext, bytes) {
  const dir = wallpapersDir();
  await fsp.mkdir(dir, { recursive: true });
  const id = crypto.randomBytes(8).toString("hex");
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
    url: wallpaperUrl(id)
  };
}
async function deleteWallpaperById(id) {
  const item = listWallpapers().find((w) => w.id === id);
  if (!item) return;
  await fsp.rm(path.join(wallpapersDir(), item.name), { force: true });
}
async function clearAllWallpapers() {
  const items = listWallpapers();
  await Promise.all(
    items.map((w) => fsp.rm(path.join(wallpapersDir(), w.name), { force: true }))
  );
}

// src/host/window-chrome.ts
import { createRequire } from "node:module";
var require2 = createRequire(import.meta.url);
function withWindows(fn) {
  try {
    const electron = require2("electron");
    const windows = electron?.BrowserWindow ? electron.BrowserWindow.getAllWindows() : [];
    for (const win of windows) {
      try {
        fn(win);
      } catch {
      }
    }
  } catch {
  }
}
function hideNativeMenuBar() {
  withWindows((win) => {
    if (typeof win.setAutoHideMenuBar === "function") win.setAutoHideMenuBar(true);
    if (typeof win.setMenuBarVisibility === "function") win.setMenuBarVisibility(false);
  });
}
function menuBarDebugInfo() {
  let out = { error: "no-window", platform: process.platform };
  withWindows((win) => {
    out = {
      platform: process.platform,
      menuBarVisible: typeof win.isMenuBarVisible === "function" ? win.isMenuBarVisible() : null,
      menuBarAutoHide: typeof win.isMenuBarAutoHide === "function" ? win.isMenuBarAutoHide() : null,
      bounds: typeof win.getBounds === "function" ? win.getBounds() : null,
      contentBounds: typeof win.getContentBounds === "function" ? win.getContentBounds() : null
    };
  });
  return out;
}

// src/host/routes.ts
function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": String(Buffer.byteLength(body))
  });
  res.end(body);
}
function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let done = false;
    req.on("data", (chunk) => {
      if (done) return;
      total += chunk.length;
      if (total > maxBytes) {
        done = true;
        reject(new Error("payload too large"));
        req.destroy?.();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (!done) resolve(Buffer.concat(chunks));
    });
    req.on("error", (err) => {
      if (!done) reject(err);
    });
  });
}
function resolveVendorDir() {
  const here = path2.dirname(fileURLToPath(import.meta.url));
  const direct = path2.join(here, "vendor", "code-codex");
  if (fs2.existsSync(direct)) return direct;
  return path2.resolve(here, "../../lib/vendor/code-codex");
}
function parseByteRange(rangeHeader, size) {
  if (!rangeHeader) return null;
  const m = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!m) return "invalid";
  const rawStart = m[1];
  const rawEnd = m[2];
  if (rawStart === "" && rawEnd === "") return "invalid";
  let start;
  let end;
  if (rawStart === "") {
    const suffixLen = Number(rawEnd);
    if (!Number.isFinite(suffixLen) || suffixLen <= 0) return "invalid";
    start = Math.max(0, size - suffixLen);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? size - 1 : Math.min(size - 1, Number(rawEnd));
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= size) {
      return "invalid";
    }
  }
  return { start, end };
}
async function sendFileRangeAware(req, res, filePath, mime) {
  const st = await fsp2.stat(filePath);
  const size = st.size;
  const range = parseByteRange(req.headers?.range, size);
  if (range === "invalid") {
    res.writeHead(416, { "Content-Range": `bytes */${size}`, "Content-Length": "0" });
    res.end();
    return;
  }
  const canPipe = typeof res.write === "function" && typeof res.on === "function";
  if (range) {
    const len = range.end - range.start + 1;
    res.writeHead(206, {
      "Content-Type": mime,
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      "Content-Length": String(len),
      "Cache-Control": "no-store"
    });
    if (canPipe) {
      fs2.createReadStream(filePath, { start: range.start, end: range.end }).pipe(res);
    } else {
      const fh = await fsp2.open(filePath, "r");
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
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Content-Length": String(size),
    "Cache-Control": "no-store"
  });
  if (canPipe) {
    fs2.createReadStream(filePath).pipe(res);
  } else {
    res.end(await fsp2.readFile(filePath));
  }
}
function registerAppearanceRoutes(ctx) {
  const disposers = [];
  const vendorDir = resolveVendorDir();
  function registerRoute(route) {
    const inner = route.handler;
    disposers.push(
      ctx.webServer.register({
        kind: route.kind,
        path: route.path,
        handler: async (req, res) => {
          const code = selfRejection(req, ctx);
          if (code) {
            sendJson(res, code, { ok: false, error: "rejected by trust fence" });
            return;
          }
          return inner(req, res);
        }
      })
    );
  }
  const serveVendorFile = (file, contentType) => async (_req, res) => {
    try {
      const bytes = await fsp2.readFile(path2.join(vendorDir, file));
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "Content-Length": String(bytes.length)
      });
      res.end(bytes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(res, 404, { ok: false, error: msg.slice(0, 120) });
    }
  };
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/wininfo.json`,
    handler: (_req, res) => sendJson(res, 200, { ok: true, win: menuBarDebugInfo() })
  });
  for (const sceneId of SCENE_IDS) {
    registerRoute({
      kind: "exact",
      path: `${API_BASE}/vendor/${sceneId}.js`,
      handler: serveVendorFile(`${sceneId}.js`, "text/javascript; charset=utf-8")
    });
  }
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/vendor-galleries.json`,
    handler: serveVendorFile("galleries.json", "application/json; charset=utf-8")
  });
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/vendor-shallow-ocean-thumbs.json`,
    handler: serveVendorFile("shallow-ocean-thumbnails.json", "application/json; charset=utf-8")
  });
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/vendor-media`,
    handler: async (req, res) => {
      try {
        const u = new URL(req.url || "/", "http://localhost");
        const name = u.searchParams.get("file") || "";
        const match = MEDIA_FILE_RE.exec(name);
        if (!match) throw new Error("bad media file");
        const bytes = await fsp2.readFile(path2.join(vendorDir, match[1], "media", name));
        res.writeHead(200, {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
          "Content-Length": String(bytes.length)
        });
        res.end(bytes);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 404, { ok: false, error: msg.slice(0, 120) });
      }
    }
  });
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/scene-schemas.json`,
    handler: serveVendorFile("scene-schemas.json", "application/json; charset=utf-8")
  });
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/state.json`,
    handler: (_req, res) => {
      const settings = readSettings();
      const wallpapers = listWallpapers();
      sendJson(res, 200, {
        ok: true,
        settings,
        defaults: DEFAULT_SETTINGS,
        scenes: SCENE_IDS,
        wallpapers
      });
    }
  });
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/state-save.json`,
    handler: async (req, res) => {
      try {
        const raw = await readBody(req, 64 * 1024);
        const parsed = JSON.parse(raw.toString("utf8"));
        const settings = sanitizeSettings(parsed?.settings ?? parsed);
        settings.savedAt = Date.now();
        writeSettings(settings);
        sendJson(res, 200, { ok: true, settings });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 400, { ok: false, error: msg.slice(0, 200) });
      }
    }
  });
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/wallpaper-upload`,
    handler: async (req, res) => {
      try {
        if (req.method !== "POST") throw new Error("method not allowed");
        const u = new URL(req.url || "/", "http://localhost");
        const rawName = String(u.searchParams.get("name") || "");
        const ext = path2.extname(rawName).toLowerCase();
        if (!WALLPAPER_MIMES[ext]) throw new Error(`unsupported file type: ${ext || "(none)"}`);
        const bytes = await readBody(req, WALLPAPER_MAX_BYTES);
        if (!bytes.length) throw new Error("empty body");
        const item = await saveWallpaperBytes(ext, bytes);
        sendJson(res, 200, {
          ok: true,
          wallpaper: item,
          wallpapers: listWallpapers()
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 400, { ok: false, error: msg.slice(0, 200) });
      }
    }
  });
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/wallpaper-delete.json`,
    handler: async (req, res) => {
      try {
        const raw = await readBody(req, 4 * 1024);
        const parsed = JSON.parse(raw.toString("utf8"));
        const id = String(parsed?.id ?? "");
        if (!/^[\w-]+$/.test(id)) throw new Error("bad wallpaper id");
        await deleteWallpaperById(id);
        sendJson(res, 200, { ok: true, wallpapers: listWallpapers() });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 400, { ok: false, error: msg.slice(0, 200) });
      }
    }
  });
  registerRoute({
    kind: "exact",
    path: `${API_BASE}/wallpaper-clear.json`,
    handler: async (_req, res) => {
      try {
        await clearAllWallpapers();
        sendJson(res, 200, { ok: true, wallpapers: [] });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, 400, { ok: false, error: msg.slice(0, 200) });
      }
    }
  });
  const serveWallpaper = async (req, res) => {
    try {
      const u = new URL(req.url || "/", "http://localhost");
      const id = String(u.searchParams.get("id") || "");
      if (!/^[\w-]+$/.test(id)) throw new Error("bad wallpaper id");
      const item = listWallpapers().find((w) => w.id === id);
      if (!item) throw new Error("wallpaper not found");
      await sendFileRangeAware(req, res, path2.join(wallpapersDir(), item.name), item.mime);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(res, 404, { ok: false, error: msg.slice(0, 200) });
    }
  };
  registerRoute({ kind: "exact", path: `${API_BASE}/wallpaper`, handler: serveWallpaper });
  registerRoute({ kind: "exact", path: `${API_BASE}/wallpaper.png`, handler: serveWallpaper });
  return () => {
    for (const d of disposers) {
      try {
        d();
      } catch {
      }
    }
  };
}

// src/host/index.ts
var index_default = {
  name: PLUGIN_ID,
  apply(root) {
    hideNativeMenuBar();
    root.inject(["webServer"], (ctx) => {
      const dispose = registerAppearanceRoutes(ctx);
      root.effect(() => dispose, `${PLUGIN_ID}: routes`);
    });
  }
};
export {
  DEFAULT_SETTINGS,
  index_default as default,
  sanitizeSettings,
  sanitizeSurfaces
};
