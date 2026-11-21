export type BackgroundMode = 'scene' | 'wallpaper' | 'off';

export type WallpaperFit = 'cover' | 'contain' | 'tile';

export type WallpaperPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export type SurfaceRegionKey = 'sidebar' | 'conversation' | 'composer' | 'right';

export interface SurfaceSettings {
  enabled: boolean;
  sidebar: number;
  conversation: number;
  composer: number;
  right: number;
}

export type SceneParamValue = number | string | boolean | string[];
export type SceneParamMap = Record<string, SceneParamValue>;

export interface AppearanceSettings {
  version: number;
  enabled: boolean;
  mode: BackgroundMode;
  scene: string;
  wallpaperId: string | null;
  wallpaperFit: WallpaperFit;
  wallpaperPosition: WallpaperPosition;
  surfaces: SurfaceSettings;
  sceneParams: Record<string, SceneParamMap>;
  dim: number;
  blur: number;
  savedAt: number;
}

export interface WallpaperItem {
  id: string;
  name: string;
  mime: string;
  size: number;
  mtimeMs?: number;
  url: string;
}

export interface StateResponse {
  ok: boolean;
  settings: AppearanceSettings;
  defaults: AppearanceSettings;
  scenes: string[];
  wallpapers: WallpaperItem[];
}

export interface SceneField {
  key: string;
  zh: string;
  en: string;
  group?: string;
  hint?: string;
  hintZh?: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  precision?: number;
  percent?: boolean;
}

export interface SceneColorField {
  key: string;
  zh: string;
  en: string;
  group?: string;
}

export interface SceneToggle {
  key: string;
  zh: string;
  en: string;
  group?: string;
}

export interface SceneGroupDef {
  key: string;
  en: string;
  zh: string;
  keys: string[];
}

export interface SceneSchema {
  storeKey: string;
  panelKind?: 'grouped-reset' | 'shallow-ocean';
  qualityDefault?: string;
  groups?: SceneGroupDef[];
  fields: SceneField[];
  transformFields?: SceneField[];
  colors?: string[];
  colorFields: SceneColorField[];
  toggles: SceneToggle[];
  defaults: Record<string, SceneParamValue>;
  presets?: Record<string, Record<string, SceneParamValue>>;
}

export interface OceanEventJournalState {
  discovered: string[];
  excluded: string[];
}

export interface SceneMeta {
  id: string;
  label: string;
  en: string;
  cardTitle: string;
  icon: string;
  ext: string;
  layerBg: string;
  bgColorKey?: string;
  storeKey: string;
}

export interface VendorRendererInstance {
  ready?: Promise<void>;
  setSettings?: (settings: Record<string, unknown>) => void;
  updateSettings?: (settings: Record<string, unknown>) => void;
  setRenderSettings?: (settings: Record<string, unknown>) => void;
  replay?: () => void;
  replayOpening?: () => void;
  reset?: () => void;
  dispose?: () => void;
  // pixel-sculpt
  setActive?: (active: boolean, opts?: { paused?: boolean }) => void;
  mountControls?: (host: HTMLElement, lang?: string) => void;
  // shallow-ocean
  addCreature?: (kind: string, u?: number, v?: number) => void | Promise<void>;
  previewEvent?: (kind: string) => void;
  action?: (action: string) => void;
  diagnostics?: { parameters?: Record<string, number> } | null;
}

export interface VendorModuleEntry {
  id: string;
  api: number;
  version: string;
  prepareDefaults?: () => Promise<void>;
  exports?: Record<string, unknown>;
  startup: (target: HTMLElement, onError: (msg?: string) => void) => VendorRendererInstance;
}
