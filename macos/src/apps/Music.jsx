import { useEffect, useState, useMemo } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToolbarButton, MacSidebarItem, MacSidebarSection, MacSlider } from '../components/ui/MacControls';

// Deterministic pseudo-random so the same playlist always shows the same tracks
function seeded(rng) {
  // simple LCG
  let s = rng | 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

// Theme-aware fake track generator — feels real, not "Track 1"
const TRACK_BANKS = {
  lofi: {
    titles: ['rainy window', 'soft static', '3am study', 'tape hiss', 'slow drip', 'velvet clouds', 'memory loop', 'dusty keys', 'mellow dusk', 'paper moon', 'muted chord', 'drifting', 'afterglow', 'cassette diary', 'low tide', 'warm static', 'snowfall', 'quiet hours', 'soft focus', 'amber light', 'still water', 'slow breath', 'night bus', 'pavement', 'faded film', 'half asleep', 'gentle rain', 'barefoot', 'hold on', 'soft landing', 'paper crane', 'morning haze', 'slow burn', 'quiet city', 'lamplight', 'soft rain', 'low frequency', 'long way home', 'pasta water', 'quiet apartment'],
    artists: ['kaiyah', 'noev', 'mira leve', 'asahi', ' Subcommittee', 'lowfi.sora', 'june mild', 'ren hazel', ' stillwaves', 'ko.yu', 'MELLOWBLOOM', 'half.cafe', 'LATE AVENUE', 'sofa club', 'paper tiger'],
    albums: ['slow burn', 'paper moons', 'after hours', 'tape memory', 'rainy window', 'homework', 'soft launch'],
  },
  dnb: {
    titles: ['NEON SPLINT', 'shatter', 'velocity', 'Renegade', 'obsidian', 'liquid chrome', 'pureshock', 'velocity rush', 'amethyst', 'clear-cut', 'HOTH', 'diamond dust', 'razorline', 'ruin', 'dopamine', 'overdrive', 'shockwave', 'spindrift', 'AFTERBURN', 'mulch', 'tessellate', 'horizon line', 'ruby sky', 'low orbit', 'split second', 'CIRCUIT BREAKER', 'rapture', 'cracks', 'ultraviolet', 'smash', 'binary star', 'cascade', 'final form', 'tunnel vision', 'adrenal', 'ECHOLOCATE', 'surge', 'rift', 'overclock'],
    artists: ['NUERA', 'SABLE', 'Artful Dodges', 'Machinedrum', ' motile.', 'CALYX', 'Kyrist', 'V87', 'OVER/SEER', 'L.A.�', 'CALIBRE', 'Implex Grace', ' Note.', 'Burial proceedings'],
    albums: ['NEON SPLINT', 'obsidian', 'velocity', 'asphalt', 'low orbit', 'clear-cut', 'palace of typewriters'],
  },
  interstellar: {
    titles: ['First Step', 'Cornfield Chase', 'Detachment', 'Stay', 'Mountains', 'Message from Home', 'No Time for Caution', 'Wormhole', 'Mountains (Extended)', 'Where We Are Going', 'Coward', 'S.U.R.V.', 'Atmosphere Entry', 'Place on a Planet', 'Running Dry'],
    artists: ['Hans Zimmer'],
    albums: ['Interstellar: OST'],
  },
  anime: {
    titles: ['CRAWLING BACK', 'shelter', 'idemo', 'maboroshi', 'IGNITE', 'kotoba', 'kaze', 'tasogare', 'blue spark', 'asphalt sky', 'fly high', 'SHINZO', 'SORE WA', 'sailing day', 'unravel', 'zenbon', 'REMEMBER ME', 'hibiki', 'CRIMSON BLADE', 'sasayaki', 'hikari', 'asayake', 'river crossing', 'edge of the world', 'BURNING BRIGHT', 'tomoshibi', 'ironclad', 'rampant', 'sengoku', 'ZERO HOUR', 'tsuyosa', 'meteor', 'lone traveler', 'kubitsure', 'mainline'],
    artists: ['KIITE', 'YOASOBI', 'LiSA', 'aimer', 'codeine white', ' Hydrogen.', 'KANA-BOON.', 'BLUE ENCOUNT', 'ringo sheena', 'SCANDALL'],
    albums: ['shelter', 'blue spark', 'asphalt sky', 'edge of the world', 'ignition', 'CRIMSON BLADE'],
  },
};

function pick(repo, i) {
  return repo[i % repo.length];
}

function buildTracks(playlist) {
  const bank = TRACK_BANKS[playlist.id] || TRACK_BANKS.lofi;
  const rand = seeded(playlist.id.split('').reduce((a, c) => a + c.charCodeAt(0), 17));
  const count = Math.min(playlist.tracks, 16);
  const tracks = [];
  for (let i = 0; i < count; i++) {
    const t = pick(bank.titles, i);
    const a = pick(bank.artists, i);
    const al = pick(bank.albums, i);
    // durations 2:40 – 5:20
    const totalSec = 160 + Math.floor(rand() * 200);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    // cumulative start offsets for the seek bar feel
    tracks.push({
      idx: i + 1,
      title: t,
      artist: a,
      album: al,
      duration: `${m}:${String(s).padStart(2, '0')}`,
      totalSec,
    });
  }
  return tracks;
}

// Animated equalizer bars (3-4 small bars that pulse)
function Equalizer({ color = '#fc3c44', playing = true }) {
  return (
    <div className="flex items-end gap-[2px] h-[12px]" aria-hidden>
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          style={{
            width: 2.5,
            height: playing ? `${6 + ((i * 7) % 9)}px` : 3,
            background: color,
            borderRadius: 1,
            display: 'inline-block',
            transformOrigin: 'bottom',
            animation: playing ? `music-eq-${i} 0.85s ease-in-out ${(i * 0.13).toFixed(2)}s infinite alternate` : 'none',
            opacity: playing ? 1 : 0.35,
          }}
        />
      ))}
      <style>{`
        @keyframes music-eq-0 {  0% { height: 4px; } 100% { height: 11px; } }
        @keyframes music-eq-1 {  0% { height: 11px; } 100% { height: 5px; } }
        @keyframes music-eq-2 {  0% { height: 6px; } 100% { height: 12px; } }
        @keyframes music-eq-3 {  0% { height: 9px; } 100% { height: 4px; } }
      `}</style>
    </div>
  );
}

// Track row — Apple Music list view
function TrackRow({ track, nowPlaying, playing, accent, onPlay }) {
  return (
    <div
      onClick={onPlay}
      className="group flex items-center gap-3 px-3 py-[7px] rounded-[6px] cursor-default transition-colors"
      style={{
        background: nowPlaying ? 'rgba(255,255,255,0.07)' : 'transparent',
      }}
      onMouseEnter={e => { if (!nowPlaying) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!nowPlaying) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Track number / now-playing indicator */}
      <div className="w-[22px] shrink-0 flex items-center justify-center">
        {nowPlaying ? (
          <Equalizer color={accent} playing={playing} />
        ) : (
          <>
            <span className="text-[12px] tabular-nums group-hover:hidden" style={{ color: 'rgba(235,235,245,0.45)' }}>{track.idx}</span>
            <SFSymbol name="play.fill" size={11} color="rgba(235,235,245,0.85)" className="hidden group-hover:block" />
          </>
        )}
      </div>
      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate" style={{ color: nowPlaying ? accent : '#ebf0f5' }}>
          {track.title}
        </div>
        <div className="text-[12px] truncate" style={{ color: 'rgba(235,235,245,0.5)' }}>{track.artist}</div>
      </div>
      {/* Album */}
      <div className="hidden md:block w-[160px] truncate text-[12px]" style={{ color: 'rgba(235,235,245,0.5)' }}>
        {track.album}
      </div>
      {/* Duration */}
      <div className="text-[12px] tabular-nums shrink-0" style={{ color: 'rgba(235,235,245,0.45)' }}>
        {track.duration}
      </div>
    </div>
  );
}

export default function Music() {
  const [playlists, setPlaylists] = useState([]);
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0); // seconds
  const [volume, setVolume] = useState(65);
  const [view, setView] = useState('playlist'); // playlist | all | artist | album

  useEffect(() => {
    fetch('/data/music.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setPlaylists(d); if (d.length) setActive(d[0]); })
      .catch(() => setPlaylists([]));
  }, []);

  const tracks = useMemo(() => active ? buildTracks(active) : [], [active]);
  const current = tracks[currentIdx] || null;
  const totalSec = current ? current.totalSec : 0;

  // simulate playback progress
  useEffect(() => {
    if (!playing || !active) return;
    const id = setInterval(() => {
      setProgress(p => {
        if (p + 1 >= totalSec) {
          // advance track
          setCurrentIdx(i => (i + 1) % tracks.length);
          return 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, active, totalSec, tracks.length]);

  // reset progress when switching playlist or track
  useEffect(() => { setProgress(0); }, [active, currentIdx]);

  const selectPlaylist = (p) => {
    setActive(p);
    setCurrentIdx(0);
    setProgress(0);
    setView('playlist');
  };

  const playTrack = (i) => {
    setCurrentIdx(i);
    setProgress(0);
    setPlaying(true);
  };

  const fmt = (s) => {
    if (!s || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const accent = active?.color || '#fc3c44';
  const bg = '#1c1c1e';
  const sidebarBg = 'rgba(38,38,40,0.92)';

  return (
    <div className="h-full w-full flex flex-col" style={{ background: bg, color: '#ebf0f5' }}>
      {/* Top toolbar — macOS style playback controls */}
      <div
        className="h-[44px] shrink-0 flex items-center gap-1 px-3 DragHandle"
        style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)', background: 'rgba(28,28,30,0.78)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        {/* Traffic-light space already provided by Window; playback controls here */}
        <div className="flex items-center gap-1">
          <MacToolbarButton
            icon="backward.fill"
            size={28}
            label="Back"
            onClick={() => { if (active) { setCurrentIdx(i => (i - 1 + tracks.length) % tracks.length); setProgress(0); } }}
          />
          <MacToolbarButton
            icon={playing ? 'pause.fill' : 'play.fill'}
            size={28}
            label={playing ? 'Pause' : 'Play'}
            active={playing}
            onClick={() => active && setPlaying(p => !p)}
          />
          <MacToolbarButton
            icon="forward.fill"
            size={28}
            label="Forward"
            onClick={() => { if (active) { setCurrentIdx(i => (i + 1) % tracks.length); setProgress(0); } }}
          />
        </div>
        <div className="w-px h-[18px] mx-1.5" style={{ background: 'rgba(255,255,255,0.1)' }} />
        {/* Now playing in toolbar */}
        {current && (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Equalizer color={accent} playing={playing} />
            <span className="text-[12px] font-medium truncate" style={{ color: '#ebf0f5' }}>{current.title}</span>
            <span className="text-[12px] truncate" style={{ color: 'rgba(235,235,245,0.4)' }}>— {current.artist}</span>
          </div>
        )}
        {!current && (
          <div className="flex-1 text-[12px] truncate" style={{ color: 'rgba(235,235,245,0.4)' }}>
            {active ? active.title : 'Music'}
          </div>
        )}
        <div className="flex-1" />
        <MacToolbarButton icon="magnifyingglass" size={28} label="Search" />
        <MacToolbarButton icon="list.bullet" size={28} label="Queue" />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div
          className="w-[200px] shrink-0 flex flex-col py-2 overflow-y-auto"
          style={{ background: sidebarBg, borderRight: '0.5px solid rgba(255,255,255,0.06)' }}
        >
          <MacSidebarSection title="Library">
            <MacSidebarItem
              icon="music.note.house"
              label="Home"
              selected={view === 'playlist'}
              onClick={() => setView('playlist')}
            />
            <MacSidebarItem
              icon="music.note.list"
              label="All Songs"
              selected={view === 'all'}
              onClick={() => setView('all')}
            />
            <MacSidebarItem
              icon="music.mic"
              label="Artists"
              selected={view === 'artist'}
              onClick={() => setView('artist')}
            />
            <MacSidebarItem
              icon="square.stack"
              label="Albums"
              selected={view === 'album'}
              onClick={() => setView('album')}
            />
          </MacSidebarSection>

          <MacSidebarSection title="Playlists">
            {playlists.map(p => (
              <MacSidebarItem
                key={p.id}
                icon={
                  <div
                    className="shrink-0"
                    style={{ width: 15, height: 15, borderRadius: 3, background: p.art, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)' }}
                  />
                }
                label={p.title}
                selected={active?.id === p.id && view === 'playlist'}
                onClick={() => selectPlaylist(p)}
                badge={p.tracks}
              />
            ))}
          </MacSidebarSection>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {active && (
            <div className="flex-1 overflow-y-auto">
              {/* Playlist header — gradient + glass blur */}
              <div className="relative" style={{ height: 220 }}>
                <div className="absolute inset-0" style={{ background: active.art }} />
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to bottom, rgba(28,28,30,0.0) 0%, rgba(28,28,30,0.35) 55%, #1c1c1e 100%)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                }} />
                {/* Cover + title */}
                <div className="absolute bottom-5 left-6 right-6 flex items-end gap-4">
                  <div
                    className="shrink-0 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                    style={{ width: 108, height: 108, borderRadius: 10, background: active.art, boxShadow: '0 20px 50px rgba(0,0,0,0.55), inset 0 0 0 0.5px rgba(255,255,255,0.12)' }}
                  />
                  <div className="min-w-0 pb-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(235,235,245,0.7)' }}>Playlist</div>
                    <h2 className="text-[28px] font-bold leading-tight" style={{ color: '#fff' }}>{active.title}</h2>
                    <div className="text-[13px] mt-1" style={{ color: 'rgba(235,235,245,0.7)' }}>{active.subtitle}</div>
                    <div className="text-[12px] mt-2" style={{ color: 'rgba(235,235,245,0.5)' }}>
                      {active.tracks} songs · ~2 hr 14 min · Apple Music
                    </div>
                  </div>
                </div>
              </div>

              {/* Action row — toolbar inside the content */}
              <div className="px-6 py-4 flex items-center gap-3">
                <button
                  onClick={() => active && setPlaying(p => !p)}
                  className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95"
                  style={{ background: accent, boxShadow: `0 4px 16px ${accent}55` }}
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  <SFSymbol name={playing ? 'pause.fill' : 'play.fill'} size={16} color="#fff" />
                </button>
                <MacToolbarButton icon="shuffle" size={28} label="Shuffle" />
                <MacToolbarButton icon="repeat" size={28} label="Repeat" />
                <div className="flex-1" />
                {/* Open in Spotify — secondary button */}
                <a
                  href={active.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 h-[26px] rounded-[7px] text-[12px] font-medium transition-colors"
                  style={{
                    color: 'rgba(235,235,245,0.85)',
                    background: 'rgba(255,255,255,0.08)',
                    border: '0.5px solid rgba(255,255,255,0.12)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                >
                  <SFSymbol name="arrow.up.right" size={11} color="rgba(235,235,245,0.85)" />
                  Open in Spotify
                </a>
              </div>

              {/* Column headers */}
              <div className="px-6 pb-1">
                <div className="flex items-center gap-3 px-3 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="w-[22px] text-center text-[11px] uppercase tracking-wider" style={{ color: 'rgba(235,235,245,0.4)' }}>#</div>
                  <div className="flex-1 text-[11px] uppercase tracking-wider" style={{ color: 'rgba(235,235,245,0.4)' }}>Title</div>
                  <div className="hidden md:block w-[160px] text-[11px] uppercase tracking-wider" style={{ color: 'rgba(235,235,245,0.4)' }}>Album</div>
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(235,235,245,0.4)' }}>
                    <SFSymbol name="clock" size={11} color="rgba(235,235,245,0.4)" />
                  </div>
                </div>

                {/* Track list */}
                <div className="pt-1">
                  {tracks.map((t, i) => (
                    <TrackRow
                      key={i}
                      track={t}
                      nowPlaying={i === currentIdx}
                      playing={playing}
                      accent={accent}
                      onPlay={() => playTrack(i)}
                    />
                  ))}
                  {active.tracks > tracks.length && (
                    <div className="text-[12px] text-center py-3" style={{ color: 'rgba(235,235,245,0.35)' }}>
                      + {active.tracks - tracks.length} more songs
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Player bar — full macOS Music player bar */}
      <div
        className="shrink-0 h-[64px] flex items-center gap-3 px-4 relative"
        style={{
          background: 'rgba(40,40,42,0.62)',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        }}
      >
        {/* Album art thumbnail + info */}
        <div className="flex items-center gap-3 w-[210px] shrink-0 min-w-0">
          {active && (
            <>
              <div className="shrink-0" style={{ width: 42, height: 42, borderRadius: 4, background: active.art, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.12)' }} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold truncate" style={{ color: '#ebf0f5' }}>{current ? current.title : active.title}</div>
                <div className="text-[11px] truncate" style={{ color: 'rgba(235,235,245,0.5)' }}>{current ? current.artist : active.subtitle}</div>
              </div>
            </>
          )}
        </div>

        {/* Center: transport + seek bar */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          <div className="flex items-center gap-3 mb-[3px]">
            <button
              onClick={() => active && setPlaying(p => !p)}
              className="flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ width: 26, height: 26 }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              <SFSymbol name={playing ? 'pause.fill' : 'play.fill'} size={18} color="#ebf0f5" />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-[420px]">
            <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'rgba(235,235,245,0.5)' }}>{fmt(progress)}</span>
            <input
              aria-label="Playback position"
              type="range"
              min="0"
              max={totalSec || 1}
              value={Math.min(progress, totalSec || 1)}
              onChange={e => setProgress(Number(e.target.value))}
              className="flex-1 accent-[#fc3c44]"
            />
            <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'rgba(235,235,245,0.5)' }}>{fmt(totalSec)}</span>
          </div>
        </div>

        {/* Right: volume + AirPlay */}
        <div className="flex items-center gap-2 shrink-0">
          <SFSymbol name="speaker.wave.2.fill" size={13} color="rgba(235,235,245,0.55)" />
          <div className="w-[72px]"><MacSlider value={volume} onChange={setVolume} accentColor={accent} /></div>
          <MacToolbarButton icon="airplayaudio" size={24} label="AirPlay" />
          <MacToolbarButton icon="list.bullet.indent" size={24} label="Queue" />
        </div>
      </div>
    </div>
  );
}
