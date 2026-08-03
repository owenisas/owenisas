import { useState, useCallback, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { WindowProvider, useWindows } from './contexts/WindowContext';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import Window from './components/Window';
import ContextMenu from './components/ContextMenu';
import Spotlight from './components/Spotlight';
import Launchpad from './components/Launchpad';
import WidgetBoard from './components/WidgetBoard';

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
import AnimeTracker from './apps/AnimeTracker';
import Music from './apps/Music';
import ActivityGraph from './apps/ActivityGraph';
import CodeEditor from './apps/CodeEditor';
import { wallpaperPresets } from './data/wallpaperPresets';
import { parseDeepLinkIntent, buildDeepLinkParams, APP_DEFAULT_TITLES } from './lib/deepLink';
import {
  loadIconOffsets,
  saveIconOffsets,
  loadWallpaperId,
  DESKTOP_WALLPAPER_EVENT,
} from './lib/desktopPersistence';

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
  anime: AnimeTracker,
  music: Music,
  activity: ActivityGraph,
  codeeditor: CodeEditor,
};



function DraggableDesktopIcon({ iconId, icon, label, initialOffset, onOffsetCommit, onDoubleClick, isSelected, onSelect }) {
  const [offset, setOffset] = useState(() => initialOffset ?? { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const offsetRef = useRef(initialOffset ?? { x: 0, y: 0 });

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    hasMoved.current = false;
    startPos.current = { x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const newX = e.clientX - startPos.current.x;
    const newY = e.clientY - startPos.current.y;
    if (Math.abs(newX - offsetRef.current.x) > 2 || Math.abs(newY - offsetRef.current.y) > 2) {
      hasMoved.current = true;
    }
    const next = { x: newX, y: newY };
    offsetRef.current = next;
    setOffset(next);
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (hasMoved.current && onOffsetCommit) {
      onOffsetCommit(iconId, offsetRef.current);
    }
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

function readDeepLinkIntentOnMount() {
  if (typeof window === 'undefined') {
    return { wantsDesktop: false, app: null, payload: null };
  }
  return parseDeepLinkIntent(new URLSearchParams(window.location.search));
}

function Desktop() {
  const { windows, openWindow, activeWindowId } = useWindows();
  const deepLinkAtMount = useMemo(() => readDeepLinkIntentOnMount(), []);
  const [contextMenu, setContextMenu] = useState(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const [view, setView] = useState(() => (deepLinkAtMount.wantsDesktop ? 'desktop' : 'showroom'));
  const [desktopVisible, setDesktopVisible] = useState(() => deepLinkAtMount.wantsDesktop);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const showroomRef = useRef(null);
  const deepLinkHandledRef = useRef(false);
  const [iconOffsets, setIconOffsets] = useState(() => loadIconOffsets());
  const [wallpaperId, setWallpaperId] = useState(() => loadWallpaperId());

  const wallpaperStyle = useMemo(() => {
    const preset = wallpaperPresets.find((w) => w.id === wallpaperId) ?? wallpaperPresets[0];
    return {
      ...preset.preview,
      backgroundColor: '#1a1f2b',
    };
  }, [wallpaperId]);

  useEffect(() => {
    if (!deepLinkAtMount.wantsDesktop) return undefined;
    const t = window.setTimeout(() => showroomRef.current?.__pause?.(), 700);
    return () => window.clearTimeout(t);
  }, [deepLinkAtMount.wantsDesktop]);

  useEffect(() => {
    const onWallpaper = (e) => {
      if (e?.detail && wallpaperPresets.some((w) => w.id === e.detail)) {
        setWallpaperId(e.detail);
      }
    };
    const onStorage = (e) => {
      if (e.key === 'owenisas-wallpaper-id' && e.newValue && wallpaperPresets.some((w) => w.id === e.newValue)) {
        setWallpaperId(e.newValue);
      }
    };
    window.addEventListener(DESKTOP_WALLPAPER_EVENT, onWallpaper);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(DESKTOP_WALLPAPER_EVENT, onWallpaper);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!desktopVisible || deepLinkHandledRef.current) return;
    if (deepLinkAtMount.app) {
      const title = APP_DEFAULT_TITLES[deepLinkAtMount.app] ?? deepLinkAtMount.app;
      openWindow(deepLinkAtMount.app, title, appIcons[deepLinkAtMount.app], deepLinkAtMount.payload);
    }
    deepLinkHandledRef.current = true;
  }, [desktopVisible, openWindow, deepLinkAtMount]);

  useEffect(() => {
    if (!desktopVisible) return;
    const params = buildDeepLinkParams(windows, activeWindowId);
    const url = new URL(window.location.href);
    const nextStr = params.toString();
    const curStr = url.searchParams.toString();
    if (nextStr === curStr) return;
    const search = nextStr ? `?${nextStr}` : '';
    window.history.replaceState({}, '', `${url.pathname}${search}${url.hash}`);
  }, [desktopVisible, windows, activeWindowId]);

  const handleIconOffsetCommit = useCallback((iconId, next) => {
    setIconOffsets((prev) => {
      const merged = { ...prev, [iconId]: next };
      saveIconOffsets(merged);
      return merged;
    });
  }, []);

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
          showroomRef.current?.__resume?.();
          const u = new URL(window.location.href);
          if (u.search) {
            window.history.replaceState({}, '', `${u.pathname}${u.hash}`);
          }
          deepLinkHandledRef.current = false;
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
              // Pause the 3D render loop after desktop fade-in completes
              // (0.45s wallpaper fade + 0.15s buffer) so its animations
              // don't bleed through the compositor once hidden.
              setTimeout(() => showroomRef.current?.__pause?.(), 700);
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
          ...wallpaperStyle,
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
          iconId="macintoshHD"
          icon={desktopIcons.macintoshHD}
          label="Macintosh HD"
          initialOffset={iconOffsets.macintoshHD}
          onOffsetCommit={handleIconOffsetCommit}
          isSelected={selectedIcon === 'macintoshHD'}
          onSelect={() => setSelectedIcon('macintoshHD')}
          onDoubleClick={() => handleAppLaunch('finder', 'Finder')}
        />

        <DraggableDesktopIcon
          iconId="github"
          icon={desktopIcons.github}
          label="GitHub"
          initialOffset={iconOffsets.github}
          onOffsetCommit={handleIconOffsetCommit}
          isSelected={selectedIcon === 'github'}
          onSelect={() => setSelectedIcon('github')}
          onDoubleClick={() => handleAppLaunch('safari', 'Safari', { url: 'https://github.com/owenisas' })}
        />

        <DraggableDesktopIcon
          iconId="linkedin"
          icon={desktopIcons.linkedin}
          label="LinkedIn"
          initialOffset={iconOffsets.linkedin}
          onOffsetCommit={handleIconOffsetCommit}
          isSelected={selectedIcon === 'linkedin'}
          onSelect={() => setSelectedIcon('linkedin')}
          onDoubleClick={() => handleAppLaunch('safari', 'Safari', { url: 'https://www.linkedin.com/in/thomas-suen-84776a262/' })}
        />

        <DraggableDesktopIcon
          iconId="x"
          icon={desktopIcons.x}
          label="X"
          initialOffset={iconOffsets.x}
          onOffsetCommit={handleIconOffsetCommit}
          isSelected={selectedIcon === 'x'}
          onSelect={() => setSelectedIcon('x')}
          onDoubleClick={() => handleAppLaunch('safari', 'Safari', { url: 'https://x.com/ThomasSuen6' })}
        />
      </div>

      <WidgetBoard onAppLaunch={handleAppLaunch} />

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
        '--dock-y': desktopVisible ? '0px' : '80px',
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
