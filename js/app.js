let allMaterials = [];
let unsubscribe = null;
let autoSyncTimer = null;
let currentEditId = null;
let fileInput = null;
let isConnected = false;
let lastSyncDate = null;
let reconnectAttempts = 0;
let splashHidden = false;
let deferredPrompt = null;

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
    "يانسون ناعم", "سدر ناعم", "سمك", "سجق", "سحلب", "شبة ناعمة", "نوديلز اندومي"
];

const extraItemsList = [
    "بذر دوار شمس ملكي", "بذر دوار شمس الشبح", "بذر اصفر ملكي", "بذر اسود ملكي", "بذر كوسا",
    "بذر ابيض عريض", "فستق مدخن", "فستق مملح", "ذرة الفوشار", "شوفان", "نعنع يابس", "نسكافية خشنة",
    "اشلميش", "لوز ني", "كاجو ني", "لوز بقشرو", "فستق ني", "لبان الدكر", "لومي", "لومي اسود", "كركدية",
    "زهرة الالماسة", "شمرا ناعمة", "شمرا حب", "زهورات مشكلة", "جوز امريكي", "تمر سري", "جوز هند خشن",
    "جوز هند ناعم", "بذور الشيا", "بذور الكتان", "بذور الرشاد", "رمان زركش"
];

const bagTypesList = ["شفاف 10×12","شفاف 20×12","شفاف 10×20","شفاف 25×17","شفاف 20×30","شفاف 35×25","صيدلية","أسود 30","أسود 35","أسود 40","أسود 45"];

function getImportantItems() { 
    return importantItemsList.map(name => ({ name, type: "range", min: 1, max: 5, step: 1 })); 
}

function getSpicesExtraItems() { 
    return spicesExtraItemsList.map(name => ({ name, type: "range", min: 1, max: 10, step: 1 })); 
}

function getExtraItems() { 
    return extraItemsList.map(name => ({ name, type: "range", min: 1, max: 10, step: 1 })); 
}

// ==================== دوال العرض ====================
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
            if (material && material.unitType === 'kg') {
                currentEditId = id;
                document.getElementById('editMaterialName').value = material.name;
                document.getElementById('editQuantityValue').value = material.quantity;
                document.getElementById('editModal').classList.add('active');
            }
        };
    });
}

function renderMaterialCard(m) {
    const showEdit = m.unitType === 'kg';
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

// ==================== عرض القوائم ====================
function renderImportantFiltered(filter = '') {
    const container = document.getElementById('importantListContainer');
    if (!container) return;
    
    const filtered = importantItemsList.filter(item => item.includes(filter));
    let html = '';
    
    filtered.forEach((item, idx) => {
        const originalIdx = importantItemsList.findIndex(orig => orig === item);
        html += `<div class="modern-item-card" data-idx="${originalIdx}">
            <div class="item-info">
                <input type="checkbox" id="important_chk_${originalIdx}" style="margin-left: 10px;"> 
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <button class="qty-btn" data-action="decr" data-idx="${originalIdx}">-</button>
                <input type="number" class="qty-value" id="important_qty_${originalIdx}" value="1" step="1" min="1" max="5">
                <button class="qty-btn" data-action="incr" data-idx="${originalIdx}">+</button>
                <span class="unit-label">كجم</span>
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

function renderSpicesExtraFiltered(filter = '') {
    const container = document.getElementById('spicesExtraListContainer');
    if (!container) return;
    
    const filtered = spicesExtraItemsList.filter(item => item.includes(filter));
    let html = '';
    
    filtered.forEach((item, idx) => {
        const originalIdx = spicesExtraItemsList.findIndex(orig => orig === item);
        html += `<div class="modern-item-card" data-idx="${originalIdx}">
            <div class="item-info">
                <input type="checkbox" id="spices_extra_chk_${originalIdx}" style="margin-left: 10px;"> 
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <button class="qty-btn" data-action="decr" data-idx="${originalIdx}">-</button>
                <input type="number" class="qty-value" id="spices_extra_qty_${originalIdx}" value="1" step="1" min="1" max="10">
                <button class="qty-btn" data-action="incr" data-idx="${originalIdx}">+</button>
                <span class="unit-label">كجم</span>
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

function renderQuickFiltered(filter = '') {
    const container = document.getElementById('quickListContainer');
    if (!container) return;
    
    const filtered = extraItemsList.filter(item => item.includes(filter));
    let html = '';
    
    filtered.forEach((item, idx) => {
        const originalIdx = extraItemsList.findIndex(orig => orig === item);
        html += `<div class="modern-item-card" data-idx="${originalIdx}">
            <div class="item-info">
                <input type="checkbox" id="quick_chk_${originalIdx}" style="margin-left: 10px;"> 
                <span class="item-name">${escapeHtml(item)}</span>
            </div>
            <div class="quantity-modern">
                <button class="qty-btn" data-action="decr" data-idx="${originalIdx}">-</button>
                <input type="number" class="qty-value" id="quick_qty_${originalIdx}" value="1" step="1" min="1" max="10">
                <button class="qty-btn" data-action="incr" data-idx="${originalIdx}">+</button>
                <span class="unit-label">كجم</span>
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

// ==================== دوال الإضافة ====================
async function addSelectedImportant() {
    let items = [];
    for (let i = 0; i < importantItemsList.length; i++) {
        const chk = document.getElementById(`important_chk_${i}`);
        if (chk && chk.checked) {
            let qty = parseInt(document.getElementById(`important_qty_${i}`).value);
            items.push({ name: importantItemsList[i], quantity: qty });
        }
    }
    if (items.length === 0) { showToast("⭐ اختر مادة هامة", true); return; }
    try {
        let batch = db.batch();
        items.forEach(p => {
            let ref = materialsCollection.doc();
            batch.set(ref, {
                name: p.name, unitType: 'kg', quantity: p.quantity,
                notes: "مواد هامة سريعة",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "main"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} مادة`);
        document.getElementById('importantModal').classList.remove('active');
        document.getElementById('importantSearchInput').value = '';
    } catch (e) { showToast("❌ فشل", true); }
}

async function addSelectedSpicesExtra() {
    let items = [];
    for (let i = 0; i < spicesExtraItemsList.length; i++) {
        const chk = document.getElementById(`spices_extra_chk_${i}`);
        if (chk && chk.checked) {
            let qty = parseInt(document.getElementById(`spices_extra_qty_${i}`).value);
            items.push({ name: spicesExtraItemsList[i], quantity: qty });
        }
    }
    if (items.length === 0) { showToast("🌿 اختر بهاراً", true); return; }
    try {
        let batch = db.batch();
        items.forEach(p => {
            let ref = materialsCollection.doc();
            batch.set(ref, {
                name: p.name, unitType: 'kg', quantity: p.quantity,
                notes: "بهارات اضافية",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "spices_extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} بهار`);
        document.getElementById('spicesExtraModal').classList.remove('active');
        document.getElementById('spicesExtraSearchInput').value = '';
    } catch (e) { showToast("❌ فشل", true); }
}

async function addSelectedQuick() {
    let items = [];
    for (let i = 0; i < extraItemsList.length; i++) {
        const chk = document.getElementById(`quick_chk_${i}`);
        if (chk && chk.checked) {
            let qty = parseInt(document.getElementById(`quick_qty_${i}`).value);
            items.push({ name: extraItemsList[i], quantity: qty });
        }
    }
    if (items.length === 0) { showToast("🌱 اختر منتجاً", true); return; }
    try {
        let batch = db.batch();
        items.forEach(p => {
            let ref = materialsCollection.doc();
            batch.set(ref, {
                name: p.name, unitType: 'kg', quantity: p.quantity,
                notes: "بذوريات واعشاب",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} منتج`);
        document.getElementById('quickModal').classList.remove('active');
        document.getElementById('quickSearchInput').value = '';
    } catch (e) { showToast("❌ فشل", true); }
}

async function addSelectedBags() {
    let selected = [];
    for (let i = 0; i < bagTypesList.length; i++) {
        if (document.getElementById(`bag_chk_${i}`)?.checked) {
            selected.push(bagTypesList[i]);
        }
    }
    if (selected.length === 0) { showToast("📦 اختر نوع كيس", true); return; }
    try {
        let batch = db.batch();
        selected.forEach(b => {
            let ref = materialsCollection.doc();
            batch.set(ref, {
                name: `كيس تعبئة - ${b}`, unitType: 'bag', quantity: 1,
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
    } catch (e) { showToast("❌ فشل إضافة الأكياس", true); }
}

async function addTawsaya() {
    let name = document.getElementById('tawsayaName')?.value.trim();
    if (!name) { showToast("✏️ اسم التوصاية", true); return; }
    let type = document.querySelector('#tawsayaTypeGroup .unit-btn.active')?.getAttribute('data-type');
    let qty = 1;
    if (type === 'kg') {
        let v = parseFloat(document.getElementById('tawsayaCustomQty')?.value);
        if (isNaN(v) || v <= 0) { showToast("🔢 كمية صحيحة", true); return; }
        qty = v;
    } else if (type === 'half') {
        qty = 0.5;
    } else {
        let v = parseFloat(document.getElementById('tawsayaCustomQty')?.value);
        if (isNaN(v) || v <= 0) { showToast("🔢 كمية صحيحة", true); return; }
        qty = v;
    }
    try {
        await materialsCollection.add({
            name, unitType: 'kg', quantity: qty, notes: "توصاية",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: "tawsaya"
        });
        showToast(`✓ تمت إضافة "${name}"`);
        document.getElementById('tawsayaName').value = "";
        document.getElementById('tawsayaCustomQty').value = "1";
        document.getElementById('tawsayaModal').classList.remove('active');
    } catch (e) { showToast("❌ خطأ", true); }
}

async function saveEdit() {
    if (!currentEditId) return;
    let newQty = parseFloat(document.getElementById('editQuantityValue')?.value);
    if (isNaN(newQty) || newQty <= 0) { showToast("🔢 كمية صحيحة", true); return; }
    try {
        await materialsCollection.doc(currentEditId).update({ quantity: newQty });
        showToast("✓ تم تحديث الكمية");
        document.getElementById('editModal').classList.remove('active');
        currentEditId = null;
    } catch (e) { showToast("❌ فشل التحديث", true); }
}

async function addNewMaterialDirect() {
    let name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) { showToast("✏️ اكتب اسم المادة", true); return; }
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    if (isNaN(quantity) || quantity <= 0) { showToast("🔢 كمية صحيحة", true); return; }
    showToast(`➕ جاري إضافة "${name}"...`);
    try {
        await materialsCollection.add({
            name, unitType: 'kg', quantity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: "main"
        });
        showToast(`✓ تمت إضافة "${name}"`);
        document.getElementById('newMaterialName').value = "";
        document.getElementById('newQuantityValue').value = "1";
        document.getElementById('newItemModal').classList.remove('active');
    } catch (e) { showToast("❌ خطأ في الاتصال", true); }
}

// ==================== Firebase والمزامنة ====================
function startListener() {
    updateSyncUI('syncing');
    if (unsubscribe) unsubscribe();
    
    const query = materialsCollection.orderBy('createdAt', 'desc');
    let firstSnapshot = true;
    
    unsubscribe = query.onSnapshot((snapshot) => {
        const list = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            list.push({
                id: doc.id, name: data.name, unitType: data.unitType,
                quantity: data.quantity, notes: data.notes || "",
                createdAt: data.createdAt, priority: data.priority || "main"
            });
        });
        allMaterials = list;
        lastSyncDate = new Date();
        updateSyncUI('connected', list.length);
        renderAllMaterials(allMaterials);
        if (firstSnapshot) { firstSnapshot = false; forceHideSplash(); }
        reconnectAttempts = 0;
    }, (error) => {
        console.error("Firestore error:", error);
        updateSyncUI('offline');
        forceHideSplash();
        if (reconnectAttempts < 3) {
            reconnectAttempts++;
            setTimeout(() => { if (unsubscribe) { unsubscribe(); startListener(); } }, 3000);
        }
    });
}

function startAutoSync() {
    if (autoSyncTimer) clearInterval(autoSyncTimer);
    autoSyncTimer = setInterval(() => {
        if (unsubscribe) { unsubscribe(); startListener(); }
    }, 15 * 60 * 1000);
}

function updateSyncUI(status, itemCount = null) {
    const syncDot = document.getElementById('syncDot');
    const syncStatusText = document.getElementById('syncStatusText');
    const syncRetry = document.getElementById('syncRetry');
    const syncItemsCount = document.getElementById('syncItemsCount');
    const syncLastTime = document.getElementById('syncLastTime');
    
    if (status === 'connected') {
        if (syncDot) syncDot.className = 'sync-dot';
        if (syncStatusText) syncStatusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncRetry) syncRetry.style.display = 'none';
        isConnected = true;
    } else if (status === 'offline') {
        if (syncDot) syncDot.className = 'sync-dot offline';
        if (syncStatusText) syncStatusText.innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
        if (syncRetry) syncRetry.style.display = 'inline-flex';
        isConnected = false;
    } else if (status === 'syncing') {
        if (syncDot) syncDot.className = 'sync-dot syncing';
        if (syncStatusText) syncStatusText.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> جاري المزامنة...';
    }
    
    if (itemCount !== null && syncItemsCount) {
        syncItemsCount.innerHTML = `<i class="fas fa-database"></i> ${itemCount} عنصر`;
    }
    
    if (lastSyncDate && syncLastTime) {
        let d = new Date(lastSyncDate);
        syncLastTime.innerHTML = `<i class="far fa-clock"></i> ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    }
}

function forceHideSplash() {
    if (splashHidden) return;
    splashHidden = true;
    const splashEl = document.getElementById('splashScreen');
    const appContainer = document.getElementById('appContainer');
    if (splashEl) {
        splashEl.classList.add('hidden');
        setTimeout(() => { splashEl.style.display = 'none'; if (appContainer) appContainer.style.display = 'block'; }, 350);
    } else { if (appContainer) appContainer.style.display = 'block'; }
}

// ==================== PWA والتثبيت ====================
function setupPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') showToast('✓ تم تثبيت التطبيق');
                deferredPrompt = null;
                if (installBtn) installBtn.style.display = 'none';
            } else { showToast('يمكنك التثبيت من قائمة المتصفح', false); }
        });
    }
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
        if (installBtn) installBtn.style.display = 'none';
    }
}

// ==================== ربط الأحداث ====================
function bindEvents() {
    // زر إضافة مادة رئيسي
    document.getElementById('mainAddBtn').onclick = () => {
        document.getElementById('newItemModal').classList.add('active');
        document.getElementById('newMaterialName').focus();
    };
    
    // زر المزامنة
    document.getElementById('syncBtn').onclick = () => {
        if (unsubscribe) unsubscribe();
        startListener();
        showToast("🔄 مزامنة يدوية");
    };
    
    // زر تغيير الثيم
    document.getElementById('themeToggle').onclick = () => {
        document.body.classList.contains('dark') ? setTheme('light') : setTheme('dark');
    };
    
    // زر النسخ الاحتياطي
    document.getElementById('backupBtn').onclick = backupData;
    
    // زر الاستعادة
    document.getElementById('restoreBtn').onclick = restoreData;
    
    // زر مسح الكل
    document.getElementById('clearAllBtn').onclick = clearAll;
    
    // زر إعادة محاولة المزامنة
    document.getElementById('syncRetry').onclick = () => {
        if (unsubscribe) unsubscribe();
        startListener();
        showToast("🔄 محاولة إعادة الاتصال...");
    };
    
    // أزرار الجداول الأربعة
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
    };
    
    // زر التوصاية
    document.getElementById('tawsayaQuickBtn').onclick = () => {
        document.getElementById('tawsayaModal').classList.add('active');
        document.getElementById('tawsayaName').focus();
    };
    
    // أزرار إغلاق النوافذ المنبثقة
    document.getElementById('closeNewModalBtn').onclick = () => {
        document.getElementById('newItemModal').classList.remove('active');
    };
    
    document.getElementById('closeImportantModalBtn').onclick = () => {
        document.getElementById('importantModal').classList.remove('active');
    };
    
    document.getElementById('closeSpicesExtraModalBtn').onclick = () => {
        document.getElementById('spicesExtraModal').classList.remove('active');
    };
    
    document.getElementById('closeQuickModalBtn').onclick = () => {
        document.getElementById('quickModal').classList.remove('active');
    };
    
    document.getElementById('closeBagsModalBtn').onclick = () => {
        document.getElementById('bagsModal').classList.remove('active');
    };
    
    document.getElementById('closeTawsayaModalBtn').onclick = () => {
        document.getElementById('tawsayaModal').classList.remove('active');
    };
    
    document.getElementById('closeEditModalBtn').onclick = () => {
        document.getElementById('editModal').classList.remove('active');
    };
    
    document.getElementById('closeSystemMessageBtn').onclick = () => {
        document.getElementById('systemMessageModal').classList.remove('active');
    };
    
    // أزرار حفظ النوافذ المنبثقة
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
        const val = e.target.value;
        const items = document.querySelectorAll('#bagsListContainer .modern-item-card');
        items.forEach(item => {
            const name = item.querySelector('.item-name')?.innerText || '';
            item.style.display = name.includes(val) ? 'flex' : 'none';
        });
    };
    
    // أزرار الكمية
    document.getElementById('decrementQty').onclick = () => {
        let val = parseFloat(document.getElementById('newQuantityValue').value) || 1;
        val = Math.max(0.25, val - 0.25);
        document.getElementById('newQuantityValue').value = val;
    };
    
    document.getElementById('incrementQty').onclick = () => {
        let val = parseFloat(document.getElementById('newQuantityValue').value) || 1;
        val = val + 0.25;
        document.getElementById('newQuantityValue').value = val;
    };
    
    // إغلاق النوافذ عند النقر خارجها
    const modalIds = ['newItemModal', 'importantModal', 'spicesExtraModal', 'quickModal', 'bagsModal', 'tawsayaModal', 'editModal', 'confirmDeleteModal', 'systemMessageModal'];
    modalIds.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }
    });
    
    // أزرار نوع الكمية في نافذة التوصاية
    const tawsayaTypeBtns = document.querySelectorAll('#tawsayaTypeGroup .unit-btn');
    const tawsayaCustomGroup = document.getElementById('tawsayaCustomQtyGroup');
    if (tawsayaTypeBtns.length && tawsayaCustomGroup) {
        tawsayaTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                tawsayaTypeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                tawsayaCustomGroup.style.display = this.getAttribute('data-type') === 'custom' ? 'block' : 'none';
            });
        });
    }
}

function setTheme(th) {
    if (th === 'dark') {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i> نهاري';
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i> ليلي';
    }
}

async function clearAll() {
    if (allMaterials.length === 0) { showToast("📭 القائمة فارغة", true); return; }
    if (!confirm("⚠️ حذف جميع المواد نهائياً؟")) return;
    try {
        let batch = db.batch();
        allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
        await batch.commit();
        showToast("✓ تم مسح القائمة");
    } catch (e) { showToast("❌ فشل المسح", true); }
}

function backupData() {
    if (allMaterials.length === 0) { showToast("📭 لا توجد بيانات للنسخ", true); return; }
    let data = JSON.stringify(allMaterials, null, 2);
    let blob = new Blob([data], { type: 'application/json' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(blob);
    showToast("💾 تم نسخ البيانات");
}

function restoreData() {
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        fileInput.onchange = async (e) => {
            let file = e.target.files[0];
            if (!file) return;
            let reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    let backup = JSON.parse(ev.target.result);
                    if (!Array.isArray(backup)) throw new Error();
                    if (confirm(`⚠️ استبدال بـ ${backup.length} عنصر؟`)) {
                        let batch = db.batch();
                        allMaterials.forEach(m => batch.delete(materialsCollection.doc(m.id)));
                        await batch.commit();
                        for (let it of backup) {
                            await materialsCollection.add({
                                name: it.name, unitType: it.unitType || 'kg', quantity: it.quantity || 1,
                                notes: it.notes || "", createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                priority: it.priority || "main"
                            });
                        }
                        showToast(`✓ تم استعادة ${backup.length} عنصر`);
                    }
                } catch (err) { showToast("❌ ملف غير صالح", true); }
            };
            reader.readAsText(file);
        };
    }
    fileInput.click();
}

// ==================== التهيئة ====================
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') setTheme('dark'); else setTheme('light');
    setupPWA();
    bindEvents();
    startListener();
    startAutoSync();
    setTimeout(() => forceHideSplash(), 3000);
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/material-manager/service-worker.js')
            .then(reg => console.log('✅ SW registered:', reg.scope))
            .catch(err => console.error('❌ SW failed:', err));
    });
                    }
