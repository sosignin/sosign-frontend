"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FaTrashAlt,
  FaExclamationTriangle,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

const REASON_OPTIONS = [
  "Privacy concerns & DPDP Act Right to Erasure",
  "I want to permanently delete all my petitions and published content",
  "I no longer need or use this account",
  "I created a duplicate or secondary account",
  "I receive too many emails or notifications",
  "Other reason (please specify)",
];

const DataDeletionSection = ({ user }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch current user's deletion request
  const fetchMyRequest = useCallback(async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/deletion-requests/my`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.data?.success) {
        setRequest(res.data.request);
      }
    } catch (err) {
      console.error("Failed to fetch deletion request:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.token, backendUrl]);

  useEffect(() => {
    fetchMyRequest();
  }, [fetchMyRequest]);

  // Submit new deletion request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!confirmed) {
      setErrorMsg("Please check the confirmation box to proceed.");
      return;
    }
    if (reason.includes("Other") && !customReason.trim()) {
      setErrorMsg("Please specify your reason for account deletion.");
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg("");
      const res = await axios.post(
        `${backendUrl}/api/deletion-requests`,
        {
          reason: reason.includes("Other") ? customReason : reason,
          customReason: reason.includes("Other") ? customReason : "",
          feedback: feedback.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.success) {
        setRequest(res.data.request);
        setIsModalOpen(false);
        setSuccessMsg(
          "Your account and data deletion request has been submitted to platform administrators for compliance review."
        );
        // Reset form
        setReason(REASON_OPTIONS[0]);
        setCustomReason("");
        setFeedback("");
        setConfirmed(false);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to submit deletion request. Please try again or contact support."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel pending request
  const handleCancelRequest = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel your account deletion request? Your account and petitions will remain active."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await axios.post(
        `${backendUrl}/api/deletion-requests/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (res.data?.success) {
        setRequest(res.data.request);
        setSuccessMsg("Your deletion request has been cancelled successfully.");
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to cancel deletion request. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-red-100 shadow-sm overflow-hidden relative">
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0 opacity-40"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-rose-700 rounded-xl flex items-center justify-center shadow-sm">
            <FaTrashAlt className="text-white text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#1a1a2e]">
                Data Erasure & Account Deletion
              </h3>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                DPDP Act Sec. 12
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Exercise your statutory Right to Erasure of personal data and petitions
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <FaCheckCircle className="text-emerald-600 text-lg flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-emerald-800">
              <p className="font-semibold">{successMsg}</p>
            </div>
            <button
              onClick={() => setSuccessMsg("")}
              className="text-emerald-500 hover:text-emerald-700"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Content State Handling */}
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin text-red-500" />
            <span>Checking account status...</span>
          </div>
        ) : request && request.status === "pending" ? (
          /* Active Pending Request View */
          <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <FaClock className="text-lg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <h4 className="font-bold text-amber-900 text-base">
                    Deletion Request Under Review
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-amber-200 text-amber-900 rounded-full uppercase tracking-wider">
                    Status: Pending Admin Action
                  </span>
                </div>
                <p className="text-sm text-amber-800 leading-relaxed mb-3">
                  Your formal request to permanently delete your account, personal data, and all petitions is currently under review by our Data Protection Compliance Team in accordance with Section 12 of the DPDP Act 2023.
                </p>

                {/* Request Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/70 p-3 rounded-xl border border-amber-200 mb-4">
                  <div>
                    <span className="text-gray-500">Request ID:</span>{" "}
                    <span className="font-mono font-semibold text-gray-800">
                      {request._id}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted On:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {new Date(request.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Reason:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {request.reason}
                    </span>
                  </div>
                  <div className="sm:col-span-2 text-red-700 font-medium">
                    ⚠️ When approved by the admin, {request.petitionsCount || 0} petition(s) and all your personal records will be permanently purged.
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs text-amber-700 italic">
                    Changed your mind? You can cancel your request anytime before it is processed.
                  </span>
                  <button
                    onClick={handleCancelRequest}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-white border border-amber-300 text-amber-900 font-bold text-xs rounded-xl hover:bg-amber-100 transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading && <FaSpinner className="animate-spin" />}
                    Cancel Deletion Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Default State: Explanation & Request Trigger */
          <div className="space-y-4">
            {request && request.status === "rejected" && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <FaTimesCircle className="text-rose-600 text-lg flex-shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900">
                  <p className="font-bold mb-1">Previous Deletion Request Rejected</p>
                  <p className="mb-1">
                    Your previous request submitted on{" "}
                    {new Date(request.createdAt).toLocaleDateString()} was reviewed and not completed:
                  </p>
                  {request.adminNote && (
                    <p className="italic bg-white/70 p-2 rounded border border-rose-200 text-rose-800">
                      &quot;{request.adminNote}&quot;
                    </p>
                  )}
                  <p className="mt-2 text-gray-600">
                    You can file a new request below or contact our Grievance Officer at{" "}
                    <a
                      href="mailto:grievance@sosign.in"
                      className="underline font-semibold text-rose-700"
                    >
                      grievance@sosign.in
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-gray-500 text-base flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
                  <p>
                    Under the <strong className="text-gray-800">Digital Personal Data Protection (DPDP) Act, 2023</strong>, you have the legal right to request the permanent erasure of your personal data when it is no longer necessary for the purpose it was collected.
                  </p>
                  <div className="bg-red-50/70 p-3 rounded-lg border border-red-100 text-red-900">
                    <p className="font-semibold mb-1 flex items-center gap-1.5 text-red-800">
                      <FaExclamationTriangle className="text-red-600" />
                      What happens when you delete your account:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-red-800/90">
                      <li>Your personal account and profile information will be permanently deleted.</li>
                      <li><strong>All petitions created by you</strong> will be permanently deleted from SoSign.</li>
                      <li>All your petition signatures, comments, and crowdfunding campaigns will be permanently erased.</li>
                      <li>Any verified Aadhaar KYC links and digital identity records will be purged.</li>
                      <li>This process is <strong>permanent and irreversible</strong> once approved.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaShieldAlt className="text-emerald-600" />
                  <span>Governed under Data Protection Compliance Rules</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaTrashAlt />
                  Request Account & Data Deletion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation & Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-red-100 relative my-8 animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-lg transition"
            >
              <FaTimes />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1a1a2e]">
                  Confirm Account & Data Deletion
                </h3>
                <p className="text-xs text-gray-500">
                  DPDP Act Right to Erasure Request
                </p>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="p-3.5 bg-red-50 border-l-4 border-red-600 rounded-r-xl text-xs text-red-900 mb-5 leading-relaxed">
              <p className="font-bold text-red-800 mb-1">
                Warning: This action is permanent and irreversible!
              </p>
              <p>
                Once processed by administration, your user profile, <strong>all petitions you created</strong>, comments, signatures, and associated data will be permanently destroyed.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <FaTimesCircle className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason for Deletion <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-red-500 bg-white"
                >
                  {REASON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {reason.includes("Other") && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Please specify your reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Describe why you want to delete your account"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Feedback or Comments <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Is there anything we could have done better? Help us improve..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Confirmation Checkbox */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                  />
                  <span className="text-xs text-gray-700 leading-snug">
                    I confirm that I want to delete my account and understand that <strong>all my petitions, signatures, and personal data</strong> will be permanently and irreversibly destroyed under the DPDP Act.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !confirmed}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  {actionLoading && <FaSpinner className="animate-spin" />}
                  Submit Deletion Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDeletionSection;
