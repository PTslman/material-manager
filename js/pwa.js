class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.installBtn = document.getElementById('installBtn');
        this.init();
    }
    
    init() {
        this.checkInstallation();
        this.setupEventListeners();
    }
    
    checkInstallation() {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            this.isInstalled = true;
            this.hideInstallButton();
        }
    }
    
    setupEventListeners() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallButton();
        });
        
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
            this.showManualInstructions();
            return;
        }
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showToast('✓ تم تثبيت التطبيق');
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

document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});
