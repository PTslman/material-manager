// service-worker.js - Service Worker متقدم

const CACHE_NAME = 'materials-pwa-v3';
const DYNAMIC_CACHE = 'materials-dynamic-v3';
const API_CACHE = 'materials-api-v3';

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/ui.js',
  '/js/pwa.js',
  '/js/firebase-config.js',
  '/js/constants.js',
  '/js/utils.js',
  '/manifest.json',
  '/offline.html',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Tajawal:wght@400;500;700;800&display=swap',
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
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
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
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE && cache !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// استراتيجية: Cache First ثم Network للملفات الثابتة
// Network First ثم Cache للـ API
// Stale While Revalidate للملفات الديناميكية

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // تجاهل طلبات Chrome DevTools و Firebase Analytics
  if (url.pathname.includes('chrome-extension') || 
      url.pathname.includes('firebase-analytics') ||
      url.pathname.includes('__/firebase')) {
    return;
  }
  
  // استراتيجية Network First لـ Firestore API
  if (url.hostname.includes('firestore.googleapis.com')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // استراتيجية Cache First للملفات الثابتة
  if (STATIC_ASSETS.includes(event.request.url) || 
      event.request.url.includes('/css/') || 
      event.request.url.includes('/js/') ||
      event.request.url.includes('/icons/')) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // استراتيجية Stale While Revalidate للباقي
  event.respondWith(staleWhileRevalidateStrategy(event.request));
});

// استراتيجية Cache First
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    
    // إرجاع صفحة offline إذا كان طلب HTML
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// استراتيجية Network First
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, using cache:', request.url);
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// استراتيجية Stale While Revalidate
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.error('[SW] Fetch failed:', error);
    throw error;
  });
  
  return cached || fetchPromise;
}

// استقبال المزامنة الخلفية
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-materials') {
    event.waitUntil(syncMaterials());
  }
});

// مزامنة المواد في الخلفية
async function syncMaterials() {
  console.log('[SW] Syncing materials in background');
  
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_START',
        timestamp: new Date().toISOString()
      });
    });
    
    // يمكن إضافة منطق المزامنة هنا
    
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// استقبال الإشعارات
self.addEventListener('push', event => {
  console.log('[SW] Push notification received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'مدير المواد';
  const options = {
    body: data.body || 'يوجد تحديث في المخزون',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق'
      },
      {
        action: 'dismiss',
        title: 'إغلاق'
      }
    ]
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// التعامل مع النقر على الإشعار
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          return self.clients.openWindow('/');
        })
    );
  }
});

// استقبال رسائل من التطبيق
self.addEventListener('message', event => {
  console.log('[SW] Message from app:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// تحديث الملفات في الخلفية
self.addEventListener('periodicsync', event => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'sync-materials') {
    event.waitUntil(syncMaterials());
  }
});
