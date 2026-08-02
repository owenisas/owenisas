import { useEffect, useState, useMemo } from 'react';
import SFSymbol from '../components/icons/SFSymbol';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = 53 * 7; // 53 weeks

function generateContributions() {
  // Generate a realistic-looking contribution graph
  // More activity on weekdays, varies week to week, with some streaks
  const data = [];
  let seed = 42;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  for (let w = 0; w < 53; w++) {
    const weekIntensity = 0.3 + rand() * 0.7;
    for (let d = 0; d < 7; d++) {
      const isWeekend = d >= 5;
      const r = rand();
      let level = 0;
      if (r < (isWeekend ? 0.7 : 0.3) * weekIntensity) level = 0;
      else if (r < 0.5 * weekIntensity) level = 1;
      else if (r < 0.75 * weekIntensity) level = 2;
      else if (r < 0.9 * weekIntensity) level = 3;
      else level = 4;
      data.push(level);
    }
  }
  return data;
}

const LEVEL_COLORS = [
  '#161b22', '#0e4429', '#006d32', '#26a641', '#39d353',
];

export default function ActivityGraph() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(generateContributions());
  }, []);

  const stats = useMemo(() => {
    const total = data.reduce((s, l) => s + (l > 0 ? 1 : 0), 0);
    const contributions = data.reduce((s, l) => s + l * 2, 0);
    const longestStreak = (() => {
      let max = 0, cur = 0;
      for (const l of data) {
        if (l > 0) { cur++; max = Math.max(max, cur); } else cur = 0;
      }
      return max;
    })();
    return { total, contributions, longestStreak, currentStreak: 4 };
  }, [data]);

  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: '#0d1117', color: '#e6edf3' }}>
      <div className="max-w-[760px] mx-auto px-6 py-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <SFSymbol name="chart.bar.fill" size={22} color="#39d353" />
          <h1 className="text-[18px] font-semibold">GitHub Activity</h1>
          <span className="text-[13px] ml-auto" style={{ color: '#7d8590' }}>owenisas</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-[10px] p-3" style={{ background: '#161b22', border: '1px solid #30363d' }}>
            <div className="text-[11px]" style={{ color: '#7d8590' }}>Contributions</div>
            <div className="text-[22px] font-bold" style={{ color: '#39d353' }}>{stats.contributions}</div>
            <div className="text-[11px]" style={{ color: '#7d8590' }}>past year</div>
          </div>
          <div className="rounded-[10px] p-3" style={{ background: '#161b22', border: '1px solid #30363d' }}>
            <div className="text-[11px]" style={{ color: '#7d8590' }}>Current Streak</div>
            <div className="text-[22px] font-bold" style={{ color: '#58a6ff' }}>{stats.currentStreak} days</div>
            <div className="text-[11px]" style={{ color: '#7d8590' }}>{'🔥 keep it going'}</div>
          </div>
          <div className="rounded-[10px] p-3" style={{ background: '#161b22', border: '1px solid #30363d' }}>
            <div className="text-[11px]" style={{ color: '#7d8590' }}>Longest Streak</div>
            <div className="text-[22px] font-bold" style={{ color: '#bc8cff' }}>{stats.longestStreak} days</div>
            <div className="text-[11px]" style={{ color: '#7d8590' }}>personal best</div>
          </div>
        </div>

        {/* Graph */}
        <div className="rounded-[10px] p-4" style={{ background: '#161b22', border: '1px solid #30363d' }}>
          <div className="overflow-x-auto">
            {/* Month labels */}
            <div className="flex gap-[3px] mb-1 ml-[26px]">
              {MONTHS.map((m, i) => (
                <div key={m} className="text-[10px]" style={{ color: '#7d8590', width: 26, textAlign: 'left' }}>
                  {i % 2 === 0 ? m : ''}
                </div>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] mr-1 justify-between" style={{ height: 7 * 13 }}>
                <span className="text-[9px] leading-none" style={{ color: '#7d8590' }}>Mon</span>
                <span className="text-[9px] leading-none" style={{ color: '#7d8590' }}>Wed</span>
                <span className="text-[9px] leading-none" style={{ color: '#7d8590' }}>Fri</span>
              </div>
              {/* Grid */}
              <div className="flex gap-[3px]">
                {Array.from({ length: 53 }, (_, w) => (
                  <div key={w} className="flex flex-col gap-[2px]">
                    {Array.from({ length: 7 }, (_, d) => {
                      const idx = w * 7 + d;
                      const level = data[idx] || 0;
                      return (
                        <div
                          key={idx}
                          className="w-[11px] h-[11px] rounded-[2px]"
                          style={{ background: LEVEL_COLORS[level] }}
                          title={`${level} contributions`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-3 justify-end">
            <span className="text-[10px]" style={{ color: '#7d8590' }}>Less</span>
            {LEVEL_COLORS.map((c, i) => (
              <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: c }} />
            ))}
            <span className="text-[10px]" style={{ color: '#7d8590' }}>More</span>
          </div>
        </div>

        {/* Activity breakdown */}
        <div className="mt-4 rounded-[10px] p-4" style={{ background: '#161b22', border: '1px solid #30363d' }}>
          <h3 className="text-[13px] font-semibold mb-3" style={{ color: '#e6edf3' }}>Recent Activity</h3>
          <div className="space-y-2">
            {[
              { type: 'push', text: 'shipped macOS web simulator updates', time: '2h ago', color: '#39d353' },
              { type: 'star', text: 'starred anthropics/anthropic-sdk-python', time: '5h ago', color: '#e3b341' },
              { type: 'fork', text: 'forked microsoft/WSL', time: '1d ago', color: '#58a6ff' },
              { type: 'push', text: 'Vellum — improved token boundary detection', time: '2d ago', color: '#39d353' },
              { type: 'create', text: 'created repository owenisas/owenisas', time: '5d ago', color: '#bc8cff' },
              { type: 'push', text: 'Origraph — Solana anchor program scaffolding', time: '1w ago', color: '#39d353' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[13px]">
                <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: item.color }} />
                <span style={{ color: '#e6edf3' }}>{item.text}</span>
                <span className="ml-auto shrink-0" style={{ color: '#7d8590' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
