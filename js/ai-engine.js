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

AIEngine.prototype.analyzeInventory = function(materials) {
    if (!materials || materials.length === 0) {
        return {
            totalWeight: '0',
            lowStockCount: 0,
            lowStockList: [],
            insights: ['✨ لا توجد مواد في المخزون', '💡 أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"']
        };
    }
    
    var totalWeight = 0;
    var lowStockCount = 0;
    var lowStockList = [];
    var tawsayaCount = 0;

    for (var i = 0; i < materials.length; i++) {
        var material = materials[i];
        var isTawsaya = material.priority === 'tawsaya';
        var quantityInKg = this.convertToKg(material.quantity, material.unitType);
        
        if (!isTawsaya) {
            totalWeight += quantityInKg;
            lowStockCount++;
            
            lowStockList.push({
                name: material.name,
                quantity: material.quantity,
                unit: material.unitType,
                weight: this.formatNumber(quantityInKg)
            });
        } else {
            tawsayaCount++;
        }
    }

    return {
        totalWeight: this.formatNumber(totalWeight),
        lowStockCount: lowStockCount,
        lowStockList: lowStockList.slice(0, 10),
        insights: this.getInsights(materials.length, totalWeight, lowStockCount, tawsayaCount)
    };
};

AIEngine.prototype.getInsights = function(totalMaterials, totalWeight, lowStockCount, tawsayaCount) {
    var insights = [];
    
    if (totalMaterials === 0) {
        insights.push('✨ لا توجد مواد في المخزون');
        insights.push('💡 أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"');
    } else {
        insights.push('📊 الوزن الكلي للمخزون: ' + this.formatNumber(totalWeight) + ' كجم');
        insights.push('⚠️ عدد المواد الناقصة: ' + lowStockCount + ' مادة');
        
        if (tawsayaCount > 0) {
            insights.push('🎁 التوصيات: ' + tawsayaCount + ' مادة (لا تدخل في النواقص)');
        }
    }
    
    var tips = [
        '💡 اسحب أي مادة وأفلتها في قسم آخر لنقلها',
        '📦 المواد ذات الخلفية البرتقالية ناقصة وتحتاج إعادة تعبئة',
        '🔄 المزامنة التلقائية تحفظ بياناتك في السحابة',
        '⭐ المواد الأساسية هي الأكثر طلباً'
    ];
    insights.push(tips[Math.floor(Math.random() * tips.length)]);
    
    return insights;
};

window.aiEngine = new AIEngine();
