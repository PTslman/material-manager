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
    
    // زر المزامنة
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.onclick = function() {
            console.log("Sync button clicked");
            if (typeof unsubscribe === 'function') unsubscribe();
            if (typeof startListener === 'function') startListener();
            showToast("🔄 جاري المزامنة...");
        };
    }
    
    // زر الوضع الليلي
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = function() {
            console.log("Theme toggle clicked");
            document.body.classList.toggle('dark');
        };
    }
    
    // زر النسخ الاحتياطي
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.onclick = function() {
            console.log("Backup button clicked");
            if (typeof backupData === 'function') backupData();
        };
    }
    
    // زر الاستعادة
    const restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) {
        restoreBtn.onclick = function() {
            console.log("Restore button clicked");
            if (typeof restoreData === 'function') restoreData();
        };
    }
    
    // زر مسح الكل
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.onclick = function() {
            console.log("Clear all button clicked");
            if (typeof clearAllMaterials === 'function') clearAllMaterials();
        };
    }
    
    // زر إضافة مادة من المودال
    const saveNewItemBtn = document.getElementById('saveNewItemBtn');
    if (saveNewItemBtn) {
        saveNewItemBtn.onclick = function() {
            console.log("Save new item button clicked");
            if (typeof addNewMaterial === 'function') addNewMaterial();
        };
    }
    
    // زر حفظ التعديل
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.onclick = function() {
            console.log("Save edit button clicked");
            if (typeof saveEdit === 'function') saveEdit();
        };
    }
    
    // زر حفظ القوائم الجاهزة
    const savePresetBtn = document.getElementById('savePresetBtn');
    if (savePresetBtn) {
        savePresetBtn.onclick = function() {
            console.log("Save preset button clicked");
            if (typeof addSelectedPresetItems === 'function') addSelectedPresetItems();
        };
    }
    
    // زر تأكيد النقل
    const confirmMoveBtn = document.getElementById('confirmMoveBtn');
    if (confirmMoveBtn) {
        confirmMoveBtn.onclick = function() {
            console.log("Confirm move button clicked");
            if (typeof executeMove === 'function') executeMove();
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
                // فتح نافذة إضافة توصية
                const modal = document.getElementById('newItemModal');
                const sectionSelect = document.getElementById('newMaterialSection');
                if (sectionSelect) sectionSelect.value = 'tawsaya';
                if (modal) modal.classList.add('active');
            } else {
                // فتح نافذة القوائم الجاهزة
                if (typeof openPresetModal === 'function') {
                    openPresetModal(category);
                } else {
                    console.error("openPresetModal is not defined");
                }
            }
        };
    });
    
    // البحث في القوائم الجاهزة
    const presetSearch = document.getElementById('presetSearchInput');
    if (presetSearch) {
        presetSearch.oninput = function(e) {
            if (typeof renderPresetList === 'function') {
                renderPresetList(currentPresetCategory, e.target.value);
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
                if (typeof closeAllModals === 'function') {
                    closeAllModals();
                } else {
                    const modals = ['newItemModal', 'presetModal', 'editModal', 'moveItemModal', 'systemMessageModal'];
                    modals.forEach(function(id) {
                        const el = document.getElementById(id);
                        if (el) el.classList.remove('active');
                    });
                }
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

// دالة إغلاق جميع المودالات
function closeAllModals() {
    console.log("Closing all modals");
    const modals = ['newItemModal', 'presetModal', 'editModal', 'moveItemModal', 'systemMessageModal'];
    modals.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
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
