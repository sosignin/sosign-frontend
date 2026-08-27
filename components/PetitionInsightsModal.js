"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  Users,
  UserCheck,
  TrendingUp,
  BarChart3,
  CheckCircle,
  X,
  RefreshCw,
  Sparkles,
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
  Globe,
  Award,
} from "lucide-react";

export default function PetitionInsightsModal({
  petitionId,
  petitionTitle,
  isOpen,
  onClose,
  user,
}) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchInsights = async () => {
    if (!petitionId) return;
    setLoading(true);
    setError("");

    try {
      let authToken = user?.token;
      if (!authToken && typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            authToken = JSON.parse(storedUser)?.token;
          }
        } catch (err) {}
        if (!authToken) {
          authToken = localStorage.getItem("token");
        }
      }

      const res = await fetch(`${backendUrl}/api/petitions/${petitionId}/insights`, {
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load petition insights.");
      }

      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error("Error loading insights:", err);
      setError(err.message || "Unable to fetch insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInsights();
    }
  }, [isOpen, petitionId]);

  if (!isOpen) return null;

  const followerPercent = insights?.followerPercent ?? 0;
  const nonFollowerPercent = insights?.nonFollowerPercent ?? 0;
  const followerViews = insights?.followerViews ?? 0;
  const nonFollowerViews = insights?.nonFollowerViews ?? 0;
  const totalViews = insights?.totalViews ?? 0;
  const conversionRate = insights?.conversionRate ?? 0;
  const signaturesCount = insights?.signaturesCount ?? 0;
  const totalFollowers = insights?.totalFollowers ?? 0;
  const authenticatedViews = insights?.authenticatedViews ?? 0;
  const guestViews = insights?.guestViews ?? 0;
  const last7Days = insights?.last7DaysTrend ?? [];

  // Find max daily view for relative bar height
  const maxDailyView = Math.max(...last7Days.map((d) => d.total || 0), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black leading-tight">Petition View Insights</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                  Creator Analytics
                </span>
              </div>
              <p className="text-xs text-blue-100 truncate max-w-[320px] sm:max-w-md">
                {petitionTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchInsights}
              disabled={loading}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Insights"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-500">
                Crunching audience insights & view analytics...
              </p>
            </div>
          ) : error ? (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
              <p className="text-xs font-bold text-rose-700">{error}</p>
              <button
                onClick={fetchInsights}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* 4 Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Views */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Views</span>
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">
                    {totalViews.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">All recorded views</p>
                </div>

                {/* Follower Views */}
                <div className="p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-indigo-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Followers</span>
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-indigo-900">
                    {followerPercent}%
                  </p>
                  <p className="text-[10px] text-indigo-600 font-bold">
                    {followerViews.toLocaleString()} views
                  </p>
                </div>

                {/* Non-Follower Views */}
                <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[#F43676]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Non-Followers</span>
                    <Users className="w-4 h-4 text-[#F43676]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-rose-900">
                    {nonFollowerPercent}%
                  </p>
                  <p className="text-[10px] text-rose-600 font-bold">
                    {nonFollowerViews.toLocaleString()} views
                  </p>
                </div>

                {/* Conversion Rate */}
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Conversion</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-900">
                    {conversionRate}%
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold">
                    {signaturesCount.toLocaleString()} signs
                  </p>
                </div>
              </div>

              {/* Followers vs Non-Followers Visual Breakdown */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Audience Distribution: Followers vs. Non-Followers
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Understanding where your campaign traffic and petition reach comes from
                    </p>
                  </div>
                </div>

                {/* Multi-segment Progress Bar */}
                <div className="space-y-2">
                  <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      style={{ width: `${Math.max(followerPercent, 0)}%` }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-700 flex items-center justify-center text-[10px] font-black text-white"
                      title={`Followers: ${followerPercent}% (${followerViews} views)`}
                    >
                      {followerPercent > 12 ? `${followerPercent}%` : ""}
                    </div>
                    <div
                      style={{ width: `${Math.max(nonFollowerPercent, 0)}%` }}
                      className="bg-gradient-to-r from-pink-500 to-[#F43676] h-full transition-all duration-700 flex items-center justify-center text-[10px] font-black text-white"
                      title={`Non-Followers: ${nonFollowerPercent}% (${nonFollowerViews} views)`}
                    >
                      {nonFollowerPercent > 12 ? `${nonFollowerPercent}%` : ""}
                    </div>
                  </div>

                  {/* Legend below bar */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                      <span className="font-bold text-slate-800">
                        Followers ({followerPercent}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#F43676]"></span>
                      <span className="font-bold text-slate-800">
                        Non-Followers ({nonFollowerPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Cards for Followers & Non-Followers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Followers Card */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 rounded-2xl border border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-indigo-950 text-xs">Followers Audience</p>
                          <p className="text-[10px] text-indigo-600 font-bold">Existing Community</p>
                        </div>
                      </div>
                      <span className="text-base font-black text-indigo-900">{followerPercent}%</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>{followerViews.toLocaleString()}</strong> views came from users who follow your profile on SoSign. You have <strong>{totalFollowers}</strong> total followers.
                    </p>
                  </div>

                  {/* Non-Followers Card */}
                  <div className="p-4 bg-gradient-to-br from-pink-50/70 to-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#F43676] text-white rounded-xl">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-rose-950 text-xs">Non-Followers Reach</p>
                          <p className="text-[10px] text-rose-600 font-bold">Discovery & Virality</p>
                        </div>
                      </div>
                      <span className="text-base font-black text-rose-900">{nonFollowerPercent}%</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>{nonFollowerViews.toLocaleString()}</strong> views came from external discovery, WhatsApp/social shares, and new users across the web.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7-Day Trend Chart */}
              {last7Days.length > 0 && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Last 7 Days View Trend (Followers vs. Non-Followers)
                    </h4>
                    <span className="text-[10px] text-gray-500 font-medium">Daily views breakdown</span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 pt-4 items-end h-32 border-b border-slate-200 pb-2">
                    {last7Days.map((item, idx) => {
                      const followerHeight = (item.followers / maxDailyView) * 100;
                      const nonFollowerHeight = (item.nonFollowers / maxDailyView) * 100;
                      const dayLabel = new Date(item.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                      });

                      return (
                        <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                          {/* Tooltip on hover */}
                          <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                            <div>Total: {item.total}</div>
                            <div className="text-blue-300">Followers: {item.followers}</div>
                            <div className="text-pink-300">Non-Followers: {item.nonFollowers}</div>
                          </div>

                          {/* Stacked bar */}
                          <div className="w-full max-w-[28px] bg-slate-200 rounded-t-lg overflow-hidden flex flex-col-reverse h-full max-h-24">
                            <div
                              style={{ height: `${followerHeight}%` }}
                              className="bg-indigo-600 w-full transition-all duration-500"
                              title={`Followers: ${item.followers}`}
                            ></div>
                            <div
                              style={{ height: `${nonFollowerHeight}%` }}
                              className="bg-[#F43676] w-full transition-all duration-500"
                              title={`Non-Followers: ${item.nonFollowers}`}
                            ></div>
                          </div>

                          <span className="text-[10px] font-bold text-slate-600 mt-1.5">{dayLabel}</span>
                          <span className="text-[9px] text-gray-400 font-mono">{item.total}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Additional Audience Quality Insights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-bold text-slate-800">Registered Members</p>
                      <p className="text-[10px] text-gray-500">Logged-in SoSign users</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-blue-900 text-sm">
                    {authenticatedViews.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 bg-pink-50/60 rounded-xl border border-pink-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#F43676]" />
                    <div>
                      <p className="font-bold text-slate-800">Public & Guest Visitors</p>
                      <p className="text-[10px] text-gray-500">Anonymous / shared web views</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-pink-900 text-sm">
                    {guestViews.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Creator Tip */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="font-extrabold text-amber-950 text-xs">
                    How to expand Non-Follower reach:
                  </h5>
                  <p className="text-[11px] text-amber-900/80 leading-relaxed">
                    Share your petition link on WhatsApp groups, X (Twitter), and local community boards. Posting frequent <strong>Campaign Updates</strong> also triggers notifications to all your supporters.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-gray-400 font-medium">
            Live analytics updated automatically on every unique visit.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
