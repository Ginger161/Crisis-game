/* CRISIS — voices
   Every character has a hidden voice profile. The player is never told what it is; they just hear it.
     base:    'en' (English)  |  'pg' (Pidgin)  |  'mix' (English that slides into Pidgin when emotional)
     dialect: null | 'igbo' | 'yoruba' | 'hausa'   (flavour words and address terms, not full sentences)
     density: 0..1  how often the dialect shows through
     tag:     a personal catchphrase
   Authors write lines in plain English. say() turns them into that person's voice, the same way every time.
   NOTE FOR THE DESIGNER: the Pidgin rules and dialect banks below are a first pass. Please proof them. They live in two tables. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};

/* ---------- stable randomness: same character + same line = same result ---------- */
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- Pidgin rules (applied in order) ---------- */
const SUBJ = { i: 'I', we: 'we', you: 'you', they: 'dem', he: 'e', she: 'she', it: 'e' };
const PG0 = [
  [/\b(I|we|you|they|he|she|it)(?: am| are| is|'m|'re|'s) going to\b/gi, (m, a) => (SUBJ[a.toLowerCase()] || a) + ' go'],
  [/\b(?:I am|I'm) (?:so |very |really )?hungry\b/gi, 'Hungry dey catch me'], [/\b(?:am|is|are) (?:so |very |really )?hungry\b/gi, 'dey hungry well well'],
  [/\b(?:do not|don't) be angry\b/gi, 'no vex'], [/\b(?:do not|don't) worry\b/gi, 'no worry'], [/\b(?:do not|don't) cry\b/gi, 'no cry'],
  [/\b(?:have not|haven't|has not|hasn't) eaten\b/gi, 'neva chop'], [/\beaten\b/gi, 'chop'],
  [/\bleave me alone\b/gi, 'leave me o'], [/\bI swear\b/gi, 'I swear down'], [/\bhow are you\b/gi, 'how you dey'], [/\bwhat happened\b/gi, 'wetin happen'], [/\bwhat do you mean\b/gi, 'wetin you mean'],
  [/\bit is what it is\b/gi, 'na so e be'], [/\b(afraid|scared) of\b/gi, 'fear'], [/\bI am (so |very )?tired\b/gi, 'I don tire'], [/\byou are (so |very )?easy\b/gi, 'you easy'], [/\bwhat I am going to\b/gi, 'wetin I go'], [/\blet us go\b/gi, 'make we go'], [/\blet me\b/gi, 'make I']
];
const PG = [
  [/\bI'm\b/gi, 'I am'], [/\byou're\b/gi, 'you are'], [/\bwe're\b/gi, 'we are'], [/\bthey're\b/gi, 'they are'], [/\bhe's\b/gi, 'he is'], [/\bshe's\b/gi, 'she is'], [/\bit's\b/gi, 'it is'], [/\bthat's\b/gi, 'that is'], [/\bthere's\b/gi, 'there is'], [/\bI've\b/gi, 'I have'], [/\bI'll\b/gi, 'I will'], [/\bwe'll\b/gi, 'we will'], [/\byou'll\b/gi, 'you will'], [/\blet's\b/gi, 'let us'], [/\bwon't\b/gi, 'will not'],
  [/\bcan't\b/gi, 'cannot'], [/\bdon't\b/gi, 'do not'], [/\bdidn't\b/gi, 'did not'], [/\bdoesn't\b/gi, 'does not'], [/\bisn't\b/gi, 'is not'], [/\baren't\b/gi, 'are not'], [/\bwasn't\b/gi, 'was not'], [/\bhaven't\b/gi, 'have not'],
  [/\bthere is not\b/gi, 'nothing dey'], [/\bis not\b/gi, 'no be'], [/\bare not\b/gi, 'no be'], [/\bwas not\b/gi, 'no be'],
  [/\bI cannot\b/gi, 'I no fit'], [/\bcannot\b/gi, 'no fit'], [/\bI do not\b/gi, 'I no'], [/\bdo not\b/gi, 'no'], [/\bdid not\b/gi, 'no'], [/\bdoes not\b/gi, 'no'], [/\bhave not\b/gi, 'neva'], [/\bwill not\b/gi, 'no go'],
  [/\bI am going to\b/gi, 'I go'], [/\bgoing to\b/gi, 'go'], [/\bI am\b/g, 'I dey'], [/\byou are\b/gi, 'you dey'], [/\bwe are\b/gi, 'we dey'], [/\bthey are\b/gi, 'dem dey'], [/\bhe is\b/gi, 'e dey'], [/\bshe is\b/gi, 'she dey'], [/\bit is\b/gi, 'na'], [/\bthat is\b/gi, 'na'], [/\bthere is\b/gi, 'e get'], [/\bthere are\b/gi, 'e get'],
  [/\bI have been\b/gi, 'I don dey'], [/\bhave been\b/gi, 'don dey'], [/\bI have\b/gi, 'I get'], [/\bwe have\b/gi, 'we get'], [/\byou have\b/gi, 'you get'], [/\bthey have\b/gi, 'dem get'], [/\bI will\b/gi, 'I go'], [/\bwe will\b/gi, 'we go'], [/\byou will\b/gi, 'you go'], [/\bwill\b/gi, 'go'], [/\bcan\b/gi, 'fit'], [/\bhave to\b/gi, 'must'], [/\bwant to\b/gi, 'wan'], [/\bneed to\b/gi, 'must'],
  [/\bwhat is\b/gi, 'wetin be'], [/\bwhat\b/gi, 'wetin'], [/\bvery\b/gi, 'well well'], [/\bchildren\b/gi, 'pikin dem'], [/\bchild\b/gi, 'pikin'], [/\bkids\b/gi, 'pikin dem'], [/\bfriends\b/gi, 'padi dem'], [/\bfriend\b/gi, 'padi'], [/\bproblem\b/gi, 'wahala'], [/\btrouble\b/gi, 'wahala'], [/\bfood\b/gi, 'chop'], [/\beat\b/gi, 'chop'], [/\bplease\b/gi, 'abeg'], [/\bthem\b/gi, 'dem'], [/\bthey\b/gi, 'dem'], [/\bthose\b/gi, 'dem'], [/\bthese\b/gi, 'dis'], [/\bthis\b/gi, 'dis'], [/\bthat\b/gi, 'dat'],
  [/\bknow\b/gi, 'sabi'], [/\bunderstand\b/gi, 'sabi'], [/\bmany\b/gi, 'plenty'], [/\ba lot of\b/gi, 'plenty'], [/\bmother\b/gi, 'mama'], [/\bfather\b/gi, 'papa'], [/\bmy mom\b/gi, 'my mama'], [/\bangry\b/gi, 'vex'], [/\bafraid\b/gi, 'fear'], [/\bscared\b/gi, 'fear'], [/\bcrazy\b/gi, 'mad'], [/\bgo home\b/gi, 'go house'], [/\bhurry\b/gi, 'rush'], [/\bsteal\b/gi, 'thief'], [/\bstealing\b/gi, 'thiefing'], [/\bwomen\b/gi, 'women'], [/\bnothing\b/gi, 'notin'], [/\bhello\b/gi, 'how far'], [/\bokay\b/gi, 'ok'], [/\bright\?/gi, 'abi?'], [/\bisn't it\?/gi, 'abi?'],
  [/\bbecause\b/gi, 'because'], [/\bliving\b/gi, 'dey live'], [/\bwaiting\b/gi, 'dey wait'], [/\bcrying\b/gi, 'dey cry'], [/\bhungry\b/gi, 'hungry'], [/\bcold\b/gi, 'cold'], [/\btired\b/gi, 'tire'], [/\bbeautiful\b/gi, 'fine'], [/\bhandsome\b/gi, 'fine'], [/\bdead\b/gi, 'don die'], [/\bdied\b/gi, 'die'], [/\bdie\b/gi, 'die']
];
const PG_TAILS = ['o', 'sha', 'jare', 'now', 'abeg', 'you hear?', 'abi?', 'na so'];

/* ---------- dialect banks (flavour, not full sentences) ---------- */
const DIALECT = {
  igbo: { exclaim: ['Chai!', 'Chineke!', 'Ewoo!', 'Kai!'], sorrow: ['Ewoo.', 'Ndo.', 'Chineke m.'], warm: ['Nne.', 'Nna.', 'My brother.', 'Nwanne m.'], thanks: ['Daalu.', 'Daalu o.'], please: ['Biko.'], agree: ['Ngwa.', 'O di mma.'], swear: ['I swear, o.'], god: ['Chineke.', 'God.'], tags: ['o', 'nna', 'nne', 'biko'], addrM: ['Nna', 'Oga'], addrF: ['Nne', 'Oga'] },
  yoruba: { exclaim: ['Ah-ah!', 'Ehen!', 'E ma se o!', 'Ha!'], sorrow: ['E pele.', 'Ah, pele.'], warm: ['Omo mi.', 'Egbon mi.', 'My own.'], thanks: ['E se.', 'E se o.'], please: ['Jowo.'], agree: ['O ya.', 'Ehen.'], swear: ['I swear down.'], god: ['Oluwa.', 'God.'], tags: ['o', 'abi', 'jare', 'sha'], addrM: ['Oga', 'Egbon'], addrF: ['Oga', 'Egbon'] },
  hausa: { exclaim: ['Wallahi!', 'Haba!', 'Kai!', 'Ya Allah!'], sorrow: ['Sannu.', 'Ya Allah.', 'Hakuri.'], warm: ['Dan uwa.', 'My brother.', 'Yaya.'], thanks: ['Na gode.', 'Na gode sosai.'], please: ['Don Allah.'], agree: ['Yauwa.', 'Toh.'], swear: ['Wallahi.'], god: ['Insha Allah.', 'Allah.'], tags: ['wallahi', 'toh', 'haba'], addrM: ['Oga', 'Malam'], addrF: ['Oga', 'Hajiya'] }
};
const FAITH = { muslim: { god: ['Insha Allah.', 'Alhamdulillah.', 'Allah ya kiyaye.'], sorrow: ['Innalillahi.'] }, christian: { god: ['God abeg.', 'Jesus.', 'God dey.'], sorrow: ['Lord have mercy.'] } };

/* ---------- transforms ---------- */
function pidginize(text, r, heat) {
  let t = text;
  PG0.forEach(([re, to]) => { t = t.replace(re, to); });
  PG.forEach(([re, to]) => { t = t.replace(re, (m) => (/^[A-Z]/.test(m) && to ? to.charAt(0).toUpperCase() + to.slice(1) : to)); });
  t = t.replace(/\bdi di\b/g, 'di');
  if (r() < 0.55 * (heat || 1)) t = t.replace(/\bthe\b/gi, (m) => (r() < 0.6 ? (/^T/.test(m) ? 'Di' : 'di') : m));
  /* sentence tails */
  t = t.split(/(?<=[.!?])\s+/).map((sn) => (sn.split(/\s+/).length >= 4 && r() < 0.22 * (heat || 1) ? sn.replace(/([a-z])([.!])$/, (m, a2, p2) => a2 + ', ' + PG_TAILS[Math.floor(r() * 3)] + p2) : sn)).join(' ');
  return t;
}
function mood(text) { if (/\b(yes|ok|okay|fine|alright|agree|sure|fair|good|right)\b/i.test(text) && !/[!]/.test(text)) return 'agree'; if (/!/.test(text)) return 'exclaim'; if (/\b(sorry|lost|dead|died|gone|miss|cry|grave|funeral)\b/i.test(text)) return 'sorrow'; if (/\b(thank|thanks)\b/i.test(text)) return 'thanks'; if (/\b(please)\b/i.test(text)) return 'please'; if (/\b(God|pray|Lord)\b/.test(text)) return 'god'; if (/\b(friend|brother|sister|love)\b/i.test(text)) return 'warm'; return 'plain'; }
const ENGLISH_ONLY = true;   // the Pidgin and dialect layer is switched off; set false to bring it back
function say(voice, text, opts) {
  opts = opts || {}; if (!voice || ENGLISH_ONLY) return text;
  const r = rng(hash((opts.id || '') + '|' + text));
  let t = text, heat = opts.heat != null ? opts.heat : 0.5;
  if (voice.base === 'pg') t = pidginize(t, r, 1);
  else if (voice.base === 'mix') {
    /* English that slides into Pidgin when the feeling runs hot */
    const sentences = t.split(/(?<=[.!?])\s+/);
    t = sentences.map((s) => { const hot = /[!]|\b(God|dead|kill|die|hungry|scared|afraid|angry|love|miss|sorry|please)\b/i.test(s); return r() < (hot ? 0.7 : 0.16) + (heat - 0.5) * 0.3 ? pidginize(s, r, 0.8) : s; }).join(' ');
  }
  /* dialect flavour */
  const D = voice.dialect && DIALECT[voice.dialect];
  if (D && r() < (voice.density || 0.4)) {
    const m = opts.mood || mood(text);
    if (m === 'plain') { const tg = D.tags[Math.floor(r() * D.tags.length)]; t = t.replace(/([.!?])$/, ', ' + tg + '$1'); }
    else { const bank = D[m] || D.warm; const w = bank[Math.floor(r() * bank.length)];
    if (m === 'exclaim' || m === 'sorrow' || m === 'god') t = (r() < 0.6 ? w + ' ' + t : t + ' ' + w); else if (m === 'thanks' || m === 'please' || m === 'warm') t = t + ' ' + w; else t = w + ' ' + t; }
  }
  if (voice.faith && FAITH[voice.faith] && /\b(God|pray|safe|tomorrow|rescue)\b/i.test(text) && r() < 0.35) { const f = FAITH[voice.faith].god; t += ' ' + f[Math.floor(r() * f.length)]; }
  /* personal tag, now and then */
  if (voice.tag && r() < 0.14) t = t.replace(/([.!?])$/, ', ' + voice.tag + '$1');
  t = t.replace(/\s{2,}/g, ' ').replace(/ ,/g, ',').trim();
  return t.replace(/(^|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
}
function address(voice, sex) {   /* what they call the commander */
  const D = voice && voice.dialect && DIALECT[voice.dialect];
  const base = voice && voice.base === 'en' ? ['Commander', 'Sir', 'Chief'] : ['Oga', 'Chief', 'Boss'];
  if (D && Math.random() < 0.0) return (sex === 'f' ? D.addrF : D.addrM)[0];
  return base;
}
C.Voice = { say, pidginize, hash, rng, DIALECT, address };
if (typeof module !== 'undefined') module.exports = C.Voice;
})(typeof window !== 'undefined' ? window : globalThis);
