"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronRight,
  FaPlus,
  FaLink,
  FaShare,
  FaEyeSlash,
  FaTrophy,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaClock,
  FaFileSignature,
  FaPenFancy,
  FaUsers,
  FaCalendarAlt,
  FaArrowRight,
  FaEdit
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../../components/LoginModal";

const MyPetitionsPage = () => {
  // State for created petitions
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for signed petitions
  const [signedPetitions, setSignedPetitions] = useState([]);
  const [signedLoading, setSignedLoading] = useState(true);
  const [signedError, setSignedError] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("created");
  const [declareVictoryLoading, setDeclareVictoryLoading] = useState(null);
  const [hideRequestLoading, setHideRequestLoading] = useState(null);
  const [hideRequestStatus, setHideRequestStatus] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(null);
  const [hideReason, setHideReason] = useState("");
  const [showSignersModal, setShowSignersModal] = useState(false);
  const [allSigners, setAllSigners] = useState([]);
  const [signersLoading, setSignersLoading] = useState(false);

  // Edit petition state
  const [showEditModal, setShowEditModal] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    country: "",
    categories: [],
    decisionMakers: [{ name: "", organization: "", email: "", phone: "" }],
    problem: "",
    solution: "",
    videoUrl: "",
    constituencySettings: {
      required: false,
      allowedConstituency: "",
    },
    signingRequirements: {
      constituency: {
        required: false,
        allowedConstituency: "",
      },
      aadhar: {
        required: false,
      },
    },
  });

  const { user, loading: authLoading } = useAuth();

  // Fetch hide request status for all petitions
  const fetchHideRequestStatus = async (petitionIds, token) => {
    const statuses = {};
    for (const petitionId of petitionIds) {
      try {
        const response = await fetch(`/api/hide-requests/check/${petitionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          statuses[petitionId] = data;
        }
      } catch (error) {
        console.error(`Error checking hide status for ${petitionId}:`, error);
      }
    }
    setHideRequestStatus(statuses);
  };

  // Fetch my created petitions
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchMyPetitions = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem("user"));

        if (!userInfo || !userInfo.token) {
          setError("User not authenticated.");
          setShowLoginModal(true);
          setLoading(false);
          return;
        }

        const response = await fetch("/api/petitions/my-petitions", {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setPetitions(data.petitions);

        if (data.petitions.length > 0) {
          const petitionIds = data.petitions.map(p => p._id);
          await fetchHideRequestStatus(petitionIds, userInfo.token);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPetitions();
  }, [user, authLoading]);

  // Fetch signed petitions
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchSignedPetitions = async () => {
      try {
        setSignedLoading(true);
        const userInfo = JSON.parse(localStorage.getItem("user"));

        if (!userInfo || !userInfo.token) {
          setSignedLoading(false);
          return;
        }

        const response = await fetch("/api/petitions/signed", {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSignedPetitions(data.petitions || []);
        }
      } catch (err) {
        setSignedError(err.message);
      } finally {
        setSignedLoading(false);
      }
    };

    fetchSignedPetitions();
  }, [user, authLoading]);

  // Check auth loading state
  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginModal(true);
      setLoading(false);
      setSignedLoading(false);
    }
  }, [user, authLoading]);

  const copyToClipboard = (petitionSlug) => {
    const url = `${window.location.origin}/currentpetitions/${petitionSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const sharePetition = (petition) => {
    if (navigator.share) {
      navigator.share({
        title: petition.title,
        text: petition.petitionDetails?.problem?.substring(0, 100) + "...",
        url: `${window.location.origin}/currentpetitions/${petition.slug}`,
      });
    } else {
      copyToClipboard(petition.slug);
    }
  };

  const requestHidePetition = async (petitionId) => {
    try {
      setHideRequestLoading(petitionId);
      const userInfo = JSON.parse(localStorage.getItem("user"));

      const response = await fetch("/api/hide-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          petitionId,
          reason: hideReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setHideRequestStatus(prev => ({
          ...prev,
          [petitionId]: { hasRequest: true, status: "pending" },
        }));
        setShowHideModal(null);
        setHideReason("");
        alert("Hide request submitted successfully! Awaiting admin approval.");
      } else {
        alert(data.message || "Failed to submit hide request");
      }
    } catch (error) {
      alert("Error submitting hide request. Please try again.");
    } finally {
      setHideRequestLoading(null);
    }
  };

  const declareVictory = async (petitionId) => {
    const petition = petitions.find((p) => p._id === petitionId);
    if (!petition) return;

    if (!window.confirm("Are you sure you want to declare victory? This will move your petition to successful petitions.")) return;

    try {
      setDeclareVictoryLoading(petitionId);
      const userInfo = JSON.parse(localStorage.getItem("user"));

      const successfulPetitionData = {
        petitionTitle: petition.title || "Untitled Petition",
        totalSignatures: petition.numberOfSignatures >= 0 ? petition.numberOfSignatures : 1,
        decisionMakers: petition.decisionMakers?.length > 0
          ? petition.decisionMakers.map((dm) => ({
            name: dm.name || "Unknown",
            email: dm.email || "contact@example.com",
            organization: dm.organization || "",
            phone: dm.phone || "",
          }))
          : [{ name: "General Decision Makers", email: "contact@example.com", organization: "", phone: "" }],
        issue: petition.petitionDetails?.problem || "No description",
        location: petition.country || "Not specified",
        petitionStarterName: petition.petitionStarter?.name || "Anonymous",
        startedDate: petition.createdAt ? new Date(petition.createdAt).toISOString() : new Date().toISOString(),
        image: petition.petitionDetails?.image || null,
        originalPetitionId: petition._id,
        outcome: "Goal achieved through community support",
        category: "Other",
      };

      const successResponse = await fetch("/api/successful-petitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(successfulPetitionData),
      });

      if (!successResponse.ok) throw new Error("Failed to create successful petition");

      await fetch(`/api/petitions/${petitionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      setPetitions(petitions.filter((p) => p._id !== petitionId));
      alert("🎉 Congratulations! Your petition has been declared successful!");
    } catch (error) {
      alert(`Failed to declare victory: ${error.message}`);
    } finally {
      setDeclareVictoryLoading(null);
    }
  };

  const fetchSigners = async () => {
    try {
      setSignersLoading(true);
      setShowSignersModal(true);
      const userInfo = JSON.parse(localStorage.getItem("user"));
      const response = await fetch("/api/petitions/my-petitions/signers", {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAllSigners(data);
      }
    } catch (error) {
      console.error("Error fetching signers:", error);
    } finally {
      setSignersLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openEditModal = (petition) => {
    setEditFormData({
      title: petition.title || "",
      country: petition.country || "",
      categories: petition.categories || [],
      decisionMakers: petition.decisionMakers?.length > 0
        ? petition.decisionMakers.map(dm => ({
          name: dm.name || "",
          organization: dm.organization || "",
          email: dm.email || "",
          phone: dm.phone || "",
        }))
        : [{ name: "", organization: "", email: "", phone: "" }],
      problem: petition.petitionDetails?.problem || "",
      solution: petition.petitionDetails?.solution || "",
      videoUrl: petition.petitionDetails?.videoUrl || "",
      constituencySettings: {
        required: petition.constituencySettings?.required || false,
        allowedConstituency: petition.constituencySettings?.allowedConstituency || "",
      },
      signingRequirements: {
        constituency: {
          required: petition.signingRequirements?.constituency?.required || false,
          allowedConstituency: petition.signingRequirements?.constituency?.allowedConstituency || "",
        },
        aadhar: {
          required: petition.signingRequirements?.aadhar?.required || false,
        },
      },
    });
    setShowEditModal(petition._id);
  };

  const updateDecisionMaker = (index, field, value) => {
    const updatedDMs = [...editFormData.decisionMakers];
    updatedDMs[index] = { ...updatedDMs[index], [field]: value };
    setEditFormData({ ...editFormData, decisionMakers: updatedDMs });
  };

  const addDecisionMaker = () => {
    setEditFormData({
      ...editFormData,
      decisionMakers: [...editFormData.decisionMakers, { name: "", organization: "", email: "", phone: "" }],
    });
  };

  const removeDecisionMaker = (index) => {
    if (editFormData.decisionMakers.length > 1) {
      const updatedDMs = editFormData.decisionMakers.filter((_, i) => i !== index);
      setEditFormData({ ...editFormData, decisionMakers: updatedDMs });
    }
  };

  const handleUpdatePetition = async (petitionId) => {
    try {
      setEditLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("user"));

      const response = await fetch(`/api/petitions/${petitionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          title: editFormData.title,
          country: editFormData.country,
          decisionMakers: editFormData.decisionMakers.filter(dm => dm.name && dm.email),
          petitionDetails: {
            problem: editFormData.problem,
            solution: editFormData.solution,
            videoUrl: editFormData.videoUrl,
          },
          constituencySettings: {
            required: editFormData.constituencySettings.required,
            allowedConstituency: editFormData.constituencySettings.allowedConstituency?.trim() || undefined,
          },
          signingRequirements: {
            constituency: {
              required: editFormData.signingRequirements.constituency.required,
              allowedConstituency: editFormData.signingRequirements.constituency.allowedConstituency?.trim() || undefined,
            },
            aadhar: {
              required: editFormData.signingRequirements.aadhar.required,
            },
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setPetitions(petitions.map(p =>
          p._id === petitionId
            ? {
              ...p,
              title: editFormData.title,
              country: editFormData.country,
              decisionMakers: editFormData.decisionMakers.filter(dm => dm.name && dm.email),
              petitionDetails: {
                ...p.petitionDetails,
                problem: editFormData.problem,
                solution: editFormData.solution,
                videoUrl: editFormData.videoUrl,
              },
              constituencySettings: {
                required: editFormData.constituencySettings.required,
                allowedConstituency: editFormData.constituencySettings.allowedConstituency?.trim() || undefined,
              },
              signingRequirements: {
                constituency: {
                  required: editFormData.signingRequirements.constituency.required,
                  allowedConstituency: editFormData.signingRequirements.constituency.allowedConstituency?.trim() || undefined,
                },
                aadhar: {
                  required: editFormData.signingRequirements.aadhar.required,
                },
              },
            }
            : p
        ));
        setShowEditModal(null);
        alert("Petition updated successfully!");
      } else {
        alert(data.message || "Failed to update petition");
      }
    } catch (error) {
      console.error("Error updating petition:", error);
      alert("Error updating petition. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Please Login</h1>
            <p className="text-gray-500">Login to view your petitions.</p>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  return (
    <>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a1a2e] via-[#2D3A8C] to-[#1a1a2e] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Petitions</h1>
              <p className="text-gray-300">Manage your campaigns and track your impact</p>
              <nav className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <FaChevronRight className="text-xs" />
                <span className="text-white">My Petitions</span>
              </nav>
            </div>
            <Link href="/start-petition">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2"
              >
                <FaPlus />
                Create New Petition
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white border-b border-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-4 border border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F43676]/10 flex items-center justify-center">
                  <FaPenFancy className="text-[#F43676]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1a1a2e]">{petitions.length}</p>
                  <p className="text-xs text-gray-500">Created</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FaFileSignature className="text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1a1a2e]">{signedPetitions.length}</p>
                  <p className="text-xs text-gray-500">Signed</p>
                </div>
              </div>
            </div>
            <div 
              onClick={fetchSigners}
              className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100 cursor-pointer hover:shadow-md transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <FaUsers className="text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1a1a2e]">
                    {petitions.reduce((sum, p) => sum + (p.numberOfSignatures || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500">Total Signatures</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-4 border border-yellow-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <FaTrophy className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1a1a2e]">
                    {petitions.filter(p => p.approved).length}
                  </p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-[#f0f2f5] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("created")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "created"
                ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
            >
              <FaPenFancy className="text-sm" />
              My Petitions ({petitions.length})
            </button>
            <button
              onClick={() => setActiveTab("signed")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "signed"
                ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
            >
              <FaFileSignature className="text-sm" />
              Petitions I Signed ({signedPetitions.length})
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "created" ? (
              <motion.div
                key="created"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
                    Error: {error}
                  </div>
                ) : petitions.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaPenFancy className="text-[#F43676] text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Petitions Yet</h3>
                    <p className="text-gray-500 mb-6">Start making a difference today!</p>
                    <Link href="/start-petition">
                      <button className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-semibold py-3 px-6 rounded-xl">
                        Create Your First Petition
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {petitions.map((petition) => (
                      <motion.div
                        key={petition._id}
                        layout
                        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          {petition.petitionDetails?.image && (
                            <div className="md:w-64 h-48 md:h-auto relative flex-shrink-0">
                              <Image
                                src={petition.petitionDetails.image}
                                alt={petition.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-[#1a1a2e] mb-2 line-clamp-2">
                                  {petition.title}
                                </h3>
                                {petition.status === "approved" || petition.approved ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow-sm border border-green-200">
                                    <FaCheck className="mr-1" /> Approved
                                  </span>
                                ) : petition.status === "rejected" ? (
                                  <div className="flex flex-col gap-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 shadow-sm border border-red-200 w-fit">
                                      <FaTimes className="mr-1" /> Rejected
                                    </span>
                                    {petition.rejectionReason && (
                                      <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                                        <span className="font-bold">Reason:</span> {petition.rejectionReason}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 shadow-sm border border-yellow-200">
                                    <FaClock className="mr-1" /> Pending
                                  </span>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-3xl font-bold text-[#F43676]">{petition.numberOfSignatures || 0}</p>
                                <p className="text-xs text-gray-500">signatures</p>
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {petition.petitionDetails?.problem}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => copyToClipboard(petition.slug)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                              >
                                <FaLink className="text-xs" /> Copy Link
                              </button>
                              <button
                                onClick={() => sharePetition(petition)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-[#F43676] hover:bg-[#e02a60] text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <FaShare className="text-xs" /> Share
                              </button>
                              <button
                                onClick={() => openEditModal(petition)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-[#3650AD] hover:bg-[#2a4085] text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <FaEdit className="text-xs" /> Edit
                              </button>
                              <button
                                onClick={() => declareVictory(petition._id)}
                                disabled={declareVictoryLoading === petition._id}
                                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                              >
                                {declareVictoryLoading === petition._id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaTrophy className="text-xs" />
                                )}
                                Victory
                              </button>
                              {!petition.hidden && !hideRequestStatus[petition._id]?.hasRequest && (
                                <button
                                  onClick={() => setShowHideModal(petition._id)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                  <FaEyeSlash className="text-xs" /> Hide
                                </button>
                              )}
                              <Link href={`/currentpetitions/${petition.slug}`}>
                                <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-lg transition-colors">
                                  View <FaArrowRight className="text-xs" />
                                </button>
                              </Link>
                            </div>

                            {/* Hide Modal */}
                            {showHideModal === petition._id && (
                              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                <h4 className="font-semibold text-gray-700 mb-2">Request to Hide Petition</h4>
                                <textarea
                                  value={hideReason}
                                  onChange={(e) => setHideReason(e.target.value)}
                                  placeholder="Reason for hiding (optional)"
                                  className="w-full p-3 border border-gray-200 rounded-lg mb-3 text-sm"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => requestHidePetition(petition._id)}
                                    disabled={hideRequestLoading === petition._id}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg"
                                  >
                                    {hideRequestLoading === petition._id ? <FaSpinner className="animate-spin mx-auto" /> : "Submit"}
                                  </button>
                                  <button
                                    onClick={() => { setShowHideModal(null); setHideReason(""); }}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded-lg"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Edit Modal */}
                            {showEditModal === petition._id && (
                              <div className="mt-4 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                                <h4 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2 text-lg">
                                  <FaEdit className="text-[#3650AD]" /> Edit Petition
                                </h4>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                  {/* Title */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                      type="text"
                                      value={editFormData.title}
                                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none"
                                      placeholder="Petition title"
                                    />
                                  </div>

                                  {/* Country */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                                    <input
                                      type="text"
                                      value={editFormData.country}
                                      onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none"
                                      placeholder="Country"
                                    />
                                  </div>

                                  {/* Decision Makers */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Decision Makers</label>
                                    {editFormData.decisionMakers.map((dm, index) => (
                                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-xs font-medium text-gray-500">Decision Maker {index + 1}</span>
                                          {editFormData.decisionMakers.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => removeDecisionMaker(index)}
                                              className="text-red-500 hover:text-red-700 text-xs"
                                            >
                                              Remove
                                            </button>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <input
                                            type="text"
                                            value={dm.name}
                                            onChange={(e) => updateDecisionMaker(index, "name", e.target.value)}
                                            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3650AD] outline-none"
                                            placeholder="Name *"
                                          />
                                          <input
                                            type="email"
                                            value={dm.email}
                                            onChange={(e) => updateDecisionMaker(index, "email", e.target.value)}
                                            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3650AD] outline-none"
                                            placeholder="Email *"
                                          />
                                          <input
                                            type="text"
                                            value={dm.organization}
                                            onChange={(e) => updateDecisionMaker(index, "organization", e.target.value)}
                                            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3650AD] outline-none"
                                            placeholder="Organization"
                                          />
                                          <input
                                            type="text"
                                            value={dm.phone}
                                            onChange={(e) => updateDecisionMaker(index, "phone", e.target.value)}
                                            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3650AD] outline-none"
                                            placeholder="Phone"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={addDecisionMaker}
                                      className="text-sm text-[#3650AD] hover:text-[#2a4085] font-medium flex items-center gap-1"
                                    >
                                      <FaPlus className="text-xs" /> Add Decision Maker
                                    </button>
                                  </div>

                                  {/* Problem Description */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description *</label>
                                    <textarea
                                      value={editFormData.problem}
                                      onChange={(e) => setEditFormData({ ...editFormData, problem: e.target.value })}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none resize-none"
                                      rows={4}
                                      placeholder="Describe the problem..."
                                    />
                                  </div>

                                  {/* Proposed Solution */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Solution *</label>
                                    <textarea
                                      value={editFormData.solution}
                                      onChange={(e) => setEditFormData({ ...editFormData, solution: e.target.value })}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none resize-none"
                                      rows={4}
                                      placeholder="Describe your proposed solution..."
                                    />
                                  </div>

                                  {/* Video URL */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
                                    <input
                                      type="url"
                                      value={editFormData.videoUrl}
                                      onChange={(e) => setEditFormData({ ...editFormData, videoUrl: e.target.value })}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none"
                                      placeholder="https://youtube.com/..."
                                    />
                                  </div>

                                  {/* Signing Requirements */}
                                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <h4 className="text-sm font-semibold text-[#1a1a2e] mb-3">Signing Requirements</h4>
                                    <p className="text-xs text-gray-500 mb-4">
                                      You can require signers to provide their constituency number
                                      and/or Aadhar number. Select any or both to enhance identity
                                      verification for your petition.
                                    </p>

                                    {/* Toggle for constituency requirement */}
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 mb-3">
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">Require Constituency Number to Sign</p>
                                        <p className="text-xs text-gray-500">Signers must enter their constituency number</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newValue = !editFormData.signingRequirements.constituency.required;
                                          setEditFormData({
                                            ...editFormData,
                                            constituencySettings: {
                                              ...editFormData.constituencySettings,
                                              required: newValue
                                            },
                                            signingRequirements: {
                                              ...editFormData.signingRequirements,
                                              constituency: {
                                                ...editFormData.signingRequirements.constituency,
                                                required: newValue
                                              }
                                            }
                                          });
                                        }}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${editFormData.signingRequirements.constituency.required ? 'bg-[#3650AD]' : 'bg-gray-300'}`}
                                      >
                                        <span
                                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${editFormData.signingRequirements.constituency.required ? 'translate-x-6' : 'translate-x-0'}`}
                                        />
                                      </button>
                                    </div>

                                    {/* Allowed Constituency Input */}
                                    {editFormData.signingRequirements.constituency.required && (
                                      <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Restrict to Specific Constituency (Optional)
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">
                                          Leave blank to allow any constituency, or enter a specific number to restrict signing.
                                        </p>
                                        <input
                                          type="text"
                                          value={editFormData.signingRequirements.constituency.allowedConstituency}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditFormData({
                                              ...editFormData,
                                              constituencySettings: {
                                                ...editFormData.constituencySettings,
                                                allowedConstituency: val
                                              },
                                              signingRequirements: {
                                                ...editFormData.signingRequirements,
                                                constituency: {
                                                  ...editFormData.signingRequirements.constituency,
                                                  allowedConstituency: val
                                                }
                                              }
                                            });
                                          }}
                                          placeholder="e.g., 123 or leave empty"
                                          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3650AD] focus:border-transparent outline-none"
                                          maxLength={10}
                                        />
                                        {editFormData.signingRequirements.constituency.allowedConstituency && (
                                          <p className="text-blue-600 text-xs mt-2">
                                            Only users with constituency number &ldquo;{editFormData.signingRequirements.constituency.allowedConstituency}&rdquo; can sign this petition.
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {/* Toggle for Aadhar requirement */}
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">Require Aadhar Number to Sign</p>
                                        <p className="text-xs text-gray-500">Signers must enter their Aadhar number for verification</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setEditFormData({
                                          ...editFormData,
                                          signingRequirements: {
                                            ...editFormData.signingRequirements,
                                            aadhar: {
                                              ...editFormData.signingRequirements.aadhar,
                                              required: !editFormData.signingRequirements.aadhar.required
                                            }
                                          }
                                        })}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${editFormData.signingRequirements.aadhar.required ? 'bg-[#3650AD]' : 'bg-gray-300'}`}
                                      >
                                        <span
                                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${editFormData.signingRequirements.aadhar.required ? 'translate-x-6' : 'translate-x-0'}`}
                                        />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 pt-2">
                                    <button
                                      onClick={() => handleUpdatePetition(petition._id)}
                                      disabled={editLoading}
                                      className="flex-1 bg-[#3650AD] hover:bg-[#2a4085] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                                    >
                                      {editLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                      {editLoading ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                      onClick={() => setShowEditModal(null)}
                                      className="px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg flex items-center gap-2 hover:bg-gray-300"
                                    >
                                      <FaTimes /> Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="signed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {signedLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
                  </div>
                ) : signedPetitions.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaFileSignature className="text-blue-500 text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Signed Petitions</h3>
                    <p className="text-gray-500 mb-6">You haven&apos;t signed any petitions yet. Explore and support causes you care about!</p>
                    <Link href="/currentpetitions">
                      <button className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-semibold py-3 px-6 rounded-xl">
                        Browse Petitions
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {signedPetitions.map((petition) => (
                      <motion.div
                        key={petition._id}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                      >
                        {/* Image */}
                        <div className="h-40 relative bg-gray-100">
                          {petition.petitionDetails?.image ? (
                            <Image
                              src={petition.petitionDetails.image}
                              alt={petition.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-blue-100">
                              <FaFileSignature className="text-4xl text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                              <FaCheck className="mr-1 text-xs" /> Signed
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-[#1a1a2e] mb-2 line-clamp-2 text-sm">
                            {petition.title}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <FaUsers className="text-[#F43676]" />
                              {petition.numberOfSignatures || 0} signatures
                            </span>
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt />
                              {formatDate(petition.createdAt)}
                            </span>
                          </div>

                          <p className="text-gray-600 text-xs line-clamp-2 mb-3">
                            {petition.petitionDetails?.problem}
                          </p>

                          <Link href={`/currentpetitions/${petition.slug}`}>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                              View Petition <FaArrowRight className="text-xs" />
                            </button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence >
        </div >
      </div >

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Signers Modal */}
      <AnimatePresence>
        {showSignersModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignersModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                    <FaUsers className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Recent Signers</h3>
                    <p className="text-sm text-gray-500">Signatures across all your petitions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSignersModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FaTimes className="text-gray-400 text-xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {signersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
                    <p className="text-gray-500 font-medium">Loading signers list...</p>
                  </div>
                ) : allSigners.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider">
                          <th className="px-4 py-2 font-bold">Signer</th>
                          <th className="px-4 py-2 font-bold">Petition</th>
                          <th className="px-4 py-2 font-bold">Date</th>
                          <th className="px-4 py-2 font-bold">Referral</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSigners.map((signer, idx) => (
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            key={idx}
                            className="bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <td className="px-4 py-4 rounded-l-2xl">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm flex-shrink-0">
                                  {signer.user?.profilePicture ? (
                                    <Image
                                      src={signer.user.profilePicture}
                                      alt={signer.user.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 uppercase font-bold text-xs">
                                      {signer.user?.name?.substring(0, 2) || "AN"}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{signer.user?.name || "Anonymous"}</p>
                                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                                    {signer.user?.designation || "Citizen"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 max-w-[200px]">
                              <p className="text-sm font-medium text-gray-700 truncate">{signer.petitionTitle}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm text-gray-500">{formatDate(signer.signedAt)}</p>
                            </td>
                            <td className="px-4 py-4 rounded-r-2xl">
                              {signer.referral?.code ? (
                                <div className="flex flex-col">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 w-fit">
                                    {signer.referral.code}
                                  </span>
                                  {signer.referral.owner && (
                                    <span className="text-[10px] text-gray-400 mt-1">
                                      via {signer.referral.owner.name}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Direct</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUsers className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Signatures Yet</h3>
                    <p className="text-gray-500">Your petitions are waiting for support!</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t flex justify-end">
                <button
                  onClick={() => setShowSignersModal(false)}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MyPetitionsPage;
