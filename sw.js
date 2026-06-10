// ============================================
// Service Worker - مدير المواد الذكي
// الإصدار: v9.0 - متوافق مع GitHub Pages
// المسار الأساسي: /material-manager/
// ============================================

// تحديد المسار الأساسي
const BASE_PATH = '/material-manager';
const CACHE_NAME = 'material-manager-v9.0.0';
const OFFLINE_URL = BASE_PATH + '/offline.html';

// الملفات التي سيتم تخزينها مؤقتاً
const STATIC_CACHE_URLS = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/offline.html',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/css/style.css',
  BASE_PATH + '/js/firebase-config.js',
  BASE_PATH + '/js/ai-engine.js',
  BASE_PATH + '/js/app.js',
  BASE_PATH + '/js/modules/utils.js',
  BASE_PATH + '/js/modules/ui.js',
  BASE_PATH + '/js/modules/materials.js',
  BASE_PATH + '/js/modules/presets.js',
  BASE_PATH + '/js/modules/modals.js',
  BASE_PATH + '/js/modules/events.js',
  BASE_PATH + '/icons/icon-72x72.png',
  BASE_PATH + '/icons/icon-96x96.png',
  BASE_PATH + '/icons/icon-128x128.png',
  BASE_PATH + '/icons/icon-144x144.png',
  BASE_PATH + '/icons/icon-152x152.png',
  BASE_PATH + '/icons/icon-192x192.png',
  BASE_PATH + '/icons/icon-384x384.png',
  BASE_PATH + '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...', BASE_PATH);
  
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
  var requestUrl = new URL(event.request.url);
  
  // تجاهل طلبات التحليلات والإحصائيات
  if (requestUrl.hostname.includes('google-analytics') || 
      requestUrl.hostname.includes('googletagmanager')) {
    return;
  }
  
  // معالجة طلبات الجذر - إعادة توجيه إلى المسار الأساسي
  if (requestUrl.pathname === '/' && requestUrl.hostname.includes('github.io')) {
    event.respondWith(
      Response.redirect(BASE_PATH + '/', 301)
    );
    return;
  }
  
  // استراتيجية التخزين المؤقت
  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(function(networkResponse) {
            // التحقق من صحة الاستجابة
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // تخزين نسخة من الاستجابة
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
              return caches.match(OFFLINE_URL);
            }
            
            // إرجاع استجابة خطأ بسيطة
            return new Response('⚠️ غير متصل بالإنترنت', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
  );
});

// معالجة طلبات Firebase بشكل خاص
self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);
  
  // لطلبات Firebase - استراتيجية Network First
  if (requestUrl.hostname.includes('firebase') || 
      requestUrl.hostname.includes('googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(function() {
          return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: new Headers({ 'Content-Type': 'application/json' })
          });
        })
    );
  }
});

// معالجة الرسائل من التطبيق
self.addEventListener('message', function(event) {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(function() {
      event.source.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
});

// مزامنة الخلفية (Background Sync)
self.addEventListener('sync', function(event) {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-materials') {
    event.waitUntil(
      (async function() {
        try {
          var cache = await caches.open(CACHE_NAME);
          var pendingRequests = await cache.match(BASE_PATH + '/pending-operations');
          
          if (pendingRequests) {
            var operations = await pendingRequests.json();
            
            for (var i = 0; i < operations.length; i++) {
              var op = operations[i];
              await fetch(op.url, {
                method: op.method,
                headers: op.headers,
                body: JSON.stringify(op.body)
              });
            }
            
            await cache.delete(BASE_PATH + '/pending-operations');
            
            var clients = await self.clients.matchAll();
            for (var i = 0; i < clients.length; i++) {
              clients[i].postMessage({
                type: 'SYNC_COMPLETE',
                message: 'تمت مزامنة جميع العمليات المعلقة'
              });
            }
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
  
  var options = {
    body: event.data ? event.data.text() : 'تحديث جديد في مدير المواد',
    icon: BASE_PATH + '/icons/icon-192x192.png',
    badge: BASE_PATH + '/icons/icon-72x72.png',
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
  console.log('[Service Worker] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          return clients.openWindow(BASE_PATH + '/');
        })
    );
  }
});

// تسجيل الأخطاء
self.addEventListener('error', function(event) {
  console.error('[Service Worker] Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// تحديث التطبيق في الخلفية
self.addEventListener('periodicsync', function(event) {
  console.log('[Service Worker] Periodic sync:', event.tag);
  
  if (event.tag === 'update-data') {
    event.waitUntil(
      (async function() {
        try {
          var cache = await caches.open(CACHE_NAME);
          var response = await fetch(BASE_PATH + '/');
          await cache.put(BASE_PATH + '/', response);
          console.log('[Service Worker] Data updated in background');
        } catch(error) {
          console.error('[Service Worker] Background update failed:', error);
        }
      })()
    );
  }
});
