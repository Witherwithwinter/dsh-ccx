import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

interface ElectronBrowserWindowLike {
  setAutoHideMenuBar?: (hide: boolean) => void;
  setMenuBarVisibility?: (visible: boolean) => void;
  isMenuBarVisible?: () => boolean;
  isMenuBarAutoHide?: () => boolean;
  getBounds?: () => unknown;
  getContentBounds?: () => unknown;
}

export function withWindows(fn: (win: ElectronBrowserWindowLike) => void): void {
  try {
    const electron = require('electron') as {
      BrowserWindow?: { getAllWindows: () => ElectronBrowserWindowLike[] };
    };
    const windows = electron?.BrowserWindow ? electron.BrowserWindow.getAllWindows() : [];
    for (const win of windows) {
      try {
        fn(win);
      } catch {
        /* single window failure must not break remaining windows */
      }
    }
  } catch {
    /* electron unavailable (headless / non-main process / unit test) */
  }
}

export function hideNativeMenuBar(): void {
  // Windows DSH 0.2.2-rc.5+ uses custom in-renderer titleBarStyle:'hidden';
  // Linux and legacy 0.2.1 windows still benefit from auto-hiding the native menu bar.
  withWindows((win) => {
    if (typeof win.setAutoHideMenuBar === 'function') win.setAutoHideMenuBar(true);
    if (typeof win.setMenuBarVisibility === 'function') win.setMenuBarVisibility(false);
  });
}

export function menuBarDebugInfo(): Record<string, unknown> {
  let out: Record<string, unknown> = { error: 'no-window', platform: process.platform };
  withWindows((win) => {
    out = {
      platform: process.platform,
      menuBarVisible: typeof win.isMenuBarVisible === 'function' ? win.isMenuBarVisible() : null,
      menuBarAutoHide: typeof win.isMenuBarAutoHide === 'function' ? win.isMenuBarAutoHide() : null,
      bounds: typeof win.getBounds === 'function' ? win.getBounds() : null,
      contentBounds: typeof win.getContentBounds === 'function' ? win.getContentBounds() : null,
    };
  });
  return out;
}
