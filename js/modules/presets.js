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

let presetSelections = { main: {}, spices_extra: {}, roasted: {}, herbs: {}, extra: {}, bags: {} };
let currentPresetCategory = 'main';

function openPresetModal(category) {
    currentPresetCategory = category;
    const titles = { 'main':'أساسيات','spices_extra':'بهارات اضافية','roasted':'المحمصة','herbs':'الأعشاب','extra':'مواد اضافية','bags':'أكياس تعبئة' };
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
            container.innerHTML += `<div class="modern-item-card"><div class="item-info"><input type="checkbox" class="preset-checkbox" data-index="${idx}" ${isChecked ? 'checked' : ''}><span class="item-name">${escapeHtml(item)}</span></div></div>`;
        });
    } else {
        filtered.forEach((item, idx) => {
            const isChecked = selections[idx] || false;
            container.innerHTML += `<div class="modern-item-card">
                <div class="item-info"><input type="checkbox" class="preset-checkbox" data-index="${idx}" ${isChecked ? 'checked' : ''}><span class="item-name">${escapeHtml(item)}</span></div>
                <div class="quantity-modern">
                    <select class="qty-select preset-unit" data-index="${idx}"><option value="kg">كيلو</option><option value="half">نصف كيلو</option><option value="quarter">ربع كيلو</option><option value="oke">لوقية</option><option value="box">علبة</option><option value="piece">عدد</option></select>
                    <div class="qty-controls"><button class="qty-dec-btn" data-idx="${idx}">-</button><input type="number" class="qty-value-modern preset-qty" data-idx="${idx}" value="1"><button class="qty-inc-btn" data-idx="${idx}">+</button></div>
                </div>
            </div>`;
        });
        
        container.querySelectorAll('.qty-dec-btn').forEach(btn => {
            btn.onclick = () => { const idx = parseInt(btn.dataset.idx); const inp = container.querySelector(`.preset-qty[data-idx="${idx}"]`); if(inp) inp.value = Math.max(1, (parseInt(inp.value)||1)-1); };
        });
        container.querySelectorAll('.qty-inc-btn').forEach(btn => {
            btn.onclick = () => { const idx = parseInt(btn.dataset.idx); const inp = container.querySelector(`.preset-qty[data-idx="${idx}"]`); if(inp) inp.value = (parseInt(inp.value)||1)+1; };
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
            let unit = 'kg', quantity = 1;
            if (category !== 'bags') {
                const unitSelect = document.querySelector(`.preset-unit[data-index="${idx}"]`);
                unit = unitSelect ? unitSelect.value : 'kg';
                if (unit === 'half') quantity = 0.5;
                else if (unit === 'quarter') quantity = 0.25;
                else if (unit === 'oke') quantity = 0.2;
                else { const qtyInput = document.querySelector(`.preset-qty[data-idx="${idx}"]`); quantity = parseFloat(qtyInput ? qtyInput.value : 1); }
            }
            itemsToAdd.push({ name: itemName, unitType: unit, quantity: quantity });
        }
    }
    
    if (itemsToAdd.length === 0) { showToast("📦 اختر مادة واحدة على الأقل", true); return; }
    
    try {
        const batch = db.batch();
        itemsToAdd.forEach(it => {
            const ref = materialsCollection.doc();
            batch.set(ref, { name: it.name, unitType: it.unitType, quantity: it.quantity, notes: category, createdAt: firebase.firestore.FieldValue.serverTimestamp(), priority: category });
        });
        await batch.commit();
        showToast(`✓ تم إضافة ${itemsToAdd.length} مادة بنجاح`);
        document.getElementById('presetModal').classList.remove('active');
        presetSelections[category] = {};
        if (unsubscribe) unsubscribe();
        startListener();
    } catch(e) { showToast("❌ فشل الإضافة", true); }
      }
