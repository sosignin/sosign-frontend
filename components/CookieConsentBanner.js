"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, Settings, Check, X, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CONSENT_STORAGE_KEY = "sosign_dpdp_consent_v1";
const POLICY_VERSION = "2026.1-DPDP";

export default function CookieConsentBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        // Small delay so user sees smooth entrance
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveConsent = async (prefs) => {
    try {
      const consentRecord = {
        version: POLICY_VERSION,
        timestamp: new Date().toISOString(),
        preferences: prefs,
      };
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentRecord));
      setVisible(false);

      // If user is logged in, sync consent to backend for statutory record keeping
      if (user && user.token) {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        fetch(`${backendUrl}/api/users/consent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            policyVersion: POLICY_VERSION,
            analyticsConsent: prefs.analytics,
            marketingConsent: prefs.marketing,
          }),
        }).catch((err) => console.debug("Consent sync err:", err));
      }
    } catch (e) {
      setVisible(false);
    }
  };

  const handleAcceptAll = () => {
    const all = { necessary: true, analytics: true, marketing: true };
    setPreferences(all);
    saveConsent(all);
  };

  const handleEssentialOnly = () => {
    const essential = { necessary: true, analytics: false, marketing: false };
    setPreferences(essential);
    saveConsent(essential);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-auto lg:right-8 lg:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-2xl border border-slate-200/90 text-slate-800 space-y-4">
        {/* Banner Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#3650AD]">
            <ShieldCheck className="w-5 h-5 text-[#3650AD]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Privacy Notice & Citizen Consent</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                DPDP Act 2023
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              SoSign respects your digital privacy. We use strictly necessary cookies to ensure platform security and authentication. With your permission, we also use privacy-friendly analytics and transactional communications to keep you updated on your petitions.
            </p>
          </div>
        </div>

        {/* Granular Settings Toggle (if clicked) */}
        {showSettings && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">1. Strictly Necessary (Authentication & Security)</span>
                <span className="text-[11px] text-slate-500">Required for login sessions, CSRF, and security headers.</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Always Active</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/70 pt-2">
              <div>
                <span className="font-bold text-slate-900 block">2. Privacy-First Analytics</span>
                <span className="text-[11px] text-slate-500">Helps us monitor server uptime and platform performance.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#3650AD]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/70 pt-2">
              <div>
                <span className="font-bold text-slate-900 block">3. Milestone & Civic Updates</span>
                <span className="text-[11px] text-slate-500">Notifications when petitions you signed achieve victory or updates.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#3650AD]"></div>
              </label>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Link
              href="/privacy"
              className="text-[11px] text-[#3650AD] font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300 text-xs">•</span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              {showSettings ? "Hide Options" : "Customize"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEssentialOnly}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              Essential Only
            </button>

            {showSettings ? (
              <button
                onClick={handleSaveCustom}
                className="px-4 py-1.5 rounded-xl bg-[#3650AD] text-white text-xs font-bold hover:bg-[#2b4191] transition shadow-sm"
              >
                Save Preferences
              </button>
            ) : (
              <button
                onClick={handleAcceptAll}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#3650AD] to-[#F43676] text-white text-xs font-bold hover:opacity-95 transition shadow-sm"
              >
                Accept All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
