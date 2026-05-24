// pwa.js - ملف PWA متكامل ومتقدم

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.installButton = null;
        this.installWelcomeBtn = null;
        this.beforeInstallEvent = null;
        
        this.init();
    }
    
    init() {
        this.checkInstallationStatus();
        this.registerServiceWorker();
        this.setupEventListeners();
        this.monitorOnlineStatus();
        this.setupPeriodicSync();
        this.setupBackgroundSync();
    }
    
    // تسجيل Service Worker متقدم
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('✅ Service Worker registered:', registration.scope);
                        
                        // التحقق من التحديثات
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            console.log('🔄 New Service Worker found:', newWorker);
                            
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.error('❌ Service Worker registration failed:', error);
                    });
                
                // التحقق من وجود Service Worker نشط
                navigator.serviceWorker.ready.then(registration => {
                    console.log('✅ Service Worker ready:', registration);
                });
            });
        }
    }
    
    // التحقق من تثبيت التطبيق
    checkInstallationStatus() {
        // التحقق من وضع العرض المستقل
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('✅ App is installed and running in standalone mode');
            this.hideInstallButtons();
        }
        
        // التحقق من قبل iOS
        if (navigator.standalone) {
            this.isInstalled = true;
            console.log('✅ iOS app is installed');
            this.hideInstallButtons();
        }
        
        // التحقق من localStorage
        if (localStorage.getItem('pwa-installed') === 'true') {
            this.isInstalled = true;
            this.hideInstallButtons();
        }
    }
    
    // إخفاء أزرار التثبيت
    hideInstallButtons() {
        const installBtn = document.getElementById('installBtn');
        const installWelcomeBtn = document.getElementById('installWelcomeBtn');
        if (installBtn) installBtn.style.display = 'none';
        if (installWelcomeBtn) installWelcomeBtn.style.display = 'none';
    }
    
    // إظهار أزرار التثبيت
    showInstallButtons() {
        if (!this.isInstalled && this.deferredPrompt) {
            const installBtn = document.getElementById('installBtn');
            const installWelcomeBtn = document.getElementById('installWelcomeBtn');
            if (installBtn) installBtn.style.display = 'inline-flex';
            if (installWelcomeBtn) installWelcomeBtn.style.display = 'inline-flex';
        }
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // حدث قبل التثبيت
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎯 beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButtons();
        });
        
        // حدث نجاح التثبيت
        window.addEventListener('appinstalled', (e) => {
            console.log('✅ App installed successfully');
            this.isInstalled = true;
            localStorage.setItem('pwa-installed', 'true');
            this.deferredPrompt = null;
            this.hideInstallButtons();
            this.showToast('✓ تم تثبيت التطبيق بنجاح');
        });
        
        // ربط أزرار التثبيت
        const installBtn = document.getElementById('installBtn');
        const installWelcomeBtn = document.getElementById('installWelcomeBtn');
        
        if (installBtn) {
            installBtn.addEventListener('click', () => this.installApp());
        }
        
        if (installWelcomeBtn) {
            installWelcomeBtn.addEventListener('click', () => this.installApp());
        }
    }
    
    // تثبيت التطبيق
    async installApp() {
        if (!this.deferredPrompt) {
            console.log('⚠️ No installation prompt available');
            this.showToast('يمكنك تثبيت التطبيق من قائمة المتصفح', 'info');
            return;
        }
        
        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted installation');
                this.showToast('✓ تم تثبيت التطبيق', 'success');
            } else {
                console.log('❌ User dismissed installation');
                this.showToast('يمكنك التثبيت لاحقاً من قائمة المتصفح', 'info');
            }
            
            this.deferredPrompt = null;
            this.hideInstallButtons();
        } catch (error) {
            console.error('Installation error:', error);
            this.showToast('حدث خطأ أثناء التثبيت', 'error');
        }
    }
    
    // مراقبة حالة الاتصال بالإنترنت
    monitorOnlineStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('✅ App is online');
            this.showToast('🔄 تم استعادة الاتصال بالإنترنت', 'success');
            this.syncData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('⚠️ App is offline');
            this.showToast('⚠️ لا يوجد اتصال بالإنترنت', 'warning');
        });
    }
    
    // مزامنة البيانات تلقائياً عند استعادة الاتصال
    async syncData() {
        if (this.isOnline && window.performSync) {
            console.log('🔄 Syncing data after reconnection...');
            await window.performSync();
        }
    }
    
    // إعداد المزامنة الدورية
    setupPeriodicSync() {
        if ('periodicSync' in navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(async (registration) => {
                try {
                    const status = await navigator.permissions.query({
                        name: 'periodic-background-sync',
                    });
                    
                    if (status.state === 'granted') {
                        await registration.periodicSync.register('sync-materials', {
                            minInterval: 24 * 60 * 60 * 1000, // كل 24 ساعة
                        });
                        console.log('✅ Periodic sync registered');
                    }
                } catch (error) {
                    console.log('Periodic sync not supported:', error);
                }
            });
        }
    }
    
    // إعداد المزامنة الخلفية
    setupBackgroundSync() {
        if ('sync' in navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('sync-materials')
                    .then(() => console.log('✅ Background sync registered'))
                    .catch(err => console.error('Background sync failed:', err));
            });
        }
    }
    
    // إظهار إشعار التحديث
    showUpdateNotification() {
        const toast = document.createElement('div');
        toast.className = 'toast update-toast';
        toast.innerHTML = `
            <i class="fas fa-download"></i>
            تحديث جديد متاح!
            <button onclick="location.reload()">تحديث الآن</button>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent);
            color: white;
            padding: 12px 20px;
            border-radius: 60px;
            font-size: 0.85rem;
            z-index: 10002;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        const btn = toast.querySelector('button');
        if (btn) {
            btn.style.cssText = `
                background: white;
                color: var(--accent);
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
    
    // إظهار رسالة منبثقة
    showToast(message, type = 'success') {
        const colors = {
            success: 'var(--accent)',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        let t = document.querySelector('.pwa-toast');
        if (t) t.remove();
        
        let div = document.createElement('div');
        div.className = 'pwa-toast';
        div.style.cssText = `
            position: fixed;
            bottom: 130px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type]};
            color: white;
            padding: 10px 24px;
            border-radius: 60px;
            font-size: 0.8rem;
            z-index: 10001;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: fadeUp 0.2s ease;
        `;
        div.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i> ${message}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
    
    // طلب إذن الإشعارات
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('✅ Notification permission granted');
                this.showNotification('مدير المواد', 'تم تفعيل الإشعارات بنجاح');
            }
        }
    }
    
    // إظهار إشعار
    showNotification(title, body, icon = '/icons/icon-192x192.png') {
        if ('Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: icon,
                    badge: '/icons/icon-72x72.png',
                    vibrate: [200, 100, 200],
                    data: {
                        url: window.location.href
                    }
                });
            });
        }
    }
    
    // الحصول على معلومات التطبيق
    getAppInfo() {
        return {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            serviceWorkerSupported: 'serviceWorker' in navigator,
            periodicSyncSupported: 'periodicSync' in navigator.serviceWorker,
            notificationSupported: 'Notification' in window,
            displayMode: this.getDisplayMode()
        };
    }
    
    // الحصول على وضع العرض
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return 'standalone';
        }
        if (window.matchMedia('(display-mode: fullscreen)').matches) {
            return 'fullscreen';
        }
        if (window.matchMedia('(display-mode: minimal-ui)').matches) {
            return 'minimal-ui';
        }
        return 'browser';
    }
    
    // تسجيل الخدمات الإضافية
    registerAdditionalFeatures() {
        // منع التحديث أثناء الاستخدام
        window.addEventListener('load', () => {
            if ('launchQueue' in window) {
                window.launchQueue.setConsumer(launchParams => {
                    console.log('App launched with params:', launchParams);
                });
            }
        });
        
        // حفظ البيانات قبل الإغلاق
        window.addEventListener('beforeunload', () => {
            if (window.allMaterials && window.allMaterials.length > 0) {
                localStorage.setItem('lastMaterialsCount', window.allMaterials.length);
                localStorage.setItem('lastVisit', new Date().toISOString());
            }
        });
    }
}

// تهيئة PWA عند تحميل الصفحة
let pwaManager = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new PWAManager();
    window.pwaManager = pwaManager;
    
    // إضافة معلومات PWA إلى وحدة التحكم
    console.log('📱 PWA Info:', pwaManager.getAppInfo());
});

// تصدير للاستخدام العام
window.PWAManager = PWAManager;
