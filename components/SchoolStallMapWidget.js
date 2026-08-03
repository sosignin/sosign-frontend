"use client";

import React, { useState, useEffect } from "react";
import {
  FaSchool,
  FaStore,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCity,
  FaMapMarkerAlt,
  FaSpinner,
  FaChevronRight,
  FaTimes,
  FaShieldAlt,
} from "react-icons/fa";

export default function SchoolStallMapWidget({ petitionId, onOpenReportModal }) {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [approvedReports, setApprovedReports] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportModal, setSelectedReportModal] = useState(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchCities = async () => {
      try {
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
      }
    };

    fetchCities();
  }, [backendUrl]);

  useEffect(() => {
    if (!petitionId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportsRes, schoolsRes] = await Promise.all([
          fetch(
            `${backendUrl}/api/stall-reports/approved/${petitionId}${
              selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : ""
            }`
          ),
          fetch(
            `${backendUrl}/api/stall-reports/schools${
              selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : ""
            }`
          ),
        ]);

        if (reportsRes.ok) {
          const rData = await reportsRes.json();
          setApprovedReports(rData.reports || []);
        }

        if (schoolsRes.ok) {
          const sData = await schoolsRes.json();
          setSchools(sData.schools || []);
        }
      } catch (err) {
        console.error("Error fetching stall map data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petitionId, selectedCity, backendUrl]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 rounded-3xl p-6 shadow-2xl text-white border border-red-500/30 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-bold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Live 50m School Buffer Zone Monitor
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <FaShieldAlt className="text-red-500" /> Maharashtra School Violation Map
          </h2>
          <p className="text-xs text-red-200/80 mt-0.5">
            Identify and remove illegal junk food stalls within 50 meters of school entrances.
          </p>
        </div>

        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 border border-red-400/30"
          >
            <FaStore className="text-sm" />
            <span>Report Junk Food Stall</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <FaCity className="text-red-400" /> Filter City:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCity === city
                  ? "bg-red-600 text-white shadow-md shadow-red-900/50"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Interactive Map / Status Section */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <FaSpinner className="animate-spin text-2xl text-red-500 mx-auto" />
          <p className="text-xs font-semibold">Loading schools and 50m radius violation data...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((school) => {
              // Check if school has approved report
              const schoolReports = approvedReports.filter(
                (r) =>
                  r.schoolId?._id === school._id ||
                  r.schoolId === school._id
              );
              const hasViolation = schoolReports.length > 0;

              return (
                <div
                  key={school._id}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 ${
                    hasViolation
                      ? "bg-gradient-to-br from-red-950/90 to-slate-900 border-red-500/60 shadow-lg shadow-red-950/50"
                      : "bg-slate-800/40 border-slate-700/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative mt-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            hasViolation
                              ? "bg-red-600 text-white"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          <FaSchool className="text-lg" />
                        </div>
                        {/* BLINKING RED LIGHT ALERT BEACON */}
                        {hasViolation && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-slate-900"></span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-white text-sm leading-snug">
                          {school.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-red-400 text-[10px]" />
                          {school.address || school.city}
                        </p>
                      </div>
                    </div>

                    {hasViolation ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500 text-white uppercase tracking-wider animate-pulse shadow-md shadow-red-900/50 shrink-0">
                        🚨 50m Violation!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-950/80 text-green-400 border border-green-500/30 shrink-0">
                        <FaCheckCircle className="text-[10px]" /> Clear
                      </span>
                    )}
                  </div>

                  {/* Violation Details preview if present */}
                  {hasViolation && (
                    <div className="mt-3 pt-3 border-t border-red-500/20 space-y-2">
                      <p className="text-xs font-bold text-red-200 flex items-center justify-between">
                        <span>Reported Stall: {schoolReports[0].shopName}</span>
                        <span className="text-[10px] font-extrabold bg-red-900 px-2 py-0.5 rounded text-white">
                          {schoolReports[0].distanceFromSchoolMeters}m Away
                        </span>
                      </p>
                      <button
                        onClick={() => setSelectedReportModal(schoolReports[0])}
                        className="w-full text-xs font-bold bg-red-900/40 hover:bg-red-900/80 text-red-200 py-1.5 rounded-xl border border-red-500/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <span>View Verified Photos & Evidence</span>
                        <FaChevronRight className="text-[10px]" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Modal Popup for Details */}
      {selectedReportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {selectedReportModal.shopName}
                  </h3>
                  <p className="text-xs text-red-300">
                    50m School Buffer Zone Violation Verified
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-red-950/60 p-3 rounded-2xl border border-red-500/30 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-red-300 uppercase font-bold">Target School</span>
                  <p className="font-bold text-white text-sm">{selectedReportModal.schoolId?.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-red-300 uppercase font-bold">Measured Distance</span>
                  <p className="font-extrabold text-red-400 text-sm">{selectedReportModal.distanceFromSchoolMeters} Meters</p>
                </div>
              </div>

              {selectedReportModal.description && (
                <div>
                  <span className="text-slate-400 font-semibold">Report Description:</span>
                  <p className="text-slate-200 bg-slate-800 p-2.5 rounded-xl mt-1 italic">
                    &quot;{selectedReportModal.description}&quot;
                  </p>
                </div>
              )}

              {selectedReportModal.images && selectedReportModal.images.length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Evidence Photos:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedReportModal.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer">
                        <img src={img} alt="Evidence" className="w-24 h-20 object-cover rounded-xl border border-slate-700" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedReportModal.location?.coordinates && (
                <a
                  href={`https://www.google.com/maps?q=${selectedReportModal.location.coordinates[1]},${selectedReportModal.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 border border-blue-400/30"
                >
                  <FaMapMarkerAlt className="text-sm" />
                  <span>View Stall Location on Google Maps</span>
                </a>
              )}
            </div>

            <button
              onClick={() => setSelectedReportModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
