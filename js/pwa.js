// pwa.js - الإصدار 2.0
// متكامل مع إشعارات، تثبيت، مزامنة خلفية، وتحديث تلقائي

class AdvancedPWA {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.notificationPermission = false;
        
        this.init();
    }
    
    async init() {
        console.log('📱 Advanced PWA v2.0 initializing...');
        this.checkInstallation();
        await this.registerServiceWorker();
        this.setupEventListeners();
        this.monitorNetwork();
        this.requestNotificationPermission();
        this.setupPeriodicSync();
    }
    
    // فحص هل التطبيق مثبت
    checkInstallation() {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ App is installed');
            this.hideInstallButton();
        }
    }
    
    // تسجيل Service Worker
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported');
            return false;
        }
        
        try {
            this.swRegistration = await navigator.serviceWorker.register('/material-manager/service-worker.js');
            console.log('✅ Service Worker registered:', this.swRegistration.scope);
            
            // التحقق من التحديثات
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
            
            return true;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return false;
        }
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // حدث التثبيت
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // حدث نجاح التثبيت
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.showToast('✓ تم تثبيت التطبيق بنجاح');
        });
        
        // أزرار التثبيت
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.promptInstall());
        }
    }
    
    // إظهار زر التثبيت
    showInstallButton() {
        if (this.isInstalled) return;
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
    }
    
    // إخفاء زر التثبيت
    hideInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'none';
    }
    
    // طلب التثبيت
    async promptInstall() {
        if (!this.deferredPrompt) {
            this.showInstallInstructions();
            return;
        }
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            this.showToast('✓ تم تثبيت التطبيق');
        }
        
        this.deferredPrompt = null;
        this.hideInstallButton();
    }
    
    // إظهار تعليمات التثبيت
    showInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const message = isIOS 
            ? 'اضغط على زر المشاركة ثم "أضف إلى الشاشة الرئيسية"'
            : 'اضغط على القائمة (٣ نقاط) ثم "تثبيت التطبيق"';
        alert(message);
    }
    
    // ==================== الإشعارات ====================
    
    // طلب إذن الإشعارات
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Notifications not supported');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            this.notificationPermission = true;
            console.log('✅ Notification permission already granted');
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
            if (this.notificationPermission) {
                console.log('✅ Notification permission granted');
                this.showNotification('مرحباً!', 'سيتم إعلامك عند إضافة مواد جديدة');
            }
            return this.notificationPermission;
        }
        
        return false;
    }
    
    // إظهار إشعار
    showNotification(title, body, icon = '/material-manager/icons/icon-192x192.png') {
        if (!this.notificationPermission && Notification.permission !== 'granted') {
            return;
        }
        
        if (document.visibilityState === 'visible') {
            // إذا كان التطبيق مفتوحاً، نظهر توست بدلاً من إشعار
            if (typeof showToast === 'function') {
                showToast(body);
            }
            return;
        }
        
        // إشعار حقيقي
        const options = {
            body: body,
            icon: icon,
            badge: '/material-manager/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            data: { url: window.location.href },
            actions: [
                { action: 'open', title: 'فتح التطبيق' }
            ]
        };
        
        if (this.swRegistration) {
            this.swRegistration.showNotification(title, options);
        } else if (Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }
    
    // إشعار عند إضافة مادة
    notifyMaterialAdded(materialName) {
        this.showNotification('✓ مادة جديدة', `تم إضافة "${materialName}" إلى المخزون`);
    }
    
    // إشعار عند التحديث
    showUpdateNotification() {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'update-notification';
        notificationDiv.innerHTML = `
            <div class="update-content">
                <i class="fas fa-download"></i>
                <span>يتوفر تحديث جديد للتطبيق!</span>
                <button id="updateAppBtn">تحديث الآن</button>
                <button id="dismissUpdateBtn">لاحقاً</button>
            </div>
        `;
        notificationDiv.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-surface);
            border-radius: 60px;
            padding: 12px 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10002;
            display: flex;
            gap: 12px;
            direction: rtl;
            border: 1px solid var(--border-light);
        `;
        document.body.appendChild(notificationDiv);
        
        document.getElementById('updateAppBtn')?.addEventListener('click', () => {
            window.location.reload();
        });
        document.getElementById('dismissUpdateBtn')?.addEventListener('click', () => {
            notificationDiv.remove();
        });
        
        setTimeout(() => notificationDiv.remove(), 10000);
    }
    
    // ==================== مراقبة الشبكة ====================
    monitorNetwork() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🟢 App is online');
            this.showToast('تم استعادة الاتصال بالإنترنت');
            this.syncData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('🔴 App is offline');
            this.showToast('لا يوجد اتصال بالإنترنت', true);
        });
    }
    
    // مزامنة البيانات عند استعادة الاتصال
    syncData() {
        if (typeof startListener === 'function') {
            if (window.unsubscribe) window.unsubscribe();
            startListener();
        }
    }
    
    // ==================== مزامنة الخلفية ====================
    setupPeriodicSync() {
        if ('periodicSync' in navigator.serviceWorker) {
            navigator.permissions.query({ name: 'periodic-background-sync' })
                .then(status => {
                    if (status.state === 'granted') {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.periodicSync.register('sync-materials', {
                                minInterval: 24 * 60 * 60 * 1000 // كل 24 ساعة
                            });
                            console.log('✅ Periodic sync registered');
                        });
                    }
                });
        }
    }
    
    // ==================== توست (منبثق) ====================
    showToast(message, isError = false) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, isError);
        } else {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.style.background = isError ? '#dc2626' : '#2e7d32';
            toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }
    }
    
    // ==================== معلومات التطبيق ====================
    getAppInfo() {
        return {
            installed: this.isInstalled,
            online: this.isOnline,
            notificationPermission: this.notificationPermission,
            serviceWorker: !!this.swRegistration,
            displayMode: this.getDisplayMode()
        };
    }
    
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        return 'browser';
    }
}

// تهيئة PWA
let pwaManager = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new AdvancedPWA();
    window.pwaManager = pwaManager;
    console.log('📱 PWA Info:', pwaManager.getAppInfo());
});
