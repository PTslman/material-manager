var CACHE_NAME = 'material-manager-v9';
var urlsToCache = [
    '/', '/index.html', '/offline.html', '/manifest.json', '/css/style.css',
    '/js/firebase-config.js', '/js/ai-engine.js', '/js/app.js',
    '/js/modules/utils.js', '/js/modules/ui.js', '/js/modules/materials.js',
    '/js/modules/presets.js', '/js/modules/modals.js', '/js/modules/events.js',
    '/icons/icon-72x72.png', '/icons/icon-96x96.png', '/icons/icon-128x128.png',
    '/icons/icon-144x144.png', '/icons/icon-152x152.png', '/icons/icon-192x192.png',
    '/icons/icon-384x384.png', '/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js'
];
self.addEventListener('install', function(event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(urlsToCache); }).then(function() { return self.skipWaiting(); }));
});
self.addEventListener('activate', function(event) {
    event.waitUntil(caches.keys().then(function(keys) { return Promise.all(keys.filter(function(key) { return key !== CACHE_NAME; }).map(function(key) { return caches.delete(key); })); }).then(function() { return self.clients.claim(); }));
});
self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) { return response || fetch(event.request).catch(function() { if (event.request.mode === 'navigate') return caches.match('/offline.html'); return new Response('⚠️ غير متصل', { status: 503 }); }); }));
});
self.addEventListener('message', function(event) { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });
