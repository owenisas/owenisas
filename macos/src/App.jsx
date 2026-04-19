import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { WindowProvider, useWindows } from './contexts/WindowContext';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import Window from './components/Window';
import ContextMenu from './components/ContextMenu';
import Spotlight from './components/Spotlight';
import Launchpad from './components/Launchpad';

const DeskShowroom = lazy(() => import('./components/DeskShowroom'));
import { appIcons, desktopIcons } from './components/Icons';

import Calculator from './apps/Calculator';
import Terminal from './apps/Terminal';
import Finder from './apps/Finder';
import Notes from './apps/Notes';
import Safari from './apps/Safari';
import Settings from './apps/Settings';
import TextEdit from './apps/TextEdit';
import Photos from './apps/Photos';
import Messages from './apps/Messages';
import Mail from './apps/Mail';
import Preview from './apps/Preview';
import Weather from './apps/Weather';
import Calendar from './apps/Calendar';
import AboutThisMac from './apps/AboutThisMac';

const appComponents = {
  calculator: Calculator,
  terminal: Terminal,
  finder: Finder,
  notes: Notes,
  safari: Safari,
  settings: Settings,
  textedit: TextEdit,
  photos: Photos,
  messages: Messages,
  mail: Mail,
  preview: Preview,
  weather: Weather,
  calendar: Calendar,
  aboutthismac: AboutThisMac,
};



function DraggableDesktopIcon({ icon, label, onDoubleClick, isSelected, onSelect }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    hasMoved.current = false;
    startPos.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - startPos.current.x;
    const newY = e.clientY - startPos.current.y;
    if (Math.abs(newX - offset.x) > 2 || Math.abs(newY - offset.y) > 2) {
      hasMoved.current = true;
    }
    setOffset({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleClick = (e) => {
    if (!hasMoved.current && onSelect) {
      onSelect(e);
    }
  };

  return (
    <button
      className={`flex flex-col items-center gap-[2px] p-2 rounded-[6px] outline-none w-[90px] desktop-icon group relative ${isSelected ? 'bg-white/20' : 'hover:bg-white/10'}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        zIndex: isDragging ? 50 : 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      onDoubleClick={(e) => {
        if (!hasMoved.current && onDoubleClick) onDoubleClick(e);
      }}
    >
      <div className="w-[56px] h-[56px] drop-shadow-md flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
        {icon}
      </div>
      <span
        className="text-[12px] text-white text-center font-medium leading-tight px-1.5 rounded-sm mt-1 max-w-full truncate"
        style={{
          textShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
          background: isSelected ? '#0058d0' : 'transparent',
        }}
      >
        {label}
      </span>
    </button>
  );
}

function Desktop() {
  const { windows, openWindow } = useWindows();
  const [contextMenu, setContextMenu] = useState(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const [view, setView] = useState('showroom'); // 'showroom' | 'transitioning' | 'desktop'
  const [desktopVisible, setDesktopVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const showroomRef = useRef(null);

  const handleAppLaunch = useCallback((appId, title, payload) => {
    if (appId === 'launchpad') {
      setLaunchpadOpen(prev => !prev);
      return;
    }
    openWindow(appId, title, appIcons[appId], payload);
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
        return;
      }
      if (e.key === 'Escape') {
        if (spotlightOpen) { setSpotlightOpen(false); return; }
        if (launchpadOpen) { setLaunchpadOpen(false); return; }
        if (contextMenu) { setContextMenu(null); return; }
        if (view === 'desktop') {
          setDesktopVisible(false);
          setTimeout(() => {
            setView('showroom');
            showroomRef.current?.__zoomOut?.();
          }, 600);
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [view, spotlightOpen, launchpadOpen, contextMenu]);

  return (
    <>
      {/* 3D Desk Showroom — lazy loaded, behind desktop.
          Opacity-only fade (no visibility toggle) avoids the fade-in snap
          on return, where visibility-hidden would hold the element invisible
          for 0.45s while opacity silently ramped to 1, then pop in. */}
      <div
        style={{
          opacity: desktopVisible ? 0 : 1,
          pointerEvents: view === 'desktop' ? 'none' : 'auto',
          transition: 'opacity 0.45s ease',
          willChange: 'opacity',
        }}
      >
        <Suspense fallback={<div className="fixed inset-0 bg-[#0a0a0c]" />}>
          <DeskShowroom
            ref={showroomRef}
            onEnterScreen={() => {
              setView('desktop');
              requestAnimationFrame(() => {
                requestAnimationFrame(() => setDesktopVisible(true));
              });
            }}
          />
        </Suspense>
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
      {/* Wallpaper — fades in first. Duration matches the showroom fade-out
          (0.45s) so there's no dark-body gap between layers during the swap. */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/wallpaper.jpg)',
          backgroundColor: '#1a1f2b',
          opacity: desktopVisible ? 1 : 0,
          transition: 'opacity 0.45s ease',
          willChange: 'opacity',
        }}
        onContextMenu={handleContextMenu}
        onClick={() => { setContextMenu(null); setSelectedIcon(null); }}
      />

      {/* Menu Bar — slides down from top */}
      <MenuBar onSpotlightToggle={() => setSpotlightOpen(prev => !prev)} onAppLaunch={handleAppLaunch} barStyle={{
        transform: desktopVisible ? 'translateY(0)' : 'translateY(-30px)',
        opacity: desktopVisible ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s, opacity 0.4s ease 0.3s',
      }} />

      {/* Desktop Icons — fade in with delay */}
      <div className="absolute top-[40px] right-4 flex flex-col items-start gap-3 z-[5]" style={{
        opacity: desktopVisible ? 1 : 0,
        transform: desktopVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s',
      }}>
        <DraggableDesktopIcon
          icon={desktopIcons.macintoshHD}
          label="Macintosh HD"
          isSelected={selectedIcon === 'macintoshHD'}
          onSelect={() => setSelectedIcon('macintoshHD')}
          onDoubleClick={() => handleAppLaunch('finder', 'Finder')}
        />

        <DraggableDesktopIcon
          icon={desktopIcons.github}
          label="GitHub"
          isSelected={selectedIcon === 'github'}
          onSelect={() => setSelectedIcon('github')}
          onDoubleClick={() => handleAppLaunch('safari', 'Safari', { url: 'https://github.com/owenisas' })}
        />

        <DraggableDesktopIcon
          icon={desktopIcons.linkedin}
          label="LinkedIn"
          isSelected={selectedIcon === 'linkedin'}
          onSelect={() => setSelectedIcon('linkedin')}
          onDoubleClick={() => handleAppLaunch('safari', 'Safari', { url: 'https://www.linkedin.com/in/thomas-suen-84776a262/' })}
        />

        <DraggableDesktopIcon
          icon={desktopIcons.x}
          label="X"
          isSelected={selectedIcon === 'x'}
          onSelect={() => setSelectedIcon('x')}
          onDoubleClick={() => handleAppLaunch('safari', 'Safari', { url: 'https://x.com/ThomasSuen6' })}
        />
      </div>

      {/* Windows */}
      {windows.map(win => {
        const AppComponent = appComponents[win.appId];
        if (!AppComponent) return null;
        return (
          <Window key={win.id} windowData={win}>
            <AppComponent windowData={win} onAppLaunch={handleAppLaunch} />
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
