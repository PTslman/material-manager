// ==================== نظام السحب والإفلات المتقدم ====================

let dragState = {
    item: null,
    id: null,
    name: null,
    originalSection: null
};

function initDragAndDrop() {
    document.querySelectorAll('.material-card').forEach(card => setupDraggable(card));
    document.querySelectorAll('.priority-section').forEach(section => setupDroppable(section));
}

function setupDraggable(element) {
    element.setAttribute('draggable', 'true');
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    dragState.item = this;
    dragState.id = this.dataset.id;
    dragState.name = this.dataset.name;
    dragState.originalSection = this.closest('.priority-section')?.dataset.section || '';
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', dragState.id);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.priority-section').forEach(s => s.classList.remove('drag-over'));
    dragState = { item: null, id: null, name: null, originalSection: null };
}

function setupDroppable(section) {
    section.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        section.classList.add('drag-over');
    });
    section.addEventListener('dragleave', () => section.classList.remove('drag-over'));
    section.addEventListener('drop', handleDrop);
}

async function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const targetSection = this.dataset.section;
    if (dragState.id && targetSection && dragState.originalSection !== targetSection) {
        await performMove(dragState.id, targetSection, dragState.originalSection, dragState.name);
    }
}

async function performMove(id, target, original, name) {
    if (!id || !target) return;
    name = name || 'المادة';
    showToastMessage(`🔄 جاري نقل "${name}"...`, false);
    
    try {
        await materialsCollection.doc(id).update({ priority: target });
        const names = { 'main': 'أساسيات', 'extra': 'إضافي', 'bags': 'أكياس تعبئة', 'tawsaya': 'توصيات' };
        showToastMessage(`✓ تم نقل "${name}" إلى ${names[target] || target}`);
        if (typeof startListener === 'function') startListener();
    } catch(e) {
        showToastMessage(`❌ فشل نقل "${name}"`, true);
    }
}

window.initDragAndDrop = initDragAndDrop;
