// =========================================
// Drag & Drop Module
// =========================================

const DragDrop = {
    // Drag state
    draggedId: null,
    draggedElement: null,
    
    // Initialize drag and drop
    init: function() {
        // Setup drop zones on sections
        document.querySelectorAll('.section-card').forEach(function(el) {
            el.addEventListener('dragover', DragDrop.onDragOver);
            el.addEventListener('drop', DragDrop.onDrop);
        });
        
        // Setup drop on materials container
        const container = document.getElementById('materialsContainer');
        if (container) {
            container.addEventListener('dragover', DragDrop.onDragOver);
            container.addEventListener('drop', DragDrop.onDrop);
        }
    },
    
    // On drag over
    onDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },
    
    // On drop
    onDrop: function(e) {
        e.preventDefault();
        
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId) return;
        
        // Get target section
        let targetSection = null;
        let targetElement = e.target.closest('.section-card');
        
        if (targetElement) {
            targetSection = targetElement.dataset.section;
        } else {
            // If dropped on materials container, use current section
            targetSection = Materials.currentSection;
        }
        
        if (targetSection) {
            DragDrop.moveMaterial(draggedId, targetSection);
        }
    },
    
    // Move material to section
    moveMaterial: function(id, targetSection) {
        if (!isFirebaseReady()) {
            UI.showNotification('Firebase غير جاهز', 'error');
            return;
        }
        
        const db = getDB();
        if (!db) return;
        
        db.collection(COLLECTION).doc(id).update({
            section: targetSection,
            timestamp: Utils.getTimestamp()
        })
        .then(function() {
            UI.showNotification('تم نقل المادة بنجاح', 'success');
        })
        .catch(function(error) {
            console.error('Move material error:', error);
            UI.showNotification('حدث خطأ أثناء نقل المادة', 'error');
        });
    }
};

// Make DragDrop globally accessible
window.DragDrop = DragDrop;
