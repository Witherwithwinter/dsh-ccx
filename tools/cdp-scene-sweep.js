// 场景扫描：逐个切场景，确认渲染器 canvas 出现、无 fallback 文案
const targetId = process.argv[2];
if (!targetId) { console.error('usage: node tools/cdp-scene-sweep.js <targetId>'); process.exit(1); }
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
const SCENES = ['milky-way', 'glow-horizon', 'mountain', 'heavenly-cloud', 'aurora-ionosphere', 'black-hole'];

ws.onopen = async () => {
  try {
    for (const scene of SCENES) {
      await send('Runtime.evaluate', {
        expression: `fetch('/dsh-appearances/state-save.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:{enabled:true,mode:'scene',scene:'${scene}',surfaces:{enabled:true,sidebar:66,conversation:58,composer:86,header:78,right:66},dim:0.28,blur:0,speed:1,saturation:1,quality:'auto'}})}).then(r=>r.json()).then(j=>j.ok)`,
        returnByValue: true, awaitPromise: true,
      });
      await sleep(3200); // 等轮询采纳 + 渲染器冷启
      const res = await send('Runtime.evaluate', {
        expression: `(()=>{
          const layer=document.getElementById('dsh-ap-layer');
          const canvas=layer&&layer.querySelector('canvas');
          const host=layer&&layer.children[0]&&layer.children[0].children[0];
          return JSON.stringify({
            canvas: !!canvas,
            canvasSize: canvas?canvas.width+'x'+canvas.height:'-',
            hostChildren: host?host.children.length:0,
            fallback: host?/失败|加载|选择/.test(host.textContent||''):false,
          });
        })()`,
        returnByValue: true,
      });
      console.log(scene, '->', res.result.value);
    }
  } catch (e) { console.error('ERR', e.message); }
  ws.close(); process.exit(0);
};
setTimeout(() => { console.error('timeout'); process.exit(1); }, 120000);
