// ==================== ربط الأحداث ====================

function bindEvents() {
    console.log("🔗 Binding events...");
    
    // زر إضافة مادة جديدة
    const mainAddBtn = document.getElementById('mainAddBtn');
    if (mainAddBtn) {
        mainAddBtn.onclick = function() {
            console.log("Main add button clicked");
            document.getElementById('newItemModal').classList.add('active');
        };
    }
    
    // زر المزامنة - إعادة تحميل البيانات من Firebase
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.onclick = function() {
            console.log("Sync button clicked - Reloading data from Firebase");
            showToast("🔄 جاري المزامنة مع السحابة...");
            
            // إلغاء الاشتراك الحالي وإعادة البدء
            if (typeof unsubscribe === 'function' && unsubscribe) {
                unsubscribe();
            }
            if (typeof startListener === 'function') {
                startListener();
            } else {
                console.error("startListener is not defined");
                showToast("❌ خطأ في المزامنة", true);
            }
        };
    }
    
    // زر الوضع الليلي
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = function() {
            console.log("Theme toggle clicked");
            document.body.classList.toggle('dark');
            // حفظ التفضيل
            const isDark = document.body.classList.contains('dark');
            localStorage.setItem('darkMode', isDark);
        };
        
        // استعادة التفضيل
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark');
        }
    }
    
    // زر النسخ الاحتياطي
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.onclick = function() {
            console.log("Backup button clicked");
            if (typeof backupData === 'function') {
                backupData();
            } else {
                console.error("backupData is not defined");
                showToast("❌ خطأ في النسخ الاحتياطي", true);
            }
        };
    }
    
    // زر الاستعادة
    const restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) {
        restoreBtn.onclick = function() {
            console.log("Restore button clicked");
            if (typeof restoreData === 'function') {
                restoreData();
            } else {
                console.error("restoreData is not defined");
                showToast("❌ خطأ في الاستعادة", true);
            }
        };
    }
    
    // زر مسح الكل
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.onclick = function() {
            console.log("Clear all button clicked");
            if (typeof clearAllMaterials === 'function') {
                clearAllMaterials();
            } else {
                console.error("clearAllMaterials is not defined");
                showToast("❌ خطأ في مسح البيانات", true);
            }
        };
    }
    
    // زر إضافة مادة من المودال
    const saveNewItemBtn = document.getElementById('saveNewItemBtn');
    if (saveNewItemBtn) {
        saveNewItemBtn.onclick = function() {
            console.log("Save new item button clicked");
            if (typeof addNewMaterial === 'function') {
                addNewMaterial();
            } else {
                console.error("addNewMaterial is not defined");
                showToast("❌ خطأ في إضافة المادة", true);
            }
        };
    }
    
    // زر حفظ التعديل
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.onclick = function() {
            console.log("Save edit button clicked");
            if (typeof saveEdit === 'function') {
                saveEdit();
            } else {
                console.error("saveEdit is not defined");
                showToast("❌ خطأ في تحديث الكمية", true);
            }
        };
    }
    
    // زر حفظ القوائم الجاهزة
    const savePresetBtn = document.getElementById('savePresetBtn');
    if (savePresetBtn) {
        savePresetBtn.onclick = function() {
            console.log("Save preset button clicked");
            if (typeof addSelectedPresetItems === 'function') {
                addSelectedPresetItems();
            } else {
                console.error("addSelectedPresetItems is not defined");
                showToast("❌ خطأ في إضافة القوائم الجاهزة", true);
            }
        };
    }
    
    // زر تأكيد النقل
    const confirmMoveBtn = document.getElementById('confirmMoveBtn');
    if (confirmMoveBtn) {
        confirmMoveBtn.onclick = function() {
            console.log("Confirm move button clicked");
            if (typeof executeMove === 'function') {
                executeMove();
            } else {
                console.error("executeMove is not defined");
                showToast("❌ خطأ في نقل المادة", true);
            }
        };
    }
    
    // كروت الأقسام
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(function(card) {
        card.onclick = function(e) {
            e.stopPropagation();
            const category = this.getAttribute('data-category');
            console.log("Category card clicked:", category);
            
            if (category === 'tawsaya') {
                const modal = document.getElementById('newItemModal');
                const sectionSelect = document.getElementById('newMaterialSection');
                if (sectionSelect) sectionSelect.value = 'tawsaya';
                if (modal) modal.classList.add('active');
            } else {
                if (typeof openPresetModal === 'function') {
                    openPresetModal(category);
                } else {
                    console.error("openPresetModal is not defined");
                    showToast("❌ خطأ في فتح القائمة", true);
                }
            }
        };
    });
    
    // البحث في القوائم الجاهزة
    const presetSearch = document.getElementById('presetSearchInput');
    if (presetSearch) {
        presetSearch.oninput = function(e) {
            if (typeof renderPresetList === 'function') {
                renderPresetList(window.currentPresetCategory || 'main', e.target.value);
            }
        };
    }
    
    // إغلاق المودالات
    const closeButtons = [
        'closeNewModalBtn', 'closeNewModalBtn2',
        'closePresetModalBtn', 'closePresetModalBtn2',
        'closeEditModalBtn', 'closeEditModalBtn2',
        'cancelMoveBtn', 'cancelMoveBtn2',
        'closeSystemMessageBtn'
    ];
    
    closeButtons.forEach(function(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.onclick = function() {
                const modals = ['newItemModal', 'presetModal', 'editModal', 'moveItemModal', 'systemMessageModal'];
                modals.forEach(function(id) {
                    const el = document.getElementById(id);
                    if (el) el.classList.remove('active');
                });
            };
        }
    });
    
    // أزرار +/- في نافذة الإضافة
    const dec = document.getElementById('newQtyDec');
    const inc = document.getElementById('newQtyInc');
    const qty = document.getElementById('newQuantityValue');
    if (dec && inc && qty) {
        dec.onclick = function() {
            let v = parseFloat(qty.value) || 1;
            v = Math.max(0.25, v - 0.25);
            qty.value = v;
        };
        inc.onclick = function() {
            let v = parseFloat(qty.value) || 1;
            v = v + 0.25;
            qty.value = v;
        };
    }
    
    // تغيير الوحدة في نافذة التعديل
    const editUnit = document.getElementById('editUnitSelect');
    if (editUnit) {
        editUnit.onchange = function() {
            const unit = this.value;
            const qtyInput = document.getElementById('editQuantityValue');
            if (unit === 'half') qtyInput.value = 0.5;
            else if (unit === 'quarter') qtyInput.value = 0.25;
            else if (unit === 'oke') qtyInput.value = 0.2;
        };
    }
    
    console.log("✅ All events bound successfully");
}

// تهيئة PWA
function initPWA() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.onclick = function() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function() {
                    deferredPrompt = null;
                    const btn = document.getElementById('installBtn');
                    if (btn) btn.style.display = 'none';
                });
            } else {
                showToast("📱 التطبيق مثبت مسبقاً", false);
            }
        };
    }
}

// تصدير الدوال
window.bindEvents = bindEvents;
window.initPWA = initPWA;
