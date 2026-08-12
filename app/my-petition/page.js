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
  FaEdit,
  FaComments,
} from "react-icons/fa";
import {
  FaPaw,
  FaGamepad,
  FaCouch,
  FaPersonRunning,
  FaLaptopCode,
  FaPlane,
  FaGraduationCap,
  FaHeartPulse,
  FaHandFist,
  FaLeaf,
  FaLandmarkDome,
  FaSpa,
  FaTags,
  FaWandMagicSparkles,
  FaImage,
  FaTrash,
  FaCircleInfo,
  FaCircleExclamation,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../../components/LoginModal";
import ImageCropper from "../../components/ImageCropper";

// Icon mapping for dynamic category icons
const iconMap = {
  FaPaw: FaPaw,
  FaGamepad: FaGamepad,
  FaCouch: FaCouch,
  FaSpa: FaSpa,
  FaPersonRunning: FaPersonRunning,
  FaLaptopCode: FaLaptopCode,
  FaPlane: FaPlane,
  FaLeaf: FaLeaf,
  FaGraduationCap: FaGraduationCap,
  FaHeartPulse: FaHeartPulse,
  FaLandmarkDome: FaLandmarkDome,
  FaHandFist: FaHandFist,
  FaTags: FaTags,
};

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

  // Categories state for Edit Modal
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // AI & Image State for Edit Modal
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [showAiImagePromptModal, setShowAiImagePromptModal] = useState(false);
  const [customAiImagePrompt, setCustomAiImagePrompt] = useState("");
  const [aiGeneratingImage, setAiGeneratingImage] = useState(false);
  const [aiImageError, setAiImageError] = useState("");

  // Edit petition state
  const [showEditModal, setShowEditModal] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    country: "India",
    categories: [],
    decisionMakers: [{ name: "", organization: "", email: "", phone: "" }],
    requestedSigners: [{ name: "", email: "", designation: "" }],
    problem: "",
    solution: "",
    videoUrl: "",
    images: [], // Array of { type: 'url', url } or { type: 'file', file, url }
    starter: {
      name: "",
      age: "",
      email: "",
      mobile: "",
      location: "",
      comment: "",
      pincode: "",
      mpConstituencyNumber: "",
      mlaConstituencyNumber: "",
    },
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

  // Comment management state
  const [showCommentsModal, setShowCommentsModal] = useState(null);
  const [pendingComments, setPendingComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [approvingComments, setApprovingComments] = useState(new Set());

  const { user, loading: authLoading } = useAuth();

  // Fetch categories list for category picker in Edit Modal
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          const transformedCategories = data.categories.map((cat) => ({
            id: cat.slug,
            label: cat.name,
            icon: iconMap[cat.icon] || FaTags,
          }));
          setCategoriesList(transformedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle dynamic creation of a new category inside Edit Modal
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }

    if (newCategoryName.trim().length < 3) {
      setCategoryError("Category name must be at least 3 characters");
      return;
    }

    if (newCategoryName.trim().length > 15) {
      setCategoryError("Category name can be up to 15 characters only");
      return;
    }

    setCreatingCategory(true);
    setCategoryError("");

    try {
      const userInfo = JSON.parse(localStorage.getItem("user"));
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.category) {
        const newCategory = {
          id: data.category.slug,
          label: data.category.name,
          icon: FaTags,
        };
        setCategoriesList((prev) => [...prev, newCategory]);

        setEditFormData((prev) => {
          if ((prev.categories || []).length < 2) {
            return {
              ...prev,
              categories: [...(prev.categories || []), data.category.slug],
            };
          }
          return prev;
        });

        setShowCategoryModal(false);
        setNewCategoryName("");
      } else {
        setCategoryError(data.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      setCategoryError("Failed to create category. Please try again.");
    } finally {
      setCreatingCategory(false);
    }
  };

  // Handle AI Title Optimization
  const handleAiOptimizeTitle = async () => {
    if (!editFormData.title || editFormData.title.trim().length === 0) {
      setAiError("Please enter a title first before optimizing with AI.");
      setTimeout(() => setAiError(""), 3000);
      return;
    }

    setAiOptimizing(true);
    setAiError("");

    try {
      const response = await fetch("/api/ai/optimize-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editFormData.title }),
      });

      const data = await response.json();

      if (response.ok && data.optimizedTitle) {
        setEditFormData((prev) => ({ ...prev, title: data.optimizedTitle }));
      } else {
        setAiError(data.message || "Failed to optimize title. Please try again.");
        setTimeout(() => setAiError(""), 4000);
      }
    } catch (error) {
      console.error("AI Optimization Error:", error);
      setAiError("Something went wrong. Please try again.");
      setTimeout(() => setAiError(""), 4000);
    } finally {
      setAiOptimizing(false);
    }
  };

  // Handle AI Image Generation
  const handleGenerateAiImage = async (overridePrompt = null) => {
    if ((editFormData.images || []).length >= 4) {
      setAiImageError("Maximum 4 images allowed. Please delete an image first.");
      setTimeout(() => setAiImageError(""), 4000);
      return;
    }

    const topicPrompt =
      overridePrompt || customAiImagePrompt || editFormData.title || editFormData.problem;

    if (!topicPrompt || topicPrompt.trim().length === 0) {
      setAiImageError("Please enter a petition title or problem description first.");
      setTimeout(() => setAiImageError(""), 4000);
      return;
    }

    setAiGeneratingImage(true);
    setAiImageError("");

    try {
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editFormData.title,
          problem: editFormData.problem,
          solution: editFormData.solution,
          prompt: overridePrompt || customAiImagePrompt,
        }),
      });

      const data = await response.json();

      if (response.ok && data.imageDataUrl) {
        const fetchRes = await fetch(data.imageDataUrl);
        const blob = await fetchRes.blob();
        const file = new File(
          [blob],
          `ai-petition-banner-${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        setTempImage(file);
        setShowCropper(true);
        setShowAiImagePromptModal(false);
        setCustomAiImagePrompt("");
      } else {
        setAiImageError(data.message || "Failed to generate image. Please try again.");
        setTimeout(() => setAiImageError(""), 4000);
      }
    } catch (error) {
      console.error("AI Image Generation Error:", error);
      setAiImageError("Something went wrong while generating image. Please try again.");
      setTimeout(() => setAiImageError(""), 4000);
    } finally {
      setAiGeneratingImage(false);
    }
  };

  // Image Selection & Crop complete handlers
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if ((editFormData.images || []).length >= 4) {
        alert("Maximum 4 images allowed. Please delete an existing image first.");
        return;
      }
      setTempImage(file);
      setShowCropper(true);
    }
    // reset input value so selecting same file again works
    e.target.value = "";
  };

  const handleCropComplete = (croppedFile) => {
    setShowCropper(false);
    setTempImage(null);

    const newImgObj = {
      type: "file",
      file: croppedFile,
      url: URL.createObjectURL(croppedFile),
    };

    setEditFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), newImgObj],
    }));
  };

  const removeImage = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const toggleCategory = (categoryId) => {
    setEditFormData((prev) => {
      const current = prev.categories || [];
      if (current.includes(categoryId)) {
        return {
          ...prev,
          categories: current.filter((id) => id !== categoryId),
        };
      }
      if (current.length >= 2) {
        return prev;
      }
      return {
        ...prev,
        categories: [...current, categoryId],
      };
    });
  };

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
          const petitionIds = data.petitions.map((p) => p._id);
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
        setHideRequestStatus((prev) => ({
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "X-HTTP-Method-Override": "DELETE",
        },
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
    let existingImgs = [];
    if (petition.petitionDetails?.images && petition.petitionDetails.images.length > 0) {
      existingImgs = petition.petitionDetails.images.map((url) => ({ type: "url", url }));
    } else if (petition.petitionDetails?.image) {
      existingImgs = [{ type: "url", url: petition.petitionDetails.image }];
    }

    setEditFormData({
      title: petition.title || "",
      country: petition.country || "India",
      categories: petition.categories || [],
      decisionMakers: petition.decisionMakers?.length > 0
        ? petition.decisionMakers.map((dm) => ({
          name: dm.name || "",
          organization: dm.organization || "",
          email: dm.email || "",
          phone: dm.phone || "",
        }))
        : [{ name: "", organization: "", email: "", phone: "" }],
      requestedSigners: petition.requestedSigners?.length > 0
        ? petition.requestedSigners.map((rs) => ({
          name: rs.name || "",
          email: rs.email || "",
          designation: rs.designation || "",
        }))
        : [{ name: "", email: "", designation: "" }],
      problem: petition.petitionDetails?.problem || "",
      solution: petition.petitionDetails?.solution || "",
      videoUrl: petition.petitionDetails?.videoUrl || "",
      images: existingImgs,
      starter: {
        name: petition.petitionStarter?.name || user?.name || "",
        age: petition.petitionStarter?.age || "",
        email: petition.petitionStarter?.email || user?.email || "",
        mobile: petition.petitionStarter?.mobile || user?.mobileNumber || "",
        location: petition.petitionStarter?.location || "",
        comment: petition.petitionStarter?.comment || "",
        pincode: petition.petitionStarter?.pincode || "",
        mpConstituencyNumber: petition.petitionStarter?.mpConstituencyNumber || "",
        mlaConstituencyNumber: petition.petitionStarter?.mlaConstituencyNumber || "",
      },
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
      socialLinks: {
        facebook: petition.socialLinks?.facebook || "",
        twitter: petition.socialLinks?.twitter || "",
        instagram: petition.socialLinks?.instagram || "",
        youtube: petition.socialLinks?.youtube || "",
        linkedin: petition.socialLinks?.linkedin || "",
        website: petition.socialLinks?.website || "",
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

      const submitData = new FormData();
      submitData.append("title", editFormData.title);
      submitData.append("country", editFormData.country);
      submitData.append("categories", JSON.stringify(editFormData.categories || []));

      const validDMs = editFormData.decisionMakers.filter((dm) => dm.name && dm.email);
      submitData.append("decisionMakers", JSON.stringify(validDMs));

      const validRSs = editFormData.requestedSigners.filter((rs) => rs.name?.trim());
      submitData.append("requestedSigners", JSON.stringify(validRSs));

      const petitionDetails = {
        problem: editFormData.problem,
        solution: editFormData.solution,
        videoUrl: editFormData.videoUrl,
      };
      submitData.append("petitionDetails", JSON.stringify(petitionDetails));
      submitData.append("petitionStarter", JSON.stringify(editFormData.starter));

      submitData.append("constituencySettings", JSON.stringify(editFormData.constituencySettings));
      submitData.append("signingRequirements", JSON.stringify(editFormData.signingRequirements));
      submitData.append("socialLinks", JSON.stringify(editFormData.socialLinks || {}));

      // Append retained existing image URLs
      const existingUrls = (editFormData.images || [])
        .filter((img) => img.type === "url")
        .map((img) => img.url);
      submitData.append("existingImages", JSON.stringify(existingUrls));

      // Append newly added cropped File objects
      (editFormData.images || []).forEach((img) => {
        if (img.type === "file" && img.file) {
          submitData.append("images", img.file);
        }
      });

      const response = await fetch(`/api/petitions/${petitionId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "X-HTTP-Method-Override": "PUT",
        },
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        let updatedImagesList = [];
        if (data.petitionDetails?.images) {
          updatedImagesList = data.petitionDetails.images;
        } else if (data.petitionDetails?.image) {
          updatedImagesList = [data.petitionDetails.image];
        } else {
          updatedImagesList = existingUrls;
        }

        // Update local state
        setPetitions(
          petitions.map((p) =>
            p._id === petitionId
              ? {
                ...p,
                title: editFormData.title,
                country: editFormData.country,
                categories: editFormData.categories,
                decisionMakers: validDMs,
                requestedSigners: validRSs,
                petitionDetails: {
                  ...p.petitionDetails,
                  problem: editFormData.problem,
                  solution: editFormData.solution,
                  videoUrl: editFormData.videoUrl,
                  image: updatedImagesList[0] || p.petitionDetails?.image || "",
                  images: updatedImagesList,
                },
                petitionStarter: {
                  ...p.petitionStarter,
                  ...editFormData.starter,
                },
                constituencySettings: editFormData.constituencySettings,
                signingRequirements: editFormData.signingRequirements,
                approved: false, // Mark as pending approval after edit
                status: "pending",
              }
              : p
          )
        );
        setShowEditModal(null);
        alert("Petition updated successfully! Your changes are pending admin approval.");
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

  const fetchPendingComments = async (petitionId) => {
    try {
      setCommentsLoading((prev) => ({ ...prev, [petitionId]: true }));
      const userInfo = JSON.parse(localStorage.getItem("user"));

      const response = await fetch(`/api/comments/petition/${petitionId}/pending`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data = await response.json();
      const pendingItems = data.pendingComments || [];

      setPendingComments((prev) => ({
        ...prev,
        [petitionId]: pendingItems,
      }));
    } catch (error) {
      console.error("Error fetching pending comments:", error);
      alert("Error fetching comments. Please try again.");
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [petitionId]: false }));
    }
  };

  const approveComment = async (commentId, petitionId) => {
    try {
      setApprovingComments((prev) => new Set(prev).add(commentId));
      const userInfo = JSON.parse(localStorage.getItem("user"));

      const response = await fetch(`/api/comments/${commentId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
          "X-HTTP-Method-Override": "PUT",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to approve comment: ${response.statusText}`);
      }

      setPendingComments((prev) => ({
        ...prev,
        [petitionId]: prev[petitionId]?.filter((c) => c._id !== commentId) || [],
      }));
      alert("Comment approved successfully!");
    } catch (error) {
      console.error("Error approving comment:", error);
      alert("Error approving comment. Please try again.");
    } finally {
      setApprovingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const rejectComment = async (commentId, petitionId) => {
    try {
      setApprovingComments((prev) => new Set(prev).add(commentId));
      const userInfo = JSON.parse(localStorage.getItem("user"));

      const response = await fetch(`/api/comments/${commentId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "X-HTTP-Method-Override": "DELETE",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reject comment: ${response.statusText}`);
      }

      setPendingComments((prev) => ({
        ...prev,
        [petitionId]: prev[petitionId]?.filter((c) => c._id !== commentId) || [],
      }));
      alert("Comment rejected successfully!");
    } catch (error) {
      console.error("Error rejecting comment:", error);
      alert("Error rejecting comment. Please try again.");
    } finally {
      setApprovingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
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
      {/* Image Cropper Modal */}
      {showCropper && tempImage && (
        <ImageCropper
          imageFile={tempImage}
          onCrop={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setTempImage(null);
          }}
        />
      )}

      {/* AI Image Generation Prompt Modal */}
      <AnimatePresence>
        {showAiImagePromptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-purple-100"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <FaWandMagicSparkles />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Generate Banner Image with AI</h3>
                    <p className="text-xs text-gray-500">Describe the banner you want for your petition</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiImagePromptModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mb-4">
                <textarea
                  value={customAiImagePrompt}
                  onChange={(e) => setCustomAiImagePrompt(e.target.value)}
                  placeholder="e.g. Clean green environment with plastic free oceans, highly detailed banner..."
                  rows={4}
                  className="w-full p-3 text-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {aiImageError && (
                <p className="text-red-500 text-xs mb-3 flex items-center gap-1">
                  <FaCircleExclamation /> {aiImageError}
                </p>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAiImagePromptModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateAiImage(customAiImagePrompt)}
                  disabled={aiGeneratingImage}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {aiGeneratingImage ? (
                    <>
                      <FaSpinner className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <FaWandMagicSparkles /> Generate Image
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Category Creation Modal inside Edit */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FaTags className="text-[#F43676]" /> Add Custom Category
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Name (3 - 15 characters)
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  maxLength={15}
                  placeholder="e.g. Healthcare, Traffic"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F43676] focus:outline-none"
                />
                {categoryError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FaCircleExclamation /> {categoryError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#F43676] hover:bg-[#e02a60] text-white shadow-md flex items-center gap-2"
                >
                  {creatingCategory ? <FaSpinner className="animate-spin" /> : <FaPlus />} Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    {petitions.filter((p) => p.approved).length}
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
                                onClick={() => {
                                  setShowCommentsModal(petition._id);
                                  fetchPendingComments(petition._id);
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <FaComments className="text-xs" /> Comments
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
                              {/* Hide Request Status / Button */}
                              {petition.hidden ? (
                                <span className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg cursor-default">
                                  <FaEyeSlash className="text-xs" /> Hidden
                                </span>
                              ) : hideRequestStatus[petition._id]?.hasRequest && hideRequestStatus[petition._id]?.status === "pending" ? (
                                <span className="flex items-center gap-1.5 px-3 py-2 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-lg cursor-default border border-yellow-200">
                                  <FaClock className="text-xs" /> Hide Pending
                                </span>
                              ) : hideRequestStatus[petition._id]?.hasRequest && hideRequestStatus[petition._id]?.status === "approved" ? (
                                <span className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg cursor-default border border-green-200">
                                  <FaCheck className="text-xs" /> Hide Approved
                                </span>
                              ) : hideRequestStatus[petition._id]?.hasRequest && hideRequestStatus[petition._id]?.status === "rejected" ? (
                                <button
                                  onClick={() => setShowHideModal(petition._id)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors border border-red-200"
                                >
                                  <FaTimes className="text-xs" /> Hide Rejected
                                </button>
                              ) : (
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

                            {/* Comprehensive Edit Modal */}
                            {showEditModal === petition._id && (
                              <div className="mt-6 p-6 bg-white border-2 border-blue-200 rounded-2xl shadow-xl">
                                <div className="flex justify-between items-center border-b pb-3 mb-4">
                                  <h4 className="font-extrabold text-[#1a1a2e] text-xl flex items-center gap-2">
                                    <FaEdit className="text-[#3650AD]" /> Edit Petition Details
                                  </h4>
                                  <button
                                    onClick={() => setShowEditModal(null)}
                                    className="text-gray-400 hover:text-gray-600 p-2"
                                  >
                                    <FaTimes className="text-lg" />
                                  </button>
                                </div>

                                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-3">
                                  {/* SECTION 1: TITLE & CATEGORIES */}
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                    <h5 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                      <FaPenFancy className="text-[#3650AD]" /> Basic Campaign Information
                                    </h5>

                                    {/* Title */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-semibold text-gray-700">
                                          Petition Title *
                                        </label>
                                        <button
                                          type="button"
                                          onClick={handleAiOptimizeTitle}
                                          disabled={aiOptimizing || !editFormData.title.trim()}
                                          className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50"
                                        >
                                          {aiOptimizing ? <FaSpinner className="animate-spin" /> : <FaWandMagicSparkles />}
                                          Optimize with AI
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        value={editFormData.title}
                                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] outline-none text-sm bg-white"
                                        placeholder="Enter petition title"
                                      />
                                      {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
                                    </div>

                                    {/* Category Selection */}
                                    <div>
                                      <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                          Categories * <span className="text-xs text-gray-500 font-normal">(Select 1 or 2 categories)</span>
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => setShowCategoryModal(true)}
                                          className="text-xs font-semibold text-[#F43676] hover:text-[#e02a60] flex items-center gap-1"
                                        >
                                          <FaPlus /> Custom Category
                                        </button>
                                      </div>

                                      {categoriesLoading ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                          <FaSpinner className="animate-spin" /> Loading categories...
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                          {categoriesList.map((cat) => {
                                            const IconComp = cat.icon || FaTags;
                                            const isSelected = editFormData.categories?.includes(cat.id);
                                            return (
                                              <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => toggleCategory(cat.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                                                  isSelected
                                                    ? "bg-[#F43676] text-white border-[#F43676] shadow-sm"
                                                    : "bg-white text-gray-700 border-gray-200 hover:border-pink-300"
                                                }`}
                                              >
                                                <IconComp />
                                                <span className="truncate">{cat.label}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* Country */}
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">Country *</label>
                                      <input
                                        type="text"
                                        value={editFormData.country}
                                        onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] outline-none text-sm bg-white"
                                        placeholder="Country"
                                      />
                                    </div>
                                  </div>

                                  {/* SECTION 2: MEDIA & IMAGES */}
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                    <h5 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                      <FaImage className="text-[#3650AD]" /> Banner Images & Video
                                    </h5>

                                    {/* Image List Preview */}
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Petition Banner Images <span className="text-xs text-gray-500 font-normal">(Up to 4 images)</span>
                                      </label>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                        {(editFormData.images || []).map((img, idx) => (
                                          <div key={idx} className="relative h-28 rounded-xl overflow-hidden border border-gray-300 group bg-black/5">
                                            <Image
                                              src={img.url}
                                              alt={`Banner ${idx + 1}`}
                                              fill
                                              className="object-cover"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => removeImage(idx)}
                                              className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-md"
                                              title="Remove image"
                                            >
                                              <FaTrash className="text-xs" />
                                            </button>
                                            {idx === 0 && (
                                              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">
                                                Primary
                                              </span>
                                            )}
                                          </div>
                                        ))}

                                        {(editFormData.images || []).length < 4 && (
                                          <label className="h-28 border-2 border-dashed border-gray-300 hover:border-[#3650AD] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white transition-colors">
                                            <FaPlus className="text-gray-400 text-lg mb-1" />
                                            <span className="text-xs font-semibold text-gray-600">Upload Image</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={handleImageFileSelect}
                                              className="hidden"
                                            />
                                          </label>
                                        )}
                                      </div>

                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setShowAiImagePromptModal(true)}
                                          disabled={(editFormData.images || []).length >= 4}
                                          className="text-xs font-semibold px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center gap-1.5 shadow-sm hover:shadow disabled:opacity-50"
                                        >
                                          <FaWandMagicSparkles /> Generate with AI
                                        </button>
                                      </div>
                                    </div>

                                    {/* Video URL */}
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">YouTube Video URL (Optional)</label>
                                      <input
                                        type="url"
                                        value={editFormData.videoUrl}
                                        onChange={(e) => setEditFormData({ ...editFormData, videoUrl: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] outline-none text-sm bg-white"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                      />
                                    </div>
                                  </div>

                                  {/* SECTION 3: DECISION MAKERS & TARGET SIGNERS */}
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                    <h5 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                      <FaUsers className="text-[#3650AD]" /> Decision Makers & Target Signers
                                    </h5>

                                    {/* Decision Makers */}
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Decision Makers *</label>
                                      {editFormData.decisionMakers.map((dm, index) => (
                                        <div key={index} className="bg-white p-3 rounded-xl border border-gray-200 mb-3 space-y-2">
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500">Decision Maker #{index + 1}</span>
                                            {editFormData.decisionMakers.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => removeDecisionMaker(index)}
                                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                              >
                                                Remove
                                              </button>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input
                                              type="text"
                                              value={dm.name}
                                              onChange={(e) => updateDecisionMaker(index, "name", e.target.value)}
                                              className="p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3650AD]"
                                              placeholder="Full Name *"
                                            />
                                            <input
                                              type="email"
                                              value={dm.email}
                                              onChange={(e) => updateDecisionMaker(index, "email", e.target.value)}
                                              className="p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3650AD]"
                                              placeholder="Email Address *"
                                            />
                                            <input
                                              type="text"
                                              value={dm.organization}
                                              onChange={(e) => updateDecisionMaker(index, "organization", e.target.value)}
                                              className="p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3650AD]"
                                              placeholder="Organization (Optional)"
                                            />
                                            <input
                                              type="text"
                                              value={dm.phone}
                                              onChange={(e) => updateDecisionMaker(index, "phone", e.target.value)}
                                              className="p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3650AD]"
                                              placeholder="Phone Number (Optional)"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={addDecisionMaker}
                                        className="text-xs text-[#3650AD] hover:text-[#2a4085] font-bold flex items-center gap-1"
                                      >
                                        <FaPlus /> Add Decision Maker
                                      </button>
                                    </div>

                                    {/* Target Signers */}
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Target Signers (Optional VIP Signers)</label>
                                      {editFormData.requestedSigners?.map((signer, index) => (
                                        <div key={index} className="bg-white p-3 rounded-xl border border-gray-200 mb-3 space-y-2">
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500 font-medium">Target Signer #{index + 1}</span>
                                            {editFormData.requestedSigners.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updated = editFormData.requestedSigners.filter((_, i) => i !== index);
                                                  setEditFormData({ ...editFormData, requestedSigners: updated });
                                                }}
                                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                              >
                                                Remove
                                              </button>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <input
                                              type="text"
                                              value={signer.name}
                                              onChange={(e) => {
                                                const updated = [...editFormData.requestedSigners];
                                                updated[index] = { ...updated[index], name: e.target.value };
                                                setEditFormData({ ...editFormData, requestedSigners: updated });
                                              }}
                                              className="p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3650AD]"
                                              placeholder="Name *"
                                            />
                                            <input
                                              type="email"
                                              value={signer.email}
                                              onChange={(e) => {
                                                const updated = [...editFormData.requestedSigners];
                                                updated[index] = { ...updated[index], email: e.target.value };
                                                setEditFormData({ ...editFormData, requestedSigners: updated });
                                              }}
                                              className="p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3650AD]"
                                              placeholder="Email"
                                            />
                                            <input
                                              type="text"
                                              value={signer.designation}
                                              onChange={(e) => {
                                                const updated = [...editFormData.requestedSigners];
                                                updated[index] = { ...updated[index], designation: e.target.value };
                                                setEditFormData({ ...editFormData, requestedSigners: updated });
                                              }}
                                              className="p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3650AD]"
                                              placeholder="Role / Designation"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditFormData({
                                            ...editFormData,
                                            requestedSigners: [...(editFormData.requestedSigners || []), { name: "", email: "", designation: "" }],
                                          });
                                        }}
                                        className="text-xs text-[#3650AD] hover:text-[#2a4085] font-bold flex items-center gap-1"
                                      >
                                        <FaPlus /> Add Target Signer
                                      </button>
                                    </div>
                                  </div>

                                  {/* SECTION 4: PROBLEM & SOLUTION */}
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                    <h5 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                      <FaPenFancy className="text-[#3650AD]" /> Campaign Description
                                    </h5>

                                    {/* Problem */}
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Problem Description *
                                      </label>
                                      <textarea
                                        value={editFormData.problem}
                                        onChange={(e) => setEditFormData({ ...editFormData, problem: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] outline-none text-sm bg-white"
                                        rows={4}
                                        placeholder="Describe the issue in detail..."
                                      />
                                      <p className="text-xs text-right text-gray-400 mt-1">
                                        {editFormData.problem.length} characters
                                      </p>
                                    </div>

                                    {/* Solution */}
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Proposed Solution *
                                      </label>
                                      <textarea
                                        value={editFormData.solution}
                                        onChange={(e) => setEditFormData({ ...editFormData, solution: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3650AD] outline-none text-sm bg-white"
                                        rows={4}
                                        placeholder="Describe what specific action should be taken..."
                                      />
                                      <p className="text-xs text-right text-gray-400 mt-1">
                                        {editFormData.solution.length} characters
                                      </p>
                                    </div>
                                  </div>

                                  {/* SECTION 5: SIGNING REQUIREMENTS */}
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                    <h5 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                      <FaCheck className="text-[#3650AD]" /> Verification & Signing Controls
                                    </h5>

                                    {/* Constituency Requirement */}
                                    <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-800">Require Constituency Number to Sign</p>
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
                                              required: newValue,
                                            },
                                            signingRequirements: {
                                              ...editFormData.signingRequirements,
                                              constituency: {
                                                ...editFormData.signingRequirements.constituency,
                                                required: newValue,
                                              },
                                            },
                                          });
                                        }}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${editFormData.signingRequirements.constituency.required ? "bg-[#3650AD]" : "bg-gray-300"}`}
                                      >
                                        <span
                                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${editFormData.signingRequirements.constituency.required ? "translate-x-6" : "translate-x-0"}`}
                                        />
                                      </button>
                                    </div>

                                    {editFormData.signingRequirements.constituency.required && (
                                      <div className="p-3 bg-white rounded-xl border border-gray-200">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                          Restrict to Specific Constituency Number (Optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={editFormData.signingRequirements.constituency.allowedConstituency}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditFormData({
                                              ...editFormData,
                                              constituencySettings: {
                                                ...editFormData.constituencySettings,
                                                allowedConstituency: val,
                                              },
                                              signingRequirements: {
                                                ...editFormData.signingRequirements,
                                                constituency: {
                                                  ...editFormData.signingRequirements.constituency,
                                                  allowedConstituency: val,
                                                },
                                              },
                                            });
                                          }}
                                          placeholder="e.g. 123"
                                          className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#3650AD]"
                                        />
                                      </div>
                                    )}

                                    {/* Aadhaar Requirement */}
                                    <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-800">Require Aadhaar Number to Sign</p>
                                        <p className="text-xs text-gray-500">Signers must provide Aadhaar for verification</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditFormData({
                                            ...editFormData,
                                            signingRequirements: {
                                              ...editFormData.signingRequirements,
                                              aadhar: {
                                                ...editFormData.signingRequirements.aadhar,
                                                required: !editFormData.signingRequirements.aadhar.required,
                                              },
                                            },
                                          })
                                        }
                                        className={`relative w-12 h-6 rounded-full transition-colors ${editFormData.signingRequirements.aadhar.required ? "bg-[#3650AD]" : "bg-gray-300"}`}
                                      >
                                        <span
                                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${editFormData.signingRequirements.aadhar.required ? "translate-x-6" : "translate-x-0"}`}
                                        />
                                      </button>
                                    </div>
                                  </div>

                                  {/* SECTION 6: PETITION STARTER DETAILS */}
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                    <h5 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                      <FaUser className="text-[#3650AD]" /> Petition Starter Information
                                    </h5>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                                        <input
                                          type="text"
                                          value={editFormData.starter.name}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              starter: { ...editFormData.starter, name: e.target.value },
                                            })
                                          }
                                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3650AD]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Age *</label>
                                        <input
                                          type="text"
                                          value={editFormData.starter.age}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              starter: { ...editFormData.starter, age: e.target.value },
                                            })
                                          }
                                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3650AD]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                                        <input
                                          type="email"
                                          value={editFormData.starter.email}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              starter: { ...editFormData.starter, email: e.target.value },
                                            })
                                          }
                                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3650AD]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number *</label>
                                        <input
                                          type="text"
                                          value={editFormData.starter.mobile}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              starter: { ...editFormData.starter, mobile: e.target.value },
                                            })
                                          }
                                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3650AD]"
                                        />
                                      </div>
                                      <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Address *</label>
                                        <input
                                          type="text"
                                          value={editFormData.starter.location}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              starter: { ...editFormData.starter, location: e.target.value },
                                            })
                                          }
                                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3650AD]"
                                          placeholder="City, State"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                                        <input
                                          type="text"
                                          value={editFormData.starter.pincode}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              starter: { ...editFormData.starter, pincode: e.target.value },
                                            })
                                          }
                                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3650AD]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">MP Constituency Number</label>
                                        <input
                                          type="text"
                                          value={editFormData.starter.mpConstituencyNumber}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              starter: { ...editFormData.starter, mpConstituencyNumber: e.target.value },
                                            })
                                          }
                                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3650AD]"
                                        />
                                      </div>
                                      <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">MLA Constituency Number</label>
                                        <input
                                          type="text"
                                          value={editFormData.starter.mlaConstituencyNumber}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              starter: { ...editFormData.starter, mlaConstituencyNumber: e.target.value },
                                            })
                                          }
                                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3650AD]"
                                        />
                                      </div>
                                    </div>

                                    {/* SECTION 7: PETITIONER SOCIAL LINKS */}
                                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200 space-y-3">
                                      <h5 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                        <FaGlobe className="text-purple-600" /> Social Media Links (Optional)
                                      </h5>
                                      <p className="text-xs text-gray-500">
                                        Add your social media handles and website to collect followers and likes on your platforms.
                                      </p>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                            <FaFacebook className="text-blue-600" /> Facebook Page
                                          </label>
                                          <input
                                            type="url"
                                            value={editFormData.socialLinks?.facebook || ""}
                                            onChange={(e) =>
                                              setEditFormData({
                                                ...editFormData,
                                                socialLinks: { ...editFormData.socialLinks, facebook: e.target.value },
                                              })
                                            }
                                            placeholder="https://facebook.com/yourpage"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-purple-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                            <FaInstagram className="text-pink-600" /> Instagram Profile
                                          </label>
                                          <input
                                            type="url"
                                            value={editFormData.socialLinks?.instagram || ""}
                                            onChange={(e) =>
                                              setEditFormData({
                                                ...editFormData,
                                                socialLinks: { ...editFormData.socialLinks, instagram: e.target.value },
                                              })
                                            }
                                            placeholder="https://instagram.com/yourhandle"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-purple-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                            <FaTwitter className="text-sky-500" /> X / Twitter Profile
                                          </label>
                                          <input
                                            type="url"
                                            value={editFormData.socialLinks?.twitter || ""}
                                            onChange={(e) =>
                                              setEditFormData({
                                                ...editFormData,
                                                socialLinks: { ...editFormData.socialLinks, twitter: e.target.value },
                                              })
                                            }
                                            placeholder="https://x.com/yourhandle"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-purple-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                            <FaYoutube className="text-red-600" /> YouTube Channel
                                          </label>
                                          <input
                                            type="url"
                                            value={editFormData.socialLinks?.youtube || ""}
                                            onChange={(e) =>
                                              setEditFormData({
                                                ...editFormData,
                                                socialLinks: { ...editFormData.socialLinks, youtube: e.target.value },
                                              })
                                            }
                                            placeholder="https://youtube.com/@yourchannel"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-purple-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                            <FaLinkedin className="text-blue-700" /> LinkedIn Profile
                                          </label>
                                          <input
                                            type="url"
                                            value={editFormData.socialLinks?.linkedin || ""}
                                            onChange={(e) =>
                                              setEditFormData({
                                                ...editFormData,
                                                socialLinks: { ...editFormData.socialLinks, linkedin: e.target.value },
                                              })
                                            }
                                            placeholder="https://linkedin.com/in/yourprofile"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-purple-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                            <FaGlobe className="text-emerald-600" /> Website / Portfolio
                                          </label>
                                          <input
                                            type="url"
                                            value={editFormData.socialLinks?.website || ""}
                                            onChange={(e) =>
                                              setEditFormData({
                                                ...editFormData,
                                                socialLinks: { ...editFormData.socialLinks, website: e.target.value },
                                              })
                                            }
                                            placeholder="https://yourwebsite.com"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-purple-500"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePetition(petition._id)}
                                      disabled={editLoading}
                                      className="flex-1 bg-[#3650AD] hover:bg-[#2a4085] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                                    >
                                      {editLoading ? <FaSpinner className="animate-spin text-lg" /> : <FaCheck />}
                                      {editLoading ? "Saving Changes..." : "Save Petition Changes"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setShowEditModal(null)}
                                      className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-colors"
                                    >
                                      <FaTimes /> Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Comments Modal */}
                            {showCommentsModal === petition._id && (
                              <div className="mt-4 p-5 bg-purple-50 border border-purple-200 rounded-xl">
                                <h4 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2 text-lg">
                                  <FaComments className="text-purple-600" /> Pending Comments ({pendingComments[petition._id]?.length || 0})
                                </h4>

                                {commentsLoading[petition._id] ? (
                                  <div className="flex items-center justify-center py-8">
                                    <FaSpinner className="animate-spin text-2xl text-purple-600" />
                                  </div>
                                ) : (pendingComments[petition._id]?.length || 0) === 0 ? (
                                  <div className="text-center py-8 text-gray-500">
                                    <p>No pending comments to review.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                    {pendingComments[petition._id]?.map((comment) => (
                                      <div key={comment._id} className="bg-white p-4 rounded-lg border border-purple-100">
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <p className="font-semibold text-gray-800">{comment.userName || "Anonymous"}</p>
                                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending</span>
                                            </div>
                                            <p className="text-gray-700 text-sm mb-3">{comment.text}</p>
                                            <p className="text-xs text-gray-400">
                                              Posted on {new Date(comment.createdAt).toLocaleDateString()}
                                            </p>
                                            {comment.replies && comment.replies.length > 0 && (
                                              <div className="mt-3 pl-4 border-l-2 border-purple-200 space-y-2">
                                                <p className="text-xs font-semibold text-gray-600">Replies:</p>
                                                {comment.replies.map((reply) => (
                                                  <div key={reply._id} className="text-sm bg-gray-50 p-2 rounded">
                                                    <p className="font-medium text-gray-700">{reply.userName || "Anonymous"}</p>
                                                    <p className="text-gray-600">{reply.text}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex gap-2 flex-shrink-0">
                                            <button
                                              onClick={() => approveComment(comment._id, petition._id)}
                                              disabled={approvingComments.has(comment._id)}
                                              className="flex items-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                              {approvingComments.has(comment._id) ? (
                                                <FaSpinner className="animate-spin" />
                                              ) : (
                                                <FaCheck />
                                              )}
                                              Approve
                                            </button>
                                            <button
                                              onClick={() => rejectComment(comment._id, petition._id)}
                                              disabled={approvingComments.has(comment._id)}
                                              className="flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                              {approvingComments.has(comment._id) ? (
                                                <FaSpinner className="animate-spin" />
                                              ) : (
                                                <FaTimes />
                                              )}
                                              Reject
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex gap-2 mt-4 pt-4 border-t border-purple-200">
                                  <button
                                    onClick={() => setShowCommentsModal(null)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                                  >
                                    Close
                                  </button>
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
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-[#1a1a2e] mb-2 line-clamp-1">
                            {petition.title}
                          </h4>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                            {petition.petitionDetails?.problem}
                          </p>
                          <Link href={`/currentpetitions/${petition.slug}`}>
                            <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors">
                              View Petition <FaArrowRight className="text-[10px]" />
                            </button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default MyPetitionsPage;
