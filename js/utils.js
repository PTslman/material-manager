function showToast(msg, isErr = false) {
    let t = document.querySelector('.toast');
    if (t) t.remove();
    let div = document.createElement('div');
    div.className = 'toast';
    div.style.background = isErr ? '#dc2626' : '#2e7d32';
    div.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}

function formatDisplay(mat) {
    if (mat.unitType === 'kg') return `${mat.quantity} كجم`;
    if (mat.unitType === 'half') return `نصف كيلو`;
    if (mat.unitType === 'quarter') return `ربع كيلو`;
    if (mat.unitType === 'oke') return `لوقية (200g)`;
    if (mat.unitType === 'bag') return `${mat.quantity} كيس`;
    return '';
}
