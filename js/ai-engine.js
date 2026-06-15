// ========================================
// مدير المواد الذكي - AI Inventory v2.0
// نظام إدارة مخزون بتقنيات الذكاء الاصطناعي
// ========================================

// ========== البيانات والتخزين ==========
let materials = [];
let editingId = null;
let currentTheme = localStorage.getItem('theme') || 'dark';
let aiSettings = {
    autoComplete: true,
    predictions: true,
    warnings: true
};

// ========== تهيئة التطبيق ==========
document.addEventListener('DOMContentLoaded', () => {
    loadMaterials();
    initTheme();
    initEventListeners();
    initDragAndDrop();
    updateAllAI();
    showToast('🤖 AI System Activated', 'success');
});

// ========== تحميل وحفظ البيانات ==========
function loadMaterials() {
    const saved = localStorage.getItem('ai_materials');
    if (saved) {
        materials = JSON.parse(saved);
    } else {
        // بيانات افتراضية للعرض مع الأسعار
        materials = [
            { id: '1', name: 'أسمنت بورتلاند', quantity: 2500, price: 8, min: 500, category: 'critical' },
            { id: '2', name: 'حديد تسليح 12مم', quantity: 1800, price: 25, min: 300, category: 'critical' },
            { id: '3', name: 'رمل ناعم', quantity: 5000, price: 2, min: 1000, category: 'normal' },
            { id: '4', name: 'بلك أسمنتي', quantity: 3200, price: 1.5, min: 800, category: 'normal' },
            { id: '5', name: 'دهان أكريليك', quantity: 150, price: 12, min: 50, category: 'stagnant' }
        ];
        saveMaterials();
    }
    renderInventory();
}

function saveMaterials() {
    localStorage.setItem('ai_materials', JSON.stringify(materials));
    updateStats();
    updateAllAI();
}

// ========== تحديث الإحصائيات مع خصم 35% ==========
function updateStats() {
    const total = materials.length;
    
    // حساب المجموع الكلي = مجموع (الكمية × السعر)
    let totalValue = 0;
    for (const m of materials) {
        const price = m.price || 10; // سعر افتراضي 10 ريال/كجم إذا لم يحدد
        totalValue += m.quantity * price;
    }
    
    // تطبيق خصم 35%
    const discountedTotal = totalValue * 0.65; // total - 35% = total × 0.65
    
    // حساب المواد الناقصة (الموجودة فقط)
    const lowStock = materials.filter(m => m.quantity < m.min).length;
    
    // متوسط القيمة بعد الخصم
    const avgValue = total > 0 ? (discountedTotal / total).toFixed(2) : 0;

    document.getElementById('totalMaterials').textContent = total;
    document.getElementById('totalVolume').textContent = Math.round(discountedTotal).toLocaleString();
    document.getElementById('lowStockCount').textContent = lowStock;
    document.getElementById('avgQuantity').textContent = avgValue;
}

// ========== عرض المخزون مع السعر ==========
function renderInventory() {
    const tbody = document.getElementById('tableBody');
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    let filtered = [...materials];
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(m => m.category === categoryFilter);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-hand-peace"></i>
                    <p>اسحب وأفلت المواد هنا أو اضغط إضافة</p>
                    <small>الجدول جاهز للسحب حتى لو كان فارغاً</small>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(m => {
        const isLow = m.quantity < m.min;
        let statusClass = 'status-good';
        let statusText = 'مخزون جيد';
        if (isLow) {
            statusClass = 'status-critical';
            statusText = 'ناقص ⚠️';
        } else if (m.quantity < m.min * 1.5) {
            statusClass = 'status-warning';
            statusText = 'ينفد قريباً';
        }
        
        const categoryNames = { critical: 'حرجة', normal: 'عادية', stagnant: 'راكدة' };
        const materialPrice = m.price || 10;
        
        return `
            <tr draggable="true" data-id="${m.id}">
                <td class="drag-handle"><i class="fas fa-grip-vertical"></i></td>
                <td><strong>${escapeHtml(m.name)}</strong></td>
                <td>${m.quantity} kg</td>
                <td>${materialPrice} ريال</td>
                <td>${m.min} kg</td>
                <td><span class="status-badge ${statusClass}">${categoryNames[m.category]}</span></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="action-btns">
                    <button class="action-btn edit-btn" onclick="openEditModal('${m.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteMaterial('${m.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
    
    // إعادة ربط أحداث السحب
    attachDragEvents();
}

// ========== إضافة/تعديل المواد مع السعر ==========
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'إضافة مادة جديدة';
    document.getElementById('materialName').value = '';
    document.getElementById('materialQuantity').value = '';
    document.getElementById('materialPrice').value = '10';
    document.getElementById('materialMin').value = '10';
    document.getElementById('materialCategory').value = 'normal';
    document.getElementById('quantityWarning').innerHTML = '';
    document.getElementById('nameSuggestion').innerHTML = '';
    document.getElementById('itemModal').classList.add('active');
}

function openEditModal(id) {
    const material = materials.find(m => m.id === id);
    if (!material) return;
    editingId = id;
    document.getElementById('modalTitle').textContent = 'تعديل المادة';
    document.getElementById('materialName').value = material.name;
    document.getElementById('materialQuantity').value = material.quantity;
    document.getElementById('materialPrice').value = material.price || 10;
    document.getElementById('materialMin').value = material.min;
    document.getElementById('materialCategory').value = material.category;
    document.getElementById('itemModal').classList.add('active');
}

function saveMaterial() {
    const name = document.getElementById('materialName').value.trim();
    const quantity = parseFloat(document.getElementById('materialQuantity').value);
    const price = parseFloat(document.getElementById('materialPrice').value) || 10;
    const min = parseFloat(document.getElementById('materialMin').value);
    const category = document.getElementById('materialCategory').value;
    
    if (!name) {
        showToast('الرجاء إدخال اسم المادة', 'error');
        return;
    }
    if (isNaN(quantity) || quantity < 0) {
        showToast('الرجاء إدخال كمية صحيحة', 'error');
        return;
    }
    if (isNaN(min) || min < 0) {
        showToast('الرجاء إدخال حد أدنى صحيح', 'error');
        return;
    }
    
    // AI تحذير ذكي
    if (aiSettings.warnings && quantity < min) {
        if (!confirm('⚠️ تحذير AI: الكمية أقل من الحد الأدنى! هل تريد المتابعة؟')) {
            return;
        }
    }
    
    if (editingId) {
        const index = materials.findIndex(m => m.id === editingId);
        if (index !== -1) {
            materials[index] = { ...materials[index], name, quantity, price, min, category };
            showToast(`✏️ تم تعديل ${name}`, 'success');
        }
    } else {
        const newId = Date.now().toString();
        materials.push({ id: newId, name, quantity, price, min, category });
        showToast(`✨ تم إضافة ${name}`, 'success');
    }
    
    saveMaterials();
    renderInventory();
    closeModal();
    
    // AI تحليل بعد الإضافة
    setTimeout(() => analyzeAnomaly({ name, quantity, price, min, category }), 100);
}

function deleteMaterial(id) {
    const material = materials.find(m => m.id === id);
    if (!material) return;
    
    // AI تحذير ذكي حسب الأهمية
    let message = `هل أنت متأكد من حذف ${material.name}؟`;
    if (material.category === 'critical') {
        message = `🚨 تنبيه AI: ${material.name} مادة حرجة! هل أنت متأكد من الحذف؟`;
    } else if (material.quantity < material.min) {
        message = `⚠️ ${material.name} ناقصة حالياً. هل تريد حذفها؟`;
    }
    
    if (confirm(message)) {
        materials = materials.filter(m => m.id !== id);
        saveMaterials();
        renderInventory();
        showToast(`🗑️ تم حذف ${material.name}`, 'info');
    }
}

// ========== نظام السحب والإفلات (يعمل حتى لو كان الجدول فارغاً) ==========
function initDragAndDrop() {
    const container = document.getElementById('tableBody');
    if (!container) return;
    
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetRow = e.target.closest('tr');
        if (targetRow && targetRow.parentNode === container) {
            targetRow.classList.add('drag-over');
        }
    });
    
    container.addEventListener('dragleave', (e) => {
        const targetRow = e.target.closest('tr');
        if (targetRow) targetRow.classList.remove('drag-over');
    });
    
    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetRow = e.target.closest('tr');
        if (targetRow) targetRow.classList.remove('drag-over');
        
        const draggedId = localStorage.getItem('draggedMaterialId');
        const targetId = targetRow?.dataset.id;
        
        if (draggedId && targetId && draggedId !== targetId) {
            const draggedIndex = materials.findIndex(m => m.id === draggedId);
            const targetIndex = materials.findIndex(m => m.id === targetId);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
                const [draggedItem] = materials.splice(draggedIndex, 1);
                materials.splice(targetIndex, 0, draggedItem);
                saveMaterials();
                renderInventory();
                showToast('🔄 تم إعادة ترتيب المواد', 'success');
            }
        }
        
        localStorage.removeItem('draggedMaterialId');
    });
}

function attachDragEvents() {
    const rows = document.querySelectorAll('#tableBody tr[draggable="true"]');
    rows.forEach(row => {
        row.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', row.dataset.id);
            localStorage.setItem('draggedMaterialId', row.dataset.id);
            row.classList.add('dragging');
        });
        row.addEventListener('dragend', (e) => {
            row.classList.remove('dragging');
        });
    });
}

// ========== الذكاء الاصطناعي - التوصيات (غير مصنفة ضمن النواقص) ==========
function generateAIRecommendations() {
    const recommendations = [];
    
    // تحليل المواد الناقصة فقط (الموجودة أصلاً في المخزون)
    const lowStockMaterials = materials.filter(m => m.quantity < m.min);
    
    for (const material of lowStockMaterials) {
        const shortage = material.min - material.quantity;
        const recommendedQty = Math.ceil(shortage * 1.2); // AI: يوصي بكمية احتياطية +20%
        recommendations.push({
            name: material.name,
            current: material.quantity,
            min: material.min,
            recommended: recommendedQty,
            priority: material.category === 'critical' ? 'عالية' : 'متوسطة',
            reason: shortage <= 10 ? 'كمية حرجة جداً' : 'أقل من الحد الآمن'
        });
    }
    
    // AI توقع النفاد
    const predictions = materials.map(m => {
        const daysToEmpty = m.quantity > 0 ? Math.floor(m.quantity / (m.quantity / 30)) : 0;
        return { name: m.name, days: daysToEmpty > 0 ? daysToEmpty : 0 };
    }).filter(p => p.days > 0 && p.days < 15).sort((a,b) => a.days - b.days);
    
    return { recommendations, predictions };
}

function updateRecommendationsUI() {
    const { recommendations, predictions } = generateAIRecommendations();
    const container = document.getElementById('aiRecommendations');
    const recList = document.getElementById('recommendationsList');
    const predictionsDiv = document.getElementById('predictionsList');
    const priorityDiv = document.getElementById('priorityList');
    
    // تحديث توصيات الصفحة الرئيسية
    if (container) {
        if (recommendations.length === 0) {
            container.innerHTML = '<div class="rec-item">✅ جميع المواد ضمن الحدود الآمنة</div>';
        } else {
            container.innerHTML = recommendations.map(rec => `
                <div class="rec-item">
                    <span class="rec-name">${escapeHtml(rec.name)}</span>
                    <span class="rec-suggestion">🔔 يوصى بطلب ${rec.recommended} كجم</span>
                </div>
            `).join('');
        }
    }
    
    // تحديث صفحة التوصيات المنفصلة
    if (recList) {
        if (recommendations.length === 0) {
            recList.innerHTML = '<div class="rec-card">✨ لا توجد توصيات حالياً. المخزون جيد!</div>';
        } else {
            recList.innerHTML = recommendations.map(rec => `
                <div class="rec-card">
                    <div>
                        <strong>${escapeHtml(rec.name)}</strong>
                        <small>الكمية الحالية: ${rec.current} كجم | الحد الأدنى: ${rec.min} كجم</small>
                    </div>
                    <div class="rec-suggestion">📦 يوصى بطلب ${rec.recommended} كجم</div>
                </div>
            `).join('');
        }
    }
    
    // تحديث التوقعات
    if (predictionsDiv) {
        if (predictions.length === 0) {
            predictionsDiv.innerHTML = '<div>📊 لا توجد مواد مهددة بالنفاد قريباً</div>';
        } else {
            predictionsDiv.innerHTML = predictions.slice(0, 5).map(p => `
                <div style="padding: 8px 0; border-bottom: 1px solid var(--glass-border);">
                    ⚠️ ${escapeHtml(p.name)}: متوقع النفاد خلال ${p.days} يوم
                </div>
            `).join('');
        }
    }
    
    // تحديث الأولويات
    if (priorityDiv) {
        const priorities = [...materials]
            .filter(m => m.quantity < m.min * 1.5)
            .sort((a,b) => (a.quantity/a.min) - (b.quantity/b.min))
            .slice(0, 5);
        
        if (priorities.length === 0) {
            priorityDiv.innerHTML = '<div>✅ لا توجد أولويات شراء حالياً</div>';
        } else {
            priorityDiv.innerHTML = priorities.map(m => `
                <div style="padding: 8px 0; border-bottom: 1px solid var(--glass-border);">
                    🥇 ${escapeHtml(m.name)} - أولوية ${m.category === 'critical' ? 'قصوى' : 'عادية'}
                </div>
            `).join('');
        }
    }
    
    // تحديث عداد التوصيات في الشريط الجانبي
    const recBadge = document.getElementById('recBadge');
    if (recBadge) recBadge.textContent = recommendations.length;
}

// ========== AI تحليل الشذوذ (Anomaly Detection) ==========
function analyzeAnomaly(material) {
    const avgQuantity = materials.reduce((sum, m) => sum + m.quantity, 0) / materials.length;
    if (material.quantity > avgQuantity * 3) {
        showToast(`🤖 AI: كمية ${material.name} غير طبيعية (أكبر بثلاث مرات من المتوسط)`, 'warning');
    }
    if (material.quantity < material.min && materials.length > 1) {
        showToast(`🤖 AI: ${material.name} تحتاج إعادة طلب عاجلة`, 'warning');
    }
}

// ========== AI بحث ذكي مع إكمال تلقائي ==========
function initSmartSearch() {
    const searchInput = document.getElementById('aiSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const suggestions = materials.filter(m => m.name.toLowerCase().includes(query)).slice(0, 5);
        const suggestionsDiv = document.getElementById('searchSuggestions');
        
        if (suggestions.length > 0 && query.length > 0) {
            suggestionsDiv.innerHTML = suggestions.map(s => `<div onclick="searchAndSelect('${s.name}')">${escapeHtml(s.name)}</div>`).join('');
            suggestionsDiv.classList.add('active');
        } else {
            suggestionsDiv.classList.remove('active');
        }
    });
}

function searchAndSelect(name) {
    document.getElementById('aiSearch').value = name;
    document.getElementById('searchSuggestions').classList.remove('active');
    // فلترة الجدول حسب البحث
    const filtered = materials.filter(m => m.name.toLowerCase().includes(name.toLowerCase()));
    if (filtered.length > 0) {
        showToast(`🔍 تم العثور على ${filtered.length} نتيجة`, 'info');
    }
}

// ========== AI ترتيب ذكي ==========
function smartSort() {
    materials.sort((a, b) => {
        const aCritical = a.quantity < a.min ? 1 : 0;
        const bCritical = b.quantity < b.min ? 1 : 0;
        if (aCritical !== bCritical) return bCritical - aCritical;
        return (a.quantity / a.min) - (b.quantity / b.min);
    });
    saveMaterials();
    renderInventory();
    showToast('🧠 تم الترتيب حسب الأولوية (AI)', 'success');
}

// ========== AI إكمال تلقائي لاسم المادة ==========
function initAIAutoComplete() {
    const nameInput = document.getElementById('materialName');
    if (!nameInput || !aiSettings.autoComplete) return;
    
    nameInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const existing = materials.find(m => m.name.toLowerCase() === val);
        const suggestionDiv = document.getElementById('nameSuggestion');
        
        if (existing && val.length > 1) {
            suggestionDiv.innerHTML = `💡 موجود مسبقاً: ${existing.name} (الكمية: ${existing.quantity} كجم)`;
        } else if (val.length > 2) {
            suggestionDiv.innerHTML = `💡 هل تقصد: ${val}... ؟`;
        } else {
            suggestionDiv.innerHTML = '';
        }
    });
}

// ========== AI تحذير الكمية ==========
function initAIQuantityWarning() {
    const qtyInput = document.getElementById('materialQuantity');
    const minInput = document.getElementById('materialMin');
    const warningDiv = document.getElementById('quantityWarning');
    
    if (!qtyInput || !minInput) return;
    
    function checkQuantity() {
        const qty = parseFloat(qtyInput.value);
        const min = parseFloat(minInput.value);
        if (!isNaN(qty) && !isNaN(min) && qty < min) {
            warningDiv.innerHTML = '⚠️ تنبيه AI: الكمية أقل من الحد الأدنى الموصى به';
        } else {
            warningDiv.innerHTML = '';
        }
    }
    
    qtyInput.addEventListener('input', checkQuantity);
    minInput.addEventListener('input', checkQuantity);
}

// ========== AI تصنيف ذكي ==========
function smartClassify(quantity, min) {
    if (quantity < min) return 'critical';
    if (quantity < min * 2) return 'normal';
    return 'stagnant';
}

// ========== تصدير البيانات ==========
function exportData() {
    const data = JSON.stringify(materials, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_backup_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📁 تم تصدير البيانات بنجاح', 'success');
}

// ========== استيراد البيانات مع AI تحقق ==========
function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                // AI تحقق من صحة البيانات
                const valid = imported.every(m => m.name && typeof m.quantity === 'number');
                if (valid) {
                    materials = imported;
                    saveMaterials();
                    renderInventory();
                    showToast('📥 تم استيراد البيانات بنجاح', 'success');
                } else {
                    showToast('❌ AI: تنسيق الملف غير صحيح', 'error');
                }
            }
        } catch (err) {
            showToast('❌ AI: فشل قراءة الملف', 'error');
        }
    };
    reader.readAsText(file);
}

// ========== إعادة تعيين البيانات ==========
function resetData() {
    if (confirm('⚠️ هل أنت متأكد؟ سيتم حذف جميع البيانات نهائياً!')) {
        materials = [];
        saveMaterials();
        renderInventory();
        showToast('🗑️ تم إعادة تعيين المخزون', 'info');
    }
}

// ========== تحديث كل وظائف AI ==========
function updateAllAI() {
    updateStats();
    updateRecommendationsUI();
    const badge = document.getElementById('recBadge');
    if (badge) {
        const { recommendations } = generateAIRecommendations();
        badge.textContent = recommendations.length;
    }
}

// ========== إعدادات الثيم ==========
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    initTheme();
    showToast(`🎨 تم التبديل إلى الوضع ${currentTheme === 'dark' ? 'المظلم' : 'الفاتح'}`, 'info');
}

// ========== Toast إشعارات ==========
function showToast(message, type = 'info') {
    const toast = document.getElementById('aiToast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.background = type === 'error' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' :
                            type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #ea580c)' :
                            type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                            'linear-gradient(135deg, var(--primary), var(--secondary))';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== إغلاق المودال ==========
function closeModal() {
    document.getElementById('itemModal').classList.remove('active');
}

// ========== تنقل بين الصفحات ==========
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.dataset.page + 'Page';
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            pages.forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById(pageId);
            if (targetPage) targetPage.classList.add('active');
        });
    });
}

// ========== إعدادات AI ==========
function initSettings() {
    const autoCompleteToggle = document.getElementById('aiAutoComplete');
    const predictionsToggle = document.getElementById('aiPredictions');
    const warningsToggle = document.getElementById('aiWarnings');
    const resetBtn = document.getElementById('resetDataBtn');
    
    if (autoCompleteToggle) {
        autoCompleteToggle.checked = aiSettings.autoComplete;
        autoCompleteToggle.addEventListener('change', (e) => {
            aiSettings.autoComplete = e.target.checked;
            showToast(`🤖 AI Auto-Complete ${aiSettings.autoComplete ? 'تم التفعيل' : 'تم الإيقاف'}`, 'info');
        });
    }
    
    if (predictionsToggle) {
        predictionsToggle.checked = aiSettings.predictions;
        predictionsToggle.addEventListener('change', (e) => {
            aiSettings.predictions = e.target.checked;
            if (!aiSettings.predictions) {
                document.getElementById('predictionsList').innerHTML = '<div>التوقعات معطلة</div>';
            } else {
                updateRecommendationsUI();
            }
        });
    }
    
    if (warningsToggle) {
        warningsToggle.checked = aiSettings.warnings;
        warningsToggle.addEventListener('change', (e) => {
            aiSettings.warnings = e.target.checked;
            showToast(`⚠️ AI Warnings ${aiSettings.warnings ? 'تم التفعيل' : 'تم الإيقاف'}`, 'info');
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetData);
    }
}

// ========== جميع مستمعي الأحداث ==========
function initEventListeners() {
    // أزرار رئيسية
    document.getElementById('openAddModal')?.addEventListener('click', openAddModal);
    document.getElementById('saveMaterialBtn')?.addEventListener('click', saveMaterial);
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('exportBtn')?.addEventListener('click', exportData);
    document.getElementById('importBtn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => importData(e.target.files[0]);
        input.click();
    });
    document.getElementById('sortBtn')?.addEventListener('click', smartSort);
    document.getElementById('categoryFilter')?.addEventListener('change', () => renderInventory());
    
    // مودال
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
    document.querySelector('.cancel-modal')?.addEventListener('click', closeModal);
    document.getElementById('itemModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('itemModal')) closeModal();
    });
    
    // وظائف AI
    initSmartSearch();
    initAIAutoComplete();
    initAIQuantityWarning();
    initNavigation();
    initSettings();
    
    // تحديث دوري كل 30 ثانية
    setInterval(() => {
        if (aiSettings.predictions) updateRecommendationsUI();
    }, 30000);
}

// ========== دوال مساعدة ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== تصدير الدوال العامة ==========
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteMaterial = deleteMaterial;
window.searchAndSelect = searchAndSelect;
