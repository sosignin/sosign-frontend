"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import config from '@/config/api';
import {
  MapPin,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ShieldCheck,
  Search,
  Clock,
  FileCheck2,
  Scale,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: initialType === 'privacy' || initialType === 'grievance' ? 'privacy_grievance' : 'general',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submittedData, setSubmittedData] = useState(null);

  // Ticket tracking state
  const [trackingId, setTrackingId] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);
  const [ticketError, setTicketError] = useState('');
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [escalateSuccess, setEscalateSuccess] = useState('');
  const [escalateError, setEscalateError] = useState('');
  const [showDpbGuide, setShowDpbGuide] = useState(false);
  const [contactConsent, setContactConsent] = useState(false);

  useEffect(() => {
    if (initialType === 'privacy' || initialType === 'grievance') {
      setFormData((prev) => ({
        ...prev,
        category: 'privacy_grievance',
        subject: prev.subject || 'DPDP Act Grievance / Data Principal Request',
      }));
    }
  }, [initialType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!contactConsent) {
      setStatus({ type: 'error', text: 'Please check the consent box to submit your request or grievance under the DPDP Act.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const res = await fetch(`${config.API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: 'success',
          text: data.message || 'Thank you! Your message has been sent successfully.',
        });
        setSubmittedData({ ...formData, ticketId: data.ticketId });
        setTrackingId(data.ticketId);
        setFormData({ name: '', email: '', subject: '', message: '', category: 'general' });
      } else {
        setStatus({
          type: 'error',
          text: data.message || 'Failed to send message. Please try again.',
        });
      }
    } catch (err) {
      console.error('Contact form submit error:', err);
      setStatus({
        type: 'error',
        text: 'An error occurred while sending your message. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (idToTrack) => {
    const rawId = idToTrack !== undefined ? idToTrack : trackingId;
    const cleanId = (rawId || '').replace(/^[#\s]+|[#\s]+$/g, '').trim();

    if (!cleanId) {
      setTicketError('Please enter a valid Ticket ID (e.g., DPDP-2026-123456).');
      return;
    }

    setTrackingLoading(true);
    setTicketError('');
    setTicketResult(null);
    setEscalateSuccess('');
    setEscalateError('');

    try {
      const res = await fetch(`${config.API_BASE_URL}/api/contact/track/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (res.ok && data.success && data.contact) {
        setTicketResult(data.contact);
      } else {
        setTicketError(data.message || `No record found with Ticket ID "${cleanId}".`);
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setTicketError('Unable to connect to the ticket tracking server. Please check your connection.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleTrackTicket = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    fetchTicketDetails();
  };

  const handleCopyTicket = (id) => {
    if (!id) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const handleEscalateTicket = async (ticketIdToEscalate) => {
    if (!ticketIdToEscalate) return;
    setEscalating(true);
    setEscalateError('');
    setEscalateSuccess('');

    try {
      const cleanId = ticketIdToEscalate.replace(/^[#\s]+|[#\s]+$/g, '').trim();
      const res = await fetch(`${config.API_BASE_URL}/api/contact/track/${encodeURIComponent(cleanId)}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Section 13(3) DPDP Act Grievance Escalation invoked by Data Principal.' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEscalateSuccess(data.message || 'Escalation notice registered with Grievance Redressal Officer.');
        fetchTicketDetails(cleanId);
      } else {
        setEscalateError(data.message || 'Failed to submit escalation.');
      }
    } catch (err) {
      console.error('Escalation error:', err);
      setEscalateError('Failed to trigger escalation. Please contact grievance@sosign.in directly.');
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#3650AD]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Office</h2>
              <p className="text-xs text-slate-500">Corporate & Operational Center</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed pl-1">
            NESCO Center, Western Express Highway, Goregaon East<br />
            Mumbai, Maharashtra 400063, India
          </p>
        </div>

        {/* Website Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#F43676]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Official Portal</h2>
              <p className="text-xs text-slate-500">National Civic Platform</p>
            </div>
          </div>
          <a
            href="https://sosign.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#3650AD] hover:text-[#F43676] font-semibold transition-colors pl-1 block"
          >
            https://sosign.in
          </a>
        </div>

        {/* Phone Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Citizen Helpline</h2>
              <p className="text-xs text-slate-500">Mon - Sat (10:00 AM - 6:00 PM IST)</p>
            </div>
          </div>
          <a
            href="tel:+919323677688"
            className="text-sm text-slate-700 hover:text-[#3650AD] font-semibold transition-colors pl-1 block"
          >
            +91 9323677688
          </a>
        </div>

        {/* Email Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">General Support</h2>
              <p className="text-xs text-slate-500">Platform assistance & inquiries</p>
            </div>
          </div>
          <a
            href="mailto:support@sosign.in"
            className="text-sm text-slate-700 hover:text-[#3650AD] font-semibold transition-colors pl-1 block"
          >
            support@sosign.in
          </a>
        </div>
      </div>

      {/* DPDP Act Statutory Grievance Redressal Banner */}
      <div className="bg-gradient-to-br from-[#002050] to-[#1e3a8a] text-white rounded-3xl p-6 md:p-8 shadow-lg border border-blue-900/40 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold">Data Protection & Privacy Grievance Redressal Cell</h3>
                <p className="text-xs text-blue-200">Mandated under Section 8(10) & Section 13 of the Digital Personal Data Protection (DPDP) Act, 2023</p>
              </div>
            </div>
            <Link
              href="/privacy"
              className="text-xs font-semibold text-pink-300 hover:text-white underline transition"
            >
              View Privacy Policy
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-100 pt-1">
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
              <span className="font-bold text-white block mb-1">Grievance Redressal Officer</span>
              <p>Office of Data Protection & Grievance</p>
              <p className="text-blue-200">LEO MEO IT Solution (SoSign Division)</p>
            </div>
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
              <span className="font-bold text-white block mb-1">Direct Grievance Contact</span>
              <p>Email: <a href="mailto:grievance@sosign.in" className="text-pink-300 font-bold underline">grievance@sosign.in</a></p>
              <p>Privacy: <a href="mailto:privacy@sosign.in" className="text-emerald-300 font-bold underline">privacy@sosign.in</a></p>
            </div>
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
              <span className="font-bold text-white block mb-1">Statutory Response SLA</span>
              <p>Acknowledgment: Within 24 Business Hours</p>
              <p className="text-emerald-300 font-semibold">Resolution: Within 15 - 30 Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Message Alert */}
      {status.text && (
        <div
          className={`p-6 rounded-2xl shadow-sm border ${
            status.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-4">
            {status.type === 'success' ? (
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            ) : (
              <div className="p-2 bg-rose-100 rounded-full text-rose-600 shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-base font-bold mb-1">
                {status.type === 'success' ? 'Submitted Successfully!' : 'Submission Failed'}
              </h3>
              <p className="text-sm leading-relaxed">{status.text}</p>
              
              {status.type === 'success' && submittedData && submittedData.ticketId && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-2">
                  <div className="font-bold text-emerald-950 flex flex-wrap items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Reference Ticket ID:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingId(submittedData.ticketId);
                        fetchTicketDetails(submittedData.ticketId);
                      }}
                      title="Click to track this ticket immediately"
                      className="font-mono text-xs text-[#002050] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg cursor-pointer transition flex items-center gap-1.5 font-bold hover:scale-[1.02]"
                    >
                      {submittedData.ticketId}
                      <Search className="w-3 h-3 text-[#3650AD]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyTicket(submittedData.ticketId)}
                      className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition"
                      title="Copy Ticket ID"
                    >
                      {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Please retain this ticket number. You can use it in the tracker panel on the right to monitor inquiry or DPDP statutory grievance progress.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Contact Form + Ticket Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Send an Inquiry or Privacy Request</h2>
            <p className="text-xs text-slate-500 mt-1">Select the appropriate category so our team or Grievance Officer can assist promptly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Inquiry / Request Classification <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition font-medium"
              >
                <option value="general">General Support & Platform Inquiry</option>
                <option value="privacy_grievance">Data Privacy Grievance (DPDP Act, 2023)</option>
                <option value="data_access">Right to Access / Copy of Personal Data</option>
                <option value="data_erasure">Right to Erasure / Account & Data Deletion</option>
                <option value="data_correction">Right to Correction / Data Updating</option>
                <option value="consent_withdrawal">Consent Withdrawal Request</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition"
                  placeholder="Citizen Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition"
                  placeholder="citizen@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition"
                placeholder="Brief summary of request or grievance"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Message / Grievance Particulars <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition resize-none"
                placeholder="Please describe your inquiry, relevant petition links, or grievance details clearly..."
              ></textarea>
            </div>

            {/* DPDP Act Explicit Statutory Consent Checkbox */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={contactConsent}
                  onChange={(e) => setContactConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#3650AD] focus:ring-[#3650AD] cursor-pointer shrink-0"
                  required
                />
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  I grant voluntary consent under Section 6 of the DPDP Act, 2023 for <strong>LEO MEO IT Solution (SoSign)</strong> to collect and process my name, email address, and grievance particulars solely for investigating and responding to this inquiry or statutory privacy request in accordance with the{' '}
                  <Link href="/privacy" className="text-[#3650AD] font-bold underline hover:text-[#F43676]">
                    Privacy Policy
                  </Link>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !contactConsent}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#3650AD] to-[#F43676] text-white font-bold rounded-xl shadow hover:shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering Ticket...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request / Grievance
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar: Ticket Status Tracker & DPDP Escalation */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6 h-fit">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-1">
              <Search className="w-5 h-5 text-[#3650AD]" />
              Track Ticket Status
            </div>
            <p className="text-xs text-slate-500">
              Check the live status of your general inquiry or DPDP statutory grievance.
            </p>
          </div>

          <form onSubmit={handleTrackTicket} className="space-y-3">
            <div>
              <label htmlFor="trackingId" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ticket ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="trackingId"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. DPDP-2026-123456"
                  className="w-full p-2.5 text-xs font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition pr-8"
                  required
                />
                {trackingId && (
                  <button
                    type="button"
                    onClick={() => setTrackingId('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={trackingLoading || !trackingId.trim()}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-[#3650AD] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {trackingLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Searching Records...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  Check Status
                </>
              )}
            </button>
          </form>

          {/* Ticket Error Notification */}
          {ticketError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{ticketError}</div>
            </div>
          )}

          {/* Ticket Result Display */}
          {ticketResult && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 text-xs">
              {/* Header with ID and Status Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 text-xs">{ticketResult.ticketId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyTicket(ticketResult.ticketId)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 transition"
                    title="Copy Ticket ID"
                  >
                    {copiedTicket ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ticketResult.isEscalated && (
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[9px] bg-rose-100 text-rose-800 border border-rose-200">
                      Escalated (Sec 13)
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                      ticketResult.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : ticketResult.status === 'replied'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : ticketResult.status === 'read'
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {ticketResult.status === 'unread'
                      ? 'Under Review'
                      : ticketResult.status === 'read'
                      ? 'Under Investigation'
                      : ticketResult.status === 'replied'
                      ? 'Response Sent'
                      : ticketResult.status === 'resolved'
                      ? 'Resolved & Closed'
                      : ticketResult.status}
                  </span>
                </div>
              </div>

              {/* Meta details */}
              <div className="space-y-1.5 text-slate-700 text-[11px]">
                <p>
                  <strong className="text-slate-900">Classification:</strong>{' '}
                  <span className="bg-slate-200/70 text-slate-800 px-1.5 py-0.5 rounded font-medium">
                    {ticketResult.category === 'privacy_grievance'
                      ? 'DPDP Privacy Grievance'
                      : ticketResult.category === 'data_access'
                      ? 'Right to Access Data (Sec 11)'
                      : ticketResult.category === 'data_erasure'
                      ? 'Right to Erasure (Sec 12)'
                      : ticketResult.category === 'data_correction'
                      ? 'Right to Correction'
                      : ticketResult.category === 'consent_withdrawal'
                      ? 'Consent Withdrawal'
                      : 'General Support'}
                  </span>
                </p>
                <p className="line-clamp-2">
                  <strong className="text-slate-900">Subject:</strong> {ticketResult.subject}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-slate-500 pt-0.5 text-[10px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Filed: {new Date(ticketResult.createdAt).toLocaleDateString()}
                    {ticketResult.daysElapsed !== undefined && ` (${ticketResult.daysElapsed}d ago)`}
                  </span>
                  {ticketResult.resolvedAt && (
                    <span className="text-emerald-700 font-semibold">
                      Resolved: {new Date(ticketResult.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Officer Resolution Box */}
              {ticketResult.adminResponse ? (
                <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1 shadow-xs">
                  <span className="font-bold text-[#002050] text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Grievance Officer Resolution:
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {ticketResult.adminResponse}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Under Active Review</span>
                    Assigned to Grievance Redressal Cell. Statutory SLA is 15 to 30 calendar days under the DPDP Act.
                  </div>
                </div>
              )}

              {/* Escalation Alerts and Triggers */}
              {ticketResult.isEligibleForEscalation && !ticketResult.isEscalated && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-2">
                  <div className="flex items-start gap-1.5 font-bold text-xs text-rose-950">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    Statutory Window Expired (&gt;30 Days)
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Under Section 13(3) of the DPDP Act, you are entitled to escalate this grievance directly to the Data Protection Board of India or request expedited officer review.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleEscalateTicket(ticketResult.ticketId)}
                    disabled={escalating}
                    className="w-full py-1.5 px-3 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {escalating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    Trigger Statutory Officer Escalation
                  </button>
                </div>
              )}

              {escalateSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {escalateSuccess}
                </div>
              )}

              {escalateError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-[11px] font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  {escalateError}
                </div>
              )}
            </div>
          )}

          {/* Section 13(3) DPDP Statutory Escalation Card */}
          <div className="pt-3 border-t border-slate-100 space-y-3 text-[11px] text-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                <Scale className="w-4 h-4 text-[#3650AD]" />
                Data Protection Board Escalation
              </div>
              <span className="text-[10px] font-semibold text-[#3650AD] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Sec 13(3) DPDP
              </span>
            </div>

            <p className="leading-relaxed">
              Under Section 13(3) of the Digital Personal Data Protection (DPDP) Act, 2023, if your statutory grievance remains unresolved after <strong>30 days</strong>, or if you are dissatisfied with SoSign&apos;s redressal, you may approach the <strong>Data Protection Board of India (DPBI)</strong>.
            </p>

            {/* Toggle Procedure Guide */}
            <button
              type="button"
              onClick={() => setShowDpbGuide(!showDpbGuide)}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-between text-[11px] transition cursor-pointer"
            >
              <span>How DPBI Statutory Escalation Works</span>
              {showDpbGuide ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            {/* Detailed Statutory Guidelines Accordion */}
            {showDpbGuide && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-[11px] text-slate-700 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#3650AD] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">1</span>
                    <p><strong>First Step (Internal Redressal):</strong> Register grievance with SoSign and retain your Ticket ID ({ticketResult ? ticketResult.ticketId : 'DPDP-2026-XXXXXX'}).</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#3650AD] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">2</span>
                    <p><strong>30-Day Window:</strong> Allow up to 30 calendar days for the appointed Grievance Redressal Officer to resolve your petition.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#3650AD] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">3</span>
                    <p><strong>Board Escalation:</strong> If unresolved or unsatisfied, approach the Data Protection Board of India via the central digital portal (under MeitY).</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#3650AD] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">4</span>
                    <p><strong>Evidence to Attach:</strong> Submit your Ticket ID, initial request timestamp, and any correspondence received from SoSign.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                  <a
                    href="mailto:grievance@sosign.in?subject=Statutory%20Escalation%20Notice%20-%20DPDP%20Act%20Section%2013(3)&body=Dear%20Grievance%20Redressal%20Officer,%0A%0AI%20am%20writing%20regarding%20my%20statutory%20grievance%20under%20the%20DPDP%20Act%202023.%0ATicket%20ID:%20"
                    className="w-full py-1.5 px-3 bg-white border border-slate-300 hover:border-blue-400 text-[#002050] hover:text-[#3650AD] rounded-lg font-bold text-center block transition text-[10px]"
                  >
                    Email Grievance Officer Notice directly
                  </a>
                  <a
                    href="https://www.meity.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-500 hover:text-slate-800 text-center flex items-center justify-center gap-1 transition"
                  >
                    MeitY / Data Protection Board Advisory <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight">
            Contact & Citizen Grievance Cell
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Reach out for general assistance, partnership inquiries, or to submit statutory requests under the Digital Personal Data Protection (DPDP) Act, 2023.
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#3650AD]" />
            Loading contact & grievance portal...
          </div>
        }>
          <ContactFormContent />
        </Suspense>
      </div>
    </div>
  );
}
