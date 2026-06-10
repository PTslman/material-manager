// ==================== تهيئة التطبيق ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App initializing...');
    
    renderCategories();
    bindEvents();
    startListener();
    initPWA();
    
    window.allMaterials = allMaterials;
    window.currentEditId = currentEditId;
    
    setTimeout(function() { 
        if (typeof setupLongPressForAllCards === 'function') {
            setupLongPressForAllCards();
            console.log('✅ Long press system initialized');
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
window.executeMove = executeMove;
window.startListener = startListener;
window.renderSections = renderSections;
window.calculateAIMetrics = calculateAIMetrics;
window.setupLongPressForAllCards = setupLongPressForAllCards;
