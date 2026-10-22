// code-codex 真实 UI 采集：打开 Preview Market 弹层与场景设置面板，截图 + 导出 DOM 计算样式
// usage: node tools/codex-ui-capture.cjs <port> <targetId> [--out docs/codex-ui]
// 约束同 codex-reference-sweep：窗口必须可见（rAF 流动），必要时 restore-chatgpt-window.ps1 置前。
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
  if (r.exceptionDetails) throw new Error('page: ' + JSON.stringify(r.exceptionDetails).slice(0, 500));
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
  await waitVisible(10000);
  const params = { format: 'png' };
  if (clip) params.clip = clip;
  const r = await send('Page.captureScreenshot', params);
  fs.writeFileSync(`${OUT_DIR}/${file}`, Buffer.from(r.data, 'base64'));
}

// 通用：元素几何 + 关键计算样式
const SURVEY_FN = `
window.__uiSurvey = (rootSel, targetSel) => {
  const ex = document.querySelector('code-codex-v0-5-7');
  const sr = ex && ex.shadowRoot; if (!sr) return JSON.stringify({ err: 'no-shadow' });
  const root = rootSel ? sr.querySelector(rootSel) : sr;
  if (!root) return JSON.stringify({ err: 'no-root:' + rootSel });
  const targets = targetSel ? [...root.querySelectorAll(targetSel)] : [root];
  const pick = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      sel: (el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '')).slice(0, 110),
      rect: [Math.round(r.x * 10) / 10, Math.round(r.y * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10],
      bg: cs.backgroundColor, color: cs.color, font: cs.fontSize + '/' + cs.lineHeight + ' ' + cs.fontWeight,
      radius: cs.borderRadius, border: cs.borderWidth + ' ' + cs.borderColor, shadow: cs.boxShadow.slice(0, 90),
      pad: cs.padding, gap: cs.gap, display: cs.display, grid: cs.gridTemplateColumns.slice(0, 60)
    };
  };
  return JSON.stringify({ host: pick(root), items: targets.slice(0, 60).map(pick) }, null, 1);
};
true;
`;

async function survey(name, rootSel, targetSel) {
  const v = await evalJs(`window.__uiSurvey(${JSON.stringify(rootSel)}, ${JSON.stringify(targetSel || null)})`);
  fs.writeFileSync(`${OUT_DIR}/${name}.json`, typeof v === 'string' ? v : JSON.stringify(v, null, 1));
  console.log('survey →', name);
}

function clipOf(rect, pad) {
  const p = pad == null ? 0 : pad;
  return {
    x: Math.max(0, rect[0] - p), y: Math.max(0, rect[1] - p),
    width: Math.min(rect[2] + p * 2, 4000), height: Math.min(rect[3] + p * 2, 4000), scale: 1
  };
}

ws.onopen = async () => {
  try {
    await send('Page.enable', {});
    if (!(await waitVisible(30000))) throw new Error('窗口无法置前（rAF 不流动），中止');

    await evalJs(SURVEY_FN);

    // 0) 主题与 token 真值
    const tokens = await evalJs(`(()=>{
      const ex=document.querySelector('code-codex-v0-5-7'); const sr=ex.shadowRoot;
      const probe=sr.querySelector('.particle-settings-panel')||sr.querySelector('.preview-market-popover')||sr.querySelector('.statusbar')||sr;
      const cs=getComputedStyle(probe);
      const names=['--cle-paper','--cle-paper-raised','--cle-subtle','--cle-ink','--cle-muted','--cle-rule','--cle-rule-strong','--cle-hover','--cle-selected','--cle-signal','--cle-added','--cle-focus','--cle-input','--cle-scroll-thumb','--cle-icon-blue','--cle-icon-violet'];
      const out={htmlClass:document.documentElement.className,bodyClass:document.body.className};
      for(const n of names) out[n]=cs.getPropertyValue(n).trim();
      out.fontFamily=getComputedStyle(probe).fontFamily;
      out.viewport=[innerWidth,innerHeight];
      return JSON.stringify(out,null,1);
    })()`);
    fs.writeFileSync(`${OUT_DIR}/tokens.json`, typeof tokens === 'string' ? tokens : JSON.stringify(tokens, null, 1));
    console.log('tokens →', tokens.slice(0, 400));

    // 1) 整窗基准帧（市场关闭态）
    await shot('00-window.png');

    // 2) 打开 Preview Market
    const market = await evalJs(`(()=>{
      const ex=document.querySelector('code-codex-v0-5-7'); const sr=ex.shadowRoot;
      const btn=sr.querySelector('button.preview-market-button'); if(!btn) return 'no-btn';
      btn.click(); return 'opened';
    })()`);
    console.log('market →', market);
    await sleep(900);
    const mrect = JSON.parse(await evalJs(`(()=>{
      const p=document.querySelector('code-codex-v0-5-7').shadowRoot.querySelector('.preview-market-popover');
      if(!p) return JSON.stringify({err:'no-popover'});
      const r=p.getBoundingClientRect(); return JSON.stringify([r.x,r.y,r.width,r.height]);
    })()`));
    console.log('market rect →', JSON.stringify(mrect));
    if (!mrect.err) {
      await shot('01-market.png', clipOf(mrect, 14));
      await shot('01-market-window.png');
      await survey('02-market-popover', '.preview-market-popover');
      await survey('03-market-card', '.preview-market-popover article.preview-extension');
    }

    // 3) 关市场，打开 milky-way 设置面板（质量工具栏 + 滑杆 + 色板）
    await evalJs(`document.querySelector('code-codex-v0-5-7').shadowRoot.querySelector('button.preview-market-close')?.click(); true`);
    await sleep(500);
    async function openPanel(triggerSel, tag) {
      const r = await evalJs(`(()=>{
        const sr=document.querySelector('code-codex-v0-5-7').shadowRoot;
        const btn=sr.querySelector(${JSON.stringify(triggerSel)}); if(!btn) return 'no-trigger';
        btn.click(); return 'open';
      })()`);
      console.log(tag, '→', r);
      if (r !== 'open') return;
      await sleep(1100);
      const rect = JSON.parse(await evalJs(`(()=>{
        const panels=[...document.querySelector('code-codex-v0-5-7').shadowRoot.querySelectorAll('.particle-settings-panel')].filter(p=>!p.hidden&&p.matches(':popover-open'));
        if(!panels.length) return JSON.stringify({err:'none-open'});
        const r=panels[0].getBoundingClientRect(); return JSON.stringify([r.x,r.y,r.width,r.height]);
      })()`));
      console.log(tag, 'rect →', JSON.stringify(rect));
      if (!rect.err) {
        await shot(`10-${tag}.png`, clipOf(rect, 14));
        await shot(`10-${tag}-window.png`);
        await survey(`11-${tag}-panel`, '.particle-settings-panel:not([hidden])');
        await survey(`12-${tag}-rows`, '.particle-settings-panel:not([hidden]) .particle-control-row');
      }
      await evalJs(`(()=>{
        const sr=document.querySelector('code-codex-v0-5-7').shadowRoot;
        const b=sr.querySelector('.particle-settings-panel:not([hidden]) .particle-settings-close'); if(b) b.click(); return true;
      })()`);
      await sleep(500);
    }
    await openPanel('button.milky-way-settings-trigger', 'milkyway');
    await openPanel('button.glow-horizon-settings-trigger', 'glowhorizon');
    await openPanel('button.black-hole-settings-trigger', 'blackhole');

    console.log('\nDONE');
  } catch (e) {
    console.error('FATAL', e.message);
    process.exitCode = 1;
  }
  try { ws.close(); } catch (e) {}
  process.exit(0);
};
ws.onerror = (e) => { console.error('WS-ERR', e.message || String(e)); process.exit(1); };
