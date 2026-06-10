document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    bindEvents();
    startListener();
    initPWA();
    
    window.allMaterials = allMaterials;
    window.closeAllModals = closeAllModals;
});
