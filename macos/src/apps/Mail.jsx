import { useState } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacSidebarItem, MacSidebarSection, MacToolbarButton } from '../components/ui/MacControls';

const CONTACT_EMAIL = 'reunifylabs@gmail.com';

const inboxMessages = [
  {
    id: 'welcome',
    from: 'Thomas Suen',
    fromEmail: CONTACT_EMAIL,
    subject: "Welcome — you're inside the portfolio",
    preview: "Thanks for dropping by. If you want to actually reach me, tap Compose…",
    date: 'Just now',
    body: `Hi —

You're inside a simulated Mail.app running in the browser. Neat, right?

To actually reach me, click **Compose** in the toolbar. It opens your real mail client with ${CONTACT_EMAIL} pre-filled.

A few ways I'm useful to a team:
• One-person-team shipping — design, graphics, backend, deploy
• Graphics / 3D / agent tooling
• Contract or internship, remote-friendly

Also try:
• Finder → Documents → Resume.md
• Messages → the "Work with me" thread
• Terminal → type \`contact\`

— Thomas`,
    unread: true,
    flagged: true,
  },
  {
    id: 'projects',
    from: 'Thomas Suen',
    fromEmail: CONTACT_EMAIL,
    subject: 'What I\'m working on right now',
    preview: 'Three things: this portfolio, a Blender MCP pipeline, and a batch of vertical agents.',
    date: 'Today',
    body: `Three current threads:

1. owenisas.com — a full macOS simulation in the browser. Real windowing, vfs, dock magnification, scripted apps. The thing you're using.

2. A Blender-MCP animation pipeline. Agents keyframe a product shot procedurally: camera moves, light rigs, simple hero shots for eCom / trailers.

3. Vertical agents over enterprise data — sales, ops, legal. Boring to describe, fun to build.

Open Finder → Documents → Projects for write-ups.`,
    unread: true,
    flagged: false,
  },
  {
    id: 'hire',
    from: 'Thomas Suen',
    fromEmail: CONTACT_EMAIL,
    subject: 'Hiring / contracting me',
    preview: 'Favourite shape of engagement is small team, high trust, product-adjacent eng.',
    date: 'Yesterday',
    body: `Short version:

• Small team, high trust, real ownership
• Product-adjacent engineering (graphics, agents, DX tooling)
• Contract or internship, remote-friendly
• Based in Vancouver, BC — open to relocation for the right role

Fastest way to start a conversation is just to reply to this thread — compose opens ${CONTACT_EMAIL} in your real mail client.`,
    unread: false,
    flagged: false,
  },
  {
    id: 'photos',
    from: 'Thomas Suen',
    fromEmail: CONTACT_EMAIL,
    subject: 'Photography — the other thing I do',
    preview: 'Street, landscape, drone. All shot and edited by hand.',
    date: 'Apr 10',
    body: `I shoot on a Sony A7 IV and a DJI Mavic 3. The Photography folder in Finder has the current set with EXIF.

Open Photos.app to browse — or Finder → Pictures → Photography.`,
    unread: false,
    flagged: false,
  },
];

const sidebar = {
  Mailboxes: [
    { id: 'inbox', label: 'Inbox', icon: 'tray', color: '#0A84FF', badge: inboxMessages.filter(m => m.unread).length },
    { id: 'vip', label: 'VIPs', icon: 'star.fill', color: '#FFD60A' },
    { id: 'flagged', label: 'Flagged', icon: 'flag.fill', color: '#FF453A' },
    { id: 'sent', label: 'Sent', icon: 'paperplane.fill', color: '#32D74B' },
    { id: 'drafts', label: 'Drafts', icon: 'doc.text', color: '#64D2FF' },
    { id: 'trash', label: 'Trash', icon: 'trash', color: '#8E8E93' },
  ],
};

function ComposeSheet({ onClose }) {
  const [to, setTo] = useState(CONTACT_EMAIL);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const send = () => {
    const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    onClose();
  };

  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center pt-10" style={{ background: 'rgba(0,0,0,0.35)' }}>
      <div className="w-[520px] max-w-[90%] rounded-[12px] overflow-hidden" style={{ background: 'rgba(28,28,30,0.98)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.08)' }}>
        <div className="h-[36px] flex items-center gap-2 px-3 border-b border-white/8" style={{ background: 'rgba(44,44,46,0.85)' }}>
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 cursor-default"
            aria-label="Close"
          />
          <span className="text-[12px] text-white/80 font-medium flex-1 text-center">New Message</span>
          <button
            onClick={send}
            className="flex items-center gap-1.5 px-3 h-[22px] rounded-[6px] text-[11px] text-white bg-[#0a84ff] hover:bg-[#0a84ff]/90 cursor-default"
          >
            <SFSymbol name="paperplane.fill" size={11} color="white" />
            Send
          </button>
        </div>
        <div className="divide-y divide-white/6">
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="text-[12px] text-white/45 w-[64px]">To:</span>
            <input value={to} onChange={e => setTo(e.target.value)} className="flex-1 bg-transparent text-[13px] text-white outline-none" />
          </div>
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="text-[12px] text-white/45 w-[64px]">Subject:</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="What's this about?" className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/30" />
          </div>
        </div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={`Write your message. When you hit Send, this opens your real mail client with ${CONTACT_EMAIL} pre-filled.`}
          className="w-full h-[260px] bg-transparent text-[13px] text-white outline-none p-4 resize-none placeholder:text-white/30 leading-relaxed"
        />
      </div>
    </div>
  );
}

export default function Mail() {
  const [activeMailbox, setActiveMailbox] = useState('inbox');
  const [selectedId, setSelectedId] = useState(inboxMessages[0].id);
  const [composing, setComposing] = useState(false);
  const [readSet, setReadSet] = useState(new Set());

  const visible = activeMailbox === 'flagged'
    ? inboxMessages.filter(m => m.flagged)
    : activeMailbox === 'inbox'
      ? inboxMessages
      : [];

  const selected = inboxMessages.find(m => m.id === selectedId) || null;

  const selectMessage = (id) => {
    setSelectedId(id);
    setReadSet(prev => new Set(prev).add(id));
  };

  return (
    <div className="flex h-full relative" style={{ background: 'rgba(22,22,24,0.98)' }}>
      <div
        className="w-[190px] shrink-0 flex flex-col pt-2 pb-1 overflow-y-auto"
        style={{ background: 'rgba(38,38,40,0.92)', borderRight: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        <div className="px-3 pb-3 pt-1">
          <button
            onClick={() => setComposing(true)}
            className="w-full flex items-center justify-center gap-1.5 h-[30px] rounded-[8px] text-[12px] text-white bg-[#0a84ff] hover:bg-[#0a84ff]/90 cursor-default font-medium"
          >
            <SFSymbol name="square.and.pencil" size={12} color="white" />
            Compose
          </button>
        </div>
        {Object.entries(sidebar).map(([title, items]) => (
          <MacSidebarSection key={title} title={title}>
            {items.map(item => (
              <MacSidebarItem
                key={item.id}
                icon={item.icon}
                iconColor={item.color}
                label={item.label}
                selected={activeMailbox === item.id}
                onClick={() => setActiveMailbox(item.id)}
                badge={item.badge}
              />
            ))}
          </MacSidebarSection>
        ))}
      </div>

      <div
        className="w-[300px] shrink-0 flex flex-col"
        style={{ background: 'rgba(28,28,30,0.94)', borderRight: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        <div className="h-[44px] flex items-center px-4 shrink-0 DragHandle" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] text-white/90 font-semibold leading-tight">{sidebar.Mailboxes.find(m => m.id === activeMailbox)?.label}</span>
            <span className="text-[11px] text-white/45 leading-tight mt-[1px]">{visible.length} messages, {visible.filter(m => m.unread && !readSet.has(m.id)).length} unread</span>
          </div>
          <div className="flex-1" />
          <MacToolbarButton icon="line.3.horizontal.decrease" size={26} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/25 gap-2">
              <SFSymbol name="tray" size={32} color="rgba(255,255,255,0.15)" />
              <span className="text-[12px]">No Messages</span>
            </div>
          ) : (
            visible.map(m => {
              const isUnread = m.unread && !readSet.has(m.id);
              const selectedRow = selectedId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => selectMessage(m.id)}
                  className="w-full text-left px-3 py-2.5 relative cursor-default"
                  style={{
                    background: selectedRow ? 'rgba(10,132,255,0.2)' : 'transparent',
                    borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {isUnread && (
                    <span className="absolute left-1 top-4 w-1.5 h-1.5 rounded-full bg-[#0a84ff]" />
                  )}
                  <div className="flex items-center justify-between gap-2 pl-3">
                    <span className="text-[13px] text-white/92 font-medium truncate">{m.from}</span>
                    <span className="text-[11px] text-white/40 shrink-0">{m.date}</span>
                  </div>
                  <div className="pl-3 text-[12px] text-white/80 truncate mt-0.5">{m.subject}</div>
                  <div className="pl-3 text-[11px] text-white/40 line-clamp-2 mt-0.5 leading-relaxed">{m.preview}</div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0" style={{ background: 'rgba(18,18,20,0.98)' }}>
        <div className="h-[44px] flex items-center px-3 gap-1 shrink-0 DragHandle" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <MacToolbarButton icon="archivebox" size={26} label="Archive" />
          <MacToolbarButton icon="trash" size={26} label="Delete" />
          <div className="flex-1" />
          <MacToolbarButton icon="arrowshape.turn.up.left" size={26} label="Reply" onClick={() => setComposing(true)} />
          <MacToolbarButton icon="arrowshape.turn.up.right" size={26} label="Forward" />
          <MacToolbarButton
            icon="square.and.pencil"
            size={26}
            label="New"
            onClick={() => setComposing(true)}
          />
        </div>

        {selected ? (
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pt-5 pb-4 border-b border-white/6">
              <div className="text-[18px] text-white font-medium leading-snug">{selected.subject}</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#0a84ff] to-[#5856d6] flex items-center justify-center text-white text-[13px] font-semibold">
                  TS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-white/92">{selected.from}</div>
                  <div className="text-[11px] text-white/45">{selected.fromEmail} · to me</div>
                </div>
                <span className="text-[11px] text-white/45">{selected.date}</span>
              </div>
            </div>
            <div className="px-6 py-5 text-[13px] text-white/85 leading-[1.7] whitespace-pre-wrap font-[-apple-system]">
              {selected.body}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setComposing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-[12px] text-white rounded-[8px] bg-[#0a84ff] hover:bg-[#0a84ff]/90 cursor-default"
              >
                <SFSymbol name="arrowshape.turn.up.left" size={12} color="white" />
                Reply to {CONTACT_EMAIL}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/30 text-[13px]">Select a message</div>
        )}
      </div>

      {composing && <ComposeSheet onClose={() => setComposing(false)} />}
    </div>
  );
}
