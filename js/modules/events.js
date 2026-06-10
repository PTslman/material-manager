// ==================== ربط الأحداث ====================

function bindEvents() {
    // زر إضافة مادة جديدة
    document.getElementById('mainAddBtn').onclick = function() { 
        document.getElementById('newItemModal').classList.add('active'); 
    };
    
    // زر المزامنة
    document.getElementById('syncBtn').onclick = function() { 
        if (unsubscribe) unsubscribe(); 
        startListener(); 
        showToast('🔄 جاري المزامنة...'); 
    };
    
    // زر الوضع الليلي
    document.getElementById('themeToggle').onclick = function() { 
        document.body.classList.toggle('dark'); 
    };
    
    // زر النسخ الاحتياطي
    document.getElementById('backupBtn').onclick = function() { 
        backupData(); 
    };
    
    // زر الاستعادة
    document.getElementById('restoreBtn').onclick = function() { 
        restoreData(); 
    };
    
    // زر مسح الكل
    document.getElementById('clearAllBtn').onclick = function() { 
        clearAllMaterials(); 
    };
    
    // زر إضافة مادة من المودال
    document.getElementById('saveNewItemBtn').onclick = function() { 
        addNewMaterial(); 
    };
    
    // زر حفظ التعديل
    document.getElementById('saveEditBtn').onclick = function() { 
        saveEdit(); 
    };
    
    // زر حفظ القوائم الجاهزة
    document.getElementById('savePresetBtn').onclick = function() { 
        addSelectedPresetItems(); 
    };
    
    // زر تأكيد النقل
    document.getElementById('confirmMoveBtn').onclick = function() { 
        executeMove(); 
    };
    
    // كروت الأقسام
    var categoryCards = document.querySelectorAll('.category-card');
    for (var i = 0; i < categoryCards.length; i++) {
        categoryCards[i].onclick = function(e) {
            e.stopPropagation();
            var category = this.getAttribute('data-category');
            if (category === 'tawsaya') {
                var modal = document.getElementById('newItemModal');
                var sectionSelect = document.getElementById('newMaterialSection');
                if (sectionSelect) sectionSelect.value = 'tawsaya';
                if (modal) modal.classList.add('active');
            } else {
                openPresetModal(category);
            }
        };
    }
    
    // البحث في القوائم الجاهزة
    var presetSearch = document.getElementById('presetSearchInput');
    if (presetSearch) {
        presetSearch.oninput = function(e) { 
            renderPresetList(currentPresetCategory, e.target.value); 
        };
    }
    
    // أزرار الإغلاق
    var closeButtons = ['closeNewModalBtn', 'closeNewModalBtn2', 'closePresetModalBtn', 'closePresetModalBtn2', 
                        'closeEditModalBtn', 'closeEditModalBtn2', 'cancelMoveBtn', 'cancelMoveBtn2', 'closeSystemMessageBtn'];
    for (var i = 0; i < closeButtons.length; i++) {
        var btn = document.getElementById(closeButtons[i]);
        if (btn) {
            btn.onclick = function() { 
                closeAllModals(); 
            };
        }
    }
    
    // أزرار +/- في نافذة الإضافة
    var dec = document.getElementById('newQtyDec');
    var inc = document.getElementById('newQtyInc');
    var qty = document.getElementById('newQuantityValue');
    if (dec && inc && qty) {
        dec.onclick = function() { 
            var v = parseFloat(qty.value) || 1; 
            v = Math.max(0.25, v - 0.25); 
            qty.value = v; 
        };
        inc.onclick = function() { 
            var v = parseFloat(qty.value) || 1; 
            v = v + 0.25; 
            qty.value = v; 
        };
    }
    
    // تغيير الوحدة في نافذة التعديل
    var editUnit = document.getElementById('editUnitSelect');
    if (editUnit) {
        editUnit.onchange = function() {
            var unit = this.value;
            var qtyInput = document.getElementById('editQuantityValue');
            if (unit === 'half') qtyInput.value = 0.5;
            else if (unit === 'quarter') qtyInput.value = 0.25;
            else if (unit === 'oke') qtyInput.value = 0.2;
        };
    }
}

function initPWA() {
    var deferredPrompt;
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        var installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
    var installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.onclick = function() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function() { 
                    deferredPrompt = null; 
                    installBtn.style.display = 'none'; 
                });
            } else { 
                showToast('📱 التطبيق مثبت مسبقاً', false); 
            }
        };
    }
}

window.bindEvents = bindEvents;
window.initPWA = initPWA;
