# BCI Bit Rate Maximizer

Maximize **B = log₂(N−1) · max(Sc−Si, 0) / t** — the Shenoy et al. (2021) BCI metric.

Live: [bit-rate-mauve.vercel.app](https://bit-rate-mauve.vercel.app/) &nbsp;·&nbsp; Local: `./run.sh`

---

## How it works

**SPACE** → 69s PRSO calibration → 60s scored run.

Each block shows a key sequence. Type it in order to clear it. Wrong key flashes red and resets the block. Preview blocks on the right let you read ahead.

**T** from the start screen runs test mode (all configs, exports CSV).

---

## Calibration — PRSO

Four 15s harvest windows (k = 9 → 26 → 52 → 62) collect keystrokes-per-second and error rate at each keyset size. A Hick-Hyman fit (`T_key = a + b·log₂k`) and linear error model (`E_rate = c·k`) are then fitted, and a grid search over k = 2–66, L = 2–4 picks the (k, L) that maximizes predicted bit rate. A 5s verification window applies safety damping if error rate exceeds 10%. Results export as CSV.

---

## Why k=26, L=2 is the baseline

Increasing N only adds log-scale bits; increasing Sc adds linearly. Two-letter sequences over the full alphabet (N = 676, ~9.4 bits/sel) hit the sweet spot — high enough information density without the accuracy penalty of larger or longer configs. The PRSO personalizes this per user.

---

## What we tried

**Voice** — recognition latency and error rates were too high; net score was worse than keyboard.

**Grid paths** — 4×4 cell-path selection was slower than letter sequences.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Layout and CSS |
| `script.js` | Game logic, PRSO engine, chart |
| `run.sh` | Local server |
