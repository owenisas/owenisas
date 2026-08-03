import { useEffect, useMemo, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import {
  MacToolbarButton,
  MacSearchField,
  MacSegmentedControl,
  MacSidebarItem,
  MacSidebarSection,
} from '../components/ui/MacControls';

const STATUS_COLORS = {
  completed: '#34c759',
  watching: '#0a84ff',
  planned: '#ffcc00',
  dropped: '#ff3b30',
};

const STATUS_LABELS = {
  completed: 'Completed',
  watching: 'Watching',
  planned: 'Planned',
  dropped: 'Dropped',
};

const SIDEBAR_OPTIONS = [
  { id: 'all', label: 'All', icon: 'square.grid.2x2' },
  { id: 'favorites', label: 'Favorites', icon: 'star' },
  { id: 'completed', label: 'Completed', icon: 'checkmark.circle' },
  { id: 'watching', label: 'Watching', icon: 'play.circle' },
  { id: 'planned', label: 'Planned', icon: 'clock' },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'title', label: 'Title' },
];

export default function AnimeTracker() {
  const [anime, setAnime] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('rating');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/data/anime.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : [])
      .then(d => setAnime(d))
      .catch(() => setAnime([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return anime
      .filter(a => {
        if (filter === 'all') return true;
        if (filter === 'favorites') return a.favorite;
        return a.status === filter;
      })
      .filter((a) => !q || a.title.toLowerCase().includes(q) || (a.tags || []).some((t) => t.toLowerCase().includes(q)) || (a.studio || '').toLowerCase().includes(q))
      .sort((a, b) => sort === 'rating' ? b.rating - a.rating : a.title.localeCompare(b.title));
  }, [anime, filter, sort, query]);

  const filterCount = (id) => {
    if (id === 'all') return anime.length;
    if (id === 'favorites') return anime.filter((a) => a.favorite).length;
    return anime.filter((a) => a.status === id).length;
  };

  if (selected) {
    const a = anime.find((x) => x.id === selected);
    if (!a) { setSelected(null); return null; }
    return (
      <div className="h-full w-full flex flex-col" style={{ background: '#1c1c1e', color: '#ebf0f5' }}>
        {/* Toolbar — macOS native */}
        <div className="h-[44px] shrink-0 flex items-center justify-between px-3 DragHandle"
          style={{ background: 'rgba(28,28,30,0.78)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <button
            className="flex items-center gap-1 text-[13px] text-[#0a84ff] hover:text-[#409cff] cursor-default transition-colors"
            onClick={() => setSelected(null)}
          >
            <SFSymbol name="chevron.left" size={14} color="currentColor" />
            <span>Library</span>
          </button>
          <div className="flex items-center gap-1">
            <MacToolbarButton icon={a.favorite ? 'star.fill' : 'star'} label="Favorite" size={28}
              active={a.favorite}
              onClick={() => setAnime((prev) => prev.map((x) => x.id === a.id ? { ...x, favorite: !x.favorite } : x))} />
            <MacToolbarButton icon="square.and.arrow.up" label="Share" size={28} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Cover banner */}
          <div className="h-[220px] relative shrink-0" style={{ background: a.cover }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #1c1c1e 0%, rgba(28,28,30,0.15) 60%, transparent 100%)' }} />
          </div>

          <div className="max-w-[680px] w-full mx-auto px-6 -mt-12 relative flex flex-col">
            <h1 className="text-[28px] font-bold leading-tight" style={{ color: '#fff' }}>{a.title}</h1>
            <div className="flex items-center gap-2 mt-1.5 text-[13px]" style={{ color: 'rgba(235,235,245,0.6)' }}>
              <span>{a.year}</span>
              <span>·</span>
              <span>{a.studio}</span>
              <span>·</span>
              <span>{a.episodes} eps</span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-[7px] h-[7px] rounded-full" style={{ background: STATUS_COLORS[a.status] }} />
                <span style={{ color: STATUS_COLORS[a.status] }}>{STATUS_LABELS[a.status] || a.status}</span>
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[12px] h-[12px] rounded-[3px]"
                    style={{ background: i < a.rating ? a.accent : 'rgba(255,255,255,0.1)' }}
                  />
                ))}
              </div>
              <span className="text-[20px] font-bold" style={{ color: a.accent }}>{a.rating}</span>
              <span className="text-[13px]" style={{ color: 'rgba(235,235,245,0.5)' }}>/ 10</span>
            </div>

            {/* Metadata — hairline-card */}
            <div className="mt-5 rounded-[10px] overflow-hidden divide-y"
              style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              {[
                { label: 'Studio', value: a.studio, icon: 'building.2' },
                { label: 'Year', value: a.year, icon: 'calendar' },
                { label: 'Episodes', value: a.episodes, icon: 'film' },
                { label: 'Type', value: a.type === 'vn' ? 'Visual Novel' : 'Series', icon: 'rectangle.stack' },
                { label: 'Status', value: STATUS_LABELS[a.status] || a.status, icon: 'circle.fill' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
                  <span className="flex items-center gap-2" style={{ color: 'rgba(235,235,245,0.5)' }}>
                    <SFSymbol name={row.icon} size={11} color="rgba(235,235,245,0.4)" />
                    {row.label}
                  </span>
                  <span className="text-right font-medium" style={{ color: '#ebf0f5' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Synopsis */}
            <div className="mt-5">
              <h2 className="text-[15px] font-semibold mb-1.5" style={{ color: 'rgba(235,235,245,0.6)' }}>Synopsis</h2>
              <p className="text-[14px] leading-[1.6]" style={{ color: '#ebf0f5' }}>{a.synopsis}</p>
            </div>

            {/* Characters */}
            {a.characters?.length > 0 && (
              <div className="mt-5">
                <h2 className="text-[15px] font-semibold mb-1.5" style={{ color: 'rgba(235,235,245,0.6)' }}>Characters</h2>
                <div className="flex flex-wrap gap-2">
                  {a.characters.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1.5 rounded-full text-[13px]"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)' }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {a.tags?.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.map((t) => (
                    <span key={t} className="text-[12px] px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(235,235,245,0.5)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {a.notes && (
              <div className="mt-5 mb-6 p-4 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                <h2 className="text-[15px] font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: a.accent }}>
                  <SFSymbol name="quote.bubble" size={12} color={a.accent} />
                  My Notes
                </h2>
                <p className="text-[14px] leading-[1.6]" style={{ color: '#ebf0f5' }}>{a.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const sidebarBg = 'rgba(38,38,40,0.92)';

  return (
    <div className="h-full w-full flex flex-col" style={{ background: '#1c1c1e', color: '#ebf0f5' }}>
      {/* Toolbar — macOS native frosted */}
      <div className="h-[44px] shrink-0 flex items-center gap-1 px-3 DragHandle"
        style={{ background: 'rgba(28,28,30,0.78)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-1">
          <MacToolbarButton icon="sidebar.left" label="Sidebar" size={26} />
          <MacToolbarButton icon="line.3.horizontal.decrease" label="Filter" size={26} />
        </div>
        <div className="flex-1 flex justify-center px-3">
          <MacSearchField
            value={query}
            onChange={setQuery}
            placeholder="Search"
            className="w-[220px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: 'rgba(235,235,245,0.4)' }}>Sort</span>
          <MacSegmentedControl options={SORT_OPTIONS} value={sort} onChange={setSort} size="small" />
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar — native macOS library list */}
        <div
          className="w-[200px] shrink-0 flex flex-col py-2 overflow-y-auto"
          style={{ background: sidebarBg, borderRight: '0.5px solid rgba(255,255,255,0.06)' }}
        >
          <MacSidebarSection title="Library">
            {SIDEBAR_OPTIONS.map((f) => (
              <MacSidebarItem
                key={f.id}
                icon={f.icon}
                label={f.label}
                selected={filter === f.id}
                badge={filterCount(f.id)}
                onClick={() => setFilter(f.id)}
              />
            ))}
          </MacSidebarSection>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Header row */}
          <div className="px-6 pt-4 pb-3 shrink-0" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-bold" style={{ color: '#fff' }}>Anime Tracker</h1>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(235,235,245,0.45)' }}>{filtered.length} titles</p>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
                  <SFSymbol name="film.stack" size={28} color="rgba(235,235,245,0.4)" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold" style={{ color: 'rgba(235,235,245,0.6)' }}>
                    {query.trim() ? 'No matches found' : 'Your library is empty'}
                  </div>
                  <div className="text-[12px] mt-1" style={{ color: 'rgba(235,235,245,0.4)' }}>
                    {query.trim() ? 'Try a different search term' : 'Add anime to /data/anime.json to get started'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-w-[680px] mx-auto">
                {filtered.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a.id)}
                    className="text-left rounded-[10px] overflow-hidden transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    {/* Cover */}
                    <div className="h-[120px] relative" style={{ background: a.cover }}>
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
                      {a.favorite && (
                        <div className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
                          <SFSymbol name="star.fill" size={11} color={a.accent} />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
                        <div className="w-[6px] h-[6px] rounded-full" style={{ background: STATUS_COLORS[a.status] }} />
                        <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{STATUS_LABELS[a.status] || a.status}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-6">
                        <h3 className="text-[14px] font-semibold leading-tight truncate" style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{a.title}</h3>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px]" style={{ color: 'rgba(235,235,245,0.5)' }}>{a.year} · {a.episodes} eps</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[14px] font-bold" style={{ color: a.accent }}>{a.rating}</span>
                          <span className="text-[10px]" style={{ color: 'rgba(235,235,245,0.5)' }}>/10</span>
                        </div>
                      </div>
                      {a.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {a.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(235,235,245,0.4)' }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}