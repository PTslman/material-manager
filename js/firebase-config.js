// ==================== إعدادات Firebase ====================

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
    console.log('✅ Firebase initialized successfully');
} else {
    console.log('✅ Firebase already initialized');
}

const db = firebase.firestore();
const materialsCollection = db.collection("spices_final_v12");

console.log('✅ Firebase ready - Collection: spices_final_v12');

// اختبار الاتصال
db.collection("spices_final_v12").limit(1).get()
    .then(() => console.log('✅ Firestore connection successful'))
    .catch(err => console.error('❌ Firestore connection failed:', err));
