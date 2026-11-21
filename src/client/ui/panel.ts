import {
	DEFAULT_SETTINGS,
	SCENES,
	SCENE_IDS,
	WALLPAPER_MAX_BYTES,
} from '../../shared/constants';
import { clamp, finiteNum } from '../../shared/sanitize';
import type {
	AppearanceSettings,
	SceneField,
	SceneParamMap,
	SurfaceRegionKey,
	WallpaperItem,
} from '../../shared/types';
import { apiPostJson, schemaOf, uploadWallpaper } from '../api';
import { getLayer, resolveSceneLayerBg } from '../background/layer';
import { ensurePsEditor, getPsEditor, isPsActive, isPsPaused } from '../background/pixel-sculpt';
import {
	getBgInstance,
	getBgSceneId,
	pushLiveSettings,
	renderScene,
	replayActiveScene,
	writeSceneSetting,
} from '../background/scene-runner';
import { getShallowOceanController } from '../background/shallow-ocean';
import { registry } from '../background/vendor-loader';
import { REGION_ROWS, applySurfaceVars } from '../surfaces/surface-css';
import { draftDeltaObj, escapeHtml, fmtFieldVal, mergeSceneDraft, sanitizeDraft } from './draft';
import { CLOSE_SVG, GEAR_SVG, cardIconMarkup } from './icons';
import {
	bindShallowOceanEvents,
	renderShallowOceanBodyHtml,
	renderShallowOceanHeaderHtml,
} from './shallow-ocean-panel';
import { PANEL_CSS } from './styles';

const PANEL_ID = 'dsh-ap-panel';
const TRIGGER_ID = 'dsh-ap-trigger';
const LIB_PAGE_SIZE = 12;

const PARAM_ROWS = [
	{ key: 'dim' as const, zh: '背景压暗', min: 0, max: 80, step: 1, scale: 100 },
	{ key: 'blur' as const, zh: '背景模糊', min: 0, max: 20, step: 0.5, scale: 1 },
];

interface CardDescriptor {
	id: string;
	kind: 'wallpaper' | 'surface' | 'scene';
	title: string;
	ext: string;
}

const CARD_TITLES: Record<string, string> = {
	'milky-way': 'Milky Way Background',
	'glow-horizon': 'Glow Horizon Background',
	mountain: 'Layered Mountain Background',
	'heavenly-cloud': 'Heavenly Cloud Background',
	'aurora-ionosphere': 'Aurora Ionosphere Background',
	'black-hole': 'Black Hole Background',
	'cloud-train': 'Cloud Train Background',
	'particle-image': 'Particle Image Background',
	'pixel-sculpt': 'Pixel Sculpt Background',
	'blinking-squares': 'Blinking Squares Background',
	'ascii-tiles': 'ASCII Tiles Background',
	'shallow-ocean': 'Shallow Ocean Letters Background',
	'spectral-drape': 'Spectral Drape Background',
};

const SCENE_EXT_CLASSES: Record<string, string> = {
	'glow-horizon': 'ext-glowhorizon',
	'heavenly-cloud': 'ext-heavenlycloud',
	'black-hole': 'ext-blackhole',
	'particle-image': 'ext-particle',
	'shallow-ocean': 'ext-shallowocean',
	'ascii-tiles': 'ext-asciitiles',
	'spectral-drape': 'ext-spectraldrape',
};

const CARDS: CardDescriptor[] = [
	{ id: 'custom', kind: 'wallpaper', title: 'Custom Background', ext: '' },
	{ id: 'surface', kind: 'surface', title: 'UI Surface Opacity', ext: '' },
	...SCENES.map((s) => ({
		id: s.id,
		kind: 'scene' as const,
		title: CARD_TITLES[s.id] || s.en,
		ext: SCENE_EXT_CLASSES[s.id] || '',
	})),
];

const GROUP_LEGENDS: Record<string, string> = {
	particles: '粒子',
	flow: '流动',
	source: '来源',
	pointer: '指针',
	render: '渲染',
	camera: '相机',
	disc: '吸积盘',
	light: '光线',
	input: '输入',
	downward: '下滑动态',
	upward: '上滑动态',
	release: '释放回弹',
	entrance: '开场画面',
	opening: '开场动画',
	interaction: '交互',
};

const FIELD_GROUP_OVERRIDES: Record<string, Record<string, string>> = {
	'heavenly-cloud': { field: '云场', opening: '开场画面' },
	'aurora-ionosphere': { field: '电离层', opening: '开场画面' },
	'milky-way': { field: '运动与形态', opening: '开场画面' },
};

const TUPLE_MAIN_LEGENDS: Record<string, string> = {
	mountain: '山峦与氛围',
	'cloud-train': '列车与云海',
	'blinking-squares': '参数',
};

const TINT_LABELS: Record<string, string> = {
	skyTint: '天空色',
	smokeTint: '烟雾色',
	trainTint: '列车色',
};

const COLOR_SECTION_LEGENDS: Record<string, string> = {
	'milky-way': '五色调色板',
	'glow-horizon': '光效配色',
};

const QUALITY_TOOLBARS: Record<
	string,
	{ mode: 'quality' | 'steps'; items: ReadonlyArray<readonly [string, string, string]> }
> = {
	'milky-way': {
		mode: 'quality',
		items: [
			['low', '1×', '轻量'],
			['medium', '2×', '均衡'],
			['high', '3×', '精细'],
		],
	},
	'heavenly-cloud': {
		mode: 'quality',
		items: [
			['low', '56', '低'],
			['medium', '76', '中'],
			['high', '100', '高'],
		],
	},
	'aurora-ionosphere': {
		mode: 'quality',
		items: [
			['low', '32', '轻量'],
			['medium', '50', '均衡'],
			['high', '72', '精细'],
		],
	},
	mountain: {
		mode: 'steps',
		items: [
			['28', '28', '流畅'],
			['42', '42', '均衡'],
			['57', '57', '完整'],
		],
	},
};

const BH_PRESETS: ReadonlyArray<readonly [string, string]> = [
	['cinema', '电影'],
	['lens', '透镜'],
	['ember', '余烬'],
];

const BLINK_DIRECTIONS: ReadonlyArray<readonly [string, string]> = [
	['right', '右'],
	['left', '左'],
	['top', '上'],
	['bottom', '下'],
];

export interface PanelCallbacks {
	getState: () => AppearanceSettings | null;
	getWallpapers: () => WallpaperItem[];
	setWallpapers: (list: WallpaperItem[]) => void;
	scheduleSave: () => void;
	applyAll: () => void;
	onStatus: (text: string, isError?: boolean) => void;
}

interface UiRefs {
	host: HTMLDivElement;
	shadow: ShadowRoot;
	trigger: HTMLButtonElement;
	market: HTMLDivElement;
	settings: HTMLDivElement;
	cardsWrap: HTMLDivElement;
	emptyNotice: HTMLParagraphElement;
}

let callbacks: PanelCallbacks | null = null;
let ui: UiRefs | null = null;
let marketOpen = false;
let settingsOpen = false;
let settingsId: string | null = null;
let activeCategory: 'all' | 'enabled' | 'custom' = 'all';
let libPage = 0;
let draft: SceneParamMap | null = null;
let draftScene: string | null = null;
let cleanOceanUi: (() => void) | null = null;
let lastRenderedCardIds = '';

export function isSettingsOpen(): boolean {
	return settingsOpen;
}

export function getSettingsId(): string | null {
	return settingsId;
}

export function setPanelStatus(text: string, isError = false): void {
	if (text) console.info('[dsh-ccx]', text);
	if (isError && ui && settingsOpen) {
		const err = ui.settings.querySelector<HTMLElement>('.particle-plugin-error');
		if (err) {
			err.hidden = false;
			err.textContent = text;
		}
	}
}

export function syncPanelTheme(): void {
	if (!ui) return;
	const isDark =
		document.body?.hasAttribute('data-ds-dark-theme') ||
		document.documentElement.classList.contains('dark');
	ui.host.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

export function syncSidebarCollapsed(): void {
	if (!ui) return;
	const sidebarSlot = document.querySelector('[data-slot="sidebar"]');
	const sidebarContainer = sidebarSlot?.parentElement;
	let collapsed = false;
	if (sidebarContainer) {
		const rect = sidebarContainer.getBoundingClientRect();
		collapsed = rect.width < 48 || getComputedStyle(sidebarContainer).display === 'none';
	} else {
		collapsed = true;
	}
	if (collapsed) {
		ui.host.setAttribute('data-sidebar-collapsed', 'true');
	} else {
		ui.host.removeAttribute('data-sidebar-collapsed');
	}
}

function cardEnabled(card: CardDescriptor): boolean {
	const state = callbacks?.getState();
	if (!state) return false;
	if (card.id === 'surface') return Boolean(state.surfaces?.enabled);
	if (!state.enabled) return false;
	if (card.id === 'custom') return state.mode === 'wallpaper';
	return state.mode === 'scene' && state.scene === card.id;
}

function visibleCards(): CardDescriptor[] {
	if (activeCategory === 'all') return CARDS;
	if (activeCategory === 'enabled') return CARDS.filter(cardEnabled);
	return CARDS.filter((c) => c.kind !== 'scene');
}

function renderCardMarkup(card: CardDescriptor, on: boolean): string {
	return (
		`<article class="preview-extension${card.ext ? ` ${card.ext}` : ''}" data-card="${card.id}">` +
		`<span class="preview-extension-icon" aria-hidden="true">${cardIconMarkup(card.id)}</span>` +
		'<div class="preview-extension-copy"><div class="preview-extension-title-row">' +
		`<h4>${escapeHtml(card.title)}</h4>` +
		`<span class="preview-extension-status" data-enabled="${on}">${on ? '已启用' : '未启用'}</span>` +
		'</div></div>' +
		'<div class="preview-extension-actions">' +
		`<button type="button" class="preview-extension-action" data-toggle-card="${card.id}" data-enabled="${on}" aria-pressed="${on}">${on ? '停用' : '启用'}</button>` +
		`<button type="button" class="particle-settings-trigger" data-open-settings="${card.id}" aria-expanded="${settingsOpen && settingsId === card.id}" aria-label="设置 ${escapeHtml(card.title)}" title="设置">${cardIconMarkup('surface').includes('viewBox') ? '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 4h3M9 4h5M2 8h7M13 8h1M2 12h1M7 12h7"/><circle cx="7" cy="4" r="2"/><circle cx="11" cy="8" r="2"/><circle cx="5" cy="12" r="2"/></svg>' : ''}</button>` +
		'</div></article>'
	);
}

export function buildCards(): void {
	if (!ui) return;
	const list = visibleCards();
	const idSig = list.map((c) => c.id).join('|');
	ui.emptyNotice.hidden = list.length > 0;

	if (idSig === lastRenderedCardIds && ui.cardsWrap.childElementCount === list.length) {
		for (const card of list) {
			const el = ui.cardsWrap.querySelector<HTMLElement>(`[data-card="${card.id}"]`);
			if (!el) continue;
			const on = cardEnabled(card);
			const badge = el.querySelector<HTMLElement>('.preview-extension-status');
			if (badge) {
				badge.setAttribute('data-enabled', String(on));
				badge.textContent = on ? '已启用' : '未启用';
			}
			const toggleBtn = el.querySelector<HTMLButtonElement>('[data-toggle-card]');
			if (toggleBtn) {
				toggleBtn.setAttribute('data-enabled', String(on));
				toggleBtn.setAttribute('aria-pressed', String(on));
				toggleBtn.textContent = on ? '停用' : '启用';
			}
			const setBtn = el.querySelector<HTMLButtonElement>('[data-open-settings]');
			if (setBtn) {
				setBtn.setAttribute('aria-expanded', String(settingsOpen && settingsId === card.id));
			}
		}
		return;
	}

	const prevScroll = ui.market.querySelector('.preview-market-list')?.scrollTop || 0;
	ui.cardsWrap.innerHTML = list.map((c) => renderCardMarkup(c, cardEnabled(c))).join('');
	lastRenderedCardIds = idSig;
	const scrollContainer = ui.market.querySelector('.preview-market-list');
	if (scrollContainer && prevScroll > 0) {
		scrollContainer.scrollTop = prevScroll;
	}
}

function groupStart(legendText: string, resetGroupKey?: string): string {
	if (resetGroupKey) {
		return (
			'<fieldset class="particle-settings-group">' +
			'<div class="particle-group-head">' +
			`<span class="particle-group-title">${escapeHtml(legendText)}</span>` +
			`<button type="button" class="particle-group-reset" data-group-reset="${escapeHtml(resetGroupKey)}">重置</button>` +
			'</div>'
		);
	}
	return `<fieldset class="particle-settings-group"><legend>${escapeHtml(legendText)}</legend>`;
}

function rangeRow(f: SceneField, val: number): string {
	return (
		`<div class="particle-control-row"><label for="ccx-f-${f.key}">${escapeHtml(f.zh)}</label>` +
		`<input id="ccx-f-${f.key}" type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${val}" data-field="${f.key}" aria-label="${escapeHtml(f.zh)}">` +
		`<span class="particle-control-value"><output data-fieldval="${f.key}" title="双击直接输入数值">${escapeHtml(fmtFieldVal(f, val))}</output></span></div>`
	);
}

function toggleRow(key: string, zh: string, checked: boolean): string {
	return `<label class="particle-toggle-row">${escapeHtml(zh)}<input type="checkbox" data-toggle="${key}"${checked ? ' checked' : ''}></label>`;
}

function colorRow(key: string, zh: string, val: string): string {
	const clean = /^#[\da-fA-F]{6}$/.test(val || '') ? val : '#ffffff';
	return `<label class="particle-color-row">${escapeHtml(zh)}<input type="color" value="${escapeHtml(clean)}" data-colorkey="${key}"></label>`;
}

const REPLAY_SCENES = new Set([
	'glow-horizon',
	'black-hole',
	'particle-image',
	'ascii-tiles',
	'shallow-ocean',
	'spectral-drape',
]);

function sceneActionsHtml(sceneId: string): string {
	const hasReplay = REPLAY_SCENES.has(sceneId);
	const canReplay = Boolean(getBgInstance() && getBgSceneId() === sceneId) && hasReplay;
	if (!hasReplay) {
		return '<div class="glow-horizon-actions single"><button type="button" data-act="draftreset">重置全部</button></div>';
	}
	return (
		'<div class="glow-horizon-actions">' +
		`<button type="button" data-act="replay"${canReplay ? '' : ' disabled'}>重播开场</button>` +
		'<button type="button" data-act="draftreset">重置全部</button></div>'
	);
}

interface FieldSection {
	group: string;
	legend: string;
	fields: SceneField[];
	resetGroupKey?: string;
}

function sectionsFor(sceneId: string): FieldSection[] {
	const sch = schemaOf(sceneId);
	if (!sch) return [];
	if (Array.isArray(sch.groups) && sch.groups.length > 0) {
		const fMap = new Map((sch.fields || []).map((f) => [f.key, f]));
		return sch.groups.map((g) => ({
			group: g.key,
			legend: g.zh,
			fields: g.keys.map((k) => fMap.get(k)).filter((x): x is SceneField => Boolean(x)),
			resetGroupKey: g.key,
		}));
	}

	const groups: FieldSection[] = [];
	const byKey: Record<string, FieldSection> = {};
	const ov = FIELD_GROUP_OVERRIDES[sceneId] || {};
	for (const f of sch.fields || []) {
		const gk = f.group || '_';
		if (!byKey[gk]) {
			const legend = ov[gk] || GROUP_LEGENDS[gk] || TUPLE_MAIN_LEGENDS[sceneId] || '参数';
			byKey[gk] = { group: gk, legend, fields: [] };
			groups.push(byKey[gk]);
		}
		byKey[gk].fields.push(f);
	}
	return groups;
}

function galleryHtml(sceneId: string): string {
	const win = window as unknown as Record<symbol, Map<string, { images?: Map<string, { id: string; name?: string; type?: string; thumbnail?: string }> }> | undefined>;
	const gReg = win[Symbol.for('code-codex:default-galleries:v1')];
	const meta = gReg?.get(sceneId);
	const count = meta?.images?.size ?? 0;
	let items = '';
	if (meta?.images) {
		meta.images.forEach((img) => {
			const thumb = img.thumbnail
				? `<img loading="lazy" src="data:${img.type || 'image/png'};base64,${img.thumbnail}" alt="">`
				: '<span class="vthumb">🖼</span>';
			items += `<span class="wallitem"><span class="wpick">${thumb}<span class="wname">${escapeHtml(img.name || img.id)}</span></span></span>`;
		});
	}
	return (
		'<details class="particle-source-details" open><summary class="particle-source-summary">图片库' +
		`<span class="particle-source-count">${count} 个已保存</span></summary>` +
		`<div class="particle-library-grid">${items || '<p class="particle-library-empty">图库尚未就绪，启用场景后自动载入默认图。</p>'}</div>` +
		'</details>'
	);
}

function sceneSettingsHtml(sceneId: string): string {
	const sch = schemaOf(sceneId);
	const d = draft || {};
	const state = callbacks?.getState() || null;

	if (sceneId === 'shallow-ocean') {
		if (!sch) return '<div class="particle-settings-scroll"><p class="panel-note">场景 schema 尚未加载…</p></div>';
		const active = Boolean(state && state.enabled && state.mode === 'scene' && state.scene === 'shallow-ocean');
		return renderShallowOceanBodyHtml(sch, d, active);
	}

	let html = '<div class="particle-settings-scroll">';
	const inlineToggles: Record<string, boolean> = {};

	if (sceneId === 'pixel-sculpt') {
		const active = isPsActive(state);
		const paused = isPsPaused(state);
		const ps = getPsEditor();
		html += `<p class="pixelSculpt-disabled" data-psnote${active ? ' hidden' : ''}>插件尚未启用；这里的设置会在下次启用时生效。</p>`;
		html += '<div class="pixelSculpt-controls-host" data-pshost></div>';
		html += `<label class="particle-toggle-row pixelSculpt-paused-row">暂停动画<input type="checkbox" data-toggle="__pspaused"${paused ? ' checked' : ''}${active ? '' : ' disabled'}></label>`;
		html += `<div class="glow-horizon-actions single pixelSculpt-actions"><button type="button" data-act="psreset"${ps?.inst ? '' : ' disabled'}>重置参数</button></div>`;
		html += '<p class="particle-plugin-error" role="status" hidden></p></div>';
		return html;
	}

	if (!sch) {
		return '<div class="particle-settings-scroll"><p class="panel-note">场景 schema 尚未加载…</p></div>';
	}

	if (sceneId === 'blinking-squares') {
		html += groupStart('渐隐方向');
		html += '<div class="heavenly-cloud-quality-toolbar dir4" role="group" aria-label="渐隐方向">';
		for (const [val, zh] of BLINK_DIRECTIONS) {
			html += `<button type="button" data-blinkdir="${val}" aria-pressed="${(d.direction || 'right') === val}">${zh}</button>`;
		}
		html += '</div></fieldset>';
		const bl = sch.fields;
		html += groupStart('方块与闪烁');
		for (let i = 0; i < Math.min(10, bl.length); i++) html += rangeRow(bl[i], finiteNum(d[bl[i].key], bl[i].min));
		html += '</fieldset>';
		html += groupStart('交互与脉冲');
		for (let i = 10; i < Math.min(20, bl.length); i++) html += rangeRow(bl[i], finiteNum(d[bl[i].key], bl[i].min));
		html += toggleRow('mouseInteraction', '鼠标交互', Boolean(d.mouseInteraction));
		html += toggleRow('keyboardInteraction', '键盘随机波纹', Boolean(d.keyboardInteraction));
		for (let i = 20; i < Math.min(22, bl.length); i++) html += rangeRow(bl[i], finiteNum(d[bl[i].key], bl[i].min));
		html += '</fieldset>';
		html += groupStart('开场与画质');
		for (let i = 22; i < bl.length; i++) html += rangeRow(bl[i], finiteNum(d[bl[i].key], bl[i].min));
		html += toggleRow('introEnabled', '启用开场', Boolean(d.introEnabled));
		html += toggleRow('paused', '暂停动画', Boolean(d.paused));
		html += '</fieldset>';
		html += groupStart('颜色');
		for (const cf of sch.colorFields || []) {
			html += colorRow(cf.key, cf.zh, String(d[cf.key] || sch.defaults[cf.key] || '#ffffff'));
		}
		html += '</fieldset>';
		html += sceneActionsHtml(sceneId);
		html += '<p class="particle-plugin-error" role="status" hidden></p></div>';
		return html;
	}

	if (sceneId === 'black-hole') {
		html += '<div class="black-hole-preset-toolbar" role="group" aria-label="黑洞场景预设">';
		for (const [id, zh] of BH_PRESETS) {
			html += `<button type="button" data-bhpreset="${id}">${zh}</button>`;
		}
		html += '<button type="button" class="black-hole-reset" data-act="draftreset">重置</button></div>';
	}

	if (sceneId === 'glow-horizon') {
		html += '<div class="glow-horizon-direction-toolbar" role="group" aria-label="地平线方向">';
		const dirs: Array<[string, string, string]> = [
			['top', '↑', '上'],
			['bottom', '↓', '下'],
			['left', '←', '左'],
			['right', '→', '右'],
		];
		for (const [id, sym, zh] of dirs) {
			html += `<button type="button" data-direction="${id}" aria-pressed="${d.variant === id}"><span class="glow-horizon-direction-symbol">${sym}</span>${zh}</button>`;
		}
		html += '</div>';
	}

	const qt = QUALITY_TOOLBARS[sceneId];
	const qualityGroupHtml = () => {
		if (!qt) return '';
		let out = groupStart('渲染质量');
		out += '<div class="heavenly-cloud-quality-toolbar" role="group" aria-label="渲染质量">';
		for (const [val, badge, zh] of qt.items) {
			const cur =
				qt.mode === 'steps'
					? String(finiteNum(d.steps, 57))
					: String(d.quality || sch.qualityDefault || 'high');
			out += `<button type="button" data-${qt.mode}="${val}" aria-pressed="${cur === val}"><strong>${badge}</strong>${zh}</button>`;
		}
		out += '</div>';
		if (qt.mode === 'steps') {
			const resField = sch.fields.find((f) => f.key === 'resolution');
			if (resField) out += rangeRow(resField, finiteNum(d.resolution, resField.min));
		}
		return `${out}</fieldset>`;
	};

	if (qt && sceneId !== 'mountain') html += qualityGroupHtml();

	const sections = sectionsFor(sceneId);
	if (sceneId === 'mountain' && sections.length) {
		sections[0].fields = sections[0].fields.filter((f) => f.key !== 'resolution');
	}

	const groupSchemasByKey = new Map((sch.groups || []).map((g) => [g.key, g]));
	const toggleByKey = new Map((sch.toggles || []).map((t) => [t.key, t]));
	const colorFieldByKey = new Map((sch.colorFields || []).map((c) => [c.key, c]));

	for (const sec of sections) {
		html += groupStart(sec.legend, sec.resetGroupKey);
		for (const f of sec.fields) {
			html += rangeRow(f, finiteNum(d[f.key], f.min));
		}

		// Schemas with explicit groups (`ascii-tiles`, `spectral-drape`) place color/toggle controls inside matching groups
		const gDef = groupSchemasByKey.get(sec.group);
		if (gDef) {
			for (const key of gDef.keys) {
				const cf = colorFieldByKey.get(key);
				if (cf) {
					html += colorRow(cf.key, cf.zh, String(d[cf.key] || sch.defaults[cf.key] || '#ffffff'));
				}
				const tg = toggleByKey.get(key);
				if (tg) {
					inlineToggles[tg.key] = true;
					html += toggleRow(tg.key, tg.zh, Boolean(d[tg.key]));
				}
			}
		}

		if (sceneId === 'black-hole' && sec.group === 'light') {
			for (const cf of sch.colorFields || []) {
				html += colorRow(cf.key, cf.zh, String(d[cf.key] || sch.defaults[cf.key] || '#ffffff'));
			}
		}
		if (sceneId === 'black-hole' && sec.group === 'renderer') {
			html += toggleRow('paused', '暂停动画', Boolean(d.paused));
			inlineToggles.paused = true;
		}
		if (sceneId === 'glow-horizon' && sec.group === 'input') {
			html += toggleRow('inertialWheel', '滚轮惯性', Boolean(d.inertialWheel));
			inlineToggles.inertialWheel = true;
		}
		if (sceneId === 'particle-image' && sec.group === 'source') {
			html += galleryHtml(sceneId);
			html += colorRow('backgroundColor', '背景', String(d.backgroundColor || '#000000'));
			html += toggleRow('autoSwitch', '自动切换', d.autoSwitch !== false);
			inlineToggles.autoSwitch = true;
		}
		if (sceneId === 'particle-image' && sec.group === 'opening') {
			html += toggleRow('introEnabled', '粒子汇聚', Boolean(d.introEnabled));
			inlineToggles.introEnabled = true;
			const replayDisabled = !(getBgInstance() && getBgSceneId() === sceneId);
			html += `<button type="button" class="particle-library-add" data-act="replay" style="margin:2px 4px 0;justify-self:start"${replayDisabled ? ' disabled' : ''}>重播开场</button>`;
		}
		if (sceneId === 'particle-image' && sec.group === 'pointer') {
			html += toggleRow('cursorInteraction', '鼠标交互', Boolean(d.cursorInteraction));
			inlineToggles.cursorInteraction = true;
		}
		if (sceneId === 'cloud-train') {
			for (const cf of sch.colorFields || []) {
				html += colorRow(cf.key, TINT_LABELS[cf.key] || cf.zh, String(d[cf.key] || '#ffffff'));
			}
		}
		html += '</fieldset>';
	}

	if (qt && sceneId === 'mountain') html += qualityGroupHtml();

	const sortedToggles = [...(sch.toggles || [])].sort(
		(a, b) => (a.key === 'paused' ? -1 : 0) - (b.key === 'paused' ? -1 : 0),
	);
	for (const tg of sortedToggles) {
		if (inlineToggles[tg.key]) continue;
		if (sceneId === 'particle-image' && tg.key === 'showSourceImage') {
			html += toggleRow('showSourceImage', '显示源图', d.showSourceImage !== false);
			continue;
		}
		html += toggleRow(tg.key, tg.zh, Boolean(d[tg.key]));
	}

	if (sch.colors) {
		html += groupStart(COLOR_SECTION_LEGENDS[sceneId] || '颜色');
		const cols = Array.isArray(d.colors) && d.colors.length === sch.colors.length ? d.colors : sch.colors;
		for (let i = 0; i < sch.colors.length; i++) {
			html += colorRow(`color${i}`, `颜色 ${i + 1}`, String(cols[i] || sch.colors[i]));
		}
		html += '</fieldset>';
	}

	html += sceneActionsHtml(sceneId);
	html += '<p class="particle-plugin-error" role="status" hidden></p></div>';
	return html;
}

function customSettingsHtml(): string {
	const state = callbacks?.getState();
	const wallpapers = callbacks?.getWallpapers() || [];
	const pages = Math.max(1, Math.ceil(wallpapers.length / LIB_PAGE_SIZE));
	if (libPage >= pages) libPage = pages - 1;
	const slice = wallpapers.slice(libPage * LIB_PAGE_SIZE, (libPage + 1) * LIB_PAGE_SIZE);

	const items = slice
		.map((w) => {
			const isVideo = /^video\//.test(w.mime || '');
			const thumb = isVideo
				? '<span class="vthumb">▶</span>'
				: `<img loading="lazy" src="${escapeHtml(w.url)}" alt="">`;
			const selected = state && w.id === state.wallpaperId ? ' on' : '';
			return (
				`<span class="wallitem${selected}">` +
				`<button type="button" class="wpick" data-wall="${escapeHtml(w.id)}" title="${escapeHtml(w.name)}">${thumb}<span class="wname">${escapeHtml(w.name)}</span></button>` +
				`<button type="button" class="wdel" data-wdel="${escapeHtml(w.id)}" title="删除" aria-label="删除 ${escapeHtml(w.name)}">✕</button></span>`
			);
		})
		.join('');

	const pagerHtml =
		pages > 1
			? '<div class="wall-pager">' +
				`<button type="button" data-wallpage="prev"${libPage <= 0 ? ' disabled' : ''}>‹</button>` +
				`<output>${libPage + 1} / ${pages}</output>` +
				`<button type="button" data-wallpage="next"${libPage >= pages - 1 ? ' disabled' : ''}>›</button>` +
				'</div>'
			: '';

	const posOptions = [
		['center', '居中'],
		['top', '顶部'],
		['bottom', '底部'],
		['left', '左侧'],
		['right', '右侧'],
	];

	return (
		'<div class="particle-settings-scroll">' +
		'<details class="particle-source-details" open><summary class="particle-source-summary">图片库' +
		`<span class="particle-source-count">${wallpapers.length} 个已保存</span></summary>` +
		'<div class="particle-library-toolbar"><span class="particle-library-add" data-act="wallimport">添加图片' +
		'<input type="file" data-act="wallfile" accept="image/*,video/mp4,video/webm" hidden></span>' +
		`<button type="button" class="particle-library-clear" data-act="wallclear"${wallpapers.length ? '' : ' disabled'}>清空</button></div>` +
		`<div class="particle-library-grid">${items || '<p class="particle-library-empty">还没有壁纸，点「添加图片」导入图片或视频。</p>'}</div>` +
		pagerHtml +
		'</details>' +
		groupStart('素材属性') +
		'<div class="particle-control-row"><label for="ccx-fit">画面适配</label>' +
		'<select id="ccx-fit" data-act="fit">' +
		`<option value="cover"${state?.wallpaperFit === 'cover' ? ' selected' : ''}>铺满</option>` +
		`<option value="contain"${state?.wallpaperFit === 'contain' ? ' selected' : ''}>完整显示</option>` +
		`<option value="tile"${state?.wallpaperFit === 'tile' ? ' selected' : ''}>平铺</option></select>` +
		'<span class="particle-control-value"></span></div>' +
		'<div class="particle-control-row"><label for="ccx-pos">位置</label>' +
		'<select id="ccx-pos" data-act="pos">' +
		posOptions
			.map(
				([v, label]) =>
					`<option value="${v}"${state?.wallpaperPosition === v ? ' selected' : ''}>${label}</option>`,
			)
			.join('') +
		'</select><span class="particle-control-value"></span></div>' +
		'</fieldset>' +
		'<div class="glow-horizon-actions single"><button type="button" data-act="customreset">重置参数</button></div>' +
		'<p class="particle-plugin-error" role="status" hidden></p></div>'
	);
}

function surfaceSettingsHtml(): string {
	const state = callbacks?.getState();
	let html = '<div class="particle-settings-scroll">';
	html += '<p class="panel-note">只调节底色，文字和图标保持清晰。0% 完全透明，100% 完全遮挡背景。</p>';
	html += groupStart('分区不透明度');
	for (const r of REGION_ROWS) {
		const v = clamp(finiteNum(state?.surfaces?.[r.key], DEFAULT_SETTINGS.surfaces[r.key]), 0, 100);
		html +=
			`<div class="particle-control-row surface-opacity-row"><label for="ccx-r-${r.key}">${escapeHtml(r.zh)}</label>` +
			`<input id="ccx-r-${r.key}" type="range" min="0" max="100" step="1" value="${v}" data-region="${r.key}" aria-label="${escapeHtml(r.zh)}">` +
			`<span class="particle-control-value"><output data-regionval="${r.key}" title="双击直接输入数值">${Math.round(v)}%</output></span>` +
			`<button type="button" data-rowreset="${r.key}" title="恢复此项默认值" aria-label="恢复${escapeHtml(r.zh)}默认值">↺</button></div>`;
	}
	html += '</fieldset>';
	html += groupStart('背景调节');
	for (const row of PARAM_ROWS) {
		const vv = finiteNum(state?.[row.key], DEFAULT_SETTINGS[row.key]) * row.scale;
		const formatted = row.scale === 100 ? `${Math.round(vv)}%` : `${vv.toFixed(1)}px`;
		html +=
			`<div class="particle-control-row"><label for="ccx-p-${row.key}">${row.zh}</label>` +
			`<input id="ccx-p-${row.key}" type="range" min="${row.min}" max="${row.max}" step="${row.step}" value="${vv}" data-slider="${row.key}" aria-label="${row.zh}">` +
			`<span class="particle-control-value"><output data-sliderval="${row.key}" title="双击直接输入数值">${formatted}</output></span></div>`;
	}
	html += '</fieldset>';
	html += '<button type="button" class="particle-library-clear" data-act="surfacereset" style="justify-self:stretch;margin:0">恢复全部默认值</button>';
	html += '<p class="particle-plugin-error" role="status" hidden></p></div>';
	return html;
}

function mountPsControls(): void {
	const state = callbacks?.getState() || null;
	if (!ui || !settingsOpen || settingsId !== 'pixel-sculpt') return;
	ensurePsEditor(() => callbacks?.getState() || null, setPanelStatus)
		.then((ed) => {
			if (!ui || !settingsOpen || settingsId !== 'pixel-sculpt') return;
			const host = ui.settings.querySelector<HTMLElement>('[data-pshost]');
			if (host && ed.inst) {
				try {
					ed.inst.mountControls(host, 'zh');
				} catch {
					// Ignore
				}
			}
			syncPsPanel(state);
		})
		.catch((err) => {
			setPanelStatus(`Pixel Sculpt 设置加载失败：${String((err as Error)?.message || err).slice(0, 50)}`, true);
		});
}

export function syncPsPanel(state: AppearanceSettings | null): void {
	if (!ui || !settingsOpen || settingsId !== 'pixel-sculpt') return;
	const active = isPsActive(state);
	const note = ui.settings.querySelector<HTMLElement>('[data-psnote]');
	if (note) note.hidden = active;
	const pausedEl = ui.settings.querySelector<HTMLInputElement>('[data-toggle="__pspaused"]');
	if (pausedEl) {
		pausedEl.checked = isPsPaused(state);
		pausedEl.disabled = !active;
	}
	const rst = ui.settings.querySelector<HTMLButtonElement>('[data-act="psreset"]');
	if (rst) rst.disabled = !getPsEditor()?.inst;
}

function commitLive(sceneId: string): void {
	const state = callbacks?.getState();
	if (!state || !draft || draftScene !== sceneId) return;
	const sch = schemaOf(sceneId);
	const dd = draftDeltaObj(sch, draft);
	if (Object.keys(dd.delta).length > 0) {
		state.sceneParams[sceneId] = dd.delta;
	} else {
		delete state.sceneParams[sceneId];
	}
	writeSceneSetting(sceneId, dd.full);
	callbacks?.scheduleSave();

	const layer = getLayer()?.layer;
	if (
		layer &&
		(sceneId === 'particle-image' ||
			sceneId === 'blinking-squares' ||
			sceneId === 'ascii-tiles' ||
			sceneId === 'spectral-drape')
	) {
		layer.style.setProperty('--ap-layer-bg', resolveSceneLayerBg(sceneId, state));
	}

	let pushed = false;
	const inst = getBgInstance();
	if (state.enabled && state.mode === 'scene' && state.scene === sceneId && inst && getBgSceneId() === sceneId) {
		pushed = pushLiveSettings(inst, dd.full);
	}
	if (!pushed && state.enabled && state.mode === 'scene' && state.scene === sceneId && callbacks) {
		renderScene({
			getState: callbacks.getState,
			onStatus: setPanelStatus,
		});
	}
}

export function renderSettings(id: string): void {
	if (!ui || !callbacks) return;
	const state = callbacks.getState();
	const isScene = SCENE_IDS.includes(id);

	if (id === 'shallow-ocean') {
		ui.settings.classList.add('shallow-ocean-panel');
	} else {
		ui.settings.classList.remove('shallow-ocean-panel');
	}

	if (isScene) {
		if (!draftScene || draftScene !== id) {
			draft = mergeSceneDraft(schemaOf(id), state?.sceneParams?.[id]);
			draftScene = id;
		}
	}

	const bodyHtml = !isScene
		? id === 'custom'
			? customSettingsHtml()
			: surfaceSettingsHtml()
		: sceneSettingsHtml(id);

	const headerHtml =
		id === 'shallow-ocean'
			? renderShallowOceanHeaderHtml(
					finiteNum(draft?.performanceMode, 0),
					getShallowOceanController().developerMode,
					CLOSE_SVG,
				)
			: '<header class="particle-settings-header"><div class="particle-settings-heading">' +
				`<p>外观</p><h3>${escapeHtml(CARD_TITLES[id] || (id === 'custom' ? 'Custom Background' : 'UI Surface Opacity'))}</h3></div>` +
				`<div class="particle-settings-header-actions"><button class="particle-settings-close" type="button" data-act="settingsclose" title="关闭设置 (Esc)" aria-label="关闭设置">${CLOSE_SVG}</button></div></header>`;

	ui.settings.innerHTML = headerHtml + bodyHtml;

	if (id === 'pixel-sculpt') {
		mountPsControls();
	}
}

export function positionSettingsPanel(): void {
	if (!ui || !settingsOpen) return;
	const marketRect = ui.market.getBoundingClientRect();
	const panel = ui.settings;
	const edge = 12;
	const w = panel.getBoundingClientRect().width || (settingsId === 'shallow-ocean' ? 680 : 352);
	let left = marketRect.right + 10;
	if (left + w + edge > window.innerWidth) {
		left = Math.max(edge, window.innerWidth - w - edge);
	}
	const triggerBtn = settingsId
		? ui.market.querySelector<HTMLElement>(`[data-open-settings="${settingsId}"]`)
		: null;
	const anchorY = triggerBtn
		? triggerBtn.getBoundingClientRect().top + triggerBtn.getBoundingClientRect().height / 2
		: marketRect.top + 36;
	const h = panel.getBoundingClientRect().height || 380;
	const top = clamp(anchorY - 28, edge, Math.max(edge, window.innerHeight - h - edge));

	panel.style.left = `${Math.round(left)}px`;
	panel.style.top = `${Math.round(top)}px`;
	panel.style.setProperty('--cle-anchor-y', `${Math.round(clamp(anchorY - top, 20, Math.max(20, h - 20)))}px`);
	panel.setAttribute('data-side', 'right');
}

function closeSettings(): void {
	if (!ui) return;
	settingsOpen = false;
	settingsId = null;
	draft = null;
	draftScene = null;
	ui.settings.hidden = true;
	buildCards();
}

function openSettings(id: string): void {
	if (!ui) return;
	if (settingsOpen && settingsId === id) {
		closeSettings();
		return;
	}
	settingsOpen = true;
	settingsId = id;
	draftScene = null;
	draft = null;
	renderSettings(id);
	ui.settings.hidden = false;
	positionSettingsPanel();
	buildCards();
}

function closeMarket(): void {
	if (!ui) return;
	marketOpen = false;
	ui.market.hidden = true;
	ui.trigger.setAttribute('aria-expanded', 'false');
	closeSettings();
}

function toggleMarket(): void {
	if (!ui) return;
	marketOpen = !marketOpen;
	ui.market.hidden = !marketOpen;
	ui.trigger.setAttribute('aria-expanded', String(marketOpen));
	if (marketOpen) {
		syncPanelTheme();
		syncSidebarCollapsed();
		buildCards();
	} else {
		closeSettings();
	}
}

function openInlineValueEditor(outputEl: HTMLElement): void {
	const row = outputEl.closest('.particle-control-row');
	const rangeInput = row?.querySelector<HTMLInputElement>('input[type="range"]');
	if (!rangeInput) return;

	const isPercentText = outputEl.textContent?.includes('%') ?? false;
	const fieldKey = outputEl.dataset.fieldval;
	const field = fieldKey && draftScene ? schemaOf(draftScene)?.fields.find((f) => f.key === fieldKey) : null;
	const isPercentField = Boolean(field?.percent) || isPercentText;

	const minVal = isPercentField && Number(rangeInput.max) <= 1 ? Number(rangeInput.min) * 100 : Number(rangeInput.min);
	const maxVal = isPercentField && Number(rangeInput.max) <= 1 ? Number(rangeInput.max) * 100 : Number(rangeInput.max);
	const curVal =
		isPercentField && Number(rangeInput.max) <= 1
			? Math.round(Number(rangeInput.value) * 100)
			: Number(rangeInput.value);

	const editor = document.createElement('input');
	editor.type = 'number';
	editor.className = 'particle-value-editor';
	editor.min = String(minVal);
	editor.max = String(maxVal);
	editor.step = isPercentField && Number(rangeInput.max) <= 1 ? '1' : rangeInput.step || 'any';
	editor.value = String(curVal);

	outputEl.hidden = true;
	outputEl.parentElement?.appendChild(editor);
	editor.focus();
	editor.select();

	let committed = false;
	const finish = (apply: boolean) => {
		if (committed) return;
		committed = true;
		if (apply) {
			const parsed = Number(editor.value);
			if (Number.isFinite(parsed)) {
				const rawRangeVal =
					isPercentField && Number(rangeInput.max) <= 1 ? parsed / 100 : parsed;
				const clamped = clamp(rawRangeVal, Number(rangeInput.min), Number(rangeInput.max));
				rangeInput.value = String(clamped);
				rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
			}
		}
		editor.remove();
		outputEl.hidden = false;
	};

	editor.addEventListener('keydown', (ev) => {
		if (ev.key === 'Enter') {
			ev.preventDefault();
			finish(true);
		} else if (ev.key === 'Escape') {
			ev.preventDefault();
			finish(false);
		}
	});
	editor.addEventListener('blur', () => finish(true));
}

function toggleCardActivation(cardId: string): void {
	const state = callbacks?.getState();
	if (!state || !callbacks) return;

	if (cardId === 'surface') {
		state.surfaces.enabled = !state.surfaces.enabled;
	} else if (cardId === 'custom') {
		const isCurrentlyWallpaper = state.enabled && state.mode === 'wallpaper';
		if (isCurrentlyWallpaper) {
			state.enabled = false;
		} else {
			state.enabled = true;
			state.mode = 'wallpaper';
		}
	} else {
		const isCurrentScene = state.enabled && state.mode === 'scene' && state.scene === cardId;
		if (isCurrentScene) {
			state.enabled = false;
		} else {
			state.enabled = true;
			state.mode = 'scene';
			state.scene = cardId;
		}
	}

	callbacks.scheduleSave();
	callbacks.applyAll();
	if (settingsOpen && settingsId === 'shallow-ocean') {
		renderSettings('shallow-ocean');
	}
}

function onDocClick(e: MouseEvent): void {
	if (!ui || (!marketOpen && !settingsOpen)) return;
	const path = e.composedPath ? e.composedPath() : [];
	if (path.includes(ui.host)) return;
	closeMarket();
}

function onDocKey(e: KeyboardEvent): void {
	if (e.key !== 'Escape') return;
	if (settingsOpen) {
		closeSettings();
		return;
	}
	if (marketOpen) closeMarket();
}

function bindEvents(): void {
	if (!ui) return;
	const { trigger, market, settings, shadow } = ui;

	trigger.addEventListener('click', (e) => {
		e.stopPropagation();
		toggleMarket();
	});

	market.addEventListener('click', (e) => {
		const t = e.target as Element;
		if (t.closest('[data-act="marketclose"]')) {
			closeMarket();
			return;
		}
		const catBtn = t.closest<HTMLButtonElement>('[data-cat]');
		if (catBtn && catBtn.dataset.cat) {
			activeCategory = catBtn.dataset.cat as 'all' | 'enabled' | 'custom';
			const tabs = market.querySelectorAll<HTMLButtonElement>('[data-cat]');
			for (let i = 0; i < tabs.length; i++) {
				tabs[i].setAttribute('aria-selected', String(tabs[i] === catBtn));
			}
			buildCards();
			return;
		}
		const tog = t.closest<HTMLButtonElement>('[data-toggle-card]');
		if (tog?.dataset.toggleCard) {
			toggleCardActivation(tog.dataset.toggleCard);
			return;
		}
		const openBtn = t.closest<HTMLButtonElement>('[data-open-settings]');
		if (openBtn?.dataset.openSettings) {
			openSettings(openBtn.dataset.openSettings);
		}
	});

	settings.addEventListener('dblclick', (e) => {
		const out = (e.target as Element).closest<HTMLElement>('output');
		if (out && out.closest('.particle-control-value')) {
			openInlineValueEditor(out);
		}
	});

	settings.addEventListener('click', (e) => {
		const t = e.target as Element;
		const state = callbacks?.getState();
		if (!state || !callbacks) return;

		if (t.closest('[data-act="settingsclose"]')) {
			closeSettings();
			return;
		}

		if (t.closest('[data-act="psreset"]')) {
			const ps = getPsEditor();
			if (ps?.inst) {
				try {
					ps.inst.reset();
				} catch {
					// Ignore
				}
				delete state.sceneParams['pixel-sculpt'];
				writeSceneSetting('pixel-sculpt', { paused: false });
				callbacks.scheduleSave();
				syncPsPanel(state);
				setPanelStatus('Pixel Sculpt 参数已重置');
			}
			return;
		}

		const groupResetBtn = t.closest<HTMLButtonElement>('[data-group-reset]');
		if (groupResetBtn && draftScene && draft) {
			const gk = groupResetBtn.dataset.groupReset;
			const sch = schemaOf(draftScene);
			const g = sch?.groups?.find((x) => x.key === gk);
			if (sch && g) {
				for (const key of g.keys) {
					if (key in sch.defaults) draft[key] = sch.defaults[key];
				}
				draft = sanitizeDraft(sch, draft);
				renderSettings(draftScene);
				commitLive(draftScene);
			}
			return;
		}

		if (t.closest('[data-act="draftreset"]')) {
			if (!draftScene) return;
			const sch = schemaOf(draftScene);
			draft = sch?.defaults ? sanitizeDraft(sch, sch.defaults) : {};
			if (draftScene === 'shallow-ocean') {
				getShallowOceanController().resetPopulation();
			}
			renderSettings(draftScene);
			commitLive(draftScene);
			return;
		}

		if (t.closest('[data-act="replay"]')) {
			if (draftScene) replayActiveScene(draftScene);
			return;
		}

		if (t.closest('[data-act="surfacereset"]')) {
			state.surfaces = { ...DEFAULT_SETTINGS.surfaces };
			state.dim = DEFAULT_SETTINGS.dim;
			state.blur = DEFAULT_SETTINGS.blur;
			callbacks.scheduleSave();
			callbacks.applyAll();
			renderSettings('surface');
			return;
		}

		if (t.closest('[data-act="customreset"]')) {
			state.wallpaperFit = DEFAULT_SETTINGS.wallpaperFit;
			state.wallpaperPosition = DEFAULT_SETTINGS.wallpaperPosition;
			callbacks.scheduleSave();
			callbacks.applyAll();
			renderSettings('custom');
			return;
		}

		const rr = t.closest<HTMLElement>('[data-rowreset]');
		if (rr?.dataset.rowreset) {
			const rk = rr.dataset.rowreset as SurfaceRegionKey;
			const dflt = clamp(finiteNum(DEFAULT_SETTINGS.surfaces[rk], 66), 0, 100);
			state.surfaces[rk] = dflt;
			const rin = settings.querySelector<HTMLInputElement>(`[data-region="${rk}"]`);
			if (rin) rin.value = String(dflt);
			const rout = settings.querySelector<HTMLElement>(`[data-regionval="${rk}"]`);
			if (rout) rout.textContent = `${Math.round(dflt)}%`;
			applySurfaceVars(state, getLayer()?.layer || null);
			callbacks.scheduleSave();
			return;
		}

		const qBtn = t.closest<HTMLElement>('[data-quality]');
		if (qBtn?.dataset.quality && draft && draftScene) {
			draft.quality = qBtn.dataset.quality;
			renderSettings(draftScene);
			commitLive(draftScene);
			return;
		}

		const stepsBtn = t.closest<HTMLElement>('[data-steps]');
		if (stepsBtn?.dataset.steps && draft && draftScene) {
			draft.steps = Number(stepsBtn.dataset.steps);
			renderSettings(draftScene);
			commitLive(draftScene);
			return;
		}

		const dirBtn = t.closest<HTMLElement>('[data-direction]');
		if (dirBtn?.dataset.direction && draft && draftScene) {
			draft.variant = dirBtn.dataset.direction;
			renderSettings(draftScene);
			commitLive(draftScene);
			return;
		}

		const blinkDir = t.closest<HTMLElement>('[data-blinkdir]');
		if (blinkDir?.dataset.blinkdir && draft && draftScene) {
			draft.direction = blinkDir.dataset.blinkdir;
			renderSettings(draftScene);
			commitLive(draftScene);
			return;
		}

		const bhPreset = t.closest<HTMLElement>('[data-bhpreset]');
		if (bhPreset?.dataset.bhpreset && draft && draftScene) {
			const sch = schemaOf(draftScene);
			const pVals = sch?.presets?.[bhPreset.dataset.bhpreset];
			if (pVals) {
				draft = sanitizeDraft(sch, { ...draft, ...pVals });
				renderSettings(draftScene);
				commitLive(draftScene);
			}
			return;
		}

		const wPageBtn = t.closest<HTMLButtonElement>('[data-wallpage]');
		if (wPageBtn?.dataset.wallpage) {
			libPage += wPageBtn.dataset.wallpage === 'prev' ? -1 : 1;
			renderSettings('custom');
			return;
		}

		if (t.closest('[data-act="wallimport"]')) {
			settings.querySelector<HTMLInputElement>('[data-act="wallfile"]')?.click();
			return;
		}

		if (t.closest('[data-act="wallclear"]')) {
			void apiPostJson<{ ok?: boolean }>('/wallpaper-clear.json', {})
				.then((r) => {
					if (!r?.ok) return;
					callbacks?.setWallpapers([]);
					libPage = 0;
					state.wallpaperId = null;
					if (state.mode === 'wallpaper') state.enabled = false;
					callbacks?.scheduleSave();
					callbacks?.applyAll();
					renderSettings('custom');
				})
				.catch((err) => setPanelStatus(`清空失败：${String(err)}`, true));
			return;
		}

		const wPick = t.closest<HTMLElement>('[data-wall]');
		if (wPick?.dataset.wall) {
			state.wallpaperId = wPick.dataset.wall;
			state.mode = 'wallpaper';
			state.enabled = true;
			callbacks.scheduleSave();
			callbacks.applyAll();
			renderSettings('custom');
			return;
		}

		const wDel = t.closest<HTMLElement>('[data-wdel]');
		if (wDel?.dataset.wdel) {
			const id = wDel.dataset.wdel;
			void apiPostJson<{ ok?: boolean; wallpapers?: WallpaperItem[] }>('/wallpaper-delete.json', { id })
				.then((r) => {
					if (!r?.ok) return;
					callbacks?.setWallpapers(r.wallpapers || []);
					if (state.wallpaperId === id) {
						state.wallpaperId = r.wallpapers?.[0]?.id || null;
					}
					callbacks?.scheduleSave();
					callbacks?.applyAll();
					renderSettings('custom');
				})
				.catch((err) => setPanelStatus(`删除失败：${String(err)}`, true));
		}
	});

	settings.addEventListener('input', (e) => {
		const t = e.target as HTMLInputElement;
		const state = callbacks?.getState();
		if (!t || !state || !callbacks) return;

		if (t.dataset.field && draft && draftScene) {
			const k = t.dataset.field;
			const v = Number(t.value);
			draft[k] = v;
			const f = schemaOf(draftScene)?.fields.find((item) => item.key === k);
			const out = settings.querySelector<HTMLElement>(`[data-fieldval="${k}"]`);
			if (out) out.textContent = f ? fmtFieldVal(f, v) : String(v);
			commitLive(draftScene);
			return;
		}

		if (t.dataset.region) {
			const rk = t.dataset.region as SurfaceRegionKey;
			const val = clamp(Number(t.value), 0, 100);
			state.surfaces[rk] = val;
			const out = settings.querySelector<HTMLElement>(`[data-regionval="${rk}"]`);
			if (out) out.textContent = `${Math.round(val)}%`;
			applySurfaceVars(state, getLayer()?.layer || null);
			callbacks.scheduleSave();
			return;
		}

		if (t.dataset.slider) {
			const sk = t.dataset.slider as 'dim' | 'blur';
			const row = PARAM_ROWS.find((r) => r.key === sk);
			if (!row) return;
			const numVal = Number(t.value);
			state[sk] = numVal / row.scale;
			const out = settings.querySelector<HTMLElement>(`[data-sliderval="${sk}"]`);
			if (out) out.textContent = row.scale === 100 ? `${Math.round(numVal)}%` : `${numVal.toFixed(1)}px`;
			callbacks.scheduleSave();
			callbacks.applyAll();
			return;
		}

		if (t.dataset.colorkey && draft && draftScene) {
			const ck = t.dataset.colorkey;
			if (/^color\d+$/.test(ck)) {
				const schColors = schemaOf(draftScene)?.colors || [];
				if (!Array.isArray(draft.colors)) draft.colors = [...schColors];
				(draft.colors as string[])[Number(ck.slice(5))] = t.value;
			} else {
				draft[ck] = t.value;
			}
			commitLive(draftScene);
		}
	});

	settings.addEventListener('change', (e) => {
		const t = e.target as HTMLInputElement;
		const state = callbacks?.getState();
		if (!t || !state || !callbacks) return;

		if (t.dataset.toggle === '__pspaused') {
			const on = Boolean(t.checked);
			if (on) state.sceneParams['pixel-sculpt'] = { paused: true };
			else delete state.sceneParams['pixel-sculpt'];
			writeSceneSetting('pixel-sculpt', { paused: on });
			callbacks.scheduleSave();
			try {
				getPsEditor()?.inst?.setSettings({ paused: on });
			} catch {
				// Ignore
			}
			return;
		}

		if (t.dataset.toggle && draft && draftScene) {
			const tk = t.dataset.toggle;
			const defaultVal = schemaOf(draftScene)?.defaults?.[tk];
			draft[tk] = typeof defaultVal === 'number' ? (t.checked ? 1 : 0) : Boolean(t.checked);
			commitLive(draftScene);
			return;
		}

		if (t.dataset.act === 'fit') {
			state.wallpaperFit = (t.value as AppearanceSettings['wallpaperFit']) || 'cover';
			callbacks.scheduleSave();
			callbacks.applyAll();
			return;
		}

		if (t.dataset.act === 'pos') {
			state.wallpaperPosition = (t.value as AppearanceSettings['wallpaperPosition']) || 'center';
			callbacks.scheduleSave();
			callbacks.applyAll();
			return;
		}

		if (t.dataset.act === 'wallfile' && t.files?.[0]) {
			const file = t.files[0];
			t.value = '';
			if (file.size > WALLPAPER_MAX_BYTES) {
				setPanelStatus('文件超过 200MB 上限', true);
				return;
			}
			void file
				.arrayBuffer()
				.then((buf) => uploadWallpaper(file.name, buf))
				.then((r) => {
					if (r?.ok && r.wallpaper) {
						callbacks?.setWallpapers(r.wallpapers || []);
						libPage = 0;
						state.wallpaperId = r.wallpaper.id;
						state.mode = 'wallpaper';
						state.enabled = true;
						callbacks?.scheduleSave();
						callbacks?.applyAll();
						renderSettings('custom');
					} else {
						setPanelStatus(`导入失败：${r?.error || '?'}`, true);
					}
				})
				.catch((err) => setPanelStatus(`导入失败：${String(err)}`, true));
		}
	});

	cleanOceanUi = bindShallowOceanEvents(
		shadow,
		{
			panel: settings,
			state: () => callbacks?.getState() || null,
			draft: () => draft,
			schema: () => (draftScene ? schemaOf(draftScene) : null),
			commit: (sceneId) => commitLive(sceneId),
			onResetAll: () => {
				if (!draftScene) return;
				const sch = schemaOf(draftScene);
				draft = sch?.defaults ? sanitizeDraft(sch, sch.defaults) : {};
				getShallowOceanController().resetPopulation();
				renderSettings(draftScene);
				commitLive(draftScene);
			},
			onReplay: () => replayActiveScene('shallow-ocean'),
			onClose: closeSettings,
			onStatus: setPanelStatus,
		},
		() => {
			if (settingsOpen && settingsId === 'shallow-ocean') {
				renderSettings('shallow-ocean');
			}
		},
	);

	// Sync shallow-ocean diagnostics count updates into persistent sceneParams
	getShallowOceanController().setSyncCallback((patch) => {
		const state = callbacks?.getState();
		if (!state) return;
		const sch = schemaOf('shallow-ocean');
		const cur = mergeSceneDraft(sch, state.sceneParams['shallow-ocean']);
		const next = { ...cur, ...patch };
		if (draft && draftScene === 'shallow-ocean') {
			Object.assign(draft, patch);
		}
		const dd = draftDeltaObj(sch, next);
		if (Object.keys(dd.delta).length > 0) state.sceneParams['shallow-ocean'] = dd.delta;
		else delete state.sceneParams['shallow-ocean'];
		writeSceneSetting('shallow-ocean', dd.full);
		callbacks?.scheduleSave();
	});

	document.addEventListener('click', onDocClick, true);
	document.addEventListener('keydown', onDocKey, true);
}

export function ensurePanel(cb: PanelCallbacks): void {
	callbacks = cb;
	if (ui && document.documentElement.contains(ui.host)) return;

	const host = document.createElement('div');
	host.id = PANEL_ID;
	host.setAttribute('data-dsh-ccx', 'panel');
	const shadow = host.attachShadow({ mode: 'open' });

	const styleEl = document.createElement('style');
	styleEl.textContent = PANEL_CSS;
	shadow.appendChild(styleEl);

	const trigger = document.createElement('button');
	trigger.type = 'button';
	trigger.id = TRIGGER_ID;
	trigger.className = 'trigger';
	trigger.title = '外观与动态背景 (dsh-ccx)';
	trigger.setAttribute('aria-expanded', 'false');
	trigger.innerHTML = GEAR_SVG;
	shadow.appendChild(trigger);

	const market = document.createElement('div');
	market.className = 'preview-market-popover';
	market.hidden = true;
	market.innerHTML =
		`<header class="preview-market-header"><h3>Plugin Market</h3><button class="preview-market-close" type="button" data-act="marketclose" title="关闭" aria-label="关闭">${CLOSE_SVG}</button></header>` +
		'<div class="preview-market-list">' +
		'<div class="preview-market-categories" role="tablist">' +
		'<button type="button" class="preview-market-category" data-cat="all" aria-selected="true">全部</button>' +
		'<button type="button" class="preview-market-category" data-cat="enabled" aria-selected="false">已启用</button>' +
		'<button type="button" class="preview-market-category" data-cat="custom" aria-selected="false">自定义</button>' +
		'</div>' +
		'<section class="preview-market-section"><div class="preview-market-section-list"></div>' +
		'<p class="cat-empty" hidden>此分类下没有项目。</p></section></div>';
	shadow.appendChild(market);

	const settings = document.createElement('div');
	settings.className = 'particle-settings-panel';
	settings.hidden = true;
	shadow.appendChild(settings);

	const cardsWrap = market.querySelector<HTMLDivElement>('.preview-market-section-list')!;
	const emptyNotice = market.querySelector<HTMLParagraphElement>('.cat-empty')!;

	ui = { host, shadow, trigger, market, settings, cardsWrap, emptyNotice };
	(document.body || document.documentElement).appendChild(host);
	syncPanelTheme();
	syncSidebarCollapsed();
	bindEvents();
}

export function refreshPanel(state: AppearanceSettings | null): void {
	if (!ui || !state) return;
	syncPanelTheme();
	syncSidebarCollapsed();
	buildCards();
	if (settingsOpen && settingsId === 'pixel-sculpt') syncPsPanel(state);
	if (settingsOpen && settingsId === 'shallow-ocean') renderSettings('shallow-ocean');
}

export function teardownPanel(): void {
	document.removeEventListener('click', onDocClick, true);
	document.removeEventListener('keydown', onDocKey, true);
	if (cleanOceanUi) {
		cleanOceanUi();
		cleanOceanUi = null;
	}
	if (ui?.host.parentNode) {
		try {
			ui.host.parentNode.removeChild(ui.host);
		} catch {
			// Ignore
		}
	}
	ui = null;
	callbacks = null;
	marketOpen = false;
	settingsOpen = false;
	settingsId = null;
	draft = null;
	draftScene = null;
	lastRenderedCardIds = '';
}
