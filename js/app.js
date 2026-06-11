// ==================== تهيئة التطبيق ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 تهيئة التطبيق...');
    
    if (typeof renderCategories === 'function') {
        renderCategories();
        console.log('✅ تم عرض الأقسام');
    }
    
    if (typeof bindEvents === 'function') {
        bindEvents();
        console.log('✅ تم ربط الأحداث');
    }
    
    if (typeof startListener === 'function') {
        startListener();
        console.log('✅ بدء الاستماع إلى Firebase');
    }
    
    if (typeof initPWA === 'function') {
        initPWA();
        console.log('✅ تم تهيئة PWA');
    }
    
    window.allMaterials = allMaterials;
    window.currentEditId = currentEditId;
    
    setTimeout(function() { 
        if (typeof initDragAndDrop === 'function') {
            initDragAndDrop();
            console.log('✅ تم تهيئة السحب والإفلات');
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
window.refreshData = refreshData;
window.renderSections = renderSections;
window.calculateAIMetrics = calculateAIMetrics;
window.initDragAndDrop = initDragAndDrop;
