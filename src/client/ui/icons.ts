const GLYPHS: Record<string, string> = {
	custom:
		'<rect x="2" y="2.5" width="12" height="11" rx="2"/><circle cx="5.5" cy="6" r="1"/><path d="m3 12 3.5-3.5 2 2L11 8l2 2.5"/>',
	surface:
		'<rect x="2" y="2" width="8" height="8" rx="1.5"/><rect x="6" y="6" width="8" height="8" rx="1.5"/><path d="m7 9 2-2m-2 5 5-5m-2 6 3-3"/>',
	'milky-way':
		'<path d="M2 12C3 5 9 1 13 3c4 3-4 10-8 9-3-1 0-5 4-6 3-1 2 2 0 3M3 2v2M2 3h2M12 12v2M11 13h2"/>',
	'glow-horizon':
		'<path d="M2 10h12M3 13h10M5 10a3 3 0 0 1 6 0M8 2v2M3 4l1.5 1.5M13 4l-1.5 1.5M1.5 7h2M12.5 7h2"/>',
	mountain:
		'<path d="m1.5 13 5-10 5 10zm6-6 3-3 4 9h-3M4.5 7l2 1.5L8 7M2 14.5h12"/>',
	'heavenly-cloud':
		'<path d="M4 12a3 3 0 1 1 .5-6 4 4 0 0 1 7.7 1A2.5 2.5 0 0 1 12 12zM5 14h6"/>',
	'aurora-ionosphere':
		'<path d="M2 12c2-14 3 2 5-8s3 14 5 1l2-3M2 14c2-9 3 1 5-4s3 7 5 0l2-4"/>',
	'black-hole':
		'<circle cx="8" cy="8" r="2.5"/><ellipse cx="8" cy="8" rx="6.5" ry="3" transform="rotate(-25 8 8)"/><path d="M5 3a6 6 0 0 1 8 4M3 9a6 6 0 0 0 8 4"/>',
	'cloud-train':
		'<rect x="5" y="6" width="8" height="6" rx="1.5"/><path d="M7 6V4H4a1.5 1.5 0 1 1 1-2M6 9h6M9 6v3M3 14h11"/><circle cx="7" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/>',
	'particle-image':
		'<circle cx="3" cy="3" r=".65"/><circle cx="7" cy="2.5" r=".65"/><circle cx="2.5" cy="7" r=".65"/><circle cx="6.5" cy="6" r=".65"/><path d="M10 3h3v10H3v-3m1.5 1 3-3 2 2 2-3 1.5 2"/>',
	'pixel-sculpt':
		'<path d="M2 14V8h3V5h3V2h3v4h3v8zM2 11h12M5 8v6M8 5v9M11 6v8"/>',
	'blinking-squares':
		'<rect x="2" y="2" width="4" height="4" rx=".5"/><rect x="9" y="3" width="3" height="3" rx=".5"/><rect x="3" y="10" width="3" height="3" rx=".5"/><rect x="9" y="9" width="5" height="5" rx=".5"/>',
	'ascii-tiles':
		'<path d="m3 2 5 1-1 5-5-1zM9 3l5 1-1 5-5-1zM2 9l5 1-1 4-5-1zM8 10l5 1-1 3-5-1zM4.5 4l-1 2M4 5.5h1.5"/>',
	'shallow-ocean':
		'<path d="M1.5 5.5c2-3 4 3 6 0s4 3 6 0M1.5 10.5c2-3 4 3 6 0s4 3 6 0M8 2v1M12 12.5v1.5"/>',
	'spectral-drape':
		'<circle cx="2" cy="4" r=".55"/><circle cx="2" cy="7" r=".55"/><circle cx="2" cy="10" r=".55"/><circle cx="2" cy="13" r=".55"/><circle cx="5" cy="2" r=".55"/><circle cx="5" cy="5" r=".55"/><circle cx="5" cy="8" r=".55"/><circle cx="5" cy="11" r=".55"/><circle cx="8" cy="3" r=".55"/><circle cx="8" cy="6" r=".55"/><circle cx="8" cy="9" r=".55"/><circle cx="8" cy="12" r=".55"/><circle cx="11" cy="5" r=".55"/><circle cx="11" cy="8" r=".55"/><circle cx="11" cy="11" r=".55"/><circle cx="11" cy="14" r=".55"/><circle cx="14" cy="3" r=".55"/><circle cx="14" cy="6" r=".55"/><circle cx="14" cy="9" r=".55"/><circle cx="14" cy="12" r=".55"/>',
};

export function cardIconMarkup(id: string): string {
	const path = GLYPHS[id] ?? GLYPHS.custom;
	return `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">${path}</svg>`;
}

export const GEAR_SVG =
	'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3.2"/>' +
	'<path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>';

export const CLOSE_SVG =
	'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3.25 3.25 9.5 9.5M12.75 3.25l-9.5 9.5"/></svg>';

export const SLIDERS_SVG =
	'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 4h3M9 4h5M2 8h7M13 8h1M2 12h1M7 12h7"/><circle cx="7" cy="4" r="2"/><circle cx="11" cy="8" r="2"/><circle cx="5" cy="12" r="2"/></svg>';
