// ==================== ربط الأحداث ====================

function bindEvents() {
    var mainAddBtn = document.getElementById('mainAddBtn');
    if (mainAddBtn) {
        mainAddBtn.onclick = function() { 
            document.getElementById('newItemModal').classList.add('active'); 
        };
    }
    
    var syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.onclick = function() { 
            if (typeof startListener === 'function') startListener(); 
            if (typeof showToastMessage === 'function') showToastMessage('🔄 جاري المزامنة...');
        };
    }
    
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = function() { 
            document.body.classList.toggle('dark');
            var isDark = document.body.classList.contains('dark');
            localStorage.setItem('darkMode', isDark);
        };
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark');
        }
    }
    
    var backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.onclick = function() { 
            if (typeof backupData === 'function') backupData(); 
        };
    }
    
    var restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) {
        restoreBtn.onclick = function() { 
            if (typeof restoreData === 'function') restoreData(); 
        };
    }
    
    var clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.onclick = function() { 
            if (typeof clearAllMaterials === 'function') clearAllMaterials(); 
        };
    }
    
    var saveNewItemBtn = document.getElementById('saveNewItemBtn');
    if (saveNewItemBtn) {
        saveNewItemBtn.onclick = function() { 
            if (typeof addNewMaterial === 'function') addNewMaterial(); 
        };
    }
    
    var saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.onclick = function() { 
            if (typeof saveEdit === 'function') saveEdit(); 
        };
    }
    
    var savePresetBtn = document.getElementById('savePresetBtn');
    if (savePresetBtn) {
        savePresetBtn.onclick = function() { 
            if (typeof addSelectedPresetItems === 'function') addSelectedPresetItems(); 
        };
    }
    
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
                if (typeof openPresetModal === 'function') openPresetModal(category);
            }
        };
    }
    
    var presetSearch = document.getElementById('presetSearchInput');
    if (presetSearch) {
        presetSearch.oninput = function(e) { 
            if (typeof renderPresetList === 'function') {
                renderPresetList(window.currentPresetCategory || 'main', e.target.value);
            }
        };
    }
    
    var closeButtons = ['closeNewModalBtn', 'closeNewModalBtn2', 'closePresetModalBtn', 'closePresetModalBtn2', 
                        'closeEditModalBtn', 'closeEditModalBtn2', 'cancelMoveBtn', 'cancelMoveBtn2', 'closeSystemMessageBtn'];
    for (var i = 0; i < closeButtons.length; i++) {
        var btn = document.getElementById(closeButtons[i]);
        if (btn) {
            btn.onclick = function() { 
                if (typeof closeAllModals === 'function') {
                    closeAllModals();
                } else {
                    var modals = ['newItemModal', 'presetModal', 'editModal', 'moveItemModal', 'systemMessageModal'];
                    for (var j = 0; j < modals.length; j++) {
                        var el = document.getElementById(modals[j]);
                        if (el) el.classList.remove('active');
                    }
                }
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
                    if (installBtn) installBtn.style.display = 'none';
                });
            } else { 
                if (typeof showToastMessage === 'function') showToastMessage('📱 التطبيق مثبت مسبقاً', false);
            }
        };
    }
}

window.bindEvents = bindEvents;
window.initPWA = initPWA;
