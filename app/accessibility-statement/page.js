"use client";

import React from "react";
import Link from "next/link";
import {
  FaUniversalAccess,
  FaShieldHalved,
  FaKeyboard,
  FaVolumeHigh,
  FaEnvelope,
  FaArrowRight,
  FaPrint,
  FaCheck,
  FaPhone,
  FaCode,
  FaUsers,
} from "react-icons/fa6";

export default function AccessibilityStatementPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-6 lg:px-8 print:py-4 print:px-2 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Hero Section */}
        <div className="bg-gradient-to-br from-[#002050] via-[#1a3a6e] to-[#302D55] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg print:bg-white print:bg-none print:text-black print:border print:border-black print:shadow-none print:p-6">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-pink-300 text-[11px] font-bold uppercase tracking-wider border border-white/10 print:border-black print:text-black print:bg-white">
              <FaUniversalAccess className="text-xs" /> Equal Digital Opportunity for Every Citizen
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight print:text-black">
              Accessibility Statement
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed print:text-black">
              Our principles, technical accommodations, and compliance framework ensuring inclusive democratic participation for all citizens.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 hover:border-white/40 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Print or Save as PDF"
              >
                <FaPrint className="text-xs" />
                <span>Print Accessibility Statement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Our Accessibility Pledge (Unique Commitment) */}
        <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3.5 text-xs text-blue-950 shadow-2xs">
          <FaShieldHalved className="text-[#3650AD] text-base shrink-0 mt-0.5" />
          <div className="space-y-1.5 leading-relaxed">
            <h2 className="font-bold block text-sm text-[#002050]">
              1. Our Accessibility Pledge
            </h2>
            <p className="text-slate-700 leading-relaxed text-xs">
              At SoSign, universal inclusion is fundamental to our civic mission. We believe every citizen—regardless of sensory, cognitive, physical, or neurological ability—must have equal, autonomous access to start civic campaigns, sign petitions, and champion public interest causes.
            </p>
            <p className="text-slate-700 leading-relaxed text-xs">
              Our digital infrastructure is built from the ground up to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>, uphold the accessibility mandates of India&apos;s <strong>Rights of Persons with Disabilities (RPwD) Act, 2016</strong>, and align with the national <strong>Guidelines for Indian Government Websites (GIGW)</strong>.
            </p>
          </div>
        </div>

        {/* Section 2: Assistive Features & Architecture */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <FaKeyboard className="text-[#F43676]" />
            <h2>2. Built-in Assistive Accommodations</h2>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            We have engineered a comprehensive suite of assistive features across our user interface to deliver an unhindered browsing and petition signing experience:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaCheck className="text-emerald-600 text-[10px]" /> Full Keyboard Interactivity
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                All platform actions, modal dialogs, and petition forms are fully operational via Tab, Shift+Tab, Enter, Space, and Esc without requiring mouse interaction.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaCheck className="text-emerald-600 text-[10px]" /> High-Visibility Focus Rings
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Clear, distinct outline indicators (:focus-visible) highlight the currently active button, link, or input field to assist sighted keyboard and low-vision users.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaCheck className="text-emerald-600 text-[10px]" /> Direct Content Bypass (Skip Link)
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                A top-level skip link enables keyboard and screen reader users to bypass repetitive header navigation and jump immediately to primary page content.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaCheck className="text-emerald-600 text-[10px]" /> High Contrast & Resizability
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Text content exceeds a 7:1 contrast ratio against backgrounds, supporting fluid browser text scaling up to 200% without loss of layout or functionality.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaCheck className="text-emerald-600 text-[10px]" /> Vestibular & Motion Safeguards
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Automatically honors system-level prefers-reduced-motion preferences to suppress rapid transitions and animations for motion-sensitive users.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaCheck className="text-emerald-600 text-[10px]" /> Non-Visual Image Descriptions
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Every petition photo, illustration, and icon is tagged with meaningful alternative text or marked decorative to prevent auditory clutter.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Screen Reader & Synthesizer Support */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <FaVolumeHigh className="text-[#3650AD]" />
            <h2>3. Screen Reader Compatibility & Assistive Tech</h2>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            Our codebase adheres strictly to semantic HTML5 standards and WAI-ARIA authoring practices. Heading levels (h1 through h6), structural landmarks (nav, main, header, footer), and dynamic state attributes (aria-expanded, role=&quot;dialog&quot;) enable seamless auditory narration across all major speech synthesizers:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="font-bold text-slate-900 block text-xs">NVDA</span>
              <span className="text-[10px] text-slate-500 block">Windows (Firefox / Chrome / Edge)</span>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-[10px]">Verified</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="font-bold text-slate-900 block text-xs">JAWS</span>
              <span className="text-[10px] text-slate-500 block">Windows (Edge / Chrome)</span>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-[10px]">Verified</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="font-bold text-slate-900 block text-xs">VoiceOver</span>
              <span className="text-[10px] text-slate-500 block">Apple macOS & iOS Safari</span>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-[10px]">Verified</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="font-bold text-slate-900 block text-xs">TalkBack</span>
              <span className="text-[10px] text-slate-500 block">Google Android Chrome</span>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-[10px]">Verified</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="font-bold text-slate-900 block text-xs">ChromeVox</span>
              <span className="text-[10px] text-slate-500 block">ChromeOS & Chrome Browser</span>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-[10px]">Verified</span>
            </div>
          </div>
        </div>

        {/* Section 4: Feedback & Barrier Reporting Desk */}
        <div className="p-5 bg-gradient-to-r from-rose-50 via-pink-50 to-slate-50 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <FaEnvelope className="text-[#F43676] text-xl shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="font-bold text-sm text-slate-900">4. Accessibility Assistance & Grievance Desk</h2>
              <p className="text-slate-700 leading-relaxed text-xs">
                We view accessibility as an ongoing journey of improvement. If you experience any barrier, unlabelled control, or difficulty using assistive technology on SoSign, please contact our dedicated Grievance Officer:
              </p>
              <div className="pt-1 text-slate-700 text-xs space-y-0.5">
                <p><strong>Accessibility Officer:</strong> Mr. Narendra Kumar (LEO MEO IT Solution)</p>
                <p><strong>Dedicated Email:</strong> <a href="mailto:grievance@sosign.in" className="text-[#3650AD] font-bold underline">grievance@sosign.in</a></p>
                <p className="flex items-center gap-1.5 text-slate-600 text-[11px] pt-0.5">
                  <FaPhone className="text-xs text-[#3650AD]" />
                  <span>Citizen Helpline: <strong>+91 93236 77688</strong> (Mon–Sat, 10:00 AM – 6:00 PM IST)</span>
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/contact?type=accessibility"
            className="px-4 py-2.5 bg-gradient-to-r from-[#F43676] to-[#d81b60] text-white font-bold rounded-xl text-xs hover:opacity-95 transition flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>Report Barrier</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {/* Bottom Print Action Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <span className="text-slate-600">
            Need an official copy of this Accessibility Statement for institutional records or compliance filing?
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
          <span>•</span>
          <Link href="/help" className="hover:text-[#3650AD] underline transition">Help Center</Link>
        </div>

      </div>
    </div>
  );
}
