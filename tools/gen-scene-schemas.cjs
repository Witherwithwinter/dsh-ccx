// 生成每场景设置 schema v3：数值表/默认值/预设全部从上游 code-codex 源码逐字提取，杜绝手抄错位。
// 用法:
//   node tools/gen-scene-schemas.cjs [--codex-dir <path>]
//   (默认依次查找 --codex-dir、env.CODEX_DIR、tmp-code-codex)
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function resolveCodexDir() {
  const idx = process.argv.indexOf('--codex-dir');
  if (idx >= 0 && process.argv[idx + 1]) return path.resolve(process.argv[idx + 1]);
  if (process.env.CODEX_DIR) return path.resolve(process.env.CODEX_DIR);
  return path.join(ROOT, 'tmp-code-codex');
}

const CODEX_DIR = resolveCodexDir();
const UI = path.join(CODEX_DIR, 'packages/explorer-ui/src');
const SOURCES = {
  particleStartup: path.join(UI, 'particle-image-startup.ts'),
  blinking: path.join(UI, 'blinking-squares-settings.ts'),
  renderers: path.join(UI, 'startup-background-renderers.ts'),
  explorer: path.join(UI, 'core/configuration/explorer.ts'),
  spectralModel: path.join(UI, 'effects/spectral-drape/model.ts'),
  oceanOptions: path.join(UI, 'effects/shallow-ocean/options.ts'),
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

function readBalanced(src, eqIdx) {
  let d2 = 0, end = -1, satIdx = -1;
  const stack = [];
  for (let j = eqIdx + 1; j < src.length; j++) {
    const c = src[j];
    if (c === "'" || c === '"' || c === '`') { j = skipString(src, j) - 1; continue; }
    if (c === '/' && src[j + 1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
    if (c === '/' && src[j + 1] === '*') { j = src.indexOf('*/', j) + 1; continue; }
    if (c === 's' && /^satisfies(?![\w$])/.test(src.slice(j, j + 30))) { satIdx = j; break; }
    if (c === 'a' && /^as\s+const(?![\w$])/.test(src.slice(j, j + 20))) { end = j; break; }
    if ('([{'.includes(c)) { d2++; stack.push(c); }
    else if (')]}'.includes(c)) { d2--; stack.pop(); }
    else if (c === ';' && d2 === 0) { end = j; break; }
  }
  let expr = null;
  if (satIdx >= 0) {
    const closers = stack.reverse().map((o) => ({ '(': ')', '[': ']', '{': '}' }[o])).join('');
    expr = src.slice(eqIdx + 1, satIdx).trim() + closers;
  } else if (end >= 0) {
    expr = src.slice(eqIdx + 1, end).trim();
  }
  if (!expr) return null;
  if (expr.endsWith(' as const')) expr = expr.slice(0, -' as const'.length);
  expr = expr.replace(/\s+as\s+[A-Za-z0-9_<>.[\]| ]+$/g, '');
  expr = expr.replace(/new (WeakMap|Map|Set|WeakSet)<[\s\S]*?>\(/g, 'new $1(');
  expr = expr.replace(/\((\w+)(\s*:\s*[A-Za-z0-9_.<>[\]| "]+?)\)/g, '($1)');
  return expr;
}

function extractConsts(src, { includeUnexported = false } = {}) {
  const out = {};
  const re = includeUnexported
    ? /(?:^|\n)(?:export )?const ([A-Za-z0-9_]+)/g
    : /(?:^|\n)export const ([A-Za-z0-9_]+)/g;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
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
    const expr = readBalanced(src, eq);
    if (expr) out[name] = expr;
  }
  return out;
}

function evalConsts(src, ctx, opts) {
  const consts = extractConsts(src, opts);
  const loaded = {};
  let ok = 0, skipped = [];
  for (const [name, init] of Object.entries(consts)) {
    try {
      vm.runInContext(`this.${name} = (${init});`, ctx, { timeout: 2000 });
      loaded[name] = ctx[name];
      ok++;
    } catch (e) {
      skipped.push(name);
      delete ctx[name];
    }
  }
  return { ok, skipped, loaded };
}

function loadContext() {
  const ctx = vm.createContext({});
  const wanted = [];
  for (const [label, file] of Object.entries(SOURCES)) {
    const src = fs.readFileSync(file, 'utf8');
    const { ok, skipped, loaded } = evalConsts(src, ctx);
    for (const k of Object.keys(loaded)) wanted.push(k);
    console.error(`[extract] ${label}: ${ok} ok, ${skipped.length} skipped${skipped.length ? ' → ' + skipped.slice(0, 6).join(',') : ''}`);
  }
  const result = {};
  for (const name of [...new Set(wanted)]) if (ctx[name] !== undefined) result[name] = ctx[name];
  return result;
}

// 从 effects/* + features/plugin-settings/*.ts 加载独立场景（ascii-tiles / spectral-drape / shallow-ocean）
function loadFeatureScene({ id, modelFile, settingsFile, defaultsName, rangesName, extraCtx = {} }) {
  const ctx = vm.createContext({
    Object, Number, String, Boolean, Math, Array, Record: Object,
    ID: id,
    ...extraCtx,
  });
  const modelSrc = fs.readFileSync(modelFile, 'utf8');
  evalConsts(modelSrc, ctx, { includeUnexported: false });
  const settingsSrc = fs.readFileSync(settingsFile, 'utf8');
  if (defaultsName && ctx[defaultsName]) ctx.DEFAULT_ASCII_TILES_SETTINGS = ctx[defaultsName];
  evalConsts(settingsSrc, ctx, { includeUnexported: true });
  return {
    defaults: ctx[defaultsName],
    ranges: ctx[rangesName],
    groups: ctx.groups || (ctx.config && ctx.config.groups),
    labels: ctx.labels || (ctx.config && ctx.config.labels),
    config: ctx.config,
  };
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

// ─── 颜色/开关标签（逐字转录自 plugin-templates.ts） ───

const BOOL_LABELS = {
  paused: ['暂停动画', 'Pause animation'],
  introEnabled: ['启用开场', 'Enable opening'],
  inertialWheel: ['滚轮惯性', 'Wheel inertia'],
  mouseInteraction: ['鼠标交互', 'Mouse interaction'],
  keyboardInteraction: ['键盘交互', 'Keyboard interaction'],
  autoSwitch: ['自动切换', 'Auto switch'],
  showSource: ['显示源图', 'Show source image'],
  cursorInteraction: ['鼠标交互', 'Cursor interaction'],
};
const BOOL_OVERRIDES = {
  'particle-image': { introEnabled: ['粒子汇聚', 'Particle gathering'] },
};
const COLOR_LABELS = {
  hotColor: ['热色', 'Hot color'],
  midColor: ['中间色', 'Mid color'],
  coolColor: ['冷色', 'Cool color'],
  rimColor: ['亮边', 'Rim'],
  violetColor: ['紫光', 'Violet'],
  blueColor: ['蓝光', 'Blue'],
  shadowColor: ['暗部', 'Shadow'],
  squareColor: ['方块颜色', 'Square color'],
  backgroundColor: ['背景颜色', 'Background color'],
};

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
  'ascii-tiles': 'code-codex:ascii-tiles-background:v1',
  'shallow-ocean': 'code-codex:shallow-ocean-background:v1',
  'spectral-drape': 'code-codex:spectral-drape-background:v1',
};

function stripFns(o) {
  const r = {};
  for (const k of Object.keys(o)) if (typeof o[k] !== 'function') r[k] = o[k];
  return r;
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
  });
  if (extra && Object.keys(extra).length) Object.assign(schema, extra);
  return schema;
}

function buildGroupedFeatureScene(sceneId, { defaults, ranges, groups, labels }, { boolKeys = [] } = {}) {
  const def = JSON.parse(JSON.stringify(defaults));
  const fields = [];
  const colorFields = [];
  const toggles = [];
  const groupDefs = [];
  for (let i = 0; i < groups.length; i++) {
    const [enGroup, zhGroup, keys] = groups[i];
    const gKey = `g${i}`;
    groupDefs.push({ key: gKey, en: enGroup, zh: zhGroup, keys: [...keys] });
    for (const key of keys) {
      const lbl = labels[key] || [key, key];
      const [en, zh, unit = ''] = lbl;
      const range = ranges[key];
      const isBool = typeof def[key] === 'boolean' || boolKeys.includes(key);
      if (isBool) {
        toggles.push({ key, zh, en, group: gKey });
      } else if (range) {
        fields.push(clean({
          key, zh, en, group: gKey,
          min: range[0], max: range[1], step: range[2],
          unit, precision: String(range[2]).includes('.') ? String(range[2]).split('.')[1].length : 0,
        }));
      } else if (typeof def[key] === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(def[key])) {
        colorFields.push({ key, zh, en, group: gKey });
      }
    }
  }
  return clean({
    storeKey: STORE_KEYS[sceneId],
    panelKind: 'grouped-reset',
    groups: groupDefs,
    fields,
    colorFields,
    toggles,
    defaults: def,
  });
}

// ─── 装配 ───

const C = loadContext();
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
  presets: C.BLACK_HOLE_BACKGROUND_PRESETS,
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
schemas['pixel-sculpt'] = {
  storeKey: STORE_KEYS['pixel-sculpt'],
  fields: [],
  colorFields: [],
  toggles: [],
  defaults: {},
};

// ascii-tiles（ESM .mjs 转 JSON）
const asciiModSrc = fs.readFileSync(path.join(UI, 'effects/ascii-tiles/options.mjs'), 'utf8')
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ');
const asciiCtx = vm.createContext({ Object, Number, Math });
vm.runInContext(asciiModSrc + '; this.__DEFAULTS = DEFAULTS; this.__RANGES = RANGES;', asciiCtx);
const asciiFeature = loadFeatureScene({
  id: 'code-codex.ascii-tiles-background',
  modelFile: path.join(UI, 'effects/ascii-tiles/model.ts'),
  settingsFile: path.join(UI, 'features/plugin-settings/ascii-tiles.ts'),
  defaultsName: 'DEFAULT_ASCII_TILES_SETTINGS',
  rangesName: 'RANGES',
  extraCtx: { DEFAULTS: asciiCtx.__DEFAULTS, RANGES: asciiCtx.__RANGES },
});
asciiFeature.defaults = { ...asciiCtx.__DEFAULTS, paused: false };
asciiFeature.ranges = asciiCtx.__RANGES;
schemas['ascii-tiles'] = buildGroupedFeatureScene('ascii-tiles', asciiFeature);

// spectral-drape
const spectralFeature = loadFeatureScene({
  id: 'code-codex.spectral-drape-background',
  modelFile: path.join(UI, 'effects/spectral-drape/model.ts'),
  settingsFile: path.join(UI, 'features/plugin-settings/spectral-drape.ts'),
  defaultsName: 'DEFAULT_SPECTRAL_DRAPE_SETTINGS',
  rangesName: 'RANGES',
});
schemas['spectral-drape'] = buildGroupedFeatureScene('spectral-drape', spectralFeature);

// shallow-ocean
const oceanFeature = loadFeatureScene({
  id: 'code-codex.shallow-ocean-background',
  modelFile: path.join(UI, 'effects/shallow-ocean/options.ts'),
  settingsFile: path.join(UI, 'features/plugin-settings/shallow-ocean.ts'),
  defaultsName: 'DEFAULT_OPTIONS',
  rangesName: 'RANGES',
});
schemas['shallow-ocean'] = buildGroupedFeatureScene('shallow-ocean', oceanFeature, {
  boolKeys: ['introEnabled', 'eventsEnabled'],
});
schemas['shallow-ocean'].panelKind = 'shallow-ocean';

// ─── 完整性自检 ───

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
if (problems) console.error(`自检发现 ${problems} 个问题`);

// ─── 输出 ───

fs.writeFileSync(path.join(ROOT, 'lib/vendor/code-codex/scene-schemas.json'), JSON.stringify(schemas, null, 1) + '\n');
const defaultsOut = {};
for (const [id, s] of Object.entries(schemas)) defaultsOut[id] = s.defaults || {};
fs.writeFileSync(path.join(ROOT, 'lib/vendor/code-codex/scene-defaults.json'), JSON.stringify(defaultsOut, null, 1) + '\n');

console.log('scene-schemas.json / scene-defaults.json 已生成（13 场景）');
for (const [id, s] of Object.entries(schemas)) {
  console.log(`  ${id}: fields=${(s.fields || []).length} colors=${(s.colorFields || []).length} toggles=${(s.toggles || []).length} presets=${s.presets ? Object.keys(s.presets).join('/') : '-'} groups=${s.groups ? s.groups.length : '-'}`);
}
