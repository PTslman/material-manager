// ============================================
// PWA Manager Pro - Version 3.0
// متوافق مع أندرويد (سامسونج، شاومي، هواوي)
// يعمل بشكل مستقل عن كروم
// ============================================

class AdvancedPWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.notificationPermission = false;
        this.deviceInfo = this.getDeviceInfo();
        this.init();
    }
    
    // ==================== معلومات الجهاز ====================
    getDeviceInfo() {
        const ua = navigator.userAgent;
        return {
            isSamsung: /SM-|SAMSUNG|GT-|SHV-/i.test(ua),
            isXiaomi: /MI |Redmi|POCO|MIX|Black Shark/i.test(ua),
            isHuawei: /HUAWEI|HONOR|HW-|LIO-|ELE-|VOG-/i.test(ua),
            isOppo: /OPPO|Realme|OnePlus/i.test(ua),
            isAndroid: /Android/i.test(ua),
            isIOS: /iPhone|iPad|iPod/i.test(ua),
            isChrome: /Chrome/i.test(ua),
            isSamsungBrowser: /SamsungBrowser/i.test(ua)
        };
    }
    
    async init() {
        console.log('📱 Advanced PWA Manager v3.0');
        console.log('📱 Device:', this.deviceInfo);
        
        this.checkInstallation();
        await this.registerServiceWorker();
        this.setupEventListeners();
        this.monitorNetwork();
        await this.requestNotificationPermission();
        this.setupBackgroundSync();
        this.setupPeriodicSync();
        this.setupAppBadge();
        this.setupShareTarget();
        this.setupProtocolHandler();
    }
    
    // ==================== تثبيت التطبيق ====================
    checkInstallation() {
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ App is installed in standalone mode');
            this.hideInstallButtons();
            this.showDeviceSpecificMessage();
        }
        
        if (localStorage.getItem('pwa_installed') === 'true') {
            this.isInstalled = true;
        }
    }
    
    showDeviceSpecificMessage() {
        if (this.deviceInfo.isSamsung) {
            console.log('📱 Samsung device detected - Optimizing for One UI');
            document.body.classList.add('samsung-optimized');
        }
        if (this.deviceInfo.isXiaomi) {
            console.log('📱 Xiaomi device detected - Optimizing for MIUI');
            document.body.classList.add('xiaomi-optimized');
        }
        if (this.deviceInfo.isHuawei) {
            console.log('📱 Huawei device detected - Optimizing for EMUI');
            document.body.classList.add('huawei-optimized');
        }
    }
    
    hideInstallButtons() {
        const installBtn = document.getElementById('installBtn');
        const welcomeInstallBtn = document.getElementById('installWelcomeBtn');
        if (installBtn) installBtn.style.display = 'none';
        if (welcomeInstallBtn) welcomeInstallBtn.style.display = 'none';
    }
    
    showInstallButtons() {
        if (this.isInstalled) return;
        const installBtn = document.getElementById('installBtn');
        const welcomeInstallBtn = document.getElementById('installWelcomeBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
        if (welcomeInstallBtn && !this.isInstalled) welcomeInstallBtn.style.display = 'inline-flex';
    }
    
    // ==================== Service Worker متقدم ====================
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Worker not supported');
            return false;
        }
        
        try {
            this.swRegistration = await navigator.serviceWorker.register('/material-manager/sw.js', {
                scope: '/material-manager/',
                updateViaCache: 'imports'
            });
            
            console.log('✅ Service Worker registered:', this.swRegistration.scope);
            
            // التحقق من وجود تحديثات
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                console.log('🔄 New Service Worker found');
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
            
            // التحقق من التحديثات كل ساعة
            setInterval(() => {
                this.swRegistration.update();
            }, 60 * 60 * 1000);
            
            return true;
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            return false;
        }
    }
    
    // ==================== إشعارات متقدمة ====================
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
                this.sendWelcomeNotification();
            }
            return this.notificationPermission;
        }
        
        return false;
    }
    
    sendWelcomeNotification() {
        this.showNotification('مرحباً بك في مدير المواد', 'تم تفعيل الإشعارات بنجاح، ستتلقى تحديثات المخزون', 'welcome');
    }
    
    showNotification(title, body, type = 'info') {
        if (!this.notificationPermission && Notification.permission !== 'granted') return;
        
        const icons = {
            info: '/material-manager/icons/icon-192x192.png',
            success: '/material-manager/icons/icon-192x192.png',
            warning: '/material-manager/icons/icon-192x192.png',
            error: '/material-manager/icons/icon-192x192.png'
        };
        
        const options = {
            body: body,
            icon: icons[type] || icons.info,
            badge: '/material-manager/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            timestamp: Date.now(),
            data: { url: window.location.href, type: type },
            requireInteraction: type === 'warning' || type === 'error',
            silent: false,
            actions: [
                { action: 'open', title: 'فتح التطبيق' },
                { action: 'dismiss', title: 'إغلاق' }
            ]
        };
        
        if (this.swRegistration && this.swRegistration.showNotification) {
            this.swRegistration.showNotification(title, options);
        } else if (Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }
    
    notifyMaterialAdded(materialName, quantity = 1, unit = 'kg') {
        this.showNotification('✓ تم إضافة مادة جديدة', `تمت إضافة ${materialName} (${quantity} ${unit}) بنجاح إلى المخزون`, 'success');
    }
    
    notifySyncComplete(itemCount) {
        this.showNotification('🔄 تمت المزامنة', `تم تحديث ${itemCount} عنصر في المخزون`, 'info');
    }
    
    notifyLowStock(materialName, currentQuantity) {
        this.showNotification('⚠️ تنبيه مخزون منخفض', `${materialName} المتبقي: ${currentQuantity} kg فقط`, 'warning');
    }
    
    // ==================== إشعار التحديث ====================
    showUpdateNotification() {
        const updateDiv = document.createElement('div');
        updateDiv.className = 'update-banner';
        updateDiv.innerHTML = `
            <div class="update-banner-content">
                <i class="fas fa-download"></i>
                <span>تحديث جديد متاح للتطبيق!</span>
                <button id="updateNowBtn" class="update-now-btn">تحديث الآن</button>
                <button id="updateLaterBtn" class="update-later-btn">لاحقاً</button>
            </div>
        `;
        document.body.appendChild(updateDiv);
        
        document.getElementById('updateNowBtn')?.addEventListener('click', () => {
            window.location.reload();
            updateDiv.remove();
        });
        
        document.getElementById('updateLaterBtn')?.addEventListener('click', () => {
            updateDiv.remove();
            localStorage.setItem('update_dismissed', Date.now());
        });
        
        setTimeout(() => {
            if (updateDiv && updateDiv.remove) updateDiv.remove();
        }, 15000);
    }
    
    // ==================== المزامنة الخلفية ====================
    setupBackgroundSync() {
        if ('sync' in navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('sync-materials')
                    .then(() => console.log('✅ Background sync registered'))
                    .catch(err => console.log('Background sync failed:', err));
            });
        }
    }
    
    setupPeriodicSync() {
        if ('periodicSync' in navigator.serviceWorker) {
            navigator.permissions.query({ name: 'periodic-background-sync' })
                .then(status => {
                    if (status.state === 'granted') {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.periodicSync.register('periodic-sync', {
                                minInterval: 24 * 60 * 60 * 1000
                            });
                            console.log('✅ Periodic sync registered');
                        });
                    }
                });
        }
    }
    
    // ==================== شارة التطبيق (Badge) ====================
    setupAppBadge() {
        if ('setAppBadge' in navigator) {
            window.setAppBadge = (count) => navigator.setAppBadge(count);
            window.clearAppBadge = () => navigator.clearAppBadge();
            console.log('✅ App Badge API supported');
        }
    }
    
    updateBadge(count) {
        if (navigator.setAppBadge) {
            if (count > 0) {
                navigator.setAppBadge(count);
            } else {
                navigator.clearAppBadge();
            }
        }
    }
    
    // ==================== مشاركة الملفات ====================
    setupShareTarget() {
        if ('share' in navigator) {
            console.log('✅ Web Share API supported');
        }
    }
    
    async shareData(title, text, url) {
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                return true;
            } catch (error) {
                console.log('Share failed:', error);
                return false;
            }
        }
        return false;
    }
    
    // ==================== معالج الروابط ====================
    setupProtocolHandler() {
        if ('registerProtocolHandler' in navigator) {
            try {
                navigator.registerProtocolHandler('web+material', `${window.location.origin}/material-manager/?id=%s`);
                console.log('✅ Protocol handler registered');
            } catch (error) {
                console.log('Protocol handler registration failed:', error);
            }
        }
    }
    
    // ==================== أحداث التثبيت ====================
    setupEventListeners() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎯 beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButtons();
            this.showInstallBanner();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully');
            this.isInstalled = true;
            localStorage.setItem('pwa_installed', 'true');
            this.deferredPrompt = null;
            this.hideInstallButtons();
            this.showNotification('✓ تم التثبيت', 'تم تثبيت تطبيق مدير المواد بنجاح على جهازك', 'success');
        });
        
        // ربط أزرار التثبيت
        const installBtn = document.getElementById('installBtn');
        const welcomeInstallBtn = document.getElementById('installWelcomeBtn');
        
        if (installBtn) {
            installBtn.addEventListener('click', () => this.promptInstall());
        }
        
        if (welcomeInstallBtn) {
            welcomeInstallBtn.addEventListener('click', () => this.promptInstall());
        }
    }
    
    showInstallBanner() {
        if (this.isInstalled) return;
        if (localStorage.getItem('install_banner_dismissed')) return;
        
        const banner = document.createElement('div');
        banner.className = 'install-banner';
        banner.innerHTML = `
            <div class="install-banner-content">
                <i class="fas fa-download"></i>
                <div class="install-banner-text">
                    <strong>تثبيت التطبيق</strong>
                    <span>للوصول السريع بدون إنترنت</span>
                </div>
                <button id="installBannerBtn" class="install-banner-btn">تثبيت</button>
                <button id="dismissBannerBtn" class="dismiss-banner-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.body.appendChild(banner);
        
        document.getElementById('installBannerBtn')?.addEventListener('click', () => {
            this.promptInstall();
            banner.remove();
        });
        
        document.getElementById('dismissBannerBtn')?.addEventListener('click', () => {
            banner.remove();
            localStorage.setItem('install_banner_dismissed', 'true');
        });
        
        setTimeout(() => {
            if (banner && banner.remove) banner.remove();
        }, 10000);
    }
    
    async promptInstall() {
        if (!this.deferredPrompt) {
            this.showManualInstallGuide();
            return;
        }
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted installation');
        } else {
            console.log('User dismissed installation');
            this.showManualInstallGuide();
        }
        
        this.deferredPrompt = null;
        this.hideInstallButtons();
    }
    
    showManualInstallGuide() {
        const isSamsung = this.deviceInfo.isSamsung;
        const isXiaomi = this.deviceInfo.isXiaomi;
        const isChrome = this.deviceInfo.isChrome;
        
        let guideHTML = '';
        
        if (isSamsung) {
            guideHTML = `
                <div class="install-guide-dialog">
                    <h3><i class="fab fa-samsung"></i> تثبيت التطبيق على سامسونج</h3>
                    <ol>
                        <li>اضغط على القائمة (☰) في متصفح سامسونج</li>
                        <li>اختر "تثبيت التطبيق"</li>
                        <li>اضغط على "تثبيت" للتأكيد</li>
                    </ol>
                    <button class="guide-close">حسناً</button>
                </div>
            `;
        } else if (isXiaomi) {
            guideHTML = `
                <div class="install-guide-dialog">
                    <h3><i class="fas fa-mobile-alt"></i> تثبيت التطبيق على شاومي</h3>
                    <ol>
                        <li>افتح قائمة المتصفح (ثلاث نقاط)</li>
                        <li>اختر "تثبيت التطبيق" أو "Add to Home Screen"</li>
                        <li>اضغط على "تثبيت" للتأكيد</li>
                    </ol>
                    <button class="guide-close">حسناً</button>
                </div>
            `;
        } else if (isChrome) {
            guideHTML = `
                <div class="install-guide-dialog">
                    <h3><i class="fab fa-chrome"></i> تثبيت التطبيق على كروم</h3>
                    <ol>
                        <li>اضغط على القائمة (ثلاث نقاط) في الأعلى</li>
                        <li>اختر "تثبيت التطبيق"</li>
                        <li>اضغط على "تثبيت" للتأكيد</li>
                    </ol>
                    <button class="guide-close">حسناً</button>
                </div>
            `;
        } else {
            guideHTML = `
                <div class="install-guide-dialog">
                    <h3><i class="fas fa-download"></i> تثبيت التطبيق</h3>
                    <ol>
                        <li>افتح قائمة المتصفح</li>
                        <li>ابحث عن "تثبيت التطبيق" أو "Add to Home Screen"</li>
                        <li>اتبع التعليمات لإكمال التثبيت</li>
                    </ol>
                    <button class="guide-close">حسناً</button>
                </div>
            `;
        }
        
        const dialog = document.createElement('div');
        dialog.className = 'install-guide-overlay';
        dialog.innerHTML = guideHTML;
        document.body.appendChild(dialog);
        
        dialog.querySelector('.guide-close')?.addEventListener('click', () => dialog.remove());
        dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });
    }
    
    // ==================== مراقبة الشبكة ====================
    monitorNetwork() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🟢 App is online');
            this.showNetworkToast('تم استعادة الاتصال بالإنترنت', 'success');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('🔴 App is offline');
            this.showNetworkToast('لا يوجد اتصال بالإنترنت - البيانات متاحة دون اتصال', 'warning');
        });
    }
    
    showNetworkToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `network-toast ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-wifi' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    async syncOfflineData() {
        if (!this.isOnline) return;
        console.log('🔄 Syncing offline data...');
        // سيتم إضافة منطق المزامنة هنا
    }
    
    // ==================== معلومات التطبيق ====================
    getAppInfo() {
        return {
            installed: this.isInstalled,
            online: this.isOnline,
            notificationPermission: this.notificationPermission,
            serviceWorker: !!this.swRegistration,
            displayMode: this.getDisplayMode(),
            deviceInfo: this.deviceInfo,
            version: '3.0'
        };
    }
    
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        return 'browser';
    }
}

// تهيئة PWA Manager
let pwaManager = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new AdvancedPWAManager();
    window.pwaManager = pwaManager;
    console.log('📱 PWA Info:', pwaManager.getAppInfo());
});
