function setupLongPress(card) {
    card.removeEventListener('touchstart', onTouchStart);
    card.removeEventListener('touchend', onTouchEnd);
    card.removeEventListener('touchmove', onTouchMove);
    card.removeEventListener('mousedown', onMouseDown);
    card.removeEventListener('mouseup', onMouseUp);
    card.removeEventListener('mouseleave', onMouseLeave);
    
    card.addEventListener('touchstart', onTouchStart);
    card.addEventListener('touchend', onTouchEnd);
    card.addEventListener('touchmove', onTouchMove);
    card.addEventListener('mousedown', onMouseDown);
    card.addEventListener('mouseup', onMouseUp);
    card.addEventListener('mouseleave', onMouseLeave);
    
    function onTouchStart(e) {
        const c = this;
        longPressTimer = setTimeout(() => {
            const id = c.getAttribute('data-id');
            const name = c.getAttribute('data-name');
            const section = c.getAttribute('data-section');
            openMoveModal(id, name, section);
            c.classList.add('long-press-active');
            setTimeout(() => c.classList.remove('long-press-active'), 300);
        }, 500);
    }
    function onTouchEnd() { if (longPressTimer) clearTimeout(longPressTimer); }
    function onTouchMove() { if (longPressTimer) clearTimeout(longPressTimer); }
    function onMouseDown(e) {
        e.preventDefault();
        const c = this;
        longPressTimer = setTimeout(() => {
            const id = c.getAttribute('data-id');
            const name = c.getAttribute('data-name');
            const section = c.getAttribute('data-section');
            openMoveModal(id, name, section);
            c.classList.add('long-press-active');
            setTimeout(() => c.classList.remove('long-press-active'), 300);
        }, 500);
    }
    function onMouseUp() { if (longPressTimer) clearTimeout(longPressTimer); }
    function onMouseLeave() { if (longPressTimer) clearTimeout(longPressTimer); }
}

function openMoveModal(id, name, currentSection) {
    document.getElementById('moveItemName').value = name;
    document.getElementById('moveTargetSection').value = currentSection;
    window.moveData = { id, name, currentSection };
    document.getElementById('moveItemModal').classList.add('active');
}

async function executeMove() {
    if (!window.moveData) return;
    const { id, name, currentSection } = window.moveData;
    const targetSection = document.getElementById('moveTargetSection').value;
    
    if (currentSection === targetSection) { showToast("⚠️ المادة في نفس القسم", false); closeMoveModal(); return; }
    
    showToast(`🔄 جاري نقل "${name}"...`, false);
    try {
        await materialsCollection.doc(id).update({ priority: targetSection });
        showToast(`✓ تم نقل "${name}"`);
        closeMoveModal();
        if (unsubscribe) unsubscribe();
        startListener();
    } catch(e) { showToast(`❌ فشل نقل "${name}"`, true); }
}

function closeMoveModal() {
    document.getElementById('moveItemModal').classList.remove('active');
    window.moveData = null;
}

function closeAllModals() {
    const modals = ['newItemModal', 'presetModal', 'editModal', 'moveItemModal', 'systemMessageModal'];
    modals.forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('active'); });
}
