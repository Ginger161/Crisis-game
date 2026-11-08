const CACHE = 'crisis-v113';
const FILES = ['./', 'index.html', 'style.css', 'pc.css', 'mob.css', 'game.js', 'settings.js', 'perf.js', 'ui.js', 'audio.js', 'menu.js', 'campus.js', 'sprites.js', 'side.js', 'scenes.js', 'icons.js', 'wheel.js', 'sim.js', 'house.js', 'sites.js', 'expedition.js', 'voice.js', 'cast.js', 'groups.js', 'lore.js', 'story.js', 'storylets.js', 'politics.js', 'polylets.js', 'procedural.js', 'life.js', 'tutorial.js', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
/* the game's own files come from the cache first (fast on a weak connection, works offline);
   a new release changes CACHE above, which installs fresh copies. Anything else (fonts) goes to the network. */
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match('index.html'))));
});
