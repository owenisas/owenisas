import { useCallback, useMemo, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacSidebarItem, MacSidebarSection, MacToolbarButton } from '../components/ui/MacControls';

const photoData = [
  { id: 1, date: 'Apr 11', group: 'April 11, 2025', title: 'Harbor Walk', location: 'Monterey', camera: 'iPhone 16 Pro', size: '4.2 MB', dimensions: '4032 × 3024', favorite: false, collections: ['days', 'trips'], mediaType: 'photo', theme: 'coast' },
  { id: 2, date: 'Apr 11', group: 'April 11, 2025', title: 'Marina Light', location: 'Monterey', camera: 'iPhone 16 Pro', size: '3.8 MB', dimensions: '4032 × 3024', favorite: true, collections: ['days', 'memories'], mediaType: 'photo', theme: 'coast' },
  { id: 3, date: 'Apr 11', group: 'April 11, 2025', title: 'Studio Window', location: 'San Jose', camera: 'Screen capture', size: '1.6 MB', dimensions: '2560 × 1600', favorite: false, collections: ['memories'], mediaType: 'screenshot', theme: 'screen' },
  { id: 4, date: 'Apr 11', group: 'April 11, 2025', title: 'Duo Portrait', location: 'Oakland', camera: 'iPhone 16 Pro', size: '4.6 MB', dimensions: '4032 × 3024', favorite: true, collections: ['peoplePets', 'memories'], mediaType: 'photo', theme: 'portrait' },
  { id: 5, date: 'Apr 10', group: 'April 10, 2025', title: 'Trail Notes', location: 'Big Sur', camera: 'iPhone 16 Pro', size: '5.1 MB', dimensions: '4032 × 3024', favorite: false, collections: ['days', 'trips'], mediaType: 'video', theme: 'travel' },
  { id: 6, date: 'Apr 10', group: 'April 10, 2025', title: 'Campfire Cut', location: 'Big Sur', camera: 'iPhone 16 Pro', size: '4.9 MB', dimensions: '4032 × 3024', favorite: false, collections: ['trips'], mediaType: 'video', theme: 'night' },
  { id: 7, date: 'Apr 10', group: 'April 10, 2025', title: 'Dog Run', location: 'Berkeley', camera: 'iPhone 16 Pro', size: '4.3 MB', dimensions: '4032 × 3024', favorite: true, collections: ['peoplePets'], mediaType: 'selfie', theme: 'portrait' },
  { id: 8, date: 'Apr 10', group: 'April 10, 2025', title: 'Market Morning', location: 'San Francisco', camera: 'iPhone 16 Pro', size: '4.1 MB', dimensions: '4032 × 3024', favorite: false, collections: ['days'], mediaType: 'photo', theme: 'city' },
  { id: 9, date: 'Mar 28', group: 'March 28, 2025', title: 'Boarding Pass', location: 'San Jose', camera: 'Screen capture', size: '1.4 MB', dimensions: '2560 × 1600', favorite: false, collections: ['trips'], mediaType: 'screenshot', theme: 'screen' },
  { id: 10, date: 'Mar 28', group: 'March 28, 2025', title: 'Rooftop Sweep', location: 'San Francisco', camera: 'iPhone 16 Pro', size: '4.7 MB', dimensions: '4032 × 3024', favorite: true, collections: ['days', 'memories'], mediaType: 'photo', theme: 'city' },
  { id: 11, date: 'Mar 25', group: 'March 25, 2025', title: 'Kitchen Table', location: 'Home', camera: 'iPhone 16 Pro', size: '4.4 MB', dimensions: '4032 × 3024', favorite: false, collections: ['memories'], mediaType: 'photo', theme: 'home' },
  { id: 12, date: 'Mar 25', group: 'March 25, 2025', title: 'Night Sky Clip', location: 'Joshua Tree', camera: 'iPhone 16 Pro', size: '6.1 MB', dimensions: '4032 × 3024', favorite: false, collections: ['trips'], mediaType: 'video', theme: 'night' },
  { id: 13, date: 'Mar 20', group: 'March 20, 2025', title: 'Lake Reflection', location: 'Lake Tahoe', camera: 'iPhone 16 Pro', size: '4.0 MB', dimensions: '4032 × 3024', favorite: false, collections: ['days', 'trips'], mediaType: 'photo', theme: 'coast' },
  { id: 14, date: 'Mar 20', group: 'March 20, 2025', title: 'Selfie at Gate', location: 'SFO', camera: 'iPhone 16 Pro', size: '4.8 MB', dimensions: '4032 × 3024', favorite: true, collections: ['peoplePets', 'trips'], mediaType: 'selfie', theme: 'portrait' },
  { id: 15, date: 'Mar 20', group: 'March 20, 2025', title: 'Workshop Sketch', location: 'Design lab', camera: 'Screen capture', size: '1.9 MB', dimensions: '2560 × 1600', favorite: false, collections: ['memories'], mediaType: 'screenshot', theme: 'screen' },
  { id: 16, date: 'Mar 15', group: 'March 15, 2025', title: 'Meadow Light', location: 'Marin', camera: 'iPhone 16 Pro', size: '4.5 MB', dimensions: '4032 × 3024', favorite: false, collections: ['days'], mediaType: 'photo', theme: 'garden' },
  { id: 17, date: 'Feb 20', group: 'February 20, 2025', title: 'Ferry Ride', location: 'San Francisco Bay', camera: 'iPhone 16 Pro', size: '5.0 MB', dimensions: '4032 × 3024', favorite: true, collections: ['trips'], mediaType: 'photo', theme: 'coast' },
  { id: 18, date: 'Feb 14', group: 'February 14, 2025', title: 'Portrait Study', location: 'Oakland', camera: 'iPhone 16 Pro', size: '4.7 MB', dimensions: '4032 × 3024', favorite: false, collections: ['peoplePets'], mediaType: 'photo', theme: 'portrait' },
  { id: 19, date: 'Feb 14', group: 'February 14, 2025', title: 'Sunset Route', location: 'Highway 1', camera: 'iPhone 16 Pro', size: '5.2 MB', dimensions: '4032 × 3024', favorite: false, collections: ['trips'], mediaType: 'photo', theme: 'travel' },
  { id: 20, date: 'Feb 10', group: 'February 10, 2025', title: 'Notes Capture', location: 'Home', camera: 'Screen capture', size: '1.5 MB', dimensions: '2560 × 1600', favorite: false, collections: ['memories'], mediaType: 'screenshot', theme: 'screen' },
  { id: 21, date: 'Feb 10', group: 'February 10, 2025', title: 'Puppy Nap', location: 'Berkeley', camera: 'iPhone 16 Pro', size: '4.1 MB', dimensions: '4032 × 3024', favorite: true, collections: ['peoplePets'], mediaType: 'photo', theme: 'portrait' },
  { id: 22, date: 'Feb 5', group: 'February 5, 2025', title: 'City Blocks', location: 'San Francisco', camera: 'iPhone 16 Pro', size: '4.3 MB', dimensions: '4032 × 3024', favorite: false, collections: ['days'], mediaType: 'photo', theme: 'city' },
  { id: 23, date: 'Feb 5', group: 'February 5, 2025', title: 'Train Window', location: 'Caltrain', camera: 'iPhone 16 Pro', size: '5.4 MB', dimensions: '4032 × 3024', favorite: false, collections: ['trips'], mediaType: 'video', theme: 'travel' },
  { id: 24, date: 'Feb 1', group: 'February 1, 2025', title: 'Family Dinner', location: 'Home', camera: 'iPhone 16 Pro', size: '4.9 MB', dimensions: '4032 × 3024', favorite: false, collections: ['memories'], mediaType: 'photo', theme: 'home' },
];

const sidebarSections = {
  Library: [
    { id: 'all', label: 'All Photos', icon: 'photo', color: '#007AFF' },
    { id: 'days', label: 'Days', icon: 'calendar', color: '#0A84FF' },
    { id: 'peoplePets', label: 'People & Pets', icon: 'person.2.crop.square.stack', color: '#FF9500' },
    { id: 'memories', label: 'Memories', icon: 'sparkles', color: '#FF2D55' },
    { id: 'trips', label: 'Trips', icon: 'airplane', color: '#34C759' },
    { id: 'favorites', label: 'Favorites', icon: 'heart.fill', color: '#FF3B30' },
  ],
  'Media Types': [
    { id: 'videos', label: 'Videos', icon: 'video', color: '#5856D6' },
    { id: 'screenshots', label: 'Screenshots', icon: 'display', color: '#0A84FF' },
    { id: 'selfies', label: 'Selfies', icon: 'camera', color: '#FF2D55' },
  ],
};

const thumbnailThemes = {
  coast: {
    sky: 'linear-gradient(180deg, #98d8ff 0%, #6fa8e5 62%, #2c5d8e 100%)',
    land: '#103d62',
    accent: '#f5d37a',
    foreground: '#0e2846',
  },
  city: {
    sky: 'linear-gradient(180deg, #f3c98e 0%, #cf7d61 46%, #32436d 100%)',
    land: '#1f2742',
    accent: '#f7f0d2',
    foreground: '#12182a',
  },
  portrait: {
    sky: 'linear-gradient(180deg, #ffd8c9 0%, #f0a0b9 52%, #724d8f 100%)',
    land: '#39264d',
    accent: '#ffffff',
    foreground: '#211328',
  },
  home: {
    sky: 'linear-gradient(180deg, #efd7bf 0%, #d89b74 52%, #5f4b61 100%)',
    land: '#2b272c',
    accent: '#f7e7cf',
    foreground: '#151116',
  },
  night: {
    sky: 'linear-gradient(180deg, #2c355e 0%, #182136 54%, #090b14 100%)',
    land: '#0b1321',
    accent: '#f5f0ae',
    foreground: '#05070d',
  },
  garden: {
    sky: 'linear-gradient(180deg, #d6f6b1 0%, #82c96a 48%, #3d7442 100%)',
    land: '#22412d',
    accent: '#fbf7d6',
    foreground: '#1b311f',
  },
  screen: {
    sky: 'linear-gradient(180deg, #52556a 0%, #262933 100%)',
    land: '#111318',
    accent: '#f3f6ff',
    foreground: '#0f1015',
  },
  travel: {
    sky: 'linear-gradient(180deg, #a7e0ff 0%, #87afd6 50%, #5c4d66 100%)',
    land: '#20304f',
    accent: '#ffdf9f',
    foreground: '#132037',
  },
};

function matchesSection(photo, section, favorites) {
  if (section === 'all') return true;
  if (section === 'favorites') return favorites.has(photo.id);
  if (section === 'videos' || section === 'screenshots' || section === 'selfies') return photo.mediaType === section.slice(0, -1);
  return photo.collections.includes(section);
}

function groupPhotos(items) {
  const groups = [];
  let currentGroup = null;
  items.forEach(photo => {
    if (photo.group !== currentGroup) {
      groups.push({ title: photo.group, photos: [] });
      currentGroup = photo.group;
    }
    groups[groups.length - 1].photos.push(photo);
  });
  return groups;
}

function PhotoThumbnail({ photo, large = false }) {
  const theme = thumbnailThemes[photo.theme] || thumbnailThemes.coast;
  const overlayText = photo.mediaType === 'video' ? '▶' : photo.mediaType === 'screenshot' ? 'UI' : photo.mediaType === 'selfie' ? '◎' : '';

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0" style={{ background: theme.sky }} />
      <div className="absolute inset-x-0 bottom-0 h-[42%]" style={{ background: theme.land }} />

      {photo.theme === 'coast' && (
        <>
          <div className="absolute left-[-6%] top-[8%] w-[24%] h-[24%] rounded-full opacity-85" style={{ background: theme.accent, filter: 'blur(2px)' }} />
          <div className="absolute inset-x-[-8%] bottom-[19%] h-[18%] rounded-[100%] rotate-[-4deg]" style={{ background: 'rgba(9,34,59,0.95)' }} />
          <div className="absolute inset-x-0 bottom-[26%] h-[8%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35), transparent)' }} />
        </>
      )}

      {photo.theme === 'city' && (
        <>
          <div className="absolute inset-x-0 bottom-[18%] h-[8%]" style={{ background: 'linear-gradient(180deg, rgba(255,230,180,0.35), transparent)' }} />
          <div className="absolute left-[14%] bottom-[12%] w-[8%] h-[24%]" style={{ background: 'rgba(15,20,35,0.9)' }} />
          <div className="absolute left-[24%] bottom-[12%] w-[7%] h-[30%]" style={{ background: 'rgba(16,23,42,0.88)' }} />
          <div className="absolute left-[36%] bottom-[12%] w-[10%] h-[38%]" style={{ background: 'rgba(12,17,32,0.9)' }} />
          <div className="absolute right-[18%] bottom-[12%] w-[12%] h-[26%]" style={{ background: 'rgba(14,20,36,0.88)' }} />
          <div className="absolute right-[6%] bottom-[12%] w-[8%] h-[34%]" style={{ background: 'rgba(18,23,40,0.92)' }} />
        </>
      )}

      {photo.theme === 'portrait' && (
        <>
          <div className="absolute inset-x-[18%] top-[18%] h-[38%] rounded-[40%] bg-white/16 blur-[0.5px]" />
          <div className="absolute left-[22%] top-[20%] w-[56%] h-[52%] rounded-[46%] bg-[rgba(255,235,226,0.8)]" />
          <div className="absolute left-[34%] top-[38%] w-[32%] h-[34%] rounded-[36%] bg-[rgba(91,58,74,0.86)]" />
          <div className="absolute inset-x-[16%] bottom-[14%] h-[18%] rounded-[100%] bg-[rgba(34,18,48,0.9)]" />
        </>
      )}

      {photo.theme === 'home' && (
        <>
          <div className="absolute left-[18%] top-[18%] w-[34%] h-[36%] rounded-[8%] bg-[rgba(255,244,225,0.7)]" />
          <div className="absolute left-[22%] top-[23%] w-[10%] h-[12%] rounded-full bg-[rgba(144,197,255,0.84)]" />
          <div className="absolute right-[16%] top-[18%] w-[22%] h-[48%] rounded-[12px] bg-[rgba(49,34,63,0.75)]" />
          <div className="absolute right-[22%] top-[28%] w-[9%] h-[26%] rounded-[10px] bg-[rgba(255,214,165,0.8)]" />
          <div className="absolute inset-x-[12%] bottom-[13%] h-[14%] rounded-full bg-[rgba(52,34,37,0.88)]" />
        </>
      )}

      {photo.theme === 'night' && (
        <>
          <div className="absolute left-[18%] top-[12%] w-[18%] h-[18%] rounded-full bg-[rgba(245,240,174,0.92)]" />
          <div className="absolute inset-x-[-4%] bottom-[16%] h-[26%] rounded-[100%] bg-[rgba(6,10,18,0.95)] rotate-[-5deg]" />
          <div className="absolute right-[18%] bottom-[24%] w-[24%] h-[24%] rounded-[12px] bg-[rgba(14,22,38,0.94)] rotate-[10deg]" />
        </>
      )}

      {photo.theme === 'garden' && (
        <>
          <div className="absolute left-[14%] top-[16%] w-[18%] h-[26%] rounded-[100%] bg-[rgba(255,255,255,0.48)] blur-[2px]" />
          <div className="absolute inset-x-[-4%] bottom-[14%] h-[32%] rounded-[100%] bg-[rgba(34,66,44,0.92)] rotate-[-4deg]" />
          <div className="absolute left-[26%] bottom-[18%] w-[8%] h-[34%] rounded-full bg-[rgba(112,158,92,0.94)] rotate-[-6deg]" />
          <div className="absolute right-[24%] bottom-[20%] w-[10%] h-[30%] rounded-full bg-[rgba(89,143,72,0.96)] rotate-[8deg]" />
        </>
      )}

      {photo.theme === 'screen' && (
        <>
          <div className="absolute inset-[10%] rounded-[12px] border border-white/12 bg-[rgba(245,247,252,0.88)] overflow-hidden">
            <div className="h-[13%] bg-[rgba(223,229,242,0.9)]" />
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="col-span-2 space-y-2">
                <div className="h-3 rounded-full bg-[rgba(77,92,118,0.24)]" />
                <div className="h-3 w-[78%] rounded-full bg-[rgba(77,92,118,0.18)]" />
                <div className="h-3 w-[63%] rounded-full bg-[rgba(77,92,118,0.18)]" />
              </div>
              <div className="space-y-2">
                <div className="h-10 rounded-[10px] bg-[rgba(10,132,255,0.18)]" />
                <div className="h-10 rounded-[10px] bg-[rgba(255,149,0,0.16)]" />
              </div>
            </div>
          </div>
        </>
      )}

      {photo.theme === 'travel' && (
        <>
          <div className="absolute left-[16%] top-[16%] w-[36%] h-[18%] rounded-[100%] bg-[rgba(255,231,181,0.74)] blur-[1px]" />
          <div className="absolute inset-x-[14%] bottom-[18%] h-[20%] rounded-[60%] bg-[rgba(13,38,66,0.92)] rotate-[-7deg]" />
          <div className="absolute right-[14%] bottom-[16%] w-[18%] h-[30%] rounded-[14px] bg-[rgba(25,35,58,0.86)] rotate-[12deg]" />
        </>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(0,0,0,0.14))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.24),transparent_30%),linear-gradient(180deg,transparent_62%,rgba(0,0,0,0.18))]" />

      {overlayText && (
        <div
          className={`absolute ${large ? 'bottom-4 right-4 text-[14px]' : 'bottom-1.5 right-1.5 text-[10px]'} rounded-full px-2 py-1 text-white font-semibold tracking-wide`}
          style={{ background: photo.mediaType === 'video' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.22)' }}
        >
          {overlayText}
        </div>
      )}
    </div>
  );
}

function metadataRows(photo) {
  return [
    { label: 'Date', value: photo.group },
    { label: 'Location', value: photo.location },
    { label: 'Camera', value: photo.camera },
    { label: 'Dimensions', value: photo.dimensions },
    { label: 'File Size', value: photo.size },
    { label: 'Type', value: photo.mediaType },
  ];
}

export default function Photos() {
  const [activeSection, setActiveSection] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [detailPhoto, setDetailPhoto] = useState(null);
  const [favorites, setFavorites] = useState(new Set(photoData.filter(photo => photo.favorite).map(photo => photo.id)));

  const photos = useMemo(() => photoData.filter(photo => matchesSection(photo, activeSection, favorites)), [activeSection, favorites]);
  const groups = useMemo(() => groupPhotos(photos), [photos]);
  const currentPhoto = useMemo(() => photoData.find(photo => photo.id === detailPhoto) || null, [detailPhoto]);

  const toggleFav = useCallback((id, e) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    if (e.metaKey || e.ctrlKey) {
      setSelected(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } else {
      setSelected(new Set([id]));
    }
  };

  const activeLabel = activeSection === 'all'
    ? 'All Photos'
    : activeSection === 'days'
      ? 'Days'
      : activeSection === 'peoplePets'
        ? 'People & Pets'
        : activeSection === 'memories'
          ? 'Memories'
          : activeSection === 'trips'
            ? 'Trips'
            : activeSection === 'favorites'
              ? 'Favorites'
              : activeSection.charAt(0).toUpperCase() + activeSection.slice(1);

  if (detailPhoto && currentPhoto) {
    const currentIndex = photos.findIndex(photo => photo.id === currentPhoto.id);
    const filmstrip = photos.slice(Math.max(0, currentIndex - 4), Math.min(photos.length, currentIndex + 5));

    return (
      <div className="flex flex-col h-full" style={{ background: '#080809' }}>
        <div className="h-[40px] flex items-center justify-between px-3 shrink-0" style={{ background: 'rgba(30,30,30,0.8)' }}>
          <button
            className="flex items-center gap-1 text-[13px] text-[#0a84ff] hover:text-[#3ba0ff] cursor-default"
            onClick={() => setDetailPhoto(null)}
          >
            <SFSymbol name="chevron.left" size={14} color="currentColor" />
            <span>Library</span>
          </button>
          <div className="flex items-center gap-1">
            <MacToolbarButton
              icon={favorites.has(detailPhoto) ? 'heart.fill' : 'heart'}
              onClick={(e) => toggleFav(detailPhoto, e)}
              size={28}
            />
            <MacToolbarButton icon="square.and.arrow.up" label="Share" size={28} />
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-[760px] aspect-[4/3] rounded-[24px] overflow-hidden border border-white/8 bg-black shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
                <PhotoThumbnail photo={currentPhoto} large />
              </div>
            </div>
            <div className="h-[112px] shrink-0 border-t border-white/6 px-4 py-3" style={{ background: 'rgba(14,14,15,0.96)' }}>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-2">Filmstrip</div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {filmstrip.map(photo => (
                  <button
                    key={photo.id}
                    className="w-[74px] h-[74px] shrink-0 rounded-[12px] overflow-hidden border cursor-default"
                    style={{
                      borderColor: photo.id === currentPhoto.id ? 'rgba(10,132,255,0.95)' : 'rgba(255,255,255,0.08)',
                      boxShadow: photo.id === currentPhoto.id ? '0 0 0 1px rgba(10,132,255,0.45)' : 'none',
                    }}
                    onClick={() => setDetailPhoto(photo.id)}
                  >
                    <PhotoThumbnail photo={photo} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-[286px] shrink-0 border-l border-white/6 overflow-y-auto px-4 py-4" style={{ background: 'rgba(22,22,24,0.96)' }}>
            <div className="rounded-[16px] border border-white/6 bg-white/4 p-4">
              <div className="text-[16px] text-white/92 font-medium leading-tight">{currentPhoto.title}</div>
              <div className="mt-1 text-[12px] text-white/38">{currentPhoto.group}</div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-[8px] text-[12px] text-white/82 bg-white/6 border border-white/8 hover:bg-white/10 cursor-default"
                  onClick={(e) => toggleFav(currentPhoto.id, e)}
                >
                  {favorites.has(currentPhoto.id) ? 'Favorited' : 'Favorite'}
                </button>
                <button className="px-3 py-1.5 rounded-[8px] text-[12px] text-white/82 bg-white/6 border border-white/8 hover:bg-white/10 cursor-default">
                  Share
                </button>
              </div>
            </div>

            <div className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/30 mb-2">Info</div>
            <div className="rounded-[16px] border border-white/6 bg-white/4 divide-y divide-white/6 overflow-hidden">
              {metadataRows(currentPhoto).map(row => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3 text-[12px]">
                  <span className="text-white/38">{row.label}</span>
                  <span className="text-white/82 text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/30 mb-2">Collections</div>
            <div className="flex flex-wrap gap-1.5">
              {currentPhoto.collections.map(collection => (
                <span
                  key={collection}
                  className="rounded-full px-2 py-1 text-[10px] leading-none text-white/78"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                >
                  {collection === 'peoplePets' ? 'People & Pets' : collection.charAt(0).toUpperCase() + collection.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div
        className="w-[180px] shrink-0 flex flex-col pt-2 pb-1 overflow-y-auto"
        style={{ background: 'rgba(38,38,40,0.92)', borderRight: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        {Object.entries(sidebarSections).map(([title, items]) => (
          <MacSidebarSection key={title} title={title}>
            {items.map(item => (
              <MacSidebarItem
                key={item.id}
                icon={item.icon}
                iconColor={item.color}
                label={item.label}
                selected={activeSection === item.id}
                onClick={() => { setActiveSection(item.id); setSelected(new Set()); }}
                badge={item.id === 'all' ? photoData.length : item.id === 'favorites' ? favorites.size : undefined}
              />
            ))}
          </MacSidebarSection>
        ))}
      </div>

      <div className="flex-1 flex flex-col" style={{ background: 'rgba(18,18,20,0.97)' }}>
        <div className="h-[38px] flex items-center justify-between px-3 shrink-0" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-1">
            <MacToolbarButton icon="sidebar.left" label="Sidebar" size={26} />
          </div>
          <span className="text-[13px] text-white/80 font-medium tracking-normal">{activeLabel}</span>
          <div className="flex items-center gap-1">
            <MacToolbarButton icon="line.3.horizontal.decrease" label="Filter" size={26} />
            <MacToolbarButton icon="square.and.arrow.up" label="Export" size={26} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2" onClick={() => setSelected(new Set())}>
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
              <SFSymbol name="heart" size={40} color="rgba(255,255,255,0.1)" />
              <span className="text-[14px]">No Photos</span>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.title} className="mb-4">
                <h3 className="text-[13px] text-white/50 font-medium mb-1.5 px-1">{group.title}</h3>
                <div className="grid grid-cols-5 gap-[2px]">
                  {group.photos.map(photo => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-[4px] overflow-hidden cursor-default group"
                      onClick={e => toggleSelect(photo.id, e)}
                      onDoubleClick={() => setDetailPhoto(photo.id)}
                    >
                      <PhotoThumbnail photo={photo} />
                      {selected.has(photo.id) && (
                        <div className="absolute inset-0 border-[3px] border-[#0a84ff] rounded-[4px] z-10">
                          <div className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-[#0a84ff] flex items-center justify-center">
                            <SFSymbol name="checkmark" size={10} color="white" weight={2.5} />
                          </div>
                        </div>
                      )}
                      <button
                        className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={e => toggleFav(photo.id, e)}
                      >
                        <SFSymbol
                          name={favorites.has(photo.id) ? 'heart.fill' : 'heart'}
                          size={14}
                          color={favorites.has(photo.id) ? '#FF3B30' : 'rgba(255,255,255,0.8)'}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="h-[22px] flex items-center justify-center text-[11px] text-white/30 shrink-0" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
          {photos.length} Photo{photos.length !== 1 ? 's' : ''}{selected.size > 0 ? ` — ${selected.size} Selected` : ''}
        </div>
      </div>
    </div>
  );
}
