# owenisas.com — Interactive macOS Desktop Portfolio

A personal portfolio site that boots into a 3D desk showroom, then zooms into a fully interactive macOS desktop simulation. Built with React 19, Three.js, and Tailwind CSS v4.

**Live:** [www.owenisas.com](https://www.owenisas.com)

## What It Does

- **3D Desk Showroom** — GLTF models of real hardware (MacBook Pro M3, mechanical keyboard, DJI Mavic 3, Razer mouse, Steins;Gate divergence meter) composited on a desk with cinematic lighting, cubic-bezier camera transition into the desktop
- **macOS Desktop Simulation** — wallpaper, menu bar, dock, desktop icons (draggable, position-persisted to localStorage), right-click context menu, Launchpad, Spotlight (Cmd+Space)
- **Working Apps** — Calculator, Finder, Notes, Safari (with iframe proxy + profile cards for LinkedIn/X), Settings (wallpaper switcher), TextEdit, Photos, Messages, Mail, Preview, Weather, Calendar, Terminal, About This Mac
- **Deep Linking** — apps open via URL params and state syncs back to the URL bar, shareable window configurations
- **Scraped Profile Data** — LinkedIn + X profile data refreshed daily via GitHub Actions (Playwright), displayed in custom in-app cards

## Stack

- React 19 + Vite 8
- Three.js (GLTFLoader + DRACOLoader for 3D models)
- Tailwind CSS v4
- Vercel (hosting + serverless proxy API)

## Development

```bash
cd macos
npm install
npm run dev
```

Build:

```bash
npm run build   # outputs to macos/dist/
```

## Project Structure

```
macos/
├── src/
│   ├── App.jsx              # Desktop + 3D showroom orchestration
│   ├── components/          # Dock, MenuBar, Window, Spotlight, Launchpad, DeskShowroom
│   ├── apps/                # Calculator, Safari, Finder, Notes, Terminal, etc.
│   ├── contexts/            # Window manager
│   ├── fs/                  # Virtual filesystem
│   └── lib/                 # Deep linking, desktop persistence
├── scripts/
│   └── scrape-profiles.mjs  # Playwright scraper for LinkedIn/X data
├── public/data/             # Scraped profile JSON (auto-refreshed)
└── assets/                  # 3D models (GLB), textures
```
