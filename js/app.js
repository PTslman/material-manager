// ==================== تهيئة التطبيق ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App initializing...');
    
    // تهيئة المكونات بالترتيب
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
        console.log('✅ Firestore listener started');
    }
    
    if (typeof initPWA === 'function') {
        initPWA();
        console.log('✅ PWA initialized');
    }
    
    // جعل المتغيرات عامة
    window.allMaterials = allMaterials;
    window.currentEditId = currentEditId;
    
    // تهيئة السحب والإفلات بعد تحميل الصفحة
    setTimeout(function() { 
        if (typeof initDragAndDrop === 'function') {
            initDragAndDrop();
            console.log('✅ Drag and drop system ready');
        }
    }, 1000);
});

// تصدير الدوال العالمية
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
