// ==================== القوائم الجاهزة ====================

// قائمة أساسيات
var importantItemsList = [
    "شطة حلوة", "شطة حدة وسط", "شطة بابريكا مدخنة", "توابل هندية", "فلفل اسود ناعم", "توم ناعم", "بصل ناعم",
    "جوز هند خشن", "حليب نصف دسم", "جوز امريكي", "حبة البركة", "زنجبيل خشن", "زنجبيل ناعم", "سمسم محمص",
    "سماق ناعم", "شاورما", "كركدية", "كاري", "كربونة الصوديوم", "كبسة خليجية", "كبسة ناعمة", "كركم",
    "كريمة محلاية", "كاكاو نخب اول", "كاكاو نخب ثاني", "كمون حب", "كمون ناعم", "قرفة عيدان", "قرفة ناعمة",
    "قرفة سيجار", "كزبرة ناعمة", "كزبرة حب", "قرنفل حب", "قرنفل ناعم", "اشلميش", "فستق ني ارجنتيني",
    "ملح صيني", "ملح ليمون", "ماجي اصفر", "ماجي ابيض", "مشكلة", "مشكلة بيضاء", "نشا مصري", "هيل حب خشن",
    "هيل ناعم", "نعنع يابس", "يانسون حب", "شوفان", "تمر سري"
];

// دمج جميع القوائم الإضافية في قائمة واحدة
var extraItemsList = [
    "بطاطا", "بروستد", "زعتر اوريغانو", "بيتزا", "جوزة الطيب حب", "جوزة الطيب ناعمة", "حلبه حب", "حلبه ناعمة",
    "خل نكهة", "خميرة فرط", "سدر ناعم", "سكر نبات", "سمك", "سجق", "سحلب", "سلطة", "شمرا ناعمة", "شمرا حب",
    "شيش", "شاورما", "كريسبي", "كليجة", "كاري", "كربونة الصوديوم", "كراوية", "مجروش الكعك", "كلس خشن",
    "قلي", "فلافل", "فاهيتا", "لبان الدكر", "لحمة عجل", "لومي", "لومي اسود", "مندي", "مكسيكي", "مشاوي",
    "مدخنة", "محاشي", "محلب", "نشا درس", "نعنع يابس", "يانسون ناعم", "يانسون نجمة", "ورق غار", "صفار زعفران",
    "صفار بيض", "فلفل اسود حب", "فلفل ابيض ناعم", "توابل هندية حارة", "طحينية", "رمان مجفف", "اندومي",
    "رز مطحون", "ماجي حبيبات", "شمرا حب",
    "دوار شمس ملكي", "دوار شمس شبح", "فستق مدخن", "فستق مملح", "بذر كوسا", "بذر ابيض عريض", "بذر اصفر مصري",
    "فستق ني ارجنتيني", "لوز بقشرو", "لوز ني", "كاجو ني", "بذور الشيا", "بذور الكتان", "بذور اليقطين",
    "بذر الرشاد", "ذرة الفوشار", "خل نكهة", "جنبة نكهة", "كتشب نكهة", "بابريكا نكهة", "زعتر اخضر", "زعتر احمر",
    "كابتشينو", "ميلو", "هوت شوكلت",
    "زهرة الالماسة", "زهورات مشكلة", "زعتر بري", "كركدية", "ميرمية", "ورد جوري", "عشرق", "مرتكوش", "سنامكي",
    "بابونج", "اكليل الجبل",
    "ماجي ظروف", "مكعبات ماجي", "ماجي شرائح", "خميره ظروفة", "مستكه", "فانيلا ظروفة الريم", "فانيلا فرط",
    "بكمبودر ريم", "بكمبودر فرط", "تمر عجوه", "تمر سري"
];

var bagTypesList = ["شفاف 10×12", "شفاف 20×12", "شفاف 10×20", "شفاف 25×17", "شفاف 20×30", "شفاف 35×25", "صيدلية", "أسود 30", "أسود 35", "أسود 40", "أسود 45"];

var tawsayaItemsList = [];

var presetSelections = { main: {}, extra: {}, bags: {}, tawsaya: {} };
var currentPresetCategory = 'main';

function openPresetModal(category) {
    currentPresetCategory = category;
    var titles = { 'main': 'أساسيات', 'extra': 'إضافي', 'bags': 'أكياس تعبئة', 'tawsaya': 'توصيات' };
    
    var modalTitle = document.getElementById('presetModalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-list"></i> إضافة مواد جاهزة - ' + titles[category];
    }
    
    var modal = document.getElementById('presetModal');
    if (modal) modal.classList.add('active');
    
    renderPresetList(category, '');
    
    var searchInput = document.getElementById('presetSearchInput');
    if (searchInput) searchInput.focus();
}

function renderPresetList(category, filter) {
    var container = document.getElementById('presetListContainer');
    if (!container) return;
    
    var itemsList = [];
    if (category === 'main') itemsList = importantItemsList;
    else if (category === 'extra') itemsList = extraItemsList;
    else if (category === 'bags') itemsList = bagTypesList;
    else if (category === 'tawsaya') itemsList = tawsayaItemsList;
    
    var filtered = [];
    for (var i = 0; i < itemsList.length; i++) {
        if (itemsList[i].includes(filter)) {
            filtered.push(itemsList[i]);
        }
    }
    
    var selections = presetSelections[category] || {};
    container.innerHTML = '';
    
    if (category === 'bags' || category === 'tawsaya') {
        for (var i = 0; i < filtered.length; i++) {
            var item = filtered[i];
            var originalIndex = itemsList.indexOf(item);
            var isChecked = selections[originalIndex] || false;
            
            container.innerHTML += '<div class="modern-item-card" data-original-index="' + originalIndex + '">' +
                '<div class="item-info">' +
                    '<input type="checkbox" class="preset-checkbox" data-index="' + originalIndex + '" ' + (isChecked ? 'checked' : '') + '>' +
                    '<span class="item-name">' + escapeHtml(item) + '</span>' +
                '</div>' +
            '</div>';
        }
    } else {
        for (var i = 0; i < filtered.length; i++) {
            var item = filtered[i];
            var originalIndex = itemsList.indexOf(item);
            var isChecked = selections[originalIndex] || false;
            
            container.innerHTML += '<div class="modern-item-card" data-original-index="' + originalIndex + '">' +
                '<div class="item-info">' +
                    '<input type="checkbox" class="preset-checkbox" data-index="' + originalIndex + '" ' + (isChecked ? 'checked' : '') + '>' +
                    '<span class="item-name">' + escapeHtml(item) + '</span>' +
                '</div>' +
                '<div class="quantity-modern">' +
                    '<select class="qty-select preset-unit" data-index="' + originalIndex + '">' +
                        '<option value="kg">كيلو</option>' +
                        '<option value="half">نصف كيلو</option>' +
                        '<option value="quarter">ربع كيلو</option>' +
                        '<option value="oke">لوقية</option>' +
                        '<option value="box">علبة</option>' +
                        '<option value="piece">عدد</option>' +
                    '</select>' +
                    '<div class="qty-controls">' +
                        '<button class="qty-dec-btn" data-idx="' + originalIndex + '">-</button>' +
                        '<input type="number" class="qty-value-modern preset-qty" data-idx="' + originalIndex + '" value="1">' +
                        '<button class="qty-inc-btn" data-idx="' + originalIndex + '">+</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }
        
        var decBtns = container.querySelectorAll('.qty-dec-btn');
        for (var i = 0; i < decBtns.length; i++) {
            decBtns[i].onclick = function(e) {
                e.stopPropagation();
                var idx = parseInt(this.getAttribute('data-idx'));
                var input = container.querySelector('.preset-qty[data-idx="' + idx + '"]');
                if (input) {
                    var val = parseInt(input.value) || 1;
                    input.value = Math.max(1, val - 1);
                }
            };
        }
        
        var incBtns = container.querySelectorAll('.qty-inc-btn');
        for (var i = 0; i < incBtns.length; i++) {
            incBtns[i].onclick = function(e) {
                e.stopPropagation();
                var idx = parseInt(this.getAttribute('data-idx'));
                var input = container.querySelector('.preset-qty[data-idx="' + idx + '"]');
                if (input) {
                    var val = parseInt(input.value) || 1;
                    input.value = val + 1;
                }
            };
        }
    }
    
    var checkboxes = container.querySelectorAll('.preset-checkbox');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', function(e) {
            e.stopPropagation();
            var idx = parseInt(this.getAttribute('data-index'));
            if (!presetSelections[category]) {
                presetSelections[category] = {};
            }
            presetSelections[category][idx] = this.checked;
        });
    }
}

async function addSelectedPresetItems() {
    var category = currentPresetCategory;
    
    var itemsList = [];
    if (category === 'main') itemsList = importantItemsList;
    else if (category === 'extra') itemsList = extraItemsList;
    else if (category === 'bags') itemsList = bagTypesList;
    else if (category === 'tawsaya') itemsList = tawsayaItemsList;
    
    var selections = presetSelections[category] || {};
    var itemsToAdd = [];
    
    for (var idx in selections) {
        if (selections[idx] === true) {
            var itemName = itemsList[parseInt(idx)];
            if (!itemName) continue;
            
            var unit = 'kg';
            var quantity = 1;
            
            if (category !== 'bags' && category !== 'tawsaya') {
                var unitSelect = document.querySelector('.preset-unit[data-index="' + idx + '"]');
                if (unitSelect) unit = unitSelect.value;
                
                if (unit === 'half') quantity = 0.5;
                else if (unit === 'quarter') quantity = 0.25;
                else if (unit === 'oke') quantity = 0.2;
                else {
                    var qtyInput = document.querySelector('.preset-qty[data-idx="' + idx + '"]');
                    if (qtyInput) quantity = parseFloat(qtyInput.value) || 1;
                }
            }
            
            itemsToAdd.push({ name: itemName, unitType: unit, quantity: quantity });
        }
    }
    
    if (itemsToAdd.length === 0) {
        if (typeof showToastMessage === 'function') showToastMessage('📦 اختر مادة واحدة على الأقل', true);
        return;
    }
    
    try {
        var batch = db.batch();
        for (var i = 0; i < itemsToAdd.length; i++) {
            var it = itemsToAdd[i];
            var ref = materialsCollection.doc();
            batch.set(ref, { 
                name: it.name, 
                unitType: it.unitType, 
                quantity: it.quantity, 
                notes: category, 
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
                priority: category 
            });
        }
        await batch.commit();
        
        if (typeof showToastMessage === 'function') showToastMessage('✓ تم إضافة ' + itemsToAdd.length + ' مادة بنجاح');
        
        var modal = document.getElementById('presetModal');
        if (modal) modal.classList.remove('active');
        
        presetSelections[category] = {};
        
        if (typeof startListener === 'function') startListener();
        
    } catch(e) {
        if (typeof showToastMessage === 'function') showToastMessage('❌ فشل الإضافة', true);
    }
}

function addTawsayaItem(name, quantity, unit) {
    if (!name) return;
    tawsayaItemsList.push(name);
    if (typeof showToastMessage === 'function') showToastMessage('✓ تم إضافة "' + name + '" إلى قائمة التوصيات');
}

window.openPresetModal = openPresetModal;
window.renderPresetList = renderPresetList;
window.addSelectedPresetItems = addSelectedPresetItems;
window.addTawsayaItem = addTawsayaItem;
window.currentPresetCategory = currentPresetCategory;
window.presetSelections = presetSelections;
window.extraItemsList = extraItemsList;
