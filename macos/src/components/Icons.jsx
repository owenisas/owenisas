// Real macOS app icons extracted from system applications (256x256 PNG)

const Icon = ({ src, alt }) => (
  <img src={src} alt={alt} className="w-full h-full" draggable={false} />
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
  books: <Icon src="/icons/books.png" alt="Books" />,
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
  macintoshHD: <Icon src="/icons/internaldisk.png" alt="Macintosh HD" />,
};
