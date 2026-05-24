window.showToast = function(msg, isErr = false) {
    let t = document.querySelector('.toast');
    if (t) t.remove();
    
    let div = document.createElement('div');
    div.className = 'toast';
    div.style.background = isErr ? '#dc2626' : '#2e7d32';
    div.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}" style="margin-left: 8px;"></i> ${msg}`;
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 2500);
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatDisplay(mat) {
    const u = mat.unitType;
    if (u === 'kg') return `${mat.quantity} كجم`;
    if (u === 'half') return `نصف كيلو`;
    if (u === 'quarter') return `ربع كيلو`;
    if (u === 'oke') return `لوقية (200g)`;
    if (u === 'bag') return `${mat.quantity} كيس`;
    return '';
}
