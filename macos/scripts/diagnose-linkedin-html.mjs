#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.resolve(__dirname, '..', 'public', 'data', 'linkedin.html');

const browser = await chromium.launch({ headless: true });
const page = await browser.newContext({ viewport: { width: 1280, height: 1800 } }).then(c => c.newPage());
await page.goto(`file://${TARGET}`, { waitUntil: 'domcontentloaded' });

const diag = await page.evaluate(() => {
  const main = document.querySelector('main#workspace') || document.querySelector('main') || document.querySelector('[role="main"]');
  if (!main) return { err: 'no main' };

  // Walk ancestor chain and capture display / height / computed rect
  const chain = [];
  let el = main;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    chain.push({
      tag: el.tagName,
      id: el.id || undefined,
      role: el.getAttribute('role') || undefined,
      cls: (el.className || '').toString().slice(0, 80),
      display: cs.display,
      height: cs.height,
      minHeight: cs.minHeight,
      maxHeight: cs.maxHeight,
      overflow: cs.overflow,
      position: cs.position,
      rectH: Math.round(r.height),
      rectW: Math.round(r.width),
    });
    el = el.parentElement;
  }
  return { chain };
});

console.log(JSON.stringify(diag, null, 2));
await browser.close();
