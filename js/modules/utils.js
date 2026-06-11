// ==================== دوال مساعدة ====================

function showToast(msg, isErr) {
    if (isErr === undefined) isErr = false;
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<i class="fas ' + (isErr ? 'fa-exclamation-triangle' : 'fa-check-circle') + '"></i> ' + msg;
    document.body.appendChild(toast);
    setTimeout(function() { if (toast && toast.remove) toast.remove(); }, 2500);
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
    var u = mat.unitType;
    if (u === 'kg') return mat.quantity + ' kg';
    if (u === 'half') return 'نصف كيلو';
    if (u === 'quarter') return 'ربع كيلو';
    if (u === 'oke') return 'لوقية';
    if (u === 'box') return mat.quantity + ' علبة';
    if (u === 'piece') return mat.quantity + ' عدد';
    if (u === 'bag') return mat.quantity + ' كيس';
    return mat.quantity + ' kg';
}

window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.formatDisplay = formatDisplay;
