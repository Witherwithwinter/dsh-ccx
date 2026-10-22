// 全外观设置面板普查：逐卡打开 ⚙，dump 面板结构（图例/行标签/按钮/开关）+ 截图
// usage: node tools/codex-panel-inventory.cjs <port> <targetId> [--out docs/codex-ui]
const port = process.argv[2];
const targetId = process.argv[3];
const argv = process.argv.slice(4);
const outIdx = argv.indexOf('--out');
const OUT_DIR = outIdx >= 0 ? argv[outIdx + 1] : 'docs/codex-ui';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const RESTORE_PS = path.join(__dirname, 'restore-chatgpt-window.ps1');
fs.mkdirSync(OUT_DIR, { recursive: true });

const PLUGINS = [
  'code-codex.custom-background-background',
  'code-codex.surface-opacity',
  'code-codex.particle-image-background',
  'code-codex.black-hole-background',
  'code-codex.glow-horizon-background',
  'code-codex.heavenly-cloud-background',
  'code-codex.aurora-ionosphere-background',
  'code-codex.milky-way-background',
  'code-codex.layered-mountain-background',
  'code-codex.cloud-train-background',
  'code-codex.pixel-sculpt-background',
  'code-codex.blinking-squares-background',
  'code-codex.startup-transition',
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
function restoreWindow() {
  try { execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', RESTORE_PS], { stdio: 'ignore', timeout: 15000 }); } catch (e) {}
}
async function waitVisible(timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 30000);
  for (;;) {
    const s = await evalJs(`new Promise(res=>{requestAnimationFrame(()=>res('raf'));setTimeout(()=>res('stuck'),1200)})`, true);
    if (s === 'raf') return true;
    restoreWindow();
    if (Date.now() > deadline) return false;
    await sleep(900);
  }
}
async function shot(file, clip) {
  const params = { format: 'png' };
  if (clip) params.clip = { scale: 1, ...clip };
  const r = await send('Page.captureScreenshot', params);
  fs.writeFileSync(`${OUT_DIR}/${file}`, Buffer.from(r.data, 'base64'));
}

const DUMP_FN = `
window.__panelDump = (wantTitle) => {
  const sr = document.querySelector('code-codex-v0-5-7').shadowRoot;
  const panels = [...sr.querySelectorAll('.particle-settings-panel')].filter(p => p.matches(':popover-open'));
  const panel = wantTitle ? panels.find(p => (p.querySelector('h3')||{}).textContent === wantTitle) : panels[panels.length - 1];
  if (!panel) return JSON.stringify({ err: 'no-open-panel' });
  const text = (el) => (el.textContent || '').trim().replace(/\\s+/g, ' ');
  const rows = [...panel.querySelectorAll('.particle-control-row')].map(r => {
    const label = text(r.querySelector('label') || r.children[0] || {});
    const input = r.querySelector('input');
    const out = r.querySelector('output');
    return {
      label,
      kind: input ? input.type || 'input' : (r.querySelector('select') ? 'select' : 'other'),
      value: out ? text(out) : (input ? input.value : '')
    };
  });
  const toggles = [...panel.querySelectorAll('.particle-toggle-row')].map(t => ({
    label: text(t.querySelector('.cle-bilingual-label') || t.children[0] || {}),
    checked: !!(t.querySelector('input[type=checkbox]') || {}).checked,
    color: !!t.querySelector('input[type=color]')
  }));
  const legends = [...panel.querySelectorAll('fieldset legend, .particle-source-summary')].map(text);
  const toolbars = [...panel.querySelectorAll('[role="group"]')].map(g => ({
    aria: g.getAttribute('aria-label'),
    buttons: [...g.querySelectorAll('button')].map(b => text(b))
  }));
  const actions = [...panel.querySelectorAll('.glow-horizon-actions button, .surface-opacity-reset, .black-hole-reset')].map(b => text(b));
  const selects = [...panel.querySelectorAll('select')].map(s => ({ options: [...s.options].map(o => text(o)) }));
  const specials = {
    morphCurve: !!panel.querySelector('.particle-morph-curve-control'),
    library: text(panel.querySelector('.particle-source-count') || ''),
    notes: [...panel.querySelectorAll('p')].map(text).filter(Boolean).slice(0, 4),
  };
  return JSON.stringify({
    title: text(panel.querySelector('h3')),
    legends, rows, toggles, toolbars, actions, selects, specials
  }, null, 1);
};
true;
`;

function expectTitle(short) {
  return {
    'custom-background': 'Custom Background', 'surface-opacity': 'UI Surface Opacity',
    'particle-image': 'Particle Image Background', 'black-hole': 'Black Hole Background',
    'glow-horizon': 'Glow Horizon Background', 'heavenly-cloud': 'Heavenly Cloud Background',
    'aurora-ionosphere': 'Aurora Ionosphere Background', 'milky-way': 'Milky Way Background',
    'layered-mountain': 'Layered Mountain Background', 'cloud-train': 'Cloud Train Background',
    'pixel-sculpt': 'Pixel Sculpt Background', 'blinking-squares': 'Blinking Squares Background',
    'startup-transition': 'Codex Startup Transition',
  }[short] || '';
}

ws.onopen = async () => {
  try {
    await send('Page.enable', {});
    if (!(await waitVisible(30000))) throw new Error('窗口无法置前');
    await evalJs(DUMP_FN);

    // 打开市场
    const opened = await evalJs(`(()=>{const sr=document.querySelector('code-codex-v0-5-7').shadowRoot;const b=sr.querySelector('button.preview-market-button');if(!b)return 'no-btn';b.click();return 'ok'})()`);
    console.log('market:', opened);
    await sleep(900);

    const inventory = {};
    for (const pid of PLUGINS) {
      const short = pid.replace('code-codex.', '').replace('-background', '');
      const r = await evalJs(`(()=>{
        const sr=document.querySelector('code-codex-v0-5-7').shadowRoot;
        const card=sr.querySelector('article[data-appearance-plugin="${pid}"]');
        if(!card) return 'no-card';
        const trig=card.querySelector('button.particle-settings-trigger');
        if(!trig) return 'no-trigger';
        trig.click(); return 'clicked';
      })()`);
      if (r !== 'clicked') { inventory[short] = { err: r }; console.log(short, '→', r); continue; }
      // 轮询等待目标面板真正 popover-open（最多 6s）
      let dump = { err: 'timeout' };
      for (let w = 0; w < 12; w++) {
        await sleep(500);
        await waitVisible(8000);
        dump = JSON.parse(await evalJs(`window.__panelDump(${JSON.stringify(expectTitle(short))})`));
        if (!dump.err) break;
      }
      inventory[short] = dump;
      console.log(short, '→', dump.err || dump.title, '| legends:', (dump.legends || []).join('/'), '| rows:', (dump.rows || []).length);
      // 截图：面板+市场卡片
      const rect = JSON.parse(await evalJs(`(()=>{
        const sr=document.querySelector('code-codex-v0-5-7').shadowRoot;
        const panels=[...sr.querySelectorAll('.particle-settings-panel')].filter(p=>p.matches(':popover-open'));
        const p=panels.find(q=>(q.querySelector('h3')||{}).textContent===${JSON.stringify('expectTitle(short)')}) || panels[panels.length-1];
        if(!p) return JSON.stringify(null);
        const r=p.getBoundingClientRect(); return JSON.stringify([r.x,r.y,r.width,r.height]);
      })()`));
      if (rect) await shot(`inv-${short}.png`, { x: Math.max(0, rect[0] - 12), y: Math.max(0, rect[1] - 12), width: rect[2] + 24, height: rect[3] + 24 });
      await sleep(200);
    }
    fs.writeFileSync(`${OUT_DIR}/panel-inventory.json`, JSON.stringify(inventory, null, 1));
    console.log('\nDONE → panel-inventory.json');
  } catch (e) {
    console.error('FATAL', e.message);
    process.exitCode = 1;
  }
  try { ws.close(); } catch (e) {}
  process.exit(0);
};
ws.onerror = (e) => { console.error('WS-ERR', e.message || String(e)); process.exit(1); };
