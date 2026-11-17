/* CRISIS — voices. Lines are written in plain English; say() gives them the speaker's own voice.
   Grounded in PIDGIN.md (research on Nigerian Pidgin and Nigerian English). The player is never told any of this.

   level  0  English (Nigerian English: sorry, sir/ma, I'm coming). At most a mother-tongue exclamation.
          1  English; a Pidgin touch only when the line runs hot (fear, anger, grief, a joke)
          2  English; Pidgin phrases and tags with peers, more when hot
          3  mixed: whole sentences slide into Pidgin when hot, phrases otherwise
          4  Pidgin first (older working people): Pidgin is the everyday voice
   dialect  igbo | yoruba | hausa : exclamations and address words from the mother tongue
   faith    christian | muslim : a faith phrase now and then
   Switching follows the research: up into Pidgin for anger, fear, jokes, closeness, food and money;
   down into English for elders and authority (opts.to: 'elder' | 'authority'), prayer, and the gravest grief. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};

/* stable randomness: the same character saying the same line always says it the same way */
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- whole phrases first: these are how people actually say them ---------- */
const PHRASE = [
  [/\bhow are you( doing)?\b/gi, 'how you dey'], [/\bwhat happened\b/gi, 'wetin happen'], [/\bwhat is (this|that)\b/gi, 'wetin be $1'],
  [/\bwhat do you want\b/gi, 'wetin you want'], [/\bwhat do you mean\b/gi, 'wetin you mean'], [/\bwhy\b/gi, 'wetin make'],
  [/\b(?:do not|don't) worry\b/gi, 'no worry'], [/\b(?:do not|don't) be angry( with me)?\b/gi, 'no vex'],
  [/\blet us go\b|\blet's go\b/gi, 'make we go'], [/\blet me\b/gi, 'make I'], [/\blet us\b|\blet's\b/gi, 'make we'],
  [/\bget out\b/gi, 'comot'], [/\bleave me alone\b/gi, 'leave me jare'], [/\bit is what it is\b/gi, 'na so e be'], [/\bthat is how it is\b/gi, 'na so e be'],
  [/\bI (?:do not|don't) know\b/gi, 'I no know'], [/\bI (?:can not|cannot|can't)\b/gi, 'I no fit'], [/\byou (?:can not|cannot|can't)\b/gi, 'you no fit'],
  [/\b(?:have not|haven't|has not|hasn't) (eaten|slept|seen|come|finished|started)\b/gi, (m, v) => 'neva ' + ({ eaten: 'chop', slept: 'sleep', seen: 'see', come: 'come', finished: 'finish', started: 'start' })[v.toLowerCase()]],
  [/\b(?:I am|I'm) (hungry|tired|cold|fine|scared|afraid|okay|ok)\b/gi, (m, a) => 'I dey ' + ({ scared: 'fear', afraid: 'fear', ok: 'okay' }[a.toLowerCase()] || a.toLowerCase())],
  [/\b(?:I am|I'm) (here|home|inside|outside|coming)\b/gi, 'I dey $1'], [/\byou are (here|there|coming)\b/gi, 'you dey $1']
];
/* then words, with the grammar the research gives: be = what something is, na = it is (focus), dey = where or a state,
   don = already, go = will (never the past), neva = not yet, no before the verb */
const WORD = [
  [/\b(?:I am|I'm) a\b/gi, 'I be'], [/\byou are a\b/gi, 'you be'], [/\b(?:he|she) is a\b/gi, 'e be'],
  [/\b(?:it is|it's|that is|that's) not\b/gi, 'no be'], [/\b(?:it is|it's|that is|that's) (?:a |an )?(?=(?:the|my|your|our|his|her|their|this|[A-Z]))/g, 'na '], [/\b(?:It is|It's|That is|That's) (?:a |an )?(?=(?:the|my|your|our|his|her|their|this|[A-Z]))/g, 'Na '],
  [/\b(?:they|They) will not\b|\b(?:they|They) won't\b/g, 'dem no go'], [/\b(?:will not|won't)\b/gi, 'no go'],
  [/\b(?:I am|I'm) going to\b/gi, 'I go'], [/\b(?:we are|we're) going to\b/gi, 'we go'], [/\b(?:you are|you're) going to\b/gi, 'you go'], [/\bgoing to\b/gi, 'go'],
  [/\bI will\b|\bI'll\b/gi, 'I go'], [/\bwe will\b|\bwe'll\b/gi, 'we go'], [/\byou will\b|\byou'll\b/gi, 'you go'], [/\b(?:they will|they'll)\b/gi, 'dem go'],
  [/\b(?:will not|won't)\b/gi, 'no go'], [/\b(?:do not|don't|does not|doesn't|did not|didn't)\b/gi, 'no'],
  [/\bI have (already )?(eaten|finished|seen|told you)\b/gi, (m, a, v) => 'I don ' + ({ eaten: 'chop', finished: 'finish', seen: 'see', 'told you': 'tell you' })[v.toLowerCase()]],
  [/\bthey\b/gi, 'dem'], [/\bthem\b/gi, 'dem'], [/\byou people\b|\byou all\b/gi, 'una'],
  [/\bchildren\b/gi, 'pikin dem'], [/\bchild\b/gi, 'pikin'], [/\bproblem\b|\btrouble\b/gi, 'wahala'], [/\beat\b/gi, 'chop'],
  [/\bknow how to\b/gi, 'sabi'], [/\bunderstand\b/gi, 'sabi'], [/\bangry\b/gi, 'vex']
];
function pidginize(text) {
  let t = text;
  PHRASE.forEach(([re, to]) => { t = t.replace(re, (...a) => keepCase(a[0], typeof to === 'function' ? to(...a) : a[0].replace(re, to))); });
  WORD.forEach(([re, to]) => { t = t.replace(re, (...a) => keepCase(a[0], typeof to === 'function' ? to(...a) : to)); });
  return t;
}
function keepCase(src, out) { return /^[A-Z]/.test(src) ? out.charAt(0).toUpperCase() + out.slice(1) : out; }
/* a light touch for English speakers: only safe whole phrases, never grammar */
const TOUCH = [
  [/\b(?:do not|don't) worry\b/i, 'no worry'], [/\bwhat happened\b/i, 'wetin happen'],
  [/\blet us go\b|\blet's go\b/i, 'make we go'], [/\bI (?:do not|don't) know\b/i, 'I no know'], [/\bget out\b/i, 'comot'], [/\bit is what it is\b/i, 'na so e be']
];

/* ---------- mother tongue, faith, tags ---------- */
const DIALECT = {
  igbo: { exclaim: ['Chai!', 'Chineke!'], sorrow: ['Chai.', 'Ndo.'], warm: ['Nne.', 'Nna.'], thanks: ['Daalu.'], please: ['Biko.'] },
  yoruba: { exclaim: ['Ah-ah!', 'Omo!'], sorrow: ['Pele.', 'E pele.'], warm: ['Omo mi.'], thanks: ['E se.'], please: ['Jowo.'] },
  hausa: { exclaim: ['Haba!', 'Kai!'], sorrow: ['Sannu.', 'Kai.'], warm: ['Dan uwa.'], thanks: ['Na gode.'], please: ['Don Allah.'] }
};
const FAITH = { muslim: ['Insha Allah.', 'Alhamdulillah.'], christian: ['God dey.', 'God help us.'] };
const TAGS = { 1: ['o'], 2: ['o', 'abi?', 'sha'], 3: ['o', 'abi?', 'sha', 'jare'], 4: ['o', 'abi?', 'sha', 'jare', 'now'] };
function mood(text) {
  if (/\b(sorry|lost|dead|died|gone|miss|cry|grave|funeral|buried)\b/i.test(text)) return 'sorrow';
  if (/\b(thank|thanks)\b/i.test(text)) return 'thanks';
  if (/\b(please|beg)\b/i.test(text)) return 'please';
  if (/!/.test(text) || /\b(God|kill|die|blood|run|now|hungry|scared|afraid|angry|hate|lie|liar|thief|stupid)\b/i.test(text)) return 'exclaim';
  return 'plain';
}
const hotOf = (s) => (/[!?]$/.test(s) ? 0.5 : 0) + (/\b(kill|die|dead|blood|hungry|scared|afraid|angry|hate|lie|liar|thief|stupid|joke|laugh|food|money|chop|God)\b/i.test(s) ? 0.5 : 0);
/* old voice records (base en/mix/pg) map onto levels until every character carries one */
function levelOf(v) { if (v.level != null) return v.level; return v.base === 'pg' ? 2 : v.base === 'mix' ? 1 : 0; }

function say(voice, text, opts) {
  opts = opts || {}; if (!voice || !text) return text;
  if (voice.lines && voice.lines[text] && !(opts.to === 'elder' || opts.to === 'authority')) return voice.lines[text];   /* hand-written lines win */
  const r = rng(hash((opts.id || '') + '|' + text));
  let L = levelOf(voice);
  if (opts.to === 'elder' || opts.to === 'authority') L = Math.max(0, L - 2);   /* in front of elders and authority, English */
  if (opts.prayer || /\b(pray|Lord|Allah)\b/.test(text)) L = Math.min(L, 1);
  const heat = opts.heat != null ? opts.heat : 0.5;
  const sentences = text.split(/(?<=[.!?])\s+/);
  let t = sentences.map((s) => {
    const hot = hotOf(s) + (heat - 0.5);
    if (L >= 4) return pidginize(s);
    if (L === 3) return r() < 0.35 + hot * 0.5 ? pidginize(s) : s;
    if (L >= 1) {   /* English with a touch: one safe phrase, only when the line runs hot (level 1) or now and then (level 2) */
      const p = L === 2 ? 0.25 + hot * 0.45 : hot * 0.45;
      if (r() < p) { for (const [re, to] of TOUCH) if (re.test(s)) return s.replace(re, (m) => keepCase(m, to)); }
    }
    return s;
  }).join(' ');
  /* one tag at most, at the end, never on a question already tagged */
  if (L >= 1 && TAGS[L] && r() < (L >= 3 ? 0.3 : L === 2 ? 0.16 : 0.06) && /[a-z][.!]$/.test(t) && t.split(/\s+/).length >= 4) {
    const tg = TAGS[L][Math.floor(r() * TAGS[L].length)]; t = tg.endsWith('?') ? t.replace(/[.!]$/, ', ' + tg) : t.replace(/([a-z])([.!])$/, '$1 ' + tg + '$2');
  }
  /* the mother tongue: an exclamation or word, only when the line asks for it */
  const D = voice.dialect && DIALECT[voice.dialect]; const m = opts.mood || mood(text);
  if (D && m !== 'plain' && D[m] && r() < [0.06, 0.1, 0.15, 0.22, 0.32][L]) { const w = D[m][Math.floor(r() * D[m].length)]; t = m === 'thanks' || m === 'please' ? t + ' ' + w : w + ' ' + t; }
  if (voice.faith && FAITH[voice.faith] && /\b(God|pray|safe|tomorrow|rescue|alive)\b/i.test(text) && r() < 0.25) t += ' ' + FAITH[voice.faith][Math.floor(r() * 2)];
  if (voice.tag && r() < 0.1 && /[a-z][.!]$/.test(t)) t = t.replace(/([.!])$/, ', ' + voice.tag + '$1');
  t = t.replace(/\s{2,}/g, ' ').replace(/ ,/g, ',').trim();
  return t.replace(/(^|[.!?]\s+)([a-z])/g, (mm, a, b) => a + b.toUpperCase());
}
function address(voice) { const L = voice ? levelOf(voice) : 0; return L >= 3 ? ['Oga', 'Chief'] : ['Sir', 'Chief']; }
C.Voice = { say, pidginize, hash, rng, DIALECT, address, levelOf };
if (typeof module !== 'undefined') module.exports = C.Voice;
})(typeof window !== 'undefined' ? window : globalThis);
