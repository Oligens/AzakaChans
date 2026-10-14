// ============================================================
// AZAKA CHANS - Service Worker
// Version: 1.0.0
// ============================================================

const CACHE_NAME = 'azaka-chans-v1';
const OFFLINE_URL = '/offline.html';

// Ressources à mettre en cache pour le fonctionnement hors ligne
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// URLs qui ne doivent JAMAIS être mises en cache (données sensibles)
const NO_CACHE_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /\/wallet/,
  /\/portefeuille/,
  /\/retrait/,
  /\/gestion-privee/,
  /\/admin/
];

// ============================================================
// INSTALLATION
// ============================================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources essentielles');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Erreur lors de l\'installation:', error);
      })
  );
});

// ============================================================
// ACTIVATION
// ============================================================

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation terminée');
        return self.clients.claim();
      })
  );
});

// ============================================================
// INTERCEPTION DES REQUÊTES
// ============================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Vérifier si l'URL ne doit pas être mise en cache
  const shouldNotCache = NO_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (shouldNotCache) {
    console.log('[Service Worker] Requête sensible, pas de cache:', url.pathname);
    return;
  }
  
  // Stratégie: Network First avec fallback sur le cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cloner la réponse pour la mettre en cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
        
        return response;
      })
      .catch((error) => {
        console.log('[Service Worker] Réseau indisponible, utilisation du cache:', url.pathname);
        
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Si c'est une navigation, retourner la page hors ligne
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // Sinon, retourner une réponse d'erreur
            return new Response('Hors ligne', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// ============================================================
// MESSAGES
// ============================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[Service Worker] Cache vidé');
    });
  }
});

// ============================================================
// NOTIFICATIONS PUSH (optionnel)
// ============================================================

self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'AZAKA CHANS', options)
  );
});

// ============================================================
// CLIC SUR NOTIFICATION
// ============================================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Vérifier si une fenêtre est déjà ouverte
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[Service Worker] Service Worker chargé');
