"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaChevronRight,
  FaCircleInfo,
  FaHandHoldingHeart,
  FaImage,
  FaIndianRupeeSign,
  FaSpinner,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

const STORAGE_KEY = "sosign_crowdfunding_campaigns";

const initialFormData = {
  title: "",
  category: "Medical",
  goalAmount: "",
  deadline: "",
  location: "",
  imageUrl: "",
  beneficiaryName: "",
  organizerName: "",
  organizerEmail: "",
  story: "",
  fundUse: "",
};

const categories = [
  "Medical",
  "Education",
  "Community",
  "Animal Welfare",
  "Emergency Relief",
  "Environment",
  "Other",
];

const readCampaigns = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Unable to read crowdfunding campaigns:", error);
    return [];
  }
};

export default function StartCrowdfundingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/start-crowdfunding");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      organizerName: prev.organizerName || user.name || "",
      organizerEmail: prev.organizerEmail || user.email || "",
    }));
  }, [user]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = () => {
    if (formData.title.trim().length < 10) {
      return "Campaign title must be at least 10 characters.";
    }

    if (!formData.goalAmount || Number(formData.goalAmount) < 1000) {
      return "Goal amount must be at least Rs. 1,000.";
    }

    if (!formData.deadline) {
      return "Please select the campaign deadline.";
    }

    if (new Date(formData.deadline) <= new Date()) {
      return "Deadline must be a future date.";
    }

    if (formData.beneficiaryName.trim().length < 3) {
      return "Beneficiary name must be at least 3 characters.";
    }

    if (formData.organizerName.trim().length < 3) {
      return "Organizer name must be at least 3 characters.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizerEmail.trim())) {
      return "Please enter a valid organizer email.";
    }

    if (formData.story.trim().length < 80) {
      return "Campaign story must be at least 80 characters.";
    }

    if (formData.fundUse.trim().length < 40) {
      return "Please explain how the funds will be used.";
    }

    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    const campaign = {
      id: `cf-${Date.now()}`,
      ...formData,
      title: formData.title.trim(),
      goalAmount: Number(formData.goalAmount),
      raisedAmount: 0,
      location: formData.location.trim() || "India",
      imageUrl: formData.imageUrl.trim(),
      beneficiaryName: formData.beneficiaryName.trim(),
      organizerName: formData.organizerName.trim(),
      organizerEmail: formData.organizerEmail.trim(),
      story: formData.story.trim(),
      fundUse: formData.fundUse.trim(),
      createdAt: new Date().toISOString(),
      creatorId: user?.uid || user?.id || user?._id || "",
    };

    const campaigns = readCampaigns();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([campaign, ...campaigns]));
    router.push("/crowdfunding");
  };

  if (authLoading || (!authLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-pink-100 border-b border-pink-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Start Crowdfunding</h1>
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#F43676] transition-colors">
              Home
            </Link>
            <FaChevronRight className="text-gray-400 text-xs" />
            <Link href="/crowdfunding" className="hover:text-[#F43676] transition-colors">
              Crowdfunding
            </Link>
            <FaChevronRight className="text-gray-400 text-xs" />
            <span className="text-[#1a1a2e] font-medium">Start</span>
          </nav>
        </div>
      </div>

      <main className="min-h-screen bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-[#F43676] font-semibold mb-2">Raise support for a real need</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-3">
              Create a trusted fundraising campaign
            </h2>
            <p className="text-gray-600 max-w-3xl">
              Share the story, set a transparent goal, and help people understand exactly how their contribution will be used.
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
          >
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#F43676] focus:ring-2 focus:ring-pink-100"
                  placeholder="Help raise funds for urgent medical treatment"
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#F43676] focus:ring-2 focus:ring-pink-100"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Goal Amount *
                </label>
                <div className="flex rounded-lg border border-gray-300 focus-within:border-[#F43676] focus-within:ring-2 focus-within:ring-pink-100">
                  <span className="flex items-center px-3 text-gray-500">
                    <FaIndianRupeeSign />
                  </span>
                  <input
                    type="number"
                    value={formData.goalAmount}
                    onChange={(event) => updateField("goalAmount", event.target.value)}
                    className="w-full rounded-r-lg p-3 outline-none"
                    placeholder="50000"
                    min="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(event) => updateField("deadline", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#F43676] focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#F43676] focus:ring-2 focus:ring-pink-100"
                  placeholder="Mumbai, Maharashtra"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Beneficiary Name *
                </label>
                <input
                  type="text"
                  value={formData.beneficiaryName}
                  onChange={(event) => updateField("beneficiaryName", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#F43676] focus:ring-2 focus:ring-pink-100"
                  placeholder="Person or group receiving support"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organizer Name *
                </label>
                <input
                  type="text"
                  value={formData.organizerName}
                  onChange={(event) => updateField("organizerName", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#F43676] focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organizer Email *
                </label>
                <input
                  type="email"
                  value={formData.organizerEmail}
                  onChange={(event) => updateField("organizerEmail", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#F43676] focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Image URL
                </label>
                <div className="flex rounded-lg border border-gray-300 focus-within:border-[#F43676] focus-within:ring-2 focus-within:ring-pink-100">
                  <span className="flex items-center px-3 text-gray-500">
                    <FaImage />
                  </span>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(event) => updateField("imageUrl", event.target.value)}
                    className="w-full rounded-r-lg p-3 outline-none"
                    placeholder="https://example.com/campaign-photo.jpg"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Story *
                </label>
                <textarea
                  value={formData.story}
                  onChange={(event) => updateField("story", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#F43676] focus:ring-2 focus:ring-pink-100 resize-none"
                  rows={6}
                  placeholder="Tell supporters what happened, who needs help, and why this matters now."
                />
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <FaCircleInfo className="text-blue-400" />
                  Add enough detail for supporters to understand the urgency and trust the request.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  How Funds Will Be Used *
                </label>
                <textarea
                  value={formData.fundUse}
                  onChange={(event) => updateField("fundUse", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#F43676] focus:ring-2 focus:ring-pink-100 resize-none"
                  rows={4}
                  placeholder="Break down expected costs like hospital bills, medicines, travel, supplies, or school fees."
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <Link href="/crowdfunding" className="text-sm font-semibold text-[#302d55] hover:text-[#F43676]">
                View crowdfunding campaigns
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#F43676] to-[#e02a60] px-6 py-3 font-semibold text-white shadow-lg shadow-pink-200 transition-all hover:shadow-pink-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaHandHoldingHeart />}
                {isSubmitting ? "Creating..." : "Create Crowdfunding"}
              </button>
            </div>
          </motion.form>
        </div>
      </main>
    </>
  );
}
