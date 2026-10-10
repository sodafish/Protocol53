/* Protocol 53 — offline cache. Pagina: eerst netwerk (zo komen updates meteen binnen), anders cache. */
const VERSION = 'p53-v45';
const SHELL = ['./', './index.html', './cloud.js', './vendor/supabase.js', './manifest.webmanifest', './icons/app-180.png', './icons/app-192.png', './icons/app-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co')) return;           // database: altijd live
  const isPage = req.mode === 'navigate' || /\.(html|js|webmanifest|json)$/.test(url.pathname) || url.pathname.endsWith('/');
  if (url.origin === location.origin && isPage) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  // afbeeldingen en lettertypes: eerst cache, anders netwerk (en bewaren)
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
