export const PANEL_CSS = `
:host {
  all: initial;
  color-scheme: dark light;
  font-family: 'Segoe UI', 'Microsoft YaHei UI', system-ui, sans-serif;
  font-weight: 430;
}
* { box-sizing: border-box; font-family: inherit; }

.trigger {
  position: fixed;
  left: 12px;
  bottom: 76px;
  z-index: 2147482000;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(128,140,170,.35);
  background: rgba(20,24,34,.55);
  backdrop-filter: blur(8px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: .55;
  transition: opacity .15s ease, transform .15s ease, left .18s ease, bottom .18s ease;
  padding: 0;
}
:host([data-sidebar-collapsed="true"]) .trigger {
  left: 14px;
  bottom: 16px;
}
:host([data-theme="light"]) .trigger {
  border-color: rgba(80,95,125,.28);
  background: rgba(255,255,255,.76);
}
.trigger:hover, .trigger[aria-expanded="true"] {
  opacity: 1;
  transform: scale(1.08);
}
.trigger svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: #dfe6f5;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
:host([data-theme="light"]) .trigger svg {
  stroke: #1f2430;
}

.preview-market-popover, .particle-settings-panel {
  --cle-paper: #1f1f1f;
  --cle-paper-raised: #242424;
  --cle-subtle: #242424;
  --cle-ink: #f2f2f2;
  --cle-muted: #a3a3a3;
  --cle-rule: #3a3a3a;
  --cle-rule-strong: #454545;
  --cle-scroll-thumb: #666666;
  --cle-hover: #2b2c2e;
  --cle-subtle-2: #242424;
  --cle-input: #252628;
  --cle-signal: #69aaf5;
  --cle-added: #62c990;
  --cle-deleted: #ff7b72;
  --cle-focus: #69aaf5;
  --cle-icon-blue: #79b8e6;
  --cle-icon-violet: #b9a1e3;
  --cle-icon-teal: #4fd1c5;
  --cle-market-enable: #e5f0fe;
  --cle-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color-scheme: dark;
}
:host([data-theme="light"]) .preview-market-popover,
:host([data-theme="light"]) .particle-settings-panel {
  --cle-paper: #ffffff;
  --cle-paper-raised: #ffffff;
  --cle-subtle: #f7f7f7;
  --cle-ink: #1a1c1f;
  --cle-muted: #64666a;
  --cle-rule: #e4e4e4;
  --cle-rule-strong: #d7d7d7;
  --cle-scroll-thumb: #cccccc;
  --cle-hover: #f2f3f3;
  --cle-subtle-2: #f4f4f4;
  --cle-input: #ffffff;
  --cle-signal: #2e82d2;
  --cle-added: #1d8156;
  --cle-deleted: #b42318;
  --cle-focus: #2e82d2;
  --cle-icon-blue: #2473a8;
  --cle-icon-violet: #7256a8;
  --cle-icon-teal: #15747b;
  --cle-market-enable: #e5f0fe;
  color-scheme: light;
}

.preview-market-popover {
  position: fixed;
  left: 12px;
  bottom: 114px;
  z-index: 2147482900;
  width: min(326px, calc(100vw - 24px));
  max-height: calc(100vh - 130px);
  overflow: visible;
  color: var(--cle-ink);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 10px;
  box-shadow: 0 14px 34px rgba(12,18,28,.2), 0 3px 10px rgba(12,18,28,.12);
  font-size: 12px;
  line-height: 1.45;
  animation: ccx-market-in 130ms cubic-bezier(.2,.8,.2,1) both;
}
:host([data-sidebar-collapsed="true"]) .preview-market-popover {
  left: 14px;
  bottom: 54px;
}
.preview-market-popover[hidden] { display: none; }
.preview-market-popover::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 18px;
  width: 10px;
  height: 10px;
  background: var(--cle-paper-raised);
  border-right: 1px solid var(--cle-rule-strong);
  border-bottom: 1px solid var(--cle-rule-strong);
  transform: rotate(45deg);
}
.preview-market-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px 8px 14px;
  border-bottom: 1px solid var(--cle-rule);
}
.preview-market-header h3 {
  flex: 1;
  margin: 0;
  color: var(--cle-ink);
  font-size: 13px;
  font-weight: 650;
  line-height: 18px;
}
.preview-market-close {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--cle-muted);
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}
.preview-market-close:hover { color: var(--cle-ink); background: var(--cle-hover); }
.preview-market-close svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.3; }

.preview-market-list {
  position: relative;
  display: grid;
  align-content: start;
  gap: 8px;
  max-height: min(440px, calc(100vh - 150px));
  padding: 8px;
  overflow: auto;
  scrollbar-color: var(--cle-scroll-thumb) transparent;
  scrollbar-width: thin;
}
.preview-market-categories {
  display: grid;
  width: fit-content;
  grid-template-columns: repeat(3, max-content);
  gap: 2px;
  padding: 2px;
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 7px;
}
.preview-market-category {
  min-width: 0;
  padding: 5px 7px;
  color: var(--cle-muted);
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 650;
  line-height: 14px;
  letter-spacing: .01em;
  white-space: nowrap;
}
.preview-market-category:hover { color: var(--cle-ink); background: var(--cle-hover); }
.preview-market-category[aria-selected='true'] {
  color: var(--cle-ink);
  background: var(--cle-paper);
  box-shadow: 0 1px 2px rgba(12,18,28,.08);
}
.preview-market-section { display: grid; gap: 6px; min-width: 0; }
.preview-market-section[hidden] { display: none; }
.preview-market-section-list { display: grid; gap: 8px; }
.cat-empty { margin: 4px 2px; color: var(--cle-muted); font-size: 10.5px; }

.preview-extension {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  column-gap: 10px;
  row-gap: 9px;
  padding: 10px;
  background: var(--cle-paper);
  border: 1px solid var(--cle-rule);
  border-radius: 8px;
}
.preview-extension-icon {
  display: grid;
  place-items: center;
  align-self: start;
  width: 38px;
  height: 38px;
  color: var(--cle-icon-blue);
  background: color-mix(in srgb, var(--cle-icon-blue) 10%, var(--cle-paper));
  border: 1px solid color-mix(in srgb, var(--cle-icon-blue) 20%, var(--cle-rule));
  border-radius: 8px;
}
.preview-extension-icon svg {
  width: 23px;
  height: 23px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.15;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.preview-extension-copy { min-width: 0; }
.preview-extension-title-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}
.preview-extension h4 {
  min-width: 0;
  margin: 0;
  color: var(--cle-ink);
  font-size: 12px;
  font-weight: 650;
  line-height: 17px;
  overflow-wrap: anywhere;
}
.preview-extension-status {
  flex: 0 0 auto;
  padding: 1px 5px;
  color: var(--cle-muted);
  background: var(--cle-subtle);
  border-radius: 999px;
  font-size: 9px;
  line-height: 15px;
}
.preview-extension-status[data-enabled='true'] {
  color: var(--cle-added);
  background: color-mix(in srgb, var(--cle-added) 11%, var(--cle-paper));
}
.preview-extension-actions {
  display: flex;
  grid-column: 2;
  align-items: center;
  justify-self: start;
  gap: 5px;
}
.preview-extension-action {
  grid-column: 2;
  justify-self: start;
  min-width: 58px;
  min-height: 25px;
  padding: 3px 10px;
  color: #173b66;
  background: var(--cle-market-enable);
  border: 1px solid color-mix(in srgb, var(--cle-market-enable) 80%, #69aaf5);
  border-radius: 5px;
  cursor: pointer;
  font-size: 10.5px;
  font-weight: 600;
}
.preview-extension-action:hover { filter: brightness(1.06); }
.preview-extension-action[data-enabled='true'] {
  color: var(--cle-muted);
  background: transparent;
  border-color: var(--cle-rule-strong);
}
.particle-settings-trigger {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 25px;
  height: 25px;
  padding: 0;
  color: var(--cle-muted);
  background: transparent;
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
}
.particle-settings-trigger:hover, .particle-settings-trigger[aria-expanded='true'] {
  color: var(--cle-ink);
  background: var(--cle-hover);
}
.particle-settings-trigger svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ext-particle .preview-extension-icon {
  color: var(--cle-icon-violet);
  background: color-mix(in srgb, var(--cle-icon-violet) 10%, var(--cle-paper));
  border-color: color-mix(in srgb, var(--cle-icon-violet) 22%, var(--cle-rule));
}
.ext-blackhole .preview-extension-icon {
  color: #f59e0b;
  background: color-mix(in srgb, #f59e0b 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #f59e0b 24%, var(--cle-rule));
}
.ext-glowhorizon .preview-extension-icon {
  color: #a558fb;
  background: color-mix(in srgb, #a558fb 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #a558fb 24%, var(--cle-rule));
}
.ext-heavenlycloud .preview-extension-icon {
  color: #38e8ff;
  background: color-mix(in srgb, #38e8ff 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #38e8ff 24%, var(--cle-rule));
}
.ext-shallowocean .preview-extension-icon {
  color: #2dd4bf;
  background: color-mix(in srgb, #2dd4bf 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #2dd4bf 24%, var(--cle-rule));
}
.ext-asciitiles .preview-extension-icon {
  color: #69aaf5;
  background: color-mix(in srgb, #69aaf5 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #69aaf5 24%, var(--cle-rule));
}
.ext-spectraldrape .preview-extension-icon {
  color: #c084fc;
  background: color-mix(in srgb, #c084fc 10%, var(--cle-paper));
  border-color: color-mix(in srgb, #c084fc 24%, var(--cle-rule));
}

.particle-settings-panel {
  position: fixed;
  top: 12px;
  left: 344px;
  z-index: 2147483000;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: min(352px, calc(100vw - 24px));
  max-height: calc(100vh - 24px);
  color: var(--cle-ink);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 8px;
  box-shadow: 0 20px 52px rgba(0,0,0,.34), 0 4px 14px rgba(0,0,0,.2);
  font-size: 12px;
  line-height: 1.45;
  animation: ccx-settings-in 130ms cubic-bezier(.2,.8,.2,1) both;
}
.particle-settings-panel[hidden] { display: none; }
.particle-settings-panel.shallow-ocean-panel {
  width: min(680px, calc(100vw - 24px));
  container-type: inline-size;
}
.particle-settings-panel[data-side='right'] { transform-origin: left top; }
.particle-settings-panel[data-side='right']::before {
  position: absolute;
  top: var(--cle-anchor-y, 24px);
  left: -6px;
  width: 10px;
  height: 10px;
  background: var(--cle-paper-raised);
  border-bottom: 1px solid var(--cle-rule-strong);
  border-left: 1px solid var(--cle-rule-strong);
  content: '';
  transform: translateY(-50%) rotate(45deg);
}

.particle-settings-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  padding: 10px 12px 9px 13px;
  background: var(--cle-paper-raised);
  border-bottom: 1px solid var(--cle-rule);
  border-radius: 8px 8px 0 0;
}
.particle-settings-heading { min-width: 0; flex: 1; }
.particle-settings-header h3 {
  margin: 0;
  overflow: hidden;
  color: var(--cle-ink);
  font-size: 13px;
  font-weight: 650;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.particle-settings-header p { margin: 1px 0 0; color: var(--cle-muted); font-size: 10px; line-height: 15px; }
.particle-settings-header p .badge { margin-left: 4px; color: var(--cle-signal); }

.particle-settings-close {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--cle-muted);
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}
.particle-settings-close:hover { color: var(--cle-ink); background: var(--cle-hover); }
.particle-settings-close svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.3; }

.particle-settings-scroll {
  display: grid;
  gap: 10px;
  align-content: start;
  min-width: 0;
  min-height: 0;
  max-height: calc(100vh - 86px);
  padding: 9px 10px 11px;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-color: var(--cle-scroll-thumb) transparent;
  scrollbar-width: thin;
}

.particle-settings-group {
  display: grid;
  gap: 6px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.particle-settings-group + .particle-settings-group {
  padding-top: 9px;
  border-top: 1px solid var(--cle-rule);
}
.particle-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 1px;
}
.particle-settings-group legend,
.particle-group-head .particle-group-title {
  margin: 0;
  padding: 0;
  color: var(--cle-muted);
  font-size: 9.5px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: .04em;
}
.particle-group-reset {
  padding: 1px 6px;
  color: var(--cle-muted);
  background: transparent;
  border: 1px solid var(--cle-rule);
  border-radius: 4px;
  cursor: pointer;
  font-size: 9px;
  line-height: 14px;
}
.particle-group-reset:hover {
  color: var(--cle-ink);
  background: var(--cle-hover);
  border-color: var(--cle-rule-strong);
}

.particle-control-row {
  display: grid;
  grid-template-columns: minmax(92px, .9fr) minmax(72px, 1.1fr) minmax(44px, auto);
  align-items: center;
  gap: 6px;
  min-width: 0;
  min-height: 30px;
  color: var(--cle-muted);
  font-size: 10px;
}
.particle-control-row label { min-width: 0; overflow-wrap: anywhere; line-height: 14px; }
.particle-control-row input[type='range'] {
  width: 100%;
  min-width: 0;
  margin: 0;
  accent-color: var(--cle-signal);
  cursor: pointer;
}
.particle-control-value { display: grid; min-width: 44px; justify-items: end; }
.particle-control-row output {
  box-sizing: border-box;
  width: 100%;
  min-width: 44px;
  padding: 0 3px;
  color: var(--cle-ink);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: text;
  font: 9.5px/18px var(--cle-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
  user-select: none;
}
.particle-control-row output:hover {
  background: var(--cle-hover);
  border-color: var(--cle-rule);
}
.particle-control-row output[hidden],
.particle-value-editor[hidden] { display: none; }
.particle-value-editor {
  box-sizing: border-box;
  width: 60px;
  max-width: 100%;
  min-width: 0;
  height: 20px;
  margin: 0;
  padding: 0 4px;
  color: var(--cle-ink);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-focus);
  border-radius: 4px;
  appearance: textfield;
  font: 9.5px/18px var(--cle-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.particle-value-editor::-webkit-inner-spin-button,
.particle-value-editor::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}

.surface-opacity-row {
  grid-template-columns: minmax(92px, 1fr) minmax(60px, 1fr) 44px 24px;
  min-height: 30px;
}
.surface-opacity-row button {
  border: 1px solid var(--cle-rule);
  border-radius: 4px;
  background: var(--cle-paper);
  color: var(--cle-ink);
  height: 24px;
  padding: 0;
  cursor: pointer;
  font: inherit;
}
.surface-opacity-row button:hover { background: var(--cle-hover); border-color: var(--cle-rule-strong); }

.particle-toggle-row, .particle-color-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 27px;
  margin: 0 4px;
  color: var(--cle-muted);
  font-size: 9.5px;
}
.particle-toggle-row input[type='checkbox'] {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: var(--cle-signal);
  cursor: pointer;
}
.particle-color-row input[type='color'] {
  width: 29px;
  height: 21px;
  padding: 2px;
  overflow: hidden;
  background: var(--cle-input);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
}

.heavenly-cloud-quality-toolbar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
}
.heavenly-cloud-quality-toolbar.dir4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.heavenly-cloud-quality-toolbar button {
  min-width: 0;
  min-height: 40px;
  padding: 4px 6px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  font-weight: 600;
  line-height: 12px;
}
.heavenly-cloud-quality-toolbar button strong {
  display: block;
  margin-bottom: 2px;
  color: #38e8ff;
  font-family: var(--cle-mono);
  font-size: 11px;
}
.heavenly-cloud-quality-toolbar button:hover:not(:disabled),
.heavenly-cloud-quality-toolbar button[aria-pressed='true'] {
  color: var(--cle-ink);
  background: color-mix(in srgb, #38e8ff 10%, var(--cle-paper-raised));
  border-color: color-mix(in srgb, #38e8ff 42%, var(--cle-rule-strong));
}

.glow-horizon-direction-toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--cle-rule);
}
.glow-horizon-direction-toolbar button {
  min-width: 0;
  min-height: 34px;
  padding: 3px 5px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  font-weight: 600;
  line-height: 12px;
}
.glow-horizon-direction-toolbar button:hover:not(:disabled),
.glow-horizon-direction-toolbar button[aria-pressed='true'] {
  color: var(--cle-ink);
  background: color-mix(in srgb, #a558fb 12%, var(--cle-paper-raised));
  border-color: color-mix(in srgb, #a558fb 45%, var(--cle-rule-strong));
}
.glow-horizon-direction-toolbar .glow-horizon-direction-symbol {
  display: block;
  margin-bottom: 1px;
  font-size: 14px;
  line-height: 15px;
}

.black-hole-preset-toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--cle-rule);
}
.black-hole-preset-toolbar button {
  min-width: 0;
  min-height: 32px;
  padding: 3px 5px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  font-weight: 600;
  line-height: 12px;
  white-space: normal;
}
.black-hole-preset-toolbar button:hover:not(:disabled),
.black-hole-preset-toolbar button[aria-pressed='true'] {
  color: var(--cle-ink);
  background: color-mix(in srgb, #f59e0b 10%, var(--cle-paper-raised));
  border-color: color-mix(in srgb, #f59e0b 45%, var(--cle-rule-strong));
}
.black-hole-preset-toolbar .black-hole-reset {
  color: var(--cle-muted);
  background: var(--cle-subtle);
}

.glow-horizon-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  padding-top: 2px;
}
.glow-horizon-actions.single { grid-template-columns: minmax(0, 1fr); }
.glow-horizon-actions button {
  min-height: 30px;
  padding: 4px 8px;
  color: var(--cle-muted);
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
}
.glow-horizon-actions button:hover:not(:disabled) {
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-signal) 10%, var(--cle-subtle));
  border-color: color-mix(in srgb, var(--cle-signal) 42%, var(--cle-rule-strong));
}
.glow-horizon-actions button:disabled { cursor: default; opacity: .5; }

/* Shallow Ocean panel */
.shallow-ocean-panel .ocean-developer-trigger {
  appearance: none;
  border: 0;
  padding: 0;
  margin: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.shallow-ocean-panel .ocean-developer-trigger:focus-visible {
  outline: 2px solid var(--cle-icon-blue);
  outline-offset: 3px;
  border-radius: 3px;
}
.shallow-ocean-panel .ocean-developer-badge {
  margin-left: 6px;
  font-size: 10px;
  line-height: 16px;
  color: var(--cle-icon-blue);
}
.shallow-ocean-panel .ocean-performance {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-inline-start: auto;
  font-size: 10.5px;
  color: var(--cle-muted);
}
.shallow-ocean-panel .ocean-performance select {
  font: inherit;
  color: var(--cle-ink);
  background: var(--cle-paper);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  padding: 2px 6px;
}
.shallow-ocean-panel .ocean-creature-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  margin: 0;
  padding-bottom: 4px;
  scrollbar-width: thin;
}
.shallow-ocean-panel .ocean-creature-card {
  display: flex;
  flex: 1 0 76px;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  margin: 0;
  padding: 4px 5px;
  color: var(--cle-ink);
  background: var(--cle-paper);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  cursor: pointer;
  font-size: 9.5px;
  line-height: 12px;
}
.shallow-ocean-panel .ocean-creature-card img {
  display: block;
  width: 100%;
  height: 44px;
  object-fit: contain;
  pointer-events: none;
  background: var(--cle-subtle);
  border-radius: 4px;
}
.shallow-ocean-panel .ocean-creature-card span {
  min-height: 16px;
  display: grid;
  place-items: center;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.shallow-ocean-panel .ocean-creature-card:hover:not(:disabled) {
  background: var(--cle-subtle);
  border-color: var(--cle-icon-blue);
}
.shallow-ocean-panel .ocean-creature-card:disabled { cursor: default; opacity: .55; }
.shallow-ocean-panel .ocean-parameter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  column-gap: 14px;
  row-gap: 8px;
}
.shallow-ocean-panel .ocean-parameter-grid .particle-settings-group {
  min-width: 0;
  margin: 0;
  padding: 4px 0;
  border-top: 0;
  align-content: start;
  gap: 4px;
}
.shallow-ocean-panel .ocean-parameter-grid .particle-control-row {
  grid-template-columns: minmax(66px, 1fr) minmax(52px, 1fr) 36px;
  min-height: 24px;
}
.shallow-ocean-panel .ocean-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.shallow-ocean-panel .ocean-actions button {
  min-height: 24px;
  padding: 3px 8px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  line-height: 15px;
}
.shallow-ocean-panel .ocean-actions button:hover:not(:disabled) {
  color: var(--cle-ink);
  background: var(--cle-hover);
}
.shallow-ocean-panel .ocean-actions button:disabled { cursor: default; opacity: .5; }
.shallow-ocean-panel [data-ocean-event][aria-pressed="true"] {
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-icon-blue) 14%, var(--cle-paper-raised));
  border-color: var(--cle-icon-blue);
}
.shallow-ocean-panel [data-ocean-event][hidden] { display: none; }
.shallow-ocean-panel .ocean-hint {
  margin: 4px 0 6px;
  font-size: 10px;
  line-height: 1.45;
  color: var(--cle-muted);
}
@container (max-width: 620px) {
  .shallow-ocean-panel .ocean-parameter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container (max-width: 420px) {
  .shallow-ocean-panel .ocean-parameter-grid { grid-template-columns: minmax(0, 1fr); }
}

/* Custom wallpaper library */
.particle-source-details {
  min-width: 0;
  overflow: hidden;
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 7px;
}
.particle-source-details[open] { padding-bottom: 8px; }
.particle-source-summary {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 5px 8px;
  color: var(--cle-ink);
  cursor: pointer;
  font-size: 10.5px;
  font-weight: 600;
  list-style: none;
  user-select: none;
}
.particle-source-summary::-webkit-details-marker { display: none; }
.particle-source-summary::before {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-right: 1px solid var(--cle-muted);
  border-bottom: 1px solid var(--cle-muted);
  content: '';
  transform: rotate(-45deg);
}
.particle-source-details[open] .particle-source-summary::before {
  transform: rotate(45deg) translate(-1px, -1px);
}
.particle-source-summary:hover { background: var(--cle-hover); }
.particle-source-count {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: var(--cle-muted);
  font: 9px/16px var(--cle-mono);
  white-space: nowrap;
}
.particle-library-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin: 0 8px 7px;
}
.particle-library-add, .particle-library-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 3px 7px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  line-height: 15px;
}
.particle-library-add {
  position: relative;
  color: var(--cle-ink);
  border-color: color-mix(in srgb, var(--cle-signal) 48%, var(--cle-rule));
}
.particle-library-clear { margin-left: auto; }
.particle-library-clear:disabled { cursor: default; opacity: .5; }
.particle-library-add:hover, .particle-library-clear:hover:not(:disabled) { background: var(--cle-hover); }
.particle-library-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  min-width: 0;
  margin: 0 8px;
}
.particle-library-empty {
  grid-column: 1/-1;
  margin: 0;
  padding: 10px 7px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px dashed var(--cle-rule-strong);
  border-radius: 6px;
  font-size: 9.5px;
  line-height: 1.45;
  text-align: center;
}
.wallitem { position: relative; min-width: 0; }
.wallitem .wpick {
  display: grid;
  width: 100%;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  color: var(--cle-muted);
  background: var(--cle-paper);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
}
.wallitem .wpick:hover { border-color: var(--cle-rule-strong); }
.wallitem.on .wpick {
  border-color: var(--cle-signal);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cle-signal) 20%, transparent);
}
.wallitem img, .wallitem .vthumb {
  display: block;
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  background: var(--cle-subtle);
}
.wallitem .vthumb {
  display: grid;
  place-items: center;
  color: var(--cle-muted);
  font-size: 14px;
}
.wallitem .wname {
  display: block;
  min-width: 0;
  padding: 3px 4px 4px;
  overflow: hidden;
  font-size: 8.5px;
  line-height: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wallitem .wdel {
  position: absolute;
  z-index: 3;
  top: 3px;
  right: 3px;
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  padding: 0;
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-paper-raised) 88%, transparent);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  opacity: 0;
}
.wallitem:hover .wdel, .wallitem .wdel:focus-visible { opacity: 1; }
.wallitem .wdel:hover {
  color: #fff;
  background: var(--cle-deleted, #b42318);
  border-color: var(--cle-deleted, #b42318);
}
.wall-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 8px 0;
  gap: 6px;
}
.wall-pager output {
  color: var(--cle-muted);
  font: 9px/16px var(--cle-mono);
}
.wall-pager button {
  min-width: 32px;
  height: 22px;
  padding: 0 6px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
}
.wall-pager button:hover:not(:disabled) { color: var(--cle-ink); background: var(--cle-hover); }
.wall-pager button:disabled { cursor: default; opacity: .45; }

.particle-settings-scroll select {
  min-height: 24px;
  padding: 2px 6px;
  color: var(--cle-ink);
  background: var(--cle-input);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  font-size: 10px;
  cursor: pointer;
}
.panel-note {
  margin: 0;
  padding: 8px;
  color: var(--cle-muted);
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  font-size: 9.5px;
  line-height: 1.45;
}
.particle-plugin-error {
  grid-column: 1/-1;
  margin: 0;
  padding: 6px 7px;
  color: var(--cle-deleted, #ff7b72);
  background: color-mix(in srgb, var(--cle-deleted, #ff7b72) 8%, var(--cle-paper));
  border: 1px solid color-mix(in srgb, var(--cle-deleted, #ff7b72) 30%, var(--cle-rule));
  border-radius: 5px;
  font-size: 9.5px;
  line-height: 1.4;
}
.particle-plugin-error[hidden] { display: none; }

@keyframes ccx-market-in {
  from { opacity: 0; transform: translateY(5px) scale(.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ccx-settings-in {
  from { opacity: 0; transform: translateY(3px) scale(.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Pixel Sculpt embedded vendor controls */
.particle-settings-panel .pixelSculpt-controls-host { min-width: 0; }
.particle-settings-panel .pixelSculpt-disabled {
  margin: 0;
  padding: 8px;
  color: var(--cle-muted);
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  font-size: 9.5px;
  line-height: 1.45;
}
.particle-settings-panel .pixelSculpt-disabled[hidden] { display: none; }
.particle-settings-panel .pixelSculpt-paused-row { margin: 0; padding-top: 9px; border-top: 1px solid var(--cle-rule); }
.particle-settings-panel .pixelSculpt-actions { grid-template-columns: minmax(0, 1fr); margin-top: -2px; }
.particle-settings-panel .pixelSculpt-actions button:hover {
  background: var(--cle-hover);
  border-color: color-mix(in srgb, var(--cle-signal) 45%, var(--cle-rule-strong));
}
.pixel-sculpt-controls { color: var(--cle-ink); font-size: 10px; line-height: 1.45; }
.pixel-sculpt-controls .panel {
  position: static;
  display: grid;
  gap: 0;
  width: 100%;
  max-height: none;
  padding: 0;
  overflow: visible;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
}
.pixel-sculpt-controls .ph { display: none; }
.pixel-sculpt-controls .row:not(.gallery-block) {
  display: grid;
  grid-template-columns: minmax(92px, .9fr) minmax(72px, 1.1fr) minmax(42px, auto);
  align-items: center;
  gap: 6px;
  min-width: 0;
  min-height: 34px;
  margin: 0;
  padding: 0;
  color: var(--cle-muted);
  font-size: 10px;
}
.pixel-sculpt-controls .row:not(.gallery-block) > .row-head { display: contents; }
.pixel-sculpt-controls .row:not(.gallery-block) > .row-head > span {
  grid-column: 1;
  min-width: 0;
  overflow: visible;
  color: var(--cle-muted);
  white-space: normal;
}
.pixel-sculpt-controls .row:not(.gallery-block) > .row-head > output {
  grid-column: 3;
  grid-row: 1;
  box-sizing: border-box;
  width: 100%;
  min-width: 42px;
  padding: 0 3px;
  color: var(--cle-ink);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: text;
  font: 9.5px/18px var(--cle-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
  user-select: none;
}
.pixel-sculpt-controls .row:not(.gallery-block) > .row-head > output:hover {
  background: var(--cle-hover);
  border-color: var(--cle-rule);
}
.pixel-sculpt-controls .row:not(.gallery-block) > input[type="range"] { grid-column: 2; grid-row: 1; }
.pixel-sculpt-controls input[type="range"] {
  width: 100%;
  min-width: 0;
  height: auto;
  margin: 0;
  appearance: auto;
  accent-color: var(--cle-signal);
  background: transparent;
  border-radius: 0;
  cursor: pointer;
}
.pixel-sculpt-controls .seg {
  grid-column: 2 / 4;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 5px;
  min-width: 0;
}
.pixel-sculpt-controls .seg button {
  min-width: 0;
  min-height: 25px;
  padding: 3px 5px;
  overflow: hidden;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pixel-sculpt-controls .seg button:hover,
.pixel-sculpt-controls .seg button.on {
  color: var(--cle-ink);
  background: var(--cle-hover);
  border-color: color-mix(in srgb, var(--cle-signal) 45%, var(--cle-rule-strong));
}
.pixel-sculpt-controls .toggle-line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 27px;
  margin: 0 8px;
  padding: 0;
  color: var(--cle-muted);
  font-size: 9.5px;
}
.pixel-sculpt-controls .toggle { position: static; display: block; width: 14px; height: 14px; }
.pixel-sculpt-controls .toggle input {
  position: static;
  width: 14px;
  height: 14px;
  margin: 0;
  opacity: 1;
  accent-color: var(--cle-signal);
  cursor: pointer;
}
.pixel-sculpt-controls .toggle > span { display: none; }
.pixel-sculpt-controls .divider { height: 1px; margin: 9px 0; background: var(--cle-rule); }
.pixel-sculpt-controls .gallery-block {
  display: block;
  min-width: 0;
  margin: 0 0 6px;
  padding: 0 0 8px;
  overflow: hidden;
  background: var(--cle-subtle);
  border: 1px solid var(--cle-rule);
  border-radius: 7px;
}
.pixel-sculpt-controls .gallery-block > .row-head {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  margin: 0;
  padding: 5px 8px;
  color: var(--cle-ink);
  font-size: 10.5px;
  font-weight: 600;
}
.pixel-sculpt-controls .gallery-block > .row-head output {
  min-width: 0;
  margin-left: auto;
  color: var(--cle-muted);
  font: 9px/16px var(--cle-mono);
}
.pixel-sculpt-controls .file-row { display: flex; align-items: center; gap: 6px; min-width: 0; margin: 0 8px 7px; }
.pixel-sculpt-controls .file-row button,
.pixel-sculpt-controls .gallery-nav button {
  min-height: 24px;
  padding: 3px 7px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 9.5px;
  line-height: 15px;
}
.pixel-sculpt-controls .file-row button {
  flex: 0 0 auto;
  color: var(--cle-ink);
  border-color: color-mix(in srgb, var(--cle-signal) 48%, var(--cle-rule));
}
.pixel-sculpt-controls .file-row button:disabled { cursor: default; opacity: .5; }
.pixel-sculpt-controls .file-row button:hover,
.pixel-sculpt-controls .gallery-nav button:hover:not(:disabled) { background: var(--cle-hover); }
.pixel-sculpt-controls .file-row span {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: var(--cle-muted);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pixel-sculpt-controls .gallery-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  min-width: 0;
  margin: 0 8px;
}
.pixel-sculpt-controls .gallery-empty {
  grid-column: 1 / -1;
  margin: 0;
  padding: 10px 7px;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px dashed var(--cle-rule-strong);
  border-radius: 6px;
  font-size: 9.5px;
  line-height: 1.45;
  text-align: center;
}
.pixel-sculpt-controls .gallery-item { position: relative; min-width: 0; }
.pixel-sculpt-controls .gallery-preview {
  display: grid;
  width: 100%;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  color: var(--cle-muted);
  background: var(--cle-paper-raised);
  border: 1px solid var(--cle-rule);
  border-radius: 6px;
  cursor: pointer;
}
.pixel-sculpt-controls .gallery-preview:hover { border-color: var(--cle-rule-strong); }
.pixel-sculpt-controls .gallery-item.is-selected .gallery-preview {
  border-color: var(--cle-signal);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cle-signal) 20%, transparent);
}
.pixel-sculpt-controls .gallery-item.is-active .gallery-preview { box-shadow: inset 0 0 0 1px var(--cle-ink); }
.pixel-sculpt-controls .gallery-preview img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: var(--cle-subtle);
}
.pixel-sculpt-controls .gallery-name {
  display: block;
  min-width: 0;
  padding: 3px 4px 4px;
  overflow: hidden;
  font-size: 8.5px;
  line-height: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pixel-sculpt-controls .gallery-item .remove {
  position: absolute;
  z-index: 3;
  top: 3px;
  right: 3px;
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  padding: 0 0 1px;
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-paper-raised) 88%, transparent);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  opacity: 0;
}
.pixel-sculpt-controls .gallery-item:hover .remove,
.pixel-sculpt-controls .gallery-item:focus-within .remove { opacity: 1; }
.pixel-sculpt-controls .gallery-item .remove:hover {
  color: #ffffff;
  background: var(--cle-deleted);
  border-color: var(--cle-deleted);
}
.pixel-sculpt-controls .gallery-order {
  position: absolute;
  z-index: 2;
  top: 4px;
  left: 4px;
  display: grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  color: #ffffff;
  background: var(--cle-signal);
  border: 1px solid color-mix(in srgb, #ffffff 48%, transparent);
  border-radius: 999px;
  pointer-events: none;
  font: 700 8px/1 var(--cle-mono);
}
.pixel-sculpt-controls .gallery-live {
  position: absolute;
  z-index: 2;
  right: 4px;
  bottom: 21px;
  padding: 1px 4px;
  color: var(--cle-ink);
  background: color-mix(in srgb, var(--cle-paper-raised) 88%, transparent);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 3px;
  pointer-events: none;
  font: 700 7px/11px var(--cle-mono);
  letter-spacing: .05em;
}
.pixel-sculpt-controls .gallery-nav {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 32px;
  align-items: center;
  gap: 6px;
  margin: 6px 8px 0;
}
.pixel-sculpt-controls .gallery-nav button { height: 24px; padding: 0; }
.pixel-sculpt-controls .gallery-nav button:disabled { cursor: default; opacity: .5; }
.pixel-sculpt-controls .gallery-index {
  color: var(--cle-muted);
  font: 9px/16px var(--cle-mono);
  text-align: center;
}
.pixel-sculpt-controls .color-row {
  grid-template-columns: minmax(0, 1fr) 29px !important;
  gap: 8px !important;
  min-height: 34px !important;
}
.pixel-sculpt-controls .color-row > div {
  display: grid;
  grid-template-columns: minmax(92px, .9fr) minmax(72px, 1.1fr);
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.pixel-sculpt-controls .color-row > div > .row-head { margin: 0; color: var(--cle-muted); font-size: 10px; }
.pixel-sculpt-controls .color-row input[type="text"] {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 22px;
  padding: 2px 6px;
  color: var(--cle-ink);
  background: var(--cle-input);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  outline: 0;
  font: 9.5px/16px var(--cle-mono);
}
.pixel-sculpt-controls .color-row input[type="color"] {
  width: 29px;
  height: 21px;
  padding: 2px;
  overflow: hidden;
  background: var(--cle-input);
  border: 1px solid var(--cle-rule-strong);
  border-radius: 5px;
  cursor: pointer;
}
.pixel-sculpt-controls [hidden] { display: none !important; }
.ocean-creature-fly {
  position: fixed;
  z-index: 2147483600;
  margin: 0;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,.35));
}
`;
