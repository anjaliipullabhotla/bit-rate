'use strict';

// ── TEST CONFIGURATIONS ────────────────────────────────────────────────────────
const TEST_CONFIGS = [
  {
    label:      'a – z (×2)',
    SEQ_LENGTH: 2,
    horizMode:  true,
    KEY_MAP:    Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, c])),
    DIR_CLASS:  Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, 'dir-letter'])),
  },
  {
    label:     '4×4 grid',
    SEQ_LENGTH: 1,
    gridMode:   true,
    horizMode:  false,
    KEY_MAP:    Object.fromEntries([...'1234qwerasdfzxcv'].map(c => [c, c])),
    DIR_CLASS:  Object.fromEntries([...'1234qwerasdfzxcv'].map(c => [c, 'dir-letter'])),
    GRID_ROWS:  [['1','2','3','4'],['q','w','e','r'],['a','s','d','f'],['z','x','c','v']],
  },
  {
    label:      '12 (×8)',
    SEQ_LENGTH: 8,
    horizMode:  true,
    KEY_MAP:    Object.fromEntries('12'.split('').map(c => [c, c])),
    DIR_CLASS:  Object.fromEntries('12'.split('').map(c => [c, 'dir-letter'])),
  },
  {
    label:      'a - z (×3)',
    SEQ_LENGTH: 3,
    horizMode:  true,
    KEY_MAP:    Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, c])),
    DIR_CLASS:  Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, 'dir-letter'])),
  },
  {
    label:      'Arrows ↑↓←→',
    SEQ_LENGTH: 2,
    KEY_MAP:    { 'ArrowUp':'↑','ArrowDown':'↓','ArrowLeft':'←','ArrowRight':'→' },
    DIR_CLASS:  { '↑':'dir-up','↓':'dir-down','←':'dir-left','→':'dir-right' },
  },
  {
    label:      '0 – 9',
    SEQ_LENGTH: 2,
    KEY_MAP:    { '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9' },
    DIR_CLASS:  { '0':'dir-0','1':'dir-1','2':'dir-2','3':'dir-3','4':'dir-4','5':'dir-5','6':'dir-6','7':'dir-7','8':'dir-8','9':'dir-9' },
  },
  {
    label:      'ASDF + JKL;',
    SEQ_LENGTH: 2,
    KEY_MAP:    { 'a':'A','s':'S','d':'D','f':'F','j':'J','k':'K','l':'L',';':';' },
    DIR_CLASS:  { 'A':'dir-a','S':'dir-s','D':'dir-d','F':'dir-f','J':'dir-j','K':'dir-k','L':'dir-l',';':'dir-semi' },
  },
  {
    label:      '1 – 4',
    SEQ_LENGTH: 2,
    KEY_MAP:    { '1':'1','2':'2','3':'3','4':'4' },
    DIR_CLASS:  { '1':'dir-1','2':'dir-2','3':'dir-3','4':'dir-4' },
  },
  {
    label:      '1 – 4 (×3)',
    SEQ_LENGTH: 3,
    KEY_MAP:    { '1':'1','2':'2','3':'3','4':'4' },
    DIR_CLASS:  { '1':'dir-1','2':'dir-2','3':'dir-3','4':'dir-4' },
  },
  {
    label:      '1 – 4 (×1)',
    SEQ_LENGTH: 1,
    KEY_MAP:    { '1':'1','2':'2','3':'3','4':'4' },
    DIR_CLASS:  { '1':'dir-1','2':'dir-2','3':'dir-3','4':'dir-4' },
  },
  {
    label:      'a – z (×1)',
    SEQ_LENGTH: 1,
    horizMode:  true,
    KEY_MAP:    Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, c])),
    DIR_CLASS:  Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, 'dir-letter'])),
  },
  {
    label:      'a – z (×3)',
    SEQ_LENGTH: 3,
    horizMode:  true,
    KEY_MAP:    Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, c])),
    DIR_CLASS:  Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, 'dir-letter'])),
  },
  {
    label:      'a-Z (×2)',
    SEQ_LENGTH: 2,
    horizMode:  true,
    KEY_MAP:    Object.fromEntries([
      ...'abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, c]),
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => [c, c]),
    ]),
    DIR_CLASS:  Object.fromEntries(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => [c, 'dir-letter'])
    ),
  },
  {
    label:      'a-Z + 0-9 (×2)',
    SEQ_LENGTH: 2,
    horizMode:  true,
    KEY_MAP:    Object.fromEntries([
      ...'abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, c]),
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => [c, c]),
      ...'0123456789'.split('').map(c => [c, c]),
    ]),
    DIR_CLASS:  Object.fromEntries(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').map(c => [c, 'dir-letter'])
    ),
  },
];

const DURATION       = 60;
const CALIB_DURATION = 69; // 4×15s windows + 4×1s transitions + 5s verification
const QUEUE_SIZE     = 4;

// 66-char pool ordered so slice(0,k) gives the k-char keyset at each harvest point:
//   k=9  → home row, k=26 → all lowercase, k=52 → +uppercase, k=62 → +digits, k=66 → +punct
const KEYSET_POOL = [
  ...'asdfghjkl',                   // home row            → k=9
  ...'ertuinmvbcowyxpqz',           // remaining lowercase → k=26
  ...'ASDFGHJKIERTUINMVBCOWYXPQZ',  // uppercase           → k=52
  ...'0123456789',                  // digits              → k=62
  ';', '-', '[', ']',               // punctuation         → k=66
];

const HARVEST_INTERVALS = [
  { k: 9 }, { k: 26 }, { k: 52 }, { k: 62 },
];

// Active config — set by activateConfig()
let CONFIG, KEYS, KEY_DIR_CLASS, N, INFO_DENSITY;

// ── TEST MODE STATE ────────────────────────────────────────────────────────────
let testMode   = false;
let testCfgIdx = 0;
let testScores = [];
let testOrder  = [];

// ── CALIBRATION STATE (PRSO) ──────────────────────────────────────────────────
let calibPhase              = 0;    // 0–3 = harvest windows, 4 = verification
let calibIntervalData       = [];   // [{k, keystrokes, errors, duration}] per harvest window
let calibIntervalKeystrokes = 0;    // correct keystrokes in current harvest window
let calibIntervalErrors     = 0;    // wrong keystrokes in current harvest window
let calibIntervalStart      = null; // timestamp of current window start
let calibPhaseTimers        = [];   // setTimeout IDs for phase transitions
let calibOptK               = null; // k* chosen by grid search
let calibOptL               = null; // L* chosen by grid search
let calibParamA             = null; // Hick-Hyman intercept  T_key = a + b·log2(k)
let calibParamB             = null; // Hick-Hyman slope
let calibParamC             = null; // error-rate slope  E_rate = c·k
let calibVerifKeystrokes    = 0;    // correct keystrokes during verification window
let calibVerifErrors        = 0;    // wrong keystrokes during verification window
let calibPendingConfig      = null; // {k, L, title, deploy} set when a phase fires mid-sequence
let calibPhaseMarkers       = [];   // elapsed-time stamps of phase transitions (for chart)

// ── GAME STATE ─────────────────────────────────────────────────────────────────
let state = {
  phase:          'idle',
  timerRemaining: DURATION,
  Sc: 0, Si: 0,
  inputBuffer:    [],
  blockQueue:     [],
  bitRateHistory: [],
};

// ── DOM REFERENCES ─────────────────────────────────────────────────────────────
const startScreen        = document.getElementById('start-screen');
const scoreScreen        = document.getElementById('score-screen');
const intertrialScreen   = document.getElementById('intertrial-screen');
const testCompleteScreen = document.getElementById('test-complete-screen');
const stackCol           = document.getElementById('stack-col');
const timerVal           = document.getElementById('timer-value');
const scVal              = document.getElementById('sc-value');
const siVal              = document.getElementById('si-value');
const bpsVal             = document.getElementById('bps-value');
const canvas             = document.getElementById('bitrate-canvas');
const ctx                = canvas.getContext('2d');

const finalBps  = document.getElementById('final-bps-value');
const finalN    = document.getElementById('final-n');
const finalBits = document.getElementById('final-bits');
const finalSc   = document.getElementById('final-sc');
const finalSi   = document.getElementById('final-si');
const finalNet  = document.getElementById('final-net');
const finalAcc  = document.getElementById('final-acc');

const calibResultScreen = document.getElementById('calib-result-screen');

// ── CONFIG ACTIVATION ──────────────────────────────────────────────────────────
function configN(cfg) {
  if (cfg.gridMode) return Math.pow(2, Object.keys(cfg.KEY_MAP).length) - 1;
  const k = Object.keys(cfg.KEY_MAP).length;
  const L = cfg.SEQ_LENGTH;
  return Math.pow(k, L);
}

function activateConfig(cfg) {
  KEYS          = Object.keys(cfg.KEY_MAP);
  KEY_DIR_CLASS = cfg.DIR_CLASS;
  N             = configN(cfg);
  INFO_DENSITY  = Math.log2(N - 1);
  CONFIG        = { DURATION, SEQ_LENGTH: cfg.SEQ_LENGTH, QUEUE_SIZE, KEY_MAP: cfg.KEY_MAP, horizMode: cfg.horizMode, gridMode: !!cfg.gridMode, GRID_ROWS: cfg.GRID_ROWS || null };

  stackCol.classList.toggle('horiz-mode', !!cfg.horizMode);
  stackCol.style.setProperty('--seq-len', cfg.SEQ_LENGTH);

  const modeInfo = document.getElementById('mode-info');
  if (modeInfo) modeInfo.textContent =
    `${cfg.label}  |  N=${N}  |  ~${INFO_DENSITY.toFixed(2)} bits/sel  |  60 s`;
}

function buildKeysetConfig(k, L) {
  const keys = KEYSET_POOL.slice(0, k);
  return {
    label:      `PRSO k=${k} L=${L}`,
    SEQ_LENGTH: L,
    horizMode:  true,
    KEY_MAP:    Object.fromEntries(keys.map(c => [c, c])),
    DIR_CLASS:  Object.fromEntries(keys.map(c => [c, 'dir-letter'])),
  };
}

// Live-deploys a k/L config mid-calibration (no mode-info update, no title change).
function deployCalibConfig(k, L) {
  const keys    = KEYSET_POOL.slice(0, k);
  KEYS          = keys;
  KEY_DIR_CLASS = Object.fromEntries(keys.map(c => [c, 'dir-letter']));
  CONFIG        = { ...CONFIG, SEQ_LENGTH: L, KEY_MAP: Object.fromEntries(keys.map(c => [c, c])) };
  N             = Math.pow(k, L);
  INFO_DENSITY  = Math.log2(N - 1);
  stackCol.style.setProperty('--seq-len', L);
  state.blockQueue = Array.from({ length: QUEUE_SIZE }, randomSequence);
  renderStack();
}

// Shows a brief inter-phase banner, blocks further input, then runs callback.
function showCalibTransition(title, callback) {
  state.blockQueue = []; // empties queue so keystrokes are silently ignored during pause
  stackCol.innerHTML = '';
  const msg = document.createElement('div');
  msg.style.cssText = [
    'color:var(--accent)',
    'font-size:0.8rem',
    'letter-spacing:0.2em',
    'text-transform:uppercase',
    'text-align:center',
    'opacity:0',
    'transition:opacity 0.25s',
  ].join(';');
  msg.textContent = title.includes('Verifying') ? 'Optimizing ···' : 'Next Phase ···';
  stackCol.appendChild(msg);
  requestAnimationFrame(() => { msg.style.opacity = '1'; });
  setTimeout(callback, 1000);
}

// Called at 15s/30s/45s/60s: records current window data, then switches config at
// the next clean block boundary so mid-sequence typing is never interrupted.
function advanceCalibPhase() {
  // Stamp the transition time so drawChart can draw a vertical marker line
  if (startTimestamp) calibPhaseMarkers.push((performance.now() - startTimestamp) / 1000);

  const elapsed = calibIntervalStart
    ? (performance.now() - calibIntervalStart) / 1000
    : 15;
  calibIntervalData.push({
    k:          HARVEST_INTERVALS[calibPhase].k,
    keystrokes: calibIntervalKeystrokes,
    errors:     calibIntervalErrors,
    duration:   elapsed,
  });

  calibPhase++;
  calibIntervalKeystrokes = 0;
  calibIntervalErrors     = 0;
  // calibIntervalStart is reset inside the transition callback so duration
  // is measured from when the new config is actually deployed, not from when
  // this timer fired (which would include the 1s transition pause).

  let nextK, nextL, title;
  if (calibPhase < 4) {
    nextK = HARVEST_INTERVALS[calibPhase].k;
    nextL = 2;
    title = `CALIBRATION 69s · Harvesting k=${nextK}`;
  } else {
    computeOptimalConfig();
    nextK = calibOptK;
    nextL = calibOptL;
    title = `CALIBRATION 69s · Verifying k=${nextK} L=${nextL}`;
  }

  const deploy = () => {
    calibIntervalStart = performance.now();
    deployCalibConfig(nextK, nextL);
    document.getElementById('game-title').textContent = title;
  };

  // If the user is between sequences, show transition banner immediately;
  // otherwise defer to the next clean block boundary.
  if (state.inputBuffer.length === 0) {
    showCalibTransition(title, deploy);
  } else {
    calibPendingConfig = { k: nextK, L: nextL, title, deploy };
  }
}

// Hick-Hyman + error model fit → exhaustive grid search. Sets calibOptK/L/Param*.
function computeOptimalConfig() {
  // 1. Clean and normalize our harvested interval baselines
  let normalizedData = calibIntervalData
    .filter(d => d.keystrokes > 0)
    .map(d => {
      let rawDuration = d.duration_s !== undefined ? d.duration_s : d.duration;
      let rawY = rawDuration / d.keystrokes;
      
      const secondsPerKey = rawY > 10 ? rawY / 1000 : rawY;
      const errorRate = d.errors / (d.keystrokes + d.errors);
      
      return { 
        k: d.k, 
        tKey: secondsPerKey, 
        eKey: errorRate, 
        errors: d.errors 
      };
    });

  if (normalizedData.length === 0) {
    calibOptK = 9; 
    calibOptL = 2; 
    return;
  }

  // 2. Isotonic Monotonicity Regularization with Speed Equivalence Bounding
  normalizedData.sort((x, y) => x.k - y.k);
  const KPS_EQUIVALENCE_BAND = 0.15;

  for (let i = 1; i < normalizedData.length; i++) {
    const kpsCurrent = 1 / normalizedData[i].tKey;
    const kpsPrevious = 1 / normalizedData[i - 1].tKey;
    
    if (normalizedData[i].eKey < normalizedData[i - 1].eKey) {
      const speedStalledOrNegligible = (normalizedData[i].tKey >= normalizedData[i - 1].tKey) || 
                                       (kpsCurrent <= kpsPrevious + KPS_EQUIVALENCE_BAND);
                                       
      if (speedStalledOrNegligible) {
        normalizedData[i].eKey = normalizedData[i - 1].eKey;
      }
    }
  }

  // 3. Calculate global regression coefficients for diagnostic telemetry
  const pts = normalizedData.map(d => ({ x: Math.log2(d.k), y: d.tKey }));
  let a = 0.30, b = 0.05;
  if (pts.length >= 2) {
    const n = pts.length;
    const sumX = pts.reduce((s, p) => s + p.x, 0);
    const sumY = pts.reduce((s, p) => s + p.y, 0);
    const sumXY = pts.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = pts.reduce((s, p) => s + p.x * p.x, 0);
    const denom = n * sumXX - sumX * sumX;
    if (Math.abs(denom) > 1e-10) {
      b = (n * sumXY - sumX * sumY) / denom;
      a = (sumY - b * sumX) / n;
    }
  }
  calibParamA = Math.max(a, 0.15);
  calibParamB = Math.max(b, 0.01);
  calibParamC = normalizedData.reduce((s, d) => s + d.eKey, 0) / normalizedData.length;

  // 4. Elite k=52 tracking gate (Requires absolute zero-error perfection)
  const d52 = normalizedData.find(d => d.k === 52);
  const d62 = normalizedData.find(d => d.k === 62);
  let k52Elite = false;
  if (d52 && d62) {
    k52Elite = d52.errors === 0 && (d62.tKey > d52.tKey * 1.12 || d62.eKey > d52.eKey * 2);
  }

  // --- TIME-FATIGUE COEFFICIENTS (60s Marathon vs 15s Calibration Sprint) ---
  const DELTA_SPEED = 0.025; 
  const DELTA_ERROR = 0.012; 
  
  // --- INTRA-SEQUENCE COGNITIVE DRIFT CONSTANT ---
  const INTRA_SEQ_DEGRADATION = 0.35; 

  // 5. Exhaustive grid search: k=2..66, L=2..4
  let bestBps = -Infinity, bestK = 9, bestL = 2;
  
  for (let k = 2; k <= KEYSET_POOL.length; k++) {
    for (let L = 2; L <= 4; L++) {
      
      let anchor = normalizedData[0];
      let minDist = Infinity;
      for (let d of normalizedData) {
        let dist = Math.abs(d.k - k);
        if (dist < minDist) { minDist = dist; anchor = d; }
      }

      let kRatio = k / anchor.k;
      let TkeyCalib = anchor.tKey * (1.0 + 0.06 * Math.log2(kRatio));
      let eKeyCalib = anchor.eKey * Math.sqrt(kRatio);

      // Apply the 60-second sustained marathon fatigue parameters to speed
      let TkeySustained = TkeyCalib * (1.0 + (DELTA_SPEED * Math.log2(k)));
      
      // COGNITIVE COORDINATION TAX: Add raw latency overhead for planning longer sequences
      if (L >= 3) {
        TkeySustained += 0.050; // 50ms coordination tax per key cycle for triplets/quads
      }

      // Joint Complexity Modifier
      let dynamicDeltaError = DELTA_ERROR;
      if (k > 26 && L >= 3) {
        dynamicDeltaError *= 2.0; // Intensified error penalty for case-shifting triplets
      }
      const eKeySustained = Math.min(Math.max(eKeyCalib * (1.0 + (dynamicDeltaError * k)), 0.001), 0.85);

      // POSITIONAL ACCURACY FIT
      let pBlockSuccess = 1.0;
      for (let i = 0; i < L; i++) {
        const eKeyPositional = Math.min(eKeySustained * (1.0 + (i * INTRA_SEQ_DEGRADATION)), 0.90);
        pBlockSuccess *= (1 - eKeyPositional);
      }
      
      // DRIFT PENALTY SCALING: Failure modifier scales with sequence depth
      const basePenaltyFactor = eKeySustained < 0.02 ? 0.5 : 1.0;
      const sunkTimeMultiplier = 1.0 + (L - 2) * 0.75; 
      const finalPenaltyFactor = basePenaltyFactor * sunkTimeMultiplier;

      const expectedBlockUtility = Math.max(pBlockSuccess - (finalPenaltyFactor * (1 - pBlockSuccess)), 0);
      
      // BIOMECHANICAL BLOCKER: You cannot chunk fluidly if you are forcing a physical Shift key.
      // Disable the chunking discount if the alphabet size requires uppercase modifiers (k > 26).
      const chunkingDiscount = (L >= 3 && k <= 26) ? 0.90 : 1.00;
      const totalBlockTime = L * TkeySustained * chunkingDiscount;

      const bps = (Math.log2(Math.pow(k, L) - 1) * expectedBlockUtility) / totalBlockTime;

      if (bps > bestBps) { 
        bestBps = bps; 
        bestK = k; 
        bestL = L; 
      }
    }
  }

  // 6. Elite Override Block (Fixed to prevent sub-optimal forced layout traps)
  if (k52Elite && d52) {
    const T52Sustained = (d52.tKey * (1.0 + (DELTA_SPEED * Math.log2(52))));
    const e52SustainedL2 = Math.min(Math.max(d52.eKey * (1.0 + (DELTA_ERROR * 52)), 0.001), 0.85);
    const e52SustainedL3 = Math.min(Math.max(d52.eKey * (1.0 + ((DELTA_ERROR * 2.0) * 52)), 0.001), 0.85);
    
    let pSuccessL2 = (1 - e52SustainedL2) * (1 - Math.min(e52SustainedL2 * (1 + INTRA_SEQ_DEGRADATION), 0.90));
    let pSuccessL3 = pSuccessL2 * (1 - Math.min(e52SustainedL3 * (1 + 2 * INTRA_SEQ_DEGRADATION), 0.90));
    
    const penaltyL2 = 0.5 * 1.0;
    const penaltyL3 = 0.5 * (1.0 + (3 - 2) * 0.75);

    const bps52L2 = (Math.log2(Math.pow(52, 2) - 1) * Math.max(pSuccessL2 - (penaltyL2 * (1 - pSuccessL2)), 0)) / (2 * T52Sustained * 1.00);
    const bps52L3 = (Math.log2(Math.pow(52, 3) - 1) * Math.max(pSuccessL3 - (penaltyL3 * (1 - pSuccessL3)), 0)) / (3 * (T52Sustained + 0.050) * 0.90);
    
    const bestEliteBps = Math.max(bps52L2, bps52L3);
    if (bestEliteBps > bestBps) {
      bestK = 52;
      bestL = bps52L3 > bps52L2 ? 3 : 2;
    }
  }

  // Final parameters assignment
  calibOptK = Math.min(bestK, KEYSET_POOL.length);
  calibOptL = bestL;
}

// ── UTILITY ────────────────────────────────────────────────────────────────────
function randomSequence() {
  if (CONFIG.gridMode) {
    let lit;
    do { lit = KEYS.filter(() => Math.random() < 0.5); } while (lit.length === 0);
    return lit;
  }
  const seq = [];
  for (let i = 0; i < CONFIG.SEQ_LENGTH; i++) {
    const randomKey = KEYS[Math.floor(Math.random() * KEYS.length)];
    seq.push(CONFIG.KEY_MAP[randomKey]);
  }
  return seq;
}

function calculateBitRate(elapsed) {
  if (elapsed <= 0) return 0;
  return (INFO_DENSITY * Math.max(state.Sc - state.Si, 0)) / elapsed;
}

// ── CANVAS / CHART ─────────────────────────────────────────────────────────────
function resizeCanvas() {
  const container = document.getElementById('chart-container');
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width  = rect.width  + 'px';
  canvas.style.height = rect.height + 'px';
  drawChart();
}

function drawChart() {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d0f13';
  ctx.fillRect(0, 0, w, h);

  const isCalib      = state.phase === 'calibrating';
  const activeDur    = isCalib ? CALIB_DURATION : DURATION;
  const lineColor    = isCalib ? '#00b4ff' : '#ffd600';
  const glowColor    = isCalib ? 'rgba(0,180,255,0.55)' : 'rgba(255,214,0,0.55)';
  const fillTop      = isCalib ? 'rgba(0,180,255,0.18)' : 'rgba(255,214,0,0.25)';
  const fillBottom   = isCalib ? 'rgba(0,180,255,0.01)' : 'rgba(255,214,0,0.02)';

  const history = state.bitRateHistory;
  if (history.length < 1) { drawGrid(w, h, 38, 8, 8, 22, 1, activeDur); return; }

  const maxVal = Math.max(...history.map(d => d.bps), 1) * 1.15;
  const padL = 38, padR = 8, padT = 8, padB = 22;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  drawGrid(w, h, padL, padR, padT, padB, maxVal, activeDur);

  // Phase-transition marker lines (calibration only)
  if (isCalib && calibPhaseMarkers.length > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,180,255,0.22)';
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 4]);
    calibPhaseMarkers.forEach(t => {
      const x = padL + (t / activeDur) * plotW;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  history.forEach((d, i) => {
    const x = padL + (d.t / activeDur) * plotW;
    const y = padT + plotH - (d.bps / maxVal) * plotH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const last = history[history.length - 1];
  ctx.lineTo(padL + (last.t / activeDur) * plotW, padT + plotH);
  ctx.lineTo(padL, padT + plotH);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
  grad.addColorStop(0, fillTop);
  grad.addColorStop(1, fillBottom);
  ctx.fillStyle = grad;
  ctx.fill();

  const cx = padL + (last.t / activeDur) * plotW;
  const cy = padT + plotH - (last.bps / maxVal) * plotH;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle   = lineColor;
  ctx.shadowBlur  = 8;
  ctx.shadowColor = glowColor;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawGrid(w, h, padL=38, padR=8, padT=8, padB=22, maxVal=1, duration=DURATION) {
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  ctx.strokeStyle = '#2a3040';
  ctx.lineWidth   = 1;
  ctx.font        = '9px SF Mono, Fira Code, monospace';
  ctx.fillStyle   = '#55607a';
  ctx.textAlign   = 'right';

  for (let i = 0; i <= 4; i++) {
    const y = padT + (plotH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    ctx.fillText((maxVal * (1 - i / 4)).toFixed(1), padL - 4, y + 3);
  }

  ctx.textAlign = 'center';
  const step = duration <= 30 ? 5 : 15;
  for (let t = 0; t <= duration; t += step) {
    ctx.fillText(t + 's', padL + (t / duration) * plotW, padT + plotH + 14);
  }
  if (duration % step !== 0) {
    ctx.fillText(duration + 's', padL + plotW, padT + plotH + 14);
  }

  ctx.strokeStyle = '#3a4050';
  ctx.beginPath();
  ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();
}

// ── BLOCK RENDERING ────────────────────────────────────────────────────────────
function renderStack() {
  stackCol.innerHTML = '';
  stackCol.classList.toggle('horiz-mode', !!CONFIG.horizMode);

  if (CONFIG.gridMode) {
    const active = state.blockQueue[0];
    if (!active) return;
    const activeEl = makeGridBlock(
      gridComplement ? KEYS.filter(k => !active.includes(k)) : active,
      true
    );
    activeEl.id = 'active-block';
    stackCol.appendChild(activeEl);
    return;
  }

  for (let i = QUEUE_SIZE - 1; i >= 1; i--) {
    const seq = state.blockQueue[i];
    if (!seq) continue;
    const div = document.createElement('div');
    div.className = 'block preview';
    seq.forEach(sym => {
      const span = document.createElement('span');
      span.className   = KEY_DIR_CLASS[sym];
      span.textContent = sym;
      div.appendChild(span);
    });
    stackCol.appendChild(div);
  }

  const active = state.blockQueue[0];
  if (!active) return;
  const div = document.createElement('div');
  div.className = 'block active';
  div.id = 'active-block';
  active.forEach((sym, idx) => {
    const span = document.createElement('span');
    span.className   = 'key ' + KEY_DIR_CLASS[sym] + (idx < state.inputBuffer.length ? ' hit' : '');
    span.setAttribute('data-key-idx', idx);
    span.textContent = sym;
    div.appendChild(span);
  });
  stackCol.appendChild(div);
}

// ── GAME LOGIC ─────────────────────────────────────────────────────────────────
function fillQueue() {
  while (state.blockQueue.length < QUEUE_SIZE) state.blockQueue.push(randomSequence());
}

function flashActiveBlock(cssClass, callback) {
  const block = document.getElementById('active-block');
  if (!block) { if (callback) callback(); return; }
  block.classList.add(cssClass);
  setTimeout(() => { block.classList.remove(cssClass); if (callback) callback(); }, 100);
}

function handleKeyPress(key) {
  if (state.phase !== 'running' && state.phase !== 'calibrating') return;
  const isCalib = state.phase === 'calibrating';
  const sym = CONFIG.KEY_MAP[key];
  if (!sym) return;

  const active   = state.blockQueue[0];
  if (!active) return;
  const expected = active[state.inputBuffer.length];

  if (sym === expected) {
    if (isCalib) {
      if (calibPhase < 4) calibIntervalKeystrokes++;
      else                calibVerifKeystrokes++;
    }
    state.inputBuffer.push(sym);
    const span = document.querySelector(`#active-block [data-key-idx="${state.inputBuffer.length - 1}"]`);
    if (span) span.classList.add('hit');

    if (state.inputBuffer.length === active.length) {
      state.Sc++;
      state.blockQueue.shift();
      state.inputBuffer = [];
      if (isCalib && calibPendingConfig) {
        const { title, deploy } = calibPendingConfig;
        calibPendingConfig = null;
        showCalibTransition(title, deploy);
      } else {
        fillQueue();
        renderStack();
      }
      updateDashboard();
    }
  } else {
    if (isCalib) {
      if (calibPhase < 4) calibIntervalErrors++;
      else                calibVerifErrors++;
    }
    state.Si++;
    state.inputBuffer = [];
    updateDashboard();
    flashActiveBlock('error', () => renderStack());
  }
}

// ── GRID MODE ──────────────────────────────────────────────────────────────────
let gridPressed = new Set(), gridComplement = false;

function gridEffectiveTarget() {
  const targetSet = new Set(state.blockQueue[0]);
  return gridComplement ? new Set(KEYS.filter(k => !targetSet.has(k))) : targetSet;
}

function onGridKeyDown(key) {
  if (state.phase !== 'running') return;
  if (!state.blockQueue[0]) return;
  if (gridPressed.has(key)) return;

  const effectiveTarget = gridEffectiveTarget();

  if (!effectiveTarget.has(key)) {
    state.Si++;
    gridPressed.clear(); gridComplement = false;
    state.inputBuffer = [];
    updateDashboard();
    flashActiveBlock('error', () => renderStack());
    return;
  }

  gridPressed.add(key);
  renderStack();

  if (gridPressed.size === effectiveTarget.size) {
    state.Sc++;
    state.blockQueue.shift();
    fillQueue();
    gridPressed.clear();
    state.inputBuffer = [];
    updateDashboard();
    renderStack();
  }
}

function makeGridBlock(litKeys, isActive) {
  const litSet = new Set(litKeys);
  const outer = document.createElement('div');
  outer.className = 'grid-block ' + (isActive ? 'active' : 'preview') + (isActive && gridComplement ? ' flipped' : '');
  CONFIG.GRID_ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'grid-row';
    row.forEach(key => {
      const cell = document.createElement('div');
      const isLit     = litSet.has(key);
      const isPressed = isActive && gridPressed.has(key);
      cell.className = 'grid-cell' + (isLit ? ' lit' : '') + (isPressed ? ' pressed' : '');
      if (isActive) cell.textContent = key.toUpperCase();
      rowEl.appendChild(cell);
    });
    outer.appendChild(rowEl);
  });
  return outer;
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────────
function updateDashboard() {
  const elapsed  = startTimestamp ? (performance.now() - startTimestamp) / 1000 : 0;
  const isCalib  = state.phase === 'calibrating';
  timerVal.textContent = state.timerRemaining.toFixed(1);
  timerVal.classList.toggle('urgent', state.timerRemaining <= 10);
  scVal.textContent = state.Sc;
  siVal.textContent = state.Si;
  if (isCalib) {
    const winElapsed = calibIntervalStart ? (performance.now() - calibIntervalStart) / 1000 : 0;
    const kps = winElapsed > 0 ? calibIntervalKeystrokes / winElapsed : 0;
    bpsVal.textContent = kps.toFixed(2) + ' kps';
  } else {
    bpsVal.textContent = calculateBitRate(elapsed).toFixed(3) + ' bps';
  }
  document.getElementById('bps-label').textContent   = isCalib ? 'Current KPS'        : 'Current Bit Rate';
  document.getElementById('chart-label').textContent = isCalib
    ? `KPS History  k=${KEYS ? KEYS.length : '?'}` : 'Bit Rate History';
}

// ── TIMER LOOP ─────────────────────────────────────────────────────────────────
let tickInterval = null, chartInterval = null, startTimestamp = null;

function startTick(duration, onEnd) {
  startTimestamp = performance.now();

  tickInterval = setInterval(() => {
    const elapsed = (performance.now() - startTimestamp) / 1000;
    state.timerRemaining = Math.max(duration - elapsed, 0);
    updateDashboard();
    if (state.timerRemaining <= 0) onEnd();
  }, 50);

  chartInterval = setInterval(() => {
    if (state.phase !== 'running' && state.phase !== 'calibrating') return;
    const elapsed = (performance.now() - startTimestamp) / 1000;
    let value;
    if (state.phase === 'calibrating') {
      const winElapsed = calibIntervalStart ? (performance.now() - calibIntervalStart) / 1000 : 0.001;
      value = calibIntervalKeystrokes / Math.max(winElapsed, 0.001); // KPS for current window
    } else {
      value = calculateBitRate(elapsed);
    }
    state.bitRateHistory.push({ t: elapsed, bps: value });
    drawChart();
  }, 1000);
}

// ── GAME LIFECYCLE ─────────────────────────────────────────────────────────────
function runCountdown(callback) {
  const overlay = document.getElementById('countdown-screen');
  const label   = document.getElementById('countdown-label');
  let count = 3;
  overlay.classList.remove('hidden');
  label.textContent = count;
  const id = setInterval(() => {
    count--;
    if (count > 0) {
      label.textContent = count;
    } else {
      clearInterval(id);
      overlay.classList.add('hidden');
      callback();
    }
  }, 1000);
}

function startGame() {
  state = {
    phase: 'countdown', timerRemaining: DURATION,
    Sc: 0, Si: 0, inputBuffer: [], blockQueue: [], bitRateHistory: [],
  };

  gridPressed.clear(); gridComplement = false;
  stackCol.innerHTML = '';
  updateDashboard(); resizeCanvas();
  [startScreen, scoreScreen, intertrialScreen, testCompleteScreen, calibResultScreen].forEach(s => s.classList.add('hidden'));
  document.getElementById('game-title').textContent = 'ComboStack · 60s BCI Benchmark';
  runCountdown(() => {
    fillQueue(); renderStack();
    state.phase = 'running';
    startTick(DURATION, endGame);
  });
}

// ── CALIBRATION ────────────────────────────────────────────────────────────────
function startCalibration() {
  calibPhase = 0; calibIntervalData = [];
  calibIntervalKeystrokes = 0; calibIntervalErrors = 0;
  calibIntervalStart = null;
  calibPhaseTimers.forEach(clearTimeout); calibPhaseTimers = [];
  calibOptK = null; calibOptL = null;
  calibParamA = null; calibParamB = null; calibParamC = null;
  calibVerifKeystrokes = 0; calibVerifErrors = 0;
  calibPendingConfig   = null;
  calibPhaseMarkers    = [];

  activateConfig(buildKeysetConfig(HARVEST_INTERVALS[0].k, 2));

  state = {
    phase: 'countdown', timerRemaining: CALIB_DURATION,
    Sc: 0, Si: 0, inputBuffer: [], blockQueue: [], bitRateHistory: [],
  };

  gridPressed.clear(); gridComplement = false;
  stackCol.innerHTML = '';
  updateDashboard(); resizeCanvas();
  [startScreen, scoreScreen, intertrialScreen, testCompleteScreen, calibResultScreen].forEach(s => s.classList.add('hidden'));
  document.getElementById('game-title').textContent = `CALIBRATION 30s · Harvesting k=${HARVEST_INTERVALS[0].k}`;

  runCountdown(() => {
    fillQueue(); renderStack();
    state.phase        = 'calibrating';
    calibIntervalStart = performance.now();
    startTick(CALIB_DURATION, endCalibration);

    // Spaced to give exactly 15s of typing per window after each 1s transition pause:
    // k=9: 0–15s | pause | k=26: 16–31s | pause | k=52: 32–47s | pause | k=62: 48–63s | pause | verif: 64–69s
    [15000, 31000, 47000, 63000].forEach(delay => {
      calibPhaseTimers.push(setTimeout(() => {
        if (state.phase !== 'calibrating') return;
        advanceCalibPhase();
      }, delay));
    });
  });
}

function downloadCalibCSV(finalK, finalL, damped, verifTotal) {
  const rows = [
    'Harvest Windows',
    'window,k,keystrokes,errors,duration_s,kps,error_pct',
    ...calibIntervalData.map((d, i) => {
      const kps    = (d.keystrokes / Math.max(d.duration, 0.001)).toFixed(2);
      const total  = d.keystrokes + d.errors;
      const errPct = total > 0 ? ((d.errors / total) * 100).toFixed(1) : '0.0';
      return `${i + 1},${d.k},${d.keystrokes},${d.errors},${d.duration.toFixed(2)},${kps},${errPct}`;
    }),
    '',
    'Model Parameters',
    'a,b,c',
    [calibParamA, calibParamB, calibParamC].map(v => v !== null ? v.toFixed(6) : '').join(','),
    '',
    'Result',
    'k_star,L_star,final_k,final_L,N,bits_per_sel,safety_damped,verif_error_pct',
    [
      calibOptK, calibOptL, finalK, finalL,
      Math.pow(finalK, finalL),
      Math.log2(Math.pow(finalK, finalL) - 1).toFixed(2),
      damped ? 'Yes' : 'No',
      verifTotal > 0 ? ((calibVerifErrors / verifTotal) * 100).toFixed(1) : '0.0',
    ].join(','),
  ];
  const a  = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
  a.download = `prso_calib_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
  a.click();
}

function endCalibration() {
  clearInterval(tickInterval); clearInterval(chartInterval);
  tickInterval = chartInterval = null;
  calibPhaseTimers.forEach(clearTimeout); calibPhaseTimers = [];
  state.phase = 'calib-result';

  if (calibOptK === null) { calibOptK = 9; calibOptL = 2; } // fallback if opt never ran

// Safety damping: if verification error rate collapses (>10%), 
  // roll back directly to the highest calibration tier where they proved stability.
  let finalK = calibOptK;
  let finalL = calibOptL;
  let damped = false;

  const verifTotal = calibVerifKeystrokes + calibVerifErrors;
  if (verifTotal > 0) {
    const verifErrorRate = calibVerifErrors / verifTotal;
    
    // Panic Trigger: User is choking during live verification
    if (verifErrorRate > 0.10) {
      damped = true;
      finalL = 2; // Force safe pair rhythm to eliminate sequence length strain
      
      // Filter calibration history to find intervals where accuracy was actually safe (<= 10% errors)
      const safeIntervals = calibIntervalData
        .filter(d => d.keystrokes > 0)
        .map(d => ({
          k: d.k,
          eRate: d.errors / (d.keystrokes + d.errors)
        }))
        .filter(d => d.eRate <= 0.10) // Must have been a clean run
        .sort((x, y) => y.k - x.k);    // Sort descending to find the highest viable alphabet
      
      if (safeIntervals.length > 0) {
        // Snap directly to the largest keyset they successfully managed
        finalK = safeIntervals[0].k;
      } else {
        // Extreme fallback: If they struggled on every single calibration tier,
        // force them to Tier 1 Home Row (k=9) as a total damage-control shield.
        finalK = 9; 
      }
    }
  }
  
  // Final bounds sanity safeguard
  finalK = Math.max(2, Math.min(finalK, KEYSET_POOL.length));
  activateConfig(buildKeysetConfig(finalK, finalL));

  const finalN = Math.pow(finalK, finalL);
  document.getElementById('calib-param-a').textContent    = calibParamA !== null ? calibParamA.toFixed(4) : '—';
  document.getElementById('calib-param-b').textContent    = calibParamB !== null ? calibParamB.toFixed(4) : '—';
  document.getElementById('calib-param-c').textContent    = calibParamC !== null ? calibParamC.toFixed(6) : '—';
  document.getElementById('calib-verif-err').textContent  = verifTotal > 0
    ? ((calibVerifErrors / verifTotal) * 100).toFixed(1) + '%' : '—';
  document.getElementById('calib-opt-k').textContent      = calibOptK;
  document.getElementById('calib-opt-L').textContent      = calibOptL;
  document.getElementById('calib-final-k').textContent    = finalK;
  document.getElementById('calib-final-L').textContent    = finalL;
  document.getElementById('calib-final-N').textContent    = finalN.toLocaleString();
  document.getElementById('calib-final-bits').textContent = Math.log2(finalN - 1).toFixed(2);
  document.getElementById('calib-damped').textContent     = damped ? 'YES — verif error > 10%' : 'No';
  calibResultScreen.classList.remove('hidden');
  downloadCalibCSV(finalK, finalL, damped, verifTotal);
}

function endGame() {
  state.phase = 'done';
  clearInterval(tickInterval); clearInterval(chartInterval);
  tickInterval = chartInterval = null;

  const elapsed   = (performance.now() - startTimestamp) / 1000;
  const finalRate = calculateBitRate(elapsed);
  const net       = Math.max(state.Sc - state.Si, 0);
  const total     = state.Sc + state.Si;
  const acc       = total > 0 ? ((state.Sc / total) * 100).toFixed(1) + '%' : '—';

  state.bitRateHistory.push({ t: DURATION, bps: finalRate });
  drawChart();

  if (testMode) {
    testScores.push({ cfg: testOrder[testCfgIdx], bps: finalRate, Sc: state.Sc, Si: state.Si, acc });
    testCfgIdx++;
    if (testCfgIdx < testOrder.length) {
      showIntertrial();
    } else {
      testMode = false;
      showTestComplete();
      downloadCSV();
    }
  } else {
    finalBps.textContent  = finalRate.toFixed(4);
    finalN.textContent    = N;
    finalBits.textContent = INFO_DENSITY.toFixed(2);
    finalSc.textContent   = state.Sc;
    finalSi.textContent   = state.Si;
    finalNet.textContent  = net;
    finalAcc.textContent  = acc;
    scoreScreen.classList.remove('hidden');
  }
}

// ── TEST MODE ──────────────────────────────────────────────────────────────────
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startTestMode() {
  testMode = true; testCfgIdx = 0; testScores = [];
  testOrder = shuffled(TEST_CONFIGS);
  activateConfig(testOrder[0]);
  startGame();
}

function showIntertrial() {
  const prev  = testScores[testScores.length - 1];
  const next  = testOrder[testCfgIdx];
  const nextN = configN(next);

  document.getElementById('intertrial-progress').textContent =
    `Round ${testCfgIdx} / ${testOrder.length} complete`;
  document.getElementById('intertrial-done').textContent =
    `${prev.cfg.label}: ${prev.bps.toFixed(3)} bps  (Sc=${prev.Sc} Si=${prev.Si} acc=${prev.acc})`;
  document.getElementById('intertrial-next').textContent =
    `Next → ${next.label}  |  N=${nextN}  |  ~${Math.log2(nextN - 1).toFixed(2)} bits/sel`;

  activateConfig(next);
  intertrialScreen.classList.remove('hidden');
}

function showTestComplete() {
  const tbody = document.getElementById('test-results-body');
  tbody.innerHTML = '';
  testScores.forEach(s => {
    const n  = configN(s.cfg);
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td>${s.cfg.label}</td><td>${n}</td><td>${Math.log2(n - 1).toFixed(2)}</td>` +
      `<td>${s.Sc}</td><td>${s.Si}</td><td>${s.acc}</td>` +
      `<td class="bps-cell">${s.bps.toFixed(3)}</td>`;
    tbody.appendChild(tr);
  });
  testCompleteScreen.classList.remove('hidden');
}

function downloadCSV() {
  const rows = ['config,N,bits_per_sel,Sc,Si,accuracy,bps'];
  testScores.forEach(s => {
    const n = configN(s.cfg);
    rows.push(`"${s.cfg.label}",${n},${Math.log2(n - 1).toFixed(4)},${s.Sc},${s.Si},"${s.acc}",${s.bps.toFixed(4)}`);
  });
  const a = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
  a.download = `combostack_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
  a.click();
}

// ── INPUT HANDLING ─────────────────────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
  if ((e.key === 't' || e.key === 'T') && (state.phase === 'idle' || state.phase === 'done')) {
    startTestMode();
    return;
  }

  if (CONFIG && CONFIG.gridMode) {
    if (e.key === 'Shift' && state.phase === 'running') {
      gridComplement = !gridComplement;
      renderStack();
      return;
    }
    const gridKey = e.key.toLowerCase();
    if (!e.repeat && CONFIG.KEY_MAP[gridKey] !== undefined) {
      e.preventDefault();
      if (state.phase === 'running') onGridKeyDown(gridKey);
      return;
    }
  } else if (CONFIG && !CONFIG.gridMode) {
    if (CONFIG.KEY_MAP[e.key] !== undefined) {
      e.preventDefault();
      if (state.phase === 'running' || state.phase === 'calibrating') handleKeyPress(e.key);
      return;
    }
    // Printable key not in the current keyset → wrong-key flash
    if ((state.phase === 'running' || state.phase === 'calibrating')
        && e.key.length === 1 && e.key !== ' ' && state.blockQueue[0]) {
      e.preventDefault();
      if (state.phase === 'calibrating') {
        if (calibPhase < 4) calibIntervalErrors++;
        else                calibVerifErrors++;
      }
      state.Si++;
      state.inputBuffer = [];
      updateDashboard();
      flashActiveBlock('error', () => renderStack());
      return;
    }
  }

  if (e.code === 'Space') {
    e.preventDefault();
    if (state.phase === 'idle' || state.phase === 'done') startCalibration();
    else if (state.phase === 'calib-result') startGame();
    return;
  }
});


// ── RESIZE ─────────────────────────────────────────────────────────────────────
window.addEventListener('resize', resizeCanvas);

// ── BOOT ───────────────────────────────────────────────────────────────────────
activateConfig(TEST_CONFIGS[0]);
resizeCanvas();
