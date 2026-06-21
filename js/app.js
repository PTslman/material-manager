// ==================== إعدادات Firebase المتقدمة ====================

const firebaseConfig = {
    apiKey: "AIzaSyDQbf5LJRCquRsheFYqvEQBQbI_EoXNOFw",
    authDomain: "abo-slman.firebaseapp.com",
    projectId: "abo-slman",
    storageBucket: "abo-slman.firebasestorage.app",
    messagingSenderId: "874996942668",
    appId: "1:874996942668:web:f31da5ca778fb92845f1e9"
};

let firebaseInitialized = false;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        firebaseInitialized = true;
    } else {
        firebaseInitialized = true;
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
}

const db = firebaseInitialized ? firebase.firestore() : null;
const materialsCollection = db ? db.collection("spices_final_v12") : null;
const pricesCollection = db ? db.collection("material_prices") : null;

window.db = db;
window.materialsCollection = materialsCollection;
window.pricesCollection = pricesCollection;

async function testFirebaseConnection() {
    if (!db) return false;
    try {
        await db.collection('test').limit(1).get();
        return true;
    } catch {
        return false;
    }
}

window.testFirebaseConnection = testFirebaseConnection;
