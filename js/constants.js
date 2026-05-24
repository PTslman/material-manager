// constants.js - جميع البيانات من localStorage فقط

// مفاتيح التخزين
const STORAGE_KEYS = {
    IMPORTANT: 'material_important_items',
    SPICES_EXTRA: 'material_spices_items',
    EXTRA: 'material_extra_items'
};

// البيانات الافتراضية
const DEFAULT_IMPORTANT = [
    "شطه حلوة", "شطة حدة", "بابريكا مدخنة", "فلفل اسود ناعم", "كزبرة ناعمة", "كزبرة حب",
    "قرفة خشنة عيدان", "قرفة سيجار", "كمون ناعم", "كمون حب", "كاكاو نخب اول", "كاكاو نخب ثاني",
    "كركم", "كريمة محلاية", "كبسة ناعمة", "كبسة خليجية", "كاري", "مندي", "زنجبيل خشن",
    "زنجبيل ناعم", "سمسم", "سماق ناعم", "شيش", "شاورما", "حبة البركة", "ثوم ناعم", "بصل ناعم",
    "ملح ليمون", "ملح صيني", "ماجي صفراء", "ماجي بيضاء", "مشكلة", "مشكلة بيضاء", "نشا مصري",
    "هيل ناعم", "هيل حب"
];

const DEFAULT_SPICES = [
    "عصفر", "توابل هندية حارة", "صفار الزعفران", "صفار البيض", "فلفل اسود حب", "فلفل ابيض ناعم",
    "فلافل", "فاهيتا", "قرنفل ناعم", "قرنفل حب", "قرفة ناعمة", "قلي", "كتشب", "كراوية", "كريسبي",
    "بطاطا", "بروستد", "زعتر اوريجانو", "بيتزا", "جوزة الطيب ناعمة", "جوزة الطيب حب", "حلبة حب",
    "حلبة ناعمة", "خل نكهة", "خميرة", "لحمة خاروف", "مكسيكي", "مشاوي", "مدخنة", "محاشي", "نشا درس",
    "يانسون ناعم", "سدر ناعم", "سمك", "سجق", "سحلب", "شبة ناعمة", "نوديلز اندومي"
];

const DEFAULT_EXTRA = [
    "بذر دوار شمس ملكي", "بذر دوار شمس الشبح", "بذر اصفر ملكي", "بذر اسود ملكي", "بذر كوسا",
    "بذر ابيض عريض", "فستق مدخن", "فستق مملح", "ذرة الفوشار", "شوفان", "نعنع يابس", "نسكافية خشنة",
    "اشلميش", "لوز ني", "كاجو ني", "لوز بقشرو", "فستق ني", "لبان الدكر", "لومي", "لومي اسود", "كركدية",
    "زهرة الالماسة", "شمرا ناعمة", "شمرا حب", "زهورات مشكلة", "جوز امريكي", "تمر سري", "جوز هند خشن",
    "جوز هند ناعم", "بذور الشيا", "بذور الكتان", "بذور الرشاد", "رمان زركش"
];

// دوال تحميل البيانات من localStorage
function loadImportantItems() {
    const saved = localStorage.getItem(STORAGE_KEYS.IMPORTANT);
    if (saved && saved !== 'undefined') {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) { console.error('Error parsing important items:', e); }
    }
    localStorage.setItem(STORAGE_KEYS.IMPORTANT, JSON.stringify(DEFAULT_IMPORTANT));
    return [...DEFAULT_IMPORTANT];
}

function loadSpicesExtraItems() {
    const saved = localStorage.getItem(STORAGE_KEYS.SPICES_EXTRA);
    if (saved && saved !== 'undefined') {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) { console.error('Error parsing spices items:', e); }
    }
    localStorage.setItem(STORAGE_KEYS.SPICES_EXTRA, JSON.stringify(DEFAULT_SPICES));
    return [...DEFAULT_SPICES];
}

function loadExtraItems() {
    const saved = localStorage.getItem(STORAGE_KEYS.EXTRA);
    if (saved && saved !== 'undefined') {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) { console.error('Error parsing extra items:', e); }
    }
    localStorage.setItem(STORAGE_KEYS.EXTRA, JSON.stringify(DEFAULT_EXTRA));
    return [...DEFAULT_EXTRA];
}

// المتغيرات العامة
let importantItemsList = loadImportantItems();
let spicesExtraItemsList = loadSpicesExtraItems();
let extraItemsList = loadExtraItems();

// الدوال المستخدمة في التطبيق
function getImportantItems() { 
    return importantItemsList.map(name => ({ name, type: "range", min: 1, max: 5, step: 1 })); 
}

function getExtraItems() { 
    return extraItemsList.map(name => ({ name, type: "range", min: 1, max: 10, step: 1 })); 
}

function getSpicesExtraItems() { 
    return spicesExtraItemsList.map(name => ({ name, type: "range", min: 1, max: 10, step: 1 })); 
}

// دالة لإعادة تحميل البيانات من localStorage
window.refreshConstantsData = function() {
    console.log('🔄 Refreshing constants data...');
    importantItemsList = loadImportantItems();
    spicesExtraItemsList = loadSpicesExtraItems();
    extraItemsList = loadExtraItems();
    
    // تحديث النوافذ المنبثقة
    if (window.renderImportantFiltered) {
        window.renderImportantFiltered(document.getElementById('importantSearchInput')?.value || '');
    }
    if (window.renderSpicesExtraFiltered) {
        window.renderSpicesExtraFiltered(document.getElementById('spicesExtraSearchInput')?.value || '');
    }
    if (window.renderQuickFiltered) {
        window.renderQuickFiltered(document.getElementById('quickSearchInput')?.value || '');
    }
    
    if (window.showToast) window.showToast('✓ تم تحديث البيانات');
    return true;
};

// دالة لحفظ البيانات (للاستخدام من صفحات الإدارة)
window.saveMaterialsData = function(important, spices, extra) {
    if (important) {
        localStorage.setItem(STORAGE_KEYS.IMPORTANT, JSON.stringify(important));
        importantItemsList = important;
    }
    if (spices) {
        localStorage.setItem(STORAGE_KEYS.SPICES_EXTRA, JSON.stringify(spices));
        spicesExtraItemsList = spices;
    }
    if (extra) {
        localStorage.setItem(STORAGE_KEYS.EXTRA, JSON.stringify(extra));
        extraItemsList = extra;
    }
    console.log('✅ Data saved to localStorage');
    return true;
};

// الاستماع لتغييرات localStorage
window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEYS.IMPORTANT || e.key === STORAGE_KEYS.SPICES_EXTRA || e.key === STORAGE_KEYS.EXTRA) {
        console.log('🔄 Storage changed:', e.key);
        window.refreshConstantsData();
    }
});

// الاستماع للرسائل من صفحة الإدارة
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SYNC_MATERIALS_DATA') {
        console.log('📩 Received sync message');
        if (event.data.important) {
            localStorage.setItem(STORAGE_KEYS.IMPORTANT, JSON.stringify(event.data.important));
            importantItemsList = event.data.important;
        }
        if (event.data.spices) {
            localStorage.setItem(STORAGE_KEYS.SPICES_EXTRA, JSON.stringify(event.data.spices));
            spicesExtraItemsList = event.data.spices;
        }
        if (event.data.extra) {
            localStorage.setItem(STORAGE_KEYS.EXTRA, JSON.stringify(event.data.extra));
            extraItemsList = event.data.extra;
        }
        window.refreshConstantsData();
    }
});

console.log('📦 Constants loaded');
