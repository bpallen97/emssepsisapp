const CACHE = 'sepsis-alert-v2';
const FILES = [
  '/emssepsisapp/',
  '/emssepsisapp/index.html',
  '/emssepsisapp/manifest.json',
  '/emssepsisapp/icons/icon-192.png',
  '/emssepsisapp/icons/icon-512.png'
];

// Install: cache all files
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        // Cache any new resources we fetch
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      });
    }).catch(function() {
      // If completely offline and not cached, return the main app
      return caches.match('/emssepsisapp/index.html');
    })
  );
});
