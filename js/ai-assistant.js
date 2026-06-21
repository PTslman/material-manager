// ==================== المساعد الذكي ====================

const AIAssistant = {
    analyzeStockLevels(materials) {
        const analysis = { critical: [], warning: [], optimal: [], excess: [] };
        
        for (const m of materials) {
            if (m.priority === 'tawsaya') continue;
            const qty = window.aiEngine ? window.aiEngine.convertToKg(m.quantity, m.unitType) : (m.quantity || 0);
            
            if (qty === 0) {
                analysis.critical.push({ name: m.name, status: 'مفقودة بالكامل', action: 'شراء فوري' });
            } else if (qty < 0.5) {
                analysis.critical.push({ name: m.name, status: 'كمية حرجة', action: 'شراء عاجل' });
            } else if (qty < 1) {
                analysis.warning.push({ name: m.name, status: 'كمية منخفضة', action: 'مراجعة' });
            } else if (qty > 10) {
                analysis.excess.push({ name: m.name, status: 'كمية زائدة', action: 'تخفيض' });
            } else {
                analysis.optimal.push({ name: m.name, status: 'مناسب', action: 'متابعة' });
            }
        }
        return analysis;
    },
    
    estimatePrice(materialName) {
        const prices = {
            'ملح': 2, 'فلفل اسود ناعم': 25, 'كمون ناعم': 20, 'كركم': 15,
            'زنجبيل ناعم': 18, 'قرفة ناعمة': 22, 'هيل ناعم': 80, 'كزبرة ناعمة': 12,
            'شطة حدة وسط': 16, 'توم ناعم': 14, 'بصل ناعم': 12, 'سماق ناعم': 18,
            'شاورما': 20, 'كاري': 15, 'جوز هند خشن': 25, 'نسكافية خشنة': 35
        };
        return prices[materialName] || 10;
    },
    
    predictDemand(materials) {
        const predictions = [];
        for (const m of materials) {
            if (m.priority === 'tawsaya') continue;
            const rate = window.aiEngine ? window.aiEngine.getConsumptionRate(m.name) : 0.1;
            const qty = window.aiEngine ? window.aiEngine.convertToKg(m.quantity, m.unitType) : (m.quantity || 0);
            const weeks = rate > 0 ? (qty / rate) : 30;
            
            if (weeks < 2) {
                predictions.push({ name: m.name, weeksUntilEmpty: weeks.toFixed(1), urgency: 'حرجة', action: 'شراء فوري' });
            } else if (weeks < 4) {
                predictions.push({ name: m.name, weeksUntilEmpty: weeks.toFixed(1), urgency: 'متوسطة', action: 'التخطيط للشراء' });
            }
        }
        return predictions;
    },
    
    calculateTotalValue(materials) {
        let total = 0;
        for (const m of materials) {
            if (m.priority === 'tawsaya') continue;
            const qty = window.aiEngine ? window.aiEngine.convertToKg(m.quantity, m.unitType) : (m.quantity || 0);
            const price = this.estimatePrice(m.name);
            total += qty * price;
        }
        return Math.round(total);
    },
    
    getFullReport(materials) {
        const stock = this.analyzeStockLevels(materials);
        const demand = this.predictDemand(materials);
        const value = this.calculateTotalValue(materials);
        const normalCount = materials.filter(m => m.priority !== 'tawsaya').length;
        
        return {
            summary: {
                totalMaterials: normalCount,
                totalValue: value,
                criticalCount: stock.critical.length,
                warningCount: stock.warning.length,
                excessCount: stock.excess.length
            },
            stockAnalysis: stock,
            demandPredictions: demand,
            generatedAt: new Date().toLocaleString('ar-SA')
        };
    }
};

window.AIAssistant = AIAssistant;
