// ==================== الضغطة المطولة ونقل المواد ====================

let longPressTimer = null;

// إعداد الضغطة المطولة لجميع بطاقات المواد
function setupLongPressForAllCards() {
    console.log("🖱️ Setting up long press for all material cards");
    
    const cards = document.querySelectorAll('.material-card');
    console.log("Found cards:", cards.length);
    
    cards.forEach(function(card) {
        setupLongPressOnCard(card);
    });
}

// إعداد الضغطة المطولة على بطاقة واحدة
function setupLongPressOnCard(card) {
    // إزالة المستمعين السابقين
    card.removeEventListener('touchstart', onTouchStart);
    card.removeEventListener('touchend', onTouchEnd);
    card.removeEventListener('touchmove', onTouchMove);
    card.removeEventListener('mousedown', onMouseDown);
    card.removeEventListener('mouseup', onMouseUp);
    card.removeEventListener('mouseleave', onMouseLeave);
    
    // إضافة مستمعين جدد
    card.addEventListener('touchstart', onTouchStart);
    card.addEventListener('touchend', onTouchEnd);
    card.addEventListener('touchmove', onTouchMove);
    card.addEventListener('mousedown', onMouseDown);
    card.addEventListener('mouseup', onMouseUp);
    card.addEventListener('mouseleave', onMouseLeave);
    
    function onTouchStart(e) {
        console.log("Touch start on card");
        const self = this;
        longPressTimer = setTimeout(function() {
            console.log("Long press detected (touch)");
            const id = self.getAttribute('data-id');
            const name = self.getAttribute('data-name');
            const section = self.getAttribute('data-section');
            
            if (id && name) {
                openMoveModal(id, name, section);
                // إضافة تأثير بصري
                self.classList.add('long-press-active');
                setTimeout(function() {
                    self.classList.remove('long-press-active');
                }, 300);
            } else {
                console.error("Missing card attributes:", {id, name, section});
            }
        }, 500);
    }
    
    function onTouchEnd() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }
    
    function onTouchMove() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }
    
    function onMouseDown(e) {
        console.log("Mouse down on card");
        e.preventDefault();
        const self = this;
        longPressTimer = setTimeout(function() {
            console.log("Long press detected (mouse)");
            const id = self.getAttribute('data-id');
            const name = self.getAttribute('data-name');
            const section = self.getAttribute('data-section');
            
            if (id && name) {
                openMoveModal(id, name, section);
                self.classList.add('long-press-active');
                setTimeout(function() {
                    self.classList.remove('long-press-active');
                }, 300);
            } else {
                console.error("Missing card attributes:", {id, name, section});
            }
        }, 500);
    }
    
    function onMouseUp() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }
    
    function onMouseLeave() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }
}

// فتح نافذة نقل المادة
function openMoveModal(id, name, currentSection) {
    console.log("Opening move modal for:", name, "from section:", currentSection);
    
    const nameInput = document.getElementById('moveItemName');
    const sectionSelect = document.getElementById('moveTargetSection');
    
    if (nameInput) nameInput.value = name;
    if (sectionSelect) sectionSelect.value = currentSection;
    
    // تخزين البيانات للنقل
    window.moveData = {
        id: id,
        name: name,
        currentSection: currentSection
    };
    
    const modal = document.getElementById('moveItemModal');
    if (modal) {
        modal.classList.add('active');
        console.log("Move modal opened");
    } else {
        console.error("Move modal not found");
    }
}

// تنفيذ نقل المادة
async function executeMove() {
    console.log("Executing move...");
    
    if (!window.moveData) {
        console.error("No move data");
        showToast("❌ حدث خطأ، يرجى المحاولة مرة أخرى", true);
        return;
    }
    
    const targetSection = document.getElementById('moveTargetSection').value;
    const { id, name, currentSection } = window.moveData;
    
    console.log("Moving:", name, "from", currentSection, "to", targetSection);
    
    if (!targetSection || currentSection === targetSection) {
        showToast("⚠️ المادة موجودة بالفعل في هذا القسم", false);
        closeMoveModal();
        return;
    }
    
    showToast("🔄 جاري نقل \"" + name + "\"...", false);
    
    try {
        await materialsCollection.doc(id).update({ 
            priority: targetSection,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // تسجيل في الذكاء الاصطناعي
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
        
        showToast("✓ تم نقل \"" + name + "\" إلى " + (sectionNames[targetSection] || targetSection));
        closeMoveModal();
        
        // تحديث البيانات
        if (typeof unsubscribe === 'function' && unsubscribe) {
            unsubscribe();
        }
        if (typeof startListener === 'function') {
            startListener();
        }
        
    } catch(error) {
        console.error("Move error:", error);
        showToast("❌ فشل نقل \"" + name + "\"", true);
    }
}

// إغلاق نافذة النقل
function closeMoveModal() {
    console.log("Closing move modal");
    const modal = document.getElementById('moveItemModal');
    if (modal) modal.classList.remove('active');
    window.moveData = null;
    
    const nameInput = document.getElementById('moveItemName');
    if (nameInput) nameInput.value = '';
}

// إغلاق جميع المودالات
function closeAllModals() {
    console.log("Closing all modals");
    const modals = ['newItemModal', 'presetModal', 'editModal', 'moveItemModal', 'systemMessageModal'];
    modals.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
}

// تصدير الدوال
window.setupLongPressForAllCards = setupLongPressForAllCards;
window.setupLongPressOnCard = setupLongPressOnCard;
window.openMoveModal = openMoveModal;
window.executeMove = executeMove;
window.closeMoveModal = closeMoveModal;
window.closeAllModals = closeAllModals;
