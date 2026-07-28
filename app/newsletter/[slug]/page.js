"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FaCalendarAlt,
  FaUser,
  FaEye,
  FaShareAlt,
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaArrowLeft,
  FaPaperPlane,
  FaCheckCircle,
  FaSpinner,
  FaEnvelopeOpenText,
  FaTag,
} from "react-icons/fa";

export default function NewsletterDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [newsletter, setNewsletter] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Subscribe form state
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subSuccess, setSubSuccess] = useState("");
  const [subError, setSubError] = useState("");

  useEffect(() => {
    const fetchNewsletterDetail = async () => {
      setLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/newsletters/${slug}`);

        if (!res.ok) throw new Error("Newsletter issue not found");

        const data = await res.json();
        setNewsletter(data.newsletter);
        setRelated(data.related || []);
      } catch (err) {
        console.error("Error loading newsletter detail:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchNewsletterDetail();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubscribing(true);
    setSubSuccess("");
    setSubError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/newsletters/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "newsletter_detail_page" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Subscription failed");

      setSubSuccess(data.message || "Subscribed successfully!");
      setEmail("");
    } catch (err) {
      setSubError(err.message || "Failed to subscribe.");
    } finally {
      setSubscribing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-[#f0f2f5] min-h-screen py-24 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
        <span className="ml-3 text-lg font-medium text-[#002050]">Loading newsletter issue...</span>
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="bg-[#f0f2f5] min-h-screen py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
          <div className="text-5xl mb-4">📰</div>
          <h2 className="text-2xl font-bold text-[#002050] mb-2">Newsletter Issue Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">{error || "The newsletter issue you requested could not be found."}</p>
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#002050] text-white rounded-xl text-sm font-bold hover:bg-[#F43676] transition-colors"
          >
            <FaArrowLeft /> Back to Archive
          </Link>
        </div>
      </div>
    );
  }

  // SEO Metadata & JSON-LD NewsArticle Schema
  const canonicalUrl = `https://sosign.in/newsletter/${newsletter.slug}`;
  const pageTitle = newsletter.metaTitle || `${newsletter.title} | Sosign Newsletter Issue #${newsletter.issueNumber || 1}`;
  const pageDescription = newsletter.metaDescription || newsletter.excerpt || newsletter.subject;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": newsletter.title,
    "description": pageDescription,
    "image": newsletter.coverImage ? [newsletter.coverImage] : ["https://sosign.in/favicon.ico"],
    "datePublished": newsletter.publishedAt || newsletter.createdAt,
    "dateModified": newsletter.updatedAt || newsletter.createdAt,
    "author": {
      "@type": "Person",
      "name": newsletter.author || "Sosign Editorial Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sosign",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sosign.in/favicon.ico"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  return (
    <>
      <head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {newsletter.keywords && newsletter.keywords.length > 0 && (
          <meta name="keywords" content={newsletter.keywords.join(", ")} />
        )}
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={newsletter.title} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {newsletter.coverImage && <meta property="og:image" content={newsletter.coverImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={newsletter.title} />
        <meta name="twitter:description" content={pageDescription} />
        {newsletter.coverImage && <meta name="twitter:image" content={newsletter.coverImage} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <article className="bg-[#f0f2f5] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Breadcrumb Navigation */}
          <div>
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#002050] hover:text-[#F43676] transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
            >
              <FaArrowLeft /> Back to Newsletter Archive
            </Link>
          </div>

          {/* Main Article Container */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
            {/* Header Banner */}
            <div className="p-8 md:p-12 bg-gradient-to-r from-[#002050] via-[#1a3a6e] to-[#302D55] text-white space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#F43676] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Issue #{newsletter.issueNumber || 1}
                </span>
                <span className="bg-white/10 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/15">
                  {newsletter.category || "Social Impact"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                {newsletter.title}
              </h1>

              {newsletter.subject && (
                <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                  {newsletter.subject}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-white/70 border-t border-white/10">
                <span className="flex items-center gap-1.5">
                  <FaUser className="text-[#F43676]" />
                  By {newsletter.author || "Sosign Team"}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-[#F43676]" />
                  {formatDate(newsletter.publishedAt || newsletter.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaEye className="text-[#F43676]" />
                  {newsletter.views || 1} views
                </span>
              </div>
            </div>

            {/* Cover Image */}
            {newsletter.coverImage && (
              <div className="w-full max-h-[450px] overflow-hidden bg-gray-100">
                <img
                  src={newsletter.coverImage}
                  alt={newsletter.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Body */}
            <div className="p-8 md:p-12 space-y-8">
              <div className="prose prose-lg max-w-none text-[#302d55] leading-relaxed whitespace-pre-line text-base md:text-lg">
                {newsletter.content}
              </div>

              {/* Tags Section */}
              {newsletter.tags && newsletter.tags.length > 0 && (
                <div className="pt-6 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                  <FaTag className="text-[#F43676] text-xs" />
                  {newsletter.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Sharing Bar */}
              <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
                <span className="text-sm font-bold text-[#002050] flex items-center gap-2">
                  <FaShareAlt className="text-[#F43676]" /> Share this Newsletter Issue
                </span>

                <div className="flex items-center gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(newsletter.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Share on X (Twitter)"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#3b5998] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Share on Facebook"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${newsletter.title} - ${canonicalUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Share on WhatsApp"
                  >
                    <FaWhatsapp />
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="w-10 h-10 bg-[#002050] text-white rounded-full flex items-center justify-center hover:bg-[#F43676] transition-colors relative"
                    title="Copy Link"
                  >
                    <FaLink />
                    {copied && (
                      <span className="absolute -top-8 bg-black text-white text-[10px] font-bold px-2 py-1 rounded">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Subscription Callout */}
          <div className="bg-gradient-to-r from-[#002050] to-[#302D55] text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-[#F43676]">
              <FaEnvelopeOpenText /> Never miss an update
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold">Enjoyed this newsletter edition?</h3>
            <p className="text-white/80 text-sm max-w-xl mx-auto">
              Subscribe to get next week&apos;s petition insights, winning movement breakdowns, and civic reform news directly to your inbox.
            </p>

            {subSuccess ? (
              <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-100 p-4 rounded-xl text-sm max-w-md mx-auto flex items-center justify-center gap-2">
                <FaCheckCircle className="text-emerald-400" />
                <span>{subSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm outline-none focus:border-[#F43676]"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="w-full sm:w-auto px-6 py-3 bg-[#F43676] hover:bg-[#e02a60] text-white font-bold rounded-xl text-sm whitespace-nowrap transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {subscribing ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />} Subscribe Free
                </button>
              </form>
            )}
          </div>

          {/* Related Newsletter Editions */}
          {related.length > 0 && (
            <div className="space-y-6 pt-6">
              <h3 className="text-2xl font-bold text-[#002050]">More Newsletter Editions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel._id}
                    href={`/newsletter/${rel.slug}`}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-[#F43676] uppercase tracking-wider">
                        Issue #{rel.issueNumber || 1}
                      </span>
                      <h4 className="font-bold text-[#002050] group-hover:text-[#F43676] transition-colors mt-1 line-clamp-2">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {rel.excerpt || rel.subject}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 mt-4 block">
                      {formatDate(rel.publishedAt || rel.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
