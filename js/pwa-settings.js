// ==================== إعدادات PWA المتقدمة ====================

var PWASettings = {
    installPrompt: null,
    isInstalled: false,
    
    init: function() {
        this.checkInstallStatus();
        this.setupBeforeInstallPrompt();
        this.setupUpdateListener();
    },
    
    checkInstallStatus: function() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            var installBtn = document.getElementById('installBtn');
            if (installBtn) installBtn.style.display = 'none';
        }
        
        window.matchMedia('(display-mode: standalone)').addEventListener('change', function(e) {
            if (e.matches) {
                PWASettings.isInstalled = true;
                var installBtn = document.getElementById('installBtn');
                if (installBtn) installBtn.style.display = 'none';
            }
        });
    },
    
    setupBeforeInstallPrompt: function() {
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            PWASettings.installPrompt = e;
            var installBtn = document.getElementById('installBtn');
            if (installBtn && !PWASettings.isInstalled) {
                installBtn.style.display = 'inline-flex';
            }
        });
    },
    
    promptInstall: function() {
        if (this.installPrompt) {
            this.installPrompt.prompt();
            this.installPrompt.userChoice.then(function(result) {
                if (result.outcome === 'accepted') {
                    PWASettings.isInstalled = true;
                    var installBtn = document.getElementById('installBtn');
                    if (installBtn) installBtn.style.display = 'none';
                }
                PWASettings.installPrompt = null;
            });
        } else {
            if (typeof showToastMessage === 'function') {
                showToastMessage('📱 يمكنك تثبيت التطبيق من قائمة المتصفح', false);
            }
        }
    },
    
    setupUpdateListener: function() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(function(registration) {
                registration.addEventListener('updatefound', function() {
                    var newWorker = registration.installing;
                    newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (typeof showToastMessage === 'function') {
                                showToastMessage('🔄 تحديث جديد متاح! أعد تحميل الصفحة', false);
                            }
                        }
                    });
                });
            });
        }
    },
    
    registerBackgroundSync: async function() {
        if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return false;
        
        try {
            var registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-materials');
            return true;
        } catch(e) {
            return false;
        }
    }
};

window.PWASettings = PWASettings;
