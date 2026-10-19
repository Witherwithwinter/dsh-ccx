// DSH 实机逐场景纯场景截图：切场景 → 等渲染器就绪 → 仿真 1280x816@1.5x → 藏 UI → 截图
// usage: node tools/dsh-scene-capture.cjs <targetId> [--scenes a,b,c] [--out docs/reference]
// 前提: DSH 桌面端带 --remote-debugging-port=9222 启动；产物 dsh-<id>.png 与
//      harness-<id>.png / scene-<id>-canvas.png 同尺寸可直接 pixelmatch。
const targetId = process.argv[2];
const argv = process.argv.slice(3);
function argOf(name, dflt) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; }
const ONLY = (argOf('--scenes', '') || '').split(',').filter(Boolean);
const OUT_DIR = argOf('--out', 'docs/reference');
const fs = require('fs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SETTLE = {
  'milky-way': 9000, 'glow-horizon': 9000, mountain: 10000, 'heavenly-cloud': 9000,
  'aurora-ionosphere': 12000, 'black-hole': 12000, 'cloud-train': 12000,
  'blinking-squares': 9000, 'particle-image': 14000, 'pixel-sculpt': 24000,
};
// 与 lib/client.js SCENE_LAYER_BG 一致：就绪判定要求层底色已切到目标场景
const LAYER_BG = {
  'milky-way': 'rgb(2, 9, 13)', 'aurora-ionosphere': 'rgb(2, 9, 13)', 'cloud-train': 'rgb(2, 9, 13)',
  mountain: 'rgb(2, 9, 13)', 'pixel-sculpt': 'rgb(7, 7, 10)', 'heavenly-cloud': 'rgb(2, 4, 8)',
  'black-hole': 'rgb(0, 0, 0)', 'glow-horizon': 'rgb(5, 5, 7)',
  'blinking-squares': 'rgb(0, 0, 0)', 'particle-image': 'rgb(0, 0, 0)',
};
const SCENES = ONLY.length ? ONLY : Object.keys(SETTLE);

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/' + targetId);
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

async function switchScene(id) {
  await evalJs(`fetch('/dsh-appearances/state-save.json',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:{enabled:true,mode:'scene',scene:${JSON.stringify(id)},surfaces:{enabled:true,sidebar:66,conversation:58,composer:58,header:0,right:66},dim:0,blur:0,sceneParams:{}}})}).then(r=>r.json()).then(j=>j.ok===true||j.ok==='1')`, true);
}

async function waitReady(id, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    last = JSON.parse(await evalJs(`(()=>{
      const layer=document.getElementById('dsh-ap-layer');
      const canvas=layer&&layer.querySelector('canvas');
      const hz=layer&&layer.querySelector('.code-codex-glow-horizon-horizon');
      return JSON.stringify({canvas:!!canvas,w:canvas?canvas.width:0,h:canvas?canvas.height:0,horizon:!!hz,
        bg:layer?(layer.style.getPropertyValue('--ap-layer-bg')||''):'', err:!!(layer&&(layer.textContent||'').match(/失败|未就绪/))});
    })()`));
    // 场景切换完成的标志：层底色已切到目标场景（旧场景画布可能残留，不能只看 canvas）
    const bgOk = last.bg === (LAYER_BG[id] || '');
    if (bgOk && ((last.canvas && last.w > 0) || last.horizon)) return last;
    await sleep(700);
  }
  return last;
}

ws.onopen = async () => {
  try {
    await send('Page.enable', {});
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 816, deviceScaleFactor: 1.5, mobile: false });
    for (const scene of SCENES) {
      console.log(`\n=== ${scene} ===`);
      await switchScene(scene);
      const ready = await waitReady(scene, 45000);
      if (!ready || (!(ready.canvas) && !ready.horizon)) { console.error('!! 未就绪:', JSON.stringify(ready)); continue; }
      console.log('ready →', JSON.stringify(ready));
      await sleep(SETTLE[scene] || 10000);
      // 藏 UI：只留背景层（表面蒙版会盖住场景，纯场景帧才能与基准比对）
      await evalJs(`(()=>{let s=document.getElementById('dsh-ref-hide'); if(!s){s=document.createElement('style');s.id='dsh-ref-hide';document.head.appendChild(s);} s.textContent='body > *:not(#dsh-ap-layer){display:none !important}'; return true})()`);
      await sleep(400);
      const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1280, height: 816, scale: 1 } });
      fs.writeFileSync(`${OUT_DIR}/dsh-${scene}.png`, Buffer.from(shot.data, 'base64'));
      console.log('saved', `dsh-${scene}.png`);
      await evalJs(`(()=>{const s=document.getElementById('dsh-ref-hide'); if(s) s.textContent=''; return true})()`);
    }
    await send('Emulation.clearDeviceMetricsOverride', {});
    console.log('\nDONE');
  } catch (e) {
    console.error('FATAL', e.message);
    process.exitCode = 1;
  }
  try { ws.close(); } catch (e) {}
  process.exit(0);
};
ws.onerror = (e) => { console.error('WS-ERR', e.message || String(e)); process.exit(1); };
