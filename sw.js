// ============================================
// Service Worker - مدير المواد الذكي
// الإصدار: v10.0 - مع ذكاء اصطناعي مخفي
// ============================================

var CACHE_NAME = 'material-manager-v10';
var BASE_PATH = '/material-manager';
var OFFLINE_URL = BASE_PATH + '/offline.html';

// الذكاء الاصطناعي المخفي في Service Worker
var HiddenAIIntelligence = {
    // تحليلات الاستخدام
    usageAnalytics: {
        totalVisits: 0,
        totalActions: 0,
        popularHours: [],
        averageSessionTime: 0,
        lastActiveTime: null,
        materialTrends: {},
        userBehavior: {},
        offlineUsage: 0,
        syncAttempts: 0,
        successfulSyncs: 0
    },
    
    // تهيئة البيانات
    init: function() {
        try {
            var saved = localStorage.getItem('sw_hidden_ai_data');
            if (saved) {
                var data = JSON.parse(saved);
                this.usageAnalytics = data.usageAnalytics || this.usageAnalytics;
            }
        } catch(e) {}
    },
    
    // حفظ البيانات
    save: function() {
        try {
            localStorage.setItem('sw_hidden_ai_data', JSON.stringify({
                usageAnalytics: this.usageAnalytics,
                lastUpdate: Date.now()
            }));
        } catch(e) {}
    },
    
    // تسجيل زيارة
    recordVisit: function() {
        this.usageAnalytics.totalVisits++;
        var hour = new Date().getHours();
        if (!this.usageAnalytics.popularHours[hour]) {
            this.usageAnalytics.popularHours[hour] = 0;
        }
        this.usageAnalytics.popularHours[hour]++;
        this.usageAnalytics.lastActiveTime = Date.now();
        this.save();
    },
    
    // تسجيل إجراء
    recordAction: function(action, details) {
        this.usageAnalytics.totalActions++;
        if (!this.usageAnalytics.userBehavior[action]) {
            this.usageAnalytics.userBehavior[action] = 0;
        }
        this.usageAnalytics.userBehavior[action]++;
        
        if (details && details.material) {
            if (!this.usageAnalytics.materialTrends[details.material]) {
                this.usageAnalytics.materialTrends[details.material] = {
                    views: 0,
                    edits: 0,
                    moves: 0,
                    deletes: 0
                };
            }
            
            if (action === 'view') this.usageAnalytics.materialTrends[details.material].views++;
            if (action === 'edit') this.usageAnalytics.materialTrends[details.material].edits++;
            if (action === 'move') this.usageAnalytics.materialTrends[details.material].moves++;
            if (action === 'delete') this.usageAnalytics.materialTrends[details.material].deletes++;
        }
        
        this.save();
    },
    
    // تسجيل استخدام دون اتصال
    recordOfflineUse: function() {
        this.usageAnalytics.offlineUsage++;
        this.save();
    },
    
    // تسجيل محاولة مزامنة
    recordSyncAttempt: function(success) {
        this.usageAnalytics.syncAttempts++;
        if (success) {
            this.usageAnalytics.successfulSyncs++;
        }
        this.save();
    },
    
    // الحصول على رؤى ذكية
    getInsights: function() {
        var insights = [];
        var total = this.usageAnalytics.totalVisits;
        
        if (total > 0) {
            insights.push('📊 تم فتح التطبيق ' + total + ' مرة');
        }
        
        if (this.usageAnalytics.totalActions > 0) {
            insights.push('⚡ تم تنفيذ ' + this.usageAnalytics.totalActions + ' عملية');
        }
        
        var mostActiveHour = this.getMostActiveHour();
        if (mostActiveHour !== null) {
            insights.push('⏰ وقت الذروة: ' + mostActiveHour + ':00');
        }
        
        if (this.usageAnalytics.offlineUsage > 0) {
            insights.push('📴 تم استخدام التطبيق دون اتصال ' + this.usageAnalytics.offlineUsage + ' مرة');
        }
        
        var popularMaterials = this.getPopularMaterials();
        if (popularMaterials.length > 0) {
            insights.push('⭐ المواد الأكثر تفاعلاً: ' + popularMaterials.slice(0, 3).join(', '));
        }
        
        return insights;
    },
    
    getMostActiveHour: function() {
        var hours = this.usageAnalytics.popularHours;
        var maxHour = null;
        var maxCount = 0;
        for (var h in hours) {
            if (hours[h] > maxCount) {
                maxCount = hours[h];
                maxHour = h;
            }
        }
        return maxHour;
    },
    
    getPopularMaterials: function() {
        var trends = this.usageAnalytics.materialTrends;
        var materials = [];
        for (var m in trends) {
            materials.push({
                name: m,
                total: trends[m].views + trends[m].edits + trends[m].moves
            });
        }
        materials.sort(function(a, b) { return b.total - a.total; });
        return materials.slice(0, 5).map(function(m) { return m.name; });
    },
    
    // تحليل ذكي للبيانات
    analyzeData: function() {
        var analysis = {
            recommendations: [],
            predictions: [],
            alerts: []
        };
        
        // توصيات بناءً على سلوك المستخدم
        if (this.usageAnalytics.offlineUsage > 10) {
            analysis.recommendations.push('📱 أنت تستخدم التطبيق دون اتصال كثيراً - تأكد من المزامنة الدورية');
        }
        
        var syncSuccessRate = (this.usageAnalytics.successfulSyncs / this.usageAnalytics.syncAttempts) * 100;
        if (this.usageAnalytics.syncAttempts > 0 && syncSuccessRate < 80) {
            analysis.alerts.push('⚠️ نسبة نجاح المزامنة منخفضة (' + Math.round(syncSuccessRate) + '%) - تحقق من الاتصال');
        }
        
        return analysis;
    }
};

// تهيئة الذكاء الاصطناعي المخفي
HiddenAIIntelligence.init();

// الملفات التي سيتم تخزينها مؤقتاً
var STATIC_CACHE_URLS = [
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

// تثبيت Service Worker
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing...');
    HiddenAIIntelligence.recordVisit();
    
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
    
    // تجاهل طلبات Firebase والتحليلات
    if (requestUrl.hostname.includes('firebase') || 
        requestUrl.hostname.includes('googleapis') ||
        requestUrl.hostname.includes('google-analytics')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(function(networkResponse) {
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        var responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    })
                    .catch(function() {
                        HiddenAIIntelligence.recordOfflineUse();
                        if (event.request.headers.get('accept').includes('text/html')) {
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
});

// معالجة الرسائل من التطبيق
self.addEventListener('message', function(event) {
    var data = event.data;
    
    if (data.type === 'RECORD_ACTION') {
        HiddenAIIntelligence.recordAction(data.action, data.details);
        event.source.postMessage({ type: 'ACTION_RECORDED' });
    }
    
    if (data.type === 'GET_INSIGHTS') {
        var insights = HiddenAIIntelligence.getInsights();
        event.source.postMessage({ type: 'INSIGHTS', data: insights });
    }
    
    if (data.type === 'GET_ANALYSIS') {
        var analysis = HiddenAIIntelligence.analyzeData();
        event.source.postMessage({ type: 'ANALYSIS', data: analysis });
    }
    
    if (data.type === 'SYNC_COMPLETE') {
        HiddenAIIntelligence.recordSyncAttempt(true);
    }
    
    if (data.type === 'SYNC_FAILED') {
        HiddenAIIntelligence.recordSyncAttempt(false);
    }
    
    if (data.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// مزامنة الخلفية (Background Sync)
self.addEventListener('sync', function(event) {
    console.log('[Service Worker] Background sync:', event.tag);
    HiddenAIIntelligence.recordSyncAttempt(true);
    
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
                    HiddenAIIntelligence.recordSyncAttempt(false);
                }
            })()
        );
    }
});

// مزامنة دورية في الخلفية (Periodic Sync)
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
        lang: 'ar',
        renotify: true,
        requireInteraction: true
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

// تسجيل الأخطاء للتحليل
self.addEventListener('error', function(event) {
    console.error('[Service Worker] Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
    });
});

// إرسال تحليلات ذكية للتطبيق
setInterval(function() {
    self.clients.matchAll().then(function(clients) {
        for (var i = 0; i < clients.length; i++) {
            clients[i].postMessage({
                type: 'AI_UPDATE',
                insights: HiddenAIIntelligence.getInsights()
            });
        }
    });
}, 3600000); // كل ساعة
