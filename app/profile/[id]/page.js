"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import LoginModal from "../../../components/LoginModal";
import config from "../../../config/api";
import {
  User,
  Users,
  CheckCircle,
  Calendar,
  Share2,
  UserPlus,
  UserCheck,
  FileText,
  Heart,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Loader2,
  Edit3
} from "lucide-react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa6";

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("petitions"); // "petitions" | "followers" | "following"
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if viewing own profile
  const isOwnProfile =
    currentUser &&
    profile &&
    (currentUser._id === profile._id || currentUser.uniqueCode === profile.uniqueCode);

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const userInfo = storedUser ? JSON.parse(storedUser) : null;
      const token = userInfo?.token;

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${config.API_BASE_URL}/api/users/public/${id}`, {
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load public profile");
      }

      setProfile(data);
      setIsFollowing(data.isFollowing || false);
      setFollowersCount(data.followersCount || 0);
      setFollowingCount(data.followingCount || 0);
    } catch (err) {
      console.error("Error fetching public profile:", err);
      setError(err.message || "Failed to load user profile");
    } fontally: {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    if (isOwnProfile) return;

    try {
      setFollowLoading(true);
      const storedUser = localStorage.getItem("user");
      const userInfo = storedUser ? JSON.parse(storedUser) : null;
      const token = userInfo?.token;

      const res = await fetch(`${config.API_BASE_URL}/api/users/${profile._id}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Action failed");
      }

      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount);

      // Update followers list locally
      if (data.isFollowing) {
        setProfile((prev) => ({
          ...prev,
          followers: [
            ...(prev.followers || []),
            {
              _id: currentUser._id,
              name: currentUser.name,
              profilePicture: currentUser.profilePicture,
              designation: currentUser.designation,
              uniqueCode: currentUser.uniqueCode,
            },
          ],
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          followers: (prev.followers || []).filter((f) => f._id !== currentUser._id),
        }));
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      alert(err.message || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (profile?.uniqueCode) {
      navigator.clipboard.writeText(profile.uniqueCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getProfileImageUrl = (userObj) => {
    if (userObj?.profilePicture) return userObj.profilePicture;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userObj?.name || "User"
    )}&background=F43676&color=fff&size=200`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center py-20">
        <Loader2 className="w-12 h-12 text-[#F43676] animate-spin mb-4" />
        <p className="text-gray-600 font-medium animate-pulse">Loading public profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-[#F43676]" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">User Profile Not Found</h2>
        <p className="text-gray-600 max-w-md mb-6">{error || "The user you are looking for does not exist or has been removed."}</p>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 bg-[#3650AD] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* 1. Header Banner */}
      <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#241738] to-[#3650AD] h-60 md:h-72 overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F43676_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-6 relative z-10">
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-4 sm:left-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      {/* 2. Main Content Card Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Profile Avatar */}
            <div className="relative shrink-0 -mt-16 md:-mt-20">
              <img
                src={getProfileImageUrl(profile)}
                alt={profile.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white shadow-2xl bg-white"
              />
              {profile.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white" title="Verified User">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* User Core Details */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      {profile.name}
                    </h1>
                    {profile.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified Citizen
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#F43676] mt-0.5">
                    {profile.designation || "Community Member"}
                  </p>
                </div>

                {/* Profile Actions (Follow / Share / Edit) */}
                <div className="flex items-center justify-center md:justify-end gap-3 flex-wrap shrink-0">
                  {isOwnProfile ? (
                    <Link
                      href="/my-profile"
                      className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm transition"
                    >
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </Link>
                  ) : (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-md ${
                        isFollowing
                          ? "bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-800 border border-slate-200"
                          : "bg-gradient-to-r from-[#F43676] to-[#e02b65] text-white hover:opacity-95 shadow-pink-200"
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" /> Follow User
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleShareProfile}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="Share Profile Link"
                  >
                    {copiedLink ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Unique Code Pill & Joined Date */}
              <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-slate-500 font-medium flex-wrap pt-1">
                {profile.uniqueCode && (
                  <div className="inline-flex items-center gap-1.5 bg-pink-50 text-[#F43676] px-3 py-1.5 rounded-lg border border-pink-100 font-bold">
                    <span>ID: #{profile.uniqueCode}</span>
                    <button onClick={handleCopyCode} className="hover:text-pink-800">
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {profile.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                  </div>
                )}
              </div>

              {/* Bio Quote */}
              {profile.bio && (
                <p className="text-slate-600 text-sm leading-relaxed pt-2 max-w-3xl">
                  &quot;{profile.bio}&quot;
                </p>
              )}

              {/* Social Links */}
              {profile.socialLinks && Object.values(profile.socialLinks).some((link) => link) && (
                <div className="flex items-center justify-center md:justify-start gap-3 pt-3">
                  {profile.socialLinks.facebook && (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                      <FaFacebook className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition">
                      <FaTwitter className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socialLinks.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-600 hover:text-white transition">
                      <FaInstagram className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-700 hover:text-white transition">
                      <FaLinkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socialLinks.youtube && (
                    <a href={profile.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition">
                      <FaYoutube className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-2xl md:text-3xl font-black text-slate-900">
                {(profile.stats?.totalPetitions || 0).toLocaleString()}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Petitions Created</p>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-2xl md:text-3xl font-black text-[#F43676]">
                {(profile.stats?.totalSignatures || 0).toLocaleString()}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Signatures Received</p>
            </div>

            <button
              onClick={() => setActiveTab("followers")}
              className={`p-4 rounded-2xl border text-center transition ${
                activeTab === "followers" ? "bg-pink-50 border-pink-200" : "bg-slate-50/80 border-slate-100 hover:bg-slate-100"
              }`}
            >
              <p className="text-2xl md:text-3xl font-black text-slate-900">
                {followersCount.toLocaleString()}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Followers</p>
            </button>

            <button
              onClick={() => setActiveTab("following")}
              className={`p-4 rounded-2xl border text-center transition ${
                activeTab === "following" ? "bg-pink-50 border-pink-200" : "bg-slate-50/80 border-slate-100 hover:bg-slate-100"
              }`}
            >
              <p className="text-2xl md:text-3xl font-black text-slate-900">
                {followingCount.toLocaleString()}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Following</p>
            </button>
          </div>
        </div>

        {/* 4. Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("petitions")}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition shrink-0 ${
              activeTab === "petitions"
                ? "border-[#F43676] text-[#F43676]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Petitions Created ({(profile.petitions || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("followers")}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition shrink-0 ${
              activeTab === "followers"
                ? "border-[#F43676] text-[#F43676]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Followers ({followersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("following")}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition shrink-0 ${
              activeTab === "following"
                ? "border-[#F43676] text-[#F43676]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Following ({followingCount})</span>
          </button>
        </div>

        {/* 5. Tab Content Sections */}
        {activeTab === "petitions" && (
          <div>
            {profile.petitions && profile.petitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.petitions.map((pet) => {
                  const image =
                    pet.petitionDetails?.image ||
                    (pet.petitionDetails?.images && pet.petitionDetails.images[0]) ||
                    "/og-image.png";
                  const goal = pet.goalSignatures || 1000;
                  const currentSigs = pet.numberOfSignatures || 0;
                  const progressPct = Math.min(100, Math.round((currentSigs / goal) * 100));

                  return (
                    <motion.div
                      key={pet._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all group"
                    >
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img
                          src={image}
                          alt={pet.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {pet.categories && pet.categories[0] && (
                          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                            {pet.categories[0]}
                          </span>
                        )}
                        <span className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-white ${
                          pet.status === "approved" ? "bg-green-600" : pet.status === "completed" ? "bg-blue-600" : "bg-amber-500"
                        }`}>
                          {pet.status || "Active"}
                        </span>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-[#F43676] transition-colors line-clamp-2">
                            {pet.title}
                          </h3>
                          {pet.petitionDetails?.problem && (
                            <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                              {pet.petitionDetails.problem.replace(/<[^>]*>/g, "")}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{currentSigs.toLocaleString()} signatures</span>
                            <span>{progressPct}% of {goal.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#F43676] to-[#3650AD] rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          <div className="pt-2 flex justify-end">
                            <Link
                              href={`/currentpetitions/${pet.slug}`}
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#F43676] hover:text-pink-700 transition"
                            >
                              <span>View Petition</span>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Petitions Created Yet</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                  {profile.name} has not started any public petitions on SoSign yet.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "followers" && (
          <div>
            {profile.followers && profile.followers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {profile.followers.map((fUser) => (
                  <div
                    key={fUser._id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getProfileImageUrl(fUser)}
                        alt={fUser.name}
                        className="w-12 h-12 rounded-full object-cover border border-pink-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{fUser.name}</p>
                        <p className="text-xs text-slate-500 truncate">{fUser.designation || "Citizen"}</p>
                      </div>
                    </div>
                    <Link
                      href={`/profile/${fUser._id}`}
                      className="text-xs font-bold text-[#3650AD] hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg shrink-0 transition"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Followers Yet</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                  Be the first to follow {profile.name} to receive updates on their petition causes!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "following" && (
          <div>
            {profile.following && profile.following.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {profile.following.map((fUser) => (
                  <div
                    key={fUser._id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getProfileImageUrl(fUser)}
                        alt={fUser.name}
                        className="w-12 h-12 rounded-full object-cover border border-pink-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{fUser.name}</p>
                        <p className="text-xs text-slate-500 truncate">{fUser.designation || "Citizen"}</p>
                      </div>
                    </div>
                    <Link
                      href={`/profile/${fUser._id}`}
                      className="text-xs font-bold text-[#3650AD] hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg shrink-0 transition"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Not Following Anyone Yet</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                  {profile.name} is not following any members yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Modal Prompt */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
