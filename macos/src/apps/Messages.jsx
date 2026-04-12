import { useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToolbarButton } from '../components/ui/MacControls';

const chats = [
  { id: 1, name: 'Craig Federighi', preview: 'Hair force one is ready for the keynote.', time: '10:42 AM', unread: true },
  { id: 2, name: 'Tim Cook', preview: 'Good morning!', time: 'Yesterday', unread: false },
  { id: 3, name: 'Team Chat', preview: 'Owen: The new build looks amazing.', time: 'Mon', unread: false },
];

export default function Messages() {
  const [activeChat, setActiveChat] = useState(1);

  return (
    <div className="flex h-full" style={{ background: 'rgba(30, 30, 30, 0.95)' }}>
      {/* Sidebar */}
      <div className="w-[260px] flex flex-col border-r border-white/10" style={{ background: 'rgba(40, 40, 40, 0.5)' }}>
        {/* Sidebar Header */}
        <div className="h-[48px] flex items-center px-4 shrink-0 DragHandle">
          <div className="flex-1" />
          <MacToolbarButton icon="square.and.pencil" size={28} />
        </div>
        
        {/* Search */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-2 bg-white/10 rounded-md h-[28px] border border-white/5">
            <SFSymbol name="magnifyingglass" size={12} color="rgba(255,255,255,0.4)" />
            <input type="text" placeholder="Search" className="bg-transparent text-[13px] text-white outline-none w-full placeholder:text-white/40" />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-[2px]">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left"
              style={{ background: activeChat === chat.id ? '#0a84ff' : 'transparent' }}
            >
              <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shrink-0">
                <span className="text-white text-[18px] font-medium">{chat.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-white text-[13px] font-medium truncate">{chat.name}</span>
                  <span className="text-white/60 text-[11px] whitespace-nowrap ml-2" style={{ color: activeChat === chat.id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' }}>{chat.time}</span>
                </div>
                <div className="text-white/60 text-[12px] truncate mt-[1px]" style={{ color: activeChat === chat.id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' }}>
                  {chat.preview}
                </div>
              </div>
              {chat.unread && <div className="w-[8px] h-[8px] rounded-full bg-[#0a84ff] shrink-0" style={{ background: activeChat === chat.id ? '#fff' : '#0a84ff' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e]">
        {/* Main Header */}
        <div className="h-[48px] flex items-center justify-between px-4 border-b border-white/10 shrink-0 DragHandle" style={{ background: 'rgba(40, 40, 40, 0.4)' }}>
          <div className="flex flex-col">
            <span className="text-white text-[14px] font-medium">Craig Federighi</span>
            <span className="text-white/50 text-[11px]">iMessage</span>
          </div>
          <MacToolbarButton icon="info.circle" size={28} />
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="text-center text-white/40 text-[11px] font-medium mt-4">Today 10:42 AM</div>
          <div className="self-start max-w-[70%]">
            <div className="bg-white/10 text-white text-[14px] px-3.5 py-2 rounded-[16px] rounded-bl-[4px] leading-relaxed border border-white/5">
              Hair force one is ready for the keynote. Have you checked the latest build?
            </div>
          </div>
          <div className="self-end max-w-[70%]">
            <div className="bg-[#0a84ff] text-white text-[14px] px-3.5 py-2 rounded-[16px] rounded-br-[4px] leading-relaxed">
              Looks flawless! The new UI polish makes a huge difference.
            </div>
            <div className="text-right text-white/40 text-[10px] mt-1 mr-1">Delivered</div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 pt-2">
          <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-[18px] px-3 py-2 focus-within:border-[#0a84ff]/50 transition-colors">
            <input 
              type="text" 
              className="flex-1 bg-transparent text-white outline-none min-h-[20px] text-[14px] placeholder:text-white/30" 
              placeholder="iMessage"
            />
            <SFSymbol name="face.smiling" size={18} color="rgba(255,255,255,0.4)" className="cursor-pointer hover:opacity-80 pb-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
