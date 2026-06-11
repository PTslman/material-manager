// ==================== نظام السحب والإفلات ====================

var draggedItem = null;
var draggedItemId = null;
var draggedItemName = null;
var draggedItemOriginalSection = null;

function initDragAndDrop() {
    var materials = document.querySelectorAll('.material-card');
    var sections = document.querySelectorAll('.priority-section');
    
    for (var i = 0; i < materials.length; i++) {
        setupDraggable(materials[i]);
    }
    
    for (var i = 0; i < sections.length; i++) {
        setupDroppable(sections[i]);
    }
}

function setupDraggable(element) {
    element.setAttribute('draggable', 'true');
    
    element.removeEventListener('dragstart', dragStartHandler);
    element.removeEventListener('dragend', dragEndHandler);
    
    element.addEventListener('dragstart', dragStartHandler);
    element.addEventListener('dragend', dragEndHandler);
    
    function dragStartHandler(e) {
        draggedItem = this;
        draggedItemId = this.getAttribute('data-id');
        draggedItemName = this.getAttribute('data-name');
        draggedItemOriginalSection = this.closest('.priority-section')?.getAttribute('data-section') || '';
        
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggedItemId);
        e.dataTransfer.effectAllowed = 'move';
        
        var dragIcon = document.createElement('div');
        dragIcon.textContent = draggedItemName;
        dragIcon.style.position = 'absolute';
        dragIcon.style.top = '-1000px';
        dragIcon.style.backgroundColor = '#10b981';
        dragIcon.style.color = 'white';
        dragIcon.style.padding = '8px 16px';
        dragIcon.style.borderRadius = '9999px';
        dragIcon.style.fontSize = '12px';
        dragIcon.style.fontWeight = 'bold';
        dragIcon.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        document.body.appendChild(dragIcon);
        e.dataTransfer.setDragImage(dragIcon, 0, 0);
        setTimeout(function() { document.body.removeChild(dragIcon); }, 0);
    }
    
    function dragEndHandler(e) {
        this.classList.remove('dragging');
        
        var allSections = document.querySelectorAll('.priority-section');
        for (var i = 0; i < allSections.length; i++) {
            allSections[i].classList.remove('drag-over');
        }
        
        draggedItem = null;
        draggedItemId = null;
        draggedItemName = null;
        draggedItemOriginalSection = null;
    }
}

function setupDroppable(section) {
    section.removeEventListener('dragover', dragOverHandler);
    section.removeEventListener('dragleave', dragLeaveHandler);
    section.removeEventListener('drop', dropHandler);
    
    section.addEventListener('dragover', dragOverHandler);
    section.addEventListener('dragleave', dragLeaveHandler);
    section.addEventListener('drop', dropHandler);
    
    function dragOverHandler(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');
    }
    
    function dragLeaveHandler(e) {
        this.classList.remove('drag-over');
    }
    
    function dropHandler(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        var targetSection = this.getAttribute('data-section');
        
        if (draggedItemId && targetSection && draggedItemOriginalSection !== targetSection) {
            performDragDropMove(draggedItemId, targetSection, draggedItemOriginalSection, draggedItemName);
        } else if (draggedItemId && targetSection && draggedItemOriginalSection === targetSection) {
            showToast('⚠️ المادة موجودة بالفعل في هذا القسم', false);
        }
    }
}

async function performDragDropMove(itemId, targetSection, originalSection, itemName) {
    if (!itemId || !targetSection) return false;
    
    var name = itemName || 'المادة';
    showToast('🔄 جاري نقل "' + name + '"...', false);
    
    try {
        await materialsCollection.doc(itemId).update({ 
            priority: targetSection,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (window.aiEngine) {
            window.aiEngine.learnFromAction('move', name, {
                from: originalSection,
                to: targetSection,
                timestamp: Date.now()
            });
        }
        
        var sectionNames = {
            'main': 'أساسيات',
            'spices_extra': 'بهارات اضافية',
            'roasted': 'المحمصة',
            'herbs': 'الأعشاب',
            'extra': 'مواد اضافية',
            'bags': 'أكياس تعبئة',
            'tawsaya': 'توصيات'
        };
        
        showToast('✓ تم نقل "' + name + '" إلى ' + (sectionNames[targetSection] || targetSection));
        
        if (unsubscribe) unsubscribe();
        startListener();
        
        return true;
    } catch(error) {
        console.error('خطأ في النقل:', error);
        showToast('❌ فشل نقل "' + name + '"', true);
        return false;
    }
}

function refreshDragAndDrop() {
    setTimeout(function() {
        initDragAndDrop();
    }, 200);
}

window.initDragAndDrop = initDragAndDrop;
window.refreshDragAndDrop = refreshDragAndDrop;
window.performDragDropMove = performDragDropMove;
