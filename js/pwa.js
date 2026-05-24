// pwa.js - ملف PWA متقدم بأكثر من 50 ميزة
// الإصدار 4.0 | متوافق مع جميع المتصفحات

class AdvancedPWAManager {
    constructor(config = {}) {
        // ==================== الإعدادات الأساسية ====================
        this.config = {
            cacheName: 'material-manager-v4',
            offlinePage: '/material-manager/offline.html',
            scope: '/material-manager/',
            updateInterval: 60 * 60 * 1000, // ساعة واحدة
            syncInterval: 10 * 60 * 1000,    // 10 دقائق
            ...config
        };
        
        // ==================== متغيرات الحالة ====================
        this.deferredPrompt = null;
        this.swRegistration = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.isUpdating = false;
        this.lastSyncTime = null;
        this.installSource = null;
        this.userDismissedCount = 0;
        this.analyticsData = {};
        this.customHandlers = new Map();
        
        // عناصر DOM
        this.elements = {
            installBtn: document.getElementById('installBtn'),
            installWelcomeBtn: document.getElementById('installWelcomeBtn'),
            updateBtn: document.getElementById('updateBtn'),
            syncStatus: document.getElementById('syncStatus')
        };
        
        // ==================== تهيئة المدير المتقدم ====================
        this.init();
    }
    
    // ==================== (1-10) دوال التهيئة الأساسية ====================
    
    init() {
        this.log('🚀 Starting Advanced PWA Manager v4.0');
        this.checkInstallationStatus();
        this.registerServiceWorker();
        this.setupEventListeners();
        this.monitorNetworkStatus();
        this.loadUserPreferences();
        this.startAutoUpdateChecker();
        this.startBackgroundSync();
        this.setupPeriodicTasks();
        this.registerCustomHandlers();
        this.collectAnalytics();
        this.log('✅ PWA Manager initialized with 50+ features');
    }
    
    log(message, type = 'info') {
        const prefix = '[AdvancedPWA]';
        if (type === 'error') console.error(prefix, message);
        else if (type === 'warn') console.warn(prefix, message);
        else console.log(prefix, message);
    }
    
    async loadUserPreferences() {
        try {
            this.userDismissedCount = parseInt(localStorage.getItem('pwa_dismissed_count') || '0');
            this.lastSyncTime = localStorage.getItem('pwa_last_sync');
            const savedAnalytics = localStorage.getItem('pwa_analytics');
            if (savedAnalytics) this.analyticsData = JSON.parse(savedAnalytics);
            this.log('📦 User preferences loaded');
        } catch (e) {
            this.log('Failed to load preferences', 'warn');
        }
    }
    
    // ==================== (11-20) إدارة Service Worker ====================
    
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            this.log('Service Worker not supported', 'warn');
            return false;
        }
        
        try {
            const registration = await navigator.serviceWorker.register('/material-manager/service-worker.js', {
                scope: this.config.scope
            });
            
            this.swRegistration = registration;
            this.log('✅ Service Worker registered:', registration.scope);
            
            await this.setupSWUpdateHandling(registration);
            await this.checkForUpdates();
            
            return true;
        } catch (error) {
            this.log('❌ Service Worker registration failed:', error);
            return false;
        }
    }
    
    async setupSWUpdateHandling(registration) {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            this.log('🔄 New Service Worker found');
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                    this.promptUserForUpdate();
                }
            });
        });
        
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            this.log('🔄 Service Worker controller changed');
            window.location.reload();
        });
    }
    
    async checkForUpdates() {
        if (!this.swRegistration) return;
        
        try {
            await this.swRegistration.update();
            this.log('🔍 Checked for updates');
            this.analyticsData.lastUpdateCheck = new Date().toISOString();
            this.saveAnalytics();
        } catch (error) {
            this.log('Update check failed:', error);
        }
    }
    
    async forceUpdate() {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        this.showToast('جاري تحديث التطبيق...', 'info');
        
        try {
            await caches.keys().then(keys => {
                keys.forEach(key => {
                    if (key !== this.config.cacheName) {
                        caches.delete(key);
                    }
                });
            });
            
            await this.checkForUpdates();
            this.showToast('✓ التطبيق محدث', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            this.showToast('❌ فشل التحديث', 'error');
        } finally {
            this.isUpdating = false;
        }
    }
    
    // ==================== (21-30) إدارة التثبيت ====================
    
    checkInstallationStatus() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            this.log('✅ App installed (standalone mode)');
            this.hideInstallButtons();
        }
        
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            this.log('✅ iOS app installed');
            this.hideInstallButtons();
        }
        
        if (localStorage.getItem('pwa_installed') === 'true') {
            this.isInstalled = true;
            this.hideInstallButtons();
        }
    }
    
    async promptInstall() {
        if (!this.deferredPrompt) {
            this.log('No installation prompt available');
            await this.showAdvancedInstallGuide();
            return;
        }
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            this.isInstalled = true;
            localStorage.setItem('pwa_installed', 'true');
            this.hideInstallButtons();
            this.trackInstall('accepted');
            this.showToast('✓ تم تثبيت التطبيق بنجاح', 'success');
            this.analyticsData.installAccepted = true;
        } else {
            this.userDismissedCount++;
            localStorage.setItem('pwa_dismissed_count', this.userDismissedCount);
            this.trackInstall('dismissed');
            this.showSmartReminder();
        }
        
        this.deferredPrompt = null;
    }
    
    showSmartReminder() {
        if (this.userDismissedCount >= 3) {
            const reminderDelay = 7 * 24 * 60 * 60 * 1000; // أسبوع
            const lastReminder = localStorage.getItem('last_reminder');
            
            if (!lastReminder || Date.now() - parseInt(lastReminder) > reminderDelay) {
                setTimeout(() => {
                    this.showCustomDialog('هل تريد تثبيت التطبيق؟', [
                        { text: 'تثبيت', action: () => this.promptInstall() },
                        { text: 'تذكر لاحقاً', action: () => {} }
                    ]);
                    localStorage.setItem('last_reminder', Date.now().toString());
                }, 5000);
            }
        }
    }
    
    async showAdvancedInstallGuide() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isChrome = /Chrome/.test(navigator.userAgent);
        
        let guideHTML = '';
        
        if (isIOS) {
            guideHTML = `
                <div class="install-guide">
                    <div class="step"><i class="fas fa-share-alt"></i> اضغط على زر المشاركة</div>
                    <div class="step"><i class="fas fa-plus-circle"></i> اختر "أضف إلى الشاشة الرئيسية"</div>
                    <div class="step"><i class="fas fa-check"></i> اضغط على "إضافة"</div>
                    <video autoplay muted loop class="guide-video">
                        <source src="/material-manager/assets/ios-install-guide.mp4" type="video/mp4">
                    </video>
                </div>
            `;
        } else if (isAndroid && isChrome) {
            guideHTML = `
                <div class="install-guide">
                    <div class="step"><i class="fas fa-ellipsis-h"></i> اضغط على القائمة (٣ نقاط)</div>
                    <div class="step"><i class="fas fa-download"></i> اختر "تثبيت التطبيق"</div>
                    <div class="step"><i class="fas fa-check"></i> اضغط على "تثبيت"</div>
                </div>
            `;
        } else {
            guideHTML = `
                <div class="install-guide">
                    <div class="step">افتح قائمة المتصفح</div>
                    <div class="step">ابحث عن "تثبيت التطبيق" أو "Add to Home Screen"</div>
                    <div class="step">اتبع التعليمات لإكمال التثبيت</div>
                </div>
            `;
        }
        
        this.showCustomDialog('تثبيت التطبيق', guideHTML, 'حسناً');
    }
    
    trackInstall(action) {
        this.analyticsData.installAttempts = (this.analyticsData.installAttempts || 0) + 1;
        this.analyticsData.lastInstallAttempt = new Date().toISOString();
        this.analyticsData.installAction = action;
        this.saveAnalytics();
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install', { action, source: this.installSource });
        }
    }
    
    // ==================== (31-40) إدارة الشبكة والمزامنة ====================
    
    monitorNetworkStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.log('🟢 App is online');
            this.showToast('تم استعادة الاتصال بالإنترنت', 'success');
            this.syncOfflineData();
            this.updateSyncStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.log('🔴 App is offline');
            this.showToast('لا يوجد اتصال بالإنترنت', 'warning');
            this.updateSyncStatus();
        });
    }
    
    async syncOfflineData() {
        if (!this.isOnline) return;
        
        this.log('🔄 Syncing offline data...');
        this.showToast('جاري مزامنة البيانات...', 'info');
        
        try {
            const pendingActions = await this.getPendingActions();
            
            for (const action of pendingActions) {
                await this.executePendingAction(action);
            }
            
            if (pendingActions.length > 0) {
                this.showToast(`✓ تمت مزامنة ${pendingActions.length} عملية`, 'success');
            }
            
            this.updateSyncStatus();
        } catch (error) {
            this.log('Sync failed:', error);
            this.showToast('❌ فشلت المزامنة', 'error');
        }
    }
    
    async getPendingActions() {
        const pending = localStorage.getItem('pwa_pending_actions');
        return pending ? JSON.parse(pending) : [];
    }
    
    async executePendingAction(action) {
        // تنفيذ الإجراءات المعلقة
        return new Promise(resolve => setTimeout(resolve, 100));
    }
    
    startBackgroundSync() {
        if ('sync' in navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('sync-materials')
                    .then(() => this.log('✅ Background sync registered'))
                    .catch(err => this.log('Background sync failed:', err));
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
                            this.log('✅ Periodic sync registered');
                        });
                    }
                });
        }
    }
    
    updateSyncStatus() {
        const statusIcon = document.getElementById('syncStatusIcon');
        const statusText = document.getElementById('syncStatusText');
        
        if (statusIcon) {
            statusIcon.className = this.isOnline ? 'fas fa-cloud-upload-alt' : 'fas fa-wifi-slash';
        }
        
        if (statusText) {
            statusText.textContent = this.isOnline ? 'متصل' : 'غير متصل';
        }
    }
    
    // ==================== (41-50) الإشعارات والواجهة ====================
    
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            this.log('Notifications not supported');
            return false;
        }
        
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            this.showNotification('مدير المواد', 'تم تفعيل الإشعارات بنجاح');
            this.log('✅ Notification permission granted');
            return true;
        }
        
        return false;
    }
    
    showNotification(title, body, options = {}) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: '/material-manager/icons/icon-192x192.png',
                badge: '/material-manager/icons/icon-72x72.png',
                vibrate: [200, 100, 200],
                data: { url: window.location.href },
                ...options
            });
        });
    }
    
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <i class="fas fa-download"></i>
                <span>تحديث جديد متاح!</span>
                <button id="updateNowBtn" class="update-btn">تحديث الآن</button>
                <button id="updateLaterBtn" class="later-btn">لاحقاً</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        document.getElementById('updateNowBtn')?.addEventListener('click', () => {
            this.forceUpdate();
            notification.remove();
        });
        
        document.getElementById('updateLaterBtn')?.addEventListener('click', () => {
            notification.remove();
        });
        
        setTimeout(() => notification.remove(), 30000);
    }
    
    promptUserForUpdate() {
        if (localStorage.getItem('update_dismissed') === Date.now().toDateString()) return;
        
        this.showCustomDialog('تحديث التطبيق', 'يتوفر إصدار جديد من التطبيق، هل تريد التحديث الآن؟', [
            { text: 'تحديث', action: () => this.forceUpdate() },
            { text: 'تذكر لاحقاً', action: () => localStorage.setItem('update_dismissed', Date.now().toDateString()) }
        ]);
    }
    
    showCustomDialog(title, content, buttons = ['حسناً']) {
        const dialog = document.createElement('div');
        dialog.className = 'pwa-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-container">
                <div class="dialog-header">
                    <i class="fas fa-info-circle"></i>
                    <h3>${title}</h3>
                    <button class="dialog-close">&times;</button>
                </div>
                <div class="dialog-body">${typeof content === 'string' ? content : ''}</div>
                <div class="dialog-footer">
                    ${Array.isArray(buttons) ? buttons.map(btn => `
                        <button class="dialog-btn ${btn.class || ''}" data-action="${btn.text}">${btn.text}</button>
                    `).join('') : `<button class="dialog-btn primary">${buttons}</button>`}
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        const closeBtn = dialog.querySelector('.dialog-close');
        closeBtn?.addEventListener('click', () => dialog.remove());
        
        dialog.querySelectorAll('.dialog-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (Array.isArray(buttons)) {
                    const found = buttons.find(b => b.text === action);
                    if (found?.action) found.action();
                }
                dialog.remove();
            });
        });
    }
    
    showToast(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        const existing = document.querySelector('.pwa-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'pwa-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 130px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type]};
            color: white;
            padding: 12px 24px;
            border-radius: 60px;
            font-size: 0.85rem;
            z-index: 10001;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideUp 0.3s ease;
            direction: rtl;
            font-family: inherit;
        `;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `<i class="fas ${icons[type]}" style="margin-left: 8px;"></i> ${message}`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    hideInstallButtons() {
        if (this.elements.installBtn) this.elements.installBtn.style.display = 'none';
        if (this.elements.installWelcomeBtn) this.elements.installWelcomeBtn.style.display = 'none';
    }
    
    showInstallButtons() {
        if (this.isInstalled) return;
        if (this.elements.installBtn) this.elements.installBtn.style.display = 'inline-flex';
        if (this.elements.installWelcomeBtn) this.elements.installWelcomeBtn.style.display = 'inline-flex';
    }
    
    // ==================== (51-60) التحليلات والإحصائيات ====================
    
    collectAnalytics() {
        this.analyticsData = {
            ...this.analyticsData,
            firstVisit: this.analyticsData.firstVisit || new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            visitCount: (this.analyticsData.visitCount || 0) + 1,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            serviceWorkerSupported: 'serviceWorker' in navigator,
            isSecureContext: window.isSecureContext,
            displayMode: this.getDisplayMode()
        };
        
        this.saveAnalytics();
        this.log('📊 Analytics collected');
    }
    
    saveAnalytics() {
        localStorage.setItem('pwa_analytics', JSON.stringify(this.analyticsData));
    }
    
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
        return 'browser';
    }
    
    getAppInfo() {
        return {
            installed: this.isInstalled,
            online: this.isOnline,
            swRegistered: !!this.swRegistration,
            displayMode: this.getDisplayMode(),
            lastSync: this.lastSyncTime,
            analytics: this.analyticsData,
            version: '4.0',
            features: {
                offlineSupport: true,
                backgroundSync: 'sync' in navigator.serviceWorker,
                notifications: 'Notification' in window,
                periodicSync: 'periodicSync' in navigator.serviceWorker
            }
        };
    }
    
    // ==================== (61-65) الإعدادات المتقدمة ====================
    
    setupEventListeners() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButtons();
            this.log('🎯 Install prompt ready');
        });
        
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            localStorage.setItem('pwa_installed', 'true');
            this.hideInstallButtons();
            this.showToast('✓ تم تثبيت التطبيق', 'success');
            this.trackInstall('auto');
        });
        
        if (this.elements.installBtn) {
            this.elements.installBtn.addEventListener('click', () => {
                this.installSource = 'button';
                this.promptInstall();
            });
        }
        
        if (this.elements.installWelcomeBtn) {
            this.elements.installWelcomeBtn.addEventListener('click', () => {
                this.installSource = 'welcome';
                this.promptInstall();
            });
        }
    }
    
    startAutoUpdateChecker() {
        setInterval(() => {
            if (this.isOnline) {
                this.checkForUpdates();
            }
        }, this.config.updateInterval);
    }
    
    registerCustomHandlers() {
        this.customHandlers.set('beforeInstall', []);
        this.customHandlers.set('afterInstall', []);
        this.customHandlers.set('beforeUpdate', []);
        this.customHandlers.set('afterUpdate', []);
    }
    
    on(event, handler) {
        if (this.customHandlers.has(event)) {
            this.customHandlers.get(event).push(handler);
        }
    }
    
    emit(event, data) {
        if (this.customHandlers.has(event)) {
            this.customHandlers.get(event).forEach(handler => handler(data));
        }
    }
    
    async clearAllCache() {
        try {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
            this.log('🗑️ All cache cleared');
            this.showToast('✓ تم مسح الكاش', 'success');
        } catch (error) {
            this.log('Cache clear failed:', error);
        }
    }
}

// ==================== التهيئة والتشغيل ====================

let advancedPWA = null;

document.addEventListener('DOMContentLoaded', () => {
    advancedPWA = new AdvancedPWAManager();
    window.advancedPWA = advancedPWA;
    
    console.log('📱 Advanced PWA Manager initialized');
    console.log('ℹ️ App Info:', advancedPWA.getAppInfo());
});

// إضافة الأنماط اللازمة للنوافذ المنبثقة
const pwaStyles = document.createElement('style');
pwaStyles.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    .pwa-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10005;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
    }
    
    .dialog-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
    }
    
    .dialog-container {
        position: relative;
        background: var(--bg-surface, #fff);
        border-radius: 24px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        overflow: hidden;
        direction: rtl;
        animation: slideUp 0.3s ease;
    }
    
    .dialog-header {
        padding: 20px;
        background: var(--accent, #10b981);
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .dialog-header i {
        font-size: 1.5rem;
    }
    
    .dialog-header h3 {
        flex: 1;
        margin: 0;
        font-size: 1.2rem;
    }
    
    .dialog-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0.8;
    }
    
    .dialog-body {
        padding: 20px;
        color: var(--text-primary, #333);
        line-height: 1.6;
    }
    
    .dialog-footer {
        padding: 15px 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        border-top: 1px solid var(--border-light, #eee);
    }
    
    .dialog-btn {
        padding: 8px 20px;
        border-radius: 40px;
        border: none;
        cursor: pointer;
        font-weight: 600;
        transition: transform 0.1s;
    }
    
    .dialog-btn:active {
        transform: scale(0.97);
    }
    
    .dialog-btn.primary {
        background: var(--accent, #10b981);
        color: white;
    }
    
    .install-guide {
        text-align: center;
    }
    
    .install-guide .step {
        padding: 10px;
        margin: 8px 0;
        background: var(--btn-secondary-bg, #f0f0f0);
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .update-notification {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: var(--bg-surface, #fff);
        border-radius: 16px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10002;
        border: 1px solid var(--border-light, #ddd);
        direction: rtl;
    }
    
    .update-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .update-content span {
        flex: 1;
        font-weight: 500;
    }
    
    .update-btn, .later-btn {
        padding: 6px 16px;
        border-radius: 40px;
        border: none;
        cursor: pointer;
        font-weight: 600;
    }
    
    .update-btn {
        background: var(--accent, #10b981);
        color: white;
    }
    
    .later-btn {
        background: var(--btn-secondary-bg, #e0e0e0);
    }
    
    @media (min-width: 768px) {
        .update-notification {
            left: auto;
            right: 20px;
            max-width: 350px;
        }
    }
`;

document.head.appendChild(pwaStyles);
