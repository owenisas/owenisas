import { useState, useCallback, useRef } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToolbarButton } from '../components/ui/MacControls';

const defaultFavorites = [
  { name: 'Apple', url: 'https://apple.com', color: '#555', letter: '' },
  { name: 'GitHub', url: 'https://github.com', color: '#24292e', letter: '' },
  { name: 'YouTube', url: 'https://youtube.com', color: '#FF0000', letter: '▶' },
  { name: 'Wikipedia', url: 'https://wikipedia.org', color: '#636466', letter: 'W' },
  { name: 'Reddit', url: 'https://reddit.com', color: '#FF4500', letter: 'r/' },
  { name: 'X', url: 'https://x.com', color: '#000', letter: '𝕏' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', color: '#F48024', letter: '{}' },
  { name: 'MDN', url: 'https://developer.mozilla.org', color: '#1B1B1B', letter: 'M' },
];

const frequentlyVisited = [
  { name: 'Claude', color: '#D97706', letter: 'C' },
  { name: 'Hacker News', color: '#FF6600', letter: 'Y' },
  { name: 'Tailwind CSS', color: '#38BDF8', letter: '~' },
  { name: 'npm', color: '#CB3837', letter: 'n' },
];

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

export default function Safari() {
  const [tabs, setTabs] = useState([{ id: 1, title: 'Start Page', url: '', loadedUrl: '', error: false }]);
  const [activeTab, setActiveTab] = useState(1);
  const nextId = useRef(2);
  const urlInputRef = useRef(null);
  const [urlEditing, setUrlEditing] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const tab = tabs.find(t => t.id === activeTab) || tabs[0];

  const updateTab = useCallback((id, updates) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const navigate = useCallback((targetUrl) => {
    let finalUrl = targetUrl;
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
    const domain = getDomain(finalUrl);
    updateTab(activeTab, { url: finalUrl, loadedUrl: finalUrl, title: domain, error: false });
    setUrlEditing(false);
  }, [activeTab, updateTab]);

  const goHome = useCallback(() => {
    updateTab(activeTab, { url: '', loadedUrl: '', title: 'Start Page', error: false });
    setUrlEditing(false);
  }, [activeTab, updateTab]);

  const addTab = useCallback(() => {
    const id = nextId.current++;
    setTabs(prev => [...prev, { id, title: 'Start Page', url: '', loadedUrl: '', error: false }]);
    setActiveTab(id);
  }, []);

  const closeTab = useCallback((id, e) => {
    e?.stopPropagation();
    if (tabs.length <= 1) {
      updateTab(id, { title: 'Start Page', url: '', loadedUrl: '', error: false });
      return;
    }
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTab === id) {
      setActiveTab(remaining[remaining.length - 1].id);
    }
  }, [tabs, activeTab, updateTab]);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlDraft.trim()) navigate(urlDraft.trim());
  };

  const startEditUrl = () => {
    setUrlEditing(true);
    setUrlDraft(tab.url || '');
    setTimeout(() => urlInputRef.current?.select(), 10);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#1e1e1e' }}>
      {/* Tab Bar */}
      <div
        className="flex items-center h-[30px] gap-[1px] px-1 shrink-0"
        style={{ background: 'rgba(50,50,50,0.6)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-[1px] flex-1 overflow-hidden">
          {tabs.map(t => (
            <div
              key={t.id}
              className="group flex items-center gap-1.5 h-[24px] px-2.5 rounded-[6px] text-[11px] min-w-0 max-w-[200px] cursor-default transition-colors"
              style={{
                background: activeTab === t.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
              onMouseEnter={e => { if (activeTab !== t.id) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (activeTab !== t.id) e.currentTarget.style.background = 'transparent'; }}
              onClick={() => setActiveTab(t.id)}
            >
              {/* Favicon placeholder */}
              {t.loadedUrl ? (
                <div className="w-[12px] h-[12px] rounded-[2px] flex items-center justify-center text-[7px] font-bold shrink-0"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  {t.title?.[0]?.toUpperCase() || '?'}
                </div>
              ) : (
                <SFSymbol name="globe" size={11} color="rgba(255,255,255,0.4)" />
              )}
              <span className="truncate flex-1">{t.title}</span>
              <button
                className="w-[14px] h-[14px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-white/15 shrink-0"
                onClick={e => closeTab(t.id, e)}
              >
                <SFSymbol name="xmark" size={7} weight={2} />
              </button>
            </div>
          ))}
        </div>
        {/* New tab */}
        <button
          className="w-[24px] h-[24px] rounded-[5px] flex items-center justify-center text-white/40 hover:bg-white/8 hover:text-white/70 cursor-default shrink-0"
          onClick={addTab}
        >
          <SFSymbol name="plus" size={12} weight={1.8} />
        </button>
      </div>

      {/* Address Bar & Navigation */}
      <div
        className="flex items-center gap-2 h-[36px] px-2 shrink-0"
        style={{ background: 'rgba(45,45,45,0.6)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        <MacToolbarButton icon="sidebar.left" size={26} />
        <div className="flex items-center gap-0.5">
          <MacToolbarButton icon="chevron.left" onClick={goHome} size={26} label="Back" />
          <MacToolbarButton icon="chevron.right" size={26} label="Forward" />
        </div>

        {/* URL Bar */}
        {urlEditing ? (
          <form onSubmit={handleUrlSubmit} className="flex-1">
            <input
              ref={urlInputRef}
              type="text"
              value={urlDraft}
              onChange={e => setUrlDraft(e.target.value)}
              onBlur={() => setUrlEditing(false)}
              className="w-full h-[26px] rounded-lg bg-white/10 border border-[#0a84ff]/50 px-3 text-[12px] text-white text-center outline-none"
              placeholder="Search or enter website name"
              autoFocus
              spellCheck={false}
            />
          </form>
        ) : (
          <button
            className="flex-1 h-[26px] rounded-lg flex items-center justify-center px-3 text-[12px] cursor-text transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}
            onClick={startEditUrl}
          >
            {tab.loadedUrl ? (
              <div className="flex items-center gap-1.5">
                <SFSymbol name="lock.shield" size={10} color="rgba(255,255,255,0.35)" />
                <span className="text-white/60">{getDomain(tab.loadedUrl)}</span>
              </div>
            ) : (
              <span className="text-white/25">Search or enter website name</span>
            )}
          </button>
        )}

        <MacToolbarButton icon="square.and.arrow.up" size={26} label="Share" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab.loadedUrl ? (
          tab.error ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40 gap-2">
              <SFSymbol name="exclamationmark.triangle" size={48} color="rgba(255,255,255,0.15)" />
              <span className="text-[16px] font-medium text-white/50">Cannot Open Page</span>
              <span className="text-[12px] text-white/30 max-w-[300px] text-center">
                Safari cannot open the page because the site does not allow framing.
              </span>
              <button
                className="mt-2 text-[12px] text-[#0a84ff] hover:underline cursor-default"
                onClick={goHome}
              >
                Go to Start Page
              </button>
            </div>
          ) : (
            <iframe
              src={tab.loadedUrl}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onError={() => updateTab(activeTab, { error: true })}
              title="Safari Browser"
            />
          )
        ) : (
          /* Start Page */
          <div className="h-full overflow-y-auto">
            <div className="max-w-[600px] mx-auto pt-8 pb-12 px-6">
              {/* Favorites */}
              <h3 className="text-[11px] text-white/35 font-semibold uppercase tracking-wider mb-3">Favorites</h3>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {defaultFavorites.map(fav => (
                  <button
                    key={fav.name}
                    className="flex flex-col items-center gap-2 p-2 rounded-xl cursor-default hover:bg-white/5 transition-colors"
                    onClick={() => navigate(fav.url)}
                  >
                    <div
                      className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center text-white text-[18px] font-semibold"
                      style={{ background: fav.color, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                    >
                      {fav.letter || fav.name[0]}
                    </div>
                    <span className="text-[11px] text-white/50">{fav.name}</span>
                  </button>
                ))}
              </div>

              {/* Frequently Visited */}
              <h3 className="text-[11px] text-white/35 font-semibold uppercase tracking-wider mb-3">Frequently Visited</h3>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {frequentlyVisited.map(site => (
                  <div key={site.name} className="flex flex-col items-center gap-2 p-2 rounded-xl cursor-default hover:bg-white/5 transition-colors">
                    <div
                      className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center text-white text-[16px] font-semibold"
                      style={{ background: site.color, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                    >
                      {site.letter}
                    </div>
                    <span className="text-[11px] text-white/50">{site.name}</span>
                  </div>
                ))}
              </div>

              {/* Privacy Report */}
              <h3 className="text-[11px] text-white/35 font-semibold uppercase tracking-wider mb-3">Privacy Report</h3>
              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)' }}
              >
                <SFSymbol name="shield.fill" size={24} color="#0a84ff" />
                <div>
                  <p className="text-[13px] text-white/70 leading-relaxed">
                    In the last seven days, Safari has prevented <span className="text-white font-medium">14 trackers</span> from profiling you across the websites you visit.
                  </p>
                </div>
              </div>

              {/* Reading List teaser */}
              <div className="mt-6 rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <SFSymbol name="sparkles" size={20} color="rgba(255,255,255,0.15)" className="mx-auto" />
                <p className="text-[12px] text-white/20 mt-2">Your Reading List is empty</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
