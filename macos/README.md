<div align="center">

# owenisas.com

### An interactive macOS desktop simulator — live portfolio of Thomas Suen

[![Live Site](https://img.shields.io/badge/Live-owenisas.com-36BCF7?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.owenisas.com)

</div>

<div align="center">
  <img src="screenshots/showroom.jpg" width="100%" alt="3D Desk Showroom — boots into a cinematic desk with real hardware models" />
  <br/><sub>Boots into a 3D desk showroom, then zooms into a fully interactive macOS desktop</sub>
</div>

---

## What It Is

A personal portfolio that doesn't just *show* work — it *is* the work. Instead of a static page, visitors land in a 3D desk showroom with real hardware models, then transition into a working macOS desktop where every app is functional: browse the web in Safari, use Spotlight, open Calculator, drag windows around, switch wallpapers.

<div align="center">
  <table>
    <tr>
      <td width="50%" align="center"><img src="screenshots/desktop.jpg" width="100%" alt="macOS Desktop" /><br/><sub>Desktop with draggable icons, dock, menu bar</sub></td>
      <td width="50%" align="center"><img src="screenshots/safari.jpg" width="100%" alt="Safari browser" /><br/><sub>Safari with proxy + LinkedIn/X profile cards</sub></td>
    </tr>
    <tr>
      <td width="50%" align="center"><img src="screenshots/calculator.jpg" width="100%" alt="Calculator" /><br/><sub>Working Calculator app</sub></td>
      <td width="50%" align="center"><img src="screenshots/finder.jpg" width="100%" alt="Finder" /><br/><sub>Finder with virtual filesystem</sub></td>
    </tr>
  </table>
</div>

## Features

**3D Desk Showroom**
- GLTF models of real hardware: MacBook Pro M3, mechanical keyboard, DJI Mavic 3, Razer mouse, Steins;Gate divergence meter
- Cinematic lighting with ACES tone mapping and cubic-bezier camera transition into the desktop
- WebGL rendering with DRACO mesh compression

**macOS Desktop Simulation**
- Wallpaper system with multiple presets and persistence
- Menu bar, dock, desktop icons (draggable, position saved to localStorage)
- Spotlight search (Cmd+Space), Launchpad, right-click context menus
- Window manager with focus, dragging, z-ordering

**Working Apps** — each app is a real React component, not a screenshot:
- **Safari** — iframe proxy with custom profile cards for LinkedIn/X
- **Calculator, Notes, TextEdit, Terminal, Finder, Photos, Mail, Weather, Calendar, Preview, Settings, About This Mac**
- **Settings** — live wallpaper switcher that persists across sessions
- **Terminal** — backed by a virtual filesystem

**Deep Linking** — apps open via URL params and window state syncs back to the URL bar. Shareable window configurations.

**Scraped Profile Data** — LinkedIn + X profile data refreshed daily via GitHub Actions (Playwright), displayed in custom in-app cards.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| 3D | Three.js, GLTFLoader, DRACOLoader |
| Hosting | Vercel + serverless proxy API |
| Data | Playwright scraper via GitHub Actions |

## Development

```bash
cd macos
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to macos/dist/
```

## Project Structure

```
macos/
├── src/
│   ├── App.jsx              # Desktop + 3D showroom orchestration
│   ├── components/          # Dock, MenuBar, Window, Spotlight, Launchpad
│   │   └── DeskShowroom.jsx # Three.js 3D desk scene
│   ├── apps/                # Calculator, Safari, Finder, Terminal, etc.
│   │   └── safari/          # ProfileCards for LinkedIn/X
│   ├── contexts/            # Window manager
│   ├── fs/                  # Virtual filesystem
│   └── lib/                 # Deep linking, desktop persistence
├── scripts/
│   └── scrape-profiles.mjs  # Playwright scraper for LinkedIn/X
├── public/data/             # Scraped profile JSON (auto-refreshed)
├── assets/                  # 3D models (GLB), textures
└── screenshots/             # README screenshots
```

## Live

**[www.owenisas.com](https://www.owenisas.com)**

## License

MIT
