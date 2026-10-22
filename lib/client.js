/**
 * dsh-ccx —— 客户端半边（浏览器 bundle）v0.3。
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
	id: "dsh-ccx",
	factory: function (require) {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		// ─────────────────────────── 常量 ───────────────────────────

		var PLUGIN_ID = "dsh-ccx";
		var LAYER_ID = "dsh-ap-layer";
		var DIM_ID = "dsh-ap-dim";
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

		// DSH 真实绘制容器（v0.8.3 实机普查：data-slot 标记全是 0×0 隐形锚点，直接上色无视觉；
		// 槽位的「直接父级」才是带底色的布局列，用 :has(> [data-slot]) 稳定命中，不依赖
		// css-module 哈希类名）。base 对齐原版 inject.ts 两档表面色：
		// 主区/输入区 rgba(11,12,15)、侧栏 rgba(16,17,20)。
		// 无「标题栏」分区：DSH 顶条在中央列内、无独立绘制面（原生 0–40px 是 OS 菜单栏，不可达）。
		var REGION_ROWS = [
			{ key: "sidebar", zh: "会话侧栏", en: "Sidebar", selector: 'div:has(> [data-slot="sidebar"])', base: "16,17,20" },
			{ key: "conversation", zh: "对话区", en: "Conversation", selector: 'div:has(> [data-slot="main"])', base: "11,12,15" },
			// 输入面板本体 = Codinput 的卡片钩子（normal/悬浮/侧栏三形态都跟随卡片）。
			// 不能兜底涂输入槽位的父级容器——那是全宽 stack，蒙版会比可见面板大一圈；
			// 无 Codinput 时该区无独立蒙版，由对话区蒙版兜底
			{ key: "composer", zh: "消息输入区", en: "Composer", selector: '[data-composer-card]', base: "11,12,15" },
			{ key: "right", zh: "右侧栏", en: "Right panel", selector: 'div:has(> [data-slot="rightbar"])', base: "16,17,20" },
		];

		// 与宿主半侧 lib/index.js 的 DEFAULT_SETTINGS 保持一致
		// 蒙版默认：侧栏 .66、对话 .58、输入 .86（原版 surface-opacity 面板 composer 档，
		// 输入面板默认不透）；右侧栏收起时 0 宽不可见，展开即生效
		var DEFAULTS = {
			version: 6,
			enabled: true,
			mode: "scene",
			scene: "milky-way",
			wallpaperId: null,
			wallpaperFit: "cover",
			wallpaperPosition: "center",
			surfaces: { enabled: true, sidebar: 66, conversation: 58, composer: 86, right: 66 },
			sceneParams: {},
			dim: 0,
			blur: 0,
			savedAt: 0,
		};

		var SCHEMAS = null;          // 每场景设置 schema（宿主 /scene-schemas.json，原版抽屉字段）
		var schemaPromise = null;

		function ensureSchemas() {
			if (SCHEMAS) return Promise.resolve(SCHEMAS);
			if (!schemaPromise) {
				schemaPromise = apiGet("/scene-schemas.json").then(function (s) {
					SCHEMAS = s && typeof s === "object" ? s : {};
					// schema 就绪后重渲染设置面板（首屏可能在 schema 到达前就打开了面板）
					if (settingsOpen && settingsId && SCENE_IDS.indexOf(settingsId) >= 0) renderSettings(settingsId);
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
		// 画廊选型键（selectedImageIds/activeImageId）归 vendor/图库自有：prepareDefaults
		// 首次导入时写入。非用户显式设置不得进 patch，否则空默认值经合并写会把选型清掉
		// （渲染器启动判定 activeImageId||selectedImageIds 非空，清掉即「启动无源图」）
		var GALLERY_OWNED_KEYS = { selectedImageIds: 1, activeImageId: 1 };
		function buildStoreSettings(sceneId) {
			var sch = schemaOf(sceneId);
			var base = sch && sch.defaults ? Object.assign({}, sch.defaults) : {};
			var overrides = state && state.sceneParams && state.sceneParams[sceneId];
			if (overrides && typeof overrides === "object") {
				for (var k in overrides) {
					if (Object.prototype.hasOwnProperty.call(overrides, k)) base[k] = overrides[k];
				}
			}
			if (GALLERY_SCENES[sceneId]) {
				for (var gk in GALLERY_OWNED_KEYS) {
					if (!(overrides && Object.prototype.hasOwnProperty.call(overrides, gk))) delete base[gk];
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
			layer.setAttribute("data-dsh-ccx", "background");
			layer.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;"
				+ "width:100vw;height:100vh;margin:0;padding:0;contain:strict;background:#000;--ap-layer-bg:#000;";
			bgWrap = document.createElement("div");
			bgWrap.style.cssText = "position:absolute;inset:0;overflow:hidden;";
			bgHost = document.createElement("div");
			bgHost.style.cssText = "position:absolute;inset:0;";
			dimEl = document.createElement("div");
			dimEl.id = DIM_ID;
			dimEl.style.cssText = "position:absolute;inset:0;background:transparent;--ap-dim-bg:transparent;";
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

		// 各场景原版层底色（来自上游 plugin-host/backgrounds/* 控制器逐字照抄；
		// blinking-squares / particle-image 用其设置的 backgroundColor，缺省 #000）
		var SCENE_LAYER_BG = {
			"milky-way": "#02090d",
			"aurora-ionosphere": "#02090d",
			"cloud-train": "#02090d",
			"mountain": "#02090d",
			"pixel-sculpt": "#02090d",
			"heavenly-cloud": "#020408",
			"black-hole": "#000000",
			"glow-horizon": "#050507",
			"blinking-squares": "#000000",
			"particle-image": "#000000",
		};

		// 层底色取值：particle-image 的「背景」颜色控件（settings.backgroundColor）实时覆盖
		function sceneLayerBg(id) {
			if (id === "particle-image") {
				var s = state && state.sceneParams && state.sceneParams["particle-image"];
				var c = s && typeof s.backgroundColor === "string" ? s.backgroundColor : null;
				if (c && /^#[\da-fA-F]{6}$/.test(c)) return c;
			}
			return SCENE_LAYER_BG[id] || "#000";
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

		// 画廊选型补种：上游只在「全新图库导入」那一刻写 selectedImageIds/activeImageId；
		// 历史版本曾用空默认值覆盖过 store，这里对「store 缺选型但 IndexedDB 有图」的场景
		// 按上游 fresh 语义重建默认选型（幂等，仅补空；DB 不存在直接放弃，不建库）
		function ensureGallerySelection(id) {
			if (id !== "particle-image") return Promise.resolve(null);
			return new Promise(function (resolve) {
				var key = STORE_KEYS[id];
				var DB = "code-codex-particle-image-background";
				var done = false;
				function finish() { if (!done) { done = true; resolve(null); } }
				function looksSelected(s) {
					return !!(s && ((s.selectedImageIds && s.selectedImageIds.length) || s.activeImageId));
				}
				try {
					if (looksSelected((function () { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) { return null; } })())) { finish(); return; }
					var req = indexedDB.open(DB);
					req.onupgradeneeded = function () { // 库不存在：不替 vendor 建库
						try { if (req.transaction) req.transaction.abort(); } catch (e) {}
						finish();
					};
					req.onsuccess = function () {
						var db = req.result;
						var wrapped = false;
						function closeDb() { try { db.close(); } catch (e) {} }
						try {
							var rq = db.transaction("images", "readonly").objectStore("images").getAll();
							rq.onsuccess = function () {
								closeDb();
								if (wrapped) return; wrapped = true;
								var rows = (rq.result || []).filter(function (r) {
									return r && r.id !== "__codeCodex_default_media_v1__" && (r.blob || r.file);
								});
								if (!rows.length) { finish(); return; }
								rows.sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
								var cur = {};
								try { cur = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (e) {}
								if (looksSelected(cur)) { finish(); return; }
								cur.selectedImageIds = rows.map(function (r) { return r.id; });
								cur.activeImageId = rows[0].id;
								try { localStorage.setItem(key, JSON.stringify(cur)); } catch (e) {}
								finish();
							};
							rq.onerror = function () { closeDb(); if (!wrapped) { wrapped = true; finish(); } };
						} catch (e) { closeDb(); finish(); }
					};
					req.onerror = function () { finish(); };
					req.onblocked = function () { finish(); };
					setTimeout(finish, 3000); // 兜底：不让选型修复阻塞场景启动
				} catch (e) { finish(); }
			});
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
			// 立即隐藏旧舞台（新旧场景同屏重叠的根因）：dispose 后旧画布定格，
			// 但 DOM 要保留 4s——粒子框架的场景切换握手（startup-hold）依赖旧 layer
			// 短暂共存，过早移除会卡死新场景
			try { stage.style.visibility = "hidden"; } catch (e) {}
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

		// ─────────── pixel-sculpt 常驻编辑器（上游 controller：面板与背景共用一个实例） ───────────

		function psActive() {
			return !!(state && state.enabled && state.mode === "scene" && state.scene === "pixel-sculpt");
		}

		function psPaused() {
			var p = state && state.sceneParams && state.sceneParams["pixel-sculpt"];
			return !!(p && typeof p === "object" && p.paused);
		}

		var psEd = null; // {stage, canvas, inst, ready}；未启用时也可存在（编辑器），detach 且 paused
		function ensurePsEditor() {
			if (psEd) return psEd.ready;
			var stage = document.createElement("div");
			stage.style.cssText = "position:absolute;inset:0;";
			var canvas = document.createElement("canvas");
			canvas.style.cssText = "width:100%;height:100%;display:block";
			stage.appendChild(canvas);
			psEd = { stage: stage, canvas: canvas, inst: null, ready: null };
			psEd.ready = ensureGallery("pixel-sculpt").catch(function () { return null; })
				.then(function () { return ensureVendorScene("pixel-sculpt"); })
				.then(function (entry) {
					var seed = entry.prepareDefaults ? entry.prepareDefaults() : null;
					return Promise.resolve(seed).catch(function () { return null; }).then(function () {
						var Ctor = entry.exports && entry.exports.PixelSculptRenderer;
						if (typeof Ctor !== "function") throw new Error("PixelSculptRenderer 不可用");
						// persist=true：控件交互实时写 store（上游控制器路径同款；背景 tn 路径才是 false）
						var inst = new Ctor(stage, canvas, null, function (msg) {
							if (msg && psActive()) setStatus("Pixel Sculpt：" + String(msg).slice(0, 60), true);
						}, true);
						psEd.inst = inst;
						return psEd;
					});
				});
			psEd.ready.catch(function () { psEd = null; }); // 失败允许重试
			return psEd.ready;
		}

		// 启用：编辑器的 layer 挂进当前舞台 + setActive(true)；停用：摘除 + setActive(false)，实例保留
		function attachPsScene(stage, seq, id) {
			ensurePsEditor().then(function (ed) {
				if (seq !== renderSeq || !psActive()) return;
				stage.appendChild(ed.stage);
				try { ed.inst.setActive(true, { paused: psPaused() }); } catch (e) {}
				bgInstance = {
					setSettings: function (s) { try { ed.inst.setSettings(s || {}); } catch (e) {} },
					reset: function () { try { ed.inst.reset(); } catch (e) {} },
					replay: function () { try { ed.inst.replay(); } catch (e) {} },
					dispose: function () {
						try { if (ed.stage.parentNode) ed.stage.parentNode.removeChild(ed.stage); } catch (e) {}
						try { ed.inst.setActive(false, { paused: psPaused() }); } catch (e) {}
					},
				};
				bgSceneId = id;
			}).catch(function (err) {
				if (seq !== renderSeq) return;
				paintFallback("Pixel Sculpt 启动失败：" + String((err && err.message) || err).slice(0, 50));
				setStatus("Pixel Sculpt 启动失败", true);
			});
		}

		// 面板：渲染器自带的整套控件挂进 controls-host（控件 DOM 常驻实例，重复挂载是幂等搬移）
		function mountPsControls() {
			if (!ui || !settingsOpen || settingsId !== "pixel-sculpt") return;
			ensurePsEditor().then(function (ed) {
				if (!ui || !settingsOpen || settingsId !== "pixel-sculpt") return;
				var host = ui.settings.querySelector("[data-pshost]");
				if (host && ed.inst) {
					try { ed.inst.mountControls(host, "zh"); } catch (e) {}
				}
				syncPsPanel();
			}).catch(function (err) {
				setStatus("Pixel Sculpt 设置加载失败：" + String((err && err.message) || err).slice(0, 50), true);
			});
		}

		// 面板状态同步：未启用提示、暂停开关可用性、重置按钮可用性（上游 renderPixelSculpt 同构）
		function syncPsPanel() {
			if (!ui || !settingsOpen || settingsId !== "pixel-sculpt") return;
			var note = ui.settings.querySelector("[data-psnote]");
			if (note) note.hidden = psActive();
			var pausedEl = ui.settings.querySelector('[data-toggle="__pspaused"]');
			if (pausedEl) { pausedEl.checked = psPaused(); pausedEl.disabled = !psActive(); }
			var rst = ui.settings.querySelector('[data-act="psreset"]');
			if (rst) rst.disabled = !(psEd && psEd.inst);
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
		var lastParamsSig = null;

		function paramsSig() {
			return JSON.stringify(state && state.sceneParams && state.sceneParams[state.scene] || {});
		}

		function renderSig() {
			if (!(state && state.enabled && state.mode === "scene")) return null;
			// 参数变化不再触发重建：实时提交走 renderer.setSettings（上游同款）
			return state.mode + ":" + state.scene;
		}

		function renderScene() {
			var seq = ++renderSeq;
			var sig = renderSig();
			lastRenderSig = sig;
			lastParamsSig = paramsSig();
			if (!sig) {
				disposeBgInstance();
				return;
			}
			var id = state.scene && SCENE_IDS.indexOf(state.scene) >= 0 ? state.scene : "milky-way";
			// 层底色 = 原版该场景控制器的指定值（经 CSS 变量下发，通配透明清不掉）
			layer.style.setProperty("--ap-layer-bg", sceneLayerBg(id));
			// 全量设置写入场景 store（渲染器启动真值；上游控制器 updateSettings 同语义）
			writeSceneSetting(id, buildStoreSettings(id));
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
				return ensureGallerySelection(id);
			}).then(function () {
				return ensureVendorScene(id);
			}).then(function (entry) {
				// 等脚本/画廊期间设置可能已变
				if (seq !== renderSeq || !(state && state.enabled && state.mode === "scene") || state.scene !== id) return;
				disposeBgInstance();
				if (id === "pixel-sculpt") {
					// 上游控制器路径：常驻编辑器实例挂入舞台 + setActive(true)，面板与背景共用
					attachPsScene(newStage(), seq, id);
					return;
				}
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
							if (seq === renderSeq) setStatus("场景未就绪：" + String((err && err.message) || err).slice(0, 60), true);
						});
					}
				} catch (e) {
					bgInstance = null;
					paintFallback("场景渲染器启动失败：" + id + "（" + String((e && e.message) || e).slice(0, 60) + "）");
					setStatus("场景渲染器启动失败：" + id, true);
				}
			}).catch(function (err) {
				if (seq !== renderSeq) return;
				disposeBgInstance();
				paintFallback("场景加载失败：" + id + "（" + String((err && err.message) || err).slice(0, 50) + "）");
					setStatus("场景加载失败：" + id, true);
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
			// 级联层设计（!important 在层间反转优先级，层内声明顺序即优先级）：
			//   dsh-ap-assert   —— 层底色/dim 重申（最高）
			//   dsh-ap-masks    —— 分区蒙版
			//   dsh-ap-clear    —— 通配透明（最低，但压过应用内联样式）
			// 通配透明必须排除背景层子树：场景内部靠 background/mix-blend-mode 画的
			// 结构（如 glow-horizon 的穹顶）被清掉会直接丢色（原版把该规则放在独立的
			// transparent-background 插件里，启用场景时不生效——这里用 :not 排除等价实现）。
			// :not(#id *) 带来的特异性提升被层序抵消，无需再堆 data-ap-masks 次数。
			var NOT_LAYER = ":not(#" + LAYER_ID + "):not(#" + LAYER_ID + " *)";
			// DSH 原生设置页豁免（两种状态都生效）：通配清除跳过设置面板子树
			// （body 直系 *_overlay 里的 *_panel），面板保持宿主原生底色与渐变，
			// 主界面与背景照常透明。css-module 语义后缀 _panel 稳定、哈希前缀随版本变；
			// :not() 复杂选择器（Chrome 88+）与 composer 卡片豁免同款机制。
			var CLEAR_TAIL = ":not([role=\"img\"]):not([data-icon]):not([class*=\"icon\" i])"
				+ ":not([class*=\"_panel\"]):not([class*=\"_panel\"] *)";
			// 通配清除的元素选择器（:where 全体表面元素）
			var CLEAR_BASE = " body :where(div,main,aside,section,article,header,"
				+ "footer,nav,form,dialog,ul,ol,li,button,input,textarea,select)"
				+ NOT_LAYER;
			var CLEAR_DECL = "background-color:transparent !important;-webkit-backdrop-filter:none !important;backdrop-filter:none !important";
			// 输入卡片保留原生样式：表面蒙版停用（data-ap-masks 移除）时，通配清除不再命中
			// Codinput 卡片子树——输入框保持原有底色（原生 rgba 卡片面），不全透。
			// 蒙版启用时无此豁免：卡片由「消息输入区」蒙版按滑杆值上色。
			var COMPOSER_KEEP = ":not([data-composer-card]):not([data-composer-card] *)";
			// DSH 原生设置页豁免（两种状态都生效）：设置面板（body 直系 *_overlay 里的
			// *_panel）子树不被通配清除——面板保持宿主原生底色，主界面与背景照常透明。
			// css-module 语义后缀 _panel/_overlay 稳定，哈希前缀随版本变；须限定
			// `body > [class*="_overlay"]` 直系，否则会命中主界面常驻的装饰 overlay。
			var SETTINGS_KEEP = ":not([class*=\"_panel\"]):not([class*=\"_panel\"] *)";
			var PANEL_KEEPScope = "body > [class*=\"_overlay\"] > [class*=\"_panel\"]";
			var css = "@layer dsh-ap-assert{\n"
				+ "html[data-ap-bg] body div#" + LAYER_ID + "{background:var(--ap-layer-bg,#000) !important}\n"
				+ "html[data-ap-bg] body div#" + DIM_ID + "{background:var(--ap-dim-bg,transparent) !important}\n"
				+ "}\n";
			css += "@layer dsh-ap-masks{\n";
			for (var i = 0; i < REGION_ROWS.length; i++) {
				var r = REGION_ROWS[i];
				css += "html[data-ap-masks] body " + r.selector + "{"
					+ "background-color:rgba(" + r.base + ",var(--ap-mask-" + r.key + ")) !important}\n";
			}
			// 输入卡片的原生 box-shadow（0.5px 白描边 + 黑晕）在透明背景上会显成一圈「框」；
			// 蒙版启用时清掉，让卡片成为纯蒙版色块。停用态卡片走原生样式，阴影保留。
			css += "html[data-ap-masks] body [data-composer-card]{box-shadow:none !important}\n";
			css += "}\n";
			css += "@layer dsh-ap-clear{\n"
				+ "html[data-ap-bg]{background-color:transparent !important}\n"
				+ "html[data-ap-bg] body{isolation:isolate;background-color:transparent !important}\n" // 原版同款：body 独立层叠上下文
				+ "html[data-ap-bg][data-ap-masks]" + CLEAR_BASE + CLEAR_TAIL + "{" + CLEAR_DECL + "!important}\n"
				+ "html[data-ap-bg]:not([data-ap-masks])" + CLEAR_BASE + CLEAR_TAIL + COMPOSER_KEEP + "{" + CLEAR_DECL + "!important}\n"
				// 输入座位的原生「淡入渐变」（background-image: transparent→rgb(21,21,23)）：
				// 卡片左缘的空隙会透出这块渐变，看起来像输入框旁多出一块灰色圆角斑——两态都清
				+ "html[data-ap-bg] body [data-composer-seat],"
				+ "html[data-ap-bg] body div:has(> [data-slot=\"conversation.input.dock\"]){background-image:none !important}\n"
				+ "html[data-ap-bg] body :is([class*=\"bg-gradient\"],[class*=\"TopFade\"],[class*=\"fade\"])"
				+ NOT_LAYER + "{background-image:none !important}\n"
				+ "}\n";
			return css;
		}

		function applySurfaceVars() {
			var html = document.documentElement;
			for (var i = 0; i < REGION_ROWS.length; i++) {
				var r = REGION_ROWS[i];
				var v = state && state.surfaces ? clamp(num(state.surfaces[r.key], 66), 0, 100) / 100 : 0;
				html.style.setProperty("--ap-mask-" + r.key, v.toFixed(3));
			}
			syncCornerPatch();
		}

		// 圆角缺口补丁：中央列（对话区容器）左上有 16px 圆角 + overflow:hidden，蒙版背景被
		// 圆角裁掉后，弧外月牙露出原始背景。在背景层放一个月牙形补丁（radial mask 只保留
		// 圆角外区域——圆角内透明，避免与中央列蒙版叠加深色），颜色/不透明度跟随「会话侧栏」
		// 滑杆（用户视角这个角属于左侧栏；侧栏调 0 时角也跟着透）。
		var cornerEl = null;
		var cornerRO = null;
		var cornerROTarget = null;
		var cornerRetries = 0;
		function syncCornerPatch() {
			var masksOn = !!(state && state.enabled && state.mode !== "off" && state.surfaces && state.surfaces.enabled);
			var col = document.querySelector('[data-slot="main"]');
			col = col ? col.parentElement : null;
			var r = 0;
			if (masksOn && col && layer) {
				r = parseFloat(getComputedStyle(col).borderTopLeftRadius);
				if (!Number.isFinite(r) || r <= 0) r = 0;
			}
			if (!r || !layer) {
				if (cornerEl) cornerEl.style.display = "none";
				// boot 首次运行早于宿主布局挂载（col 还不存在）——CSS 蒙版是活的、DOM 补丁
				// 不是，必须定时重试到建成（封顶 30s），否则补丁永不出现
				if (masksOn && layer && cornerRetries < 30) {
					cornerRetries++;
					setTimeout(function () { syncCornerPatch(); }, 1000);
				}
				return;
			}
			cornerRetries = 0;
			if (!cornerEl) {
				cornerEl = document.createElement("div");
				cornerEl.id = "dsh-ap-corner";
				cornerEl.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;";
				layer.appendChild(cornerEl);
			}
			var rect = col.getBoundingClientRect();
			var a = clamp(num(state.surfaces.sidebar, 66), 0, 100) / 100;
			var mask = "radial-gradient(circle " + r + "px at 100% 100%, transparent 0, transparent " + (r - 0.6).toFixed(1) + "px, #000 " + r + "px)";
			cornerEl.style.display = "block";
			cornerEl.style.left = rect.x + "px";
			cornerEl.style.top = rect.y + "px";
			cornerEl.style.width = r + "px";
			cornerEl.style.height = r + "px";
			cornerEl.style.background = "rgba(16,17,20," + a.toFixed(3) + ")";
			cornerEl.style.webkitMaskImage = mask;
			cornerEl.style.maskImage = mask;
			// 侧栏折叠/窗口缩放会移动中央列——尺寸变化时重新对位（布局重建换元素时换观察目标）
			if (cornerRO && cornerROTarget !== col) {
				cornerRO.disconnect();
				cornerRO = null;
			}
			if (!cornerRO) {
				cornerRO = new ResizeObserver(function () { syncCornerPatch(); });
				cornerRO.observe(col);
				cornerROTarget = col;
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
				surfaceStyleEl.setAttribute("data-dsh-ccx", "surface");
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

		// ─────────── ③ 设置面板（Shadow DOM · code-codex 插件市场 + 设置面板复刻） ───────────
		//
		// v0.8：按 code-codex 0.5.7 真实 UI 逐像素复刻（docs/codex-ui/ 活体采集 + 上游
		// packages/explorer-ui/src/components/styles/*.ts 源码真值）：
		//   · 320px 插件市场弹层（齿轮上方弹出、底部箭头）——12 张 Appearance 卡片
		//   · 344px 场景设置 popover（卡片 ⚙ 右侧弹出、左箭头锚定）——原版分组/工具栏/行结构
		//   · 保留 v0.6 确立的「草稿 + 应用」提交制（vendor 渲染器仅 glow-horizon 支持
		//     updateSettings，实时提交会导致活跃场景整体重建、开场动画重播）
		//   · 移除 v0.7 双卡面板与实时预览舞台（原版无预览；Demo 已评审通过）

		var root9 = null;
		var marketOpen = false;     // 插件市场弹层可见
		var settingsOpen = false;   // 设置面板可见
		var settingsId = null;      // 设置面板对应卡片 id（custom / surface / 场景 id）
		var ui = null;              // { trigger, market, settings }
		var wallpapersCache = [];

		// 背景调节（图层级，实时生效）
		var PARAM_ROWS = [
			{ key: "dim", zh: "背景压暗", min: 0, max: 80, step: 1, scale: 100 },
			{ key: "blur", zh: "背景模糊", min: 0, max: 20, step: 0.5, scale: 1 },
		];
		var LIB_PAGE_SIZE = 12;
		var libPage = 0;

		// 场景参数草稿（应用制提交；draftDeltaObj 口径与宿主增量落盘一致）
		var draft = null;
		var draftScene = null;

		// ───────────── 原版设计 token（暗色，docs/codex-ui/tokens.json 活体校准） ─────────────

		var PANEL_CSS = [
			":host{all:initial;color-scheme:dark;" +
				"font-family:'Segoe UI','Microsoft YaHei UI',system-ui,sans-serif;font-weight:430}",
			"*{box-sizing:border-box;font-family:inherit}",
			// 触发齿轮（沿用现役位置：left:12 bottom:76）
			".trigger{position:fixed;left:12px;bottom:76px;z-index:2147482000;width:30px;height:30px;border-radius:50%;"
				+ "border:1px solid rgba(128,140,170,.35);background:rgba(20,24,34,.55);backdrop-filter:blur(8px);"
				+ "cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s ease,transform .15s ease;padding:0}",
			".trigger:hover{opacity:1;transform:scale(1.08)}",
			".trigger svg{width:16px;height:16px;fill:none;stroke:#dfe6f5;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
			// token（上游 tokens-and-host.ts 暗色组）
			".preview-market-popover,.particle-settings-panel{" +
				"--cle-paper:#1f1f1f;--cle-paper-raised:#242424;--cle-subtle:#242424;--cle-ink:#f2f2f2;--cle-muted:#a3a3a3;" +
				"--cle-rule:#3a3a3a;--cle-rule-strong:#454545;--cle-scroll-thumb:#666666;--cle-hover:#2b2c2e;--cle-subtle-2:#242424;" +
				"--cle-input:#252628;--cle-signal:#69aaf5;--cle-added:#62c990;--cle-focus:#69aaf5;" +
				"--cle-icon-blue:#79b8e6;--cle-icon-violet:#b9a1e3;--cle-market-enable:#e5f0fe;" +
				"--cle-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;" +
				"color-scheme:dark}",
			// ── 插件市场弹层（status-and-market.ts 逐条）──
			".preview-market-popover{position:fixed;left:12px;bottom:114px;z-index:2147482900;" +
				"width:min(320px,calc(100vw - 24px));max-height:calc(100vh - 130px);overflow:visible;color:var(--cle-ink);" +
				"background:var(--cle-paper-raised);border:1px solid var(--cle-rule-strong);border-radius:10px;" +
				"box-shadow:0 14px 34px rgba(12,18,28,.2),0 3px 10px rgba(12,18,28,.12);" +
				"font-size:12px;line-height:1.45;animation:ccx-market-in 130ms cubic-bezier(.2,.8,.2,1) both}",
			".preview-market-popover[hidden]{display:none}",
			".preview-market-popover::after{content:'';position:absolute;bottom:-6px;left:18px;width:10px;height:10px;" +
				"background:var(--cle-paper-raised);border-right:1px solid var(--cle-rule-strong);border-bottom:1px solid var(--cle-rule-strong);" +
				"transform:rotate(45deg)}",
			".preview-market-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px 8px 14px;" +
				"border-bottom:1px solid var(--cle-rule)}",
			".preview-market-header h3{flex:1;margin:0;color:var(--cle-ink);font-size:13px;font-weight:650;line-height:18px}",
			".preview-market-close{display:grid;flex:0 0 auto;place-items:center;width:24px;height:24px;padding:0;color:var(--cle-muted);" +
				"background:transparent;border:0;border-radius:5px;cursor:pointer}",
			".preview-market-close:hover{color:var(--cle-ink);background:var(--cle-hover)}",
			".preview-market-close svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.3}",
			".preview-market-list{position:relative;display:grid;align-content:start;gap:8px;max-height:min(420px,calc(100vh - 150px));" +
				"padding:8px;overflow:auto;scrollbar-color:var(--cle-scroll-thumb) transparent;scrollbar-width:thin}",
			".preview-market-categories{display:grid;width:fit-content;grid-template-columns:repeat(3,max-content);gap:2px;padding:2px;" +
				"background:var(--cle-subtle);border:1px solid var(--cle-rule);border-radius:7px}",
			".preview-market-category{min-width:0;padding:5px 6px;color:var(--cle-muted);background:transparent;border:0;border-radius:5px;" +
				"cursor:pointer;font-size:10px;font-weight:650;line-height:14px;letter-spacing:.01em;white-space:nowrap}",
			".preview-market-category:hover{color:var(--cle-ink);background:var(--cle-hover)}",
			".preview-market-category[aria-selected='true']{color:var(--cle-ink);background:var(--cle-paper);box-shadow:0 1px 2px rgba(12,18,28,.08)}",
			".preview-market-section{display:grid;gap:6px;min-width:0}",
			".preview-market-section[hidden]{display:none}",
			".preview-market-section-list{display:grid;gap:8px}",
			".cat-empty{margin:4px 2px;color:var(--cle-muted);font-size:10.5px}",
			// ── Appearance 卡片（plugin-cards.ts 逐条）──
			".preview-extension{display:grid;grid-template-columns:38px minmax(0,1fr);column-gap:10px;row-gap:9px;padding:10px;" +
				"background:var(--cle-paper);border:1px solid var(--cle-rule);border-radius:8px}",
			".preview-extension-icon{display:grid;place-items:center;align-self:start;width:38px;height:38px;color:var(--cle-icon-blue);" +
				"background:color-mix(in srgb,var(--cle-icon-blue) 10%,var(--cle-paper));" +
				"border:1px solid color-mix(in srgb,var(--cle-icon-blue) 20%,var(--cle-rule));border-radius:8px}",
			".preview-extension-icon svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}",
			".preview-extension-copy{min-width:0}",
			".preview-extension-title-row{display:flex;flex-direction:column;align-items:flex-start;gap:3px}",
			".preview-extension h4{min-width:0;margin:0;color:var(--cle-ink);font-size:12px;font-weight:650;line-height:17px;overflow-wrap:anywhere}",
			".preview-extension-status{flex:0 0 auto;padding:1px 5px;color:var(--cle-muted);background:var(--cle-subtle);border-radius:999px;" +
				"font-size:9px;line-height:15px}",
			".preview-extension-status[data-enabled='true']{color:var(--cle-added);background:color-mix(in srgb,var(--cle-added) 11%,var(--cle-paper))}",
			".preview-extension-actions{display:flex;grid-column:2;align-items:center;justify-self:start;gap:5px}",
			".preview-extension-action{grid-column:2;justify-self:start;min-width:58px;min-height:25px;padding:3px 10px;color:#173b66;" +
				"background:var(--cle-market-enable);border:1px solid color-mix(in srgb,var(--cle-market-enable) 80%,#69aaf5);" +
				"border-radius:5px;cursor:pointer;font-size:10.5px;font-weight:600}",
			".preview-extension-action:hover{filter:brightness(1.06)}",
			".preview-extension-action[data-enabled='true']{color:var(--cle-muted);background:transparent;border-color:var(--cle-rule-strong)}",
			".particle-settings-trigger{display:grid;flex:0 0 auto;place-items:center;width:25px;height:25px;padding:0;color:var(--cle-muted);" +
				"background:transparent;border:1px solid var(--cle-rule-strong);border-radius:5px;cursor:pointer}",
			".particle-settings-trigger:hover,.particle-settings-trigger[aria-expanded='true']{color:var(--cle-ink);background:var(--cle-hover)}",
			".particle-settings-trigger svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}",
			// 逐插件 icon 着色（git-history.ts）
			".ext-particle .preview-extension-icon{color:var(--cle-icon-violet);background:color-mix(in srgb,var(--cle-icon-violet) 10%,var(--cle-paper));" +
				"border-color:color-mix(in srgb,var(--cle-icon-violet) 22%,var(--cle-rule))}",
			".ext-blackhole .preview-extension-icon{color:#f59e0b;background:color-mix(in srgb,#f59e0b 10%,var(--cle-paper));" +
				"border-color:color-mix(in srgb,#f59e0b 24%,var(--cle-rule))}",
			".ext-glowhorizon .preview-extension-icon{color:#a558fb;background:color-mix(in srgb,#a558fb 10%,var(--cle-paper));" +
				"border-color:color-mix(in srgb,#a558fb 24%,var(--cle-rule))}",
			".ext-heavenlycloud .preview-extension-icon{color:#38e8ff;background:color-mix(in srgb,#38e8ff 10%,var(--cle-paper));" +
				"border-color:color-mix(in srgb,#38e8ff 24%,var(--cle-rule))}",
			// ── 设置面板 popover（git-history.ts 逐条）──
			".particle-settings-panel{position:fixed;top:12px;left:340px;z-index:2147483000;display:grid;grid-template-rows:auto minmax(0,1fr);" +
				"width:min(344px,calc(100vw - 24px));max-height:calc(100vh - 24px);color:var(--cle-ink);background:var(--cle-paper-raised);" +
				"border:1px solid var(--cle-rule-strong);border-radius:8px;" +
				"box-shadow:0 20px 52px rgba(0,0,0,.34),0 4px 14px rgba(0,0,0,.2);font-size:12px;line-height:1.45;" +
				"animation:ccx-settings-in 130ms cubic-bezier(.2,.8,.2,1) both}",
			".particle-settings-panel[hidden]{display:none}",
			".particle-settings-panel[data-side='right']{transform-origin:left top}",
			".particle-settings-panel[data-side='right']::before{position:absolute;top:var(--cle-anchor-y,24px);left:-6px;width:10px;height:10px;" +
				"background:var(--cle-paper-raised);border-bottom:1px solid var(--cle-rule-strong);border-left:1px solid var(--cle-rule-strong);" +
				"content:'';transform:translateY(-50%) rotate(45deg)}",
			".particle-settings-header{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;" +
				"min-width:0;padding:12px 12px 10px 13px;background:var(--cle-paper-raised);border-bottom:1px solid var(--cle-rule);" +
				"border-radius:8px 8px 0 0}",
			".particle-settings-heading{min-width:0}",
			".particle-settings-header h3{margin:0;overflow:hidden;color:var(--cle-ink);font-size:13px;font-weight:650;line-height:18px;" +
				"text-overflow:ellipsis;white-space:nowrap}",
			".particle-settings-header p{margin:1px 0 0;color:var(--cle-muted);font-size:10px;line-height:15px}",
			".particle-settings-header p .badge{margin-left:4px;color:var(--cle-signal)}",
			".particle-settings-close{display:grid;flex:0 0 auto;place-items:center;width:24px;height:24px;padding:0;color:var(--cle-muted);" +
				"background:transparent;border:0;border-radius:5px;cursor:pointer}",
			".particle-settings-close:hover{color:var(--cle-ink);background:var(--cle-hover)}",
			".particle-settings-close svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.3}",
			".particle-settings-scroll{display:grid;gap:10px;align-content:start;min-width:0;min-height:0;max-height:calc(100vh - 90px);" +
				"padding:9px 10px 11px;overflow:auto;overscroll-behavior:contain;scrollbar-color:var(--cle-scroll-thumb) transparent;scrollbar-width:thin}",
			// 分组 fieldset
			".particle-settings-group{display:grid;gap:6px;min-width:0;margin:0;padding:0;border:0}",
			".particle-settings-group + .particle-settings-group{padding-top:9px;border-top:1px solid var(--cle-rule)}",
			".particle-settings-group legend{width:100%;margin:0 0 1px;padding:0;color:var(--cle-muted);font-size:9px;font-weight:700;" +
				"line-height:14px;letter-spacing:.04em}",
			// 控制行
			".particle-control-row{display:grid;grid-template-columns:minmax(92px,.9fr) minmax(72px,1.1fr) minmax(42px,auto);align-items:center;" +
				"gap:6px;min-width:0;min-height:34px;color:var(--cle-muted);font-size:10px}",
			".particle-control-row label{min-width:0;overflow-wrap:anywhere;line-height:14px}",
			".particle-control-row input[type='range']{width:100%;min-width:0;margin:0;accent-color:var(--cle-signal);cursor:pointer}",
			".particle-control-value{display:grid;min-width:42px;justify-items:end}",
			".particle-control-row output{box-sizing:border-box;width:100%;min-width:42px;padding:0 3px;color:var(--cle-ink);" +
				"background:transparent;border:1px solid transparent;border-radius:4px;font:9.5px/18px var(--cle-mono);" +
				"font-variant-numeric:tabular-nums;text-align:right;user-select:none}",
			".particle-control-row output:hover{background:var(--cle-hover);border-color:var(--cle-rule)}",
			// 分区行内 ↺（恢复此项默认值，上游 surface-opacity-row 四列网格：数值右侧）
			".surface-opacity-row{grid-template-columns:minmax(92px,1fr) minmax(60px,1fr) 42px 24px;min-height:30px}",
			".surface-opacity-row button{border:1px solid var(--cle-rule);border-radius:4px;background:var(--cle-paper);color:var(--cle-ink);height:24px;padding:0;cursor:pointer;font:inherit}",
			// 开关行 / 颜色行
			".particle-toggle-row,.particle-color-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;" +
				"min-height:27px;margin:0 8px;color:var(--cle-muted);font-size:9.5px}",
			".particle-toggle-row input[type='checkbox']{width:14px;height:14px;margin:0;accent-color:var(--cle-signal);cursor:pointer}",
			".particle-color-row input[type='color']{width:29px;height:21px;padding:2px;overflow:hidden;background:var(--cle-input);" +
				"border:1px solid var(--cle-rule-strong);border-radius:5px;cursor:pointer}",
			// 质量工具栏（heavenly-cloud 系，cyan）
			".heavenly-cloud-quality-toolbar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}",
			".heavenly-cloud-quality-toolbar.dir4{grid-template-columns:repeat(4,minmax(0,1fr))}",
			".heavenly-cloud-quality-toolbar button{min-width:0;min-height:40px;padding:4px 6px;color:var(--cle-muted);background:var(--cle-paper-raised);" +
				"border:1px solid var(--cle-rule-strong);border-radius:5px;cursor:pointer;font-size:9.5px;font-weight:600;line-height:12px}",
			".heavenly-cloud-quality-toolbar button strong{display:block;margin-bottom:2px;color:#38e8ff;font-family:var(--cle-mono);font-size:11px}",
			".heavenly-cloud-quality-toolbar button:hover:not(:disabled),.heavenly-cloud-quality-toolbar button[aria-pressed='true']{" +
				"color:var(--cle-ink);background:color-mix(in srgb,#38e8ff 10%,var(--cle-paper-raised));" +
				"border-color:color-mix(in srgb,#38e8ff 42%,var(--cle-rule-strong))}",
			// 方向工具栏（glow-horizon，violet）
			".glow-horizon-direction-toolbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;padding-bottom:9px;" +
				"border-bottom:1px solid var(--cle-rule)}",
			".glow-horizon-direction-toolbar button{min-width:0;min-height:34px;padding:3px 5px;color:var(--cle-muted);background:var(--cle-paper-raised);" +
				"border:1px solid var(--cle-rule-strong);border-radius:5px;cursor:pointer;font-size:9.5px;font-weight:600;line-height:12px}",
			".glow-horizon-direction-toolbar button:hover:not(:disabled),.glow-horizon-direction-toolbar button[aria-pressed='true']{" +
				"color:var(--cle-ink);background:color-mix(in srgb,#a558fb 12%,var(--cle-paper-raised));" +
				"border-color:color-mix(in srgb,#a558fb 45%,var(--cle-rule-strong))}",
			".glow-horizon-direction-toolbar .glow-horizon-direction-symbol{display:block;margin-bottom:1px;font-size:14px;line-height:15px}",
			// 黑洞预设工具栏（amber）
			".black-hole-preset-toolbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;padding-bottom:9px;border-bottom:1px solid var(--cle-rule)}",
			".black-hole-preset-toolbar button{min-width:0;min-height:32px;padding:3px 5px;overflow:visible;color:var(--cle-muted);" +
				"background:var(--cle-paper-raised);border:1px solid var(--cle-rule-strong);border-radius:5px;cursor:pointer;" +
				"font-size:9.5px;font-weight:600;line-height:12px;white-space:normal}",
			".black-hole-preset-toolbar button:hover:not(:disabled),.black-hole-preset-toolbar button[aria-pressed='true']{" +
				"color:var(--cle-ink);background:color-mix(in srgb,#f59e0b 10%,var(--cle-paper-raised));" +
				"border-color:color-mix(in srgb,#f59e0b 45%,var(--cle-rule-strong))}",
			".black-hole-preset-toolbar .black-hole-reset{color:var(--cle-muted);background:var(--cle-subtle)}",
			// 底部动作区
			".glow-horizon-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;padding-top:2px}",
			".glow-horizon-actions.single{grid-template-columns:minmax(0,1fr)}",
			".glow-horizon-actions button{min-height:30px;padding:4px 8px;color:var(--cle-muted);background:var(--cle-subtle);" +
				"border:1px solid var(--cle-rule-strong);border-radius:5px;cursor:pointer;font-size:10px;font-weight:600}",
			".glow-horizon-actions button:hover{color:var(--cle-ink);background:color-mix(in srgb,var(--cle-signal) 10%,var(--cle-subtle));" +
				"border-color:color-mix(in srgb,var(--cle-signal) 42%,var(--cle-rule-strong))}",
			// 图片库（details）
			".particle-source-details{min-width:0;overflow:hidden;background:var(--cle-subtle);border:1px solid var(--cle-rule);border-radius:7px}",
			".particle-source-details[open]{padding-bottom:8px}",
			".particle-source-summary{display:flex;align-items:center;gap:7px;min-height:30px;padding:5px 8px;color:var(--cle-ink);cursor:pointer;" +
				"font-size:10.5px;font-weight:600;list-style:none;user-select:none}",
			".particle-source-summary::-webkit-details-marker{display:none}",
			".particle-source-summary::before{flex:0 0 auto;width:6px;height:6px;border-right:1px solid var(--cle-muted);" +
				"border-bottom:1px solid var(--cle-muted);content:'';transform:rotate(-45deg)}",
			".particle-source-details[open] .particle-source-summary::before{transform:rotate(45deg) translate(-1px,-1px)}",
			".particle-source-summary:hover{background:var(--cle-hover)}",
			".particle-source-count{min-width:0;margin-left:auto;overflow:hidden;color:var(--cle-muted);font:9px/16px var(--cle-mono);white-space:nowrap}",
			".particle-library-toolbar{display:flex;align-items:center;gap:6px;min-width:0;margin:0 8px 7px}",
			".particle-library-add,.particle-library-clear{display:inline-flex;align-items:center;justify-content:center;min-height:24px;padding:3px 7px;" +
				"color:var(--cle-muted);background:var(--cle-paper-raised);border:1px solid var(--cle-rule-strong);border-radius:5px;cursor:pointer;" +
				"font-size:9.5px;line-height:15px}",
			".particle-library-add{position:relative;color:var(--cle-ink);border-color:color-mix(in srgb,var(--cle-signal) 48%,var(--cle-rule))}",
			".particle-library-clear{margin-left:auto}",
			".particle-library-clear:disabled{cursor:default;opacity:.5}",
			".particle-library-add:hover,.particle-library-clear:hover:not(:disabled){background:var(--cle-hover)}",
			".particle-library-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;min-width:0;margin:0 8px}",
			".particle-library-empty{grid-column:1/-1;margin:0;padding:10px 7px;color:var(--cle-muted);background:var(--cle-paper-raised);" +
				"border:1px dashed var(--cle-rule-strong);border-radius:6px;font-size:9.5px;line-height:1.45;text-align:center}",
			".wallitem{position:relative;min-width:0}",
			".wallitem .wpick{display:grid;width:100%;min-width:0;padding:0;overflow:hidden;color:var(--cle-muted);background:var(--cle-paper);" +
				"border:1px solid var(--cle-rule);border-radius:6px;cursor:pointer;text-align:left}",
			".wallitem .wpick:hover{border-color:var(--cle-rule-strong)}",
			".wallitem.on .wpick{border-color:var(--cle-signal);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--cle-signal) 20%,transparent)}",
			".wallitem img,.wallitem .vthumb{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:var(--cle-subtle)}",
			".wallitem .vthumb{display:grid;place-items:center;color:var(--cle-muted);font-size:14px}",
			".wallitem .wname{display:block;min-width:0;padding:3px 4px 4px;overflow:hidden;font-size:8.5px;line-height:13px;" +
				"text-overflow:ellipsis;white-space:nowrap}",
			".wallitem .wdel{position:absolute;z-index:3;top:3px;right:3px;display:grid;place-items:center;width:19px;height:19px;padding:0;" +
				"color:var(--cle-ink);background:color-mix(in srgb,var(--cle-paper-raised) 88%,transparent);border:1px solid var(--cle-rule-strong);" +
				"border-radius:5px;cursor:pointer;font-size:11px;line-height:1;opacity:0}",
			".wallitem:hover .wdel,.wallitem .wdel:focus-visible{opacity:1}",
			".wallitem .wdel:hover{color:#fff;background:var(--cle-deleted,#b42318);border-color:var(--cle-deleted,#b42318)}",
			// select / 错误行 / 备注
			".particle-settings-scroll select{min-height:24px;padding:2px 6px;color:var(--cle-ink);background:var(--cle-input);" +
				"border:1px solid var(--cle-rule-strong);border-radius:5px;font-size:10px;cursor:pointer}",
			".panel-note{margin:0;padding:8px;color:var(--cle-muted);background:var(--cle-subtle);border:1px solid var(--cle-rule);" +
				"border-radius:6px;font-size:9.5px;line-height:1.45}",
			".particle-plugin-error{grid-column:1/-1;margin:0;padding:6px 7px;color:var(--cle-deleted,#ff7b72);" +
				"background:color-mix(in srgb,var(--cle-deleted,#ff7b72) 8%,var(--cle-paper));" +
				"border:1px solid color-mix(in srgb,var(--cle-deleted,#ff7b72) 30%,var(--cle-rule));border-radius:5px;font-size:9.5px;line-height:1.4}",
			".particle-plugin-error[hidden]{display:none}",
			"@keyframes ccx-market-in{from{opacity:0;transform:translateY(5px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}",
			"@keyframes ccx-settings-in{from{opacity:0;transform:translateY(3px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}",
				// pixel-sculpt 渲染器自挂载控件：上游 git-history.ts 嵌入式主题逐条（控件 DOM 由 vendor 提供）
		'.particle-settings-panel .particle-settings-scroll { gap: 10px; } .particle-settings-panel .pixelSculpt-controls-host { min-width: 0; } .particle-settings-panel .pixelSculpt-disabled { margin: 0; padding: 8px; color: var(--cle-muted); background: var(--cle-subtle); border: 1px solid var(--cle-rule); border-radius: 6px; font-size: 9.5px; line-height: 1.45; } .particle-settings-panel .pixelSculpt-disabled[hidden] { display: none; } .particle-settings-panel .pixelSculpt-paused-row { margin: 0; padding-top: 9px; border-top: 1px solid var(--cle-rule); } .particle-settings-panel .pixelSculpt-actions { grid-template-columns: minmax(0, 1fr); margin-top: -2px; } .particle-settings-panel .pixelSculpt-actions button:hover { background: var(--cle-hover); border-color: color-mix(in srgb, var(--cle-signal) 45%, var(--cle-rule-strong)); } .pixel-sculpt-controls { color: var(--cle-ink); font-size: 10px; line-height: 1.45; } .pixel-sculpt-controls .panel { position: static; display: grid; gap: 0; width: 100%; max-height: none; padding: 0; overflow: visible; background: transparent; border: 0; border-radius: 0; box-shadow: none; backdrop-filter: none; } .pixel-sculpt-controls .ph { display: none; } .pixel-sculpt-controls .row:not(.gallery-block) { display: grid; grid-template-columns: minmax(92px, .9fr) minmax(72px, 1.1fr) minmax(42px, auto); align-items: center; gap: 6px; min-width: 0; min-height: 34px; margin: 0; padding: 0; color: var(--cle-muted); font-size: 10px; } .pixel-sculpt-controls .row:not(.gallery-block) > .row-head { display: contents; } .pixel-sculpt-controls .row:not(.gallery-block) > .row-head > span { grid-column: 1; min-width: 0; overflow: visible; color: var(--cle-muted); white-space: normal; } .pixel-sculpt-controls .row:not(.gallery-block) > .row-head > output { grid-column: 3; grid-row: 1; box-sizing: border-box; width: 100%; min-width: 42px; padding: 0 3px; color: var(--cle-ink); background: transparent; border: 1px solid transparent; border-radius: 4px; cursor: text; font: 9.5px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; text-align: right; user-select: none; } .pixel-sculpt-controls .row:not(.gallery-block) > .row-head > output:hover { background: var(--cle-hover); border-color: var(--cle-rule); } .pixel-sculpt-controls .row:not(.gallery-block) > input[type="range"] { grid-column: 2; grid-row: 1; } .pixel-sculpt-controls input[type="range"] { width: 100%; min-width: 0; height: auto; margin: 0; appearance: auto; accent-color: var(--cle-signal); background: transparent; border-radius: 0; cursor: pointer; } .pixel-sculpt-controls input[type="range"]::-webkit-slider-thumb { appearance: auto; width: auto; height: auto; background: initial; border: initial; border-radius: initial; box-shadow: none; } .pixel-sculpt-controls .seg { grid-column: 2 / 4; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 5px; min-width: 0; } .pixel-sculpt-controls .seg button { min-width: 0; min-height: 25px; padding: 3px 5px; overflow: hidden; color: var(--cle-muted); background: var(--cle-paper-raised); border: 1px solid var(--cle-rule-strong); border-radius: 5px; cursor: pointer; font-size: 9.5px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; } .pixel-sculpt-controls .seg button:hover, .pixel-sculpt-controls .seg button.on { color: var(--cle-ink); background: var(--cle-hover); border-color: color-mix(in srgb, var(--cle-signal) 45%, var(--cle-rule-strong)); box-shadow: none; } .pixel-sculpt-controls .toggle-line { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; min-height: 27px; margin: 0 8px; padding: 0; color: var(--cle-muted); font-size: 9.5px; } .pixel-sculpt-controls .toggle { position: static; display: block; width: 14px; height: 14px; } .pixel-sculpt-controls .toggle input { position: static; width: 14px; height: 14px; margin: 0; opacity: 1; accent-color: var(--cle-signal); cursor: pointer; } .pixel-sculpt-controls .toggle > span { display: none; } .pixel-sculpt-controls .divider { height: 1px; margin: 9px 0; background: var(--cle-rule); } .pixel-sculpt-controls .gallery-block { display: block; min-width: 0; margin: 0 0 6px; padding: 0 0 8px; overflow: hidden; background: var(--cle-subtle); border: 1px solid var(--cle-rule); border-radius: 7px; } .pixel-sculpt-controls .gallery-block > .row-head { display: flex; align-items: center; gap: 7px; min-height: 30px; margin: 0; padding: 5px 8px; color: var(--cle-ink); font-size: 10.5px; font-weight: 600; } .pixel-sculpt-controls .gallery-block > .row-head output { min-width: 0; margin-left: auto; color: var(--cle-muted); font: 9px/16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; } .pixel-sculpt-controls .file-row { display: flex; align-items: center; gap: 6px; min-width: 0; margin: 0 8px 7px; } .pixel-sculpt-controls .file-row button, .pixel-sculpt-controls .gallery-nav button { min-height: 24px; padding: 3px 7px; color: var(--cle-muted); background: var(--cle-paper-raised); border: 1px solid var(--cle-rule-strong); border-radius: 5px; cursor: pointer; font-size: 9.5px; line-height: 15px; } .pixel-sculpt-controls .file-row button { flex: 0 0 auto; color: var(--cle-ink); border-color: color-mix(in srgb, var(--cle-signal) 48%, var(--cle-rule)); } .pixel-sculpt-controls .file-row button:disabled { cursor: default; opacity: .5; } .pixel-sculpt-controls .file-row button:hover, .pixel-sculpt-controls .gallery-nav button:hover:not(:disabled) { background: var(--cle-hover); } .pixel-sculpt-controls .file-row span { min-width: 0; margin-left: auto; overflow: hidden; color: var(--cle-muted); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; } .pixel-sculpt-controls .gallery-strip { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px; min-width: 0; margin: 0 8px; padding: 0; overflow: visible; } .pixel-sculpt-controls .gallery-empty { grid-column: 1 / -1; display: block; width: auto; min-height: 0; margin: 0; padding: 10px 7px; color: var(--cle-muted); background: var(--cle-paper-raised); border: 1px dashed var(--cle-rule-strong); border-radius: 6px; font-size: 9.5px; line-height: 1.45; text-align: center; } .pixel-sculpt-controls .gallery-item { position: relative; min-width: 0; height: auto; overflow: visible; background: transparent; border: 0; border-radius: 0; box-shadow: none; transition: none; } .pixel-sculpt-controls .gallery-item:hover { transform: none; } .pixel-sculpt-controls .gallery-preview { display: grid; width: 100%; height: auto; min-width: 0; padding: 0; overflow: hidden; color: var(--cle-muted); background: var(--cle-paper-raised); border: 1px solid var(--cle-rule); border-radius: 6px; cursor: pointer; } .pixel-sculpt-controls .gallery-preview:hover { border-color: var(--cle-rule-strong); } .pixel-sculpt-controls .gallery-item.is-selected .gallery-preview { border-color: var(--cle-signal); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cle-signal) 20%, transparent); } .pixel-sculpt-controls .gallery-item.is-active .gallery-preview { box-shadow: inset 0 0 0 1px var(--cle-ink); } .pixel-sculpt-controls .gallery-preview img { display: block; width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; background: var(--cle-subtle); filter: none; } .pixel-sculpt-controls .gallery-name { display: block; min-width: 0; padding: 3px 4px 4px; overflow: hidden; font-size: 8.5px; line-height: 13px; text-overflow: ellipsis; white-space: nowrap; } .pixel-sculpt-controls .gallery-item .remove { position: absolute; z-index: 3; top: 3px; right: 3px; display: grid; place-items: center; width: 19px; height: 19px; padding: 0 0 1px; color: var(--cle-ink); background: color-mix(in srgb, var(--cle-paper-raised) 88%, transparent); border: 1px solid var(--cle-rule-strong); border-radius: 5px; cursor: pointer; font-size: 13px; line-height: 1; opacity: 0; } .pixel-sculpt-controls .gallery-item:hover .remove, .pixel-sculpt-controls .gallery-item:focus-within .remove { opacity: 1; } .pixel-sculpt-controls .gallery-item .remove:hover { color: #ffffff; background: var(--cle-deleted); border-color: var(--cle-deleted); } .pixel-sculpt-controls .gallery-order { position: absolute; z-index: 2; top: 4px; left: 4px; display: grid; place-items: center; min-width: 16px; height: 16px; padding: 0 4px; color: #ffffff; background: var(--cle-signal); border: 1px solid color-mix(in srgb, #ffffff 48%, transparent); border-radius: 999px; pointer-events: none; font: 700 8px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; } .pixel-sculpt-controls .gallery-live { position: absolute; z-index: 2; right: 4px; bottom: 21px; padding: 1px 4px; color: var(--cle-ink); background: color-mix(in srgb, var(--cle-paper-raised) 88%, transparent); border: 1px solid var(--cle-rule-strong); border-radius: 3px; pointer-events: none; font: 700 7px/11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: .05em; } .pixel-sculpt-controls .gallery-nav { display: grid; grid-template-columns: 32px minmax(0, 1fr) 32px; align-items: center; gap: 6px; margin: 6px 8px 0; } .pixel-sculpt-controls .gallery-nav button { height: 24px; padding: 0; } .pixel-sculpt-controls .gallery-nav button:disabled { cursor: default; opacity: .5; } .pixel-sculpt-controls .gallery-index { color: var(--cle-muted); font: 9px/16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; text-align: center; } .pixel-sculpt-controls .color-row { grid-template-columns: minmax(0, 1fr) 29px !important; gap: 8px !important; min-height: 34px !important; } .pixel-sculpt-controls .color-row > div { display: grid; grid-template-columns: minmax(92px, .9fr) minmax(72px, 1.1fr); align-items: center; gap: 6px; min-width: 0; } .pixel-sculpt-controls .color-row > div > .row-head { margin: 0; color: var(--cle-muted); font-size: 10px; } .pixel-sculpt-controls .color-row input[type="text"] { box-sizing: border-box; width: 100%; min-width: 0; height: 22px; padding: 2px 6px; color: var(--cle-ink); background: var(--cle-input); border: 1px solid var(--cle-rule-strong); border-radius: 5px; outline: 0; font: 9.5px/16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; } .pixel-sculpt-controls .color-row input[type="color"] { width: 29px; height: 21px; padding: 2px; overflow: hidden; appearance: auto; background: var(--cle-input); border: 1px solid var(--cle-rule-strong); border-radius: 5px; cursor: pointer; } .pixel-sculpt-controls [hidden] { display: none !important; }',
].join("\n");

		var GEAR_SVG = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/>'
			+ '<path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>';
		var CLOSE_SVG = '<svg viewBox="0 0 16 16"><path d="m3.25 3.25 9.5 9.5M12.75 3.25l-9.5 9.5"/></svg>';
		var SLIDERS_SVG = '<svg viewBox="0 0 16 16"><path d="M2 4h3M9 4h5M2 8h7M13 8h1M2 12h1M7 12h7"/><circle cx="7" cy="4" r="2"/><circle cx="11" cy="8" r="2"/><circle cx="5" cy="12" r="2"/></svg>';

		// 卡片图标（逐字取自上游 plugin-card.ts / plugin-templates.ts）
		var CARD_ICONS = {
			eye: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M1.5 8s2.35-4 6.5-4 6.5 4 6.5 4-2.35 4-6.5 4-6.5-4-6.5-4z"/><circle cx="8" cy="8" r="1.75"/></svg>',
			sliders: SLIDERS_SVG,
			waves: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M1.8 11.9c1.3-4 2.8-6.1 4.2-6.1 1.5 0 1.6 4.4 3 4.4 1.2 0 2.1-2.7 3.3-5.9"/><path d="M3.1 13.6c1.4-2.5 2.6-3.7 3.7-3.7 1.2 0 1.8 2.1 3 2.1 1 0 1.9-1.2 2.8-3.4"/><path d="M3.4 3.3h.01M10.3 2.3h.01M13.5 7h.01"/></svg>',
			blackhole: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="2.25" fill="currentColor" stroke="none"/><ellipse cx="8" cy="8" rx="6.1" ry="3.15" transform="rotate(-18 8 8)"/><path d="M2.5 9.7c2.4 1.15 8.2 1.15 11-2.35"/></svg>',
			glowhorizon: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><ellipse cx="8" cy="9.5" rx="6.5" ry="3.3"/><path d="M1.8 8.5c1.8-2.4 10.6-2.4 12.4 0"/><path d="M3 6.4c1.9-1.5 8.1-1.5 10 0"/></svg>',
			heavenlycloud: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.1 10.9c.7-1.1 1.8-1.7 3.1-1.7.5-2 2.1-3.3 4.1-3.3 2.4 0 4.3 1.9 4.3 4.3 0 .2 0 .5-.1.7"/><path d="M1.7 12.2h12.7M3.4 14h9.1"/><path d="M6.1 8.6c.6-1.1 1.7-1.8 3-1.8"/></svg>',
			mountain: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M1 13 6 3l4 7 2-4 3 7ZM4 7l2 2 2-2" fill="none" stroke="currentColor"/></svg>',
			blinking: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><rect x="1" y="1" width="3" height="3"/><rect x="7" y="2" width="2" height="2"/><rect x="12" y="1" width="3" height="3"/><rect x="2" y="8" width="2" height="2"/><rect x="7" y="7" width="3" height="3"/><rect x="12" y="9" width="2" height="2"/><rect x="1" y="12" width="3" height="3"/><rect x="8" y="13" width="2" height="2"/></svg>',
		};

		// 市场卡片定义（原版英文插件名 + 中文界面文案；上游卡片标题保持英文）
		var CARD_TITLES = {
			"milky-way": "Milky Way Background",
			"glow-horizon": "Glow Horizon Background",
			"mountain": "Layered Mountain Background",
			"heavenly-cloud": "Heavenly Cloud Background",
			"aurora-ionosphere": "Aurora Ionosphere Background",
			"black-hole": "Black Hole Background",
			"cloud-train": "Cloud Train Background",
			"particle-image": "Particle Image Background",
			"pixel-sculpt": "Pixel Sculpt Background",
			"blinking-squares": "Blinking Squares Background",
		};
		var SCENE_CARD_META = {
			"milky-way": { icon: "waves", ext: "" },
			"glow-horizon": { icon: "glowhorizon", ext: "ext-glowhorizon" },
			"mountain": { icon: "mountain", ext: "" },
			"heavenly-cloud": { icon: "heavenlycloud", ext: "ext-heavenlycloud" },
			"aurora-ionosphere": { icon: "waves", ext: "" },
			"black-hole": { icon: "blackhole", ext: "ext-blackhole" },
			"cloud-train": { icon: "mountain", ext: "" },
			"particle-image": { icon: "eye", ext: "ext-particle" },
			"pixel-sculpt": { icon: "mountain", ext: "" },
			"blinking-squares": { icon: "blinking", ext: "" },
		};
		var CARDS = [{ id: "custom", kind: "wallpaper", title: "Custom Background", icon: "eye", ext: "" }]
			.concat([{ id: "surface", kind: "surface", title: "UI Surface Opacity", icon: "sliders", ext: "" }])
			.concat(SCENES.map(function (s) {
				var m = SCENE_CARD_META[s.id] || { icon: "eye", ext: "" };
				return { id: s.id, kind: "scene", title: CARD_TITLES[s.id] || s.en, icon: m.icon, ext: m.ext };
			}));

		// 分组图例（逐字取自原版 plugin-templates.ts 的 <legend>；zh 面板只渲染中文行）
		var GROUP_LEGENDS = {
			particles: "粒子", flow: "流动", source: "来源", pointer: "指针", render: "渲染",
			camera: "相机", disc: "吸积盘", light: "光线",
			input: "输入", downward: "下滑动态", upward: "上滑动态", release: "释放回弹",
			entrance: "开场画面", opening: "开场动画", interaction: "交互",
		};
		var FIELD_GROUP_OVERRIDES = {
			"heavenly-cloud": { field: "云场", opening: "开场画面" },
			"aurora-ionosphere": { field: "电离层", opening: "开场画面" },
			"milky-way": { field: "运动与形态", opening: "开场画面" },
		};
		var TUPLE_MAIN_LEGENDS = {
			"mountain": "山峦与氛围", "cloud-train": "列车与云海", "blinking-squares": "参数",
		};
		var TINT_LABELS = { skyTint: "天空色", smokeTint: "烟雾色", trainTint: "列车色" };
		var COLOR_SECTION_LEGENDS = { "milky-way": "五色调色板", "glow-horizon": "光效配色" };
		var QUALITY_TOOLBARS = {
			"milky-way": { mode: "quality", items: [["low", "1×", "轻量"], ["medium", "2×", "均衡"], ["high", "3×", "精细"]] },
			"heavenly-cloud": { mode: "quality", items: [["low", "56", "低"], ["medium", "76", "中"], ["high", "100", "高"]] },
			"aurora-ionosphere": { mode: "quality", items: [["low", "32", "轻量"], ["medium", "50", "均衡"], ["high", "72", "精细"]] },
			"mountain": { mode: "steps", items: [["28", "28", "流畅"], ["42", "42", "均衡"], ["57", "57", "完整"]] },
		};
		var BH_PRESETS = [["cinema", "电影"], ["lens", "透镜"], ["ember", "余烬"]];
		var BLINK_DIRECTIONS = [["right", "右"], ["left", "左"], ["top", "上"], ["bottom", "下"]];

		// ───────────── 面板挂载 ─────────────

		function ensurePanel() {
			if (root9 && document.documentElement.contains(root9)) return;
			root9 = document.createElement("div");
			root9.id = PANEL_ID;
			root9.setAttribute("data-dsh-ccx", "panel");
			var shadow = root9.attachShadow({ mode: "open" });
			var style = document.createElement("style");
			style.textContent = PANEL_CSS;
			shadow.appendChild(style);

			var trigger = document.createElement("button");
			trigger.className = "trigger";
			trigger.id = TRIGGER_ID;
			trigger.title = "背景外观（dsh-ccx）";
			trigger.innerHTML = GEAR_SVG;
			trigger.addEventListener("click", function (e) {
				e.stopPropagation();
				if (marketOpen) closeMarket(); else openMarket();
			});
			shadow.appendChild(trigger);

			var market = document.createElement("div");
			market.className = "preview-market-popover";
			market.setAttribute("role", "dialog");
			market.setAttribute("aria-modal", "false");
			market.setAttribute("aria-label", "dsh-ccx");
			market.hidden = true;
			market.innerHTML = '<div class="preview-market-header"><h3>dsh-ccx</h3>'
				+ '<button class="preview-market-close" data-act="marketclose" title="关闭 dsh-ccx" aria-label="关闭 dsh-ccx">' + CLOSE_SVG + '</button></div>'
				+ '<div class="preview-market-list">'
				+ '<div class="preview-market-section-list" data-act="cards"></div>'
				+ '</div>';
			shadow.appendChild(market);

			var settings = document.createElement("section");
			settings.className = "particle-settings-panel";
			settings.setAttribute("data-side", "right");
			settings.setAttribute("role", "dialog");
			settings.setAttribute("aria-modal", "false");
			settings.setAttribute("aria-label", "外观设置");
			settings.hidden = true;
			shadow.appendChild(settings);

			(document.documentElement || document.body).appendChild(root9);
			ui = { trigger: trigger, market: market, settings: settings };
			bindMarket(market);
			bindSettings(settings);
			buildCards();
			document.addEventListener("click", onDocClick, true);
			document.addEventListener("keydown", onDocKey, true);
		}

		// 外点关闭：必须用 composedPath（shadow DOM 内点击在 document 捕获层
		// 只能看到宿主元素，按 e.target 判断会把面板内点击当外部点击立即关面板）
		function onDocClick(e) {
			if (!root9 || (!marketOpen && !settingsOpen)) return;
			var path = typeof e.composedPath === "function" ? e.composedPath() : null;
			if (path && path.indexOf(root9) >= 0) return;
			if (settingsOpen) closeSettings();
			else closeMarket();
		}

		function onDocKey(e) {
			if (e.key !== "Escape") return;
			if (settingsOpen) { closeSettings(); return; } // Esc 先关设置面板，再关市场
			if (marketOpen) closeMarket();
		}

		function openMarket() {
			ensurePanel();
			marketOpen = true;
			ui.market.hidden = false;
			buildCards();
		}

		function closeMarket() {
			marketOpen = false;
			if (ui) ui.market.hidden = true;
			closeSettings();
		}

		function positionSettings() {
			if (!ui || !settingsOpen) return;
			var p = ui.settings;
			var m = 12;
			p.style.maxHeight = (window.innerHeight - m * 2) + "px";
			var left = 12 + 320 + 8; // 市场左缘 + 市场宽 + 间距
			left = clamp(left, m, Math.max(m, window.innerWidth - m - 344));
			p.style.left = Math.round(left) + "px";
			p.style.top = m + "px";
			var trig = ui.market.querySelector('[data-gear="' + settingsId + '"]');
			if (trig) {
				var pr = p.getBoundingClientRect();
				var trr = trig.getBoundingClientRect();
				var y = trr.top + trr.height / 2 - pr.top;
				p.style.setProperty("--cle-anchor-y", clamp(y, 14, Math.max(14, pr.height - 14)) + "px");
			}
		}

		// ───────────── 市场卡片 ─────────────

		function bgActive() {
			return !!(state && state.enabled && state.mode !== "off");
		}

		function cardOn(c) {
			if (!state) return false;
			if (c.kind === "scene") return bgActive() && state.mode === "scene" && state.scene === c.id;
			if (c.kind === "wallpaper") return bgActive() && state.mode === "wallpaper";
			return !!(state.surfaces && state.surfaces.enabled);
		}

		function cardStatus(c) {
			var on = cardOn(c);
			if (c.kind === "surface" && on) return [bgActive() ? "已启用" : "已暂停 · 无背景", on];
			return [on ? "已启用" : "已停用", on];
		}

		function buildCards() {
			if (!ui) return;
			var box = ui.market.querySelector('[data-act="cards"]');
			box.innerHTML = CARDS.map(function (c) {
				var s = cardStatus(c);
				return '<article class="preview-extension appearance-extension ' + c.ext + '" data-card="' + c.id + '">'
					+ '<span class="preview-extension-icon" aria-hidden="true">' + CARD_ICONS[c.icon] + '</span>'
					+ '<div class="preview-extension-copy"><div class="preview-extension-title-row">'
					+ '<h4>' + c.title + '</h4>'
					+ '<span class="preview-extension-status" data-st="' + c.id + '"' + (s[1] ? ' data-enabled="true"' : '') + '>' + s[0] + '</span>'
					+ '</div></div>'
					+ '<div class="preview-extension-actions">'
					+ '<button type="button" class="preview-extension-action" data-enable="' + c.id + '" data-enabled="' + s[1] + '" aria-pressed="' + s[1] + '">'
					+ (s[1] ? "停用" : "启用") + '</button>'
					+ '<button type="button" class="particle-settings-trigger" data-gear="' + c.id + '" title="Configure ' + c.title + '"'
					+ ' aria-haspopup="dialog" aria-expanded="' + (settingsOpen && settingsId === c.id) + '">' + SLIDERS_SVG + '</button>'
					+ '</div></article>';
			}).join("");
		}

		function setCardEnabled(id) {
			var c = null;
			for (var i = 0; i < CARDS.length; i++) if (CARDS[i].id === id) c = CARDS[i];
			if (!c || !state) return;
			// 上游交互语义：启用其它外观时，当前打开的设置面板自动关闭（closeOtherSettings）
			if (settingsOpen && settingsId && settingsId !== id) closeSettings();
			if (c.kind === "scene") {
				if (cardOn(c)) {
					state.enabled = false; // 停用当前场景（保留选择，便于再次启用）
				} else {
					state.scene = id;
					state.mode = "scene";
					state.enabled = true;
				}
			} else if (c.kind === "wallpaper") {
				if (cardOn(c)) {
					state.enabled = false;
				} else {
					state.mode = "wallpaper";
					state.enabled = true;
					if (!state.wallpaperId && wallpapersCache.length) state.wallpaperId = wallpapersCache[0].id;
				}
			} else {
				state.surfaces.enabled = !state.surfaces.enabled;
			}
			scheduleSave();
			applyAll();
		}

		function bindMarket(market) {
			market.addEventListener("click", function (e) {
				var t = e.target;
				if (t.closest('[data-act="marketclose"]')) { closeMarket(); return; }
				var en = t.closest("[data-enable]");
				if (en) { setCardEnabled(en.getAttribute("data-enable")); return; }
				var gear = t.closest("[data-gear]");
				if (gear) {
					var gid = gear.getAttribute("data-gear");
					if (settingsOpen && settingsId === gid) closeSettings();
					else openSettings(gid);
					return;
				}
			});
		}

		// ───────────── 设置面板内容 ─────────────

		function escHtml(s) {
			return String(s).replace(/[&<>"]/g, function (ch) {
				return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
			});
		}

		function rangeRow(f, value) {
			var title = f.hintZh || f.hint ? ' title="' + escHtml(f.hintZh || f.hint) + '"' : "";
			return '<div class="particle-control-row"' + title + '>'
				+ '<label for="ccx-f-' + f.key + '">' + escHtml(f.zh) + '</label>'
				+ '<input id="ccx-f-' + f.key + '" type="range" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" value="' + value + '" data-field="' + f.key + '" aria-label="' + escHtml(f.zh) + '">'
				+ '<span class="particle-control-value"><output data-fieldval="' + f.key + '">' + fmtFieldVal(f, value) + '</output></span>'
				+ '</div>';
		}

		function toggleRow(key, zh, checked) {
			return '<label class="particle-toggle-row">' + escHtml(zh)
				+ '<input type="checkbox" data-toggle="' + key + '"' + (checked ? " checked" : "") + '></label>';
		}

		function colorRow(key, zh, value) {
			return '<label class="particle-color-row">' + escHtml(zh)
				+ '<input type="color" value="' + escHtml(value) + '" data-colorkey="' + key + '" aria-label="' + escHtml(zh) + '"></label>';
		}

		function groupStart(legend) {
			return '<fieldset class="particle-settings-group"><legend>' + escHtml(legend) + '</legend>';
		}

		// 底部动作区（原版：重置 / 重播；black-hole 无动作区、particle 重播开场在开场组内；
		// pixel-sculpt 的重置在专属分支里，动作对象是渲染器实例而非 draft）
		function sceneActionsHtml(sceneId) {
			if (sceneId === "black-hole" || sceneId === "particle-image" || sceneId === "pixel-sculpt") return "";
			return '<div class="glow-horizon-actions">'
				+ '<button type="button" data-act="draftreset">重置</button>'
				+ '<button type="button" data-act="replay">重播</button>'
				+ '</div>';
		}

		// 分组：grouped schema 走 group 字段（含 overrides），元组 schema 主组 + intro* → 开场画面
		// cloud-train 例外（活体普查：全部滑杆（含 intro*）同属「列车与云海」单组）
		function sectionsFor(sceneId) {
			var sch = schemaOf(sceneId);
			var fields = sch && sch.fields ? sch.fields : [];
			var out = [];
			if (!fields.length) return out;
			if (fields[0].group) {
				var byGroup = {}, order = [];
				for (var i = 0; i < fields.length; i++) {
					var g = fields[i].group;
					if (!byGroup[g]) { byGroup[g] = []; order.push(g); }
					byGroup[g].push(fields[i]);
				}
				for (var k = 0; k < order.length; k++) {
					var leg = (FIELD_GROUP_OVERRIDES[sceneId] && FIELD_GROUP_OVERRIDES[sceneId][order[k]]) || GROUP_LEGENDS[order[k]] || order[k];
					out.push({ group: order[k], legend: leg, fields: byGroup[order[k]] });
				}
				return out;
			}
			var main = [], intro = [];
			for (var n = 0; n < fields.length; n++) {
				(/^intro/.test(fields[n].key) && sceneId !== "cloud-train" ? intro : main).push(fields[n]);
			}
			if (main.length) out.push({ legend: TUPLE_MAIN_LEGENDS[sceneId] || "参数", fields: main });
			if (intro.length) out.push({ legend: "开场画面", fields: intro });
			return out;
		}

		function galleryHtml(sceneId) {
			var reg = window[GALLERIES_SYM];
			var gal = reg && reg.get ? reg.get(sceneId) : null;
			var count = gal && gal.count ? gal.count : 0;
			var items = "";
			if (gal && gal.images) {
				gal.images.forEach(function (img) {
					var thumb = img.thumbnail
						? '<img loading="lazy" src="data:' + (img.type || "image/png") + ';base64,' + img.thumbnail + '" alt="">'
						: '<span class="vthumb">🖼</span>';
					items += '<span class="wallitem"><span class="wpick">' + thumb + '<span class="wname">' + escHtml(img.name || img.id) + '</span></span></span>';
				});
			}
			return '<details class="particle-source-details" open><summary class="particle-source-summary">图片库'
				+ '<span class="particle-source-count">' + count + ' 个已保存</span></summary>'
				+ '<div class="particle-library-grid">' + (items || '<p class="particle-library-empty">图库尚未就绪，启用场景后自动载入默认图。</p>') + '</div>'
				+ '</details>';
		}

		// 场景设置主体（draft 驱动；控件变更实时生效——结构逐项对照活体普查 docs/codex-ui/panel-inventory.json）
		function sceneSettingsHtml(sceneId) {
			var sch = schemaOf(sceneId);
			var d = draft || {};
			var html = '<div class="particle-settings-scroll">';
			var inlineToggles = {};
			if (sceneId === "pixel-sculpt") {
				// 上游面板结构（plugin-templates #cle-pixelSculpt-settings）：未启用提示 +
				// 渲染器自挂载控件（参数/图库/相机三段）+ 暂停动画 + 重置参数。
				// schema 全空、不依赖字段清单，放在 schema 检查之前避免误报「尚未加载」
				html += '<p class="pixelSculpt-disabled" data-psnote' + (psActive() ? " hidden" : "") + '>插件尚未启用；这里的设置会在下次启用时生效。</p>';
				html += '<div class="pixelSculpt-controls-host" data-pshost></div>';
				html += '<label class="particle-toggle-row pixelSculpt-paused-row">暂停动画'
					+ '<input type="checkbox" data-toggle="__pspaused"' + (psPaused() ? " checked" : "") + (psActive() ? "" : " disabled") + '></label>';
				html += '<div class="glow-horizon-actions single pixelSculpt-actions"><button type="button" data-act="psreset"'
					+ (psEd && psEd.inst ? "" : " disabled") + '>重置参数</button></div>';
				html += '<p class="particle-plugin-error" role="status" hidden></p>';
				return html + '</div>';
			}
			if (!sch) return '<div class="particle-settings-scroll"><p class="panel-note">场景 schema 尚未加载…</p></div>';
			if (sceneId === "blinking-squares") {
				html += groupStart("渐隐方向");
				html += '<div class="heavenly-cloud-quality-toolbar dir4" role="group" aria-label="渐隐方向">';
				for (var li = 0; li < BLINK_DIRECTIONS.length; li++) {
					var bd = BLINK_DIRECTIONS[li];
					html += '<button type="button" data-blinkdir="' + bd[0] + '" aria-pressed="' + ((d.direction || "right") === bd[0]) + '">' + bd[1] + '</button>';
				}
				html += '</div></fieldset>';
				// 原版五段结构：方块与闪烁 / 交互与脉冲 / 开场与画质 / 颜色（活体普查 27 行）
				var bl = sch.fields;
				html += groupStart("方块与闪烁");
				for (var b1 = 0; b1 < 10; b1++) html += rangeRow(bl[b1], num(d[bl[b1].key], bl[b1].min));
				html += '</fieldset>';
				html += groupStart("交互与脉冲");
				for (var b2 = 10; b2 < 20; b2++) html += rangeRow(bl[b2], num(d[bl[b2].key], bl[b2].min));
				html += toggleRow("mouseInteraction", "鼠标交互", !!d.mouseInteraction);
				html += toggleRow("keyboardInteraction", "键盘随机波纹", !!d.keyboardInteraction);
				for (var b3 = 20; b3 < 22; b3++) html += rangeRow(bl[b3], num(d[bl[b3].key], bl[b3].min));
				html += '</fieldset>';
				html += groupStart("开场与画质");
				for (var b4 = 22; b4 < bl.length; b4++) html += rangeRow(bl[b4], num(d[bl[b4].key], bl[b4].min));
				html += toggleRow("introEnabled", "启用开场", !!d.introEnabled);
				html += toggleRow("paused", "暂停动画", !!d.paused);
				html += '</fieldset>';
				html += groupStart("颜色");
				var blc = sch.colorFields || [];
				for (var b5 = 0; b5 < blc.length; b5++) html += colorRow(blc[b5].key, blc[b5].zh, d[blc[b5].key] || sch.defaults[blc[b5].key] || "#ffffff");
				html += '</fieldset>';
				html += sceneActionsHtml(sceneId);
				html += '<p class="particle-plugin-error" role="status" hidden></p>';
				return html + '</div>';
			}
			if (sceneId === "black-hole") {
				html += '<div class="black-hole-preset-toolbar" role="group" aria-label="黑洞场景预设">';
				for (var bi = 0; bi < BH_PRESETS.length; bi++) {
					var bp = BH_PRESETS[bi];
					html += '<button type="button" data-bhpreset="' + bp[0] + '">' + bp[1] + '</button>';
				}
				html += '<button type="button" class="black-hole-reset" data-act="draftreset">重置</button></div>';
			}
			if (sceneId === "glow-horizon") {
				html += '<div class="glow-horizon-direction-toolbar" role="group" aria-label="地平线方向">';
				var dirMeta = [["top", "↑", "上"], ["bottom", "↓", "下"], ["left", "←", "左"], ["right", "→", "右"]];
				for (var di = 0; di < dirMeta.length; di++) {
					var dm = dirMeta[di];
					html += '<button type="button" data-direction="' + dm[0] + '" aria-pressed="' + (d.variant === dm[0]) + '">'
						+ '<span class="glow-horizon-direction-symbol">' + dm[1] + '</span>' + dm[2] + '</button>';
				}
				html += '</div>';
			}
			// 渲染质量组：milky-way/heavenly-cloud/aurora 在最前（活体顺序），mountain 在主组之后
			var qt = QUALITY_TOOLBARS[sceneId];
			function qualityGroupHtml() {
				var out = groupStart("渲染质量");
				out += '<div class="heavenly-cloud-quality-toolbar" role="group" aria-label="渲染质量">';
				for (var qi = 0; qi < qt.items.length; qi++) {
					var it = qt.items[qi];
					var cur = qt.mode === "steps" ? String(num(d.steps, 57)) : (d.quality || sch.qualityDefault || "high");
					out += '<button type="button" data-' + qt.mode + '="' + it[0] + '" aria-pressed="' + (cur === it[0]) + '">'
						+ '<strong>' + it[1] + '</strong>' + it[2] + '</button>';
				}
				out += '</div>';
				if (qt.mode === "steps") { // mountain：渲染比例滑杆同属渲染质量组（活体普查）
					for (var rf = 0; rf < sch.fields.length; rf++) {
						if (sch.fields[rf].key === "resolution") out += rangeRow(sch.fields[rf], num(d.resolution, sch.fields[rf].min));
					}
				}
				return out + '</fieldset>';
			}
			if (qt && sceneId !== "mountain") html += qualityGroupHtml();
			// 分组滑杆
			var sections = sectionsFor(sceneId);
			if (sceneId === "mountain" && sections.length) {
				sections[0].fields = sections[0].fields.filter(function (f) { return f.key !== "resolution"; });
			}
			for (var si = 0; si < sections.length; si++) {
				var sec = sections[si];
				html += groupStart(sec.legend);
				for (var fi = 0; fi < sec.fields.length; fi++) html += rangeRow(sec.fields[fi], num(d[sec.fields[fi].key], sec.fields[fi].min));
				if (sceneId === "black-hole" && sec.group === "light") {
					var cfs = sch.colorFields || [];
					for (var ci = 0; ci < cfs.length; ci++) html += colorRow(cfs[ci].key, cfs[ci].zh, d[cfs[ci].key] || sch.defaults[cfs[ci].key] || "#ffffff");
				}
				if (sceneId === "black-hole" && sec.group === "renderer") {
					html += toggleRow("paused", "暂停动画", !!d.paused);
					inlineToggles.paused = true;
				}
				if (sceneId === "glow-horizon" && sec.group === "input") {
					html += toggleRow("inertialWheel", "滚轮惯性", !!d.inertialWheel);
					inlineToggles.inertialWheel = true;
				}
				if (sceneId === "particle-image" && sec.group === "source") {
					html += galleryHtml(sceneId);
					html += colorRow("backgroundColor", "背景", d.backgroundColor || "#000000");
					html += toggleRow("autoSwitch", "自动切换", d.autoSwitch !== false);
					inlineToggles.autoSwitch = true;
				}
				if (sceneId === "particle-image" && sec.group === "opening") {
					html += toggleRow("introEnabled", "粒子汇聚", !!d.introEnabled);
					inlineToggles.introEnabled = true;
					html += '<button type="button" class="particle-library-add" data-act="replay" style="margin:2px 8px 0;justify-self:start"'
						+ (bgInstance && bgSceneId === sceneId ? "" : " disabled") + '>重播开场</button>';
				}
				if (sceneId === "particle-image" && sec.group === "pointer") {
					html += toggleRow("cursorInteraction", "鼠标交互", !!d.cursorInteraction);
					inlineToggles.cursorInteraction = true;
				}
				if (sceneId === "cloud-train") { // 活体普查：三染色行同属列车与云海组
					var tints = sch.colorFields || [];
					for (var ki = 0; ki < tints.length; ki++) {
						html += colorRow(tints[ki].key, TINT_LABELS[tints[ki].key] || tints[ki].zh, d[tints[ki].key] || "#ffffff");
					}
				}
				html += '</fieldset>';
			}
			if (qt && sceneId === "mountain") html += qualityGroupHtml();
			// 场景级开关（paused 在前；已内联的跳过）
			var tgs = (sch.toggles || []).slice().sort(function (a, b) { return (a.key === "paused" ? -1 : 0) - (b.key === "paused" ? -1 : 0); });
			for (var ti = 0; ti < tgs.length; ti++) {
				if (inlineToggles[tgs[ti].key]) continue;
				if (sceneId === "particle-image" && tgs[ti].key === "showSourceImage") {
					html += toggleRow("showSourceImage", "显示源图", d.showSourceImage !== false);
					continue;
				}
				html += toggleRow(tgs[ti].key, tgs[ti].zh, !!d[tgs[ti].key]);
			}
			// 色板段（milky-way 五色调色板）
			if (sch.colors) {
				html += groupStart(COLOR_SECTION_LEGENDS[sceneId] || "颜色");
				var cols = Array.isArray(d.colors) && d.colors.length === sch.colors.length ? d.colors : sch.colors;
				for (var pi = 0; pi < sch.colors.length; pi++) html += colorRow("color" + pi, "颜色 " + (pi + 1), cols[pi]);
				html += '</fieldset>';
			}
			html += sceneActionsHtml(sceneId);
			html += '<p class="particle-plugin-error" role="status" hidden></p>';
			return html + '</div>';
		}

		function customSettingsHtml() {
			var pages = Math.max(1, Math.ceil(wallpapersCache.length / LIB_PAGE_SIZE));
			if (libPage >= pages) libPage = pages - 1;
			var slice = wallpapersCache.slice(libPage * LIB_PAGE_SIZE, libPage * LIB_PAGE_SIZE + LIB_PAGE_SIZE);
			var items = slice.map(function (w) {
				var isVideo = /^video\//.test(w.mime || "");
				var thumb = isVideo
					? '<span class="vthumb">▶</span>'
					: '<img loading="lazy" src="' + w.url + '" alt="">';
				return '<span class="wallitem' + (w.id === state.wallpaperId ? " on" : "") + '">'
					+ '<button type="button" class="wpick" data-wall="' + w.id + '" title="' + escHtml(w.name) + '">' + thumb
					+ '<span class="wname">' + escHtml(w.name) + '</span></button>'
					+ '<button type="button" class="wdel" data-wdel="' + w.id + '" title="删除" aria-label="删除 ' + escHtml(w.name) + '">✕</button></span>';
			}).join("");
			var html = '<div class="particle-settings-scroll">';
			html += '<details class="particle-source-details" open><summary class="particle-source-summary">图片库'
				+ '<span class="particle-source-count">' + wallpapersCache.length + ' 个已保存</span></summary>'
				+ '<div class="particle-library-toolbar"><span class="particle-library-add" data-act="wallimport">添加图片'
				+ '<input type="file" data-act="wallfile" accept="image/*,video/mp4,video/webm" hidden></span>'
				+ '<button type="button" class="particle-library-clear" data-act="wallclear"' + (wallpapersCache.length ? "" : " disabled") + '>清空</button></div>'
				+ '<div class="particle-library-grid">' + (items || '<p class="particle-library-empty">还没有壁纸，点「添加图片」导入图片或视频。</p>') + '</div>'
				+ '</details>';
			html += groupStart("素材属性");
			html += '<div class="particle-control-row"><label for="ccx-fit">画面适配</label>'
				+ '<select id="ccx-fit" data-act="fit">'
				+ '<option value="cover"' + (state.wallpaperFit === "cover" ? " selected" : "") + '>铺满</option>'
				+ '<option value="contain"' + (state.wallpaperFit === "contain" ? " selected" : "") + '>完整显示</option>'
				+ '<option value="tile"' + (state.wallpaperFit === "tile" ? " selected" : "") + '>平铺</option></select>'
				+ '<span class="particle-control-value"></span></div>';
			html += '<div class="particle-control-row"><label for="ccx-pos">位置</label>'
				+ '<select id="ccx-pos" data-act="pos">'
				+ ["center|居中", "top|顶部", "bottom|底部", "left|左侧", "right|右侧"].map(function (o) {
					var kv = o.split("|");
					return '<option value="' + kv[0] + '"' + (state.wallpaperPosition === kv[0] ? " selected" : "") + '>' + kv[1] + '</option>';
				}).join("")
				+ '</select><span class="particle-control-value"></span></div>';
			html += '</fieldset>';
			html += '<div class="glow-horizon-actions single"><button type="button" data-act="customreset">重置参数</button></div>';
			html += '<p class="particle-plugin-error" role="status" hidden></p>';
			return html + '</div>';
		}

		function surfaceSettingsHtml() {
			var html = '<div class="particle-settings-scroll">';
			html += '<p class="panel-note">只调节底色，文字和图标保持清晰。0% 完全透明，100% 完全遮挡背景。</p>';
			html += groupStart("分区不透明度");
			for (var i = 0; i < REGION_ROWS.length; i++) {
				var r = REGION_ROWS[i];
				var v = clamp(num(state.surfaces && state.surfaces[r.key], 66), 0, 100);
				html += '<div class="particle-control-row surface-opacity-row"><label for="ccx-r-' + r.key + '">' + escHtml(r.zh) + '</label>'
					+ '<input id="ccx-r-' + r.key + '" type="range" min="0" max="100" step="1" value="' + v + '" data-region="' + r.key + '" aria-label="' + escHtml(r.zh) + '">'
					+ '<span class="particle-control-value"><output data-regionval="' + r.key + '">' + Math.round(v) + '%</output></span>'
					+ '<button type="button" data-rowreset="' + r.key + '" title="恢复此项默认值" aria-label="恢复' + escHtml(r.zh) + '默认值">↺</button></div>';
			}
			html += '</fieldset>';
			html += groupStart("背景调节");
			for (var p = 0; p < PARAM_ROWS.length; p++) {
				var row = PARAM_ROWS[p];
				var vv = Number(state[row.key]) * row.scale;
				html += '<div class="particle-control-row"><label for="ccx-p-' + row.key + '">' + row.zh + '</label>'
					+ '<input id="ccx-p-' + row.key + '" type="range" min="' + row.min + '" max="' + row.max + '" step="' + row.step + '" value="' + vv + '" data-slider="' + row.key + '" aria-label="' + row.zh + '">'
					+ '<span class="particle-control-value"><output data-sliderval="' + row.key + '">'
					+ (row.scale === 100 ? Math.round(vv) + "%" : vv.toFixed(1) + "px") + '</output></span></div>';
			}
			html += '</fieldset>';
			html += '<button type="button" class="particle-library-clear" data-act="surfacereset" style="justify-self:stretch;margin:0">恢复全部默认值</button>';
			html += '<p class="particle-plugin-error" role="status" hidden></p>';
			return html + '</div>';
		}

		// ───────────── 草稿工具（应用制提交的真值口径，v0.6 起未变） ─────────────

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
			// 键控颜色行 + 布尔开关（原版面板同构字段）
			var cfs = sch.colorFields || [];
			for (var c = 0; c < cfs.length; c++) {
				var cv = out[cfs[c].key];
				out[cfs[c].key] = typeof cv === "string" && /^#[\da-fA-F]{6}$/.test(cv) ? cv : sch.defaults[cfs[c].key];
			}
			var tgs = sch.toggles || [];
			for (var t = 0; t < tgs.length; t++) out[tgs[t].key] = !!out[tgs[t].key];
			return out;
		}

		function ensureDrawerDraft(sceneId) {
			var sch = schemaOf(sceneId);
			var base = sch && sch.defaults ? Object.assign({}, sch.defaults) : {};
			var saved = state && state.sceneParams && state.sceneParams[sceneId];
			if (saved && typeof saved === "object") {
				for (var k in saved) if (Object.prototype.hasOwnProperty.call(saved, k)) base[k] = saved[k];
			}
			draft = sanitizeDraft(sceneId, base);
			draftScene = sceneId;
		}

		function fmtFieldVal(f, value) {
			if (f.percent) return Math.round(value * 100) + "%";
			var dec = f.precision != null ? f.precision : (String(f.step).indexOf(".") >= 0 ? (String(f.step).split(".")[1] || "").length : 0);
			return Number(value).toFixed(dec) + (f.unit || "");
		}

		// 草稿相对 schema 默认值的增量（apply 提交与"待应用"角标共用一个口径）
		function draftDeltaObj(sceneId) {
			var sch = schemaOf(sceneId);
			var base = sch && sch.defaults ? sch.defaults : {};
			var full = sanitizeDraft(sceneId, draft);
			var delta = {};
			for (var k in full) {
				if (!Object.prototype.hasOwnProperty.call(full, k)) continue;
				if (k === "quality" && !(k in base)) continue; // 无质量档的场景不落 quality 键
				if (JSON.stringify(full[k]) !== JSON.stringify(base[k])) delta[k] = full[k];
			}
			return { delta: delta, full: full, base: base };
		}

		function settingsTitle(id) {
			for (var i = 0; i < CARDS.length; i++) if (CARDS[i].id === id) return CARDS[i].title;
			return id;
		}

		function renderSettings(id) {
			if (!ui) return;
			var isScene = SCENE_IDS.indexOf(id) >= 0;
			var body;
			if (!isScene) body = id === "custom" ? customSettingsHtml() : surfaceSettingsHtml();
			else {
				if (!draftScene || draftScene !== id) ensureDrawerDraft(id);
				draftScene = id;
				body = sceneSettingsHtml(id);
			}
			ui.settings.innerHTML = '<header class="particle-settings-header"><div class="particle-settings-heading">'
				+ '<p>外观</p>'
				+ '<h3>' + escHtml(settingsTitle(id)) + '</h3></div>'
				+ '<div class="particle-settings-header-actions">'
				+ '<button class="particle-settings-close" type="button" data-act="settingsclose" title="关闭设置 (Esc)" aria-label="关闭设置">' + CLOSE_SVG + '</button>'
				+ '</div></header>' + body;
			positionSettings();
			if (id === "pixel-sculpt") mountPsControls();
		}

		function openSettings(id) {
			ensurePanel();
			settingsId = id;
			settingsOpen = true;
			ui.settings.hidden = false;
			renderSettings(id);
			buildCards();
			if (SCENE_IDS.indexOf(id) >= 0) {
				ensureSchemas().then(function () {
					if (settingsOpen && settingsId === id) renderSettings(id);
				});
				if (GALLERY_SCENES[id]) {
					ensureGallery(id).then(function () {
						var e0 = registry() && registry().get(id);
						return e0 && typeof e0.prepareDefaults === "function" ? e0.prepareDefaults() : null;
					}).then(function () {
						return ensureGallerySelection(id);
					}).then(function () {
						if (settingsOpen && settingsId === id) renderSettings(id);
					}).catch(function () {});
				}
			}
		}

		function closeSettings() {
			settingsOpen = false;
			settingsId = null;
			if (ui) ui.settings.hidden = true;
			buildCards();
		}

		// ───────────── 设置面板事件（委托；draft 应用制提交） ─────────────

		// ───────────── 实时提交（上游语义：控件变更 → 写 store + renderer.setSettings） ─────────────

		// 各 vendor 渲染器实例的实时设置方法名（startup 返回值即渲染器实例）
		function pushLiveSettings(inst, full) {
			if (!inst) return false;
			var fn = inst.setSettings || inst.updateSettings || inst.setRenderSettings;
			if (typeof fn !== "function") return false;
			try { fn.call(inst, full); return true; } catch (e) { return false; }
		}

		// 控件变更 → 全量设置写入场景 store（渲染器启动真值，与上游控制器同语义）+
		// 直推运行中的渲染器实例（不重建、不重播开场）+ 稀疏增量落盘宿主
		function commitLive(sceneId) {
			if (!draftScene || !draft || draftScene !== sceneId) return;
			var dd = draftDeltaObj(sceneId);
			if (Object.keys(dd.delta).length) state.sceneParams[sceneId] = dd.delta;
			else delete state.sceneParams[sceneId]; // 全默认 = 不留增量键
			writeSceneSetting(sceneId, dd.full);
			scheduleSave();
			// particle「背景」颜色控件：渲染器不消费，直接改层底色（上游控制器同款语义）
			if (sceneId === "particle-image" && layer) {
				layer.style.setProperty("--ap-layer-bg", sceneLayerBg(sceneId));
			}
			var pushed = false;
			if (state.enabled && state.mode === "scene" && state.scene === sceneId && bgInstance && bgSceneId === sceneId) {
				pushed = pushLiveSettings(bgInstance, dd.full);
			}
			if (!pushed && state.enabled && state.mode === "scene" && state.scene === sceneId) {
				renderScene(); // 实例不在（加载失败/竞态）→ 一次性重建兜底
			}
		}

		function resetDraft() {
			if (!draftScene) return;
			var sch = schemaOf(draftScene);
			draft = sch && sch.defaults ? sanitizeDraft(draftScene, sch.defaults) : {};
			renderSettings(draftScene);
			commitLive(draftScene); // 原版 reset = updateSettings(DEFAULTS)，即时生效
		}

		function replayScene(sceneId) {
			var inst = bgInstance && bgSceneId === sceneId ? bgInstance : null;
			if (!inst) return;
			if (typeof inst.replayOpening === "function") { try { inst.replayOpening(); } catch (e) {} return; }
			if (typeof inst.replay === "function") { try { inst.replay(); } catch (e) {} }
		}

		function bindSettings(panel) {
			panel.addEventListener("click", function (e) {
				var t = e.target;
				if (t.closest('[data-act="settingsclose"]')) { closeSettings(); return; }
				if (t.closest('[data-act="psreset"]')) {
					// pixel-sculpt 重置对象是渲染器实例（runtime 全量默认），宿主侧只清 paused 增量
					if (psEd && psEd.inst) {
						try { psEd.inst.reset(); } catch (e2) {}
						if (state.sceneParams) delete state.sceneParams["pixel-sculpt"];
						writeSceneSetting("pixel-sculpt", { paused: false });
						scheduleSave();
						syncPsPanel();
						setStatus("Pixel Sculpt 参数已重置");
					}
					return;
				}
				if (t.closest('[data-act="draftreset"]')) { resetDraft(); return; }
				if (t.closest('[data-act="replay"]')) { replayScene(draftScene); return; }
				if (t.closest('[data-act="surfacereset"]')) {
					state.surfaces = Object.assign({}, DEFAULTS.surfaces);
					state.dim = DEFAULTS.dim;
					state.blur = DEFAULTS.blur;
					scheduleSave();
					applyAll();
					renderSettings("surface");
					return;
				}
				if (t.closest('[data-act="customreset"]')) {
					state.wallpaperFit = DEFAULTS.wallpaperFit;
					state.wallpaperPosition = DEFAULTS.wallpaperPosition;
					scheduleSave();
					applyAll();
					renderSettings("custom");
					return;
				}
				var rr = t.closest("[data-rowreset]");
				if (rr) {
					var rk = rr.getAttribute("data-rowreset");
					var dflt = clamp(num(DEFAULTS.surfaces && DEFAULTS.surfaces[rk], 66), 0, 100);
					state.surfaces[rk] = dflt;
					var rin = panel.querySelector('[data-region="' + rk + '"]');
					if (rin) rin.value = String(dflt);
					var rout = panel.querySelector('[data-regionval="' + rk + '"]');
					if (rout) rout.textContent = Math.round(dflt) + "%";
					applySurfaceVars();
					scheduleSave();
					return;
				}
				var qb = t.closest("[data-quality]");
				if (qb && draft) { draft.quality = qb.getAttribute("data-quality"); renderSettings(draftScene); commitLive(draftScene); return; }
				var sb = t.closest("[data-steps]");
				if (sb && draft) { draft.steps = Number(sb.getAttribute("data-steps")); renderSettings(draftScene); commitLive(draftScene); return; }
				var db = t.closest("[data-direction]");
				if (db && draft) { draft.variant = db.getAttribute("data-direction"); renderSettings(draftScene); commitLive(draftScene); return; }
				var bb = t.closest("[data-blinkdir]");
				if (bb && draft) { draft.direction = bb.getAttribute("data-blinkdir"); renderSettings(draftScene); commitLive(draftScene); return; }
				var pb = t.closest("[data-bhpreset]");
				if (pb && draft) {
					var presets = schemaOf(draftScene) && schemaOf(draftScene).presets || {};
					var p = presets[pb.getAttribute("data-bhpreset")];
					if (p) draft = sanitizeDraft(draftScene, Object.assign({}, schemaOf(draftScene).defaults, p));
					renderSettings(draftScene);
					commitLive(draftScene);
					return;
				}
				var pick = t.closest("[data-wall]");
				if (pick) {
					state.wallpaperId = pick.getAttribute("data-wall");
					state.mode = "wallpaper";
					state.enabled = true;
					scheduleSave();
					applyAll();
					renderSettings("custom");
					return;
				}
				var del = t.closest("[data-wdel]");
				if (del) {
					var wid = del.getAttribute("data-wdel");
					apiPostJson("/wallpaper-delete.json", { id: wid }).then(function (r) {
						if (r && r.wallpapers) wallpapersCache = r.wallpapers;
						if (state.wallpaperId === wid) {
							state.wallpaperId = wallpapersCache.length ? wallpapersCache[0].id : null;
							scheduleSave();
						}
						applyAll();
						renderSettings("custom");
					}).catch(function () {});
					return;
				}
				if (t.closest('[data-act="wallimport"]')) {
					var fi = panel.querySelector('[data-act="wallfile"]');
					if (fi) fi.click();
					return;
				}
				if (t.closest('[data-act="wallclear"]')) {
					if (!wallpapersCache.length) return;
					if (!window.confirm("清空素材库中的全部壁纸/视频？")) return;
					var ids = wallpapersCache.map(function (w) { return w.id; });
					var next = function (i) {
						if (i >= ids.length) {
							wallpapersCache = [];
							state.wallpaperId = null;
							libPage = 0;
							scheduleSave();
							applyAll();
							renderSettings("custom");
							return;
						}
						apiPostJson("/wallpaper-delete.json", { id: ids[i] }).then(function () { next(i + 1); }).catch(function () { next(i + 1); });
					};
					next(0);
					return;
				}
			});
			panel.addEventListener("input", function (e) {
				var t = e.target;
				if (t.hasAttribute && t.hasAttribute("data-field") && draft) {
					var key = t.getAttribute("data-field");
					draft[key] = Number(t.value);
					var sch = schemaOf(draftScene);
					var f = null;
					if (sch) for (var i = 0; i < sch.fields.length; i++) if (sch.fields[i].key === key) f = sch.fields[i];
					var out = panel.querySelector('[data-fieldval="' + key + '"]');
					if (out) out.textContent = f ? fmtFieldVal(f, Number(t.value)) : t.value;
					commitLive(draftScene);
					return;
				}
				if (t.hasAttribute && t.hasAttribute("data-region")) {
					var rk = t.getAttribute("data-region");
					state.surfaces[rk] = Number(t.value);
					var ro = panel.querySelector('[data-regionval="' + rk + '"]');
					if (ro) ro.textContent = Math.round(t.value) + "%";
					applySurfaceVars();
					scheduleSave();
					return;
				}
				if (t.hasAttribute && t.hasAttribute("data-slider")) {
					var sk = t.getAttribute("data-slider");
					var row = null;
					for (var j = 0; j < PARAM_ROWS.length; j++) if (PARAM_ROWS[j].key === sk) row = PARAM_ROWS[j];
					if (!row) return;
					state[sk] = Number(t.value) / row.scale;
					var so = panel.querySelector('[data-sliderval="' + sk + '"]');
					if (so) so.textContent = row.scale === 100 ? Math.round(t.value) + "%" : Number(t.value).toFixed(1) + "px";
					scheduleSave();
					applyAll();
					return;
				}
				if (t.hasAttribute && t.hasAttribute("data-colorkey") && draft) {
					var ck = t.getAttribute("data-colorkey");
					if (/^color\d+$/.test(ck)) {
						if (!Array.isArray(draft.colors)) draft.colors = (schemaOf(draftScene) && schemaOf(draftScene).colors || []).slice();
						draft.colors[Number(ck.slice(5))] = t.value;
					} else {
						draft[ck] = t.value;
					}
					commitLive(draftScene);
					return;
				}
			});
			panel.addEventListener("change", function (e) {
				var t = e.target;
				if (t.getAttribute && t.getAttribute("data-toggle") === "__pspaused") {
					// pixel-sculpt 暂停开关：不走 draft（schema 全空），直写增量 + 实例推送
					var on2 = !!t.checked;
					if (!state.sceneParams) state.sceneParams = {};
					if (on2) state.sceneParams["pixel-sculpt"] = { paused: true };
					else delete state.sceneParams["pixel-sculpt"];
					writeSceneSetting("pixel-sculpt", { paused: on2 });
					scheduleSave();
					if (psEd && psEd.inst) { try { psEd.inst.setSettings({ paused: on2 }); } catch (e2) {} }
					return;
				}
				if (t.hasAttribute && t.hasAttribute("data-toggle") && draft) {
					draft[t.getAttribute("data-toggle")] = !!t.checked;
					commitLive(draftScene);
					return;
				}
				if (t.getAttribute && t.getAttribute("data-act") === "fit") {
					state.wallpaperFit = t.value; scheduleSave(); applyAll(); return;
				}
				if (t.getAttribute && t.getAttribute("data-act") === "pos") {
					state.wallpaperPosition = t.value; scheduleSave(); applyAll(); return;
				}
				if (t.getAttribute && t.getAttribute("data-act") === "wallfile" && t.files && t.files[0]) {
					var f = t.files[0];
					t.value = "";
					if (f.size > 200 * 1024 * 1024) { setStatus("文件超过 200MB 上限", true); return; }
					f.arrayBuffer().then(function (buf) {
						return fetch(API_BASE + "/wallpaper-upload?name=" + encodeURIComponent(f.name), {
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
							applyAll();
							renderSettings("custom");
						} else {
							setStatus("导入失败：" + ((r && r.error) || "?"), true);
						}
					}).catch(function (err) { setStatus("导入失败：" + err, true); });
				}
			});
		}

		// ───────────── 面板刷新（外部状态变化 / 保存回包后） ─────────────

		function refreshPanel() {
			if (!ui || !state) return;
			buildCards();
			// 启用/停用翻转时（含跨窗口轮询），pixel-sculpt 面板的提示与开关可用性要跟着变
			if (settingsOpen && settingsId === "pixel-sculpt") syncPsPanel();
		}

		function setStatus(text, isError) {
			if (text) console.info("[dsh-ccx]", text);
			if (isError && ui && settingsOpen && ui.settings) {
				var err = ui.settings.querySelector(".particle-plugin-error");
				if (err) { err.hidden = false; err.textContent = text; }
			}
		}

		// ─────────────────────── 状态保存 / 轮询 ───────────────────────

		var saveSeq = 0; // 保存代数：连续快速保存时丢弃过期回包（乱序响应会把旧 sceneParams 重新灌回 state）

		function scheduleSave() {
			setStatus("保存中…");
			if (saveTimer) clearTimeout(saveTimer);
			saveTimer = setTimeout(function () {
				saveTimer = null;
				var mySeq = ++saveSeq;
				var payload = Object.assign({}, state);
				// 保存必须打 /state-save.json：宿主路由表不区分 method，
				// POST 到 /state.json 会命中 GET 处理器拿旧状态并静默回滚（v0.1.x "设置调不了"的根因）
				apiPostJson("/state-save.json", { settings: payload }).then(function (r) {
					if (mySeq !== saveSeq) return; // 已有更新的保存，本回包按过期丢弃
					if (r && r.ok && r.settings) {
						var local = state;
						state = sanitizeState(r.settings);
						savedAtLocal = state.savedAt || 0;
						refreshPanel();
						if (JSON.stringify(pickVisual(local)) !== JSON.stringify(pickVisual(state))) applyAll();
					}
					setStatus("已保存");
				}).catch(function () { if (mySeq === saveSeq) setStatus("保存失败"); });
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
			delete out.quality; // v4 遗留死字段，逐场景质量在 sceneParams/store
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
			// v5→v6：输入区默认 58（v5 默认值）升 86（原版面板 composer 档）；与 bundle 侧迁移同口径
			if (num(out.version, 0) < 6 && sOut.composer === 58) sOut.composer = 86;
			out.surfaces = sOut;
			out.version = 6;
			return out;
		}

		// ─────────────────────── 总装 ───────────────────────

		function applyAll() {
			if (!state) return;
			ensurePanel();
			var bgOn = state.enabled && state.mode !== "off";
			layer.style.display = bgOn ? "" : "none";
			if (bgOn && state.mode === "scene") {
				if (renderSig() !== lastRenderSig) {
					renderScene();
				} else if (paramsSig() !== lastParamsSig) {
					// 跨窗口参数同步：直推运行中的渲染器，推不动再重建
					lastParamsSig = paramsSig();
					var fullSettings = buildStoreSettings(state.scene);
					writeSceneSetting(state.scene, fullSettings);
					if (!(bgInstance && bgSceneId === state.scene && pushLiveSettings(bgInstance, fullSettings))) renderScene();
				}
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
			dimEl.style.setProperty("--ap-dim-bg", dimEl.style.background); // 同值经变量下发，避开通配透明
			// UI 表面（通配透明 + 分区蒙版）
			applySurfaceStyles();
			refreshPanel();
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
				if (settingsOpen) positionSettings();
			}, 120);
		}

		var started = false;

		// 一次性迁移：v0.5 曾把（部分错误的）全量默认值预写进场景 store 并持久化。
		// 清掉 8 个参数场景的键，渲染器回到内嵌默认；画廊两场景的键（选择集）不动。
		var STORE_MIGRATION_KEY = "dsh-ap:scene-stores-v2";
		function migratePoisonedStores() {
			try {
				if (localStorage.getItem(STORE_MIGRATION_KEY)) return;
				for (var id in STORE_KEYS) {
					if (GALLERY_SCENES[id]) continue;
					try { localStorage.removeItem(STORE_KEYS[id]); } catch (e) {}
				}
				localStorage.setItem(STORE_MIGRATION_KEY, "1");
			} catch (e) {}
		}

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

			migratePoisonedStores();
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
			if (layer && layer.parentNode) { try { layer.parentNode.removeChild(layer); } catch (e) {} }
			layer = null;
			if (root9 && root9.parentNode) { try { root9.parentNode.removeChild(root9); } catch (e) {} }
			root9 = null;
			ui = null;
			marketOpen = false;
			settingsOpen = false;
			settingsId = null;
		}

		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	},
});
