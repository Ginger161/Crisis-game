/* CRISIS — the places you scavenge
   Every building is a row of rooms on each floor, drawn at the same scale as the hideout: rooms 240 wide and 64 high, people small.
   Rooms are joined by doorways in real walls (halls and the outdoors are open). Furniture you can search is a "pile";
   wardrobes, curtains and counters are places to hide. Sites.layout(...) returns the art and where everything is. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const RW = 240, FH = 64, Y1 = 70, Y0 = Y1 - FH;
function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rect = (x, y, w, h, f, ex) => `<rect x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" width="${(+w).toFixed(1)}" height="${(+h).toFixed(1)}" fill="${f}"${ex ? ' ' + ex : ''}/>`;
const ART = () => (C.House && C.House.art) || null;
const WOOD = '#6a4a32', WOOD2 = '#8a6a46', METAL = '#5a636b', METAL2 = '#7d8790', DARK = '#1d140e';

/* ---------- what each kind of building is made of ---------- */
const PLANS = {
  corridor: (nfl, fl, R) => { const n = 3 + (nfl > 2 ? 1 : 0); const r = []; for (let i = 0; i < n; i++) r.push(i === 1 ? 'wash' : (i === n - 1 && R() < 0.5 ? 'common' : 'dorm')); return r; },
  lecture: (nfl, fl, R) => (fl === 0 ? ['lobby', 'class', 'class'] : ['class', 'staff', 'class']),
  office: (nfl, fl, R) => (fl === 0 ? ['lobby', 'office', 'records'] : fl === nfl - 1 ? ['office', 'board', 'office'] : ['office', 'records', 'office']),
  clinic: (nfl, fl, R) => (fl === 0 ? ['reception', 'dispensary', 'ward'] : ['ward', 'ward', 'theatreroom']),
  hall: (nfl, fl, R) => (fl === 0 ? ['seats', 'seats', 'stage'] : ['gallery', 'gallery', 'backstage']),
  cafsmall: () => ['dining', 'kitchen'],
  bigcaf: () => ['stall', 'stall', 'caf', 'stall', 'stall'],
  open: () => ['field', 'field', 'field'],
  gate: () => ['road', 'gatehouse', 'road'],
  library: (nfl, fl) => (fl === 0 ? ['issue', 'stacks', 'reading'] : ['stacks', 'reading', 'stacks']),
  chapel: () => ['pews', 'pews', 'altar'],
  courtB: () => ['court', 'courtB', 'court'], courtV: () => ['court', 'courtV', 'court'], courtF: () => ['courtF', 'court', 'courtF']
};
const OPEN = new Set(['seats', 'stage', 'gallery', 'field', 'road', 'gatehouse', 'caf', 'pews', 'altar', 'court', 'courtB', 'courtV', 'courtF']);   // rooms with no wall between them and the next open one
const OUTSIDE = new Set(['field', 'road', 'gatehouse', 'court', 'courtB', 'courtV', 'courtF']);

/* ---------- furniture: things you can search ---------- */
const PILE = {
  locker: (x) => rect(x - 7, Y1 - 34, 14, 34, METAL) + rect(x - 7, Y1 - 34, 14, 2, METAL2) + rect(x - 0.5, Y1 - 33, 1, 33, '#3a4046') + [0, 1, 2].map((k) => rect(x - 5, Y1 - 31 + k * 2, 3, 0.6, '#2a2e32') + rect(x + 2, Y1 - 31 + k * 2, 3, 0.6, '#2a2e32')).join('') + rect(x - 2.5, Y1 - 18, 1, 3, '#c8c8c8') + rect(x + 1.5, Y1 - 18, 1, 3, '#c8c8c8') + rect(x + 3, Y1 - 30, 4, 10, '#4a5258', 'opacity=".9"'),
  desk: (x) => rect(x - 13, Y1 - 15, 26, 2.5, WOOD2) + rect(x - 12, Y1 - 12.5, 2, 12.5, WOOD) + rect(x + 3, Y1 - 12.5, 9, 12.5, WOOD) + rect(x + 4, Y1 - 11, 7, 3, '#5a3e28') + rect(x + 4, Y1 - 6, 7, 3, '#5a3e28') + rect(x + 7, Y1 - 10, 1.5, 1, '#c8a050') + rect(x + 7, Y1 - 5, 1.5, 1, '#c8a050') + rect(x - 9, Y1 - 19, 7, 4, '#d8d0b0') + rect(x - 8, Y1 - 18, 5, 0.5, '#555'),
  shelf: (x) => rect(x - 12, Y1 - 36, 24, 36, '#4a3626') + [0, 1, 2, 3].map((k) => rect(x - 11, Y1 - 34 + k * 9, 22, 1.5, WOOD2) + rect(x - 10 + (k * 5) % 9, Y1 - 39 + (k + 1) * 9, 4, 5, ['#8a5a3a', '#5a7a9a', '#c8b88a', '#7a3a3a'][k]) + rect(x + 1 + (k * 3) % 6, Y1 - 38 + (k + 1) * 9, 3, 4, ['#d8d0b0', '#6a8a5a', '#a05050', '#3a5a7a'][k])).join(''),
  crate: (x) => rect(x - 9, Y1 - 12, 18, 12, '#8a6a46') + rect(x - 9, Y1 - 12, 18, 2, '#a98a62') + rect(x - 9, Y1 - 7, 18, 1, '#5a4330') + `<path d="M${x - 9} ${Y1 - 12} L${x + 9} ${Y1}" stroke="#5a4330" stroke-width=".8"/>` + rect(x + 2, Y1 - 19, 10, 7, '#7a5a3c') + rect(x + 2, Y1 - 19, 10, 1.5, '#9a7a52'),
  bag: (x) => rect(x - 8, Y1 - 7, 16, 7, '#3a4a3a') + rect(x - 6, Y1 - 9, 12, 2.5, '#4a5a4a') + rect(x - 2, Y1 - 11, 4, 2, '#2a3a2a') + rect(x + 4, Y1 - 5, 7, 5, '#6a3a2a') + rect(x + 5, Y1 - 6, 5, 1.5, '#8a4a3a'),
  fridge: (x) => rect(x - 8, Y1 - 32, 16, 32, '#c8c4b4') + rect(x - 8, Y1 - 32, 16, 1.5, '#e8e4d4') + rect(x - 8, Y1 - 20, 16, 0.8, '#7a7666') + rect(x + 5, Y1 - 28, 1, 6, '#5a5a5a') + rect(x + 5, Y1 - 17, 1, 8, '#5a5a5a') + rect(x - 6, Y1 - 12, 5, 6, '#6a4a2a', 'opacity=".5"'),
  cabinet: (x) => rect(x - 7, Y1 - 28, 14, 28, '#6a7268') + rect(x - 7, Y1 - 28, 14, 1.5, '#8a9288') + [0, 1, 2].map((k) => rect(x - 6, Y1 - 26 + k * 9, 12, 8, '#5a6258') + rect(x - 2, Y1 - 23 + k * 9, 4, 1.2, '#c8c8b8')).join('') + rect(x - 6, Y1 - 9, 12, 1, '#d8d0b0'),
  trolley: (x) => rect(x - 9, Y1 - 18, 18, 2, METAL2) + rect(x - 9, Y1 - 9, 18, 2, METAL2) + rect(x - 9, Y1 - 18, 1, 16, METAL) + rect(x + 8, Y1 - 18, 1, 16, METAL) + rect(x - 7, Y1 - 22, 4, 4, '#e8e4d4') + rect(x - 2, Y1 - 21, 3, 3, '#d04a3a') + rect(x + 2, Y1 - 22, 4, 4, '#e8e4d4') + rect(x - 6, Y1 - 13, 10, 4, '#cfcbb7') + `<circle cx="${x - 7}" cy="${Y1 - 1}" r="1.2" fill="#222"/><circle cx="${x + 7}" cy="${Y1 - 1}" r="1.2" fill="#222"/>`,
  counter: (x) => rect(x - 18, Y1 - 16, 36, 16, '#5a4330') + rect(x - 19, Y1 - 17, 38, 2.5, '#8a6a46') + rect(x - 16, Y1 - 13, 15, 11, '#4a3626') + rect(x + 1, Y1 - 13, 15, 11, '#4a3626') + rect(x - 10, Y1 - 22, 6, 5, '#a8a8a8') + rect(x + 4, Y1 - 21, 8, 4, '#c8a050'),
  pot: (x) => rect(x - 10, Y1 - 10, 20, 10, '#3a3a3a') + rect(x - 11, Y1 - 11, 22, 2, '#5a5a5a') + rect(x - 14, Y1 - 8, 4, 1.5, '#5a5a5a') + rect(x + 10, Y1 - 8, 4, 1.5, '#5a5a5a') + rect(x + 9, Y1 - 6, 8, 6, '#c8a050') + rect(x + 10, Y1 - 7, 6, 1.5, '#e8c070'),
  body: (x, age) => {
    age = age || 0; const fl = (n) => { let o = ''; for (let k = 0; k < n; k++) o += `<g class="fl" style="animation-delay:-${(k * 0.37).toFixed(2)}s"><rect x="${x - 8 + (k * 5) % 18}" y="${Y1 - 8 - (k % 3) * 3}" width=".9" height=".9" fill="#14100c"/></g>`; return o; };
    if (age >= 10) return rect(x - 14, Y1 - 1, 28, 1, '#3a2418', 'opacity=".7"') + rect(x - 12, Y1 - 4, 4, 4, '#ddd4bc') + rect(x - 11.4, Y1 - 3.2, 1, 1, '#14100c') + rect(x - 9.8, Y1 - 3.2, 1, 1, '#14100c') + [0, 1, 2, 3].map((k) => rect(x - 7 + k * 2.2, Y1 - 3.4, 0.7, 3, '#cfc6aa')).join('') + rect(x - 7, Y1 - 2, 9, 0.8, '#cfc6aa') + rect(x + 2, Y1 - 1.6, 11, 1, '#d8d0b6') + rect(x - 2, Y1 - 5, 7, 1.2, '#3a4a5a', 'opacity=".7"');
    const sk = age >= 6 ? '#6a7046' : age >= 2 ? '#5a4030' : '#7a5a40', cl = age >= 6 ? '#2e3a3a' : '#3a4a5a', bloat = age >= 6 ? 2 : 0;
    let o = `<ellipse cx="${x - 2}" cy="${Y1 - 0.6}" rx="${12 + Math.min(age, 6)}" ry="1.6" fill="${age >= 3 ? '#2a0806' : '#5a0c08'}" opacity=".95"/>`;
    o += rect(x - 12, Y1 - 5 - bloat, 18, 4 + bloat, cl) + rect(x + 6, Y1 - 4.5, 5, 4, sk) + rect(x + 11, Y1 - 3, 3, 1.5, '#14100c') + rect(x - 16, Y1 - 3.5, 5, 3, '#2a2a2a') + rect(x - 4, Y1 - 6 - bloat, 6, 2, '#2a3a4a') + rect(x + 7.5, Y1 - 4, 1.2, 1, '#14100c') + rect(x + 7, Y1 - 2.6, 2.6, 0.6, '#3a0806');
    if (age >= 4) o += rect(x - 2, Y1 - 2, 4, 2, '#3a0806') + rect(x + 1, Y1 - 3, 2, 1, '#cfc6aa', 'opacity=".8"');
    return o + fl(age < 1 ? 2 : age < 6 ? 6 : 9);
  },
  wardrobe: (x) => rect(x - 11, Y1 - 40, 22, 40, WOOD) + rect(x - 11, Y1 - 40, 22, 2, WOOD2) + rect(x - 10, Y1 - 37, 9.5, 36, '#4f3825') + rect(x + 0.5, Y1 - 37, 9.5, 36, '#4f3825') + rect(x - 2, Y1 - 21, 1.5, 3, '#c8a050') + rect(x + 0.5, Y1 - 21, 1.5, 3, '#c8a050') + rect(x - 9, Y1 - 2, 3, 2, DARK) + rect(x + 6, Y1 - 2, 3, 2, DARK)
};
/* what you can hide in or behind */
const HIDE = {
  wardrobe: PILE.wardrobe,
  curtain: (x) => rect(x - 12, Y1 - 46, 24, 1, METAL2) + [0, 1, 2, 3, 4, 5].map((k) => rect(x - 12 + k * 4, Y1 - 45, 4, 44, k % 2 ? '#8aa0a8' : '#7a9098', 'opacity=".93"')).join('') + rect(x - 12, Y1 - 20, 24, 3, '#6a5a3a', 'opacity=".35"'),
  counter: (x) => rect(x - 16, Y1 - 18, 32, 18, '#4a3626') + rect(x - 17, Y1 - 19, 34, 2.5, WOOD2) + rect(x - 14, Y1 - 15, 28, 1, '#3a2a1c'),
  under: (x) => rect(x - 20, Y1 - 14, 40, 14, '#2a1f16') + rect(x - 20, Y1 - 14, 40, 2, '#4a3626') + rect(x - 18, Y1 - 11, 36, 11, '#0e0a07')
};

/* ---------- aftermath ----------
   Bullet holes with the spray behind them, a body dragged to a corner, a hand that slid down the wall.
   Rarely, a whole room tells it: a wall where people were shot in a line, a burned room, a room where bandits took their time. */
function holes(x, y, n, R) { let o = ''; for (let k = 0; k < n; k++) { const hx = x + (R() - 0.5) * 22, hy = y + (R() - 0.5) * 8; o += rect(hx - 0.7, hy - 0.7, 1.6, 1.6, '#14100c') + rect(hx - 1.4, hy - 1.4, 3, 3, '#8a8270', 'opacity=".45"'); } return o; }
function spray(x, y, R, big) { let o = `<ellipse cx="${x}" cy="${y}" rx="${big ? 9 : 5}" ry="${big ? 6 : 3.5}" fill="#5a0c08" opacity=".75"/>`; for (let k = 0; k < (big ? 14 : 7); k++) o += rect(x + (R() - 0.3) * (big ? 26 : 16), y + (R() - 0.5) * (big ? 16 : 9), 0.8 + R(), 0.8 + R(), '#6a0e0a', 'opacity=".8"'); for (let k = 0; k < (big ? 4 : 2); k++) o += rect(x - 3 + R() * 8, y + 2, 0.8, 4 + R() * 9, '#4a0806', 'opacity=".7"'); return o; }
function aftermath(R, x0, type, P, T) {
  let o = ''; const at = (dx) => x0 + dx; const quiet = ['wash'].includes(type);
  if (R() < 0.4) { const sx = at(30 + R() * 180), sy = Y1 - 30 - R() * 14; o += holes(sx, sy, 3 + Math.floor(R() * 5), R) + spray(sx + 4, sy, R, false); }
  if (R() < 0.25) { const sx = at(20 + R() * 150); o += `<path d="M${sx} ${Y1 - 0.8} q20 -.6 ${40 + R() * 30} .2" stroke="#4a0806" stroke-width="1.6" fill="none" opacity=".8"/>`; }
  if (R() < 0.2) { const hx = at(30 + R() * 180), hy = Y1 - 34; o += rect(hx, hy, 3, 3.5, '#6a0e0a', 'opacity=".85"') + rect(hx + 0.3, hy + 3.5, 0.6, 1.4, '#6a0e0a') + rect(hx + 1.2, hy + 3.5, 0.6, 1.8, '#6a0e0a') + rect(hx + 2.2, hy + 3.5, 0.6, 1.2, '#6a0e0a') + rect(hx + 1, hy + 5, 1.2, 14, '#5a0c08', 'opacity=".55"'); }
  const r = R();
  if (r < 0.06 && !quiet) {
    /* the wall where they lined people up */
    for (let k = 0; k < 4; k++) o += holes(at(40 + k * 40), Y1 - 30, 5, R) + spray(at(42 + k * 40), Y1 - 26, R, true);
    o += `<ellipse cx="${at(120)}" cy="${Y1 - 0.6}" rx="70" ry="1.8" fill="#3a0806" opacity=".9"/>`; P(70, 'body'); P(150, 'body');
  } else if (r < 0.1 && !quiet) {
    /* a burned room: soot up the walls, everything charred */
    o += rect(x0, Y0, RW, FH, '#0c0806', 'opacity=".62"') + `<path d="M${at(60)} ${Y1} q10 -40 0 -64 M${at(140)} ${Y1} q-12 -38 4 -64 M${at(200)} ${Y1} q8 -30 -4 -64" stroke="#000" stroke-width="10" opacity=".5" fill="none"/>`;
    o += rect(at(90), Y1 - 4, 24, 4, '#1a1410') + rect(at(94), Y1 - 6, 8, 2, '#2a1e16') + rect(at(102), Y1 - 5, 4, 3, '#1a120c'); P(100, 'body');
  } else if (r < 0.15 && ['office', 'staff', 'class', 'kitchen', 'backstage', 'records', 'theatreroom', 'dining', 'common', 'dorm'].includes(type)) {
    /* where the bandits took their time: a chair, wire, the tools they dropped, the one they left */
    const cx = at(120); o += rect(cx - 8, Y1 - 12, 16, 2, '#4a4a4a') + rect(cx - 7, Y1 - 10, 1.4, 10, '#3a3a3a') + rect(cx + 6, Y1 - 10, 1.4, 10, '#3a3a3a') + rect(cx + 6, Y1 - 24, 1.4, 14, '#3a3a3a');
    o += rect(cx - 6, Y1 - 20, 9, 8, '#3a4a5a') + rect(cx - 5, Y1 - 26, 6, 6, '#6a4a36') + rect(cx - 4.4, Y1 - 24, 1.2, 0.8, '#14100c') + rect(cx - 2.2, Y1 - 24, 1.2, 0.8, '#14100c') + rect(cx - 4.6, Y1 - 23, 1.6, 2, '#4a0806') + rect(cx - 2.4, Y1 - 23, 1.6, 2, '#4a0806') + rect(cx - 6, Y1 - 12, 2.5, 12, '#2a3a4a') + rect(cx - 1, Y1 - 12, 2.5, 12, '#2a3a4a');
    o += `<path d="M${cx - 7} ${Y1 - 18} l14 0 M${cx - 7} ${Y1 - 15} l14 0 M${cx - 6} ${Y1 - 4} l3 0 M${cx - 1} ${Y1 - 4} l3 0" stroke="#9a9a8a" stroke-width=".7"/>`;
    o += `<ellipse cx="${cx}" cy="${Y1 - 0.6}" rx="16" ry="1.8" fill="#4a0806" opacity=".95"/>` + rect(cx + 14, Y1 - 2, 8, 1.6, '#7a7f85') + rect(cx + 21, Y1 - 2.6, 3, 2.6, '#3a2a1c') + rect(cx - 26, Y1 - 1.6, 9, 1.4, '#5a5f66') + rect(cx - 30, Y1 - 3, 3, 3, '#7a7f85') + rect(cx + 28, Y1 - 8, 7, 8, '#3a5a7a') + rect(cx + 28, Y1 - 8, 7, 1.4, '#7a9aba');
    o += spray(cx - 2, Y1 - 30, R, true) + holes(cx, Y1 - 36, 2, R);
    for (let k = 0; k < 7; k++) o += `<g class="fl" style="animation-delay:-${(k * 0.3).toFixed(1)}s"><rect x="${cx - 6 + k * 2}" y="${Y1 - 28 - (k % 3) * 3}" width=".9" height=".9" fill="#14100c"/></g>`;
    T(150, 'torture');
  }
  return o;
}

/* ---------- traces on the walls ---------- */
const TRACE = {
  torture: (x) => [0, 1, 2, 3, 4, 5].map((k) => rect(x - 8 + (k % 3) * 6, Y1 - 46 + Math.floor(k / 3) * 6, 4, 0.7, '#14100c') + (k < 4 ? `<path d="M${x - 8 + (k % 3) * 6} ${Y1 - 45 + Math.floor(k / 3) * 6} l4 -1.6" stroke="#6a0e0a" stroke-width=".6"/>` : '')).join(''),
  note: (x) => rect(x - 3, Y1 - 38, 6, 8, '#e8e0c4') + rect(x - 2, Y1 - 36, 4, 0.5, '#555') + rect(x - 2, Y1 - 34.5, 3.4, 0.5, '#555') + rect(x - 2, Y1 - 33, 4, 0.5, '#555') + rect(x - 0.5, Y1 - 38.6, 1, 1, '#a03030'),
  calendar: (x) => { let o = rect(x - 7, Y1 - 46, 14, 14, '#ece6d2') + rect(x - 7, Y1 - 46, 14, 3, '#a03a2a'); for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { const cx = x - 6 + c * 2.6, cy = Y1 - 42 + r * 3.4; o += r * 5 + c < 11 ? `<path d="M${cx} ${cy} l1.8 2 m0 -2 l-1.8 2" stroke="#b02a20" stroke-width=".45"/>` : rect(cx, cy, 1.8, 2, '#c8c0a8'); } return o; },
  photo: (x) => rect(x - 5, Y1 - 44, 10, 12, '#3a2a1c') + rect(x - 4, Y1 - 43, 8, 10, '#b8a888') + rect(x - 2, Y1 - 41, 4, 4, '#5a4636') + rect(x - 3, Y1 - 37, 6, 3, '#6a5a7a'),
  graffiti: (x) => `<path d="M${x - 16} ${Y1 - 44} l4 -6 l3 7 l4 -8 l3 8 M${x - 2} ${Y1 - 48} l0 9 l5 0 M${x + 6} ${Y1 - 48} l3 9 l3 -9 M${x - 14} ${Y1 - 34} l28 0" stroke="#1a1612" stroke-width="1.1" fill="none" opacity=".85"/>`,
  bandit: (x) => `<path d="M${x - 18} ${Y1 - 46} l5 10 l5 -10 M${x - 6} ${Y1 - 46} l0 10 l6 0 M${x + 3} ${Y1 - 46} l0 10 M${x + 3} ${Y1 - 46} l6 5 l-6 5 M${x - 18} ${Y1 - 31} q18 -4 34 0" stroke="#8a1a14" stroke-width="1.4" fill="none" opacity=".9"/>` + rect(x - 10, Y1 - 31, 1, 6, '#6a1410', 'opacity=".7"') + rect(x + 6, Y1 - 31, 1, 4, '#6a1410', 'opacity=".7"'),
  board: (x) => rect(x - 4, Y1 - 46, 8, 4, '#d8d4c4', 'opacity=".25"'),
  whiteboard: (x) => rect(x - 16, Y1 - 50, 32, 18, '#dcdcd4') + rect(x - 17, Y1 - 51, 34, 1.5, '#7a7f85') + [0, 1, 2, 3].map((k) => rect(x - 13, Y1 - 47 + k * 4, 18 - k * 2, 0.8, '#2a3a8a') + (k < 3 ? `<path d="M${x - 14} ${Y1 - 46.6 + k * 4} l${20 - k * 2} 0" stroke="#c02a20" stroke-width=".6"/>` : '')).join('')
};

/* ---------- room furniture that is only scenery ---------- */
const bunk = (x, c1, c2) => rect(x - 17, Y1 - 40, 2, 40, WOOD) + rect(x + 14, Y1 - 40, 2, 40, WOOD) + rect(x - 16, Y1 - 10, 32, 2, WOOD2) + rect(x - 15, Y1 - 13, 30, 3, '#d8d0b0') + rect(x - 15, Y1 - 13, 21, 3, c1) + rect(x - 16, Y1 - 34, 32, 2, WOOD2) + rect(x - 15, Y1 - 37, 30, 3, '#d8d0b0') + rect(x - 15, Y1 - 37, 21, 3, c2) + rect(x + 8, Y1 - 39, 7, 3, '#efe8d0') + rect(x - 17, Y1 - 41, 34, 1.5, WOOD);
const bed = (x) => rect(x - 16, Y1 - 12, 32, 2, METAL2) + rect(x - 16, Y1 - 10, 1.5, 10, METAL) + rect(x + 14.5, Y1 - 10, 1.5, 10, METAL) + rect(x - 16, Y1 - 20, 1.5, 10, METAL) + rect(x - 15, Y1 - 15, 30, 3, '#e8e4d4') + rect(x - 14, Y1 - 16, 7, 2, '#f4f0e4') + rect(x - 2, Y1 - 14, 10, 2, '#7a1e18', 'opacity=".55"') + rect(x + 18, Y1 - 34, 1, 34, METAL2) + rect(x + 15, Y1 - 34, 7, 1, METAL2) + rect(x + 16, Y1 - 33, 4, 6, '#cfe0e8', 'opacity=".55"');
const chairRow = (x, n) => { let o = ''; for (let i = 0; i < n; i++) { const cx = x + i * 11; o += rect(cx, Y1 - 9, 8, 2, '#6a3a2a') + rect(cx, Y1 - 15, 1.5, 15, '#4a2a1c') + rect(cx + 6.5, Y1 - 7, 1.5, 7, '#4a2a1c') + rect(cx, Y1 - 15, 8, 6, '#7a4a32', 'opacity=".9"'); } return o; };
const desks = (x, n) => { let o = ''; for (let i = 0; i < n; i++) { const dx = x + i * 26; o += rect(dx, Y1 - 13, 20, 2, WOOD2) + rect(dx + 1, Y1 - 11, 1.5, 11, WOOD) + rect(dx + 17.5, Y1 - 11, 1.5, 11, WOOD) + rect(dx + 4, Y1 - 7, 9, 1.5, '#5a3e28') + rect(dx + 4, Y1 - 15, 6, 2, '#d8d0b0', 'opacity=".8"'); } return o; };
const board = (x) => rect(x - 30, Y1 - 50, 60, 26, '#22302a') + rect(x - 32, Y1 - 51, 64, 2, WOOD) + rect(x - 32, Y1 - 25, 64, 2, WOOD) + `<path d="M${x - 24} ${Y1 - 44} l14 0 m-14 5 l22 0 m-22 5 l9 0 M${x + 4} ${Y1 - 43} q8 -4 14 3" stroke="#d8d4c4" stroke-width=".55" fill="none" opacity=".8"/>` + `<text x="${x - 22}" y="${Y1 - 30}" font-size="4" fill="#c84a3a" font-family="monospace" opacity=".85">NO EXAM</text>`;
const sink = (x) => rect(x - 7, Y1 - 24, 14, 5, '#c8c4b4') + rect(x - 6, Y1 - 23, 12, 3, '#8a8676') + rect(x - 1, Y1 - 19, 2, 19, '#9a9686') + rect(x - 0.5, Y1 - 30, 1, 6, METAL2) + rect(x - 5, Y1 - 46, 10, 13, '#8aa0a8', 'opacity=".35"') + rect(x - 5, Y1 - 46, 10, 13, 'none', 'stroke="#5a6266" stroke-width=".6"');
const seats = (x, n) => { let o = ''; for (let i = 0; i < n; i++) { const sx = x + i * 13; o += rect(sx, Y1 - 12, 11, 3, '#7a2a2a') + rect(sx, Y1 - 20, 11, 8, '#8a3a32') + rect(sx + 1, Y1 - 9, 1.5, 9, '#2a1a14') + rect(sx + 8.5, Y1 - 9, 1.5, 9, '#2a1a14') + (i % 3 === 1 ? rect(sx + 2, Y1 - 18, 6, 3, '#4a1a14', 'opacity=".7"') : ''); } return o; };
const table = (x) => rect(x - 18, Y1 - 15, 36, 2.5, '#a8a49a') + rect(x - 16, Y1 - 12.5, 1.5, 12.5, METAL) + rect(x + 14.5, Y1 - 12.5, 1.5, 12.5, METAL) + rect(x - 24, Y1 - 8, 8, 2, '#3a6a8a') + rect(x - 24, Y1 - 6, 1.5, 6, METAL) + rect(x + 16, Y1 - 8, 8, 2, '#3a6a8a') + rect(x + 22.5, Y1 - 6, 1.5, 6, METAL) + rect(x - 6, Y1 - 17, 6, 2, '#e8e4d4');
const stove = (x) => rect(x - 12, Y1 - 16, 24, 16, '#3a3532') + rect(x - 12, Y1 - 16, 24, 2, '#5a5550') + rect(x - 9, Y1 - 20, 7, 4, '#2a2a2a') + rect(x + 2, Y1 - 21, 8, 5, '#4a4a4a') + rect(x - 2, Y1 - 52, 4, 32, '#3a3532', 'opacity=".8"');
const stage = (x) => rect(x - 60, Y1 - 12, 120, 12, '#4a3626') + rect(x - 60, Y1 - 13, 120, 2, '#8a6a46') + rect(x - 60, Y1 - 60, 120, 48, '#3a1414', 'opacity=".55"') + [0, 1, 2, 3, 4, 5, 6, 7].map((k) => rect(x - 60 + k * 15, Y1 - 60, 6, 48, '#5a1a1a', 'opacity=".7"')).join('') + rect(x - 8, Y1 - 24, 2, 12, METAL) + rect(x - 10, Y1 - 25, 6, 2, METAL2);
const car = (x) => rect(x - 26, Y1 - 12, 52, 9, '#2a2420') + rect(x - 16, Y1 - 19, 30, 8, '#2a2420') + rect(x - 14, Y1 - 18, 11, 5, '#14100c') + rect(x + 0, Y1 - 18, 11, 5, '#14100c') + rect(x - 22, Y1 - 9, 8, 3, '#8a4a22', 'opacity=".8"') + `<ellipse cx="${x - 16}" cy="${Y1 - 2}" rx="4.5" ry="4" fill="#0e0b08"/><ellipse cx="${x + 16}" cy="${Y1 - 2}" rx="4.5" ry="4" fill="#0e0b08"/>` + rect(x - 4, Y1 - 34, 5, 14, '#2c2824', 'opacity=".4"');
const fence = (x, w) => { let o = rect(x, Y1 - 28, w, 1.5, '#4a4a4a'); for (let i = 0; i < w; i += 5) o += rect(x + i, Y1 - 28, 0.8, 28, '#4a4a4a', 'opacity=".8"'); return o; };
const lamp = (x) => rect(x, Y1 - 60, 1.6, 60, '#3a3a3a') + rect(x - 6, Y1 - 60, 8, 1.5, '#3a3a3a') + rect(x - 7, Y1 - 59, 4, 2, '#5a5a3a');
const filing = PILE.cabinet;

/* ---------- a room ---------- */
function roomArt(type, x0, R, pal) {
  const a = ART(); let o = ''; const piles = [], hides = []; const at = (dx) => x0 + dx;
  const P = (dx, k) => piles.push({ x: at(dx), k }); const Hd = (dx, k) => hides.push({ x: at(dx), k });
  /* traces: the things people left behind that tell you who they were and what happened here */
  const traces = []; const T = (dx, k) => { traces.push({ x: at(dx), k, room: type }); o2 += TRACE[k] ? TRACE[k](at(dx)) : ''; }; let o2 = '';
  const outside = OUTSIDE.has(type);
  if (!outside) {
    o += rect(x0, Y0, RW, FH, pal.w) + rect(x0, Y0, RW, 5, pal.w2) + rect(x0, Y1 - pal.band, RW, pal.band, pal.p, 'opacity=".85"') + rect(x0, Y1 - pal.band, RW, 1, '#b07a4a');
    for (let k = 0; k < 8; k++) o += rect(x0 + k * 30 + 6, Y0 + 5, 0.6, FH - pal.band - 5, pal.w2, 'opacity=".45"');
    if (a) o += `<g transform="translate(${x0} 0)">${a.wallGrime(R, 0, Y0, Y1, pal)}</g>`;
    if (a && R() < 0.8 && !['stage', 'seats', 'gallery'].includes(type)) o += a.windowArt(at(type === 'wash' ? 196 : 120 + (R() < 0.5 ? -60 : 60)), Y1, 'win', {});
  } else {
    o += rect(x0, Y0 - 40, RW, FH + 40, 'url(#xsky)');
    for (let k = 0; k < 4; k++) { const bx = at(10 + R() * 200), bh = 16 + R() * 34; o += rect(bx, Y1 - bh, 16 + R() * 24, bh, '#2a2830', 'opacity=".75"'); }
  }
  switch (type) {
    case 'dorm': { const c = ['#7a3a3a', '#3a5a7a', '#4a6a3a', '#7a6a3a', '#5a3a6a']; o += bunk(at(40), c[Math.floor(R() * 5)], c[Math.floor(R() * 5)]) + bunk(at(150), c[Math.floor(R() * 5)], c[Math.floor(R() * 5)]); P(78, 'locker'); P(98, 'bag'); Hd(200, 'wardrobe'); o += HIDE.wardrobe(at(200)); if (R() < 0.5) P(120, 'desk'); o += rect(at(60), Y1 - 52, 70, 0.7, '#aaa') + rect(at(70), Y1 - 51, 7, 10, '#a05050') + rect(at(84), Y1 - 51, 6, 8, '#d8d0b0'); break; }
    case 'wash': o += sink(at(30)) + sink(at(56)) + sink(at(82)); if (a) o += a.toilet(at(150), Y1) + a.toilet(at(178), Y1); o += rect(at(136), Y1 - 44, 1.5, 44, '#5a6266') + rect(at(164), Y1 - 44, 1.5, 44, '#5a6266'); P(208, 'bag'); break;
    case 'common': o += table(at(60)) + rect(at(150), Y1 - 22, 34, 18, '#2a2622') + rect(at(152), Y1 - 20, 30, 14, '#1a1a1e'); P(110, 'crate'); P(196, 'shelf'); Hd(222, 'wardrobe'); o += HIDE.wardrobe(at(222)); break;
    case 'lobby': o += rect(at(30), Y1 - 40, 40, 26, '#2a3a32') + `<text x="${at(34)}" y="${Y1 - 30}" font-size="4" fill="#d8d0b0" font-family="monospace" opacity=".7">NOTICES</text>` + rect(at(36), Y1 - 26, 8, 10, '#e8e0c0') + rect(at(50), Y1 - 27, 9, 11, '#e8e0c0'); P(110, 'counter'); Hd(110, 'counter'); P(180, 'crate'); break;
    case 'class': o += board(at(48)) + desks(at(96), 5); P(30, 'desk'); P(210, 'bag'); if (R() < 0.5) P(150, 'crate'); Hd(230, 'under'); break;
    case 'staff': P(40, 'desk'); P(90, 'cabinet'); P(150, 'shelf'); o += rect(at(180), Y1 - 18, 30, 3, WOOD2) + rect(at(190), Y1 - 26, 10, 8, '#d8d0b0'); Hd(215, 'wardrobe'); o += HIDE.wardrobe(at(215)); break;
    case 'office': P(50, 'desk'); P(100, 'cabinet'); P(118, 'cabinet'); o += rect(at(150), Y1 - 44, 30, 22, '#2a2a2e') + rect(at(152), Y1 - 42, 26, 18, '#5a6a5a', 'opacity=".6"'); P(200, 'shelf'); Hd(225, 'under'); break;
    case 'records': for (let k = 0; k < 5; k++) o += filing(at(30 + k * 18)); P(48, 'cabinet'); P(84, 'cabinet'); P(160, 'crate'); P(200, 'shelf'); Hd(225, 'wardrobe'); o += HIDE.wardrobe(at(225)); break;
    case 'board': o += rect(at(40), Y1 - 16, 140, 3, '#5a3a22') + rect(at(44), Y1 - 13, 3, 13, '#3a2416') + rect(at(172), Y1 - 13, 3, 13, '#3a2416') + chairRow(at(50), 10) + rect(at(100), Y1 - 52, 40, 26, '#7a6a4a', 'opacity=".8"'); P(26, 'cabinet'); P(205, 'shelf'); Hd(110, 'under'); break;
    case 'reception': P(70, 'counter'); Hd(70, 'counter'); o += chairRow(at(120), 5); P(200, 'cabinet'); break;
    case 'dispensary': P(40, 'shelf'); P(70, 'shelf'); P(130, 'trolley'); P(190, 'fridge'); o += rect(at(96), Y1 - 16, 22, 16, '#cfcbb7') + rect(at(96), Y1 - 17, 22, 2, '#e8e4d4'); break;
    case 'ward': o += bed(at(40)) + bed(at(110)) + bed(at(180)); o += HIDE.curtain(at(75)); Hd(75, 'curtain'); P(145, 'trolley'); if (R() < 0.6) P(215, 'body'); break;
    case 'theatreroom': o += bed(at(110)) + rect(at(100), Y1 - 60, 20, 4, '#cfcbb7') + rect(at(106), Y1 - 56, 8, 3, '#e8e4c4', 'opacity=".8"'); P(50, 'trolley'); P(170, 'cabinet'); o += HIDE.curtain(at(210)); Hd(210, 'curtain'); break;
    case 'seats': o += seats(at(10), 17); P(60, 'bag'); P(170, 'body'); Hd(120, 'under'); break;
    case 'gallery': o += seats(at(10), 17) + rect(x0, Y1 - 24, RW, 2, '#4a3626'); P(90, 'bag'); P(200, 'crate'); break;
    case 'stage': o += stage(at(130)); P(40, 'crate'); P(215, 'shelf'); Hd(130, 'under'); break;
    case 'backstage': o += rect(at(20), Y1 - 52, 1, 52, '#3a3a3a') + rect(at(20), Y1 - 52, 200, 1, '#3a3a3a'); for (let k = 0; k < 6; k++) o += rect(at(30 + k * 12), Y1 - 50, 8, 26, ['#7a3a3a', '#3a5a7a', '#c8b88a'][k % 3], 'opacity=".85"'); P(130, 'crate'); P(170, 'wardrobe'); Hd(170, 'wardrobe'); o += HIDE.wardrobe(at(170)); P(210, 'bag'); break;
    case 'dining': o += table(at(50)) + table(at(130)); P(90, 'bag'); P(205, 'crate'); Hd(220, 'under'); break;
    case 'kitchen': o += stove(at(40)) + stove(at(70)); P(110, 'pot'); P(150, 'fridge'); P(185, 'shelf'); P(215, 'counter'); Hd(215, 'counter'); break;
    case 'stall': o += `<text x="${at(70)}" y="${Y1 - 50}" font-size="5" fill="#f6b37f" font-family="monospace" opacity=".7">${['MAMA T', 'SUYA SPOT', 'BUKA', 'JOLLOF HUB'][Math.floor(R() * 4)]}</text>` + stove(at(30)); P(90, 'counter'); Hd(90, 'counter'); P(150, 'pot'); P(200, 'shelf'); break;
    case 'caf': o += table(at(40)) + table(at(120)) + table(at(200)); P(80, 'bag'); P(160, 'crate'); Hd(200, 'under'); break;
    case 'field': o += fence(x0, RW) + lamp(at(60)); if (R() < 0.6) o += car(at(160)); P(110, 'bag'); P(200, 'body'); break;
    case 'road': o += lamp(at(40)) + car(at(140)) + fence(at(190), 50); P(100, 'body'); P(200, 'crate'); Hd(140, 'under'); break;
    case 'issue': o += rect(at(30), Y1 - 30, 26, 30, '#4a3626') + [0, 1, 2, 3, 4].map((k) => rect(at(31), Y1 - 29 + k * 6, 24, 5, '#5a4330') + rect(at(41), Y1 - 27 + k * 6, 4, 1.2, '#c8b88a')).join('') + `<text x="${at(70)}" y="${Y1 - 48}" font-size="4.5" fill="#d8d0b0" font-family="monospace" opacity=".6">QUIET PLEASE</text>`; P(110, 'counter'); Hd(110, 'counter'); P(43, 'cabinet'); P(190, 'shelf'); break;
    case 'stacks': for (let k = 0; k < 6; k++) { const sx = at(16 + k * 38); o += rect(sx, Y1 - 46, 26, 46, '#3a2a1c') + [0, 1, 2, 3, 4].map((r) => rect(sx + 1, Y1 - 45 + r * 9, 24, 1.4, '#5a4330') + [0, 1, 2, 3, 4, 5].map((b) => rect(sx + 2 + b * 3.8, Y1 - 44 + r * 9, 2.6, 7, ['#6a3a2a', '#3a4a5a', '#5a5a3a', '#7a6a4a', '#4a3a5a', '#8a7a5a'][(b + r + k) % 6])).join('')).join(''); }
      o += rect(at(100), Y1 - 4, 20, 3, '#c8c0a8') + rect(at(104), Y1 - 6, 10, 2, '#a89a80'); P(29, 'shelf'); P(143, 'shelf'); P(219, 'shelf'); Hd(105, 'under'); break;
    case 'reading': o += [40, 130].map((dx) => rect(at(dx - 34), Y1 - 15, 68, 3, '#6a4a32') + rect(at(dx - 32), Y1 - 12, 2, 12, '#4a3626') + rect(at(dx + 30), Y1 - 12, 2, 12, '#4a3626') + rect(at(dx - 20), Y1 - 26, 14, 11, '#2a2a2e') + rect(at(dx - 19), Y1 - 25, 12, 8, '#1a1c20') + rect(at(dx + 8), Y1 - 26, 14, 11, '#2a2a2e') + rect(at(dx + 9), Y1 - 25, 12, 8, '#1a1c20') + chairRow(at(dx - 30), 5)).join(''); P(70, 'desk'); P(200, 'bag'); Hd(130, 'under'); break;
    case 'pews': for (let k = 0; k < 5; k++) { const px0 = at(14 + k * 44); o += rect(px0, Y1 - 12, 36, 3, '#5a3e28') + rect(px0, Y1 - 22, 36, 3, '#5a3e28') + rect(px0 + 1, Y1 - 22, 2, 22, '#3a2a1c') + rect(px0 + 33, Y1 - 22, 2, 22, '#3a2a1c') + rect(px0 + 10, Y1 - 15, 6, 3, '#2a2a3a'); }
      P(60, 'bag'); P(190, 'bag'); Hd(100, 'under'); break;
    case 'altar': o += rect(at(100), Y1 - 16, 50, 16, '#4a3626') + rect(at(98), Y1 - 18, 54, 3, '#d8d0b0') + rect(at(123), Y1 - 52, 4, 32, '#6a4a32') + rect(at(114), Y1 - 44, 22, 4, '#6a4a32') + rect(at(106), Y1 - 22, 2, 4, '#e8e0c0') + rect(at(142), Y1 - 22, 2, 4, '#e8e0c0') + rect(at(40), Y1 - 52, 28, 22, '#2a2a22') + `<text x="${at(43)}" y="${Y1 - 44}" font-size="5" fill="#d8d0b0" font-family="monospace">231</text><text x="${at(43)}" y="${Y1 - 36}" font-size="5" fill="#d8d0b0" font-family="monospace">117</text>` + rect(at(196), Y1 - 34, 14, 34, '#3a2a1c');
      P(125, 'counter'); Hd(125, 'counter'); P(203, 'cabinet'); break;
    case 'court': o += fence(x0, RW) + lamp(at(R() < 0.5 ? 50 : 190)); for (let k = 0; k < 4; k++) o += rect(at(20 + k * 56), Y1 - 1, 30, 1, '#d8d0b0', 'opacity=".25"'); P(120, 'bag'); if (R() < 0.6) P(200, 'body'); break;
    case 'courtB': o += fence(x0, RW) + rect(at(30), Y1 - 56, 3, 56, '#5a5f66') + rect(at(22), Y1 - 66, 22, 14, '#d8d0b0', 'opacity=".8"') + rect(at(28), Y1 - 52, 10, 1.4, '#c84a2a') + rect(at(207), Y1 - 56, 3, 56, '#5a5f66') + rect(at(199), Y1 - 66, 22, 14, '#d8d0b0', 'opacity=".8"') + rect(at(202), Y1 - 52, 10, 1.4, '#c84a2a') + rect(at(116), Y1 - 4, 8, 4, '#c8642a'); P(80, 'bag'); P(160, 'body'); break;
    case 'courtV': o += fence(x0, RW) + rect(at(60), Y1 - 40, 2, 40, '#5a5f66') + rect(at(180), Y1 - 40, 2, 40, '#5a5f66'); for (let k = 0; k < 6; k++) o += rect(at(62), Y1 - 38 + k * 2.2, 118, 0.5, '#b8b0a0', 'opacity=".7"'); for (let k = 0; k < 24; k++) o += rect(at(62 + k * 5), Y1 - 38, 0.5, 12, '#b8b0a0', 'opacity=".6"'); P(30, 'bag'); P(210, 'body'); break;
    case 'courtF': o += fence(x0, RW) + rect(at(60), Y1 - 30, 2, 30, '#e8e4d4') + rect(at(60), Y1 - 30, 50, 2, '#e8e4d4') + rect(at(108), Y1 - 30, 2, 30, '#e8e4d4'); for (let k = 0; k < 8; k++) o += rect(at(62 + k * 6), Y1 - 28, 0.4, 28, '#b8b0a0', 'opacity=".5"'); for (let k = 0; k < 4; k++) o += rect(at(150), Y1 - 8 - k * 7, 80, 2, '#6a6a62') + rect(at(150 + k * 8), Y1 - 8 - k * 7, 2, 8 + k * 7, '#4a4a44'); P(30, 'bag'); P(200, 'crate'); break;
    case 'gatehouse': o += rect(at(80), Y1 - 40, 60, 40, '#5a5a52') + rect(at(80), Y1 - 42, 60, 3, '#3a3a32') + rect(at(90), Y1 - 34, 18, 12, '#14100c') + rect(at(116), Y1 - 34, 18, 34, '#2a2420') + rect(at(150), Y1 - 22, 80, 3, '#c84a3a') + rect(at(150), Y1 - 22, 8, 3, '#e8e4d4') + rect(at(166), Y1 - 22, 8, 3, '#e8e4d4') + rect(at(182), Y1 - 22, 8, 3, '#e8e4d4'); P(100, 'desk'); P(60, 'crate'); Hd(124, 'wardrobe'); break;
  }
  const TP = { dorm: [[124, 'calendar'], [74, 'note']], wash: [[110, 'graffiti']], common: [[150, 'photo']], lobby: [[50, 'note']], class: [[48, 'board']], staff: [[62, 'note']], office: [[176, 'note']], records: [[140, 'note']], board: [[120, 'photo']], reception: [[130, 'note']], dispensary: [[100, 'note']], ward: [[150, 'whiteboard']], theatreroom: [[150, 'note']], seats: [[100, 'graffiti']], gallery: [[150, 'note']], stage: [[60, 'graffiti']], backstage: [[100, 'photo']], dining: [[150, 'note']], kitchen: [[130, 'board']], stall: [[120, 'note']], caf: [[100, 'graffiti']], field: [[40, 'graffiti']], road: [[60, 'note']], gatehouse: [[100, 'board']] }[type] || [];
  TP.forEach(([dx, k]) => { if (R() < 0.75) T(dx, k); });
  if (R() < 0.22) T(30 + R() * 180, 'bandit');
  if (!outside) o += aftermath(R, x0, type, P, T);
  o += o2;
  if (a) { const g = a.floorGrime(R, Y1); o += `<g transform="translate(${x0} 0)">${g}${outside ? '' : a.cobweb(0, Y0 + 5, 1) + a.cobweb(RW, Y0 + 5, -1)}${R() < 0.3 ? a.skeleton(R() < 0.5 ? 8 : RW - 30, Y1, 1) : ''}${a.critters(R, Y1)}</g>`; }
  piles.forEach((p) => { if (p.k === 'body') { o += PILE.body(p.x, 2 + Math.floor(R() * 12)); return; } if (PILE[p.k] && !(p.k === 'counter' && hides.some((h) => h.x === p.x && h.k === 'counter') && type !== 'kitchen' && type !== 'stall' && type !== 'reception' && type !== 'lobby')) o += PILE[p.k](p.x); });
  hides.forEach((h) => { if (h.k === 'under' && !piles.some((p) => p.x === h.x)) o += HIDE.under(h.x); });
  return { o, piles, hides, traces };
}

/* ---------- a whole floor ---------- */
const DOORW = 18;
function wallArt(bx, pal) {
  /* a wall between two rooms, with a doorway: you can only see through the gap if you are standing in it */
  return rect(bx - 5, Y0, 10, FH - 44, '#2a231a') + rect(bx - 5, Y0, 10, 2, '#3a2e22') + rect(bx - 6, Y1 - 46, 12, 3, '#4a3626') + rect(bx - 6, Y1 - 46, 2, 46, '#3a2e22') + rect(bx + 4, Y1 - 46, 2, 46, '#3a2e22') + rect(bx - 4, Y1 - 43, 8, 43, '#100c08', 'opacity=".55"') + rect(bx - 6, Y1 - 46, 0.8, 46, '#6a5a44');
}
function stairsArt(x, up) {
  let o = rect(x - 17, Y0, 34, FH, '#2c2820') + rect(x - 14, Y0 + 1, 28, FH - 1, '#3d382c');
  const steps = 9, sh = (FH - 4) / steps;
  for (let i = 0; i < steps; i++) { const k = up ? i : steps - 1 - i; const sx = x - 14 + k * (28 / steps), sy = Y1 - (i + 1) * sh; o += rect(sx, up ? sy : Y1 - (steps - i) * sh, 28 / steps + 0.6, up ? Y1 - sy : (steps - i) * sh, i % 2 ? '#4a3a28' : '#3f3123') + rect(sx, up ? sy : Y1 - (steps - i) * sh, 28 / steps + 0.6, 1, '#6d5a3f'); }
  return o + `<path d="M${x - 3} ${Y0 + 10} l3 ${up ? -3 : 3} l3 ${up ? 3 : -3}" stroke="#f6b37f" stroke-width="1" fill="none" opacity=".8"/>`;
}
function exitArt(x) {
  return rect(x - 8, Y1 - 42, 16, 42, '#14281c') + rect(x - 8, Y1 - 42, 16, 2, '#3a9a5a', 'opacity=".8"') + rect(x + 4, Y1 - 22, 2, 2, '#c8a050') + rect(x - 6, Y1 - 50, 12, 5, '#1a3a24') + `<text x="${x - 5}" y="${Y1 - 46.4}" font-size="3.6" fill="#7ae09a" font-family="monospace">EXIT</text>`;
}
function layout(o) {
  /* o = { plan, floors, floor, seed } */
  const R = mulberry((o.seed || 1) + (o.floor || 0) * 977);
  const plan = PLANS[o.plan] ? o.plan : 'corridor'; const types = PLANS[plan](o.floors || 1, o.floor || 0, R);
  const a = ART(); const pal0 = a ? a.roomPal(o.seed || 1, o.floor || 0) : { w: '#b9b08c', w2: '#a39a78', p: '#b9825a', band: 14 };
  let art = ''; const piles = [], hides = [], walls = [], traces = [];
  types.forEach((t, i) => {
    const pal = a ? a.PALS[(a.PALS.indexOf(pal0) + i) % a.PALS.length] : pal0;
    const r = roomArt(t, i * RW, R, pal); art += r.o; piles.push(...r.piles); hides.push(...r.hides); traces.push(...r.traces);
  });
  /* some doorways are locked, some are choked with rubble from the shelling; the furthest rooms are the ones people could not reach */
  const blocks = [];
  for (let i = 1; i < types.length; i++) { const open = OPEN.has(types[i - 1]) && OPEN.has(types[i]); if (!open) { walls.push(i * RW); art += wallArt(i * RW); const r = R(); if (i >= types.length - 2 && r < 0.42) blocks.push({ x: i * RW, kind: r < 0.27 ? 'lock' : 'rubble' }); } else if (R() < 0.15) blocks.push({ x: i * RW, kind: 'rubble' }); }
  const W = types.length * RW; const fl = o.floor || 0, nfl = o.floors || 1; const stairs = [];
  /* stairs are kept clear of furniture: the first room's left end goes down, the last room's right end goes up */
  if (fl > 0) { art += stairsArt(30, false); stairs.push({ x: 30, dir: -1 }); }
  if (fl < nfl - 1) { art += stairsArt(W - 30, true); stairs.push({ x: W - 30, dir: 1 }); }
  if (fl === 0) art += exitArt(12);
  const clear = (x) => x > 50 && x < W - 50 && !stairs.some((s) => Math.abs(s.x - x) < 26);
  const P = piles.filter((p) => clear(p.x)), Hs = hides.filter((h) => clear(h.x));
  /* a ceiling slab and floor slab frame the cutaway */
  art = rect(-40, Y0 - 14, W + 80, 14, '#1a1410') + rect(-40, Y0 - 14, W + 80, 1.5, '#3a2e22') + art + rect(-40, Y1, W + 80, 14, '#2a2018') + rect(-40, Y1, W + 80, 2, '#4a3626') + rect(-40, Y0 - 3, W + 80, 3, '#3a2e22');
  P.forEach((p) => { p.lock = ['locker', 'cabinet', 'desk', 'fridge'].includes(p.k) && R() < 0.32; });
  const Tr = traces.filter((t) => t.x > 40 && t.x < W - 40);
  return { traces: Tr, W, types, walls, blocks, piles: P, hides: Hs, stairs, art, Y0, Y1, outside: types.every((t) => OUTSIDE.has(t)) };
}
/* a locked door in a doorway, a padlock on furniture, a heap of rubble: drawn separately so they can be opened */
function blockArt(x, kind) {
  if (kind === 'lock') return rect(x - 5, Y1 - 44, 10, 44, '#4f3825') + rect(x - 5, Y1 - 44, 10, 1.5, WOOD2) + rect(x - 4, Y1 - 40, 8, 16, '#5a4330') + rect(x - 4, Y1 - 20, 8, 16, '#5a4330') + rect(x + 2, Y1 - 24, 3, 4, '#a0a4a8') + rect(x + 2.6, Y1 - 26, 1.8, 2.2, 'none', 'stroke="#a0a4a8" stroke-width=".6"') + rect(x - 6, Y1 - 31, 12, 1.4, '#7a7f85');
  let o = ''; const bits = [[-14, 6, 10], [-6, 9, 14], [3, 7, 12], [10, 5, 9], [-10, 13, 8], [0, 15, 10], [7, 12, 8], [-3, 21, 9], [4, 19, 7]];
  bits.forEach(([dx, h, w], i) => { o += rect(x + dx - w / 2, Y1 - h - 2, w, h + 2, ['#6a6258', '#7a7064', '#5a5248', '#8a6a52'][i % 4]) + rect(x + dx - w / 2, Y1 - h - 2, w, 1, '#9a9080'); });
  return o + rect(x - 8, Y1 - 30, 2, 12, '#5a5f66', 'transform="rotate(25 ' + x + ' ' + (Y1 - 24) + ')"') + rect(x + 5, Y1 - 26, 1.4, 9, '#5a5f66');
}
function padlock(x, y) { return rect(x - 2, y, 4, 3.5, '#a08a40') + rect(x - 1.4, y - 2.4, 2.8, 2.6, 'none', 'stroke="#a08a40" stroke-width=".7"') + rect(x - 0.4, y + 1, 0.8, 1.2, '#2a2216'); }
function debris(x) { return rect(x - 14, Y1 - 3, 28, 3, '#3a2a1c') + rect(x - 10, Y1 - 5, 6, 2, '#5a4330') + rect(x + 2, Y1 - 6, 9, 2, '#6a4a32') + rect(x - 4, Y1 - 4, 4, 1.5, '#8a6a46'); }
const pileArt = (k, x, age) => (PILE[k] ? PILE[k](x, age) : '');
const PILE_N = { locker: 'Locker', desk: 'Desk', shelf: 'Shelves', crate: 'Crates', bag: 'Bags', fridge: 'Fridge', cabinet: 'Filing cabinet', trolley: 'Trolley', counter: 'Counter', pot: 'Pots', body: 'A body', wardrobe: 'Wardrobe' };
C.Sites = { traceArt: (k, x) => (TRACE[k] ? TRACE[k](x) : ''), blockArt, padlock, debris, pileArt, layout, RW, FH, Y0, Y1, PILE_N, PLANS, STEP: FH + 14 };
if (typeof module !== 'undefined') module.exports = C.Sites;
})(typeof window !== 'undefined' ? window : globalThis);
