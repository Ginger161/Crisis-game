/* CRISIS — sound.
   A small mixing desk that follows the story:
     space    the house is a small room, a run is an empty hall (reverb), sounds sit left or right of where they happen,
              and the floor above or below is heard through the ceiling (muffled, quieter)
     body     hurt muffles the world and brings the heartbeat up; a shot, a blow or a death leaves the ears ringing;
              fever makes the music warble; despair makes it sag and drift away
     tension  a patrol closing in, noise, a raid on its way: a low dread rises and the room goes quiet around it;
              before a knock everything holds its breath
     music    only for moments (title, raid, encounter, grief, ending). By day, at night and on a run it comes and goes,
              with long silences in between, so that when it plays it means something
   Recorded beds (Epidemic Sound) are streamed from <audio> elements, never decoded whole. Short sounds are decoded once.
   Anything without a recording falls back to a generated sound. Nothing here can break the game. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const A = { ctx: null, started: false, mode: 'title', nodes: {}, timer: null, beds: {}, loops: {}, f: { muffle: 0, drive: 0, tension: 0, wobble: 0, sag: 0, space: 'house' } };
const V = () => (C.Settings && C.Settings.v) || { sound: true, master: 0.8, music: 0.55, sfx: 0.8, haptics: true };
const safe = (fn) => (...a) => { try { return fn(...a); } catch (e) { /* sound must never break the game */ } };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function noiseBuffer(ctx, secs) { const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } return b; }
/* a room, made of decaying noise: short and close for the house, long and hollow for an empty hostel */
function roomIR(ctx, secs, decay, dark) {
  const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let lp = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; lp += (w - lp) * (dark ? 0.25 : 0.6); d[i] = lp * Math.pow(1 - i / n, decay); } }
  return b;
}
function driveCurve(k) { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); } return c; }

A.start = safe(function () {
  if (A.started || typeof window === 'undefined') return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  /* phones: bigger audio buffers and a lighter chain. With the default small buffers, Android drops samples whenever the page is busy, and it crackles */
  const phone = A.phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  let ctx; try { ctx = new AC(phone ? { latencyHint: 'playback' } : undefined); } catch (e) { ctx = new AC(); } A.ctx = ctx; const n = A.nodes;
  /* the desk: buses -> muffle -> drive -> limiter -> master. The interface bus skips the body effects so buttons stay clear */
  n.master = ctx.createGain(); n.master.connect(ctx.destination);
  n.limit = ctx.createDynamicsCompressor(); n.limit.threshold.value = -10; n.limit.ratio.value = 6; n.limit.attack.value = 0.005; n.limit.release.value = 0.25; n.limit.connect(n.master);
  n.dry = ctx.createGain(); n.dry.connect(n.limit);
  n.shaper = ctx.createWaveShaper(); n.shaper.curve = driveCurve(6); n.shaper.oversample = phone ? 'none' : '2x'; n.wet = ctx.createGain(); n.wet.gain.value = 0; n.shaper.connect(n.wet); n.wet.connect(n.limit);
  n.muffle = ctx.createBiquadFilter(); n.muffle.type = 'lowpass'; n.muffle.frequency.value = 18000; n.muffle.Q.value = 0.5; n.muffle.connect(n.dry); n.muffle.connect(n.shaper);
  n.mix = ctx.createGain(); n.mix.connect(n.muffle);
  n.music = ctx.createGain(); n.music.connect(n.mix);   /* music */
  n.amb = ctx.createGain(); n.amb.connect(n.mix);       /* the room and the weather */
  n.sfx = ctx.createGain(); n.sfx.connect(n.mix);       /* things that happen */
  n.ui = ctx.createGain(); n.ui.connect(n.master);      /* buttons */
  n.duck = ctx.createGain(); n.duck.connect(n.amb);     /* beds go through here so tension and knocks can hush them */
  n.mduck = ctx.createGain(); n.mduck.connect(n.music);
  /* reverb: a send from the room and the things in it */
  n.verb = ctx.createConvolver(); n.verbOut = ctx.createGain(); n.verbOut.gain.value = 0.5; n.verb.connect(n.verbOut); n.verbOut.connect(n.mix);
  n.send = ctx.createGain(); n.send.gain.value = 0.18; n.send.connect(n.verb);
  A.irHouse = roomIR(ctx, phone ? 0.6 : 0.9, 3.2, false); A.irHall = roomIR(ctx, phone ? 1.6 : 3.2, 2.2, true); n.verb.buffer = A.irHouse;
  /* echo for gunfire across the campus */
  n.echoIn = ctx.createGain(); const dl = ctx.createDelay(1); dl.delayTime.value = 0.22; const fb = ctx.createGain(); fb.gain.value = 0.38; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
  n.echoIn.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(n.amb);
  /* generated wind and drone: only when there is no recorded room (title screen, ending) */
  const wind = ctx.createBufferSource(); wind.buffer = noiseBuffer(ctx, 4); wind.loop = true; const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 380; wf.Q.value = 0.6; n.windGain = ctx.createGain(); n.windGain.gain.value = 0;
  wind.connect(wf); wf.connect(n.windGain); n.windGain.connect(n.amb); wind.start();
  n.droneGain = ctx.createGain(); n.droneGain.gain.value = 0; const df = ctx.createBiquadFilter(); df.type = 'lowpass'; df.frequency.value = 210; n.droneFilter = df;
  [[55, 'sine', 0], [82.4, 'triangle', 6], [110.5, 'sine', -5]].forEach(([f, t, det]) => { const o = ctx.createOscillator(); o.type = t; o.frequency.value = f; o.detune.value = det; o.connect(df); o.start(); });
  df.connect(n.droneGain); n.droneGain.connect(n.amb);
  /* dread: low tones beating against each other. It is tension made audible, so it is silent until tension rises */
  n.dreadGain = ctx.createGain(); n.dreadGain.gain.value = 0; const lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 170; [41.2, 43.6, 61.7].forEach((f) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp2); o.start(); }); lp2.connect(n.dreadGain); n.dreadGain.connect(n.mix);
  /* ringing ears after a shot, a blow, a death */
  const ring = ctx.createOscillator(); ring.type = 'sine'; ring.frequency.value = 3950; n.ringGain = ctx.createGain(); n.ringGain.gain.value = 0; ring.connect(n.ringGain); n.ringGain.connect(n.master); ring.start();
  A.started = true;
  ['room', 'wx', 'near', 'mus'].forEach((ch) => { try { const b = bedChannel(ch); const p = b.el.play(); if (p && p.catch) p.catch(() => {}); b.el.pause(); } catch (e) {} });   /* unlocked inside the first tap, so phones let them play later */
  A.apply(); A.mood(A.mode);
  A.timer = setInterval(A.events, 9000);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', safe(() => { if (!A.ctx) return; if (document.hidden) { A.ctx.suspend(); Object.values(A.beds).forEach((b) => { try { b.el.pause(); } catch (e) {} }); } else { A.ctx.resume(); Object.values(A.beds).forEach((b) => { try { if (b.url && !b.done) b.el.play().catch(() => {}); } catch (e) {} }); } }));
});
A.apply = safe(function () {
  if (!A.started) return; const v = V(), t = A.ctx.currentTime, n = A.nodes;
  n.master.gain.setTargetAtTime(v.sound ? v.master : 0, t, 0.05); n.music.gain.setTargetAtTime(v.music, t, 0.1);
  n.sfx.gain.setTargetAtTime(v.sfx, t, 0.05); n.amb.gain.setTargetAtTime(v.sfx, t, 0.1); n.ui.gain.setTargetAtTime(v.sfx * 0.9, t, 0.05);
});
/* the generated bed is only for screens with no recorded room */
A.mood = safe(function (m) {
  A.mode = m || A.mode; if (!A.started) return; const t = A.ctx.currentTime, n = A.nodes;
  const p = { title: [0.035, 0.03, 180], end: [0.025, 0.04, 260], over: [0.03, 0.07, 100] }[A.mode] || [0.04, 0.04, 200];
  const on = !A.roomBed; n.windGain.gain.setTargetAtTime(on ? p[0] : 0, t, 1.5); n.droneGain.gain.setTargetAtTime(on ? p[1] : 0, t, 1.5); n.droneFilter.frequency.setTargetAtTime(p[2], t, 1.5);
});

/* ---------- the body and the tension: called a few times a second by the game ----------
   f.muffle 0..1   hurt, deafened        f.drive 0..1   breaking, delirious        f.tension 0..1  danger near
   f.wobble 0..1   fever, drunk          f.sag 0..1     despair                     f.space 'house' | 'run'           */
A.feel = safe(function (f) {
  if (!A.started) return; const n = A.nodes, t = A.ctx.currentTime; Object.assign(A.f, f);
  const F = A.f; const shock = A.shockLvl || 0;
  const m = clamp(Math.max(F.muffle || 0, shock), 0, 1);
  n.muffle.frequency.setTargetAtTime(18000 * Math.pow(0.03, m), t, 0.25);                 /* 18 kHz clear -> ~550 Hz underwater */
  n.wet.gain.setTargetAtTime(clamp(F.drive || 0, 0, 1) * 0.35, t, 0.4); n.dry.gain.setTargetAtTime(1 - clamp(F.drive || 0, 0, 1) * 0.25, t, 0.4);
  n.dreadGain.gain.setTargetAtTime(Math.pow(clamp(F.tension || 0, 0, 1), 1.6) * 0.075, t, 0.8);
  n.duck.gain.setTargetAtTime((A.duckTo != null ? A.duckTo : 1) * (1 - clamp(F.tension || 0, 0, 1) * 0.45), t, A.duckTo != null ? 0.08 : 0.9);   /* danger thins the room out */
  n.mduck.gain.setTargetAtTime(A.duckTo != null ? Math.min(1, A.duckTo * 1.2) : 1, t, A.duckTo != null ? 0.08 : 0.9);
  const space = F.space === 'run' ? A.irHall : A.irHouse; if (n.verb.buffer !== space) n.verb.buffer = space;
  n.send.gain.setTargetAtTime((F.space === 'run' ? 0.32 : 0.14) + clamp(F.sag || 0, 0, 1) * 0.25, t, 1);
  /* fever warbles the music; despair lets it sag a little flat. preservesPitch off so the pitch really moves */
  const mb = A.beds.mus; if (mb && mb.el) { try { mb.el.preservesPitch = false; mb.el.mozPreservesPitch = false; mb.el.webkitPreservesPitch = false; const w = clamp(F.wobble || 0, 0, 1); const rate = (1 - clamp(F.sag || 0, 0, 1) * 0.05) * (1 + Math.sin(Date.now() / 900) * 0.025 * w); if (Math.abs(mb.el.playbackRate - rate) > 0.002) mb.el.playbackRate = rate; } catch (e) {} }
  if (F.muffle > 0.35 && (A.f.space === 'run' || A.f.space === 'house')) A.heart(clamp(F.muffle, 0, 1) * 0.8);   /* badly hurt: you hear your own heart */
});
/* a sudden blow to the senses: ringing, then the world comes back */
A.shock = safe(function (k) {
  if (!A.started) return; k = clamp(k, 0, 1); const n = A.nodes, t = A.ctx.currentTime;
  A.shockLvl = Math.max(A.shockLvl || 0, k * 0.8); n.ringGain.gain.cancelScheduledValues(t); n.ringGain.gain.setValueAtTime(0.0001, t); n.ringGain.gain.exponentialRampToValueAtTime(0.012 + k * 0.03, t + 0.05); n.ringGain.gain.exponentialRampToValueAtTime(0.0001, t + 2 + k * 4);
  clearInterval(A.shockT); A.shockT = setInterval(() => { A.shockLvl = Math.max(0, (A.shockLvl || 0) - 0.04); A.feel({}); if (A.shockLvl <= 0) clearInterval(A.shockT); }, 150);
  A.feel({});
});
/* hold the breath: everything dips for a moment (before a knock, as a death lands) */
A.duck = safe(function (to, secs) { if (!A.started) return; A.duckTo = clamp(to, 0, 1); A.feel({}); clearTimeout(A.duckT); A.duckT = setTimeout(() => { A.duckTo = null; A.feel({}); }, (secs || 1) * 1000); });

/* now and then, something far away: placed somewhere left or right, rarer by day, never the same thing twice in a row */
A.events = safe(function () {
  if (!A.started || !V().sound || (typeof document !== 'undefined' && document.hidden) || C.paused) return;
  if (A.mode === 'title' || A.mode === 'end' || A.mode === 'over') return;
  const dark = A.night || A.mode === 'exp'; const r = Math.random(); const pan = (Math.random() * 2 - 1) * 0.85;
  const pickNot = (opts) => { const o = opts.filter((x) => x !== A.lastEv); const k = o[Math.floor(Math.random() * o.length)]; A.lastEv = k; return k; };
  if (A.mode === 'exp') {
    if (r < 0.22) { const k = pickNot(['scream', 'whisper', 'creak', 'drag', 'drips']); if (k === 'scream') A.sfx('scream', { pan, far: 0.8 }); else A[k](pan); return; }
    if (r < 0.32) { A.sfx(Math.random() < 0.4 ? 'burstfar' : 'shotfar', { pan, far: 0.7 }); return; }
    return;
  }
  if (r < (dark ? 0.12 : 0.05)) A.sfx(pickNot(['shotfar', 'burstfar']), { pan, far: 0.6 });
  else if (dark && r < 0.17 && !A.f.tension) A.sfx('siren', { pan, far: 0.8 });
  else if (r < 0.2 && A.wx === 'storm') A.sfx('thunder', { pan: pan * 0.5, far: 0.3 });
});
const pick5 = (a) => a[Math.floor(Math.random() * a.length)];
function panned(ctx, node, pan, dest) { if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = clamp(pan || 0, -1, 1); node.connect(p); p.connect(dest); } else node.connect(dest); }
A.gunshot = safe(function (pan) {
  const ctx = A.ctx, n = A.nodes, t = ctx.currentTime + 0.02, bursts = Math.random() < 0.4 ? 1 + Math.floor(Math.random() * 4) : 1;
  for (let i = 0; i < bursts; i++) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 0.5); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900; const g = ctx.createGain(); const st = t + i * (0.09 + Math.random() * 0.08);
    g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.28, st + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, st + 0.3); src.connect(hp); hp.connect(g); g.connect(n.echoIn); panned(ctx, g, pan, n.sfx); src.start(st, Math.random() * 0.2); src.stop(st + 0.5);
  }
});
A.thunder = safe(function () {
  const ctx = A.ctx, n = A.nodes, t = ctx.currentTime + 0.05; const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 3); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8); src.connect(lp); lp.connect(g); g.connect(n.amb); src.start(t); src.stop(t + 3);
});
/* whispering: breath shaped like words, too quiet to make out */
A.whisper = safe(function (pan) { const ctx = A.ctx; const side = pan || (Math.random() < 0.5 ? -0.8 : 0.8); const n = 5 + Math.floor(Math.random() * 6); for (let k = 0; k < n; k++) { const t = ctx.currentTime + 0.1 + k * (0.12 + Math.random() * 0.14); const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 0.3); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500 + Math.random() * 2500; bp.Q.value = 3; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); src.connect(bp); bp.connect(g); panned(ctx, g, side, A.nodes.sfx); g.connect(A.nodes.send); src.start(t); src.stop(t + 0.3); } });
/* metal and wood under weight */
A.creak = safe(function (pan) { const ctx = A.ctx, t = ctx.currentTime + 0.05; const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(160 + Math.random() * 80, t); o.frequency.linearRampToValueAtTime(110 + Math.random() * 60, t + 1.4); const v = ctx.createOscillator(); v.frequency.value = 23; const vg = ctx.createGain(); vg.gain.value = 9; v.connect(vg); vg.connect(o.frequency); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 6; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5); o.connect(bp); bp.connect(g); panned(ctx, g, pan, A.nodes.sfx); g.connect(A.nodes.send); o.start(t); v.start(t); o.stop(t + 1.6); v.stop(t + 1.6); });
/* something heavy dragged across the floor above */
A.drag = safe(function (pan) { const ctx = A.ctx, t = ctx.currentTime + 0.05; const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 3); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.5); g.gain.setValueAtTime(0.2, t + 2.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8); const am = ctx.createOscillator(); am.frequency.value = 3; const ag = ctx.createGain(); ag.gain.value = 0.1; am.connect(ag); ag.connect(g.gain); src.connect(lp); lp.connect(g); panned(ctx, g, pan, A.nodes.sfx); g.connect(A.nodes.send); src.start(t); am.start(t); src.stop(t + 3); am.stop(t + 3); });
/* the sting when they see you */
A.sting = safe(function () { const ctx = A.ctx, t = ctx.currentTime; [[110, 0], [116.5, 0], [155.6, 0.02], [233, 0.04], [246.9, 0.05]].forEach(([f, d]) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t + d); o.frequency.exponentialRampToValueAtTime(f * 0.94, t + 1.6); g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.05, t + d + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8); o.connect(g); g.connect(A.nodes.sfx); g.connect(A.nodes.send); o.start(t + d); o.stop(t + 1.9); }); });
A.dog = safe(function () { A.sfx('dog', { pan: (Math.random() * 2 - 1) * 0.8, far: 0.7 }); });
/* water dripping somewhere in the dark */
A.drips = safe(function (pan) { const n = 3 + Math.floor(Math.random() * 4); for (let k = 0; k < n; k++) tone(1400 + Math.random() * 500, 0.05, 'sine', 0.04, 700, k * (0.6 + Math.random() * 0.7), pan, true); });
/* someone walking on the floor above: heavy, slow, through the ceiling */
A.steps = safe(function (pan) { const ctx = A.ctx; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; panned(ctx, lp, pan || 0, A.nodes.sfx); for (let k = 0; k < 6; k++) { const t = ctx.currentTime + k * 0.62; const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); o.connect(g); g.connect(lp); o.start(t); o.stop(t + 0.2); } });
/* your heartbeat, faster as danger gets closer (0 = calm, 1 = right on you) */
A.heart = safe(function (k) {
  if (!A.started) return; A.hk = k; if (k <= 0.05) return; const now = A.ctx.currentTime; const gap = 1.1 - k * 0.65; if (A.nextBeat && now < A.nextBeat) return; A.nextBeat = now + gap;
  [0, 0.16].forEach((d, i) => { const t = now + d; const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.frequency.setValueAtTime(58, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.12); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime((i ? 0.12 : 0.18) * Math.min(1, 0.4 + k), t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(g); g.connect(A.nodes.ui); o.start(t); o.stop(t + 0.2); });   /* the heart is inside you: not muffled, not in the room */
});
/* flies near the dead: the recording, as loud as they are close */
A.flies = safe(function (v) { if (!A.started) return; A.loop('flies', 'amb_flies', v > 0.02, clamp(v, 0, 1) * 0.35, 1, { dir: 'amb' }); if (A.loops.flies && A.loops.flies.g) A.loops.flies.g.gain.setTargetAtTime(clamp(v, 0, 1) * 0.35, A.ctx.currentTime, 0.3); });
function tone(f, dur, type, vol, slide, delay, pan, wet) {
  const ctx = A.ctx, t = ctx.currentTime + (delay || 0); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); panned(ctx, g, pan, wet ? A.nodes.sfx : A.nodes.ui); if (wet) g.connect(A.nodes.send); o.start(t); o.stop(t + dur + 0.05);
}

/* ---------- recorded beds ---------- */
const BANK = {
  amb_day: ['audio/amb/amb_day_1.mp3', 'audio/amb/amb_day_2.mp3', 'audio/amb/amb_day_3.mp3'],
  amb_night: ['audio/amb/amb_night_1.mp3', 'audio/amb/amb_night_2.mp3', 'audio/amb/amb_night_3.mp3'],
  amb_rain: ['audio/amb/amb_rain_1.mp3', 'audio/amb/amb_rain_2.mp3', 'audio/amb/amb_rain_3.mp3'],
  amb_storm: ['audio/amb/amb_storm_1.mp3'],
  amb_run: ['audio/amb/amb_run.mp3'], amb_fire: ['audio/amb/amb_fire.mp3'], amb_radio: ['audio/amb/amb_radio.mp3'],
  mus_title: ['audio/music/mus_title.mp3'], mus_day: ['audio/music/mus_day.mp3'], mus_night: ['audio/music/mus_night.mp3'], mus_run: ['audio/music/mus_run.mp3'],
  mus_danger: ['audio/music/mus_danger.mp3'], mus_grief: ['audio/music/mus_grief.mp3'], mus_end: ['audio/music/mus_end.mp3']
};
const LEVEL = { amb_day: 0.55, amb_night: 0.6, amb_rain: 0.5, amb_storm: 0.55, amb_run: 0.6, amb_fire: 0.3, amb_radio: 0.3, mus_title: 0.5, mus_day: 0.2, mus_night: 0.24, mus_run: 0.26, mus_danger: 0.42, mus_grief: 0.4, mus_end: 0.5 };
/* music that comes and goes: play it once, then silence for a while */
const SPARSE = { mus_day: [70, 160], mus_night: [60, 140], mus_run: [40, 110] };
A.bank = BANK;
function bedChannel(ch) {
  let b = A.beds[ch]; if (b) return b;
  const el = new Audio(); el.loop = true; el.preload = 'none'; el.crossOrigin = 'anonymous';
  const src = A.ctx.createMediaElementSource(el); const g = A.ctx.createGain(); g.gain.value = 0; src.connect(g);
  if (ch === 'mus') g.connect(A.nodes.mduck); else { g.connect(A.nodes.duck); g.connect(A.nodes.send); }
  b = A.beds[ch] = { el, g, key: null, url: null };
  el.addEventListener('ended', () => { b.done = true; const sp = SPARSE[b.key]; b.quietUntil = Date.now() + (sp ? (sp[0] + Math.random() * (sp[1] - sp[0])) * 1000 : 0); });
  return b;
}
/* the game says what should be heard now: { room, wx, near, mus, day, muffle (wx through walls), soft } */
A.scene = safe(function (w) {
  if (!A.started || !A.ctx) return;
  const want = { room: w.room || null, wx: w.wx || null, near: w.near || null, mus: w.mus || null }; const t = A.ctx.currentTime;
  A.night = !!w.night; A.wx = w.wxName || null;
  ['room', 'wx', 'near', 'mus'].forEach((ch) => {
    const key = want[ch]; const b = bedChannel(ch); const list = key && BANK[key];
    const url = list ? list[Math.abs(w.day || 0) % list.length] : null;
    const lvl = key ? (LEVEL[key] || 0.5) * (w.muffle && ch === 'wx' ? 0.4 : 1) * (w.soft && ch === 'wx' ? 0.5 : 1) : 0;
    if (url === b.url) {
      /* sparse music: after it ends it rests, then comes back on its own */
      if (ch === 'mus' && b.done && Date.now() > (b.quietUntil || 0)) { b.done = false; try { b.el.currentTime = 0; const p = b.el.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {} b.g.gain.setTargetAtTime(lvl, t, 2); }
      if (b.lvl !== lvl) { b.lvl = lvl; b.g.gain.setTargetAtTime(lvl, t, 0.8); }
      return;
    }
    /* fade out what is playing, then swap the file and fade the new one in */
    b.g.gain.setTargetAtTime(0, t, ch === 'mus' ? 0.9 : 0.6); b.url = url; b.key = key; b.lvl = lvl; b.done = false; const my = (b.gen = (b.gen || 0) + 1);
    setTimeout(safe(() => {
      if (b.gen !== my) return; if (!url) { b.el.pause(); return; }
      b.el.loop = !(ch === 'mus' && SPARSE[key]); b.el.src = url;
      if (ch !== 'mus') { try { b.el.currentTime = Math.random() * 20; } catch (e) {} }
      /* sparse music starts after a breath of silence, not the moment the scene changes */
      const wait = ch === 'mus' && SPARSE[key] ? 8000 + Math.random() * 20000 : 0;
      setTimeout(safe(() => { if (b.gen !== my) return; const p = b.el.play(); if (p && p.catch) p.catch(() => {}); b.g.gain.setTargetAtTime(lvl, A.ctx.currentTime, ch === 'mus' ? 2.5 : 1.2); }), wait);
    }), ch === 'mus' ? 2600 : 1800);
  });
  A.roomBed = !!want.room; A.mood(A.mode);
});

/* ---------- short sounds (decoded once; small files only) ---------- */
const BUF = new Map(), LOADING = new Map();
function buf(name, dir) {
  const key = (dir || 'sfx') + '/' + name;
  if (BUF.has(key)) return Promise.resolve(BUF.get(key)); if (LOADING.has(key)) return LOADING.get(key);
  const p = fetch('audio/' + key + '.mp3').then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status)))).then((ab) => new Promise((res, rej) => A.ctx.decodeAudioData(ab, res, rej))).then((b) => { BUF.set(key, b); LOADING.delete(key); return b; }).catch(() => { BUF.set(key, null); LOADING.delete(key); return null; });
  LOADING.set(key, p); return p;
}
/* play part of a sample, placed in the room:
   vol, dur (seconds kept, then a fade), from ('rand' = somewhere inside), rate, delay,
   pan -1..1 (left..right), far 0..1 (through walls / across campus: quieter, darker), verb (extra room), bus 'sfx' | 'amb' | 'ui' */
/* stacking is deliberate: the same sound twice inside a quarter second only phases against itself, and more than a
   handful of one-shots at once is noise, not drama. The newest wins; the quietest rule is the budget. */
const RECENT = new Map(); let VOICES = 0; const MAX_VOICES = 9;
A.sample = safe(function (name, o) {
  if (!A.started || !V().sound) return; o = o || {};
  const now = Date.now(); if (now - (RECENT.get(name) || 0) < 250 && !o.allowRepeat) return; RECENT.set(name, now);
  if (VOICES >= MAX_VOICES && o.bus !== 'ui') return;
  buf(name, o.dir).then(safe((b) => {
    if (!b) return; const ctx = A.ctx, n = A.nodes, t = ctx.currentTime + (o.delay || 0); const src = ctx.createBufferSource(); src.buffer = b;
    VOICES++; src.onended = () => { VOICES = Math.max(0, VOICES - 1); };
    src.playbackRate.value = (o.rate || 1) * (o.vary === false ? 1 : 0.95 + Math.random() * 0.1);
    const far = clamp(o.far || 0, 0, 1); const g = ctx.createGain(); const vol = (o.vol == null ? 0.8 : o.vol) * (1 - far * 0.55);
    const dur = Math.min(o.dur || b.duration, b.duration); const from = o.from === 'rand' ? Math.random() * Math.max(0, b.duration - dur) : (o.from || 0);
    g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + Math.max(0.01, dur - 0.25)); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    let head = src; if (far > 0.05) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000 * Math.pow(0.06, far); src.connect(lp); head = lp; }
    head.connect(g); const bus = o.bus === 'ui' ? n.ui : o.bus === 'amb' ? n.amb : n.sfx;
    panned(ctx, g, o.pan, bus); if (o.bus !== 'ui') { const s = ctx.createGain(); s.gain.value = (o.verb == null ? 0.5 : o.verb) + far * 0.6; g.connect(s); s.connect(n.send); }
    src.start(t, from, dur + 0.05);
  }));
});
/* a short sound that repeats while something goes on (footsteps, flies) */
A.loop = safe(function (key, name, on, vol, rate, o) {
  if (!A.started) return; o = o || {}; const L = A.loops[key];
  if (!on || !name) { if (L) { try { if (L.g) { L.g.gain.setTargetAtTime(0, A.ctx.currentTime, 0.08); L.src.stop(A.ctx.currentTime + 0.4); } } catch (e) {} delete A.loops[key]; } return; }
  if (L && L.name === name) { if (L.g) { L.g.gain.setTargetAtTime(vol || 0.5, A.ctx.currentTime, 0.15); if (L.pan) L.pan.pan.setTargetAtTime(clamp(o.pan || 0, -1, 1), A.ctx.currentTime, 0.2); } return; }
  if (L) A.loop(key, null, false);
  A.loops[key] = { name, pending: true };
  buf(name, o.dir).then(safe((b) => {
    const cur = A.loops[key]; if (!b || !cur || cur.name !== name || !cur.pending) return;
    const ctx = A.ctx; const src = ctx.createBufferSource(); src.buffer = b; src.loop = true; src.playbackRate.value = rate || 1; const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(vol || 0.5, ctx.currentTime, 0.1);
    src.connect(g); let pan = null; if (ctx.createStereoPanner) { pan = ctx.createStereoPanner(); pan.pan.value = clamp(o.pan || 0, -1, 1); g.connect(pan); pan.connect(A.nodes.sfx); } else g.connect(A.nodes.sfx); g.connect(A.nodes.send);
    src.start(0, Math.random() * b.duration); A.loops[key] = { name, src, g, pan };
  }));
});
/* game events with a recording: name -> [file, options]. Interface sounds are short and dry; the rest live in the room */
const SFX = {
  tap: ['sfx_tap', { vol: 0.3, bus: 'ui' }], choose: ['sfx_tap', { vol: 0.38, bus: 'ui', rate: 0.85 }], back: ['sfx_tap', { vol: 0.25, bus: 'ui', rate: 1.2 }],
  open: null, page: ['sfx_page', { vol: 0.55, bus: 'ui' }], pencil: ['sfx_pencil', { vol: 0.55, bus: 'ui' }],
  hit: ['sfx_hit', { vol: 0.9, dur: 0.6 }], slash: ['sfx_slash', { vol: 0.9 }], shot: ['sfx_shot', { vol: 0.95 }], club: ['sfx_club', { vol: 0.85, dur: 0.8 }], thunder: ['sfx_thunder', { vol: 0.75, bus: 'amb' }],
  knock: ['sfx_knock', { vol: 0.9 }], bang: ['sfx_bang', { vol: 0.95 }], door: ['sfx_door', { vol: 0.7, dur: 3 }], doorshut: ['sfx_doorshut', { vol: 0.8 }], cupboard: ['sfx_cupboard', { vol: 0.55, dur: 1.6 }],
  eat: ['sfx_eat', { vol: 0.45, dur: 2.5, from: 'rand' }], drink: ['sfx_drink', { vol: 0.55 }], pour: ['sfx_pour', { vol: 0.55 }], cook: ['sfx_cook', { vol: 0.35, dur: 4 }],
  hammer: ['sfx_hammer', { vol: 0.5, dur: 2.5 }], saw: ['sfx_saw', { vol: 0.45, dur: 3, from: 'rand' }], rubble: ['sfx_rubble', { vol: 0.55, dur: 3 }],
  search: ['sfx_search', { vol: 0.65 }], pick: ['sfx_pick', { vol: 0.65 }], pry: ['sfx_pry', { vol: 0.7 }], glass: ['sfx_glass', { vol: 0.8 }],
  bag: ['sfx_bag', { vol: 0.55, dur: 2.5 }], match: ['sfx_match', { vol: 0.6 }], cough: ['sfx_cough', { vol: 0.45 }], tick: ['sfx_tick', { vol: 0.35, dur: 0.8, bus: 'ui' }],
  dog: ['sfx_dog', { vol: 0.4, dur: 5, from: 'rand', bus: 'amb' }], scream: ['sfx_scream', { vol: 0.35, bus: 'amb' }], siren: ['sfx_siren', { vol: 0.3, dur: 12, from: 'rand', bus: 'amb' }],
  shotfar: ['sfx_shot_far', { vol: 0.55, bus: 'amb' }], burstfar: ['sfx_burst_far', { vol: 0.5, bus: 'amb' }]
};
A.has = (name) => !!SFX[name];
/* o: per-call placement (pan, far, delay...) merged over the defaults */
A.sfx = safe(function (name, o) {
  if (!A.started || !V().sound) return;
  if (name === 'open') return;   /* a card opening is silent: the card itself is the event */
  if (SFX[name]) { A.sample(SFX[name][0], Object.assign({}, SFX[name][1], o || {})); if (name === 'shot') A.shock(0.45); return; }   /* a shot this close leaves the ears ringing */
  switch (name) {
    case 'death': A.shock(0.9); A.duck(0.15, 2.5); tone(110, 1.4, 'sawtooth', 0.1, 45, 0, 0, true); tone(82, 1.6, 'sine', 0.12, 40, 0.05, 0, true); break;
    case 'bell': tone(988, 1.1, 'sine', 0.08, 0, 0, 0, true); tone(1318, 1.3, 'sine', 0.05, 0, 0.12, 0, true); break;
    case 'radio': A.sample('amb_radio', { dir: 'amb', vol: 0.45, dur: 1.4, from: 'rand' }); break;
    case 'sting': A.sting(); break;
    case 'alarm': tone(660, 0.18, 'square', 0.06, 520); tone(520, 0.22, 'square', 0.06, 380, 0.2); break;
  }
});
A.buzz = function (pattern) { try { if (V().haptics && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern); } catch (e) {} };
C.Audio = A;
if (typeof module !== 'undefined') module.exports = A;
})(typeof window !== 'undefined' ? window : globalThis);
