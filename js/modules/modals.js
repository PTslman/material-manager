// ==================== الضغطة المطولة ونقل المواد ====================

var longPressTimer = null;
var isLongPress = false;
var touchStartTime = 0;

function setupLongPressForAllCards() {
    var cards = document.querySelectorAll('.material-card');
    for (var i = 0; i < cards.length; i++) {
        setupLongPressOnCard(cards[i]);
    }
}

function setupLongPressOnCard(card) {
    // إزالة المستمعين السابقين
    card.removeEventListener('touchstart', onTouchStart);
    card.removeEventListener('touchend', onTouchEnd);
    card.removeEventListener('touchmove', onTouchMove);
    card.removeEventListener('mousedown', onMouseDown);
    card.removeEventListener('mouseup', onMouseUp);
    card.removeEventListener('mouseleave', onMouseLeave);
    card.removeEventListener('click', onClick);
    
    // إضافة مستمعين جدد
    card.addEventListener('touchstart', onTouchStart);
    card.addEventListener('touchend', onTouchEnd);
    card.addEventListener('touchmove', onTouchMove);
    card.addEventListener('mousedown', onMouseDown);
    card.addEventListener('mouseup', onMouseUp);
    card.addEventListener('mouseleave', onMouseLeave);
    card.addEventListener('click', onClick);
    
    function onTouchStart(e) {
        // تسجيل وقت بدء اللمس
        touchStartTime = Date.now();
        isLongPress = false;
        
        // إذا كان الهدف هو زر التعديل أو الحذف، لا تفعل شيئاً
        if (e.target.closest('.edit-material') || e.target.closest('.delete-material')) {
            return;
        }
        
        var self = this;
        
        // بدء مؤقت الضغطة المطولة (1000ms = 1 ثانية)
        longPressTimer = setTimeout(function() {
            isLongPress = true;
            var id = self.getAttribute('data-id');
            var name = self.getAttribute('data-name');
            var section = self.getAttribute('data-section');
            if (id && name) {
                // تأثير اهتزاز للتنبيه
                self.classList.add('long-press-active');
                // فتح نافذة نقل المادة
                openMoveModal(id, name, section);
                setTimeout(function() { 
                    self.classList.remove('long-press-active'); 
                }, 300);
            }
        }, 1000); // 1 ثانية = ضغطة مطولة
    }
    
    function onTouchEnd(e) {
        var touchDuration = Date.now() - touchStartTime;
        
        // إذا كان هناك مؤقت نشط
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        
        // إذا كانت ضغطة قصيرة (أقل من 1000ms) وليست ضغطة مطولة
        if (touchDuration < 1000 && !isLongPress) {
            // التحقق إذا كان الهدف هو زر التعديل أو الحذف
            if (e.target.closest('.edit-material') || e.target.closest('.delete-material')) {
                return;
            }
            
            // هنا يمكنك إضافة ما تريد فعله عند الضغطة القصيرة
            // مثلاً: فتح نافذة تعديل سريع أو أي شيء آخر
            // حالياً: لا نفعل شيئاً
            console.log('ضغطة قصيرة - لا تفعل شيئاً');
        }
        
        // إعادة تعيين المؤشرات
        setTimeout(function() { 
            isLongPress = false; 
            touchStartTime = 0;
        }, 100);
    }
    
    function onTouchMove() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        isLongPress = false;
        touchStartTime = 0;
    }
    
    function onMouseDown(e) {
        // تسجيل وقت بدء الضغط
        touchStartTime = Date.now();
        isLongPress = false;
        
        // إذا كان الهدف هو زر التعديل أو الحذف، لا تفعل شيئاً
        if (e.target.closest('.edit-material') || e.target.closest('.delete-material')) {
            return;
        }
        
        var self = this;
        
        // بدء مؤقت الضغطة المطولة (1000ms = 1 ثانية)
        longPressTimer = setTimeout(function() {
            isLongPress = true;
            var id = self.getAttribute('data-id');
            var name = self.getAttribute('data-name');
            var section = self.getAttribute('data-section');
            if (id && name) {
                self.classList.add('long-press-active');
                openMoveModal(id, name, section);
                setTimeout(function() { 
                    self.classList.remove('long-press-active'); 
                }, 300);
            }
        }, 1000); // 1 ثانية = ضغطة مطولة
    }
    
    function onMouseUp(e) {
        var pressDuration = Date.now() - touchStartTime;
        
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        
        // إذا كانت ضغطة قصيرة (أقل من 1000ms) وليست ضغطة مطولة
        if (pressDuration < 1000 && !isLongPress) {
            if (e.target.closest('.edit-material') || e.target.closest('.delete-material')) {
                return;
            }
            console.log('ضغطة قصيرة - لا تفعل شيئاً');
        }
        
        setTimeout(function() { 
            isLongPress = false; 
            touchStartTime = 0;
        }, 100);
    }
    
    function onMouseLeave() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        isLongPress = false;
        touchStartTime = 0;
    }
    
    function onClick(e) {
        // إذا كانت ضغطة مطولة، نمنع النقر
        if (isLongPress) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        
        // إذا كان الهدف هو زر التعديل أو الحذف، نسمح بمرور الحدث
        if (e.target.closest('.edit-material') || e.target.closest('.delete-material')) {
            return;
        }
        
        // نمنع أي حدث آخر عند النقر العادي على البطاقة
        e.stopPropagation();
        e.preventDefault();
    }
}

function openMoveModal(id, name, currentSection) {
    console.log('فتح نافذة نقل المادة:', name);
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
