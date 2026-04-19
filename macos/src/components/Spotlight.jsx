import { useState, useEffect, useRef, useMemo } from 'react';
import { appIcons } from './Icons';
import { searchFs, parentPath } from '../fs/vfs';

const allApps = [
  { id: 'finder', title: 'Finder' },
  { id: 'safari', title: 'Safari' },
  { id: 'mail', title: 'Mail' },
  { id: 'messages', title: 'Messages' },
  { id: 'photos', title: 'Photos' },
  { id: 'terminal', title: 'Terminal' },
  { id: 'notes', title: 'Notes' },
  { id: 'calculator', title: 'Calculator' },
  { id: 'textedit', title: 'TextEdit' },
  { id: 'preview', title: 'Preview' },
  { id: 'calendar', title: 'Calendar' },
  { id: 'weather', title: 'Weather' },
  { id: 'settings', title: 'System Settings' },
];

const quickActions = [
  { id: 'action-screenshot', title: 'Take Screenshot', subtitle: 'System action', icon: 'screenshot' },
  { id: 'action-settings', title: 'Open Display Settings', subtitle: 'System Settings', icon: 'settings', appId: 'settings' },
  { id: 'action-note', title: 'Create Note', subtitle: 'Notes', icon: 'notes', appId: 'notes' },
];

function iconForKind(kind) {
  if (kind === 'image') return 'photos';
  if (kind === 'md' || kind === 'text') return 'textedit';
  if (kind === 'pdf') return 'preview';
  return 'finder';
}

function appForNode(node) {
  if (node.type === 'dir') return 'finder';
  if (node.kind === 'image' || node.kind === 'pdf') return 'preview';
  return 'textedit';
}

const webLinks = [
  { id: 'web-github', title: 'GitHub Profile', subtitle: 'https://github.com/owenisas', icon: 'safari', externalUrl: 'https://github.com/owenisas' },
  { id: 'web-linkedin', title: 'LinkedIn Profile', subtitle: 'https://www.linkedin.com/in/thomas-suen-84776a262/', icon: 'safari', externalUrl: 'https://www.linkedin.com/in/thomas-suen-84776a262/' },
  { id: 'web-x', title: 'X (Twitter)', subtitle: 'https://x.com/ThomasSuen6', icon: 'safari', externalUrl: 'https://x.com/ThomasSuen6' }
];

export default function Spotlight({ isOpen, onClose, onAppLaunch }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const normalized = query.toLowerCase();
  
  let mathResult = null;
  try {
    const mathQuery = query.replace(/[a-zA-Z]/g, '');
    if (query.trim() && mathQuery === query && /[0-9]/.test(query) && /[\+\-\*\/\(\)]/.test(query)) {
      const fn = new Function(`return (${query})`);
      const res = fn();
      if (typeof res === 'number' && !isNaN(res)) {
        mathResult = res;
      }
    }
  } catch (e) {
    // Ignore invalid math
  }

  const appMatches = query.length > 0
    ? allApps.filter(a => a.title.toLowerCase().includes(normalized))
    : allApps.slice(0, 6);
  const actionMatches = quickActions.filter(a => !query || a.title.toLowerCase().includes(normalized) || a.subtitle.toLowerCase().includes(normalized));
  const fsMatches = useMemo(() => {
    if (!query.trim()) return [];
    return searchFs(query, { limit: 6 }).map(({ node, path }) => ({
      id: `fs-${path}`,
      title: node.name,
      subtitle: parentPath(path).replace('~', 'Home'),
      icon: node.type === 'dir' ? 'finder' : iconForKind(node.kind),
      appId: appForNode(node),
      payload: { vfsPath: path },
    }));
  }, [query]);
  const linkMatches = webLinks.filter(a => !query || a.title.toLowerCase().includes(normalized) || a.subtitle.toLowerCase().includes(normalized));

  const groups = [
    { title: 'Calculator', items: mathResult !== null ? [{ id: 'calc-res', title: String(mathResult), subtitle: query, icon: 'calculator', appId: 'calculator' }] : [] },
    { title: 'Applications', items: appMatches.map(item => ({ ...item, type: 'app', appId: item.id })) },
    { title: 'Files', items: fsMatches.map(item => ({ ...item, type: 'file' })) },
    { title: 'Social Profiles', items: linkMatches.map(item => ({ ...item, type: 'link' })) },
    { title: 'Actions', items: actionMatches.map(item => ({ ...item, type: 'action' })) },
  ].filter(group => group.items.length > 0);
  const filtered = groups.flatMap(group => group.items.map(item => ({ ...item, group: group.title })));

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (filtered.length) setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (filtered.length) setSelectedIndex(i => Math.max(i - 1, 0)); return; }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      const item = filtered[selectedIndex];
      if (item.externalUrl) { window.open(item.externalUrl, '_blank'); }
      else { onAppLaunch(item.appId || item.id, item.title, { ...item.payload, ts: Date.now() }); }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[28vh]" onClick={onClose}>
      <div
        className="w-[700px] rounded-[8px] overflow-hidden animate-[scale-in_0.15s_ease-out]"
        style={{ background: 'rgba(28,30,36,0.78)', backdropFilter: 'blur(64px) saturate(190%)', WebkitBackdropFilter: 'blur(64px) saturate(190%)', boxShadow: 'var(--mac-shadow-popover)', border: '0.5px solid rgba(255,255,255,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 gap-3 border-b border-white/10">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            aria-label="Spotlight Search"
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent text-white text-[22px] font-light outline-none placeholder:text-white/30"
          />
        </div>
        {filtered.length > 0 ? (
          <div className="max-h-[420px] overflow-y-auto py-2">
            {groups.map(group => (
              <div key={group.title} className="mb-1">
                <div className="px-4 py-1 text-[11px] text-white/42 font-medium uppercase tracking-wider">{group.title}</div>
                {group.items.map(item => {
                  const flatIndex = filtered.findIndex(result => result.id === item.id);
                  const selected = flatIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2 text-left rounded-[8px] mx-2 transition-colors"
                      style={{
                        width: 'calc(100% - 16px)',
                        background: selected ? 'rgba(10,132,255,0.84)' : 'transparent',
                      }}
                      onClick={() => {
                        if (item.externalUrl) { window.open(item.externalUrl, '_blank'); }
                        else { onAppLaunch(item.appId || item.id, item.title, { ...item.payload, ts: Date.now() }); }
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(flatIndex)}
                    >
                      <div className="w-9 h-9 shrink-0">{appIcons[item.icon || item.id]}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] text-white truncate">{item.title}</div>
                        <div className="text-[12px] text-white/50 truncate">{item.subtitle || item.group || group.title}</div>
                      </div>
                      {selected && <div className="text-[11px] text-white/75">Return</div>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <div className="text-[15px] text-white/72 font-medium">No results found</div>
            <div className="text-[12px] text-white/40 mt-1">Search for an app, action, or recent file.</div>
          </div>
        )}
      </div>
    </div>
  );
}
