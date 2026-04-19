import { useEffect, useMemo, useRef, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToolbarButton } from '../components/ui/MacControls';
import { useFileContent } from '../hooks/useFileContent';

function useConversations() {
  const { text, loading, error } = useFileContent('/content/conversations.json');
  return useMemo(() => {
    if (loading || error || !text) return { loading, error, threads: [] };
    try {
      const data = JSON.parse(text);
      return { loading: false, error: null, threads: data.threads || [] };
    } catch (e) {
      return { loading: false, error: e.message, threads: [] };
    }
  }, [text, loading, error]);
}

function Avatar({ name, color, active }) {
  return (
    <div
      className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 text-white text-[16px] font-medium"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}aa)`,
        boxShadow: active ? '0 0 0 2px rgba(10,132,255,0.4)' : 'inset 0 0 0 0.5px rgba(255,255,255,0.12)',
      }}
    >
      {name}
    </div>
  );
}

function Bubble({ msg, color }) {
  const me = msg.from === 'me';
  return (
    <div className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[72%]">
        <div
          className="text-[14px] leading-relaxed px-3.5 py-2 rounded-[16px]"
          style={{
            background: me ? '#0a84ff' : 'rgba(255,255,255,0.08)',
            color: '#fff',
            borderBottomRightRadius: me ? 4 : 16,
            borderBottomLeftRadius: me ? 16 : 4,
            border: me ? 'none' : '0.5px solid rgba(255,255,255,0.06)',
          }}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export default function Messages({ onAppLaunch }) {
  const { threads, loading, error } = useConversations();
  const [activeId, setActiveId] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!activeId && threads.length) setActiveId(threads[0].id);
  }, [threads, activeId]);

  const active = threads.find(t => t.id === activeId);

  useEffect(() => {
    if (!active) return;
    if (revealed[active.id] !== undefined) return;
    // Stagger reveal of messages for the first visit.
    const count = active.messages.length;
    setRevealed(r => ({ ...r, [active.id]: 0 }));
    let i = 0;
    const tick = () => {
      i += 1;
      setRevealed(r => ({ ...r, [active.id]: i }));
      if (i < count) setTimeout(tick, 260);
    };
    setTimeout(tick, 200);
  }, [active, revealed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [revealed, activeId]);

  const handleSuggestion = (s) => {
    if (/finder/i.test(s)) onAppLaunch?.('finder', 'Finder');
    else if (/mail/i.test(s)) onAppLaunch?.('mail', 'Mail');
    else if (/project/i.test(s) && threads.find(t => t.id === 'projects')) setActiveId('projects');
    else if (/back to projects/i.test(s)) setActiveId('projects');
    else setDraft(s);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-white/40 text-[13px]" style={{ background: 'rgba(30,30,30,0.95)' }}>Loading conversations…</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full text-red-400 text-[13px]" style={{ background: 'rgba(30,30,30,0.95)' }}>Error: {error}</div>;
  }

  return (
    <div className="flex h-full" style={{ background: 'rgba(26,26,28,0.97)' }}>
      <div
        className="w-[280px] flex flex-col"
        style={{
          background: 'rgba(40,40,42,0.75)',
          borderRight: '0.5px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(40px) saturate(160%)',
          WebkitBackdropFilter: 'blur(40px) saturate(160%)',
        }}
      >
        <div className="h-[52px] flex items-center px-3 shrink-0 DragHandle" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[14px] text-white/90 font-semibold tracking-tight">Messages</div>
          <div className="flex-1" />
          <MacToolbarButton icon="square.and.pencil" size={28} />
        </div>

        <div className="px-3 pt-2 pb-2">
          <div
            className="flex items-center gap-1.5 px-2 rounded-[7px] h-[26px]"
            style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.06)' }}
          >
            <SFSymbol name="magnifyingglass" size={11} color="rgba(255,255,255,0.45)" />
            <input type="text" placeholder="Search" className="bg-transparent text-[12px] text-white outline-none w-full placeholder:text-white/40" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-[1px]">
          {threads.map(t => {
            const last = t.messages[t.messages.length - 1];
            const selected = activeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-left transition-colors cursor-default"
                style={{
                  background: selected ? 'rgba(10,132,255,0.92)' : 'transparent',
                  boxShadow: selected ? 'inset 0 0.5px 0 rgba(255,255,255,0.14)' : 'none',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
              >
                <Avatar name={t.avatar} color={t.color} active={selected} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-[13px] font-semibold truncate">{t.title}</span>
                    <span className="text-[10px] shrink-0 tabular-nums" style={{ color: selected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>Now</span>
                  </div>
                  <div className="text-[12px] truncate mt-[1px] leading-snug line-clamp-2" style={{ color: selected ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.48)' }}>
                    {last?.from === 'me' ? 'You: ' : ''}{last?.text}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col" style={{ background: 'rgba(22,22,24,0.98)' }}>
        <div
          className="h-[52px] flex items-center justify-center relative px-4 shrink-0 DragHandle"
          style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(36,36,38,0.55)' }}
        >
          <div className="flex flex-col items-center">
            <span className="text-white text-[13px] font-semibold tracking-tight">{active?.title || 'Conversation'}</span>
            {active?.subtitle && <span className="text-white/55 text-[11px] mt-[1px]">{active.subtitle}</span>}
          </div>
          <div className="absolute right-3">
            <MacToolbarButton icon="info.circle" size={28} />
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {active && (
            <>
              <div className="text-center text-white/40 text-[11px] font-medium mt-2 mb-1">Today</div>
              {active.messages.slice(0, revealed[active.id] ?? 0).map((m, i) => (
                <Bubble key={i} msg={m} color={active.color} />
              ))}
              {(revealed[active.id] ?? 0) < active.messages.length && (
                <div className="self-start flex items-center gap-1 px-3 py-2 rounded-[16px] bg-white/6 border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </>
          )}
        </div>

        {active && (revealed[active.id] ?? 0) >= active.messages.length && active.suggestions?.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
            {active.suggestions.map((s, i) => (
              <button
                key={i}
                className="px-3 py-1.5 text-[12px] text-white/85 rounded-full border border-white/12 bg-white/6 hover:bg-white/12 transition-colors cursor-default"
                onClick={() => handleSuggestion(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 pt-2">
          <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-[18px] px-3 py-2 focus-within:border-[#0a84ff]/50 transition-colors">
            <input
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) { setDraft(''); } }}
              className="flex-1 bg-transparent text-white outline-none min-h-[20px] text-[14px] placeholder:text-white/30"
              placeholder="Ask Thomas a question…"
            />
            <SFSymbol name="face.smiling" size={18} color="rgba(255,255,255,0.4)" className="pb-0.5" />
          </div>
          <div className="text-[10px] text-white/30 mt-1.5 px-2">Scripted portfolio chat. For real contact, open Mail.</div>
        </div>
      </div>
    </div>
  );
}
