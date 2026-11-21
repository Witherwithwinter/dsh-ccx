import { clamp, finiteNum } from '../../shared/sanitize';
import type { AppearanceSettings } from '../../shared/types';

let cornerEl: HTMLDivElement | null = null;
let cornerRO: ResizeObserver | null = null;
let cornerROTarget: Element | null = null;
let cornerRetryTimer: ReturnType<typeof setTimeout> | null = null;
let cornerRetries = 0;

/**
 * 在 DSH 0.2.2-rc.5 中，`[data-slot="main"]` 的直接父级是 `.mainPanel`（无圆角），
 * 而带 `border-radius: 16px 0 0 0` 的 `.centerCol` 是其祖父级。
 * 向上查找最多 4 层，兼容 0.2.1 与 0.2.2-rc.5。
 */
function findRoundedMainColumn(): { col: HTMLElement; radius: number } | null {
  const slot = document.querySelector('[data-slot="main"]');
  let cur: HTMLElement | null = slot ? slot.parentElement : null;
  for (let depth = 0; depth < 4 && cur; depth++) {
    const r = parseFloat(getComputedStyle(cur).borderTopLeftRadius);
    if (Number.isFinite(r) && r > 0) {
      return { col: cur, radius: r };
    }
    cur = cur.parentElement;
  }
  return null;
}

export function syncCornerPatch(state: AppearanceSettings | null, layer: HTMLElement | null): void {
  if (cornerRetryTimer) {
    clearTimeout(cornerRetryTimer);
    cornerRetryTimer = null;
  }
  const masksOn = Boolean(
    state && state.enabled && state.mode !== 'off' && state.surfaces && state.surfaces.enabled,
  );
  if (!masksOn || !layer) {
    if (cornerEl) cornerEl.style.display = 'none';
    return;
  }

  const found = findRoundedMainColumn();
  if (!found) {
    if (cornerEl) cornerEl.style.display = 'none';
    if (cornerRetries < 30) {
      cornerRetries++;
      cornerRetryTimer = setTimeout(() => syncCornerPatch(state, layer), 1000);
    }
    return;
  }

  cornerRetries = 0;
  const { col, radius: r } = found;
  if (!cornerEl || !layer.contains(cornerEl)) {
    cornerEl = document.createElement('div');
    cornerEl.id = 'dsh-ap-corner';
    cornerEl.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;corner-shape:round;';
    layer.appendChild(cornerEl);
  }

  const rect = col.getBoundingClientRect();
  const a = clamp(finiteNum(state?.surfaces?.sidebar, 66), 0, 100) / 100;
  const isDark = document.body?.hasAttribute('data-ds-dark-theme') ?? true;
  const baseRgb = isDark ? '16,17,20' : '249,250,251';
  const mask = `radial-gradient(circle ${r}px at 100% 100%, transparent 0, transparent ${(r - 0.6).toFixed(1)}px, #000 ${r}px)`;

  cornerEl.style.display = 'block';
  cornerEl.style.left = `${rect.x}px`;
  cornerEl.style.top = `${rect.y}px`;
  cornerEl.style.width = `${r}px`;
  cornerEl.style.height = `${r}px`;
  cornerEl.style.background = `rgba(${baseRgb},${a.toFixed(3)})`;
  cornerEl.style.webkitMaskImage = mask;
  cornerEl.style.maskImage = mask;

  if (cornerRO && cornerROTarget !== col) {
    cornerRO.disconnect();
    cornerRO = null;
  }
  if (!cornerRO) {
    cornerRO = new ResizeObserver(() => syncCornerPatch(state, layer));
    cornerRO.observe(col);
    cornerROTarget = col;
  }
}

export function disposeCornerPatch(): void {
  if (cornerRetryTimer) {
    clearTimeout(cornerRetryTimer);
    cornerRetryTimer = null;
  }
  if (cornerRO) {
    cornerRO.disconnect();
    cornerRO = null;
  }
  cornerROTarget = null;
  cornerRetries = 0;
  if (cornerEl) {
    cornerEl.style.display = 'none';
  }
}
