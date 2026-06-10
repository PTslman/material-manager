// ==================== نظام الضغطة المطولة لنقل المواد ====================

let longPressTimer = null;
let selectedMaterialId = null;
let selectedMaterialName = null;
let selectedMaterialSection = null;

function initLongPressSystem() {
    const materials = document.querySelectorAll('.material-card');
    
    materials.forEach(card => {
        card.removeEventListener('touchstart', handleTouchStart);
        card.removeEventListener('touchend', handleTouchEnd);
        card.removeEventListener('touchmove', handleTouchMove);
        card.removeEventListener('mousedown', handleMouseDown);
        card.removeEventListener('mouseup', handleMouseUp);
        card.removeEventListener('mouseleave', handleMouseLeave);
        
        card.addEventListener('touchstart', handleTouchStart);
        card.addEventListener('touchend', handleTouchEnd);
        card.addEventListener('touchmove', handleTouchMove);
        card.addEventListener('mousedown', handleMouseDown);
        card.addEventListener('mouseup', handleMouseUp);
        card.addEventListener('mouseleave', handleMouseLeave);
    });
}

function handleTouchStart(e) {
    const card = this;
    const materialId = card.getAttribute('data-id');
    const materialName = card.getAttribute('data-name') || card.querySelector('.card-title span')?.innerText || '';
    const materialSection = card.closest('.priority-section')?.getAttribute('data-section') || '';
    
    selectedMaterialId = materialId;
    selectedMaterialName = materialName;
    selectedMaterialSection = materialSection;
    
    card.style.transform = 'scale(0.98)';
    card.style.transition = 'transform 0.1s ease';
    
    longPressTimer = setTimeout(() => {
        card.classList.add('long-press-active');
        openMoveModal(materialId, materialName, materialSection);
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }, 500);
}

function handleTouchEnd(e) {
    const card = this;
    card.style.transform = '';
    card.classList.remove('long-press-active');
    
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function handleTouchMove(e) {
    const card = this;
    card.style.transform = '';
    card.classList.remove('long-press-active');
    
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function handleMouseDown(e) {
    e.preventDefault();
    
    const card = this;
    const materialId = card.getAttribute('data-id');
    const materialName = card.getAttribute('data-name') || card.querySelector('.card-title span')?.innerText || '';
    const materialSection = card.closest('.priority-section')?.getAttribute('data-section') || '';
    
    selectedMaterialId = materialId;
    selectedMaterialName = materialName;
    selectedMaterialSection = materialSection;
    
    card.style.transform = 'scale(0.98)';
    card.style.transition = 'transform 0.1s ease';
    
    longPressTimer = setTimeout(() => {
        card.classList.add('long-press-active');
        openMoveModal(materialId, materialName, materialSection);
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }, 500);
}

function handleMouseUp(e) {
    const card = this;
    card.style.transform = '';
    card.classList.remove('long-press-active');
    
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function handleMouseLeave(e) {
    const card = this;
    card.style.transform = '';
    card.classList.remove('long-press-active');
    
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function openMoveModal(materialId, materialName, currentSection) {
    if (!materialId || !materialName) return;
    
    const nameInput = document.getElementById('moveItemName');
    const sectionSelect = document.getElementById('moveTargetSection');
    
    if (nameInput) nameInput.value = materialName;
    if (sectionSelect) {
        sectionSelect.value = currentSection;
    }
    
    window.moveData = {
        id: materialId,
        name: materialName,
        currentSection: currentSection
    };
    
    const modal = document.getElementById('moveItemModal');
    if (modal) modal.classList.add('active');
}

async function executeMoveMaterial() {
    if (!window.moveData) {
        showToastMessage("❌ حدث خطأ، يرجى المحاولة مرة أخرى", true);
        return;
    }
    
    const targetSection = document.getElementById('moveTargetSection').value;
    const { id, name, currentSection } = window.moveData;
    
    if (!targetSection || currentSection === targetSection) {
        showToastMessage("⚠️ المادة موجودة بالفعل في هذا القسم", false);
        closeMoveModal();
        return;
    }
    
    showToastMessage(`🔄 جاري نقل "${name}"...`, false);
    
    try {
        await materialsCollection.doc(id).update({ 
            priority: targetSection,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (window.aiEngine) {
            window.aiEngine.learnFromAction('move', name, {
                from: currentSection,
                to: targetSection,
                timestamp: Date.now()
            });
        }
        
        const sectionNames = {
            'main': 'أساسيات',
            'spices_extra': 'بهارات اضافية',
            'roasted': 'المحمصة',
            'herbs': 'الأعشاب',
            'extra': 'مواد اضافية',
            'bags': 'أكياس تعبئة',
            'tawsaya': 'توصيات'
        };
        
        showToastMessage(`✓ تم نقل "${name}" إلى ${sectionNames[targetSection] || targetSection}`);
        closeMoveModal();
        
        if (typeof unsubscribe === 'function') unsubscribe();
        if (typeof startListener === 'function') startListener();
        
    } catch (error) {
        console.error('خطأ في النقل:', error);
        showToastMessage(`❌ فشل نقل "${name}"`, true);
    }
}

function closeMoveModal() {
    const modal = document.getElementById('moveItemModal');
    if (modal) modal.classList.remove('active');
    window.moveData = null;
    
    const nameInput = document.getElementById('moveItemName');
    if (nameInput) nameInput.value = '';
}

function refreshLongPressSystem() {
    setTimeout(() => {
        initLongPressSystem();
    }, 200);
}

function showToastMessage(msg, isErr = false) {
    let existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isErr ? '#ef4444' : '#10b981'};
        color: white;
        padding: 10px 20px;
        border-radius: 9999px;
        font-size: 13px;
        z-index: 10000;
        white-space: nowrap;
        font-weight: 500;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        direction: rtl;
    `;
    toast.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast) toast.remove();
    }, 2500);
}

window.initLongPressSystem = initLongPressSystem;
window.refreshLongPressSystem = refreshLongPressSystem;
window.executeMoveMaterial = executeMoveMaterial;
window.closeMoveModal = closeMoveModal;
window.showToastMessage = showToastMessage;
