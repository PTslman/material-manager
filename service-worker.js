// service-worker.js
const CACHE_NAME = 'materials-pwa-v18';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/ui.js',
  '/js/firebase-config.js',
  '/js/constants.js',
  '/js/utils.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Tajawal:wght@400;500;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js'
];

// تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الكاش وتخزين الملفات');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('فشل تخزين الملفات:', err))
  );
  self.skipWaiting();
});

// استراتيجية: Cache First ثم Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع الملف من الكاش إذا وجد
        if (response) {
          return response;
        }
        // وإلا جلب من الشبكة
        return fetch(event.request)
          .then(response => {
            // التحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // تخزين نسخة من الملف الجديد في الكاش
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// تفعيل Service Worker وحذف الكاش القديم
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker تم تفعيله بنجاح');
      return self.clients.claim();
    })
  );
});

// الاستماع لأحداث الدفع (Push Notifications) - للاستخدام المستقبلي
self.addEventListener('push', event => {
  const title = 'مدير المواد';
  const options = {
    body: event.data ? event.data.text() : 'يوجد تحديث في المخزون',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-72x72.png',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
