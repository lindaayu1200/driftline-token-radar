# driftline-token-radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/lindaayu1200/driftline-token-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/lindaayu1200/driftline-token-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Driftline — a token launch radar for make.fun's "Build the best token launch radar" bounty. It reads a sealed DefiLlama snapshot, ranks pre-token protocols by an implied value built only from the snapshot's own figures (TVL-band multiple × 7-day momentum × age-without-token), renders a nautical soundings-chart dashboard with sortable board, filters, per-protocol detail views showing the value decomposition arithmetic, and a concrete costed farm plan (USD cost and time per step) for every protocol. 235 rows cover all 40 watchlist protocols plus 195 early-stage pre-token protocols below the floor.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=eh9bmgam&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
