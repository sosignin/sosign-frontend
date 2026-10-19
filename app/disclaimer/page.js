"use client";

import React from "react";
import Link from "next/link";
import {
  FaShieldHalved,
  FaBuildingColumns,
  FaScaleBalanced,
  FaGavel,
  FaBullhorn,
  FaHandHoldingDollar,
  FaTriangleExclamation,
  FaUserShield,
  FaEnvelope,
  FaPhone,
  FaArrowRight,
} from "react-icons/fa6";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Hero Section */}
        <div className="bg-gradient-to-br from-[#002050] via-[#1a3a6e] to-[#302D55] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-pink-300 text-[11px] font-bold uppercase tracking-wider border border-white/10">
              <FaShieldHalved className="text-xs" /> Legal Notice & Safe Harbor
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Platform Disclaimer
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Please read this disclaimer carefully before using SoSign. By accessing or using this platform, you agree to the terms outlined below.
            </p>
          </div>
        </div>

        {/* Highlight Alert: Non-Government Entity */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
          <FaTriangleExclamation className="text-amber-600 text-base shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold block text-sm text-amber-950">
              Non-Governmental Entity Notice
            </span>
            <p>
              SoSign is an independent civic platform operated by <strong>LEO MEO IT Solution Private Limited</strong>. It is <strong>NOT</strong> affiliated with, authorized by, or an agency of the Government of India or any State Government. Petitions are civic initiatives and do <em>not</em> constitute official RTI applications, court filings (PIL), or police complaints (FIR).
            </p>
          </div>
        </div>

        {/* 5 Core Disclaimer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Card 1: Intermediary Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaScaleBalanced className="text-[#3650AD]" />
              <h3>Intermediary Safe Harbor (IT Act, 2000)</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              SoSign acts strictly as an <strong>Intermediary</strong> under Section 2(1)(w) and Section 79 of the Information Technology Act, 2000. All petitions, comments, and media are <strong>User-Generated Content (UGC)</strong>. Authors are solely and personally responsible for the veracity and legality of their claims.
            </p>
          </div>

          {/* Card 2: No Legal/Professional Advice */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaGavel className="text-[#F43676]" />
              <h3>No Legal or Professional Advice</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Content on SoSign is for public awareness and democratic discussion only. Nothing on this website constitutes legal counsel, advocate representation, financial advice, or medical guidance. Users should consult licensed professionals for specific matters.
            </p>
          </div>

          {/* Card 3: No Guarantee of Outcomes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaBullhorn className="text-emerald-600" />
              <h3>No Guarantee of Petition Outcomes</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Starting or signing a petition does not guarantee that targeted decision-makers, government officials, or corporations will review, accept, or act upon it. Digital signatures reflect voluntary public sentiment and carry no statutory voting power.
            </p>
          </div>

          {/* Card 4: Voluntary Crowdfunding */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaHandHoldingDollar className="text-amber-600" />
              <h3>Voluntary Contributions</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Pledges and contributions made to promote petitions or support the platform are voluntary civic contributions. They do not constitute investments, shares, loans, or political party donations. Payments are processed securely via RBI-authorized payment aggregators.
            </p>
          </div>

        </div>

        {/* Limitation of Liability Strip */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900">Limitation of Liability:</strong> Platform services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. To the fullest extent permitted by Indian law, SoSign and its operators disclaim liability for any indirect, incidental, or consequential damages resulting from user content or platform use.
        </div>

        {/* Grievance Officer Strip */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-pink-300">
              <FaUserShield className="text-base" />
              <span>Grievance Redressal Officer</span>
            </div>
            <p className="text-slate-300">
              Mr. Narendra Kumar (Data Protection & Grievance Redressal Officer)
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
              <span>Email: <a href="mailto:grievance@sosign.in" className="text-white underline font-semibold">grievance@sosign.in</a></span>
              <span>•</span>
              <span>Helpline: <a href="tel:+919323677688" className="text-white underline font-semibold">+91 9323677688</a></span>
              <span>•</span>
              <span>Response: Acknowledged within 24h</span>
            </div>
          </div>

          <Link
            href="/contact?type=grievance"
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            <span>Report Content</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-2">
          <Link href="/privacy" className="hover:text-[#3650AD] underline transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-[#3650AD] underline transition">Terms & Conditions</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-[#3650AD] underline transition">Contact Support</Link>
        </div>

      </div>
    </div>
  );
}
