// ==================== القوائم الجاهزة المتقدمة ====================

// قائمة أساسيات
const importantItemsList = [
    "شطة حلوة", "شطة حدة وسط", "شطة بابريكا مدخنة", "توابل هندية", "فلفل اسود ناعم", "توم ناعم", "بصل ناعم",
    "جوز هند خشن", "حليب نصف دسم", "جوز امريكي", "حبة البركة", "زنجبيل خشن", "زنجبيل ناعم", "سمسم محمص",
    "سماق ناعم", "شاورما", "كركدية", "كاري", "كربونة الصوديوم", "كبسة خليجية", "كبسة ناعمة", "كركم",
    "كريمة محلاية", "كاكاو نخب اول", "كاكاو نخب ثاني", "كمون حب", "كمون ناعم", "قرفة عيدان", "قرفة ناعمة",
    "قرفة سيجار", "كزبرة ناعمة", "كزبرة حب", "قرنفل حب", "قرنفل ناعم", "اشلميش", "فستق ني ارجنتيني",
    "ملح صيني", "ملح ليمون", "ماجي اصفر", "ماجي ابيض", "مشكلة", "مشكلة بيضاء", "نشا مصري", "هيل حب خشن",
    "هيل ناعم", "نعنع يابس", "يانسون حب", "شوفان", "تمر سري"
];

// قائمة إضافي (مدموجة)
const extraItemsList = [
    // بهارات اضافية
    "بطاطا", "بروستد", "زعتر اوريغانو", "بيتزا", "جوزة الطيب حب", "جوزة الطيب ناعمة", "حلبه حب", "حلبه ناعمة",
    "خل نكهة", "خميرة فرط", "سدر ناعم", "سكر نبات", "سمك", "سجق", "سحلب", "سلطة", "شمرا ناعمة", "شمرا حب",
    "شيش", "شاورما", "كريسبي", "كليجة", "كاري", "كربونة الصوديوم", "كراوية", "مجروش الكعك", "كلس خشن",
    "قلي", "فلافل", "فاهيتا", "لبان الدكر", "لحمة عجل", "لومي", "لومي اسود", "مندي", "مكسيكي", "مشاوي",
    "مدخنة", "محاشي", "محلب", "نشا درس", "نعنع يابس", "يانسون ناعم", "يانسون نجمة", "ورق غار", "صفار زعفران",
    "صفار بيض", "فلفل اسود حب", "فلفل ابيض ناعم", "توابل هندية حارة", "طحينية", "رمان مجفف", "اندومي",
    "رز مطحون", "ماجي حبيبات", "شمرا حب",
    // محمصة
    "دوار شمس ملكي", "دوار شمس شبح", "فستق مدخن", "فستق مملح", "بذر كوسا", "بذر ابيض عريض", "بذر اصفر مصري",
    "فستق ني ارجنتيني", "لوز بقشرو", "لوز ني", "كاجو ني", "بذور الشيا", "بذور الكتان", "بذور اليقطين",
    "بذر الرشاد", "ذرة الفوشار", "خل نكهة", "جنبة نكهة", "كتشب نكهة", "بابريكا نكهة", "زعتر اخضر", "زعتر احمر",
    "كابتشينو", "ميلو", "هوت شوكلت",
    // أعشاب
    "زهرة الالماسة", "زهورات مشكلة", "زعتر بري", "كركدية", "ميرمية", "ورد جوري", "عشرق", "مرتكوش", "سنامكي",
    "بابونج", "اكليل الجبل",
    // مواد اضافية
    "ماجي ظروف", "مكعبات ماجي", "ماجي شرائح", "خميره ظروفة", "مستكه", "فانيلا ظروفة الريم", "فانيلا فرط",
    "بكمبودر ريم", "بكمبودر فرط", "تمر عجوه", "تمر سري",
    // إضافات جديدة
    "نسكافية خشنة", "نسكافية ناعمة", "قهوة عربية", "قهوة تركية", "هيل مطحون", "زعفران"
];

const bagTypesList = ["شفاف 10×12", "شفاف 20×12", "شفاف 10×20", "شفاف 25×17", "شفاف 20×30", "شفاف 35×25", "صيدلية", "أسود 30", "أسود 35", "أسود 40", "أسود 45"];

const tawsayaItemsList = [];

const presetSelections = { main: {}, extra: {}, bags: {}, tawsaya: {} };
let currentPresetCategory = 'main';

function openPresetModal(category) {
    currentPresetCategory = category;
    const titles = { 'main': 'أساسيات', 'extra': 'إضافي', 'bags': 'أكياس تعبئة', 'tawsaya': 'توصيات' };
    
    document.getElementById('presetModalTitle').innerHTML = `<i class="fas fa-list"></i> إضافة مواد جاهزة - ${titles[category]}`;
    document.getElementById('presetModal').classList.add('active');
    renderPresetList(category, '');
    document.getElementById('presetSearchInput').focus();
}

function renderPresetList(category, filter) {
    const container = document.getElementById('presetListContainer');
    if (!container) return;
    
    const itemsList = getItemsList(category);
    const filtered = itemsList.filter(item => item.includes(filter));
    const selections = presetSelections[category] || {};
    container.innerHTML = '';
    
    if (category === 'bags' || category === 'tawsaya') {
        filtered.forEach((item, idx) => {
            const originalIndex = itemsList.indexOf(item);
            const isChecked = selections[originalIndex] || false;
            container.innerHTML += `
                <div class="modern-item-card">
                    <div class="item-info">
                        <input type="checkbox" class="preset-checkbox" data-index="${originalIndex}" ${isChecked ? 'checked' : ''}>
                        <span class="item-name">${escapeHtml(item)}</span>
                    </div>
                </div>
            `;
        });
    } else {
        filtered.forEach((item, idx) => {
            const originalIndex = itemsList.indexOf(item);
            const isChecked = selections[originalIndex] || false;
            container.innerHTML += `
                <div class="modern-item-card">
                    <div class="item-info">
                        <input type="checkbox" class="preset-checkbox" data-index="${originalIndex}" ${isChecked ? 'checked' : ''}>
                        <span class="item-name">${escapeHtml(item)}</span>
                    </div>
                    <div class="quantity-modern">
                        <select class="qty-select preset-unit" data-index="${originalIndex}">
                            <option value="kg">كيلو</option>
                            <option value="half">نصف كيلو</option>
                            <option value="quarter">ربع كيلو</option>
                            <option value="oke">لوقية</option>
                            <option value="box">علبة</option>
                            <option value="piece">عدد</option>
                        </select>
                        <div class="qty-controls">
                            <button class="qty-dec-btn" data-idx="${originalIndex}">-</button>
                            <input type="number" class="qty-value-modern preset-qty" data-idx="${originalIndex}" value="1">
                            <button class="qty-inc-btn" data-idx="${originalIndex}">+</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // ربط أحداث أزرار + و -
        container.querySelectorAll('.qty-dec-btn').forEach(btn => {
            btn.onclick = function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.idx);
                const input = container.querySelector(`.preset-qty[data-idx="${idx}"]`);
                if (input) input.value = Math.max(1, (parseInt(input.value) || 1) - 1);
            };
        });
        container.querySelectorAll('.qty-inc-btn').forEach(btn => {
            btn.onclick = function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.idx);
                const input = container.querySelector(`.preset-qty[data-idx="${idx}"]`);
                if (input) input.value = (parseInt(input.value) || 1) + 1;
            };
        });
    }
    
    container.querySelectorAll('.preset-checkbox').forEach(cb => {
        cb.addEventListener('change', function(e) {
            e.stopPropagation();
            const idx = parseInt(this.dataset.index);
            if (!presetSelections[category]) presetSelections[category] = {};
            presetSelections[category][idx] = this.checked;
        });
    });
}

function getItemsList(category) {
    if (category === 'main') return importantItemsList;
    if (category === 'extra') return extraItemsList;
    if (category === 'bags') return bagTypesList;
    if (category === 'tawsaya') return tawsayaItemsList;
    return [];
}

async function addSelectedPresetItems() {
    const category = currentPresetCategory;
    const itemsList = getItemsList(category);
    const selections = presetSelections[category] || {};
    const itemsToAdd = [];
    
    for (const idx in selections) {
        if (selections[idx] === true) {
            const itemName = itemsList[parseInt(idx)];
            if (!itemName) continue;
            
            let unit = 'kg';
            let quantity = 1;
            
            if (category !== 'bags' && category !== 'tawsaya') {
                const unitSelect = document.querySelector(`.preset-unit[data-index="${idx}"]`);
                if (unitSelect) unit = unitSelect.value;
                
                if (unit === 'half') quantity = 0.5;
                else if (unit === 'quarter') quantity = 0.25;
                else if (unit === 'oke') quantity = 0.2;
                else {
                    const qtyInput = document.querySelector(`.preset-qty[data-idx="${idx}"]`);
                    if (qtyInput) quantity = parseFloat(qtyInput.value) || 1;
                }
            }
            
            itemsToAdd.push({ name: itemName, unitType: unit, quantity: quantity });
        }
    }
    
    if (itemsToAdd.length === 0) {
        showToastMessage('📦 اختر مادة واحدة على الأقل', true);
        return;
    }
    
    try {
        const batch = db.batch();
        for (const item of itemsToAdd) {
            const ref = materialsCollection.doc();
            batch.set(ref, {
                name: item.name,
                unitType: item.unitType,
                quantity: item.quantity,
                notes: category,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: category
            });
        }
        await batch.commit();
        
        showToastMessage(`✓ تم إضافة ${itemsToAdd.length} مادة بنجاح`);
        document.getElementById('presetModal').classList.remove('active');
        presetSelections[category] = {};
        
        if (typeof startListener === 'function') startListener();
    } catch(e) {
        showToastMessage('❌ فشل الإضافة', true);
    }
}

function addTawsayaItem(name, quantity, unit) {
    if (!name) return;
    tawsayaItemsList.push(name);
    showToastMessage(`✓ تم إضافة "${name}" إلى قائمة التوصيات`);
}

window.openPresetModal = openPresetModal;
window.renderPresetList = renderPresetList;
window.addSelectedPresetItems = addSelectedPresetItems;
window.addTawsayaItem = addTawsayaItem;
window.currentPresetCategory = currentPresetCategory;
window.presetSelections = presetSelections;
window.extraItemsList = extraItemsList;
