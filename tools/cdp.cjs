// 极简 CDP 页面助手：node tools/cdp.cjs 共享 require 用
// usage: const cdp = require('./cdp.cjs'); await cdp.withPage(targetId, async (ev, send) => { ... });
function connect(targetId) {
  let seq = 0;
  const pending = new Map();
  const listeners = [];
  const ws = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
  const ready = new Promise((res, rej) => { ws.onopen = () => res(); ws.onerror = () => rej(new Error('ws error')); });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) p.rej(new Error(JSON.stringify(m.error)));
      else p.res(m.result);
    } else if (m.method && listeners.length) {
      for (const fn of listeners) fn(m);
    }
  };
  async function send(method, params) {
    await ready;
    return new Promise((res, rej) => {
      const m = ++seq;
      pending.set(m, { res, rej });
      ws.send(JSON.stringify({ id: m, method, params: params || {} }));
    });
  }
  async function ev(expression) {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails).slice(0, 500));
    return r.result.value;
  }
  return {
    ready, send, ev,
    onEvent: (fn) => listeners.push(fn),
    close: () => { try { ws.close(); } catch (e) {} },
  };
}

async function withPage(targetId, fn) {
  const c = connect(targetId);
  try {
    await c.ready;
    await c.send('Runtime.enable');
    return await fn(c.ev, c);
  } finally {
    c.close();
    setTimeout(() => process.exit(0), 50);
  }
}

module.exports = { connect, withPage };
