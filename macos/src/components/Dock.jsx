import { useRef, useState, useCallback } from 'react';
import { appIcons } from './Icons';
import { useWindows } from '../contexts/WindowContext';

const dockApps = [
  { id: 'finder', title: 'Finder' },
  { id: 'launchpad', title: 'Launchpad' },
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
  const { isAppOpen, restoreWindow, windows } = useWindows();

  const onMouseMove = useCallback((e) => {
    if (!dockRef.current) return;
    const icons = dockRef.current.querySelectorAll('.dock-icon');
    const newScales = Array.from(icons).map(icon => {
      const rect = icon.getBoundingClientRect();
      const iconCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(e.clientX - iconCenterX);
      return 1 + 0.7 * Math.max(0, 1 - (distance / 150) ** 2);
    });
    setScales(newScales);
  }, []);

  const onMouseLeave = useCallback(() => {
    setScales(dockApps.map(() => 1));
    setTooltip(null);
  }, []);

  const handleClick = useCallback((appId, title) => {
    const minimizedWin = windows.find(w => w.appId === appId && w.minimized);
    if (minimizedWin) {
      restoreWindow(appId);
      return;
    }

    setBouncingApp(appId);
    setTimeout(() => setBouncingApp(null), 1600);
    onAppLaunch(appId, title);
  }, [onAppLaunch, restoreWindow, windows]);

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[100]" style={dockStyle}>
      <div
        ref={dockRef}
        className="flex items-end gap-[6px] px-3 py-[6px] rounded-[24px] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(50px) saturate(200%)',
          WebkitBackdropFilter: 'blur(50px) saturate(200%)',
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {dockApps.map((app, i) => (
          <div key={app.id} className="relative flex flex-col items-center">
            {tooltip === app.id && (
              <div className="absolute -top-11 px-3 py-[6px] rounded-md text-[13px] text-white/90 font-medium whitespace-nowrap shadow-lg border border-black/10"
                style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)' }}>
                {app.title}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 transform" style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(40px)' }} />
              </div>
            )}
            <div
              className="dock-icon w-[50px] h-[50px] cursor-pointer transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${scales[i]})${bouncingApp === app.id ? '' : ''}`,
                transformOrigin: 'bottom center',
                animation: bouncingApp === app.id ? 'dock-bounce 0.8s ease 2' : 'none',
                marginBottom: (scales[i] - 1) * 25,
              }}
              onClick={() => handleClick(app.id, app.title)}
              onMouseEnter={() => setTooltip(app.id)}
              onMouseLeave={() => setTooltip(null)}
            >
              {appIcons[app.id]}
            </div>
            {isAppOpen(app.id) && (
              <div className="w-[4px] h-[4px] rounded-full bg-white/80 mt-1 absolute -bottom-1 shadow-sm" />
            )}
          </div>
        ))}

        {/* Separator before Trash */}
        <div className="w-px h-11 bg-white/20 mx-1 self-center shadow-[1px_0_0_rgba(0,0,0,0.1)] rounded-full" />
        <div className="relative flex flex-col items-center">
          {tooltip === 'trash' && (
            <div className="absolute -top-11 px-3 py-[6px] rounded-md text-[13px] text-white/90 font-medium whitespace-nowrap shadow-lg border border-black/10"
              style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)' }}>
              Trash
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 transform" style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(40px)' }} />
            </div>
          )}
          <div
            className="dock-icon w-[50px] h-[50px] cursor-pointer transition-transform duration-100 ease-out"
            style={{ transform: `scale(${scales[dockApps.length] || 1})`, transformOrigin: 'bottom center' }}
            onMouseEnter={() => setTooltip('trash')}
            onMouseLeave={() => setTooltip(null)}
          >
            {appIcons.trash}
          </div>
          {/* Assuming trash doesn't typically have the dot, but we could add it if open */}
        </div>
      </div>
    </div>
  );
}
