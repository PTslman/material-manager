// =====================================================
// Service Worker - مدير المواد الذكي v12.0
// =====================================================

const CACHE_NAME = 'material-manager-v12';
const BASE_PATH = '/material-manager';
const OFFLINE_URL = BASE_PATH + '/offline.html';

const STATIC_CACHE_URLS = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/offline.html',
    BASE_PATH + '/manifest.json',
    BASE_PATH + '/css/style.css',
    BASE_PATH + '/js/firebase-config.js',
    BASE_PATH + '/js/ai-engine.js',
    BASE_PATH + '/js/ai-assistant.js',
    BASE_PATH + '/js/app.js',
    BASE_PATH + '/js/pwa-settings.js',
    BASE_PATH + '/js/modules/utils.js',
    BASE_PATH + '/js/modules/ui.js',
    BASE_PATH + '/js/modules/materials.js',
    BASE_PATH + '/js/modules/presets.js',
    BASE_PATH + '/js/modules/dragdrop.js',
    BASE_PATH + '/js/modules/prices.js',
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

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_CACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    if (url.hostname.includes('firebase') || url.hostname.includes('google-analytics')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;
            return fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const cache = caches.open(CACHE_NAME);
                    cache.then(c => c.put(event.request, networkResponse.clone()));
                }
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
                return new Response('⚠️ غير متصل', { status: 503 });
            });
        })
    );
});

self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
