// =============================================
// SERVICE WORKER — ASISTEN AI VG
// =============================================
// Versi cache — ubah angka ini setiap deploy baru
// agar browser mengambil file terbaru dari server.
const CACHE_VERSION = 'aivg-v1.0.0';

// File-file yang di-cache saat instalasi (shell aplikasi)
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-180.png'
];

// Font Google — di-cache saat pertama kali diakses
const FONT_CACHE = 'aivg-fonts-v1';

// ---- INSTALL ----
// Download dan simpan semua file shell ke cache.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Pre-caching shell files...');
      return cache.addAll(SHELL_FILES);
    }).then(() => {
      // Aktifkan SW baru langsung tanpa menunggu tab lama tutup
      return self.skipWaiting();
    })
  );
});

// ---- ACTIVATE ----
// Hapus cache lama yang tidak diperlukan lagi.
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
      // Ambil kontrol semua tab yang terbuka
      return self.clients.claim();
    })
  );
});

// ---- FETCH ----
// Strategi:
// • Navigasi halaman (HTML)     → Network First, fallback ke cache
// • Font Google                  → Cache First (jarang berubah)
// • API call (generativelanguage, groq, dll) → Network Only (tidak di-cache)
// • Aset statis (icon, css, dll) → Cache First, fallback ke network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- API call: selalu ke network, jangan di-cache ---
  const apiDomains = [
    'generativelanguage.googleapis.com',
    'api.groq.com',
    'openrouter.ai',
    'api.together.xyz',
    'api.mistral.ai',
    'api.cohere.com',
    'api-inference.huggingface.co',
    'fonts.googleapis.com'  // Google Fonts CSS (perlu online untuk update)
  ];

  // Font files (fonts.gstatic.com) — cache agresif
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

  // API / external domain → network only
  if (apiDomains.some(d => url.hostname.includes(d))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigasi (HTML) → Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update cache dengan versi terbaru dari network
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline? Tampilkan dari cache
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Aset statis → Cache First
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
        // Fallback untuk gambar yang hilang
        if (event.request.destination === 'image') {
          return caches.match('/icons/icon-192.png');
        }
      });
    })
  );
});

// ---- PUSH NOTIFICATION (opsional, siap dipakai) ----
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Asisten AI VG', {
      body: data.body || 'Ada pesan baru.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
