"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaChevronRight, FaUser, FaEnvelope, FaBriefcase, FaPhone, FaCopy, FaEdit, FaQuoteLeft } from "react-icons/fa";
import { petitions as currentPetitions } from "../../components/CurrentPetitions";
import { successfulPetitions } from "../../components/SuccessfulPetitionsData";
import ProfileEditModal from "../../components/ProfileEditModal";
import PasswordModal from "../../components/PasswordModal";
import AadhaarKycSection from "../../components/AadhaarKycSection";
import { FaShieldAlt, FaKey } from "react-icons/fa";

const MyProfilePage = () => {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [userPetitions, setUserPetitions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Get the best available profile image
  const getProfileImageUrl = () => {
    if (user?.profilePicture) return user.profilePicture; // Cloudinary URL (uploaded)
    if (user?.photoURL) return user.photoURL; // Google photo
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=F43676&color=fff&size=200`;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      const allPetitions = [
        ...currentPetitions.map((p) => ({ ...p, type: "current" })),
        ...successfulPetitions.map((p) => ({ ...p, type: "successful" })),
      ];
      const createdPetitions = allPetitions.filter(
        (p) => p.creatorId === user._id
      );
      setUserPetitions(createdPetitions);
    }
  }, [user, loading, router]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex justify-center items-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex justify-center items-center">
        <div className="text-center text-red-500 text-xl">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navigation Banner */}
      <div className="bg-pink-100 border-b border-pink-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">My Profile</h1>
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#F43676] transition-colors">
              Home
            </Link>
            <FaChevronRight className="text-gray-400 text-xs" />
            <span className="text-[#1a1a2e] font-medium">My Profile</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 border border-pink-100">
            <div className="flex flex-col items-center gap-6">
              {/* Profile Image - Always show with fallback */}
              <div className="relative">
                <img
                  src={getProfileImageUrl()}
                  alt={user.name || "User Profile"}
                  width={140}
                  height={140}
                  className="w-[140px] h-[140px] rounded-full border-4 border-[#F43676] shadow-lg object-cover"
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-[#F43676] to-[#e02a60] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                  title="Edit Profile"
                >
                  <FaEdit className="text-white text-sm" />
                </button>
              </div>

              {/* User Name */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[#1a1a2e] mb-2">
                  {user.name || "Guest"}
                </h2>
                <p className="text-gray-500 text-sm">Member Profile</p>
              </div>

              {/* Bio Section */}
              <div className="w-full max-w-2xl p-4 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100">
                <div className="flex items-start gap-3">
                  <FaQuoteLeft className="text-[#F43676] text-lg flex-shrink-0 mt-1" />
                  {user.bio ? (
                    <p className="text-gray-600 italic leading-relaxed">{user.bio}</p>
                  ) : (
                    <p className="text-gray-400 italic leading-relaxed">Add your bio to tell others about yourself and your passion for change...</p>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="w-full max-w-2xl space-y-4 mt-4">
                {/* Email */}
                <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-xl border border-pink-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#F43676] to-[#e02a60] rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Email Address</p>
                    <p className="text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Designation */}
                <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-xl border border-pink-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#F43676] to-[#e02a60] rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaBriefcase className="text-white text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Designation</p>
                    {user.designation ? (
                      <p className="text-gray-600">{user.designation}</p>
                    ) : (
                      <p className="text-gray-400 italic">Not set - Add your role or profession</p>
                    )}
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-xl border border-pink-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#F43676] to-[#e02a60] rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-white text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Mobile Number</p>
                    {user.mobileNumber ? (
                      <p className="text-gray-600">{user.mobileNumber}</p>
                    ) : (
                      <p className="text-gray-400 italic">Not set - Add your contact number</p>
                    )}
                  </div>
                </div>

                {/* Unique Code */}
                {user.uniqueCode && (
                  <div className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-2xl border-2 border-pink-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#F43676] to-[#e02a60] rounded-lg flex items-center justify-center">
                        <FaCopy className="text-white text-sm" />
                      </div>
                      <p className="text-lg font-bold text-[#1a1a2e]">Your Unique Referral Code</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        value={user.uniqueCode}
                        readOnly
                        className="flex-1 p-4 border-2 border-pink-200 rounded-xl bg-white font-mono text-lg tracking-wider text-center font-bold text-[#F43676] focus:outline-none focus:border-[#F43676]"
                      />
                      <button
                        onClick={handleCopyCode}
                        className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                      >
                        <FaCopy />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Share this code with others. When they sign petitions using your code, you&apos;ll be credited!
                    </p>
                  </div>
                )}

                {/* Account Security Section */}
                <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full -z-0 opacity-50"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#1a1a2e] to-[#333] rounded-xl flex items-center justify-center">
                        <FaShieldAlt className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1a1a2e]">Account Security</h3>
                        <p className="text-xs text-gray-500">Manage your login credentials</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.hasPassword ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          <FaKey />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {user.hasPassword ? "Password Protected" : "No Password Set"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.hasPassword 
                              ? "You can login with your email and password." 
                              : "Logged in via Google. Create a password to login directly."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:border-[#F43676] hover:text-[#F43676] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {user.hasPassword ? "Change Password" : "Create Password"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Aadhaar KYC Section */}
                <AadhaarKycSection
                  user={user}
                  onKycSuccess={(kycData) => {
                    const updated = { ...user, aadhaarKyc: kycData };
                    setUser(updated);
                    localStorage.setItem("user", JSON.stringify(updated));
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6 justify-center">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-white border-2 border-[#F43676] text-[#F43676] px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <FaEdit />
                  Edit Profile
                </button>
                <Link href="/my-petition">
                  <button className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
                    View My Petitions
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default MyProfilePage;
