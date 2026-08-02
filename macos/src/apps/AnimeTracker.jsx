import { useEffect, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';

const STATUS_COLORS = {
  completed: '#34c759',
  watching: '#00d9ff',
  planned: '#ffcc00',
  dropped: '#ff3b30',
};

export default function AnimeTracker() {
  const [anime, setAnime] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('rating');

  useEffect(() => {
    fetch('/data/anime.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : [])
      .then(d => setAnime(d))
      .catch(() => setAnime([]));
  }, []);

  const filtered = anime
    .filter(a => filter === 'all' ? true : filter === 'favorites' ? a.favorite : a.status === filter)
    .sort((a, b) => sort === 'rating' ? b.rating - a.rating : a.title.localeCompare(b.title));

  if (selected) {
    const a = anime.find(x => x.id === selected);
    if (!a) { setSelected(null); return null; }
    return (
      <div className="h-full w-full overflow-y-auto" style={{ background: '#0a0a0f', color: '#e7e9ea' }}>
        {/* Cover banner */}
        <div className="h-[200px] relative" style={{ background: a.cover }}>
          <button
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[13px] font-medium backdrop-blur-md flex items-center gap-1.5"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
            onClick={() => setSelected(null)}
          >
            <SFSymbol name="chevron.left" size={13} color="#fff" />
            Back
          </button>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0a0f 0%, transparent 100%)' }} />
        </div>

        <div className="max-w-[680px] mx-auto px-6 -mt-8 relative">
          <h1 className="text-[28px] font-bold leading-tight">{a.title}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-[13px]" style={{ color: '#71767b' }}>
            <span>{a.year}</span>
            <span>·</span>
            <span>{a.studio}</span>
            <span>·</span>
            <span>{a.episodes} eps</span>
            <span>·</span>
            <span style={{ color: STATUS_COLORS[a.status] }}>{a.status}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="w-[12px] h-[12px] rounded-[2px]"
                  style={{ background: i < a.rating ? a.accent : 'rgba(255,255,255,0.1)' }}
                />
              ))}
            </div>
            <span className="text-[20px] font-bold" style={{ color: a.accent }}>{a.rating}</span>
            <span className="text-[13px]" style={{ color: '#71767b' }}>/ 10</span>
          </div>

          {/* Synopsis */}
          <div className="mt-5">
            <h2 className="text-[15px] font-semibold mb-1.5" style={{ color: '#71767b' }}>Synopsis</h2>
            <p className="text-[14px] leading-[1.6]" style={{ color: '#e7e9ea' }}>{a.synopsis}</p>
          </div>

          {/* Characters */}
          {a.characters?.length > 0 && (
            <div className="mt-5">
              <h2 className="text-[15px] font-semibold mb-1.5" style={{ color: '#71767b' }}>Characters</h2>
              <div className="flex flex-wrap gap-2">
                {a.characters.map(c => (
                  <span
                    key={c}
                    className="px-3 py-1.5 rounded-full text-[13px]"
                    style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${a.accent}33` }}
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
                {a.tags.map(t => (
                  <span key={t} className="text-[12px] px-2.5 py-1 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#71767b' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {a.notes && (
            <div className="mt-5 mb-6 p-4 rounded-[12px]" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${a.accent}22` }}>
              <h2 className="text-[15px] font-semibold mb-1.5" style={{ color: '#71767b' }}>My Notes</h2>
              <p className="text-[14px] leading-[1.6]" style={{ color: '#e7e9ea' }}>{a.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col" style={{ background: '#0a0a0f', color: '#e7e9ea' }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold flex items-center gap-2">
              <span style={{ color: '#00d9ff' }}>Anime</span>
              <span className="text-[16px] font-normal" style={{ color: '#71767b' }}>Tracker</span>
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: '#71767b' }}>El Psy Kongroo</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-[12px] px-2 py-1 rounded-[6px] outline-none cursor-default"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#e7e9ea' }}
            >
              <option value="rating">Sort: Rating</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'favorites', label: '★ Favorites' },
            { id: 'completed', label: 'Completed' },
            { id: 'watching', label: 'Watching' },
          ].map(f => (
            <button
              key={f.id}
              className="px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors"
              style={{
                background: filter === f.id ? 'rgba(0,217,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: filter === f.id ? '1px solid rgba(0,217,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                color: filter === f.id ? '#00d9ff' : '#71767b',
              }}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3 max-w-[680px] mx-auto">
          {filtered.map(a => (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className="text-left rounded-[14px] overflow-hidden transition-transform hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Cover */}
              <div className="h-[100px] relative" style={{ background: a.cover }}>
                {a.favorite && (
                  <div className="absolute top-2 right-2 w-[20px] h-[20px] rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <span style={{ color: a.accent, fontSize: 11 }}>★</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <div className="flex items-center gap-1">
                    <div className="w-[6px] h-[6px] rounded-full" style={{ background: STATUS_COLORS[a.status] }} />
                    <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{a.status}</span>
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <h3 className="text-[14px] font-semibold leading-tight truncate">{a.title}</h3>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px]" style={{ color: '#71767b' }}>{a.year} · {a.episodes} eps</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] font-bold" style={{ color: a.accent }}>{a.rating}</span>
                    <span className="text-[10px]" style={{ color: '#71767b' }}>/10</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
