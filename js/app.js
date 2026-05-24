// app.js - الملف الرئيسي للتطبيق

// المتغيرات العامة
let allMaterials = [];
let unsubscribe = null;
let autoSyncTimer = null;
let currentEditId = null;
let fileInput = null;
let currentUnit = "kg";
let isConnected = false;
let isSyncing = false;
let lastSyncDate = null;
let reconnectAttempts = 0;
let splashHidden = false;
let deferredPrompt = null;

// دوال التهيئة
function forceHideSplash() {
    if (splashHidden) return;
    splashHidden = true;
    const splashEl = document.getElementById('splashScreen');
    const appContainer = document.getElementById('appContainer');
    if (splashEl) {
        splashEl.classList.add('hidden');
        setTimeout(() => {
            splashEl.style.display = 'none';
            if (appContainer) appContainer.style.display = 'block';
        }, 350);
    } else {
        if (appContainer) appContainer.style.display = 'block';
    }
}

function setTheme(th) {
    if (th === 'dark') {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i> نهاري';
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i> ليلي';
    }
}

function updateSyncUI(status, itemCount = null) {
    const syncDot = document.getElementById('syncDot');
    const syncStatusText = document.getElementById('syncStatusText');
    const syncRetry = document.getElementById('syncRetry');
    const syncItemsCount = document.getElementById('syncItemsCount');
    const syncLastTime = document.getElementById('syncLastTime');
    
    if (status === 'connected') {
        if (syncDot) syncDot.className = 'sync-dot';
        if (syncStatusText) syncStatusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncRetry) syncRetry.style.display = 'none';
        isConnected = true;
    } else if (status === 'offline') {
        if (syncDot) syncDot.className = 'sync-dot offline';
        if (syncStatusText) syncStatusText.innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
        if (syncRetry) syncRetry.style.display = 'inline-flex';
        isConnected = false;
    } else if (status === 'syncing') {
        if (syncDot) syncDot.className = 'sync-dot syncing';
        if (syncStatusText) syncStatusText.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> جاري المزامنة...';
    } else if (status === 'checking') {
        if (syncDot) syncDot.className = 'sync-dot syncing';
        if (syncStatusText) syncStatusText.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> جاري التحقق...';
    }
    
    if (itemCount !== null && syncItemsCount) {
        syncItemsCount.innerHTML = `<i class="fas fa-database"></i> ${itemCount} عنصر`;
    }
    
    if (lastSyncDate && syncLastTime) {
        let d = new Date(lastSyncDate);
        syncLastTime.innerHTML = `<i class="far fa-clock"></i> ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    }
}

// دالة للتحقق من الاتصال قبل المزامنة
async function checkConnectionAndSync() {
    updateSyncUI('checking');
    
    // محاولة جلب بيانات بسيطة للتحقق من الاتصال
    try {
        const testQuery = await materialsCollection.limit(1).get();
        // إذا وصلنا هنا، الاتصال موجود
        if (unsubscribe) unsubscribe();
        startListener();
        updateSyncUI('connected', allMaterials.length);
        showToast("🔄 تمت المزامنة بنجاح");
        return true;
    } catch (error) {
        console.error("فشل الاتصال:", error);
        updateSyncUI('offline');
        showToast("❌ لا يوجد اتصال بالإنترنت، يرجى التحقق من الشبكة", true);
        return false;
    }
}

function startListener() {
    updateSyncUI('syncing');
    if (unsubscribe) unsubscribe();
    
    const query = materialsCollection.orderBy('createdAt', 'desc');
    let firstSnapshot = true;
    
    unsubscribe = query.onSnapshot((snapshot) => {
        const list = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            list.push({
                id: doc.id,
                name: data.name,
                unitType: data.unitType,
                quantity: data.quantity,
                notes: data.notes || "",
                createdAt: data.createdAt,
                priority: data.priority || "main"
            });
        });
        allMaterials = list;
        lastSyncDate = new Date();
        updateSyncUI('connected', list.length);
        
        // تحديث واجهة المستخدم
        if (window.renderAllMaterials) {
            window.renderAllMaterials(allMaterials);
        }
        
        if (firstSnapshot) {
            firstSnapshot = false;
            forceHideSplash();
        }
        reconnectAttempts = 0;
    }, (error) => {
        console.error("Firestore error:", error);
        updateSyncUI('offline');
        forceHideSplash();
        if (reconnectAttempts < 3) {
            reconnectAttempts++;
            setTimeout(() => {
                if (unsubscribe) {
                    unsubscribe();
                    startListener();
                }
            }, 3000);
        }
    });
}

function startAutoSync() {
    if (autoSyncTimer) clearInterval(autoSyncTimer);
    autoSyncTimer = setInterval(() => {
        if (unsubscribe) {
            unsubscribe();
            startListener();
        }
    }, 15 * 60 * 1000);
}

// دوال العمليات الأساسية
async function addNewMaterialDirect() {
    let name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) {
        showToast("✏️ اكتب اسم المادة", true);
        return;
    }
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    if (isNaN(quantity) || quantity <= 0) {
        showToast("🔢 كمية صحيحة", true);
        return;
    }
    showToast(`➕ جاري إضافة "${name}"...`);
    try {
        await materialsCollection.add({
            name: name,
            unitType: 'kg',
            quantity: quantity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: "main"
        });
        showToast(`✓ تمت إضافة "${name}"`);
        if (document.getElementById('newMaterialName')) document.getElementById('newMaterialName').value = "";
        if (document.getElementById('newQuantityValue')) document.getElementById('newQuantityValue').value = "1";
        const newItemModal = document.getElementById('newItemModal');
        if (newItemModal) newItemModal.classList.remove('active');
    } catch (e) {
        showToast("❌ خطأ في الاتصال", true);
    }
}

async function clearAll() {
    if (allMaterials.length === 0) {
        showToast("📭 القائمة فارغة", true);
        return;
    }
    if (!confirm("⚠️ حذف جميع المواد نهائياً؟")) return;
    try {
        let batch = db.batch();
        allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
        await batch.commit();
        showToast("✓ تم مسح القائمة");
    } catch (e) {
        showToast("❌ فشل المسح", true);
    }
}

function backupData() {
    let data = JSON.stringify(allMaterials, null, 2);
    let blob = new Blob([data], { type: 'application/json' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(blob);
    showToast("💾 تم نسخ البيانات");
}

function restoreData() {
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        fileInput.onchange = async (e) => {
            let file = e.target.files[0];
            if (!file) return;
            let reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    let backup = JSON.parse(ev.target.result);
                    if (!Array.isArray(backup)) throw new Error();
                    if (confirm(`⚠️ استبدال بـ ${backup.length} عنصر؟`)) {
                        let batch = db.batch();
                        allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
                        await batch.commit();
                        for (let it of backup) {
                            await materialsCollection.add({
                                name: it.name,
                                unitType: it.unitType,
                                quantity: it.quantity,
                                notes: it.notes || "",
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                priority: it.priority || "main"
                            });
                        }
                        showToast(`✓ تم استعادة ${backup.length} عنصر`);
                    }
                } catch (err) {
                    showToast("❌ ملف غير صالح", true);
                }
            };
            reader.readAsText(file);
        };
    }
    fileInput.click();
}

// إعداد PWA والتثبيت
function setupPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') showToast('✓ تم تثبيت التطبيق');
                deferredPrompt = null;
                if (installBtn) installBtn.style.display = 'none';
            } else {
                showToast('يمكنك التثبيت من قائمة المتصفح', false);
            }
        });
    }
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
        if (installBtn) installBtn.style.display = 'none';
    }
}

// ربط الأحداث
function bindEvents() {
    // أزرار رئيسية
    const mainAddBtn = document.getElementById('mainAddBtn');
    if (mainAddBtn) mainAddBtn.onclick = () => {
        const newItemModal = document.getElementById('newItemModal');
        if (newItemModal) newItemModal.classList.add('active');
        const newMaterialName = document.getElementById('newMaterialName');
        if (newMaterialName) newMaterialName.focus();
    };
    
    // زر المزامنة - يستخدم الدالة الجديدة للتحقق من الاتصال
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.onclick = () => {
            checkConnectionAndSync();
        };
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.onclick = () => {
        document.body.classList.contains('dark') ? setTheme('light') : setTheme('dark');
    };
    
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) backupBtn.onclick = backupData;
    
    const restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) restoreBtn.onclick = restoreData;
    
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) clearAllBtn.onclick = clearAll;
    
    const syncRetry = document.getElementById('syncRetry');
    if (syncRetry) {
        syncRetry.onclick = () => {
            checkConnectionAndSync();
        };
    }
    
    // أزرار النوافذ المنبثقة
    const closeNewModalBtn = document.getElementById('closeNewModalBtn');
    if (closeNewModalBtn) closeNewModalBtn.onclick = () => {
        const newItemModal = document.getElementById('newItemModal');
        if (newItemModal) newItemModal.classList.remove('active');
    };
    
    const saveNewItemBtn = document.getElementById('saveNewItemBtn');
    if (saveNewItemBtn) saveNewItemBtn.onclick = addNewMaterialDirect;
    
    // أزرار زيادة ونقصان الكمية
    const decrementQty = document.getElementById('decrementQty');
    const incrementQty = document.getElementById('incrementQty');
    const newQuantityValue = document.getElementById('newQuantityValue');
    
    if (decrementQty) {
        decrementQty.addEventListener('click', () => {
            if (newQuantityValue) {
                let val = parseFloat(newQuantityValue.value);
                if (isNaN(val)) val = 1;
                val = Math.max(0.25, val - 0.25);
                newQuantityValue.value = val;
            }
        });
    }
    
    if (incrementQty) {
        incrementQty.addEventListener('click', () => {
            if (newQuantityValue) {
                let val = parseFloat(newQuantityValue.value);
                if (isNaN(val)) val = 1;
                val = val + 0.25;
                newQuantityValue.value = val;
            }
        });
    }
    
    if (newQuantityValue) {
        newQuantityValue.addEventListener('change', () => {
            let val = parseFloat(newQuantityValue.value);
            if (isNaN(val) || val <= 0) newQuantityValue.value = 1;
        });
    }
    
    // إغلاق النوافذ عند النقر خارجها
    const modals = ['newItemModal', 'importantModal', 'spicesExtraModal', 'quickModal', 'bagsModal', 'tawsayaModal', 'editModal', 'confirmModal', 'itemModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }
    });
}

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تعيين الثيم
    if (localStorage.getItem('theme') === 'dark') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    
    // إعداد PWA
    setupPWA();
    
    // ربط الأحداث
    bindEvents();
    
    // بدء الاستماع للتغييرات
    startListener();
    startAutoSync();
    
    // إخفاء شاشة البداية بعد 3 ثوان كحد أقصى
    setTimeout(() => {
        forceHideSplash();
    }, 3000);
});

// تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker تم تسجيله بنجاح:', registration.scope);
            })
            .catch(error => {
                console.error('فشل تسجيل Service Worker:', error);
            });
    });
}
