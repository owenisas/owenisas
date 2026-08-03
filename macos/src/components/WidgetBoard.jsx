import { useEffect, useMemo, useState } from 'react';
import SFSymbol from './icons/SFSymbol';
import { photography } from '../fs/vfs';

function WidgetCard({ children, className = '', style, onDoubleClick }) {
  return (
    <div
      className={`desktop-widget rounded-[18px] overflow-hidden ${className}`}
      style={{
        background: 'rgba(32,34,40,0.76)',
        border: '0.5px solid rgba(255,255,255,0.16)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.24), inset 0 0.5px 0 rgba(255,255,255,0.12)',
        backdropFilter: 'blur(30px) saturate(150%)',
        WebkitBackdropFilter: 'blur(30px) saturate(150%)',
        ...style,
      }}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
}

function WeatherWidget({ onOpen }) {
  return (
    <WidgetCard className="min-h-[152px] text-white" style={{ background: 'linear-gradient(145deg, rgba(39,120,196,0.94), rgba(91,174,218,0.78))' }} onDoubleClick={onOpen}>
      <div className="p-3.5 h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[12px] font-semibold tracking-tight">Vancouver</div>
            <div className="text-[10px] text-white/70 mt-0.5">Mostly Cloudy</div>
          </div>
          <SFSymbol name="cloud.sun.fill" size={24} color="rgba(255,255,255,0.92)" />
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div className="text-[38px] font-light tracking-[-0.06em] leading-none">18°</div>
          <div className="text-right text-[10px] text-white/75 leading-relaxed">H 21°<br />L 13°</div>
        </div>
      </div>
    </WidgetCard>
  );
}

function CalendarWidget({ onOpen }) {
  const date = new Date();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  return (
    <WidgetCard className="min-h-[132px]" onDoubleClick={onOpen}>
      <div className="p-3.5 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-[#ff6961]">{month}</div>
          <SFSymbol name="calendar" size={15} color="#ff3b30" />
        </div>
        <div className="mt-1 text-[38px] leading-none tracking-[-0.06em] font-light text-white">{date.getDate()}</div>
        <div className="mt-auto text-[10px] font-semibold tracking-[0.08em] text-white/48">{weekday}</div>
        <div className="mt-1 text-[10px] text-white/65 truncate">10:00 AM · Team Sync</div>
      </div>
    </WidgetCard>
  );
}

function ActivityWidget({ onOpen }) {
  const cells = useMemo(() => Array.from({ length: 35 }, (_, i) => (i * 7 + 3) % 5), []);
  return (
    <WidgetCard className="min-h-[132px]" onDoubleClick={onOpen}>
      <div className="p-3.5 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-white/75">GitHub Activity</div>
          <SFSymbol name="chart.bar.fill" size={14} color="#30a14e" />
        </div>
        <div className="mt-3 grid grid-cols-7 gap-[3px]">
          {cells.map((level, i) => <span key={i} className="aspect-square rounded-[3px]" style={{ background: ['rgba(0,0,0,0.08)', '#b7e3c0', '#70c77e', '#40a85a', '#22863a'][level] }} />)}
        </div>
        <div className="mt-auto flex items-baseline gap-1"><span className="text-[22px] font-semibold text-white">17</span><span className="text-[10px] text-white/48">contributions this year</span></div>
      </div>
    </WidgetCard>
  );
}

function PhotoWidget({ onOpen }) {
  const photo = photography[0];
  return (
    <WidgetCard className="min-h-[142px] text-white" style={{ background: 'rgba(28,29,34,0.78)' }} onDoubleClick={onOpen}>
      <div className="relative h-full min-h-[142px]">
        <img src={photo.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.04) 70%)' }} />
        <div className="absolute left-3.5 right-3.5 bottom-3">
          <div className="flex items-center gap-1.5 text-[10px] text-white/75"><SFSymbol name="photo.fill" size={11} color="rgba(255,255,255,0.8)" /> Photos</div>
          <div className="text-[13px] font-medium mt-1 truncate">{photo.title}</div>
        </div>
      </div>
    </WidgetCard>
  );
}

function BatteryWidget() {
  return (
    <WidgetCard className="min-h-[84px]">
      <div className="p-3.5 h-full flex flex-col">
        <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-white/75">Battery</span><SFSymbol name="battery.100" size={16} color="#30a14e" /></div>
        <div className="mt-auto flex items-baseline gap-1"><span className="text-[25px] font-light text-white">87%</span><span className="text-[10px] text-white/48">Charging</span></div>
      </div>
    </WidgetCard>
  );
}

export default function WidgetBoard({ onAppLaunch }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onResize = () => setVisible(window.innerWidth >= 760);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!visible) return null;

  return (
    <aside className="desktop-widget-board" aria-label="Desktop widgets">
      <WeatherWidget onOpen={() => onAppLaunch?.('weather', 'Weather')} />
      <CalendarWidget onOpen={() => onAppLaunch?.('calendar', 'Calendar')} />
      <ActivityWidget onOpen={() => onAppLaunch?.('activity', 'GitHub Activity')} />
      <BatteryWidget />
      <PhotoWidget onOpen={() => onAppLaunch?.('photos', 'Photos')} />
    </aside>
  );
}
