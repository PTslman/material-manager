// ==================== محرك الذكاء الاصطناعي المتقدم ====================

class AIEngine {
    constructor() {
        this.learningData = this.loadLearningData();
        this.pricesCache = {};
        this.pricesLoaded = false;
        this.discountRate = 0.35;
        this.initialized = false;
        this.analysisHistory = [];
        this._init();
    }

    _init() {
        this.initialized = true;
        console.log('AI Engine initialized');
    }

    loadLearningData() {
        try {
            const saved = localStorage.getItem('ai_learning_data');
            return saved ? JSON.parse(saved) : {
                consumptionPatterns: {},
                materialHistory: {},
                userInteractions: []
            };
        } catch(e) {
            return {
                consumptionPatterns: {},
                materialHistory: {},
                userInteractions: []
            };
        }
    }

    saveLearningData() {
        try {
            localStorage.setItem('ai_learning_data', JSON.stringify(this.learningData));
        } catch(e) {}
    }

    convertToKg(quantity, unit) {
        if (!quantity && quantity !== 0) return 0;
        const qty = parseFloat(quantity);
        if (isNaN(qty)) return 0;
        
        const conversions = {
            'kg': 1,
            'half': 0.5,
            'quarter': 0.25,
            'oke': 0.128,
            'box': 0.5,
            'piece': 0.1,
            'bag': 0.05
        };
        
        const result = qty * (conversions[unit] || 1);
        return Math.round(result * 1000) / 1000;
    }

    formatNumber(value) {
        if (value === undefined || value === null) return '0';
        if (Number.isInteger(value)) return value.toString();
        const rounded = Math.round(value * 10) / 10;
        if (Number.isInteger(rounded)) return rounded.toString();
        return rounded.toFixed(1);
    }

    formatCurrency(value) {
        if (value === undefined || value === null) return '0 ل.س';
        return Math.round(value).toLocaleString() + ' ل.س';
    }

    async fetchPricesFromFirebase() {
        if (!window.pricesCollection) {
            return false;
        }
        
        try {
            const snapshot = await window.pricesCollection.get();
            const prices = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                prices[doc.id] = data.price || 0;
            });
            this.pricesCache = prices;
            this.pricesLoaded = true;
            return true;
        } catch(e) {
            return false;
        }
    }

    getPrice(materialName) {
        return this.pricesCache[materialName] || 0;
    }

    applyDiscount(price) {
        return price * (1 - this.discountRate);
    }

    analyzeInventorySync(materials, externalGetPriceFunction) {
        if (!materials || materials.length === 0) {
            return this._getEmptyAnalysis();
        }
        
        const result = {
            totalWeight: 0,
            totalValueBeforeDiscount: 0,
            totalValueAfterDiscount: 0,
            lowStockCount: 0,
            lowStockList: [],
            priceBreakdown: [],
            tawsayaCount: 0,
            materialsCount: 0
        };

        for (const material of materials) {
            const isTawsaya = material.priority === 'tawsaya';
            const quantityInKg = this.convertToKg(material.quantity, material.unitType);
            
            if (!isTawsaya) {
                result.materialsCount++;
                result.totalWeight += quantityInKg;
                
                if (quantityInKg === 0) {
                    result.lowStockCount++;
                    result.lowStockList.push({
                        name: material.name,
                        quantity: material.quantity,
                        unit: material.unitType,
                        weight: this.formatNumber(quantityInKg)
                    });
                }
                
                const price = this.getPrice(material.name) || 
                             (typeof externalGetPriceFunction === 'function' ? externalGetPriceFunction(material.name) || 0 : 0);
                
                const itemValueBeforeDiscount = quantityInKg * price;
                const itemValueAfterDiscount = itemValueBeforeDiscount * (1 - this.discountRate);
                
                result.totalValueBeforeDiscount += itemValueBeforeDiscount;
                result.totalValueAfterDiscount += itemValueAfterDiscount;
                
                if (price > 0 && quantityInKg > 0) {
                    result.priceBreakdown.push({
                        name: material.name,
                        quantity: material.quantity,
                        unit: material.unitType,
                        quantityInKg: this.formatNumber(quantityInKg),
                        pricePerKg: price,
                        totalValueBeforeDiscount: Math.round(itemValueBeforeDiscount),
                        totalValueAfterDiscount: Math.round(itemValueAfterDiscount),
                        formattedValueBefore: this.formatCurrency(itemValueBeforeDiscount),
                        formattedValueAfter: this.formatCurrency(itemValueAfterDiscount)
                    });
                }
            } else {
                result.tawsayaCount++;
            }
        }
        
        result.priceBreakdown.sort((a, b) => b.totalValueBeforeDiscount - a.totalValueBeforeDiscount);
        
        this.analysisHistory.push({
            timestamp: Date.now(),
            materialsCount: result.materialsCount,
            totalWeight: result.totalWeight,
            totalValue: result.totalValueAfterDiscount
        });
        if (this.analysisHistory.length > 50) {
            this.analysisHistory.shift();
        }

        return {
            totalWeight: this.formatNumber(result.totalWeight),
            totalValueBeforeDiscount: this.formatCurrency(result.totalValueBeforeDiscount),
            totalValueAfterDiscount: this.formatCurrency(result.totalValueAfterDiscount),
            totalValue: this.formatCurrency(result.totalValueAfterDiscount),
            discountRate: this.discountRate,
            discountPercent: Math.round(this.discountRate * 100),
            totalValueRawBefore: result.totalValueBeforeDiscount,
            totalValueRawAfter: result.totalValueAfterDiscount,
            lowStockCount: result.lowStockCount,
            lowStockList: result.lowStockList.slice(0, 10),
            priceBreakdown: result.priceBreakdown.slice(0, 5),
            tawsayaCount: result.tawsayaCount,
            materialsCount: result.materialsCount,
            insights: this._generateInsights(result)
        };
    }

    _getEmptyAnalysis() {
        return {
            totalWeight: '0',
            totalValue: '0',
            totalValueBeforeDiscount: '0',
            totalValueAfterDiscount: '0',
            discountRate: this.discountRate,
            discountPercent: 35,
            lowStockCount: 0,
            lowStockList: [],
            priceBreakdown: [],
            tawsayaCount: 0,
            materialsCount: 0,
            insights: ['✨ لا توجد مواد في المخزون', '💡 أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"']
        };
    }

    _generateInsights(result) {
        const insights = [];
        const discountPercent = Math.round(this.discountRate * 100);
        
        if (result.materialsCount === 0) {
            insights.push('✨ لا توجد مواد في المخزون');
            insights.push('💡 أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"');
        } else {
            insights.push(`📦 الوزن الكلي للمخزون: ${this.formatNumber(result.totalWeight)} كجم`);
            insights.push(`💰 القيمة قبل الخصم (${discountPercent}%): ${this.formatCurrency(result.totalValueBeforeDiscount)}`);
            insights.push(`🏷️ القيمة بعد الخصم: ${this.formatCurrency(result.totalValueAfterDiscount)}`);
            insights.push(`⚠️ عدد المواد الناقصة: ${result.lowStockCount} مادة`);
            
            if (result.tawsayaCount > 0) {
                insights.push(`🎁 التوصيات: ${result.tawsayaCount} مادة (لا تدخل في النواقص)`);
            }
            
            if (result.lowStockCount > 0 && result.lowStockList.length > 0) {
                const lowStockNames = result.lowStockList.slice(0, 3).map(item => item.name).join('، ');
                if (lowStockNames) {
                    insights.push(`📋 المواد الناقصة: ${lowStockNames}${result.lowStockList.length > 3 ? ` و ${result.lowStockList.length - 3} مواد أخرى` : ''}`);
                }
            }
        }
        
        const tips = [
            '💡 اسحب أي مادة وأفلتها في قسم آخر لنقلها',
            '📦 المواد ذات الخلفية البرتقالية ناقصة وتحتاج إعادة تعبئة',
            '🔄 المزامنة التلقائية تحفظ بياناتك في السحابة',
            '🏷️ يتم تطبيق خصم ' + discountPercent + '% على إجمالي قيمة المخزون',
            '⭐ المواد الأساسية هي الأكثر طلباً - ركز عليها'
        ];
        insights.push(tips[Math.floor(Math.random() * tips.length)]);
        
        return insights;
    }

    async analyzeInventory(materials, externalGetPriceFunction) {
        if (!this.pricesLoaded) {
            await this.fetchPricesFromFirebase();
        }
        return this.analyzeInventorySync(materials, externalGetPriceFunction);
    }

    analyzeInventoryWithCallback(materials, callback) {
        const result = this.analyzeInventorySync(materials, window.getMaterialPrice);
        if (callback) callback(result);
    }

    async preloadPrices() {
        return await this.fetchPricesFromFirebase();
    }

    learnFromAction(action, material, details) {
        if (!this.learningData.consumptionPatterns[material]) {
            this.learningData.consumptionPatterns[material] = [];
        }
        this.learningData.consumptionPatterns[material].push({
            action,
            details,
            timestamp: Date.now()
        });
        
        if (!this.learningData.materialHistory[material]) {
            this.learningData.materialHistory[material] = [];
        }
        this.learningData.materialHistory[material].push({ action, details, timestamp: Date.now() });
        
        if (this.learningData.consumptionPatterns[material].length > 50) {
            this.learningData.consumptionPatterns[material] = this.learningData.consumptionPatterns[material].slice(-50);
        }
        if (this.learningData.materialHistory[material].length > 30) {
            this.learningData.materialHistory[material] = this.learningData.materialHistory[material].slice(-30);
        }
        
        this.saveLearningData();
    }

    getAdvancedReport(materials) {
        const analysis = this.analyzeInventorySync(materials, window.getMaterialPrice);
        return {
            summary: {
                totalMaterials: analysis.materialsCount,
                totalWeight: analysis.totalWeight,
                totalValue: analysis.totalValue,
                lowStockCount: analysis.lowStockCount,
                tawsayaCount: analysis.tawsayaCount
            },
            lowStockItems: analysis.lowStockList,
            priceBreakdown: analysis.priceBreakdown,
            insights: analysis.insights,
            history: this.analysisHistory.slice(-10),
            timestamp: new Date().toISOString()
        };
    }
}

window.aiEngine = new AIEngine();
