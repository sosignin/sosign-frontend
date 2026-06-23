// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAL-fa3dzo2cjctRIJ8mZmmibDARZOGTFM",
  authDomain: "sosign-world.firebaseapp.com",
  projectId: "sosign-world",
  storageBucket: "sosign-world.firebasestorage.app",
  messagingSenderId: "499235294983",
  appId: "1:499235294983:web:4c9a19e2ae106c11807fa2",
  measurementId: "G-ZN9R5F7V8M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, RecaptchaVerifier, signInWithPhoneNumber, analytics };