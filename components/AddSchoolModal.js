"use client";

import React, { useState } from "react";
import {
  FaSchool,
  FaCity,
  FaMapMarkerAlt,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlusCircle,
} from "react-icons/fa";

import { parseGoogleLocationString } from "../utils/parseGoogleLocation";

export default function AddSchoolModal({ isOpen, onClose, existingCities = [], onSuccess }) {
  const [cityMode, setCityMode] = useState("new"); // 'existing' or 'new'
  const [selectedCity, setSelectedCity] = useState(existingCities[0] || "");
  const [customCity, setCustomCity] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (!isOpen) return null;

  // Handle Google Maps URL, DMS coordinates, or text Paste & Auto-Extraction
  const handleGoogleMapsUrlChange = (val) => {
    setGoogleMapsUrl(val);
    if (!val) return;

    const coords = parseGoogleLocationString(val);
    if (coords) {
      setLatitude(coords.lat.toString());
      setLongitude(coords.lng.toString());
    }
  };

  // Handle GPS location capture
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
        setError("GPS Error: " + err.message + ". Please enter coordinates manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const resetForm = () => {
    setCustomCity("");
    setSchoolName("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setGoogleMapsUrl("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const targetCity = cityMode === "new" ? customCity.trim() : selectedCity.trim();

    if (!targetCity) {
      setError("Please specify a city in Maharashtra.");
      return;
    }
    if (!schoolName.trim()) {
      setError("Please enter the school name.");
      return;
    }

    try {
      setLoading(true);
      const userObj = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
      const token = userObj?.token || "";

      if (!token) {
        setError("You must be logged in as a signer to request a school.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${backendUrl}/api/stall-reports/schools/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city: targetCity,
          name: schoolName,
          address,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Request submitted successfully! Admin will crosscheck and approve from admin panel.");
        resetForm();
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2200);
      } else {
        setError(data.message || "Failed to submit school request.");
      }
    } catch (err) {
      setError("Error submitting request: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-pink-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#F43676] flex items-center justify-center">
              <FaPlusCircle className="text-xl" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Request New City / School</h3>
              <p className="text-xs text-gray-500">Add missing Maharashtra school to live 50m map</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-[#F43676] flex items-center justify-center transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <FaExclamationTriangle className="text-[#F43676] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <FaCheckCircle className="text-green-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* City Toggle & Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FaCity className="text-[#F43676]" /> City (Maharashtra) *
              </label>
              <div className="flex gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setCityMode("new")}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    cityMode === "new" ? "bg-[#F43676] text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  + Add New City
                </button>
                {existingCities.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCityMode("existing")}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      cityMode === "existing" ? "bg-[#F43676] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Choose Existing
                  </button>
                )}
              </div>
            </div>

            {cityMode === "new" ? (
              <input
                type="text"
                required
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="e.g. Kolhapur, Nanded, Satara, Latur"
                className="w-full text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F43676] bg-white text-gray-900 font-medium"
              />
            ) : (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F43676] bg-white text-gray-900 font-medium"
              >
                {existingCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* School Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <FaSchool className="text-[#F43676]" /> School Name *
            </label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Rajaram High School & Junior College"
              className="w-full text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F43676] bg-white text-gray-900 font-medium"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">School Address / Locality</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shahupuri, Kolhapur"
              className="w-full text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F43676] bg-white text-gray-900 font-medium"
            />
          </div>

          {/* Coordinates & Google Maps Link Parsing */}
          <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-[#F43676]" /> Share via Google Maps Link (Optional)
                </span>
                <span className="text-[10px] text-gray-500 font-normal">Auto-extracts Lat & Lng</span>
              </label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
                placeholder="Paste Google Maps link e.g. https://maps.google.com/?q=16.7050,74.2433"
                className="w-full text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F43676] bg-white text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-pink-100">
              <span className="text-xs font-bold text-pink-950 flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-[#F43676]" /> School GPS Location (Optional)
              </span>
              <button
                type="button"
                onClick={handleGetLiveLocation}
                disabled={gpsLoading}
                className="text-[11px] font-bold text-[#F43676] hover:text-pink-800 bg-white px-2.5 py-1 rounded-lg border border-pink-200 shadow-sm disabled:opacity-50"
              >
                {gpsLoading ? "Locating..." : "Use My Current GPS"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 font-semibold mb-1">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 16.7050"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg outline-none bg-white text-gray-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 font-semibold mb-1">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 74.2433"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg outline-none bg-white text-gray-900 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 border border-gray-300 font-bold text-xs text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-bold text-xs rounded-xl shadow-lg hover:from-[#e02a60] hover:to-[#c41e50] flex items-center justify-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin text-base" /> : "Submit Request to Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
