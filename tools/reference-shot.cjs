// 参考台截图：无头 Edge 跑 harness.html?scene=<id>，等开场结束后整页截图
// usage: node tools/reference-shot.cjs <sceneId> [out.png] [settleMs]
// 说明: --force-device-scale-factor=1.5 对齐原版应用窗口 DPR，
//      截图用 clip scale=1 输出 CSS 像素尺寸（与 docs/reference/scene-<id>-canvas.png 同尺寸）
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const SCENE = process.argv[2] || 'milky-way';
const OUT = process.argv[3] || `docs/reference/harness-${SCENE}.png`;
const SETTLE = Number(process.argv[4] || 10000);
const PAUSED = process.argv.includes('--paused');
const W = 1280, H = 816, DPR = 1.5;
const PORT = 9333; // Edge CDP
const HTTP_PORT = 9339; // 静态资源服务
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// 内建静态服务器（repo 根）：file:// 的 fetch/IndexedDB 受限，localhost 是安全上下文
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  const file = path.join(__dirname, '..', rel === '' ? 'tools/reference-harness/harness.html' : rel);
  if (!file.startsWith(path.join(__dirname, '..'))) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

function getJSON(url) {
  return new Promise((res, rej) => {
    http.get(url, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej);
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
  await new Promise((res) => server.listen(HTTP_PORT, '127.0.0.1', res));
  const HTML = `http://127.0.0.1:${HTTP_PORT}/tools/reference-harness/harness.html?scene=${SCENE}${PAUSED ? '&paused=1' : ''}`;
  const profile = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ref-harness-'));
  const edge = spawn(EDGE, [
    '--headless=new', '--remote-debugging-port=' + PORT,
    `--force-device-scale-factor=${DPR}`, '--hide-scrollbars', '--no-first-run',
    `--user-data-dir=${profile}`, '--window-size=' + Math.round(W) + ',' + Math.round(H), 'about:blank',
  ], { stdio: 'ignore' });
  try {
    let target = null;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try {
        const list = await getJSON(`http://127.0.0.1:${PORT}/json/list`);
        target = list.find((t) => t.type === 'page');
        if (target) break;
      } catch (e) {}
    }
    if (!target) throw new Error('edge CDP not reachable');

    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/devtools/page/${target.id}`);
    let seq = 0;
    const pending = new Map();
    const send = (method, params) => new Promise((res, rej) => {
      const m = ++seq;
      pending.set(m, { res, rej });
      ws.send(JSON.stringify({ id: m, method, params }));
    });
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id);
        pending.delete(m.id);
        m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
      }
    };
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    await send('Page.enable', {});
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: false });
    await send('Page.navigate', { url: HTML });

    // 等 startup 完成 + 开场动画结束
    const deadline = Date.now() + 30000;
    let st = null;
    for (;;) {
      await sleep(500);
      const r = await send('Runtime.evaluate', {
        expression: `(()=>{const l=document.getElementById('layer');const c=l&&l.querySelector('canvas');const hz=l&&l.querySelector('.code-codex-glow-horizon-horizon');const err=(document.getElementById('err')||{}).textContent||'';return JSON.stringify({started:!!window.__started,canvas:!!c,horizon:!!hz,err})})()`,
        returnByValue: true,
      });
      st = JSON.parse(r.result.value);
      if (st.started && (st.canvas || st.horizon)) break;
      if (st.err) throw new Error('harness error: ' + st.err);
      if (Date.now() > deadline) throw new Error('harness start timeout: ' + JSON.stringify(st));
    }
    await sleep(SETTLE);
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: W, height: H, scale: 1 },
    });
    fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
    console.log('saved', OUT, `(${SCENE}, settle ${SETTLE}ms)`);
    try { ws.close(); } catch (e) {}
  } finally {
    try { edge.kill(); } catch (e) {}
    try { server.close(); } catch (e) {}
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }
  process.exit(0); // http server 的句柄会挂住进程，显式退出
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
