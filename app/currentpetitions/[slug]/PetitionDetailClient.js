"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
import LoginModal from "../../../components/LoginModal";
import CommentsSection from "../../../components/CommentsSection";
import Captcha from "../../../components/Captcha";
import CampaignProgress from "../../../components/CampaignProgress";
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
    MapPin,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Languages,
    Star
} from "lucide-react";

export default function PetitionDetailClient({ initialPetition }) {
    const { slug } = useParams();
    const langRef = React.useRef(null);
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
    const [aadhaarOtp, setAadhaarOtp] = useState({
        otp: "",
        otpSent: false,
        sending: false,
        verifying: false,
        verified: false,
        otpSessionToken: "",
        verificationToken: "",
        error: "",
        success: "",
        maskedAadhaar: "",
    });

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
    const [currentLanguage, setCurrentLanguage] = useState("en");
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        // Define callback before script loads
        window.googleTranslateElementInit = () => {
            if (window.google?.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: "hi,bn,en,mr,ta,te,gu,kn,ml,pa,or,as",
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    "google_translate_element"
                );
            }
        };

        // Only inject script once
        if (!window.google?.translate && !document.getElementById("google-translate-script")) {
            const script = document.createElement("script");
            script.id = "google-translate-script";
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        } else if (window.google?.translate && !document.querySelector(".goog-te-combo")) {
            // Only re-init if the widget internal controls are missing
            window.googleTranslateElementInit();
        }

        // Detect current language from cookie on mount
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };
        const langCookie = getCookie("googtrans");
        if (langCookie) {
            const lang = langCookie.split("/").pop();
            if (lang && lang !== currentLanguage) {
                setCurrentLanguage(lang);
            }
        }

        // Add CSS to hide Google Translate toolbar
        const style = document.createElement("style");
        style.innerHTML = `
            .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
            body { top: 0px !important; }
            .goog-te-menu-value span:nth-child(5) { display: none !important; }
            .goog-te-menu-value img { display: none !important; }
            #google_translate_element { 
                position: absolute;
                top: -9999px;
                left: -9999px;
                height: 0;
                width: 0;
                overflow: hidden;
            }
            .VIpgJd-ZviZp-ORrt-ORrt-nU67Y { display: none !important; }
            .goog-tooltip { display: none !important; }
            .goog-tooltip:hover { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
        `;
        document.head.appendChild(style);

        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    const changeLanguage = (langCode) => {
        const domain = window.location.hostname;
        
        // 1. Clear or set the Google Translate cookie
        if (langCode === "en") {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
        } else {
            const cookieValue = `/en/${langCode}`;
            document.cookie = `googtrans=${cookieValue}; path=/;`;
            document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain};`;
        }
        
        // 2. Try to trigger the hidden select element
        const findSelect = () => document.querySelector(".goog-te-combo") || 
                                 document.querySelector("#google_translate_element select") ||
                                 document.querySelector("select.goog-te-combo");

        // The target value for the google combo box (empty string restores original language)
        const targetValue = langCode === "en" ? "" : langCode;

        const select = findSelect();
        if (select) {
            select.value = targetValue;
            select.dispatchEvent(new Event("change"));
            setCurrentLanguage(langCode);
        } else {
            // If not ready, wait a bit and try multiple times
            let retries = 0;
            const interval = setInterval(() => {
                const retrySelect = findSelect();
                if (retrySelect) {
                    retrySelect.value = targetValue;
                    retrySelect.dispatchEvent(new Event("change"));
                    setCurrentLanguage(langCode);
                    clearInterval(interval);
                }
                if (++retries > 5) {
                    // Fallback: If still not found after retries, reload the page 
                    // The cookie we set above will trigger the correct translation state on reload
                    window.location.reload();
                    clearInterval(interval);
                }
            }, 300);
        }
        setIsLangOpen(false);
    };

    const languages = [
        { name: "English", code: "en" },
        { name: "Hindi (हिन्दी)", code: "hi" },
        { name: "Bengali (বাংলা)", code: "bn" },
        { name: "Marathi (मराठी)", code: "mr" },
        { name: "Tamil (தமிழ்)", code: "ta" },
        { name: "Telugu (తెలుగు)", code: "te" },
        { name: "Gujarati (ગુજરાતી)", code: "gu" },
        { name: "Kannada (ਕನ್ನಡ)", code: "kn" },
        { name: "Malayalam (മലയാളം)", code: "ml" },
        { name: "Punjabi (ਪੰਜਾਬੀ)", code: "pa" },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
        };

        if (isLangOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isLangOpen]);

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

    const handleSendAadhaarOtp = async () => {
        const cleanAadhar = aadharNumber.replace(/\s/g, "");
        if (!cleanAadhar || !/^[2-9]\d{11}$/.test(cleanAadhar)) {
            setAadhaarOtp(prev => ({ ...prev, error: "Please enter a valid 12-digit Aadhaar number" }));
            return;
        }

        try {
            setAadhaarOtp(prev => ({ ...prev, sending: true, error: "", success: "" }));
            const userInfo = JSON.parse(localStorage.getItem("user"));
            const response = await fetch("/api/aadhaar/send-otp", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ aadhaarNumber: cleanAadhar }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to send OTP");

            setAadhaarOtp(prev => ({
                ...prev,
                sending: false,
                otpSent: true,
                otpSessionToken: result.otpSessionToken,
                maskedAadhaar: result.maskedAadhaar,
                success: result.message || "OTP sent successfully to your linked mobile number",
            }));
        } catch (error) {
            setAadhaarOtp(prev => ({ ...prev, sending: false, error: error.message }));
        }
    };

    const handleVerifyAadhaarOtp = async () => {
        const cleanAadhar = aadharNumber.replace(/\s/g, "");
        if (!aadhaarOtp.otp || aadhaarOtp.otp.length < 4) {
            setAadhaarOtp(prev => ({ ...prev, error: "Please enter a valid OTP" }));
            return;
        }

        try {
            setAadhaarOtp(prev => ({ ...prev, verifying: true, error: "", success: "" }));
            const userInfo = JSON.parse(localStorage.getItem("user"));
            const response = await fetch("/api/aadhaar/verify-otp", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    aadhaarNumber: cleanAadhar,
                    otp: aadhaarOtp.otp.trim(),
                    otpSessionToken: aadhaarOtp.otpSessionToken,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to verify OTP");

            setAadhaarOtp(prev => ({
                ...prev,
                verifying: false,
                verified: true,
                verificationToken: result.aadhaarVerificationToken || result.aadharVerificationToken,
                success: "Aadhaar verified successfully",
            }));
        } catch (error) {
            setAadhaarOtp(prev => ({ ...prev, verifying: false, error: error.message }));
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

            const isUserVerified = user?.aadhaarKyc?.status === "verified";
            const userInfo = JSON.parse(localStorage.getItem("user"));
            
            const response = await fetch(`/api/petitions/${petition._id}/sign`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    referralCode: referralCode?.trim() || undefined,
                    constituencyNumber: constituencyNumber?.trim() || undefined,
                    aadharNumber: isUserVerified ? (user.aadhaarKyc.maskedAadhaar || aadharNumber?.trim() || undefined) : (aadharNumber?.trim() || undefined),
                    aadhaarVerificationToken: isUserVerified ? undefined : aadhaarOtp.verificationToken,
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

    // Helper to extract YouTube video ID
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYoutubeId(petition?.petitionDetails?.videoUrl);

    const heroImages =
        petition.petitionDetails?.images?.length > 0
            ? petition.petitionDetails.images
            : petition.petitionDetails?.image
              ? [petition.petitionDetails.image]
              : [];
    const heroImage = heroImages[activeImageIndex] ?? heroImages[0] ?? null;
    const hasMultipleHeroImages = heroImages.length > 1;

    return (
        <div className="min-h-screen bg-[#f0f2f5] pb-12">

            {/* Cinematic Header Section */}
            <div className="w-full mt-6 overflow-hidden">
                <div className="max-w-[1500px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr]">
                        {/* Image with title overlay at bottom */}
                        <div className="relative min-h-[320px] lg:min-h-[480px] overflow-hidden lg:col-start-1 rounded-2xl">
                            {heroImage ? (
                                <>
                                    {/* Main image */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeImageIndex}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="absolute inset-0 z-[1]"
                                        >
                                            <Image
                                                src={heroImage}
                                                alt={`${petition.title} - Image ${activeImageIndex + 1}`}
                                                fill
                                                className="object-contain"
                                                priority
                                            />
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Title overlay at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-5">
                                        <div className="max-w-3xl mx-auto">
                                            <div className="w-12 h-1 bg-[#F43676] mb-3 rounded-full" />
                                            <h1 className="text-lg md:text-xl lg:text-2xl font-black text-white leading-tight drop-shadow-lg line-clamp-3">
                                                {petition.title}
                                            </h1>
                                        </div>
                                    </div>

                                    {hasMultipleHeroImages && (
                                        <>
                                            <button
                                                onClick={() => setActiveImageIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all z-20"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => setActiveImageIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1))}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all z-20"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        </>
                                    )}

                                    {hasMultipleHeroImages && (
                                        <div className="absolute bottom-16 md:bottom-20 right-4 flex gap-2 z-20 max-w-[200px] overflow-x-auto pb-1 scrollbar-hide">
                                            {heroImages.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImageIndex(idx)}
                                                    className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? "border-[#F43676] scale-110 shadow-lg" : "border-white/20 opacity-50 hover:opacity-100"}`}
                                                >
                                                    <Image
                                                        src={img}
                                                        alt={`Thumbnail ${idx + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center text-white/50 bg-gray-800">
                                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p>No Image Available</p>
                                </div>
                            )}
                        </div>

                        {/* Right — sign card */}
                        <div className="relative min-h-[380px] overflow-hidden border-t lg:border-t-0 lg:col-start-2 bg-gray-50">

                            <div className="relative z-10 flex items-center justify-center p-6 lg:p-8 h-full min-h-[380px]">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="w-full max-w-md"
                                >
                                    {/* The White Card */}
                                    <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-7 space-y-5 relative overflow-hidden">
                                    {/* Stats Banner inside Card */}
                                    <div className="text-center pb-5 border-b border-gray-100">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <span className="text-4xl font-black text-[#1a1a2e]">
                                                {(petition.numberOfSignatures || 0).toLocaleString()}
                                            </span>
                                            <div className="bg-blue-500 rounded-full p-1 shadow-md shadow-blue-200">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            <span>Verified signatures</span>
                                            <ChevronDown className="w-3 h-3" />
                                        </div>
                                    </div>

                            <h2 className="text-2xl font-black text-[#1a1a2e] tracking-tight">Sign this petition</h2>

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

                                    {/* Aadhaar Number with OTP Verification (if required) */}
                                    {petition.signingRequirements?.aadhar?.required && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-left">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Aadhaar Verification <span className="text-red-500">*</span>
                                            </label>
                                            
                                            {user?.aadhaarKyc?.status === "verified" ? (
                                                <div className="flex items-center gap-3 text-green-700 bg-green-100/50 border border-green-200 p-3 rounded-xl">
                                                    <div className="bg-green-200 p-1.5 rounded-full">
                                                        <CheckCircle className="w-5 h-5 text-green-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">Aadhaar Already Verified</p>
                                                        <p className="text-[11px] opacity-80">Your identity is verified via DigiLocker {user.aadhaarKyc.maskedAadhaar ? `(${user.aadhaarKyc.maskedAadhaar})` : ""}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={aadharNumber}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/[^\d\s]/g, '');
                                                                setAadharNumber(value);
                                                                // Reset verification if number changes
                                                                if (aadhaarOtp.verified || aadhaarOtp.otpSent) {
                                                                    setAadhaarOtp(prev => ({ 
                                                                        ...prev, 
                                                                        verified: false, 
                                                                        otpSent: false, 
                                                                        verificationToken: "",
                                                                        otp: "",
                                                                        error: "",
                                                                        success: ""
                                                                    }));
                                                                }
                                                            }}
                                                            placeholder="12-digit Aadhaar number"
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            maxLength={14}
                                                            disabled={aadhaarOtp.otpSent || aadhaarOtp.verified}
                                                        />
                                                        {!aadhaarOtp.otpSent && !aadhaarOtp.verified && (
                                                            <button
                                                                onClick={handleSendAadhaarOtp}
                                                                disabled={aadhaarOtp.sending || aadharNumber.replace(/\s/g, "").length !== 12}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                                                            >
                                                                {aadhaarOtp.sending ? "Sending..." : "Send OTP"}
                                                            </button>
                                                        )}
                                                        {(aadhaarOtp.otpSent || aadhaarOtp.verified) && !aadhaarOtp.verified && (
                                                            <button
                                                                onClick={() => setAadhaarOtp(prev => ({ ...prev, otpSent: false, otp: "", error: "", success: "" }))}
                                                                className="px-3 py-2 text-[#3650AD] hover:text-[#F43676] text-xs font-semibold"
                                                            >
                                                                Change
                                                            </button>
                                                        )}
                                                    </div>

                                                    {aadhaarOtp.otpSent && !aadhaarOtp.verified && (
                                                        <div className="mt-4 space-y-3">
                                                            <p className="text-xs text-blue-600 font-medium">
                                                                OTP sent to mobile linked with {aadhaarOtp.maskedAadhaar || "Aadhaar"}
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={aadhaarOtp.otp}
                                                                    onChange={(e) => setAadhaarOtp(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                                                                    placeholder="Enter OTP"
                                                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    maxLength={8}
                                                                />
                                                                <button
                                                                    onClick={handleVerifyAadhaarOtp}
                                                                    disabled={aadhaarOtp.verifying || aadhaarOtp.otp.length < 4}
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                                                                >
                                                                    {aadhaarOtp.verifying ? "Verifying..." : "Verify OTP"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {aadhaarOtp.verified && (
                                                        <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span className="text-sm font-semibold">Aadhaar Verified Successfully</span>
                                                        </div>
                                                    )}

                                                    {aadhaarOtp.error && (
                                                        <p className="text-xs text-red-500 mt-2 font-medium">{aadhaarOtp.error}</p>
                                                    )}
                                                    {aadhaarOtp.success && !aadhaarOtp.verified && (
                                                        <p className="text-xs text-green-600 mt-2 font-medium">{aadhaarOtp.success}</p>
                                                    )}
                                                </>
                                            )}
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
                                            (petition.signingRequirements?.aadhar?.required && 
                                                user?.aadhaarKyc?.status !== "verified" && 
                                                (!aadharNumber.trim() || !aadhaarOtp.verified))
                                        }
                                        className="bg-[#3650AD] text-white w-full py-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                        {signing ? "Signing..." : "Sign Petition"}
                                    </button>
                                </div>
                            )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
                {/* Back Link & Language Switcher */}
                <div className="flex justify-between items-center mt-6 mb-2">
                    {/* <Link href="/currentpetitions" className="text-gray-600 hover:text-[#F43676] transition-colors flex items-center gap-2 text-sm font-medium">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Petitions
                    </Link> */}

                    <div className="relative flex-shrink-0 ml-auto" ref={langRef}>
                        <div id="google_translate_element"></div>
                        <button 
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 font-medium text-sm ${isLangOpen ? "bg-pink-50 text-[#F43676] border-[#F43676]" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-pink-50 hover:text-[#F43676]"}`}
                        >
                            <Languages className="w-4 h-4" />
                            <span>{languages.find(l => l.code === currentLanguage)?.name || "Language"}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} />
                        </button>
                        
                        <div className={`absolute right-0 sm:right-0 mt-2 w-48 max-h-[60vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transition-all duration-200 ${isLangOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
                            style={{ maxWidth: 'calc(100vw - 2rem)' }}
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${currentLanguage === lang.code ? "text-[#F43676] font-semibold bg-pink-50/50" : "text-gray-600"}`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
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

                    {/* Notable Supporters Card */}
                    {petition.notableSigners && petition.notableSigners.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400/10 to-yellow-400/20 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-[#1a1a2e]">Notable Supporters</h3>
                                    <p className="text-sm text-gray-500">Influential people and organizations supporting this cause</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {petition.notableSigners.map((signer) => (
                                    <div key={signer._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-yellow-50/50 hover:border-yellow-100 transition-colors">
                                        {signer.profilePicture ? (
                                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                                <Image src={signer.profilePicture} alt={signer.name} width={48} height={48} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3650AD] to-[#F43676] flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                                                {signer.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{signer.name}</p>
                                            <p className="text-[10px] text-[#F43676] font-bold truncate uppercase tracking-widest bg-pink-50 px-2 py-0.5 rounded-full inline-block mt-0.5">{signer.designation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
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

                    {/* Video URL & Preview */}
                    {petition.petitionDetails?.videoUrl && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/20 flex items-center justify-center">
                                        <Video className="w-5 h-5 text-red-500" />
                                    </div>
                                    <p className="font-bold text-[#1a1a2e]">Video Preview</p>
                                </div>
                                <a
                                    href={petition.petitionDetails.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#3650AD] hover:text-[#F43676] font-medium flex items-center gap-1 transition-colors"
                                >
                                    <span>Watch on YouTube</span>
                                    <Share2 className="w-3 h-3" />
                                </a>
                            </div>
                            {videoId ? (
                                <div className="w-full max-w-2xl mx-auto aspect-video rounded-xl overflow-hidden shadow-inner bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                </div>
                            ) : (
                                <a
                                    href={petition.petitionDetails.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#3650AD] hover:text-[#F43676] font-medium transition-colors"
                                >
                                    <span>Watch Video</span>
                                    <Video className="w-4 h-4" />
                                </a>
                            )}
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

                {/* Campaign Progress Timeline */}
                <CampaignProgress 
                    petitionId={petition._id} 
                    isCreator={signatureStatus.isCreator} 
                    petition={petition} 
                />

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
                            const currentUrl = typeof window !== "undefined" ? window.location.origin : productionDomain;
                            
                            let localShareUrl, productionShareUrl;
                            try {
                                localShareUrl = new URL(path, currentUrl);
                                productionShareUrl = new URL(path, productionDomain);
                            } catch (e) {
                                // Fallback if URL construction fails
                                localShareUrl = { searchParams: new URLSearchParams(), toString: () => currentUrl + path };
                                productionShareUrl = { searchParams: new URLSearchParams(), toString: () => productionDomain + path };
                            }

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
                    <CommentsSection petitionId={petition._id} petitionStarterId={petition.petitionStarter?.user?._id || petition.petitionStarter?.user} />
                </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <LoginModal isOpen={showLoginModal} onClose={handleLoginModalClose} />
            )}
        </div>
    );
}
