import { useState, useCallback, useEffect, useRef } from 'react';
import { WindowProvider, useWindows } from './contexts/WindowContext';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import Window from './components/Window';
import ContextMenu from './components/ContextMenu';
import Spotlight from './components/Spotlight';
import DeskShowroom from './components/DeskShowroom';
import Launchpad from './components/Launchpad';
import { appIcons, desktopIcons } from './components/Icons';

import Calculator from './apps/Calculator';
import Terminal from './apps/Terminal';
import Finder from './apps/Finder';
import Notes from './apps/Notes';
import Safari from './apps/Safari';
import Settings from './apps/Settings';
import TextEdit from './apps/TextEdit';
import Photos from './apps/Photos';

const appComponents = {
  calculator: Calculator,
  terminal: Terminal,
  finder: Finder,
  notes: Notes,
  safari: Safari,
  settings: Settings,
  textedit: TextEdit,
  photos: Photos,
};

function Desktop() {
  const { windows, openWindow } = useWindows();
  const [contextMenu, setContextMenu] = useState(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const [view, setView] = useState('showroom'); // 'showroom' | 'transitioning' | 'desktop'
  const [desktopVisible, setDesktopVisible] = useState(false);
  const showroomRef = useRef(null);

  const handleAppLaunch = useCallback((appId, title) => {
    if (appId === 'launchpad') {
      setLaunchpadOpen(prev => !prev);
      return;
    }
    openWindow(appId, title, appIcons[appId]);
  }, [openWindow]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: 'New Folder', action: () => {} },
        { label: 'Get Info', action: () => {} },
        { divider: true },
        { label: 'Change Desktop Background...', action: () => handleAppLaunch('settings', 'System Settings') },
        { label: 'Use Stacks', action: () => {} },
        { divider: true },
        { label: 'Sort By', disabled: true },
        { label: 'Clean Up', action: () => {} },
        { divider: true },
        { label: 'Show View Options', action: () => {} },
      ],
    });
  }, [handleAppLaunch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        setSpotlightOpen(prev => !prev);
      }
      // ESC while in desktop → fade out desktop, then zoom back out
      if (e.key === 'Escape' && view === 'desktop') {
        setDesktopVisible(false);
        setTimeout(() => {
          setView('showroom');
          showroomRef.current?.__zoomOut?.();
        }, 600);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [view]);

  return (
    <>
      {/* 3D Desk Showroom — always mounted, behind desktop */}
      <div style={{ pointerEvents: view === 'desktop' ? 'none' : 'auto' }}>
        <DeskShowroom
          ref={showroomRef}
          onEnterScreen={() => {
            setView('desktop');
            requestAnimationFrame(() => {
              requestAnimationFrame(() => setDesktopVisible(true));
            });
          }}
        />
      </div>

      {/* Desktop — always mounted, fades in/out with CSS transition */}
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: view === 'showroom' ? -1 : 10,
        pointerEvents: desktopVisible ? 'auto' : 'none',
      }}
    >
      {/* Wallpaper — fades in first */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/wallpaper.jpg)',
          opacity: desktopVisible ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
        onContextMenu={handleContextMenu}
        onClick={() => setContextMenu(null)}
      />

      {/* Menu Bar — slides down from top */}
      <MenuBar onSpotlightToggle={() => setSpotlightOpen(prev => !prev)} onAppLaunch={handleAppLaunch} barStyle={{
        transform: desktopVisible ? 'translateY(0)' : 'translateY(-30px)',
        opacity: desktopVisible ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s, opacity 0.4s ease 0.3s',
      }} />

      {/* Desktop Icons — fade in with delay */}
      <div className="absolute top-[40px] right-4 flex flex-col items-center gap-4 z-[5]" style={{
        opacity: desktopVisible ? 1 : 0,
        transform: desktopVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s',
      }}>
        <button
          className="flex flex-col items-center gap-[2px] p-2 rounded-[6px] hover:bg-white/10 focus:bg-[#0058d0]/60 outline-none w-[80px] transition-colors desktop-icon group"
          onDoubleClick={() => handleAppLaunch('finder', 'Finder')}
        >
          <div className="w-[56px] h-[56px] drop-shadow-md transition-transform group-hover:-translate-y-0.5">{desktopIcons.macintoshHD}</div>
          <span className="text-[12px] text-white text-center font-medium leading-tight px-1 rounded-sm group-focus:bg-[#0058d0] mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)' }}>Macintosh HD</span>
        </button>
      </div>

      {/* Windows */}
      {windows.map(win => {
        const AppComponent = appComponents[win.appId];
        if (!AppComponent) return null;
        return (
          <Window key={win.id} windowData={win}>
            <AppComponent />
          </Window>
        );
      })}

      {/* Dock */}
      <Dock onAppLaunch={handleAppLaunch} dockStyle={{
        transform: desktopVisible ? 'translateY(0)' : 'translateY(80px)',
        opacity: desktopVisible ? 1 : 0,
        transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s, opacity 0.4s ease 0.4s',
      }} />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Launchpad */}
      <Launchpad
        isOpen={launchpadOpen}
        onClose={() => setLaunchpadOpen(false)}
        onAppLaunch={(id, title) => { handleAppLaunch(id, title); setLaunchpadOpen(false); }}
      />

      {/* Spotlight */}
      <Spotlight
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        onAppLaunch={(id, title) => { handleAppLaunch(id, title); setSpotlightOpen(false); }}
      />
    </div>
    </>
  );
}

export default function App() {
  return (
    <WindowProvider>
      <Desktop />
    </WindowProvider>
  );
}
