function bindEvents() {
    document.getElementById('mainAddBtn').onclick = () => document.getElementById('newItemModal').classList.add('active');
    document.getElementById('syncBtn').onclick = () => { if (unsubscribe) unsubscribe(); startListener(); showToast("🔄 جاري المزامنة..."); };
    document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark');
    document.getElementById('backupBtn').onclick = backupData;
    document.getElementById('restoreBtn').onclick = restoreData;
    document.getElementById('clearAllBtn').onclick = clearAllMaterials;
    document.getElementById('saveNewItemBtn').onclick = addNewMaterial;
    document.getElementById('saveEditBtn').onclick = saveEdit;
    document.getElementById('savePresetBtn').onclick = addSelectedPresetItems;
    document.getElementById('confirmMoveBtn').onclick = executeMove;
    document.getElementById('cancelMoveBtn').onclick = closeMoveModal;
    
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            if (category === 'tawsaya') {
                document.getElementById('newMaterialSection').value = 'tawsaya';
                document.getElementById('newItemModal').classList.add('active');
            } else {
                openPresetModal(category);
            }
        });
    });
    
    document.querySelectorAll('.edit-material').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const material = allMaterials.find(m => m.id === id);
            if (material) {
                currentEditId = id;
                document.getElementById('editMaterialName').value = material.name;
                document.getElementById('editQuantityValue').value = material.quantity;
                document.getElementById('editUnitSelect').value = material.unitType || 'kg';
                document.getElementById('editModal').classList.add('active');
            }
        });
    });
    
    document.querySelectorAll('.delete-material').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const material = allMaterials.find(m => m.id === id);
            if (confirm(`⚠️ حذف "${material?.name}"؟`)) {
                materialsCollection.doc(id).delete().then(() => showToast("✅ تم الحذف")).catch(e => showToast("❌ فشل الحذف", true));
            }
        });
    });
    
    document.querySelectorAll('.material-card').forEach(card => { setupLongPress(card); });
    
    const presetSearch = document.getElementById('presetSearchInput');
    if (presetSearch) {
        presetSearch.oninput = (e) => renderPresetList(currentPresetCategory, e.target.value);
    }
    
    const closeButtons = ['closeNewModalBtn', 'closePresetModalBtn', 'closeEditModalBtn', 'closeSystemMessageBtn'];
    closeButtons.forEach(id => { const btn = document.getElementById(id); if (btn) btn.addEventListener('click', closeAllModals); });
    
    const editUnit = document.getElementById('editUnitSelect');
    if (editUnit) {
        editUnit.addEventListener('change', function() {
            const unit = this.value;
            const qtyInput = document.getElementById('editQuantityValue');
            if (unit === 'half') qtyInput.value = 0.5;
            else if (unit === 'quarter') qtyInput.value = 0.25;
            else if (unit === 'oke') qtyInput.value = 0.2;
        });
    }
    
    const dec = document.getElementById('newQtyDec');
    const inc = document.getElementById('newQtyInc');
    const qty = document.getElementById('newQuantityValue');
    if (dec && inc && qty) {
        dec.onclick = () => { let v = parseFloat(qty.value) || 1; v = Math.max(0.25, v - 0.25); qty.value = v; };
        inc.onclick = () => { let v = parseFloat(qty.value) || 1; v = v + 0.25; qty.value = v; };
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
    document.getElementById('installBtn')?.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => { deferredPrompt = null; document.getElementById('installBtn').style.display = 'none'; });
        } else { showToast("📱 التطبيق مثبت مسبقاً", false); }
    });
}
