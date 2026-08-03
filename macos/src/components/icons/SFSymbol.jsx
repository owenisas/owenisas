/* eslint-disable react-refresh/only-export-components */
// SF Symbol-style icon system — SVG path approximations of common macOS icons
// Usage: <SFSymbol name="folder.fill" size={16} color="currentColor" />

const icons = {
  // --- Navigation ---
  'chevron.left': { vb: '0 0 20 20', d: 'M13 4l-6 6 6 6', fill: false },
  'chevron.right': { vb: '0 0 20 20', d: 'M7 4l6 6-6 6', fill: false },
  'chevron.down': { vb: '0 0 20 20', d: 'M4 7l6 6 6-6', fill: false },
  'chevron.up': { vb: '0 0 20 20', d: 'M4 13l6-6 6 6', fill: false },
  'arrow.left': { vb: '0 0 20 20', d: 'M10 4L4 10l6 6M4 10h12', fill: false },
  'arrow.right': { vb: '0 0 20 20', d: 'M10 4l6 6-6 6M16 10H4', fill: false },
  'arrow.down.circle': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v8m-3-3l3 3 3-3', fill: false },
  'arrow.up.right': { vb: '0 0 20 20', d: 'M6 14L14 6M14 6v6M14 6H8', fill: false },

  // --- Sidebar / Files ---
  'sidebar.left': { vb: '0 0 24 24', d: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM9 3v18', fill: false },
  'folder': { vb: '0 0 24 24', d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z', fill: false },
  'folder.fill': { vb: '0 0 24 24', d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z' },
  'doc': { vb: '0 0 24 24', d: 'M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm8 0v5h5', fill: false },
  'doc.fill': { vb: '0 0 24 24', d: 'M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8l-5-5H6zm8 0v5h5' },
  'doc.text': { vb: '0 0 24 24', d: 'M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm8 0v5h5M8 13h8M8 17h5', fill: false },
  'doc.text.fill': { vb: '0 0 24 24', d: 'M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8l-5-5H6zm8 0v5h5M8 13h8M8 17h5' },
  'doc.richtext.fill': { vb: '0 0 24 24', d: 'M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8l-5-5H6zm8 0v5h5M8 13h8M8 17h5M8 9h3' },
  'trash': { vb: '0 0 24 24', d: 'M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14M10 10v7M14 10v7', fill: false },
  'internaldrive': { vb: '0 0 24 24', d: 'M3 14h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4zM3 14l2-8h14l2 8M16 17h1', fill: false },

  // --- Grid / View ---
  'square.grid.2x2': { vb: '0 0 24 24', d: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z', fill: false },
  'square.grid.2x2.fill': { vb: '0 0 24 24', d: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z' },
  'list.bullet': { vb: '0 0 24 24', d: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01', fill: false },
  'list.number': { vb: '0 0 24 24', d: 'M10 6h10M10 12h10M10 18h10M4 6h2M4 12h2M4 18h2', fill: false },
  'rectangle.split.3x1': { vb: '0 0 24 24', d: 'M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zM9 3v18M15 3v18', fill: false },
  'square.grid.3x3': { vb: '0 0 24 24', d: 'M2 2h6v6H2V2zm7 0h6v6H9V2zm7 0h6v6h-6V2zM2 9h6v6H2V9zm7 0h6v6H9V9zm7 0h6v6h-6V9zM2 16h6v6H2v-6zm7 0h6v6H9v-6zm7 0h6v6h-6v-6z', fill: false },

  // --- Actions ---
  'magnifyingglass': { vb: '0 0 24 24', d: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 0l6 14.5L21 21', fill: false },
  'plus': { vb: '0 0 20 20', d: 'M10 4v12M4 10h12', fill: false },
  'minus': { vb: '0 0 20 20', d: 'M4 10h12', fill: false },
  'xmark': { vb: '0 0 20 20', d: 'M5 5l10 10M15 5L5 15', fill: false },
  'xmark.circle': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-3 7l6 6m0-6l-6 6', fill: false },
  'checkmark': { vb: '0 0 20 20', d: 'M4 10l4 4 8-8', fill: false },
  'checkmark.circle.fill': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 14l-3-3 1.5-1.5L10 13l5-5 1.5 1.5z' },
  'square.and.arrow.up': { vb: '0 0 24 24', d: 'M12 3v12M8 7l4-4 4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5', fill: false },
  'ellipsis.circle': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8 12h.01M12 12h.01M16 12h.01', fill: false },
  'slider.horizontal.3': { vb: '0 0 24 24', d: 'M4 6h4m4 0h8M4 12h8m4 0h4M4 18h2m4 0h10M8 4v4m8 4v4M6 16v4', fill: false },
  'line.3.horizontal.decrease': { vb: '0 0 24 24', d: 'M3 6h18M5 12h14M8 18h8', fill: false },

  // --- Media ---
  'photo': { vb: '0 0 24 24', d: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3 17l4-4 3 3 4-4 7 7', fill: false },
  'photo.fill': { vb: '0 0 24 24', d: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3 17l4-4 3 3 4-4 7 7H3v-2z' },
  'play.fill': { vb: '0 0 24 24', d: 'M6 4l14 8-14 8V4z' },
  'pause.fill': { vb: '0 0 24 24', d: 'M6 4h4v16H6zM14 4h4v16h-4z' },
  'heart': { vb: '0 0 24 24', d: 'M12 21C6 17 2 13 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5 22 13 18 17 12 21z', fill: false },
  'heart.fill': { vb: '0 0 24 24', d: 'M12 21C6 17 2 13 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5 22 13 18 17 12 21z' },
  'camera': { vb: '0 0 24 24', d: 'M3 7a2 2 0 0 1 2-2h2l1-2h8l1 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm9 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', fill: false },

  // --- Communication ---
  'envelope': { vb: '0 0 24 24', d: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm0 0l9 7 9-7', fill: false },
  'bubble.left': { vb: '0 0 24 24', d: 'M21 12c0 4.4-4 8-9 8a10 10 0 0 1-4-.8L3 21l1.8-4A7.5 7.5 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8z', fill: false },
  'bubble.left.fill': { vb: '0 0 24 24', d: 'M21 12c0 4.4-4 8-9 8a10 10 0 0 1-4-.8L3 21l1.8-4A7.5 7.5 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8z' },
  'phone': { vb: '0 0 24 24', d: 'M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3.1a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.7a2 2 0 0 1 1.7 2z', fill: false },
  'video': { vb: '0 0 24 24', d: 'M2 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm14 3l6-3v12l-6-3', fill: false },

  // --- System ---
  'gear': { vb: '0 0 24 24', d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8-3a8 8 0 0 1-.1 1.3l2.1 1.6-2 3.5-2.5-.8a8 8 0 0 1-2.3 1.3l-.4 2.6h-4l-.4-2.6A8 8 0 0 1 8.1 17l-2.5.8-2-3.5 2.1-1.6a8 8 0 0 1 0-2.6L3.6 8.5l2-3.5 2.5.8a8 8 0 0 1 2.3-1.3l.4-2.6h4l.4 2.6a8 8 0 0 1 2.3 1.3l2.5-.8 2 3.5-2.1 1.6a8 8 0 0 1 .1 1.4z', fill: false },
  'gear.fill': { vb: '0 0 24 24', d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8-3a8 8 0 0 1-.1 1.3l2.1 1.6-2 3.5-2.5-.8a8 8 0 0 1-2.3 1.3l-.4 2.6h-4l-.4-2.6A8 8 0 0 1 8.1 17l-2.5.8-2-3.5 2.1-1.6a8 8 0 0 1 0-2.6L3.6 8.5l2-3.5 2.5.8a8 8 0 0 1 2.3-1.3l.4-2.6h4l.4 2.6a8 8 0 0 1 2.3 1.3l2.5-.8 2 3.5-2.1 1.6a8 8 0 0 1 .1 1.4z' },
  'wifi': { vb: '0 0 24 24', d: 'M2 8.8c5.5-5.1 14.5-5.1 20 0M5 12.5c3.9-3.6 10.1-3.6 14 0M8.5 16.2c2.1-1.9 5-1.9 7 0M12 20h.01', fill: false },
  'antenna.radiowaves.left.and.right': { vb: '0 0 24 24', d: 'M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0M7 7a7 7 0 0 0 0 10m10-10a7 7 0 0 1 0 10M4 4a12 12 0 0 0 0 16m16-16a12 12 0 0 1 0 16', fill: false },
  'bluetooth': { vb: '0 0 24 24', d: 'M7 7l10 10-5 5V2l5 5L7 17', fill: false },
  'display': { vb: '0 0 24 24', d: 'M3 4h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 20h8M12 18v2', fill: false },
  'speaker.wave.3': { vb: '0 0 24 24', d: 'M3 9v6h4l5 5V4L7 9H3zm14-2a5 5 0 0 1 0 10m2-14a9 9 0 0 1 0 16', fill: false },
  'speaker.wave.3.fill': { vb: '0 0 24 24', d: 'M3 9v6h4l5 5V4L7 9H3zm14-2a5 5 0 0 1 0 10m2-14a9 9 0 0 1 0 16' },
  'bell': { vb: '0 0 24 24', d: 'M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9zM13.7 21a2 2 0 0 1-3.4 0', fill: false },
  'bell.fill': { vb: '0 0 24 24', d: 'M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9zM13.7 21a2 2 0 0 1-3.4 0' },
  'lock.shield': { vb: '0 0 24 24', d: 'M12 2l8 4v6c0 5.5-3.4 10.6-8 12-4.6-1.4-8-6.5-8-12V6l8-4zm-2 8v3h4v-3a2 2 0 0 0-4 0z', fill: false },
  'lock.shield.fill': { vb: '0 0 24 24', d: 'M12 2l8 4v6c0 5.5-3.4 10.6-8 12-4.6-1.4-8-6.5-8-12V6l8-4zm-2 8v3h4v-3a2 2 0 0 0-4 0z' },
  'battery.100': { vb: '0 0 28 24', d: 'M2 7h20a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm24 4v2a1 1 0 0 0 1 1v-4a1 1 0 0 0-1 1zM3 9h18v6H3V9z' },
  'globe': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 0c2.8 0 5 4.5 5 10s-2.2 10-5 10-5-4.5-5-10 2.2-10 5-10zM2 12h20', fill: false },
  'network': { vb: '0 0 24 24', d: 'M12 2v6m0 8v6M2 12h6m8 0h6M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', fill: false },
  'person.crop.circle': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-6 12a6 6 0 0 1 12 0', fill: false },
  'person.crop.circle.fill': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-6 12a6 6 0 0 1 12 0' },
  'person.crop.square': { vb: '0 0 24 24', d: 'M4 4h16v16H4V4zm8 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-4 11a4 4 0 0 1 8 0', fill: false },
  'airplane': { vb: '0 0 24 24', d: 'M12 2l3 8 7 4-7 2-1 6-2-4-2 4-1-6-7-2 7-4 3-8z', fill: false },

  // --- Apps / Categories ---
  'clock': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v6l4 4', fill: false },
  'clock.fill': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v6l4 4' },
  'star': { vb: '0 0 24 24', d: 'M12 2l3.1 6.3L22 9.3l-5 4.8L18.2 21 12 17.3 5.8 21 7 14.1 2 9.3l6.9-1L12 2z', fill: false },
  'star.fill': { vb: '0 0 24 24', d: 'M12 2l3.1 6.3L22 9.3l-5 4.8L18.2 21 12 17.3 5.8 21 7 14.1 2 9.3l6.9-1L12 2z' },
  'map': { vb: '0 0 24 24', d: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zm7-4v16m8-12v16', fill: false },
  'map.fill': { vb: '0 0 24 24', d: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zm7-4v16m8-12v16' },
  'calendar': { vb: '0 0 24 24', d: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6zm5-4v4m8-4v4M3 10h18', fill: false },
  'tag': { vb: '0 0 24 24', d: 'M3 3h8l10 10-8 8L3 11V3zm4 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0z', fill: false },
  'tag.fill': { vb: '0 0 24 24', d: 'M3 3h8l10 10-8 8L3 11V3zm4 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0z' },
  'paintbrush': { vb: '0 0 24 24', d: 'M20 4L8 16H4v-4L16 0l4 4zm-5-1l4 4', fill: false },
  'textformat': { vb: '0 0 24 24', d: 'M4 20h16M6 4h12l-6 16L6 4z', fill: false },
  'bold': { vb: '0 0 24 24', d: 'M7 4h6a4 4 0 0 1 0 8H7V4zm0 8h7a4 4 0 0 1 0 8H7v-8z' },
  'italic': { vb: '0 0 24 24', d: 'M10 4h8M6 20h8M14 4l-4 16', fill: false },
  'underline': { vb: '0 0 24 24', d: 'M6 4v8a6 6 0 0 0 12 0V4M4 20h16', fill: false },
  'text.alignleft': { vb: '0 0 24 24', d: 'M3 6h18M3 10h12M3 14h18M3 18h12', fill: false },
  'text.aligncenter': { vb: '0 0 24 24', d: 'M3 6h18M6 10h12M3 14h18M6 18h12', fill: false },
  'text.alignright': { vb: '0 0 24 24', d: 'M3 6h18M9 10h12M3 14h18M9 18h12', fill: false },
  'text.justify': { vb: '0 0 24 24', d: 'M3 6h18M3 10h18M3 14h18M3 18h18', fill: false },
  'checklist': { vb: '0 0 24 24', d: 'M4 6l2 2 4-4M4 14l2 2 4-4M14 7h6M14 15h6', fill: false },
  'tablecells': { vb: '0 0 24 24', d: 'M3 3h18v18H3V3zM3 9h18M3 15h18M9 3v18M15 3v18', fill: false },

  // --- Misc ---
  'shield': { vb: '0 0 24 24', d: 'M12 2l8 4v6c0 5.5-3.4 10.6-8 12-4.6-1.4-8-6.5-8-12V6l8-4z', fill: false },
  'shield.fill': { vb: '0 0 24 24', d: 'M12 2l8 4v6c0 5.5-3.4 10.6-8 12-4.6-1.4-8-6.5-8-12V6l8-4z' },
  'info.circle': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5h.01M11 11h1v5h1', fill: false },
  'exclamationmark.triangle': { vb: '0 0 24 24', d: 'M12 2L1 21h22L12 2zm0 7v5m0 3h.01', fill: false },
  'hand.raised': { vb: '0 0 24 24', d: 'M8 13V4.5a1.5 1.5 0 0 1 3 0V12M11 12V3.5a1.5 1.5 0 0 1 3 0V12M14 12V5.5a1.5 1.5 0 0 1 3 0V12M5 12V8.5a1.5 1.5 0 0 1 3 0V13l-2.3 3.4A5 5 0 0 0 5 19a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5v-5', fill: false },
  'desktopcomputer': { vb: '0 0 24 24', d: 'M2 4h20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 20h8M12 17v3', fill: false },
  'menubar.rectangle': { vb: '0 0 24 24', d: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM3 8h18', fill: false },
  'sparkles': { vb: '0 0 24 24', d: 'M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16z', fill: false },
  'circle.fill': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z' },

  // --- Weather ---
  'sun.max.fill': { vb: '0 0 24 24', d: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1' },
  'sun.max': { vb: '0 0 24 24', d: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1', fill: false },
  'moon.fill': { vb: '0 0 24 24', d: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z' },
  'moon.stars.fill': { vb: '0 0 24 24', d: 'M18 15A7 7 0 0 1 9 6a7 7 0 1 0 9 9zM19 3l.6 1.7L21 5l-1.4.3L19 7l-.6-1.7L17 5l1.4-.3zM17 10l.4 1.2 1.1.2-1.1.2L17 12.8l-.4-1.2-1.1-.2 1.1-.2z' },
  'cloud.fill': { vb: '0 0 24 24', d: 'M7 18a5 5 0 1 1 1.2-9.8A6 6 0 0 1 20 10.5a4 4 0 0 1-1 7.5H7z' },
  'cloud.sun.fill': { vb: '0 0 24 24', d: 'M15 3v2M19.2 5.8l-1.4 1.4M22 10h-2M17.8 14.2l1.4 1.4M15 7a3 3 0 0 1 2.8 4.1M7 20a5 5 0 1 1 1.2-9.8A6 6 0 0 1 20 12.5a4 4 0 0 1-1 7.5H7z' },
  'cloud.rain.fill': { vb: '0 0 24 24', d: 'M7 14a5 5 0 1 1 1.2-9.8A6 6 0 0 1 20 6.5a4 4 0 0 1-1 7.5H7zM8 17l-1 3M12 17l-1 3M16 17l-1 3' },
  'cloud.drizzle.fill': { vb: '0 0 24 24', d: 'M7 14a5 5 0 1 1 1.2-9.8A6 6 0 0 1 20 6.5a4 4 0 0 1-1 7.5H7zM8 18l-.5 2M12 18l-.5 2M16 18l-.5 2' },
  'cloud.snow.fill': { vb: '0 0 24 24', d: 'M7 13a5 5 0 1 1 1.2-9.8A6 6 0 0 1 20 5.5a4 4 0 0 1-1 7.5H7zM8 17h.01M12 17h.01M16 17h.01M8 21h.01M12 21h.01M16 21h.01' },
  'wind': { vb: '0 0 24 24', d: 'M3 8h12a3 3 0 1 0-3-3M3 12h17a3 3 0 1 1-3 3M3 16h9a3 3 0 1 1-3 3', fill: false },
  'sunrise.fill': { vb: '0 0 24 24', d: 'M12 3v6M7 8l5-5 5 5M3 20h18M5 17a7 7 0 1 1 14 0' },
  'sunset.fill': { vb: '0 0 24 24', d: 'M12 9V3M7 8l5 1 5-1M3 20h18M5 17a7 7 0 1 1 14 0' },
  'drop.fill': { vb: '0 0 24 24', d: 'M12 2c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13z' },
  'thermometer': { vb: '0 0 24 24', d: 'M10 4a2 2 0 1 1 4 0v10a4 4 0 1 1-4 0V4zm2 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', fill: false },
  'aqi.medium': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-5 8h10M7 14h10', fill: false },
  'aqi.low': { vb: '0 0 24 24', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-5 8h10', fill: false },
  'eye.fill': { vb: '0 0 24 24', d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  'humidity.fill': { vb: '0 0 24 24', d: 'M12 2c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13zM9 14a3 3 0 0 0 3 3' },
};

export default function SFSymbol({ name, size = 16, color = 'currentColor', className = '', weight = 1.5 }) {
  const icon = icons[name];
  if (!icon) return null;

  const isFill = icon.fill !== false;

  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.vb}
      fill={isFill ? color : 'none'}
      stroke={isFill ? 'none' : color}
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path d={icon.d} />
    </svg>
  );
}

export { icons };
