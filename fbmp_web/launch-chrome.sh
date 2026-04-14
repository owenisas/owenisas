#!/bin/bash
# Launch Chrome with persistent profile for FBMP automation
# Login once → cookies persist → agents reuse without re-auth

PROFILE_DIR="$HOME/.claude/chrome-profiles/fbmp"
REMOTE_DEBUG_PORT=9222

# Kill any existing Chrome debug instance on this port
lsof -ti:$REMOTE_DEBUG_PORT | xargs kill -9 2>/dev/null

echo "Launching Chrome with persistent profile at: $PROFILE_DIR"
echo "Remote debugging on port: $REMOTE_DEBUG_PORT"

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --user-data-dir="$PROFILE_DIR" \
  --remote-debugging-port=$REMOTE_DEBUG_PORT \
  --no-first-run \
  --no-default-browser-check \
  --window-size=1280,900 \
  "$@" &

echo "Chrome PID: $!"
echo ""
echo "Agents connect via: chrome-devtools or playwright on port $REMOTE_DEBUG_PORT"
echo "Profile stored at: $PROFILE_DIR"
