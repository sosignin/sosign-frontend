"use client";

import React, { useState, useRef } from "react";
import { FaIdCard, FaCheckCircle, FaCloudUploadAlt, FaSpinner, FaTimesCircle, FaTimes, FaClock } from "react-icons/fa";

const AadhaarKycSection = ({ user, onKycSuccess }) => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  // status: "idle" | "uploading" | "pending" | "success" | "error"
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const isVerified = user?.aadhaarKyc?.status === "verified";

  const handleImageSelect = (file, side) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }
    setError("");
    setStatus("idle");
    const reader = new FileReader();
    reader.onload = (e) => {
      if (side === "front") {
        setFrontImage(file);
        setFrontPreview(e.target.result);
      } else {
        setBackImage(file);
        setBackPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e, side) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageSelect(file, side);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const clearImage = (side) => {
    if (side === "front") {
      setFrontImage(null);
      setFrontPreview(null);
      if (frontRef.current) frontRef.current.value = "";
    } else {
      setBackImage(null);
      setBackPreview(null);
      if (backRef.current) backRef.current.value = "";
    }
  };

  const handleVerify = async () => {
    if (!frontImage || !backImage) {
      setError("Please upload both front and back images of your Aadhaar card");
      return;
    }

    setStatus("uploading");
    setError("");
    setSuccessData(null);

    // After 5 seconds of uploading, switch to "pending" to show it's processing
    const pendingTimer = setTimeout(() => {
      setStatus((prev) => (prev === "uploading" ? "pending" : prev));
    }, 5000);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.token) throw new Error("Not authenticated");

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const formData = new FormData();
      formData.append("FrontImage", frontImage);
      formData.append("BackImage", backImage);

      const response = await fetch(`${backendUrl}/api/aadhaar/verify-kyc`, {
        method: "POST",
        headers: { Authorization: `Bearer ${storedUser.token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setSuccessData(data.aadhaarKyc);
      setStatus("success");

      // Update local storage and parent state
      const updatedUser = { ...storedUser, aadhaarKyc: data.aadhaarKyc };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (onKycSuccess) onKycSuccess(data.aadhaarKyc);
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      setStatus("error");
    } finally {
      clearTimeout(pendingTimer);
    }
  };

  // ─── Verified State ───
  if (isVerified || successData) {
    const kyc = successData || user.aadhaarKyc;
    return (
      <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-green-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-0 opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a1a2e]">Aadhaar KYC Verified</h3>
              <p className="text-xs text-green-600 font-medium">Identity verification complete</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">VERIFIED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {kyc.maskedAadhaar && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Aadhaar Number</p>
                <p className="font-semibold text-gray-800 tracking-wider">{kyc.maskedAadhaar}</p>
              </div>
            )}
            {kyc.name && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="font-semibold text-gray-800">{kyc.name}</p>
              </div>
            )}
            {kyc.dob && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                <p className="font-semibold text-gray-800">{kyc.dob}</p>
              </div>
            )}
            {kyc.state && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">State</p>
                <p className="font-semibold text-gray-800">{kyc.state}</p>
              </div>
            )}
            {kyc.pincode && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Pincode</p>
                <p className="font-semibold text-gray-800">{kyc.pincode}</p>
              </div>
            )}
            {kyc.verifiedAt && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Verified On</p>
                <p className="font-semibold text-gray-800">{new Date(kyc.verifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Upload / Pending / Error State ───
  const isProcessing = status === "uploading" || status === "pending";

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-0 opacity-50"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === "error" ? "bg-gradient-to-r from-red-500 to-red-600" : status === "pending" ? "bg-gradient-to-r from-yellow-500 to-amber-500" : "bg-gradient-to-r from-orange-500 to-amber-500"}`}>
            {status === "pending" ? <FaClock className="text-white text-lg" /> : <FaIdCard className="text-white text-lg" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a1a2e]">Aadhaar KYC Verification</h3>
            <p className="text-xs text-gray-500">
              {status === "pending" ? "Processing your documents..." : status === "error" ? "Verification failed — please try again" : "Upload front & back images of your Aadhaar card"}
            </p>
          </div>
          <span className={`ml-auto px-3 py-1 text-xs font-bold rounded-full ${status === "error" ? "bg-red-100 text-red-700" : status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-orange-100 text-orange-700"}`}>
            {status === "error" ? "FAILED" : status === "pending" ? "PENDING" : "NOT VERIFIED"}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-700">
            <FaTimesCircle className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Verification Failed</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Pending banner */}
        {status === "pending" && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2 text-sm text-yellow-800">
            <FaClock className="flex-shrink-0 animate-pulse" />
            <span>Still processing — this may take a moment. Please wait...</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Front Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Front Side</label>
            <div
              onDrop={(e) => handleDrop(e, "front")}
              onDragOver={handleDragOver}
              onClick={() => !frontPreview && !isProcessing && frontRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 min-h-[160px] flex flex-col items-center justify-center ${isProcessing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${frontPreview ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-[#F43676] hover:bg-pink-50"}`}
            >
              {frontPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={frontPreview} alt="Front" className="max-h-[120px] rounded-lg object-contain" />
                  {!isProcessing && (
                    <button onClick={(e) => { e.stopPropagation(); clearImage("front"); }} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click or drag to upload</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                </>
              )}
            </div>
            <input ref={frontRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e.target.files[0], "front")} />
          </div>

          {/* Back Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Back Side</label>
            <div
              onDrop={(e) => handleDrop(e, "back")}
              onDragOver={handleDragOver}
              onClick={() => !backPreview && !isProcessing && backRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 min-h-[160px] flex flex-col items-center justify-center ${isProcessing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${backPreview ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-[#F43676] hover:bg-pink-50"}`}
            >
              {backPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={backPreview} alt="Back" className="max-h-[120px] rounded-lg object-contain" />
                  {!isProcessing && (
                    <button onClick={(e) => { e.stopPropagation(); clearImage("back"); }} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click or drag to upload</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                </>
              )}
            </div>
            <input ref={backRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e.target.files[0], "back")} />
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={isProcessing || !frontImage || !backImage}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${isProcessing || !frontImage || !backImage ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:shadow-lg hover:scale-[1.01]"}`}
        >
          {status === "uploading" ? (
            <>
              <FaSpinner className="animate-spin" />
              Uploading images...
            </>
          ) : status === "pending" ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing KYC...
            </>
          ) : status === "error" ? (
            <>
              <FaIdCard />
              Retry Verification
            </>
          ) : (
            <>
              <FaIdCard />
              Verify Aadhaar KYC
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Your Aadhaar images are securely processed and not stored. Only extracted details are saved for KYC.
        </p>
      </div>
    </div>
  );
};

export default AadhaarKycSection;
