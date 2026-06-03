"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronRight,
  FaCircleInfo,
  FaHandHoldingHeart,
  FaImage,
  FaIndianRupeeSign,
  FaSpinner,
  FaUpload,
  FaFilePdf,
  FaCircleCheck,
  FaCircleExclamation,
  FaLock,
  FaHospital,
  FaUserDoctor,
  FaBuilding,
  FaShieldHalved,
  FaPhone,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const categories = [
  "Medical",
  "Education",
  "Community",
  "Animal Welfare",
  "Emergency Relief",
  "Environment",
  "Other",
];

const normalizeAadhaarNumber = (value = "") =>
  value.toString().replace(/\D/g, "");

const createInitialAadhaarOtpState = () => ({
  otp: "",
  otpSent: false,
  otpSessionToken: "",
  verified: false,
  verificationToken: "",
  sending: false,
  verifying: false,
  error: "",
  success: "",
  maskedAadhaar: "",
});

const createInitialPanState = () => ({
  verified: false,
  verificationToken: "",
  verifying: false,
  error: "",
  success: "",
  registeredName: "",
  fatherName: "",
  panType: "",
});

const isValidAadhaarNumber = (value = "") =>
  /^[2-9]\d{11}$/.test(normalizeAadhaarNumber(value));

const isValidPanNumber = (value = "") =>
  /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.trim().toUpperCase());

const initialFormData = {
  title: "",
  category: "Medical",
  goalAmount: "",
  deadline: "",
  location: "",
  beneficiaryName: "",
  aadharNumber: "",
  panNumber: "",
  organizerPhone: "",
  story: "",
  hospitalName: "",
  doctorName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  minDonation: "100",
  legalAccepted: false,
  infoVerifiedByUser: false,
};

export default function StartCrowdfundingPage() {
  const { user, setUser, loading: authLoading, fetchWalletBalance } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState({
    image: null,
    reports: [],
    cancelledCheque: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);
  const [isPhoneVerified, setIsPhoneVerified] = useState(true); // Disabled for now
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState(createInitialAadhaarOtpState);
  const [panState, setPanState] = useState(createInitialPanState);
  const [profileLoading, setProfileLoading] = useState(false);
  const [kycProfile, setKycProfile] = useState(null);

  const verifiedUser = kycProfile || user;
  const authToken = user?.token;
  const isAadhaarAlreadyVerified = verifiedUser?.aadhaarKyc?.status === "verified";
  const isPanAlreadyVerified = verifiedUser?.panKyc?.status === "verified";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/start-crowdfunding");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authToken) return;

    const fetchFreshProfile = async () => {
      setProfileLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const freshUser = { ...storedUser, ...response.data, token: authToken };
        setKycProfile(freshUser);
        setUser?.(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      } catch (err) {
        console.error("Failed to fetch identity profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchFreshProfile();
  }, [authToken, setUser]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleFileChange = (field, e) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    if (field === "reports") {
      setFiles((prev) => ({ ...prev, reports: [...prev.reports, ...Array.from(fileList)] }));
    } else {
      setFiles((prev) => ({ ...prev, [field]: fileList[0] }));
    }
  };

  const removeReport = (index) => {
    setFiles((prev) => ({
      ...prev,
      reports: prev.reports.filter((_, i) => i !== index),
    }));
  };

  const handleSendOtp = () => {
    if (!formData.organizerPhone || formData.organizerPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setShowOtpInput(true);
    setError("");
  };

  const handleVerifyOtp = () => {
    if (otp === "1234" || otp.length === 4) { // Dummy OTP logic
      setIsPhoneVerified(true);
      setShowOtpInput(false);
      setError("");
    } else {
      setError("Invalid OTP. Try 1234");
    }
  };

  const handleAadhaarChange = (value) => {
    const previousDigits = normalizeAadhaarNumber(formData.aadharNumber);
    const digits = normalizeAadhaarNumber(value).slice(0, 12);
    let formattedValue = digits;

    if (digits.length > 8) {
      formattedValue = `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
    } else if (digits.length > 4) {
      formattedValue = `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    if (previousDigits !== digits) {
      setAadhaarOtp(createInitialAadhaarOtpState());
    }

    updateField("aadharNumber", formattedValue);
  };

  const handleSendAadhaarOtp = async () => {
    if (!isValidAadhaarNumber(formData.aadharNumber)) {
      setAadhaarOtp((prev) => ({
        ...prev,
        error: "Please enter a valid 12-digit Aadhaar number",
        success: "",
      }));
      return;
    }

    if (!user?.token) {
      setAadhaarOtp((prev) => ({
        ...prev,
        error: "Please login again to continue verification",
        success: "",
      }));
      return;
    }

    try {
      setAadhaarOtp((prev) => ({
        ...prev,
        sending: true,
        error: "",
        success: "",
      }));

      const response = await fetch("/api/aadhaar/send-otp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aadhaarNumber: formData.aadharNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send Aadhaar OTP");
      }

      setAadhaarOtp((prev) => ({
        ...prev,
        sending: false,
        otpSent: !result.testMode,
        otpSessionToken: result.otpSessionToken || "",
        verified: false,
        verificationToken: "",
        otp: "",
        success: result.testMode ? "" : result.message || "OTP sent successfully",
        error: result.testMode ? result.message || "Test mode is enabled. Real OTP SMS will not be delivered." : "",
        maskedAadhaar: result.maskedAadhaar || "",
      }));
    } catch (err) {
      setAadhaarOtp((prev) => ({
        ...prev,
        sending: false,
        otpSent: false,
        otpSessionToken: "",
        verified: false,
        verificationToken: "",
        error: err.message || "Failed to send Aadhaar OTP",
        success: "",
      }));
    }
  };

  const handleVerifyAadhaarOtp = async () => {
    if (!isValidAadhaarNumber(formData.aadharNumber)) {
      setAadhaarOtp((prev) => ({
        ...prev,
        error: "Please enter a valid 12-digit Aadhaar number",
        success: "",
      }));
      return;
    }

    if (!aadhaarOtp.otpSessionToken) {
      setAadhaarOtp((prev) => ({
        ...prev,
        error: "Please send OTP first",
        success: "",
      }));
      return;
    }

    const otpValue = String(aadhaarOtp.otp || "").trim();
    if (!/^\d{4,8}$/.test(otpValue)) {
      setAadhaarOtp((prev) => ({
        ...prev,
        error: "Please enter a valid OTP",
        success: "",
      }));
      return;
    }

    if (!user?.token) {
      setAadhaarOtp((prev) => ({
        ...prev,
        error: "Please login again to continue verification",
        success: "",
      }));
      return;
    }

    try {
      setAadhaarOtp((prev) => ({
        ...prev,
        verifying: true,
        error: "",
        success: "",
      }));

      const response = await fetch("/api/aadhaar/verify-otp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aadhaarNumber: formData.aadharNumber,
          otp: otpValue,
          otpSessionToken: aadhaarOtp.otpSessionToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to verify Aadhaar OTP");
      }

      const verificationToken =
        result.aadhaarVerificationToken || result.aadharVerificationToken;

      if (!verificationToken) {
        throw new Error("Verification token missing in response");
      }

      setAadhaarOtp((prev) => ({
        ...prev,
        verifying: false,
        verified: true,
        verificationToken,
        success: result.message || "Aadhaar verified successfully",
        error: "",
        maskedAadhaar: result.maskedAadhaar || prev.maskedAadhaar,
      }));
    } catch (err) {
      setAadhaarOtp((prev) => ({
        ...prev,
        verifying: false,
        verified: false,
        verificationToken: "",
        error: err.message || "Failed to verify Aadhaar OTP",
        success: "",
      }));
    }
  };

  const handleVerifyPan = async () => {
    const panNumber = String(formData.panNumber || "").trim().toUpperCase();

    if (!isValidPanNumber(panNumber)) {
      setPanState((prev) => ({
        ...prev,
        error: "Please enter a valid PAN number",
        success: "",
      }));
      return;
    }

    if (!user?.token) {
      setPanState((prev) => ({
        ...prev,
        error: "Please login again to continue verification",
        success: "",
      }));
      return;
    }

    try {
      setPanState((prev) => ({
        ...prev,
        verifying: true,
        error: "",
        success: "",
      }));

      const response = await fetch("/api/pan/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ panNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify PAN card");
      }

      setPanState((prev) => ({
        ...prev,
        verified: true,
        verificationToken: data.panVerificationToken,
        success: `PAN Card verified successfully!`,
        registeredName: data.registeredName || "",
        fatherName: data.fatherName || "",
        panType: data.panType || "",
        verifying: false,
      }));

      const nextUser = {
        ...(kycProfile || user),
        panKyc: {
          status: "verified",
          panNumber,
          registeredName: data.registeredName || "",
          fatherName: data.fatherName || "",
          panType: data.panType || "",
          verifiedAt: new Date().toISOString(),
        },
      };
      setKycProfile(nextUser);
      setUser?.(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));
      if (fetchWalletBalance) fetchWalletBalance();
    } catch (err) {
      setPanState((prev) => ({
        ...prev,
        error: err.message || "Verification failed. Please try again.",
        verifying: false,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 5) {
      // Basic Step Validation
      if (step === 1 && (!formData.title || !formData.goalAmount)) {
        setError("Please fill in the title and goal amount.");
        return;
      }
      if (step === 2 && (!formData.beneficiaryName || !formData.organizerPhone)) {
        setError("Beneficiary name and Organizer phone are required.");
        return;
      }
      if (
        step === 2 &&
        !isAadhaarAlreadyVerified &&
        (!aadhaarOtp.verified || !aadhaarOtp.verificationToken)
      ) {
        setError("Please complete Aadhaar OTP verification before continuing.");
        return;
      }
      if (
        step === 2 &&
        !isPanAlreadyVerified &&
        (!panState.verified || !panState.verificationToken)
      ) {
        setError("Please complete PAN Card verification before continuing.");
        return;
      }
      if (step === 4 && (!formData.accountNumber || !formData.ifscCode)) {
        setError("Bank account details are required.");
        return;
      }

      setStep(step + 1);
      window.scrollTo(0, 0);
      return;
    }

    if (!isPhoneVerified) {
      setError("Please verify your phone number first");
      return;
    }

    if (!formData.organizerPhone || formData.organizerPhone.length < 10) {
      setError("Organizer phone number is required (10 digits).");
      return;
    }

    if (!isAadhaarAlreadyVerified && (!aadhaarOtp.verified || !aadhaarOtp.verificationToken)) {
      setError("Please complete Aadhaar OTP verification before launching the campaign.");
      return;
    }

    if (!isPanAlreadyVerified && (!panState.verified || !panState.verificationToken)) {
      setError("Please complete PAN Card verification before launching the campaign.");
      return;
    }

    if (!formData.legalAccepted || !formData.infoVerifiedByUser) {
      setError("Please accept the terms and verify that the info is true.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (!isAadhaarAlreadyVerified && aadhaarOtp.verificationToken) {
        data.append("aadhaarVerificationToken", aadhaarOtp.verificationToken);
        data.append("aadharVerificationToken", aadhaarOtp.verificationToken);
      }

      if (!isPanAlreadyVerified && panState.verificationToken) {
        data.append("panVerificationToken", panState.verificationToken);
      }

      if (files.image) data.append("image", files.image);
      if (files.cancelledCheque) data.append("cancelledCheque", files.cancelledCheque);

      files.reports.forEach((file) => {
        data.append("reports", file);
      });

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await axios.post(`${backendUrl}/api/crowdfunding`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.data) {
        setSuccess("Campaign created successfully!");
        setTimeout(() => {
          router.push(`/crowdfunding/${response.data.slug}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Creation error:", err);
      setError(err.response?.data?.message || "Failed to create campaign. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
      </div>
    );
  }

  const steps = [
    { id: 1, title: "Basic Info", icon: FaHandHoldingHeart },
    { id: 2, title: "Identity", icon: FaShieldHalved },
    { id: 3, title: "Medical", icon: FaHospital },
    { id: 4, title: "Bank", icon: FaBuilding },
    { id: 5, title: "Finalize", icon: FaLock },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Start Fundraising</h1>
            <p className="text-slate-500 text-sm">Fill in the details to launch your campaign</p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                    step >= s.id ? "bg-[#F43676] text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step > s.id ? <FaCircleCheck /> : s.id}
                </div>
                <span className={`ml-2 text-xs font-medium whitespace-nowrap ${step >= s.id ? "text-slate-800" : "text-slate-400"}`}>
                  {s.title}
                </span>
                {s.id < 5 && <div className="w-4 h-px bg-slate-200 mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
                <FaCircleInfo />
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm flex items-center gap-3">
                <FaCircleCheck />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none transition-all"
                        placeholder="e.g., Support Rajesh's Cancer Treatment"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Goal Amount (₹)</label>
                      <div className="relative">
                        <FaIndianRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          required
                          value={formData.goalAmount}
                          onChange={(e) => updateField("goalAmount", e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                          placeholder="e.g., 500000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Deadline</label>
                      <input
                        type="date"
                        required
                        value={formData.deadline}
                        onChange={(e) => updateField("deadline", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => updateField("category", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => updateField("location", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                        placeholder="City, State"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Main Image</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-[#F43676] transition-colors relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange("image", e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {files.image ? (
                          <div className="flex items-center justify-center gap-3 text-[#F43676] font-medium">
                            <FaImage /> {files.image.name}
                          </div>
                        ) : (
                          <div className="text-slate-400">
                            <FaUpload className="mx-auto text-3xl mb-2" />
                            <p className="text-sm">Click to upload high-quality cover photo</p>
                            <p className="text-xs mt-1 text-slate-300">JPG, PNG, WebP (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Your Story</label>
                      <textarea
                        required
                        value={formData.story}
                        onChange={(e) => updateField("story", e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none resize-none"
                        placeholder="Describe who needs help, why, and how the funds will be used..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm flex items-center gap-3 mb-6">
                    <FaShieldHalved className="text-lg" />
                    Identity verification builds trust with donors.
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Beneficiary Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.beneficiaryName}
                        onChange={(e) => updateField("beneficiaryName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                        placeholder="As per Aadhaar"
                      />
                    </div>

                    <div className="md:col-span-2">
                      {profileLoading ? (
                        <div className="border border-slate-200 rounded-xl p-4 text-sm text-slate-500 flex items-center gap-3">
                          <FaSpinner className="animate-spin text-[#F43676]" />
                          Checking saved identity verification...
                        </div>
                      ) : isAadhaarAlreadyVerified && isPanAlreadyVerified ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
                          <div className="bg-green-100 p-3 rounded-full">
                            <FaCircleCheck className="text-green-600 text-xl" />
                          </div>
                          <div>
                            <p className="font-bold text-green-800">Identity already verified</p>
                            <p className="text-sm text-green-700">
                              Using Aadhaar {verifiedUser?.aadhaarKyc?.maskedAadhaar ? `(${verifiedUser.aadhaarKyc.maskedAadhaar})` : ""} and PAN {verifiedUser?.panKyc?.panNumber ? `(${verifiedUser.panKyc.panNumber})` : ""} from your verified profile.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="border border-slate-200 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <span className="bg-[#2D3A8C] text-white text-xs px-2.5 py-1 rounded-full font-bold">1</span>
                              Aadhaar Verification
                            </h3>

                            {isAadhaarAlreadyVerified || aadhaarOtp.verified ? (
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                                <FaCircleCheck className="text-green-600 text-xl" />
                                <div>
                                  <p className="font-bold text-green-800 text-sm">Aadhaar Verified</p>
                                  <p className="text-xs text-green-700">
                                    {aadhaarOtp.verified
                                      ? `Verified successfully ${aadhaarOtp.maskedAadhaar ? `(${aadhaarOtp.maskedAadhaar})` : ""}`
                                      : `Verified via profile ${verifiedUser?.aadhaarKyc?.maskedAadhaar ? `(${verifiedUser.aadhaarKyc.maskedAadhaar})` : ""}`}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700">
                                  Aadhaar Number <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    value={formData.aadharNumber}
                                    onChange={(e) => handleAadhaarChange(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                                    placeholder="2345 6789 0123"
                                    maxLength={14}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleSendAadhaarOtp}
                                    disabled={aadhaarOtp.sending || !isValidAadhaarNumber(formData.aadharNumber)}
                                    className={`px-5 py-3 rounded-xl font-bold transition-colors ${
                                      aadhaarOtp.sending || !isValidAadhaarNumber(formData.aadharNumber)
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                        : "bg-[#2D3A8C] text-white hover:bg-[#1f2a70]"
                                    }`}
                                  >
                                    {aadhaarOtp.sending ? "Sending..." : aadhaarOtp.otpSent ? "Resend OTP" : "Send OTP"}
                                  </button>
                                </div>
                                <p className="text-xs text-slate-400">12 digits, cannot start with 0 or 1.</p>

                                {aadhaarOtp.otpSent && (
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                      type="text"
                                      value={aadhaarOtp.otp}
                                      onChange={(e) =>
                                        setAadhaarOtp((prev) => ({
                                          ...prev,
                                          otp: e.target.value.replace(/\D/g, "").slice(0, 8),
                                          error: "",
                                        }))
                                      }
                                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                                      placeholder="Enter OTP"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleVerifyAadhaarOtp}
                                      disabled={aadhaarOtp.verifying || aadhaarOtp.otp.trim().length < 4}
                                      className={`px-5 py-3 rounded-xl font-bold transition-colors ${
                                        aadhaarOtp.verifying || aadhaarOtp.otp.trim().length < 4
                                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                          : "bg-[#F43676] text-white hover:bg-[#d62860]"
                                      }`}
                                    >
                                      {aadhaarOtp.verifying ? "Verifying..." : "Verify OTP"}
                                    </button>
                                  </div>
                                )}

                                {aadhaarOtp.success && (
                                  <p className="text-green-700 text-sm flex items-center gap-2">
                                    <FaCircleCheck className="text-xs" />
                                    {aadhaarOtp.success}
                                  </p>
                                )}
                                {aadhaarOtp.error && (
                                  <p className="text-red-500 text-sm flex items-center gap-2">
                                    <FaCircleExclamation className="text-xs" />
                                    {aadhaarOtp.error}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="border border-slate-200 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <span className="bg-[#2D3A8C] text-white text-xs px-2.5 py-1 rounded-full font-bold">2</span>
                              PAN Card Verification
                            </h3>

                            {isPanAlreadyVerified || panState.verified ? (
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                                <FaCircleCheck className="text-green-600 text-xl mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-bold text-green-800 text-sm">PAN Card Verified</p>
                                  <p className="text-xs text-green-700 mb-2">
                                    {panState.verified
                                      ? `Verified successfully (${formData.panNumber})`
                                      : `Verified via profile ${verifiedUser?.panKyc?.panNumber ? `(${verifiedUser.panKyc.panNumber})` : ""}`}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white/70 p-3 rounded-lg border border-green-100 text-xs">
                                    <div>
                                      <span className="text-slate-500 block font-medium">Name</span>
                                      <span className="font-bold text-slate-800">{panState.verified ? panState.registeredName : (verifiedUser?.panKyc?.registeredName || "N/A")}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block font-medium">Father Name</span>
                                      <span className="font-bold text-slate-800">{panState.verified ? panState.fatherName : (verifiedUser?.panKyc?.fatherName || "N/A")}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block font-medium">PAN Type</span>
                                      <span className="font-bold text-slate-800">{panState.verified ? panState.panType : (verifiedUser?.panKyc?.panType || "N/A")}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700">
                                  PAN Number <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    value={formData.panNumber}
                                    onChange={(e) => {
                                      setPanState(createInitialPanState());
                                      updateField("panNumber", e.target.value.toUpperCase().trim());
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                                    placeholder="ABCDE1234F"
                                    maxLength={10}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleVerifyPan}
                                    disabled={panState.verifying || !isValidPanNumber(formData.panNumber)}
                                    className={`px-5 py-3 rounded-xl font-bold transition-colors ${
                                      panState.verifying || !isValidPanNumber(formData.panNumber)
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                        : "bg-[#2D3A8C] text-white hover:bg-[#1f2a70]"
                                    }`}
                                  >
                                    {panState.verifying ? "Verifying..." : "Verify PAN"}
                                  </button>
                                </div>
                                <p className="text-xs text-slate-400">Format: 5 letters, 4 digits, 1 letter.</p>

                                {panState.success && (
                                  <p className="text-green-700 text-sm flex items-center gap-2">
                                    <FaCircleCheck className="text-xs" />
                                    {panState.success}
                                  </p>
                                )}
                                {panState.error && (
                                  <p className="text-red-500 text-sm flex items-center gap-2">
                                    <FaCircleExclamation className="text-xs" />
                                    {panState.error}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Organizer Phone Number</label>
                      <div className="relative">
                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={formData.organizerPhone}
                          onChange={(e) => updateField("organizerPhone", e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Hospital Name</label>
                      <input
                        type="text"
                        value={formData.hospitalName}
                        onChange={(e) => updateField("hospitalName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                        placeholder="e.g., Apollo Hospital"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Doctor Name</label>
                      <input
                        type="text"
                        value={formData.doctorName}
                        onChange={(e) => updateField("doctorName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                        placeholder="Dr. Rajesh Kumar"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Medical Reports (Multiple allowed)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#F43676] transition-colors relative">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => handleFileChange("reports", e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="text-slate-400">
                          <FaFilePdf className="mx-auto text-2xl mb-2" />
                          <p className="text-sm">Upload Doctor Certificates, Bills, etc.</p>
                          <p className="text-xs text-slate-300">PDF, JPG, PNG (Max 5 files)</p>
                        </div>
                      </div>
                      
                      {files.reports.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {files.reports.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
                              <span className="truncate flex-1">{f.name}</span>
                              <button type="button" onClick={() => removeReport(i)} className="ml-2 text-red-500 font-bold px-2">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        value={formData.accountHolderName}
                        onChange={(e) => updateField("accountHolderName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        required
                        value={formData.accountNumber}
                        onChange={(e) => updateField("accountNumber", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={formData.ifscCode}
                        onChange={(e) => updateField("ifscCode", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={formData.bankName}
                        onChange={(e) => updateField("bankName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Cancelled Cheque Photo</label>
                      <div className="relative border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <input type="file" onChange={(e) => handleFileChange("cancelledCheque", e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <span className="text-slate-500 text-sm truncate pr-8">{files.cancelledCheque ? files.cancelledCheque.name : "Upload Cheque Image"}</span>
                        <FaUpload className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FaShieldHalved /> Legal Agreements
                    </h3>
                    
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.infoVerifiedByUser}
                        onChange={(e) => updateField("infoVerifiedByUser", e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-[#F43676] focus:ring-[#F43676]"
                      />
                      <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                        I confirm that all information provided is true and accurate. I understand that providing false info is a legal offense.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.legalAccepted}
                        onChange={(e) => updateField("legalAccepted", e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-[#F43676] focus:ring-[#F43676]"
                      />
                      <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                        I accept the terms and conditions and understand that any misuse of funds will lead to immediate legal action.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                  className="px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  {step === 1 ? "Cancel" : "Back"}
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-10 py-3 rounded-xl bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-bold shadow-lg shadow-pink-100 hover:shadow-pink-200 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      {step === 5 ? <FaHandHoldingHeart /> : null}
                      {step === 5 ? "Launch Campaign" : "Next Step"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
        
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p className="flex items-center justify-center gap-2">
            <FaLock className="text-xs" /> Secure and encrypted verification process
          </p>
        </div>
      </main>
    </div>
  );
}
