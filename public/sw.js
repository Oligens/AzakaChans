// AZAKA CHANS — Service Worker
// Bumped cache version to force clients to discard stale/missing PWA assets.
const CACHE_NAME = 'azaka-chans-v2';
const OFFLINE_URL = '/offline.html';
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  OFFLINE_URL,
  '/icons/icon.svg'
];

const NO_CACHE_PATTERNS = [
  /\/api(?:\/|$)/,
  /\/auth(?:\/|$)/,
  /\/wallet/,
  /\/portefeuille/,
  /\/retrait/,
  /\/gestion-privee/,
  /\/admin/
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting())
      .catch((error) => {
        // Do not break app navigation if a non-essential precache resource fails.
        console.error('[Service Worker] Precache failed:', error);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name.startsWith('azaka-chans-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (NO_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) return;

  // Never cache error pages or API responses. A Vercel 5xx must not become
  // a cached application page and must not be replaced with a fake 503.
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        // Cache static resources and the SPA shell only, not arbitrary route URLs.
        const isStatic = /\.(?:js|css|svg|png|jpg|jpeg|webp|woff2?|ttf|ico|webmanifest)$/i.test(url.pathname);
        if (isStatic || url.pathname === '/' || url.pathname === '/index.html') {
          await cache.put(isStatic ? request : '/index.html', response.clone());
        }
      }
      return response;
    } catch (error) {
      console.warn('[Service Worker] Network unavailable:', url.pathname);
      const cached = await caches.match(request);
      if (cached) return cached;

      if (request.mode === 'navigate') {
        const appShell = await caches.match('/index.html');
        if (appShell) return appShell;
        const offlinePage = await caches.match(OFFLINE_URL);
        if (offlinePage) return offlinePage;
      }

      return new Response('Hors ligne — veuillez vérifier votre connexion.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(caches.delete(CACHE_NAME));
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { data = { body: event.data.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || 'AZAKA CHANS', {
    body: data.body || 'Nouvelle notification',
    icon: '/icons/icon.svg',
    data: { url: data.url || '/' },
    actions: Array.isArray(data.actions) ? data.actions : []
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => client.url === target);
    if (existing) return existing.focus();
    return clients.openWindow ? clients.openWindow(target) : undefined;
  }));
});

console.log('[Service Worker] AZAKA CHANS v2 loaded');
