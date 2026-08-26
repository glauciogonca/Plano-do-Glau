/* Service worker do Plano Alimentar — v3
   HTML: network-first (pega atualizacoes). Demais: cache-first. */
const CACHE = 'plano-v4-4';
const ASSETS = ['./','./index.html','./manifest.json',
  './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))
    .then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isDoc = req.mode === 'navigate' || req.destination === 'document';

  if (isDoc) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put('./index.html', copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>hit))
  );
});
