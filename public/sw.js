// public/sw.js - FondPeace Modern PWA Service Worker
const CACHE_NAME = 'fondpeace-shell-v1';
const CORE_STATIC_ASSETS = [
  '/',
  '/site.webmanifest',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_STATIC_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Strictly bypass non-GET requests, API calls, WebSockets, Range media queries
  if (
    req.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/socket.io') ||
    url.pathname.includes('/post/mango') ||
    url.pathname.includes('/user/') ||
    req.headers.get('range')
  ) {
    return;
  }

  // Stale-While-Revalidate for static assets (scripts, styles, icons, fonts)
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2|ico)$/)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Network-first for HTML pages with offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match('/').then((fallback) => fallback || Response.error());
      })
    );
  }
});

/* ==========================================================================
   WEB PUSH NOTIFICATIONS & NATIVE SYSTEM ALERTS
   ========================================================================== */

// 1. Receive Push Payload from Backend or Service Worker trigger
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (_) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'FondPeace Community';
  const options = {
    body: data.body || 'You have new activity on FondPeace!',
    icon: data.icon || '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open FondPeace' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Handle Native Notification Click (Focus window or open new tab)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If an existing tab is open, focus it and navigate
        for (const client of windowClients) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

