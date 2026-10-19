// 原版基准采集 v2：在 Code-Codex 注入的 ChatGPT 桌面版里逐场景 启用→截图→禁用
// usage: node tools/codex-reference-sweep.cjs <port> <targetId> [--only <sceneId>] [--out docs/reference]
// 关键约束：窗口 hidden 时 Chromium 停发 rAF，启用流程会永远卡在双 rAF——
// 每一步前都 waitVisible（必要时调 restore-chatgpt-window.ps1 置前）。
// 产物: scene-<id>.png / scene-<id>-canvas.png / scene-<id>-panel.png / scene-<id>-motion-<n>.png
const port = process.argv[2];
const targetId = process.argv[3];
const argv = process.argv.slice(4);
const onlyIdx = argv.indexOf('--only');
const onlyVal = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;
const ONLY = onlyVal ? onlyVal.split(',').map((s) => s.trim()) : null;
const outIdx = argv.indexOf('--out');
const OUT_DIR = outIdx >= 0 ? argv[outIdx + 1] : 'docs/reference';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const RESTORE_PS = path.join(__dirname, 'restore-chatgpt-window.ps1');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SCENES = [
  { id: 'milky-way', title: 'Milky Way Background', settle: 9000 },
  { id: 'glow-horizon', title: 'Glow Horizon Background', settle: 9000 },
  { id: 'mountain', title: 'Layered Mountain Background', settle: 10000 },
  { id: 'heavenly-cloud', title: 'Heavenly Cloud Background', settle: 9000 },
  { id: 'aurora-ionosphere', title: 'Aurora Ionosphere Background', settle: 12000 },
  { id: 'black-hole', title: 'Black Hole Background', settle: 12000 },
  { id: 'cloud-train', title: 'Cloud Train Background', settle: 12000 },
  { id: 'blinking-squares', title: 'Blinking Squares Background', settle: 9000 },
  { id: 'particle-image', title: 'Particle Image Background', settle: 14000 },
  { id: 'pixel-sculpt', title: 'Pixel Sculpt Background', settle: 22000 },
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

// 卡片状态：{state:'on'|'off'|'pending'|'?', btn:true}
async function cardState(titleKey) {
  return evalJs(`(()=>{
    const ex=document.querySelector('code-codex-v0-5-7'); const sr=ex&&ex.shadowRoot; if(!sr) return JSON.stringify({state:'?',btn:false});
    const card=[...sr.querySelectorAll('article.preview-extension')].find(a=>(a.textContent||'').includes(${JSON.stringify(titleKey)}));
    if(!card) return JSON.stringify({state:'?',btn:false});
    const btn=card.querySelector('button.preview-extension-action');
    const txt=(card.textContent||'');
    const state = txt.includes('正在应用')?'pending':(btn&&(btn.dataset.enabled==='true'||btn.getAttribute('aria-pressed')==='true')?'on':(txt.includes('已启用')?'on':(txt.includes('已停用')||txt.includes('已下载')?'off':'?')));
    return JSON.stringify({state,btn:!!btn});
  })()`).then((s) => JSON.parse(s));
}

async function clickCardButton(titleKey) {
  return evalJs(`(()=>{
    const ex=document.querySelector('code-codex-v0-5-7'); const sr=ex&&ex.shadowRoot; if(!sr) return 'no-explorer';
    const card=[...sr.querySelectorAll('article.preview-extension')].find(a=>(a.textContent||'').includes(${JSON.stringify(titleKey)}));
    const btn=card&&card.querySelector('button.preview-extension-action');
    if(!btn) return 'no-btn';
    btn.click(); return 'clicked';
  })()`);
}

async function waitForCard(titleKey, want, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    await waitVisible(10000);
    last = await cardState(titleKey);
    if (last.state === want) return true;
    await sleep(700);
  }
  console.error(`  !! card "${titleKey}" 未到 ${want}（最后=${last && last.state}）`);
  return false;
}

async function waitLayer(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    await waitVisible(10000);
    last = JSON.parse(await evalJs(`(()=>{
      const layer = document.querySelector('[data-code-codex-particle-layer],[data-code-codex-glow-horizon-layer]');
      if(!layer) return JSON.stringify({ready:false,why:'no-layer'});
      const canvas = layer.querySelector('canvas');
      const horizon = layer.querySelector('.code-codex-glow-horizon-horizon');
      return JSON.stringify({ready: !!(canvas||horizon), hasCanvas: !!canvas,
        canvasW: canvas?canvas.width:0, canvasH: canvas?canvas.height:0, hasHorizon: !!horizon,
        bg: getComputedStyle(layer).backgroundColor,
        rect: (()=>{const r=layer.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()});
    })()`));
    if (last.ready) return last;
    await sleep(600);
  }
  return last;
}

async function shot(file, clip) {
  await waitVisible(10000);
  const params = { format: 'png' };
  if (clip) params.clip = clip;
  const r = await send('Page.captureScreenshot', params);
  fs.writeFileSync(`${OUT_DIR}/${file}`, Buffer.from(r.data, 'base64'));
}

async function pressEscape() {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
}

ws.onopen = async () => {
  try {
    await send('Page.enable', {});
    const scenes = ONLY ? SCENES.filter((s) => ONLY.includes(s.id)) : SCENES;
    for (const scene of scenes) {
      console.log(`\n=== ${scene.id} ===`);
      if (!(await waitVisible(30000))) throw new Error('窗口无法置前（rAF 不流动），中止');

      // 归零：若已启用先停用，保证每场景从干净状态启用（开场动画一致）
      let cs = await cardState(scene.title);
      if (cs.state === 'on' || cs.state === 'pending') {
        await clickCardButton(scene.title);
        if (!(await waitForCard(scene.title, 'off', 20000))) console.error('  !! 归零失败，继续');
        await sleep(1500);
      }

      // 启用
      console.log('enable →', await clickCardButton(scene.title));
      if (!(await waitForCard(scene.title, 'on', 40000))) throw new Error('启用失败: ' + scene.id);
      const layer = await waitLayer(30000);
      if (!layer || !layer.ready) { console.error('!! 背景层未就绪，跳过该场景'); continue; }
      console.log('layer →', JSON.stringify(layer));

      // 截图前关掉插件市场弹层（不遮侧栏）
      await evalJs(`(()=>{const ex=document.querySelector('code-codex-v0-5-7'); const b=ex&&ex.shadowRoot.querySelector('button.preview-market-close'); if(b) b.click(); return !!b})()`).catch(()=>{});
      await sleep(600);

      // 等开场结束
      await sleep(scene.settle);
      const rect = layer.rect;
      const clip = rect.w > 0 ? { x: Math.max(0, rect.x), y: Math.max(0, rect.y), width: rect.w, height: rect.h, scale: 1 } : undefined;
      // 纯场景帧：藏掉背景层以外的全部 DOM（UI 表面会盖住场景，像素比对需要无遮挡帧）
      const HIDE_CSS = "body > *:not([data-code-codex-particle-layer]):not([data-code-codex-glow-horizon-layer]){display:none !important}";
      await evalJs(`(()=>{let s=document.getElementById('dsh-ref-hide-chrome'); if(!s){s=document.createElement('style');s.id='dsh-ref-hide-chrome';document.head.appendChild(s);} s.textContent=${JSON.stringify(HIDE_CSS)}; return true})()`);
      await sleep(400);
      await shot(`scene-${scene.id}-canvas.png`, clip);
      for (let i = 1; i <= 5; i++) {
        await sleep(500);
        await shot(`scene-${scene.id}-motion-${i}.png`, clip);
      }
      await evalJs(`(()=>{const s=document.getElementById('dsh-ref-hide-chrome'); if(s) s.textContent=''; return true})()`);
      await sleep(400);
      await shot(`scene-${scene.id}.png`);
      console.log('captured scene + motion');

      // 设置面板：优先找本场景卡片的 settings 按钮，其次全局可见的 -settings 按钮
      const panelBtn = await evalJs(`(()=>{
        const ex=document.querySelector('code-codex-v0-5-7'); const sr=ex&&ex.shadowRoot; if(!sr) return null;
        const card=[...sr.querySelectorAll('article.preview-extension')].find(a=>(a.textContent||'').includes(${JSON.stringify(scene.title)}));
        const cands=[];
        if(card) cands.push(...card.querySelectorAll('button[id$="-settings"],button[class*="settings"]'));
        cands.push(...sr.querySelectorAll('button[id$="-settings"]'));
        for(const b of cands){ if(b&&!b.hidden) return b.id||b.className; }
        return null;
      })()`);
      if (panelBtn) {
        const opened = await evalJs(`(()=>{
          const ex=document.querySelector('code-codex-v0-5-7'); const sr=ex.shadowRoot;
          const card=[...sr.querySelectorAll('article.preview-extension')].find(a=>(a.textContent||'').includes(${JSON.stringify(scene.title)}));
          let btn=card&&card.querySelector('button[id$="-settings"],button[class*="settings"]');
          if(!btn) btn=[...sr.querySelectorAll('button[id$="-settings"]')].find(b=>!b.hidden);
          if(!btn) return 'no-btn';
          btn.click(); return 'open';
        })()`);
        if (opened === 'open') {
          await sleep(1600);
          await shot(`scene-${scene.id}-panel.png`);
          console.log('captured panel via', panelBtn);
          await pressEscape();
          await sleep(800);
        }
      } else {
        console.log('panel: 未找到设置按钮（记录供排查）');
      }

      // 停用归零
      console.log('disable →', await clickCardButton(scene.title));
      await waitForCard(scene.title, 'off', 20000);
      await sleep(2000);
    }
    console.log('\nDONE');
  } catch (e) {
    console.error('FATAL', e.message);
    process.exitCode = 1;
  }
  try { ws.close(); } catch (e) {}
  process.exit(0);
};
ws.onerror = (e) => { console.error('WS-ERR', e.message || String(e)); process.exit(1); };
