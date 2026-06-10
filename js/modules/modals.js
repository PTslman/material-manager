var longPressTimer = null;

function setupLongPressForAllCards() {
    var cards = document.querySelectorAll('.material-card');
    for (var i = 0; i < cards.length; i++) {
        setupLongPressOnCard(cards[i]);
    }
}
function setupLongPressOnCard(card) {
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
        var self = this;
        longPressTimer = setTimeout(function() {
            var id = self.getAttribute('data-id');
            var name = self.getAttribute('data-name');
            var section = self.getAttribute('data-section');
            if (id && name) {
                openMoveModal(id, name, section);
                self.classList.add('long-press-active');
                setTimeout(function() { self.classList.remove('long-press-active'); }, 300);
            }
        }, 500);
    }
    function onTouchEnd() { if (longPressTimer) clearTimeout(longPressTimer); }
    function onTouchMove() { if (longPressTimer) clearTimeout(longPressTimer); }
    function onMouseDown(e) {
        e.preventDefault();
        var self = this;
        longPressTimer = setTimeout(function() {
            var id = self.getAttribute('data-id');
            var name = self.getAttribute('data-name');
            var section = self.getAttribute('data-section');
            if (id && name) {
                openMoveModal(id, name, section);
                self.classList.add('long-press-active');
                setTimeout(function() { self.classList.remove('long-press-active'); }, 300);
            }
        }, 500);
    }
    function onMouseUp() { if (longPressTimer) clearTimeout(longPressTimer); }
    function onMouseLeave() { if (longPressTimer) clearTimeout(longPressTimer); }
}
function openMoveModal(id, name, currentSection) {
    document.getElementById('moveItemName').value = name;
    document.getElementById('moveTargetSection').value = currentSection;
    window.moveData = { id: id, name: name, currentSection: currentSection };
    document.getElementById('moveItemModal').classList.add('active');
}
async function executeMove() {
    if (!window.moveData) { showToast('❌ حدث خطأ', true); return; }
    var targetSection = document.getElementById('moveTargetSection').value;
    var id = window.moveData.id, name = window.moveData.name, currentSection = window.moveData.currentSection;
    if (!targetSection || currentSection === targetSection) { showToast('⚠️ المادة موجودة بالفعل في هذا القسم', false); closeMoveModal(); return; }
    showToast('🔄 جاري نقل "' + name + '"...', false);
    try {
        await materialsCollection.doc(id).update({ priority: targetSection });
        showToast('✓ تم نقل "' + name + '"');
        closeMoveModal();
        if (unsubscribe) unsubscribe();
        startListener();
    } catch(e) { showToast('❌ فشل نقل "' + name + '"', true); }
}
function closeMoveModal() {
    document.getElementById('moveItemModal').classList.remove('active');
    window.moveData = null;
}
function closeAllModals() {
    var modals = ['newItemModal', 'presetModal', 'editModal', 'moveItemModal', 'systemMessageModal'];
    for (var i = 0; i < modals.length; i++) {
        var el = document.getElementById(modals[i]);
        if (el) el.classList.remove('active');
    }
}
window.setupLongPressForAllCards = setupLongPressForAllCards;
window.setupLongPressOnCard = setupLongPressOnCard;
window.openMoveModal = openMoveModal;
window.executeMove = executeMove;
window.closeMoveModal = closeMoveModal;
window.closeAllModals = closeAllModals;
