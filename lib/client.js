/**
 * dsh-awesome-appearances —— 客户端半边（浏览器 bundle）v0.3。
 *
 * 手写、零打包器、零新增依赖（样板照 @dsh-external/dsh-blender-plugin 的
 * lib/client.js：window.__ModuleLoader__.load({ id, factory })）。
 *
 * v0.3 起效果对齐 code-codex 原仓库（github.com/Rice-dog/code-codex，MIT）：
 *   ① 背景场景 —— 原仓库首方场景渲染器原样 vendor（lib/vendor/code-codex/，
 *      经宿主 /dsh-appearances/vendor/<id>.js 下发）。渲染器自注册在
 *      window[Symbol.for("code-codex:background-modules:v1")]，startup(元素, settings)
 *      自包含运行（自带 Resize/可见性/掉上下文/reduced-motion 处理），本文件只管
 *      生命周期：懒加载 → startup → updateSettings → dispose。
 *   ② UI 表面 —— 原仓库同一套两层做法：
 *      a) transparent-background 式通配透明（body 下全部结构元素背景/背滤清零）；
 *      b) surface-opacity 式分区蒙版：DSH 的稳定 data-slot 钩子（sidebar / main /
 *         rightbar / conversation.header / conversation.input.dock）各自一块
 *         rgba(底色, var(--ap-mask-*)) 蒙版，区域不透明度 0–100% 独立可调。
 *      不再使用 overrideTokens（v0.2 方案，效果不对）。
 *   ③ 壁纸 —— 本地图片/视频导入（host 路由），画在场景层同位。
 *   ④ 设置面板 —— Shadow DOM：实时预览舞台（同渲染器跑在 640×360 小盒里）、
 *      场景卡、素材库分页、双语参数网格、分区蒙版滑杆；Esc/外点关闭。
 *
 * 约束（沿用 whale-widget 的教训）：theme 等可选服务绝不进 exports.inject；
 * 不注册消耗型全局监听；卸载全部资源经 ctx.effect 清理。
 */

window.__ModuleLoader__.load({
	id: "dsh-awesome-appearances",
	factory: function (require) {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		// ─────────────────────────── 常量 ───────────────────────────

		var PLUGIN_ID = "dsh-awesome-appearances";
		var LAYER_ID = "dsh-ap-layer";
		var TRIGGER_ID = "dsh-ap-trigger";
		var PANEL_ID = "dsh-ap-panel";
		var API_BASE = "/dsh-appearances";
		var BG_STYLE_ID = "dsh-ap-surface-style";
		var REGISTRY_SYM = Symbol.for("code-codex:background-modules:v1");

		// 原仓库首方场景（lib/vendor/code-codex/，MIT）—— 全部 10 种动态背景
		var SCENES = [
			{ id: "milky-way", label: "银河", en: "Milky Way", swatch: "linear-gradient(135deg,#1b0f2e,#5a2a84 45%,#d81159 75%,#fbb13c)" },
			{ id: "glow-horizon", label: "辉光地平线", en: "Glow Horizon", swatch: "linear-gradient(180deg,#05060a 55%,#3b0d3a 72%,#d81159 88%,#fbb13c 97%)" },
			{ id: "mountain", label: "层峦", en: "Layered Mountain", swatch: "linear-gradient(180deg,#0b1026 40%,#274690 62%,#0c1440 78%,#05070f)" },
			{ id: "heavenly-cloud", label: "云穹", en: "Heavenly Cloud", swatch: "linear-gradient(135deg,#07101f,#123a5c 50%,#7fd4e8 85%,#e8f6ff)" },
			{ id: "aurora-ionosphere", label: "极光电离层", en: "Aurora Ionosphere", swatch: "linear-gradient(180deg,#020610 30%,#062f3a 60%,#2ee6a8 82%,#a4f9e0)" },
			{ id: "black-hole", label: "黑洞", en: "Black Hole", swatch: "radial-gradient(circle at 50% 52%,#000 6%,#ff9a3c 16%,#7a2d0c 30%,#05070f 62%)" },
			{ id: "cloud-train", label: "云列车", en: "Cloud Train", swatch: "linear-gradient(180deg,#05070d 35%,#123049 60%,#3f7fae 82%,#c8e6f5)" },
			{ id: "particle-image", label: "粒子成像", en: "Particle Image", swatch: "conic-gradient(from 210deg at 50% 50%,#0b0e17,#3d5a99 30%,#8fb7ff 55%,#0b0e17 80%)" },
			{ id: "pixel-sculpt", label: "像素雕塑", en: "Pixel Sculpt", swatch: "conic-gradient(from 30deg at 50% 50%,#101423,#274690 35%,#9be1ff 60%,#101423 85%)" },
			{ id: "blinking-squares", label: "闪烁方块", en: "Blinking Squares", swatch: "conic-gradient(from 45deg,#0d1420,#1f3a5c 25%,#4fd1c5 50%,#0d1420 75%)" },
		];
		var SCENE_IDS = SCENES.map(function (s) { return s.id; });
		var GALLERIES_SYM = Symbol.for("code-codex:default-galleries:v1");
		var GALLERY_SCENES = { "particle-image": true, "pixel-sculpt": true };

		// DSH 稳定布局钩子（data-slot，见 ui-layout 产物）
		var REGION_ROWS = [
			{ key: "sidebar", zh: "会话侧栏", en: "Sidebar", selector: '[data-slot="sidebar"]', base: "21,22,26" },
			{ key: "conversation", zh: "对话区", en: "Conversation", selector: '[data-slot="main"]', base: "20,21,24" },
			{ key: "composer", zh: "消息输入区", en: "Composer", selector: '[data-slot="conversation.input.dock"],[data-composer-seat]', base: "28,30,35" },
			{ key: "header", zh: "标题栏", en: "Title bar", selector: '[data-slot="conversation.header"]', base: "24,25,29" },
			{ key: "right", zh: "右侧栏", en: "Right panel", selector: '[data-slot="rightbar"]', base: "21,22,26" },
		];

		// 与宿主半侧 lib/index.js 的 DEFAULT_SETTINGS 保持一致
		var DEFAULTS = {
			version: 4,
			enabled: true,
			mode: "scene",
			scene: "milky-way",
			wallpaperId: null,
			wallpaperFit: "cover",
			wallpaperPosition: "center",
			surfaces: { enabled: true, sidebar: 66, conversation: 58, composer: 86, header: 78, right: 66 },
			sceneParams: {},
			dim: 0.28,
			blur: 0,
			quality: "auto",
			savedAt: 0,
		};

		var SCHEMAS = null;          // 每场景设置 schema（宿主 /scene-schemas.json，原版抽屉字段）
		var schemaPromise = null;

		function ensureSchemas() {
			if (SCHEMAS) return Promise.resolve(SCHEMAS);
			if (!schemaPromise) {
				schemaPromise = apiGet("/scene-schemas.json").then(function (s) {
					SCHEMAS = s && typeof s === "object" ? s : {};
					// schema 就绪后强制重建抽屉草稿（首屏可能在 schema 到达前就渲染了面板）
					draftScene = null;
					if (panelOpen && state) { ensureDrawerDraft(); renderDrawer(); refreshDrawer(); }
					return SCHEMAS;
				}).catch(function () {
					schemaPromise = null;
					return {};
				});
			}
			return schemaPromise;
		}

		function schemaOf(sceneId) {
			return SCHEMAS && SCHEMAS[sceneId] ? SCHEMAS[sceneId] : null;
		}

		// 场景 store 的完整设置：schema 默认值 + 用户覆盖（state.sceneParams[scene]）
		function buildStoreSettings(sceneId) {
			var sch = schemaOf(sceneId);
			var base = sch && sch.defaults ? Object.assign({}, sch.defaults) : {};
			var overrides = state && state.sceneParams && state.sceneParams[sceneId];
			if (overrides && typeof overrides === "object") {
				for (var k in overrides) {
					if (Object.prototype.hasOwnProperty.call(overrides, k)) base[k] = overrides[k];
				}
			}
			return base;
		}

		var state = null;            // 当前生效设置（宿主持久化副本）
		var savedAtLocal = 0;        // 本端已采纳的 savedAt（自己的保存回包也会更新它）
		var saveTimer = null;
		var pollTimer = null;

		// ─────────────────────── 小工具 ───────────────────────

		function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
		function num(v, dflt) { var n = Number(v); return Number.isFinite(n) ? n : dflt; }

		function apiGet(path) {
			return fetch(API_BASE + path, { credentials: "omit" }).then(function (r) {
				if (!r.ok) throw new Error("HTTP " + r.status);
				return r.json();
			});
		}
		function apiPostJson(path, payload) {
			return fetch(API_BASE + path, {
				method: "POST",
				credentials: "omit",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			}).then(function (r) { return r.json(); });
		}

		// ─────────────────────── 背景层（对齐原仓库 layer 做法） ───────────────────────

		var layer = null;       // fixed 全屏层（body 首子节点，z-index:-1）
		var bgWrap = null;      // filter（blur/saturate）作用层
		var bgHost = null;      // 场景渲染器/壁纸的父容器
		var dimEl = null;       // 压暗层
		var bgInstance = null;  // 当前原版渲染器实例
		var bgSceneId = null;   // bgInstance 对应的场景 id（防竞态）
		var vendorScripts = {}; // 已注入的 <script>（按场景 id）

		function ensureLayer() {
			if (layer && document.body && document.body.contains(layer)) return;
			layer = document.createElement("div");
			layer.id = LAYER_ID;
			layer.setAttribute("data-dsh-awesome-appearances", "background");
			layer.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;"
				+ "width:100vw;height:100vh;margin:0;padding:0;contain:strict;background:#07090f;";
			bgWrap = document.createElement("div");
			bgWrap.style.cssText = "position:absolute;inset:0;overflow:hidden;";
			bgHost = document.createElement("div");
			bgHost.style.cssText = "position:absolute;inset:0;";
			dimEl = document.createElement("div");
			dimEl.style.cssText = "position:absolute;inset:0;background:transparent;";
			bgWrap.appendChild(bgHost);
			layer.appendChild(bgWrap);
			layer.appendChild(dimEl);
			var body = document.body || document.documentElement;
			body.prepend(layer); // 原仓库同款：body 首子节点
		}

		// ─────────────────── 原版场景渲染器生命周期 ───────────────────

		// 各场景设置存储键（渲染器自己从 localStorage 读，合并内置默认值；
		// 宿主契约 startup(target, onError) 不传设置——第二参是错误回调）
		var STORE_KEYS = {
			"milky-way": "code-codex:milky-way-background:v1",
			"glow-horizon": "code-codex:glow-horizon-background:v1",
			"mountain": "code-codex:mountain-settings:v1",
			"heavenly-cloud": "code-codex:heavenly-cloud-background:v1",
			"aurora-ionosphere": "code-codex:aurora-ionosphere-background:v1",
			"black-hole": "code-codex:black-hole-background:v1",
			"cloud-train": "code-codex:cloud-train-settings:v1",
			"blinking-squares": "code-codex:blinking-squares-background:v1",
			"particle-image": "code-codex:particle-image-background:v1",
			"pixel-sculpt": "code-codex:pixel-sculpt-settings:v1",
		};

		function writeSceneSetting(sceneId, patch) {
			var key = STORE_KEYS[sceneId];
			if (!key) return;
			try {
				var cur = {};
				try { cur = JSON.parse(localStorage.getItem(key) ?? "{}") || {}; } catch (e) {}
				localStorage.setItem(key, JSON.stringify(Object.assign({}, cur, patch)));
			} catch (e) {}
		}


		// particle-image / pixel-sculpt 需要"默认画廊"：宿主在 Codex 里由
		// explorer-ui 塞进 window[default-galleries]，这里按索引 JSON 自行播种
		// （entry 形状见原仓库 Pt()：{count,version,images:Map<id,{data,thumbnail(base64),size,sha256,...}>}）
		var galleryPromises = {};
		function ensureGallery(id) {
			if (galleryPromises[id]) return galleryPromises[id];
			galleryPromises[id] = apiGet("/vendor-galleries.json").then(function (index) {
				var meta = index && index[id];
				if (!meta) throw new Error("gallery index missing: " + id);
				return Promise.all(meta.images.map(function (img) {
					var load = function (file) {
						return fetch(API_BASE + "/vendor-media?file=" + encodeURIComponent(file))
							.then(function (r) {
								if (!r.ok) throw new Error("media HTTP " + r.status);
								return r.arrayBuffer();
							})
							.then(function (buf) {
								var bytes = new Uint8Array(buf);
								var bin = "";
								var chunk = 0x8000;
								for (var i = 0; i < bytes.length; i += chunk) {
									bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
								}
								return btoa(bin);
							});
					};
					return load(img.dataFile).then(function (dataB64) {
						var entry = {
							id: img.id, name: img.name, type: img.type, size: img.size,
							sha256: img.sha256, data: dataB64, createdAt: img.createdAt || 0,
						};
						if (img.thumbFile) {
							return load(img.thumbFile).then(function (tB64) {
								entry.thumbnail = tB64;
								return entry;
							});
						}
						return entry;
					});
				})).then(function (entries) {
					var images = new Map();
					for (var i = 0; i < entries.length; i++) images.set(entries[i].id, entries[i]);
					var reg = window[GALLERIES_SYM] = window[GALLERIES_SYM] || new Map();
					reg.set(id, { count: meta.count, version: meta.version, images: images });
					return true;
				});
			}).catch(function (err) {
				delete galleryPromises[id]; // 允许重试
				throw err;
			});
			return galleryPromises[id];
		}

		function registry() {
			return window[REGISTRY_SYM] || null;
		}

		// 懒加载 vendor 场景脚本 → 返回注册表条目（{startup,...}）
		function ensureVendorScene(id) {
			return new Promise(function (resolve, reject) {
				var reg = registry();
				if (reg && reg.get(id)) { resolve(reg.get(id)); return; }
				var tag = vendorScripts[id];
				if (!tag) {
					tag = document.createElement("script");
					tag.src = API_BASE + "/vendor/" + id + ".js";
					tag.onerror = function () { delete vendorScripts[id]; reject(new Error("vendor script load failed: " + id)); };
					(document.head || document.documentElement).appendChild(tag);
					vendorScripts[id] = tag;
				}
				var waits = 0;
				var timer = setInterval(function () {
					var reg2 = registry();
					if (reg2 && reg2.get(id)) {
						clearInterval(timer);
						resolve(reg2.get(id));
					} else if (++waits > 100) {
						clearInterval(timer);
						reject(new Error("registry timeout: " + id));
					}
				}, 60);
			});
		}

		// 分代容器：粒子框架场景有跨场景启动协调（startup-hold），
		// dispose 后不能立刻清 DOM——旧容器延迟移除，新场景进新容器
		var currentStage = null;

		function newStage() {
			currentStage = document.createElement("div");
			currentStage.style.cssText = "position:absolute;inset:0;";
			bgHost.appendChild(currentStage);
			return currentStage;
		}

		function retireStage(stage) {
			if (!stage) return;
			// 4s > 场景开场动画（introDuration ≤2.8s）：粒子框架的场景切换握手
			// 依赖旧 layer 短暂共存，过早移除会让共享 startup-hold 卡死新场景
			setTimeout(function () {
				try { if (stage.parentNode) stage.parentNode.removeChild(stage); } catch (e) {}
			}, 4000);
		}

		function activeStage() {
			if (!currentStage || !bgHost.contains(currentStage)) return newStage();
			return currentStage;
		}

		function disposeBgInstance() {
			bgSceneId = null;
			if (bgInstance) {
				try { bgInstance.dispose && bgInstance.dispose(); } catch (e) {}
				bgInstance = null;
			}
			retireStage(currentStage);
			currentStage = null;
		}

		function paintFallback(text) {
			var stage = activeStage();
			stage.innerHTML = "";
			var tip = document.createElement("div");
			tip.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;"
				+ "color:#4d5a78;font-size:13px;font-family:system-ui,sans-serif;background:"
				+ "radial-gradient(120% 90% at 50% 110%,#101a33 0%,#07090f 60%);";
			tip.textContent = text || "";
			stage.appendChild(tip);
		}

		var renderSeq = 0;
		var lastRenderSig = null;

		function renderSig() {
			if (!(state && state.enabled && state.mode === "scene")) return null;
			var params = state.sceneParams && state.sceneParams[state.scene] ? JSON.stringify(state.sceneParams[state.scene]) : "";
			return state.mode + ":" + state.scene + ":" + params;
		}

		function renderScene() {
			var seq = ++renderSeq;
			var sig = renderSig();
			lastRenderSig = sig;
			if (!sig) {
				disposeBgInstance();
				return;
			}
			var id = state.scene && SCENE_IDS.indexOf(state.scene) >= 0 ? state.scene : "milky-way";
			writeSceneSetting(id, buildStoreSettings(id)); // 完整 store 写入场景自己的设置存储
			// 画廊场景（particle-image / pixel-sculpt）先播种默认图片库
			var prepared = GALLERY_SCENES[id]
				? ensureGallery(id).then(function () {
					var entry0 = registry() && registry().get(id);
					if (entry0 && typeof entry0.prepareDefaults === "function") {
						return entry0.prepareDefaults();
					}
					return null;
				})
				: Promise.resolve(null);
			prepared.then(function () {
				return ensureVendorScene(id);
			}).then(function (entry) {
				// 等脚本/画廊期间设置可能已变
				if (seq !== renderSeq || !(state && state.enabled && state.mode === "scene") || state.scene !== id) return;
				disposeBgInstance();
				var stage = newStage();
				try {
					bgInstance = entry.startup(stage, function (msg) {
						// 渲染器会以无参/空串调用 onError 作为良性通知——
						// 只有带消息时写状态行，绝不清洗舞台（会抹掉已挂载的画面）
						if (seq === renderSeq && msg) setStatus("场景提示：" + String(msg).slice(0, 60));
					});
					bgSceneId = id;
					// particle-image / pixel-sculpt 的 startup 返回 {ready, dispose}
					if (bgInstance && bgInstance.ready && typeof bgInstance.ready.then === "function") {
						bgInstance.ready.catch(function (err) {
							if (seq === renderSeq) setStatus("场景未就绪：" + String((err && err.message) || err).slice(0, 60));
						});
					}
				} catch (e) {
					bgInstance = null;
					paintFallback("场景渲染器启动失败：" + id + "（" + String((e && e.message) || e).slice(0, 60) + "）");
				}
			}).catch(function (err) {
				if (seq !== renderSeq) return;
				disposeBgInstance();
				paintFallback("场景加载失败：" + id + "（" + String((err && err.message) || err).slice(0, 50) + "）");
			});
		}


		function isBackgroundActive() {
			return !!(state && state.enabled && state.mode === "scene");
		}

		function renderWallpaper() {
			disposeBgInstance();
			var stage = activeStage();
			stage.innerHTML = "";
			if (!(state && state.enabled && state.mode === "wallpaper")) {
				return;
			}
			if (!state.wallpaperId) {
				paintFallback("从设置面板的素材库选择一张壁纸");
				return;
			}
			var url = API_BASE + "/wallpaper.png?id=" + encodeURIComponent(state.wallpaperId);
			var fit = state.wallpaperFit === "contain" ? "contain" : state.wallpaperFit === "tile" ? "tile" : "cover";
			var posMap = { center: "center", top: "center top", bottom: "center bottom", left: "left center", right: "right center" };
			var pos = posMap[state.wallpaperPosition] || "center";
			if (fit === "tile") {
				var tile = document.createElement("div");
				tile.style.cssText = "position:absolute;inset:0;background-image:url('" + url + "');"
					+ "background-repeat:repeat;background-size:auto;background-position:" + pos + ";";
				var probe = document.createElement("img");
				probe.style.display = "none";
				probe.onerror = function () {
					var v = document.createElement("video");
					v.src = url; v.loop = true; v.muted = true; v.autoplay = true; v.playsInline = true;
					v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:" + pos + ";";
					stage.innerHTML = "";
					stage.appendChild(v);
					try { v.play(); } catch (e) {}
				};
				stage.appendChild(tile);
				stage.appendChild(probe);
				probe.src = url;
				return;
			}
			var img = document.createElement("img");
			img.decoding = "async";
			img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:" + fit + ";object-position:" + pos + ";";
			img.onerror = function () {
				var v = document.createElement("video");
				v.src = url; v.loop = true; v.muted = true; v.autoplay = true; v.playsInline = true;
				v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:" + fit + ";object-position:" + pos + ";";
				v.onerror = function () { stage.innerHTML = ""; };
				stage.innerHTML = "";
				stage.appendChild(v);
				try { v.play(); } catch (e) {}
			};
			img.src = url;
			stage.appendChild(img);
		}

		// ─────────── ② UI 表面：通配透明 + 分区蒙版（原仓库两层做法） ───────────

		var surfaceStyleEl = null;
		var surfacesApplied = false;

		function buildSurfaceCss() {
			// a) 通配透明：结构元素背景/背滤清零（transparent-background 同款，
			//    选择器本就是泛型的，仅保留图片/图标类不透明）
			var css = "html[data-ap-bg]{background-color:transparent !important}\n"
				+ "html[data-ap-bg] body,html[data-ap-bg] body :where(div,main,aside,section,article,header,"
				+ "footer,nav,form,dialog,ul,ol,li,button,input,textarea,select)"
				+ ":not([role=\"img\"]):not([data-icon]):not([class*=\"icon\" i]){"
				+ "background-color:transparent !important;-webkit-backdrop-filter:none !important;backdrop-filter:none !important}\n"
				+ "html[data-ap-bg] body :is([class*=\"bg-gradient\"],[class*=\"TopFade\"],[class*=\"fade\"]){background-image:none !important}\n";
			// b) 分区蒙版：DSH 稳定 data-slot 钩子，各区域独立不透明度（surface-opacity 同构）。
			//    注意特异性：a) 的通配选择器带三个 :not()，实际是 (0,4,2)——
			//    蒙版规则重复 data-ap-masks 四次到 (0,5,2)，稳定压过它（原仓库同款手法）。
			for (var i = 0; i < REGION_ROWS.length; i++) {
				var r = REGION_ROWS[i];
				css += "html[data-ap-masks][data-ap-masks][data-ap-masks][data-ap-masks] body " + r.selector + "{"
					+ "background-color:rgba(" + r.base + ",var(--ap-mask-" + r.key + ")) !important}\n";
			}
			return css;
		}

		function applySurfaceVars() {
			var html = document.documentElement;
			for (var i = 0; i < REGION_ROWS.length; i++) {
				var r = REGION_ROWS[i];
				var v = state && state.surfaces ? clamp(num(state.surfaces[r.key], 66), 0, 100) / 100 : 0;
				html.style.setProperty("--ap-mask-" + r.key, v.toFixed(3));
			}
		}

		function applySurfaceStyles() {
			var on = !!(state && state.enabled && state.mode !== "off");
			var masksOn = on && !!(state && state.surfaces && state.surfaces.enabled);
			var html = document.documentElement;
			if (!on) {
				clearSurfaceStyles();
				return;
			}
			if (!surfaceStyleEl || !document.head.contains(surfaceStyleEl)) {
				surfaceStyleEl = document.createElement("style");
				surfaceStyleEl.id = BG_STYLE_ID;
				surfaceStyleEl.setAttribute("data-dsh-awesome-appearances", "surface");
				(document.head || document.documentElement).appendChild(surfaceStyleEl);
			}
			if (surfaceStyleEl.textContent !== buildSurfaceCss()) surfaceStyleEl.textContent = buildSurfaceCss();
			html.setAttribute("data-ap-bg", "true");
			applySurfaceVars();
			if (masksOn) html.setAttribute("data-ap-masks", "true");
			else html.removeAttribute("data-ap-masks");
			surfacesApplied = true;
		}

		function clearSurfaceStyles() {
			var html = document.documentElement;
			html.removeAttribute("data-ap-bg");
			html.removeAttribute("data-ap-masks");
			for (var i = 0; i < REGION_ROWS.length; i++) {
				try { html.style.removeProperty("--ap-mask-" + REGION_ROWS[i].key); } catch (e) {}
			}
			surfacesApplied = false;
		}

		// ─────────────────────── ③ 设置面板（Shadow DOM） ───────────────────────

		var root9 = null;
		var panelOpen = false;
		var ui = null;
		var wallpapersCache = [];

		// 背景调节行（图层级，实时生效；场景参数走下方"场景设置"抽屉，应用制）
		var PARAM_ROWS = [
			{ key: "dim", zh: "背景压暗", en: "Dim", min: 0, max: 80, step: 1, unit: "%", scale: 100, fmt: 0 },
			{ key: "blur", zh: "背景模糊", en: "Blur", min: 0, max: 20, step: 0.5, unit: "px", scale: 1, fmt: 1 },
		];
		var LIB_PAGE_SIZE = 8;
		var libPage = 0;

		// 场景设置抽屉（原版式）：草稿 + 应用/重置
		var draft = null;        // 当前场景的参数草稿
		var draftScene = null;

		function bil(zh, en) {
			return '<span class="cl"><span class="zh">' + zh + '</span><span class="en">' + en + '</span></span>';
		}

		var PANEL_CSS = [
			":host{all:initial}",
			"*{box-sizing:border-box;font-family:inherit}",
			".trigger{position:fixed;left:12px;bottom:12px;z-index:2147482000;width:30px;height:30px;border-radius:50%;"
				+ "border:1px solid rgba(128,140,170,.35);background:rgba(20,24,34,.55);backdrop-filter:blur(8px);"
				+ "cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s ease,transform .15s ease;padding:0}",
			".trigger:hover{opacity:1;transform:scale(1.08)}",
			".trigger svg{width:16px;height:16px;fill:none;stroke:#dfe6f5;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
			".panel{position:fixed;z-index:2147483000;width:760px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);"
				+ "border-radius:14px;border:1px solid rgba(128,140,170,.3);background:rgba(17,21,31,.96);color:#e8edf7;"
				+ "box-shadow:0 18px 60px rgba(0,0,0,.5);backdrop-filter:blur(20px);display:none;flex-direction:column;"
				+ "overflow:hidden;font-size:13px;line-height:1.5}",
			".panel.open{display:flex}",
			".p-header{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid rgba(128,140,170,.22);flex:0 0 auto}",
			".p-title{display:flex;flex-direction:column;margin-right:auto;min-width:0}",
			".p-title b{font-size:14px;font-weight:600;letter-spacing:.2px}",
			".p-title span{color:#8fa0c4;font-size:11px}",
			".p-icon{border:1px solid rgba(128,140,170,.4);border-radius:8px;background:rgba(255,255,255,.05);color:#dbe3f5;"
				+ "width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}",
			".p-icon:hover{background:rgba(255,255,255,.12)}",
			".p-icon svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}",
			".p-scroll{overflow-y:auto;padding:14px 16px 16px;display:flex;flex-direction:column;gap:16px;flex:1 1 auto}",
			".p-stage{position:relative;width:100%;aspect-ratio:16/9;border-radius:10px;overflow:hidden;"
				+ "border:1px solid rgba(128,140,170,.28);background:#080b13;flex:0 0 auto}",
			".p-stage .pvbox{position:absolute;inset:0}",
			".p-stage .pvbox canvas{width:100%;height:100%;display:block}",
			".p-stage-tag{position:absolute;left:10px;top:8px;color:rgba(225,234,252,.8);font-size:11px;"
				+ "letter-spacing:.4px;text-shadow:0 1px 4px rgba(0,0,0,.65);pointer-events:none;z-index:2}",
			".p-seg{display:flex;border:1px solid rgba(128,140,170,.35);border-radius:9px;overflow:hidden}",
			".p-seg button{flex:1;border:0;background:transparent;color:#aeb9d4;padding:7px 0;cursor:pointer;font-size:12.5px}",
			".p-seg button.on{background:rgba(96,140,255,.28);color:#fff}",
			".p-group{display:flex;flex-direction:column;gap:8px}",
			".p-gtitle{display:flex;align-items:baseline;gap:6px}",
			".p-gtitle .zh{font-size:13px;font-weight:600;color:#dbe3f5}",
			".p-gtitle .en{font-size:10.5px;color:#7d8aab;letter-spacing:.3px}",
			".p-gtitle .cnt{margin-left:auto;color:#8fa0c4;font-size:11px}",
			".p-scenes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}",
			".scene{border:1px solid rgba(128,140,170,.3);border-radius:10px;overflow:hidden;cursor:pointer;padding:0;background:transparent;text-align:left}",
			".scene .sw{height:36px;display:block}",
			".scene .nm{display:block;padding:5px 9px;font-size:12px;color:#c3cde4;background:rgba(255,255,255,.04)}",
			".scene .nm i{font-style:normal;color:#7d8aab;font-size:10px;margin-left:5px}",
			".scene.on{border-color:#6f9bff;box-shadow:0 0 0 1px #6f9bff inset}",
			".scene.on .nm{color:#fff}",
			".crow{display:grid;grid-template-columns:170px 1fr 62px;align-items:center;gap:12px}",
			".crow .cl{display:flex;flex-direction:column;min-width:0}",
			".crow .cl .zh{font-size:12.5px;color:#dbe3f5;white-space:nowrap}",
			".crow .cl .en{font-size:10.5px;color:#7d8aab;white-space:nowrap}",
			".crow input[type=range]{width:100%;accent-color:#6f9bff;margin:0}",
			".crow output{color:#8fa0c4;font-size:11.5px;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}",
			".p-row{display:flex;align-items:center;justify-content:space-between;gap:10px}",
			".p-row .cl{display:flex;flex-direction:column}",
			".p-row .cl .zh{font-size:12.5px;color:#dbe3f5}",
			".p-row .cl .en{font-size:10.5px;color:#7d8aab}",
			".p-lib{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}",
			".wall{position:relative;border-radius:8px;overflow:hidden;border:1px solid rgba(128,140,170,.3);cursor:pointer;"
				+ "aspect-ratio:16/10;padding:0;background:#0c101a}",
			".wall img{width:100%;height:100%;object-fit:cover;display:block}",
			".wall.on{border-color:#6f9bff;box-shadow:0 0 0 1px #6f9bff inset}",
			".wall .del{position:absolute;top:3px;right:3px;width:17px;height:17px;border-radius:50%;border:0;cursor:pointer;"
				+ "background:rgba(0,0,0,.62);color:#fff;font-size:10px;line-height:17px;padding:0;opacity:0;transition:opacity .12s ease}",
			".wall:hover .del{opacity:1}",
			".p-pager{display:flex;align-items:center;justify-content:flex-end;gap:8px}",
			".p-pager .pg{color:#8fa0c4;font-size:11.5px;font-variant-numeric:tabular-nums}",
			".p-pager button:disabled{opacity:.35;cursor:default}",
			"select{background:rgba(255,255,255,.08);color:#dbe3f5;border:1px solid rgba(128,140,170,.35);border-radius:8px;padding:4px 8px;font-size:12px}",
			".btn{border:1px solid rgba(128,140,170,.4);border-radius:8px;background:rgba(255,255,255,.06);color:#dbe3f5;"
				+ "padding:6px 12px;cursor:pointer;font-size:12px}",
			".btn:hover{background:rgba(255,255,255,.12)}",
			".btn.primary{background:rgba(96,140,255,.3);border-color:rgba(111,155,255,.6)}",
			".btn.danger:hover{background:rgba(220,80,80,.25);border-color:rgba(220,110,110,.5)}",
			".p-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid rgba(128,140,170,.22);"
				+ "padding:10px 16px;flex:0 0 auto}",
			".status{color:#8fa0c4;font-size:11.5px}",
			".switch{position:relative;width:34px;height:20px;border-radius:10px;background:rgba(128,140,170,.4);border:0;cursor:pointer;padding:0;transition:background .15s ease;flex:0 0 auto}",
			".switch.on{background:#5b8af5}",
			".switch i{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s ease}",
			".switch.on i{left:16px}",
			".hint{color:#7d8aab;font-size:11px;line-height:1.5}",
			".empty{color:#7d8aab;font-size:12px;padding:6px 2px}",
		].join("\n");

		var GEAR_SVG = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/>'
			+ '<path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>';
		var CLOSE_SVG = '<svg viewBox="0 0 16 16"><path d="m3.25 3.25 9.5 9.5M12.75 3.25l-9.5 9.5"/></svg>';

		// ───────────── 面板实时预览舞台（同款原版渲染器跑在小盒里） ─────────────

		var pvBox = null;        // 渲染器容器
		var pvInstance = null;
		var pvSceneId = null;
		var pvSeq = 0;
		var pvCanvas = null;     // 壁纸/占位用的 2D 画布
		var pvG = null;
		var pvWallImg = null;
		var pvWallKey = "";

		function disposePvInstance() {
			pvSceneId = null;
			if (pvInstance) {
				try { pvInstance.dispose && pvInstance.dispose(); } catch (e) {}
				pvInstance = null;
			}
			if (pvBox) pvBox.innerHTML = "";
		}

		function pvPaintFallback(text) {
			if (!pvG) return;
			var w = pvCanvas.width, h = pvCanvas.height;
			pvG.fillStyle = "#0b0e15";
			pvG.fillRect(0, 0, w, h);
			pvG.fillStyle = "#5b6684";
			pvG.font = "13px system-ui,sans-serif";
			pvG.textAlign = "center";
			pvG.fillText(text, w / 2, h / 2);
			pvG.textAlign = "left";
		}

		function pvDrawWallpaper() {
			if (!pvG) return;
			var w = pvCanvas.width, h = pvCanvas.height;
			pvG.fillStyle = "#0c101a";
			pvG.fillRect(0, 0, w, h);
			if (pvWallImg && pvWallImg.complete && pvWallImg.naturalWidth) {
				var iw = pvWallImg.naturalWidth, ih = pvWallImg.naturalHeight;
				var fit = state.wallpaperFit;
				if (fit === "contain") {
					var s = Math.min(w / iw, h / ih);
					pvG.drawImage(pvWallImg, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
				} else {
					var s2 = Math.max(w / iw, h / ih);
					var pos = state.wallpaperPosition || "center";
					var dw = iw * s2, dh = ih * s2;
					var dx = pos === "left" ? 0 : pos === "right" ? w - dw : (w - dw) / 2;
					var dy = pos === "top" ? 0 : pos === "bottom" ? h - dh : (h - dh) / 2;
					pvG.drawImage(pvWallImg, dx, dy, dw, dh);
				}
			} else {
				pvG.fillStyle = "#7d8aab";
				pvG.fillText(state && state.wallpaperId ? "壁纸加载中…" : "从素材库选择一张壁纸", w / 2, h / 2);
			}
			var dim = clamp(num(state && state.dim, 0), 0, 0.8);
			if (dim > 0) {
				pvG.fillStyle = "rgba(3,6,14," + dim.toFixed(3) + ")";
				pvG.fillRect(0, 0, w, h);
			}
		}

		var pvSig = null; // 预览当前渲染签名（场景/质量/速度）

		function startPreview() {
			if (!pvBox || !panelOpen || !state) return;
			var seq = ++pvSeq;
			// 场景模式：同款原版渲染器跑在预览盒
			if (state.enabled && state.mode === "scene") {
				pvCanvas.style.display = "none";
				pvBox.style.display = "";
				var sig = state.scene + ":" + JSON.stringify(state.sceneParams && state.sceneParams[state.scene] || {});
				if (pvInstance && pvSig === sig) return;
				disposePvInstance();
				pvSig = sig;
				writeSceneSetting(state.scene, buildStoreSettings(state.scene));
				var prepared = GALLERY_SCENES[state.scene]
					? ensureGallery(state.scene).then(function () {
						var e0 = registry() && registry().get(state.scene);
						return e0 && typeof e0.prepareDefaults === "function" ? e0.prepareDefaults() : null;
					})
					: Promise.resolve(null);
				prepared.then(function () {
					return ensureVendorScene(state.scene);
				}).then(function (entry) {
					if (seq !== pvSeq || !panelOpen) return;
					try {
						pvInstance = entry.startup(pvBox, function (msg) {
							if (seq === pvSeq) pvPaintFallback("场景错误：" + String(msg || "").slice(0, 60));
						});
						pvSceneId = state.scene;
						if (pvInstance && pvInstance.ready && typeof pvInstance.ready.then === "function") {
							pvInstance.ready.catch(function () {});
						}
					} catch (e) {
						pvCanvas.style.display = "";
						pvPaintFallback("预览启动失败：" + state.scene + "（" + String((e && e.message) || e).slice(0, 50) + "）");
					}
				}).catch(function () {
					if (seq !== pvSeq) return;
					pvCanvas.style.display = "";
					pvPaintFallback("场景脚本加载失败");
				});
				return;
			}
			// 壁纸 / 关闭：2D 画布
			disposePvInstance();
			pvSig = null;
			pvBox.style.display = "none";
			pvCanvas.style.display = "";
			if (!pvG) pvG = pvCanvas.getContext("2d");
			if (state.enabled && state.mode === "wallpaper" && state.wallpaperId) {
				var want = state.wallpaperId;
				if (pvWallKey !== want) {
					pvWallKey = want;
					pvWallImg = new Image();
					pvWallImg.onload = function () { if (panelOpen) pvDrawWallpaper(); };
					pvWallImg.src = API_BASE + "/wallpaper.png?id=" + encodeURIComponent(want);
				}
				pvDrawWallpaper();
			} else if (state.enabled && state.mode === "wallpaper") {
				pvWallKey = "";
				pvDrawWallpaper();
			} else {
				pvWallKey = "";
				pvPaintFallback("背景已停用——打开右上角开关恢复");
			}
		}

		function stopPreview() {
			pvSeq++;
			disposePvInstance();
		}

		// ─────────────────────── 面板挂载与开合 ───────────────────────

		function ensurePanel() {
			if (root9 && document.documentElement.contains(root9)) return;
			root9 = document.createElement("div");
			root9.id = PANEL_ID;
			root9.setAttribute("data-dsh-awesome-appearances", "panel");
			var shadow = root9.attachShadow({ mode: "open" });
			var style = document.createElement("style");
			style.textContent = PANEL_CSS;
			shadow.appendChild(style);

			var trigger = document.createElement("button");
			trigger.className = "trigger";
			trigger.id = TRIGGER_ID;
			trigger.title = "背景外观（Awesome Appearances）";
			trigger.innerHTML = GEAR_SVG;
			trigger.addEventListener("click", function (e) {
				e.stopPropagation();
				togglePanel();
			});
			shadow.appendChild(trigger);

			var panel = document.createElement("div");
			panel.className = "panel";
			panel.innerHTML = buildPanelHtml();
			shadow.appendChild(panel);

			(document.documentElement || document.body).appendChild(root9);
			pvBox = panel.querySelector(".p-stage .pvbox");
			pvCanvas = panel.querySelector(".p-stage canvas");
			if (pvCanvas) { pvCanvas.width = 640; pvCanvas.height = 360; }
			bindPanel(panel);
			ui = { trigger: trigger, panel: panel };
			refreshPanel();
			document.addEventListener("click", onDocClick, true);
			document.addEventListener("keydown", onDocKey, true);
		}

		// 外点关闭：必须用 composedPath（shadow DOM 内点击在 document 捕获层
		// 只能看到宿主元素，按 e.target 判断会把面板内点击当外部点击立即关面板）
		function onDocClick(e) {
			if (!panelOpen || !root9) return;
			var path = typeof e.composedPath === "function" ? e.composedPath() : null;
			if (path && path.indexOf(root9) >= 0) return;
			togglePanel(false);
		}

		function onDocKey(e) {
			if (e.key === "Escape" && panelOpen) togglePanel(false);
		}

		function positionPanel() {
			if (!ui) return;
			var p = ui.panel;
			var margin = 12, gap = 8;
			var width = Math.min(760, Math.max(320, window.innerWidth - margin * 2));
			p.style.boxSizing = "border-box";
			p.style.width = width + "px";
			p.style.maxHeight = Math.max(240, window.innerHeight - margin * 2) + "px";
			var h = p.offsetHeight || 480; // 先渲染出高度再定位（原仓库 #k() 做法）
			var tr = ui.trigger.getBoundingClientRect();
			var left = tr.right + gap;
			if (left + width > window.innerWidth - margin) left = Math.max(margin, window.innerWidth - margin - width);
			var top = Math.min(Math.max(margin, tr.top), Math.max(margin, window.innerHeight - margin - h));
			p.style.left = Math.round(left) + "px";
			p.style.top = Math.round(top) + "px";
		}

		function togglePanel(force) {
			var next = typeof force === "boolean" ? force : !panelOpen;
			if (next === panelOpen && ui && ui.panel) {
				ui.panel.classList.toggle("open", panelOpen);
				return;
			}
			panelOpen = next;
			if (ui && ui.panel) {
				ui.panel.classList.toggle("open", panelOpen);
				if (panelOpen) {
					positionPanel();
					startPreview();
					refreshWallpapers().then(refreshPanel);
					var closeBtn = ui.panel.querySelector('[data-act="close"]');
					if (closeBtn) { try { closeBtn.focus(); } catch (e) {} }
				} else {
					stopPreview();
				}
			}
		}

		// ─────────────────────── 面板结构 ───────────────────────

		function buildPanelHtml() {
			var html = "";
			// 头部：标题 + 启用开关 + 关闭
			html += '<div class="p-header">'
				+ '<span class="p-title"><b>背景外观</b><span>Awesome Appearances · 场景 / 壁纸 / 表面蒙版</span></span>'
				+ '<button class="switch" data-act="enabled" title="启用/停用背景"><i></i></button>'
				+ '<button class="p-icon" data-act="close" title="关闭 (Esc)" aria-label="Close settings">' + CLOSE_SVG + '</button>'
				+ '</div>';
			html += '<div class="p-scroll">';
			// 实时预览舞台
			html += '<div class="p-stage"><div class="pvbox"></div><canvas width="640" height="360" style="display:none"></canvas>'
				+ '<span class="p-stage-tag">实时预览 · Live preview</span></div>';
			// 模式分段
			html += '<div class="p-seg" data-act="mode">'
				+ '<button data-mode="scene">动态场景</button>'
				+ '<button data-mode="wallpaper">壁纸</button>'
				+ '<button data-mode="off">关闭</button></div>';
			// 场景卡（原仓库首方渲染器）
			html += '<div class="p-group"><span class="p-gtitle"><span class="zh">场景</span><span class="en">Scene · by code-codex</span></span>'
				+ '<div class="p-scenes" data-act="scenes">';
			for (var i = 0; i < SCENES.length; i++) {
				var s = SCENES[i];
				html += '<button class="scene" data-scene="' + s.id + '"><span class="sw" style="background:' + s.swatch + '"></span>'
					+ '<span class="nm">' + s.label + '<i>' + s.en + '</i></span></button>';
			}
			html += '</div></div>';
			// 表面蒙版（分区不透明度）
			html += '<div class="p-group"><span class="p-gtitle"><span class="zh">表面蒙版</span><span class="en">UI surface masks</span>'
				+ '<button class="switch" data-act="masks" title="蒙版总开关" style="margin-left:auto"><i></i></button></span>';
			html += '<div data-sec="regions">';
			for (var r = 0; r < REGION_ROWS.length; r++) {
				var rr = REGION_ROWS[r];
				html += '<div class="crow">' + bil(rr.zh, rr.en)
					+ '<input type="range" data-region="' + rr.key + '" min="0" max="100" step="1">'
					+ '<output data-regionval="' + rr.key + '"></output></div>';
			}
			html += '<div class="hint">蒙版即各区域界面的不透明底色（0% 完全透出背景）。背景关闭时蒙版自动暂停。</div>';
			html += '</div></div>';
			// 素材库（壁纸模式）
			html += '<div class="p-group" data-sec="wallpaper">'
				+ '<span class="p-gtitle"><span class="zh">素材库</span><span class="en">Library</span><span class="cnt" data-act="libcount"></span></span>'
				+ '<div class="p-lib" data-act="walls"></div>'
				+ '<div class="p-pager">'
				+ '<button class="btn" data-act="libprev" aria-label="Previous page">上一页</button>'
				+ '<span class="pg" data-act="pageinfo"></span>'
				+ '<button class="btn" data-act="libnext" aria-label="Next page">下一页</button>'
				+ '<button class="btn primary" data-act="import">导入…</button>'
				+ '<button class="btn danger" data-act="clearlib">清空</button>'
				+ '</div>'
				+ '<div class="p-row"><span class="cl"><span class="zh">画面适配</span><span class="en">Fit</span></span>'
				+ '<select data-act="fit"><option value="cover">铺满 cover</option><option value="contain">完整 contain</option><option value="tile">平铺 tile</option></select></div>'
				+ '<div class="p-row"><span class="cl"><span class="zh">位置</span><span class="en">Position</span></span>'
				+ '<select data-act="pos"><option value="center">居中 center</option><option value="top">顶部 top</option><option value="bottom">底部 bottom</option>'
				+ '<option value="left">左侧 left</option><option value="right">右侧 right</option></select></div>'
				+ '<input type="file" data-act="file" accept="image/*,video/mp4,video/webm" style="display:none">'
				+ '</div>';
			// 背景调节（图层级，实时）
			html += '<div class="p-group"><span class="p-gtitle"><span class="zh">背景调节</span><span class="en">Backdrop</span></span>';
			for (var p = 0; p < PARAM_ROWS.length; p++) {
				var row = PARAM_ROWS[p];
				html += '<div class="crow">' + bil(row.zh, row.en)
					+ '<input type="range" data-slider="' + row.key + '" min="' + row.min + '" max="' + row.max + '" step="' + row.step + '">'
					+ '<output data-val="' + row.key + '"></output></div>';
			}
			html += '</div>';
			// 场景设置抽屉（原版式：预设质量 + 双语参数 + 颜色色板 + 应用/重置）
			html += '<div class="p-group" data-sec="drawer">'
				+ '<span class="p-gtitle"><span class="zh">场景设置</span><span class="en">Scene settings</span></span>'
				+ '<div class="p-row"><span class="cl"><span class="zh">预设质量</span><span class="en">Preset quality</span></span>'
				+ '<span class="p-seg" data-act="qseg" style="flex:1;max-width:240px">'
				+ '<button data-q="high">质量</button><button data-q="medium">均衡</button><button data-q="low">性能</button></span></div>'
				+ '<div data-sec="fields"></div>'
				+ '<div class="p-group" data-sec="colors" style="display:none">'
				+ '<span class="p-gtitle"><span class="zh">颜色色板</span><span class="en">Palette</span></span>'
				+ '<div class="p-pager" style="justify-content:flex-start;gap:10px" data-act="colors"></div></div>'
				+ '<div class="p-row" style="justify-content:flex-end;gap:8px">'
				+ '<button class="btn" data-act="scenereset">重置 Reset</button>'
				+ '<button class="btn primary" data-act="apply">应用 Apply</button></div>'
				+ '<div class="hint">调节后点「应用」一次性生效（不闪烁）。「重置」把控件恢复为本场景默认值。粒子成像/像素雕塑使用默认图库，无参数。</div>';
			html += '</div>';
			html += '</div>';
			html += '<div class="p-foot"><span class="status" data-act="status">　</span>'
				+ '<button class="btn" data-act="reset">恢复默认 Reset</button></div>';
			return html;
		}

		function bindPanel(panel) {
			panel.querySelector('[data-act="close"]').addEventListener("click", function () {
				togglePanel(false);
			});
			panel.querySelector('[data-act="enabled"]').addEventListener("click", function () {
				state.enabled = !state.enabled;
				scheduleSave();
				applyAll();
			});
			panel.querySelector('[data-act="masks"]').addEventListener("click", function () {
				state.surfaces.enabled = !state.surfaces.enabled;
				scheduleSave();
				applyAll();
			});
			panel.querySelector('[data-act="mode"]').addEventListener("click", function (e) {
				var btn = e.target.closest("button[data-mode]");
				if (!btn) return;
				state.mode = btn.getAttribute("data-mode");
				if (state.mode === "wallpaper" && !state.wallpaperId && wallpapersCache.length) {
					state.wallpaperId = wallpapersCache[0].id;
				}
				scheduleSave();
				applyAll();
			});
			panel.querySelector('[data-act="scenes"]').addEventListener("click", function (e) {
				var btn = e.target.closest("button[data-scene]");
				if (!btn) return;
				state.scene = btn.getAttribute("data-scene");
				if (state.enabled && state.mode !== "scene") state.mode = "scene";
				state.enabled = true;
				scheduleSave();
				applyAll();
			});
			var regions = panel.querySelectorAll("input[data-region]");
			for (var ri = 0; ri < regions.length; ri++) {
				(function (input) {
					var key = input.getAttribute("data-region");
					input.addEventListener("input", function () {
						state.surfaces[key] = Number(input.value);
						var out = panel.querySelector('[data-regionval="' + key + '"]');
						if (out) out.textContent = input.value + "%";
						applySurfaceVars();
						scheduleSave();
					});
				})(regions[ri]);
			}
			var walls = panel.querySelector('[data-act="walls"]');
			walls.addEventListener("click", function (e) {
				var del = e.target.closest(".del");
				if (del) {
					var wid = del.getAttribute("data-id");
					apiPostJson("/wallpaper-delete.json", { id: wid }).then(function (r) {
						if (r && r.wallpapers) {
							wallpapersCache = r.wallpapers;
							libPage = Math.min(libPage, Math.max(0, Math.ceil(wallpapersCache.length / LIB_PAGE_SIZE) - 1));
						}
						if (state.wallpaperId === wid) {
							state.wallpaperId = wallpapersCache.length ? wallpapersCache[0].id : null;
							scheduleSave();
						}
						renderWallLib();
						startPreview();
						applyAll();
					}).catch(function () {});
					return;
				}
				var item = e.target.closest("button.wall");
				if (!item) return;
				state.wallpaperId = item.getAttribute("data-id");
				if (state.enabled && state.mode !== "wallpaper") state.mode = "wallpaper";
				state.enabled = true;
				scheduleSave();
				applyAll();
			});
			panel.querySelector('[data-act="libprev"]').addEventListener("click", function () {
				if (libPage > 0) { libPage--; renderWallLib(); }
			});
			panel.querySelector('[data-act="libnext"]').addEventListener("click", function () {
				if ((libPage + 1) * LIB_PAGE_SIZE < wallpapersCache.length) { libPage++; renderWallLib(); }
			});
			panel.querySelector('[data-act="clearlib"]').addEventListener("click", function () {
				if (!wallpapersCache.length) return;
				if (!window.confirm("清空素材库中的全部壁纸/视频？（当前选中的壁纸也会一并移除）")) return;
				var ids = wallpapersCache.map(function (w) { return w.id; });
				var next = function (i) {
					if (i >= ids.length) {
						wallpapersCache = [];
						state.wallpaperId = null;
						libPage = 0;
						scheduleSave();
						renderWallLib();
						startPreview();
						applyAll();
						return;
					}
					apiPostJson("/wallpaper-delete.json", { id: ids[i] }).then(function () { next(i + 1); }).catch(function () { next(i + 1); });
				};
				next(0);
			});
			var fileInput = panel.querySelector('[data-act="file"]');
			panel.querySelector('[data-act="import"]').addEventListener("click", function () { fileInput.click(); });
			fileInput.addEventListener("change", function () {
				var f = fileInput.files && fileInput.files[0];
				fileInput.value = "";
				if (!f) return;
				if (f.size > 200 * 1024 * 1024) { setStatus("文件超过 200MB 上限"); return; }
				setStatus("上传中…");
				f.arrayBuffer().then(function (buf) {
					var q = "?name=" + encodeURIComponent(f.name);
					return fetch(API_BASE + "/wallpaper-upload" + q, {
						method: "POST",
						credentials: "omit",
						headers: { "Content-Type": "application/octet-stream" },
						body: buf,
					}).then(function (r) { return r.json(); });
				}).then(function (r) {
					if (r && r.ok) {
						wallpapersCache = r.wallpapers || [];
						libPage = 0;
						state.wallpaperId = r.wallpaper.id;
						state.mode = "wallpaper";
						state.enabled = true;
						scheduleSave();
						renderWallLib();
						startPreview();
						applyAll();
						setStatus("已导入");
					} else {
						setStatus("导入失败：" + ((r && r.error) || "?"));
					}
				}).catch(function (err) { setStatus("导入失败：" + err); });
			});
			panel.querySelector('[data-act="fit"]').addEventListener("change", function (e) {
				state.wallpaperFit = e.target.value; scheduleSave(); applyAll();
			});
			panel.querySelector('[data-act="pos"]').addEventListener("change", function (e) {
				state.wallpaperPosition = e.target.value; scheduleSave(); applyAll();
			});
			// —— 场景设置抽屉（原版式：草稿 + 应用/重置）——
			panel.querySelector('[data-act="qseg"]').addEventListener("click", function (e) {
				var btn = e.target.closest("button[data-q]");
				if (!btn || !draft) return;
				draft.quality = btn.getAttribute("data-q");
				refreshDrawer();
			});
			panel.querySelector('[data-act="apply"]').addEventListener("click", function () {
				if (!draft || !draftScene) return;
				if (!state.sceneParams) state.sceneParams = {};
				state.sceneParams[draftScene] = sanitizeDraft(draftScene, draft);
				if (state.scene === draftScene) {
					writeSceneSetting(draftScene, buildStoreSettings(draftScene));
					scheduleSave();
					applyAll(); // renderSig 含 params → 一次性重建，不闪烁
					startPreview();
				} else {
					scheduleSave();
				}
				setStatus("已应用 " + draftScene);
			});
			panel.querySelector('[data-act="scenereset"]').addEventListener("click", function () {
				if (!draftScene) return;
				var sch = schemaOf(draftScene);
				draft = sch && sch.defaults ? Object.assign({}, sch.defaults) : {};
				refreshDrawer();
				setStatus("已重置为本场景默认值，点「应用」生效");
			});
			var sliders = panel.querySelectorAll("input[data-slider]");
			for (var i = 0; i < sliders.length; i++) {
				(function (input) {
					var key = input.getAttribute("data-slider");
					input.addEventListener("input", function () {
						var row = null;
						for (var j = 0; j < PARAM_ROWS.length; j++) if (PARAM_ROWS[j].key === key) row = PARAM_ROWS[j];
						if (!row) return;
						state[key] = Number(input.value) / row.scale;
						updateSliderLabels();
						scheduleSave();
						applyAll();
					});
				})(sliders[i]);
			}
			panel.querySelector('[data-act="reset"]').addEventListener("click", function () {
				state = Object.assign({}, DEFAULTS, { savedAt: state && state.savedAt || 0, surfaces: Object.assign({}, DEFAULTS.surfaces) });
				scheduleSave();
				applyAll();
			});
		}

		// —— 场景设置抽屉：草稿构建 / 渲染 / 提交 ——

		function sanitizeDraft(sceneId, d) {
			var sch = schemaOf(sceneId);
			var out = d && typeof d === "object" ? Object.assign({}, d) : {};
			if (!sch) return out;
			if (["low", "medium", "high"].indexOf(out.quality) < 0) out.quality = sch.qualityDefault || "high";
			for (var i = 0; i < sch.fields.length; i++) {
				var f = sch.fields[i];
				var n = Number(out[f.key]);
				if (!Number.isFinite(n)) { out[f.key] = num(sch.defaults[f.key], f.min); continue; }
				out[f.key] = clamp(n, f.min, f.max);
			}
			if (sch.colors) {
				var cols = Array.isArray(out.colors) ? out.colors : sch.colors.slice();
				out.colors = sch.colors.map(function (c, idx) {
					return typeof cols[idx] === "string" && /^#[\da-fA-F]{6}$/.test(cols[idx]) ? cols[idx] : c;
				});
			}
			return out;
		}

		function ensureDrawerDraft() {
			var scene = state && state.scene || "milky-way";
			if (draftScene === scene && draft) return;
			draftScene = scene;
			var sch = schemaOf(scene);
			var base = sch && sch.defaults ? Object.assign({}, sch.defaults) : {};
			var saved = state && state.sceneParams && state.sceneParams[scene];
			if (saved && typeof saved === "object") {
				for (var k in saved) if (Object.prototype.hasOwnProperty.call(saved, k)) base[k] = saved[k];
			}
			draft = sanitizeDraft(scene, base);
		}

		function drawerFieldHtml(f) {
			var value = num(draft[f.key], f.min);
			var sliderV = f.pct ? value * 100 : value;
			var min = f.pct ? f.min * 100 : f.min;
			var max = f.pct ? f.max * 100 : f.max;
			var step = f.pct ? Math.max(0.1, f.step * 100) : f.step;
			var out = f.pct ? (value * 100).toFixed(1) + "%" : value.toFixed(String(f.step).indexOf(".") >= 0 ? (String(f.step).split(".")[1] || "").length : 0) + (f.unit || "");
			return '<div class="crow">' + bil(f.zh, f.en)
				+ '<input type="range" data-field="' + f.key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + sliderV + '">'
				+ '<output data-fieldval="' + f.key + '">' + out + '</output></div>';
		}

		function renderDrawer() {
			if (!ui || !draftScene) return;
			var sch = schemaOf(draftScene);
			var fieldsBox = ui.panel.querySelector('[data-sec="fields"]');
			var colorsBox = ui.panel.querySelector('[data-sec="colors"]');
			if (!sch) {
				fieldsBox.innerHTML = '<div class="empty">场景 schema 尚未加载</div>';
				colorsBox.style.display = "none";
				return;
			}
			if (!sch.fields.length) {
				fieldsBox.innerHTML = '<div class="empty">该场景使用默认图库，无可调参数</div>';
			} else {
				var html = "";
				for (var i = 0; i < sch.fields.length; i++) html += drawerFieldHtml(sch.fields[i]);
				fieldsBox.innerHTML = html;
				var inputs = fieldsBox.querySelectorAll("input[data-field]");
				for (var j = 0; j < inputs.length; j++) {
					(function (input) {
						var key = input.getAttribute("data-field");
						var f = null;
						for (var m = 0; m < sch.fields.length; m++) if (sch.fields[m].key === key) f = sch.fields[m];
						input.addEventListener("input", function () {
							if (!draft) return;
							var raw = Number(input.value);
							draft[key] = f && f.pct ? raw / 100 : raw;
							var out = fieldsBox.querySelector('[data-fieldval="' + key + '"]');
							if (out) out.textContent = f && f.pct ? (raw).toFixed(1) + "%" : raw.toFixed(String(f.step).indexOf(".") >= 0 ? (String(f.step).split(".")[1] || "").length : 0) + (f.unit || "");
						});
					})(inputs[j]);
				}
			}
			if (sch.colors) {
				colorsBox.style.display = "";
				var cbox = colorsBox.querySelector('[data-act="colors"]');
				var cols = Array.isArray(draft.colors) && draft.colors.length === sch.colors.length ? draft.colors : sch.colors;
				var ch = "";
				for (var c = 0; c < sch.colors.length; c++) {
					ch += '<span class="cl"><input type="color" data-color="' + c + '" value="' + cols[c] + '">'
						+ '<span class="zh" style="font-size:10px;color:#7d8aab">颜色' + (c + 1) + '</span></span>';
				}
				cbox.innerHTML = ch;
				var colorInputs = cbox.querySelectorAll("input[data-color]");
				for (var d = 0; d < colorInputs.length; d++) {
					(function (input) {
						var idx = Number(input.getAttribute("data-color"));
						input.addEventListener("input", function () {
							if (!draft) return;
							if (!Array.isArray(draft.colors)) draft.colors = sch.colors.slice();
							draft.colors[idx] = input.value;
						});
					})(colorInputs[d]);
				}
			} else {
				colorsBox.style.display = "none";
			}
		}

		function refreshDrawer() {
			if (!ui || !draftScene) return;
			var p = ui.panel;
			var btns = p.querySelectorAll('[data-act="qseg"] button[data-q]');
			for (var i = 0; i < btns.length; i++) {
				btns[i].classList.toggle("on", btns[i].getAttribute("data-q") === (draft && draft.quality));
			}
			var sch = schemaOf(draftScene);
			if (sch) {
				var fieldsBox = p.querySelector('[data-sec="fields"]');
				for (var j = 0; j < sch.fields.length; j++) {
					var f = sch.fields[j];
					var inp = fieldsBox.querySelector('[data-field="' + f.key + '"]');
					if (!inp) continue;
					var sliderV = f.pct ? num(draft[f.key], f.min) * 100 : num(draft[f.key], f.min);
					if (Number(inp.value) !== sliderV) inp.value = String(sliderV);
					var out = fieldsBox.querySelector('[data-fieldval="' + f.key + '"]');
					if (out) out.textContent = f.pct ? (sliderV).toFixed(1) + "%" : sliderV.toFixed(String(f.step).indexOf(".") >= 0 ? (String(f.step).split(".")[1] || "").length : 0) + (f.unit || "");
				}
				if (sch.colors) {
					var cols = Array.isArray(draft.colors) && draft.colors.length === sch.colors.length ? draft.colors : sch.colors;
					var cbox = p.querySelector('[data-act="colors"]');
					for (var c = 0; c < sch.colors.length; c++) {
						var ci = cbox && cbox.querySelector('input[data-color="' + c + '"]');
						if (ci && ci.value !== cols[c]) ci.value = cols[c];
					}
				}
			}
		}

		function updateSliderLabels() {
			if (!ui) return;
			for (var i = 0; i < PARAM_ROWS.length; i++) {
				var r = PARAM_ROWS[i];
				var out = ui.panel.querySelector('[data-val="' + r.key + '"]');
				if (out) out.textContent = (Number(state[r.key]) * r.scale).toFixed(r.fmt) + r.unit;
			}
		}

		function refreshPanel() {
			if (!ui || !state) return;
			var p = ui.panel;
			p.querySelector('[data-act="enabled"]').classList.toggle("on", !!state.enabled);
			p.querySelector('[data-act="masks"]').classList.toggle("on", !!(state.surfaces && state.surfaces.enabled));
			var btns = p.querySelectorAll("button[data-mode]");
			for (var i = 0; i < btns.length; i++) {
				btns[i].classList.toggle("on", btns[i].getAttribute("data-mode") === state.mode);
			}
			var scenes = p.querySelectorAll("button[data-scene]");
			for (var j = 0; j < scenes.length; j++) {
				scenes[j].classList.toggle("on", state.mode === "scene" && scenes[j].getAttribute("data-scene") === state.scene);
			}
			p.querySelector('[data-sec="wallpaper"]').style.display = state.mode === "wallpaper" ? "" : "none";
			p.querySelector('[data-sec="regions"]').style.opacity = state.surfaces.enabled ? "1" : ".45";
			for (var k = 0; k < REGION_ROWS.length; k++) {
				var rr = REGION_ROWS[k];
				var inp = p.querySelector('[data-region="' + rr.key + '"]');
				if (inp && Number(inp.value) !== Number(state.surfaces[rr.key])) inp.value = String(clamp(num(state.surfaces[rr.key], 66), 0, 100));
				var out = p.querySelector('[data-regionval="' + rr.key + '"]');
				if (out) out.textContent = clamp(num(state.surfaces[rr.key], 66), 0, 100) + "%";
			}
			var fitSel = p.querySelector('[data-act="fit"]');
			if (fitSel.value !== state.wallpaperFit) fitSel.value = state.wallpaperFit;
			var posSel = p.querySelector('[data-act="pos"]');
			if (posSel.value !== state.wallpaperPosition) posSel.value = state.wallpaperPosition;
			// 场景设置抽屉：场景变化时重建草稿
			if (draftScene !== state.scene || !draft) {
				ensureDrawerDraft();
				renderDrawer();
			}
			refreshDrawer();
			var sliders = p.querySelectorAll("input[data-slider]");
			for (var m = 0; m < sliders.length; m++) {
				var key = sliders[m].getAttribute("data-slider");
				var row = null;
				for (var n = 0; n < PARAM_ROWS.length; n++) if (PARAM_ROWS[n].key === key) row = PARAM_ROWS[n];
				if (!row) continue;
				var v = Number(state[key]) * row.scale;
				if (Number(sliders[m].value) !== v) sliders[m].value = String(v);
			}
			updateSliderLabels();
		}

		function renderWallLib() {
			if (!ui) return;
			var walls = ui.panel.querySelector('[data-act="walls"]');
			var pages = Math.max(1, Math.ceil(wallpapersCache.length / LIB_PAGE_SIZE));
			if (libPage >= pages) libPage = pages - 1;
			var slice = wallpapersCache.slice(libPage * LIB_PAGE_SIZE, libPage * LIB_PAGE_SIZE + LIB_PAGE_SIZE);
			walls.innerHTML = slice.length
				? slice.map(function (w) {
					var isVideo = /^video\//.test(w.mime || "");
					var thumb = isVideo
						? '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#8fa0c4;font-size:18px;background:linear-gradient(135deg,#131a2b,#1c2742)">▶</div>'
						: '<img loading="lazy" src="' + w.url + '" alt="">';
					return '<button class="wall' + (w.id === state.wallpaperId ? " on" : "") + '" data-id="' + w.id + '" title="' + w.name + '">'
						+ thumb + '<span class="del" data-id="' + w.id + '" title="删除">✕</span></button>';
				}).join("")
				: '<div class="empty" style="grid-column:1/-1">还没有壁纸，点「导入…」添加图片或视频</div>';
			var count = ui.panel.querySelector('[data-act="libcount"]');
			if (count) count.textContent = wallpapersCache.length ? wallpapersCache.length + " 项" : "";
			var info = ui.panel.querySelector('[data-act="pageinfo"]');
			if (info) info.textContent = wallpapersCache.length ? (libPage + 1) + " / " + pages : "";
			var prev = ui.panel.querySelector('[data-act="libprev"]');
			if (prev) prev.disabled = libPage <= 0;
			var next = ui.panel.querySelector('[data-act="libnext"]');
			if (next) next.disabled = (libPage + 1) * LIB_PAGE_SIZE >= wallpapersCache.length;
		}

		function refreshWallpapers() {
			return apiGet("/state.json").then(function (data) {
				if (data && Array.isArray(data.wallpapers)) wallpapersCache = data.wallpapers;
				renderWallLib();
				return null;
			}).catch(function () { return null; });
		}

		function setStatus(text) {
			if (!ui) return;
			var s = ui.panel.querySelector('[data-act="status"]');
			if (s) s.textContent = text || "　";
		}

		// ─────────────────────── 状态保存 / 轮询 ───────────────────────

		function scheduleSave() {
			setStatus("保存中…");
			if (saveTimer) clearTimeout(saveTimer);
			saveTimer = setTimeout(function () {
				saveTimer = null;
				var payload = Object.assign({}, state);
				// 保存必须打 /state-save.json：宿主路由表不区分 method，
				// POST 到 /state.json 会命中 GET 处理器，拿旧状态回滚本地改动
				apiPostJson("/state-save.json", { settings: payload }).then(function (r) {
					if (r && r.ok && r.settings) {
						var local = state;
						state = sanitizeState(r.settings);
						savedAtLocal = state.savedAt || 0;
						if (panelOpen) refreshPanel();
						if (JSON.stringify(pickVisual(local)) !== JSON.stringify(pickVisual(state))) applyAll();
					}
					setStatus("已保存");
				}).catch(function () { setStatus("保存失败"); });
			}, 400);
		}

		function pickVisual(s) {
			return {
				enabled: s.enabled, mode: s.mode, scene: s.scene, wallpaperId: s.wallpaperId,
				wallpaperFit: s.wallpaperFit, wallpaperPosition: s.wallpaperPosition,
				surfaces: s.surfaces, dim: s.dim, blur: s.blur, sceneParams: s.sceneParams,
			};
		}

		function sanitizeState(src) {
			var out = Object.assign({}, DEFAULTS, src || {});
			out.enabled = !!out.enabled;
			if (["scene", "wallpaper", "off"].indexOf(out.mode) < 0) out.mode = "scene";
			if (SCENE_IDS.indexOf(out.scene) < 0) out.scene = "milky-way";
			if (out.wallpaperId != null && !/^[\w-]+$/.test(String(out.wallpaperId))) out.wallpaperId = null;
			if (["cover", "contain", "tile"].indexOf(out.wallpaperFit) < 0) out.wallpaperFit = "cover";
			if (["center", "top", "bottom", "left", "right"].indexOf(out.wallpaperPosition) < 0) out.wallpaperPosition = "center";
			if (["auto", "high", "balanced"].indexOf(out.quality) < 0) out.quality = "auto";
			out.dim = clamp(num(out.dim, DEFAULTS.dim), 0, 0.8);
			out.blur = clamp(num(out.blur, DEFAULTS.blur), 0, 20);
			var paramsIn = out.sceneParams && typeof out.sceneParams === "object" ? out.sceneParams : {};
			var paramsOut = {};
			for (var pk in paramsIn) {
				if (!Object.prototype.hasOwnProperty.call(paramsIn, pk)) continue;
				if (!/^[a-z-]+$/.test(pk)) continue;
				if (paramsIn[pk] && typeof paramsIn[pk] === "object" && !Array.isArray(paramsIn[pk])) paramsOut[pk] = paramsIn[pk];
			}
			out.sceneParams = paramsOut;
			// surfaces：v1/v2 老设置的 surfaceOpacity 折算为各区域统一蒙版
			var src2 = src || {};
			var surfacesIn = src2.surfaces && typeof src2.surfaces === "object" ? src2.surfaces : null;
			if (!surfacesIn && num(src2.surfaceOpacity, -1) >= 0) {
				var legacy = Math.round(clamp(num(src2.surfaceOpacity, 0.66), 0.05, 1) * 100);
				surfacesIn = { enabled: true, sidebar: legacy, conversation: legacy, composer: Math.min(100, legacy + 20), header: legacy, right: legacy };
			}
			var sOut = Object.assign({}, DEFAULTS.surfaces);
			if (surfacesIn) {
				sOut.enabled = surfacesIn.enabled === true;
				for (var i = 0; i < REGION_ROWS.length; i++) {
					var key = REGION_ROWS[i].key;
					var v = Number(surfacesIn[key]);
					if (Number.isFinite(v)) sOut[key] = clamp(v, 0, 100);
				}
			}
			out.surfaces = sOut;
			return out;
		}

		// ─────────────────────── 总装 ───────────────────────

		function applyAll() {
			if (!state) return;
			ensurePanel();
			var bgOn = state.enabled && state.mode !== "off";
			layer.style.display = bgOn ? "" : "none";
			if (bgOn && state.mode === "scene") {
				// 仅渲染相关字段（场景/质量/速度）变化才重建；dim/blur 等直接改样式
				if (renderSig() !== lastRenderSig) renderScene();
			} else if (bgOn && state.mode === "wallpaper") {
				renderWallpaper();
			} else {
				disposeBgInstance();
				lastRenderSig = null;
			}
			// 视觉调节
			bgWrap.style.filter = num(state.blur, 0) > 0 ? "blur(" + num(state.blur, 0) + "px)" : "";
			var blurPx = num(state.blur, 0);
			bgWrap.style.transform = blurPx > 0 ? "scale(" + (1 + Math.min(0.08, blurPx * 0.006)).toFixed(3) + ")" : "";
			dimEl.style.background = bgOn ? "rgba(3,6,14," + clamp(num(state.dim, 0), 0, 0.8).toFixed(3) + ")" : "transparent";
			// UI 表面（通配透明 + 分区蒙版）
			applySurfaceStyles();
			refreshPanel();
			if (panelOpen) startPreview();
		}

		function startPolling() {
			if (pollTimer) return;
			pollTimer = setInterval(function () {
				if (document.hidden) return;
				apiGet("/state.json").then(function (data) {
					if (!data || !data.settings) return;
					var remote = sanitizeState(data.settings);
					var remoteAt = num(remote.savedAt, 0);
					if (remoteAt && remoteAt !== savedAtLocal) {
						var before = JSON.stringify(pickVisual(state || {}));
						state = remote;
						savedAtLocal = remoteAt;
						if (Array.isArray(data.wallpapers)) wallpapersCache = data.wallpapers;
						if (before !== JSON.stringify(pickVisual(state))) applyAll();
					}
				}).catch(function () {});
			}, 8000);
		}

		var resizeTimer = null;
		function onResize() {
			if (resizeTimer) clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function () {
				if (panelOpen) positionPanel();
			}, 120);
		}

		var started = false;

		/**
		 * Client plugin body（cordis 浏览器上下文）。
		 * @param ctx - client cordis context。
		 */
		function apply(ctx) {
			if (started) return;
			started = true;
			ctx.effect(function () {
				return function () {
					started = false;
					teardown();
				};
			}, PLUGIN_ID + ": reset apply guard");

			ensureLayer();
			ensureSchemas();
			apiGet("/state.json").then(function (data) {
				state = sanitizeState(data && data.settings);
				if (Array.isArray(data && data.wallpapers)) wallpapersCache = data.wallpapers;
				savedAtLocal = num(state.savedAt, 0);
				applyAll();
				startPolling();
			}).catch(function () {
				// 宿主路由不在（老宿主/被停用）：保持默认观感，不拖垮页面
				state = sanitizeState(null);
				applyAll();
			});

			window.addEventListener("resize", onResize);
		}

		function teardown() {
			if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
			if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
			if (resizeTimer) { clearTimeout(resizeTimer); resizeTimer = null; }
			window.removeEventListener("resize", onResize);
			document.removeEventListener("click", onDocClick, true);
			document.removeEventListener("keydown", onDocKey, true);
			clearSurfaceStyles();
			disposeBgInstance();
			stopPreview();
			if (layer && layer.parentNode) { try { layer.parentNode.removeChild(layer); } catch (e) {} }
			layer = null;
			if (root9 && root9.parentNode) { try { root9.parentNode.removeChild(root9); } catch (e) {} }
			root9 = null;
			ui = null;
			panelOpen = false;
			pvBox = null;
			pvCanvas = null;
			pvG = null;
		}

		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	},
});
