import type { IncomingMessage } from 'node:http';

export interface ConnectionFenceLike {
  requestRejection: (req: IncomingMessage) => number | null | undefined;
}

export interface HostContextLike {
  get?: (name: string) => unknown;
  connection?: unknown;
}

export function isLoopbackHostname(hn: string | undefined): boolean {
  const h = String(hn || '')
    .toLowerCase()
    .replace(/^\[/, '')
    .replace(/\]$/, '');
  if (!h) return false;
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h === '::1') return true;
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (!m) return false;
  if (Number(m[1]) !== 127) return false;
  return [m[2], m[3], m[4]].every((x) => Number(x) <= 255);
}

function getConnectionFence(ctx: HostContextLike): ConnectionFenceLike | null {
  try {
    const conn = (typeof ctx.get === 'function' ? ctx.get('connection') : null) || ctx.connection;
    if (
      conn &&
      typeof conn === 'object' &&
      'requestRejection' in conn &&
      typeof (conn as ConnectionFenceLike).requestRejection === 'function'
    ) {
      return conn as ConnectionFenceLike;
    }
    return null;
  } catch {
    return null;
  }
}

export function selfRejection(req: IncomingMessage, ctx: HostContextLike): number | null {
  try {
    const headers = req?.headers || {};
    let hostUrl: URL;
    try {
      hostUrl = new URL(`http://${String(headers.host || '')}`);
    } catch {
      return 403;
    }

    const fence = getConnectionFence(ctx);
    if (fence) {
      const delegated = fence.requestRejection(req);
      if (delegated) return delegated;
    } else if (!isLoopbackHostname(hostUrl.hostname)) {
      return 403;
    }

    const site = String(headers['sec-fetch-site'] || '').toLowerCase();
    if (site === 'cross-site') return 403;

    const origin = headers.origin;
    if (typeof origin === 'string' && origin && origin !== 'null') {
      let originUrl: URL;
      try {
        originUrl = new URL(origin);
      } catch {
        return 403;
      }
      if (originUrl.host.toLowerCase() !== hostUrl.host.toLowerCase()) return 403;
    }
    return null;
  } catch {
    return 403;
  }
}
