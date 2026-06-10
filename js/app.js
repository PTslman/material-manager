// ==================== المتغيرات العامة ====================

let allMaterials = [];
let unsubscribe = null;
let currentEditId = null;
let currentPresetCategory = 'main';
let presetItemsLists = {};
let presetSelections = {};

// القوائم الجاهزة
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

presetItemsLists = {
    'main': importantItemsList,
    'spices_extra': spicesExtraItemsList,
    'roasted': roastedItemsList,
    'herbs': herbsItemsList,
    'extra': extraItemsList,
    'bags': bagTypesList
};

// ==================== دوال مساعدة ====================

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[m]));
}

function formatDisplay(mat) {
    if (!mat.quantity || mat.quantity === 0) return '⚠️ ناقصة';
    const u = mat.unitType;
    if (u === 'kg') return `${mat.quantity} kg`;
    if (u === 'half') return `نصف كيلو`;
    if (u === 'quarter') return `ربع كيلو`;
    if (u === 'oke') return `لوقية`;
    if (u === 'box') return `${mat.quantity} علبة`;
    if (u === 'piece') return `${mat.quantity} عدد`;
    if (u === 'bag') return `${mat.quantity} كيس`;
    return `${mat.quantity} kg`;
}

function getSectionTitle(section) {
    const titles = {
        'main': '<i class="fas fa-star-of-life"></i> أساسيات',
        'spices_extra': '<i class="fas fa-leaf"></i> بهارات اضافية',
        'roasted': '<i class="fas fa-fire"></i> المحمصة',
        'herbs': '<i class="fas fa-seedling"></i> الأعشاب',
        'extra': '<i class="fas fa-plus-circle"></i> مواد اضافية',
        'bags': '<i class="fas fa-shopping-bag"></i> أكياس تعبئة',
        'tawsaya': '<i class="fas fa-gift"></i> توصيات'
    };
    return titles[section] || section;
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

// ==================== تحليل المخزون ====================

function calculateAIMetrics() {
    if (!window.aiEngine) return;
    const analysis = window.aiEngine.analyzeInventory(allMaterials);
    document.getElementById('totalMaterialsCount').innerText = analysis.totalMaterials;
    document.getElementById('totalQuantityValue').innerText = analysis.totalQuantity.toFixed(1);
    document.getElementById('lowStockCount').innerHTML = `${analysis.lowStockCount}<span class="ai-stat-unit" style="font-size:0.625rem"> مادة</span>`;
    document.getElementById('avgQuantityValue').innerText = analysis.avgQuantity;
    
    const insightsContainer = document.getElementById('aiInsights');
    if (insightsContainer) {
        let insightsHtml = `<i class="fas fa-robot"></i><div style="flex:1">`;
        analysis.insights.forEach(insight => {
            insightsHtml += `<div style="margin-bottom: 8px; padding: 4px 0;">${insight}</div>`;
        });
        if (analysis.smartRecommendations && analysis.smartRecommendations.length > 0) {
            insightsHtml += `<div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--border-light)">`;
            analysis.smartRecommendations.slice(0, 2).forEach(rec => {
                insightsHtml += `<div style="margin-bottom: 8px;"><strong style="display: block; margin-bottom: 6px;">${rec.title}</strong><ul style="margin: 0 20px 0 0; padding-right: 0;">${rec.items.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}</ul></div>`;
            });
            insightsHtml += `</div>`;
        }
        insightsHtml += `</div>`;
        insightsContainer.innerHTML = insightsHtml;
    }
}

// ==================== عرض الأقسام والمواد ====================

function renderSections(materials) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;
    const sections = ['main', 'spices_extra', 'roasted', 'herbs', 'extra', 'bags', 'tawsaya'];
    let html = '';
    
    for (const section of sections) {
        const sectionMaterials = materials.filter(m => m.priority === section);
        html += `<div class="priority-section" data-section="${section}">
            <div class="section-header">
                <div class="section-title">${getSectionTitle(section)}</div>
                <button class="add-preset-btn action-btn" data-category="${section}" style="padding: 4px 12px; font-size: 11px;">
                    <i class="fas fa-plus"></i> إضافة جاهزة
                </button>
            </div>
            <div class="materials-grid" data-section-grid="${section}">
                ${sectionMaterials.length === 0 ? 
                    `<div class="empty-state"><i class="fas fa-box-open"></i><br>لا توجد مواد<br><small>اضغط مطولاً على أي مادة لنقلها إلى هنا</small></div>` : 
                    sectionMaterials.map(m => renderMaterialCard(m, section)).join('')
                }
            </div>
        </div>`;
    }
    
    container.innerHTML = html;
    
    document.querySelectorAll('.add-preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = btn.getAttribute('data-category');
            if (category && category !== 'tawsaya') openPresetModal(category);
        });
    });
    
    document.querySelectorAll('.edit-material').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const material = allMaterials.find(m => m.id === id);
            if (material) {
                currentEditId = id;
                document.getElementById('editMaterialName').value = material.name;
                document.getElementById('editQuantityValue').value = material.quantity || 0;
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
                materialsCollection.doc(id).delete().then(() => {
                    if (window.showToastMessage) window.showToastMessage("✅ تم حذف المادة");
                    if (unsubscribe) unsubscribe();
                    startListener();
                }).catch(e => console.error(e));
            }
        };
    });
    
    if (typeof window.initLongPressSystem === 'function') {
        setTimeout(() => window.initLongPressSystem(), 150);
    }
    calculateAIMetrics();
}

function renderMaterialCard(m, section) {
    const isLowStock = (!m.quantity || m.quantity === 0) && section !== 'tawsaya';
    const lowStockClass = isLowStock ? 'low-stock' : '';
    let quantityDisplay = formatDisplay(m);
    if (isLowStock && section !== 'tawsaya') quantityDisplay = '⚠️ ناقصة';
    
    return `<div class="material-card ${lowStockClass}" data-id="${m.id}" data-name="${escapeHtml(m.name)}" data-section="${section}">
        <div class="card-header">
            <div class="card-title"><i class="fas fa-box"></i> <span>${escapeHtml(m.name)}</span></div>
            <div class="card-actions">
                <button class="edit-material" data-id="${m.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-material" data-id="${m.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <div class="qty-badge">${quantityDisplay}</div>
    </div>`;
}

// ==================== النوافذ المنبثقة ====================

function openPresetModal(category) {
    currentPresetCategory = category;
    const titles = {'main': 'أساسيات', 'spices_extra': 'بهارات اضافية', 'roasted': 'المحمصة', 'herbs': 'الأعشاب', 'extra': 'مواد اضافية', 'bags': 'أكياس تعبئة'};
    document.getElementById('presetModalTitle').innerHTML = `<i class="fas fa-list"></i> إضافة مواد جاهزة - ${titles[category]}`;
    document.getElementById('presetModal').classList.add('active');
    renderPresetList(category, '');
    document.getElementById('presetSearchInput').focus();
}

function renderPresetList(category, filter) {
    const container = document.getElementById('presetListContainer');
    if (!container) return;
    const itemsList = presetItemsLists[category] || [];
    const filtered = itemsList.filter(item => item.includes(filter));
    const selections = presetSelections[category] || {};
    container.innerHTML = '';
    
    if (category === 'bags') {
        filtered.forEach((item, idx) => {
            const isChecked = selections[idx] || false;
            container.innerHTML += `<div class="modern-item-card"><div class="item-info"><input type="checkbox" class="preset-checkbox" data-index="${idx}" ${isChecked ? 'checked' : ''}><span class="item-name">${escapeHtml(item)}</span></div></div>`;
        });
    } else {
        filtered.forEach((item, idx) => {
            const isChecked = selections[idx] || false;
            container.innerHTML += `<div class="modern-item-card">
                <div class="item-info"><input type="checkbox" class="preset-checkbox" data-index="${idx}" ${isChecked ? 'checked' : ''}><span class="item-name">${escapeHtml(item)}</span></div>
                <div class="quantity-modern">
                    <select class="qty-select preset-unit" data-index="${idx}"><option value="kg">كيلو</option><option value="half">نصف كيلو</option><option value="quarter">ربع كيلو</option><option value="oke">لوقية</option><option value="box">علبة</option><option value="piece">عدد</option></select>
                    <div class="qty-controls" data-index="${idx}">
                        <button class="qty-dec-btn" data-idx="${idx}">-</button>
                        <input type="number" class="qty-value-modern preset-qty" data-idx="${idx}" value="1">
                        <button class="qty-inc-btn" data-idx="${idx}">+</button>
                    </div>
                </div>
            </div>`;
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
    const itemsList = presetItemsLists[category];
    const selections = presetSelections[category] || {};
    const itemsToAdd = [];
    
    for (const [idx, isChecked] of Object.entries(selections)) {
        if (isChecked) {
            const itemName = itemsList[parseInt(idx)];
            let unit = 'kg', quantity = 1;
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
        if (window.showToastMessage) window.showToastMessage("📦 اختر مادة واحدة على الأقل", true);
        return;
    }
    
    try {
        const batch = db.batch();
        itemsToAdd.forEach(it => {
            const ref = materialsCollection.doc();
            batch.set(ref, { name: it.name, unitType: it.unitType, quantity: it.quantity, notes: category, createdAt: firebase.firestore.FieldValue.serverTimestamp(), priority: category });
        });
        await batch.commit();
        if (window.showToastMessage) window.showToastMessage(`✓ تم إضافة ${itemsToAdd.length} مادة بنجاح`);
        document.getElementById('presetModal').classList.remove('active');
        presetSelections[category] = {};
        if (unsubscribe) unsubscribe();
        startListener();
    } catch(e) {
        if (window.showToastMessage) window.showToastMessage("❌ فشل الإضافة", true);
    }
}

// ==================== دوال Firebase ====================

async function addNewMaterialDirect() {
    let name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) {
        if (window.showToastMessage) window.showToastMessage("✏️ اكتب اسم المادة", true);
        return;
    }
    let section = document.getElementById('newMaterialSection')?.value || 'main';
    let unit = document.getElementById('newUnitSelect')?.value || 'kg';
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    if (isNaN(quantity) || quantity < 0) quantity = 0;
    if (unit === 'half') quantity = 0.5;
    else if (unit === 'quarter') quantity = 0.25;
    else if (unit === 'oke') quantity = 0.2;
    if (quantity === 0 && section !== 'tawsaya') {
        if (window.showToastMessage) window.showToastMessage(`⚠️ تمت إضافة "${name}" بدون كمية (مادة ناقصة)`, false);
    }
    
    try {
        await materialsCollection.add({ name: name, unitType: unit, quantity: quantity, createdAt: firebase.firestore.FieldValue.serverTimestamp(), priority: section });
        if (window.showToastMessage) window.showToastMessage(`✓ تمت إضافة "${name}"`);
        document.getElementById('newItemModal').classList.remove('active');
        document.getElementById('newMaterialName').value = "";
        document.getElementById('newQuantityValue').value = "0";
    } catch(e) {
        if (window.showToastMessage) window.showToastMessage("❌ خطأ في الاتصال", true);
    }
}

async function addTawsaya() {
    let name = document.getElementById('tawsayaName')?.value.trim();
    if (!name) {
        if (window.showToastMessage) window.showToastMessage("✏️ اسم المنتج مطلوب", true);
        return;
    }
    let type = document.querySelector('#tawsayaTypeGroup .unit-btn.active')?.getAttribute('data-type');
    let qty = 1;
    if (type === 'kg') qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    else if (type === 'half') qty = 0.5;
    else qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    if (isNaN(qty) || qty <= 0) {
        if (window.showToastMessage) window.showToastMessage("🔢 كمية صحيحة", true);
        return;
    }
    
    try {
        await materialsCollection.add({ name: name, unitType: 'kg', quantity: qty, notes: "توصيات", createdAt: firebase.firestore.FieldValue.serverTimestamp(), priority: "tawsaya" });
        if (window.showToastMessage) window.showToastMessage(`✓ تمت إضافة "${name}" للتوصيات`);
        document.getElementById('tawsayaName').value = "";
        document.getElementById('tawsayaCustomQty').value = "1";
        document.getElementById('tawsayaModal').classList.remove('active');
    } catch(e) {
        if (window.showToastMessage) window.showToastMessage("❌ فشل الإضافة", true);
    }
}

async function saveEdit() {
    if (!currentEditId) return;
    let newUnit = document.getElementById('editUnitSelect')?.value || 'kg';
    let newQty = parseFloat(document.getElementById('editQuantityValue')?.value);
    if (newUnit === 'half') newQty = 0.5;
    else if (newUnit === 'quarter') newQty = 0.25;
    else if (newUnit === 'oke') newQty = 0.2;
    if (isNaN(newQty) || newQty < 0) {
        if (window.showToastMessage) window.showToastMessage("🔢 كمية صحيحة", true);
        return;
    }
    
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: newQty, unitType: newUnit });
        if (window.showToastMessage) window.showToastMessage("✓ تم تحديث الكمية");
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
        if (unsubscribe) unsubscribe();
        startListener();
    } catch(e) {
        if (window.showToastMessage) window.showToastMessage("❌ فشل التحديث", true);
    }
}

async function clearAllMaterials() {
    if (allMaterials.length === 0) {
        if (window.showToastMessage) window.showToastMessage("📭 القائمة فارغة", true);
        return;
    }
    if (confirm("⚠️ هل أنت متأكد من حذف جميع المواد نهائياً؟ لا يمكن التراجع!")) {
        try {
            const batch = db.batch();
            allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
            await batch.commit();
            if (window.showToastMessage) window.showToastMessage("✓ تم مسح جميع المواد");
        } catch(e) {
            if (window.showToastMessage) window.showToastMessage("❌ فشل المسح", true);
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
            allMaterials.push({ id: doc.id, name: data.name, unitType: data.unitType || 'kg', quantity: data.quantity || 0, notes: data.notes || "", createdAt: data.createdAt, priority: data.priority || "main" });
        });
        
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        const itemsCount = document.getElementById('syncItemsCount');
        const syncTime = document.getElementById('syncLastTime');
        if (statusText) statusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncDot) syncDot.className = 'sync-dot';
        if (itemsCount) itemsCount.innerHTML = `<i class="fas fa-database"></i> ${allMaterials.length} عنصر`;
        if (syncTime) syncTime.innerHTML = `<i class="far fa-clock"></i> ${new Date().toLocaleTimeString()}`;
        
        renderSections(allMaterials);
        
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

// ==================== ربط الأحداث ====================

function bindEvents() {
    document.getElementById('mainAddBtn').onclick = () => document.getElementById('newItemModal').classList.add('active');
    document.getElementById('syncBtn').onclick = () => { if (unsubscribe) unsubscribe(); startListener(); if (window.showToastMessage) window.showToastMessage("🔄 جاري المزامنة..."); };
    document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark');
    document.getElementById('clearAllBtn').onclick = clearAllMaterials;
    document.getElementById('saveNewItemBtn').onclick = addNewMaterialDirect;
    document.getElementById('saveTawsayaBtn').onclick = addTawsaya;
    document.getElementById('saveEditBtn').onclick = saveEdit;
    document.getElementById('savePresetBtn').onclick = addSelectedPresetItems;
    document.getElementById('categoryTawsaya').onclick = () => document.getElementById('tawsayaModal').classList.add('active');
    document.getElementById('categoryMain').onclick = () => openPresetModal('main');
    document.getElementById('categorySpicesExtra').onclick = () => openPresetModal('spices_extra');
    document.getElementById('categoryRoasted').onclick = () => openPresetModal('roasted');
    document.getElementById('categoryHerbs').onclick = () => openPresetModal('herbs');
    document.getElementById('categoryExtra').onclick = () => openPresetModal('extra');
    document.getElementById('categoryBags').onclick = () => openPresetModal('bags');
    
    document.getElementById('confirmMoveBtn').onclick = () => {
        if (typeof window.executeMoveMaterial === 'function') {
            window.executeMoveMaterial();
        }
    };
    document.getElementById('cancelMoveBtn').onclick = () => {
        if (typeof window.closeMoveModal === 'function') {
            window.closeMoveModal();
        }
    };
    
    const debounce = (fn, delay) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), delay); }; };
    document.getElementById('presetSearchInput').oninput = debounce((e) => renderPresetList(currentPresetCategory, e.target.value), 300);
    
    document.querySelectorAll('#tawsayaTypeGroup .unit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#tawsayaTypeGroup .unit-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('tawsayaCustomQtyGroup').style.display = this.getAttribute('data-type') === 'custom' ? 'block' : 'none';
        });
    });
    
    document.querySelectorAll('.weight-preset').forEach(btn => {
        btn.addEventListener('click', function() { document.getElementById('tawsayaCustomQty').value = this.dataset.value; });
    });
    
    document.getElementById('backupBtn').onclick = () => {
        if (allMaterials.length === 0) {
            if (window.showToastMessage) window.showToastMessage("📭 لا توجد بيانات", true);
            return;
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(allMaterials, null, 2)]));
        a.download = `backup_${new Date().toISOString().slice(0, 19)}.json`;
        a.click();
        if (window.showToastMessage) window.showToastMessage("💾 تم نسخ البيانات");
    };
    
    document.getElementById('restoreBtn').onclick = () => {
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
                            await materialsCollection.add({ name: it.name, unitType: it.unitType || 'kg', quantity: it.quantity || 0, notes: it.notes || "", priority: it.priority || "main", createdAt: firebase.firestore.FieldValue.serverTimestamp() });
                        }
                        if (window.showToastMessage) window.showToastMessage("✓ تم الاستعادة");
                        if (unsubscribe) unsubscribe();
                        startListener();
                    }
                } catch(e) {
                    if (window.showToastMessage) window.showToastMessage("❌ ملف غير صالح", true);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
}

// ==================== التهيئة ====================

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    startListener();
    
    window.closeAllModals = () => {
        const modals = ['newItemModal', 'presetModal', 'tawsayaModal', 'editModal', 'systemMessageModal', 'moveItemModal'];
        modals.forEach(id => { document.getElementById(id)?.classList.remove('active'); });
    };
    
    const closeButtons = ['closeNewModalBtn', 'closePresetModalBtn', 'closeTawsayaModalBtn', 'closeEditModalBtn', 'closeSystemMessageBtn'];
    closeButtons.forEach(id => { document.getElementById(id)?.addEventListener('click', window.closeAllModals); });
    
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; document.getElementById('installBtn').style.display = 'flex'; });
    document.getElementById('installBtn').addEventListener('click', () => {
        if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(() => { deferredPrompt = null; }); }
        else { if (window.showToastMessage) window.showToastMessage("📱 التطبيق مثبت مسبقاً", false); }
    });
    
    document.getElementById('editUnitSelect').addEventListener('change', function() {
        const unit = this.value;
        const qtyInput = document.getElementById('editQuantityValue');
        if (unit === 'half') qtyInput.value = 0.5;
        else if (unit === 'quarter') qtyInput.value = 0.25;
        else if (unit === 'oke') qtyInput.value = 0.2;
    });
    
    const dec = document.getElementById('newQtyDec');
    const inc = document.getElementById('newQtyInc');
    const qty = document.getElementById('newQuantityValue');
    if (dec && inc && qty) {
        dec.onclick = () => { let v = parseFloat(qty.value) || 0; v = Math.max(0, v - 0.25); qty.value = v; };
        inc.onclick = () => { let v = parseFloat(qty.value) || 0; v = v + 0.25; qty.value = v; };
    }
});
