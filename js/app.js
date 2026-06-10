document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    bindEvents();
    startListener();
    initPWA();
    
    window.allMaterials = allMaterials;
    window.closeAllModals = closeAllModals;
// تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('✅ Service Worker registered successfully:', registration);
                
                // التحقق من وجود تحديثات
                registration.addEventListener('updatefound', function() {
                    const newWorker = registration.installing;
                    console.log('🔄 New Service Worker found:', newWorker);
                    
                    newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('📦 New update available! Reload to apply.');
                            showToast('📦 تحديث جديد متاح! قم بإعادة التحميل', false);
                        }
                    });
                });
            })
            .catch(function(error) {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}

// طلب تفعيل مزامنة الخلفية
function requestBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(function(registration) {
            registration.sync.register('sync-materials')
                .then(function() {
                    console.log('✅ Background sync registered');
                })
                .catch(function(error) {
                    console.error('❌ Background sync registration failed:', error);
                });
        });
    }
}
