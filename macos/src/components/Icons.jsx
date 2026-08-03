/* eslint-disable react-refresh/only-export-components */
// Real macOS app icons extracted from system applications (256x256 PNG)

const Icon = ({ src, alt }) => (
  <img src={src} alt={alt} className="w-full h-full" draggable={false} />
);

const BooksIcon = () => (
  <div
    className="w-full h-full rounded-[18%] overflow-hidden relative"
    style={{
      background: 'linear-gradient(145deg, #ff8b24 0%, #f55b16 48%, #d83d11 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -10px 18px rgba(108,22,4,0.24)',
    }}
    aria-label="Books"
  >
    <div className="absolute inset-[15%] rounded-[8%] bg-white shadow-[0_5px_12px_rgba(0,0,0,0.22)]" />
    <div className="absolute left-[50%] top-[15%] bottom-[15%] w-[1px] bg-black/10" />
    <div className="absolute left-[23%] right-[56%] top-[28%] h-[4%] rounded-full bg-[#f25b18]/70" />
    <div className="absolute left-[23%] right-[56%] top-[39%] h-[4%] rounded-full bg-[#f25b18]/55" />
    <div className="absolute left-[23%] right-[56%] top-[50%] h-[4%] rounded-full bg-[#f25b18]/40" />
    <div className="absolute left-[56%] right-[23%] top-[28%] h-[4%] rounded-full bg-[#f25b18]/70" />
    <div className="absolute left-[56%] right-[23%] top-[39%] h-[4%] rounded-full bg-[#f25b18]/55" />
    <div className="absolute left-[56%] right-[23%] top-[50%] h-[4%] rounded-full bg-[#f25b18]/40" />
  </div>
);

// All available app icons — extracted from /System/Applications and CoreServices
export const appIcons = {
  // Core dock apps
  finder: <Icon src="/icons/finder.png" alt="Finder" />,
  launchpad: <Icon src="/icons/launchpad.png" alt="Launchpad" />,
  safari: <Icon src="/icons/safari.png" alt="Safari" />,
  mail: <Icon src="/icons/mail.png" alt="Mail" />,
  messages: <Icon src="/icons/messages.png" alt="Messages" />,
  maps: <Icon src="/icons/maps.png" alt="Maps" />,
  photos: <Icon src="/icons/photos.png" alt="Photos" />,
  facetime: <Icon src="/icons/facetime.png" alt="FaceTime" />,
  calendar: <Icon src="/icons/calendar.png" alt="Calendar" />,
  notes: <Icon src="/icons/notes.png" alt="Notes" />,
  reminders: <Icon src="/icons/reminders.png" alt="Reminders" />,
  music: <Icon src="/icons/music.png" alt="Music" />,
  podcasts: <Icon src="/icons/podcasts.png" alt="Podcasts" />,
  tv: <Icon src="/icons/tv.png" alt="TV" />,
  news: <Icon src="/icons/news.png" alt="News" />,
  appstore: <Icon src="/icons/appstore.png" alt="App Store" />,
  settings: <Icon src="/icons/settings.png" alt="System Settings" />,

  // Productivity
  calculator: <Icon src="/icons/calculator.png" alt="Calculator" />,
  textedit: <Icon src="/icons/textedit.png" alt="TextEdit" />,
  terminal: <Icon src="/icons/terminal.png" alt="Terminal" />,
  preview: <Icon src="/icons/preview.png" alt="Preview" />,
  books: <BooksIcon />,
  contacts: <Icon src="/icons/contacts.png" alt="Contacts" />,
  shortcuts: <Icon src="/icons/shortcuts.png" alt="Shortcuts" />,
  freeform: <Icon src="/icons/freeform.png" alt="Freeform" />,
  passwords: <Icon src="/icons/passwords.png" alt="Passwords" />,
  voicememos: <Icon src="/icons/voicememos.png" alt="Voice Memos" />,
  stickies: <Icon src="/icons/stickies.png" alt="Stickies" />,
  automator: <Icon src="/icons/automator.png" alt="Automator" />,
  clock: <Icon src="/icons/clock.png" alt="Clock" />,

  // Media & Fun
  photobooth: <Icon src="/icons/photobooth.png" alt="Photo Booth" />,
  quicktime: <Icon src="/icons/quicktime.png" alt="QuickTime Player" />,

  // System
  findmy: <Icon src="/icons/findmy.png" alt="Find My" />,
  home: <Icon src="/icons/home.png" alt="Home" />,
  stocks: <Icon src="/icons/stocks.png" alt="Stocks" />,
  weather: <Icon src="/icons/weather.png" alt="Weather" />,
  siri: <Icon src="/icons/siri.png" alt="Siri" />,
  missioncontrol: <Icon src="/icons/missioncontrol.png" alt="Mission Control" />,
  screenshot: <Icon src="/icons/screenshot.png" alt="Screenshot" />,

  // Utilities
  activitymonitor: <Icon src="/icons/activitymonitor.png" alt="Activity Monitor" />,
  diskutility: <Icon src="/icons/diskutility.png" alt="Disk Utility" />,
  console: <Icon src="/icons/console.png" alt="Console" />,
  scripteditor: <Icon src="/icons/scripteditor.png" alt="Script Editor" />,

  // Special
  trash: <Icon src="/icons/trash.png" alt="Trash" />,
  aboutthismac: (
    <div className="w-full h-full rounded-[22%] bg-gradient-to-b from-[#888] to-[#555] flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="white" className="w-[60%] h-[60%]">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    </div>
  ),
  anime: <Icon src="/icons/tv.png" alt="Anime" />,
  activity: <Icon src="/icons/activitymonitor.png" alt="Activity" />,
  codeeditor: <Icon src="/icons/scripteditor.png" alt="Code Editor" />,
};

// System file/device icons
export const systemIcons = {
  folder: <Icon src="/icons/folder.png" alt="Folder" />,
  document: <Icon src="/icons/document.png" alt="Document" />,
  internaldisk: <Icon src="/icons/internaldisk.png" alt="Internal Disk" />,
  macbook: <Icon src="/icons/macbook.png" alt="MacBook" />,
  fulltrash: <Icon src="/icons/fulltrash.png" alt="Full Trash" />,
};

export const desktopIcons = {
  macintoshHD: <div className="w-full h-full" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}><img src="/icons/internaldisk.png" alt="Macintosh HD" className="w-full h-full max-w-[85%]" style={{ filter: 'brightness(0) invert(0.9)', margin: '0 auto' }} draggable={false} /></div>,
  github: (
    <svg viewBox="0 0 24 24" className="w-[50px] h-[50px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" fill="white">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  x: (
    <div className="w-[46px] h-[46px] bg-black rounded-[10px] flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] border border-white/20">
      <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </div>
  ),
  linkedin: (
    <div className="w-[46px] h-[46px] bg-[#0A66C2] rounded-[10px] flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
      <svg viewBox="0 0 24 24" className="w-[30px] h-[30px]" fill="white">
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
      </svg>
    </div>
  ),
};
