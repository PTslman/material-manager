// ==================== تهيئة التطبيق المتقدمة ====================

const App = {
    initialized: false,
    priceLoadAttempts: 0,
    maxPriceLoadAttempts: 3,
    
    init() {
        if (this.initialized) return;
        console.log('🚀 Starting application...');
        
        this._initComponents();
        this._initData();
        this._initUI();
        this._initAdvancedFeatures();
        
        this.initialized = true;
        console.log('✅ Application ready');
    },
    
    _initComponents() {
        window.allMaterials = allMaterials;
        window.currentEditId = currentEditId;
        
        if (typeof bindEvents === 'function') {
            bindEvents();
        }
        
        if (typeof initPWA === 'function') {
            initPWA();
        }
    },
    
    _initData() {
        if (typeof startListener === 'function') {
            startListener();
        }
        
        this._loadPricesWithRetry();
    },
    
    _loadPricesWithRetry() {
        if (!window.aiEngine || typeof window.aiEngine.preloadPrices !== 'function') {
            setTimeout(() => this._loadPricesWithRetry(), 1000);
            return;
        }
        
        window.aiEngine.preloadPrices()
            .then(() => {
                this.priceLoadAttempts = 0;
                this._updateAIAnalysis();
            })
            .catch(() => {
                this.priceLoadAttempts++;
                if (this.priceLoadAttempts < this.maxPriceLoadAttempts) {
                    setTimeout(() => this._loadPricesWithRetry(), 2000);
                } else {
                    this._updateAIAnalysis();
                }
            });
    },
    
    _initUI() {
        if (typeof renderCategories === 'function') {
            renderCategories();
        }
        
        if (typeof renderSections === 'function' && window.allMaterials) {
            renderSections(window.allMaterials);
        }
        
        if (typeof updateCategoryCounts === 'function') {
            updateCategoryCounts();
        }
        
        setTimeout(() => this._updateAIAnalysis(), 500);
    },
    
    _initAdvancedFeatures() {
        setTimeout(() => {
            if (typeof initDragAndDrop === 'function') {
                initDragAndDrop();
            }
        }, 1000);
        
        setTimeout(() => {
            if (typeof PWASettings !== 'undefined' && PWASettings.registerBackgroundSync) {
                PWASettings.registerBackgroundSync().catch(() => {});
            }
        }, 3000);
        
        if (window.aiEngine && typeof window.aiEngine.learnFromAction === 'function') {
            document.addEventListener('click', (e) => {
                const target = e.target.closest('.material-card');
                if (target && target.dataset.name) {
                    window.aiEngine.learnFromAction('view', target.dataset.name, { source: 'click' });
                }
            });
        }
    },
    
    _updateAIAnalysis() {
        if (typeof calculateAIMetrics === 'function') {
            setTimeout(calculateAIMetrics, 200);
        }
    },
    
    refresh() {
        if (typeof startListener === 'function') {
            startListener();
        }
        if (typeof calculateAIMetrics === 'function') {
            setTimeout(calculateAIMetrics, 500);
        }
    }
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => App.init());

// إعادة تحميل البيانات عند العودة للصفحة
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && App.initialized) {
        App.refresh();
    }
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
window.App = App;
