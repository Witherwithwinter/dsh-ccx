// 原版基准采集：在 Code-Codex 注入的 ChatGPT 桌面版里逐场景启用→截图→禁用
// usage: node tools/codex-reference-sweep.js <port> <targetId> [--only <sceneId>] [--out docs/reference]
// 产物: scene-<id>.png(全窗) scene-<id>-canvas.png(背景层裁剪) scene-<id>-panel.png(设置面板) scene-<id>-motion-<n>.png
const port = process.argv[2];
const targetId = process.argv[3];
const argv = process.argv.slice(4);
const onlyIdx = argv.indexOf('--only');
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;
const outIdx = argv.indexOf('--out');
const OUT_DIR = outIdx >= 0 ? argv[outIdx + 1] : 'docs/reference';
const fs = require('fs');
const { execSync } = require('child_process');
fs.mkdirSync(OUT_DIR, { recursive: true });

// 窗口被遮挡/最小化时 Chromium 停发 rAF，启用流程会永远卡在双 rAF——先恢复窗口
function restoreWindow() {
  try {
    execSync(`powershell -NoProfile -Command "Add-Type 'using System;using System.Runtime.InteropServices;public class W{[DllImport(\\"user32.dll\\")]public static extern bool ShowWindow(IntPtr h,int c);[DllImport(\\"user32.dll\\")]public static extern bool SetForegroundWindow(IntPtr h);}' ; $p=Get-Process ChatGPT -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1; if($p){ [W]::ShowWindow($p.MainWindowHandle,9); [W]::SetForegroundWindow($p.MainWindowHandle) }"`, { stdio: 'ignore' });
  } catch (e) {}
}

const SCENES = [
  { id: 'milky-way', title: 'Milky Way Background', settle: 9000 },
  { id: 'glow-horizon', title: 'Glow Horizon Background', settle: 9000 },
  { id: 'mountain', title: 'Layered Mountain Background', settle: 10000 },
  { id: 'heavenly-cloud', title: 'Heavenly Cloud Background', settle: 9000 },
  { id: 'aurora-ionosphere', title: 'Aurora Ionosphere Background', settle: 12000 },
  { id: 'black-hole', title: 'Black Hole Background', settle: 12000 },
  { id: 'cloud-train', title: 'Cloud Train Background', settle: 12000 },
  { id: 'blinking-squares', title: 'Blinking Squares Background', settle: 9000 },
  { id: 'particle-image', title: 'Particle Image Background', settle: 12000 },
  { id: 'pixel-sculpt', title: 'Pixel Sculpt Background', settle: 20000 },
];

const ws = new WebSocket(`ws://127.0.0.1:${port}/devtools/page/${targetId}`);
let seq = 0;
const pending = new Map();
function send(method, params) {
  return new Promise((res, rej) => {
    const m = ++seq;
    pending.set(m, { res, rej });
    ws.send(JSON.stringify({ id: m, method, params }));
  });
}
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function evalJs(expression, awaitPromise) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: !!awaitPromise });
  if (r.exceptionDetails) throw new Error('page: ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
  return r.result.value;
}

async function waitVisible(timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 20000);
  for (;;) {
    const s = await evalJs(`new Promise(res=>{requestAnimationFrame(()=>res('raf'));setTimeout(()=>res('stuck'),1200)})`, true);
    if (s === 'raf') return true;
    restoreWindow();
    if (Date.now() > deadline) return false;
    await sleep(800);
  }
}

async function waitCanvas(sceneId, timeoutMs) {
  const expr = `(()=>{
    const layer = document.querySelector('[data-code-codex-particle-layer],[data-code-codex-glow-horizon-layer]');
    if(!layer) return JSON.stringify({ready:false,why:'no-layer'});
    const canvas = layer.querySelector('canvas');
    const horizon = layer.querySelector('.code-codex-glow-horizon-horizon');
    const reg = window[Symbol.for('code-codex:background-modules:v1')];
    return JSON.stringify({ready: !!(canvas||horizon), layerAttr: layer.getAttribute('data-code-codex-particle-layer')!==undefined?'particle':(layer.hasAttribute('data-code-codex-glow-horizon-layer')?'glow':'?'),
      hasCanvas: !!canvas, canvasW: canvas?canvas.width:0, canvasH: canvas?canvas.height:0, hasHorizon: !!horizon,
      registered: reg? [...reg.keys()] : [], rect: (()=>{const r=layer.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()});
  })()`;
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    last = JSON.parse(await evalJs(expr));
    if (last.ready) return last;
    await sleep(500);
  }
  return last;
}

async function shot(file, clip) {
  const params = { format: 'png' };
  if (clip) params.clip = clip;
  const r = await send('Page.captureScreenshot', params);
  fs.writeFileSync(`${OUT_DIR}/${file}`, Buffer.from(r.data, 'base64'));
}

ws.onopen = async () => {
  try {
    await send('Page.enable', {});
    const scenes = ONLY ? SCENES.filter((s) => s.id === ONLY) : SCENES;
    for (const scene of scenes) {
      console.log(`\n=== ${scene.id} ===`);
      await waitVisible(25000);
      // 启用：找标题匹配的卡片里的启用按钮
      const titleKey = scene.title;
      const r = await evalJs(`(()=>{
        const ex=document.querySelector('code-codex-v0-5-7'); const sr=ex&&ex.shadowRoot; if(!sr) return 'no-explorer';
        const card=[...sr.querySelectorAll('article.preview-extension')].find(a=>(a.textContent||'').includes(${JSON.stringify(titleKey)}));
        if(!card) return 'no-card';
        const btn=card.querySelector('button.preview-extension-action');
        if(!btn) return 'no-btn';
        if(btn.dataset.enabled==='true'||btn.getAttribute('aria-pressed')==='true') return 'already-on';
        btn.click(); return 'enabled';
      })()`);
      console.log('enable →', r);
      if (r === 'no-explorer' || r === 'no-card' || r === 'no-btn') throw new Error('enable failed: ' + r);
      await waitVisible(25000);

      const state = await waitCanvas(scene.id, 30000);
      console.log('canvas →', JSON.stringify(state));
      if (!state || !state.ready) { console.error('!! canvas not ready, skip captures'); continue; }

      await sleep(scene.settle);
      const rect = state.rect;
      const clip = rect.w > 0 ? { x: Math.max(0, rect.x), y: Math.max(0, rect.y), width: rect.w, height: rect.h, scale: 1 } : undefined;
      await shot(`scene-${scene.id}.png`);
      await shot(`scene-${scene.id}-canvas.png`, clip);
      for (let i = 1; i <= 5; i++) {
        await sleep(500);
        await shot(`scene-${scene.id}-motion-${i}.png`, clip);
      }
      console.log('captured scene + motion');

      // 设置面板
      const panel = await evalJs(`(()=>{
        const ex=document.querySelector('code-codex-v0-5-7'); const sr=ex.shadowRoot;
        const btn=sr.querySelector('button[id$="-settings"]:not([hidden])') || [...sr.querySelectorAll('button[id*="settings"]')].find(b=>!b.hidden&&b.offsetParent!==null);
        if(!btn) return 'no-settings-btn';
        btn.click(); return 'panel-open';
      })()`);
      if (panel === 'panel-open') {
        await sleep(1500);
        await shot(`scene-${scene.id}-panel.png`);
        console.log('captured panel');
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await sleep(600);
      } else {
        console.log('panel →', panel);
      }

      // 禁用
      const d = await evalJs(`(()=>{
        const ex=document.querySelector('code-codex-v0-5-7'); const sr=ex.shadowRoot;
        const card=[...sr.querySelectorAll('article.preview-extension')].find(a=>(a.textContent||'').includes(${JSON.stringify(titleKey)}));
        const btn=card&&card.querySelector('button.preview-extension-action');
        if(!btn) return 'no-btn';
        if(btn.dataset.enabled!=='true'&&btn.getAttribute('aria-pressed')!=='true'){ btn.click(); return 'disable-clicked'; }
        btn.click(); return 'disable-clicked';
      })()`);
      console.log('disable →', d);
      await sleep(2500);
    }
    console.log('\nDONE');
  } catch (e) {
    console.error('FATAL', e.message);
    process.exitCode = 1;
  }
  try { ws.close(); } catch (e) {}
  process.exit(0);
};
ws.onerror = (e) => { console.error('WS-ERR', e.message || e); process.exit(1); };
