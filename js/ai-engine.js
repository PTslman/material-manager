// ==================== محرك الذكاء الاصطناعي المتقدم ====================

class AIEngine {
    constructor() {
        this.learningData = this.loadLearningData();
        this.seasonalFactors = this.getSeasonalFactors();
    }

    loadLearningData() {
        try {
            var saved = localStorage.getItem('ai_learning_data');
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

    getSeasonalFactors() {
        var month = new Date().getMonth();
        if (month >= 7 && month <= 9) {
            return { multiplier: 1.5, reason: "موسم رمضان والأعياد", recommendation: "خزّن كمية إضافية 50%" };
        }
        if (month >= 10 && month <= 11) {
            return { multiplier: 1.3, reason: "الشتاء والمشروبات الساخنة", recommendation: "زود مخزون القرفة والزنجبيل" };
        }
        if (month >= 4 && month <= 6) {
            return { multiplier: 0.8, reason: "الصيف والإقبال أقل", recommendation: "قلل الكميات الكبيرة" };
        }
        return { multiplier: 1.0, reason: "الموسم العادي", recommendation: "حافظ على المخزون المعتاد" };
    }

    convertToKg(quantity, unit) {
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
    }

    // دالة تنسيق الأرقام (عدد صحيح بدون فاصلة، كسر بفاصلة واحدة)
    formatNumber(value) {
        if (value === undefined || value === null) return '0';
        
        // إذا كان الرقم عدداً صحيحاً
        if (Number.isInteger(value)) {
            return value.toString();
        }
        
        // إذا كان الرقم كسراً، قربه إلى منزلة عشرية واحدة
        var rounded = Math.round(value * 10) / 10;
        
        // إذا أصبح عدداً صحيحاً بعد التقريب
        if (Number.isInteger(rounded)) {
            return rounded.toString();
        }
        
        // اعرض بفاصلة واحدة
        return rounded.toFixed(1);
    }

    getUnitName(unit) {
        var names = {
            'kg': 'كيلو',
            'half': 'نصف كيلو',
            'quarter': 'ربع كيلو',
            'oke': 'لوقية',
            'box': 'علبة',
            'piece': 'قطعة',
            'bag': 'كيس'
        };
        return names[unit] || unit;
    }

    getConsumptionRate(materialName) {
        var rates = {
            'ملح': 0.5, 'فلفل اسود ناعم': 0.3, 'كمون ناعم': 0.4, 'كركم': 0.2,
            'زنجبيل ناعم': 0.15, 'قرفة ناعمة': 0.2, 'هيل ناعم': 0.1, 'كزبرة ناعمة': 0.25,
            'شطة حدة وسط': 0.1, 'توم ناعم': 0.2, 'بصل ناعم': 0.2, 'سماق ناعم': 0.15,
            'شاورما': 0.25, 'كاري': 0.15, 'كبسة خليجية': 0.2
        };
        
        if (this.learningData.consumptionPatterns[materialName] && 
            this.learningData.consumptionPatterns[materialName].length > 0) {
            var recent = this.learningData.consumptionPatterns[materialName].slice(-5);
            var sum = 0;
            for (var i = 0; i < recent.length; i++) {
                sum += recent[i].quantity || 0;
            }
            var avg = sum / recent.length;
            if (avg > 0) return avg;
        }
        
        return rates[materialName] || 0.1;
    }

    analyzeInventory(materials) {
        var totalQuantity = 0;
        var lowStockCount = 0;
        var lowStockTotal = 0;
        var normalCount = 0;
        var tawsayaCount = 0;
        var tawsayaTotal = 0;
        var zeroStockItems = [];
        var lowStockList = [];
        var excessStockList = [];

        for (var i = 0; i < materials.length; i++) {
            var material = materials[i];
            var isTawsaya = material.priority === 'tawsaya';
            var quantityInKg = this.convertToKg(material.quantity, material.unitType);
            var originalQuantity = material.quantity || 0;
            var originalUnit = material.unitType || 'kg';
            
            if (!isTawsaya) {
                normalCount++;
                totalQuantity += quantityInKg;
                lowStockCount++;
                lowStockTotal += quantityInKg;
                
                lowStockList.push({
                    name: material.name,
                    quantity: originalQuantity,
                    unit: originalUnit,
                    quantityInKg: quantityInKg,
                    displayText: originalQuantity + ' ' + this.getUnitName(originalUnit)
                });
                
                if (quantityInKg === 0) {
                    zeroStockItems.push({
                        name: material.name,
                        reason: 'مفقودة بالكامل',
                        urgency: 'عالية'
                    });
                } else if (quantityInKg > 10) {
                    excessStockList.push({
                        name: material.name,
                        quantity: quantityInKg,
                        display: originalQuantity + ' ' + this.getUnitName(originalUnit),
                        suggestion: 'كمية كبيرة جداً - راجع الحاجة الفعلية'
                    });
                }
            } else {
                tawsayaCount++;
                tawsayaTotal += quantityInKg;
            }
        }

        var avgQuantity = normalCount > 0 ? (totalQuantity / normalCount) : 0;
        var predictions = this.generatePredictions(materials);
        var insights = this.generateInsights(normalCount, lowStockCount, lowStockTotal, zeroStockItems.length, tawsayaCount, tawsayaTotal, avgQuantity);
        var recommendations = this.generateRecommendations(zeroStockItems, lowStockList, excessStockList);

        return {
            statistics: {
                totalMaterials: normalCount,
                totalQuantity: this.formatNumber(totalQuantity),
                lowStockCount: lowStockCount,
                lowStockTotalQuantity: this.formatNumber(lowStockTotal),
                avgQuantity: this.formatNumber(avgQuantity),
                tawsayaCount: tawsayaCount,
                tawsayaTotalQuantity: this.formatNumber(tawsayaTotal),
                zeroStockCount: zeroStockItems.length,
                excessStockCount: excessStockList.length
            },
            lowStock: lowStockList,
            zeroStock: zeroStockItems,
            excessStock: excessStockList,
            predictions: predictions,
            insights: insights,
            smartRecommendations: recommendations
        };
    }

    generatePredictions(materials) {
        var predictions = [];
        
        for (var i = 0; i < materials.length; i++) {
            var material = materials[i];
            if (material.priority === 'tawsaya') continue;
            
            var quantityInKg = this.convertToKg(material.quantity, material.unitType);
            if (quantityInKg > 0 && quantityInKg < 3) {
                var consumptionRate = this.getConsumptionRate(material.name);
                var daysUntilEmpty = consumptionRate > 0 ? Math.floor(quantityInKg / consumptionRate) : 30;
                
                if (daysUntilEmpty < 14) {
                    predictions.push({
                        name: material.name,
                        currentQuantity: this.formatNumber(quantityInKg),
                        currentDisplay: material.quantity + ' ' + this.getUnitName(material.unitType),
                        daysUntilEmpty: daysUntilEmpty,
                        recommendedRestock: Math.ceil(consumptionRate * 14),
                        message: 'متوقع النفاد خلال ' + daysUntilEmpty + ' يوم'
                    });
                }
            }
        }
        
        return predictions;
    }

    generateInsights(total, lowCount, lowTotal, zeroCount, tawsayaCount, tawsayaTotal, avgQty) {
        var insights = [];
        
        if (total === 0) {
            insights.push('✨ لا توجد مواد في المخزون');
            insights.push('💡 أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"');
            insights.push('📦 كل مادة تضاف تعتبر ناقصة بمقدار كميتها');
            insights.push('🎁 التوصيات تحسب بشكل منفصل ولا تدخل في إحصائيات النواقص');
        } else {
            // تنسيق الأرقام
            var formattedLowTotal = this.formatNumber(lowTotal);
            var formattedAvgQty = this.formatNumber(avgQty);
            
            insights.push('📊 إجمالي المواد في المخزون: ' + total + ' مادة');
            
            if (lowCount > 0) {
                insights.push('⚠️ المواد الناقصة: ' + lowCount + ' مادة (إجمالي النقص ' + formattedLowTotal + ' كجم)');
            }
            
            if (zeroCount > 0) {
                insights.push('🔴 تنبيه: ' + zeroCount + ' مواد مفقودة بالكامل - تحتاج شراء فوري');
            }
            
            if (tawsayaCount > 0) {
                insights.push('🎁 التوصيات: ' + tawsayaCount + ' مادة (' + this.formatNumber(tawsayaTotal) + ' كجم) - لا تدخل في النواقص');
            }
            
            if (avgQty < 1) {
                insights.push('⚠️ متوسط كمية النقص ' + formattedAvgQty + ' كجم لكل مادة');
            }
        }
        
        var tips = [
            '💡 اضغط مطولاً على أي مادة لنقلها إلى قسم آخر',
            '📦 يمكنك نقل المواد بين جميع الأقسام بما فيها التوصيات',
            '🔄 المزامنة التلقائية تحفظ بياناتك في السحابة',
            '⭐ المواد الأساسية هي الأكثر طلباً - ركز عليها',
            '📊 راجع المخزون أسبوعياً لتحديد أولويات الشراء',
            '🎯 شراء المواد بالجملة يوفر 15-20% من التكلفة',
            '📱 التطبيق يعمل دون اتصال بالإنترنت'
        ];
        insights.push(tips[Math.floor(Math.random() * tips.length)]);
        
        return insights;
    }

    generateRecommendations(zeroItems, lowStockList, excessList) {
        var recommendations = [];
        
        if (zeroItems.length > 0) {
            recommendations.push({
                type: 'urgent',
                title: '⚠️ مواد مفقودة بالكامل - تحتاج شراء فوري',
                items: zeroItems.slice(0, 5).map(function(z) { return z.name + ' (' + z.reason + ')'; }),
                priority: 1,
                action: 'شراء فوري'
            });
        }
        
        if (excessList.length > 0) {
            recommendations.push({
                type: 'warning',
                title: '📉 مواد بكميات كبيرة جداً',
                items: excessList.slice(0, 3).map(function(e) { return e.name + ' (' + e.display + ') - ' + e.suggestion; }),
                priority: 2,
                action: 'مراجعة الكميات'
            });
        }
        
        if (lowStockList.length > 5) {
            var totalLow = 0;
            for (var i = 0; i < lowStockList.length; i++) {
                totalLow += lowStockList[i].quantityInKg;
            }
            recommendations.push({
                type: 'general',
                title: '📋 ملخص عام',
                items: [
                    'عدد المواد الناقصة: ' + lowStockList.length,
                    'إجمالي النقص: ' + this.formatNumber(totalLow) + ' كجم',
                    'راجع قائمة المواد لتحديث الكميات'
                ],
                priority: 3,
                action: 'مراجعة المخزون'
            });
        }
        
        var seasonal = this.seasonalFactors;
        if (seasonal.multiplier > 1) {
            recommendations.push({
                type: 'seasonal',
                title: '🌟 توصية موسمية: ' + seasonal.reason,
                items: [seasonal.recommendation, 'جهّز عروض خاصة للمناسبات'],
                priority: 4,
                action: 'تجهيز المخزون'
            });
        }
        
        return recommendations;
    }

    learnFromAction(action, material, details) {
        if (!this.learningData.consumptionPatterns[material]) {
            this.learningData.consumptionPatterns[material] = [];
        }
        
        this.learningData.consumptionPatterns[material].push({
            action: action,
            quantity: details.newQuantity || details.quantity,
            unit: details.unit,
            timestamp: Date.now()
        });
        
        if (!this.learningData.materialHistory[material]) {
            this.learningData.materialHistory[material] = [];
        }
        
        this.learningData.materialHistory[material].push({
            action: action,
            details: details,
            timestamp: Date.now()
        });
        
        // تنظيف البيانات القديمة
        if (this.learningData.consumptionPatterns[material].length > 50) {
            this.learningData.consumptionPatterns[material] = 
                this.learningData.consumptionPatterns[material].slice(-50);
        }
        if (this.learningData.materialHistory[material].length > 30) {
            this.learningData.materialHistory[material] = 
                this.learningData.materialHistory[material].slice(-30);
        }
        
        this.saveLearningData();
    }

    analyzeMaterial(material) {
        var quantityInKg = this.convertToKg(material.quantity, material.unitType);
        var consumptionRate = this.getConsumptionRate(material.name);
        var weeksUntilEmpty = consumptionRate > 0 ? (quantityInKg / consumptionRate).toFixed(1) : 'غير محدد';
        
        return {
            name: material.name,
            currentQuantity: material.quantity,
            currentUnit: material.unitType,
            quantityInKg: this.formatNumber(quantityInKg),
            consumptionRatePerWeek: this.formatNumber(consumptionRate),
            weeksUntilEmpty: weeksUntilEmpty,
            isLowStock: material.priority !== 'tawsaya',
            recommendedRestock: Math.ceil(consumptionRate * 4),
            history: this.learningData.materialHistory[material.name] || []
        };
    }
}

window.aiEngine = new AIEngine();
console.log('✅ AI Engine Loaded Successfully');
