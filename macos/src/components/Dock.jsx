import { useRef, useState, useCallback, useEffect } from 'react';
import { appIcons } from './Icons';
import { useWindows } from '../contexts/WindowContext';

const dockApps = [
  { id: 'finder', title: 'Finder' },
  { id: 'launchpad', title: 'Apps' },
  { id: 'safari', title: 'Safari' },
  { id: 'mail', title: 'Mail' },
  { id: 'messages', title: 'Messages' },
  { id: 'photos', title: 'Photos' },
  { id: 'calendar', title: 'Calendar' },
  { id: 'weather', title: 'Weather' },
  { id: 'music', title: 'Music' },
  { id: 'anime', title: 'Anime Tracker' },
  { id: 'activity', title: 'GitHub Activity' },
  { id: 'codeeditor', title: 'Code' },
  { id: 'notes', title: 'Notes' },
  { id: 'terminal', title: 'Terminal' },
  { id: 'textedit', title: 'TextEdit' },
  { id: 'calculator', title: 'Calculator' },
  { id: 'settings', title: 'System Settings' },
];

// Auto-shrink icons when dock is crowded
const ICON_SIZE = dockApps.length > 14 ? 46 : dockApps.length > 10 ? 50 : 54;
const ICON_GAP = dockApps.length > 14 ? 5 : 6;

export default function Dock({ onAppLaunch, dockStyle }) {
  const dockRef = useRef(null);
  const [scales, setScales] = useState(dockApps.map(() => 1));
  const [bouncingApp, setBouncingApp] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const tooltipTimeout = useRef(null);
  const { isAppOpen, restoreWindow, windows } = useWindows();
  const dockAppIds = new Set(dockApps.map(a => a.id));
  const trayWindows = windows.filter(w => w.minimized && !dockAppIds.has(w.appId));

  const onMouseMove = useCallback((e) => {
    if (!dockRef.current) return;
    const icons = dockRef.current.querySelectorAll('.dock-icon');
    const newScales = Array.from(icons).map(icon => {
      const rect = icon.getBoundingClientRect();
      const iconCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(e.clientX - iconCenterX);
      const falloff = Math.max(0, 1 - distance / 170);
      return 1 + 0.56 * Math.sin((falloff * Math.PI) / 2);
    });
    setScales(newScales);
  }, []);

  const onMouseLeave = useCallback(() => {
    setScales(dockApps.map(() => 1));
    clearTimeout(tooltipTimeout.current);
    setTooltip(null);
  }, []);

  const showTooltip = useCallback((id) => {
    clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = setTimeout(() => setTooltip(id), 150);
  }, []);

  const hideTooltip = useCallback(() => {
    clearTimeout(tooltipTimeout.current);
    setTooltip(null);
  }, []);

  useEffect(() => {
    return () => clearTimeout(tooltipTimeout.current);
  }, []);

  const handleClick = useCallback((appId, title) => {
    const minimizedWin = windows.find(w => w.appId === appId && w.minimized);
    if (minimizedWin) {
      restoreWindow(appId);
      return;
    }

    if (!isAppOpen(appId)) {
      setBouncingApp(appId);
      setTimeout(() => setBouncingApp(null), 1600);
    }
    
    onAppLaunch(appId, title);
  }, [onAppLaunch, restoreWindow, windows, isAppOpen]);

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[100]" style={dockStyle}>
      <div
        ref={dockRef}
        className="flex items-end px-3 py-[7px] rounded-[24px]"
        style={{
          gap: `${ICON_GAP}px`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
          border: '0.5px solid rgba(255,255,255,0.18)',
          boxShadow: '0 16px 44px rgba(0,0,0,0.42), inset 0 1px 1px rgba(255,255,255,0.22)',
          backdropFilter: 'blur(54px) saturate(190%)',
          WebkitBackdropFilter: 'blur(54px) saturate(190%)',
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {dockApps.map((app, i) => (
          <div key={app.id} className="relative flex flex-col items-center">
            {tooltip === app.id && (
              <div className="absolute -top-12 px-3 py-[6px] rounded-[8px] text-[13px] text-white/90 font-medium whitespace-nowrap"
                style={{ background: 'rgba(28,29,34,0.72)', backdropFilter: 'blur(48px) saturate(190%)', WebkitBackdropFilter: 'blur(48px) saturate(190%)', boxShadow: 'var(--mac-shadow-popover)' }}>
                {app.title}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 transform" style={{ background: 'rgba(28,29,34,0.72)' }} />
              </div>
            )}
            <button
              type="button"
              aria-label={app.title}
              className="dock-icon cursor-pointer transition-transform duration-150 ease-out appearance-none border-0 bg-transparent p-0"
              style={{
                width: ICON_SIZE,
                height: ICON_SIZE,
                transform: `scale(${scales[i]})${bouncingApp === app.id ? '' : ''}`,
                transformOrigin: 'bottom center',
                animation: bouncingApp === app.id ? 'dock-bounce 0.8s ease 2' : 'none',
                marginBottom: (scales[i] - 1) * 22,
                filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.24))',
              }}
              onClick={() => handleClick(app.id, app.title)}
              onMouseEnter={() => showTooltip(app.id)}
              onMouseLeave={hideTooltip}
            >
              {appIcons[app.id]}
            </button>
            {isAppOpen(app.id) && (
              <div
                className="w-[5px] h-[5px] rounded-full bg-white/90 absolute shadow-[0_0_3px_rgba(255,255,255,0.5)]"
                style={{ bottom: -8 }}
              />
            )}
          </div>
        ))}

        {/* Separator before Trash */}
        <div className="w-px h-11 bg-white/24 mx-1 self-center shadow-[1px_0_0_rgba(0,0,0,0.12)] rounded-full" />

        {/* Minimized tray — non-dock apps */}
        {trayWindows.map(win => (
          <div key={win.id} className="relative flex flex-col items-center">
            {tooltip === `tray-${win.id}` && (
              <div className="absolute -top-12 px-3 py-[6px] rounded-[8px] text-[13px] text-white/90 font-medium whitespace-nowrap"
                style={{ background: 'rgba(28,29,34,0.72)', backdropFilter: 'blur(48px) saturate(190%)', WebkitBackdropFilter: 'blur(48px) saturate(190%)', boxShadow: 'var(--mac-shadow-popover)' }}>
                {win.title}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 transform" style={{ background: 'rgba(28,29,34,0.72)' }} />
              </div>
            )}
            <button
              type="button"
              aria-label={`Restore ${win.title}`}
              className="dock-icon cursor-pointer transition-transform duration-150 ease-out appearance-none border-0 bg-transparent p-0"
              style={{ width: ICON_SIZE, height: ICON_SIZE, transformOrigin: 'bottom center', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.24))' }}
              onClick={() => restoreWindow(win.appId)}
              onMouseEnter={() => showTooltip(`tray-${win.id}`)}
              onMouseLeave={hideTooltip}
            >
              {appIcons[win.appId] || appIcons.finder}
            </button>
            <div className="w-[5px] h-[5px] rounded-full bg-white/90 absolute shadow-[0_0_3px_rgba(255,255,255,0.5)]" style={{ bottom: -8 }} />
          </div>
        ))}

        {trayWindows.length > 0 && <div className="w-px h-11 bg-white/24 mx-1 self-center shadow-[1px_0_0_rgba(0,0,0,0.12)] rounded-full" />}
        <div className="relative flex flex-col items-center">
          {tooltip === 'trash' && (
            <div className="absolute -top-12 px-3 py-[6px] rounded-[8px] text-[13px] text-white/90 font-medium whitespace-nowrap"
              style={{ background: 'rgba(28,29,34,0.72)', backdropFilter: 'blur(48px) saturate(190%)', WebkitBackdropFilter: 'blur(48px) saturate(190%)', boxShadow: 'var(--mac-shadow-popover)' }}>
              Trash
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 transform" style={{ background: 'rgba(28,29,34,0.72)' }} />
            </div>
          )}
          <div
            aria-label="Trash"
            className="dock-icon transition-transform duration-150 ease-out"
            style={{ width: ICON_SIZE, height: ICON_SIZE, transform: `scale(${scales[dockApps.length] || 1})`, transformOrigin: 'bottom center', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.24))' }}
            onMouseEnter={() => showTooltip('trash')}
            onMouseLeave={hideTooltip}
          >
            {appIcons.trash}
          </div>
          {/* Assuming trash doesn't typically have the dot, but we could add it if open */}
        </div>
      </div>
    </div>
  );
}
