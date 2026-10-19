"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaShieldAlt, FaCheckCircle, FaTimesCircle, FaGlobe, FaSpinner, FaHistory } from "react-icons/fa";
import DpdpMultilingualNoticeModal from "./DpdpMultilingualNoticeModal";

export default function UserConsentPreferencesSection({ user, onUpdateUser }) {
  const [marketingConsent, setMarketingConsent] = useState(
    Boolean(user?.consentRecords?.marketingConsent)
  );
  const [analyticsConsent, setAnalyticsConsent] = useState(
    Boolean(user?.consentRecords?.analyticsConsent)
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  useEffect(() => {
    if (user?.consentRecords) {
      setMarketingConsent(Boolean(user.consentRecords.marketingConsent));
      setAnalyticsConsent(Boolean(user.consentRecords.analyticsConsent));
    }
  }, [user?.consentRecords?.marketingConsent, user?.consentRecords?.analyticsConsent]);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleUpdatePreferences = async (newMarketing, newAnalytics) => {
    if (!user?.token) return;

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await axios.post(
        `${backendUrl}/api/users/consent`,
        {
          policyVersion: "2026.1-DPDP",
          marketingConsent: newMarketing,
          analyticsConsent: newAnalytics,
          noticeLanguage: user?.consentRecords?.noticeLanguage || "en",
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.success) {
        setMarketingConsent(newMarketing);
        setAnalyticsConsent(newAnalytics);
        setSuccessMsg(
          "Your consent preferences and statutory withdrawal status have been updated and logged."
        );

        if (onUpdateUser) {
          const updatedUser = {
            ...user,
            consentRecords: res.data.consentRecords,
          };
          onUpdateUser(updatedUser);
        }
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to update consent preferences. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-indigo-100 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-50 rounded-bl-full -z-0 opacity-50"></div>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-700 to-[#3650AD] rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
              <FaShieldAlt />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#1a1a2e]">
                  Consent & Privacy Preferences
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                  DPDP Act Sec. 6(4)
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Exercise your statutory Right to Review or Withdraw Consent at any time
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNoticeModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <FaGlobe className="text-xs" />
            <span>8th Schedule Notice (बहुभाषी सूचना)</span>
          </button>
        </div>

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <FaCheckCircle className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <FaTimesCircle className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Itemised Granular Consent Options */}
        <div className="space-y-3 pt-1">
          {/* 1. Essential Processing */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-gray-900 text-xs block">
                1. Core Account Authentication & Security
              </span>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-xl">
                Essential to maintain your profile, authenticate login sessions, and protect against bot spam or fraudulent petition signatures.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg uppercase tracking-wider shrink-0 self-start sm:self-auto">
              Mandatory / Always Active
            </span>
          </div>

          {/* 2. Marketing / Milestone Updates */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 transition">
            <div className="space-y-0.5">
              <span className="font-bold text-gray-900 text-xs block">
                2. Civic Milestone & Petition Status Updates
              </span>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-xl">
                Receive important email and SMS notifications when petitions you created or signed reach signature milestones or achieve victory.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <span className={`text-[11px] font-bold ${marketingConsent ? "text-indigo-600" : "text-gray-400"}`}>
                {marketingConsent ? "Consent Granted" : "Consent Withdrawn"}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  disabled={loading}
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    setMarketingConsent(nextVal);
                    handleUpdatePreferences(nextVal, analyticsConsent);
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* 3. Analytics Tracking */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 transition">
            <div className="space-y-0.5">
              <span className="font-bold text-gray-900 text-xs block">
                3. Privacy-Friendly Platform Performance Analytics
              </span>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-xl">
                Allows SoSign to collect anonymous telemetry to diagnose system errors, monitor latency, and optimize user experience.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <span className={`text-[11px] font-bold ${analyticsConsent ? "text-indigo-600" : "text-gray-400"}`}>
                {analyticsConsent ? "Consent Granted" : "Consent Withdrawn"}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  disabled={loading}
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    setAnalyticsConsent(nextVal);
                    handleUpdatePreferences(marketingConsent, nextVal);
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Statutory Note on Withdrawal Ease */}
        <div className="pt-2 text-[11px] text-gray-500 flex items-center justify-between flex-wrap gap-2">
          <span className="italic">
            Under Section 6(4) of the DPDP Act 2023, withdrawing consent is as easy as granting it.
          </span>
          {loading && (
            <span className="text-indigo-600 font-bold flex items-center gap-1.5">
              <FaSpinner className="animate-spin" /> Saving proof of consent...
            </span>
          )}
        </div>
      </div>

      {/* Multilingual Notice Modal */}
      <DpdpMultilingualNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
      />
    </div>
  );
}
