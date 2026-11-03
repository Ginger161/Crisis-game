/* CRISIS — side-view pixel characters (skeleton rig)
   Uses the same specs as sprites.js (Crisis.Sprites.gen). Every pose is solved from joints,
   so feet always land on the ground line, knees and elbows bend the right way, and one body
   can stand, walk, run, sneak, sit on a chair, sit on the floor, kneel, lie down, jump and aim.
   Canvas: 32 x 36 pixels. Ground line is row 34 (feet end on row 33). The character faces right; use dir:-1 to face left. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const CW = 32, CH = 36, G = 34, ANKLE = 31.5;
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const shade = (h, f) => toHex(hex(h).map((v) => v * f));
const tint = (h, t, k) => { const a = hex(h), b = hex(t); return toHex(a.map((v, i) => v * (1 - k) + b[i] * k)); };
const rr = Math.round;
const has = (sp, k) => String(sp.state || '').split('+').includes(k);

/* ---------- pixel canvas ---------- */
const TOPX = 24;                                  // rows of headroom above a standing figure, so a jump or a reach is never cut off
function canvas() {
  const g = new Array(CW * (CH + TOPX)).fill(null);
  const px = (x, y, c) => { x = rr(x); y = rr(y) + TOPX; if (x >= 0 && x < CW && y >= 0 && y < CH + TOPX) g[y * CW + x] = c; };
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };
  const seg = (x1, y1, x2, y2, r, c) => {
    const x0 = Math.floor(Math.min(x1, x2) - r - 1), x3 = Math.ceil(Math.max(x1, x2) + r + 1), y0 = Math.floor(Math.min(y1, y2) - r - 1), y3 = Math.ceil(Math.max(y1, y2) + r + 1);
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    for (let y = y0; y <= y3; y++) for (let x = x0; x <= x3; x++) {
      let t = l2 ? ((x - x1) * dx + (y - y1) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx, cy = y1 + t * dy;
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r + 0.25) px(x, y, c);
    }
  };
  const out = () => {
    let s = '';
    for (let y = 0; y < CH + TOPX; y++) { let x = 0; while (x < CW) { const c = g[y * CW + x]; if (!c) { x++; continue; } let w = 1; while (x + w < CW && g[y * CW + x + w] === c) w++; s += `<rect x="${x}" y="${y - TOPX}" width="${w}" height="1" fill="${c}"/>`; x += w; } }
    return s;
  };
  return { px, rect, seg, out, g };
}

/* two-bone IK: returns the middle joint (knee/elbow) and the reached end point */
function ik(a, b, l1, l2, kind) {
  let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 0.001;
  const maxd = l1 + l2 - 0.05; if (d > maxd) { b = [a[0] + dx / d * maxd, a[1] + dy / d * maxd]; dx = b[0] - a[0]; dy = b[1] - a[1]; d = maxd; }
  const mind = Math.abs(l1 - l2) + 0.2; if (d < mind) d = mind;
  const aa = (d * d + l1 * l1 - l2 * l2) / (2 * d); const h = Math.sqrt(Math.max(0, l1 * l1 - aa * aa));
  const ux = dx / d, uy = dy / d, mx = a[0] + ux * aa, my = a[1] + uy * aa;
  const c1 = [mx - uy * h, my + ux * h], c2 = [mx + uy * h, my - ux * h];
  const score = kind === 'knee' ? (p) => p[0] - p[1] * 0.5 : (p) => -p[0] + p[1] * 0.7;
  return { j: score(c1) >= score(c2) ? c1 : c2, end: b };
}

/* ---------- body dimensions ---------- */
function dims(sp) {
  const f = sp.sex === 'f', b = sp.body;
  if (b === 'child') return { thigh: 3.6, shin: 3.6, tl: 6, a1: 3, a2: 3, rt: 2.3, rl: 1.4, ra: 1.05 };
  if (b === 'teen') return { thigh: 5, shin: 5, tl: 8, a1: 3.7, a2: 3.7, rt: f ? 2.4 : 2.7, rl: 1.65, ra: 1.15 };
  const broad = sp.build === 'broad';
  const d = { thigh: 5.6, shin: 5.6, tl: 9, a1: 4.1, a2: 4.1, rt: broad ? 3.6 : f ? 2.5 : 3, rl: broad ? 2.2 : f ? 1.6 : 1.9, ra: broad ? 1.5 : 1.25 };
  if (b === 'elder') { d.tl = 8; d.a1 = 3.8; d.a2 = 3.8; }
  return d;
}

/* ---------- poses ---------- */
function pose(sp, kind, i) {
  const d = dims(sp), leg = d.thigh + d.shin, stoop = sp.body === 'elder' ? 1.6 : 0;
  const p = { P: [15, ANKLE - leg * 0.97], lean: stoop, tl: d.tl, hdx: 1.4 + stoop * 0.4, hdy: -4.3, rot: 0, F1: null, F2: null, K1: null, K2: null, H1: null, H2: null, sw1: 0, sw2: 0, breath: 0, item: 'low', flash: false, shoe: 'fwd', lie: false, bow: 0 };
  const n = { idle: 2, walk: 6, run: 6, sneak: 4, limp: 6, sit: 2, sitfloor: 2, pray: 2, sleep: 2, dead: 4, jump: 4, aim: 4, stand: 1, climb: 2, peek: 2 }[kind] || 1;
  const t = i % n, ph = (t / n) * Math.PI * 2;
  const gait = (A, lift, bob, lean, armSw) => {
    p.P[1] += bob * Math.abs(Math.sin(ph)); p.lean += lean;
    p.F1 = [p.P[0] + A * Math.sin(ph), ANKLE - Math.max(0, Math.cos(ph)) * lift];
    p.F2 = [p.P[0] - A * Math.sin(ph), ANKLE - Math.max(0, -Math.cos(ph)) * lift];
    p.sw1 = -armSw * Math.sin(ph); p.sw2 = armSw * Math.sin(ph);
  };
  switch (kind) {
    case 'stand': p.F1 = [p.P[0] + 1, ANKLE]; p.F2 = [p.P[0] - 1, ANKLE]; break;
    case 'idle': p.F1 = [p.P[0] + 1.2, ANKLE]; p.F2 = [p.P[0] - 1.2, ANKLE]; p.breath = t ? 0.8 : 0; break;
    case 'walk': gait(4, 2.6, 0.9, 0.2, 3.2); break;
    case 'limp': gait(2.6, 1.2, 1.4, 1.6, 0.8); p.H1 = 'belly'; p.F2[1] = ANKLE; break;
    case 'run': gait(6, 4.2, 1.2, 2.6, 4.8); p.item = 'run'; break;
    case 'sneak': { p.P = [14, ANKLE - leg * 0.66]; gait(2.8, 1.6, 0.4, 3.4, 2); p.P[1] = ANKLE - leg * 0.66 + 0.5 * Math.abs(Math.sin(ph)); p.hdy = -3.8; break; }
    case 'sit': {
      p.P = [12.5, G - 9.2]; p.lean = 0.2; p.K1 = [p.P[0] + d.thigh, p.P[1] + 0.2]; p.K2 = [p.P[0] + d.thigh - 0.6, p.P[1] - 0.2];
      p.F1 = [p.K1[0] + 0.6, ANKLE]; p.F2 = [p.K2[0] + 1.8, ANKLE]; p.H1 = [p.K1[0] - 0.8, p.K1[1] - 1.4]; p.H2 = [p.K2[0] - 2.2, p.K2[1] - 1.2]; p.breath = t ? 0.7 : 0; break;
    }
    case 'sitfloor': {
      p.P = [11, ANKLE - 0.3]; p.lean = 0.6; p.F1 = [p.P[0] + leg * 0.88, ANKLE + 0.2]; p.F2 = [p.P[0] + leg * 0.8, ANKLE + 0.4];
      p.H1 = [p.P[0] + 5.5, ANKLE - 4.4]; p.H2 = [p.P[0] + 1.2, ANKLE + 0.2]; p.breath = t ? 0.7 : 0; break;
    }
    case 'pray': {
      /* kneeling: knees on the floor, thighs upright, shins flat behind, torso upright, head bowed */
      const kx = 15.6, ky = G - 1.7;
      p.K1 = [kx, ky]; p.K2 = [kx - 1, ky + 0.1];
      p.P = [14.2, ky - Math.sqrt(d.thigh * d.thigh - 1.4 * 1.4)];
      p.F1 = [kx - d.shin, G - 1.7]; p.F2 = [kx - 1 - d.shin + 0.4, G - 1.5];
      p.lean = 1.1; p.shoe = 'flat'; p.bow = 1.4; p.breath = t ? 0.6 : 0; p.H1 = 'pray'; p.H2 = 'pray'; break;
    }
    case 'sleep': case 'dead': {
      p.lie = true; p.rot = 1; p.P = [19, G - 3.1]; p.S = [10.4, G - 3.1]; p.hc = [5, G - 3.4]; p.tl = 8.6;
      p.F1 = [29.6, G - 2.6 - (kind === 'sleep' ? 0 : -0.1)]; p.F2 = [29.2, G - 2.1]; p.shoe = 'up'; p.item = 'none';
      p.H1 = [p.P[0] - 3.6, G - 4.4]; p.H2 = [p.P[0] - 6.2, G - 1.7]; p.breath = kind === 'sleep' && t ? -0.7 : 0;
      if (kind === 'dead') { p.H1 = [p.S[0] - 2.4, G - 6.4]; p.H2 = [p.P[0] - 5, G - 1.1]; p.fly = t; }
      break;
    }
    case 'jump': {
      const pr = [[0.63, 0, 1.8, 0], [0.97, -3.4, 0, 0.4], [0.9, -8, 0, 1], [0.97, -4.2, 0, 0.6]][t];
      p.P = [15, ANKLE - leg * pr[0] + pr[1]]; p.lean = pr[2];
      if (t === 0) { p.F1 = [17, ANKLE]; p.F2 = [13, ANKLE]; p.H1 = [p.P[0] - 3, p.P[1] + 1]; p.H2 = [p.P[0] - 5, p.P[1] + 0.5]; }
      else if (t === 2) { p.F1 = [p.P[0] + 4.2, p.P[1] + 7.2]; p.F2 = [p.P[0] - 1.6, p.P[1] + 8]; p.H1 = [p.P[0] + 5, p.P[1] - 14]; p.H2 = [p.P[0] + 2, p.P[1] - 15]; }
      else { p.F1 = [p.P[0] + 1.6, p.P[1] + leg * 0.95]; p.F2 = [p.P[0] - 1.6, p.P[1] + leg * 0.9]; p.H1 = [p.P[0] + 5.5, p.P[1] - 6]; p.H2 = [p.P[0] + 3, p.P[1] - 7.4]; }
      break;
    }
    case 'climb': {      /* stepping up onto a stool, reaching for the sill */
      p.P = [15, ANKLE - leg * 0.97 - 3 - t * 1.5]; p.lean = 1.2; p.F1 = [p.P[0] + 3, ANKLE - 5 - t]; p.F2 = [p.P[0] - 1, ANKLE];
      p.H1 = [p.P[0] + 6, p.P[1] - 11]; p.H2 = [p.P[0] + 4, p.P[1] - 12]; p.shoe = 'fwd'; break;
    }
    case 'peek': {       /* standing on the stool, hands on the sill, looking out */
      p.P = [15, ANKLE - leg * 0.97 - 7]; p.lean = 0.9; p.F1 = [p.P[0] + 1, ANKLE - 7]; p.F2 = [p.P[0] - 1, ANKLE - 7]; p.hdy = -4.9 - t * 0.5;
      p.H1 = [p.P[0] + 6, p.P[1] - 13 + t * 0.6]; p.H2 = [p.P[0] + 4, p.P[1] - 14]; p.breath = t ? 0.5 : 0; break;
    }
    case 'aim': {
      p.F1 = [p.P[0] + 2.2, ANKLE]; p.F2 = [p.P[0] - 2.4, ANKLE]; p.lean = 0.8 + stoop; p.item = 'aim'; p.flash = t === 3;
      const rec = t === 3 ? -1 : 0; p.H1 = ['aim', 9 + rec, 2.4]; p.H2 = ['aim', 6 + rec, 3.2]; p.hdx = 1.8; break;
    }
  }
  return p;
}

/* ---------- character drawing ---------- */
function draw(sp, kind, i, opts) {
  const c = canvas(), { px, rect, seg } = c;
  const d = dims(sp), P = pose(sp, kind, i), leg = d.thigh + d.shin;
  const starv = has(sp, 'starving'), hung = has(sp, 'hungry') || starv;
  if (starv) { d.rt *= 0.78; d.rl *= 0.82; d.ra *= 0.8; } else if (hung) { d.rt *= 0.92; d.rl *= 0.93; }
  if (hung && !P.lie) { P.lean += starv ? 1.8 : 0.7; P.hdy += starv ? 0.8 : 0.3; if (!P.H1 && ['stand', 'idle', 'sit', 'sitfloor'].includes(kind)) P.H1 = 'belly'; if (starv) P.sw1 = P.sw2 = 0; }
  let skin = has(sp, 'sick') ? tint(sp.skin, '#6f8a4a', 0.3) : sp.skin;
  if (starv) skin = tint(skin, '#8a8a64', 0.34); else if (hung) skin = tint(skin, '#8a8a64', 0.14);
  if (has(sp, 'dead') || kind === 'dead') skin = tint(skin, '#9aa0a0', 0.28);
  const sd = shade(skin, 0.8), sdd = shade(skin, 0.55), far = (col) => shade(col, 0.72);
  const top = sp.top, bot = sp.bottom, tc = top.c, shoe = sp.shoe || '#1a130d';
  const dead = kind === 'dead' || has(sp, 'dead');
  /* joints */
  const Pp = [P.P[0], P.P[1] + (P.lie ? 0 : 0)];
  let S;
  if (P.S) S = P.S.slice(); else { const l = Math.min(P.lean, P.tl - 1); S = [Pp[0] + l, Pp[1] - Math.sqrt(P.tl * P.tl - l * l)]; }
  S[1] += P.breath;
  const hc = P.hc ? P.hc.slice() : [S[0] + P.hdx + P.bow, S[1] + P.hdy + (P.bow ? 1.4 : 0)];
  if (starv && !P.lie && (i % 2)) hc[0] += 0.7;
  if (P.hc) hc[1] += P.breath;
  const dv = [S[0] - Pp[0], S[1] - Pp[1]], dl = Math.hypot(dv[0], dv[1]) || 1, dd = [dv[0] / dl, dv[1] / dl], nn = [-dd[1], dd[0]];
  const onTorso = (t, off) => [Pp[0] + dd[0] * dl * t + nn[0] * off, Pp[1] + dd[1] * dl * t + nn[1] * off];
  /* legs */
  const L1 = ik(Pp, P.F1 || [Pp[0], ANKLE], d.thigh, d.shin, 'knee'), L2 = ik(Pp, P.F2 || [Pp[0], ANKLE], d.thigh, d.shin, 'knee');
  if (P.K1) L1.j = P.K1; if (P.K2) L2.j = P.K2;
  if (P.K1) L1.end = P.F1; if (P.K2) L2.end = P.F2;
  /* arms */
  const armTarget = (h, sw, near) => {
    if (h === 'belly') return onTorso(0.45, d.rt - 0.2);
    if (h === 'pray') return [S[0] + 4.4, S[1] + 3.2 + (near ? 0 : 0.4)];
    if (Array.isArray(h) && h[0] === 'aim') return [S[0] + h[1], S[1] + h[2]];
    if (h) return h;
    const reach = d.a1 + d.a2 - 0.7; const x = Math.max(-reach + 0.5, Math.min(reach - 0.5, sw)); return [S[0] + x - 0.4, S[1] + Math.sqrt(Math.max(0.5, reach * reach - x * x))];
  };
  const A1 = ik(S, armTarget(P.H1, P.sw1, true), d.a1, d.a2, 'elbow'), A2 = ik(S, armTarget(P.H2, P.sw2, false), d.a1, d.a2, 'elbow');
  const sleeve = top.sleeve, hasAg = top.type === 'agbada';
  const drawArm = (A, col, far_) => {
    const sk = far_ ? far(skin) : skin;
    seg(S[0], S[1], A.j[0], A.j[1], d.ra, sk); seg(A.j[0], A.j[1], A.end[0], A.end[1], d.ra, sk);
    px(A.end[0], A.end[1], far_ ? far(sd) : sd);
    const sc = far_ ? far(tc) : tc;
    if (sleeve === 'long') { seg(S[0], S[1], A.j[0], A.j[1], d.ra + 0.2, sc); seg(A.j[0], A.j[1], A.end[0] - (A.end[0] - A.j[0]) * 0.2, A.end[1] - (A.end[1] - A.j[1]) * 0.2, d.ra + 0.1, sc); }
    else if (sleeve === 'short') seg(S[0], S[1], A.j[0], A.j[1], d.ra + 0.2, sc);
    if (hasAg) seg(S[0], S[1], A.j[0], A.j[1], d.ra + 1.3, far_ ? far(tc) : tc);
  };
  const drawLeg = (L, far_) => {
    const sk = far_ ? far(skin) : skin;
    seg(Pp[0], Pp[1], L.j[0], L.j[1], d.rl, sk); seg(L.j[0], L.j[1], L.end[0], L.end[1], d.rl * 0.85, sk);
    const bc = far_ ? far(bot.c) : bot.c;
    if (bot.type === 'pants') { seg(Pp[0], Pp[1], L.j[0], L.j[1], d.rl + 0.15, bc); seg(L.j[0], L.j[1], L.end[0], L.end[1], d.rl * 0.85 + 0.1, bc); }
    else if (bot.type === 'shorts') seg(Pp[0], Pp[1], (Pp[0] + L.j[0]) / 2 + (L.j[0] - Pp[0]) * 0.2, (Pp[1] + L.j[1]) / 2 + (L.j[1] - Pp[1]) * 0.2, d.rl + 0.2, bc);
    else if (bot.type === 'skirt') seg(Pp[0], Pp[1], Pp[0] + (L.j[0] - Pp[0]) * 0.8, Pp[1] + (L.j[1] - Pp[1]) * 0.8, d.rl + 1.2, bc);
    else if (bot.type === 'dress') { seg(Pp[0], Pp[1], L.j[0], L.j[1], d.rl + 1.1, bc); }
    else if (bot.type === 'wrapper' || bot.type === 'robe') { seg(Pp[0], Pp[1], L.j[0], L.j[1], d.rl + 1.2, bc); seg(L.j[0], L.j[1], L.end[0] - (L.end[0] - L.j[0]) * 0.1, L.end[1] - (L.end[1] - L.j[1]) * 0.1, d.rl + 0.9, bc); if (bot.c2 && !far_) { for (let k = 0; k < 4; k++) { const tt = (k + 0.5) / 4; px(Pp[0] + (L.j[0] - Pp[0]) * tt, Pp[1] + (L.j[1] - Pp[1]) * tt, bot.c2); } for (let k = 0; k < 3; k++) { const tt = (k + 0.6) / 3; px(L.j[0] + (L.end[0] - L.j[0]) * tt, L.j[1] + (L.end[1] - L.j[1]) * tt, bot.c2); } } }
    const sc = far_ ? far(shoe) : shoe;
    if (P.shoe === 'fwd') rect(rr(L.end[0]) - 1, rr(L.end[1]) + 1, 4, 2, sc);
    else if (P.shoe === 'flat') rect(rr(L.end[0]) - 2, rr(L.end[1]), 4, 2, sc);
    else rect(rr(L.end[0]), rr(L.end[1]) - 1, 2, 3, sc);
  };

  /* back layer: backpack */
  if (sp.bag) seg(onTorso(0.15, -d.rt - 1.1)[0], onTorso(0.15, -d.rt - 1.1)[1], onTorso(0.8, -d.rt - 1.1)[0], onTorso(0.8, -d.rt - 1.1)[1], 1.8, sp.bag);
  /* hood bump / veil back */
  /* far limbs */
  drawArm(A2, null, true); drawLeg(L2, true);
  /* torso */
  const torsoCol = (sp.over || []).some((o) => o.t === 'coat') ? sp.over.find((o) => o.t === 'coat').c : tc;
  seg(Pp[0], Pp[1], S[0], S[1], d.rt, skin);
  if (hasAg) { seg(Pp[0], Pp[1] + 1, S[0], S[1], d.rt + 1.6, tc); seg(Pp[0] - 0.5, Pp[1] + 3.5, Pp[0] + 0.5, Pp[1] + 3.5, d.rt + 1.4, top.c2 || shade(tc, 0.75)); }
  else seg(Pp[0], Pp[1], S[0], S[1], d.rt, torsoCol);
  if (['skirt', 'dress', 'wrapper', 'robe'].includes(bot.type)) seg(Pp[0], Pp[1] - 0.5, Pp[0] + (L1.j[0] - Pp[0]) * 0.55, Pp[1] + (L1.j[1] - Pp[1]) * 0.55, d.rl + 1.3, bot.c);
  /* over-garments (torso-level) */
  (sp.over || []).forEach((o) => {
    const f = onTorso;
    switch (o.t) {
      case 'tie': { const a = f(0.92, d.rt - 0.6), b = f(0.3, d.rt - 0.6); seg(a[0], a[1], b[0], b[1], 0.55, o.c); break; }
      case 'collar': { const a = f(1, d.rt - 0.4); px(a[0], a[1], o.c || '#efe9d8'); px(a[0], a[1] + 1, o.c || '#efe9d8'); break; }
      case 'apron': { const a = f(0.85, d.rt - 0.2), b = f(0, d.rt - 0.2); seg(a[0], a[1], b[0], b[1], 1, o.c); seg(Pp[0], Pp[1], (Pp[0] + L1.j[0]) / 2, (Pp[1] + L1.j[1]) / 2 + 1, d.rl + 1.5, o.c); break; }
      case 'coat': { seg(Pp[0], Pp[1], Pp[0] + (L1.j[0] - Pp[0]) * 0.9, Pp[1] + (L1.j[1] - Pp[1]) * 0.9 + 1, d.rl + 1.5, o.c); const a = f(0.95, d.rt - 0.2), b = f(0, d.rt - 0.2); seg(a[0], a[1], b[0], b[1], 0.35, shade(o.c, 0.65)); break; }
      case 'vest': { const a = f(0.92, d.rt - 1.2), b = f(0.05, d.rt - 1.2); seg(a[0], a[1], b[0], b[1], 1.3, o.c); const q = f(0.45, d.rt - 0.6); rect(rr(q[0]) - 1, rr(q[1]), 2, 2, shade(o.c, 1.4)); break; }
      case 'belt': { const a = f(0.06, -d.rt), b = f(0.06, d.rt); seg(a[0], a[1], b[0], b[1], 0.5, o.c || '#2a1a10'); break; }
      case 'stripe': { const a = f(0.5, -d.rt), b = f(0.5, d.rt); seg(a[0], a[1], b[0], b[1], 0.5, o.c); break; }
      case 'badge': { const a = f(0.7, d.rt - 0.5); px(a[0], a[1], o.c || '#d8b040'); px(a[0], a[1] + 1, o.c || '#d8b040'); break; }
      case 'lanyard': { const a = f(0.98, d.rt - 0.4), b = f(0.55, d.rt - 0.4); seg(a[0], a[1], b[0], b[1], 0.4, o.c || '#1f7a3d'); rect(rr(b[0]), rr(b[1]), 2, 2, '#efe9d8'); break; }
      case 'hoodie': { const a = f(1, -d.rt + 0.6); seg(a[0], a[1], a[0] - 1, a[1] + 1, 1.8, o.c); break; }
      case 'scarf': { const a = f(1, 0); seg(a[0] - 1.5, a[1], a[0] + 1.5, a[1] + 0.6, 1.2, o.c); const b = f(0.8, d.rt); rect(rr(b[0]), rr(b[1]), 1, 3, o.c); break; }
      case 'sash': { const a = f(1, -0.5), b = f(0.05, d.rt - 0.5); seg(a[0], a[1], b[0], b[1], 0.55, o.c); break; }
      case 'charms': { for (let k = 0; k < 4; k++) { const a = f(0.9 - k * 0.2, d.rt - 0.5); px(a[0], a[1], k % 2 ? '#d8b040' : '#b8402f'); } break; }
      case 'tabard': { seg(Pp[0], Pp[1], S[0], S[1], d.rt + 0.1, o.c); const a = f(0.5, -d.rt), b = f(0.5, d.rt); seg(a[0], a[1], b[0], b[1], 0.5, '#d8d8d0'); break; }
      case 'cross': { const a = f(0.82, d.rt - 0.4); px(a[0], a[1], '#e8e0c8'); px(a[0], a[1] + 1, '#e8e0c8'); px(a[0], a[1] + 2, '#e8e0c8'); px(a[0] - 1, a[1] + 1, '#e8e0c8'); px(a[0] + 1, a[1] + 1, '#e8e0c8'); break; }
    }
  });
  if (starv && !dead) { for (let k = 1; k < 5; k++) { const a = onTorso(0.18 + k * 0.14, d.rt - 1.3), b = onTorso(0.18 + k * 0.14, d.rt - 2.9); seg(a[0], a[1], b[0], b[1], 0.3, shade(tc, 0.62)); } }
  if (sp.chain) { const a = onTorso(0.95, d.rt - 0.3); px(a[0], a[1], '#d8b040'); px(a[0], a[1] + 1, '#d8b040'); }
  if (sp.cross) { const a = onTorso(0.8, d.rt - 0.4); px(a[0], a[1], '#d8b040'); px(a[0], a[1] + 1, '#d8b040'); }
  /* near leg */
  drawLeg(L1, false);
  /* neck + head */
  const nk = [hc[0] - 0.4 * (P.rot ? 0 : 1) + (P.rot ? 0.5 : 0), hc[1] + 2.5];
  if (P.rot) seg(S[0], S[1], hc[0] + 2.5, hc[1], 1.2, sd); else seg(S[0], S[1], nk[0], nk[1], 1.3, sd);
  const T = P.rot ? (u, v) => [hc[0] + v, hc[1] - u] : (u, v) => [hc[0] + u, hc[1] + v];
  const L = (u, v, col) => { const q = T(u, v); px(q[0], q[1], col); };
  const LR = (u, v, w, h, col) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) L(u + i, v + j, col); };
  LR(-3, -3, 6, 6, skin); LR(-3, -2, 1, 4, sd); L(3, 0, skin); L(-1, 0, sd);
  const hcc = sp.hairc, hd = sp.headc, covers = ['hijab', 'helmet', 'balaclava', 'veil', 'hood'].includes(sp.head);
  if (!covers) {
    switch (sp.hair) {
      case 'short': LR(-3, -4, 6, 2, hcc); LR(-4, -3, 1, 4, hcc); break;
      case 'fade': LR(-3, -4, 5, 1, hcc); LR(-3, -3, 1, 3, hcc); break;
      case 'afro': LR(-5, -6, 8, 4, hcc); LR(-5, -3, 3, 4, hcc); break;
      case 'twists': LR(-3, -4, 6, 2, hcc); LR(-4, -3, 1, 4, hcc); L(-2, -5, hcc); L(0, -5, hcc); L(2, -5, hcc); break;
      case 'cornrows': LR(-3, -4, 6, 2, hcc); LR(-4, -3, 1, 4, hcc); [-2, 0, 2].forEach((u) => LR(u, -4, 1, 2, shade(hcc, 2.2))); break;
      case 'braids': LR(-3, -4, 6, 2, hcc); LR(-5, -3, 2, 12, hcc); L(-5, 8, '#d8b040'); L(-4, 8, '#d8b040'); break;
      case 'bun': LR(-3, -4, 6, 2, hcc); LR(-4, -3, 1, 4, hcc); LR(-4, -6, 3, 2, hcc); break;
      case 'weave': LR(-4, -4, 7, 2, hcc); LR(-5, -3, 3, 13, hcc); break;
      case 'locs': LR(-5, -5, 8, 3, hcc); LR(-5, -3, 2, 7, hcc); LR(-4, 1, 1, 4, hcc); break;
      case 'mohawk': LR(-2, -6, 4, 3, hcc); break;
      case 'pigtails': LR(-3, -4, 6, 2, hcc); LR(-4, -3, 1, 3, hcc); LR(-6, -1, 2, 5, hcc); break;
    }
  }
  switch (sp.head) {
    case 'cap': LR(-3, -4, 6, 2, hd); LR(2, -2, 3, 1, shade(hd, 0.65)); LR(-3, -2, 6, 1, shade(hd, 0.8)); break;
    case 'fila': LR(-3, -5, 6, 3, hd); LR(-3, -3, 6, 1, shade(hd, 0.75)); break;
    case 'gele': LR(-5, -7, 7, 5, hd); LR(-4, -3, 6, 1, shade(hd, 0.8)); LR(-6, -5, 2, 4, shade(hd, 1.2)); LR(-2, -7, 1, 2, shade(hd, 1.3)); LR(0, -6, 1, 2, shade(hd, 1.3)); break;
    case 'headtie': LR(-4, -4, 7, 2, hd); LR(-6, -5, 2, 3, shade(hd, 1.25)); break;
    case 'hijab': LR(-4, -4, 7, 2, hd); LR(-4, -2, 3, 7, hd); LR(-4, 2, 5, 3, hd); LR(-3, -3, 1, 1, hd); break;
    case 'turban': LR(-4, -6, 7, 4, hd); LR(-4, -4, 7, 1, shade(hd, 0.75)); LR(-5, -3, 2, 4, hd); break;
    case 'beanie': LR(-3, -5, 6, 3, hd); break;
    case 'headband': LR(-3, -2, 6, 1, hd); break;
    case 'beret': LR(-4, -5, 7, 2, hd); LR(-5, -4, 2, 1, hd); break;
    case 'nursecap': LR(-2, -5, 4, 2, '#f4f4f4'); L(-1, -5, '#b8402f'); break;
    case 'helmet': LR(-4, -5, 8, 8, hd); LR(1, -2, 3, 3, '#14202a'); L(1, -2, '#5a7a8a'); break;
    case 'balaclava': LR(-4, -4, 7, 8, hd); LR(1, -2, 3, 1, skin); break;
    case 'veil': LR(-4, -5, 7, 3, '#111'); LR(-5, -3, 3, 9, '#111'); LR(-3, -3, 6, 1, '#efe9d8'); LR(-1, 2, 4, 3, '#efe9d8'); break;
    case 'hood': LR(-4, -5, 7, 3, hd); LR(-5, -3, 3, 6, hd); break;
  }
  /* face */
  const dEyes = dead, closed = kind === 'sleep' || P.blink;
  if (sp.head !== 'helmet') {
    if (dEyes) { [[0, -2], [2, -2], [1, -1], [0, 0], [2, 0]].forEach(([u, v]) => L(u, v, '#16090a')); }   // X eyes
    else if (closed) { L(1, -1, sdd); L(2, -1, sdd); }
    else { L(1, -1, '#140d08'); }
    if (has(sp, 'tired') || has(sp, 'sick') || hung) L(1, 0, sd);
    if (starv) { L(0, 1, sdd); L(0, 2, sdd); L(1, 2, sd); L(-1, 1, sd); }
    if (dead) { LR(1, 1, 2, 1, '#3a0d0d'); LR(2, 2, 2, 2, '#d0566a'); L(3, 3, '#a63a4c'); }          // mouth open, tongue out
    else if (sp.head !== 'balaclava') { if (!sp.beard) LR(1, 1, 2, 1, sdd); }
    if (kind === 'sleep' && sp.head !== 'balaclava') { /* breath */ }
  }
  if (sp.beard && sp.head !== 'balaclava' && sp.head !== 'helmet' && !dead) { if (sp.beard === 'beard') LR(0, 1, 3, 3, sp.hairc); else if (sp.beard === 'goatee') LR(1, 2, 2, 2, sp.hairc); else LR(2, 1, 2, 1, sp.hairc); }
  if (sp.glasses && sp.head !== 'helmet' && sp.head !== 'balaclava') { LR(0, -2, 4, 1, sp.glasses); LR(0, 0, 4, 1, sp.glasses); L(0, -1, sp.glasses); L(3, -1, sp.glasses); LR(-2, -1, 2, 1, sp.glasses); }
  if (dead && sp.head === 'helmet') { [[1, -2], [3, -2], [2, -1], [1, 0], [3, 0]].forEach(([u, v]) => L(u, v, '#d6d6de')); }
  if (sp.item === 'binoc') LR(1, -2, 4, 2, '#1a1a1a');
  if (sp.scar) { L(1, -3, '#7a3a30'); L(1, -2, '#7a3a30'); L(2, -1, '#7a3a30'); L(2, 0, '#7a3a30'); }
  /* near arm */
  drawArm(A1, null, false);
  /* held items */
  const H = A1.end, hx = H[0], hy = H[1];
  const gun = (x1, y1, x2, y2, long) => { seg(x1, y1, x2, y2, 0.55, '#202020'); seg(x1, y1, x1 + (x2 - x1) * 0.28, y1 + (y2 - y1) * 0.28, 1.1, '#6b4a2a'); const mx = x1 + (x2 - x1) * 0.45, my = y1 + (y2 - y1) * 0.45; seg(mx, my, mx - 0.5, my + 2.4, 0.55, '#141414'); };
  switch (sp.item) {
    case 'ak': case 'rifle': case 'dane': {
      const L2 = sp.item === 'ak' ? 1 : 1.2;
      if (P.item === 'aim') { gun(S[0] - 1, hy - 0.4, S[0] + 15 * L2, hy - 0.8, true); if (P.flash) { rect(rr(S[0] + 15 * L2) + 1, rr(hy) - 2, 3, 3, '#ffe27a'); px(S[0] + 15 * L2 + 4, hy - 0.8, '#fff3b0'); } }
      else if (P.item === 'run') gun(hx - 4, hy - 1, hx + 5, hy - 3, true);
      else gun(hx - 2, hy - 4.5, hx + 3.5, hy + 6.5, true);
      break;
    }
    case 'machete': seg(hx, hy, hx + 3.5, hy - 7, 0.55, '#c0c4c8'); rect(rr(hx) - 1, rr(hy), 2, 2, '#3a2a1a'); break;
    case 'cane': seg(hx + 0.5, hy - 0.5, hx + 1.5, G - 1, 0.55, '#6b4a2a'); rect(rr(hx) - 1, rr(hy) - 1, 3, 1, '#6b4a2a'); break;
    case 'bible': rect(rr(hx), rr(hy) - 1, 3, 4, '#2a2a30'); px(hx + 1, hy, '#d8b040'); px(hx + 1, hy + 1, '#d8b040'); break;
    case 'torch': seg(hx, hy, hx + 1, hy - 3, 0.6, '#222'); rect(rr(hx), rr(hy) - 6, 2, 3, '#ffe9a0'); px(hx + 0.5, hy - 7, '#ff9a30'); break;
    case 'baton': seg(hx, hy - 1, hx + 1.5, hy + 5, 0.55, '#1a1a1a'); break;
    case 'jerrycan': rect(rr(hx) - 1, rr(hy), 4, 5, '#d8b030'); px(hx, hy - 1, '#b08820'); px(hx + 1, hy - 1, '#b08820'); break;
    case 'basket': rect(rr(hx) - 1, rr(hy), 5, 3, '#b08a50'); rect(rr(hx) - 1, rr(hy), 5, 1, '#c8a060'); break;
    case 'bundle': rect(rr(hx) - 1, rr(hy) - 1, 4, 4, '#8a7a5a'); px(hx, hy - 2, '#6b4f3a'); break;
  }
  /* state overlays: wounds and gore */
  const GORE = !(C.Settings && C.Settings.v && C.Settings.v.gore === false);
  const blood = GORE ? '#8a1410' : '#efe9d8', dried = GORE ? '#5a0f0c' : '#cfc8b0';
  if (has(sp, 'hurt') && !dead) {
    const a = onTorso(0.55, d.rt - 0.6); rect(rr(a[0]) - 1, rr(a[1]), 3, 3, blood); px(a[0], a[1] + 1, dried);
    const b = [(S[0] + A1.j[0]) / 2, (S[1] + A1.j[1]) / 2]; rect(rr(b[0]) - 1, rr(b[1]), 2, 3, '#efe9d8'); px(b[0], b[1] + 1, blood);
    if (P.breath === 0 || true) { const dr = (i % 2) ? 1 : 0; px(a[0], a[1] + 3 + dr, blood); }
    LR(-3, -3, 6, 1, '#efe9d8'); L(0, -3, blood);
  }
  if (has(sp, 'sick') && i % 2) L(-2, -1, '#9bd0e0');
  if (dead) {
    const g = (sp.seed || 0) % 3;
    const pool = [[Pp[0] - 4, G - 1.2], [Pp[0] + 1, G - 1.2], [Pp[0] + 6, G - 1.2]];
    rect(rr(Pp[0]) - 12, G - 1, 26, 1, dried); rect(rr(Pp[0]) - 9, G - 2, 20, 1, blood); rect(rr(Pp[0]) - 5, G - 3, 7, 1, dried);
    const t1 = onTorso(0.5, 0);
    if (sp.body === 'child' || !GORE) { /* children, and anyone when graphic violence is off: a covering cloth */ seg(Pp[0] - 6, Pp[1] - 1.4, Pp[0] + 3, Pp[1] - 1.4, 2.2, '#cfc8b0'); }
    else if (g === 0) { [[0, -1], [2, 0], [-2, 1]].forEach(([a, b]) => { rect(rr(t1[0]) + a - 1, rr(t1[1]) + b - 1, 3, 3, '#7a1410'); px(t1[0] + a, t1[1] + b, '#2a0505'); }); px(t1[0] + 1, t1[1] - 3, blood); px(t1[0] - 3, t1[1] - 3, blood); }
    else if (g === 1) { const q = T(2, -3); rect(rr(q[0]) - 1, rr(q[1]) - 1, 3, 3, '#3a0505'); [[3, -4], [-1, -5], [4, 0], [5, -3]].forEach(([u, v]) => { const w = T(u, v); px(w[0], w[1], blood); }); rect(rr(hc[0]) - 2, G - 2, 6, 1, blood); }
    else { seg(t1[0] - 3, t1[1] - 2.5, t1[0] + 3, t1[1] + 2, 0.8, '#5a0a08'); px(t1[0], t1[1], '#d8786a'); rect(rr(Pp[0]) - 12, G - 2, 4, 1, skin); rect(rr(Pp[0]) - 12, G - 3, 4, 1, sp.top.c); px(Pp[0] - 13, G - 2, blood); }
    if (P.fly != null) { const f = P.fly; [[0, 0], [3, -2], [-3, -1]].forEach(([a, b], k) => { const ang = (f + k * 1.3) * 1.57; px(hc[0] + a + 5 + Math.cos(ang) * 3, G - 8 + b + Math.sin(ang) * 2, '#0a0a0a'); }); }
  }
  /* muzzle + sleeping zzz */
  if (kind === 'sleep') { const z = i % 2; px(hc[0] + 1, hc[1] - 6 - z, '#bcd0e8'); px(hc[0] + 2, hc[1] - 6 - z, '#bcd0e8'); px(hc[0] + 3, hc[1] - 7 - z, '#bcd0e8'); }
  return c.out();
}

/* ---------- animations + render ---------- */
const SA = {
  stand: { n: 1, dur: 1 }, idle: { n: 2, dur: 1.8 }, walk: { n: 6, dur: 0.78 }, run: { n: 6, dur: 0.5 }, sneak: { n: 4, dur: 1.1 }, limp: { n: 6, dur: 1.3 },
  sit: { n: 2, dur: 2.4 }, sitfloor: { n: 2, dur: 2.4 }, pray: { n: 2, dur: 2.6 }, sleep: { n: 2, dur: 3 }, dead: { n: 4, dur: 1.2 }, jump: { n: 4, dur: 0.8 }, aim: { n: 4, dur: 2.2 }, climb: { n: 2, dur: 0.5 }, peek: { n: 2, dur: 1.8 }
};
let cssDone = false;
function ensureCSS() {
  if (cssDone || typeof document === 'undefined') return; cssDone = true;
  let css = '.ss{image-rendering:pixelated;overflow:visible}.ss .f{opacity:0}.ss .f.only{opacity:1}';
  [2, 4, 6].forEach((n) => { for (let i = 0; i < n; i++) { const a = (i / n * 100), b = ((i + 1) / n * 100); css += `@keyframes sf${n}_${i}{0%,${Math.max(a - 0.001, 0.001).toFixed(3)}%{opacity:${i === 0 ? 1 : 0}}${a.toFixed(3)}%,${(b - 0.001).toFixed(3)}%{opacity:1}${b.toFixed(3)}%,100%{opacity:${i === n - 1 ? 1 : 0}}}`; } });
  css += '@media (prefers-reduced-motion:reduce){.ss .f{animation-play-state:paused!important}}';
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
}
function inner(sp0, kind, opts) {
  opts = opts || {}; const sp = opts.state ? Object.assign({}, sp0, { state: opts.state }) : sp0; const A = SA[kind] || SA.idle;
  let o = '';
  for (let i = 0; i < A.n; i++) o += `<g class="f${A.n === 1 ? ' only' : ''}"${A.n > 1 ? ` style="animation:sf${A.n}_${i} ${A.dur}s linear infinite"` : ''}>${draw(sp, kind, i, opts)}</g>`;
  return opts.dir === -1 ? `<g transform="translate(${CW} 0) scale(-1 1)">${o}</g>` : o;
}
function render(sp, kind, opts) {
  opts = opts || {}; ensureCSS(); const s = opts.scale || 4;
  return `<svg class="ss" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW} ${CH}" width="${CW * s}" height="${CH * s}" shape-rendering="crispEdges">${inner(sp, kind, opts)}</svg>`;
}
/* place a character so its feet touch groundY, horizontally centred on x */
function place(sp, kind, x, groundY, opts) {
  opts = opts || {}; ensureCSS(); const s = opts.s || 1;
  /* 10 units of headroom above the figure, so a raised pose (standing on a stool, arms up) is never cut off by the edge of its own box */
  const HR = 24;
  return `<svg class="ss" overflow="visible" x="${(x - 16 * s).toFixed(2)}" y="${(groundY - G * s - HR * s).toFixed(2)}" width="${CW * s}" height="${(CH + HR) * s}" viewBox="0 ${-HR} ${CW} ${CH + HR}" shape-rendering="crispEdges">${inner(sp, kind, opts)}</svg>`;
}
C.Side = { render, place, SA, G, CW, CH, KINDS: Object.keys(SA) };
if (typeof module !== 'undefined') module.exports = C.Side;
})(typeof window !== 'undefined' ? window : globalThis);
