import { useState, useRef, useEffect, useCallback } from 'react';

const COMMANDS = {
  help: () => 'Available commands: ls, pwd, whoami, echo, clear, date, neofetch, help, cat, uname, history, which, env',
  ls: (args) => {
    if (args === '-la' || args === '-al') return `total 0
drwxr-x---+ 15 thomas  staff   480 Apr 11 09:41 .
drwxr-xr-x   5 root    admin   160 Apr  1 00:00 ..
drwx------   5 thomas  staff   160 Apr 10 14:20 Desktop
drwx------   8 thomas  staff   256 Apr  9 11:32 Documents
drwx------  12 thomas  staff   384 Apr 11 08:15 Downloads
drwx------  64 thomas  staff  2048 Apr 11 09:00 Library
drwx------   4 thomas  staff   128 Mar 15 10:00 Movies
drwx------   3 thomas  staff    96 Mar 15 10:00 Music
drwx------   5 thomas  staff   160 Apr  8 16:45 Pictures
drwxr-xr-x   4 thomas  staff   128 Mar 15 10:00 Public`;
    return 'Desktop    Documents    Downloads    Library    Movies    Music    Pictures    Public';
  },
  pwd: () => '/Users/thomas',
  whoami: () => 'thomas',
  date: () => new Date().toString(),
  uname: (args) => {
    if (args === '-a') return 'Darwin MacBook-Pro.local 24.2.0 Darwin Kernel Version 24.2.0: RELEASE_ARM64_T6031 arm64';
    return 'Darwin';
  },
  which: (args) => {
    if (!args) return 'usage: which [-as] program ...';
    const known = ['ls', 'pwd', 'cat', 'echo', 'date', 'zsh', 'git', 'node', 'python3'];
    return known.includes(args) ? `/usr/bin/${args}` : `${args} not found`;
  },
  env: () => `SHELL=/bin/zsh\nHOME=/Users/thomas\nUSER=thomas\nPATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin\nTERM=xterm-256color\nLANG=en_US.UTF-8`,
  history: () => '', // handled specially
  cat: (args) => {
    if (!args) return 'cat: missing file operand';
    return `cat: ${args}: No such file or directory`;
  },
  neofetch: () => `\x1b[36m                    'c.          \x1b[0mthomas@MacBook-Pro
\x1b[36m                 ,xNMM.          \x1b[0m------------------
\x1b[36m               .OMMMMo           \x1b[0mOS: macOS 15.2 24C101 arm64
\x1b[36m               OMMM0,            \x1b[0mHost: MacBook Pro (16-inch, 2024)
\x1b[36m     .;loddo:' loolloddol;.      \x1b[0mKernel: 24.2.0
\x1b[36m   cKMMMMMMMMMMNWMMMMMMMMMM0:    \x1b[0mUptime: 3 hours, 42 mins
\x1b[36m .KMMMMMMMMMMMMMMMMMMMMMMMWd.    \x1b[0mShell: zsh 5.9
\x1b[36m XMMMMMMMMMMMMMMMMMMMMMMMX.      \x1b[0mResolution: 3456x2234
\x1b[36m;MMMMMMMMMMMMMMMMMMMMMMMM:       \x1b[0mDE: Aqua
\x1b[36m:MMMMMMMMMMMMMMMMMMMMMMMM:       \x1b[0mTerminal: macOS Terminal
\x1b[36m.MMMMMMMMMMMMMMMMMMMMMMMMX.      \x1b[0mCPU: Apple M3 Max
\x1b[36m kMMMMMMMMMMMMMMMMMMMMMMMMWd.    \x1b[0mGPU: Apple M3 Max
\x1b[36m .XMMMMMMMMMMMMMMMMMMMMMMMMMMk   \x1b[0mMemory: 8192MiB / 36864MiB
\x1b[36m  .XMMMMMMMMMMMMMMMMMMMMMMMMK.
\x1b[36m    kMMMMMMMMMMMMMMMMMMMMMMd
\x1b[36m     ;KMMMMMMMWXXWMMMMMMMk.
\x1b[36m       .cooc,.    .,coo:.`,
};

function parseAnsi(text) {
  const parts = [];
  const regex = /\x1b\[(\d+)m/g;
  let lastIndex = 0;
  let currentColor = null;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), color: currentColor });
    }
    const code = match[1];
    if (code === '0') currentColor = null;
    else if (code === '36') currentColor = '#56C8D8';
    else if (code === '32') currentColor = '#28c840';
    else if (code === '31') currentColor = '#ff5f57';
    else if (code === '33') currentColor = '#febc2e';
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), color: currentColor });
  }
  return parts;
}

export default function Terminal() {
  const [lines, setLines] = useState([
    { type: 'output', text: `Last login: ${new Date(Date.now() - 3600000).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', year: 'numeric' })} on ttys000` },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    const cmd = input.trim();
    if (!cmd) {
      setLines(prev => [...prev, { type: 'prompt', text: '' }]);
      setInput('');
      return;
    }

    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const [command, ...args] = cmd.split(' ');
    const argStr = args.join(' ');

    if (command === 'clear') {
      setLines([]);
      setInput('');
      return;
    }

    let output;
    if (command === 'history') {
      output = [...history, cmd].map((h, i) => `  ${String(i + 1).padStart(4)}  ${h}`).join('\n');
    } else if (command === 'echo') {
      output = argStr;
    } else if (COMMANDS[command]) {
      output = typeof COMMANDS[command] === 'function' ? COMMANDS[command](argStr) : COMMANDS[command];
    } else {
      output = `zsh: command not found: ${command}`;
    }

    const newLines = [{ type: 'prompt', text: cmd }];
    if (output) newLines.push({ type: 'output', text: output });
    setLines(prev => [...prev, ...newLines]);
    setInput('');
  }, [input, history]);

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
      setLines(prev => [...prev, { type: 'prompt', text: input + '^C' }]);
      setInput('');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.trim();
      if (partial) {
        const cmds = Object.keys(COMMANDS);
        const match = cmds.filter(c => c.startsWith(partial));
        if (match.length === 1) setInput(match[0] + ' ');
      }
    }
  }, [history, historyIndex, input]);

  const renderText = (text) => {
    if (!text.includes('\x1b[')) return text;
    return parseAnsi(text).map((p, i) => (
      <span key={i} style={p.color ? { color: p.color } : undefined}>{p.text}</span>
    ));
  };

  const Prompt = () => (
    <>
      <span style={{ color: '#28c840' }}>thomas@MacBook-Pro</span>
      <span className="text-white"> </span>
      <span style={{ color: '#56C8D8' }}>~</span>
      <span className="text-white"> % </span>
    </>
  );

  // Tab bar component
  const tabBar = (
    <div className="flex items-center h-[28px] px-2 gap-1" style={{ background: 'rgba(60,60,60,0.5)' }}>
      <div
        className="flex items-center gap-1.5 px-3 h-[22px] rounded-[5px] text-[11px] text-white/90"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
          <rect x="2" y="2" width="12" height="12" rx="2" />
          <path d="M2 6h12" />
        </svg>
        <span>zsh</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      {tabBar}
      {/* Terminal content */}
      <div
        className="flex-1 overflow-hidden flex flex-col"
        style={{
          background: 'rgba(0,0,0,0.88)',
          fontFamily: '"SF Mono", "Menlo", "Monaco", "Courier New", monospace',
          fontSize: 13,
          lineHeight: 1.4,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-2 pb-1">
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              {line.type === 'prompt' ? (
                <span><Prompt /><span className="text-white">{line.text}</span></span>
              ) : (
                <span className="text-[#c7c7c7]">{renderText(line.text)}</span>
              )}
            </div>
          ))}

          {/* Active input line */}
          <form onSubmit={handleSubmit} className="flex items-center whitespace-pre">
            <Prompt />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white outline-none caret-[#c7c7c7]"
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
