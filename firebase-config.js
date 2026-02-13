// Firebase Configuration
// Firebase v9 Modular SDK

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAmqLBA_EHXI5ICJ3RM_nu0kEbftJ_SWqU",
    authDomain: "swasthya-saathi-asha.firebaseapp.com",
    projectId: "swasthya-saathi-asha",
    storageBucket: "swasthya-saathi-asha.firebasestorage.app",
    messagingSenderId: "754952038518",
    appId: "1:754952038518:web:b28aab0c7a478c51afd757",
    measurementId: "G-ZL9L897CJF"
};

// Initialize Firebase
let app;
let db;

try {
    console.log('🔥 Initializing Firebase...');
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
    console.log('📊 Firestore database ready');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Error details:', error.message);

    // Show user-friendly error
    if (error.code === 'app/duplicate-app') {
        console.warn('⚠️ Firebase app already initialized');
    } else {
        alert('Firebase connection failed. Please check your internet connection and refresh the page.');
    }
}

// Export database instance
export { db, app };
