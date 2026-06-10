// ============================================
// Service Worker - مدير المواد الذكي
// الإصدار: v9.0
// ============================================

const CACHE_NAME = 'material-manager-v9.0.0';
const OFFLINE_URL = '/offline.html';

const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/style.css',
  '/js/firebase-config.js',
  '/js/ai-engine.js',
  '/js/app.js',
  '/js/modules/utils.js',
  '/js/modules/ui.js',
  '/js/modules/materials.js',
  '/js/modules/presets.js',
  '/js/modules/modals.js',
  '/js/modules/events.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
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
        console.log('[Service Worker] Caching static assets...');
        return cache.addAll(STATIC_CACHE_URLS);
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
  const requestUrl = new URL(event.request.url);
  
  // استراتيجية: Cache First ثم Network
  if (STATIC_CACHE_URLS.some(url => requestUrl.pathname.includes(url) || requestUrl.href.includes(url))) {
    event.respondWith(
      caches.match(event.request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(function(networkResponse) {
              return caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            })
            .catch(function() {
              if (event.request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
              }
              return new Response('⚠️ غير متصل بالإنترنت', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'text/plain' })
              });
            });
        })
    );
  } else {
    // استراتيجية: Network First ثم Cache
    event.respondWith(
      fetch(event.request)
        .then(function(networkResponse) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(function() {
          return caches.match(event.request);
        })
    );
  }
});

// معالجة الرسائل
self.addEventListener('message', function(event) {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// مزامنة الخلفية (Background Sync)
self.addEventListener('sync', function(event) {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-materials') {
    event.waitUntil(
      (async function() {
        try {
          const cache = await caches.open(CACHE_NAME);
          const pendingRequests = await cache.match('/pending-operations');
          
          if (pendingRequests) {
            const operations = await pendingRequests.json();
            for (const op of operations) {
              await fetch(op.url, {
                method: op.method,
                headers: op.headers,
                body: JSON.stringify(op.body)
              });
            }
            await cache.delete('/pending-operations');
            
            const clients = await self.clients.matchAll();
            clients.forEach(function(client) {
              client.postMessage({
                type: 'SYNC_COMPLETE',
                message: 'تمت مزامنة جميع العمليات المعلقة'
              });
            });
          }
        } catch(error) {
          console.error('[Service Worker] Sync failed:', error);
        }
      })()
    );
  }
});

// إشعارات Push
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'تحديث جديد في مدير المواد',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق'
      },
      {
        action: 'dismiss',
        title: 'تجاهل'
      }
    ],
    dir: 'rtl',
    lang: 'ar'
  };
  
  event.waitUntil(
    self.registration.showNotification('مدير المواد الذكي', options)
  );
});

// التعامل مع الضغط على الإشعار
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          return clients.openWindow('/');
        })
    );
  }
});

// تسجيل الأخطاء
self.addEventListener('error', function(event) {
  console.error('[Service Worker] Error:', event.message, event.filename, event.lineno);
});
