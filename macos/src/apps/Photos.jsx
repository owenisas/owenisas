import { useCallback, useMemo, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacSidebarItem, MacSidebarSection, MacToolbarButton } from '../components/ui/MacControls';
import { photography } from '../fs/vfs';

const sidebarSections = {
  Library: [
    { id: 'all', label: 'All Photos', icon: 'photo', color: '#007AFF' },
    { id: 'favorites', label: 'Favorites', icon: 'heart.fill', color: '#FF3B30' },
    { id: 'aerial', label: 'Aerial', icon: 'airplane', color: '#34C759' },
    { id: 'portrait', label: 'Portrait', icon: 'person.crop.square', color: '#FF9500' },
    { id: 'macro', label: 'Macro', icon: 'sparkles', color: '#BF5AF2' },
  ],
  'Smart Albums': [
    { id: 'recent', label: 'Recents', icon: 'clock', color: '#0A84FF' },
    { id: 'screenshots', label: 'Screenshots', icon: 'display', color: '#0A84FF' },
  ],
};

function classify(photo) {
  const cam = (photo.meta.camera || '').toLowerCase();
  const lens = (photo.meta.lens || '').toLowerCase();
  if (cam.includes('mavic') || cam.includes('drone')) return 'aerial';
  if (lens.includes('macro')) return 'macro';
  if (lens.includes('50mm') || lens.includes('85mm') || lens.includes('90mm')) return 'portrait';
  return 'other';
}

function matchesSection(photo, section, favs) {
  if (section === 'all') return true;
  if (section === 'favorites') return favs.has(photo.slug);
  if (section === 'screenshots') return false;
  if (section === 'recent') return true;
  return classify(photo) === section;
}

function groupByMonth(items) {
  const groups = new Map();
  for (const p of items) {
    const d = new Date(p.meta.date);
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  return Array.from(groups.entries()).map(([title, photos]) => ({ title, photos }));
}

function Thumbnail({ photo }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <img
        src={photo.src}
        alt={photo.title}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={e => {
          e.currentTarget.style.display = 'none';
          const fb = e.currentTarget.nextElementSibling;
          if (fb) fb.style.display = 'flex';
        }}
      />
      <div
        className="absolute inset-0 items-center justify-center text-[10px] text-white/40 font-mono"
        style={{
          display: 'none',
          background: `linear-gradient(135deg, rgba(${parseInt(photo.slug.charCodeAt(0))%255},${parseInt(photo.slug.charCodeAt(1))%255},80,0.6), rgba(20,20,40,0.9))`,
        }}
      >
        {photo.title}
      </div>
    </div>
  );
}

function metaRows(photo) {
  const m = photo.meta;
  return [
    { label: 'Camera', value: m.camera },
    { label: 'Lens', value: m.lens },
    { label: 'ISO', value: String(m.iso) },
    { label: 'Shutter', value: m.shutter },
    { label: 'Aperture', value: m.aperture },
    { label: 'Date', value: m.date },
    { label: 'Location', value: m.location },
  ];
}

export default function Photos() {
  const [activeSection, setActiveSection] = useState('all');
  const [detailSlug, setDetailSlug] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const filtered = useMemo(
    () => photography.filter(p => matchesSection(p, activeSection, favorites)),
    [activeSection, favorites]
  );
  const groups = useMemo(() => groupByMonth(filtered), [filtered]);
  const detail = useMemo(
    () => photography.find(p => p.slug === detailSlug) || null,
    [detailSlug]
  );

  const toggleFav = useCallback((slug, e) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const n = new Set(prev);
      n.has(slug) ? n.delete(slug) : n.add(slug);
      return n;
    });
  }, []);

  const sectionLabel = sidebarSections.Library.concat(sidebarSections['Smart Albums'])
    .find(s => s.id === activeSection)?.label || 'Photos';

  if (detail) {
    const idx = filtered.findIndex(p => p.slug === detail.slug);
    const strip = filtered.slice(Math.max(0, idx - 4), Math.min(filtered.length, idx + 5));

    return (
      <div className="flex flex-col h-full" style={{ background: '#080809' }}>
        <div className="h-[40px] flex items-center justify-between px-3 shrink-0" style={{ background: 'rgba(30,30,30,0.8)' }}>
          <button
            className="flex items-center gap-1 text-[13px] text-[#0a84ff] hover:text-[#3ba0ff] cursor-default"
            onClick={() => setDetailSlug(null)}
          >
            <SFSymbol name="chevron.left" size={14} color="currentColor" />
            <span>Library</span>
          </button>
          <div className="flex items-center gap-1">
            <MacToolbarButton
              icon={favorites.has(detail.slug) ? 'heart.fill' : 'heart'}
              onClick={(e) => toggleFav(detail.slug, e)}
              size={28}
            />
            <MacToolbarButton icon="square.and.arrow.up" label="Share" size={28} />
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-[820px] aspect-[4/3] rounded-[24px] overflow-hidden border border-white/8 bg-black shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
                <Thumbnail photo={detail} />
              </div>
            </div>
            {strip.length > 1 && (
              <div className="h-[112px] shrink-0 border-t border-white/6 px-4 py-3" style={{ background: 'rgba(14,14,15,0.96)' }}>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-2">Filmstrip</div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {strip.map(p => (
                    <button
                      key={p.slug}
                      className="w-[74px] h-[74px] shrink-0 rounded-[12px] overflow-hidden border cursor-default"
                      style={{
                        borderColor: p.slug === detail.slug ? 'rgba(10,132,255,0.95)' : 'rgba(255,255,255,0.08)',
                        boxShadow: p.slug === detail.slug ? '0 0 0 1px rgba(10,132,255,0.45)' : 'none',
                      }}
                      onClick={() => setDetailSlug(p.slug)}
                    >
                      <Thumbnail photo={p} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-[286px] shrink-0 border-l border-white/6 overflow-y-auto px-4 py-4" style={{ background: 'rgba(22,22,24,0.96)' }}>
            <div className="rounded-[16px] border border-white/6 bg-white/4 p-4">
              <div className="text-[16px] text-white/92 font-medium leading-tight">{detail.title}</div>
              <div className="mt-1 text-[12px] text-white/38">{detail.meta.location}</div>
              {detail.meta.caption && (
                <div className="mt-3 text-[12px] text-white/65 leading-relaxed">{detail.meta.caption}</div>
              )}
              <div className="mt-4 flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-[8px] text-[12px] text-white/82 bg-white/6 border border-white/8 hover:bg-white/10 cursor-default"
                  onClick={(e) => toggleFav(detail.slug, e)}
                >
                  {favorites.has(detail.slug) ? 'Favorited' : 'Favorite'}
                </button>
                <button className="px-3 py-1.5 rounded-[8px] text-[12px] text-white/82 bg-white/6 border border-white/8 hover:bg-white/10 cursor-default">
                  Share
                </button>
              </div>
            </div>

            <div className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/30 mb-2">EXIF</div>
            <div className="rounded-[16px] border border-white/6 bg-white/4 divide-y divide-white/6 overflow-hidden">
              {metaRows(detail).map(row => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12px]">
                  <span className="text-white/38">{row.label}</span>
                  <span className="text-white/82 text-right font-mono">{row.value}</span>
                </div>
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
        className="w-[190px] shrink-0 flex flex-col pt-2 pb-1 overflow-y-auto"
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
                onClick={() => setActiveSection(item.id)}
                badge={item.id === 'all' ? photography.length : item.id === 'favorites' ? favorites.size : undefined}
              />
            ))}
          </MacSidebarSection>
        ))}
      </div>

      <div className="flex-1 flex flex-col" style={{ background: 'rgba(18,18,20,0.97)' }}>
        <div className="h-[38px] flex items-center justify-between px-3 shrink-0" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <MacToolbarButton icon="sidebar.left" label="Sidebar" size={26} />
          <span className="text-[13px] text-white/80 font-medium">{sectionLabel}</span>
          <div className="flex items-center gap-1">
            <MacToolbarButton icon="line.3.horizontal.decrease" label="Filter" size={26} />
            <MacToolbarButton icon="square.and.arrow.up" label="Export" size={26} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
              <SFSymbol name="photo" size={40} color="rgba(255,255,255,0.1)" />
              <span className="text-[14px]">No Photos</span>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.title} className="mb-5">
                <h3 className="text-[13px] text-white/50 font-medium mb-1.5 px-1">{group.title}</h3>
                <div className="grid grid-cols-4 gap-[3px]">
                  {group.photos.map(photo => (
                    <div
                      key={photo.slug}
                      className="relative aspect-square rounded-[4px] overflow-hidden cursor-default group"
                      onDoubleClick={() => setDetailSlug(photo.slug)}
                      onClick={() => setDetailSlug(photo.slug)}
                    >
                      <Thumbnail photo={photo} />
                      <button
                        className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={e => toggleFav(photo.slug, e)}
                      >
                        <SFSymbol
                          name={favorites.has(photo.slug) ? 'heart.fill' : 'heart'}
                          size={14}
                          color={favorites.has(photo.slug) ? '#FF3B30' : 'rgba(255,255,255,0.85)'}
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
          {filtered.length} Photo{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
