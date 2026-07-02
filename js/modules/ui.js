// =========================================
// UI Module
// =========================================

const UI = {
    // Current active section
    activeSection: 'main',
    
    // Section definitions
    sections: [
        { id: 'main', title: 'أساسيات', icon: 'fa-star', color: '#f59e0b' },
        { id: 'extra', title: 'إضافي', icon: 'fa-plus-circle', color: '#3b82f6' },
        { id: 'bags', title: 'أكياس تعبئة', icon: 'fa-shopping-bag', color: '#ec4899' },
        { id: 'tawsaya', title: 'توصيات', icon: 'fa-gift', color: '#06b6d4' }
    ],
    
    // Render sections
    renderSections: function() {
        const container = document.getElementById('sectionsContainer');
        if (!container) return;
        
        container.innerHTML = this.sections.map(function(section) {
            const isActive = section.id === UI.activeSection ? 'active' : '';
            return '<div class="section-card section-' + section.id + ' ' + isActive + 
                '" data-section="' + section.id + '" onclick="UI.switchSection(\'' + section.id + '\')">' +
                '<i class="fas ' + section.icon + ' section-icon"></i>' +
                '<span>' + section.title + '</span>' +
                '</div>';
        }).join('');
    },
    
    // Switch section
    switchSection: function(sectionId) {
        this.activeSection = sectionId;
        this.renderSections();
        
        // Trigger materials refresh
        if (typeof Materials !== 'undefined') {
            Materials.loadMaterials(sectionId);
        }
    },
    
    // Render materials
    renderMaterials: function(materials) {
        const container = document.getElementById('materialsContainer');
        if (!container) return;
        
        if (!materials || materials.length === 0) {
            container.innerHTML = '<div class="empty-state">' +
                '<i class="fas fa-box-open"></i>' +
                '<p>لا توجد مواد في هذا القسم</p>' +
                '<p style="font-size:0.8rem;color:var(--text-muted)">اضغط على "إضافة" لإضافة مادة جديدة</p>' +
                '</div>';
            return;
        }
        
        const grid = document.createElement('div');
        grid.className = 'materials-grid';
        
        materials.forEach(function(material) {
            const price = PriceManager.getPrice(material.name);
            const priceText = price && price > 0 ? PriceManager.formatCurrency(price) + '/كغ' : '';
            
            const card = document.createElement('div');
            card.className = 'material-card';
            card.dataset.id = material.id;
            card.dataset.section = material.section;
            card.draggable = true;
            
            card.innerHTML = 
                '<div class="material-name">' + Utils.capitalize(material.name) + '</div>' +
                '<div class="material-quantity">' + material.quantity + ' ' + material.unit + '</div>' +
                (priceText ? '<div class="material-price">' + priceText + '</div>' : '') +
                '<div class="material-actions">' +
                '<button class="edit-btn" onclick="Materials.editMaterial(\'' + material.id + '\')">' +
                '<i class="fas fa-edit"></i>' +
                '</button>' +
                '<button class="delete-btn" onclick="Materials.deleteMaterial(\'' + material.id + '\')">' +
                '<i class="fas fa-trash"></i>' +
                '</button>' +
                '</div>';
            
            // Drag events
            card.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', material.id);
                card.classList.add('dragging');
            });
            
            card.addEventListener('dragend', function(e) {
                card.classList.remove('dragging');
            });
            
            grid.appendChild(card);
        });
        
        container.innerHTML = '';
        container.appendChild(grid);
    },
    
    // Show modal
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Hide modal
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    // Show notification
    showNotification: function(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification ' + (type || 'info');
        notification.textContent = message;
        notification.style.cssText = 
            'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
            'padding:12px 24px;border-radius:12px;background:var(--bg-card);' +
            'color:var(--text-primary);box-shadow:var(--shadow-lg);' +
            'z-index:9999;font-weight:500;max-width:90%;' +
            'border-right:4px solid ' + (type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6');
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(20px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 3000);
    }
};

// Make UI globally accessible
window.UI = UI;
