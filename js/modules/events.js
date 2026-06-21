// ==================== ربط الأحداث المتقدمة ====================

function bindEvents() {
    const events = [
        { id: 'mainAddBtn', handler: () => document.getElementById('newItemModal').classList.add('active') },
        { id: 'syncBtn', handler: () => { 
            if (typeof refreshData === 'function') refreshData();
            else if (typeof startListener === 'function') startListener();
            showToastMessage('🔄 جاري المزامنة...');
        }},
        { id: 'themeToggle', handler: () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('darkMode', document.body.classList.contains('dark'));
        }},
        { id: 'backupBtn', handler: () => { if (typeof backupData === 'function') backupData(); }},
        { id: 'restoreBtn', handler: () => { if (typeof restoreData === 'function') restoreData(); }},
        { id: 'clearAllBtn', handler: () => { if (typeof clearAllMaterials === 'function') clearAllMaterials(); }},
        { id: 'priceManagerBtn', handler: (e) => { e.preventDefault(); if (typeof openPriceModal === 'function') openPriceModal(); }},
        { id: 'saveNewItemBtn', handler: () => { if (typeof addNewMaterial === 'function') addNewMaterial(); }},
        { id: 'saveEditBtn', handler: () => { if (typeof saveEdit === 'function') saveEdit(); }},
        { id: 'savePresetBtn', handler: () => { if (typeof addSelectedPresetItems === 'function') addSelectedPresetItems(); }},
        { id: 'confirmMoveBtn', handler: () => { if (typeof executeMove === 'function') executeMove(); }}
    ];
    
    for (const { id, handler } of events) {
        const el = document.getElementById(id);
        if (el) el.onclick = handler;
    }
    
    // كروت الأقسام
    document.querySelectorAll('.category-card').forEach(card => {
        card.onclick = function(e) {
            e.stopPropagation();
            const category = this.dataset.category;
            if (category === 'tawsaya') {
                document.getElementById('newMaterialSection').value = 'tawsaya';
                document.getElementById('newItemModal').classList.add('active');
            } else if (typeof openPresetModal === 'function') {
                openPresetModal(category);
            }
        };
    });
    
    // البحث في القوائم الجاهزة
    const presetSearch = document.getElementById('presetSearchInput');
    if (presetSearch) {
        presetSearch.oninput = (e) => {
            if (typeof renderPresetList === 'function') {
                renderPresetList(window.currentPresetCategory || 'main', e.target.value);
            }
        };
    }
    
    // أزرار الإغلاق
    const closeButtons = [
        'closeNewModalBtn', 'closeNewModalBtn2',
        'closePresetModalBtn', 'closePresetModalBtn2',
        'closeEditModalBtn', 'closeEditModalBtn2',
        'cancelMoveBtn', 'cancelMoveBtn2',
        'closeSystemMessageBtn',
        'closePriceModalBtn', 'closePriceModalBtn2'
    ];
    
    for (const id of closeButtons) {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = () => { if (typeof closeAllModals === 'function') closeAllModals(); };
    }
    
    // أزرار +/- في نافذة الإضافة
    const dec = document.getElementById('newQtyDec');
    const inc = document.getElementById('newQtyInc');
    const qty = document.getElementById('newQuantityValue');
    if (dec && inc && qty) {
        dec.onclick = () => { qty.value = Math.max(0.25, (parseFloat(qty.value) || 1) - 0.25); };
        inc.onclick = () => { qty.value = (parseFloat(qty.value) || 1) + 0.25; };
    }
    
    // تغيير الوحدة في نافذة التعديل
    const editUnit = document.getElementById('editUnitSelect');
    if (editUnit) {
        editUnit.onchange = function() {
            const qtyInput = document.getElementById('editQuantityValue');
            const unit = this.value;
            if (unit === 'half') qtyInput.value = 0.5;
            else if (unit === 'quarter') qtyInput.value = 0.25;
            else if (unit === 'oke') qtyInput.value = 0.2;
        };
    }
    
    // أزرار نوع التوصية
    document.querySelectorAll('#tawsayaTypeGroup .unit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#tawsayaTypeGroup .unit-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const customGroup = document.getElementById('tawsayaCustomQtyGroup');
            if (customGroup) {
                customGroup.style.display = this.dataset.type === 'custom' ? 'block' : 'none';
            }
        });
    });
    
    // أزرار الأوزان المخصصة
    document.querySelectorAll('.weight-preset').forEach(btn => {
        btn.addEventListener('click', function() {
            const qtyInput = document.getElementById('tawsayaCustomQty');
            if (qtyInput) qtyInput.value = this.dataset.value;
        });
    });
    
    // استعادة الوضع الليلي
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }
}

function closeAllModals() {
    const modals = ['newItemModal', 'presetModal', 'editModal', 'moveItemModal', 'systemMessageModal', 'priceModal'];
    for (const id of modals) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    }
}

function initPWA() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.onclick = () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                    deferredPrompt = null;
                    installBtn.style.display = 'none';
                });
            } else {
                showToastMessage('📱 التطبيق مثبت مسبقاً', false);
            }
        };
    }
}

function showSystemMessage(title, message, type = 'info') {
    const modal = document.getElementById('systemMessageModal');
    document.getElementById('systemMessageTitle').innerText = title;
    document.getElementById('systemMessageText').innerText = message;
    const icon = modal?.querySelector('.modal-icon i');
    if (icon) {
        icon.style.color = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981';
    }
    if (modal) modal.classList.add('active');
}

window.bindEvents = bindEvents;
window.closeAllModals = closeAllModals;
window.initPWA = initPWA;
window.showSystemMessage = showSystemMessage;
