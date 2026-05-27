const CACHE_NAME = 'butcem-v2'; // Versiyonu v2 yaptık
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Uygulama yüklenirken ana dosyaları hafızaya al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Eski önbellek versiyonlarını temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// İstekleri yakala ve dinamik olarak CDN'leri de önbelleğe ekle
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Eğer dosya zaten önbellekte varsa (çevrimdışıysak) doğrudan oradan yükle
      if (cachedResponse) {
        return cachedResponse;
      }

      // Önbellekte yoksa internetten çek
      return fetch(event.request).then((networkResponse) => {
        // Gelen istek Tailwind, FontAwesome veya Google Fonts gibi dış CDN'lere aitse, 
        // bunu da yakala ve gelecekte offline kullanmak üzere hafızaya klonla.
        if (
          event.request.url.startsWith('http') && 
          (event.request.url.includes('tailwindcss') || 
           event.request.url.includes('cdnjs') || 
           event.request.url.includes('fonts'))
        ) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        // İnternet yoksa ve önbellekte de bulunamadıysa boş dön
        return null;
      });
    })
  );
});
