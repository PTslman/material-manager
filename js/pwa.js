
// pwa.js - ملف PWA متكامل ومتقدم للمشروع على /material-manager/

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.installButton = null;
        this.installWelcomeBtn = null;
        this.hasShownInstallPrompt = false;
        
        this.init();
    }
    
    init() {
        this.checkInstallationStatus();
        this.setupEventListeners();
        this.monitorOnlineStatus();
        
        // محاولة إظهار زر التثبيت بعد تحميل الصفحة
        setTimeout(() => {
            this.checkAndShowInstallButton();
        }, 2000);
    }
    
    // التحقق من حالة التثبيت
    checkInstallationStatus() {
        // التحقق من وضع العرض المستقل
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('✅ App is installed (standalone mode)');
            this.hideInstallButtons();
        }
        
        // التحقق من iOS
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
        if (this.isInstalled) return;
        
        const installBtn = document.getElementById('installBtn');
        const installWelcomeBtn = document.getElementById('installWelcomeBtn');
        
        if (installBtn) {
            installBtn.style.display = 'inline-flex';
            console.log('✅ Install button shown');
        }
        if (installWelcomeBtn) {
            installWelcomeBtn.style.display = 'inline-flex';
            console.log('✅ Welcome install button shown');
        }
    }
    
    // محاولة إظهار زر التثبيت
    checkAndShowInstallButton() {
        console.log('🔍 Checking for install button display...');
        
        // إذا كان التطبيق مثبتاً بالفعل
        if (this.isInstalled) {
            this.hideInstallButtons();
            return;
        }
        
        // إذا كان هناك deferredPrompt
        if (this.deferredPrompt) {
            this.showInstallButtons();
        }
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // الحدث الرئيسي للتثبيت
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎯 beforeinstallprompt event fired!');
            e.preventDefault();
            this.deferredPrompt = e;
            this.hasShownInstallPrompt = true;
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
            installBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.installApp();
            });
        }
        
        if (installWelcomeBtn) {
            installWelcomeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.installApp();
            });
        }
    }
    
    // تثبيت التطبيق
    async installApp() {
        console.log('📱 Install button clicked');
        
        // إذا كان التطبيق مثبتاً بالفعل
        if (this.isInstalled) {
            this.showToast('التطبيق مثبت بالفعل على جهازك', 'info');
            return;
        }
        
        // إذا كان هناك حدث deferredPrompt
        if (this.deferredPrompt) {
            try {
                console.log('🎯 Showing native install prompt');
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('✅ User accepted installation');
                    this.showToast('✓ تم تثبيت التطبيق', 'success');
                    this.isInstalled = true;
                    localStorage.setItem('pwa-installed', 'true');
                } else {
                    console.log('❌ User dismissed installation');
                    this.showInstallInstructions();
                }
                
                this.deferredPrompt = null;
                this.hideInstallButtons();
            } catch (error) {
                console.error('Installation error:', error);
                this.showInstallInstructions();
            }
        } else {
            // إذا لم يكن هناك deferredPrompt، نظهر تعليمات التثبيت
            console.log('⚠️ No deferredPrompt available');
            this.showInstallInstructions();
        }
    }
    
    // إظهار تعليمات التثبيت
    showInstallInstructions() {
        // إزالة أي نافذة موجودة
        const existingDialog = document.getElementById('installInstructionsDialog');
        if (existingDialog) existingDialog.remove();
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        
        let instructions = '';
        
        if (isIOS) {
            instructions = `
                <div style="margin-bottom: 15px;">
                    <strong>لتثبيت التطبيق على iPhone/iPad:</strong>
                    <ol style="margin-top: 10px; padding-right: 20px;">
                        <li>اضغط على زر <i class="fas fa-share-alt"></i> "مشاركة"</li>
                        <li>اختر <i class="fas fa-plus-circle"></i> "أضف إلى الشاشة الرئيسية"</li>
                        <li>اضغط على "إضافة"</li>
                    </ol>
                </div>
            `;
        } else if (isChrome) {
            instructions = `
                <div style="margin-bottom: 15px;">
                    <strong>لتثبيت التطبيق على كروم:</strong>
                    <ol style="margin-top: 10px; padding-right: 20px;">
                        <li>اضغط على القائمة <i class="fas fa-ellipsis-h"></i> (ثلاث نقاط)</li>
                        <li>اختر <i class="fas fa-download"></i> "تثبيت التطبيق"</li>
                        <li>اضغط على "تثبيت"</li>
                    </ol>
                </div>
            `;
        } else {
            instructions = `
                <div style="margin-bottom: 15px;">
                    <strong>لتثبيت التطبيق على متصفحك:</strong>
                    <ol style="margin-top: 10px; padding-right: 20px;">
                        <li>افتح قائمة المتصفح (عادةً ثلاث نقاط ☰)</li>
                        <li>ابحث عن خيار "تثبيت التطبيق" أو "Add to Home Screen"</li>
                        <li>اتبع التعليمات لإكمال التثبيت</li>
                    </ol>
                </div>
            `;
        }
        
        const dialog = document.createElement('div');
        dialog.id = 'installInstructionsDialog';
        dialog.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(4px);
                z-index: 10004;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: var(--bg-surface);
                    border-radius: 28px;
                    padding: 24px;
                    width: 90%;
                    max-width: 380px;
                    text-align: center;
                    border: 1px solid var(--border-light);
                    direction: rtl;
                ">
                    <i class="fas fa-download" style="font-size: 3rem; color: var(--accent); margin-bottom: 15px; display: block;"></i>
                    <h3 style="margin-bottom: 10px;">تثبيت التطبيق</h3>
                    <p style="margin-bottom: 20px; color: var(--text-secondary);">اتبع الخطوات التالية لتثبيت التطبيق على جهازك:</p>
                    ${instructions}
                    <button id="closeInstructionsDialog" style="
                        background: var(--accent);
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 40px;
                        cursor: pointer;
                        font-weight: bold;
                        width: 100%;
                        margin-top: 15px;
                    ">حسناً، فهمت</button>
                    <button id="dontShowAgain" style="
                        background: transparent;
                        border: none;
                        color: var(--text-secondary);
                        margin-top: 12px;
                        cursor: pointer;
                        font-size: 0.8rem;
                    ">عدم الإظهار مرة أخرى</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        document.getElementById('closeInstructionsDialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('dontShowAgain').addEventListener('click', () => {
            localStorage.setItem('dontShowInstallInstructions', 'true');
            dialog.remove();
            this.showToast('تم إلغاء إظهار التعليمات', 'info');
        });
        
        // إغلاق عند النقر خارج النافذة
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.remove();
        });
    }
    
    // مراقبة حالة الاتصال بالإنترنت
    monitorOnlineStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('✅ App is online');
            this.showToast('🔄 تم استعادة الاتصال بالإنترنت', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('⚠️ App is offline');
            this.showToast('⚠️ لا يوجد اتصال بالإنترنت', 'warning');
        });
    }
    
    // إظهار رسالة منبثقة
    showToast(message, type = 'success') {
        const colors = {
            success: '#10b981',
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
    
    // الحصول على معلومات PWA
    getInfo() {
        return {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            hasDeferredPrompt: !!this.deferredPrompt,
            serviceWorkerSupported: 'serviceWorker' in navigator,
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

// تهيئة PWA عند تحميل الصفحة
let pwaManager = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new PWAManager();
    window.pwaManager = pwaManager;
    console.log('📱 PWA Info:', pwaManager.getInfo());
});
