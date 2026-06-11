// ==================== المساعد الذكي المخفي ====================

var AIAssistant = {
    // تحليل المخزون المتقدم
    analyzeStockLevels: function(materials) {
        var analysis = {
            critical: [],
            warning: [],
            optimal: [],
            excess: []
        };
        
        for (var i = 0; i < materials.length; i++) {
            var m = materials[i];
            if (m.priority === 'tawsaya') continue;
            
            var qty = m.quantity || 0;
            var unit = m.unitType || 'kg';
            var qtyInKg = window.aiEngine ? window.aiEngine.convertToKg(qty, unit) : qty;
            
            if (qtyInKg === 0) {
                analysis.critical.push({ name: m.name, status: 'مفقودة بالكامل', action: 'شراء فوري' });
            } else if (qtyInKg < 0.5) {
                analysis.critical.push({ name: m.name, status: 'كمية حرجة', action: 'شراء عاجل' });
            } else if (qtyInKg < 1) {
                analysis.warning.push({ name: m.name, status: 'كمية منخفضة', action: 'مراجعة' });
            } else if (qtyInKg > 10) {
                analysis.excess.push({ name: m.name, status: 'كمية زائدة', action: 'تخفيض' });
            } else {
                analysis.optimal.push({ name: m.name, status: 'مناسب', action: 'متابعة' });
            }
        }
        
        return analysis;
    },
    
    // توصيات الشراء الذكية
    getPurchaseRecommendations: function(materials, budget) {
        var recommendations = [];
        var criticalNeeds = [];
        var totalCost = 0;
        
        for (var i = 0; i < materials.length; i++) {
            var m = materials[i];
            if (m.priority === 'tawsaya') continue;
            
            var qty = m.quantity || 0;
            var unit = m.unitType || 'kg';
            var qtyInKg = window.aiEngine ? window.aiEngine.convertToKg(qty, unit) : qty;
            var estimatedPrice = this.estimatePrice(m.name);
            
            if (qtyInKg < 1) {
                var neededQty = 2 - qtyInKg;
                var cost = neededQty * estimatedPrice;
                criticalNeeds.push({
                    name: m.name,
                    currentQty: qtyInKg,
                    neededQty: neededQty,
                    estimatedCost: cost,
                    priority: qtyInKg === 0 ? 'عالية جداً' : 'عالية'
                });
                totalCost += cost;
            }
        }
        
        criticalNeeds.sort(function(a, b) { 
            if (a.priority === 'عالية جداً' && b.priority !== 'عالية جداً') return -1;
            if (a.priority !== 'عالية جداً' && b.priority === 'عالية جداً') return 1;
            return b.estimatedCost - a.estimatedCost;
        });
        
        return {
            criticalNeeds: criticalNeeds,
            totalEstimatedCost: totalCost,
            recommendation: totalCost > (budget || 500) ? 'تجاوزت الميزانية - أولوية للمواد الحرجة' : 'مناسب ضمن الميزانية'
        };
    },
    
    // تقدير سعر المادة
    estimatePrice: function(materialName) {
        var prices = {
            'ملح': 2, 'فلفل اسود ناعم': 25, 'كمون ناعم': 20, 'كركم': 15,
            'زنجبيل ناعم': 18, 'قرفة ناعمة': 22, 'هيل ناعم': 80, 'كزبرة ناعمة': 12,
            'شطة حدة وسط': 16, 'توم ناعم': 14, 'بصل ناعم': 12, 'سماق ناعم': 18,
            'شاورما': 20, 'كاري': 15, 'جوز هند خشن': 25
        };
        return prices[materialName] || 10;
    },
    
    // التنبؤ بالطلب المستقبلي
    predictDemand: function(materials, historicalData) {
        var predictions = [];
        
        for (var i = 0; i < materials.length; i++) {
            var m = materials[i];
            if (m.priority === 'tawsaya') continue;
            
            var consumptionRate = window.aiEngine ? window.aiEngine.getConsumptionRate(m.name) : 0.1;
            var currentQty = window.aiEngine ? window.aiEngine.convertToKg(m.quantity, m.unitType) : (m.quantity || 0);
            var weeksUntilEmpty = consumptionRate > 0 ? (currentQty / consumptionRate) : 30;
            
            if (weeksUntilEmpty < 2) {
                predictions.push({
                    name: m.name,
                    weeksUntilEmpty: weeksUntilEmpty.toFixed(1),
                    urgency: 'حرجة',
                    action: 'شراء فوري'
                });
            } else if (weeksUntilEmpty < 4) {
                predictions.push({
                    name: m.name,
                    weeksUntilEmpty: weeksUntilEmpty.toFixed(1),
                    urgency: 'متوسطة',
                    action: 'التخطيط للشراء'
                });
            }
        }
        
        return predictions;
    },
    
    // تحسين كفاءة المخزون
    optimizeInventory: function(materials) {
        var suggestions = [];
        var slowMovingItems = [];
        var overstockedItems = [];
        
        for (var i = 0; i < materials.length; i++) {
            var m = materials[i];
            if (m.priority === 'tawsaya') continue;
            
            var qty = window.aiEngine ? window.aiEngine.convertToKg(m.quantity, m.unitType) : (m.quantity || 0);
            
            if (qty > 10) {
                overstockedItems.push({
                    name: m.name,
                    quantity: qty,
                    suggestion: 'تخفيض الكمية أو مشاركتها مع فروع أخرى'
                });
            }
        }
        
        if (overstockedItems.length > 0) {
            suggestions.push({
                type: 'overstock',
                title: '📦 مواد بكميات زائدة',
                items: overstockedItems.slice(0, 5)
            });
        }
        
        return suggestions;
    },
    
    // حساب القيمة الإجمالية للمخزون
    calculateTotalValue: function(materials) {
        var totalValue = 0;
        for (var i = 0; i < materials.length; i++) {
            var m = materials[i];
            if (m.priority === 'tawsaya') continue;
            var qty = window.aiEngine ? window.aiEngine.convertToKg(m.quantity, m.unitType) : (m.quantity || 0);
            var price = this.estimatePrice(m.name);
            totalValue += qty * price;
        }
        return Math.round(totalValue);
    },
    
    // الحصول على تقرير كامل
    getFullReport: function(materials) {
        var stockAnalysis = this.analyzeStockLevels(materials);
        var purchaseRecs = this.getPurchaseRecommendations(materials, 1000);
        var demandPrediction = this.predictDemand(materials);
        var optimizations = this.optimizeInventory(materials);
        var totalValue = this.calculateTotalValue(materials);
        
        return {
            summary: {
                totalMaterials: materials.filter(function(m) { return m.priority !== 'tawsaya'; }).length,
                totalValue: totalValue,
                criticalCount: stockAnalysis.critical.length,
                warningCount: stockAnalysis.warning.length,
                excessCount: stockAnalysis.excess.length
            },
            stockAnalysis: stockAnalysis,
            purchaseRecommendations: purchaseRecs,
            demandPredictions: demandPrediction,
            optimizationSuggestions: optimizations,
            generatedAt: new Date().toLocaleString('ar-SA')
        };
    }
};

window.AIAssistant = AIAssistant;
console.log('✅ AI Assistant loaded');
