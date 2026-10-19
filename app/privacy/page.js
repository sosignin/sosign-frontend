"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaShieldHalved,
  FaLock,
  FaDatabase,
  FaUserCheck,
  FaEnvelope,
  FaFileShield,
  FaCircleCheck,
  FaHandHoldingDollar,
  FaIdCard,
  FaScaleBalanced,
  FaClockRotateLeft,
  FaUserSlash,
  FaFileLines,
  FaChildren,
  FaBuildingColumns,
  FaTriangleExclamation,
  FaArrowRight,
} from "react-icons/fa6";
import { FaLanguage, FaGlobe } from "react-icons/fa";
import { EIGHTH_SCHEDULE_LANGUAGES, STATUTORY_NOTICES } from "@/components/DpdpMultilingualNoticeModal";

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [noticeLang, setNoticeLang] = useState("en");

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-br from-[#002050] via-[#1a3a6e] to-[#302D55] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#F43676] rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-emerald-400/30">
                <FaGlobe className="text-xs" /> Offering Services to Users in India
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
                <FaShieldHalved className="text-xs" /> Statutory Privacy Notice
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Privacy Policy & DPDP Notice
            </h1>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
              How SoSign provides civic advocacy services to users across India, why we collect personal and KYC data, and how we protect and process it under the Digital Personal Data Protection (DPDP) Act, 2023.
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-pink-200/90 font-mono">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Digital Personal Data Protection (DPDP) Act, 2023
              </span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Section 3 & 5 Territorial Scope (India)
              </span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Aadhaar Act, 2016 (UIDAI Regulations)
              </span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                IT Act, 2000 & SPDI Rules
              </span>
            </div>
            <p className="text-[11px] text-gray-400 pt-1">
              Last Updated & Effective Date: October 2026 | Document Reference: SOSIGN-DPDP-2026-V2 | Jurisdiction: Republic of India
            </p>
          </div>
        </div>

        {/* Quick Navigation / Key Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <span className="text-[#3650AD] text-xl font-black block">Zero</span>
            <span className="text-xs text-slate-600 font-medium">Plaintext Aadhaar Storage</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <span className="text-[#F43676] text-xl font-black block">100%</span>
            <span className="text-xs text-slate-600 font-medium">Citizen Consent Gated</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <span className="text-emerald-600 text-xl font-black block">24h</span>
            <span className="text-xs text-slate-600 font-medium">Grievance Acknowledgment</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <span className="text-purple-600 text-xl font-black block">Right to Forget</span>
            <span className="text-xs text-slate-600 font-medium">Self-Service Erasure</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white shadow-sm rounded-3xl p-6 md:p-10 space-y-10 border border-gray-200/80 text-slate-800 text-sm leading-relaxed">
          
          {/* Plain-Language Citizen Explainer (DPDP Section 5 Compliance) */}
          <div className="p-6 bg-gradient-to-br from-blue-50 via-slate-50 to-pink-50 border-2 border-blue-200/80 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#3650AD] text-white rounded-xl text-sm">
                  <FaShieldHalved />
                </span>
                <div>
                  <h3 className="text-base font-black text-[#002050]">
                    Statutory Privacy Notice (DPDP Act 2023 - Section 5)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Accessible in English and Eighth Schedule Indian languages per Section 5(3)
                  </p>
                </div>
              </div>

              <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300 text-xs self-start sm:self-auto">
                DPDP Act 2023 Compliant
              </span>
            </div>

            {/* Eighth Schedule Language Switcher Tabs */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <FaLanguage className="text-[#3650AD] text-sm" />
                <span>Read Notice in Eighth Schedule Languages (भाषा चुनें):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/80 rounded-xl border border-slate-200">
                {EIGHTH_SCHEDULE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setNoticeLang(lang.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      noticeLang === lang.code
                        ? "bg-[#3650AD] text-white shadow-sm"
                        : "bg-gray-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] opacity-75 font-normal">({lang.name})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Localized Notice Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              {(STATUTORY_NOTICES[noticeLang] || STATUTORY_NOTICES.en).sections.map((sec, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <strong className="text-slate-900 block font-bold text-xs">{sec.heading}</strong>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{sec.content}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-200/80">
              <span className="text-slate-600">
                <strong>Data Fiduciary:</strong> LEO MEO IT Solution (SoSign) | <strong>Grievance Email:</strong> grievance@sosign.in
              </span>
              <span className="text-slate-500 text-[11px]">
                Language selected: {EIGHTH_SCHEDULE_LANGUAGES.find(l => l.code === noticeLang)?.nativeName || "English"}
              </span>
            </div>
          </div>

          {/* Dedicated Section: Services Offered to Users in India */}
          <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-300 rounded-2xl space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-emerald-600 text-white rounded-xl text-base shadow-sm">
                <FaGlobe />
              </span>
              <div>
                <h3 className="text-base font-black text-emerald-950">
                  Territorial Scope: Services Offered to Users in India (DPDP Act, Section 3)
                </h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Dedicated civic platform serving citizens, residents, and organizations across all 28 States and 8 Union Territories
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>SoSign explicitly declares that it offers its digital civic petition, community advocacy, democratic participation, and public interest campaign services to users located in India.</strong> In strict compliance with <strong>Section 3(a) and Section 3(b) of the Digital Personal Data Protection (DPDP) Act, 2023</strong>, this policy governs the processing of digital personal data within the territory of India:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-3 bg-white/95 rounded-xl border border-emerald-200 space-y-1 shadow-2xs">
                <strong className="text-emerald-900 block font-bold">Pan-India Civic Service</strong>
                <p className="text-slate-600 text-[11px]">Empowering citizens, grassroots organizers, students, and resident welfare associations (RWAs) across India to advocate for civic reforms.</p>
              </div>
              <div className="p-3 bg-white/95 rounded-xl border border-emerald-200 space-y-1 shadow-2xs">
                <strong className="text-emerald-900 block font-bold">Indian Public Infrastructure</strong>
                <p className="text-slate-600 text-[11px]">Deeply integrated with Indian digital public rails: DigiLocker, UIDAI Aadhaar verification, PAN, Voter ID (EPIC), and RBI-regulated payment gateways (UPI, RuPay).</p>
              </div>
              <div className="p-3 bg-white/95 rounded-xl border border-emerald-200 space-y-1 shadow-2xs">
                <strong className="text-emerald-900 block font-bold">In-Country Data Sovereignty</strong>
                <p className="text-slate-600 text-[11px]">Primary databases, signature ledgers, and KYC proofs are hosted inside Indian data centers (AWS ap-south-1 Mumbai / NIC Cloud) subject to Indian laws.</p>
              </div>
            </div>
          </div>

          {/* Section 1: Data Fiduciary Identity & Scope */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              1. Identity of the Data Fiduciary & Services Offered to Users in India
            </h2>
            <p>
              This Privacy Notice is issued pursuant to <strong>Section 5 of the Digital Personal Data Protection (DPDP) Act, 2023</strong> by <strong>LEO MEO IT Solution</strong> (&ldquo;SoSign&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;Data Fiduciary&rdquo;). SoSign operates the civic petition and digital democracy platform accessible at <a href="https://sosign.in" className="text-[#3650AD] font-semibold underline">sosign.in</a> and its affiliated mobile and web applications.
            </p>
            <p>
              <strong>SoSign specifically offers its goods and services to users located in India.</strong> This document governs how we process the personal data of registered citizens, petition creators, signers, donors, visitors, and civic respondents (&ldquo;Data Principals&rdquo;) located across the territory of India. By accessing our services, creating an account, or signing a petition, you acknowledge the processing practices detailed herein under Indian legal jurisdiction.
            </p>
          </section>

          {/* Section 2: Why We Are Collecting Your Data */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              2. Why We Collect Your Personal Data (Explicit & Legitimate Purposes)
            </h2>
            <p className="text-slate-700">
              In strict adherence to the <strong>Purpose Limitation principle (Section 6 of the DPDP Act, 2023)</strong>, SoSign collects personal data only for clear, specific, transparent, and lawful purposes directly necessary to operate a credible civic democracy platform in India. We collect personal data for the following specific purposes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Purpose 1 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#3650AD] flex items-center justify-center font-black text-xs shrink-0">1</span>
                  <span>Providing & Operating Civic Advocacy Services in India</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To provide our petition creation and civic engagement services to users throughout India, enabling individuals, student groups, RWAs, and civil society organizations to launch public campaigns, mobilize community support, and build democratic momentum.
                </p>
              </div>

              {/* Purpose 2 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">2</span>
                  <span>Citizen Account Registration, Authentication & Security</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To create your account profile, securely verify your credentials via email/mobile OTP, manage passwords using bcrypt (10 rounds), maintain encrypted authentication sessions, and protect your account from unauthorized access, impersonation, or identity theft.
                </p>
              </div>

              {/* Purpose 3 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0">3</span>
                  <span>Verifying Genuine Citizen Signatures & Democratic Legitimacy</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To record verified digital signatures when you sign a petition. Government ministries, elected representatives, and municipal authorities require verifiable evidence that petition signers are authentic citizens, ensuring every campaign carries real democratic weight.
                </p>
              </div>

              {/* Purpose 4 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-rose-100 text-[#F43676] flex items-center justify-center font-black text-xs shrink-0">4</span>
                  <span>Eliminating Duplicate Signatures, Automated Bots & Campaign Fraud</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To maintain strict anti-fraud safeguards. We verify account uniqueness and utilize cryptographic hashing to prevent automated bots, scripts, fake email generators, or malicious actors from artificially inflating signatures or rigging petition counts.
                </p>
              </div>

              {/* Purpose 5 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs shrink-0">5</span>
                  <span>Voluntary Sovereign KYC Verification (Aadhaar, PAN, Voter ID)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To allow citizens to optionally verify their identity or constituency via DigiLocker, UIDAI Aadhaar OTP, Income Tax PAN, or Voter ID. <strong>We NEVER store 12-digit plaintext Aadhaar numbers or biometrics</strong>; only masked records (<code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">XXXXXXXX1234</code>) are retained.
                </p>
              </div>

              {/* Purpose 6 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">6</span>
                  <span>Presenting Petitions to Government Authorities & Decision-Makers</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To compile verified petition dossiers—including verified signature totals, general geographic spread by state/city, and public comments—to be formally submitted to government ministries, MPs, MLAs, municipal commissioners, educational institutions, or corporate leadership.
                </p>
              </div>

              {/* Purpose 7 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-xs shrink-0">7</span>
                  <span>Service Communications, OTPs & Milestone Alerts</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To send transactional messages, mobile OTP verification codes, petition milestone updates (e.g., reaching 500 or 10,000 signatures), responses from decision-makers, campaign victory announcements, and critical account security advisories.
                </p>
              </div>

              {/* Purpose 8 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0">8</span>
                  <span>Crowdfunding & Payments via Indian Systems (UPI / NetBanking)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To securely process voluntary crowdfunding contributions and platform subscriptions via RBI-regulated payment aggregators (supporting UPI, RuPay, debit/credit cards, and NetBanking), generating statutory tax invoices compliant with Indian GST and IT rules.
                </p>
              </div>

              {/* Purpose 9 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs shrink-0">9</span>
                  <span>Mandatory Statutory & Legal Compliance in India</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To satisfy statutory legal mandates under Indian law, including Section 6 affirmative consent logs under the DPDP Act 2023, the Information Technology Act 2000, and CERT-In directions mandating 180-day retention of cybersecurity logs.
                </p>
              </div>

              {/* Purpose 10 */}
              <div className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs shrink-0">10</span>
                  <span>Statutory Grievance Redressal & Citizen Rights Execution</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To investigate, document, and resolve user inquiries, content objections, petition reports, and statutory privacy requests (data access, correction, erasure) handled by our Data Protection & Grievance Redressal Officer in Mumbai within statutory timelines.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <span className="text-amber-600 text-base shrink-0 mt-0.5">🛡️</span>
              <p className="leading-relaxed">
                <strong>Strict Prohibition on Secondary Use & Commercial Sale (Section 6(1)):</strong> SoSign <strong>never sells, rents, leases, trades, or monetizes</strong> citizen personal data to commercial data brokers, advertising exchanges, or political marketing consultancies. Data is processed exclusively for the stated civic purposes above.
              </p>
            </div>
          </section>

          {/* Section 3: Personal Data Inventory (Data Minimization) */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              3. Comprehensive Personal Data Inventory (What Data We Collect)
            </h2>
            <p className="text-xs text-slate-600">
              Under the principle of <strong>Data Minimization (Section 6, DPDP Act)</strong>, we collect only the personal data strictly necessary to fulfill explicit civic advocacy and account verification purposes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card A: Account Data */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <FaDatabase className="text-blue-600" />
                  A. Account & Registration Data:
                </h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li><strong>Basic Profile:</strong> Full name, verified email address, mobile number, user-chosen designation, bio, and profile avatar URL.</li>
                  <li><strong>Security Credentials:</strong> Passwords hashed using bcrypt (10 rounds); OAuth 2.0 unique identifiers for Google Sign-In.</li>
                  <li><strong>Referral & Verification Code:</strong> Alphanumeric unique identifier for signature verification attribution.</li>
                </ul>
              </div>

              {/* Card B: KYC & Government ID Data */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <FaIdCard className="text-[#F43676]" />
                  B. Voluntary Identity Verification (KYC) Data:
                </h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li><strong>Aadhaar Data:</strong> Masked Aadhaar number (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">XXXXXXXX1234</code>) and SHA-256 cryptographic one-way hash. <strong>We NEVER store 12-digit plaintext Aadhaar numbers or biometric data</strong>. Demographic confirmation (name, gender, state, district) obtained via DigiLocker / UIDAI-authorized OTP gateways.</li>
                  <li><strong>PAN Card:</strong> Verified name, masked number, and taxpayer type against Income Tax Department records via authorized API.</li>
                  <li><strong>Voter ID (EPIC):</strong> Electoral constituency, EPIC number, and registered name for local legislative verification.</li>
                </ul>
              </div>

              {/* Card C: Civic Advocacy & Petition Data */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <FaFileShield className="text-purple-600" />
                  C. Petition & Civic Signature Data:
                </h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li>Petitions authored (title, problem statement, solution, target decision-makers, uploaded proof documents).</li>
                  <li>Signatures recorded: User ID, signature timestamp, optional verified constituency number, and masked identity token.</li>
                  <li>Public comments, progress updates, and formal citizen objection reports.</li>
                </ul>
              </div>

              {/* Card D: Technical & Financial Data */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <FaHandHoldingDollar className="text-emerald-600" />
                  D. Payment & Technical Device Data:
                </h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li><strong>Payments:</strong> Order IDs, amounts, and payment tokens handled exclusively by RBI-regulated payment gateways (Razorpay/Cashfree). We never store debit/credit card CVV or net-banking passwords.</li>
                  <li><strong>Technical & Logs:</strong> IP address behind reverse proxies (for DDoS rate limiting), browser user-agent, session cookies, and login timestamps.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Lawful Basis of Processing */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              4. Lawful Grounds for Processing (DPDP Act, Sections 6 & 7)
            </h2>
            <p>
              We process personal data only when a recognized lawful basis exists under the DPDP Act, 2023:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Processing Activity</th>
                    <th className="p-3">Categories of Personal Data</th>
                    <th className="p-3">Applicable Lawful Ground</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Account creation & profile authentication</td>
                    <td className="p-3">Name, email, mobile number, password hash</td>
                    <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">Consent (Section 6)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Voluntary KYC verification (Aadhaar / PAN / Voter ID)</td>
                    <td className="p-3">Masked ID, demographic details, OTP session token</td>
                    <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">Explicit Consent (Section 6)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Signing a petition & presentation to decision-makers</td>
                    <td className="p-3">Signer name, general city/constituency, signature timestamp</td>
                    <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">Consent & Contract (Section 6)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Duplicate signature prevention & vote integrity</td>
                    <td className="p-3">User ID, SHA-256 identity hash</td>
                    <td className="p-3"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Legitimate Use (Section 7(a))</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">DDoS protection, rate limiting & cybersecurity logs</td>
                    <td className="p-3">IP address, request method, user agent</td>
                    <td className="p-3"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Legitimate Use (Section 7(c) / Security)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Responding to legal warrants or statutory authorities</td>
                    <td className="p-3">As requested by court order or lawful agency</td>
                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Legal Obligation (Section 7(b))</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Third-Party Data Processors */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              5. Third-Party Data Processors & Infrastructure Partners
            </h2>
            <p>
              In accordance with <strong>Section 8(2) of the DPDP Act</strong>, SoSign engages only qualified Data Processors bound by strict contractual obligations to process personal data solely on our instructions with equivalent cybersecurity safeguards:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <FaBuildingColumns className="text-[#3650AD]" /> Government Identity & KYC
                </span>
                <p className="text-slate-600"><strong>DigiLocker (NeGD / MeitY) & PlanAPI:</strong> Used strictly for citizen identity verification via government cloud repositories and UIDAI-authorized OTP routing. No biometric data is ever processed or stored.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <FaLock className="text-emerald-600" /> Database & Cloud Hosting
                </span>
                <p className="text-slate-600"><strong>MongoDB Atlas & Cloud Hosting:</strong> Production databases operate with enterprise encryption at rest (AES-256) and TLS 1.3 in transit, hosted within certified Indian data center regions.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <FaEnvelope className="text-amber-600" /> Communications & SMS Gateways
                </span>
                <p className="text-slate-600"><strong>2Factor.in & SMTP / Resend:</strong> Transmit one-time verification passwords (OTP), petition milestone notifications, and security alerts. Phone numbers are transmitted over encrypted TLS connections.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <FaFileShield className="text-purple-600" /> Media & CDN Storage
                </span>
                <p className="text-slate-600"><strong>Cloudinary CDN:</strong> Ingests in-memory image buffers, campaign visuals, and proof documents. Files are never stored on local web server disks where they could execute unauthorized scripts.</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              * SoSign does not sell, rent, lease, or monetize citizen personal data to commercial brokers or third-party advertising exchanges.
            </p>
          </section>

          {/* Section 6: Data Retention & Disposal Schedule */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              6. Data Retention Periods & Disposal Schedule (Section 8(7))
            </h2>
            <p>
              Under <strong>Section 8(7) of the DPDP Act</strong>, a Data Fiduciary must erase personal data upon withdrawal of consent or as soon as the purpose for which it was collected is no longer served. Our standardized retention schedule is as follows:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Data Classification</th>
                    <th className="p-3">Retention Period</th>
                    <th className="p-3">Disposal / Erasure Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Active User Account Data</td>
                    <td className="p-3">For the duration of active account membership</td>
                    <td className="p-3">Purged upon self-service account deletion or request.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Aadhaar / KYC Session Tokens</td>
                    <td className="p-3">10 to 30 minutes (Ephemeral)</td>
                    <td className="p-3">Automatically invalidated by JWT expiration.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Petition Signature Records</td>
                    <td className="p-3">Active campaign duration + civic audit record</td>
                    <td className="p-3">Signatures pseudonymized upon user account deletion.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Payment & Financial Invoices</td>
                    <td className="p-3">7 Years (Mandatory under IT Act & GST laws)</td>
                    <td className="p-3">Securely archived for statutory financial compliance.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Cybersecurity & Rate Limiting Logs</td>
                    <td className="p-3">180 Days (CERT-In mandate)</td>
                    <td className="p-3">Rotated and purged automatically after 180 days.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7: Children's Personal Data */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              7. Protection of Children&apos;s Personal Data (Section 9)
            </h2>
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                <FaChildren className="text-lg text-amber-600" />
                Statutory Safeguards for Minors (Under Age 18)
              </div>
              <p>
                In strict compliance with <strong>Section 9 of the DPDP Act, 2023</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Age Requirement:</strong> SoSign services are intended for individuals who have attained 18 years of age.</li>
                <li><strong>Verifiable Parental Consent:</strong> Minors may only participate in petition campaigns under the verifiable consent and active supervision of their parent or lawful guardian.</li>
                <li><strong>Prohibition on Behavioral Tracking:</strong> SoSign <strong>strictly prohibits</strong> behavioral monitoring, tracking, or targeted advertising directed at children.</li>
                <li><strong>Prohibition on Detrimental Processing:</strong> No processing that could cause harmful effects on the well-being of a child is permitted.</li>
              </ul>
            </div>
          </section>

          {/* Section 8: Citizen Rights (Data Principal Rights) */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              8. Your Statutory Rights as a Data Principal (Sections 11, 12, 13)
            </h2>
            <p>
              Under Chapter III of the DPDP Act, 2023, you have enforceable legal rights regarding your personal data. SoSign provides both self-service tools and official grievance channels to exercise these rights:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold flex items-center gap-1.5">
                  <FaFileLines className="text-[#3650AD]" /> Right to Access Information (Sec 11)
                </strong>
                <p className="text-slate-600">
                  You have the right to obtain a summary of personal data being processed and the identities of data fiduciaries/processors with whom it has been shared. You can download your machine-readable personal data archive from your profile settings.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold flex items-center gap-1.5">
                  <FaUserCheck className="text-emerald-600" /> Right to Correction & Updating (Sec 12)
                </strong>
                <p className="text-slate-600">
                  You have the right to correct, complete, or update any inaccurate or misleading personal data stored in your account through your profile dashboard.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold flex items-center gap-1.5">
                  <FaUserSlash className="text-[#F43676]" /> Right to Erasure / Account Deletion (Sec 12)
                </strong>
                <p className="text-slate-600">
                  You may exercise your &ldquo;Right to be Forgotten&rdquo; and request the permanent deletion of your account and unlinking of non-statutory petition signatures directly from your profile settings or by submitting a privacy request.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold flex items-center gap-1.5">
                  <FaClockRotateLeft className="text-purple-600" /> Right to Withdraw Consent (Sec 6(4))
                </strong>
                <p className="text-slate-600">
                  Where processing is based on consent, you may withdraw your consent at any time as easily as giving it. Withdrawing consent does not affect the legality of processing conducted prior to withdrawal.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-2xl border border-blue-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Want to exercise your DPDP rights immediately?</h4>
                <p className="text-[11px] text-slate-600">Use our dedicated citizen privacy request portal or manage your data directly from your account.</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/contact?type=privacy"
                  className="px-3.5 py-2 bg-[#3650AD] text-white rounded-xl text-xs font-bold hover:bg-[#2b4191] transition"
                >
                  Submit Privacy Request
                </Link>
              </div>
            </div>
          </section>

          {/* Section 9: Statutory Grievance Redressal Mechanism & Officer */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              9. Statutory Grievance Redressal Officer (Sections 8(10) & 13)
            </h2>
            <p>
              As mandated by <strong>Section 8(10) and Section 13 of the Digital Personal Data Protection Act, 2023</strong>, SoSign has appointed a dedicated <strong>Data Protection & Grievance Redressal Officer</strong> to handle inquiries, complaints, and statutory data principal requests:
            </p>

            <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-300 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-black text-[#002050] uppercase tracking-wider">
                <FaEnvelope className="text-[#F43676]" />
                Office of the Data Protection & Grievance Officer
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <p><strong>Designated Officer:</strong> Mr. Narendra Kumar (Data Protection & Grievance Redressal Officer)</p>
                  <p><strong>Entity:</strong> LEO MEO IT Solution (SoSign Division)</p>
                  <p><strong>Postal Address:</strong> NESCO Center, Western Express Highway, Goregaon East, Mumbai, Maharashtra 400063, India</p>
                </div>
                <div className="space-y-1">
                  <p><strong>Official Grievance Email:</strong> <a href="mailto:grievance@sosign.in" className="text-[#3650AD] font-bold underline">grievance@sosign.in</a></p>
                  <p><strong>Helpline Number:</strong> <a href="tel:+919323677688" className="text-slate-800 font-semibold underline">+91 9323677688</a></p>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-1 bg-blue-100/40 p-3 rounded-lg border border-blue-200">
                <p><strong>Response & Resolution SLA:</strong></p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li><strong>Acknowledgment:</strong> Every privacy grievance receives an automated or formal acknowledgment with a unique tracking ticket within <strong>24 business hours</strong>.</li>
                  <li><strong>Resolution Timeline:</strong> Grievances are investigated and resolved within <strong>15 calendar days</strong> (and in no event exceeding 30 days as prescribed by DPDP Rules).</li>
                  <li><strong>Right to Approach Data Protection Board:</strong> If you are not satisfied with our resolution, you have the statutory right to file a complaint with the <strong>Data Protection Board of India (DPBI)</strong>.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 10: Personal Data Breach Management & Response Plan (DPDP Act Sec 2(u), 8(5) & 8(6)) */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              10. Personal Data Breach Management & Statutory Response Plan (Sections 2(u), 8(5) & 8(6))
            </h2>

            {/* Subsection 10.1: Statutory Definition */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <FaShieldHalved className="text-[#3650AD]" />
                10.1 What Counts as a Personal Data Breach? [DPDP Act Section 2(u)]
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Under <strong>Section 2(u) of the Digital Personal Data Protection Act, 2023</strong>, a <em>&quot;personal data breach&quot;</em> is strictly defined as:
              </p>
              <blockquote className="p-3 bg-white border-l-4 border-[#F43676] rounded-r-xl text-xs italic text-slate-800 shadow-sm">
                &ldquo;Any unauthorised processing of personal data or accidental disclosure, acquisition, sharing, use, alteration, destruction of or loss of access to personal data, that compromises the confidentiality, integrity or availability of personal data.&rdquo;
              </blockquote>
              <p className="text-xs text-slate-600">
                At SoSign, any incident that threatens the confidentiality, integrity, or accessibility of citizen records—including email addresses, contact details, signature records, or masked KYC proofs—is classified and handled immediately under our statutory Breach SOP.
              </p>
            </div>

            {/* Subsection 10.2: 5-Stage Breach Response Plan */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <FaScaleBalanced className="text-[#F43676]" />
                10.2 Five-Stage Data Breach Incident Response Plan (SOP)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#3650AD] block">Stage 1: Detection & Triage (SLA: &lt; 1 hr)</span>
                  <p className="text-slate-600 text-[11px]">
                    Automated anomaly detection, SIEM log analysis, or grievance intake triage according to Section 2(u) categories with severity rating (Low, Medium, High, Critical).
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-rose-600 block">Stage 2: Rapid Containment & Harm Reduction (SLA: 2–4 hrs)</span>
                  <p className="text-slate-600 text-[11px]">
                    Under Section 8(5), immediate revocation of active JWT authentication sessions, isolation of compromised endpoints, mandatory credential reset flags, and firewall hardening.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-purple-600 block">Stage 3: Forensic Harm Assessment (SLA: 6–12 hrs)</span>
                  <p className="text-slate-600 text-[11px]">
                    Log audits to determine exact impacted records, evaluate confidentiality/integrity vectors, verify encrypted KYC boundaries, and draft root-cause analysis (RCA).
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-600 block">Stage 4: Statutory DPBI & User Notices (Without Delay)</span>
                  <p className="text-slate-600 text-[11px]">
                    Statutory Section 8(6) intimation to the Data Protection Board of India and CERT-In, paired with direct email and in-app alerts to each affected Data Principal.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Stage 5: Eradication, Hardening & Post-Mortem Audit (Within 7 Days)</span>
                <p className="text-slate-600 text-[11px]">
                  Regression penetration tests, credential re-issuance, permanent security patches, and regulatory incident registry retention for mandatory Board audits.
                </p>
              </div>
            </div>

            {/* Subsection 10.3: Statutory Intimations */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2 text-xs">
              <h3 className="font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <FaEnvelope className="text-blue-600" />
                10.3 Mandatory Notifications to Users & Data Protection Board of India (Section 8(6))
              </h3>
              <p className="text-slate-700">
                In strict adherence to <strong>Section 8(6) of the DPDP Act</strong> and <strong>CERT-In Directions</strong>, whenever a breach is confirmed:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
                <li>
                  <strong>Notice to Data Protection Board of India (DPBI):</strong> We submit formal intimation containing the incident reference, nature of the breach, affected volume, rapid containment actions taken, and the contact coordinates of our Grievance Redressal Officer.
                </li>
                <li>
                  <strong>Notice to Affected Citizens (Data Principals):</strong> We communicate directly via registered email and in-app alerts, explaining the incident in plain language, describing the remedial measures taken, and offering actionable steps to secure accounts.
                </li>
              </ul>
            </div>

            {/* Subsection 10.4: Rapid Harm Reduction */}
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2 text-xs">
              <h3 className="font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                <FaLock className="text-rose-600" />
                10.4 Proactive Harm Reduction Safeguards (Section 8(5))
              </h3>
              <p className="text-slate-700">
                To prevent downstream damage following an incident, our rapid harm reduction protocols immediately execute:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 bg-white border border-rose-100 rounded-lg">
                  <strong className="text-slate-900 block mb-0.5">Session Invalidation</strong>
                  All active login tokens for affected accounts are instantaneously terminated.
                </div>
                <div className="p-2.5 bg-white border border-rose-100 rounded-lg">
                  <strong className="text-slate-900 block mb-0.5">Forced Password Reset</strong>
                  Accounts are placed on secure re-authentication requiring a fresh password.
                </div>
                <div className="p-2.5 bg-white border border-rose-100 rounded-lg">
                  <strong className="text-slate-900 block mb-0.5">Citizen Advisory</strong>
                  Guidance on spotting phishing, revoking third-party access, and securing digital identity.
                </div>
              </div>
            </div>
          </section>

          {/* Section 11: Child Data Protection & Verifiable Parental Consent (DPDP Act Section 9) */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              11. Child Data Safeguards & Parental Consent (Section 9)
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              In strict adherence to <strong>Section 9 of the Digital Personal Data Protection Act, 2023</strong>, SoSign enforces rigorous safeguards to protect children (defined under Indian law as individuals under 18 years of age):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
                <span className="font-bold text-purple-900 block">Verifiable Parental Consent</span>
                <p className="text-slate-600 text-[11px]">
                  Before processing any personal data of a minor, we require verifiable consent from the parent or lawful guardian via affirmative email/SMS verification.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
                <span className="font-bold text-purple-900 block">Zero Behavioral Tracking</span>
                <p className="text-slate-600 text-[11px]">
                  Per Section 9(3), we strictly prohibit tracking, behavioral monitoring, or analytics profiling of any child account on our platform.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
                <span className="font-bold text-purple-900 block">No Targeted Advertising</span>
                <p className="text-slate-600 text-[11px]">
                  Targeted advertising directed at children is completely banned. Minors only have access to non-targeted civic engagement and public interest petitions.
                </p>
              </div>
            </div>
          </section>

          {/* Section 12: Vendor & Data Processor Governance (Sections 8(2) & 8(7)) */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              12. Vendor & Data Processor Governance (Sections 8(2) & 8(7))
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              When SoSign engages third-party vendors (Data Processors) such as payment gateways, SMS/email relays, or government KYC gateways, we mandate strict compliance under <strong>Section 8(2)</strong>:
            </p>
            <ul className="text-xs text-slate-700 list-disc pl-5 space-y-1 text-[11px]">
              <li><strong>Data Processing Agreements (DPAs):</strong> Every vendor must execute a binding DPA guaranteeing equivalent technical safeguards and statutory confidentiality.</li>
              <li><strong>Technical Security Standards:</strong> Vendors must maintain verified certifications, including ISO 27001, SOC 2 Type II, and PCI-DSS Level 1.</li>
              <li><strong>Obligation to Return or Delete (Section 8(7)):</strong> Our contracts mandate that vendors must irreversibly erase or return personal data once the processing purpose concludes or upon citizen account deletion.</li>
              <li><strong>Regular Compliance Monitoring:</strong> We conduct bi-annual audits of vendor security postures and log flow-through erasure dispatches.</li>
            </ul>
          </section>

          {/* Section 13: Cross-Border Data Transfer & Localization (Section 16) */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              13. Cross-Border Personal Data Transfers & Localization (Section 16)
            </h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <p className="text-slate-700">
                SoSign prioritizes domestic data sovereignty under <strong>Section 16 of the DPDP Act 2023</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
                <li><strong>Primary In-Country Storage:</strong> All citizen account credentials, signature records, and masked KYC identifiers are hosted exclusively within certified Indian data centers (AWS ap-south-1 Mumbai / NIC Cloud).</li>
                <li><strong>Government Restrictions Compliance:</strong> We verify and guarantee that no personal data is ever transferred to foreign countries or territories restricted or blacklisted by the Central Government.</li>
                <li><strong>CDN Edge Optimization:</strong> Public petition media assets (images, banners) served via global edge networks (Cloudinary) utilize Standard Contractual Clauses (SCC) with end-to-end TLS 1.3 encryption and contain zero personal identification records.</li>
              </ul>
            </div>
          </section>

          {/* Section 14: Internal Policies & Data Retention Schedule */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              14. Internal Data Protection Policies & Retention Schedule (DRAS)
            </h2>
            <p className="text-xs text-slate-700">
              SoSign maintains formal internal policies, including an <strong>Internal Data Protection Policy (IDPP)</strong>, <strong>Vendor Security Policy</strong>, and a strict <strong>Data Retention & Archival Schedule (DRAS)</strong>:
            </p>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5 border-b">Category</th>
                    <th className="p-2.5 border-b">Retention Period</th>
                    <th className="p-2.5 border-b">Disposal Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] text-slate-600">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Masked KYC Records</td>
                    <td className="p-2.5">Account Lifespan + 5 Years (PMLA / SPDI Rules)</td>
                    <td className="p-2.5">Cryptographic deletion upon account erasure</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Access & Security Logs</td>
                    <td className="p-2.5">180 Days (CERT-In Mandatory Directions)</td>
                    <td className="p-2.5">Automated rolling archival purge</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Consent Proofs</td>
                    <td className="p-2.5">Lifespan of Account + 3 Years</td>
                    <td className="p-2.5">Statutory compliance ledger archive</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Inactive Accounts</td>
                    <td className="p-2.5">24 Months Zero Activity</td>
                    <td className="p-2.5">Notice dispatched, followed by automated erasure</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span>Have questions about our data retention or wish to exercise your statutory rights?</span>
              <Link
                href="/grievance"
                className="px-3.5 py-1.5 bg-[#3650AD] text-white rounded-lg font-bold hover:bg-[#2b4191] transition"
              >
                Visit Grievance Portal
              </Link>
            </div>
          </section>

          {/* Section 15: Updates to this Policy */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              15. Changes to this Privacy Notice
            </h2>
            <p>
              We periodically review this policy to reflect platform updates, statutory notifications, or rules framed under the DPDP Act. When material revisions occur, we notify users via banner notice, email notification, or account alerts before changes take effect.
            </p>
          </section>

          {/* Footer Callout */}
          <div className="pt-6 text-center border-t border-gray-200 space-y-2">
            <p className="text-sm font-bold text-[#F43676]">
              SoSign is dedicated to safeguarding citizen digital identity while powering democratic civic engagement across India.
            </p>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-4">
              <Link href="/terms" className="hover:text-slate-800 underline">Terms of Service</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-slate-800 underline">Contact Support</Link>
              <span>•</span>
              <Link href="/faq" className="hover:text-slate-800 underline">Platform FAQs</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
