let allMaterials = [];
let unsubscribe = null;
let currentEditId = null;
let longPressTimer = null;

function startListener() {
    const query = materialsCollection.orderBy('createdAt', 'desc');
    if (unsubscribe) unsubscribe();
    
    unsubscribe = query.onSnapshot((snapshot) => {
        allMaterials = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            allMaterials.push({
                id: doc.id, name: data.name, unitType: data.unitType || 'kg',
                quantity: data.quantity || 0, priority: data.priority || 'main'
            });
        });
        
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        const itemsCount = document.getElementById('syncItemsCount');
        const syncTime = document.getElementById('syncLastTime');
        
        if (statusText) statusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncDot) syncDot.className = 'sync-dot';
        if (itemsCount) itemsCount.innerHTML = `<i class="fas fa-database"></i> ${allMaterials.length}`;
        if (syncTime) syncTime.innerHTML = `<i class="far fa-clock"></i> ${new Date().toLocaleTimeString()}`;
        
        renderSections(allMaterials);
        updateCategoryCounts();
        calculateAIMetrics();
        
        const splash = document.getElementById('splashScreen');
        const app = document.getElementById('appContainer');
        if (splash && app && splash.style.display !== 'none') {
            splash.classList.add('hidden');
            setTimeout(() => { splash.style.display = 'none'; app.style.display = 'block'; }, 500);
        }
    }, (error) => {
        console.error(error);
        document.getElementById('syncStatusText').innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
        document.getElementById('syncDot').className = 'sync-dot offline';
    });
}

async function addNewMaterial() {
    const name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) { showToast("✏️ اكتب اسم المادة", true); return; }
    
    const section = document.getElementById('newMaterialSection')?.value;
    let unit = document.getElementById('newUnitSelect')?.value;
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    
    if (unit === 'half') quantity = 0.5;
    else if (unit === 'quarter') quantity = 0.25;
    else if (unit === 'oke') quantity = 0.2;
    else if (isNaN(quantity) || quantity < 0) quantity = 0;
    
    if (quantity === 0 && section !== 'tawsaya') {
        showToast(`⚠️ تمت إضافة "${name}" بدون كمية (مادة ناقصة)`, false);
    }
    
    try {
        await materialsCollection.add({
            name, unitType: unit, quantity: quantity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: section
        });
        showToast(`✓ تمت إضافة "${name}"`);
        document.getElementById('newItemModal').classList.remove('active');
        document.getElementById('newMaterialName').value = '';
        document.getElementById('newQuantityValue').value = '1';
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function saveEdit() {
    if (!currentEditId) return;
    let unit = document.getElementById('editUnitSelect').value;
    let qty = parseFloat(document.getElementById('editQuantityValue').value);
    if (unit === 'half') qty = 0.5;
    else if (unit === 'quarter') qty = 0.25;
    else if (unit === 'oke') qty = 0.2;
    if (isNaN(qty) || qty < 0) { showToast("🔢 كمية صحيحة", true); return; }
    
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: qty, unitType: unit });
        showToast("✓ تم تحديث الكمية");
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
    } catch(e) { showToast("❌ فشل التحديث", true); }
}

async function clearAllMaterials() {
    if (allMaterials.length === 0) { showToast("📭 لا توجد بيانات", true); return; }
    if (confirm("⚠️ حذف جميع المواد؟")) {
        const batch = db.batch();
        allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
        await batch.commit();
        showToast("✓ تم المسح");
    }
}

async function backupData() {
    if (allMaterials.length === 0) { showToast("📭 لا توجد بيانات", true); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(allMaterials, null, 2)]));
    a.download = `backup_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    showToast("💾 تم النسخ");
}

async function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const backup = JSON.parse(ev.target.result);
                if (confirm(`استبدال بـ ${backup.length} عنصر؟`)) {
                    const batch = db.batch();
                    allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
                    await batch.commit();
                    for (const it of backup) {
                        await materialsCollection.add({
                            name: it.name, unitType: it.unitType || 'kg',
                            quantity: it.quantity || 0, priority: it.priority || 'main',
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                    showToast("✓ تم الاستعادة");
                }
            } catch(e) { showToast("❌ ملف غير صالح", true); }
        };
        reader.readAsText(file);
    };
    input.click();
      }
// تصدير الدوال للاستخدام العام
window.allMaterials = allMaterials;
window.startListener = startListener;
window.addNewMaterial = addNewMaterial;
window.saveEdit = saveEdit;
window.clearAllMaterials = clearAllMaterials;
window.backupData = backupData;
window.restoreData = restoreData;
window.unsubscribe = function() { if (unsubscribe) unsubscribe(); };
