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

const formatAuthError = (error) => {
  if (!error) return "An unknown error occurred. Please try again.";

  // Extract code from string message if it's not a structured object with .code
  const code = error.code || (typeof error.message === 'string' ? error.message : String(error));

  if (typeof code !== 'string') {
    return "An unexpected error occurred. Please try again.";
  }

  // Check specific Firebase Auth error codes
  if (code.includes("auth/popup-closed-by-user") || code.includes("popup-closed-by-user")) {
    return "Sign-in popup was closed before completion. Please try again.";
  }
  if (code.includes("auth/popup-blocked") || code.includes("popup-blocked")) {
    return "Sign-in popup was blocked by your browser. Please enable popups and try again.";
  }
  if (code.includes("auth/cancelled-popup-request") || code.includes("cancelled-popup-request")) {
    return "Sign-in request was cancelled. Please try again.";
  }
  if (code.includes("auth/user-not-found") || code.includes("user-not-found")) {
    return "No account found with this email. Please check your spelling or sign up.";
  }
  if (code.includes("auth/wrong-password") || code.includes("wrong-password")) {
    return "Incorrect password. Please try again or reset your password.";
  }
  if (code.includes("auth/invalid-credential") || code.includes("invalid-credential")) {
    return "Invalid email or password. Please try again.";
  }
  if (code.includes("auth/email-already-in-use") || code.includes("email-already-in-use")) {
    return "This email address is already registered. Please login instead.";
  }
  if (code.includes("auth/invalid-email") || code.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code.includes("auth/weak-password") || code.includes("weak-password")) {
    return "The password is too weak. Please use at least 6 characters.";
  }
  if (code.includes("auth/network-request-failed") || code.includes("network-request-failed")) {
    return "Network error. Please check your internet connection and try again.";
  }
  if (code.includes("auth/too-many-requests") || code.includes("too-many-requests")) {
    return "Too many failed attempts. Please try again later.";
  }
  if (code.includes("auth/operation-not-allowed") || code.includes("operation-not-allowed")) {
    return "This sign-in method is not enabled. Please contact support.";
  }

  // Handle generic backend/custom error messages
  if (error.message) {
    if (error.message.startsWith("Firebase:")) {
      return "Authentication failed. Please check your credentials and try again.";
    }
    return error.message;
  }

  return String(error);
};

export { auth, provider, RecaptchaVerifier, signInWithPhoneNumber, analytics, formatAuthError };