// ==================== محرك الذكاء الاصطناعي ====================

class AIEngine {
    constructor() {
        console.log("AI Engine Initialized");
    }

    convertToKg(quantity, unit) {
        if (!quantity) return 0;
        const conv = { 'kg':1, 'half':0.5, 'quarter':0.25, 'oke':0.128, 'box':0.5, 'piece':0.1, 'bag':0.05 };
        return quantity * (conv[unit] || 1);
    }

    analyzeInventory(materials) {
        let totalQuantity = 0;
        let lowStockCount = 0;
        let lowStockTotal = 0;
        let normalCount = 0;
        let tawsayaCount = 0;
        let criticalList = [];
        let lowStockList = [];

        for (const m of materials) {
            const isTawsaya = m.priority === 'tawsaya';
            const qty = this.convertToKg(m.quantity, m.unitType);
            
            if (!isTawsaya) {
                normalCount++;
                totalQuantity += qty;
                lowStockCount++;
                lowStockTotal += qty;
                lowStockList.push({ name: m.name, quantity: m.quantity, unit: m.unitType, qtyKg: qty });
                if (qty === 0) criticalList.push({ name: m.name, reason: 'مفقودة' });
            } else {
                tawsayaCount++;
            }
        }

        return {
            statistics: {
                totalMaterials: normalCount,
                totalQuantity: totalQuantity,
                lowStockCount: lowStockCount,
                lowStockTotalQuantity: lowStockTotal,
                avgQuantity: normalCount > 0 ? (totalQuantity / normalCount).toFixed(2) : 0,
                tawsayaCount: tawsayaCount
            },
            lowStock: lowStockList,
            criticalStock: criticalList,
            insights: this.getInsights(normalCount, lowStockCount, lowStockTotal, criticalList.length, tawsayaCount)
        };
    }

    getInsights(total, lowCount, lowTotal, criticalCount, tawsayaCount) {
        const insights = [];
        if (total === 0) {
            insights.push('✨ لا توجد مواد، أضف مواد جديدة');
            insights.push('💡 كل مادة تضاف تعتبر ناقصة بمقدار كميتها');
        } else {
            insights.push(`📊 عدد المواد: ${total}`);
            insights.push(`⚠️ المواد الناقصة: ${lowCount} (${lowTotal.toFixed(2)} كجم)`);
            if (criticalCount > 0) insights.push(`🔴 ${criticalCount} مواد مفقودة بالكامل`);
            if (tawsayaCount > 0) insights.push(`🎁 التوصيات: ${tawsayaCount} مادة (منفصلة)`);
        }
        return insights;
    }
}

window.aiEngine = new AIEngine();
