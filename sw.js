const CACHE_NAME = 'material-manager-v9';
const urlsToCache = [
    '/material-manager/',
    '/material-manager/index.html',
    '/material-manager/css/style.css',
    '/material-manager/js/firebase-config.js',
    '/material-manager/js/ai-engine.js',
    '/material-manager/js/app.js',
    '/material-manager/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch(() => {
            return caches.match('/material-manager/index.html');
        })
    );
});

// تحديث تلقائي عند وجود نسخة جديدة
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
