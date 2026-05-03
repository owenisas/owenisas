import { wallpaperPresets } from '../data/wallpaperPresets';

const LS_ICONS = 'owenisas-desktop-icon-offsets';
const LS_WALLPAPER = 'owenisas-wallpaper-id';

export const DESKTOP_WALLPAPER_EVENT = 'owenisas:desktop-wallpaper';

const defaultWallpaperId = wallpaperPresets[0]?.id ?? 'default-photo';

export function loadIconOffsets() {
  try {
    const raw = localStorage.getItem(LS_ICONS);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return {};
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v.x === 'number' && typeof v.y === 'number') out[k] = { x: v.x, y: v.y };
    }
    return out;
  } catch {
    return {};
  }
}

export function saveIconOffsets(offsets) {
  try {
    localStorage.setItem(LS_ICONS, JSON.stringify(offsets));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadWallpaperId() {
  try {
    const id = localStorage.getItem(LS_WALLPAPER);
    if (!id) return defaultWallpaperId;
    if (wallpaperPresets.some((w) => w.id === id)) return id;
    return defaultWallpaperId;
  } catch {
    return defaultWallpaperId;
  }
}

export function persistDesktopWallpaperId(id) {
  if (!wallpaperPresets.some((w) => w.id === id)) return;
  try {
    localStorage.setItem(LS_WALLPAPER, id);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(DESKTOP_WALLPAPER_EVENT, { detail: id }));
}
