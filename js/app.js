// =========================================
// Main Application
// =========================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const firebaseReady = initFirebase();
    
    // Load theme preference
    Events.loadTheme();
    
    // Initialize modules
    if (firebaseReady) {
        // Load materials
        Materials.loadMaterials('main');
        
        // Load prices
        PriceManager.loadPrices();
    } else {
        // Try loading from cache
        Materials.loadFromCache();
        PriceManager.loadFromLocal();
        
        // Show offline warning
        UI.showNotification('وضع غير متصل - البيانات من التخزين المحلي', 'info');
    }
    
    // Initialize events
    Events.init();
    
    // Initialize drag and drop
    DragDrop.init();
    
    // Hide splash screen
    setTimeout(function() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('hidden');
        }
    }, 1000);
});

// Make functions globally accessible for inline HTML
window.addMaterial = function(e) {
    e.preventDefault();
    const name = document.getElementById('addName').value;
    const quantity = document.getElementById('addQuantity').value;
    const unit = document.getElementById('addUnit').value;
    const section = document.getElementById('addSection').value;
    
    if (!name.trim()) {
        UI.showNotification('يرجى إدخال اسم المادة', 'error');
        return;
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
        UI.showNotification('يرجى إدخال كمية صحيحة', 'error');
        return;
    }
    
    Materials.addMaterial(name, quantity, unit, section);
};

window.saveEdit = function(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value;
    const quantity = document.getElementById('editQuantity').value;
    const unit = document.getElementById('editUnit').value;
    const section = document.getElementById('editSection').value;
    
    if (!name.trim()) {
        UI.showNotification('يرجى إدخال اسم المادة', 'error');
        return;
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
        UI.showNotification('يرجى إدخال كمية صحيحة', 'error');
        return;
    }
    
    Materials.saveEdit(id, name, quantity, unit, section);
};

window.closeModal = function(modalId) {
    UI.hideModal(modalId);
};

window.saveAllPrices = function() {
    PriceManager.saveAllPrices();
};

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
            console.log('Service Worker registered successfully');
        })
        .catch(function(error) {
            console.warn('Service Worker registration failed:', error);
        });
}
// =========================================
// إضافة زر التمرير للأعلى
// =========================================

// إظهار/إخفاء زر التمرير للأعلى
window.addEventListener('scroll', function() {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }
});

// عند تحميل الصفحة، التحقق من وجود الزر
document.addEventListener('DOMContentLoaded', function() {
    // ... الكود الموجود ...
    
    // إضافة زر التمرير للأعلى
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.id = 'scrollTopBtn';
    scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollBtn.onclick = function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };
    document.body.appendChild(scrollBtn);
});
