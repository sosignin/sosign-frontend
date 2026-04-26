"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaComment, FaPause, FaPlay } from "react-icons/fa";
import { PenTool, BadgeCheck } from "lucide-react";
import config from "@/config/api";

// Default fallback data in case API fails or returns empty
const defaultHeroSlides = [
  {
    id: "default-1",
    image: "https://picsum.photos/seed/hero1/800/600",
    categories: ["Environment", "Social"],
    title: "Join the Movement to Protect Our Planet",
    description: "Be part of the change. Every signature counts towards creating a better future for our environment and communities. Together we can make a difference.",
    date: "December 24, 2024",
    comments: "0 Comments",
    link: "/currentpetitions",
  },
];

const defaultTopStories = [
  {
    id: "default-story-1",
    title: "Start your own petition today",
    date: "Today",
    image: "https://picsum.photos/seed/story1/100/100",
  },
];

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Helper function to extract and format categories from petition
const extractCategories = (petition) => {
  // Use actual categories from petition if available
  if (petition.categories && petition.categories.length > 0) {
    return petition.categories
      .slice(0, 2) // Limit to 2 categories for display
      .map(cat => {
        // Convert slug format to display format (e.g., 'human_rights' -> 'Human Rights')
        return cat
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
  }

  // Fallback: Try to extract category from title or problem description (for legacy petitions)
  const categories = [];
  const text = `${petition.title} ${petition.petitionDetails?.problem || ""}`.toLowerCase();

  if (text.includes("environment") || text.includes("climate") || text.includes("pollution")) {
    categories.push("Environment");
  } else if (text.includes("health") || text.includes("medical") || text.includes("hospital")) {
    categories.push("Healthcare");
  } else if (text.includes("education") || text.includes("school") || text.includes("student")) {
    categories.push("Education");
  } else if (text.includes("social") || text.includes("community") || text.includes("society")) {
    categories.push("Community");
  } else {
    categories.push("Social");
  }

  return categories.slice(0, 2);
};

export default function Banner({ initialPetitions = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize state with transformed initial data if available
  const initializeHeroSlides = () => {
    if (initialPetitions.length > 0) {
      return initialPetitions.map((petition) => ({
        id: petition._id,
        image: petition.petitionDetails?.image || `https://picsum.photos/seed/${petition._id}/800/600`,
        categories: extractCategories(petition),
        title: petition.title,
        description: petition.petitionDetails?.problem || petition.petitionDetails?.solution || "Support this important cause by signing the petition.",
        date: formatDate(petition.createdAt),
        comments: `${petition.numberOfSignatures || 0} Signatures`,
        link: `/currentpetitions/${petition.slug || petition._id}`,
        constituencyRequired: petition.constituencySettings?.required || false,
      }));
    }
    return defaultHeroSlides;
  };

  const initializeTopStories = () => {
    if (initialPetitions.length > 0) {
      return initialPetitions.map((petition) => ({
        id: petition._id,
        title: petition.title.length > 40 ? petition.title.substring(0, 40) + "..." : petition.title,
        date: formatDate(petition.createdAt),
        image: petition.petitionDetails?.image || `https://picsum.photos/seed/${petition._id}/100/100`,
      }));
    }
    return defaultTopStories;
  };

  const [heroSlides, setHeroSlides] = useState(initializeHeroSlides);
  const [topStories, setTopStories] = useState(initializeTopStories);
  const [loading, setLoading] = useState(initialPetitions.length === 0);
  const [error, setError] = useState(null);
  const router = useRouter();
  const isFirstRender = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch petitions from the backend
  useEffect(() => {
    // Skip if we have initial data
    if (isFirstRender.current && initialPetitions.length > 0) {
      isFirstRender.current = false;
      return;
    }

    const fetchPetitions = async () => {
      try {
        setLoading(true);

        // Fetch petitions for hero slider
        const response = await fetch(`${config.API_BASE_URL}/api/petitions?limit=10`);

        if (!response.ok) {
          throw new Error("Failed to fetch petitions");
        }

        const data = await response.json();

        if (data.petitions && data.petitions.length > 0) {
          // Transform petitions into hero slides format
          const slides = data.petitions.map((petition) => ({
            id: petition._id,
            image: petition.petitionDetails?.image || `https://picsum.photos/seed/${petition._id}/800/600`,
            categories: extractCategories(petition),
            title: petition.title,
            description: petition.petitionDetails?.problem || petition.petitionDetails?.solution || "Support this important cause by signing the petition.",
            date: formatDate(petition.createdAt),
            comments: `${petition.numberOfSignatures || 0} Signatures`,
            link: `/currentpetitions/${petition.slug || petition._id}`,
            verificationRequired: petition.constituencySettings?.required || petition.signingRequirements?.constituency?.required || petition.signingRequirements?.aadhar?.required || false,
          }));

          setHeroSlides(slides);
        }

        // Fetch top 3 petitions by signatures for ticker bar
        const tickerResponse = await fetch(`${config.API_BASE_URL}/api/petitions?limit=3&sort=signatures`);

        if (tickerResponse.ok) {
          const tickerData = await tickerResponse.json();

          if (tickerData.petitions && tickerData.petitions.length > 0) {
            // Transform petitions into top stories format for ticker
            const stories = tickerData.petitions.map((petition) => ({
              id: petition._id,
              title: petition.title.length > 50 ? petition.title.substring(0, 50) + "..." : petition.title,
              date: `${petition.numberOfSignatures || 0} signatures`,
              image: petition.petitionDetails?.image || `https://picsum.photos/seed/${petition._id}/100/100`,
              link: `/currentpetitions/${petition.slug || petition._id}`,
            }));

            setTopStories(stories);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching petitions:", err);
        setError(err.message);
        // Keep default data on error
      } finally {
        setLoading(false);
      }
    };

    fetchPetitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-slide functionality - DISABLED
  // useEffect(() => {
  //   if (heroSlides.length === 0) return;

  //   const interval = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [heroSlides.length]);

  const nextSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  if (!mounted) return null;

  return (
    <section className="bg-[#f0f2f5] mt px-4 sm:px-8 lg:px-12 pt-6">
      {/* Top Stories Ticker Bar */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex items-stretch">
        {/* Top Stories Label */}
        <div className="flex items-center gap-2 bg-[#F43676] text-white px-5 shrink-0">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span className="font-bold text-sm">Top Stories</span>
        </div>

        {/* Scrolling News Ticker - Infinite Seamless Loop */}
        <div className="flex-1 overflow-hidden relative py-1 px-4">
          <style jsx>{`
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
              gap: 2rem;
              width: max-content;
              animation: ticker-scroll 60s linear infinite;
            }
            .ticker-track:hover,
            .ticker-track.paused {
              animation-play-state: paused;
            }
          `}</style>
          <div className={`ticker-track ${isTickerPaused ? 'paused' : ''}`}>
            {/* First set of stories */}
            {[...topStories, ...topStories, ...topStories, ...topStories].map((story, index) => (
              <Link
                key={`first-${story.id}-${index}`}
                href="/currentpetitions"
                className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 shrink-0">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#002050] font-bold text-sm whitespace-nowrap">
                    {story.title}
                  </span>
                  <span className="text-[#302d55] font-semibold text-xs flex items-center gap-1">
                    <span className="text-[#F43676]">•</span> {story.date}
                  </span>
                </div>
              </Link>
            ))}
            {/* Duplicate set for seamless loop */}
            {[...topStories, ...topStories, ...topStories, ...topStories].map((story, index) => (
              <Link
                key={`second-${story.id}-${index}`}
                href="/currentpetitions"
                className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 shrink-0">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#002050] font-bold text-sm whitespace-nowrap">
                    {story.title}
                  </span>
                  <span className="text-[#302d55] font-semibold text-xs flex items-center gap-1">
                    <span className="text-[#F43676]">•</span> {story.date}
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

      {/* Hero Slider Section */}
      <div className="py-6">
        <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
            {/* Left Side - Image */}
            <div className="lg:w-[55%] relative h-[280px] sm:h-[350px] lg:h-[400px] overflow-hidden rounded-2xl group shadow-lg bg-gray-100 flex-shrink-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Image with proper error handling */}
                  <img
                    src={heroSlides[currentSlide]?.image || "https://picsum.photos/seed/default/800/600"}
                    alt={heroSlides[currentSlide]?.title || "Petition"}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://picsum.photos/seed/${heroSlides[currentSlide]?.id || "fallback"}/800/600`;
                    }}
                  />
                  {/* Gradient overlay for better visual appeal */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </motion.div>
              </AnimatePresence>

              {/* Left Navigation Arrow */}
              <button
                onClick={prevSlide}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-all z-10 border border-gray-100"
              >
                <FaChevronLeft className="text-gray-600 text-xs sm:text-sm" />
              </button>

              {/* Right Navigation Arrow - Inside Image */}
              <button
                onClick={nextSlide}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-all z-10 border border-gray-100"
              >
                <FaChevronRight className="text-gray-600 text-xs sm:text-sm" />
              </button>
            </div>

            {/* Right Side - Content */}
            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center min-h-[200px] lg:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {/* Category Tags */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
                    {heroSlides[currentSlide]?.categories?.map((category, index) => (
                      <Link
                        key={index}
                        href={`/category/${category.toLowerCase().replace(/\s+/g, '_')}`}
                        className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[#F43676]/10 text-[#F43676] rounded-full text-xs sm:text-sm font-medium hover:bg-[#F43676] hover:text-white transition-all cursor-pointer"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#002050] mb-3 sm:mb-4 leading-tight line-clamp-2 flex items-center gap-2">
                    <Link
                      href={heroSlides[currentSlide]?.link || "/currentpetitions"}
                      className="hover:text-[#F43676] transition-colors"
                    >
                      {heroSlides[currentSlide]?.title}
                    </Link>
                    {heroSlides[currentSlide]?.verificationRequired && (
                      <span title="Verification required to sign" className="flex-shrink-0">
                        <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                      </span>
                    )}
                  </h1>

                  {/* Description */}
                  <p className="text-[#302d55] text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed line-clamp-3">
                    {heroSlides[currentSlide]?.description}
                  </p>

                  {/* Continue Reading Link */}
                  <Link
                    href={heroSlides[currentSlide]?.link || "/currentpetitions"}
                    className="inline-flex items-center gap-2 text-[#002050] font-semibold hover:text-[#F43676] transition-colors mb-4 group text-sm sm:text-base"
                  >
                    Continue Reading
                    <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Sign This Petition Button */}
                  <div className="mb-4 sm:mb-6">
                    <Link
                      href={heroSlides[currentSlide]?.link || "/currentpetitions"}
                      className="inline-block bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <PenTool className="w-4 h-4" />
                        Sign this Petition
                      </span>
                    </Link>
                  </div>

                  {/* Date and Comments */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[#302d55] text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <FaCalendarAlt className="text-[#302d55]" />
                      {heroSlides[currentSlide]?.date}
                    </span>
                    <span className="text-[#F43676] hidden sm:inline">•</span>
                    <Link
                      href={`${heroSlides[currentSlide]?.link || "/currentpetitions"}#comments`}
                      className="flex items-center gap-2 hover:text-[#F43676] transition-colors"
                    >
                      <FaComment className="text-[#302d55]" />
                      Comments
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-4 lg:mt-6">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                  ? "bg-[#F43676] w-6"
                  : "bg-gray-300 hover:bg-gray-400"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
