import { API_BASE, STORE_KEYS } from '../../shared/constants';
import type { VendorModuleEntry } from '../../shared/types';
import { apiGet } from '../api';

const REGISTRY_SYM = Symbol.for('code-codex:background-modules:v1');
const GALLERIES_SYM = Symbol.for('code-codex:default-galleries:v1');

interface GalleryMetaImage {
	id: string;
	name: string;
	type: string;
	size: number;
	sha256: string;
	createdAt?: number;
	dataFile: string;
	thumbFile?: string;
}

interface GalleryMeta {
	count: number;
	version: number;
	images: GalleryMetaImage[];
}

interface SeededGalleryEntry {
	id: string;
	name: string;
	type: string;
	size: number;
	sha256: string;
	data: string;
	thumbnail?: string;
	createdAt: number;
}

const vendorScriptTags = new Map<string, HTMLScriptElement>();
const vendorLoadPromises = new Map<string, Promise<VendorModuleEntry>>();
const galleryPromises = new Map<string, Promise<boolean>>();

export function registry(): Map<string, VendorModuleEntry> | null {
	const reg = (window as unknown as Record<symbol, unknown>)[REGISTRY_SYM];
	return reg instanceof Map ? (reg as Map<string, VendorModuleEntry>) : null;
}

function bufferToBase64(buf: ArrayBuffer): string {
	const bytes = new Uint8Array(buf);
	const parts: string[] = [];
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk) {
		parts.push(String.fromCharCode(...bytes.subarray(i, i + chunk)));
	}
	return btoa(parts.join(''));
}

async function fetchMediaBase64(file: string): Promise<string> {
	const resp = await fetch(`${API_BASE}/vendor-media?file=${encodeURIComponent(file)}`, {
		credentials: 'omit',
	});
	if (!resp.ok) throw new Error(`media HTTP ${resp.status}`);
	return bufferToBase64(await resp.arrayBuffer());
}

/**
 * Lazy-load a vendor background module bundle and resolve its registered entry.
 */
export function ensureVendorScene(id: string): Promise<VendorModuleEntry> {
	const existing = registry()?.get(id);
	if (existing) return Promise.resolve(existing);

	const inflight = vendorLoadPromises.get(id);
	if (inflight) return inflight;

	const promise = new Promise<VendorModuleEntry>((resolve, reject) => {
		let settled = false;
		let timer: ReturnType<typeof setInterval> | null = null;
		let waits = 0;

		const cleanup = () => {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		};

		const succeed = (entry: VendorModuleEntry) => {
			if (settled) return;
			settled = true;
			cleanup();
			resolve(entry);
		};

		const fail = (err: Error) => {
			if (settled) return;
			settled = true;
			cleanup();
			vendorLoadPromises.delete(id);
			vendorScriptTags.delete(id);
			reject(err);
		};

		const checkRegistry = (): boolean => {
			const entry = registry()?.get(id);
			if (entry) {
				succeed(entry);
				return true;
			}
			return false;
		};

		let tag = vendorScriptTags.get(id);
		if (!tag) {
			tag = document.createElement('script');
			tag.src = `${API_BASE}/vendor/${encodeURIComponent(id)}.js`;
			tag.onload = () => {
				if (!checkRegistry()) {
					// Allow a brief tick for synchronous registration after script execution
					setTimeout(() => {
						if (!settled && !checkRegistry()) {
							fail(new Error(`vendor registry missing after load: ${id}`));
						}
					}, 120);
				}
			};
			tag.onerror = () => {
				fail(new Error(`vendor script load failed: ${id}`));
			};
			vendorScriptTags.set(id, tag);
			(document.head || document.documentElement).appendChild(tag);
		}

		timer = setInterval(() => {
			if (checkRegistry()) return;
			if (++waits > 150) {
				fail(new Error(`registry timeout: ${id}`));
			}
		}, 60);
	});

	vendorLoadPromises.set(id, promise);
	return promise;
}

/**
 * Seed default media galleries into window[Symbol.for("code-codex:default-galleries:v1")]
 * for gallery-backed renderers (particle-image / pixel-sculpt).
 */
export function ensureGallery(id: string): Promise<boolean> {
	const cached = galleryPromises.get(id);
	if (cached) return cached;

	const promise = (async () => {
		const index = await apiGet<Record<string, GalleryMeta>>('/vendor-galleries.json');
		const meta = index?.[id];
		if (!meta) throw new Error(`gallery index missing: ${id}`);

		const entries = await Promise.all(
			meta.images.map(async (img): Promise<SeededGalleryEntry> => {
				const data = await fetchMediaBase64(img.dataFile);
				const entry: SeededGalleryEntry = {
					id: img.id,
					name: img.name,
					type: img.type,
					size: img.size,
					sha256: img.sha256,
					data,
					createdAt: img.createdAt || 0,
				};
				if (img.thumbFile) {
					entry.thumbnail = await fetchMediaBase64(img.thumbFile);
				}
				return entry;
			}),
		);

		const images = new Map<string, SeededGalleryEntry>();
		for (const item of entries) {
			images.set(item.id, item);
		}

		const win = window as unknown as Record<symbol, Map<string, unknown> | undefined>;
		const reg = (win[GALLERIES_SYM] = win[GALLERIES_SYM] || new Map<string, unknown>());
		reg.set(id, { count: meta.count, version: meta.version, images });
		return true;
	})().catch((err) => {
		galleryPromises.delete(id);
		throw err;
	});

	galleryPromises.set(id, promise);
	return promise;
}

function looksSelected(storeObj: Record<string, unknown> | null): boolean {
	if (!storeObj) return false;
	const ids = storeObj.selectedImageIds;
	return Boolean((Array.isArray(ids) && ids.length > 0) || storeObj.activeImageId);
}

/**
 * Idempotently restore selectedImageIds/activeImageId for particle-image if IndexedDB
 * already contains images while localStorage selection keys are empty.
 */
export function ensureGallerySelection(id: string): Promise<null> {
	if (id !== 'particle-image') return Promise.resolve(null);
	const key = STORE_KEYS[id];
	if (!key) return Promise.resolve(null);

	return new Promise<null>((resolve) => {
		let done = false;
		const finish = () => {
			if (!done) {
				done = true;
				resolve(null);
			}
		};

		try {
			const raw = localStorage.getItem(key);
			if (raw && looksSelected(JSON.parse(raw))) {
				finish();
				return;
			}
		} catch {
			// Continue to IndexedDB fallback
		}

		try {
			const req = indexedDB.open('code-codex-particle-image-background');
			req.onupgradeneeded = () => {
				try {
					req.transaction?.abort();
				} catch {
					// Ignore abort errors
				}
				finish();
			};
			req.onsuccess = () => {
				const db = req.result;
				let settled = false;
				const closeDb = () => {
					try {
						db.close();
					} catch {
						// Ignore
					}
				};
				try {
					const rq = db.transaction('images', 'readonly').objectStore('images').getAll();
					rq.onsuccess = () => {
						closeDb();
						if (settled) return;
						settled = true;
						const rows = ((rq.result as Array<Record<string, unknown>>) || []).filter(
							(r) => r && r.id !== '__codeCodex_default_media_v1__' && (r.blob || r.file),
						);
						if (!rows.length) {
							finish();
							return;
						}
						rows.sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
						let cur: Record<string, unknown> = {};
						try {
							cur = JSON.parse(localStorage.getItem(key) || '{}') || {};
						} catch {
							cur = {};
						}
						if (!looksSelected(cur)) {
							cur.selectedImageIds = rows.map((r) => r.id);
							cur.activeImageId = rows[0].id;
							try {
								localStorage.setItem(key, JSON.stringify(cur));
							} catch {
								// Ignore quota/storage errors
							}
						}
						finish();
					};
					rq.onerror = () => {
						closeDb();
						if (!settled) {
							settled = true;
							finish();
						}
					};
				} catch {
					closeDb();
					finish();
				}
			};
			req.onerror = finish;
			req.onblocked = finish;
			setTimeout(finish, 3000);
		} catch {
			finish();
		}
	});
}
