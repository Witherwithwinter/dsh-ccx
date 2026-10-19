// 面板交互端到端验证（需桌面端以 --remote-debugging-port=9222 启动）
// 用法: node tools/cdp-panel-test.js <pageTargetId>
const targetId = process.argv[2];
if (!targetId) { console.error('usage: node tools/cdp-panel-test.js <targetId>'); process.exit(1); }

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
    const ev = async (expr, awaitP) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: !!awaitP });
      return r.result.value;
    };
    // 等插件 apply 完成
    for (let i = 0; i < 12; i++) {
      if (await ev('!!document.getElementById("dsh-ap-panel")')) break;
      await sleep(1000);
    }
    console.log('1. panel mounted:', await ev('!!document.getElementById("dsh-ap-panel")'));
    console.log('2. open:', await ev('(()=>{const sh=document.getElementById("dsh-ap-panel").shadowRoot;sh.querySelector(".trigger").click();return sh.querySelector(".panel").classList.contains("open")})()'));
    console.log('   preview canvas:', await ev('(()=>{const sh=document.getElementById("dsh-ap-panel").shadowRoot;const c=sh.querySelector(".p-stage canvas");return c ? c.width+"x"+c.height : "MISSING"})()'));
    // 模拟真实点击：场景卡片（点击后面板必须保持打开 —— 本次修复的核心）
    console.log('3. click starfield scene, panel still open:', await ev('(()=>{const sh=document.getElementById("dsh-ap-panel").shadowRoot;sh.querySelector("button[data-scene=starfield]").click();return sh.querySelector(".panel").classList.contains("open")})()'));
    await sleep(800);
    console.log('   panel open after 800ms:', await ev('document.getElementById("dsh-ap-panel").shadowRoot.querySelector(".panel").classList.contains("open")'));
    console.log('   scene chip .on:', await ev('document.getElementById("dsh-ap-panel").shadowRoot.querySelector("button[data-scene=starfield]").classList.contains("on")'));
    // 模拟滑杆拖动：表面不透明度 -> 30
    console.log('4. drag surfaceOpacity to 30 ->', await ev('(()=>{const sh=document.getElementById("dsh-ap-panel").shadowRoot;const inp=sh.querySelector("input[data-slider=surfaceOpacity]");inp.value="30";inp.dispatchEvent(new Event("input",{bubbles:true}));return sh.querySelector("output[data-val=surfaceOpacity]").textContent})()'));
    await sleep(900);
    // 验证已持久化到宿主（经页面 fetch 走 dsh-app 协议）
    console.log('5. persisted state:', await ev("fetch('/dsh-appearances/state.json').then(r=>r.json()).then(j=>JSON.stringify({scene:j.settings.scene,opacity:j.settings.surfaceOpacity}))", true));
    console.log('   body token override:', await ev('getComputedStyle(document.body).getPropertyValue("--dsw-alias-bg-base").trim()'));
    // 面板内点分组标题，确认不误关
    console.log('6. click group title, panel open:', await ev('(()=>{const sh=document.getElementById("dsh-ap-panel").shadowRoot;sh.querySelector(".p-gtitle").click();return sh.querySelector(".panel").classList.contains("open")})()'));
    // Esc 关闭
    console.log('7. Esc closes:', await ev('(()=>{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return !document.getElementById("dsh-ap-panel").shadowRoot.querySelector(".panel").classList.contains("open")})()'));
    // 重新打开供截图
    await ev('document.getElementById("dsh-ap-panel").shadowRoot.querySelector(".trigger").click()');
    console.log('8. reopened for screenshot:', await ev('document.getElementById("dsh-ap-panel").shadowRoot.querySelector(".panel").classList.contains("open")'));
  } catch (e) {
    console.error('ERR', e.message);
  }
  ws.close();
  process.exit(0);
};
setTimeout(() => { console.error('timeout'); process.exit(1); }, 45000);
