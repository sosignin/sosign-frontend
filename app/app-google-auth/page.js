"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { auth, provider, formatAuthError } from "../../utils/Firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import axios from "axios";

function GoogleAuthBridge() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "sosign://oauth-callback";

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Connecting your Google Account...");
  const [error, setError] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [userName, setUserName] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.sosign.in";

  const processGoogleUser = async (googleUser) => {
    try {
      setStatus("Creating your secure SoSign session...");
      const res = await axios.post(`${backendUrl}/api/users/google-auth`, {
        email: googleUser.email,
        name: googleUser.displayName || googleUser.email?.split("@")[0] || "SoSign User",
        photoURL: googleUser.photoURL || "",
        uid: googleUser.uid,
      });

      const userData = res.data;
      const token = userData.token || "";

      setUserName(userData.name || googleUser.displayName || "User");
      setStatus("Your Google Account is connected.");

      const separator = redirectUrl.includes("?") ? "&" : "?";
      const finalDeepLink = `${redirectUrl}${separator}token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}`;

      setDeepLink(finalDeepLink);
      setLoading(false);

      // Automatic return attempt after a short delay
      setTimeout(() => {
        window.location.href = finalDeepLink;
      }, 600);
    } catch (err) {
      console.error("Backend Google Auth Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to complete Google authentication.");
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    setStatus("Opening Google Sign-In...");

    try {
      const result = await signInWithPopup(auth, provider);
      if (result && result.user) {
        await processGoogleUser(result.user);
      }
    } catch (err) {
      console.error("Firebase Google Sign-In Error:", err);
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        try {
          setStatus("Redirecting to Google...");
          await signInWithRedirect(auth, provider);
          return;
        } catch (rErr) {
          setError(formatAuthError(rErr));
        }
      } else {
        setError(formatAuthError(err));
      }
      setLoading(false);
    }
  };

  // Check for redirect result on return
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setLoading(true);
          await processGoogleUser(result.user);
        }
      } catch (err) {
        console.error("Redirect Result Error:", err);
        setError(formatAuthError(err));
      }
    };
    checkRedirect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#302D55] to-[#0F172A] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-purple-100">
        {/* Shield / Logo */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F43676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-800 mb-2">SoSign Authentication</h1>
        <p className="text-sm text-slate-500 mb-6">
          Sign in with your Google account to access your petitions and wallet in the SoSign Mobile App.
        </p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-700">{status}</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs font-bold text-rose-800 mb-1">Authentication Notice</p>
            <p className="text-xs text-rose-600 leading-relaxed">{error}</p>
            <button
              onClick={handleSignIn}
              className="mt-3 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {deepLink && (
          <div className="space-y-4 pt-2">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-semibold">
              <span className="text-emerald-700 font-bold block mb-1 text-sm">✓ Authenticated Successfully!</span>
              Welcome {userName}. Tap the button below to return to your app.
            </div>
            <a
              href={deepLink}
              className="block w-full py-4 bg-gradient-to-r from-[#F43676] to-[#E11D48] text-white font-extrabold rounded-2xl shadow-lg shadow-pink-500/30 hover:opacity-95 active:scale-95 transition-all text-base"
            >
              👉 Authenticate & Return to App
            </a>
          </div>
        )}

        {!loading && !deepLink && (
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-[#F43676] hover:bg-pink-50/50 py-3.5 px-4 rounded-2xl font-bold text-slate-700 transition-all text-sm shadow-sm"
          >
            <Image
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Secure verification powered by SoSign & Google OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AppGoogleAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1E1B4B] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <GoogleAuthBridge />
    </Suspense>
  );
}
