"use client";

import React, { useEffect } from "react";

/**
 * KYC Callback Page
 * 
 * DigiLocker redirects to this page after the user completes authentication.
 * This page signals the parent window via localStorage (the `storage` event
 * fires in all other same-origin tabs/windows). This is more reliable than
 * postMessage since window.opener gets nullified during cross-origin navigation.
 */
const KycCallbackPage = () => {
  useEffect(() => {
    // Signal completion to the parent window via localStorage
    // The `storage` event fires in ALL other same-origin tabs/windows
    try {
      localStorage.setItem(
        "digilocker_complete",
        JSON.stringify({ success: true, timestamp: Date.now() })
      );
    } catch (err) {
      console.error("Failed to signal completion:", err);
    }

    // Also try postMessage as a backup (works if opener is still available)
    try {
      if (window.opener) {
        window.opener.postMessage(
          { type: "DIGILOCKER_COMPLETE", success: true },
          window.location.origin
        );
      }
    } catch (err) {
      // Silently ignore — localStorage approach is the primary method
    }

    // Auto-close this popup after a short delay
    const timer = setTimeout(() => {
      window.close();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-10 bg-white rounded-3xl shadow-xl max-w-md mx-4">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Authentication Complete!</h1>
        <p className="text-gray-500 mb-6">
          DigiLocker verification is done. This window will close automatically.
        </p>
        <button
          onClick={() => window.close()}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Close Window
        </button>
      </div>
    </div>
  );
};

export default KycCallbackPage;
