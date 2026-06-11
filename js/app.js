// ==================== تهيئة التطبيق ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 تهيئة التطبيق...');
    
    if (typeof renderCategories === 'function') {
        renderCategories();
    }
    
    if (typeof bindEvents === 'function') {
        bindEvents();
    }
    
    if (typeof startListener === 'function') {
        startListener();
    }
    
    if (typeof initPWA === 'function') {
        initPWA();
    }
    
    // تهيئة نظام الأسعار ومزامنته مع Firebase
    if (typeof syncPricesFromFirebase === 'function') {
        syncPricesFromFirebase();
    }
    
    window.allMaterials = allMaterials;
    window.currentEditId = currentEditId;
    
    setTimeout(function() { 
        if (typeof initDragAndDrop === 'function') {
            initDragAndDrop();
        }
        if (typeof calculateAIMetrics === 'function') {
            calculateAIMetrics();
        }
    }, 1000);
});

window.addNewMaterial = addNewMaterial;
window.saveEdit = saveEdit;
window.clearAllMaterials = clearAllMaterials;
window.backupData = backupData;
window.restoreData = restoreData;
window.openPresetModal = openPresetModal;
window.addSelectedPresetItems = addSelectedPresetItems;
window.startListener = startListener;
window.renderSections = renderSections;
window.calculateAIMetrics = calculateAIMetrics;
window.initDragAndDrop = initDragAndDrop;
window.syncPricesFromFirebase = syncPricesFromFirebase;
