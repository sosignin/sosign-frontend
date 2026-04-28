"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import {
  FaUserCircle,
  FaFacebookF,
  FaTelegramPlane,
  FaInstagram,
  FaYoutube,
  FaSearch,
  FaMoon,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaSpinner,
  FaWallet
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [campaignDropdown, setCampaignDropdown] = useState(false);
  const [pagesDropdown, setPagesDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, walletBalance } = useAuth();
  const router = useRouter();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  // Toggle search bar
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // Fetch search results with debounce
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(
          `${backendUrl}/api/petitions?search=${encodeURIComponent(searchQuery)}&limit=5`
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.petitions || []);
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  // Handle search result click
  const handleResultClick = (petitionId) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/currentpetitions/${petitionId}`);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/currentpetitions?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`w-full bg-white border-b sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg border-transparent' : 'border-gray-200'}`}
    >
      <div className="max-w-[95%] xl:max-w-[90%] mx-auto pl-0 pr-2 sm:pl-0 sm:pr-3 lg:pl-0 lg:pr-4">
        <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'h-[75px]' : 'h-[105px]'}`}>
          {/* Left side: Logo Only */}
          <div className="flex items-center">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/">
                <Image
                  src="/log.png"
                  alt="SOSIGN Logo"
                  width={140}
                  height={45}
                  className={`w-auto transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12'}`}
                />
              </Link>
            </motion.div>
          </div>

          {/* Right side: Navigation + Actions */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className="text-[#F43676] font-semibold text-base hover:text-[#F43676] transition-all duration-200 border-b-2 border-[#F43676] pb-1"
              >
                Home
              </Link>

              {/* Start Campaign Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCampaignDropdown(true)}
                onMouseLeave={() => setCampaignDropdown(false)}
              >
                <button className="flex items-center gap-1 text-[#302d55] font-semibold text-base hover:text-[#F43676] transition-all duration-200 border-b-2 border-transparent hover:border-[#F43676] pb-1">
                  Start Campaign
                  <FaChevronDown className="text-sm" />
                </button>
                <AnimatePresence>
                  {campaignDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                    >
                      <Link
                        href="/start-petition"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        Start a Petition
                      </Link>
                      <Link
                        href="/start-crowdfunding"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        Start Crowdfunding
                      </Link>
                      <Link
                        href="/my-petition"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        My Petitions
                      </Link>
                      <Link
                        href="/my-campaigns"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        My Campaigns
                      </Link>
                      <Link
                        href="/currentpetitions"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        Current Petitions
                      </Link>
                      <Link
                        href="/crowdfunding"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        Crowdfunding
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pages Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setPagesDropdown(true)}
                onMouseLeave={() => setPagesDropdown(false)}
              >
                <button className="flex items-center gap-1 text-[#302d55] font-semibold text-base hover:text-[#F43676] transition-all duration-200 border-b-2 border-transparent hover:border-[#F43676] pb-1">
                  Pages
                  <FaChevronDown className="text-sm" />
                </button>
                <AnimatePresence>
                  {pagesDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                    >
                      <Link
                        href="/about"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        About Us
                      </Link>
                      <Link
                        href="/successfulpetitions"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        Success Stories
                      </Link>
                      <Link
                        href="/blog"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        Blog
                      </Link>
                      <Link
                        href="/guides"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        Guides
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/contact"
                className="text-[#302d55] font-semibold text-base hover:text-[#F43676] transition-all duration-200 border-b-2 border-transparent hover:border-[#F43676] pb-1"
              >
                Contact
              </Link>
            </div>

            {/* Social Icons - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-3">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/sosign.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
              >
                <div className="relative w-4 h-4 overflow-hidden">
                  <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                    <FaFacebookF className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                    <FaFacebookF className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                  </div>
                </div>
              </a>
              {/* Twitter/X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
              >
                <div className="relative w-4 h-4 overflow-hidden">
                  <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                    <FaXTwitter className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                    <FaXTwitter className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                  </div>
                </div>
              </a>
              {/* Telegram */}
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
              >
                <div className="relative w-4 h-4 overflow-hidden">
                  <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                    <FaTelegramPlane className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                    <FaTelegramPlane className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                  </div>
                </div>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
              >
                <div className="relative w-4 h-4 overflow-hidden">
                  <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                    <FaInstagram className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                    <FaInstagram className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                  </div>
                </div>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@sosign-in"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
              >
                <div className="relative w-4 h-4 overflow-hidden">
                  <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                    <FaYoutube className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                    <FaYoutube className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                  </div>
                </div>
              </a>
            </div>

            {/* Search Button and Overlay */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={toggleSearch}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${searchOpen
                  ? "bg-[#e02a60] text-white"
                  : "bg-[#F43676] text-white hover:bg-[#e02a60]"
                  }`}
              >
                {searchOpen ? <FaTimes className="text-xs" /> : <FaSearch className="text-xs" />}
              </button>

              {/* Search Overlay */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-[70px] sm:top-12 w-auto sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} className="p-3 sm:p-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                        <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Search petitions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          className="flex-1 bg-transparent outline-none text-sm text-[#302d55] placeholder-gray-400 min-w-0"
                        />
                        {searchLoading && (
                          <FaSpinner className="animate-spin text-[#F43676] text-sm flex-shrink-0" />
                        )}
                      </div>
                    </form>

                    {/* Search Results */}
                    <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
                      {searchQuery.length < 2 && (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          Type at least 2 characters to search
                        </div>
                      )}

                      {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          No petitions found for &quot;{searchQuery}&quot;
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="py-2">
                          {searchResults.map((petition) => (
                            <button
                              key={petition._id}
                              onClick={() => handleResultClick(petition._id)}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 hover:bg-pink-50 transition-colors text-left group"
                            >
                              {/* Petition Image */}
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={petition.petitionDetails?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(petition.title)}&background=random&size=48`}
                                  alt={petition.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {/* Petition Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#002050] group-hover:text-[#F43676] transition-colors line-clamp-1">
                                  {petition.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                  {petition.numberOfSignatures || 0} signatures • {petition.petitionStarter?.name || "Anonymous"}
                                </p>
                              </div>
                            </button>
                          ))}

                          {/* See All Results Link */}
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full px-3 sm:px-4 py-3 text-center text-sm font-medium text-[#F43676] hover:bg-pink-50 transition-colors border-t border-gray-100"
                          >
                            See all results for &quot;{searchQuery}&quot;
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wallet Button - Hidden on mobile, shown on lg+ (it's in the hamburger for mobile) */}
            {user && (
              <Link
                href="/wallet"
                className="hidden lg:flex relative items-center gap-1.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-3 py-2 rounded-full font-medium text-sm hover:shadow-lg hover:shadow-pink-300/30 transition-all duration-200"
              >
                <FaWallet className="text-sm" />
                <span className="hidden sm:inline">{walletBalance.toFixed(1)} Pts</span>
                <span className="sm:hidden">{walletBalance.toFixed(0)} Pts</span>
              </Link>
            )}

            {/* Login Button or User Profile */}
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 text-[#302d55] font-medium text-sm hover:text-[#F43676] transition-colors duration-200 py-2 px-1"
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Profile Picture with fallback */}
                  {user.profilePicture || user.photoURL ? (
                    <img
                      src={user.profilePicture || user.photoURL}
                      alt={user.name || "Profile"}
                      className="w-8 h-8 rounded-full border-2 border-[#F43676] object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F43676] to-[#e02a60] flex items-center justify-center text-white text-xs font-bold border-2 border-[#F43676]">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.name || "Profile"}</span>
                </motion.button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                    >
                      <Link
                        href="/my-profile"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/my-petition"
                        className="block px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Petitions
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-[#302d55] text-sm hover:bg-gray-50 hover:text-[#F43676] transition-colors"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/login"
                  className="bg-[#F43676] text-white px-6 py-2.5 rounded-full font-semibold text-base hover:bg-[#e02a60] transition-colors duration-200 flex items-center gap-2"
                >
                  <FaUserCircle className="text-base" />
                  Login
                </Link>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center text-[#302d55]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-100 py-4"
            >
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="text-[#F43676] font-medium text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/start-petition"
                  className="text-[#302d55] font-medium text-sm py-2 hover:text-[#F43676]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start a Petition
                </Link>
                <Link
                  href="/start-crowdfunding"
                  className="text-[#302d55] font-medium text-sm py-2 hover:text-[#F43676]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Crowdfunding
                </Link>
                <Link
                  href="/my-petition"
                  className="text-[#302d55] font-medium text-sm py-2 hover:text-[#F43676]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Petitions
                </Link>
                <Link
                  href="/currentpetitions"
                  className="text-[#302d55] font-medium text-sm py-2 hover:text-[#F43676]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Current Petitions
                </Link>
                <Link
                  href="/crowdfunding"
                  className="text-[#302d55] font-medium text-sm py-2 hover:text-[#F43676]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Crowdfunding
                </Link>
                <Link
                  href="/successfulpetitions"
                  className="text-[#302d55] font-medium text-sm py-2 hover:text-[#F43676]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Success Stories
                </Link>
                <Link
                  href="/about"
                  className="text-[#302d55] font-medium text-sm py-2 hover:text-[#F43676]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="text-[#302d55] font-medium text-sm py-2 hover:text-[#F43676]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                {/* Wallet Link for Mobile - Only shown when logged in */}
                {user && (
                  <Link
                    href="/wallet"
                    className="flex items-center gap-2 text-[#F43676] font-medium text-sm py-2 border-t border-gray-100 mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaWallet className="text-sm" />
                    Wallet ({walletBalance.toFixed(1)} Pts)
                  </Link>
                )}

                {/* Social Icons for Mobile */}
                <div className="flex items-center gap-3 py-3 border-t border-gray-100 mt-2">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
                  >
                    <div className="relative w-4 h-4 overflow-hidden">
                      <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                        <FaFacebookF className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                        <FaFacebookF className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                      </div>
                    </div>
                  </a>
                  {/* Twitter/X */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
                  >
                    <div className="relative w-4 h-4 overflow-hidden">
                      <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                        <FaXTwitter className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                        <FaXTwitter className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                      </div>
                    </div>
                  </a>
                  {/* Telegram */}
                  <a
                    href="https://telegram.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
                  >
                    <div className="relative w-4 h-4 overflow-hidden">
                      <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                        <FaTelegramPlane className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                        <FaTelegramPlane className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                      </div>
                    </div>
                  </a>
                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
                  >
                    <div className="relative w-4 h-4 overflow-hidden">
                      <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                        <FaInstagram className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                        <FaInstagram className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                      </div>
                    </div>
                  </a>
                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
                  >
                    <div className="relative w-4 h-4 overflow-hidden">
                      <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-4">
                        <FaYoutube className="text-sm text-[#3d3d5c] h-4 flex items-center justify-center" />
                        <FaYoutube className="text-sm text-[#F43676] h-4 flex items-center justify-center" />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
