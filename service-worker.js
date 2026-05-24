// service-worker.js - الإصدار النهائي والمتكامل

const CACHE_NAME = 'material-manager-v4';
const urlsToCache = [
  '/material-manager/',
  '/material-manager/index.html',
  '/material-manager/manifest.json',
  '/material-manager/offline.html',
  '/material-manager/css/style.css',
  '/material-manager/js/app.js',
  '/material-manager/js/ui.js',
  '/material-manager/js/pwa.js',
  '/material-manager/js/firebase-config.js',
  '/material-manager/js/constants.js',
  '/material-manager/js/utils.js',
  '/material-manager/icons/icon-72x72.png',
  '/material-manager/icons/icon-96x96.png',
  '/material-manager/icons/icon-128x128.png',
  '/material-manager/icons/icon-144x144.png',
  '/material-manager/icons/icon-152x152.png',
  '/material-manager/icons/icon-192x192.png',
  '/material-manager/icons/icon-384x384.png',
  '/material-manager/icons/icon-512x512.png',
  '/material-manager/icons/maskable-icon.png',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Tajawal:wght@400;500;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation complete');
      return self.clients.claim();
    })
  );
});

// استراتيجية Cache First للملفات الثابتة
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // تجاهل طلبات التحليلات والإضافات
  if (url.pathname.includes('chrome-extension') || 
      url.pathname.includes('firebase-analytics') ||
      url.pathname.includes('__/firebase')) {
    return;
  }
  
  // لطلبات HTML، استخدم Network First ثم Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              return caches.match('/material-manager/offline.html');
            });
        })
    );
    return;
  }
  
  // للملفات الأخرى، استخدم Cache First
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          });
      })
      .catch(error => {
        console.error('[Service Worker] Fetch failed:', error);
        throw error;
      })
  );
});

// استقبال رسائل من التطبيق
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
