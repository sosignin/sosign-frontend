"use client";

import React, { useState } from 'react';
import { MapPin, Globe, Phone, Mail, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submittedData, setSubmittedData] = useState(null);

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

    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/api/contact`, {
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
        setSubmittedData({ ...formData });
        setFormData({ name: '', email: '', subject: '', message: '' });
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

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a2e] leading-tight mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We&apos;d love to hear from you! Reach out to us using the contact details below or send us a message.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Location Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3650AD]/10 to-[#3650AD]/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#3650AD]" />
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e]">Our Location</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              NESCO CENTER, GOREGAON EAST<br />
              Mumbai, India
            </p>
          </div>

          {/* Website Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F43676]/10 to-[#F43676]/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-[#F43676]" />
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e]">Website</h2>
            </div>
            <a
              href="https://sosign.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3650AD] hover:text-[#F43676] font-medium transition-colors"
            >
              SOSIGN.IN
            </a>
          </div>

          {/* Phone Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 flex items-center justify-center">
                <Phone className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e]">Phone</h2>
            </div>
            <a
              href="tel:+919323677688"
              className="text-gray-700 hover:text-[#3650AD] font-medium transition-colors"
            >
              +91 9323677688
            </a>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e]">Email</h2>
            </div>
            <a
              href="mailto:support@sosign.in"
              className="text-gray-700 hover:text-[#3650AD] font-medium transition-colors"
            >
              support@sosign.in
            </a>
          </div>
        </div>

        {/* Confirmation Message Alert */}
        {status.text && (
          <div
            className={`mb-8 p-6 rounded-2xl shadow-md border ${
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
                <h3 className="text-lg font-bold mb-1">
                  {status.type === 'success' ? 'Message Sent Successfully!' : 'Submission Failed'}
                </h3>
                <p className="text-sm leading-relaxed">{status.text}</p>
                
                {status.type === 'success' && submittedData && (
                  <div className="mt-4 pt-4 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-800">
                    <div><span className="font-semibold">Subject:</span> {submittedData.subject}</div>
                    <div><span className="font-semibold">Sender:</span> {submittedData.name} ({submittedData.email})</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-[#1a1a2e]">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition"
                placeholder="Subject of your message"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none transition resize-none"
                placeholder="Your message"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#3650AD] to-[#F43676] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
