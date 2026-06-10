// ==================== محرك الذكاء الاصطناعي المتقدم ====================
// الإصدار: v8.0 - كل مادة تضاف تعتبر ناقصة بمقدار كميتها

class AIEngine {
    constructor() {
        this.learningData = this.loadLearningData();
        this.seasonalFactors = this.getSeasonalFactors();
        this.unitSystem = this.initUnitSystem();
    }

    // تهيئة نظام الوحدات والتحويلات الدقيقة
    initUnitSystem() {
        return {
            conversions: {
                'kg': 1.0,
                'half': 0.5,
                'quarter': 0.25,
                'oke': 0.128,
                'box': 0.5,
                'piece': 0.1,
                'bag': 0.05
            },
            unitNames: {
                'kg': 'كيلو جرام',
                'half': 'نصف كيلو',
                'quarter': 'ربع كيلو',
                'oke': 'لوقية',
                'box': 'علبة',
                'piece': 'قطعة',
                'bag': 'كيس'
            }
        };
    }

    loadLearningData() {
        const saved = localStorage.getItem('ai_learning_data');
        return saved ? JSON.parse(saved) : {
            consumptionPatterns: {},
            popularCombinations: {},
            restockFrequency: {},
            wastePredictions: {},
            materialHistory: {}
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

    // تحويل دقيق من أي وحدة إلى كيلوجرام
    convertToKg(quantity, unit) {
        if (!quantity || quantity === 0) return 0;
        const qty = parseFloat(quantity);
        if (isNaN(qty)) return 0;
        const conversion = this.unitSystem.conversions[unit];
        if (!conversion) return qty;
        return Math.round((qty * conversion) * 1000) / 1000;
    }

    // ==================== التحليل الرئيسي للمخزون ====================
    // المبدأ: كل مادة تضاف تعتبر "ناقصة" بمقدار الكمية المدخلة
    // التوصيات فقط لا تعتبر ناقصة
    
    analyzeInventory(materials) {
        const analysis = {
            // المواد الناقصة (جميع المواد ما عدا التوصيات)
            lowStock: [],
            // المواد الحرجة (التي تحتاج تدخل فوري)
            criticalStock: [],
            // المواد الزائدة جداً
            excessStock: [],
            // التوصيات الذكية
            recommendations: [],
            // التنبؤات
            predictions: [],
            // الرؤى والتحليلات
            insights: [],
            // تنبيهات ذكية
            smartAlerts: [],
            // مواد معرضة للتلف
            wasteRisks: [],
            // إحصائيات إضافية
            statistics: {
                totalMaterials: 0,
                totalQuantity: 0,
                lowStockCount: 0,
                lowStockTotalQuantity: 0,
                avgQuantity: 0,
                categoriesBreakdown: {},
                tawsayaCount: 0,
                tawsayaTotalQuantity: 0
            }
        };

        let totalQuantity = 0;
        let totalLowStockQuantity = 0;
        let validMaterialsCount = 0;
        let lowStockMaterials = [];
        let categoriesData = {};
        let tawsayaCount = 0;
        let tawsayaTotalQuantity = 0;

        for (const material of materials) {
            // حساب الكمية بالكيلوجرام بدقة
            const quantityInKg = this.convertToKg(material.quantity, material.unitType);
            const originalQuantity = material.quantity || 0;
            const originalUnit = material.unitType || 'kg';
            const isTawsaya = material.priority === 'tawsaya';
            
            // تحديث الإحصائيات العامة
            totalQuantity += quantityInKg;
            validMaterialsCount++;
            
            // تسجيل في تحليلات الأقسام
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
            
            // ==================== المنطق الأساسي ====================
            // كل مادة تضاف تعتبر ناقصة (ما عدا التوصيات)
            
            if (!isTawsaya) {
                // هذه مادة عادية → تعتبر ناقصة بمقدار كميتها
                totalLowStockQuantity += quantityInKg;
                
                const materialStatus = {
                    name: material.name,
                    quantity: originalQuantity,
                    unit: originalUnit,
                    quantityInKg: quantityInKg,
                    status: 'ناقصة',
                    statusAr: `⚠️ ناقصة: ${originalQuantity} ${this.unitSystem.unitNames[originalUnit] || originalUnit}`,
                    isLowStock: true
                };
                
                lowStockMaterials.push(materialStatus);
                
                // تحديد المواد الحرجة (الكمية صفر أو منخفضة جداً)
                if (quantityInKg === 0) {
                    analysis.criticalStock.push({
                        name: material.name,
                        quantity: 0,
                        reason: 'المادة مفقودة بالكامل (0 كجم)',
                        urgency: 1
                    });
                } else if (quantityInKg < 0.5) {
                    analysis.criticalStock.push({
                        name: material.name,
                        quantity: quantityInKg,
                        reason: `كمية منخفضة جداً (${quantityInKg.toFixed(2)} كجم)`,
                        urgency: 2
                    });
                }
                
                // المواد الزائدة جداً (أكثر من 10 كجم)
                if (quantityInKg > 10) {
                    analysis.excessStock.push({
                        name: material.name,
                        quantity: quantityInKg,
                        originalQuantity: originalQuantity,
                        unit: originalUnit,
                        reason: `كمية كبيرة جداً (${quantityInKg.toFixed(2)} كجم)`,
                        suggestion: 'مراجعة الكمية - قد تكون زائدة عن الحاجة'
                    });
                    analysis.wasteRisks.push({
                        name: material.name,
                        quantity: quantityInKg,
                        risk: 'متوسط',
                        suggestedAction: 'مراقبة الكمية'
                    });
                }
                
                // توقع موعد النفاد (إذا كانت الكمية منخفضة)
                if (quantityInKg > 0 && quantityInKg < 5) {
                    const consumptionRate = this.getConsumptionRate(material.name);
                    const daysUntilEmpty = consumptionRate > 0 ? Math.floor(quantityInKg / consumptionRate) : 30;
                    
                    if (daysUntilEmpty < 14) {
                        analysis.predictions.push({
                            name: material.name,
                            currentQuantity: quantityInKg,
                            currentDisplay: `${originalQuantity} ${this.unitSystem.unitNames[originalUnit] || originalUnit}`,
                            daysUntilEmpty: daysUntilEmpty,
                            recommendedRestock: Math.ceil(consumptionRate * 14),
                            reason: `متوقع النفاد خلال ${daysUntilEmpty} يوم`
                        });
                    }
                }
                
            } else {
                // ==================== التوصيات ====================
                // التوصيات لا تعتبر ناقصة، تحسب بشكل منفصل
                tawsayaCount++;
                tawsayaTotalQuantity += quantityInKg;
            }
        }

        // ==================== تحديث الإحصائيات ====================
        analysis.statistics.totalMaterials = validMaterialsCount;
        analysis.statistics.totalQuantity = totalQuantity;
        analysis.statistics.lowStockCount = lowStockMaterials.length;
        analysis.statistics.lowStockTotalQuantity = totalLowStockQuantity;
        analysis.statistics.avgQuantity = validMaterialsCount > 0 ? (totalQuantity / validMaterialsCount).toFixed(2) : 0;
        analysis.statistics.categoriesBreakdown = categoriesData;
        analysis.statistics.tawsayaCount = tawsayaCount;
        analysis.statistics.tawsayaTotalQuantity = tawsayaTotalQuantity;
        analysis.statistics.totalValue = this.estimateTotalValue(materials);
        
        analysis.lowStock = lowStockMaterials;
        
        // ==================== إنشاء الرؤى والتوصيات ====================
        analysis.insights = this.generateInsights(analysis);
        analysis.smartRecommendations = this.generateSmartRecommendations(analysis);
        
        return analysis;
    }

    // تقدير القيمة الإجمالية للمخزون
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

    // الحصول على معدل استهلاك المادة
    getConsumptionRate(materialName) {
        const rates = {
            'ملح': 0.5, 'فلفل اسود ناعم': 0.3, 'كمون ناعم': 0.4, 'كركم': 0.2,
            'زنجبيل ناعم': 0.15, 'قرفة ناعمة': 0.2, 'هيل ناعم': 0.1, 'كزبرة ناعمة': 0.25,
            'شطة حدة وسط': 0.1, 'توم ناعم': 0.2, 'بصل ناعم': 0.2, 'سماق ناعم': 0.15,
            'شاورما': 0.25, 'كاري': 0.15, 'كبسة خليجية': 0.2
        };
        
        if (this.learningData.consumptionPatterns[materialName] && 
            this.learningData.consumptionPatterns[materialName].length > 0) {
            const avgConsumption = this.learningData.consumptionPatterns[materialName]
                .slice(-10)
                .reduce((sum, record) => sum + (record.quantity || 0), 0) / 10;
            if (avgConsumption > 0) return avgConsumption;
        }
        
        return rates[materialName] || 0.1;
    }

    // إنشاء التوصيات الذكية
    generateSmartRecommendations(analysis) {
        const recommendations = [];
        
        // المواد الحرجة
        if (analysis.criticalStock.length > 0) {
            recommendations.push({
                type: 'urgent',
                title: '⚠️ مواد حرجة - تحتاج شراء فوري',
                items: analysis.criticalStock.slice(0, 5).map(c => 
                    `${c.name} (${c.reason})`
                ),
                priority: 1,
                action: 'شراء فوري'
            });
        }
        
        // المواد الزائدة
        if (analysis.excessStock.length > 0) {
            recommendations.push({
                type: 'reduce',
                title: '📉 مواد بكميات كبيرة جداً',
                items: analysis.excessStock.slice(0, 3).map(e => 
                    `${e.name} - ${e.reason}`
                ),
                priority: 2,
                action: 'مراجعة الكميات'
            });
        }
        
        // توقعات النفاد
        if (analysis.predictions.length > 0) {
            recommendations.push({
                type: 'predictive',
                title: '🔮 توقعات النفاد (قريباً)',
                items: analysis.predictions.slice(0, 3).map(p => 
                    `${p.name}: ${p.reason}`
                ),
                priority: 2,
                action: 'التخطيط للشراء'
            });
        }
        
        return recommendations;
    }

    // إنشاء الرؤى الذكية
    generateInsights(analysis) {
        const insights = [];
        const stats = analysis.statistics;
        
        if (stats.totalMaterials === 0) {
            insights.push('✨ ابدأ بإضافة المواد إلى المخزون');
            insights.push('💡 كل مادة تضيفها تعتبر "ناقصة" بمقدار كميتها');
            insights.push('📦 التوصيات تحسب بشكل منفصل ولا تؤثر في إحصائيات النواقص');
        } else {
            // إحصائيات المواد الناقصة
            insights.push(`📊 إجمالي المواد في المخزون: ${stats.totalMaterials} مادة`);
            insights.push(`⚠️ المواد الناقصة: ${stats.lowStockCount} مادة (إجمالي النقص: ${stats.lowStockTotalQuantity.toFixed(2)} كجم)`);
            
            // عرض أسماء المواد الناقصة
            if (analysis.lowStock.length > 0 && analysis.lowStock.length <= 10) {
                const lowStockList = analysis.lowStock.map(m => 
                    `${m.name} (${m.quantity} ${this.unitSystem.unitNames[m.unit] || m.unit})`
                ).join('، ');
                insights.push(`📋 المواد الناقصة: ${lowStockList}`);
            } else if (analysis.lowStock.length > 10) {
                insights.push(`📋 لديك ${analysis.lowStock.length} مادة ناقصة في المخزون`);
            }
            
            // المواد الحرجة
            if (analysis.criticalStock.length > 0) {
                insights.push(`⚠️ تنبيه: ${analysis.criticalStock.length} مادة في حالة حرجة تحتاج شراء فوري`);
            }
            
            // القيمة التقديرية
            if (stats.totalValue > 0) {
                insights.push(`💰 القيمة التقديرية للمخزون: ${stats.totalValue.toFixed(0)} ريال`);
            }
            
            // إحصائيات التوصيات
            if (stats.tawsayaCount > 0) {
                insights.push(`🎁 التوصيات: ${stats.tawsayaCount} مادة (${stats.tawsayaTotalQuantity.toFixed(2)} كجم) - لا تدخل في حساب النواقص`);
            }
        }
        
        // نصائح مفيدة
        const tips = [
            '💡 كل مادة تضاف تعتبر "ناقصة" - هذا يساعدك في تتبع كل ما تحتاجه',
            '📦 التوصيات تحسب بشكل منفصل ولا تؤثر على إحصائيات النواقص',
            '🔄 اضغط مطولاً على أي مادة لنقلها إلى قسم آخر',
            '⭐ المواد الأساسية تحقق أعلى مبيعات - ركز عليها',
            '📊 راجع المخزون أسبوعياً لتحديد أولويات الشراء'
        ];
        insights.push(tips[Math.floor(Math.random() * tips.length)]);
        
        return insights;
    }

    // التعلم من تفاعلات المستخدم
    learnFromAction(action, material, details) {
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
}

// إنشاء النسخة العالمية
window.aiEngine = new AIEngine();
