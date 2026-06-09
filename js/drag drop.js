// ==================== نظام السحب والإفلات المتقدم ====================

let draggedItem = null;
let draggedItemId = null;
let draggedItemName = null;
let draggedItemOriginalSection = null;
let longPressTimer = null;
let isDragging = false;

// تهيئة نظام السحب والإفلات
function initDragAndDrop() {
    const materials = document.querySelectorAll('.material-card');
    const sections = document.querySelectorAll('.priority-section');
    
    // إضافة مستمعي السحب للبطاقات
    materials.forEach(card => {
        // إزالة المستمعين السابقين لتجنب التكرار
        card.setAttribute('draggable', 'true');
        setupDragEvents(card);
        setupTouchEvents(card);
    });
    
    // إضافة مستمعي الإفلات للأقسام
    sections.forEach(section => {
        setupDropEvents(section);
    });
}

// إعداد أحداث السحب بالماوس
function setupDragEvents(element) {
    // إزالة المستمعين السابقين
    element.removeEventListener('dragstart', handleDragStart);
    element.removeEventListener('dragend', handleDragEnd);
    
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    draggedItem = this;
    draggedItemId = this.getAttribute('data-id');
    draggedItemName = this.getAttribute('data-name') || this.querySelector('.card-title span')?.innerText || '';
    draggedItemOriginalSection = this.closest('.priority-section')?.getAttribute('data-section') || '';
    
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', draggedItemId);
    e.dataTransfer.effectAllowed = 'move';
    
    // أيقونة السحب المخصصة
    const dragIcon = document.createElement('div');
    dragIcon.textContent = draggedItemName;
    dragIcon.style.position = 'absolute';
    dragIcon.style.top = '-1000px';
    dragIcon.style.backgroundColor = '#10b981';
    dragIcon.style.color = 'white';
    dragIcon.style.padding = '8px 16px';
    dragIcon.style.borderRadius = '9999px';
    dragIcon.style.fontSize = '12px';
    dragIcon.style.fontWeight = 'bold';
    document.body.appendChild(dragIcon);
    e.dataTransfer.setDragImage(dragIcon, 0, 0);
    setTimeout(() => document.body.removeChild(dragIcon), 0);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // إزالة تأثيرات الإفلات من جميع الأقسام
    document.querySelectorAll('.priority-section').forEach(section => {
        section.classList.remove('drag-over');
    });
    
    draggedItem = null;
    draggedItemId = null;
    draggedItemName = null;
    draggedItemOriginalSection = null;
}

// إعداد أحداث السحب باللمس (الضغطة المطولة)
function setupTouchEvents(element) {
    // إزالة المستمعين السابقين
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
    
    element.addEventListener('touchstart', handleTouchStart);
}

function handleTouchStart(e) {
    const element = this;
    
    longPressTimer = setTimeout(() => {
        isDragging = true;
        element.classList.add('dragging');
        element.style.opacity = '0.5';
        element.style.transform = 'scale(0.98)';
        
        // حفظ بيانات العنصر المسحوب
        draggedItem = element;
        draggedItemId = element.getAttribute('data-id');
        draggedItemName = element.getAttribute('data-name') || element.querySelector('.card-title span')?.innerText || '';
        draggedItemOriginalSection = element.closest('.priority-section')?.getAttribute('data-section') || '';
        
        // منع التمرير أثناء السحب
        document.body.style.overflow = 'hidden';
        
        // إضافة مستمعي الحركة
        document.addEventListener('touchmove', handleGlobalTouchMove);
        document.addEventListener('touchend', handleGlobalTouchEnd);
        
    }, 500);
    
    function handleGlobalTouchMove(moveEvent) {
        if (!isDragging) return;
        moveEvent.preventDefault();
        
        const touch = moveEvent.touches[0];
        const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
        
        // البحث عن قسم قريب
        const targetSection = elementsUnderTouch.find(el => el.classList?.contains('priority-section'));
        
        // إزالة التأثير من جميع الأقسام
        document.querySelectorAll('.priority-section').forEach(s => {
            s.classList.remove('drag-over');
        });
        
        // إضافة التأثير للقسم المستهدف
        if (targetSection) {
            targetSection.classList.add('drag-over');
        }
    }
    
    async function handleGlobalTouchEnd(endEvent) {
        if (!isDragging) {
            cleanup();
            return;
        }
        
        const touch = endEvent.changedTouches[0];
        const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
        const targetSection = elementsUnderTouch.find(el => el.classList?.contains('priority-section'));
        
        if (targetSection && draggedItemId) {
            const targetSectionName = targetSection.getAttribute('data-section');
            
            if (targetSectionName && draggedItemOriginalSection !== targetSectionName) {
                // نقل المادة إلى القسم الجديد
                await performMove(draggedItemId, targetSectionName, draggedItemOriginalSection);
            } else if (targetSectionName === draggedItemOriginalSection) {
                showToast("⚠️ المادة موجودة بالفعل في هذا القسم", false);
            }
        }
        
        cleanup();
    }
    
    function cleanup() {
        isDragging = false;
        element.classList.remove('dragging');
        element.style.opacity = '';
        element.style.transform = '';
        document.body.style.overflow = '';
        
        document.querySelectorAll('.priority-section').forEach(s => {
            s.classList.remove('drag-over');
        });
        
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
        
        draggedItem = null;
        draggedItemId = null;
        draggedItemName = null;
        draggedItemOriginalSection = null;
        clearTimeout(longPressTimer);
    }
    
    // منع الحركة أثناء الضغط المطول
    element.addEventListener('touchmove', (e) => {
        if (longPressTimer) clearTimeout(longPressTimer);
    });
    
    element.addEventListener('touchend', () => {
        if (longPressTimer) clearTimeout(longPressTimer);
    });
}

// إعداد أحداث الإفلات للأقسام
function setupDropEvents(section) {
    // إزالة المستمعين السابقين
    section.removeEventListener('dragover', handleDragOver);
    section.removeEventListener('dragleave', handleDragLeave);
    section.removeEventListener('drop', handleDrop);
    
    section.addEventListener('dragover', handleDragOver);
    section.addEventListener('dragleave', handleDragLeave);
    section.addEventListener('drop', handleDrop);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const targetSection = this.getAttribute('data-section');
    
    if (draggedItemId && targetSection && draggedItemOriginalSection !== targetSection) {
        await performMove(draggedItemId, targetSection, draggedItemOriginalSection);
    } else if (draggedItemId && targetSection && draggedItemOriginalSection === targetSection) {
        showToast("⚠️ المادة موجودة بالفعل في هذا القسم", false);
    }
}

// ==================== تنفيذ عملية النقل (الأساسية) ====================
async function performMove(itemId, targetSection, originalSection) {
    if (!itemId || !targetSection) return false;
    
    // البحث عن اسم المادة
    const material = allMaterials.find(m => m.id === itemId);
    const materialName = material?.name || draggedItemName || 'المادة';
    
    showToast(`🔄 جاري نقل "${materialName}"...`, false);
    
    try {
        // تحديث في Firebase - تغيير القسم
        await materialsCollection.doc(itemId).update({ 
            priority: targetSection,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // تسجيل التعلم في الذكاء الاصطناعي
        if (window.aiEngine) {
            window.aiEngine.learnFromAction('move', materialName, {
                from: originalSection,
                to: targetSection,
                timestamp: Date.now()
            });
        }
        
        // الحصول على اسم القسم المستهدف بالعربية
        const sectionNames = {
            'main': 'أساسيات',
            'spices_extra': 'بهارات اضافية',
            'roasted': 'المحمصة',
            'herbs': 'الأعشاب',
            'extra': 'مواد اضافية',
            'bags': 'أكياس تعبئة',
            'tawsaya': 'توصيات'
        };
        
        showToast(`✓ تم نقل "${materialName}" إلى ${sectionNames[targetSection] || targetSection}`);
        
        // تحديث البيانات محلياً أولاً (للسرعة)
        if (material) {
            material.priority = targetSection;
        }
        
        // إعادة تحميل العرض بالكامل من Firebase
        if (typeof startListener === 'function') {
            if (unsubscribe) unsubscribe();
            startListener();
        }
        
        return true;
    } catch (error) {
        console.error('خطأ في النقل:', error);
        showToast(`❌ فشل نقل "${materialName}"`, true);
        return false;
    }
}

// تحديث مستمعي السحب والإفلات بعد إعادة التحميل
function refreshDragAndDrop() {
    setTimeout(() => {
        initDragAndDrop();
    }, 300);
}

// تصدير الدوال للاستخدام العام
window.initDragAndDrop = initDragAndDrop;
window.refreshDragAndDrop = refreshDragAndDrop;
window.performMove = performMove;
