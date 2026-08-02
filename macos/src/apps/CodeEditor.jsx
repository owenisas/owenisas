import { useEffect, useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';

function syntaxHighlight(code, lang) {
  // Simple syntax highlight for TypeScript/Rust/JSX
  const keywords = {
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'type', 'interface', 'class', 'extends', 'implements', 'new', 'async', 'await', 'try', 'catch', 'throw', 'public', 'private', 'readonly', 'enum'],
    rust: ['pub', 'fn', 'let', 'mut', 'struct', 'enum', 'impl', 'trait', 'match', 'if', 'else', 'for', 'while', 'loop', 'return', 'use', 'mod', 'crate', 'self', 'Self', 'async', 'await', 'Result', 'Option', 'Ok', 'Err', 'Some', 'None', 'string', 'vec'],
    jsx: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'class', 'extends', 'new', 'async', 'await', 'try', 'catch'],
  };
  const kw = keywords[lang] || keywords.jsx;

  return code.split('\n').map(line => {
    // Comments
    const commentMatch = line.match(/(\/\/.*$)/);
    const comment = commentMatch ? commentMatch[0] : null;
    let codePart = comment ? line.slice(0, line.indexOf('//')) : line;

    // Strings
    codePart = codePart.replace(/(['"`])([^'"`]*?)\1/g, '<span style="color:#7ee787">$1$2$1</span>');

    // Keywords
    const kwRegex = new RegExp(`\\b(${kw.join('|')})\\b`, 'g');
    codePart = codePart.replace(kwRegex, '<span style="color:#ff7b72">$1</span>');

    // Numbers
    codePart = codePart.replace(/\b(\d+)\b/g, '<span style="color:#d2a8ff">$1</span>');

    // Function calls
    codePart = codePart.replace(/(\w+)\s*\(/g, '<span style="color:#d2a8ff">$1</span>(');

    return codePart + (comment ? `<span style="color:#8b949e">${comment}</span>` : '');
  }).join('\n');
}

export default function CodeEditor() {
  const [projects, setProjects] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    fetch('/data/projects.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setProjects(d); setActiveIdx(0); })
      .catch(() => setProjects([]));
  }, []);

  const active = projects[activeIdx];

  if (!active) {
    return <div className="h-full flex items-center justify-center text-white/30">Loading...</div>;
  }

  return (
    <div className="h-full w-full flex flex-col" style={{ background: '#0d1117', color: '#e6edf3' }}>
      {/* Tab bar */}
      <div className="flex items-center h-[36px] shrink-0 px-2 gap-1" style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
        {projects.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveIdx(i)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-t-[6px] text-[12px] transition-colors"
            style={{
              background: i === activeIdx ? '#0d1117' : 'transparent',
              color: i === activeIdx ? '#e6edf3' : '#7d8590',
              borderBottom: i === activeIdx ? '2px solid #58a6ff' : '2px solid transparent',
            }}
          >
            <div className="w-[8px] h-[8px] rounded-full" style={{ background: p.color }} />
            {p.snippet?.file?.split('/').pop()}
          </button>
        ))}
      </div>

      {/* File path */}
      <div className="flex items-center gap-2 px-4 py-1.5 text-[11px]" style={{ background: '#161b22', color: '#7d8590', borderBottom: '1px solid #30363d' }}>
        <SFSymbol name="folder" size={11} color="#7d8590" />
        <span>{active.repo}</span>
        <span>/</span>
        <span>{active.snippet?.file}</span>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Line numbers */}
          <div className="shrink-0 py-3 px-2 text-right select-none" style={{ background: '#0d1117', borderRight: '1px solid #21262d' }}>
            {active.snippet?.code?.split('\n').map((_, i) => (
              <div key={i} className="text-[12px] leading-[1.6] font-mono" style={{ color: '#484f58', width: 28 }}>
                {i + 1}
              </div>
            ))}
          </div>
          {/* Code content */}
          <pre className="flex-1 py-3 px-4 text-[12px] leading-[1.6] font-mono overflow-x-auto">
            <code
              dangerouslySetInnerHTML={{
                __html: syntaxHighlight(active.snippet?.code || '', active.snippet?.lang || 'jsx'),
              }}
            />
          </pre>
        </div>
      </div>

      {/* Project info bar */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3" style={{ background: '#161b22', borderTop: '1px solid #30363d' }}>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold truncate">{active.title} <span className="font-normal opacity-50">— {active.subtitle}</span></div>
          <div className="text-[11px] flex flex-wrap gap-1 mt-0.5">
            {active.tech?.map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: '#21262d', color: '#7d8590' }}>{t}</span>
            ))}
          </div>
        </div>
        <a
          href={active.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors"
          style={{ background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' }}
        >
          <SFSymbol name="chevron.left.slash.chevron.right" size={12} color="#e6edf3" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
