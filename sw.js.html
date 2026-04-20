// =============================================
// SERVICE WORKER — ASISTEN AI VG (FIXED PATH)
// =============================================
const CACHE_VERSION = 'aivg-v1.0.1';

// Perbaikan: Menghilangkan folder /icons/ karena file kamu ada di root
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png' // Sesuaikan dengan nama file logo baru kamu
];

const FONT_CACHE = 'aivg-fonts-v1';

// ---- INSTALL ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Pre-caching shell files...');
      return cache.addAll(SHELL_FILES);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// ---- ACTIVATE ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION && name !== FONT_CACHE)
          .map((name) => {
            console.log('[SW] Menghapus cache lama:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ---- FETCH ----
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const apiDomains = [
    'generativelanguage.googleapis.com',
    'api.groq.com',
    'openrouter.ai',
    'api.together.xyz',
    'api.mistral.ai',
    'api.cohere.com',
    'api-inference.huggingface.co',
    'fonts.googleapis.com'
  ];

  if (url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) => {
        return cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  if (apiDomains.some(d => url.hostname.includes(d))) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          return caches.match('./index.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('./icon-512.png');
        }
      });
    })
  );
});
