// ==================== نظام إدارة الأسعار ====================

var materialPrices = {};
var allMaterialsList = [];

// تحميل جميع المواد من القوائم الجاهزة
function loadAllMaterialsFromPresets() {
    var materialsSet = new Set();
    
    // إضافة مواد من أساسيات
    if (typeof importantItemsList !== 'undefined') {
        for (var i = 0; i < importantItemsList.length; i++) {
            materialsSet.add(importantItemsList[i]);
        }
    }
    
    // إضافة مواد من إضافي
    if (typeof extraItemsList !== 'undefined') {
        for (var i = 0; i < extraItemsList.length; i++) {
            materialsSet.add(extraItemsList[i]);
        }
    }
    
    // إضافة مواد من أكياس تعبئة
    if (typeof bagTypesList !== 'undefined') {
        for (var i = 0; i < bagTypesList.length; i++) {
            materialsSet.add(bagTypesList[i]);
        }
    }
    
    // إضافة مواد من توصيات (إذا وجدت)
    if (typeof tawsayaItemsList !== 'undefined') {
        for (var i = 0; i < tawsayaItemsList.length; i++) {
            materialsSet.add(tawsayaItemsList[i]);
        }
    }
    
    // تحويل Set إلى Array وترتيبها أبجدياً
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
    if (typeof calculateTotalValue === 'function') {
        calculateTotalValue();
    }
}

// الحصول على سعر مادة
function getMaterialPrice(materialName) {
    return materialPrices[materialName] || 0;
}

// حساب القيمة الإجمالية للمخزون (باستثناء التوصيات)
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
    modal.classList.add('active');
}

// إنشاء نافذة الأسعار
function createPriceModal() {
    var modalHTML = `
        <div id="priceModal" class="modal">
            <div class="modal-overlay"></div>
            <div class="modal-content modal-price">
                <div class="modal-header">
                    <h3><i class="fas fa-tags"></i> إدارة أسعار المواد</h3>
                    <button class="modal-close" id="closePriceModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="price-summary" id="priceSummary">
                        <div class="price-total-card">
                            <i class="fas fa-chart-line"></i>
                            <div class="price-total-info">
                                <span class="price-total-label">القيمة الإجمالية للمخزون</span>
                                <span class="price-total-value" id="totalInventoryValue">0 ل.س</span>
                            </div>
                        </div>
                        <div class="price-stats">
                            <div class="price-stat">
                                <span class="price-stat-label">عدد المواد المسعرة</span>
                                <span class="price-stat-value" id="pricedCount">0</span>
                            </div>
                            <div class="price-stat">
                                <span class="price-stat-label">إجمالي المواد</span>
                                <span class="price-stat-value" id="totalMaterialsCountPrice">0</span>
                            </div>
                        </div>
                    </div>
                    <div class="price-search">
                        <i class="fas fa-search"></i>
                        <input type="text" id="priceSearchInput" class="price-search-input" placeholder="بحث عن مادة...">
                    </div>
                    <div class="price-categories">
                        <button class="price-cat-btn active" data-cat="all">الكل</button>
                        <button class="price-cat-btn" data-cat="main">⭐ أساسيات</button>
                        <button class="price-cat-btn" data-cat="extra">➕ إضافي</button>
                        <button class="price-cat-btn" data-cat="bags">🛍️ أكياس</button>
                    </div>
                    <div class="price-list-container" id="priceListContainer">
                        <div class="price-loading">جاري التحميل...</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="saveAllPricesBtn" class="btn-save">حفظ الكل</button>
                    <button id="closePriceModalBtn2" class="btn-cancel">إغلاق</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('closePriceModalBtn')?.addEventListener('click', closePriceModal);
    document.getElementById('closePriceModalBtn2')?.addEventListener('click', closePriceModal);
    document.getElementById('saveAllPricesBtn')?.addEventListener('click', saveAllPrices);
    
    var searchInput = document.getElementById('priceSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            renderPriceList();
        });
    }
    
    // ربط أزرار التصنيف
    var catBtns = document.querySelectorAll('.price-cat-btn');
    for (var i = 0; i < catBtns.length; i++) {
        catBtns[i].addEventListener('click', function() {
            var btns = document.querySelectorAll('.price-cat-btn');
            for (var j = 0; j < btns.length; j++) {
                btns[j].classList.remove('active');
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
    
    var searchValue = document.getElementById('priceSearchInput')?.value.toLowerCase() || '';
    var activeCat = document.querySelector('.price-cat-btn.active')?.getAttribute('data-cat') || 'all';
    
    // تصفية المواد حسب البحث والتصنيف
    var filteredMaterials = [];
    for (var i = 0; i < allMaterialsList.length; i++) {
        var material = allMaterialsList[i];
        var category = getMaterialCategory(material);
        
        // تطبيق تصفية التصنيف
        if (activeCat !== 'all' && category !== activeCat) {
            continue;
        }
        
        // تطبيق تصفية البحث
        if (searchValue && !material.toLowerCase().includes(searchValue)) {
            continue;
        }
        
        filteredMaterials.push(material);
    }
    
    if (filteredMaterials.length === 0) {
        container.innerHTML = '<div class="price-empty"><i class="fas fa-search"></i><br>لا توجد نتائج</div>';
        updatePriceSummary();
        return;
    }
    
    var html = '';
    for (var i = 0; i < filteredMaterials.length; i++) {
        var material = filteredMaterials[i];
        var currentPrice = getMaterialPrice(material);
        var priceDisplay = currentPrice > 0 ? formatCurrency(currentPrice) : 'لم يحدد';
        var category = getMaterialCategory(material);
        var categoryIcon = '';
        var categoryClass = '';
        
        if (category === 'main') {
            categoryIcon = '⭐';
            categoryClass = 'price-cat-main';
        } else if (category === 'extra') {
            categoryIcon = '➕';
            categoryClass = 'price-cat-extra';
        } else if (category === 'bags') {
            categoryIcon = '🛍️';
            categoryClass = 'price-cat-bags';
        }
        
        html += `
            <div class="price-item ${categoryClass}" data-material="${escapeHtml(material)}">
                <div class="price-item-info">
                    <div class="price-item-name">
                        <span class="price-cat-icon">${categoryIcon}</span>
                        <span>${escapeHtml(material)}</span>
                    </div>
                    <div class="price-item-details">
                        <span class="price-item-unit">سعر الكيلو (ل.س)</span>
                    </div>
                </div>
                <div class="price-item-input">
                    <input type="number" class="price-input" data-material="${escapeHtml(material)}" value="${currentPrice > 0 ? currentPrice : ''}" placeholder="0" step="100" min="0">
                    <span class="price-current">${priceDisplay}</span>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // ربط أحداث تغيير الأسعار
    var priceInputs = container.querySelectorAll('.price-input');
    for (var i = 0; i < priceInputs.length; i++) {
        priceInputs[i].addEventListener('change', function(e) {
            var materialName = this.getAttribute('data-material');
            var value = this.value;
            updateMaterialPrice(materialName, value);
            updatePriceSummary();
            
            // تحديث العرض الحالي
            var priceDisplay = this.parentElement.querySelector('.price-current');
            var newPrice = getMaterialPrice(materialName);
            if (priceDisplay) {
                priceDisplay.textContent = newPrice > 0 ? formatCurrency(newPrice) : 'لم يحدد';
            }
        });
    }
    
    updatePriceSummary();
}

// تحديث ملخص الأسعار
function updatePriceSummary() {
    var summaryContainer = document.getElementById('priceSummary');
    if (!summaryContainer) return;
    
    var totalValue = calculateTotalValue();
    var pricedCount = 0;
    for (var key in materialPrices) {
        if (materialPrices[key] > 0) pricedCount++;
    }
    
    var pricedCountEl = document.getElementById('pricedCount');
    var totalMaterialsCountEl = document.getElementById('totalMaterialsCountPrice');
    
    if (pricedCountEl) pricedCountEl.innerText = pricedCount;
    if (totalMaterialsCountEl) totalMaterialsCountEl.innerText = allMaterialsList.length;
    
    summaryContainer.innerHTML = `
        <div class="price-total-card">
            <i class="fas fa-chart-line"></i>
            <div class="price-total-info">
                <span class="price-total-label">القيمة الإجمالية للمخزون</span>
                <span class="price-total-value" id="totalInventoryValue">${totalValue.formattedTotal}</span>
            </div>
        </div>
        <div class="price-stats">
            <div class="price-stat">
                <span class="price-stat-label">عدد المواد المسعرة</span>
                <span class="price-stat-value">${pricedCount}</span>
            </div>
            <div class="price-stat">
                <span class="price-stat-label">إجمالي المواد</span>
                <span class="price-stat-value">${allMaterialsList.length}</span>
            </div>
        </div>
    `;
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

// تصدير الدوال
window.loadPrices = loadPrices;
window.savePrices = savePrices;
window.updateMaterialPrice = updateMaterialPrice;
window.getMaterialPrice = getMaterialPrice;
window.calculateTotalValue = calculateTotalValue;
window.formatCurrency = formatCurrency;
window.openPriceModal = openPriceModal;
window.closePriceModal = closePriceModal;
window.renderPriceList = renderPriceList;
window.updatePriceSummary = updatePriceSummary;
window.loadAllMaterialsFromPresets = loadAllMaterialsFromPresets;
