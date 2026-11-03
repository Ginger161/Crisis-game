const CACHE = 'crisis-v45';
const FILES = ['./', 'index.html', 'style.css', 'game.js', 'settings.js', 'ui.js', 'audio.js', 'menu.js', 'campus.js', 'sprites.js', 'side.js', 'scenes.js', 'icons.js', 'wheel.js', 'sim.js', 'house.js', 'sites.js', 'expedition.js', 'voice.js', 'cast.js', 'groups.js', 'lore.js', 'story.js', 'storylets.js', 'politics.js', 'polylets.js', 'procedural.js', 'life.js', 'tutorial.js', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
