// firebase-config.js - الإعدادات الصحيحة

// إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
    apiKey: "AIzaSyDQbf5LJRCquRsheFYqvEQBQbI_EoXNOFw",
    authDomain: "abo-slman.firebaseapp.com",
    projectId: "abo-slman",
    storageBucket: "abo-slman.firebasestorage.app",
    messagingSenderId: "874996942668",
    appId: "1:874996942668:web:f31da5ca778fb92845f1e9",
    measurementId: "G-EQPZQGJJFK"
};

// تهيئة Firebase (تأكد من عدم التهيئة أكثر من مرة)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} else if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded!');
}

// الحصول على مرجع Firestore
let db = null;
let materialsCollection = null;

try {
    db = firebase.firestore();
    
    // إعدادات إضافية لتحسين الاتصال
    db.settings({
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true
    });
    
    materialsCollection = db.collection("spices_final_v12");
    console.log('✅ Firestore initialized, collection: spices_final_v12');
    
    // اختبار الاتصال بقاعدة البيانات
    (async function testFirestoreConnection() {
        try {
            console.log('🔍 Testing Firestore connection...');
            const testQuery = await materialsCollection.limit(1).get();
            console.log('✅ Firestore connection successful!');
            console.log('📊 Collection size:', testQuery.size);
        } catch (error) {
            console.error('❌ Firestore connection failed:', error);
            console.log('📌 Possible issues:');
            console.log('   1. Firestore rules deny access');
            console.log('   2. Collection "spices_final_v12" does not exist');
            console.log('   3. Network/CORS issues');
        }
    })();
    
} catch (error) {
    console.error('❌ Failed to initialize Firestore:', error);
}

// تصدير المتغيرات للنطاق العام
window.db = db;
window.materialsCollection = materialsCollection;
