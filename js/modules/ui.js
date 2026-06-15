// ==================== واجهة المستخدم ====================

function renderCategories() {
    var container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    var categories = [
        { id: 'main', icon: 'fas fa-star', title: 'أساسيات', color: '#f59e0b' },
        { id: 'extra', icon: 'fas fa-plus-circle', title: 'إضافي', color: '#3b82f6' },
        { id: 'bags', icon: 'fas fa-shopping-bag', title: 'أكياس تعبئة', color: '#ec4899' },
        { id: 'tawsaya', icon: 'fas fa-gift', title: 'توصيات', color: '#06b6d4' }
    ];
    
    container.innerHTML = '';
    
    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        container.innerHTML += '<button class="category-card" data-category="' + cat.id + '" style="border-right: 3px solid ' + cat.color + ';">' +
            '<div class="category-icon" style="background: linear-gradient(135deg, ' + cat.color + '15, ' + cat.color + '25);">' +
            '<i class="' + cat.icon + '" style="color: ' + cat.color + ';"></i></div>' +
            '<div class="category-info"><h3 class="category-title">' + cat.title + '</h3></div>' +
            '<div class="category-count" id="count-' + cat.id + '">0</div>' +
            '<div class="category-arrow"><i class="fas fa-chevron-left"></i></div></button>';
    }
}

function renderSections(materials) {
    var container = document.getElementById('sectionsContainer');
    if (!container) return;
    
    var sections = ['main', 'extra', 'bags', 'tawsaya'];
    var html = '';
    
    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionMaterials = materials.filter(function(m) { 
            return m.priority === section;
        });
        
        html += '<div class="priority-section" data-section="' + section + '">' +
            '<div class="section-header">' +
                '<div class="section-title">' +
                    '<i class="' + getSectionIcon(section) + '"></i>' +
                    '<span>' + getSectionTitle(section) + '</span>' +
                '</div>' +
                '<div class="section-count">' + sectionMaterials.length + '</div>' +
            '</div>' +
            '<div class="materials-grid" data-section="' + section + '">';
        
        if (sectionMaterials.length === 0) {
            html += '<div class="empty-state">' +
                '<i class="fas fa-box-open"></i>' +
                '<br>لا توجد مواد' +
                '<br><small>اسحب وأفلت المواد من الأقسام الأخرى</small>' +
                '</div>';
        } else {
            for (var j = 0; j < sectionMaterials.length; j++) {
                html += renderMaterialCard(sectionMaterials[j]);
            }
        }
        
        html += '</div></div>';
    }
    
    container.innerHTML = html;
    
    bindCardButtons();
    
    setTimeout(function() { 
        if (typeof initDragAndDrop === 'function') {
            initDragAndDrop();
        }
    }, 100);
}

function renderMaterialCard(m) {
    var isLowStock = (!m.quantity || m.quantity === 0) && m.priority !== 'tawsaya';
    var lowStockClass = isLowStock ? 'low-stock' : '';
    var quantityDisplay = formatDisplay(m);
    
    if (isLowStock && m.priority !== 'tawsaya') {
        quantityDisplay = '⚠️ ناقصة';
    }
    
    return '<div class="material-card ' + lowStockClass + '" ' +
                'data-id="' + m.id + '" ' +
                'data-name="' + escapeHtml(m.name) + '" ' +
                'data-section="' + m.priority + '">' +
            '<div class="card-header">' +
                '<div class="card-title">' +
                    '<i class="fas fa-box"></i>' +
                    '<span>' + escapeHtml(m.name) + '</span>' +
                '</div>' +
                '<div class="card-actions">' +
                    '<button class="edit-material" data-id="' + m.id + '" title="تعديل الكمية">' +
                        '<i class="fas fa-edit"></i>' +
                    '</button>' +
                    '<button class="delete-material" data-id="' + m.id + '" title="حذف المادة">' +
                        '<i class="fas fa-trash-alt"></i>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="qty-badge">' + quantityDisplay + '</div>' +
        '</div>';
}

function bindCardButtons() {
    var editBtns = document.querySelectorAll('.edit-material');
    for (var i = 0; i < editBtns.length; i++) {
        editBtns[i].removeEventListener('click', editClickHandler);
        editBtns[i].addEventListener('click', editClickHandler);
    }
    
    function editClickHandler(e) {
        e.stopPropagation();
        e.preventDefault();
        
        var id = this.getAttribute('data-id');
        var material = window.allMaterials ? window.allMaterials.find(function(m) { 
            return m.id === id; 
        }) : null;
        
        if (material) {
            window.currentEditId = id;
            document.getElementById('editMaterialName').value = material.name;
            document.getElementById('editQuantityValue').value = material.quantity;
            document.getElementById('editUnitSelect').value = material.unitType || 'kg';
            document.getElementById('editModal').classList.add('active');
        }
    }
    
    var delBtns = document.querySelectorAll('.delete-material');
    for (var i = 0; i < delBtns.length; i++) {
        delBtns[i].removeEventListener('click', deleteClickHandler);
        delBtns[i].addEventListener('click', deleteClickHandler);
    }
    
    function deleteClickHandler(e) {
        e.stopPropagation();
        e.preventDefault();
        
        var id = this.getAttribute('data-id');
        var material = window.allMaterials ? window.allMaterials.find(function(m) { 
            return m.id === id; 
        }) : null;
        
        if (confirm('⚠️ هل أنت متأكد من حذف "' + (material?.name || 'هذه المادة') + '"؟')) {
            materialsCollection.doc(id).delete()
                .then(function() { 
                    if (typeof showToastMessage === 'function') {
                        showToastMessage('✅ تم الحذف');
                    }
                })
                .catch(function(e) { 
                    if (typeof showToastMessage === 'function') {
                        showToastMessage('❌ فشل الحذف', true);
                    }
                });
        }
    }
}

function updateCategoryCounts() {
    var counts = { main: 0, extra: 0, bags: 0, tawsaya: 0 };
    
    if (!window.allMaterials) return;
    
    for (var i = 0; i < window.allMaterials.length; i++) {
        var m = window.allMaterials[i];
        counts[m.priority] = (counts[m.priority] || 0) + 1;
    }
    
    for (var key in counts) {
        var el = document.getElementById('count-' + key);
        if (el) {
            el.innerText = counts[key];
        }
    }
}

function calculateAIMetrics() {
    if (!window.aiEngine) {
        return;
    }
    
    var materials = window.allMaterials || [];
    var analysis = window.aiEngine.analyzeInventorySync(materials, window.getMaterialPrice);
    
    if (!analysis) {
        showAIFallback();
        return;
    }
    
    updateAIDisplay(analysis);
}

function updateAIDisplay(analysis) {
    if (!analysis) {
        showAIFallback();
        return;
    }
    
    var totalQtyEl = document.getElementById('totalQuantityValue');
    if (totalQtyEl) {
        totalQtyEl.innerText = analysis.totalWeight || '0';
    }
    
    var totalValueEl = document.getElementById('totalValueValue');
    if (totalValueEl) {
        var discountText = '';
        if (analysis.discountPercent) {
            discountText = '<span class="ai-stat-unit" style="font-size:0.65rem;"> (بعد خصم ' + analysis.discountPercent + '%)</span>';
        }
        totalValueEl.innerHTML = (analysis.totalValue || '0') + discountText;
    }
    
    var lowStockEl = document.getElementById('lowStockCount');
    if (lowStockEl) {
        lowStockEl.innerHTML = (analysis.lowStockCount || 0) + '<span class="ai-stat-unit"> مادة</span>';
    }
    
    var insightsDiv = document.getElementById('aiInsights');
    if (insightsDiv && analysis.insights) {
        var insightsContent = insightsDiv.querySelector('.insights-content');
        if (insightsContent) {
            var html = '';
            for (var i = 0; i < analysis.insights.length; i++) {
                html += '<div class="insight-item">' + (analysis.insights[i] || '') + '</div>';
            }
            insightsContent.innerHTML = html;
        }
    }
    
    var priceDetailsEl = document.getElementById('priceDetails');
    if (priceDetailsEl) {
        if (analysis.priceBreakdown && analysis.priceBreakdown.length > 0) {
            var priceHtml = '<div class="price-details-header"><i class="fas fa-chart-pie"></i> تفاصيل الأسعار (قبل الخصم / بعد الخصم)</div>';
            for (var i = 0; i < analysis.priceBreakdown.length; i++) {
                var p = analysis.priceBreakdown[i];
                priceHtml += '<div class="price-detail-item">' +
                    '<span class="price-detail-name">' + escapeHtml(p.name) + '</span>' +
                    '<span class="price-detail-value">' + (p.formattedValueBefore || '0 ل.س') + ' → ' + (p.formattedValueAfter || '0 ل.س') + '</span>' +
                    '</div>';
            }
            priceDetailsEl.innerHTML = priceHtml;
        } else {
            priceDetailsEl.innerHTML = '<div class="price-details-header"><i class="fas fa-chart-pie"></i> تفاصيل الأسعار</div>' +
                '<div class="price-detail-item"><span class="price-detail-name">لا توجد أسعار محددة</span><span class="price-detail-value">-</span></div>';
        }
    }
}

function showAIFallback() {
    var insightsDiv = document.getElementById('aiInsights');
    if (insightsDiv) {
        var insightsContent = insightsDiv.querySelector('.insights-content');
        if (insightsContent) {
            insightsContent.innerHTML = '<span>جاري تحليل البيانات...</span>';
        }
    }
}

function getSectionIcon(section) {
    var icons = {
        'main': 'fas fa-star',
        'extra': 'fas fa-plus-circle',
        'bags': 'fas fa-shopping-bag',
        'tawsaya': 'fas fa-gift'
    };
    return icons[section] || 'fas fa-box';
}

function getSectionTitle(section) {
    var titles = {
        'main': '⭐ أساسيات',
        'extra': '➕ إضافي',
        'bags': '🛍️ أكياس تعبئة',
        'tawsaya': '🎁 توصيات'
    };
    return titles[section] || section;
}

window.renderCategories = renderCategories;
window.renderSections = renderSections;
window.renderMaterialCard = renderMaterialCard;
window.bindCardButtons = bindCardButtons;
window.updateCategoryCounts = updateCategoryCounts;
window.calculateAIMetrics = calculateAIMetrics;
window.getSectionIcon = getSectionIcon;
window.getSectionTitle = getSectionTitle;
