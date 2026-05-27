let allMaterials = [];
let unsubscribe = null;
let currentEditId = null;
let autoSyncInterval = null;

// ==================== القوائم الثابتة (5 جداول) ====================

// الجدول الأول: بهارات هامة
const importantItemsList = [
    "شطة حلوة", "شطة حدة وسط", "شطة بابريكا مدخنة", "توابل هندية", "فلفل اسود ناعم", "توم ناعم",
    "بصل ناعم", "جوز هند خشن", "حليب نصف دسم", "جوز امريكي", "حبة البركة", "زنجبيل خشن",
    "زنجبيل ناعم", "سمسم محمص", "سماق ناعم", "شاورما", "كركدية", "كاري", "كربونة الصوديوم",
    "كبسة خليجية", "كبسة ناعمة", "كركم", "كريمة محلاية", "كاكاو نخب اول", "كاكاو نخب ثاني",
    "كمون حب", "كمون ناعم", "قرفة عيدان", "قرفة ناعمة", "قرفة سيجار", "كزبرة ناعمة",
    "كزبرة حب", "قرنفل حب", "قرنفل ناعم", "اشلميش", "فستق ني ارجنتيني", "ملح صيني", "ملح ليمون",
    "ماجي اصفر", "ماجي ابيض", "مشكلة", "مشكلة بيضاء", "نشا مصري", "هيل حب خشن", "هيل ناعم",
    "نعنع يابس", "يانسون حب", "شوفان", "تمر سري"
];

// الجدول الثاني: بهارات اضافية
const spicesExtraItemsList = [
    "بطاطا", "بروستد", "زعتر اوريغانو", "بيتزا", "جوزة الطيب حب", "جوزة الطيب ناعمة", "حلبه حب",
    "حلبه ناعمة", "خل نكهة", "خميرة فرط", "سدر ناعم", "سكر نبات", "سمك", "سجق", "سحلب", "سلطة",
    "شمرا ناعمة", "شمرا حب", "شيش", "شاورما", "كريسبي", "كليجة", "كاري", "كربونة الصوديوم",
    "كراوية", "مجروش الكعك", "كلس خشن", "قلي", "فلافل", "فاهيتا", "لبان الدكر", "لحمة عجل",
    "لومي", "لومي اسود", "مندي", "مكسيكي", "مشاوي", "مدخنة", "محاشي", "محلب", "نشا درس",
    "نعنع يابس", "يانسون ناعم", "يانسون نجمة", "ورق غار", "صفار زعفران", "صفار بيض",
    "فلفل اسود حب", "فلفل ابيض ناعم", "توابل هندية حارة", "طحينية", "رمان مجفف", "اندومي",
    "رز مطحون", "ماجي حبيبات", "شمرا حب"
];

// الجدول الثالث: المحمصة
const roastedItemsList = [
    "دوار شمس ملكي", "دوار شمس شبح", "فستق مدخن", "فستق مملح", "بذر كوسا", "بذر ابيض عريض",
    "بذر اصفر مصري", "فستق ني ارجنتيني", "لوز بقشرو", "لوز ني", "كاجو ني", "بذور الشيا",
    "بذور الكتان", "بذور اليقطين", "بذر الرشاد", "ذرة الفوشار", "خل نكهة", "جنبة نكهة",
    "كتشب نكهة", "بابريكا نكهة", "زعتر اخضر", "زعتر احمر", "كابتشينو", "ميلو", "هوت شوكلت"
];

// الجدول الرابع: الأعشاب
const herbsItemsList = [
    "زهرة الالماسة", "زهورات مشكلة", "زعتر بري", "كركدية", "ميرمية", "ورد جوري", "عشرق",
    "مرتكوش", "سنامكي", "بابونج", "اكليل الجبل"
];

// الجدول الخامس: مواد اضافية
const extraItemsList = [
    "ماجي ظروف", "مكعبات ماجي", "ماجي شرائح", "خميره ظروفة", "مستكه", "فانيلا ظروفة الريم",
    "فانيلا فرط", "بكمبودر ريم", "بكمبودر فرط", "تمر عجوه", "تمر سري"
];

const bagTypesList = ["شفاف 10×12","شفاف 20×12","شفاف 10×20","شفاف 25×17","شفاف 20×30","شفاف 35×25","صيدلية","أسود 30","أسود 35","أسود 40","أسود 45"];

// ==================== دوال الحصول على القوائم ====================
function getImportantItems() { return importantItemsList.map(name => ({ name, min: 1, max: 5 })); }
function getSpicesExtraItems() { return spicesExtraItemsList.map(name => ({ name, min: 1, max: 10 })); }
function getRoastedItems() { return roastedItemsList.map(name => ({ name, min: 1, max: 10 })); }
function getHerbsItems() { return herbsItemsList.map(name => ({ name, min: 1, max: 10 })); }
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
    const roasted = materials.filter(m => m.priority === 'roasted');
    const herbs = materials.filter(m => m.priority === 'herbs');
    const extra = materials.filter(m => m.priority === 'extra');
    const taws = materials.filter(m => m.priority === 'tawsaya');
    
    let html = `
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-star-of-life"></i> بهارات هامة</div>
            ${main.length === 0 ? '<div class="empty-state">✨ لا توجد مواد هامة</div>' : `<div class="materials-grid">${main.map(m => renderMaterialCard(m)).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-leaf"></i> بهارات اضافية</div>
            ${spicesExtra.length === 0 ? '<div class="empty-state">🌿 لا توجد بهارات اضافية</div>' : `<div class="materials-grid">${spicesExtra.map(m => renderMaterialCard(m)).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-fire"></i> المحمصة</div>
            ${roasted.length === 0 ? '<div class="empty-state">🔥 لا توجد مواد في المحمصة</div>' : `<div class="materials-grid">${roasted.map(m => renderMaterialCard(m)).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-seedling"></i> الأعشاب</div>
            ${herbs.length === 0 ? '<div class="empty-state">🌱 لا توجد أعشاب</div>' : `<div class="materials-grid">${herbs.map(m => renderMaterialCard(m)).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-plus-circle"></i> مواد اضافية</div>
            ${extra.length === 0 ? '<div class="empty-state">📦 لا توجد مواد اضافية</div>' : `<div class="materials-grid">${extra.map(m => renderMaterialCard(m)).join('')}</div>`}
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

// ==================== عرض القوائم في النوافذ (5 جداول) ====================

// الجدول الأول: بهارات هامة
function renderImportantFiltered(filter = '') {
    const container = document.getElementById('importantListContainer');
    if (!container) return;
    
    const filtered = importantItemsList.filter(item => item.includes(filter));
    container.innerHTML = '';
    
    filtered.forEach((item, index) => {
        const originalIndex = importantItemsList.indexOf(item);
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="important-checkbox" data-name="${escapeHtml(item)}" data-index="${originalIndex}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select important-unit" data-index="${originalIndex}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="important" data-index="${originalIndex}">
                    <button class="qty-dec-btn" data-idx="${originalIndex}" data-type="important">-</button>
                    <input type="number" class="qty-value-modern important-qty" data-idx="${originalIndex}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${originalIndex}" data-type="important">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
        
        initItemQuantityControls(div, 'important', originalIndex);
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

// الجدول الثاني: بهارات اضافية
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

// الجدول الثالث: المحمصة
function renderRoastedFiltered(filter = '') {
    const container = document.getElementById('roastedListContainer');
    if (!container) return;
    
    const filtered = roastedItemsList.filter(item => item.includes(filter));
    container.innerHTML = '';
    
    filtered.forEach((item, idx) => {
        const originalIndex = roastedItemsList.indexOf(item);
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="roasted-checkbox" data-name="${escapeHtml(item)}" data-index="${originalIndex}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select roasted-unit" data-index="${originalIndex}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="roasted" data-index="${originalIndex}">
                    <button class="qty-dec-btn" data-idx="${originalIndex}" data-type="roasted">-</button>
                    <input type="number" class="qty-value-modern roasted-qty" data-idx="${originalIndex}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${originalIndex}" data-type="roasted">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
        
        initItemQuantityControls(div, 'roasted', originalIndex);
    });
    
    document.querySelectorAll('#roastedListContainer .roasted-unit').forEach(select => {
        select.onchange = function() {
            const idx = this.dataset.index;
            const controlsDiv = document.querySelector(`#roastedListContainer .qty-controls[data-index="${idx}"]`);
            const unit = this.value;
            updateItemQuantityControls(controlsDiv, unit, idx, 'roasted');
        };
    });
}

// الجدول الرابع: الأعشاب
function renderHerbsFiltered(filter = '') {
    const container = document.getElementById('herbsListContainer');
    if (!container) return;
    
    const filtered = herbsItemsList.filter(item => item.includes(filter));
    container.innerHTML = '';
    
    filtered.forEach((item, idx) => {
        const originalIndex = herbsItemsList.indexOf(item);
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="herbs-checkbox" data-name="${escapeHtml(item)}" data-index="${originalIndex}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select herbs-unit" data-index="${originalIndex}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="herbs" data-index="${originalIndex}">
                    <button class="qty-dec-btn" data-idx="${originalIndex}" data-type="herbs">-</button>
                    <input type="number" class="qty-value-modern herbs-qty" data-idx="${originalIndex}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${originalIndex}" data-type="herbs">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
        
        initItemQuantityControls(div, 'herbs', originalIndex);
    });
    
    document.querySelectorAll('#herbsListContainer .herbs-unit').forEach(select => {
        select.onchange = function() {
            const idx = this.dataset.index;
            const controlsDiv = document.querySelector(`#herbsListContainer .qty-controls[data-index="${idx}"]`);
            const unit = this.value;
            updateItemQuantityControls(controlsDiv, unit, idx, 'herbs');
        };
    });
}

// الجدول الخامس: مواد اضافية
function renderExtraFiltered(filter = '') {
    const container = document.getElementById('extraListContainer');
    if (!container) return;
    
    const filtered = extraItemsList.filter(item => item.includes(filter));
    container.innerHTML = '';
    
    filtered.forEach((item, idx) => {
        const originalIndex = extraItemsList.indexOf(item);
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="extra-checkbox" data-name="${escapeHtml(item)}" data-index="${originalIndex}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select extra-unit" data-index="${originalIndex}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="extra" data-index="${originalIndex}">
                    <button class="qty-dec-btn" data-idx="${originalIndex}" data-type="extra">-</button>
                    <input type="number" class="qty-value-modern extra-qty" data-idx="${originalIndex}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${originalIndex}" data-type="extra">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
        
        initItemQuantityControls(div, 'extra', originalIndex);
    });
    
    document.querySelectorAll('#extraListContainer .extra-unit').forEach(select => {
        select.onchange = function() {
            const idx = this.dataset.index;
            const controlsDiv = document.querySelector(`#extraListContainer .qty-controls[data-index="${idx}"]`);
            const unit = this.value;
            updateItemQuantityControls(controlsDiv, unit, idx, 'extra');
        };
    });
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
                notes: "بهارات هامة",
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

async function addSelectedRoasted() {
    const items = [];
    const checkboxes = document.querySelectorAll('#roastedListContainer .roasted-checkbox');
    
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            const name = checkbox.dataset.name;
            const index = checkbox.dataset.index;
            const unitSelect = document.querySelector(`.roasted-unit[data-index="${index}"]`);
            const unit = unitSelect?.value || 'kg';
            let quantity = 1;
            
            if (unit === 'half') quantity = 0.5;
            else if (unit === 'quarter') quantity = 0.25;
            else if (unit === 'oke') quantity = 0.2;
            else {
                const qtyInput = document.querySelector(`.roasted-qty[data-idx="${index}"]`);
                quantity = parseFloat(qtyInput?.value) || 1;
            }
            
            items.push({ name, quantity, unitType: unit });
        }
    }
    
    if (items.length === 0) {
        showToast("🔥 اختر منتج من المحمصة", true);
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
                notes: "محمصة",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "roasted"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} منتج بنجاح`);
        document.getElementById('roastedModal').classList.remove('active');
        checkboxes.forEach(cb => cb.checked = false);
    } catch(e) {
        console.error(e);
        showToast("❌ فشل الإضافة", true);
    }
}

async function addSelectedHerbs() {
    const items = [];
    const checkboxes = document.querySelectorAll('#herbsListContainer .herbs-checkbox');
    
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            const name = checkbox.dataset.name;
            const index = checkbox.dataset.index;
            const unitSelect = document.querySelector(`.herbs-unit[data-index="${index}"]`);
            const unit = unitSelect?.value || 'kg';
            let quantity = 1;
            
            if (unit === 'half') quantity = 0.5;
            else if (unit === 'quarter') quantity = 0.25;
            else if (unit === 'oke') quantity = 0.2;
            else {
                const qtyInput = document.querySelector(`.herbs-qty[data-idx="${index}"]`);
                quantity = parseFloat(qtyInput?.value) || 1;
            }
            
            items.push({ name, quantity, unitType: unit });
        }
    }
    
    if (items.length === 0) {
        showToast("🌱 اختر عشبة", true);
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
                notes: "أعشاب",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "herbs"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} عشبة بنجاح`);
        document.getElementById('herbsModal').classList.remove('active');
        checkboxes.forEach(cb => cb.checked = false);
    } catch(e) {
        console.error(e);
        showToast("❌ فشل الإضافة", true);
    }
}

async function addSelectedExtra() {
    const items = [];
    const checkboxes = document.querySelectorAll('#extraListContainer .extra-checkbox');
    
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            const name = checkbox.dataset.name;
            const index = checkbox.dataset.index;
            const unitSelect = document.querySelector(`.extra-unit[data-index="${index}"]`);
            const unit = unitSelect?.value || 'kg';
            let quantity = 1;
            
            if (unit === 'half') quantity = 0.5;
            else if (unit === 'quarter') quantity = 0.25;
            else if (unit === 'oke') quantity = 0.2;
            else {
                const qtyInput = document.querySelector(`.extra-qty[data-idx="${index}"]`);
                quantity = parseFloat(qtyInput?.value) || 1;
            }
            
            items.push({ name, quantity, unitType: unit });
        }
    }
    
    if (items.length === 0) {
        showToast("📦 اختر مادة اضافية", true);
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
                notes: "مواد اضافية",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} مادة بنجاح`);
        document.getElementById('extraModal').classList.remove('active');
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
    
    // أزرار الجداول (6 أزرار)
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
    
    document.getElementById('roastedBtn').onclick = () => {
        renderRoastedFiltered('');
        document.getElementById('roastedModal').classList.add('active');
        document.getElementById('roastedSearchInput').focus();
    };
    
    document.getElementById('herbsBtn').onclick = () => {
        renderHerbsFiltered('');
        document.getElementById('herbsModal').classList.add('active');
        document.getElementById('herbsSearchInput').focus();
    };
    
    document.getElementById('extraBtn').onclick = () => {
        renderExtraFiltered('');
        document.getElementById('extraModal').classList.add('active');
        document.getElementById('extraSearchInput').focus();
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
    
    // أزرار الحفظ
    document.getElementById('saveNewItemBtn').onclick = addNewMaterialDirect;
    document.getElementById('saveImportantBtn').onclick = addSelectedImportant;
    document.getElementById('saveSpicesExtraBtn').onclick = addSelectedSpicesExtra;
    document.getElementById('saveRoastedBtn').onclick = addSelectedRoasted;
    document.getElementById('saveHerbsBtn').onclick = addSelectedHerbs;
    document.getElementById('saveExtraBtn').onclick = addSelectedExtra;
    document.getElementById('saveBagsBtn').onclick = addSelectedBags;
    document.getElementById('saveTawsayaBtn').onclick = addTawsaya;
    document.getElementById('saveEditBtn').onclick = saveEdit;
    
    // أزرار البحث
    document.getElementById('importantSearchInput').oninput = (e) => renderImportantFiltered(e.target.value);
    document.getElementById('spicesExtraSearchInput').oninput = (e) => renderSpicesExtraFiltered(e.target.value);
    document.getElementById('roastedSearchInput').oninput = (e) => renderRoastedFiltered(e.target.value);
    document.getElementById('herbsSearchInput').oninput = (e) => renderHerbsFiltered(e.target.value);
    document.getElementById('extraSearchInput').oninput = (e) => renderExtraFiltered(e.target.value);
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
