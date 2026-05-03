const LAUNCHABLE_APP_IDS = new Set([
  'calculator',
  'terminal',
  'finder',
  'notes',
  'safari',
  'settings',
  'textedit',
  'photos',
  'messages',
  'mail',
  'preview',
  'weather',
  'calendar',
  'aboutthismac',
]);

export const APP_DEFAULT_TITLES = {
  calculator: 'Calculator',
  terminal: 'Terminal',
  finder: 'Finder',
  notes: 'Notes',
  safari: 'Safari',
  settings: 'System Settings',
  textedit: 'TextEdit',
  photos: 'Photos',
  messages: 'Messages',
  mail: 'Mail',
  preview: 'Preview',
  weather: 'Weather',
  calendar: 'Calendar',
  aboutthismac: 'About This Mac',
};

function safeHttpUrl(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch {
    return null;
  }
}

/**
 * Read deep-link intent from URL search params.
 * @param {URLSearchParams} params
 */
export function parseDeepLinkIntent(params) {
  const desktop = params.get('desktop');
  const appRaw = params.get('app');
  const app = appRaw ? appRaw.toLowerCase().trim() : '';

  const wantsDesktop = desktop === '1' || desktop === 'true' || Boolean(app);

  if (!wantsDesktop) return { wantsDesktop: false, app: null, payload: null };

  if (!app) {
    return { wantsDesktop: true, app: null, payload: null };
  }

  if (!LAUNCHABLE_APP_IDS.has(app)) {
    return { wantsDesktop: true, app: null, payload: null };
  }

  const payload = {};
  const urlParam = params.get('url');
  if (app === 'safari' && urlParam) {
    const u = safeHttpUrl(urlParam.trim());
    if (u) payload.url = u;
  }

  const pathParam = params.get('path');
  if (pathParam && ['finder', 'textedit', 'preview'].includes(app)) {
    payload.vfsPath = pathParam;
  }

  return {
    wantsDesktop: true,
    app,
    payload: Object.keys(payload).length ? payload : null,
  };
}

function topWindow(windows, activeWindowId) {
  if (!windows?.length) return null;
  const active = windows.find((w) => w.id === activeWindowId && !w.minimized);
  if (active) return active;
  const visible = windows.filter((w) => !w.minimized);
  if (!visible.length) return null;
  return visible.reduce((a, b) => (a.zIndex >= b.zIndex ? a : b));
}

/**
 * Build shareable query string for the focused / top window.
 * @param {Array} windows
 * @param {string|null} activeWindowId
 * @returns {URLSearchParams}
 */
export function buildDeepLinkParams(windows, activeWindowId) {
  const params = new URLSearchParams();
  const win = topWindow(windows, activeWindowId);
  if (!win) return params;

  params.set('desktop', '1');
  params.set('app', win.appId);

  const p = win.payload;
  if (win.appId === 'safari' && p?.url && safeHttpUrl(p.url)) {
    params.set('url', p.url);
  }
  if (['finder', 'textedit', 'preview'].includes(win.appId) && p?.vfsPath) {
    params.set('path', p.vfsPath);
  }

  return params;
}
