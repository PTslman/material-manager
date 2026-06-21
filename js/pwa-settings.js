// ==================== إعدادات PWA المتقدمة ====================

const PWASettings = {
    installPrompt: null,
    isInstalled: false,
    
    init() {
        this.checkInstallStatus();
        this.setupBeforeInstallPrompt();
        this.setupUpdateListener();
    },
    
    checkInstallStatus() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            const installBtn = document.getElementById('installBtn');
            if (installBtn) installBtn.style.display = 'none';
        }
        
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            if (e.matches) {
                this.isInstalled = true;
                const installBtn = document.getElementById('installBtn');
                if (installBtn) installBtn.style.display = 'none';
            }
        });
    },
    
    setupBeforeInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            const installBtn = document.getElementById('installBtn');
            if (installBtn && !this.isInstalled) {
                installBtn.style.display = 'inline-flex';
            }
        });
    },
    
    promptInstall() {
        if (this.installPrompt) {
            this.installPrompt.prompt();
            this.installPrompt.userChoice.then((result) => {
                if (result.outcome === 'accepted') {
                    this.isInstalled = true;
                    const installBtn = document.getElementById('installBtn');
                    if (installBtn) installBtn.style.display = 'none';
                }
                this.installPrompt = null;
            });
        } else {
            showToastMessage('📱 يمكنك تثبيت التطبيق من قائمة المتصفح', false);
        }
    },
    
    setupUpdateListener() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showToastMessage('🔄 تحديث جديد متاح! أعد تحميل الصفحة', false);
                        }
                    });
                });
            });
        }
    },
    
    async registerBackgroundSync() {
        if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return false;
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-materials');
            return true;
        } catch(e) {
            return false;
        }
    }
};

window.PWASettings = PWASettings;
