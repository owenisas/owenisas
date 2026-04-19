#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.resolve(__dirname, '..', 'public', 'data', 'linkedin.html');

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
const page = await ctx.newPage();
await page.goto(`file://${TARGET}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);

await page.screenshot({ path: '/tmp/linkedin-top.png', fullPage: false });
await page.screenshot({ path: '/tmp/linkedin-full.png', fullPage: true });
console.log('saved /tmp/linkedin-top.png and linkedin-full.png');
await browser.close();
