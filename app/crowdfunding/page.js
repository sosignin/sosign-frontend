"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronRight,
  FaChevronLeft,
  FaHandHoldingHeart,
  FaIndianRupeeSign,
  FaLocationDot,
  FaPlus,
  FaSpinner,
  FaUsers,
  FaArrowTrendUp,
  FaBullseye,
  FaHeart,
  FaClock,
  FaCircleCheck,
  FaShieldHalved,
  FaPlay,
  FaPause,
} from "react-icons/fa6";
import { FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaFire } from "react-icons/fa";
import {
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Lock,
  Search as LucideSearch,
  SlidersHorizontal,
  Compass,
  HeartHandshake,
} from "lucide-react";
import axios from "axios";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getDaysLeft = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function CrowdfundingPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await axios.get(`${backendUrl}/api/crowdfunding`);
        const data = Array.isArray(response.data) ? response.data : response.data.campaigns || [];
        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Search suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      setSuggestionsLoading(true);
      const results = campaigns.filter(
        (c) =>
          c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.beneficiaryName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results.slice(0, 5));
      setShowSuggestions(true);
      setSuggestionsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, campaigns]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totals = campaigns.reduce(
    (summary, campaign) => ({
      raised: summary.raised + (Number(campaign.raisedAmount) || 0),
      goal: summary.goal + (Number(campaign.goalAmount) || 0),
      donors: summary.donors + (Number(campaign.donorsCount) || 0),
    }),
    { raised: 0, goal: 0, donors: 0 }
  );

  const categories = ["all", ...new Set(campaigns.map((c) => c.category).filter(Boolean))];

  const filteredCampaigns =
    filter === "all" ? campaigns : campaigns.filter((c) => c.category === filter);

  // Featured campaigns for hero slider (top 5 by raised amount)
  const featuredCampaigns = [...campaigns]
    .sort((a, b) => (Number(b.raisedAmount) || 0) - (Number(a.raisedAmount) || 0))
    .slice(0, 5);

  // Trending campaigns (most donors)
  const trendingCampaigns = [...campaigns]
    .sort((a, b) => (Number(b.donorsCount) || 0) - (Number(a.donorsCount) || 0))
    .slice(0, 4);

  // Recent campaigns
  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // Top stories for ticker
  const topStories = featuredCampaigns.map((c) => ({
    id: c._id,
    title: c.title?.length > 45 ? c.title.substring(0, 45) + "..." : c.title,
    amount: formatCurrency(c.raisedAmount),
    image: c.image,
    slug: c.slug,
  }));

  const nextSlide = () => {
    if (featuredCampaigns.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % featuredCampaigns.length);
  };

  const prevSlide = () => {
    if (featuredCampaigns.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + featuredCampaigns.length) % featuredCampaigns.length);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-3 border-pink-100 border-t-[#F43676] animate-spin" />
          <FaHandHoldingHeart className="text-[#F43676] text-lg absolute inset-0 m-auto" />
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-500 tracking-wider">
          Loading verified campaigns...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* ===== SECTION 1: Top Minimal Ticker Bar ===== */}
      <section className="px-4 sm:px-8 lg:px-12 pt-6">
        <div className="max-w-[1500px] mx-auto bg-white border border-gray-200/80 rounded-2xl overflow-hidden flex items-stretch shadow-xs">
          {/* Ticker Label */}
          <div className="flex items-center gap-2 bg-[#F43676] text-white px-4 sm:px-5 py-2.5 shrink-0">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="font-bold text-xs uppercase tracking-wider">
              Trending
            </span>
          </div>

          {/* Scrolling Ticker */}
          <div className="flex-1 overflow-hidden relative py-2 px-3 flex items-center">
            <div className={`ticker-track ${isTickerPaused ? "paused" : ""}`}>
              {[...topStories, ...topStories, ...topStories].map((story, index) => (
                <Link
                  key={`feed-${story.id}-${index}`}
                  href={`/crowdfunding/${story.slug || story.id}`}
                  className="flex items-center gap-2.5 shrink-0 px-2.5 py-1 rounded-xl hover:bg-pink-50/60 transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-pink-50 shrink-0 border border-pink-100">
                    {story.image ? (
                      <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaHandHoldingHeart className="text-[#F43676] text-[10px]" />
                      </div>
                    )}
                  </div>
                  <span className="text-slate-800 font-bold text-xs group-hover:text-[#F43676] transition-colors whitespace-nowrap">
                    {story.title}
                  </span>
                  <span className="text-[#F43676] font-extrabold text-[11px] bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                    {story.amount}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Pause/Play Button */}
          <button
            onClick={() => setIsTickerPaused(!isTickerPaused)}
            className="w-10 bg-gray-50 text-gray-500 hover:text-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 border-l border-gray-200/80 cursor-pointer"
            title={isTickerPaused ? "Play ticker" : "Pause ticker"}
          >
            {isTickerPaused ? <FaPlay className="text-[10px]" /> : <FaPause className="text-[10px]" />}
          </button>
        </div>
      </section>

      {/* ===== SECTION 2: Minimal Hero Slider ===== */}
      <section className="px-4 sm:px-8 lg:px-12 py-5">
        <div className="max-w-[1500px] mx-auto">
          {/* Header Subtitle */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200/80 text-[#F43676] text-xs font-bold">
              <FaHandHoldingHeart className="text-[#F43676] text-xs" />
              <span>Verified Community Crowdfunding</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Direct Beneficiary Transfer
              </span>
              <span>•</span>
              <span className="text-gray-500 font-semibold">0% Platform Deductions</span>
            </div>
          </div>

          {/* Hero Slider Card */}
          <div className="relative bg-white rounded-3xl border border-gray-200/80 shadow-md overflow-hidden p-4 sm:p-6 lg:p-7">
            <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-7">
              {/* Left - Image */}
              <div className="lg:w-[55%] relative h-[260px] sm:h-[320px] lg:h-auto min-h-[300px] lg:min-h-[360px] overflow-hidden rounded-2xl group shadow-sm bg-gray-100 flex-shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {featuredCampaigns[currentSlide]?.image ? (
                      <img
                        src={featuredCampaigns[currentSlide].image}
                        alt={featuredCampaigns[currentSlide]?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
                        <FaHandHoldingHeart className="text-6xl text-[#F43676]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>

                {/* Progress Badge */}
                {featuredCampaigns[currentSlide] && (() => {
                  const goal = Number(featuredCampaigns[currentSlide].goalAmount) || 0;
                  const raised = Number(featuredCampaigns[currentSlide].raisedAmount) || 0;
                  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                  return (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-[#F43676] px-3.5 py-1.5 rounded-full text-xs font-black shadow-md z-20 flex items-center gap-1.5 border border-pink-100">
                      <FaArrowTrendUp className="text-[#F43676] text-[10px]" />
                      <span>{pct.toFixed(0)}% Funded</span>
                    </div>
                  );
                })()}

                {/* Supporter Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white rounded-full px-3 py-1.5 z-20 text-xs font-semibold">
                  <FaUsers className="text-pink-300 text-[10px]" />
                  <span>{featuredCampaigns[currentSlide]?.donorsCount || 0} supporters</span>
                </div>

                {/* Arrows */}
                {featuredCampaigns.length > 1 && (
                  <div className="absolute right-4 bottom-4 flex items-center gap-1.5 z-20">
                    <button
                      onClick={prevSlide}
                      className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 hover:text-[#F43676] rounded-full shadow-md flex items-center justify-center transition-all cursor-pointer"
                    >
                      <FaChevronLeft className="text-[10px]" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 hover:text-[#F43676] rounded-full shadow-md flex items-center justify-center transition-all cursor-pointer"
                    >
                      <FaChevronRight className="text-[10px]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right - Content */}
              <div className="lg:w-[45%] flex flex-col justify-between py-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3.5"
                  >
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {featuredCampaigns[currentSlide]?.category && (
                        <span className="px-3 py-1 bg-pink-50 text-[#F43676] rounded-full text-xs font-bold border border-pink-100">
                          {featuredCampaigns[currentSlide].category}
                        </span>
                      )}
                      {featuredCampaigns[currentSlide] &&
                        getDaysLeft(featuredCampaigns[currentSlide].deadline) >= 0 &&
                        getDaysLeft(featuredCampaigns[currentSlide].deadline) <= 7 && (
                          <span className="px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                            <FaClock className="text-[9px]" />
                            {getDaysLeft(featuredCampaigns[currentSlide].deadline) === 0
                              ? "Last day"
                              : `${getDaysLeft(featuredCampaigns[currentSlide].deadline)} days left`}
                          </span>
                        )}
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Cause
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug line-clamp-2 hover:text-[#F43676] transition-colors">
                      <Link
                        href={`/crowdfunding/${featuredCampaigns[currentSlide]?.slug || featuredCampaigns[currentSlide]?._id}`}
                      >
                        {featuredCampaigns[currentSlide]?.title || "Start a Crowdfunding Campaign"}
                      </Link>
                    </h1>

                    {/* Story */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {featuredCampaigns[currentSlide]?.story?.substring(0, 190) ||
                        "Support verified community causes and medical fundraisers. 100% of your contributions go directly to the beneficiary."}
                      ...
                    </p>

                    {/* Progress */}
                    {featuredCampaigns[currentSlide] && (() => {
                      const goal = Number(featuredCampaigns[currentSlide].goalAmount) || 0;
                      const raised = Number(featuredCampaigns[currentSlide].raisedAmount) || 0;
                      const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                      return (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                                Raised
                              </span>
                              <span className="text-xl font-black text-slate-900">
                                {formatCurrency(raised)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                                Target Goal
                              </span>
                              <span className="text-xs font-bold text-gray-600">
                                {formatCurrency(goal)}
                              </span>
                            </div>
                          </div>

                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#F43676] to-[#e02a60] transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-xs font-bold pt-0.5">
                            <span className="text-[#F43676]">{pct.toFixed(0)}% funded</span>
                            {featuredCampaigns[currentSlide]?.deadline && (
                              <span className="text-gray-500 text-[11px]">
                                Ends {formatDate(featuredCampaigns[currentSlide].deadline)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* CTA Button */}
                    <div>
                      <Link
                        href={`/crowdfunding/${featuredCampaigns[currentSlide]?.slug || featuredCampaigns[currentSlide]?._id}`}
                        className="inline-flex items-center gap-2 bg-[#F43676] hover:bg-[#e02a60] text-white py-3 px-6 rounded-full font-bold text-xs shadow-md shadow-pink-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <FaIndianRupeeSign className="text-xs" />
                        <span>Support This Campaign</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Location */}
                    {featuredCampaigns[currentSlide]?.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                        <FaLocationDot className="text-[#F43676] text-xs" />
                        <span>{featuredCampaigns[currentSlide].location}</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Indicator Dots */}
                {featuredCampaigns.length > 1 && (
                  <div className="flex items-center gap-1.5 pt-3">
                    {featuredCampaigns.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentSlide ? "bg-[#F43676] w-6" : "bg-gray-200 hover:bg-gray-300 w-1.5"
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: Minimal Stats Strip ===== */}
      <section className="px-4 sm:px-8 lg:px-12 py-3">
        <div className="max-w-[1500px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#F43676]">
                <FaHandHoldingHeart className="text-base" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{campaigns.length}</p>
                <p className="text-xs text-gray-500 font-medium">Active Campaigns</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#F43676]">
                <FaArrowTrendUp className="text-base" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(totals.raised)}</p>
                <p className="text-xs text-gray-500 font-medium">Total Raised</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#F43676]">
                <FaBullseye className="text-base" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(totals.goal)}</p>
                <p className="text-xs text-gray-500 font-medium">Total Goals</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#F43676]">
                <FaUsers className="text-base" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{totals.donors.toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-medium">Total Supporters</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: Main Explorer & Sidebar ===== */}
      <section className="px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-[1500px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Feed */}
            <div className="lg:w-2/3 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200/80">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900">All Campaigns</h2>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43676]"></span>
                </div>

                <Link
                  href="/start-crowdfunding"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F43676] hover:bg-[#e02a60] text-white rounded-full font-bold text-xs shadow-md shadow-pink-100 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                >
                  <FaPlus className="text-[10px]" />
                  <span>Start Campaign</span>
                </Link>
              </div>

              {/* Category Filter Pills */}
              {categories.length > 2 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        filter === cat
                          ? "bg-[#F43676] text-white shadow-md shadow-pink-200"
                          : "bg-white text-gray-600 hover:text-slate-900 border border-gray-200 hover:border-pink-300"
                      }`}
                    >
                      {cat === "all" ? "All Campaigns" : cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Campaign Cards List */}
              <AnimatePresence mode="wait">
                {filteredCampaigns.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-xs space-y-3"
                  >
                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto text-[#F43676] text-xl">
                      <FaHandHoldingHeart />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No campaigns found</h3>
                    <p className="text-gray-500 text-xs max-w-sm mx-auto">
                      {filter !== "all"
                        ? `No campaigns found in the "${filter}" category.`
                        : "There are currently no active campaigns."}
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      {filter !== "all" && (
                        <button
                          onClick={() => setFilter("all")}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-full hover:bg-gray-200"
                        >
                          View All
                        </button>
                      )}
                      <Link
                        href="/start-crowdfunding"
                        className="px-4 py-2 bg-[#F43676] text-white text-xs font-bold rounded-full shadow-md shadow-pink-100"
                      >
                        Start Campaign
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {filteredCampaigns.map((campaign, index) => {
                      const goalAmount = Number(campaign.goalAmount) || 0;
                      const raisedAmount = Number(campaign.raisedAmount) || 0;
                      const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;
                      const daysLeft = getDaysLeft(campaign.deadline);
                      const isUrgent = daysLeft >= 0 && daysLeft <= 7;

                      return (
                        <motion.div
                          key={campaign._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04, duration: 0.3 }}
                          className="bg-white rounded-2xl border border-gray-200/80 hover:border-pink-300 transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md group"
                        >
                          <Link
                            href={`/crowdfunding/${campaign.slug || campaign._id}`}
                            className="flex flex-col sm:flex-row items-stretch"
                          >
                            {/* Media Viewport */}
                            <div className="sm:w-2/5 relative min-h-[200px] sm:min-h-0 bg-gray-100 overflow-hidden">
                              {campaign.image ? (
                                <img
                                  src={campaign.image}
                                  alt={campaign.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-pink-50">
                                  <FaHandHoldingHeart className="text-3xl text-[#F43676]/40" />
                                </div>
                              )}
                              {/* Category Chip */}
                              <div className="absolute top-3 left-3 bg-white/95 text-[#F43676] px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm border border-pink-100">
                                {campaign.category || "Crowdfunding"}
                              </div>
                              {/* Urgent */}
                              {isUrgent && (
                                <div className="absolute bottom-3 left-3 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
                                  <FaClock className="text-[8px]" />
                                  <span>{daysLeft === 0 ? "Last day" : `${daysLeft}d left`}</span>
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="sm:w-3/5 p-5 flex flex-col justify-between space-y-3">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                  {campaign.location && (
                                    <span className="flex items-center gap-1 text-gray-500">
                                      <FaLocationDot className="text-[#F43676]" />
                                      {campaign.location}
                                    </span>
                                  )}
                                  {campaign.deadline && (
                                    <>
                                      <span>•</span>
                                      <span>Ends {formatDate(campaign.deadline)}</span>
                                    </>
                                  )}
                                </div>

                                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#F43676] transition-colors leading-snug line-clamp-2">
                                  {campaign.title}
                                </h3>

                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                  {campaign.story?.substring(0, 140)}...
                                </p>
                              </div>

                              {/* Progress */}
                              <div className="space-y-1.5 pt-1">
                                <div className="flex items-baseline justify-between text-xs">
                                  <div>
                                    <span className="font-extrabold text-slate-900">
                                      {formatCurrency(raisedAmount)}
                                    </span>
                                    <span className="text-[11px] text-gray-400 ml-1">
                                      of {formatCurrency(goalAmount)}
                                    </span>
                                  </div>
                                  <span className="text-xs font-bold text-[#F43676]">
                                    {progress.toFixed(0)}%
                                  </span>
                                </div>

                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#F43676]"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Beneficiary & Action */}
                              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                <div className="truncate pr-2">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase block">
                                    Beneficiary
                                  </span>
                                  <p className="text-xs font-bold text-slate-700 truncate">
                                    {campaign.beneficiaryName || "Verified Beneficiary"}
                                  </p>
                                </div>

                                <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-pink-50 text-[#F43676] group-hover:bg-[#F43676] group-hover:text-white transition-all text-xs font-bold shrink-0 border border-pink-200">
                                  <FaIndianRupeeSign className="text-[9px]" /> Support
                                </span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Sidebar */}
            <div className="lg:w-1/3 space-y-5">
              {/* Search */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs" ref={searchRef}>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1.5">
                  <LucideSearch className="w-3.5 h-3.5 text-[#F43676]" />
                  Search Campaigns
                </h3>
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#F43676] overflow-hidden">
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                      className="w-full px-3 py-2 bg-transparent text-xs text-slate-800 placeholder:text-gray-400 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#F43676] text-white text-xs font-bold hover:bg-[#e02a60] transition-colors cursor-pointer"
                    >
                      <LucideSearch className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Suggestions */}
                  {showSuggestions && (searchResults.length > 0 || suggestionsLoading) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {suggestionsLoading ? (
                        <div className="p-3 text-center text-xs text-gray-500">Searching...</div>
                      ) : (
                        searchResults.map((campaign) => (
                          <Link
                            key={campaign._id}
                            href={`/crowdfunding/${campaign.slug || campaign._id}`}
                            onClick={() => {
                              setShowSuggestions(false);
                              setSearchQuery("");
                            }}
                            className="px-3.5 py-2.5 hover:bg-pink-50/60 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-2.5 group"
                          >
                            <div className="w-7 h-7 rounded-lg overflow-hidden bg-pink-50 shrink-0 border border-pink-100">
                              {campaign.image ? (
                                <img src={campaign.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FaHandHoldingHeart className="text-[#F43676] text-[9px]" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 group-hover:text-[#F43676] truncate">
                                {campaign.title}
                              </p>
                              <p className="text-[10px] text-[#F43676] font-semibold">
                                {formatCurrency(campaign.raisedAmount)} raised
                              </p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </form>
              </div>

              {/* Categories */}
              {categories.length > 2 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#F43676]" />
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {categories
                      .filter((c) => c !== "all")
                      .map((cat, idx) => {
                        const count = campaigns.filter((c) => c.category === cat).length;
                        return (
                          <button
                            key={idx}
                            onClick={() => setFilter(cat)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              filter === cat
                                ? "bg-pink-50 text-[#F43676] border border-pink-200"
                                : "text-gray-600 hover:text-slate-900 hover:bg-gray-50"
                            }`}
                          >
                            <span>{cat}</span>
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] text-gray-500 font-mono">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Recent Campaigns */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#F43676]" />
                  Recent Fundraisers
                </h3>
                <div className="space-y-2">
                  {recentCampaigns.map((camp) => (
                    <Link
                      key={camp._id}
                      href={`/crowdfunding/${camp.slug || camp._id}`}
                      className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-pink-50/50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-pink-50 shrink-0 border border-pink-100">
                        {camp.image ? (
                          <img src={camp.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaHandHoldingHeart className="text-[#F43676] text-xs" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#F43676] truncate">
                          {camp.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {formatCurrency(camp.raisedAmount)} raised
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trust Box */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Trust & Transparency
                </h3>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-pink-50/50 border border-pink-100/60">
                    <ShieldCheck className="w-4 h-4 text-[#F43676] shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700">100% Verified Campaigns</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-pink-50/50 border border-pink-100/60">
                    <Lock className="w-4 h-4 text-[#F43676] shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700">Secure Payment Gateway</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-pink-50/50 border border-pink-100/60">
                    <HeartHandshake className="w-4 h-4 text-[#F43676] shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700">Direct Beneficiary Transfer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: Trending Matrix Grid ===== */}
      {trendingCampaigns.length > 0 && (
        <section className="px-4 sm:px-8 lg:px-12 py-6">
          <div className="max-w-[1500px] mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Trending Campaigns</h2>
              <span className="w-2.5 h-2.5 rounded-full bg-[#F43676]"></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingCampaigns.map((camp) => {
                const goalAmount = Number(camp.goalAmount) || 0;
                const raisedAmount = Number(camp.raisedAmount) || 0;
                const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

                return (
                  <Link
                    key={camp._id}
                    href={`/crowdfunding/${camp.slug || camp._id}`}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-100 border border-gray-200 hover:border-pink-300 transition-all flex flex-col justify-end p-4 shadow-xs hover:shadow-md"
                  >
                    {/* Background */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: camp.image
                          ? `url('${camp.image}')`
                          : `linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Progress Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-[#F43676] shadow-sm">
                        {camp.category || "Verified"}
                      </span>
                      <span className="px-2 py-0.5 bg-[#F43676] text-white rounded-md text-[10px] font-black">
                        {progress.toFixed(0)}%
                      </span>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 space-y-1.5">
                      <h4 className="text-white font-bold text-sm leading-snug group-hover:text-pink-300 transition-colors line-clamp-2">
                        {camp.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-white">
                        <span className="font-extrabold">{formatCurrency(raisedAmount)}</span>
                        <span className="text-[10px] text-gray-300">of {formatCurrency(goalAmount)}</span>
                      </div>

                      <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                        <div className="h-full bg-[#F43676]" style={{ width: `${progress}%` }} />
                      </div>

                      <div className="pt-1">
                        <span className="w-full py-1.5 rounded-full bg-[#F43676] text-white font-bold text-[11px] flex items-center justify-center gap-1 group-hover:bg-[#e02a60] transition-colors">
                          <FaIndianRupeeSign className="text-[9px]" /> Support Now
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== SECTION 6: Minimal White & Pink Bottom CTA ===== */}
      <section className="px-4 sm:px-8 lg:px-12 py-8 pb-14">
        <div className="max-w-[1500px] mx-auto bg-gradient-to-br from-pink-50 via-white to-pink-50/70 rounded-3xl p-8 sm:p-12 border border-pink-200/80 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F43676] flex items-center justify-center mx-auto text-white shadow-md shadow-pink-200">
            <FaHeart className="text-xl" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Need help? Start a Crowdfunding Campaign
          </h2>

          <p className="text-gray-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Create a transparent, verified campaign and receive direct support from citizens across the community.
          </p>

          <div className="pt-2">
            <Link
              href="/start-crowdfunding"
              className="inline-flex items-center gap-2 bg-[#F43676] hover:bg-[#e02a60] text-white font-bold py-3 px-7 rounded-full shadow-md shadow-pink-200 hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Start Crowdfunding</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Ticker CSS */}
      <style jsx global>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .ticker-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: ticker-scroll 45s linear infinite;
        }
        .ticker-track:hover,
        .ticker-track.paused {
          animation-play-state: paused;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
