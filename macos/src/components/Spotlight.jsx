import { useState, useEffect, useRef } from 'react';
import { appIcons } from './Icons';

const allApps = [
  { id: 'finder', title: 'Finder' },
  { id: 'safari', title: 'Safari' },
  { id: 'terminal', title: 'Terminal' },
  { id: 'notes', title: 'Notes' },
  { id: 'calculator', title: 'Calculator' },
  { id: 'settings', title: 'System Settings' },
  { id: 'textedit', title: 'TextEdit' },
  { id: 'photos', title: 'Photos' },
];

export default function Spotlight({ isOpen, onClose, onAppLaunch }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const filtered = query.length > 0
    ? allApps.filter(a => a.title.toLowerCase().includes(query.toLowerCase()))
    : allApps;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); return; }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      onAppLaunch(filtered[selectedIndex].id, filtered[selectedIndex].title);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div
        className="w-[680px] rounded-xl overflow-hidden shadow-2xl border border-white/15 animate-[scale-in_0.15s_ease-out]"
        style={{ background: 'rgba(40,40,40,0.88)', backdropFilter: 'blur(50px) saturate(200%)', WebkitBackdropFilter: 'blur(50px) saturate(200%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 gap-3 border-b border-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent text-white text-[22px] font-light outline-none placeholder:text-white/30"
          />
        </div>
        {filtered.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto py-1">
            <div className="px-3 py-1 text-[11px] text-white/40 font-medium uppercase tracking-wider">Applications</div>
            {filtered.map((app, i) => (
              <button
                key={app.id}
                className={`w-full flex items-center gap-3 px-3 py-1.5 text-left rounded-lg mx-1 ${i === selectedIndex ? 'bg-accent' : 'hover:bg-white/5'}`}
                style={{ width: 'calc(100% - 8px)' }}
                onClick={() => { onAppLaunch(app.id, app.title); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div className="w-8 h-8">{appIcons[app.id]}</div>
                <span className="text-[14px] text-white">{app.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
