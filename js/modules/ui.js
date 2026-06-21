// ==================== واجهة المستخدم المتقدمة ====================

const UI = {
    elements: {},
    
    getElement(id) {
        if (!this.elements[id]) {
            this.elements[id] = document.getElementById(id);
        }
        return this.elements[id];
    }
};

function renderCategories() {
    const container = UI.getElement('categoriesContainer');
    if (!container) return;
    
    const categories = [
        { id: 'main', icon: 'fas fa-star', title: 'أساسيات', color: '#f59e0b' },
        { id: 'extra', icon: 'fas fa-plus-circle', title: 'إضافي', color: '#3b82f6' },
        { id: 'bags', icon: 'fas fa-shopping-bag', title: 'أكياس تعبئة', color: '#ec4899' },
        { id: 'tawsaya', icon: 'fas fa-gift', title: 'توصيات', color: '#06b6d4' }
    ];
    
    container.innerHTML = categories.map(cat => `
        <button class="category-card" data-category="${cat.id}" style="border-right: 3px solid ${cat.color};">
            <div class="category-icon" style="background: linear-gradient(135deg, ${cat.color}15, ${cat.color}25);">
                <i class="${cat.icon}" style="color: ${cat.color};"></i>
            </div>
            <div class="category-info"><h3 class="category-title">${cat.title}</h3></div>
            <div class="category-count" id="count-${cat.id}">0</div>
            <div class="category-arrow"><i class="fas fa-chevron-left"></i></div>
        </button>
    `).join('');
}

function renderSections(materials) {
    const container = UI.getElement('sectionsContainer');
    if (!container) return;
    
    const sections = ['main', 'extra', 'bags', 'tawsaya'];
    let html = '';
    
    for (const section of sections) {
        const sectionMaterials = materials.filter(m => m.priority === section);
        
        html += `
            <div class="priority-section" data-section="${section}">
                <div class="section-header">
                    <div class="section-title">
                        <i class="${getSectionIcon(section)}"></i>
                        <span>${getSectionTitle(section)}</span>
                    </div>
                    <div class="section-count">${sectionMaterials.length}</div>
                </div>
                <div class="materials-grid" data-section="${section}">
                    ${sectionMaterials.length === 0 ? 
                        `<div class="empty-state"><i class="fas fa-box-open"></i><br>لا توجد مواد<br><small>اسحب وأفلت المواد من الأقسام الأخرى</small></div>` : 
                        sectionMaterials.map(m => renderMaterialCard(m)).join('')
                    }
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    bindCardButtons();
    
    setTimeout(() => {
        if (typeof initDragAndDrop === 'function') {
            initDragAndDrop();
        }
    }, 100);
}

function renderMaterialCard(m) {
    const isLowStock = (!m.quantity || m.quantity === 0) && m.priority !== 'tawsaya';
    const lowStockClass = isLowStock ? 'low-stock' : '';
    let quantityDisplay = formatDisplay(m);
    
    if (isLowStock && m.priority !== 'tawsaya') {
        quantityDisplay = '⚠️ ناقصة';
    }
    
    return `
        <div class="material-card ${lowStockClass}" data-id="${m.id}" data-name="${escapeHtml(m.name)}" data-section="${m.priority}">
            <div class="card-header">
                <div class="card-title"><i class="fas fa-box"></i><span>${escapeHtml(m.name)}</span></div>
                <div class="card-actions">
                    <button class="edit-material" data-id="${m.id}" title="تعديل الكمية"><i class="fas fa-edit"></i></button>
                    <button class="delete-material" data-id="${m.id}" title="حذف المادة"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="qty-badge">${quantityDisplay}</div>
        </div>
    `;
}

function bindCardButtons() {
    document.querySelectorAll('.edit-material').forEach(btn => {
        btn.removeEventListener('click', _handleEditClick);
        btn.addEventListener('click', _handleEditClick);
    });
    
    document.querySelectorAll('.delete-material').forEach(btn => {
        btn.removeEventListener('click', _handleDeleteClick);
        btn.addEventListener('click', _handleDeleteClick);
    });
}

function _handleEditClick(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const id = this.dataset.id;
    const material = window.allMaterials?.find(m => m.id === id);
    
    if (material) {
        window.currentEditId = id;
        document.getElementById('editMaterialName').value = material.name;
        document.getElementById('editQuantityValue').value = material.quantity;
        document.getElementById('editUnitSelect').value = material.unitType || 'kg';
        document.getElementById('editModal').classList.add('active');
    }
}

function _handleDeleteClick(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const id = this.dataset.id;
    const material = window.allMaterials?.find(m => m.id === id);
    
    if (confirm(`⚠️ هل أنت متأكد من حذف "${material?.name || 'هذه المادة'}"؟`)) {
        materialsCollection.doc(id).delete()
            .then(() => showToastMessage('✅ تم الحذف'))
            .catch(() => showToastMessage('❌ فشل الحذف', true));
    }
}

function updateCategoryCounts() {
    const counts = { main: 0, extra: 0, bags: 0, tawsaya: 0 };
    
    if (window.allMaterials) {
        for (const m of window.allMaterials) {
            counts[m.priority] = (counts[m.priority] || 0) + 1;
        }
    }
    
    for (const [key, value] of Object.entries(counts)) {
        const el = document.getElementById(`count-${key}`);
        if (el) el.innerText = value;
    }
}

function calculateAIMetrics() {
    if (!window.aiEngine) {
        return;
    }
    
    try {
        const materials = window.allMaterials || [];
        const analysis = window.aiEngine.analyzeInventorySync(materials, window.getMaterialPrice);
        
        if (!analysis) {
            _showAIFallback();
            return;
        }
        
        _updateAIDisplay(analysis);
    } catch(e) {
        _showAIFallback();
    }
}

function _updateAIDisplay(analysis) {
    if (!analysis) {
        _showAIFallback();
        return;
    }
    
    const totalQtyEl = document.getElementById('totalQuantityValue');
    if (totalQtyEl) totalQtyEl.innerText = analysis.totalWeight || '0';
    
    const totalValueEl = document.getElementById('totalValueValue');
    if (totalValueEl) {
        const discountText = analysis.discountPercent ? 
            `<span class="ai-stat-unit" style="font-size:0.65rem;display:block;">بعد خصم ${analysis.discountPercent}%</span>` : '';
        totalValueEl.innerHTML = `${analysis.totalValue || '0'} ${discountText}`;
    }
    
    const lowStockEl = document.getElementById('lowStockCount');
    if (lowStockEl) {
        lowStockEl.innerHTML = `${analysis.lowStockCount || 0}<span class="ai-stat-unit"> مادة</span>`;
    }
    
    const insightsDiv = document.getElementById('aiInsights');
    if (insightsDiv && analysis.insights) {
        const insightsContent = insightsDiv.querySelector('.insights-content');
        if (insightsContent) {
            insightsContent.innerHTML = analysis.insights.map(insight => 
                `<div class="insight-item">${insight}</div>`
            ).join('');
        }
    }
    
    const priceDetailsEl = document.getElementById('priceDetails');
    if (priceDetailsEl) {
        if (analysis.priceBreakdown && analysis.priceBreakdown.length > 0) {
            let priceHtml = `<div class="price-details-header"><i class="fas fa-chart-pie"></i> تفاصيل الأسعار (قبل الخصم → بعد الخصم)</div>`;
            for (const p of analysis.priceBreakdown) {
                priceHtml += `
                    <div class="price-detail-item">
                        <span class="price-detail-name">${escapeHtml(p.name)}</span>
                        <span class="price-detail-value">${p.formattedValueBefore || '0 ل.س'} → ${p.formattedValueAfter || '0 ل.س'}</span>
                    </div>
                `;
            }
            priceDetailsEl.innerHTML = priceHtml;
        } else {
            priceDetailsEl.innerHTML = `
                <div class="price-details-header"><i class="fas fa-chart-pie"></i> تفاصيل الأسعار</div>
                <div class="price-detail-item"><span class="price-detail-name">لا توجد أسعار محددة</span><span class="price-detail-value">-</span></div>
            `;
        }
    }
}

function _showAIFallback() {
    const insightsDiv = document.getElementById('aiInsights');
    if (insightsDiv) {
        const insightsContent = insightsDiv.querySelector('.insights-content');
        if (insightsContent) {
            insightsContent.innerHTML = '<span>جاري تحليل البيانات...</span>';
        }
    }
}

function getSectionIcon(section) {
    const icons = {
        'main': 'fas fa-star',
        'extra': 'fas fa-plus-circle',
        'bags': 'fas fa-shopping-bag',
        'tawsaya': 'fas fa-gift'
    };
    return icons[section] || 'fas fa-box';
}

function getSectionTitle(section) {
    const titles = {
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
window.UI = UI;
