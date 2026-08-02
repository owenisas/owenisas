import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToolbarButton } from '../components/ui/MacControls';

const USERNAME = 'owenisas';
const GITHUB_PROFILE_URL = `https://github.com/${USERNAME}`;
const EVENTS_ENDPOINT = `https://api.github.com/users/${USERNAME}/events?per_page=100`;

const WEEKS = 53;
const DAYS = WEEKS * 7;
const CELL = 11;          // px, square cell edge
const CELL_GAP = 3;       // px gap between cells
const WEEK_W = CELL + CELL_GAP;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', 'Wed', 'Fri'];

// GitHub dark-theme contribution palette (level → colour)
const LEVEL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

// --- Demo fallback (seeded) ----------------------------------------------
function generateDemoLevels() {
  const data = new Array(DAYS).fill(0);
  let seed = 42;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let w = 0; w < WEEKS; w++) {
    const weekIntensity = 0.3 + rand() * 0.7;
    for (let d = 0; d < 7; d++) {
      const isWeekend = d >= 5;
      const r = rand();
      let c = 0;
      if (r < (isWeekend ? 0.7 : 0.3) * weekIntensity) c = 0;
      else if (r < 0.5 * weekIntensity) c = 1 + Math.floor(rand() * 2);
      else if (r < 0.75 * weekIntensity) c = 3 + Math.floor(rand() * 3);
      else if (r < 0.9 * weekIntensity) c = 6 + Math.floor(rand() * 4);
      else c = 11 + Math.floor(rand() * 4);
      data[w * 7 + d] = c;
    }
  }
  return data;
}

const DEMO_EVENTS = [
  { type: 'PushEvent', repo: 'owenisas/vellum', detail: '3 commits', created_at: new Date(Date.now() - 2 * 3600e3).toISOString() },
  { type: 'WatchEvent', repo: 'anthropics/courses', detail: '', created_at: new Date(Date.now() - 5 * 3600e3).toISOString() },
  { type: 'ForkEvent', repo: 'microsoft/WSL', detail: '', created_at: new Date(Date.now() - 26 * 3600e3).toISOString() },
  { type: 'PushEvent', repo: 'owenisas/origraph', detail: '2 commits', created_at: new Date(Date.now() - 2 * 86400e3).toISOString() },
  { type: 'CreateEvent', repo: 'owenisas/owenisas', detail: 'repository', created_at: new Date(Date.now() - 5 * 86400e3).toISOString() },
  { type: 'PullRequestEvent', repo: 'owenisas/macos', detail: 'opened', created_at: new Date(Date.now() - 7 * 86400e3).toISOString() },
];

// --- Helpers -------------------------------------------------------------??

// Map an event-count to one of 5 levels: 0 / 1-2 / 3-5 / 6-10 / 10+
function countToLevel(c) {
  if (c <= 0) return 0;
  if (c <= 2) return 1;
  if (c <= 5) return 2;
  if (c <= 10) return 3;
  return 4;
}

// Local date key YYYY-MM-DD (UTC) — GitHub events use ISO UTC timestamps.
function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

// Build a 53-week contribution grid (oldest → newest, column-major).
// `counts` is a Map<dateKey, number>. Returns { levels, keys } aligned with grid.
function buildGrid(counts) {
  const levels = new Array(DAYS).fill(0);
  const keys = new Array(DAYS).fill(null);

  // Today is the last cell. Walk backwards day-by-day so the grid ends today.
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);

  // Align: GitHub grid columns = weeks (Sun→Sat). We'll use Sun-start of week.
  // Find the Sunday of the current week.
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - end.getUTCDay()); // back to Sunday
  end.setUTCHours(0, 0, 0, 0);

  // Start = end - (WEEKS*7 - 1) days
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (DAYS - 1));

  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const k = dateKey(d);
    const c = counts.get(k) || 0;
    // GitHub stores the grid column-major: week (col) then weekday (row, Sun=0)
    const col = Math.floor(i / 7);
    const row = i % 7;
    const idx = col * 7 + row;
    levels[idx] = countToLevel(c);
    keys[idx] = { date: d, count: c, key: k };
  }
  return { levels, keys };
}

// Streaks over the counts map (chronological order).
function computeStreaks(counts) {
  // Collect dates with counts > 0 and sort ascending.
  const activeDays = Array.from(counts.entries())
    .filter(([, c]) => c > 0)
    .map(([k]) => new Date(k + 'T00:00:00Z'))
    .sort((a, b) => a - b);

  if (activeDays.length === 0) return { current: 0, longest: 0, total: 0 };

  let longest = 1;
  let cur = 1;
  for (let i = 1; i < activeDays.length; i++) {
    const prev = activeDays[i - 1];
    const now = activeDays[i];
    const diffDays = Math.round((now - prev) / 86400e3);
    if (diffDays === 1) {
      cur++;
    } else {
      longest = Math.max(longest, cur);
      cur = 1;
    }
  }
  longest = Math.max(longest, cur);

  // Current streak: count back from today (or yesterday if today is empty).
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let current = 0;
  let cursor = new Date(today);
  // Allow "today" to be empty without breaking the streak (count yesterday backward).
  if ((counts.get(dateKey(today)) || 0) === 0) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while ((counts.get(dateKey(cursor)) || 0) > 0) {
    current++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const total = Array.from(counts.values()).reduce((s, c) => s + c, 0);
  return { current, longest, total };
}

function formatRelativeTime(iso) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(day / 365)}y ago`;
}

function formatEvent(ev) {
  const repo = ev.repo?.name || 'unknown/repo';
  switch (ev.type) {
    case 'PushEvent': {
      const n = ev.payload?.commits?.length || 1;
      return { verb: 'pushed', detail: `${n} commit${n === 1 ? '' : 's'} to`, repo, icon: 'arrow.up.circle', color: '#39d353' };
    }
    case 'WatchEvent':
      return { verb: 'starred', repo, icon: 'star.fill', color: '#e3b341' };
    case 'ForkEvent':
      return { verb: 'forked', repo, icon: 'arrow.triangle.branch', color: '#58a6ff' };
    case 'CreateEvent': {
      const refType = ev.payload?.ref_type || 'repository';
      return { verb: 'created', detail: refType, repo, icon: 'plus.circle', color: '#bc8cff' };
    }
    case 'PullRequestEvent': {
      const action = ev.payload?.action || 'opened';
      return { verb: `${action} PR in`, repo, icon: 'arrow.triangle.pull', color: '#a371f7' };
    }
    case 'IssuesEvent': {
      const action = ev.payload?.action || 'opened';
      return { verb: `${action} issue in`, repo, icon: 'exclamationmark.bubble', color: '#f85149' };
    }
    case 'IssueCommentEvent':
      return { verb: 'commented on issue in', repo, icon: 'bubble.left', color: '#7d8590' };
    case 'DeleteEvent':
      return { verb: 'deleted', detail: ev.payload?.ref_type || 'ref', repo, icon: 'minus.circle', color: '#7d8590' };
    case 'PublicEvent':
      return { verb: 'made public', repo, icon: 'globe', color: '#58a6ff' };
    case 'ReleaseEvent':
      return { verb: 'released', repo, icon: 'tag.fill', color: '#39d353' };
    case 'MemberEvent':
      return { verb: 'added member to', repo, icon: 'person.crop.circle.badge.plus', color: '#7d8590' };
    case 'GollumEvent':
      return { verb: 'updated wiki in', repo, icon: 'book.fill', color: '#7d8590' };
    default:
      return { verb: ev.type?.replace(/Event$/, '').toLowerCase() || 'activity in', repo, icon: 'circle', color: '#7d8590' };
  }
}

// SFSymbol doesn't ship a flame/trophy icon; fall back to a glyph character.
function StatIcon({ name, glyph, color, size = 14 }) {
  if (name && glyph) {
    // Prefer the SF Symbol if it exists; we don't have a lookup-ready check at render
    // so we render the glyph as a styled span when provided.
    return <span style={{ color, fontSize: size, lineHeight: 1, fontWeight: 700 }}>{glyph}</span>;
  }
  return <SFSymbol name={name} size={size} color={color} />;
}

// --- Activity cell with hover popover -------------------------------------
function Cell({ entry, level, onHover }) {
  const [hover, setHover] = useState(false);
  const ref = useRef(null);
  if (!entry) {
    return <div style={{ width: CELL, height: CELL, background: LEVEL_COLORS[0], borderRadius: 2 }} />;
  }
  const { date, count } = entry;
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      ref={ref}
      style={{ width: CELL, height: CELL, background: LEVEL_COLORS[level], borderRadius: 2, position: 'relative', cursor: 'pointer' }}
      onMouseEnter={e => { setHover(true); onHover?.(e, { dateStr, count }); }}
      onMouseLeave={() => { setHover(false); onHover?.(null, null); }}
    >
      {hover && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(22,27,34,0.98)',
            border: '0.5px solid #30363d',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 10,
            color: '#e6edf3',
            whiteSpace: 'nowrap',
            zIndex: 50,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ color: '#7d8590' }}>{dateStr}</span>
          {count > 0 ? (
            <> &middot; <span style={{ color: '#39d353', fontWeight: 600 }}>{count} contribution{count === 1 ? '' : 's'}</span></>
          ) : (
            <> &middot; <span style={{ color: '#7d8590' }}>No contributions</span></>
          )}
        </div>
      )}
    </div>
  );
}

// --- Main component -------------------------------------------------------
export default function ActivityGraph() {
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [counts, setCounts] = useState(new Map());
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(EVENTS_ENDPOINT, {
        headers: { 'Accept': 'application/vnd.github+json' },
      });
      if (!res.ok) {
        throw new Error(`GitHub API ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No events returned');
      }

      // Count events per day, weighted by payload size where available
      const c = new Map();
      for (const ev of data) {
        const day = (ev.created_at || '').slice(0, 10);
        if (!day) continue;
        let weight = 1;
        if (ev.type === 'PushEvent') {
          weight = ev.payload?.commits?.length || 1;
        }
        c.set(day, (c.get(day) || 0) + weight);
      }

      setCounts(c);
      setEvents(data.slice(0, 15));
      setLive(true);
    } catch (e) {
      // Fallback to demo data
      const demoCounts = new Map();
      const demoLevels = generateDemoLevels();
      // demoLevels is column-major like our grid; map to dates for streak math
      const end = new Date();
      end.setUTCHours(0, 0, 0, 0);
      end.setUTCDate(end.getUTCDate() - end.getUTCDay());
      const start = new Date(end);
      start.setUTCDate(start.getUTCDate() - (DAYS - 1));
      for (let i = 0; i < DAYS; i++) {
        const col = Math.floor(i / 7);
        const row = i % 7;
        const idx = col * 7 + row;
        const v = demoLevels[idx] || 0;
        if (v > 0) {
          const d = new Date(start);
          d.setUTCDate(start.getUTCDate() + i);
          demoCounts.set(dateKey(d), v);
        }
      }
      setCounts(demoCounts);
      setEvents(DEMO_EVENTS);
      setLive(false);
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const grid = useMemo(() => buildGrid(counts), [counts]);
  const streaks = useMemo(() => computeStreaks(counts), [counts]);

  // Month label positions: which week-column starts a new month.
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      // First day (Sunday) of this week column.
      const idx = w * 7; // row 0 = Sunday
      const entry = grid.keys[idx];
      if (!entry) continue;
      const m = entry.date.getUTCMonth();
      if (m !== lastMonth) {
        labels.push({ col: w, month: MONTHS[m] });
        lastMonth = m;
      }
    }
    return labels;
  }, [grid]);

  const [popover, setPopover] = useState(null); // { x, y, text }

  const handleHover = useCallback((e, info) => {
    if (!e || !info) { setPopover(null); return; }
    setPopover(info);
  }, []);

  return (
    <div className="h-full w-full flex flex-col" style={{ background: '#0d1117', color: '#e6edf3' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 h-[40px] px-3 shrink-0"
        style={{ background: 'rgba(22,27,34,0.96)', borderBottom: '0.5px solid #30363d' }}
      >
        <div className="flex items-center gap-1.5">
          <SFSymbol name="star.fill" size={13} color="#39d353" />
          <span className="text-[13px] font-semibold tracking-tight">GitHub Activity</span>
          <span style={{ color: '#7d8590' }} className="text-[12px] ml-0.5">@{USERNAME}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div
            className="flex items-center gap-1 text-[10.5px] px-2 py-[3px] rounded-full"
            style={{
              background: live ? 'rgba(57,211,83,0.10)' : 'rgba(125,133,144,0.10)',
              border: `0.5px solid ${live ? 'rgba(57,211,83,0.30)' : 'rgba(125,133,144,0.25)'}`,
              color: live ? '#39d353' : '#7d8590',
            }}
            title={error ? `Fallback: ${error}` : (live ? 'Live data from GitHub API' : 'Static demo data')}
          >
            <span
              style={{
                width: 5, height: 5, borderRadius: '50%',
                background: live ? '#39d353' : '#7d8590',
                boxShadow: live ? '0 0 4px #39d353' : 'none',
              }}
            />
            {live ? 'Live from GitHub API' : 'Demo data'}
          </div>
          <MacToolbarButton icon="arrow.clockwise" size={24} label="Refresh" onClick={fetchData} active={refreshing} />
          <MacToolbarButton
            icon="arrow.up.right.square"
            size={24}
            label="View on GitHub"
            onClick={() => window.open(GITHUB_PROFILE_URL, '_blank', 'noopener,noreferrer')}
          />
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[780px] mx-auto px-5 py-4">
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <StatCard
              glyph="✦"
              glyphColor="#39d353"
              label="Contributions"
              value={loading ? '—' : streaks.total.toLocaleString()}
              sub="past year"
            />
            <StatCard
              glyph="🔥"
              glyphColor="#f85149"
              label="Current Streak"
              value={loading ? '—' : `${streaks.current} days`}
              sub={streaks.current > 0 ? 'keep it going' : 'start today'}
            />
            <StatCard
              glyph="🏆"
              glyphColor="#e3b341"
              label="Longest Streak"
              value={loading ? '—' : `${streaks.longest} days`}
              sub="personal best"
            />
          </div>

          {/* Contribution graph */}
          <div className="rounded-[10px] p-4" style={{ background: '#161b22', border: '1px solid #30363d' }}>
            <div style={{ overflowX: 'auto', paddingBottom: 2 }}>
              <div style={{ minWidth: WEEKS * WEEK_W + 30 }}>
                {/* Month labels */}
                <div style={{ position: 'relative', height: 14, marginLeft: 30, marginBottom: 4 }}>
                  {monthLabels.map(({ col, month }) => (
                    <span
                      key={col}
                      style={{
                        position: 'absolute',
                        left: col * WEEK_W,
                        fontSize: 10,
                        color: '#7d8590',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {month}
                    </span>
                  ))}
                </div>

                <div className="flex" style={{ gap: CELL_GAP }}>
                  {/* Day labels */}
                  <div
                    className="flex flex-col shrink-0"
                    style={{ width: 22, height: 7 * (CELL + 2), justifyContent: 'space-between', paddingTop: 0 }}
                  >
                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                      <span key={i} style={{ fontSize: 9, color: '#7d8590', lineHeight: `${CELL}px`, height: CELL, textAlign: 'right' }}>
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Grid columns (weeks) */}
                  <div className="flex" style={{ gap: CELL_GAP }}>
                    {Array.from({ length: WEEKS }, (_, w) => (
                      <div key={w} className="flex flex-col" style={{ gap: 2 }}>
                        {Array.from({ length: 7 }, (_, d) => {
                          const idx = w * 7 + d;
                          return (
                            <Cell
                              key={idx}
                              entry={grid.keys[idx]}
                              level={grid.levels[idx]}
                              onHover={handleHover}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
              <span style={{ fontSize: 10, color: '#7d8590' }}>Less</span>
              {LEVEL_COLORS.map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />
              ))}
              <span style={{ fontSize: 10, color: '#7d8590' }}>More</span>
            </div>
          </div>

          {/* Recent activity feed */}
          <div className="mt-4 rounded-[10px] p-4" style={{ background: '#161b22', border: '1px solid #30363d' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold" style={{ color: '#e6edf3' }}>Recent Activity</h3>
              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] flex items-center gap-1 transition-colors"
                style={{ color: '#58a6ff', textDecoration: 'none' }}
              >
                View on GitHub
                <SFSymbol name="arrow.up.right" size={11} color="#58a6ff" />
              </a>
            </div>

            {loading ? (
              <div className="py-6 text-center text-[12px]" style={{ color: '#7d8590' }}>Loading activity…</div>
            ) : events.length === 0 ? (
              <div className="py-6 text-center text-[12px]" style={{ color: '#7d8590' }}>No public activity found.</div>
            ) : (
              <div className="space-y-2">
                {events.map((ev, i) => {
                  const f = formatEvent(ev);
                  return (
                    <div key={i} className="flex items-center gap-2.5 text-[13px]" style={{ lineHeight: 1.3 }}>
                      <span
                        style={{
                          width: 7, height: 7, borderRadius: '50%', background: f.color,
                          flexShrink: 0, boxShadow: `0 0 3px ${f.color}40`,
                        }}
                      />
                      <span style={{ color: '#e6edf3' }} className="truncate">
                        {f.verb}{' '}
                        {f.detail ? <span style={{ color: '#7d8590' }}>{f.detail} </span> : null}
                        <span style={{ color: f.color }}>{f.repo}</span>
                      </span>
                      <span className="ml-auto shrink-0" style={{ color: '#7d8590', fontSize: 11 }}>
                        {formatRelativeTime(ev.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ glyph, glyphColor, label, value, sub }) {
  return (
    <div
      className="rounded-[10px] p-3 flex flex-col"
      style={{ background: '#161b22', border: '1px solid #30363d' }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ fontSize: 12, color: glyphColor, lineHeight: 1 }}>{glyph}</span>
        <span style={{ fontSize: 11, color: '#7d8590' }}>{label}</span>
      </div>
      <div className="text-[22px] font-bold leading-tight" style={{ color: glyphColor }}>{value}</div>
      <div style={{ fontSize: 10.5, color: '#7d8590', marginTop: 1 }}>{sub}</div>
    </div>
  );
}
