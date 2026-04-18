# Profile scraper

Pulls real content from LinkedIn + X with an authed headless browser and writes it to `macos/public/data/{linkedin,x}.json`. The Safari app renders those JSONs as LinkedIn / X profile cards.

## How it runs

- **In CI**: `.github/workflows/scrape-profiles.yml` runs daily at 08:00 UTC (and on `workflow_dispatch`). It reads cookies from GitHub Secrets, runs Playwright headless Chromium, and commits the refreshed JSON back to the branch.
- **Locally**: useful for testing selectors after LinkedIn/X change their DOM.

## Required secrets

Create these in GitHub → Settings → Secrets and variables → Actions:

| Name | Where to get it |
|---|---|
| `LINKEDIN_LI_AT` | Chrome DevTools → Application → Cookies → `linkedin.com` → `li_at` |
| `LINKEDIN_JSESSIONID` | Same, `JSESSIONID` on `.www.linkedin.com` (keep the quotes: `"ajax:..."`) |
| `LINKEDIN_BCOOKIE` *(optional)* | `bcookie` on `.linkedin.com` |
| `LINKEDIN_BSCOOKIE` *(optional)* | `bscookie` on `.www.linkedin.com` |
| `X_AUTH_TOKEN` | `x.com` → `auth_token` |
| `X_CT0` | `x.com` → `ct0` (CSRF token) |
| `X_TWID` *(optional)* | `twid` |
| `X_KDT` *(optional)* | `kdt` |

> **Security**: `li_at` and `auth_token` are equivalent to being logged in. Treat them like passwords. Never paste them into chat, commits, or public gists. Rotate by signing out all sessions on the respective site — this invalidates the cookies immediately.

## Local run

```bash
cd macos
npm install --no-save playwright
npx playwright install chromium

export LINKEDIN_LI_AT=...
export LINKEDIN_JSESSIONID='"ajax:..."'
export X_AUTH_TOKEN=...
export X_CT0=...

node scripts/scrape-profiles.mjs
```

Output lands in `macos/public/data/`.

## When it breaks

LinkedIn and X ship DOM changes often. If a selector breaks:

1. Run `node scripts/scrape-profiles.mjs` locally with `headless: false` (edit the script) to watch what happens.
2. Update the `page.evaluate(...)` block in `scrape-profiles.mjs`.
3. If the scrape returns empty, the script exits 1 and the workflow won't commit, so stale data stays live.

## Cookie rotation

Cookies expire. Rough lifetimes:

- LinkedIn `li_at`: ~1 year, but invalidated when you sign out or they detect anomaly.
- X `auth_token`: ~1 year, invalidated on password change or forced logout.

When the Action starts failing with "missing env var" gone, but scrape returns `null` name — cookies are expired. Re-export and update the secrets.
