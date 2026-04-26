"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaCalendar,
  FaCircleCheck,
  FaCircleInfo,
  FaHandHoldingHeart,
  FaHeart,
  FaHospital,
  FaIndianRupeeSign,
  FaLocationDot,
  FaShareNodes,
  FaSpinner,
  FaUser,
  FaUserDoctor,
} from "react-icons/fa6";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

export default function CampaignPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user } = useAuth();
  const router = useRouter();
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await axios.get(`${backendUrl}/api/crowdfunding/${id}`);
        setCampaign(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load campaign. It may not exist or has been removed.");
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleDonate = async (e) => {
    e.preventDefault();
    const amount = Number(donationAmount);
    
    if (!amount || amount < (campaign?.settings?.minDonation || 100)) {
      alert(`Minimum donation is ₹${campaign?.settings?.minDonation || 100}`);
      return;
    }

    setIsDonating(true);
    
    try {
      // Dummy donation flow
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await axios.post(`${backendUrl}/api/crowdfunding/${campaign._id}/donate`, {
        amount,
        name: donorName || "Anonymous",
      }, {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {},
      });

      if (response.data.success) {
        setDonationSuccess(true);
        setCampaign(prev => ({
          ...prev,
          raisedAmount: response.data.campaign.raisedAmount,
          donorsCount: response.data.campaign.donorsCount,
        }));
        setDonationAmount("");
        setDonorName("");
        
        setTimeout(() => setDonationSuccess(false), 5000);
      }
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 text-center">
        <FaCircleInfo className="text-5xl text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Campaign Not Found</h2>
        <p className="text-slate-500 mb-6 max-w-md">{error}</p>
        <button onClick={() => router.push("/crowdfunding")} className="px-6 py-2 bg-[#F43676] text-white rounded-lg font-bold">
          Explore Campaigns
        </button>
      </div>
    );
  }

  const progress = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{campaign.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium">
              {campaign.category}
            </span>
            <span className="flex items-center gap-1">
              <FaLocationDot className="text-[#F43676]" /> {campaign.location}
            </span>
            <span className="flex items-center gap-1">
              <FaCalendar className="text-[#F43676]" /> 
              Ends on {new Date(campaign.deadline).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 px-4 grid lg:grid-cols-3 gap-8">
        {/* Left Column: Image, Story, Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl overflow-hidden shadow-lg shadow-slate-200 border border-slate-100 aspect-video relative">
            {campaign.image ? (
              <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                <FaHandHoldingHeart className="text-6xl" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-4">The Story</h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {campaign.story}
            </div>
          </div>

          {campaign.medicalDetails?.hospitalName && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaHospital className="text-[#F43676]" /> Medical Proof
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Hospital</p>
                  <p className="text-slate-800 font-medium">{campaign.medicalDetails.hospitalName}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Doctor</p>
                  <p className="text-slate-800 font-medium">{campaign.medicalDetails.doctorName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Donation Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-8">
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black text-slate-900 flex items-center gap-1">
                  <FaIndianRupeeSign className="text-lg" /> {campaign.raisedAmount.toLocaleString()}
                </span>
                <span className="text-sm text-slate-500">raised of ₹{campaign.goalAmount.toLocaleString()}</span>
              </div>
              
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#F43676] to-[#e02a60]"
                />
              </div>
              
              <div className="flex justify-between mt-3 text-xs font-bold">
                <span className="text-[#F43676]">{progress.toFixed(1)}% complete</span>
                <span className="text-slate-800">{campaign.donorsCount} supporters</span>
              </div>
            </div>

            {donationSuccess ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 border border-green-100 p-6 rounded-2xl text-center"
              >
                <FaCircleCheck className="text-4xl text-green-500 mx-auto mb-3" />
                <h3 className="text-green-800 font-bold text-lg">Thank You!</h3>
                <p className="text-green-600 text-sm">Your contribution has been received.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleDonate} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[100, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt.toString())}
                      className={`py-2 rounded-xl border font-bold text-sm transition-all ${
                        donationAmount === amt.toString() 
                        ? "bg-[#F43676] border-[#F43676] text-white shadow-lg shadow-pink-100" 
                        : "bg-white border-slate-200 text-slate-600 hover:border-[#F43676] hover:text-[#F43676]"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <FaIndianRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    required
                    min={campaign.settings?.minDonation || 100}
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                    placeholder="Other Amount"
                  />
                </div>

                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#F43676] outline-none"
                    placeholder="Your Name (Optional)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isDonating}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-bold shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDonating ? <FaSpinner className="animate-spin" /> : <FaHeart />}
                  {isDonating ? "Processing..." : "Donate Now"}
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between gap-4">
              <button className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
                <FaShareNodes /> Share
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaHeart className="text-[#F43676]" /> Recent Supporters
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto no-scrollbar">
              {campaign.donations?.length > 0 ? (
                campaign.donations.slice().reverse().map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#F43676]/10 flex items-center justify-center text-[#F43676]">
                      <FaUser />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-500">donated ₹{d.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 text-sm py-8">No donations yet. Be the first to support!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
