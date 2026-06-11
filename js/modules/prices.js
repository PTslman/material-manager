// ==================== نظام إدارة الأسعار ====================

var materialPrices = {};
var priceModalOpen = false;

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
    if (!window.allMaterials) return 0;
    
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
                totalValue: itemValue
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
    
    var modal = document.getElementById('priceModal');
    if (!modal) {
        createPriceModal();
        modal = document.getElementById('priceModal');
    }
    
    renderPriceList();
    modal.classList.add('active');
    priceModalOpen = true;
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
                    </div>
                    <div class="price-search">
                        <i class="fas fa-search"></i>
                        <input type="text" id="priceSearchInput" class="price-search-input" placeholder="بحث عن مادة...">
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
            renderPriceList(e.target.value);
        });
    }
}

// إغلاق نافذة الأسعار
function closePriceModal() {
    var modal = document.getElementById('priceModal');
    if (modal) modal.classList.remove('active');
    priceModalOpen = false;
}

// عرض قائمة الأسعار
function renderPriceList(filter) {
    var container = document.getElementById('priceListContainer');
    if (!container) return;
    
    if (!window.allMaterials || window.allMaterials.length === 0) {
        container.innerHTML = '<div class="price-empty"><i class="fas fa-box-open"></i><br>لا توجد مواد في المخزون</div>';
        return;
    }
    
    // جمع المواد الفريدة (بدون تكرار)
    var uniqueMaterials = {};
    for (var i = 0; i < window.allMaterials.length; i++) {
        var m = window.allMaterials[i];
        if (m.priority === 'tawsaya') continue;
        if (!uniqueMaterials[m.name]) {
            uniqueMaterials[m.name] = {
                name: m.name,
                unit: m.unitType,
                quantity: m.quantity
            };
        }
    }
    
    var materialsList = Object.values(uniqueMaterials);
    materialsList.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    
    if (filter) {
        var filterLower = filter.toLowerCase();
        materialsList = materialsList.filter(function(m) {
            return m.name.toLowerCase().includes(filterLower);
        });
    }
    
    if (materialsList.length === 0) {
        container.innerHTML = '<div class="price-empty"><i class="fas fa-search"></i><br>لا توجد نتائج</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < materialsList.length; i++) {
        var m = materialsList[i];
        var currentPrice = getMaterialPrice(m.name);
        var priceDisplay = currentPrice > 0 ? formatCurrency(currentPrice) : 'لم يحدد';
        
        html += `
            <div class="price-item" data-material="${escapeHtml(m.name)}">
                <div class="price-item-info">
                    <div class="price-item-name">
                        <i class="fas fa-box"></i>
                        <span>${escapeHtml(m.name)}</span>
                    </div>
                    <div class="price-item-details">
                        <span class="price-item-unit">سعر الكيلو (ل.س)</span>
                    </div>
                </div>
                <div class="price-item-input">
                    <input type="number" class="price-input" data-material="${escapeHtml(m.name)}" value="${currentPrice > 0 ? currentPrice : ''}" placeholder="0" step="100" min="0">
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
                <span class="price-stat-value">${Object.keys(materialPrices).length}</span>
            </div>
            <div class="price-stat">
                <span class="price-stat-label">إجمالي الكمية</span>
                <span class="price-stat-value">${totalValue.breakdown.reduce(function(sum, item) { return sum + item.quantityInKg; }, 0).toFixed(2)} كجم</span>
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
}

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
