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
}

const db = firebase.firestore();

// تعطيل التخزين المؤقت المؤقت للتجربة
db.settings({
    experimentalForceLongPolling: false,
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

const materialsCollection = db.collection("spices_final_v12");

// اختبار الاتصال فوراً
(async function testConnection() {
    try {
        console.log("🔄 جاري اختبار الاتصال بـ Firestore...");
        const testRef = materialsCollection.doc("test");
        await testRef.set({ test: true, timestamp: new Date() });
        console.log("✅ الاتصال بـ Firestore ناجح!");
        await testRef.delete();
    } catch (error) {
        console.error("❌ فشل الاتصال بـ Firestore:", error);
        console.log("📌 تأكد من:");
        console.log("1. قواعد القراءة/الكتابة في Firebase مسموحة");
        console.log("2. تم إنشاء المجموعة spices_final_v12");
    }
})();
