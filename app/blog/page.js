"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaCalendarAlt, FaUser, FaArrowRight, FaChevronLeft, FaChevronRight, FaBookOpen, FaTags, FaFire, FaSpinner } from 'react-icons/fa';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featuredPost, setFeaturedPost] = useState(null);
  const postsPerPage = 6;

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        const res = await fetch(
          `${backendUrl}/api/blogs?page=${currentPage}&limit=${postsPerPage}${searchParam}`
        );

        if (!res.ok) throw new Error("Failed to fetch blogs");

        const data = await res.json();
        setPosts(data.blogs || []);
        setTotalPages(data.totalPages || 1);

        // Set featured post from first featured blog or first post
        if (currentPage === 1 && !searchQuery) {
          const featured = data.blogs?.find(blog => blog.isFeatured) || data.blogs?.[0];
          setFeaturedPost(featured);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchBlogs, 300);
    return () => clearTimeout(debounceTimer);
  }, [currentPage, searchQuery]);

  // Helper to strip HTML tags for clean text rendering
  const stripHtml = (txt) => (txt ? String(txt).replace(/<[^>]*>/g, "").trim() : "");

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get unique authors
  const uniqueAuthors = [...new Set(posts.map(post => post.author))];

  return (
    <section className="bg-[#f0f2f5] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-[#002050] to-[#1a3a6e] rounded-3xl p-8 md:p-12 mb-10 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F43676]/20 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F43676]/10 rounded-full translate-y-24 -translate-x-24 blur-2xl"></div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <FaBookOpen className="text-[#F43676]" />
              <span className="text-white/90 text-sm font-medium">Inspiring Stories & Updates</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Sosign <span className="text-[#F43676]">Blog</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Discover inspiring stories of change, learn about social movements, and stay updated on the causes that matter.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
            <span className="ml-3 text-lg text-gray-600">Loading blogs...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm mb-10">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-[#002050] mb-2">Unable to load blogs</h3>
            <p className="text-[#302d55]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#F43676] text-white rounded-full font-medium hover:bg-[#e02a60] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Featured Post */}
        {!loading && !error && featuredPost && currentPage === 1 && !searchQuery && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <FaFire className="text-[#F43676] text-xl" />
              <h2 className="text-2xl font-bold text-[#002050]">Featured Story</h2>
              <span className="w-2 h-2 bg-[#F43676] rounded-full animate-pulse"></span>
            </div>

            <Link href={`/blog/${featuredPost.slug}`} className="block group">
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="lg:w-3/5 relative overflow-hidden">
                    <div className="aspect-[16/10] lg:aspect-[16/9] relative">
                      {featuredPost.image ? (
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#F43676] to-[#002050] flex items-center justify-center">
                          <FaBookOpen className="text-white text-6xl opacity-50" />
                        </div>
                      )}
                    </div>
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    {/* Featured badge */}
                    <div className="absolute top-4 left-4 bg-[#F43676] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                      <FaFire className="text-yellow-300" />
                      Featured
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-2/5 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-[#F43676]" />
                        {formatDate(featuredPost.createdAt)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <FaUser className="text-[#F43676]" />
                        {featuredPost.author}
                      </span>
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-bold text-[#002050] mb-4 leading-tight group-hover:text-[#F43676] transition-colors" style={{ fontFamily: featuredPost.titleFont || "'Outfit', sans-serif" }}>
                      {stripHtml(featuredPost.title)}
                    </h3>

                    <p className="text-[#302d55] leading-relaxed mb-6 line-clamp-3">
                      {stripHtml(featuredPost.excerpt || featuredPost.content)?.substring(0, 200) + "..."}
                    </p>

                    <div className="flex items-center gap-2 text-[#F43676] font-semibold group-hover:gap-4 transition-all">
                      <span>Read Full Story</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-[#002050]">Latest Articles</h2>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <span className="text-sm text-[#302d55]">
                  {posts.length} articles found
                </span>
              </div>

              {/* Blog Posts Grid */}
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {posts.map((post) => (
                    <Link
                      key={post._id}
                      href={`/blog/${post.slug}`}
                      className="group"
                    >
                      <article className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        {/* Image */}
                        <div className="relative overflow-hidden">
                          <div className="aspect-[16/10] relative">
                            {post.image ? (
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#F43676] to-[#002050] flex items-center justify-center">
                                <FaBookOpen className="text-white text-4xl opacity-50" />
                              </div>
                            )}
                          </div>
                          {/* Date badge */}
                          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-[#002050] shadow-md">
                            {formatDate(post.createdAt)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-2 text-sm text-[#F43676] font-medium mb-3">
                            <FaUser className="text-xs" />
                            <span>{post.author}</span>
                          </div>

                          <h3 className="text-lg font-bold text-[#002050] mb-3 leading-tight group-hover:text-[#F43676] transition-colors line-clamp-2 flex-1" style={{ fontFamily: post.titleFont || "'Outfit', sans-serif" }}>
                            {stripHtml(post.title)}
                          </h3>

                          {(post.excerpt || post.content) && (
                            <p className="text-[#302d55] text-sm leading-relaxed mb-4 line-clamp-2">
                              {stripHtml(post.excerpt || post.content)?.substring(0, 150) + "..."}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[#F43676] text-sm font-semibold mt-auto">
                            <span>Read more</span>
                            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-[#002050] mb-2">No articles found</h3>
                  <p className="text-[#302d55]">
                    {searchQuery ? 'Try a different search term or browse all articles.' : 'No blog posts available yet.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-6 py-2 bg-[#F43676] text-white rounded-full font-medium hover:bg-[#e02a60] transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${currentPage === 1
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                      }`}
                  >
                    <FaChevronLeft className="text-sm" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full font-medium flex items-center justify-center transition-colors ${page === currentPage
                        ? 'bg-[#F43676] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${currentPage === totalPages
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                      }`}
                  >
                    <FaChevronRight className="text-sm" />
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-6">
              {/* Search Box */}
              {/* <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Search</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] focus:ring-2 focus:ring-[#F43676]/20 transition-all"
                  />
                  <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div> */}

              {/* About Blog */}
              <div className="bg-gradient-to-br from-[#002050] to-[#1a3a6e] rounded-3xl p-6 shadow-sm text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F43676]/20 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold">About Our Blog</h3>
                    <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                  </div>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Welcome to the Sosign Blog! Here we share inspiring stories, updates on successful petitions, and tips on how you can make a difference in your community.
                  </p>
                  {/* <Link
                    href="/start-petition"
                    className="inline-flex items-center gap-2 bg-[#F43676] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#e02a60] transition-colors"
                  >
                    <span>Start a Petition</span>
                    <FaArrowRight className="text-sm" />
                  </Link> */}
                </div>
              </div>

              {/* Recent Posts */}
              {posts.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold text-[#002050]">Recent Posts</h3>
                    <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                  </div>
                  <ul className="space-y-4">
                    {posts.slice(0, 5).map((post) => (
                      <li key={post._id} className="group">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="flex items-start gap-3 p-2 rounded-xl hover:bg-pink-50 transition-colors"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            {post.image ? (
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#F43676] to-[#002050] flex items-center justify-center">
                                <FaBookOpen className="text-white text-sm opacity-50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#002050] line-clamp-2 group-hover:text-[#F43676] transition-colors leading-tight">
                              {stripHtml(post.title)}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(post.createdAt)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Authors */}
              {uniqueAuthors.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold text-[#002050]">Contributors</h3>
                    <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueAuthors.map((author, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 text-[#302d55] rounded-full text-sm font-medium border border-pink-100 hover:border-[#F43676] hover:text-[#F43676] transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F43676] to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {author.charAt(0)}
                        </div>
                        {author}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags/Topics */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FaTags className="text-[#F43676]" />
                  <h3 className="text-xl font-bold text-[#002050]">Popular Topics</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Change', 'Inspiration', 'Stories', 'Community', 'Action', 'Hope', 'Voice', 'Impact'].map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 text-[#302d55] rounded-full text-sm font-medium hover:bg-[#F43676] hover:text-white transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Newsletter CTA */}
              {/* <div className="bg-gradient-to-br from-[#F43676] to-[#e02a60] rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Stay Updated!</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Get the latest stories and updates delivered straight to your inbox.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-block w-full text-center bg-white text-[#F43676] px-5 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Join Our Community
                  </Link>
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
