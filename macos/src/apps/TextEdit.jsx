import { useState, useRef, useCallback } from 'react';
import SFSymbol from '../components/icons/SFSymbol';

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

export default function TextEdit() {
  const editorRef = useRef(null);
  const [font, setFont] = useState('Helvetica Neue');
  const [fontSize, setFontSize] = useState(14);
  const [activeFormats, setActiveFormats] = useState({});

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
    if (idx < SIZES.length - 1) {
      const s = SIZES[idx + 1];
      setFontSize(s);
      exec('fontSize', 4);
    }
  };

  const sizeDown = () => {
    const idx = SIZES.indexOf(fontSize);
    if (idx > 0) {
      const s = SIZES[idx - 1];
      setFontSize(s);
      exec('fontSize', 3);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#fff' }}>
      {/* Toolbar */}
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
        <div className="text-[10px] uppercase tracking-[0.08em] text-[#7e7e7e] whitespace-nowrap">Document</div>
      </div>

      {/* Ruler */}
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
        {/* Margin indicators */}
        <div className="absolute left-[69px] bottom-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '5px solid rgba(0,0,0,0.35)' }} />
        <div className="absolute right-[69px] bottom-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '5px solid rgba(0,0,0,0.35)' }} />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-full w-full max-w-[760px] mx-auto outline-none px-6 py-8 text-[#1d1d1f] leading-relaxed"
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
          dangerouslySetInnerHTML={{
            __html: '<p style="margin-bottom:12px">Welcome to TextEdit.</p><p style="margin-bottom:12px">Start typing here to create a new document. Use the toolbar above to format your text with bold, italic, underline, alignment, and list options.</p>'
          }}
        />
      </div>
    </div>
  );
}
