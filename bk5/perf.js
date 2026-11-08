/* CRISIS — performance: one game, three ways to run it.
   full     : everything, as smooth as the phone allows
   balanced : the same picture, the hideout and the run drawn at 30 frames a second
   light    : 24 frames, no drifting embers/dust/smoke, no depth blur on people at the back
   The paper grain stays in every mode — it is baked into one small picture once, so it costs nothing.
   'auto' (the default) watches how long frames take for the first minutes and steps down if the phone struggles.
   It remembers what it settled on for next time. It never steps back up on its own. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const KEY = 'crisis_perf_auto';
const ORDER = ['full', 'balanced', 'light'];
const FPS = { full: 60, balanced: 30, light: 24 };
const P = { mode: 'full', chosen: 'auto', samples: [], lastTs: 0, settled: false };

function setting() { try { return (C.Settings && C.Settings.v.perf) || 'auto'; } catch (e) { return 'auto'; } }
function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
function store(m) { try { localStorage.setItem(KEY, m); } catch (e) {} }
/* a first guess before any frame is measured: phones that say they are small start one step down */
function guess() {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const mem = nav.deviceMemory || 4, cores = nav.hardwareConcurrency || 4;
  if (mem <= 1 || cores <= 2) return 'light';
  if (mem <= 2 || cores <= 4) return 'balanced';
  return 'full';
}
function applyClass() {
  if (typeof document === 'undefined' || !document.documentElement) return;
  const h = document.documentElement.classList; ORDER.forEach((m) => h.remove('pf-' + m)); h.add('pf-' + P.mode);
}
P.apply = function () {
  P.chosen = setting();
  P.mode = P.chosen === 'auto' ? (stored() || guess()) : P.chosen;
  if (!ORDER.includes(P.mode)) P.mode = 'balanced';
  P.samples = []; P.settled = P.chosen !== 'auto' || P.mode === 'light';
  applyClass();
};
P.fps = () => FPS[P.mode] || 60;
P.lite = () => P.mode === 'light';
P.bitmap = () => true;   // the hideout is always one picture: it looks the same and is far cheaper
/* a frame gate: true when this frame should be drawn */
P.gate = function (state, ts) {
  const fps = P.fps(); if (fps >= 60) return true;
  const min = 1000 / fps - 3; if (ts - (state.pfLast || 0) < min) return false; state.pfLast = ts; return true;
};
/* auto: every drawn frame reports its spacing; after enough of them, decide */
P.frame = function (ts) {
  if (P.settled || document.hidden) { P.lastTs = ts; return; }
  if (P.lastTs && ts - P.lastTs < 400) P.samples.push(ts - P.lastTs); P.lastTs = ts;
  if (P.samples.length < 150) return;
  const s = P.samples.slice().sort((a, b) => a - b); const med = s[Math.floor(s.length * 0.5)], p90 = s[Math.floor(s.length * 0.9)]; P.samples = [];
  const want = 1000 / P.fps();
  /* missing the target by a lot, or stuttering often: step down one */
  if (med > want * 1.45 || p90 > want * 2.6) {
    const i = ORDER.indexOf(P.mode); if (i < ORDER.length - 1) { P.mode = ORDER[i + 1]; store(P.mode); applyClass(); if (P.onChange) P.onChange(P.mode); if (P.mode === 'light') P.settled = true; }
  } else if (++P.good >= 3) { P.settled = true; store(P.mode); }
};
P.good = 0;
P.label = () => ({ full: 'Full', balanced: 'Balanced', light: 'Light' })[P.mode];

/* the paper grain, made once into a plain picture so the browser does not blend a noise filter over every frame */
function bakeGrain() {
  if (typeof document === 'undefined' || !document.createElement) return;
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0'/></filter><rect width='180' height='180' filter='url(#n)'/></svg>";
  const img = new Image();
  img.onload = () => {
    try {
      const cv = document.createElement('canvas'); cv.width = 180; cv.height = 180; const x = cv.getContext('2d'); x.drawImage(img, 0, 0);
      /* multiply at .28 over the page is the same as black at (alpha * .28): no blending needed */
      const d = x.getImageData(0, 0, 180, 180); for (let i = 3; i < d.data.length; i += 4) d.data[i] = Math.round(d.data[i] * 0.28);
      x.putImageData(d, 0, 0);
      const url = cv.toDataURL('image/png');
      const st = document.createElement('style'); st.textContent = `body::after{background-image:url(${url})!important;mix-blend-mode:normal!important;opacity:1!important}`;
      document.head.appendChild(st); P.grainBaked = true;
    } catch (e) {}
  };
  img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
}
P.apply();
if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bakeGrain); else bakeGrain(); }
C.Perf = P;
if (typeof module !== 'undefined') module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);
