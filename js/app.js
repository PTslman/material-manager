let allMaterials = [];
let unsubscribe = null;
let currentEditId = null;
let autoSyncInterval = null;
let isDataLoaded = false;

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
    return importantItemsList.map(name => ({ name, min: 1, max: 5 })); 
}
function getSpicesExtraItems() { 
    return spicesExtraItemsList.map(name => ({ name, min: 1, max: 10 })); 
}
function getExtraItems() { 
    return extraItemsList.map(name => ({ name, min: 1, max: 10 })); 
}

// ==================== دوال مساعدة ====================
function showToast(msg, isErr = false) {
    let t = document.querySelector('.toast');
    if (t) t.remove();
    let div = document.createElement('div');
    div.className = 'toast';
    div.style.background = isErr ? '#dc2626' : '#2e7d32';
    div.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}

function formatDisplay(mat) {
    if (mat.unitType === 'kg') return `${mat.quantity} كجم`;
    if (mat.unitType === 'half') return `نصف كيلو`;
    if (mat.unitType === 'quarter') return `ربع كيلو`;
    if (mat.unitType === 'oke') return `لوقية`;
    if (mat.unitType === 'bag') return `${mat.quantity} كيس`;
    return '';
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
                materialsCollection.doc(id).delete().then(() => {
                    showToast("✅ تم حذف المادة");
                }).catch(e => showToast("❌ فشل الحذف", true));
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
    container.innerHTML = filtered.map((item, idx) => `<div class="modern-item-card"><div class="item-info"><input type="checkbox" id="imp_chk_${idx}"><span>${escapeHtml(item)}</span></div><div class="quantity-modern"><button class="qty-btn" data-idx="${idx}" data-dir="down">-</button><input type="number" id="imp_qty_${idx}" value="1" min="1" max="5" class="qty-value"><button class="qty-btn" data-idx="${idx}" data-dir="up">+</button><span>كجم</span></div></div>`).join('');
    
    document.querySelectorAll('#importantListContainer .qty-btn').forEach(btn => {
        btn.onclick = () => {
            let idx = btn.dataset.idx;
            let inp = document.getElementById(`imp_qty_${idx}`);
            let val = parseInt(inp.value);
            if (btn.dataset.dir === 'up') val = Math.min(val+1,5);
            else val = Math.max(val-1,1);
            inp.value = val;
        };
    });
}

function renderSpicesExtraFiltered(filter = '') {
    const container = document.getElementById('spicesExtraListContainer');
    if (!container) return;
    const filtered = spicesExtraItemsList.filter(item => item.includes(filter));
    container.innerHTML = filtered.map((item, idx) => `<div class="modern-item-card"><div class="item-info"><input type="checkbox" id="sp_chk_${idx}"><span>${escapeHtml(item)}</span></div><div class="quantity-modern"><button class="qty-btn" data-idx="${idx}" data-dir="down">-</button><input type="number" id="sp_qty_${idx}" value="1" min="1" max="10" class="qty-value"><button class="qty-btn" data-idx="${idx}" data-dir="up">+</button><span>كجم</span></div></div>`).join('');
    
    document.querySelectorAll('#spicesExtraListContainer .qty-btn').forEach(btn => {
        btn.onclick = () => {
            let idx = btn.dataset.idx;
            let inp = document.getElementById(`sp_qty_${idx}`);
            let val = parseInt(inp.value);
            if (btn.dataset.dir === 'up') val = Math.min(val+1,10);
            else val = Math.max(val-1,1);
            inp.value = val;
        };
    });
}

function renderQuickFiltered(filter = '') {
    const container = document.getElementById('quickListContainer');
    if (!container) return;
    const filtered = extraItemsList.filter(item => item.includes(filter));
    container.innerHTML = filtered.map((item, idx) => `<div class="modern-item-card"><div class="item-info"><input type="checkbox" id="quick_chk_${idx}"><span>${escapeHtml(item)}</span></div><div class="quantity-modern"><button class="qty-btn" data-idx="${idx}" data-dir="down">-</button><input type="number" id="quick_qty_${idx}" value="1" min="1" max="10" class="qty-value"><button class="qty-btn" data-idx="${idx}" data-dir="up">+</button><span>كجم</span></div></div>`).join('');
    
    document.querySelectorAll('#quickListContainer .qty-btn').forEach(btn => {
        btn.onclick = () => {
            let idx = btn.dataset.idx;
            let inp = document.getElementById(`quick_qty_${idx}`);
            let val = parseInt(inp.value);
            if (btn.dataset.dir === 'up') val = Math.min(val+1,10);
            else val = Math.max(val-1,1);
            inp.value = val;
        };
    });
}

function renderBags() {
    const container = document.getElementById('bagsListContainer');
    if (!container) return;
    container.innerHTML = bagTypesList.map((b, i) => `<div class="modern-item-card"><div class="item-info"><input type="checkbox" id="bag_chk_${i}"><span>${escapeHtml(b)}</span></div></div>`).join('');
}

// ==================== دوال الإضافة إلى Firebase ====================
async function addSelectedImportant() {
    console.log('📦 addSelectedImportant called');
    let items = [];
    for (let i = 0; i < importantItemsList.length; i++) {
        const chk = document.getElementById(`imp_chk_${i}`);
        if (chk && chk.checked) {
            let qty = parseInt(document.getElementById(`imp_qty_${i}`).value);
            items.push({ name: importantItemsList[i], quantity: qty });
            console.log(`✅ Selected: ${importantItemsList[i]} x ${qty}`);
        }
    }
    
    if (items.length === 0) {
        showToast("⭐ اختر مادة هامة على الأقل", true);
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
        showToast(`✓ تم إضافة ${items.length} مادة بنجاح`);
        
        // إغلاق النافذة
        document.getElementById('importantModal').classList.remove('active');
        
        // تنظيف التحديدات
        for (let i = 0; i < importantItemsList.length; i++) {
            const chk = document.getElementById(`imp_chk_${i}`);
            if (chk) chk.checked = false;
            const qtyInput = document.getElementById(`imp_qty_${i}`);
            if (qtyInput) qtyInput.value = "1";
        }
        
        // تحديث شريط الحالة
        const itemsCount = document.getElementById('syncItemsCount');
        if (itemsCount) {
            const currentCount = parseInt(itemsCount.innerText.match(/\d+/) || 0);
            itemsCount.innerHTML = `<i class="fas fa-database"></i> ${currentCount + items.length} عنصر`;
        }
        
    } catch (error) {
        console.error('Error adding items:', error);
        showToast("❌ فشل إضافة المواد", true);
    }
}

async function addSelectedSpicesExtra() {
    console.log('📦 addSelectedSpicesExtra called');
    let items = [];
    for (let i = 0; i < spicesExtraItemsList.length; i++) {
        const chk = document.getElementById(`sp_chk_${i}`);
        if (chk && chk.checked) {
            let qty = parseInt(document.getElementById(`sp_qty_${i}`).value);
            items.push({ name: spicesExtraItemsList[i], quantity: qty });
            console.log(`✅ Selected: ${spicesExtraItemsList[i]} x ${qty}`);
        }
    }
    
    if (items.length === 0) {
        showToast("🌿 اختر بهاراً على الأقل", true);
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
        showToast(`✓ تم إضافة ${items.length} بهار بنجاح`);
        
        document.getElementById('spicesExtraModal').classList.remove('active');
        
        for (let i = 0; i < spicesExtraItemsList.length; i++) {
            const chk = document.getElementById(`sp_chk_${i}`);
            if (chk) chk.checked = false;
            const qtyInput = document.getElementById(`sp_qty_${i}`);
            if (qtyInput) qtyInput.value = "1";
        }
        
    } catch (error) {
        console.error('Error adding items:', error);
        showToast("❌ فشل إضافة البهارات", true);
    }
}

async function addSelectedQuick() {
    console.log('📦 addSelectedQuick called');
    let items = [];
    for (let i = 0; i < extraItemsList.length; i++) {
        const chk = document.getElementById(`quick_chk_${i}`);
        if (chk && chk.checked) {
            let qty = parseInt(document.getElementById(`quick_qty_${i}`).value);
            items.push({ name: extraItemsList[i], quantity: qty });
            console.log(`✅ Selected: ${extraItemsList[i]} x ${qty}`);
        }
    }
    
    if (items.length === 0) {
        showToast("🌱 اختر منتجاً على الأقل", true);
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
                notes: "بذوريات وأعشاب",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: "extra"
            });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${items.length} منتج بنجاح`);
        
        document.getElementById('quickModal').classList.remove('active');
        
        for (let i = 0; i < extraItemsList.length; i++) {
            const chk = document.getElementById(`quick_chk_${i}`);
            if (chk) chk.checked = false;
            const qtyInput = document.getElementById(`quick_qty_${i}`);
            if (qtyInput) qtyInput.value = "1";
        }
        
    } catch (error) {
        console.error('Error adding items:', error);
        showToast("❌ فشل إضافة المنتجات", true);
    }
}

async function addSelectedBags() {
    console.log('📦 addSelectedBags called');
    let selected = [];
    for (let i = 0; i < bagTypesList.length; i++) {
        if (document.getElementById(`bag_chk_${i}`)?.checked) {
            selected.push(bagTypesList[i]);
            console.log(`✅ Selected bag: ${bagTypesList[i]}`);
        }
    }
    
    if (selected.length === 0) {
        showToast("📦 اختر نوع كيس على الأقل", true);
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
        showToast(`✓ تم إضافة ${selected.length} نوع كيس بنجاح`);
        
        document.getElementById('bagsModal').classList.remove('active');
        
        for (let i = 0; i < bagTypesList.length; i++) {
            const chk = document.getElementById(`bag_chk_${i}`);
            if (chk) chk.checked = false;
        }
        
    } catch (error) {
        console.error('Error adding bags:', error);
        showToast("❌ فشل إضافة الأكياس", true);
    }
}

async function addTawsaya() {
    let name = document.getElementById('tawsayaName')?.value.trim();
    if (!name) {
        showToast("✏️ اكتب اسم المنتج", true);
        return;
    }
    
    let type = document.querySelector('#tawsayaTypeGroup .unit-btn.active')?.getAttribute('data-type');
    let qty = 1;
    
    if (type === 'kg') {
        qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    } else if (type === 'half') {
        qty = 0.5;
    } else {
        qty = parseFloat(document.getElementById('tawsayaCustomQty')?.value) || 1;
    }
    
    if (isNaN(qty) || qty <= 0) {
        showToast("🔢 كمية صحيحة", true);
        return;
    }
    
    try {
        await materialsCollection.add({
            name: name,
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
        
    } catch (error) {
        console.error('Error adding tawsaya:', error);
        showToast("❌ فشل إضافة التوصاية", true);
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
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast("❌ فشل التحديث", true);
    }
}

async function addNewMaterialDirect() {
    let name = document.getElementById('newMaterialName')?.value.trim();
    if (!name) {
        showToast("✏️ اكتب اسم المادة", true);
        return;
    }
    let quantity = parseFloat(document.getElementById('newQuantityValue')?.value);
    if (isNaN(quantity) || quantity <= 0) {
        showToast("🔢 كمية صحيحة", true);
        return;
    }
    try {
        await materialsCollection.add({
            name: name,
            unitType: 'kg',
            quantity: quantity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            priority: "main"
        });
        showToast(`✓ تمت إضافة "${name}"`);
        
        document.getElementById('newMaterialName').value = "";
        document.getElementById('newQuantityValue').value = "1";
        document.getElementById('newItemModal').classList.remove('active');
        
    } catch (error) {
        console.error('Error adding material:', error);
        showToast("❌ خطأ في الاتصال", true);
    }
}

// ==================== المزامنة مع Firebase ====================
function startListener() {
    console.log('🔄 بدء المزامنة مع Firebase...');
    
    const query = materialsCollection.orderBy('createdAt', 'desc');
    
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
    
    unsubscribe = query.onSnapshot((snapshot) => {
        const list = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            list.push({ 
                id: doc.id, 
                name: data.name, 
                unitType: data.unitType, 
                quantity: data.quantity, 
                notes: data.notes || "", 
                createdAt: data.createdAt, 
                priority: data.priority || "main" 
            });
        });
        allMaterials = list;
        
        console.log('✅ تم تحميل البيانات:', list.length, 'عنصر');
        
        // تحديث واجهة المستخدم
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        const itemsCount = document.getElementById('syncItemsCount');
        const syncTime = document.getElementById('syncLastTime');
        
        if (statusText) statusText.innerHTML = '<i class="fas fa-check-circle"></i> متصل';
        if (syncDot) syncDot.className = 'sync-dot';
        if (itemsCount) itemsCount.innerHTML = `<i class="fas fa-database"></i> ${list.length} عنصر`;
        if (syncTime) syncTime.innerHTML = `<i class="far fa-clock"></i> ${new Date().toLocaleTimeString()}`;
        
        renderAllMaterials(allMaterials);
        
        // إخفاء شاشة البداية بعد تحميل البيانات
        if (!isDataLoaded) {
            isDataLoaded = true;
            hideSplashScreen();
        }
        
    }, (error) => {
        console.error('❌ خطأ في المزامنة:', error);
        const statusText = document.getElementById('syncStatusText');
        const syncDot = document.getElementById('syncDot');
        if (statusText) statusText.innerHTML = '<i class="fas fa-wifi-slash"></i> غير متصل';
        if (syncDot) syncDot.className = 'sync-dot offline';
        
        if (!isDataLoaded) {
            isDataLoaded = true;
            setTimeout(hideSplashScreen, 3000);
        }
    });
}

function hideSplashScreen() {
    const splash = document.getElementById('splashScreen');
    const app = document.getElementById('appContainer');
    if (splash && app) {
        splash.classList.add('hidden');
        setTimeout(() => {
            splash.style.display = 'none';
            app.style.display = 'block';
            console.log('✅ تم فتح التطبيق');
        }, 500);
    }
}

function startAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
    
    autoSyncInterval = setInterval(function() {
        console.log('🔄 مزامنة تلقائية:', new Date().toLocaleTimeString());
        
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
        startListener();
        
    }, 30000);
    
    console.log('✅ المزامنة التلقائية مفعلة (كل 30 ثانية)');
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
        showToast("🔄 جاري المزامنة...");
    };
    
    // زر تغيير الثيم
    document.getElementById('themeToggle').onclick = () => {
        document.body.classList.toggle('dark');
    };
    
    // زر النسخ الاحتياطي
    document.getElementById('backupBtn').onclick = () => {
        if (allMaterials.length === 0) {
            showToast("📭 لا توجد بيانات", true);
            return;
        }
        let data = JSON.stringify(allMaterials, null, 2);
        let blob = new Blob([data]);
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup_${new Date().toISOString().slice(0,19)}.json`;
        a.click();
        showToast("💾 تم نسخ البيانات");
    };
    
    // زر الاستعادة
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
                        for (let it of backup) {
                            await materialsCollection.add(it);
                        }
                        showToast("✓ تم الاستعادة");
                        if (unsubscribe) unsubscribe();
                        startListener();
                    }
                } catch(e) {
                    showToast("❌ ملف غير صالح", true);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    
    // زر مسح الكل
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
        document.getElementById('bagsSearchInput').focus();
    };
    
    document.getElementById('tawsayaQuickBtn').onclick = () => {
        document.getElementById('tawsayaModal').classList.add('active');
        document.getElementById('tawsayaName').focus();
    };
    
    // أزرار إضافة المحددة في النوافذ
    const saveImportantBtn = document.getElementById('saveImportantBtn');
    if (saveImportantBtn) {
        saveImportantBtn.onclick = addSelectedImportant;
        console.log('✅ saveImportantBtn bound');
    }
    
    const saveSpicesExtraBtn = document.getElementById('saveSpicesExtraBtn');
    if (saveSpicesExtraBtn) {
        saveSpicesExtraBtn.onclick = addSelectedSpicesExtra;
        console.log('✅ saveSpicesExtraBtn bound');
    }
    
    const saveQuickBtn = document.getElementById('saveQuickBtn');
    if (saveQuickBtn) {
        saveQuickBtn.onclick = addSelectedQuick;
        console.log('✅ saveQuickBtn bound');
    }
    
    const saveBagsBtn = document.getElementById('saveBagsBtn');
    if (saveBagsBtn) {
        saveBagsBtn.onclick = addSelectedBags;
        console.log('✅ saveBagsBtn bound');
    }
    
    const saveTawsayaBtn = document.getElementById('saveTawsayaBtn');
    if (saveTawsayaBtn) {
        saveTawsayaBtn.onclick = addTawsaya;
        console.log('✅ saveTawsayaBtn bound');
    }
    
    const saveNewItemBtn = document.getElementById('saveNewItemBtn');
    if (saveNewItemBtn) {
        saveNewItemBtn.onclick = addNewMaterialDirect;
        console.log('✅ saveNewItemBtn bound');
    }
    
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.onclick = saveEdit;
        console.log('✅ saveEditBtn bound');
    }
    
    // أزرار الإغلاق
    const closeModalButtons = [
        'closeNewModalBtn', 'closeImportantModalBtn', 'closeSpicesExtraModalBtn',
        'closeQuickModalBtn', 'closeBagsModalBtn', 'closeTawsayaModalBtn',
        'closeEditModalBtn', 'closeSystemMessageBtn', 'cancelDeleteBtn'
    ];
    
    closeModalButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.onclick = () => {
                const modalId = btnId.replace('close', '').replace('ModalBtn', 'Modal').replace('cancelDeleteBtn', 'confirmDeleteModal');
                const modal = document.getElementById(modalId);
                if (modal) modal.classList.remove('active');
            };
        }
    });
    
    // أزرار البحث
    const importantSearch = document.getElementById('importantSearchInput');
    if (importantSearch) {
        importantSearch.oninput = (e) => renderImportantFiltered(e.target.value);
    }
    
    const spicesExtraSearch = document.getElementById('spicesExtraSearchInput');
    if (spicesExtraSearch) {
        spicesExtraSearch.oninput = (e) => renderSpicesExtraFiltered(e.target.value);
    }
    
    const quickSearch = document.getElementById('quickSearchInput');
    if (quickSearch) {
        quickSearch.oninput = (e) => renderQuickFiltered(e.target.value);
    }
    
    const bagsSearch = document.getElementById('bagsSearchInput');
    if (bagsSearch) {
        bagsSearch.oninput = (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = document.querySelectorAll('#bagsListContainer .modern-item-card');
            items.forEach(item => {
                const name = item.querySelector('.item-name')?.innerText.toLowerCase() || '';
                item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
            });
        };
    }
    
    // أزرار الكمية
    const decrementQty = document.getElementById('decrementQty');
    const incrementQty = document.getElementById('incrementQty');
    const newQuantityValue = document.getElementById('newQuantityValue');
    
    if (decrementQty) {
        decrementQty.onclick = () => {
            let val = parseFloat(newQuantityValue?.value) || 1;
            val = Math.max(0.25, val - 0.25);
            if (newQuantityValue) newQuantityValue.value = val;
        };
    }
    
    if (incrementQty) {
        incrementQty.onclick = () => {
            let val = parseFloat(newQuantityValue?.value) || 1;
            val = val + 0.25;
            if (newQuantityValue) newQuantityValue.value = val;
        };
    }
    
    // إغلاق النوافذ عند النقر خارجها
    const modals = ['newItemModal', 'importantModal', 'spicesExtraModal', 'quickModal', 'bagsModal', 'tawsayaModal', 'editModal', 'confirmDeleteModal', 'systemMessageModal'];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    });
    
    console.log('✅ All events bound successfully');
}

// ==================== التهيئة ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 تشغيل التطبيق...');
    bindEvents();
    startListener();
    startAutoSync();
});
