// ==================== دوال مساعدة متقدمة ====================

function showToastMessage(msg, isErr = false) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function formatDisplay(mat) {
    if (!mat.quantity || mat.quantity === 0) return '⚠️ ناقصة';
    const u = mat.unitType;
    if (u === 'kg') return `${mat.quantity} kg`;
    if (u === 'half') return 'نصف كيلو';
    if (u === 'quarter') return 'ربع كيلو';
    if (u === 'oke') return 'لوقية';
    if (u === 'box') return `${mat.quantity} علبة`;
    if (u === 'piece') return `${mat.quantity} عدد`;
    if (u === 'bag') return `${mat.quantity} كيس`;
    return `${mat.quantity} kg`;
}

function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function throttle(fn, limit = 300) {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

window.showToastMessage = showToastMessage;
window.escapeHtml = escapeHtml;
window.formatDisplay = formatDisplay;
window.debounce = debounce;
window.throttle = throttle;
