"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSpinner, FaCopy, FaPen, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaPlay, FaHandHoldingHeart, FaMapMarkerAlt, FaRupeeSign, FaFire } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { PenTool, User, BadgeCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ProfileEditModal from "./ProfileEditModal";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

// Categories mapping for display labels (kept for backward compatibility with petition data)
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


// Helper function to strip HTML tags for card excerpts
const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
};

// Tags - mapped to categories
const tags = [
  "Animals",
  "Environment",
  "Education",
  "Health",
  "Politics",
  "Human Rights",
  "Sports",
  "Technology",
  "Travel",
  "Lifestyle",
];

export default function Content({ initialPetitions = [], initialPagination = {} }) {
  const [activeContentTab, setActiveContentTab] = useState("petitions");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();

  const ITEMS_PER_PAGE = 20;

  // Fetch petitions from API
  const {
    data: petitionsData,
    isLoading: petitionsLoading,
    isError: isPetitionsError,
    error: petitionsError
  } = useQuery({
    queryKey: ["petitions", currentPage, searchQuery],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/petitions?page=${currentPage}&limit=${ITEMS_PER_PAGE}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch petitions");
      }

      return await response.json();
    },
    placeholderData: keepPreviousData,
    initialData: (currentPage === 1 && !searchQuery) ? {
      petitions: initialPetitions,
      totalPages: Math.ceil((initialPagination.totalPetitions || 0) / ITEMS_PER_PAGE) || 1,
      totalPetitions: initialPagination.totalPetitions || 0,
      hasNextPage: 1 < Math.ceil((initialPagination.totalPetitions || 0) / ITEMS_PER_PAGE),
      hasPrevPage: false
    } : undefined,
    staleTime: 60 * 1000,
  });

  const petitions = petitionsData?.petitions || [];
  const paginationInfo = {
    totalPages: petitionsData?.totalPages || 1,
    totalPetitions: petitionsData?.totalPetitions || 0,
    hasNextPage: petitionsData?.hasNextPage || false,
    hasPrevPage: petitionsData?.hasPrevPage || false,
  };
  const loading = petitionsLoading;
  const error = isPetitionsError ? petitionsError.message : null;

  // Fetch crowdfunding campaigns when the tab is selected
  const {
    data: crowdfundingCampaigns = [],
    isLoading: crowdfundingLoading,
    isError: isCrowdfundingError,
    error: crowdfundingError,
  } = useQuery({
    queryKey: ["crowdfundingCampaigns", "homepage"],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/crowdfunding`);

      if (!response.ok) {
        throw new Error("Failed to fetch crowdfunding campaigns");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.campaigns || [];
    },
    enabled: activeContentTab === "crowdfunding",
    staleTime: 60 * 1000,
  });

  // Recent posts based on first 4 petitions
  const recentPosts = petitions.slice(0, 4).map((p) => ({
    title: p.title,
    slug: p._id,
  }));

  // Fetch recent comments from the logged-in user
  const { data: recentComments = [] } = useQuery({
    queryKey: ["recentComments", user?.uid],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const userInfo = JSON.parse(localStorage.getItem("user"));

      if (!userInfo || !userInfo.token) {
        return [];
      }

      const response = await fetch(
        `${backendUrl}/api/comments/user/recent?limit=3`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.comments || [];
      }
      return [];
    },
    enabled: !!user,
  });

  // Fetch active ads
  const { data: ads = [], isLoading: adsLoading } = useQuery({
    queryKey: ["activeAds", "sidebar"],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/ads/active?position=sidebar`);

      if (response.ok) {
        const data = await response.json();
        return data.ads || [];
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch categories from API
  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/categories`);

      if (response.ok) {
        const data = await response.json();
        return data.categories || [];
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // FAQ accordion state
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  // Fetch FAQs from API
  const { data: faqsData = [] } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/faqs`);
      if (response.ok) {
        const data = await response.json();
        return data.faqs || [];
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const fallbackFaqs = [
    {
      question: "What is SoSign?",
      answer: "SoSign is India's leading digital platform for verified petitions and crowdfunding. We empower citizens, social workers, and organizations to start social movements, gather verified signatures via Aadhaar, and raise funds for public interest campaigns."
    },
    {
      question: "How does signature verification work?",
      answer: "Unlike traditional platforms, SoSign integrates secure identity verification (such as Aadhaar, PAN, or Voter ID checks) to ensure that every signature represents a unique, verified citizen, preventing spam signatures."
    },
    {
      question: "Is it free to start a petition?",
      answer: "Yes, starting a petition on SoSign is completely free for everyone. You can easily write your petition, add supporting images/documents, and publish it to start gathering signatures right away."
    }
  ];

  const displayFaqs = (faqsData && faqsData.length > 0 ? faqsData : fallbackFaqs).slice(0, 4);

  // Fetch trending petitions for sidebar (top 3)
  const { data: trendingSidebarPetitions = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["trendingSidebar"],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/petitions?sort=signatures&limit=3`);
      if (response.ok) {
        const data = await response.json();
        return data.petitions || [];
      }
      return [];
    },
    staleTime: 60 * 1000,
  });

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveContentTab("petitions");
    setCurrentPage(1); // Reset to first page when searching
    setShowSuggestions(false);
  };

  // Fetch search suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSuggestionsLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(
          `${backendUrl}/api/petitions?search=${encodeURIComponent(searchQuery)}&limit=5`
        );

        if (response.ok) {
          const data = await response.json();
          setSearchSuggestions(data.petitions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = (petitionId) => {
    setShowSuggestions(false);
    setSearchQuery("");
    router.push(`/currentpetitions/${petitionId}`);
  };

  // Handle page change
  const goToPage = (page) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
      // Scroll to top of content
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  // Get category label
  const getCategoryLabel = (category) => {
    return categoryLabels[category] || category;
  };

  // Generate pagination numbers
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

  return (
    <>
      <section className="bg-[#f0f2f5] py-12 px-8 sm:px-10 lg:px-17">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-3xl p-2 shadow-sm mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveContentTab("petitions")}
                    className={`rounded-2xl px-4 py-3 text-sm sm:text-base font-bold transition-all ${activeContentTab === "petitions"
                      ? "bg-[#F43676] text-white shadow-md shadow-pink-100"
                      : "text-[#302d55] hover:bg-pink-50"
                      }`}
                  >
                    Petitions
                  </button>
                  <Link
                    href="/crowdfunding"
                    className={`rounded-2xl px-4 py-3 text-sm sm:text-base font-bold transition-all text-center ${activeContentTab === "crowdfunding"
                      ? "bg-[#F43676] text-white shadow-md shadow-pink-100"
                      : "text-[#302d55] hover:bg-pink-50"
                      }`}
                  >
                    Crowdfunding
                  </Link>
                </div>
              </div>

              {activeContentTab === "petitions" && (
                <>
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
                  <span className="ml-3 text-lg text-gray-600">Loading petitions...</span>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                  <p className="text-red-600 mb-4">Error: {error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-[#F43676] text-white rounded-lg hover:bg-[#e02a60] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && petitions.length === 0 && (
                <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
                  <h3 className="text-xl font-bold text-[#002050] mb-2">No petitions found</h3>
                  <p className="text-[#302d55]">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different search term.`
                      : "There are no active petitions at the moment."}
                  </p>
                </div>
              )}

              {/* Petitions List */}
              {!loading && !error && petitions.length > 0 && (
                <div className="space-y-6">
                  {petitions.map((petition, index) => (
                    <div
                      key={petition._id}
                      className={`relative bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow ${index === 0 ? "ring-2 ring-[#F43676]" : ""
                        }`}
                    >
                      <Link
                        href={`/currentpetitions/${petition.slug || petition._id}`}
                        className="flex flex-col sm:flex-row items-center"
                      >
                        {/* Image - Extended outside */}
                        <div className="sm:w-2/5 relative sm:-ml-6 my-6 sm:my-8">
                          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                            <img
                              src={
                                petition.petitionDetails?.image ||
                                `https://picsum.photos/seed/${petition._id}/500/400`
                              }
                              alt={petition.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Feature/Video Icon */}
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
                          {petition.petitionDetails?.videoUrl && index !== 0 && (
                            <div className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                              <FaPlay className="text-white text-sm ml-0.5" />
                            </div>
                          )}
                          {/* Signature Count Badge for 1000+ signatures */}
                          {petition.numberOfSignatures >= 1000 && (
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md z-10 flex items-center gap-1.5 animate-pulse">
                              <PenTool className="w-3.5 h-3.5" />
                              <span>{petition.numberOfSignatures.toLocaleString()} Signatures</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="sm:w-3/5 p-8">
                          {/* Category Tags - Show ALL categories */}
                          <div className="flex flex-wrap gap-2 mb-4 items-center">
                            {petition.categories && petition.categories.length > 0 ? (
                              petition.categories.map((category, idx) => (
                                <span
                                  key={idx}
                                  className="px-4 py-1.5 bg-[#fce4ec] text-[#F43676] rounded-full text-sm font-medium"
                                >
                                  {getCategoryLabel(category)}
                                </span>
                              ))
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                                Uncategorized
                              </span>
                            )}
                            {petition.numberOfSignatures >= 1000 && (
                              <span className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm">
                                <PenTool className="w-4 h-4" />
                                <span>{petition.numberOfSignatures.toLocaleString()} Signatures</span>
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-2xl font-bold text-[#002050] mb-4 leading-tight hover:text-[#F43676] transition-colors flex items-center gap-2">
                            {petition.title}
                            {(petition.constituencySettings?.required || petition.signingRequirements?.constituency?.required || petition.signingRequirements?.aadhar?.required) && (
                              <span title="Verification required to sign" className="flex-shrink-0">
                                <BadgeCheck className="w-5 h-5 text-blue-500" />
                              </span>
                            )}
                          </h3>

                          {/* Description */}
                          <p className="text-[#302d55] text-base mb-5 leading-relaxed line-clamp-3">
                            {stripHtml(petition.petitionDetails?.problem || petition.petitionDetails?.solution)}
                          </p>

                          {/* Author Info */}
                          <div className="flex items-center gap-3 text-base mb-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img
                                src={
                                  petition.petitionStarter?.user?.profilePicture ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(petition.petitionStarter?.name || "Anonymous")}&background=random&size=32`
                                }
                                alt={petition.petitionStarter?.name || "Anonymous"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[#302d55] font-medium">
                              {petition.petitionStarter?.name || "Anonymous"}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <FaCalendarAlt className="text-xs" />
                              {formatDate(petition.createdAt)}
                            </span>
                          </div>

                          {/* Sign This Petition Button */}
                          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200">
                            <PenTool className="w-4 h-4" />
                            Sign this Petition
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && paginationInfo.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {/* Previous Button */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={!paginationInfo.hasPrevPage}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${paginationInfo.hasPrevPage
                      ? "bg-white text-gray-600 hover:bg-gray-100 border-gray-200"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100"
                      }`}
                  >
                    <FaChevronLeft className="text-sm" />
                  </button>

                  {/* Page Numbers */}
                  {getPaginationNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === "number" && goToPage(page)}
                      disabled={page === "..."}
                      className={`w-10 h-10 rounded-full font-medium flex items-center justify-center transition-colors ${page === currentPage
                        ? "bg-[#F43676] text-white"
                        : page === "..."
                          ? "bg-transparent text-gray-400 cursor-default"
                          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={!paginationInfo.hasNextPage}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${paginationInfo.hasNextPage
                      ? "bg-white text-gray-600 hover:bg-gray-100 border-gray-200"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100"
                      }`}
                  >
                    <FaChevronRight className="text-sm" />
                  </button>
                </div>
              )}

              {/* Results Info */}
              {!loading && !error && petitions.length > 0 && (
                <p className="text-center text-gray-500 text-sm mt-4">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, paginationInfo.totalPetitions)} of{" "}
                  {paginationInfo.totalPetitions} petitions
                </p>
              )}
                </>
              )}

              {activeContentTab === "crowdfunding" && (
                <>
                  {crowdfundingLoading && (
                    <div className="flex items-center justify-center py-20">
                      <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
                      <span className="ml-3 text-lg text-gray-600">Loading crowdfunding campaigns...</span>
                    </div>
                  )}

                  {isCrowdfundingError && !crowdfundingLoading && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                      <p className="text-red-600 mb-4">Error: {crowdfundingError.message}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[#F43676] text-white rounded-lg hover:bg-[#e02a60] transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!crowdfundingLoading && !isCrowdfundingError && crowdfundingCampaigns.length === 0 && (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
                      <FaHandHoldingHeart className="text-5xl text-pink-100 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-[#002050] mb-2">No crowdfunding campaigns found</h3>
                      <p className="text-[#302d55] mb-5">There are no active crowdfunding campaigns at the moment.</p>
                      <Link
                        href="/start-crowdfunding"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg transition-all duration-200"
                      >
                        <FaHandHoldingHeart className="text-sm" />
                        Start Crowdfunding
                      </Link>
                    </div>
                  )}

                  {!crowdfundingLoading && !isCrowdfundingError && crowdfundingCampaigns.length > 0 && (
                    <div className="space-y-6">
                      {crowdfundingCampaigns.map((campaign) => {
                        const goalAmount = Number(campaign.goalAmount) || 0;
                        const raisedAmount = Number(campaign.raisedAmount) || 0;
                        const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

                        return (
                          <div
                            key={campaign._id || campaign.slug}
                            className="relative bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                          >
                            <Link
                              href={`/crowdfunding/${campaign.slug || campaign._id}`}
                              className="flex flex-col sm:flex-row items-center"
                            >
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
                                <div className="absolute top-4 left-4 bg-white text-[#302d55] px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                                  {campaign.category || "Crowdfunding"}
                                </div>
                              </div>

                              <div className="sm:w-3/5 p-8">
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

                                <h3 className="text-2xl font-bold text-[#002050] mb-4 leading-tight hover:text-[#F43676] transition-colors">
                                  {campaign.title}
                                </h3>

                                <p className="text-[#302d55] text-base mb-5 leading-relaxed line-clamp-3">
                                  {campaign.story?.substring(0, 200)}
                                  {campaign.story?.length > 200 ? "..." : ""}
                                </p>

                                <div className="mb-5">
                                  <div className="flex items-center justify-between gap-4 text-sm mb-2">
                                    <span className="font-bold text-[#002050]">{formatCurrency(raisedAmount)}</span>
                                    <span className="text-gray-500">of {formatCurrency(goalAmount)}</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-[#F43676] to-[#2D3A8C]"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>

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
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar - Right Side */}
            <div className="lg:w-1/3 space-y-6">
              {/* Search Box */}
              <div className="bg-white rounded-3xl p-6 shadow-sm" ref={searchRef}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Search</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Search petitions..."
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

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (searchSuggestions.length > 0 || suggestionsLoading) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {suggestionsLoading ? (
                        <div className="px-4 py-3 text-center text-gray-500">
                          <FaSpinner className="animate-spin inline mr-2" />
                          Searching...
                        </div>
                      ) : (
                        searchSuggestions.map((petition) => (
                          <button
                            key={petition._id}
                            type="button"
                            onClick={() => handleSuggestionClick(petition._id)}
                            className="w-full px-4 py-3 text-left hover:bg-pink-50 border-b border-gray-100 last:border-b-0 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {petition.petitionDetails?.image && (
                                <img
                                  src={petition.petitionDetails.image}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#1a1a2e] group-hover:text-[#F43676] transition-colors line-clamp-1">
                                  {petition.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {petition.numberOfSignatures || 0} signatures
                                </p>
                              </div>
                              <FaChevronRight className="text-gray-400 group-hover:text-[#F43676] flex-shrink-0" />
                            </div>
                          </button>
                        ))
                      )}
                      {!suggestionsLoading && searchSuggestions.length > 0 && (
                        <button
                          type="submit"
                          className="w-full px-4 py-2 text-center text-sm text-[#F43676] hover:bg-pink-50 font-medium transition-colors"
                        >
                          See all results for &quot;{searchQuery}&quot;
                        </button>
                      )}
                    </div>
                  )}
                </form>
              </div>

              {/* Recent Comments */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#002050]">Recent Comments</h3>
                    <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                  </div>
                  {user && recentComments.length > 0 && (
                    <Link
                      href="/my-comments"
                      className="text-sm text-[#F43676] hover:underline font-medium"
                    >
                      View All
                    </Link>
                  )}
                </div>
                {user ? (
                  recentComments.length > 0 ? (
                    <ul className="space-y-3">
                      {recentComments.map((comment, index) => (
                        <li key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <Link
                            href={`/currentpetitions/${comment.petitionId}#comment-${comment._id}`}
                            className="block hover:bg-pink-50 p-2 rounded-lg transition-colors group"
                          >
                            {/* Petition Title */}
                            {comment.petitionTitle && (
                              <p className="text-xs text-gray-500 mb-1">
                                <span className="font-medium">On:</span>{" "}
                                <span className="text-[#F43676] group-hover:underline line-clamp-1">
                                  {comment.petitionTitle}
                                </span>
                              </p>
                            )}
                            {/* Comment Content */}
                            <p className="text-[#302d55] text-sm leading-relaxed line-clamp-2 mb-1">
                              &ldquo;{comment.content}&rdquo;
                            </p>
                            {/* Date */}
                            <p className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[#302d55] text-sm">You haven&apos;t made any comments yet.</p>
                  )
                ) : (
                  <p className="text-[#302d55] text-sm">
                    <Link href="/login" className="text-[#F43676] hover:underline">
                      Login
                    </Link> to see your recent comments.
                  </p>
                )}
              </div>

              {/* Archives */}
              {/* <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-bold text-[#1a1a2e]">Archives</h3>
                <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
              </div>
              <p className="text-gray-600">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div> */}

              {/* Categories */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#002050]">Categories</h3>
                    <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                  </div>
                  {!categoriesLoading && (
                    <span className="text-xs font-semibold text-[#F43676] bg-pink-50 px-2 py-1 rounded-md">
                      {categoriesData.length} Total
                    </span>
                  )}
                </div>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <FaSpinner className="animate-spin text-[#F43676]" />
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {categoriesData.map((category, index) => (
                      <li key={category._id || index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0 flex items-center justify-between">
                        <Link
                          href={`/category/${category.slug}`}
                          className="text-[#302d55] hover:text-[#F43676] transition-colors font-medium text-sm"
                        >
                          {category.name}
                        </Link>
                        <span className="text-[11px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                          {category.petitionCount || 0}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Recent Posts */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Recent Petitions</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <ul className="space-y-3">
                  {recentPosts.length > 0 ? (
                    recentPosts.map((post, index) => (
                      <li key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <Link
                          href={`/currentpetitions/${post.slug}`}
                          className="text-[#302d55] hover:text-[#F43676] transition-colors text-sm leading-relaxed block"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-[#302d55] text-sm">No recent posts</li>
                  )}
                </ul>
              </div>

              {/* Author Card */}
              {user ? (
                <div className="bg-white rounded-3xl p-6 shadow-sm text-center relative">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#F43676] hover:text-white transition-colors text-gray-600"
                    title="Edit Profile"
                  >
                    <FaPen className="text-xs" />
                  </button>
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100">
                    <img
                      src={
                        user.profilePicture ||
                        user.photoURL ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random&size=200`
                      }
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-[#002050] mb-2">{user.name}</h4>
                  {user.designation && (
                    <p className="text-[#F43676] text-sm font-medium mb-2">{user.designation}</p>
                  )}
                  <p className="text-[#302d55] text-sm leading-relaxed mb-4">
                    {user.bio || "Click the edit button to add your bio and tell others about yourself!"}
                  </p>

                  {/* Referral Code */}
                  {user.uniqueCode && (
                    <div className="bg-pink-50 rounded-xl p-3 mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Your Referral Code</p>
                      <div className="flex items-center gap-2">
                        <input
                          value={user.uniqueCode}
                          readOnly
                          className="flex-1 px-3 py-2 border border-pink-200 rounded-lg bg-white font-mono text-sm tracking-wider text-center font-bold text-[#F43676] focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user.uniqueCode);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-3 py-2 rounded-lg font-medium hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1 text-sm"
                        >
                          <FaCopy className="text-xs" />
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Social Media Icons */}
                  {user.socialLinks && Object.values(user.socialLinks).some(link => link) && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      {user.socialLinks.facebook && (
                        <a
                          href={user.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-[#3b5998] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                        >
                          <FaFacebookF className="text-sm" />
                        </a>
                      )}
                      {user.socialLinks.twitter && (
                        <a
                          href={user.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                        >
                          <FaXTwitter className="text-sm" />
                        </a>
                      )}
                      {user.socialLinks.instagram && (
                        <a
                          href={user.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                        >
                          <FaInstagram className="text-sm" />
                        </a>
                      )}
                      {user.socialLinks.linkedin && (
                        <a
                          href={user.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-[#0077b5] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                        >
                          <FaLinkedinIn className="text-sm" />
                        </a>
                      )}
                      {user.socialLinks.youtube && (
                        <a
                          href={user.socialLinks.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                        >
                          <FaYoutube className="text-sm" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100 bg-gradient-to-br from-pink-100 to-gray-100 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-[#002050] mb-2">Welcome!</h4>
                  <p className="text-[#302d55] text-sm leading-relaxed mb-4">
                    Sign in to customize your profile and join the community.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-6 py-2 bg-[#F43676] text-white font-medium rounded-full hover:bg-[#e02a60] transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Tags */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Tags</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => {
                    // Convert tag to category slug (lowercase with underscores for spaces)
                    const categorySlug = tag.toLowerCase().replace(/\s+/g, '_');
                    return (
                      <Link
                        key={index}
                        href={`/category/${categorySlug}`}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-[#302d55] hover:border-[#F43676] hover:text-[#F43676] transition-colors"
                      >
                        {tag}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Ads */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Ads</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>

                {adsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-[#F43676]" />
                  </div>
                ) : ads.length > 0 ? (
                  <div className="space-y-4">
                    {ads.map((ad, index) => (
                      <a
                        key={ad._id || index}
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                        onClick={async () => {
                          try {
                            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                            await fetch(`${backendUrl}/api/ads/${ad._id}/click`, { method: "POST" });
                          } catch (err) {
                            console.error("Error tracking click:", err);
                          }
                        }}
                      >
                        <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <img
                            src={ad.image || ad.imageUrl}
                            alt={ad.title || "Advertisement"}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                        <div className="mt-3">
                          <h4 className="font-semibold text-[#1a1a2e] group-hover:text-[#F43676] transition-colors line-clamp-1">
                            {ad.title}
                          </h4>
                          {ad.description && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                              {ad.description}
                            </p>
                          )}
                        </div>
                        {index < ads.length - 1 && (
                          <div className="border-b border-gray-100 mt-4"></div>
                        )}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-sm">No ads available</p>
                  </div>
                )}
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">FAQs</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>

                <div className="space-y-3">
                  {displayFaqs.map((faq, index) => {
                    const isOpen = activeFaqIndex === index;
                    return (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <button
                          onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                          className="flex justify-between items-center w-full text-left font-semibold text-sm text-[#302d55] hover:text-[#F43676] transition-colors py-1 focus:outline-none"
                        >
                          <span className="pr-2">{faq.question}</span>
                          <span className={`transform transition-transform duration-200 text-[10px] text-gray-400 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#F43676]' : ''}`}>
                            ▼
                          </span>
                        </button>
                        <div
                          className={`text-xs text-gray-500 leading-relaxed overflow-hidden transition-all duration-300 ${
                            isOpen ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          {faq.answer}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-2 border-t border-gray-50 text-center">
                  <Link
                    href="/faq"
                    className="text-xs font-semibold text-[#F43676] hover:text-[#e02a60] transition-colors"
                  >
                    View all FAQs →
                  </Link>
                </div>
              </div>

              {/* Trending Petitions Sidebar Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#002050]">Trending Petitions</h3>
                    <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                  </div>
                  <FaFire className="text-amber-500 text-lg animate-pulse" />
                </div>

                {trendingLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <FaSpinner className="animate-spin text-[#F43676]" />
                  </div>
                ) : trendingSidebarPetitions.length > 0 ? (
                  <div className="space-y-4">
                    {trendingSidebarPetitions.map((pet, idx) => (
                      <div key={pet._id || idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <Link
                          href={`/currentpetitions/${pet.slug || pet._id}`}
                          className="group block"
                        >
                          <h4 className="font-semibold text-sm text-[#302d55] group-hover:text-[#F43676] transition-colors leading-snug line-clamp-2">
                            {pet.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-[#F43676]">
                            <PenTool className="w-3 h-3" />
                            <span>{pet.numberOfSignatures.toLocaleString()} signatures</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs text-center py-4">No trending petitions found</p>
                )}

                <div className="mt-4 pt-2 border-t border-gray-50 text-center">
                  <Link
                    href="/trending"
                    className="text-xs font-semibold text-[#F43676] hover:text-[#e02a60] transition-colors"
                  >
                    View all Trending →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}
