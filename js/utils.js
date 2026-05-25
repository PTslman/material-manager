// ==================== utils.js - دوال مساعدة ====================

/**
 * عرض رسالة منبثقة (Toast)
 * @param {string} msg - نص الرسالة
 * @param {boolean} isErr - هل هي رسالة خطأ (true) أم نجاح (false)
 */
function showToast(msg, isErr = false) {
    // إزالة أي رسالة موجودة مسبقاً
    let existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // إنشاء عنصر الرسالة
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isErr ? '#dc2626' : '#2e7d32'};
        color: white;
        padding: 10px 24px;
        border-radius: 9999px;
        font-size: 0.85rem;
        z-index: 10001;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: fadeUp 0.2s ease;
        direction: rtl;
        white-space: nowrap;
        font-family: 'Inter', 'Tajawal', sans-serif;
    `;
    
    // إضافة الأيقونة والنص
    const iconClass = isErr ? 'fa-exclamation-triangle' : 'fa-check-circle';
    toast.innerHTML = `<i class="fas ${iconClass}" style="margin-left: 8px;"></i> ${msg}`;
    
    // إضافة إلى الصفحة
    document.body.appendChild(toast);
    
    // إزالة بعد 2.5 ثانية
    setTimeout(() => {
        if (toast && toast.remove) toast.remove();
    }, 2500);
}

/**
 * تحويل النص إلى صيغة آمنة لمنع XSS
 * @param {string} str - النص الأصلي
 * @returns {string} النص بعد التحويل
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * تنسيق عرض الكمية حسب الوحدة
 * @param {Object} mat - كائن المادة
 * @returns {string} النص المنسق
 */
function formatDisplay(mat) {
    if (!mat) return '';
    
    const unitType = mat.unitType || 'kg';
    const quantity = mat.quantity || 0;
    
    switch(unitType) {
        case 'kg':
            return `${quantity} kg`;
        case 'half':
            return `نصف كيلو (0.5 kg)`;
        case 'quarter':
            return `ربع كيلو (0.25 kg)`;
        case 'oke':
            return `لوقية (0.2 kg)`;
        case 'box':
            return `${quantity} علبة`;
        case 'piece':
            return `${quantity} عدد`;
        case 'bag':
            return `${quantity} كيس`;
        default:
            return `${quantity} kg`;
    }
}

/**
 * الحصول على رمز الوحدة للعرض
 * @param {string} unit - نوع الوحدة
 * @returns {string} رمز الوحدة
 */
function getUnitSymbol(unit) {
    switch(unit) {
        case 'kg': return 'kg';
        case 'half': return 'نصف كيلو';
        case 'quarter': return 'ربع كيلو';
        case 'oke': return 'لوقية';
        case 'box': return 'علبة';
        case 'piece': return 'عدد';
        case 'bag': return 'كيس';
        default: return 'kg';
    }
}

/**
 * الحصول على قيمة الوحدة بالكيلوغرام
 * @param {string} unit - نوع الوحدة
 * @param {number} quantity - الكمية
 * @returns {number} القيمة بالكيلوغرام
 */
function getUnitValueInKg(unit, quantity = 1) {
    switch(unit) {
        case 'kg': return quantity;
        case 'half': return 0.5;
        case 'quarter': return 0.25;
        case 'oke': return 0.2;
        case 'box': return quantity;
        case 'piece': return quantity;
        case 'bag': return quantity;
        default: return quantity;
    }
}

/**
 * تنسيق التاريخ والوقت
 * @param {Date} date - التاريخ
 * @returns {string} التاريخ والوقت المنسق
 */
function formatDateTime(date) {
    if (!date) return '--:--:--';
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} صحة البريد
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * نسخ النص إلى الحافظة
 * @param {string} text - النص المراد نسخه
 * @returns {Promise<boolean>} نجاح العملية
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('✓ تم النسخ');
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('❌ فشل النسخ', true);
        return false;
    }
}

/**
 * تصدير البيانات كملف JSON
 * @param {Object} data - البيانات المراد تصديرها
 * @param {string} filename - اسم الملف
 */
function exportToJSON(data, filename = 'export.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ تم التصدير');
}

/**
 * قراءة ملف JSON
 * @param {File} file - الملف المراد قراءته
 * @returns {Promise<Object>} محتوى الملف
 */
function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * إضافة تأثير اهتزاز للعنصر
 * @param {HTMLElement} element - العنصر المراد اهتزازه
 */
function shakeElement(element) {
    if (!element) return;
    element.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 300);
}

/**
 * تحديث عدد العناصر في شريط الحالة
 * @param {number} count - عدد العناصر
 */
function updateItemsCount(count) {
    const itemsCountSpan = document.getElementById('syncItemsCount');
    if (itemsCountSpan) {
        itemsCountSpan.innerHTML = `<i class="fas fa-database"></i> ${count} عنصر`;
    }
}

/**
 * تحديث وقت آخر مزامنة
 */
function updateLastSyncTime() {
    const syncTimeSpan = document.getElementById('syncLastTime');
    if (syncTimeSpan) {
        syncTimeSpan.innerHTML = `<i class="far fa-clock"></i> ${formatDateTime(new Date())}`;
    }
}

/**
 * تبديل حالة التحميل لزر
 * @param {HTMLElement} button - الزر
 * @param {boolean} isLoading - حالة التحميل
 * @param {string} originalText - النص الأصلي
 */
function toggleButtonLoading(button, isLoading, originalText = null) {
    if (!button) return;
    
    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.classList.add('loading');
        button.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> جاري...';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        button.innerHTML = button.dataset.originalText || (originalText || button.innerHTML);
    }
}

// تصدير الدوال للنطاق العام
window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.formatDisplay = formatDisplay;
window.getUnitSymbol = getUnitSymbol;
window.getUnitValueInKg = getUnitValueInKg;
window.formatDateTime = formatDateTime;
window.isValidEmail = isValidEmail;
window.copyToClipboard = copyToClipboard;
window.exportToJSON = exportToJSON;
window.readJSONFile = readJSONFile;
window.shakeElement = shakeElement;
window.updateItemsCount = updateItemsCount;
window.updateLastSyncTime = updateLastSyncTime;
window.toggleButtonLoading = toggleButtonLoading;

console.log('✅ utils.js loaded successfully');
