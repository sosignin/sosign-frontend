"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
import LoginModal from "../../../components/LoginModal";
import CommentsSection from "../../../components/CommentsSection";
import Captcha from "../../../components/Captcha";
import {
    FileText,
    Users,
    AlertTriangle,
    Lightbulb,
    Globe,
    PenTool,
    Video,
    BarChart3,
    Share2,
    Download,
    Check,
    CheckCircle,
    X,
    XCircle,
    Clock,
    Edit3,
    Copy,
    Mail,
    Calendar,
    RefreshCw,
    ImageIcon,
    MapPin
} from "lucide-react";

export default function PetitionDetailClient({ initialPetition }) {
    const { slug } = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [petition, setPetition] = useState(initialPetition || null);
    const [loading, setLoading] = useState(!initialPetition);
    const [error, setError] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [signing, setSigning] = useState(false);
    const [signError, setSignError] = useState(null);
    const [signSuccess, setSignSuccess] = useState(false);
    const [referralCode, setReferralCode] = useState("");
    const [constituencyNumber, setConstituencyNumber] = useState("");
    const [aadharNumber, setAadharNumber] = useState("");

    // CAPTCHA state
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);
    const [signatureStatus, setSignatureStatus] = useState({
        hasSigned: false,
        isCreator: false,
        canSign: false,
        loading: true,
    });

    // Download request states
    const [downloadStatus, setDownloadStatus] = useState({
        hasRequest: false,
        status: null,
        canRequest: true,
        canDownload: false,
        loading: true,
        requestedFields: [],
        approvedFields: [],
    });
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadReason, setDownloadReason] = useState("");
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [requestedFields, setRequestedFields] = useState([]);
    const [availableFields, setAvailableFields] = useState([]);

    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Only fetch if we don't have initial petition data
        if (initialPetition) {
            setLoading(false);
            return;
        }

        const fetchPetition = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/petitions/${slug}`);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                setPetition(data);
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch petition:", err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPetition();
        }
    }, [slug, initialPetition]);

    // Prefill referral code from URL
    useEffect(() => {
        const code = searchParams?.get("code") || searchParams?.get("ref");
        if (code) setReferralCode(code.toUpperCase());
    }, [searchParams]);

    // Handle hash navigation to comments section
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#comments") {
            const timer = setTimeout(() => {
                const commentsElement = document.getElementById("comments");
                if (commentsElement) {
                    commentsElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [petition]);

    // Check signature status when user or petition changes
    useEffect(() => {
        const checkSignatureStatus = async () => {
            if (!user || !petition || !petition._id) {
                setSignatureStatus((prev) => ({ ...prev, loading: false }));
                return;
            }

            try {
                setSignatureStatus((prev) => ({ ...prev, loading: true }));
                const userInfo = JSON.parse(localStorage.getItem("user"));
                const response = await fetch(
                    `/api/petitions/${petition._id}/check-signature`,
                    {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setSignatureStatus({
                        hasSigned: data.hasSigned,
                        isCreator: data.isCreator,
                        canSign: data.canSign,
                        loading: false,
                    });
                } else {
                    setSignatureStatus((prev) => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error("Failed to check signature status:", error);
                setSignatureStatus((prev) => ({ ...prev, loading: false }));
            }
        };

        checkSignatureStatus();
    }, [user, petition]);

    // Check download request status
    useEffect(() => {
        const checkDownloadStatus = async () => {
            if (!user || !petition || !petition._id) {
                setDownloadStatus((prev) => ({ ...prev, loading: false }));
                return;
            }

            try {
                setDownloadStatus((prev) => ({ ...prev, loading: true }));
                const userInfo = JSON.parse(localStorage.getItem("user"));
                const response = await fetch(
                    `/api/download-requests/check/${petition._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setDownloadStatus({
                        hasRequest: data.hasRequest,
                        status: data.status,
                        canRequest: data.canRequest,
                        canDownload: data.canDownload,
                        loading: false,
                        requestedFields: data.requestedFields || [],
                        approvedFields: data.approvedFields || [],
                    });
                    if (data.availableFields) {
                        setAvailableFields(data.availableFields);
                        if (!data.hasRequest || data.canRequest) {
                            setRequestedFields(data.availableFields);
                        }
                    }
                } else {
                    setDownloadStatus((prev) => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error("Failed to check download status:", error);
                setDownloadStatus((prev) => ({ ...prev, loading: false }));
            }
        };

        checkDownloadStatus();
    }, [user, petition]);

    // Handle download request
    const handleRequestDownload = async () => {
        if (!user) {
            router.push(`/login?redirect=${pathname}`);
            return;
        }

        if (!downloadReason.trim()) {
            setDownloadError("Please provide a reason for your download request.");
            return;
        }

        if (requestedFields.length === 0) {
            setDownloadError("Please select at least one data field to request.");
            return;
        }

        try {
            setDownloadLoading(true);
            setDownloadError(null);

            const userInfo = JSON.parse(localStorage.getItem("user"));
            const response = await fetch("/api/download-requests", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    petitionId: petition._id,
                    reason: downloadReason.trim(),
                    requestedFields: requestedFields,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit download request");
            }

            setDownloadSuccess(true);
            setDownloadStatus({
                hasRequest: true,
                status: "pending",
                canRequest: false,
                canDownload: false,
                loading: false,
                requestedFields: requestedFields,
                approvedFields: [],
            });
            setShowDownloadModal(false);
            setDownloadReason("");

            setTimeout(() => setDownloadSuccess(false), 5000);
        } catch (err) {
            setDownloadError(err.message);
        } finally {
            setDownloadLoading(false);
        }
    };

    // Handle actual download
    const handleDownloadPetition = async () => {
        try {
            setDownloadLoading(true);
            setDownloadError(null);

            const userInfo = JSON.parse(localStorage.getItem("user"));
            const response = await fetch(
                `/api/download-requests/download/${petition._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to download petition data");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `petition-${petition._id}-data.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setDownloadError(err.message);
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleSignPetition = async () => {
        if (!user) {
            router.push(`/login?redirect=${pathname}`);
            return;
        }

        // Validate CAPTCHA
        if (!captchaVerified) {
            setSignError("Please complete the security verification");
            return;
        }

        // Validate constituency number if required
        if (petition.constituencySettings?.required) {
            if (!constituencyNumber.trim()) {
                setSignError("Please enter your constituency number");
                return;
            }
            // Check if specific constituency is required
            if (petition.constituencySettings.allowedConstituency) {
                if (constituencyNumber.trim() !== petition.constituencySettings.allowedConstituency) {
                    setSignError(`This petition is restricted to constituency: ${petition.constituencySettings.allowedConstituency}`);
                    return;
                }
            }
        }

        try {
            setSigning(true);
            setSignError(null);
            setSignSuccess(false);

            const userInfo = JSON.parse(localStorage.getItem("user"));
            const response = await fetch(`/api/petitions/${petition._id}/sign`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    referralCode: referralCode?.trim() || undefined,
                    constituencyNumber: constituencyNumber?.trim() || undefined,
                    aadharNumber: aadharNumber?.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to sign petition");
            }

            setPetition((prev) => ({
                ...prev,
                numberOfSignatures: data.numberOfSignatures,
            }));

            setSignatureStatus((prev) => ({
                ...prev,
                hasSigned: true,
                canSign: false,
            }));

            setSignSuccess(true);
            setTimeout(() => setSignSuccess(false), 3000);
        } catch (err) {
            setSignError(err.message);
            console.error("Failed to sign petition:", err);
            // Reset CAPTCHA on error
            setCaptchaVerified(false);
            setCaptchaResetTrigger(prev => prev + 1);
        } finally {
            setSigning(false);
        }
    };

    const handleLoginModalClose = () => {
        setShowLoginModal(false);
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-600">Loading petition...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500">Error loading petition: {error}</p>
            </div>
        );
    }

    if (!petition) {
        return (
            <div className="text-center py-20 text-gray-500">Petition not found</div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f2f5] py-8 px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Heading Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8"
                >
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center text-[#1a1a2e] leading-tight">
                        {petition.title}
                    </h1>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:w-3/5 flex-shrink-0"
                    >
                        <div className="bg-white rounded-2xl shadow-lg p-4 h-full">
                            {petition.petitionDetails?.image ? (
                                <Image
                                    src={petition.petitionDetails.image}
                                    alt={petition.title}
                                    width={1200}
                                    height={675}
                                    className="w-full h-auto object-contain rounded-xl"
                                />
                            ) : (
                                <div className="w-full aspect-video bg-gradient-to-br from-[#3650AD]/10 to-[#F43676]/10 rounded-xl flex items-center justify-center">
                                    <div className="text-[#1a1a2e] text-center">
                                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-[#3650AD]/50" strokeWidth={1.5} />
                                        <p className="text-lg font-medium text-gray-500">No Image Available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Side - Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:w-2/5 flex flex-col gap-6"
                    >
                        {/* Total Signatures */}
                        <div className="bg-gradient-to-r from-[#3650AD] to-[#F43676] text-white rounded-2xl p-6 text-center shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
                            <p className="text-lg font-medium opacity-90">Total Signatures</p>
                            <p className="text-4xl font-bold mt-1">
                                {petition.numberOfSignatures || 0}
                            </p>
                        </div>

                        {/* Sign This Petition Form */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
                            <h2 className="text-xl font-bold text-[#1a1a2e]">Sign this Petition</h2>

                            {signSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Petition signed successfully!</p>
                                        <p className="text-sm text-green-600">Thank you for your support.</p>
                                    </div>
                                </div>
                            )}

                            {signError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    <p className="font-medium">Error: {signError}</p>
                                </div>
                            )}

                            {!user ? (
                                <div className="text-center space-y-4">
                                    <p className="text-gray-600">
                                        You need to be logged in to sign this petition.
                                    </p>
                                    <Link
                                        href={`/login?redirect=${pathname}`}
                                        className="bg-[#3650AD] text-white w-full py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 transform hover:-translate-y-0.5 text-center block"
                                    >
                                        Login to Sign Petition
                                    </Link>
                                </div>
                            ) : signatureStatus.loading ? (
                                <div className="text-center">
                                    <p className="text-gray-600">Checking signature status...</p>
                                </div>
                            ) : signatureStatus.isCreator ? (
                                <div className="text-center space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3 text-left">
                                        <Edit3 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-blue-800 font-semibold">
                                                This is your petition
                                            </p>
                                            <p className="text-blue-600 text-sm">
                                                You cannot sign your own petition.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : signatureStatus.hasSigned ? (
                                <div className="text-center space-y-4">
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start gap-3 text-left">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-green-800 font-semibold">
                                                You have signed this petition
                                            </p>
                                            <p className="text-green-600 text-sm">
                                                Thank you for your support!
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Signed as:</p>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Signing as:</p>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-left text-sm font-medium text-gray-700 mb-1">
                                            Referral Code (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={referralCode}
                                            onChange={(e) =>
                                                setReferralCode(e.target.value.toUpperCase())
                                            }
                                            placeholder="Enter a friend's code"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            maxLength={12}
                                        />
                                    </div>
                                    {/* Constituency Number (if required) */}
                                    {petition.constituencySettings?.required && (
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                            <label className="block text-left text-sm font-medium text-gray-700 mb-1">
                                                Constituency Number <span className="text-red-500">*</span>
                                                {petition.constituencySettings.allowedConstituency && (
                                                    <span className="text-orange-600 ml-2">
                                                        (Must be: {petition.constituencySettings.allowedConstituency})
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                value={constituencyNumber}
                                                onChange={(e) => setConstituencyNumber(e.target.value)}
                                                placeholder={petition.constituencySettings.allowedConstituency
                                                    ? `Enter: ${petition.constituencySettings.allowedConstituency}`
                                                    : "Enter your constituency number"
                                                }
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                maxLength={10}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                This petition requires your constituency number to sign.
                                            </p>
                                        </div>
                                    )}

                                    {/* Signing Requirements - Constituency or Aadhar (new structure) */}
                                    {petition.signingRequirements?.constituency?.required && (
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                            <label className="block text-left text-sm font-medium text-gray-700 mb-1">
                                                Constituency Number <span className="text-red-500">*</span>
                                                {petition.signingRequirements.constituency.allowedConstituency && (
                                                    <span className="text-orange-600 ml-2">
                                                        (Must be: {petition.signingRequirements.constituency.allowedConstituency})
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                value={constituencyNumber}
                                                onChange={(e) => setConstituencyNumber(e.target.value)}
                                                placeholder={petition.signingRequirements.constituency.allowedConstituency
                                                    ? `Enter: ${petition.signingRequirements.constituency.allowedConstituency}`
                                                    : "Enter your constituency number"
                                                }
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                maxLength={10}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                This petition requires your constituency number to sign.
                                            </p>
                                        </div>
                                    )}

                                    {/* Aadhar Number (if required) */}
                                    {petition.signingRequirements?.aadhar?.required && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <label className="block text-left text-sm font-medium text-gray-700 mb-1">
                                                Aadhar Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={aadharNumber}
                                                onChange={(e) => {
                                                    // Allow only numbers and spaces
                                                    const value = e.target.value.replace(/[^\d\s]/g, '');
                                                    setAadharNumber(value);
                                                }}
                                                placeholder="Enter your 12-digit Aadhar number"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                maxLength={16}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                This petition requires your Aadhar number to sign. (12 digits)
                                            </p>
                                        </div>
                                    )}
                                    {/* CAPTCHA Section */}
                                    <Captcha
                                        onVerify={(verified) => setCaptchaVerified(verified)}
                                        resetTrigger={captchaResetTrigger}
                                    />
                                    <button
                                        onClick={handleSignPetition}
                                        disabled={signing || !signatureStatus.canSign || !captchaVerified ||
                                            (petition.constituencySettings?.required && !constituencyNumber.trim()) ||
                                            (petition.signingRequirements?.constituency?.required && !constituencyNumber.trim()) ||
                                            (petition.signingRequirements?.aadhar?.required && !aadharNumber.trim())
                                        }
                                        className="bg-[#3650AD] text-white w-full py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {signing ? "Signing..." : "Sign Petition"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Additional Petition Details */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Decision Makers */}
                    {petition.decisionMakers && petition.decisionMakers.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F43676]/10 to-[#F43676]/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-[#F43676]" />
                                </div>
                                <p className="font-bold text-[#1a1a2e]">Decision Makers</p>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                {petition.decisionMakers.map((dm) => dm.name || dm).join(", ")}
                            </p>
                        </div>
                    )}

                    {/* Problem */}
                    {petition.petitionDetails?.problem && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                </div>
                                <p className="font-bold text-[#1a1a2e]">Problem</p>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{petition.petitionDetails.problem}</p>
                        </div>
                    )}

                    {/* Solution */}
                    {petition.petitionDetails?.solution && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5 text-emerald-500" />
                                </div>
                                <p className="font-bold text-[#1a1a2e]">Solution</p>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{petition.petitionDetails.solution}</p>
                        </div>
                    )}

                    {/* Country */}
                    {petition.country && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/20 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-blue-500" />
                                </div>
                                <p className="font-bold text-[#1a1a2e]">Country</p>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{petition.country}</p>
                        </div>
                    )}

                    {/* Constituency Details */}
                    {(petition.constituencySettings?.allowedConstituency ||
                        petition.signingRequirements?.constituency?.allowedConstituency ||
                        petition.petitionStarter?.mpConstituencyNumber ||
                        petition.petitionStarter?.mlaConstituencyNumber) && (
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-500/20 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <p className="font-bold text-[#1a1a2e]">Constituency Details</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(petition.constituencySettings?.allowedConstituency || petition.signingRequirements?.constituency?.allowedConstituency) && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Target Constituency</p>
                                            <p className="text-gray-900 font-bold">
                                                {petition.constituencySettings?.allowedConstituency || petition.signingRequirements?.constituency?.allowedConstituency}
                                            </p>
                                        </div>
                                    )}
                                    {petition.petitionStarter?.mpConstituencyNumber && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Starter MP Constituency</p>
                                            <p className="text-gray-900 font-semibold">{petition.petitionStarter.mpConstituencyNumber}</p>
                                        </div>
                                    )}
                                    {petition.petitionStarter?.mlaConstituencyNumber && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Starter MLA Constituency</p>
                                            <p className="text-gray-900 font-semibold">{petition.petitionStarter.mlaConstituencyNumber}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Petition Starter */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/20 flex items-center justify-center">
                                <PenTool className="w-5 h-5 text-purple-500" />
                            </div>
                            <p className="font-bold text-[#1a1a2e]">Petition Starter</p>
                        </div>
                        <p className="text-gray-700 font-medium">
                            {petition.petitionStarter?.user?.name ||
                                petition.petitionStarter?.name ||
                                "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">
                            {petition.petitionStarter?.user?.designation ||
                                petition.petitionStarter?.designation ||
                                "Citizen"}
                        </p>
                        {petition.petitionStarter?.user?.email && (
                            <p className="text-sm text-gray-500">
                                {petition.petitionStarter.user.email}
                            </p>
                        )}
                    </div>

                    {/* Video URL */}
                    {petition.petitionDetails?.videoUrl && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/20 flex items-center justify-center">
                                    <Video className="w-5 h-5 text-red-500" />
                                </div>
                                <p className="font-bold text-[#1a1a2e]">Video</p>
                            </div>
                            <a
                                href={petition.petitionDetails.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#3650AD] hover:text-[#F43676] font-medium transition-colors"
                            >
                                <span>Watch Video</span>
                                <Video className="w-4 h-4" />
                            </a>
                        </div>
                    )}

                    {/* Petition Updates & Supporters */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-500/20 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-indigo-500" />
                            </div>
                            <p className="font-bold text-[#1a1a2e]">Statistics</p>
                        </div>
                        <div className="space-y-3 text-gray-600">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Users className="w-4 h-4 text-[#3650AD]" />
                                <span className="font-medium">Total Supporters:</span>
                                <span className="ml-auto font-semibold text-[#1a1a2e]">{petition.numberOfSignatures || 0}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-4 h-4 text-[#3650AD]" />
                                <span className="font-medium">Started:</span>
                                <span className="ml-auto text-[#1a1a2e]">{new Date(petition.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <RefreshCw className="w-4 h-4 text-[#3650AD]" />
                                <span className="font-medium">Last Updated:</span>
                                <span className="ml-auto text-[#1a1a2e]">{new Date(petition.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share This Petition */}
                <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3650AD]/10 to-[#F43676]/20 flex items-center justify-center">
                            <Share2 className="w-5 h-5 text-[#3650AD]" />
                        </div>
                        <p className="font-bold text-[#1a1a2e] text-lg">Share This Petition</p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        {(() => {
                            // Use production domain for social sharing (Facebook requires publicly accessible URLs)
                            const productionDomain = "https://www.sosign.in";
                            const path = `/currentpetitions/${slug}`;

                            // For copy/display, use current origin; for Facebook, use production
                            const currentUrl = typeof window !== "undefined" ? window.location.origin : "";
                            const localShareUrl = new URL(currentUrl + path);
                            const productionShareUrl = new URL(productionDomain + path);

                            if (user?.uniqueCode) {
                                localShareUrl.searchParams.set("code", user.uniqueCode);
                                productionShareUrl.searchParams.set("code", user.uniqueCode);
                            }

                            const shareText = `Support this petition: ${petition.title}`;
                            const encodedText = encodeURIComponent(shareText);
                            const encodedProductionUrl = encodeURIComponent(productionShareUrl.toString());

                            const handleCopy = async () => {
                                try {
                                    await navigator.clipboard.writeText(localShareUrl.toString());
                                    alert("Link copied to clipboard");
                                } catch (e) {
                                    console.error("Copy failed", e);
                                }
                            };

                            const handleFacebookShare = () => {
                                // Use simple sharer.php with production URL
                                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedProductionUrl}`;
                                window.open(
                                    facebookUrl,
                                    'facebook-share-dialog',
                                    'width=626,height=500,left=' + (window.innerWidth / 2 - 313) + ',top=' + (window.innerHeight / 2 - 250)
                                );
                            };

                            return (
                                <>
                                    <button
                                        onClick={handleFacebookShare}
                                        className="bg-[#1877F2] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#166fe5] transition duration-300 transform hover:-translate-y-0.5 shadow-md"
                                    >
                                        Facebook
                                    </button>
                                    <a
                                        href={`https://wa.me/?text=${encodedText}%20${encodedProductionUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-600 transition duration-300 transform hover:-translate-y-0.5 shadow-md"
                                    >
                                        WhatsApp
                                    </a>
                                    <a
                                        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedProductionUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#1DA1F2] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#1a8cd8] transition duration-300 transform hover:-translate-y-0.5 shadow-md"
                                    >
                                        Twitter
                                    </a>
                                    <button
                                        onClick={handleCopy}
                                        className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition duration-300 transform hover:-translate-y-0.5 shadow-md inline-flex items-center gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy Link
                                    </button>
                                    <a
                                        href={`mailto:?subject=${encodedText}&body=${encodedProductionUrl}`}
                                        className="bg-[#F43676] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#d92d66] transition duration-300 transform hover:-translate-y-0.5 shadow-md inline-flex items-center gap-2"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </a>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Download Petition Data Section - Only visible to petition creator */}
                {signatureStatus.isCreator && (
                    <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3650AD]/10 to-[#3650AD]/20 flex items-center justify-center">
                                <Download className="w-5 h-5 text-[#3650AD]" />
                            </div>
                            <p className="font-bold text-[#1a1a2e] text-lg">Download Petition Data</p>
                        </div>

                        {downloadSuccess && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Download request submitted successfully!</p>
                                    <p className="text-sm text-green-600">Please wait for admin approval. You will be able to download once approved.</p>
                                </div>
                            </div>
                        )}

                        {downloadError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                                <p className="font-medium">Error: {downloadError}</p>
                                <button
                                    onClick={() => setDownloadError(null)}
                                    className="text-sm underline mt-1"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        <p className="text-gray-600 text-sm mb-4">
                            Download a complete data file of this petition including all signatures, comments, and details.
                            This requires admin approval.
                        </p>

                        {downloadStatus.loading ? (
                            <div className="text-center py-4">
                                <p className="text-gray-500">Checking download status...</p>
                            </div>
                        ) : downloadStatus.canDownload ? (
                            <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-green-800 font-semibold">Your download request has been approved!</p>
                                        <p className="text-green-600 text-sm">You can now download the petition data.</p>
                                    </div>
                                </div>
                                {downloadStatus.approvedFields && downloadStatus.approvedFields.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-green-700 text-xs font-medium mb-1">Approved data fields:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {downloadStatus.approvedFields.map((field) => {
                                                const fieldLabels = {
                                                    petitionDetails: "Petition Details",
                                                    petitionStarter: "Petition Starter",
                                                    decisionMakers: "Decision Makers",
                                                    statistics: "Statistics",
                                                    signatures: "Signatures List",
                                                    comments: "Comments List",
                                                };
                                                return (
                                                    <span
                                                        key={field}
                                                        className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                                                    >
                                                        {fieldLabels[field] || field}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={handleDownloadPetition}
                                    disabled={downloadLoading}
                                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#3650AD] to-[#F43676] text-white rounded-lg font-semibold hover:opacity-90 transition-all transform hover:-translate-y-0.5 shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    {downloadLoading ? "Downloading..." : "Download Petition Data (PDF)"}
                                </button>
                            </div>
                        ) : downloadStatus.hasRequest && downloadStatus.status === "pending" ? (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                                <Clock className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-yellow-800 font-semibold">Your download request is pending</p>
                                    <p className="text-yellow-600 text-sm">Please wait for admin approval. Check back later.</p>
                                </div>
                            </div>
                        ) : downloadStatus.hasRequest && downloadStatus.status === "rejected" ? (
                            <div className="space-y-3">
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-red-800 font-semibold">Your previous request was rejected</p>
                                        <p className="text-red-600 text-sm">You can submit a new request with a different reason.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDownloadModal(true)}
                                    className="px-5 py-2.5 bg-[#3650AD] text-white rounded-lg font-medium hover:bg-[#2a3f8a] transition-colors"
                                >
                                    Request Again
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDownloadModal(true)}
                                className="px-5 py-2.5 bg-[#3650AD] text-white rounded-lg font-medium hover:bg-[#2a3f8a] transition-colors"
                            >
                                Request Download Access
                            </button>
                        )}
                    </div>
                )}

                {/* Download Request Modal */}
                {showDownloadModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-[#1a1a2e] mb-4">Request Download Access</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select data fields to request:
                                    </label>
                                    <div className="space-y-2">
                                        {availableFields.map((field) => {
                                            const fieldLabels = {
                                                petitionDetails: "Petition Details",
                                                petitionStarter: "Petition Starter Info",
                                                decisionMakers: "Decision Makers",
                                                statistics: "Statistics",
                                                signatures: "Signatures List",
                                                comments: "Comments List",
                                            };
                                            return (
                                                <label key={field} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={requestedFields.includes(field)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setRequestedFields([...requestedFields, field]);
                                                            } else {
                                                                setRequestedFields(requestedFields.filter(f => f !== field));
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-[#3650AD] rounded"
                                                    />
                                                    <span className="text-gray-700">{fieldLabels[field] || field}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason for request: *
                                    </label>
                                    <textarea
                                        value={downloadReason}
                                        onChange={(e) => setDownloadReason(e.target.value)}
                                        placeholder="Please explain why you need access to this petition data..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                                        required
                                    />
                                </div>

                                {downloadError && (
                                    <p className="text-red-500 text-sm">{downloadError}</p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowDownloadModal(false);
                                            setDownloadError(null);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRequestDownload}
                                        disabled={downloadLoading}
                                        className="flex-1 px-4 py-2 bg-[#3650AD] text-white rounded-lg hover:bg-[#2a3f8a] transition-colors disabled:opacity-50"
                                    >
                                        {downloadLoading ? "Submitting..." : "Submit Request"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <div id="comments" className="mt-8">
                    <CommentsSection petitionId={petition._id} />
                </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <LoginModal isOpen={showLoginModal} onClose={handleLoginModalClose} />
            )}
        </div>
    );
}
