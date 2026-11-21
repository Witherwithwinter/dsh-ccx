import type { AppearanceSettings, SceneMeta, SurfaceRegionKey } from './types';

export const PLUGIN_ID = 'dsh-ccx';
export const API_BASE = '/dsh-appearances';

export const SCENES: readonly SceneMeta[] = [
  {
    id: 'milky-way',
    label: '银河',
    en: 'Milky Way',
    cardTitle: 'Milky Way Background',
    icon: 'milky-way',
    ext: '',
    layerBg: '#02090d',
    storeKey: 'code-codex:milky-way-background:v1',
  },
  {
    id: 'glow-horizon',
    label: '辉光地平线',
    en: 'Glow Horizon',
    cardTitle: 'Glow Horizon Background',
    icon: 'glow-horizon',
    ext: 'ext-glowhorizon',
    layerBg: '#050507',
    storeKey: 'code-codex:glow-horizon-background:v1',
  },
  {
    id: 'mountain',
    label: '层峦',
    en: 'Layered Mountain',
    cardTitle: 'Layered Mountain Background',
    icon: 'mountain',
    ext: '',
    layerBg: '#02090d',
    storeKey: 'code-codex:mountain-settings:v1',
  },
  {
    id: 'heavenly-cloud',
    label: '云穹',
    en: 'Heavenly Cloud',
    cardTitle: 'Heavenly Cloud Background',
    icon: 'heavenly-cloud',
    ext: 'ext-heavenlycloud',
    layerBg: '#020408',
    storeKey: 'code-codex:heavenly-cloud-background:v1',
  },
  {
    id: 'aurora-ionosphere',
    label: '极光电离层',
    en: 'Aurora Ionosphere',
    cardTitle: 'Aurora Ionosphere Background',
    icon: 'aurora-ionosphere',
    ext: '',
    layerBg: '#02090d',
    storeKey: 'code-codex:aurora-ionosphere-background:v1',
  },
  {
    id: 'black-hole',
    label: '黑洞',
    en: 'Black Hole',
    cardTitle: 'Black Hole Background',
    icon: 'black-hole',
    ext: 'ext-blackhole',
    layerBg: '#000000',
    storeKey: 'code-codex:black-hole-background:v1',
  },
  {
    id: 'cloud-train',
    label: '云列车',
    en: 'Cloud Train',
    cardTitle: 'Cloud Train Background',
    icon: 'cloud-train',
    ext: '',
    layerBg: '#02090d',
    storeKey: 'code-codex:cloud-train-settings:v1',
  },
  {
    id: 'particle-image',
    label: '粒子成像',
    en: 'Particle Image',
    cardTitle: 'Particle Image Background',
    icon: 'particle-image',
    ext: 'ext-particle',
    layerBg: '#000000',
    bgColorKey: 'backgroundColor',
    storeKey: 'code-codex:particle-image-background:v1',
  },
  {
    id: 'pixel-sculpt',
    label: '像素雕塑',
    en: 'Pixel Sculpt',
    cardTitle: 'Pixel Sculpt Background',
    icon: 'pixel-sculpt',
    ext: '',
    layerBg: '#02090d',
    storeKey: 'code-codex:pixel-sculpt-settings:v1',
  },
  {
    id: 'blinking-squares',
    label: '闪烁方块',
    en: 'Blinking Squares',
    cardTitle: 'Blinking Squares Background',
    icon: 'blinking-squares',
    ext: '',
    layerBg: '#000000',
    bgColorKey: 'backgroundColor',
    storeKey: 'code-codex:blinking-squares-background:v1',
  },
  {
    id: 'ascii-tiles',
    label: 'ASCII 字符砖块',
    en: 'ASCII Tiles',
    cardTitle: 'ASCII Tiles Background',
    icon: 'ascii-tiles',
    ext: 'ext-asciitiles',
    layerBg: '#000000',
    bgColorKey: 'backgroundColor',
    storeKey: 'code-codex:ascii-tiles-background:v1',
  },
  {
    id: 'shallow-ocean',
    label: '浅海来信',
    en: 'Shallow Ocean Letters',
    cardTitle: 'Shallow Ocean Letters Background',
    icon: 'shallow-ocean',
    ext: 'ext-shallowocean',
    layerBg: '#181818',
    storeKey: 'code-codex:shallow-ocean-background:v1',
  },
  {
    id: 'spectral-drape',
    label: '光谱点阵帷幕',
    en: 'Spectral Drape',
    cardTitle: 'Spectral Drape Background',
    icon: 'spectral-drape',
    ext: 'ext-spectraldrape',
    layerBg: '#0a0a0a',
    bgColorKey: 'backgroundColor',
    storeKey: 'code-codex:spectral-drape-background:v1',
  },
];

export const SCENE_IDS: readonly string[] = SCENES.map((s) => s.id);

export const SCENE_META_MAP: Readonly<Record<string, SceneMeta>> = Object.fromEntries(
  SCENES.map((s) => [s.id, s]),
);

export const GALLERY_SCENES: Readonly<Record<string, boolean>> = {
  'particle-image': true,
  'pixel-sculpt': true,
};

export const STORE_KEYS: Readonly<Record<string, string>> = Object.fromEntries(
  SCENES.map((s) => [s.id, s.storeKey]),
);

export const SCENE_LAYER_BG: Readonly<Record<string, string>> = Object.fromEntries(
  SCENES.map((s) => [s.id, s.layerBg]),
);

export const SURFACE_REGIONS: readonly SurfaceRegionKey[] = [
  'sidebar',
  'conversation',
  'composer',
  'right',
];

export const DEFAULT_SETTINGS: AppearanceSettings = Object.freeze({
  version: 6,
  enabled: true,
  mode: 'scene',
  scene: 'milky-way',
  wallpaperId: null,
  wallpaperFit: 'cover',
  wallpaperPosition: 'center',
  surfaces: Object.freeze({
    enabled: true,
    sidebar: 66,
    conversation: 58,
    composer: 86,
    right: 66,
  }),
  sceneParams: {},
  dim: 0,
  blur: 0,
  savedAt: 0,
});

export const CLAMPS = {
  dim: [0, 0.8] as const,
  blur: [0, 20] as const,
};

export const MEDIA_FILE_RE =
  /^CodeCodex-background-(particle-image|pixel-sculpt)-(image|thumbnail)-[0-9a-f]{16}\.png$/;

export const WALLPAPER_MIMES: Readonly<Record<string, string>> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

export const WALLPAPER_MAX_BYTES = 200 * 1024 * 1024;

export const SHALLOW_OCEAN_CREATURES = [
  ['manta', 'Manta', '蝠鲼'],
  ['eagle', 'Eagle ray', '斑点鹞鲼'],
  ['stingray', 'Stingray', '蓝斑魟'],
  ['turtle', 'Sea turtle', '海龟'],
  ['moon', 'Moon jelly', '海月水母'],
  ['nettle', 'Sea nettle', '黄金水母'],
  ['silver', 'Silver school', '银色鱼群'],
  ['reef', 'Reef fish', '珊瑚鱼'],
  ['clown', 'Clownfish', '小丑鱼'],
  ['shark', 'Reef shark', '礁鲨'],
] as const;

export const SHALLOW_OCEAN_EVENTS = [
  ['school', 'Fish migration', '鱼群过境'],
  ['dolphin', 'Dolphin visit', '海豚来访'],
  ['storm', 'Storm', '风暴'],
  ['meteor', 'Meteor fall', '陨石坠落'],
  ['duo', 'Drifting companions', '漂流伙伴'],
] as const;

export const SHALLOW_OCEAN_PERF_MODES = [
  ['Automatic', '自动'],
  ['Low quality', '低画质'],
  ['Medium quality', '中画质'],
  ['High quality', '高画质'],
] as const;
