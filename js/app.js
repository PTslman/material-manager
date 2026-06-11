// ==================== تهيئة التطبيق ====================

document.addEventListener('DOMContentLoaded', function() {
    if (typeof renderCategories === 'function') renderCategories();
    if (typeof bindEvents === 'function') bindEvents();
    if (typeof startListener === 'function') startListener();
    if (typeof initPWA === 'function') initPWA();
    
    window.allMaterials = allMaterials;
    window.currentEditId = currentEditId;
    
    if (!window.aiEngine) {
        window.aiEngine = new AIEngine();
    }
    
    // ترحيل الأقسام القديمة إلى قسم "إضافي"
    setTimeout(function() {
        if (typeof migrateOldSections === 'function') {
            migrateOldSections();
        }
    }, 2000);
    
    setTimeout(function() { 
        if (typeof initDragAndDrop === 'function') initDragAndDrop();
        if (typeof calculateAIMetrics === 'function') calculateAIMetrics();
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
window.migrateOldSections = migrateOldSections;
