const CACHE = 'crisis-v134';
const FILES = ['./', 'index.html', 'style.css', 'pc.css', 'mob.css', 'game.js', 'settings.js', 'perf.js', 'ui.js', 'audio.js', 'menu.js', 'manual.js', 'campus.js', 'sprites.js', 'side.js', 'scenes.js', 'icons.js', 'wheel.js', 'world.js', 'visits.js', 'ids.js', 'sim.js', 'house.js', 'sites.js', 'expedition.js', 'voice.js', 'cast.js', 'groups.js', 'lore.js', 'story.js', 'storylets.js', 'politics.js', 'polylets.js', 'procedural.js', 'life.js', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== AUDIO).map(k => caches.delete(k)))));   /* the sound files outlive releases: they are big and they do not change */
  self.clients.claim();
});
/* the game's own files come from the cache first (fast on a weak connection, works offline);
   a new release changes CACHE above, which installs fresh copies. Anything else (fonts) goes to the network. */
const AUDIO = 'crisis-audio-v1';
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  /* sound: fetched whole the first time it plays (never the pieces a player asks for), then always from the phone */
  if (u.pathname.indexOf('/audio/') >= 0) {
    const key = u.origin + u.pathname;
    e.respondWith(caches.open(AUDIO).then(c => c.match(key).then(hit => hit || fetch(key).then(r => { if (r && r.status === 200) c.put(key, r.clone()); return r; }))));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match('index.html'))));
});
