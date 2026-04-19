# Profile scraper

Pulls real content from LinkedIn + X with an authed headless browser and writes it to `macos/public/data/{linkedin,x}.json`. The Safari app renders those JSONs as LinkedIn / X profile cards.

## Split responsibility

| Site | Where it runs | Why |
|---|---|---|
| **X** | Daily in GitHub Actions | X is scrapable from datacenter IPs with valid cookies |
| **LinkedIn** | Locally on your laptop | LinkedIn's edge serves `/authwall?trk=bf` to GitHub Actions IP ranges — cookies aren't even evaluated. Residential IP works fine |

The scraper writes only what succeeded. CI runs commit just `x.json`; manual local runs refresh `linkedin.json` (and `x.json`, which is fine — whichever is newer wins).

## Local run (for LinkedIn — or to refresh both ad-hoc)

```bash
cd macos

# One-time setup
cp .env.local.example .env.local
# Open .env.local and paste cookie values (see below)

npm install --no-save playwright
npx playwright install chromium

# Every run
./scripts/scrape-local.sh

# Commit + push
git add public/data
git commit -m "chore: refresh profile data"
git push
```

Vercel redeploys on push, refreshed data goes live.

## Where to get each cookie

Open Chrome → Settings → Privacy → Cookies and site data → See all cookies → search the domain → copy the "Value" column.

Or: DevTools on a logged-in tab → Application → Cookies → select the domain.

| Env var | Domain | Cookie | Notes |
|---|---|---|---|
| `LINKEDIN_LI_AT` | `.www.linkedin.com` | `li_at` | required |
| `LINKEDIN_JSESSIONID` | `.www.linkedin.com` | `JSESSIONID` | required; keep surrounding quotes — they're part of the value |
| `LINKEDIN_BCOOKIE` | `.linkedin.com` | `bcookie` | keep quotes |
| `LINKEDIN_BSCOOKIE` | `.www.linkedin.com` | `bscookie` | keep quotes |
| `LINKEDIN_LIDC` | `.linkedin.com` | `lidc` | keep quotes; routing cookie, short-lived |
| `LINKEDIN_DFPFPT` | `.linkedin.com` | `dfpfpt` | fingerprint cookie |
| `X_AUTH_TOKEN` | `x.com` | `auth_token` | required |
| `X_CT0` | `x.com` | `ct0` | required (CSRF) |
| `X_TWID` | `x.com` | `twid` | optional |
| `X_KDT` | `x.com` | `kdt` | optional |

**Security**: `li_at` and `auth_token` are equivalent to being logged in. Treat like passwords. Never paste into commits, chat transcripts, or public gists. Rotate by signing out all sessions on the respective site.

## CI (X only)

`.github/workflows/scrape-profiles.yml` runs daily at 08:00 UTC. Cookies are in GitHub Secrets. LinkedIn secrets are set but will always hit the authwall — the workflow silently skips LinkedIn and commits whatever X produced. To trigger manually:

```bash
gh workflow run scrape-profiles.yml -R owenisas/owenisas
```

## When it breaks

### Scrape returns empty / blocked
- Check `macos/scripts/debug/linkedin.html` and `linkedin.png` (locally) or the `scrape-debug-<runid>` artifact on the GitHub Actions run.
- Most common cause: cookies expired. Re-export.

### Selector changes
LinkedIn / X update their DOM regularly. When a selector breaks:
1. Edit `scrape-profiles.mjs`: flip `chromium.launch({ headless: true })` to `headless: false` to watch what happens.
2. Update the `page.evaluate(...)` block.
3. Run locally with `./scripts/scrape-local.sh` until the JSON looks right.

## Cookie rotation

Cookies expire. Rough lifetimes:
- LinkedIn `li_at`: ~1 year, but invalidated when you sign out or LinkedIn detects anomaly.
- LinkedIn `lidc`: ~24 hours, refreshes on every authed page view.
- X `auth_token`: ~1 year, invalidated on password change.

If the scraper worked yesterday and silently stops refreshing today, re-export cookies.
