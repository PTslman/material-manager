// pwa.js - إدارة PWA المتكاملة

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
    
    // التحقق من حالة التثبيت
    checkInstallation() {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ App is installed (standalone mode)');
        }
        
        if (localStorage.getItem('pwa_installed') === 'true') {
            this.isInstalled = true;
        }
    }
    
    // تسجيل Service Worker
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
            
            // التحقق من التحديثات
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                console.log('🔄 New Service Worker found');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
            
            return true;
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            return false;
        }
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // حدث التثبيت
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎯 beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        // حدث نجاح التثبيت
        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully');
            this.isInstalled = true;
            localStorage.setItem('pwa_installed', 'true');
            this.deferredPrompt = null;
            if (typeof showToast === 'function') {
                showToast('✓ تم تثبيت التطبيق بنجاح');
            }
        });
    }
    
    // إظهار نافذة التثبيت
    showInstallPrompt() {
        if (this.isInstalled) return;
        
        // إظهار نافذة مخصصة للتثبيت
        if (this.deferredPrompt) {
            const installDialog = document.createElement('div');
            installDialog.className = 'install-dialog';
            installDialog.innerHTML = `
                <div class="install-dialog-content">
                    <i class="fas fa-download"></i>
                    <h3>تثبيت التطبيق</h3>
                    <p>هل تريد تثبيت تطبيق مدير المواد على جهازك؟</p>
                    <div class="install-dialog-buttons">
                        <button id="confirmInstallBtn" class="btn-install">تثبيت</button>
                        <button id="cancelInstallBtn" class="btn-cancel">ليس الآن</button>
                    </div>
                </div>
            `;
            document.body.appendChild(installDialog);
            
            document.getElementById('confirmInstallBtn')?.addEventListener('click', () => {
                this.promptInstall();
                installDialog.remove();
            });
            document.getElementById('cancelInstallBtn')?.addEventListener('click', () => {
                installDialog.remove();
            });
        }
    }
    
    // طلب التثبيت
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('No installation prompt available');
            return;
        }
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted installation');
            this.isInstalled = true;
            localStorage.setItem('pwa_installed', 'true');
        } else {
            console.log('User dismissed installation');
        }
        
        this.deferredPrompt = null;
    }
    
    // إظهار إشعار التحديث
    showUpdateNotification() {
        const toast = document.createElement('div');
        toast.className = 'update-toast';
        toast.innerHTML = `
            <i class="fas fa-download"></i>
            <span>تحديث جديد متاح!</span>
            <button onclick="window.location.reload()">تحديث الآن</button>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #2e7d32;
            color: white;
            padding: 12px 20px;
            border-radius: 60px;
            font-size: 0.85rem;
            z-index: 10002;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            direction: rtl;
        `;
        const btn = toast.querySelector('button');
        if (btn) {
            btn.style.cssText = `
                background: white;
                color: #2e7d32;
                border: none;
                padding: 5px 15px;
                border-radius: 40px;
                cursor: pointer;
                font-weight: bold;
            `;
        }
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 10000);
    }
    
    // مراقبة حالة الشبكة
    monitorNetwork() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🟢 App is online');
            if (typeof showToast === 'function') {
                showToast('تم استعادة الاتصال بالإنترنت');
            }
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('🔴 App is offline');
            if (typeof showToast === 'function') {
                showToast('لا يوجد اتصال بالإنترنت', true);
            }
        });
    }
    
    // الحصول على معلومات PWA
    getInfo() {
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

// تهيئة PWA Manager
let pwaManager = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new PWAManager();
    window.pwaManager = pwaManager;
    console.log('📱 PWA Info:', pwaManager.getInfo());
});
