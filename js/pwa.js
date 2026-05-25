// ============================================
// PWA Manager Pro - Version 4.0
// Advanced PWA with APK-like Experience
// Native Android App Alternative
// ============================================

class NativePWAManager {
    constructor() {
        // ==================== الحالة الأساسية ====================
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.notificationPermission = false;
        this.badgeCount = 0;
        this.syncQueue = [];
        
        // ==================== معلومات الجهاز ====================
        this.deviceInfo = this.getDeviceInfo();
        this.screenOrientation = screen.orientation?.type || 'portrait-primary';
        
        // ==================== بدء التشغيل ====================
        this.init();
    }
    
    // ==================== معلومات الجهاز المتقدمة ====================
    getDeviceInfo() {
        const ua = navigator.userAgent;
        return {
            isSamsung: /SM-|SAMSUNG|GT-|SHV-|SC-|SM-G|SM-A|SM-J|SM-M/i.test(ua),
            isXiaomi: /MI |Redmi|POCO|MIX|Black Shark|2107|2106|2105|2201|2202/i.test(ua),
            isHuawei: /HUAWEI|HONOR|HW-|LIO-|ELE-|VOG-|TAS-|NOH-|ELS-|ANA-|JNY-|MAR-|JKM-|POT-|FIG-|BLA-|CLT-|LYA-/i.test(ua),
            isOppo: /OPPO|Realme|OnePlus|CPH|RMX|KB200|LE211|IN202/i.test(ua),
            isVivo: /vivo|VIVO|V[0-9]{4}|iQOO/i.test(ua),
            isGoogle: /Pixel|Android SDK|Google/i.test(ua),
            isAndroid: /Android/i.test(ua),
            isIOS: /iPhone|iPad|iPod/i.test(ua),
            isChrome: /Chrome/i.test(ua),
            isSamsungBrowser: /SamsungBrowser/i.test(ua),
            isFirefox: /Firefox/i.test(ua),
            isEdge: /Edg/i.test(ua),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio,
            language: navigator.language,
            battery: null
        };
    }
    
    // ==================== التهيئة الرئيسية ====================
    async init() {
        console.log('🚀 Native PWA Manager v4.0 - APK-like Experience');
        console.log('📱 Device:', this.deviceInfo);
        
        // تحسينات الأداء والتوافق
        this.optimizeForDevice();
        this.lockScreenOrientation();
        this.monitorBatteryStatus();
        this.setupKeyboardHandling();
        
        // الميزات الأساسية
        await this.registerServiceWorker();
        this.checkInstallation();
        this.setupEventListeners();
        this.monitorNetwork();
        await this.requestNotificationPermission();
        this.setupBackgroundSync();
        this.setupPeriodicSync();
        this.setupAppBadge();
        this.setupShareTarget();
        this.setupProtocolHandler();
        this.setupFileHandling();
        this.setupWakeLock();
        this.setupScreenKeepAwake();
        this.setupNativeNavigation();
        this.setupSplashScreen();
        this.setupAppShortcuts();
        this.setupWidgetSupport();
        this.setupPushNotifications();
        this.setupDataStorage();
        this.setupCrashReporting();
        this.setupPerformanceMonitoring();
    }
    
    // ==================== تحسينات للأجهزة المختلفة ====================
    optimizeForDevice() {
        // إضافة كلاس خاص بالجهاز للـ CSS
        if (this.deviceInfo.isSamsung) {
            document.body.classList.add('samsung-device');
            console.log('📱 Samsung optimization activated');
        }
        if (this.deviceInfo.isXiaomi) {
            document.body.classList.add('xiaomi-device');
            console.log('📱 Xiaomi optimization activated');
        }
        if (this.deviceInfo.isHuawei) {
            document.body.classList.add('huawei-device');
            console.log('📱 Huawei optimization activated');
        }
        if (this.deviceInfo.isOppo) {
            document.body.classList.add('oppo-device');
            console.log('📱 Oppo/Realme optimization activated');
        }
        
        // تحسين شريط الحالة
        this.setStatusBarStyle();
        
        // تحسين التمرير
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.touchAction = 'pan-y pinch-zoom';
    }
    
    setStatusBarStyle() {
        // تغيير لون شريط الحالة حسب الثيم
        const observer = new MutationObserver(() => {
            const isDark = document.body.classList.contains('dark');
            const themeColor = isDark ? '#0f172a' : '#2e7d32';
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    
    lockScreenOrientation() {
        // قفل الاتجاه عند الحاجة
        if (screen.orientation && screen.orientation.lock) {
            // ننتظر تفاعل المستخدم أولاً
            document.addEventListener('click', () => {
                if (this.isInstalled && screen.orientation.lock) {
                    screen.orientation.lock('portrait').catch(e => console.log('Orientation lock not supported'));
                }
            }, { once: true });
        }
    }
    
    async monitorBatteryStatus() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                this.deviceInfo.battery = {
                    level: battery.level * 100,
                    charging: battery.charging
                };
                console.log('🔋 Battery:', this.deviceInfo.battery);
                
                battery.addEventListener('levelchange', () => {
                    this.deviceInfo.battery.level = battery.level * 100;
                    if (battery.level < 0.15) {
                        this.showLowBatteryWarning();
                    }
                });
            } catch(e) { console.log('Battery API not available'); }
        }
    }
    
    showLowBatteryWarning() {
        this.showNativeToast('⚠️ شحن البطارية منخفض (أقل من 15%)', 'warning');
    }
    
    setupKeyboardHandling() {
        // التعامل مع لوحة المفاتيح في الحقول
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
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
            
            // التحقق من وجود تحديثات عند بدء التشغيل
            await this.swRegistration.update();
            
            // التحقق من التحديثات كل ساعة
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
    
    // ==================== التثبيت كتطبيق أصلي ====================
    checkInstallation() {
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ App installed in standalone mode');
            this.hideInstallButtons();
            this.applyNativeUI();
        }
        
        if (localStorage.getItem('pwa_installed') === 'true') {
            this.isInstalled = true;
        }
    }
    
    applyNativeUI() {
        // تطبيق واجهة تشبه التطبيقات الأصلية
        document.body.classList.add('native-mode');
        
        // إخفاء شريط التمرير الزائد
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // تحسين أداء التمرير
        const appMain = document.querySelector('.app-main');
        if (appMain) {
            appMain.style.overflowY = 'auto';
            appMain.style.height = '100vh';
            appMain.style.webkitOverflowScrolling = 'touch';
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
        if (installBtn && !this.deviceInfo.isSamsungBrowser) installBtn.style.display = 'inline-flex';
        if (welcomeInstallBtn && !this.deviceInfo.isSamsungBrowser) welcomeInstallBtn.style.display = 'inline-flex';
    }
    
    // ==================== إشعارات متقدمة تشبه Android ====================
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Notifications not supported');
            return false;
        }
        
        // طلب الإذن بعد تفاعل المستخدم
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
        
        // انتظر تفاعل المستخدم
        document.addEventListener('click', askForPermission, { once: true });
        return false;
    }
    
    showNativeAndroidNotification(title, body, image = null, requireInteraction = false) {
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
        
        if (image) options.image = image;
        
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
            null,
            false
        );
        this.updateBadge(this.badgeCount + 1);
    }
    
    // ==================== شارة التطبيق (Badge) ====================
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
                                minInterval: 12 * 60 * 60 * 1000 // كل 12 ساعة
                            });
                            console.log('✅ Periodic sync registered');
                        });
                    }
                });
        }
    }
    
    // ==================== مشاركة الملفات ====================
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
    
    // ==================== معالج الملفات ====================
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
        // معالجة الملفات المفتوحة
    }
    
    // ==================== منع الإغلاق التلقائي للشاشة ====================
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
        
        // تفعيل عند التفاعل
        document.addEventListener('click', requestWakeLock, { once: true });
    }
    
    setupScreenKeepAwake() {
        // منع إغلاق الشاشة أثناء الاستخدام
        let activityTimeout;
        const resetTimeout = () => {
            clearTimeout(activityTimeout);
            activityTimeout = setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    this.showToast('نشاط غير عادي؟ اضغط للبقاء مستيقظاً');
                }
            }, 5 * 60 * 1000);
        };
        
        document.addEventListener('click', resetTimeout);
        document.addEventListener('touchstart', resetTimeout);
    }
    
    // ==================== التنقل الأصلي ====================
    setupNativeNavigation() {
        // معالجة أزرار الرجوع
        window.addEventListener('popstate', (event) => {
            const modal = document.querySelector('.modal.active');
            if (modal) {
                event.preventDefault();
                modal.classList.remove('active');
                history.pushState(null, '', window.location.href);
            }
        });
        
        // إضافة نقطة تاريخ أولية
        history.pushState(null, '', window.location.href);
    }
    
    // ==================== شاشة البداية ====================
    setupSplashScreen() {
        // إخفاء شاشة البداية بشكل تدريجي
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
        // معالجة اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            // Ctrl + N = إضافة مادة جديدة
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                document.getElementById('mainAddBtn')?.click();
            }
            // Ctrl + S = مزامنة
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                document.getElementById('syncBtn')?.click();
            }
            // Escape = إغلاق النوافذ
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.active');
                if (modal) modal.classList.remove('active');
            }
        });
    }
    
    // ==================== دعم الـ Widget ====================
    setupWidgetSupport() {
        // حفظ الحالة لاستخدامها في الـ Widget
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('last_state', JSON.stringify({
                materialsCount: window.allMaterials?.length || 0,
                timestamp: Date.now()
            }));
        });
    }
    
    // ==================== إشعارات Push ====================
    setupPushNotifications() {
        if ('PushManager' in window) {
            console.log('✅ Push Notifications supported');
            // يمكن إضافة سيرفر push هنا
        }
    }
    
    // ==================== تخزين البيانات المحلي ====================
    setupDataStorage() {
        // استخدام IndexedDB للتخزين المتقدم
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
    
    // ==================== تقارير الأعطال ====================
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
        
        // حفظ في localStorage
        const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
        errors.push(errorLog);
        if (errors.length > 50) errors.shift();
        localStorage.setItem('error_logs', JSON.stringify(errors));
    }
    
    // ==================== مراقبة الأداء ====================
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
    
    // ==================== توست على نمط Android ====================
    showToast(message, type = 'info') {
        const existing = document.querySelector('.native-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `native-toast ${type}`;
        toast.innerHTML = `
            <div class="native-toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(30px);
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(20px);
            color: white;
            padding: 12px 24px;
            border-radius: 48px;
            font-size: 0.85rem;
            z-index: 10001;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            direction: rtl;
            max-width: 85%;
            text-align: center;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(30px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    showNativeToast(message, type = 'info') {
        this.showToast(message, type);
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
            this.showNativeToast('لا يوجد اتصال بالإنترنت - البيانات متاحة دون اتصال', 'warning');
        });
    }
    
    async syncOfflineData() {
        if (!this.isOnline) return;
        console.log('🔄 Syncing offline data...');
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
                <div class="install-dialog-icon">
                    <i class="fas fa-boxes"></i>
                </div>
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
                    <i class="fas fa-mobile-alt"></i>
                    <h3>تثبيت على شاومي</h3>
                    <ol>
                        <li>افتح قائمة المتصفح (ثلاث نقاط)</li>
                        <li>اختر "تثبيت التطبيق"</li>
                        <li>اضغط على "تثبيت" للتأكيد</li>
                    </ol>
                    <button class="guide-close">حسناً</button>
                </div>
            `;
        } else {
            guideHTML = `
                <div class="install-guide-dialog">
                    <i class="fas fa-download"></i>
                    <h3>تثبيت التطبيق</h3>
                    <ol>
                        <li>افتح قائمة المتصفح (ثلاث نقاط)</li>
                        <li>اختر "تثبيت التطبيق"</li>
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
            version: '4.0',
            features: {
                backgroundSync: 'sync' in navigator.serviceWorker,
                periodicSync: 'periodicSync' in navigator.serviceWorker,
                wakeLock: 'wakeLock' in navigator,
                badge: 'setAppBadge' in navigator,
                share: 'share' in navigator,
                fileHandling: 'launchQueue' in window,
                pushNotifications: 'PushManager' in window
            }
        };
    }
    
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
        return 'browser';
    }
}

// ==================== تهيئة PWA Manager ====================
let pwaManager = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new NativePWAManager();
    window.pwaManager = pwaManager;
    console.log('📱 PWA Info:', pwaManager.getAppInfo());
});
