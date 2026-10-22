// DSH 侧当前插件面板截图对照
// usage: node tools/dsh-panel-shot.cjs <targetId> [--out docs/codex-ui]
const targetId = process.argv[2];
const argv = process.argv.slice(3);
const outIdx = argv.indexOf('--out');
const OUT_DIR = outIdx >= 0 ? argv[outIdx + 1] : 'docs/codex-ui';
const fs = require('fs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const ws = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
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
  if (r.exceptionDetails) throw new Error('page: ' + JSON.stringify(r.exceptionDetails).slice(0, 500));
  return r.result.value;
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
    // 找插件宿主元素（v0.7 更名 dsh-ccx；兼容旧 dsh-ap）
    const probe = await evalJs(`(()=>{
      const ids=['dsh-ccx-panel','dsh-ap-panel'];
      for(const id of ids){ const el=document.getElementById(id); if(el) return JSON.stringify({id, hasShadow: !!el.shadowRoot}); }
      return JSON.stringify({err:'no-panel-host'});
    })()`);
    console.log('host →', probe);
    const host = JSON.parse(probe);
    if (host.err) { console.log('插件面板宿主不存在'); process.exit(1); }
    const PID = JSON.stringify('#' + host.id);
    // 打开面板
    console.log('open →', await evalJs(`(()=>{const sh=document.querySelector(${PID}).shadowRoot;const t=sh.querySelector('.trigger');if(!t)return 'no-trigger';t.click();return 'ok'})()`));
    await sleep(1200);
    const rect = JSON.parse(await evalJs(`(()=>{
      const sh=document.querySelector(${PID}).shadowRoot;
      const p=sh.querySelector('.panel'); if(!p) return JSON.stringify({err:'no-panel'});
      const r=p.getBoundingClientRect(); return JSON.stringify([r.x,r.y,r.width,r.height, sh.querySelector('.panel').classList.contains('open')]);
    })()`));
    console.log('panel rect →', JSON.stringify(rect));
    const vp = JSON.parse(await evalJs(`JSON.stringify([innerWidth,innerHeight])`));
    console.log('viewport →', JSON.stringify(vp));
    await shot('20-dsh-panel-window.png');
    if (!rect.err && rect[4]) {
      await shot('20-dsh-panel.png', { x: Math.max(0, rect[0] - 14), y: Math.max(0, rect[1] - 14), width: Math.min(rect[2] + 28, vp[0]), height: Math.min(rect[3] + 28, vp[1]), scale: 1 });
    }
    // 关闭，恢复原状
    console.log('close →', await evalJs(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return true})()`));
  } catch (e) {
    console.error('FATAL', e.message);
    process.exitCode = 1;
  }
  try { ws.close(); } catch (e) {}
  process.exit(0);
};
ws.onerror = (e) => { console.error('WS-ERR', e.message || String(e)); process.exit(1); };
