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
        console.log('📱 Initializing PWA Manager...');
        this.checkInstallationStatus();
        await this.registerServiceWorker();
        this.setupEventListeners();
        this.monitorNetworkStatus();
        this.requestNotificationPermission();
        this.startBackgroundSync();
    }
    
    // التحقق من حالة التثبيت
    checkInstallationStatus() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('✅ App installed (standalone mode)');
            this.hideInstallButton();
        }
        
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ iOS app installed');
            this.hideInstallButton();
        }
        
        if (localStorage.getItem('pwa_installed') === 'true') {
            this.isInstalled = true;
            this.hideInstallButton();
        }
    }
    
    // تسجيل Service Worker
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Worker not supported');
            return false;
        }
        
        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
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
            this.showInstallButton();
        });
        
        // حدث نجاح التثبيت
        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully');
            this.isInstalled = true;
            localStorage.setItem('pwa_installed', 'true');
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.showToast('✓ تم تثبيت التطبيق بنجاح');
        });
        
        // زر التثبيت
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.promptInstall());
        }
        
        // زر التحديث
        const updateBtn = document.getElementById('updateBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.checkForUpdates());
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
            console.log('User accepted installation');
        } else {
            console.log('User dismissed installation');
            this.showInstallInstructions();
        }
        
        this.deferredPrompt = null;
        this.hideInstallButton();
    }
    
    // إظهار تعليمات التثبيت اليدوي
    showInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isChrome = /Chrome/.test(navigator.userAgent);
        
        let message = '';
        if (isIOS) {
            message = '📍 لتثبيت التطبيق على iPhone/iPad:\n\n1. اضغط على زر المشاركة\n2. اختر "أضف إلى الشاشة الرئيسية"\n3. اضغط على "إضافة"';
        } else if (isChrome) {
            message = '📍 لتثبيت التطبيق على كروم:\n\n1. اضغط على القائمة (ثلاث نقاط)\n2. اختر "تثبيت التطبيق"\n3. اضغط على "تثبيت"';
        } else {
            message = '📍 لتثبيت التطبيق:\n\n1. افتح قائمة المتصفح\n2. ابحث عن "تثبيت التطبيق"\n3. اتبع التعليمات';
        }
        
        alert(message);
    }
    
    // مراقبة حالة الشبكة
    monitorNetworkStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🟢 App is online');
            this.showToast('تم استعادة الاتصال بالإنترنت', 'success');
            this.syncData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('🔴 App is offline');
            this.showToast('لا يوجد اتصال بالإنترنت', 'warning');
        });
    }
    
    // مزامنة البيانات
    async syncData() {
        if (!this.isOnline) return;
        
        console.log('🔄 Syncing data...');
        this.showToast('جاري مزامنة البيانات...', 'info');
        
        try {
            // إرسال رسالة إلى Service Worker للمزامنة
            if (this.swRegistration && this.swRegistration.sync) {
                await this.swRegistration.sync.register('sync-materials');
            }
            
            setTimeout(() => {
                this.showToast('✓ تمت المزامنة بنجاح', 'success');
            }, 2000);
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
    
    // بدء المزامنة الخلفية
    startBackgroundSync() {
        if ('sync' in navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('sync-materials')
                    .then(() => console.log('✅ Background sync registered'))
                    .catch(err => console.log('Background sync failed:', err));
            });
        }
    }
    
    // طلب إذن الإشعارات
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Notifications not supported');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            console.log('✅ Notification permission already granted');
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('✅ Notification permission granted');
                this.showNotification('مدير المواد', 'تم تفعيل الإشعارات بنجاح');
                return true;
            }
        }
        
        return false;
    }
    
    // إظهار إشعار
    showNotification(title, body) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                vibrate: [200, 100, 200],
                data: { url: window.location.href }
            });
        });
    }
    
    // إظهار إشعار التحديث
    showUpdateNotification() {
        if (localStorage.getItem('update_dismissed') === Date.now().toDateString()) return;
        
        const toast = document.createElement('div');
        toast.className = 'update-toast';
        toast.innerHTML = `
            <i class="fas fa-download"></i>
            <span>تحديث جديد متاح!</span>
            <button onclick="location.reload()">تحديث الآن</button>
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
        setTimeout(() => toast.remove(), 30000);
    }
    
    // التحقق من التحديثات
    async checkForUpdates() {
        if (!this.swRegistration) return;
        
        try {
            await this.swRegistration.update();
            this.showToast('جاري التحقق من التحديثات...', 'info');
        } catch (error) {
            console.error('Update check failed:', error);
        }
    }
    
    // إظهار رسالة منبثقة
    showToast(message, type = 'success') {
        const colors = {
            success: '#2e7d32',
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
            direction: rtl;
        `;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        div.innerHTML = `<i class="fas ${icons[type]}" style="margin-left: 8px;"></i> ${message}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
    
    // الحصول على معلومات PWA
    getInfo() {
        return {
            installed: this.isInstalled,
            online: this.isOnline,
            swRegistered: !!this.swRegistration,
            notificationPermission: Notification.permission,
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
