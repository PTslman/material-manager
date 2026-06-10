// ==================== المتغيرات العامة ====================
let allMaterials = [];
let unsubscribe = null;
let currentEditId = null;
let currentSearchTerm = '';
let currentSearchFilter = 'all';
let currentPresetCategory = 'main';
let longPressTimer = null;

// ==================== القوائم الجاهزة ====================
const importantItemsList = [
    "شطة حلوة", "شطة حدة وسط", "شطة بابريكا مدخنة", "توابل هندية", "فلفل اسود ناعم", "توم ناعم", "بصل ناعم",
    "جوز هند خشن", "حليب نصف دسم", "جوز امريكي", "حبة البركة", "زنجبيل خشن", "زنجبيل ناعم", "سمسم محمص",
    "سماق ناعم", "شاورما", "كركدية", "كاري", "كربونة الصوديوم", "كبسة خليجية", "كبسة ناعمة", "كركم",
    "كريمة محلاية", "كاكاو نخب اول", "كاكاو نخب ثاني", "كمون حب", "كمون ناعم", "قرفة عيدان", "قرفة ناعمة",
    "قرفة سيجار", "كزبرة ناعمة", "كزبرة حب", "قرنفل حب", "قرنفل ناعم", "اشلميش", "فستق ني ارجنتيني",
    "ملح صيني", "ملح ليمون", "ماجي اصفر", "ماجي ابيض", "مشكلة", "مشكلة بيضاء", "نشا مصري", "هيل حب خشن",
    "هيل ناعم", "نعنع يابس", "يانسون حب", "شوفان", "تمر سري"
];

const spicesExtraItemsList = [
    "بطاطا", "بروستد", "زعتر اوريغانو", "بيتزا", "جوزة الطيب حب", "جوزة الطيب ناعمة", "حلبه حب", "حلبه ناعمة",
    "خل نكهة", "خميرة فرط", "سدر ناعم", "سكر نبات", "سمك", "سجق", "سحلب", "سلطة", "شمرا ناعمة", "شمرا حب",
    "شيش", "شاورما", "كريسبي", "كليجة", "كاري", "كربونة الصوديوم", "كراوية", "مجروش الكعك", "كلس خشن",
    "قلي", "فلافل", "فاهيتا", "لبان الدكر", "لحمة عجل", "لومي", "لومي اسود", "مندي", "مكسيكي", "مشاوي",
    "مدخنة", "محاشي", "محلب", "نشا درس", "نعنع يابس", "يانسون ناعم", "يانسون نجمة", "ورق غار", "صفار زعفران",
    "صفار بيض", "فلفل اسود حب", "فلفل ابيض ناعم", "توابل هندية حارة", "طحينية", "رمان مجفف", "اندومي",
    "رز مطحون", "ماجي حبيبات", "شمرا حب"
];

const roastedItemsList = [
    "دوار شمس ملكي", "دوار شمس شبح", "فستق مدخن", "فستق مملح", "بذر كوسا", "بذر ابيض عريض", "بذر اصفر مصري",
    "فستق ني ارجنتيني", "لوز بقشرو", "لوز ني", "كاجو ني", "بذور الشيا", "بذور الكتان", "بذور اليقطين",
    "بذر الرشاد", "ذرة الفوشار", "خل نكهة", "جنبة نكهة", "كتشب نكهة", "بابريكا نكهة", "زعتر اخضر", "زعتر احمر",
    "كابتشينو", "ميلو", "هوت شوكلت"
];

const herbsItemsList = [
    "زهرة الالماسة", "زهورات مشكلة", "زعتر بري", "كركدية", "ميرمية", "ورد جوري", "عشرق", "مرتكوش", "سنامكي",
    "بابونج", "اكليل الجبل"
];

const extraItemsList = [
    "ماجي ظروف", "مكعبات ماجي", "ماجي شرائح", "خميره ظروفة", "مستكه", "فانيلا ظروفة الريم", "فانيلا فرط",
    "بكمبودر ريم", "بكمبودر فرط", "تمر عجوه", "تمر سري"
];

const bagTypesList = ["شفاف 10×12", "شفاف 20×12", "شفاف 10×20", "شفاف 25×17", "شفاف 20×30", "شفاف 35×25", "صيدلية", "أسود 30", "أسود 35", "أسود 40", "أسود 45"];

let presetSelections = {
    main: {}, spices_extra: {}, roasted: {}, herbs: {}, extra: {}, bags: {}
};

// ==================== دوال مساعدة ====================
function showToast(msg, isErr = false) {
    let existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function showSystemMessage(title, message, type = 'info') {
    const modal = document.getElementById('systemMessageModal');
    const titleEl = document.getElementById('systemMessageTitle');
    const textEl = document.getElementById('systemMessageText');
    if (titleEl) titleEl.innerText = title;
    if (textEl) textEl.innerText = message;
    const icon = modal?.querySelector('.fa-info-circle');
    if (icon) {
        if (type === 'error') icon.style.color = '#ef4444';
        else if (type === 'warning') icon.style.color = '#f59e0b';
        else icon.style.color = '#10b981';
    }
    if (modal) modal.classList.add('active');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[m]));
}

function formatDisplay(mat) {
    if (!mat.quantity || mat.quantity === 0) return '⚠️ ناقصة';
    const u = mat.unitType;
    if (u === 'kg') return `${mat.quantity} kg`;
    if (u === 'half') return 'نصف كيلو';
    if (u === 'quarter') return 'ربع كيلو';
    if (u === 'oke') return 'لوقية';
    if (u === 'box') return `${mat.quantity} علبة`;
    if (u === 'piece') return `${mat.quantity} عدد`;
    if (u === 'bag') return `${mat.quantity} كيس`;
    return `${mat.quantity} kg`;
}

function getSectionTitle(section) {
    const titles = {
        'main': '⭐ أساسيات',
        'spices_extra': '🌿 بهارات اضافية',
        'roasted': '🔥 المحمصة',
        'herbs': '🌱 الأعشاب',
        'extra': '📦 مواد اضافية',
        'bags': '🛍️ أكياس تعبئة',
        'tawsaya': '🎁 توصيات'
    };
    return titles[section] || section;
}

// ==================== البحث والتصفية ====================
function filterMaterials() {
    if (!currentSearchTerm && currentSearchFilter === 'all') {
        renderSections(allMaterials);
        return;
    }
    
    let filtered = [...allMaterials];
    if (currentSearchTerm) {
        filtered = filtered.filter(m => m.name.toLowerCase().includes(currentSearchTerm.toLowerCase()));
    }
    if (currentSearchFilter !== 'all') {
        filtered = filtered.filter(m => m.priority === currentSearchFilter);
    }
    renderSections(filtered, true);
}

function updateCategoryCounts() {
    const counts = { main: 0, spices_extra: 0, roasted: 0, herbs: 0, extra: 0, bags: 0, tawsaya: 0 };
    for (const m of allMaterials) {
        counts[m.priority] = (counts[m.priority] || 0) + 1;
    }
    for (const [key, value] of Object.entries(counts)) {
        const el = document.getElementById(`count-${key}`);
        if (el) el.innerText = value;
    }
}

// ==================== الذكاء الاصطناعي ====================
function calculateAIMetrics() {
    if (!window.aiEngine) return;
    try {
        const analysis = window.aiEngine.analyzeInventory(allMaterials);
        const stats = analysis.statistics;
        
        document.getElementById('totalMaterialsCount').innerText = stats.totalMaterials;
        document.getElementById('totalQuantityValue').innerText = stats.totalQuantity.toFixed(2);
        document.getElementById('lowStockCount').innerHTML = `${stats.lowStockCount}<span class="ai-stat-unit" style="font-size:0.625rem"> مادة</span>`;
        document.getElementById('avgQuantityValue').innerText = stats.avgQuantity;
        
        const insightsDiv = document.getElementById('aiInsights');
        if (insightsDiv && analysis.insights) {
            let html = `<i class="fas fa-robot"></i><div style="flex:1">`;
            analysis.insights.forEach(insight => {
                html += `<div style="margin-bottom: 6px;">${insight}</div>`;
            });
            html += `</div>`;
            insightsDiv.innerHTML = html;
        }
    } catch(e) { console.error("AI Error:", e); }
}

// ==================== عرض المواد ====================
function renderSections(materials, isFiltered = false) {
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
                    <button class="add-preset-btn" data-category="${section}" style="padding:4px 12px;border-radius:999px;background:var(--primary-50);border:none;cursor:pointer;font-size:12px;">
                        <i class="fas fa-plus"></i> إضافة جاهزة
                    </button>
                </div>
                <div class="materials-grid">
                    ${sectionMaterials.length === 0 ? 
                        `<div class="empty-state"><i class="fas fa-box-open"></i><br>لا توجد مواد<br><small>اضغط مطولاً على أي مادة لنقلها إلى هنا</small></div>` : 
                        sectionMaterials.map(m => renderMaterialCard(m)).join('')
                    }
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    document.querySelectorAll('.edit-material').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const material = allMaterials.find(m => m.id === id);
            if (material) {
                currentEditId = id;
                document.getElementById('editMaterialName').value = material.name;
                document.getElementById('editQuantityValue').value = material.quantity;
                document.getElementById('editUnitSelect').value = material.unitType || 'kg';
                document.getElementById('editModal').classList.add('active');
            }
        };
    });
    
    document.querySelectorAll('.delete-material').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const material = allMaterials.find(m => m.id === id);
            if (confirm(`⚠️ هل أنت متأكد من حذف "${material?.name}"؟`)) {
                materialsCollection.doc(id).delete().then(() => showToast("✅ تم الحذف")).catch(e => showToast("❌ فشل الحذف", true));
            }
        };
    });
    
    document.querySelectorAll('.add-preset-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const category = btn.getAttribute('data-category');
            if (category && category !== 'tawsaya') {
                openPresetModal(category);
            } else if (category === 'tawsaya') {
                showSystemMessage('إضافة توصيات', '📝 يمكنك إضافة التوصيات من القائمة المخصصة', 'info');
            }
        };
    });
    
    document.querySelectorAll('.material-card').forEach(card => {
        setupLongPress(card);
    });
    
    if (!isFiltered) updateCategoryCounts();
    calculateAIMetrics();
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

// ==================== الضغطة المطولة ====================
function setupLongPress(card) {
    card.removeEventListener('touchstart', onTouchStart);
    card.removeEventListener('touchend', onTouchEnd);
    card.removeEventListener('touchmove', onTouchMove);
    card.removeEventListener('mousedown', onMouseDown);
    card.removeEventListener('mouseup', onMouseUp);
    card.removeEventListener('mouseleave', onMouseLeave);
    
    card.addEventListener('touchstart', onTouchStart);
    card.addEventListener('touchend', onTouchEnd);
    card.addEventListener('touchmove', onTouchMove);
    card.addEventListener('mousedown', onMouseDown);
    card.addEventListener('mouseup', onMouseUp);
    card.addEventListener('mouseleave', onMouseLeave);
    
    function onTouchStart(e) {
        const c = this;
        longPressTimer = setTimeout(() => {
            const id = c.getAttribute('data-id');
            const name = c.getAttribute('data-name');
            const section = c.getAttribute('data-section');
            openMoveModal(id, name, section);
        }, 500);
    }
    
    function onTouchEnd() {
        if (longPressTimer) clearTimeout(longPressTimer);
    }
    
    function onTouchMove() {
        if (longPressTimer) clearTimeout(longPressTimer);
    }
    
    function onMouseDown(e) {
        e.preventDefault();
        const c = this;
        longPressTimer = setTimeout(() => {
            const id = c.getAttribute('data-id');
            const name = c.getAttribute('data-name');
            const section = c.getAttribute('data-section');
            openMoveModal(id, name, section);
        }, 500);
    }
    
    function onMouseUp() {
        if (longPressTimer) clearTimeout(longPressTimer);
    }
    
    function onMouseLeave() {
        if (longPressTimer) clearTimeout(longPressTimer);
    }
}

function openMoveModal(id, name, currentSection) {
    document.getElementById('moveItemName').value = name;
    document.getElementById('moveTargetSection').value = currentSection;
    window.moveData = { id, name, currentSection };
    document.getElementById('moveItemModal').classList.add('active');
}

async function executeMove() {
    if (!window.moveData) return;
    const { id, name, currentSection } = window.moveData;
    const targetSection = document.getElementById('moveTargetSection').value;
    
    if (currentSection === targetSection) {
        showToast("⚠️ المادة موجودة بالفعل في هذا القسم", false);
        closeMoveModal();
        return;
    }
    
    showToast(`🔄 جاري نقل "${name}"...`, false);
    
    try {
        await materialsCollection.doc(id).update({ priority: targetSection });
        showToast(`✓ تم نقل "${name}" إلى القسم الجديد`);
        closeMoveModal();
        if (unsubscribe) unsubscribe();
        startListener();
    } catch(e) {
        console.error(e);
        showToast(`❌ فشل نقل "${name}"`, true);
    }
}

function closeMoveModal() {
    document.getElementById('moveItemModal').classList.remove('active');
    window.moveData = null;
}

// ==================== القوائم الجاهزة ====================
function openPresetModal(category) {
    currentPresetCategory = category;
    const titles = {
        'main': 'أساسيات',
        'spices_extra': 'بهارات اضافية',
        'roasted': 'المحمصة',
        'herbs': 'الأعشاب',
        'extra': 'مواد اضافية',
        'bags': 'أكياس تعبئة'
    };
    
    document.getElementById('presetModalTitle').innerHTML = `<i class="fas fa-list"></i> إضافة مواد جاهزة - ${titles[category]}`;
    document.getElementById('presetModal').classList.add('active');
    renderPresetList(category, '');
    document.getElementById('presetSearchInput').focus();
}

function renderPresetList(category, filter) {
    const container = document.getElementById('presetListContainer');
    if (!container) return;
    
    let itemsList = [];
    if (category === 'main') itemsList = importantItemsList;
    else if (category === 'spices_extra') itemsList = spicesExtraItemsList;
    else if (category === 'roasted') itemsList = roastedItemsList;
    else if (category === 'herbs') itemsList = herbsItemsList;
    else if (category === 'extra') itemsList = extraItemsList;
    else if (category === 'bags') itemsList = bagTypesList;
    
    const filtered = itemsList.filter(item => item.includes(filter));
    const selections = presetSelections[category] || {};
    
    container.innerHTML = '';
    
    if (category === 'bags') {
        filtered.forEach((item, idx) => {
            const isChecked = selections[idx] || false;
            container.innerHTML += `
                <div class="modern-item-card">
                    <div class="item-info">
                        <input type="checkbox" class="preset-checkbox" data-index="${idx}" ${isChecked ? 'checked' : ''}>
                        <span class="item-name">${escapeHtml(item)}</span>
                    </div>
                </div>
            `;
        });
    } else {
        filtered.forEach((item, idx) => {
            const isChecked = selections[idx] || false;
            container.innerHTML += `
                <div class="modern-item-card">
                    <div class="item-info">
                        <input type="checkbox" class="preset-checkbox" data-index="${idx}" ${isChecked ? 'checked' : ''}>
                        <span class="item-name">${escapeHtml(item)}</span>
                    </div>
                    <div class="quantity-modern">
                        <select class="qty-select preset-unit" data-index="${idx}">
                            <option value="kg">كيلو</option>
                            <option value="half">نصف كيلو</option>
                            <option value="quarter">ربع كيلو</option>
                            <option value="oke">لوقية</option>
                            <option value="box">علبة</option>
                            <option value="piece">عدد</option>
                        </select>
                        <div class="qty-controls" data-index="${idx}">
                            <button class="qty-dec-btn" data-idx="${idx}">-</button>
                            <input type="number" class="qty-value-modern preset-qty" data-idx="${idx}" value="1">
                            <button class="qty-inc-btn" data-idx="${idx}">+</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.querySelectorAll('.qty-dec-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                const input = container.querySelector(`.preset-qty[data-idx="${idx}"]`);
                if (input) input.value = Math.max(1, (parseInt(input.value) || 1) - 1);
            };
        });
        container.querySelectorAll('.qty-inc-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                const input = container.querySelector(`.preset-qty[data-idx="${idx}"]`);
                if (input) input.value = (parseInt(input.value) || 1) + 1;
            };
        });
    }
    
    container.querySelectorAll('.preset-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (!presetSelections[category]) presetSelections[category] = {};
            presetSelections[category][parseInt(e.target.dataset.index)] = e.target.checked;
        });
    });
}

async function addSelectedPresetItems() {
    const category = currentPresetCategory;
    let itemsList = [];
    if (category === 'main') itemsList = importantItemsList;
    else if (category === 'spices_extra') itemsList = spicesExtraItemsList;
    else if (category === 'roasted') itemsList = roastedItemsList;
    else if (category === 'herbs') itemsList = herbsItemsList;
    else if (category === 'extra') itemsList = extraItemsList;
    else if (category === 'bags') itemsList = bagTypesList;
    
    const selections = presetSelections[category] || {};
    const itemsToAdd = [];
    
    for (const [idx, isChecked] of Object.entries(selections)) {
        if (isChecked) {
            const itemName = itemsList[parseInt(idx)];
            let unit = 'kg';
            let quantity = 1;
            
            if (category !== 'bags') {
                const unitSelect = document.querySelector(`.preset-unit[data-index="${idx}"]`);
                unit = unitSelect ? unitSelect.value : 'kg';
                
                if (unit === 'half') quantity = 0.5;
                else if (unit === 'quarter') quantity = 0.25;
                else if (unit === 'oke') quantity = 0.2;
                else {
                    const qtyInput = document.querySelector(`.preset-qty[data-idx="${idx}"]`);
                    quantity = parseFloat(qtyInput ? qtyInput.value : 1);
                }
            }
            
            itemsToAdd.push({ name: itemName, unitType: unit, quantity: quantity });
        }
    }
    
    if (itemsToAdd.length === 0) {
        showToast("📦 اختر مادة واحدة على الأقل", true);
        return;
    }
    
    try {
        const batch = db.batch();
        itemsToAdd.forEach(it => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: it.name,
                unitType: it.unitType,
                quantity: it.quantity,
                notes: category,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: category
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${itemsToAdd.length} مادة بنجاح`);
        document.getElementById('presetModal').classList.remove('active');
        presetSelections[category] = {};
        if (unsubscribe) unsubscribe();
        startListener();
    } catch(e) {
        console.error(e);
        showToast("❌ فشل الإضافة", true);
    }
}

// ==================== دوال Firebase ====================
async function addNewMaterial() {
    const name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) { showToast("✏️ اكتب اسم المادة", true); return; }
    
    const section = document.getElementById('newMaterialSection')?.value || 'main';
    let unit = document.getElementById('newUnitSelect')?.value || 'kg';
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    
    if (isNaN(quantity) || quantity < 0) quantity = 0;
    
    if (unit === 'half') quantity = 0.5;
    else if (unit === 'quarter') quantity = 0.25;
    else if (unit === 'oke') quantity = 0.2;
    
    if (quantity === 0) {
        showToast(`⚠️ تمت إضافة "${name}" بدون كمية (مادة ناقصة)`, false);
    }
    
    try {
        await materialsCollection.add({
            name: name,
            unitType: unit,
            quantity: quantity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: section
        });
        showToast(`✓ تمت إضافة "${name}"`);
        document.getElementById('newItemModal').classList.remove('active');
        document.getElementById('newMaterialName').value = '';
        document.getElementById('newQuantityValue').value = '1';
    } catch(e) {
        console.error(e);
        showToast("❌ خطأ في الاتصال", true);
    }
}

async function saveEdit() {
    if (!currentEditId) return;
    
    let newUnit = document.getElementById('editUnitSelect')?.value || 'kg';
    let newQty = parseFloat(document.getElementById('editQuantityValue')?.value);
    
    if (newUnit === 'half') newQty = 0.5;
    else if (newUnit === 'quarter') newQty = 0.25;
    else if (newUnit === 'oke') newQty = 0.2;
    
    if (isNaN(newQty) || newQty < 0) { showToast("🔢 كمية صحيحة", true); return; }
    
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: newQty, unitType: newUnit });
        showToast("✓ تم تحديث الكمية");
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
        if (unsubscribe) unsubscribe();
        startListener();
    } catch(e) {
        console.error(e);
        showToast("❌ فشل التحديث", true);
    }
}

async function clearAllMaterials() {
    if (allMaterials.length === 0) { showToast("📭 القائمة فارغة", true); return; }
    if (confirm("⚠️ هل أنت متأكد من حذف جميع المواد نهائياً؟ لا يمكن التراجع!")) {
        try {
            const batch = db.batch();
            allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
            await batch.commit();
            showToast("✓ تم مسح جميع المواد");
        } catch(e) {
            console.error(e);
            showToast("❌ فشل المسح", true);
        }
    }
}

// ==================== المزامنة ====================
function startListener() {
    const query = materialsCollection.orderBy('createdAt', 'desc');
    if (unsubscribe) unsubscribe();
    
    unsubscribe = query.onSnapshot((snapshot) => {
        allMaterials = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            allMaterials.push({
                id: doc.id,
                name: data.name,
                unitType: data.unitType || 'kg',
                quantity: data.quantity || 0,
                notes: data.notes || "",
                createdAt: data.createdAt,
                priority: data.priority || "main"
            });
        });
        
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        const itemsCount = document.getElementById('syncItemsCount');
        const syncTime = document.getElementById('syncLastTime');
        
        if (statusText) statusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncDot) syncDot.className = 'sync-dot';
        if (itemsCount) itemsCount.innerHTML = `<i class="fas fa-database"></i> ${allMaterials.length}`;
        if (syncTime) syncTime.innerHTML = `<i class="far fa-clock"></i> ${new Date().toLocaleTimeString()}`;
        
        filterMaterials();
        
        const splash = document.getElementById('splashScreen');
        const app = document.getElementById('appContainer');
        if (splash && app && splash.style.display !== 'none') {
            splash.classList.add('hidden');
            setTimeout(() => { splash.style.display = 'none'; app.style.display = 'block'; }, 500);
        }
    }, (error) => {
        console.error(error);
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        if (statusText) statusText.innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
        if (syncDot) syncDot.className = 'sync-dot offline';
    });
}

// ==================== النسخ الاحتياطي ====================
function backupData() {
    if (allMaterials.length === 0) { showToast("📭 لا توجد بيانات", true); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(allMaterials, null, 2)]));
    a.download = `backup_${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    showToast("💾 تم نسخ البيانات");
}

function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const backup = JSON.parse(ev.target.result);
                if (confirm(`⚠️ استبدال بـ ${backup.length} عنصر؟`)) {
                    const batch = db.batch();
                    allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
                    await batch.commit();
                    for (const it of backup) {
                        await materialsCollection.add({
                            name: it.name,
                            unitType: it.unitType || 'kg',
                            quantity: it.quantity || 0,
                            notes: it.notes || "",
                            priority: it.priority || "main",
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                    showToast("✓ تم الاستعادة");
                    if (unsubscribe) unsubscribe();
                    startListener();
                }
            } catch(e) {
                console.error(e);
                showToast("❌ ملف غير صالح", true);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ==================== ربط الأحداث ====================
function bindEvents() {
    document.getElementById('mainAddBtn').onclick = () => document.getElementById('newItemModal').classList.add('active');
    document.getElementById('syncBtn').onclick = () => { if (unsubscribe) unsubscribe(); startListener(); showToast("🔄 جاري المزامنة..."); };
    document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark');
    document.getElementById('backupBtn').onclick = backupData;
    document.getElementById('restoreBtn').onclick = restoreData;
    document.getElementById('clearAllBtn').onclick = clearAllMaterials;
    document.getElementById('saveNewItemBtn').onclick = addNewMaterial;
    document.getElementById('saveEditBtn').onclick = saveEdit;
    document.getElementById('savePresetBtn').onclick = addSelectedPresetItems;
    document.getElementById('confirmMoveBtn').onclick = executeMove;
    document.getElementById('cancelMoveBtn').onclick = closeMoveModal;
    
    const searchInput = document.getElementById('globalSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const filterChips = document.querySelectorAll('.filter-chip');
    const searchFilters = document.getElementById('searchFilters');
    
    if (searchInput) {
        searchInput.oninput = (e) => {
            currentSearchTerm = e.target.value;
            if (clearBtn) clearBtn.style.display = currentSearchTerm ? 'flex' : 'none';
            if (searchFilters) searchFilters.style.display = 'flex';
            filterMaterials();
        };
    }
    
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (searchInput) searchInput.value = '';
            currentSearchTerm = '';
            clearBtn.style.display = 'none';
            filterMaterials();
        };
    }
    
    if (filterChips.length) {
        filterChips.forEach(chip => {
            chip.onclick = () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentSearchFilter = chip.getAttribute('data-filter');
                filterMaterials();
            };
        });
    }
    
    window.closeAllModals = () => {
        const modals = ['newItemModal', 'editModal', 'moveItemModal', 'presetModal', 'systemMessageModal'];
        modals.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
        });
    };
    
    const closeButtons = ['closeNewModalBtn', 'closeEditModalBtn', 'closePresetModalBtn', 'closeSystemMessageBtn'];
    closeButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', window.closeAllModals);
    });
}

// ==================== التهيئة ====================
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    startListener();
    
    const dec = document.getElementById('newQtyDec');
    const inc = document.getElementById('newQtyInc');
    const qty = document.getElementById('newQuantityValue');
    if (dec && inc && qty) {
        dec.onclick = () => { let v = parseFloat(qty.value) || 1; v = Math.max(0.25, v - 0.25); qty.value = v; };
        inc.onclick = () => { let v = parseFloat(qty.value) || 1; v = v + 0.25; qty.value = v; };
    }
    
    const editUnit = document.getElementById('editUnitSelect');
    if (editUnit) {
        editUnit.addEventListener('change', function() {
            const unit = this.value;
            const qtyInput = document.getElementById('editQuantityValue');
            if (unit === 'half') qtyInput.value = 0.5;
            else if (unit === 'quarter') qtyInput.value = 0.25;
            else if (unit === 'oke') qtyInput.value = 0.2;
        });
    }
    
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.onclick = () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => { deferredPrompt = null; if (installBtn) installBtn.style.display = 'none'; });
            } else {
                showToast("📱 التطبيق مثبت مسبقاً", false);
            }
        };
    }
});

console.log("✅ App initialized successfully");
