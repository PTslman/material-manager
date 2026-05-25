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
    "اشلميش", "لوز ني", "كاجو ني", "لوز بقشرو", "فستق ني", "لبان الدكر", "لومي", "لومي اسود", "كركدية",
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
    if (u === 'half') return `نصف كيلو (0.5 kg)`;
    if (u === 'quarter') return `ربع كيلو (0.25 kg)`;
    if (u === 'oke') return `لوقية (0.2 kg)`;
    if (u === 'box') return `${mat.quantity} علبة`;
    if (u === 'piece') return `${mat.quantity} عدد`;
    if (u === 'bag') return `${mat.quantity} كيس`;
    return `${mat.quantity} kg`;
}

function getUnitSymbol(unit) {
    switch(unit) {
        case 'kg': return 'kg';
        case 'half': return 'نصف كيلو';
        case 'quarter': return 'ربع كيلو';
        case 'oke': return 'لوقية';
        case 'box': return 'علبة';
        case 'piece': return 'عدد';
        default: return 'kg';
    }
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
                const editUnitSelect = document.getElementById('editUnitSelect');
                if (editUnitSelect) editUnitSelect.value = material.unitType || 'kg';
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

// ==================== عرض القوائم في النوافذ ====================
function renderImportantFiltered(filter = '') {
    const container = document.getElementById('importantListContainer');
    if (!container) return;
    const filtered = importantItemsList.filter(item => item.includes(filter));
    container.innerHTML = filtered.map((item, idx) => `
        <div class="modern-item-card">
            <div class="item-info">
                <input type="checkbox" id="imp_chk_${idx}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select" id="imp_unit_${idx}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <button class="qty-btn-modern" data-idx="${idx}" data-dir="down" data-target="imp">-</button>
                <input type="number" class="qty-value-modern" id="imp_qty_${idx}" value="1" step="0.25" min="0.25">
                <button class="qty-btn-modern" data-idx="${idx}" data-dir="up" data-target="imp">+</button>
            </div>
        </div>
    `).join('');
    
    attachQuantityEvents('imp');
}

function renderSpicesExtraFiltered(filter = '') {
    const container = document.getElementById('spicesExtraListContainer');
    if (!container) return;
    const filtered = spicesExtraItemsList.filter(item => item.includes(filter));
    container.innerHTML = filtered.map((item, idx) => `
        <div class="modern-item-card">
            <div class="item-info">
                <input type="checkbox" id="sp_chk_${idx}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select" id="sp_unit_${idx}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <button class="qty-btn-modern" data-idx="${idx}" data-dir="down" data-target="sp">-</button>
                <input type="number" class="qty-value-modern" id="sp_qty_${idx}" value="1" step="0.25" min="0.25">
                <button class="qty-btn-modern" data-idx="${idx}" data-dir="up" data-target="sp">+</button>
            </div>
        </div>
    `).join('');
    
    attachQuantityEvents('sp');
}

function renderQuickFiltered(filter = '') {
    const container = document.getElementById('quickListContainer');
    if (!container) return;
    const filtered = extraItemsList.filter(item => item.includes(filter));
    container.innerHTML = filtered.map((item, idx) => `
        <div class="modern-item-card">
            <div class="item-info">
                <input type="checkbox" id="quick_chk_${idx}">
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <select class="qty-select" id="quick_unit_${idx}">
                    <option value="kg">كيلو (kg)</option>
                    <option value="half">نصف كيلو</option>
                    <option value="quarter">ربع كيلو</option>
                    <option value="oke">لوقية</option>
                    <option value="box">علبة</option>
                    <option value="piece">عدد</option>
                </select>
                <button class="qty-btn-modern" data-idx="${idx}" data-dir="down" data-target="quick">-</button>
                <input type="number" class="qty-value-modern" id="quick_qty_${idx}" value="1" step="0.25" min="0.25">
                <button class="qty-btn-modern" data-idx="${idx}" data-dir="up" data-target="quick">+</button>
            </div>
        </div>
    `).join('');
    
    attachQuantityEvents('quick');
}

function attachQuantityEvents(prefix) {
    document.querySelectorAll(`.qty-btn-modern[data-target="${prefix}"]`).forEach(btn => {
        btn.onclick = () => {
            const idx = btn.dataset.idx;
            const input = document.getElementById(`${prefix}_qty_${idx}`);
            if (input) {
                let val = parseFloat(input.value) || 1;
                const step = parseFloat(input.step) || 0.25;
                const min = parseFloat(input.min) || 0.25;
                if (btn.dataset.dir === 'up') {
                    val = Math.min(val + step, 100);
                } else {
                    val = Math.max(min, val - step);
                }
                input.value = val;
            }
        };
    });
}

function renderBags() {
    const container = document.getElementById('bagsListContainer');
    if (!container) return;
    container.innerHTML = bagTypesList.map((b, i) => `<div class="modern-item-card"><div class="item-info"><input type="checkbox" id="bag_chk_${i}"><span>${escapeHtml(b)}</span></div></div>`).join('');
}

// ==================== دوال الإضافة ====================
async function addSelectedImportant() {
    let items = [];
    for (let i = 0; i < importantItemsList.length; i++) {
        if (document.getElementById(`imp_chk_${i}`)?.checked) {
            let qty = parseFloat(document.getElementById(`imp_qty_${i}`).value);
            let unit = document.getElementById(`imp_unit_${i}`)?.value || 'kg';
            items.push({ name: importantItemsList[i], quantity: qty, unitType: unit });
        }
    }
    if (items.length === 0) { showToast("⭐ اختر مادة هامة", true); return; }
    
    try {
        let batch = db.batch();
        items.forEach(p => {
            let ref = materialsCollection.doc();
            batch.set(ref, { 
                name: p.name, 
                unitType: p.unitType, 
                quantity: p.quantity, 
                notes: "مواد هامة", 
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
                priority: "main" 
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} مادة بنجاح`);
        document.getElementById('importantModal').classList.remove('active');
        for (let i = 0; i < importantItemsList.length; i++) {
            if (document.getElementById(`imp_chk_${i}`)) document.getElementById(`imp_chk_${i}`).checked = false;
            if (document.getElementById(`imp_qty_${i}`)) document.getElementById(`imp_qty_${i}`).value = "1";
        }
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function addSelectedSpicesExtra() {
    let items = [];
    for (let i = 0; i < spicesExtraItemsList.length; i++) {
        if (document.getElementById(`sp_chk_${i}`)?.checked) {
            let qty = parseFloat(document.getElementById(`sp_qty_${i}`).value);
            let unit = document.getElementById(`sp_unit_${i}`)?.value || 'kg';
            items.push({ name: spicesExtraItemsList[i], quantity: qty, unitType: unit });
        }
    }
    if (items.length === 0) { showToast("🌿 اختر بهاراً", true); return; }
    
    try {
        let batch = db.batch();
        items.forEach(p => {
            let ref = materialsCollection.doc();
            batch.set(ref, { 
                name: p.name, 
                unitType: p.unitType, 
                quantity: p.quantity, 
                notes: "بهارات اضافية", 
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
                priority: "spices_extra" 
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} بهار بنجاح`);
        document.getElementById('spicesExtraModal').classList.remove('active');
        for (let i = 0; i < spicesExtraItemsList.length; i++) {
            if (document.getElementById(`sp_chk_${i}`)) document.getElementById(`sp_chk_${i}`).checked = false;
            if (document.getElementById(`sp_qty_${i}`)) document.getElementById(`sp_qty_${i}`).value = "1";
        }
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function addSelectedQuick() {
    let items = [];
    for (let i = 0; i < extraItemsList.length; i++) {
        if (document.getElementById(`quick_chk_${i}`)?.checked) {
            let qty = parseFloat(document.getElementById(`quick_qty_${i}`).value);
            let unit = document.getElementById(`quick_unit_${i}`)?.value || 'kg';
            items.push({ name: extraItemsList[i], quantity: qty, unitType: unit });
        }
    }
    if (items.length === 0) { showToast("🌱 اختر منتجاً", true); return; }
    
    try {
        let batch = db.batch();
        items.forEach(p => {
            let ref = materialsCollection.doc();
            batch.set(ref, { 
                name: p.name, 
                unitType: p.unitType, 
                quantity: p.quantity, 
                notes: "بذوريات", 
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
                priority: "extra" 
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} منتج بنجاح`);
        document.getElementById('quickModal').classList.remove('active');
        for (let i = 0; i < extraItemsList.length; i++) {
            if (document.getElementById(`quick_chk_${i}`)) document.getElementById(`quick_chk_${i}`).checked = false;
            if (document.getElementById(`quick_qty_${i}`)) document.getElementById(`quick_qty_${i}`).value = "1";
        }
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function addSelectedBags() {
    let selected = [];
    for (let i = 0; i < bagTypesList.length; i++) {
        if (document.getElementById(`bag_chk_${i}`)?.checked) selected.push(bagTypesList[i]);
    }
    if (selected.length === 0) { showToast("📦 اختر نوع كيس", true); return; }
    
    try {
        let batch = db.batch();
        selected.forEach(b => {
            let ref = materialsCollection.doc();
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
        for (let i = 0; i < bagTypesList.length; i++) {
            if (document.getElementById(`bag_chk_${i}`)) document.getElementById(`bag_chk_${i}`).checked = false;
        }
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function addTawsaya() {
    let name = document.getElementById('tawsayaName')?.value.trim();
    if (!name) { showToast("✏️ اسم المنتج", true); return; }
    
    let type = document.querySelector('#tawsayaTypeGroup .unit-btn.active')?.getAttribute('data-type');
    let qty = 1;
    if (type === 'kg') qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    else if (type === 'half') qty = 0.5;
    else qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    if (isNaN(qty) || qty <= 0) { showToast("🔢 كمية صحيحة", true); return; }
    
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
    } catch(e) { showToast("❌ فشل الإضافة", true); }
}

async function saveEdit() {
    if (!currentEditId) return;
    let newQty = parseFloat(document.getElementById('editQuantityValue')?.value);
    let newUnit = document.getElementById('editUnitSelect')?.value || 'kg';
    if (isNaN(newQty) || newQty <= 0) { showToast("🔢 كمية صحيحة", true); return; }
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
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    let unit = document.getElementById('newUnitSelect')?.value || 'kg';
    if (isNaN(quantity) || quantity <= 0) { showToast("🔢 كمية صحيحة", true); return; }
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
    } catch(e) { showToast("❌ خطأ في الاتصال", true); }
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
        a.download = `backup_${new Date().toISOString().slice(0,19)}.json`;
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
    
    // أزرار الجداول
    document.getElementById('importantProductsBtn').onclick = () => { renderImportantFiltered(''); document.getElementById('importantModal').classList.add('active'); };
    document.getElementById('spicesExtraBtn').onclick = () => { renderSpicesExtraFiltered(''); document.getElementById('spicesExtraModal').classList.add('active'); };
    document.getElementById('quickProductsBtn').onclick = () => { renderQuickFiltered(''); document.getElementById('quickModal').classList.add('active'); };
    document.getElementById('bagsManagerBtn').onclick = () => { renderBags(); document.getElementById('bagsModal').classList.add('active'); };
    document.getElementById('tawsayaQuickBtn').onclick = () => { document.getElementById('tawsayaModal').classList.add('active'); };
    
    // أزرار الحفظ
    document.getElementById('saveNewItemBtn').onclick = addNewMaterialDirect;
    document.getElementById('saveImportantBtn').onclick = addSelectedImportant;
    document.getElementById('saveSpicesExtraBtn').onclick = addSelectedSpicesExtra;
    document.getElementById('saveQuickBtn').onclick = addSelectedQuick;
    document.getElementById('saveBagsBtn').onclick = addSelectedBags;
    document.getElementById('saveTawsayaBtn').onclick = addTawsaya;
    document.getElementById('saveEditBtn').onclick = saveEdit;
    
    // أزرار البحث
    document.getElementById('importantSearchInput').oninput = (e) => renderImportantFiltered(e.target.value);
    document.getElementById('spicesExtraSearchInput').oninput = (e) => renderSpicesExtraFiltered(e.target.value);
    document.getElementById('quickSearchInput').oninput = (e) => renderQuickFiltered(e.target.value);
    document.getElementById('bagsSearchInput').oninput = (e) => {
        let term = e.target.value.toLowerCase();
        document.querySelectorAll('#bagsListContainer .modern-item-card').forEach(item => {
            let name = item.querySelector('.item-name')?.innerText.toLowerCase() || '';
            item.style.display = name.includes(term) ? 'flex' : 'none';
        });
    };
}

// ==================== تهيئة أزرار الوزن في النافذة الرئيسية ====================
function initMainQuantityButtons() {
    const decBtn = document.querySelector('#newItemModal .qty-picker .qty-dec-btn');
    const incBtn = document.querySelector('#newItemModal .qty-picker .qty-inc-btn');
    const qtyInput = document.getElementById('newQuantityValue');
    
    if (decBtn && incBtn && qtyInput) {
        decBtn.onclick = () => {
            let val = parseFloat(qtyInput.value) || 1;
            let step = parseFloat(qtyInput.step) || 0.25;
            val = Math.max(0.25, val - step);
            qtyInput.value = val;
        };
        incBtn.onclick = () => {
            let val = parseFloat(qtyInput.value) || 1;
            let step = parseFloat(qtyInput.step) || 0.25;
            val = val + step;
            qtyInput.value = val;
        };
    }
}

// ==================== التهيئة ====================
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    startListener();
    startAutoSync();
    initMainQuantityButtons();
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
