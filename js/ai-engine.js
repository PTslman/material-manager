// ==================== محرك الذكاء الاصطناعي ====================

var AIEngine = function() {
    this.learningData = this.loadLearningData();
    this.pricesCache = {};
    this.pricesLoaded = false;
};

AIEngine.prototype.loadLearningData = function() {
    try {
        var saved = localStorage.getItem('ai_learning_data');
        return saved ? JSON.parse(saved) : {};
    } catch(e) {
        return {};
    }
};

AIEngine.prototype.saveLearningData = function() {
    try {
        localStorage.setItem('ai_learning_data', JSON.stringify(this.learningData));
    } catch(e) {}
};

AIEngine.prototype.convertToKg = function(quantity, unit) {
    if (!quantity && quantity !== 0) return 0;
    var qty = parseFloat(quantity);
    if (isNaN(qty)) return 0;
    
    var conversions = {
        'kg': 1,
        'half': 0.5,
        'quarter': 0.25,
        'oke': 0.128,
        'box': 0.5,
        'piece': 0.1,
        'bag': 0.05
    };
    
    var result = qty * (conversions[unit] || 1);
    return Math.round(result * 1000) / 1000;
};

AIEngine.prototype.formatNumber = function(value) {
    if (value === undefined || value === null) return '0';
    if (Number.isInteger(value)) return value.toString();
    var rounded = Math.round(value * 10) / 10;
    if (Number.isInteger(rounded)) return rounded.toString();
    return rounded.toFixed(1);
};

AIEngine.prototype.formatCurrency = function(value) {
    return Math.round(value).toLocaleString() + ' ل.س';
};

// جلب الأسعار من Firebase
AIEngine.prototype.fetchPricesFromFirebase = async function() {
    if (!pricesCollection) {
        console.error('pricesCollection is not defined');
        return false;
    }
    
    try {
        var snapshot = await pricesCollection.get();
        var prices = {};
        snapshot.forEach(function(doc) {
            var data = doc.data();
            prices[doc.id] = data.price;
        });
        this.pricesCache = prices;
        this.pricesLoaded = true;
        console.log('تم جلب الأسعار من Firebase:', Object.keys(prices).length, 'مادة');
        return true;
    } catch(e) {
        console.error('خطأ في جلب الأسعار من Firebase:', e);
        return false;
    }
};

// الحصول على سعر مادة من الكاش
AIEngine.prototype.getPrice = function(materialName) {
    return this.pricesCache[materialName] || 0;
};

// تحليل المخزون (متزامن - يستخدم الكاش الحالي)
AIEngine.prototype.analyzeInventorySync = function(materials, externalGetPriceFunction) {
    if (!materials || materials.length === 0) {
        return {
            totalWeight: '0',
            totalValue: '0',
            lowStockCount: 0,
            lowStockList: [],
            priceBreakdown: [],
            insights: ['لا توجد مواد في المخزون', 'أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"']
        };
    }
    
    var totalWeight = 0;
    var totalValue = 0;
    var lowStockCount = 0;
    var lowStockList = [];
    var priceBreakdown = [];
    var tawsayaCount = 0;

    for (var i = 0; i < materials.length; i++) {
        var material = materials[i];
        var isTawsaya = material.priority === 'tawsaya';
        var quantityInKg = this.convertToKg(material.quantity, material.unitType);
        
        if (!isTawsaya) {
            totalWeight += quantityInKg;
            
            if (quantityInKg === 0) {
                lowStockCount++;
                lowStockList.push({
                    name: material.name,
                    quantity: material.quantity,
                    unit: material.unitType,
                    weight: this.formatNumber(quantityInKg)
                });
            }
            
            var price = this.getPrice(material.name);
            
            if (typeof externalGetPriceFunction === 'function' && price === 0) {
                price = externalGetPriceFunction(material.name) || 0;
            }
            
            var itemValue = quantityInKg * price;
            totalValue += itemValue;
            
            if (price > 0 && quantityInKg > 0) {
                priceBreakdown.push({
                    name: material.name,
                    quantity: material.quantity,
                    unit: material.unitType,
                    quantityInKg: this.formatNumber(quantityInKg),
                    pricePerKg: price,
                    totalValue: Math.round(itemValue),
                    formattedValue: this.formatCurrency(itemValue)
                });
            }
        } else {
            tawsayaCount++;
        }
    }
    
    priceBreakdown.sort(function(a, b) {
        return b.totalValue - a.totalValue;
    });

    return {
        totalWeight: this.formatNumber(totalWeight),
        totalValue: this.formatCurrency(totalValue),
        totalValueRaw: totalValue,
        lowStockCount: lowStockCount,
        lowStockList: lowStockList.slice(0, 10),
        priceBreakdown: priceBreakdown.slice(0, 5),
        tawsayaCount: tawsayaCount,
        insights: this.getInsights(totalWeight, totalValue, lowStockCount, tawsayaCount)
    };
};

// تحليل المخزون (غير متزامن - يجلب الأسعار أولاً)
AIEngine.prototype.analyzeInventory = async function(materials, externalGetPriceFunction) {
    if (!this.pricesLoaded) {
        await this.fetchPricesFromFirebase();
    }
    return this.analyzeInventorySync(materials, externalGetPriceFunction);
};

// دالة مع callback للتوافق مع الواجهة القديمة
AIEngine.prototype.analyzeInventoryWithCallback = function(materials, callback) {
    var self = this;
    this.fetchPricesFromFirebase().then(function() {
        var result = self.analyzeInventorySync(materials, window.getMaterialPrice);
        if (callback) callback(result);
    }).catch(function() {
        var result = self.analyzeInventorySync(materials, window.getMaterialPrice);
        if (callback) callback(result);
    });
};

AIEngine.prototype.getInsights = function(totalWeight, totalValue, lowStockCount, tawsayaCount) {
    var insights = [];
    
    if (totalWeight === 0 && totalValue === 0) {
        insights.push('لا توجد مواد في المخزون');
        insights.push('أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"');
    } else {
        insights.push('الوزن الكلي للمخزون: ' + this.formatNumber(totalWeight) + ' كجم');
        insights.push('القيمة التقديرية للمخزون: ' + this.formatCurrency(totalValue));
        insights.push('عدد المواد الناقصة: ' + lowStockCount + ' مادة');
        
        if (tawsayaCount > 0) {
            insights.push('التوصيات: ' + tawsayaCount + ' مادة (لا تدخل في النواقص)');
        }
    }
    
    var tips = [
        'اسحب أي مادة وأفلتها في قسم آخر لنقلها',
        'المواد ذات الخلفية البرتقالية ناقصة وتحتاج إعادة تعبئة',
        'المزامنة التلقائية تحفظ بياناتك في السحابة'
    ];
    insights.push(tips[Math.floor(Math.random() * tips.length)]);
    
    return insights;
};

// دالة لتحميل الأسعار مسبقاً
AIEngine.prototype.preloadPrices = async function() {
    return await this.fetchPricesFromFirebase();
};

window.aiEngine = new AIEngine();
