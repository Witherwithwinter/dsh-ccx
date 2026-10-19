// v3 状态探针：检查原版渲染器是否启动、蒙版是否生效、host 路由是否联通
const targetId = process.argv[2];
if (!targetId) { console.error('usage: node tools/cdp-state-probe.js <targetId>'); process.exit(1); }
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/' + targetId);
let id = 0;
const pending = new Map();
function send(method, params) {
  return new Promise((res, rej) => {
    const m = ++id;
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

ws.onopen = async () => {
  try {
    for (let i = 0; i < 12; i++) {
      if (await send('Runtime.evaluate', { expression: `!!document.getElementById("dsh-ap-layer")`, returnByValue: true }).then(r => r.result.value)) break;
      await sleep(1000);
    }
    const check = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(()=>{
        const layer = document.getElementById('dsh-ap-layer');
        const host = layer && layer.querySelector('[data-dsh-awesome-appearances] ~ * , div');
        const canvas = layer ? layer.querySelector('canvas') : null;
        const html = document.documentElement;
        return JSON.stringify({
          layer: !!layer,
          layerChildren: layer ? layer.children.length : 0,
          hasCanvas: !!canvas,
          canvasSize: canvas ? canvas.width + 'x' + canvas.height : '-',
          apBg: html.getAttribute('data-ap-bg'),
          apMasks: html.getAttribute('data-ap-masks'),
          maskSidebar: html.style.getPropertyValue('--ap-mask-sidebar'),
          stateScene: (()=>{try{return fetch('/dsh-appearances/state.json').then(r=>r.json()).then(j=>j.settings.scene)}catch(e){return 'ERR'}})(),
          slots: {
            sidebar: !!document.querySelector('[data-slot="sidebar"]'),
            main: !!document.querySelector('[data-slot="main"]'),
            composer: !!document.querySelector('[data-slot="conversation.input.dock"]'),
            header: !!document.querySelector('[data-slot="conversation.header"]'),
            rightbar: !!document.querySelector('[data-slot="rightbar"]'),
          },
          sidebarBg: (()=>{const el=document.querySelector('[data-slot="sidebar"]');return el?getComputedStyle(el).backgroundColor:'-'})(),
          mainBg: (()=>{const el=document.querySelector('[data-slot="main"]');return el?getComputedStyle(el).backgroundColor:'-'})(),
        });
      })()`,
      awaitPromise: true,
    });
    console.log(check.result.value);
  } catch (e) { console.error('ERR', e.message); }
  ws.close(); process.exit(0);
};
setTimeout(() => { console.error('timeout'); process.exit(1); }, 40000);
