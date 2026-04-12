import { useState } from 'react';
import { appIcons } from './Icons';

// All apps available in Launchpad, grouped by rows
const launchpadApps = [
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
  { id: 'quicktime', title: 'QuickTime' },
  { id: 'clock', title: 'Clock' },
  { id: 'home', title: 'Home' },
  { id: 'findmy', title: 'Find My' },
  { id: 'siri', title: 'Siri' },
  { id: 'settings', title: 'Settings' },
  { id: 'activitymonitor', title: 'Activity Monitor' },
  { id: 'diskutility', title: 'Disk Utility' },
];

export default function Launchpad({ isOpen, onClose, onAppLaunch }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = searchQuery
    ? launchpadApps.filter(app => app.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : launchpadApps;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(40px) saturate(120%)',
        WebkitBackdropFilter: 'blur(40px) saturate(120%)',
        animation: 'launchpad-in 0.3s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Search bar */}
      <div className="flex justify-center pt-8 pb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[220px] h-[28px] rounded-[8px] px-7 text-[13px] text-white placeholder-white/40 outline-none"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '0.5px solid rgba(255,255,255,0.15)',
            }}
            autoFocus
          />
          <svg className="absolute left-2 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>

      {/* App grid */}
      <div className="flex-1 overflow-auto px-16">
        <div className="grid gap-y-6 justify-center mx-auto max-w-[900px]"
          style={{ gridTemplateColumns: 'repeat(7, 90px)', justifyContent: 'center' }}>
          {filteredApps.map(app => (
            <button
              key={app.id}
              className="flex flex-col items-center gap-1 group"
              onClick={(e) => {
                e.stopPropagation();
                onAppLaunch(app.id, app.title);
                onClose();
              }}
            >
              <div className="w-[64px] h-[64px] transition-transform group-hover:scale-110 group-active:scale-95">
                {appIcons[app.id] || (
                  <div className="w-full h-full rounded-[14px] bg-white/10 flex items-center justify-center text-white/30 text-[10px]">
                    {app.title[0]}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-white/90 text-center leading-tight max-w-[80px] truncate">
                {app.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Page dots */}
      <div className="flex justify-center gap-2 py-4">
        <div className="w-[6px] h-[6px] rounded-full bg-white/80" />
        <div className="w-[6px] h-[6px] rounded-full bg-white/30" />
      </div>

      <style>{`
        @keyframes launchpad-in {
          from { opacity: 0; transform: scale(1.1); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
