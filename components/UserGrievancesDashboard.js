"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FaShieldAlt,
  FaStore,
  FaSchool,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt,
  FaTimes,
  FaChevronRight,
  FaSpinner,
  FaEye,
  FaInfoCircle,
  FaBullhorn,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function UserGrievancesDashboard({
  onOpenReportModal,
  onViewOnMap,
  embedded = false,
}) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, pending, approved, rejected, disputed
  const [searchQuery, setSearchQuery] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchReports = async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${backendUrl}/api/stall-reports/my-reports`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Failed to load your complaints.");
      }
    } catch (err) {
      setError("Network error loading complaints: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  // Compute counts
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === "pending").length;
    const approved = reports.filter((r) => r.status === "approved").length;
    const rejected = reports.filter((r) => r.status === "rejected").length;
    const disputed = reports.filter(
      (r) => r.defenses && r.defenses.length > 0
    ).length;

    return { total, pending, approved, rejected, disputed };
  }, [reports]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Tab filter
      if (activeTab === "pending" && r.status !== "pending") return false;
      if (activeTab === "approved" && r.status !== "approved") return false;
      if (activeTab === "rejected" && r.status !== "rejected") return false;
      if (activeTab === "disputed" && (!r.defenses || r.defenses.length === 0))
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const shop = (r.shopName || "").toLowerCase();
        const school = (r.schoolId?.name || "").toLowerCase();
        const city = (r.city || r.district || "").toLowerCase();
        const gid = (r.grievanceId || "").toLowerCase();
        const landmark = (r.landmark || "").toLowerCase();
        if (
          !shop.includes(q) &&
          !school.includes(q) &&
          !city.includes(q) &&
          !gid.includes(q) &&
          !landmark.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [reports, activeTab, searchQuery]);

  // Not logged in view
  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-pink-100/90 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-pink-50 text-[#F43676] flex items-center justify-center mx-auto text-2xl">
          <FaShieldAlt />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-lg font-bold text-gray-900">
            Sign in to View Your Filed Complaints
          </h3>
          <p className="text-xs text-gray-500">
            Track the status of junk food stall reports you have lodged, view
            geofence verification, and see enforcement notices.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white text-xs font-bold transition-all shadow-md shadow-pink-500/20"
          >
            <span>Sign In to Dashboard</span>
            <FaChevronRight className="text-[10px]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Banner (Pink & White Theme) */}
      <div className="bg-gradient-to-r from-[#d81b60] via-[#F43676] to-[#e02a60] text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider border border-white/30">
              <FaShieldAlt className="text-xs" /> Citizen Vigilance Portal
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              My Reported Food Stalls
            </h2>
            <p className="text-xs text-pink-50 max-w-xl font-normal">
              Live tracking for all illegal food stalls reported inside school
              50m buffer zones. View evidence status and authority actions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchReports}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <span>🔄</span>
              )}
              <span>Refresh</span>
            </button>

            {onOpenReportModal && (
              <button
                type="button"
                onClick={onOpenReportModal}
                className="px-4 py-2 rounded-xl bg-white text-[#d81b60] hover:bg-pink-50 text-xs font-extrabold transition-all shadow-md shadow-pink-900/20 flex items-center gap-1.5 cursor-pointer"
              >
                <FaStore className="text-xs text-[#d81b60]" />
                <span>+ Report Food Stall</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-pink-100/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500">
              Total Filed
            </span>
            <span className="w-6 h-6 rounded-lg bg-pink-50 text-[#F43676] flex items-center justify-center text-xs">
              <FaStore />
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {stats.total}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            Across all districts
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700">
              In Verification
            </span>
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
              <FaClock />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {stats.pending}
          </div>
          <span className="text-[10px] text-amber-600/80 font-medium">
            Awaiting FSO review
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700">
              Verified Violations
            </span>
            <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs">
              <FaExclamationTriangle />
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">
            {stats.approved}
          </div>
          <span className="text-[10px] text-rose-600/80 font-medium">
            Enforcement active
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-pink-200/80 bg-pink-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#d81b60]">
              Vendor Disputed
            </span>
            <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#F43676] flex items-center justify-center text-xs">
              <FaShieldAlt />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#d81b60] mt-1">
            {stats.disputed}
          </div>
          <span className="text-[10px] text-pink-600/80 font-medium">
            Dispute submitted
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-pink-100/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: `All (${stats.total})` },
            { id: "pending", label: `Under Review (${stats.pending})` },
            { id: "approved", label: `Verified (${stats.approved})` },
            { id: "disputed", label: `Disputed (${stats.disputed})` },
            { id: "rejected", label: `Rejected (${stats.rejected})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-xs"
                  : "bg-pink-50/60 text-gray-700 hover:bg-pink-100 hover:text-[#F43676]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F43676] text-xs" />
          <input
            type="text"
            placeholder="Search by stall or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-pink-50/20 border border-pink-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-[#F43676]"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-pink-100/90 space-y-2">
          <FaSpinner className="animate-spin text-2xl text-[#F43676] mx-auto" />
          <p className="text-xs font-bold text-gray-600">
            Loading your grievance records...
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-rose-500 shrink-0 text-base" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchReports}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-pink-100/90 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#F43676] flex items-center justify-center mx-auto text-xl">
            <FaStore />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">
              {searchQuery || activeTab !== "all"
                ? "No grievances match your filters"
                : "No Grievances Filed Yet"}
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || activeTab !== "all"
                ? "Try clearing your search query or selecting a different tab."
                : "Help protect school children by reporting illegal junk food and tobacco vendors operating within 50 meters of school gates."}
            </p>
          </div>
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white text-xs font-bold transition-all shadow-md shadow-pink-500/20 cursor-pointer"
            >
              + Report Your First Stall
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredReports.map((item) => {
            const isApproved = item.status === "approved";
            const isPending = item.status === "pending";
            const isRejected = item.status === "rejected";
            const hasDefenses = item.defenses && item.defenses.length > 0;
            const trackingId =
              item.grievanceId ||
              `GRV-${item._id.slice(-6).toUpperCase()}`;

            const schoolName = item.schoolId?.name || "Target School";
            const schoolCity =
              item.city ||
              item.district ||
              item.schoolId?.city ||
              "Maharashtra";
            const distance = item.distanceFromSchoolMeters ?? 0;
            const isInside50m = distance <= 50;

            const lat = item.location?.coordinates?.[1];
            const lng = item.location?.coordinates?.[0];

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-pink-100/90 p-4 sm:p-5 shadow-xs hover:border-pink-300 transition-all space-y-4"
              >
                {/* Top Row: Grievance ID, Date, and Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100/70 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#d81b60] bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200">
                      {trackingId}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Submitted on{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                        <FaClock className="text-[9px]" />
                        <span>Under Verification</span>
                      </span>
                    )}

                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        <FaExclamationTriangle className="text-[9px] text-rose-600" />
                        <span>Violation Verified • Notice Issued</span>
                      </span>
                    )}

                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-600 border border-gray-200">
                        <FaTimes className="text-[9px]" />
                        <span>Rejected / Closed</span>
                      </span>
                    )}

                    {hasDefenses && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-pink-50 text-[#F43676] border border-pink-200">
                        <FaShieldAlt className="text-[9px]" />
                        <span>Vendor Disputed</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Grid: Details & Proximity */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-2">
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                        <FaStore className="text-[#F43676] text-sm shrink-0" />
                        <span>{item.shopName}</span>
                      </h3>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1.5 flex-wrap">
                        <FaSchool className="text-gray-400 text-xs shrink-0" />
                        <span>Near {schoolName}</span>
                        <span className="text-gray-300">•</span>
                        <span>{schoolCity}</span>
                        {item.landmark && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500 font-normal">
                              Landmark: {item.landmark}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Proximity / Geofence Banner */}
                    <div
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between flex-wrap gap-2 ${
                        isInside50m
                          ? "bg-rose-50 border border-rose-200 text-rose-800"
                          : "bg-slate-50 border border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <FaMapMarkerAlt
                          className={
                            isInside50m ? "text-rose-600" : "text-slate-500"
                          }
                        />
                        <span>
                          {isInside50m
                            ? `Inside Prohibited 50m Zone (${distance}m from Gate)`
                            : `Distance: ${distance}m from School Entrance`}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isInside50m
                            ? "bg-rose-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isInside50m ? "COTPA Violation" : "Zone Review"}
                      </span>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 font-normal">
                        <strong className="text-slate-800 font-semibold">
                          Description:{" "}
                        </strong>
                        {item.description}
                      </div>
                    )}

                    {/* Rejection reason if rejected */}
                    {isRejected && item.rejectionReason && (
                      <div className="text-xs text-rose-700 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                        <strong>Review Note: </strong>
                        {item.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Evidence Photos & Actions */}
                  <div className="md:col-span-4 flex flex-col justify-between space-y-3">
                    {/* Photos Preview */}
                    {item.images && item.images.length > 0 ? (
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                          Evidence Photos ({item.images.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.images.map((imgUrl, idx) => {
                            const fullSrc = imgUrl.startsWith("http")
                              ? imgUrl
                              : `${backendUrl}/${imgUrl.replace(/^\//, "")}`;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedPhoto(fullSrc)}
                                className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 hover:border-[#F43676] transition-all relative group shrink-0 cursor-pointer"
                              >
                                <img
                                  src={fullSrc}
                                  alt="Evidence photo"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                                  <FaEye />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 bg-pink-50/20 p-2 rounded-xl text-center">
                        No photos attached
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {lat && lng && (
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                        >
                          <FaMapMarkerAlt className="text-gray-500" />
                          <span>Google Maps</span>
                        </a>
                      )}

                      {onViewOnMap && (
                        <button
                          type="button"
                          onClick={() => onViewOnMap(item)}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#F43676] font-bold text-[11px] transition-colors flex items-center justify-center gap-1 border border-pink-200 cursor-pointer"
                        >
                          <span>View on Map</span>
                          <FaChevronRight className="text-[9px]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Timeline Strip */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="space-y-0.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-[8px]">
                        ✓
                      </div>
                      <span className="font-bold text-slate-800 block">
                        Filed
                      </span>
                      <span className="text-slate-400 text-[9px] block">
                        Logged
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center mx-auto text-[8px] ${
                          isApproved || isRejected
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white animate-pulse"
                        }`}
                      >
                        {isApproved || isRejected ? "✓" : "2"}
                      </div>
                      <span className="font-bold text-slate-800 block">
                        Geofence
                      </span>
                      <span className="text-slate-400 text-[9px] block">
                        {isPending ? "Analyzing" : "Completed"}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center mx-auto text-[8px] ${
                          isApproved
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isApproved ? "✓" : "3"}
                      </div>
                      <span className="font-bold text-slate-800 block">
                        FSO Notice
                      </span>
                      <span className="text-slate-400 text-[9px] block">
                        {isApproved ? "Issued" : "Pending"}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center mx-auto text-[8px] ${
                          isApproved
                            ? "bg-rose-500 text-white animate-pulse"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        4
                      </div>
                      <span className="font-bold text-slate-800 block">
                        Enforcement
                      </span>
                      <span className="text-slate-400 text-[9px] block">
                        {isApproved ? "Active" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Enlarge Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full p-2 relative shadow-2xl"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <FaTimes />
            </button>
            <img
              src={selectedPhoto}
              alt="Evidence preview"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
