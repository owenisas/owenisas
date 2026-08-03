import { useMemo, useState, useEffect } from 'react';
import { appIcons } from './Icons';

const implementedApps = new Set([
  'finder', 'safari', 'messages', 'mail', 'photos', 'calendar', 'notes',
  'weather', 'calculator', 'terminal', 'textedit', 'preview', 'settings',
  'anime', 'music', 'activity', 'codeeditor',
]);

const appCatalog = [
  { id: 'finder', title: 'Finder' },
  { id: 'safari', title: 'Safari' },
  { id: 'messages', title: 'Messages' },
  { id: 'mail', title: 'Mail' },
  { id: 'maps', title: 'Maps' },
  { id: 'photos', title: 'Photos' },
  { id: 'facetime', title: 'FaceTime' },
  { id: 'calendar', title: 'Calendar' },
  { id: 'contacts', title: 'Contacts' },
  { id: 'reminders', title: 'Reminders' },
  { id: 'notes', title: 'Notes' },
  { id: 'freeform', title: 'Freeform' },
  { id: 'music', title: 'Music' },
  { id: 'podcasts', title: 'Podcasts' },
  { id: 'tv', title: 'TV' },
  { id: 'news', title: 'News' },
  { id: 'stocks', title: 'Stocks' },
  { id: 'books', title: 'Books' },
  { id: 'appstore', title: 'App Store' },
  { id: 'weather', title: 'Weather' },
  { id: 'shortcuts', title: 'Shortcuts' },
  { id: 'passwords', title: 'Passwords' },
  { id: 'calculator', title: 'Calculator' },
  { id: 'terminal', title: 'Terminal' },
  { id: 'textedit', title: 'TextEdit' },
  { id: 'preview', title: 'Preview' },
  { id: 'voicememos', title: 'Voice Memos' },
  { id: 'photobooth', title: 'Photo Booth' },
  { id: 'quicktime', title: 'QuickTime Player' },
  { id: 'clock', title: 'Clock' },
  { id: 'home', title: 'Home' },
  { id: 'findmy', title: 'Find My' },
  { id: 'siri', title: 'Siri' },
  { id: 'anime', title: 'Anime Tracker' },
  { id: 'activity', title: 'GitHub Activity' },
  { id: 'codeeditor', title: 'Code' },
  { id: 'settings', title: 'Settings' },
  { id: 'activitymonitor', title: 'Activity Monitor' },
  { id: 'diskutility', title: 'Disk Utility' },
].filter(app => implementedApps.has(app.id));

function AppGlyph({ app, size = 70 }) {
  return (
    <div className="shrink-0" style={{ width: size, height: size }}>
      {appIcons[app.id] || (
        <div
          className="w-full h-full rounded-[14px] flex items-center justify-center text-white/72 text-[24px] font-semibold"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))' }}
        >
          {app.title[0]}
        </div>
      )}
    </div>
  );
}

function AppTile({ app, onLaunch }) {
  return (
    <button
      className="app-tile w-[110px] h-[110px] flex flex-col items-center justify-start gap-1.5 rounded-[12px] p-2 outline-none transition-transform active:scale-95 group focus:bg-white/10"
      aria-label={`Open ${app.title}`}
      onClick={() => onLaunch(app.id, app.title)}
    >
      <div className="w-[74px] h-[74px] transition-transform duration-200 group-hover:-translate-y-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
        <AppGlyph app={app} size={74} />
      </div>
      <span
        className="text-[12px] text-white text-center font-medium leading-tight max-w-[100px] truncate px-1 rounded-sm"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
      >
        {app.title}
      </span>
    </button>
  );
}

export default function Launchpad({ isOpen, onClose, onAppLaunch }) {
  const [renderOpen, setRenderOpen] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRenderOpen(true);
      setIsClosing(false);
    } else if (renderOpen) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRenderOpen(false);
        setIsClosing(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderOpen]);

  const filteredApps = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return appCatalog
      .filter(app => !normalized || app.title.toLowerCase().includes(normalized))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [searchQuery]);

  const launch = (id, title) => {
    onAppLaunch(id, title);
    onClose();
  };

  if (!renderOpen && !isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Launchpad"
      className="fixed inset-0 z-[300] flex flex-col items-center pt-[5vh] pb-[10vh] overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.15)',
        backdropFilter: 'blur(45px) saturate(160%)',
        WebkitBackdropFilter: 'blur(45px) saturate(160%)',
        animation: isClosing 
          ? 'launchpad-out 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
          : 'launchpad-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={(e) => {
        // If they click anything that isn't a button or input natively close it!
        if (e.target.closest('button') || e.target.closest('input')) return;
        setSearchQuery('');
        onClose();
      }}
    >
      {/* Search Header */}
      <div className="w-[360px] max-w-[90%] flex justify-center mt-16 shrink-0">
        <div
          className="flex items-center gap-2 rounded-[14px] px-3 py-1.5 w-full transition-colors focus-within:bg-white/12 bg-white/8"
          style={{ border: '0.5px solid rgba(255,255,255,0.25)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            aria-label="Search applications"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[16px] text-white font-light placeholder:text-white/40 outline-none h-[28px] text-center ml-[-26px]"
            autoFocus
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 shrink-0" />

      {/* Grid Layout */}
      <div className="flex-1 w-[90%] md:w-[95%] max-w-[1400px] overflow-y-auto px-4 hide-scrollbar">
        {filteredApps.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-white/50 gap-3">
            <div className="text-[22px] text-white/80 font-medium">No Results</div>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-7 gap-x-[1vw] gap-y-[4vh] justify-items-center mb-[5vh]">
            {filteredApps.map(app => (
              <AppTile key={app.id} app={app} onLaunch={launch} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes launchpad-in {
          0% { opacity: 0; transform: scale(1.05); filter: blur(5px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes launchpad-out {
          0% { opacity: 1; transform: scale(1); filter: blur(0); }
          100% { opacity: 0; transform: scale(1.05); filter: blur(5px); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}
