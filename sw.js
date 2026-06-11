// ============================================
// Service Worker - مدير المواد الذكي
// ============================================

var CACHE_NAME = 'material-manager-v10';
var BASE_PATH = '/material-manager';
var OFFLINE_URL = BASE_PATH + '/offline.html';

var STATIC_CACHE_URLS = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/offline.html',
    BASE_PATH + '/manifest.json',
    BASE_PATH + '/css/style.css',
    BASE_PATH + '/js/firebase-config.js',
    BASE_PATH + '/js/ai-engine.js',
    BASE_PATH + '/js/ai-assistant.js',
    BASE_PATH + '/js/app.js',
    BASE_PATH + '/js/modules/utils.js',
    BASE_PATH + '/js/modules/ui.js',
    BASE_PATH + '/js/modules/materials.js',
    BASE_PATH + '/js/modules/presets.js',
    BASE_PATH + '/js/modules/dragdrop.js',
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

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(STATIC_CACHE_URLS); }).then(function() { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(cacheName) {
                if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
            }));
        }).then(function() { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function(event) {
    var requestUrl = new URL(event.request.url);
    if (requestUrl.hostname.includes('firebase') || requestUrl.hostname.includes('googleapis')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) return response;
            return fetch(event.request).then(function(networkResponse) {
                if (!networkResponse || networkResponse.status !== 200) return networkResponse;
                var responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, responseToCache); });
                return networkResponse;
            }).catch(function() {
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match(OFFLINE_URL);
                }
                return new Response('⚠️ غير متصل', { status: 503 });
            });
        })
    );
});

self.addEventListener('message', function(event) {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
