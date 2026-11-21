import { SHALLOW_OCEAN_EVENTS } from '../../shared/constants';
import type { OceanEventJournalState, SceneParamMap, VendorRendererInstance } from '../../shared/types';
import { ensureVendorScene } from './vendor-loader';

export const SHALLOW_OCEAN_JOURNAL_KEY = 'code-codex:shallow-ocean-events:v1';
const EVENT_IDS: string[] = SHALLOW_OCEAN_EVENTS.map((e) => e[0]);

export function normalizeEventJournal(input: unknown): OceanEventJournalState {
	const value = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
	const known = (v: unknown): string[] =>
		EVENT_IDS.filter((id) => Array.isArray(v) && v.includes(id));
	const discovered = known(value.discovered);
	return {
		discovered,
		excluded: discovered.length === EVENT_IDS.length ? known(value.excluded) : [],
	};
}

export class OceanEventJournal {
	private current: OceanEventJournalState;
	private listeners = new Set<() => void>();

	constructor() {
		try {
			const raw = localStorage.getItem(SHALLOW_OCEAN_JOURNAL_KEY) ?? '{}';
			this.current = normalizeEventJournal(JSON.parse(raw));
		} catch {
			this.current = normalizeEventJournal(null);
		}
	}

	get state(): OceanEventJournalState {
		return {
			discovered: [...this.current.discovered],
			excluded: [...this.current.excluded],
		};
	}

	get included(): string[] {
		return EVENT_IDS.filter((id) => !this.current.excluded.includes(id));
	}

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	discover(id: string): void {
		if (!EVENT_IDS.includes(id) || this.current.discovered.includes(id)) return;
		this.commit({
			...this.current,
			discovered: [...this.current.discovered, id],
		});
	}

	toggle(id: string): void {
		if (this.current.discovered.length !== EVENT_IDS.length || !EVENT_IDS.includes(id)) return;
		const excluded = this.current.excluded.includes(id)
			? this.current.excluded.filter((item) => item !== id)
			: [...this.current.excluded, id];
		this.commit({ ...this.current, excluded });
	}

	private commit(next: OceanEventJournalState): void {
		const normalized = normalizeEventJournal(next);
		try {
			localStorage.setItem(SHALLOW_OCEAN_JOURNAL_KEY, JSON.stringify(normalized));
		} catch {
			// Continue with in-memory journal even if storage quota is blocked
		}
		this.current = normalized;
		for (const listener of this.listeners) {
			try {
				listener();
			} catch {
				// Ignore subscriber failures
			}
		}
	}
}

interface ShallowOceanRendererInstance extends VendorRendererInstance {
	addCreature?: (kind: string, u?: number, v?: number) => Promise<void> | void;
	previewEvent?: (kind: string) => void;
	action?: (act: string) => void;
	diagnostics?: {
		parameters?: Record<string, number>;
	} | null;
}

type ShallowOceanCtor = new (
	target: HTMLElement,
	canvas: HTMLCanvasElement,
	settings: SceneParamMap,
	onError: (msg: string) => void,
	interactive: boolean,
	eventHooks: {
		included: () => string[];
		started: (id: string) => void;
	},
) => ShallowOceanRendererInstance;

export interface OceanCreatureSyncPayload {
	silverCount: number;
	reefCount: number;
	clownCount: number;
	sharkCount: number;
	turtleCount: number;
	defaultCreaturesEnabled: number;
}

export class ShallowOceanController {
	readonly journal = new OceanEventJournal();
	private devMode = false;
	private populationGeneration = 0;
	private populationQueue: Promise<void> = Promise.resolve();
	private renderer: ShallowOceanRendererInstance | null = null;
	private currentSettings: SceneParamMap = {};
	private listeners = new Set<() => void>();
	private syncCallback: ((patch: Partial<OceanCreatureSyncPayload>) => void) | null = null;

	get developerMode(): boolean {
		return this.devMode;
	}

	get hasRenderer(): boolean {
		return this.renderer !== null;
	}

	get eventJournal(): OceanEventJournalState {
		return this.journal.state;
	}

	setSyncCallback(cb: ((patch: Partial<OceanCreatureSyncPayload>) => void) | null): void {
		this.syncCallback = cb;
	}

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		const unsubJournal = this.journal.subscribe(listener);
		return () => {
			this.listeners.delete(listener);
			unsubJournal();
		};
	}

	private notify(): void {
		for (const listener of this.listeners) {
			try {
				listener();
			} catch {
				// Ignore subscriber failures
			}
		}
	}

	setDeveloperMode(enabled: boolean): void {
		if (this.devMode === enabled) return;
		this.devMode = enabled;
		this.applyEffectiveSettings();
		this.notify();
	}

	toggleEvent(id: string): void {
		this.journal.toggle(id);
	}

	private effectiveSettings(settings: SceneParamMap): SceneParamMap {
		return this.devMode ? { ...settings, eventsEnabled: 0 } : { ...settings };
	}

	private applyEffectiveSettings(): void {
		try {
			this.renderer?.setSettings?.(this.effectiveSettings(this.currentSettings));
		} catch {
			// Ignore renderer errors on settings push
		}
	}

	async mount(
		stage: HTMLDivElement,
		initialSettings: SceneParamMap,
		onStatus: (msg?: string) => void,
		isStillCurrent: () => boolean,
	): Promise<VendorRendererInstance> {
		this.currentSettings = { ...initialSettings };
		const entry = await ensureVendorScene('shallow-ocean');
		if (!isStillCurrent()) {
			throw new Error('stale mount');
		}

		const Ctor = entry.exports?.ShallowOceanRenderer as ShallowOceanCtor | undefined;
		if (typeof Ctor !== 'function') {
			// Fallback to generic startup if named constructor is absent
			const inst = entry.startup(stage, onStatus);
			this.renderer = inst as ShallowOceanRendererInstance;
			this.notify();
			return inst;
		}

		stage.setAttribute('data-code-codex-shallow-ocean-layer', 'true');
		const canvas = document.createElement('canvas');
		canvas.className = 'code-codex-particle-canvas code-codex-shallow-ocean-canvas';
		canvas.style.cssText = 'width:100%;height:100%;display:block;';
		stage.appendChild(canvas);

		const inst = new Ctor(
			stage,
			canvas,
			this.effectiveSettings(this.currentSettings),
			onStatus,
			true,
			{
				included: () => this.journal.included,
				started: (id: string) => {
					if (this.devMode) return;
					this.journal.discover(id);
				},
			},
		);
		this.renderer = inst;
		this.notify();

		return {
			ready: inst.ready,
			setSettings: (next: Record<string, unknown>) => {
				this.currentSettings = { ...(next as SceneParamMap) };
				this.applyEffectiveSettings();
			},
			replay: () => {
				inst.replay?.();
			},
			dispose: () => {
				this.populationGeneration++;
				if (this.renderer === inst) {
					this.renderer = null;
				}
				try {
					inst.dispose?.();
				} catch {
					// Ignore
				}
				this.notify();
			},
		};
	}

	addCreature(kind: string, u = 0.5, v = 0.5): Promise<void> {
		const generation = this.populationGeneration;
		const op = this.populationQueue
			.catch(() => {})
			.then(async () => {
				if (generation !== this.populationGeneration) return;
				const inst = this.renderer;
				if (!inst || typeof inst.addCreature !== 'function') {
					throw new Error('请先启用“浅海字迹”背景后再投放生物');
				}
				await inst.addCreature(kind, u, v);
				if (generation !== this.populationGeneration || inst !== this.renderer) return;
				const params = inst.diagnostics?.parameters;
				if (params && this.syncCallback) {
					const patch: Partial<OceanCreatureSyncPayload> = {};
					const keys: Array<keyof OceanCreatureSyncPayload> = [
						'silverCount',
						'reefCount',
						'clownCount',
						'sharkCount',
						'turtleCount',
						'defaultCreaturesEnabled',
					];
					for (const k of keys) {
						const val = Number(params[k]);
						if (Number.isFinite(val)) patch[k] = val;
					}
					this.syncCallback(patch);
				}
			});
		this.populationQueue = op;
		return op;
	}

	clearCreatures(): void {
		this.populationGeneration++;
		try {
			this.renderer?.action?.('clear');
		} catch {
			// Ignore
		}
		this.syncCallback?.({
			defaultCreaturesEnabled: 0,
			silverCount: 0,
			reefCount: 0,
			clownCount: 0,
			sharkCount: 0,
			turtleCount: 0,
		});
	}

	resetPopulation(): void {
		this.populationGeneration++;
		try {
			this.renderer?.action?.('reset-population');
		} catch {
			// Ignore
		}
	}

	previewEvent(kind: string): void {
		if (!this.renderer || typeof this.renderer.previewEvent !== 'function') {
			throw new Error('请先启用“浅海字迹”背景后再预览事件');
		}
		this.renderer.previewEvent(kind);
	}

	action(act: string): void {
		this.renderer?.action?.(act);
	}

	dispose(): void {
		this.populationGeneration++;
		this.devMode = false;
		this.renderer = null;
		this.syncCallback = null;
		this.listeners.clear();
	}
}

let sharedOceanController: ShallowOceanController | null = null;

export function getShallowOceanController(): ShallowOceanController {
	if (!sharedOceanController) {
		sharedOceanController = new ShallowOceanController();
	}
	return sharedOceanController;
}

export function disposeShallowOceanController(): void {
	if (sharedOceanController) {
		sharedOceanController.dispose();
		sharedOceanController = null;
	}
}
