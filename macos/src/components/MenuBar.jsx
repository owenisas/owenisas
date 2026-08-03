import { useState, useEffect, useRef } from 'react';
import { useWindows } from '../contexts/WindowContext';

const menuContents = {
  File: [
    { label: 'New Window', shortcut: '⌘N' },
    { label: 'New Tab', shortcut: '⌘T' },
    '-',
    { label: 'Open...', shortcut: '⌘O' },
    { label: 'Open Recent', arrow: true },
    '-',
    { label: 'Close Window', shortcut: '⌘W' },
    { label: 'Save', shortcut: '⌘S', disabled: true },
    '-',
    { label: 'Print...', shortcut: '⌘P' },
  ],
  Edit: [
    { label: 'Undo', shortcut: '⌘Z' },
    { label: 'Redo', shortcut: '⇧⌘Z' },
    '-',
    { label: 'Cut', shortcut: '⌘X' },
    { label: 'Copy', shortcut: '⌘C' },
    { label: 'Paste', shortcut: '⌘V' },
    { label: 'Select All', shortcut: '⌘A' },
    '-',
    { label: 'Find', arrow: true },
  ],
  View: [
    { label: 'Show Toolbar', shortcut: '⌥⌘T' },
    { label: 'Show Sidebar', shortcut: '⌥⌘S' },
    '-',
    { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
  ],
  Go: [
    { label: 'Back', shortcut: '⌘[' },
    { label: 'Forward', shortcut: '⌘]' },
    '-',
    { label: 'Recents', shortcut: '⇧⌘F' },
    { label: 'Documents', shortcut: '⇧⌘O' },
    { label: 'Desktop', shortcut: '⇧⌘D' },
    { label: 'Downloads', shortcut: '⌥⌘L' },
    { label: 'Home', shortcut: '⇧⌘H' },
    '-',
    { label: 'Go to Folder...', shortcut: '⇧⌘G' },
  ],
  Window: [
    { label: 'Minimize', shortcut: '⌘M' },
    { label: 'Zoom' },
    '-',
    { label: 'Bring All to Front' },
  ],
  Help: [
    { label: 'Search', disabled: true },
    '-',
    { label: 'macOS Help' },
  ],
  History: [
    { label: 'Show All History', shortcut: '⌘Y' },
    '-',
    { label: 'Clear History...' },
  ],
  Bookmarks: [
    { label: 'Show Bookmarks', shortcut: '⌥⌘B' },
    { label: 'Add Bookmark...', shortcut: '⌘D' },
  ],
  Format: [
    { label: 'Font', arrow: true },
    { label: 'Text', arrow: true },
    '-',
    { label: 'Make Rich Text', shortcut: '⇧⌘T' },
  ],
  Shell: [
    { label: 'New Window', shortcut: '⌘N' },
    { label: 'New Tab', shortcut: '⌘T' },
    '-',
    { label: 'Close Window', shortcut: '⌘W' },
  ],
  Profiles: [
    { label: 'Default' },
    { label: 'Basic' },
    { label: 'Grass' },
    { label: 'Homebrew' },
  ],
  Convert: [
    { label: 'Temperature' },
    { label: 'Length' },
    { label: 'Area' },
    { label: 'Volume' },
    { label: 'Weight' },
  ],
  Image: [
    { label: 'Rotate Left', shortcut: '⌘L' },
    { label: 'Rotate Right', shortcut: '⌘R' },
    '-',
    { label: 'Flip Horizontal' },
    { label: 'Flip Vertical' },
  ],
};

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

function ControlTile({ icon, title, detail, active, onClick }) {
  const glyph = icon === 'wifi' ? '⌁' : icon === 'bluetooth' ? 'ᛒ' : icon === 'moon.fill' ? '◐' : '◉';
  return (
    <button
      className="text-left rounded-[10px] p-2.5 transition-colors"
      style={{ background: active ? 'rgba(10,132,255,0.86)' : 'rgba(255,255,255,0.08)' }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)' }}>{glyph}</span>
        <span className="text-[12px] font-medium">{title}</span>
      </div>
      <div className="mt-1 pl-8 text-[10px] text-white/65 truncate">{detail}</div>
    </button>
  );
}

export default function MenuBar({ onSpotlightToggle, onAppLaunch, barStyle }) {
  const { activeApp } = useWindows();
  const [time, setTime] = useState('');
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [wifiOn, setWifiOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [focusOn, setFocusOn] = useState(false);
  const menuRef = useRef(null);
  const menuBarRef = useRef(null);
  const controlCenterRef = useRef(null);

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
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
      if (controlCenterRef.current && !controlCenterRef.current.contains(e.target)) {
        setControlCenterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setAppleMenuOpen(false);
      setOpenMenu(null);
      setControlCenterOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[25px] z-[200] flex items-center justify-between text-[13px] text-white/92"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))',
        borderBottom: '0.5px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(54px) saturate(190%)',
        WebkitBackdropFilter: 'blur(54px) saturate(190%)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
        paddingLeft: 8, paddingRight: 8,
        ...barStyle,
      }}>
      <div className="flex items-center">
        <div className="relative" ref={menuRef}>
          <button aria-label="Apple Menu" className="h-[22px] hover:bg-white/20 transition-colors flex items-center justify-center rounded-[6px]" style={{ padding: '0 12px' }} onClick={() => setAppleMenuOpen(!appleMenuOpen)}>
            <svg width="13" height="15" viewBox="0 0 14 17" fill="white">
              <path d="M11.3 8.9c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.7-.7-2.8-.7C2.8 4.1 1.4 5 .6 6.4c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.3.9-1.3 1.2-2.5 1.3-2.6 0 0-2.5-1-2.5-3.2zM9 3.2C9.6 2.4 10 1.4 9.9.3 9 .3 7.9.9 7.3 1.7c-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2z"/>
            </svg>
          </button>
          {appleMenuOpen && (
            <div
              className="absolute top-[24px] left-0 rounded-[8px] overflow-hidden"
              style={{
                background: 'rgba(34,35,40,0.76)',
                backdropFilter: 'blur(70px) saturate(200%)',
                WebkitBackdropFilter: 'blur(70px) saturate(200%)',
                boxShadow: 'var(--mac-shadow-popover)',
                minWidth: 220,
                padding: '4px 0',
              }}
            >
              {[
                { label: 'About This Mac', action: () => onAppLaunch?.('aboutthismac', 'About This Mac') },
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
                  type="button"
                  disabled={!item.action}
                  aria-disabled={!item.action}
                  className="flex items-center justify-between w-full text-left cursor-default"
                  style={{
                    padding: '2px 12px 2px 20px',
                    fontSize: 13,
                    color: item.action ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.38)',
                    lineHeight: '20px',
                  }}
                  onMouseEnter={e => { if (item.action) { e.currentTarget.style.background = '#0a84ff'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = item.action ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.38)'; }}
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
        <button className="h-[22px] hover:bg-white/15 transition-colors rounded-[6px] font-semibold text-white" style={{ padding: '0 10px' }}>{activeApp?.title || 'Finder'}</button>
        <div ref={menuBarRef} className="flex items-center">
          {getMenuItems(activeApp?.appId).map(item => (
            <div key={item} className="relative">
              <button
                className="h-[22px] hover:bg-white/15 transition-colors rounded-[6px] text-white/80"
                style={{ padding: '0 9px', background: openMenu === item ? 'rgba(255,255,255,0.15)' : undefined }}
                onClick={() => setOpenMenu(openMenu === item ? null : item)}
                onMouseEnter={() => openMenu && setOpenMenu(item)}
              >
                {item}
              </button>
              {openMenu === item && menuContents[item] && (
                <div
                  className="absolute top-[24px] left-0 rounded-[8px] overflow-hidden"
                  style={{
                    background: 'rgba(34,35,40,0.76)',
                    backdropFilter: 'blur(70px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(70px) saturate(200%)',
                    boxShadow: 'var(--mac-shadow-popover)',
                    minWidth: 200,
                    padding: '4px 0',
                    zIndex: 1000,
                  }}
                >
                  {menuContents[item].map((menuItem, i) => menuItem === '-' ? (
                    <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                  ) : (
                    <button
                      key={i}
                      className="flex items-center justify-between w-full text-left cursor-default"
                      style={{
                        padding: '2px 12px 2px 20px',
                        fontSize: 13,
                        color: menuItem.disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
                        lineHeight: '20px',
                        pointerEvents: menuItem.disabled ? 'none' : 'auto',
                      }}
                      onMouseEnter={e => { if (!menuItem.disabled) { e.currentTarget.style.background = '#0a84ff'; e.currentTarget.style.color = '#fff'; }}}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = menuItem.disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)'; }}
                      onClick={() => setOpenMenu(null)}
                    >
                      <span>{menuItem.label}</span>
                      {menuItem.shortcut && <span style={{ fontSize: 12, opacity: 0.45, marginLeft: 24 }}>{menuItem.shortcut}</span>}
                      {menuItem.arrow && <span style={{ fontSize: 10, opacity: 0.4, marginLeft: 24 }}>▶</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center text-white/90" style={{ gap: 3 }}>
        {/* Spotlight */}
        <button aria-label="Spotlight" onClick={onSpotlightToggle} className="h-[22px] flex justify-center items-center hover:bg-white/15 rounded-[6px] transition-colors" style={{ padding: '0 6px' }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="m14 14-3.5-3.5"/></svg>
        </button>
        {/* Control Center — two horizontal toggles stacked */}
        <div className="relative" ref={controlCenterRef}>
          <button aria-label="Control Center" onClick={() => setControlCenterOpen(v => !v)} className="h-[22px] flex justify-center items-center hover:bg-white/15 rounded-[6px] transition-colors" style={{ padding: '0 6px', background: controlCenterOpen ? 'rgba(255,255,255,0.16)' : undefined }}>
            <svg width="11" height="9" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <rect x="1" y="1" width="12" height="4" rx="2"/>
              <rect x="1" y="7" width="12" height="4" rx="2"/>
              <circle cx="9.5" cy="3" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="4.5" cy="9" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
          </button>
          {controlCenterOpen && (
            <div className="absolute top-[27px] right-0 w-[292px] rounded-[14px] p-3 text-white" style={{ background: 'rgba(36,37,43,0.86)', backdropFilter: 'blur(54px) saturate(180%)', WebkitBackdropFilter: 'blur(54px) saturate(180%)', border: '0.5px solid rgba(255,255,255,0.16)', boxShadow: 'var(--mac-shadow-popover)' }}>
              <div className="grid grid-cols-2 gap-2">
                <ControlTile icon="wifi" title="Wi-Fi" detail={wifiOn ? 'Home Network' : 'Off'} active={wifiOn} onClick={() => setWifiOn(v => !v)} />
                <ControlTile icon="bluetooth" title="Bluetooth" detail={bluetoothOn ? 'On' : 'Off'} active={bluetoothOn} onClick={() => setBluetoothOn(v => !v)} />
                <ControlTile icon="moon.fill" title="Focus" detail={focusOn ? 'On' : 'Off'} active={focusOn} onClick={() => setFocusOn(v => !v)} />
                <ControlTile icon="airplayaudio" title="Sound" detail="MacBook Pro Speakers" active />
              </div>
              <div className="mt-3 rounded-[10px] p-2.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between text-[11px] text-white/70"><span>Display</span><span>75%</span></div>
                <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden"><div className="h-full w-3/4 rounded-full bg-white/90" /></div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/55 px-1"><span>Battery</span><span className="text-white/80">87% · Charging</span></div>
            </div>
          )}
        </div>
        {/* WiFi */}
        <button aria-label="Wi-Fi" className="h-[22px] flex justify-center items-center hover:bg-white/15 rounded-[6px] transition-colors" style={{ padding: '0 6px' }}>
          <svg width="12" height="9" viewBox="0 0 16 12" fill="currentColor">
            <circle cx="8" cy="10.5" r="1.2"/>
            <path d="M5.5 8.2a3.6 3.6 0 0 1 5 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M3 5.5a7 7 0 0 1 10 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M0.8 3a10.5 10.5 0 0 1 14.4 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        {/* Battery */}
        <button aria-label="Battery" className="h-[22px] flex justify-center items-center hover:bg-white/15 rounded-[6px] transition-colors" style={{ padding: '0 6px' }}>
          <svg width="18" height="9" viewBox="0 0 22 10">
            <rect x="0.5" y="0.5" width="18" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5"/>
            <path d="M19.5 3.2v3.6a1 1 0 0 0 0-3.6z" fill="currentColor" opacity="0.4"/>
            <rect x="1.5" y="1.5" width="13" height="7" rx="1.2" fill="currentColor"/>
          </svg>
        </button>
        {/* Date/Time */}
        <button className="h-[22px] hover:bg-white/15 rounded-[6px] transition-colors text-[13px] tabular-nums" style={{ padding: '0 8px', whiteSpace: 'nowrap' }}>
          {time}
        </button>
      </div>
    </div>
  );
}
