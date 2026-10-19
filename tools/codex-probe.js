// ChatGPT/Codex 桌面版（Code-Codex 启动器）状态探针
// usage: node tools/codex-probe.js <port> <targetId> [expr]
// expr 缺省时输出综合状态；否则 evaluate 给定表达式（returnByValue）
const port = process.argv[2];
const targetId = process.argv[3];
const expr = process.argv[4];
if (!port || !targetId) { console.error('usage: node tools/codex-probe.js <port> <targetId> [expr]'); process.exit(1); }
const ws = new WebSocket(`ws://127.0.0.1:${port}/devtools/page/${targetId}`);
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
ws.onopen = async () => {
  try {
    const expression = expr || `(()=>{
      const tag = document.documentElement.outerHTML.match(/code-codex-v[\\w-]+/);
      return JSON.stringify({
        url: location.href,
        title: document.title,
        codeCodexInject: typeof window.__codeCodexInject,
        runtimeOwner: !!(window.__codeCodexRuntimeOwner && window.__codeCodexRuntimeOwner.version),
        explorerTag: tag ? tag[0] : null,
        explorerConnected: tag ? !!document.querySelector(tag[0]) : false,
        backgroundRegistry: !!(window[Symbol.for('code-codex:background-modules:v1')]),
        registeredModules: (()=>{const r=window[Symbol.for('code-codex:background-modules:v1')];return r?[...r.keys()]:[]})(),
        bodyText: (document.body.innerText||'').replace(/\\s+/g,' ').slice(0, 300),
      });
    })()`;
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) console.error('PAGE-ERR', JSON.stringify(r.exceptionDetails).slice(0, 300));
    console.log(r.result.value !== undefined ? r.result.value : JSON.stringify(r.result));
  } catch (e) { console.error('ERR', e.message); }
  try { ws.close(); } catch (e) {}
  process.exit(0);
};
