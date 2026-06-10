// ==================== محرك الذكاء الاصطناعي المتقدم ====================
// المنطق: كل مادة تضاف تعتبر ناقصة بمقدار كميتها (ما عدا التوصيات)

class AIEngine {
    constructor() {
        this.learningData = this.loadLearningData();
        this.seasonalFactors = this.getSeasonalFactors();
        this.debugMode = true; // يمكنك إيقاف التصحيح
    }

    // دالة للتصحيح
    log(message, data = null) {
        if (this.debugMode) {
            if (data) {
                console.log(`[AIEngine] ${message}`, data);
            } else {
                console.log(`[AIEngine] ${message}`);
            }
        }
    }

    loadLearningData() {
        try {
            const saved = localStorage.getItem('ai_learning_data');
            return saved ? JSON.parse(saved) : {
                consumptionPatterns: {},
                popularCombinations: {},
                restockFrequency: {},
                wastePredictions: {},
                materialHistory: {}
            };
        } catch(e) {
            console.error("خطأ في تحميل بيانات التعلم:", e);
            return {
                consumptionPatterns: {},
                popularCombinations: {},
                restockFrequency: {},
                wastePredictions: {},
                materialHistory: {}
            };
        }
    }

    saveLearningData() {
        try {
            localStorage.setItem('ai_learning_data', JSON.stringify(this.learningData));
        } catch(e) {
            console.error("خطأ في حفظ بيانات التعلم:", e);
        }
    }

    getSeasonalFactors() {
        const month = new Date().getMonth();
        if (month >= 7 && month <= 9) return { multiplier: 1.5, reason: "موسم رمضان والأعياد" };
        if (month >= 10 && month <= 11) return { multiplier: 1.3, reason: "الشتاء والمشروبات الساخنة" };
        if (month >= 4 && month <= 6) return { multiplier: 0.8, reason: "الصيف والإقبال أقل" };
        return { multiplier: 1.0, reason: "الموسم العادي" };
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

    getConsumptionRate(materialName) {
        const rates = {
            'ملح': 0.5, 'فلفل اسود ناعم': 0.3, 'كمون ناعم': 0.4, 'كركم': 0.2,
            'زنجبيل ناعم': 0.15, 'قرفة ناعمة': 0.2, 'هيل ناعم': 0.1, 'كزبرة ناعمة': 0.25,
            'شطة حدة وسط': 0.1, 'توم ناعم': 0.2, 'بصل ناعم': 0.2, 'سماق ناعم': 0.15,
            'شاورما': 0.25, 'كاري': 0.15
        };
        return rates[materialName] || 0.1;
    }

    // ==================== التحليل الرئيسي ====================
    // المنطق: كل مادة في المواد (ما عدا التوصيات) تعتبر ناقصة بمقدار كميتها
    // إذا لم تكن المادة موجودة أصلاً، لا تعتبر شيئاً

    analyzeInventory(materials) {
        this.log("بدء تحليل المخزون، عدد المواد:", materials.length);
        
        const analysis = {
            // المواد الناقصة (جميع المواد الموجودة ما عدا التوصيات)
            lowStock: [],
            // المواد الحرجة (الكمية صفر)
            criticalStock: [],
            // المواد الزائدة
            excessStock: [],
            // التوصيات الذكية
            recommendations: [],
            // التنبؤات
            predictions: [],
            // الرؤى
            insights: [],
            // مواد معرضة للتلف
            wasteRisks: [],
            // إحصائيات
            statistics: {
                totalMaterials: 0,           // إجمالي المواد (بدون توصيات)
                totalQuantity: 0,            // إجمالي الكميات (بدون توصيات)
                lowStockCount: 0,            // عدد المواد الناقصة
                lowStockTotalQuantity: 0,    // إجمالي كمية النواقص
                avgQuantity: 0,
                tawsayaCount: 0,             // عدد التوصيات
                tawsayaTotalQuantity: 0,     // إجمالي كمية التوصيات
                categoriesBreakdown: {}
            }
        };

        let totalQuantity = 0;
        let totalLowStockQuantity = 0;
        let validMaterialsCount = 0;
        let lowStockList = [];
        let categoriesData = {};
        let tawsayaCount = 0;
        let tawsayaTotalQuantity = 0;

        for (const material of materials) {
            const isTawsaya = material.priority === 'tawsaya';
            const quantityInKg = this.convertToKg(material.quantity, material.unitType);
            const originalQuantity = material.quantity || 0;
            const originalUnit = material.unitType || 'kg';
            
            this.log(`تحليل مادة: ${material.name}, القسم: ${material.priority}, الكمية: ${originalQuantity} ${originalUnit} = ${quantityInKg} كجم`);
            
            // تجميع إحصائيات الأقسام
            if (!categoriesData[material.priority]) {
                categoriesData[material.priority] = {
                    count: 0,
                    totalQuantity: 0,
                    items: []
                };
            }
            categoriesData[material.priority].count++;
            categoriesData[material.priority].totalQuantity += quantityInKg;
            categoriesData[material.priority].items.push(material.name);
            
            if (!isTawsaya) {
                // ==================== المواد العادية ====================
                // كل مادة تضاف تعتبر ناقصة بمقدار كميتها
                validMaterialsCount++;
                totalQuantity += quantityInKg;
                totalLowStockQuantity += quantityInKg;
                
                // إضافة إلى قائمة المواد الناقصة
                lowStockList.push({
                    name: material.name,
                    quantity: originalQuantity,
                    unit: originalUnit,
                    quantityInKg: quantityInKg,
                    displayText: `${originalQuantity} ${this.getUnitName(originalUnit)}`,
                    status: 'ناقصة'
                });
                
                // تحديد المواد الحرجة (الكمية صفر)
                if (quantityInKg === 0) {
                    analysis.criticalStock.push({
                        name: material.name,
                        quantity: 0,
                        reason: 'المادة مفقودة بالكامل (0 كجم)',
                        urgency: 'عالية جداً'
                    });
                }
                
                // تحديد المواد الزائدة جداً (أكثر من 10 كجم)
                if (quantityInKg > 10) {
                    analysis.excessStock.push({
                        name: material.name,
                        quantity: quantityInKg,
                        originalQuantity: originalQuantity,
                        unit: originalUnit,
                        reason: `كمية كبيرة جداً (${quantityInKg.toFixed(2)} كجم)`,
                        suggestion: 'مراجعة الكمية'
                    });
                    analysis.wasteRisks.push({
                        name: material.name,
                        quantity: quantityInKg,
                        risk: 'مرتفع',
                        suggestedAction: 'مراقبة الكمية'
                    });
                }
                
                // توقع موعد النفاد للمواد ذات الكمية المنخفضة
                if (quantityInKg > 0 && quantityInKg < 2) {
                    const consumptionRate = this.getConsumptionRate(material.name);
                    const daysUntilEmpty = consumptionRate > 0 ? Math.floor(quantityInKg / consumptionRate) : 30;
                    
                    if (daysUntilEmpty < 14) {
                        analysis.predictions.push({
                            name: material.name,
                            currentQuantity: quantityInKg,
                            currentDisplay: `${originalQuantity} ${this.getUnitName(originalUnit)}`,
                            daysUntilEmpty: daysUntilEmpty,
                            recommendedRestock: Math.ceil(consumptionRate * 14),
                            reason: `متوقع النفاد خلال ${daysUntilEmpty} يوم`
                        });
                    }
                }
                
            } else {
                // ==================== التوصيات ====================
                // التوصيات لا تعتبر ناقصة أبداً
                tawsayaCount++;
                tawsayaTotalQuantity += quantityInKg;
            }
        }

        // تحديث الإحصائيات
        analysis.statistics.totalMaterials = validMaterialsCount;
        analysis.statistics.totalQuantity = totalQuantity;
        analysis.statistics.lowStockCount = lowStockList.length;
        analysis.statistics.lowStockTotalQuantity = totalLowStockQuantity;
        analysis.statistics.avgQuantity = validMaterialsCount > 0 ? (totalQuantity / validMaterialsCount).toFixed(2) : 0;
        analysis.statistics.categoriesBreakdown = categoriesData;
        analysis.statistics.tawsayaCount = tawsayaCount;
        analysis.statistics.tawsayaTotalQuantity = tawsayaTotalQuantity;
        analysis.statistics.totalValue = this.estimateTotalValue(materials);
        
        analysis.lowStock = lowStockList;
        
        this.log("تحليل كامل:", {
            totalMaterials: validMaterialsCount,
            totalQuantity: totalQuantity,
            lowStockCount: lowStockList.length,
            lowStockTotalQuantity: totalLowStockQuantity,
            tawsayaCount: tawsayaCount
        });
        
        // إنشاء الرؤى والتوصيات
        analysis.insights = this.generateInsights(analysis);
        analysis.smartRecommendations = this.generateSmartRecommendations(analysis);
        
        return analysis;
    }

    // الحصول على اسم الوحدة بالعربية
    getUnitName(unit) {
        const unitNames = {
            'kg': 'كيلو',
            'half': 'نصف كيلو',
            'quarter': 'ربع كيلو',
            'oke': 'لوقية',
            'box': 'علبة',
            'piece': 'قطعة',
            'bag': 'كيس'
        };
        return unitNames[unit] || unit;
    }

    // تقدير القيمة الإجمالية
    estimateTotalValue(materials) {
        let totalValue = 0;
        const avgPricePerKg = 25;
        
        for (const material of materials) {
            if (material.priority !== 'tawsaya') {
                const quantityInKg = this.convertToKg(material.quantity, material.unitType);
                totalValue += quantityInKg * avgPricePerKg;
            }
        }
        return totalValue;
    }

    // إنشاء التوصيات الذكية
    generateSmartRecommendations(analysis) {
        const recommendations = [];
        const stats = analysis.statistics;
        
        // المواد الحرجة
        if (analysis.criticalStock.length > 0) {
            recommendations.push({
                type: 'urgent',
                title: '⚠️ مواد مفقودة بالكامل - تحتاج شراء فوري',
                items: analysis.criticalStock.slice(0, 5).map(c => `${c.name} (${c.reason})`),
                priority: 1,
                action: 'شراء فوري'
            });
        }
        
        // المواد الزائدة
        if (analysis.excessStock.length > 0) {
            recommendations.push({
                type: 'reduce',
                title: '📉 مواد بكميات كبيرة جداً',
                items: analysis.excessStock.slice(0, 3).map(e => `${e.name} - ${e.reason}`),
                priority: 2,
                action: 'مراجعة الكميات'
            });
        }
        
        // توقعات النفاد
        if (analysis.predictions.length > 0) {
            recommendations.push({
                type: 'predictive',
                title: '🔮 توقعات النفاد (الأيام القادمة)',
                items: analysis.predictions.slice(0, 3).map(p => `${p.name}: ${p.reason}`),
                priority: 2,
                action: 'التخطيط للشراء'
            });
        }
        
        // توصيات عامة
        if (stats.lowStockCount > 0) {
            recommendations.push({
                type: 'general',
                title: '📋 ملخص المواد الناقصة',
                items: [
                    `إجمالي النقص: ${stats.lowStockTotalQuantity.toFixed(2)} كجم`,
                    `عدد المواد الناقصة: ${stats.lowStockCount} مادة`,
                    `متوسط النقص لكل مادة: ${(stats.lowStockTotalQuantity / stats.lowStockCount).toFixed(2)} كجم`
                ],
                priority: 3,
                action: 'مراجعة المخزون'
            });
        }
        
        return recommendations;
    }

    // إنشاء الرؤى الذكية
    generateInsights(analysis) {
        const insights = [];
        const stats = analysis.statistics;
        
        this.log("توليد الرؤى للإحصائيات:", stats);
        
        if (stats.totalMaterials === 0) {
            insights.push('✨ لا توجد مواد في المخزون');
            insights.push('💡 أضف المواد باستخدام زر "إضافة مادة جديدة"');
            insights.push('📦 كل مادة تضاف تعتبر "ناقصة" بمقدار كميتها');
            insights.push('🎁 التوصيات تحسب بشكل منفصل ولا تدخل في إحصائيات النواقص');
        } else {
            // الرؤية الرئيسية
            insights.push(`📊 إجمالي المواد في المخزون: ${stats.totalMaterials} مادة`);
            insights.push(`⚠️ المواد الناقصة: ${stats.lowStockCount} مادة`);
            insights.push(`📦 إجمالي النقص: ${stats.lowStockTotalQuantity.toFixed(2)} كجم`);
            
            // عرض المواد الناقصة إذا كان عددها قليلاً
            if (analysis.lowStock.length > 0 && analysis.lowStock.length <= 8) {
                const lowStockText = analysis.lowStock.map(m => 
                    `${m.name} (${m.displayText})`
                ).join('، ');
                insights.push(`📋 المواد الناقصة: ${lowStockText}`);
            } else if (analysis.lowStock.length > 8) {
                insights.push(`📋 لديك ${analysis.lowStock.length} مادة ناقصة في المخزون`);
            }
            
            // المواد الحرجة
            if (analysis.criticalStock.length > 0) {
                insights.push(`⚠️ تنبيه: ${analysis.criticalStock.length} مادة مفقودة بالكامل - تحتاج شراء فوري`);
            }
            
            // القيمة التقديرية
            if (stats.totalValue > 0) {
                insights.push(`💰 القيمة التقديرية للمخزون: ${stats.totalValue.toFixed(0)} ريال`);
            }
            
            // التوصيات
            if (stats.tawsayaCount > 0) {
                insights.push(`🎁 التوصيات: ${stats.tawsayaCount} مادة (${stats.tawsayaTotalQuantity.toFixed(2)} كجم)`);
            }
            
            // متوسط النقص
            const avgLowStock = stats.lowStockTotalQuantity / stats.lowStockCount;
            if (avgLowStock > 5) {
                insights.push(`📈 متوسط النقص مرتفع (${avgLowStock.toFixed(2)} كجم/مادة) - راجع عملية الشراء`);
            }
        }
        
        // نصائح متجددة
        const tips = [
            '💡 كل مادة تضاف تعتبر "ناقصة" - هذا يساعدك في تتبع احتياجاتك',
            '📦 التوصيات تحسب بشكل منفصل ولا تؤثر على إحصائيات النواقص',
            '🔄 اضغط مطولاً على أي مادة لنقلها إلى قسم آخر',
            '⭐ المواد الأساسية هي الأكثر طلباً - ركز عليها',
            '📊 راجع المخزون أسبوعياً لتحديد أولويات الشراء',
            '🎯 شراء المواد بالجملة يوفر 15-20% من التكلفة'
        ];
        insights.push(tips[Math.floor(Math.random() * tips.length)]);
        
        return insights;
    }

    // التعلم من تفاعلات المستخدم
    learnFromAction(action, material, details) {
        this.log(`تعلم من تفاعل: ${action} - ${material}`);
        
        if (!this.learningData.consumptionPatterns[material]) {
            this.learningData.consumptionPatterns[material] = [];
        }
        
        this.learningData.consumptionPatterns[material].push({
            action: action,
            details: details,
            quantity: details.newQuantity || details.quantity,
            unit: details.unit,
            timestamp: Date.now()
        });
        
        if (!this.learningData.materialHistory[material]) {
            this.learningData.materialHistory[material] = [];
        }
        this.learningData.materialHistory[material].push({
            action: action,
            timestamp: Date.now(),
            details: details
        });
        
        // تنظيف البيانات القديمة
        if (this.learningData.consumptionPatterns[material].length > 100) {
            this.learningData.consumptionPatterns[material] = 
                this.learningData.consumptionPatterns[material].slice(-100);
        }
        if (this.learningData.materialHistory[material].length > 50) {
            this.learningData.materialHistory[material] = 
                this.learningData.materialHistory[material].slice(-50);
        }
        
        this.saveLearningData();
    }

    // تحليل مادة محددة
    analyzeMaterial(material) {
        const quantityInKg = this.convertToKg(material.quantity, material.unitType);
        const consumptionRate = this.getConsumptionRate(material.name);
        const weeksUntilEmpty = consumptionRate > 0 ? (quantityInKg / consumptionRate).toFixed(1) : 'غير محدد';
        
        return {
            name: material.name,
            currentQuantity: material.quantity,
            currentUnit: material.unitType,
            quantityInKg: quantityInKg,
            consumptionRatePerWeek: consumptionRate,
            weeksUntilEmpty: weeksUntilEmpty,
            isLowStock: material.priority !== 'tawsaya', // كل المواد العادية تعتبر ناقصة
            recommendedRestock: Math.ceil(consumptionRate * 4),
            history: this.learningData.materialHistory[material.name] || []
        };
    }
}

// إنشاء النسخة العالمية
window.aiEngine = new AIEngine();
console.log("✅ AI Engine initialized successfully - المواد الناقصة: كل المواد المضافة (ما عدا التوصيات)");
