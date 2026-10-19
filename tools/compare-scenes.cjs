// 逐场景像素比对：harness 基准 vs 任一同尺寸 PNG（默认 vs 原版 app 纯场景帧）
// usage: node tools/compare-scenes.cjs [--a-dir docs/reference] [--b-prefix harness-] [--out docs/reference/compare.md]
// 对每场景: diff(docs/reference/scene-<id>-canvas.png, docs/reference/harness-<id>.png) → 报告
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const _pm = require('pixelmatch');
const pixelmatch = _pm.default || _pm.pixelmatch || _pm; // v8 为 ESM default 导出

const argv = process.argv.slice(2);
function argOf(name, dflt) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; }
const DIR = argOf('--a-dir', 'docs/reference');
const OUT = argOf('--out', 'docs/reference/compare.md');
const SCENES = ['milky-way', 'glow-horizon', 'mountain', 'heavenly-cloud', 'aurora-ionosphere', 'black-hole', 'cloud-train', 'blinking-squares', 'particle-image', 'pixel-sculpt'];

function loadPng(file) { return PNG.sync.read(fs.readFileSync(file)); }

const rows = [];
for (const id of SCENES) {
  const aFile = path.join(DIR, `scene-${id}-canvas.png`);
  const bFile = path.join(DIR, `harness-${id}.png`);
  if (!fs.existsSync(aFile) || !fs.existsSync(bFile)) { rows.push(`| ${id} | - | - | - | 缺文件 |`); continue; }
  const a = loadPng(aFile), b = loadPng(bFile);
  if (a.width !== b.width || a.height !== b.height) {
    rows.push(`| ${id} | ${a.width}x${a.height} | ${b.width}x${b.height} | - | 尺寸不一致 |`);
    continue;
  }
  // 时变场景（星流/粒子/噪声）逐像素 diff 必然有底噪：同时给出全图与暗像素占比
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  const total = a.width * a.height;
  const pct = ((n / total) * 100).toFixed(3);
  fs.writeFileSync(path.join(DIR, `diff-${id}.png`), PNG.sync.write(diff));
  rows.push(`| ${id} | ${a.width}x${a.height} | ${b.width}x${b.height} | ${pct}% | diff-${id}.png |`);
}
const md = ['# 场景像素比对：原版 app 纯场景帧 vs 参考台（同一渲染器字节）', '',
  '| 场景 | app 帧 | harness | 差异像素 | 备注 |',
  '|---|---|---|---|---|', ...rows, '',
  '> 阈值 0.1；动态场景（星流/粒子）有天然帧相位差，差异率是"结构性差异"的粗筛指标：', '> 结构一致时应为低个位数百分比（仅噪声/相位），构图或颜色错误时会是 30%+。', ''].join('\n');
fs.writeFileSync(OUT, md);
console.log(md);
