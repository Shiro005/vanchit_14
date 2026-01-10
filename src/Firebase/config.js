// src/Firebase/config.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyCc4myqMX5RwFJfdD7jHhzoYb65w0S_KpE",
  authDomain: "prabhag14vanchitnew.firebaseapp.com",
  projectId: "prabhag14vanchitnew",
  storageBucket: "prabhag14vanchitnew.firebasestorage.app",
  messagingSenderId: "612396105898",
  appId: "1:612396105898:web:3acc0d0ae34d89884750d3"
};

// Singleton Firebase App
const getFirebaseApp = () => {
  try {
    const apps = getApps();
    if (apps.length > 0) {
      console.log("📱 Using existing Firebase app");
      return apps[0];
    }
    
    console.log("🚀 Initializing Firebase app");
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error("❌ Firebase app initialization failed:", error);
    throw error;
  }
};

// Initialize Firebase App
const app = getFirebaseApp();

// Initialize Firestore with offline persistence
const getFirestoreDB = () => {
  try {
    const db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    });
    console.log("✅ Firestore initialized with offline persistence");
    return db;
  } catch (error) {
    console.error("❌ Firestore initialization failed:", error);
    throw error;
  }
};

// Initialize Firebase Auth
const getFirebaseAuth = () => {
  try {
    const auth = getAuth(app);
    auth.useDeviceLanguage();
    console.log("✅ Firebase Auth initialized");
    return auth;
  } catch (error) {
    console.error("❌ Firebase Auth initialization failed:", error);
    throw error;
  }
};

// Initialize Analytics with error handling
const getFirebaseAnalytics = () => {
  try {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log("🌐 Analytics skipped (server-side)");
      return null;
    }
    
    const analytics = getAnalytics(app);
    console.log("📊 Firebase Analytics initialized");
    return analytics;
  } catch (error) {
    console.warn("⚠️ Analytics initialization failed, continuing without it:", error.message);
    return null;
  }
};

// Initialize Performance with error handling
const getFirebasePerformance = () => {
  try {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log("🌐 Performance monitoring skipped (server-side)");
      return null;
    }
    
    const performance = getPerformance(app);
    console.log("⚡ Firebase Performance initialized");
    return performance;
  } catch (error) {
    console.warn("⚠️ Performance monitoring initialization failed, continuing without it:", error.message);
    return null;
  }
};

// Export initialized services
export const db = getFirestoreDB();
export const auth = getFirebaseAuth();
export const analytics = getFirebaseAnalytics();
export const performance = getFirebasePerformance();
export { app };