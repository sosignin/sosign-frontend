"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
    FaWallet,
    FaPlus,
    FaMinus,
    FaArrowUp,
    FaArrowDown,
    FaHistory,
    FaSpinner,
    FaCamera,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
} from "react-icons/fa";


export default function WalletPage() {
    const { user, walletBalance, fetchWalletBalance } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addAmount, setAddAmount] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [currentRequest, setCurrentRequest] = useState(null);
    const [upiLink, setUpiLink] = useState("");
    const [screenshot, setScreenshot] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeRequests, setActiveRequests] = useState([]);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    // Fetch wallet data and active requests
    const fetchWalletData = async () => {
        try {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) return;

            const userData = JSON.parse(storedUser);
            if (!userData.token) return;

            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            // Fetch normal transactions
            const txResponse = await fetch(`${backendUrl}/api/wallet`, {
                headers: { Authorization: `Bearer ${userData.token}` },
            });

            if (txResponse.ok) {
                const data = await txResponse.json();
                setTransactions(data.transactions || []);
            }

            // Fetch my wallet requests
            const reqResponse = await fetch(`${backendUrl}/api/wallet-requests/my-requests`, {
                headers: { Authorization: `Bearer ${userData.token}` },
            });

            if (reqResponse.ok) {
                const data = await reqResponse.json();
                setActiveRequests(data.requests || []);
            }
        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchWalletData();
        }
    }, [user]);

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        const amt = parseFloat(addAmount);
        if (!addAmount || amt <= 0) {
            setMessage({ type: "error", text: "Please enter a valid amount" });
            return;
        }

        if (!quickAmounts.includes(amt) && amt < 99000) {
            setMessage({ type: "error", text: "Minimum custom amount is ₹99,000" });
            return;
        }

        setIsAdding(true);
        setMessage({ type: "", text: "" });

        try {
            const storedUser = localStorage.getItem("user");
            const userData = JSON.parse(storedUser);
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const response = await fetch(`${backendUrl}/api/wallet-requests/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userData.token}`,
                },
                body: JSON.stringify({ amount: amt }),
            });

            const data = await response.json();

            if (response.ok) {
                setCurrentRequest(data.request);
                setUpiLink(data.upiLink);
                setShowAddForm(false);
            } else {
                setMessage({ type: "error", text: data.message || "Failed to initiate request" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred. Please try again." });
        } finally {
            setIsAdding(false);
        }
    };

    const handleScreenshotUpload = async (e) => {
        e.preventDefault();
        if (!screenshot || !currentRequest) return;

        setIsUploading(true);
        setMessage({ type: "", text: "" });

        try {
            const storedUser = localStorage.getItem("user");
            const userData = JSON.parse(storedUser);
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const formData = new FormData();
            formData.append("screenshot", screenshot);

            const response = await fetch(`${backendUrl}/api/wallet-requests/upload-proof/${currentRequest._id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userData.token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Proof uploaded! Admin will verify your payment shortly." });
                setCurrentRequest(null);
                setScreenshot(null);
                fetchWalletData();
            } else {
                setMessage({ type: "error", text: data.message || "Upload failed" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Upload failed. Please try again." });
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const quickAmounts = [999, 49000];

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold text-[#302d55] mb-2">My Points Wallet</h1>
                    <p className="text-gray-500">Manage your wallet balance in points (₹5 = 1 Point)</p>
                </motion.div>

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-[#F43676] to-[#e02a60] rounded-3xl p-8 mb-8 shadow-xl shadow-pink-200/50"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <FaWallet className="text-white text-2xl" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Available Balance</p>
                            <h2 className="text-4xl font-bold text-white">
                                {walletBalance.toFixed(1)} <span className="text-2xl font-normal opacity-80">Points</span>
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="w-full bg-white text-[#F43676] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                        <FaPlus className="text-sm" />
                        Purchase Points
                    </button>
                </motion.div>

                {/* Payment Instructions (Only if request exists) */}
                {currentRequest && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 mb-8 shadow-xl border-2 border-[#F43676]"
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-[#302d55] mb-2 text-pink-600 uppercase">
                                Complete Your Payment
                            </h3>
                            <p className="text-gray-500 mb-6">Scan QR or use UPI button to pay ₹{currentRequest.amount.toLocaleString()}</p>

                            <div className="bg-gray-50 p-6 rounded-2xl inline-block mb-6 border border-gray-100 shadow-inner">
                                <img src="/qrcode.jpeg" alt="QR Code" className="w-[200px] h-[200px] object-contain mx-auto" />
                            </div>

                            <div className="mb-6">
                                <a
                                    href={upiLink}
                                    className="inline-flex items-center gap-2 bg-[#F43676] text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
                                >
                                    Pay via UPI App
                                </a>
                            </div>

                            <div className="bg-pink-50 rounded-xl p-4 mb-8 text-left">
                                <p className="text-xs text-pink-600 font-bold uppercase mb-1">Transaction Reference</p>
                                <p className="text-[#302d55] font-mono font-bold break-all">{currentRequest.referenceId}</p>
                            </div>

                            <div className="border-t border-gray-100 pt-8">
                                <h4 className="font-semibold text-[#302d55] mb-4 flex items-center justify-center gap-2">
                                    <FaCamera className="text-pink-500" />
                                    Upload Payment Proof
                                </h4>
                                <form onSubmit={handleScreenshotUpload} className="space-y-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setScreenshot(e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isUploading || !screenshot}
                                        className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            "Confirm Payment Sent"
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentRequest(null)}
                                        className="w-full py-2 text-gray-400 text-sm hover:text-gray-600"
                                    >
                                        Cancel Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Add Money Form */}
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-100"
                    >
                        <h3 className="text-lg font-semibold text-[#302d55] mb-4">
                            Purchase Points
                        </h3>

                        {message.text && (
                            <div
                                className={`p-3 rounded-lg mb-4 ${message.type === "success"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        {/* Quick Amount Buttons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {quickAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setAddAmount(amount.toString())}
                                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${addAmount === amount.toString()
                                        ? "border-[#F43676] bg-pink-50 text-[#F43676]"
                                        : "border-gray-200 hover:border-[#F43676] text-gray-600"
                                        }`}
                                >
                                    ₹{amount.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleCreateRequest}>
                            <div className="relative mb-4">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="Min ₹99,000 for custom entry"
                                    min="1"
                                    step="0.01"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F43676] focus:outline-none text-lg"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAdding || (!!addAmount && !quickAmounts.includes(parseFloat(addAmount)) && parseFloat(addAmount) < 99000)}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-medium hover:shadow-lg hover:shadow-pink-300/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isAdding ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Confirm Purchase"
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Active Requests */}
                {activeRequests.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-[#302d55] mb-4 flex items-center gap-2">
                            <FaClock className="text-orange-400" />
                            Recent Recharge Requests
                        </h3>
                        <div className="space-y-3">
                            {activeRequests.map((req) => (
                                <div key={req._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800">₹{req.amount.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">Ref: {req.referenceId}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {req.status === "pending" && (
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                                Waiting for Payment
                                            </span>
                                        )}
                                        {req.status === "verification_pending" && (
                                            <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                                Verifying Screenshot
                                            </span>
                                        )}
                                        {req.status === "approved" && (
                                            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
                                                <FaCheckCircle className="text-[8px]" /> Approved
                                            </span>
                                        )}
                                        {req.status === "rejected" && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
                                                <FaTimesCircle className="text-[8px]" /> Rejected
                                            </span>
                                        )}
                                        {req.status === "pending" && (
                                            <button
                                                onClick={() => {
                                                    setCurrentRequest(req);
                                                    setUpiLink(`upi://pay?pa=yourupi@bank&pn=SOSign&am=${req.amount}&tn=${req.referenceId}`);
                                                }}
                                                className="text-xs text-blue-600 hover:underline font-bold"
                                            >
                                                Complete Payment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transaction History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <FaHistory className="text-[#F43676]" />
                        <h3 className="text-lg font-semibold text-[#302d55]">
                            Transaction History
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <FaSpinner className="animate-spin text-[#F43676] text-2xl" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaWallet className="text-gray-400 text-xl" />
                            </div>
                            <p className="text-gray-500">No transactions yet</p>
                            <p className="text-gray-400 text-sm">
                                Add money to your wallet to get started
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((transaction, index) => (
                                <motion.div
                                    key={transaction._id || index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "credit"
                                            ? "bg-green-100"
                                            : "bg-red-100"
                                            }`}
                                    >
                                        {transaction.type === "credit" ? (
                                            <FaArrowDown className="text-green-600" />
                                        ) : (
                                            <FaArrowUp className="text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-[#302d55]">
                                            {transaction.description}
                                        </p>
                                        <p className="text-sm text-gray-400 text-xs italic">
                                            {formatDate(transaction.createdAt)}
                                        </p>
                                    </div>
                                    <p
                                        className={`font-semibold ${transaction.type === "credit"
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`}
                                    >
                                        {transaction.type === "credit" ? "+" : "-"}{transaction.amount.toFixed(1)} Pts
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
