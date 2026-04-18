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
  await ctx.addCookies(cookies);

  const page = await ctx.newPage();

  try {
    // Warm-up: hit /feed first so LinkedIn validates the session and issues
    // any fresh cookies it wants before we request a profile page.
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1200);
    await page.goto(LINKEDIN_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (err) {
    await dumpDebug(page, 'linkedin-goto-error').catch(() => {});
    throw err;
  }
  await page.waitForSelector('h1', { timeout: 20000 }).catch(() => {});

  // Scroll to trigger lazy-loaded sections (about, experience, education, skills).
  for (let i = 0; i < 8; i++) {
    await page.evaluate((y) => window.scrollBy(0, y), 700);
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const data = await page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const pick = (sel, root = document) => root.querySelector(sel);
    const pickAll = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const firstText = (sels, root = document) => {
      for (const s of sels) { const t = text(pick(s, root)); if (t) return t; }
      return '';
    };

    const name = firstText(['h1.text-heading-xlarge', 'h1']);

    const headline = firstText([
      '.text-body-medium.break-words',
      '.pv-text-details__left-panel .text-body-medium',
      'section[data-view-name="profile-card"] .text-body-medium',
    ]);

    const location = firstText([
      '.pv-text-details__left-panel + div .text-body-small',
      '.text-body-small.inline.t-black--light.break-words',
    ]);

    const connectionCount = firstText([
      '.pv-top-card--list-bullet li a span',
      'ul.pv-top-card--list-bullet span',
    ]);

    const avatarImg = pick(
      'img.pv-top-card-profile-picture__image, img.profile-photo-edit__preview, button[aria-label*="photo"] img'
    );
    const avatarUrl = avatarImg?.src || null;

    // Prefer the full about text from the inline-show-more-text span.
    let about = '';
    const aboutSection = document.getElementById('about')?.closest('section');
    if (aboutSection) {
      about = firstText(
        [
          '[class*="inline-show-more-text"] span[aria-hidden="true"]',
          '.display-flex.ph5.pv3 span[aria-hidden="true"]',
          '.pv-shared-text-with-see-more span[aria-hidden="true"]',
        ],
        aboutSection
      );
    }

    const extractList = (sectionId) => {
      const section = document.getElementById(sectionId)?.closest('section');
      if (!section) return [];
      const items = pickAll('li.artdeco-list__item, .pvs-list__paged-list-item, li.pv-entity__position-group-pager', section);
      const out = [];
      items.forEach((li) => {
        const title = firstText(
          ['.t-bold span[aria-hidden="true"]', '.mr1 span[aria-hidden="true"]', '.t-bold'],
          li
        );
        const subtitle = firstText(
          ['.t-14.t-normal:not(.t-black--light) span[aria-hidden="true"]', '.t-14.t-normal span[aria-hidden="true"]'],
          li
        );
        const span = firstText(
          ['.t-14.t-normal.t-black--light span[aria-hidden="true"]', '.pvs-entity__caption-wrapper'],
          li
        );
        const detail = firstText(
          ['.pvs-entity__sub-components .pvs-list__paged-list-item span[aria-hidden="true"]', '.pv-shared-text-with-see-more span[aria-hidden="true"]'],
          li
        );
        const logo = li.querySelector('img')?.src || null;
        if (title) out.push({ title, subtitle, span, detail, logo });
      });
      return out;
    };

    const experienceRaw = extractList('experience');
    const educationRaw = extractList('education');

    const experience = experienceRaw.map((r) => ({
      title: r.title,
      company: r.subtitle,
      span: r.span,
      summary: r.detail,
      logo: r.logo,
    }));

    const education = educationRaw.map((r) => ({
      school: r.title,
      degree: r.subtitle,
      span: r.span,
      logo: r.logo,
    }));

    const skills = [];
    const skillsSection = document.getElementById('skills')?.closest('section');
    if (skillsSection) {
      pickAll('.t-bold span[aria-hidden="true"]', skillsSection).forEach((s) => {
        const t = (s.textContent || '').trim();
        if (t && !skills.includes(t)) skills.push(t);
      });
    }

    return { name, headline, location, connectionCount, avatarUrl, about, experience, education, skills };
  });

  if (!data.name) {
    await dumpDebug(page, 'linkedin');
  }

  await ctx.close();
  return { ...data, url: LINKEDIN_URL };
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
