class AIEngine {
    constructor() {
        this.learningData = this.loadLearningData();
    }
    loadLearningData() {
        try { const saved = localStorage.getItem('ai_learning_data'); return saved ? JSON.parse(saved) : {}; }
        catch(e) { return {}; }
    }
    saveLearningData() { try { localStorage.setItem('ai_learning_data', JSON.stringify(this.learningData)); } catch(e) {} }
    convertToKg(quantity, unit) {
        if (!quantity) return 0;
        const conv = { 'kg':1, 'half':0.5, 'quarter':0.25, 'oke':0.128, 'box':0.5, 'piece':0.1, 'bag':0.05 };
        return quantity * (conv[unit] || 1);
    }
    analyzeInventory(materials) {
        let totalQuantity = 0, lowStockCount = 0, lowStockTotal = 0, normalCount = 0, tawsayaCount = 0, tawsayaTotal = 0, zeroStockItems = [];
        for (const m of materials) {
            const isTawsaya = m.priority === 'tawsaya';
            const qty = this.convertToKg(m.quantity, m.unitType);
            if (!isTawsaya) {
                normalCount++; totalQuantity += qty; lowStockCount++; lowStockTotal += qty;
                if (qty === 0) zeroStockItems.push({ name: m.name });
            } else { tawsayaCount++; tawsayaTotal += qty; }
        }
        return {
            statistics: {
                totalMaterials: normalCount, totalQuantity: totalQuantity,
                lowStockCount: lowStockCount, lowStockTotalQuantity: lowStockTotal,
                avgQuantity: normalCount > 0 ? (totalQuantity / normalCount).toFixed(2) : 0,
                tawsayaCount: tawsayaCount, tawsayaTotalQuantity: tawsayaTotal
            },
            insights: this.getInsights(normalCount, lowStockCount, lowStockTotal, zeroStockItems.length, tawsayaCount, tawsayaTotal)
        };
    }
    getInsights(total, lowCount, lowTotal, zeroCount, tawsayaCount, tawsayaTotal) {
        const insights = [];
        if (total === 0) {
            insights.push('✨ لا توجد مواد في المخزون');
            insights.push('💡 أضف مواد جديدة باستخدام زر "إضافة مادة جديدة"');
        } else {
            insights.push(`📊 إجمالي المواد: ${total} مادة`);
            insights.push(`⚠️ المواد الناقصة: ${lowCount} مادة (${lowTotal.toFixed(2)} كجم)`);
            if (zeroCount > 0) insights.push(`🔴 ${zeroCount} مواد مفقودة بالكامل`);
            if (tawsayaCount > 0) insights.push(`🎁 التوصيات: ${tawsayaCount} مادة (${tawsayaTotal.toFixed(2)} كجم)`);
        }
        const tips = ['💡 اضغط مطولاً على أي مادة لنقلها', '📦 يمكنك نقل المواد بين جميع الأقسام', '🔄 المزامنة التلقائية تحفظ بياناتك'];
        insights.push(tips[Math.floor(Math.random() * tips.length)]);
        return insights;
    }
}
window.aiEngine = new AIEngine();
