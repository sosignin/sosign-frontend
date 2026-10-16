"use client";

import { useState, useRef } from "react";
import { FaTimes, FaCamera, FaSpinner, FaPhone, FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn, FaCheck } from "react-icons/fa";
import { FaXTwitter, FaShieldHalved, FaDownload, FaTrashCan } from "react-icons/fa6";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Link from "next/link";

export default function ProfileEditModal({ isOpen, onClose }) {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [designation, setDesignation] = useState(user?.designation || "");
    const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || "");
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || "");
    const [isLoading, setIsLoading] = useState(false);
    const [profileConsent, setProfileConsent] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);

    // DPDP statutory rights states
    const [downloadingData, setDownloadingData] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    // OTP verification states
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpError, setOtpError] = useState("");

    // Check if mobile is already verified (signed up with mobile or mobileVerified flag)
    const isMobileVerified = (user?.mobileNumber && user?.mobileVerified) || (user?.mobileNumber && !user?.googleId);

    // Social links state
    const [socialLinks, setSocialLinks] = useState({
        facebook: user?.socialLinks?.facebook || "",
        twitter: user?.socialLinks?.twitter || "",
        linkedin: user?.socialLinks?.linkedin || "",
        instagram: user?.socialLinks?.instagram || "",
        youtube: user?.socialLinks?.youtube || "",
    });

    if (!isOpen) return null;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Send OTP
    const handleSendOtp = async () => {
        const cleanMobile = mobileNumber.replace(/\D/g, '');
        if (cleanMobile.length !== 10) {
            setOtpError("Please enter a valid 10-digit mobile number");
            return;
        }

        setSendingOtp(true);
        setOtpError("");

        try {
            const response = await axios.post(`${backendUrl}/api/otp/send`, {
                phoneNumber: cleanMobile
            });
            setSessionId(response.data.sessionId);
            setOtpSent(true);
            setOtpError("");
        } catch (error) {
            console.error("Error sending OTP:", error);
            setOtpError(error.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setSendingOtp(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setOtpError("Please enter a valid 6-digit OTP");
            return;
        }

        setVerifyingOtp(true);
        setOtpError("");

        try {
            await axios.post(`${backendUrl}/api/otp/verify`, {
                sessionId,
                otp
            });
            setPhoneVerified(true);
            setOtpError("");
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setOtpError(error.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setVerifyingOtp(false);
        }
    };

    // DPDP Section 11: Export Machine-Readable Personal Data
    const handleExportData = async () => {
        setDownloadingData(true);
        setError("");
        try {
            const token = user?.token;
            const res = await fetch(`${backendUrl}/api/users/export-my-data`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to export personal data.");
            }

            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sosign-personal-data-${user?.uniqueCode || "user"}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setSuccess("Your personal data archive has been downloaded successfully.");
        } catch (err) {
            console.error("Data export error:", err);
            setError(err.message || "Failed to export data archive.");
        } finally {
            setDownloadingData(false);
        }
    };

    // DPDP Section 12: Right to Erasure / Permanent Account Deletion
    const handleDeleteAccount = async () => {
        setDeletingAccount(true);
        setError("");
        try {
            const token = user?.token;
            const res = await fetch(`${backendUrl}/api/users/delete-account`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ confirmationPassword: deletePassword }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to process erasure request.");
            }

            if (typeof window !== "undefined") {
                localStorage.removeItem("user");
                window.location.href = "/?erased=true";
            }
        } catch (err) {
            console.error("Account deletion error:", err);
            setError(err.message || "Failed to delete account. Please try again.");
            setDeletingAccount(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Image size should be less than 2MB");
                return;
            }
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError("");
        }
    };

    const handleSocialLinkChange = (platform, value) => {
        setSocialLinks(prev => ({
            ...prev,
            [platform]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profileConsent) {
            setError("Please consent to the processing of your updated profile data in accordance with the DPDP Act 2023.");
            return;
        }
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("bio", bio);
            formData.append("designation", designation);

            // Include mobile number and verification status
            if (phoneVerified) {
                formData.append("mobileNumber", mobileNumber);
                formData.append("mobileVerified", "true");
            } else if (!isMobileVerified) {
                // Only update mobile if user hasn't verified yet and hasn't just verified
                formData.append("mobileNumber", mobileNumber);
            }

            formData.append("socialLinks", JSON.stringify(socialLinks));
            if (profilePicture) {
                formData.append("profilePicture", profilePicture);
            }

            await updateProfile(formData);
            setSuccess("Profile updated successfully!");
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const getAvatarUrl = () => {
        if (previewUrl) return previewUrl;
        if (user?.photoURL) return user.photoURL;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random&size=200`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-[#002050]">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <FaTimes className="text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                                <img
                                    src={getAvatarUrl()}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-10 h-10 bg-[#F43676] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#e02a60] transition-colors"
                            >
                                <FaCamera />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Click camera to change photo (max 2MB)</p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-[#002050] mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] transition-colors"
                            placeholder="Your name"
                        />
                    </div>

                    {/* Designation */}
                    <div>
                        <label className="block text-sm font-semibold text-[#002050] mb-2">
                            Designation
                        </label>
                        <input
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] transition-colors"
                            placeholder="e.g., Activist, Student, Professional"
                        />
                    </div>

                    {/* Mobile Number with OTP */}
                    <div>
                        <label className="block text-sm font-semibold text-[#002050] mb-2">
                            Mobile Number
                        </label>

                        {/* If already verified, show read-only */}
                        {isMobileVerified ? (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center flex-1 px-4 py-3 border border-green-200 rounded-xl bg-green-50">
                                    <FaPhone className="text-green-500 mr-3" />
                                    <span className="text-gray-500 mr-1">+91</span>
                                    <span className="font-medium text-gray-700">{user?.mobileNumber}</span>
                                </div>
                                <div className="flex items-center px-3 py-3 text-green-600 bg-green-50 rounded-xl border border-green-200">
                                    <FaCheck className="text-sm mr-1" />
                                    <span className="text-sm font-medium">Verified</span>
                                </div>
                            </div>
                        ) : phoneVerified ? (
                            /* Just verified in this session */
                            <div className="flex items-center gap-2">
                                <div className="flex items-center flex-1 px-4 py-3 border border-green-200 rounded-xl bg-green-50">
                                    <FaPhone className="text-green-500 mr-3" />
                                    <span className="text-gray-500 mr-1">+91</span>
                                    <span className="font-medium text-gray-700">{mobileNumber}</span>
                                </div>
                                <div className="flex items-center px-3 py-3 text-green-600 bg-green-50 rounded-xl border border-green-200">
                                    <FaCheck className="text-sm mr-1" />
                                    <span className="text-sm font-medium">Verified</span>
                                </div>
                            </div>
                        ) : !otpSent ? (
                            /* Input for mobile with Send OTP */
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <div className="flex items-center px-3 border border-gray-200 rounded-l-xl bg-gray-50 text-gray-600 font-medium">
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setMobileNumber(value);
                                        }}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl outline-none focus:border-[#F43676] transition-colors"
                                        placeholder="Enter 10-digit number"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp || mobileNumber.length !== 10}
                                        className="px-4 py-3 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {sendingOtp ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            'Send OTP'
                                        )}
                                    </button>
                                </div>
                                {otpError && (
                                    <p className="text-red-500 text-sm">{otpError}</p>
                                )}
                            </div>
                        ) : (
                            /* OTP Input Form */
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">OTP sent to +91 {mobileNumber}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOtpSent(false);
                                            setOtp("");
                                            setOtpError("");
                                        }}
                                        className="text-[#F43676] hover:underline text-xs"
                                    >
                                        Change Number
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setOtp(value);
                                        }}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] transition-colors tracking-widest text-center font-mono font-bold"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={verifyingOtp || otp.length !== 6}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {verifyingOtp ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            'Verify'
                                        )}
                                    </button>
                                </div>
                                {otpError && (
                                    <p className="text-red-500 text-sm">{otpError}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-semibold text-[#002050] mb-2">
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] transition-colors resize-none"
                            placeholder="Tell others about yourself..."
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/500</p>
                    </div>

                    {/* Social Links */}
                    <div>
                        <label className="block text-sm font-semibold text-[#002050] mb-2">
                            Social Profiles
                        </label>
                        <div className="space-y-3">
                            {/* Facebook */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                                    <FaFacebookF className="text-white text-xs" />
                                </div>
                                <input
                                    type="url"
                                    value={socialLinks.facebook}
                                    onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                                    className="w-full pl-16 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] transition-colors"
                                    placeholder="Facebook profile URL"
                                />
                            </div>

                            {/* Twitter/X */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                    <FaXTwitter className="text-white text-xs" />
                                </div>
                                <input
                                    type="url"
                                    value={socialLinks.twitter}
                                    onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                                    className="w-full pl-16 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] transition-colors"
                                    placeholder="Twitter/X profile URL"
                                />
                            </div>

                            {/* LinkedIn */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center">
                                    <FaLinkedinIn className="text-white text-xs" />
                                </div>
                                <input
                                    type="url"
                                    value={socialLinks.linkedin}
                                    onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                                    className="w-full pl-16 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] transition-colors"
                                    placeholder="LinkedIn profile URL"
                                />
                            </div>

                            {/* Instagram */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center">
                                    <FaInstagram className="text-white text-xs" />
                                </div>
                                <input
                                    type="url"
                                    value={socialLinks.instagram}
                                    onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                                    className="w-full pl-16 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] transition-colors"
                                    placeholder="Instagram profile URL"
                                />
                            </div>

                            {/* YouTube */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center">
                                    <FaYoutube className="text-white text-xs" />
                                </div>
                                <input
                                    type="url"
                                    value={socialLinks.youtube}
                                    onChange={(e) => handleSocialLinkChange("youtube", e.target.value)}
                                    className="w-full pl-16 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#F43676] transition-colors"
                                    placeholder="YouTube channel URL"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DPDP Act 2023: Citizen Data Protection & Statutory Rights Section */}
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#002050] flex items-center gap-1.5 uppercase tracking-wider">
                                <FaShieldHalved className="text-[#3650AD]" />
                                Data Privacy & DPDP Rights (Act, 2023)
                            </span>
                            <Link href="/privacy" target="_blank" className="text-[11px] text-[#3650AD] underline font-semibold">
                                View Policy
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {/* Right to Access */}
                            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between gap-2">
                                <div>
                                    <span className="font-bold text-slate-800 text-xs block">Right to Access (Sec 11)</span>
                                    <span className="text-[11px] text-slate-500">Download your personal data archive (JSON)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleExportData}
                                    disabled={downloadingData}
                                    className="px-3 py-1.5 bg-[#3650AD] text-white rounded-lg text-xs font-semibold hover:bg-[#2b4191] transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                                >
                                    {downloadingData ? <FaSpinner className="animate-spin text-xs" /> : <FaDownload className="text-xs" />}
                                    Download
                                </button>
                            </div>

                            {/* Right to Erasure */}
                            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between gap-2">
                                <div>
                                    <span className="font-bold text-rose-900 text-xs block">Right to Erasure (Sec 12)</span>
                                    <span className="text-[11px] text-rose-600">Permanently delete account & personal data</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition flex items-center gap-1.5 shrink-0"
                                >
                                    <FaTrashCan className="text-xs" />
                                    Erase Data
                                </button>
                            </div>
                        </div>

                        {/* Delete Confirmation Sub-modal */}
                        {showDeleteConfirm && (
                            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl space-y-3 text-xs text-rose-950">
                                <span className="font-bold block text-sm text-rose-900">Are you absolutely sure?</span>
                                <p className="leading-relaxed">
                                    Under the Digital Personal Data Protection Act, this will permanently purge your profile, wallet, and unlink your identity from all signed petitions. This action cannot be reversed.
                                </p>
                                {user?.hasPassword && (
                                    <div>
                                        <label className="block text-[11px] font-bold mb-1">Enter your password to confirm:</label>
                                        <input
                                            type="password"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            placeholder="Your current password"
                                            className="w-full p-2 bg-white border border-rose-300 rounded-lg outline-none text-xs"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        disabled={deletingAccount}
                                        className="px-4 py-2 bg-rose-700 text-white rounded-lg font-bold hover:bg-rose-800 transition disabled:opacity-50"
                                    >
                                        {deletingAccount ? "Erasing..." : "Yes, Erase My Account"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-3 py-2 bg-white text-slate-700 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                            {success}
                        </div>
                    )}

                    {/* DPDP Profile Update Consent Checkbox */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-snug">
                            <input
                                type="checkbox"
                                required
                                checked={profileConsent}
                                onChange={(e) => setProfileConsent(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#F43676] focus:ring-[#F43676] cursor-pointer shrink-0"
                            />
                            <span>
                                I hereby consent to <strong>LEO MEO IT Solution (SoSign)</strong> updating and processing my personal profile information in accordance with Section 6 &amp; Section 12 of the DPDP Act 2023 and the{" "}
                                <Link href="/privacy" target="_blank" className="text-[#3650AD] underline font-semibold hover:text-[#283c82]">
                                    Privacy Policy
                                </Link>.
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !profileConsent}
                        className="w-full py-4 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-semibold rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
