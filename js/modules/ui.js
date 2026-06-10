function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    const categories = [
        { id: 'main', icon: 'fas fa-star', title: 'أساسيات' },
        { id: 'spices_extra', icon: 'fas fa-leaf', title: 'بهارات اضافية' },
        { id: 'roasted', icon: 'fas fa-fire', title: 'المحمصة' },
        { id: 'herbs', icon: 'fas fa-seedling', title: 'الأعشاب' },
        { id: 'extra', icon: 'fas fa-plus-circle', title: 'مواد اضافية' },
        { id: 'bags', icon: 'fas fa-shopping-bag', title: 'أكياس تعبئة' },
        { id: 'tawsaya', icon: 'fas fa-gift', title: 'توصيات' }
    ];
    
    container.innerHTML = '';
    categories.forEach(cat => {
        container.innerHTML += `
            <button class="category-card" data-category="${cat.id}">
                <div class="category-icon"><i class="${cat.icon}"></i></div>
                <div class="category-info"><h3 class="category-title">${cat.title}</h3></div>
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
                    <div class="section-title">${getSectionTitle(section)}</div>
                    <div class="section-count">${sectionMaterials.length}</div>
                </div>
                <div class="materials-grid">
                    ${sectionMaterials.length === 0 ? 
                        `<div class="empty-state"><i class="fas fa-box-open"></i><br>لا توجد مواد<br><small>اضغط على القسم لإضافة مواد جاهزة</small></div>` : 
                        sectionMaterials.map(m => renderMaterialCard(m)).join('')
                    }
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function renderMaterialCard(m) {
    const isLowStock = (!m.quantity || m.quantity === 0) && m.priority !== 'tawsaya';
    const lowStockClass = isLowStock ? 'low-stock' : '';
    let quantityDisplay = formatDisplay(m);
    if (isLowStock && m.priority !== 'tawsaya') quantityDisplay = '⚠️ ناقصة';
    
    return `
        <div class="material-card ${lowStockClass}" data-id="${m.id}" data-name="${escapeHtml(m.name)}" data-section="${m.priority}">
            <div class="card-header">
                <div class="card-title"><i class="fas fa-box"></i> <span>${escapeHtml(m.name)}</span></div>
                <div class="card-actions">
                    <button class="edit-material" data-id="${m.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-material" data-id="${m.id}"><i class="fas fa-trash-alt"></i></button>
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
}

function calculateAIMetrics() {
    if (!window.aiEngine) return;
    try {
        const analysis = window.aiEngine.analyzeInventory(window.allMaterials || []);
        const stats = analysis.statistics;
        
        document.getElementById('totalMaterialsCount').innerText = stats.totalMaterials;
        document.getElementById('totalQuantityValue').innerText = stats.totalQuantity.toFixed(2);
        document.getElementById('lowStockCount').innerHTML = `${stats.lowStockCount}<span class="ai-stat-unit" style="font-size:0.625rem"> مادة</span>`;
        document.getElementById('avgQuantityValue').innerText = stats.avgQuantity;
        
        const insightsDiv = document.getElementById('aiInsights');
        if (insightsDiv && analysis.insights) {
            let html = `<i class="fas fa-robot"></i><div style="flex:1">`;
            analysis.insights.forEach(i => { html += `<div style="margin-bottom:6px;">${i}</div>`; });
            html += `</div>`;
            insightsDiv.innerHTML = html;
        }
    } catch(e) { console.error("AI Error:", e); }
}
