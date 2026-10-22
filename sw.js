// Ataque Chicas Cocodrilo 1.0.0: guarda el juego en el celular para que funcione sin internet.
// Al subir una versión nueva, cambia el número de CACHE para que los celulares la descarguen.
const PREFIX = 'chicas-cocodrilo-';
const CACHE = PREFIX + '1.0.0';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // Solo borra versiones viejas de este juego (otros juegos del mismo sitio no se tocan)
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const net = fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => null);
  e.waitUntil(net);
  e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true }))
    .then(hit => hit || net.then(res => res || caches.match('./index.html'))));
});
