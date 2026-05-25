// ============================================
// PWA Manager Pro - Version 5.1
// APK-Like Native Android Experience (No Pull-to-Refresh)
// ============================================

class NativeAPKLikePWA {
    constructor() {
        // ==================== الحالة الأساسية ====================
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.notificationPermission = false;
        this.badgeCount = 0;
        this.syncQueue = [];
        this.isTWA = false;
        
        // ==================== معلومات الجهاز المتقدمة ====================
        this.deviceInfo = this.getDeviceInfo();
        
        // ==================== بدء التشغيل ====================
        this.init();
    }
    
    // ==================== معلومات الجهاز ====================
    getDeviceInfo() {
        const ua = navigator.userAgent;
        const isAndroidWebView = /wv|; wv\)/i.test(ua);
        const isTWA = window.matchMedia('(display-mode: standalone)').matches && 
                     !navigator.standalone && 
                     /Android/i.test(ua);
        
        return {
            isSamsung: /SM-|SAMSUNG|GT-|SHV-|SC-|SM-G|SM-A|SM-J|SM-M/i.test(ua),
            isXiaomi: /MI |Redmi|POCO|MIX|Black Shark/i.test(ua),
            isHuawei: /HUAWEI|HONOR|HW-/i.test(ua),
            isOppo: /OPPO|Realme|OnePlus|CPH|RMX/i.test(ua),
            isVivo: /vivo|VIVO|V[0-9]{4}|iQOO/i.test(ua),
            isGoogle: /Pixel|Android SDK|Google/i.test(ua),
            isAndroid: /Android/i.test(ua),
            isIOS: /iPhone|iPad|iPod/i.test(ua),
            isChrome: /Chrome/i.test(ua) && !isAndroidWebView,
            isSamsungBrowser: /SamsungBrowser/i.test(ua),
            isWebView: isAndroidWebView,
            isTWA: isTWA,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio,
            language: navigator.language,
            userAgent: ua,
            androidVersion: this.getAndroidVersion(ua)
        };
    }
    
    getAndroidVersion(ua) {
        const match = ua.match(/Android\s([0-9.]+)/);
        return match ? match[1] : null;
    }
    
    // ==================== التهيئة الرئيسية ====================
    async init() {
        console.log('🚀 Native APK-Like PWA Manager v5.1');
        console.log('📱 Device:', this.deviceInfo);
        
        // تحسينات متقدمة
        this.optimizeForNative();
        this.setupTrustedWebActivity();
        this.setupNativePermissions();
        this.setupHardwareAcceleration();
        
        // الميزات الأساسية (بدون Pull-to-Refresh)
        await this.registerServiceWorker();
        this.checkInstallation();
        this.setupEventListeners();
        this.monitorNetwork();
        await this.requestNotificationPermission();
        this.setupBackgroundSync();
        this.setupPeriodicSync();
        this.setupAppBadge();
        this.setupShareTarget();
        this.setupFileHandling();
        this.setupWakeLock();
        this.setupNativeNavigation();
        this.setupSplashScreen();
        this.setupAppShortcuts();
        this.setupPushNotifications();
        this.setupDataStorage();
        this.setupCrashReporting();
        this.setupPerformanceMonitoring();
        
        // إضافة كلاس للـ CSS
        if (this.deviceInfo.isTWA) {
            document.body.classList.add('twa-mode');
        }
        if (this.deviceInfo.isWebView) {
            document.body.classList.add('webview-mode');
        }
    }
    
    // ==================== تحسينات للأداء الأصلي ====================
    optimizeForNative() {
        // تفعيل تسريع الأجهزة
        document.body.style.transform = 'translateZ(0)';
        document.body.style.backfaceVisibility = 'hidden';
        
        // تحسين التمرير
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // منع التأخير في النقرات
        document.body.style.touchAction = 'manipulation';
        
        // منع التمرير الزائد الذي يسبب تحديث الصفحة
        document.body.style.overscrollBehavior = 'none';
        
        // تفعيل hardware acceleration للـ CSS
        const style = document.createElement('style');
        style.textContent = `
            * {
                overscroll-behavior: none;
                -webkit-overflow-scrolling: touch;
            }
            body {
                overscroll-behavior: none;
                position: fixed;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            .app-main {
                overflow-y: auto;
                height: 100%;
                -webkit-overflow-scrolling: touch;
                overscroll-behavior: contain;
            }
            .material-card, .category-card, .action-btn, .main-add-btn {
                transform: translateZ(0);
                will-change: transform;
            }
        `;
        document.head.appendChild(style);
    }
    
    // ==================== Trusted Web Activity Setup ====================
    setupTrustedWebActivity() {
        if (this.deviceInfo.isTWA) {
            console.log('✅ Running as Trusted Web Activity');
            this.isTWA = true;
            document.body.classList.add('twa-fullscreen');
            
            const setTWAHeight = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            setTWAHeight();
            window.addEventListener('resize', setTWAHeight);
        }
    }
    
    // ==================== WebView Optimizations ====================
    setupWebViewOptimizations() {
        if (this.deviceInfo.isWebView) {
            console.log('📱 Running in WebView mode');
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.loading = 'eager';
            });
        }
    }
    
    // ==================== Native Permissions Management ====================
    setupNativePermissions() {
        const permissionsNeeded = [];
        
        if (Notification.permission === 'default') {
            permissionsNeeded.push('notifications');
        }
        
        if (permissionsNeeded.length > 0) {
            document.addEventListener('click', () => {
                this.requestPermissions(permissionsNeeded);
            }, { once: true });
        }
    }
    
    async requestPermissions(permissions) {
        const results = {};
        
        for (const perm of permissions) {
            if (perm === 'notifications' && 'Notification' in window) {
                const result = await Notification.requestPermission();
                results[perm] = result === 'granted';
            }
        }
        
        return results;
    }
    
    // ==================== Hardware Acceleration ====================
    setupHardwareAcceleration() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            console.log('✅ WebGL hardware acceleration enabled');
            document.body.classList.add('webgl-enabled');
        }
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
                updateViaCache: 'none'
            });
            
            console.log('✅ Service Worker registered:', this.swRegistration.scope);
            
            await this.swRegistration.update();
            
            setInterval(() => {
                if (this.swRegistration) {
                    this.swRegistration.update();
                }
            }, 60 * 60 * 1000);
            
            return true;
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            return false;
        }
    }
    
    // ==================== تثبيت كـ APK-like ====================
    checkInstallation() {
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ App installed in standalone mode');
            this.hideInstallButtons();
            this.applyNativeUI();
        }
        
        if (this.deviceInfo.isTWA) {
            this.isInstalled = true;
            this.applyTWAUI();
        }
        
        if (localStorage.getItem('pwa_installed') === 'true') {
            this.isInstalled = true;
        }
    }
    
    applyNativeUI() {
        document.body.classList.add('native-installed');
        
        const appMain = document.querySelector('.app-main');
        if (appMain) {
            appMain.style.overflowY = 'auto';
            appMain.style.height = '100vh';
            appMain.style.webkitOverflowScrolling = 'touch';
            appMain.style.overscrollBehavior = 'contain';
        }
    }
    
    applyTWAUI() {
        document.body.classList.add('twa-installed');
        
        const style = document.createElement('style');
        style.textContent = `
            body.twa-installed .sync-status-bar {
                padding-bottom: env(safe-area-inset-bottom);
            }
        `;
        document.head.appendChild(style);
    }
    
    hideInstallButtons() {
        const installBtn = document.getElementById('installBtn');
        const welcomeInstallBtn = document.getElementById('installWelcomeBtn');
        if (installBtn) installBtn.style.display = 'none';
        if (welcomeInstallBtn) welcomeInstallBtn.style.display = 'none';
    }
    
    // ==================== إشعارات متقدمة ====================
    async requestNotificationPermission() {
        if (!('Notification' in window)) return false;
        
        const askForPermission = async () => {
            if (Notification.permission === 'granted') {
                this.notificationPermission = true;
                console.log('✅ Notification permission granted');
                this.showNativeAndroidNotification('مرحباً!', 'تم تفعيل الإشعارات بنجاح');
                return true;
            }
            
            if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                this.notificationPermission = permission === 'granted';
                if (this.notificationPermission) {
                    this.showNativeAndroidNotification('مرحباً!', 'تم تفعيل الإشعارات بنجاح');
                }
                return this.notificationPermission;
            }
            return false;
        };
        
        document.addEventListener('click', askForPermission, { once: true });
        return false;
    }
    
    showNativeAndroidNotification(title, body, requireInteraction = false) {
        if (!this.notificationPermission && Notification.permission !== 'granted') return;
        
        const options = {
            body: body,
            icon: '/material-manager/icons/icon-192x192.png',
            badge: '/material-manager/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            timestamp: Date.now(),
            data: { url: window.location.href, timestamp: Date.now() },
            requireInteraction: requireInteraction,
            silent: false,
            actions: [
                { action: 'open', title: 'فتح' },
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
        const displayUnit = unit === 'kg' ? 'kg' : 
                           unit === 'half' ? 'نصف كيلو' :
                           unit === 'quarter' ? 'ربع كيلو' : 'لوقية';
        this.showNativeAndroidNotification(
            '✓ تم إضافة مادة جديدة',
            `${materialName} (${quantity} ${displayUnit})`,
            false
        );
        this.updateBadge(this.badgeCount + 1);
    }
    
    // ==================== شارة التطبيق ====================
    setupAppBadge() {
        if ('setAppBadge' in navigator) {
            window.setAppBadge = (count) => {
                navigator.setAppBadge(count);
                this.badgeCount = count;
            };
            window.clearAppBadge = () => {
                navigator.clearAppBadge();
                this.badgeCount = 0;
            };
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
            this.badgeCount = count;
        }
    }
    
    // ==================== Background Sync ====================
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
                                minInterval: 12 * 60 * 60 * 1000
                            });
                            console.log('✅ Periodic sync registered');
                        });
                    }
                });
        }
    }
    
    // ==================== Share Target ====================
    setupShareTarget() {
        if ('share' in navigator) {
            console.log('✅ Web Share API supported');
        }
    }
    
    async shareData(title, text, url, files = null) {
        if (navigator.canShare && files) {
            const shareData = { title, text, url, files };
            if (navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                    return true;
                } catch(e) { return false; }
            }
        }
        
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                return true;
            } catch(e) { return false; }
        }
        return false;
    }
    
    // ==================== File Handling ====================
    setupFileHandling() {
        if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
            launchQueue.setConsumer(launchParams => {
                if (launchParams.files && launchParams.files.length) {
                    this.handleFileOpen(launchParams.files[0]);
                }
            });
            console.log('✅ File handling API supported');
        }
    }
    
    async handleFileOpen(file) {
        console.log('📄 File opened:', file.name);
    }
    
    // ==================== Wake Lock (منع إغلاق الشاشة) ====================
    setupWakeLock() {
        let wakeLock = null;
        
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await navigator.wakeLock.request('screen');
                    console.log('✅ Wake Lock active');
                    wakeLock.addEventListener('release', () => {
                        console.log('Wake Lock released');
                    });
                } catch(e) {
                    console.log('Wake Lock failed:', e);
                }
            }
        };
        
        document.addEventListener('click', requestWakeLock, { once: true });
    }
    
    // ==================== التنقل الأصلي ====================
    setupNativeNavigation() {
        window.addEventListener('popstate', (event) => {
            const modal = document.querySelector('.modal.active');
            if (modal) {
                event.preventDefault();
                modal.classList.remove('active');
                history.pushState(null, '', window.location.href);
            }
        });
        
        history.pushState(null, '', window.location.href);
    }
    
    // ==================== شاشة البداية ====================
    setupSplashScreen() {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            setTimeout(() => {
                splash.classList.add('hidden');
                setTimeout(() => {
                    splash.style.display = 'none';
                }, 500);
            }, 2000);
        }
    }
    
    // ==================== اختصارات التطبيق ====================
    setupAppShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                document.getElementById('mainAddBtn')?.click();
            }
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                document.getElementById('syncBtn')?.click();
            }
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.active');
                if (modal) modal.classList.remove('active');
            }
        });
    }
    
    // ==================== Push Notifications ====================
    setupPushNotifications() {
        if ('PushManager' in window) {
            console.log('✅ Push Notifications supported');
        }
    }
    
    // ==================== IndexedDB Storage ====================
    setupDataStorage() {
        if ('indexedDB' in window) {
            this.initIndexedDB();
        }
    }
    
    initIndexedDB() {
        const request = indexedDB.open('MaterialManagerDB', 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineData')) {
                db.createObjectStore('offlineData', { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (event) => {
            console.log('✅ IndexedDB initialized');
        };
    }
    
    // ==================== Crash Reporting ====================
    setupCrashReporting() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.logError(event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled rejection:', event.reason);
            this.logError(event.reason);
        });
    }
    
    logError(error) {
        const errorLog = {
            message: error?.message || String(error),
            stack: error?.stack,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
        errors.push(errorLog);
        if (errors.length > 50) errors.shift();
        localStorage.setItem('error_logs', JSON.stringify(errors));
    }
    
    // ==================== Performance Monitoring ====================
    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.renderTime || entry.loadTime);
                    }
                }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
        }
    }
    
    // ==================== Native Toast ====================
    showNativeToast(message, type = 'info') {
        const existing = document.querySelector('.native-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `native-toast ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span>`;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(20px);
            color: white;
            padding: 12px 24px;
            border-radius: 48px;
            font-size: 0.85rem;
            z-index: 10001;
            opacity: 0;
            transition: all 0.2s ease;
            direction: rtl;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 85%;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 200);
        }, 2500);
    }
    
    // ==================== مراقبة الشبكة ====================
    monitorNetwork() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🟢 App is online');
            this.showNativeToast('تم استعادة الاتصال بالإنترنت', 'success');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('🔴 App is offline');
            this.showNativeToast('لا يوجد اتصال بالإنترنت', 'warning');
        });
    }
    
    async syncOfflineData() {
        if (!this.isOnline) return;
        if (typeof startListener === 'function') {
            if (window.unsubscribe) window.unsubscribe();
            startListener();
        }
    }
    
    // ==================== أحداث التثبيت ====================
    setupEventListeners() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎯 beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButtons();
            this.showCustomInstallDialog();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully');
            this.isInstalled = true;
            localStorage.setItem('pwa_installed', 'true');
            this.deferredPrompt = null;
            this.hideInstallButtons();
            this.showNativeAndroidNotification('✓ تثبيت ناجح', 'تم تثبيت التطبيق على جهازك');
            this.applyNativeUI();
        });
        
        const installBtn = document.getElementById('installBtn');
        const welcomeInstallBtn = document.getElementById('installWelcomeBtn');
        
        if (installBtn) installBtn.addEventListener('click', () => this.promptInstall());
        if (welcomeInstallBtn) welcomeInstallBtn.addEventListener('click', () => this.promptInstall());
    }
    
    showCustomInstallDialog() {
        if (this.isInstalled) return;
        if (localStorage.getItem('install_dialog_shown')) return;
        
        const dialog = document.createElement('div');
        dialog.className = 'install-dialog';
        dialog.innerHTML = `
            <div class="install-dialog-content">
                <div class="install-dialog-icon"><i class="fas fa-boxes"></i></div>
                <h3>تثبيت مدير المواد</h3>
                <p>قم بتثبيت التطبيق على جهازك للوصول السريع بدون إنترنت</p>
                <div class="install-dialog-features">
                    <div><i class="fas fa-bolt"></i> أداء سريع</div>
                    <div><i class="fas fa-wifi-slash"></i> يعمل بدون إنترنت</div>
                    <div><i class="fas fa-bell"></i> إشعارات فورية</div>
                </div>
                <div class="install-dialog-buttons">
                    <button id="installDialogConfirm" class="install-dialog-btn primary">تثبيت</button>
                    <button id="installDialogCancel" class="install-dialog-btn secondary">ليس الآن</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        document.getElementById('installDialogConfirm')?.addEventListener('click', () => {
            this.promptInstall();
            dialog.remove();
            localStorage.setItem('install_dialog_shown', 'true');
        });
        
        document.getElementById('installDialogCancel')?.addEventListener('click', () => {
            dialog.remove();
            localStorage.setItem('install_dialog_shown', 'true');
        });
        
        setTimeout(() => {
            if (dialog && dialog.remove) dialog.remove();
        }, 15000);
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
        let guideHTML = '';
        const isSamsung = this.deviceInfo.isSamsung;
        const isXiaomi = this.deviceInfo.isXiaomi;
        
        if (isSamsung) {
            guideHTML = `
                <div class="install-guide-dialog">
                    <i class="fab fa-samsung"></i>
                    <h3>تثبيت على سامسونج</h3>
                    <ol><li>اضغط على القائمة (☰) في متصفح سامسونج</li><li>اختر "تثبيت التطبيق"</li><li>اضغط على "تثبيت" للتأكيد</li></ol>
                    <button class="guide-close">حسناً</button>
                </div>
            `;
        } else if (isXiaomi) {
            guideHTML = `
                <div class="install-guide-dialog">
                    <i class="fas fa-mobile-alt"></i>
                    <h3>تثبيت على شاومي</h3>
                    <ol><li>افتح قائمة المتصفح (ثلاث نقاط)</li><li>اختر "تثبيت التطبيق"</li><li>اضغط على "تثبيت" للتأكيد</li></ol>
                    <button class="guide-close">حسناً</button>
                </div>
            `;
        } else {
            guideHTML = `
                <div class="install-guide-dialog">
                    <i class="fas fa-download"></i>
                    <h3>تثبيت التطبيق</h3>
                    <ol><li>افتح قائمة المتصفح (ثلاث نقاط)</li><li>اختر "تثبيت التطبيق"</li><li>اتبع التعليمات لإكمال التثبيت</li></ol>
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
    
    // ==================== معلومات التطبيق ====================
    getAppInfo() {
        return {
            installed: this.isInstalled,
            online: this.isOnline,
            notificationPermission: this.notificationPermission,
            serviceWorker: !!this.swRegistration,
            displayMode: this.getDisplayMode(),
            deviceInfo: this.deviceInfo,
            badgeCount: this.badgeCount,
            isTWA: this.isTWA,
            version: '5.1',
            features: {
                backgroundSync: 'sync' in navigator.serviceWorker,
                periodicSync: 'periodicSync' in navigator.serviceWorker,
                wakeLock: 'wakeLock' in navigator,
                badge: 'setAppBadge' in navigator,
                share: 'share' in navigator,
                fileHandling: 'launchQueue' in window,
                pushNotifications: 'PushManager' in window,
                webgl: !!document.createElement('canvas').getContext('webgl')
            }
        };
    }
    
    getDisplayMode() {
        if (this.deviceInfo.isTWA) return 'trusted-web-activity';
        if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        return 'browser';
    }
}

// ==================== تهيئة PWA Manager ====================
let pwaManager = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new NativeAPKLikePWA();
    window.pwaManager = pwaManager;
    console.log('📱 APK-Like PWA Info:', pwaManager.getAppInfo());
});
