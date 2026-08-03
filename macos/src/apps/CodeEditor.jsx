import { useEffect, useMemo, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToolbarButton } from '../components/ui/MacControls';

/* ---------- One Dark theme palette ---------- */
const COLORS = {
  bg: '#1e2127',
  bgAlt: '#21252b',
  bgPanel: '#282c34',
  bgHighlight: '#2c313a',
  border: '#181a1f',
  borderSoft: '#3e4451',
  text: '#abb2bf',
  textDim: '#5c6370',
  textBright: '#e6edf3',
  keyword: '#c678dd',
  string: '#98c379',
  func: '#61afef',
  type: '#e5c07b',
  comment: '#7f848e',
  number: '#d19a66',
  operator: '#56b6c2',
  decorator: '#e5c07b',
  class: '#e5c07b',
  accent: '#61afef',
};

/* ---------- Syntax highlighting (One Dark) ---------- */
function escapeHtml(s) {
  return s.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
}

function highlightLine(line, lang) {
  const kw = ({
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'type', 'interface', 'class', 'extends', 'implements', 'new', 'async', 'await', 'try', 'catch', 'throw', 'public', 'private', 'readonly', 'enum', 'static', 'abstract', 'namespace', 'declare'],
    rust: ['pub', 'fn', 'let', 'mut', 'struct', 'enum', 'impl', 'trait', 'match', 'if', 'else', 'for', 'while', 'loop', 'return', 'use', 'mod', 'crate', 'self', 'Self', 'async', 'await', 'Result', 'Option', 'Ok', 'Err', 'Some', 'None', 'move', 'ref', 'where', 'as', 'in'],
    jsx: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'class', 'extends', 'new', 'async', 'await', 'try', 'catch', 'default', 'switch', 'case', 'break', 'continue'],
  })[lang] || ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'import', 'export', 'from'];

  const types = ['string', 'number', 'bool', 'boolean', 'void', 'any', 'unknown', 'never', 'u8', 'u16', 'u32', 'u64', 'i8', 'i16', 'i32', 'i64', 'f32', 'f64', 'usize', 'isize', 'char', 'str', 'vec'];

  // Escape first
  let out = escapeHtml(line);

  // Comments — process by extracting and replacing with placeholder
  const commentMatch = out.match(/(\/\/.*$)/);
  const comment = commentMatch ? commentMatch[0] : '';
  if (comment) out = out.slice(0, out.indexOf('//'));

  // Decorators: @Component
  out = out.replace(/@([A-Za-z_]\w*)/g, `<span style="color:${COLORS.decorator}">@$1</span>`);

  // Strings (single, double, backtick)
  out = out.replace(/(['"`])([^'"`\n]*?)\1/g, `<span style="color:${COLORS.string}">$1$2$1</span>`);

  // Keywords (word bounded)
  const kwRe = new RegExp(`\\b(${kw.join('|')})\\b`, 'g');
  out = out.replace(kwRe, `<span style="color:${COLORS.keyword}">$1</span>`);

  // Booleans / constants
  out = out.replace(/\b(true|false|null|undefined|None|Some|Ok|Err)\b/g, `<span style="color:${COLORS.keyword}">$1</span>`);

  // Types
  const typeRe = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
  out = out.replace(typeRe, `<span style="color:${COLORS.type}">$1</span>`);

  // Class names — capitalized identifiers
  out = out.replace(/\b([A-Z][A-Za-z0-9_]*)\b/g, `<span style="color:${COLORS.class}">$1</span>`);

  // Function definitions: keyword followed by name(
  out = out.replace(/\b(function|fn)\s+([A-Za-z_]\w*)/g, `$1 <span style="color:${COLORS.func};font-weight:600">$2</span>`);

  // Function calls — name followed by (
  out = out.replace(/([A-Za-z_]\w*)(\s*\()/g, `<span style="color:${COLORS.func}">$1</span>$2`);

  // Numbers
  out = out.replace(/\b(\d+\.?\d*)\b/g, `<span style="color:${COLORS.number}">$1</span>`);

  // Operators
  out = out.replace(/([+\-*/%=<>!&|?]+)/g, `<span style="color:${COLORS.operator}">$1</span>`);

  if (comment) out += `<span style="color:${COLORS.comment}">${comment}</span>`;
  return out;
}

function syntaxHighlight(code, lang) {
  return code.split('\n').map(l => highlightLine(l, lang)).join('\n');
}

/* ---------- File tree ---------- */
function buildTree(snippet) {
  // Build a representative tree based on the project's snippet file path.
  const parts = snippet.file.split('/');
  const fileName = parts.pop();
  const folders = parts;
  const projectName = 'vellum';
  return {
    name: projectName,
    children: [
      {
        name: 'src',
        children: [
          { name: 'watermark.ts', active: fileName === 'watermark.ts' },
          { name: 'encode.ts' },
          { name: 'crc8.ts' },
          { name: 'index.ts' },
        ],
      },
      { name: 'lib', children: [{ name: 'payload.ts' }, { name: 'merkle.ts' }] },
      { name: 'tests', children: [{ name: 'watermark.test.ts' }] },
      { name: 'README.md' },
      { name: 'package.json' },
    ],
  };
}

function TreeNode({ node, depth = 0, activeFile }) {
  const isFolder = !!node.children;
  const isActive = node.active || (activeFile && node.name === activeFile.split('/').pop() && !isFolder);
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => isFolder && setOpen(o => !o)}
        className="flex items-center w-full text-left rounded-[4px] transition-colors group"
        style={{
          paddingLeft: 8 + depth * 14,
          paddingRight: 6,
          paddingTop: 3,
          paddingBottom: 3,
          background: isActive ? 'rgba(86,182,194,0.18)' : 'transparent',
          color: isActive ? COLORS.textBright : COLORS.text,
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        {isFolder ? (
          <>
            <SFSymbol name={open ? 'chevron.down' : 'chevron.right'} size={8} color={COLORS.textDim} />
            <span style={{ width: 4 }} />
            <SFSymbol name="folder" size={12} color="#61afef" />
            <span className="text-[12px] ml-1.5 truncate" style={{ fontWeight: 500 }}>{node.name}</span>
          </>
        ) : (
          <>
            <span style={{ width: 12 }} />
            <SFSymbol
              name="doc.text"
              size={12}
              color={isActive ? '#e5c07b' : COLORS.textDim}
            />
            <span
              className="text-[12px] ml-1.5 truncate"
              style={{ color: isActive ? COLORS.textBright : COLORS.text }}
            >
              {node.name}
            </span>
          </>
        )}
      </button>
      {isFolder && open && node.children.map((c, i) => (
        <TreeNode key={i} node={c} depth={depth + 1} activeFile={activeFile} />
      ))}
    </div>
  );
}

/* ---------- Minimap (visual scale representation) ---------- */
function Minimap({ code, lang }) {
  const lines = code.split('\n');
  return (
    <div
      className="shrink-0 overflow-hidden relative"
      style={{
        width: 56,
        background: COLORS.bg,
        borderLeft: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="py-2 px-1">
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              height: 2,
              width: Math.min(48, Math.max(0, l.trim().length * 1.6)),
              marginBottom: 1,
              borderRadius: 1,
              background:
                l.trim().startsWith('//') ? 'rgba(127,132,142,0.35)'
                : l.includes('const') || l.includes('fn') || l.includes('function') ? 'rgba(198,120,221,0.45)'
                : l.includes("'") || l.includes('"') ? 'rgba(152,195,121,0.4)'
                : 'rgba(171,178,191,0.25)',
            }}
          />
        ))}
      </div>
      {/* viewport indicator */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: 8,
          height: 40,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
        }}
      />
    </div>
  );
}

/* ---------- Main component ---------- */
export default function CodeEditor() {
  const [projects, setProjects] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [activeLine] = useState(3); // visual "current line"

  useEffect(() => {
    fetch('/data/projects.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setProjects(d); setActiveIdx(0); })
      .catch(() => setProjects([]));
  }, []);

  const active = projects[activeIdx];
  const code = active?.snippet?.code || '';
  const lang = active?.snippet?.lang || 'jsx';
  const file = active?.snippet?.file || '';

  const highlighted = useMemo(() => syntaxHighlight(code, lang), [code, lang]);
  const tree = useMemo(() => active ? buildTree(active.snippet) : null, [active]);
  const lineCount = code.split('\n').length;

  if (!active) {
    return <div className="h-full flex items-center justify-center text-white/30">Loading...</div>;
  }

  const languageLabel = ({ typescript: 'TypeScript', rust: 'Rust', jsx: 'JavaScript' })[lang] || 'Plain Text';

  return (
    <div className="h-full w-full flex flex-col" style={{ background: COLORS.bg, color: COLORS.text }}>
      {/* ===== Top toolbar ===== */}
      <div
        className="flex items-center h-[44px] shrink-0 px-2 gap-1.5 DragHandle"
        style={{ background: 'rgba(33,37,43,0.84)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        <MacToolbarButton icon="play.fill" label="Run" onClick={() => {}} />
        <MacToolbarButton
          icon={showTerminal ? 'terminal.fill' : 'terminal'}
          label="Toggle Terminal"
          active={showTerminal}
          onClick={() => setShowTerminal(s => !s)}
        />
        <MacToolbarButton icon="magnifyingglass" label="Search" onClick={() => {}} />
        <div className="flex-1" />
        <div className="flex items-center gap-2 pr-1">
          <span
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]"
            style={{ background: 'transparent', color: COLORS.textDim }}
          >
            <SFSymbol name="star.fill" size={10} color="#e5c07b" />
            {active.stars ?? 0}
          </span>
          <a
            href={active.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-colors no-underline"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: COLORS.textBright,
              border: '0.5px solid rgba(255,255,255,0.12)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <SFSymbol name="chevron.left.slash.chevron.right" size={11} color={COLORS.textBright} />
            View on GitHub
          </a>
        </div>
      </div>

      {/* ===== Tab bar ===== */}
      <div
        className="flex items-stretch h-[34px] shrink-0 pl-1"
        style={{ background: 'rgba(33,37,43,0.74)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        {projects.map((p, i) => {
          const tabName = p.snippet?.file?.split('/').pop();
          const isActive = i === activeIdx;
          return (
            <div
              key={p.id}
              onClick={() => setActiveIdx(i)}
              className="group flex items-center gap-2 px-3 cursor-default transition-colors"
              style={{
                background: isActive ? COLORS.bg : 'transparent',
                color: isActive ? COLORS.textBright : COLORS.textDim,
                borderRight: '0.5px solid rgba(255,255,255,0.08)',
                borderTop: isActive ? '1px solid transparent' : '1px solid transparent',
                borderBottom: isActive ? `1px solid ${COLORS.bg}` : '1px solid transparent',
              }}
            >
              <div
                className="w-[7px] h-[7px] rounded-full shrink-0"
                style={{ background: p.color }}
              />
              <span className="text-[12px] truncate" style={{ maxWidth: 140 }}>{tabName}</span>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                style={{ width: 16, height: 16, borderRadius: 4, color: COLORS.textDim }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                title="Close"
              >
                <SFSymbol name="xmark" size={9} color={COLORS.textDim} />
              </button>
              {isActive && (
                <div
                  className="absolute"
                  style={{
                    height: 1,
                    background: COLORS.accent,
                    alignSelf: 'stretch',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ===== Main body: sidebar + editor ===== */}
      <div className="flex-1 flex min-h-0">
        {/* ----- File tree sidebar ----- */}
        <div
          className="shrink-0 flex flex-col"
          style={{ width: 200, background: 'rgba(33,37,43,0.74)', borderRight: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="px-3 pt-2.5 pb-2 text-[10px] uppercase tracking-wider"
            style={{ color: COLORS.textDim, fontWeight: 600 }}
          >
            Explorer
          </div>
          <div className="px-2 pb-1.5 flex items-center gap-1.5">
            <SFSymbol name="folder.fill" size={12} color="#61afef" />
            <span className="text-[12px] font-semibold truncate" style={{ color: COLORS.textBright }}>
              {active.repo?.split('/').pop()}
            </span>
          </div>
          <div className="overflow-y-auto flex-1 pb-2">
            {tree && <TreeNode node={tree} activeFile={file} />}
          </div>
        </div>

        {/* ----- Editor column ----- */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumbs */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] shrink-0"
            style={{
              background: COLORS.bgAlt,
              color: COLORS.textDim,
              borderBottom: '0.5px solid rgba(255,255,255,0.08)',
            }}
          >
            <SFSymbol name="folder" size={10} color={COLORS.textDim} />
            <span>{active.repo}</span>
            <SFSymbol name="chevron.right" size={8} color={COLORS.textDim} />
            {file.split('/').map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                <span style={{ color: i === arr.length - 1 ? COLORS.textBright : COLORS.textDim }}>{part}</span>
                {i < arr.length - 1 && <SFSymbol name="chevron.right" size={8} color={COLORS.textDim} />}
              </span>
            ))}
          </div>

          {/* Code + minimap */}
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 overflow-auto" style={{ background: COLORS.bg }}>
              <div className="flex min-h-full">
                {/* Line numbers */}
                <div
                  className="shrink-0 select-none text-right pr-2 pl-3 py-3"
                  style={{ background: COLORS.bg, color: COLORS.textDim }}
                >
                  {code.split('\n').map((_, i) => (
                    <div
                      key={i}
                      className="text-[12px] leading-[1.6] font-mono"
                      style={{ color: i + 1 === activeLine ? COLORS.textBright : COLORS.textDim }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Code content with current-line highlight */}
                <div className="relative flex-1 min-w-0">
                  {/* current line highlight overlay */}
                  <div
                    className="pointer-events-none absolute left-0 right-0"
                    style={{
                      top: 12 + (activeLine - 1) * 19.2,
                      height: 19.2,
                      background: COLORS.bgHighlight,
                      zIndex: 0,
                    }}
                  />
                  <pre
                    className="relative py-3 px-4 text-[12px] leading-[1.6] font-mono overflow-x-auto"
                    style={{ color: COLORS.text, background: 'transparent' }}
                  >
                    <code
                      style={{ background: 'transparent' }}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </pre>
                </div>
              </div>
            </div>

            {/* Minimap */}
            <Minimap code={code} lang={lang} />
          </div>

          {/* Status bar */}
          <div
            className="flex items-center gap-3 px-3 py-1 text-[11px] shrink-0"
            style={{
              background: 'rgba(51,153,238,0.15)',
              color: COLORS.textBright,
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <span className="flex items-center gap-1">
              <SFSymbol name="chevron.left.forwardslash.chevron.right" size={10} color="#56b6c2" />
              <span style={{ color: '#56b6c2' }}>{active.repo?.split('/')[0]}</span>
              <span style={{ color: COLORS.textDim }}>/</span>
              <span>{active.repo?.split('/')[1]}</span>
            </span>
            <span style={{ color: COLORS.textDim }}>main</span>
            <div className="flex-1" />
            <span style={{ color: COLORS.textDim }}>{languageLabel}</span>
            <span style={{ color: COLORS.textDim }}>UTF-8</span>
            <span style={{ color: COLORS.textDim }}>LF</span>
            <span style={{ color: COLORS.textDim }}>
              Ln {activeLine}, Col 1
            </span>
            <span style={{ color: COLORS.textDim }}>Spaces: 2</span>
          </div>

          {/* Terminal panel */}
          {showTerminal && (
            <div
              className="shrink-0 flex flex-col"
              style={{
                height: 160,
                background: COLORS.bg,
                borderTop: `1px solid ${COLORS.borderSoft}`,
              }}
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 text-[11px]"
                style={{ color: COLORS.textDim, borderBottom: `1px solid ${COLORS.border}` }}
              >
                <SFSymbol name="terminal" size={11} color={COLORS.textDim} />
                <span>Terminal</span>
                <span style={{ color: COLORS.textDim }}>— zsh</span>
                <div className="flex-1" />
                <button
                  onClick={() => setShowTerminal(false)}
                  className="opacity-70 hover:opacity-100"
                  title="Hide"
                >
                  <SFSymbol name="xmark" size={10} color={COLORS.textDim} />
                </button>
              </div>
              <div
                className="px-3 py-2 font-mono text-[12px] leading-[1.5] flex-1 overflow-auto"
                style={{ color: COLORS.text }}
              >
                <div><span style={{ color: COLORS.func }}>owen</span><span style={{ color: COLORS.textDim }}>@vellum </span><span style={{ color: COLORS.string }}>~/dev/{active.repo?.split('/').pop()}</span> % </div>
                <div style={{ color: COLORS.comment }}># build & run</div>
                <div>npm run dev</div>
                <div style={{ color: COLORS.string }}>  ➜  Local:    http://localhost:5173/</div>
                <div style={{ color: COLORS.string }}>  ➜  Network: use --host to expose</div>
                <div style={{ opacity: 0.6 }}>▎</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Bottom project info bar (breadcrumb styled) ===== */}
      <div
        className="shrink-0 px-4 py-2.5 flex items-center gap-3"
        style={{
          background: COLORS.bgAlt,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <a
          href={active.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[12px] no-underline shrink-0"
          style={{ color: COLORS.text }}
        >
          <SFSymbol name="book" size={12} color={COLORS.textDim} />
          <span className="truncate" style={{ maxWidth: 160 }}>{active.repo}</span>
        </a>
        <span style={{ color: COLORS.textDim }}>/</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] truncate">
            <span style={{ color: COLORS.textBright, fontWeight: 600 }}>{active.title}</span>
            <span style={{ color: COLORS.textDim }}> — {active.subtitle}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {active.tech?.map(t => (
              <span
                key={t}
                className="px-1.5 py-[1px] rounded text-[10px]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <a
          href={active.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] no-underline transition-colors"
          style={{
            background: 'rgba(86,182,194,0.12)',
            color: COLORS.textBright,
            border: '1px solid rgba(86,182,194,0.25)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(86,182,194,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(86,182,194,0.12)'; }}
        >
          <SFSymbol name="chevron.left.slash.chevron.right" size={11} color={COLORS.textBright} />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
