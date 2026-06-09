// ==================== نظام السحب والإفلات المتقدم ====================

let draggedItem = null;
let draggedItemId = null;
let draggedItemName = null;
let draggedItemOriginalSection = null;
let dragTimeout = null;

// تهيئة نظام السحب والإفلات
function initDragAndDrop() {
    const materials = document.querySelectorAll('.material-card');
    const sections = document.querySelectorAll('.priority-section');
    
    // إضافة مستمعي السحب للبطاقات
    materials.forEach(card => {
        makeDraggable(card);
    });
    
    // إضافة مستمعي الإفلات للأقسام
    sections.forEach(section => {
        makeDroppable(section);
    });
}

// جعل العنصر قابل للسحب
function makeDraggable(element) {
    element.setAttribute('draggable', 'true');
    
    element.addEventListener('dragstart', (e) => {
        draggedItem = element;
        draggedItemId = element.getAttribute('data-id');
        draggedItemName = element.querySelector('.card-title span')?.innerText || '';
        draggedItemOriginalSection = element.closest('.priority-section')?.getAttribute('data-section') || '';
        
        element.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggedItemId);
        e.dataTransfer.effectAllowed = 'move';
        
        // أيقونة السحب المخصصة
        const dragIcon = document.createElement('div');
        dragIcon.textContent = draggedItemName;
        dragIcon.style.position = 'absolute';
        dragIcon.style.top = '-1000px';
        document.body.appendChild(dragIcon);
        e.dataTransfer.setDragImage(dragIcon, 0, 0);
        setTimeout(() => document.body.removeChild(dragIcon), 0);
    });
    
    element.addEventListener('dragend', (e) => {
        element.classList.remove('dragging');
        
        // إزالة تأثيرات الإفلات من جميع الأقسام
        document.querySelectorAll('.priority-section').forEach(section => {
            section.classList.remove('drag-over');
        });
        
        draggedItem = null;
        draggedItemId = null;
        draggedItemName = null;
        draggedItemOriginalSection = null;
    });
    
    // للشاشات اللمسية - الضغطة المطولة للسحب
    let longPressTimer = null;
    let startX, startY;
    
    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        
        longPressTimer = setTimeout(() => {
            // تهيئة السحب عند الضغطة المطولة
            element.classList.add('dragging');
            element.style.opacity = '0.5';
            
            // إضافة مستمعي الحركة
            const handleTouchMove = (moveEvent) => {
                moveEvent.preventDefault();
                const touch = moveEvent.touches[0];
                const targetElement = document.elementsFromPoint(touch.clientX, touch.clientY);
                
                // البحث عن قسم قريب
                const targetSection = targetElement.find(el => el.classList?.contains('priority-section'));
                if (targetSection) {
                    document.querySelectorAll('.priority-section').forEach(s => s.classList.remove('drag-over'));
                    targetSection.classList.add('drag-over');
                }
            };
            
            const handleTouchEnd = (endEvent) => {
                const touch = endEvent.changedTouches[0];
                const targetElement = document.elementsFromPoint(touch.clientX, touch.clientY);
                const targetSection = targetElement.find(el => el.classList?.contains('priority-section'));
                
                if (targetSection) {
                    const targetSectionName = targetSection.getAttribute('data-section');
                    performMove(draggedItemId, targetSectionName, draggedItemOriginalSection);
                }
                
                // تنظيف
                element.classList.remove('dragging');
                element.style.opacity = '';
                document.querySelectorAll('.priority-section').forEach(s => s.classList.remove('drag-over'));
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
            
        }, 500);
    });
    
    element.addEventListener('touchmove', (e) => {
        if (longPressTimer) clearTimeout(longPressTimer);
    });
    
    element.addEventListener('touchend', () => {
        if (longPressTimer) clearTimeout(longPressTimer);
    });
}

// جعل القسم قابل للإفلات
function makeDroppable(section) {
    section.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        section.classList.add('drag-over');
    });
    
    section.addEventListener('dragleave', (e) => {
        section.classList.remove('drag-over');
    });
    
    section.addEventListener('drop', async (e) => {
        e.preventDefault();
        section.classList.remove('drag-over');
        
        const targetSection = section.getAttribute('data-section');
        
        if (draggedItemId && targetSection && draggedItemOriginalSection !== targetSection) {
            await performMove(draggedItemId, targetSection, draggedItemOriginalSection);
        }
    });
}

// تنفيذ عملية النقل
async function performMove(itemId, targetSection, originalSection) {
    if (!itemId || !targetSection) return false;
    
    try {
        // تحديث في Firebase
        await materialsCollection.doc(itemId).update({ priority: targetSection });
        
        // تسجيل التعلم
        if (window.aiEngine) {
            window.aiEngine.learnFromAction('move', draggedItemName || '', {
                from: originalSection,
                to: targetSection
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
        
        showToast(`✓ تم نقل "${draggedItemName}" إلى ${sectionNames[targetSection] || targetSection}`);
        
        // تحديث العرض
        if (unsubscribe) unsubscribe();
        startListener();
        
        return true;
    } catch (error) {
        console.error('خطأ في النقل:', error);
        showToast("❌ فشل نقل المادة", true);
        return false;
    }
}

// تحديث مستمعي السحب والإفلات بعد إعادة التحميل
function refreshDragAndDrop() {
    setTimeout(() => {
        initDragAndDrop();
    }, 100);
                                    }
