"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { 
  FaCalendarAlt, 
  FaChevronLeft, 
  FaChevronRight, 
  FaSpinner, 
  FaSearch, 
  FaFire, 
  FaTrophy 
} from "react-icons/fa";
import { PenTool, BadgeCheck } from "lucide-react";

const categoryLabels = {
  animals: "Animals",
  game: "Game",
  interior: "Interior",
  lifestyle: "Lifestyle",
  sports: "Sports",
  technology: "Technology",
  travel: "Travel",
  environment: "Environment",
  education: "Education",
  health: "Health",
  politics: "Politics",
  human_rights: "Human Rights",
};

export default function TrendingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fetch trending petitions from API (sorted by signatures)
  const {
    data: petitionsData,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ["trendingPetitions", currentPage, searchQuery],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/petitions?sort=signatures&page=${currentPage}&limit=${ITEMS_PER_PAGE}${
          searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
        }`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trending petitions");
      }

      return await response.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds cache
  });

  const petitions = petitionsData?.petitions || [];
  const paginationInfo = {
    totalPages: petitionsData?.totalPages || 1,
    totalPetitions: petitionsData?.totalPetitions || 0,
    hasNextPage: petitionsData?.hasNextPage || false,
    hasPrevPage: petitionsData?.hasPrevPage || false,
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const total = paginationInfo.totalPages;
    const current = currentPage;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, "...", total);
      } else if (current >= total - 2) {
        pages.push(1, "...", total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }

    return pages;
  };

  const getCategoryLabel = (cat) => {
    return categoryLabels[cat.toLowerCase().replace(/[-\s_]+/g, "_")] || cat;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#F43676] via-[#FF5722] to-[#FF9800] rounded-3xl p-8 md:p-12 mb-10 text-center shadow-xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent)] animate-pulse"></div>
          <div className="relative z-10">
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4 inline-flex items-center gap-1">
              <FaFire className="text-amber-300" /> Hot & Active
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight flex items-center justify-center gap-3">
              Trending Petitions
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
              See what campaigns are driving the most action across the country. Add your signature to make these voices impossible to ignore!
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Filter trending petitions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page to 1
            }}
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-[#302d55] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F43676] transition-all shadow-md text-base font-medium"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
            <p className="text-gray-500 font-semibold">Loading trending petitions...</p>
          </div>
        )}

        {/* Error State */}
        {isError && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-center shadow-sm max-w-lg mx-auto mb-10">
            <p className="font-semibold">Failed to load petitions. Please check your network and try again.</p>
          </div>
        )}

        {/* Petitions List */}
        {!loading && !isError && (
          <div>
            {petitions.length > 0 ? (
              <div className="space-y-6">
                {petitions.map((petition, index) => {
                  const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                  const targetGoal = petition.targetSignatures || 1000;
                  const progressPercentage = Math.min(
                    Math.round((petition.numberOfSignatures / targetGoal) * 100),
                    100
                  );

                  let rankBadgeClass = "bg-gray-100 text-gray-500 border border-gray-200";
                  let showTrophy = false;
                  
                  if (rank === 1) {
                    rankBadgeClass = "bg-amber-100 text-amber-700 border border-amber-300 shadow-sm shadow-amber-50 font-extrabold";
                    showTrophy = true;
                  } else if (rank === 2) {
                    rankBadgeClass = "bg-slate-200 text-slate-700 border border-slate-300 shadow-sm shadow-slate-100 font-extrabold";
                    showTrophy = true;
                  } else if (rank === 3) {
                    rankBadgeClass = "bg-orange-100 text-orange-700 border border-orange-200 shadow-sm shadow-orange-50 font-extrabold";
                    showTrophy = true;
                  }

                  return (
                    <div
                      key={petition._id}
                      className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative border border-gray-100 group flex flex-col md:flex-row gap-6 items-center"
                    >
                      {/* Rank Indicator Badge */}
                      <div className={`absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${rankBadgeClass}`}>
                        {showTrophy ? <FaTrophy className="text-sm" /> : `#${rank}`}
                      </div>

                      {/* Image representation */}
                      <div className="w-full md:w-1/3 relative flex-shrink-0">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
                          <img
                            src={
                              petition.petitionDetails?.image ||
                              `https://picsum.photos/seed/${petition._id}/500/400`
                            }
                            alt={petition.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      {/* Info & Content */}
                      <div className="w-full md:w-2/3 flex flex-col justify-between h-full">
                        <div>
                          {/* Categories tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {petition.categories && petition.categories.length > 0 ? (
                              petition.categories.map((cat, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-pink-50 text-[#F43676] rounded-full text-xs font-bold"
                                >
                                  {getCategoryLabel(cat)}
                                </span>
                              ))
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                                General
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <Link href={`/currentpetitions/${petition.slug || petition._id}`} className="block group">
                            <h2 className="text-xl md:text-2xl font-bold text-[#002050] group-hover:text-[#F43676] transition-colors leading-tight mb-2.5 flex items-center gap-1.5">
                              {petition.title}
                              {(petition.constituencySettings?.required || petition.signingRequirements?.aadhar?.required) && (
                                <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" title="Identity Verified Signing" />
                              )}
                            </h2>
                          </Link>

                          {/* Problem Excerpt */}
                          <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                            {petition.petitionDetails?.problem}
                          </p>

                          {/* Starter info */}
                          <div className="flex items-center gap-2.5 text-xs text-gray-400 mb-5">
                            <span className="font-semibold text-gray-500">
                              By {petition.petitionStarter?.name || "Anonymous"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt />
                              {formatDate(petition.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar & CTA */}
                        <div className="border-t border-gray-50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Progress */}
                          <div className="flex-1 max-w-md">
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                              <span>{petition.numberOfSignatures.toLocaleString()} signed</span>
                              <span>Target {targetGoal.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#F43676] to-[#FF5722] rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Link
                            href={`/currentpetitions/${petition.slug || petition._id}`}
                            className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1.5 self-start sm:self-center"
                          >
                            <PenTool className="w-4 h-4" />
                            Sign Petition
                          </Link>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <p className="text-gray-500 font-semibold text-lg">No trending petitions found</p>
                <p className="text-gray-400 text-sm mt-1">Try another search keyword query.</p>
              </div>
            )}

            {/* Pagination controls */}
            {paginationInfo.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!paginationInfo.hasPrevPage}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                    paginationInfo.hasPrevPage
                      ? "bg-white text-gray-600 hover:bg-gray-100 border-gray-200"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100"
                  }`}
                >
                  <FaChevronLeft className="text-sm" />
                </button>

                {getPaginationNumbers().map((page, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    disabled={page === "..."}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border text-sm font-bold transition-all ${
                      page === currentPage
                        ? "bg-[#F43676] text-white border-[#F43676] shadow-md shadow-pink-100"
                        : page === "..."
                        ? "bg-transparent text-gray-400 border-transparent cursor-default"
                        : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!paginationInfo.hasNextPage}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                    paginationInfo.hasNextPage
                      ? "bg-white text-gray-600 hover:bg-gray-100 border-gray-200"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100"
                  }`}
                >
                  <FaChevronRight className="text-sm" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
