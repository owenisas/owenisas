import { useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToggle, MacSlider, MacSettingsRow, MacSettingsGroup, MacSettingsIcon, MacSearchField } from '../components/ui/MacControls';
import { wallpaperPresets } from '../data/wallpaperPresets';
import { loadWallpaperId, persistDesktopWallpaperId } from '../lib/desktopPersistence';

const categories = [
  { id: 'family',        label: 'Family',             icon: 'person.2.fill',       color: '#30D158' },
  { divider: true, id: 'd1' },
  { id: 'network',       label: 'Wi-Fi',              icon: 'wifi',                color: '#007AFF' },
  { id: 'bluetooth',     label: 'Bluetooth',          icon: 'bluetooth',           color: '#007AFF' },
  { id: 'internet',      label: 'Network',            icon: 'globe',               color: '#007AFF' },
  { id: 'vpn',           label: 'VPN',                icon: 'lock.shield.fill',    color: '#007AFF' },
  { id: 'battery',       label: 'Battery',            icon: 'battery.100',         color: '#30D158' },
  { divider: true, id: 'd2' },
  { id: 'general',       label: 'General',            icon: 'gear',                color: '#8E8E93' },
  { id: 'accessibility', label: 'Accessibility',      icon: 'figure.stand',        color: '#007AFF' },
  { id: 'appearance',    label: 'Appearance',         icon: 'circle.fill',         color: '#000000' },
  { id: 'intelligence',  label: 'Apple Intelligence...',icon: 'sparkles',          color: '#AF52DE' },
  { id: 'desktop',       label: 'Desktop & Dock',     icon: 'macwindow',           color: '#000000' },
  { id: 'displays',      label: 'Displays',           icon: 'display',             color: '#007AFF' },
  { id: 'menubar',       label: 'Menu Bar',           icon: 'menubar.rectangle',   color: '#8E8E93' },
  { id: 'spotlight',     label: 'Spotlight',          icon: 'magnifyingglass',     color: '#007AFF' },
  { id: 'wallpaper',     label: 'Wallpaper',          icon: 'photo.fill',          color: '#32ADE6' },
  { divider: true, id: 'd3' },
  { id: 'notifications', label: 'Notifications',      icon: 'bell.fill',           color: '#FF3B30' },
  { id: 'sound',         label: 'Sound',              icon: 'speaker.wave.3.fill', color: '#FF3B30' },
  { id: 'focus',         label: 'Focus',              icon: 'moon.fill',           color: '#5856D6' },
  { id: 'screentime',    label: 'Screen Time',        icon: 'hourglass',           color: '#5856D6' },
];

const batteryHistory = [18, 19, 21, 22, 24, 23, 22, 20, 19, 20, 23, 28, 32, 36, 40, 45, 44, 41, 37, 33, 29, 26, 23, 21];

export default function Settings() {
  const [active, setActive] = useState('general');
  const [subPanel, setSubPanel] = useState(null); // 'about', 'storage', etc.
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
    wallpaperId: loadWallpaperId(),
  });

  const set = (k, v) => setS(p => ({ ...p, [k]: v }));

  const filtered = search ? categories.filter(c => c.label.toLowerCase().includes(search.toLowerCase())) : categories;
  const selectedWallpaper = wallpaperPresets.find(w => w.id === s.wallpaperId) ?? wallpaperPresets[0];

  const NavRow = ({ icon, color, label, noBorder, onClick }) => (
    <button
      className="w-full text-left hover:bg-black/[0.03] transition-colors"
      onClick={onClick}
    >
      <MacSettingsRow
        label={
          <div className="flex items-center gap-3">
            <div className="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center shrink-0" style={{ background: color }}>
              <SFSymbol name={icon} size={14} color="white" />
            </div>
            <span>{label}</span>
          </div>
        }
        noBorder={noBorder}
      >
        <SFSymbol name="chevron.right" size={14} color="#C7C7CC" />
      </MacSettingsRow>
    </button>
  );

  const ContentHeader = ({ title, onBack }) => (
    <div className="flex items-center h-[52px] px-4 border-b border-black/5 bg-[#f5f5f7]/80 sticky top-0 z-10 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <button
          className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-black/5 transition-colors"
          onClick={onBack}
        >
          <SFSymbol name="chevron.left" size={16} color="#007AFF" weight={2} />
        </button>
        <button
          className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center opacity-30 cursor-default"
          disabled
        >
          <SFSymbol name="chevron.right" size={16} color="#007AFF" weight={2} />
        </button>
      </div>
      {title && <span className="ml-4 text-[13px] font-semibold text-black">{title}</span>}
    </div>
  );

  const AboutPanel = () => (
    <div className="pb-8">
      <ContentHeader title="About" onBack={() => setSubPanel(null)} />
      <div className="px-10">
      <div className="flex flex-col items-center pt-8 pb-6">
        {/* MacBook Pro Image */}
        <div className="w-[120px] h-[80px] relative mb-4">
          <div className="absolute inset-x-0 top-0 h-[65px] bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] rounded-t-[6px] border border-[#3a3a3a] overflow-hidden">
            <div className="absolute inset-[3px] bg-[#4a9eff] rounded-[3px]" />
          </div>
          <div className="absolute bottom-0 inset-x-[-8px] h-[12px] bg-gradient-to-b from-[#c4c4c4] to-[#a8a8a8] rounded-[2px]" />
          <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[20px] h-[4px] bg-[#8a8a8a] rounded-full" />
        </div>
        <h2 className="text-[28px] font-bold text-black">MacBook Pro</h2>
        <p className="text-[13px] text-[#86868B] mt-1">14-inch, 2023</p>
      </div>

      <MacSettingsGroup>
        <MacSettingsRow label="Name" noBorder={false}>
          <span className="text-[14px] text-black/80">User's MacBook Pro</span>
        </MacSettingsRow>
        <MacSettingsRow label="Chip" noBorder={false}>
          <span className="text-[14px] text-black/80">Apple M3 Pro</span>
        </MacSettingsRow>
        <MacSettingsRow label="Memory" noBorder={false}>
          <span className="text-[14px] text-black/80">18 GB</span>
        </MacSettingsRow>
        <MacSettingsRow label="Serial number" noBorder={false}>
          <span className="text-[14px] text-black/80">XXXX1234ABCD</span>
        </MacSettingsRow>
        <MacSettingsRow label="Coverage Expired" noBorder>
          <button className="px-3 py-1 text-[12px] text-black/80 bg-black/5 rounded-[6px] border border-black/10 hover:bg-black/10 transition-colors">
            Details...
          </button>
        </MacSettingsRow>
      </MacSettingsGroup>

      <div className="mt-6 mb-2">
        <span className="text-[13px] font-semibold text-black">macOS</span>
      </div>
      <MacSettingsGroup>
        <MacSettingsRow
          label={
            <div className="flex items-center gap-3">
              <div className="w-[36px] h-[36px] rounded-[8px] bg-gradient-to-br from-[#ffd700] via-[#ff6b00] to-[#ff1493] flex items-center justify-center">
                <span className="text-white text-[18px] font-bold">S</span>
              </div>
              <span className="text-[14px]">macOS Sequoia</span>
            </div>
          }
          noBorder
        >
          <span className="text-[13px] text-black/60">Version 15.0</span>
        </MacSettingsRow>
      </MacSettingsGroup>

      <div className="mt-6 mb-2">
        <span className="text-[13px] font-semibold text-black">Displays</span>
      </div>
      <MacSettingsGroup>
        <MacSettingsRow
          label={
            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[22px] bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] rounded-[3px] border border-black/10 flex items-center justify-center">
                <div className="w-[26px] h-[16px] bg-[#4a9eff] rounded-[1px]" />
              </div>
              <span className="text-[14px]">Built-in Liquid Retina XDR Display</span>
            </div>
          }
          noBorder
        >
          <span className="text-[13px] text-black/60">14-inch (3024 × 1964)</span>
        </MacSettingsRow>
      </MacSettingsGroup>
      </div>
    </div>
  );

  const panels = {
    general: (
      <>
        <div className="flex flex-col items-center pt-10 pb-8">
          <div className="w-[68px] h-[68px] bg-[#8E8E93] rounded-[18px] flex items-center justify-center shadow-sm border border-black/10">
            <SFSymbol name="gear" size={40} color="white" />
          </div>
          <h2 className="text-[26px] font-bold text-black mt-4">General</h2>
          <div className="text-[13px] text-[#86868B] text-center mt-1.5 max-w-[340px] leading-relaxed">
            Manage your overall setup and preferences for Mac, such as software updates, device language, AirDrop, and more.
          </div>
        </div>

        <MacSettingsGroup>
          <NavRow icon="display" color="#8E8E93" label="About" onClick={() => setSubPanel('about')} />
          <NavRow icon="gear" color="#8E8E93" label="Software Update" />
          <NavRow icon="internaldrive" color="#8E8E93" label="Storage" noBorder />
        </MacSettingsGroup>

        <MacSettingsGroup>
          <NavRow icon="applelogo" color="#FF3B30" label="AppleCare & Warranty" noBorder />
        </MacSettingsGroup>

        <MacSettingsGroup>
          <NavRow icon="wifi" color="#007AFF" label="AirDrop & Continuity" />
          <NavRow icon="key" color="#8E8E93" label="AutoFill & Passwords" />
          <NavRow icon="calendar" color="#007AFF" label="Date & Time" />
          <NavRow icon="globe" color="#007AFF" label="Language & Region" />
          <NavRow icon="list.bullet.rectangle" color="#8E8E93" label="Login Items & Extensions" />
          <NavRow icon="person.2" color="#8E8E93" label="Sharing" />
          <NavRow icon="internaldrive.fill" color="#8E8E93" label="Startup Disk" />
          <NavRow icon="clock.arrow.circlepath" color="#30D158" label="Time Machine" />
          <NavRow icon="checkmark.seal.fill" color="#8E8E93" label="Device Management" noBorder />
        </MacSettingsGroup>
      </>
    ),

    appearance: (
      <>
        <PanelTitle>Appearance</PanelTitle>
        <MacSettingsGroup>
          <div className="px-5 py-4">
            <div className="text-[13px] text-black/85 mb-3">Appearance</div>
            <div className="flex flex-wrap gap-4">
              {['light', 'dark', 'auto'].map(mode => (
                <button key={mode} className="flex flex-col items-center gap-2" onClick={() => set('appearance', mode)}>
                  <div
                    className="w-[80px] h-[52px] rounded-[8px] border-2 overflow-hidden"
                    style={{ borderColor: s.appearance === mode ? '#0a84ff' : 'rgba(0,0,0,0.1)' }}
                  >
                    <div className={`w-full h-full ${mode === 'light' ? 'bg-[#e8e8e8]' : mode === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gradient-to-r from-[#e8e8e8] to-[#1e1e1e]'}`}>
                      <div className="mt-2 mx-2 h-2 rounded" style={{ background: mode === 'light' ? '#ccc' : 'rgba(255,255,255,0.15)' }} />
                      <div className="mt-1 mx-2 h-1.5 rounded w-3/4" style={{ background: mode === 'light' ? '#ddd' : 'rgba(255,255,255,0.1)' }} />
                    </div>
                  </div>
                  <span className="text-[12px] text-[#6e6e73] capitalize">{mode}</span>
                </button>
              ))}
            </div>
          </div>
        </MacSettingsGroup>
        <MacSettingsGroup>
          <div className="px-5 py-4">
            <div className="text-[13px] text-black/85 mb-3">Accent color</div>
            <div className="flex flex-wrap gap-2.5">
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
                  className="w-[20px] h-[20px] rounded-full border-[1.5px] transition-transform hover:scale-110"
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
              className="appearance-none bg-black/[0.06] text-black/80 text-[12px] rounded-[6px] px-2.5 h-[24px] border-[0.5px] border-black/10 outline-none"
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
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-black/85">Size</span>
              <span className="text-[11px] text-[#86868b] tabular-nums">{s.dockSize}px</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-[#86868b]">Small</span>
              <MacSlider value={s.dockSize} onChange={v => set('dockSize', v)} min={32} max={80} />
              <span className="text-[11px] text-[#86868b]">Large</span>
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
                    background: s.dockPosition === pos ? '#0A84FF' : 'rgba(0,0,0,0.06)',
                    color: s.dockPosition === pos ? '#fff' : 'rgba(0,0,0,0.6)',
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
              className="appearance-none bg-black/[0.06] text-black/80 text-[12px] rounded-[6px] px-2.5 h-[24px] border-[0.5px] border-black/10 outline-none"
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
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-black/85">Brightness</span>
            </div>
            <div className="flex items-center gap-2.5">
              <SFSymbol name="display" size={14} color="rgba(0,0,0,0.4)" />
              <MacSlider value={s.brightness} onChange={v => set('brightness', v)} />
              <SFSymbol name="display" size={18} color="rgba(0,0,0,0.6)" />
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
            <span className="text-[12px] text-[#86868b]">3456 x 2234</span>
          </MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),

    wallpaper: (
      <>
        <PanelTitle>Wallpaper</PanelTitle>
        <MacSettingsGroup title="Current wallpaper">
          <div className="p-5">
            <WallpaperPreview wallpaper={selectedWallpaper} />
          </div>
        </MacSettingsGroup>
        <MacSettingsGroup title="macOS wallpapers">
          <div className="p-5 grid grid-cols-2 gap-3">
            {wallpaperPresets.map(wallpaper => (
              <button
                key={wallpaper.id}
                className="text-left group"
                onClick={() => {
                  set('wallpaperId', wallpaper.id);
                  persistDesktopWallpaperId(wallpaper.id);
                }}
              >
                <div
                  className="h-[88px] rounded-[8px] overflow-hidden border transition-shadow duration-150"
                  style={{
                    ...wallpaper.preview,
                    borderColor: s.wallpaperId === wallpaper.id ? '#0a84ff' : 'rgba(255,255,255,0.08)',
                    boxShadow: s.wallpaperId === wallpaper.id ? '0 0 0 1px rgba(10,132,255,0.28), inset 0 1px 0 rgba(255,255,255,0.16)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="h-full w-full flex items-end justify-between p-2.5" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.24))' }}>
                    <div className="max-w-[70%]">
                      <div className="text-[12px] text-white font-medium leading-tight">{wallpaper.name}</div>
                      <div className="text-[10px] text-black/70 leading-tight mt-0.5">{wallpaper.caption}</div>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full border border-white/40 ${s.wallpaperId === wallpaper.id ? 'bg-white' : 'bg-white/20'}`} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </MacSettingsGroup>
      </>
    ),

    sound: (
      <>
        <PanelTitle>Sound</PanelTitle>
        <MacSettingsGroup title="Output">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-black/85">Output volume</span>
              <span className="text-[11px] text-[#86868b] tabular-nums">{s.volume}%</span>
            </div>
            <div className="flex items-center gap-2.5">
              <SFSymbol name="speaker.wave.3" size={14} color="rgba(0,0,0,0.4)" weight={1.2} />
              <MacSlider value={s.volume} onChange={v => set('volume', v)} />
            </div>
          </div>
          <MacSettingsRow label="Output device" noBorder>
            <span className="text-[12px] text-[#86868b]">{s.outputDevice}</span>
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="Sound effects">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-black/85">Alert volume</span>
            </div>
            <MacSlider value={s.alertVolume} onChange={v => set('alertVolume', v)} />
          </div>
          <MacSettingsRow label="Play sound on startup">
            <MacToggle checked={s.startupSound} onChange={v => set('startupSound', v)} />
          </MacSettingsRow>
          <MacSettingsRow label="Alert sound" noBorder>
            <span className="text-[12px] text-[#86868b]">Breeze</span>
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
            <span className="text-[12px] text-[#86868b]">When Unlocked</span>
          </MacSettingsRow>
          <MacSettingsRow label="Allow notifications on lock screen" noBorder>
            <MacToggle checked={true} onChange={() => {}} />
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="Application notifications">
          {['Calendar', 'FaceTime', 'Finder', 'Mail', 'Messages', 'Safari', 'Tips'].map((app, i, arr) => (
            <MacSettingsRow key={app} label={app} noBorder={i === arr.length - 1}>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#86868b]">Banners</span>
                <SFSymbol name="chevron.right" size={10} color="#C7C7CC" />
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
              <SFSymbol name="chevron.right" size={10} color="#C7C7CC" />
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
              <SFSymbol name="wifi" size={12} color="rgba(0,0,0,0.55)" />
              <span className="text-[12px] text-[#6e6e73]">{s.wifiNetwork}</span>
            </div>
          </MacSettingsRow>
        </MacSettingsGroup>
        <MacSettingsGroup title="Other services">
          <MacSettingsRow label="Firewall">
            <span className="text-[12px] text-[#34C759]">Active</span>
          </MacSettingsRow>
          <MacSettingsRow label="VPN" noBorder>
            <span className="text-[12px] text-[#86868b]">Not Connected</span>
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
              <span className="text-[12px] text-[#86868b]">{d.status}</span>
            </MacSettingsRow>
          ))}
        </MacSettingsGroup>
        <MacSettingsGroup title="Nearby devices">
          <div className="px-4 py-6 text-center text-[12px] text-black/30">Searching for devices...</div>
        </MacSettingsGroup>
      </>
    ),

    battery: (
      <>
        <PanelTitle>Battery</PanelTitle>
        <MacSettingsGroup>
          <div className="px-5 py-4">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="relative w-[42px] h-[22px]">
                <div className="absolute inset-0 rounded-[4px] border-[1.5px] border-black/40" />
                <div className="absolute right-[-4px] top-[5px] w-[3px] h-[10px] rounded-r-[2px] bg-black/40" />
                <div
                  className="absolute left-[2px] top-[2px] bottom-[2px] rounded-[2px]"
                  style={{ width: `${s.batteryLevel * 0.36}px`, background: s.batteryLevel > 20 ? '#34C759' : '#FF3B30' }}
                />
              </div>
              <div>
                <div className="text-[16px] text-black font-medium">{s.batteryLevel}%</div>
                <div className="text-[11px] text-[#86868b]">Power Source: Power Adapter</div>
              </div>
            </div>
            <div className="h-[72px] rounded-[8px] flex items-end gap-[2px] px-2 py-2" style={{ background: 'rgba(0,0,0,0.04)' }}>
              {batteryHistory.map((height, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-[2px]"
                  style={{
                    height: `${height}px`,
                    background: i > 16 ? 'rgba(52,199,89,0.58)' : 'rgba(52,199,89,0.34)',
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-[#86868b]">
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
        <div className="flex flex-col items-center py-7">
          <svg width="56" height="68" viewBox="0 0 14 17" fill="#1d1d1f" opacity="0.9" className="mb-3">
            <path d="M11.3 8.9c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.7-.7-2.8-.7C2.8 4.1 1.4 5 .6 6.4c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.3.9-1.3 1.2-2.5 1.3-2.6 0 0-2.5-1-2.5-3.2zM9 3.2C9.6 2.4 10 1.4 9.9.3 9 .3 7.9.9 7.3 1.7c-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2z" />
          </svg>
          <h2 className="text-black text-[20px] font-medium">macOS Tahoe</h2>
          <span className="text-[#86868b] text-[13px]">Version 26.0</span>
        </div>
        <MacSettingsGroup>
          <MacSettingsRow label="Chip"><span className="text-[13px] text-black/70">Apple M3 Max</span></MacSettingsRow>
          <MacSettingsRow label="Memory"><span className="text-[13px] text-black/70">36 GB</span></MacSettingsRow>
          <MacSettingsRow label="Startup Disk"><span className="text-[13px] text-black/70">Macintosh HD</span></MacSettingsRow>
          <MacSettingsRow label="Serial Number"><span className="text-[13px] text-black/70">FVFXXXXXXXXX</span></MacSettingsRow>
          <MacSettingsRow label="macOS" noBorder><span className="text-[13px] text-black/70">Tahoe 26.0 (26A000)</span></MacSettingsRow>
        </MacSettingsGroup>
      </>
    ),
  };

  return (
    <div className="flex h-full shadow-[0_0_1px_rgba(0,0,0,0.3)] bg-[#F2F2F6]">
      {/* Sidebar background matched to true light mode */}
      <div
        className="w-[240px] shrink-0 overflow-y-auto"
        style={{ background: 'rgba(235,235,240,0.85)', backdropFilter: 'blur(30px)' }}
      >
        <div className="px-4 py-3 pb-2 sticky top-0 z-10" style={{ background: 'rgba(235,235,240,0.85)', backdropFilter: 'blur(30px)' }}>
          <div className="bg-black/5 rounded-md flex items-center px-2 py-1 gap-1.5 border border-black/[0.04]">
            <SFSymbol name="magnifyingglass" size={12} color="rgba(0,0,0,0.4)" />
            <input type="text" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-[13px] text-black w-full outline-none placeholder:text-black/40" />
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-3 mb-2 mt-1 px-4">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white text-[16px] font-medium" style={{ background: 'linear-gradient(to bottom right, #555, #222)' }}>
              TS
            </div>
            <div>
              <div className="text-[14px] font-bold text-black tracking-tight">Thomas Suen</div>
              <div className="text-[11px] text-[#86868b] leading-tight mt-0.5">Apple Account</div>
            </div>
          </div>
        </div>

        <div className="px-2 space-y-[2px] pb-4">
          {filtered.map((cat, i) => {
            if (cat.divider) {
              return <div key={cat.id} className="h-[2px]" />; // Spacer between groups
            }

            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                className="w-full text-left px-2 py-1.5 min-h-[32px] text-[13px] flex items-center gap-2.5 rounded-[8px] cursor-default transition-colors duration-75"
                style={{
                  background: isActive ? '#0A84FF' : 'transparent',
                  color: isActive ? '#fff' : 'black',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                onClick={() => { setActive(cat.id); setSubPanel(null); }}
              >
                <div className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center shrink-0" style={{ background: cat.color }}>
                  <SFSymbol name={cat.icon} size={13} color="white" />
                </div>
                <span className={isActive ? "font-medium" : ""}>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: subPanel ? '0' : '0 40px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          {subPanel === 'about' ? (
            <AboutPanel />
          ) : (
            panels[active] || panels['general']
          )}
        </div>
      </div>
    </div>
  );
}

function PanelTitle({ children }) {
  return <h2 className="text-black text-[22px] font-semibold mb-5 tracking-tight pt-6">{children}</h2>;
}

function WallpaperPreview({ wallpaper }) {
  return (
    <div
      className="w-full h-[152px] rounded-[8px] overflow-hidden border"
      style={{
        ...wallpaper.preview,
        borderColor: 'rgba(255,255,255,0.12)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div className="h-full w-full flex items-end justify-between p-4" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.26))' }}>
        <div>
          <div className="text-[15px] font-medium text-white leading-tight">{wallpaper.name}</div>
          <div className="text-[11px] text-black/70 mt-1">{wallpaper.caption}</div>
        </div>
        <div className="rounded-[8px] border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] text-white/85 backdrop-blur-sm">
          Tahoe
        </div>
      </div>
    </div>
  );
}
