// ==================== ربط الأحداث ====================

function bindEvents() {
    document.getElementById('mainAddBtn').onclick = function() { 
        document.getElementById('newItemModal').classList.add('active'); 
    };
    
    document.getElementById('syncBtn').onclick = function() { 
        if (unsubscribe) unsubscribe(); 
        startListener(); 
        showToast('🔄 جاري المزامنة...'); 
    };
    
    document.getElementById('themeToggle').onclick = function() { 
        document.body.classList.toggle('dark'); 
    };
    
    document.getElementById('backupBtn').onclick = function() { 
        backupData(); 
    };
    
    document.getElementById('restoreBtn').onclick = function() { 
        restoreData(); 
    };
    
    document.getElementById('clearAllBtn').onclick = function() { 
        clearAllMaterials(); 
    };
    
    document.getElementById('saveNewItemBtn').onclick = function() { 
        addNewMaterial(); 
    };
    
    document.getElementById('saveEditBtn').onclick = function() { 
        saveEdit(); 
    };
    
    document.getElementById('savePresetBtn').onclick = function() { 
        addSelectedPresetItems(); 
    };
    
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
    
    var presetSearch = document.getElementById('presetSearchInput');
    if (presetSearch) {
        presetSearch.oninput = function(e) { 
            renderPresetList(currentPresetCategory, e.target.value); 
        };
    }
    
    var closeButtons = ['closeNewModalBtn', 'closeNewModalBtn2', 'closePresetModalBtn', 'closePresetModalBtn2', 
                        'closeEditModalBtn', 'closeEditModalBtn2', 'closeSystemMessageBtn'];
    for (var i = 0; i < closeButtons.length; i++) {
        var btn = document.getElementById(closeButtons[i]);
        if (btn) {
            btn.onclick = function() { 
                closeAllModals(); 
            };
        }
    }
    
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

function closeAllModals() {
    var modals = ['newItemModal', 'presetModal', 'editModal', 'systemMessageModal'];
    for (var i = 0; i < modals.length; i++) {
        var el = document.getElementById(modals[i]);
        if (el) el.classList.remove('active');
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
window.closeAllModals = closeAllModals;
