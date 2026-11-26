# Session B — the Driftline dashboard

Rewrite the dashboard completely: `dashboard/index.html`, `dashboard/app.css`, `dashboard/app.js`.
Keep the same load contract as the starter (index.html loads ../data.js then app.js; main.ts writes
data.js next to the page in /output, so app.js must reference ../data.js exactly as the starter does).

Design (already decided, follow it exactly):
- Name: **Driftline**. A nautical soundings-chart look. NO framework, no network, system fonts only
  (Georgia for masthead/heads, ui-monospace for every numeral, system sans for body).
- Palette: paper `#EDF2F0`, ink `#17332D`, survey teal `#0B7285` (accent/links/focus), signal red
  `#B0483B` (only for negative momentum and errors), caution `#8A6A1F` (low confidence).
- Layout:
  1. Masthead: serif "Driftline", one-line subtitle "where a protocol's token is not yet issued", and
     the stat band: total TVL watched, protocols ranked, watchlist covered (40/40), floor $50M, as_of date.
  2. "How the number is made" strip: the formula from MODEL constants (base multiple by TVL band,
     momentum multiplier, age multiplier) in compact mono, plus model version driftline-1.
  3. The soundings chart: an SVG scatter, x = age in days (log-ish), y = TVL (log), point area/ring by
     implied value, watchlist points ringed in teal, others filled faint. Hover shows name + implied.
     No chart library — hand-rolled SVG built in JS.
  4. The board table: rank, name (+category small), chains (max 3 badges + "+N"), TVL, 7d momentum
     (red when negative), age, signal bar, implied value (mono, right), confidence dot. Sortable by
     clicking column headers. Default order = rank.
  5. Filters row: text search, category select, chain select, watchlist-only toggle, confidence select.
  6. Detail view: clicking a row opens a panel (in-page, replaces table view; browser Back returns) with
     the decomposition arithmetic shown literally (base * momentum * ageMult = implied), signal breakdown,
     watchlist status, the farm plan as numbered steps with cost and time chips, and the live-token
     set-aside section reachable by a tab.
- Motion: none beyond focus states. Keyboard: table rows focusable, Enter opens detail, Esc returns.
- Responsive down to 360px (table collapses to stacked cards).

Quality bar:
- Zero console errors, no external requests (page must work from file://).
- All rendering from window.DRIFTLINE data — nothing hardcoded.
- Keep the whole dashboard under ~40 KB total so the dossier source fits the 64 KB text budget.
- After writing: run the program (`mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../token-radar-01-kit/input/snapshot.json`),
  then verify app.js has no syntax errors (`node --check dashboard/app.js`). Fix anything until clean.
- Do NOT touch lib/, vendor/, screenshots/, LICENSE, main.ts (except if data.js contract truly forces it —
  prefer changing app.js).
