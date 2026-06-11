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
            statistics: {
                totalMaterials: 0,
                totalQuantity: '0',
                lowStockCount: 0,
                lowStockTotalQuantity: '0',
                avgQuantity: '0',
                tawsayaCount: 0,
                tawsayaTotalQuantity: '0',
                zeroStockCount: 0
            },
            lowStock: [],
            zeroStock: [],
            insights: ['✨ لا توجد مواد في المخزون', '💡 أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"'],
            smartRecommendations: []
        };
    }
    
    var totalQuantity = 0;
    var lowStockCount = 0;
    var lowStockTotal = 0;
    var normalCount = 0;
    var tawsayaCount = 0;
    var tawsayaTotal = 0;
    var zeroStockItems = [];
    var lowStockList = [];

    for (var i = 0; i < materials.length; i++) {
        var material = materials[i];
        var isTawsaya = material.priority === 'tawsaya';
        var quantityInKg = this.convertToKg(material.quantity, material.unitType);
        
        if (!isTawsaya) {
            normalCount++;
            totalQuantity += quantityInKg;
            lowStockCount++;
            lowStockTotal += quantityInKg;
            
            lowStockList.push({
                name: material.name,
                quantity: material.quantity,
                unit: material.unitType,
                quantityInKg: quantityInKg
            });
            
            if (quantityInKg === 0) {
                zeroStockItems.push({ name: material.name });
            }
        } else {
            tawsayaCount++;
            tawsayaTotal += quantityInKg;
        }
    }

    var avgQuantity = normalCount > 0 ? (totalQuantity / normalCount) : 0;

    return {
        statistics: {
            totalMaterials: normalCount,
            totalQuantity: this.formatNumber(totalQuantity),
            lowStockCount: lowStockCount,
            lowStockTotalQuantity: this.formatNumber(lowStockTotal),
            avgQuantity: this.formatNumber(avgQuantity),
            tawsayaCount: tawsayaCount,
            tawsayaTotalQuantity: this.formatNumber(tawsayaTotal),
            zeroStockCount: zeroStockItems.length
        },
        lowStock: lowStockList,
        zeroStock: zeroStockItems,
        insights: this.getInsights(normalCount, lowStockCount, lowStockTotal, zeroStockItems.length, tawsayaCount, tawsayaTotal),
        smartRecommendations: this.getRecommendations(zeroStockItems)
    };
};

AIEngine.prototype.getInsights = function(total, lowCount, lowTotal, zeroCount, tawsayaCount, tawsayaTotal) {
    var insights = [];
    
    if (total === 0) {
        insights.push('✨ لا توجد مواد في المخزون');
        insights.push('💡 أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"');
    } else {
        insights.push('📊 إجمالي المواد: ' + total + ' مادة');
        
        if (lowCount > 0) {
            var formattedLowTotal = this.formatNumber(lowTotal);
            insights.push('⚠️ المواد الناقصة: ' + lowCount + ' مادة (إجمالي ' + formattedLowTotal + ' كجم)');
        }
        
        if (zeroCount > 0) {
            insights.push('🔴 ' + zeroCount + ' مواد مفقودة بالكامل');
        }
        
        if (tawsayaCount > 0) {
            var formattedTawsayaTotal = this.formatNumber(tawsayaTotal);
            insights.push('🎁 التوصيات: ' + tawsayaCount + ' مادة (' + formattedTawsayaTotal + ' كجم)');
        }
    }
    
    var tips = [
        '💡 اسحب أي مادة وأفلتها في قسم آخر لنقلها',
        '📦 المواد ذات الخلفية البرتقالية ناقصة وتحتاج إعادة تعبئة',
        '🔄 المزامنة التلقائية تحفظ بياناتك في السحابة',
        '⭐ المواد الأساسية هي الأكثر طلباً',
        '📊 راجع المخزون أسبوعياً لتحديد أولويات الشراء'
    ];
    insights.push(tips[Math.floor(Math.random() * tips.length)]);
    
    return insights;
};

AIEngine.prototype.getRecommendations = function(zeroItems) {
    var recommendations = [];
    
    if (zeroItems.length > 0) {
        var items = [];
        for (var i = 0; i < Math.min(zeroItems.length, 3); i++) {
            items.push(zeroItems[i].name + ' (مفقودة)');
        }
        recommendations.push({
            type: 'urgent',
            title: '⚠️ مواد تحتاج شراء فوري',
            items: items,
            priority: 1
        });
    }
    
    return recommendations;
};

AIEngine.prototype.learnFromAction = function(action, material, details) {
    if (!this.learningData[material]) {
        this.learningData[material] = [];
    }
    this.learningData[material].push({
        action: action,
        details: details,
        timestamp: Date.now()
    });
    this.saveLearningData();
};

window.aiEngine = new AIEngine();
