"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaShieldHalved,
  FaScaleBalanced,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaBuildingColumns,
  FaCircleCheck,
  FaClockRotateLeft,
  FaMagnifyingGlass,
  FaUserShield,
} from "react-icons/fa6";

const GRIEVANCE_CATEGORIES = [
  { id: "privacy_grievance", label: "General Data Protection / Privacy Grievance" },
  { id: "data_access", label: "Right to Access Personal Data (Section 11)" },
  { id: "data_correction", label: "Right to Correction / Completion (Section 12)" },
  { id: "data_erasure", label: "Right to Erasure / Account Deletion (Section 12)" },
  { id: "consent_withdrawal", label: "Withdrawal of Consent (Section 6(4))" },
];

export default function GrievancePage() {
  // Form submission state
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "privacy_grievance",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Tracker state
  const [trackTicketId, setTrackTicketId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackedRecord, setTrackedRecord] = useState(null);
  const [trackError, setTrackError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmitGrievance = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmittedTicket(null);

    if (!form.name || !form.email || !form.subject || !form.message) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${backendUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit grievance");
      }

      setSubmittedTicket(data.ticketId);
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "privacy_grievance",
      });
    } catch (err) {
      console.error("Grievance submission error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackTicket = async (e) => {
    e.preventDefault();
    setTrackError("");
    setTrackedRecord(null);

    const cleanId = trackTicketId.trim();
    if (!cleanId) {
      setTrackError("Please enter your Ticket Reference ID.");
      return;
    }

    try {
      setIsTracking(true);
      const res = await fetch(`${backendUrl}/api/contact/track/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (!res.ok || !data.contact) {
        throw new Error(data.message || "No grievance ticket found matching this reference ID.");
      }

      setTrackedRecord(data.contact);
    } catch (err) {
      console.error("Tracking error:", err);
      setTrackError(err.message || "Ticket not found. Please verify your reference number.");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-[#002050] via-[#1a3a6e] to-[#302D55] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
              <FaShieldHalved className="text-xs" /> DPDP Act Statutory Mechanism
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Data Protection Grievance Portal
            </h1>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Pursuant to <strong>Section 8(10) & Section 13 of the Digital Personal Data Protection Act, 2023</strong>. Exercise your statutory rights, report data issues, or track resolution progress directly with our Grievance Redressal Officer.
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-pink-200/90 font-mono">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                ⚡ 24h Formal Acknowledgment
              </span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                ⏱️ 15-Day Maximum Resolution SLA
              </span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                🏛️ Right to Appeal to DPBI
              </span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: File Grievance (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#002050] flex items-center gap-2">
                <FaScaleBalanced className="text-[#F43676]" />
                File a Statutory Data Privacy Grievance
              </h2>
              <p className="text-xs text-slate-500">
                Your submission is assigned a unique statutory Ticket ID and reviewed by our designated Data Protection Officer.
              </p>
            </div>

            {submittedTicket ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-center animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl">
                  <FaCircleCheck />
                </div>
                <h3 className="text-lg font-bold text-emerald-950">Grievance Registered Successfully</h3>
                <p className="text-xs text-emerald-800">
                  Your statutory ticket has been logged with reference number:
                </p>
                <div className="p-3 bg-white border border-emerald-200 rounded-xl font-mono text-base font-black text-emerald-700 tracking-wider">
                  {submittedTicket}
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Our Grievance Redressal Officer will acknowledge your ticket within 24 business hours. You can track updates at any time using the tracker on this page.
                </p>
                <button
                  onClick={() => setSubmittedTicket(null)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Submit Another Grievance
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitGrievance} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3650AD]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Registered Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="rajesh@example.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3650AD]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Statutory Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#3650AD]"
                  >
                    {GRIEVANCE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Subject of Grievance *</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief summary of your privacy request or grievance"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3650AD]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Detailed Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Please specify the exact personal data or action requested under the DPDP Act 2023..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3650AD]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#3650AD] hover:bg-[#2b4191] text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <FaEnvelope />
                  {isSubmitting ? "Registering Grievance..." : "File Statutory Grievance (DPDP Section 13)"}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Tracker & Officer Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Ticket Status Tracker */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <FaMagnifyingGlass className="text-[#3650AD]" />
                <h3>Track Grievance Resolution Status</h3>
              </div>
              <p className="text-xs text-slate-500">
                Enter your statutory Ticket ID (e.g. <code>DPDP-2026-XXXXXX</code>) to check live progress.
              </p>

              <form onSubmit={handleTrackTicket} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackTicketId}
                    onChange={(e) => setTrackTicketId(e.target.value)}
                    placeholder="DPDP-2026-..."
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#3650AD]"
                  />
                  <button
                    type="submit"
                    disabled={isTracking}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                  >
                    {isTracking ? "..." : "Track"}
                  </button>
                </div>
                {trackError && <p className="text-rose-600 text-xs font-semibold">{trackError}</p>}
              </form>

              {trackedRecord && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#3650AD]">{trackedRecord.ticketId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {trackedRecord.status}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800">{trackedRecord.subject}</p>
                  <p className="text-[11px] text-slate-500">
                    Filed on: {new Date(trackedRecord.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  {trackedRecord.adminResponse ? (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Grievance Officer Response:</span>
                      <p className="text-slate-700 text-xs leading-relaxed">{trackedRecord.adminResponse}</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-700 italic">
                      Under formal review by the Grievance Redressal Officer.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Officer Contact Coordinates */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-extrabold text-[#002050] text-sm flex items-center gap-2">
                <FaUserShield className="text-[#F43676]" />
                Designated Grievance Redressal Officer
              </h3>

              <div className="space-y-2 text-slate-700 leading-relaxed">
                <p>
                  <strong>Designated Officer:</strong> Mr. Narendra Kumar (Data Protection & Grievance Redressal Officer)
                </p>
                <p>
                  <strong>Entity:</strong> LEO MEO IT Solution Private Limited (Platform: SoSign)
                </p>
                <p className="flex items-center gap-2">
                  <FaEnvelope className="text-[#3650AD]" />
                  <span>Official Grievance: <a href="mailto:grievance@sosign.in" className="text-[#3650AD] font-bold underline">grievance@sosign.in</a></span>
                </p>
                <p className="flex items-center gap-2">
                  <FaPhone className="text-emerald-600" />
                  <span>Helpline: <a href="tel:+919323677688" className="text-slate-900 font-semibold underline">+91 9323677688</a></span>
                </p>
                <p className="flex items-start gap-2">
                  <FaLocationDot className="text-slate-500 mt-0.5" />
                  <span>NESCO Center, Western Express Highway, Goregaon East, Mumbai, Maharashtra 400063, India</span>
                </p>
              </div>

              {/* Appellate Escalation */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-slate-700">
                <h4 className="font-bold text-[#002050] flex items-center gap-1.5 text-xs">
                  <FaBuildingColumns className="text-blue-600" />
                  Appellate Right (DPDP Section 13(3))
                </h4>
                <p className="text-[11px] leading-relaxed">
                  If you do not receive a resolution within the prescribed statutory period or are unsatisfied with the resolution, you have the legal right under the DPDP Act 2023 to file an appeal with the <strong>Data Protection Board of India (DPBI)</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
