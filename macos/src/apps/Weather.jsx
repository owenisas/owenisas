import SFSymbol from '../components/icons/SFSymbol';

const forecast = [
  { day: 'Today', icon: 'cloud.sun.fill', low: 48, high: 62 },
  { day: 'Mon', icon: 'sun.max.fill', low: 52, high: 70 },
  { day: 'Tue', icon: 'cloud.rain.fill', low: 50, high: 58 },
  { day: 'Wed', icon: 'cloud.fill', low: 45, high: 55 },
  { day: 'Thu', icon: 'sun.max.fill', low: 50, high: 68 },
];

export default function Weather() {
  return (
    <div className="flex h-full text-white bg-[#0f172a]">
      {/* Sidebar - locations */}
      <div className="w-[240px] flex flex-col border-r border-white/10 bg-[#1e293b]/50">
        <div className="h-[48px] border-b border-white/5 flex items-center px-4 DragHandle shrink-0">
          <div className="bg-white/10 rounded-md flex items-center pl-2 pr-3 py-1 w-full gap-2 border border-white/5">
            <SFSymbol name="magnifyingglass" size={12} color="rgba(255,255,255,0.4)" />
            <input type="text" placeholder="Search" className="bg-transparent text-sm w-full outline-none placeholder:text-white/40" />
          </div>
        </div>
        
        <div className="p-3 space-y-2 overflow-y-auto">
          <div className="bg-[#38bdf8]/20 border border-[#38bdf8]/30 rounded-[12px] p-3 cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[14px] font-medium">Cupertino</div>
                <div className="text-[11px] text-white/70">10:42 AM</div>
              </div>
              <div className="text-[32px] font-light tracking-tighter">62°</div>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div className="text-[12px] text-white/80">Partly Cloudy</div>
              <div className="text-[12px] text-white/80">H:62° L:48°</div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/5 rounded-[12px] p-3 cursor-default opacity-60">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[14px] font-medium">New York</div>
                <div className="text-[11px] text-white/70">1:42 PM</div>
              </div>
              <div className="text-[32px] font-light tracking-tighter">45°</div>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div className="text-[12px] text-white/80">Rain</div>
              <div className="text-[12px] text-white/80">H:45° L:38°</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#38bdf8] to-[#0ea5e9]">
        <div className="h-[48px] flex justify-end items-center px-4 DragHandle shrink-0">
            <SFSymbol name="map" size={16} color="white" />
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
            <div className="flex flex-col items-center mb-12">
                <span className="text-[36px] font-normal leading-tight tracking-tight">Cupertino</span>
                <span className="text-[96px] font-extralight tracking-tighter leading-none mt-1">62°</span>
                <span className="text-[18px] font-medium text-white/90">Partly Cloudy</span>
                <span className="text-[14px] font-medium mt-1">H:62° L:48°</span>
            </div>

            {/* Forecast Panel */}
            <div className="max-w-[600px] mx-auto bg-[#082f49]/30 backdrop-blur-md rounded-[16px] border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-4 text-white/70 text-[12px] uppercase font-semibold tracking-wider">
                    <SFSymbol name="calendar" size={14} />
                    <span>5-Day Forecast</span>
                </div>

                <div className="flex flex-col gap-3">
                    {forecast.map((day, i) => (
                        <div key={day.day} className="flex items-center gap-4 text-[14px]">
                            <span className="w-10 font-medium">{day.day}</span>
                            <div className="w-[30px] flex justify-center">
                                <SFSymbol name={day.icon} size={20} color={day.icon.includes('sun') ? '#fcd34d' : 'white'} />
                            </div>
                            <span className="w-6 text-right font-medium opacity-60 text-[14px]">{day.low}°</span>
                            
                            <div className="flex-1 h-[6px] rounded-full bg-black/20 flex relative">
                                <div className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 to-yellow-400" 
                                     style={{ left: `${(day.low - 40) * 2}%`, right: `${100 - ((day.high - 40) * 2)}%` }} />
                            </div>
                            
                            <span className="w-6 text-right font-medium text-[14px]">{day.high}°</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
