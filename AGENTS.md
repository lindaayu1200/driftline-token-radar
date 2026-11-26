# Driftline — token-radar-01 entry build spec

You are building a competition entry (make.fun token-radar-01). The repo holds a WORKING starter; your job
is to transform it into a distinctly different, higher-quality entry named "Driftline".

## What to do in THIS session
Rewrite `lib/model.ts` completely (keep the same exports main.ts imports: parseSnapshot, buildRadar,
dataScript, boardIssue, and any interfaces it needs). Read `main.ts` first to know exactly what it uses.

## The value model (snapshot figures only, no hardcoded names)
- Read /root/workspace/makefun/token-radar-01/token-radar-01-kit/input/snapshot.json to see real data.
- Pre-token protocol = no gecko_id AND no symbol AND no mcap. Keep live-token protocols in a separate
  set (by mcap, LIVE_ROWS=24), never ranked in the board.
- Board rows: watchlist slugs (all 40) first by value, then the highest-TVL pre-token protocols below the
  floor until at least 200 rows total. Every row: rank 1..N, implied_value_usd positive whole number,
  non-increasing with rank, farm_steps array of 4-8 strings each 20-600 chars, with concrete USD cost
  (gas, bridge fees, position sizes as % of TVL) and time (hours/days) per step. Generate plans from the
  row's category + chains; give different categories genuinely different steps (perp DEX vs LSD-proxy vs
  lending vs bridge vs testnet airdrop farming).
- Implied value decomposition, stated on the page later, computed here:
    base       = tvl_usd * multiple, where multiple = 0.25 for tvl >= 100M, 0.35 for 10M-100M, 0.5 below 10M
    momentum   = 1 + clamp(change_7d, -60, 150)/100 * 0.4   (null change_7d -> 1.0)
    ageMult    = 0.7 + min(age_days, 1095)/1095 * 0.5       (null listed_at -> 365 days)
    implied    = max(1, round(base * momentum * ageMult))
  Also compute per row: `signal` 0-100 (blend: 50*normalized log TVL + 25*momentum + 25*age) and
  `confidence` tier "high|medium|low" from how many inputs are null.
- Add to each row: `watchlisted: boolean`, `decomposition: {base, momentum, ageMult, multiple}` so the
  detail view can show the arithmetic.
- Constants exported in a MODEL object with a MODEL_VERSION string "driftline-1".
- dataScript(radar) must emit `window.DRIFTLINE = {...}` (NOT a generic name) with: rows, live set,
  watchlist slugs, snapshot meta (as_of, source, floor_usd), model constants + formula strings.
- boardIssue(board, snapshot) must enforce EVERY gate rule from the rules (row count 100-4000, slug valid,
  ranks 1..N once, implied non-increasing, >=2 distinct implied values, farm_steps 3-12 strings 20-600
  chars, every watchlist slug present). Reuse the starter's checks, tighten anything loose.

## Rules
- TypeScript, Node 22, standard library only. No new dependencies.
- After rewriting: run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../token-radar-01-kit/input/snapshot.json`
  and fix until it exits 0. Then run it a SECOND time into out2 and `diff -r out out2` — byte-identical required.
- Verify with node: board.json has >=200 rows, ranks exactly 1..N, first row's implied >= last row's,
  all 40 watchlist slugs present, every farm_steps entry 20-600 chars.
- Do NOT touch dashboard/, screenshots/, vendor/, LICENSE. Do not create new files outside lib/.
