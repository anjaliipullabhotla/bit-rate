# BCI Bit Rate Maximizer

A 60-second human-speed benchmark built to maximize **Bit Rate (B)** under the Shenoy et al. (2021) BCI evaluation formula.

---

## Quick Start

```bash
./run.sh
```

Launches a Python HTTP server on `localhost:8000` and opens the app automatically. Or use [https://bit-rate-mauve.vercel.app/](https://bit-rate-mauve.vercel.app/)

---

## How to Play

1. A row of blocks appears. The **large glowing block** is your active target.
2. Each block shows a 2-letter sequence (e.g., `K Q`). Type the letters in order.
3. Correct: block clears instantly, next target appears.
4. Wrong key: block flashes red, input resets, `Si` increments.
5. Three smaller preview blocks to the right let you read ahead.
6. Press **SPACE** to start. **T** to run test mode.

---

## Scoring Formula

```
B = log2(N - 1) × max(Sc - Si, 0) / t

N  = 650  (26×25 two-letter sequences, no repeated letters)
t  = 60 s
Sc = correct selections
Si = incorrect selections
```

---

## Design Choices

### Input Modality — Keyboard Letters

The keyboard was chosen as the input modality because it is the high-bandwidth familiar to most everyone.  This minimizes the bottleneck between perception and execution.

Arrow keys, number rows, and home-row subsets (ASDF + JKL;) were also tested. Letters outperformed all of them in practice — likely because the full alphabet benefits from years of overlearned motor programs that number or arrow layouts do not share.

### Why N = 676

Since, increasing N only results in a logarithmic increase in bit rate, whereas increasing S_c results in a linear increase in bit rate, the task required finding an optimal N such that plenty of information is encoded in a single selection without compromising accuracy/reaction time.

We tested configurations ranging from N = 4 to N = 3844:

| Config                       | N             | bits/sel       | Notes                                                                                         |
| ---------------------------- | ------------- | -------------- | --------------------------------------------------------------------------------------------- |
| 4 keys, len 1                | 4             | 1.58           | Low complexity/high accuracy, low information transmission, low performance                   |
| 4 keys, len 2                | 16            | 3.91           | Low complexity/high accuracy, low information transmission, low performance                   |
| 26 keys, len 1               | 26            | 4.64           | Low complexity/high accuracy medium information transmission, solid performance              |
| **26 keys, len 2**     | **676** | **9.40** | **Medium complexity/high accuracy, high information transmission, highest performance** |
| 52 keys (a–Z), len 2        | 2704          | 11.40          | High complexity/medium accuracy, high information transmission, medium performance            |
| 62 keys (a–Z + 0–9), len 2 | 3844          | 11.91          | High complexity/low accuracy, high information transmission, medium performance               |

The 26-letter length-2 configuration produced the highest measured bit rate. The test was given to three people (Dana -- Emma, Chris -- Steven, and Irina -- Alice) who all performed best on two letter sequences. See **test mode** (press T from the start screen) to reproduce this comparison: the game cycles through all configurations in random order and exports results as a CSV.

## Architecture

| File           | Purpose                                                          |
| -------------- | ---------------------------------------------------------------- |
| `index.html` | Layout, CSS, all visual styling. Zero dependencies.              |
| `script.js`  | Game state machine, input handling, bit rate calculation, chart. |
| `run.sh`     | Python HTTP server + auto browser open.                          |
