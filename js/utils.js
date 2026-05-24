// utils.js - دوال مساعدة

function showToast(msg, isErr = false) {
    let t = document.querySelector('.toast');
    if (t) t.remove();
    
    let div = document.createElement('div');
    div.className = 'toast';
    div.style.background = isErr ? '#dc2626' : '#2e7d32';
    div.style.position = 'fixed';
    div.style.bottom = '100px';
    div.style.left = '50%';
    div.style.transform = 'translateX(-50%)';
    div.style.color = 'white';
    div.style.padding = '10px 24px';
    div.style.borderRadius = '40px';
    div.style.fontSize = '0.85rem';
    div.style.zIndex = '10001';
    div.style.fontWeight = '600';
    div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    div.style.direction = 'rtl';
    div.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}" style="margin-left: 8px;"></i> ${msg}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
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
