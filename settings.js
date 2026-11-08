/* CRISIS — settings (saved on the device) */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const KEY = 'crisis_settings';
const DEFAULTS = { text: 'm', reduce: false, sound: true, master: 0.8, music: 0.55, sfx: 0.8, haptics: true, gore: true, perf: 'auto', layout: 'auto', tutorialSeen: false, egg: false };
const S = { v: Object.assign({}, DEFAULTS), onChange: null,
  load() { try { const raw = localStorage.getItem(KEY); if (raw) S.v = Object.assign({}, DEFAULTS, JSON.parse(raw)); const lay = localStorage.getItem('crisis_layout'); if (lay && !(raw && JSON.parse(raw).layout)) S.v.layout = lay; } catch (e) {} S.apply(); return S.v; },
  save() { try { localStorage.setItem(KEY, JSON.stringify(S.v)); } catch (e) {} },
  set(k, val) { S.v[k] = val; S.save(); S.apply(); if (S.onChange) S.onChange(k, val); },
  reset() { S.v = Object.assign({}, DEFAULTS, { tutorialSeen: S.v.tutorialSeen, egg: S.v.egg }); S.save(); S.apply(); if (S.onChange) S.onChange('all'); },
  apply() {
    if (typeof document === 'undefined' || !document.documentElement || !document.documentElement.classList) return;
    const h = document.documentElement.classList;
    ['t-s', 't-m', 't-l', 't-xl'].forEach((c) => h.remove(c)); h.add('t-' + S.v.text);
    if (S.v.reduce) h.add('reduce'); else h.remove('reduce');
    if (C.Audio && C.Audio.apply) C.Audio.apply();
    if (C.Perf && C.Perf.apply && C.Perf.chosen !== S.v.perf) C.Perf.apply();
    /* layout: auto picks PC for a mouse and a big window; PC or Phone forces it (a touchscreen laptop, a big tablet) */
    try { const cur = localStorage.getItem('crisis_layout') || 'auto'; if (cur !== S.v.layout) { if (S.v.layout === 'auto') localStorage.removeItem('crisis_layout'); else localStorage.setItem('crisis_layout', S.v.layout); if (root.__pickLayout) root.__pickLayout(); } } catch (e) {}
  }
};
C.Settings = S;
/* the word for pressing something: Tap on a phone, Click on a PC (tw(true) is capitalised) */
C.tw = (cap) => { const pc = typeof document !== 'undefined' && document.documentElement && document.documentElement.classList.contains('pc'); return pc ? (cap ? 'Click' : 'click') : (cap ? 'Tap' : 'tap'); };
if (typeof module !== 'undefined') module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
