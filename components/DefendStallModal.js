"use client";

import { useState, useEffect } from "react";
import {
  FaShieldAlt,
  FaTimes,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaStore,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { parseGoogleLocationString } from "../utils/parseGoogleLocation";
import { useAuth } from "../context/AuthContext";

export default function DefendStallModal({ isOpen = true, onClose, report, onSuccess }) {
  const router = useRouter();
  const { user } = useAuth();
  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [reason, setReason] = useState("not_within_50m");
  const [explanation, setExplanation] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (user) {
      if (!vendorName) setVendorName(user.name || "");
      if (!vendorContact) setVendorContact(user.mobileNumber || user.email || "");
    }
  }, [user]);

  if (!isOpen || !report) return null;

  const resetForm = () => {
    setVendorName(user?.name || "");
    setVendorContact(user?.mobileNumber || user?.email || "");
    setReason("not_within_50m");
    setExplanation("");
    setGoogleMapsUrl("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const goToLoginPage = () => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
    const loginUrl = currentPath ? `/login?redirect=${encodeURIComponent(currentPath)}` : "/login";
    router.push(loginUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      goToLoginPage();
      return;
    }

    if (!vendorName.trim() || !explanation.trim()) {
      setError("Please fill in your name and detailed explanation.");
      return;
    }

    try {
      setLoading(true);
      const token = user.token || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.token : "");
      const res = await fetch(`${backendUrl}/api/stall-reports/${report._id}/defend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          vendorName: vendorName.trim(),
          vendorContact: vendorContact.trim(),
          reason,
          explanation: explanation.trim(),
          newGoogleMapsUrl: googleMapsUrl.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Defense & dispute request submitted! Admin will crosscheck and verify.");
        resetForm();
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(data.message || "Failed to submit defense request.");
      }
    } catch (err) {
      setError("Error submitting defense request: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
        <div className="bg-white border border-pink-100 rounded-3xl max-w-lg w-full p-6 text-gray-900 shadow-2xl space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-[#F43676] text-lg font-bold">
                <FaShieldAlt />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base">
                  Stall Defense &amp; Dispute Request
                </h3>
                <p className="text-[11px] font-bold text-gray-500">
                  Contest 50m Violation Report for: <span className="text-[#F43676] font-extrabold">{report.shopName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-[#F43676] flex items-center justify-center transition-colors cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>

          {/* Target Report Info Card */}
          <div className="bg-pink-50/60 p-3 rounded-2xl border border-pink-100/90 text-xs space-y-1">
            <div className="flex justify-between font-bold text-gray-900">
              <span>Reported School: {report.schoolId?.name || "School"}</span>
              <span className="text-[#F43676] font-extrabold">{report.distanceFromSchoolMeters}m Away</span>
            </div>
            <p className="text-[11px] text-gray-600">
              If your shop is actually further than 50 meters, has been relocated, or closed, submit your details below for Admin crosscheck.
            </p>
          </div>

          {/* Login Required Notice for Non-logged-in Users */}
          {!user && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <FaExclamationCircle className="shrink-0 text-amber-600 text-base" />
                <span>Sign In Required to Submit Dispute</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                You must be logged in to dispute or contest this 50m violation report. Please sign in or register to submit.
              </p>
              <button
                type="button"
                onClick={goToLoginPage}
                className="w-full py-2 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Sign In / Create Account</span>
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <FaExclamationCircle className="shrink-0 text-red-500 text-sm" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <FaCheckCircle className="shrink-0 text-emerald-600 text-sm" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Vendor Name */}
            <div>
              <label className="block text-[11px] text-gray-700 font-bold mb-1">
                Vendor / Owner Name <span className="text-[#F43676]">*</span>
              </label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Ramesh Kumar (Shop Owner)"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#F43676] bg-white text-gray-900 font-semibold"
              />
            </div>

            {/* Contact Details */}
            <div>
              <label className="block text-[11px] text-gray-700 font-bold mb-1">
                Mobile Number / Email (Optional)
              </label>
              <input
                type="text"
                value={vendorContact}
                onChange={(e) => setVendorContact(e.target.value)}
                placeholder="e.g. +91 9822012345 or vendor@gmail.com"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#F43676] bg-white text-gray-900 font-semibold"
              />
            </div>

            {/* Dispute Reason */}
            <div>
              <label className="block text-[11px] text-gray-700 font-bold mb-1">
                Reason for Defense / Dispute <span className="text-[#F43676]">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#F43676] bg-white text-gray-900 font-semibold"
              >
                <option value="not_within_50m">Stall is actually MORE than 50 meters away</option>
                <option value="stall_shifted">Stall has been shifted / relocated to a new location</option>
                <option value="closed_down">Stall is permanently closed / removed</option>
                <option value="has_permission">Possess valid municipal / local authority permission</option>
                <option value="other">Other Reason</option>
              </select>
            </div>

            {/* Detailed Explanation */}
            <div>
              <label className="block text-[11px] text-gray-700 font-bold mb-1">
                Detailed Explanation <span className="text-[#F43676]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain why this report is inaccurate or details of relocation..."
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#F43676] bg-white text-gray-900 font-medium"
              />
            </div>

            {/* Updated Google Maps URL / Location (Optional) */}
            <div>
              <label className="block text-[11px] text-gray-700 font-bold mb-1">
                New / Current Google Maps Location Link (Optional)
              </label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="Paste Google Maps link showing actual location..."
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#F43676] bg-white text-gray-900 font-semibold"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type={user ? "submit" : "button"}
                onClick={!user ? goToLoginPage : undefined}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-pink-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? "Submitting Request..."
                  : !user
                  ? "Sign In to Submit Dispute"
                  : "Submit Defense to Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
