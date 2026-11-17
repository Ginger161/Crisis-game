/* CRISIS — Veritas student and staff ID cards.
   Drawn as SVG: laminated plastic, a printed photo, and whatever has happened to it since. Each person's card looks the same every
   time (its damage is seeded by who they are). Used for the opening, each person's page, and their death. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const K = () => C.Cast;

/* seeded random */
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hashOf = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
let uid = 0;

/* ---------- who is on the card ---------- */
const STATE = { Enugu: 'ENUGU', Ibadan: 'OYO', Kaduna: 'KADUNA', Kano: 'KANO', Onitsha: 'ANAMBRA', Lagos: 'LAGOS', Abeokuta: 'OGUN', Maiduguri: 'BORNO', Nnewi: 'ANAMBRA', Osogbo: 'OSUN', Makurdi: 'BENUE', Awka: 'ANAMBRA', Ilorin: 'KWARA', Owerri: 'IMO', Abuja: 'FCT', Zaria: 'KADUNA', 'Port Harcourt': 'RIVERS', Katsina: 'KATSINA', Calabar: 'CROSS RIVER', Ife: 'OSUN', Sokoto: 'SOKOTO', Gombe: 'GOMBE', Uyo: 'AKWA IBOM', Jos: 'PLATEAU', Nsukka: 'ENUGU', Ilesa: 'OSUN', Ikorodu: 'LAGOS', Bauchi: 'BAUCHI', Aba: 'ABIA', Ogbomosho: 'OYO', Umuahia: 'ABIA', Asaba: 'DELTA', Warri: 'DELTA', Lafia: 'NASARAWA', 'Ado-Ekiti': 'EKITI', 'Benin City': 'EDO' };
const STAFF = /^(Cafeteria staff|Security|Lecturer|Chaplain|Chapel sister|Registrar|Clinic|Midwife|Librarian|Kitchen|Compound|Council secretary)/i;
const FACULTIES = ['ECONOMICS', 'MASS COMMUNICATION', 'ACCOUNTING', 'BIOCHEMISTRY', 'POLITICAL SCIENCE', 'INTERNATIONAL RELATIONS', 'MICROBIOLOGY', 'BUSINESS ADMIN', 'COMPUTER SCIENCE', 'PHILOSOPHY', 'LAW', 'NURSING'];
const BLOOD = [['O+', 50], ['A+', 22], ['B+', 20], ['AB+', 4], ['O−', 2], ['A−', 1], ['B−', 1]];
const NOTES = [
  'If you find this, tell my mother I was not afraid.',
  'Mummy, I am sorry about the fees.',
  'Please do not leave me where they can find me.',
  'Tell Adaeze I kept the ring.',
  'I owe Chuka 2,000. Pay him from my bag.',
  'Bury me facing home.',
  'If I am not breathing, take my shoes. They are good shoes.',
  'Tell my father he was right about this place.',
  'Whoever reads this, I tried.',
  'My blood group is on the front. Please.'
];
const NOTES_OLD = ['Tell my children to stay in the village.', 'My husband does not know where I am. Tell him.', 'The rent for the shop is under the mattress.', 'I was only here for the salary.', 'Bury me with my people.', 'God forgive me for what I did on the stairs.'];
function whoOf(p) {
  const c = (p && p.cid && K() && K().by[p.cid]) || null; const key = (p && (p.cid || p.name)) || 'x'; const r = rng(hashOf(key));
  const raw = (c ? c.name : (p && p.name) || 'Unknown').replace(/^(Mama|Mr\.|Mrs\.|Dr\.|Prof\.|Fr\.|Sr\.|Sgt\.|Cpl\.|Chef|Nurse|Captain|Princess|Small|Alhaji|Hajiya)\s+/i, '');
  const name = raw.split(/\s+/)[0].toUpperCase();
  const role = (c && c.role) || ''; const lv = role.match(/^(.+?),\s*(\d)00L$/);
  const age = (c && c.age) || 21;
  let kind = 'student', fac = '', pos = '';
  if (lv) fac = `${lv[1].toUpperCase().replace(/^MASS COMM$/, 'MASS COMMUNICATION')} · ${lv[2]}00 LEVEL`;
  else if (STAFF.test(role) || age >= 30) { kind = 'staff'; pos = role.toUpperCase() || 'STAFF'; }
  else { const level = Math.max(1, Math.min(5, age - 17)); fac = `${FACULTIES[Math.floor(r() * FACULTIES.length)]} · ${level}00 LEVEL`; }
  let b = r() * 100, bg = 'O+'; for (const [g, w] of BLOOD) { if ((b -= w) < 0) { bg = g; break; } }
  const state = (c && STATE[c.home]) || (c && c.home ? c.home.toUpperCase() : 'FCT');
  const ov = (c && c.ov) || {}; const skin = ov.skin || (p && p.sp && p.sp.skin) || '#6b4429';
  return { key, name, kind, fac, pos, bg, state, note: (kind === 'staff' ? NOTES_OLD : NOTES)[Math.floor(r() * (kind === 'staff' ? NOTES_OLD : NOTES).length)], first: raw.split(/\s+/)[0], face: { sex: (c && c.sex) || 'm', skin, hair: ov.hair || 'short', hairc: ov.hairc || '#0f0b08', head: ov.head || null, headc: ov.headc || '#2f6f55', glasses: !!ov.glasses, shirt: ['#20242c', '#5a4a3a', '#7fb0a0', '#3a4a5e', '#6a3a3a', '#2f6f55', '#c9a43a'][Math.floor(r() * 7)] }, seed: hashOf(key) };
}

/* ---------- the printed photo ---------- */
function photo(id, f, x, y, w, h) {
  const cx = x + w / 2, top = y + h * 0.18;
  let back = '', front = '';
  const longHair = f.sex === 'f' && /braids|weave|twists|bun/.test(f.hair);
  if (f.head === 'hijab' || f.head === 'turban') back = `<path d="M${cx - w * .36} ${y + h * .95} Q${cx - w * .42} ${top - 6} ${cx} ${top - 10} Q${cx + w * .42} ${top - 6} ${cx + w * .36} ${y + h * .95}Z" fill="${f.headc}"/>`;
  else if (f.hair === 'afro') back = `<ellipse cx="${cx}" cy="${top + h * .12}" rx="${w * .34}" ry="${h * .26}" fill="${f.hairc}"/>`;
  else if (longHair) back = `<path d="M${cx - w * .3} ${top + h * .55} Q${cx - w * .34} ${top - 8} ${cx} ${top - 9} Q${cx + w * .34} ${top - 8} ${cx + w * .3} ${top + h * .55}Z" fill="${f.hairc}"/>`;
  if (f.head === 'headtie' || f.head === 'gele') front = `<path d="M${cx - w * .27} ${top + 2} Q${cx} ${top - h * .2} ${cx + w * .27} ${top + 2} Q${cx} ${top - 4} ${cx - w * .27} ${top + 2}Z" fill="${f.headc}"/>`;
  else if (f.head === 'cap' || f.head === 'fila' || f.head === 'hood' || f.head === 'helmet') front = `<path d="M${cx - w * .24} ${top + 4} Q${cx} ${top - h * .1} ${cx + w * .24} ${top + 4}Z" fill="${f.headc}"/>`;
  else if (!longHair && f.head !== 'hijab' && f.head !== 'turban' && f.hair !== 'afro') front = `<ellipse cx="${cx}" cy="${top + 4}" rx="${w * .25}" ry="${h * (f.hair === 'fade' ? .1 : .08)}" fill="${f.hairc}"/>`;
  return `<g filter="url(#${id}-soft)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-studio)"/>
    <path d="M${x + w * .08} ${y + h} Q${cx} ${y + h * .62} ${x + w * .92} ${y + h}Z" fill="${f.head === 'hijab' ? f.headc : f.shirt}"/>
    <rect x="${cx - w * .09}" y="${top + h * .38}" width="${w * .18}" height="${h * .2}" fill="${f.skin}"/>
    ${back}${front && /headtie|gele|cap|fila|hood|helmet/.test(f.head || '') ? '' : front}
    <ellipse cx="${cx}" cy="${top + h * .22}" rx="${w * .22}" ry="${h * .27}" fill="${f.skin}"/><ellipse cx="${cx}" cy="${top + h * .22}" rx="${w * .22}" ry="${h * .27}" fill="url(#${id}-shade)"/>
    <ellipse cx="${cx - w * .02}" cy="${top + h * .27}" rx="${w * .03}" ry="${h * .05}" fill="#000" opacity=".12"/>
    ${front && /headtie|gele|cap|fila|hood|helmet/.test(f.head || '') ? front : ''}
    <ellipse cx="${cx - w * .08}" cy="${top + h * .2}" rx="${w * .028}" ry="${h * .018}" fill="#140e0a"/><ellipse cx="${cx + w * .08}" cy="${top + h * .2}" rx="${w * .028}" ry="${h * .018}" fill="#140e0a"/>
    ${f.glasses ? `<g fill="none" stroke="#141010" stroke-width="1.1"><rect x="${cx - w * .15}" y="${top + h * .16}" width="${w * .13}" height="${h * .08}" rx="2"/><rect x="${cx + w * .02}" y="${top + h * .16}" width="${w * .13}" height="${h * .08}" rx="2"/></g>` : ''}
    <path d="M${cx - w * .06} ${top + h * .36} Q${cx} ${top + h * .385} ${cx + w * .06} ${top + h * .36}" stroke="#3a2016" stroke-width="1.2" fill="none"/>
  </g>`;
}

/* ---------- damage ---------- */
function defs(id, seed) {
  return `<filter id="${id}-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="${seed % 997}"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .22  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <filter id="${id}-grime" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="${(seed + 1) % 997}"/><feColorMatrix values="0 0 0 0 .32  0 0 0 0 .26  0 0 0 0 .18  0 0 0 1.1 -.42"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <filter id="${id}-soft" x="0" y="0" width="100%" height="100%"><feGaussianBlur stdDeviation=".9" result="b"/><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="${(seed + 4) % 997}" result="g"/><feColorMatrix in="g" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .14 0" result="gc"/><feComposite in="gc" in2="b" operator="in" result="gn"/><feMerge><feMergeNode in="b"/><feMergeNode in="gn"/></feMerge></filter>
    <radialGradient id="${id}-shade" cx="38%" cy="35%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
    <filter id="${id}-ink"><feGaussianBlur stdDeviation=".18"/></filter>
    <filter id="${id}-stress"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="${id}-burnf" x="-60%" y="-60%" width="220%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="4" seed="${(seed + 7) % 997}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G"/></filter>
    <radialGradient id="${id}-char"><stop offset="0" stop-color="#030202"/><stop offset=".55" stop-color="#0b0705"/><stop offset=".78" stop-color="#2b1709"/><stop offset=".9" stop-color="#6a3b14"/><stop offset="1" stop-color="#8a5a22" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}-scorch"><stop offset=".55" stop-color="#7a4a1c" stop-opacity=".55"/><stop offset="1" stop-color="#b98a4a" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-gloss" x1="0" y1="0" x2="1" y2="1"><stop offset=".18" stop-color="#fff" stop-opacity="0"/><stop offset=".32" stop-color="#fff" stop-opacity=".22"/><stop offset=".40" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}-band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22744f"/><stop offset="1" stop-color="#175538"/></linearGradient>
    <linearGradient id="${id}-studio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb2bf"/><stop offset="1" stop-color="#7d8f9c"/></linearGradient>
    <radialGradient id="${id}-tmg"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
    <mask id="${id}-tm"><ellipse cx="0" cy="2" rx="20" ry="26" fill="url(#${id}-tmg)"/></mask>
    <clipPath id="${id}-card"><rect width="${W}" height="${H}" rx="14"/></clipPath>
    <filter id="${id}-blood" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${seed % 997}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feMorphology in="shape" operator="erode" radius="1.3" result="inner"/>
      <feComposite in="shape" in2="inner" operator="out" result="rim"/>
      <feFlood flood-color="#2a0302" flood-opacity=".75"/><feComposite in2="rim" operator="in" result="rimc"/>
      <feGaussianBlur in="shape" stdDeviation="2.4" result="bump"/>
      <feSpecularLighting in="bump" surfaceScale="3.2" specularConstant=".55" specularExponent="34" lighting-color="#ffe9e0" result="spec"><fePointLight x="-120" y="-160" z="220"/></feSpecularLighting>
      <feComposite in="spec" in2="inner" operator="in" result="gloss"/>
      <feMerge><feMergeNode in="shape"/><feMergeNode in="rimc"/><feMergeNode in="gloss"/></feMerge>
    </filter>
    <filter id="${id}-stain" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="3" seed="${(seed + 2) % 997}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.1" result="b"/><feMorphology in="d" operator="erode" radius="1" result="i"/><feComposite in="d" in2="i" operator="out" result="edge"/><feFlood flood-color="#4a0805" flood-opacity=".6"/><feComposite in2="edge" operator="in" result="ec"/><feMerge><feMergeNode in="b"/><feMergeNode in="ec"/></feMerge></filter>
    <radialGradient id="${id}-bl" cx="45%" cy="45%" r="60%"><stop offset="0" stop-color="#3e0403"/><stop offset=".5" stop-color="#5c0806" stop-opacity=".92"/><stop offset="1" stop-color="#7a1009" stop-opacity=".7"/></radialGradient>
    <filter id="${id}-smear" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.35" numOctaves="3" seed="${(seed + 9) % 997}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/><feComponentTransfer in="n" result="streak"><feFuncA type="table" tableValues="0.15 0.9 0.4 1"/></feComponentTransfer><feComposite in="d" in2="streak" operator="in"/></filter>
    <filter id="${id}-print" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="${(seed + 5) % 997}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>`;
}
function blood(id, r, cx, cy, size, o) {
  o = o || {}; let s = '', st = '';
  const blobs = 3 + Math.floor(r() * 4);
  for (let i = 0; i < blobs; i++) { const a = r() * 6.28, d = r() * size * .5; s += `<ellipse cx="${cx + Math.cos(a) * d}" cy="${cy + Math.sin(a) * d * .7}" rx="${size * (.35 + r() * .45)}" ry="${size * (.25 + r() * .35)}" transform="rotate(${r() * 180} ${cx} ${cy})"/>`; }
  if (o.drip) for (let i = 0; i < o.drip; i++) { const x = cx + (r() - .5) * size, len = size * (.6 + r() * 1.2); s += `<path d="M${x - 3} ${cy} L${x - 1.6} ${cy + len} Q${x} ${cy + len + 5} ${x + 1.6} ${cy + len} L${x + 3} ${cy}Z"/>`; }
  for (let i = 0; i < 3; i++) { const a = r() * 6.28, d = r() * size * .4; st += `<ellipse cx="${cx + Math.cos(a) * d}" cy="${cy + Math.sin(a) * d * .7}" rx="${size * (.8 + r() * .5)}" ry="${size * (.55 + r() * .35)}" transform="rotate(${r() * 180} ${cx} ${cy})"/>`; }
  let out = `<g style="mix-blend-mode:multiply" filter="url(#${id}-stain)" fill="#7e2410" opacity=".5">${st}</g><g style="mix-blend-mode:multiply" filter="url(#${id}-blood)" fill="url(#${id}-bl)" opacity=".93" transform="translate(${cx} ${cy}) scale(.62) translate(${-cx} ${-cy})">${s}</g>`;
  if (o.spatter) { let sp = ''; const dir = o.dir != null ? o.dir : r() * 6.28;
    for (let i = 0; i < o.spatter; i++) { const d = size * (.7 + r() * 2.2), a = dir + (r() - .5) * 1.1, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, rad = .6 + r() * (i % 6 ? 1.8 : 3.6);
      sp += i % 4 ? `<circle cx="${x}" cy="${y}" r="${rad}"/>` : `<ellipse cx="${x}" cy="${y}" rx="${rad * 2.6}" ry="${rad}" transform="rotate(${a * 57.3} ${x} ${y})"/>`; }
    out += `<g style="mix-blend-mode:multiply" fill="#4e0605" opacity=".92">${sp}</g>`; }
  return out;
}
function smear(id, r, x1, y1, x2, y2, w) {
  const q = `M${x1} ${y1} Q${(x1 + x2) / 2 + (r() - .5) * 30} ${(y1 + y2) / 2 + (r() - .5) * 20} ${x2} ${y2}`;
  return `<g style="mix-blend-mode:multiply" filter="url(#${id}-smear)"><path d="${q}" stroke="#7a1209" stroke-width="${w * 1.25}" stroke-linecap="round" fill="none" opacity=".55"/><path d="${q}" stroke="#4a0504" stroke-width="${w * .8}" stroke-linecap="round" fill="none" opacity=".9"/></g>`;
}
function thumb(id, r, cx, cy, rot, sc) {
  let rid = ''; for (let k = 1; k < 15; k++) { rid += `<ellipse cx="0" cy="${k * .25}" rx="${k * 1.55}" ry="${k * 2.05}" stroke-dasharray="${4 + r() * 10} ${1 + r() * 3}" stroke-dashoffset="${r() * 20}"/>`; }
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sc || 1})" style="mix-blend-mode:multiply"><g filter="url(#${id}-print)" fill="none" stroke="#5a0806" stroke-width="1.05" opacity=".8" mask="url(#${id}-tm)">${rid}</g></g>`;
}
function crack(id, r, pts) {
  const d = 'M' + pts.map((p) => p.join(' ')).join(' L');
  let br = ''; pts.slice(1, -1).forEach((p) => { if (r() < .6) { const a = (r() - .5) * 2.4, l = 8 + r() * 16; br += `M${p[0]} ${p[1]} l${Math.cos(a) * l} ${Math.sin(a) * l} l${(r() - .5) * 6} ${4 + r() * 5}`; } });
  let chips = ''; pts.slice(1, -1).forEach((p) => { if (r() < .4) chips += `<path d="M${p[0]} ${p[1]} l${3 + r() * 4} ${-2 - r() * 3} l${r() * 3} ${4 + r() * 3}Z" fill="#f4efe0" opacity=".85"/>`; });
  return `<g><path d="${d}" stroke="#fff" stroke-width="7" opacity=".28" fill="none" filter="url(#${id}-stress)"/>${br ? `<path d="${br}" stroke="#fff" stroke-width="2.5" opacity=".25" fill="none" filter="url(#${id}-stress)"/>` : ''}
    <path d="${d}" stroke="#14100c" stroke-width="1.15" fill="none" opacity=".85"/>${br ? `<path d="${br}" stroke="#14100c" stroke-width=".6" fill="none" opacity=".7"/>` : ''}
    <path d="${d}" transform="translate(.9 .7)" stroke="#fffaf0" stroke-width=".55" fill="none" opacity=".8"/>${chips}</g>`;
}
const burn = (id, cx, cy, size) => `<g filter="url(#${id}-burnf)"><circle cx="${cx}" cy="${cy}" r="${size * 1.35}" fill="url(#${id}-scorch)" style="mix-blend-mode:multiply"/><circle cx="${cx}" cy="${cy}" r="${size}" fill="url(#${id}-char)"/></g>`;
function hole(cx, cy, r0) {
  let star = ''; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283, rr = r0 * (i % 2 ? 1.25 : 2.1 + (i % 3) * .3); star += `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr} `; }
  let rays = ''; for (let i = 0; i < 6; i++) { const a = i * 1.05 + .3, l = r0 * (3 + (i % 3) * 1.5); rays += `M${cx + Math.cos(a) * r0 * 1.6} ${cy + Math.sin(a) * r0 * 1.6} L${cx + Math.cos(a) * l} ${cy + Math.sin(a) * l}`; }
  return `<g><path d="${rays}" stroke="#fff" stroke-width="1.6" opacity=".45"/><path d="${rays}" stroke="#1b1612" stroke-width=".5" opacity=".7"/><polygon points="${star}" fill="#efe9d8" opacity=".9"/><circle cx="${cx}" cy="${cy}" r="${r0 * 1.4}" fill="#2a1d14" opacity=".8"/><circle cx="${cx}" cy="${cy}" r="${r0}" fill="#060505"/><circle cx="${cx - r0 * .4}" cy="${cy - r0 * .4}" r="${r0 * .9}" fill="none" stroke="#5a4636" stroke-width=".7" opacity=".7"/></g>`;
}
const W = 340, H = 214;
const surname = (x, y, w) => ({ t: 'smear', x1: x, y1: y + 1, x2: x + w, y2: y - 3, w: 15 });
/* four ways a card ends up; who gets which is fixed by who they are */
function damageFor(who, nameW) {
  const sx = 124 + nameW + 6;
  const R = [
    [surname(sx, 78, 92), { t: 'blood', x: 250, y: 92, s: 46, drip: 3, spatter: 40, dir: 3.6 }, { t: 'thumb', x: 196, y: 150, rot: 28 }, { t: 'crack', pts: [[0, 150], [40, 138], [70, 152], [118, 120], [150, 128], [178, 96], [210, 104], [236, 70]] }],
    [surname(sx, 78, 96), { t: 'hole', x: 70, y: 98, s: 5 }, { t: 'blood', x: 74, y: 120, s: 14, drip: 2 }, { t: 'crack', pts: [[70, 98], [120, 70], [170, 64], [230, 30], [280, 0]] }],
    [surname(sx, 78, 90), { t: 'crack', pts: [[200, 214], [212, 170], [236, 150], [250, 110], [286, 82], [300, 40], [340, 20]] }, { t: 'smear', x1: 20, y1: 190, x2: 160, y2: 160, w: 22 }],
    [surname(sx, 78, 96), { t: 'burn', x: 330, y: 205, s: 62 }, { t: 'blood', x: 120, y: 40, s: 22, spatter: 18, dir: 1 }]
  ];
  return R[who.seed % 4];
}
const BACKDMG = [{ t: 'blood', x: 300, y: 170, s: 40, spatter: 26, dir: 3.9 }, { t: 'thumb', x: 60, y: 175, rot: -20, s: .9 }];

function scratches(r) { let s = ''; for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * H, a = r() * 6.28, l = 6 + r() * 40; s += `M${x} ${y} l${Math.cos(a) * l} ${Math.sin(a) * l}`; } return `<path d="${s}" stroke="#fff" stroke-width=".5" opacity=".35"/><path d="${s}" transform="translate(.5 .5)" stroke="#5a5040" stroke-width=".35" opacity=".25"/>`; }
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* one side of one card, as an <svg>. o: { back, extraBlood } */
function side(p, o) {
  o = o || {}; const who = whoOf(p); const id = 'idc' + (++uid); const r = rng(who.seed + (o.back ? 77 : 0));
  const T = (x, y, t, sz, wt, col, ls) => `<text x="${x}" y="${y}" font-family="Archivo Narrow, Arial Narrow, Roboto Condensed, sans-serif" font-weight="${wt || 700}" font-size="${sz}" fill="${col || '#1c1b18'}" letter-spacing="${ls || 0}" filter="url(#${id}-ink)">${esc(t)}</text>`;
  const L = (x, y, t) => T(x, y, t, 7.4, 500, '#6d675b', .9);
  const crest = C.Scenes && C.Scenes.emblemRects ? C.Scenes.emblemRects(0, 0, 1) : '';
  let face, dmg = [];
  if (!o.back) {
    const nameW = who.name.length * 8.2;
    const mid = who.kind === 'staff' ? `${L(124, 100, 'POSITION')}${T(124, 113, who.pos.slice(0, 30), 11.5)}` : `${L(124, 100, 'FACULTY / LEVEL')}${T(124, 113, who.fac, who.fac.length > 26 ? 10 : 11.5)}`;
    face = `<rect width="${W}" height="${H}" fill="#ece5d0"/><rect width="${W}" height="${H}" filter="url(#${id}-grain)"/>
      <rect width="${W}" height="46" fill="url(#${id}-band)"/>
      <g transform="translate(12 5) scale(.92)" shape-rendering="crispEdges">${crest}</g>
      ${T(56, 22, 'VERITAS UNIVERSITY, ABUJA', 15.5, 700, '#f4eedb', .6)}${T(56, 36, who.kind === 'staff' ? 'STAFF IDENTITY CARD' : 'STUDENT IDENTITY CARD', 8.6, 500, '#cfe2d6', 2.4)}
      <circle cx="309" cy="23" r="13" fill="none" stroke="#f4eedb" stroke-width="1.2" opacity=".18"/>
      ${photo(id, who.face, 16, 58, 92, 116)}<rect x="16" y="58" width="92" height="116" fill="none" stroke="#000" stroke-opacity=".25"/>
      ${L(124, 68, 'NAME')}${T(124, 82, who.name, 13.5)}${mid}
      ${L(124, 131, 'STATE OF ORIGIN')}${T(124, 144, who.state, 11.5)}${L(244, 131, 'BLOOD GROUP')}${T(244, 144, who.bg, 11.5)}
      ${L(124, 162, 'SIGNATURE')}<path d="M126 177 c6 -10 9 6 14 -3 s6 -8 9 2 c3 6 8 -9 12 -2 c3 5 10 -4 18 -1" stroke="#1d2a6a" stroke-width="1.1" fill="none" opacity=".85"/>
      <rect x="0" y="${H - 22}" width="${W}" height="22" fill="#e3dbc4"/>${T(16, H - 8, 'IF FOUND, PLEASE RETURN TO THE REGISTRY, VERITAS UNIVERSITY, BWARI, FCT', 7, 500, '#6d675b', .5)}
      <g opacity=".5">${Array.from({ length: 30 }, (_, i) => `<rect x="${236 + i * 3.2}" y="152" width="${i % 3 ? 1.2 : 2}" height="26" fill="#2a2824"/>`).join('')}</g>`;
    dmg = damageFor(who, nameW).slice();
    if (o.extraBlood) dmg.push({ t: 'blood', x: 150 + r() * 60, y: 90 + r() * 30, s: 60, drip: 4, spatter: 30, dir: 2.2 });
  } else {
    /* the back: the university's small print, and what they wrote on the first night */
    const words = who.note.split(' '); const lines = ['']; words.forEach((w) => { if ((lines[lines.length - 1] + ' ' + w).length > 30) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); });
    face = `<rect width="${W}" height="${H}" fill="#e6dfc9"/><rect width="${W}" height="${H}" filter="url(#${id}-grain)"/>
      ${T(18, 26, 'THIS CARD IS THE PROPERTY OF VERITAS UNIVERSITY, ABUJA.', 8.4, 500, '#6d675b', .4)}${T(18, 38, 'IT MUST BE CARRIED AT ALL TIMES ON CAMPUS AND SHOWN ON REQUEST.', 8.4, 500, '#6d675b', .4)}${T(18, 50, 'IF FOUND, PLEASE RETURN TO THE REGISTRY, VERITAS UNIVERSITY, BWARI, FCT.', 8.4, 500, '#6d675b', .4)}
      <rect x="18" y="58" width="304" height=".6" fill="#9c9483"/>
      <g font-family="Kalam, cursive" fill="#1d2a6a" opacity=".9">${lines.slice(0, 3).map((l, i) => `<text x="22" y="${92 + i * 28}" font-size="19" transform="rotate(-2 22 ${92 + i * 28})">${esc(l)}</text>`).join('')}<text x="200" y="186" font-size="17" transform="rotate(-3 200 186)">— ${esc(who.first)}</text></g>`;
    dmg = BACKDMG;
  }
  let d = '';
  dmg.forEach((x) => {
    if (x.t === 'blood') d += blood(id, r, x.x, x.y, x.s, x);
    if (x.t === 'smear') d += smear(id, r, x.x1, x.y1, x.x2, x.y2, x.w);
    if (x.t === 'thumb') d += thumb(id, r, x.x, x.y, x.rot, x.s);
    if (x.t === 'crack') d += crack(id, r, x.pts);
    if (x.t === 'burn') d += burn(id, x.x, x.y, x.s);
    if (x.t === 'hole') d += hole(x.x, x.y, x.s);
  });
  return `<svg class="idsvg" viewBox="-4 -4 ${W + 8} ${H + 8}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs(id, who.seed)}</defs>
    <g clip-path="url(#${id}-card)">${face}<rect width="${W}" height="${H}" filter="url(#${id}-grime)" opacity=".55"/>${scratches(r)}${d}<rect width="${W}" height="${H}" fill="url(#${id}-gloss)"/></g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="#fff" stroke-opacity=".35"/><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="13" fill="none" stroke="#3a3328" stroke-opacity=".25"/></svg>`;
}

/* a card that turns over when tapped */
function flip(p, o) { return `<div class="idflip${o && o.dead ? ' dead' : ''}" data-idflip="1"><div class="idf">${side(p, o)}</div><div class="idb">${side(p, Object.assign({}, o, { back: true }))}</div>${o && o.dead ? `<div class="idx"></div>` : ''}</div>`; }

/* ---------- the opening: their cards on the hostel floor ---------- */
const SPOTS = [[2, 3, -9], [36, 21, 8], [3, 41, 4], [35, 60, -6], [12, 76, 7]];
function opening(people, done) {
  if (typeof document === 'undefined') { if (done) done(); return; }
  const el = document.createElement('div'); el.className = 'idopen';
  el.innerHTML = `<div class="idfloor">${people.slice(0, 5).map((p, i) => { const [x, y, rot] = SPOTS[i]; return `<div class="idspot" style="left:${x}%;top:${y}%;transform:rotate(${rot}deg)">${flip(p)}</div>`; }).join('')}</div><button class="idgo">Continue</button>`;
  document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
  el.querySelector('.idgo').addEventListener('click', () => { el.classList.remove('on'); setTimeout(() => { el.remove(); if (done) done(); }, 380); });
}
if (typeof document !== 'undefined') document.addEventListener('click', (e) => { const f = e.target && e.target.closest && e.target.closest('[data-idflip]'); if (f) { f.classList.toggle('over'); e.stopPropagation(); } }, true);

/* a dead person's card: grey, crossed through, the day chalked beside it */
function deadCard(p, day) { return `<div class="iddead">${flip(p, { dead: true, extraBlood: true })}<div class="idchalk">Day ${day}.</div></div>`; }

/* the game's cards turn line breaks in their text into <br>: hand them the markup on one line */
const one = (fn) => (...a) => fn(...a).replace(/\s*\n\s*/g, ' ');
C.IDCard = { side: one(side), flip: one(flip), opening, deadCard: one(deadCard), whoOf };
if (typeof module !== 'undefined') module.exports = C.IDCard;
})(typeof window !== 'undefined' ? window : globalThis);
