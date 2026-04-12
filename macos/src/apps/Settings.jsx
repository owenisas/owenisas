import { useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToggle, MacSlider, MacSettingsRow, MacSettingsGroup, MacSettingsIcon, MacSearchField } from '../components/ui/MacControls';

const categories = [
  { id: 'general',       label: 'General',            icon: 'gear',                    color: '#8E8E93' },
  { id: 'appearance',    label: 'Appearance',          icon: 'circle.fill',             color: '#007AFF' },
  { id: 'desktop',       label: 'Desktop & Dock',      icon: 'desktopcomputer',         color: '#007AFF' },
  { id: 'displays',      label: 'Displays',            icon: 'display',                 color: '#5856D6' },
  { id: 'wallpaper',     label: 'Wallpaper',           icon: 'photo.fill',              color: '#30D158' },
  { id: 'sound',         label: 'Sound',               icon: 'speaker.wave.3.fill',     color: '#FF3B30' },
  { id: 'notifications', label: 'Notifications',       icon: 'bell.fill',               color: '#FF3B30' },
  { id: 'privacy',       label: 'Privacy & Security',  icon: 'lock.shield.fill',        color: '#007AFF' },
  { id: 'network',       label: 'Network',             icon: 'globe',                   color: '#007AFF' },
  { id: 'bluetooth',     label: 'Bluetooth',           icon: 'bluetooth',               color: '#007AFF' },
  { id: 'battery',       label: 'Battery',             icon: 'battery.100',             color: '#30D158' },
  { id: 'about',         label: 'About',               icon: 'info.circle',             color: '#8E8E93' },
];

export default function Settings() {
  const [active, setActive] = useState('general');
  const [search, setSearch] = useState('');
  const [s, setS] = useState({
    handoff: true, askKeepChanges: true, closeWindows: false,
    appearance: 'dark', accentColor: '#0a84ff', highlightColor: '#0a84ff', sidebarIconSize: 'medium', wallpaperTinting: true,
    dockSize: 48, magnification: true, autoHideDock: false, dockPosition: 'bottom', minimizeEffect: 'genie', showRecents: true,
    brightness: 75, trueTone: true, nightShift: false,
    volume: 75, alertVolume: 80, startupSound: true, outputDevice: 'MacBook Pro Speakers',
    allowNotifications: true,
    fileVault: true, firewall: true,
    wifiEnabled: true, wifiNetwork: 'Home Network',
    bluetoothEnabled: true,
    batteryLevel: 87, lowPowerMode: false, optimizedCharging: true,
  });

  const set = (k, v) => setS(p => ({ ...p, [k]: v }));

  const filtered = search ? categories.filter(c => c.label.toLowerCase().includes(search.toLowerCase())) : categories;

  const panels = {
    general: (
      <>
        <PanelTitle>General</PanelTitle>
        <MacSettingsGroup>
          <MacSettingsRow label="Allow Handoff between this Mac and your iCloud devices">
            <MacToggle checked={s.handoff} onChange={v => set('handoff', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Ask to keep changes when closing documents">
            <MacToggle checked={s.askKeepChanges} onChange={v => set('askKeepChanges', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Close windows when quitting an application" noBorder>
            <MacToggle checked={s.closeWindows} onChange={v => set('closeWindows', v)} />
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="Recent items">
          <MacSettingsRow label="Recent documents, applications, and servers" noBorder>
            <span className="text-[13px] text-white/60">10</span>
          </MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),

    appearance: (
      <>
        <PanelTitle>Appearance</PanelTitle>
        <MacSettingsGroup>
          <div className="px-4 py-3">
            <div className="text-[13px] text-white/90 mb-3">Appearance</div>
            <div className="flex gap-4">
              {['light', 'dark', 'auto'].map(mode => (
                <button key={mode} className="flex flex-col items-center gap-1.5" onClick={() => set('appearance', mode)}>
                  <div
                    className="w-[72px] h-[48px] rounded-lg border-2 overflow-hidden"
                    style={{ borderColor: s.appearance === mode ? '#0a84ff' : 'rgba(255,255,255,0.1)' }}
                  >
                    <div className={`w-full h-full ${mode === 'light' ? 'bg-[#e8e8e8]' : mode === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gradient-to-r from-[#e8e8e8] to-[#1e1e1e]'}`}>
                      <div className="mt-2 mx-2 h-2 rounded" style={{ background: mode === 'light' ? '#ccc' : 'rgba(255,255,255,0.15)' }} />
                      <div className="mt-1 mx-2 h-1.5 rounded w-3/4" style={{ background: mode === 'light' ? '#ddd' : 'rgba(255,255,255,0.1)' }} />
                    </div>
                  </div>
                  <span className="text-[11px] text-white/60 capitalize">{mode}</span>
                </button>
              ))}
            </div>
          </div>
        </MacSettingsGroup>
        <MacSettingsGroup>
          <div className="px-4 py-3">
            <div className="text-[13px] text-white/90 mb-3">Accent color</div>
            <div className="flex gap-2">
              {[
                { c: 'linear-gradient(135deg,#ff5f57,#febc2e,#28c840,#007AFF,#5856d6)', label: 'Multi' },
                { c: '#007AFF', label: 'Blue' },
                { c: '#5856D6', label: 'Purple' },
                { c: '#FF2D55', label: 'Pink' },
                { c: '#FF3B30', label: 'Red' },
                { c: '#FF9500', label: 'Orange' },
                { c: '#FFCC00', label: 'Yellow' },
                { c: '#34C759', label: 'Green' },
                { c: '#8E8E93', label: 'Graphite' },
              ].map(({ c, label }) => (
                <button
                  key={label}
                  className="w-[18px] h-[18px] rounded-full border-[1.5px] transition-transform hover:scale-110"
                  style={{
                    background: c,
                    borderColor: s.accentColor === c ? '#fff' : 'rgba(0,0,0,0.2)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
                  }}
                  onClick={() => set('accentColor', c)}
                  title={label}
                />
              ))}
            </div>
          </div>
          <MacSettingsRow label="Sidebar icon size" noBorder>
            <select
              value={s.sidebarIconSize}
              onChange={e => set('sidebarIconSize', e.target.value)}
              className="appearance-none bg-white/8 text-white/80 text-[12px] rounded-[5px] px-2 h-[22px] border-[0.5px] border-white/10 outline-none"
            >
              <option value="small" className="bg-[#2a2a2a]">Small</option>
              <option value="medium" className="bg-[#2a2a2a]">Medium</option>
              <option value="large" className="bg-[#2a2a2a]">Large</option>
            </select>
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup>
          <MacSettingsRow label="Allow wallpaper tinting in windows" noBorder>
            <MacToggle checked={s.wallpaperTinting} onChange={v => set('wallpaperTinting', v)} />
          </MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),

    desktop: (
      <>
        <PanelTitle>Desktop & Dock</PanelTitle>
        <MacSettingsGroup>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] text-white/90">Size</span>
              <span className="text-[11px] text-white/40 tabular-nums">{s.dockSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/40">Small</span>
              <MacSlider value={s.dockSize} onChange={v => set('dockSize', v)} min={32} max={80} />
              <span className="text-[11px] text-white/40">Large</span>
            </div>
          </div>
          <MacSettingsRow label="Magnification">
            <MacToggle checked={s.magnification} onChange={v => set('magnification', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Position on screen">
            <div className="flex gap-1">
              {['left', 'bottom', 'right'].map(pos => (
                <button
                  key={pos}
                  className="text-[11px] px-2 h-[20px] rounded-[4px] capitalize"
                  style={{
                    background: s.dockPosition === pos ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                    color: s.dockPosition === pos ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                  onClick={() => set('dockPosition', pos)}
                >
                  {pos}
                </button>
              ))}
            </div>
          </MacSettingsRow>
          <MacSettingsRow label="Minimize windows using">
            <select
              value={s.minimizeEffect}
              onChange={e => set('minimizeEffect', e.target.value)}
              className="appearance-none bg-white/8 text-white/80 text-[12px] rounded-[5px] px-2 h-[22px] border-[0.5px] border-white/10 outline-none"
            >
              <option value="genie" className="bg-[#2a2a2a]">Genie Effect</option>
              <option value="scale" className="bg-[#2a2a2a]">Scale Effect</option>
            </select>
          </MacSettingsRow>
          <MacSettingsRow label="Automatically hide and show the Dock">
            <MacToggle checked={s.autoHideDock} onChange={v => set('autoHideDock', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Show suggested and recent apps in Dock" noBorder>
            <MacToggle checked={s.showRecents} onChange={v => set('showRecents', v)} />
          </MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),

    displays: (
      <>
        <PanelTitle>Displays</PanelTitle>
        <MacSettingsGroup>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] text-white/90">Brightness</span>
            </div>
            <div className="flex items-center gap-2">
              <SFSymbol name="display" size={14} color="rgba(255,255,255,0.4)" />
              <MacSlider value={s.brightness} onChange={v => set('brightness', v)} />
              <SFSymbol name="display" size={18} color="rgba(255,255,255,0.6)" />
            </div>
          </div>
          <MacSettingsRow label="True Tone" description="Automatically adapt display to make colors appear consistent in different ambient lighting">
            <MacToggle checked={s.trueTone} onChange={v => set('trueTone', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Night Shift" noBorder>
            <MacToggle checked={s.nightShift} onChange={v => set('nightShift', v)} />
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="Resolution">
          <MacSettingsRow label="Default for display" noBorder>
            <span className="text-[12px] text-white/50">3456 x 2234</span>
          </MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),

    wallpaper: (
      <>
        <PanelTitle>Wallpaper</PanelTitle>
        <MacSettingsGroup title="Current wallpaper">
          <div className="p-4">
            <div className="w-full h-[120px] rounded-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460, #533483)', border: '2px solid #0a84ff' }}>
              <div className="w-full h-full flex items-center justify-center text-white/30 text-[12px]">Current Wallpaper</div>
            </div>
          </div>
        </MacSettingsGroup>
        <MacSettingsGroup title="macOS wallpapers">
          <div className="p-4 grid grid-cols-4 gap-2">
            {[
              'linear-gradient(135deg, #667eea, #764ba2)',
              'linear-gradient(135deg, #f093fb, #f5576c)',
              'linear-gradient(135deg, #4facfe, #00f2fe)',
              'linear-gradient(135deg, #43e97b, #38f9d7)',
              'linear-gradient(135deg, #fa709a, #fee140)',
              'linear-gradient(135deg, #a18cd1, #fbc2eb)',
              'linear-gradient(135deg, #ffecd2, #fcb69f)',
              'linear-gradient(135deg, #667eea, #764ba2)',
            ].map((bg, i) => (
              <div key={i} className="h-[56px] rounded-lg cursor-default hover:ring-2 hover:ring-white/30 transition-shadow" style={{ background: bg }} />
            ))}
          </div>
        </MacSettingsGroup>
      </>
    ),

    sound: (
      <>
        <PanelTitle>Sound</PanelTitle>
        <MacSettingsGroup title="Output">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] text-white/90">Output volume</span>
              <span className="text-[11px] text-white/40 tabular-nums">{s.volume}%</span>
            </div>
            <div className="flex items-center gap-2">
              <SFSymbol name="speaker.wave.3" size={14} color="rgba(255,255,255,0.4)" weight={1.2} />
              <MacSlider value={s.volume} onChange={v => set('volume', v)} />
            </div>
          </div>
          <MacSettingsRow label="Output device" noBorder>
            <span className="text-[12px] text-white/50">{s.outputDevice}</span>
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="Sound effects">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] text-white/90">Alert volume</span>
            </div>
            <MacSlider value={s.alertVolume} onChange={v => set('alertVolume', v)} />
          </div>
          <MacSettingsRow label="Play sound on startup">
            <MacToggle checked={s.startupSound} onChange={v => set('startupSound', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Alert sound" noBorder>
            <span className="text-[12px] text-white/50">Breeze</span>
          </MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),

    notifications: (
      <>
        <PanelTitle>Notifications</PanelTitle>
        <MacSettingsGroup>
          <MacSettingsRow label="Allow notifications">
            <MacToggle checked={s.allowNotifications} onChange={v => set('allowNotifications', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Show previews">
            <span className="text-[12px] text-white/50">When Unlocked</span>
          </MacSettingsRow>
          <MacSettingsRow label="Allow notifications on lock screen" noBorder>
            <MacToggle checked={true} onChange={() => {}} />
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="Application notifications">
          {['Calendar', 'FaceTime', 'Finder', 'Mail', 'Messages', 'Safari', 'Tips'].map((app, i, arr) => (
            <MacSettingsRow key={app} label={app} noBorder={i === arr.length - 1}>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/40">Banners</span>
                <SFSymbol name="chevron.right" size={10} color="rgba(255,255,255,0.3)" />
              </div>
            </MacSettingsRow>
          ))}
        </MacSettingsGroup>
      </>
    ),

    privacy: (
      <>
        <PanelTitle>Privacy & Security</PanelTitle>
        <MacSettingsGroup title="Security">
          <MacSettingsRow label="FileVault" description="FileVault secures the data on your disk by encrypting its contents">
            <span className="text-[12px] text-[#34C759]">{s.fileVault ? 'On' : 'Off'}</span>
          </MacSettingsRow>
          <MacSettingsRow label="Firewall" noBorder>
            <span className="text-[12px] text-[#34C759]">{s.firewall ? 'Active' : 'Inactive'}</span>
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="Privacy">
          {['Location Services', 'Contacts', 'Calendars', 'Photos', 'Camera', 'Microphone', 'Accessibility', 'Full Disk Access'].map((item, i, arr) => (
            <MacSettingsRow key={item} label={item} noBorder={i === arr.length - 1}>
              <SFSymbol name="chevron.right" size={10} color="rgba(255,255,255,0.3)" />
            </MacSettingsRow>
          ))}
        </MacSettingsGroup>
      </>
    ),

    network: (
      <>
        <PanelTitle>Network</PanelTitle>
        <MacSettingsGroup title="Wi-Fi">
          <MacSettingsRow label="Wi-Fi">
            <MacToggle checked={s.wifiEnabled} onChange={v => set('wifiEnabled', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Network" noBorder>
            <div className="flex items-center gap-1.5">
              <SFSymbol name="wifi" size={12} color="rgba(255,255,255,0.6)" />
              <span className="text-[12px] text-white/60">{s.wifiNetwork}</span>
            </div>
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="Other services">
          <MacSettingsRow label="Firewall">
            <span className="text-[12px] text-[#34C759]">Active</span>
          </MacSettingsRow>
          <MacSettingsRow label="VPN" noBorder>
            <span className="text-[12px] text-white/40">Not Connected</span>
          </MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),

    bluetooth: (
      <>
        <PanelTitle>Bluetooth</PanelTitle>
        <MacSettingsGroup>
          <MacSettingsRow label="Bluetooth">
            <MacToggle checked={s.bluetoothEnabled} onChange={v => set('bluetoothEnabled', v)} />
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="My devices">
          {[
            { name: 'AirPods Pro', status: 'Connected', icon: '🎧' },
            { name: 'Magic Keyboard', status: 'Connected', icon: '⌨️' },
            { name: 'Magic Trackpad', status: 'Connected', icon: '🖱️' },
          ].map((d, i, arr) => (
            <MacSettingsRow key={d.name} label={<span className="flex items-center gap-2"><span>{d.icon}</span>{d.name}</span>} noBorder={i === arr.length - 1}>
              <span className="text-[12px] text-white/40">{d.status}</span>
            </MacSettingsRow>
          ))}
        </MacSettingsGroup>
        <MacSettingsGroup title="Nearby devices">
          <div className="px-4 py-6 text-center text-[12px] text-white/30">Searching for devices...</div>
        </MacSettingsGroup>
      </>
    ),

    battery: (
      <>
        <PanelTitle>Battery</PanelTitle>
        <MacSettingsGroup>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-[40px] h-[20px]">
                <div className="absolute inset-0 rounded-[4px] border-[1.5px] border-white/50" />
                <div className="absolute right-[-4px] top-[5px] w-[3px] h-[10px] rounded-r-[2px] bg-white/50" />
                <div className="absolute left-[2px] top-[2px] bottom-[2px] rounded-[2px]" style={{ width: `${s.batteryLevel * 0.34}px`, background: s.batteryLevel > 20 ? '#34C759' : '#FF3B30' }} />
              </div>
              <div>
                <div className="text-[15px] text-white font-medium">{s.batteryLevel}%</div>
                <div className="text-[11px] text-white/40">Power Source: Power Adapter</div>
              </div>
            </div>
            {/* Usage chart placeholder */}
            <div className="h-[60px] rounded-lg flex items-end gap-[2px] px-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${15 + Math.random() * 40}px`, background: 'rgba(52,199,89,0.4)' }} />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-white/30">
              <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>Now</span>
            </div>
          </div>
        </MacSettingsGroup>
        <MacSettingsGroup>
          <MacSettingsRow label="Low Power Mode">
            <MacToggle checked={s.lowPowerMode} onChange={v => set('lowPowerMode', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Optimized Battery Charging" description="To reduce battery aging, your Mac learns from your daily charging routine" noBorder>
            <MacToggle checked={s.optimizedCharging} onChange={v => set('optimizedCharging', v)} />
          </MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),

    about: (
      <>
        <div className="flex flex-col items-center py-6">
          <svg width="56" height="68" viewBox="0 0 14 17" fill="white" opacity="0.8" className="mb-3">
            <path d="M11.3 8.9c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.7-.7-2.8-.7C2.8 4.1 1.4 5 .6 6.4c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.3.9-1.3 1.2-2.5 1.3-2.6 0 0-2.5-1-2.5-3.2zM9 3.2C9.6 2.4 10 1.4 9.9.3 9 .3 7.9.9 7.3 1.7c-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2z"/>
          </svg>
          <h2 className="text-white text-[20px] font-medium">macOS Sequoia</h2>
          <span className="text-white/40 text-[13px]">Version 15.2</span>
        </div>
        <MacSettingsGroup>
          <MacSettingsRow label="Chip"><span className="text-[13px] text-white/70">Apple M3 Max</span></MacSettingsRow>
          <MacSettingsRow label="Memory"><span className="text-[13px] text-white/70">36 GB</span></MacSettingsRow>
          <MacSettingsRow label="Startup Disk"><span className="text-[13px] text-white/70">Macintosh HD</span></MacSettingsRow>
          <MacSettingsRow label="Serial Number"><span className="text-[13px] text-white/70">FVFXXXXXXXXX</span></MacSettingsRow>
          <MacSettingsRow label="macOS" noBorder><span className="text-[13px] text-white/70">Sequoia 15.2 (24C101)</span></MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 overflow-y-auto pt-2 pb-2" style={{ background: 'rgba(42,42,44,0.95)', borderRight: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="px-3 mb-2">
          <MacSearchField value={search} onChange={setSearch} />
        </div>
        <div className="px-1.5 space-y-[1px]">
          {filtered.map(cat => (
            <button
              key={cat.id}
              className="w-full text-left px-2.5 py-[5px] text-[13px] flex items-center gap-2.5 rounded-[6px] cursor-default transition-colors duration-75"
              style={{
                background: active === cat.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active === cat.id ? '#fff' : 'rgba(255,255,255,0.8)',
              }}
              onMouseEnter={e => { if (active !== cat.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (active !== cat.id) e.currentTarget.style.background = 'transparent'; }}
              onClick={() => setActive(cat.id)}
            >
              <MacSettingsIcon icon={cat.icon} color={cat.color} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'rgba(28,28,28,0.95)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 500 }}>
          {panels[active]}
        </div>
      </div>
    </div>
  );
}

function PanelTitle({ children }) {
  return <h2 className="text-white text-[20px] font-medium mb-4">{children}</h2>;
}
