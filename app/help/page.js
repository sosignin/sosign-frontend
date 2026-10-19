"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaCircleQuestion,
  FaFileSignature,
  FaStore,
  FaSchool,
  FaMapMarkerAlt,
  FaCamera,
  FaBullhorn,
  FaCheckCircle,
  FaArrowRight,
  FaUserPlus,
  FaMagnifyingGlass,
  FaHandHoldingHand,
  FaShieldHalved,
  FaPhone,
  FaEnvelope,
  FaPrint,
} from "react-icons/fa6";

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'petition' | 'stall'

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-6 lg:px-8 print:py-4 print:px-2 print:bg-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Hero Section */}
        <div className="bg-gradient-to-br from-[#002050] via-[#1a3a6e] to-[#302D55] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl text-center space-y-3 print:bg-white print:bg-none print:text-black print:border print:border-black print:shadow-none print:p-6">
          <div className="relative z-10 max-w-3xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider border border-pink-400/30 print:border-black print:text-black print:bg-white">
              <FaCircleQuestion className="text-xs" /> Citizen Help & Knowledge Base
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight print:text-black">
              How Can We Help You?
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto print:text-black">
              Simple, step-by-step guides on how to start an impactful civic petition and how to report junk food stalls within 50m of schools.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 hover:border-white/40 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Print or Save as PDF"
              >
                <FaPrint className="text-xs" />
                <span>Print Help Guide</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 relative z-10 print:hidden">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#F43676] text-white shadow-md shadow-pink-500/20"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              All Guides
            </button>
            <a
              href="#start-petition"
              onClick={() => setActiveTab("petition")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "petition"
                  ? "bg-[#F43676] text-white shadow-md shadow-pink-500/20"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              <FaFileSignature className="text-xs" />
              <span>How to Start a Petition</span>
            </a>
            <a
              href="#report-stall"
              onClick={() => setActiveTab("stall")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "stall"
                  ? "bg-[#F43676] text-white shadow-md shadow-pink-500/20"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              <FaStore className="text-xs" />
              <span>How to Report a Food Stall</span>
            </a>
          </div>
        </div>

        {/* SECTION 1: HOW TO START A PETITION */}
        {(activeTab === "all" || activeTab === "petition") && (
          <section id="start-petition" className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#3650AD] flex items-center justify-center text-lg shrink-0">
                  <FaFileSignature />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#002050]">
                    How to Start a Petition on SoSign
                  </h2>
                  <p className="text-xs text-slate-500">
                    Turn public concerns into organized, verified civic momentum in 5 easy steps
                  </p>
                </div>
              </div>

              <Link
                href="/start-petition"
                className="px-4 py-2 bg-gradient-to-r from-[#3650AD] to-[#283c86] text-white text-xs font-bold rounded-xl hover:opacity-95 transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto shrink-0"
              >
                <span>Start a Petition</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
              
              {/* Step 1 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#3650AD] text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Create Account
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Sign up with your verified email or mobile number via instant OTP. A verified profile ensures your petition carries democratic legitimacy.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#3650AD] text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Define the Issue
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Give your petition a clear, compelling title. Explain what problem exists, why it matters, and identify the exact decision-maker (e.g. Municipal Commissioner, Ministry, Principal).
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#3650AD] text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Add Evidence
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Attach photographs, location landmarks, news articles, or official reference documents. Visual proof dramatically boosts citizen trust and sign-up rates.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#3650AD] text-white font-black text-xs flex items-center justify-center">
                  4
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Mobilize & Share
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Launch your petition and share the link on WhatsApp, X/Twitter, Instagram, and resident groups (RWAs). Supporters can sign in 10 seconds.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#3650AD] text-white font-black text-xs flex items-center justify-center">
                  5
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Deliver & Win
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Once you reach signature milestones (e.g., 500 or 10,000 signatures), compile the verified dossier to present to lawmakers and celebrate your victory!
                </p>
              </div>

            </div>

            {/* Pro Tip Box */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-950">
              <span className="text-base shrink-0">💡</span>
              <p className="leading-relaxed">
                <strong>Pro Tip:</strong> Petitions with a high-resolution photo and a specific, achievable solution gather <strong>3x more verified signatures</strong> than generic complaints. Be polite, factual, and focused on solutions.
              </p>
            </div>
          </section>
        )}

        {/* SECTION 2: HOW TO REPORT A FOOD STALL */}
        {(activeTab === "all" || activeTab === "stall") && (
          <section id="report-stall" className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#F43676] flex items-center justify-center text-lg shrink-0">
                  <FaStore />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#002050]">
                    How to Report a School Buffer Food Stall
                  </h2>
                  <p className="text-xs text-slate-500">
                    Protect children by enforcing the statutory 50-meter junk food & tobacco buffer zone around schools
                  </p>
                </div>
              </div>

              <Link
                href="/my-grievances"
                className="px-4 py-2 bg-gradient-to-r from-[#F43676] to-[#d81b60] text-white text-xs font-bold rounded-xl hover:opacity-95 transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto shrink-0"
              >
                <span>Report Food Stall</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
              
              {/* Step 1 */}
              <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#F43676] text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Open Vigilance Map
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Click <strong>&quot;Report Food Stall&quot;</strong> on any petition or in your citizen grievances dashboard to open the school vigilance report form.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#F43676] text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Search & Point School
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Select your district, then use the <strong>map search bar</strong> to search the school name. Tap &quot;Point Map 🎯&quot; to center the view and highlight the <strong>50m violation circle</strong>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#F43676] text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Pinpoint Stall GPS
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Drag the red marker (📍) to the vendor&apos;s exact position near the school gate or footpath, or tap <strong>&quot;Recapture GPS&quot;</strong> if standing right in front of the stall.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#F43676] text-white font-black text-xs flex items-center justify-center">
                  4
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Describe & Add Photos
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Enter the shop/vendor name and describe the health risk (e.g. tobacco, expired food, junk snacks). You can use speech mic dictation and upload up to 5 photos.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-200/80 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#F43676] text-white font-black text-xs flex items-center justify-center">
                  5
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Submit & Enforce
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Review calculated distance (e.g. 15m from school). Confirm submission to generate a unique Grievance ID (e.g. <code>GRV-MH-xxxx</code>) for municipal inspection.
                </p>
              </div>

            </div>

            {/* Statutory Regulation Callout */}
            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-950">
              <span className="text-base shrink-0">⚠️</span>
              <p className="leading-relaxed">
                <strong>Statutory Regulation:</strong> Under government guidelines and FSSAI directives, selling high-fat, sugar, or tobacco products within <strong>50 meters of any school campus gate</strong> is strictly prohibited. Verified reports are submitted directly to municipal food safety authorities.
              </p>
            </div>
          </section>
        )}

        {/* SECTION 3: NEED EXTRA ASSISTANCE? */}
        <div className="bg-gradient-to-r from-slate-100 to-blue-50/60 rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FaShieldHalved className="text-[#3650AD]" />
              Still have questions or facing technical difficulty?
            </h4>
            <p className="text-slate-600 text-[11px]">
              Our citizen support desk is available to assist with campaign strategy, verification issues, or grievance queries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/faq"
              className="px-3.5 py-2 bg-white text-slate-700 font-bold rounded-xl border border-slate-300 hover:bg-slate-50 transition text-xs shadow-2xs"
            >
              Read FAQs
            </Link>
            <Link
              href="/contact"
              className="px-3.5 py-2 bg-[#3650AD] text-white font-bold rounded-xl hover:bg-[#2b4191] transition text-xs shadow-xs"
            >
              Contact Support Desk
            </Link>
          </div>
        </div>

        {/* Bottom Print Action Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <span className="text-slate-600">
            Want to print or save these step-by-step citizen guides for offline sharing or community meetings?
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#302D55] hover:bg-[#1a3a6e] text-white font-semibold transition-all cursor-pointer shadow-sm shrink-0"
          >
            <FaPrint className="text-xs" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Bottom Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 pt-1 print:hidden">
          <Link href="/privacy" className="hover:text-[#3650AD] underline transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-[#3650AD] underline transition">Terms & Conditions</Link>
          <span>•</span>
          <Link href="/copyright-policy" className="hover:text-[#3650AD] underline transition">Copyright Policy</Link>
          <span>•</span>
          <Link href="/hyperlinking-policy" className="hover:text-[#3650AD] underline transition">Hyperlinking Policy</Link>
          <span>•</span>
          <Link href="/disclaimer" className="hover:text-[#3650AD] underline transition">Disclaimer</Link>
        </div>

      </div>
    </div>
  );
}
