import { useState, useEffect, useRef } from 'react';
import { useWindows } from '../contexts/WindowContext';

const appMenus = {
  finder:     ['File', 'Edit', 'View', 'Go', 'Window', 'Help'],
  safari:     ['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window', 'Help'],
  notes:      ['File', 'Edit', 'Format', 'View', 'Window', 'Help'],
  terminal:   ['Shell', 'Edit', 'View', 'Profiles', 'Window', 'Help'],
  calculator: ['File', 'Edit', 'View', 'Convert', 'Window', 'Help'],
  settings:   ['File', 'Edit', 'View', 'Window', 'Help'],
  textedit:   ['File', 'Edit', 'Format', 'View', 'Window', 'Help'],
  photos:     ['File', 'Edit', 'Image', 'View', 'Window', 'Help'],
};
const defaultMenus = ['File', 'Edit', 'View', 'Window', 'Help'];
function getMenuItems(appId) {
  return appMenus[appId] || defaultMenus;
}

export default function MenuBar({ onSpotlightToggle, onAppLaunch, barStyle }) {
  const { activeApp } = useWindows();
  const [time, setTime] = useState('');
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(/,/g, '') +
        ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAppleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[25px] z-[200] flex items-center justify-between text-[13px] text-white/95"
      style={{
        background: 'rgba(30,30,30,0.45)',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(50px) saturate(180%)',
        WebkitBackdropFilter: 'blur(50px) saturate(180%)',
        paddingLeft: 6, paddingRight: 6,
        ...barStyle,
      }}>
      <div className="flex items-center">
        <div className="relative" ref={menuRef}>
          <button className="h-[22px] hover:bg-white/20 transition-colors flex items-center justify-center rounded-[4px]" style={{ padding: '0 12px' }} onClick={() => setAppleMenuOpen(!appleMenuOpen)}>
            <svg width="13" height="15" viewBox="0 0 14 17" fill="white">
              <path d="M11.3 8.9c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.7-.7-2.8-.7C2.8 4.1 1.4 5 .6 6.4c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.3.9-1.3 1.2-2.5 1.3-2.6 0 0-2.5-1-2.5-3.2zM9 3.2C9.6 2.4 10 1.4 9.9.3 9 .3 7.9.9 7.3 1.7c-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2z"/>
            </svg>
          </button>
          {appleMenuOpen && (
            <div
              className="absolute top-[24px] left-0 rounded-[6px] overflow-hidden"
              style={{
                background: 'rgba(38,38,38,0.88)',
                backdropFilter: 'blur(60px) saturate(200%)',
                WebkitBackdropFilter: 'blur(60px) saturate(200%)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.12)',
                minWidth: 220,
                padding: '4px 0',
              }}
            >
              {[
                { label: 'About This Mac', action: () => onAppLaunch?.('settings', 'System Settings') },
                '-',
                { label: 'System Settings...', action: () => onAppLaunch?.('settings', 'System Settings'), shortcut: '⌘,' },
                { label: 'App Store...', action: null },
                '-',
                { label: 'Recent Items', action: null, arrow: true },
                '-',
                { label: 'Force Quit...', action: null, shortcut: '⌥⌘⎋' },
                '-',
                { label: 'Sleep', action: null },
                { label: 'Restart...', action: null },
                { label: 'Shut Down...', action: null },
                '-',
                { label: 'Lock Screen', action: null, shortcut: '⌃⌘Q' },
                { label: 'Log Out Thomas...', action: null, shortcut: '⇧⌘Q' },
              ].map((item, i) => item === '-' ? (
                <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
              ) : (
                <button
                  key={i}
                  className="flex items-center justify-between w-full text-left cursor-default"
                  style={{
                    padding: '2px 12px 2px 20px',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: '20px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0a84ff'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
                  onClick={() => { setAppleMenuOpen(false); item.action?.(); }}
                >
                  <span>{item.label}</span>
                  {item.shortcut && <span style={{ fontSize: 12, opacity: 0.45, marginLeft: 24 }}>{item.shortcut}</span>}
                  {item.arrow && <span style={{ fontSize: 10, opacity: 0.4, marginLeft: 24 }}>▶</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="h-[22px] hover:bg-white/15 transition-colors rounded-[4px] font-bold text-white" style={{ padding: '0 10px' }}>{activeApp?.title || 'Finder'}</button>
        {getMenuItems(activeApp?.appId).map(item => (
          <button key={item} className="h-[22px] hover:bg-white/15 transition-colors rounded-[4px] text-white/85" style={{ padding: '0 10px' }}>{item}</button>
        ))}
      </div>
      <div className="flex items-center text-white/90" style={{ gap: 4 }}>
        {/* Spotlight */}
        <button onClick={onSpotlightToggle} className="h-[22px] flex justify-center items-center hover:bg-white/15 rounded-[4px] transition-colors" style={{ padding: '0 5px' }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="m14 14-3.5-3.5"/></svg>
        </button>
        {/* Control Center — two horizontal toggles stacked */}
        <button className="h-[22px] flex justify-center items-center hover:bg-white/15 rounded-[4px] transition-colors" style={{ padding: '0 5px' }}>
          <svg width="11" height="9" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <rect x="1" y="1" width="12" height="4" rx="2"/>
            <rect x="1" y="7" width="12" height="4" rx="2"/>
            <circle cx="9.5" cy="3" r="1.2" fill="currentColor" stroke="none"/>
            <circle cx="4.5" cy="9" r="1.2" fill="currentColor" stroke="none"/>
          </svg>
        </button>
        {/* WiFi */}
        <button className="h-[22px] flex justify-center items-center hover:bg-white/15 rounded-[4px] transition-colors" style={{ padding: '0 5px' }}>
          <svg width="12" height="9" viewBox="0 0 16 12" fill="currentColor">
            <circle cx="8" cy="10.5" r="1.2"/>
            <path d="M5.5 8.2a3.6 3.6 0 0 1 5 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M3 5.5a7 7 0 0 1 10 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M0.8 3a10.5 10.5 0 0 1 14.4 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        {/* Battery */}
        <button className="h-[22px] flex justify-center items-center hover:bg-white/15 rounded-[4px] transition-colors" style={{ padding: '0 5px' }}>
          <svg width="18" height="9" viewBox="0 0 22 10">
            <rect x="0.5" y="0.5" width="18" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5"/>
            <path d="M19.5 3.2v3.6a1 1 0 0 0 0-3.6z" fill="currentColor" opacity="0.4"/>
            <rect x="1.5" y="1.5" width="13" height="7" rx="1.2" fill="currentColor"/>
          </svg>
        </button>
        {/* Date/Time */}
        <button className="h-[22px] hover:bg-white/15 rounded-[4px] transition-colors text-[13px] tabular-nums" style={{ padding: '0 8px', whiteSpace: 'nowrap' }}>
          {time}
        </button>
      </div>
    </div>
  );
}
