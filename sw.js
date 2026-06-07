var CACHE = 'eurotrip2026-v4';
var ASSETS = [
  '/eurotrip2026/',
  '/eurotrip2026/index.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.indexOf('supabase.co') !== -1) return;
  if (e.request.url.indexOf('corsproxy.io') !== -1) return;

  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        if (res && res.status === 200) {
          var resClone = res.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, resClone); });
        }
        return res;
      })
      .catch(function() {
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('/eurotrip2026/index.html');
        });
      })
  );
});
