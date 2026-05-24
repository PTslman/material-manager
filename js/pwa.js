// pwa.js - إدارة تثبيت PWA

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.installBtn = document.getElementById('installBtn');
        
        this.init();
    }
    
    init() {
        this.checkInstallation();
        this.setupEventListeners();
    }
    
    checkInstallation() {
        // التحقق مما إذا كان التطبيق مثبتاً بالفعل
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            this.hideInstallButton();
        }
    }
    
    setupEventListeners() {
        // حدث التثبيت من المتصفح
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('✅ beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // حدث نجاح التثبيت
        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully');
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallButton();
        });
        
        // زر التثبيت المخصص
        if (this.installBtn) {
            this.installBtn.addEventListener('click', () => this.promptInstall());
        }
    }
    
    showInstallButton() {
        if (this.installBtn && !this.isInstalled) {
            this.installBtn.style.display = 'inline-flex';
        }
    }
    
    hideInstallButton() {
        if (this.installBtn) {
            this.installBtn.style.display = 'none';
        }
    }
    
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('No installation prompt available');
            this.showManualInstructions();
            return;
        }
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted installation');
        } else {
            console.log('User dismissed installation');
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
}

// بدء تشغيل PWA Manager
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});
// تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/material-manager/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}
