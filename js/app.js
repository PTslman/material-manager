let allMaterials = [];
let unsubscribe = null;
let currentEditId = null;
let autoSyncInterval = null;

// ==================== القوائم الثابتة ====================
const importantItemsList = [
    "شطه حلوة", "شطة حدة", "بابريكا مدخنة", "فلفل اسود ناعم", "كزبرة ناعمة", "كزبرة حب",
    "قرفة خشنة عيدان", "قرفة سيجار", "كمون ناعم", "كمون حب", "كاكاو نخب اول", "كاكاو نخب ثاني",
    "كركم", "كريمة محلاية", "كبسة ناعمة", "كبسة خليجية", "كاري", "مندي", "زنجبيل خشن",
    "زنجبيل ناعم", "سمسم", "سماق ناعم", "شيش", "شاورما", "حبة البركة", "ثوم ناعم", "بصل ناعم",
    "ملح ليمون", "ملح صيني", "ماجي صفراء", "ماجي بيضاء", "مشكلة", "مشكلة بيضاء", "نشا مصري", "هيل ناعم", "هيل حب"
];

const spicesExtraItemsList = [
    "عصفر", "توابل هندية حارة", "صفار الزعفران", "صفار البيض", "فلفل اسود حب", "فلفل ابيض ناعم",
    "فلافل", "فاهيتا", "قرنفل ناعم", "قرنفل حب", "قرفة ناعمة", "قلي", "كتشب", "كراوية", "كريسبي",
    "بطاطا", "بروستد", "زعتر اوريجانو", "بيتزا", "جوزة الطيب ناعمة", "جوزة الطيب حب", "حلبة حب",
    "حلبة ناعمة", "خل نكهة", "خميرة", "لحمة خاروف", "مكسيكي", "مشاوي", "مدخنة", "محاشي", "نشا درس",
    "يانسون ناعم", "سدر ناعم", "سمك", "سجق", "سحلب", "شبة ناعمة", "نوديلز اندومي", "الكليجة"
];

const extraItemsList = [
    "بذر دوار شمس ملكي", "بذر دوار شمس الشبح", "بذر اصفر ملكي", "بذر اسود ملكي", "بذر كوسا",
    "بذر ابيض عريض", "فستق مدخن", "فستق مملح", "ذرة الفوشار", "شوفان", "نعنع يابس", "نسكافية خشنة",
    "اشلميش", "ลوز ني", "كاجو ني", "لوز بقشرو", "فستق ني", "لبان الدكر", "لومي", "لومي اسود", "كركدية",
    "زهرة الالماسة", "شمرا ناعمة", "شمرا حب", "زهورات مشكلة", "جوز امريكي", "تمر سري", "جوز هند خشن",
    "جوز هند ناعم", "بذور الشيا", "بذور الكتان", "بذور الرشاد", "رمان زركش"
];

const bagTypesList = ["شفاف 10×12","شفاف 20×12","شفاف 10×20","شفاف 25×17","شفاف 20×30","شفاف 35×25","صيدلية","أسود 30","أسود 35","أسود 40","أسود 45"];

function getImportantItems() { return importantItemsList.map(name => ({ name, min: 1, max: 5 })); }
function getSpicesExtraItems() { return spicesExtraItemsList.map(name => ({ name, min: 1, max: 10 })); }
function getExtraItems() { return extraItemsList.map(name => ({ name, min: 1, max: 10 })); }

// ==================== دوال مساعدة ====================
function showToast(msg, isErr = false) {
    let t = document.querySelector('.toast');
    if (t) t.remove();
    let div = document.createElement('div');
    div.className = 'toast';
    div.style.background = isErr ? '#dc2626' : '#2e7d32';
    div.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}

function formatDisplay(mat) {
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

// ==================== عرض المواد ====================
function renderAllMaterials(materials) {
    const container = document.getElementById('materialsContainer');
    if (!container) return;
    
    const main = materials.filter(m => m.priority === 'main');
    const spicesExtra = materials.filter(m => m.priority === 'spices_extra');
    const extra = materials.filter(m => m.priority === 'extra');
    const taws = materials.filter(m => m.priority === 'tawsaya');
    
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
            const material = allMaterials.find(m => m.id === id);
            if (confirm(`⚠️ هل أنت متأكد من حذف "${material?.name}"؟`)) {
                materialsCollection.doc(id).delete().then(() => showToast("✅ تم حذف المادة")).catch(e => showToast("❌ فشل الحذف", true));
            }
        };
    });
    
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
                updateEditFieldByUnit(material.unitType || 'kg');
                document.getElementById('editModal').classList.add('active');
            }
        };
    });
}

function renderMaterialCard(m) {
    return `<div class="material-card">
        <div class="card-header">
            <div class="card-title"><i class="fas fa-box"></i> ${escapeHtml(m.name)}</div>
            <div class="card-actions">
                <button class="edit-material" data-id="${m.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-material" data-id="${m.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <div class="qty-badge">${formatDisplay(m)}</div>
    </div>`;
}

// ==================== دوال تحديث الكمية ====================
function updateQuantityControls(container, unit, inputId, isEditMode = false) {
    const controlsDiv = container.querySelector('.qty-controls');
    if (!controlsDiv) return;
    
    if (unit === 'half' || unit === 'quarter' || unit === 'oke') {
        let displayText = '';
        if (unit === 'half') displayText = 'نصف كيلو';
        else if (unit === 'quarter') displayText = 'ربع كيلو';
        else displayText = 'لوقية';
        
        controlsDiv.innerHTML = `<span class="fixed-quantity">${displayText}</span>`;
        
        const hiddenInput = document.getElementById(inputId);
        if (hiddenInput) {
            hiddenInput.value = unit === 'half' ? 0.5 : unit === 'quarter' ? 0.25 : 0.2;
        }
    } else {
        controlsDiv.innerHTML = `
            <button class="qty-dec-btn" data-target="${inputId}">-</button>
            <input type="number" id="${inputId}" class="qty-value-modern" value="1" step="1" min="1">
            <button class="qty-inc-btn" data-target="${inputId}">+</button>
        `;
        
        const decBtn = controlsDiv.querySelector('.qty-dec-btn');
        const incBtn = controlsDiv.querySelector('.qty-inc-btn');
        const qtyInput = document.getElementById(inputId);
        
        if (decBtn && incBtn && qtyInput) {
            decBtn.onclick = () => {
                let val = parseInt(qtyInput.value) || 1;
                val = Math.max(1, val - 1);
                qtyInput.value = val;
            };
            incBtn.onclick = () => {
                let val = parseInt(qtyInput.value) || 1;
                val = val + 1;
                qtyInput.value = val;
            };
            qtyInput.onchange = () => {
                let val = parseInt(qtyInput.value);
                if (isNaN(val) || val < 1) qtyInput.value = 1;
            };
        }
    }
}

// ==================== نافذة إضافة مادة جديدة ====================
function initNewItemModal() {
    const unitSelect = document.getElementById('newUnitSelect');
    const qtyPicker = document.querySelector('#newItemModal .qty-picker');
    const qtyInput = document.getElementById('newQuantityValue');
    const decBtn = document.querySelector('#newItemModal .qty-dec-btn');
    const incBtn = document.querySelector('#newItemModal .qty-inc-btn');
    
    if (unitSelect && qtyPicker) {
        unitSelect.onchange = function() {
            const selectedUnit = this.value;
            
            if (selectedUnit === 'half' || selectedUnit === 'quarter' || selectedUnit === 'oke') {
                qtyPicker.style.display = 'none';
                let textSpan = qtyPicker.parentElement.querySelector('.fixed-quantity-new');
                if (!textSpan) {
                    textSpan = document.createElement('span');
                    textSpan.className = 'fixed-quantity-new fixed-quantity';
                    textSpan.style.cssText = 'padding: 10px 20px; background: var(--primary-50); border-radius: 60px; text-align: center; flex: 1; color: var(--primary-700);';
                    qtyPicker.parentElement.appendChild(textSpan);
                }
                textSpan.textContent = selectedUnit === 'half' ? 'نصف كيلو' : selectedUnit === 'quarter' ? 'ربع كيلو' : 'لوقية';
                textSpan.style.display = 'block';
            } else {
                qtyPicker.style.display = 'flex';
                const textSpan = qtyPicker.parentElement.querySelector('.fixed-quantity-new');
                if (textSpan) textSpan.style.display = 'none';
                if (qtyInput) qtyInput.value = 1;
            }
        };
        unitSelect.dispatchEvent(new Event('change'));
    }
    
    if (decBtn && incBtn && qtyInput) {
        decBtn.onclick = () => {
            let val = parseInt(qtyInput.value) || 1;
            val = Math.max(1, val - 1);
            qtyInput.value = val;
        };
        incBtn.onclick = () => {
            let val = parseInt(qtyInput.value) || 1;
            val = val + 1;
            qtyInput.value = val;
        };
        qtyInput.onchange = () => {
            let val = parseInt(qtyInput.value);
            if (isNaN(val) || val < 1) qtyInput.value = 1;
        };
    }
}

function updateEditFieldByUnit(unit) {
    const container = document.querySelector('#editModal .edit-quantity-field');
    const qtyInput = document.getElementById('editQuantityValue');
    
    if (!container) return;
    
    if (unit === 'half' || unit === 'quarter' || unit === 'oke') {
        qtyInput.style.display = 'none';
        let textSpan = container.querySelector('.fixed-quantity-edit');
        if (!textSpan) {
            textSpan = document.createElement('span');
            textSpan.className = 'fixed-quantity-edit';
            textSpan.style.cssText = 'padding: 12px 20px; background: var(--primary-50); border-radius: 60px; flex: 1; text-align: center; color: var(--primary-700);';
            container.appendChild(textSpan);
        }
        let displayText = '';
        if (unit === 'half') displayText = 'نصف كيلو';
        else if (unit === 'quarter') displayText = 'ربع كيلو';
        else displayText = 'لوقية';
        textSpan.textContent = displayText;
        textSpan.style.display = 'block';
    } else {
        qtyInput.style.display = 'block';
        const textSpan = container.querySelector('.fixed-quantity-edit');
        if (textSpan) textSpan.style.display = 'none';
    }
}

// ==================== عرض القوائم في النوافذ ====================
function renderImportantFiltered(filter = '') {
    const container = document.getElementById('importantListContainer');
    if (!container) return;
    
    const filtered = importantItemsList.filter(item => item.includes(filter));
    container.innerHTML = '';
    
    filtered.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="important-checkbox" data-name="${escapeHtml(item)}" data-index="${index}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select important-unit" data-index="${index}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="important" data-index="${index}">
                    <button class="qty-dec-btn" data-idx="${index}" data-type="important">-</button>
                    <input type="number" class="qty-value-modern important-qty" data-idx="${index}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${index}" data-type="important">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
        
        initItemQuantityControls(div, 'important', index);
    });
    
    document.querySelectorAll('#importantListContainer .important-unit').forEach(select => {
        select.onchange = function() {
            const idx = this.dataset.index;
            const controlsDiv = document.querySelector(`#importantListContainer .qty-controls[data-index="${idx}"]`);
            const unit = this.value;
            updateItemQuantityControls(controlsDiv, unit, idx, 'important');
        };
    });
}

function renderSpicesExtraFiltered(filter = '') {
    const container = document.getElementById('spicesExtraListContainer');
    if (!container) return;
    
    const filtered = spicesExtraItemsList.filter(item => item.includes(filter));
    container.innerHTML = '';
    
    filtered.forEach((item, idx) => {
        const originalIndex = spicesExtraItemsList.indexOf(item);
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="spices-checkbox" data-name="${escapeHtml(item)}" data-index="${originalIndex}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select spices-unit" data-index="${originalIndex}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="spices" data-index="${originalIndex}">
                    <button class="qty-dec-btn" data-idx="${originalIndex}" data-type="spices">-</button>
                    <input type="number" class="qty-value-modern spices-qty" data-idx="${originalIndex}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${originalIndex}" data-type="spices">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
        
        initItemQuantityControls(div, 'spices', originalIndex);
    });
    
    document.querySelectorAll('#spicesExtraListContainer .spices-unit').forEach(select => {
        select.onchange = function() {
            const idx = this.dataset.index;
            const controlsDiv = document.querySelector(`#spicesExtraListContainer .qty-controls[data-index="${idx}"]`);
            const unit = this.value;
            updateItemQuantityControls(controlsDiv, unit, idx, 'spices');
        };
    });
}

function renderQuickFiltered(filter = '') {
    const container = document.getElementById('quickListContainer');
    if (!container) return;
    
    const filtered = extraItemsList.filter(item => item.includes(filter));
    container.innerHTML = '';
    
    filtered.forEach((item, idx) => {
        const originalIndex = extraItemsList.indexOf(item);
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="quick-checkbox" data-name="${escapeHtml(item)}" data-index="${originalIndex}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select quick-unit" data-index="${originalIndex}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="quick" data-index="${originalIndex}">
                    <button class="qty-dec-btn" data-idx="${originalIndex}" data-type="quick">-</button>
                    <input type="number" class="qty-value-modern quick-qty" data-idx="${originalIndex}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${originalIndex}" data-type="quick">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
        
        initItemQuantityControls(div, 'quick', originalIndex);
    });
    
    document.querySelectorAll('#quickListContainer .quick-unit').forEach(select => {
        select.onchange = function() {
            const idx = this.dataset.index;
            const controlsDiv = document.querySelector(`#quickListContainer .qty-controls[data-index="${idx}"]`);
            const unit = this.value;
            updateItemQuantityControls(controlsDiv, unit, idx, 'quick');
        };
    });
}

function initItemQuantityControls(container, type, idx) {
    const controlsDiv = container.querySelector('.qty-controls');
    const unitSelect = container.querySelector('.qty-select');
    if (controlsDiv && unitSelect) {
        updateItemQuantityControls(controlsDiv, unitSelect.value, idx, type);
    }
}

function updateItemQuantityControls(controlsDiv, unit, idx, type) {
    if (!controlsDiv) return;
    
    if (unit === 'half' || unit === 'quarter' || unit === 'oke') {
        let displayText = '';
        if (unit === 'half') displayText = 'نصف كيلو';
        else if (unit === 'quarter') displayText = 'ربع كيلو';
        else displayText = 'لوقية';
        
        controlsDiv.innerHTML = `<span class="fixed-quantity">${displayText}</span>`;
        
        const qtyInput = document.querySelector(`.${type}-qty[data-idx="${idx}"]`);
        if (qtyInput) {
            qtyInput.value = unit === 'half' ? 0.5 : unit === 'quarter' ? 0.25 : 0.2;
        }
    } else {
        controlsDiv.innerHTML = `
            <button class="qty-dec-btn" data-idx="${idx}" data-type="${type}">-</button>
            <input type="number" class="qty-value-modern ${type}-qty" data-idx="${idx}" value="1" step="1" min="1">
            <button class="qty-inc-btn" data-idx="${idx}" data-type="${type}">+</button>
        `;
        
        const decBtn = controlsDiv.querySelector('.qty-dec-btn');
        const incBtn = controlsDiv.querySelector('.qty-inc-btn');
        const qtyInput = controlsDiv.querySelector(`.${type}-qty`);
        
        if (decBtn && incBtn && qtyInput) {
            decBtn.onclick = () => {
                let val = parseInt(qtyInput.value) || 1;
                val = Math.max(1, val - 1);
                qtyInput.value = val;
            };
            incBtn.onclick = () => {
                let val = parseInt(qtyInput.value) || 1;
                val = val + 1;
                qtyInput.value = val;
            };
            qtyInput.onchange = () => {
                let val = parseInt(qtyInput.value);
                if (isNaN(val) || val < 1) qtyInput.value = 1;
            };
        }
    }
}

function renderBags() {
    const container = document.getElementById('bagsListContainer');
    if (!container) return;
    container.innerHTML = '';
    
    bagTypesList.forEach((bag, index) => {
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="bag-checkbox" data-name="${escapeHtml(bag)}" data-index="${index}">
                <span class="item-name">${escapeHtml(bag)}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// ==================== دوال الإضافة ====================
async function addSelectedImportant() {
    const items = [];
    const checkboxes = document.querySelectorAll('#importantListContainer .important-checkbox');
    
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            const name = checkbox.dataset.name;
            const index = checkbox.dataset.index;
            const unitSelect = document.querySelector(`.important-unit[data-index="${index}"]`);
            const unit = unitSelect?.value || 'kg';
            let quantity = 1;
            
            if (unit === 'half') quantity = 0.5;
            else if (unit === 'quarter') quantity = 0.25;
            else if (unit === 'oke') quantity = 0.2;
            else {
                const qtyInput = document.querySelector(`.important-qty[data-idx="${index}"]`);
                quantity = parseFloat(qtyInput?.value) || 1;
            }
            
            items.push({ name, quantity, unitType: unit });
        }
    }
    
    if (items.length === 0) {
        showToast("⭐ اختر مادة هامة", true);
        return;
    }
    
    try {
        const batch = db.batch();
        items.forEach(item => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: item.name,
                unitType: item.unitType,
                quantity: item.quantity,
                notes: "مواد هامة",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "main"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} مادة بنجاح`);
        document.getElementById('importantModal').classList.remove('active');
        
        checkboxes.forEach(cb => cb.checked = false);
        
    } catch(e) {
        console.error(e);
        showToast("❌ فشل الإضافة", true);
    }
}

async function addSelectedSpicesExtra() {
    const items = [];
    const checkboxes = document.querySelectorAll('#spicesExtraListContainer .spices-checkbox');
    
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            const name = checkbox.dataset.name;
            const index = checkbox.dataset.index;
            const unitSelect = document.querySelector(`.spices-unit[data-index="${index}"]`);
            const unit = unitSelect?.value || 'kg';
            let quantity = 1;
            
            if (unit === 'half') quantity = 0.5;
            else if (unit === 'quarter') quantity = 0.25;
            else if (unit === 'oke') quantity = 0.2;
            else {
                const qtyInput = document.querySelector(`.spices-qty[data-idx="${index}"]`);
                quantity = parseFloat(qtyInput?.value) || 1;
            }
            
            items.push({ name, quantity, unitType: unit });
        }
    }
    
    if (items.length === 0) {
        showToast("🌿 اختر بهاراً", true);
        return;
    }
    
    try {
        const batch = db.batch();
        items.forEach(item => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: item.name,
                unitType: item.unitType,
                quantity: item.quantity,
                notes: "بهارات اضافية",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "spices_extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} بهار بنجاح`);
        document.getElementById('spicesExtraModal').classList.remove('active');
        
        checkboxes.forEach(cb => cb.checked = false);
        
    } catch(e) {
        console.error(e);
        showToast("❌ فشل الإضافة", true);
    }
}

async function addSelectedQuick() {
    const items = [];
    const checkboxes = document.querySelectorAll('#quickListContainer .quick-checkbox');
    
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            const name = checkbox.dataset.name;
            const index = checkbox.dataset.index;
            const unitSelect = document.querySelector(`.quick-unit[data-index="${index}"]`);
            const unit = unitSelect?.value || 'kg';
            let quantity = 1;
            
            if (unit === 'half') quantity = 0.5;
            else if (unit === 'quarter') quantity = 0.25;
            else if (unit === 'oke') quantity = 0.2;
            else {
                const qtyInput = document.querySelector(`.quick-qty[data-idx="${index}"]`);
                quantity = parseFloat(qtyInput?.value) || 1;
            }
            
            items.push({ name, quantity, unitType: unit });
        }
    }
    
    if (items.length === 0) {
        showToast("🌱 اختر منتجاً", true);
        return;
    }
    
    try {
        const batch = db.batch();
        items.forEach(item => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: item.name,
                unitType: item.unitType,
                quantity: item.quantity,
                notes: "بذوريات",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} منتج بنجاح`);
        document.getElementById('quickModal').classList.remove('active');
        
        checkboxes.forEach(cb => cb.checked = false);
        
    } catch(e) {
        console.error(e);
        showToast("❌ فشل الإضافة", true);
    }
}

async function addSelectedBags() {
    const selected = [];
    const checkboxes = document.querySelectorAll('#bagsListContainer .bag-checkbox');
    
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            selected.push(checkbox.dataset.name);
        }
    }
    
    if (selected.length === 0) {
        showToast("📦 اختر نوع كيس", true);
        return;
    }
    
    try {
        const batch = db.batch();
        selected.forEach(bag => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: `كيس تعبئة - ${bag}`,
                unitType: 'bag',
                quantity: 1,
                notes: "أكياس",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${selected.length} نوع كيس بنجاح`);
        document.getElementById('bagsModal').classList.remove('active');
        
        checkboxes.forEach(cb => cb.checked = false);
        
    } catch(e) {
        console.error(e);
        showToast("❌ فشل إضافة الأكياس", true);
    }
}

async function addTawsaya() {
    let name = document.getElementById('tawsayaName')?.value.trim();
    if (!name) {
        showToast("✏️ اسم المنتج", true);
        return;
    }
    
    let type = document.querySelector('#tawsayaTypeGroup .unit-btn.active')?.getAttribute('data-type');
    let qty = 1;
    if (type === 'kg') qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    else if (type === 'half') qty = 0.5;
    else qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    if (isNaN(qty) || qty <= 0) {
        showToast("🔢 كمية صحيحة", true);
        return;
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
        document.getElementById('tawsayaModal').classList.remove('active');
    } catch(e) {
        console.error(e);
        showToast("❌ فشل الإضافة", true);
    }
}

async function saveEdit() {
    if (!currentEditId) return;
    let newUnit = document.getElementById('editUnitSelect')?.value || 'kg';
    let newQty = 1;
    
    if (newUnit === 'half') newQty = 0.5;
    else if (newUnit === 'quarter') newQty = 0.25;
    else if (newUnit === 'oke') newQty = 0.2;
    else {
        newQty = parseFloat(document.getElementById('editQuantityValue')?.value);
        if (isNaN(newQty) || newQty <= 0) {
            showToast("🔢 كمية صحيحة", true);
            return;
        }
    }
    
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: newQty, unitType: newUnit });
        showToast("✓ تم تحديث الكمية");
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
    } catch(e) {
        console.error(e);
        showToast("❌ فشل التحديث", true);
    }
}

async function addNewMaterialDirect() {
    let name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) {
        showToast("✏️ اكتب اسم المادة", true);
        return;
    }
    let unit = document.getElementById('newUnitSelect')?.value || 'kg';
    let quantity = 1;
    
    if (unit === 'half') quantity = 0.5;
    else if (unit === 'quarter') quantity = 0.25;
    else if (unit === 'oke') quantity = 0.2;
    else {
        quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
        if (isNaN(quantity) || quantity <= 0) {
            showToast("🔢 كمية صحيحة", true);
            return;
        }
    }
    
    try {
        await materialsCollection.add({
            name,
            unitType: unit,
            quantity: quantity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: "main"
        });
        showToast(`✓ تمت إضافة "${name}"`);
        document.getElementById('newItemModal').classList.remove('active');
        document.getElementById('newMaterialName').value = "";
        document.getElementById('newQuantityValue').value = "1";
    } catch(e) {
        console.error(e);
        showToast("❌ خطأ في الاتصال", true);
    }
}

// ==================== المزامنة ====================
function startListener() {
    const query = materialsCollection.orderBy('createdAt', 'desc');
    if (unsubscribe) unsubscribe();
    
    unsubscribe = query.onSnapshot((snapshot) => {
        const list = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            list.push({
                id: doc.id,
                name: data.name,
                unitType: data.unitType || 'kg',
                quantity: data.quantity || 0,
                notes: data.notes || "",
                createdAt: data.createdAt,
                priority: data.priority || "main"
            });
        });
        allMaterials = list;
        
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        const itemsCount = document.getElementById('syncItemsCount');
        const syncTime = document.getElementById('syncLastTime');
        
        if (statusText) statusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncDot) syncDot.className = 'sync-dot';
        if (itemsCount) itemsCount.innerHTML = `<i class="fas fa-database"></i> ${list.length} عنصر`;
        if (syncTime) syncTime.innerHTML = `<i class="far fa-clock"></i> ${new Date().toLocaleTimeString()}`;
        
        renderAllMaterials(allMaterials);
        
        const splash = document.getElementById('splashScreen');
        const app = document.getElementById('appContainer');
        if (splash && app && splash.style.display !== 'none') {
            splash.classList.add('hidden');
            setTimeout(() => {
                splash.style.display = 'none';
                app.style.display = 'block';
            }, 500);
        }
    }, (error) => {
        console.error(error);
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        if (statusText) statusText.innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
        if (syncDot) syncDot.className = 'sync-dot offline';
    });
}

function startAutoSync() {
    if (autoSyncInterval) clearInterval(autoSyncInterval);
    autoSyncInterval = setInterval(() => {
        if (unsubscribe) unsubscribe();
        startListener();
    }, 30000);
}

// ==================== ربط الأحداث ====================
function bindEvents() {
    document.getElementById('mainAddBtn').onclick = () => document.getElementById('newItemModal').classList.add('active');
    document.getElementById('syncBtn').onclick = () => {
        if (unsubscribe) unsubscribe();
        startListener();
        showToast("🔄 جاري المزامنة...");
    };
    document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark');
    
    document.getElementById('backupBtn').onclick = () => {
        if (allMaterials.length === 0) {
            showToast("📭 لا توجد بيانات", true);
            return;
        }
        let data = JSON.stringify(allMaterials, null, 2);
        let blob = new Blob([data]);
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup_${new Date().toISOString().slice(0, 19)}.json`;
        a.click();
        showToast("💾 تم نسخ البيانات");
    };
    
    document.getElementById('restoreBtn').onclick = () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    let backup = JSON.parse(ev.target.result);
                    if (confirm(`⚠️ استبدال بـ ${backup.length} عنصر؟`)) {
                        let batch = db.batch();
                        allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
                        await batch.commit();
                        for (let it of backup) await materialsCollection.add(it);
                        showToast("✓ تم الاستعادة");
                        if (unsubscribe) unsubscribe();
                        startListener();
                    }
                } catch (e) {
                    showToast("❌ ملف غير صالح", true);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    
    document.getElementById('clearAllBtn').onclick = async () => {
        if (allMaterials.length === 0) {
            showToast("📭 القائمة فارغة", true);
            return;
        }
        if (confirm("⚠️ حذف جميع المواد نهائياً؟")) {
            let batch = db.batch();
            allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
            await batch.commit();
            showToast("✓ تم مسح القائمة");
        }
    };
    
    document.getElementById('importantProductsBtn').onclick = () => {
        renderImportantFiltered('');
        document.getElementById('importantModal').classList.add('active');
        document.getElementById('importantSearchInput').focus();
    };
    
    document.getElementById('spicesExtraBtn').onclick = () => {
        renderSpicesExtraFiltered('');
        document.getElementById('spicesExtraModal').classList.add('active');
        document.getElementById('spicesExtraSearchInput').focus();
    };
    
    document.getElementById('quickProductsBtn').onclick = () => {
        renderQuickFiltered('');
        document.getElementById('quickModal').classList.add('active');
        document.getElementById('quickSearchInput').focus();
    };
    
    document.getElementById('bagsManagerBtn').onclick = () => {
        renderBags();
        document.getElementById('bagsModal').classList.add('active');
        document.getElementById('bagsSearchInput').focus();
    };
    
    document.getElementById('tawsayaQuickBtn').onclick = () => {
        document.getElementById('tawsayaModal').classList.add('active');
        document.getElementById('tawsayaName').focus();
    };
    
    document.getElementById('saveNewItemBtn').onclick = addNewMaterialDirect;
    document.getElementById('saveImportantBtn').onclick = addSelectedImportant;
    document.getElementById('saveSpicesExtraBtn').onclick = addSelectedSpicesExtra;
    document.getElementById('saveQuickBtn').onclick = addSelectedQuick;
    document.getElementById('saveBagsBtn').onclick = addSelectedBags;
    document.getElementById('saveTawsayaBtn').onclick = addTawsaya;
    document.getElementById('saveEditBtn').onclick = saveEdit;
    
    document.getElementById('importantSearchInput').oninput = (e) => renderImportantFiltered(e.target.value);
    document.getElementById('spicesExtraSearchInput').oninput = (e) => renderSpicesExtraFiltered(e.target.value);
    document.getElementById('quickSearchInput').oninput = (e) => renderQuickFiltered(e.target.value);
    document.getElementById('bagsSearchInput').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#bagsListContainer .modern-item-card').forEach(item => {
            const name = item.querySelector('.item-name')?.innerText.toLowerCase() || '';
            item.style.display = name.includes(term) ? 'flex' : 'none';
        });
    };
    
    document.getElementById('editUnitSelect').addEventListener('change', function() {
        updateEditFieldByUnit(this.value);
    });
}

// ==================== التهيئة ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Material Manager starting...');
    bindEvents();
    startListener();
    startAutoSync();
    initNewItemModal();
});

// ==================== تسجيل Service Worker ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/material-manager/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
        }
