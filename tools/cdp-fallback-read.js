// 读取回退文案里的真实错误信息 + console 异常
const targetId = process.argv[2];
if (!targetId) { console.error('usage: node tools/cdp-fallback-read.js <targetId>'); process.exit(1); }
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
    return;
  }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    console.log('[EXC]', (d.exception && d.exception.description || d.text || '').slice(0, 260).replace(/\n/g, ' | '));
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

ws.onopen = async () => {
  try {
    await send('Runtime.enable');
    for (const scene of ['aurora-ionosphere', 'particle-image', 'blinking-squares']) {
      await send('Runtime.evaluate', {
        expression: `fetch('/dsh-appearances/state-save.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:{enabled:true,mode:'scene',scene:'${scene}',surfaces:{enabled:true,sidebar:66,conversation:58,composer:86,header:78,right:66},dim:0.28,blur:0,speed:1,saturation:1,quality:'auto'}})}).then(r=>r.json()).then(j=>j.ok)`,
        returnByValue: true, awaitPromise: true,
      });
      await sleep(scene === 'particle-image' ? 13000 : 8000);
      const r = await send('Runtime.evaluate', {
        expression: `(()=>{const host=document.getElementById('dsh-ap-layer').children[0].children[0];return JSON.stringify({text:(host.textContent||'').slice(0,120),children:host.children.length,canvas:!!host.querySelector('canvas')})})()`,
        returnByValue: true,
      });
      console.log(scene, '->', r.result.value);
    }
  } catch (e) { console.error('ERR', e.message); }
  ws.close(); process.exit(0);
};
setTimeout(() => { console.error('timeout'); process.exit(1); }, 120000);
