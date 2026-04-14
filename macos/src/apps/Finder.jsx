import { useCallback, useMemo, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacSegmentedControl, MacSearchField, MacToolbarButton, MacSidebarItem, MacSidebarSection } from '../components/ui/MacControls';

const applicationIconPaths = {
  'Safari.app': '/icons/safari.png',
  'Terminal.app': '/icons/terminal.png',
  'Notes.app': '/icons/notes.png',
  'Calculator.app': '/icons/calculator.png',
  'System Settings.app': '/icons/settings.png',
  'TextEdit.app': '/icons/textedit.png',
  'Photos.app': '/icons/photos.png',
  'Xcode.app': '/icons/appstore.png',
  'VS Code.app': '/icons/document.png',
  'Figma.app': '/icons/launchpad.png',
};

const fileSystem = {
  Recents: [
    { name: 'project-notes.md', type: 'Document', size: '12 KB', modified: 'Today, 9:41 AM', icon: 'doc.text' },
    { name: 'screenshot.png', type: 'Image', size: '2.1 MB', modified: 'Today, 8:30 AM', icon: 'photo' },
    { name: 'presentation.key', type: 'Keynote', size: '48 MB', modified: 'Yesterday', icon: 'doc' },
    { name: 'budget.xlsx', type: 'Spreadsheet', size: '156 KB', modified: 'Apr 9, 2025', icon: 'doc' },
  ],
  Applications: [
    { name: 'Safari.app', type: 'Application', size: '24 MB', modified: 'Mar 15, 2025', iconPath: applicationIconPaths['Safari.app'] },
    { name: 'Terminal.app', type: 'Application', size: '12 MB', modified: 'Mar 15, 2025', iconPath: applicationIconPaths['Terminal.app'] },
    { name: 'Notes.app', type: 'Application', size: '8 MB', modified: 'Mar 15, 2025', iconPath: applicationIconPaths['Notes.app'] },
    { name: 'Calculator.app', type: 'Application', size: '4 MB', modified: 'Mar 15, 2025', iconPath: applicationIconPaths['Calculator.app'] },
    { name: 'System Settings.app', type: 'Application', size: '16 MB', modified: 'Mar 15, 2025', iconPath: applicationIconPaths['System Settings.app'] },
    { name: 'TextEdit.app', type: 'Application', size: '6 MB', modified: 'Mar 15, 2025', iconPath: applicationIconPaths['TextEdit.app'] },
    { name: 'Photos.app', type: 'Application', size: '120 MB', modified: 'Mar 15, 2025', iconPath: applicationIconPaths['Photos.app'] },
    { name: 'Xcode.app', type: 'Application', size: '14 GB', modified: 'Mar 20, 2025', iconPath: applicationIconPaths['Xcode.app'] },
    { name: 'VS Code.app', type: 'Application', size: '350 MB', modified: 'Apr 1, 2025', iconPath: applicationIconPaths['VS Code.app'] },
    { name: 'Figma.app', type: 'Application', size: '220 MB', modified: 'Mar 28, 2025', iconPath: applicationIconPaths['Figma.app'] },
  ],
  Desktop: [
    { name: 'Projects', type: 'Folder', size: '--', modified: 'Today, 7:00 AM', icon: 'folder.fill', isFolder: true },
    { name: 'Screenshots', type: 'Folder', size: '--', modified: 'Yesterday', icon: 'folder.fill', isFolder: true },
    { name: 'todo.txt', type: 'Plain Text', size: '2 KB', modified: 'Apr 10, 2025', icon: 'doc.text' },
  ],
  Documents: [
    { name: 'Work', type: 'Folder', size: '--', modified: 'Today, 10:15 AM', icon: 'folder.fill', isFolder: true },
    { name: 'Personal', type: 'Folder', size: '--', modified: 'Apr 8, 2025', icon: 'folder.fill', isFolder: true },
    { name: 'Archive', type: 'Folder', size: '--', modified: 'Mar 1, 2025', icon: 'folder.fill', isFolder: true },
    { name: 'resume.pdf', type: 'PDF', size: '245 KB', modified: 'Apr 5, 2025', icon: 'doc' },
    { name: 'cover-letter.docx', type: 'Word', size: '56 KB', modified: 'Apr 5, 2025', icon: 'doc' },
    { name: 'notes.md', type: 'Markdown', size: '8 KB', modified: 'Apr 9, 2025', icon: 'doc.text' },
  ],
  Downloads: [
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
  { label: 'Blue', color: '#0A84FF' },
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

function fileIconPath(file) {
  return file.iconPath || null;
}

function renderFileGlyph(file, size, tint = 'rgba(255,255,255,0.45)') {
  const iconPath = fileIconPath(file);
  if (iconPath) {
    return (
      <img
        src={iconPath}
        alt=""
        className="block shrink-0"
        style={{ width: size, height: size, objectFit: 'contain', imageRendering: 'auto' }}
        draggable={false}
      />
    );
  }

  return (
    <SFSymbol
      name={file.icon || 'doc'}
      size={size}
      color={file.isFolder ? '#64ACFF' : tint}
      weight={file.isFolder ? 1.2 : undefined}
    />
  );
}

function FileInspector({ file, activeDir, selectedCount }) {
  if (!file) {
    return (
      <div
        className="w-[250px] shrink-0 flex flex-col justify-between border-l border-white/5"
        style={{ background: 'transparent' }}
      >
        <div className="p-4">
          <div className="rounded-[14px] border border-white/10 bg-white/5 px-3 py-3 text-center">
            <div className="text-[12px] text-white/70 font-medium">No selection</div>
            <div className="mt-1 text-[11px] leading-relaxed text-white/50">
              Choose an item to inspect its size, kind, and location.
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 text-[11px] text-black/40">
          {selectedCount > 0 ? `${selectedCount} selected` : 'Nothing selected'}
        </div>
      </div>
    );
  }

  const pathParts = ['Macintosh HD', 'Users', 'thomas', activeDir, file.name];

  return (
    <div
      className="w-[270px] shrink-0 flex flex-col border-l border-white/10"
      style={{ background: 'transparent' }}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-center h-[132px] rounded-[16px] border border-white/10 bg-white/5 overflow-hidden">
          <div className="flex flex-col items-center gap-2 text-center px-3">
            {renderFileGlyph(file, file.iconPath ? 68 : 56, 'rgba(255,255,255,0.8)')}
            <div className="text-[13px] text-white/90 font-medium leading-tight break-all max-w-[190px]">
              {file.name}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2">Info</div>
        <div className="space-y-3 text-[12px] text-white/80">
          <div className="flex justify-between gap-3">
            <span className="text-white/50">Kind</span>
            <span className="text-right">{file.type}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/50">Size</span>
            <span className="text-right">{file.size}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/50">Modified</span>
            <span className="text-right">{file.modified}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/42">Location</span>
            <span className="text-right">{activeDir}</span>
          </div>
        </div>

        <div className="mt-5 text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2">Path</div>
        <div className="rounded-[12px] border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-white/70">
          {pathParts.map((part, index) => (
            <span key={`${part}-${index}`}>
              {index > 0 && <span className="mx-1 text-white/30">/</span>}
              <span>{part}</span>
            </span>
          ))}
        </div>

        <div className="mt-5 text-[10px] uppercase tracking-[0.18em] text-white/30 mb-2">Tags</div>
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map(tag => (
            <span
              key={tag.label}
              className="rounded-full px-2 py-1 text-[10px] leading-none text-white/78"
              style={{ background: `${tag.color}22`, border: `0.5px solid ${tag.color}55` }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 text-[11px] text-white/40">
        {selectedCount > 0 ? `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected` : 'Preview ready'}
      </div>
    </div>
  );
}

export default function Finder() {
  const [activeDir, setActiveDir] = useState('Recents');
  const [selected, setSelected] = useState(new Set());
  const [viewMode, setViewMode] = useState('icon');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [history, setHistory] = useState(['Recents']);
  const [historyIdx, setHistoryIdx] = useState(0);

  const files = useMemo(() => (fileSystem[activeDir] || []).filter(file => (
    !search || file.name.toLowerCase().includes(search.toLowerCase())
  )), [activeDir, search]);

  const sortedFiles = useMemo(() => [...files].sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;

    let cmp = 0;
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortBy === 'kind') cmp = a.type.localeCompare(b.type);
    else if (sortBy === 'size') cmp = a.size.localeCompare(b.size);
    else if (sortBy === 'modified') cmp = a.modified.localeCompare(b.modified);
    return sortAsc ? cmp : -cmp;
  }), [files, sortAsc, sortBy]);

  const selectedFile = useMemo(() => {
    const selectedNames = [...selected];
    if (selectedNames.length > 0) {
      return sortedFiles.find(file => file.name === selectedNames[0]) || null;
    }
    return null;
  }, [selected, sortedFiles]);

  const navigate = useCallback((dir) => {
    const nextHistory = history.slice(0, historyIdx + 1);
    if (nextHistory[nextHistory.length - 1] !== dir) {
      nextHistory.push(dir);
    }
    setActiveDir(dir);
    setSelected(new Set());
    setHistory(nextHistory);
    setHistoryIdx(nextHistory.length - 1);
  }, [history, historyIdx]);

  const goBack = useCallback(() => {
    if (historyIdx > 0) {
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      setActiveDir(history[nextIdx]);
      setSelected(new Set());
    }
  }, [history, historyIdx]);

  const goForward = useCallback(() => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setActiveDir(history[nextIdx]);
      setSelected(new Set());
    }
  }, [history, historyIdx]);

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
    else {
      setSortBy(col);
      setSortAsc(true);
    }
  };

  const sortArrow = (col) => (sortBy === col ? (
    <SFSymbol name={sortAsc ? 'chevron.up' : 'chevron.down'} size={8} color="rgba(255,255,255,0.4)" />
  ) : null);

  const renderInspector = viewMode !== 'icon';

  const renderFileName = file => (
    <span className={selected.has(file.name) ? 'text-white' : 'text-black'}>{file.name}</span>
  );

  return (
    <div className="flex h-full text-white" style={{ background: 'rgba(30,30,32,0.85)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
      <div
        className="w-[180px] shrink-0 flex flex-col pt-2 pb-1 overflow-y-auto"
        style={{ background: 'rgba(255,255,255,0.02)', borderRight: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        <MacSidebarSection title="Favorites">
          {sidebarFavs.map(item => (
            <MacSidebarItem
              key={item.id}
              icon={item.icon}
              iconColor={activeDir === item.id ? 'white' : item.color}
              label={<span className={activeDir === item.id ? 'text-white' : 'text-white/70'}>{item.label}</span>}
              selected={activeDir === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}
        </MacSidebarSection>
        <MacSidebarSection title="Tags">
          {tags.map(tag => (
            <MacSidebarItem
              key={tag.label}
              icon={<div className="w-[10px] h-[10px] rounded-full" style={{ background: tag.color }} />}
              label={tag.label}
              selected={false}
              onClick={() => {}}
            />
          ))}
        </MacSidebarSection>
      </div>

      <div className="flex-1 flex flex-col min-w-0" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div
          className="h-[44px] flex items-center gap-2 px-3.5 shrink-0"
          style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-0.5">
            <MacToolbarButton icon="chevron.left" onClick={goBack} label="Back" size={26} color="white" />
            <MacToolbarButton icon="chevron.right" onClick={goForward} label="Forward" size={26} color="white" />
          </div>
          <span className="text-[14px] text-white/90 font-medium ml-1 tracking-normal">{activeDir}</span>
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
            tone="quiet"
          />
          <MacSearchField value={search} onChange={setSearch} className="w-[150px] bg-black/5" />
        </div>

        <div className="flex-1 overflow-hidden" onClick={() => setSelected(new Set())}>
          {activeDir === 'AirDrop' ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
              <SFSymbol name="wifi" size={48} color="rgba(255,255,255,0.15)" />
              <span className="text-[14px] font-medium text-white/42">AirDrop</span>
              <span className="text-[12px] text-white/26">No one is available to AirDrop</span>
            </div>
          ) : viewMode === 'icon' ? (
            <div className="grid grid-cols-6 gap-1 p-4">
              {sortedFiles.map(file => (
                <button
                  key={file.name}
                  className="flex flex-col items-center gap-1 p-2 rounded-[8px] cursor-default"
                  style={{ background: selected.has(file.name) ? 'rgba(10,132,255,0.22)' : 'transparent' }}
                  onClick={e => toggleSelect(file.name, e)}
                  onDoubleClick={() => file.isFolder && navigate(file.name)}
                  onMouseEnter={e => { if (!selected.has(file.name)) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!selected.has(file.name)) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="w-[58px] h-[58px] flex items-center justify-center">
                    {renderFileGlyph(file, file.iconPath ? 46 : 42, 'rgba(255,255,255,0.75)')}
                  </div>
                  <span
                    className="text-[11px] text-center leading-tight max-w-[80px] line-clamp-2"
                    style={{
                      color: selected.has(file.name) ? '#fff' : 'rgba(255,255,255,0.95)',
                      background: selected.has(file.name) ? '#0A84FF' : 'transparent',
                      borderRadius: 4,
                      padding: '2px 4px',
                      wordBreak: 'break-word',
                    }}
                  >
                    {file.name}
                  </span>
                </button>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex h-full min-h-0">
              <div className="flex-1 min-w-0 overflow-y-auto text-[12px]">
                <div className="flex items-center h-[26px] px-3.5 border-b border-white/10 text-white/50 font-medium sticky top-0 z-10" style={{ background: 'transparent', backdropFilter: 'blur(20px)' }}>
                  <button className="flex items-center gap-1 w-[45%] text-left cursor-default hover:text-white" onClick={() => handleSort('name')}>
                    Name {sortArrow('name')}
                  </button>
                  <button className="flex items-center gap-1 w-[22%] text-left cursor-default hover:text-white" onClick={() => handleSort('modified')}>
                    Date Modified {sortArrow('modified')}
                  </button>
                  <button className="flex items-center gap-1 w-[15%] text-left cursor-default hover:text-white" onClick={() => handleSort('size')}>
                    Size {sortArrow('size')}
                  </button>
                  <button className="flex items-center gap-1 w-[18%] text-left cursor-default hover:text-white" onClick={() => handleSort('kind')}>
                    Kind {sortArrow('kind')}
                  </button>
                </div>
                {sortedFiles.map((file, index) => (
                  <button
                    key={file.name}
                    className="flex items-center h-[28px] px-3.5 w-full text-left cursor-default"
                    style={{
                      background: selected.has(file.name) ? '#0A84FF' : index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      color: selected.has(file.name) ? 'white' : 'white',
                      borderBottom: '0.5px solid rgba(255,255,255,0.04)'
                    }}
                    onClick={e => toggleSelect(file.name, e)}
                    onDoubleClick={() => file.isFolder && navigate(file.name)}
                    onMouseEnter={e => { if (!selected.has(file.name)) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={e => { if (!selected.has(file.name)) e.currentTarget.style.background = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'; }}
                  >
                    <div className="flex items-center gap-2 w-[45%] truncate text-[13px]">
                      {renderFileGlyph(file, 16, 'rgba(255,255,255,0.7)')}
                      {renderFileName(file)}
                    </div>
                    <span className="w-[22%] opacity-60 truncate">{file.modified}</span>
                    <span className="w-[15%] opacity-60">{file.size}</span>
                    <span className="w-[18%] opacity-60 truncate">{file.type}</span>
                  </button>
                ))}
              </div>
              {renderInspector && <FileInspector file={selectedFile} activeDir={activeDir} selectedCount={selected.size} />}
            </div>
          ) : viewMode === 'column' ? (
            <div className="flex h-full min-h-0">
              <div className="w-[200px] shrink-0 border-r border-white/6 overflow-y-auto">
                {sidebarFavs.filter(fav => fav.id !== 'AirDrop').map(fav => (
                  <button
                    key={fav.id}
                    className="flex items-center gap-2 w-full px-3.5 h-[26px] text-[12px] cursor-default"
                    style={{
                      background: activeDir === fav.id ? 'rgba(10,132,255,0.9)' : 'transparent',
                      color: activeDir === fav.id ? '#fff' : 'rgba(255,255,255,0.74)',
                    }}
                    onClick={() => navigate(fav.id)}
                  >
                    <SFSymbol name={fav.icon} size={13} color={activeDir === fav.id ? '#fff' : '#64ACFF'} />
                    {fav.label}
                    <SFSymbol name="chevron.right" size={8} color="rgba(255,255,255,0.25)" className="ml-auto" />
                  </button>
                ))}
              </div>
              <div className="flex-1 min-w-0 overflow-y-auto border-r border-white/6">
                {sortedFiles.map(file => (
                  <button
                    key={file.name}
                    className="flex items-center gap-2 w-full px-3.5 h-[26px] text-[12px] cursor-default"
                    style={{
                      background: selected.has(file.name) ? 'rgba(10,132,255,0.9)' : 'transparent',
                      color: selected.has(file.name) ? '#fff' : 'rgba(255,255,255,0.74)',
                    }}
                    onClick={e => toggleSelect(file.name, e)}
                    onDoubleClick={() => file.isFolder && navigate(file.name)}
                  >
                    {renderFileGlyph(file, 13, 'rgba(255,255,255,0.4)')}
                    {file.name}
                    {file.isFolder && <SFSymbol name="chevron.right" size={8} color="rgba(255,255,255,0.25)" className="ml-auto" />}
                  </button>
                ))}
              </div>
              {renderInspector && <FileInspector file={selectedFile} activeDir={activeDir} selectedCount={selected.size} />}
            </div>
          ) : (
            <div className="flex h-full min-h-0">
              <div className="flex-1 min-w-0 flex flex-col border-r border-white/6">
                <div className="flex-1 flex items-center justify-center p-6" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-[136px] h-[136px] rounded-[24px] border border-white/8 bg-white/4 flex items-center justify-center overflow-hidden">
                        {renderFileGlyph(selectedFile, selectedFile.iconPath ? 88 : 72, 'rgba(255,255,255,0.42)')}
                      </div>
                      <div className="text-[13px] text-white/72 font-medium">{selectedFile.name}</div>
                      <div className="text-[11px] text-white/32">
                        Preview and inspector details stay aligned with the current selection.
                      </div>
                    </div>
                  ) : (
                    <span className="text-[13px] text-white/28">Select a file to preview</span>
                  )}
                </div>
                <div className="h-[92px] shrink-0 flex items-center gap-2 px-3 overflow-x-auto" style={{ background: 'rgba(34,34,36,0.82)' }}>
                  {sortedFiles.map(file => (
                    <button
                      key={file.name}
                      className="w-[64px] h-[64px] shrink-0 rounded-[12px] flex items-center justify-center cursor-default border"
                      style={{
                        background: selected.has(file.name) ? 'rgba(10,132,255,0.24)' : 'rgba(255,255,255,0.05)',
                        borderColor: selected.has(file.name) ? 'rgba(10,132,255,0.9)' : 'rgba(255,255,255,0.06)',
                      }}
                      onClick={e => toggleSelect(file.name, e)}
                      onDoubleClick={() => file.isFolder && navigate(file.name)}
                    >
                      {renderFileGlyph(file, file.iconPath ? 30 : 28, 'rgba(255,255,255,0.38)')}
                    </button>
                  ))}
                </div>
              </div>
              {renderInspector && <FileInspector file={selectedFile} activeDir={activeDir} selectedCount={selected.size} />}
            </div>
          )}
        </div>

        <div
          className="h-[28px] flex items-center justify-between gap-3 px-3.5 shrink-0 text-[11px] text-white/50"
          style={{ background: 'transparent', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <SFSymbol name="internaldrive" size={11} color="rgba(255,255,255,0.4)" />
            <span className="whitespace-nowrap">Macintosh HD</span>
            <SFSymbol name="chevron.right" size={7} color="rgba(255,255,255,0.2)" />
            <span className="whitespace-nowrap">Users</span>
            <SFSymbol name="chevron.right" size={7} color="rgba(255,255,255,0.2)" />
            <span className="whitespace-nowrap">thomas</span>
            <SFSymbol name="chevron.right" size={7} color="rgba(255,255,255,0.2)" />
            <span className="truncate text-white/90 font-medium">{activeDir}</span>
          </div>
          <div className="whitespace-nowrap text-right text-white/40">
            {sortedFiles.length} item{sortedFiles.length !== 1 ? 's' : ''}
            {selected.size > 0 ? `, ${selected.size} selected` : ''}
            <span className="px-1.5 text-white/20">·</span>
            245.8 GB available
          </div>
        </div>
      </div>
    </div>
  );
}
