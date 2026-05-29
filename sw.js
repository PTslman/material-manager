const CACHE_NAME = 'material-manager-v3';
const urlsToCache = [
  '/material-manager/',
  '/material-manager/index.html',
  '/material-manager/manifest.json',
  '/material-manager/offline.html',
  '/material-manager/css/style.css',
  '/material-manager/js/app.js',
  '/material-manager/js/pwa.js',
  '/material-manager/js/firebase-config.js',
  '/material-manager/js/utils.js',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cache => {
        if (cache !== CACHE_NAME) return caches.delete(cache);
      }));
    }).then(() => self.clients.claim())
  );
});
