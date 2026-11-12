/* Tempomacher service worker: network first, cache as offline fallback.
   New versions pushed to GitHub are picked up on the next online visit. */
const CACHE = 'tempomacher-v2.23.0';
const CORE = ['./', './index.html', './config.js', './manifest.webmanifest', './manifest-en.webmanifest', './icons/apple-touch-icon.png', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== 'tm-share').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  // shared from another app (Android «Teilen» → Tempomacher): park the files, then open the app, which imports them
  if (req.method === 'POST' && new URL(req.url).pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      try {
        const fd = await req.formData(), c = await caches.open('tm-share');
        let i = 0;
        for (const f of fd.getAll('files')) {
          if (!f || typeof f === 'string') continue;
          await c.put(new Request('./shared/' + Date.now() + '-' + (i++) + '-' + encodeURIComponent(f.name || 'screenshot.png')), new Response(f, {headers: {'Content-Type': f.type || 'application/octet-stream'}}));
        }
      } catch (x) {}
      return Response.redirect('./?shared=1', 303);
    })());
    return;
  }
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
