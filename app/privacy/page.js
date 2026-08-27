"use client";

import React from "react";
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
} from "react-icons/fa6";

export default function PrivacyPage() {
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
              <FaShieldHalved className="text-xs" /> Data Protection & Privacy Standard
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Privacy Policy
            </h1>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
              How SoSign collects, protects, processes, and respects your personal, KYC, payment, and advocacy data.
            </p>
            <p className="text-xs text-pink-300/90 font-mono pt-2">
              Compliant with the Digital Personal Data Protection (DPDP) Act, 2023 & IT (SPDI) Rules, 2011
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white shadow-sm rounded-3xl p-6 md:p-10 space-y-10 border border-gray-200/80 text-slate-800 text-sm leading-relaxed">
          
          {/* Section 1: Overview & Commitment */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              1. Our Commitment to Your Privacy
            </h2>
            <p>
              At <strong>SoSign</strong> (operated by <strong>Leoheart iTECH Mumbai</strong>), we believe in transparent, citizen-led advocacy underpinned by uncompromising privacy protections. This Privacy Policy details the types of information we collect, how it is processed, with whom it is shared, and your statutory rights under Indian data protection laws.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              2. Information We Collect
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <FaIdCard className="text-[#F43676]" />
                  A. KYC & Government Identity Information:
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When you voluntarily verify your profile or sign verified petitions:
                </p>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li><strong>Aadhaar:</strong> Masked reference (XXXX-XXXX-1234), demographic name/age validation via OTP. Raw biometric and unmasked Aadhaar numbers are <strong>never stored</strong>.</li>
                  <li><strong>PAN & Voter ID:</strong> PAN status from Income Tax records and Voter EPIC number for constituency validation.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <FaHandHoldingDollar className="text-emerald-600" />
                  B. Crowdfunding & Financial Transaction Data:
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For creators and donors participating in fundraisers:
                </p>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li><strong>Donors:</strong> Transaction amount, payment status, anonymized token via certified payment gateways (Razorpay/Cashfree). We do not store credit card CVVs or bank PINs.</li>
                  <li><strong>Beneficiaries:</strong> Bank account number, IFSC code, and hospital billing documents for fund release audits.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <FaDatabase className="text-blue-600" />
                  C. Account & Signature Information:
                </h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li>Name, email address, mobile number, and city/state.</li>
                  <li>Petitions created, signatures recorded, comments posted, and followed causes.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <FaFileShield className="text-purple-600" />
                  D. Notable Signer Proofs & Media:
                </h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li>Uploaded authorization letters, official tweets, and video statement proof files submitted for public figure signature verifications.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Purpose of Processing */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              3. How We Use Your Information
            </h2>
            <p>
              We process your personal data strictly for lawful, explicitly stated purposes:
            </p>
            <ul className="text-xs text-slate-700 space-y-2 list-disc pl-5">
              <li><strong>Petition Delivery:</strong> Aggregating verified signature counts for submission to target decision-makers, ministries, and civic authorities.</li>
              <li><strong>Anti-Fraud & Audit Trails:</strong> Detecting duplicate signatures, bot registrations, and illegal fundraising schemes.</li>
              <li><strong>Fund Disbursement:</strong> Executing secure donor-to-beneficiary fund transfers and audit compliance.</li>
              <li><strong>Service Communications:</strong> Notifying you of petition milestones, victory updates, policy replies from decision-makers, and security alerts.</li>
            </ul>
          </section>

          {/* Section 4: Data Sharing & Disclosures */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              4. When Information is Shared
            </h2>
            <p>
              SoSign <strong>does not sell, rent, or trade your personal or KYC data</strong> to third-party commercial marketing brokers. Information is disclosed only under these circumstances:
            </p>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>1. Petition Recipients (Decision Makers):</strong> When a petition is handed over to a government body or leader, a list of signers (names and general city/district) is presented. Your phone number and government ID numbers are NEVER disclosed to decision-makers.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>2. Regulated Service Providers:</strong> Licensed payment gateways (Razorpay/Cashfree), SMS/OTP gateways, and UIDAI-approved KYC APIs operating under strict contractual confidentiality and data security obligations.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>3. Lawful Government & Police Requests:</strong> If mandated by a valid judicial warrant, court order, or written summons from an authorized law enforcement agency investigating cybercrime, defamation, or national security offenses under the Information Technology Act.
              </div>
            </div>
          </section>

          {/* Section 5: Data Security & Retention */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              5. Data Security, Encryption & Storage
            </h2>
            <p>
              We implement industry-leading technical and administrative safeguards compliant with <strong>Rule 8 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 list-none pl-0">
              <li className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2">
                <FaLock className="text-emerald-600 shrink-0" />
                <span>256-bit TLS encryption in transit and AES-256 at rest</span>
              </li>
              <li className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2">
                <FaShieldHalved className="text-emerald-600 shrink-0" />
                <span>Strict role-based access control (RBAC) on production databases</span>
              </li>
              <li className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2">
                <FaUserCheck className="text-emerald-600 shrink-0" />
                <span>Automated masking of Aadhaar and sensitive ID identifiers</span>
              </li>
              <li className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2">
                <FaCircleCheck className="text-emerald-600 shrink-0" />
                <span>Data stored in secure data centers located within India</span>
              </li>
            </ul>
          </section>

          {/* Section 6: User Rights */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              6. Your Rights Under DPDP Act, 2023
            </h2>
            <p>
              As a citizen and data principal, you have statutory rights regarding your personal data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">Right to Access & Rectify</strong>
                <p className="text-slate-600">You can view and update your profile information, email, and password directly through your account dashboard.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">Right to Erasure & Deletion</strong>
                <p className="text-slate-600">You may request the permanent deletion of your account and unlinking of non-statutory petition signatures.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">Right to Withdraw Consent</strong>
                <p className="text-slate-600">You can withdraw consent for newsletters or marketing communications at any time with one click.</p>
              </div>
            </div>
          </section>

          {/* Section 7: Grievance Officer (Commented out for now) */}
          {/* <section className="space-y-3 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              7. Privacy Grievance Officer Contact
            </h2>
            <div className="p-5 bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-200/80 rounded-2xl space-y-2">
              <h3 className="font-extrabold text-[#002050] text-xs uppercase tracking-wider flex items-center gap-2">
                <FaEnvelope className="text-[#F43676]" />
                Data Protection & Privacy Officer
              </h3>
              <p className="text-xs text-slate-700">
                For questions regarding data processing, privacy rights, or data deletion requests, contact:
              </p>
              <div className="text-xs font-medium text-slate-800 space-y-0.5 bg-white p-3 rounded-xl border border-gray-200">
                <p><strong>Entity:</strong> Leoheart iTECH Mumbai (SoSign Privacy Cell)</p>
                <p><strong>Email:</strong> <a href="mailto:privacy@sosign.in" className="text-[#F43676] font-bold underline">privacy@sosign.in</a> / <a href="mailto:grievance@sosign.in" className="text-blue-600 underline">grievance@sosign.in</a></p>
                <p><strong>Location:</strong> Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </section> */}

          {/* Footer Callout */}
          <div className="pt-4 text-center border-t border-gray-200">
            <p className="text-sm font-bold text-[#F43676]">
              SoSign is dedicated to safeguarding your digital identity while empowering your democratic voice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
