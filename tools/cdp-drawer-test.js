// 定向抽屉验证：milky-way 抽屉字段匹配 + 应用链路
const targetId = process.argv[2];
if (!targetId) { console.error('usage: node tools/cdp-drawer-test.js <targetId> [scene]'); process.exit(1); }
const SCENE = process.argv[3] || 'milky-way';
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
    // ① 切场景
    await send('Runtime.evaluate', {
      expression: `fetch('/dsh-appearances/state-save.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:{enabled:true,mode:'scene',scene:'${SCENE}',surfaces:{enabled:true,sidebar:66,conversation:58,composer:86,header:78,right:66},sceneParams:{},dim:0.28,blur:0,quality:'auto'}})}).then(r=>r.json()).then(j=>j.ok)`,
      returnByValue: true, awaitPromise: true,
    });
    await sleep(9500); // 等客户端轮询采纳（8s 周期）
    // ② 开面板（可能已开则先关再开，触发 drawer 重建）
    await send('Runtime.evaluate', { expression: `(()=>{const sh=document.getElementById('dsh-ap-panel').shadowRoot;sh.querySelector('.trigger').click();sh.querySelector('.trigger').click();return true})()`, returnByValue: true });
    await sleep(800);
    const drawer = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(()=>{
        const sh=document.getElementById('dsh-ap-panel').shadowRoot;
        const fields=sh.querySelector('[data-sec=fields]');
        const colors=sh.querySelector('[data-sec=colors]');
        return JSON.stringify({
          stateScene: (function(){return window.__dshSceneProbe||'n/a'})(),
          fieldsRows: fields.querySelectorAll('input[data-field]').length,
          firstField: fields.querySelector('input[data-field]') ? fields.querySelector('input[data-field]').getAttribute('data-field') : '-',
          firstLabel: fields.querySelector('.crow .zh') ? fields.querySelector('.crow .zh').textContent : '-',
          colorsShown: colors.style.display !== 'none',
          qsegOn: (sh.querySelector('[data-act=qseg] button.on')||{}).textContent || '-',
        });
      })()`,
    });
    console.log('drawer:', drawer.result.value);
    // ③ 拖 speed + 应用
    if (await send('Runtime.evaluate', { expression: `(()=>{const sh=document.getElementById('dsh-ap-panel').shadowRoot;return !!sh.querySelector('[data-sec=fields] input[data-field=speed]')})()`, returnByValue: true }).then(r => r.result.value)) {
      console.log('drag:', await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(()=>{const sh=document.getElementById('dsh-ap-panel').shadowRoot;const inp=sh.querySelector('[data-sec=fields] input[data-field=speed]');inp.value='1.2';inp.dispatchEvent(new Event('input',{bubbles:true}));return sh.querySelector('output[data-fieldval=speed]').textContent})()`,
      }).then(r => r.result.value));
      console.log('apply:', await send('Runtime.evaluate', { expression: `(()=>{document.getElementById('dsh-ap-panel').shadowRoot.querySelector('[data-act=apply]').click();return true})()`, returnByValue: true }).then(r => r.result.value));
      await sleep(2500);
      console.log('persisted:', await send('Runtime.evaluate', { expression: `fetch('/dsh-appearances/state.json').then(r=>r.json()).then(j=>JSON.stringify({scene:j.settings.scene,params:j.settings.sceneParams}))`, returnByValue: true, awaitPromise: true }).then(r => r.result.value));
      console.log('canvas:', await send('Runtime.evaluate', { expression: `(()=>{const c=document.getElementById('dsh-ap-layer').querySelector('canvas');return c?c.width+'x'+c.height:'-'})()`, returnByValue: true }).then(r => r.result.value));
    }
  } catch (e) { console.error('ERR', e.message); }
  ws.close(); process.exit(0);
};
setTimeout(() => { console.error('timeout'); process.exit(1); }, 90000);
