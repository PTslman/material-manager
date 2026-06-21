// ==================== إدارة المواد والمزامنة ====================

let allMaterials = [];
let unsubscribe = null;
let currentEditId = null;

function startListener() {
    if (!materialsCollection) {
        setTimeout(startListener, 1000);
        return;
    }
    
    const query = materialsCollection.orderBy('createdAt', 'desc');
    
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
    
    unsubscribe = query.onSnapshot((snapshot) => {
        const newMaterials = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            let priority = data.priority || 'main';
            
            if (priority === 'spices_extra' || priority === 'roasted' || priority === 'herbs') {
                priority = 'extra';
            }
            
            newMaterials.push({
                id: doc.id,
                name: data.name || 'غير معروف',
                unitType: data.unitType || 'kg',
                quantity: data.quantity || 0,
                priority: priority
            });
        });
        
        allMaterials = newMaterials;
        
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        const itemsCount = document.getElementById('syncItemsCount');
        const syncTime = document.getElementById('syncLastTime');
        
        if (statusText) statusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncDot) syncDot.className = 'sync-dot';
        if (itemsCount) itemsCount.innerHTML = `<i class="fas fa-database"></i> ${allMaterials.length}`;
        if (syncTime) syncTime.innerHTML = `<i class="far fa-clock"></i> ${new Date().toLocaleTimeString()}`;
        
        if (typeof renderSections === 'function') renderSections(allMaterials);
        if (typeof updateCategoryCounts === 'function') updateCategoryCounts();
        if (typeof calculateAIMetrics === 'function') calculateAIMetrics();
        
        setTimeout(() => {
            if (typeof initDragAndDrop === 'function') initDragAndDrop();
        }, 200);
        
        const splash = document.getElementById('splashScreen');
        const app = document.getElementById('appContainer');
        if (splash && app && splash.style.display !== 'none') {
            splash.classList.add('hidden');
            setTimeout(() => {
                splash.style.display = 'none';
                app.style.display = 'block';
            }, 500);
        }
    }, (error) => {
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        if (statusText) statusText.innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
        if (syncDot) syncDot.className = 'sync-dot offline';
    });
}

function refreshData() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
    startListener();
}

async function addNewMaterial() {
    const name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) {
        showToastMessage('✏️ اكتب اسم المادة', true);
        return;
    }
    
    const section = document.getElementById('newMaterialSection')?.value || 'main';
    let unit = document.getElementById('newUnitSelect')?.value || 'kg';
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    
    if (isNaN(quantity) || quantity < 0) quantity = 0;
    if (unit === 'half') quantity = 0.5;
    else if (unit === 'quarter') quantity = 0.25;
    else if (unit === 'oke') quantity = 0.2;
    
    if (typeof window.getEstimatedPrice === 'function') {
        const estimatedPrice = window.getEstimatedPrice(name);
        if (estimatedPrice > 0 && typeof window.updateMaterialPrice === 'function') {
            const currentPrice = window.getMaterialPrice(name);
            if (currentPrice === 0) {
                window.updateMaterialPrice(name, estimatedPrice);
            }
        }
    }
    
    if (quantity === 0 && section !== 'tawsaya') {
        showToastMessage(`⚠️ تمت إضافة "${name}" بدون كمية (مادة ناقصة)`, false);
    }
    
    try {
        await materialsCollection.add({
            name,
            unitType: unit,
            quantity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: section
        });
        
        showToastMessage(`✓ تمت إضافة "${name}"`);
        
        document.getElementById('newItemModal').classList.remove('active');
        document.getElementById('newMaterialName').value = '';
        document.getElementById('newQuantityValue').value = '1';
    } catch(e) {
        showToastMessage('❌ فشل الإضافة', true);
    }
}

async function saveEdit() {
    if (!currentEditId) {
        showToastMessage('لا توجد مادة للتعديل', true);
        return;
    }
    
    const unit = document.getElementById('editUnitSelect').value;
    let qty = parseFloat(document.getElementById('editQuantityValue').value);
    
    if (unit === 'half') qty = 0.5;
    else if (unit === 'quarter') qty = 0.25;
    else if (unit === 'oke') qty = 0.2;
    
    if (isNaN(qty) || qty < 0) {
        showToastMessage('🔢 كمية صحيحة', true);
        return;
    }
    
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: qty, unitType: unit });
        showToastMessage('✓ تم تحديث الكمية');
        
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
    } catch(e) {
        showToastMessage('❌ فشل التحديث', true);
    }
}

async function clearAllMaterials() {
    if (allMaterials.length === 0) {
        showToastMessage('📭 لا توجد بيانات', true);
        return;
    }
    
    if (!confirm('⚠️ هل أنت متأكد من حذف جميع المواد نهائياً؟')) return;
    
    try {
        const batch = db.batch();
        for (const m of allMaterials) {
            batch.delete(materialsCollection.doc(m.id));
        }
        await batch.commit();
        showToastMessage('✓ تم مسح جميع المواد');
    } catch(e) {
        showToastMessage('❌ فشل المسح', true);
    }
}

async function backupData() {
    if (allMaterials.length === 0) {
        showToastMessage('📭 لا توجد بيانات للنسخ', true);
        return;
    }
    
    const data = JSON.stringify(allMaterials, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_spices_${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToastMessage(`💾 تم نسخ ${allMaterials.length} عنصر`);
}

async function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const backup = JSON.parse(ev.target.result);
                
                if (!confirm(`⚠️ استبدال بـ ${backup.length} عنصر؟`)) return;
                
                const batch = db.batch();
                for (const m of allMaterials) {
                    batch.delete(materialsCollection.doc(m.id));
                }
                await batch.commit();
                
                for (const item of backup) {
                    let priority = item.priority;
                    if (priority === 'spices_extra' || priority === 'roasted' || priority === 'herbs') {
                        priority = 'extra';
                    }
                    if (priority !== 'main' && priority !== 'extra' && priority !== 'bags' && priority !== 'tawsaya') {
                        priority = 'extra';
                    }
                    await materialsCollection.add({
                        name: item.name,
                        unitType: item.unitType || 'kg',
                        quantity: item.quantity || 0,
                        priority: priority || 'main',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                showToastMessage(`✓ تم استعادة ${backup.length} عنصر`);
            } catch(e) {
                showToastMessage('❌ ملف غير صالح', true);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

window.allMaterials = allMaterials;
window.startListener = startListener;
window.refreshData = refreshData;
window.addNewMaterial = addNewMaterial;
window.saveEdit = saveEdit;
window.clearAllMaterials = clearAllMaterials;
window.backupData = backupData;
window.restoreData = restoreData;
