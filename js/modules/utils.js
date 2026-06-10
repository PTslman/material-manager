// ==================== دوال مساعدة ====================

function showToast(msg, isErr = false) {
    let existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    document.body.appendChild(toast);
    
    setTimeout(function() {
        if (toast && toast.remove) toast.remove();
    }, 2500);
}

function showSystemMessage(title, message, type = 'info') {
    const modal = document.getElementById('systemMessageModal');
    const titleEl = document.getElementById('systemMessageTitle');
    const textEl = document.getElementById('systemMessageText');
    
    if (titleEl) titleEl.innerText = title;
    if (textEl) textEl.innerText = message;
    
    const icon = modal?.querySelector('.modal-icon i');
    if (icon) {
        if (type === 'error') icon.style.color = '#ef4444';
        else if (type === 'warning') icon.style.color = '#f59e0b';
        else icon.style.color = '#10b981';
    }
    
    if (modal) modal.classList.add('active');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatDisplay(mat) {
    if (!mat.quantity || mat.quantity === 0) return '⚠️ ناقصة';
    
    const u = mat.unitType;
    if (u === 'kg') return mat.quantity + ' kg';
    if (u === 'half') return 'نصف كيلو';
    if (u === 'quarter') return 'ربع كيلو';
    if (u === 'oke') return 'لوقية';
    if (u === 'box') return mat.quantity + ' علبة';
    if (u === 'piece') return mat.quantity + ' عدد';
    if (u === 'bag') return mat.quantity + ' كيس';
    
    return mat.quantity + ' kg';
}

function getSectionTitle(section) {
    const titles = {
        'main': '⭐ أساسيات',
        'spices_extra': '🌿 بهارات اضافية',
        'roasted': '🔥 المحمصة',
        'herbs': '🌱 الأعشاب',
        'extra': '📦 مواد اضافية',
        'bags': '🛍️ أكياس تعبئة',
        'tawsaya': '🎁 توصيات'
    };
    return titles[section] || section;
}

// جعل الدوال عامة
window.showToast = showToast;
window.showSystemMessage = showSystemMessage;
window.escapeHtml = escapeHtml;
window.formatDisplay = formatDisplay;
window.getSectionTitle = getSectionTitle;
window.closeAllModals = function() {
    const modals = ['newItemModal', 'presetModal', 'editModal', 'moveItemModal', 'systemMessageModal'];
    modals.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
};
