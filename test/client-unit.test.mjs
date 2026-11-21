// 客户端模块化纯逻辑 & 打包产物的单元测试
// 运行：node test/client-unit.test.mjs
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

const rootDir = path.resolve(import.meta.dirname, '..');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-ccx-unit-'));

async function importTs(relPath) {
  const hash = Buffer.from(relPath).toString('hex');
  const outFile = path.join(tmpDir, `${hash}.mjs`);
  await esbuild.build({
    entryPoints: [path.join(rootDir, relPath)],
    outfile: outFile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
  });
  return import(pathToFileURL(outFile).href);
}

try {
  // 1) 验证 lib/client.js 产物符合 DSH window.__ModuleLoader__ 契约
  const clientBundleCode = fs.readFileSync(path.join(rootDir, 'lib', 'client.js'), 'utf8');
  let registeredModule = null;
  const sandboxWindow = {
    __ModuleLoader__: {
      load(mod) {
        registeredModule = mod;
      },
    },
  };
  vm.runInNewContext(clientBundleCode, { window: sandboxWindow, Symbol, Object, Map, Set });
  assert.ok(registeredModule && registeredModule.id === 'dsh-ccx', 'client bundle registers dsh-ccx');
  const clientExports = registeredModule.factory(() => ({}));
  assert.strictEqual(typeof clientExports.apply, 'function', 'client bundle exports apply()');
  assert.deepStrictEqual(Array.from(clientExports.inject), [], 'client bundle exports inject: []');

  // 2) sanitizeSettings 测试（含 13 场景支持 + 迁移与夹取）
  const { sanitizeSettings } = await importTs('src/shared/sanitize.ts');
  const { SCENES, SCENE_IDS, DEFAULT_SETTINGS } = await importTs('src/shared/constants.ts');
  assert.strictEqual(SCENES.length, 13, '13 scenes registered in constants');
  for (const newScene of ['ascii-tiles', 'shallow-ocean', 'spectral-drape']) {
    assert.ok(SCENE_IDS.includes(newScene), `${newScene} included in SCENE_IDS`);
    const s = sanitizeSettings({ enabled: true, mode: 'scene', scene: newScene });
    assert.strictEqual(s.scene, newScene, `${newScene} accepted by sanitizeSettings`);
  }
  const invalidScene = sanitizeSettings({ scene: 'nonexistent-scene' });
  assert.strictEqual(invalidScene.scene, DEFAULT_SETTINGS.scene);
  const v5Migrated = sanitizeSettings({ version: 5, surfaces: { enabled: true, composer: 58 } });
  assert.strictEqual(v5Migrated.version, 6);
  assert.strictEqual(v5Migrated.surfaces.composer, 86, 'v5 composer default migrates to 86');

  // 3) buildSurfaceCss 测试（DSH 0.2.2-rc.5 Portal 隔离 + Windows 标题栏适配 + 明暗主题底色）
  const { buildSurfaceCss, LAYER_ID, DIM_ID } = await importTs('src/client/surfaces/surface-css.ts');
  const css = buildSurfaceCss();
  assert.ok(css.includes('body > #root :where('), 'scopes universal clear inside #root to protect portals');
  assert.ok(!css.includes('body :where('), 'does not indiscriminately match body-level portals');
  assert.ok(css.includes('[data-windows-titlebar]'), 'handles DSH 0.2.2 Windows titlebar');
  assert.ok(css.includes('body > span[style*="--dsw-specific-sidebar-fill"]'), 'clears Windows titleBarOverlay probe span');
  assert.ok(css.includes('--ap-base-sidebar:16,17,20'), 'dark sidebar base preserved');
  assert.ok(css.includes('--ap-base-main:255,255,255'), 'light theme surface base included');
  assert.ok(css.includes(LAYER_ID) && css.includes(DIM_ID));

  // 4) 全 13 个场景 schema 的 sanitizeDraft & draftDeltaObj 一致性测试
  const { sanitizeDraft, draftDeltaObj } = await importTs('src/client/ui/draft.ts');
  const schemas = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'lib', 'vendor', 'code-codex', 'scene-schemas.json'), 'utf8'),
  );
  for (const id of SCENE_IDS) {
    const sch = schemas[id];
    assert.ok(sch, `schema missing for ${id}`);
    const sanitized = sanitizeDraft(sch, sch.defaults);
    const { delta } = draftDeltaObj(sch, sanitized);
    assert.deepStrictEqual(delta, {}, `default settings produce empty delta for ${id}`);
  }

  // shallow-ocean 特有数值开关 (0 | 1) 与 performanceMode (0..3) 校验
  const oceanSch = schemas['shallow-ocean'];
  const oceanDraft = sanitizeDraft(oceanSch, {
    ...oceanSch.defaults,
    introEnabled: 0,
    eventsEnabled: true,
    performanceMode: 99,
    fishSpeed: -5,
  });
  assert.strictEqual(oceanDraft.introEnabled, 0, 'shallow-ocean introEnabled stays numeric 0');
  assert.strictEqual(oceanDraft.eventsEnabled, 1, 'shallow-ocean eventsEnabled coerces truthy -> 1');
  assert.strictEqual(oceanDraft.performanceMode, 3, 'shallow-ocean performanceMode clamps to 0..3');
  assert.ok(oceanDraft.fishSpeed >= oceanSch.fields.find((f) => f.key === 'fishSpeed').min);

  const oceanDelta = draftDeltaObj(oceanSch, oceanDraft).delta;
  assert.strictEqual(oceanDelta.introEnabled, 0);
  assert.strictEqual(oceanDelta.performanceMode, 3);
  assert.ok(!('eventsEnabled' in oceanDelta), 'unchanged field omitted from sparse delta');

  // 5) OceanEventJournal 收集与解锁过滤逻辑测试
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const { OceanEventJournal, SHALLOW_OCEAN_JOURNAL_KEY } = await importTs('src/client/background/shallow-ocean.ts');
  const journal = new OceanEventJournal();
  assert.strictEqual(journal.state.discovered.length, 0);
  assert.strictEqual(journal.included.length, 5);
  journal.discover('school');
  journal.toggle('school'); // 尚未集齐，不允许切换排除
  assert.strictEqual(journal.state.excluded.length, 0, 'cannot exclude before all 5 events discovered');
  for (const id of ['dolphin', 'storm', 'meteor', 'duo']) {
    journal.discover(id);
  }
  assert.strictEqual(journal.state.discovered.length, 5);
  journal.toggle('storm');
  assert.deepStrictEqual(journal.state.excluded, ['storm']);
  assert.ok(!journal.included.includes('storm'));
  assert.ok(store.has(SHALLOW_OCEAN_JOURNAL_KEY), 'journal persisted to localStorage');

  console.log('client-unit: all assertions passed ✓');
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}
