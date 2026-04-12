import { useState, useCallback } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacSegmentedControl, MacSearchField, MacToolbarButton, MacSidebarItem, MacSidebarSection } from '../components/ui/MacControls';

const fileSystem = {
  'Recents': [
    { name: 'project-notes.md', type: 'Document', size: '12 KB', modified: 'Today, 9:41 AM', icon: 'doc.text' },
    { name: 'screenshot.png', type: 'Image', size: '2.1 MB', modified: 'Today, 8:30 AM', icon: 'photo' },
    { name: 'presentation.key', type: 'Keynote', size: '48 MB', modified: 'Yesterday', icon: 'doc' },
    { name: 'budget.xlsx', type: 'Spreadsheet', size: '156 KB', modified: 'Apr 9, 2025', icon: 'doc' },
  ],
  'Applications': [
    { name: 'Safari.app', type: 'Application', size: '24 MB', modified: 'Mar 15, 2025', icon: 'folder' },
    { name: 'Terminal.app', type: 'Application', size: '12 MB', modified: 'Mar 15, 2025', icon: 'folder' },
    { name: 'Notes.app', type: 'Application', size: '8 MB', modified: 'Mar 15, 2025', icon: 'folder' },
    { name: 'Calculator.app', type: 'Application', size: '4 MB', modified: 'Mar 15, 2025', icon: 'folder' },
    { name: 'System Settings.app', type: 'Application', size: '16 MB', modified: 'Mar 15, 2025', icon: 'folder' },
    { name: 'TextEdit.app', type: 'Application', size: '6 MB', modified: 'Mar 15, 2025', icon: 'folder' },
    { name: 'Photos.app', type: 'Application', size: '120 MB', modified: 'Mar 15, 2025', icon: 'folder' },
    { name: 'Xcode.app', type: 'Application', size: '14 GB', modified: 'Mar 20, 2025', icon: 'folder' },
    { name: 'VS Code.app', type: 'Application', size: '350 MB', modified: 'Apr 1, 2025', icon: 'folder' },
    { name: 'Figma.app', type: 'Application', size: '220 MB', modified: 'Mar 28, 2025', icon: 'folder' },
  ],
  'Desktop': [
    { name: 'Projects', type: 'Folder', size: '--', modified: 'Today, 7:00 AM', icon: 'folder.fill', isFolder: true },
    { name: 'Screenshots', type: 'Folder', size: '--', modified: 'Yesterday', icon: 'folder.fill', isFolder: true },
    { name: 'todo.txt', type: 'Plain Text', size: '2 KB', modified: 'Apr 10, 2025', icon: 'doc.text' },
  ],
  'Documents': [
    { name: 'Work', type: 'Folder', size: '--', modified: 'Today, 10:15 AM', icon: 'folder.fill', isFolder: true },
    { name: 'Personal', type: 'Folder', size: '--', modified: 'Apr 8, 2025', icon: 'folder.fill', isFolder: true },
    { name: 'Archive', type: 'Folder', size: '--', modified: 'Mar 1, 2025', icon: 'folder.fill', isFolder: true },
    { name: 'resume.pdf', type: 'PDF', size: '245 KB', modified: 'Apr 5, 2025', icon: 'doc' },
    { name: 'cover-letter.docx', type: 'Word', size: '56 KB', modified: 'Apr 5, 2025', icon: 'doc' },
    { name: 'notes.md', type: 'Markdown', size: '8 KB', modified: 'Apr 9, 2025', icon: 'doc.text' },
  ],
  'Downloads': [
    { name: 'archive.zip', type: 'Archive', size: '56 MB', modified: 'Today, 11:20 AM', icon: 'doc' },
    { name: 'installer.dmg', type: 'Disk Image', size: '1.2 GB', modified: 'Yesterday', icon: 'internaldrive' },
    { name: 'photo-export.jpg', type: 'Image', size: '4.8 MB', modified: 'Yesterday', icon: 'photo' },
    { name: 'font-pack.zip', type: 'Archive', size: '23 MB', modified: 'Apr 8, 2025', icon: 'doc' },
    { name: 'wallpaper.png', type: 'Image', size: '8.2 MB', modified: 'Apr 7, 2025', icon: 'photo' },
  ],
};

const tags = [
  { label: 'Red', color: '#FF3B30' },
  { label: 'Orange', color: '#FF9500' },
  { label: 'Yellow', color: '#FFCC00' },
  { label: 'Green', color: '#34C759' },
  { label: 'Blue', color: '#007AFF' },
  { label: 'Purple', color: '#5856D6' },
  { label: 'Gray', color: '#8E8E93' },
];

const sidebarFavs = [
  { id: 'AirDrop', label: 'AirDrop', icon: 'wifi', color: '#007AFF' },
  { id: 'Recents', label: 'Recents', icon: 'clock', color: '#007AFF' },
  { id: 'Applications', label: 'Applications', icon: 'square.grid.2x2', color: '#007AFF' },
  { id: 'Desktop', label: 'Desktop', icon: 'display', color: '#007AFF' },
  { id: 'Documents', label: 'Documents', icon: 'folder', color: '#007AFF' },
  { id: 'Downloads', label: 'Downloads', icon: 'arrow.down.circle', color: '#007AFF' },
];

export default function Finder() {
  const [activeDir, setActiveDir] = useState('Recents');
  const [selected, setSelected] = useState(new Set());
  const [viewMode, setViewMode] = useState('icon');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [history, setHistory] = useState(['Recents']);
  const [historyIdx, setHistoryIdx] = useState(0);

  const files = (fileSystem[activeDir] || []).filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedFiles = [...files].sort((a, b) => {
    // Folders first
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    let cmp = 0;
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortBy === 'kind') cmp = a.type.localeCompare(b.type);
    else if (sortBy === 'size') cmp = a.size.localeCompare(b.size);
    else if (sortBy === 'modified') cmp = a.modified.localeCompare(b.modified);
    return sortAsc ? cmp : -cmp;
  });

  const navigate = useCallback((dir) => {
    setActiveDir(dir);
    setSelected(new Set());
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push(dir);
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
  }, [history, historyIdx]);

  const goBack = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setActiveDir(history[historyIdx - 1]);
      setSelected(new Set());
    }
  };
  const goForward = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setActiveDir(history[historyIdx + 1]);
      setSelected(new Set());
    }
  };

  const toggleSelect = (name, e) => {
    e.stopPropagation();
    if (e.metaKey || e.ctrlKey) {
      setSelected(prev => {
        const next = new Set(prev);
        next.has(name) ? next.delete(name) : next.add(name);
        return next;
      });
    } else {
      setSelected(new Set([name]));
    }
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortAsc(!sortAsc);
    else { setSortBy(col); setSortAsc(true); }
  };

  const SortArrow = ({ col }) => sortBy === col ? (
    <SFSymbol name={sortAsc ? 'chevron.up' : 'chevron.down'} size={8} color="rgba(255,255,255,0.4)" />
  ) : null;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className="w-[180px] shrink-0 flex flex-col pt-2 pb-1 overflow-y-auto"
        style={{ background: 'rgba(42,42,44,0.95)', borderRight: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        <MacSidebarSection title="Favorites">
          {sidebarFavs.map(item => (
            <MacSidebarItem
              key={item.id}
              icon={item.icon}
              iconColor={item.color}
              label={item.label}
              selected={activeDir === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}
        </MacSidebarSection>
        <MacSidebarSection title="Tags">
          {tags.map(t => (
            <MacSidebarItem
              key={t.label}
              icon={<div className="w-[10px] h-[10px] rounded-full" style={{ background: t.color }} />}
              label={t.label}
              selected={false}
              onClick={() => {}}
            />
          ))}
        </MacSidebarSection>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col" style={{ background: 'rgba(30,30,30,0.95)' }}>
        {/* Toolbar */}
        <div
          className="h-[38px] flex items-center gap-2 px-3 shrink-0"
          style={{ background: 'rgba(50,50,50,0.5)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-0.5">
            <MacToolbarButton icon="chevron.left" onClick={goBack} label="Back" size={26} />
            <MacToolbarButton icon="chevron.right" onClick={goForward} label="Forward" size={26} />
          </div>
          <span className="text-[13px] text-white/80 font-medium ml-1">{activeDir}</span>
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
          />
          <MacSearchField value={search} onChange={setSearch} className="w-[140px]" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" onClick={() => setSelected(new Set())}>
          {activeDir === 'AirDrop' ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
              <SFSymbol name="wifi" size={48} color="rgba(255,255,255,0.15)" />
              <span className="text-[14px] font-medium text-white/40">AirDrop</span>
              <span className="text-[12px]">No one is available to AirDrop</span>
            </div>
          ) : viewMode === 'icon' ? (
            <div className="grid grid-cols-6 gap-1 p-4">
              {sortedFiles.map(file => (
                <button
                  key={file.name}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg cursor-default"
                  style={{ background: selected.has(file.name) ? 'rgba(10,132,255,0.25)' : 'transparent' }}
                  onClick={e => toggleSelect(file.name, e)}
                  onDoubleClick={() => file.isFolder && navigate(file.name)}
                  onMouseEnter={e => { if (!selected.has(file.name)) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!selected.has(file.name)) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="w-[56px] h-[56px] flex items-center justify-center">
                    <SFSymbol name={file.icon} size={file.isFolder ? 48 : 40} color={file.isFolder ? '#64ACFF' : 'rgba(255,255,255,0.5)'} weight={1} />
                  </div>
                  <span
                    className="text-[11px] text-center break-all leading-tight max-w-[80px]"
                    style={{
                      color: selected.has(file.name) ? '#fff' : 'rgba(255,255,255,0.8)',
                      background: selected.has(file.name) ? '#0a84ff' : 'transparent',
                      borderRadius: 3, padding: '1px 4px',
                    }}
                  >
                    {file.name}
                  </span>
                </button>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="text-[12px]">
              {/* Column headers */}
              <div className="flex items-center h-[22px] px-3 border-b border-white/8 text-white/40 font-medium sticky top-0" style={{ background: 'rgba(40,40,40,0.95)' }}>
                <button className="flex items-center gap-1 w-[45%] text-left cursor-default hover:text-white/60" onClick={() => handleSort('name')}>
                  Name <SortArrow col="name" />
                </button>
                <button className="flex items-center gap-1 w-[22%] text-left cursor-default hover:text-white/60" onClick={() => handleSort('modified')}>
                  Date Modified <SortArrow col="modified" />
                </button>
                <button className="flex items-center gap-1 w-[15%] text-left cursor-default hover:text-white/60" onClick={() => handleSort('size')}>
                  Size <SortArrow col="size" />
                </button>
                <button className="flex items-center gap-1 w-[18%] text-left cursor-default hover:text-white/60" onClick={() => handleSort('kind')}>
                  Kind <SortArrow col="kind" />
                </button>
              </div>
              {/* Rows */}
              {sortedFiles.map((file, i) => (
                <button
                  key={file.name}
                  className="flex items-center h-[24px] px-3 w-full text-left cursor-default"
                  style={{
                    background: selected.has(file.name) ? '#0a84ff' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                  }}
                  onClick={e => toggleSelect(file.name, e)}
                  onDoubleClick={() => file.isFolder && navigate(file.name)}
                  onMouseEnter={e => { if (!selected.has(file.name)) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!selected.has(file.name)) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'; }}
                >
                  <div className="flex items-center gap-1.5 w-[45%] truncate">
                    <SFSymbol name={file.icon} size={14} color={file.isFolder ? '#64ACFF' : 'rgba(255,255,255,0.4)'} />
                    <span className={selected.has(file.name) ? 'text-white' : 'text-white/80'}>{file.name}</span>
                  </div>
                  <span className="w-[22%] text-white/40 truncate">{file.modified}</span>
                  <span className="w-[15%] text-white/40">{file.size}</span>
                  <span className="w-[18%] text-white/40 truncate">{file.type}</span>
                </button>
              ))}
            </div>
          ) : viewMode === 'column' ? (
            <div className="flex h-full">
              {/* Left column: directories */}
              <div className="w-[200px] shrink-0 border-r border-white/6 overflow-y-auto">
                {sidebarFavs.filter(f => f.id !== 'AirDrop').map(fav => (
                  <button
                    key={fav.id}
                    className="flex items-center gap-2 w-full px-3 h-[24px] text-[12px] cursor-default"
                    style={{
                      background: activeDir === fav.id ? '#0a84ff' : 'transparent',
                      color: activeDir === fav.id ? '#fff' : 'rgba(255,255,255,0.7)',
                    }}
                    onClick={() => navigate(fav.id)}
                  >
                    <SFSymbol name={fav.icon} size={13} color={activeDir === fav.id ? '#fff' : '#64ACFF'} />
                    {fav.label}
                    <SFSymbol name="chevron.right" size={8} color="rgba(255,255,255,0.3)" className="ml-auto" />
                  </button>
                ))}
              </div>
              {/* Right column: files in selected dir */}
              <div className="flex-1 overflow-y-auto">
                {sortedFiles.map(file => (
                  <button
                    key={file.name}
                    className="flex items-center gap-2 w-full px-3 h-[24px] text-[12px] cursor-default"
                    style={{
                      background: selected.has(file.name) ? '#0a84ff' : 'transparent',
                      color: selected.has(file.name) ? '#fff' : 'rgba(255,255,255,0.7)',
                    }}
                    onClick={e => toggleSelect(file.name, e)}
                  >
                    <SFSymbol name={file.icon} size={13} color={selected.has(file.name) ? '#fff' : file.isFolder ? '#64ACFF' : 'rgba(255,255,255,0.4)'} />
                    {file.name}
                    {file.isFolder && <SFSymbol name="chevron.right" size={8} color="rgba(255,255,255,0.3)" className="ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          ) : /* gallery */ (
            <div className="flex flex-col h-full">
              {/* Large preview */}
              <div className="flex-1 flex items-center justify-center p-6" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                {selected.size > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <SFSymbol name={sortedFiles.find(f => selected.has(f.name))?.icon || 'doc'} size={80} color="rgba(255,255,255,0.3)" />
                    <span className="text-[13px] text-white/60">{[...selected][0]}</span>
                  </div>
                ) : (
                  <span className="text-[13px] text-white/25">Select a file to preview</span>
                )}
              </div>
              {/* Filmstrip */}
              <div className="h-[80px] shrink-0 flex items-center gap-1 px-2 overflow-x-auto">
                {sortedFiles.map(file => (
                  <button
                    key={file.name}
                    className="w-[60px] h-[60px] shrink-0 rounded-lg flex items-center justify-center cursor-default"
                    style={{
                      background: selected.has(file.name) ? 'rgba(10,132,255,0.3)' : 'rgba(255,255,255,0.04)',
                      border: selected.has(file.name) ? '2px solid #0a84ff' : '1px solid rgba(255,255,255,0.06)',
                    }}
                    onClick={e => toggleSelect(file.name, e)}
                  >
                    <SFSymbol name={file.icon} size={28} color={file.isFolder ? '#64ACFF' : 'rgba(255,255,255,0.3)'} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Path Bar */}
        <div
          className="h-[24px] flex items-center gap-1 px-3 shrink-0 text-[11px] text-white/40"
          style={{ background: 'rgba(40,40,40,0.6)', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}
        >
          <SFSymbol name="internaldrive" size={11} color="rgba(255,255,255,0.35)" />
          <span>Macintosh HD</span>
          <SFSymbol name="chevron.right" size={7} color="rgba(255,255,255,0.25)" />
          <span>Users</span>
          <SFSymbol name="chevron.right" size={7} color="rgba(255,255,255,0.25)" />
          <span>thomas</span>
          <SFSymbol name="chevron.right" size={7} color="rgba(255,255,255,0.25)" />
          <span className="text-white/60">{activeDir}</span>
        </div>

        {/* Status Bar */}
        <div
          className="h-[22px] flex items-center justify-center shrink-0 text-[11px] text-white/35"
          style={{ background: 'rgba(40,40,40,0.5)', borderTop: '0.5px solid rgba(255,255,255,0.04)' }}
        >
          {sortedFiles.length} item{sortedFiles.length !== 1 ? 's' : ''}{selected.size > 0 ? `, ${selected.size} selected` : ''} &mdash; 245.8 GB available
        </div>
      </div>
    </div>
  );
}
