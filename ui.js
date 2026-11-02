/* CRISIS — small interface helpers
   More: a gentle ▼ at the bottom of any list that continues below the fold (instead of a scrollbar).
   toast: a short message, used to say WHY a greyed-out button can't be used. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const U = {};
const SEL = '.panel-area,#modal .story,#modal .btns,.locs,.mpage,.fullpage';
function upd(el) {
  const m = el._more; if (!m || !el.isConnected) return;
  const more = el.clientHeight > 0 && el.scrollHeight - el.scrollTop - el.clientHeight > 6;
  m.classList.toggle('on', more); m.style.top = (el.offsetTop + el.clientHeight - 24) + 'px'; m.style.left = el.offsetLeft + 'px'; m.style.width = el.offsetWidth + 'px';
}
U.refresh = function () {
  if (typeof document === 'undefined' || !document.querySelectorAll) return;
  document.querySelectorAll('.more').forEach((m) => { if (!m._owner || !m._owner.isConnected) m.remove(); });
  document.querySelectorAll(SEL).forEach((el) => {
    if (!el._more) {
      const par = el.parentElement; if (!par) return; if (getComputedStyle(par).position === 'static') par.style.position = 'relative';
      const m = document.createElement('div'); m.className = 'more'; m.textContent = '▼'; m._owner = el; par.appendChild(m); el._more = m;
      el.addEventListener('scroll', () => upd(el), { passive: true });
    }
    upd(el);
  });
};
U.soon = function () { if (typeof setTimeout === 'function') { setTimeout(U.refresh, 0); setTimeout(U.refresh, 250); } };
let tt = null;
U.toast = function (text) {
  if (typeof document === 'undefined' || !document.body) return; let t = document.getElementById('toast2');
  if (!t) { t = document.createElement('div'); t.id = 'toast2'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.innerHTML = String(text); t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2600);
};
if (typeof window !== 'undefined') { window.addEventListener('resize', U.soon); }
C.UI = U;
if (typeof module !== 'undefined') module.exports = U;
})(typeof window !== 'undefined' ? window : globalThis);
