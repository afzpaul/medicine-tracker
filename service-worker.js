const CACHE_NAME = "dog-medicine-tracker-v1";
const urlsToCache = [
  "/medicine-tracker/",
  "/medicine-tracker/index.html",
  "/medicine-tracker/style.css",
  "/medicine-tracker/script.js",
  "/medicine-tracker/manifest.json",
  "/medicine-tracker/service-worker.js",
  "/medicine-tracker/samoyed.png" // Replace this with your correct image file name if different
];

// Install event - cache the app shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches if any
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      // Optional: you can add an offline fallback page here if you want
    })
  );
});
