// ==================== تهيئة التطبيق ====================

document.addEventListener('DOMContentLoaded', function() {
    
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
    
    window.allMaterials = allMaterials;
    window.currentEditId = currentEditId;
    
    // تحميل الأسعار من Firebase وتحديث التحليل
    if (window.aiEngine && typeof window.aiEngine.preloadPrices === 'function') {
        window.aiEngine.preloadPrices().then(function() {
            if (typeof calculateAIMetrics === 'function') {
                setTimeout(function() {
                    calculateAIMetrics();
                }, 500);
            }
        }).catch(function() {
            if (typeof calculateAIMetrics === 'function') {
                calculateAIMetrics();
            }
        });
    } else {
        if (typeof calculateAIMetrics === 'function') {
            setTimeout(function() {
                calculateAIMetrics();
            }, 500);
        }
    }
    
    setTimeout(function() { 
        if (typeof initDragAndDrop === 'function') {
            initDragAndDrop();
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
