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
function showSystemMessage(title, message, type) {
    if (type === undefined) type = 'info';
    var modal = document.getElementById('systemMessageModal');
    var titleEl = document.getElementById('systemMessageTitle');
    var textEl = document.getElementById('systemMessageText');
    if (titleEl) titleEl.innerText = title;
    if (textEl) textEl.innerText = message;
    var icon = modal ? modal.querySelector('.modal-icon i') : null;
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
function getSectionTitle(section) {
    var titles = {
        'main': '⭐ أساسيات', 'spices_extra': '🌿 بهارات اضافية',
        'roasted': '🔥 المحمصة', 'herbs': '🌱 الأعشاب',
        'extra': '📦 مواد اضافية', 'bags': '🛍️ أكياس تعبئة', 'tawsaya': '🎁 توصيات'
    };
    return titles[section] || section;
}
function getSectionIcon(section) {
    var icons = {
        'main': 'fas fa-star', 'spices_extra': 'fas fa-leaf', 'roasted': 'fas fa-fire',
        'herbs': 'fas fa-seedling', 'extra': 'fas fa-plus-circle', 'bags': 'fas fa-shopping-bag', 'tawsaya': 'fas fa-gift'
    };
    return icons[section] || 'fas fa-box';
}
window.showToast = showToast;
window.showSystemMessage = showSystemMessage;
window.escapeHtml = escapeHtml;
window.formatDisplay = formatDisplay;
window.getSectionTitle = getSectionTitle;
window.getSectionIcon = getSectionIcon;
