// =========================================
// Drag & Drop Module - مع دعم الأجهزة القديمة
// =========================================

const DragDrop = {
    // Drag state
    draggedId: null,
    draggedElement: null,
    touchTimeout: null,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    currentTarget: null,
    
    // Initialize drag and drop
    init: function() {
        // التحقق من دعم السحب والإفلات الحديث
        const isModernDragDrop = 'draggable' in document.createElement('div');
        
        if (isModernDragDrop) {
            this.initModernDragDrop();
        } else {
            this.initLegacyDragDrop();
        }
        
        // إعداد مناطق الإسقاط
        this.setupDropZones();
    },
    
    // إعداد السحب والإفلات الحديث (للأجهزة الحديثة)
    initModernDragDrop: function() {
        // استخدام delegation للأحداث
        document.addEventListener('dragstart', function(e) {
            const card = e.target.closest('.material-card');
            if (!card) return;
            
            const id = card.dataset.id;
            if (!id) return;
            
            DragDrop.draggedId = id;
            DragDrop.draggedElement = card;
            card.classList.add('dragging');
            
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', id);
            
            // إضافة صورة مصغرة للسحب
            try {
                e.dataTransfer.setDragImage(card, 20, 20);
            } catch (err) {
                // بعض المتصفحات لا تدعم setDragImage
            }
        });
        
        document.addEventListener('dragend', function(e) {
            const card = e.target.closest('.material-card');
            if (card) {
                card.classList.remove('dragging');
            }
            DragDrop.draggedId = null;
            DragDrop.draggedElement = null;
        });
    },
    
    // إعداد السحب والإفلات القديم (للأجهزة القديمة)
    initLegacyDragDrop: function() {
        let longPressTimer = null;
        let isLongPress = false;
        let startX = 0;
        let startY = 0;
        let clonedElement = null;
        let offsetX = 0;
        let offsetY = 0;
        
        // استخدام الضغط الطويل للسحب
        document.addEventListener('touchstart', function(e) {
            const card = e.target.closest('.material-card');
            if (!card) return;
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            isLongPress = false;
            
            // بدء计时 الضغط الطويل
            longPressTimer = setTimeout(function() {
                isLongPress = true;
                DragDrop.startLegacyDrag(card, touch.clientX, touch.clientY);
            }, 500);
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            if (longPressTimer) {
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - startX);
                const deltaY = Math.abs(touch.clientY - startY);
                
                // إذا تحرك الإصبع كثيراً، إلغاء الضغط الطويل
                if (deltaX > 10 || deltaY > 10) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                    
                    if (isLongPress) {
                        DragMove.moveLegacyDrag(touch.clientX, touch.clientY);
                    }
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
            
            if (isLongPress) {
                const touch = e.changedTouches[0];
                DragDrop.endLegacyDrag(touch.clientX, touch.clientY);
                isLongPress = false;
            }
        }, { passive: true });
    },
    
    // بدء السحب بالطريقة القديمة
    startLegacyDrag: function(card, clientX, clientY) {
        const rect = card.getBoundingClientRect();
        this.draggedId = card.dataset.id;
        this.draggedElement = card;
        this.isDragging = true;
        
        // إنشاء نسخة متحركة
        this.clonedElement = card.cloneNode(true);
        this.clonedElement.style.position = 'fixed';
        this.clonedElement.style.pointerEvents = 'none';
        this.clonedElement.style.zIndex = '9999';
        this.clonedElement.style.opacity = '0.8';
        this.clonedElement.style.transform = 'scale(1.05)';
        this.clonedElement.style.width = rect.width + 'px';
        this.clonedElement.style.left = (clientX - rect.width / 2) + 'px';
        this.clonedElement.style.top = (clientY - rect.height / 2) + 'px';
        this.clonedElement.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
        
        document.body.appendChild(this.clonedElement);
        
        // إخفاء العنصر الأصلي
        card.style.opacity = '0.3';
        card.style.transform = 'scale(0.95)';
        
        // اهتزاز قصير للإشارة
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    },
    
    // تحريك العنصر أثناء السحب القديم
    moveLegacyDrag: function(clientX, clientY) {
        if (!this.clonedElement || !this.isDragging) return;
        
        const rect = this.clonedElement.getBoundingClientRect();
        this.clonedElement.style.left = (clientX - rect.width / 2) + 'px';
        this.clonedElement.style.top = (clientY - rect.height / 2) + 'px';
        
        // التحقق من وجود منطقة إسقاط أسفل الإصبع
        const elementAtPoint = document.elementFromPoint(clientX, clientY);
        if (elementAtPoint) {
            const sectionCard = elementAtPoint.closest('.section-card');
            if (sectionCard) {
                // إبراز القسم
                document.querySelectorAll('.section-card').forEach(function(el) {
                    el.style.transform = 'scale(1)';
                    el.style.boxShadow = 'none';
                });
                sectionCard.style.transform = 'scale(1.05)';
                sectionCard.style.boxShadow = '0 0 20px rgba(59,130,246,0.3)';
                this.currentTarget = sectionCard;
            }
        }
    },
    
    // إنهاء السحب القديم
    endLegacyDrag: function(clientX, clientY) {
        this.isDragging = false;
        
        // إزالة العنصر المنسوخ
        if (this.clonedElement) {
            this.clonedElement.remove();
            this.clonedElement = null;
        }
        
        // إعادة العنصر الأصلي
        if (this.draggedElement) {
            this.draggedElement.style.opacity = '1';
            this.draggedElement.style.transform = 'scale(1)';
        }
        
        // إزالة الإبراز
        document.querySelectorAll('.section-card').forEach(function(el) {
            el.style.transform = 'scale(1)';
            el.style.boxShadow = 'none';
        });
        
        // التحقق من الإسقاط
        if (this.currentTarget && this.draggedId) {
            const section = this.currentTarget.dataset.section;
            if (section) {
                this.moveMaterial(this.draggedId, section);
            }
        }
        
        this.currentTarget = null;
        this.draggedId = null;
        this.draggedElement = null;
    },
    
    // إعداد مناطق الإسقاط
    setupDropZones: function() {
        // إعداد الأقسام كمناطق إسقاط
        document.querySelectorAll('.section-card').forEach(function(el) {
            // للأجهزة الحديثة
            el.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 0 20px rgba(59,130,246,0.3)';
            });
            
            el.addEventListener('dragleave', function(e) {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });
            
            el.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
                
                const draggedId = e.dataTransfer.getData('text/plain');
                if (draggedId) {
                    const targetSection = this.dataset.section;
                    DragDrop.moveMaterial(draggedId, targetSection);
                }
            });
        });
        
        // إعداد حاوية المواد كمنطقة إسقاط
        const container = document.getElementById('materialsContainer');
        if (container) {
            container.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            container.addEventListener('drop', function(e) {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/plain');
                if (draggedId) {
                    DragDrop.moveMaterial(draggedId, Materials.currentSection);
                }
            });
        }
        
        // دعم إضافي للأجهزة القديمة - إسقاط باللمس
        document.addEventListener('touchmove', function(e) {
            // منع التمرير أثناء السحب
            if (DragDrop.isDragging) {
                e.preventDefault();
            }
        }, { passive: false });
    },
    
    // نقل المادة
    moveMaterial: function(id, targetSection) {
        if (!isFirebaseReady()) {
            UI.showNotification('Firebase غير جاهز', 'error');
            return;
        }
        
        const db = getDB();
        if (!db) return;
        
        // البحث عن المادة في البيانات الحالية
        const material = Materials.allMaterials.find(function(m) {
            return m.id === id;
        });
        
        if (!material) {
            UI.showNotification('المادة غير موجودة', 'error');
            return;
        }
        
        // إذا كانت نفس القسم، لا تفعل شيء
        if (material.section === targetSection) {
            UI.showNotification('المادة موجودة بالفعل في هذا القسم', 'info');
            return;
        }
        
        db.collection(COLLECTION).doc(id).update({
            section: targetSection,
            timestamp: Utils.getTimestamp()
        })
        .then(function() {
            UI.showNotification('تم نقل المادة إلى ' + 
                UI.sections.find(function(s) { return s.id === targetSection; }).title, 
                'success'
            );
            
            // اهتزاز للتأكيد
            if (navigator.vibrate) {
                navigator.vibrate([30, 50, 30]);
            }
        })
        .catch(function(error) {
            console.error('Move material error:', error);
            UI.showNotification('حدث خطأ أثناء نقل المادة', 'error');
        });
    }
};

// Make DragDrop globally accessible
window.DragDrop = DragDrop;
