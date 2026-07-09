"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FaChevronRight, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaPinterestP, FaSearch, FaSpinner, FaCalendarAlt, FaUser, FaBookOpen, FaArrowLeft } from "react-icons/fa";
import Footer from "@/components/Footer";

// Categories
const categories = [
  "General",
  "Change",
  "Inspiration",
  "Stories",
  "Community",
  "Action",
  "Impact",
];

// Tags
const tags = [
  "Change",
  "Inspiration",
  "Stories",
  "Community",
  "Action",
  "Hope",
  "Voice",
  "Impact",
];

export default function BlogDetailClient({ initialBlog }) {
  const params = useParams();
  const [blog, setBlog] = useState(initialBlog);
  const [loading, setLoading] = useState(!initialBlog);
  const [error, setError] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch blog by slug
  useEffect(() => {
    const fetchBlog = async () => {
      if (initialBlog && blog && blog.slug === params.slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/blogs/${params.slug}`);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Blog not found");
          }
          throw new Error("Failed to fetch blog");
        }

        const data = await res.json();
        setBlog(data);
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug, initialBlog]);

  // Fetch recent blogs for sidebar
  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/blogs?limit=5`);

        if (res.ok) {
          const data = await res.json();
          setRecentBlogs(data.blogs || []);
        }
      } catch (err) {
        console.error("Error fetching recent blogs:", err);
      }
    };

    fetchRecentBlogs();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-[#F43676] mb-4" />
        <p className="text-gray-500 font-semibold">Loading article details...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-3xl max-w-md shadow-sm">
          <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-3"></i>
          <h2 className="text-xl font-bold mb-1">Article Unavailable</h2>
          <p className="text-sm text-red-600 mb-4">{error || "The requested blog post could not be found."}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-[#002050] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <FaArrowLeft /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="bg-gray-50 min-h-screen">
        {/* Breadcrumb section */}
        <section className="bg-[#002050] text-white py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <FaChevronRight className="text-[10px]" />
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <FaChevronRight className="text-[10px]" />
              <span className="text-[#F43676] truncate max-w-[200px] md:max-w-md">{blog.title}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {blog.title}
            </h1>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
                {/* Featured Image */}
                {blog.image && (
                  <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-inner">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-5">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-[#F43676]" />
                    <span className="font-semibold text-[#002050]">{blog.author || "SoSign Staff"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[#F43676]" />
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                  {blog.category && (
                    <div className="flex items-center gap-2">
                      <FaBookOpen className="text-[#F43676]" />
                      <span className="bg-pink-50 text-[#F43676] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                        {blog.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Article body */}
                <div
                  className="prose prose-pink max-w-none text-[#302d55] leading-relaxed text-base md:text-lg space-y-4 font-medium"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              {/* Search Widget */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F43676] transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>

              {/* Recent Articles */}
              {recentBlogs.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold text-[#002050]">Recent Posts</h3>
                    <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                  </div>
                  <ul className="space-y-4">
                    {recentBlogs.map((recentBlog) => (
                      <li key={recentBlog._id} className="group">
                        <Link
                          href={`/blog/${recentBlog.slug}`}
                          className="flex gap-3 items-center"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            {recentBlog.image ? (
                              <Image
                                src={recentBlog.image}
                                alt={recentBlog.title}
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
                              {recentBlog.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(recentBlog.createdAt)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Categories */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Categories</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <ul className="space-y-3">
                  {categories.map((category, index) => (
                    <li key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <Link
                        href={`/blog?category=${category.toLowerCase()}`}
                        className="text-gray-600 hover:text-[#F43676] transition-colors"
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Author Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100 bg-gradient-to-br from-[#F43676] to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {blog.author?.charAt(0).toUpperCase() || "S"}
                </div>
                <h4 className="text-xl font-bold text-[#002050] mb-2">{blog.author || "SoSign Staff"}</h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Author of this blog post. Thank you for reading!
                </p>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-[#002050]">Tags</h3>
                  <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 text-[#302d55] rounded-full text-sm font-medium hover:bg-[#F43676] hover:text-white transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
