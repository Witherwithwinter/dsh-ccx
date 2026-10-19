// 生成精编的每场景设置 schema（labelZh 逐字版来自 milky-way bundle；
// glow-horizon 标签来自原版截图；其余按原版 normalizer 范围 + 默认值整理）
const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync('tmp-code-codex/releases/plugins/appearance/milky-way/CodeCodex-background-milky-way-1.0.0.js', 'utf8');
const si = src.indexOf('[{key:"');
let depth = 0, close = -1;
for (let i = si; i < src.length; i++) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') { depth--; if (depth === 0) { close = i; break; } }
}
const mwSchema = vm.runInNewContext('(' + src.slice(si, close + 1) + ')');
const mwDefaults = require('../lib/vendor/code-codex/scene-defaults.json')['milky-way'];

const particleFramework = [
  { key: 'speed', zh: '流动速度', en: 'Speed', min: 0, max: 2, step: 0.01 },
  { key: 'intensity', zh: '云层强度', en: 'Intensity', min: 0.3, max: 2.4, step: 0.01 },
  { key: 'turbulence', zh: '湍流', en: 'Turbulence', min: 0.35, max: 1.65, step: 0.01 },
  { key: 'radius', zh: '云径', en: 'Radius', min: 1.8, max: 4.6, step: 0.01 },
  { key: 'colorShift', zh: '色相偏移', en: 'Color shift', min: -3.14, max: 3.14, step: 0.01 },
  { key: 'pointerInfluence', zh: '指针影响', en: 'Pointer influence', min: 0, max: 1.2, step: 0.01 },
  { key: 'introDuration', zh: '开场时长', en: 'Opening duration', min: 0.8, max: 5, step: 0.1, unit: 's' },
  { key: 'introFeather', zh: '边缘羽化', en: 'Edge feathering', min: 0.02, max: 0.8, step: 0.01 },
];
const particleDefaults = { speed: 0.72, intensity: 1.15, turbulence: 1, radius: 3, colorShift: 0, pointerInfluence: 0.45, introDuration: 2.2, introFeather: 0.22 };
const harmonic = [
  { key: 'speed', zh: '流动速度', en: 'Speed', min: 0, max: 2, step: 0.01 },
  { key: 'amplitude', zh: '波动幅度', en: 'Amplitude', min: 0, max: 3, step: 0.01 },
  { key: 'frequency', zh: '波动频率', en: 'Frequency', min: 0, max: 3, step: 0.01 },
  { key: 'zoom', zh: '缩放', en: 'Zoom', min: 0.3, max: 2.5, step: 0.01 },
  { key: 'rotation', zh: '旋转', en: 'Rotation', min: -180, max: 180, step: 1, unit: '°' },
  { key: 'exposure', zh: '曝光系数', en: 'Exposure', min: 0, max: 2, step: 0.01 },
  { key: 'timeOffset', zh: '时间偏移', en: 'Time offset', min: 0, max: 20, step: 0.01 },
  { key: 'introDuration', zh: '开场时长', en: 'Opening duration', min: 0.5, max: 8, step: 0.1, unit: 's' },
  { key: 'introFeather', zh: '边缘羽化', en: 'Edge feathering', min: 0.01, max: 0.5, step: 0.01 },
  { key: 'introAngle', zh: '展开角度', en: 'Reveal angle', min: -180, max: 180, step: 1, unit: '°' },
  { key: 'introZoom', zh: '缩放强度', en: 'Zoom strength', min: 0, max: 0.6, step: 0.01 },
];
const harmonicDefaults = { speed: 0.35, amplitude: 1, frequency: 1, zoom: 1, rotation: 0, exposure: 1, timeOffset: 5.07, introDuration: 2.8, introFeather: 0.18, introAngle: 32, introZoom: 0.16 };
const waveColors = ['#d81159', '#8f2d56', '#218380', '#fbb13c', '#73d2de'];

const out = {
  'milky-way': {
    storeKey: 'code-codex:milky-way-background:v1',
    qualityDefault: mwDefaults.quality,
    fields: mwSchema.map(f => ({ key: f.key, zh: f.labelZh, en: f.label, min: f.minimum, max: f.maximum, step: f.step, unit: f.unit || '' })),
    colors: mwDefaults.colors,
    defaults: mwDefaults,
  },
  'glow-horizon': {
    storeKey: 'code-codex:glow-horizon-background:v1',
    qualityDefault: 'medium',
    fields: [
      { key: 'speed', zh: '波幅宽度', en: 'Wave width', min: 0, max: 1, step: 0.01 },
      { key: 'amplitude', zh: '波动幅度', en: 'Amplitude', min: 0, max: 3, step: 0.01 },
      { key: 'frequency', zh: '波动频率', en: 'Frequency', min: 0, max: 3, step: 0.01 },
      { key: 'exposure', zh: '暗晕系数', en: 'Exposure', min: 0, max: 2, step: 0.01 },
      { key: 'rotation', zh: '暗晕旋转', en: 'Rotation', min: -180, max: 180, step: 1, unit: '°' },
      { key: 'zoom', zh: '暗晕宽度', en: 'Zoom', min: 0.3, max: 2.5, step: 0.01 },
      { key: 'introZoom', zh: '初始缩位', en: 'Intro zoom', min: -0.5, max: 0.5, step: 0.01 },
      { key: 'introDuration', zh: '开场时长', en: 'Opening duration', min: 0.5, max: 8, step: 0.1, unit: 's' },
      { key: 'introFeather', zh: '动态视化', en: 'Intro feather', min: 0.02, max: 1, step: 0.01 },
      { key: 'introAngle', zh: '展开角度', en: 'Reveal angle', min: -180, max: 180, step: 1, unit: '°' },
    ],
    colors: waveColors,
    defaults: { speed: 0.35, amplitude: 1, frequency: 1, exposure: 1, rotation: 0, zoom: 1, introZoom: 0.16, introDuration: 2.8, introFeather: 0.18, introAngle: 32 },
  },
  mountain: {
    storeKey: 'code-codex:mountain-settings:v1',
    qualityDefault: 'medium',
    fields: harmonic,
    colors: waveColors,
    defaults: harmonicDefaults,
  },
  'heavenly-cloud': {
    storeKey: 'code-codex:heavenly-cloud-background:v1',
    qualityDefault: 'high',
    fields: particleFramework,
    colors: null,
    defaults: particleDefaults,
  },
  'aurora-ionosphere': {
    storeKey: 'code-codex:aurora-ionosphere-background:v1',
    qualityDefault: 'medium',
    fields: [
      { key: 'hue', zh: '色相', en: 'Hue', min: -180, max: 180, step: 1, unit: '°' },
      { key: 'saturation', zh: '饱和度', en: 'Saturation', min: 0, max: 2, step: 0.01 },
      { key: 'speed', zh: '流动速度', en: 'Speed', min: 0, max: 3, step: 0.01 },
      { key: 'intensity', zh: '帘幕强度', en: 'Intensity', min: 0, max: 3, step: 0.01 },
      { key: 'curtainScale', zh: '帘幕尺度', en: 'Curtain scale', min: 0.05, max: 2, step: 0.01 },
      { key: 'turbulence', zh: '湍流', en: 'Turbulence', min: 0, max: 1.8, step: 0.01 },
      { key: 'glow', zh: '辉光', en: 'Glow', min: 0, max: 2.4, step: 0.01 },
      { key: 'starDensity', zh: '星密度', en: 'Star density', min: 0, max: 1.5, step: 0.01 },
      { key: 'introDuration', zh: '开场时长', en: 'Opening duration', min: 0.6, max: 6, step: 0.1, unit: 's' },
      { key: 'introFeather', zh: '边缘羽化', en: 'Edge feathering', min: 0.03, max: 0.4, step: 0.01 },
    ],
    colors: null,
    defaults: { hue: 0, saturation: 1, speed: 1, intensity: 1, curtainScale: 0.5, turbulence: 0.58, glow: 0.72, starDensity: 0.56, introDuration: 2.4, introFeather: 0.2 },
  },
  'black-hole': {
    storeKey: 'code-codex:black-hole-background:v1',
    qualityDefault: 'high',
    fields: particleFramework,
    colors: null,
    defaults: particleDefaults,
  },
  'cloud-train': {
    storeKey: 'code-codex:cloud-train-settings:v1',
    qualityDefault: 'high',
    fields: particleFramework,
    colors: null,
    defaults: particleDefaults,
  },
  'blinking-squares': {
    storeKey: 'code-codex:blinking-squares-background:v1',
    qualityDefault: 'high',
    fields: particleFramework,
    colors: null,
    defaults: particleDefaults,
  },
  'particle-image': { storeKey: 'code-codex:particle-image-background:v1', qualityDefault: 'high', fields: [], colors: null, defaults: {} },
  'pixel-sculpt': { storeKey: 'code-codex:pixel-sculpt-settings:v1', qualityDefault: 'high', fields: [], colors: null, defaults: {} },
};
fs.writeFileSync('lib/vendor/code-codex/scene-schemas.json', JSON.stringify(out, null, 1));
console.log('written; scenes:', Object.keys(out).length, '; milky-way fields:', out['milky-way'].fields.length);
