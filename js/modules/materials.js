// ==================== إدارة المواد والمزامنة ====================

let allMaterials = [];
let unsubscribe = null;
let currentEditId = null;
let longPressTimer = null;

// بدء الاستماع للتغييرات من Firebase
function startListener() {
    console.log("🔄 Starting Firestore listener on collection: spices_final_v12");
    
    if (!materialsCollection) {
        console.error("❌ materialsCollection is not defined");
        setTimeout(function() { startListener(); }, 1000);
        return;
    }
    
    const query = materialsCollection.orderBy('createdAt', 'desc');
    
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
    
    unsubscribe = query.onSnapshot(function(snapshot) {
        console.log("📡 Snapshot received, documents count:", snapshot.size);
        
        allMaterials = [];
        snapshot.forEach(function(doc) {
            const data = doc.data();
            allMaterials.push({
                id: doc.id,
                name: data.name || 'غير معروف',
                unitType: data.unitType || 'kg',
                quantity: data.quantity || 0,
                notes: data.notes || "",
                createdAt: data.createdAt,
                priority: data.priority || "main"
            });
        });
        
        console.log("✅ Materials loaded:", allMaterials.length);
        
        // تحديث واجهة المستخدم
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        const itemsCount = document.getElementById('syncItemsCount');
        const syncTime = document.getElementById('syncLastTime');
        
        if (statusText) statusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncDot) syncDot.className = 'sync-dot';
        if (itemsCount) itemsCount.innerHTML = '<i class="fas fa-database"></i> ' + allMaterials.length + ' عنصر';
        if (syncTime) syncTime.innerHTML = '<i class="far fa-clock"></i> ' + new Date().toLocaleTimeString();
        
        // عرض المواد
        if (typeof renderSections === 'function') {
            renderSections(allMaterials);
        } else {
            console.error("❌ renderSections is not defined");
        }
        
        if (typeof updateCategoryCounts === 'function') {
            updateCategoryCounts();
        }
        
        if (typeof calculateAIMetrics === 'function') {
            calculateAIMetrics();
        }
        
        // إخفاء شاشة البداية
        const splash = document.getElementById('splashScreen');
        const app = document.getElementById('appContainer');
        if (splash && app && splash.style.display !== 'none') {
            splash.classList.add('hidden');
            setTimeout(function() {
                splash.style.display = 'none';
                app.style.display = 'block';
            }, 500);
        }
        
    }, function(error) {
        console.error("❌ Firestore error:", error);
        
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        if (statusText) statusText.innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
        if (syncDot) syncDot.className = 'sync-dot offline';
        
        // إخفاء شاشة البداية حتى لو كان هناك خطأ
        const splash = document.getElementById('splashScreen');
        const app = document.getElementById('appContainer');
        if (splash && app && splash.style.display !== 'none') {
            splash.classList.add('hidden');
            setTimeout(function() {
                splash.style.display = 'none';
                app.style.display = 'block';
            }, 500);
        }
    });
}

// إضافة مادة جديدة
async function addNewMaterial() {
    console.log("📝 Adding new material...");
    
    const name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) {
        showToast("✏️ اكتب اسم المادة", true);
        return;
    }
    
    const section = document.getElementById('newMaterialSection')?.value || 'main';
    let unit = document.getElementById('newUnitSelect')?.value || 'kg';
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    
    if (isNaN(quantity) || quantity < 0) quantity = 0;
    
    if (unit === 'half') quantity = 0.5;
    else if (unit === 'quarter') quantity = 0.25;
    else if (unit === 'oke') quantity = 0.2;
    
    if (quantity === 0 && section !== 'tawsaya') {
        showToast("⚠️ تمت إضافة \"" + name + "\" بدون كمية (مادة ناقصة)", false);
    }
    
    try {
        const docRef = await materialsCollection.add({
            name: name,
            unitType: unit,
            quantity: quantity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: section
        });
        
        console.log("✅ Material added with ID:", docRef.id);
        showToast("✓ تمت إضافة \"" + name + "\"");
        
        // إغلاق المودال وتفريغ الحقول
        document.getElementById('newItemModal').classList.remove('active');
        document.getElementById('newMaterialName').value = '';
        document.getElementById('newQuantityValue').value = '1';
        
        // تحديث البيانات
        if (unsubscribe) unsubscribe();
        startListener();
        
    } catch(e) {
        console.error("❌ Error adding material:", e);
        showToast("❌ فشل الإضافة: " + e.message, true);
    }
}

// تعديل كمية مادة
async function saveEdit() {
    if (!currentEditId) {
        console.warn("No currentEditId");
        return;
    }
    
    let unit = document.getElementById('editUnitSelect').value;
    let qty = parseFloat(document.getElementById('editQuantityValue').value);
    
    if (unit === 'half') qty = 0.5;
    else if (unit === 'quarter') qty = 0.25;
    else if (unit === 'oke') qty = 0.2;
    
    if (isNaN(qty) || qty < 0) {
        showToast("🔢 كمية صحيحة", true);
        return;
    }
    
    try {
        await materialsCollection.doc(currentEditId).update({
            quantity: qty,
            unitType: unit,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log("✅ Material updated:", currentEditId);
        showToast("✓ تم تحديث الكمية");
        
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
        
        // تحديث البيانات
        if (unsubscribe) unsubscribe();
        startListener();
        
    } catch(e) {
        console.error("❌ Error updating material:", e);
        showToast("❌ فشل التحديث", true);
    }
}

// حذف جميع المواد
async function clearAllMaterials() {
    if (allMaterials.length === 0) {
        showToast("📭 لا توجد بيانات", true);
        return;
    }
    
    if (!confirm("⚠️ هل أنت متأكد من حذف جميع المواد نهائياً؟ لا يمكن التراجع!")) {
        return;
    }
    
    try {
        const batch = db.batch();
        allMaterials.forEach(function(m) {
            batch.delete(materialsCollection.doc(m.id));
        });
        await batch.commit();
        
        console.log("✅ All materials deleted");
        showToast("✓ تم مسح جميع المواد");
        
        // تحديث البيانات
        if (unsubscribe) unsubscribe();
        startListener();
        
    } catch(e) {
        console.error("❌ Error clearing materials:", e);
        showToast("❌ فشل المسح", true);
    }
}

// نسخ احتياطي
async function backupData() {
    if (allMaterials.length === 0) {
        showToast("📭 لا توجد بيانات للنسخ", true);
        return;
    }
    
    try {
        const data = JSON.stringify(allMaterials, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup_spices_' + new Date().toISOString().slice(0,19) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        
        showToast("💾 تم نسخ " + allMaterials.length + " عنصر");
        console.log("✅ Backup created");
        
    } catch(e) {
        console.error("❌ Backup failed:", e);
        showToast("❌ فشل النسخ الاحتياطي", true);
    }
}

// استعادة بيانات
async function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async function(ev) {
            try {
                const backup = JSON.parse(ev.target.result);
                
                if (!confirm("⚠️ استبدال بـ " + backup.length + " عنصر؟ سيتم فقدان البيانات الحالية")) {
                    return;
                }
                
                // حذف جميع المواد الحالية
                const batch = db.batch();
                allMaterials.forEach(function(m) {
                    batch.delete(materialsCollection.doc(m.id));
                });
                await batch.commit();
                
                // إضافة المواد من النسخة الاحتياطية
                for (const item of backup) {
                    await materialsCollection.add({
                        name: item.name,
                        unitType: item.unitType || 'kg',
                        quantity: item.quantity || 0,
                        notes: item.notes || "",
                        priority: item.priority || "main",
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                showToast("✓ تم استعادة " + backup.length + " عنصر");
                console.log("✅ Restore completed");
                
                // تحديث البيانات
                if (unsubscribe) unsubscribe();
                startListener();
                
            } catch(e) {
                console.error("❌ Restore failed:", e);
                showToast("❌ ملف غير صالح", true);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// تصدير الدوال
window.allMaterials = allMaterials;
window.startListener = startListener;
window.addNewMaterial = addNewMaterial;
window.saveEdit = saveEdit;
window.clearAllMaterials = clearAllMaterials;
window.backupData = backupData;
window.restoreData = restoreData;
