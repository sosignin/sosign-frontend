"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendar,
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
  FaArrowRight,
  FaCircleCheck,
  FaShieldHalved,
  FaMagnifyingGlass,
  FaFire,
  FaChartLine,
  FaHandHoldingDollar,
  FaPlay,
  FaPause,
} from "react-icons/fa6";
import { FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaSearch } from "react-icons/fa";
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
    title: c.title?.length > 50 ? c.title.substring(0, 50) + "..." : c.title,
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-pink-100 border-t-[#F43676] animate-spin" />
          <FaHandHoldingHeart className="absolute inset-0 m-auto text-[#F43676] text-lg" />
        </div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <>
      {/* ===== SECTION 1: Top Ticker Bar ===== */}
      <section className="bg-[#f0f2f5] px-4 sm:px-8 lg:px-12 pt-6">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex items-stretch">
          {/* Ticker Label */}
          <div className="flex items-center gap-2 bg-[#F43676] text-white px-5 shrink-0">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="font-bold text-sm">Trending</span>
          </div>

          {/* Scrolling Ticker */}
          <div className="flex-1 overflow-hidden relative py-1 px-4">

            <div className={`ticker-track ${isTickerPaused ? "paused" : ""}`}>
              {/* First set */}
              {[...topStories, ...topStories, ...topStories, ...topStories].map((story, index) => (
                <Link
                  key={`first-${story.id}-${index}`}
                  href={`/crowdfunding/${story.slug || story.id}`}
                  className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gradient-to-br from-pink-100 to-blue-100 shrink-0">
                    {story.image ? (
                      <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaHandHoldingHeart className="text-[#F43676] text-sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#002050] font-bold text-sm whitespace-nowrap">
                      {story.title}
                    </span>
                    <span className="text-[#302d55] font-semibold text-xs flex items-center gap-1">
                      <span className="text-[#F43676]">•</span> {story.amount} raised
                    </span>
                  </div>
                </Link>
              ))}
              {/* Duplicate for seamless loop */}
              {[...topStories, ...topStories, ...topStories, ...topStories].map((story, index) => (
                <Link
                  key={`second-${story.id}-${index}`}
                  href={`/crowdfunding/${story.slug || story.id}`}
                  className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gradient-to-br from-pink-100 to-blue-100 shrink-0">
                    {story.image ? (
                      <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaHandHoldingHeart className="text-[#F43676] text-sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#002050] font-bold text-sm whitespace-nowrap">
                      {story.title}
                    </span>
                    <span className="text-[#302d55] font-semibold text-xs flex items-center gap-1">
                      <span className="text-[#F43676]">•</span> {story.amount} raised
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Pause/Play Button */}
          <button
            onClick={() => setIsTickerPaused(!isTickerPaused)}
            className="w-10 bg-[#2D3A8C] text-white flex items-center justify-center hover:bg-[#1e2a6c] transition-colors shrink-0"
          >
            {isTickerPaused ? <FaPlay className="text-xs" /> : <FaPause className="text-xs" />}
          </button>
        </div>

        {/* ===== SECTION 2: Hero Slider ===== */}
        <div className="py-6">
          <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden p-4 sm:p-6 lg:p-7">
            <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-7">
              {/* Left Side - Image */}
              <div className="lg:w-[55%] relative h-[260px] sm:h-[320px] lg:h-auto min-h-[320px] lg:min-h-[370px] overflow-hidden rounded-2xl group shadow-lg bg-gray-100 flex-shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {featuredCampaigns[currentSlide]?.image ? (
                      <img
                        src={featuredCampaigns[currentSlide].image}
                        alt={featuredCampaigns[currentSlide]?.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 via-pink-50 to-blue-50 flex items-center justify-center">
                        <FaHandHoldingHeart className="text-7xl text-[#F43676]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  </motion.div>
                </AnimatePresence>

                {/* Progress Badge on Image */}
                {featuredCampaigns[currentSlide] && (() => {
                  const goal = Number(featuredCampaigns[currentSlide].goalAmount) || 0;
                  const raised = Number(featuredCampaigns[currentSlide].raisedAmount) || 0;
                  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                  return pct >= 50 ? (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg z-20 flex items-center gap-1.5">
                      <FaArrowTrendUp className="text-[10px]" />
                      <span>{pct.toFixed(0)}% Funded</span>
                    </div>
                  ) : null;
                })()}

                {/* Donors badge */}
                {(featuredCampaigns[currentSlide]?.donorsCount || 0) > 0 && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 z-20">
                    <FaUsers className="text-white text-[10px]" />
                    <span className="text-white text-xs font-semibold">
                      {featuredCampaigns[currentSlide].donorsCount} supporters
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {featuredCampaigns.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-all z-10 border border-gray-100"
                    >
                      <FaChevronLeft className="text-gray-600 text-xs sm:text-sm" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-all z-10 border border-gray-100"
                    >
                      <FaChevronRight className="text-gray-600 text-xs sm:text-sm" />
                    </button>
                  </>
                )}
              </div>

              {/* Right Side - Content */}
              <div className="lg:w-1/2 p-4 sm:p-5 lg:p-6 flex flex-col justify-center min-h-[190px] lg:min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {/* Category + Urgency Tags */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 items-center">
                      {featuredCampaigns[currentSlide]?.category && (
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[#F43676]/10 text-[#F43676] rounded-full text-xs sm:text-sm font-medium">
                          {featuredCampaigns[currentSlide].category}
                        </span>
                      )}
                      {featuredCampaigns[currentSlide] && getDaysLeft(featuredCampaigns[currentSlide].deadline) >= 0 && getDaysLeft(featuredCampaigns[currentSlide].deadline) <= 7 && (
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-red-500 text-white rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 animate-pulse">
                          <FaClock className="text-[10px]" />
                          {getDaysLeft(featuredCampaigns[currentSlide].deadline) === 0
                            ? "Last day!"
                            : `${getDaysLeft(featuredCampaigns[currentSlide].deadline)} days left`}
                        </span>
                      )}
                      <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1">
                        <FaShieldHalved className="text-[10px]" />
                        Verified
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-2xl font-bold text-[#002050] mb-3 sm:mb-4 leading-tight line-clamp-2">
                      <Link
                        href={`/crowdfunding/${featuredCampaigns[currentSlide]?.slug || featuredCampaigns[currentSlide]?._id}`}
                        className="hover:text-[#F43676] transition-colors"
                      >
                        {featuredCampaigns[currentSlide]?.title || "Start a Campaign"}
                      </Link>
                    </h1>

                    {/* Description */}
                    <p className="text-[#302d55] text-sm sm:text-base mb-4 sm:mb-5 leading-relaxed line-clamp-3">
                      {featuredCampaigns[currentSlide]?.story?.substring(0, 200) ||
                        "Support verified campaigns from real people. Every contribution makes a difference."}
                      {featuredCampaigns[currentSlide]?.story?.length > 200 ? "..." : ""}
                    </p>

                    {/* Progress Bar */}
                    {featuredCampaigns[currentSlide] && (() => {
                      const goal = Number(featuredCampaigns[currentSlide].goalAmount) || 0;
                      const raised = Number(featuredCampaigns[currentSlide].raisedAmount) || 0;
                      const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                      return (
                        <div className="mb-5">
                          <div className="flex items-baseline justify-between mb-2">
                            <span className="text-base font-extrabold text-[#1a1a2e]">
                              {formatCurrency(raised)}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              of {formatCurrency(goal)}
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#F43676] to-[#2D3A8C]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1.5">
                            <span className="text-xs font-bold text-[#F43676]">{pct.toFixed(0)}% funded</span>
                            {featuredCampaigns[currentSlide]?.deadline && (
                              <span className="text-xs text-gray-500">
                                Ends {formatDate(featuredCampaigns[currentSlide].deadline)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Donate CTA Button */}
                    <div className="mb-4 sm:mb-5">
                      <Link
                        href={`/crowdfunding/${featuredCampaigns[currentSlide]?.slug || featuredCampaigns[currentSlide]?._id}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                      >
                        <FaIndianRupeeSign className="text-xs" />
                        Support This Campaign
                      </Link>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[#302d55] text-xs sm:text-sm">
                      {featuredCampaigns[currentSlide]?.location && (
                        <span className="flex items-center gap-2">
                          <FaLocationDot className="text-[#F43676]" />
                          {featuredCampaigns[currentSlide].location}
                        </span>
                      )}
                      <span className="text-[#F43676] hidden sm:inline">•</span>
                      <span className="flex items-center gap-2">
                        <FaUsers className="text-[#302d55]" />
                        {featuredCampaigns[currentSlide]?.donorsCount || 0} supporters
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Slide Indicators */}
            {featuredCampaigns.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 lg:mt-5">
                {featuredCampaigns.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-[#F43676] w-6"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: Stats Strip ===== */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-5 border border-pink-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F43676] to-[#e02a60] flex items-center justify-center shadow-lg shadow-pink-200">
                  <FaHandHoldingHeart className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#1a1a2e]">{campaigns.length}</p>
                  <p className="text-xs text-gray-500 font-medium">Active Campaigns</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-5 border border-green-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
                  <FaArrowTrendUp className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#1a1a2e]">{formatCurrency(totals.raised)}</p>
                  <p className="text-xs text-gray-500 font-medium">Total Raised</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 border border-blue-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2D3A8C] to-[#4f5fc5] flex items-center justify-center shadow-lg shadow-blue-200">
                  <FaBullseye className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#1a1a2e]">{formatCurrency(totals.goal)}</p>
                  <p className="text-xs text-gray-500 font-medium">Total Goals</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-5 border border-amber-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                  <FaUsers className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#1a1a2e]">{totals.donors.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 font-medium">Total Supporters</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 4: Main Content (2-Column Layout like petitions homepage) ===== */}
      <section className="bg-[#f0f2f5] py-12 px-8 sm:px-10 lg:px-17">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:w-2/3">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">All Campaigns</h2>
                  <span className="w-3 h-3 bg-[#F43676] rounded-full"></span>
                </div>
                <Link
                  href="/start-crowdfunding"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white rounded-full font-medium hover:bg-[#e02a60] transition-all shadow-md hover:shadow-lg group"
                >
                  <FaPlus className="text-xs" />
                  <span>Start Campaign</span>
                </Link>
              </div>

              {/* Category Filter Pills */}
              {categories.length > 2 && (
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                        filter === cat
                          ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-lg shadow-pink-200"
                          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-3xl p-10 text-center shadow-sm"
                  >
                    <FaHandHoldingHeart className="text-5xl text-pink-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#002050] mb-2">No campaigns found</h3>
                    <p className="text-[#302d55] mb-5">
                      {filter !== "all"
                        ? `No campaigns found in the "${filter}" category. Try browsing all campaigns.`
                        : "There are no active crowdfunding campaigns at the moment."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {filter !== "all" && (
                        <button
                          onClick={() => setFilter("all")}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                          View All Campaigns
                        </button>
                      )}
                      <Link
                        href="/start-crowdfunding"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg transition-all duration-200"
                      >
                        <FaHandHoldingHeart className="text-sm" />
                        Start Crowdfunding
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {filteredCampaigns.map((campaign, index) => {
                      const goalAmount = Number(campaign.goalAmount) || 0;
                      const raisedAmount = Number(campaign.raisedAmount) || 0;
                      const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;
                      const daysLeft = getDaysLeft(campaign.deadline);
                      const isUrgent = daysLeft >= 0 && daysLeft <= 7;

                      return (
                        <motion.div
                          key={campaign._id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06, duration: 0.4 }}
                          className={`relative bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow ${
                            index === 0 ? "ring-2 ring-[#F43676]" : ""
                          }`}
                        >
                          <Link
                            href={`/crowdfunding/${campaign.slug || campaign._id}`}
                            className="flex flex-col sm:flex-row items-center"
                          >
                            {/* Image */}
                            <div className="sm:w-2/5 relative sm:-ml-6 my-6 sm:my-8">
                              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-pink-100 to-blue-100">
                                {campaign.image ? (
                                  <img
                                    src={campaign.image}
                                    alt={campaign.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FaHandHoldingHeart className="text-5xl text-[#F43676]" />
                                  </div>
                                )}
                              </div>
                              {/* Category badge */}
                              <div className="absolute top-4 left-4 bg-white text-[#302d55] px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                                {campaign.category || "Crowdfunding"}
                              </div>
                              {/* Featured badge for first item */}
                              {index === 0 && (
                                <div className="absolute top-4 right-4 w-10 h-10 bg-[#F43676] rounded-full flex items-center justify-center shadow-md">
                                  <svg
                                    className="w-5 h-5 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </div>
                              )}
                              {/* Urgency badge */}
                              {isUrgent && (
                                <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 animate-pulse">
                                  <FaClock className="text-[10px]" />
                                  <span>{daysLeft === 0 ? "Last day!" : `${daysLeft}d left`}</span>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="sm:w-3/5 p-8">
                              {/* Meta info */}
                              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                                <span className="inline-flex items-center gap-1.5">
                                  <FaMapMarkerAlt className="text-[#F43676] text-xs" />
                                  {campaign.location || "India"}
                                </span>
                                {campaign.deadline && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <FaCalendarAlt className="text-[#F43676] text-xs" />
                                    Ends {formatDate(campaign.deadline)}
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="text-2xl font-bold text-[#002050] mb-4 leading-tight hover:text-[#F43676] transition-colors">
                                {campaign.title}
                              </h3>

                              {/* Story excerpt */}
                              <p className="text-[#302d55] text-base mb-5 leading-relaxed line-clamp-3">
                                {campaign.story?.substring(0, 200)}
                                {campaign.story?.length > 200 ? "..." : ""}
                              </p>

                              {/* Progress bar */}
                              <div className="mb-5">
                                <div className="flex items-center justify-between gap-4 text-sm mb-2">
                                  <span className="font-bold text-[#002050]">{formatCurrency(raisedAmount)}</span>
                                  <span className="text-gray-500">of {formatCurrency(goalAmount)}</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, delay: index * 0.06 + 0.3, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-[#F43676] to-[#2D3A8C] relative"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                  </motion.div>
                                </div>
                                <div className="flex justify-between mt-1.5">
                                  <span className="text-xs font-bold text-[#F43676]">{progress.toFixed(0)}% funded</span>
                                  {(campaign.donorsCount || 0) > 0 && (
                                    <span className="text-xs text-gray-500">{campaign.donorsCount} supporters</span>
                                  )}
                                </div>
                              </div>

                              {/* Beneficiary + CTA */}
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-500">Beneficiary</p>
                                  <p className="text-sm font-semibold text-[#302d55] truncate">
                                    {campaign.beneficiaryName || "Community fundraiser"}
                                  </p>
                                </div>
                                <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200">
                                  <FaRupeeSign className="text-xs" />
                                  Support Campaign
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ===== Sidebar - Right Side ===== */}
            <div className="lg:w-1/3 space-y-6">
              {/* Search Box */}
              <div className="bg-white rounded-3xl p-6 shadow-sm" ref={searchRef}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Search Campaigns</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-l-lg outline-none focus:border-[#F43676] transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-[#F43676] text-white rounded-r-lg hover:bg-[#e02a60] transition-colors"
                    >
                      Search
                    </button>
                  </div>

                  {/* Search Suggestions */}
                  {showSuggestions && (searchResults.length > 0 || suggestionsLoading) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {suggestionsLoading ? (
                        <div className="px-4 py-3 text-center text-gray-500">
                          <FaSpinner className="animate-spin inline mr-2" />
                          Searching...
                        </div>
                      ) : (
                        searchResults.map((campaign) => {
                          const raised = Number(campaign.raisedAmount) || 0;
                          return (
                            <Link
                              key={campaign._id}
                              href={`/crowdfunding/${campaign.slug || campaign._id}`}
                              onClick={() => {
                                setShowSuggestions(false);
                                setSearchQuery("");
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-pink-50 border-b border-gray-100 last:border-b-0 transition-colors group flex items-center gap-3"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-blue-100 flex-shrink-0">
                                {campaign.image ? (
                                  <img src={campaign.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FaHandHoldingHeart className="text-[#F43676] text-xs" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#1a1a2e] group-hover:text-[#F43676] transition-colors line-clamp-1">
                                  {campaign.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatCurrency(raised)} raised
                                </p>
                              </div>
                              <FaChevronRight className="text-gray-400 group-hover:text-[#F43676] flex-shrink-0" />
                            </Link>
                          );
                        })
                      )}
                    </div>
                  )}
                </form>
              </div>

              {/* Categories */}
              {categories.length > 2 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold text-[#002050]">Categories</h3>
                    <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                  </div>
                  <ul className="space-y-3">
                    {categories
                      .filter((c) => c !== "all")
                      .map((cat, index) => {
                        const count = campaigns.filter((c) => c.category === cat).length;
                        return (
                          <li key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                            <button
                              onClick={() => setFilter(cat)}
                              className={`w-full flex items-center justify-between text-sm transition-colors ${
                                filter === cat
                                  ? "text-[#F43676] font-bold"
                                  : "text-[#302d55] hover:text-[#F43676]"
                              }`}
                            >
                              <span>{cat}</span>
                              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium">
                                {count}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}

              {/* Recent Campaigns */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Recent Campaigns</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <ul className="space-y-3">
                  {recentCampaigns.length > 0 ? (
                    recentCampaigns.map((campaign) => (
                      <li key={campaign._id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <Link
                          href={`/crowdfunding/${campaign.slug || campaign._id}`}
                          className="flex items-center gap-3 hover:bg-pink-50 p-2 rounded-lg transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-blue-100 flex-shrink-0">
                            {campaign.image ? (
                              <img src={campaign.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaHandHoldingHeart className="text-[#F43676] text-sm" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1a1a2e] group-hover:text-[#F43676] transition-colors line-clamp-1">
                              {campaign.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatCurrency(campaign.raisedAmount)} raised
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-[#302d55] text-sm">No recent campaigns</li>
                  )}
                </ul>
              </div>

              {/* How It Works */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">How It Works</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      title: "Create a Campaign",
                      desc: "Share your story and set a funding goal",
                      icon: <FaPlus className="text-xs" />,
                      color: "from-[#F43676] to-[#e02a60]",
                    },
                    {
                      step: "2",
                      title: "Get Verified",
                      desc: "Our team verifies your campaign details",
                      icon: <FaShieldHalved className="text-xs" />,
                      color: "from-[#2D3A8C] to-[#4f5fc5]",
                    },
                    {
                      step: "3",
                      title: "Receive Support",
                      desc: "People discover and donate to your cause",
                      icon: <FaHeart className="text-xs" />,
                      color: "from-green-500 to-emerald-600",
                    },
                    {
                      step: "4",
                      title: "Make an Impact",
                      desc: "Funds reach the beneficiary securely",
                      icon: <FaCircleCheck className="text-xs" />,
                      color: "from-amber-500 to-orange-500",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md flex-shrink-0`}
                      >
                        <span className="text-white font-bold text-xs">{item.step}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1a2e]">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/start-crowdfunding"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white rounded-full font-semibold text-sm hover:shadow-lg transition-all duration-200"
                >
                  <FaPlus className="text-xs" />
                  Start Your Campaign
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Trust & Safety</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: <FaShieldHalved />, text: "All campaigns verified", color: "text-green-600 bg-green-50" },
                    { icon: <FaCircleCheck />, text: "Secure payment gateway", color: "text-blue-600 bg-blue-50" },
                    { icon: <FaHandHoldingHeart />, text: "Direct beneficiary transfer", color: "text-pink-600 bg-pink-50" },
                    { icon: <FaChartLine />, text: "100% transparency", color: "text-purple-600 bg-purple-50" },
                  ].map((badge, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${badge.color} flex items-center justify-center flex-shrink-0`}>
                        {badge.icon}
                      </div>
                      <span className="text-sm font-medium text-[#302d55]">{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: Trending Campaigns (like "You May Have Missed") ===== */}
      {trendingCampaigns.length > 0 && (
        <section className="bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
                  Trending Campaigns
                </h2>
                <span className="w-3 h-3 bg-[#F43676] rounded-full"></span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trendingCampaigns.map((campaign) => {
                const goalAmount = Number(campaign.goalAmount) || 0;
                const raisedAmount = Number(campaign.raisedAmount) || 0;
                const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

                return (
                  <Link
                    key={campaign._id}
                    href={`/crowdfunding/${campaign.slug || campaign._id}`}
                    className="group relative rounded-2xl overflow-hidden aspect-square"
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundImage: campaign.image
                          ? `url('${campaign.image}')`
                          : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      {/* Progress Badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <FaArrowTrendUp className="text-[10px]" />
                        {progress.toFixed(0)}%
                      </div>

                      {/* Category Tag */}
                      {campaign.category && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-[#fce4ec] text-[#F43676] rounded-full text-xs font-medium">
                            {campaign.category}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-white font-bold text-base leading-tight mb-3 group-hover:text-[#F43676] transition-colors line-clamp-2">
                        {campaign.title}
                      </h3>

                      {/* Amount Info */}
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <span className="text-white font-bold text-xs">
                          {formatCurrency(raisedAmount)}
                        </span>
                        <span className="text-gray-400 text-xs">of {formatCurrency(goalAmount)}</span>
                      </div>

                      {/* Support CTA */}
                      <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-4 py-1.5 rounded-full font-semibold text-xs hover:shadow-lg transition-all duration-200">
                        <FaIndianRupeeSign className="text-[10px]" />
                        Support Now
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== SECTION 6: Bottom CTA ===== */}
      {campaigns.length > 0 && (
        <section className="bg-[#f0f2f5] pb-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <div className="bg-gradient-to-r from-[#1a1a2e] via-[#2D3A8C] to-[#1a1a2e] rounded-3xl p-10 md:p-14 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#F43676]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#2D3A8C]/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#F43676] to-[#e02a60] flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <FaHeart className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">
                  Need help? Start your campaign
                </h3>
                <p className="text-gray-300 max-w-lg mx-auto mb-8 leading-relaxed text-center">
                  Create a transparent, verified crowdfunding campaign and let the community support your cause.
                </p>
                <div className="flex justify-center">
                  <Link href="/start-crowdfunding">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-pink-500/25 inline-flex items-center gap-3"
                    >
                      <FaPlus />
                      Start Crowdfunding
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Custom shimmer animation */}
      <style jsx global>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          gap: 2rem;
          width: max-content;
          animation: ticker-scroll 60s linear infinite;
        }
        .ticker-track:hover,
        .ticker-track.paused {
          animation-play-state: paused;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
