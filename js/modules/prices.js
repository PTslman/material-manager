// ==================== نظام إدارة الأسعار المتقدم ====================

const PriceSystem = {
    isOpen: false,
    window: null,
    data: {
        prices: {},
        allMaterials: [],
        currentFilter: '',
        currentCategory: 'all'
    },
    
    loadAllMaterials() {
        const set = new Set();
        if (typeof importantItemsList !== 'undefined') {
            importantItemsList.forEach(item => set.add(item));
        }
        if (typeof extraItemsList !== 'undefined') {
            extraItemsList.forEach(item => set.add(item));
        }
        if (typeof bagTypesList !== 'undefined') {
            bagTypesList.forEach(item => set.add(item));
        }
        this.data.allMaterials = Array.from(set).sort((a, b) => a.localeCompare(b));
    },
    
    load() {
        try {
            const saved = localStorage.getItem('material_prices');
            if (saved) this.data.prices = JSON.parse(saved);
        } catch(e) {
            this.data.prices = {};
        }
        return this.data.prices;
    },
    
    save() {
        try {
            localStorage.setItem('material_prices', JSON.stringify(this.data.prices));
        } catch(e) {}
    },
    
    updatePrice(name, price) {
        const numPrice = parseFloat(price);
        if (price === undefined || price === null || price === '' || isNaN(numPrice) || numPrice < 0) {
            delete this.data.prices[name];
        } else {
            this.data.prices[name] = numPrice;
        }
        this.save();
        if (typeof calculateAIMetrics === 'function') calculateAIMetrics();
    },
    
    getPrice(name) {
        return this.data.prices[name] || 0;
    },
    
    openModal() {
        this.load();
        this.loadAllMaterials();
        
        if (this.window && !this.window.closed) {
            this.window.focus();
            return;
        }
        
        const features = 'width=850,height=750,left=200,top=100,resizable=yes,scrollbars=yes,dir=rtl';
        this.window = window.open('', 'PriceManager', features);
        
        if (!this.window) {
            showToastMessage('يرجى السماح بالنوافذ المنبثقة', true);
            return;
        }
        
        this.window.document.write(this._getHTML());
        this.window.document.close();
        setTimeout(() => this._updateDisplay(), 200);
    },
    
    _getHTML() {
        return `<!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            var parent = window.opener;
            document.getElementById('saveBtn').addEventListener('click', function() {
                if (parent && parent.PriceSystem) {
                    parent.PriceSystem.save();
                    if (typeof parent.calculateAIMetrics === 'function') parent.calculateAIMetrics();
                }
                window.close();
            });
            var searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    if (parent && parent.PriceSystem) {
                        parent.PriceSystem.data.currentFilter = this.value;
                        parent.PriceSystem._updateDisplay();
                    }
                });
            }
            document.querySelectorAll('.tab').forEach(function(tab) {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
                    this.classList.add('active');
                    if (parent && parent.PriceSystem) {
                        parent.PriceSystem.data.currentCategory = this.dataset.cat;
                        parent.PriceSystem._updateDisplay();
                    }
                });
            });
            if (parent && parent.PriceSystem) {
                parent.PriceSystem._updateDisplay();
            }
        </script>
        </body>
        </html>`;
    },
    
    _updateDisplay() {
        if (!this.window || this.window.closed) return;
        
        const pricedCount = Object.values(this.data.prices).filter(p => p > 0).length;
        const totalValue = this._calculateTotalValue();
        const filteredItems = this._getFilteredItems();
        
        const data = {
            totalMaterials: this.data.allMaterials.length,
            pricedCount: pricedCount,
            totalValue: totalValue.formattedTotal,
            items: filteredItems
        };
        
        const doc = this.window.document;
        const container = doc.getElementById('itemsList');
        if (container) {
            if (data.items.length === 0) {
                container.innerHTML = '<div class="empty">لا توجد نتائج</div>';
            } else {
                container.innerHTML = data.items.map(item => `
                    <div class="item-row">
                        <div class="item-name"><span>${item.icon}</span><span>${this._escapeHtml(item.name)}</span></div>
                        <div class="item-price">
                            <input type="number" class="price-input" data-material="${this._escapeHtml(item.name)}" value="${item.price > 0 ? item.price : ''}" placeholder="سعر الكيلو" step="100" min="0">
                            <span>ل.س</span>
                        </div>
                    </div>
                `).join('');
                
                doc.querySelectorAll('.price-input').forEach(input => {
                    input.addEventListener('change', () => {
                        this.updatePrice(input.dataset.material, input.value);
                        this._updateDisplay();
                    });
                });
            }
        }
        
        const totalEl = doc.getElementById('totalCount');
        const pricedEl = doc.getElementById('pricedCount');
        const valueEl = doc.getElementById('totalValue');
        if (totalEl) totalEl.innerText = data.totalMaterials;
        if (pricedEl) pricedEl.innerText = data.pricedCount;
        if (valueEl) valueEl.innerText = data.totalValue;
    },
    
    _getFilteredItems() {
        const search = (this.data.currentFilter || '').toLowerCase();
        const category = this.data.currentCategory || 'all';
        const result = [];
        
        for (const name of this.data.allMaterials) {
            const cat = this._getCategory(name);
            const icon = cat === 'main' ? '⭐' : cat === 'extra' ? '➕' : cat === 'bags' ? '🛍️' : '';
            if (category !== 'all' && cat !== category) continue;
            if (search && !name.toLowerCase().includes(search)) continue;
            result.push({ name, price: this.getPrice(name), icon });
        }
        return result;
    },
    
    _getCategory(name) {
        if (typeof importantItemsList !== 'undefined' && importantItemsList.indexOf(name) !== -1) return 'main';
        if (typeof extraItemsList !== 'undefined' && extraItemsList.indexOf(name) !== -1) return 'extra';
        if (typeof bagTypesList !== 'undefined' && bagTypesList.indexOf(name) !== -1) return 'bags';
        return 'other';
    },
    
    _calculateTotalValue() {
        if (!window.allMaterials) return { total: 0, formattedTotal: '0 ل.س' };
        let total = 0;
        for (const m of window.allMaterials) {
            if (m.priority === 'tawsaya') continue;
            const price = this.getPrice(m.name);
            const qty = window.aiEngine ? window.aiEngine.convertToKg(m.quantity, m.unitType) : (m.quantity || 0);
            total += qty * price;
        }
        return { total, formattedTotal: Math.round(total).toLocaleString() + ' ل.س' };
    },
    
    _escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }
};

// تصدير الدوال
window.getMaterialPrice = (name) => PriceSystem.getPrice(name);
window.loadPrices = () => PriceSystem.load();
window.savePrices = () => PriceSystem.save();
window.updateMaterialPrice = (name, price) => PriceSystem.updatePrice(name, price);
window.openPriceModal = () => PriceSystem.openModal();
window.PriceSystem = PriceSystem;
