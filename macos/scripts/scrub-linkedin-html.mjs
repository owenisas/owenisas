#!/usr/bin/env node
/**
 * Offline scrubber for macos/public/data/linkedin.html.
 *
 * Loads the already-scraped snapshot in Playwright via file://, applies
 * extra DOM removals (logged-in-only elements the initial scrape missed),
 * and writes the cleaned HTML back in place. Runs without any LinkedIn
 * cookies — iterate on scrub rules without burning session credits.
 *
 * Run:
 *   node scripts/scrub-linkedin-html.mjs
 */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.resolve(__dirname, '..', 'public', 'data', 'linkedin.html');

async function main() {
  const abs = TARGET;
  await fs.access(abs);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await ctx.newPage();
  await page.goto(`file://${abs}`, { waitUntil: 'domcontentloaded' });

  // --- Inline any remaining external stylesheets so the snapshot is self-contained
  // and so our override CSS can actually win the cascade. External links load
  // cross-origin, making their rules invisible to our selectors' specificity checks.
  const externalHrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
      .map((l) => l.href)
      .filter((h) => /^https?:/.test(h))
  );
  const fetched = [];
  for (const href of externalHrefs) {
    try {
      const res = await fetch(href);
      if (res.ok) fetched.push({ href, css: await res.text() });
    } catch (err) {
      console.warn('stylesheet fetch failed', href, err?.message);
    }
  }
  await page.evaluate((inlined) => {
    for (const { href, css } of inlined) {
      const link = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
      if (!link) continue;
      const s = document.createElement('style');
      s.setAttribute('data-inlined-from', href);
      s.textContent = css;
      link.replaceWith(s);
    }
    // Any remaining external stylesheet links: drop them rather than leak fetches.
    document.querySelectorAll('link[rel="stylesheet"][href^="http"]').forEach((l) => l.remove());
  }, fetched);

  await page.evaluate(() => {
    const kill = (sel) => document.querySelectorAll(sel).forEach((el) => el.remove());
    const killIf = (sel, pred) =>
      document.querySelectorAll(sel).forEach((el) => { if (pred(el)) el.remove(); });

    // --- Empty iframes (ad/tracking shells left over after script removal) ---
    kill('iframe');

    // --- Right-rail widgets (componentkey is the stable handle) ---
    kill('[componentkey^="profileAside"]');
    kill('[componentkey*="PostConnectDrawer"]');
    kill('[componentkey*="Product"][componentkey*="thomas-suen"]');

    // --- CSS override: LinkedIn relies on JS to compute grid/flex heights
    // and show initially-hidden sections. With scripts stripped, grid tracks
    // collapse to 0 and several cards stay display:none. Force natural flow.
    // Must beat LinkedIn SDUI rules like `.a.b.c { display: grid; ... }` (specificity 0,3,0).
    // Use #workspace ID for the main container and stacked attribute selectors elsewhere.
    const overrideCSS = `
      html, body {
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }
      /* Scaffold wrappers between body and main — unclip so content flows */
      html body #root,
      html body #root > div,
      html body #root > div > div,
      html body #root > div > div > div,
      html body [role="main"],
      html body [role="main"] > div,
      html body main#workspace,
      html body main#workspace > div,
      html body main#workspace > div > div {
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
        display: block !important;
        grid-template-columns: none !important;
        grid-template-rows: none !important;
      }
      html body main#workspace { min-height: 100vh !important; }
      /* Un-hide the many [hidden] / display:none sections that JS would reveal. */
      [hidden] { display: revert !important; }
      .visually-hidden, [class*="sr-only"] { position: static !important; width: auto !important; height: auto !important; }
    `;
    document.getElementById('linkedin-snapshot-override')?.remove();
    const overrideStyle = document.createElement('style');
    overrideStyle.id = 'linkedin-snapshot-override';
    overrideStyle.textContent = overrideCSS;
    document.head.appendChild(overrideStyle);

    // --- Owner-only alerts / banners at the top ---
    // "Emails aren't getting through..." and similar notifications appear as
    // dismissible banners with an X button. Remove any element that contains
    // these characteristic strings plus an aria-label="Dismiss" close button.
    const ownerAlertPhrases = [
      "Emails aren't getting through",
      'Emails aren\u2019t getting through',
      'update or confirm',
      'Verify your email',
      'Complete your profile',
      'Your dashboard',
      'Profile views',
      'Search appearances',
      'View profile analytics',
      'Premium',
      'Open to work',
      'Add to your feed',
    ];
    document.querySelectorAll('div, section, aside').forEach((el) => {
      const t = (el.textContent || '').slice(0, 500);
      if (ownerAlertPhrases.some((p) => t.includes(p)) && el.offsetHeight < 400 && t.length < 2000) {
        // Walk up until we hit a reasonable top-level container, then remove it.
        let target = el;
        for (let i = 0; i < 4 && target.parentElement; i++) {
          const parent = target.parentElement;
          const parentText = (parent.textContent || '').length;
          if (parentText > t.length * 2) break;
          target = parent;
        }
        target.remove();
      }
    });

    // --- Notifications bell (top of the profile summary card) ---
    kill('svg[data-token-id="239"]'); // "mail" icon often used for notifications
    document.querySelectorAll('button[aria-label*="notification" i], a[aria-label*="notification" i]').forEach((el) => el.remove());

    // --- Standalone headings that survived without their container ---
    document.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
      const t = (h.textContent || '').trim();
      if (/^(More profiles for you|People you may know|You might like|Promoted|Premium|Your dashboard|People also viewed)$/i.test(t)) {
        // Remove the heading and walk up to its enclosing card/section.
        let target = h;
        for (let i = 0; i < 5 && target.parentElement; i++) target = target.parentElement;
        target.remove();
      }
    });

    // --- Dangling empty containers (from previous kills) ---
    let changed = true;
    let rounds = 0;
    while (changed && rounds < 5) {
      changed = false;
      rounds++;
      document.querySelectorAll('div, section, aside').forEach((el) => {
        if (el.children.length === 0 && !(el.textContent || '').trim() && !el.querySelector('img, svg')) {
          el.remove();
          changed = true;
        }
      });
    }

    // --- Neutralize all links to prevent accidental navigation back to LinkedIn ---
    document.querySelectorAll('a[href]').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
  });

  let html = await page.content();

  // Final regex sweep — defensive, in case additional identifiers slipped into text.
  const scrubs = [
    [/"memberId"\s*:\s*"[^"]*"/g, '"memberId":""'],
    [/"trackingId"\s*:\s*"[^"]*"/g, '"trackingId":""'],
    [/"sessionId"\s*:\s*"[^"]*"/g, '"sessionId":""'],
    [/"csrfToken"\s*:\s*"[^"]*"/g, '"csrfToken":""'],
    [/data-member-id="[^"]*"/g, 'data-member-id=""'],
  ];
  for (const [re, rep] of scrubs) html = html.replace(re, rep);

  await fs.writeFile(abs, html);
  console.log(`Scrubbed ${abs}`);
  console.log(`Size: ${(html.length / 1024).toFixed(0)} KB`);

  await ctx.close();
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
