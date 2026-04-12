import { useState, useRef, useCallback } from 'react';
import SFSymbol from '../components/icons/SFSymbol';

const FONTS = ['Helvetica Neue', 'Georgia', 'Times New Roman', 'Courier New', 'Arial', 'Verdana', 'Menlo'];
const SIZES = [9, 10, 11, 12, 14, 18, 24, 36, 48, 64];

export default function TextEdit() {
  const editorRef = useRef(null);
  const [font, setFont] = useState('Helvetica Neue');
  const [fontSize, setFontSize] = useState(14);
  const [activeFormats, setActiveFormats] = useState({});

  const exec = useCallback((cmd, val) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    updateActiveFormats();
  }, []);

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

  const TbBtn = ({ icon, active, onClick, label }) => (
    <button
      className="flex items-center justify-center w-[26px] h-[22px] rounded-[3px] transition-colors cursor-default"
      style={{
        background: active ? 'rgba(0,0,0,0.12)' : 'transparent',
        color: active ? '#000' : '#555',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      onClick={onClick}
      title={label}
    >
      {typeof icon === 'string' ? <SFSymbol name={icon} size={13} color="currentColor" weight={active ? 2 : 1.5} /> : icon}
    </button>
  );

  const Sep = () => <div className="w-px h-4 mx-1" style={{ background: 'rgba(0,0,0,0.12)' }} />;

  return (
    <div className="flex flex-col h-full" style={{ background: '#fff' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-2 h-[32px] shrink-0"
        style={{ background: '#ECECEC', borderBottom: '0.5px solid rgba(0,0,0,0.15)' }}
      >
        {/* Font family */}
        <select
          value={font}
          onChange={e => { setFont(e.target.value); exec('fontName', e.target.value); }}
          className="appearance-none bg-white text-[11px] text-[#333] rounded-[3px] pl-1.5 pr-4 h-[20px] border border-[#c8c8c8] cursor-default outline-none"
          style={{ fontFamily: font, maxWidth: 120 }}
        >
          {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>

        <Sep />

        {/* Font size stepper */}
        <div className="flex items-center bg-white rounded-[3px] border border-[#c8c8c8] h-[20px] overflow-hidden">
          <button onClick={sizeDown} className="px-1 text-[#555] hover:bg-[#e8e8e8] h-full">
            <SFSymbol name="minus" size={9} color="#555" />
          </button>
          <span className="text-[11px] text-[#333] w-[26px] text-center tabular-nums">{fontSize}</span>
          <button onClick={sizeUp} className="px-1 text-[#555] hover:bg-[#e8e8e8] h-full">
            <SFSymbol name="plus" size={9} color="#555" />
          </button>
        </div>

        <Sep />

        {/* B / I / U */}
        <TbBtn icon={<span className="text-[13px] font-bold" style={{ fontFamily: 'Georgia' }}>B</span>} active={activeFormats.bold} onClick={() => exec('bold')} label="Bold" />
        <TbBtn icon={<span className="text-[13px] italic" style={{ fontFamily: 'Georgia' }}>I</span>} active={activeFormats.italic} onClick={() => exec('italic')} label="Italic" />
        <TbBtn icon={<span className="text-[13px] underline" style={{ fontFamily: 'Georgia' }}>U</span>} active={activeFormats.underline} onClick={() => exec('underline')} label="Underline" />

        <Sep />

        {/* Alignment */}
        <TbBtn icon="text.alignleft" active={activeFormats.justifyLeft} onClick={() => exec('justifyLeft')} label="Align Left" />
        <TbBtn icon="text.aligncenter" active={activeFormats.justifyCenter} onClick={() => exec('justifyCenter')} label="Center" />
        <TbBtn icon="text.alignright" active={activeFormats.justifyRight} onClick={() => exec('justifyRight')} label="Align Right" />
        <TbBtn icon="text.justify" active={activeFormats.justifyFull} onClick={() => exec('justifyFull')} label="Justify" />

        <Sep />

        {/* Lists */}
        <TbBtn icon="list.bullet" onClick={() => exec('insertUnorderedList')} label="Bullet List" />
        <TbBtn icon="list.number" onClick={() => exec('insertOrderedList')} label="Numbered List" />
      </div>

      {/* Ruler */}
      <div className="h-[20px] relative overflow-hidden select-none shrink-0" style={{ background: '#F0F0F0', borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}>
        <div className="flex items-end h-full px-[60px]">
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} className="relative" style={{ width: 48, flexShrink: 0 }}>
              <div className="absolute bottom-0 left-0 w-px h-2" style={{ background: 'rgba(0,0,0,0.25)' }} />
              <span className="absolute bottom-[2px] left-[3px] text-[8px] text-[#999] tabular-nums">{i + 1}</span>
              <div className="absolute bottom-0 left-[24px] w-px h-1.5" style={{ background: 'rgba(0,0,0,0.15)' }} />
            </div>
          ))}
        </div>
        {/* Margin indicators */}
        <div className="absolute left-[57px] bottom-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '6px solid #666' }} />
        <div className="absolute right-[57px] bottom-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '6px solid #666' }} />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-full outline-none px-[60px] py-6 text-[#1d1d1f] leading-relaxed"
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
