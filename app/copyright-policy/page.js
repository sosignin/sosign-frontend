"use client";

import React from "react";
import Link from "next/link";
import {
  FaCopyright,
  FaShieldHalved,
  FaFileLines,
  FaShareNodes,
  FaScaleBalanced,
  FaEnvelope,
  FaArrowRight,
  FaPrint,
} from "react-icons/fa6";

export default function CopyrightPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-6 lg:px-8 print:py-4 print:px-2 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Hero Section */}
        <div className="bg-gradient-to-br from-[#002050] via-[#1a3a6e] to-[#302D55] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg print:bg-white print:bg-none print:text-black print:border print:border-black print:shadow-none print:p-6">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-pink-300 text-[11px] font-bold uppercase tracking-wider border border-white/10 print:border-black print:text-black print:bg-white">
              <FaCopyright className="text-xs" /> Intellectual Property & Usage Rights
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight print:text-black">
              Copyright Policy
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed print:text-black">
              Guidelines regarding the ownership, licensing, and protection of content, trademarks, and user petitions on SoSign.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 hover:border-white/40 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Print or Save as PDF"
              >
                <FaPrint className="text-xs" />
                <span>Print Policy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overview Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3.5 text-xs text-blue-950 shadow-2xs">
          <FaShieldHalved className="text-[#3650AD] text-base shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold block text-sm text-[#002050]">
              Respect for Creative & Intellectual Rights
            </span>
            <p>
              SoSign operates in strict compliance with the <strong>Indian Copyright Act, 1957</strong> and international intellectual property conventions. We protect both platform intellectual property and the authentic voices and creative works of citizen petition creators.
            </p>
          </div>
        </div>

        {/* 4 Core Copyright Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Point 1: Platform Intellectual Property */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaCopyright className="text-[#3650AD]" />
              <h3>1. SoSign Platform Materials</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              All website source code, algorithms, user interface designs, visual layouts, logos, trademarks, and branding on <strong className="text-slate-800">sosign.in</strong> are the exclusive property of <strong>LEO MEO IT Solution</strong>. Reproduction, decompilation, or unauthorized commercial imitation is strictly prohibited without written consent.
            </p>
          </div>

          {/* Point 2: User-Generated Content & Ownership */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaFileLines className="text-[#F43676]" />
              <h3>2. Ownership of User Petitions</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Petition creators retain full copyright ownership of the original text, stories, and photographs they submit. By publishing a campaign on SoSign, you grant us a worldwide, royalty-free, non-exclusive license to display, broadcast, index, and formally submit your petition to decision-makers and media to advance your civic cause.
            </p>
          </div>

          {/* Point 3: Fair Use & Media Citation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaShareNodes className="text-emerald-600" />
              <h3>3. Fair Use & Media Citation</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Citizens, researchers, educational institutions, and news media are encouraged to quote excerpts from petitions, cite signature totals, and share campaign links for public awareness, commentary, and journalism, provided that clear credit and a direct link to the original petition on <strong>SoSign.in</strong> are provided.
            </p>
          </div>

          {/* Point 4: Takedown & Infringement Claims */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaScaleBalanced className="text-purple-600" />
              <h3>4. Copyright Takedown Procedure</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              If you believe any content or photograph published on SoSign infringes your copyright, notify our Grievance Officer immediately with: (1) identification of the copyrighted work, (2) the URL of the infringing petition, and (3) proof of ownership or authorization. Valid claims are investigated within <strong>24 to 48 hours</strong>.
            </p>
          </div>

        </div>

        {/* Contact Callout */}
        <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <FaEnvelope className="text-[#F43676] text-lg shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Need to submit a copyright notice?</span>
              <p className="text-slate-600 text-[11px]">
                Email our Grievance Redressal Officer at <a href="mailto:grievance@sosign.in" className="text-[#3650AD] font-bold underline">grievance@sosign.in</a> with full documentation.
              </p>
            </div>
          </div>
          <Link
            href="/contact?type=copyright"
            className="px-4 py-2 bg-gradient-to-r from-[#F43676] to-[#d81b60] text-white font-bold rounded-xl text-xs hover:opacity-95 transition flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>Submit IP Notice</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {/* Bottom Print Action Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <span className="text-slate-600">
            Need an official copy for legal records, compliance, or offline reading?
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
          <Link href="/hyperlinking-policy" className="hover:text-[#3650AD] underline transition">Hyperlinking Policy</Link>
          <span>•</span>
          <Link href="/disclaimer" className="hover:text-[#3650AD] underline transition">Disclaimer</Link>
          <span>•</span>
          <Link href="/help" className="hover:text-[#3650AD] underline transition">Help Center</Link>
        </div>

      </div>
    </div>
  );
}
