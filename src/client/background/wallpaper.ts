import { API_BASE } from '../../shared/constants';
import type { AppearanceSettings, WallpaperPosition } from '../../shared/types';
import { activeStage, paintFallback, releaseMediaInStage } from './layer';

const POS_MAP: Record<WallpaperPosition, string> = {
	center: 'center',
	top: 'center top',
	bottom: 'center bottom',
	left: 'left center',
	right: 'right center',
};

function createWallpaperVideo(
	url: string,
	fit: 'cover' | 'contain',
	pos: string,
	stage: HTMLDivElement,
): HTMLVideoElement {
	const v = document.createElement('video');
	v.src = url;
	v.loop = true;
	v.muted = true;
	v.autoplay = true;
	v.playsInline = true;
	v.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:${pos};`;
	v.onerror = () => {
		releaseMediaInStage(stage);
		stage.textContent = '';
	};
	return v;
}

export function renderWallpaper(state: AppearanceSettings | null): void {
	const stage = activeStage();
	releaseMediaInStage(stage);
	stage.textContent = '';

	if (!(state && state.enabled && state.mode === 'wallpaper')) {
		return;
	}
	if (!state.wallpaperId) {
		paintFallback('从设置面板的素材库选择一张壁纸');
		return;
	}

	const url = `${API_BASE}/wallpaper?id=${encodeURIComponent(state.wallpaperId)}`;
	const fit =
		state.wallpaperFit === 'contain'
			? 'contain'
			: state.wallpaperFit === 'tile'
				? 'tile'
				: 'cover';
	const pos = POS_MAP[state.wallpaperPosition] || 'center';

	if (fit === 'tile') {
		const tile = document.createElement('div');
		tile.style.cssText =
			'position:absolute;inset:0;background-repeat:repeat;' +
			`background-size:auto;background-position:${pos};`;
		tile.style.backgroundImage = `url("${url}")`;

		const probe = document.createElement('img');
		probe.style.display = 'none';
		probe.onerror = () => {
			const video = createWallpaperVideo(url, 'cover', pos, stage);
			stage.textContent = '';
			stage.appendChild(video);
			void video.play().catch(() => {});
		};
		stage.appendChild(tile);
		stage.appendChild(probe);
		probe.src = url;
		return;
	}

	const img = document.createElement('img');
	img.decoding = 'async';
	img.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:${pos};`;
	img.onerror = () => {
		const video = createWallpaperVideo(url, fit, pos, stage);
		stage.textContent = '';
		stage.appendChild(video);
		void video.play().catch(() => {});
	};
	img.src = url;
	stage.appendChild(img);
}
