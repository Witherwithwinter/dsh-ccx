import { DEFAULT_SETTINGS, PLUGIN_ID } from '../shared/constants';
import { sanitizeSettings, sanitizeSurfaces } from '../shared/sanitize';
import type { HostContextLike } from './fence';
import { registerAppearanceRoutes, type WebServerServiceLike } from './routes';
import { hideNativeMenuBar } from './window-chrome';

export { DEFAULT_SETTINGS, sanitizeSettings, sanitizeSurfaces };

export interface CordisRootLike {
  inject: (
    services: string[],
    cb: (ctx: HostContextLike & { webServer: WebServerServiceLike }) => void,
  ) => void;
  effect: (fn: () => () => void, label?: string) => void;
}

export default {
  name: PLUGIN_ID,
  apply(root: CordisRootLike): void {
    hideNativeMenuBar();
    root.inject(['webServer'], (ctx) => {
      const dispose = registerAppearanceRoutes(ctx);
      root.effect(() => dispose, `${PLUGIN_ID}: routes`);
    });
  },
};
