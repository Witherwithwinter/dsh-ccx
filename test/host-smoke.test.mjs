// 宿主半侧冒烟测试：mock cordis root + webServer，走一遍全部路由。
// 运行：node test/host-smoke.test.mjs
import { createServer } from 'node:http'
import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import plugin, { DEFAULT_SETTINGS } from '../lib/index.js'

// 把 DSH_HOME 指到临时目录，测试不碰真实 ~/.dsh
const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-ap-test-'))
process.env.DSH_HOME = tmpHome

const routes = new Map()
const webServer = {
  register(route) {
    routes.set((route.kind || '') + ':' + route.path, route)
    return () => routes.delete((route.kind || '') + ':' + route.path)
  },
}
const root = {
  inject(services, cb) {
    assert.deepStrictEqual(services, ['webServer'])
    cb({ webServer, get() { return null } })
  },
  effect(_fn, _label) {},
}

plugin.apply(root)
assert.strictEqual(routes.size, 18, 'should register 6 routes: ' + [...routes.keys()].join(', '))

// —— 模拟请求工具 ——
function mockReq(url, method, body) {
  const chunks = body == null ? [] : [Buffer.from(body)]
  return {
    url,
    method,
    headers: { host: '127.0.0.1:9', 'sec-fetch-site': 'same-origin' },
    on(ev, cb) {
      if (ev === 'data' && chunks.length) cb(chunks[0])
      if (ev === 'end') cb()
    },
  }
}
function mockRes() {
  let resolveRes
  const done = new Promise((resolve) => { resolveRes = resolve })
  const res = {
    code: 0, headers: {}, body: '',
    writeHead(code, headers) { this.code = code; this.headers = headers },
    end(body) { this.body = body || ''; resolveRes(this) },
  }
  done.res = res
  return done
}
async function call(pathname, method, body) {
  const pathOnly = pathname.split('?')[0]
  const route = routes.get('exact:' + pathOnly)
  assert(route, 'route missing: ' + pathname)
  const req = mockReq(pathname, method, body)
  const done = mockRes()
  await route.handler(req, done.res)
  const res = await done
  return { status: res.code, json: (() => { try { return JSON.parse(res.body) } catch { return null } })(), headers: res.headers, body: res.body }
}

// 1) 初始状态 = 默认值（v3：分区蒙版）
let r = await call('/dsh-appearances/state.json', 'GET')
assert.strictEqual(r.status, 200)
assert.strictEqual(r.json.ok, true)
assert.deepStrictEqual(r.json.settings, DEFAULT_SETTINGS)
assert.strictEqual(r.json.scenes.length, 10, "10 code-codex scenes")
assert.strictEqual(DEFAULT_SETTINGS.scene, 'milky-way')
assert.strictEqual(DEFAULT_SETTINGS.surfaces.composer, 86)
assert.deepStrictEqual(DEFAULT_SETTINGS.sceneParams, {})

// 2) 保存：surfaces 夹取 + savedAt 写入 + 非法场景回退
r = await call('/dsh-appearances/state-save.json', 'POST', JSON.stringify({
  settings: { enabled: false, mode: 'wallpaper', scene: 'nope', surfaces: { enabled: true, sidebar: 200, composer: -5, conversation: 40 }, sceneParams: { 'milky-way': { speed: 0.9, amplitude: 2 } }, dim: 2 },
}))
assert.strictEqual(r.json.ok, true, 'save should succeed')
assert.strictEqual(r.json.settings.enabled, false)
assert.strictEqual(r.json.settings.mode, 'wallpaper')
assert.strictEqual(r.json.settings.scene, DEFAULT_SETTINGS.scene, 'illegal scene falls back')
assert.strictEqual(r.json.settings.surfaces.sidebar, 100, 'clamped to max')
assert.strictEqual(r.json.settings.surfaces.composer, 0, 'clamped to min')
assert.strictEqual(r.json.settings.surfaces.conversation, 40)
assert.strictEqual(r.json.settings.surfaces.header, DEFAULT_SETTINGS.surfaces.header, 'untouched region keeps default')
assert.strictEqual(r.json.settings.dim, 0.8)
assert.strictEqual(r.json.settings.sceneParams['milky-way'].speed, 0.9)
assert.ok(r.json.settings.savedAt > 0, 'savedAt stamped')

// 3) v1/v2 老设置迁移：surfaceOpacity 折算进 surfaces
r = await call('/dsh-appearances/state-save.json', 'POST', JSON.stringify({
  settings: { enabled: true, mode: 'scene', scene: 'milky-way', surfaceOpacity: 0.5 },
}))
assert.strictEqual(r.json.settings.surfaces.sidebar, 50, 'legacy surfaceOpacity migrates')
assert.strictEqual(r.json.settings.surfaces.composer, 70, 'legacy composer = +20')

// 4) 壁纸：上传 → 列表 → 取字节 → 删除
const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4])
r = await call('/dsh-appearances/wallpaper-upload?name=wall.PNG', 'POST', pngBytes)
assert.strictEqual(r.json.ok, true, 'upload ok')
const wp = r.json.wallpaper
assert.ok(/^[\w-]+$/.test(wp.id))
assert.strictEqual(wp.mime, 'image/png')
assert.strictEqual(r.json.wallpapers.length, 1)

r = await call('/dsh-appearances/wallpaper.png?id=' + wp.id, 'GET')
assert.strictEqual(r.status, 200)
assert.strictEqual(r.headers['Content-Type'], 'image/png')

r = await call('/dsh-appearances/wallpaper-delete.json', 'POST', JSON.stringify({ id: wp.id }))
assert.strictEqual(r.json.ok, true)
assert.strictEqual(r.json.wallpapers.length, 0)

// 5) vendor 场景路由：真文件 200，未知场景 404（exact 路由天然免穿越）
r = await call('/dsh-appearances/vendor/milky-way.js', 'GET')
assert.strictEqual(r.status, 200, 'vendor scene served')
assert.ok(r.body.includes('code-codex'), 'vendor body looks right')
r = await call('/dsh-appearances/vendor/black-hole.js', 'GET')
assert.strictEqual(r.status, 200, 'black-hole served')
r = await call('/dsh-appearances/vendor/particle-image.js', 'GET')
assert.strictEqual(r.status, 200, 'particle-image served')
r = await call('/dsh-appearances/scene-schemas.json', 'GET')
assert.strictEqual(r.status, 200, 'scene schemas served')
assert.ok(JSON.parse(r.body)['milky-way'].fields.length >= 10, 'milky-way schema fields')
r = await call('/dsh-appearances/vendor-galleries.json', 'GET')
assert.strictEqual(r.status, 200, 'gallery index served')
assert.ok(JSON.parse(r.body)['particle-image'].images.length === 6, 'gallery index has 6 images')
r = await call('/dsh-appearances/vendor-media?file=CodeCodex-background-particle-image-image-39894de0da1fa952.png', 'GET')
assert.strictEqual(r.status, 200, 'media served')
assert.strictEqual(r.headers['Content-Type'], 'image/png')
r = await call('/dsh-appearances/vendor-media?file=evil.png', 'GET')
assert.strictEqual(r.status, 404, 'non-allowlisted media 404')

// 6) 非法输入全部 4xx，不落盘
r = await call('/dsh-appearances/wallpaper-upload?name=evil.html', 'POST', Buffer.from('<x/>'))
assert.strictEqual(r.status, 400)
r = await call('/dsh-appearances/wallpaper-delete.json', 'POST', JSON.stringify({ id: '../etc' }))
assert.strictEqual(r.status, 400)
r = await call('/dsh-appearances/state-save.json', 'POST', '{broken')
assert.strictEqual(r.status, 400)

// 7) 信任栅栏：跨站 / 伪装主机 → 403
const fence = routes.get('exact:/dsh-appearances/state.json')
const crossReq = mockReq('/dsh-appearances/state.json', 'GET')
crossReq.headers['sec-fetch-site'] = 'cross-site'
let resCode = 0
const resStub = { writeHead(c) { resCode = c }, end() {}, headers: {} }
await fence.handler(crossReq, resStub)
assert.strictEqual(resCode, 403, 'cross-site rejected')
const evilReq = mockReq('/dsh-appearances/state.json', 'GET')
evilReq.headers.host = '127.0.0.1.evil.com'
evilReq.headers.origin = 'http://127.0.0.1.evil.com'
resCode = 0
await fence.handler(evilReq, resStub)
assert.strictEqual(resCode, 403, 'spoofed host rejected (no connection fence)')

// 8) 设置文件真的落在 $DSH_HOME/appearances/
assert.ok(fs.existsSync(path.join(tmpHome, 'appearances', 'settings.json')))

console.log('host-smoke: all assertions passed ✓')
