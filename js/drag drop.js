// ==================== نظام السحب والإفلات المتقدم ====================

let draggedItem = null;
let draggedItemId = null;
let draggedItemName = null;
let draggedItemOriginalSection = null;
let longPressTimer = null;
let touchStartX = null;
let touchStartY = null;
let isDragging = false;

// تهيئة نظام السحب والإفلات
function initDragAndDrop() {
    const materials = document.querySelectorAll('.material-card');
    const sections = document.querySelectorAll('.priority-section');
    
    // إضافة مستمعي السحب للبطاقات
    materials.forEach(card => {
        // إزالة المستمعين السابقين لتجنب التكرار
        card.removeAttribute('draggable');
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
    element.setAttribute('draggable', 'true');
    
    element.addEventListener('dragstart', (e) => {
        draggedItem = element;
        draggedItemId = element.getAttribute('data-id');
        draggedItemName = element.getAttribute('data-name') || element.querySelector('.card-title span')?.innerText || '';
        draggedItemOriginalSection = element.closest('.priority-section')?.getAttribute('data-section') || '';
        
        element.classList.add('dragging');
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
}

// إعداد أحداث السحب باللمس (الضغطة المطولة)
function setupTouchEvents(element) {
    element.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        longPressTimer = setTimeout(() => {
            isDragging = true;
            element.classList.add('dragging');
            element.style.opacity = '0.5';
            
            // تهتز البطاقة كتأثير بصري
            element.style.transform = 'scale(0.98)';
            
            // منع التمرير أثناء السحب
            document.body.style.overflow = 'hidden';
            
            // إضافة مستمعي الحركة
            const handleTouchMove = (moveEvent) => {
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
            };
            
            const handleTouchEnd = async (endEvent) => {
                if (!isDragging) {
                    cleanup();
                    return;
                }
                
                const touch = endEvent.changedTouches[0];
                const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
                const targetSection = elementsUnderTouch.find(el => el.classList?.contains('priority-section'));
                
                if (targetSection && draggedItemId) {
                    const targetSectionName = targetSection.getAttribute('data-section');
                    
                    // التحقق من أن القسم المستهدف مختلف عن القسم الأصلي
                    if (targetSectionName && draggedItemOriginalSection !== targetSectionName) {
                        await performMove(draggedItemId, targetSectionName, draggedItemOriginalSection);
                    } else if (targetSectionName === draggedItemOriginalSection) {
                        showToast("⚠️ المادة موجودة بالفعل في هذا القسم", false);
                    }
                }
                
                cleanup();
            };
            
            const cleanup = () => {
                isDragging = false;
                element.classList.remove('dragging');
                element.style.opacity = '';
                element.style.transform = '';
                document.body.style.overflow = '';
                
                document.querySelectorAll('.priority-section').forEach(s => {
                    s.classList.remove('drag-over');
                });
                
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
                
                draggedItem = null;
                draggedItemId = null;
                draggedItemName = null;
                draggedItemOriginalSection = null;
            };
            
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
            
        }, 500); // 500ms ضغطة مطولة
    });
    
    element.addEventListener('touchmove', (e) => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });
    
    element.addEventListener('touchend', () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });
}

// إعداد أحداث الإفلات للأقسام
function setupDropEvents(section) {
    // للماوس
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
        } else if (draggedItemId && targetSection && draggedItemOriginalSection === targetSection) {
            showToast("⚠️ المادة موجودة بالفعل في هذا القسم", false);
        }
    });
}

// تنفيذ عملية النقل
async function performMove(itemId, targetSection, originalSection) {
    if (!itemId || !targetSection) return false;
    
    // إظهار مؤشر التحميل
    showToast("🔄 جاري نقل المادة...", false);
    
    try {
        // تحديث في Firebase
        await materialsCollection.doc(itemId).update({ priority: targetSection });
        
        // تسجيل التعلم في الذكاء الاصطناعي
        if (window.aiEngine) {
            window.aiEngine.learnFromAction('move', draggedItemName || '', {
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
        
        showToast(`✓ تم نقل "${draggedItemName || 'المادة'}" إلى ${sectionNames[targetSection] || targetSection}`);
        
        // إعادة تحميل البيانات من Firebase لعرضها محدثة
        if (typeof unsubscribe === 'function') unsubscribe();
        if (typeof startListener === 'function') startListener();
        
        return true;
    } catch (error) {
        console.error('خطأ في النقل:', error);
        showToast("❌ فشل نقل المادة. تحقق من اتصال الإنترنت", true);
        return false;
    }
}

// تحديث مستمعي السحب والإفلات بعد إعادة التحميل
function refreshDragAndDrop() {
    setTimeout(() => {
        initDragAndDrop();
    }, 200);
}

// تصدير الدوال للاستخدام العام
window.initDragAndDrop = initDragAndDrop;
window.refreshDragAndDrop = refreshDragAndDrop;
