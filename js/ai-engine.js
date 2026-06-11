
// ==================== محرك الذكاء الاصطناعي ====================

var AIEngine = function() {
    this.learningData = this.loadLearningData();
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

// دالة لتنسيق العملة
AIEngine.prototype.formatCurrency = function(value) {
    return Math.round(value).toLocaleString() + ' ل.س';
};

AIEngine.prototype.analyzeInventory = function(materials, getPriceFunction) {
    console.log('تحليل المخزون، عدد المواد:', materials ? materials.length : 0);
    
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
        
        console.log('تحليل مادة:', material.name, 'الكمية:', quantityInKg, 'كجم', 'القسم:', material.priority);
        
        if (!isTawsaya) {
            totalWeight += quantityInKg;
            
            // المادة تعتبر ناقصة فقط إذا كانت الكمية = 0
            if (quantityInKg === 0) {
                lowStockCount++;
                lowStockList.push({
                    name: material.name,
                    quantity: material.quantity,
                    unit: material.unitType,
                    weight: this.formatNumber(quantityInKg)
                });
            }
            
            // حساب السعر
            var price = 0;
            if (typeof getPriceFunction === 'function') {
                try {
                    price = getPriceFunction(material.name) || 0;
                    console.log('سعر المادة', material.name, ':', price, 'ل.س/كجم');
                } catch(e) {
                    console.error('خطأ في جلب سعر المادة', material.name, e);
                }
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

    var result = {
        totalWeight: this.formatNumber(totalWeight),
        totalValue: this.formatCurrency(totalValue),
        totalValueRaw: totalValue,
        lowStockCount: lowStockCount,
        lowStockList: lowStockList.slice(0, 10),
        priceBreakdown: priceBreakdown.slice(0, 5),
        tawsayaCount: tawsayaCount,
        insights: this.getInsights(totalWeight, totalValue, lowStockCount, tawsayaCount)
    };
    
    console.log('نتيجة التحليل:', {
        totalWeight: result.totalWeight,
        totalValue: result.totalValue,
        lowStockCount: result.lowStockCount,
        priceBreakdownCount: result.priceBreakdown.length
    });
    
    return result;
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

window.aiEngine = new AIEngine();
console.log('✅ AI Engine initialized');
