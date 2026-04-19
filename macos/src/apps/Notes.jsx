import { useState, useEffect, useRef, useCallback } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacSearchField, MacSidebarItem, MacSidebarSection, MacToolbarButton } from '../components/ui/MacControls';

const STORAGE_KEY = 'macos-notes';

function loadNotes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (error) {
    void error;
  }
  return [
    { id: '1', title: 'Welcome to Notes', content: 'This is your first note. Start typing to edit it.\n\nYou can create new notes, search through them, and organize your thoughts.', folder: 'notes', updated: Date.now() },
    { id: '2', title: 'Shopping List', content: '- Milk\n- Eggs\n- Bread\n- Coffee\n- Avocados', folder: 'notes', updated: Date.now() - 3600000 },
    { id: '3', title: 'Project Ideas', content: '1. macOS web simulator\n2. Portfolio website\n3. 3D desk showroom\n4. CLI tool for automation', folder: 'notes', updated: Date.now() - 86400000 },
  ];
}

const folders = [
  { id: 'all', label: 'All iCloud', icon: 'folder.fill', color: '#007AFF' },
  { id: 'notes', label: 'Notes', icon: 'doc.text', color: '#FFCC00' },
  { id: 'deleted', label: 'Recently Deleted', icon: 'trash', color: '#FF3B30' },
];

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function Notes() {
  const [notes, setNotes] = useState(loadNotes);
  const [activeId, setActiveId] = useState(notes[0]?.id);
  const [activeFolder, setActiveFolder] = useState('all');
  const [search, setSearch] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeId);

  const filteredNotes = notes
    .filter(n => {
      if (activeFolder === 'deleted') return false;
      if (activeFolder !== 'all' && n.folder !== activeFolder) return false;
      if (search) return n.content.toLowerCase().includes(search.toLowerCase());
      return true;
    })
    .sort((a, b) => b.updated - a.updated);

  const createNote = useCallback(() => {
    const newNote = { id: String(Date.now()), title: 'New Note', content: '', folder: 'notes', updated: Date.now() };
    setNotes(prev => [newNote, ...prev]);
    setActiveId(newNote.id);
    setTimeout(() => editorRef.current?.focus(), 50);
  }, []);

  const updateNote = useCallback((content) => {
    const lines = content.split('\n');
    const title = lines[0]?.trim().slice(0, 60) || 'New Note';
    setNotes(prev => prev.map(n =>
      n.id === activeId ? { ...n, content, title, updated: Date.now() } : n
    ));
  }, [activeId]);

  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setActiveId(remaining[0]?.id || null);
    }
  }, [activeId, notes]);

  const getPreview = (note) => {
    const lines = note.content.split('\n').filter(l => l.trim());
    return lines.slice(1, 3).join(' ').slice(0, 80) || 'No additional text';
  };

  return (
    <div className="flex h-full">
      {/* Column 1: Folders */}
      <div
        className="w-[188px] shrink-0 flex flex-col pt-2 pb-1 overflow-y-auto"
        style={{ background: 'rgba(42,42,44,0.95)', borderRight: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        <MacSidebarSection title="iCloud">
          {folders.map(f => (
            <MacSidebarItem
              key={f.id}
              icon={f.icon}
              iconColor={f.color}
              label={f.label}
              selected={activeFolder === f.id}
              onClick={() => setActiveFolder(f.id)}
              badge={f.id === 'all' ? notes.length : f.id === 'notes' ? notes.filter(n => n.folder === 'notes').length : undefined}
            />
          ))}
        </MacSidebarSection>
      </div>

      {/* Column 2: Note List */}
      <div
        className="w-[270px] shrink-0 flex flex-col"
        style={{ background: 'rgba(36,36,38,0.95)', borderRight: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        {/* Search */}
        <div className="px-3 pt-2.5 pb-1.5">
          <MacSearchField value={search} onChange={setSearch} placeholder="Search" />
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto px-2">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              className="w-full text-left px-3 py-2.5 rounded-[7px] mb-[4px] cursor-default transition-colors duration-75"
              style={{
                background: activeId === note.id ? 'rgba(10,132,255,0.95)' : 'transparent',
                boxShadow: activeId === note.id ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'none',
              }}
              onMouseEnter={e => {
                if (activeId !== note.id) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={e => {
                if (activeId !== note.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              onClick={() => setActiveId(note.id)}
            >
              <div className="text-[13px] font-semibold truncate leading-[1.25]" style={{ color: activeId === note.id ? '#fff' : 'rgba(255,255,255,0.92)' }}>
                {note.title}
              </div>
              <div className="flex items-center gap-1.5 mt-[3px]">
                <span className="text-[10px] uppercase tracking-[0.04em] shrink-0" style={{ color: activeId === note.id ? 'rgba(255,255,255,0.66)' : 'rgba(255,255,255,0.34)' }}>
                  {formatDate(note.updated)}
                </span>
                <span className="text-[11px] truncate" style={{ color: activeId === note.id ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.28)' }}>
                  {getPreview(note)}
                </span>
              </div>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center text-[12px] text-white/25 py-8">No Notes</div>
          )}
        </div>
      </div>

      {/* Column 3: Editor */}
      <div className="flex-1 flex flex-col" style={{ background: 'rgba(28,28,30,0.95)' }}>
        {activeNote ? (
          <>
            {/* Toolbar */}
            <div className="h-[38px] flex items-center justify-between px-3 shrink-0" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1">
                <button
                  onClick={createNote}
                  className="flex items-center gap-1.5 h-[26px] px-2 rounded-[6px] text-[12px] text-white/85 transition-colors cursor-default"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  title="New Note"
                >
                  <SFSymbol name="plus" size={11} color="currentColor" weight={2} />
                  <span>New Note</span>
                </button>
                <MacToolbarButton icon="checklist" label="Checklist" size={26} />
                <MacToolbarButton icon="tablecells" label="Table" size={26} />
                <MacToolbarButton icon="textformat" label="Format" size={26} />
              </div>
              <div className="flex items-center gap-0.5">
                <MacToolbarButton icon="square.and.arrow.up" label="Share" size={26} />
                <MacToolbarButton icon="ellipsis.circle" label="More" size={26} />
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  className="flex items-center justify-center w-[26px] h-[26px] rounded-[5px] text-white/50 hover:bg-white/8 hover:text-red-400 transition-colors cursor-default"
                  title="Delete"
                >
                  <SFSymbol name="trash" size={14} />
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="px-5 pt-3 pb-2">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] text-white/55 uppercase tracking-[0.04em]">Note</div>
                  <div className="text-[18px] font-semibold text-white/92 truncate">{activeNote.title}</div>
                </div>
                <span className="text-[11px] text-white/28 shrink-0">{formatFullDate(activeNote.updated)}</span>
              </div>
            </div>

            {/* Editor */}
            <textarea
              ref={editorRef}
              value={activeNote.content}
              onChange={e => updateNote(e.target.value)}
              className="flex-1 px-5 pb-4 bg-transparent text-white/90 text-[14px] leading-[1.6] outline-none resize-none"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                caretColor: '#0a84ff',
              }}
              placeholder="Start typing..."
              spellCheck={false}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20">
            <SFSymbol name="doc.text" size={40} color="rgba(255,255,255,0.1)" />
            <span className="text-[14px] mt-2">No Note Selected</span>
          </div>
        )}
      </div>
    </div>
  );
}
