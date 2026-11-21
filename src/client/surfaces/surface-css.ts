import { SURFACE_REGIONS } from '../../shared/constants';
import { clamp, finiteNum } from '../../shared/sanitize';
import type { AppearanceSettings, SurfaceRegionKey } from '../../shared/types';
import { syncCornerPatch, disposeCornerPatch } from './corner-patch';

export const LAYER_ID = 'dsh-ap-layer';
export const DIM_ID = 'dsh-ap-dim';
export const BG_STYLE_ID = 'dsh-ap-surface-style';

export interface RegionRowMeta {
  key: SurfaceRegionKey;
  zh: string;
  en: string;
  selector: string;
  baseVar: '--ap-base-sidebar' | '--ap-base-main';
}

export const REGION_ROWS: readonly RegionRowMeta[] = [
  {
    key: 'sidebar',
    zh: '会话侧栏',
    en: 'Sidebar',
    selector: 'div:has(> [data-slot="sidebar"])',
    baseVar: '--ap-base-sidebar',
  },
  {
    key: 'conversation',
    zh: '对话区',
    en: 'Conversation',
    selector: 'div:has(> [data-slot="main"])',
    baseVar: '--ap-base-main',
  },
  {
    key: 'composer',
    zh: '消息输入区',
    en: 'Composer',
    selector: '[data-composer-card]',
    baseVar: '--ap-base-main',
  },
  {
    key: 'right',
    zh: '右侧栏',
    en: 'Right panel',
    selector: ':is([data-rightbar-col], div:has(> [data-slot="rightbar"]))',
    baseVar: '--ap-base-sidebar',
  },
];

let surfaceStyleEl: HTMLStyleElement | null = null;
let cachedCss = '';

/**
 * 构建级联层表面 CSS（适配 DSH 0.2.2-rc.5 与 0.2.1）：
 *   1. 将通配清除限定在 `body > #root` 子树内：
 *      - Settings 弹窗 / Onboarding / Model 菜单 / Tooltip / Lightbox 均 portal 到 `body` 旁（#root 之外），
 *        天然豁免并保持原生清晰样式，同时避免对 2000+ 聊天节点执行祖先 `[class*="_panel"] *` 扫描。
 *      - 背景层 `#dsh-ap-layer` 挂载于 `body` 首位（#root 之外），天然不被通配透明破坏。
 *   2. Windows DSH 0.2.2-rc.5 自定义标题栏（`html[data-windows-titlebar]`）：
 *      - `.frame::before`（40px 顶部条）随侧栏透明度同步透明或上色。
 *      - `preload-app.cjs` 的 `titleBarOverlay` probe（`body > span[style*="--dsw-specific-sidebar-fill"]`）
 *        在背景启用时置透明，防止右上角窗口控制按钮背后出现不透明实心矩形块。
 */
export function buildSurfaceCss(): string {
  if (cachedCss) return cachedCss;

  const clearElements =
    'body > #root :where(div,main,aside,section,article,header,footer,nav,form,dialog,ul,ol,li,button,input,textarea,select)' +
    ':not([role="img"]):not([data-icon]):not([class*="icon" i])';
  const clearDecl =
    'background-color:transparent !important;-webkit-backdrop-filter:none !important;backdrop-filter:none !important';
  const composerKeep = ':not([data-composer-card]):not([data-composer-card] *)';

  const lines: string[] = [
    '@layer dsh-ap-clear, dsh-ap-masks, dsh-ap-assert;',
    '@layer dsh-ap-clear {',
    'html[data-ap-bg]{background-color:transparent !important;--ap-base-sidebar:249,250,251;--ap-base-main:255,255,255}',
    'html[data-ap-bg] body:has([data-ds-dark-theme]),html[data-ap-bg] body[data-ds-dark-theme]{--ap-base-sidebar:16,17,20;--ap-base-main:11,12,15}',
    'html[data-ap-bg] body,html[data-ap-bg] body > #root{isolation:isolate;background-color:transparent !important}',
    `html[data-ap-bg][data-ap-masks] ${clearElements}{${clearDecl}}`,
    `html[data-ap-bg]:not([data-ap-masks]) ${clearElements}${composerKeep}{${clearDecl}}`,
    'html[data-ap-bg][data-windows-titlebar] body > #root > div::before{background:transparent !important}',
    'html[data-ap-bg][data-windows-titlebar] body > span[style*="--dsw-specific-sidebar-fill"]{background-color:transparent !important}',
    'html[data-ap-bg] body > #root [data-composer-seat],html[data-ap-bg] body > #root div:has(> [data-slot="conversation.input.dock"]){background:none !important;background-image:none !important}',
    'html[data-ap-bg] body > #root :is([class*="bg-gradient"],[class*="TopFade"],[class*="fade" i]){background-image:none !important}',
    '}',
    '@layer dsh-ap-masks {',
  ];

  for (const r of REGION_ROWS) {
    lines.push(
      `html[data-ap-masks] body > #root ${r.selector}{background-color:rgba(var(${r.baseVar}),var(--ap-mask-${r.key})) !important}`,
    );
  }
  lines.push(
    'html[data-ap-masks][data-windows-titlebar] body > #root > div::before{background-color:rgba(var(--ap-base-sidebar),var(--ap-mask-sidebar)) !important}',
    'html[data-ap-masks] body > #root [data-composer-card]{box-shadow:none !important}',
    '}',
    '@layer dsh-ap-assert {',
    `html[data-ap-bg] body > div#${LAYER_ID}{background:var(--ap-layer-bg,#000) !important}`,
    `html[data-ap-bg] body > div#${LAYER_ID} > div#${DIM_ID}{background:var(--ap-dim-bg,transparent) !important}`,
    '}',
  );

  cachedCss = lines.join('\n');
  return cachedCss;
}

export function applySurfaceVars(state: AppearanceSettings | null, layer: HTMLElement | null): void {
  const html = document.documentElement;
  for (const key of SURFACE_REGIONS) {
    const v = state?.surfaces ? clamp(finiteNum(state.surfaces[key], 66), 0, 100) / 100 : 0;
    html.style.setProperty(`--ap-mask-${key}`, v.toFixed(3));
  }
  syncCornerPatch(state, layer);
}

export function applySurfaceStyles(state: AppearanceSettings | null, layer: HTMLElement | null): void {
  const on = Boolean(state && state.enabled && state.mode !== 'off');
  const masksOn = on && Boolean(state?.surfaces?.enabled);
  const html = document.documentElement;

  if (!on) {
    clearSurfaceStyles();
    return;
  }

  if (!surfaceStyleEl || !document.head.contains(surfaceStyleEl)) {
    surfaceStyleEl = document.createElement('style');
    surfaceStyleEl.id = BG_STYLE_ID;
    surfaceStyleEl.setAttribute('data-dsh-ccx', 'surface');
    (document.head || document.documentElement).appendChild(surfaceStyleEl);
  }

  const css = buildSurfaceCss();
  if (surfaceStyleEl.textContent !== css) surfaceStyleEl.textContent = css;

  html.setAttribute('data-ap-bg', 'true');
  applySurfaceVars(state, layer);
  if (masksOn) html.setAttribute('data-ap-masks', 'true');
  else html.removeAttribute('data-ap-masks');
}

export function clearSurfaceStyles(): void {
  const html = document.documentElement;
  html.removeAttribute('data-ap-bg');
  html.removeAttribute('data-ap-masks');
  for (const key of SURFACE_REGIONS) {
    try {
      html.style.removeProperty(`--ap-mask-${key}`);
    } catch {
      /* ignore */
    }
  }
  disposeCornerPatch();
}
