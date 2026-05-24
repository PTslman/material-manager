
// firebase-config.js - إعدادات Firebase للإصدار القديم (Compat v8)

// إعدادات Firebase الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyDQbf5LJRCquRsheFYqvEQBQbI_EoXNOFw",
    authDomain: "abo-slman.firebaseapp.com",
    projectId: "abo-slman",
    storageBucket: "abo-slman.firebasestorage.app",
    messagingSenderId: "874996942668",
    appId: "1:874996942668:web:f31da5ca778fb92845f1e9",
    measurementId: "G-EQPZQGJJFK"
};

// تهيئة Firebase (للمكتبة القديمة compat)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// الحصول على مرجع Firestore
const db = firebase.firestore();

// إعدادات إضافية لتحسين الأداء وحل مشكلات الاتصال
db.settings({
    experimentalForceLongPolling: true,  // يحسن الاتصال في الشبكات الضعيفة
    ignoreUndefinedProperties: true,      // يتجاهل الخصائص غير المعرفة
    merge: true                           // يدمج التحديثات
});

// مرجع مجموعة المواد في قاعدة البيانات
const materialsCollection = db.collection("spices_final_v12");

// دالة للتحقق من حالة الاتصال بـ Firestore
function checkFirestoreConnection() {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            resolve(false);
        }, 5000);
        
        // محاولة قراءة مستند بسيط للتحقق من الاتصال
        materialsCollection.limit(1).get()
            .then(() => {
                clearTimeout(timeout);
                resolve(true);
            })
            .catch(() => {
                clearTimeout(timeout);
                resolve(false);
            });
    });
}

// طباعة رسالة تأكيد في وحدة التحكم
console.log("✅ Firebase initialized successfully");
console.log("📁 Firestore collection:", materialsCollection.id);
