"use client";

import React, { useState, useEffect, useRef } from "react";
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
  FaSearch,
  FaLayerGroup,
} from "react-icons/fa";

import AddSchoolModal from "./AddSchoolModal";

const MAPPLS_ACCESS_TOKEN = "ekeihvwrzenomhffqxfvrokparwlzwkkmhjl";

// City default center coordinates [lat, lng]
const CITY_COORDINATES = {
  "Mumbai": [19.0760, 72.8777],
  "Pune": [18.5204, 73.8567],
  "Thane": [19.2183, 72.9781],
  "Nagpur": [21.1458, 79.0882],
  "Nashik": [19.9975, 73.7898],
  "Chhatrapati Sambhajinagar": [19.8762, 75.3433],
  "Solapur": [17.6599, 75.9064],
};

const MAHARASHTRA_CENTER = [19.7515, 75.7139]; // Default state center

export default function SchoolStallMapWidget({ petitionId, onOpenReportModal }) {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [approvedReports, setApprovedReports] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Load Mappls SDK and Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    // Load Leaflet CSS for map rendering
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const loadScripts = async () => {
      // 1. Load Mappls Web SDK (v3.0 as documented)
      if (!window.mappls && !document.getElementById("mappls-sdk-script")) {
        const mapplsScript = document.createElement("script");
        mapplsScript.id = "mappls-sdk-script";
        mapplsScript.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${MAPPLS_ACCESS_TOKEN}`;
        mapplsScript.async = true;
        document.head.appendChild(mapplsScript);
      }

      // 2. Load Leaflet JS fallback engine
      if (!window.L && !document.getElementById("leaflet-js-script")) {
        const leafletScript = document.createElement("script");
        leafletScript.id = "leaflet-js-script";
        leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        leafletScript.async = true;
        document.head.appendChild(leafletScript);
      }

      // Check for map engine availability
      let attempts = 0;
      const checkEngine = setInterval(() => {
        attempts++;
        if (window.mappls || window.L) {
          clearInterval(checkEngine);
          if (isMounted) setMapLoaded(true);
        } else if (attempts >= 25) {
          // Timeout fallback - force map loaded to prevent hanging
          clearInterval(checkEngine);
          if (isMounted) setMapLoaded(true);
        }
      }, 100);
    };

    loadScripts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Cities
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

  // Fetch Schools & Reports for selected city
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
          const rawSchools = sData.schools || [];
          const uniqueSchoolsMap = new Map();
          rawSchools.forEach((s) => {
            const key = `${s.name.toLowerCase().trim()}_${(s.city || "").toLowerCase().trim()}`;
            if (!uniqueSchoolsMap.has(key)) {
              uniqueSchoolsMap.set(key, s);
            }
          });
          setSchools(Array.from(uniqueSchoolsMap.values()));
        }
      } catch (err) {
        console.error("Error fetching stall map data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petitionId, selectedCity, backendUrl]);

  // Render & Update Interactive Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || typeof window === "undefined") return;

    // Target center coordinates
    let targetCenter = MAHARASHTRA_CENTER;
    let targetZoom = selectedCity ? 12 : 7;

    if (selectedCity && CITY_COORDINATES[selectedCity]) {
      targetCenter = CITY_COORDINATES[selectedCity];
    } else if (schools.length > 0) {
      const validCoords = schools
        .map((s) => s.location?.coordinates)
        .filter((c) => Array.isArray(c) && c.length === 2);

      if (validCoords.length > 0) {
        const avgLng = validCoords.reduce((acc, c) => acc + c[0], 0) / validCoords.length;
        const avgLat = validCoords.reduce((acc, c) => acc + c[1], 0) / validCoords.length;
        targetCenter = [avgLat, avgLng];
      }
    }

    try {
      // 1. Try Mappls SDK if available
      if (window.mappls && window.mappls.Map && !mapInstanceRef.current) {
        try {
          mapInstanceRef.current = new window.mappls.Map(mapRef.current, {
            center: { lat: targetCenter[0], lng: targetCenter[1] },
            zoom: targetZoom,
            zoomControl: true,
            hybrid: false,
          });
        } catch (e) {
          console.warn("Mappls initialization fallback to Leaflet:", e);
        }
      }

      // 2. Leaflet fallback if Mappls not initialized or on fallback
      if (!mapInstanceRef.current && window.L) {
        const container = mapRef.current;
        // Reset container if re-initializing Leaflet
        if (container._leaflet_id) {
          container._leaflet_id = null;
        }

        const lMap = window.L.map(container, {
          center: targetCenter,
          zoom: targetZoom,
          zoomControl: true,
        });

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© Mappls / OpenStreetMap contributors",
        }).addTo(lMap);

        mapInstanceRef.current = lMap;
      }

      if (!mapInstanceRef.current) return;

      const isLeafletMap = Boolean(mapInstanceRef.current.setView && mapInstanceRef.current.addLayer);

      // Pan/Fly map to target location
      if (isLeafletMap) {
        mapInstanceRef.current.setView(targetCenter, targetZoom, { animate: true });

        // Setup Leaflet Marker Layer Group
        if (!markersGroupRef.current) {
          markersGroupRef.current = window.L.layerGroup().addTo(mapInstanceRef.current);
        } else {
          markersGroupRef.current.clearLayers();
        }

        // Add custom markers & 50m Geofence circles for schools
        schools.forEach((school) => {
          if (!school.location?.coordinates) return;
          const lng = school.location.coordinates[0];
          const lat = school.location.coordinates[1];

          const schoolReports = approvedReports.filter(
            (r) => r.schoolId?._id === school._id || r.schoolId === school._id
          );
          const hasViolation = schoolReports.length > 0;

          // 1. Draw 50m Geofence Radius Circle around School
          const geofenceCircle = window.L.circle([lat, lng], {
            radius: 50, // Exact 50 Meters Geofence Radius!
            color: hasViolation ? "#F43676" : "#10b981",
            fillColor: hasViolation ? "#F43676" : "#10b981",
            fillOpacity: hasViolation ? 0.25 : 0.12,
            weight: hasViolation ? 2 : 1.5,
            dashArray: hasViolation ? "6, 6" : null,
          });
          geofenceCircle.bindTooltip(
            `50m Buffer Zone: ${school.name} (${hasViolation ? "🚨 Violation Detected" : "✓ Clear"})`,
            { sticky: true }
          );
          markersGroupRef.current.addLayer(geofenceCircle);

          // 2. Custom School Marker Icon
          const iconHtml = hasViolation
            ? `<div style="position:relative; width:38px; height:38px; background:#F43676; border:2px solid #ffffff; border-radius:50%; display:flex; align-items:center; justify-center; color:white; font-size:18px; box-shadow:0 0 18px rgba(244,54,118,0.9);">
                🏫
                <span style="position:absolute; top:-2px; right:-2px; width:12px; height:12px; background:#F43676; border-radius:50%; border:2px solid #ffffff; animation:ping 1.5s infinite;"></span>
               </div>`
            : `<div style="position:relative; width:32px; height:32px; background:#16a34a; border:2px solid #ffffff; border-radius:50%; display:flex; align-items:center; justify-center; color:white; font-size:14px; box-shadow:0 0 10px rgba(22,163,74,0.6);">
                🏫
               </div>`;

          const customIcon = window.L.divIcon({
            html: iconHtml,
            className: "custom-school-marker",
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });

          const popupContent = `
            <div style="padding:8px; font-family: system-ui, sans-serif; max-width:240px; color:#0f172a;">
              <h4 style="margin:0 0 4px 0; font-size:13px; font-weight:800; color:#0f172a;">${school.name}</h4>
              <p style="margin:0 0 6px 0; font-size:11px; color:#64748b;">${school.address || school.city}</p>
              <div style="margin-bottom:6px; font-size:10px; font-weight:700; color:#F43676; background:#fdf2f8; padding:3px 6px; border-radius:6px; display:inline-block;">
                🎯 Protected 50m Geofence Active
              </div>
              ${
                hasViolation
                  ? `<div style="background:#fdf2f8; border:1px solid #F43676; padding:6px 8px; border-radius:8px; font-size:11px; font-weight:700; color:#be123c;">
                      🚨 50m Violation! Stall: <strong>${schoolReports[0].shopName}</strong> (${schoolReports[0].distanceFromSchoolMeters}m away)
                     </div>`
                  : `<div style="background:#dcfce7; border:1px solid #22c55e; padding:6px 8px; border-radius:8px; font-size:11px; font-weight:700; color:#15803d;">
                      ✓ Clear (No Violation)
                     </div>`
              }
            </div>
          `;

          const marker = window.L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);

          if (hasViolation) {
            marker.on("click", () => {
              setSelectedReportModal(schoolReports[0]);
            });
          }

          markersGroupRef.current.addLayer(marker);

          // 3. Plot Reported Food Stall Markers & Connecting Geofence Lines inside 50m zone
          if (hasViolation) {
            schoolReports.forEach((report) => {
              if (!report.location?.coordinates) return;
              const stallLng = report.location.coordinates[0];
              const stallLat = report.location.coordinates[1];

              // Food Stall Pin Marker inside 50m Geofence
              const stallIconHtml = `<div style="position:relative; width:32px; height:32px; background:#e02a60; border:2px solid #ffffff; border-radius:50%; display:flex; align-items:center; justify-center; color:white; font-size:15px; box-shadow:0 0 14px rgba(224,42,96,0.9); cursor:pointer;">
                🏪
              </div>`;

              const stallIcon = window.L.divIcon({
                html: stallIconHtml,
                className: "custom-stall-marker",
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              });

              const stallPopupContent = `
                <div style="padding:8px; font-family: system-ui, sans-serif; max-width:220px; color:#0f172a;">
                  <span style="background:#be123c; color:white; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; text-transform:uppercase;">Illegal Stall inside 50m</span>
                  <h4 style="margin:4px 0 2px 0; font-size:13px; font-weight:800;">${report.shopName}</h4>
                  <p style="margin:0 0 6px 0; font-size:11px; color:#475569;">${report.distanceFromSchoolMeters}m from ${school.name}</p>
                </div>
              `;

              const stallMarker = window.L.marker([stallLat, stallLng], { icon: stallIcon }).bindPopup(stallPopupContent);
              stallMarker.on("click", () => {
                setSelectedReportModal(report);
              });
              markersGroupRef.current.addLayer(stallMarker);

              // Connector Line from School to Stall
              const line = window.L.polyline(
                [
                  [lat, lng],
                  [stallLat, stallLng],
                ],
                {
                  color: "#F43676",
                  weight: 2,
                  dashArray: "4, 6",
                  opacity: 0.8,
                }
              );
              markersGroupRef.current.addLayer(line);
            });
          }
        });
      } else if (mapInstanceRef.current.panTo) {
        // Mappls SDK native methods
        mapInstanceRef.current.panTo({ lat: targetCenter[0], lng: targetCenter[1] });
        if (mapInstanceRef.current.setZoom) mapInstanceRef.current.setZoom(targetZoom);
      }
    } catch (err) {
      console.warn("Map rendering exception:", err);
    }
  }, [mapLoaded, selectedCity, schools, approvedReports]);

  // Filter schools by search query
  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl text-gray-900 border border-pink-100/90 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#F43676] text-xs font-extrabold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F43676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F43676]"></span>
            </span>
            Live 50m School Buffer Zone Monitor (Mappls Maps SDK)
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <FaShieldAlt className="text-[#F43676]" /> Maharashtra School Violation Map
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Identify and remove illegal junk food stalls within 50 meters of school entrances using Mappls Live Location Engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddSchoolModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-pink-50 text-[#F43676] font-bold text-xs border border-pink-200 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <FaSchool className="text-sm text-[#F43676]" />
            <span>+ Request Missing City / School</span>
          </button>

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] hover:to-[#c41e50] text-white font-extrabold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 border border-pink-400/30"
            >
              <FaStore className="text-sm" />
              <span>Report Junk Food Stall</span>
            </button>
          )}
        </div>
      </div>

      {/* City Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-pink-50/50 p-3.5 rounded-2xl border border-pink-100/80">
        <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 shrink-0">
          <FaCity className="text-[#F43676]" /> State / City:
        </div>

        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          <button
            onClick={() => setSelectedCity("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCity === ""
                ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-md shadow-pink-500/20 font-extrabold"
                : "bg-white text-gray-700 hover:text-[#F43676] hover:bg-pink-50 border border-gray-200/80"
            }`}
          >
            All Maharashtra
          </button>

          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCity === city
                  ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-md shadow-pink-500/20 font-extrabold"
                  : "bg-white text-gray-700 hover:text-[#F43676] hover:bg-pink-50 border border-gray-200/80"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="relative shrink-0 w-full md:w-56 mt-2 md:mt-0">
          <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search school name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-gray-200/90 rounded-xl outline-none text-gray-900 font-medium focus:border-[#F43676] focus:ring-2 focus:ring-pink-100 transition-colors placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Mappls Interactive Canvas */}
      <div className="relative z-0 isolate rounded-2xl overflow-hidden border border-pink-200 shadow-md bg-pink-50/20 min-h-[350px]">
        {/* Map Header Status Tag */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-pink-200 text-[11px] font-extrabold text-gray-800 flex items-center gap-2 shadow-md">
          <FaLayerGroup className="text-[#F43676] text-xs" />
          <span>
            {selectedCity
              ? `Mappls View: ${selectedCity} (${filteredSchools.length} Schools)`
              : `Mappls View: Maharashtra State Level (${filteredSchools.length} Schools)`}
          </span>
        </div>

        {/* Map Element */}
        <div
          ref={mapRef}
          id="mappls-map-canvas"
          className="w-full h-80 md:h-[420px] bg-slate-100 rounded-2xl"
        />

        {/* Fallback Overlay if SDK load is pending or in progress */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-gray-700 p-4 text-center">
            <FaSpinner className="animate-spin text-3xl text-[#F43676] mb-2" />
            <p className="text-xs font-bold">Initializing Mappls Web Maps API & State Vector Tiles...</p>
          </div>
        )}
      </div>

      {/* Visual School Cards & Violation List */}
      {loading ? (
        <div className="py-10 text-center text-gray-400 space-y-2">
          <FaSpinner className="animate-spin text-2xl text-[#F43676] mx-auto" />
          <p className="text-xs font-semibold">Fetching schools and 50m radius violation data...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <FaSchool className="text-[#F43676]" />
            <span>Schools in {selectedCity || "Maharashtra"} ({filteredSchools.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchools.map((school) => {
              const schoolReports = approvedReports.filter(
                (r) => r.schoolId?._id === school._id || r.schoolId === school._id
              );
              const hasViolation = schoolReports.length > 0;

              return (
                <div
                  key={school._id}
                  className={`relative p-4.5 rounded-2xl border transition-all duration-300 ${
                    hasViolation
                      ? "bg-gradient-to-br from-pink-50/90 via-white to-pink-50/40 border-pink-300 shadow-md"
                      : "bg-white border-gray-200/80 hover:border-pink-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative mt-0.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            hasViolation
                              ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-sm shadow-pink-500/30"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          <FaSchool className="text-lg" />
                        </div>
                        {hasViolation && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F43676] opacity-90"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F43676] border-2 border-white"></span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm leading-snug">
                          {school.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 font-medium">
                          <FaMapMarkerAlt className="text-[#F43676] text-[10px]" />
                          {school.address || school.city}
                        </p>
                      </div>
                    </div>

                    {hasViolation ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white uppercase tracking-wider animate-pulse shadow-sm shadow-pink-500/20 shrink-0">
                        🚨 50m Violation!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <FaCheckCircle className="text-[10px]" /> Clear
                      </span>
                    )}
                  </div>

                  {hasViolation && (
                    <div className="mt-3 pt-3 border-t border-pink-200/60 space-y-2">
                      <p className="text-xs font-extrabold text-gray-900 flex items-center justify-between">
                        <span>Reported Stall: {schoolReports[0].shopName}</span>
                        <span className="text-[10px] font-extrabold bg-[#F43676] px-2 py-0.5 rounded-full text-white">
                          {schoolReports[0].distanceFromSchoolMeters}m Away
                        </span>
                      </p>
                      <button
                        onClick={() => setSelectedReportModal(schoolReports[0])}
                        className="w-full text-xs font-bold bg-pink-50 hover:bg-pink-100 text-[#F43676] py-2 rounded-xl border border-pink-200 transition-colors flex items-center justify-center gap-1.5"
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

      {/* Report Modal Popup for Evidence */}
      {selectedReportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border border-pink-100 rounded-3xl max-w-lg w-full p-6 text-gray-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🚨</span>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">
                    {selectedReportModal.shopName}
                  </h3>
                  <p className="text-xs font-bold text-[#F43676]">
                    50m School Buffer Zone Violation Verified
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-[#F43676] flex items-center justify-center transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-pink-50/60 p-3.5 rounded-2xl border border-pink-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-pink-900 uppercase font-bold">Target School</span>
                  <p className="font-bold text-gray-900 text-sm">{selectedReportModal.schoolId?.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-pink-900 uppercase font-bold">Measured Distance</span>
                  <p className="font-extrabold text-[#F43676] text-sm">{selectedReportModal.distanceFromSchoolMeters} Meters</p>
                </div>
              </div>

              {selectedReportModal.description && (
                <div>
                  <span className="text-gray-600 font-semibold">Report Description:</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-xl mt-1 italic border border-gray-200/80">
                    &quot;{selectedReportModal.description}&quot;
                  </p>
                </div>
              )}

              {selectedReportModal.images && selectedReportModal.images.length > 0 && (
                <div>
                  <span className="text-gray-600 font-semibold block mb-1">Evidence Photos:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedReportModal.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer">
                        <img src={img} alt="Evidence" className="w-24 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" />
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
                  className="w-full py-3 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] hover:to-[#c41e50] text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 border border-pink-400/30"
                >
                  <FaMapMarkerAlt className="text-sm" />
                  <span>View Stall Location on Google Maps</span>
                </a>
              )}
            </div>

            <button
              onClick={() => setSelectedReportModal(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
      {/* Add Missing City / School Modal for Signers */}
      {isAddSchoolModalOpen && (
        <AddSchoolModal
          isOpen={isAddSchoolModalOpen}
          onClose={() => setIsAddSchoolModalOpen(false)}
          existingCities={cities}
          onSuccess={() => {
            // Refresh cities list after submitting request
            fetch(`${backendUrl}/api/stall-reports/cities`)
              .then((res) => res.json())
              .then((data) => setCities(data.cities || []))
              .catch((err) => console.error(err));
          }}
        />
      )}
    </div>
  );
}

