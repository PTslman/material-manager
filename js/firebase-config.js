// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDQbf5LJRCquRsheFYqvEQBQbI_EoXNOFw",
    authDomain: "abo-slman.firebaseapp.com",
    projectId: "abo-slman",
    storageBucket: "abo-slman.firebasestorage.app",
    messagingSenderId: "874996942668",
    appId: "1:874996942668:web:f31da5ca778fb92845f1e9"
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized');
}

const db = firebase.firestore();

// إعدادات مهمة لحل مشاكل الاتصال
db.settings({
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
    merge: true
});

// اختبار الاتصال بقاعدة البيانات
const materialsCollection = db.collection("spices_final_v12");

// اختبار الاتصال فوراً
(async function testConnection() {
    try {
        console.log('🔍 Testing Firebase connection...');
        const testDoc = await materialsCollection.limit(1).get();
        console.log('✅ Firebase connection successful!');
    } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        console.log('⚠️ Please check Firebase rules in console');
    }
})();
