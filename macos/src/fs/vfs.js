// Virtual filesystem — single source of truth for Finder, TextEdit, Preview,
// Terminal, Photos, Spotlight.

const now = Date.now();
const modified = (daysAgo) => new Date(now - daysAgo * 86400000).toISOString();

function dir(name, children, extra = {}) {
  return { name, type: 'dir', children, modified: extra.modified || modified(1), ...extra };
}
function file(name, kind, extra = {}) {
  return {
    name,
    type: 'file',
    kind,
    size: extra.size ?? 0,
    modified: extra.modified || modified(3),
    contentUrl: extra.contentUrl,
    meta: extra.meta,
    locked: !!extra.locked,
    ...extra,
  };
}

// Photography library — EXIF sidecars defined inline. Edit to match real assets.
const photos = [
  {
    slug: 'dji-mavic-dawn',
    title: 'Dawn Patrol',
    src: '/content/photography/dji-mavic-dawn.jpg',
    meta: {
      camera: 'DJI Mavic 3',
      lens: '24mm',
      iso: 100,
      shutter: '1/640',
      aperture: 'f/2.8',
      date: '2025-09-12',
      location: 'Vancouver, BC',
      caption: 'First light over the inlet. Mavic 3 straight out of camera.',
    },
  },
  {
    slug: 'keyboard-macro',
    title: 'Keycaps',
    src: '/content/photography/keyboard-macro.jpg',
    meta: {
      camera: 'Sony A7 IV',
      lens: '90mm macro',
      iso: 400,
      shutter: '1/200',
      aperture: 'f/4',
      date: '2025-11-02',
      location: 'Desk, Vancouver',
      caption: 'Texture study — Keychron K8 under tungsten.',
    },
  },
  {
    slug: 'city-dusk',
    title: 'City Dusk',
    src: '/content/photography/city-dusk.jpg',
    meta: {
      camera: 'Sony A7 IV',
      lens: '35mm',
      iso: 800,
      shutter: '1/80',
      aperture: 'f/1.8',
      date: '2025-10-20',
      location: 'Downtown Vancouver',
      caption: 'Blue hour crossing.',
    },
  },
  {
    slug: 'rain-window',
    title: 'Rain Window',
    src: '/content/photography/rain-window.jpg',
    meta: {
      camera: 'iPhone 15 Pro',
      lens: '24mm eq.',
      iso: 200,
      shutter: '1/60',
      aperture: 'f/1.8',
      date: '2026-01-08',
      location: 'SkyTrain, Vancouver',
      caption: 'Commute on a grey day.',
    },
  },
  {
    slug: 'mountain-road',
    title: 'Mountain Road',
    src: '/content/photography/mountain-road.jpg',
    meta: {
      camera: 'DJI Mavic 3',
      lens: '24mm',
      iso: 100,
      shutter: '1/500',
      aperture: 'f/2.8',
      date: '2025-08-03',
      location: 'Sea-to-Sky Highway',
      caption: 'Cutting through the range.',
    },
  },
  {
    slug: 'studio-light',
    title: 'Studio Light',
    src: '/content/photography/studio-light.jpg',
    meta: {
      camera: 'Sony A7 IV',
      lens: '50mm',
      iso: 200,
      shutter: '1/160',
      aperture: 'f/1.4',
      date: '2025-12-15',
      location: 'Home studio',
      caption: 'Single-source portrait setup test.',
    },
  },
];

export const photography = photos;

export const root = dir('~', [
  dir('Desktop', [
    file('Welcome.md', 'md', { contentUrl: '/content/about.md', size: 2048 }),
  ]),
  dir('Documents', [
    file('Resume.md', 'md', { contentUrl: '/content/resume.md', size: 4096 }),
    file('About.md', 'md', { contentUrl: '/content/about.md', size: 2048 }),
    file('Welcome.md', 'md', { contentUrl: '/content/about.md', size: 2048 }),
    dir('Projects', [
      file('owenisas-site.md', 'md', { contentUrl: '/content/projects/owenisas-site.md', size: 3000 }),
      file('blender-showreel.md', 'md', { contentUrl: '/content/projects/blender-showreel.md', size: 2500 }),
      file('autonomous-systems.md', 'md', { contentUrl: '/content/projects/autonomous-systems.md', size: 2200 }),
      file('photography-notes.md', 'md', { contentUrl: '/content/projects/photography-notes.md', size: 1800 }),
    ]),
    dir('Notes', [
      file('ideas.md', 'md', { contentUrl: '/content/notes/ideas.md', size: 1200 }),
      file('reading-list.md', 'md', { contentUrl: '/content/notes/reading-list.md', size: 1400 }),
    ]),
  ]),
  dir('Pictures', [
    dir('Photography', photos.map(p =>
      file(`${p.slug}.jpg`, 'image', { contentUrl: p.src, size: 1400000, meta: p.meta, title: p.title })
    )),
    dir('Screenshots', []),
  ]),
  dir('Downloads', [
    file('neofetch.txt', 'text', { contentUrl: '/content/neofetch.txt', size: 900 }),
  ]),
  dir('Music', [], { locked: true }),
  dir('Movies', [
    file('showreel.info.md', 'md', { contentUrl: '/content/projects/blender-showreel.md', size: 2500 }),
  ]),
]);

// -------- helpers --------

function splitPath(pathStr) {
  if (!pathStr || pathStr === '/' || pathStr === '~' || pathStr === '~/') return [];
  let p = pathStr;
  if (p.startsWith('~/')) p = p.slice(2);
  else if (p.startsWith('/')) p = p.slice(1);
  if (p.endsWith('/')) p = p.slice(0, -1);
  return p.split('/').filter(Boolean);
}

export function getByPath(pathStr) {
  const parts = splitPath(pathStr);
  let node = root;
  for (const part of parts) {
    if (node.type !== 'dir') return null;
    node = node.children.find(c => c.name === part);
    if (!node) return null;
  }
  return node;
}

export function listDir(pathStr) {
  const node = getByPath(pathStr);
  if (!node || node.type !== 'dir') return [];
  return node.children;
}

export function joinPath(base, name) {
  if (!base || base === '~' || base === '~/') return `~/${name}`;
  if (base.endsWith('/')) return `${base}${name}`;
  return `${base}/${name}`;
}

export function parentPath(pathStr) {
  const parts = splitPath(pathStr);
  if (parts.length === 0) return '~';
  return '~/' + parts.slice(0, -1).join('/');
}

export function homePath() { return '~'; }

// Search: DFS walk, match name substring. Returns [{ node, path }].
export function searchFs(query, { limit = 20 } = {}) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results = [];
  function walk(node, path) {
    if (results.length >= limit) return;
    if (node.name.toLowerCase().includes(q)) {
      results.push({ node, path });
    }
    if (node.type === 'dir') {
      for (const child of node.children) walk(child, joinPath(path, child.name));
    }
  }
  walk(root, '~');
  // drop root itself
  return results.filter(r => r.path !== '~');
}

// Sidebar groups (Finder).
export const sidebarFavorites = [
  { label: 'Desktop', path: '~/Desktop', icon: 'desktop' },
  { label: 'Documents', path: '~/Documents', icon: 'documents' },
  { label: 'Projects', path: '~/Documents/Projects', icon: 'folder' },
  { label: 'Pictures', path: '~/Pictures', icon: 'pictures' },
  { label: 'Downloads', path: '~/Downloads', icon: 'downloads' },
  { label: 'Home', path: '~', icon: 'home' },
];

export const sidebarLocations = [
  { label: 'Macintosh HD', path: '~', icon: 'drive' },
];

export const sidebarTags = [
  { label: 'Portfolio', color: '#ff9500' },
  { label: 'Draft', color: '#ffd60a' },
  { label: 'Archive', color: '#8e8e93' },
];

// Formats for Finder.
export function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fileKindLabel(node) {
  if (node.type === 'dir') return 'Folder';
  switch (node.kind) {
    case 'md': return 'Markdown Document';
    case 'text': return 'Plain Text';
    case 'image': return 'Image';
    case 'pdf': return 'PDF Document';
    default: return 'Document';
  }
}
