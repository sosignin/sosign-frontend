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

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState("all");

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
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
              <FaShieldHalved className="text-xs" /> Statutory Privacy Notice
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Privacy Policy & DPDP Notice
            </h1>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
              How SoSign collects, protects, processes, retains, and respects citizen personal and KYC data in strict compliance with Indian laws.
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-pink-200/90 font-mono">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Digital Personal Data Protection (DPDP) Act, 2023
              </span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Aadhaar Act, 2016 (UIDAI Regulations)
              </span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                IT Act, 2000 & SPDI Rules
              </span>
            </div>
            <p className="text-[11px] text-gray-400 pt-1">
              Last Updated & Effective Date: October 2026 | Document Reference: SOSIGN-DPDP-2026-V2
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
          
          {/* Section 1: Data Fiduciary Identity & Scope */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              1. Identity of the Data Fiduciary & Regulatory Scope
            </h2>
            <p>
              This Privacy Notice is issued pursuant to <strong>Section 5 of the Digital Personal Data Protection (DPDP) Act, 2023</strong> by <strong>LEO MEO IT Solution</strong> (&ldquo;SoSign&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;Data Fiduciary&rdquo;). SoSign operates the civic petition and digital democracy platform accessible at <a href="https://sosign.in" className="text-[#3650AD] font-semibold underline">sosign.in</a> and its affiliated applications.
            </p>
            <p>
              This document governs how we process the personal data of registered citizens, petition starters, signers, donors, visitors, and respondents (&ldquo;Data Principals&rdquo;). By accessing our services, creating an account, or signing a petition, you acknowledge the processing practices detailed herein.
            </p>
          </section>

          {/* Section 2: Personal Data Inventory (Data Minimization) */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              2. Comprehensive Personal Data Inventory & Collection
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

          {/* Section 3: Lawful Basis of Processing */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              3. Lawful Grounds for Processing (DPDP Act, Sections 6 & 7)
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

          {/* Section 4: Third-Party Data Processors */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              4. Third-Party Data Processors & Infrastructure Partners
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

          {/* Section 5: Data Retention & Disposal Schedule */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              5. Data Retention Periods & Disposal Schedule (Section 8(7))
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

          {/* Section 6: Children's Personal Data */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              6. Protection of Children&apos;s Personal Data (Section 9)
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

          {/* Section 7: Citizen Rights (Data Principal Rights) */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              7. Your Statutory Rights as a Data Principal (Sections 11, 12, 13)
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

          {/* Section 8: Statutory Grievance Redressal Mechanism & Officer */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              8. Statutory Grievance Redressal Officer (Sections 8(10) & 13)
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
                  <p><strong>Designation:</strong> Data Protection & Grievance Redressal Officer</p>
                  <p><strong>Entity:</strong> LEO MEO IT Solution (SoSign Division)</p>
                  <p><strong>Postal Address:</strong> NESCO Center, Western Express Highway, Goregaon East, Mumbai, Maharashtra 400063, India</p>
                </div>
                <div className="space-y-1">
                  <p><strong>Dedicated Privacy Email:</strong> <a href="mailto:privacy@sosign.in" className="text-[#F43676] font-bold underline">privacy@sosign.in</a></p>
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

          {/* Section 9: Incident Response & Breach Notification */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              9. Personal Data Breach Management (Section 8(6) & CERT-In)
            </h2>
            <p>
              In the event of a confirmed personal data security incident or breach, SoSign adheres strictly to <strong>Section 8(6) of the DPDP Act</strong> and <strong>CERT-In cybersecurity directions</strong>:
            </p>
            <ul className="text-xs text-slate-700 list-disc pl-5 space-y-1.5">
              <li>Immediate containment and forensic isolation within our encrypted network infrastructure.</li>
              <li>Timely notification to the <strong>Data Protection Board of India (DPBI)</strong> and the <strong>Indian Computer Emergency Response Team (CERT-In)</strong> containing the nature of the breach, affected categories, and remedial steps taken.</li>
              <li>Prompt communication to affected Data Principals with recommended safety actions and direct contact to our Grievance Cell.</li>
            </ul>
          </section>

          {/* Section 10: Updates to this Policy */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              10. Changes to this Privacy Notice
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
