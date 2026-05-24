// utils.js
function showToast(msg, isErr = false) { 
    let t = document.querySelector('.toast'); 
    if (t) t.remove(); 
    let div = document.createElement('div'); 
    div.className = 'toast'; 
    div.style.background = isErr ? '#b91c1c' : 'var(--accent)'; 
    div.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`; 
    document.body.appendChild(div); 
    setTimeout(() => div.remove(), 2300); 
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
