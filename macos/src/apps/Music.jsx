import { useEffect, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';

export default function Music() {
  const [playlists, setPlaylists] = useState([]);
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch('/data/music.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setPlaylists(d); if (d.length) setActive(d[0]); })
      .catch(() => setPlaylists([]));
  }, []);

  return (
    <div className="h-full w-full flex" style={{ background: '#0a0a0f', color: '#e7e9ea' }}>
      {/* Sidebar */}
      <div className="w-[200px] shrink-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.4)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-[18px] font-bold flex items-center gap-2">
            <SFSymbol name="music.note" size={20} color="#fc3c44" />
            Music
          </h1>
        </div>
        <div className="px-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/30 px-2 mb-1.5">Playlists</div>
          {playlists.map(p => (
            <button
              key={p.id}
              onClick={() => { setActive(p); setPlaying(true); }}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] text-left transition-colors text-[13px]"
              style={{
                background: active?.id === p.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: active?.id === p.id ? '#fff' : 'rgba(255,255,255,0.6)',
              }}
            >
              <div className="w-[28px] h-[28px] rounded-[5px] shrink-0" style={{ background: p.art }} />
              <div className="min-w-0">
                <div className="truncate font-medium">{p.title}</div>
                <div className="text-[11px] opacity-50 truncate">{p.tracks} songs</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Now Playing */}
        {active && (
          <div className="flex-1 overflow-y-auto">
            <div className="h-[220px] relative" style={{ background: active.art }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #0a0a0f 100%)' }} />
              <div className="absolute bottom-4 left-6">
                <div className="text-[11px] uppercase tracking-wider opacity-60">{active.subtitle}</div>
                <h2 className="text-[26px] font-bold">{active.title}</h2>
              </div>
            </div>

            <div className="px-6 py-4">
              {/* Track list placeholder — generates visual tracks */}
              <div className="space-y-1">
                {[...Array(Math.min(active.tracks, 12))].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-2 py-2 rounded-[8px] hover:bg-white/4 transition-colors group"
                    style={{ background: playing && i === 0 ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                  >
                    <span className="text-[13px] w-[24px] text-center" style={{ color: '#71767b' }}>
                      {playing && i === 0 ? (
                        <span style={{ color: active.color }}>♪</span>
                      ) : i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium truncate" style={{ color: playing && i === 0 ? active.color : '#e7e9ea' }}>
                        {playing && i === 0 ? 'Now Playing' : `Track ${i + 1}`}
                      </div>
                      <div className="text-[12px] truncate" style={{ color: '#71767b' }}>{active.subtitle}</div>
                    </div>
                    <span className="text-[12px]" style={{ color: '#71767b' }}>
                      {Math.floor(2 + Math.random() * 4)}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}
                    </span>
                  </div>
                ))}
                {active.tracks > 12 && (
                  <div className="text-[12px] text-center py-2" style={{ color: '#71767b' }}>
                    + {active.tracks - 12} more tracks
                  </div>
                )}
              </div>

              {/* Open in Spotify */}
              <a
                href={active.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
                style={{ background: '#1db954', color: '#fff' }}
              >
                <SFSymbol name="arrow.up.right" size={13} color="#fff" />
                Open in Spotify
              </a>
            </div>
          </div>
        )}

        {/* Player bar */}
        {active && (
          <div className="shrink-0 h-[64px] flex items-center gap-3 px-4" style={{ background: 'rgba(20,20,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-[44px] h-[44px] rounded-[5px] shrink-0" style={{ background: active.art }} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold truncate">{active.title}</div>
              <div className="text-[11px] truncate" style={{ color: '#71767b' }}>{active.subtitle}</div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setPlaying(!playing)} className="w-[32px] h-[32px] rounded-full flex items-center justify-center" style={{ background: active.color }}>
                <SFSymbol name={playing ? 'pause.fill' : 'play.fill'} size={14} color="#000" />
              </button>
            </div>
            {/* Progress */}
            <div className="w-[120px] h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full" style={{ width: playing ? '34%' : '0%', background: active.color, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
