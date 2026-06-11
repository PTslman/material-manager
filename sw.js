// =====================================================
// Service Worker - مدير المواد الذكي v10.0
// تقنيات متطورة - ذكاء اصطناعي - أداء عالي
// يشبه تطبيقات iOS و Android
// =====================================================

// ==================== الإعدادات المتقدمة ====================
const CACHE_NAME = 'material-manager-v10';
const BASE_PATH = '/material-manager';
const OFFLINE_URL = BASE_PATH + '/offline.html';
const API_CACHE_NAME = 'material-manager-api-v1';
const IMAGE_CACHE_NAME = 'material-manager-images-v1';
const DYNAMIC_CACHE_NAME = 'material-manager-dynamic-v1';

// استراتيجيات التخزين المؤقت المتقدمة
const CACHE_STRATEGIES = {
    STATIC: 'static',
    DYNAMIC: 'dynamic',
    IMAGE: 'image',
    API: 'api',
    NETWORK_FIRST: 'network-first',
    CACHE_FIRST: 'cache-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// ==================== نظام الذكاء الاصطناعي المتقدم ====================
const AIBrain = {
    // بيانات التعلم
    learningData: {
        userBehavior: {
            peakHours: {},
            averageSessionTime: 0,
            frequentActions: {},
            offlineUsage: 0,
            syncSuccessRate: 100
        },
        predictions: {
            nextSyncTime: null,
            likelyActions: [],
            prefetchResources: []
        },
        performance: {
            cacheHitRate: 0,
            averageResponseTime: 0,
            lastOptimization: Date.now()
        }
    },
    
    // تهيئة الذكاء الاصطناعي
    init: async function() {
        try {
            const saved = await this.getFromCache('ai_brain_data');
            if (saved) {
                this.learningData = JSON.parse(saved);
            }
            this.startLearning();
            this.optimizePerformance();
        } catch(e) {}
    },
    
    // حفظ بيانات التعلم
    save: async function() {
        try {
            await this.saveToCache('ai_brain_data', JSON.stringify(this.learningData));
        } catch(e) {}
    },
    
    // بدء عملية التعلم المستمر
    startLearning: function() {
        // تحليل سلوك المستخدم كل ساعة
        setInterval(() => this.analyzeUserBehavior(), 3600000);
        // تحسين الأداء كل 6 ساعات
        setInterval(() => this.optimizePerformance(), 21600000);
        // تحديث التنبؤات كل 30 دقيقة
        setInterval(() => this.updatePredictions(), 1800000);
    },
    
    // تحليل سلوك المستخدم
    analyzeUserBehavior: function() {
        const now = new Date();
        const hour = now.getHours();
        this.learningData.userBehavior.peakHours[hour] = (this.learningData.userBehavior.peakHours[hour] || 0) + 1;
        this.save();
    },
    
    // تحديث التنبؤات الذكية
    updatePredictions: function() {
        // توقع وقت الذروة التالي
        let maxHour = 0, maxCount = 0;
        for (const [hour, count] of Object.entries(this.learningData.userBehavior.peakHours)) {
            if (count > maxCount) {
                maxCount = count;
                maxHour = parseInt(hour);
            }
        }
        
        // توقع الإجراءات التالية بناءً على الوقت
        const currentHour = new Date().getHours();
        if (Math.abs(currentHour - maxHour) <= 2) {
            this.learningData.predictions.likelyActions = ['sync', 'add_material'];
            this.learningData.predictions.prefetchResources = ['/css/style.css', '/js/app.js'];
        }
        
        this.save();
    },
    
    // تحسين الأداء
    optimizePerformance: function() {
        const now = Date.now();
        const timeSinceLastOptimization = now - this.learningData.performance.lastOptimization;
        
        if (timeSinceLastOptimization > 21600000) { // 6 ساعات
            this.clearOldCaches();
            this.learningData.performance.lastOptimization = now;
            this.save();
        }
    },
    
    // تنظيف الكاشات القديمة
    clearOldCaches: async function() {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
            name !== CACHE_NAME && 
            name !== API_CACHE_NAME && 
            name !== IMAGE_CACHE_NAME && 
            name !== DYNAMIC_CACHE_NAME
        );
        await Promise.all(oldCaches.map(name => caches.delete(name)));
    },
    
    // تسجيل تفاعل المستخدم
    recordInteraction: function(action, success) {
        this.learningData.userBehavior.frequentActions[action] = (this.learningData.userBehavior.frequentActions[action] || 0) + 1;
        if (action === 'sync') {
            this.learningData.userBehavior.syncSuccessRate = 
                (this.learningData.userBehavior.syncSuccessRate * 0.9 + (success ? 100 : 0) * 0.1);
        }
        this.save();
    },
    
    // الحصول على توصيات ذكية
    getSmartRecommendations: function() {
        return {
            bestTimeToSync: this.getBestSyncTime(),
            suggestedPrefetch: this.learningData.predictions.prefetchResources,
            likelyActions: this.learningData.predictions.likelyActions,
            cacheHitRate: this.learningData.performance.cacheHitRate
        };
    },
    
    // أفضل وقت للمزامنة
    getBestSyncTime: function() {
        let maxHour = 0, maxCount = 0;
        for (const [hour, count] of Object.entries(this.learningData.userBehavior.peakHours)) {
            if (count > maxCount) {
                maxCount = count;
                maxHour = parseInt(hour);
            }
        }
        return maxHour;
    },
    
    // حفظ في الكاش
    saveToCache: async function(key, data) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        await cache.put(key, new Response(data));
    },
    
    // استرجاع من الكاش
    getFromCache: async function(key) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const response = await cache.match(key);
        if (response) {
            return await response.text();
        }
        return null;
    }
};

// ==================== الملفات الثابتة ====================
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

// ==================== تثبيت Service Worker ====================
self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            await AIBrain.init();
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(STATIC_CACHE_URLS);
            await self.skipWaiting();
        })()
    );
});

// ==================== تفعيل Service Worker ====================
self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            await AIBrain.clearOldCaches();
            await self.clients.claim();
        })()
    );
});

// ==================== استراتيجية ذكية للتعامل مع الطلبات ====================
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const requestUrl = event.request.url;
    
    // استراتيجية للطلبات السريعة (API)
    if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
        event.respondWith(networkFirstStrategy(event.request));
        return;
    }
    
    // استراتيجية للصور
    if (requestUrl.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
        event.respondWith(imageStrategy(event.request));
        return;
    }
    
    // استراتيجية للملفات الثابتة
    if (STATIC_CACHE_URLS.some(cacheUrl => requestUrl.includes(cacheUrl))) {
        event.respondWith(cacheFirstStrategy(event.request));
        return;
    }
    
    // استراتيجية stale-while-revalidate للمحتوى الديناميكي
    event.respondWith(staleWhileRevalidateStrategy(event.request));
});

// ==================== استراتيجية Cache First ====================
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        AIBrain.learningData.performance.cacheHitRate = 
            (AIBrain.learningData.performance.cacheHitRate * 0.95 + 100 * 0.05);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        AIBrain.learningData.performance.cacheHitRate = 
            (AIBrain.learningData.performance.cacheHitRate * 0.95 + 0 * 0.05);
        return networkResponse;
    } catch(error) {
        if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
        }
        return new Response('⚠️ غير متصل', { status: 503 });
    }
}

// ==================== استراتيجية Network First ====================
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        AIBrain.recordInteraction('sync', true);
        return networkResponse;
    } catch(error) {
        AIBrain.recordInteraction('sync', false);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ==================== استراتيجية Stale While Revalidate ====================
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => null);
    
    if (cachedResponse) {
        event.waitUntil(fetchPromise);
        return cachedResponse;
    }
    
    const networkResponse = await fetchPromise;
    if (networkResponse) {
        return networkResponse;
    }
    
    return new Response('⚠️ غير متاح حالياً', { status: 404 });
}

// ==================== استراتيجية الصور ====================
async function imageStrategy(request) {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch(error) {
        return new Response(null, { status: 404, statusText: 'Image not found' });
    }
}

// ==================== مزامنة الخلفية الذكية ====================
self.addEventListener('sync', event => {
    if (event.tag === 'sync-materials') {
        event.waitUntil(
            (async () => {
                const cache = await caches.open(DYNAMIC_CACHE_NAME);
                const pendingRequests = await cache.match('/pending-operations');
                
                if (pendingRequests) {
                    const operations = await pendingRequests.json();
                    let successCount = 0;
                    
                    for (const op of operations) {
                        try {
                            await fetch(op.url, {
                                method: op.method,
                                headers: op.headers,
                                body: JSON.stringify(op.body)
                            });
                            successCount++;
                        } catch(e) {}
                    }
                    
                    await cache.delete('/pending-operations');
                    
                    const clients = await self.clients.matchAll();
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'SYNC_COMPLETE',
                            successCount: successCount,
                            totalCount: operations.length
                        });
                    });
                    
                    AIBrain.recordInteraction('background_sync', true);
                }
            })()
        );
    }
});

// ==================== مزامنة دورية متقدمة ====================
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-data') {
        event.waitUntil(
            (async () => {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    const response = await fetch(BASE_PATH + '/');
                    await cache.put(BASE_PATH + '/', response);
                    
                    const clients = await self.clients.matchAll();
                    clients.forEach(client => {
                        client.postMessage({ type: 'BACKGROUND_UPDATE', timestamp: Date.now() });
                    });
                } catch(error) {}
            })()
        );
    }
});

// ==================== إشعارات Push ذكية ====================
self.addEventListener('push', event => {
    const recommendations = AIBrain.getSmartRecommendations();
    
    let title = 'مدير المواد الذكي';
    let body = 'تحديث جديد في المخزون';
    let icon = BASE_PATH + '/icons/icon-192x192.png';
    let badge = BASE_PATH + '/icons/icon-72x72.png';
    
    if (recommendations.bestTimeToSync === new Date().getHours()) {
        body = '⏰ وقت المزامنة المثالي - قم بمزامنة بياناتك الآن';
    } else if (recommendations.likelyActions.includes('add_material')) {
        body = '📦 يبدو أنك بحاجة لإضافة مواد جديدة - هل تريد إضافتها الآن؟';
    }
    
    const options = {
        body: body,
        icon: icon,
        badge: badge,
        vibrate: [200, 100, 200],
        data: { dateOfArrival: Date.now() },
        actions: [
            { action: 'open', title: 'فتح التطبيق' },
            { action: 'dismiss', title: 'تجاهل' }
        ],
        dir: 'rtl',
        lang: 'ar',
        renotify: true,
        requireInteraction: false,
        tag: 'material-manager-notification'
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
});

// ==================== التعامل مع الإشعارات ====================
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(clientList => {
                    if (clientList.length > 0) {
                        return clientList[0].focus();
                    }
                    return clients.openWindow(BASE_PATH + '/');
                })
        );
    }
});

// ==================== معالجة الرسائل من التطبيق ====================
self.addEventListener('message', event => {
    const data = event.data;
    
    if (data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (data && data.type === 'RECORD_INTERACTION') {
        AIBrain.recordInteraction(data.action, data.success);
    }
    
    if (data && data.type === 'GET_RECOMMENDATIONS') {
        event.source.postMessage({
            type: 'RECOMMENDATIONS',
            data: AIBrain.getSmartRecommendations()
        });
    }
    
    if (data && data.type === 'PREFETCH') {
        event.waitUntil(
            (async () => {
                for (const url of data.urls) {
                    const cache = await caches.open(DYNAMIC_CACHE_NAME);
                    const response = await fetch(url);
                    await cache.put(url, response);
                }
            })()
        );
    }
});

// ==================== تحسين الأداء في الخلفية ====================
setInterval(() => {
    AIBrain.updatePredictions();
}, 1800000); // كل 30 دقيقة

// ==================== تسجيل الأخطاء للتحليل ====================
self.addEventListener('error', event => {
    AIBrain.recordInteraction('error', false);
});

// ==================== تصدير الذكاء الاصطناعي للتطبيق ====================
self.AIBrain = AIBrain;
