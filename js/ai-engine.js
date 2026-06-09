// ==================== محرك الذكاء الاصطناعي المتقدم ====================
class AIEngine {
    constructor() {
        this.learningData = this.loadLearningData();
        this.seasonalFactors = this.getSeasonalFactors();
    }

    loadLearningData() {
        const saved = localStorage.getItem('ai_learning_data');
        return saved ? JSON.parse(saved) : {
            consumptionPatterns: {},
            popularCombinations: {},
            restockFrequency: {},
            wastePredictions: {}
        };
    }

    saveLearningData() {
        localStorage.setItem('ai_learning_data', JSON.stringify(this.learningData));
    }

    getSeasonalFactors() {
        const month = new Date().getMonth();
        if (month >= 7 && month <= 9) return { multiplier: 1.5, reason: "موسم رمضان والأعياد" };
        if (month >= 10 && month <= 11) return { multiplier: 1.3, reason: "الشتاء والمشروبات الساخنة" };
        if (month >= 4 && month <= 6) return { multiplier: 0.8, reason: "الصيف والإقبال أقل" };
        return { multiplier: 1.0, reason: "الموسم العادي" };
    }

    convertToKg(quantity, unit) {
        if (!quantity || quantity === 0) return 0;
        const conversions = {
            'kg': 1,
            'half': 0.5,
            'quarter': 0.25,
            'oke': 0.128,
            'box': 0.5,
            'piece': 0.1,
            'bag': 0.05
        };
        return quantity * (conversions[unit] || 1);
    }

    getConsumptionRate(materialName) {
        const rates = {
            'ملح': 0.5,
            'فلفل اسود ناعم': 0.3,
            'كمون ناعم': 0.4,
            'كركم': 0.2,
            'زنجبيل ناعم': 0.15,
            'قرفة ناعمة': 0.2,
            'هيل ناعم': 0.1,
            'كزبرة ناعمة': 0.25,
            'شطة حدة وسط': 0.1,
            'توم ناعم': 0.2,
            'بصل ناعم': 0.2
        };
        return rates[materialName] || 0.1;
    }

    analyzeInventory(materials) {
        const analysis = {
            lowStock: [],
            criticalStock: [],
            excessStock: [],
            recommendations: [],
            predictions: [],
            insights: [],
            smartAlerts: [],
            wasteRisks: []
        };

        let totalQuantity = 0;
        let validMaterialsCount = 0;

        for (const material of materials) {
            // استثناء التوصيات من تحليل النواقص
            if (material.priority === 'tawsaya') continue;
            
            const quantity = this.convertToKg(material.quantity, material.unitType);
            totalQuantity += quantity;
            
            // التحقق من صحة الكمية
            const isValidQuantity = material.quantity && material.quantity > 0;
            
            if (!isValidQuantity || quantity === 0) {
                analysis.lowStock.push({ 
                    name: material.name, 
                    quantity: 0, 
                    status: 'فارغ تماماً',
                    urgency: 'عالية'
                });
                analysis.criticalStock.push({ 
                    name: material.name, 
                    reason: 'مادة مفقودة بالكامل - تحتاج إعادة تعبئة فورية' 
                });
            } else if (quantity < 0.5) {
                analysis.lowStock.push({ 
                    name: material.name, 
                    quantity: quantity, 
                    status: 'حرج جداً',
                    urgency: 'عالية'
                });
                analysis.criticalStock.push({ 
                    name: material.name, 
                    reason: `أقل من نصف كيلو (${quantity.toFixed(2)} كجم)` 
                });
            } else if (quantity < 1) {
                analysis.lowStock.push({ 
                    name: material.name, 
                    quantity: quantity, 
                    status: 'منخفض',
                    urgency: 'متوسطة'
                });
            } else if (quantity > 10) {
                analysis.excessStock.push({ 
                    name: material.name, 
                    quantity: quantity, 
                    reason: 'كمية كبيرة جداً قد تفسد مع الوقت' 
                });
                analysis.wasteRisks.push({ 
                    name: material.name, 
                    quantity: quantity, 
                    risk: 'خطر تلف مرتفع',
                    suggestedAction: 'تخفيض الكمية أو مشاركتها مع فروع أخرى' 
                });
            }
            
            validMaterialsCount++;
            
            // توقع موعد النفاد
            const consumptionRate = this.getConsumptionRate(material.name);
            const daysUntilEmpty = consumptionRate > 0 && quantity > 0 ? Math.floor(quantity / consumptionRate) : Infinity;
            
            if (daysUntilEmpty < 7 && daysUntilEmpty > 0) {
                analysis.predictions.push({
                    name: material.name,
                    daysUntilEmpty: daysUntilEmpty,
                    recommendedRestock: Math.ceil(consumptionRate * 14),
                    reason: `سوف تنفد خلال ${daysUntilEmpty} يوم`
                });
            }
        }

        analysis.totalQuantity = totalQuantity;
        analysis.totalMaterials = validMaterialsCount;
        analysis.avgQuantity = validMaterialsCount > 0 ? (totalQuantity / validMaterialsCount).toFixed(1) : 0;
        analysis.insights = this.generateInsights(analysis);
        analysis.smartRecommendations = this.generateSmartRecommendations(analysis);
        
        return analysis;
    }

    generateSmartRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.criticalStock.length > 0) {
            recommendations.push({
                type: 'urgent',
                title: '⚠️ مواد تحتاج شراء فوري',
                items: analysis.criticalStock.slice(0, 3).map(c => `${c.name} (${c.reason})`),
                priority: 1
            });
        }

        if (analysis.excessStock.length > 0) {
            recommendations.push({
                type: 'reduce',
                title: '📉 مواد بكميات زائدة',
                items: analysis.excessStock.slice(0, 3).map(e => `${e.name} (${e.quantity.toFixed(1)} كجم)`),
                priority: 2
            });
        }

        const seasonal = this.seasonalFactors;
        if (seasonal.multiplier > 1) {
            recommendations.push({
                type: 'seasonal',
                title: `🌟 توصية موسمية: ${seasonal.reason}`,
                items: ['خزّن كمية إضافية 30-50%', 'جهّز عروض خاصة للموسم'],
                priority: 3
            });
        }

        return recommendations;
    }

    generateInsights(analysis) {
        const insights = [];
        
        if (analysis.totalMaterials === 0) {
            insights.push('✨ ابدأ بإضافة المواد إلى المخزون');
            insights.push('💡 اضغط على "إضافة مادة جديدة" أو استخدم الأقسام الجاهزة');
        } else {
            const lowStockPercentage = ((analysis.lowStock.length / analysis.totalMaterials) * 100).toFixed(1);
            
            if (analysis.lowStock.length === 0) {
                insights.push('🎉 ممتاز! المخزون متوازن ولا توجد مواد ناقصة');
            } else {
                insights.push(`📊 نسبة النواقص: ${lowStockPercentage}%`);
                insights.push(`🔔 لديك ${analysis.lowStock.length} مادة بحاجة لإعادة تعبئة`);
            }

            if (analysis.wasteRisks.length > 0) {
                insights.push(`⚠️ ${analysis.wasteRisks[0].suggestedAction}`);
            }
        }
        
        const tips = [
            '💡 نصيحة: رتّب المواد حسب تاريخ الصلاحية',
            '📦 نصيحة: المواد الأكثر استهلاكاً ضعها في مكان سهل الوصول',
            '🔄 لا تنسَ تحديث الكميات عند كل صرف',
            '📱 يمكنك استخدام التطبيق دون اتصال بالإنترنت',
            '⭐ المواد الأساسية تحقق أعلى مبيعات - حافظ على توفرها',
            '📊 راجع تقارير المخزون أسبوعياً لتحسين إدارة المخزون'
        ];
        insights.push(tips[Math.floor(Math.random() * tips.length)]);
        
        return insights;
    }

    learnFromAction(action, material, details) {
        if (!this.learningData.consumptionPatterns[material]) {
            this.learningData.consumptionPatterns[material] = [];
        }
        this.learningData.consumptionPatterns[material].push({
            action: action,
            details: details,
            timestamp: Date.now()
        });
        this.saveLearningData();
    }
}

// إنشاء النسخة العالمية
window.aiEngine = new AIEngine();
