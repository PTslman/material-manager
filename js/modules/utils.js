function showToast(msg, isErr = false) {
    let existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function showSystemMessage(title, message) {
    const modal = document.getElementById('systemMessageModal');
    document.getElementById('systemMessageTitle').innerText = title;
    document.getElementById('systemMessageText').innerText = message;
    if (modal) modal.classList.add('active');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[m]));
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
