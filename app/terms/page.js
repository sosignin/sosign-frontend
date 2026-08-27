"use client";

import React from "react";
import Link from "next/link";
import {
  FaShieldHalved,
  FaScaleBalanced,
  FaHandHoldingDollar,
  FaIdCard,
  FaBullhorn,
  FaBuildingColumns,
  FaGavel,
  FaTriangleExclamation,
  FaUserCheck,
  FaCircleCheck,
  FaEnvelope,
  FaCopyright,
  FaHandshake,
  FaFileContract,
} from "react-icons/fa6";

export default function TermsPage() {
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
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-pink-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
              <FaScaleBalanced className="text-xs" /> Official Platform Terms
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Terms & Conditions of Service
            </h1>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Governing Petitions, KYC Verification, Crowdfunding, Intellectual Property, Dispute Resolution, and Civic Advocacy on SoSign.
            </p>
            <p className="text-xs text-pink-300/90 font-mono pt-2">
              Last Updated & Effective: 2026 • Governed under the Laws of India
            </p>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <a href="#eligibility" className="p-3.5 bg-white rounded-2xl border border-gray-200/80 hover:border-[#F43676] transition-all shadow-xs flex flex-col justify-between">
            <FaUserCheck className="text-[#F43676] text-base mb-1" />
            <span className="font-bold text-slate-800">1. Eligibility & Capacity</span>
          </a>
          <a href="#identity-verification" className="p-3.5 bg-white rounded-2xl border border-gray-200/80 hover:border-[#F43676] transition-all shadow-xs flex flex-col justify-between">
            <FaIdCard className="text-[#F43676] text-base mb-1" />
            <span className="font-bold text-slate-800">2. KYC & Identity</span>
          </a>
          <a href="#user-content-ip" className="p-3.5 bg-white rounded-2xl border border-gray-200/80 hover:border-[#F43676] transition-all shadow-xs flex flex-col justify-between">
            <FaFileContract className="text-[#F43676] text-base mb-1" />
            <span className="font-bold text-slate-800">3. Content & License</span>
          </a>
          <a href="#crowdfunding-rules" className="p-3.5 bg-white rounded-2xl border border-gray-200/80 hover:border-[#F43676] transition-all shadow-xs flex flex-col justify-between">
            <FaHandHoldingDollar className="text-[#F43676] text-base mb-1" />
            <span className="font-bold text-slate-800">4. Crowdfunding</span>
          </a>
          <a href="#copyright-takedown" className="p-3.5 bg-white rounded-2xl border border-gray-200/80 hover:border-[#F43676] transition-all shadow-xs flex flex-col justify-between">
            <FaCopyright className="text-[#F43676] text-base mb-1" />
            <span className="font-bold text-slate-800">5. Copyright Process</span>
          </a>
          <a href="#dispute-arbitration" className="p-3.5 bg-white rounded-2xl border border-gray-200/80 hover:border-[#F43676] transition-all shadow-xs flex flex-col justify-between">
            <FaGavel className="text-[#F43676] text-base mb-1" />
            <span className="font-bold text-slate-800">6. Dispute & Law</span>
          </a>
        </div>

        {/* Content Container */}
        <div className="bg-white shadow-sm rounded-3xl p-6 md:p-10 space-y-10 border border-gray-200/80 text-slate-800 text-sm leading-relaxed">
          
          {/* Section 1: Introduction & Acceptance */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              1. Acceptance of Terms & Platform Overview
            </h2>
            <p>
              Welcome to <strong>SoSign</strong> (accessible via <code>sosign.in</code>, mobile portals, and related web interfaces), operated by <strong>Leoheart iTECH Mumbai</strong> (&quot;SoSign&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;Petitioner&quot;, &quot;Signer&quot;, &quot;Donor&quot;, or &quot;Fundraiser&quot;) and SoSign.
            </p>
            <p>
              By accessing, browsing, registering an account, starting or signing a petition, completing KYC verification, launching a crowdfunding campaign, or donating funds, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link href="/privacy" className="text-[#F43676] font-bold hover:underline">Privacy Policy</Link>. If you do not agree to these Terms, you must immediately discontinue using our services.
            </p>
          </section>

          {/* Section 2: User Eligibility & Legal Capacity */}
          <section id="eligibility" className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              2. User Eligibility & Legal Capacity (Indian Contract Act, 1872)
            </h2>
            <p>
              By creating an account or using SoSign, you represent, warrant, and covenant that:
            </p>
            <div className="space-y-2.5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-[#F43676] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p><strong>Age Requirement:</strong> You are at least 18 years of age. If you are between 13 and 17 years old, you may only use SoSign under the direct supervision of a parent or legal guardian who agrees to be bound by these Terms on your behalf. Children under 13 are strictly prohibited from creating accounts.</p>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-[#F43676] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p><strong>Legal Competence:</strong> You possess the full legal capacity to enter into a binding contract under the <strong>Indian Contract Act, 1872</strong>, and are not disqualified by law, an undischarged insolvent, or barred from receiving electronic intermediary services.</p>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-[#F43676] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p><strong>Account Authenticity:</strong> All registration information provided by you (including name, mobile number, and email address) is accurate, current, and truthful. You are responsible for safeguarding your account credentials and for all activities under your account.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Identity Verification (Aadhaar, PAN, Voter ID) */}
          <section id="identity-verification" className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              3. KYC & Identity Verification Policy (Aadhaar, PAN, Voter ID)
            </h2>
            <p>
              To maintain authentic civic engagement, eliminate bot manipulation, and safeguard financial disbursements, SoSign provides voluntary and campaign-mandated identity verification:
            </p>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                  <FaIdCard className="text-[#F43676]" />
                  Aadhaar OTP-Based Verification & Masking:
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Aadhaar verification is conducted on an informed, voluntary consent basis through government-authorized KYC service providers (licensed AUAs/KUAs). SoSign <strong>does not store your core biometric data or unmasked 12-digit Aadhaar number</strong> in raw database formats. Only cryptographic verification hashes, masked references (XXXX-XXXX-1234), and verification status flags are retained.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                  <FaShieldHalved className="text-emerald-600" />
                  PAN & Voter ID (EPIC) Verification:
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  PAN and Voter ID verifications are performed via authorized NSDL/Income Tax and Election Commission of India (ECI) public registry interfaces. Verified data is used exclusively to substantiate legislative constituency residency, prevent duplicate voting, or validate financial eligibility for crowdfunding disbursements.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                  <FaTriangleExclamation className="text-rose-600" />
                  Prohibition of Impersonation & Identity Fraud:
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Submitting fraudulent identity documents, forged government IDs, or authenticating signatures using another individual’s Aadhaar/PAN/Voter ID without express legal authorization constitutes a criminal offense under <strong>Sections 419 and 420 of the Indian Penal Code (and BNS equivalents)</strong> and <strong>Section 66D of the Information Technology Act, 2000</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: User Content Rules & IP Licensing */}
          <section id="user-content-ip" className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              4. User Content Rules & Intellectual Property Licensing
            </h2>
            <p>
              Users retain ownership of the original text, petition statements, images, and videos they upload to SoSign. However, by uploading or submitting content (&quot;User Content&quot;), you agree to the following terms:
            </p>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">A. Worldwide Non-Exclusive License to SoSign:</h4>
                <p className="text-slate-600 leading-relaxed">
                  You grant SoSign a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to host, store, reproduce, format, display, distribute, broadcast, and syndicate your petition or fundraiser across search engines, social media platforms, press releases, newsletters, and direct delivery to target decision-makers to maximize campaign impact.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">B. Representation of Rights & Non-Infringement:</h4>
                <p className="text-slate-600 leading-relaxed">
                  You warrant that you own or have obtained all necessary licenses, permissions, model releases, and rights to use any photographs, news clips, logos, or multimedia uploaded in your campaign. You agree not to upload copyrighted works belonging to news outlets, photographers, or third parties without appropriate authorization or fair use justification.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">C. Platform Moderation & Edits:</h4>
                <p className="text-slate-600 leading-relaxed">
                  To preserve campaign integrity, once a petition has gathered signatures, petitioners may not make material alterations that alter the core demand, recipient, or intent of the petition. SoSign reserves the right to edit formatting, categorize, flag unverified claims, or unpublish campaigns that violate these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Crowdfunding & Financial Donations */}
          <section id="crowdfunding-rules" className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              5. Crowdfunding & Financial Donations Terms
            </h2>
            <p>
              SoSign operates as a technology facilitator and communication platform connecting campaign creators with potential donors. SoSign is <strong>not a bank, financial institution, broker, or registered charity</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
                <h4 className="font-extrabold text-[#F43676] uppercase tracking-wider">
                  Fundraiser Obligations
                </h4>
                <ul className="text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>Campaign creators warrant that all stated facts, medical estimates, hospital bills, and beneficiary details are 100% accurate and genuine.</li>
                  <li>Creators agree to submit hospital/NGO verification records, bank statements, and KYC credentials prior to fund disbursement.</li>
                  <li>Raised funds must be utilized strictly and exclusively for the stated purpose.</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                <h4 className="font-extrabold text-[#002050] uppercase tracking-wider">
                  Donor Acknowledgment & Disclaimers
                </h4>
                <ul className="text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>Donations made on SoSign are voluntary contributions and non-refundable once transferred to the beneficiary.</li>
                  <li>SoSign makes no warranty that a campaign will reach its funding target or that beneficiaries will achieve full recovery/resolution.</li>
                  <li>Tax exemptions (e.g. Section 80G receipts) are issued only if the fundraiser is a certified NGO registered with Income Tax authorities.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl text-xs text-rose-900 space-y-1">
              <strong className="block font-bold">Prohibited Crowdfunding Activities:</strong>
              <p>
                You may not raise funds for illegal acts, political party bribes, speculative financial schemes (crypto/Ponzi), weapons, violent protests, personal gambling debt, or causes violating public order and Indian statutory regulations.
              </p>
            </div>
          </section>

          {/* Section 6: Political, Civic & Public Interest Petitions */}
          <section id="political-petitions" className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              6. Political, Civic & Public Interest Petitions
            </h2>
            <p>
              SoSign supports grassroots democratic civic discourse, enabling citizens to address petitions to elected officials (MLAs, MPs, Municipal Commissioners, Chief Ministers) and institutional decision-makers:
            </p>

            <div className="space-y-3 text-xs text-slate-700">
              <p>
                <strong>Platform Neutrality:</strong> SoSign is a non-partisan intermediary. The presence of any political petition, campaign, or signature count on our platform does not constitute an endorsement, sponsorship, or affiliation by SoSign with any political party, candidate, or ideology.
              </p>
              <p>
                <strong>Constituency-Restricted Petitions:</strong> Certain civic petitions may mandate voter constituency validation (e.g., restricted to registered voters of a specific Assembly or Parliamentary constituency). Users signing such petitions agree that their location or constituency eligibility may be validated.
              </p>
              <p>
                <strong>Election Laws Compliance:</strong> During election periods, users must abide by the <strong>Model Code of Conduct (MCC)</strong> enforced by the Election Commission of India. Petitions inciting communal violence, voter suppression, character assassination, or illegal campaign financing will be immediately removed.
              </p>
            </div>
          </section>

          {/* Section 7: Public Figures, Notable Signers & Legal Cases */}
          <section id="public-figures-legal" className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              7. Petitions Involving Public Figures, Notable Signatures & Legal Cases
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">
                  A. Notable & Requested Signers Verification Claims:
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  When a campaign includes &quot;Requested Signatures&quot; for public figures (celebrities, ministers, civil servants, or industry leaders), signatures can only be marked as verified/signed through our official verification claim workflow. Claimants must submit verifiable evidence (official document, verified tweet/statement, or video statement recording) subject to admin audit approval.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">
                  B. Sub-Judice Matters & Judicial Respect:
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  SoSign strictly prohibits petitions designed to subvert, intimidate, or commit <strong>Contempt of Court</strong> regarding active judicial proceedings before the Supreme Court of India, High Courts, or Subordinate Judiciary. Petitions must not publish confidential case records, violate judicial gag orders, or prejudge criminal liability.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">
                  C. Defamation, Objections & Notice-and-Takedown Workflow:
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  If an individual, public figure, or authorized representative believes that a petition contains false, defamatory, or privacy-violating claims, they may lodge a formal objection using our built-in <strong>&quot;Report Objection / Takedown Request&quot;</strong> module on the petition page. All reported objections are reviewed by our legal compliance team within 24 to 36 hours.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: Copyright Infringement & Takedown Process */}
          <section id="copyright-takedown" className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              8. Copyright & IP Infringement Notice-and-Takedown Process
            </h2>
            <p>
              SoSign respects the intellectual property rights of creators and adheres to the <strong>Indian Copyright Act, 1957</strong> and the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.
            </p>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900">How to Submit a Formal Copyright Infringement Notice:</h4>
              <p>If you believe your copyrighted work has been reproduced on SoSign without authorization, send a written infringement notice containing the following mandatory details:</p>
              <ul className="space-y-2 list-decimal pl-5 text-slate-600">
                <li><strong>Identification of Work:</strong> Description of the copyrighted work claimed to be infringed, or a representative list of works.</li>
                <li><strong>Location on SoSign:</strong> The exact URL, petition slug, or direct link where the infringing material is hosted.</li>
                <li><strong>Complainant Information:</strong> Your full legal name, organization (if applicable), physical address, phone number, and official email.</li>
                <li><strong>Good Faith Statement:</strong> A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
                <li><strong>Accuracy & Authority Statement:</strong> A declaration under penalty of perjury that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
                <li><strong>Signature:</strong> An electronic or physical signature of the copyright owner or authorized representative.</li>
              </ul>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Counter-Notification & Repeat Infringer Policy:</h4>
                <p className="text-slate-600">
                  If your content was removed due to a copyright complaint and you believe this was due to mistake or misidentification, you may submit a formal counter-notification with proof of ownership or license. SoSign maintains a policy of terminating user accounts found to be repeat infringers of intellectual property rights.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9: Legally Appropriate Liability & Indemnification */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              9. Limitation of Liability, Intermediary Safe Harbor & Indemnification
            </h2>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-2">
                <p className="font-mono text-pink-400 font-bold uppercase">
                  INTERMEDIARY SAFE HARBOR (SECTION 79, IT ACT, 2000)
                </p>
                <p className="leading-relaxed">
                  SoSign is an electronic intermediary that provides a platform for users to publish and sign public interest petitions. In accordance with Section 79 of the Information Technology Act, 2000, SoSign does not initiate transmissions, select recipients, or modify user-generated content, and shall not be liable for third-party user content, comments, or campaign claims, provided it complies with statutory due diligence obligations.
                </p>
                <p className="leading-relaxed">
                  To the maximum extent permitted by applicable Indian law, SoSign’s aggregate cumulative liability for all claims arising out of or related to the use of the platform shall not exceed the total fees paid by you to SoSign in the three (3) months preceding the incident, or ₹1,000 INR, whichever is lower.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">User Indemnification:</h4>
                <p className="text-slate-600 leading-relaxed">
                  You agree to defend, indemnify, and hold harmless SoSign, Leoheart iTECH Mumbai, its directors, officers, employees, agents, and affiliates against any and all claims, liabilities, damages, losses, costs, or legal expenses (including reasonable attorney fees) arising from: (a) your User Content or petitions; (b) your violation of these Terms; (c) your submission of forged or unauthorized KYC credentials; (d) your infringement of third-party copyright, privacy, or defamation laws; or (e) fraudulent fundraising representations.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10: Dispute Resolution & Governing Law */}
          <section id="dispute-arbitration" className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <span className="w-2 h-6 bg-[#F43676] rounded-full"></span>
              10. Governing Law, Dispute Resolution & Binding Arbitration
            </h2>
            
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">A. Governing Law & Jurisdiction:</h4>
                <p className="text-slate-600 leading-relaxed">
                  These Terms, their interpretation, and any disputes arising under or in connection with them shall be governed by and construed in accordance with the <strong>laws of the Republic of India</strong>. Subject to the arbitration clause below, the courts located in <strong>Mumbai, Maharashtra, India</strong> shall have exclusive jurisdiction over all legal proceedings.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-900">B. Informal Dispute Resolution:</h4>
                <p className="text-slate-600 leading-relaxed">
                  Before initiating formal legal proceedings, the parties agree to first attempt to resolve any dispute, claim, or controversy amicably through mutual good-faith written negotiations for a minimum period of thirty (30) days from written notice of dispute.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-900">C. Binding Arbitration (Arbitration and Conciliation Act, 1996):</h4>
                <p className="text-slate-600 leading-relaxed">
                  If an amicable resolution is not reached within 30 days, the dispute shall be finally resolved by binding arbitration in accordance with the <strong>Arbitration and Conciliation Act, 1996</strong> (as amended). The arbitration tribunal shall consist of a single sole arbitrator appointed mutually by the parties. The seat and venue of arbitration shall be <strong>Mumbai, Maharashtra, India</strong>, and proceedings shall be conducted in the English language. The arbitral award shall be final and binding on all parties.
                </p>
              </div>
            </div>
          </section>

          {/* Bottom Callout */}
          <div className="pt-4 text-center border-t border-gray-200">
            <p className="text-sm font-bold text-[#F43676]">
              Thank you for participating responsibly in shaping a transparent, verified, and democratic India with SoSign.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
