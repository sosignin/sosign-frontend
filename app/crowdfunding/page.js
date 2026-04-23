"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaCalendar,
  FaChevronRight,
  FaHandHoldingHeart,
  FaIndianRupeeSign,
  FaLocationDot,
  FaPlus,
} from "react-icons/fa6";

const STORAGE_KEY = "sosign_crowdfunding_campaigns";

const sampleCampaigns = [
  {
    id: "sample-medical-relief",
    title: "Support urgent treatment for a child recovering from surgery",
    category: "Medical",
    goalAmount: 250000,
    raisedAmount: 87500,
    deadline: "2026-08-30",
    location: "Pune, Maharashtra",
    beneficiaryName: "Aarav Sharma",
    organizerName: "Community Volunteers",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    story:
      "A local family needs help covering post-surgery care, medicines, and follow-up treatment after a difficult medical emergency.",
    fundUse:
      "Funds will support hospital bills, medicines, therapy sessions, and travel for medical appointments.",
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "sample-school-supplies",
    title: "Help students get school kits before the new academic year",
    category: "Education",
    goalAmount: 120000,
    raisedAmount: 42000,
    deadline: "2026-06-15",
    location: "Jaipur, Rajasthan",
    beneficiaryName: "Government School Students",
    organizerName: "Youth Education Circle",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    story:
      "Students in a low-income neighborhood need notebooks, bags, uniforms, and basic learning materials to start school with confidence.",
    fundUse:
      "Funds will purchase school bags, notebooks, stationery, uniforms, and classroom learning supplies.",
    createdAt: "2026-03-20T10:00:00.000Z",
  },
];

const readCampaigns = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Unable to read crowdfunding campaigns:", error);
    return [];
  }
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function CrowdfundingPage() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    setCampaigns(readCampaigns());
  }, []);

  const visibleCampaigns = useMemo(
    () => (campaigns.length > 0 ? campaigns : sampleCampaigns),
    [campaigns],
  );

  const totals = useMemo(() => {
    return visibleCampaigns.reduce(
      (summary, campaign) => ({
        raised: summary.raised + (Number(campaign.raisedAmount) || 0),
        goal: summary.goal + (Number(campaign.goalAmount) || 0),
      }),
      { raised: 0, goal: 0 },
    );
  }, [visibleCampaigns]);

  return (
    <>
      <div className="bg-pink-100 border-b border-pink-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Crowdfunding</h1>
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#F43676] transition-colors">
              Home
            </Link>
            <FaChevronRight className="text-gray-400 text-xs" />
            <span className="text-[#1a1a2e] font-medium">Crowdfunding</span>
          </nav>
        </div>
      </div>

      <main className="min-h-screen bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
            <div>
              <p className="text-[#F43676] font-semibold mb-2">People helping people</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-3">
                Active fundraising campaigns
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Browse community fundraisers and support campaigns that clearly explain the need, goal, and use of funds.
              </p>
            </div>
            <Link
              href="/start-crowdfunding"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#F43676] to-[#e02a60] px-6 py-3 font-semibold text-white shadow-lg shadow-pink-200 transition-all hover:shadow-pink-300"
            >
              <FaPlus />
              Start Crowdfunding
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">Campaigns</p>
              <p className="text-3xl font-bold text-[#1a1a2e]">{visibleCampaigns.length}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">Raised</p>
              <p className="text-3xl font-bold text-[#1a1a2e]">{formatCurrency(totals.raised)}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">Total Goals</p>
              <p className="text-3xl font-bold text-[#1a1a2e]">{formatCurrency(totals.goal)}</p>
            </div>
          </div>

          {campaigns.length === 0 && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              Sample campaigns are shown until the first crowdfunding campaign is created on this browser.
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleCampaigns.map((campaign, index) => {
              const goalAmount = Number(campaign.goalAmount) || 0;
              const raisedAmount = Number(campaign.raisedAmount) || 0;
              const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

              return (
                <motion.article
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm"
                >
                  <div className="relative h-48 bg-gray-100">
                    {campaign.imageUrl ? (
                      <Image
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-blue-100">
                        <FaHandHoldingHeart className="text-5xl text-[#F43676]" />
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#302d55] shadow-sm">
                      {campaign.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#1a1a2e] line-clamp-2 mb-3">
                      {campaign.title}
                    </h3>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                      <span className="inline-flex items-center gap-1">
                        <FaLocationDot className="text-[#F43676]" />
                        {campaign.location || "India"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FaCalendar className="text-[#F43676]" />
                        Ends {formatDate(campaign.deadline)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {campaign.story}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-[#1a1a2e]">
                          {formatCurrency(raisedAmount)}
                        </span>
                        <span className="text-gray-500">
                          of {formatCurrency(goalAmount)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#F43676] to-[#2D3A8C]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 mb-4">
                      <p className="text-xs text-gray-500">Beneficiary</p>
                      <p className="text-sm font-semibold text-[#302d55]">{campaign.beneficiaryName}</p>
                    </div>

                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#302d55] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#201d3f]"
                    >
                      <FaIndianRupeeSign />
                      Support Campaign
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
