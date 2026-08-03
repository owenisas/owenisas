import { useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToolbarButton, MacSegmentedControl } from '../components/ui/MacControls';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(() => new Date());
  const [search, setSearch] = useState('');

  const generateDays = () => {
    const days = [];
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const today = new Date();
    for (let i = 0; i < 42; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const isCurrentMonth = date.getMonth() === cursor.getMonth();
        const hasEvent = [12, 18, 25].includes(date.getDate()) && isCurrentMonth;
        const eventTitle = hasEvent ? (search ? 'Team Sync' : '10:00 AM Team Sync') : null;
        days.push({ id: date.toISOString(), number: date.getDate(), current: isCurrentMonth, today: date.toDateString() === today.toDateString(), event: eventTitle });
    }
    return days;
  };

  const days = generateDays();

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-white/10 shrink-0 DragHandle" style={{ background: 'rgba(40, 40, 40, 0.4)' }}>
        <div className="flex items-center gap-4">
          <MacToolbarButton icon="sidebar.left" size={28} label="Sidebar" />
          <div className="flex items-center gap-1">
            <MacToolbarButton icon="chevron.left" size={28} label="Previous Month" onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} />
            <MacToolbarButton icon="chevron.right" size={28} label="Next Month" onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} />
          </div>
          <span className="text-white text-[18px] font-medium ml-2">{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
        
        <div className="flex items-center gap-4 hidden sm:flex">
          <MacSegmentedControl 
            options={[
              { label: 'Day', value: 'day' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
              { label: 'Year', value: 'year' }
            ]} 
            value={view}
            onChange={setView}
            size="large"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/10 border border-white/5 rounded-md px-2 py-1 flex items-center gap-1.5 h-[28px] w-[150px]">
            <SFSymbol name="magnifyingglass" size={12} color="rgba(255,255,255,0.4)" />
            <input aria-label="Search calendar" type="text" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-[13px] text-white outline-none w-full placeholder:text-white/40" />
          </div>
          <MacToolbarButton icon="calendar" size={28} label="Today" onClick={() => setCursor(new Date())} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[200px] border-r border-white/10 p-3 flex flex-col gap-4 overflow-y-auto" style={{ background: 'rgba(30, 30, 30, 0.5)' }}>
            <div className="text-white/40 text-[11px] font-bold uppercase tracking-wider px-2">iCloud</div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-2 py-1 relative">
                    <input type="checkbox" defaultChecked className="accent-[#0a84ff]" />
                    <span className="text-white text-[13px]">Work</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1">
                    <input type="checkbox" defaultChecked className="accent-[#34c759]" />
                    <span className="text-white text-[13px]">Home</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1">
                    <input type="checkbox" defaultChecked className="accent-[#ff9500]" />
                    <span className="text-white text-[13px]">Family</span>
                </div>
            </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            {view === 'month' && <>
              <div className="grid grid-cols-7 border-b border-white/10 shrink-0">
                {DAYS.map(day => <div key={day} className="h-[30px] flex items-center justify-end pr-2 text-[11px] font-medium text-white/50 border-r border-white/10 last:border-0">{day}</div>)}
              </div>
              <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-white/5 gap-[1px]">
                {days.map((day) => <div key={day.id} className="bg-[#1e1e1e] flex flex-col p-1"><div className="flex justify-end"><span className={`w-7 h-7 flex items-center justify-center rounded-full text-[13px] font-medium ${day.today ? 'bg-[#ff3b30] text-white' : ''} ${!day.current && !day.today ? 'text-white/30' : ''} ${day.current && !day.today ? 'text-white/80' : ''}`}>{day.number}</span></div>{day.event && <div className="mt-1 px-1.5 py-0.5 rounded-[4px] bg-[#0a84ff]/20 border border-[#0a84ff]/30 text-[#409cff] text-[10px] font-medium truncate">{day.event}</div>}</div>)}
              </div>
            </>}
            {view === 'day' && <div className="flex-1 p-8"><div className="text-white/55 text-[12px] uppercase tracking-wider">{cursor.toLocaleDateString('en-US', { weekday: 'long' })}</div><div className="text-white text-[32px] font-light mt-1">{cursor.getDate()} {cursor.toLocaleDateString('en-US', { month: 'long' })}</div><div className="mt-8 rounded-lg border border-[#0a84ff]/30 bg-[#0a84ff]/15 px-4 py-3 text-[#7db9ff] text-[13px]">10:00 AM · Team Sync</div></div>}
            {view === 'week' && <div className="flex-1 grid grid-cols-7 divide-x divide-white/10">{DAYS.map((day, i) => <div key={day} className="p-2"><div className="text-[11px] text-white/50">{day}</div><div className="text-[18px] text-white mt-1">{new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - cursor.getDay() + i).getDate()}</div>{i === 2 && <div className="mt-5 rounded bg-[#0a84ff]/20 border border-[#0a84ff]/30 px-1.5 py-1 text-[10px] text-[#7db9ff]">Team Sync</div>}</div>)}</div>}
            {view === 'year' && <div className="flex-1 grid grid-cols-3 gap-6 p-8">{Array.from({ length: 12 }, (_, i) => <div key={i} className="rounded-lg border border-white/10 p-3"><div className="text-[12px] text-white/70">{new Date(cursor.getFullYear(), i, 1).toLocaleDateString('en-US', { month: 'long' })}</div><div className="grid grid-cols-7 gap-1 mt-3">{Array.from({ length: 35 }, (_, j) => <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: j % 9 === 0 ? '#ff3b30' : 'rgba(255,255,255,0.18)' }} />)}</div></div>)}</div>}
        </div>
      </div>
    </div>
  );
}
