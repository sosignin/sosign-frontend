"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendar,
  FaChevronRight,
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
} from "react-icons/fa6";
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

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await axios.get(`${backendUrl}/api/crowdfunding`);
        setCampaigns(response.data);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const totals = campaigns.reduce(
    (summary, campaign) => ({
      raised: summary.raised + (Number(campaign.raisedAmount) || 0),
      goal: summary.goal + (Number(campaign.goalAmount) || 0),
      donors: summary.donors + (Number(campaign.donorsCount) || 0),
    }),
    { raised: 0, goal: 0, donors: 0 }
  );

  // Get unique categories
  const categories = ["all", ...new Set(campaigns.map(c => c.category).filter(Boolean))];

  const filteredCampaigns = filter === "all"
    ? campaigns
    : campaigns.filter(c => c.category === filter);

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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#2D3A8C] to-[#1a1a2e] overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F43676]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#2D3A8C]/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/[0.03] to-transparent rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F43676]/20 text-[#F43676] text-xs font-bold tracking-wide uppercase">
                  <FaHeart className="text-[10px]" />
                  People helping people
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                Crowdfunding <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#F43676] to-[#ff6b9d] bg-clip-text text-transparent">Campaigns</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                Support verified campaigns from real people. Every contribution makes a difference in someone&apos;s life.
              </p>
              <nav className="flex items-center gap-2 text-sm text-gray-400 mt-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <FaChevronRight className="text-xs" />
                <span className="text-white font-medium">Crowdfunding</span>
              </nav>
            </div>
            <Link href="/start-crowdfunding">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-pink-500/25 flex items-center gap-3 text-base"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FaPlus className="text-sm" />
                </div>
                Start Crowdfunding
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
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

      {/* Main Content */}
      <main className="min-h-screen bg-[#f0f2f5] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Filters */}
          {categories.length > 2 && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
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

          {/* Campaign Grid */}
          <AnimatePresence mode="wait">
            {filteredCampaigns.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
                  <FaHandHoldingHeart className="text-4xl text-[#F43676]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3">No Active Campaigns</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                  {filter !== "all"
                    ? `No campaigns found in the "${filter}" category. Try browsing all campaigns.`
                    : "Be the first to create a crowdfunding campaign and make a difference in someone's life."}
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
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white rounded-xl font-semibold shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all"
                  >
                    <FaPlus className="text-sm" />
                    Start a Campaign
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
              >
                {filteredCampaigns.map((campaign, index) => {
                  const goalAmount = Number(campaign.goalAmount) || 0;
                  const raisedAmount = Number(campaign.raisedAmount) || 0;
                  const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;
                  const daysLeft = getDaysLeft(campaign.deadline);
                  const isUrgent = daysLeft >= 0 && daysLeft <= 7;

                  return (
                    <motion.article
                      key={campaign._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.4 }}
                      className="group overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Image Section */}
                      <div className="relative h-52 overflow-hidden">
                        {campaign.image ? (
                          <img
                            src={campaign.image}
                            alt={campaign.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-50 to-blue-50">
                            <FaHandHoldingHeart className="text-5xl text-[#F43676]/40" />
                          </div>
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        {/* Category badge */}
                        <span className="absolute left-4 top-4 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-[#1a1a2e] shadow-sm">
                          {campaign.category}
                        </span>
                        {/* Urgency badge */}
                        {daysLeft >= 0 && (
                          <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-sm flex items-center gap-1 ${
                            isUrgent
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-white/95 backdrop-blur-sm text-gray-700"
                          }`}>
                            <FaClock className="text-[10px]" />
                            {daysLeft === 0 ? "Last day!" : `${daysLeft}d left`}
                          </span>
                        )}
                        {/* Donors count chip */}
                        {(campaign.donorsCount || 0) > 0 && (
                          <div className="absolute left-4 bottom-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                            <FaUsers className="text-white text-[10px]" />
                            <span className="text-white text-xs font-semibold">{campaign.donorsCount} supporters</span>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-[#1a1a2e] line-clamp-2 mb-3 leading-snug group-hover:text-[#2D3A8C] transition-colors">
                          {campaign.title}
                        </h3>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <FaLocationDot className="text-[#F43676]" />
                            {campaign.location || "India"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FaCalendar className="text-[#F43676]" />
                            Ends {formatDate(campaign.deadline)}
                          </span>
                        </div>

                        {/* Progress Section */}
                        <div className="mb-4 mt-auto">
                          <div className="flex items-baseline justify-between mb-2">
                            <span className="text-base font-extrabold text-[#1a1a2e]">
                              {formatCurrency(raisedAmount)}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              of {formatCurrency(goalAmount)}
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, delay: index * 0.06 + 0.3, ease: "easeOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-[#F43676] to-[#2D3A8C] relative"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </motion.div>
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs font-bold text-[#F43676]">{progress.toFixed(0)}% funded</span>
                          </div>
                        </div>

                        {/* Beneficiary + Verified */}
                        <div className="rounded-xl bg-gradient-to-r from-gray-50 to-gray-50/50 p-3.5 mb-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Beneficiary</p>
                              <p className="text-sm font-bold text-[#1a1a2e] truncate">{campaign.beneficiaryName}</p>
                            </div>
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <FaShieldHalved className="text-[10px]" />
                              <span className="text-[10px] font-bold">Verified</span>
                            </div>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Link
                          href={`/crowdfunding/${campaign.slug}`}
                          className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#2D3A8C] px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200 group/btn"
                        >
                          <FaIndianRupeeSign className="text-xs" />
                          Support This Campaign
                          <FaArrowRight className="text-xs opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom CTA Section */}
          {campaigns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 text-center"
            >
              <div className="bg-gradient-to-r from-[#1a1a2e] via-[#2D3A8C] to-[#1a1a2e] rounded-3xl p-10 md:p-14 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#F43676]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#2D3A8C]/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#F43676] to-[#e02a60] flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <FaHeart className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                    Need help? Start your campaign
                  </h3>
                  <p className="text-gray-300 max-w-lg mx-auto mb-8 leading-relaxed">
                    Create a transparent, verified crowdfunding campaign and let the community support your cause.
                  </p>
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
            </motion.div>
          )}
        </div>
      </main>

      {/* Custom shimmer animation */}
      <style jsx global>{`
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
