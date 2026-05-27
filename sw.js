const CACHE_NAME = 'butcem-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Eğer projenin içinde yerel CSS veya JS dosyaları olsaydı buraya ekleyecektik.
  // Tailwind ve FontAwesome CDN üzerinden geldiği için standart HTML dosyasını önbelleğe almamız yeterli.
];

// Service Worker Kurulumu (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Eski Önbellekleri Temizleme (Activate)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// İstekleri Yakalama (Fetch)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Önbellekte varsa onu döndür, yoksa internetten çek
        return response || fetch(event.request);
      })
  );
});
