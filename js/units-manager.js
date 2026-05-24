// units-manager.js - نظام إدارة وحدات الحجم المتقدم

class UnitsManager {
    constructor() {
        this.units = {
            kg: { name: 'كيلو', nameEn: 'kg', value: 1, factor: 1, icon: 'fa-weight-hanging', enabled: true },
            half: { name: 'نصف كيلو', nameEn: 'half', value: 0.5, factor: 0.5, icon: 'fa-balance-scale', enabled: true },
            quarter: { name: 'ربع كيلو', nameEn: 'quarter', value: 0.25, factor: 0.25, icon: 'fa-chart-pie', enabled: true },
            oke: { name: 'لوقية', nameEn: 'oke', value: 0.2, factor: 0.2, icon: 'fa-gem', enabled: true }
        };
        
        this.customUnits = [];
        this.defaultUnit = 'kg';
        this.loadFromStorage();
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.syncWithUI();
        this.setupEventListeners();
    }
    
    loadFromStorage() {
        // تحميل الوحدات من localStorage
        const savedUnits = localStorage.getItem('units_config');
        if (savedUnits) {
            try {
                const parsed = JSON.parse(savedUnits);
                Object.keys(parsed).forEach(key => {
                    if (this.units[key]) {
                        this.units[key].enabled = parsed[key].enabled;
                        if (parsed[key].name) this.units[key].name = parsed[key].name;
                    }
                });
            } catch(e) {}
        }
        
        // تحميل الوحدات المخصصة
        const savedCustom = localStorage.getItem('custom_units');
        if (savedCustom) {
            try {
                this.customUnits = JSON.parse(savedCustom);
            } catch(e) {}
        }
        
        // تحميل الوحدة الافتراضية
        const savedDefault = localStorage.getItem('default_unit');
        if (savedDefault) this.defaultUnit = savedDefault;
    }
    
    saveToStorage() {
        const config = {};
        Object.keys(this.units).forEach(key => {
            config[key] = { enabled: this.units[key].enabled, name: this.units[key].name };
        });
        localStorage.setItem('units_config', JSON.stringify(config));
        localStorage.setItem('custom_units', JSON.stringify(this.customUnits));
        localStorage.setItem('default_unit', this.defaultUnit);
    }
    
    getEnabledUnits() {
        const enabled = [];
        Object.keys(this.units).forEach(key => {
            if (this.units[key].enabled) {
                enabled.push({ id: key, ...this.units[key] });
            }
        });
        this.customUnits.forEach(unit => {
            if (unit.enabled !== false) {
                enabled.push({ id: `custom_${unit.id}`, ...unit, isCustom: true });
            }
        });
        return enabled;
    }
    
    addCustomUnit(name, value, icon = 'fa-cube') {
        const id = `unit_${Date.now()}`;
        const newUnit = {
            id: id,
            name: name,
            nameEn: name,
            value: value,
            factor: value,
            icon: icon,
            enabled: true,
            isCustom: true
        };
        this.customUnits.push(newUnit);
        this.saveToStorage();
        this.syncWithUI();
        return newUnit;
    }
    
    updateCustomUnit(id, updates) {
        const index = this.customUnits.findIndex(u => u.id === id);
        if (index !== -1) {
            this.customUnits[index] = { ...this.customUnits[index], ...updates };
            this.saveToStorage();
            this.syncWithUI();
        }
    }
    
    deleteCustomUnit(id) {
        this.customUnits = this.customUnits.filter(u => u.id !== id);
        this.saveToStorage();
        this.syncWithUI();
    }
    
    toggleUnit(unitId, enabled) {
        if (this.units[unitId]) {
            this.units[unitId].enabled = enabled;
        } else {
            const customUnit = this.customUnits.find(u => u.id === unitId);
            if (customUnit) customUnit.enabled = enabled;
        }
        this.saveToStorage();
        this.syncWithUI();
    }
    
    setDefaultUnit(unitId) {
        this.defaultUnit = unitId;
        this.saveToStorage();
        this.syncWithUI();
    }
    
    formatQuantity(quantity, unitId) {
        let unit;
        if (this.units[unitId]) unit = this.units[unitId];
        else unit = this.customUnits.find(u => u.id === unitId);
        
        if (!unit) return `${quantity} كجم`;
        
        if (unitId === 'kg') return `${quantity} كجم`;
        if (unitId === 'half') return `نصف كيلو`;
        if (unitId === 'quarter') return `ربع كيلو`;
        if (unitId === 'oke') return `${quantity * 5} لوقية (${quantity} كجم)`;
        
        return `${quantity} ${unit.name}`;
    }
    
    syncWithUI() {
        // تحديث أزرار الوحدات في جميع النوافذ
        this.updateUnitButtons();
        // تحديث عرض الوحدات في المواد
        this.updateMaterialsDisplay();
        // تحديث القوائم المنسدلة للوحدات
        this.updateUnitSelectors();
    }
    
    updateUnitButtons() {
        const enabledUnits = this.getEnabledUnits();
        const containers = document.querySelectorAll('.units-buttons');
        
        containers.forEach(container => {
            const currentValue = container.getAttribute('data-selected') || this.defaultUnit;
            container.innerHTML = '';
            
            enabledUnits.forEach(unit => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `unit-btn ${currentValue === unit.id ? 'active' : ''}`;
                btn.setAttribute('data-unit', unit.id);
                btn.setAttribute('data-value', unit.value);
                btn.innerHTML = `<i class="fas ${unit.icon}"></i> ${unit.name}`;
                
                btn.addEventListener('click', () => {
                    // إزالة الـ active من جميع الأزرار
                    container.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    container.setAttribute('data-selected', unit.id);
                    
                    // تحديث حقل الكمية إذا لزم الأمر
                    const needsQuantity = (unit.id === 'kg' || unit.id.startsWith('custom_'));
                    const quantityField = container.closest('.modal-content')?.querySelector('#quantityFieldContainer');
                    if (quantityField) {
                        quantityField.style.display = needsQuantity ? 'block' : 'none';
                    }
                    
                    // تشغيل حدث تغيير الوحدة
                    const event = new CustomEvent('unitChanged', { detail: { unitId: unit.id, unit: unit } });
                    document.dispatchEvent(event);
                });
                
                container.appendChild(btn);
            });
        });
    }
    
    updateMaterialsDisplay() {
        // إعادة عرض جميع المواد مع الوحدات المحدثة
        if (window.allMaterials && window.renderAllMaterials) {
            window.renderAllMaterials(window.allMaterials);
        }
    }
    
    updateUnitSelectors() {
        const enabledUnits = this.getEnabledUnits();
        const selectors = document.querySelectorAll('.unit-selector');
        
        selectors.forEach(selector => {
            selector.innerHTML = '';
            enabledUnits.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.id;
                option.textContent = unit.name;
                selector.appendChild(option);
            });
        });
    }
    
    setupEventListeners() {
        // الاستماع لتغيير الوحدة الافتراضية
        document.addEventListener('unitChanged', (e) => {
            console.log('Unit changed to:', e.detail.unitId);
        });
        
        // مزامنة مع التطبيق الرئيسي
        window.addEventListener('storage', (e) => {
            if (e.key === 'units_config' || e.key === 'custom_units') {
                this.loadFromStorage();
                this.syncWithUI();
            }
        });
    }
    
    getUnitsHTML() {
        const enabledUnits = this.getEnabledUnits();
        return enabledUnits.map(unit => `
            <button type="button" class="unit-btn" data-unit="${unit.id}" data-value="${unit.value}">
                <i class="fas ${unit.icon}"></i> ${unit.name}
            </button>
        `).join('');
    }
}

// تهيئة مدير الوحدات
const unitsManager = new UnitsManager();
window.unitsManager = unitsManager;
