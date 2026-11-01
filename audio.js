/* CRISIS — sound, generated in the browser (no audio files).
   An ambient bed (wind, a low drone) that darkens at night and on expeditions, distant gunfire and thunder now and then,
   and soft interface sounds. Starts on the first tap (browsers require that). Everything is wrapped so sound can never break the game. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const A = { ctx: null, started: false, mode: 'title', nodes: {}, timer: null };
const V = () => (C.Settings && C.Settings.v) || { sound: true, master: 0.8, music: 0.55, sfx: 0.8, haptics: true };
const safe = (fn) => (...a) => { try { return fn(...a); } catch (e) { /* sound must never break the game */ } };

function noiseBuffer(ctx, secs) { const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } return b; }

A.start = safe(function () {
  if (A.started || typeof window === 'undefined') return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const ctx = A.ctx = new AC(); const n = A.nodes;
  n.master = ctx.createGain(); n.master.connect(ctx.destination);
  n.music = ctx.createGain(); n.music.connect(n.master); n.sfx = ctx.createGain(); n.sfx.connect(n.master);
  /* echo for distant sounds */
  n.echoIn = ctx.createGain(); const dl = ctx.createDelay(1); dl.delayTime.value = 0.22; const fb = ctx.createGain(); fb.gain.value = 0.38; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
  n.echoIn.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(n.music);
  /* wind */
  const wind = ctx.createBufferSource(); wind.buffer = noiseBuffer(ctx, 4); wind.loop = true; const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 380; wf.Q.value = 0.6; n.windGain = ctx.createGain(); n.windGain.gain.value = 0.05;
  wind.connect(wf); wf.connect(n.windGain); n.windGain.connect(n.music); wind.start(); n.windFilter = wf;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 0.03; lfo.connect(lg); lg.connect(n.windGain.gain); lfo.start();
  /* drone */
  n.droneGain = ctx.createGain(); n.droneGain.gain.value = 0.05; const df = ctx.createBiquadFilter(); df.type = 'lowpass'; df.frequency.value = 210; n.droneFilter = df;
  [[55, 'sine', 0], [82.4, 'triangle', 6], [110.5, 'sine', -5]].forEach(([f, t, det]) => { const o = ctx.createOscillator(); o.type = t; o.frequency.value = f; o.detune.value = det; o.connect(df); o.start(); });
  df.connect(n.droneGain); n.droneGain.connect(n.music);
  const dl2 = ctx.createOscillator(); dl2.frequency.value = 0.05; const dg2 = ctx.createGain(); dg2.gain.value = 70; dl2.connect(dg2); dg2.connect(df.frequency); dl2.start();
  A.started = true; A.apply(); A.mood(A.mode);
  A.timer = setInterval(A.events, 9000);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', safe(() => { if (!A.ctx) return; if (document.hidden) A.ctx.suspend(); else A.ctx.resume(); }));
});
A.apply = safe(function () {
  if (!A.started) return; const v = V(), t = A.ctx.currentTime;
  A.nodes.master.gain.setTargetAtTime(v.sound ? v.master : 0, t, 0.05); A.nodes.music.gain.setTargetAtTime(v.music, t, 0.1); A.nodes.sfx.gain.setTargetAtTime(v.sfx, t, 0.05);
});
/* the bed darkens with the situation */
A.mood = safe(function (m) {
  A.mode = m || A.mode; if (!A.started) return; const t = A.ctx.currentTime, n = A.nodes;
  const p = { title: [0.04, 0.035, 180], day: [0.05, 0.05, 210], night: [0.085, 0.085, 150], exp: [0.07, 0.12, 125], end: [0.03, 0.05, 260], over: [0.03, 0.08, 100] }[A.mode] || [0.05, 0.05, 200];
  n.windGain.gain.setTargetAtTime(p[0], t, 1.5); n.droneGain.gain.setTargetAtTime(p[1], t, 1.5); n.droneFilter.frequency.setTargetAtTime(p[2], t, 1.5);
});
/* now and then, something far away */
A.events = safe(function () {
  if (!A.started || !V().sound || (typeof document !== 'undefined' && document.hidden) || (C.paused)) return;
  const dark = A.mode === 'night' || A.mode === 'exp'; const r = Math.random();
  if (r < (dark ? 0.35 : 0.14)) A.gunshot(); else if (r < (dark ? 0.45 : 0.2)) A.thunder();
});
A.gunshot = safe(function () {
  const ctx = A.ctx, n = A.nodes, t = ctx.currentTime + 0.02, bursts = Math.random() < 0.4 ? 1 + Math.floor(Math.random() * 4) : 1;
  for (let i = 0; i < bursts; i++) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 0.5); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900; const g = ctx.createGain(); const st = t + i * (0.09 + Math.random() * 0.08);
    g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.28, st + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, st + 0.3); src.connect(hp); hp.connect(g); g.connect(n.echoIn); g.connect(n.music); src.start(st, Math.random() * 0.2); src.stop(st + 0.5);
  }
});
A.thunder = safe(function () {
  const ctx = A.ctx, n = A.nodes, t = ctx.currentTime + 0.05; const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 3); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8); src.connect(lp); lp.connect(g); g.connect(n.music); src.start(t); src.stop(t + 3);
});
function tone(f, dur, type, vol, slide, delay) {
  const ctx = A.ctx, t = ctx.currentTime + (delay || 0); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(A.nodes.sfx); o.start(t); o.stop(t + dur + 0.05);
}
A.sfx = safe(function (name) {
  if (!A.started || !V().sound) return;
  switch (name) {
    case 'tap': tone(760, 0.07, 'sine', 0.12, 560); break;
    case 'choose': tone(520, 0.1, 'triangle', 0.14, 600); break;
    case 'open': tone(300, 0.14, 'sine', 0.09, 420); break;
    case 'back': tone(420, 0.09, 'sine', 0.09, 300); break;
    case 'death': tone(110, 1.4, 'sawtooth', 0.12, 45); tone(82, 1.6, 'sine', 0.14, 40, 0.05); break;
    case 'hit': { const ctx = A.ctx, t = ctx.currentTime; const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 0.3); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; const g = ctx.createGain(); g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); src.connect(lp); lp.connect(g); g.connect(A.nodes.sfx); src.start(t); src.stop(t + 0.3); break; }
    case 'bell': tone(988, 1.1, 'sine', 0.09, 0); tone(1318, 1.3, 'sine', 0.06, 0, 0.12); break;
    case 'radio': { const ctx = A.ctx, t = ctx.currentTime; const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 0.6); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 1.2; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.18, t + 0.05); g.gain.linearRampToValueAtTime(0.0001, t + 0.5); src.connect(bp); bp.connect(g); g.connect(A.nodes.sfx); src.start(t); src.stop(t + 0.6); break; }
    case 'alarm': tone(660, 0.18, 'square', 0.07, 520); tone(520, 0.22, 'square', 0.07, 380, 0.2); break;
  }
});
A.buzz = function (pattern) { try { if (V().haptics && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern); } catch (e) {} };
C.Audio = A;
if (typeof module !== 'undefined') module.exports = A;
})(typeof window !== 'undefined' ? window : globalThis);
