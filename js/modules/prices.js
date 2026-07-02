// =========================================
// Price Management Module
// =========================================

const PriceManager = {
    // Prices cache
    prices: {},
    priceListener: null,
    
    // Load prices from Firebase
    loadPrices: function() {
        // First load from local
        this.loadFromLocal();
        
        // Then sync with Firebase
        if (!isFirebaseReady()) {
            console.warn('Firebase not ready for prices');
            return;
        }
        
        const db = getDB();
        if (!db) return;
        
        // Detach previous listener
        if (this.priceListener) {
            this.priceListener();
            this.priceListener = null;
        }
        
        this.priceListener = db.collection(PRICES_COLLECTION)
            .onSnapshot(function(snapshot) {
                const prices = {};
                snapshot.forEach(function(doc) {
                    const data = doc.data();
                    prices[doc.id] = data.price || 0;
                });
                
                PriceManager.prices = prices;
                PriceManager.saveToLocal(prices);
                
                // Update UI if price modal is open
                if (document.getElementById('priceModal').classList.contains('active')) {
                    PriceManager.renderPriceList();
                }
                
                // Update analysis
                if (typeof Materials !== 'undefined') {
                    Materials.updateAnalysis();
                }
            }, function(error) {
                console.error('Price listener error:', error);
            });
    },
    
    // Load from local storage
    loadFromLocal: function() {
        try {
            const saved = localStorage.getItem('material_prices');
            if (saved) {
                this.prices = JSON.parse(saved) || {};
            }
        } catch (e) {
            console.warn('Load prices from local error:', e);
            this.prices = {};
        }
    },
    
    // Save to local storage
    saveToLocal: function(prices) {
        try {
            localStorage.setItem('material_prices', JSON.stringify(prices || this.prices));
        } catch (e) {
            console.warn('Save prices to local error:', e);
        }
    },
    
    // Get price for material
    getPrice: function(name) {
        if (!name) return 0;
        return this.prices[name] || 0;
    },
    
    // Update price for material
    updatePrice: function(name, price) {
        if (!name) return;
        
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
            UI.showNotification('سعر غير صحيح', 'error');
            return;
        }
        
        if (priceNum === 0) {
            delete this.prices[name];
        } else {
            this.prices[name] = priceNum;
        }
        
        this.saveToLocal();
        
        // Sync to Firebase
        if (isFirebaseReady()) {
            const db = getDB();
            if (db) {
                db.collection(PRICES_COLLECTION).doc(name).set({
                    price: priceNum,
                    updatedAt: Utils.getTimestamp()
                })
                .catch(function(error) {
                    console.error('Save price error:', error);
                });
            }
        }
        
        // Update UI
        if (document.getElementById('priceModal').classList.contains('active')) {
            this.renderPriceList();
        }
        
        Materials.updateAnalysis();
    },
    
    // Format currency
    formatCurrency: function(value) {
        if (value === undefined || value === null || isNaN(value)) return '0 ل.س';
        return Math.round(value).toLocaleString() + ' ل.س';
    },
    
    // Open price modal
    openModal: function() {
        UI.showModal('priceModal');
        this.renderPriceList();
        this.updatePriceStats();
    },
    
    // Render price list
    renderPriceList: function() {
        const container = document.getElementById('priceList');
        if (!container) return;
        
        const search = document.getElementById('priceSearch');
        const filter = document.getElementById('priceFilter');
        
        const searchTerm = search ? search.value.toLowerCase() : '';
        const filterValue = filter ? filter.value : 'all';
        
        // Get all materials
        const materials = Materials.getAllMaterials() || [];
        
        // Filter materials
        let filtered = materials;
        if (filterValue !== 'all') {
            filtered = filtered.filter(function(m) {
                return m.section === filterValue;
            });
        }
        if (searchTerm) {
            filtered = filtered.filter(function(m) {
                return m.name.toLowerCase().includes(searchTerm);
            });
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:1rem;">لا توجد مواد</p>';
            return;
        }
        
        container.innerHTML = filtered.map(function(material) {
            const price = PriceManager.getPrice(material.name);
            return '<div class="price-item">' +
                '<span class="price-item-name">' + Utils.capitalize(material.name) + '</span>' +
                '<input type="number" class="price-item-input" ' +
                'value="' + (price || '') + '" ' +
                'onchange="PriceManager.updatePriceFromInput(\'' + material.name.replace(/'/g, "\\'") + '\', this.value)" ' +
                'placeholder="سعر" step="0.01" min="0" />' +
                '<span class="price-item-unit">ل.س/كغ</span>' +
                '</div>';
        }).join('');
        
        this.updatePriceStats();
    },
    
    // Update price from input
    updatePriceFromInput: function(name, value) {
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) {
            // Don't update if invalid
            return;
        }
        this.updatePrice(name, price);
    },
    
    // Update price stats
    updatePriceStats: function() {
        const materials = Materials.getAllMaterials() || [];
        let pricedCount = 0;
        let totalValue = 0;
        
        materials.forEach(function(m) {
            const price = PriceManager.getPrice(m.name);
            if (price && price > 0) {
                pricedCount++;
                const kg = AIEngine.convertToKg(m.quantity, m.unit);
                totalValue += kg * price;
            }
        });
        
        // Apply 35% discount
        totalValue = totalValue * 0.65;
        
        const pricedEl = document.getElementById('pricedCount');
        if (pricedEl) pricedEl.textContent = pricedCount;
        
        const totalEl = document.getElementById('priceTotalValue');
        if (totalEl) totalEl.textContent = this.formatCurrency(totalValue);
    },
    
    // Save all prices
    saveAllPrices: function() {
        const inputs = document.querySelectorAll('.price-item-input');
        inputs.forEach(function(input) {
            const price = parseFloat(input.value);
            if (!isNaN(price) && price >= 0) {
                const name = input.closest('.price-item').querySelector('.price-item-name').textContent;
                PriceManager.updatePrice(name, price);
            }
        });
        
        UI.showNotification('تم حفظ جميع الأسعار بنجاح', 'success');
        this.renderPriceList();
    }
};

// Make PriceManager globally accessible
window.PriceManager = PriceManager;
