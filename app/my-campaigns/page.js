"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaChevronRight, 
  FaHandHoldingHeart, 
  FaIndianRupeeSign, 
  FaCalendar, 
  FaClock, 
  FaCircleCheck as FaCheckCircle, 
  FaCircleXmark as FaTimesCircle, 
  FaWallet,
  FaSpinner,
  FaPlus
} from "react-icons/fa6";
import axios from "axios";

const MyCampaignsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/my-campaigns");
    } else if (user) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const [campRes, withRes] = await Promise.all([
        axios.get(`${backendUrl}/api/crowdfunding/my`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`${backendUrl}/api/withdrawals/my`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);
      setCampaigns(campRes.data);
      setWithdrawals(withRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    const availableBalance = selectedCampaign.availableBalance || 0;
    if (Number(withdrawAmount) > availableBalance) {
      alert("Amount cannot exceed available funds (including pending requests).");
      return;
    }

    setSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await axios.post(`${backendUrl}/api/withdrawals`, {
        campaignId: selectedCampaign._id,
        amount: Number(withdrawAmount)
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert("Withdrawal request submitted successfully!");
      setShowWithdrawForm(false);
      setWithdrawAmount("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex justify-center items-center">
        <FaSpinner className="animate-spin text-3xl text-[#F43676]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-pink-100 border-b border-pink-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">My Campaigns</h1>
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#F43676] transition-colors">Home</Link>
            <FaChevronRight className="text-gray-400 text-xs" />
            <Link href="/my-profile" className="hover:text-[#F43676] transition-colors">Profile</Link>
            <FaChevronRight className="text-gray-400 text-xs" />
            <span className="text-[#1a1a2e] font-medium">Crowdfunding</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Actions */}
        <div className="flex justify-end mb-8">
          <Link href="/start-crowdfunding">
            <button className="flex items-center gap-2 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
              <FaPlus /> Start New Campaign
            </button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Campaigns List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FaHandHoldingHeart className="text-[#F43676]" /> Active Campaigns
            </h2>
            
            {campaigns.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <p className="text-slate-500">You haven&apos;t created any campaigns yet.</p>
              </div>
            ) : (
              campaigns.map(c => (
                <div key={c._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><FaHandHoldingHeart size={40}/></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{c.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.approved ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                        {c.approved ? "Approved" : "Pending Approval"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Total Raised</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center"><FaIndianRupeeSign className="text-[10px]"/> {c.raisedAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Approved</p>
                        <p className="text-sm font-bold text-red-500 flex items-center"><FaIndianRupeeSign className="text-[10px]"/> {(c.withdrawnAmount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Pending</p>
                        <p className="text-sm font-bold text-yellow-600 flex items-center"><FaIndianRupeeSign className="text-[10px]"/> {(c.pendingAmount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Available</p>
                        <p className="text-sm font-bold text-green-600 flex items-center"><FaIndianRupeeSign className="text-[10px]"/> {(c.availableBalance || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Goal</p>
                        <p className="text-sm font-bold text-slate-500 flex items-center"><FaIndianRupeeSign className="text-[10px]"/> {c.goalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Deadline</p>
                        <p className="text-sm font-bold text-slate-800">{new Date(c.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Link href={`/crowdfunding/${c.slug}`} className="flex-1">
                        <button className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">View Page</button>
                      </Link>
                      <button 
                        onClick={() => {
                          setSelectedCampaign(c);
                          setShowWithdrawForm(true);
                        }}
                        disabled={(c.availableBalance || 0) <= 0}
                        className="flex-1 py-2 bg-[#F43676] text-white rounded-lg text-sm font-bold hover:bg-[#e02a60] transition-colors disabled:opacity-50"
                      >
                        Withdraw Funds
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Withdrawals List */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FaWallet className="text-[#F43676]" /> Withdrawal History
            </h2>
            <div className="space-y-3">
              {withdrawals.length === 0 ? (
                <p className="text-slate-400 text-sm italic">No withdrawal requests yet.</p>
              ) : (
                withdrawals.map(w => (
                  <div key={w._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-800 flex items-center"><FaIndianRupeeSign className="text-xs"/> {w.amount.toLocaleString()}</span>
                      {w.status === "pending" && <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full flex items-center gap-1"><FaClock /> Pending</span>}
                      {w.status === "approved" && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1"><FaCheckCircle /> Approved</span>}
                      {w.status === "rejected" && <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1"><FaTimesCircle /> Rejected</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{w.campaign?.title}</p>
                    <p className="text-[10px] text-slate-300 mt-1">{new Date(w.createdAt).toLocaleString()}</p>
                    {w.adminMessage && <p className="mt-2 text-[10px] p-2 bg-slate-50 rounded italic text-slate-500">Note: {w.adminMessage}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawForm && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Request Withdrawal</h3>
            <p className="text-slate-500 text-sm mb-6">Campaign: {selectedCampaign.title}</p>
            
            <form onSubmit={handleWithdrawRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Withdrawal Amount</label>
                <div className="relative">
                  <FaIndianRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={selectedCampaign.availableBalance || 0}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#F43676]"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Available Balance: ₹{(selectedCampaign.availableBalance || 0).toLocaleString()}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Settlement Account</p>
                <p className="text-sm text-slate-800 font-medium">{selectedCampaign.bankDetails.accountHolderName}</p>
                <p className="text-xs text-slate-500">{selectedCampaign.bankDetails.bankName} - {selectedCampaign.bankDetails.accountNumber}</p>
                <p className="text-xs text-slate-500">IFSC: {selectedCampaign.bankDetails.ifscCode}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowWithdrawForm(false)}
                  className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#F43676] text-white font-bold rounded-xl shadow-lg hover:bg-[#e02a60] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCampaignsPage;
