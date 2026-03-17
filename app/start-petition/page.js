"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaYoutube,
  FaPlus,
  FaCircleInfo,
  FaCircleCheck,
  FaCircleExclamation,
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
  FaSpinner,
  FaTags,
  FaXmark,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Captcha from "../../components/Captcha";

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
  FaTags: FaTags, // Default icon for custom categories
};

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

export default function StartPetitionPage() {
  const { user, loading: authLoading, clearUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [recipients, setRecipients] = useState([
    { name: "", organization: "", email: "", phone: "" },
  ]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showDraftNotification, setShowDraftNotification] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState(createInitialAadhaarOtpState);
  // Signing requirements settings
  const [signingRequirements, setSigningRequirements] = useState({
    constituency: {
      required: false,
      allowedConstituency: "",
    },
    aadhar: {
      required: false,
    },
  });
  const totalSteps = 4;
  const DRAFT_KEY = "petition_draft";

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    country: "India",
    problem: "",
    solution: "",
    videoUrl: "",
    starter: {
      name: "",
      age: "",
      email: "",
      mobile: "",
      location: "",
      comment: "",
      aadharNumber: "",
      panNumber: "",
      voterNumber: "",
      pincode: "",
      mpConstituencyNumber: "",
      mlaConstituencyNumber: "",
    },
  });

  // ===== VALIDATION RULES =====
  const validationRules = {
    // Step 1
    title: {
      required: true,
      minLength: 10,
      maxLength: 150,
      pattern: null,
      message: "Title must be between 10-150 characters",
      example:
        "e.g., 'Stop Illegal Deforestation in Western Ghats' or 'Improve Road Safety in School Zones'",
    },

    // Step 2 - Recipients
    recipientName: {
      required: true,
      minLength: 3,
      maxLength: 100,
      pattern: /^[a-zA-Z\s.'-]+$/,
      message:
        "Please enter a valid name (letters, spaces, and basic punctuation only)",
      example: "e.g., 'Dr. Rajesh Kumar' or 'Smt. Priya Sharma'",
    },
    recipientOrganization: {
      required: false,
      minLength: 3,
      maxLength: 150,
      pattern: null,
      message: "Organization name should be at least 3 characters",
      example:
        "e.g., 'Ministry of Environment' or 'Municipal Corporation of Delhi'",
    },
    recipientEmail: {
      required: false,
      minLength: 5,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Please enter a valid email address",
      example: "e.g., 'official@ministry.gov.in' or 'contact@organization.org'",
    },
    recipientPhone: {
      required: false,
      minLength: 10,
      maxLength: 15,
      pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
      message: "Please enter a valid phone number (10-15 digits)",
      example: "e.g., '+91 98765 43210' or '011-23456789'",
    },

    // Step 3
    problem: {
      required: true,
      minLength: 50,
      maxLength: 2000,
      pattern: null,
      message: "Problem description must be between 50-2000 characters",
      example:
        "Describe who is affected, what the issue is, and why it matters. Be specific about locations, numbers, and impact.",
    },
    solution: {
      required: true,
      minLength: 30,
      maxLength: 1500,
      pattern: null,
      message: "Solution must be between 30-1500 characters",
      example:
        "What specific action do you want the decision maker to take? Be clear about timelines and expected outcomes.",
    },
    videoUrl: {
      required: false,
      minLength: 0,
      maxLength: 500,
      pattern:
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/,
      message: "Please enter a valid YouTube URL",
      example:
        "e.g., 'https://www.youtube.com/watch?v=abc123xyz' or 'https://youtu.be/abc123xyz'",
    },

    // Step 4 - Petition Starter
    starterName: {
      required: true,
      minLength: 3,
      maxLength: 100,
      pattern: /^[a-zA-Z\s.'-]+$/,
      message: "Please enter your full legal name (letters and spaces only)",
      example: "e.g., 'Rajesh Kumar Singh' or 'Priya Sharma'",
    },
    starterAge: {
      required: true,
      minLength: 1,
      maxLength: 3,
      pattern: /^(?:1[89]|[2-9][0-9]|1[01][0-9]|120)$/,
      message: "Age must be between 18-120 years",
      example: "e.g., '25' or '45' (You must be 18+ to create a petition)",
    },
    starterEmail: {
      required: true,
      minLength: 5,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Please enter a valid email address",
      example: "e.g., 'yourname@gmail.com' or 'yourname@company.co.in'",
    },
    starterMobile: {
      required: true,
      minLength: 10,
      maxLength: 15,
      pattern: /^[6-9]\d{9}$/,
      message: "Please enter a valid 10-digit Indian mobile number",
      example: "e.g., '9876543210' (without country code, starting with 6-9)",
    },
    starterLocation: {
      required: true,
      minLength: 5,
      maxLength: 200,
      pattern: null,
      message: "Location must be at least 5 characters",
      example:
        "e.g., 'Andheri West, Mumbai, Maharashtra' or 'Sector 15, Noida, UP'",
    },
    starterComment: {
      required: false,
      minLength: 0,
      maxLength: 500,
      pattern: null,
      message: "Comment must be under 500 characters",
      example:
        "Share why this cause is important to you or any additional context",
    },
    aadharNumber: {
      required: true,
      minLength: 12,
      maxLength: 16,
      // Custom validation - will be handled specially in validateField
      pattern: null,
      customValidator: (value) => {
        // Strip all non-digit characters
        const digitsOnly = value.replace(/\D/g, "");
        // Must be exactly 12 digits and start with 2-9
        if (digitsOnly.length !== 12) {
          return {
            isValid: false,
            error: "Aadhar number must be exactly 12 digits",
          };
        }
        if (!/^[2-9]/.test(digitsOnly)) {
          return {
            isValid: false,
            error: "Aadhar number cannot start with 0 or 1",
          };
        }
        return { isValid: true, error: null };
      },
      message: "Please enter a valid 12-digit Aadhar number",
      example:
        "e.g., '2345 6789 0123' or '234567890123' (12 digits, cannot start with 0 or 1)",
    },
    panNumber: {
      required: false,
      minLength: 10,
      maxLength: 10,
      pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      message:
        "Please enter a valid PAN number (5 letters, 4 digits, 1 letter)",
      example: "e.g., 'ABCDE1234F' (Format: XXXXX0000X - all uppercase)",
    },
    voterNumber: {
      required: false,
      minLength: 10,
      maxLength: 10,
      pattern: /^[A-Z]{3}[0-9]{7}$/,
      message: "Please enter a valid Voter ID (3 letters + 7 digits)",
      example:
        "e.g., 'ABC1234567' (Format: XXX0000000 - 3 uppercase letters + 7 digits)",
    },
    pincode: {
      required: false,
      minLength: 6,
      maxLength: 6,
      pattern: /^[1-9][0-9]{5}$/,
      message: "Please enter a valid 6-digit Indian pincode",
      example:
        "e.g., '400001' (Mumbai) or '110001' (Delhi) - cannot start with 0",
    },
    mpConstituencyNumber: {
      required: false,
      minLength: 1,
      maxLength: 5,
      pattern: /^[1-9][0-9]{0,4}$/,
      message: "Please enter a valid constituency number (1-543)",
      example:
        "e.g., '1' to '543' - Find your constituency number at eci.gov.in",
    },
    mlaConstituencyNumber: {
      required: false,
      minLength: 1,
      maxLength: 5,
      pattern: /^[1-9][0-9]{0,4}$/,
      message: "Please enter a valid constituency number",
      example:
        "e.g., '1' to '403' (varies by state) - Find yours at your state election commission",
    },
  };

  // ===== VALIDATION HELPER FUNCTIONS =====
  const validateField = (fieldName, value, customRules = null) => {
    const rules = customRules || validationRules[fieldName];
    if (!rules) return { isValid: true, error: null };

    const trimmedValue = value?.toString().trim() || "";

    // Check required
    if (rules.required && trimmedValue === "") {
      return { isValid: false, error: "This field is required" };
    }

    // If not required and empty, it's valid
    if (!rules.required && trimmedValue === "") {
      return { isValid: true, error: null };
    }

    // Use custom validator if provided (takes priority over pattern and length checks)
    if (rules.customValidator) {
      return rules.customValidator(trimmedValue);
    }

    // Check min length
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      return {
        isValid: false,
        error: `Must be at least ${rules.minLength} characters`,
      };
    }

    // Check max length
    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      return {
        isValid: false,
        error: `Must be no more than ${rules.maxLength} characters`,
      };
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(trimmedValue)) {
      return { isValid: false, error: rules.message };
    }

    return { isValid: true, error: null };
  };

  const getFieldValidation = (fieldName, value) => {
    return validateField(fieldName, value);
  };

  const markFieldTouched = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Handle authentication loading and redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/start-petition");
    }
  }, [user, authLoading, router]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/categories`);

        if (response.ok) {
          const data = await response.json();
          // Transform API categories to match expected format
          const transformedCategories = data.categories.map((cat) => ({
            id: cat.slug,
            label: cat.name,
            icon: iconMap[cat.icon] || FaTags,
          }));
          setCategories(transformedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle creating a new category
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
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.category) {
        // Add the new category to the list
        const newCategory = {
          id: data.category.slug,
          label: data.category.name,
          icon: FaTags,
        };
        setCategories((prev) => [...prev, newCategory]);

        // Auto-select the new category
        setSelectedCategories((prev) => [...prev, data.category.slug]);

        // Close modal and reset
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

  // Load draft from localStorage on mount
  useEffect(() => {
    if (user && !draftLoaded) {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          // Only load draft if it's for the same user
          if (draft.userId === user.uid || draft.userId === user.id) {
            if (draft.formData) setFormData(draft.formData);
            if (draft.recipients) setRecipients(draft.recipients);
            if (draft.selectedCategories)
              setSelectedCategories(draft.selectedCategories);
            if (draft.step) setStep(draft.step);
            setShowDraftNotification(true);
            setTimeout(() => setShowDraftNotification(false), 5000);
          }
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
      setDraftLoaded(true);
    }
  }, [user, draftLoaded]);

  // Auto-save draft to localStorage whenever form data changes
  useEffect(() => {
    if (user && draftLoaded) {
      const draft = {
        userId: user.uid || user.id,
        formData,
        recipients,
        selectedCategories,
        step,
        savedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }
  }, [formData, recipients, selectedCategories, step, user, draftLoaded]);

  // Autofill starter info from user profile if fields are empty
  useEffect(() => {
    if (user && draftLoaded) {
      setFormData((prev) => {
        const updatedStarter = { ...prev.starter };
        let changed = false;

        // Only fill if empty to allow users to edit/override
        if (!updatedStarter.name && user.name) {
          updatedStarter.name = user.name;
          changed = true;
        }
        if (!updatedStarter.email && user.email) {
          updatedStarter.email = user.email;
          changed = true;
        }
        if (!updatedStarter.mobile && user.mobileNumber) {
          updatedStarter.mobile = user.mobileNumber;
          changed = true;
        }

        if (changed) {
          return { ...prev, starter: updatedStarter };
        }
        return prev;
      });
    }
  }, [user, draftLoaded]);

  // Function to clear draft
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  };

  // Function to discard draft and reset form
  const discardDraft = () => {
    clearDraft();
    setFormData({
      title: "",
      country: "India",
      problem: "",
      solution: "",
      videoUrl: "",
      starter: {
        name: "",
        age: "",
        email: "",
        mobile: "",
        location: "",
        comment: "",
        aadharNumber: "",
        panNumber: "",
        voterNumber: "",
        pincode: "",
        mpConstituencyNumber: "",
        mlaConstituencyNumber: "",
      },
    });
    setRecipients([{ name: "", organization: "", email: "", phone: "" }]);
    setSelectedCategories([]);
    setStep(1);
    setSelectedImage(null);
    setTouchedFields({});
    setCaptchaVerified(false);
    setAadhaarOtp(createInitialAadhaarOtpState());
    setShowDraftNotification(false);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Enhanced Validation functions for each step
  const isStep1Valid = () => {
    const titleValidation = validateField("title", formData.title);
    const hasCategories = selectedCategories.length > 0;
    return titleValidation.isValid && hasCategories;
  };

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ?
        prev.filter((id) => id !== categoryId)
      : [...prev, categoryId],
    );
  };

  const isStep2Valid = () => {
    // At least one recipient with valid name (email is optional)
    return recipients.some((recipient) => {
      const nameValid = validateField("recipientName", recipient.name).isValid;
      // Email is optional - only validate if provided
      const emailValid =
        !recipient.email ||
        validateField("recipientEmail", recipient.email).isValid;
      return nameValid && emailValid;
    });
  };

  const isStep3Valid = () => {
    const problemValid = validateField("problem", formData.problem).isValid;
    const solutionValid = validateField("solution", formData.solution).isValid;
    const videoValid =
      !formData.videoUrl ||
      validateField("videoUrl", formData.videoUrl).isValid;
    return problemValid && solutionValid && videoValid;
  };

  const isStep4Valid = () => {
    const validations = [
      validateField("starterName", formData.starter.name),
      validateField("starterAge", formData.starter.age),
      validateField("starterEmail", formData.starter.email),
      validateField("starterMobile", formData.starter.mobile),
      validateField("starterLocation", formData.starter.location),
      validateField("aadharNumber", formData.starter.aadharNumber),
    ];

    // Optional fields - only validate if they have a value
    if (formData.starter.panNumber) {
      validations.push(validateField("panNumber", formData.starter.panNumber));
    }
    if (formData.starter.voterNumber) {
      validations.push(
        validateField("voterNumber", formData.starter.voterNumber),
      );
    }
    if (formData.starter.pincode) {
      validations.push(validateField("pincode", formData.starter.pincode));
    }

    return (
      validations.every((v) => v.isValid) &&
      captchaVerified &&
      aadhaarOtp.verified
    );
  };

  // Function to check if current step is valid
  const isCurrentStepValid = () => {
    switch (step) {
      case 1:
        return isStep1Valid();
      case 2:
        return isStep2Valid();
      case 3:
        return isStep3Valid();
      case 4:
        return isStep4Valid();
      default:
        return false;
    }
  };

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      { name: "", organization: "", email: "", phone: "" },
    ]);
  };

  const updateRecipient = (index, field, value) => {
    const updatedRecipients = recipients.map((recipient, i) =>
      i === index ? { ...recipient, [field]: value } : recipient,
    );
    setRecipients(updatedRecipients);
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith("starter.")) {
      const starterField = field.replace("starter.", "");
      setFormData((prev) => ({
        ...prev,
        starter: { ...prev.starter, [starterField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSendAadhaarOtp = async () => {
    markFieldTouched("aadharNumber");

    const aadhaarValidation = validateField(
      "aadharNumber",
      formData.starter.aadharNumber,
    );

    if (!aadhaarValidation.isValid) {
      setAadhaarOtp((prev) => ({
        ...prev,
        error: aadhaarValidation.error || "Please enter a valid Aadhaar number",
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
          aadhaarNumber: formData.starter.aadharNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send Aadhaar OTP");
      }

      if (result.testMode) {
        setAadhaarOtp((prev) => ({
          ...prev,
          sending: false,
          otpSent: false,
          otpSessionToken: "",
          verified: false,
          verificationToken: "",
          otp: "",
          success: "",
          error:
            result.message ||
            "Test mode is enabled. Real OTP SMS will not be delivered.",
          maskedAadhaar: result.maskedAadhaar || "",
        }));
        return;
      }

      setAadhaarOtp((prev) => ({
        ...prev,
        sending: false,
        otpSent: true,
        otpSessionToken: result.otpSessionToken || "",
        verified: false,
        verificationToken: "",
        otp: "",
        success: result.message || "OTP sent successfully",
        error: "",
        maskedAadhaar: result.maskedAadhaar || "",
      }));
    } catch (error) {
      setAadhaarOtp((prev) => ({
        ...prev,
        sending: false,
        otpSent: false,
        otpSessionToken: "",
        verified: false,
        verificationToken: "",
        error: error.message || "Failed to send Aadhaar OTP",
        success: "",
      }));
    }
  };

  const handleVerifyAadhaarOtp = async () => {
    const aadhaarValidation = validateField(
      "aadharNumber",
      formData.starter.aadharNumber,
    );

    if (!aadhaarValidation.isValid) {
      setAadhaarOtp((prev) => ({
        ...prev,
        error: aadhaarValidation.error || "Please enter a valid Aadhaar number",
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
          aadhaarNumber: formData.starter.aadharNumber,
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
    } catch (error) {
      setAadhaarOtp((prev) => ({
        ...prev,
        verifying: false,
        verified: false,
        verificationToken: "",
        error: error.message || "Failed to verify Aadhaar OTP",
        success: "",
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!aadhaarOtp.verified || !aadhaarOtp.verificationToken) {
        setIsSubmitting(false);
        alert("Please complete Aadhaar OTP verification before submitting.");
        return;
      }

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("country", formData.country);
      submitData.append("categories", JSON.stringify(selectedCategories));

      const validRecipients = recipients.filter((r) => r.name);
      submitData.append("decisionMakers", JSON.stringify(validRecipients));

      const petitionDetails = {
        problem: formData.problem,
        solution: formData.solution,
        videoUrl: formData.videoUrl,
      };
      submitData.append("petitionDetails", JSON.stringify(petitionDetails));
      submitData.append("petitionStarter", JSON.stringify(formData.starter));
      submitData.append(
        "aadhaarVerificationToken",
        aadhaarOtp.verificationToken,
      );
      submitData.append(
        "aadharVerificationToken",
        aadhaarOtp.verificationToken,
      );

      if (selectedImage) {
        submitData.append("image", selectedImage);
      }

      // Add signing requirements settings
      submitData.append(
        "signingRequirements",
        JSON.stringify({
          constituency: {
            required: signingRequirements.constituency.required,
            allowedConstituency:
              signingRequirements.constituency.allowedConstituency?.trim() ||
              undefined,
          },
          aadhar: {
            required: signingRequirements.aadhar.required,
          },
        }),
      );

      // Check if user and token are available
      if (!user || !user.token) {
        setIsSubmitting(false);
        alert("User not authenticated. Please log in to create a petition.");
        router.push("/login?redirect=/start-petition");
        return;
      }

      // Make the request with Authorization header
      const response = await fetch("/api/petitions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        // Clear the draft on successful submission
        clearDraft();
        // Redirect to the my-petition page after successful creation
        router.push("/my-petition");
      } else {
        // Handle authentication errors specifically
        if (response.status === 401) {
          // Token is invalid or expired
          alert("Your session has expired. Please log in again.");
          // Clear user data and redirect to login
          clearUser();
          router.push("/login?redirect=/start-petition");
          return;
        }
        throw new Error(result.message || "Failed to create petition");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "Failed to submit petition. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -50, scale: 0.95 },
  };

  // ===== HELPER FUNCTION FOR INPUT STYLING (not a component to avoid focus issues) =====
  const getInputProps = (fieldName, value) => {
    const rules = validationRules[fieldName];
    const validation = getFieldValidation(fieldName, value);
    const isTouched = touchedFields[fieldName];
    const showError = isTouched && !validation.isValid && value !== "";
    const showSuccess = isTouched && validation.isValid && value !== "";

    const inputClasses = `w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F43676] focus:outline-none transition-all duration-200 ${
      showError ? "border-red-400 bg-red-50"
      : showSuccess ? "border-green-400 bg-green-50"
      : "border-gray-300"
    }`;

    return {
      className: inputClasses,
      showError,
      showSuccess,
      error: validation.error,
      rules,
      isTouched,
    };
  };

  return (
    <section className="bg-[#f0f2f5] min-h-screen px-8 sm:px-16 lg:px-24 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
        <motion.div
          className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-gradient-to-r from-[#2D3A8C] via-[#F43676] to-[#2D3A8C] h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </motion.div>

        {/* Draft Notification */}
        <AnimatePresence>
          {showDraftNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaCircleInfo className="text-blue-500 text-lg" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">Draft Restored</p>
                  <p className="text-sm text-blue-600">
                    We saved your progress. You can continue where you left off!
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={discardDraft}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Start Fresh
                </button>
                <button
                  onClick={() => setShowDraftNotification(false)}
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl font-extrabold mb-2 text-gray-700">
                Create a Powerful Online Petition in Minutes!
              </h1>
              <p className="mb-6 text-gray-600">
                Start by filling out this form, and in a few minutes you will be
                ready to collect thousands of signatures.
              </p>
              <label className="block mb-2 font-medium">
                Petition Title <span className="text-red-500">*</span>
                <span className="text-gray-400 text-sm ml-2">
                  (10-150 characters)
                </span>
              </label>
              {(() => {
                const props = getInputProps("title", formData.title);
                return (
                  <div className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        onBlur={() => markFieldTouched("title")}
                        className={props.className}
                        placeholder="Enter a clear, compelling petition title..."
                      />
                      {props.showError && (
                        <FaCircleExclamation className="absolute right-3 top-3 text-red-500" />
                      )}
                      {props.showSuccess && (
                        <FaCircleCheck className="absolute right-3 top-3 text-green-500" />
                      )}
                    </div>
                    {props.showError && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <FaCircleExclamation className="text-xs" />
                        {props.error}
                      </p>
                    )}
                    {props.rules?.example &&
                      !props.showError &&
                      formData.title === "" && (
                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                          <FaCircleInfo className="text-xs text-blue-400" />
                          {props.rules.example}
                        </p>
                      )}
                  </div>
                );
              })()}
              {/* Character counter for title */}
              <p
                className={`text-xs mt-1 text-right ${
                  formData.title.length < 10 ? "text-orange-500"
                  : formData.title.length > 150 ? "text-red-500"
                  : "text-gray-400"
                }`}
              >
                {formData.title.length}/150 characters
                {formData.title.length > 0 &&
                  formData.title.length < 10 &&
                  " (minimum 10)"}
              </p>

              {/* Category Selection */}
              <div className="mt-8">
                <label className="block mb-3 font-medium">
                  Select Categories <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-sm ml-2">
                    (at least one required)
                  </span>
                </label>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  <FaCircleInfo className="text-blue-400" />
                  Choose categories that best describe your petition. This helps
                  people find your cause.
                </p>

                {/* Categories Loading State */}
                {categoriesLoading ?
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-[#F43676] mr-2" />
                    <span className="text-gray-500">Loading categories...</span>
                  </div>
                : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(
                        category.id,
                      );
                      return (
                        <motion.button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                            isSelected ?
                              "border-[#F43676] bg-gradient-to-r from-[#F43676]/10 to-[#2D3A8C]/10 text-[#F43676] shadow-md"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {(() => {
                            const IconComponent = category.icon;
                            return (
                              <IconComponent
                                className={`text-lg ${isSelected ? "text-[#F43676]" : "text-[#2D3A8C]"}`}
                              />
                            );
                          })()}
                          <span>{category.label}</span>
                          {isSelected && (
                            <FaCircleCheck className="ml-auto text-[#F43676]" />
                          )}
                        </motion.button>
                      );
                    })}

                    {/* Create New Category Button */}
                    <motion.button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#2D3A8C] bg-[#2D3A8C]/5 text-[#2D3A8C] hover:bg-[#2D3A8C]/10 transition-all duration-200 text-sm font-medium"
                    >
                      <FaPlus className="text-lg" />
                      <span>Create Category</span>
                    </motion.button>
                  </div>
                }

                {/* Category validation feedback */}
                {selectedCategories.length === 0 && (
                  <p className="text-orange-500 text-sm mt-3 flex items-center gap-1">
                    <FaCircleExclamation className="text-xs" />
                    Please select at least one category for your petition
                  </p>
                )}
                {selectedCategories.length > 0 && (
                  <p className="text-green-600 text-sm mt-3 flex items-center gap-1">
                    <FaCircleCheck className="text-xs" />
                    {selectedCategories.length}{" "}
                    {selectedCategories.length === 1 ?
                      "category"
                    : "categories"}{" "}
                    selected
                  </p>
                )}
              </div>

              {/* Signing Requirement Settings */}
              <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaCircleInfo className="text-[#2D3A8C]" />
                  Signing Requirements (Optional)
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  You can require signers to provide their constituency number
                  and/or Aadhar number. Select any or both to enhance identity
                  verification for your petition.
                </p>

                {/* Toggle for constituency requirement */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 mb-3">
                  <div>
                    <p className="font-medium text-gray-700">
                      Require Constituency Number to Sign
                    </p>
                    <p className="text-sm text-gray-500">
                      Signers must enter their constituency number
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSigningRequirements((prev) => ({
                        ...prev,
                        constituency: {
                          ...prev.constituency,
                          required: !prev.constituency.required,
                        },
                      }))
                    }
                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                      signingRequirements.constituency.required ?
                        "bg-[#2D3A8C]"
                      : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        signingRequirements.constituency.required ?
                          "translate-x-7"
                        : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Show allowed constituency input only when requirement is enabled */}
                <AnimatePresence>
                  {signingRequirements.constituency.required && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <label className="block mb-2 font-medium text-gray-700">
                          Restrict to Specific Constituency (Optional)
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                          Leave blank to allow any constituency, or enter a
                          specific number to restrict signing.
                        </p>
                        <input
                          type="text"
                          value={
                            signingRequirements.constituency.allowedConstituency
                          }
                          onChange={(e) =>
                            setSigningRequirements((prev) => ({
                              ...prev,
                              constituency: {
                                ...prev.constituency,
                                allowedConstituency: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g., 123 or leave empty for any constituency"
                          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#F43676] focus:outline-none transition-all duration-200"
                          maxLength={10}
                        />
                        {signingRequirements.constituency
                          .allowedConstituency && (
                          <p className="text-blue-600 text-sm mt-2 flex items-center gap-1">
                            <FaCircleInfo className="text-xs" />
                            Only users with constituency number &quot;
                            {
                              signingRequirements.constituency
                                .allowedConstituency
                            }
                            &quot; can sign this petition.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Toggle for Aadhar requirement */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-700">
                      Require Aadhar Number to Sign
                    </p>
                    <p className="text-sm text-gray-500">
                      Signers must enter their Aadhar number for verification
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSigningRequirements((prev) => ({
                        ...prev,
                        aadhar: {
                          ...prev.aadhar,
                          required: !prev.aadhar.required,
                        },
                      }))
                    }
                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                      signingRequirements.aadhar.required ?
                        "bg-[#2D3A8C]"
                      : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        signingRequirements.aadhar.required ?
                          "translate-x-7"
                        : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Create Category Modal */}
              <AnimatePresence>
                {showCategoryModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          Create New Category
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowCategoryModal(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FaXmark className="text-xl" />
                        </button>
                      </div>

                      <p className="text-gray-500 text-sm mb-4">
                        Create a custom category for your petition. This will be
                        visible to all users. (Max 15 characters)
                      </p>

                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => {
                          setNewCategoryName(e.target.value);
                          setCategoryError("");
                        }}
                        placeholder="Enter category name..."
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#F43676] focus:outline-none transition-all duration-200"
                        maxLength={15}
                      />

                      {categoryError && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <FaCircleExclamation className="text-xs" />
                          {categoryError}
                        </p>
                      )}

                      <div className="flex gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCategoryModal(false);
                            setNewCategoryName("");
                            setCategoryError("");
                          }}
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={creatingCategory || !newCategoryName.trim()}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                        >
                          {creatingCategory ?
                            <>
                              <FaSpinner className="animate-spin" />
                              Creating...
                            </>
                          : <>
                              <FaPlus />
                              Create
                            </>
                          }
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-700">
                Who can make it happen?
              </h2>
              <p className="mb-2 font-medium text-gray-600">
                Add contact details of decision makers who have the power to
                address your petition.
              </p>
              <p className="mb-4 text-sm text-gray-500 flex items-center gap-1">
                <FaCircleInfo className="text-blue-400" />
                At least one recipient with a valid name (3+ characters) is
                required. Email is optional.
              </p>
              <div className="space-y-4">
                {recipients.map((recipient, recipientIdx) => {
                  const nameValidation = validateField(
                    "recipientName",
                    recipient.name,
                  );
                  const emailValidation = validateField(
                    "recipientEmail",
                    recipient.email,
                  );
                  const phoneValidation =
                    recipient.phone ?
                      validateField("recipientPhone", recipient.phone)
                    : { isValid: true };

                  return (
                    <div
                      key={recipientIdx}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Decision Maker #{recipientIdx + 1}
                        </span>
                        {recipientIdx > 0 && (
                          <button
                            onClick={() =>
                              setRecipients(
                                recipients.filter((_, i) => i !== recipientIdx),
                              )
                            }
                            className="text-red-500 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={recipient.name}
                            onChange={(e) =>
                              updateRecipient(
                                recipientIdx,
                                "name",
                                e.target.value,
                              )
                            }
                            onBlur={() =>
                              markFieldTouched(`recipient_${recipientIdx}_name`)
                            }
                            className={`w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F43676] transition-all ${
                              (
                                touchedFields[
                                  `recipient_${recipientIdx}_name`
                                ] &&
                                !nameValidation.isValid &&
                                recipient.name
                              ) ?
                                "border-red-400 bg-red-50"
                              : (
                                touchedFields[
                                  `recipient_${recipientIdx}_name`
                                ] &&
                                nameValidation.isValid &&
                                recipient.name
                              ) ?
                                "border-green-400 bg-green-50"
                              : "border-gray-300"
                            }`}
                            placeholder="e.g., Dr. Rajesh Kumar or Hon. Smt. Nirmala Sitharaman"
                          />
                          {touchedFields[`recipient_${recipientIdx}_name`] &&
                            nameValidation.isValid &&
                            recipient.name && (
                              <FaCircleCheck className="absolute right-3 top-3 text-green-500" />
                            )}
                        </div>
                        {!recipient.name && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FaCircleInfo className="text-blue-400" />
                            Enter the decision maker&apos;s full name with title
                            if applicable
                          </p>
                        )}
                        {touchedFields[`recipient_${recipientIdx}_name`] &&
                          !nameValidation.isValid &&
                          recipient.name && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <FaCircleExclamation className="text-xs" />
                              {nameValidation.error}
                            </p>
                          )}
                      </div>

                      {/* Organization Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Office/Organization{" "}
                          <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={recipient.organization}
                          onChange={(e) =>
                            updateRecipient(
                              recipientIdx,
                              "organization",
                              e.target.value,
                            )
                          }
                          className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F43676] border-gray-300"
                          placeholder="e.g., Ministry of Environment or Municipal Corporation of Delhi"
                        />
                        {!recipient.organization && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FaCircleInfo className="text-blue-400" />
                            The government ministry, department, or organization
                            they represent
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address{" "}
                          <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) =>
                              updateRecipient(
                                recipientIdx,
                                "email",
                                e.target.value,
                              )
                            }
                            onBlur={() =>
                              markFieldTouched(
                                `recipient_${recipientIdx}_email`,
                              )
                            }
                            className={`w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F43676] transition-all ${
                              (
                                touchedFields[
                                  `recipient_${recipientIdx}_email`
                                ] &&
                                !emailValidation.isValid &&
                                recipient.email
                              ) ?
                                "border-red-400 bg-red-50"
                              : (
                                touchedFields[
                                  `recipient_${recipientIdx}_email`
                                ] &&
                                emailValidation.isValid &&
                                recipient.email
                              ) ?
                                "border-green-400 bg-green-50"
                              : "border-gray-300"
                            }`}
                            placeholder="e.g., secretary@ministry.gov.in or contact@organization.org"
                          />
                          {touchedFields[`recipient_${recipientIdx}_email`] &&
                            emailValidation.isValid &&
                            recipient.email && (
                              <FaCircleCheck className="absolute right-3 top-3 text-green-500" />
                            )}
                        </div>
                        {!recipient.email && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FaCircleInfo className="text-blue-400" />
                            Official email address where petition will be
                            delivered
                          </p>
                        )}
                        {touchedFields[`recipient_${recipientIdx}_email`] &&
                          !emailValidation.isValid &&
                          recipient.email && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <FaCircleExclamation className="text-xs" />
                              {emailValidation.error}
                            </p>
                          )}
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number{" "}
                          <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={recipient.phone}
                            onChange={(e) =>
                              updateRecipient(
                                recipientIdx,
                                "phone",
                                e.target.value,
                              )
                            }
                            onBlur={() =>
                              markFieldTouched(
                                `recipient_${recipientIdx}_phone`,
                              )
                            }
                            className={`w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F43676] transition-all ${
                              (
                                touchedFields[
                                  `recipient_${recipientIdx}_phone`
                                ] &&
                                !phoneValidation.isValid &&
                                recipient.phone
                              ) ?
                                "border-red-400 bg-red-50"
                              : (
                                touchedFields[
                                  `recipient_${recipientIdx}_phone`
                                ] &&
                                phoneValidation.isValid &&
                                recipient.phone
                              ) ?
                                "border-green-400 bg-green-50"
                              : "border-gray-300"
                            }`}
                            placeholder="e.g., +91 11 2338 8911 or 011-23388911"
                          />
                          {touchedFields[`recipient_${recipientIdx}_phone`] &&
                            phoneValidation.isValid &&
                            recipient.phone && (
                              <FaCircleCheck className="absolute right-3 top-3 text-green-500" />
                            )}
                        </div>
                        {!recipient.phone && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FaCircleInfo className="text-blue-400" />
                            Official phone or landline number (if available)
                          </p>
                        )}
                        {touchedFields[`recipient_${recipientIdx}_phone`] &&
                          !phoneValidation.isValid &&
                          recipient.phone && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <FaCircleExclamation className="text-xs" />
                              {phoneValidation.error}
                            </p>
                          )}
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={addRecipient}
                  className="text-[#F43676] font-semibold hover:underline flex items-center gap-2"
                >
                  <FaPlus className="text-sm" /> Add another decision maker
                </button>
                <div className="mt-4">
                  <label className="block font-medium mb-2">
                    Country or Region
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full border p-3 rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-[#F43676]"
                  >
                    <option>India</option>
                    <option>USA</option>
                    <option>UK</option>
                    <option>Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FaCircleInfo className="text-blue-400" />
                    Select the country where the petition is addressed
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-700">
                Petition Details
              </h2>
              <p className="mb-4 text-sm text-gray-500 flex items-center gap-1">
                <FaCircleInfo className="text-blue-400" />
                Describe your cause clearly to help supporters understand and
                sign your petition.
              </p>

              {/* Problem Description */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">
                  Describe the People Involved and the Problem They Are Facing{" "}
                  <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-sm ml-2">
                    (50-2000 characters)
                  </span>
                </h3>
                {(() => {
                  const props = getInputProps("problem", formData.problem);
                  return (
                    <div className="relative">
                      <textarea
                        value={formData.problem}
                        onChange={(e) =>
                          handleInputChange("problem", e.target.value)
                        }
                        onBlur={() => markFieldTouched("problem")}
                        className={props.className}
                        placeholder="Describe who is affected, what the issue is, where it's happening, and why it matters. Be specific with facts, numbers, and real examples..."
                        rows={5}
                      />
                      {props.showError && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaCircleExclamation className="text-xs" />
                          {props.error}
                        </p>
                      )}
                      {props.rules?.example &&
                        !props.showError &&
                        formData.problem === "" && (
                          <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                            <FaCircleInfo className="text-xs text-blue-400" />
                            {props.rules.example}
                          </p>
                        )}
                      <p
                        className={`text-xs mt-1 text-right ${
                          formData.problem.length < 50 ? "text-orange-500"
                          : formData.problem.length > 2000 ? "text-red-500"
                          : "text-gray-400"
                        }`}
                      >
                        {formData.problem.length}/2000 characters
                        {formData.problem.length > 0 &&
                          formData.problem.length < 50 &&
                          " (minimum 50)"}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Solution Description */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">
                  Describe the Solution You Are Proposing{" "}
                  <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-sm ml-2">
                    (30-1500 characters)
                  </span>
                </h3>
                {(() => {
                  const props = getInputProps("solution", formData.solution);
                  return (
                    <div className="relative">
                      <textarea
                        value={formData.solution}
                        onChange={(e) =>
                          handleInputChange("solution", e.target.value)
                        }
                        onBlur={() => markFieldTouched("solution")}
                        className={props.className}
                        placeholder="What specific action do you want the decision maker to take? Be clear about timelines, expected outcomes, and how this will help the affected people..."
                        rows={4}
                      />
                      {props.showError && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaCircleExclamation className="text-xs" />
                          {props.error}
                        </p>
                      )}
                      {props.rules?.example &&
                        !props.showError &&
                        formData.solution === "" && (
                          <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                            <FaCircleInfo className="text-xs text-blue-400" />
                            {props.rules.example}
                          </p>
                        )}
                      <p
                        className={`text-xs mt-1 text-right ${
                          formData.solution.length < 30 ? "text-orange-500"
                          : formData.solution.length > 1500 ? "text-red-500"
                          : "text-gray-400"
                        }`}
                      >
                        {formData.solution.length}/1500 characters
                        {formData.solution.length > 0 &&
                          formData.solution.length < 30 &&
                          " (minimum 30)"}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block font-medium mb-2">
                  Upload a Supporting Image{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <div
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer mb-2 relative hover:border-[#F43676] transition-colors"
                  onClick={() => document.getElementById("imageUpload").click()}
                >
                  {selectedImage ?
                    <Image
                      src={URL.createObjectURL(selectedImage)}
                      alt="Selected"
                      className="w-full h-full object-cover rounded-lg"
                      width={500}
                      height={300}
                    />
                  : <>
                      <FaPlus className="text-gray-400 text-4xl mb-2" />
                      <p className="text-gray-500 text-sm">
                        Click to upload an image
                      </p>
                    </>
                  }
                  <input
                    id="imageUpload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FaCircleInfo className="text-blue-400" />
                  Add a powerful image that represents your cause (JPG, PNG, or
                  GIF, max 2MB, Dimensions: 855x350px)
                </p>
              </div>

              {/* YouTube Video URL */}
              <div className="mb-4">
                <label className="block font-medium mb-2">
                  YouTube Video Link{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange("videoUrl", e.target.value)
                    }
                    onBlur={() => markFieldTouched("videoUrl")}
                    className={`w-full border p-3 rounded-lg shadow-sm pl-10 focus:ring-2 focus:ring-[#F43676] transition-all ${
                      (
                        touchedFields.videoUrl &&
                        formData.videoUrl &&
                        !validateField("videoUrl", formData.videoUrl).isValid
                      ) ?
                        "border-red-400 bg-red-50"
                      : (
                        touchedFields.videoUrl &&
                        formData.videoUrl &&
                        validateField("videoUrl", formData.videoUrl).isValid
                      ) ?
                        "border-green-400 bg-green-50"
                      : "border-gray-300"
                    }`}
                    placeholder="e.g., https://www.youtube.com/watch?v=abc123xyz or https://youtu.be/abc123xyz"
                  />
                  <FaYoutube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-xl" />
                  {touchedFields.videoUrl &&
                    formData.videoUrl &&
                    validateField("videoUrl", formData.videoUrl).isValid && (
                      <FaCircleCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                    )}
                </div>
                {!formData.videoUrl && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FaCircleInfo className="text-blue-400" />
                    Add a YouTube video explaining your cause to increase
                    engagement
                  </p>
                )}
                {touchedFields.videoUrl &&
                  formData.videoUrl &&
                  !validateField("videoUrl", formData.videoUrl).isValid && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaCircleExclamation className="text-xs" />
                      Please enter a valid YouTube URL (e.g.,
                      youtube.com/watch?v=... or youtu.be/...)
                    </p>
                  )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-2 text-gray-700">
                Petition Starter Information
              </h2>
              <p className="mb-4 text-sm text-gray-500 flex items-center gap-1">
                <FaCircleInfo className="text-blue-400" />
                Your personal information helps verify your identity as the
                petition creator. Fields marked with * are required.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.starter.name}
                    onChange={(e) =>
                      handleInputChange("starter.name", e.target.value)
                    }
                    onBlur={() => markFieldTouched("starterName")}
                    className={
                      getInputProps("starterName", formData.starter.name)
                        .className
                    }
                    placeholder="e.g., Rajesh Kumar Singh"
                  />
                  {getInputProps("starterName", formData.starter.name)
                    .showError && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        getInputProps("starterName", formData.starter.name)
                          .error
                      }
                    </p>
                  )}
                  {formData.starter.name === "" && (
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <FaCircleInfo className="text-xs text-blue-400" />
                      Enter your full legal name as it appears on ID
                    </p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.starter.age}
                    onChange={(e) =>
                      handleInputChange("starter.age", e.target.value)
                    }
                    onBlur={() => markFieldTouched("starterAge")}
                    className={
                      getInputProps("starterAge", formData.starter.age)
                        .className
                    }
                    placeholder="e.g., 25 (must be 18+)"
                  />
                  {getInputProps("starterAge", formData.starter.age)
                    .showError && (
                    <p className="text-red-500 text-sm mt-1">
                      {getInputProps("starterAge", formData.starter.age).error}
                    </p>
                  )}
                  {formData.starter.age === "" && (
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <FaCircleInfo className="text-xs text-blue-400" />
                      You must be 18 years or older
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.starter.email}
                    onChange={(e) =>
                      handleInputChange("starter.email", e.target.value)
                    }
                    onBlur={() => markFieldTouched("starterEmail")}
                    className={
                      getInputProps("starterEmail", formData.starter.email)
                        .className
                    }
                    placeholder="e.g., yourname@gmail.com"
                  />
                  {getInputProps("starterEmail", formData.starter.email)
                    .showError && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        getInputProps("starterEmail", formData.starter.email)
                          .error
                      }
                    </p>
                  )}
                  {formData.starter.email === "" && (
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <FaCircleInfo className="text-xs text-blue-400" />
                      We&apos;ll send petition updates to this email
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.starter.mobile}
                    onChange={(e) =>
                      handleInputChange("starter.mobile", e.target.value)
                    }
                    onBlur={() => markFieldTouched("starterMobile")}
                    className={
                      getInputProps("starterMobile", formData.starter.mobile)
                        .className
                    }
                    placeholder="e.g., 9876543210"
                  />
                  {getInputProps("starterMobile", formData.starter.mobile)
                    .showError && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        getInputProps("starterMobile", formData.starter.mobile)
                          .error
                      }
                    </p>
                  )}
                  {formData.starter.mobile === "" && (
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <FaCircleInfo className="text-xs text-blue-400" />
                      10-digit Indian mobile number starting with 6-9
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location/Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.starter.location}
                    onChange={(e) =>
                      handleInputChange("starter.location", e.target.value)
                    }
                    onBlur={() => markFieldTouched("starterLocation")}
                    className={
                      getInputProps(
                        "starterLocation",
                        formData.starter.location,
                      ).className
                    }
                    placeholder="e.g., Andheri West, Mumbai, Maharashtra"
                  />
                  {getInputProps("starterLocation", formData.starter.location)
                    .showError && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        getInputProps(
                          "starterLocation",
                          formData.starter.location,
                        ).error
                      }
                    </p>
                  )}
                  {formData.starter.location === "" && (
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <FaCircleInfo className="text-xs text-blue-400" />
                      Your city, locality and state
                    </p>
                  )}
                </div>

                {/* Comment/Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment/Notes{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={formData.starter.comment}
                    onChange={(e) =>
                      handleInputChange("starter.comment", e.target.value)
                    }
                    onBlur={() => markFieldTouched("starterComment")}
                    className={
                      getInputProps("starterComment", formData.starter.comment)
                        .className
                    }
                    placeholder="Share why this cause is important to you or any additional context..."
                    rows={3}
                  />
                  {formData.starter.comment === "" && (
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <FaCircleInfo className="text-xs text-blue-400" />
                      Optional: Share your personal connection to this cause
                    </p>
                  )}
                </div>
              </div>

              {/* Identity Verification Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Identity Verification
                </h3>
                <p className="mb-4 text-sm text-gray-500 flex items-center gap-1">
                  <FaCircleInfo className="text-blue-400" />
                  Provide at least your Aadhar number for identity verification.
                  Other documents are optional.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhar Card */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.starter.aadharNumber}
                          onChange={(e) => {
                            const previousDigits = normalizeAadhaarNumber(
                              formData.starter.aadharNumber,
                            );
                            // Remove all non-digits
                            let value = e.target.value.replace(/\D/g, "");
                            // Limit to 12 digits
                            value = value.slice(0, 12);
                            // Format with spaces: XXXX XXXX XXXX
                            if (value.length > 8) {
                              value =
                                value.slice(0, 4) +
                                " " +
                                value.slice(4, 8) +
                                " " +
                                value.slice(8);
                            } else if (value.length > 4) {
                              value = value.slice(0, 4) + " " + value.slice(4);
                            }

                            const nextDigits = normalizeAadhaarNumber(value);
                            if (previousDigits !== nextDigits) {
                              setAadhaarOtp(createInitialAadhaarOtpState());
                            }

                            handleInputChange("starter.aadharNumber", value);
                          }}
                          onBlur={() => markFieldTouched("aadharNumber")}
                          className={
                            getInputProps(
                              "aadharNumber",
                              formData.starter.aadharNumber,
                            ).className
                          }
                          placeholder="e.g., 2345 6789 0123 (12 digits)"
                          maxLength={14}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendAadhaarOtp}
                        disabled={
                          aadhaarOtp.sending ||
                          !validateField(
                            "aadharNumber",
                            formData.starter.aadharNumber,
                          ).isValid
                        }
                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                          (
                            aadhaarOtp.sending ||
                            !validateField(
                              "aadharNumber",
                              formData.starter.aadharNumber,
                            ).isValid
                          ) ?
                            "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#2D3A8C] text-white hover:bg-[#1e2a6c]"
                        }`}
                      >
                        {aadhaarOtp.sending ?
                          "Sending..."
                        : aadhaarOtp.otpSent ?
                          "Resend OTP"
                        : "Send OTP"}
                      </button>
                    </div>
                    {getInputProps(
                      "aadharNumber",
                      formData.starter.aadharNumber,
                    ).showError && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          getInputProps(
                            "aadharNumber",
                            formData.starter.aadharNumber,
                          ).error
                        }
                      </p>
                    )}
                    {formData.starter.aadharNumber === "" && (
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <FaCircleInfo className="text-xs text-blue-400" />
                        12 digits, cannot start with 0 or 1
                      </p>
                    )}
                    {aadhaarOtp.success && (
                      <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                        <FaCircleCheck className="text-xs" />
                        {aadhaarOtp.success}
                      </p>
                    )}
                    {aadhaarOtp.error && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <FaCircleExclamation className="text-xs" />
                        {aadhaarOtp.error}
                      </p>
                    )}
                    {aadhaarOtp.verified && (
                      <p className="text-green-700 text-sm mt-2 flex items-center gap-1 font-medium">
                        <FaCircleCheck className="text-xs" />
                        Aadhaar verified successfully
                        {aadhaarOtp.maskedAadhaar ?
                          ` (${aadhaarOtp.maskedAadhaar})`
                        : ""}
                      </p>
                    )}
                    <div className="flex space-x-2 mt-2">
                      <input
                        type="text"
                        value={aadhaarOtp.otp}
                        onChange={(e) => {
                          const otpValue = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 8);
                          setAadhaarOtp((prev) => ({
                            ...prev,
                            otp: otpValue,
                            error: "",
                          }));
                        }}
                        disabled={!aadhaarOtp.otpSent || aadhaarOtp.verified}
                        className={`w-full border p-3 rounded-lg shadow-sm ${
                          !aadhaarOtp.otpSent || aadhaarOtp.verified ?
                            "bg-gray-100"
                          : "bg-white"
                        }`}
                        placeholder={
                          aadhaarOtp.otpSent ? "Enter OTP" : "Send OTP first"
                        }
                      />
                      <button
                        type="button"
                        onClick={handleVerifyAadhaarOtp}
                        disabled={
                          !aadhaarOtp.otpSent ||
                          aadhaarOtp.verifying ||
                          aadhaarOtp.verified ||
                          aadhaarOtp.otp.trim().length < 4
                        }
                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                          (
                            !aadhaarOtp.otpSent ||
                            aadhaarOtp.verifying ||
                            aadhaarOtp.verified ||
                            aadhaarOtp.otp.trim().length < 4
                          ) ?
                            "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#F43676] text-white hover:bg-[#d62860]"
                        }`}
                      >
                        {aadhaarOtp.verified ?
                          "Verified"
                        : aadhaarOtp.verifying ?
                          "Verifying..."
                        : "Verify OTP"}
                      </button>
                    </div>
                  </div>

                  {/* PAN Card */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.starter.panNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "starter.panNumber",
                              e.target.value.toUpperCase(),
                            )
                          }
                          onBlur={() => markFieldTouched("panNumber")}
                          className={
                            getInputProps(
                              "panNumber",
                              formData.starter.panNumber,
                            ).className
                          }
                          placeholder="e.g., ABCDE1234F (5 letters, 4 digits, 1 letter)"
                        />
                      </div>
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed whitespace-nowrap"
                        title="OTP verification coming soon"
                      >
                        Send OTP
                      </button>
                    </div>
                    {getInputProps("panNumber", formData.starter.panNumber)
                      .showError && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          getInputProps("panNumber", formData.starter.panNumber)
                            .error
                        }
                      </p>
                    )}
                    {formData.starter.panNumber === "" && (
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <FaCircleInfo className="text-xs text-blue-400" />
                        Format: XXXXX0000X (all uppercase)
                      </p>
                    )}
                    <div className="flex space-x-2 mt-2">
                      <input
                        type="text"
                        disabled
                        className="w-full border p-3 rounded-lg shadow-sm bg-gray-100"
                        placeholder="Enter OTP (feature coming soon)"
                      />
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed whitespace-nowrap"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>

                  {/* Voter ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voter ID <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.starter.voterNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "starter.voterNumber",
                          e.target.value.toUpperCase(),
                        )
                      }
                      onBlur={() => markFieldTouched("voterNumber")}
                      className={
                        getInputProps(
                          "voterNumber",
                          formData.starter.voterNumber,
                        ).className
                      }
                      placeholder="e.g., ABC1234567"
                    />
                    {getInputProps("voterNumber", formData.starter.voterNumber)
                      .showError && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          getInputProps(
                            "voterNumber",
                            formData.starter.voterNumber,
                          ).error
                        }
                      </p>
                    )}
                    {formData.starter.voterNumber === "" && (
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <FaCircleInfo className="text-xs text-blue-400" />
                        Format: XXX0000000 (3 letters + 7 digits)
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.starter.pincode}
                      onChange={(e) =>
                        handleInputChange("starter.pincode", e.target.value)
                      }
                      onBlur={() => markFieldTouched("pincode")}
                      className={
                        getInputProps("pincode", formData.starter.pincode)
                          .className
                      }
                      placeholder="e.g., 400001"
                    />
                    {getInputProps("pincode", formData.starter.pincode)
                      .showError && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          getInputProps("pincode", formData.starter.pincode)
                            .error
                        }
                      </p>
                    )}
                    {formData.starter.pincode === "" && (
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <FaCircleInfo className="text-xs text-blue-400" />
                        6-digit Indian pincode
                      </p>
                    )}
                  </div>

                  {/* MP Constituency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MP Constituency Number{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.starter.mpConstituencyNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "starter.mpConstituencyNumber",
                          e.target.value,
                        )
                      }
                      onBlur={() => markFieldTouched("mpConstituencyNumber")}
                      className={
                        getInputProps(
                          "mpConstituencyNumber",
                          formData.starter.mpConstituencyNumber,
                        ).className
                      }
                      placeholder="e.g., 1 to 543"
                    />
                    {formData.starter.mpConstituencyNumber === "" && (
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <FaCircleInfo className="text-xs text-blue-400" />
                        Find at eci.gov.in
                      </p>
                    )}
                  </div>

                  {/* MLA Constituency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MLA Constituency Number{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.starter.mlaConstituencyNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "starter.mlaConstituencyNumber",
                          e.target.value,
                        )
                      }
                      onBlur={() => markFieldTouched("mlaConstituencyNumber")}
                      className={
                        getInputProps(
                          "mlaConstituencyNumber",
                          formData.starter.mlaConstituencyNumber,
                        ).className
                      }
                      placeholder="e.g., 1 to 403 (varies by state)"
                    />
                    {formData.starter.mlaConstituencyNumber === "" && (
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <FaCircleInfo className="text-xs text-blue-400" />
                        Find at your state election commission
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Summary */}
              {!isStep4Valid() && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-700 text-sm flex items-center gap-2">
                    <FaCircleExclamation />
                    Please complete all required fields (*), verify Aadhaar OTP,
                    and verify the captcha before submitting.
                  </p>
                </div>
              )}

              {/* Captcha Section */}
              <div className="mt-6">
                <Captcha
                  onVerify={(verified) => setCaptchaVerified(verified)}
                  resetTrigger={captchaResetTrigger}
                />
              </div>

              <motion.button
                whileHover={
                  isStep4Valid() && !isSubmitting ? { scale: 1.02 } : {}
                }
                whileTap={
                  isStep4Valid() && !isSubmitting ? { scale: 0.98 } : {}
                }
                onClick={handleSubmit}
                disabled={isSubmitting || !isStep4Valid()}
                className={`mt-6 px-6 py-4 font-bold rounded-lg w-full shadow-lg transition-all duration-200 text-lg ${
                  isSubmitting || !isStep4Valid() ?
                    "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#2D3A8C] to-[#F43676] text-white hover:from-[#1e2a6c] hover:to-[#d62860]"
                }`}
              >
                {isSubmitting ?
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting Your Petition...
                  </span>
                : "🚀 Submit Petition"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevStep}
              className="px-6 py-2 bg-[#2D3A8C] text-white rounded-lg shadow-md hover:bg-[#1e2a6c] transition-colors"
            >
              Previous
            </motion.button>
          )}
          {step < totalSteps && (
            <motion.button
              whileHover={isCurrentStepValid() ? { scale: 1.05 } : {}}
              whileTap={isCurrentStepValid() ? { scale: 0.95 } : {}}
              onClick={nextStep}
              disabled={!isCurrentStepValid()}
              className={`px-6 py-2 rounded-lg shadow-md transition-all duration-200 ${
                isCurrentStepValid() ?
                  "bg-gradient-to-r from-[#2D3A8C] to-[#F43676] text-white hover:from-[#1e2a6c] hover:to-[#d62860] cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
