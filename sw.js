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

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch(err => console.error('[SW] Installation failed:', err))
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
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
  
  // استراتيجية Cache First للملفات الثابتة
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
        console.error('[SW] Fetch failed:', error);
        if (event.request.mode === 'navigate') {
          return caches.match('/material-manager/offline.html');
        }
        throw error;
      })
  );
});

// استقبال رسائل من التطبيق
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
