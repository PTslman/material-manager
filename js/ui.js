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
                document.getElementById('editMaterialName').value = material.name;
                document.getElementById('editQuantityValue').value = material.quantity;
                document.getElementById('editModal').classList.add('active');
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

function showConfirmDialog(message, onConfirm) {
    document.getElementById('confirmDeleteMessage').innerText = message;
    document.getElementById('confirmDeleteModal').classList.add('active');
    
    const handleConfirm = () => {
        document.getElementById('confirmDeleteModal').classList.remove('active');
        if (onConfirm) onConfirm();
        document.getElementById('confirmDeleteBtn').removeEventListener('click', handleConfirm);
        document.getElementById('cancelDeleteBtn').removeEventListener('click', handleCancel);
    };
    
    const handleCancel = () => {
        document.getElementById('confirmDeleteModal').classList.remove('active');
        document.getElementById('confirmDeleteBtn').removeEventListener('click', handleConfirm);
        document.getElementById('cancelDeleteBtn').removeEventListener('click', handleCancel);
    };
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirm, { once: true });
    document.getElementById('cancelDeleteBtn').addEventListener('click', handleCancel, { once: true });
}

function renderImportantFiltered(filter = '') {
    if (window.refreshConstantsData) window.refreshConstantsData();
    
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
    if (window.refreshConstantsData) window.refreshConstantsData();
    
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
    if (window.refreshConstantsData) window.refreshConstantsData();
    
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
        document.getElementById('importantModal').classList.remove('active');
        document.getElementById('importantSearchInput').value = '';
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
        document.getElementById('quickModal').classList.remove('active');
        document.getElementById('quickSearchInput').value = '';
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
        document.getElementById('spicesExtraModal').classList.remove('active');
        document.getElementById('spicesExtraSearchInput').value = '';
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
        document.getElementById('bagsModal').classList.remove('active');
    } catch (e) {
        showToast("❌ فشل إضافة الأكياس", true);
    }
}

async function addTawsaya() {
    let name = document.getElementById('tawsayaName')?.value.trim();
    if (!name) {
        showToast("✏️ اسم التوصاية", true);
        return;
    }
    let type = document.querySelector('#tawsayaTypeGroup .unit-btn.active')?.getAttribute('data-type');
    let qty = 1;
    if (type === 'kg') {
        let v = parseFloat(document.getElementById('tawsayaCustomQty')?.value);
        if (isNaN(v) || v <= 0) {
            showToast("🔢 كمية صحيحة", true);
            return;
        }
        qty = v;
    } else if (type === 'half') {
        qty = 0.5;
    } else {
        let v = parseFloat(document.getElementById('tawsayaCustomQty')?.value);
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
        document.getElementById('tawsayaName').value = "";
        document.getElementById('tawsayaCustomQty').value = "1";
        document.querySelector('#tawsayaTypeGroup .unit-btn[data-type="kg"]').classList.add('active');
        document.querySelector('#tawsayaTypeGroup .unit-btn[data-type="half"]')?.classList.remove('active');
        document.querySelector('#tawsayaTypeGroup .unit-btn[data-type="custom"]')?.classList.remove('active');
        document.getElementById('tawsayaCustomQtyGroup').style.display = 'none';
        document.getElementById('tawsayaModal').classList.remove('active');
    } catch (e) {
        showToast("❌ خطأ", true);
    }
}

async function saveEdit() {
    if (!currentEditId) return;
    let newQty = parseFloat(document.getElementById('editQuantityValue')?.value);
    if (isNaN(newQty) || newQty <= 0) {
        showToast("🔢 كمية صحيحة", true);
        return;
    }
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: newQty });
        showToast("✓ تم تحديث الكمية");
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
    } catch (e) {
        showToast("❌ فشل التحديث", true);
    }
}

function bindModalEvents() {
    document.getElementById('importantProductsBtn')?.addEventListener('click', () => {
        renderImportantFiltered('');
        document.getElementById('importantModal').classList.add('active');
        document.getElementById('importantSearchInput')?.focus();
    });
    document.getElementById('closeImportantModalBtn')?.addEventListener('click', () => {
        document.getElementById('importantModal').classList.remove('active');
    });
    document.getElementById('saveImportantBtn')?.addEventListener('click', addSelectedImportant);
    document.getElementById('importantSearchInput')?.addEventListener('input', (e) => {
        renderImportantFiltered(e.target.value.trim());
    });
    
    document.getElementById('spicesExtraBtn')?.addEventListener('click', () => {
        renderSpicesExtraFiltered('');
        document.getElementById('spicesExtraModal').classList.add('active');
        document.getElementById('spicesExtraSearchInput')?.focus();
    });
    document.getElementById('closeSpicesExtraModalBtn')?.addEventListener('click', () => {
        document.getElementById('spicesExtraModal').classList.remove('active');
    });
    document.getElementById('saveSpicesExtraBtn')?.addEventListener('click', addSelectedSpicesExtra);
    document.getElementById('spicesExtraSearchInput')?.addEventListener('input', (e) => {
        renderSpicesExtraFiltered(e.target.value.trim());
    });
    
    document.getElementById('quickProductsBtn')?.addEventListener('click', () => {
        renderQuickFiltered('');
        document.getElementById('quickModal').classList.add('active');
        document.getElementById('quickSearchInput')?.focus();
    });
    document.getElementById('closeQuickModalBtn')?.addEventListener('click', () => {
        document.getElementById('quickModal').classList.remove('active');
    });
    document.getElementById('saveQuickBtn')?.addEventListener('click', addSelectedQuick);
    document.getElementById('quickSearchInput')?.addEventListener('input', (e) => {
        renderQuickFiltered(e.target.value.trim());
    });
    
    document.getElementById('bagsManagerBtn')?.addEventListener('click', () => {
        renderBags();
        document.getElementById('bagsModal').classList.add('active');
    });
    document.getElementById('closeBagsModalBtn')?.addEventListener('click', () => {
        document.getElementById('bagsModal').classList.remove('active');
    });
    document.getElementById('saveBagsBtn')?.addEventListener('click', addSelectedBags);
    
    document.getElementById('tawsayaQuickBtn')?.addEventListener('click', () => {
        document.getElementById('tawsayaModal').classList.add('active');
        document.getElementById('tawsayaName')?.focus();
    });
    document.getElementById('closeTawsayaModalBtn')?.addEventListener('click', () => {
        document.getElementById('tawsayaModal').classList.remove('active');
    });
    document.getElementById('saveTawsayaBtn')?.addEventListener('click', addTawsaya);
    
    document.getElementById('closeEditModalBtn')?.addEventListener('click', () => {
        document.getElementById('editModal').classList.remove('active');
    });
    document.getElementById('saveEditBtn')?.addEventListener('click', saveEdit);
}

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
window.showConfirmDialog = showConfirmDialog;

document.addEventListener('DOMContentLoaded', () => {
    bindModalEvents();
});
