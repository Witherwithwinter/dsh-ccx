// 生成每场景设置 schema v2：数值表/默认值/预设全部从上游 TS 源码逐字提取，杜绝手抄错位。
// 真值来源（本仓库 tmp-code-codex 克隆，与已安装 0.5.7 同版本）：
//   core/configuration/explorer.ts        —— *_NUMERIC_CONTROL_DEFINITIONS（对象形，含 group/hint/precision）+ BLACK_HOLE 预设
//   startup-background-renderers.ts       —— DEFAULT_*_BACKGROUND_SETTINGS + milky-way 数值表 + mountain/blinking/cloud-train 元组形控制表
//   blinking-squares-settings.ts          —— BLINKING_SQUARES_DEFAULTS
//   particle-image-startup.ts             —— DEFAULT_PARTICLE_BACKGROUND_SETTINGS
// 颜色/开关字段的双语标签逐字取自 components/plugin-templates.ts（本生成器内为转录，见 LABELS 注释行号）。
// 运行: node tools/gen-scene-schemas.cjs   （覆盖 lib/vendor/code-codex/scene-{schemas,defaults}.json）
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const UI = 'tmp-code-codex/packages/explorer-ui/src';
const SOURCES = {
  // 顺序即执行顺序：explorer 的数值表引用 particleStartup 的常量，须后置
  particleStartup: path.join(ROOT, UI, 'particle-image-startup.ts'),
  blinking: path.join(ROOT, UI, 'blinking-squares-settings.ts'),
  renderers: path.join(ROOT, UI, 'startup-background-renderers.ts'),
  explorer: path.join(ROOT, UI, 'core/configuration/explorer.ts'),
};

// ─── TS 常量提取（字符串/注释感知的括号配平） ───

function skipString(src, i) {
  const quote = src[i];
  i++;
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === quote) return i + 1;
    i++;
  }
  return i;
}

// 提取 `export const NAME [:Type] = init;` 并清洗成可执行 JS
// （实现与 tools/tmp-debug-extract.cjs 的已验证算法一致：正则锚点 + 字符串/注释感知扫描）
function extractClean(src) {
  const out = {};
  const re = /(?:^|\n)export const ([A-Za-z0-9_]+)/g;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    // 找深度 0 的 '='（跳过 ": Type" 注解，字符串感知）
    let i = m.index + m[0].length, depth = 0, eq = -1;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === "'" || c === '"' || c === '`') { i = skipString(src, i) - 1; continue; }
      if (depth === 0 && c === '=') { eq = i; break; }
      if (c === '(' || c === '[' || c === '{' || c === '<') depth++;
      else if (c === ')' || c === ']' || c === '}' || c === '>') depth--;
      if (depth < 0) break;
    }
    if (eq < 0) continue;
    // initializer 结尾：任意深度命中的 'satisfies'（截断并补平收括号），否则扫到深度 0 的 ';'
    let d2 = 0, end = -1, satIdx = -1;
    const stack = [];
    for (let j = eq + 1; j < src.length; j++) {
      const c = src[j];
      if (c === "'" || c === '"' || c === '`') { j = skipString(src, j) - 1; continue; }
      if (c === '/' && src[j + 1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
      if (c === '/' && src[j + 1] === '*') { j = src.indexOf('*/', j) + 1; continue; }
      if (c === 's' && /^satisfies(?![\w$])/.test(src.slice(j, j + 30))) { satIdx = j; break; }
      if ('([{'.includes(c)) { d2++; stack.push(c); }
      else if (')]}'.includes(c)) { d2--; stack.pop(); }
      else if (c === ';' && d2 === 0) { end = j; break; }
    }
    if (satIdx >= 0) {
      const closers = stack.reverse().map((o) => ({ '(': ')', '[': ']', '{': '}' }[o])).join('');
      out[name] = src.slice(eq + 1, satIdx).trim() + closers;
    } else if (end >= 0) {
      out[name] = src.slice(eq + 1, end).trim();
    } else continue;
    if (out[name].endsWith(' as const')) out[name] = out[name].slice(0, -' as const'.length);
    // 泛型构造去型：new WeakMap<A, B>() → new WeakMap()
    out[name] = out[name].replace(/new (WeakMap|Map|Set|WeakSet)<[\s\S]*?>\(/g, 'new $1(');
    // 箭头函数参数去型：(value: number) => (value)
    out[name] = out[name].replace(/\((\w+)(\s*:\s*[A-Za-z0-9_.<>[\]| "]+?)\)/g, '($1)');
  }
  return out;
}

function loadContext() {
  // 逐常量求值进共享上下文：依赖缺失（引用了 import 标识符）的常量跳过即可，
  // 真值所需的常量都是纯字面量且按文件顺序依赖向前
  const ctx = vm.createContext({});
  const wanted = [];
  for (const [label, file] of Object.entries(SOURCES)) {
    const src = fs.readFileSync(file, 'utf8');
    const consts = extractClean(src);
    let ok = 0, skipped = [];
    for (const [name, init] of Object.entries(consts)) {
      wanted.push(name);
      try {
        vm.runInContext(`this.${name} = (${init});`, ctx, { timeout: 2000 });
        ok++;
      } catch (e) {
        skipped.push(name);
        delete ctx[name];
      }
    }
    console.error(`[extract] ${label}: ${ok} ok, ${skipped.length} skipped${skipped.length ? ' → ' + skipped.slice(0, 6).join(',') : ''}`);
  }
  const result = {};
  for (const name of [...new Set(wanted)]) if (ctx[name] !== undefined) result[name] = ctx[name];
  return result;
}

// ─── 控制表归一化 ───

function clean(o) {
  const r = {};
  for (const k of Object.keys(o)) if (o[k] !== undefined) r[k] = o[k];
  return r;
}
function normObjectField(f) {
  return clean({
    key: f.key, zh: f.labelZh, en: f.label,
    group: f.group || undefined,
    hint: f.hint || undefined, hintZh: f.hintZh || undefined,
    min: f.minimum, max: f.maximum, step: f.step,
    unit: f.unit || '', precision: f.precision, percent: f.percent || undefined,
  });
}
function normTupleField(t) {
  return { key: t[0], zh: t[1], en: t[2], min: t[3], max: t[4], step: t[5] };
}
function normTable(rows) {
  if (!rows || !rows.length) return [];
  return Array.isArray(rows[0]) ? rows.map(normTupleField) : rows.map(normObjectField);
}

// ─── 颜色/开关标签（逐字转录自 plugin-templates.ts，行号为该文件位置） ───

const BOOL_LABELS = {
  paused: ['暂停动画', 'Pause animation'],                    // :381,555,633,710
  introEnabled: ['启用开场', 'Enable opening'],               // :714（particle-image 覆盖为"粒子汇聚"）
  inertialWheel: ['滚轮惯性', 'Wheel inertia'],               // :449
  mouseInteraction: ['鼠标交互', 'Mouse interaction'],
  keyboardInteraction: ['键盘交互', 'Keyboard interaction'],
  autoSwitch: ['自动切换', 'Auto switch'],                    // :268
  showSource: ['显示源图', 'Show source image'],              // :275
  cursorInteraction: ['鼠标交互', 'Cursor interaction'],      // :287
};
const BOOL_OVERRIDES = {
  'particle-image': { introEnabled: ['粒子汇聚', 'Particle gathering'] }, // :222
};
const COLOR_LABELS = {
  hotColor: ['热色', 'Hot color'],        // :365
  midColor: ['中间色', 'Mid color'],      // :369
  coolColor: ['冷色', 'Cool color'],      // :373
  rimColor: ['亮边', 'Rim'],              // :471
  violetColor: ['紫光', 'Violet'],        // :472
  blueColor: ['蓝光', 'Blue'],            // :473
  shadowColor: ['暗部', 'Shadow'],        // :474
  squareColor: ['方块颜色', 'Square color'],
  backgroundColor: ['背景颜色', 'Background color'],
};

// ─── 装配 ───

const C = loadContext();

const STORE_KEYS = {
  'milky-way': 'code-codex:milky-way-background:v1',
  'glow-horizon': 'code-codex:glow-horizon-background:v1',
  'mountain': 'code-codex:mountain-settings:v1',
  'heavenly-cloud': 'code-codex:heavenly-cloud-background:v1',
  'aurora-ionosphere': 'code-codex:aurora-ionosphere-background:v1',
  'black-hole': 'code-codex:black-hole-background:v1',
  'cloud-train': 'code-codex:cloud-train-settings:v1',
  'blinking-squares': 'code-codex:blinking-squares-background:v1',
  'particle-image': 'code-codex:particle-image-background:v1',
  'pixel-sculpt': 'code-codex:pixel-sculpt-settings:v1',
};

function stripFns(o) {
  const r = {};
  for (const k of Object.keys(o)) if (typeof o[k] !== 'function') r[k] = o[k];
  return r;
}

function autoToggles(sceneId, defaults, fields) {
  return Object.keys(defaults)
    .filter((k) => typeof defaults[k] === 'boolean' && !fields.some((f) => f.key === k))
    .map((k) => {
      const [zh, en] = (BOOL_OVERRIDES[sceneId] && BOOL_OVERRIDES[sceneId][k]) || BOOL_LABELS[k] || [k, k];
      return { key: k, zh, en };
    });
}
function autoColors(defaults, fields) {
  return Object.keys(defaults)
    .filter((k) => typeof defaults[k] === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(defaults[k]) && !fields.some((f) => f.key === k))
    .map((k) => ({ key: k, zh: (COLOR_LABELS[k] || [k, k])[0], en: (COLOR_LABELS[k] || [k, k])[1] }));
}

function build(sceneId, { table, defaults, extra = {}, presets } = {}) {
  const fields = normTable(table);
  const def = JSON.parse(JSON.stringify(stripFns(defaults || {})));
  const schema = clean({
    storeKey: STORE_KEYS[sceneId],
    qualityDefault: def.quality,
    fields,
    colors: Array.isArray(def.colors) ? def.colors.slice() : undefined,
    colorFields: autoColors(def, fields),
    toggles: autoToggles(sceneId, def, fields),
    defaults: def,
    presets: presets ? JSON.parse(JSON.stringify(stripFnsDeep(presets))) : undefined,
    extraKeys: undefined,
  });
  if (extra && Object.keys(extra).length) Object.assign(schema, extra);
  return schema;
}
function stripFnsDeep(o) {
  if (Array.isArray(o)) return o.map(stripFnsDeep);
  if (o && typeof o === 'object') {
    const r = {};
    for (const k of Object.keys(o)) if (typeof o[k] !== 'function') r[k] = stripFnsDeep(o[k]);
    return r;
  }
  return o;
}

const schemas = {};

schemas['milky-way'] = build('milky-way', {
  table: C.MILKY_WAY_NUMERIC_CONTROL_DEFINITIONS,
  defaults: C.DEFAULT_MILKY_WAY_BACKGROUND_SETTINGS,
});
schemas['glow-horizon'] = build('glow-horizon', {
  table: C.GLOW_HORIZON_NUMERIC_CONTROL_DEFINITIONS,
  defaults: C.DEFAULT_GLOW_HORIZON_BACKGROUND_SETTINGS,
});
schemas['heavenly-cloud'] = build('heavenly-cloud', {
  table: C.HEAVENLY_CLOUD_NUMERIC_CONTROL_DEFINITIONS,
  defaults: C.DEFAULT_HEAVENLY_CLOUD_BACKGROUND_SETTINGS,
});
schemas['aurora-ionosphere'] = build('aurora-ionosphere', {
  table: C.AURORA_IONOSPHERE_NUMERIC_CONTROL_DEFINITIONS,
  defaults: C.DEFAULT_AURORA_IONOSPHERE_BACKGROUND_SETTINGS,
});
schemas['black-hole'] = build('black-hole', {
  table: C.BLACK_HOLE_NUMERIC_CONTROL_DEFINITIONS,
  defaults: C.DEFAULT_BLACK_HOLE_BACKGROUND_SETTINGS,
  presets: C.BLACK_HOLE_BACKGROUND_PRESETS, // cinema/lens/ember，cinema 即默认值
});
schemas['mountain'] = build('mountain', {
  table: C.MOUNTAIN_CONTROLS,
  defaults: C.MOUNTAIN_DEFAULTS,
});
schemas['cloud-train'] = build('cloud-train', {
  table: C.CLOUD_TRAIN_CONTROLS,
  defaults: C.CLOUD_TRAIN_DEFAULTS,
});
schemas['blinking-squares'] = build('blinking-squares', {
  table: C.BLINKING_SQUARES_CONTROLS,
  defaults: C.BLINKING_SQUARES_DEFAULTS,
});
schemas['particle-image'] = build('particle-image', {
  table: C.PARTICLE_NUMERIC_CONTROL_DEFINITIONS,
  defaults: C.DEFAULT_PARTICLE_BACKGROUND_SETTINGS,
  extra: { transformFields: normTable(C.PARTICLE_IMAGE_TRANSFORM_CONTROL_DEFINITIONS) },
});
// pixel-sculpt：设置面板内嵌于 bundle（宿主无数值表），仅登记 storeKey
schemas['pixel-sculpt'] = { storeKey: STORE_KEYS['pixel-sculpt'], fields: [], colorFields: [], toggles: [], defaults: {} };

// ─── 完整性自检：字段必须在默认值中有键、数值默认在范围内 ───

let problems = 0;
for (const [id, s] of Object.entries(schemas)) {
  for (const f of s.fields || []) {
    const def = s.defaults || {};
    if (!(f.key in def)) { console.error(`[warn] ${id}: 字段 ${f.key} 不在默认值中`); problems++; continue; }
    const v = def[f.key];
    if (typeof v === 'number' && (v < f.min - 1e-9 || v > f.max + 1e-9)) {
      console.error(`[warn] ${id}: ${f.key} 默认值 ${v} 超出 [${f.min},${f.max}]`); problems++;
    }
  }
}
if (problems) console.error(`自检发现 ${problems} 个问题（仍输出，供人工复核）`);

// ─── 输出 ───

fs.writeFileSync(path.join(ROOT, 'lib/vendor/code-codex/scene-schemas.json'), JSON.stringify(schemas, null, 1) + '\n');
const defaultsOut = {};
for (const [id, s] of Object.entries(schemas)) defaultsOut[id] = s.defaults || {};
fs.writeFileSync(path.join(ROOT, 'lib/vendor/code-codex/scene-defaults.json'), JSON.stringify(defaultsOut, null, 1) + '\n');

console.log('scene-schemas.json / scene-defaults.json 已生成');
for (const [id, s] of Object.entries(schemas)) {
  console.log(`  ${id}: fields=${(s.fields || []).length} colors=${(s.colorFields || []).length} toggles=${(s.toggles || []).length} presets=${s.presets ? Object.keys(s.presets).join('/') : '-'} speed=${s.defaults && s.defaults.speed}`);
}
