# BCI Bit Rate Maximizer

Maximize **B = log₂(N−1) · max(Sc−Si, 0) / t** — the Shenoy et al. (2021) BCI metric.

Live: [bit-rate-mauve.vercel.app](https://bit-rate-mauve.vercel.app/) &nbsp;·&nbsp; Local: `./run.sh`

---

## How it works

**SPACE** → 60s calibration → 60s scored run.

Each block shows a key sequence. Type it in order to clear it. Wrong key flashes red and resets the block. Preview blocks on the right let you read ahead.

**T** from the start screen runs test mode (all configs, exports CSV with results).

---

## Calibration 

Four 12s harvest windows (k = 9 → 26 → 52 → 62) collect keystrokes-per-second and error rate at each keyset size. A Hick-Hyman fit (`T_key = a + b·log₂k`) and linear error model (`E_rate = c·k`) are then fitted, and a grid search over k = 2–66, L = 2–4 picks the (k, L) that maximizes predicted bit rate. An 8s verification window applies safety damping if error rate exceeds 5% or speed decresed by >15%. Results export as CSV.

---

## Why k=26, L=2 is the baseline

We tested configurations ranging from N = 4 to N = 3844 across three participants.

| Configuration                | N             | bits/sel       | Result                                                                                        |
| ---------------------------- | ------------- | -------------- | --------------------------------------------------------------------------------------------- |
| 4 keys, len 1                | 4             | 1.58           | Low complexity/high accuracy, low information transmission, low performance                   |
| 4 keys, len 2                | 16            | 3.91           | Low complexity/high accuracy, low information transmission, low performance                   |
| 26 keys, len 1               | 26            | 4.64           | Low complexity/high accuracy, medium information transmission, solid performance              |
| **26 keys, len 2**     | **676** | **9.34** | **Medium complexity/high accuracy, high information transmission, highest performance** |
| 52 keys (a–Z), len 2        | 2704          | 11.40          | High complexity/medium accuracy, high information transmission, medium performance            |
| 62 keys (a–Z + 0–9), len 2 | 3844          | 11.91          | High complexity/low accuracy, high information transmission, medium performance               |

All three participants performed best on two-letter sequences over the full alphabet. Increasing N only adds log-scale bits; increasing Sc adds linearly — k=26, L=2 hits the sweet spot. The PRSO personalizes this per user. Press **T** from the start screen to reproduce this comparison (cycles all configs, exports CSV).

---

## What we tried

**Voice** — Recognition latency and error rates were too high; net score was worse than keyboard.

**Grid paths** — Cell selection in a 4x4 grid was slower than letter sequences.

---

## Files

| File           | Purpose                                |
| -------------- | -------------------------------------- |
| `index.html` | Layout and CSS                         |
| `script.js`  | Game logic, optimization engine, chart |
| `run.sh`     | Local server                           |
