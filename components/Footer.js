"use client";

import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaPinterestP, FaSearch, FaArrowUp, FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { FileText } from "lucide-react";

// Categories data
const categories = [
  "Animals",
  "Environment",
  "Education",
  "Health",
  "Politics",
  "Human Rights",
  "Technology",
];

export default function Footer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [latestPetitions, setLatestPetitions] = useState([]);

  // Fetch latest 3 petitions
  useEffect(() => {
    const fetchLatestPetitions = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/petitions?limit=3&sort=newest`);

        if (response.ok) {
          const data = await response.json();
          setLatestPetitions(data.petitions || []);
        }
      } catch (err) {
        console.error("Error fetching latest petitions:", err);
      }
    };

    fetchLatestPetitions();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#302D55] text-white pt-12 px-6 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
        {/* Search & About Section */}
        <div>
          {/* <h3 className="text-xl font-bold mb-5">Search</h3> */}
          {/* <div className="flex mb-8">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#3d3a66] border border-[#4a4775] rounded-l-lg text-white placeholder-gray-400 outline-none focus:border-[#F43676] transition-colors"
            />
            <button className="px-4 py-3 bg-[#F43676] rounded-r-lg hover:bg-[#e02a60] transition-colors">
              <FaSearch className="text-white" />
            </button>
          </div> */}

          <h3 className="text-xl font-bold mb-4">About Sosign</h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            Sosign is a platform dedicated to empowering voices and creating meaningful change through petitions and campaigns that matter to communities worldwide.
          </p>

          {/* Social Media Buttons */}
          <div className="flex flex-wrap gap-2">
            <a
              href="https://www.facebook.com/sosign.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#3b5998] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FaFacebookF /> Facebook
            </a>
            <a
              href="https://x.com/sosign_in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#000000] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FaXTwitter /> X
            </a>
            <a
              href="http://t.me/sosign_in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FaTelegramPlane /> Telegram
            </a>
            <a
              href="https://www.instagram.com/sosign_in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#E4405F] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FaInstagram /> Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FaLinkedinIn /> LinkedIn
            </a>
            <a
              href="https://www.youtube.com/@sosign-in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FaYoutube /> YouTube
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#E60023] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FaPinterestP /> Pinterest
            </a>
          </div>
        </div>

        {/* Categories Section 1 */}
        <div>
          <h3 className="text-xl font-bold mb-5">Categories</h3>
          <ul className="space-y-3">
            {categories.map((category, index) => {
              // Convert category to slug (lowercase with underscores for spaces)
              const categorySlug = category.toLowerCase().replace(/\s+/g, '_');
              return (
                <li key={index}>
                  <Link
                    href={`/category/${categorySlug}`}
                    className="group flex items-center gap-2 text-gray-300 hover:text-[#F43676] transition-all duration-300 hover:translate-x-2"
                  >
                    <span className="w-2 h-2 bg-[#F43676] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {category}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Categories Section 2 */}
        <div>
          <h3 className="text-xl font-bold mb-5">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/about" className="group flex items-center gap-2 text-gray-300 hover:text-[#F43676] transition-all duration-300 hover:translate-x-2">
                <span className="w-2 h-2 bg-[#F43676] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/currentpetitions" className="group flex items-center gap-2 text-gray-300 hover:text-[#F43676] transition-all duration-300 hover:translate-x-2">
                <span className="w-2 h-2 bg-[#F43676] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Current Petitions
              </Link>
            </li>
            <li>
              <Link href="/successfulpetitions" className="group flex items-center gap-2 text-gray-300 hover:text-[#F43676] transition-all duration-300 hover:translate-x-2">
                <span className="w-2 h-2 bg-[#F43676] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Success Stories
              </Link>
            </li>
            <li>
              <Link href="/start-petition" className="group flex items-center gap-2 text-gray-300 hover:text-[#F43676] transition-all duration-300 hover:translate-x-2">
                <span className="w-2 h-2 bg-[#F43676] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Start a Petition
              </Link>
            </li>
            <li>
              <Link href="/blog" className="group flex items-center gap-2 text-gray-300 hover:text-[#F43676] transition-all duration-300 hover:translate-x-2">
                <span className="w-2 h-2 bg-[#F43676] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="group flex items-center gap-2 text-gray-300 hover:text-[#F43676] transition-all duration-300 hover:translate-x-2">
                <span className="w-2 h-2 bg-[#F43676] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="group flex items-center gap-2 text-gray-300 hover:text-[#F43676] transition-all duration-300 hover:translate-x-2">
                <span className="w-2 h-2 bg-[#F43676] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="group flex items-center gap-2 text-gray-300 hover:text-[#F43676] transition-all duration-300 hover:translate-x-2">
                <span className="w-2 h-2 bg-[#F43676] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Latest Petitions Section */}
        <div>
          <h3 className="text-xl font-bold mb-5">Latest Petitions</h3>

          <div className="space-y-4">
            {latestPetitions.length > 0 ? (
              latestPetitions.map((petition) => (
                <Link
                  key={petition._id}
                  href={`/currentpetitions/${petition.slug || petition._id}`}
                  className="flex gap-3 group"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-pink-100 to-gray-100">
                    {petition.petitionDetails?.image ? (
                      <img
                        src={petition.petitionDetails.image}
                        alt={petition.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white group-hover:text-[#F43676] transition-colors leading-tight mb-1 line-clamp-2">
                      {petition.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {petition.numberOfSignatures || 0} signatures
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(petition.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Loading latest petitions...</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Branding Section */}
      {/* <div className="border-t border-[#4a4775] py-6 text-center text-sm text-gray-400">
        <p>© 2025, <span className="font-semibold text-white">Sosign</span>. All rights reserved.</p>
        <p className="mt-2 text-xs">
          Developed by Haldar AI & IT.
        </p>
      </div> */}

      {/* Scroll to Top Button */}
      {/* <button
        onClick={scrollToTop}
        className="absolute bottom-6 right-6 w-10 h-10 bg-[#F43676] rounded-full flex items-center justify-center hover:bg-[#e02a60] transition-colors shadow-lg"
      >
        <FaArrowUp className="text-white text-sm" />
      </button> */}
    </footer>
  );
}
