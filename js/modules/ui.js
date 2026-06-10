function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    const categories = [
        { id: 'main', icon: 'fas fa-star', title: 'أساسيات', color: '#f59e0b' },
        { id: 'spices_extra', icon: 'fas fa-leaf', title: 'بهارات اضافية', color: '#10b981' },
        { id: 'roasted', icon: 'fas fa-fire', title: 'المحمصة', color: '#ef4444' },
        { id: 'herbs', icon: 'fas fa-seedling', title: 'الأعشاب', color: '#8b5cf6' },
        { id: 'extra', icon: 'fas fa-plus-circle', title: 'مواد اضافية', color: '#3b82f6' },
        { id: 'bags', icon: 'fas fa-shopping-bag', title: 'أكياس تعبئة', color: '#ec4899' },
        { id: 'tawsaya', icon: 'fas fa-gift', title: 'توصيات', color: '#06b6d4' }
    ];
    
    container.innerHTML = '';
    categories.forEach(cat => {
        container.innerHTML += `
            <button class="category-card" data-category="${cat.id}" style="border-right: 3px solid ${cat.color};">
                <div class="category-icon" style="background: linear-gradient(135deg, ${cat.color}15, ${cat.color}25);">
                    <i class="${cat.icon}" style="color: ${cat.color};"></i>
                </div>
                <div class="category-info">
                    <h3 class="category-title">${cat.title}</h3>
                </div>
                <div class="category-count" id="count-${cat.id}">0</div>
                <div class="category-arrow"><i class="fas fa-chevron-left"></i></div>
            </button>
        `;
    });
}

function renderSections(materials) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;
    
    const sections = ['main', 'spices_extra', 'roasted', 'herbs', 'extra', 'bags', 'tawsaya'];
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
                <div class="materials-grid" data-section-grid="${section}">
                    ${sectionMaterials.length === 0 ? 
                        `<div class="empty-state">
                            <i class="fas fa-box-open"></i>
                            <br>لا توجد مواد
                            <br><small>اضغط على القسم لإضافة مواد جاهزة</small>
                        </div>` : 
                        sectionMaterials.map(m => renderMaterialCard(m)).join('')
                    }
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function getSectionIcon(section) {
    const icons = {
        'main': 'fas fa-star',
        'spices_extra': 'fas fa-leaf',
        'roasted': 'fas fa-fire',
        'herbs': 'fas fa-seedling',
        'extra': 'fas fa-plus-circle',
        'bags': 'fas fa-shopping-bag',
        'tawsaya': 'fas fa-gift'
    };
    return icons[section] || 'fas fa-box';
}

function renderMaterialCard(m) {
    const isLowStock = (!m.quantity || m.quantity === 0) && m.priority !== 'tawsaya';
    const lowStockClass = isLowStock ? 'low-stock' : '';
    let quantityDisplay = formatDisplay(m);
    if (isLowStock && m.priority !== 'tawsaya') quantityDisplay = '⚠️ ناقصة';
    
    return `
        <div class="material-card ${lowStockClass}" data-id="${m.id}" data-name="${escapeHtml(m.name)}" data-section="${m.priority}">
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-box"></i>
                    <span>${escapeHtml(m.name)}</span>
                </div>
                <div class="card-actions">
                    <button class="edit-material" data-id="${m.id}" title="تعديل الكمية">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-material" data-id="${m.id}" title="حذف المادة">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="qty-badge">${quantityDisplay}</div>
        </div>
    `;
}

function updateCategoryCounts() {
    const counts = { main: 0, spices_extra: 0, roasted: 0, herbs: 0, extra: 0, bags: 0, tawsaya: 0 };
    for (const m of window.allMaterials || []) {
        counts[m.priority] = (counts[m.priority] || 0) + 1;
    }
    for (const [key, value] of Object.entries(counts)) {
        const el = document.getElementById(`count-${key}`);
        if (el) el.innerText = value;
    }
}

function calculateAIMetrics() {
    if (!window.aiEngine) return;
    try {
        const analysis = window.aiEngine.analyzeInventory(window.allMaterials || []);
        const stats = analysis.statistics;
        
        const totalEl = document.getElementById('totalMaterialsCount');
        const totalQtyEl = document.getElementById('totalQuantityValue');
        const lowStockEl = document.getElementById('lowStockCount');
        const avgQtyEl = document.getElementById('avgQuantityValue');
        
        if (totalEl) totalEl.innerText = stats.totalMaterials;
        if (totalQtyEl) totalQtyEl.innerText = stats.totalQuantity.toFixed(2);
        if (lowStockEl) lowStockEl.innerHTML = `${stats.lowStockCount}<span class="ai-stat-unit"> مادة</span>`;
        if (avgQtyEl) avgQtyEl.innerText = stats.avgQuantity;
        
        const insightsDiv = document.getElementById('aiInsights');
        if (insightsDiv && analysis.insights) {
            const insightsContent = insightsDiv.querySelector('.insights-content');
            if (insightsContent) {
                let html = '';
                analysis.insights.forEach(insight => {
                    html += `<div style="margin-bottom: 6px;">${insight}</div>`;
                });
                insightsContent.innerHTML = html;
            }
        }
    } catch(e) { console.error("AI Error:", e); }
}
