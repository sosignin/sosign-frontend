"use client";

import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";

export default function SubmitStallReportModal({
  petitionId,
  isOpen,
  onClose,
  onSuccess,
  token,
}) {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!isOpen) return;

    const fetchCities = async () => {
      try {
        setFetchingData(true);
        const res = await fetch(`${backendUrl}/api/stall-reports/cities`);
        if (res.ok) {
          const data = await res.json();
          setCities(data.cities || []);
          if (data.cities && data.cities.length > 0) {
            setSelectedCity(data.cities[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchCities();
  }, [isOpen, backendUrl]);

  useEffect(() => {
    if (!selectedCity) return;

    const fetchSchools = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/stall-reports/schools?city=${encodeURIComponent(selectedCity)}`);
        if (res.ok) {
          const data = await res.json();
          setSchools(data.schools || []);
          if (data.schools && data.schools.length > 0) {
            setSelectedSchoolId(data.schools[0]._id);
            // Default coords to school coords
            if (data.schools[0].location?.coordinates) {
              setLongitude(String(data.schools[0].location.coordinates[0]));
              setLatitude(String(data.schools[0].location.coordinates[1]));
            }
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
      setLongitude(String(chosen.location.coordinates[0]));
      setLatitude(String(chosen.location.coordinates[1]));
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
    // Reset file input so user can select again
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
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setError("Location permission denied. Please allow location access in your browser settings.");
        } else if (err.code === 2) {
          setError("Location unavailable. Please check your device's GPS.");
        } else if (err.code === 3) {
          setError("Location request timed out. Please try again.");
        } else {
          setError("Could not retrieve GPS location: " + err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedSchoolId || !shopName || !latitude || !longitude) {
      setError("Please complete all required fields and coordinates.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("petitionId", petitionId);
      formData.append("city", selectedCity);
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
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Report submitted successfully! Admin will review and verify the 50m radius violation.");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(data.message || "Failed to submit report.");
      }
    } catch (err) {
      setError("Error submitting report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentSchool = schools.find((s) => s._id === selectedSchoolId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-red-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <FaStore className="text-xl" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Report 50m Junk Food Stall</h3>
              <p className="text-xs text-gray-500">Crowd-source illegal food stalls near schools in Maharashtra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {fetchingData ? (
          <div className="py-12 text-center text-gray-500">
            <FaSpinner className="animate-spin text-2xl mb-2 text-red-600 mx-auto" />
            <p className="text-xs font-semibold">Loading Maharashtra cities & schools...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <FaCheckCircle className="text-green-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* City Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <FaCity className="text-red-500" /> Select City (Maharashtra) *
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 bg-white font-medium"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* School Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <FaSchool className="text-red-500" /> Select Nearby School *
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => handleSchoolChange(e.target.value)}
                className="w-full text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 bg-white font-medium"
              >
                {schools.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.address || s.city})
                  </option>
                ))}
              </select>
              {currentSchool && (
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-red-400 text-xs" />
                  Address: {currentSchool.address || currentSchool.city}
                </p>
              )}
            </div>

            {/* Stall Name & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Junk Food Stall Name *</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Raju Fast Food Corner"
                  className="w-full text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Details / Food Items</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Selling fried items near gate"
                  className="w-full text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Coordinates / Geolocation */}
            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-red-600" /> Stall GPS Coordinates (Within 50m)
                </span>
                <div className="flex items-center gap-2">
                  {latitude && longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-sm flex items-center gap-1"
                      title="Open location in Google Maps"
                    >
                      <FaMapMarkerAlt className="text-blue-500" />
                      <span>Google Maps</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleGetLiveLocation}
                    disabled={gpsLoading}
                    className="text-[11px] font-bold text-red-600 hover:text-red-800 bg-white px-2.5 py-1 rounded-lg border border-red-200 shadow-sm disabled:opacity-50"
                  >
                    {gpsLoading ? "Locating..." : "Use My Current GPS"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-600 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 19.0345"
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 72.8398"
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Evidence Photos Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <FaCamera className="text-red-500" /> Evidence Photos (Max 5)
              </label>
              <div className="flex gap-2 mb-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 text-xs p-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors">
                    <FaCamera />
                    <span>{imageFiles.length >= 5 ? "Max 5 photos reached" : "Tap to select photos"}</span>
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
                      <img src={URL.createObjectURL(file)} alt="" className="w-16 h-14 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1 text-[10px]"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-300 font-bold text-xs text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-red-700 hover:to-rose-700 flex items-center justify-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin text-base" /> : "Submit Report for Verification"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
