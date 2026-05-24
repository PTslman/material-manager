// app.js - الملف الرئيسي للتطبيق مع ربط جميع الأزرار

// ==================== المتغيرات العامة ====================
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

// ==================== دوال التهيئة ====================
function forceHideSplash() {
    if (splashHidden) return;
    splashHidden = true;
    const splashEl = document.getElementById('splashScreen');
    const appContainer = document.getElementById('appContainer');
    if (splashEl) {
        splashEl.classList.add('hidden');
        setTimeout(() => { splashEl.style.display = 'none'; if (appContainer) appContainer.style.display = 'block'; }, 350);
    } else { if (appContainer) appContainer.style.display = 'block'; }
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
    }
    
    if (itemCount !== null && syncItemsCount) syncItemsCount.innerHTML = `<i class="fas fa-database"></i> ${itemCount} عنصر`;
    if (lastSyncDate && syncLastTime) {
        let d = new Date(lastSyncDate);
        syncLastTime.innerHTML = `<i class="far fa-clock"></i> ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
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
        
        if (window.renderAllMaterials) window.renderAllMaterials(allMaterials);
        if (firstSnapshot) { firstSnapshot = false; forceHideSplash(); }
        reconnectAttempts = 0;
    }, (error) => {
        console.error("Firestore error:", error);
        updateSyncUI('offline');
        forceHideSplash();
        if (reconnectAttempts < 3) {
            reconnectAttempts++;
            setTimeout(() => { if (unsubscribe) { unsubscribe(); startListener(); } }, 3000);
        }
    });
}

function startAutoSync() {
    if (autoSyncTimer) clearInterval(autoSyncTimer);
    autoSyncTimer = setInterval(() => { if (unsubscribe) { unsubscribe(); startListener(); } }, 15 * 60 * 1000);
}

// ==================== العمليات الأساسية ====================
async function addNewMaterialDirect() {
    let name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) { showToast("✏️ اكتب اسم المادة", true); return; }
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    if (isNaN(quantity) || quantity <= 0) { showToast("🔢 كمية صحيحة", true); return; }
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
        document.getElementById('newItemModal')?.classList.remove('active');
    } catch (e) { showToast("❌ خطأ في الاتصال", true); }
}

async function clearAll() {
    if (allMaterials.length === 0) { showToast("📭 القائمة فارغة", true); return; }
    if (!confirm("⚠️ حذف جميع المواد نهائياً؟")) return;
    try {
        let batch = db.batch();
        allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
        await batch.commit();
        showToast("✓ تم مسح القائمة");
    } catch (e) { showToast("❌ فشل المسح", true); }
}

function backupData() {
    if (allMaterials.length === 0) { showToast("📭 لا توجد بيانات للنسخ", true); return; }
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
                                unitType: it.unitType || 'kg',
                                quantity: it.quantity || 1,
                                notes: it.notes || "",
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                priority: it.priority || "main"
                            });
                        }
                        showToast(`✓ تم استعادة ${backup.length} عنصر`);
                    }
                } catch (err) { showToast("❌ ملف غير صالح", true); }
            };
            reader.readAsText(file);
        };
    }
    fileInput.click();
}

// ==================== PWA والتثبيت ====================
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
            } else { showToast('يمكنك التثبيت من قائمة المتصفح', false); }
        });
    }
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
        if (installBtn) installBtn.style.display = 'none';
    }
}

// ==================== ربط جميع الأزرار ====================
function bindEvents() {
    // زر إضافة مادة رئيسي
    const mainAddBtn = document.getElementById('mainAddBtn');
    if (mainAddBtn) {
        mainAddBtn.onclick = () => {
            document.getElementById('newItemModal')?.classList.add('active');
            document.getElementById('newMaterialName')?.focus();
        };
    }
    
    // زر المزامنة
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.onclick = () => { 
            if (unsubscribe) unsubscribe(); 
            startListener(); 
            showToast("🔄 مزامنة يدوية"); 
        };
    }
    
    // زر تغيير الثيم
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            document.body.classList.contains('dark') ? setTheme('light') : setTheme('dark');
        };
    }
    
    // زر النسخ الاحتياطي
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) backupBtn.onclick = backupData;
    
    // زر الاستعادة
    const restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) restoreBtn.onclick = restoreData;
    
    // زر مسح الكل
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) clearAllBtn.onclick = clearAll;
    
    // زر إعادة محاولة المزامنة
    const syncRetry = document.getElementById('syncRetry');
    if (syncRetry) {
        syncRetry.onclick = () => { 
            if (unsubscribe) unsubscribe(); 
            startListener(); 
            showToast("🔄 محاولة إعادة الاتصال..."); 
        };
    }
    
    // زر تحديث البيانات من localStorage
    const refreshDataBtn = document.getElementById('refreshDataBtn');
    if (refreshDataBtn) {
        refreshDataBtn.onclick = function() {
            if (window.refreshConstantsData) {
                window.refreshConstantsData();
                showToast('✓ تم تحديث البيانات بنجاح');
            } else {
                showToast('❌ خطأ في تحديث البيانات', true);
            }
        };
    }
    
    // ========== أزرار الجداول الأربعة ==========
    
    // 1. بهارات هامة
    const importantBtn = document.getElementById('importantProductsBtn');
    if (importantBtn) {
        importantBtn.onclick = () => {
            console.log('🔘 Important button clicked');
            if (window.renderImportantFiltered) {
                window.renderImportantFiltered('');
            } else {
                console.error('renderImportantFiltered not found');
            }
            const modal = document.getElementById('importantModal');
            if (modal) modal.classList.add('active');
            const searchInput = document.getElementById('importantSearchInput');
            if (searchInput) searchInput.focus();
        };
    }
    
    // 2. بهارات اضافية
    const spicesExtraBtn = document.getElementById('spicesExtraBtn');
    if (spicesExtraBtn) {
        spicesExtraBtn.onclick = () => {
            console.log('🔘 Spices extra button clicked');
            if (window.renderSpicesExtraFiltered) {
                window.renderSpicesExtraFiltered('');
            } else {
                console.error('renderSpicesExtraFiltered not found');
            }
            const modal = document.getElementById('spicesExtraModal');
            if (modal) modal.classList.add('active');
            const searchInput = document.getElementById('spicesExtraSearchInput');
            if (searchInput) searchInput.focus();
        };
    }
    
    // 3. بذوريات واعشاب
    const quickBtn = document.getElementById('quickProductsBtn');
    if (quickBtn) {
        quickBtn.onclick = () => {
            console.log('🔘 Quick products button clicked');
            if (window.renderQuickFiltered) {
                window.renderQuickFiltered('');
            } else {
                console.error('renderQuickFiltered not found');
            }
            const modal = document.getElementById('quickModal');
            if (modal) modal.classList.add('active');
            const searchInput = document.getElementById('quickSearchInput');
            if (searchInput) searchInput.focus();
        };
    }
    
    // 4. أكياس
    const bagsBtn = document.getElementById('bagsManagerBtn');
    if (bagsBtn) {
        bagsBtn.onclick = () => {
            console.log('🔘 Bags button clicked');
            if (window.renderBags) {
                window.renderBags();
            } else {
                console.error('renderBags not found');
            }
            const modal = document.getElementById('bagsModal');
            if (modal) modal.classList.add('active');
        };
    }
    
    // 5. توصاية
    const tawsayaBtn = document.getElementById('tawsayaQuickBtn');
    if (tawsayaBtn) {
        tawsayaBtn.onclick = () => {
            console.log('🔘 Tawsaya button clicked');
            const modal = document.getElementById('tawsayaModal');
            if (modal) modal.classList.add('active');
            const nameInput = document.getElementById('tawsayaName');
            if (nameInput) nameInput.focus();
        };
    }
    
    // ========== أزرار النوافذ المنبثقة ==========
    
    // نافذة إضافة مادة جديدة
    const closeNewModalBtn = document.getElementById('closeNewModalBtn');
    if (closeNewModalBtn) {
        closeNewModalBtn.onclick = () => { 
            document.getElementById('newItemModal')?.classList.remove('active'); 
        };
    }
    
    const saveNewItemBtn = document.getElementById('saveNewItemBtn');
    if (saveNewItemBtn) saveNewItemBtn.onclick = addNewMaterialDirect;
    
    // نافذة إضافة مادة قديمة
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.onclick = () => { 
            document.getElementById('itemModal')?.classList.remove('active'); 
        };
    }
    
    const saveMaterialBtn = document.getElementById('saveMaterialBtn');
    if (saveMaterialBtn) {
        saveMaterialBtn.onclick = async () => {
            let name = document.getElementById('materialName')?.value.trim();
            if (!name) { showToast("✏️ اكتب اسم المادة", true); return; }
            if (!isConnected) { showToast("❌ لا يوجد اتصال بالإنترنت", true); return; }
            try {
                await materialsCollection.add({
                    name: name,
                    unitType: currentUnit,
                    quantity: parseFloat(document.getElementById('quantityValue')?.value) || 1,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    priority: "main"
                });
                showToast(`✓ تمت إضافة "${name}"`);
                document.getElementById('materialName').value = "";
                document.getElementById('itemModal')?.classList.remove('active');
            } catch (e) { showToast("❌ فشل الإضافة", true); }
        };
    }
    
    // نافذة بهارات هامة
    const closeImportantModalBtn = document.getElementById('closeImportantModalBtn');
    if (closeImportantModalBtn) {
        closeImportantModalBtn.onclick = () => { 
            document.getElementById('importantModal')?.classList.remove('active'); 
        };
    }
    
    const saveImportantBtn = document.getElementById('saveImportantBtn');
    if (saveImportantBtn && window.addSelectedImportant) {
        saveImportantBtn.onclick = window.addSelectedImportant;
    }
    
    const importantSearch = document.getElementById('importantSearchInput');
    if (importantSearch) {
        importantSearch.oninput = (e) => {
            if (window.renderImportantFiltered) {
                window.renderImportantFiltered(e.target.value.trim());
            }
        };
    }
    
    // نافذة بهارات اضافية
    const closeSpicesExtraModalBtn = document.getElementById('closeSpicesExtraModalBtn');
    if (closeSpicesExtraModalBtn) {
        closeSpicesExtraModalBtn.onclick = () => { 
            document.getElementById('spicesExtraModal')?.classList.remove('active'); 
        };
    }
    
    const saveSpicesExtraBtn = document.getElementById('saveSpicesExtraBtn');
    if (saveSpicesExtraBtn && window.addSelectedSpicesExtra) {
        saveSpicesExtraBtn.onclick = window.addSelectedSpicesExtra;
    }
    
    const spicesExtraSearch = document.getElementById('spicesExtraSearchInput');
    if (spicesExtraSearch) {
        spicesExtraSearch.oninput = (e) => {
            if (window.renderSpicesExtraFiltered) {
                window.renderSpicesExtraFiltered(e.target.value.trim());
            }
        };
    }
    
    // نافذة بذوريات
    const closeQuickModalBtn = document.getElementById('closeQuickModalBtn');
    if (closeQuickModalBtn) {
        closeQuickModalBtn.onclick = () => { 
            document.getElementById('quickModal')?.classList.remove('active'); 
        };
    }
    
    const saveQuickBtn = document.getElementById('saveQuickBtn');
    if (saveQuickBtn && window.addSelectedQuick) {
        saveQuickBtn.onclick = window.addSelectedQuick;
    }
    
    const quickSearch = document.getElementById('quickSearchInput');
    if (quickSearch) {
        quickSearch.oninput = (e) => {
            if (window.renderQuickFiltered) {
                window.renderQuickFiltered(e.target.value.trim());
            }
        };
    }
    
    // نافذة أكياس
    const closeBagsModalBtn = document.getElementById('closeBagsModalBtn');
    if (closeBagsModalBtn) {
        closeBagsModalBtn.onclick = () => { 
            document.getElementById('bagsModal')?.classList.remove('active'); 
        };
    }
    
    const saveBagsBtn = document.getElementById('saveBagsBtn');
    if (saveBagsBtn && window.addSelectedBags) {
        saveBagsBtn.onclick = window.addSelectedBags;
    }
    
    // نافذة توصاية
    const closeTawsayaModalBtn = document.getElementById('closeTawsayaModalBtn');
    if (closeTawsayaModalBtn) {
        closeTawsayaModalBtn.onclick = () => { 
            document.getElementById('tawsayaModal')?.classList.remove('active'); 
        };
    }
    
    const saveTawsayaBtn = document.getElementById('saveTawsayaBtn');
    if (saveTawsayaBtn && window.addTawsaya) {
        saveTawsayaBtn.onclick = window.addTawsaya;
    }
    
    // نافذة تعديل
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    if (closeEditModalBtn) {
        closeEditModalBtn.onclick = () => { 
            document.getElementById('editModal')?.classList.remove('active'); 
        };
    }
    
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn && window.saveEdit) {
        saveEditBtn.onclick = window.saveEdit;
    }
    
    // ========== أزرار الكمية ==========
    const decrementQty = document.getElementById('decrementQty');
    const incrementQty = document.getElementById('incrementQty');
    const newQuantityValue = document.getElementById('newQuantityValue');
    
    if (decrementQty) {
        decrementQty.addEventListener('click', () => {
            if (newQuantityValue) {
                let val = parseFloat(newQuantityValue.value) || 1;
                val = Math.max(0.25, val - 0.25);
                newQuantityValue.value = val;
            }
        });
    }
    
    if (incrementQty) {
        incrementQty.addEventListener('click', () => {
            if (newQuantityValue) {
                let val = parseFloat(newQuantityValue.value) || 1;
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
    
    // ========== وحدات القياس ==========
    const unitButtons = document.querySelectorAll('#itemModal .unit-btn');
    unitButtons.forEach(btn => {
        btn.onclick = () => {
            unitButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentUnit = btn.getAttribute('data-unit');
            const needsQuantity = currentUnit === 'kg';
            const quantityField = document.getElementById('quantityFieldContainer');
            if (quantityField) quantityField.style.display = needsQuantity ? 'block' : 'none';
        };
    });
    
    // ========== إغلاق النوافذ عند النقر خارجها ==========
    const modalIds = [
        'newItemModal', 'importantModal', 'spicesExtraModal', 'quickModal', 
        'bagsModal', 'tawsayaModal', 'editModal', 'confirmDeleteModal', 'itemModal'
    ];
    modalIds.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => { 
                if (e.target === modal) modal.classList.remove('active'); 
            });
        }
    });
    
    // ========== اختيار نوع التوصاية ==========
    const tawsayaTypeBtns = document.querySelectorAll('#tawsayaTypeGroup .unit-btn');
    const tawsayaCustomGroup = document.getElementById('tawsayaCustomQtyGroup');
    if (tawsayaTypeBtns.length && tawsayaCustomGroup) {
        tawsayaTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                tawsayaTypeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                tawsayaCustomGroup.style.display = this.getAttribute('data-type') === 'custom' ? 'block' : 'none';
            });
        });
    }
    
    console.log('✅ All events bound successfully');
}

// ==================== التهيئة ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App initializing...');
    
    // تعيين الثيم
    if (localStorage.getItem('theme') === 'dark') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    
    // تعيين الوحدة الافتراضية
    const defaultUnit = document.querySelector('#itemModal .unit-btn[data-unit="kg"]');
    if (defaultUnit) { 
        defaultUnit.classList.add('active'); 
        currentUnit = "kg"; 
    }
    
    // إعداد PWA
    setupPWA();
    
    // ربط جميع الأحداث
    bindEvents();
    
    // بدء المزامنة
    startListener();
    startAutoSync();
    
    // إخفاء شاشة البداية
    setTimeout(() => forceHideSplash(), 3000);
});

// تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/material-manager/service-worker.js')
            .then(reg => console.log('✅ Service Worker registered:', reg.scope))
            .catch(err => console.error('❌ Service Worker failed:', err));
    });
}

console.log('✅ app.js loaded successfully');
