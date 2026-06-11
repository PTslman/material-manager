// ==================== نظام إدارة الأسعار ====================

var materialPrices = {};
var allMaterialsList = [];

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
}

// الحصول على سعر مادة
function getMaterialPrice(materialName) {
    return materialPrices[materialName] || 0;
}

// الحصول على سعر تقريبي لمادة جديدة
function getEstimatedPrice(materialName) {
    var estimatedPrices = {
        'ملح': 2000, 'فلفل اسود ناعم': 25000, 'كمون ناعم': 20000, 'كركم': 15000,
        'زنجبيل ناعم': 18000, 'قرفة ناعمة': 22000, 'هيل ناعم': 80000, 'كزبرة ناعمة': 12000,
        'شطة حلوة': 16000, 'شطة حدة وسط': 16000, 'توم ناعم': 14000, 'بصل ناعم': 12000,
        'سماق ناعم': 18000, 'شاورما': 20000, 'كاري': 15000, 'نسكافية خشنة': 35000,
        'نسكافية ناعمة': 35000, 'قهوة عربية': 40000, 'قهوة تركية': 45000, 'هيل مطحون': 80000,
        'زعفران': 200000, 'ماجي ظروف': 500, 'ماجي اصفر': 500, 'ماجي ابيض': 500,
        'جوز هند خشن': 25000, 'حليب نصف دسم': 15000, 'جوز امريكي': 30000, 'حبة البركة': 20000,
        'زنجبيل خشن': 15000, 'سمسم محمص': 18000, 'كركدية': 12000, 'كربونة الصوديوم': 5000,
        'كبسة خليجية': 25000, 'كبسة ناعمة': 25000, 'كريمة محلاية': 15000, 'كاكاو نخب اول': 30000,
        'كاكاو نخب ثاني': 25000, 'كمون حب': 20000, 'قرفة عيدان': 25000, 'قرفة سيجار': 28000,
        'كزبرة حب': 12000, 'قرنفل حب': 40000, 'قرنفل ناعم': 40000, 'اشلميش': 15000,
        'فستق ني ارجنتيني': 50000, 'ملح صيني': 3000, 'ملح ليمون': 5000, 'مشكلة': 20000,
        'مشكلة بيضاء': 20000, 'نشا مصري': 8000, 'هيل حب خشن': 75000, 'نعنع يابس': 10000,
        'يانسون حب': 15000, 'شوفان': 10000, 'تمر سري': 12000
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

// فتح نافذة الأسعار
function openPriceModal() {
    loadPrices();
    loadAllMaterialsFromPresets();
    
    var modal = document.getElementById('priceModal');
    if (!modal) {
        createPriceModal();
        modal = document.getElementById('priceModal');
    }
    
    renderPriceList();
    updatePriceSummary();
    modal.classList.add('active');
}

// إنشاء نافذة الأسعار
function createPriceModal() {
    var modalHTML = `
        <div id="priceModal" class="modal price-modal-full">
            <div class="modal-overlay"></div>
            <div class="modal-content price-modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-tags"></i> إدارة أسعار المواد</h3>
                    <button class="modal-close" id="closePriceModalBtn">&times;</button>
                </div>
                <div class="modal-body price-modal-body">
                    <div class="price-stats-cards">
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
                    
                    <div class="price-categories-tabs">
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
                        <div id="priceListContainer" class="price-items-list"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="saveAllPricesBtn" class="btn-save"><i class="fas fa-save"></i> حفظ الكل</button>
                    <button id="closePriceModalBtn2" class="btn-cancel"><i class="fas fa-times"></i> إغلاق</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    var closeBtn1 = document.getElementById('closePriceModalBtn');
    var closeBtn2 = document.getElementById('closePriceModalBtn2');
    var saveBtn = document.getElementById('saveAllPricesBtn');
    var searchInput = document.getElementById('priceSearchInput');
    var clearSearch = document.getElementById('clearPriceSearch');
    
    if (closeBtn1) closeBtn1.addEventListener('click', closePriceModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closePriceModal);
    if (saveBtn) saveBtn.addEventListener('click', saveAllPrices);
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            if (clearSearch) {
                clearSearch.style.display = e.target.value ? 'flex' : 'none';
            }
            renderPriceList();
        });
    }
    
    if (clearSearch) {
        clearSearch.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                clearSearch.style.display = 'none';
                renderPriceList();
            }
        });
    }
    
    var catTabs = document.querySelectorAll('.price-cat-tab');
    for (var i = 0; i < catTabs.length; i++) {
        catTabs[i].addEventListener('click', function() {
            var tabs = document.querySelectorAll('.price-cat-tab');
            for (var j = 0; j < tabs.length; j++) {
                tabs[j].classList.remove('active');
            }
            this.classList.add('active');
            renderPriceList();
        });
    }
}

// إغلاق نافذة الأسعار
function closePriceModal() {
    var modal = document.getElementById('priceModal');
    if (modal) modal.classList.remove('active');
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

// عرض قائمة الأسعار
function renderPriceList() {
    var container = document.getElementById('priceListContainer');
    if (!container) return;
    
    var searchInput = document.getElementById('priceSearchInput');
    var searchValue = searchInput ? searchInput.value.toLowerCase() : '';
    
    var activeTab = document.querySelector('.price-cat-tab.active');
    var activeCat = activeTab ? activeTab.getAttribute('data-cat') : 'all';
    
    var filteredMaterials = [];
    for (var i = 0; i < allMaterialsList.length; i++) {
        var material = allMaterialsList[i];
        var category = getMaterialCategory(material);
        
        if (activeCat !== 'all' && category !== activeCat) {
            continue;
        }
        
        if (searchValue && !material.toLowerCase().includes(searchValue)) {
            continue;
        }
        
        filteredMaterials.push(material);
    }
    
    if (filteredMaterials.length === 0) {
        container.innerHTML = '<div class="price-empty-state"><i class="fas fa-search"></i><br>لا توجد نتائج</div>';
        updatePriceSummary();
        return;
    }
    
    var html = '';
    for (var i = 0; i < filteredMaterials.length; i++) {
        var material = filteredMaterials[i];
        var currentPrice = getMaterialPrice(material);
        var priceDisplay = currentPrice > 0 ? currentPrice.toLocaleString() : '';
        var category = getMaterialCategory(material);
        var categoryIcon = '';
        
        if (category === 'main') categoryIcon = '⭐';
        else if (category === 'extra') categoryIcon = '➕';
        else if (category === 'bags') categoryIcon = '🛍️';
        
        html += `
            <div class="price-item-row" data-material="${escapeHtml(material)}">
                <div class="price-item-name-cell">
                    <span class="price-category-icon">${categoryIcon}</span>
                    <span class="price-material-name">${escapeHtml(material)}</span>
                </div>
                <div class="price-item-price-cell">
                    <input type="number" class="price-input-field" data-material="${escapeHtml(material)}" value="${currentPrice > 0 ? currentPrice : ''}" placeholder="سعر الكيلو" step="100" min="0">
                    <span class="price-currency">ل.س</span>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    var priceInputs = container.querySelectorAll('.price-input-field');
    for (var i = 0; i < priceInputs.length; i++) {
        priceInputs[i].addEventListener('change', function(e) {
            var materialName = this.getAttribute('data-material');
            var value = this.value;
            updateMaterialPrice(materialName, value);
            updatePriceSummary();
            if (typeof calculateAIMetrics === 'function') {
                calculateAIMetrics();
            }
        });
    }
    
    updatePriceSummary();
}

// تحديث ملخص الأسعار
function updatePriceSummary() {
    var totalMaterialsEl = document.getElementById('totalMaterialsPrice');
    var pricedCountEl = document.getElementById('pricedMaterialsCount');
    var totalValueEl = document.getElementById('totalInventoryValuePrice');
    
    if (totalMaterialsEl) totalMaterialsEl.innerText = allMaterialsList.length;
    
    var pricedCount = 0;
    for (var key in materialPrices) {
        if (materialPrices[key] > 0) pricedCount++;
    }
    if (pricedCountEl) pricedCountEl.innerText = pricedCount;
    
    var totalValue = calculateTotalValue();
    if (totalValueEl) totalValueEl.innerText = totalValue.formattedTotal;
}

// حفظ جميع الأسعار
function saveAllPrices() {
    savePrices();
    if (typeof showToastMessage === 'function') {
        showToastMessage('✓ تم حفظ جميع الأسعار');
    }
    if (typeof calculateAIMetrics === 'function') {
        calculateAIMetrics();
    }
    updatePriceSummary();
}

window.getMaterialPrice = getMaterialPrice;
window.getEstimatedPrice = getEstimatedPrice;
window.loadPrices = loadPrices;
window.savePrices = savePrices;
window.updateMaterialPrice = updateMaterialPrice;
window.calculateTotalValue = calculateTotalValue;
window.formatCurrency = formatCurrency;
window.openPriceModal = openPriceModal;
window.closePriceModal = closePriceModal;
window.renderPriceList = renderPriceList;
window.updatePriceSummary = updatePriceSummary;
window.loadAllMaterialsFromPresets = loadAllMaterialsFromPresets;
