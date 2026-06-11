// ==================== إدارة المواد والمزامنة ====================

var allMaterials = [];
var unsubscribe = null;
var currentEditId = null;

function startListener() {
    if (!materialsCollection) { 
        setTimeout(function() { startListener(); }, 1000);
        return;
    }
    
    var query = materialsCollection.orderBy('createdAt', 'desc');
    
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
    
    unsubscribe = query.onSnapshot(function(snapshot) {
        var newMaterials = [];
        snapshot.forEach(function(doc) {
            var data = doc.data();
            var priority = data.priority || 'main';
            
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
        
        var statusText = document.getElementById('syncStatusText');
        var syncDot = document.getElementById('syncDot');
        var itemsCount = document.getElementById('syncItemsCount');
        var syncTime = document.getElementById('syncLastTime');
        
        if (statusText) statusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncDot) syncDot.className = 'sync-dot';
        if (itemsCount) itemsCount.innerHTML = '<i class="fas fa-database"></i> ' + allMaterials.length;
        if (syncTime) syncTime.innerHTML = '<i class="far fa-clock"></i> ' + new Date().toLocaleTimeString();
        
        if (typeof renderSections === 'function') renderSections(allMaterials);
        if (typeof updateCategoryCounts === 'function') updateCategoryCounts();
        if (typeof calculateAIMetrics === 'function') calculateAIMetrics();
        
        setTimeout(function() {
            if (typeof initDragAndDrop === 'function') initDragAndDrop();
        }, 200);
        
        var splash = document.getElementById('splashScreen');
        var app = document.getElementById('appContainer');
        if (splash && app && splash.style.display !== 'none') {
            splash.classList.add('hidden');
            setTimeout(function() { 
                splash.style.display = 'none'; 
                app.style.display = 'block'; 
            }, 500);
        }
        
    }, function(error) {
        var statusText = document.getElementById('syncStatusText');
        var syncDot = document.getElementById('syncDot');
        if (statusText) statusText.innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
        if (syncDot) syncDot.className = 'sync-dot offline';
    });
}

async function addNewMaterial() {
    var name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) { 
        if (typeof showToastMessage === 'function') showToastMessage('✏️ اكتب اسم المادة', true); 
        return; 
    }
    
    var section = document.getElementById('newMaterialSection')?.value || 'main';
    var unit = document.getElementById('newUnitSelect')?.value || 'kg';
    var quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    
    if (isNaN(quantity) || quantity < 0) quantity = 0;
    if (unit === 'half') quantity = 0.5;
    else if (unit === 'quarter') quantity = 0.25;
    else if (unit === 'oke') quantity = 0.2;
    
    if (typeof window.getEstimatedPrice === 'function') {
        var estimatedPrice = window.getEstimatedPrice(name);
        if (estimatedPrice > 0 && typeof window.updateMaterialPrice === 'function') {
            var currentPrice = window.getMaterialPrice(name);
            if (currentPrice === 0) {
                window.updateMaterialPrice(name, estimatedPrice);
                if (typeof showToastMessage === 'function') {
                    showToastMessage('✓ تم إضافة سعر تقريبي لـ "' + name + '" (' + estimatedPrice.toLocaleString() + ' ل.س/كجم)', false);
                }
            }
        }
    }
    
    if (quantity === 0 && section !== 'tawsaya') {
        if (typeof showToastMessage === 'function') showToastMessage('⚠️ تمت إضافة "' + name + '" بدون كمية (مادة ناقصة)', false);
    }
    
    try {
        await materialsCollection.add({ 
            name: name, 
            unitType: unit, 
            quantity: quantity, 
            createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
            priority: section 
        });
        
        if (typeof showToastMessage === 'function') showToastMessage('✓ تمت إضافة "' + name + '"');
        
        document.getElementById('newItemModal').classList.remove('active');
        document.getElementById('newMaterialName').value = '';
        document.getElementById('newQuantityValue').value = '1';
        
        if (typeof calculateAIMetrics === 'function') {
            setTimeout(function() { calculateAIMetrics(); }, 500);
        }
        
    } catch(e) { 
        if (typeof showToastMessage === 'function') showToastMessage('❌ فشل الإضافة', true); 
    }
}

async function saveEdit() {
    if (!currentEditId) { 
        if (typeof showToastMessage === 'function') showToastMessage('لا توجد مادة للتعديل', true); 
        return; 
    }
    
    var unit = document.getElementById('editUnitSelect').value;
    var qty = parseFloat(document.getElementById('editQuantityValue').value);
    
    if (unit === 'half') qty = 0.5;
    else if (unit === 'quarter') qty = 0.25;
    else if (unit === 'oke') qty = 0.2;
    
    if (isNaN(qty) || qty < 0) { 
        if (typeof showToastMessage === 'function') showToastMessage('🔢 كمية صحيحة', true); 
        return; 
    }
    
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: qty, unitType: unit });
        if (typeof showToastMessage === 'function') showToastMessage('✓ تم تحديث الكمية');
        
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
        
        if (typeof calculateAIMetrics === 'function') {
            calculateAIMetrics();
        }
        
    } catch(e) { 
        if (typeof showToastMessage === 'function') showToastMessage('❌ فشل التحديث', true); 
    }
}

async function clearAllMaterials() {
    if (allMaterials.length === 0) { 
        if (typeof showToastMessage === 'function') showToastMessage('📭 لا توجد بيانات', true); 
        return; 
    }
    
    if (!confirm('⚠️ هل أنت متأكد من حذف جميع المواد نهائياً؟')) return;
    
    try {
        var batch = db.batch();
        for (var i = 0; i < allMaterials.length; i++) { 
            batch.delete(materialsCollection.doc(allMaterials[i].id)); 
        }
        await batch.commit();
        
        if (typeof showToastMessage === 'function') showToastMessage('✓ تم مسح جميع المواد');
        
        if (typeof calculateAIMetrics === 'function') {
            calculateAIMetrics();
        }
        
    } catch(e) { 
        if (typeof showToastMessage === 'function') showToastMessage('❌ فشل المسح', true); 
    }
}

async function backupData() {
    if (allMaterials.length === 0) { 
        if (typeof showToastMessage === 'function') showToastMessage('📭 لا توجد بيانات للنسخ', true); 
        return; 
    }
    
    var data = JSON.stringify(allMaterials, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'backup_spices_' + new Date().toISOString().slice(0,19) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    
    if (typeof showToastMessage === 'function') showToastMessage('💾 تم نسخ ' + allMaterials.length + ' عنصر');
}

async function restoreData() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async function(e) {
        var file = e.target.files[0];
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = async function(ev) {
            try {
                var backup = JSON.parse(ev.target.result);
                
                if (!confirm('⚠️ استبدال بـ ' + backup.length + ' عنصر؟')) return;
                
                var batch = db.batch();
                for (var i = 0; i < allMaterials.length; i++) { 
                    batch.delete(materialsCollection.doc(allMaterials[i].id)); 
                }
                await batch.commit();
                
                for (var i = 0; i < backup.length; i++) {
                    var priority = backup[i].priority;
                    if (priority === 'spices_extra' || priority === 'roasted' || priority === 'herbs') {
                        priority = 'extra';
                    }
                    if (priority !== 'main' && priority !== 'extra' && priority !== 'bags' && priority !== 'tawsaya') {
                        priority = 'extra';
                    }
                    await materialsCollection.add({
                        name: backup[i].name, 
                        unitType: backup[i].unitType || 'kg',
                        quantity: backup[i].quantity || 0, 
                        priority: priority || 'main',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                if (typeof showToastMessage === 'function') showToastMessage('✓ تم استعادة ' + backup.length + ' عنصر');
                
                if (typeof calculateAIMetrics === 'function') {
                    setTimeout(function() { calculateAIMetrics(); }, 500);
                }
                
            } catch(e) { 
                if (typeof showToastMessage === 'function') showToastMessage('❌ ملف غير صالح', true); 
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

window.allMaterials = allMaterials;
window.startListener = startListener;
window.addNewMaterial = addNewMaterial;
window.saveEdit = saveEdit;
window.clearAllMaterials = clearAllMaterials;
window.backupData = backupData;
window.restoreData = restoreData;
