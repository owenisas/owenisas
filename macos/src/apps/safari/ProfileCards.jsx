import { useEffect, useState } from 'react';
import SFSymbol from '../../components/icons/SFSymbol';

const linkedInBlue = '#0a66c2';
const xBlue = '#1d9bf0';

/* ---------------- Fallbacks (used until fetch resolves or if it fails) ---------------- */

const FALLBACK_LINKEDIN = {
  url: 'https://www.linkedin.com/in/thomas-suen-84776a262/',
  scrapedAt: null,
  name: 'Thomas Suen',
  headline: 'CS Student · Autonomous Systems · AI/ML · Full-Stack',
  location: 'Vancouver, BC, Canada',
  connectionCount: '500+ connections',
  avatarUrl: null,
  about:
    "I build autonomous systems that bridge digital and physical worlds — multi-agent AI, DePIN for Earth and space, AgriTech, AI governance, and embedded engineering. Also a photographer (street, landscape, aerial).",
  experience: [
    { title: 'Founder', company: 'Reunify Labs', span: 'Present', summary: 'Building agent infrastructure and end-to-end product. AI/ML, full-stack, agentic systems.', logo: null },
    { title: 'Independent Researcher', company: 'Multi-Agent AI & DePIN', span: '2024 – Present', summary: 'Research at the intersection of multi-agent coordination and decentralized physical infrastructure for Earth and space applications.', logo: null },
    { title: 'Open-Source Contributor', company: 'github.com/owenisas', span: 'Ongoing', summary: 'Tooling around LLM agents, 3D pipelines, and WebGPU. Projects span agent scaffolding and procedural animation.', logo: null },
  ],
  education: [
    { school: 'University (CS)', degree: 'B.S. Computer Science', span: 'In progress', logo: null },
  ],
  skills: ['TypeScript', 'React', 'Three.js', 'WebGPU', 'LLM Agents', 'Multi-Agent Systems', 'Python', 'Embedded', 'Computer Vision', 'Photography', 'DePIN', 'AgriTech'],
};

const FALLBACK_X = {
  url: 'https://x.com/ThomasSuen6',
  scrapedAt: null,
  name: 'Thomas Suen',
  handle: '@ThomasSuen6',
  bio: 'Autonomous systems, multi-agent AI, DePIN. Building at Reunify Labs. Photographer by weekend.',
  location: 'Vancouver, BC',
  website: 'owenisas.com',
  joined: 'Joined March 2019',
  following: '412',
  followers: '2,184',
  avatarUrl: null,
  bannerUrl: null,
  tweets: [
    { id: 't1', text: 'shipped a mac-os-in-the-browser portfolio tonight. the dock works, windows drag, spotlight finds files, terminal has a real shell over a fake filesystem.', time: '3h', replies: '12', reposts: '4', likes: '87', href: null },
    { id: 't2', text: 'agents that actually do work > agents that look like they do work. the gap is engineering discipline, not model size.', time: '1d', replies: '8', reposts: '15', likes: '142', href: null },
    { id: 't3', text: "WebGPU is the most underrated primitive on the web right now. you can do real compute in a tab. we're about to see a wave of apps that would've required native.", time: '3d', replies: '22', reposts: '31', likes: '318', href: null },
    { id: 't4', text: 'DePIN for space systems is where the next decade of infrastructure money goes. coordination problem + hardware problem + incentive problem, all in one.', time: '5d', replies: '14', reposts: '9', likes: '96', href: null },
  ],
};

function isMeaningful(v) {
  if (v == null) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function useProfileJson(url, fallback) {
  const [data, setData] = useState(fallback);
  useEffect(() => {
    let cancelled = false;
    fetch(url, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        const merged = { ...fallback };
        for (const [k, v] of Object.entries(d)) {
          if (isMeaningful(v)) merged[k] = v;
        }
        setData(merged);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);
  return data;
}

function formatRelative(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (!then) return '';
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

/* ---------------- Shared avatar ---------------- */

function Avatar({ size = 152, ring = '#fff', src = null }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="rounded-full object-cover"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 0 4px ${ring}`,
          display: 'block',
        }}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #6d28d9 55%, #db2777 100%)',
        fontSize: size * 0.42,
        boxShadow: `0 0 0 4px ${ring}`,
        letterSpacing: '-0.02em',
      }}
    >
      TS
    </div>
  );
}

/* ---------------- LinkedIn ---------------- */

export function LinkedInProfile() {
  const profile = useProfileJson('/data/linkedin.json', FALLBACK_LINKEDIN);
  const refreshed = formatRelative(profile.scrapedAt);

  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: '#f4f2ee' }}>
      <div className="max-w-[820px] mx-auto py-6 px-4">
        {/* Card: banner + identity */}
        <div className="rounded-[10px] bg-white overflow-hidden" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}>
          <div
            className="h-[140px]"
            style={{ background: 'linear-gradient(135deg, #0a66c2 0%, #0b5fbf 40%, #6a3dff 100%)' }}
          />
          <div className="px-6 pb-5 relative">
            <div className="-mt-[76px] mb-3">
              <Avatar size={152} ring="#fff" src={profile.avatarUrl} />
            </div>
            <h1 className="text-[24px] font-semibold text-[#000000e6] leading-tight">{profile.name}</h1>
            <p className="text-[14px] text-[#000000e6] mt-1 leading-snug max-w-[540px]">{profile.headline}</p>
            <p className="text-[13px] text-[#00000099] mt-1.5">
              {profile.location}{' '}
              ·{' '}
              <a className="text-[#0a66c2] font-semibold hover:underline" href="https://owenisas.com" target="_blank" rel="noreferrer">
                Contact info
              </a>
            </p>
            {profile.connectionCount && (
              <p className="text-[13px] text-[#00000099] mt-1">{profile.connectionCount}</p>
            )}
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => window.open(profile.url, '_blank', 'noopener,noreferrer')}
                className="px-4 h-[32px] rounded-full text-[14px] font-semibold text-white inline-flex items-center gap-1.5"
                style={{ background: linkedInBlue }}
              >
                Open on LinkedIn
                <SFSymbol name="arrow.up.right" size={13} color="#fff" />
              </button>
              <button className="px-4 h-[32px] rounded-full text-[14px] font-semibold border-[1.5px]" style={{ borderColor: linkedInBlue, color: linkedInBlue }} onClick={() => window.open('mailto:reunifylabs@gmail.com?subject=Hello%20Thomas', '_blank')}>
                Message
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        {profile.about && (
          <Section title="About">
            <p className="text-[14px] text-[#000000d9] leading-[1.55] whitespace-pre-wrap">{profile.about}</p>
          </Section>
        )}

        {/* Experience */}
        {profile.experience?.length > 0 && (
          <Section title="Experience">
            <div className="flex flex-col">
              {profile.experience.map((role, i) => (
                <div key={`${role.title}-${i}`} className="flex gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.08)' }}>
                  <div className="w-[48px] h-[48px] rounded-[4px] flex items-center justify-center shrink-0 overflow-hidden" style={{ background: '#e7f3ff' }}>
                    {role.logo ? (
                      <img src={role.logo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <SFSymbol name="building.2.fill" size={22} color={linkedInBlue} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-[#000000e6]">{role.title}</div>
                    {role.company && <div className="text-[13px] text-[#000000e6]">{role.company}</div>}
                    {role.span && <div className="text-[12px] text-[#00000099] mt-0.5">{role.span}</div>}
                    {role.summary && <p className="text-[13px] text-[#000000d9] mt-1.5 leading-[1.5] whitespace-pre-wrap">{role.summary}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {profile.education?.length > 0 && (
          <Section title="Education">
            {profile.education.map((e, i) => (
              <div key={`${e.school}-${i}`} className="flex gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.08)' }}>
                <div className="w-[48px] h-[48px] rounded-[4px] flex items-center justify-center shrink-0 overflow-hidden" style={{ background: '#e7f3ff' }}>
                  {e.logo ? (
                    <img src={e.logo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(ev) => { ev.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <SFSymbol name="graduationcap.fill" size={22} color={linkedInBlue} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-[#000000e6]">{e.school}</div>
                  {e.degree && <div className="text-[13px] text-[#000000d9]">{e.degree}</div>}
                  {e.span && <div className="text-[12px] text-[#00000099] mt-0.5">{e.span}</div>}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="text-[13px] px-3 py-1.5 rounded-full text-[#000000d9]"
                  style={{ background: '#f4f2ee', border: '1px solid rgba(0,0,0,0.12)' }}
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        <div className="text-[11px] text-[#00000066] text-center mt-4 pb-6">
          {refreshed ? `Synced from linkedin.com · refreshed ${refreshed}` : 'LinkedIn-style preview · served inside portfolio'} ·{' '}
          <a className="text-[#0a66c2] hover:underline" href={profile.url} target="_blank" rel="noreferrer">
            View on linkedin.com
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-[10px] bg-white overflow-hidden mt-2 px-6 py-5" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}>
      <h2 className="text-[20px] font-semibold text-[#000000e6] mb-3">{title}</h2>
      {children}
    </div>
  );
}

/* ---------------- X ---------------- */

export function XProfile() {
  const profile = useProfileJson('/data/x.json', FALLBACK_X);
  const refreshed = formatRelative(profile.scrapedAt);

  return (
    <div
      className="h-full w-full overflow-y-auto text-white"
      style={{
        background: '#000',
        fontFamily: '"TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      {/* Banner */}
      <div
        className="h-[200px] bg-cover bg-center"
        style={{
          background: profile.bannerUrl
            ? `url(${profile.bannerUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #6d28d9 100%)',
        }}
      />

      {/* Profile header */}
      <div className="px-4 pb-3 relative">
        <div className="flex justify-between items-start">
          <div className="-mt-[67px] border-[4px] border-black rounded-full">
            <Avatar size={134} ring="#000" src={profile.avatarUrl} />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => window.open(profile.url, '_blank', 'noopener,noreferrer')}
              className="px-4 h-[34px] rounded-full bg-white text-black text-[14px] font-bold inline-flex items-center gap-1.5"
            >
              Open on X
              <SFSymbol name="arrow.up.right" size={13} color="#000" />
            </button>
          </div>
        </div>
        <h1 className="text-[20px] font-extrabold mt-3 leading-tight">{profile.name}</h1>
        <div className="text-[14px] text-[#71767b] leading-tight mt-0.5">{profile.handle}</div>
        {profile.bio && (
          <p className="text-[15px] text-[#e7e9ea] mt-3 leading-snug max-w-[560px] whitespace-pre-wrap">{profile.bio}</p>
        )}
        <div className="flex items-center gap-4 text-[14px] text-[#71767b] mt-3 flex-wrap">
          {profile.location && (
            <span className="flex items-center gap-1">
              <SFSymbol name="mappin.and.ellipse" size={13} color="#71767b" />
              {profile.location}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#1d9bf0] hover:underline"
            >
              <SFSymbol name="link" size={13} color={xBlue} />
              {profile.website}
            </a>
          )}
          {profile.joined && (
            <span className="flex items-center gap-1">
              <SFSymbol name="calendar" size={13} color="#71767b" />
              {profile.joined}
            </span>
          )}
        </div>
        <div className="flex gap-4 text-[14px] mt-3">
          <span>
            <span className="font-bold text-white">{profile.following}</span>{' '}
            <span className="text-[#71767b]">Following</span>
          </span>
          <span>
            <span className="font-bold text-white">{profile.followers}</span>{' '}
            <span className="text-[#71767b]">Followers</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b border-[#2f3336] mt-2 sticky top-0 z-10"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
      >
        {['Posts', 'Replies', 'Media', 'Likes'].map((t, i) => (
          <button
            key={t}
            className="flex-1 h-[52px] flex items-center justify-center text-[15px] font-semibold relative"
            style={{ color: i === 0 ? '#e7e9ea' : '#71767b' }}
          >
            {t}
            {i === 0 && <span className="absolute bottom-0 h-1 w-14 rounded-full" style={{ background: xBlue }} />}
          </button>
        ))}
      </div>

      {/* Feed */}
      {(profile.tweets || []).map((t) => (
        <article key={t.id} className="px-4 py-3 border-b border-[#2f3336]">
          <div className="flex gap-3">
            <div className="shrink-0">
              <Avatar size={40} ring="#000" src={profile.avatarUrl} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[15px] leading-tight flex-wrap">
                <span className="font-bold text-white">{profile.name}</span>
                <span className="text-[#71767b]">{profile.handle} · {t.time}</span>
              </div>
              <p className="text-[15px] text-[#e7e9ea] leading-snug mt-0.5 whitespace-pre-wrap">{t.text}</p>
              <div className="flex items-center justify-between mt-3 max-w-[420px] text-[13px] text-[#71767b]">
                <span className="flex items-center gap-1.5">
                  <SFSymbol name="bubble.left" size={14} color="#71767b" />
                  {t.replies || '0'}
                </span>
                <span className="flex items-center gap-1.5">
                  <SFSymbol name="arrow.2.squarepath" size={14} color="#71767b" />
                  {t.reposts || '0'}
                </span>
                <span className="flex items-center gap-1.5">
                  <SFSymbol name="heart" size={14} color="#71767b" />
                  {t.likes || '0'}
                </span>
                <span className="flex items-center gap-1.5">
                  <SFSymbol name="square.and.arrow.up" size={14} color="#71767b" />
                </span>
              </div>
            </div>
          </div>
        </article>
      ))}

      <div className="text-[11px] text-[#71767b] text-center py-5">
        {refreshed ? `Synced from x.com · refreshed ${refreshed}` : 'X-style preview · served inside portfolio'} ·{' '}
        <a className="text-[#1d9bf0] hover:underline" href={profile.url} target="_blank" rel="noreferrer">
          View on x.com
        </a>
      </div>
    </div>
  );
}

export function getCustomRenderer(url) {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === 'linkedin.com' || host === 'www.linkedin.com') return LinkedInProfile;
    if (host === 'x.com' || host === 'twitter.com' || host === 'www.twitter.com') return XProfile;
  } catch {
    return null;
  }
  return null;
}
