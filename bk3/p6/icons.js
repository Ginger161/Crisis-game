/* CRISIS — pixel icons
   Every icon is a 10x10 grid in the game's own palette. Emoji anywhere in the interface are swapped for these by Icons.skin(),
   so the whole UI keeps one look and no phone's default emoji set ever shows. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const PAL = { k: '#17120e', c: '#f2ebcf', p: '#cfc4a0', o: '#f6b37f', d: '#d98a52', w: '#b08a56', W: '#6a4a32', b: '#3d7ab8', B: '#a8c8e8', r: '#c8463a', R: '#8a2a22', g: '#5aa04a', G: '#35703a', s: '#c4cad0', S: '#737a82', y: '#e0b040', x: '#8c8c90', X: '#55555a', t: '#8a6ab0', n: '#c8a050', z: '#e8e4d0' };
const I = {};
const def = (name, rows) => { I[name] = rows; };

/* items */
def('food', ['...kkkk...', '....yy....', '..kkyykk..', '.kcccccck.', 'kcccpcccck', 'kccccccpck', 'kcpcccccck', 'kcccccpcck', '.kcccccck.', '..kkkkkk..']);
def('meal', ['..x...x...', '...x...x..', '..........', '..cccccc..', '.kccpcccck', '.kkkkkkkk.', '.kddddddk.', '.kdoooodk.', '..kddddk..', '...kkkk...']);
def('water', ['....kk....', '....kk....', '...kBBk...', '...kBBk...', '..kBBbbk..', '.kBBbbbbk.', '.kBbbbbbk.', '.kbbbbbbk.', '..kbbbbk..', '...kkkk...']);
def('wood', ['..........', '.kkkkkkkk.', 'kwwwwwwwWk', 'knnwwwwwWk', 'kwwwwwwwWk', '.kkkkkkkk.', 'kwwwwwwwWk', 'kwwwnnwwWk', 'kwwwwwwwWk', '.kkkkkkkk.']);
def('parts', ['..........', '...kkkk...', '..kssssk..', '.kssSSssk.', '.ksSkkSsk.', '.ksSkkSsk.', '.kssSSssk.', '..kssssk..', '...kkkk...', '..........']);
def('cloth', ['..........', '..kkkkkkk.', '.kttttttk.', '.ktpttpttk', 'kkkkkkkkkk', 'kttttttttk', 'ktpttpttpk', 'kttttttttk', 'kkkkkkkkkk', '..........']);
def('meds', ['..........', '.kkkkkkkk.', 'kccccccccK', 'kccc rr ccK'.replace(/ /g, ''), 'kccrrrrcck', 'kccrrrrcck', 'kcccrrccck', 'kccccccccK', '.kkkkkkkk.', '..........']);
def('bandage', ['..........', '..kkkkkk..', '.kccccccck', 'kczzzzzzck', 'kcrrzzrrck', 'kczzrrzzck', 'kcrrzzrrck', '.kccccccck', '..kkkkkk..', '..........']);
def('ogogoro', ['...kkkk...', '...kccK...', '...kkkk...', '..kyyyyk..', '.kyyoyyyyk', '.kyyoyyyyk', '.kyyyyyyyk', '.kyyyyyyyk', '..kyyyyk..', '...kkkk...']);
def('knife', ['..........', '.......kk.', '......kssk', '.....kssk.', '....kssk..', '...kSsk...', '..kWWk....', '.kWWk.....', '.kWk......', '..k.......']);
def('bullet', ['..........', '....kk....', '...kyyk...', '...kyyk...', '...kyyk...', '..kkyykk..', '..kyyyyk..', '..kSSSSk..', '..kkkkkk..', '..........']);
def('skull', ['...kkkkk..', '..kzzzzzk.', '.kzzzzzzzk', '.kzkkzkkzk', '.kzkkzkkzk', '.kzzzkzzzk', '..kzzzzzk.', '..kzkzkzk.', '...kkkkk..', '..........']);
def('club', ['.......kk.', '......kWWk', '.....kWwWk', '....kWwWk.', '...kWwWk..', '..kWwWk...', '.kWwWk....', 'kWWWk.....', 'kWWk......', '.kk.......']);
def('machete', ['........kk', '.......kss', '......kssk', '.....kssk.', '....kssk..', '...kssk...', '.kkkSk....', 'kWWWk.....', 'kWWk......', '.kk.......']);
def('pistol', ['..........', '..kkkkkkk.', '.kSSSSSSSk', '.kSssssSSk', '.kkkkkSkkk', '.....kSk..', '....kWWk..', '....kWWk..', '....kkkk..', '..........']);
def('crowbar', ['........kk', '.......kSk', '......kSk.', '.....kSk..', '....kSk...', '...kSk....', '..kSk.....', '.kSk......', 'kSSk......', 'kkk.......']);
def('lockpick', ['..........', '..kk......', '.kssk.....', '.kssk.....', '..kkk.....', '....kk....', '.....kk...', '......kkk.', '.......k.k', '..........']);
def('shovel', ['.......kk.', '......kWWk', '......kWk.', '.....kWk..', '....kWk...', '..kkkk....', '.kSSSk....', 'kSSSSk....', 'kSSSk.....', '.kkk......']);
/* the interface */
def('heart', ['..........', '.kkk.kkk..', 'krrrkrrrk.', 'krrrrrrrk.', 'krrrrrrrk.', '.krrrrrk..', '..krrrk...', '...krk....', '....k.....', '..........']);
def('door', ['..kkkkkk..', '.kWWWWWWk.', '.kWwwwwWk.', '.kWwWWwWk.', '.kWwWWwWk.', '.kWwwwwWk.', '.kWwwwnWk.', '.kWwwwwWk.', '.kWwwwwWk.', 'kkkkkkkkkk']);
def('menu', ['..........', '.kkkkkkkk.', '.kccccccK.', '..........', '.kkkkkkkk.', '.kccccccK.', '..........', '.kkkkkkkk.', '.kccccccK.', '..........']);
def('talk', ['.kkkkkkkk.', 'kccccccccK', 'kcckcckcck', 'kccccccccK', 'kccccccccK', '.kkkkkkcK.', '....kkcK..', '....kcK...', '.....k....', '..........']);
def('journal', ['.kkkkkkkk.', 'kWWWWWWWWk', 'kWccccccWk', 'kWckkkkcWk', 'kWccccccWk', 'kWckkkkcWk', 'kWccccccWk', 'kWckkkccWk', 'kWWWWWWWWk', '.kkkkkkkk.']);
def('check', ['..........', '.........k', '........kg', '.......kgk', 'k.....kgk.', 'kg...kgk..', '.kg.kgk...', '..kgkgk...', '...kgk....', '....k.....']);
def('bag', ['...kkkk...', '..kWWWWk..', '..kW..Wk..', '.kWWWWWWk.', 'kWwwwwwwWk', 'kWwWWWWwWk', 'kWwwwwwwWk', 'kWwwwwwwWk', 'kWWWWWWWWk', '.kkkkkkkk.']);
def('radio', ['..k.......', '...k......', '.kkkkkkkk.', 'kXXXXXXXXk', 'kXggkkcXXk', 'kXggkkyXXk', 'kXXXXXXXXk', 'kXkXkXkXXk', 'kXXXXXXXXk', '.kkkkkkkk.']);
def('scroll', ['.kkkkkkkk.', 'kcccccccck', '.kcckkcck.', '.kcccccck.', '.kckkkkcck', '.kcccccck.', '.kckkkcck.', '.kcccccck.', 'kcccccccck', '.kkkkkkkk.']);
def('hall', ['....kk....', '...kddk...', '..kddddk..', '.kkkkkkkk.', '.kcckkcck.', '.kcckkcck.', '.kcckkcck.', '.kcckkcck.', 'kkkkkkkkkk', 'kddddddddk']);
def('people', ['..kk..kk..', '.kook.kook', '.kook.kook', '..kk..kk..', '.kcck.kcck', 'kcccckkcck', 'kcccckkcck', '.kkkk.kkkk', '..........', '..........']);
def('world', ['...kkkk...', '..kbbggk..', '.kbbgggbk.', 'kbbbggbbbk', 'kbgggbbbbk', 'kbggbbbgbk', '.kbbbbggk.', '..kbbbbk..', '...kkkk...', '..........']);
def('moon', ['...kkkk...', '..kzzzk...', '.kzzzk....', '.kzzk.....', '.kzzk.....', '.kzzk.....', '.kzzzk....', '..kzzzkk..', '...kzzzzk.', '....kkkk..']);
def('warn', ['....kk....', '...kyyk...', '...kykk...', '..kyykyk..', '..kyykyk..', '.kyyyyyyk.', '.kyyykyyk.', 'kyyyyyyyyk', 'kyyyyyyyyk', '.kkkkkkkk.']);
def('bed', ['..........', 'kk........', 'kWk.......', 'kWkkkkkkkk', 'kWcccrrrck', 'kWcccrrrck', 'kWWWWWWWWk', 'kWk......k', 'kk.......kk', '..........']);
def('map', ['..........', 'kkkkkkkkkk', 'kppppppppk', 'kpkpkppppk', 'kppppkpppk', 'kpppppkrpk', 'kppppppRrk', 'kppppppppk', 'kkkkkkkkkk', '..........']);
def('house', ['....kk....', '...kddk...', '..kddddk..', '.kddddddk.', 'kkddddddkk', '.kccccccK.', '.kccWWccK.', '.kccWWccK.', '.kccWWccK.', '.kkkkkkkk.']);
def('pause', ['..........', '.kkk..kkk.', '.kck..kck.', '.kck..kck.', '.kck..kck.', '.kck..kck.', '.kck..kck.', '.kck..kck.', '.kkk..kkk.', '..........']);
def('play', ['..........', '.kk.......', '.kcck.....', '.kcccck...', '.kcccccck.', '.kcccccck.', '.kcccck...', '.kcck.....', '.kk.......', '..........']);
def('blood', ['....kk....', '....kk....', '...krrk...', '...krrk...', '..krrrrk..', '.krrRrrrk.', '.krrRrrrk.', '.krrrrrRk.', '..krrrRk..', '...kkkk...']);
def('sick', ['....kk....', '...kzzk...', '...kzrk...', '...kzrk...', '...kzrk...', '...kzrk...', '..kzrrrk..', '..krrrrk..', '..krrrrk..', '...kkkk...']);
def('bread', ['..........', '...kkkk...', '.kkoooookk', 'kodddddddk', 'kododddodk', 'koddddddok', 'kooddddooK', '.kkkkkkkk.', '..........', '..........']);
def('cloud', ['..........', '...kkkk...', '..kxxxxk..', '.kxxxxxxkk', 'kxxxxxxxxxk', '.kxxxxxxxk.', '..kkkkkkk.', '..........', '..........', '..........'].map((r) => r.slice(0, 10)));
def('eye', ['..........', '..........', '...kkkk...', '.kkzzzzkk.', 'kzzzbbzzzk', 'kzzzbkzzzk', '.kkzzzzkk.', '...kkkk...', '..........', '..........']);
def('hush', ['..kkkkkk..', '.kooooook.', 'kokookkook', 'kooooooook', 'kokkkkkkok', 'kooooooook', '.kooooook.', '..kkkkkk..', '..........', '..........']);
def('target', ['...kkkk...', '..krrrrk..', '.krkkkkrk.', 'krkrrrrkrk', 'krkrkkrkrk', 'krkrkkrkrk', 'krkrrrrkrk', '.krkkkkrk.', '..krrrrk..', '...kkkk...']);
def('tap', ['....kk....', '...kccK...', '...kccK...', '...kccK...', '.kkkccKkk.', 'kcccccccck', 'kcccccccck', '.kcccccck.', '..kcccck..', '...kkkk...']);
def('tools', ['..kk......', '.kssk...kk', '.ksSk..kWk', '..kSk.kWk.', '..kSkkWk..', '...kWWk...', '..kWWkSk..', '.kWWk.kSk.', 'kWWk...kSk', '.kk.....kk']);
def('voice', ['.......k..', '..kk....k.', '.kccK..k.k', '.kccKk.k.k', '.kccK..k.k', '..kk....k.', '.......k..', '..........', '..........', '..........']);
def('feet', ['..kk..kk..', '.kcck.kcck', '.kcck.kcck', '.kcck.kcck', '..kk..kk..', '..........', '.kk..kk...', 'kcck.kcck.', '.kk...kk..', '..........']);
def('bolt', ['....kkk...', '...kyyk...', '..kyyk....', '.kyyyyyk..', '..kkyyk...', '...kyk....', '...kyk....', '....k.....', '..........', '..........']);
def('lock', ['...kkkk...', '..kS..Sk..', '..kS..Sk..', '.kkkkkkkk.', 'kyyyyyyyyk', 'kyyykkyyyk', 'kyyykkyyyk', 'kyyyyyyyyk', '.kkkkkkkk.', '..........']);
def('clock', ['...kkkk...', '..kzzzzk..', '.kzzzkzzzk', 'kzzzzkzzzk', 'kzzzzkkkzk', 'kzzzzzzzzk', '.kzzzzzzk.', '..kzzzzk..', '...kkkk...', '..........']);
def('gear', ['....kk....', '.kk.ss.kk.', '.kssssssk.', '..ksSSsk..', 'kssSkkSssk', 'kssSkkSssk', '..ksSSsk..', '.kssssssk.', '.kk.ss.kk.', '....kk....']);

const MAP = { '☠': 'skull', '🍚': 'food', '🍲': 'meal', '💧': 'water', '🪵': 'wood', '⚙': 'gear', '🧵': 'cloth', '💊': 'meds', '🩹': 'bandage', '🍶': 'ogogoro', '🏏': 'club', '🔪': 'machete', '🔫': 'pistol', '❤': 'heart', '🚪': 'door', '☰': 'menu', '💬': 'talk', '📓': 'journal', '✓': 'check', '🎒': 'bag', '📻': 'radio', '📜': 'scroll', '🏛': 'hall', '👥': 'people', '🌍': 'world', '🌙': 'moon', '⚠': 'warn', '🛏': 'bed', '🗺': 'map', '🏠': 'house', '⏸': 'pause', '▶': 'play', '🩸': 'blood', '🤒': 'sick', '🍞': 'bread', '☁': 'cloud', '👁': 'eye', '🤫': 'hush', '🎯': 'target', '👆': 'tap', '🛠': 'tools', '🗣': 'voice', '👣': 'feet', '⚡': 'bolt', '🔒': 'lock' };
const ITEM_ICON = { food: 'food', meal: 'meal', water: 'water', wood: 'wood', parts: 'parts', cloth: 'cloth', meds: 'meds', bandage: 'bandage', ogogoro: 'ogogoro', club: 'club', machete: 'machete', pistol: 'pistol', knife: 'knife', bullets: 'bullet', crowbar: 'crowbar', lockpick: 'lockpick', shovel: 'shovel' };

const cache = {};
function svg(name) {
  if (cache[name]) return cache[name]; const rows = I[name]; if (!rows) return ''; let o = '';
  rows.forEach((row, y) => { row = (row + '..........').slice(0, 10); let x = 0; while (x < 10) { const ch = row[x]; if (ch === '.' || !PAL[ch]) { x++; continue; } let e = x; while (e + 1 < 10 && row[e + 1] === ch) e++; o += `<rect x="${x}" y="${y}" width="${e - x + 1}" height="1" fill="${PAL[ch]}"/>`; x = e + 1; } });
  return (cache[name] = `<svg class="ic" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">${o}</svg>`);
}
const html = (name) => `<span class="icw" data-ic="${name}">${svg(name)}</span>`;
const item = (k) => (ITEM_ICON[k] ? html(ITEM_ICON[k]) : '');

/* swap emoji in the page's text for icons. Safe to call as often as you like. */
const RE = new RegExp('(' + Object.keys(MAP).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\uFE0F?', 'g');
function skin(el) {
  if (typeof document === 'undefined' || !el || !document.createTreeWalker) return;
  const w = document.createTreeWalker(el, 4 /* SHOW_TEXT */, null); const hits = []; let n;
  while ((n = w.nextNode())) { if (n.nodeValue && RE.test(n.nodeValue)) hits.push(n); RE.lastIndex = 0; if (n.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.nodeName)) hits.pop(); }
  hits.forEach((t) => { const span = document.createElement('span'); span.innerHTML = t.nodeValue.replace(/[&<]/g, (c) => (c === '&' ? '&amp;' : '&lt;')).replace(RE, (m, e) => html(MAP[e])); t.parentNode.replaceChild(span, t); span.className = 'ics'; });
}
/* swap emoji in anything added to the page, without walking the whole page again */
if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
  const start = () => {
    if (!document.body) return; skin(document.body);
    new MutationObserver((recs) => { recs.forEach((r) => r.addedNodes.forEach((n) => { if (n.nodeType === 3) { if (n.parentNode && !n.parentNode.ownerSVGElement) skin(n.parentNode); } else if (n.nodeType === 1 && n.nodeName !== 'svg' && !n.ownerSVGElement) skin(n); })); }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}
C.Icons = { svg, html, item, skin, MAP, names: Object.keys(I) };
if (typeof module !== 'undefined') module.exports = C.Icons;
})(typeof window !== 'undefined' ? window : globalThis);
