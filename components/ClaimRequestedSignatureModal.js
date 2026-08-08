"use client";

import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaPaperPlane,
  FaUserCheck,
  FaFileContract,
  FaIdCard,
  FaExclamationTriangle,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function ClaimRequestedSignatureModal({
  petitionId,
  petitionTitle,
  requestedSigner, // { _id, name, designation, email }
  isOpen,
  onClose,
  user,
  onSuccess,
}) {
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [claimantPhone, setClaimantPhone] = useState("");
  const [claimType, setClaimType] = useState("self"); // "self" | "authorized_representative"
  const [proofDocumentUrl, setProofDocumentUrl] = useState("");
  const [message, setMessage] = useState("");
  const [declared, setDeclared] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (user) {
      setClaimantName(user.name || user.aadhaarKyc?.name || "");
      setClaimantEmail(user.email || "");
      setClaimantPhone(user.mobileNumber || "");
    }
  }, [user, isOpen]);

  if (!isOpen || !requestedSigner) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!claimantName.trim() || !claimantEmail.trim()) {
      setError("Please fill in your name and email address.");
      return;
    }
    if (!proofDocumentUrl.trim()) {
      setError("Please provide a proof document or verification URL.");
      return;
    }
    if (!declared) {
      setError("Please confirm the good-faith declaration checkbox.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let authToken = user?.token;
      if (!authToken && typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            authToken = JSON.parse(storedUser)?.token;
          }
        } catch (err) {}
        if (!authToken) {
          authToken = localStorage.getItem("token");
        }
      }

      const res = await fetch(`${backendUrl}/api/petitions/${petitionId}/claim-requested-signature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          requestedSignerId: requestedSigner._id,
          claimantName: claimantName.trim(),
          claimantEmail: claimantEmail.trim(),
          claimantPhone: claimantPhone.trim(),
          claimType,
          proofDocumentUrl: proofDocumentUrl.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit verification claim.");
      }

      setSuccess("Your verification claim has been submitted to admin. Once approved, this requested signature will be marked as SIGNED!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSuccess("");
        setProofDocumentUrl("");
        setMessage("");
        setDeclared(false);
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 space-y-0">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <FaUserCheck className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold leading-tight">Claim & Verify Requested Signature</h3>
              <p className="text-xs text-blue-100">Submit proof of identity/authorization for admin approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all cursor-pointer"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Target Requested Signer Details Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Target Requested Signer</p>
            <h4 className="text-base font-extrabold text-slate-900">{requestedSigner.name}</h4>
            {requestedSigner.designation && (
              <p className="text-xs text-slate-600 font-medium">{requestedSigner.designation}</p>
            )}
            <p className="text-[11px] text-gray-500 pt-1 border-t border-blue-100 mt-2">
              Petition: <strong className="text-slate-800">{petitionTitle}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Claim Type */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">
                Are you claiming as <span className="text-blue-600">{requestedSigner.name}</span>? <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    claimType === "self"
                      ? "bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="claimType"
                    value="self"
                    checked={claimType === "self"}
                    onChange={() => setClaimType("self")}
                    className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>I am {requestedSigner.name} myself</span>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    claimType === "authorized_representative"
                      ? "bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="claimType"
                    value="authorized_representative"
                    checked={claimType === "authorized_representative"}
                    onChange={() => setClaimType("authorized_representative")}
                    className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Authorized Representative / PR</span>
                </label>
              </div>
            </div>

            {/* Claimant Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  Your Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  Your Email Address <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  value={claimantEmail}
                  onChange={(e) => setClaimantEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-800">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={claimantPhone}
                onChange={(e) => setClaimantPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all font-mono"
              />
            </div>

            {/* Proof Document URL */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">
                Proof Document / Official Verification URL <span className="text-rose-600">*</span>
              </label>
              <input
                type="url"
                value={proofDocumentUrl}
                onChange={(e) => setProofDocumentUrl(e.target.value)}
                placeholder="https://x.com/... or Google Drive / Press Release proof link"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all font-mono text-xs"
                required
              />
              <p className="text-[11px] text-gray-500">
                Provide a link to an official X/Twitter post, official letterhead, press release, ID document, or video/photo confirming this signature.
              </p>
            </div>

            {/* Message to Admin */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">
                Message / Notes for Admin <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain any additional context for verification..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Good Faith Declaration */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-0.5 text-blue-600 focus:ring-blue-500 rounded cursor-pointer"
                required
              />
              <span className="text-[11px] text-slate-700 leading-snug font-medium">
                I solemnly declare that I am authorized to verify this signature and that all provided identity proofs are true and accurate.
              </span>
            </label>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
                <FaExclamationTriangle /> {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <FaCheckCircle /> {success}
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !declared}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                Submit Verification Claim
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
