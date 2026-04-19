// Small, dependency-free Markdown renderer for portfolio content.
// Handles headings, bold/italic/code, links, bulleted/numbered lists, hr, code blocks, blockquotes.

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderInline(text) {
  let s = escapeHtml(text);
  // code
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // bold
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic
  s = s.replace(/(^|\W)\*([^*\n]+)\*(?=\W|$)/g, '$1<em>$2</em>');
  s = s.replace(/(^|\W)_([^_\n]+)_(?=\W|$)/g, '$1<em>$2</em>');
  // links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return s;
}

function parse(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push(`<pre data-lang="${escapeHtml(lang)}"><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${renderInline(h[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    // hr
    if (/^\s*---+\s*$/.test(line)) {
      out.push('<hr />');
      i++;
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${renderInline(buf.join(' '))}</blockquote>`);
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push(`<ul>${items.map(t => `<li>${renderInline(t)}</li>`).join('')}</ul>`);
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      out.push(`<ol>${items.map(t => `<li>${renderInline(t)}</li>`).join('')}</ol>`);
      continue;
    }

    // paragraph (collect until blank line)
    if (line.trim() === '') {
      i++;
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|```|>\s?|\s*[-*]\s|\s*\d+\.\s|\s*---+\s*$)/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    out.push(`<p>${renderInline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

export default function MarkdownView({ text, className = '' }) {
  const html = parse(text || '');
  return (
    <div
      className={`markdown-view ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
