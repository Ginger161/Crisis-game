/* CRISIS — the house (v2 view)
   A cross-section of a hostel, 3-6 floors, drawn zoomed out so people are small and rooms are big. Everything is placed from Sim.stations(),
   so the art and the simulation can never disagree about where the stove is. People are animated from Sim.posOf() and their current act.
   There is a window on every floor, and a yard outside the door. What the yard holds is drawn only if somebody is looking out.
   Interaction is delegated: tap a person, tap a station, tap the floor. This file draws; the game decides what taps mean. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const NS = 'http://www.w3.org/2000/svg';
const FH = 64, W = 240, OUT = 30, RIGHT = 34, ROOF = 20, GR = 10, SC = 0.95, STAIRX = 120;
const H = { hooks: {}, root: null, key: '', actors: {}, bub: {} };
const SIM = () => C.Sim, SD = () => C.Side;
const usable = () => typeof document !== 'undefined' && document.createElementNS && document.createElement && typeof document.createElement('div').appendChild === 'function';
function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- geometry ---------- */
let N = 3, VH = 0;
const yb = (f) => VH - GR - f * FH;                       // floor line of floor f
const VX = -OUT, VW = OUT + W + RIGHT;

/* ---------- the static building ---------- */
const WALL = '#b9b08c', WALL2 = '#a39a78', PAINT = '#b9825a', TRIM = '#4a3626', WOOD = '#6a4a32', WOOD2 = '#8a6a46', DARK = '#1d140e';
const rect = (x, y, w, h, f, extra) => `<rect x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" width="${(+w).toFixed(1)}" height="${(+h).toFixed(1)}" fill="${f}"${extra ? ' ' + extra : ''}/>`;
function ghost(x, y, w, h, label) { return `<g class="ghost">${rect(x, y, w, h, 'rgba(246,179,127,.06)', 'stroke="#f6b37f" stroke-opacity=".55" stroke-dasharray="2 2" stroke-width=".7"')}<text x="${x + w / 2}" y="${y + h / 2 + 1.5}" font-size="5" text-anchor="middle" fill="#f6b37f" fill-opacity=".8" font-family="monospace">+</text></g>`; }

let curS = null;
function furniture(id, st, y1, B, G) {
  const x = st.x; let o = '';
  switch (true) {
    case id === 'door': {
      const L = B.barricade || 0;
      o += rect(-5, y1 - 42, 11, 42, '#1b110b') + rect(-5, y1 - 42, 11, 2, WOOD2);
      if (B.doorDmg) o += rect(-4, y1 - 41, 3, 41, '#c8b488', 'opacity=".35"') + `<path d="M-1 ${y1 - 42} L7 ${y1 - 40} L6 ${y1 - 2} L-1 ${y1}" fill="#3a2618"/>` + rect(5, y1 - 26, 3, 1.2, '#14100c') + [[-7, -3], [-9, -1], [-6, -1.5], [9, -2]].map(([dx, dy]) => rect(dx, y1 + dy, 3, 1, '#6a4a32')).join('');
      if (L >= 1) { for (let i = 0; i < 3; i++) o += rect(-8, y1 - 34 + i * 11, 18, 3, i % 2 ? WOOD2 : WOOD) + rect(-8, y1 - 34 + i * 11, 18, 1, '#9a7a52'); }
      if (L >= 2) { o += rect(-2, y1 - 40, 3, 40, WOOD) + rect(2, y1 - 40, 3, 40, WOOD2); o += rect(-8, y1 - 26, 12, 8, '#7a7f85') + rect(-8, y1 - 26, 12, 1, '#a9aeb3'); }
      if (L >= 3) { for (let i = 0; i < 4; i++) o += rect(-22 + (i % 2) * 6, y1 - 6 - i * 4, 12, 4, '#a99468') + rect(-22 + (i % 2) * 6, y1 - 6 - i * 4, 12, 1, '#c8b488'); }
      if (B.alarm) o += `<path d="M-4 ${y1 - 46} L22 ${y1 - 42} M10 ${y1 - 44} L10 ${y1 - 36}" stroke="#aaa" stroke-width=".6" fill="none"/>` + rect(8, y1 - 37, 3, 4, '#c8c8c8') + rect(14, y1 - 38, 3, 4, '#c8c8c8');
      o += `<text x="8" y="${y1 - 48}" font-size="4" fill="#f2ebcf" fill-opacity=".6" font-family="monospace">DOOR</text>`;
      return o;
    }
    case id === 'cupboard': {
      const n = Object.values(G.inv || {}).reduce((a, b) => a + b, 0); const lvl = n > 28 ? 3 : n > 14 ? 2 : n > 0 ? 1 : 0;
      o += rect(x - 11, y1 - 40, 22, 40, WOOD) + rect(x - 11, y1 - 40, 22, 2, WOOD2) + rect(x - 10, y1 - 37, 9, 36, '#4f3825') + rect(x + 1, y1 - 37, 9, 36, '#4f3825') + rect(x - 1, y1 - 20, 2, 3, '#c8a050');
      if (B.cupboard) o += rect(x - 14, y1 - 30, 3, 30, WOOD2) + rect(x + 11, y1 - 30, 3, 30, WOOD2);
      for (let i = 0; i < lvl; i++) o += rect(x - 9 + i * 6, y1 - 6, 5, 4, ['#b08a4a', '#7a8a5a', '#8aa0b0'][i]);
      return o;
    }
    case id === 'water': {
      const w = (G.inv && G.inv.water) || 0; const n = Math.min(4, Math.ceil(w / 3));
      for (let i = 0; i < 4; i++) { const c = i < n ? '#3d7ab8' : '#2d4256'; o += rect(x - 13 + i * 7, y1 - 12, 6, 12, c) + rect(x - 13 + i * 7, y1 - 12, 6, 2, '#a8c8e8') + rect(x - 11 + i * 7, y1 - 15, 2, 3, '#222'); }
      return o + `<text x="${x - 11}" y="${y1 - 17}" font-size="3.6" fill="#8ab8e8" fill-opacity=".7" font-family="monospace">WATER</text>`;
    }
    case id === 'filter': return B.filter ? rect(x - 6, y1 - 20, 12, 20, '#5a6a72') + rect(x - 5, y1 - 18, 10, 3, '#8aa8b8') + rect(x - 3, y1 - 12, 6, 8, '#a8c0c8') + rect(x - 1, y1 - 3, 2, 3, '#3d7ab8') : ghost(x - 9, y1 - 22, 18, 22);
    case id === 'bench': return B.bench ? rect(x - 17, y1 - 17, 34, 4, WOOD2) + rect(x - 17, y1 - 17, 34, 1, '#a07a52') + rect(x - 16, y1 - 13, 3, 13, WOOD) + rect(x + 13, y1 - 13, 3, 13, WOOD) + rect(x - 14, y1 - 6, 28, 2, WOOD)   /* top, legs, shelf */
      + rect(x - 15, y1 - 22, 7, 5, '#6a6e74') + rect(x - 16, y1 - 20, 9, 1.5, '#8a8e94') + rect(x - 2, y1 - 19, 9, 2, '#c0a060') + rect(x + 9, y1 - 21, 2, 4, '#a04a3a')   /* a vice, a plank, a tin */
      + rect(x - 15, y1 - 44, 30, 18, '#5a4630') + rect(x - 15, y1 - 44, 30, 1.5, '#7a6040')                                   /* the pegboard */
      + rect(x - 12, y1 - 41, 1.4, 11, '#9aa0a6') + rect(x - 13.5, y1 - 41, 4.5, 3, '#6a6e74')                                /* a hammer */
      + `<path d="M${x - 5} ${y1 - 40} l9 0 l0 3 l-2 2 l-2 -2 l-2 2 l-2 -2 l-1 2z" fill="#b8bcc0"/>` + rect(x - 5, y1 - 42, 3, 2, '#6a3a24')   /* a saw */
      + rect(x + 8, y1 - 41, 1.2, 10, '#9aa0a6') + rect(x + 7, y1 - 41, 3.2, 2, '#c84a2a') : ghost(x - 17, y1 - 44, 34, 44);   /* a screwdriver */
    case id === 'still': return B.still ? rect(x - 8, y1 - 5, 16, 5, '#3a3532') + rect(x - 4, y1 - 4, 8, 2, 'rgb(200,90,30)')   /* a little fire under it */
      + rect(x - 9, y1 - 19, 18, 14, '#b06a3a') + rect(x - 9, y1 - 19, 18, 2, '#d08a52') + rect(x - 9, y1 - 12, 18, 1, '#8a4a22')   /* the copper pot */
      + rect(x - 4, y1 - 25, 8, 6, '#b06a3a') + rect(x - 4, y1 - 25, 8, 1.5, '#d08a52')                                         /* the neck */
      + `<path d="M${x + 4} ${y1 - 23} q10 -3 12 4 q-4 2 0 4 q-4 2 0 4 q-4 2 0 5" stroke="#d08a52" stroke-width="1.4" fill="none"/>`   /* the coil */
      + rect(x + 13, y1 - 8, 8, 8, '#3d7ab8') + rect(x + 15, y1 - 10, 3, 2, '#2d5a8a') : ghost(x - 10, y1 - 26, 30, 26);   /* the jerrycan */
    case id === 'stove': {
      if (!B.stove) return ghost(x - 13, y1 - 26, 26, 26);
      /* waist-high, so a cook can reach the pot: a cut-down drum on legs, a fire door, a pot on the hot plate, a pipe out */
      const cooking = !!(G && G.S && G.S.some((p) => p.act && p.act.k === 'cook' && p.act.walkLeft <= 0));
      o += rect(x - 11, y1 - 4, 2, 4, '#2a2420') + rect(x + 9, y1 - 4, 2, 4, '#2a2420');                                         /* legs */
      o += rect(x - 12, y1 - 17, 24, 13, '#7a3f22') + rect(x - 12, y1 - 17, 24, 2, '#9a5a32') + rect(x - 12, y1 - 7, 24, 1, '#5a2e18');   /* the drum, ribbed */
      o += rect(x - 6, y1 - 14, 12, 8, '#1a0f0a') + rect(x - 6, y1 - 14, 12, 1, '#3a2a20');                                    /* the fire door */
      o += cooking ? rect(x - 4, y1 - 11, 3, 4, 'rgb(255,128,36)', 'class="flame"') + rect(x - 1, y1 - 12, 3, 5, 'rgb(255,196,90)', 'class="flame" style="animation-delay:-.2s"') + rect(x + 2, y1 - 10, 2, 3, 'rgb(255,110,30)', 'class="flame"') : rect(x - 4, y1 - 8, 8, 1.5, 'rgb(150,60,30)');
      o += rect(x - 13, y1 - 19, 26, 2, '#3a3532');                                                                           /* the hot plate */
      o += rect(x - 7, y1 - 26, 12, 7, '#2a2826') + rect(x - 8, y1 - 26, 14, 1.5, '#55524e') + rect(x - 2, y1 - 28, 2, 2, '#55524e');   /* a pot with a lid */
      if (cooking) o += [0, 1, 2].map((i) => `<path class="steam" style="animation-delay:-${i * 0.6}s" d="M${x - 3 + i * 3} ${y1 - 29} q-2 -4 0 -7 q2 -3 0 -6" stroke="#d8d0c0" stroke-width=".8" fill="none" opacity=".5"/>`).join('');
      o += rect(x + 8, y1 - 50, 3, 31, '#4a4540') + rect(x + 8, y1 - 50, 10, 3, '#4a4540');                                    /* the pipe out */
      return o;
    }
    case id === 'table': return rect(x - 18, y1 - 17, 36, 3, WOOD2) + rect(x - 16, y1 - 14, 2, 14, WOOD) + rect(x + 14, y1 - 14, 2, 14, WOOD) + rect(x - 24, y1 - 9, 6, 9, WOOD) + rect(x - 24, y1 - 9, 6, 2, WOOD2) + rect(x + 18, y1 - 9, 6, 9, WOOD) + rect(x + 18, y1 - 9, 6, 2, WOOD2) + rect(x - 6, y1 - 20, 5, 3, '#c8c0a8') + rect(x + 4, y1 - 20, 5, 3, '#c8c0a8');
    case id.indexOf('bunk') === 0: {
      const i = +id.slice(4); if (i % 2 === 1) return '';
      const hasTop = !!(curS && curS['bunk' + (i + 1)]); const c1 = ['#7a3a3a', '#3a5a7a', '#4a6a3a', '#7a6a3a', '#5a3a6a', '#3a6a6a', '#7a4a2a'];
      const col = c1[(i) % 7], col2 = c1[(i + 3) % 7]; const hh = hasTop ? 40 : 12;
      let o = rect(x - 17, y1 - hh, 2, hh, WOOD) + rect(x + 14, y1 - hh, 2, hh, WOOD);
      o += rect(x - 16, y1 - 10, 32, 2, WOOD2) + rect(x - 15, y1 - 13, 30, 3, '#d8d0b0') + rect(x - 15, y1 - 13, 21, 3, col) + rect(x + 8, y1 - 15, 7, 3, '#efe8d0');
      if (hasTop) { o += rect(x - 16, y1 - 34, 32, 2, WOOD2) + rect(x - 15, y1 - 37, 30, 3, '#d8d0b0') + rect(x - 15, y1 - 37, 21, 3, col2) + rect(x + 8, y1 - 39, 7, 3, '#efe8d0') + rect(x - 17, y1 - 41, 34, 1.5, WOOD);
        o += rect(x + 16, y1 - 34, 1, 34, WOOD2) + rect(x + 19, y1 - 34, 1, 34, WOOD2); for (let k = 1; k <= 5; k++) o += rect(x + 16, y1 - k * 6.5, 4, 1, '#a98a62'); }
      return o;
    }
    case id === 'mat': return rect(x - 14, y1 - 2, 28, 2, '#7a2a2a') + rect(x - 12, y1 - 2, 24, 1, '#c8a050') + rect(x - 18, y1 - 24, 8, 10, 'none', 'stroke="#c8a050" stroke-width=".4"');
    case id === 'infirm': return B.infirm ? rect(x - 15, y1 - 10, 30, 2, '#aaa') + rect(x - 15, y1 - 8, 2, 8, '#999') + rect(x + 13, y1 - 8, 2, 8, '#999') + rect(x - 14, y1 - 12, 28, 3, '#f0f0f0') + rect(x - 2, y1 - 11.5, 4, 2, '#c0302a') + rect(x - 1, y1 - 12, 2, 4, '#c0302a') : ghost(x - 17, y1 - 14, 34, 14);
    case id === 'radio': return B.radio ? rect(x - 14, y1 - 14, 28, 2, WOOD2) + rect(x - 12, y1 - 12, 2, 12, WOOD) + rect(x + 10, y1 - 12, 2, 12, WOOD) + rect(x - 8, y1 - 24, 14, 10, '#2a2622') + rect(x - 6, y1 - 22, 6, 6, '#3d5a3a') + rect(x + 2, y1 - 21, 3, 3, '#c8a050') + rect(x - 10, y1 - 40, 1, 16, '#aaa') + rect(x - 14, y1 - 40, 9, 1, '#aaa') : ghost(x - 15, y1 - 24, 30, 24);
    case id === 'tally': {
      const d = G.day || 1; let t = rect(x - 18, y1 - 42, 36, 30, '#2f3b35') + rect(x - 18, y1 - 42, 36, 2, WOOD) + rect(x - 18, y1 - 14, 36, 2, WOOD) + rect(x - 20, y1 - 42, 2, 30, WOOD) + rect(x + 18, y1 - 42, 2, 30, WOOD);
      for (let i = 0; i < Math.min(d, 60); i++) { const gx = x - 15 + (i % 25 / 5 | 0) * 6.5, gy = y1 - 38 + Math.floor(i / 25) * 9; const k = i % 5; if (k < 4) t += rect(gx + k * 1.2, gy, 0.5, 6, '#e8e4d0'); else t += `<path d="M${gx - 0.4} ${gy + 4.5} L${gx + 5} ${gy + 1}" stroke="#e8e4d0" stroke-width=".5"/>`; }
      return t;
    }
    case id === 'garden': return B.garden ? rect(x - 18, y1 - 8, 36, 8, '#5a3d28') + rect(x - 17, y1 - 9, 34, 2, '#3d2a1a') + [-12, -4, 4, 12].map((d, i) => rect(x + d, y1 - 16 - (i % 2) * 3, 1.5, 8 + (i % 2) * 3, '#4a8a3a') + rect(x + d - 2, y1 - 14 - (i % 2) * 3, 5, 2, '#5aa04a')).join('') : ghost(x - 19, y1 - 14, 38, 14);
    case id === 'patch': return B.weed ? rect(x - 18, y1 - 6, 36, 6, '#4a3020') + rect(x - 17, y1 - 7, 34, 1.5, '#3a2416') + [-14, -9, -4, 1, 6, 11, 15].map((d, i) => rect(x + d, y1 - 14 - (i % 3) * 3, 1.2, 8 + (i % 3) * 3, '#3a7a2a') + rect(x + d - 2.5, y1 - 13 - (i % 3) * 3, 6, 1.4, '#4a9a34') + rect(x + d - 1.5, y1 - 16 - (i % 3) * 3, 4, 1.4, '#5aaa40')).join('') : ghost(x - 19, y1 - 16, 38, 16);
    case id === 'brazier': { if (!B.brazier) return B.broken && B.broken.brazier ? wreckArt(x, y1) : ghost(x - 7, y1 - 14, 14, 14); const lit = !!(G && G.fire);
      return rect(x - 6, y1 - 13, 12, 11, '#3a3632') + rect(x - 6, y1 - 13, 12, 1.5, '#5a544c') + rect(x - 5, y1 - 10, 10, 0.8, '#2a2622') + rect(x - 5, y1 - 7, 10, 0.8, '#2a2622') + rect(x - 4, y1 - 2, 1.2, 2, '#2a2622') + rect(x + 3, y1 - 2, 1.2, 2, '#2a2622') + [-3, 0, 3].map((d) => rect(x + d - 0.8, y1 - 12, 1.6, 0.9, lit ? 'rgb(240,100,40)' : '#4a4038')).join('')
        + (lit ? rect(x - 4, y1 - 17, 3, 4, 'rgb(255,128,36)', 'class="flame"') + rect(x - 1, y1 - 19, 3, 6, 'rgb(255,196,90)', 'class="flame" style="animation-delay:-.25s"') + rect(x + 2, y1 - 16, 2.5, 3, 'rgb(255,110,30)', 'class="flame"') + rect(x - 5, y1 - 13, 10, 1.4, 'rgb(255,90,30)') : rect(x - 3, y1 - 14, 6, 1.2, '#6a6058')); }
    case id === 'rack': return B.rack ? rect(x - 12, y1 - 30, 1.5, 30, WOOD) + rect(x + 10, y1 - 30, 1.5, 30, WOOD) + rect(x - 12, y1 - 30, 24, 1.5, WOOD2) + rect(x - 12, y1 - 20, 24, 1, WOOD2) + [-9, -5, -1, 3, 7].map((d, i) => rect(x + d, y1 - 29, 2.5, 7 + (i % 2) * 2, i % 2 ? '#5a7a3a' : '#7a8a3a') + rect(x + d, y1 - 19, 2.5, 6, '#8a7a3a')).join('') : ghost(x - 13, y1 - 30, 26, 30);
    case id === 'roof': return B.bucket ? rect(x - 8, y1 - 16, 16, 16, '#3a5a8a') + rect(x - 8, y1 - 16, 16, 2, '#6a8ab8') + rect(x - 10, y1 - 10, 20, 1.5, '#222') + rect(x - 3, y1 - 40, 6, 24, 'rgba(120,160,200,.2)') : ghost(x - 11, y1 - 18, 22, 18);
  }
  return '';
}
const WINDOWS = {};
function windowArt(x, y1, kind, B) {
  const w = 28, h = 28, y = y1 - 52, x0 = x - w / 2;
  let o = rect(x0 - 2, y - 2, w + 4, h + 4, TRIM) + rect(x0, y, w, h, 'url(#sky)');
  o += rect(x0 + 3, y + h - 6, 7, 6, '#8a8f98', 'opacity=".55"') + rect(x0 + 13, y + h - 9, 9, 9, '#9a9088', 'opacity=".5"') + rect(x0 + 5, y + h - 8, 1.5, 1.5, '#e8e4d0', 'opacity=".6"');
  o += rect(x0 + 2, y + 2, 2, h - 4, '#ffffff', 'opacity=".18"');
  /* net curtain, drawn across a quarter of the pane */
  o += rect(x0, y, w, h, '#4a4030', 'opacity=".3"');
  const v = (x * 7 | 0) % 3; if (v === 2) o += rect(x0 + 14.5, y + 0.5, 12.5, 9, '#14100c', 'opacity=".88"') + `<path d="M${x0 + 3} ${y + 3} l7 7 m-2 -9 l4 8 m4 -2 l-8 -1" stroke="#ece8dc" stroke-width=".3" opacity=".7" fill="none"/>`; else if (v === 1) o += rect(x0 + 8, y + 12, 1.6, 1.6, '#14100c') + `<path d="M${x0 + 8.8} ${y + 12.8} l-4 -3 m4 3 l4 -2 m-4 2 l1 5 m-1 -5 l-4 2" stroke="#ece8dc" stroke-width=".3" opacity=".75" fill="none"/>`;
  if (!B.curtains) o += rect(x0, y, 7, h, '#f2ebcf', 'opacity=".42"') + rect(x0 + 2, y, 0.6, h, '#f2ebcf', 'opacity=".5"');
  /* burglar-proof: vertical bars and two rails, the way every hostel window here has them */
  for (let i = 0; i <= 6; i++) o += rect(x0 + 1.5 + i * 4.2, y, 1, h, '#23242a');
  o += rect(x0, y + 9, w, 1, '#23242a') + rect(x0, y + 19, w, 1, '#23242a');
  o += rect(x0 - 3, y + h + 2, w + 6, 2.5, WOOD2) + rect(x0 - 3, y + h + 2, w + 6, 0.8, '#a98a62');
  if ((x * 7 | 0) % 3 === 0) o += rect(x0 + w - 8, y + h - 3, 5, 5, '#8a5a3a') + rect(x0 + w - 7, y + h - 7, 3, 4, '#4a8a3a'); else if ((x * 7 | 0) % 3 === 1) o += rect(x0 + 4, y + h + 0.5, 3, 2, '#c8c0a8');
  if (/^win\d/.test(kind) && B.junk) { if (!(B.boards || {})[kind]) { o += `<path d="M${x0} ${y} L${x0 + 9} ${y + 6} L${x0 + 5} ${y + 13} L${x0 + 15} ${y + 9} L${x0 + 12} ${y + 20} L${x0 + w} ${y + 14} L${x0 + w} ${y} Z" fill="#0c0a10" opacity=".85"/>` + rect(x0 + 2, y + h + 3.2, 3, 0.8, '#c8d8e0', 'opacity=".7"') + rect(x0 + 9, y + h + 3.4, 2, 0.6, '#c8d8e0', 'opacity=".7"') + rect(x0 + 19, y + h + 3.2, 4, 0.8, '#c8d8e0', 'opacity=".6"'); } else { for (let k = 0; k < 4; k++) o += rect(x0 - 2, y + 2 + k * 7, w + 4, 4.5, k % 2 ? WOOD2 : WOOD) + rect(x0 - 2, y + 2 + k * 7, w + 4, 0.8, '#a98a62') + rect(x0 + 2, y + 3.5 + k * 7, 0.9, 0.9, '#2a2216') + rect(x0 + w - 3, y + 3.5 + k * 7, 0.9, 0.9, '#2a2216'); } }
  if (B.curtains) o += rect(x0 - 1, y - 1, w + 2, h + 2, '#16111e', 'opacity=".93"') + [4, 9, 14, 19, 24].map((d) => rect(x0 + d, y - 1, 0.7, h + 2, '#2a2236', 'opacity=".8"')).join('');
  return o;
}

/* ---------- grime: cracks, peeling paint, bullet holes, blood, litter, bones, webs, critters ---------- */
const noStairs = (R, lo, hi) => { for (let i = 0; i < 8; i++) { const x = lo + R() * (hi - lo); if (Math.abs(x - STAIRX) > 22) return x; } return lo; };
const ell = (cx, cy, rx, ry, f, op) => `<ellipse cx="${(+cx).toFixed(1)}" cy="${(+cy).toFixed(1)}" rx="${(+rx).toFixed(1)}" ry="${(+ry).toFixed(1)}" fill="${f}" opacity="${op || 1}"/>`;
const MOLD = ['#2f3a22', '#3d4a2a', '#222c18', '#566a3a', '#14180f', '#6b7d4a'];
function mold(R, x, y, w, h, n, o) {
  let s = ''; for (let i = 0; i < n; i++) { const px = x + R() * w, py = y + R() * h, sz = 0.8 + R() * 1.8; s += rect(px, py, sz, sz * (0.7 + R() * 0.8), MOLD[Math.floor(R() * MOLD.length)], `opacity="${(0.35 + R() * 0.55).toFixed(2)}"`); }
  return s + ell(x + w / 2, y + h / 2, w * 0.45, h * 0.38, '#1c2414', o || 0.22);
}
function wallGrime(R, f, y0, y1, pal) {
  pal = pal || PALS[0]; let o = ''; const stains = [];
  for (let i = 0; i < 2; i++) { const x = noStairs(R, 8, W - 8), w = 3 + R() * 5, h = 14 + R() * 22; stains.push([x, w, h]); o += rect(x, y0 + 5, w, h, '#4a3c24', 'opacity=".24"') + rect(x + w * 0.3, y0 + 5 + h, w * 0.4, 2 + R() * 3, '#4a3c24', 'opacity=".22"'); }
  if (R() < 0.65) o += ell(noStairs(R, 12, W - 12), y0 + 8, 10 + R() * 12, 4 + R() * 4, '#14100c', 0.3);
  /* mold: the ceiling corners, below every water stain, along the skirting, and in a few damp patches */
  o += mold(R, 0, y0 + 4, 22 + R() * 10, 16 + R() * 8, 26, 0.3) + mold(R, W - 28, y0 + 4, 26 + R() * 6, 14 + R() * 8, 22, 0.28);
  stains.forEach(([x, w, h]) => { o += mold(R, x - 4, y0 + 5 + h - 4, w + 8, 12, 16, 0.2); });
  for (let i = 0; i < 2; i++) { const x = noStairs(R, 6, W - 36); o += mold(R, x, y1 - pal.band - 4, 16 + R() * 20, pal.band + 3, 22, 0.24); }
  if (R() < 0.7) { const x = noStairs(R, 10, W - 40); o += mold(R, x, y0 + 14 + R() * 14, 12 + R() * 14, 10 + R() * 10, 18, 0.2); }
  for (let i = 0; i < 2 + (R() < 0.5 ? 1 : 0); i++) { let x = noStairs(R, 8, W - 8), y = y0 + 5 + R() * 18; let d = `M${x.toFixed(1)} ${y.toFixed(1)}`; const n = 4 + Math.floor(R() * 4); for (let k = 0; k < n; k++) { x += (R() - 0.5) * 7; y += 3 + R() * 5; d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; } o += `<path d="${d}" stroke="#2e281e" stroke-width=".75" fill="none" opacity=".9"/>`; }
  /* peeling: sheets of paint hanging off the wall, curled at the bottom, over bare plaster and old brick */
  for (let i = 0; i < 5; i++) {
    const x = noStairs(R, 6, W - 22), w = 8 + R() * 14, top = i < 3 ? y1 - pal.band : y0 + 8 + R() * 18, h = 5 + R() * 12;
    if (R() < 0.45) { o += rect(x, top, w, h + 2, '#7a4a3a'); for (let k = 0; k < Math.ceil((h + 2) / 3); k++) { o += rect(x, top + k * 3, w, 0.5, '#a89a88', 'opacity=".55"'); for (let j = (k % 2) * 3; j < w; j += 6) o += rect(x + j, top + k * 3, 0.5, 3, '#a89a88', 'opacity=".45"'); } }
    else o += rect(x, top, w, h + 2, '#857f6f') + rect(x, top, w, 1, '#58523f');
    const col = i % 2 ? pal.p : pal.w2;
    o += `<path d="M${x.toFixed(1)} ${top.toFixed(1)} L${(x + w).toFixed(1)} ${top.toFixed(1)} L${(x + w - 1).toFixed(1)} ${(top + h * 0.6).toFixed(1)} L${(x + w * 0.55).toFixed(1)} ${(top + h * 0.9).toFixed(1)} L${(x + w * 0.45).toFixed(1)} ${(top + h * 0.5).toFixed(1)} L${x.toFixed(1)} ${(top + h * 0.7).toFixed(1)} Z" fill="${col}" opacity=".95"/>`;
    o += rect(x + w * 0.45, top + h * 0.5, w * 0.12, h * 0.45, '#2a2418', 'opacity=".5"') + rect(x, top + h * 0.7, 1.4, 1.2, '#14100c', 'opacity=".5"');
  }
  for (let i = 0; i < 3; i++) { const x = noStairs(R, 6, W - 14), w = 8 + R() * 14, h = 4 + R() * 9, y = y0 + 6 + R() * 24; o += rect(x, y, w, h, '#8c8672', 'opacity=".8"') + rect(x, y, w, 1, '#58523f', 'opacity=".7"') + rect(x + w * 0.3, y + h, w * 0.4, 1.5, '#8c8672', 'opacity=".7"'); }
  if (R() < 0.85) { const cx = noStairs(R, 12, W - 12), cy = y0 + 16 + R() * 24, n = 3 + Math.floor(R() * 4); for (let k = 0; k < n; k++) { const bx = cx + (R() - 0.5) * 14, by = cy + (R() - 0.5) * 12; o += rect(bx - 1.5, by - 1.5, 3, 3, '#cfc6a4', 'opacity=".5"') + rect(bx - 0.6, by - 0.6, 1.2, 1.2, '#14100c') + `<path d="M${bx.toFixed(1)} ${by.toFixed(1)} l${((R() - 0.5) * 5).toFixed(1)} ${((R() - 0.5) * 5).toFixed(1)}" stroke="#2e281e" stroke-width=".35"/>`; } }
  if (R() < 0.5) { const x = noStairs(R, 10, W - 10), y = y0 + 20 + R() * 16; o += rect(x, y, 2 + R() * 3, 6 + R() * 12, '#45120e', 'opacity=".8"') + rect(x - 1.5, y, 5, 1.5, '#45120e', 'opacity=".65"') + rect(x + R() * 4, y + 12, 1, 3, '#45120e', 'opacity=".7"'); }
  if (R() < 0.4) { const x = noStairs(R, 14, W - 30); o += `<path d="M${x} ${y0 + 26} l6 -5 l5 6 l6 -7 M${x + 3} ${y0 + 33} l9 0" stroke="#7a1e18" stroke-width="1" fill="none" opacity=".75"/>`; }
  return o;
}
function floorGrime(R, y1) {
  let o = '';
  if (R() < 0.65) { const x = noStairs(R, 10, W - 14); o += ell(x, y1 - 0.8, 5 + R() * 7, 1.5, '#45120e', 0.92); if (R() < 0.6) o += `<path d="M${x.toFixed(1)} ${(y1 - 0.8).toFixed(1)} q${(8 + R() * 10).toFixed(1)} -.6 ${(14 + R() * 16).toFixed(1)} .2" stroke="#45120e" stroke-width="1.3" fill="none" opacity=".75"/>`; o += rect(x - 2, y1 - 1.6, 1, 1.6, '#7a1e18', 'opacity=".8"'); }
  for (let i = 0; i < 5; i++) o += rect(noStairs(R, 4, W - 14), y1 - 1, 6 + R() * 12, 1, '#2a2218', 'opacity=".4"');
  const n = 9 + Math.floor(R() * 6);
  for (let k = 0; k < n; k++) {
    const x = noStairs(R, 6, W - 8), r = R();
    if (r < 0.18) o += rect(x, y1 - 3, 2.5, 3, '#8f9298') + rect(x, y1 - 3, 2.5, 0.8, '#cfd3d7');
    else if (r < 0.3) o += rect(x - 1, y1 - 2.2, 3.6, 2.2, '#8f9298') + rect(x + 2.4, y1 - 2.2, 0.8, 2.2, '#cfd3d7');
    else if (r < 0.5) o += rect(x, y1 - 1.2, 3 + R() * 2, 1.2, '#cfcbb7') + (R() < 0.5 ? rect(x + 1, y1 - 2.2, 2, 1, '#bdb9a5') : '');
    else if (r < 0.58) o += rect(x, y1 - 3.5, 1.6, 3.5, '#35624a') + rect(x + 0.3, y1 - 4.6, 0.9, 1.2, '#35624a');
    else if (r < 0.72) o += rect(x, y1 - 1.4, 2.2, 1.4, '#625c52') + rect(x + 2, y1 - 0.9, 1.4, 0.9, '#746e64');
    else if (r < 0.8) o += rect(x, y1 - 0.8, 1.4, 0.8, '#c8a040');
    else if (r < 0.86) o += rect(x, y1 - 0.6, 0.8, 0.6, '#a8c8d8', 'opacity=".8"') + rect(x + 2, y1 - 0.5, 0.8, 0.5, '#a8c8d8', 'opacity=".8"');
    else if (r < 0.92) o += rect(x, y1 - 2, 4, 2, '#2a1e16') + rect(x + 3, y1 - 1.2, 2, 1.2, '#2a1e16');
    else o += rect(x, y1 - 1.6, 6, 1.6, '#54445a', 'opacity=".85"');
  }
  return o;
}
function skeleton(x, y1, d) {
  const iv = '#e2dac2', sh = '#b4ab90'; let o = rect(x - 4, y1 - 1.4, 22, 1.4, '#3c2a18', 'opacity=".55"');
  o += rect(x, y1 - 10, 5, 5, iv) + rect(x, y1 - 6, 5, 1, sh) + rect(x + 0.8, y1 - 8.6, 1.3, 1.5, '#14100c') + rect(x + 3, y1 - 8.6, 1.3, 1.5, '#14100c') + rect(x + 1.2, y1 - 6.4, 3, 0.7, '#14100c', 'opacity=".75"');
  o += rect(x + 2, y1 - 5, 1.3, 4, iv); for (let k = 0; k < 4; k++) o += rect(x - 0.5, y1 - 5 + k * 1.1, 6, 0.7, k % 2 ? sh : iv);
  o += rect(x - 1.5, y1 - 1.8, 7, 1.2, iv) + rect(x + 4, y1 - 1.2, 10, 1.1, iv) + rect(x + 13, y1 - 1.2, 1.2, 1.2, sh) + rect(x + 8, y1 - 2.3, 6, 1, sh) + rect(x + 15, y1 - 0.7, 3, 0.7, iv) + rect(x - 3, y1 - 3, 2, 0.8, iv);
  o += rect(x - 2, y1 - 4, 2, 4, '#6a5a3a', 'opacity=".7"') + rect(x + 14, y1 - 2.8, 2, 2.8, '#7a1e18', 'opacity=".6"');
  return o;
}
function cobweb(x, y, d) {
  const sc = 'rgba(236,236,226,.42)'; let o = '';
  [[18, 0], [15, 9], [9, 15], [0, 18]].forEach(([dx, dy]) => { o += `<path d="M${x} ${y} L${x + d * dx} ${y + dy}" stroke="${sc}" stroke-width=".35"/>`; });
  [7, 12, 17].forEach((r) => { o += `<path d="M${x + d * r} ${y} Q${x + d * r * 0.62} ${y + r * 0.62} ${x} ${y + r}" stroke="${sc}" stroke-width=".3" fill="none"/>`; });
  return o;
}
function toilet(x, y1) {
  let o = rect(x - 9, y1 - 0.9, 18, 0.9, '#2e3a22', 'opacity=".7"');
  o += rect(x - 4, y1 - 21, 8, 11, '#a9a38d') + rect(x - 4, y1 - 21, 8, 1.4, '#7c775f') + rect(x + 4, y1 - 19, 3, 1.2, '#7c775f');
  o += rect(x - 5.5, y1 - 9, 11, 3, '#b8b29c') + rect(x - 4.5, y1 - 6, 9, 6, '#b8b29c') + rect(x - 3.5, y1 - 8.5, 7, 2, '#4a3a20') + rect(x - 5, y1 - 7, 1.1, 7, '#65562e', 'opacity=".8"') + rect(x + 3.5, y1 - 6, 1.1, 6, '#65562e', 'opacity=".8"');
  o += rect(x - 6, y1 - 0.6, 3, 0.6, '#4a1410', 'opacity=".8"') + rect(x + 6, y1 - 3, 3, 3, '#7b6a40') + rect(x + 6.5, y1 - 3.6, 2, 0.7, '#cfcbb7');
  o += `<g class="fl" style="animation-delay:-.4s"><rect x="${x - 1}" y="${y1 - 12}" width=".9" height=".9" fill="#14100c"/></g><g class="fl" style="animation-delay:-1.1s"><rect x="${x + 2}" y="${y1 - 11}" width=".9" height=".9" fill="#14100c"/></g><g class="fl" style="animation-delay:-.8s"><rect x="${x + 5}" y="${y1 - 13}" width=".9" height=".9" fill="#14100c"/></g>`;
  return o;
}
function critters(R, y1) {
  let o = '';
  for (let i = 0; i < 2 + (R() < 0.5 ? 1 : 0); i++) { const x = noStairs(R, 6, W - 40), dx = 14 + R() * 26; o += `<g class="rc" style="--dx:${dx.toFixed(0)}px;animation-duration:${(7 + R() * 7).toFixed(1)}s;animation-delay:-${(R() * 7).toFixed(1)}s">${rect(x, y1 - 1.4, 2.6, 1.2, '#2a180e')}${rect(x + 2.4, y1 - 1.2, 0.9, 0.7, '#3a2414')}${rect(x - 0.4, y1 - 0.5, 0.5, 0.5, '#2a180e')}${rect(x + 1.2, y1 - 0.4, 0.5, 0.4, '#2a180e')}</g>`; }
  if (R() < 0.5) { const x = noStairs(R, 6, W - 70), dx = 40 + R() * 40; o += `<g class="rt" style="--dx:${dx.toFixed(0)}px;animation-duration:${(10 + R() * 8).toFixed(1)}s;animation-delay:-${(R() * 9).toFixed(1)}s">${rect(x, y1 - 3.2, 6, 3, '#4c4640')}${rect(x + 5, y1 - 2.6, 2.4, 1.8, '#5a534c')}${rect(x + 7.2, y1 - 2.2, 0.7, 0.7, '#c0392b')}${rect(x - 5, y1 - 1.2, 5, 0.5, '#6a5a58')}${rect(x + 1, y1 - 0.8, 0.6, 0.8, '#3a3632')}${rect(x + 4, y1 - 0.8, 0.6, 0.8, '#3a3632')}</g>`; }
  for (let i = 0; i < 4; i++) { const x = noStairs(R, 10, W - 10); o += `<g class="fl" style="animation-delay:-${(R() * 2).toFixed(1)}s"><rect x="${x.toFixed(1)}" y="${(y1 - 6 - R() * 18).toFixed(1)}" width=".9" height=".9" fill="#14100c"/></g>`; }
  return o;
}

const FSCALE = { cupboard: 0.8, water: 0.85, bench: 1, still: 1, stove: 1.05, table: 0.78, radio: 0.85, tally: 0.85, garden: 0.85, roof: 0.85, infirm: 0.9, filter: 0.85, mat: 1 };
/* the last residents' junk heaped on the build sites, and rubble on the roof */
/* what blocks a build site. Rubble: a fallen heap of concrete, brick and bent iron, wider than a person and plainly in the way.
   Junk: a pile of broken furniture, a mattress, boxes and a smashed chair. Both are drawn bigger and bolder than the room's clutter. */
function junkArt(x, y1, rubble) {
  let o = `<ellipse cx="${x}" cy="${y1 - 0.5}" rx="24" ry="2.2" fill="#1a140f" opacity=".55"/>`;
  if (rubble) {
    o += `<path d="M${x - 24} ${y1} L${x - 18} ${y1 - 9} L${x - 10} ${y1 - 14} L${x - 2} ${y1 - 21} L${x + 7} ${y1 - 17} L${x + 15} ${y1 - 11} L${x + 22} ${y1 - 5} L${x + 25} ${y1} Z" fill="#6e675d"/>`;   /* the heap */
    o += `<path d="M${x - 18} ${y1 - 9} L${x - 10} ${y1 - 14} L${x - 2} ${y1 - 21} L${x + 7} ${y1 - 17}" stroke="#9a9284" stroke-width="1" fill="none"/>`;
    [[-14, -6, 9, 5, '#8a8478'], [-5, -12, 10, 6, '#7a746a'], [4, -8, 11, 5, '#8e887c'], [12, -4, 9, 4, '#7a746a'], [-20, -3, 7, 3, '#8a8478']].forEach(([dx, dy, w, h, c]) => { o += rect(x + dx, y1 + dy - h, w, h, c) + rect(x + dx, y1 + dy - h, w, 0.8, '#aaa294'); });   /* slabs of concrete */
    [[-9, -4], [0, -3], [9, -2], [-3, -15], [16, -7]].forEach(([dx, dy], k) => { o += rect(x + dx, y1 + dy - 3, 5, 3, k % 2 ? '#8a4a32' : '#9a5a3a') + rect(x + dx, y1 + dy - 3, 5, 0.6, '#b07050'); });   /* bricks */
    o += `<path d="M${x - 4} ${y1 - 19} l-3 -9 M${x + 2} ${y1 - 18} l4 -10 l2 1 M${x + 9} ${y1 - 15} l6 -6" stroke="#3a3632" stroke-width="1.1" fill="none"/>`;   /* bent iron bars */
    o += [0, 1, 2, 3, 4, 5].map((k) => rect(x - 22 + k * 8, y1 - 1, 2, 1, '#9a9284')).join('');   /* dust and grit */
    return o;
  }
  o += rect(x - 18, y1 - 6, 22, 6, '#a89a7c') + rect(x - 18, y1 - 6, 22, 1.2, '#c8bc9c') + rect(x - 12, y1 - 5, 1, 4, '#8a7c5e');   /* a stained mattress */
  o += rect(x - 14, y1 - 16, 13, 10, '#6a5034') + rect(x - 14, y1 - 16, 13, 1.5, '#8a6a46') + rect(x - 9, y1 - 12, 3, 2, '#3a2a1c');   /* a box */
  o += rect(x - 1, y1 - 20, 11, 14, '#4a3a5a') + rect(x - 1, y1 - 20, 11, 1.5, '#6a5a7a');   /* a broken locker door */
  o += rect(x + 10, y1 - 10, 12, 10, '#8a8270') + rect(x + 10, y1 - 10, 12, 1.2, '#a8a08c') + rect(x + 12, y1 - 7, 8, 1, '#5a5248');   /* a crate */
  o += `<path d="M${x + 4} ${y1 - 22} l9 -6 m-4 2 l6 3 M${x + 14} ${y1 - 12} l4 -8" stroke="#3a2a1c" stroke-width="1.1"/>` + rect(x - 16, y1 - 22, 7, 5, '#c8c0a8') + rect(x + 17, y1 - 16, 4, 6, '#a8c0c8', 'opacity=".7"');   /* chair legs, papers, a bottle */
  return o;
}
/* what is left of something they smashed: bent metal, a cracked casing, glass */
function wreckArt(x, y1) {
  let o = rect(x - 10, y1 - 4, 9, 4, '#3a3632') + rect(x - 10, y1 - 4, 9, 1, '#5a544c') + `<path d="M${x - 1} ${y1} L${x + 4} ${y1 - 7} L${x + 8} ${y1 - 6} L${x + 6} ${y1}" fill="#4a4440"/>`;
  for (let i = 0; i < 7; i++) o += rect(x - 14 + i * 4.3, y1 - 1 - (i % 3) * 0.6, 1.4 + (i % 2), 0.8, i % 3 ? '#8a8a82' : '#b8c0c8');
  return o + rect(x + 9, y1 - 2.5, 4, 2.5, '#2a2622') + rect(x - 4, y1 - 9, 1, 6, '#5a5550');
}
function siteArt(id, x, y1) {
  let o = '';
  switch (id) {
    case 'stove': o = rect(x - 9, y1 - 7, 15, 7, '#5a4a3a') + rect(x - 9, y1 - 7, 15, 1, '#7a6a52') + rect(x - 3, y1 - 7, 1, 7, '#3a2e22') + rect(x + 6, y1 - 3, 9, 2.4, '#7a7a7a') + rect(x + 12, y1 - 6, 2.4, 6, '#6a6a6a') + rect(x - 15, y1 - 3, 4, 3, '#8a4a3a') + rect(x - 12, y1 - 6, 4, 3, '#8a4a3a') + rect(x - 9, y1 - 3, 3, 3, '#7a3e30'); break;
    case 'bench': o = rect(x - 14, y1 - 2, 22, 2, '#7a5a3a') + rect(x - 13, y1 - 4, 20, 2, '#8a6a46') + rect(x - 12, y1 - 6, 18, 2, '#7a5a3a') + rect(x + 10, y1 - 12, 2, 12, '#6a4a32') + rect(x + 16, y1 - 12, 2, 12, '#6a4a32') + rect(x + 9, y1 - 13, 10, 2, '#8a6a46'); break;
    case 'still': o = rect(x - 7, y1 - 10, 12, 10, '#a86a3a') + rect(x - 7, y1 - 10, 12, 2, '#c8884a') + rect(x + 6, y1 - 6, 8, 1, '#a86a3a') + rect(x + 6, y1 - 4, 8, 1, '#a86a3a') + rect(x + 6, y1 - 2, 8, 1, '#a86a3a'); break;
    case 'radio': o = rect(x - 10, y1 - 4, 8, 4, '#2a2622') + rect(x - 9, y1 - 3, 6, 1, '#c8a040') + rect(x, y1 - 3, 10, 3, '#2f6a3a') + rect(x + 2, y1 - 2, 2, 1, '#c8c8c8') + `<path d="M${x - 2} ${y1 - 2} q4 -6 9 -2 t7 -1" stroke="#b44" stroke-width=".7" fill="none"/>` + rect(x + 11, y1 - 8, 1, 8, '#aaa'); break;
    case 'garden': o = rect(x - 16, y1 - 7, 12, 7, '#6a5a3a') + rect(x - 16, y1 - 7, 12, 1.4, '#8a7a54') + rect(x - 1, y1 - 4, 14, 4, '#4a3320') + rect(x + 14, y1 - 6, 5, 6, '#d8d0b0') + rect(x + 15, y1 - 5, 3, 2, '#4a8a3a'); break;
    case 'roof': o = rect(x - 6, y1 - 11, 12, 11, '#3a5a8a') + rect(x - 6, y1 - 11, 12, 2, '#6a8ab8') + rect(x + 8, y1 - 5, 6, 5, '#a8a8a8') + rect(x + 9, y1 - 7, 4, 2, '#cfcfcf'); break;
    case 'filter': o = rect(x - 7, y1 - 9, 8, 9, '#b09060') + rect(x - 7, y1 - 9, 8, 1.4, '#cfb07a') + rect(x + 3, y1 - 6, 6, 6, '#222') + rect(x + 3, y1 - 6, 6, 1, '#555') + rect(x + 1, y1 - 2, 8, 2, '#d8d0b0'); break;
    case 'infirm': o = rect(x - 15, y1 - 3, 26, 3, '#cfc8b0') + rect(x - 15, y1 - 4, 8, 1, '#e8e2cc') + rect(x + 12, y1 - 14, 7, 11, '#d8d0b0') + rect(x + 14.5, y1 - 12, 2, 7, '#c0302a') + rect(x + 12.5, y1 - 9.5, 6, 2, '#c0302a'); break;
    default: o = rect(x - 8, y1 - 8, 16, 8, '#6a5a44');
  }
  return `<g class="site">${o}</g>`;
}
function hitBox(s, y1, y0) {
  const x = s.x, id = s.id;
  if (id === 'stairs') return [x - 18, y0, 36, FH];
  if (s.up) return [x - 15, y1 - s.up - 18, 30, 16];
  if (/^bunk/.test(id)) return [x - 15, y1 - 18, 30, 18];
  if (/^win|^post$/.test(id)) return [x - 15, y1 - 54, 30, 30];
  const T = { door: [-24, -46, 22, 46], cupboard: [-10, -34, 20, 34], water: [-10, -14, 20, 14], filter: [-8, -18, 16, 18], bench: [-13, -20, 26, 20], still: [-8, -20, 16, 20], stove: [-9, -24, 18, 24], table: [-16, -16, 32, 16], mat: [-14, -8, 28, 8], infirm: [-15, -14, 30, 14], radio: [-12, -22, 24, 22], tally: [-17, -36, 34, 28], garden: [-17, -14, 34, 14], roof: [-10, -18, 20, 18] };
  const t = T[id] || [-10, -24, 20, 24]; return [x + t[0], y1 + t[1], t[2], t[3]];
}
/* the lowest strip of every floor always means "walk here"; furniture only answers above it */
const BAND = 7;
function hitBoxClipped(s, y1, y0) { let [bx, by, bw, bh] = hitBox(s, y1, y0); const bottom = y1 - BAND; if (by + bh > bottom) { bh = bottom - by; if (bh < 10) { by = bottom - 10; bh = 10; } } return [bx, by, bw, bh]; }
const DECOR = [
  (x, y, R) => rect(x - 7, y - 9, 14, 9, '#8a6a46') + rect(x - 7, y - 9, 14, 2, '#a98a62') + rect(x - 7, y - 5, 14, 1, '#5a4330'),                            // crate
  (x, y, R) => rect(x - 6, y - 12, 12, 12, '#3a4a6a') + rect(x - 6, y - 12, 12, 2, '#5a6a8a') + rect(x - 1, y - 15, 2, 3, '#222'),                                // suitcase
  (x, y, R) => rect(x - 5, y - 2, 4, 2, '#222') + rect(x + 1, y - 2, 4, 2, '#3a2a1a') + rect(x - 8, y - 2, 3, 2, '#6a3a2a'),                                      // shoes
  (x, y, R) => rect(x - 8, y - 30, 16, 22, '#2a2622') + rect(x - 7, y - 29, 14, 20, '#e8e0c0') + rect(x - 4, y - 25, 8, 6, '#a0603a') + rect(x - 4, y - 18, 8, 1, '#444'),   // poster/photo
  (x, y, R) => rect(x - 10, y - 26, 20, 2, WOOD2) + rect(x - 9, y - 24, 2, 4, WOOD) + rect(x + 7, y - 24, 2, 4, WOOD) + rect(x - 6, y - 30, 4, 4, '#b08a4a') + rect(x + 1, y - 29, 4, 3, '#8aa0b0'),   // shelf
  (x, y, R) => rect(x - 12, y - 34, 24, 0.8, '#aaa') + rect(x - 10, y - 33, 6, 10, '#a05050') + rect(x - 2, y - 33, 5, 8, '#d8d0b0') + rect(x + 5, y - 33, 5, 11, '#5a7a9a'),    // clothesline
  (x, y, R) => rect(x - 4, y - 9, 8, 9, '#3a5a7a') + rect(x - 4, y - 9, 8, 1, '#7a9aba'),                                                                        // bucket
  (x, y, R) => rect(x - 1, y - 14, 2, 14, '#5a4a3a') + rect(x - 6, y - 18, 12, 5, '#4a8a3a') + rect(x - 3, y - 22, 7, 4, '#5aa04a'),                               // plant, still alive
  (x, y, R) => rect(x - 3, y - 6, 6, 6, '#c8a050') + rect(x - 1, y - 9, 1.5, 3, '#f0e0a0'),                                                                        // candle on box
  (x, y, R) => rect(x - 8, y - 14, 16, 14, '#3a3a40') + rect(x - 7, y - 13, 14, 11, '#1a1a1e') + rect(x - 5, y - 2, 10, 2, '#555'),                                // dead TV
];
const DYN = new Set(['cupboard', 'water', 'tally', 'brazier', 'stove']);   /* things that change while you watch: the stove lights up and steams when someone cooks */
/* the dead keep their place: their bunk keeps their things and a candle, their photo goes up by the tally, the ones who died here are buried in the yard */
function memorial(G, S) {
  const M = G.mem2 || []; if (!M.length) return ''; let o = ''; const tb = S.tally;
  M.forEach((m, i) => {
    const b = m.bunk && S[m.bunk]; if (b) { const y1 = yb(b.f) - (b.up || 0) - 13; o += rect(b.x - 12, y1 - 2.5, 9, 2.5, '#8a8270') + rect(b.x - 11, y1 - 4, 7, 1.5, '#a09888') + rect(b.x - 1, y1 - 6, 4, 5, '#3a2a1c') + rect(b.x - 0.4, y1 - 5.4, 2.8, 3.6, '#b8a888') + rect(b.x + 6, y1 - 3, 1.6, 3, '#e8e0c0') + rect(b.x + 6.3, y1 - 4.6, 1, 1.5, '#ffb040', 'class="flame"'); }
    if (tb) { const px = tb.x - 18 + (i % 6) * 6.2, py = yb(tb.f) - 11 + Math.floor(i / 6) * 7; o += rect(px, py, 5, 6, '#2a2018') + rect(px + 0.6, py + 0.6, 3.8, 4.8, '#c8b898') + rect(px + 1.6, py + 1.4, 1.8, 1.8, '#6a4a36') + rect(px + 1.2, py + 3.4, 2.6, 1.8, '#5a5a7a'); }
  });
  M.filter((m) => m.home).forEach((m, i) => { const gx = -12 - i * 13, gy = yb(0); o += ell(gx, gy - 1, 6, 2.4, '#4a3a28') + rect(gx - 0.7, gy - 13, 1.4, 12, '#5a4330') + rect(gx - 3.5, gy - 10, 7, 1.3, '#5a4330') + (i % 2 ? rect(gx + 3, gy - 3, 1.2, 2, '#c84a3a') + rect(gx + 2.6, gy - 3.6, 2, 1, '#e86a5a') : ''); });
  return o;
}
function buildDyn(G) { return H.toneSvg(buildDyn0(G)); }
function buildDyn0(G) {
  const B = G.build || {}; const S = SIM().stations(); let d = memorial(G, S);
  DYN.forEach((id) => { const s = S[id]; if (!s) return; const y1 = yb(s.f); const J = B.junk && B.junk[id]; const art = J ? junkArt(s.x, y1, J === 'rubble') : furniture(id, s, y1, B, G); const k = FSCALE[id] || 1; d += k === 1 ? art : `<g transform="translate(${s.x} ${y1}) scale(${k}) translate(${-s.x} ${-y1})">${art}</g>`; });
  return d;
}
function dynKey(G) { const mm = JSON.stringify((G.build || {}).junk || {}).length + '|' + (G.mem2 || []).length + (G.fire ? 'f' : '') + ((G.build || {}).brazier ? 'b' : '') + ((G.build || {}).stove ? 's' : '') + (G.S.some((p) => p.act && p.act.k === 'cook' && p.act.walkLeft <= 0) ? 'c' : ''); const n = Object.values(G.inv || {}).reduce((a, b) => a + b, 0); return [mm, G.day, Math.min(3, Math.floor(n / 14)), Math.min(4, Math.ceil(((G.inv && G.inv.water) || 0) / 3)), (G.build || {}).cupboard].join('|'); }
function refreshDyn(G) { if (!H.dynG) return; const k = dynKey(G); if (k !== H.dynK) { H.dynK = k; H.dynG.innerHTML = buildDyn(G); } }
const GRC = { key: '', wall: [], fl: [] };

/* every room has its own mix of the same cream and orange: lighter, greyer, warmer, a taller dado, or the colours swapped */
const PALS = [
  { w: '#b9b08c', w2: '#a39a78', p: '#b9825a', band: 14 }, { w: '#c2b894', w2: '#aba17c', p: '#c18e5e', band: 12 }, { w: '#aea680', w2: '#979070', p: '#a96f48', band: 20 },
  { w: '#b8ad86', w2: '#a0956f', p: '#cc9a68', band: 10 }, { w: '#b9825a', w2: '#a3704a', p: '#bdb28c', band: 16, swap: true }, { w: '#b4ab85', w2: '#9c9370', p: '#b27a50', band: 26 }
];
function roomPal(seed, f) { const h0 = Math.abs(Math.imul((seed | 0) ^ 0x9e3779b1, 2246822519) >>> 0) % PALS.length; return PALS[(h0 + f * 2 + (f % 2)) % PALS.length]; }
let railOut = '';
function buildStatic(G) {
  let rail = '';
  const B = G.build || {}; const S = SIM().stations(); curS = S; const R = mulberry(G.seed || 1337); const Rg = mulberry((G.seed || 1337) + 4242);
  const gk = (G.seed || 1337) + '|' + N; if (GRC.key !== gk) { GRC.key = gk; GRC.wall = []; GRC.fl = []; }
  let o = '';
  const sky = (G.wx === 'dust' ? ['#8c6e48', '#b08a5a'] : ['#6f6a5e', '#a99f86']);
  o += `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>${[0.8, 0.64, 0.5, 0.4].map((b, i) => `<filter id="dim${i + 1}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${(b * 0.9).toFixed(2)} ${(b * 0.1).toFixed(2)} 0 0 0 ${(b * 0.05).toFixed(2)} ${(b * 0.9).toFixed(2)} ${(b * 0.05).toFixed(2)} 0 0 ${(b * 0.05).toFixed(2)} ${(b * 0.1).toFixed(2)} ${(b * 0.9).toFixed(2)} 0 0 0 0 1 0"/></filter>`).join('')}<radialGradient id="hglow"><stop offset="0" stop-color="#ffb040" stop-opacity=".65"/><stop offset="1" stop-color="#ff9a30" stop-opacity="0"/></radialGradient></defs>`;
  o += rect(VX - 600, -900, VW + 1200, VH + 900, 'url(#sky)');
  /* distant campus skyline, hills and clouds, behind the yard and the house */
  { const Rr = mulberry(55); let x = VX - 600; while (x < VX + VW + 600) { const out = x < 0 || x > W; const w = 14 + Rr() * 26, h = out ? 30 + Rr() * (N * FH * 0.95) : 10 + Rr() * 52; const t = Rr(); o += rect(x, yb(0) - h, w, h, t < 0.5 ? '#6e6658' : t < 0.8 ? '#5e574c' : '#544f52', 'opacity=".62"');
      if (Rr() < 0.5) o += rect(x + w * 0.4, yb(0) - h - 3, w * 0.35, 4, '#a99f86', 'opacity=".9"');
      if (h > 22) for (let k = 0; k < 3; k++) o += rect(x + 3 + k * 6, yb(0) - h + 5 + (k % 2) * 9, 3, 3, '#6a6a78', 'opacity=".45"'); x += w + Rr() * 6; }
    for (let i = 0; i < 9; i++) { const cx = VX - 300 + Rr() * (VW + 600), cy = -60 + Rr() * 90; o += rect(cx, cy, 30 + Rr() * 30, 5, '#ffffff', 'opacity=".5"') + rect(cx + 8, cy - 3, 20, 4, '#ffffff', 'opacity=".4"'); }
    o += `<circle cx="${VX + VW - 24}" cy="14" r="11" fill="#efe2b0" opacity=".22"/><circle cx="${VX + VW - 24}" cy="14" r="6.5" fill="#efe2b0" opacity=".5"/>`;
    [[-20, 0], [60, 0], [150, 0], [262, 0]].forEach(([px], j) => { for (let k = 0; k < 9; k++) o += rect(px + (k % 2 ? 2 : -2) + k * 1.4, yb(0) - 56 - k * 13, 7 + k * 3.4, 15, '#2c2824', `opacity="${(0.52 - k * 0.045).toFixed(2)}"`); });
    for (let c = 0; c < 4; c++) { const cx = VX + 20 + Rr() * (VW - 30), cy = -20 + Rr() * 28; o += `<path d="M${cx.toFixed(1)} ${cy.toFixed(1)} q2.5 -2.4 5 0 q2.5 -2.4 5 0" stroke="#15110e" stroke-width=".9" fill="none"/>`; } }
  o += rect(VX - 600, yb(0), VW + 1200, GR + 900, '#6a5a44') + rect(VX - 600, yb(0), VW + 1200, 2, '#8a7a5a');
  /* yard: fence, gate, a dead tree */
  o += rect(VX + 2, yb(0) - 26, 2, 26, '#555') + rect(VX + 2, yb(0) - 26, 14, 1.5, '#555') + rect(VX + 14, yb(0) - 26, 2, 26, '#555');
  for (let i = 0; i < 6; i++) o += rect(VX + 4 + i * 2, yb(0) - 24, 0.6, 22, '#666');
  o += rect(-30, yb(0) - 34, 3, 34, '#3a2a1c') + rect(-30, yb(0) - 30, 10, 2, '#3a2a1c') + rect(-36, yb(0) - 26, 8, 2, '#3a2a1c');
  /* the building */
  for (let f = 0; f < N; f++) {
    const y1 = yb(f), y0 = y1 - FH;
    const pl = roomPal(G.seed || 1337, f);
    o += rect(0, y0, W, FH, pl.w) + rect(0, y0, W, 5, pl.w2) + rect(0, y1 - pl.band, W, pl.band, pl.p, 'opacity=".85"') + rect(0, y1 - pl.band, W, 1, pl.swap ? '#8a8062' : '#b07a4a') + (pl.band > 18 ? rect(0, y1 - pl.band - 2, W, 1, pl.w2, 'opacity=".6"') : '');
    for (let k = 0; k < 8; k++) o += rect(k * 30 + (f % 2) * 8, y0 + 5, 0.6, FH - pl.band - 5, pl.w2, 'opacity=".45"');      // wall panels
    o += (GRC.wall[f] !== undefined ? GRC.wall[f] : (GRC.wall[f] = wallGrime(Rg, f, y0, y1, pl)));
    o += rect(-6, y0, 6, FH, '#cf9a6c') + rect(W, y0, 6, FH, '#cf9a6c') + rect(-6, y0, 6, 2, '#d98a52') + rect(W, y0, 6, 2, '#d98a52');
    const gap = f > 0;
    if (gap) o += rect(-6, y1, STAIRX - 17 + 6, 3, TRIM) + rect(STAIRX + 17, y1, W - STAIRX - 17 + 6, 3, TRIM); else o += rect(-6, y1, W + 12, 3, TRIM);
  }
  /* roof */
  o += rect(-8, yb(N - 1) - FH - 4, W + 16, 5, '#7a4a30') + rect(-8, yb(N - 1) - FH - 4, W + 16, 1.5, '#a06a48');
  if (B.radio) { const rx = S.radio.x; o += rect(rx - 10, yb(N - 1) - FH - 22, 1, 18, '#aaa') + rect(rx - 14, yb(N - 1) - FH - 22, 9, 1, '#aaa'); }
  /* the stairwell: a dark recess set back in the wall, so the stairs read as a background layer */
  for (let f = 0; f < N - 1; f++) {
    const y1 = yb(f), y0 = y1 - FH; const steps = 9, sh = (FH - 4) / steps;
    o += rect(STAIRX - 17, y0, 34, FH, '#2c2820') + rect(STAIRX - 14, y0 + 1, 28, FH - 1, '#3d382c') + rect(STAIRX - 14, y0 + 1, 28, 9, '#2a261d', 'opacity=".7"');
    o += rect(STAIRX - 17, y0, 3, FH, '#8a8168') + rect(STAIRX - 17, y0, 1, FH, '#a89e80') + rect(STAIRX + 14, y0, 3, FH, '#7a725a') + rect(STAIRX + 16, y0, 1, FH, '#5a5340');
    for (let i = 0; i < steps; i++) { const sx = STAIRX - 14 + i * (28 / steps), sy = y1 - (i + 1) * sh; o += rect(sx, sy, 28 / steps + 0.6, y1 - sy, i % 2 ? '#4a3a28' : '#3f3123') + rect(sx, sy, 28 / steps + 0.6, 1, '#6d5a3f') + rect(sx, sy + 1, 28 / steps + 0.6, 1, '#2a2118', 'opacity=".6"'); }
    { const sl = sh / (28 / steps), rx0 = STAIRX - 14, ry0 = y1 - sh - 12, rTop = y0 + 7; const xEnd = rx0 + (ry0 - rTop) / sl;
      rail += `<path d="M${rx0} ${ry0} L${xEnd.toFixed(1)} ${rTop}" stroke="#16110b" stroke-width="1.3" fill="none"/><path d="M${rx0} ${(ry0 - 0.9).toFixed(1)} L${xEnd.toFixed(1)} ${(rTop - 0.9).toFixed(1)}" stroke="#5a4630" stroke-width=".45" fill="none"/>`;
      for (let i = 0; i < steps; i++) { const bx = rx0 + (i + 0.5) * (28 / steps); if (bx > xEnd) break; const ry = ry0 - (bx - rx0) * sl, sy = y1 - (i + 1) * sh; rail += rect(bx - 0.4, ry, 0.8, Math.max(2, sy - ry), '#16110b'); }
      rail += rect(rx0 - 1.5, ry0 - 1, 2.6, 13, '#1d1710') + rect(rx0 - 1.5, ry0 - 1.6, 2.6, 1, '#5a4630'); }
    o += rect(STAIRX - 14, y1 - 1, 28, 1, '#14100c', 'opacity=".55"');
  }
  /* windows (one per floor) */
  Object.values(S).filter((s) => /^win\d/.test(s.id) || s.id === 'post').forEach((s) => { o += windowArt(s.x, yb(s.f), s.id, B); });
  /* decor, then stations */
  for (let f = 0; f < N; f++) {
    const y1 = yb(f); const used = Object.values(S).filter((s) => s.f === f).map((s) => s.x); const n = 4 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) { const x = 8 + R() * (W - 16); if (used.some((u) => Math.abs(u - x) < 22) || Math.abs(x - STAIRX) < 26) continue; o += DECOR[Math.floor(R() * DECOR.length)](x, y1, R); }
    if (f === 0) o += rect(6, y1 - 3, 8, 3, '#2a2420') + rect(10, y1 - 3, 6, 3, '#4a3a2a');
  }
  Object.values(S).forEach((s) => { if (DYN.has(s.id)) return; const y1 = yb(s.f); const J = B.junk && B.junk[s.id]; const art = J ? junkArt(s.x, y1, J === 'rubble') : s.built === false ? (B.broken && B.broken[s.id] ? wreckArt(s.x, y1) : siteArt(s.id, s.x, y1)) : furniture(s.id, s, y1, B, G); const k = s.built === false ? 1 : (FSCALE[s.id] || 1); o += k === 1 ? art : `<g transform="translate(${s.x} ${y1}) scale(${k}) translate(${-s.x} ${-y1})">${art}</g>`; });
  for (let f = 0; f < N; f++) {
    const y1 = yb(f), y0 = y1 - FH; const used = Object.values(S).filter((s) => s.f === f).map((s) => s.x);
    if (GRC.fl[f] === undefined) { let t = floorGrime(Rg, y1) + cobweb(0, y0 + 5, 1) + cobweb(W, y0 + 5, -1); if (f % 2 === 0 || Rg() < 0.4) { const cands = [60, 90, 150, 190, 40, 205].filter((x) => !used.some((u) => Math.abs(u - x) < 22) && Math.abs(x - STAIRX) > 26); if (cands.length) t += toilet(cands[Math.floor(Rg() * cands.length)], y1); } if (Rg() < 0.45) t += skeleton(Rg() < 0.5 ? 6 : W - 28, y1, 1); t += critters(Rg, y1); GRC.fl[f] = t; }
    o += GRC.fl[f];
  }
  { const gy = yb(0); o += rect(W + 8, gy - 8, 28, 7, '#2a2420') + rect(W + 12, gy - 13, 16, 5, '#2a2420') + rect(W + 14, gy - 12, 5, 3, '#14100c') + rect(W + 21, gy - 12, 5, 3, '#14100c') + rect(W + 10, gy - 6, 6, 3, '#8a4a22', 'opacity=".8"') + rect(W + 26, gy - 5, 4, 2, '#8a4a22', 'opacity=".8"') + ell(W + 14, gy - 1.5, 3.2, 3, '#0e0b08') + ell(W + 31, gy - 1.5, 3.2, 3, '#0e0b08') + rect(W + 16, gy - 20, 3, 8, '#2c2824', 'opacity=".45"') + rect(W + 15, gy - 28, 6, 8, '#2c2824', 'opacity=".3"');
    for (let k = 0; k < 9; k++) o += rect(-26 + k * 3 + (k % 2) * 1.5, gy - 3 - (k % 3), 2.4, 2, k % 3 ? '#1b1815' : '#4a4a3a'); }
  /* the poster knock-spot, behind the table (easter egg lives here) */
  const tb = S.tally; if (tb) o += rect(tb.x + 21, yb(tb.f) - 36, 0.1, 0.1, 'none');
  /* floor labels and hot areas */
  for (let f = 0; f < N; f++) o += `<rect data-fl="${f}" x="0" y="${yb(f) - FH}" width="${W}" height="${FH}" fill="transparent"/>`;
  /* every object can be clicked or tapped from anywhere: whoever you are directing walks over and uses it (you direct everyone, nobody has to stand next to it first) */
  Object.values(S).forEach((s) => { if (s.id !== 'stairs') { const y1 = yb(s.f), bx = hitBox(s, y1, y1 - FH); o += `<rect data-st="${s.id}" x="${bx[0].toFixed(1)}" y="${bx[1].toFixed(1)}" width="${bx[2]}" height="${bx[3]}" fill="transparent"/>`; } });
  railOut = rail;
  return o;
}

/* ---------- actors ---------- */
function poseFor(p, a, pos) {
  if (!p.alive) return 'dead';
  if (pos.climbing) return 'climb';
  if (pos.moving) return p.hp < 30 ? 'limp' : (p.sneak ? 'sneak' : 'walk');
  if (!a) return p.fatigue > 80 ? 'sitfloor' : 'idle';
  switch (a.k) {
    case 'sleep': return a.st === 'post' ? 'sitfloor' : 'sleep';
    case 'rest': return /bunk|infirm/.test(a.st) ? 'sleep' : 'sitfloor';
    case 'eat': return 'sit';
    case 'pray': return 'pray';
    case 'chat': return a.job && (a.job.k === 'comfort' || a.job.sit || a.job.comfort) ? 'sitfloor' : 'idle';   /* sitting with someone: both on the floor */
    case 'life': { const l = a.job && a.job.life; if (l === 'pray') return 'pray'; if (l === 'cry' || l === 'sit') return 'sitfloor'; if (l === 'write') return 'sit'; if (l === 'exercise') return 'jump'; return 'idle'; }
    case 'watch': case 'look': return 'idle';
    case 'build': { const jk = a.job && a.job.k; return jk === 'sort' ? 'sweep' : jk === 'dig' ? 'dig' : 'hammer'; }
    case 'craft': return 'hammer';
    case 'cook': return 'stir';
    default: return 'idle';
  }
}
function dirFor(p, a, pos, f) {
  if (pos.moving) return pos.dir || 1;
  if (a && (a.k === 'look' || a.k === 'watch')) return (a.to.x < STAIRX) ? -1 : 1;
  if (a && a.k === 'chat' && a.job) { const o = H.hooks.person && H.hooks.person(a.job.with); if (o) return o.x >= pos.x ? 1 : -1; }
  /* lying on a bunk or the sick bed: head on the pillow, which is at the right-hand end */
  if (a && (a.k === 'sleep' || a.k === 'rest') && /^bunk|^infirm/.test(a.st || '')) return -1;
  if (a && a.st === 'stove') return a.k === 'cook' ? -1 : 1; if (a && a.st === 'bench') return 1; if (a && a.st === 'table') return -1;
  return p._dir || 1;
}
const groundAdj = (kind, st) => (kind === 'sleep' && /bunk|infirm/.test(st || '') ? 10 : kind === 'sit' ? 0 : 0);
function drawActor(a, p, kind, dir, state, sel, bds) {
  const key = kind + '|' + dir + '|' + state + '|' + (sel ? 1 : 0) + '|' + (bds || []).join(','); if (a.key === key) return; a.key = key;
  const body = SD().place(p.sp, kind, 0, 0, { dir, state, s: SC });
  const mark = sel ? `<path d="M-4 ${-(36 * SC) - 26} L4 ${-(36 * SC) - 26} L0 ${-(36 * SC) - 20} Z" fill="#f6b37f"/><rect x="-5" y="${-(36 * SC) - 12}" width="10" height="2" fill="#f6b37f" opacity=".0"/>` : '';
  const IC = C.Icons; const top = -(36 * SC) - 12; const bd = (bds || []).map((n, i, arr) => { const x = -((arr.length * 10) / 2) + i * 10; return `<rect x="${x - 0.5}" y="${top - 0.5}" width="10" height="10" rx="2" fill="rgba(15,11,8,.8)"/>` + (IC ? IC.svg(n).replace(/<svg class="ic( line)?"/, `<svg x="${x + 0.5}" y="${top + 0.5}" width="8" height="8"`) : ''); }).join('');
  a.body.innerHTML = `<rect x="-11" y="${-36 * SC - 6}" width="22" height="${36 * SC + 8}" fill="transparent" data-p="${p.id}"${sel ? ' pointer-events="none"' : ''}/>` + body + mark + bd;
}
function sync(G) {
  const live = new Set(G.S.filter((s) => s.alive && !s.out && !s.gone).map((s) => s.id));
  Object.keys(H.actors).forEach((id) => { if (!live.has(+id)) { H.actors[id].el.remove(); delete H.actors[id]; } });
  G.S.forEach((p) => {
    if (!live.has(p.id) || H.actors[p.id]) return;
    const el = document.createElementNS(NS, 'g'); el.setAttribute('class', 'actor'); el.dataset.pid = p.id;
    const body = document.createElementNS(NS, 'g'); const bar = document.createElementNS(NS, 'g'); el.appendChild(body); el.appendChild(bar); H.layer.appendChild(el);
    H.actors[p.id] = { el, body, bar, key: '' };
  });
}
function frame(ts) {
  if (!H.root || !H.root.isConnected) { H.raf = null; return; }
  H.raf = requestAnimationFrame(frame);
  const PF = C.Perf; if (PF && !PF.gate(H, ts)) return;
  if (PF) PF.frame(ts);
  draw(ts);
}
function draw(ts) {
  const G = H.hooks.G && H.hooks.G(); if (!G || !H.svg) return;
  const dt = Math.min(0.25, ((ts - (H.last || ts)) / 1000)); H.last = ts;
  if (H.hooks.step) H.hooks.step(dt);
  const frac = SIM().frac ? SIM().frac() : 0;
  sync(G);
  const sel = H.hooks.selected && H.hooks.selected();
  G.S.forEach((p) => {
    const a = H.actors[p.id]; if (!a) return;
    const pos = SIM().posOf(p, frac); const act = p.act;
    const kind = poseFor(p, act, pos); const dir = dirFor(p, act, pos); p._dir = dir;
    const state = H.hooks.stateOf ? H.hooks.stateOf(p) : 'ok';
    drawActor(a, p, kind, dir, state, sel === p.id, H.hooks.badges ? H.hooks.badges(p) : []);
    const y = yb(pos.f) - (pos.up || 0) - (kind === 'sleep' ? 9 : 0); const x = pos.x;
    const dp = pos.depth || 0; const back = dp > 0.02; if (a.back !== back) { a.back = back; (back ? H.layerB : H.layer).appendChild(a.el); }
    { const hide = H.strip && Math.abs(pos.f - H.stripF) > 0.35; if (a.hid !== hide) { a.hid = hide; a.el.style.display = hide ? 'none' : ''; } }
    if (!Number.isFinite(x) || !Number.isFinite(y)) { if (!H.badPos) { H.badPos = 1; try { (window.__errors = window.__errors || []).push('house: no position for ' + p.name + ' act=' + JSON.stringify(p.act && { k: p.act.k, st: p.act.st, label: p.act.label, to: p.act.to, from: p.act.from })); } catch (e) {} } return; }
    const sc = 1 - 0.17 * dp; a.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(3)})`);
    const lvl = dp > 0.02 ? Math.min(4, 1 + Math.floor(dp * 3.999)) : 0; const lite = !!(C.Perf && C.Perf.lite()); if (a.lvl !== lvl || a.lite !== lite) { a.lvl = lvl; a.lite = lite; if (lvl && !lite) { a.el.setAttribute('filter', `url(#dim${lvl})`); a.el.removeAttribute('opacity'); } else { a.el.removeAttribute('filter'); if (lvl) a.el.setAttribute('opacity', (1 - lvl * 0.13).toFixed(2)); else a.el.removeAttribute('opacity'); } }
    /* progress over the head for timed jobs at a station */
    let bar = '';
    if (false && act && act.walkLeft <= 0 && act.total > 6 && /build|cook|craft/.test(act.k)) { const q = act.k === 'build' ? (G.bq || []).find((z) => z.id === act.job.id) : null; const pr = q ? q.prog / Math.max(1, q.need) : 1 - act.left / act.total; bar = `<rect x="-9" y="${-36 * SC - 14}" width="18" height="2.6" fill="#1a1410" stroke="#f2ebcf" stroke-width=".3"/><rect x="-9" y="${-36 * SC - 14}" width="${(18 * clamp(pr, 0, 1)).toFixed(1)}" height="2.6" fill="#7bbf6a"/>`; }
    if (a.barKey !== bar) { a.bar.innerHTML = bar; a.barKey = bar; }
  });
  updateView(G);
  if (!H.dynT || ts - H.dynT > 400) { H.dynT = ts; refreshDyn(G); }
  updateChips(G, ts);
  drawYard(G);
  placeBubbles(G);
  { const S0 = SIM().stations(); const bz = S0.brazier; const gk = G.fire && bz ? bz.f + ':' + bz.x : ''; if (gk !== H.glowK) { H.glowK = gk; H.glow.innerHTML = gk ? `<g class="flame" style="animation-duration:1.4s">${[44, 30, 18].map((r, i) => `<ellipse cx="${bz.x}" cy="${yb(bz.f) - 14}" rx="${r}" ry="${r * 0.6}" fill="#ff9a40" opacity="${[0.09, 0.11, 0.15][i]}"/>`).join('')}</g>` : ''; } }
  const tone = toneOf(G.t); if (tone !== H.tone) { H.tone = tone; H.dark.setAttribute('opacity', tone.toFixed(2)); H.stars.setAttribute('opacity', Math.max(0, (tone - 0.25) * 1.6).toFixed(2)); }
}
const ZOOMW = 176;                                   // how many scene units wide the camera shows: smaller = closer
/* PC: the whole building, always. It fits the part of the stage you can see; when a drawer or a sheet covers the right side,
   the house slides and shrinks into what is left, so nobody it is about goes out of view */
function updateViewPC(G, box) {
  let coverL = box.right;
  const st = H.root.closest && H.root.closest('.stage'); const dr = st && st.querySelector('.drawer'); if (dr) coverL = Math.min(coverL, dr.getBoundingClientRect().left);
  const mb = H.hooks.modalOpen && H.hooks.modalOpen() && document.querySelector('#modal:not(.hidden)'); if (mb) { const l = mb.getBoundingClientRect().left; if (l > box.left + 240 && l < coverL) coverL = l; }
  const visW = Math.max(240, coverL - box.left - 12), padY = 22;
  const s = Math.min(visW / (VW + 8), box.height / (VH + padY * 2));        // screen px per scene unit
  const vw = box.width / s, vh = box.height / s;
  const x0 = VX + VW / 2 - (visW / 2 + 6) / s, y0 = VH / 2 - vh / 2 + 4;
  if (H.vy == null || H.vw == null) { H.vx = x0; H.vy = y0; H.vw = vw; }
  H.vx += (x0 - H.vx) * 0.14; H.vy += (y0 - H.vy) * 0.14; H.vw += (vw - H.vw) * 0.14; const vhh = H.vw * box.height / box.width;
  H.svg.setAttribute('viewBox', `${H.vx.toFixed(1)} ${H.vy.toFixed(1)} ${H.vw.toFixed(1)} ${vhh.toFixed(1)}`);
  H.strip = false; H.pxs = box.width / H.vw;
  H.root.querySelectorAll('.hfl').forEach((b) => { b.style.display = 'none'; });
}
function updateView(G) {
  const box = H.root.getBoundingClientRect(); if (!box.width || !box.height) return;
  if (document.documentElement.classList.contains('pc')) { updateViewPC(G, box); return; }
  H.vw = null;
  const vw = Math.min(VW, H.zoomW || ZOOMW), vh = vw * box.height / box.width;
  const selP = G.S.find((q) => q.id === (H.hooks.selected && H.hooks.selected())); const sp = selP ? SIM().posOf(selP, SIM().frac ? SIM().frac() : 0) : { f: 0, x: 120 };
  const selF = Math.round(sp.f); if (H.lastSelF !== selF) { H.lastSelF = selF; H.focus = null; }
  const f = H.focus != null ? H.focus : sp.f;
  H.strip = vh < FH * 1.7; H.stripF = Math.round(clamp(f, 0, N - 1));   /* a short strip shows one floor: people on the others would be cut in half at the edges */
  /* a sheet open over the house covers its lower part: centre the floor in the part you can still see, so the person the sheet is about stays in view */
  let seen = vh; { const sb = (H.hooks.modalOpen && H.hooks.modalOpen() && document.querySelector('#modal:not(.hidden) .box')) || document.querySelector('.msheet.up'); if (sb) { const top = sb.getBoundingClientRect().top; if (top > box.top + 40 && top < box.bottom) seen = vh * (top - box.top) / box.height; } }
  let y0 = yb(clamp(f, 0, N - 1)) - FH * 0.42 - seen / 2; y0 = clamp(y0, -6, VH - seen + 4); if (seen >= VH + 6) y0 = VH - seen; if (seen === vh && vh >= VH + 6) y0 = VH - vh;
  let x0 = clamp(sp.x - vw / 2, VX, VX + VW - vw);
  if (H.vy == null) { H.vy = y0; H.vx = x0; } H.vy += (y0 - H.vy) * 0.12; H.vx += (x0 - H.vx) * 0.12;
  H.svg.setAttribute('viewBox', `${H.vx.toFixed(1)} ${H.vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
  const many = vh < VH - 10; const up = H.root.querySelector('.hfl.up'), dn = H.root.querySelector('.hfl.dn'); if (up) up.style.display = many ? 'block' : 'none'; if (dn) dn.style.display = many ? 'block' : 'none';
}
function toneOf(t) { const h = (t % 1440) / 60; if (h >= 21 || h < 4.5) return 0.62; if (h >= 19) return 0.12 + (h - 19) * 0.25; if (h < 6.5) return 0.62 - (h - 4.5) * 0.25; return 0; }
/* speech: one bubble at a time, only for people you can see, and only for a few real seconds, whatever the game speed */
function placeBubbles(G) {
  const box = H.root.querySelector('.hbub');
  if (H.hooks.modalOpen && H.hooks.modalOpen()) { Object.keys(H.bub || {}).forEach((k) => { H.bub[k].remove(); delete H.bub[k]; }); H.curBub = null; return; }   /* no speech over an open sheet */ const svg = H.svg; const m = svg.getScreenCTM(); if (!m) return; const host = H.root.getBoundingClientRect(); const now = performance.now();
  const vb = svg.viewBox.baseVal; const sel = H.hooks.selected && H.hooks.selected();
  H.bs = H.bs || {};
  /* start the clock on the first frame a line is seen */
  G.S.forEach((p) => { if (p.bub && p.bub.until > G.t) { const e = H.bs[p.id]; if (!e || e.text !== p.bub.text) H.bs[p.id] = { text: p.bub.text, t0: null }; } });
  let cur = H.curBub && H.bs[H.curBub] && H.bs[H.curBub].t0 && now - H.bs[H.curBub].t0 < 3200 ? H.curBub : null;
  if (!cur && H.curBub) { const e = H.bs[H.curBub]; if (e) { const p0 = G.S.find((q) => q.id === H.curBub); if (p0) p0.bub = null; delete H.bs[H.curBub]; } H.curBub = null; H.bubGap = now + 1400; }
  if (!cur && now >= (H.bubGap || 0)) {
    const vis = G.S.filter((p) => { const e = H.bs[p.id]; if (!e || e.t0 || !H.actors[p.id] || H.actors[p.id].hid) return false; const pos = SIM().posOf(p, 0); return pos.x >= vb.x - 4 && pos.x <= vb.x + vb.width + 4 && yb(pos.f) - 20 >= vb.y && yb(pos.f) <= vb.y + vb.height + 4; });
    vis.sort((a, b) => (a.id === sel ? -1 : 0) - (b.id === sel ? -1 : 0));
    if (vis[0]) { H.curBub = vis[0].id; H.bs[vis[0].id].t0 = now; cur = H.curBub; }
  }
  Object.keys(H.bub).forEach((k) => { if (+k !== cur) { H.bub[k].remove(); delete H.bub[k]; } });
  if (!cur) return;
  const p = G.S.find((q) => q.id === cur); if (!p || !H.actors[p.id]) return; const e = H.bs[cur];
  let b = H.bub[cur]; if (!b) { b = H.bub[cur] = document.createElement('div'); b.className = 'hbubble'; box.appendChild(b); }
  if (b.textContent !== e.text) b.textContent = e.text;
  const pos = SIM().posOf(p, 0); const pt = svg.createSVGPoint(); pt.x = pos.x; pt.y = yb(pos.f) - (pos.up || 0) - 36 * SC - 14; const s = pt.matrixTransform(m);
  const bw = b.offsetWidth || 100; b.style.left = clamp(s.x - host.left, bw / 2 + 4, host.width - bw / 2 - 4) + 'px'; b.style.top = (s.y - host.top) + 'px';
}


/* ---------- floating action buttons: the only way to use or build something ---------- */
const isDirect = (s) => s.built !== false && (/^win\d/.test(s.id) || s.id === 'post' || /^bunk/.test(s.id) || s.id === 'door' || s.id === 'cupboard' || s.id === 'radio');
const CHIPICON = { door: 'door', cupboard: 'bag', bench: 'tools', stove: 'meal', still: 'ogogoro', filter: 'water', radio: 'radio', garden: 'bread', roof: 'water', infirm: 'meds', mat: 'heart', post: 'eye' };
function chipIcon(s) { const G = H.hooks.G && H.hooks.G(); const J = G && G.build && G.build.junk && G.build.junk[s.id]; if (J) return J === 'rubble' ? 'shovel' : 'broom';   /* clearing looks different from building */
  if (isDirect(s)) return null; if (/^win\d/.test(s.id) || s.id === 'post') return 'eye'; if (/^bunk/.test(s.id)) return 'bed'; if (s.built === false) return 'tools'; return CHIPICON[s.id] || null; }
/* how far along the work at a station is (0..1), or null if nobody is working there */
function workAt(G, id) { if (id === 'door' && G.knockUntil && G.knockUntil > G.t) return Math.max(0, Math.min(1, (G.knockUntil - G.t) / Math.max(1, G.knockUntil - (G.knockAt || G.t)))); if (id === 'door') return null; for (const p of G.S) { const a = p.act; if (!p.alive || !a || a.st !== id || !(a.walkLeft <= 0) || !/^(build|craft|cook)$/.test(a.k)) continue; if (a.job && a.job.k === 'build') { const q = (G.bq || []).find((z) => z.id === a.job.id); if (q) return Math.max(0, Math.min(1, q.prog / Math.max(1, q.need))); } return Math.max(0, Math.min(1, 1 - a.left / Math.max(1, a.total))); } return null; }
const REACH = 34;                                  // how close the character you control has to be before something answers to a tap
function activeSet(G) {
  const sel = G.S.find((q) => q.id === (H.hooks.selected && H.hooks.selected())); const set = new Set(); if (!sel || sel.out || !sel.alive) return set;
  const pos = SIM().posOf(sel, 0); const fl = Math.round(pos.f); const S = SIM().stations();
  Object.values(S).forEach((s) => { if (s.f === fl && Math.abs(s.x - pos.x) <= REACH + (s.id === 'cupboard' || s.id === 'door' ? 4 : 0)) set.add(s.id); });
  return set;
}
function chipList(G) {
  const S = SIM().stations(); const act = H.active || new Set();
  const G0 = H.hooks.G && H.hooks.G(); const JK = (G0 && G0.build && G0.build.junk) || {};
  /* junk and rubble always show their marker (they are jobs waiting), like work in progress; everything else answers when you are close */
  const knocking = !!(G0 && G0.knockUntil && G0.knockUntil > G0.t);   /* someone at the door: its marker shows from anywhere, with a ring running down while they wait */
  let c = Object.values(S).filter((s) => (act.has(s.id) || JK[s.id] || (knocking && s.id === 'door') || (G0 && workAt(G0, s.id) !== null)) && (chipIcon(s) || (G0 && workAt(G0, s.id) !== null)));
  let bunks = 0; c = c.filter((s) => { if (/^bunk/.test(s.id)) { bunks++; return bunks <= 2; } return true; });
  if (H.strip) c = c.filter((s) => Math.abs(s.f - H.stripF) < 0.35);   /* the short view shows one floor: its markers only, never the floor above spilling in */
  return c.slice(0, 10);
}
function updateChips(G, ts) {
  const box = H.root.querySelector('.hchips'); if (!box) return;
  if (!H.chipT || ts - H.chipT > 120) {
    H.chipT = ts; H.active = activeSet(G); const S = chipList(G); const JK = (G.build && G.build.junk) || {}; const sig = S.map((s) => s.id + (s.built === false ? 'n' : '') + (JK[s.id] || '')).join(',');
    if (sig !== H.chipSig) { H.chipSig = sig; box.innerHTML = S.map((s) => `<button class="hchip${s.built === false ? ' site' : ''}" data-st="${s.id}" aria-label="${s.label}">${C.Icons ? C.Icons.html(chipIcon(s) || CHIPICON[s.id] || 'tools') : ''}<svg class="hring" viewBox="0 0 48 48" aria-hidden="true"><circle class="rb" cx="24" cy="24" r="21"/><circle class="rf" cx="24" cy="24" r="21" pathLength="100"/></svg></button>`).join(''); H.chipEls = [...box.children].map((el, i) => ({ el, s: S[i] })); if (C.Icons) C.Icons.skin(box); }
    /* a soft pulse around the objects you can tap right now */
    const Sall = SIM().stations(); const hint = [...H.active].map((id) => Sall[id]).filter((s) => s && isDirect(s)).map((s) => { const y1 = yb(s.f), bx = hitBox(s, y1, y1 - FH); return `<rect class="hint" x="${(bx[0] - 1).toFixed(1)}" y="${(bx[1] - 1).toFixed(1)}" width="${bx[2] + 2}" height="${bx[3] + 2}" rx="2" fill="none" stroke="#f6b37f" stroke-width=".9"/>`; }).join('');
    if (hint !== H.hintSig) { H.hintSig = hint; H.hintG.innerHTML = hint; }
    /* the ring round the icon fills as the work goes on, like TWoM */
    (H.chipEls || []).forEach(({ el, s }) => { const w = workAt(G, s.id); const on = w !== null; el.classList.toggle('working', on); const f = el.querySelector('.rf'); if (f) f.style.strokeDashoffset = on ? String(100 - Math.round(w * 100)) : '100'; });
  }
  const m = H.svg.getScreenCTM(); if (!m || !H.chipEls) return; const host = H.root.getBoundingClientRect();
  const pts = H.chipEls.map(({ el, s }) => { const y1 = yb(s.f); const hb = hitBox(s, y1, y1 - FH); const pt = H.svg.createSVGPoint(); pt.x = s.x; pt.y = Math.min(hb[1] - 5, y1 - 44);   /* above head height, never over the person using it */ const q = pt.matrixTransform(m); return { el, x: q.x - host.left, y: q.y - host.top }; });
  /* bubbles never sit on top of each other: spread neighbours at least 50px apart, and keep the whole row on screen */
  /* per row of markers (one floor): spread them at least 50px apart, but squeeze the gap when a crowded floor would not fit, so none is ever pushed off screen */
  const rows = []; pts.slice().sort((a, b) => a.y - b.y).forEach((p) => { const r = rows.find((q) => Math.abs(q[0].y - p.y) < 54); if (r) r.push(p); else rows.push([p]); });
  const lo = 28, hi = host.width - 28;
  rows.forEach((r) => { r.sort((a, b) => a.x - b.x); const gap = r.length > 1 ? Math.min(50, (hi - lo) / (r.length - 1)) : 50; for (let i = 1; i < r.length; i++) if (r[i].x - r[i - 1].x < gap) r[i].x = r[i - 1].x + gap;
    const over = r[r.length - 1].x - hi; if (over > 0) r.forEach((p) => { p.x -= over; }); const under = lo - r[0].x; if (under > 0) r.forEach((p) => { p.x += under; }); r.forEach((p) => { p.x = clamp(p.x, lo, hi); }); });
  /* the short view has floor buttons on the right edge: a marker that would sit under the up button drops just below it, over its own site */
  const upB = H.root.querySelector('.hfl.up'); const ub = upB && upB.offsetParent ? upB.getBoundingClientRect() : null;
  pts.forEach((p) => { let y = Math.max(26, p.y); if (ub && host.left + p.x + 22 > ub.left && host.top + y - 22 < ub.bottom) y = ub.bottom - host.top + 24; p.el.style.left = p.x + 'px'; p.el.style.top = y + 'px'; });
}

/* ---------- yard visitors (only drawn when somebody is looking out) ---------- */
function drawYard(G) {
  const vis = H.hooks.yard ? H.hooks.yard() : []; const key = JSON.stringify(vis.map((v) => [v.id, v.kind, v.x, v.state]));
  if (key === H.yardKey) return; H.yardKey = key;
  H.yard.innerHTML = vis.map((v) => `<g transform="translate(${v.x} ${yb(0)})">${SD().place(v.sp, v.kind || 'idle', 0, 0, { dir: 1, state: v.state || 'ok', s: SC })}</g>`).join('');
}

/* ---------- public ---------- */
H.attach = function (container, G) {
  if (!usable() || !SIM() || !SD()) return;
  N = SIM().floors(); VH = ROOF + N * FH + GR;
  if (!H.root) {
    H.root = document.createElement('div'); H.root.className = 'house';
    H.root.innerHTML = '<div class="hsvg"></div><div class="hchips"></div><div class="hbub"></div><button class="hfl up" data-hfl="1" aria-label="Floor up"></button><button class="hfl dn" data-hfl="-1" aria-label="Floor down"></button>';
    H.root.addEventListener('pointerdown', onTap);
  }
  const bunks = Object.keys(SIM().stations()).filter((k) => k.indexOf('bunk') === 0).length;
  const key = JSON.stringify([G.build, N, bunks, G.wx === 'dust', G.seed]);
  if (key !== H.key || !H.svg) {
    H.key = key; const old = H.layer; H.actors = {}; H.bub = {};
    const staticSvg = H.toneSvg(buildStatic(G));
    H.root.querySelector('.hsvg').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VX} 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges"><g id="hstatic">${staticSvg}</g><g id="hdyn"></g><g id="hhint" pointer-events="none"></g><g id="hactb"></g><g id="hrail">${railOut}</g><g id="hyard"></g><g id="hact"></g><rect id="hhaze" x="${VX - 600}" y="-900" width="${VW + 1200}" height="${VH + 1800}" fill="#5a4c38" opacity=".16" pointer-events="none"/><rect id="hdark" x="${VX - 600}" y="-900" width="${VW + 1200}" height="${VH + 1800}" fill="#060a22" opacity="0" pointer-events="none"/><g id="hstars" opacity="0" pointer-events="none">${Array.from({ length: 14 }, (_, i) => rect(VX + ((i * 37) % VW), 2 + ((i * 11) % 14), 0.8, 0.8, '#f2ebcf')).join('')}</g><g id="hglow" pointer-events="none"></g></svg>`;
    H.svg = H.root.querySelector('svg'); H.layer = H.svg.querySelector('#hact'); H.layerB = H.svg.querySelector('#hactb'); H.dynG = H.svg.querySelector('#hdyn'); H.dynK = null; refreshDyn(G); if (C.Perf && C.Perf.bitmap()) bakeStatic(staticSvg, key); H.hintG = H.svg.querySelector('#hhint'); H.hintSig = null; H.chipSig = null; H.active = new Set(); H.dark = H.svg.querySelector('#hdark'); H.stars = H.svg.querySelector('#hstars'); H.yard = H.svg.querySelector('#hyard'); H.glow = H.svg.querySelector('#hglow'); H.yardKey = null; H.tone = -1;
  }
  if (H.root.parentNode !== container) container.appendChild(H.root);
  if (!H.raf) H.raf = requestAnimationFrame(frame);
};
/* the house that does not move, drawn once into a picture. Until the picture is ready the drawn version shows,
   so nothing flickers. Tap targets (floors, the poster) and the shared filters stay real. */
function bakeStatic(src, key) {
  if (typeof Image === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) return;
  const x0 = VX - 30, y0 = -60, w = VW + 60, h = VH + 90;
  const dpr = Math.min(3, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
  let px = Math.ceil((Math.max(320, (typeof innerWidth !== 'undefined' ? innerWidth : 390)) * dpr) / (H.zoomW || ZOOMW));
  px = Math.max(2, Math.min(px, 7, Math.floor(Math.sqrt(6e6 / (w * h)))));
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${w} ${h}" width="${Math.round(w * px)}" height="${Math.round(h * px)}" shape-rendering="crispEdges">${src}</svg>`;
  const u0 = URL.createObjectURL(new Blob([doc], { type: 'image/svg+xml' })); const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(u0); if (H.key !== key || !H.svg) return;
    try {
      const cv = document.createElement('canvas'); cv.width = Math.round(w * px); cv.height = Math.round(h * px); const cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false; cx.drawImage(img, 0, 0, cv.width, cv.height);
      cv.toBlob((b) => {
        if (!b || H.key !== key || !H.svg) return; const gs = H.svg.querySelector('#hstatic'); if (!gs) return;
        if (H.bakedUrl) URL.revokeObjectURL(H.bakedUrl); H.bakedUrl = URL.createObjectURL(b);
        const defs = gs.querySelector('defs'); const keep = [...gs.querySelectorAll('[data-fl],[data-st]')].map((el) => el.outerHTML).join('');
        const bg = gs.firstElementChild && gs.firstElementChild.nextElementSibling; /* the sky rect, kept as vector beyond the picture's edges */
        const ground = `<rect x="${VX - 600}" y="${yb(0)}" width="${VW + 1200}" height="${GR + 900}" fill="${H.toneSvg('#6a5a44')}"/>`;
        gs.innerHTML = (defs ? defs.outerHTML : '') + (bg ? bg.outerHTML : '') + ground + `<image href="${H.bakedUrl}" x="${x0}" y="${y0}" width="${w}" height="${h}" preserveAspectRatio="none" style="image-rendering:pixelated"/>` + keep;
        H.baked = key;
      }, 'image/png');
    } catch (e) {}
  };
  img.onerror = () => URL.revokeObjectURL(u0);
  img.src = u0;
}
H.reset = function () { H.key = ''; H.svg = null; H.actors = {}; };
H.geom = () => ({ N, FH, W, OUT, VX, VW, VH, yb });
function svgPoint(e) { const pt = H.svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const m = H.svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
function onTap(e) {
  if (!H.svg || !H.hooks.G) return; if (C.paused || (H.hooks.modalOpen && H.hooks.modalOpen())) return;
  e.preventDefault(); try { if (C.Audio) { C.Audio.start(); C.Audio.sfx('tap'); } } catch (x) {}
  const t = e.target; const fl = t.closest && t.closest('[data-hfl]'); if (fl) { const cur = H.focus != null ? H.focus : (H.lastSelF || 0); H.focus = clamp(cur + (+fl.getAttribute('data-hfl')), 0, N - 1); return; }
  /* what is under the finger, top to bottom: a bubble, then an object you are close enough to use, then a person */
  const stack = (document.elementsFromPoint ? document.elementsFromPoint(e.clientX, e.clientY) : [t]);
  const chip = stack.find((el) => el.classList && el.classList.contains('hchip')); if (chip) { H.hooks.tapStation && H.hooks.tapStation(chip.getAttribute('data-st')); return; }
  /* someone standing in front of an object is picked before the object; the selected person lets taps through to what they stand at */
  const pe = stack.find((el) => el.getAttribute && el.getAttribute('data-p')); if (pe) { H.hooks.tapPerson && H.hooks.tapPerson(+pe.getAttribute('data-p')); return; }
  /* any object, from anywhere in the house: whoever you are directing walks over and uses it */
  const obj = stack.find((el) => el.getAttribute && el.getAttribute('data-st') && el.getAttribute('data-st') !== 'tally');
  if (obj) { H.hooks.tapStation && H.hooks.tapStation(obj.getAttribute('data-st')); return; }
  if (stack.some((el) => el.getAttribute && el.getAttribute('data-st') === 'tally') && H.hooks.knock) H.hooks.knock();
  const p = svgPoint(e);
  if (p.x < -4) { H.hooks.tapFloor && H.hooks.tapFloor(0, 8); return; }
  let fl2 = null; const fe = t.closest && t.closest('[data-fl]'); if (fe) fl2 = +fe.getAttribute('data-fl'); else { for (let f = 0; f < N; f++) if (p.y <= yb(f) && p.y > yb(f) - FH) { fl2 = f; break; } }
  if (fl2 !== null && p.x >= -2 && p.x <= W + 2) H.hooks.tapFloor && H.hooks.tapFloor(fl2, clamp(p.x, 8, W - 8));
}
H.draw = draw;
/* the world is drained of colour where it is drawn; people are not, so faces and skin tones stay true */
const TONE = new Map();
function toneHex(hx, amt, br) {
  const k = hx + amt + br; if (TONE.has(k)) return TONE.get(k);
  const n = parseInt(hx.slice(1), 16); let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; const l = 0.3 * r + 0.59 * g + 0.11 * b;
  const tr = l * 1.04, tg = l * 1.0, tb = l * 0.92;   /* a faint warm grey, like charcoal on old paper */
  r = Math.round((r + (tr - r) * amt) * br); g = Math.round((g + (tg - g) * amt) * br); b = Math.round((b + (tb - b) * amt) * br);
  const c = (v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'); const out = '#' + c(r) + c(g) + c(b); TONE.set(k, out); if (TONE.size > 4000) TONE.clear(); return out;
}
H.toneSvg = (svg, amt, br) => String(svg).replace(/#[0-9a-fA-F]{6}/g, (m) => toneHex(m, amt == null ? 0.62 : amt, br == null ? 0.9 : br));
H.contentH = () => VH;
H.art = { rect, mold, wallGrime, floorGrime, skeleton, cobweb, toilet, critters, windowArt, roomPal, PALS, DECOR };
C.House = H;
if (typeof module !== 'undefined') module.exports = H;
})(typeof window !== 'undefined' ? window : globalThis);
