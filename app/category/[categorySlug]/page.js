"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FaChevronRight, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaPinterestP, FaSearch, FaCalendarAlt, FaPlay, FaPen, FaSpinner } from "react-icons/fa";
import { BadgeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProfileEditModal from "@/components/ProfileEditModal";

// Sample blog posts data with categories
const blogPosts = [
    {
        id: 1,
        slug: "discovering-hidden-mysteries-petra",
        title: "Discovering the Hidden Mysteries of Petra",
        description: "Its some of the time her conduct are placated. Do tuning in am enthusiasm gracious complaint collected. Together...",
        categories: ["Animals", "Lifestyle"],
        author: "nikkuramani",
        date: "February 26, 2024",
        image: "https://picsum.photos/seed/blog1/500/400",
        featured: true,
        hasVideo: false,
    },
    {
        id: 2,
        slug: "ai-from-pixels-to-art-headliners",
        title: "AI from pixels to art headliners",
        description: "The combination of craftsmanship and innovation has inspired transformative times in inventive planning. Manufactured Insights (AI) is at...",
        categories: ["Animals", "Technology"],
        author: "nikkuramani",
        date: "February 21, 2024",
        image: "https://picsum.photos/seed/blog7/500/400",
        featured: false,
        hasVideo: false,
    },
    {
        id: 3,
        slug: "creatures-that-charm-individuals",
        title: "Creatures that charm individuals with their insights",
        description: "Creatures never desist to flabbergast us with their...",
        categories: ["Animals", "Game"],
        author: "nikkuramani",
        date: "February 21, 2024",
        image: "https://picsum.photos/seed/blog8/500/400",
        featured: false,
        hasVideo: false,
    },
    {
        id: 4,
        slug: "top-luxury-ideas-high-end-home",
        title: "Top Luxury Ideas for High-End Home Exterior Decor",
        description: "Its some of the time her conduct are placated. Do tuning in am enthusiasm gracious complaint collected. Together...",
        categories: ["Interior", "Lifestyle"],
        author: "nikkuramani",
        date: "February 26, 2024",
        image: "https://picsum.photos/seed/blog2/500/400",
        featured: false,
        hasVideo: true,
    },
    {
        id: 5,
        slug: "leading-state-art-design-history",
        title: "Leading state of the art design history",
        description: "The world of advanced outline has come a long way, with a wealthy history that has changed the...",
        categories: ["Interior", "Lifestyle"],
        author: "nikkuramani",
        date: "February 23, 2024",
        image: "https://picsum.photos/seed/blog3/500/400",
        featured: false,
        hasVideo: true,
    },
    {
        id: 6,
        slug: "rapid-aircraft-interior-design",
        title: "Rapid Aircraft Interior Design via Renderings",
        description: "When it comes to insides plan, visualizing the ultimate result is vital. Renderings are important devices that permit...",
        categories: ["Lifestyle", "Technology"],
        author: "nikkuramani",
        date: "February 21, 2024",
        image: "https://picsum.photos/seed/blog4/500/400",
        featured: false,
        hasVideo: false,
    },
    {
        id: 7,
        slug: "top-color-palettes-graphic-design",
        title: "Top color palettes in graphic design",
        description: "Presenting children to the world of computerized craftsmanship and plan can be an energizing and fulfilling experience...",
        categories: ["Game", "Interior"],
        author: "nikkuramani",
        date: "February 21, 2024",
        image: "https://picsum.photos/seed/blog5/500/400",
        featured: false,
        hasVideo: true,
    },
];

// Recent posts will be fetched from API

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

export default function CategoryPage() {
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [showProfileModal, setShowProfileModal] = useState(false);
    const { user } = useAuth();

    // Get category name from slug
    const categorySlug = params.categorySlug;
    const categoryName = categorySlug
        ? categorySlug.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : "";

    // Fetch petitions by category
    const { data: petitions = [], isLoading: loading } = useQuery({
        queryKey: ["petitions", categorySlug, searchQuery],
        queryFn: async () => {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const category = categorySlug?.replace(/_/g, ' ');
            const response = await fetch(`${backendUrl}/api/petitions?category=${encodeURIComponent(category)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`);

            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return data.petitions || [];
        },
        enabled: !!categorySlug,
        staleTime: 60 * 1000,
    });

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();
        // The useQuery will trigger automatically when searchQuery changes
    };

    // Fetch recent petitions for sidebar (across all categories)
    const { data: recentPetitions = [] } = useQuery({
        queryKey: ["recentPetitions"],
        queryFn: async () => {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${backendUrl}/api/petitions?limit=5`);

            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return data.petitions || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    // Fetch recent comments from the logged-in user
    const { data: recentComments = [] } = useQuery({
        queryKey: ["recentComments", user?.uid || "guest"],
        queryFn: async () => {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const userInfo = JSON.parse(localStorage.getItem("user"));

            if (!userInfo || !userInfo.token) {
                return [];
            }

            const response = await fetch(
                `${backendUrl}/api/comments/user/recent?limit=4`,
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                }
            );

            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return data.comments || [];
        },
        enabled: !!user,
    });

    // Fetch active ads for sidebar
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

    // Fetch categories from API for sidebar
    const { data: sidebarCategories = [], isLoading: categoriesLoading } = useQuery({
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

    return (
        <>
            <main className="bg-[#f0f2f5] min-h-screen">
                {/* Header with Category Name */}
                <div className="bg-pink-100 border-b border-pink-200 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-[#1a1a2e]">{categoryName}</h1>
                        <nav className="flex items-center gap-2 text-sm text-gray-600">
                            <Link href="/" className="hover:text-[#F43676] transition-colors">
                                Home
                            </Link>
                            <FaChevronRight className="text-gray-400 text-xs" />
                            <span className="text-[#1a1a2e] font-medium">{categoryName}</span>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <section className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Main Content - Left Side */}
                            <div className="lg:w-2/3">
                                <div className="bg-white rounded-3xl p-6 shadow-sm">
                                    {loading ? (
                                        <div className="text-center py-12">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F43676] border-t-transparent"></div>
                                            <p className="text-gray-600 mt-4">Loading petitions...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {petitions.length > 0 ? (
                                                petitions.map((petition) => (
                                                    <div
                                                        key={petition._id}
                                                        className="relative bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                                    >
                                                        <Link href={`/currentpetitions/${petition.slug || petition._id}`} className="flex flex-col sm:flex-row items-center">
                                                            {/* Image */}
                                                            <div className="sm:w-2/5 relative sm:-ml-6 my-4 sm:my-6">
                                                                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-pink-100 to-gray-100">
                                                                    {petition.petitionDetails?.image ? (
                                                                        <img
                                                                            src={petition.petitionDetails.image}
                                                                            alt={petition.title}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-6xl">📝</div>
                                                                    )}
                                                                </div>
                                                                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                                    {petition.numberOfSignatures || 0} ✍️
                                                                </div>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="sm:w-3/5 p-6">
                                                                {/* Category Tag */}
                                                                {petition.category && (
                                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                                        <span className="px-3 py-1 bg-[#fce4ec] text-[#F43676] rounded-full text-xs font-medium">
                                                                            {petition.category.charAt(0).toUpperCase() + petition.category.slice(1)}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {/* Title */}
                                                                <h3 className="text-xl font-bold text-[#1a1a2e] mb-3 leading-tight hover:text-[#F43676] transition-colors flex items-center gap-2">
                                                                    {petition.title}
                                                                    {(petition.constituencySettings?.required || petition.signingRequirements?.constituency?.required || petition.signingRequirements?.aadhar?.required) && (
                                                                        <span title="Verification required to sign" className="flex-shrink-0">
                                                                            <BadgeCheck className="w-5 h-5 text-blue-500" />
                                                                        </span>
                                                                    )}
                                                                </h3>

                                                                {/* Description */}
                                                                <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-3">
                                                                    {petition.petitionDetails?.description || "No description available."}
                                                                </p>

                                                                {/* Author Info */}
                                                                <div className="flex items-center gap-3 text-sm">
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                                                        {petition.petitionStarter?.user?.photoURL ? (
                                                                            <img
                                                                                src={petition.petitionStarter.user.photoURL}
                                                                                alt={petition.petitionStarter.user.name || "User"}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                src={`https://ui-avatars.com/api/?name=${petition.petitionStarter?.user?.name || petition.petitionStarter?.name || "Anonymous"}&background=random&size=32`}
                                                                                alt="User"
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-700 font-medium">
                                                                            {petition.petitionStarter?.user?.name || petition.petitionStarter?.name || "Anonymous"}
                                                                        </p>
                                                                        <p className="text-gray-400 text-xs">
                                                                            {new Date(petition.createdAt).toLocaleDateString('en-US', {
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                year: 'numeric'
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-16">
                                                    <div className="w-24 h-24 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center">
                                                        <span className="text-5xl">📋</span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">No petitions found</h3>
                                                    <p className="text-gray-500 mb-6">There are currently no petitions in this category.</p>
                                                    <Link
                                                        href="/start-petition"
                                                        className="inline-block px-6 py-3 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-medium rounded-full hover:shadow-lg transition-shadow"
                                                    >
                                                        Start a Petition
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar - Right Side */}
                            <div className="lg:w-1/3 space-y-6">
                                {/* Search Box */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-xl font-bold text-[#1a1a2e]">Search</h3>
                                        <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                                    </div>
                                    <form onSubmit={handleSearch} className="flex">
                                        <input
                                            type="text"
                                            placeholder="Search in this category..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-l-lg outline-none focus:border-[#F43676] transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            className="px-5 py-3 bg-[#F43676] text-white rounded-r-lg hover:bg-[#e02a60] transition-colors"
                                        >
                                            <FaSearch />
                                        </button>
                                    </form>
                                </div>

                                {/* Recent Posts */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-xl font-bold text-[#1a1a2e]">Recent Petitions</h3>
                                        <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                                    </div>
                                    {recentPetitions.length > 0 ? (
                                        <ul className="space-y-3">
                                            {recentPetitions.map((petition) => (
                                                <li key={petition._id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                                    <Link
                                                        href={`/currentpetitions/${petition.slug || petition._id}`}
                                                        className="text-gray-600 hover:text-[#F43676] transition-colors text-sm leading-relaxed block"
                                                    >
                                                        {petition.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No recent petitions available.</p>
                                    )}
                                </div>

                                {/* Recent Comments */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-xl font-bold text-[#1a1a2e]">Recent Comments</h3>
                                        <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                                    </div>
                                    {user ? (
                                        recentComments.length > 0 ? (
                                            <ul className="space-y-3">
                                                {recentComments.map((comment, index) => (
                                                    <li key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                                        <Link
                                                            href={`/currentpetitions/${comment.petitionId}`}
                                                            className="block hover:bg-pink-50 p-2 rounded-lg transition-colors"
                                                        >
                                                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-1">
                                                                {comment.content}
                                                            </p>
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
                                            <p className="text-gray-500 text-sm">You haven&apos;t made any comments yet.</p>
                                        )
                                    ) : (
                                        <p className="text-gray-500 text-sm">
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
                                    <p className="text-gray-600">February 2024</p>
                                </div> */}

                                {/* Categories */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-xl font-bold text-[#1a1a2e]">Categories</h3>
                                        <span className="w-2 h-2 bg-[#F43676] rounded-full"></span>
                                    </div>
                                    {categoriesLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <FaSpinner className="animate-spin text-[#F43676]" />
                                        </div>
                                    ) : (
                                        <ul className="space-y-3">
                                            {sidebarCategories.map((category, index) => (
                                                <li key={category._id || index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                                    <Link
                                                        href={`/category/${category.slug}`}
                                                        className={`transition-colors ${category.slug === categorySlug
                                                            ? "text-[#F43676] font-medium"
                                                            : "text-gray-600 hover:text-[#F43676]"
                                                            }`}
                                                    >
                                                        {category.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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
                                        <h4 className="text-xl font-bold text-[#1a1a2e] mb-2">{user.name}</h4>
                                        {user.designation && (
                                            <p className="text-[#F43676] text-sm font-medium mb-2">{user.designation}</p>
                                        )}
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            {user.bio || "Click the edit button to add your bio!"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
                                        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100 bg-gradient-to-br from-pink-100 to-gray-100 flex items-center justify-center">
                                            <span className="text-4xl">👤</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-[#1a1a2e] mb-2">Welcome!</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                            Sign in to customize your profile.
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
                                        <h3 className="text-xl font-bold text-[#1a1a2e]">Tags</h3>
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
                                                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#F43676] hover:text-[#F43676] transition-colors"
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
                                        <h3 className="text-xl font-bold text-[#1a1a2e]">Ads</h3>
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
                                                            src={
                                                                (ad.image || ad.imageUrl)?.startsWith("http")
                                                                    ? (ad.image || ad.imageUrl)
                                                                    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${(ad.image || ad.imageUrl)?.replace(/\\/g, "/").replace(/^\//, "")}`
                                                            }
                                                            alt={ad.title || "Advertisement"}
                                                            className="w-full h-auto object-cover max-h-60"
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
                            </div>
                        </div >
                    </div >
                </section >
            </main >
            <ProfileEditModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </>
    );
}
