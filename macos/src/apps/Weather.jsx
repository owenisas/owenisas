import { useEffect, useMemo, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';

const locations = [
  { id: 'seattle', name: 'Seattle', region: 'Washington', lat: 47.6062, lon: -122.3321, tz: 'America/Los_Angeles' },
  { id: 'bothell', name: 'Bothell', region: 'Washington', lat: 47.7623, lon: -122.2054, tz: 'America/Los_Angeles' },
  { id: 'hongkong', name: 'Hong Kong', region: 'Hong Kong SAR', lat: 22.3193, lon: 114.1694, tz: 'Asia/Hong_Kong' },
];

// WMO weather code → human label + icon + atmosphere
const WMO = {
  0:  { label: 'Clear',           icon: 'sun.max.fill',       mood: 'clear' },
  1:  { label: 'Mainly Clear',    icon: 'sun.max.fill',       mood: 'clear' },
  2:  { label: 'Partly Cloudy',   icon: 'cloud.sun.fill',     mood: 'cloudy' },
  3:  { label: 'Overcast',        icon: 'cloud.fill',         mood: 'cloudy' },
  45: { label: 'Fog',             icon: 'cloud.fill',         mood: 'cloudy' },
  48: { label: 'Rime Fog',        icon: 'cloud.fill',         mood: 'cloudy' },
  51: { label: 'Light Drizzle',   icon: 'cloud.drizzle.fill', mood: 'rain' },
  53: { label: 'Drizzle',         icon: 'cloud.drizzle.fill', mood: 'rain' },
  55: { label: 'Heavy Drizzle',   icon: 'cloud.drizzle.fill', mood: 'rain' },
  56: { label: 'Freezing Drizzle',icon: 'cloud.drizzle.fill', mood: 'rain' },
  57: { label: 'Freezing Drizzle',icon: 'cloud.drizzle.fill', mood: 'rain' },
  61: { label: 'Light Rain',      icon: 'cloud.rain.fill',    mood: 'rain' },
  63: { label: 'Rain',            icon: 'cloud.rain.fill',    mood: 'rain' },
  65: { label: 'Heavy Rain',      icon: 'cloud.rain.fill',    mood: 'rain' },
  66: { label: 'Freezing Rain',   icon: 'cloud.rain.fill',    mood: 'rain' },
  67: { label: 'Freezing Rain',   icon: 'cloud.rain.fill',    mood: 'rain' },
  71: { label: 'Light Snow',      icon: 'cloud.snow.fill',    mood: 'cloudy' },
  73: { label: 'Snow',            icon: 'cloud.snow.fill',    mood: 'cloudy' },
  75: { label: 'Heavy Snow',      icon: 'cloud.snow.fill',    mood: 'cloudy' },
  77: { label: 'Snow Grains',     icon: 'cloud.snow.fill',    mood: 'cloudy' },
  80: { label: 'Rain Showers',    icon: 'cloud.rain.fill',    mood: 'rain' },
  81: { label: 'Rain Showers',    icon: 'cloud.rain.fill',    mood: 'rain' },
  82: { label: 'Heavy Showers',   icon: 'cloud.rain.fill',    mood: 'rain' },
  85: { label: 'Snow Showers',    icon: 'cloud.snow.fill',    mood: 'cloudy' },
  86: { label: 'Snow Showers',    icon: 'cloud.snow.fill',    mood: 'cloudy' },
  95: { label: 'Thunderstorm',    icon: 'cloud.rain.fill',    mood: 'rain' },
  96: { label: 'Thunderstorm',    icon: 'cloud.rain.fill',    mood: 'rain' },
  99: { label: 'Thunderstorm',    icon: 'cloud.rain.fill',    mood: 'rain' },
};
const wmoInfo = (code) => WMO[code] ?? { label: '—', icon: 'cloud.fill', mood: 'cloudy' };

const moodBg = {
  clear:  'linear-gradient(180deg, #3F92D2 0%, #5BB0E8 45%, #7CC5E8 100%)',
  cloudy: 'linear-gradient(180deg, #416B95 0%, #5D8AB7 50%, #789FC7 100%)',
  rain:   'linear-gradient(180deg, #2C4356 0%, #4A6A85 60%, #6B89A3 100%)',
  night:  'linear-gradient(180deg, #0E1A33 0%, #1B2C4E 60%, #2D4166 100%)',
};

const iconColor = {
  'sun.max.fill': '#FFD54A',
  'moon.stars.fill': '#C9D4E8',
  'cloud.sun.fill': '#E6E9EE',
  'cloud.fill': '#D4D8E0',
  'cloud.rain.fill': '#BFC6D1',
  'cloud.drizzle.fill': '#BFC6D1',
  'cloud.snow.fill': '#E6EBF2',
};

function WxIcon({ name, size = 20 }) {
  return <SFSymbol name={name} size={size} color={iconColor[name] || '#E6E9EE'} />;
}

function formatTimeForZone(tz) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date());
  } catch { return ''; }
}

function formatHour(iso, tz) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric' }).format(new Date(iso)).replace(' ', '');
  } catch { return iso; }
}

function formatDay(iso, tz, idx) {
  if (idx === 0) return 'Today';
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(new Date(iso + 'T12:00:00'));
  } catch { return iso; }
}

function formatClock(iso, tz) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  } catch { return ''; }
}

async function fetchWeather(loc) {
  const params = new URLSearchParams({
    latitude: String(loc.lat),
    longitude: String(loc.lon),
    current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,apparent_temperature,is_day',
    hourly: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
    timezone: loc.tz,
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    forecast_days: '10',
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function useWeather() {
  const [byId, setById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(locations.map(async l => [l.id, await fetchWeather(l)]));
        if (!cancelled) {
          setById(Object.fromEntries(results));
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) { setError(e.message); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { byId, loading, error };
}

function compassFromDeg(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function LocationCard({ loc, data, selected, onClick }) {
  const current = data?.current;
  const daily = data?.daily;
  const wc = current ? wmoInfo(current.weather_code) : null;
  const time = formatTimeForZone(loc.tz);

  return (
    <button
      onClick={onClick}
      className="w-full rounded-[14px] p-3 cursor-default transition-colors text-left"
      style={{
        background: selected ? 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))' : 'rgba(255,255,255,0.04)',
        border: selected ? '0.5px solid rgba(255,255,255,0.24)' : '0.5px solid rgba(255,255,255,0.06)',
        boxShadow: selected ? 'inset 0 0.5px 0 rgba(255,255,255,0.18)' : 'none',
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-white/75 font-semibold tracking-tight truncate">{loc.region}</div>
          <div className="text-[18px] font-semibold text-white leading-tight truncate">{loc.name}</div>
          <div className="text-[11px] text-white/65 mt-0.5 tabular-nums">{time}</div>
        </div>
        <div className="text-[44px] font-extralight text-white leading-none tracking-tighter tabular-nums">
          {current ? Math.round(current.temperature_2m) : '–'}°
        </div>
      </div>
      <div className="flex items-end justify-between mt-3">
        <div className="text-[12px] text-white/90 font-medium truncate">{wc?.label || 'Loading…'}</div>
        <div className="text-[12px] text-white/80 tabular-nums">
          {daily ? <>H:{Math.round(daily.temperature_2m_max[0])}° L:{Math.round(daily.temperature_2m_min[0])}°</> : ''}
        </div>
      </div>
    </button>
  );
}

function HourlyStrip({ data, tz }) {
  if (!data) return null;
  const now = new Date();
  const times = data.hourly.time;
  // Find index of the current hour to start from
  const startIdx = Math.max(0, times.findIndex(t => new Date(t) >= new Date(now.getTime() - 30 * 60 * 1000)));
  const slice = times.slice(startIdx, startIdx + 24);
  const temps = data.hourly.temperature_2m.slice(startIdx, startIdx + 24);
  const codes = data.hourly.weather_code.slice(startIdx, startIdx + 24);

  return (
    <div className="rounded-[16px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)', border: '0.5px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
      <div className="px-4 pt-3 pb-2 text-[11px] text-white/85 font-semibold uppercase tracking-[0.06em] flex items-center gap-1.5">
        <SFSymbol name="clock" size={12} color="rgba(255,255,255,0.85)" />
        <span>Hourly Forecast</span>
      </div>
      <div className="h-px mx-4" style={{ background: 'rgba(255,255,255,0.15)' }} />
      <div className="flex overflow-x-auto gap-2 px-3 py-3" style={{ scrollbarWidth: 'none' }}>
        {slice.map((t, i) => (
          <div key={t} className="flex flex-col items-center gap-1.5 shrink-0 min-w-[46px]">
            <span className="text-[12px] text-white/90 font-semibold">{i === 0 ? 'Now' : formatHour(t, tz)}</span>
            <WxIcon name={wmoInfo(codes[i]).icon} size={22} />
            <span className="text-[14px] text-white font-medium tabular-nums">{Math.round(temps[i])}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyCard({ data, tz }) {
  if (!data) return null;
  const days = data.daily.time;
  const highs = data.daily.temperature_2m_max;
  const lows = data.daily.temperature_2m_min;
  const codes = data.daily.weather_code;
  const todayNow = Math.round(data.current.temperature_2m);

  const weekMin = Math.min(...lows);
  const weekMax = Math.max(...highs);
  const span = Math.max(1, weekMax - weekMin);

  return (
    <div className="rounded-[16px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)', border: '0.5px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
      <div className="px-4 pt-3 pb-2 text-[11px] text-white/85 font-semibold uppercase tracking-[0.06em] flex items-center gap-1.5">
        <SFSymbol name="calendar" size={12} color="rgba(255,255,255,0.85)" />
        <span>{days.length}-Day Forecast</span>
      </div>
      <div className="h-px mx-4" style={{ background: 'rgba(255,255,255,0.15)' }} />
      <div className="px-4 py-1">
        {days.map((d, i) => {
          const lo = Math.round(lows[i]);
          const hi = Math.round(highs[i]);
          const leftPct = ((lo - weekMin) / span) * 100;
          const rightPct = 100 - ((hi - weekMin) / span) * 100;
          const label = formatDay(d, tz, i);
          return (
            <div
              key={d}
              className="flex items-center gap-3 text-[14px] py-2.5"
              style={{ borderBottom: i < days.length - 1 ? '0.5px solid rgba(255,255,255,0.12)' : 'none' }}
            >
              <span className="w-10 font-semibold text-white/95">{label}</span>
              <div className="w-[28px] flex justify-center">
                <WxIcon name={wmoInfo(codes[i]).icon} size={20} />
              </div>
              <span className="w-8 text-right font-medium text-white/60 tabular-nums">{lo}°</span>
              <div className="flex-1 h-[5px] rounded-full relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div
                  className="absolute top-0 bottom-0 rounded-full"
                  style={{
                    left: `${leftPct}%`,
                    right: `${rightPct}%`,
                    background: 'linear-gradient(90deg, #7FD3F5 0%, #FFD37A 60%, #FFA664 100%)',
                  }}
                />
                {i === 0 && todayNow >= lo && todayNow <= hi && (
                  <div
                    className="absolute w-[7px] h-[7px] rounded-full bg-white"
                    style={{
                      left: `calc(${((todayNow - weekMin) / span) * 100}% - 3.5px)`,
                      top: '-1px',
                      boxShadow: '0 0 0 1.5px rgba(0,0,0,0.15)',
                    }}
                  />
                )}
              </div>
              <span className="w-8 text-right font-medium text-white tabular-nums">{hi}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value, detail }) {
  return (
    <div className="rounded-[16px] p-3.5 min-h-[140px] flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.12)', border: '0.5px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
      <div className="text-[11px] text-white/85 font-semibold uppercase tracking-[0.06em] flex items-center gap-1.5">
        <SFSymbol name={icon} size={12} color="rgba(255,255,255,0.85)" />
        <span>{label}</span>
      </div>
      <div>
        <div className="text-[30px] font-light text-white leading-none tabular-nums">{value}</div>
        <div className="text-[12px] text-white/85 mt-2 leading-snug">{detail}</div>
      </div>
    </div>
  );
}

function uvLabel(v) {
  if (v == null) return '—';
  if (v < 3) return 'Low';
  if (v < 6) return 'Moderate';
  if (v < 8) return 'High';
  if (v < 11) return 'Very High';
  return 'Extreme';
}

export default function Weather() {
  const { byId, loading, error } = useWeather();
  const [activeId, setActiveId] = useState(locations[0].id);
  const active = locations.find(l => l.id === activeId);
  const data = byId[activeId];
  const mood = useMemo(() => {
    if (!data) return 'cloudy';
    const isDay = data.current.is_day;
    const code = data.current.weather_code;
    if (!isDay && code <= 3) return 'night';
    return wmoInfo(code).mood;
  }, [data]);

  return (
    <div className="flex h-full text-white" style={{ background: moodBg[mood] }}>
      <div
        className="w-[260px] shrink-0 flex flex-col"
        style={{
          background: 'rgba(20,28,44,0.55)',
          borderRight: '0.5px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(40px) saturate(160%)',
          WebkitBackdropFilter: 'blur(40px) saturate(160%)',
        }}
      >
        <div className="h-[52px] flex items-center px-3 shrink-0 DragHandle">
          <div
            className="flex items-center gap-1.5 px-2 rounded-[7px] w-full h-[26px]"
            style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.1)' }}
          >
            <SFSymbol name="magnifyingglass" size={11} color="rgba(255,255,255,0.55)" />
            <input
              type="text"
              placeholder="Search for a city or airport"
              className="bg-transparent text-[12px] w-full outline-none placeholder:text-white/45"
            />
          </div>
        </div>

        <div className="px-3 pb-3 flex flex-col gap-2 overflow-y-auto">
          {locations.map(loc => (
            <LocationCard
              key={loc.id}
              loc={loc}
              data={byId[loc.id]}
              selected={activeId === loc.id}
              onClick={() => setActiveId(loc.id)}
            />
          ))}
          {error && (
            <div className="text-[11px] text-white/70 leading-snug mt-2 rounded-[10px] px-3 py-2" style={{ background: 'rgba(255,69,58,0.18)', border: '0.5px solid rgba(255,69,58,0.35)' }}>
              Couldn't reach Open-Meteo. {error}
            </div>
          )}
          {loading && !error && (
            <div className="text-[11px] text-white/55 leading-snug mt-2">Fetching live data…</div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="h-[52px] flex items-center justify-end px-4 shrink-0 DragHandle">
          <div className="text-[11px] text-white/60 mr-auto">Open-Meteo · Live</div>
          <button
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center transition-colors cursor-default"
            style={{ background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            title="Map"
          >
            <SFSymbol name="map" size={15} color="rgba(255,255,255,0.92)" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {!data ? (
            <div className="h-full flex items-center justify-center text-white/70 text-[13px]">
              {error ? `Error: ${error}` : 'Loading live weather…'}
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center pt-2 pb-8">
                <span className="text-[34px] font-normal leading-tight tracking-tight">{active.name}</span>
                <span
                  className="font-extralight tracking-tighter leading-none mt-1"
                  style={{ fontSize: 96, letterSpacing: '-0.05em' }}
                >
                  {Math.round(data.current.temperature_2m)}°
                </span>
                <span className="text-[20px] font-medium text-white/95 mt-1">{wmoInfo(data.current.weather_code).label}</span>
                <div className="flex items-center gap-2 text-[15px] font-medium mt-0.5 tabular-nums">
                  <span>H:{Math.round(data.daily.temperature_2m_max[0])}°</span>
                  <span>L:{Math.round(data.daily.temperature_2m_min[0])}°</span>
                </div>
                <div className="text-[12px] text-white/70 mt-1">
                  Feels like {Math.round(data.current.apparent_temperature)}°
                </div>
              </div>

              <div className="max-w-[680px] mx-auto flex flex-col gap-3">
                <HourlyStrip data={data} tz={active.tz} />
                <DailyCard data={data} tz={active.tz} />
                <div className="grid grid-cols-2 gap-3">
                  <InfoTile
                    icon="sun.max.fill"
                    label="UV Index"
                    value={data.daily.uv_index_max[0] != null ? Math.round(data.daily.uv_index_max[0]) : '—'}
                    detail={`${uvLabel(data.daily.uv_index_max[0])} today.`}
                  />
                  <InfoTile
                    icon="wind"
                    label="Wind"
                    value={`${Math.round(data.current.wind_speed_10m)} mph`}
                    detail={`${compassFromDeg(data.current.wind_direction_10m)} direction`}
                  />
                  <InfoTile
                    icon="sunrise.fill"
                    label="Sunrise"
                    value={formatClock(data.daily.sunrise[0], active.tz)}
                    detail={`Sunset: ${formatClock(data.daily.sunset[0], active.tz)}`}
                  />
                  <InfoTile
                    icon="drop.fill"
                    label="Humidity"
                    value={`${Math.round(data.current.relative_humidity_2m)}%`}
                    detail={`Dew point feels ${Math.round(data.current.apparent_temperature)}°`}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
