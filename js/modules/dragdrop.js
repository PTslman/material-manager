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
        dragIcon.style.cssText = 'position:absolute;top:-1000px;background:#10b981;color:white;padding:8px 16px;border-radius:9999px;font-size:12px;font-weight:bold';
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
        }
    }
}

async function performDragDropMove(itemId, targetSection, originalSection, itemName) {
    if (!itemId || !targetSection) return false;
    var name = itemName || 'المادة';
    
    if (typeof showToastMessage === 'function') {
        showToastMessage('🔄 جاري نقل "' + name + '"...', false);
    }
    
    try {
        await materialsCollection.doc(itemId).update({ priority: targetSection });
        
        var sectionNames = {
            'main': 'أساسيات',
            'extra': 'إضافي',
            'bags': 'أكياس تعبئة',
            'tawsaya': 'توصيات'
        };
        
        if (typeof showToastMessage === 'function') {
            showToastMessage('✓ تم نقل "' + name + '" إلى ' + (sectionNames[targetSection] || targetSection));
        }
        
        if (typeof startListener === 'function') {
            startListener();
        }
        
        return true;
    } catch(error) {
        if (typeof showToastMessage === 'function') {
            showToastMessage('❌ فشل نقل "' + name + '"', true);
        }
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
