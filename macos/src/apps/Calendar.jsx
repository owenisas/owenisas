import { useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToolbarButton, MacSegmentedControl } from '../components/ui/MacControls';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [view, setView] = useState('month');

  // Hardcoded current month view for mock purposes
  const generateDays = () => {
    const days = [];
    for (let i = 0; i < 35; i++) {
        const isCurrentMonth = i >= 3 && i < 33;
        const dayNumber = isCurrentMonth ? i - 2 : (i < 3 ? 29 + i : i - 32);
        const hasEvent = [12, 18, 25].includes(dayNumber) && isCurrentMonth;
        days.push({ id: i, number: dayNumber, current: isCurrentMonth, today: dayNumber === 15 && isCurrentMonth, event: hasEvent });
    }
    return days;
  };

  const days = generateDays();

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-white/10 shrink-0 DragHandle" style={{ background: 'rgba(40, 40, 40, 0.4)' }}>
        <div className="flex items-center gap-4">
          <MacToolbarButton icon="sidebar.left" size={28} />
          <div className="flex items-center gap-1">
            <MacToolbarButton icon="chevron.left" size={28} />
            <MacToolbarButton icon="chevron.right" size={28} />
          </div>
          <span className="text-white text-[18px] font-medium ml-2">April 2026</span>
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
            <input type="text" placeholder="Search" className="bg-transparent text-[13px] text-white outline-none w-full placeholder:text-white/40" />
          </div>
          <MacToolbarButton icon="plus" size={28} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[200px] border-r border-white/10 p-3 flex flex-col gap-4 overflow-y-auto" style={{ background: 'rgba(30, 30, 30, 0.5)' }}>
            <div>
                <img src="/icons/calendar.png" alt="Calendar" className="w-[128px] h-[128px] mx-auto drop-shadow-lg mb-4" />
            </div>
            
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
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-white/10 shrink-0">
                {DAYS.map(day => (
                    <div key={day} className="h-[30px] flex items-center justify-end pr-2 text-[11px] font-medium text-white/50 border-r border-white/10 last:border-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-white/5 gap-[1px]">
                {days.map((day, idx) => (
                    <div key={day.id} className="bg-[#1e1e1e] flex flex-col p-1">
                        <div className="flex justify-end">
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[13px] font-medium
                                ${day.today ? 'bg-[#ff3b30] text-white' : ''}
                                ${!day.current && !day.today ? 'text-white/30' : ''}
                                ${day.current && !day.today ? 'text-white/80' : ''}
                            `}>
                                {day.number}
                            </span>
                        </div>
                        {day.event && (
                            <div className="mt-1 px-1.5 py-0.5 rounded-[4px] bg-[#0a84ff]/20 border border-[#0a84ff]/30 text-[#409cff] text-[10px] font-medium truncate">
                                10:00 AM Team Sync
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
