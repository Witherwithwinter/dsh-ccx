// 逐场景像素比对：默认比较 原版app纯场景帧(scene-<id>-canvas) vs 参考台(harness-<id>)；
// --pair dsh 比较 DSH实机(dsh-<id>) vs 参考台(harness-<id>)。
// usage: node tools/compare-scenes.cjs [--pair app|dsh] [--out docs/reference/compare[-dsh].md]
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const _pm = require('pixelmatch');
const pixelmatch = _pm.default || _pm.pixelmatch || _pm; // v8 为 ESM default 导出

const argv = process.argv.slice(2);
function argOf(name, dflt) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; }
const PAIR = argOf('--pair', 'app');
const DIR = argOf('--dir', 'docs/reference');
const OUT = argOf('--out', PAIR === 'dsh' ? 'docs/reference/compare-dsh.md' : 'docs/reference/compare.md');
const SCENES = ['milky-way', 'glow-horizon', 'mountain', 'heavenly-cloud', 'aurora-ionosphere', 'black-hole', 'cloud-train', 'blinking-squares', 'particle-image', 'pixel-sculpt'];

function aFile(id) { return PAIR === 'dsh' ? path.join(DIR, `dsh-${id}.png`) : path.join(DIR, `scene-${id}-canvas.png`); }
function bFile(id) { return path.join(DIR, `harness-${id}.png`); }
function loadPng(file) { return PNG.sync.read(fs.readFileSync(file)); }

const rows = [];
for (const id of SCENES) {
  const fa = aFile(id), fb = bFile(id);
  if (!fs.existsSync(fa) || !fs.existsSync(fb)) { rows.push(`| ${id} | - | - | - | 缺文件 |`); continue; }
  const a = loadPng(fa), b = loadPng(fb);
  if (a.width !== b.width || a.height !== b.height) {
    rows.push(`| ${id} | ${a.width}x${a.height} | ${b.width}x${b.height} | - | 尺寸不一致 |`);
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  const total = a.width * a.height;
  const pct = ((n / total) * 100).toFixed(3);
  fs.writeFileSync(path.join(DIR, `diff-${PAIR}-${id}.png`), PNG.sync.write(diff));
  rows.push(`| ${id} | ${a.width}x${a.height} | ${b.width}x${b.height} | ${pct}% | diff-${PAIR}-${id}.png |`);
}
const title = PAIR === 'dsh'
  ? '# DSH 实机纯场景帧 vs 参考台（同字节渲染器 + 默认参数）'
  : '# 原版 app 纯场景帧 vs 参考台（同一渲染器字节）';
const md = [title, '',
  '| 场景 | A | B | 差异像素 | 备注 |',
  '|---|---|---|---|---|', ...rows, '',
  '> 阈值 0.1。时变场景（星流/粒子/云/隧道）存在天然帧相位差：结构一致时为噪声级差异，',
  '> 构图或颜色错误会呈现为实心几何块（看 diff 图）。glow-horizon 为确定性 DOM 场景，应≈0%。',
  ''].join('\n');
fs.writeFileSync(OUT, md);
console.log(md);
