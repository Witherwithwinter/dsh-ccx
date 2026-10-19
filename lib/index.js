// ============================================================================
// dsh-awesome-appearances —— 宿主半侧（cordis 插件，Node 侧）
//
// 职责只有两件事：
//   ① 外观设置（settings.json）的读写与校验 —— 浏览器半侧经 /dsh-appearances/state.json
//      拉取/保存；设置落在 $DSH_HOME/appearances/，桌面端与 Web 端共用同一份。
//   ② 壁纸库（wallpapers/）的上传、列表、按 id 取图与删除。
//
// 不注入 index（浏览器半侧走 DSH 客户端模块系统 /plugins/<id>/client.js 正规通道，
// 参见 package.json 的 dsh.client 声明），不依赖任何 @deepseek-ai/* 包：
// webServer 服务通过 inject 等待，connection 服务用 ctx.get() 容错降级。
// 信任栅栏沿用 dsh-whale-widget-bowl 的三层方案（自校验 → 委托宿主 → fail-closed）。
// ============================================================================

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const PLUGIN_NAME = 'dsh-awesome-appearances'

// —— 存储位置：$DSH_HOME 优先（桌面客户端的发布副本只认它），~/.dsh 兜底 ——
function dshHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
}
function dataDir() {
  return path.join(dshHome(), 'appearances')
}
function wallpapersDir() {
  return path.join(dataDir(), 'wallpapers')
}
function settingsPath() {
  return path.join(dataDir(), 'settings.json')
}

// —— 设置 schema：客户端半侧 (lib/client.js) 与此处的校验保持同一份默认值 ——
// savedAt 是宿主写入的版本戳：客户端轮询它来发现"另一端改了设置"（双开同步）。
// v3：surfaceOpacity/dim 等旧的整面透明度改为 surfaces 分区蒙版（对齐原仓库
// surface-opacity：每个区域一个 0-100 的不透明度，0=完全透明）。
// v5：蒙版默认对齐原版两档（主区/输入 .58、侧栏 .66、标题栏透明）、dim 默认关
// （原版无压暗层）、去掉死字段 quality（质量在每场景参数里）。
export const DEFAULT_SETTINGS = Object.freeze({
  version: 5,
  enabled: true,
  // 'scene' = 原版动态场景；'wallpaper' = 用户壁纸/视频；'off' = 仅透明化不画背景
  mode: 'scene',
  scene: 'milky-way',
  wallpaperId: null,
  wallpaperFit: 'cover', // cover | contain | tile
  wallpaperPosition: 'center', // center | top | bottom | left | right
  // UI 表面分区蒙版（0–100；base 色：主区/输入 rgb(11,12,15)，侧栏 rgb(16,17,20)，
  // 与原版 inject.ts 的 --code-codex-particle-ui-surface[-strong] 同值）
  surfaces: {
    enabled: true,
    sidebar: 66,
    conversation: 58,
    composer: 58,
    header: 0,
    right: 66,
  },
  // 每场景参数覆盖（键=场景 id，值=该场景 schema 字段的稀疏增量；面板"应用"写入）
  sceneParams: {},
  dim: 0, // 背景压暗 0–0.8（原版无此层，默认关）
  blur: 0, // 背景模糊 0–20px
  savedAt: 0,
})
const CLAMPS = {
  dim: [0, 0.8],
  blur: [0, 20],
}
// 速度/饱和度/质量已随 v0.5 移入每场景参数（sceneParams，原版抽屉字段）
// 原仓库 code-codex 首方场景包（lib/vendor/code-codex/，MIT，含第三方声明）
const SCENE_IDS = [
  'milky-way', 'glow-horizon', 'mountain', 'heavenly-cloud',
  'aurora-ionosphere', 'black-hole', 'cloud-train',
  'particle-image', 'pixel-sculpt', 'blinking-squares',
]
// 画廊媒体白名单：particle-image / pixel-sculpt 的默认图片（文件名含内容哈希）
const MEDIA_FILE_RE = /^CodeCodex-background-(particle-image|pixel-sculpt)-(image|thumbnail)-[0-9a-f]{16}\.png$/
const SURFACE_REGIONS = ['sidebar', 'conversation', 'composer', 'header', 'right']

function sanitizeSurfaces(input) {
  const src = input && typeof input === 'object' ? input : {}
  const out = { ...DEFAULT_SETTINGS.surfaces }
  out.enabled = src.enabled === true
  for (const key of SURFACE_REGIONS) {
    const n = Number(src[key])
    if (Number.isFinite(n)) out[key] = Math.min(100, Math.max(0, Math.round(n)))
  }
  return out
}

function sanitizeSettings(input) {
  const src = input && typeof input === 'object' ? input : {}
  const out = { ...DEFAULT_SETTINGS }
  if (typeof src.enabled === 'boolean') out.enabled = src.enabled
  if (src.mode === 'scene' || src.mode === 'wallpaper' || src.mode === 'off') out.mode = src.mode
  if (typeof src.scene === 'string' && SCENE_IDS.includes(src.scene)) out.scene = src.scene
  if (typeof src.wallpaperId === 'string' && /^[\w-]+$/.test(src.wallpaperId)) out.wallpaperId = src.wallpaperId
  else if (src.wallpaperId === null) out.wallpaperId = null
  if (src.wallpaperFit === 'cover' || src.wallpaperFit === 'contain' || src.wallpaperFit === 'tile') out.wallpaperFit = src.wallpaperFit
  if (['center', 'top', 'bottom', 'left', 'right'].includes(src.wallpaperPosition)) out.wallpaperPosition = src.wallpaperPosition
  // v4 遗留死字段 quality 不再接受写入（逐场景质量在 sceneParams/store）
  for (const key of Object.keys(CLAMPS)) {
    const n = Number(src[key])
    if (Number.isFinite(n)) out[key] = Math.min(CLAMPS[key][1], Math.max(CLAMPS[key][0], n))
  }
  // v1/v2 老设置的 surfaceOpacity 折算为各区域统一蒙版（composer +20 保输入区可读）
  let surfacesSrc = src.surfaces
  if (!surfacesSrc && Number.isFinite(Number(src.surfaceOpacity))) {
    const legacy = Math.round(Math.min(1, Math.max(0.05, Number(src.surfaceOpacity))) * 100)
    surfacesSrc = { enabled: true, sidebar: legacy, conversation: legacy, composer: Math.min(100, legacy + 20), header: legacy, right: legacy }
  }
  let paramsSrc = src.sceneParams && typeof src.sceneParams === 'object' ? src.sceneParams : {}
  const paramsOut = {}
  for (const key of Object.keys(paramsSrc)) {
    if (!/^[a-z-]+$/.test(key)) continue
    const v = paramsSrc[key]
    if (v && typeof v === 'object' && !Array.isArray(v)) paramsOut[key] = v
  }
  out.sceneParams = paramsOut
  out.surfaces = sanitizeSurfaces(surfacesSrc)
  if (Number.isFinite(Number(src.savedAt))) out.savedAt = Number(src.savedAt)
  return out
}

function readSettings() {
  try {
    return sanitizeSettings(JSON.parse(fs.readFileSync(settingsPath(), 'utf8')))
  } catch (err) {
    return { ...DEFAULT_SETTINGS }
  }
}

// 原子写（tmp + rename），避免半截 JSON 让客户端读到坏状态
function writeSettings(value) {
  fs.mkdirSync(dataDir(), { recursive: true })
  const tmp = settingsPath() + '.tmp-' + process.pid
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2))
  fs.renameSync(tmp, settingsPath())
}

// —— 壁纸文件管理 ——
const WALLPAPER_MIMES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
}
const WALLPAPER_MAX_BYTES = 200 * 1024 * 1024 // 本机本地路由，放宽到 200MB（视频）

function listWallpapers() {
  const dir = wallpapersDir()
  let entries = []
  try {
    entries = fs.readdirSync(dir)
  } catch (err) {
    return []
  }
  const items = []
  for (const name of entries) {
    const ext = path.extname(name).toLowerCase()
    const mime = WALLPAPER_MIMES[ext]
    if (!mime) continue
    const id = name.slice(0, name.length - ext.length)
    try {
      const st = fs.statSync(path.join(dir, name))
      items.push({ id, name: name, mime, size: st.size, mtimeMs: st.mtimeMs })
    } catch (err) {}
  }
  items.sort((a, b) => b.mtimeMs - a.mtimeMs)
  return items
}

function wallpaperUrl(id) {
  return '/dsh-appearances/wallpaper?id=' + encodeURIComponent(id)
}

function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let total = 0
    let done = false
    req.on('data', (chunk) => {
      if (done) return
      total += chunk.length
      if (total > maxBytes) {
        done = true
        reject(new Error('payload too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (!done) resolve(Buffer.concat(chunks))
    })
    req.on('error', (err) => {
      if (!done) reject(err)
    })
  })
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': String(Buffer.byteLength(body)),
  })
  res.end(body)
}

// —— 环回主机判定（照抄 whale 的逐段校验，防 127.0.0.1.evil.com 相似域名）——
function isLoopbackHostname(hn) {
  const h = String(hn || '').toLowerCase().replace(/^\[/, '').replace(/\]$/, '')
  if (!h) return false
  if (h === 'localhost' || h.endsWith('.localhost')) return true
  if (h === '::1') return true
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h)
  if (!m) return false
  if (Number(m[1]) !== 127) return false
  return [m[2], m[3], m[4]].every((x) => Number(x) <= 255)
}

export default {
  name: PLUGIN_NAME,

  apply(root) {
    root.inject(['webServer'], (ctx) => {
      const disposers = []

      // —— 信任栅栏：宿主栅栏可用则委托；否则自校验（fail-closed）——
      function connectionFence() {
        try {
          const conn = ctx.get('connection') || ctx.connection
          return conn && typeof conn.requestRejection === 'function' ? conn : null
        } catch (err) {
          return null
        }
      }
      function selfRejection(req) {
        try {
          const headers = (req && req.headers) || {}
          let hostUrl = null
          try {
            hostUrl = new URL('http://' + String(headers.host || ''))
          } catch (err) {
            return 403
          }
          // 宿主栅栏在场时把非环回 Host 交给它判（它知道 --trusted-host 声明），
          // 缺席才回落到"只认环回"。
          if (!isLoopbackHostname(hostUrl.hostname) && !connectionFence()) return 403
          const site = String(headers['sec-fetch-site'] || '').toLowerCase()
          if (site === 'cross-site') return 403
          const origin = headers.origin
          if (typeof origin === 'string' && origin && origin !== 'null') {
            let originUrl = null
            try {
              originUrl = new URL(origin)
            } catch (err) {
              return 403
            }
            if (originUrl.host.toLowerCase() !== hostUrl.host.toLowerCase()) return 403
          }
          return null
        } catch (err) {
          return 403
        }
      }
      function registerRoute(route) {
        const inner = route && route.handler
        const wrapped = Object.assign({}, route, {
          handler: async (req, res) => {
            const code = selfRejection(req)
            if (code) {
              sendJson(res, code, { ok: false, error: 'rejected by trust fence' })
              return
            }
            return inner(req, res)
          },
        })
        return ctx.webServer.register(wrapped)
      }

      // webserver 的路由表不区分 HTTP 方法，且"同一张表内的重复路径会抛错"
      // （host-webserver README）—— 所以读写用不同路径，POST 一律落 *.save.json。
      // ---- GET /dsh-appearances/vendor/<id>.js：原仓库 code-codex 场景渲染器 ----
      // （webserver 的 prefix 匹配行为不可靠，直接给每个场景注册 exact 路由）
      const vendorDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'vendor', 'code-codex')
      const serveVendor = (file) => (req, res) => {
        try {
          const bytes = fs.readFileSync(path.join(vendorDir, file))
          res.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8',
            'Cache-Control': 'no-store',
            'Content-Length': String(bytes.length),
          })
          res.end(bytes)
        } catch (err) {
          sendJson(res, 404, { ok: false, error: String((err && err.message) || err).slice(0, 120) })
        }
      }
      for (const sceneId of SCENE_IDS) {
        disposers.push(registerRoute({
          kind: 'exact',
          path: `/dsh-appearances/vendor/${sceneId}.js`,
          handler: serveVendor(`${sceneId}.js`),
        }))
      }

      // ---- GET /dsh-appearances/vendor-galleries.json：画廊索引（sha256/文件名/计数）----
      disposers.push(registerRoute({
        kind: 'exact',
        path: '/dsh-appearances/vendor-galleries.json',
        handler: serveVendor('galleries.json'),
      }))

      // ---- GET /dsh-appearances/vendor-media?file=<白名单文件名>：画廊图片字节 ----
      disposers.push(registerRoute({
        kind: 'exact',
        path: '/dsh-appearances/vendor-media',
        handler: (req, res) => {
          try {
            const u = new URL(req.url || '/', 'http://localhost')
            const name = u.searchParams.get('file') || ''
            const match = MEDIA_FILE_RE.exec(name)
            if (!match) throw new Error('bad media file')
            const bytes = fs.readFileSync(path.join(vendorDir, match[1], 'media', name))
            res.writeHead(200, {
              'Content-Type': 'image/png',
              'Cache-Control': 'no-store',
              'Content-Length': String(bytes.length),
            })
            res.end(bytes)
          } catch (err) {
            sendJson(res, 404, { ok: false, error: String((err && err.message) || err).slice(0, 120) })
          }
        },
      }))

      // ---- GET /dsh-appearances/scene-schemas.json：每场景设置 schema（原版抽屉字段）----
      disposers.push(registerRoute({
        kind: 'exact',
        path: '/dsh-appearances/scene-schemas.json',
        handler: serveVendor('scene-schemas.json'),
      }))

      // ---- GET /dsh-appearances/state.json：当前外观设置 + 壁纸清单 ----
      disposers.push(registerRoute({
        kind: 'exact',
        path: '/dsh-appearances/state.json',
        handler: (req, res) => {
          const settings = readSettings()
          const wallpapers = listWallpapers().map((w) => ({ ...w, url: wallpaperUrl(w.id) }))
          sendJson(res, 200, {
            ok: true,
            settings,
            defaults: DEFAULT_SETTINGS,
            scenes: SCENE_IDS,
            wallpapers,
          })
        },
      }))

      // ---- POST /dsh-appearances/state-save.json：保存设置 ----
      disposers.push(registerRoute({
        kind: 'exact',
        path: '/dsh-appearances/state-save.json',
        handler: async (req, res) => {
          try {
            const raw = await readBody(req, 64 * 1024)
            const parsed = JSON.parse(raw.toString('utf8'))
            const settings = sanitizeSettings(parsed && parsed.settings ? parsed.settings : parsed)
            settings.savedAt = Date.now()
            writeSettings(settings)
            sendJson(res, 200, { ok: true, settings })
          } catch (err) {
            sendJson(res, 400, { ok: false, error: String((err && err.message) || err).slice(0, 200) })
          }
        },
      }))

      // ---- POST /dsh-appearances/wallpaper-upload?name=<文件名>：上传壁纸（原始字节）----
      disposers.push(registerRoute({
        kind: 'exact',
        path: '/dsh-appearances/wallpaper-upload',
        handler: async (req, res) => {
          try {
            if (req.method !== 'POST') throw new Error('method not allowed')
            const u = new URL(req.url || '/', 'http://localhost')
            const rawName = String(u.searchParams.get('name') || '')
            const ext = path.extname(rawName).toLowerCase()
            if (!WALLPAPER_MIMES[ext]) throw new Error('unsupported file type: ' + (ext || '(none)'))
            const bytes = await readBody(req, WALLPAPER_MAX_BYTES)
            if (!bytes.length) throw new Error('empty body')
            fs.mkdirSync(wallpapersDir(), { recursive: true })
            const id = crypto.randomBytes(8).toString('hex')
            const file = path.join(wallpapersDir(), id + ext)
            const tmp = file + '.tmp-' + process.pid
            fs.writeFileSync(tmp, bytes)
            fs.renameSync(tmp, file)
            const item = { id, name: id + ext, mime: WALLPAPER_MIMES[ext], size: bytes.length, url: wallpaperUrl(id) }
            sendJson(res, 200, { ok: true, wallpaper: item, wallpapers: listWallpapers().map((w) => ({ ...w, url: wallpaperUrl(w.id) })) })
          } catch (err) {
            sendJson(res, 400, { ok: false, error: String((err && err.message) || err).slice(0, 200) })
          }
        },
      }))

      // ---- POST /dsh-appearances/wallpaper-delete.json {id}：删除壁纸 ----
      disposers.push(registerRoute({
        kind: 'exact',
        path: '/dsh-appearances/wallpaper-delete.json',
        handler: async (req, res) => {
          try {
            const raw = await readBody(req, 4 * 1024)
            const parsed = JSON.parse(raw.toString('utf8'))
            const id = String((parsed && parsed.id) || '')
            if (!/^[\w-]+$/.test(id)) throw new Error('bad wallpaper id')
            const item = listWallpapers().find((w) => w.id === id)
            if (item) fs.rmSync(path.join(wallpapersDir(), item.name), { force: true })
            sendJson(res, 200, { ok: true, wallpapers: listWallpapers().map((w) => ({ ...w, url: wallpaperUrl(w.id) })) })
          } catch (err) {
            sendJson(res, 400, { ok: false, error: String((err && err.message) || err).slice(0, 200) })
          }
        },
      }))

      // ---- GET /dsh-appearances/wallpaper?id=<id>：取壁纸字节 ----
      disposers.push(registerRoute({
        kind: 'exact',
        path: '/dsh-appearances/wallpaper.png',
        handler: (req, res) => {
          try {
            const u = new URL(req.url || '/', 'http://localhost')
            const id = String(u.searchParams.get('id') || '')
            if (!/^[\w-]+$/.test(id)) throw new Error('bad wallpaper id')
            const item = listWallpapers().find((w) => w.id === id)
            if (!item) throw new Error('wallpaper not found')
            const bytes = fs.readFileSync(path.join(wallpapersDir(), item.name))
            res.writeHead(200, {
              'Content-Type': item.mime,
              'Cache-Control': 'no-store',
              'Content-Length': String(bytes.length),
            })
            res.end(bytes)
          } catch (err) {
            sendJson(res, 404, { ok: false, error: String((err && err.message) || err).slice(0, 200) })
          }
        },
      }))

      root.effect(() => () => {
        for (const d of disposers) {
          try { d() } catch (err) {}
        }
      }, PLUGIN_NAME + ': routes')
    })
  },
}
