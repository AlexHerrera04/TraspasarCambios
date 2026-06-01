const CACHE_NAME = "openkx-cache-v2";

const urlsToCache = [
  "/icon-192.png",
  "/icon-512.png"
];

// Instal·lació: cachejar fitxers bàsics
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activació: netejar caches antigues
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all([
        self.clients.claim(),
        ...keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      ])
    )
  );
});

// Fetch: servir des de cache si existeix
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
