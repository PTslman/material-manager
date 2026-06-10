// ==================== تهيئة التطبيق ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 App initializing...");
    console.log("📁 Firebase collection: spices_final_v12");
    
    // ترتيب التهيئة مهم جداً
    if (typeof renderCategories === 'function') {
        renderCategories();
        console.log("✅ Categories rendered");
    } else {
        console.error("❌ renderCategories is not defined");
    }
    
    if (typeof bindEvents === 'function') {
        bindEvents();
        console.log("✅ Events bound");
    } else {
        console.error("❌ bindEvents is not defined");
    }
    
    if (typeof startListener === 'function') {
        startListener();
        console.log("✅ Firestore listener started");
    } else {
        console.error("❌ startListener is not defined");
    }
    
    if (typeof initPWA === 'function') {
        initPWA();
        console.log("✅ PWA initialized");
    }
    
    // جعل المتغيرات عامة للوصول إليها
    window.allMaterials = allMaterials;
    window.currentEditId = currentEditId;
});

// إعادة تعريف الدوال العالمية المهمة
window.addNewMaterial = addNewMaterial;
window.saveEdit = saveEdit;
window.clearAllMaterials = clearAllMaterials;
window.backupData = backupData;
window.restoreData = restoreData;
window.openPresetModal = openPresetModal;
window.addSelectedPresetItems = addSelectedPresetItems;
window.executeMove = executeMove;
window.startListener = startListener;
window.renderSections = renderSections;
window.calculateAIMetrics = calculateAIMetrics;
