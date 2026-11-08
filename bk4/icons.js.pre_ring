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
def('weed', ['....kk....', '...kgGk...', '.k.kgGk.k.', 'kgk.kgk.kg', '.kgGkgkGgk', '..kgGgGgk.', '...kgGgk..', '....kGk...', '....kWk...', '....kWk...']);
def('loud', ['....kk....', '..kkGGkk..', '.kGgGGgGk.', 'kGgoGGogGk', 'kGGgGGgGGk', '.kGgGGgGk.', '..kGGGGk..', '...kkWkk..', '....kWk...', '....kk....']);
def('cigarettes', ['..........', '.kkkkkkkk.', '.kccccccok', '.kccccccok', '.kkkkkkkk.', '..........', '.kkkkkkkk.', '.kccccccok', '.kkkkkkkk.', '..........']);
def('tobacco', ['.....kk...', '....kddk..', '...kdwdk..', '..kdwddk..', '.kdwddk...', '.kdddk....', 'kddk......', 'kdk.......', 'kk........', '..........']);
def('paper', ['.kkkkkk...', '.kcccckk..', '.kcppcckk.', '.kccccccK.', '.kcppppcK.', '.kccccccK.', '.kcppppcK.', '.kccccccK.', '.kkkkkkkk.', '..........']);
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
const ITEM_ICON = { food: 'food', meal: 'meal', water: 'water', wood: 'wood', parts: 'parts', cloth: 'cloth', meds: 'meds', bandage: 'bandage', ogogoro: 'ogogoro', club: 'club', machete: 'machete', pistol: 'pistol', knife: 'knife', bullets: 'bullet', crowbar: 'crowbar', lockpick: 'lockpick', shovel: 'shovel', weed: 'weed', loud: 'loud', cigarettes: 'cigarettes', tobacco: 'tobacco', paper: 'paper', blanket: 'blanket', elec: 'elec', toolkit: 'toolkit', herbs: 'herbs' };

const cache = {};

/* ---------- charcoal line icons (24x24), drawn twice slightly offset so they read like pencil on paper ---------- */
const LINE = {
  food: 'M5 13h14M6 13c0 4 3 6 6 6s6-2 6-6M9 9c0-2 1-3 1-4M12 9c0-2 1-3 1-4M15 9c0-2 1-3 1-4',
  meal: 'M4 12h16M5 12c0 4 3 7 7 7s7-3 7-7M3 10h18M9 7c0-1 .8-2 .8-3M14 7c0-1 .8-2 .8-3',
  water: 'M12 3c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12zM9 15c0 2 1 3 3 3',
  wood: 'M4 9l14-4 2 4-14 4zM4 9l2 4M6 15l14-4 0 4-14 4zM6 15v4',
  parts: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M6 18l2-2',
  cloth: 'M4 7h16v4H4zM4 11c2 2 2 6 0 8M20 11c-2 2-2 6 0 8M4 19h16M9 7v4M15 7v4',
  meds: 'M7 6h10v14H7zM9 3h6v3H9zM12 10v6M9 13h6',
  bandage: 'M5 15l10-10 4 4-10 10zM9 11l4 4M11 9l1 1M13 11l1 1',
  ogogoro: 'M10 3h4v4l2 3v10H8V10l2-3zM8 13h8',
  knife: 'M4 20l3-3M7 17l11-11c1 3 0 6-3 9l-3 3M7 17l2 2',
  bullet: 'M10 21V11c0-4 1-7 2-8 1 1 2 4 2 8v10zM10 16h4',
  skull: 'M12 3a7 7 0 0 0-7 7c0 3 2 4 2 6v2h10v-2c0-2 2-3 2-6a7 7 0 0 0-7-7zM9 11h.5M15 11h.5M10 18v3M14 18v3M12 14v1',
  club: 'M5 19l9-9M14 10c1-3 4-6 6-6 0 2-3 5-6 6z',
  machete: 'M4 20l3-3M7 17L19 5c1 4-2 9-7 11l-3 3M7 17l2 2',
  pistol: 'M4 9h15v4H9l-1 7H5l1-7H4zM14 13v2',
  crowbar: 'M6 20L18 5c1-1 3 0 2 2M6 20l-2-1',
  blanket: 'M4 7h16v11H4zM4 11h16M4 15h16M8 7v11M16 7v11',
  fire: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 2 3 3 3 0-2-1-4 0-6zM10 21h4',
  elec: 'M7 7h10v10H7zM10 10h4v4h-4zM9 4v3M12 4v3M15 4v3M9 17v3M12 17v3M15 17v3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3',
  toolkit: 'M3 10h18v9H3zM9 10V7h6v3M3 14h18M11 13h2v2h-2z',
  herbs: 'M12 21V9M12 9c-3 0-5-2-5-5 3 0 5 2 5 5zM12 13c3 0 5-2 5-5-3 0-5 2-5 5zM12 17c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4z',
  lockpick: 'M5 19l10-10M15 9l3-3 2 2-3 3M15 9l2 2M8 16l-2 2',
  shovel: 'M12 3v11M9 14h6v3c0 2-1 4-3 4s-3-2-3-4zM10 3h4',
  weed: 'M12 21v-8M12 13c-1-4-1-7 0-10 1 3 1 6 0 10zM12 13c-3-2-6-2-8-1 2 2 5 2 8 1zM12 13c3-2 6-2 8-1-2 2-5 2-8 1zM12 15c-2 0-4 1-5 3M12 15c2 0 4 1 5 3',
  loud: 'M12 21v-6M12 15c-4-1-6-5-4-10 2 2 3 5 4 10zM12 15c4-1 6-5 4-10-2 2-3 5-4 10zM9 9h.5M15 11h.5',
  cigarettes: 'M3 14h14v3H3zM17 14h3v3h-3M19 11c0-2 1-2 1-4M16 11c0-2 1-2 1-4',
  tobacco: 'M5 19c3-9 8-14 15-15-1 7-6 12-15 15zM5 19l9-9M9 15h3M12 12h3',
  paper: 'M6 3h9l3 3v15H6zM15 3v3h3M9 10h6M9 13h6M9 16h4',
  heart: 'M12 20s-7-4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 10-7 10z',
  door: 'M6 3h12v18H6zM15 12h.5M4 21h16',
  menu: 'M4 7h16M4 12h16M4 17h16',
  talk: 'M4 5h16v10H10l-4 4v-4H4z',
  journal: 'M6 3h12v18H6zM9 3v18M12 8h4M12 11h4',
  check: 'M5 12l4 4 10-10',
  bag: 'M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2',
  radio: 'M4 9h16v11H4zM8 9l9-5M8 15a2 2 0 1 0 0 .1M14 13h3M14 16h3',
  scroll: 'M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2zM9 9h6M9 12h6M9 15h4',
  hall: 'M3 10l9-6 9 6M5 10v10M19 10v10M9 10v10M15 10v10M3 20h18',
  people: 'M8 11a3 3 0 1 0 0-.1M16 11a3 3 0 1 0 0-.1M3 20c0-3 2-5 5-5s5 2 5 5M11 20c0-3 2-5 5-5s5 2 5 5',
  world: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  moon: 'M15 3a8 8 0 1 0 6 12 7 7 0 0 1-6-12z',
  warn: 'M12 4l9 16H3zM12 10v5M12 18h.5',
  bed: 'M3 18v-8M3 14h18v4M21 18v-4M6 14v-3h5v3',
  map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14',
  house: 'M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 5l12 7-12 7z',
  blood: 'M12 4c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z',
  sick: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16zM9 10h.5M15 10h.5M9 16c2-2 4-2 6 0',
  bread: 'M4 12c0-4 4-6 8-6s8 2 8 6v6H4zM9 9v3M13 9v3',
  cloud: 'M7 18h10a4 4 0 0 0 0-8 5 5 0 0 0-9-1 4 4 0 0 0-1 9z',
  eye: 'M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z',
  hush: 'M7 10c1.5 0 2 2 2 4s-.6 4-2 4-2-2-2-4 .5-4 2-4zM15 6c1.5 0 2 2 2 4s-.6 4-2 4-2-2-2-4 .5-4 2-4zM6 20h3M14 16h3',
  target: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16zM12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 2v4M12 18v4M2 12h4M18 12h4',
  tap: 'M9 11V5a2 2 0 0 1 4 0v6l4 1c2 1 2 3 1 5l-2 4H9l-4-6c-1-2 1-3 2-2l2 2',
  tools: 'M5 19l8-8M13 11l3-3 3 3-3 3zM14 5c2-2 5-1 5 1l-3 3M4 7l3 3 3-3-3-3z',
  voice: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4',
  feet: 'M8 4c2 0 3 3 3 6s-1 5-3 5-3-2-3-5 1-6 3-6zM16 9c2 0 3 3 3 6s-1 5-3 5-3-2-3-5 1-6 3-6z',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4M12 15v2',
  clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7v5l3 3',
  gear: 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M5 19l2-2'
};
const TINT = { blood: '#a8321f', meds: '#e3d9c0', heart: '#c0503a', warn: '#c8a05a' };
function lineSvg(name) { const d = LINE[name]; if (!d) return ''; const c = TINT[name] || 'currentColor'; return `<svg class="ic line" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" transform="translate(.6 .5)" fill="none" stroke="${c}" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/></svg>`; }
function svg(name) {
  if (cache[name]) return cache[name]; if (LINE[name]) return (cache[name] = lineSvg(name)); const rows = I[name]; if (!rows) return ''; let o = '';
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
