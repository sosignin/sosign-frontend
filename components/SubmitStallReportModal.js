"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaStore,
  FaSchool,
  FaMapMarkerAlt,
  FaCamera,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCity,
  FaMicrophone,
  FaMicrophoneSlash,
  FaChevronRight,
  FaChevronLeft,
  FaShieldAlt,
  FaInfoCircle,
} from "react-icons/fa";

import { parseGoogleLocationString } from "../utils/parseGoogleLocation";

// 36 Districts of Maharashtra
const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara",
  "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli",
  "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban",
  "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar",
  "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
  "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
];

function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function SubmitStallReportModal({
  petitionId,
  isOpen,
  onClose,
  onSuccess,
  token,
  initialData,
}) {
  const [step, setStep] = useState(1); // 1: Type/Location, 2: Describe, 3: Review
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(initialData?.city || "Mumbai");
  const [taluka, setTaluka] = useState(initialData?.taluka || "");
  const [villageTown, setVillageTown] = useState(initialData?.villageTown || "");
  const [landmark, setLandmark] = useState(initialData?.landmark || "");
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [shopName, setShopName] = useState(initialData?.shopName || "");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(initialData?.latitude ? String(initialData.latitude) : "");
  const [longitude, setLongitude] = useState(initialData?.longitude ? String(initialData.longitude) : "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const miniMapRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const miniMarkerRef = useRef(null);
  const recognitionRef = useRef(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Google Maps URL auto-parse
  const handleGoogleMapsUrlChange = (val) => {
    setGoogleMapsUrl(val);
    if (!val) return;
    const coords = parseGoogleLocationString(val);
    if (coords) {
      setLatitude(coords.lat.toString());
      setLongitude(coords.lng.toString());
    }
  };

  // Fetch Cities
  useEffect(() => {
    if (!isOpen) return;

    const fetchCities = async () => {
      try {
        setFetchingData(true);
        const res = await fetch(`${backendUrl}/api/stall-reports/cities`);
        if (res.ok) {
          const data = await res.json();
          const fetchedCities = data.cities || [];
          // Merge with MAHARASHTRA_DISTRICTS
          const allDistricts = Array.from(
            new Set([...MAHARASHTRA_DISTRICTS, ...fetchedCities])
          ).sort();
          setCities(allDistricts);
          if (!selectedCity && allDistricts.length > 0) {
            setSelectedCity(allDistricts[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCities(MAHARASHTRA_DISTRICTS);
      } finally {
        setFetchingData(false);
      }
    };

    fetchCities();
  }, [isOpen, backendUrl]);

  // Fetch Schools for selected city
  useEffect(() => {
    if (!selectedCity) return;

    const fetchSchools = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/api/stall-reports/schools?city=${encodeURIComponent(
            selectedCity
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          setSchools(data.schools || []);
          if (data.schools && data.schools.length > 0) {
            setSelectedSchoolId(data.schools[0]._id);
            if (!latitude && !longitude && data.schools[0].location?.coordinates) {
              setLongitude(String(data.schools[0].location.coordinates[0]));
              setLatitude(String(data.schools[0].location.coordinates[1]));
            }
          } else {
            setSelectedSchoolId("");
          }
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
      }
    };

    fetchSchools();
  }, [selectedCity, backendUrl]);

  const handleSchoolChange = (schoolId) => {
    setSelectedSchoolId(schoolId);
    const chosen = schools.find((s) => s._id === schoolId);
    if (chosen && chosen.location?.coordinates) {
      // Default coordinates close to school if user hasn't set custom GPS
      if (!latitude || !longitude) {
        setLongitude(String(chosen.location.coordinates[0]));
        setLatitude(String(chosen.location.coordinates[1]));
      }
    }
  };

  const currentSchool = schools.find((s) => s._id === selectedSchoolId);

  // Calculate live distance to current school
  const liveDistance = React.useMemo(() => {
    if (!currentSchool?.location?.coordinates || !latitude || !longitude) {
      return null;
    }
    const schoolLng = currentSchool.location.coordinates[0];
    const schoolLat = currentSchool.location.coordinates[1];
    return calculateDistanceInMeters(
      schoolLat,
      schoolLng,
      parseFloat(latitude),
      parseFloat(longitude)
    );
  }, [currentSchool, latitude, longitude]);

  // Mini-map initialization & sync
  useEffect(() => {
    if (!isOpen || step !== 2) return;

    const initMiniMap = () => {
      if (typeof window === "undefined" || !window.google || !window.google.maps) {
        return;
      }
      if (!miniMapRef.current) return;

      const latNum = parseFloat(latitude) || currentSchool?.location?.coordinates?.[1] || 19.076;
      const lngNum = parseFloat(longitude) || currentSchool?.location?.coordinates?.[0] || 72.8777;
      const center = { lat: latNum, lng: lngNum };

      if (!miniMapInstanceRef.current) {
        const map = new window.google.maps.Map(miniMapRef.current, {
          center,
          zoom: 17,
          mapTypeId: "roadmap",
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });
        miniMapInstanceRef.current = map;

        const marker = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
          title: "Stall Location (Drag to adjust)",
        });
        miniMarkerRef.current = marker;

        marker.addListener("dragend", (e) => {
          const newLat = e.latLng.lat().toFixed(6);
          const newLng = e.latLng.lng().toFixed(6);
          setLatitude(newLat);
          setLongitude(newLng);
        });

        map.addListener("click", (e) => {
          const newLat = e.latLng.lat().toFixed(6);
          const newLng = e.latLng.lng().toFixed(6);
          setLatitude(newLat);
          setLongitude(newLng);
          marker.setPosition(e.latLng);
        });
      } else {
        miniMapInstanceRef.current.setCenter(center);
        if (miniMarkerRef.current) {
          miniMarkerRef.current.setPosition(center);
        }
      }
    };

    const timer = setTimeout(initMiniMap, 200);
    return () => clearTimeout(timer);
  }, [isOpen, step, latitude, longitude, currentSchool]);

  // Voice recognition mic toggle
  const handleToggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN"; // Supports English / Hindi / Marathi accents
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsRecording(false);
    }
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - imageFiles.length;
    if (remaining <= 0) {
      setError("Maximum 5 photos allowed.");
      return;
    }
    const newFiles = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        setGpsLoading(false);

        if (miniMapInstanceRef.current && window.google) {
          const pos = new window.google.maps.LatLng(parseFloat(lat), parseFloat(lng));
          miniMapInstanceRef.current.setCenter(pos);
          miniMapInstanceRef.current.setZoom(18);
          if (miniMarkerRef.current) {
            miniMarkerRef.current.setPosition(pos);
          }
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setError("Location permission denied. Please enable GPS permissions.");
        } else {
          setError("Could not retrieve GPS location: " + err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const resetForm = () => {
    setStep(1);
    setShopName("");
    setDescription("");
    setTaluka("");
    setVillageTown("");
    setLandmark("");
    setLatitude("");
    setLongitude("");
    setGoogleMapsUrl("");
    setImageFiles([]);
    setError("");
    setSuccess("");
    miniMapInstanceRef.current = null;
    miniMarkerRef.current = null;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!selectedCity) {
        setError("Please select a District.");
        return;
      }
      if (!selectedSchoolId && schools.length > 0) {
        setError("Please select the nearby School.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!shopName.trim()) {
        setError("Please enter the Shop / Stall name.");
        return;
      }
      if (!latitude || !longitude) {
        setError("Please pinpoint the stall GPS coordinates or capture your location.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedSchoolId || !shopName || !latitude || !longitude) {
      setError("Please complete all required fields and coordinates.");
      return;
    }

    try {
      setLoading(true);
      const authToken =
        token ||
        (typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user") || "{}")?.token || ""
          : "");

      const formData = new FormData();
      formData.append("petitionId", petitionId || "");
      formData.append("city", selectedCity);
      formData.append("district", selectedCity);
      formData.append("taluka", taluka);
      formData.append("villageTown", villageTown);
      formData.append("landmark", landmark);
      formData.append("schoolId", selectedSchoolId);
      formData.append("shopName", shopName);
      formData.append("description", description);
      formData.append("latitude", parseFloat(latitude));
      formData.append("longitude", parseFloat(longitude));
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch(`${backendUrl}/api/stall-reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(
          "Grievance submitted successfully! Verification notice generated."
        );
        resetForm();
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1800);
      } else {
        setError(data.message || "Failed to submit grievance.");
      }
    } catch (err) {
      setError("Error submitting grievance: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 border border-pink-100/90 my-6 relative">
        {/* Top Header Card (Pink & White Website Theme) */}
        <div className="bg-gradient-to-r from-[#d81b60] via-[#F43676] to-[#e02a60] text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg">
              <FaShieldAlt />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Report School Buffer Food Stall
              </h3>
              <p className="text-[11px] text-pink-50 font-normal">
                50m School Buffer Zone Vigilance & Enforcement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
          >
            <FaTimes />
          </button>
        </div>

        {/* Stepper (Location -> Describe -> Review) */}
        <div className="flex items-center justify-between px-2 pt-1 border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step > 1
                  ? "bg-emerald-500 text-white"
                  : step === 1
                  ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-xs"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {step > 1 ? "✓" : "1"}
            </div>
            <span
              className={`text-xs font-bold ${
                step === 1 ? "text-[#F43676]" : "text-gray-500"
              }`}
            >
              Location
            </span>
          </div>

          <div
            className={`flex-1 h-0.5 mx-2 ${
              step > 1 ? "bg-emerald-500" : "bg-gray-200"
            }`}
          />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step > 2
                  ? "bg-emerald-500 text-white"
                  : step === 2
                  ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-xs"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {step > 2 ? "✓" : "2"}
            </div>
            <span
              className={`text-xs font-bold ${
                step === 2 ? "text-[#F43676]" : "text-gray-500"
              }`}
            >
              Describe
            </span>
          </div>

          <div
            className={`flex-1 h-0.5 mx-2 ${
              step > 2 ? "bg-emerald-500" : "bg-gray-200"
            }`}
          />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3
                  ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-xs"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              3
            </div>
            <span
              className={`text-xs font-bold ${
                step === 3 ? "text-[#F43676]" : "text-gray-500"
              }`}
            >
              Review
            </span>
          </div>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <FaExclamationTriangle className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* STEP 1: District, Taluka, School & Locality */}
        {step === 1 && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-gray-900">
                Where did this happen?
              </h4>
              <p className="text-xs text-gray-500">
                Select the district and the nearest monitored school in Maharashtra.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  District *
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 focus:border-[#F43676] bg-white font-medium text-gray-900"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Taluka / Area
                </label>
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  placeholder="e.g. Haveli / Andheri"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 focus:border-[#F43676] bg-white text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* School Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FaSchool className="text-[#F43676]" /> Target School *
                </span>
                <span className="text-[10px] text-gray-400 font-normal">
                  {schools.length} schools mapped
                </span>
              </label>
              {schools.length === 0 ? (
                <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-xl text-xs text-gray-500 text-center">
                  No registered schools found for {selectedCity}. You can still proceed with coordinates.
                </div>
              ) : (
                <select
                  value={selectedSchoolId}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 focus:border-[#F43676] bg-white font-medium text-gray-900"
                >
                  {schools.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.address || s.city})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Village / Town and Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Village / Town
                </label>
                <input
                  type="text"
                  value={villageTown}
                  onChange={(e) => setVillageTown(e.target.value)}
                  placeholder="e.g. Bandra West"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 focus:border-[#F43676] bg-white text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Landmark *
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Main School Gate"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 focus:border-[#F43676] bg-white text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-2 border-t border-pink-100">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 border border-gray-300 font-bold text-xs text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white font-bold text-xs rounded-xl shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <FaChevronRight className="text-[10px]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Tell us what happened */}
        {step === 2 && (
          <div className="space-y-3.5 animate-in fade-in duration-200 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-gray-900">
                Tell us what happened.
              </h4>
              <p className="text-[11px] text-gray-500 leading-normal">
                Write what happened in your own words - Marathi, Hindi or English. You can also use the mic. We&apos;ll pick out the details.
              </p>
            </div>

            {/* Shop / Establishment Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Shop / establishment name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Raju Fast Food / Gupta Pan Corner"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 focus:border-[#F43676] bg-white text-gray-900 font-medium"
              />
            </div>

            {/* Guidance Callout Box (Pink & White Theme) */}
            <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-3 text-[11px] text-pink-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-[#F43676] text-xs">
                <span>📋</span>
                <span>Please include, so we can act fast:</span>
              </div>
              <ul className="space-y-1 text-[10px] text-gray-700 pl-1 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>What exactly was wrong - junk food stall within 50m of school, expired food, tobacco products</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>The shop / brand / vendor name</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Where it is - gate number, corner, footpath or landmark</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Add photo evidence or location below</span>
                </li>
              </ul>
            </div>

            {/* Grievance Description Textarea */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Describe your grievance *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what items are being sold, how close to the school gate they are, and why it poses a health risk..."
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 focus:border-[#F43676] bg-white text-gray-900 font-medium resize-none"
              />

              {/* Speech mic button & live validation status */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isRecording
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-pink-50 text-[#F43676] hover:bg-pink-100 border border-pink-200"
                  }`}
                >
                  {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  <span>{isRecording ? "Listening... Tap to stop" : "🎙️ or speak"}</span>
                </button>

                {description.trim().length > 10 && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <FaCheckCircle className="text-[9px]" /> Looks good - you can continue
                  </span>
                )}
              </div>
            </div>

            {/* Location Section & Mini Map */}
            <div className="space-y-2 border-t border-pink-100 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-[#F43676]" /> Your location *
                </label>
                <button
                  type="button"
                  onClick={handleGetLiveLocation}
                  disabled={gpsLoading}
                  className="px-3 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#F43676] border border-pink-200 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {gpsLoading ? (
                    <FaSpinner className="animate-spin text-[#F43676]" />
                  ) : (
                    <span>📍</span>
                  )}
                  <span>Recapture my location</span>
                </button>
              </div>

              {/* Embedded Mini-Map Container */}
              <div className="relative rounded-2xl overflow-hidden border border-pink-200 h-44 bg-slate-100">
                <div ref={miniMapRef} className="w-full h-full" />
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-700 shadow-xs border border-pink-100">
                  Drag marker to pinpoint stall
                </div>
              </div>

              {/* Distance Meter Status */}
              {liveDistance !== null && (
                <div
                  className={`p-2 rounded-xl text-[11px] font-semibold flex items-center justify-between ${
                    liveDistance <= 50
                      ? "bg-rose-50 border border-rose-200 text-rose-700"
                      : "bg-pink-50/50 border border-pink-100 text-gray-600"
                  }`}
                >
                  <span>
                    Calculated Distance: <strong>{liveDistance} meters</strong> from school
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      liveDistance <= 50
                        ? "bg-[#F43676] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {liveDistance <= 50 ? "⚠️ Inside 50m Violation" : "Outside 50m"}
                  </span>
                </div>
              )}
            </div>

            {/* Evidence Photos Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1">
                <FaCamera className="text-[#F43676]" /> Evidence Photos (Max 5)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 text-xs p-2 border-2 border-dashed border-pink-200 rounded-xl text-gray-500 hover:border-[#F43676] hover:text-[#F43676] transition-colors bg-pink-50/20">
                    <FaCamera />
                    <span>{imageFiles.length >= 5 ? "5/5 photos uploaded" : "Tap to add stall photos"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddImages}
                    disabled={imageFiles.length >= 5}
                    className="hidden"
                  />
                </label>
              </div>

              {imageFiles.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {imageFiles.map((file, i) => (
                    <div key={i} className="relative group shrink-0">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Evidence"
                        className="w-14 h-12 object-cover rounded-lg border border-pink-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-[#F43676] text-white rounded-full p-0.5 text-[9px] cursor-pointer"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-2 border-t border-pink-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 border border-gray-300 font-bold text-xs text-gray-600 rounded-xl hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
              >
                <FaChevronLeft className="text-[10px]" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white font-bold text-xs rounded-xl shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Review & Confirm</span>
                <FaChevronRight className="text-[10px]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-gray-900">
                Review your grievance details
              </h4>
              <p className="text-xs text-gray-500">
                Please ensure coordinates and stall details are correct before sending to enforcement.
              </p>
            </div>

            <div className="bg-pink-50/30 p-4 rounded-2xl border border-pink-100 space-y-2 text-xs">
              <div className="flex justify-between border-b border-pink-100 pb-2">
                <span className="text-gray-500 font-medium">Stall Name:</span>
                <span className="font-bold text-gray-900">{shopName}</span>
              </div>

              <div className="flex justify-between border-b border-pink-100 pb-2">
                <span className="text-gray-500 font-medium">Target School:</span>
                <span className="font-bold text-gray-900">{currentSchool?.name || "Target School"}</span>
              </div>

              <div className="flex justify-between border-b border-pink-100 pb-2">
                <span className="text-gray-500 font-medium">District & Landmark:</span>
                <span className="font-bold text-gray-900">
                  {selectedCity} {landmark ? `• ${landmark}` : ""}
                </span>
              </div>

              <div className="flex justify-between border-b border-pink-100 pb-2">
                <span className="text-gray-500 font-medium">Calculated Distance:</span>
                <span className="font-extrabold text-[#F43676]">
                  {liveDistance !== null ? `${liveDistance} meters` : "Pending GPS"}
                </span>
              </div>

              {description && (
                <div className="pt-1">
                  <span className="text-gray-500 font-medium block mb-0.5">Grievance Note:</span>
                  <p className="text-gray-700 bg-white p-2 rounded-xl border border-pink-100 text-[11px] leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {imageFiles.length > 0 && (
                <div className="pt-1">
                  <span className="text-gray-500 font-medium block mb-1">
                    Attached Photos ({imageFiles.length}):
                  </span>
                  <div className="flex gap-2">
                    {imageFiles.map((file, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(file)}
                        alt="Evidence"
                        className="w-12 h-10 object-cover rounded-lg border border-pink-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submission Buttons */}
            <div className="flex gap-2 pt-2 border-t border-pink-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 border border-gray-300 font-bold text-xs text-gray-600 rounded-xl hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
              >
                <FaChevronLeft className="text-[10px]" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <>
                    <FaCheckCircle className="text-xs" />
                    <span>Confirm & Submit Stall Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
