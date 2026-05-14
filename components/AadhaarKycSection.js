"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaIdCard, FaCheckCircle, FaSpinner, FaTimesCircle, FaClock, FaExternalLinkAlt, FaLock } from "react-icons/fa";

const AadhaarKycSection = ({ user, onKycSuccess }) => {
  // status: "idle" | "initializing" | "linking" | "polling" | "completing" | "success" | "error"
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [oauthUrl, setOauthUrl] = useState(null);
  
  const pollingTimerRef = useRef(null);

  const isVerified = user?.aadhaarKyc?.status === "verified";

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  const handleInitialize = async () => {
    setStatus("initializing");
    setError("");
    setClientId(null);
    setOauthUrl(null);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.token) throw new Error("Not authenticated");

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${backendUrl}/api/aadhaar/digilocker/initialize`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initialize DigiLocker session");
      }

      setClientId(data.clientId);
      setOauthUrl(data.url);
      setStatus("linking");

      // Open DigiLocker in a new window
      window.open(data.url, "_blank", "width=600,height=700");

      // Start polling for status
      startPolling(data.clientId, storedUser.token);
    } catch (err) {
      console.error("Initialization Error:", err);
      setError(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  const startPolling = (cid, token) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    
    setStatus("polling");
    
    pollingTimerRef.current = setInterval(async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/aadhaar/digilocker/status`, {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ clientId: cid }),
        });

        const data = await response.json();

        if (!response.ok) {
          // If status check fails, we might want to continue polling unless it's a fatal error
          console.warn("Polling status failed:", data.message);
          return;
        }

        if (data.isFailed) {
          clearInterval(pollingTimerRef.current);
          setError("DigiLocker authentication failed or was cancelled.");
          setStatus("error");
        } else if (data.isCompleted) {
          clearInterval(pollingTimerRef.current);
          if (data.aadhaarLinked) {
            handleComplete(cid, token);
          } else {
            setError("Your Aadhaar is not linked to this DigiLocker account.");
            setStatus("error");
          }
        }
      } catch (err) {
        console.error("Polling Error:", err);
      }
    }, 4000); // Poll every 4 seconds
  };

  const handleComplete = async (cid, token) => {
    setStatus("completing");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/aadhaar/digilocker/complete`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ clientId: cid }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete KYC verification");
      }

      setSuccessData(data.aadhaarKyc);
      setStatus("success");

      // Update local storage and parent state
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, aadhaarKyc: data.aadhaarKyc };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (onKycSuccess) onKycSuccess(data.aadhaarKyc);
    } catch (err) {
      console.error("Completion Error:", err);
      setError(err.message || "Failed to finalize verification.");
      setStatus("error");
    }
  };

  // ─── Verified State ───
  if (isVerified || successData) {
    const kyc = successData || user.aadhaarKyc;
    return (
      <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-green-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-0 opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a1a2e]">Aadhaar KYC Verified</h3>
              <p className="text-xs text-green-600 font-medium">Verified via DigiLocker</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">VERIFIED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {kyc.maskedAadhaar && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Aadhaar Number</p>
                <p className="font-semibold text-gray-800 tracking-wider">{kyc.maskedAadhaar}</p>
              </div>
            )}
            {kyc.name && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="font-semibold text-gray-800">{kyc.name}</p>
              </div>
            )}
            {kyc.dob && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                <p className="font-semibold text-gray-800">{kyc.dob}</p>
              </div>
            )}
            {kyc.state && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">State</p>
                <p className="font-semibold text-gray-800">{kyc.state}</p>
              </div>
            )}
            {kyc.pincode && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Pincode</p>
                <p className="font-semibold text-gray-800">{kyc.pincode}</p>
              </div>
            )}
            {kyc.verifiedAt && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Verified On</p>
                <p className="font-semibold text-gray-800">{new Date(kyc.verifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Verification Flow UI ───
  const isProcessing = ["initializing", "polling", "completing"].includes(status);

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === "error" ? "bg-gradient-to-r from-red-500 to-red-600" : isProcessing ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-gradient-to-r from-blue-600 to-blue-700"}`}>
            {isProcessing ? <FaSpinner className="text-white text-lg animate-spin" /> : <FaLock className="text-white text-lg" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a1a2e]">Identity Verification</h3>
            <p className="text-xs text-gray-500">
              {status === "linking" ? "Waiting for DigiLocker authentication..." : status === "polling" ? "Verifying your documents..." : status === "error" ? "Verification failed" : "Secure KYC via DigiLocker OAuth"}
            </p>
          </div>
          <span className={`ml-auto px-3 py-1 text-xs font-bold rounded-full ${status === "error" ? "bg-red-100 text-red-700" : isProcessing ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
            {status === "error" ? "FAILED" : isProcessing ? "IN PROGRESS" : "NOT VERIFIED"}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700">
            <FaTimesCircle className="flex-shrink-0 mt-0.5 text-lg" />
            <div>
              <p className="font-bold">Verification Error</p>
              <p className="mt-1">{error}</p>
              <button onClick={handleInitialize} className="mt-3 text-xs font-bold underline hover:no-underline">Try again</button>
            </div>
          </div>
        )}

        {/* Initial/Retry State */}
        {(status === "idle" || status === "error") && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/DigiLocker_logo.svg/1200px-DigiLocker_logo.svg.png" alt="DigiLocker" className="w-6 h-auto" />
                </div>
                <h4 className="font-bold text-blue-900">Verify with DigiLocker</h4>
              </div>
              <p className="text-sm text-blue-700 leading-relaxed">
                We use DigiLocker for a secure, paperless identity verification. No need to upload photos. Just login and authorize.
              </p>
            </div>
            
            <button
              onClick={handleInitialize}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <FaExternalLinkAlt className="text-sm" />
              Proceed to DigiLocker
            </button>
          </div>
        )}

        {/* Linking State (Waiting for user to login in popup) */}
        {status === "linking" && (
          <div className="text-center py-8 px-4 border-2 border-dashed border-blue-200 rounded-3xl bg-blue-50/30">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-500">
                <FaLock className="text-blue-600 text-2xl" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">Authentication in Progress</h4>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Please complete the login in the popup window. If you closed it, click below to reopen.
            </p>
            <button 
              onClick={() => window.open(oauthUrl, "_blank", "width=600,height=700")}
              className="px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-full text-sm font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
            >
              <FaExternalLinkAlt className="text-xs" />
              Reopen DigiLocker
            </button>
          </div>
        )}

        {/* Polling/Completing State */}
        {(status === "polling" || status === "completing") && (
          <div className="text-center py-10">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">
              {status === "polling" ? "Verifying Login..." : "Fetching Aadhaar Details..."}
            </h4>
            <p className="text-sm text-gray-500 animate-pulse">
              This usually takes less than 10 seconds. Please don&apos;t close this page.
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Secure</div>
            <div className="text-[10px] text-gray-400">256-bit Encryption</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Private</div>
            <div className="text-[10px] text-gray-400">Official Gateway</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Instant</div>
            <div className="text-[10px] text-gray-400">Real-time Approval</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AadhaarKycSection;
