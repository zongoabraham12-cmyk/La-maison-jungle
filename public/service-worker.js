const CACHE_NAME = 'ventepros-cache-v4';

// Pré-mise en cache des ressources critiques au moment de l'installation
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
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
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  const url = event.request.url;
  const isFontOrIcon = url.includes('fonts.googleapis.com') || 
                       url.includes('fonts.gstatic.com') ||
                       url.endsWith('.woff2') || 
                       url.endsWith('.woff') || 
                       url.endsWith('.ttf');

  // Pour les polices et icônes : stratégie CACHE FIRST pour un rendu immédiat sans clignotement ni déformation
  if (isFontOrIcon) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(response => {
          if (response && (response.status === 200 || response.type === 'opaque')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Pour les autres requêtes : Réseau d'abord avec repli sur le cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && (response.status === 200 || response.type === 'opaque')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
