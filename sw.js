var CACHE = 'eurotrip2026-v1';
var ASSETS = [
  '/eurotrip2026/',
  '/eurotrip2026/index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install — cache core assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(['/eurotrip2026/', '/eurotrip2026/index.html']);
    }).then(function() { return self.skipWaiting(); })
  );
});

// Activate — clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', function(e) {
  // Skip non-GET and Supabase requests (always need fresh data)
  if (e.request.method !== 'GET') return;
  if (e.request.url.indexOf('supabase.co') !== -1) return;
  if (e.request.url.indexOf('corsproxy.io') !== -1) return;

  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        // Cache successful responses
        if (res && res.status === 200) {
          var resClone = res.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, resClone); });
        }
        return res;
      })
      .catch(function() {
        // Offline: serve from cache
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('/eurotrip2026/index.html');
        });
      })
  );
});
