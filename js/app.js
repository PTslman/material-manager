
let allMaterials = [];
let unsubscribe = null;
let currentEditId = null;
let autoSyncInterval = null;
let dragSourceId = null;
let dragSourceSection = null;

// ==================== القوائم الكاملة ====================
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

const bagTypesList = ["شفاف 10×12","شفاف 20×12","شفاف 10×20","شفاف 25×17","شفاف 20×30","شفاف 35×25","صيدلية","أسود 30","أسود 35","أسود 40","أسود 45"];

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

// ==================== الذكاء الاصطناعي - تحليل المخزون ====================
function calculateAIMetrics() {
    const totalCount = allMaterials.length;
    let totalQuantity = 0;
    let lowStockCount = 0;
    
    allMaterials.forEach(material => {
        let quantity = material.quantity || 0;
        totalQuantity += quantity;
        
        if (material.unitType === 'kg' && quantity < 0.5) {
            lowStockCount++;
        } else if (material.unitType === 'half' && quantity < 0.5) {
            lowStockCount++;
        } else if (material.unitType === 'quarter' && quantity < 0.25) {
            lowStockCount++;
        } else if (material.unitType === 'oke' && quantity < 0.2) {
            lowStockCount++;
        }
    });
    
    const avgQuantity = totalCount > 0 ? (totalQuantity / totalCount).toFixed(2) : 0;
    
    const totalEl = document.getElementById('totalMaterialsCount');
    const totalQtyEl = document.getElementById('totalQuantityValue');
    const lowStockEl = document.getElementById('lowStockCount');
    const avgQtyEl = document.getElementById('avgQuantityValue');
    
    if (totalEl) totalEl.innerText = totalCount;
    if (totalQtyEl) totalQtyEl.innerText = totalQuantity.toFixed(2);
    if (lowStockEl) lowStockEl.innerText = lowStockCount;
    if (avgQtyEl) avgQtyEl.innerText = avgQuantity;
    
    const insights = document.getElementById('aiInsights');
    if (insights) {
        let insightText = '';
        if (totalCount === 0) {
            insightText = '📊 لا توجد مواد في المخزون. أضف مواد جديدة للبدء.';
        } else if (lowStockCount > 0) {
            insightText = `⚠️ تنبيه: يوجد ${lowStockCount} مادة ناقصة تحتاج إلى إعادة تزويد.`;
        } else if (totalQuantity > 100) {
            insightText = `📈 المخزون ممتاز! إجمالي المواد ${totalQuantity.toFixed(2)} كجم.`;
        } else if (totalQuantity > 50) {
            insightText = `✅ المخزون جيد. إجمالي المواد ${totalQuantity.toFixed(2)} كجم.`;
        } else if (totalQuantity > 0) {
            insightText = `📦 المخزون متوسط. ينصح بمراجعة المواد الناقصة.`;
        } else {
            insightText = `📊 المخزون فارغ. أضف مواد جديدة.`;
        }
        
        if (totalCount > 0) {
            const materialNames = allMaterials.map(m => m.name);
            const uniqueNames = [...new Set(materialNames)];
            insightText += ` يتضمن المخزون ${uniqueNames.length} نوعاً مختلفاً من المواد.`;
        }
        
        insights.innerHTML = `<i class="fas fa-robot"></i><span>${insightText}</span>`;
    }
}

// ==================== نقل المواد بين الأقسام ====================
function openMoveModal(materialId, materialName, currentSection) {
    currentEditId = materialId;
    const nameInput = document.getElementById('moveItemName');
    const sectionSelect = document.getElementById('moveTargetSection');
    if (nameInput) nameInput.value = materialName;
    if (sectionSelect) sectionSelect.value = currentSection;
    const modal = document.getElementById('moveItemModal');
    if (modal) modal.classList.add('active');
}

async function moveMaterialToSection() {
    if (!currentEditId) return;
    
    const targetSection = document.getElementById('moveTargetSection').value;
    
    try {
        await materialsCollection.doc(currentEditId).update({ priority: targetSection });
        showToast(`✓ تم نقل المادة بنجاح`);
        const modal = document.getElementById('moveItemModal');
        if (modal) modal.classList.remove('active');
        currentEditId = null;
        
        if (unsubscribe) unsubscribe();
        startListener();
    } catch(e) {
        console.error(e);
        showToast("❌ فشل نقل المادة", true);
    }
}

// ==================== دعم السحب والإفلات ====================
function setupDragAndDrop() {
    const cards = document.querySelectorAll('.material-card');
    
    cards.forEach(card => {
        card.setAttribute('draggable', 'true');
        
        card.addEventListener('dragstart', (e) => {
            dragSourceId = card.getAttribute('data-id');
            dragSourceSection = card.getAttribute('data-section');
            e.dataTransfer.setData('text/plain', dragSourceId);
            card.classList.add('dragging');
        });
        
        card.addEventListener('dragend', (e) => {
            card.classList.remove('dragging');
            dragSourceId = null;
            dragSourceSection = null;
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            card.classList.add('drag-over');
        });
        
        card.addEventListener('dragleave', (e) => {
            card.classList.remove('drag-over');
        });
        
        card.addEventListener('drop', async (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            
            const targetId = card.getAttribute('data-id');
            const targetSection = card.getAttribute('data-section');
            
            if (dragSourceId && dragSourceId !== targetId) {
                try {
                    await materialsCollection.doc(dragSourceId).update({ priority: targetSection });
                    showToast(`✓ تم نقل المادة إلى ${getSectionName(targetSection)}`);
                    
                    if (unsubscribe) unsubscribe();
                    startListener();
                } catch(err) {
                    console.error(err);
                    showToast("❌ فشل النقل", true);
                }
            }
        });
    });
}

function getSectionName(section) {
    const sections = {
        'main': 'أساسيات',
        'spices_extra': 'بهارات اضافية',
        'roasted': 'المحمصة',
        'herbs': 'الأعشاب',
        'extra': 'مواد اضافية',
        'tawsaya': 'توصيات'
    };
    return sections[section] || section;
}

// ==================== الضغطة المطولة ====================
let longPressTimer = null;

function setupLongPress() {
    const cards = document.querySelectorAll('.material-card');
    
    cards.forEach(card => {
        card.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                const id = card.getAttribute('data-id');
                const nameSpan = card.querySelector('.card-title span');
                const name = nameSpan ? nameSpan.innerText : '';
                const section = card.getAttribute('data-section');
                if (id) openMoveModal(id, name, section);
            }, 800);
        });
        
        card.addEventListener('touchend', () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });
        
        card.addEventListener('touchmove', () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });
        
        card.addEventListener('mousedown', (e) => {
            longPressTimer = setTimeout(() => {
                const id = card.getAttribute('data-id');
                const nameSpan = card.querySelector('.card-title span');
                const name = nameSpan ? nameSpan.innerText : '';
                const section = card.getAttribute('data-section');
                if (id) openMoveModal(id, name, section);
            }, 800);
        });
        
        card.addEventListener('mouseup', () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });
        
        card.addEventListener('mousemove', () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });
    });
}

// ==================== إدارة حالة التحديدات ====================
const selectionState = {
    important: new Map(),
    spices: new Map(),
    roasted: new Map(),
    herbs: new Map(),
    extra: new Map(),
    bags: new Map()
};

function saveSelection(type, index, isChecked) {
    if (!selectionState[type]) selectionState[type] = new Map();
    selectionState[type].set(index, isChecked);
}

function loadSelection(type) {
    return selectionState[type] || new Map();
}

function clearSelection(type) {
    if (selectionState[type]) selectionState[type].clear();
}

// ==================== عرض القوائم مع الحفاظ على التحديدات ====================
function renderImportantFiltered(filter = '') {
    const container = document.getElementById('importantListContainer');
    if (!container) return;
    const filtered = importantItemsList.filter(item => item.includes(filter));
    const saved = loadSelection('important');
    container.innerHTML = '';
    filtered.forEach(item => {
        const origIdx = importantItemsList.indexOf(item);
        const isChecked = saved.get(origIdx) || false;
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="important-checkbox" data-name="${escapeHtml(item)}" data-index="${origIdx}" ${isChecked ? 'checked' : ''}>
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select important-unit" data-index="${origIdx}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="important" data-index="${origIdx}">
                    <button class="qty-dec-btn" data-idx="${origIdx}" data-type="important">-</button>
                    <input type="number" class="qty-value-modern important-qty" data-idx="${origIdx}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${origIdx}" data-type="important">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    attachItemEvents('important');
    document.querySelectorAll('#importantListContainer .important-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            saveSelection('important', parseInt(e.target.dataset.index), e.target.checked);
        });
    });
}

function renderSpicesExtraFiltered(filter = '') {
    const container = document.getElementById('spicesExtraListContainer');
    if (!container) return;
    const filtered = spicesExtraItemsList.filter(item => item.includes(filter));
    const saved = loadSelection('spices');
    container.innerHTML = '';
    filtered.forEach(item => {
        const origIdx = spicesExtraItemsList.indexOf(item);
        const isChecked = saved.get(origIdx) || false;
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="spices-checkbox" data-name="${escapeHtml(item)}" data-index="${origIdx}" ${isChecked ? 'checked' : ''}>
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select spices-unit" data-index="${origIdx}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="spices" data-index="${origIdx}">
                    <button class="qty-dec-btn" data-idx="${origIdx}" data-type="spices">-</button>
                    <input type="number" class="qty-value-modern spices-qty" data-idx="${origIdx}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${origIdx}" data-type="spices">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    attachItemEvents('spices');
    document.querySelectorAll('#spicesExtraListContainer .spices-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            saveSelection('spices', parseInt(e.target.dataset.index), e.target.checked);
        });
    });
}

function renderRoastedFiltered(filter = '') {
    const container = document.getElementById('roastedListContainer');
    if (!container) return;
    const filtered = roastedItemsList.filter(item => item.includes(filter));
    const saved = loadSelection('roasted');
    container.innerHTML = '';
    filtered.forEach(item => {
        const origIdx = roastedItemsList.indexOf(item);
        const isChecked = saved.get(origIdx) || false;
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="roasted-checkbox" data-name="${escapeHtml(item)}" data-index="${origIdx}" ${isChecked ? 'checked' : ''}>
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select roasted-unit" data-index="${origIdx}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="roasted" data-index="${origIdx}">
                    <button class="qty-dec-btn" data-idx="${origIdx}" data-type="roasted">-</button>
                    <input type="number" class="qty-value-modern roasted-qty" data-idx="${origIdx}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${origIdx}" data-type="roasted">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    attachItemEvents('roasted');
    document.querySelectorAll('#roastedListContainer .roasted-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            saveSelection('roasted', parseInt(e.target.dataset.index), e.target.checked);
        });
    });
}

function renderHerbsFiltered(filter = '') {
    const container = document.getElementById('herbsListContainer');
    if (!container) return;
    const filtered = herbsItemsList.filter(item => item.includes(filter));
    const saved = loadSelection('herbs');
    container.innerHTML = '';
    filtered.forEach(item => {
        const origIdx = herbsItemsList.indexOf(item);
        const isChecked = saved.get(origIdx) || false;
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="herbs-checkbox" data-name="${escapeHtml(item)}" data-index="${origIdx}" ${isChecked ? 'checked' : ''}>
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select herbs-unit" data-index="${origIdx}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="herbs" data-index="${origIdx}">
                    <button class="qty-dec-btn" data-idx="${origIdx}" data-type="herbs">-</button>
                    <input type="number" class="qty-value-modern herbs-qty" data-idx="${origIdx}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${origIdx}" data-type="herbs">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    attachItemEvents('herbs');
    document.querySelectorAll('#herbsListContainer .herbs-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            saveSelection('herbs', parseInt(e.target.dataset.index), e.target.checked);
        });
    });
}

function renderExtraFiltered(filter = '') {
    const container = document.getElementById('extraListContainer');
    if (!container) return;
    const filtered = extraItemsList.filter(item => item.includes(filter));
    const saved = loadSelection('extra');
    container.innerHTML = '';
    filtered.forEach(item => {
        const origIdx = extraItemsList.indexOf(item);
        const isChecked = saved.get(origIdx) || false;
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="extra-checkbox" data-name="${escapeHtml(item)}" data-index="${origIdx}" ${isChecked ? 'checked' : ''}>
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select extra-unit" data-index="${origIdx}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <div class="qty-controls" data-type="extra" data-index="${origIdx}">
                    <button class="qty-dec-btn" data-idx="${origIdx}" data-type="extra">-</button>
                    <input type="number" class="qty-value-modern extra-qty" data-idx="${origIdx}" value="1" step="1" min="1">
                    <button class="qty-inc-btn" data-idx="${origIdx}" data-type="extra">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    attachItemEvents('extra');
    document.querySelectorAll('#extraListContainer .extra-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            saveSelection('extra', parseInt(e.target.dataset.index), e.target.checked);
        });
    });
}

function renderBags() {
    const container = document.getElementById('bagsListContainer');
    if (!container) return;
    const saved = loadSelection('bags');
    container.innerHTML = '';
    bagTypesList.forEach((bag, idx) => {
        const isChecked = saved.get(idx) || false;
        const div = document.createElement('div');
        div.className = 'modern-item-card';
        div.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="bag-checkbox" data-name="${escapeHtml(bag)}" data-index="${idx}" ${isChecked ? 'checked' : ''}>
                <span class="item-name">${escapeHtml(bag)}</span>
            </div>
        `;
        container.appendChild(div);
    });
    document.querySelectorAll('#bagsListContainer .bag-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            saveSelection('bags', parseInt(e.target.dataset.index), e.target.checked);
        });
    });
}

function attachItemEvents(type) {
    document.querySelectorAll(`.qty-dec-btn[data-type="${type}"]`).forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.idx);
            const input = document.querySelector(`.${type}-qty[data-idx="${idx}"]`);
            if (input) {
                let v = parseInt(input.value) || 1;
                v = Math.max(1, v - 1);
                input.value = v;
            }
        };
    });
    document.querySelectorAll(`.qty-inc-btn[data-type="${type}"]`).forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.idx);
            const input = document.querySelector(`.${type}-qty[data-idx="${idx}"]`);
            if (input) {
                let v = parseInt(input.value) || 1;
                v = v + 1;
                input.value = v;
            }
        };
    });
    document.querySelectorAll(`.${type}-unit`).forEach(select => {
        select.onchange = function() {
            const idx = parseInt(this.dataset.index);
            const unit = this.value;
            const controls = document.querySelector(`.qty-controls[data-type="${type}"][data-index="${idx}"]`);
            if (!controls) return;
            if (unit === 'half' || unit === 'quarter' || unit === 'oke') {
                const text = unit === 'half' ? 'نصف كيلو' : unit === 'quarter' ? 'ربع كيلو' : 'لوقية';
                controls.innerHTML = `<span class="fixed-quantity">${text}</span>`;
                const qtyInp = document.querySelector(`.${type}-qty[data-idx="${idx}"]`);
                if (qtyInp) qtyInp.value = unit === 'half' ? 0.5 : unit === 'quarter' ? 0.25 : 0.2;
            } else {
                controls.innerHTML = `<button class="qty-dec-btn" data-idx="${idx}" data-type="${type}">-</button><input type="number" class="qty-value-modern ${type}-qty" data-idx="${idx}" value="1" step="1" min="1"><button class="qty-inc-btn" data-idx="${idx}" data-type="${type}">+</button>`;
                const dec = controls.querySelector('.qty-dec-btn');
                const inc = controls.querySelector('.qty-inc-btn');
                const inp = controls.querySelector(`.${type}-qty`);
                if (dec && inc && inp) {
                    dec.onclick = () => { let v = parseInt(inp.value)||1; v = Math.max(1, v-1); inp.value = v; };
                    inc.onclick = () => { let v = parseInt(inp.value)||1; v = v+1; inp.value = v; };
                }
            }
        };
    });
}

// ==================== دوال الإضافة إلى Firebase ====================
async function addSelectedImportant() {
    const items = [];
    const checkboxes = document.querySelectorAll('#importantListContainer .important-checkbox');
    for (const cb of checkboxes) {
        if (cb.checked) {
            const name = cb.dataset.name;
            const idx = parseInt(cb.dataset.index);
            const unitSelect = document.querySelector(`.important-unit[data-index="${idx}"]`);
            const unit = unitSelect ? unitSelect.value : 'kg';
            let qty = 1;
            if (unit === 'half') qty = 0.5;
            else if (unit === 'quarter') qty = 0.25;
            else if (unit === 'oke') qty = 0.2;
            else {
                const qtyInput = document.querySelector(`.important-qty[data-idx="${idx}"]`);
                qty = parseFloat(qtyInput ? qtyInput.value : 1);
            }
            items.push({ name, quantity: qty, unitType: unit });
        }
    }
    if (items.length === 0) { showToast("⭐ اختر مادة هامة", true); return; }
    try {
        const batch = db.batch();
        items.forEach(it => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: it.name,
                unitType: it.unitType,
                quantity: it.quantity,
                notes: "أساسيات",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "main"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} مادة بنجاح`);
        document.getElementById('importantModal').classList.remove('active');
        clearSelection('important');
        renderImportantFiltered(document.getElementById('importantSearchInput').value);
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function addSelectedSpicesExtra() {
    const items = [];
    const checkboxes = document.querySelectorAll('#spicesExtraListContainer .spices-checkbox');
    for (const cb of checkboxes) {
        if (cb.checked) {
            const name = cb.dataset.name;
            const idx = parseInt(cb.dataset.index);
            const unitSelect = document.querySelector(`.spices-unit[data-index="${idx}"]`);
            const unit = unitSelect ? unitSelect.value : 'kg';
            let qty = 1;
            if (unit === 'half') qty = 0.5;
            else if (unit === 'quarter') qty = 0.25;
            else if (unit === 'oke') qty = 0.2;
            else {
                const qtyInput = document.querySelector(`.spices-qty[data-idx="${idx}"]`);
                qty = parseFloat(qtyInput ? qtyInput.value : 1);
            }
            items.push({ name, quantity: qty, unitType: unit });
        }
    }
    if (items.length === 0) { showToast("🌿 اختر بهاراً", true); return; }
    try {
        const batch = db.batch();
        items.forEach(it => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: it.name,
                unitType: it.unitType,
                quantity: it.quantity,
                notes: "بهارات اضافية",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "spices_extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} بهار بنجاح`);
        document.getElementById('spicesExtraModal').classList.remove('active');
        clearSelection('spices');
        renderSpicesExtraFiltered(document.getElementById('spicesExtraSearchInput').value);
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function addSelectedRoasted() {
    const items = [];
    const checkboxes = document.querySelectorAll('#roastedListContainer .roasted-checkbox');
    for (const cb of checkboxes) {
        if (cb.checked) {
            const name = cb.dataset.name;
            const idx = parseInt(cb.dataset.index);
            const unitSelect = document.querySelector(`.roasted-unit[data-index="${idx}"]`);
            const unit = unitSelect ? unitSelect.value : 'kg';
            let qty = 1;
            if (unit === 'half') qty = 0.5;
            else if (unit === 'quarter') qty = 0.25;
            else if (unit === 'oke') qty = 0.2;
            else {
                const qtyInput = document.querySelector(`.roasted-qty[data-idx="${idx}"]`);
                qty = parseFloat(qtyInput ? qtyInput.value : 1);
            }
            items.push({ name, quantity: qty, unitType: unit });
        }
    }
    if (items.length === 0) { showToast("🔥 اختر منتج من المحمصة", true); return; }
    try {
        const batch = db.batch();
        items.forEach(it => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: it.name,
                unitType: it.unitType,
                quantity: it.quantity,
                notes: "محمصة",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "roasted"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} منتج بنجاح`);
        document.getElementById('roastedModal').classList.remove('active');
        clearSelection('roasted');
        renderRoastedFiltered(document.getElementById('roastedSearchInput').value);
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function addSelectedHerbs() {
    const items = [];
    const checkboxes = document.querySelectorAll('#herbsListContainer .herbs-checkbox');
    for (const cb of checkboxes) {
        if (cb.checked) {
            const name = cb.dataset.name;
            const idx = parseInt(cb.dataset.index);
            const unitSelect = document.querySelector(`.herbs-unit[data-index="${idx}"]`);
            const unit = unitSelect ? unitSelect.value : 'kg';
            let qty = 1;
            if (unit === 'half') qty = 0.5;
            else if (unit === 'quarter') qty = 0.25;
            else if (unit === 'oke') qty = 0.2;
            else {
                const qtyInput = document.querySelector(`.herbs-qty[data-idx="${idx}"]`);
                qty = parseFloat(qtyInput ? qtyInput.value : 1);
            }
            items.push({ name, quantity: qty, unitType: unit });
        }
    }
    if (items.length === 0) { showToast("🌱 اختر عشبة", true); return; }
    try {
        const batch = db.batch();
        items.forEach(it => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: it.name,
                unitType: it.unitType,
                quantity: it.quantity,
                notes: "أعشاب",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "herbs"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} عشبة بنجاح`);
        document.getElementById('herbsModal').classList.remove('active');
        clearSelection('herbs');
        renderHerbsFiltered(document.getElementById('herbsSearchInput').value);
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function addSelectedExtra() {
    const items = [];
    const checkboxes = document.querySelectorAll('#extraListContainer .extra-checkbox');
    for (const cb of checkboxes) {
        if (cb.checked) {
            const name = cb.dataset.name;
            const idx = parseInt(cb.dataset.index);
            const unitSelect = document.querySelector(`.extra-unit[data-index="${idx}"]`);
            const unit = unitSelect ? unitSelect.value : 'kg';
            let qty = 1;
            if (unit === 'half') qty = 0.5;
            else if (unit === 'quarter') qty = 0.25;
            else if (unit === 'oke') qty = 0.2;
            else {
                const qtyInput = document.querySelector(`.extra-qty[data-idx="${idx}"]`);
                qty = parseFloat(qtyInput ? qtyInput.value : 1);
            }
            items.push({ name, quantity: qty, unitType: unit });
        }
    }
    if (items.length === 0) { showToast("📦 اختر مادة اضافية", true); return; }
    try {
        const batch = db.batch();
        items.forEach(it => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: it.name,
                unitType: it.unitType,
                quantity: it.quantity,
                notes: "مواد اضافية",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} مادة بنجاح`);
        document.getElementById('extraModal').classList.remove('active');
        clearSelection('extra');
        renderExtraFiltered(document.getElementById('extraSearchInput').value);
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function addSelectedBags() {
    const selected = [];
    const checkboxes = document.querySelectorAll('#bagsListContainer .bag-checkbox');
    for (const cb of checkboxes) {
        if (cb.checked) selected.push(cb.dataset.name);
    }
    if (selected.length === 0) { showToast("📦 اختر نوع كيس", true); return; }
    try {
        const batch = db.batch();
        selected.forEach(b => {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: `كيس تعبئة - ${b}`,
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
        clearSelection('bags');
        renderBags();
    } catch(e) { showToast("❌ فشل إضافة الأكياس", true); }
}

async function addTawsaya() {
    let name = document.getElementById('tawsayaName')?.value.trim();
    if (!name) { showToast("✏️ اسم المنتج", true); return; }
    let type = document.querySelector('#tawsayaTypeGroup .unit-btn.active')?.getAttribute('data-type');
    let qty = 1;
    if (type === 'kg') {
        qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    } else if (type === 'half') {
        qty = 0.5;
    } else {
        qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    }
    if (isNaN(qty) || qty <= 0) { showToast("🔢 كمية صحيحة", true); return; }
    try {
        await materialsCollection.add({
            name, unitType: 'kg', quantity: qty, notes: "توصيات",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: "tawsaya"
        });
        showToast(`✓ تمت إضافة "${name}"`);
        document.getElementById('tawsayaName').value = "";
        document.getElementById('tawsayaCustomQty').value = "1";
        document.getElementById('tawsayaModal').classList.remove('active');
    } catch(e) { showToast("❌ فشل الإضافة", true); }
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
        if (isNaN(newQty) || newQty <= 0) { showToast("🔢 كمية صحيحة", true); return; }
    }
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: newQty, unitType: newUnit });
        showToast("✓ تم تحديث الكمية");
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
    } catch(e) { showToast("❌ فشل التحديث", true); }
}

async function addNewMaterialDirect() {
    let name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) { showToast("✏️ اكتب اسم المادة", true); return; }
    let unit = document.getElementById('newUnitSelect')?.value || 'kg';
    let quantity = 1;
    if (unit === 'half') quantity = 0.5;
    else if (unit === 'quarter') quantity = 0.25;
    else if (unit === 'oke') quantity = 0.2;
    else {
        quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
        if (isNaN(quantity) || quantity <= 0) { showToast("🔢 كمية صحيحة", true); return; }
    }
    try {
        await materialsCollection.add({
            name, unitType: unit, quantity: quantity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: "main"
        });
        showToast(`✓ تمت إضافة "${name}"`);
        document.getElementById('newItemModal').classList.remove('active');
        document.getElementById('newMaterialName').value = "";
        document.getElementById('newQuantityValue').value = "1";
    } catch(e) { showToast("❌ خطأ في الاتصال", true); }
}

// ==================== عرض المواد الرئيسية ====================
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
            <div class="section-title"><i class="fas fa-star-of-life"></i> أساسيات</div>
            ${main.length === 0 ? '<div class="empty-state">✨ لا توجد مواد</div>' : `<div class="materials-grid" data-section="main">${main.map(m => renderMaterialCard(m, 'main')).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-leaf"></i> بهارات اضافية</div>
            ${spicesExtra.length === 0 ? '<div class="empty-state">🌿 لا توجد بهارات اضافية</div>' : `<div class="materials-grid" data-section="spices_extra">${spicesExtra.map(m => renderMaterialCard(m, 'spices_extra')).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-fire"></i> المحمصة</div>
            ${roasted.length === 0 ? '<div class="empty-state">🔥 لا توجد مواد في المحمصة</div>' : `<div class="materials-grid" data-section="roasted">${roasted.map(m => renderMaterialCard(m, 'roasted')).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-seedling"></i> الأعشاب</div>
            ${herbs.length === 0 ? '<div class="empty-state">🌱 لا توجد أعشاب</div>' : `<div class="materials-grid" data-section="herbs">${herbs.map(m => renderMaterialCard(m, 'herbs')).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-plus-circle"></i> مواد اضافية</div>
            ${extra.length === 0 ? '<div class="empty-state">📦 لا توجد مواد اضافية</div>' : `<div class="materials-grid" data-section="extra">${extra.map(m => renderMaterialCard(m, 'extra')).join('')}</div>`}
        </div>
        <div class="priority-section">
            <div class="section-title"><i class="fas fa-gift"></i> توصيات</div>
            ${taws.length === 0 ? '<div class="empty-state">🎁 لا توجد توصيات</div>' : `<div class="materials-grid" data-section="tawsaya">${taws.map(m => renderMaterialCard(m, 'tawsaya')).join('')}</div>`}
        </div>
    `;
    
    container.innerHTML = html;
    
    document.querySelectorAll('.material-card').forEach(card => {
        const material = materials.find(m => m.id === card.dataset.id);
        if (material) {
            card.dataset.section = material.priority;
        }
    });
    
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
    
    setTimeout(() => {
        setupDragAndDrop();
        setupLongPress();
    }, 100);
    
    calculateAIMetrics();
}

function renderMaterialCard(m, section) {
    return `<div class="material-card" data-id="${m.id}" data-section="${section}" draggable="true">
        <div class="card-header">
            <div class="card-title"><i class="fas fa-box"></i> <span>${escapeHtml(m.name)}</span></div>
            <div class="card-actions">
                <button class="edit-material" data-id="${m.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-material" data-id="${m.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <div class="qty-badge">${formatDisplay(m)}</div>
    </div>`;
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
        let displayText = unit === 'half' ? 'نصف كيلو' : unit === 'quarter' ? 'ربع كيلو' : 'لوقية';
        textSpan.textContent = displayText;
        textSpan.style.display = 'block';
    } else {
        qtyInput.style.display = 'block';
        const textSpan = container.querySelector('.fixed-quantity-edit');
        if (textSpan) textSpan.style.display = 'none';
    }
}

function initNewItemModal() {
    const unitSelect = document.getElementById('newUnitSelect');
    const qtyPicker = document.querySelector('#newItemModal .qty-picker');
    const qtyInput = document.getElementById('newQuantityValue');
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
    const dec = document.getElementById('newQtyDec');
    const inc = document.getElementById('newQtyInc');
    if (dec && inc && qtyInput) {
        dec.onclick = () => { let v = parseFloat(qtyInput.value) || 1; v = Math.max(0.25, v - 0.25); qtyInput.value = v; };
        inc.onclick = () => { let v = parseFloat(qtyInput.value) || 1; v = v + 0.25; qtyInput.value = v; };
        qtyInput.onchange = () => { let v = parseFloat(qtyInput.value); if (isNaN(v) || v < 0.25) qtyInput.value = 1; };
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
                id: doc.id, name: data.name, unitType: data.unitType || 'kg',
                quantity: data.quantity || 0, notes: data.notes || "",
                createdAt: data.createdAt, priority: data.priority || "main"
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
    document.getElementById('syncBtn').onclick = () => { if (unsubscribe) unsubscribe(); startListener(); showToast("🔄 جاري المزامنة..."); };
    document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark');
    document.getElementById('backupBtn').onclick = () => {
        if (allMaterials.length === 0) { showToast("📭 لا توجد بيانات", true); return; }
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
                } catch(e) { showToast("❌ ملف غير صالح", true); }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    document.getElementById('clearAllBtn').onclick = async () => {
        if (allMaterials.length === 0) { showToast("📭 القائمة فارغة", true); return; }
        if (confirm("⚠️ حذف جميع المواد نهائياً؟")) {
            let batch = db.batch();
            allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
            await batch.commit();
            showToast("✓ تم مسح القائمة");
        }
    };
    
    document.getElementById('importantProductsBtn').onclick = () => { renderImportantFiltered(''); document.getElementById('importantModal').classList.add('active'); document.getElementById('importantSearchInput').focus(); };
    document.getElementById('spicesExtraBtn').onclick = () => { renderSpicesExtraFiltered(''); document.getElementById('spicesExtraModal').classList.add('active'); document.getElementById('spicesExtraSearchInput').focus(); };
    document.getElementById('roastedBtn').onclick = () => { renderRoastedFiltered(''); document.getElementById('roastedModal').classList.add('active'); document.getElementById('roastedSearchInput').focus(); };
    document.getElementById('herbsBtn').onclick = () => { renderHerbsFiltered(''); document.getElementById('herbsModal').classList.add('active'); document.getElementById('herbsSearchInput').focus(); };
    document.getElementById('extraBtn').onclick = () => { renderExtraFiltered(''); document.getElementById('extraModal').classList.add('active'); document.getElementById('extraSearchInput').focus(); };
    document.getElementById('bagsManagerBtn').onclick = () => { renderBags(); document.getElementById('bagsModal').classList.add('active'); document.getElementById('bagsSearchInput').focus(); };
    document.getElementById('tawsayaQuickBtn').onclick = () => document.getElementById('tawsayaModal').classList.add('active');
    
    document.getElementById('saveNewItemBtn').onclick = addNewMaterialDirect;
    document.getElementById('saveImportantBtn').onclick = addSelectedImportant;
    document.getElementById('saveSpicesExtraBtn').onclick = addSelectedSpicesExtra;
    document.getElementById('saveRoastedBtn').onclick = addSelectedRoasted;
    document.getElementById('saveHerbsBtn').onclick = addSelectedHerbs;
    document.getElementById('saveExtraBtn').onclick = addSelectedExtra;
    document.getElementById('saveBagsBtn').onclick = addSelectedBags;
    document.getElementById('saveTawsayaBtn').onclick = addTawsaya;
    document.getElementById('saveEditBtn').onclick = saveEdit;
    document.getElementById('confirmMoveBtn').onclick = moveMaterialToSection;
    
    document.getElementById('editUnitSelect').addEventListener('change', function() { updateEditFieldByUnit(this.value); });
    
    const debounce = (fn, delay) => { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => fn.apply(this, args), delay); }; };
    document.getElementById('importantSearchInput').oninput = debounce((e) => renderImportantFiltered(e.target.value), 300);
    document.getElementById('spicesExtraSearchInput').oninput = debounce((e) => renderSpicesExtraFiltered(e.target.value), 300);
    document.getElementById('roastedSearchInput').oninput = debounce((e) => renderRoastedFiltered(e.target.value), 300);
    document.getElementById('herbsSearchInput').oninput = debounce((e) => renderHerbsFiltered(e.target.value), 300);
    document.getElementById('extraSearchInput').oninput = debounce((e) => renderExtraFiltered(e.target.value), 300);
    document.getElementById('bagsSearchInput').oninput = debounce((e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#bagsListContainer .modern-item-card').forEach(card => {
            const name = card.querySelector('.item-name')?.innerText.toLowerCase() || '';
            card.style.display = name.includes(term) ? 'flex' : 'none';
        });
    }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    startListener();
    startAutoSync();
    initNewItemModal();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/material-manager/service-worker.js')
            .then(reg => console.log('✅ SW registered'))
            .catch(err => console.error('❌ SW failed', err));
    });
                     }
