import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { getByPath } from '../fs/vfs';
import { useFileContent } from '../hooks/useFileContent';

const FONTS = ['Helvetica Neue', 'Georgia', 'Times New Roman', 'Courier New', 'Arial', 'Verdana', 'Menlo'];
const SIZES = [9, 10, 11, 12, 14, 18, 24, 36, 48, 64];

const ToolbarGroup = ({ title, children, className = '' }) => (
  <div className={`flex items-center gap-1.5 ${className}`}>
    <span className="text-[10px] uppercase tracking-[0.06em] text-[#7a7a7a] pr-1">{title}</span>
    <div className="flex items-center gap-0.5">{children}</div>
  </div>
);

const ToolbarButton = ({ icon, active, onClick, label }) => (
  <button
    className="flex items-center justify-center w-[28px] h-[24px] rounded-[4px] transition-colors cursor-default"
    style={{
      background: active ? 'rgba(0,0,0,0.14)' : 'transparent',
      color: active ? '#111' : '#5b5b5b',
      boxShadow: active ? 'inset 0 0 0 1px rgba(0,0,0,0.08)' : 'inset 0 0 0 1px rgba(0,0,0,0)',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    onClick={onClick}
    title={label}
  >
    {typeof icon === 'string' ? <SFSymbol name={icon} size={13} color="currentColor" weight={active ? 2 : 1.5} /> : icon}
  </button>
);

// Simple md → html for seeding the editor. Uses MarkdownView-equivalent subset inline.
function mdToHtml(md) {
  if (!md) return '';
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = t => esc(t)
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.05);padding:1px 4px;border-radius:3px;font-family:Menlo,monospace;font-size:0.92em">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\W)\*([^*\n]+)\*(?=\W|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#0a84ff;text-decoration:underline">$1</a>');

  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      const lvl = h[1].length;
      const sizes = [26, 22, 18, 16, 15, 14];
      out.push(`<p style="font-size:${sizes[lvl - 1]}px;font-weight:${lvl < 3 ? 700 : 600};margin:${lvl < 3 ? '20px 0 10px' : '16px 0 8px'}">${inline(h[2].trim())}</p>`);
      i++; continue;
    }
    if (/^\s*---+\s*$/.test(line)) { out.push('<hr style="border:none;border-top:1px solid rgba(0,0,0,0.12);margin:16px 0"/>'); i++; continue; }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      out.push(`<ul style="margin:8px 0 12px 24px">${items.map(t => `<li style="margin:2px 0">${inline(t)}</li>`).join('')}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      out.push(`<ol style="margin:8px 0 12px 24px">${items.map(t => `<li style="margin:2px 0">${inline(t)}</li>`).join('')}</ol>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote style="border-left:3px solid rgba(0,0,0,0.15);padding:4px 12px;margin:12px 0;color:#555">${inline(buf.join(' '))}</blockquote>`);
      continue;
    }
    if (line.trim() === '') { i++; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|>\s?|\s*[-*]\s|\s*\d+\.\s|\s*---+\s*$)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p style="margin:0 0 10px;line-height:1.55">${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

export default function TextEdit({ windowData }) {
  const editorRef = useRef(null);
  const [font, setFont] = useState('Helvetica Neue');
  const [fontSize, setFontSize] = useState(14);
  const [activeFormats, setActiveFormats] = useState({});

  const vfsPath = windowData?.payload?.vfsPath;
  const node = useMemo(() => vfsPath ? getByPath(vfsPath) : null, [vfsPath]);
  const { text } = useFileContent(node?.contentUrl);

  const seededHtml = useMemo(() => {
    if (node && text) {
      if (node.kind === 'md') return mdToHtml(text);
      return `<pre style="font-family:Menlo,monospace;font-size:12px;white-space:pre-wrap;margin:0">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`;
    }
    return '<p style="margin-bottom:12px">Welcome to TextEdit.</p><p style="margin-bottom:12px">Start typing here to create a new document. Use the toolbar above to format your text.</p>';
  }, [node, text]);

  useEffect(() => {
    if (editorRef.current && seededHtml) {
      editorRef.current.innerHTML = seededHtml;
    }
  }, [seededHtml]);

  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
    });
  }, []);

  const exec = useCallback((cmd, val) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    updateActiveFormats();
  }, [updateActiveFormats]);

  const sizeUp = () => {
    const idx = SIZES.indexOf(fontSize);
    if (idx < SIZES.length - 1) setFontSize(SIZES[idx + 1]);
  };
  const sizeDown = () => {
    const idx = SIZES.indexOf(fontSize);
    if (idx > 0) setFontSize(SIZES[idx - 1]);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#fff' }}>
      <div
        className="flex items-center justify-between gap-2 px-3 h-[40px] shrink-0"
        style={{ background: 'linear-gradient(to bottom, #efefef, #e9e9e9)', borderBottom: '0.5px solid rgba(0,0,0,0.12)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5">
            <select
              value={font}
              onChange={e => { setFont(e.target.value); exec('fontName', e.target.value); }}
              className="appearance-none bg-white text-[11px] text-[#333] rounded-[4px] pl-2 pr-5 h-[22px] border border-[#c9c9c9] cursor-default outline-none"
              style={{ fontFamily: font, maxWidth: 132 }}
            >
              {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
            <div className="flex items-center bg-white rounded-[4px] border border-[#c9c9c9] h-[22px] overflow-hidden">
              <button onClick={sizeDown} className="px-1.5 text-[#555] hover:bg-[#ececec] h-full">
                <SFSymbol name="minus" size={9} color="#555" />
              </button>
              <span className="text-[11px] text-[#333] w-[28px] text-center tabular-nums">{fontSize}</span>
              <button onClick={sizeUp} className="px-1.5 text-[#555] hover:bg-[#ececec] h-full">
                <SFSymbol name="plus" size={9} color="#555" />
              </button>
            </div>
          </div>
          <div className="w-px h-5 bg-black/10" />
          <ToolbarGroup title="Style">
            <ToolbarButton icon={<span className="text-[13px] font-bold" style={{ fontFamily: 'Georgia' }}>B</span>} active={activeFormats.bold} onClick={() => exec('bold')} label="Bold" />
            <ToolbarButton icon={<span className="text-[13px] italic" style={{ fontFamily: 'Georgia' }}>I</span>} active={activeFormats.italic} onClick={() => exec('italic')} label="Italic" />
            <ToolbarButton icon={<span className="text-[13px] underline" style={{ fontFamily: 'Georgia' }}>U</span>} active={activeFormats.underline} onClick={() => exec('underline')} label="Underline" />
          </ToolbarGroup>
          <div className="w-px h-5 bg-black/10" />
          <ToolbarGroup title="Align">
            <ToolbarButton icon="text.alignleft" active={activeFormats.justifyLeft} onClick={() => exec('justifyLeft')} label="Align Left" />
            <ToolbarButton icon="text.aligncenter" active={activeFormats.justifyCenter} onClick={() => exec('justifyCenter')} label="Center" />
            <ToolbarButton icon="text.alignright" active={activeFormats.justifyRight} onClick={() => exec('justifyRight')} label="Align Right" />
            <ToolbarButton icon="text.justify" active={activeFormats.justifyFull} onClick={() => exec('justifyFull')} label="Justify" />
          </ToolbarGroup>
          <div className="w-px h-5 bg-black/10" />
          <ToolbarGroup title="Lists">
            <ToolbarButton icon="list.bullet" onClick={() => exec('insertUnorderedList')} label="Bullet List" />
            <ToolbarButton icon="list.number" onClick={() => exec('insertOrderedList')} label="Numbered List" />
          </ToolbarGroup>
        </div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-[#7e7e7e] whitespace-nowrap truncate max-w-[200px]">
          {node?.name || 'Untitled'}
        </div>
      </div>

      <div className="h-[18px] relative overflow-hidden select-none shrink-0" style={{ background: 'linear-gradient(to bottom, #f5f5f5, #efefef)', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-end h-full px-[72px]">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="relative" style={{ width: 52, flexShrink: 0 }}>
              <div className="absolute bottom-0 left-0 w-px h-1.5" style={{ background: 'rgba(0,0,0,0.16)' }} />
              <span className="absolute bottom-[1px] left-[3px] text-[8px] text-[#a0a0a0] tabular-nums">{i + 1}</span>
              <div className="absolute bottom-0 left-[26px] w-px h-1" style={{ background: 'rgba(0,0,0,0.08)' }} />
            </div>
          ))}
        </div>
        <div className="absolute left-[69px] bottom-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '5px solid rgba(0,0,0,0.35)' }} />
        <div className="absolute right-[69px] bottom-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '5px solid rgba(0,0,0,0.35)' }} />
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-full w-full max-w-[760px] mx-auto outline-none px-8 py-10 text-[#1d1d1f] leading-relaxed"
          style={{ fontFamily: font, fontSize, caretColor: '#000' }}
          onSelect={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onKeyDown={e => {
            if (e.metaKey || e.ctrlKey) {
              if (e.key === 'b') { e.preventDefault(); exec('bold'); }
              else if (e.key === 'i') { e.preventDefault(); exec('italic'); }
              else if (e.key === 'u') { e.preventDefault(); exec('underline'); }
            }
          }}
        />
      </div>
    </div>
  );
}
