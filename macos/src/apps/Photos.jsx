import { useState, useCallback } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacSidebarItem, MacSidebarSection, MacToolbarButton } from '../components/ui/MacControls';

// Gradient-based placeholders that look like actual photos
const photoData = [
  // April 2025
  { id: 1, bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', date: 'Apr 11', group: 'April 11, 2025', fav: false },
  { id: 2, bg: 'linear-gradient(135deg, #4ecdc4 0%, #2c3e50 100%)', date: 'Apr 11', group: 'April 11, 2025', fav: true },
  { id: 3, bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', date: 'Apr 11', group: 'April 11, 2025', fav: false },
  { id: 4, bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', date: 'Apr 10', group: 'April 10, 2025', fav: true },
  { id: 5, bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', date: 'Apr 10', group: 'April 10, 2025', fav: false },
  { id: 6, bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', date: 'Apr 10', group: 'April 10, 2025', fav: false },
  { id: 7, bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', date: 'Apr 10', group: 'April 10, 2025', fav: true },
  // March 2025
  { id: 8, bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', date: 'Mar 28', group: 'March 28, 2025', fav: false },
  { id: 9, bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', date: 'Mar 28', group: 'March 28, 2025', fav: false },
  { id: 10, bg: 'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)', date: 'Mar 25', group: 'March 25, 2025', fav: true },
  { id: 11, bg: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)', date: 'Mar 25', group: 'March 25, 2025', fav: false },
  { id: 12, bg: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)', date: 'Mar 20', group: 'March 20, 2025', fav: false },
  { id: 13, bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', date: 'Mar 20', group: 'March 20, 2025', fav: false },
  { id: 14, bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', date: 'Mar 20', group: 'March 20, 2025', fav: true },
  { id: 15, bg: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', date: 'Mar 15', group: 'March 15, 2025', fav: false },
  // February 2025
  { id: 16, bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', date: 'Feb 20', group: 'February 20, 2025', fav: false },
  { id: 17, bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', date: 'Feb 14', group: 'February 14, 2025', fav: true },
  { id: 18, bg: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', date: 'Feb 14', group: 'February 14, 2025', fav: false },
  { id: 19, bg: 'linear-gradient(to right, #614385, #516395)', date: 'Feb 10', group: 'February 10, 2025', fav: false },
  { id: 20, bg: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', date: 'Feb 10', group: 'February 10, 2025', fav: false },
  { id: 21, bg: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)', date: 'Feb 5', group: 'February 5, 2025', fav: false },
  { id: 22, bg: 'linear-gradient(135deg, #c33764 0%, #1d2671 100%)', date: 'Feb 5', group: 'February 5, 2025', fav: true },
  { id: 23, bg: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)', date: 'Feb 1', group: 'February 1, 2025', fav: false },
  { id: 24, bg: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)', date: 'Feb 1', group: 'February 1, 2025', fav: false },
];

const sidebarSections = {
  Library: [
    { id: 'all', label: 'All Photos', icon: 'photo', color: '#007AFF' },
    { id: 'favorites', label: 'Favorites', icon: 'heart.fill', color: '#FF3B30' },
    { id: 'recents', label: 'Recents', icon: 'clock', color: '#007AFF' },
  ],
  'People & Places': [
    { id: 'people', label: 'People', icon: 'person.crop.circle', color: '#FF9500' },
    { id: 'places', label: 'Places', icon: 'map', color: '#34C759' },
  ],
  'Media Types': [
    { id: 'videos', label: 'Videos', icon: 'video', color: '#5856D6' },
    { id: 'screenshots', label: 'Screenshots', icon: 'display', color: '#007AFF' },
    { id: 'selfies', label: 'Selfies', icon: 'camera', color: '#FF2D55' },
  ],
};

export default function Photos() {
  const [activeSection, setActiveSection] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [detailPhoto, setDetailPhoto] = useState(null);
  const [favorites, setFavorites] = useState(new Set(photoData.filter(p => p.fav).map(p => p.id)));

  const photos = activeSection === 'favorites'
    ? photoData.filter(p => favorites.has(p.id))
    : activeSection === 'recents'
    ? photoData.slice(0, 8)
    : photoData;

  // Group photos by date
  const groups = [];
  let lastGroup = null;
  photos.forEach(p => {
    if (p.group !== lastGroup) {
      groups.push({ title: p.group, photos: [] });
      lastGroup = p.group;
    }
    groups[groups.length - 1].photos.push(p);
  });

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

  if (detailPhoto) {
    const photo = photoData.find(p => p.id === detailPhoto);
    return (
      <div className="flex flex-col h-full" style={{ background: '#000' }}>
        {/* Detail toolbar */}
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
        {/* Photo */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[500px] aspect-[4/3] rounded-lg" style={{ background: photo?.bg }} />
        </div>
        {/* Info */}
        <div className="h-[36px] flex items-center justify-center text-[11px] text-white/30 shrink-0">
          {photo?.group} &middot; IMG_{String(photo?.id).padStart(4, '0')}.HEIC
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className="w-[180px] shrink-0 flex flex-col pt-2 pb-1 overflow-y-auto"
        style={{ background: 'rgba(42,42,44,0.95)', borderRight: '0.5px solid rgba(255,255,255,0.08)' }}
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

      {/* Main */}
      <div className="flex-1 flex flex-col" style={{ background: 'rgba(28,28,30,0.95)' }}>
        {/* Toolbar */}
        <div className="h-[36px] flex items-center justify-between px-3 shrink-0" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-1">
            <MacToolbarButton icon="sidebar.left" label="Sidebar" size={26} />
          </div>
          <span className="text-[13px] text-white/80 font-medium">
            {activeSection === 'all' ? 'All Photos' : activeSection === 'favorites' ? 'Favorites' : activeSection === 'recents' ? 'Recents' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </span>
          <div className="flex items-center gap-1">
            <MacToolbarButton icon="line.3.horizontal.decrease" label="Filter" size={26} />
            <MacToolbarButton icon="square.and.arrow.up" label="Export" size={26} />
          </div>
        </div>

        {/* Photo grid */}
        <div className="flex-1 overflow-y-auto px-3 py-2" onClick={() => setSelected(new Set())}>
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
              <SFSymbol name="heart" size={40} color="rgba(255,255,255,0.1)" />
              <span className="text-[14px]">No Favorites</span>
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
                      style={{ background: photo.bg }}
                      onClick={e => toggleSelect(photo.id, e)}
                      onDoubleClick={() => setDetailPhoto(photo.id)}
                    >
                      {/* Selection overlay */}
                      {selected.has(photo.id) && (
                        <div className="absolute inset-0 border-[3px] border-[#0a84ff] rounded-[4px] z-10">
                          <div className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-[#0a84ff] flex items-center justify-center">
                            <SFSymbol name="checkmark" size={10} color="white" weight={2.5} />
                          </div>
                        </div>
                      )}
                      {/* Favorite heart on hover */}
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
                      {/* Hover scale */}
                      <div className="absolute inset-0 transition-transform group-hover:scale-[1.02]" style={{ background: photo.bg }} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status */}
        <div className="h-[22px] flex items-center justify-center text-[11px] text-white/30 shrink-0" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
          {photos.length} Photo{photos.length !== 1 ? 's' : ''}{selected.size > 0 ? ` — ${selected.size} Selected` : ''}
        </div>
      </div>
    </div>
  );
}
