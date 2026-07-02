// ==================== تهيئة التطبيق ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 تهيئة التطبيق...');
    
    if (typeof renderCategories === 'function') {
        renderCategories();
        console.log('✅ Categories rendered');
    }
    
    if (typeof bindEvents === 'function') {
        bindEvents();
        console.log('✅ Events bound');
    }
    
    if (typeof startListener === 'function') {
        startListener();
        console.log('✅ Listener started');
    }
    
    if (typeof initPWA === 'function') {
        initPWA();
        console.log('✅ PWA initialized');
    }
    
    window.allMaterials = allMaterials;
    window.currentEditId = currentEditId;
    
    // تحميل الأسعار
    if (window.aiEngine && typeof window.aiEngine.loadPricesFromLocal === 'function') {
        window.aiEngine.loadPricesFromLocal();
        console.log('✅ Prices loaded');
    }
    
    if (typeof calculateAIMetrics === 'function') {
        setTimeout(function() {
            calculateAIMetrics();
            console.log('✅ AI metrics calculated');
        }, 500);
    }
    
    setTimeout(function() {
        if (typeof initDragAndDrop === 'function') {
            initDragAndDrop();
            console.log('✅ Drag and drop initialized');
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
window.refreshData = refreshData;
window.renderSections = renderSections;
window.calculateAIMetrics = calculateAIMetrics;
window.initDragAndDrop = initDragAndDrop;
