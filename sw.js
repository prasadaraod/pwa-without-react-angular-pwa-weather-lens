const CACHE_NAME = 'weather-lens-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/weather-api.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 1. Install Event: Cache Shell Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching shell assets...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache store:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch Event: Intercept network calls
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Strategy for Weather API Calls: Network First, Fallback to Cache
  if (requestUrl.hostname.includes('api.openweathermap.org')) {
    event.respondWith(
      fetch(event.request)
        .then(cachedResponse => {
          // Clone and put the updated fresh weather data into the cache
          const responseClone = cachedResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return cachedResponse;
        })
        .catch(() => {
          // If offline, match the exact previous API call from cache
          return caches.match(event.request);
        })
    );
  } else {
    // Strategy for Local Static App Shell Assets: Cache First, Fallback to Network
    event.respondWith(
      caches.match(event.request).then(resource => {
        return resource || fetch(event.request);
      })
    );
  }
});