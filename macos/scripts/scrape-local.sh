#!/usr/bin/env bash
# Run the profile scraper locally using cookies from .env.local.
#
# Setup (one time):
#   1. cd macos
#   2. cp .env.local.example .env.local
#   3. Paste cookie values into .env.local (see scripts/README.md)
#   4. npm install --no-save playwright
#   5. npx playwright install chromium
#
# Usage:
#   ./scripts/scrape-local.sh
#
# Then commit the refreshed JSON:
#   git add macos/public/data && git commit -m "chore: refresh profile data" && git push

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  echo "error: macos/.env.local not found. Copy .env.local.example and fill in cookies." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a

exec node scripts/scrape-profiles.mjs
