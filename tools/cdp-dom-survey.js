// 挖 DSH 页面布局表面：找导航栏/会话侧栏/对话主区/输入框/标题栏的稳定选择器
const targetId = process.argv[2];
if (!targetId) { console.error('usage: node tools/cdp-dom-survey.js <targetId>'); process.exit(1); }
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
    await sleep(3000);
    const r = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(()=>{
        const out = { dataAttrs: {}, regions: [] };
        // ① 全页面扫 data-* 属性（composer 系已知，找布局级的）
        const attrCount = new Map();
        for (const el of document.querySelectorAll('body *')) {
          for (const a of el.attributes) {
            if (a.name.startsWith('data-')) {
              const key = a.name + (a.value ? '=' + a.value.slice(0,24) : '');
              attrCount.set(key, (attrCount.get(key)||0)+1);
            }
          }
        }
        out.dataAttrs = [...attrCount.entries()].filter(([k,c])=>c<=40).sort((a,b)=>b[1]-a[1]).slice(0, 60);
        // ② 直接子层级结构：body/#root 的前几层
        function path(el){ const p=[]; let e=el; while(e && e!==document.body && p.length<6){ let s=e.tagName.toLowerCase(); if(e.id)s+='#'+e.id; if(e.className&&typeof e.className==='string')s+='.'+e.className.trim().split(/\\s+/).slice(0,2).join('.'); p.unshift(s); e=e.parentElement; } return p.join('>'); }
        // 找大块表面：视口尺寸级别/半屏级别的元素及其背景色
        const vw = innerWidth, vh = innerHeight;
        const big = [];
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width < vw*0.18 || r.height < vh*0.5) continue;
          const cs = getComputedStyle(el);
          if (cs.display==='none' || cs.visibility==='hidden') continue;
          const bg = cs.backgroundColor;
          if (!bg || bg==='rgba(0, 0, 0, 0)' || bg==='transparent') continue;
          const cls = typeof el.className==='string' ? el.className.trim().split(/\\s+/).slice(0,3).join(' ') : '';
          const attrs = [...el.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name).join(',');
          big.push({ path: path(el), rect: [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)], bg, pos: cs.position, cls: cls.slice(0,60), attrs });
          if (big.length>25) break;
        }
        out.regions = big;
        return JSON.stringify(out, null, 1);
      })()`,
    });
    console.log(r.result.value);
  } catch (e) { console.error('ERR', e.message); }
  ws.close(); process.exit(0);
};
setTimeout(() => { console.error('timeout'); process.exit(1); }, 30000);
