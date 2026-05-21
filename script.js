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

const DURATION   = 60;
const QUEUE_SIZE = 4;

// Active config — set by activateConfig()
let CONFIG, KEYS, KEY_DIR_CLASS, N, INFO_DENSITY;

// ── TEST MODE STATE ────────────────────────────────────────────────────────────
let testMode   = false;
let testCfgIdx = 0;
let testScores = [];
let testOrder  = [];

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

const finalBps = document.getElementById('final-bps-value');
const finalSc  = document.getElementById('final-sc');
const finalSi  = document.getElementById('final-si');
const finalNet = document.getElementById('final-net');
const finalAcc = document.getElementById('final-acc');

// ── CONFIG ACTIVATION ──────────────────────────────────────────────────────────
function configN(cfg) {
  return Math.pow(Object.keys(cfg.KEY_MAP).length, cfg.SEQ_LENGTH);
}

function activateConfig(cfg) {
  KEYS          = Object.keys(cfg.KEY_MAP);
  KEY_DIR_CLASS = cfg.DIR_CLASS;
  N             = configN(cfg);
  INFO_DENSITY  = Math.log2(N - 1);
  CONFIG        = { DURATION, SEQ_LENGTH: cfg.SEQ_LENGTH, QUEUE_SIZE, KEY_MAP: cfg.KEY_MAP, horizMode: cfg.horizMode };

  stackCol.classList.toggle('horiz-mode', !!cfg.horizMode);

  document.getElementById('mode-info').textContent =
    `${cfg.label}  |  N=${N}  |  ~${INFO_DENSITY.toFixed(2)} bits/sel  |  60 s`;
}

// ── UTILITY ────────────────────────────────────────────────────────────────────
function randomSequence() {
  const seq = [];
  for (let i = 0; i < CONFIG.SEQ_LENGTH; i++) {
    seq.push(CONFIG.KEY_MAP[KEYS[Math.floor(Math.random() * KEYS.length)]]);
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

  const history = state.bitRateHistory;
  if (history.length < 1) { drawGrid(w, h); return; }

  const maxBps = Math.max(...history.map(d => d.bps), 1) * 1.15;
  const padL = 38, padR = 8, padT = 8, padB = 22;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  drawGrid(w, h, padL, padR, padT, padB, maxBps);

  ctx.beginPath();
  ctx.strokeStyle = '#ffd600';
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  history.forEach((d, i) => {
    const x = padL + (d.t / DURATION) * plotW;
    const y = padT + plotH - (d.bps / maxBps) * plotH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const last = history[history.length - 1];
  ctx.lineTo(padL + (last.t / DURATION) * plotW, padT + plotH);
  ctx.lineTo(padL, padT + plotH);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
  grad.addColorStop(0, 'rgba(255,214,0,0.25)');
  grad.addColorStop(1, 'rgba(255,214,0,0.02)');
  ctx.fillStyle = grad;
  ctx.fill();

  const cx = padL + (last.t / DURATION) * plotW;
  const cy = padT + plotH - (last.bps / maxBps) * plotH;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle   = '#ffd600';
  ctx.shadowBlur  = 8;
  ctx.shadowColor = '#ffd600';
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawGrid(w, h, padL=38, padR=8, padT=8, padB=22, maxBps=1) {
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
    ctx.fillText((maxBps * (1 - i / 4)).toFixed(1), padL - 4, y + 3);
  }

  ctx.textAlign = 'center';
  [0, 15, 30, 45, 60].forEach(t => {
    ctx.fillText(t + 's', padL + (t / DURATION) * plotW, padT + plotH + 14);
  });

  ctx.strokeStyle = '#3a4050';
  ctx.beginPath();
  ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();
}

// ── BLOCK RENDERING ────────────────────────────────────────────────────────────
function renderStack() {
  stackCol.innerHTML = '';
  stackCol.classList.toggle('horiz-mode', !!CONFIG.horizMode);

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
  if (state.phase !== 'running') return;
  const sym = CONFIG.KEY_MAP[key];
  if (!sym) return;

  const active   = state.blockQueue[0];
  if (!active) return;
  const expected = active[state.inputBuffer.length];

  if (sym === expected) {
    state.inputBuffer.push(sym);
    const span = document.querySelector(`#active-block [data-key-idx="${state.inputBuffer.length - 1}"]`);
    if (span) span.classList.add('hit');

    if (state.inputBuffer.length === active.length) {
      state.Sc++;
      state.blockQueue.shift();
      fillQueue();
      state.inputBuffer = [];
      updateDashboard();
      renderStack();
    }
  } else {
    state.Si++;
    state.inputBuffer = [];
    updateDashboard();
    flashActiveBlock('error', () => renderStack());
  }
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────────
function updateDashboard() {
  const elapsed = DURATION - state.timerRemaining;
  timerVal.textContent = state.timerRemaining.toFixed(1);
  timerVal.classList.toggle('urgent', state.timerRemaining <= 10);
  scVal.textContent  = state.Sc;
  siVal.textContent  = state.Si;
  bpsVal.textContent = calculateBitRate(elapsed).toFixed(3) + ' bps';
}

// ── TIMER LOOP ─────────────────────────────────────────────────────────────────
let tickInterval = null, chartInterval = null, startTimestamp = null;

function startTick() {
  startTimestamp = performance.now();

  tickInterval = setInterval(() => {
    const elapsed = (performance.now() - startTimestamp) / 1000;
    state.timerRemaining = Math.max(DURATION - elapsed, 0);
    updateDashboard();
    if (state.timerRemaining <= 0) endGame();
  }, 50);

  chartInterval = setInterval(() => {
    if (state.phase !== 'running') return;
    const elapsed = (performance.now() - startTimestamp) / 1000;
    state.bitRateHistory.push({ t: elapsed, bps: calculateBitRate(elapsed) });
    drawChart();
  }, 1000);
}

// ── GAME LIFECYCLE ─────────────────────────────────────────────────────────────
function startGame() {
  state = {
    phase: 'running', timerRemaining: DURATION,
    Sc: 0, Si: 0, inputBuffer: [], blockQueue: [], bitRateHistory: [],
  };

  fillQueue(); renderStack(); updateDashboard(); resizeCanvas();
  [startScreen, scoreScreen, intertrialScreen, testCompleteScreen].forEach(s => s.classList.add('hidden'));
  startTick();
}

function endGame() {
  state.phase = 'done';
  clearInterval(tickInterval); clearInterval(chartInterval);
  tickInterval = chartInterval = null;

  const finalRate = calculateBitRate(DURATION);
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
    finalBps.textContent = finalRate.toFixed(4);
    finalSc.textContent  = state.Sc;
    finalSi.textContent  = state.Si;
    finalNet.textContent = net;
    finalAcc.textContent = acc;
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

  if (CONFIG && CONFIG.KEY_MAP[e.key] !== undefined) {
    e.preventDefault();
    if (state.phase === 'running') handleKeyPress(e.key);
    return;
  }

  if (e.code === 'Space') {
    e.preventDefault();
    if (state.phase === 'idle' || state.phase === 'done') startGame();
    return;
  }
});

// ── RESIZE ─────────────────────────────────────────────────────────────────────
window.addEventListener('resize', resizeCanvas);

// ── BOOT ───────────────────────────────────────────────────────────────────────
activateConfig(TEST_CONFIGS[0]);
resizeCanvas();
