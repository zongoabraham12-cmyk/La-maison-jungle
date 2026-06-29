const CACHE_NAME = 'ventepros-cache-v3';

// Stratégie réseau d'abord : essaie le réseau, revient au cache si hors-ligne
self.addEventListener('install', event => {
  // Force le nouveau service worker à prendre le contrôle immédiatement
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Supprime les anciens caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET et les extensions Chrome
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre en cache la réponse fraîche
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si pas de réseau, utiliser le cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          // Retourner index.html pour les navigations (Single Page App)
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
