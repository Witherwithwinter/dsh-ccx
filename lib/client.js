window.__ModuleLoader__.load({
	id: "dsh-ccx",
	factory: function (require) {
		var module = { exports: {} };
		var exports = module.exports;
"use strict";var Ge=Object.defineProperty;var Fr=Object.getOwnPropertyDescriptor;var jr=Object.getOwnPropertyNames;var qr=Object.prototype.hasOwnProperty;var Vr=(e,t,r)=>t in e?Ge(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var Gr=(e,t)=>{for(var r in t)Ge(e,r,{get:t[r],enumerable:!0})},Wr=(e,t,r,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of jr(t))!qr.call(e,n)&&n!==r&&Ge(e,n,{get:()=>t[n],enumerable:!(o=Fr(t,n))||o.enumerable});return e};var Kr=e=>Wr(Ge({},"__esModule",{value:!0}),e);var D=(e,t,r)=>Vr(e,typeof t!="symbol"?t+"":t,r);var _n={};Gr(_n,{apply:()=>Nn,inject:()=>In});module.exports=Kr(_n);var Wt="dsh-ccx",Y="/dsh-appearances",pe=[{id:"milky-way",label:"\u94F6\u6CB3",en:"Milky Way",cardTitle:"Milky Way Background",icon:"milky-way",ext:"",layerBg:"#02090d",storeKey:"code-codex:milky-way-background:v1"},{id:"glow-horizon",label:"\u8F89\u5149\u5730\u5E73\u7EBF",en:"Glow Horizon",cardTitle:"Glow Horizon Background",icon:"glow-horizon",ext:"ext-glowhorizon",layerBg:"#050507",storeKey:"code-codex:glow-horizon-background:v1"},{id:"mountain",label:"\u5C42\u5CE6",en:"Layered Mountain",cardTitle:"Layered Mountain Background",icon:"mountain",ext:"",layerBg:"#02090d",storeKey:"code-codex:mountain-settings:v1"},{id:"heavenly-cloud",label:"\u4E91\u7A79",en:"Heavenly Cloud",cardTitle:"Heavenly Cloud Background",icon:"heavenly-cloud",ext:"ext-heavenlycloud",layerBg:"#020408",storeKey:"code-codex:heavenly-cloud-background:v1"},{id:"aurora-ionosphere",label:"\u6781\u5149\u7535\u79BB\u5C42",en:"Aurora Ionosphere",cardTitle:"Aurora Ionosphere Background",icon:"aurora-ionosphere",ext:"",layerBg:"#02090d",storeKey:"code-codex:aurora-ionosphere-background:v1"},{id:"black-hole",label:"\u9ED1\u6D1E",en:"Black Hole",cardTitle:"Black Hole Background",icon:"black-hole",ext:"ext-blackhole",layerBg:"#000000",storeKey:"code-codex:black-hole-background:v1"},{id:"cloud-train",label:"\u4E91\u5217\u8F66",en:"Cloud Train",cardTitle:"Cloud Train Background",icon:"cloud-train",ext:"",layerBg:"#02090d",storeKey:"code-codex:cloud-train-settings:v1"},{id:"particle-image",label:"\u7C92\u5B50\u6210\u50CF",en:"Particle Image",cardTitle:"Particle Image Background",icon:"particle-image",ext:"ext-particle",layerBg:"#000000",bgColorKey:"backgroundColor",storeKey:"code-codex:particle-image-background:v1"},{id:"pixel-sculpt",label:"\u50CF\u7D20\u96D5\u5851",en:"Pixel Sculpt",cardTitle:"Pixel Sculpt Background",icon:"pixel-sculpt",ext:"",layerBg:"#02090d",storeKey:"code-codex:pixel-sculpt-settings:v1"},{id:"blinking-squares",label:"\u95EA\u70C1\u65B9\u5757",en:"Blinking Squares",cardTitle:"Blinking Squares Background",icon:"blinking-squares",ext:"",layerBg:"#000000",bgColorKey:"backgroundColor",storeKey:"code-codex:blinking-squares-background:v1"},{id:"ascii-tiles",label:"ASCII \u5B57\u7B26\u7816\u5757",en:"ASCII Tiles",cardTitle:"ASCII Tiles Background",icon:"ascii-tiles",ext:"ext-asciitiles",layerBg:"#000000",bgColorKey:"backgroundColor",storeKey:"code-codex:ascii-tiles-background:v1"},{id:"shallow-ocean",label:"\u6D45\u6D77\u6765\u4FE1",en:"Shallow Ocean Letters",cardTitle:"Shallow Ocean Letters Background",icon:"shallow-ocean",ext:"ext-shallowocean",layerBg:"#181818",storeKey:"code-codex:shallow-ocean-background:v1"},{id:"spectral-drape",label:"\u5149\u8C31\u70B9\u9635\u5E37\u5E55",en:"Spectral Drape",cardTitle:"Spectral Drape Background",icon:"spectral-drape",ext:"ext-spectraldrape",layerBg:"#0a0a0a",bgColorKey:"backgroundColor",storeKey:"code-codex:spectral-drape-background:v1"}],Q=pe.map(e=>e.id),Fn=Object.fromEntries(pe.map(e=>[e.id,e])),We={"particle-image":!0,"pixel-sculpt":!0},de=Object.fromEntries(pe.map(e=>[e.id,e.storeKey])),Kt=Object.fromEntries(pe.map(e=>[e.id,e.layerBg])),Ce=["sidebar","conversation","composer","right"],H=Object.freeze({version:6,enabled:!0,mode:"scene",scene:"milky-way",wallpaperId:null,wallpaperFit:"cover",wallpaperPosition:"center",surfaces:Object.freeze({enabled:!0,sidebar:66,conversation:58,composer:86,right:66}),sceneParams:{},dim:0,blur:0,savedAt:0}),Ke={dim:[0,.8],blur:[0,20]};var Yt=200*1024*1024,Ut=[["manta","Manta","\u8760\u9CBC"],["eagle","Eagle ray","\u6591\u70B9\u9E5E\u9CBC"],["stingray","Stingray","\u84DD\u6591\u9B5F"],["turtle","Sea turtle","\u6D77\u9F9F"],["moon","Moon jelly","\u6D77\u6708\u6C34\u6BCD"],["nettle","Sea nettle","\u9EC4\u91D1\u6C34\u6BCD"],["silver","Silver school","\u94F6\u8272\u9C7C\u7FA4"],["reef","Reef fish","\u73CA\u745A\u9C7C"],["clown","Clownfish","\u5C0F\u4E11\u9C7C"],["shark","Reef shark","\u7901\u9CA8"]],Pe=[["school","Fish migration","\u9C7C\u7FA4\u8FC7\u5883"],["dolphin","Dolphin visit","\u6D77\u8C5A\u6765\u8BBF"],["storm","Storm","\u98CE\u66B4"],["meteor","Meteor fall","\u9668\u77F3\u5760\u843D"],["duo","Drifting companions","\u6F02\u6D41\u4F19\u4F34"]],Jt=[["Automatic","\u81EA\u52A8"],["Low quality","\u4F4E\u753B\u8D28"],["Medium quality","\u4E2D\u753B\u8D28"],["High quality","\u9AD8\u753B\u8D28"]];function $(e,t,r){return Math.min(r,Math.max(t,e))}function E(e,t){let r=Number(e);return Number.isFinite(r)?r:t}function Yr(e){let t=e&&typeof e=="object"?e:{},r={...H.surfaces};r.enabled=t.enabled===!0;for(let o of Ce){let n=Number(t[o]);Number.isFinite(n)&&(r[o]=Math.round($(n,0,100)))}return r}function ue(e){let t=e&&typeof e=="object"?e:{},r={...H,surfaces:{...H.surfaces},sceneParams:{}};typeof t.enabled=="boolean"&&(r.enabled=t.enabled),(t.mode==="scene"||t.mode==="wallpaper"||t.mode==="off")&&(r.mode=t.mode),typeof t.scene=="string"&&Q.includes(t.scene)&&(r.scene=t.scene),typeof t.wallpaperId=="string"&&/^[\w-]+$/.test(t.wallpaperId)?r.wallpaperId=t.wallpaperId:t.wallpaperId===null&&(r.wallpaperId=null),(t.wallpaperFit==="cover"||t.wallpaperFit==="contain"||t.wallpaperFit==="tile")&&(r.wallpaperFit=t.wallpaperFit),(t.wallpaperPosition==="center"||t.wallpaperPosition==="top"||t.wallpaperPosition==="bottom"||t.wallpaperPosition==="left"||t.wallpaperPosition==="right")&&(r.wallpaperPosition=t.wallpaperPosition);for(let i of Object.keys(Ke)){let l=Number(t[i]);Number.isFinite(l)&&(r[i]=$(l,Ke[i][0],Ke[i][1]))}let o=t.surfaces;if(!o&&Number.isFinite(Number(t.surfaceOpacity))){let i=Math.round($(Number(t.surfaceOpacity),.05,1)*100);o={enabled:!0,sidebar:i,conversation:i,composer:Math.min(100,i+20),right:i}}let n=t.sceneParams&&typeof t.sceneParams=="object"?t.sceneParams:{},a={};for(let i of Object.keys(n)){if(!/^[a-z-]+$/.test(i))continue;let l=n[i];l&&typeof l=="object"&&!Array.isArray(l)&&(a[i]={...l})}return r.sceneParams=a,r.surfaces=Yr(o),Number(t.version)<6&&r.surfaces.composer===58&&(r.surfaces.composer=86),Number.isFinite(Number(t.savedAt))&&(r.savedAt=Number(t.savedAt)),r}function gt(e){return e?{enabled:e.enabled,mode:e.mode,scene:e.scene,wallpaperId:e.wallpaperId,wallpaperFit:e.wallpaperFit,wallpaperPosition:e.wallpaperPosition,surfaces:e.surfaces,dim:e.dim,blur:e.blur,sceneParams:e.sceneParams}:null}function Ae(e){return fetch(Y+e,{credentials:"omit"}).then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()})}function Te(e,t){return fetch(Y+e,{method:"POST",credentials:"omit",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then(async r=>{let o=await r.json();if(!r.ok&&o&&typeof o=="object"&&!("ok"in o))throw new Error(`HTTP ${r.status}`);return o})}function Xt(e,t){return fetch(`${Y}/wallpaper-upload?name=${encodeURIComponent(e)}`,{method:"POST",credentials:"omit",headers:{"Content-Type":"application/octet-stream"},body:t}).then(r=>r.json())}function mt(){return Ae("/state.json")}var Z=null,Ye=null;function Qt(){return Z}function L(e){return Z&&Z[e]?Z[e]:null}function Zt(){return Z?Promise.resolve(Z):(Ye||(Ye=Ae("/scene-schemas.json").then(e=>(Z=e&&typeof e=="object"?e:{},Z)).catch(()=>(Ye=null,{}))),Ye)}var $e=null,Ue=null;function er(){return $e}function ft(){return $e?Promise.resolve($e):(Ue||(Ue=Ae("/vendor-shallow-ocean-thumbs.json").then(e=>($e=e&&typeof e=="object"?e:{},$e)).catch(()=>(Ue=null,{}))),Ue)}var A=null,U=null,ht=null,te=null,Je=0;function Ur(){let e=document.querySelector('[data-slot="main"]'),t=e?e.parentElement:null;for(let r=0;r<4&&t;r++){let o=parseFloat(getComputedStyle(t).borderTopLeftRadius);if(Number.isFinite(o)&&o>0)return{col:t,radius:o};t=t.parentElement}return null}function re(e,t){if(te&&(clearTimeout(te),te=null),!!!(e&&e.enabled&&e.mode!=="off"&&e.surfaces&&e.surfaces.enabled)||!t){A&&(A.style.display="none");return}let o=Ur();if(!o){A&&(A.style.display="none"),Je<30&&(Je++,te=setTimeout(()=>re(e,t),1e3));return}Je=0;let{col:n,radius:a}=o;(!A||!t.contains(A))&&(A=document.createElement("div"),A.id="dsh-ap-corner",A.style.cssText="position:absolute;left:0;top:0;pointer-events:none;corner-shape:round;",t.appendChild(A));let i=n.getBoundingClientRect(),l=$(E(e?.surfaces?.sidebar,66),0,100)/100,p=document.body?.hasAttribute("data-ds-dark-theme")??!0?"16,17,20":"249,250,251",d=`radial-gradient(circle ${a}px at 100% 100%, transparent 0, transparent ${(a-.6).toFixed(1)}px, #000 ${a}px)`;A.style.display="block",A.style.left=`${i.x}px`,A.style.top=`${i.y}px`,A.style.width=`${a}px`,A.style.height=`${a}px`,A.style.background=`rgba(${p},${l.toFixed(3)})`,A.style.webkitMaskImage=d,A.style.maskImage=d,U&&ht!==n&&(U.disconnect(),U=null),U||(U=new ResizeObserver(()=>re(e,t)),U.observe(n),ht=n)}function Xe(){te&&(clearTimeout(te),te=null),U&&(U.disconnect(),U=null),ht=null,Je=0,A&&(A.style.display="none")}var Ze="dsh-ap-layer",bt="dsh-ap-dim",Jr="dsh-ap-surface-style",xt=[{key:"sidebar",zh:"\u4F1A\u8BDD\u4FA7\u680F",en:"Sidebar",selector:'div:has(> [data-slot="sidebar"])',baseVar:"--ap-base-sidebar"},{key:"conversation",zh:"\u5BF9\u8BDD\u533A",en:"Conversation",selector:'div:has(> [data-slot="main"])',baseVar:"--ap-base-main"},{key:"composer",zh:"\u6D88\u606F\u8F93\u5165\u533A",en:"Composer",selector:"[data-composer-card]",baseVar:"--ap-base-main"},{key:"right",zh:"\u53F3\u4FA7\u680F",en:"Right panel",selector:':is([data-rightbar-col], div:has(> [data-slot="rightbar"]))',baseVar:"--ap-base-sidebar"}],ee=null,Qe="";function Xr(){if(Qe)return Qe;let e='body > #root :where(div,main,aside,section,article,header,footer,nav,form,dialog,ul,ol,li,button,input,textarea,select):not([role="img"]):not([data-icon]):not([class*="icon" i])',t="background-color:transparent !important;-webkit-backdrop-filter:none !important;backdrop-filter:none !important",o=["@layer dsh-ap-clear, dsh-ap-masks, dsh-ap-assert;","@layer dsh-ap-clear {","html[data-ap-bg]{background-color:transparent !important;--ap-base-sidebar:249,250,251;--ap-base-main:255,255,255}","html[data-ap-bg] body:has([data-ds-dark-theme]),html[data-ap-bg] body[data-ds-dark-theme]{--ap-base-sidebar:16,17,20;--ap-base-main:11,12,15}","html[data-ap-bg] body,html[data-ap-bg] body > #root{isolation:isolate;background-color:transparent !important}",`html[data-ap-bg][data-ap-masks] ${e}{${t}}`,`html[data-ap-bg]:not([data-ap-masks]) ${e}:not([data-composer-card]):not([data-composer-card] *){${t}}`,"html[data-ap-bg][data-windows-titlebar] body > #root > div::before{background:transparent !important}",'html[data-ap-bg][data-windows-titlebar] body > span[style*="--dsw-specific-sidebar-fill"]{background-color:transparent !important}','html[data-ap-bg] body > #root [data-composer-seat],html[data-ap-bg] body > #root div:has(> [data-slot="conversation.input.dock"]){background:none !important;background-image:none !important}','html[data-ap-bg] body > #root :is([class*="bg-gradient"],[class*="TopFade"],[class*="fade" i]){background-image:none !important}',"}","@layer dsh-ap-masks {"];for(let n of xt)o.push(`html[data-ap-masks] body > #root ${n.selector}{background-color:rgba(var(${n.baseVar}),var(--ap-mask-${n.key})) !important}`);return o.push("html[data-ap-masks][data-windows-titlebar] body > #root > div::before{background-color:rgba(var(--ap-base-sidebar),var(--ap-mask-sidebar)) !important}","html[data-ap-masks] body > #root [data-composer-card]{box-shadow:none !important}","}","@layer dsh-ap-assert {",`html[data-ap-bg] body > div#${Ze}{background:var(--ap-layer-bg,#000) !important}`,`html[data-ap-bg] body > div#${Ze} > div#${bt}{background:var(--ap-dim-bg,transparent) !important}`,"}"),Qe=o.join(`
`),Qe}function et(e,t){let r=document.documentElement;for(let o of Ce){let n=e?.surfaces?$(E(e.surfaces[o],66),0,100)/100:0;r.style.setProperty(`--ap-mask-${o}`,n.toFixed(3))}re(e,t)}function vt(e,t){let r=!!(e&&e.enabled&&e.mode!=="off"),o=r&&!!e?.surfaces?.enabled,n=document.documentElement;if(!r){yt();return}(!ee||!document.head.contains(ee))&&(ee=document.createElement("style"),ee.id=Jr,ee.setAttribute("data-dsh-ccx","surface"),(document.head||document.documentElement).appendChild(ee));let a=Xr();ee.textContent!==a&&(ee.textContent=a),n.setAttribute("data-ap-bg","true"),et(e,t),o?n.setAttribute("data-ap-masks","true"):n.removeAttribute("data-ap-masks")}function yt(){let e=document.documentElement;e.removeAttribute("data-ap-bg"),e.removeAttribute("data-ap-masks");for(let t of Ce)try{e.style.removeProperty(`--ap-mask-${t}`)}catch{}Xe()}var Qr=4e3,Zr=/^#[\da-fA-F]{6}$/,F=null,V=null,tt=new Set;function J(){if(F&&document.body&&document.body.contains(F.layer))return F;let e=document.createElement("div");e.id=Ze,e.setAttribute("data-dsh-ccx","background"),e.style.cssText="position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;width:100vw;height:100vh;margin:0;padding:0;contain:strict;background:#000;--ap-layer-bg:#000;";let t=document.createElement("div");t.style.cssText="position:absolute;inset:0;overflow:hidden;";let r=document.createElement("div");r.style.cssText="position:absolute;inset:0;";let o=document.createElement("div");return o.id=bt,o.style.cssText="position:absolute;inset:0;background:transparent;--ap-dim-bg:transparent;",t.appendChild(r),e.appendChild(t),e.appendChild(o),(document.body||document.documentElement).prepend(e),F={layer:e,bgWrap:t,bgHost:r,dimEl:o},F}function ge(){return F}function tr(e){let{layer:t}=J();t.style.setProperty("--ap-layer-bg",e||"#000000")}function rt(e,t){if(e==="particle-image"||e==="blinking-squares"||e==="ascii-tiles"||e==="spectral-drape"){let r=t?.sceneParams?.[e],o=r&&typeof r.backgroundColor=="string"?r.backgroundColor:null;if(o&&Zr.test(o))return o}return Kt[e]||"#000000"}function Le(){let{bgHost:e}=J(),t=document.createElement("div");return t.style.cssText="position:absolute;inset:0;",e.appendChild(t),V=t,t}function wt(){let{bgHost:e}=J();return!V||!e.contains(V)?Le():V}function rr(){return V}function ne(e){try{let t=e.querySelectorAll("video");for(let r=0;r<t.length;r++){let o=t[r];try{o.pause(),o.removeAttribute("src"),o.load()}catch{}}}catch{}}function nr(e){if(!e)return;e===V&&(V=null);try{e.style.visibility="hidden",e.style.pointerEvents="none"}catch{}ne(e);let t=setTimeout(()=>{tt.delete(t);try{e.parentNode?.removeChild(e)}catch{}},Qr);tt.add(t)}function me(e){let t=wt();ne(t),t.textContent="";let r=document.createElement("div");r.style.cssText="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#4d5a78;font-size:13px;font-family:system-ui,sans-serif;background:radial-gradient(120% 90% at 50% 110%,#101a33 0%,#07090f 60%);",r.textContent=e||"",t.appendChild(r)}function or(e){let{layer:t,bgWrap:r,dimEl:o}=J(),n=e.enabled&&e.mode!=="off";t.style.display=n?"":"none";let a=$(E(e.blur,0),0,20);r.style.filter=a>0?`blur(${a}px)`:"",r.style.transform=a>0?`scale(${(1+Math.min(.08,a*.006)).toFixed(3)})`:"";let i=n?$(E(e.dim,0),0,.8):0,l=n?`rgba(3,6,14,${i.toFixed(3)})`:"transparent";o.style.background=l,o.style.setProperty("--ap-dim-bg",l)}function ar(){for(let e of tt)clearTimeout(e);if(tt.clear(),V&&(ne(V),V=null),F){ne(F.layer);try{F.layer.parentNode?.removeChild(F.layer)}catch{}F=null}}var en=Symbol.for("code-codex:background-modules:v1"),ir=Symbol.for("code-codex:default-galleries:v1"),St=new Map,kt=new Map,Et=new Map;function nt(){let e=window[en];return e instanceof Map?e:null}function tn(e){let t=new Uint8Array(e),r=[],o=32768;for(let n=0;n<t.length;n+=o)r.push(String.fromCharCode(...t.subarray(n,n+o)));return btoa(r.join(""))}async function lr(e){let t=await fetch(`${Y}/vendor-media?file=${encodeURIComponent(e)}`,{credentials:"omit"});if(!t.ok)throw new Error(`media HTTP ${t.status}`);return tn(await t.arrayBuffer())}function fe(e){let t=nt()?.get(e);if(t)return Promise.resolve(t);let r=kt.get(e);if(r)return r;let o=new Promise((n,a)=>{let i=!1,l=null,s=0,p=()=>{l&&(clearInterval(l),l=null)},d=u=>{i||(i=!0,p(),n(u))},h=u=>{i||(i=!0,p(),kt.delete(e),St.delete(e),a(u))},b=()=>{let u=nt()?.get(e);return u?(d(u),!0):!1},c=St.get(e);c||(c=document.createElement("script"),c.src=`${Y}/vendor/${encodeURIComponent(e)}.js`,c.onload=()=>{b()||setTimeout(()=>{!i&&!b()&&h(new Error(`vendor registry missing after load: ${e}`))},120)},c.onerror=()=>{h(new Error(`vendor script load failed: ${e}`))},St.set(e,c),(document.head||document.documentElement).appendChild(c)),l=setInterval(()=>{b()||++s>150&&h(new Error(`registry timeout: ${e}`))},60)});return kt.set(e,o),o}function ot(e){let t=Et.get(e);if(t)return t;let r=(async()=>{let n=(await Ae("/vendor-galleries.json"))?.[e];if(!n)throw new Error(`gallery index missing: ${e}`);let a=await Promise.all(n.images.map(async p=>{let d=await lr(p.dataFile),h={id:p.id,name:p.name,type:p.type,size:p.size,sha256:p.sha256,data:d,createdAt:p.createdAt||0};return p.thumbFile&&(h.thumbnail=await lr(p.thumbFile)),h})),i=new Map;for(let p of a)i.set(p.id,p);let l=window;return(l[ir]=l[ir]||new Map).set(e,{count:n.count,version:n.version,images:i}),!0})().catch(o=>{throw Et.delete(e),o});return Et.set(e,r),r}function sr(e){if(!e)return!1;let t=e.selectedImageIds;return!!(Array.isArray(t)&&t.length>0||e.activeImageId)}function cr(e){if(e!=="particle-image")return Promise.resolve(null);let t=de[e];return t?new Promise(r=>{let o=!1,n=()=>{o||(o=!0,r(null))};try{let a=localStorage.getItem(t);if(a&&sr(JSON.parse(a))){n();return}}catch{}try{let a=indexedDB.open("code-codex-particle-image-background");a.onupgradeneeded=()=>{try{a.transaction?.abort()}catch{}n()},a.onsuccess=()=>{let i=a.result,l=!1,s=()=>{try{i.close()}catch{}};try{let p=i.transaction("images","readonly").objectStore("images").getAll();p.onsuccess=()=>{if(s(),l)return;l=!0;let d=(p.result||[]).filter(b=>b&&b.id!=="__codeCodex_default_media_v1__"&&(b.blob||b.file));if(!d.length){n();return}d.sort((b,c)=>Number(b.createdAt||0)-Number(c.createdAt||0));let h={};try{h=JSON.parse(localStorage.getItem(t)||"{}")||{}}catch{h={}}if(!sr(h)){h.selectedImageIds=d.map(b=>b.id),h.activeImageId=d[0].id;try{localStorage.setItem(t,JSON.stringify(h))}catch{}}n()},p.onerror=()=>{s(),l||(l=!0,n())}}catch{s(),n()}},a.onerror=n,a.onblocked=n,setTimeout(n,3e3)}catch{n()}}):Promise.resolve(null)}var j=null;function ze(e){return!!(e&&e.enabled&&e.mode==="scene"&&e.scene==="pixel-sculpt")}function Re(e){let t=e?.sceneParams?.["pixel-sculpt"];return!!(t&&typeof t=="object"&&t.paused)}function Be(){return j}function Mt(e,t){if(j)return j.ready;let r=document.createElement("div");r.style.cssText="position:absolute;inset:0;";let o=document.createElement("canvas");o.style.cssText="width:100%;height:100%;display:block",r.appendChild(o);let n={stage:r,canvas:o,inst:null,ready:null};return n.ready=ot("pixel-sculpt").catch(()=>null).then(()=>fe("pixel-sculpt")).then(a=>{let i=a.prepareDefaults?a.prepareDefaults():null;return Promise.resolve(i).catch(()=>null).then(()=>{let l=a.exports?.PixelSculptRenderer;if(typeof l!="function")throw new Error("PixelSculptRenderer \u4E0D\u53EF\u7528");return n.inst=new l(r,o,null,s=>{s&&ze(e())&&t(`Pixel Sculpt\uFF1A${String(s).slice(0,60)}`,!0)},!0),n})}),n.ready.catch(()=>{j===n&&(j=null)}),j=n,n.ready}function pr(e,t,r,o,n,a){Mt(t,r).then(i=>{if(!o()||!ze(t()))return;e.appendChild(i.stage);try{i.inst?.setActive(!0,{paused:Re(t())})}catch{}n({setSettings:s=>{try{i.inst?.setSettings(s||{})}catch{}},reset:()=>{try{i.inst?.reset()}catch{}},replay:()=>{try{i.inst?.replay()}catch{}},dispose:()=>{try{i.stage.parentNode?.removeChild(i.stage)}catch{}try{i.inst?.setActive(!1,{paused:Re(t())})}catch{}}})}).catch(i=>{o()&&a(i)})}function dr(){if(j){try{j.inst?.setActive(!1,{paused:!0})}catch{}try{j.stage.parentNode?.removeChild(j.stage)}catch{}j=null}}var ur="code-codex:shallow-ocean-events:v1",he=Pe.map(e=>e[0]);function Ct(e){let t=e&&typeof e=="object"?e:{},r=n=>he.filter(a=>Array.isArray(n)&&n.includes(a)),o=r(t.discovered);return{discovered:o,excluded:o.length===he.length?r(t.excluded):[]}}var Pt=class{constructor(){D(this,"current");D(this,"listeners",new Set);try{let t=localStorage.getItem(ur)??"{}";this.current=Ct(JSON.parse(t))}catch{this.current=Ct(null)}}get state(){return{discovered:[...this.current.discovered],excluded:[...this.current.excluded]}}get included(){return he.filter(t=>!this.current.excluded.includes(t))}subscribe(t){return this.listeners.add(t),()=>{this.listeners.delete(t)}}discover(t){!he.includes(t)||this.current.discovered.includes(t)||this.commit({...this.current,discovered:[...this.current.discovered,t]})}toggle(t){if(this.current.discovered.length!==he.length||!he.includes(t))return;let r=this.current.excluded.includes(t)?this.current.excluded.filter(o=>o!==t):[...this.current.excluded,t];this.commit({...this.current,excluded:r})}commit(t){let r=Ct(t);try{localStorage.setItem(ur,JSON.stringify(r))}catch{}this.current=r;for(let o of this.listeners)try{o()}catch{}}},$t=class{constructor(){D(this,"journal",new Pt);D(this,"devMode",!1);D(this,"populationGeneration",0);D(this,"populationQueue",Promise.resolve());D(this,"renderer",null);D(this,"currentSettings",{});D(this,"listeners",new Set);D(this,"syncCallback",null)}get developerMode(){return this.devMode}get hasRenderer(){return this.renderer!==null}get eventJournal(){return this.journal.state}setSyncCallback(t){this.syncCallback=t}subscribe(t){this.listeners.add(t);let r=this.journal.subscribe(t);return()=>{this.listeners.delete(t),r()}}notify(){for(let t of this.listeners)try{t()}catch{}}setDeveloperMode(t){this.devMode!==t&&(this.devMode=t,this.applyEffectiveSettings(),this.notify())}toggleEvent(t){this.journal.toggle(t)}effectiveSettings(t){return this.devMode?{...t,eventsEnabled:0}:{...t}}applyEffectiveSettings(){try{this.renderer?.setSettings?.(this.effectiveSettings(this.currentSettings))}catch{}}async mount(t,r,o,n){this.currentSettings={...r};let a=await fe("shallow-ocean");if(!n())throw new Error("stale mount");let i=a.exports?.ShallowOceanRenderer;if(typeof i!="function"){let p=a.startup(t,o);return this.renderer=p,this.notify(),p}t.setAttribute("data-code-codex-shallow-ocean-layer","true");let l=document.createElement("canvas");l.className="code-codex-particle-canvas code-codex-shallow-ocean-canvas",l.style.cssText="width:100%;height:100%;display:block;",t.appendChild(l);let s=new i(t,l,this.effectiveSettings(this.currentSettings),o,!0,{included:()=>this.journal.included,started:p=>{this.devMode||this.journal.discover(p)}});return this.renderer=s,this.notify(),{ready:s.ready,setSettings:p=>{this.currentSettings={...p},this.applyEffectiveSettings()},replay:()=>{s.replay?.()},dispose:()=>{this.populationGeneration++,this.renderer===s&&(this.renderer=null);try{s.dispose?.()}catch{}this.notify()}}}addCreature(t,r=.5,o=.5){let n=this.populationGeneration,a=this.populationQueue.catch(()=>{}).then(async()=>{if(n!==this.populationGeneration)return;let i=this.renderer;if(!i||typeof i.addCreature!="function")throw new Error("\u8BF7\u5148\u542F\u7528\u201C\u6D45\u6D77\u5B57\u8FF9\u201D\u80CC\u666F\u540E\u518D\u6295\u653E\u751F\u7269");if(await i.addCreature(t,r,o),n!==this.populationGeneration||i!==this.renderer)return;let l=i.diagnostics?.parameters;if(l&&this.syncCallback){let s={},p=["silverCount","reefCount","clownCount","sharkCount","turtleCount","defaultCreaturesEnabled"];for(let d of p){let h=Number(l[d]);Number.isFinite(h)&&(s[d]=h)}this.syncCallback(s)}});return this.populationQueue=a,a}clearCreatures(){this.populationGeneration++;try{this.renderer?.action?.("clear")}catch{}this.syncCallback?.({defaultCreaturesEnabled:0,silverCount:0,reefCount:0,clownCount:0,sharkCount:0,turtleCount:0})}resetPopulation(){this.populationGeneration++;try{this.renderer?.action?.("reset-population")}catch{}}previewEvent(t){if(!this.renderer||typeof this.renderer.previewEvent!="function")throw new Error("\u8BF7\u5148\u542F\u7528\u201C\u6D45\u6D77\u5B57\u8FF9\u201D\u80CC\u666F\u540E\u518D\u9884\u89C8\u4E8B\u4EF6");this.renderer.previewEvent(t)}action(t){this.renderer?.action?.(t)}dispose(){this.populationGeneration++,this.devMode=!1,this.renderer=null,this.syncCallback=null,this.listeners.clear()}},be=null;function G(){return be||(be=new $t),be}function gr(){be&&(be.dispose(),be=null)}var rn={center:"center",top:"center top",bottom:"center bottom",left:"left center",right:"right center"};function mr(e,t,r,o){let n=document.createElement("video");return n.src=e,n.loop=!0,n.muted=!0,n.autoplay=!0,n.playsInline=!0,n.style.cssText=`position:absolute;inset:0;width:100%;height:100%;object-fit:${t};object-position:${r};`,n.onerror=()=>{ne(o),o.textContent=""},n}function fr(e){let t=wt();if(ne(t),t.textContent="",!(e&&e.enabled&&e.mode==="wallpaper"))return;if(!e.wallpaperId){me("\u4ECE\u8BBE\u7F6E\u9762\u677F\u7684\u7D20\u6750\u5E93\u9009\u62E9\u4E00\u5F20\u58C1\u7EB8");return}let r=`${Y}/wallpaper?id=${encodeURIComponent(e.wallpaperId)}`,o=e.wallpaperFit==="contain"?"contain":e.wallpaperFit==="tile"?"tile":"cover",n=rn[e.wallpaperPosition]||"center";if(o==="tile"){let i=document.createElement("div");i.style.cssText=`position:absolute;inset:0;background-repeat:repeat;background-size:auto;background-position:${n};`,i.style.backgroundImage=`url("${r}")`;let l=document.createElement("img");l.style.display="none",l.onerror=()=>{let s=mr(r,"cover",n,t);t.textContent="",t.appendChild(s),s.play().catch(()=>{})},t.appendChild(i),t.appendChild(l),l.src=r;return}let a=document.createElement("img");a.decoding="async",a.style.cssText=`position:absolute;inset:0;width:100%;height:100%;object-fit:${o};object-position:${n};`,a.onerror=()=>{let i=mr(r,o,n,t);t.textContent="",t.appendChild(i),i.play().catch(()=>{})},a.src=r,t.appendChild(a)}var nn=new Set(["selectedImageIds","activeImageId"]),hr="dsh-ap:scene-stores-v2",N=null,ae=null,W=0,Oe=null,at=null;function lt(){return N}function st(){return ae}function ie(e,t){let r=de[e];if(r)try{let o={};try{o=JSON.parse(localStorage.getItem(r)??"{}")||{}}catch{o={}}localStorage.setItem(r,JSON.stringify({...o,...t}))}catch{}}function At(e,t){let o=Qt()?.[e]??L(e),n=o?.defaults?{...o.defaults}:{},a=t?.sceneParams?.[e];if(a&&typeof a=="object")for(let i of Object.keys(a))n[i]=a[i];if(We[e])for(let i of nn)a&&Object.prototype.hasOwnProperty.call(a,i)||delete n[i];return n}function Tt(e,t){if(!e)return!1;let r=e.setSettings||e.updateSettings||e.setRenderSettings;if(typeof r!="function")return!1;try{return r.call(e,t),!0}catch{return!1}}function Lt(e){let t=N&&ae===e?N:null;if(t){if(typeof t.replayOpening=="function"){try{t.replayOpening()}catch{}return}if(typeof t.replay=="function")try{t.replay()}catch{}}}function oe(){if(ae=null,N){try{N.dispose?.()}catch{}N=null}nr(rr())}function br(){try{if(localStorage.getItem(hr))return;for(let e of Object.keys(de))if(!We[e])try{localStorage.removeItem(de[e])}catch{}localStorage.setItem(hr,"1")}catch{}}function xr(e){return e?JSON.stringify(e.sceneParams?.[e.scene]||{}):"{}"}function vr(e){return e&&e.enabled&&e.mode==="scene"?`${e.mode}:${e.scene}`:null}function yr(e){let t=e.getState();if(!t)return;let r=t.enabled&&t.mode!=="off";if(r&&t.mode==="scene"){let o=vr(t),n=xr(t);if(o!==Oe)it(e);else if(n!==at){at=n;let a=At(t.scene,t);ie(t.scene,a),N&&ae===t.scene&&Tt(N,a)||it(e)}return}if(r&&t.mode==="wallpaper"){W++,Oe=null,oe(),fr(t);return}W++,oe(),Oe=null}function it(e){let t=++W,r=e.getState(),o=vr(r);if(Oe=o,at=xr(r),!o||!r){oe();return}let n=Q.includes(r.scene)?r.scene:"milky-way";tr(rt(n,r));let a=At(n,r);ie(n,a);let i=We[n]?ot(n).then(()=>{let s=nt()?.get(n);return s&&typeof s.prepareDefaults=="function"?s.prepareDefaults():null}):Promise.resolve(null),l=()=>{let s=e.getState();return t===W&&!!(s&&s.enabled&&s.mode==="scene"&&s.scene===n)};i.then(()=>cr(n)).then(()=>{if(n==="shallow-ocean"){if(!l())return;oe();let s=Le();return G().mount(s,At("shallow-ocean",e.getState()),d=>{t===W&&d&&e.onStatus(`\u573A\u666F\u63D0\u793A\uFF1A${String(d).slice(0,60)}`)},l).then(d=>{if(!l()){try{d.dispose?.()}catch{}return}N=d,ae=n,d.ready&&typeof d.ready.then=="function"&&d.ready.catch(h=>{t===W&&e.onStatus(`\u573A\u666F\u672A\u5C31\u7EEA\uFF1A${String(h?.message||h).slice(0,60)}`,!0)})})}return fe(n).then(s=>{if(!l())return;if(oe(),n==="pixel-sculpt"){pr(Le(),e.getState,e.onStatus,l,d=>{N=d,ae=n},d=>{me(`Pixel Sculpt \u542F\u52A8\u5931\u8D25\uFF1A${String(d?.message||d).slice(0,50)}`),e.onStatus("Pixel Sculpt \u542F\u52A8\u5931\u8D25",!0)});return}let p=Le();try{let d=s.startup(p,h=>{t===W&&h&&e.onStatus(`\u573A\u666F\u63D0\u793A\uFF1A${String(h).slice(0,60)}`)});N=d,ae=n,d.ready&&typeof d.ready.then=="function"&&d.ready.catch(h=>{t===W&&e.onStatus(`\u573A\u666F\u672A\u5C31\u7EEA\uFF1A${String(h?.message||h).slice(0,60)}`,!0)})}catch(d){N=null,me(`\u573A\u666F\u6E32\u67D3\u5668\u542F\u52A8\u5931\u8D25\uFF1A${n}\uFF08${String(d?.message||d).slice(0,60)}\uFF09`),e.onStatus(`\u573A\u666F\u6E32\u67D3\u5668\u542F\u52A8\u5931\u8D25\uFF1A${n}`,!0)}})}).catch(s=>{t===W&&String(s?.message||s)!=="stale mount"&&(oe(),me(`\u573A\u666F\u52A0\u8F7D\u5931\u8D25\uFF1A${n}\uFF08${String(s?.message||s).slice(0,50)}\uFF09`),e.onStatus(`\u573A\u666F\u52A0\u8F7D\u5931\u8D25\uFF1A${n}`,!0))})}function wr(){W++,Oe=null,at=null,oe(),dr(),gr()}var Sr=/^#[\da-fA-F]{6}$/;function S(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function le(e,t){let r=t&&typeof t=="object"?{...t}:{};if(!e)return r;if(typeof e.qualityDefault=="string"){let o=r.quality;o!=="low"&&o!=="medium"&&o!=="high"&&(r.quality=e.qualityDefault)}if(typeof e.defaults?.performanceMode=="number"){let o=Number(r.performanceMode);r.performanceMode=Number.isFinite(o)?$(Math.round(o),0,3):e.defaults.performanceMode}for(let o of e.fields||[]){let n=Number(r[o.key]);Number.isFinite(n)?r[o.key]=$(n,o.min,o.max):r[o.key]=E(e.defaults?.[o.key],o.min)}if(Array.isArray(e.colors)){let o=Array.isArray(r.colors)?r.colors:e.colors;r.colors=e.colors.map((n,a)=>typeof o[a]=="string"&&Sr.test(o[a])?o[a]:n)}for(let o of e.colorFields||[]){let n=r[o.key];r[o.key]=typeof n=="string"&&Sr.test(n)?n:typeof e.defaults?.[o.key]=="string"?e.defaults[o.key]:"#ffffff"}for(let o of e.toggles||[]){let n=e.defaults?.[o.key],a=r[o.key];typeof n=="number"?r[o.key]=Number(a)===1||a===!0?1:0:r[o.key]=!!a}return r}function Rt(e,t){let r=e?.defaults?{...e.defaults}:{};if(t&&typeof t=="object")for(let o of Object.keys(t))r[o]=t[o];return le(e,r)}function He(e,t){if(e.percent)return`${Math.round(t*100)}%`;let r=String(e.step),o=r.includes(".")?(r.split(".")[1]||"").length:0,n=e.precision!=null?e.precision:o;return`${Number(t).toFixed(n)}${e.unit||""}`}function zt(e,t){let r=e?.defaults?{...e.defaults}:{},o=le(e,t),n={};for(let a of Object.keys(o))a==="quality"&&!(a in r)||JSON.stringify(o[a])!==JSON.stringify(r[a])&&(n[a]=o[a]);return{delta:n,full:o,base:r}}var kr={custom:'<rect x="2" y="2.5" width="12" height="11" rx="2"/><circle cx="5.5" cy="6" r="1"/><path d="m3 12 3.5-3.5 2 2L11 8l2 2.5"/>',surface:'<rect x="2" y="2" width="8" height="8" rx="1.5"/><rect x="6" y="6" width="8" height="8" rx="1.5"/><path d="m7 9 2-2m-2 5 5-5m-2 6 3-3"/>',"milky-way":'<path d="M2 12C3 5 9 1 13 3c4 3-4 10-8 9-3-1 0-5 4-6 3-1 2 2 0 3M3 2v2M2 3h2M12 12v2M11 13h2"/>',"glow-horizon":'<path d="M2 10h12M3 13h10M5 10a3 3 0 0 1 6 0M8 2v2M3 4l1.5 1.5M13 4l-1.5 1.5M1.5 7h2M12.5 7h2"/>',mountain:'<path d="m1.5 13 5-10 5 10zm6-6 3-3 4 9h-3M4.5 7l2 1.5L8 7M2 14.5h12"/>',"heavenly-cloud":'<path d="M4 12a3 3 0 1 1 .5-6 4 4 0 0 1 7.7 1A2.5 2.5 0 0 1 12 12zM5 14h6"/>',"aurora-ionosphere":'<path d="M2 12c2-14 3 2 5-8s3 14 5 1l2-3M2 14c2-9 3 1 5-4s3 7 5 0l2-4"/>',"black-hole":'<circle cx="8" cy="8" r="2.5"/><ellipse cx="8" cy="8" rx="6.5" ry="3" transform="rotate(-25 8 8)"/><path d="M5 3a6 6 0 0 1 8 4M3 9a6 6 0 0 0 8 4"/>',"cloud-train":'<rect x="5" y="6" width="8" height="6" rx="1.5"/><path d="M7 6V4H4a1.5 1.5 0 1 1 1-2M6 9h6M9 6v3M3 14h11"/><circle cx="7" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/>',"particle-image":'<circle cx="3" cy="3" r=".65"/><circle cx="7" cy="2.5" r=".65"/><circle cx="2.5" cy="7" r=".65"/><circle cx="6.5" cy="6" r=".65"/><path d="M10 3h3v10H3v-3m1.5 1 3-3 2 2 2-3 1.5 2"/>',"pixel-sculpt":'<path d="M2 14V8h3V5h3V2h3v4h3v8zM2 11h12M5 8v6M8 5v9M11 6v8"/>',"blinking-squares":'<rect x="2" y="2" width="4" height="4" rx=".5"/><rect x="9" y="3" width="3" height="3" rx=".5"/><rect x="3" y="10" width="3" height="3" rx=".5"/><rect x="9" y="9" width="5" height="5" rx=".5"/>',"ascii-tiles":'<path d="m3 2 5 1-1 5-5-1zM9 3l5 1-1 5-5-1zM2 9l5 1-1 4-5-1zM8 10l5 1-1 3-5-1zM4.5 4l-1 2M4 5.5h1.5"/>',"shallow-ocean":'<path d="M1.5 5.5c2-3 4 3 6 0s4 3 6 0M1.5 10.5c2-3 4 3 6 0s4 3 6 0M8 2v1M12 12.5v1.5"/>',"spectral-drape":'<circle cx="2" cy="4" r=".55"/><circle cx="2" cy="7" r=".55"/><circle cx="2" cy="10" r=".55"/><circle cx="2" cy="13" r=".55"/><circle cx="5" cy="2" r=".55"/><circle cx="5" cy="5" r=".55"/><circle cx="5" cy="8" r=".55"/><circle cx="5" cy="11" r=".55"/><circle cx="8" cy="3" r=".55"/><circle cx="8" cy="6" r=".55"/><circle cx="8" cy="9" r=".55"/><circle cx="8" cy="12" r=".55"/><circle cx="11" cy="5" r=".55"/><circle cx="11" cy="8" r=".55"/><circle cx="11" cy="11" r=".55"/><circle cx="11" cy="14" r=".55"/><circle cx="14" cy="3" r=".55"/><circle cx="14" cy="6" r=".55"/><circle cx="14" cy="9" r=".55"/><circle cx="14" cy="12" r=".55"/>'};function Bt(e){return`<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">${kr[e]??kr.custom}</svg>`}var Er='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>',ct='<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3.25 3.25 9.5 9.5M12.75 3.25l-9.5 9.5"/></svg>';var Ne=new Set,pt=0,Ot,xe=null,B;function on(){pt=0,Ot=void 0,B=void 0,xe&&(xe(),xe=null);for(let e of Ne)try{e.anim.cancel(),e.ghost.remove()}catch{}Ne.clear()}function Mr(e,t,r){let o=Number.isFinite(e)?Math.max(0,Math.min(3,Math.round(e))):0,n=Jt.map(([,a],i)=>`<option value="${i}"${o===i?" selected":""}>${S(a)}</option>`).join("");return'<header class="particle-settings-header"><div class="particle-settings-heading"><p>\u5916\u89C2<span class="ocean-developer-badge" data-ocean-dev-badge'+(t?"":" hidden")+`>\u5F00\u53D1\u8005\u6A21\u5F0F</span></p><h3><button type="button" class="ocean-developer-trigger" data-ocean-dev-trigger>Shallow Ocean Letters Background</button></h3></div><label class="ocean-performance"><span>\u6027\u80FD\u6A21\u5F0F</span><select data-ocean-perf aria-label="\u6027\u80FD\u6A21\u5F0F">${n}</select></label><div class="particle-settings-header-actions"><button class="particle-settings-close" type="button" data-act="settingsclose" title="\u5173\u95ED\u8BBE\u7F6E (Esc)" aria-label="\u5173\u95ED\u8BBE\u7F6E">${r}</button></div></header>`}function Cr(e,t,r){let o=G(),n=er(),a=o.developerMode,i=o.eventJournal,l=i.discovered.length,s=Pe.length,p=l===s,d=Ut.map(([w,,x])=>{let k=n?.[w]||"",C=k?`<img src="${S(k)}" alt="" data-ocean-thumb="${w}" loading="lazy">`:`<img alt="" data-ocean-thumb="${w}" style="opacity:.2">`;return`<button type="button" class="ocean-creature-card" data-ocean-creature="${w}"`+(r?"":" disabled")+`>${C}<span>${S(x)}</span></button>`}).join(""),h=new Map(e.fields.map(w=>[w.key,w])),b=new Map((e.toggles||[]).map(w=>[w.key,w])),c=(e.groups||[]).map(w=>{let x=w.keys.map(k=>{let C=h.get(k);if(C){let Ve=E(t[k],C.min);return`<div class="particle-control-row"><label for="ccx-f-${C.key}">${S(C.zh)}</label><input id="ccx-f-${C.key}" type="range" min="${C.min}" max="${C.max}" step="${C.step}" value="${Ve}" data-field="${C.key}"><span class="particle-control-value"><output data-fieldval="${C.key}">${S(He(C,Ve))}</output></span></div>`}let z=b.get(k);if(z){let Ve=Number(t[z.key])===1||t[z.key]===!0;return`<label class="particle-toggle-row"><span>${S(z.zh)}</span><input type="checkbox" data-toggle="${z.key}"${Ve?" checked":""}></label>`}return""}).join("");return`<fieldset class="particle-settings-group"><legend>${S(w.zh)}</legend>${x}</fieldset>`}).join(""),u=Pe.map(([w,,x])=>{let k=!a&&!i.discovered.includes(w),C=a?!r:!p,z=a?Ot===w:!i.excluded.includes(w);return`<button type="button" data-ocean-event="${w}" aria-pressed="${z}"`+(k?" hidden":"")+(C?" disabled":"")+`>${S(x)}</button>`}).join(""),y=a?"\u70B9\u51FB\u4E8B\u4EF6\u7ACB\u5373\u9884\u89C8\u3002\u81EA\u52A8\u5947\u9047\u5DF2\u6682\u505C\uFF0C\u4E0D\u5F71\u54CD\u6B63\u5F0F\u6536\u96C6\u548C\u7B5B\u9009\u3002":p?"\u5DF2\u96C6\u9F50\u6240\u6709\u5947\u9047\u3002\u70B9\u4EAE\u60F3\u518D\u6B21\u9047\u89C1\u7684\u4E8B\u4EF6\u3002":`\u5DF2\u53D1\u73B0\u5947\u9047 ${l} / ${s}\uFF0C\u96C6\u9F50\u540E\u53EF\u9009\u62E9\u5E0C\u671B\u518D\u6B21\u9047\u89C1\u7684\u4E8B\u4EF6\u3002`;return n||ft().catch(()=>({})),`<div class="particle-settings-scroll"><fieldset class="particle-settings-group"><legend>\u6295\u653E\u751F\u7269${r?"\uFF08\u70B9\u51FB\u6216\u62D6\u62FD\u5230\u6C34\u9762\uFF09":"\uFF08\u9700\u5148\u542F\u7528\u672C\u573A\u666F\uFF09"}</legend><div class="ocean-creature-grid">${d}</div></fieldset><div class="ocean-parameter-grid">${c}</div><fieldset class="particle-settings-group"><legend>\u5947\u9047\u6536\u96C6</legend><div class="ocean-actions">${u}</div><p class="ocean-hint" data-ocean-event-hint>${S(y)}</p></fieldset><div class="ocean-actions ocean-global-actions"><button type="button" data-ocean-clear${r?"":" disabled"}>\u6E05\u9664\u6240\u6709\u6D77\u6D0B\u751F\u7269</button><button type="button" data-act="replay"${r?"":" disabled"}>\u91CD\u64AD\u5F00\u573A</button><button type="button" data-act="draftreset">\u91CD\u7F6E\u5168\u90E8\u53C2\u6570</button></div><p class="particle-plugin-error" role="status" hidden></p></div>`}function an(e,t,r,o,n){if(!t)return;let a=e.getBoundingClientRect(),i=Math.max(24,Math.min(54,a.width||44)),l=Math.max(24,Math.min(54,a.height||44)),s=a.left+a.width/2-i/2,p=a.top+a.height/2-l/2,d=(o??window.innerWidth*.5)-i/2,h=(n??window.innerHeight*.5)-l/2,b=document.createElement("img");b.src=t,b.className="ocean-creature-fly",b.style.cssText=`left:0;top:0;width:${i}px;height:${l}px;transform:translate(${s}px,${p}px);`,r.appendChild(b);let c=b.animate([{transform:`translate(${s}px,${p}px) scale(1)`,opacity:1},{transform:`translate(${(s+d)*.5}px,${Math.min(p,h)-48}px) scale(1.15)`,opacity:.95},{transform:`translate(${d}px,${h}px) scale(.55)`,opacity:0}],{duration:480,easing:"cubic-bezier(.22,.8,.36,1)"}),u={anim:c,ghost:b};Ne.add(u),c.onfinish=()=>{Ne.delete(u),b.remove()},c.oncancel=()=>{Ne.delete(u),b.remove()}}function Pr(e,t,r){let o=G();xe&&xe(),xe=o.subscribe(()=>{t.state()?.scene==="shallow-ocean"&&!t.panel.hidden&&r()}),ft().then(i=>{let l=t.panel.querySelectorAll("img[data-ocean-thumb]");for(let s=0;s<l.length;s++){let p=l[s].dataset.oceanThumb;p&&i[p]&&!l[s].src&&(l[s].src=i[p],l[s].style.opacity="1")}}),t.panel.addEventListener("pointerdown",i=>{let l=i.target.closest("[data-ocean-creature]");if(!l||l.disabled)return;let s=l.dataset.oceanCreature;if(!s)return;let p=l.querySelector("img");B={id:s,startX:i.clientX,startY:i.clientY,moved:!1,ghost:null,thumbSrc:p?.src||""}});let n=i=>{if(B){if(!B.moved&&Math.hypot(i.clientX-B.startX,i.clientY-B.startY)>6&&(B.moved=!0,B.thumbSrc)){let l=document.createElement("img");l.src=B.thumbSrc,l.className="ocean-creature-fly",l.style.cssText="left:0;top:0;width:44px;height:44px;",e.appendChild(l),B.ghost=l}B.ghost&&(B.ghost.style.transform=`translate(${i.clientX-22}px,${i.clientY-22}px)`)}},a=i=>{if(!B)return;let l=B;if(B=void 0,l.ghost&&l.ghost.remove(),!l.moved)return;let s=ge()?.layer.getBoundingClientRect(),p=s?.width||window.innerWidth||1,d=s?.height||window.innerHeight||1,h=Math.max(.04,Math.min(.96,(i.clientX-(s?.left||0))/p)),b=Math.max(.04,Math.min(.96,(i.clientY-(s?.top||0))/d));o.addCreature(l.id,h,b).catch(c=>{t.onStatus(String(c?.message||c),!0)})};return window.addEventListener("pointermove",n),window.addEventListener("pointerup",a),window.addEventListener("pointercancel",a),t.panel.addEventListener("click",i=>{let l=i.target;if(l.closest("[data-ocean-dev-trigger]")){pt+=1,pt>=5&&(pt=0,o.setDeveloperMode(!o.developerMode));return}let s=l.closest("[data-ocean-creature]");if(s&&!s.disabled){let d=s.dataset.oceanCreature;if(!d)return;let h=s.querySelector("img")?.src||"",b=.2+Math.random()*.6,c=.25+Math.random()*.5;an(s,h,e,b*window.innerWidth,c*window.innerHeight),o.addCreature(d,b,c).catch(u=>{t.onStatus(String(u?.message||u),!0)});return}let p=l.closest("[data-ocean-event]");if(p&&!p.disabled){let d=p.dataset.oceanEvent;if(!d)return;if(o.developerMode){Ot=d;try{o.previewEvent(d),r()}catch(h){t.onStatus(String(h?.message||h),!0)}}else o.toggleEvent(d);return}l.closest("[data-ocean-clear]")&&(o.clearCreatures(),t.onStatus("\u5DF2\u6E05\u9664\u6D77\u6D0B\u751F\u7269"))}),t.panel.addEventListener("change",i=>{let l=i.target;if(l?.dataset?.oceanPerf!==void 0){let s=t.draft();if(!s)return;let p=Number(l.value);s.performanceMode=Number.isFinite(p)?Math.max(0,Math.min(3,Math.round(p))):0,t.commit("shallow-ocean")}}),()=>{window.removeEventListener("pointermove",n),window.removeEventListener("pointerup",a),window.removeEventListener("pointercancel",a),on()}}var $r=`
:host {
  all: initial;
  color-scheme: dark light;
  font-family: 'Segoe UI', 'Microsoft YaHei UI', system-ui, sans-serif;
  font-weight: 430;
}
* { box-sizing: border-box; font-family: inherit; }

.trigger {
  position: fixed;
  left: 12px;
  bottom: 76px;
  z-index: 2147482000;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(128,140,170,.35);
  background: rgba(20,24,34,.55);
  backdrop-filter: blur(8px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: .55;
  transition: opacity .15s ease, transform .15s ease, left .18s ease, bottom .18s ease;
  padding: 0;
}
:host([data-sidebar-collapsed="true"]) .trigger {
  left: 14px;
  bottom: 16px;
}
:host([data-theme="light"]) .trigger {
  border-color: rgba(80,95,125,.28);
  background: rgba(255,255,255,.76);
}
.trigger:hover, .trigger[aria-expanded="true"] {
  opacity: 1;
  transform: scale(1.08);
}
.trigger svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: #dfe6f5;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
:host([data-theme="light"]) .trigger svg {
  stroke: #1f2430;
}

.preview-market-popover, .particle-settings-panel {
  --cle-paper: #1f1f1f;
  --cle-paper-raised: #242424;
  --cle-subtle: #242424;
  --cle-ink: #f2f2f2;
  --cle-muted: #a3a3a3;
  --cle-rule: #3a3a3a;
  --cle-rule-strong: #454545;
  --cle-scroll-thumb: #666666;
  --cle-hover: #2b2c2e;
  --cle-subtle-2: #242424;
  --cle-input: #252628;
  --cle-signal: #69aaf5;
  --cle-added: #62c990;
  --cle-deleted: #ff7b72;
  --cle-focus: #69aaf5;
  --cle-icon-blue: #79b8e6;
  --cle-icon-violet: #b9a1e3;
  --cle-icon-teal: #4fd1c5;
  --cle-market-enable: #e5f0fe;
  --cle-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color-scheme: dark;
}
:host([data-theme="light"]) .preview-market-popover,
:host([data-theme="light"]) .particle-settings-panel {
  --cle-paper: #ffffff;
  --cle-paper-raised: #ffffff;
  --cle-subtle: #f7f7f7;
  --cle-ink: #1a1c1f;
  --cle-muted: #64666a;
  --cle-rule: #e4e4e4;
  --cle-rule-strong: #d7d7d7;
  --cle-scroll-thumb: #cccccc;
  --cle-hover: #f2f3f3;
  --cle-subtle-2: #f4f4f4;
  --cle-input: #ffffff;
  --cle-signal: #2e82d2;
  --cle-added: #1d8156;
  --cle-deleted: #b42318;
  --cle-focus: #2e82d2;
  --cle-icon-blue: #2473a8;
  --cle-icon-violet: #7256a8;
  --cle-icon-teal: #15747b;
  --cle-market-enable: #e5f0fe;
  color-scheme: light;
}

.preview-market-popover {
  position: fixed;
  left: 12px;
  bottom: 114px;
  z-index: 2147482900;
  width: min(326px, calc(100vw - 24px));
  max-height: calc(100vh - 130px);
  overflow: visible;
  color: var(--cle-ink);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 10px;
  box-shadow: 0 14px 34px rgba(12,18,28,.2), 0 3px 10px rgba(12,18,28,.12);
  font-size: 12px;
  line-height: 1.45;
  animation: ccx-market-in 130ms cubic-bezier(.2,.8,.2,1) both;
}
:host([data-sidebar-collapsed="true"]) .preview-market-popover {
  left: 14px;
  bottom: 54px;
}
.preview-market-popover[hidden] { display: none; }
.preview-market-popover::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 18px;
  width: 10px;
  height: 10px;
  background: var(--cle-paper-raised);
  border-right: 1px solid var(--cle-rule-strong);
  border-bottom: 1px solid var(--cle-rule-strong);
  transform: rotate(45deg);
}
.preview-market-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px 8px 14px;
  border-bottom: 1px solid var(--cle-rule);
}
.preview-market-header h3 {
  flex: 1;
  margin: 0;
  color: var(--cle-ink);
  font-size: 13px;
  font-weight: 650;
  line-height: 18px;
}
.preview-market-close {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--cle-muted);
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}
.preview-market-close:hover { color: var(--cle-ink); background: var(--cle-hover); }
.preview-market-close svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.3; }

.preview-market-list {
  position: relative;
  display: grid;
  align-content: start;
  gap: 8px;
  max-height: min(440px, calc(100vh - 150px));
  padding: 8px;
  overflow: auto;
  scrollbar-color: var(--cle-scroll-thumb) transparent;
  scrollbar-width: thin;
}
.preview-market-categories {
  display: grid;
  width: fit-content;
  grid-template-columns: repeat(3, max-content);
  gap: 2px;
  padding: 2px;
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 7px;
}
.preview-market-category {
  min-width: 0;
  padding: 5px 7px;
  color: var(--cle-muted);
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 650;
  line-height: 14px;
  letter-spacing: .01em;
  white-space: nowrap;
}
.preview-market-category:hover { color: var(--cle-ink); background: var(--cle-hover); }
.preview-market-category[aria-selected='true'] {
  color: var(--cle-ink);
  background: var(--cle-paper);
  box-shadow: 0 1px 2px rgba(12,18,28,.08);
}
.preview-market-section { display: grid; gap: 6px; min-width: 0; }
.preview-market-section[hidden] { display: none; }
.preview-market-section-list { display: grid; gap: 8px; }
.cat-empty { margin: 4px 2px; color: var(--cle-muted); font-size: 10.5px; }

.preview-extension {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  column-gap: 10px;
  row-gap: 9px;
  padding: 10px;
  background: var(--cle-paper);
  border: 1px solid var(--cle-rule);
  border-radius: 8px;
}
.preview-extension-icon {
  display: grid;
  place-items: center;
  align-self: start;
  width: 38px;
  height: 38px;
  color: var(--cle-icon-blue);
  background: color-mix(in srgb, var(--cle-icon-blue) 10%, var(--cle-paper));
  border: 1px solid color-mix(in srgb, var(--cle-icon-blue) 20%, var(--cle-rule));
  border-radius: 8px;
}
.preview-extension-icon svg {
  width: 23px;
  height: 23px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.15;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.preview-extension-copy { min-width: 0; }
.preview-extension-title-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}
.preview-extension h4 {
  min-width: 0;
  margin: 0;
  color: var(--cle-ink);
  font-size: 12px;
  font-weight: 650;
  line-height: 17px;
  overflow-wrap: anywhere;
}
.preview-extension-status {
  flex: 0 0 auto;
  padding: 1px 5px;
  color: var(--cle-muted);
  background: var(--cle-subtle);
  border-radius: 999px;
  font-size: 9px;
  line-height: 15px;
}
.preview-extension-status[data-enabled='true'] {
  color: var(--cle-added);
  background: color-mix(in srgb, var(--cle-added) 11%, var(--cle-paper));
}
.preview-extension-actions {
  display: flex;
  grid-column: 2;
  align-items: center;
  justify-self: start;
  gap: 5px;
}
.preview-extension-action {
  grid-column: 2;
  justify-self: start;
  min-width: 58px;
  min-height: 25px;
  padding: 3px 10px;
  color: #173b66;
  background: var(--cle-market-enable);
  border: 1px solid color-mix(in srgb, var(--cle-market-enable) 80%, #69aaf5);
  border-radius: 5px;
  cursor: pointer;
  font-size: 10.5px;
  font-weight: 600;
}
.preview-extension-action:hover { filter: brightness(1.06); }
.preview-extension-action[data-enabled='true'] {
  color: var(--cle-muted);
  background: transparent;
  border-color: var(--cle-rule-strong);
}
.particle-settings-trigger {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 25px;
  height: 25px;
  padding: 0;
  color: var(--cle-muted);
  background: transparent;
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
}
.particle-settings-trigger:hover, .particle-settings-trigger[aria-expanded='true'] {
  color: var(--cle-ink);
  background: var(--cle-hover);
}
.particle-settings-trigger svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ext-particle .preview-extension-icon {
  color: var(--cle-icon-violet);
  background: color-mix(in srgb, var(--cle-icon-violet) 10%, var(--cle-paper));
  border-color: color-mix(in srgb, var(--cle-icon-violet) 22%, var(--cle-rule));
}
.ext-blackhole .preview-extension-icon {
  color: #f59e0b;
  background: color-mix(in srgb, #f59e0b 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #f59e0b 24%, var(--cle-rule));
}
.ext-glowhorizon .preview-extension-icon {
  color: #a558fb;
  background: color-mix(in srgb, #a558fb 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #a558fb 24%, var(--cle-rule));
}
.ext-heavenlycloud .preview-extension-icon {
  color: #38e8ff;
  background: color-mix(in srgb, #38e8ff 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #38e8ff 24%, var(--cle-rule));
}
.ext-shallowocean .preview-extension-icon {
  color: #2dd4bf;
  background: color-mix(in srgb, #2dd4bf 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #2dd4bf 24%, var(--cle-rule));
}
.ext-asciitiles .preview-extension-icon {
  color: #69aaf5;
  background: color-mix(in srgb, #69aaf5 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #69aaf5 24%, var(--cle-rule));
}
.ext-spectraldrape .preview-extension-icon {
  color: #c084fc;
  background: color-mix(in srgb, #c084fc 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #c084fc 24%, var(--cle-rule));
}

.particle-settings-panel {
  position: fixed;
  top: 12px;
  left: 344px;
  z-index: 2147483000;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: min(352px, calc(100vw - 24px));
  max-height: calc(100vh - 24px);
  color: var(--cle-ink);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 8px;
  box-shadow: 0 20px 52px rgba(0,0,0,.34), 0 4px 14px rgba(0,0,0,.2);
  font-size: 12px;
  line-height: 1.45;
  animation: ccx-settings-in 130ms cubic-bezier(.2,.8,.2,1) both;
}
.particle-settings-panel[hidden] { display: none; }
.particle-settings-panel.shallow-ocean-panel {
  width: min(680px, calc(100vw - 24px));
  container-type: inline-size;
}
.particle-settings-panel[data-side='right'] { transform-origin: left top; }
.particle-settings-panel[data-side='right']::before {
  position: absolute;
  top: var(--cle-anchor-y, 24px);
  left: -6px;
  width: 10px;
  height: 10px;
  background: var(--cle-paper-raised);
  border-bottom: 1px solid var(--cle-rule-strong);
  border-left: 1px solid var(--cle-rule-strong);
  content: '';
  transform: translateY(-50%) rotate(45deg);
}

.particle-settings-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  padding: 10px 12px 9px 13px;
  background: var(--cle-paper-raised);
  border-bottom: 1px solid var(--cle-rule);
  border-radius: 8px 8px 0 0;
}
.particle-settings-heading { min-width: 0; flex: 1; }
.particle-settings-header h3 {
  margin: 0;
  overflow: hidden;
  color: var(--cle-ink);
  font-size: 13px;
  font-weight: 650;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.particle-settings-header p { margin: 1px 0 0; color: var(--cle-muted); font-size: 10px; line-height: 15px; }
.particle-settings-header p .badge { margin-left: 4px; color: var(--cle-signal); }

.particle-settings-close {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--cle-muted);
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}
.particle-settings-close:hover { color: var(--cle-ink); background: var(--cle-hover); }
.particle-settings-close svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.3; }

.particle-settings-scroll {
  display: grid;
  gap: 10px;
  align-content: start;
  min-width: 0;
  min-height: 0;
  max-height: calc(100vh - 86px);
  padding: 9px 10px 11px;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-color: var(--cle-scroll-thumb) transparent;
  scrollbar-width: thin;
}

.particle-settings-group {
  display: grid;
  gap: 6px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.particle-settings-group + .particle-settings-group {
  padding-top: 9px;
  border-top: 1px solid var(--cle-rule);
}
.particle-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 1px;
}
.particle-settings-group legend,
.particle-group-head .particle-group-title {
  margin: 0;
  padding: 0;
  color: var(--cle-muted);
  font-size: 9.5px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: .04em;
}
.particle-group-reset {
  padding: 1px 6px;
  color: var(--cle-muted);
  background: transparent;
  border: 1px solid var(--cle-rule);
  border-radius: 4px;
  cursor: pointer;
  font-size: 9px;
  line-height: 14px;
}
.particle-group-reset:hover {
  color: var(--cle-ink);
  background: var(--cle-hover);
  border-color: var(--cle-rule-strong);
}

.particle-control-row {
  display: grid;
  grid-template-columns: minmax(92px, .9fr) minmax(72px, 1.1fr) minmax(44px, auto);
  align-items: center;
  gap: 6px;
  min-width: 0;
  min-height: 30px;
  color: var(--cle-muted);
  font-size: 10px;
}
.particle-control-row label { min-width: 0; overflow-wrap: anywhere; line-height: 14px; }
.particle-control-row input[type='range'] {
  width: 100%;
  min-width: 0;
  margin: 0;
  accent-color: var(--cle-signal);
  cursor: pointer;
}
.particle-control-value { display: grid; min-width: 44px; justify-items: end; }
.particle-control-row output {
  box-sizing: border-box;
  width: 100%;
  min-width: 44px;
  padding: 0 3px;
  color: var(--cle-ink);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: text;
  font: 9.5px/18px var(--cle-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
  user-select: none;
}
.particle-control-row output:hover {
  background: var(--cle-hover);
  border-color: var(--cle-rule);
}
.particle-control-row output[hidden],
.particle-value-editor[hidden] { display: none; }
.particle-value-editor {
  box-sizing: border-box;
  width: 60px;
  max-width: 100%;
  min-width: 0;
  height: 20px;
  margin: 0;
  padding: 0 4px;
  color: var(--cle-ink);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-focus);
  border-radius: 4px;
  appearance: textfield;
  font: 9.5px/18px var(--cle-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.particle-value-editor::-webkit-inner-spin-button,
.particle-value-editor::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}

.surface-opacity-row {
  grid-template-columns: minmax(92px, 1fr) minmax(60px, 1fr) 44px 24px;
  min-height: 30px;
}
.surface-opacity-row button {
  border: 1px solid var(--cle-rule);
  border-radius: 4px;
  background: var(--cle-paper);
  color: var(--cle-ink);
  height: 24px;
  padding: 0;
  cursor: pointer;
  font: inherit;
}
.surface-opacity-row button:hover { background: var(--cle-hover); border-color: var(--cle-rule-strong); }

.particle-toggle-row, .particle-color-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 27px;
  margin: 0 4px;
  color: var(--cle-muted);
  font-size: 9.5px;
}
.particle-toggle-row input[type='checkbox'] {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: var(--cle-signal);
  cursor: pointer;
}
.particle-color-row input[type='color'] {
  width: 29px;
  height: 21px;
  padding: 2px;
  overflow: hidden;
  background: var(--cle-input);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
}

.heavenly-cloud-quality-toolbar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
}
.heavenly-cloud-quality-toolbar.dir4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.heavenly-cloud-quality-toolbar button {
  min-width: 0;
  min-height: 40px;
  padding: 4px 6px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  font-weight: 600;
  line-height: 12px;
}
.heavenly-cloud-quality-toolbar button strong {
  display: block;
  margin-bottom: 2px;
  color: #38e8ff;
  font-family: var(--cle-mono);
  font-size: 11px;
}
.heavenly-cloud-quality-toolbar button:hover:not(:disabled),
.heavenly-cloud-quality-toolbar button[aria-pressed='true'] {
  color: var(--cle-ink);
  background: color-mix(in srgb, #38e8ff 10%, var(--cle-paper-raised));
  border-color: color-mix(in srgb, #38e8ff 42%, var(--cle-rule-strong));
}

.glow-horizon-direction-toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--cle-rule);
}
.glow-horizon-direction-toolbar button {
  min-width: 0;
  min-height: 34px;
  padding: 3px 5px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  font-weight: 600;
  line-height: 12px;
}
.glow-horizon-direction-toolbar button:hover:not(:disabled),
.glow-horizon-direction-toolbar button[aria-pressed='true'] {
  color: var(--cle-ink);
  background: color-mix(in srgb, #a558fb 12%, var(--cle-paper-raised));
  border-color: color-mix(in srgb, #a558fb 45%, var(--cle-rule-strong));
}
.glow-horizon-direction-toolbar .glow-horizon-direction-symbol {
  display: block;
  margin-bottom: 1px;
  font-size: 14px;
  line-height: 15px;
}

.black-hole-preset-toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--cle-rule);
}
.black-hole-preset-toolbar button {
  min-width: 0;
  min-height: 32px;
  padding: 3px 5px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  font-weight: 600;
  line-height: 12px;
  white-space: normal;
}
.black-hole-preset-toolbar button:hover:not(:disabled),
.black-hole-preset-toolbar button[aria-pressed='true'] {
  color: var(--cle-ink);
  background: color-mix(in srgb, #f59e0b 10%, var(--cle-paper-raised));
  border-color: color-mix(in srgb, #f59e0b 45%, var(--cle-rule-strong));
}
.black-hole-preset-toolbar .black-hole-reset {
  color: var(--cle-muted);
  background: var(--cle-subtle);
}

.glow-horizon-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  padding-top: 2px;
}
.glow-horizon-actions.single { grid-template-columns: minmax(0, 1fr); }
.glow-horizon-actions button {
  min-height: 30px;
  padding: 4px 8px;
  color: var(--cle-muted);
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
}
.glow-horizon-actions button:hover:not(:disabled) {
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-signal) 10%, var(--cle-subtle));
  border-color: color-mix(in srgb, var(--cle-signal) 42%, var(--cle-rule-strong));
}
.glow-horizon-actions button:disabled { cursor: default; opacity: .5; }

/* Shallow Ocean panel */
.shallow-ocean-panel .ocean-developer-trigger {
  appearance: none;
  border: 0;
  padding: 0;
  margin: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.shallow-ocean-panel .ocean-developer-trigger:focus-visible {
  outline: 2px solid var(--cle-icon-blue);
  outline-offset: 3px;
  border-radius: 3px;
}
.shallow-ocean-panel .ocean-developer-badge {
  margin-left: 6px;
  font-size: 10px;
  line-height: 16px;
  color: var(--cle-icon-blue);
}
.shallow-ocean-panel .ocean-performance {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-inline-start: auto;
  font-size: 10.5px;
  color: var(--cle-muted);
}
.shallow-ocean-panel .ocean-performance select {
  font: inherit;
  color: var(--cle-ink);
  background: var(--cle-paper);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  padding: 2px 6px;
}
.shallow-ocean-panel .ocean-creature-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  margin: 0;
  padding-bottom: 4px;
  scrollbar-width: thin;
}
.shallow-ocean-panel .ocean-creature-card {
  display: flex;
  flex: 1 0 76px;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  margin: 0;
  padding: 4px 5px;
  color: var(--cle-ink);
  background: var(--cle-paper);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  cursor: pointer;
  font-size: 9.5px;
  line-height: 12px;
}
.shallow-ocean-panel .ocean-creature-card img {
  display: block;
  width: 100%;
  height: 44px;
  object-fit: contain;
  pointer-events: none;
  background: var(--cle-subtle);
  border-radius: 4px;
}
.shallow-ocean-panel .ocean-creature-card span {
  min-height: 16px;
  display: grid;
  place-items: center;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.shallow-ocean-panel .ocean-creature-card:hover:not(:disabled) {
  background: var(--cle-subtle);
  border-color: var(--cle-icon-blue);
}
.shallow-ocean-panel .ocean-creature-card:disabled { cursor: default; opacity: .55; }
.shallow-ocean-panel .ocean-parameter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  column-gap: 14px;
  row-gap: 8px;
}
.shallow-ocean-panel .ocean-parameter-grid .particle-settings-group {
  min-width: 0;
  margin: 0;
  padding: 4px 0;
  border-top: 0;
  align-content: start;
  gap: 4px;
}
.shallow-ocean-panel .ocean-parameter-grid .particle-control-row {
  grid-template-columns: minmax(66px, 1fr) minmax(52px, 1fr) 36px;
  min-height: 24px;
}
.shallow-ocean-panel .ocean-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.shallow-ocean-panel .ocean-actions button {
  min-height: 24px;
  padding: 3px 8px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  line-height: 15px;
}
.shallow-ocean-panel .ocean-actions button:hover:not(:disabled) {
  color: var(--cle-ink);
  background: var(--cle-hover);
}
.shallow-ocean-panel .ocean-actions button:disabled { cursor: default; opacity: .5; }
.shallow-ocean-panel [data-ocean-event][aria-pressed="true"] {
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-icon-blue) 14%, var(--cle-paper-raised));
  border-color: var(--cle-icon-blue);
}
.shallow-ocean-panel [data-ocean-event][hidden] { display: none; }
.shallow-ocean-panel .ocean-hint {
  margin: 4px 0 6px;
  font-size: 10px;
  line-height: 1.45;
  color: var(--cle-muted);
}
@container (max-width: 620px) {
  .shallow-ocean-panel .ocean-parameter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container (max-width: 420px) {
  .shallow-ocean-panel .ocean-parameter-grid { grid-template-columns: minmax(0, 1fr); }
}

/* Custom wallpaper library */
.particle-source-details {
  min-width: 0;
  overflow: hidden;
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 7px;
}
.particle-source-details[open] { padding-bottom: 8px; }
.particle-source-summary {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 5px 8px;
  color: var(--cle-ink);
  cursor: pointer;
  font-size: 10.5px;
  font-weight: 600;
  list-style: none;
  user-select: none;
}
.particle-source-summary::-webkit-details-marker { display: none; }
.particle-source-summary::before {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-right: 1px solid var(--cle-muted);
  border-bottom: 1px solid var(--cle-muted);
  content: '';
  transform: rotate(-45deg);
}
.particle-source-details[open] .particle-source-summary::before {
  transform: rotate(45deg) translate(-1px, -1px);
}
.particle-source-summary:hover { background: var(--cle-hover); }
.particle-source-count {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: var(--cle-muted);
  font: 9px/16px var(--cle-mono);
  white-space: nowrap;
}
.particle-library-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin: 0 8px 7px;
}
.particle-library-add, .particle-library-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 3px 7px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  line-height: 15px;
}
.particle-library-add {
  position: relative;
  color: var(--cle-ink);
  border-color: color-mix(in srgb, var(--cle-signal) 48%, var(--cle-rule));
}
.particle-library-clear { margin-left: auto; }
.particle-library-clear:disabled { cursor: default; opacity: .5; }
.particle-library-add:hover, .particle-library-clear:hover:not(:disabled) { background: var(--cle-hover); }
.particle-library-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  min-width: 0;
  margin: 0 8px;
}
.particle-library-empty {
  grid-column: 1/-1;
  margin: 0;
  padding: 10px 7px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px dashed var(--cle-rule-strong);
  border-radius: 6px;
  font-size: 9.5px;
  line-height: 1.45;
  text-align: center;
}
.wallitem { position: relative; min-width: 0; }
.wallitem .wpick {
  display: grid;
  width: 100%;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  color: var(--cle-muted);
  background: var(--cle-paper);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
}
.wallitem .wpick:hover { border-color: var(--cle-rule-strong); }
.wallitem.on .wpick {
  border-color: var(--cle-signal);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cle-signal) 20%, transparent);
}
.wallitem img, .wallitem .vthumb {
  display: block;
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  background: var(--cle-subtle);
}
.wallitem .vthumb {
  display: grid;
  place-items: center;
  color: var(--cle-muted);
  font-size: 14px;
}
.wallitem .wname {
  display: block;
  min-width: 0;
  padding: 3px 4px 4px;
  overflow: hidden;
  font-size: 8.5px;
  line-height: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wallitem .wdel {
  position: absolute;
  z-index: 3;
  top: 3px;
  right: 3px;
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  padding: 0;
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-paper-raised) 88%, transparent);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  opacity: 0;
}
.wallitem:hover .wdel, .wallitem .wdel:focus-visible { opacity: 1; }
.wallitem .wdel:hover {
  color: #fff;
  background: var(--cle-deleted, #b42318);
  border-color: var(--cle-deleted, #b42318);
}
.wall-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 8px 0;
  gap: 6px;
}
.wall-pager output {
  color: var(--cle-muted);
  font: 9px/16px var(--cle-mono);
}
.wall-pager button {
  min-width: 32px;
  height: 22px;
  padding: 0 6px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
}
.wall-pager button:hover:not(:disabled) { color: var(--cle-ink); background: var(--cle-hover); }
.wall-pager button:disabled { cursor: default; opacity: .45; }

.particle-settings-scroll select {
  min-height: 24px;
  padding: 2px 6px;
  color: var(--cle-ink);
  background: var(--cle-input);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  font-size: 10px;
  cursor: pointer;
}
.panel-note {
  margin: 0;
  padding: 8px;
  color: var(--cle-muted);
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  font-size: 9.5px;
  line-height: 1.45;
}
.particle-plugin-error {
  grid-column: 1/-1;
  margin: 0;
  padding: 6px 7px;
  color: var(--cle-deleted, #ff7b72);
  background: color-mix(in srgb, var(--cle-deleted, #ff7b72) 8%, var(--cle-paper));
  border: 1px solid color-mix(in srgb, var(--cle-deleted, #ff7b72) 30%, var(--cle-rule));
  border-radius: 5px;
  font-size: 9.5px;
  line-height: 1.4;
}
.particle-plugin-error[hidden] { display: none; }

@keyframes ccx-market-in {
  from { opacity: 0; transform: translateY(5px) scale(.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ccx-settings-in {
  from { opacity: 0; transform: translateY(3px) scale(.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Pixel Sculpt embedded vendor controls */
.particle-settings-panel .pixelSculpt-controls-host { min-width: 0; }
.particle-settings-panel .pixelSculpt-disabled {
  margin: 0;
  padding: 8px;
  color: var(--cle-muted);
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  font-size: 9.5px;
  line-height: 1.45;
}
.particle-settings-panel .pixelSculpt-disabled[hidden] { display: none; }
.particle-settings-panel .pixelSculpt-paused-row { margin: 0; padding-top: 9px; border-top: 1px solid var(--cle-rule); }
.particle-settings-panel .pixelSculpt-actions { grid-template-columns: minmax(0, 1fr); margin-top: -2px; }
.particle-settings-panel .pixelSculpt-actions button:hover {
  background: var(--cle-hover);
  border-color: color-mix(in srgb, var(--cle-signal) 45%, var(--cle-rule-strong));
}
.pixel-sculpt-controls { color: var(--cle-ink); font-size: 10px; line-height: 1.45; }
.pixel-sculpt-controls .panel {
  position: static;
  display: grid;
  gap: 0;
  width: 100%;
  max-height: none;
  padding: 0;
  overflow: visible;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
}
.pixel-sculpt-controls .ph { display: none; }
.pixel-sculpt-controls .row:not(.gallery-block) {
  display: grid;
  grid-template-columns: minmax(92px, .9fr) minmax(72px, 1.1fr) minmax(42px, auto);
  align-items: center;
  gap: 6px;
  min-width: 0;
  min-height: 34px;
  margin: 0;
  padding: 0;
  color: var(--cle-muted);
  font-size: 10px;
}
.pixel-sculpt-controls .row:not(.gallery-block) > .row-head { display: contents; }
.pixel-sculpt-controls .row:not(.gallery-block) > .row-head > span {
  grid-column: 1;
  min-width: 0;
  overflow: visible;
  color: var(--cle-muted);
  white-space: normal;
}
.pixel-sculpt-controls .row:not(.gallery-block) > .row-head > output {
  grid-column: 3;
  grid-row: 1;
  box-sizing: border-box;
  width: 100%;
  min-width: 42px;
  padding: 0 3px;
  color: var(--cle-ink);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: text;
  font: 9.5px/18px var(--cle-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
  user-select: none;
}
.pixel-sculpt-controls .row:not(.gallery-block) > .row-head > output:hover {
  background: var(--cle-hover);
  border-color: var(--cle-rule);
}
.pixel-sculpt-controls .row:not(.gallery-block) > input[type="range"] { grid-column: 2; grid-row: 1; }
.pixel-sculpt-controls input[type="range"] {
  width: 100%;
  min-width: 0;
  height: auto;
  margin: 0;
  appearance: auto;
  accent-color: var(--cle-signal);
  background: transparent;
  border-radius: 0;
  cursor: pointer;
}
.pixel-sculpt-controls .seg {
  grid-column: 2 / 4;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 5px;
  min-width: 0;
}
.pixel-sculpt-controls .seg button {
  min-width: 0;
  min-height: 25px;
  padding: 3px 5px;
  overflow: hidden;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pixel-sculpt-controls .seg button:hover,
.pixel-sculpt-controls .seg button.on {
  color: var(--cle-ink);
  background: var(--cle-hover);
  border-color: color-mix(in srgb, var(--cle-signal) 45%, var(--cle-rule-strong));
}
.pixel-sculpt-controls .toggle-line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 27px;
  margin: 0 8px;
  padding: 0;
  color: var(--cle-muted);
  font-size: 9.5px;
}
.pixel-sculpt-controls .toggle { position: static; display: block; width: 14px; height: 14px; }
.pixel-sculpt-controls .toggle input {
  position: static;
  width: 14px;
  height: 14px;
  margin: 0;
  opacity: 1;
  accent-color: var(--cle-signal);
  cursor: pointer;
}
.pixel-sculpt-controls .toggle > span { display: none; }
.pixel-sculpt-controls .divider { height: 1px; margin: 9px 0; background: var(--cle-rule); }
.pixel-sculpt-controls .gallery-block {
  display: block;
  min-width: 0;
  margin: 0 0 6px;
  padding: 0 0 8px;
  overflow: hidden;
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 7px;
}
.pixel-sculpt-controls .gallery-block > .row-head {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  margin: 0;
  padding: 5px 8px;
  color: var(--cle-ink);
  font-size: 10.5px;
  font-weight: 600;
}
.pixel-sculpt-controls .gallery-block > .row-head output {
  min-width: 0;
  margin-left: auto;
  color: var(--cle-muted);
  font: 9px/16px var(--cle-mono);
}
.pixel-sculpt-controls .file-row { display: flex; align-items: center; gap: 6px; min-width: 0; margin: 0 8px 7px; }
.pixel-sculpt-controls .file-row button,
.pixel-sculpt-controls .gallery-nav button {
  min-height: 24px;
  padding: 3px 7px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  line-height: 15px;
}
.pixel-sculpt-controls .file-row button {
  flex: 0 0 auto;
  color: var(--cle-ink);
  border-color: color-mix(in srgb, var(--cle-signal) 48%, var(--cle-rule));
}
.pixel-sculpt-controls .file-row button:disabled { cursor: default; opacity: .5; }
.pixel-sculpt-controls .file-row button:hover,
.pixel-sculpt-controls .gallery-nav button:hover:not(:disabled) { background: var(--cle-hover); }
.pixel-sculpt-controls .file-row span {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: var(--cle-muted);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pixel-sculpt-controls .gallery-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  min-width: 0;
  margin: 0 8px;
}
.pixel-sculpt-controls .gallery-empty {
  grid-column: 1 / -1;
  margin: 0;
  padding: 10px 7px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px dashed var(--cle-rule-strong);
  border-radius: 6px;
  font-size: 9.5px;
  line-height: 1.45;
  text-align: center;
}
.pixel-sculpt-controls .gallery-item { position: relative; min-width: 0; }
.pixel-sculpt-controls .gallery-preview {
  display: grid;
  width: 100%;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  cursor: pointer;
}
.pixel-sculpt-controls .gallery-preview:hover { border-color: var(--cle-rule-strong); }
.pixel-sculpt-controls .gallery-item.is-selected .gallery-preview {
  border-color: var(--cle-signal);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cle-signal) 20%, transparent);
}
.pixel-sculpt-controls .gallery-item.is-active .gallery-preview { box-shadow: inset 0 0 0 1px var(--cle-ink); }
.pixel-sculpt-controls .gallery-preview img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: var(--cle-subtle);
}
.pixel-sculpt-controls .gallery-name {
  display: block;
  min-width: 0;
  padding: 3px 4px 4px;
  overflow: hidden;
  font-size: 8.5px;
  line-height: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pixel-sculpt-controls .gallery-item .remove {
  position: absolute;
  z-index: 3;
  top: 3px;
  right: 3px;
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  padding: 0 0 1px;
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-paper-raised) 88%, transparent);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  opacity: 0;
}
.pixel-sculpt-controls .gallery-item:hover .remove,
.pixel-sculpt-controls .gallery-item:focus-within .remove { opacity: 1; }
.pixel-sculpt-controls .gallery-item .remove:hover {
  color: #ffffff;
  background: var(--cle-deleted);
  border-color: var(--cle-deleted);
}
.pixel-sculpt-controls .gallery-order {
  position: absolute;
  z-index: 2;
  top: 4px;
  left: 4px;
  display: grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  color: #ffffff;
  background: var(--cle-signal);
  border: 1px solid color-mix(in srgb, #ffffff 48%, transparent);
  border-radius: 999px;
  pointer-events: none;
  font: 700 8px/1 var(--cle-mono);
}
.pixel-sculpt-controls .gallery-live {
  position: absolute;
  z-index: 2;
  right: 4px;
  bottom: 21px;
  padding: 1px 4px;
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-paper-raised) 88%, transparent);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 3px;
  pointer-events: none;
  font: 700 7px/11px var(--cle-mono);
  letter-spacing: .05em;
}
.pixel-sculpt-controls .gallery-nav {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 32px;
  align-items: center;
  gap: 6px;
  margin: 6px 8px 0;
}
.pixel-sculpt-controls .gallery-nav button { height: 24px; padding: 0; }
.pixel-sculpt-controls .gallery-nav button:disabled { cursor: default; opacity: .5; }
.pixel-sculpt-controls .gallery-index {
  color: var(--cle-muted);
  font: 9px/16px var(--cle-mono);
  text-align: center;
}
.pixel-sculpt-controls .color-row {
  grid-template-columns: minmax(0, 1fr) 29px !important;
  gap: 8px !important;
  min-height: 34px !important;
}
.pixel-sculpt-controls .color-row > div {
  display: grid;
  grid-template-columns: minmax(92px, .9fr) minmax(72px, 1.1fr);
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.pixel-sculpt-controls .color-row > div > .row-head { margin: 0; color: var(--cle-muted); font-size: 10px; }
.pixel-sculpt-controls .color-row input[type="text"] {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 22px;
  padding: 2px 6px;
  color: var(--cle-ink);
  background: var(--cle-input);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  outline: 0;
  font: 9.5px/16px var(--cle-mono);
}
.pixel-sculpt-controls .color-row input[type="color"] {
  width: 29px;
  height: 21px;
  padding: 2px;
  overflow: hidden;
  background: var(--cle-input);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
}
.pixel-sculpt-controls [hidden] { display: none !important; }
.ocean-creature-fly {
  position: fixed;
  z-index: 2147483600;
  margin: 0;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,.35));
}
`;var ln="dsh-ap-panel",sn="dsh-ap-trigger",Ht=12,Tr=[{key:"dim",zh:"\u80CC\u666F\u538B\u6697",min:0,max:80,step:1,scale:100},{key:"blur",zh:"\u80CC\u666F\u6A21\u7CCA",min:0,max:20,step:.5,scale:1}],Lr={"milky-way":"Milky Way Background","glow-horizon":"Glow Horizon Background",mountain:"Layered Mountain Background","heavenly-cloud":"Heavenly Cloud Background","aurora-ionosphere":"Aurora Ionosphere Background","black-hole":"Black Hole Background","cloud-train":"Cloud Train Background","particle-image":"Particle Image Background","pixel-sculpt":"Pixel Sculpt Background","blinking-squares":"Blinking Squares Background","ascii-tiles":"ASCII Tiles Background","shallow-ocean":"Shallow Ocean Letters Background","spectral-drape":"Spectral Drape Background"},cn={"glow-horizon":"ext-glowhorizon","heavenly-cloud":"ext-heavenlycloud","black-hole":"ext-blackhole","particle-image":"ext-particle","shallow-ocean":"ext-shallowocean","ascii-tiles":"ext-asciitiles","spectral-drape":"ext-spectraldrape"},Nt=[{id:"custom",kind:"wallpaper",title:"Custom Background",ext:""},{id:"surface",kind:"surface",title:"UI Surface Opacity",ext:""},...pe.map(e=>({id:e.id,kind:"scene",title:Lr[e.id]||e.en,ext:cn[e.id]||""}))],pn={particles:"\u7C92\u5B50",flow:"\u6D41\u52A8",source:"\u6765\u6E90",pointer:"\u6307\u9488",render:"\u6E32\u67D3",camera:"\u76F8\u673A",disc:"\u5438\u79EF\u76D8",light:"\u5149\u7EBF",input:"\u8F93\u5165",downward:"\u4E0B\u6ED1\u52A8\u6001",upward:"\u4E0A\u6ED1\u52A8\u6001",release:"\u91CA\u653E\u56DE\u5F39",entrance:"\u5F00\u573A\u753B\u9762",opening:"\u5F00\u573A\u52A8\u753B",interaction:"\u4EA4\u4E92"},dn={"heavenly-cloud":{field:"\u4E91\u573A",opening:"\u5F00\u573A\u753B\u9762"},"aurora-ionosphere":{field:"\u7535\u79BB\u5C42",opening:"\u5F00\u573A\u753B\u9762"},"milky-way":{field:"\u8FD0\u52A8\u4E0E\u5F62\u6001",opening:"\u5F00\u573A\u753B\u9762"}},un={mountain:"\u5C71\u5CE6\u4E0E\u6C1B\u56F4","cloud-train":"\u5217\u8F66\u4E0E\u4E91\u6D77","blinking-squares":"\u53C2\u6570"},gn={skyTint:"\u5929\u7A7A\u8272",smokeTint:"\u70DF\u96FE\u8272",trainTint:"\u5217\u8F66\u8272"},mn={"milky-way":"\u4E94\u8272\u8C03\u8272\u677F","glow-horizon":"\u5149\u6548\u914D\u8272"},fn={"milky-way":{mode:"quality",items:[["low","1\xD7","\u8F7B\u91CF"],["medium","2\xD7","\u5747\u8861"],["high","3\xD7","\u7CBE\u7EC6"]]},"heavenly-cloud":{mode:"quality",items:[["low","56","\u4F4E"],["medium","76","\u4E2D"],["high","100","\u9AD8"]]},"aurora-ionosphere":{mode:"quality",items:[["low","32","\u8F7B\u91CF"],["medium","50","\u5747\u8861"],["high","72","\u7CBE\u7EC6"]]},mountain:{mode:"steps",items:[["28","28","\u6D41\u7545"],["42","42","\u5747\u8861"],["57","57","\u5B8C\u6574"]]}},hn=[["cinema","\u7535\u5F71"],["lens","\u900F\u955C"],["ember","\u4F59\u70EC"]],bn=[["right","\u53F3"],["left","\u5DE6"],["top","\u4E0A"],["bottom","\u4E0B"]],g=null,f=null,X=!1,T=!1,R=null,It="all",K=0,v=null,m=null,dt=null,_t="";function Ft(){return T}function Rr(){return R}function O(e,t=!1){if(e&&console.info("[dsh-ccx]",e),t&&f&&T){let r=f.settings.querySelector(".particle-plugin-error");r&&(r.hidden=!1,r.textContent=e)}}function Ie(){if(!f)return;let e=document.body?.hasAttribute("data-ds-dark-theme")||document.documentElement.classList.contains("dark");f.host.setAttribute("data-theme",e?"dark":"light")}function _e(){if(!f)return;let t=document.querySelector('[data-slot="sidebar"]')?.parentElement,r=!1;t?r=t.getBoundingClientRect().width<48||getComputedStyle(t).display==="none":r=!0,r?f.host.setAttribute("data-sidebar-collapsed","true"):f.host.removeAttribute("data-sidebar-collapsed")}function Dt(e){let t=g?.getState();return t?e.id==="surface"?!!t.surfaces?.enabled:t.enabled?e.id==="custom"?t.mode==="wallpaper":t.mode==="scene"&&t.scene===e.id:!1:!1}function xn(){return It==="all"?Nt:It==="enabled"?Nt.filter(Dt):Nt.filter(e=>e.kind!=="scene")}function vn(e,t){return`<article class="preview-extension${e.ext?` ${e.ext}`:""}" data-card="${e.id}"><span class="preview-extension-icon" aria-hidden="true">${Bt(e.id)}</span><div class="preview-extension-copy"><div class="preview-extension-title-row"><h4>${S(e.title)}</h4><span class="preview-extension-status" data-enabled="${t}">${t?"\u5DF2\u542F\u7528":"\u672A\u542F\u7528"}</span></div></div><div class="preview-extension-actions"><button type="button" class="preview-extension-action" data-toggle-card="${e.id}" data-enabled="${t}" aria-pressed="${t}">${t?"\u505C\u7528":"\u542F\u7528"}</button><button type="button" class="particle-settings-trigger" data-open-settings="${e.id}" aria-expanded="${T&&R===e.id}" aria-label="\u8BBE\u7F6E ${S(e.title)}" title="\u8BBE\u7F6E">${Bt("surface").includes("viewBox")?'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 4h3M9 4h5M2 8h7M13 8h1M2 12h1M7 12h7"/><circle cx="7" cy="4" r="2"/><circle cx="11" cy="8" r="2"/><circle cx="5" cy="12" r="2"/></svg>':""}</button></div></article>`}function De(){if(!f)return;let e=xn(),t=e.map(n=>n.id).join("|");if(f.emptyNotice.hidden=e.length>0,t===_t&&f.cardsWrap.childElementCount===e.length){for(let n of e){let a=f.cardsWrap.querySelector(`[data-card="${n.id}"]`);if(!a)continue;let i=Dt(n),l=a.querySelector(".preview-extension-status");l&&(l.setAttribute("data-enabled",String(i)),l.textContent=i?"\u5DF2\u542F\u7528":"\u672A\u542F\u7528");let s=a.querySelector("[data-toggle-card]");s&&(s.setAttribute("data-enabled",String(i)),s.setAttribute("aria-pressed",String(i)),s.textContent=i?"\u505C\u7528":"\u542F\u7528");let p=a.querySelector("[data-open-settings]");p&&p.setAttribute("aria-expanded",String(T&&R===n.id))}return}let r=f.market.querySelector(".preview-market-list")?.scrollTop||0;f.cardsWrap.innerHTML=e.map(n=>vn(n,Dt(n))).join(""),_t=t;let o=f.market.querySelector(".preview-market-list");o&&r>0&&(o.scrollTop=r)}function q(e,t){return t?`<fieldset class="particle-settings-group"><div class="particle-group-head"><span class="particle-group-title">${S(e)}</span><button type="button" class="particle-group-reset" data-group-reset="${S(t)}">\u91CD\u7F6E</button></div>`:`<fieldset class="particle-settings-group"><legend>${S(e)}</legend>`}function ve(e,t){return`<div class="particle-control-row"><label for="ccx-f-${e.key}">${S(e.zh)}</label><input id="ccx-f-${e.key}" type="range" min="${e.min}" max="${e.max}" step="${e.step}" value="${t}" data-field="${e.key}" aria-label="${S(e.zh)}"><span class="particle-control-value"><output data-fieldval="${e.key}" title="\u53CC\u51FB\u76F4\u63A5\u8F93\u5165\u6570\u503C">${S(He(e,t))}</output></span></div>`}function I(e,t,r){return`<label class="particle-toggle-row">${S(t)}<input type="checkbox" data-toggle="${e}"${r?" checked":""}></label>`}function ye(e,t,r){let o=/^#[\da-fA-F]{6}$/.test(r||"")?r:"#ffffff";return`<label class="particle-color-row">${S(t)}<input type="color" value="${S(o)}" data-colorkey="${e}"></label>`}var yn=new Set(["glow-horizon","black-hole","particle-image","ascii-tiles","shallow-ocean","spectral-drape"]);function Ar(e){let t=yn.has(e),r=!!(lt()&&st()===e)&&t;return t?`<div class="glow-horizon-actions"><button type="button" data-act="replay"${r?"":" disabled"}>\u91CD\u64AD\u5F00\u573A</button><button type="button" data-act="draftreset">\u91CD\u7F6E\u5168\u90E8</button></div>`:'<div class="glow-horizon-actions single"><button type="button" data-act="draftreset">\u91CD\u7F6E\u5168\u90E8</button></div>'}function wn(e){let t=L(e);if(!t)return[];if(Array.isArray(t.groups)&&t.groups.length>0){let a=new Map((t.fields||[]).map(i=>[i.key,i]));return t.groups.map(i=>({group:i.key,legend:i.zh,fields:i.keys.map(l=>a.get(l)).filter(l=>!!l),resetGroupKey:i.key}))}let r=[],o={},n=dn[e]||{};for(let a of t.fields||[]){let i=a.group||"_";if(!o[i]){let l=n[i]||pn[i]||un[e]||"\u53C2\u6570";o[i]={group:i,legend:l,fields:[]},r.push(o[i])}o[i].fields.push(a)}return r}function Sn(e){let o=window[Symbol.for("code-codex:default-galleries:v1")]?.get(e),n=o?.images?.size??0,a="";return o?.images&&o.images.forEach(i=>{let l=i.thumbnail?`<img loading="lazy" src="data:${i.type||"image/png"};base64,${i.thumbnail}" alt="">`:'<span class="vthumb">\u{1F5BC}</span>';a+=`<span class="wallitem"><span class="wpick">${l}<span class="wname">${S(i.name||i.id)}</span></span></span>`}),`<details class="particle-source-details" open><summary class="particle-source-summary">\u56FE\u7247\u5E93<span class="particle-source-count">${n} \u4E2A\u5DF2\u4FDD\u5B58</span></summary><div class="particle-library-grid">${a||'<p class="particle-library-empty">\u56FE\u5E93\u5C1A\u672A\u5C31\u7EEA\uFF0C\u542F\u7528\u573A\u666F\u540E\u81EA\u52A8\u8F7D\u5165\u9ED8\u8BA4\u56FE\u3002</p>'}</div></details>`}function kn(e){let t=L(e),r=v||{},o=g?.getState()||null;if(e==="shallow-ocean"){if(!t)return'<div class="particle-settings-scroll"><p class="panel-note">\u573A\u666F schema \u5C1A\u672A\u52A0\u8F7D\u2026</p></div>';let c=!!(o&&o.enabled&&o.mode==="scene"&&o.scene==="shallow-ocean");return Cr(t,r,c)}let n='<div class="particle-settings-scroll">',a={};if(e==="pixel-sculpt"){let c=ze(o),u=Re(o),y=Be();return n+=`<p class="pixelSculpt-disabled" data-psnote${c?" hidden":""}>\u63D2\u4EF6\u5C1A\u672A\u542F\u7528\uFF1B\u8FD9\u91CC\u7684\u8BBE\u7F6E\u4F1A\u5728\u4E0B\u6B21\u542F\u7528\u65F6\u751F\u6548\u3002</p>`,n+='<div class="pixelSculpt-controls-host" data-pshost></div>',n+=`<label class="particle-toggle-row pixelSculpt-paused-row">\u6682\u505C\u52A8\u753B<input type="checkbox" data-toggle="__pspaused"${u?" checked":""}${c?"":" disabled"}></label>`,n+=`<div class="glow-horizon-actions single pixelSculpt-actions"><button type="button" data-act="psreset"${y?.inst?"":" disabled"}>\u91CD\u7F6E\u53C2\u6570</button></div>`,n+='<p class="particle-plugin-error" role="status" hidden></p></div>',n}if(!t)return'<div class="particle-settings-scroll"><p class="panel-note">\u573A\u666F schema \u5C1A\u672A\u52A0\u8F7D\u2026</p></div>';if(e==="blinking-squares"){n+=q("\u6E10\u9690\u65B9\u5411"),n+='<div class="heavenly-cloud-quality-toolbar dir4" role="group" aria-label="\u6E10\u9690\u65B9\u5411">';for(let[u,y]of bn)n+=`<button type="button" data-blinkdir="${u}" aria-pressed="${(r.direction||"right")===u}">${y}</button>`;n+="</div></fieldset>";let c=t.fields;n+=q("\u65B9\u5757\u4E0E\u95EA\u70C1");for(let u=0;u<Math.min(10,c.length);u++)n+=ve(c[u],E(r[c[u].key],c[u].min));n+="</fieldset>",n+=q("\u4EA4\u4E92\u4E0E\u8109\u51B2");for(let u=10;u<Math.min(20,c.length);u++)n+=ve(c[u],E(r[c[u].key],c[u].min));n+=I("mouseInteraction","\u9F20\u6807\u4EA4\u4E92",!!r.mouseInteraction),n+=I("keyboardInteraction","\u952E\u76D8\u968F\u673A\u6CE2\u7EB9",!!r.keyboardInteraction);for(let u=20;u<Math.min(22,c.length);u++)n+=ve(c[u],E(r[c[u].key],c[u].min));n+="</fieldset>",n+=q("\u5F00\u573A\u4E0E\u753B\u8D28");for(let u=22;u<c.length;u++)n+=ve(c[u],E(r[c[u].key],c[u].min));n+=I("introEnabled","\u542F\u7528\u5F00\u573A",!!r.introEnabled),n+=I("paused","\u6682\u505C\u52A8\u753B",!!r.paused),n+="</fieldset>",n+=q("\u989C\u8272");for(let u of t.colorFields||[])n+=ye(u.key,u.zh,String(r[u.key]||t.defaults[u.key]||"#ffffff"));return n+="</fieldset>",n+=Ar(e),n+='<p class="particle-plugin-error" role="status" hidden></p></div>',n}if(e==="black-hole"){n+='<div class="black-hole-preset-toolbar" role="group" aria-label="\u9ED1\u6D1E\u573A\u666F\u9884\u8BBE">';for(let[c,u]of hn)n+=`<button type="button" data-bhpreset="${c}">${u}</button>`;n+='<button type="button" class="black-hole-reset" data-act="draftreset">\u91CD\u7F6E</button></div>'}if(e==="glow-horizon"){n+='<div class="glow-horizon-direction-toolbar" role="group" aria-label="\u5730\u5E73\u7EBF\u65B9\u5411">';let c=[["top","\u2191","\u4E0A"],["bottom","\u2193","\u4E0B"],["left","\u2190","\u5DE6"],["right","\u2192","\u53F3"]];for(let[u,y,w]of c)n+=`<button type="button" data-direction="${u}" aria-pressed="${r.variant===u}"><span class="glow-horizon-direction-symbol">${y}</span>${w}</button>`;n+="</div>"}let i=fn[e],l=()=>{if(!i)return"";let c=q("\u6E32\u67D3\u8D28\u91CF");c+='<div class="heavenly-cloud-quality-toolbar" role="group" aria-label="\u6E32\u67D3\u8D28\u91CF">';for(let[u,y,w]of i.items){let x=i.mode==="steps"?String(E(r.steps,57)):String(r.quality||t.qualityDefault||"high");c+=`<button type="button" data-${i.mode}="${u}" aria-pressed="${x===u}"><strong>${y}</strong>${w}</button>`}if(c+="</div>",i.mode==="steps"){let u=t.fields.find(y=>y.key==="resolution");u&&(c+=ve(u,E(r.resolution,u.min)))}return`${c}</fieldset>`};i&&e!=="mountain"&&(n+=l());let s=wn(e);e==="mountain"&&s.length&&(s[0].fields=s[0].fields.filter(c=>c.key!=="resolution"));let p=new Map((t.groups||[]).map(c=>[c.key,c])),d=new Map((t.toggles||[]).map(c=>[c.key,c])),h=new Map((t.colorFields||[]).map(c=>[c.key,c]));for(let c of s){n+=q(c.legend,c.resetGroupKey);for(let y of c.fields)n+=ve(y,E(r[y.key],y.min));let u=p.get(c.group);if(u)for(let y of u.keys){let w=h.get(y);w&&(n+=ye(w.key,w.zh,String(r[w.key]||t.defaults[w.key]||"#ffffff")));let x=d.get(y);x&&(a[x.key]=!0,n+=I(x.key,x.zh,!!r[x.key]))}if(e==="black-hole"&&c.group==="light")for(let y of t.colorFields||[])n+=ye(y.key,y.zh,String(r[y.key]||t.defaults[y.key]||"#ffffff"));if(e==="black-hole"&&c.group==="renderer"&&(n+=I("paused","\u6682\u505C\u52A8\u753B",!!r.paused),a.paused=!0),e==="glow-horizon"&&c.group==="input"&&(n+=I("inertialWheel","\u6EDA\u8F6E\u60EF\u6027",!!r.inertialWheel),a.inertialWheel=!0),e==="particle-image"&&c.group==="source"&&(n+=Sn(e),n+=ye("backgroundColor","\u80CC\u666F",String(r.backgroundColor||"#000000")),n+=I("autoSwitch","\u81EA\u52A8\u5207\u6362",r.autoSwitch!==!1),a.autoSwitch=!0),e==="particle-image"&&c.group==="opening"){n+=I("introEnabled","\u7C92\u5B50\u6C47\u805A",!!r.introEnabled),a.introEnabled=!0;let y=!(lt()&&st()===e);n+=`<button type="button" class="particle-library-add" data-act="replay" style="margin:2px 4px 0;justify-self:start"${y?" disabled":""}>\u91CD\u64AD\u5F00\u573A</button>`}if(e==="particle-image"&&c.group==="pointer"&&(n+=I("cursorInteraction","\u9F20\u6807\u4EA4\u4E92",!!r.cursorInteraction),a.cursorInteraction=!0),e==="cloud-train")for(let y of t.colorFields||[])n+=ye(y.key,gn[y.key]||y.zh,String(r[y.key]||"#ffffff"));n+="</fieldset>"}i&&e==="mountain"&&(n+=l());let b=[...t.toggles||[]].sort((c,u)=>(c.key==="paused"?-1:0)-(u.key==="paused"?-1:0));for(let c of b)if(!a[c.key]){if(e==="particle-image"&&c.key==="showSourceImage"){n+=I("showSourceImage","\u663E\u793A\u6E90\u56FE",r.showSourceImage!==!1);continue}n+=I(c.key,c.zh,!!r[c.key])}if(t.colors){n+=q(mn[e]||"\u989C\u8272");let c=Array.isArray(r.colors)&&r.colors.length===t.colors.length?r.colors:t.colors;for(let u=0;u<t.colors.length;u++)n+=ye(`color${u}`,`\u989C\u8272 ${u+1}`,String(c[u]||t.colors[u]));n+="</fieldset>"}return n+=Ar(e),n+='<p class="particle-plugin-error" role="status" hidden></p></div>',n}function En(){let e=g?.getState(),t=g?.getWallpapers()||[],r=Math.max(1,Math.ceil(t.length/Ht));K>=r&&(K=r-1);let n=t.slice(K*Ht,(K+1)*Ht).map(l=>{let p=/^video\//.test(l.mime||"")?'<span class="vthumb">\u25B6</span>':`<img loading="lazy" src="${S(l.url)}" alt="">`;return`<span class="wallitem${e&&l.id===e.wallpaperId?" on":""}"><button type="button" class="wpick" data-wall="${S(l.id)}" title="${S(l.name)}">${p}<span class="wname">${S(l.name)}</span></button><button type="button" class="wdel" data-wdel="${S(l.id)}" title="\u5220\u9664" aria-label="\u5220\u9664 ${S(l.name)}">\u2715</button></span>`}).join(""),a=r>1?`<div class="wall-pager"><button type="button" data-wallpage="prev"${K<=0?" disabled":""}>\u2039</button><output>${K+1} / ${r}</output><button type="button" data-wallpage="next"${K>=r-1?" disabled":""}>\u203A</button></div>`:"",i=[["center","\u5C45\u4E2D"],["top","\u9876\u90E8"],["bottom","\u5E95\u90E8"],["left","\u5DE6\u4FA7"],["right","\u53F3\u4FA7"]];return`<div class="particle-settings-scroll"><details class="particle-source-details" open><summary class="particle-source-summary">\u56FE\u7247\u5E93<span class="particle-source-count">${t.length} \u4E2A\u5DF2\u4FDD\u5B58</span></summary><div class="particle-library-toolbar"><span class="particle-library-add" data-act="wallimport">\u6DFB\u52A0\u56FE\u7247<input type="file" data-act="wallfile" accept="image/*,video/mp4,video/webm" hidden></span><button type="button" class="particle-library-clear" data-act="wallclear"${t.length?"":" disabled"}>\u6E05\u7A7A</button></div><div class="particle-library-grid">${n||'<p class="particle-library-empty">\u8FD8\u6CA1\u6709\u58C1\u7EB8\uFF0C\u70B9\u300C\u6DFB\u52A0\u56FE\u7247\u300D\u5BFC\u5165\u56FE\u7247\u6216\u89C6\u9891\u3002</p>'}</div>`+a+"</details>"+q("\u7D20\u6750\u5C5E\u6027")+`<div class="particle-control-row"><label for="ccx-fit">\u753B\u9762\u9002\u914D</label><select id="ccx-fit" data-act="fit"><option value="cover"${e?.wallpaperFit==="cover"?" selected":""}>\u94FA\u6EE1</option><option value="contain"${e?.wallpaperFit==="contain"?" selected":""}>\u5B8C\u6574\u663E\u793A</option><option value="tile"${e?.wallpaperFit==="tile"?" selected":""}>\u5E73\u94FA</option></select><span class="particle-control-value"></span></div><div class="particle-control-row"><label for="ccx-pos">\u4F4D\u7F6E</label><select id="ccx-pos" data-act="pos">`+i.map(([l,s])=>`<option value="${l}"${e?.wallpaperPosition===l?" selected":""}>${s}</option>`).join("")+'</select><span class="particle-control-value"></span></div></fieldset><div class="glow-horizon-actions single"><button type="button" data-act="customreset">\u91CD\u7F6E\u53C2\u6570</button></div><p class="particle-plugin-error" role="status" hidden></p></div>'}function Mn(){let e=g?.getState(),t='<div class="particle-settings-scroll">';t+='<p class="panel-note">\u53EA\u8C03\u8282\u5E95\u8272\uFF0C\u6587\u5B57\u548C\u56FE\u6807\u4FDD\u6301\u6E05\u6670\u30020% \u5B8C\u5168\u900F\u660E\uFF0C100% \u5B8C\u5168\u906E\u6321\u80CC\u666F\u3002</p>',t+=q("\u5206\u533A\u4E0D\u900F\u660E\u5EA6");for(let r of xt){let o=$(E(e?.surfaces?.[r.key],H.surfaces[r.key]),0,100);t+=`<div class="particle-control-row surface-opacity-row"><label for="ccx-r-${r.key}">${S(r.zh)}</label><input id="ccx-r-${r.key}" type="range" min="0" max="100" step="1" value="${o}" data-region="${r.key}" aria-label="${S(r.zh)}"><span class="particle-control-value"><output data-regionval="${r.key}" title="\u53CC\u51FB\u76F4\u63A5\u8F93\u5165\u6570\u503C">${Math.round(o)}%</output></span><button type="button" data-rowreset="${r.key}" title="\u6062\u590D\u6B64\u9879\u9ED8\u8BA4\u503C" aria-label="\u6062\u590D${S(r.zh)}\u9ED8\u8BA4\u503C">\u21BA</button></div>`}t+="</fieldset>",t+=q("\u80CC\u666F\u8C03\u8282");for(let r of Tr){let o=E(e?.[r.key],H[r.key])*r.scale,n=r.scale===100?`${Math.round(o)}%`:`${o.toFixed(1)}px`;t+=`<div class="particle-control-row"><label for="ccx-p-${r.key}">${r.zh}</label><input id="ccx-p-${r.key}" type="range" min="${r.min}" max="${r.max}" step="${r.step}" value="${o}" data-slider="${r.key}" aria-label="${r.zh}"><span class="particle-control-value"><output data-sliderval="${r.key}" title="\u53CC\u51FB\u76F4\u63A5\u8F93\u5165\u6570\u503C">${n}</output></span></div>`}return t+="</fieldset>",t+='<button type="button" class="particle-library-clear" data-act="surfacereset" style="justify-self:stretch;margin:0">\u6062\u590D\u5168\u90E8\u9ED8\u8BA4\u503C</button>',t+='<p class="particle-plugin-error" role="status" hidden></p></div>',t}function Cn(){let e=g?.getState()||null;!f||!T||R!=="pixel-sculpt"||Mt(()=>g?.getState()||null,O).then(t=>{if(!f||!T||R!=="pixel-sculpt")return;let r=f.settings.querySelector("[data-pshost]");if(r&&t.inst)try{t.inst.mountControls(r,"zh")}catch{}jt(e)}).catch(t=>{O(`Pixel Sculpt \u8BBE\u7F6E\u52A0\u8F7D\u5931\u8D25\uFF1A${String(t?.message||t).slice(0,50)}`,!0)})}function jt(e){if(!f||!T||R!=="pixel-sculpt")return;let t=ze(e),r=f.settings.querySelector("[data-psnote]");r&&(r.hidden=t);let o=f.settings.querySelector('[data-toggle="__pspaused"]');o&&(o.checked=Re(e),o.disabled=!t);let n=f.settings.querySelector('[data-act="psreset"]');n&&(n.disabled=!Be()?.inst)}function _(e){let t=g?.getState();if(!t||!v||m!==e)return;let r=L(e),o=zt(r,v);Object.keys(o.delta).length>0?t.sceneParams[e]=o.delta:delete t.sceneParams[e],ie(e,o.full),g?.scheduleSave();let n=ge()?.layer;n&&(e==="particle-image"||e==="blinking-squares"||e==="ascii-tiles"||e==="spectral-drape")&&n.style.setProperty("--ap-layer-bg",rt(e,t));let a=!1,i=lt();t.enabled&&t.mode==="scene"&&t.scene===e&&i&&st()===e&&(a=Tt(i,o.full)),!a&&t.enabled&&t.mode==="scene"&&t.scene===e&&g&&it({getState:g.getState,onStatus:O})}function P(e){if(!f||!g)return;let t=g.getState(),r=Q.includes(e);e==="shallow-ocean"?f.settings.classList.add("shallow-ocean-panel"):f.settings.classList.remove("shallow-ocean-panel"),r&&(!m||m!==e)&&(v=Rt(L(e),t?.sceneParams?.[e]),m=e);let o=r?kn(e):e==="custom"?En():Mn(),n=e==="shallow-ocean"?Mr(E(v?.performanceMode,0),G().developerMode,ct):`<header class="particle-settings-header"><div class="particle-settings-heading"><p>\u5916\u89C2</p><h3>${S(Lr[e]||(e==="custom"?"Custom Background":"UI Surface Opacity"))}</h3></div><div class="particle-settings-header-actions"><button class="particle-settings-close" type="button" data-act="settingsclose" title="\u5173\u95ED\u8BBE\u7F6E (Esc)" aria-label="\u5173\u95ED\u8BBE\u7F6E">${ct}</button></div></header>`;f.settings.innerHTML=n+o,e==="pixel-sculpt"&&Cn()}function qt(){if(!f||!T)return;let e=f.market.getBoundingClientRect(),t=f.settings,r=12,o=t.getBoundingClientRect().width||(R==="shallow-ocean"?680:352),n=e.right+10;n+o+r>window.innerWidth&&(n=Math.max(r,window.innerWidth-o-r));let a=R?f.market.querySelector(`[data-open-settings="${R}"]`):null,i=a?a.getBoundingClientRect().top+a.getBoundingClientRect().height/2:e.top+36,l=t.getBoundingClientRect().height||380,s=$(i-28,r,Math.max(r,window.innerHeight-l-r));t.style.left=`${Math.round(n)}px`,t.style.top=`${Math.round(s)}px`,t.style.setProperty("--cle-anchor-y",`${Math.round($(i-s,20,Math.max(20,l-20)))}px`),t.setAttribute("data-side","right")}function we(){f&&(T=!1,R=null,v=null,m=null,f.settings.hidden=!0,De())}function Pn(e){if(f){if(T&&R===e){we();return}T=!0,R=e,m=null,v=null,P(e),f.settings.hidden=!1,qt(),De()}}function Vt(){f&&(X=!1,f.market.hidden=!0,f.trigger.setAttribute("aria-expanded","false"),we())}function $n(){f&&(X=!X,f.market.hidden=!X,f.trigger.setAttribute("aria-expanded",String(X)),X?(Ie(),_e(),De()):we())}function An(e){let r=e.closest(".particle-control-row")?.querySelector('input[type="range"]');if(!r)return;let o=e.textContent?.includes("%")??!1,n=e.dataset.fieldval,i=!!(n&&m?L(m)?.fields.find(c=>c.key===n):null)?.percent||o,l=i&&Number(r.max)<=1?Number(r.min)*100:Number(r.min),s=i&&Number(r.max)<=1?Number(r.max)*100:Number(r.max),p=i&&Number(r.max)<=1?Math.round(Number(r.value)*100):Number(r.value),d=document.createElement("input");d.type="number",d.className="particle-value-editor",d.min=String(l),d.max=String(s),d.step=i&&Number(r.max)<=1?"1":r.step||"any",d.value=String(p),e.hidden=!0,e.parentElement?.appendChild(d),d.focus(),d.select();let h=!1,b=c=>{if(!h){if(h=!0,c){let u=Number(d.value);if(Number.isFinite(u)){let y=i&&Number(r.max)<=1?u/100:u,w=$(y,Number(r.min),Number(r.max));r.value=String(w),r.dispatchEvent(new Event("input",{bubbles:!0}))}}d.remove(),e.hidden=!1}};d.addEventListener("keydown",c=>{c.key==="Enter"?(c.preventDefault(),b(!0)):c.key==="Escape"&&(c.preventDefault(),b(!1))}),d.addEventListener("blur",()=>b(!0))}function Tn(e){let t=g?.getState();!t||!g||(e==="surface"?t.surfaces.enabled=!t.surfaces.enabled:e==="custom"?t.enabled&&t.mode==="wallpaper"?t.enabled=!1:(t.enabled=!0,t.mode="wallpaper"):t.enabled&&t.mode==="scene"&&t.scene===e?t.enabled=!1:(t.enabled=!0,t.mode="scene",t.scene=e),g.scheduleSave(),g.applyAll(),T&&R==="shallow-ocean"&&P("shallow-ocean"))}function zr(e){!f||!X&&!T||(e.composedPath?e.composedPath():[]).includes(f.host)||Vt()}function Br(e){if(e.key==="Escape"){if(T){we();return}X&&Vt()}}function Ln(){if(!f)return;let{trigger:e,market:t,settings:r,shadow:o}=f;e.addEventListener("click",n=>{n.stopPropagation(),$n()}),t.addEventListener("click",n=>{let a=n.target;if(a.closest('[data-act="marketclose"]')){Vt();return}let i=a.closest("[data-cat]");if(i&&i.dataset.cat){It=i.dataset.cat;let p=t.querySelectorAll("[data-cat]");for(let d=0;d<p.length;d++)p[d].setAttribute("aria-selected",String(p[d]===i));De();return}let l=a.closest("[data-toggle-card]");if(l?.dataset.toggleCard){Tn(l.dataset.toggleCard);return}let s=a.closest("[data-open-settings]");s?.dataset.openSettings&&Pn(s.dataset.openSettings)}),r.addEventListener("dblclick",n=>{let a=n.target.closest("output");a&&a.closest(".particle-control-value")&&An(a)}),r.addEventListener("click",n=>{let a=n.target,i=g?.getState();if(!i||!g)return;if(a.closest('[data-act="settingsclose"]')){we();return}if(a.closest('[data-act="psreset"]')){let x=Be();if(x?.inst){try{x.inst.reset()}catch{}delete i.sceneParams["pixel-sculpt"],ie("pixel-sculpt",{paused:!1}),g.scheduleSave(),jt(i),O("Pixel Sculpt \u53C2\u6570\u5DF2\u91CD\u7F6E")}return}let l=a.closest("[data-group-reset]");if(l&&m&&v){let x=l.dataset.groupReset,k=L(m),C=k?.groups?.find(z=>z.key===x);if(k&&C){for(let z of C.keys)z in k.defaults&&(v[z]=k.defaults[z]);v=le(k,v),P(m),_(m)}return}if(a.closest('[data-act="draftreset"]')){if(!m)return;let x=L(m);v=x?.defaults?le(x,x.defaults):{},m==="shallow-ocean"&&G().resetPopulation(),P(m),_(m);return}if(a.closest('[data-act="replay"]')){m&&Lt(m);return}if(a.closest('[data-act="surfacereset"]')){i.surfaces={...H.surfaces},i.dim=H.dim,i.blur=H.blur,g.scheduleSave(),g.applyAll(),P("surface");return}if(a.closest('[data-act="customreset"]')){i.wallpaperFit=H.wallpaperFit,i.wallpaperPosition=H.wallpaperPosition,g.scheduleSave(),g.applyAll(),P("custom");return}let s=a.closest("[data-rowreset]");if(s?.dataset.rowreset){let x=s.dataset.rowreset,k=$(E(H.surfaces[x],66),0,100);i.surfaces[x]=k;let C=r.querySelector(`[data-region="${x}"]`);C&&(C.value=String(k));let z=r.querySelector(`[data-regionval="${x}"]`);z&&(z.textContent=`${Math.round(k)}%`),et(i,ge()?.layer||null),g.scheduleSave();return}let p=a.closest("[data-quality]");if(p?.dataset.quality&&v&&m){v.quality=p.dataset.quality,P(m),_(m);return}let d=a.closest("[data-steps]");if(d?.dataset.steps&&v&&m){v.steps=Number(d.dataset.steps),P(m),_(m);return}let h=a.closest("[data-direction]");if(h?.dataset.direction&&v&&m){v.variant=h.dataset.direction,P(m),_(m);return}let b=a.closest("[data-blinkdir]");if(b?.dataset.blinkdir&&v&&m){v.direction=b.dataset.blinkdir,P(m),_(m);return}let c=a.closest("[data-bhpreset]");if(c?.dataset.bhpreset&&v&&m){let x=L(m),k=x?.presets?.[c.dataset.bhpreset];k&&(v=le(x,{...v,...k}),P(m),_(m));return}let u=a.closest("[data-wallpage]");if(u?.dataset.wallpage){K+=u.dataset.wallpage==="prev"?-1:1,P("custom");return}if(a.closest('[data-act="wallimport"]')){r.querySelector('[data-act="wallfile"]')?.click();return}if(a.closest('[data-act="wallclear"]')){Te("/wallpaper-clear.json",{}).then(x=>{x?.ok&&(g?.setWallpapers([]),K=0,i.wallpaperId=null,i.mode==="wallpaper"&&(i.enabled=!1),g?.scheduleSave(),g?.applyAll(),P("custom"))}).catch(x=>O(`\u6E05\u7A7A\u5931\u8D25\uFF1A${String(x)}`,!0));return}let y=a.closest("[data-wall]");if(y?.dataset.wall){i.wallpaperId=y.dataset.wall,i.mode="wallpaper",i.enabled=!0,g.scheduleSave(),g.applyAll(),P("custom");return}let w=a.closest("[data-wdel]");if(w?.dataset.wdel){let x=w.dataset.wdel;Te("/wallpaper-delete.json",{id:x}).then(k=>{k?.ok&&(g?.setWallpapers(k.wallpapers||[]),i.wallpaperId===x&&(i.wallpaperId=k.wallpapers?.[0]?.id||null),g?.scheduleSave(),g?.applyAll(),P("custom"))}).catch(k=>O(`\u5220\u9664\u5931\u8D25\uFF1A${String(k)}`,!0))}}),r.addEventListener("input",n=>{let a=n.target,i=g?.getState();if(!(!a||!i||!g)){if(a.dataset.field&&v&&m){let l=a.dataset.field,s=Number(a.value);v[l]=s;let p=L(m)?.fields.find(h=>h.key===l),d=r.querySelector(`[data-fieldval="${l}"]`);d&&(d.textContent=p?He(p,s):String(s)),_(m);return}if(a.dataset.region){let l=a.dataset.region,s=$(Number(a.value),0,100);i.surfaces[l]=s;let p=r.querySelector(`[data-regionval="${l}"]`);p&&(p.textContent=`${Math.round(s)}%`),et(i,ge()?.layer||null),g.scheduleSave();return}if(a.dataset.slider){let l=a.dataset.slider,s=Tr.find(h=>h.key===l);if(!s)return;let p=Number(a.value);i[l]=p/s.scale;let d=r.querySelector(`[data-sliderval="${l}"]`);d&&(d.textContent=s.scale===100?`${Math.round(p)}%`:`${p.toFixed(1)}px`),g.scheduleSave(),g.applyAll();return}if(a.dataset.colorkey&&v&&m){let l=a.dataset.colorkey;if(/^color\d+$/.test(l)){let s=L(m)?.colors||[];Array.isArray(v.colors)||(v.colors=[...s]),v.colors[Number(l.slice(5))]=a.value}else v[l]=a.value;_(m)}}}),r.addEventListener("change",n=>{let a=n.target,i=g?.getState();if(!(!a||!i||!g)){if(a.dataset.toggle==="__pspaused"){let l=!!a.checked;l?i.sceneParams["pixel-sculpt"]={paused:!0}:delete i.sceneParams["pixel-sculpt"],ie("pixel-sculpt",{paused:l}),g.scheduleSave();try{Be()?.inst?.setSettings({paused:l})}catch{}return}if(a.dataset.toggle&&v&&m){let l=a.dataset.toggle,s=L(m)?.defaults?.[l];v[l]=typeof s=="number"?a.checked?1:0:!!a.checked,_(m);return}if(a.dataset.act==="fit"){i.wallpaperFit=a.value||"cover",g.scheduleSave(),g.applyAll();return}if(a.dataset.act==="pos"){i.wallpaperPosition=a.value||"center",g.scheduleSave(),g.applyAll();return}if(a.dataset.act==="wallfile"&&a.files?.[0]){let l=a.files[0];if(a.value="",l.size>Yt){O("\u6587\u4EF6\u8D85\u8FC7 200MB \u4E0A\u9650",!0);return}l.arrayBuffer().then(s=>Xt(l.name,s)).then(s=>{s?.ok&&s.wallpaper?(g?.setWallpapers(s.wallpapers||[]),K=0,i.wallpaperId=s.wallpaper.id,i.mode="wallpaper",i.enabled=!0,g?.scheduleSave(),g?.applyAll(),P("custom")):O(`\u5BFC\u5165\u5931\u8D25\uFF1A${s?.error||"?"}`,!0)}).catch(s=>O(`\u5BFC\u5165\u5931\u8D25\uFF1A${String(s)}`,!0))}}}),dt=Pr(o,{panel:r,state:()=>g?.getState()||null,draft:()=>v,schema:()=>m?L(m):null,commit:n=>_(n),onResetAll:()=>{if(!m)return;let n=L(m);v=n?.defaults?le(n,n.defaults):{},G().resetPopulation(),P(m),_(m)},onReplay:()=>Lt("shallow-ocean"),onClose:we,onStatus:O},()=>{T&&R==="shallow-ocean"&&P("shallow-ocean")}),G().setSyncCallback(n=>{let a=g?.getState();if(!a)return;let i=L("shallow-ocean"),s={...Rt(i,a.sceneParams["shallow-ocean"]),...n};v&&m==="shallow-ocean"&&Object.assign(v,n);let p=zt(i,s);Object.keys(p.delta).length>0?a.sceneParams["shallow-ocean"]=p.delta:delete a.sceneParams["shallow-ocean"],ie("shallow-ocean",p.full),g?.scheduleSave()}),document.addEventListener("click",zr,!0),document.addEventListener("keydown",Br,!0)}function Or(e){if(g=e,f&&document.documentElement.contains(f.host))return;let t=document.createElement("div");t.id=ln,t.setAttribute("data-dsh-ccx","panel");let r=t.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=$r,r.appendChild(o);let n=document.createElement("button");n.type="button",n.id=sn,n.className="trigger",n.title="\u5916\u89C2\u4E0E\u52A8\u6001\u80CC\u666F (dsh-ccx)",n.setAttribute("aria-expanded","false"),n.innerHTML=Er,r.appendChild(n);let a=document.createElement("div");a.className="preview-market-popover",a.hidden=!0,a.innerHTML=`<header class="preview-market-header"><h3>Plugin Market</h3><button class="preview-market-close" type="button" data-act="marketclose" title="\u5173\u95ED" aria-label="\u5173\u95ED">${ct}</button></header><div class="preview-market-list"><div class="preview-market-categories" role="tablist"><button type="button" class="preview-market-category" data-cat="all" aria-selected="true">\u5168\u90E8</button><button type="button" class="preview-market-category" data-cat="enabled" aria-selected="false">\u5DF2\u542F\u7528</button><button type="button" class="preview-market-category" data-cat="custom" aria-selected="false">\u81EA\u5B9A\u4E49</button></div><section class="preview-market-section"><div class="preview-market-section-list"></div><p class="cat-empty" hidden>\u6B64\u5206\u7C7B\u4E0B\u6CA1\u6709\u9879\u76EE\u3002</p></section></div>`,r.appendChild(a);let i=document.createElement("div");i.className="particle-settings-panel",i.hidden=!0,r.appendChild(i);let l=a.querySelector(".preview-market-section-list"),s=a.querySelector(".cat-empty");f={host:t,shadow:r,trigger:n,market:a,settings:i,cardsWrap:l,emptyNotice:s},(document.body||document.documentElement).appendChild(t),Ie(),_e(),Ln()}function Hr(e){!f||!e||(Ie(),_e(),De(),T&&R==="pixel-sculpt"&&jt(e),T&&R==="shallow-ocean"&&P("shallow-ocean"))}function Nr(){if(document.removeEventListener("click",zr,!0),document.removeEventListener("keydown",Br,!0),dt&&(dt(),dt=null),f?.host.parentNode)try{f.host.parentNode.removeChild(f.host)}catch{}f=null,g=null,X=!1,T=!1,R=null,v=null,m=null,_t=""}var Rn=8e3,zn=280,M=null,je=[],qe=0,Gt=0,se=null,Fe=null,ce=null,ke=null,Ee=null,Me=0,Se=!1;function Bn(){M&&(se&&clearTimeout(se),se=setTimeout(()=>{if(se=null,!M)return;let e=++Gt,t=ue(M);Te("/state-save.json",{settings:t}).then(r=>{e===Gt&&r?.ok&&r.settings&&(M=ue(r.settings),qe=E(M.savedAt,0))}).catch(r=>{e===Gt&&O(`\u4FDD\u5B58\u5931\u8D25\uFF1A${String(r?.message||r)}`,!0)})},zn))}function ut(){if(!M)return;let{layer:e}=J();Or({getState:()=>M,getWallpapers:()=>je,setWallpapers:t=>{je=t},scheduleSave:Bn,applyAll:ut,onStatus:O}),or(M),yr({getState:()=>M,onStatus:O}),vt(M,e),re(M,e),Hr(M)}function On(){Fe||(Fe=setInterval(()=>{document.hidden||mt().then(e=>{if(!e?.settings)return;let t=ue(e.settings),r=E(t.savedAt,0);if(r&&r!==qe){let o=M?JSON.stringify(gt(M)):"";M=t,qe=r,Array.isArray(e.wallpapers)&&(je=e.wallpapers),o!==JSON.stringify(gt(M))&&ut()}}).catch(()=>{})},Rn))}function _r(){Me||(Me=requestAnimationFrame(()=>{if(Me=0,!!Se){if(_e(),M){let e=J().layer;re(M,e)}Ft()&&qt()}}))}function Ir(){!ke&&document.body&&(ke=new MutationObserver(()=>{Ie(),M&&vt(M,J().layer)}),ke.observe(document.body,{attributes:!0,attributeFilter:["data-ds-dark-theme","class"]}));let e=document.getElementById("root")||document.body;!Ee&&e&&(Ee=new MutationObserver(()=>{_r()}),Ee.observe(e,{attributes:!0,attributeFilter:["class","style","data-collapsed"],subtree:!1,childList:!0}))}function Dr(){ce&&clearTimeout(ce),ce=setTimeout(()=>{ce=null,_r()},120)}function Hn(){se&&(clearTimeout(se),se=null),Fe&&(clearInterval(Fe),Fe=null),ce&&(clearTimeout(ce),ce=null),Me&&(cancelAnimationFrame(Me),Me=0),ke&&(ke.disconnect(),ke=null),Ee&&(Ee.disconnect(),Ee=null),window.removeEventListener("resize",Dr),Xe(),yt(),wr(),ar(),Nr(),M=null,je=[],qe=0}function Nn(e){Se||(Se=!0,e.effect(()=>()=>{Se=!1,Hn()},`${Wt}: reset apply guard`),br(),J(),Zt().then(()=>{let t=Rr();Ft()&&t&&Q.includes(t)&&P(t)}),mt().then(t=>{Se&&(M=ue(t?.settings),Array.isArray(t?.wallpapers)&&(je=t.wallpapers),qe=E(M.savedAt,0),ut(),On(),Ir())}).catch(()=>{Se&&(M=ue(null),ut(),Ir())}),window.addEventListener("resize",Dr))}var In=[];

		return module.exports;
	}
});
