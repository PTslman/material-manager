class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.init();
    }
    
    async init() {
        console.log('📱 PWA Manager initializing...');
        this.checkInstallation();
        await this.registerServiceWorker();
        this.setupEventListeners();
        this.monitorNetwork();
    }
    
    checkInstallation() {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ App is installed (standalone mode)');
            this.hideInstallButton();
        }
        if (localStorage.getItem('pwa_installed') === 'true') {
            this.isInstalled = true;
            this.hideInstallButton();
        }
    }
    
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Worker not supported');
            return false;
        }
        try {
            this.swRegistration = await navigator.serviceWorker.register('/material-manager/service-worker.js', {
                scope: '/material-manager/'
            });
            console.log('✅ Service Worker registered:', this.swRegistration.scope);
            return true;
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            return false;
        }
    }
    
    setupEventListeners() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎯 beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully');
            this.isInstalled = true;
            localStorage.setItem('pwa_installed', 'true');
            this.deferredPrompt = null;
            this.hideInstallButton();
        });
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.addEventListener('click', () => this.promptInstall());
    }
    
    showInstallButton() {
        if (this.isInstalled) return;
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
    }
    
    hideInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'none';
    }
    
    async promptInstall() {
        if (!this.deferredPrompt) {
            this.showManualInstructions();
            return;
        }
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted installation');
        }
        this.deferredPrompt = null;
        this.hideInstallButton();
    }
    
    showManualInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isChrome = /Chrome/.test(navigator.userAgent);
        let message = '';
        if (isIOS) {
            message = 'اضغط على زر المشاركة ثم "أضف إلى الشاشة الرئيسية"';
        } else if (isChrome) {
            message = 'اضغط على القائمة (٣ نقاط) ثم "تثبيت التطبيق"';
        } else {
            message = 'اضغط على القائمة في المتصفح واختر "تثبيت التطبيق"';
        }
        alert(message);
    }
    
    monitorNetwork() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🟢 App is online');
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('🔴 App is offline');
        });
    }
    
    getAppInfo() {
        return {
            installed: this.isInstalled,
            online: this.isOnline,
            swRegistered: !!this.swRegistration,
            displayMode: this.getDisplayMode()
        };
    }
    
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
        return 'browser';
    }
}

let pwaManager = null;
document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new PWAManager();
    window.pwaManager = pwaManager;
    console.log('📱 PWA Info:', pwaManager.getAppInfo());
});
