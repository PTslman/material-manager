// constants.js - جميع البيانات من localStorage فقط

// مفاتيح التخزين
const STORAGE_KEYS = {
    IMPORTANT: 'material_important_items',
    SPICES_EXTRA: 'material_spices_items',
    EXTRA: 'material_extra_items'
};

// البيانات الافتراضية (تستخدم فقط عند عدم وجود بيانات)
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

// دوال تحميل البيانات
function loadImportantItems() {
    const saved = localStorage.getItem(STORAGE_KEYS.IMPORTANT);
    if (saved && saved !== 'undefined') {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
    }
    return [...DEFAULT_IMPORTANT];
}

function loadSpicesExtraItems() {
    const saved = localStorage.getItem(STORAGE_KEYS.SPICES_EXTRA);
    if (saved && saved !== 'undefined') {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
    }
    return [...DEFAULT_SPICES];
}

function loadExtraItems() {
    const saved = localStorage.getItem(STORAGE_KEYS.EXTRA);
    if (saved && saved !== 'undefined') {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
    }
    return [...DEFAULT_EXTRA];
}

// حفظ البيانات إلى localStorage
function saveImportantItems(items) {
    localStorage.setItem(STORAGE_KEYS.IMPORTANT, JSON.stringify(items));
}

function saveSpicesExtraItems(items) {
    localStorage.setItem(STORAGE_KEYS.SPICES_EXTRA, JSON.stringify(items));
}

function saveExtraItems(items) {
    localStorage.setItem(STORAGE_KEYS.EXTRA, JSON.stringify(items));
}

// المتغيرات العامة (تتحمل مرة واحدة عند بدء التشغيل)
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

// دالة لتحديث البيانات من localStorage (يتم استدعاؤها عند تغيير البيانات)
window.refreshConstantsData = function() {
    importantItemsList = loadImportantItems();
    spicesExtraItemsList = loadSpicesExtraItems();
    extraItemsList = loadExtraItems();
    
    // تحديث النوافذ المنبثقة إذا كانت مفتوحة
    if (window.renderImportantFiltered) {
        const searchVal = document.getElementById('importantSearchInput')?.value || '';
        window.renderImportantFiltered(searchVal);
    }
    if (window.renderSpicesExtraFiltered) {
        const searchVal = document.getElementById('spicesExtraSearchInput')?.value || '';
        window.renderSpicesExtraFiltered(searchVal);
    }
    if (window.renderQuickFiltered) {
        const searchVal = document.getElementById('quickSearchInput')?.value || '';
        window.renderQuickFiltered(searchVal);
    }
    
    console.log('✅ Constants data refreshed from localStorage');
};

// الاستماع لتغييرات localStorage
window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEYS.IMPORTANT || e.key === STORAGE_KEYS.SPICES_EXTRA || e.key === STORAGE_KEYS.EXTRA) {
        console.log('🔄 Detected external change in:', e.key);
        window.refreshConstantsData();
    }
});

console.log('📦 Constants loaded from localStorage');
