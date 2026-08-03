# macOS Simulator Polish Plan

Status: in progress

## Goals

Make the simulator feel like one coherent macOS desktop rather than a collection of themed React apps:

- shared light/dark window materials and correct title-bar contrast;
- believable menu bar, Control Center, Dock, Launchpad, Finder, Settings, and About This Mac;
- no misleading controls that look interactive but do nothing;
- consistent toolbar/sidebar sizing, hairlines, selection states, typography, and focus behavior;
- reliable state transitions when launching, minimizing, restoring, and deep-linking apps;
- production verification after each deploy.

## Phase 1 — Shared shell and tokens

- [x] Audit the desktop shell, app registry, window context, menu bar, dock, launchpad, shared controls, and global CSS.
- [x] Add light/dark-aware window chrome instead of wrapping light apps in dark glass.
- [x] Correct title-bar text contrast and light-window borders.
- [x] Add reduced-motion and reduced-transparency fallbacks.
- [x] Give shared toolbar buttons explicit `type` and `aria-label` semantics.
- [x] Make Control Center a local interactive popover with Wi-Fi, Bluetooth, Focus, Sound, Display, and Battery modules.
- [x] Add Escape-to-dismiss for menu and Control Center popovers.
- [ ] Add true keyboard navigation for menu items and restore focus after popover close.
- [ ] Add responsive menu-bar overflow behavior for narrow viewports.
- [ ] Replace layout-affecting Dock magnification updates with compositor-only transforms.

## Phase 2 — Finder and system surfaces

- [x] Fix Finder Gallery’s incorrect dark surface inside a light window.
- [x] Fix Finder Column/Gallery selection bubbling and inspector state.
- [x] Make Finder respond when an already-open window receives a new VFS path payload.
- [ ] Implement Finder tag filtering or mark unsupported tags as non-interactive.
- [x] Route About This Mac → More Info directly to Settings → About.
- [x] Align About This Mac and Settings device/version metadata on macOS Tahoe 26.0.
- [x] Remove the italicized fake product title treatment from About This Mac.
- [ ] Move Settings’ nested About panel component outside the parent render function.
- [x] Replace silent fallback-to-General behavior for unsupported Settings categories with an explicit placeholder surface.
- [ ] Wire Settings values into shared desktop state where feasible (wallpaper, appearance, Dock size, Dock position).

## Phase 3 — App behavior and consistency

- [x] Fix Mail stale message detail when switching to an empty mailbox.
- [x] Add Calendar month navigation and dynamic month grid generation.
- [x] Make Calendar search and Today controls honest and labeled.
- [x] Restore Photos Screenshots album classification when the VFS contains screenshot-like assets.
- [x] Scope Calculator keyboard handling away from text inputs and contenteditable surfaces.
- [x] Add missing `pause.fill` SF Symbol used by Music.
- [ ] Wire or disable no-op Mail toolbar actions.
- [ ] Wire Music seek/volume controls and label Queue/Shuffle/Repeat/AirPlay actions.
- [ ] Add Messages reveal-timer cleanup when changing conversations.
- [ ] Fix Preview zoom behavior for text/PDF surfaces.
- [ ] Persist TextEdit edits in the simulator VFS/session state.
- [ ] Replace Safari’s derived frequently-visited URLs with explicit URL records.
- [ ] Normalize toolbar heights and sidebar widths through shared tokens.

## Phase 4 — Accessibility and interaction quality

- [x] Convert Dock app and minimized-window items to semantic buttons with accessible names.
- [x] Add Launchpad dialog semantics, application search label, and visible focus class.
- [x] Restore global focus-visible indicators for inputs/selects.
- [ ] Add desktop-icon keyboard open behavior and stronger focus treatment.
- [ ] Add Launchpad focus containment/restoration.
- [ ] Mark unsupported menu actions disabled instead of active-looking no-ops.
- [ ] Add accessible labels to all remaining toolbar buttons.

## Phase 5 — Custom app icons

- [x] Generate a custom icon direction sheet for Anime Tracker, GitHub Activity, Code, and Music.
- [x] Keep production on verified Apple PNGs while generated assets remain conversation-only artifacts.
- [ ] Export individual generated icons to 1024px PNGs.
- [ ] Crop, normalize, and visually approve each icon at Dock and Launchpad sizes.
- [ ] Integrate custom icons only after asset QA; keep Apple system apps on real macOS assets.

## Phase 6 — Verification and release

- [x] Run a production build after the first polish batch.
- [x] Verify local Dock semantics and Control Center popover in browser.
- [ ] Run targeted local QA for Finder, Settings/About, Calendar, Mail, Photos, Launchpad, Dock, and all changed apps.
- [ ] Run `git diff --check` and resolve important lint regressions.
- [ ] Commit only intended source/assets; keep temporary capture scripts untracked.
- [ ] Push and verify deployment provider status.
- [ ] Cache-bust the public domain and verify live DOM asset paths, app opening, and console errors.
