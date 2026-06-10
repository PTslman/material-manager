const CACHE_NAME = 'material-manager-v3';
const urlsToCache = [
  '/material-manager/',
  '/material-manager/index.html',
  '/material-manager/manifest.json',
  '/material-manager/offline.html',
  '/material-manager/css/style.css',
  '/material-manager/js/firebase-config.js',
  '/material-manager/js/ai-engine.js',
  '/material-manager/js/app.js',
  '/material-manager/js/modules/utils.js',
  '/material-manager/js/modules/ui.js',
  '/material-manager/js/modules/materials.js',
  '/material-manager/js/modules/presets.js',
  '/material-manager/js/modules/modals.js',
  '/material-manager/js/modules/events.js',
  '/material-manager/icons/icon-72x72.png',
  '/material-manager/icons/icon-96x96.png',
  '/material-manager/icons/icon-128x128.png',
  '/material-manager/icons/icon-144x144.png',
  '/material-manager/icons/icon-152x152.png',
  '/material-manager/icons/icon-192x192.png',
  '/material-manager/icons/icon-384x384.png',
  '/material-manager/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Caching files...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('[Service Worker] Activated successfully');
      return self.clients.claim();
    })
  );
});

// معالجة طلبات الشبكة
self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);
  
  // تجاهل طلبات Firebase والتحليلات (لا يتم تخزينها مؤقتاً)
  if (requestUrl.hostname.includes('firebase') || 
      requestUrl.hostname.includes('googleapis') ||
      requestUrl.hostname.includes('google-analytics')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(function(networkResponse) {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          })
          .catch(function() {
            // إذا كان الطلب لصفحة HTML، عرض صفحة عدم الاتصال
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/material-manager/offline.html');
            }
            return new Response('⚠️ غير متصل بالإنترنت', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
  );
});

// معالجة الرسائل
self.addEventListener('message', function(event) {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
