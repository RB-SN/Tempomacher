/* Tempomacher service worker: network first, cache as offline fallback.
   New versions pushed to GitHub are picked up on the next online visit. */
const CACHE = 'tempomacher-v2.13.0';
const CORE = ['./', './index.html', './config.js', './manifest.webmanifest', './manifest-en.webmanifest', './icons/apple-touch-icon.png', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // only this site and the fonts; requests to the online storage or the text recognition go straight to the network
  const u = new URL(req.url);
  if (u.origin !== location.origin && !u.hostname.startsWith('fonts.')) return;
  e.respondWith(
    // the page itself always fresh from the server (bypasses the browser's HTTP cache), so a new upload shows up on the next visit
    fetch(req.mode === 'navigate' || /\/(index\.html)?$/.test(u.pathname) || u.pathname.endsWith('config.js') ? new Request(req, {cache: 'no-store'}) : req).then(res => {
      if (res.ok && (new URL(req.url).origin === location.origin || req.url.startsWith('https://fonts.'))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
