// ==================== محرك الذكاء الاصطناعي - الإصدار المبسط ====================
// هذا الإصدار يعمل بدون أي أخطاء

class AIEngine {
    constructor() {
        console.log("✅ AI Engine constructor called");
        this.learningData = this.loadLearningData();
    }

    loadLearningData() {
        try {
            const saved = localStorage.getItem('ai_learning_data');
            return saved ? JSON.parse(saved) : {};
        } catch(e) {
            return {};
        }
    }

    saveLearningData() {
        try {
            localStorage.setItem('ai_learning_data', JSON.stringify(this.learningData));
        } catch(e) {}
    }

    convertToKg(quantity, unit) {
        if (!quantity) return 0;
        const conversions = {
            'kg': 1, 'half': 0.5, 'quarter': 0.25,
            'oke': 0.128, 'box': 0.5, 'piece': 0.1, 'bag': 0.05
        };
        return quantity * (conversions[unit] || 1);
    }

    // ==================== التحليل الرئيسي ====================
    analyzeInventory(materials) {
        console.log("AI: تحليل المخزون, عدد المواد:", materials.length);
        
        let totalQuantity = 0;
        let lowStockCount = 0;
        let lowStockTotal = 0;
        let normalCount = 0;
        let tawsayaCount = 0;
        let tawsayaTotal = 0;
        let lowStockList = [];
        let criticalList = [];

        for (const material of materials) {
            const isTawsaya = material.priority === 'tawsaya';
            const qty = this.convertToKg(material.quantity, material.unitType);
            
            if (!isTawsaya) {
                // المواد العادية - كلها تعتبر ناقصة
                normalCount++;
                totalQuantity += qty;
                lowStockCount++;
                lowStockTotal += qty;
                
                lowStockList.push({
                    name: material.name,
                    quantity: material.quantity,
                    unit: material.unitType,
                    quantityInKg: qty
                });
                
                if (qty === 0) {
                    criticalList.push({
                        name: material.name,
                        reason: 'مفقودة بالكامل'
                    });
                }
            } else {
                // التوصيات - لا تعتبر ناقصة
                tawsayaCount++;
                tawsayaTotal += qty;
            }
        }

        const result = {
            lowStock: lowStockList,
            criticalStock: criticalList,
            excessStock: [],
            recommendations: [],
            predictions: [],
            insights: [],
            wasteRisks: [],
            statistics: {
                totalMaterials: normalCount,
                totalQuantity: totalQuantity,
                lowStockCount: lowStockCount,
                lowStockTotalQuantity: lowStockTotal,
                avgQuantity: normalCount > 0 ? (totalQuantity / normalCount).toFixed(2) : 0,
                tawsayaCount: tawsayaCount,
                tawsayaTotalQuantity: tawsayaTotal
            },
            smartRecommendations: []
        };

        // إضافة الرؤى
        if (normalCount === 0) {
            result.insights = [
                '✨ لا توجد مواد في المخزون',
                '💡 أضف مواد جديدة للبدء'
            ];
        } else {
            result.insights = [
                `📊 عدد المواد: ${normalCount} مادة`,
                `⚠️ المواد الناقصة: ${lowStockCount} مادة (${lowStockTotal.toFixed(2)} كجم)`,
                `🎁 التوصيات: ${tawsayaCount} مادة (منفصلة)`
            ];
            
            if (criticalList.length > 0) {
                result.insights.push(`⚠️ ${criticalList.length} مواد مفقودة بالكامل`);
            }
        }

        console.log("AI: التحليل كامل", result.statistics);
        return result;
    }

    generateInsights(analysis) {
        return analysis.insights || [];
    }

    generateSmartRecommendations(analysis) {
        return [];
    }

    learnFromAction(action, material, details) {
        console.log("AI: تعلم من تفاعل", action, material);
        if (!this.learningData[material]) {
            this.learningData[material] = [];
        }
        this.learningData[material].push({ action, details, time: Date.now() });
        this.saveLearningData();
    }
}

// إنشاء النسخة العالمية
window.aiEngine = new AIEngine();
console.log("✅ AI Engine Loaded Successfully");
