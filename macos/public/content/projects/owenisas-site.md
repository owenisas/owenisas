# owenisas.com — macOS in the browser

The site you're inside of. A faithful-ish macOS shell built in React, with real window management, keyboard shortcuts, and a virtual filesystem that all the apps read from.

## Stack

- **React 19 + Vite** — app shell
- **Three.js** — 3D desk showroom intro
- **Tailwind v4** — styling
- **Custom VFS** — drives Finder, Terminal, Spotlight, Photos
- **Vercel** — edge hosting + an API proxy for Safari iframes

## Fun bits

- Dock with real magnification (cursor distance → icon scale)
- Genie-ish minimize animation
- Liquid-glass blur chrome (Tahoe-inspired)
- Cmd+Tab app switcher, Mission Control, Hot Corners
- Scripted Messages "Ask Thomas" conversations
- Terminal with a real shell over the VFS — tab completion, history, `neofetch`

## Why

Résumés are boring. Giving you a desktop to poke at is a better signal of how I think about interaction, state, and polish than any bullet list.
