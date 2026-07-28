"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaEnvelopeOpenText,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaArrowRight,
  FaPaperPlane,
  FaCheckCircle,
  FaSpinner,
  FaBookOpen,
  FaNewspaper,
  FaShareAlt,
  FaThumbtack,
} from "react-icons/fa";

export default function NewsletterPage() {
  const [newsletters, setNewsletters] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Subscription form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subSuccess, setSubSuccess] = useState("");
  const [subError, setSubError] = useState("");

  // Fetch published newsletters from backend
  useEffect(() => {
    const fetchNewsletters = async () => {
      setLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const catParam = selectedCategory !== "All" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";

        const res = await fetch(
          `${backendUrl}/api/newsletters?page=${currentPage}&limit=9${catParam}${searchParam}`
        );

        if (!res.ok) throw new Error("Failed to fetch newsletter archive");

        const data = await res.json();
        setNewsletters(data.newsletters || []);
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching newsletter archive:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchNewsletters, 300);
    return () => clearTimeout(timer);
  }, [currentPage, selectedCategory, searchQuery]);

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
        body: JSON.stringify({ email, name, source: "newsletter_page" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Subscription failed");

      setSubSuccess(data.message || "Subscribed successfully!");
      setEmail("");
      setName("");
    } catch (err) {
      setSubError(err.message || "Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Periodical",
    "name": "Sosign Newsletter - Social Impact & Community Victories",
    "url": "https://sosign.in/newsletter",
    "description": "Stay updated on impactful petitions, successful social movements, community change, and civic victories across the nation.",
    "publisher": {
      "@type": "Organization",
      "name": "Sosign",
      "url": "https://sosign.in",
      "logo": "https://sosign.in/favicon.ico"
    },
    "hasPart": newsletters.map((item) => ({
      "@type": "PublicationIssue",
      "issueNumber": item.issueNumber || 1,
      "name": item.title,
      "datePublished": item.publishedAt || item.createdAt,
      "url": `https://sosign.in/newsletter/${item.slug}`
    }))
  };

  return (
    <>
      {/* SEO Head Tags */}
      <head>
        <title>Sosign Newsletter – Social Impact, Petition Updates & Community Victories</title>
        <meta
          name="description"
          content="Subscribe to the Sosign Newsletter. Read inspiring stories of social change, trending petitions, successful campaigns, and community advocacy."
        />
        <meta
          name="keywords"
          content="sosign newsletter, petitions, social impact, civic advocacy, community stories, petition updates, online campaigns"
        />
        <link rel="canonical" href="https://sosign.in/newsletter" />
        <meta property="og:title" content="Sosign Newsletter – Stories of Change & Community Action" />
        <meta
          property="og:description"
          content="Subscribe for weekly insights into active petitions, public campaigns, and policy reforms driving real impact."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sosign.in/newsletter" />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <section className="bg-[#f0f2f5] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Section with Glassmorphism & Vibrant Design */}
          <div className="relative bg-gradient-to-r from-[#002050] via-[#1a3a6e] to-[#302D55] rounded-3xl p-8 md:p-14 text-white overflow-hidden shadow-2xl">
            {/* Decorative background blurs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F43676]/20 rounded-full -translate-y-36 translate-x-36 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading & Info */}
              <div className="lg:col-span-7 text-center lg:text-left space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#F43676]">
                  <FaEnvelopeOpenText className="text-sm" /> Official Sosign Newsletter
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                  Stay Connected with <span className="text-[#F43676]">Real Change</span>
                </h1>

                <p className="text-white/85 text-base md:text-lg max-w-2xl leading-relaxed">
                  Join thousands of changemakers receiving curated insights, winning petition breakdowns, and grassroots advocacy stories delivered directly to your inbox.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <FaCheckCircle className="text-[#F43676]" /> Weekly Editions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaCheckCircle className="text-[#F43676]" /> Zero Spam
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaCheckCircle className="text-[#F43676]" /> Unsubscribe Anytime
                  </span>
                </div>
              </div>

              {/* Right Column: Direct Email Subscribe Card */}
              <div className="lg:col-span-5">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-2">Subscribe to Newsletter</h3>
                  <p className="text-white/70 text-xs mb-5">
                    Never miss a major petition victory or social impact movement.
                  </p>

                  {subSuccess ? (
                    <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-100 p-4 rounded-xl text-sm flex items-center gap-3">
                      <FaCheckCircle className="text-emerald-400 text-xl shrink-0" />
                      <div>
                        <p className="font-semibold">Subscribed!</p>
                        <p className="text-xs text-emerald-200 mt-0.5">{subSuccess}</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      {subError && (
                        <div className="bg-red-500/20 border border-red-400 text-red-100 p-3 rounded-lg text-xs">
                          {subError}
                        </div>
                      )}
                      <div>
                        <input
                          type="text"
                          placeholder="Your Name (Optional)"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm outline-none focus:border-[#F43676] transition-colors"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          required
                          placeholder="Enter your email address..."
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm outline-none focus:border-[#F43676] transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={subscribing}
                        className="w-full py-3.5 bg-[#F43676] hover:bg-[#e02a60] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        {subscribing ? (
                          <>
                            <FaSpinner className="animate-spin" /> Subscribing...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane /> Join Free Newsletter
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#002050]">Newsletter Archive</h2>
                <p className="text-gray-500 text-sm">Explore past newsletter editions, impact articles, and reports.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search editions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002050] outline-none focus:border-[#F43676] transition-colors"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-[#002050] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter List / Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
              <span className="ml-3 text-lg font-medium text-gray-600">Loading newsletter editions...</span>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <p className="text-red-600 font-medium mb-3">Unable to load newsletters: {error}</p>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-5 py-2 bg-[#002050] text-white rounded-xl text-sm font-semibold"
              >
                Reload
              </button>
            </div>
          ) : newsletters.length === 0 ? (
            <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
              <div className="w-16 h-16 bg-rose-50 text-[#F43676] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FaNewspaper />
              </div>
              <h3 className="text-xl font-bold text-[#002050]">No Newsletter Editions Found</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                {searchQuery || selectedCategory !== "All"
                  ? "Try clearing your search or selecting a different category filter."
                  : "New newsletter editions are published every week! Be sure to subscribe above to receive the next issue."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsletters.map((item) => (
                <article
                  key={item._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 group"
                >
                  {/* Card Cover Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[#002050] to-[#302d55] overflow-hidden">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/40 p-4 text-center">
                        <FaEnvelopeOpenText className="text-4xl mb-2 text-[#F43676]" />
                        <span className="text-xs font-semibold text-white/60">Sosign Newsletter</span>
                      </div>
                    )}

                    {/* Category & Issue badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-[#002050]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                        Issue #{item.issueNumber || 1}
                      </span>
                      <span className="bg-[#F43676] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {item.category || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-[#F43676]" />
                          {formatDate(item.publishedAt || item.createdAt)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaUser />
                          {item.author || "Sosign Team"}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-[#002050] group-hover:text-[#F43676] transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {item.excerpt || item.subject}
                      </p>
                    </div>

                    {/* Card Footer Link */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">
                        {item.views || 0} views
                      </span>
                      <Link
                        href={`/newsletter/${item.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#F43676] hover:text-[#002050] transition-colors"
                      >
                        Read Issue <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#002050] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
              >
                Previous Page
              </button>
              <span className="text-xs font-semibold text-gray-500 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#002050] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
