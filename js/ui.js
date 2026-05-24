// ui.js - إدارة واجهة المستخدم وعرض المواد

// عرض جميع المواد في الواجهة
function renderAllMaterials(materials) {
    const container = document.getElementById('materialsContainer');
    if (!container) return;
    
    const main = materials.filter(m => m.priority === 'main');
    const spicesExtra = materials.filter(m => m.priority === 'spices_extra');
    const extra = materials.filter(m => m.priority === 'extra');
    const taws = materials.filter(m => m.priority === 'tawsaya');
    
    const sortDate = (a, b) => (b.createdAt?.toMillis?.() || b.createdAt) - (a.createdAt?.toMillis?.() || a.createdAt);
    main.sort(sortDate);
    spicesExtra.sort(sortDate);
    extra.sort(sortDate);
    taws.sort(sortDate);
    
    let html = `
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-star-of-life"></i> المواد الهامة</div>
            ${main.length === 0 ? '<div class="empty-state">✨ لا توجد مواد هامة</div>' : `<div class="materials-grid">${main.map(m => renderMaterialCard(m)).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-leaf"></i> بهارات اضافية</div>
            ${spicesExtra.length === 0 ? '<div class="empty-state">🌿 لا توجد بهارات اضافية</div>' : `<div class="materials-grid">${spicesExtra.map(m => renderMaterialCard(m)).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-seedling"></i> بذوريات واعشاب</div>
            ${extra.length === 0 ? '<div class="empty-state">🌱 لا توجد مواد في هذا القسم</div>' : `<div class="materials-grid">${extra.map(m => renderMaterialCard(m)).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-gift"></i> التوصاية</div>
            ${taws.length === 0 ? '<div class="empty-state">🎁 لا توجد توصايات</div>' : `<div class="materials-grid">${taws.map(m => renderMaterialCard(m)).join('')}</div>`}
        </div>
    `;
    
    container.innerHTML = html;
    
    // ربط أحداث الحذف والتعديل
    document.querySelectorAll('.delete-material').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            if (id) {
                const material = allMaterials.find(m => m.id === id);
                const materialName = material ? material.name : 'هذه المادة';
                showConfirmDialog(`⚠️ هل أنت متأكد من حذف "${materialName}"؟`, async () => {
                    try {
                        await materialsCollection.doc(id).delete();
                        showToast("✅ تم حذف المادة");
                    } catch (e) {
                        showToast("❌ فشل الحذف", true);
                    }
                });
            }
        };
    });
    
    document.querySelectorAll('.edit-material').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const material = allMaterials.find(m => m.id === id);
            if (material && canEditMaterial(material.unitType)) {
                currentEditId = id;
                const editMaterialName = document.getElementById('editMaterialName');
                const editQuantityValue = document.getElementById('editQuantityValue');
                if (editMaterialName) editMaterialName.value = material.name;
                if (editQuantityValue) editQuantityValue.value = material.quantity;
                const editModal = document.getElementById('editModal');
                if (editModal) editModal.classList.add('active');
            }
        };
    });
}

function renderMaterialCard(m) {
    const showEdit = canEditMaterial(m.unitType);
    return `<div class="material-card">
        <div class="card-header">
            <div class="card-title"><i class="fas fa-box"></i> ${escapeHtml(m.name)}</div>
            <div class="card-actions">
                <button class="edit-material ${!showEdit ? 'hidden' : ''}" data-id="${m.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-material" data-id="${m.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <div class="qty-badge">${formatDisplay(m)}</div>
    </div>`;
}

function canEditMaterial(unitType) {
    return unitType === 'kg';
}

// دوال النوافذ المنبثقة (Modals)
function showConfirmDialog(message, onConfirm) {
    const confirmMessage = document.getElementById('confirmDeleteMessage');
    const confirmModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    if (confirmMessage) confirmMessage.innerText = message;
    if (confirmModal) confirmModal.classList.add('active');
    
    const handleConfirm = () => {
        if (confirmModal) confirmModal.classList.remove('active');
        if (onConfirm) onConfirm();
        if (confirmDeleteBtn) confirmDeleteBtn.removeEventListener('click', handleConfirm);
        if (cancelDeleteBtn) cancelDeleteBtn.removeEventListener('click', handleCancel);
    };
    
    const handleCancel = () => {
        if (confirmModal) confirmModal.classList.remove('active');
        if (confirmDeleteBtn) confirmDeleteBtn.removeEventListener('click', handleConfirm);
        if (cancelDeleteBtn) cancelDeleteBtn.removeEventListener('click', handleCancel);
    };
    
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleConfirm, { once: true });
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', handleCancel, { once: true });
}

// عرض القوائم مع البحث
function renderImportantFiltered(filter = '') {
    const container = document.getElementById('importantListContainer');
    if (!container) return;
    
    const allItems = getImportantItems();
    const filtered = allItems.filter(item => item.name.includes(filter));
    let html = '';
    
    filtered.forEach((it, idx) => {
        const originalIdx = allItems.findIndex(orig => orig.name === it.name);
        html += `<div class="modern-item-card" data-idx="${originalIdx}">
            <div class="item-info">
                <input type="checkbox" id="important_chk_${originalIdx}" style="margin-left: 10px;"> 
                <span class="item-name">${escapeHtml(it.name)}</span>
            </div>
            <div class="quantity-modern">
                <button class="qty-btn" data-action="decr" data-idx="${originalIdx}">-</button>
                <input type="number" class="qty-value" id="important_qty_${originalIdx}" value="${it.min}" step="1" min="1" max="5">
                <button class="qty-btn" data-action="incr" data-idx="${originalIdx}">+</button>
                <span class="unit-label" style="margin-right: 5px;">kg</span>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('#importantListContainer .qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            const input = document.getElementById(`important_qty_${idx}`);
            if (input) {
                let val = parseInt(input.value);
                if (btn.getAttribute('data-action') === 'incr') val = Math.min(val + 1, 5);
                else val = Math.max(val - 1, 1);
                input.value = val;
            }
        });
    });
}

function renderQuickFiltered(filter = '') {
    const container = document.getElementById('quickListContainer');
    if (!container) return;
    
    const allItems = getExtraItems();
    const filtered = allItems.filter(item => item.name.includes(filter));
    let html = '';
    
    filtered.forEach((it, idx) => {
        const originalIdx = allItems.findIndex(orig => orig.name === it.name);
        html += `<div class="modern-item-card" data-idx="${originalIdx}">
            <div class="item-info">
                <input type="checkbox" id="quick_chk_${originalIdx}" style="margin-left: 10px;"> 
                <span class="item-name">${escapeHtml(it.name)}</span>
            </div>
            <div class="quantity-modern">
                <button class="qty-btn" data-action="decr" data-idx="${originalIdx}">-</button>
                <input type="number" class="qty-value" id="quick_qty_${originalIdx}" value="${it.min}" step="1" min="1" max="10">
                <button class="qty-btn" data-action="incr" data-idx="${originalIdx}">+</button>
                <span class="unit-label">kg</span>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('#quickListContainer .qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            const input = document.getElementById(`quick_qty_${idx}`);
            if (input) {
                let val = parseInt(input.value);
                if (btn.getAttribute('data-action') === 'incr') val = Math.min(val + 1, 10);
                else val = Math.max(val - 1, 1);
                input.value = val;
            }
        });
    });
}

function renderSpicesExtraFiltered(filter = '') {
    const container = document.getElementById('spicesExtraListContainer');
    if (!container) return;
    
    const allItems = getSpicesExtraItems();
    const filtered = allItems.filter(item => item.name.includes(filter));
    let html = '';
    
    filtered.forEach((it, idx) => {
        const originalIdx = allItems.findIndex(orig => orig.name === it.name);
        html += `<div class="modern-item-card" data-idx="${originalIdx}">
            <div class="item-info">
                <input type="checkbox" id="spices_extra_chk_${originalIdx}" style="margin-left: 10px;"> 
                <span class="item-name">${escapeHtml(it.name)}</span>
            </div>
            <div class="quantity-modern">
                <button class="qty-btn" data-action="decr" data-idx="${originalIdx}">-</button>
                <input type="number" class="qty-value" id="spices_extra_qty_${originalIdx}" value="${it.min}" step="1" min="1" max="10">
                <button class="qty-btn" data-action="incr" data-idx="${originalIdx}">+</button>
                <span class="unit-label">kg</span>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('#spicesExtraListContainer .qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            const input = document.getElementById(`spices_extra_qty_${idx}`);
            if (input) {
                let val = parseInt(input.value);
                if (btn.getAttribute('data-action') === 'incr') val = Math.min(val + 1, 10);
                else val = Math.max(val - 1, 1);
                input.value = val;
            }
        });
    });
}

function renderBags() {
    const container = document.getElementById('bagsListContainer');
    if (!container) return;
    
    let html = '';
    bagTypesList.forEach((t, i) => {
        html += `<div class="modern-item-card" data-idx="${i}">
            <div class="item-info">
                <input type="checkbox" id="bag_chk_${i}" style="margin-left: 10px;"> 
                <span class="item-name">${escapeHtml(t)}</span>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

// دوال إضافة العناصر المحددة
async function addSelectedImportant() {
    let items = [];
    const itemsData = getImportantItems();
    for (let i = 0; i < itemsData.length; i++) {
        const chk = document.getElementById(`important_chk_${i}`);
        if (chk && chk.checked) {
            let qty = parseInt(document.getElementById(`important_qty_${i}`).value);
            items.push({ name: itemsData[i].name, quantity: qty });
        }
    }
    if (items.length === 0) {
        showToast("⭐ اختر مادة هامة", true);
        return;
    }
    try {
        let batch = db.batch();
        items.forEach(p => {
            let ref = materialsCollection.doc();
            batch.set(ref, {
                name: p.name,
                unitType: 'kg',
                quantity: p.quantity,
                notes: "مواد هامة سريعة",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "main"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} مادة`);
        const importantModal = document.getElementById('importantModal');
        if (importantModal) importantModal.classList.remove('active');
        const importantSearchInput = document.getElementById('importantSearchInput');
        if (importantSearchInput) importantSearchInput.value = '';
    } catch (e) {
        showToast("❌ فشل", true);
    }
}

async function addSelectedQuick() {
    let items = [];
    const itemsData = getExtraItems();
    for (let i = 0; i < itemsData.length; i++) {
        const chk = document.getElementById(`quick_chk_${i}`);
        if (chk && chk.checked) {
            let qty = parseInt(document.getElementById(`quick_qty_${i}`).value);
            items.push({ name: itemsData[i].name, quantity: qty });
        }
    }
    if (items.length === 0) {
        showToast("🌱 اختر منتجاً", true);
        return;
    }
    try {
        let batch = db.batch();
        items.forEach(p => {
            let ref = materialsCollection.doc();
            batch.set(ref, {
                name: p.name,
                unitType: 'kg',
                quantity: p.quantity,
                notes: "بذوريات واعشاب",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} منتج`);
        const quickModal = document.getElementById('quickModal');
        if (quickModal) quickModal.classList.remove('active');
        const quickSearchInput = document.getElementById('quickSearchInput');
        if (quickSearchInput) quickSearchInput.value = '';
    } catch (e) {
        showToast("❌ فشل", true);
    }
}

async function addSelectedSpicesExtra() {
    let items = [];
    const itemsData = getSpicesExtraItems();
    for (let i = 0; i < itemsData.length; i++) {
        const chk = document.getElementById(`spices_extra_chk_${i}`);
        if (chk && chk.checked) {
            let qty = parseInt(document.getElementById(`spices_extra_qty_${i}`).value);
            items.push({ name: itemsData[i].name, quantity: qty });
        }
    }
    if (items.length === 0) {
        showToast("🌿 اختر بهاراً", true);
        return;
    }
    try {
        let batch = db.batch();
        items.forEach(p => {
            let ref = materialsCollection.doc();
            batch.set(ref, {
                name: p.name,
                unitType: 'kg',
                quantity: p.quantity,
                notes: "بهارات اضافية",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "spices_extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} بهار`);
        const spicesExtraModal = document.getElementById('spicesExtraModal');
        if (spicesExtraModal) spicesExtraModal.classList.remove('active');
        const spicesExtraSearchInput = document.getElementById('spicesExtraSearchInput');
        if (spicesExtraSearchInput) spicesExtraSearchInput.value = '';
    } catch (e) {
        showToast("❌ فشل", true);
    }
}

async function addSelectedBags() {
    let selected = [];
    for (let i = 0; i < bagTypesList.length; i++) {
        if (document.getElementById(`bag_chk_${i}`)?.checked) {
            selected.push(bagTypesList[i]);
        }
    }
    if (selected.length === 0) {
        showToast("📦 اختر نوع كيس", true);
        return;
    }
    try {
        let batch = db.batch();
        selected.forEach(b => {
            let ref = materialsCollection.doc();
            batch.set(ref, {
                name: `كيس تعبئة - ${b}`,
                unitType: 'bag',
                quantity: 1,
                notes: "أكياس تعبئة",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${selected.length} نوع`);
        for (let i = 0; i < bagTypesList.length; i++) {
            let chk = document.getElementById(`bag_chk_${i}`);
            if (chk) chk.checked = false;
        }
        const bagsModal = document.getElementById('bagsModal');
        if (bagsModal) bagsModal.classList.remove('active');
    } catch (e) {
        showToast("❌ فشل إضافة الأكياس", true);
    }
}

async function addTawsaya() {
    const nameInput = document.getElementById('tawsayaName');
    const customQtyInput = document.getElementById('tawsayaCustomQty');
    
    let name = nameInput?.value.trim();
    if (!name) {
        showToast("✏️ اسم التوصاية", true);
        return;
    }
    
    let type = document.querySelector('input[name="tawsayaType"]:checked')?.value;
    let qty = 1;
    
    if (type === 'kg') {
        let v = parseFloat(customQtyInput?.value);
        if (isNaN(v) || v <= 0) {
            showToast("🔢 كمية صحيحة", true);
            return;
        }
        qty = v;
    } else if (type === 'half') {
        qty = 0.5;
    } else {
        let v = parseFloat(customQtyInput?.value);
        if (isNaN(v) || v <= 0) {
            showToast("🔢 كمية صحيحة", true);
            return;
        }
        qty = v;
    }
    
    try {
        await materialsCollection.add({
            name,
            unitType: 'kg',
            quantity: qty,
            notes: "توصاية",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: "tawsaya"
        });
        showToast(`✓ تمت إضافة "${name}"`);
        if (nameInput) nameInput.value = "";
        if (customQtyInput) customQtyInput.value = "1";
        const kgRadio = document.querySelector('input[value="kg"]');
        if (kgRadio) kgRadio.checked = true;
        toggleTawsayaField();
        const tawsayaModal = document.getElementById('tawsayaModal');
        if (tawsayaModal) tawsayaModal.classList.remove('active');
    } catch (e) {
        showToast("❌ خطأ", true);
    }
}

async function saveEdit() {
    if (!currentEditId) return;
    const editQuantityValue = document.getElementById('editQuantityValue');
    let newQty = parseFloat(editQuantityValue?.value);
    if (isNaN(newQty) || newQty <= 0) {
        showToast("🔢 كمية صحيحة", true);
        return;
    }
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: newQty });
        showToast("✓ تم تحديث الكمية");
        const editModal = document.getElementById('editModal');
        if (editModal) editModal.classList.remove('active');
        currentEditId = null;
    } catch (e) {
        showToast("❌ فشل التحديث", true);
    }
}

function toggleTawsayaField() {
    const customGroup = document.getElementById('tawsayaCustomQtyGroup');
    const selectedType = document.querySelector('input[name="tawsayaType"]:checked')?.value;
    if (customGroup) {
        customGroup.style.display = selectedType === 'custom' ? 'block' : 'none';
    }
}

// ربط أحداث النوافذ المنبثقة
function bindModalEvents() {
    // نافذة بهارات هامة
    const importantBtn = document.getElementById('importantProductsBtn');
    const importantModal = document.getElementById('importantModal');
    const closeImportantBtn = document.getElementById('closeImportantModalBtn');
    const saveImportantBtn = document.getElementById('saveImportantBtn');
    const importantSearch = document.getElementById('importantSearchInput');
    
    if (importantBtn) {
        importantBtn.onclick = () => {
            renderImportantFiltered('');
            if (importantModal) importantModal.classList.add('active');
            if (importantSearch) importantSearch.focus();
        };
    }
    if (closeImportantBtn) closeImportantBtn.onclick = () => importantModal?.classList.remove('active');
    if (saveImportantBtn) saveImportantBtn.onclick = addSelectedImportant;
    if (importantSearch) {
        importantSearch.oninput = (e) => renderImportantFiltered(e.target.value.trim());
    }
    
    // نافذة بهارات اضافية
    const spicesExtraBtn = document.getElementById('spicesExtraBtn');
    const spicesExtraModal = document.getElementById('spicesExtraModal');
    const closeSpicesExtraBtn = document.getElementById('closeSpicesExtraModalBtn');
    const saveSpicesExtraBtn = document.getElementById('saveSpicesExtraBtn');
    const spicesExtraSearch = document.getElementById('spicesExtraSearchInput');
    
    if (spicesExtraBtn) {
        spicesExtraBtn.onclick = () => {
            renderSpicesExtraFiltered('');
            if (spicesExtraModal) spicesExtraModal.classList.add('active');
            if (spicesExtraSearch) spicesExtraSearch.focus();
        };
    }
    if (closeSpicesExtraBtn) closeSpicesExtraBtn.onclick = () => spicesExtraModal?.classList.remove('active');
    if (saveSpicesExtraBtn) saveSpicesExtraBtn.onclick = addSelectedSpicesExtra;
    if (spicesExtraSearch) {
        spicesExtraSearch.oninput = (e) => renderSpicesExtraFiltered(e.target.value.trim());
    }
    
    // نافذة بذوريات واعشاب
    const quickBtn = document.getElementById('quickProductsBtn');
    const quickModal = document.getElementById('quickModal');
    const closeQuickBtn = document.getElementById('closeQuickModalBtn');
    const saveQuickBtn = document.getElementById('saveQuickBtn');
    const quickSearch = document.getElementById('quickSearchInput');
    
    if (quickBtn) {
        quickBtn.onclick = () => {
            renderQuickFiltered('');
            if (quickModal) quickModal.classList.add('active');
            if (quickSearch) quickSearch.focus();
        };
    }
    if (closeQuickBtn) closeQuickBtn.onclick = () => quickModal?.classList.remove('active');
    if (saveQuickBtn) saveQuickBtn.onclick = addSelectedQuick;
    if (quickSearch) {
        quickSearch.oninput = (e) => renderQuickFiltered(e.target.value.trim());
    }
    
    // نافذة أكياس
    const bagsBtn = document.getElementById('bagsManagerBtn');
    const bagsModal = document.getElementById('bagsModal');
    const closeBagsBtn = document.getElementById('closeBagsModalBtn');
    const saveBagsBtn = document.getElementById('saveBagsBtn');
    
    if (bagsBtn) {
        bagsBtn.onclick = () => {
            renderBags();
            if (bagsModal) bagsModal.classList.add('active');
        };
    }
    if (closeBagsBtn) closeBagsBtn.onclick = () => bagsModal?.classList.remove('active');
    if (saveBagsBtn) saveBagsBtn.onclick = addSelectedBags;
    
    // نافذة توصاية
    const tawsayaBtn = document.getElementById('tawsayaQuickBtn');
    const tawsayaModal = document.getElementById('tawsayaModal');
    const closeTawsayaBtn = document.getElementById('closeTawsayaModalBtn');
    const saveTawsayaBtn = document.getElementById('saveTawsayaBtn');
    const tawsayaRadios = document.querySelectorAll('input[name="tawsayaType"]');
    
    if (tawsayaBtn) {
        tawsayaBtn.onclick = () => {
            if (tawsayaModal) tawsayaModal.classList.add('active');
            const tawsayaName = document.getElementById('tawsayaName');
            if (tawsayaName) tawsayaName.focus();
            toggleTawsayaField();
        };
    }
    if (closeTawsayaBtn) closeTawsayaBtn.onclick = () => tawsayaModal?.classList.remove('active');
    if (saveTawsayaBtn) saveTawsayaBtn.onclick = addTawsaya;
    tawsayaRadios.forEach(r => r.addEventListener('change', toggleTawsayaField));
    
    // نافذة تعديل
    const editModal = document.getElementById('editModal');
    const closeEditBtn = document.getElementById('closeEditModalBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');
    
    if (closeEditBtn) closeEditBtn.onclick = () => editModal?.classList.remove('active');
    if (saveEditBtn) saveEditBtn.onclick = saveEdit;
}

// تصدير الدوال للنطاق العام
window.renderAllMaterials = renderAllMaterials;
window.renderImportantFiltered = renderImportantFiltered;
window.renderQuickFiltered = renderQuickFiltered;
window.renderSpicesExtraFiltered = renderSpicesExtraFiltered;
window.renderBags = renderBags;
window.addSelectedImportant = addSelectedImportant;
window.addSelectedQuick = addSelectedQuick;
window.addSelectedSpicesExtra = addSelectedSpicesExtra;
window.addSelectedBags = addSelectedBags;
window.addTawsaya = addTawsaya;
window.saveEdit = saveEdit;
window.toggleTawsayaField = toggleTawsayaField;
window.showConfirmDialog = showConfirmDialog;

// ربط الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    bindModalEvents();
});
