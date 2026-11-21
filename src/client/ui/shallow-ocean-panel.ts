import {
	SHALLOW_OCEAN_CREATURES,
	SHALLOW_OCEAN_EVENTS,
	SHALLOW_OCEAN_PERF_MODES,
} from '../../shared/constants';
import { finiteNum } from '../../shared/sanitize';
import type { AppearanceSettings, SceneParamMap, SceneSchema } from '../../shared/types';
import { ensureOceanThumbs, getCachedOceanThumbs } from '../api';
import { getLayer } from '../background/layer';
import { getShallowOceanController } from '../background/shallow-ocean';
import { escapeHtml, fmtFieldVal } from './draft';

export interface ShallowOceanPanelHost {
	panel: HTMLElement;
	state: () => AppearanceSettings | null;
	draft: () => SceneParamMap | null;
	schema: () => SceneSchema | null;
	commit: (sceneId: 'shallow-ocean') => void;
	onResetAll: () => void;
	onReplay: () => void;
	onClose: () => void;
	onStatus: (msg: string, isError?: boolean) => void;
}

const activeFlights = new Set<{ anim: Animation; ghost: HTMLElement }>();
let titleClicks = 0;
let lastPreviewEvent: string | undefined;
let unsubOcean: (() => void) | null = null;
let dragCreature:
	| {
			id: string;
			startX: number;
			startY: number;
			moved: boolean;
			ghost: HTMLImageElement | null;
			thumbSrc: string;
	  }
	| undefined;

export function clearShallowOceanUiState(): void {
	titleClicks = 0;
	lastPreviewEvent = undefined;
	dragCreature = undefined;
	if (unsubOcean) {
		unsubOcean();
		unsubOcean = null;
	}
	for (const item of activeFlights) {
		try {
			item.anim.cancel();
			item.ghost.remove();
		} catch {
			// Ignore
		}
	}
	activeFlights.clear();
}

export function renderShallowOceanHeaderHtml(
	perfMode: number,
	devMode: boolean,
	closeSvg: string,
): string {
	const curPerf = Number.isFinite(perfMode) ? Math.max(0, Math.min(3, Math.round(perfMode))) : 0;
	const perfOptions = SHALLOW_OCEAN_PERF_MODES.map(
		([, zh], idx) =>
			`<option value="${idx}"${curPerf === idx ? ' selected' : ''}>${escapeHtml(zh)}</option>`,
	).join('');
	return (
		'<header class="particle-settings-header">' +
		'<div class="particle-settings-heading">' +
		'<p>外观<span class="ocean-developer-badge" data-ocean-dev-badge' +
		(devMode ? '' : ' hidden') +
		'>开发者模式</span></p>' +
		'<h3><button type="button" class="ocean-developer-trigger" data-ocean-dev-trigger>Shallow Ocean Letters Background</button></h3>' +
		'</div>' +
		`<label class="ocean-performance"><span>性能模式</span><select data-ocean-perf aria-label="性能模式">${perfOptions}</select></label>` +
		'<div class="particle-settings-header-actions">' +
		`<button class="particle-settings-close" type="button" data-act="settingsclose" title="关闭设置 (Esc)" aria-label="关闭设置">${closeSvg}</button>` +
		'</div></header>'
	);
}

export function renderShallowOceanBodyHtml(
	sch: SceneSchema,
	d: SceneParamMap,
	active: boolean,
): string {
	const controller = getShallowOceanController();
	const thumbs = getCachedOceanThumbs();
	const dev = controller.developerMode;
	const journal = controller.eventJournal;
	const discoveredCount = journal.discovered.length;
	const totalEvents = SHALLOW_OCEAN_EVENTS.length;
	const complete = discoveredCount === totalEvents;

	const creatureCards = SHALLOW_OCEAN_CREATURES.map(([id, , zh]) => {
		const src = thumbs?.[id] || '';
		const imgHtml = src
			? `<img src="${escapeHtml(src)}" alt="" data-ocean-thumb="${id}" loading="lazy">`
			: `<img alt="" data-ocean-thumb="${id}" style="opacity:.2">`;
		return (
			`<button type="button" class="ocean-creature-card" data-ocean-creature="${id}"` +
			(active ? '' : ' disabled') +
			`>${imgHtml}<span>${escapeHtml(zh)}</span></button>`
		);
	}).join('');

	const fieldMap = new Map(sch.fields.map((f) => [f.key, f]));
	const toggleMap = new Map((sch.toggles || []).map((t) => [t.key, t]));

	const groupHtml = (sch.groups || [])
		.map((g) => {
			const rows = g.keys
				.map((key) => {
					const field = fieldMap.get(key);
					if (field) {
						const val = finiteNum(d[key], field.min);
						return (
							`<div class="particle-control-row"><label for="ccx-f-${field.key}">${escapeHtml(field.zh)}</label>` +
							`<input id="ccx-f-${field.key}" type="range" min="${field.min}" max="${field.max}" step="${field.step}" value="${val}" data-field="${field.key}">` +
							`<span class="particle-control-value"><output data-fieldval="${field.key}">${escapeHtml(fmtFieldVal(field, val))}</output></span></div>`
						);
					}
					const toggle = toggleMap.get(key);
					if (toggle) {
						const checked = Number(d[toggle.key]) === 1 || d[toggle.key] === true;
						return (
							`<label class="particle-toggle-row"><span>${escapeHtml(toggle.zh)}</span>` +
							`<input type="checkbox" data-toggle="${toggle.key}"${checked ? ' checked' : ''}></label>`
						);
					}
					return '';
				})
				.join('');
			return `<fieldset class="particle-settings-group"><legend>${escapeHtml(g.zh)}</legend>${rows}</fieldset>`;
		})
		.join('');

	const eventButtons = SHALLOW_OCEAN_EVENTS.map(([id, , zh]) => {
		const hidden = !dev && !journal.discovered.includes(id);
		const disabled = dev ? !active : !complete;
		const pressed = dev ? lastPreviewEvent === id : !journal.excluded.includes(id);
		return (
			`<button type="button" data-ocean-event="${id}" aria-pressed="${pressed}"` +
			(hidden ? ' hidden' : '') +
			(disabled ? ' disabled' : '') +
			`>${escapeHtml(zh)}</button>`
		);
	}).join('');

	const eventHint = dev
		? '点击事件立即预览。自动奇遇已暂停，不影响正式收集和筛选。'
		: complete
			? '已集齐所有奇遇。点亮想再次遇见的事件。'
			: `已发现奇遇 ${discoveredCount} / ${totalEvents}，集齐后可选择希望再次遇见的事件。`;

	if (!thumbs) {
		void ensureOceanThumbs().catch(() => ({}));
	}

	return (
		'<div class="particle-settings-scroll">' +
		'<fieldset class="particle-settings-group">' +
		`<legend>投放生物${active ? '（点击或拖拽到水面）' : '（需先启用本场景）'}</legend>` +
		`<div class="ocean-creature-grid">${creatureCards}</div>` +
		'</fieldset>' +
		`<div class="ocean-parameter-grid">${groupHtml}</div>` +
		'<fieldset class="particle-settings-group">' +
		'<legend>奇遇收集</legend>' +
		`<div class="ocean-actions">${eventButtons}</div>` +
		`<p class="ocean-hint" data-ocean-event-hint>${escapeHtml(eventHint)}</p>` +
		'</fieldset>' +
		'<div class="ocean-actions ocean-global-actions">' +
		`<button type="button" data-ocean-clear${active ? '' : ' disabled'}>清除所有海洋生物</button>` +
		`<button type="button" data-act="replay"${active ? '' : ' disabled'}>重播开场</button>` +
		'<button type="button" data-act="draftreset">重置全部参数</button>' +
		'</div>' +
		'<p class="particle-plugin-error" role="status" hidden></p>' +
		'</div>'
	);
}

function launchCreatureFlight(
	sourceBtn: HTMLElement,
	src: string,
	shadowRoot: ShadowRoot,
	dropX?: number,
	dropY?: number,
): void {
	if (!src) return;
	const rect = sourceBtn.getBoundingClientRect();
	const w = Math.max(24, Math.min(54, rect.width || 44));
	const h = Math.max(24, Math.min(54, rect.height || 44));
	const fromX = rect.left + rect.width / 2 - w / 2;
	const fromY = rect.top + rect.height / 2 - h / 2;
	const toX = (dropX ?? window.innerWidth * 0.5) - w / 2;
	const toY = (dropY ?? window.innerHeight * 0.5) - h / 2;

	const ghost = document.createElement('img');
	ghost.src = src;
	ghost.className = 'ocean-creature-fly';
	ghost.style.cssText = `left:0;top:0;width:${w}px;height:${h}px;transform:translate(${fromX}px,${fromY}px);`;
	shadowRoot.appendChild(ghost);

	const anim = ghost.animate(
		[
			{ transform: `translate(${fromX}px,${fromY}px) scale(1)`, opacity: 1 },
			{
				transform: `translate(${(fromX + toX) * 0.5}px,${Math.min(fromY, toY) - 48}px) scale(1.15)`,
				opacity: 0.95,
			},
			{ transform: `translate(${toX}px,${toY}px) scale(.55)`, opacity: 0 },
		],
		{ duration: 480, easing: 'cubic-bezier(.22,.8,.36,1)' },
	);
	const entry = { anim, ghost };
	activeFlights.add(entry);
	anim.onfinish = () => {
		activeFlights.delete(entry);
		ghost.remove();
	};
	anim.oncancel = () => {
		activeFlights.delete(entry);
		ghost.remove();
	};
}

export function bindShallowOceanEvents(
	shadowRoot: ShadowRoot,
	host: ShallowOceanPanelHost,
	rerender: () => void,
): () => void {
	const controller = getShallowOceanController();
	if (unsubOcean) unsubOcean();
	unsubOcean = controller.subscribe(() => {
		const st = host.state();
		if (st?.scene === 'shallow-ocean' && !host.panel.hidden) {
			rerender();
		}
	});

	void ensureOceanThumbs().then((map) => {
		const imgs = host.panel.querySelectorAll<HTMLImageElement>('img[data-ocean-thumb]');
		for (let i = 0; i < imgs.length; i++) {
			const id = imgs[i].dataset.oceanThumb;
			if (id && map[id] && !imgs[i].src) {
				imgs[i].src = map[id];
				imgs[i].style.opacity = '1';
			}
		}
	});

	host.panel.addEventListener('pointerdown', (e) => {
		const card = (e.target as Element).closest<HTMLButtonElement>('[data-ocean-creature]');
		if (!card || card.disabled) return;
		const id = card.dataset.oceanCreature;
		if (!id) return;
		const img = card.querySelector('img');
		dragCreature = {
			id,
			startX: e.clientX,
			startY: e.clientY,
			moved: false,
			ghost: null,
			thumbSrc: img?.src || '',
		};
	});

	const onWinMove = (e: PointerEvent) => {
		if (!dragCreature) return;
		if (!dragCreature.moved && Math.hypot(e.clientX - dragCreature.startX, e.clientY - dragCreature.startY) > 6) {
			dragCreature.moved = true;
			if (dragCreature.thumbSrc) {
				const ghost = document.createElement('img');
				ghost.src = dragCreature.thumbSrc;
				ghost.className = 'ocean-creature-fly';
				ghost.style.cssText = 'left:0;top:0;width:44px;height:44px;';
				shadowRoot.appendChild(ghost);
				dragCreature.ghost = ghost;
			}
		}
		if (dragCreature.ghost) {
			dragCreature.ghost.style.transform = `translate(${e.clientX - 22}px,${e.clientY - 22}px)`;
		}
	};

	const onWinUp = (e: PointerEvent) => {
		if (!dragCreature) return;
		const cur = dragCreature;
		dragCreature = undefined;
		if (cur.ghost) cur.ghost.remove();
		if (!cur.moved) return;

		const rect = getLayer()?.layer.getBoundingClientRect();
		const w = rect?.width || window.innerWidth || 1;
		const h = rect?.height || window.innerHeight || 1;
		const u = Math.max(0.04, Math.min(0.96, (e.clientX - (rect?.left || 0)) / w));
		const v = Math.max(0.04, Math.min(0.96, (e.clientY - (rect?.top || 0)) / h));
		void controller.addCreature(cur.id, u, v).catch((err) => {
			host.onStatus(String((err as Error)?.message || err), true);
		});
	};

	window.addEventListener('pointermove', onWinMove);
	window.addEventListener('pointerup', onWinUp);
	window.addEventListener('pointercancel', onWinUp);

	host.panel.addEventListener('click', (e) => {
		const target = e.target as Element;

		if (target.closest('[data-ocean-dev-trigger]')) {
			titleClicks += 1;
			if (titleClicks >= 5) {
				titleClicks = 0;
				controller.setDeveloperMode(!controller.developerMode);
			}
			return;
		}

		const creatureBtn = target.closest<HTMLButtonElement>('[data-ocean-creature]');
		if (creatureBtn && !creatureBtn.disabled) {
			const id = creatureBtn.dataset.oceanCreature;
			if (!id) return;
			const src = creatureBtn.querySelector('img')?.src || '';
			const u = 0.2 + Math.random() * 0.6;
			const v = 0.25 + Math.random() * 0.5;
			launchCreatureFlight(creatureBtn, src, shadowRoot, u * window.innerWidth, v * window.innerHeight);
			void controller.addCreature(id, u, v).catch((err) => {
				host.onStatus(String((err as Error)?.message || err), true);
			});
			return;
		}

		const evBtn = target.closest<HTMLButtonElement>('[data-ocean-event]');
		if (evBtn && !evBtn.disabled) {
			const id = evBtn.dataset.oceanEvent;
			if (!id) return;
			if (controller.developerMode) {
				lastPreviewEvent = id;
				try {
					controller.previewEvent(id);
					rerender();
				} catch (err) {
					host.onStatus(String((err as Error)?.message || err), true);
				}
			} else {
				controller.toggleEvent(id);
			}
			return;
		}

		if (target.closest('[data-ocean-clear]')) {
			controller.clearCreatures();
			host.onStatus('已清除海洋生物');
		}
	});

	host.panel.addEventListener('change', (e) => {
		const sel = e.target as HTMLSelectElement;
		if (sel?.dataset?.oceanPerf !== undefined) {
			const d = host.draft();
			if (!d) return;
			const idx = Number(sel.value);
			d.performanceMode = Number.isFinite(idx) ? Math.max(0, Math.min(3, Math.round(idx))) : 0;
			host.commit('shallow-ocean');
		}
	});

	return () => {
		window.removeEventListener('pointermove', onWinMove);
		window.removeEventListener('pointerup', onWinUp);
		window.removeEventListener('pointercancel', onWinUp);
		clearShallowOceanUiState();
	};
}
