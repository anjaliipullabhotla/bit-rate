# ComboStack — BCI Bit Rate Maximizer

A 60-second human-speed benchmark built to maximize **Bit Rate (B)** under the Shenoy et al. (2021) BCI evaluation formula.

---

## Quick Start

```bash
./run.sh
```

This launches a Python HTTP server on `localhost:8000` and opens the app in your default browser automatically.

**Manual launch:**
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## How to Play

1. The screen shows a vertical stack of 4 blocks. The **large glowing bottom block** is your active target.
2. Each block displays a 2-arrow sequence (e.g., `↑ →`).
3. Type the two arrows in order using your keyboard arrow keys.
4. On a correct sequence: the block clears instantly and the stack drops.
5. On any wrong key: the block flashes red, your input resets, and `Si` increments.
6. The 3 preview blocks above let you pre-read upcoming patterns.
7. Press **SPACE** to start. The timer counts down from 60 seconds.
8. When time expires, your final Bit Rate score is displayed.

---

## Design Rationale

### Why N = 16?

| Layout | N | bits/selection | Notes |
|---|---|---|---|
| 4 single keys | 4 | 1.58 | Too sparse — low information density |
| **2-key arrow combos** | **16** | **3.91** | **Optimal throughput/cognitive-load balance** |
| 3-key arrow combos | 64 | 5.98 | High bits but severe cognitive delay + error propagation |

The formula is:

```
B = log2(N-1) × max(Sc - Si, 0) / t
```

With N=16: `log2(15) ≈ 3.9068 bits` per correct selection. The 2-key sequence can be executed as a fast rolling finger motion (~80–120ms/combo for a practiced user), making it faster than a single keypress on an N=128 layout that requires visual search.

### Why Static Stack, Not Falling Objects?

Traditional rhythm games force players to **wait** for a target to arrive. That introduces a hard ceiling on throughput that has nothing to do with motor speed. ComboStack advances exclusively at the pace of the user's hands — the moment the second correct key is pressed, the next target is already waiting.

### Error Penalty

An incorrect key press increments `Si` and resets the input buffer. This prevents button-mashing strategies (e.g., pressing all 4 arrows rapidly) from inflating `Sc`. The net throughput term `max(Sc - Si, 0)` means errors are directly destructive, so the optimal strategy is deliberate accuracy over reckless speed.

### Pre-Buffer Previews

The 3 muted blocks above the active target allow fast players (Calvin, 200+ WPM) to pipeline: while executing the current sequence their eyes have already parsed the next 1–3. This eliminates inter-trial cognitive latency at high speed.

---

## Scoring Formula

```
B = log2(N - 1) × max(Sc - Si, 0) / t

N  = 16   (4 arrows × 2-key sequences = 4² = 16 unique combos)
t  = 60 s (fixed evaluation window)
Sc = correct selections
Si = incorrect selections
```

**Theoretical ceiling estimate:** At 2 keys per selection and ~100ms per keypress (achievable by a 200 WPM typist), a player could complete ~300 selections in 60s with perfect accuracy: `3.9068 × 300 / 60 ≈ 19.5 bps`. Real scores will vary based on accuracy and reading speed.

---

## Architecture

| File | Purpose |
|---|---|
| `index.html` | Layout, CSS, and all visual styling. Zero framework dependencies. |
| `script.js` | Game state machine, input handling, bit rate calculation, canvas chart. |
| `run.sh` | One-command launcher: Python HTTP server + auto browser open. |
| `README.md` | This file. |

No build tools, no npm, no bundler. Open in any modern browser.

---

## Testing Checklist

### Functional Tests

- [ ] **Start screen** appears on load with "Press SPACE to start" prompt.
- [ ] **SPACE** transitions to running state and starts 60s countdown.
- [ ] **Arrow keys** do not scroll the page (default prevented).
- [ ] Correct first key **highlights** the first arrow in the active block blue.
- [ ] Correct second key triggers **green flash**, block clears, stack drops.
- [ ] Wrong key at any position triggers **red flash + shake**, resets buffer, increments `Si`.
- [ ] `Sc` and `Si` counters update immediately after each event.
- [ ] **Bit Rate** (bps) display updates every 50ms.
- [ ] **Canvas chart** adds a new data point each second.
- [ ] Timer turns **red** when ≤ 10 seconds remain.
- [ ] At t=0: all arrow key input is **locked out** (pressing keys does nothing).
- [ ] **Score screen** shows correct `Sc`, `Si`, net selections, accuracy, and final bps.
- [ ] Pressing **SPACE** on the score screen restarts the game and resets all counters.
- [ ] Restarting clears the canvas chart history.

### Edge Cases

- [ ] Holding an arrow key down does not register multiple inputs for one physical press — standard `keydown` behavior (OS key repeat may fire; this is acceptable and consistent across users).
- [ ] `Sc - Si < 0` clamps to 0 (bps never goes negative).
- [ ] First selection at `elapsed ≈ 0` does not cause divide-by-zero (guarded by `elapsed <= 0` check).
- [ ] Resizing the browser window redraws the canvas without artifacts.

### Performance Tests (for Calvin)

- [ ] Rapid alternating arrow presses (simulating 200 WPM) do not drop inputs or cause visual lag.
- [ ] Stack drop animation (90ms) completes cleanly before the next input is processed.
- [ ] No visible frame drops during sustained high-speed play.

### Cross-Browser

- [ ] Chrome / Chromium
- [ ] Firefox
- [ ] Safari (macOS)
