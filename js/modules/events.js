// ==================== ربط الأحداث ====================

function bindEvents() {
    console.log('🔗 Binding events...');
    
    // زر إضافة مادة جديدة
    var mainAddBtn = document.getElementById('mainAddBtn');
    if (mainAddBtn) {
        mainAddBtn.onclick = function() { 
            document.getElementById('newItemModal').classList.add('active'); 
        };
    }
    
    // زر المزامنة
    var syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.onclick = function() { 
            if (typeof startListener === 'function') {
                startListener(); 
            }
            if (typeof showToastMessage === 'function') {
                showToastMessage('🔄 جاري المزامنة...');
            }
        };
    }
    
    // زر الوضع الليلي
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = function() { 
            document.body.classList.toggle('dark');
            // حفظ التفضيل
            var isDark = document.body.classList.contains('dark');
            localStorage.setItem('darkMode', isDark);
        };
        
        // استعادة التفضيل المحفوظ
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark');
        }
    }
    
    // زر النسخ الاحتياطي
    var backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.onclick = function() { 
            if (typeof backupData === 'function') {
                backupData(); 
            }
        };
    }
    
    // زر الاستعادة
    var restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) {
        restoreBtn.onclick = function() { 
            if (typeof restoreData === 'function') {
                restoreData(); 
            }
        };
    }
    
    // زر مسح الكل
    var clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.onclick = function() { 
            if (typeof clearAllMaterials === 'function') {
                clearAllMaterials(); 
            }
        };
    }
    
    // زر إضافة مادة من المودال
    var saveNewItemBtn = document.getElementById('saveNewItemBtn');
    if (saveNewItemBtn) {
        saveNewItemBtn.onclick = function() { 
            if (typeof addNewMaterial === 'function') {
                addNewMaterial(); 
            }
        };
    }
    
    // زر حفظ التعديل
    var saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.onclick = function() { 
            if (typeof saveEdit === 'function') {
                saveEdit(); 
            }
        };
    }
    
    // زر حفظ القوائم الجاهزة
    var savePresetBtn = document.getElementById('savePresetBtn');
    if (savePresetBtn) {
        savePresetBtn.onclick = function() { 
            if (typeof addSelectedPresetItems === 'function') {
                addSelectedPresetItems(); 
            }
        };
    }
    
    // كروت الأقسام
    var categoryCards = document.querySelectorAll('.category-card');
    for (var i = 0; i < categoryCards.length; i++) {
        categoryCards[i].onclick = function(e) {
            e.stopPropagation();
            var category = this.getAttribute('data-category');
            
            if (category === 'tawsaya') {
                // فتح نافذة إضافة توصية
                var modal = document.getElementById('newItemModal');
                var sectionSelect = document.getElementById('newMaterialSection');
                if (sectionSelect) {
                    sectionSelect.value = 'tawsaya';
                }
                if (modal) {
                    modal.classList.add('active');
                }
            } else {
                // فتح نافذة القوائم الجاهزة
                if (typeof openPresetModal === 'function') {
                    openPresetModal(category);
                }
            }
        };
    }
    
    // البحث في القوائم الجاهزة
    var presetSearch = document.getElementById('presetSearchInput');
    if (presetSearch) {
        presetSearch.oninput = function(e) { 
            if (typeof renderPresetList === 'function') {
                renderPresetList(window.currentPresetCategory || 'main', e.target.value);
            }
        };
    }
    
    // أزرار إغلاق المودالات
    var closeButtons = [
        'closeNewModalBtn', 'closeNewModalBtn2',
        'closePresetModalBtn', 'closePresetModalBtn2',
        'closeEditModalBtn', 'closeEditModalBtn2',
        'closeSystemMessageBtn'
    ];
    
    for (var i = 0; i < closeButtons.length; i++) {
        var btn = document.getElementById(closeButtons[i]);
        if (btn) {
            btn.onclick = function() { 
                if (typeof closeAllModals === 'function') {
                    closeAllModals();
                } else {
                    // إغلاق المودالات مباشرة
                    var modals = ['newItemModal', 'presetModal', 'editModal', 'systemMessageModal'];
                    for (var j = 0; j < modals.length; j++) {
                        var el = document.getElementById(modals[j]);
                        if (el) el.classList.remove('active');
                    }
                }
            };
        }
    }
    
    // أزرار +/- في نافذة الإضافة
    var dec = document.getElementById('newQtyDec');
    var inc = document.getElementById('newQtyInc');
    var qty = document.getElementById('newQuantityValue');
    
    if (dec && inc && qty) {
        dec.onclick = function() { 
            var v = parseFloat(qty.value) || 1; 
            v = Math.max(0.25, v - 0.25); 
            qty.value = v; 
        };
        
        inc.onclick = function() { 
            var v = parseFloat(qty.value) || 1; 
            v = v + 0.25; 
            qty.value = v; 
        };
    }
    
    // تغيير الوحدة في نافذة التعديل
    var editUnit = document.getElementById('editUnitSelect');
    if (editUnit) {
        editUnit.onchange = function() {
            var unit = this.value;
            var qtyInput = document.getElementById('editQuantityValue');
            if (unit === 'half') {
                qtyInput.value = 0.5;
            } else if (unit === 'quarter') {
                qtyInput.value = 0.25;
            } else if (unit === 'oke') {
                qtyInput.value = 0.2;
            }
        };
    }
    
    console.log('✅ All events bound successfully');
}

// دالة إغلاق جميع المودالات
function closeAllModals() {
    console.log('Closing all modals');
    var modals = ['newItemModal', 'presetModal', 'editModal', 'systemMessageModal'];
    for (var i = 0; i < modals.length; i++) {
        var el = document.getElementById(modals[i]);
        if (el) {
            el.classList.remove('active');
        }
    }
}

// تهيئة PWA للتثبيت
function initPWA() {
    var deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        var installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'inline-flex';
        }
    });
    
    var installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.onclick = function() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function() { 
                    deferredPrompt = null; 
                    if (installBtn) {
                        installBtn.style.display = 'none';
                    }
                });
            } else { 
                if (typeof showToastMessage === 'function') {
                    showToastMessage('📱 التطبيق مثبت مسبقاً', false);
                }
            }
        };
    }
}

// دالة عرض رسائل النظام
function showSystemMessage(title, message, type) {
    if (type === undefined) type = 'info';
    
    var modal = document.getElementById('systemMessageModal');
    var titleEl = document.getElementById('systemMessageTitle');
    var textEl = document.getElementById('systemMessageText');
    
    if (titleEl) titleEl.innerText = title;
    if (textEl) textEl.innerText = message;
    
    var icon = modal ? modal.querySelector('.modal-icon i') : null;
    if (icon) {
        if (type === 'error') {
            icon.style.color = '#ef4444';
        } else if (type === 'warning') {
            icon.style.color = '#f59e0b';
        } else {
            icon.style.color = '#10b981';
        }
    }
    
    if (modal) {
        modal.classList.add('active');
    }
}

// تصدير الدوال
window.bindEvents = bindEvents;
window.closeAllModals = closeAllModals;
window.initPWA = initPWA;
window.showSystemMessage = showSystemMessage;
