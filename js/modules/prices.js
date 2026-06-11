// ==================== نظام إدارة الأسعار - واجهة منفصلة ====================

var materialPrices = {};
var allMaterialsList = [];
var priceModalWindow = null;
var isPriceWindowOpen = false;

// تحميل جميع المواد من القوائم الجاهزة
function loadAllMaterialsFromPresets() {
    var materialsSet = new Set();
    
    if (typeof importantItemsList !== 'undefined') {
        for (var i = 0; i < importantItemsList.length; i++) {
            materialsSet.add(importantItemsList[i]);
        }
    }
    
    if (typeof extraItemsList !== 'undefined') {
        for (var i = 0; i < extraItemsList.length; i++) {
            materialsSet.add(extraItemsList[i]);
        }
    }
    
    if (typeof bagTypesList !== 'undefined') {
        for (var i = 0; i < bagTypesList.length; i++) {
            materialsSet.add(bagTypesList[i]);
        }
    }
    
    allMaterialsList = Array.from(materialsSet);
    allMaterialsList.sort(function(a, b) {
        return a.localeCompare(b);
    });
}

// تحميل الأسعار من localStorage
function loadPrices() {
    try {
        var saved = localStorage.getItem('material_prices');
        if (saved) {
            materialPrices = JSON.parse(saved);
        }
    } catch(e) {
        materialPrices = {};
    }
}

// حفظ الأسعار في localStorage
function savePrices() {
    try {
        localStorage.setItem('material_prices', JSON.stringify(materialPrices));
    } catch(e) {}
}

// تحديث سعر مادة
function updateMaterialPrice(materialName, price) {
    if (!materialName) return;
    if (price === undefined || price === null || price === '') {
        delete materialPrices[materialName];
    } else {
        var numPrice = parseFloat(price);
        if (!isNaN(numPrice) && numPrice >= 0) {
            materialPrices[materialName] = numPrice;
        }
    }
    savePrices();
    if (typeof calculateAIMetrics === 'function') {
        calculateAIMetrics();
    }
    if (priceModalWindow && !priceModalWindow.closed) {
        updatePriceWindowSummary();
        renderPriceWindowList();
    }
}

// الحصول على سعر مادة
function getMaterialPrice(materialName) {
    return materialPrices[materialName] || 0;
}

// الحصول على سعر تقريبي
function getEstimatedPrice(materialName) {
    var estimatedPrices = {
        'ملح': 2000, 'فلفل اسود ناعم': 25000, 'كمون ناعم': 20000, 'كركم': 15000,
        'زنجبيل ناعم': 18000, 'قرفة ناعمة': 22000, 'هيل ناعم': 80000, 'كزبرة ناعمة': 12000,
        'شطة حلوة': 16000, 'شطة حدة وسط': 16000, 'توم ناعم': 14000, 'بصل ناعم': 12000,
        'نسكافية خشنة': 35000, 'نسكافية ناعمة': 35000, 'قهوة عربية': 40000, 'يانسون حب': 15000,
        'شوفان': 10000, 'نعنع يابس': 10000, 'ميلو': 30000, 'اشلميش': 15000
    };
    return estimatedPrices[materialName] || 0;
}

// حساب القيمة الإجمالية للمخزون
function calculateTotalValue() {
    if (!window.allMaterials) return { total: 0, formattedTotal: '0 ل.س', breakdown: [] };
    
    var totalValue = 0;
    var priceBreakdown = [];
    
    for (var i = 0; i < window.allMaterials.length; i++) {
        var material = window.allMaterials[i];
        if (material.priority === 'tawsaya') continue;
        
        var price = getMaterialPrice(material.name);
        var quantityInKg = 0;
        
        if (window.aiEngine) {
            quantityInKg = window.aiEngine.convertToKg(material.quantity, material.unitType);
        } else {
            var conversions = { 'kg':1, 'half':0.5, 'quarter':0.25, 'oke':0.128, 'box':0.5, 'piece':0.1, 'bag':0.05 };
            quantityInKg = material.quantity * (conversions[material.unitType] || 1);
        }
        
        var itemValue = quantityInKg * price;
        totalValue += itemValue;
        
        if (price > 0 && quantityInKg > 0) {
            priceBreakdown.push({
                name: material.name,
                quantity: material.quantity,
                unit: material.unitType,
                quantityInKg: quantityInKg,
                pricePerKg: price,
                totalValue: itemValue,
                formattedValue: formatCurrency(itemValue)
            });
        }
    }
    
    priceBreakdown.sort(function(a, b) { return b.totalValue - a.totalValue; });
    
    return {
        total: totalValue,
        breakdown: priceBreakdown,
        formattedTotal: formatCurrency(totalValue)
    };
}

// تنسيق العملة
function formatCurrency(value) {
    return Math.round(value).toLocaleString() + ' ل.س';
}

// فتح نافذة الأسعار المنفصلة
function openPriceModal() {
    if (priceModalWindow && !priceModalWindow.closed) {
        priceModalWindow.focus();
        return;
    }
    
    loadPrices();
    loadAllMaterialsFromPresets();
    
    // إنشاء نافذة منفصلة
    var windowFeatures = 'width=800,height=700,left=200,top=100,resizable=yes,scrollbars=yes,dir=rtl';
    priceModalWindow = window.open('', 'PriceManager', windowFeatures);
    
    if (!priceModalWindow) {
        alert('يرجى السماح بالنوافذ المنبثقة لهذا الموقع');
        return;
    }
    
    var htmlContent = getPriceWindowHTML();
    priceModalWindow.document.write(htmlContent);
    priceModalWindow.document.close();
    
    // ربط الأحداث بعد تحميل النافذة
    setTimeout(function() {
        bindPriceWindowEvents();
    }, 100);
    
    isPriceWindowOpen = true;
}

// إنشاء HTML لنافذة الأسعار المنفصلة
function getPriceWindowHTML() {
    return `<!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إدارة أسعار المواد - مدير المواد الذكي</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', 'Tajawal', sans-serif;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                min-height: 100vh;
                padding: 20px;
                direction: rtl;
            }
            
            .price-window-container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            /* header */
            .price-window-header {
                background: linear-gradient(135deg, #059669, #047857);
                border-radius: 24px;
                padding: 24px 32px;
                margin-bottom: 24px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            .price-window-title h1 {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 4px;
            }
            
            .price-window-title p {
                font-size: 13px;
                opacity: 0.8;
            }
            
            .price-window-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 10px 20px;
                border-radius: 999px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .price-window-close:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.02);
            }
            
            /* stats cards */
            .price-stats-cards {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .price-stat-card {
                background: white;
                border-radius: 20px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                transition: transform 0.2s;
            }
            
            .price-stat-card:hover {
                transform: translateY(-3px);
            }
            
            .price-stat-icon {
                width: 56px;
                height: 56px;
                background: #ecfdf5;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .price-stat-icon i {
                font-size: 28px;
                color: #059669;
            }
            
            .price-stat-info {
                flex: 1;
            }
            
            .price-stat-label {
                font-size: 12px;
                color: #64748b;
                display: block;
                margin-bottom: 4px;
            }
            
            .price-stat-value {
                font-size: 28px;
                font-weight: 800;
                color: #1e293b;
            }
            
            /* search */
            .price-search-section {
                margin-bottom: 20px;
            }
            
            .price-search-wrapper {
                position: relative;
            }
            
            .price-search-wrapper i {
                position: absolute;
                right: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: #94a3b8;
            }
            
            .price-search-input {
                width: 100%;
                padding: 14px 45px 14px 16px;
                border: 1.5px solid #e2e8f0;
                border-radius: 999px;
                font-size: 14px;
                font-family: inherit;
                outline: none;
                transition: all 0.2s;
            }
            
            .price-search-input:focus {
                border-color: #10b981;
                box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
            }
            
            .price-clear-search {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                font-size: 14px;
            }
            
            /* tabs */
            .price-categories-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .price-cat-tab {
                padding: 8px 20px;
                border-radius: 999px;
                border: 1px solid #e2e8f0;
                background: white;
                color: #64748b;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .price-cat-tab:hover {
                background: #f1f5f9;
                transform: translateY(-1px);
            }
            
            .price-cat-tab.active {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }
            
            /* table */
            .price-items-container {
                background: white;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            
            .price-items-header {
                display: flex;
                justify-content: space-between;
                padding: 16px 20px;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
                font-weight: 600;
                color: #475569;
                font-size: 13px;
            }
            
            .price-items-header-name {
                flex: 1;
                text-align: right;
            }
            
            .price-items-header-price {
                width: 200px;
                text-align: center;
            }
            
            .price-items-list {
                max-height: 450px;
                overflow-y: auto;
            }
            
            .price-item-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 14px 20px;
                border-bottom: 1px solid #f1f5f9;
                transition: background 0.2s;
            }
            
            .price-item-row:hover {
                background: #f8fafc;
            }
            
            .price-item-name-cell {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .price-category-icon {
                font-size: 18px;
                width: 32px;
            }
            
            .price-material-name {
                font-weight: 500;
                color: #1e293b;
            }
            
            .price-item-price-cell {
                width: 200px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .price-input-field {
                flex: 1;
                padding: 10px 12px;
                border: 1.5px solid #e2e8f0;
                border-radius: 999px;
                font-size: 13px;
                text-align: center;
                outline: none;
                transition: all 0.2s;
            }
            
            .price-input-field:focus {
                border-color: #10b981;
                box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
            }
            
            .price-currency {
                font-size: 11px;
                color: #64748b;
                min-width: 35px;
            }
            
            /* footer */
            .price-window-footer {
                margin-top: 24px;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            .btn-save-all {
                background: linear-gradient(135deg, #059669, #047857);
                color: white;
                border: none;
                padding: 12px 28px;
                border-radius: 999px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-save-all:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(5,150,105,0.3);
            }
            
            .btn-close {
                background: #f1f5f9;
                border: 1px solid #e2e8f0;
                padding: 12px 28px;
                border-radius: 999px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-close:hover {
                background: #e2e8f0;
            }
            
            .price-empty-state {
                text-align: center;
                padding: 60px;
                color: #94a3b8;
            }
            
            .price-empty-state i {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            
            @media (max-width: 768px) {
                .price-stats-cards {
                    grid-template-columns: 1fr;
                }
                .price-items-header {
                    display: none;
                }
                .price-item-row {
                    flex-direction: column;
                    gap: 10px;
                }
                .price-item-price-cell {
                    width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="price-window-container">
            <div class="price-window-header">
                <div class="price-window-title">
                    <h1><i class="fas fa-tags"></i> إدارة أسعار المواد</h1>
                    <p>تحديد أسعار المواد بالكيلوغرام (ليرة سورية)</p>
                </div>
                <button class="price-window-close" onclick="window.close()">
                    <i class="fas fa-times"></i> إغلاق النافذة
                </button>
            </div>
            
            <div class="price-stats-cards" id="priceStatsCards">
                <div class="price-stat-card">
                    <div class="price-stat-icon"><i class="fas fa-boxes"></i></div>
                    <div class="price-stat-info">
                        <span class="price-stat-label">إجمالي المواد</span>
                        <span class="price-stat-value" id="totalMaterialsPrice">0</span>
                    </div>
                </div>
                <div class="price-stat-card">
                    <div class="price-stat-icon"><i class="fas fa-tag"></i></div>
                    <div class="price-stat-info">
                        <span class="price-stat-label">المواد المسعرة</span>
                        <span class="price-stat-value" id="pricedMaterialsCount">0</span>
                    </div>
                </div>
                <div class="price-stat-card">
                    <div class="price-stat-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="price-stat-info">
                        <span class="price-stat-label">القيمة الإجمالية</span>
                        <span class="price-stat-value" id="totalInventoryValuePrice">0</span>
                    </div>
                </div>
            </div>
            
            <div class="price-search-section">
                <div class="price-search-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" id="priceSearchInput" class="price-search-input" placeholder="بحث عن مادة...">
                    <button id="clearPriceSearch" class="price-clear-search" style="display: none;"><i class="fas fa-times"></i></button>
                </div>
            </div>
            
            <div class="price-categories-tabs" id="priceCategoriesTabs">
                <button class="price-cat-tab active" data-cat="all">الكل</button>
                <button class="price-cat-tab" data-cat="main">⭐ أساسيات</button>
                <button class="price-cat-tab" data-cat="extra">➕ إضافي</button>
                <button class="price-cat-tab" data-cat="bags">🛍️ أكياس تعبئة</button>
            </div>
            
            <div class="price-items-container">
                <div class="price-items-header">
                    <span class="price-items-header-name">اسم المادة</span>
                    <span class="price-items-header-price">السعر (ل.س/كجم)</span>
                </div>
                <div id="priceListContainer" class="price-items-list">
                    <div class="price-empty-state"><i class="fas fa-spinner fa-pulse"></i><br>جاري التحميل...</div>
                </div>
            </div>
            
            <div class="price-window-footer">
                <button class="btn-close" onclick="window.close()">إلغاء</button>
                <button class="btn-save-all" id="saveAllPricesBtn"><i class="fas fa-save"></i> حفظ الكل</button>
            </div>
        </div>
        
        <script>
            var parentWindow = window.opener;
            
            function updatePriceSummary(data) {
                document.getElementById('totalMaterialsPrice').innerText = data.totalMaterials || 0;
                document.getElementById('pricedMaterialsCount').innerText = data.pricedCount || 0;
                document.getElementById('totalInventoryValuePrice').innerText = data.totalValue || '0 ل.س';
            }
            
            function renderPriceList(data) {
                var container = document.getElementById('priceListContainer');
                if (!container) return;
                
                if (!data.materials || data.materials.length === 0) {
                    container.innerHTML = '<div class="price-empty-state"><i class="fas fa-search"></i><br>لا توجد نتائج</div>';
                    return;
                }
                
                var html = '';
                for (var i = 0; i < data.materials.length; i++) {
                    var item = data.materials[i];
                    html += '<div class="price-item-row">' +
                        '<div class="price-item-name-cell">' +
                            '<span class="price-category-icon">' + (item.categoryIcon || '') + '</span>' +
                            '<span class="price-material-name">' + escapeHtml(item.name) + '</span>' +
                        '</div>' +
                        '<div class="price-item-price-cell">' +
                            '<input type="number" class="price-input-field" data-material="' + escapeHtml(item.name) + '" value="' + (item.price > 0 ? item.price : '') + '" placeholder="سعر الكيلو" step="100" min="0">' +
                            '<span class="price-currency">ل.س</span>' +
                        '</div>' +
                    '</div>';
                }
                container.innerHTML = html;
            }
            
            function escapeHtml(str) {
                if (!str) return '';
                return str.replace(/[&<>]/g, function(m) {
                    if (m === '&') return '&amp;';
                    if (m === '<') return '&lt;';
                    if (m === '>') return '&gt;';
                    return m;
                });
            }
            
            if (parentWindow && parentWindow.priceWindowData) {
                updatePriceSummary(parentWindow.priceWindowData.summary);
                renderPriceList(parentWindow.priceWindowData);
            }
            
            document.getElementById('saveAllPricesBtn').addEventListener('click', function() {
                if (parentWindow && parentWindow.saveAllPricesFromWindow) {
                    parentWindow.saveAllPricesFromWindow();
                }
            });
            
            var searchInput = document.getElementById('priceSearchInput');
            var clearBtn = document.getElementById('clearPriceSearch');
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    if (clearBtn) clearBtn.style.display = e.target.value ? 'flex' : 'none';
                    if (parentWindow && parentWindow.filterPriceList) {
                        parentWindow.filterPriceList(e.target.value);
                    }
                });
            }
            if (clearBtn) {
                clearBtn.addEventListener('click', function() {
                    if (searchInput) searchInput.value = '';
                    clearBtn.style.display = 'none';
                    if (parentWindow && parentWindow.filterPriceList) {
                        parentWindow.filterPriceList('');
                    }
                });
            }
            
            var tabs = document.querySelectorAll('.price-cat-tab');
            for (var i = 0; i < tabs.length; i++) {
                tabs[i].addEventListener('click', function() {
                    var activeCat = this.getAttribute('data-cat');
                    for (var j = 0; j < tabs.length; j++) {
                        tabs[j].classList.remove('active');
                    }
                    this.classList.add('active');
                    if (parentWindow && parentWindow.filterPriceListByCategory) {
                        parentWindow.filterPriceListByCategory(activeCat);
                    }
                });
            }
        </script>
    </body>
    </html>`;
}

// بيانات النافذة المنفصلة
var priceWindowData = {
    materials: [],
    summary: { totalMaterials: 0, pricedCount: 0, totalValue: '0 ل.س' },
    currentFilter: '',
    currentCategory: 'all'
};

// تحديث بيانات النافذة
function updatePriceWindowData() {
    var filteredMaterials = [];
    var searchValue = priceWindowData.currentFilter.toLowerCase();
    var activeCat = priceWindowData.currentCategory;
    
    for (var i = 0; i < allMaterialsList.length; i++) {
        var material = allMaterialsList[i];
        var category = getMaterialCategory(material);
        var categoryIcon = category === 'main' ? '⭐' : (category === 'extra' ? '➕' : (category === 'bags' ? '🛍️' : ''));
        
        if (activeCat !== 'all' && category !== activeCat) continue;
        if (searchValue && !material.toLowerCase().includes(searchValue)) continue;
        
        filteredMaterials.push({
            name: material,
            price: getMaterialPrice(material),
            category: category,
            categoryIcon: categoryIcon
        });
    }
    
    priceWindowData.materials = filteredMaterials;
    
    var pricedCount = 0;
    for (var key in materialPrices) {
        if (materialPrices[key] > 0) pricedCount++;
    }
    
    var totalValue = calculateTotalValue();
    priceWindowData.summary = {
        totalMaterials: allMaterialsList.length,
        pricedCount: pricedCount,
        totalValue: totalValue.formattedTotal
    };
}

// عرض القائمة في النافذة المنفصلة
function renderPriceWindowList() {
    if (!priceModalWindow || priceModalWindow.closed) return;
    
    updatePriceWindowData();
    
    var html = '';
    for (var i = 0; i < priceWindowData.materials.length; i++) {
        var item = priceWindowData.materials[i];
        html += '<div class="price-item-row">' +
            '<div class="price-item-name-cell">' +
                '<span class="price-category-icon">' + (item.categoryIcon || '') + '</span>' +
                '<span class="price-material-name">' + escapeHtml(item.name) + '</span>' +
            '</div>' +
            '<div class="price-item-price-cell">' +
                '<input type="number" class="price-input-field" data-material="' + escapeHtml(item.name) + '" value="' + (item.price > 0 ? item.price : '') + '" placeholder="سعر الكيلو" step="100" min="0">' +
                '<span class="price-currency">ل.س</span>' +
            '</div>' +
        '</div>';
    }
    
    var container = priceModalWindow.document.getElementById('priceListContainer');
    if (container) {
        if (priceWindowData.materials.length === 0) {
            container.innerHTML = '<div class="price-empty-state"><i class="fas fa-search"></i><br>لا توجد نتائج</div>';
        } else {
            container.innerHTML = html;
        }
    }
    
    // ربط أحداث تغيير الأسعار
    var inputs = priceModalWindow.document.querySelectorAll('.price-input-field');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('change', function(e) {
            var materialName = this.getAttribute('data-material');
            var value = this.value;
            updateMaterialPrice(materialName, value);
            updatePriceWindowSummary();
        });
    }
    
    updatePriceWindowSummary();
}

// تحديث ملخص النافذة
function updatePriceWindowSummary() {
    if (!priceModalWindow || priceModalWindow.closed) return;
    
    var pricedCount = 0;
    for (var key in materialPrices) {
        if (materialPrices[key] > 0) pricedCount++;
    }
    
    var totalValue = calculateTotalValue();
    
    var totalEl = priceModalWindow.document.getElementById('totalMaterialsPrice');
    var pricedEl = priceModalWindow.document.getElementById('pricedMaterialsCount');
    var valueEl = priceModalWindow.document.getElementById('totalInventoryValuePrice');
    
    if (totalEl) totalEl.innerText = allMaterialsList.length;
    if (pricedEl) pricedEl.innerText = pricedCount;
    if (valueEl) valueEl.innerText = totalValue.formattedTotal;
}

// تصفية القائمة
function filterPriceList(searchValue) {
    priceWindowData.currentFilter = searchValue;
    renderPriceWindowList();
}

// تصفية حسب التصنيف
function filterPriceListByCategory(category) {
    priceWindowData.currentCategory = category;
    renderPriceWindowList();
}

// حفظ جميع الأسعار من النافذة
function saveAllPricesFromWindow() {
    savePrices();
    if (typeof showToastMessage === 'function') {
        showToastMessage('✓ تم حفظ جميع الأسعار');
    }
    if (typeof calculateAIMetrics === 'function') {
        calculateAIMetrics();
    }
    updatePriceWindowSummary();
    if (priceModalWindow && !priceModalWindow.closed) {
        priceModalWindow.document.getElementById('saveAllPricesBtn')?.blur();
    }
}

// الحصول على تصنيف المادة
function getMaterialCategory(materialName) {
    if (typeof importantItemsList !== 'undefined' && importantItemsList.indexOf(materialName) !== -1) {
        return 'main';
    }
    if (typeof extraItemsList !== 'undefined' && extraItemsList.indexOf(materialName) !== -1) {
        return 'extra';
    }
    if (typeof bagTypesList !== 'undefined' && bagTypesList.indexOf(materialName) !== -1) {
        return 'bags';
    }
    return 'other';
}

// ربط أحداث النافذة المنفصلة
function bindPriceWindowEvents() {
    if (!priceModalWindow || priceModalWindow.closed) return;
    
    var searchInput = priceModalWindow.document.getElementById('priceSearchInput');
    var clearBtn = priceModalWindow.document.getElementById('clearPriceSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            if (clearBtn) clearBtn.style.display = e.target.value ? 'flex' : 'none';
            filterPriceList(e.target.value);
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            clearBtn.style.display = 'none';
            filterPriceList('');
        });
    }
    
    var tabs = priceModalWindow.document.querySelectorAll('.price-cat-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function() {
            var activeCat = this.getAttribute('data-cat');
            for (var j = 0; j < tabs.length; j++) {
                tabs[j].classList.remove('active');
            }
            this.classList.add('active');
            filterPriceListByCategory(activeCat);
        });
    }
    
    var saveBtn = priceModalWindow.document.getElementById('saveAllPricesBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAllPricesFromWindow);
    }
}

// تصدير الدوال
window.getMaterialPrice = getMaterialPrice;
window.getEstimatedPrice = getEstimatedPrice;
window.loadPrices = loadPrices;
window.savePrices = savePrices;
window.updateMaterialPrice = updateMaterialPrice;
window.calculateTotalValue = calculateTotalValue;
window.formatCurrency = formatCurrency;
window.openPriceModal = openPriceModal;
window.saveAllPricesFromWindow = saveAllPricesFromWindow;
window.filterPriceList = filterPriceList;
window.filterPriceListByCategory = filterPriceListByCategory;
window.priceWindowData = priceWindowData;
