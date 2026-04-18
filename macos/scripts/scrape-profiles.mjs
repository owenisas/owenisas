#!/usr/bin/env node
/**
 * Scrapes the owner's LinkedIn and X profiles using Playwright + auth cookies,
 * writing structured JSON to macos/public/data/{linkedin,x}.json.
 *
 * Run locally:
 *   npm install --no-save playwright
 *   npx playwright install chromium
 *   LINKEDIN_LI_AT=... LINKEDIN_JSESSIONID=... X_AUTH_TOKEN=... X_CT0=... \
 *     node scripts/scrape-profiles.mjs
 *
 * In CI: driven by .github/workflows/scrape-profiles.yml using GitHub Secrets.
 */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'data');
const DEBUG_DIR = path.resolve(__dirname, 'debug');

async function dumpDebug(page, tag) {
  try {
    await fs.mkdir(DEBUG_DIR, { recursive: true });
    const html = await page.content();
    await fs.writeFile(path.join(DEBUG_DIR, `${tag}.html`), html);
    await page.screenshot({ path: path.join(DEBUG_DIR, `${tag}.png`), fullPage: true });
    console.error(`Debug artifacts saved: ${tag}.html, ${tag}.png`);
  } catch (e) {
    console.error(`Failed to save debug artifacts for ${tag}:`, e.message);
  }
}

const LINKEDIN_URL = process.env.LINKEDIN_URL || 'https://www.linkedin.com/in/thomas-suen-84776a262/';
const X_URL = process.env.X_URL || 'https://x.com/ThomasSuen6';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function optEnv(name) {
  const v = process.env[name];
  return v && v.length ? v : null;
}

async function scrapeLinkedIn(browser) {
  const ctx = await browser.newContext({
    userAgent: UA,
    viewport: { width: 1280, height: 1600 },
    locale: 'en-US',
  });

  // li_at is on .www.linkedin.com in the source cookie file — not .linkedin.com.
  // Putting it on the wrong domain causes ERR_TOO_MANY_REDIRECTS.
  const cookies = [
    { name: 'li_at', value: requireEnv('LINKEDIN_LI_AT'), domain: '.www.linkedin.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' },
    { name: 'JSESSIONID', value: requireEnv('LINKEDIN_JSESSIONID'), domain: '.www.linkedin.com', path: '/', httpOnly: false, secure: true, sameSite: 'None' },
    { name: 'liap', value: 'true', domain: '.linkedin.com', path: '/', secure: true, sameSite: 'None' },
  ];
  const bcookie = optEnv('LINKEDIN_BCOOKIE');
  if (bcookie) cookies.push({ name: 'bcookie', value: bcookie, domain: '.linkedin.com', path: '/', secure: true, sameSite: 'None' });
  const bscookie = optEnv('LINKEDIN_BSCOOKIE');
  if (bscookie) cookies.push({ name: 'bscookie', value: bscookie, domain: '.www.linkedin.com', path: '/', secure: true, sameSite: 'None' });
  const lidc = optEnv('LINKEDIN_LIDC');
  if (lidc) cookies.push({ name: 'lidc', value: lidc, domain: '.linkedin.com', path: '/', secure: true, sameSite: 'None' });
  const dfpfpt = optEnv('LINKEDIN_DFPFPT');
  if (dfpfpt) cookies.push({ name: 'dfpfpt', value: dfpfpt, domain: '.linkedin.com', path: '/', secure: true, sameSite: 'None' });
  await ctx.addCookies(cookies);

  const page = await ctx.newPage();

  try {
    // Go directly to the profile URL. A /feed warm-up occasionally triggers
    // LinkedIn's bot-detection pipeline and returns clear-site-data headers
    // that blank the session, causing the next request to hit /authwall.
    await page.goto(LINKEDIN_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (err) {
    await dumpDebug(page, 'linkedin-goto-error').catch(() => {});
    throw err;
  }

  // LinkedIn's new profile UI is SDUI (server-driven UI) — class names are
  // hashed per build, but `componentkey` attrs are stable. Wait for the
  // Topcard to populate (it holds name, headline, location, avatar).
  await page
    .waitForFunction(
      () => {
        const topcard = document.querySelector('[componentkey*="Topcard"]');
        return topcard && topcard.textContent && topcard.textContent.length > 50;
      },
      { timeout: 20000 }
    )
    .catch(() => {});

  // Scroll to trigger SDUI hydration of About/Experience/Education/Skills.
  for (let i = 0; i < 12; i++) {
    await page.evaluate((y) => window.scrollBy(0, y), 700);
    await page.waitForTimeout(700);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const data = await page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const pick = (sel, root = document) => root.querySelector(sel);
    const pickAll = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // --- Topcard (name, headline, location, avatar) ---
    const topcard = pick('[componentkey*="Topcard"]');
    let name = '', headline = '', location = '', connectionCount = '', avatarUrl = null, pronouns = '';

    // Name: document.title is "<Name> | LinkedIn" — most reliable source.
    {
      const t = document.title.split('|')[0].trim();
      if (t && t !== 'LinkedIn') name = t;
    }

    if (topcard) {
      const avatarImg = pick('img[src*="profile-displayphoto"], img[src*="profile-framedphoto"]', topcard)
        || pick('figure img', topcard);
      avatarUrl = avatarImg?.src || null;

      // Walk every <p>/<span> in topcard; classify by content pattern.
      const lines = Array.from(topcard.querySelectorAll('p, span'))
        .map((el) => text(el))
        .filter((t) => t && t.length < 200);
      // Dedupe while preserving order
      const seen = new Set();
      const unique = [];
      for (const l of lines) {
        if (!seen.has(l)) { seen.add(l); unique.push(l); }
      }
      for (const l of unique) {
        if (!pronouns && /^(He\/Him|She\/Her|They\/Them)$/i.test(l)) pronouns = l;
        else if (!location && /,\s*[A-Z]/.test(l) && /United States|Canada|Kingdom|Australia|India|Germany|France|Singapore|Hong Kong|Japan|China|Brazil|Mexico|Netherlands|Spain|Italy|Sweden|Switzerland|Ireland|Poland|Belgium|Denmark|Norway|Finland/.test(l)) location = l;
        else if (!connectionCount && /^\d[\d,+]*$/.test(l)) connectionCount = l;
      }

      // Headline heuristic: first non-name, non-pronoun, non-location <p> text under topcard.
      const paragraphs = Array.from(topcard.querySelectorAll('p')).map((p) => text(p));
      for (const p of paragraphs) {
        if (!p || p === name || p === pronouns || p === location || /connection/i.test(p)) continue;
        if (p.length > 180) continue;
        if (!headline) { headline = p; continue; }
      }
    }

    // --- About section ---
    let about = '';
    const aboutCard = pick('[componentkey*="refAbout"]') || pick('[componentkey*="About"]');
    if (aboutCard) {
      about = text(aboutCard).replace(/^About\s*/i, '').trim();
    }

    // --- Experience ---
    const experience = [];
    const expCard = pick('[componentkey*="Experience"]');
    if (expCard) {
      pickAll('li', expCard).forEach((li) => {
        const ps = Array.from(li.querySelectorAll('p, span'))
          .map((el) => text(el))
          .filter((t) => t && t.length < 300);
        const uniq = [];
        const seen = new Set();
        for (const p of ps) { if (!seen.has(p)) { seen.add(p); uniq.push(p); } }
        const title = uniq[0] || '';
        const company = uniq[1] || '';
        const span = uniq[2] || '';
        const logo = li.querySelector('img')?.src || null;
        if (title) experience.push({ title, company, span, summary: '', logo });
      });
    }

    // --- Education ---
    const education = [];
    const eduCard = pick('[componentkey*="Education"]');
    if (eduCard) {
      pickAll('li', eduCard).forEach((li) => {
        const ps = Array.from(li.querySelectorAll('p, span'))
          .map((el) => text(el))
          .filter((t) => t && t.length < 300);
        const uniq = [];
        const seen = new Set();
        for (const p of ps) { if (!seen.has(p)) { seen.add(p); uniq.push(p); } }
        const school = uniq[0] || '';
        const degree = uniq[1] || '';
        const span = uniq[2] || '';
        const logo = li.querySelector('img')?.src || null;
        if (school) education.push({ school, degree, span, logo });
      });
    }

    // --- Skills ---
    const skills = [];
    const skillsCard = pick('[componentkey*="Skills"]');
    if (skillsCard) {
      pickAll('li', skillsCard).forEach((li) => {
        const ps = Array.from(li.querySelectorAll('p, span'))
          .map((el) => text(el))
          .filter((t) => t && t.length > 0 && t.length < 80);
        const t = ps[0];
        if (t && !skills.includes(t)) skills.push(t);
      });
    }

    return { name, headline, location, pronouns, connectionCount, avatarUrl, about, experience, education, skills };
  });

  const finalUrl = page.url();
  const looksBlocked =
    !data.name ||
    data.name === 'Join LinkedIn' ||
    data.name === 'Sign in' ||
    /\/authwall|\/login|\/signup|\/uas\/login|\/checkpoint/.test(finalUrl);

  if (looksBlocked) {
    console.error(`LinkedIn blocked — finalUrl=${finalUrl} name="${data.name}"`);
    await dumpDebug(page, 'linkedin');
    data.name = ''; // signal failure upstream
  }

  await ctx.close();
  return { ...data, url: LINKEDIN_URL, finalUrl };
}

async function scrapeX(browser) {
  const ctx = await browser.newContext({
    userAgent: UA,
    viewport: { width: 1280, height: 1600 },
    locale: 'en-US',
  });

  const cookies = [
    { name: 'auth_token', value: requireEnv('X_AUTH_TOKEN'), domain: '.x.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' },
    { name: 'ct0', value: requireEnv('X_CT0'), domain: '.x.com', path: '/', secure: true, sameSite: 'None' },
  ];
  const twid = optEnv('X_TWID');
  if (twid) cookies.push({ name: 'twid', value: twid, domain: '.x.com', path: '/', secure: true, sameSite: 'None' });
  const kdt = optEnv('X_KDT');
  if (kdt) cookies.push({ name: 'kdt', value: kdt, domain: '.x.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' });
  await ctx.addCookies(cookies);

  const page = await ctx.newPage();
  await page.goto(X_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('[data-testid="UserName"]', { timeout: 20000 }).catch(() => {});

  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 900));
    await page.waitForTimeout(600);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const data = await page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const pick = (sel, root = document) => root.querySelector(sel);
    const pickAll = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const nameBlock = pick('[data-testid="UserName"]');
    const nameSpans = nameBlock ? pickAll('span', nameBlock) : [];
    const name = text(nameSpans[0]);
    const handle = nameSpans.map((s) => text(s)).find((t) => t.startsWith('@')) || '';

    const bio = text(pick('[data-testid="UserDescription"]'));

    const headerItems = pick('[data-testid="UserProfileHeader_Items"]');
    let location = '', website = '', joined = '';
    if (headerItems) {
      Array.from(headerItems.children).forEach((c) => {
        const t = text(c);
        if (!t) return;
        if (c.querySelector('a[href^="http"]') && !/^Joined/i.test(t)) website = t;
        else if (/^Joined/i.test(t)) joined = t;
        else if (!location) location = t;
      });
    }

    let following = '', followers = '';
    pickAll('a[href$="/following"], a[href$="/verified_followers"], a[href$="/followers"]').forEach((a) => {
      const numSpan = pick('span span', a);
      const num = numSpan ? text(numSpan) : '';
      const label = text(a);
      if (!num) return;
      if (/Following/i.test(label)) following = num;
      else if (/Followers/i.test(label)) followers = num;
    });

    const avatarUrl =
      pick('a[href$="/photo"] img')?.src ||
      pick('[data-testid="UserAvatar-Container-unknown"] img')?.src ||
      null;

    const bannerUrl = pick('a[href$="/header_photo"] img')?.src || null;

    const tweets = [];
    pickAll('[data-testid="primaryColumn"] article').forEach((a, i) => {
      if (tweets.length >= 20) return;
      const textEl = pick('[data-testid="tweetText"]', a);
      const content = text(textEl);
      if (!content) return;
      const timeEl = pick('time', a);
      const datetime = timeEl?.getAttribute('datetime') || null;
      const timeLabel = text(timeEl);
      const replies = text(pick('[data-testid="reply"] span[data-testid="app-text-transition-container"]', a)) || text(pick('[data-testid="reply"]', a));
      const reposts = text(pick('[data-testid="retweet"] span[data-testid="app-text-transition-container"]', a)) || text(pick('[data-testid="retweet"]', a));
      const likes = text(pick('[data-testid="like"] span[data-testid="app-text-transition-container"]', a)) || text(pick('[data-testid="like"]', a));
      const linkEl = pick('a[href*="/status/"]', a);
      const href = linkEl?.getAttribute('href') || null;
      const id = href?.split('/status/')[1]?.split('/')[0] || `t${i}`;
      tweets.push({ id, text: content, datetime, time: timeLabel, replies, reposts, likes, href });
    });

    return { name, handle, bio, location, website, joined, following, followers, avatarUrl, bannerUrl, tweets };
  });

  if (!data.name || !data.tweets?.length) {
    await dumpDebug(page, 'x');
  }

  await ctx.close();
  return { ...data, url: X_URL };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    await fs.mkdir(OUT_DIR, { recursive: true });
    const scrapedAt = new Date().toISOString();

    const results = await Promise.allSettled([
      scrapeLinkedIn(browser).then((d) => ({ ...d, scrapedAt })),
      scrapeX(browser).then((d) => ({ ...d, scrapedAt })),
    ]);

    const [liRes, xRes] = results;
    let liOk = false, xOk = false;

    if (liRes.status === 'fulfilled') {
      const v = liRes.value;
      if (!v.name) {
        console.error('LinkedIn scrape returned no name — likely blocked or cookie expired');
      } else {
        await fs.writeFile(path.join(OUT_DIR, 'linkedin.json'), JSON.stringify(v, null, 2));
        console.log(`LinkedIn: OK — ${v.name} · ${v.experience.length} roles · ${v.skills.length} skills`);
        liOk = true;
      }
    } else {
      console.error('LinkedIn failed:', liRes.reason?.message || liRes.reason);
    }

    if (xRes.status === 'fulfilled') {
      const v = xRes.value;
      if (!v.name || !v.tweets?.length) {
        console.error('X scrape returned no data — likely blocked or cookie expired');
      } else {
        await fs.writeFile(path.join(OUT_DIR, 'x.json'), JSON.stringify(v, null, 2));
        console.log(`X: OK — ${v.name} (${v.handle}) · ${v.tweets.length} tweets`);
        xOk = true;
      }
    } else {
      console.error('X failed:', xRes.reason?.message || xRes.reason);
    }

    // Exit 0 if at least one site succeeded — partial data beats no data.
    // Exit 1 only if both failed, so the workflow surfaces a clear problem.
    if (!liOk && !xOk) {
      console.error('Both scrapes failed — exiting 1');
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
