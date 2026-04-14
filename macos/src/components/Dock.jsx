import { useRef, useState, useCallback, useEffect } from 'react';
import { appIcons } from './Icons';
import { useWindows } from '../contexts/WindowContext';

const dockApps = [
  { id: 'finder', title: 'Finder' },
  { id: 'launchpad', title: 'Apps' },
  { id: 'safari', title: 'Safari' },
  { id: 'notes', title: 'Notes' },
  { id: 'terminal', title: 'Terminal' },
  { id: 'calculator', title: 'Calculator' },
  { id: 'textedit', title: 'TextEdit' },
  { id: 'photos', title: 'Photos' },
  { id: 'settings', title: 'System Settings' },
];

export default function Dock({ onAppLaunch, dockStyle }) {
  const dockRef = useRef(null);
  const [scales, setScales] = useState(dockApps.map(() => 1));
  const [bouncingApp, setBouncingApp] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const tooltipTimeout = useRef(null);
  const { isAppOpen, restoreWindow, windows } = useWindows();

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
        className="flex items-end gap-[6px] px-3 py-[7px] rounded-[24px]"
        style={{
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
            <div
              className="dock-icon w-[54px] h-[54px] cursor-pointer transition-transform duration-150 ease-out"
              style={{
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
            </div>
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
        <div className="relative flex flex-col items-center">
          {tooltip === 'trash' && (
            <div className="absolute -top-12 px-3 py-[6px] rounded-[8px] text-[13px] text-white/90 font-medium whitespace-nowrap"
              style={{ background: 'rgba(28,29,34,0.72)', backdropFilter: 'blur(48px) saturate(190%)', WebkitBackdropFilter: 'blur(48px) saturate(190%)', boxShadow: 'var(--mac-shadow-popover)' }}>
              Trash
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 transform" style={{ background: 'rgba(28,29,34,0.72)' }} />
            </div>
          )}
          <div
            className="dock-icon w-[54px] h-[54px] cursor-pointer transition-transform duration-150 ease-out"
            style={{ transform: `scale(${scales[dockApps.length] || 1})`, transformOrigin: 'bottom center', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.24))' }}
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
