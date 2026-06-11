// ==================== نظام إدارة الأسعار ====================

var materialPrices = {};
var allMaterialsList = [];
var priceModalWindow = null;

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
    return materialPrices;
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
        updatePriceWindowDisplay();
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

// حساب القيمة الإجمالية
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

function formatCurrency(value) {
    return Math.round(value).toLocaleString() + ' ل.س';
}

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

// فتح نافذة الأسعار
function openPriceModal() {
    loadPrices();
    loadAllMaterialsFromPresets();
    
    if (priceModalWindow && !priceModalWindow.closed) {
        priceModalWindow.focus();
        return;
    }
    
    var windowFeatures = 'width=850,height=750,left=200,top=100,resizable=yes,scrollbars=yes,dir=rtl';
    priceModalWindow = window.open('', 'PriceManager', windowFeatures);
    
    if (!priceModalWindow) {
        if (typeof showToastMessage === 'function') {
            showToastMessage('يرجى السماح بالنوافذ المنبثقة', true);
        }
        return;
    }
    
    var htmlContent = getPriceWindowHTML();
    priceModalWindow.document.write(htmlContent);
    priceModalWindow.document.close();
    
    setTimeout(function() {
        updatePriceWindowDisplay();
        bindPriceWindowEvents();
    }, 200);
}

function getPriceWindowHTML() {
    return `<!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إدارة أسعار المواد</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', 'Tajawal', sans-serif; background: #f0fdf4; padding: 20px; direction: rtl; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #059669, #047857); border-radius: 24px; padding: 24px 32px; margin-bottom: 24px; color: white; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
            .header h1 { font-size: 24px; margin-bottom: 4px; }
            .header p { font-size: 13px; opacity: 0.8; }
            .close-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 20px; border-radius: 999px; cursor: pointer; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
            .stat-card { background: white; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .stat-icon { width: 56px; height: 56px; background: #ecfdf5; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
            .stat-icon i { font-size: 28px; color: #059669; }
            .stat-label { font-size: 12px; color: #64748b; display: block; margin-bottom: 4px; }
            .stat-value { font-size: 28px; font-weight: 800; color: #1e293b; }
            .search-section { margin-bottom: 20px; }
            .search-wrapper { position: relative; }
            .search-wrapper i { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
            .search-input { width: 100%; padding: 14px 45px 14px 16px; border: 1.5px solid #e2e8f0; border-radius: 999px; font-size: 14px; outline: none; }
            .search-input:focus { border-color: #10b981; }
            .tabs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
            .tab { padding: 8px 20px; border-radius: 999px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-size: 13px; cursor: pointer; }
            .tab.active { background: #10b981; color: white; border-color: #10b981; }
            .table { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .table-header { display: flex; justify-content: space-between; padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; }
            .table-header-name { flex: 1; text-align: right; }
            .table-header-price { width: 200px; text-align: center; }
            .items-list { max-height: 450px; overflow-y: auto; }
            .item-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f1f5f9; }
            .item-row:hover { background: #f8fafc; }
            .item-name { flex: 1; display: flex; align-items: center; gap: 10px; font-weight: 500; }
            .item-price { width: 200px; display: flex; align-items: center; gap: 10px; }
            .price-input { flex: 1; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 999px; font-size: 13px; text-align: center; outline: none; }
            .price-input:focus { border-color: #10b981; }
            .footer { margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; }
            .btn-save { background: linear-gradient(135deg, #059669, #047857); color: white; border: none; padding: 12px 28px; border-radius: 999px; font-weight: 600; cursor: pointer; }
            .btn-cancel { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 12px 28px; border-radius: 999px; cursor: pointer; }
            .empty { text-align: center; padding: 60px; color: #94a3b8; }
            @media (max-width: 768px) {
                .stats { grid-template-columns: 1fr; }
                .table-header { display: none; }
                .item-row { flex-direction: column; gap: 10px; }
                .item-price { width: 100%; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div><h1><i class="fas fa-tags"></i> إدارة أسعار المواد</h1><p>تحديد أسعار المواد بالكيلوغرام (ليرة سورية)</p></div>
                <button class="close-btn" onclick="window.close()"><i class="fas fa-times"></i> إغلاق</button>
            </div>
            
            <div class="stats" id="statsContainer">
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-boxes"></i></div><div><span class="stat-label">إجمالي المواد</span><span class="stat-value" id="totalCount">0</span></div></div>
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-tag"></i></div><div><span class="stat-label">المواد المسعرة</span><span class="stat-value" id="pricedCount">0</span></div></div>
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-chart-line"></i></div><div><span class="stat-label">القيمة الإجمالية</span><span class="stat-value" id="totalValue">0</span></div></div>
            </div>
            
            <div class="search-section"><div class="search-wrapper"><i class="fas fa-search"></i><input type="text" id="searchInput" class="search-input" placeholder="بحث عن مادة..."></div></div>
            
            <div class="tabs" id="tabsContainer">
                <button class="tab active" data-cat="all">الكل</button>
                <button class="tab" data-cat="main">⭐ أساسيات</button>
                <button class="tab" data-cat="extra">➕ إضافي</button>
                <button class="tab" data-cat="bags">🛍️ أكياس</button>
            </div>
            
            <div class="table"><div class="table-header"><span class="table-header-name">اسم المادة</span><span class="table-header-price">السعر (ل.س/كجم)</span></div>
            <div id="itemsList" class="items-list"><div class="empty">جاري التحميل...</div></div></div>
            
            <div class="footer"><button class="btn-cancel" onclick="window.close()">إلغاء</button><button class="btn-save" id="saveBtn">حفظ الكل وإغلاق</button></div>
        </div>
        <script>
            var parentWindow = window.opener;
            
            function updateDisplay(data) {
                document.getElementById('totalCount').innerText = data.totalMaterials || 0;
                document.getElementById('pricedCount').innerText = data.pricedCount || 0;
                document.getElementById('totalValue').innerText = data.totalValue || '0 ل.س';
                var container = document.getElementById('itemsList');
                if (!data.items || data.items.length === 0) { container.innerHTML = '<div class="empty">لا توجد نتائج</div>'; return; }
                var html = '';
                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i];
                    html += '<div class="item-row"><div class="item-name"><span>' + item.icon + '</span><span>' + escapeHtml(item.name) + '</span></div>' +
                        '<div class="item-price"><input type="number" class="price-input" data-material="' + escapeHtml(item.name) + '" value="' + (item.price > 0 ? item.price : '') + '" placeholder="سعر الكيلو" step="100" min="0"><span>ل.س</span></div></div>';
                }
                container.innerHTML = html;
                document.querySelectorAll('.price-input').forEach(function(input) {
                    input.addEventListener('change', function() { if (parentWindow) parentWindow.updateMaterialPriceFromWindow(this.dataset.material, this.value); });
                });
            }
            
            function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, function(m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]; }); }
            
            document.getElementById('saveBtn').addEventListener('click', function() { if (parentWindow) parentWindow.saveAllPricesAndClose(); window.close(); });
            
            var searchInput = document.getElementById('searchInput');
            if (searchInput) { searchInput.addEventListener('input', function() { if (parentWindow) parentWindow.filterPriceList(this.value); }); }
            
            document.querySelectorAll('.tab').forEach(function(tab) {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
                    this.classList.add('active');
                    if (parentWindow) parentWindow.filterPriceListByCategory(this.dataset.cat);
                });
            });
            
            if (parentWindow && parentWindow.getPriceDisplayData) { updateDisplay(parentWindow.getPriceDisplayData()); }
        </script>
    </body>
    </html>`;
}

function updatePriceWindowDisplay() {
    if (!priceModalWindow || priceModalWindow.closed) return;
    
    var pricedCount = 0;
    for (var key in materialPrices) { if (materialPrices[key] > 0) pricedCount++; }
    var totalValue = calculateTotalValue();
    
    var filteredItems = [];
    var searchValue = (priceWindowData && priceWindowData.currentFilter) || '';
    var activeCat = (priceWindowData && priceWindowData.currentCategory) || 'all';
    
    for (var i = 0; i < allMaterialsList.length; i++) {
        var material = allMaterialsList[i];
        var category = getMaterialCategory(material);
        var icon = category === 'main' ? '⭐' : (category === 'extra' ? '➕' : (category === 'bags' ? '🛍️' : ''));
        if (activeCat !== 'all' && category !== activeCat) continue;
        if (searchValue && !material.toLowerCase().includes(searchValue.toLowerCase())) continue;
        filteredItems.push({ name: material, price: getMaterialPrice(material), icon: icon });
    }
    
    var displayData = { totalMaterials: allMaterialsList.length, pricedCount: pricedCount, totalValue: totalValue.formattedTotal, items: filteredItems };
    
    if (priceModalWindow && priceModalWindow.updateDisplay) {
        priceModalWindow.updateDisplay(displayData);
    } else if (priceModalWindow && priceModalWindow.document) {
        var container = priceModalWindow.document.getElementById('itemsList');
        if (container) {
            if (filteredItems.length === 0) { container.innerHTML = '<div class="empty">لا توجد نتائج</div>'; }
            else {
                var html = '';
                for (var i = 0; i < filteredItems.length; i++) {
                    var item = filteredItems[i];
                    html += '<div class="item-row"><div class="item-name"><span>' + item.icon + '</span><span>' + escapeHtml(item.name) + '</span></div>' +
                        '<div class="item-price"><input type="number" class="price-input" data-material="' + escapeHtml(item.name) + '" value="' + (item.price > 0 ? item.price : '') + '" placeholder="سعر الكيلو" step="100" min="0"><span>ل.س</span></div></div>';
                }
                container.innerHTML = html;
                priceModalWindow.document.querySelectorAll('.price-input').forEach(function(input) {
                    input.addEventListener('change', function() { updateMaterialPrice(this.dataset.material, this.value); });
                });
            }
        }
        var totalEl = priceModalWindow.document.getElementById('totalCount');
        var pricedEl = priceModalWindow.document.getElementById('pricedCount');
        var valueEl = priceModalWindow.document.getElementById('totalValue');
        if (totalEl) totalEl.innerText = allMaterialsList.length;
        if (pricedEl) pricedEl.innerText = pricedCount;
        if (valueEl) valueEl.innerText = totalValue.formattedTotal;
    }
}

var priceWindowData = { currentFilter: '', currentCategory: 'all' };

function filterPriceList(searchValue) { priceWindowData.currentFilter = searchValue; updatePriceWindowDisplay(); }
function filterPriceListByCategory(category) { priceWindowData.currentCategory = category; updatePriceWindowDisplay(); }
function getPriceDisplayData() { var pc = 0; for (var k in materialPrices) { if (materialPrices[k] > 0) pc++; } var tv = calculateTotalValue(); var items = []; var cat = priceWindowData.currentCategory || 'all'; var search = (priceWindowData.currentFilter || '').toLowerCase(); for (var i = 0; i < allMaterialsList.length; i++) { var m = allMaterialsList[i]; var c = getMaterialCategory(m); var icon = c === 'main' ? '⭐' : (c === 'extra' ? '➕' : (c === 'bags' ? '🛍️' : '')); if (cat !== 'all' && c !== cat) continue; if (search && !m.toLowerCase().includes(search)) continue; items.push({ name: m, price: getMaterialPrice(m), icon: icon }); } return { totalMaterials: allMaterialsList.length, pricedCount: pc, totalValue: tv.formattedTotal, items: items }; }
function updateMaterialPriceFromWindow(name, price) { updateMaterialPrice(name, price); updatePriceWindowDisplay(); }
function saveAllPricesAndClose() { savePrices(); if (typeof calculateAIMetrics === 'function') calculateAIMetrics(); }

function bindPriceWindowEvents() { if (!priceModalWindow || priceModalWindow.closed) return; var searchInput = priceModalWindow.document.getElementById('searchInput'); if (searchInput) { searchInput.oninput = function(e) { filterPriceList(e.target.value); }; } var tabs = priceModalWindow.document.querySelectorAll('.tab'); for (var i = 0; i < tabs.length; i++) { tabs[i].onclick = function() { var btns = priceModalWindow.document.querySelectorAll('.tab'); for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active'); this.classList.add('active'); filterPriceListByCategory(this.dataset.cat); }; } }

window.getMaterialPrice = getMaterialPrice;
window.getEstimatedPrice = getEstimatedPrice;
window.loadPrices = loadPrices;
window.savePrices = savePrices;
window.updateMaterialPrice = updateMaterialPrice;
window.calculateTotalValue = calculateTotalValue;
window.formatCurrency = formatCurrency;
window.openPriceModal = openPriceModal;
window.filterPriceList = filterPriceList;
window.filterPriceListByCategory = filterPriceListByCategory;
window.getPriceDisplayData = getPriceDisplayData;
window.updateMaterialPriceFromWindow = updateMaterialPriceFromWindow;
window.saveAllPricesAndClose = saveAllPricesAndClose;
