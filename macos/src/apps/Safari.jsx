import { useCallback, useRef, useState, useEffect } from 'react';
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
  { name: 'Claude', color: '#D97706', letter: 'C', subtitle: 'AI workspace' },
  { name: 'Hacker News', color: '#FF6600', letter: 'Y', subtitle: 'Daily reading' },
  { name: 'Tailwind CSS', color: '#38BDF8', letter: '~', subtitle: 'Design system' },
  { name: 'npm', color: '#CB3837', letter: 'n', subtitle: 'Packages' },
];

const readingList = [
  { title: 'The web platform in 2026', domain: 'webkit.org', time: '8 min read' },
  { title: 'Design notes for the modern browser UI', domain: 'developer.chrome.com', time: '5 min read' },
];

// Sites that block iframes even through proxy — open externally
const EXTERNAL_ONLY_SITES = new Set([
  'linkedin.com', 'www.linkedin.com',
  'x.com', 'twitter.com', 'www.twitter.com',
  'instagram.com', 'www.instagram.com',
  'facebook.com', 'www.facebook.com',
  'tiktok.com', 'www.tiktok.com',
  // Google works through proxy with frame-bypass
  'netflix.com', 'www.netflix.com',
  'spotify.com', 'www.spotify.com',
  'discord.com', 'www.discord.com',
]);

function shouldOpenExternally(url) {
  if (!url) return false;
  const host = getDomain(url).toLowerCase();
  return EXTERNAL_ONLY_SITES.has(host);
}

function getProxiedUrl(url) {
  if (!url) return '';

  // Local URLs don't need proxy
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return url;
  }

  // Use our own Vercel API proxy
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function normalizeUrl(input) {
  const value = input.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  // Check if it looks like a URL (has a dot and no spaces, or is localhost)
  const looksLikeUrl = (value.includes('.') && !value.includes(' ')) ||
                       value.startsWith('localhost');

  if (looksLikeUrl) {
    return `https://${value}`;
  }

  // Otherwise treat as a Google search query
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

function createTab(id, initialUrl = '') {
  const url = initialUrl;
  return {
    id,
    title: url ? getDomain(url) : 'Start Page',
    url,
    loadedUrl: url,
    error: false,
    history: [url],
    historyIndex: 0,
  };
}

function StartSection({ title, children, className = '' }) {
  return (
    <section className={`mb-10 ${className}`}>
      <div className="text-[13px] text-white/60 font-semibold mb-3 ml-2 tracking-wide">{title}</div>
      {children}
    </section>
  );
}

function StartTile({ item, onClick }) {
  return (
    <button
      className="flex flex-col items-center gap-2.5 rounded-[16px] p-3 cursor-default transition-all duration-150 hover:bg-white/5"
      onClick={onClick}
    >
      <div
        className="w-[68px] h-[68px] rounded-[16px] flex items-center justify-center text-white text-[28px] font-medium shrink-0 shadow-sm border border-white/10 relative overflow-hidden group-hover:scale-105 transition-transform"
        style={{ background: item.color, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
      >
        <span style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{item.letter || item.name[0]}</span>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
      <span className="text-[12px] text-white/80 font-medium w-full text-center px-1 truncate tracking-tight">{item.name ?? item.title}</span>
    </button>
  );
}

export default function Safari({ windowData }) {
  const [tabs, setTabs] = useState([createTab(1, windowData?.payload?.url || '')]);
  const [activeTab, setActiveTab] = useState(1);
  const nextId = useRef(2);
  const urlInputRef = useRef(null);
  const [urlEditing, setUrlEditing] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const tab = tabs.find(t => t.id === activeTab) || tabs[0];

  const updateTab = useCallback((id, updater) => {
    setTabs(prev => prev.map(t => {
      if (t.id !== id) return t;
      return typeof updater === 'function' ? updater(t) : { ...t, ...updater };
    }));
  }, []);

  const applyUrlState = useCallback((url) => {
    return {
      url,
      loadedUrl: url,
      title: url ? getDomain(url) : 'Start Page',
      error: false,
    };
  }, []);

  const navigate = useCallback((targetUrl) => {
    const finalUrl = normalizeUrl(targetUrl);
    updateTab(activeTab, prev => {
      const history = prev.history.slice(0, prev.historyIndex + 1);
      if (history[history.length - 1] !== finalUrl) {
        history.push(finalUrl);
      }
      const nextIndex = history.length - 1;
      return {
        ...prev,
        ...applyUrlState(finalUrl),
        history,
        historyIndex: nextIndex,
      };
    });
    setUrlEditing(false);
  }, [activeTab, applyUrlState, updateTab]);

  const goBack = useCallback(() => {
    updateTab(activeTab, prev => {
      if (prev.historyIndex <= 0) return prev;
      const nextIndex = prev.historyIndex - 1;
      const url = prev.history[nextIndex] || '';
      return {
        ...prev,
        ...applyUrlState(url),
        historyIndex: nextIndex,
      };
    });
    setUrlEditing(false);
  }, [activeTab, applyUrlState, updateTab]);

  const goForward = useCallback(() => {
    updateTab(activeTab, prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const nextIndex = prev.historyIndex + 1;
      const url = prev.history[nextIndex] || '';
      return {
        ...prev,
        ...applyUrlState(url),
        historyIndex: nextIndex,
      };
    });
    setUrlEditing(false);
  }, [activeTab, applyUrlState, updateTab]);

  const openStartPage = useCallback(() => {
    navigate('');
  }, [navigate]);

  const addTab = useCallback(() => {
    const id = nextId.current++;
    setTabs(prev => [...prev, createTab(id)]);
    setActiveTab(id);
  }, []);

  const closeTab = useCallback((id, e) => {
    e?.stopPropagation();
    if (tabs.length <= 1) {
      setTabs([createTab(id)]);
      setActiveTab(id);
      return;
    }

    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTab === id) {
      setActiveTab(remaining[remaining.length - 1].id);
    }
  }, [tabs, activeTab]);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlDraft.trim()) navigate(urlDraft.trim());
  };

  const startEditUrl = () => {
    setUrlEditing(true);
    setUrlDraft(tab.url || '');
    setTimeout(() => urlInputRef.current?.select(), 10);
  };

  useEffect(() => {
    if (windowData?.payload?.url) {
      navigate(windowData.payload.url);
    }
  }, [windowData?.payload, navigate]);

  const canGoBack = tab.historyIndex > 0;
  const canGoForward = tab.historyIndex < tab.history.length - 1;
  const showBlockedPage = Boolean(tab.loadedUrl) && tab.error;
  const showExternalPage = Boolean(tab.loadedUrl) && shouldOpenExternally(tab.loadedUrl);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Tab Bar */}
      <div
        className="flex items-center h-[36px] gap-[2px] px-2 shrink-0 relative z-20"
        style={{ background: 'rgba(40,40,40,0.9)', borderBottom: '0.5px solid rgba(0,0,0,0.8)' }}
      >
        <div className="flex items-center gap-[2px] flex-1 overflow-hidden h-[28px]">
          {tabs.map(t => (
            <button
              key={t.id}
              className="group flex flex-col justify-center px-3 rounded-[6px] min-w-[140px] max-w-[200px] h-full cursor-default transition-all relative"
              style={{
                background: activeTab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                boxShadow: activeTab === t.id ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
              }}
              onMouseEnter={e => { if (activeTab !== t.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (activeTab !== t.id) e.currentTarget.style.background = 'transparent'; }}
              onClick={() => setActiveTab(t.id)}
            >
              <div className="flex items-center justify-between w-full h-[18px]">
                <div className="flex items-center gap-2 min-w-0">
                  {t.loadedUrl ? (
                    <img src={`https://www.google.com/s2/favicons?sz=32&domain=${getDomain(t.loadedUrl)}`} alt="" className="w-[12px] h-[12px] shrink-0 opacity-80" onError={e => e.currentTarget.style.display = 'none'} />
                  ) : (
                    <SFSymbol name="globe" size={11} color="rgba(255,255,255,0.5)" />
                  )}
                  <span className={`truncate text-[11px] ${activeTab === t.id ? 'text-white' : 'text-white/60'}`}>{t.title}</span>
                </div>
                <div
                  className="w-[16px] h-[16px] rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 ml-2 shrink-0 transition-opacity"
                  onClick={e => closeTab(t.id, e)}
                >
                  <SFSymbol name="xmark" size={8} weight={2} color="rgba(255,255,255,0.7)" />
                </div>
              </div>
            </button>
          ))}
        </div>
        <button
          aria-label="New Tab"
          className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white/90 shrink-0 mx-1 transition-colors"
          onClick={addTab}
        >
          <SFSymbol name="plus" size={12} weight={1.5} />
        </button>
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-3 h-[44px] px-3 shrink-0 relative z-10"
        style={{ background: 'rgba(40,40,40,0.98)', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}
      >
        <MacToolbarButton icon="sidebar.left" size={26} />
        <div className="flex items-center gap-0.5">
          <MacToolbarButton icon="chevron.left" onClick={canGoBack ? goBack : undefined} size={26} label="Back" active={canGoBack} />
          <MacToolbarButton icon="chevron.right" onClick={canGoForward ? goForward : undefined} size={26} label="Forward" active={canGoForward} />
        </div>

        {urlEditing ? (
          <form onSubmit={handleUrlSubmit} className="flex-1 flex justify-center">
            <input
              ref={urlInputRef}
              aria-label="Website URL"
              type="text"
              value={urlDraft}
              onChange={e => setUrlDraft(e.target.value)}
              onBlur={() => setUrlEditing(false)}
              className="w-full max-w-[600px] h-[28px] rounded-[8px] bg-white/10 border border-[#0A84FF] shadow-[0_0_0_2px_rgba(10,132,255,0.3)] px-3 text-[13px] text-white outline-none"
              placeholder="Search or enter website name"
              autoFocus
              spellCheck={false}
            />
          </form>
        ) : (
          <div className="flex-1 flex justify-center">
            <button
              className="w-full max-w-[600px] h-[28px] rounded-[8px] flex items-center justify-center px-3 text-[13px] cursor-text transition-colors shadow-inner"
              style={{ background: 'rgba(0,0,0,0.3)', border: '0.5px solid rgba(255,255,255,0.08)' }}
              onClick={startEditUrl}
            >
              {tab.loadedUrl ? (
                <div className="flex items-center gap-1.5 focus:outline-none">
                  <SFSymbol name="lock.fill" size={10} color="rgba(255,255,255,0.4)" />
                  <span className="text-white/80">{getDomain(tab.loadedUrl)}</span>
                </div>
              ) : (
                <span className="text-white/30">Search or enter website name</span>
              )}
            </button>
          </div>
        )}

        <MacToolbarButton icon="square.and.arrow.up" size={26} label="Share" />
      </div>

      <div className="flex-1 overflow-hidden relative">
        {tab.loadedUrl ? (
          showExternalPage ? (
            <div className="flex flex-col items-center justify-center h-full text-white/42 gap-4 px-6 relative z-10">
              <div className="w-[80px] h-[80px] rounded-[20px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                <img
                  src={`https://www.google.com/s2/favicons?sz=64&domain=${getDomain(tab.loadedUrl)}`}
                  alt=""
                  className="w-[48px] h-[48px] rounded-[8px]"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="text-center">
                <div className="text-[18px] font-semibold text-white/90 mb-1">{getDomain(tab.loadedUrl)}</div>
                <div className="text-[13px] text-white/40 max-w-[300px] truncate">{tab.loadedUrl}</div>
              </div>
              <p className="text-[13px] text-white/50 max-w-[360px] text-center leading-relaxed mt-2">
                This site cannot be displayed in an embedded view. Open it in your browser for the full experience.
              </p>
              <button
                className="mt-4 px-6 py-2.5 rounded-[10px] text-[14px] font-medium text-white shadow-lg transition-all hover:scale-105"
                style={{ background: 'linear-gradient(180deg, #2E81FF 0%, #1062E0 100%)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                onClick={() => window.open(tab.loadedUrl, '_blank')}
              >
                Open in Browser
              </button>
              <button
                className="text-[12px] text-white/40 hover:text-white/60 transition-colors mt-2"
                onClick={openStartPage}
              >
                Return to Start Page
              </button>
            </div>
          ) : showBlockedPage ? (
            <div className="flex flex-col items-center justify-center h-full text-white/42 gap-3 px-6 relative z-10">
              <div className="w-[64px] h-[64px] rounded-[18px] border border-white/8 bg-white/5 flex items-center justify-center shadow-lg">
                <SFSymbol name="exclamationmark.triangle.fill" size={30} color="rgba(255,255,255,0.16)" />
              </div>
              <span className="text-[16px] font-medium text-white/60">Safari encountered a rendering error</span>
              <span className="text-[12px] text-white/30 max-w-[340px] text-center leading-relaxed">
                The webpage failed to load completely or aborted the network connection.
              </span>
              <div className="flex items-center gap-2 pt-4">
                <button
                  className="px-4 py-2 rounded-[8px] text-[12px] font-medium text-white/82 bg-white/6 border border-white/8 hover:bg-white/10 transition-colors"
                  onClick={goBack}
                >
                  Go Back
                </button>
                <button
                  className="px-4 py-2 rounded-[8px] text-[12px] font-medium text-white shadow-sm transition-colors"
                  style={{ background: 'linear-gradient(180deg, #2E81FF 0%, #1062E0 100%)', border: '0.5px solid rgba(0,0,0,0.2)' }}
                  onClick={() => window.open(tab.loadedUrl, '_blank')}
                >
                  Open in External Browser
                </button>
              </div>
            </div>
          ) : (
            <iframe
              key={tab.loadedUrl}
              src={getProxiedUrl(tab.loadedUrl)}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups opacity-100 transition-opacity"
              onError={() => updateTab(tab.id, { error: true })}
              onLoad={() => updateTab(tab.id, { error: false })}
              title="Safari Browser"
            />
          )
        ) : (
          <div className="h-full overflow-y-auto relative">
            {/* Subtle macOS wallpaper bleed effect background */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at 50% 0%, #0a84ff 0%, transparent 60%)' }} />
            
            <div className="max-w-[760px] mx-auto pt-12 pb-16 px-6 relative z-10">
              <StartSection title="Favorites">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-y-6 gap-x-2">
                  {defaultFavorites.map(fav => (
                    <StartTile key={fav.name} item={fav} onClick={() => navigate(fav.url)} />
                  ))}
                </div>
              </StartSection>

              <StartSection title="Frequently Visited">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-y-6 gap-x-2 mt-4">
                  {frequentlyVisited.map(site => (
                    <StartTile key={site.name} item={site} onClick={() => navigate(`https://${site.name.toLowerCase().replace(/\s+/g, '')}.com`)} />
                  ))}
                </div>
              </StartSection>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                <StartSection title="Privacy Report">
                  <div className="flex items-start gap-4 p-5 rounded-[16px] bg-white/5 border border-white/5 shadow-sm hover:bg-white/10 transition-colors cursor-default">
                    <div className="w-[42px] h-[42px] rounded-[12px] bg-[#0A84FF]/20 flex items-center justify-center shrink-0 border border-[#0A84FF]/30 shadow-inner">
                      <SFSymbol name="shield.fill" size={20} color="#0A84FF" />
                    </div>
                    <div className="min-w-0 mt-0.5">
                      <p className="text-[13px] text-white/80 leading-relaxed font-medium">
                        In the last seven days, Safari has prevented <span className="text-white font-bold">14 trackers</span> from profiling you.
                      </p>
                      <p className="text-[11px] text-white/40 mt-1.5 font-medium">Intelligent Tracking Prevention is on.</p>
                    </div>
                  </div>
                </StartSection>

                <StartSection title="Reading List">
                  <div className="flex flex-col gap-3">
                    {readingList.map(item => (
                      <div key={item.title} className="rounded-[16px] bg-white/5 border border-white/5 p-4 hover:bg-white/10 transition-colors cursor-default">
                        <div className="text-[13px] text-white/90 font-medium leading-tight truncate">{item.title}</div>
                        <div className="mt-2 text-[11px] text-white/40 flex items-center justify-between">
                          <span>{item.domain}</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </StartSection>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
