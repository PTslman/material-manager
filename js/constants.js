// constants.js - القوائم الثابتة مع دعم التحميل من localStorage

// المفاتيح المستخدمة في localStorage
const STORAGE_KEYS = {
    IMPORTANT: 'global_important_items',
    SPICES_EXTRA: 'global_spices_items',
    EXTRA: 'global_extra_items',
    UNITS_CONFIG: 'units_config'
};

// القوائم الافتراضية (في حالة عدم وجود بيانات محفوظة)
const DEFAULT_IMPORTANT_ITEMS = [
    "شطه حلوة", "شطة حدة", "بابريكا مدخنة", "فلفل اسود ناعم", "كزبرة ناعمة",
    "كزبرة حب", "قرفة خشنة عيدان", "قرفة سيجار", "كمون ناعم", "كمون حب",
    "كاكاو نخب اول", "كاكاو نخب ثاني", "كركم", "كريمة محلاية", "كبسة ناعمة",
    "كبسة خليجية", "كاري", "مندي", "زنجبيل خشن", "زنجبيل ناعم", "سمسم",
    "سماق ناعم", "شيش", "شاورما", "حبة البركة", "ثوم ناعم", "بصل ناعم",
    "ملح ليمون", "ملح صيني", "ماجي صفراء", "ماجي بيضاء", "مشكلة", "مشكلة بيضاء",
    "نشا مصري", "هيل ناعم", "هيل حب"
];

const DEFAULT_SPICES_EXTRA_ITEMS = [
    "عصفر", "توابل هندية حارة", "صفار الزعفران", "صفار البيض", "فلفل اسود حب",
    "فلفل ابيض ناعم", "فلافل", "فاهيتا", "قرنفل ناعم", "قرنفل حب", "قرفة ناعمة",
    "قلي", "كتشب", "كراوية", "كريسبي", "بطاطا", "بروستد", "زعتر اوريجانو",
    "بيتزا", "جوزة الطيب ناعمة", "جوزة الطيب حب", "حلبة حب", "حلبة ناعمة",
    "خل نكهة", "خميرة", "لحمة خاروف", "مكسيكي", "مشاوي", "مدخنة", "محاشي",
    "نشا درس", "يانسون ناعم", "سدر ناعم", "سمك", "سجق", "سحلب", "شبة ناعمة", "نوديلز اندومي"
];

const DEFAULT_EXTRA_ITEMS = [
    "بذر دوار شمس ملكي", "بذر دوار شمس الشبح", "بذر اصفر ملكي", "بذر اسود ملكي",
    "بذر كوسا", "بذر ابيض عريض", "فستق مدخن", "فستق مملح", "ذرة الفوشار", "شوفان",
    "نعنع يابس", "نسكافية خشنة", "اشلميش", "لوز ني", "كاجو ني", "لوز بقشرو",
    "فستق ني", "لبان الدكر", "لومي", "لومي اسود", "كركدية", "زهرة الالماسة",
    "شمرا ناعمة", "شمرا حب", "زهورات مشكلة", "جوز امريكي", "تمر سري", "جوز هند خشن",
    "جوز هند ناعم", "بذور الشيا", "بذور الكتان", "بذور الرشاد", "رمان زركش"
];

// دوال تحميل البيانات من localStorage
function loadImportantItems() {
    const saved = localStorage.getItem(STORAGE_KEYS.IMPORTANT);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return [...DEFAULT_IMPORTANT_ITEMS];
}

function loadSpicesExtraItems() {
    const saved = localStorage.getItem(STORAGE_KEYS.SPICES_EXTRA);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return [...DEFAULT_SPICES_EXTRA_ITEMS];
}

function loadExtraItems() {
    const saved = localStorage.getItem(STORAGE_KEYS.EXTRA);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return [...DEFAULT_EXTRA_ITEMS];
}

// حفظ البيانات إلى localStorage
function saveImportantItems(items) {
    localStorage.setItem(STORAGE_KEYS.IMPORTANT, JSON.stringify(items));
    // تحديث المتغير العام
    window.importantItemsList = items;
}

function saveSpicesExtraItems(items) {
    localStorage.setItem(STORAGE_KEYS.SPICES_EXTRA, JSON.stringify(items));
    window.spicesExtraItemsList = items;
}

function saveExtraItems(items) {
    localStorage.setItem(STORAGE_KEYS.EXTRA, JSON.stringify(items));
    window.extraItemsList = items;
}

// المتغيرات العامة (ديناميكية)
let importantItemsList = loadImportantItems();
let spicesExtraItemsList = loadSpicesExtraItems();
let extraItemsList = loadExtraItems();

// تعريف الدوال المستخدمة في التطبيق
function getImportantItems() { 
    return importantItemsList.map(name => ({ name, type: "range", min: 1, max: 5, step: 1 })); 
}

function getExtraItems() { 
    return extraItemsList.map(name => ({ name, type: "range", min: 1, max: 10, step: 1 })); 
}

function getSpicesExtraItems() { 
    return spicesExtraItemsList.map(name => ({ name, type: "range", min: 1, max: 10, step: 1 })); 
}

// دالة لمزامنة البيانات مع localStorage (يتم استدعاؤها من صفحة الإدارة)
window.syncMaterialsData = function(important, spices, extra) {
    if (important) {
        importantItemsList = important;
        localStorage.setItem(STORAGE_KEYS.IMPORTANT, JSON.stringify(important));
    }
    if (spices) {
        spicesExtraItemsList = spices;
        localStorage.setItem(STORAGE_KEYS.SPICES_EXTRA, JSON.stringify(spices));
    }
    if (extra) {
        extraItemsList = extra;
        localStorage.setItem(STORAGE_KEYS.EXTRA, JSON.stringify(extra));
    }
    
    // إعادة تحميل القوائم في التطبيق الرئيسي
    if (window.renderAllMaterials && window.allMaterials) {
        window.renderAllMaterials(window.allMaterials);
    }
    
    console.log('✅ Data synced with main app');
};

// دالة لإعادة تحميل البيانات من localStorage
window.reloadMaterialsData = function() {
    importantItemsList = loadImportantItems();
    spicesExtraItemsList = loadSpicesExtraItems();
    extraItemsList = loadExtraItems();
    
    console.log('🔄 Materials data reloaded');
    console.log('Important items:', importantItemsList.length);
    console.log('Spices items:', spicesExtraItemsList.length);
    console.log('Extra items:', extraItemsList.length);
    
    // تحديث الواجهة
    if (window.renderAllMaterials && window.allMaterials) {
        window.renderAllMaterials(window.allMaterials);
    }
};

// عرض عدد العناصر في وحدة التحكم
console.log('📦 Constants loaded:');
console.log(`  - Important items: ${importantItemsList.length}`);
console.log(`  - Spices extra items: ${spicesExtraItemsList.length}`);
console.log(`  - Extra items: ${extraItemsList.length}`);
