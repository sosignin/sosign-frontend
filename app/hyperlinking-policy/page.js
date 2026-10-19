"use client";

import React from "react";
import Link from "next/link";
import {
  FaLink,
  FaArrowUpRightFromSquare,
  FaShieldHalved,
  FaWindowMaximize,
  FaTriangleExclamation,
  FaEnvelope,
  FaArrowRight,
  FaPrint,
} from "react-icons/fa6";

export default function HyperlinkingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-6 lg:px-8 print:py-4 print:px-2 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Hero Section */}
        <div className="bg-gradient-to-br from-[#002050] via-[#1a3a6e] to-[#302D55] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg print:bg-white print:bg-none print:text-black print:border print:border-black print:shadow-none print:p-6">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-pink-300 text-[11px] font-bold uppercase tracking-wider border border-white/10 print:border-black print:text-black print:bg-white">
              <FaLink className="text-xs" /> Digital Linking Guidelines
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight print:text-black">
              Hyperlinking Policy
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed print:text-black">
              Rules and standards for linking to SoSign and how external links are handled across petitions.
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
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5 text-xs text-emerald-950 shadow-2xs">
          <FaShieldHalved className="text-emerald-600 text-base shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold block text-sm text-emerald-950">
              Open Linking for Public Awareness
            </span>
            <p>
              SoSign encourages open, democratic linking to civic petitions to empower citizens and raise public awareness. This policy outlines conditions for inbound and outbound hyperlinks.
            </p>
          </div>
        </div>

        {/* 4 Core Hyperlinking Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Point 1: Links to SoSign from External Sites */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaLink className="text-[#3650AD]" />
              <h3>1. Linking to SoSign (Inbound Links)</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Prior permission is <strong>not required</strong> to link directly to <strong className="text-slate-800">sosign.in</strong> or any public petition. Anyone may link to our campaigns from websites, blogs, newsletters, or social media. However, links must not suggest false partnership, government endorsement, or commercial sponsorship by SoSign.
            </p>
          </div>

          {/* Point 2: Frame Restriction */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaWindowMaximize className="text-[#F43676]" />
              <h3>2. No Framing Allowed</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              We do <strong>not permit</strong> our web pages or petition interfaces to be loaded inside HTML frames, iframes, or embedded web containers on other websites. SoSign links must open in a distinct, full browser window or tab under our legitimate URL (<code>https://sosign.in/...</code>).
            </p>
          </div>

          {/* Point 3: Links to External Websites */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaArrowUpRightFromSquare className="text-emerald-600" />
              <h3>3. External Links (Outbound Links)</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Petitions, news items, and campaign dossiers on SoSign may contain hyperlinks to external websites (such as news reports, government gazettes, NGO pages, or institutional portals). These are provided solely for public context and evidence verification. SoSign does not guarantee the continuous availability, accuracy, or privacy policies of external third-party sites.
            </p>
          </div>

          {/* Point 4: Link Removal & Updates */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FaTriangleExclamation className="text-amber-600" />
              <h3>4. Link Removal & Dispute Policy</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              If an external site owner, trademark holder, or institution wishes to update or request the removal of a link pointing to their domain from a petition, they may write to our support desk. We promptly review and correct or disassociate broken, malicious, or objected links within <strong>48 hours</strong>.
            </p>
          </div>

        </div>

        {/* Contact Callout */}
        <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <FaEnvelope className="text-[#F43676] text-lg shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Questions regarding linking?</span>
              <p className="text-slate-600 text-[11px]">
                Contact our web relations team at <a href="mailto:contact@sosign.in" className="text-[#3650AD] font-bold underline">contact@sosign.in</a> or our Grievance Officer.
              </p>
            </div>
          </div>
          <Link
            href="/contact?type=linking"
            className="px-4 py-2 bg-gradient-to-r from-[#F43676] to-[#d81b60] text-white font-bold rounded-xl text-xs hover:opacity-95 transition flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>Contact Web Team</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {/* Bottom Print Action Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <span className="text-slate-600">
            Need an official copy for web compliance, technical review, or offline reading?
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
          <Link href="/disclaimer" className="hover:text-[#3650AD] underline transition">Disclaimer</Link>
          <span>•</span>
          <Link href="/help" className="hover:text-[#3650AD] underline transition">Help Center</Link>
        </div>

      </div>
    </div>
  );
}
