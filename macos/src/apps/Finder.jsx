import { useCallback, useEffect, useMemo, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import {
  MacSegmentedControl, MacSearchField, MacToolbarButton,
  MacSidebarItem, MacSidebarSection,
} from '../components/ui/MacControls';
import {
  getByPath, listDir, joinPath, parentPath, homePath,
  sidebarFavorites, sidebarTags, formatSize, formatDate, fileKindLabel,
} from '../fs/vfs';

const SIDEBAR_ICONS = {
  desktop: 'display',
  documents: 'folder',
  folder: 'folder',
  pictures: 'photo',
  downloads: 'arrow.down.circle',
  home: 'house',
  drive: 'internaldrive',
};

function iconForNode(node) {
  if (node.type === 'dir') return { name: 'folder.fill', color: '#64ACFF' };
  switch (node.kind) {
    case 'md':
    case 'text':
      return { name: 'doc.text.fill', color: '#8E8E93' };
    case 'image':
      return { name: 'photo.fill', color: '#FFB340' };
    case 'pdf':
      return { name: 'doc.richtext.fill', color: '#FF453A' };
    default:
      return { name: 'doc.fill', color: '#8E8E93' };
  }
}

function splitPathParts(path) {
  if (!path || path === '~' || path === '~/') return ['Home'];
  const clean = path.replace(/^~\/?/, '');
  if (!clean) return ['Home'];
  return ['Home', ...clean.split('/')];
}

function openFileAction(node, path, onAppLaunch) {
  if (node.type !== 'file') return;
  if (node.kind === 'md' || node.kind === 'text') {
    onAppLaunch?.('textedit', node.name, { vfsPath: path });
  } else if (node.kind === 'image' || node.kind === 'pdf') {
    onAppLaunch?.('preview', node.name, { vfsPath: path });
  } else {
    onAppLaunch?.('textedit', node.name, { vfsPath: path });
  }
}

function FileInspector({ node, path }) {
  if (!node) {
    return (
      <div className="w-[240px] shrink-0 flex flex-col p-4 text-[12px] text-[#86868b]" style={{ borderLeft: '0.5px solid rgba(0,0,0,0.08)', background: 'rgba(246,246,248,0.6)' }}>
        <div className="rounded-[14px] px-3 py-5 text-center" style={{ background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          <div className="text-black/70 font-medium mb-1">No selection</div>
          <div className="text-[11px] leading-relaxed">Choose an item to inspect.</div>
        </div>
      </div>
    );
  }
  const icon = iconForNode(node);
  return (
    <div className="w-[260px] shrink-0 flex flex-col" style={{ borderLeft: '0.5px solid rgba(0,0,0,0.08)', background: 'rgba(246,246,248,0.6)' }}>
      <div className="p-4" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-center h-[140px] rounded-[16px] overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          {node.kind === 'image' && node.contentUrl ? (
            <img src={node.contentUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <SFSymbol name={icon.name} size={72} color={icon.color} />
          )}
        </div>
        <div className="mt-3 text-[13px] text-black font-medium text-center break-all">
          {node.name}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 text-[12px] text-black/80">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[#86868b] mb-2 font-semibold">Info</div>
        <div className="space-y-2">
          <Row k="Kind" v={fileKindLabel(node)} />
          <Row k="Size" v={formatSize(node.size)} />
          <Row k="Modified" v={formatDate(node.modified)} />
          <Row k="Where" v={path} mono />
        </div>
        {node.meta && (
          <>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#86868b] mt-5 mb-2 font-semibold">EXIF</div>
            <div className="space-y-2">
              {node.meta.camera && <Row k="Camera" v={node.meta.camera} />}
              {node.meta.lens && <Row k="Lens" v={node.meta.lens} />}
              {node.meta.iso && <Row k="ISO" v={node.meta.iso} />}
              {node.meta.shutter && <Row k="Shutter" v={node.meta.shutter} />}
              {node.meta.aperture && <Row k="Aperture" v={node.meta.aperture} />}
              {node.meta.date && <Row k="Date" v={node.meta.date} />}
              {node.meta.location && <Row k="Location" v={node.meta.location} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, mono }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#86868b] shrink-0">{k}</span>
      <span className={`text-right truncate text-black/85 ${mono ? 'font-mono text-[11px]' : ''}`} title={String(v)}>{v}</span>
    </div>
  );
}

export default function Finder({ windowData, onAppLaunch }) {
  const [path, setPath] = useState(windowData?.payload?.vfsPath || '~/Documents');
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('icon');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [history, setHistory] = useState([path]);
  const [historyIdx, setHistoryIdx] = useState(0);

  useEffect(() => {
    const nextPath = windowData?.payload?.vfsPath;
    if (!nextPath || nextPath === path) return;
    setPath(nextPath);
    setHistory([nextPath]);
    setHistoryIdx(0);
    setSelected(null);
    setSearch('');
  }, [windowData?.payload?.vfsPath]);

  const currentNode = useMemo(() => getByPath(path) || getByPath('~'), [path]);
  const isDir = currentNode?.type === 'dir';

  const entries = useMemo(() => {
    if (!isDir) return [];
    const list = currentNode.children;
    const q = search.trim().toLowerCase();
    const filtered = !q ? list : list.filter(n => n.name.toLowerCase().includes(q));
    return [...filtered].sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'kind') cmp = (a.kind || 'dir').localeCompare(b.kind || 'dir');
      else if (sortBy === 'size') cmp = (a.size || 0) - (b.size || 0);
      else if (sortBy === 'modified') cmp = (a.modified || '').localeCompare(b.modified || '');
      return sortAsc ? cmp : -cmp;
    });
  }, [currentNode, isDir, search, sortBy, sortAsc]);

  const selectedNode = useMemo(
    () => selected ? entries.find(e => e.name === selected) : null,
    [selected, entries]
  );

  const navigate = useCallback((newPath) => {
    const next = history.slice(0, historyIdx + 1);
    if (next[next.length - 1] !== newPath) next.push(newPath);
    setPath(newPath);
    setHistory(next);
    setHistoryIdx(next.length - 1);
    setSelected(null);
    setSearch('');
  }, [history, historyIdx]);

  const goBack = useCallback(() => {
    if (historyIdx > 0) {
      const i = historyIdx - 1;
      setHistoryIdx(i);
      setPath(history[i]);
      setSelected(null);
    }
  }, [history, historyIdx]);

  const goForward = useCallback(() => {
    if (historyIdx < history.length - 1) {
      const i = historyIdx + 1;
      setHistoryIdx(i);
      setPath(history[i]);
      setSelected(null);
    }
  }, [history, historyIdx]);

  const goUp = useCallback(() => {
    const parent = parentPath(path);
    if (parent !== path) navigate(parent);
  }, [navigate, path]);

  const openItem = useCallback((node) => {
    if (node.type === 'dir') {
      navigate(joinPath(path, node.name));
    } else {
      openFileAction(node, joinPath(path, node.name), onAppLaunch);
    }
  }, [navigate, onAppLaunch, path]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortAsc(s => !s);
    else { setSortBy(col); setSortAsc(true); }
  };
  const sortArrow = (col) => sortBy === col ? (
    <SFSymbol name={sortAsc ? 'chevron.up' : 'chevron.down'} size={8} color="rgba(0,0,0,0.5)" />
  ) : null;

  const breadcrumbs = splitPathParts(path);

  return (
    <div className="flex h-full text-black" style={{ background: '#ffffff' }}>
      {/* Sidebar */}
      <div
        className="w-[190px] shrink-0 flex flex-col pt-2 pb-1 overflow-y-auto"
        style={{ background: 'rgba(235,235,240,0.85)', backdropFilter: 'blur(30px)', borderRight: '0.5px solid rgba(0,0,0,0.08)' }}
      >
        <MacSidebarSection title="Favorites" tone="light">
          {sidebarFavorites.map(item => {
            const active = path === item.path;
            return (
              <MacSidebarItem
                key={item.path}
                tone="light-source"
                icon={SIDEBAR_ICONS[item.icon] || 'folder'}
                iconColor={active ? '#ffffff' : '#007AFF'}
                label={item.label}
                selected={active}
                onClick={() => navigate(item.path)}
              />
            );
          })}
        </MacSidebarSection>
        <MacSidebarSection title="Tags" tone="light">
          {sidebarTags.map(tag => (
            <MacSidebarItem
              key={tag.label}
              tone="light"
              icon={<div className="w-[10px] h-[10px] rounded-full" style={{ background: tag.color }} />}
              label={tag.label}
              selected={false}

            />
          ))}
        </MacSidebarSection>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#ffffff' }}>
        {/* Toolbar */}
        <div className="h-[46px] flex items-center gap-2 px-3.5 shrink-0" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: 'rgba(246,246,248,0.9)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-0.5">
            <MacToolbarButton icon="chevron.left" onClick={goBack} label="Back" size={26} active={historyIdx > 0} tone="light" />
            <MacToolbarButton icon="chevron.right" onClick={goForward} label="Forward" size={26} active={historyIdx < history.length - 1} tone="light" />
            <MacToolbarButton icon="chevron.up" onClick={goUp} label="Enclosing Folder" size={26} tone="light" />
          </div>
          <span className="text-[14px] text-black font-semibold ml-1 truncate">
            {breadcrumbs[breadcrumbs.length - 1]}
          </span>
          <div className="flex-1" />
          <MacSegmentedControl
            size="small"
            options={[
              { value: 'icon', icon: 'square.grid.2x2' },
              { value: 'list', icon: 'list.bullet' },
              { value: 'column', icon: 'rectangle.split.3x1' },
              { value: 'gallery', icon: 'photo' },
            ]}
            value={viewMode}
            onChange={setViewMode}
            tone="light"
          />
          <MacSearchField value={search} onChange={setSearch} className="w-[150px]" tone="light" />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden" onClick={() => setSelected(null)}>
          {!isDir ? (
            <div className="flex items-center justify-center h-full text-[#86868b] text-[13px]">Not a folder</div>
          ) : viewMode === 'icon' ? (
            <div className="flex h-full">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
                  {entries.map(node => {
                    const icon = iconForNode(node);
                    const isSel = selected === node.name;
                    return (
                      <button
                        key={node.name}
                        className="flex flex-col items-center gap-1 p-2 rounded-[10px] cursor-default"
                        style={{ background: isSel ? 'rgba(10,132,255,0.12)' : 'transparent' }}
                        onClick={(e) => { e.stopPropagation(); setSelected(node.name); }}
                        onDoubleClick={() => openItem(node)}
                      >
                        <div className="w-[62px] h-[62px] rounded-[12px] flex items-center justify-center overflow-hidden" style={{ background: node.kind === 'image' ? 'rgba(0,0,0,0.06)' : 'transparent' }}>
                          {node.kind === 'image' && node.contentUrl ? (
                            <img src={node.contentUrl} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <SFSymbol name={icon.name} size={52} color={icon.color} />
                          )}
                        </div>
                        <span
                          className="text-[11px] text-center leading-tight max-w-[88px] line-clamp-2 px-1 rounded"
                          style={{
                            color: isSel ? '#fff' : 'rgba(0,0,0,0.88)',
                            background: isSel ? '#0A84FF' : 'transparent',
                            padding: '1px 5px',
                            wordBreak: 'break-word',
                          }}
                        >{node.name}</span>
                      </button>
                    );
                  })}
                  {entries.length === 0 && (
                    <div className="col-span-full text-center text-[#86868b] text-[12px] mt-10">Empty folder</div>
                  )}
                </div>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex h-full min-h-0">
              <div className="flex-1 min-w-0 overflow-y-auto text-[12px]">
                <div className="flex items-center h-[26px] px-3.5 text-[#6e6e73] font-medium sticky top-0 z-10" style={{ background: 'rgba(246,246,248,0.95)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <button className="flex items-center gap-1 w-[46%] text-left cursor-default hover:text-black" onClick={() => toggleSort('name')}>Name {sortArrow('name')}</button>
                  <button className="flex items-center gap-1 w-[22%] text-left cursor-default hover:text-black" onClick={() => toggleSort('modified')}>Date Modified {sortArrow('modified')}</button>
                  <button className="flex items-center gap-1 w-[14%] text-left cursor-default hover:text-black" onClick={() => toggleSort('size')}>Size {sortArrow('size')}</button>
                  <button className="flex items-center gap-1 w-[18%] text-left cursor-default hover:text-black" onClick={() => toggleSort('kind')}>Kind {sortArrow('kind')}</button>
                </div>
                {entries.map((node, i) => {
                  const icon = iconForNode(node);
                  const isSel = selected === node.name;
                  return (
                    <button
                      key={node.name}
                      className="flex items-center h-[28px] px-3.5 w-full text-left cursor-default"
                      style={{
                        background: isSel ? '#0A84FF' : i % 2 === 1 ? 'rgba(0,0,0,0.02)' : 'transparent',
                        color: isSel ? '#fff' : 'rgba(0,0,0,0.85)',
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelected(node.name); }}
                      onDoubleClick={() => openItem(node)}
                    >
                      <div className="flex items-center gap-2 w-[46%] truncate text-[13px]">
                        <SFSymbol name={icon.name} size={15} color={isSel ? '#fff' : icon.color} />
                        <span className="truncate">{node.name}</span>
                      </div>
                      <span className="w-[22%] truncate" style={{ opacity: isSel ? 0.9 : 0.6 }}>{formatDate(node.modified)}</span>
                      <span className="w-[14%]" style={{ opacity: isSel ? 0.9 : 0.6 }}>{formatSize(node.size)}</span>
                      <span className="w-[18%] truncate" style={{ opacity: isSel ? 0.9 : 0.6 }}>{fileKindLabel(node)}</span>
                    </button>
                  );
                })}
                {entries.length === 0 && (
                  <div className="text-center text-[#86868b] text-[12px] mt-10 px-4">Empty folder</div>
                )}
              </div>
              <FileInspector node={selectedNode} path={joinPath(path, selectedNode?.name || '')} />
            </div>
          ) : viewMode === 'column' ? (
            <ColumnView path={path} selected={selected} setSelected={setSelected} onNavigate={navigate} onOpen={openItem} />
          ) : (
            <GalleryView entries={entries} selected={selected} setSelected={setSelected} onOpen={openItem} />
          )}
        </div>

        {/* Status bar */}
        <div className="h-[28px] flex items-center gap-2 px-3.5 shrink-0 text-[11px] text-[#6e6e73]" style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)', background: 'rgba(246,246,248,0.9)' }}>
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {breadcrumbs.map((part, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i === 0 ? (
                  <SFSymbol name="house.fill" size={11} color="rgba(0,0,0,0.5)" />
                ) : (
                  <SFSymbol name="chevron.right" size={7} color="rgba(0,0,0,0.3)" />
                )}
                <span className={`whitespace-nowrap ${i === breadcrumbs.length - 1 ? 'text-black/85 font-medium' : ''}`}>{part}</span>
              </span>
            ))}
          </div>
          <div className="flex-1" />
          <div className="whitespace-nowrap text-right text-[#86868b]">
            {entries.length} item{entries.length !== 1 ? 's' : ''}
            {selected ? ' · 1 selected' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColumnView({ path, selected, setSelected, onNavigate, onOpen }) {
  const pieces = path.replace(/^~\/?/, '').split('/').filter(Boolean);
  const paths = ['~', ...pieces.map((_, i) => '~/' + pieces.slice(0, i + 1).join('/'))];

  return (
    <div className="flex h-full min-h-0 overflow-x-auto">
      {paths.map((p, i) => {
        const node = getByPath(p);
        if (!node || node.type !== 'dir') return null;
        const activeChild = paths[i + 1];
        const activeName = activeChild ? activeChild.split('/').pop() : null;
        return (
          <div key={p} className="w-[210px] shrink-0 overflow-y-auto" style={{ borderRight: '0.5px solid rgba(0,0,0,0.08)', background: '#fff' }}>
            {node.children.map(child => {
              const childPath = joinPath(p, child.name);
              const isActive = activeName === child.name;
              const icon = iconForNode(child);
              return (
                <button
                  key={child.name}
                  className="flex items-center gap-2 w-full px-3 h-[26px] text-[12px] cursor-default"
                  style={{
                    background: isActive ? '#0A84FF' : 'transparent',
                    color: isActive ? '#fff' : 'rgba(0,0,0,0.82)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(child.name);
                    if (child.type === 'dir') onNavigate(childPath);
                  }}
                  onDoubleClick={() => onOpen(child)}
                >
                  <SFSymbol name={icon.name} size={13} color={isActive ? '#fff' : icon.color} />
                  <span className="truncate flex-1 text-left">{child.name}</span>
                  {child.type === 'dir' && <SFSymbol name="chevron.right" size={8} color={isActive ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)'} />}
                </button>
              );
            })}
          </div>
        );
      })}
      {(() => {
        const leaf = getByPath(path);
        if (!leaf) return null;
        if (leaf.type === 'dir') {
          const sel = selected ? leaf.children.find(c => c.name === selected) : null;
          return <FileInspector node={sel} path={sel ? joinPath(path, sel.name) : ''} />;
        }
        return <FileInspector node={leaf} path={path} />;
      })()}
    </div>
  );
}

function GalleryView({ entries, selected, setSelected, onOpen }) {
  const selNode = selected ? entries.find(e => e.name === selected) : entries[0];
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden" style={{ background: '#f5f5f7' }}>
        {selNode ? (
          selNode.kind === 'image' && selNode.contentUrl ? (
            <img src={selNode.contentUrl} alt="" className="max-w-full max-h-full object-contain rounded-[8px] shadow-[0_8px_32px_rgba(0,0,0,0.16)]" />
          ) : (
            <div className="flex flex-col items-center gap-4 text-black/50">
              <SFSymbol name={iconForNode(selNode).name} size={120} color={iconForNode(selNode).color} />
              <div className="text-[14px] text-black/80 font-medium">{selNode.name}</div>
              <div className="text-[11px] text-black/45">{fileKindLabel(selNode)}</div>
            </div>
          )
        ) : (
          <span className="text-[13px] text-white/40">No items</span>
        )}
      </div>
      <div className="h-[92px] shrink-0 flex items-center gap-2 px-3 overflow-x-auto" style={{ background: 'rgba(246,246,248,0.95)', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
        {entries.map(node => {
          const icon = iconForNode(node);
          const isSel = selected === node.name || (!selected && node.name === entries[0]?.name);
          return (
            <button
              key={node.name}
              className="w-[64px] h-[64px] shrink-0 rounded-[10px] flex items-center justify-center cursor-default overflow-hidden"
              style={{
                background: node.kind === 'image' ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.03)',
                border: isSel ? '1.5px solid #0A84FF' : '0.5px solid rgba(0,0,0,0.08)',
              }}
              onClick={(e) => { e.stopPropagation(); setSelected(node.name); }}
              onDoubleClick={() => onOpen(node)}
            >
              {node.kind === 'image' && node.contentUrl ? (
                <img src={node.contentUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <SFSymbol name={icon.name} size={30} color={icon.color} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
