import { useState, useRef, useEffect, useCallback } from 'react';
import { getByPath, joinPath, parentPath, homePath, listDir } from '../fs/vfs';
import { useFileContent } from '../hooks/useFileContent';

function parseAnsi(text) {
  const parts = [];
  let currentColor = null;
  let index = 0;
  while (index < text.length) {
    const escIndex = text.indexOf('\u001b[', index);
    if (escIndex === -1) {
      parts.push({ text: text.slice(index), color: currentColor });
      break;
    }
    if (escIndex > index) {
      parts.push({ text: text.slice(index, escIndex), color: currentColor });
    }
    const codeEnd = text.indexOf('m', escIndex);
    if (codeEnd === -1) {
      parts.push({ text: text.slice(escIndex), color: currentColor });
      break;
    }
    const code = text.slice(escIndex + 2, codeEnd);
    if (code === '0') currentColor = null;
    else if (code === '36') currentColor = '#56C8D8';
    else if (code === '32') currentColor = '#28c840';
    else if (code === '31') currentColor = '#ff5f57';
    else if (code === '33') currentColor = '#febc2e';
    else if (code === '34') currentColor = '#6db3ff';
    else if (code === '35') currentColor = '#cd8aff';
    index = codeEnd + 1;
  }
  return parts;
}

function resolvePath(cwd, arg) {
  if (!arg || arg === '~' || arg === '~/') return homePath();
  if (arg.startsWith('~/')) return arg;
  if (arg.startsWith('/')) return '~' + arg;
  // relative
  const parts = arg.split('/').filter(Boolean);
  let cur = cwd;
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') cur = parentPath(cur);
    else cur = joinPath(cur, p);
  }
  return cur;
}

function displayPath(cwd) {
  if (cwd === '~' || cwd === '~/') return '~';
  return cwd;
}

const NEOFETCH = `\x1b[36m                    'c.          \x1b[0mthomas@macOS
\x1b[36m                 ,xNMM.          \x1b[0m------------------
\x1b[36m               .OMMMMo           \x1b[0mOS: macOS 15.2 (browser sim)
\x1b[36m               OMMM0,            \x1b[0mHost: owenisas.com
\x1b[36m     .;loddo:' loolloddol;.      \x1b[0mKernel: react 19
\x1b[36m   cKMMMMMMMMMMNWMMMMMMMMMM0:    \x1b[0mUptime: since you opened the tab
\x1b[36m .KMMMMMMMMMMMMMMMMMMMMMMMWd.    \x1b[0mShell: /bin/fake-zsh
\x1b[36m XMMMMMMMMMMMMMMMMMMMMMMMX.      \x1b[0mTerminal: Terminal.app
\x1b[36m;MMMMMMMMMMMMMMMMMMMMMMMM:       \x1b[0mCPU: V8
\x1b[36m:MMMMMMMMMMMMMMMMMMMMMMMM:       \x1b[0mGPU: your browser
\x1b[36m.MMMMMMMMMMMMMMMMMMMMMMMMX.      \x1b[0mMemory: whatever Chrome lets us have
\x1b[36m kMMMMMMMMMMMMMMMMMMMMMMMMWd.
\x1b[36m .XMMMMMMMMMMMMMMMMMMMMMMMMMMk
\x1b[36m  .XMMMMMMMMMMMMMMMMMMMMMMMMK.
\x1b[36m    kMMMMMMMMMMMMMMMMMMMMMMd
\x1b[36m     ;KMMMMMMMWXXWMMMMMMMk.
\x1b[36m       .cooc,.    .,coo:.`;

const ABOUT = `Thomas Suen — CS student, developer, photographer
Vancouver, BC • reunifylabs@gmail.com

  owenisas.com       github.com/owenisas
  linkedin.com/in/thomas-suen-84776a262   x.com/ThomasSuen6

Type \x1b[36mhelp\x1b[0m to see what this shell can do.
Type \x1b[36mls ~/Documents/Projects\x1b[0m to browse work.`;

const COWSAY = (msg) => {
  const text = msg || 'moo?';
  const top = '_'.repeat(text.length + 2);
  const bot = '-'.repeat(text.length + 2);
  return ` ${top}\n< ${text} >\n ${bot}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`;
};

const HELP = `Built-ins:
  ls [path]         list directory contents
  cd [path]         change directory (~ home)
  pwd               print working directory
  cat <file>        show file contents (renders md/txt)
  tree              show project tree from cwd
  open <file>       open file in appropriate app
  clear             clear screen (Ctrl+L)
  whoami            print user
  date              current date
  echo <text>       echo text
  history           command history
  neofetch          system info card
  cowsay <text>     classic
  about             portfolio summary
  contact           how to reach Thomas
  projects          list portfolio projects
  help              this message

Tab completes commands. ↑/↓ walks history.`;

const CONTACT = `email   reunifylabs@gmail.com
github  github.com/owenisas
site    owenisas.com
x       x.com/ThomasSuen6
linkedin linkedin.com/in/thomas-suen-84776a262

Prefer Mail.app — open it from the Dock.`;

const PROJECTS_OUT = `
  \x1b[36m1.\x1b[0m owenisas.com          macOS in the browser
  \x1b[36m2.\x1b[0m blender-showreel      Procedural product animation (Blender MCP)
  \x1b[36m3.\x1b[0m autonomous-systems    Long-horizon agents over enterprise data
  \x1b[36m4.\x1b[0m photography-notes     Street / landscape / aerial

Run: \x1b[33mcat ~/Documents/Projects/<slug>.md\x1b[0m for details.`;

const LAST_LOGIN_TEXT = `Last login: ${new Date(Date.now() - 3600000).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', year: 'numeric' })} on ttys000`;

function Prompt({ cwd }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]" />
        <span style={{ color: '#8fe28f' }}>thomas@owenisas</span>
      </span>
      <span style={{ color: '#56C8D8' }}>{displayPath(cwd)}</span>
      <span className="text-white/80">%</span>
    </span>
  );
}

// Deferred cat: fetches on demand, injects output when ready.
function CatLine({ url, onLoaded }) {
  const { text, loading, error } = useFileContent(url);
  useEffect(() => {
    if (!loading) onLoaded(error ? `cat: ${error}` : text);
  }, [loading, error, text, onLoaded]);
  return <span className="text-white/40">loading…</span>;
}

export default function Terminal({ onAppLaunch }) {
  const [cwd, setCwd] = useState(homePath());
  const [lines, setLines] = useState([
    { type: 'output', text: LAST_LOGIN_TEXT },
    { type: 'output', text: ABOUT },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const runBuiltin = useCallback((cmd, argStr, args) => {
    switch (cmd) {
      case 'help': return HELP;
      case 'about': return ABOUT;
      case 'contact': return CONTACT;
      case 'projects': return PROJECTS_OUT;
      case 'neofetch': return NEOFETCH;
      case 'cowsay': return COWSAY(argStr);
      case 'whoami': return 'thomas';
      case 'date': return new Date().toString();
      case 'echo': return argStr;
      case 'pwd': return cwd.replace('~', '/Users/thomas');
      case 'uname': return args[0] === '-a' ? 'Darwin owenisas.com 24.2.0 Darwin Kernel Version 24.2.0 arm64' : 'Darwin';
      case 'which': {
        if (!args[0]) return 'usage: which program';
        const known = ['ls', 'cd', 'pwd', 'cat', 'echo', 'date', 'help', 'about', 'contact', 'projects', 'neofetch', 'open', 'tree', 'cowsay'];
        return known.includes(args[0]) ? `/usr/bin/${args[0]}` : `${args[0]} not found`;
      }
      case 'env': return `SHELL=/bin/zsh\nHOME=/Users/thomas\nUSER=thomas\nTERM=xterm-256color`;
      case 'ls': {
        const target = resolvePath(cwd, args[0] || '.');
        const node = getByPath(target);
        if (!node) return `ls: ${args[0] || ''}: No such file or directory`;
        if (node.type === 'file') return node.name;
        const children = node.children;
        if (args.includes('-l') || args.includes('-la') || args.includes('-al')) {
          return children.map(c => {
            const kind = c.type === 'dir' ? 'd' : '-';
            const size = String(c.size || 0).padStart(6);
            return `${kind}rwxr-xr-x  thomas  ${size}  ${c.name}${c.type === 'dir' ? '/' : ''}`;
          }).join('\n');
        }
        return children.map(c => c.type === 'dir' ? `\x1b[34m${c.name}/\x1b[0m` : c.name).join('   ');
      }
      case 'cd': {
        const target = resolvePath(cwd, args[0] || '~');
        const node = getByPath(target);
        if (!node) return { error: `cd: no such file or directory: ${args[0]}` };
        if (node.type !== 'dir') return { error: `cd: not a directory: ${args[0]}` };
        if (node.locked) return { error: `cd: permission denied: ${args[0]}` };
        return { cd: target };
      }
      case 'tree': {
        const start = resolvePath(cwd, args[0] || '.');
        const root = getByPath(start);
        if (!root) return `tree: ${args[0]}: No such file or directory`;
        const out = [];
        function walk(node, prefix, isLast) {
          const connector = prefix === '' ? '' : (isLast ? '└── ' : '├── ');
          out.push(`${prefix}${connector}${node.type === 'dir' ? `\x1b[34m${node.name}/\x1b[0m` : node.name}`);
          if (node.type === 'dir') {
            const kids = node.children;
            kids.forEach((k, i) => {
              const newPrefix = prefix + (prefix === '' ? '' : (isLast ? '    ' : '│   '));
              walk(k, newPrefix, i === kids.length - 1);
            });
          }
        }
        walk(root, '', true);
        return out.slice(0, 60).join('\n');
      }
      case 'cat': {
        if (!args[0]) return 'cat: missing file operand';
        const target = resolvePath(cwd, args[0]);
        const node = getByPath(target);
        if (!node) return `cat: ${args[0]}: No such file or directory`;
        if (node.type !== 'file') return `cat: ${args[0]}: Is a directory`;
        if (!node.contentUrl) return '(empty)';
        return { fetchFile: node.contentUrl };
      }
      case 'open': {
        if (!args[0]) return 'open: missing file operand';
        const target = resolvePath(cwd, args[0]);
        const node = getByPath(target);
        if (!node) return `open: ${args[0]}: No such file or directory`;
        if (node.type === 'dir') {
          onAppLaunch?.('finder', 'Finder', { vfsPath: target });
          return `Opening ${target} in Finder…`;
        }
        if (node.kind === 'md' || node.kind === 'text') {
          onAppLaunch?.('textedit', node.name, { vfsPath: target });
        } else if (node.kind === 'image' || node.kind === 'pdf') {
          onAppLaunch?.('preview', node.name, { vfsPath: target });
        }
        return `Opening ${node.name}…`;
      }
      case 'sudo': return `sudo: nice try`;
      case 'rm': return `rm: permission denied: this is a portfolio, not a shell`;
      default: return null;
    }
  }, [cwd, onAppLaunch]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    const cmdLine = input.trim();
    if (!cmdLine) {
      setLines(prev => [...prev, { type: 'prompt', text: '', cwd }]);
      setInput('');
      return;
    }

    setHistory(prev => [...prev, cmdLine]);
    setHistoryIndex(-1);

    const [command, ...args] = cmdLine.split(/\s+/);
    const argStr = args.join(' ');

    if (command === 'clear') {
      setLines([]);
      setInput('');
      return;
    }

    let output;
    if (command === 'history') {
      output = [...history, cmdLine].map((h, i) => `  ${String(i + 1).padStart(4)}  ${h}`).join('\n');
    } else {
      const res = runBuiltin(command, argStr, args);
      if (res === null) output = `zsh: command not found: ${command}`;
      else if (typeof res === 'object' && res.cd) { setCwd(res.cd); output = ''; }
      else if (typeof res === 'object' && res.error) output = res.error;
      else if (typeof res === 'object' && res.fetchFile) {
        // defer: push prompt + loading placeholder with fetchFile
        const newLines = [
          { type: 'prompt', text: cmdLine, cwd },
          { type: 'fetch', url: res.fetchFile, id: Date.now() + Math.random() },
        ];
        setLines(prev => [...prev, ...newLines]);
        setInput('');
        return;
      } else output = res;
    }

    const newLines = [{ type: 'prompt', text: cmdLine, cwd }];
    if (output) newLines.push({ type: 'output', text: output });
    setLines(prev => [...prev, ...newLines]);
    setInput('');
  }, [input, history, cwd, runBuiltin]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(idx);
        setInput(history[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const idx = historyIndex + 1;
        if (idx >= history.length) { setHistoryIndex(-1); setInput(''); }
        else { setHistoryIndex(idx); setInput(history[idx]); }
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setLines(prev => [...prev, { type: 'prompt', text: input + '^C', cwd }]);
      setInput('');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.trim();
      if (partial) {
        const cmds = ['help','ls','cd','pwd','cat','tree','open','clear','whoami','date','echo','history','neofetch','cowsay','about','contact','projects','which','env','uname'];
        // filename completion for ls/cd/cat/open/tree
        const parts = partial.split(/\s+/);
        if (parts.length > 1 && ['ls','cd','cat','open','tree'].includes(parts[0])) {
          const prefix = parts.slice(1).join(' ');
          const baseDir = prefix.includes('/') ? prefix.slice(0, prefix.lastIndexOf('/') + 1) : '';
          const stem = prefix.slice(baseDir.length);
          const lookupDir = baseDir ? resolvePath(cwd, baseDir) : cwd;
          const items = listDir(lookupDir).filter(c => c.name.startsWith(stem));
          if (items.length === 1) {
            const full = baseDir + items[0].name + (items[0].type === 'dir' ? '/' : '');
            setInput(parts[0] + ' ' + full);
          }
          return;
        }
        const match = cmds.filter(c => c.startsWith(partial));
        if (match.length === 1) setInput(match[0] + ' ');
      }
    }
  }, [history, historyIndex, input, cwd]);

  const resolveFetch = useCallback((id, text) => {
    setLines(prev => prev.map(l => l.id === id ? { type: 'output', text } : l));
  }, []);

  const renderText = (text) => {
    if (!text.includes('\x1b[')) return text;
    return parseAnsi(text).map((p, i) => (
      <span key={i} style={p.color ? { color: p.color } : undefined}>{p.text}</span>
    ));
  };

  const tabBar = (
    <div className="flex items-center justify-between h-[34px] px-2.5 gap-2" style={{ background: 'rgba(44,44,46,0.78)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div
        className="flex items-center gap-1.5 px-3 h-[24px] rounded-[6px] text-[11px] text-white/90"
        style={{ background: 'rgba(255,255,255,0.08)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
          <rect x="2" y="2" width="12" height="12" rx="2" />
          <path d="M2 6h12" />
        </svg>
        <span>zsh — {displayPath(cwd)}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-white/45 uppercase tracking-[0.08em]">
        <span className="px-2 py-1 rounded-full bg-white/6 text-white/65">Default</span>
        <span>UTF-8</span>
        <span>80x24</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {tabBar}
      <div
        className="flex-1 overflow-hidden flex flex-col"
        style={{
          background: 'rgba(0,0,0,0.88)',
          fontFamily: '"SF Mono", "Menlo", "Monaco", "Courier New", monospace',
          fontSize: 13,
          lineHeight: 1.5,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all mb-[2px]">
              {line.type === 'prompt' ? (
                <span className="inline-flex items-start gap-1.5"><Prompt cwd={line.cwd || cwd} /><span className="text-white">{line.text}</span></span>
              ) : line.type === 'fetch' ? (
                <span className="text-[#c7c7c7]"><CatLine url={line.url} onLoaded={text => resolveFetch(line.id, text)} /></span>
              ) : (
                <span className="text-[#c7c7c7]">{renderText(line.text)}</span>
              )}
            </div>
          ))}

          <form onSubmit={handleSubmit} className="flex items-center whitespace-pre pt-1">
            <Prompt cwd={cwd} />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 bg-transparent text-white outline-none caret-[#c7c7c7] ml-1"
              style={{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
