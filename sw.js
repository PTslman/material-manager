// sw.js - Service Worker متقدم لتطبيق مدير المواد
const CACHE_NAME = 'material-manager-v3';
const STATIC_CACHE = 'material-manager-static-v3';
const DYNAMIC_CACHE = 'material-manager-dynamic-v3';
const IMAGES_CACHE = 'material-manager-images-v3';

// الملفات الأساسية للتخزين المؤقت (المسار الأساسي للمشروع)
const PATH_PREFIX = '/material-manager';
const STATIC_ASSETS = [
  `${PATH_PREFIX}/`,
  `${PATH_PREFIX}/index.html`,
  `${PATH_PREFIX}/offline.html`,
  `${PATH_PREFIX}/css/style.css`,
  `${PATH_PREFIX}/js/app.js`,
  `${PATH_PREFIX}/js/ui.js`,
  `${PATH_PREFIX}/js/pwa.js`,
  `${PATH_PREFIX}/js/firebase-config.js`,
  `${PATH_PREFIX}/js/constants.js`,
  `${PATH_PREFIX}/js/utils.js`,
  `${PATH_PREFIX}/manifest.json`,
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Tajawal:wght@400;500;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
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
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== IMAGES_CACHE) {
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

// اعتراض الطلبات وتحديد الاستراتيجية المناسبة
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const requestUrl = event.request.url;

  // تجاهل طلبات التحليلات والإضافات
  if (url.pathname.includes('chrome-extension') || 
      url.pathname.includes('firebase-analytics') ||
      url.pathname.includes('__/firebase')) {
    return;
  }

  // استراتيجية Cache First للملفات الثابتة
  if (STATIC_ASSETS.includes(requestUrl) || 
      requestUrl.includes('/css/') || 
      requestUrl.includes('/js/') ||
      requestUrl === `${PATH_PREFIX}/manifest.json`) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }

  // استراتيجية Cache First للصور
  if (requestUrl.includes('/icons/') || 
      requestUrl.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
    event.respondWith(imageCacheStrategy(event.request));
    return;
  }

  // استراتيجية Network First لـ Firestore API
  if (url.hostname.includes('firestore.googleapis.com')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // استراتيجية Network First للملاحة (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // استراتيجية Stale While Revalidate للباقي
  event.respondWith(staleWhileRevalidateStrategy(event.request));
});

// ==================== الاستراتيجيات ====================

// استراتيجية Cache First (للأصول الثابتة)
async function cacheFirstStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
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
    if (request.mode === 'navigate') {
      return caches.match(`${PATH_PREFIX}/offline.html`);
    }
    throw error;
  }
}

// استراتيجية Network First (لـ API والملاحة)
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, using cache:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    if (request.mode === 'navigate') {
      return caches.match(`${PATH_PREFIX}/offline.html`);
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

// استراتيجية خاصة للصور
async function imageCacheStrategy(request) {
  const cache = await caches.open(IMAGES_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    console.log('[SW] Image cache hit:', request.url);
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Image fetch failed:', error);
    // إرجاع أيقونة افتراضية في حالة عدم وجود الصورة
    return caches.match(`${PATH_PREFIX}/icons/icon-192x192.png`);
  }
}

// ==================== المزامنة الخلفية ====================
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-materials') {
    event.waitUntil(syncMaterials());
  }
});

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
    // هنا يمكن إضافة منطق المزامنة مع Firebase
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

// ==================== الإشعارات ====================
self.addEventListener('push', event => {
  console.log('[SW] Push notification received:', event);
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'مدير المواد';
  const options = {
    body: data.body || 'يوجد تحديث في المخزون',
    icon: data.icon || `${PATH_PREFIX}/icons/icon-192x192.png`,
    badge: `${PATH_PREFIX}/icons/icon-72x72.png`,
    vibrate: [200, 100, 200],
    data: { url: data.url || `${PATH_PREFIX}/` },
    actions: [
      { action: 'open', title: 'فتح التطبيق' },
      { action: 'dismiss', title: 'إغلاق' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

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
          return self.clients.openWindow(`${PATH_PREFIX}/`);
        })
    );
  }
});

// ==================== التحديثات ====================
self.addEventListener('message', event => {
  console.log('[SW] Message from app:', event.data);
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => {
      keys.forEach(key => {
        if (key !== STATIC_CACHE) {
          caches.delete(key);
        }
      });
    });
  }
});

// المزامنة الدورية
self.addEventListener('periodicsync', event => {
  console.log('[SW] Periodic sync:', event.tag);
  if (event.tag === 'sync-materials') {
    event.waitUntil(syncMaterials());
  }
});
