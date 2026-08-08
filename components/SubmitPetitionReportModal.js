"use client";

import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaIdCard,
  FaShieldAlt,
  FaExternalLinkAlt,
  FaPaperPlane,
} from "react-icons/fa";
import Link from "next/link";

export default function SubmitPetitionReportModal({
  petitionId,
  petitionTitle,
  isOpen,
  onClose,
  user,
}) {
  const [reason, setReason] = useState("Misleading / Fake Information");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [declared, setDeclared] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (!isOpen) return null;

  const isAadhaarVerified = user?.aadhaarKyc?.status === "verified";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAadhaarVerified) {
      setError("Only users with completed Aadhaar KYC can submit formal objection reports.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe your objection details.");
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
            const parsed = JSON.parse(storedUser);
            authToken = parsed?.token;
          }
        } catch (e) {}
        if (!authToken) {
          authToken = localStorage.getItem("token");
        }
      }

      const res = await fetch(`${backendUrl}/api/reports/petition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          petitionId,
          reason,
          description: description.trim(),
          evidenceUrl: evidenceUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit objection report.");
      }

      setSuccess("Your objection report has been submitted to the admin team for review.");
      setTimeout(() => {
        onClose();
        setSuccess("");
        setDescription("");
        setEvidenceUrl("");
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
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <FaExclamationTriangle className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold leading-tight">Report Petition Objection</h3>
              <p className="text-xs text-rose-100">Raise a formal request for admin review & takedown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Target Petition Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700">
            <span className="font-bold text-slate-900">Target Petition: </span>
            <span className="font-medium italic">{petitionTitle}</span>
          </div>

          {/* Aadhaar KYC Verification Check */}
          {!isAadhaarVerified ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-700 mt-0.5">
                  <FaShieldAlt className="text-lg" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Aadhaar KYC Verification Required
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Under platform compliance rules, formal petition objections and takedown requests can only be filed by users with verified identity.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                  <FaIdCard /> Status: Not Verified
                </span>
                <Link
                  href="/my-profile"
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  Verify Aadhaar KYC <FaExternalLinkAlt className="text-[10px]" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2 font-medium">
                <FaCheckCircle className="text-emerald-600 text-sm" />
                <span>Verified Identity: <strong>{user?.aadhaarKyc?.name || user?.name}</strong></span>
              </div>
              <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                {user?.aadhaarKyc?.maskedAadhaar || "Aadhaar Verified"}
              </span>
            </div>
          )}

          {/* Form inputs (Only enabled if Aadhaar verified) */}
          {isAadhaarVerified && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reason Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Objection Reason <span className="text-rose-600">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-medium bg-white"
                  required
                >
                  <option value="Hate Speech / Discrimination">Hate Speech / Discrimination</option>
                  <option value="Misleading / Fake Information">Misleading / Fake Information</option>
                  <option value="Copyright / Trademark Violation">Copyright / Trademark Violation</option>
                  <option value="Defamatory / Illegal Content">Defamatory / Illegal Content</option>
                  <option value="Personal Harassment / Privacy Concern">Personal Harassment / Privacy Concern</option>
                  <option value="Spam / Fraudulent Petition">Spam / Fraudulent Petition</option>
                  <option value="Other Objection">Other Objection</option>
                </select>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Detailed Description & Justification <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain clearly why this petition violates guidelines or laws..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Evidence URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Supporting Evidence / Document URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or proof link"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-mono"
                />
              </div>

              {/* Declaration Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declared}
                  onChange={(e) => setDeclared(e.target.checked)}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500 rounded cursor-pointer"
                  required
                />
                <span className="text-[11px] text-slate-700 leading-snug font-medium">
                  I solemnly declare that this objection is raised in good faith and the information provided is accurate and true to the best of my knowledge.
                </span>
              </label>

              {/* Status Messages */}
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

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !declared}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                  Submit Objection Report
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
