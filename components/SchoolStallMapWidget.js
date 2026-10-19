"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  FaBullhorn,
  FaInfoCircle,
  FaPlusCircle,
  FaCube,
  FaCamera,
  FaEye,
  FaCrosshairs,
  FaCompass,
} from "react-icons/fa";

import { useRouter } from "next/navigation";
import AddSchoolModal from "./AddSchoolModal";
import DefendStallModal from "./DefendStallModal";
import UserGrievancesDashboard from "./UserGrievancesDashboard";
import SubmitStallReportModal from "./SubmitStallReportModal";
import { useAuth } from "../context/AuthContext";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// All 36 Official Districts & Major Sub-Municipal Areas of Maharashtra with exact GPS Center
const MAHARASHTRA_DISTRICTS = [
  { name: "Mumbai City", lat: 18.9388, lng: 72.8353 },
  { name: "Mumbai Suburban", lat: 19.1136, lng: 72.8697 },
  { name: "Thane", lat: 19.2183, lng: 72.9781 },
  { name: "Palghar", lat: 19.6966, lng: 72.7699 },
  { name: "Vasai", lat: 19.3919, lng: 72.8397 },
  { name: "Vasai-Virar", lat: 19.3919, lng: 72.8397 },
  { name: "Navi Mumbai", lat: 19.0330, lng: 73.0297 },
  { name: "Raigad", lat: 18.5158, lng: 73.1822 },
  { name: "Ratnagiri", lat: 16.9902, lng: 73.3120 },
  { name: "Sindhudurg", lat: 16.1264, lng: 73.6841 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Satara", lat: 17.6805, lng: 74.0183 },
  { name: "Sangli", lat: 16.8524, lng: 74.5815 },
  { name: "Solapur", lat: 17.6599, lng: 75.9064 },
  { name: "Kolhapur", lat: 16.7050, lng: 74.2433 },
  { name: "Nashik", lat: 19.9975, lng: 73.7898 },
  { name: "Dhule", lat: 20.9042, lng: 74.7749 },
  { name: "Jalgaon", lat: 21.0077, lng: 75.5626 },
  { name: "Nandurbar", lat: 21.3723, lng: 74.2384 },
  { name: "Ahilyanagar", lat: 19.0948, lng: 74.7480 },
  { name: "Ahmednagar", lat: 19.0948, lng: 74.7480 },
  { name: "Chhatrapati Sambhajinagar", lat: 19.8762, lng: 75.3433 },
  { name: "Aurangabad", lat: 19.8762, lng: 75.3433 },
  { name: "Dharashiv", lat: 18.1861, lng: 76.0419 },
  { name: "Osmanabad", lat: 18.1861, lng: 76.0419 },
  { name: "Beed", lat: 18.9892, lng: 75.7601 },
  { name: "Jalna", lat: 19.8410, lng: 75.8864 },
  { name: "Latur", lat: 18.4088, lng: 76.5604 },
  { name: "Nanded", lat: 19.1383, lng: 77.3210 },
  { name: "Parbhani", lat: 19.2608, lng: 76.7739 },
  { name: "Hingoli", lat: 19.7183, lng: 77.1477 },
  { name: "Buldhana", lat: 20.5293, lng: 76.1843 },
  { name: "Akola", lat: 20.7002, lng: 77.0082 },
  { name: "Washim", lat: 20.1110, lng: 77.1337 },
  { name: "Amravati", lat: 20.9374, lng: 77.7796 },
  { name: "Yavatmal", lat: 20.3888, lng: 78.1204 },
  { name: "Wardha", lat: 20.7453, lng: 78.6022 },
  { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
  { name: "Bhandara", lat: 21.1685, lng: 79.6558 },
  { name: "Gondia", lat: 21.4600, lng: 80.1965 },
  { name: "Chandrapur", lat: 19.9615, lng: 79.2961 },
  { name: "Gadchiroli", lat: 20.1849, lng: 79.9948 },
];

const MAHARASHTRA_CENTER = [19.7515, 75.7139]; // Default state center

const getCityCenter = (city) => {
  if (!city) return MAHARASHTRA_CENTER;
  const normalized = city.toLowerCase().trim();
  const found = MAHARASHTRA_DISTRICTS.find(
    (d) => d.name.toLowerCase().trim() === normalized
  );
  return found ? [found.lat, found.lng] : MAHARASHTRA_CENTER;
};

const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

export default function SchoolStallMapWidget({
  petitionId,
  petitionTitle,
  onOpenReportModal,
  hasSigned = true,
  isCreator = false,
  onScrollToSign,
}) {
  const canReport = hasSigned || isCreator;
  const [displayPetitionTitle, setDisplayPetitionTitle] = useState(petitionTitle || "");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [approvedReports, setApprovedReports] = useState([]);
  const [resolvedReports, setResolvedReports] = useState([]);
  const [showResolvedOnMap, setShowResolvedOnMap] = useState(true);
  
  // School states (DB schools + Google Places auto-populated schools)
  const [allDbSchools, setAllDbSchools] = useState([]);
  const [dbSchools, setDbSchools] = useState([]);
  const [googlePlacesSchools, setGooglePlacesSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { user } = useAuth();
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const [activeReportImageIndex, setActiveReportImageIndex] = useState(0);
  const [defendModalReport, setDefendModalReport] = useState(null);
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'violated', 'clear'
  const [addSchoolPrefill, setAddSchoolPrefill] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);

  // Map View Mode States (Street, Satellite, 3D, 360° Street View)
  const [mapStyle, setMapStyle] = useState("street"); // 'street' or 'satellite'
  const [is3DView, setIs3DView] = useState(false);
  const [isStreetViewActive, setIsStreetViewActive] = useState(false);
  const [streetViewPos, setStreetViewPos] = useState(null);
  const [streetViewPov, setStreetViewPov] = useState({ heading: 165, pitch: 0 });
  const [streetViewPin, setStreetViewPin] = useState(null);
  const [internalReportPrefill, setInternalReportPrefill] = useState(null);

  // Civic Portal Experience States (Inspired by Reference Images)
  const [activeMainTab, setActiveMainTab] = useState("map"); // 'map' | 'complaints'
  const [isInternalReportModalOpen, setIsInternalReportModalOpen] = useState(false);

  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const googleCirclesRef = useRef([]);
  const googleLinesRef = useRef([]);
  const searchedMarkerRef = useRef(null);
  const activeInfoWindowRef = useRef(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Reset active report image index when selectedReportModal changes
  useEffect(() => {
    setActiveReportImageIndex(0);
  }, [selectedReportModal]);

  // Combine DB schools & Google Places schools (deduplicating by normalized name + city)
  const schools = useMemo(() => {
    const mapByName = new Map();
    const sourceDbSchools = allDbSchools.length > 0 ? allDbSchools : dbSchools;

    // 1. Add DB schools first (retains violation linking)
    sourceDbSchools.forEach((s) => {
      const key = `${s.name.toLowerCase().trim()}_${(s.city || "").toLowerCase().trim()}`;
      mapByName.set(key, s);
    });

    // 2. Add Google Places schools for missing schools
    googlePlacesSchools.forEach((s) => {
      const key = `${s.name.toLowerCase().trim()}_${(s.city || "").toLowerCase().trim()}`;
      if (!mapByName.has(key)) {
        mapByName.set(key, s);
      }
    });

    const all = Array.from(mapByName.values());
    if (!selectedCity) return all;

    const normCity = selectedCity.toLowerCase().trim();
    return all.filter((s) => {
      const c = (s.city || "").toLowerCase().trim();
      const a = (s.address || "").toLowerCase().trim();
      return c.includes(normCity) || normCity.includes(c) || a.includes(normCity);
    });
  }, [allDbSchools, dbSchools, googlePlacesSchools, selectedCity]);

  // Fetch petition title if not passed directly
  useEffect(() => {
    if (petitionTitle) {
      setDisplayPetitionTitle(petitionTitle);
    } else if (petitionId) {
      const fetchPetition = async () => {
        try {
          const res = await fetch(`${backendUrl}/api/petitions/${petitionId}`);
          const data = await res.json();
          if (data.success && data.petition) {
            setDisplayPetitionTitle(data.petition.title);
          }
        } catch (e) {
          console.error("Error fetching petition title:", e);
        }
      };
      fetchPetition();
    }
  }, [petitionId, petitionTitle, backendUrl]);

  // Load Google Maps JavaScript API with Places & Geometry libraries
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        if (isMounted) setMapLoaded(true);
        return;
      }

      if (document.getElementById("google-maps-sdk")) {
        const checkExisting = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkExisting);
            if (isMounted) setMapLoaded(true);
          }
        }, 100);
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-sdk";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) setMapLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps JS API script");
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Google Places Schools dynamically for selected District / City
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || typeof window === "undefined" || !window.google || !window.google.maps || !window.google.maps.places) return;

    // When viewing "All Maharashtra", use the full statewide database catalog + accumulated places
    if (!selectedCity) return;

    const map = mapInstanceRef.current;
    const service = new window.google.maps.places.PlacesService(map);

    const center = getCityCenter(selectedCity);
    const searchLocation = new window.google.maps.LatLng(center[0], center[1]);
    const queryStr = `schools in ${selectedCity}, Maharashtra`;

    const request = {
      query: queryStr,
      location: searchLocation,
      radius: 15000,
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const gSchools = results.map((place) => {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          return {
            _id: place.place_id,
            name: place.name,
            address: place.formatted_address || place.vicinity || selectedCity || "Maharashtra",
            city: selectedCity,
            location: {
              coordinates: [lng, lat],
            },
            isGooglePlace: true,
          };
        });

        // Accumulate discovered Google Places schools across districts
        setGooglePlacesSchools((prev) => {
          const map = new Map();
          prev.forEach((s) => map.set(`${s.name.toLowerCase().trim()}_${(s.city || "").toLowerCase().trim()}`, s));
          gSchools.forEach((s) => {
            const key = `${s.name.toLowerCase().trim()}_${(s.city || "").toLowerCase().trim()}`;
            if (!map.has(key)) {
              map.set(key, s);
            }
          });
          return Array.from(map.values());
        });
      }
    });
  }, [mapLoaded, selectedCity]);

  // Initialize Native Google Maps Places Autocomplete for Search Input
  useEffect(() => {
    if (!mapLoaded || !window.google || !window.google.maps || !window.google.maps.places || !searchInputRef.current) return;

    if (!autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: "in" },
        fields: ["geometry", "name", "formatted_address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const title = place.name || place.formatted_address.split(",")[0];
        const subtitle = place.formatted_address || "Maharashtra, India";

        const locObj = {
          title,
          subtitle,
          lat,
          lng,
          city: selectedCity || "",
        };
        setSearchedLocation(locObj);
        setSearchQuery(title);

        // Check if place matches any existing loaded school
        const matchedSchool = schools.find(
          (s) =>
            s.name.toLowerCase().includes(title.toLowerCase()) ||
            (s.address && s.address.toLowerCase().includes(title.toLowerCase()))
        );

        if (matchedSchool) {
          zoomToSchool(matchedSchool);
        } else if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          map.panTo({ lat, lng });
          map.setZoom(17);

          if (searchedMarkerRef.current) {
            searchedMarkerRef.current.setMap(null);
          }

          const searchIconSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
              <circle cx="19" cy="19" r="17" fill="#F43676" stroke="#ffffff" stroke-width="3"/>
              <text x="19" y="24" font-size="18" text-anchor="middle">📍</text>
            </svg>`;

          const searchMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: title,
            icon: {
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(searchIconSvg),
              scaledSize: new window.google.maps.Size(38, 38),
              anchor: new window.google.maps.Point(19, 19),
            },
          });

          const infoWin = new window.google.maps.InfoWindow({
            content: `<div style="padding:8px; font-family:system-ui, sans-serif; font-size:12px; font-weight:700;"><b style="color:#F43676;">📍 ${title}</b><br/><span style="font-size:11px; color:#475569;">${subtitle}</span></div>`,
          });

          infoWin.open(map, searchMarker);
          if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
          activeInfoWindowRef.current = infoWin;
          searchedMarkerRef.current = searchMarker;
        }
      });

      autocompleteRef.current = autocomplete;
    }
  }, [mapLoaded, selectedCity, schools]);

  // Auto zoom-in map to 50m radius view of selected school
  const zoomToSchool = (school) => {
    if (!school || !school.location?.coordinates) return;
    const lng = school.location.coordinates[0];
    const lat = school.location.coordinates[1];
    if (mapInstanceRef.current && window.google && window.google.maps) {
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(18);
    }
  };

  // Toggle Road Map vs Satellite View
  const toggleMapStyle = (style) => {
    setMapStyle(style);
    if (mapInstanceRef.current && window.google && window.google.maps) {
      mapInstanceRef.current.setMapTypeId(
        style === "satellite"
          ? window.google.maps.MapTypeId.HYBRID
          : window.google.maps.MapTypeId.ROADMAP
      );
    }
  };

  // Toggle 3D View (Perspective Tilt & Rotation)
  const toggle3DView = () => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) return;
    const next3DState = !is3DView;
    setIs3DView(next3DState);
    if (next3DState) {
      mapInstanceRef.current.setTilt(45);
      mapInstanceRef.current.setHeading(20);
    } else {
      mapInstanceRef.current.setTilt(0);
      mapInstanceRef.current.setHeading(0);
    }
  };

  // Toggle 360° Google Street View Panorama
  const toggleStreetView = () => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) return;
    const streetView = mapInstanceRef.current.getStreetView();
    const nextState = !isStreetViewActive;
    setIsStreetViewActive(nextState);
    if (nextState) {
      streetView.setPosition(mapInstanceRef.current.getCenter());
      streetView.setPov({ heading: 165, pitch: 0 });
      streetView.setOptions({ disableDoubleClickZoom: true });
      streetView.setVisible(true);
      const center = mapInstanceRef.current.getCenter();
      if (center) {
        setStreetViewPos({ lat: center.lat(), lng: center.lng() });
      }
      setStreetViewPov({ heading: 165, pitch: 0 });
    } else {
      streetView.setVisible(false);
      setStreetViewPin(null);
    }
  };

  // Fetch Cities & Merge with All 36 Maharashtra Districts
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/stall-reports/cities`);
        let dbCities = [];
        if (res.ok) {
          const data = await res.json();
          dbCities = data.cities || [];
        }

        const districtNames = MAHARASHTRA_DISTRICTS.map((d) => d.name);
        const combinedSet = new Set([...dbCities, ...districtNames]);
        const sortedCities = Array.from(combinedSet);

        setCities(sortedCities);
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCities(MAHARASHTRA_DISTRICTS.map((d) => d.name));
      }
    };

    fetchCities();
  }, [backendUrl]);

  // Fetch DB Schools & Reports for selected city
  useEffect(() => {
    if (!petitionId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportsRes, resolvedRes, schoolsRes] = await Promise.all([
          fetch(
            `${backendUrl}/api/stall-reports/approved/${petitionId}${
              selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : ""
            }`
          ),
          fetch(
            `${backendUrl}/api/stall-reports/resolved/${petitionId}${
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

        if (resolvedRes.ok) {
          const resData = await resolvedRes.json();
          setResolvedReports(resData.reports || []);
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
          const list = Array.from(uniqueSchoolsMap.values());
          if (!selectedCity) {
            setAllDbSchools(list);
          }
          setDbSchools(list);
        }
      } catch (err) {
        console.error("Error fetching stall map data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petitionId, selectedCity, backendUrl]);

  // Render & Update Google Map Canvas & 50m Geofence Circles
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || typeof window === "undefined" || !window.google || !window.google.maps) return;

    let targetCenter = getCityCenter(selectedCity);
    let targetZoom = selectedCity ? 13 : 7;

    if (schools.length > 0 && !selectedCity) {
      const validCoords = schools
        .map((s) => s.location?.coordinates)
        .filter((c) => Array.isArray(c) && c.length === 2);

      if (validCoords.length > 0) {
        const avgLng = validCoords.reduce((acc, c) => acc + c[0], 0) / validCoords.length;
        const avgLat = validCoords.reduce((acc, c) => acc + c[1], 0) / validCoords.length;
        targetCenter = [avgLat, avgLng];
      }
    }

    const centerObj = { lat: targetCenter[0], lng: targetCenter[1] };

    try {
      // 1. Initialize Google Map Instance with Street View, 3D & Rotation Controls Enabled
      const isMapDivValid =
        mapInstanceRef.current &&
        mapRef.current &&
        mapInstanceRef.current.getDiv() === mapRef.current;

      if (!isMapDivValid) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: centerObj,
          zoom: targetZoom,
          mapTypeId: mapStyle === "satellite" ? window.google.maps.MapTypeId.HYBRID : window.google.maps.MapTypeId.ROADMAP,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true, // Native 360° Street View Pegman control
          rotateControl: true,     // Native 3D Rotation control
          fullscreenControl: true,
          tilt: is3DView ? 45 : 0,
        });

        // Listen for native Street View visibility and movement changes
        const sv = mapInstanceRef.current.getStreetView();
        sv.setOptions({ disableDoubleClickZoom: true });
        sv.addListener("visible_changed", () => {
          const visible = sv.getVisible();
          setIsStreetViewActive(visible);
          if (visible) {
            sv.setOptions({ disableDoubleClickZoom: true });
            const pos = sv.getPosition();
            if (pos) setStreetViewPos({ lat: pos.lat(), lng: pos.lng() });
            const pov = sv.getPov();
            if (pov) setStreetViewPov({ heading: pov.heading, pitch: pov.pitch });
          } else {
            setStreetViewPin(null);
          }
        });
        sv.addListener("position_changed", () => {
          const pos = sv.getPosition();
          if (pos) setStreetViewPos({ lat: pos.lat(), lng: pos.lng() });
        });
        sv.addListener("pov_changed", () => {
          const pov = sv.getPov();
          if (pov) setStreetViewPov({ heading: pov.heading, pitch: pov.pitch });
        });
      } else {
        mapInstanceRef.current.panTo(centerObj);
        mapInstanceRef.current.setZoom(targetZoom);
        window.google.maps.event.trigger(mapInstanceRef.current, "resize");
      }

      const map = mapInstanceRef.current;

      // Clear existing Google Maps Markers, Circles & Polylines
      if (googleMarkersRef.current) {
        googleMarkersRef.current.forEach((m) => m.setMap(null));
      }
      googleMarkersRef.current = [];

      if (googleCirclesRef.current) {
        googleCirclesRef.current.forEach((c) => c.setMap(null));
      }
      googleCirclesRef.current = [];

      if (googleLinesRef.current) {
        googleLinesRef.current.forEach((l) => l.setMap(null));
      }
      googleLinesRef.current = [];

      const plottedResolvedReportIds = new Set();

      // Plot All Schools (DB + Google Maps) with 50m Radius Geofences
      schools.forEach((school) => {
        if (!school.location?.coordinates) return;
        const lng = school.location.coordinates[0];
        const lat = school.location.coordinates[1];

        const schoolReports = approvedReports.filter(
          (r) =>
            (r.schoolId?._id && String(r.schoolId._id) === String(school._id)) ||
            (r.schoolId && String(r.schoolId) === String(school._id)) ||
            (r.schoolId?.name && school.name && r.schoolId.name.trim().toLowerCase() === school.name.trim().toLowerCase())
        );
        const hasViolation = schoolReports.length > 0;

        const schoolResolvedReports = resolvedReports.filter(
          (r) =>
            (r.schoolId?._id && String(r.schoolId._id) === String(school._id)) ||
            (r.schoolId && String(r.schoolId) === String(school._id)) ||
            (r.schoolId?.name && school.name && r.schoolId.name.trim().toLowerCase() === school.name.trim().toLowerCase())
        );
        const hasResolved = schoolResolvedReports.length > 0;
        const isRestoredSafe = !hasViolation && hasResolved;

        // 1. 50m Radius Geofence Circle around School
        const circleStroke = hasViolation ? "#F43676" : isRestoredSafe ? "#059669" : "#10b981";
        const circleFill = hasViolation ? "#F43676" : isRestoredSafe ? "#10b981" : "#10b981";
        const circleOpacity = hasViolation ? 0.25 : isRestoredSafe ? 0.22 : 0.12;

        const circle = new window.google.maps.Circle({
          strokeColor: circleStroke,
          strokeOpacity: 0.9,
          strokeWeight: hasViolation ? 2.5 : isRestoredSafe ? 2.5 : 1.5,
          fillColor: circleFill,
          fillOpacity: circleOpacity,
          map: map,
          center: { lat, lng },
          radius: 50, // Exact 50 Meters Radius!
        });
        googleCirclesRef.current.push(circle);

        // 2. Custom SVG School Marker Pin
        const schoolPinColor = hasViolation ? "#F43676" : isRestoredSafe ? "#059669" : "#3B82F6";
        const schoolIconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
            <circle cx="19" cy="19" r="17" fill="${schoolPinColor}" stroke="#ffffff" stroke-width="3"/>
            <text x="19" y="24" font-size="18" text-anchor="middle">🏫</text>
          </svg>`;

        const schoolMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: school.name,
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(schoolIconSvg),
            scaledSize: new window.google.maps.Size(38, 38),
            anchor: new window.google.maps.Point(19, 19),
          },
        });

        let badgeText = "🛡️ Clean School Zone";
        let badgeBg = "#d1fae5";
        let badgeColor = "#065f46";
        if (hasViolation) {
          badgeText = "🚨 50m Violation Detected";
          badgeBg = "#ffe4e6";
          badgeColor = "#be123c";
        } else if (isRestoredSafe) {
          badgeText = `🛡️ School Zone Restored Safe (${schoolResolvedReports.length} ${schoolResolvedReports.length === 1 ? "Stall" : "Stalls"} Removed)`;
          badgeBg = "#ecfdf5";
          badgeColor = "#065f46";
        }

        const historySnippet = isRestoredSafe
          ? `<div style="font-size:10px; color:#334155; border-top:1px dashed #cbd5e1; padding-top:6px; margin-top:6px;">
               <strong style="color:#0f172a; display:block; margin-bottom:3px;">📜 Stalls Removed History:</strong>
               ${schoolResolvedReports.map(r => `<div style="margin-bottom:2px;">&bull; <s style="color:#dc2626;">${r.shopName}</s> <span style="color:#059669; font-weight:700;">(${r.distanceFromSchoolMeters}m &bull; ${r.resolutionNote || 'Removed'})</span></div>`).join('')}
             </div>`
          : '';

        const popupContent = `
          <div style="padding:10px; font-family: system-ui, sans-serif; max-width:270px; color:#0f172a;">
            <span style="background:${badgeBg}; color:${badgeColor}; font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px; text-transform:uppercase; display:inline-block; margin-bottom:6px;">
              ${badgeText}
            </span>
            <h3 style="margin:0 0 4px 0; font-size:14px; font-weight:800; color:#0f172a; line-height:1.3;">${school.name}</h3>
            <p style="margin:0 0 6px 0; font-size:11px; color:#64748b;">${school.address || school.city}</p>
            <div style="font-size:11px; font-weight:700; color:${isRestoredSafe ? '#059669' : hasViolation ? '#F43676' : '#2563eb'}; background:${isRestoredSafe ? '#ecfdf5' : hasViolation ? '#fff1f2' : '#eff6ff'}; padding:6px; border-radius:8px; border:1px solid ${isRestoredSafe ? '#a7f3d0' : hasViolation ? '#fecdd3' : '#bfdbfe'};">
              ${isRestoredSafe ? '✅ Safe School Zone: Stalls Removed & Buffer Cleared' : 'Strict 50m Buffer Zone Active'}
            </div>
            ${historySnippet}
            ${isRestoredSafe && schoolResolvedReports[0] ? `
              <div style="margin-top:6px;">
                <button id="view-school-res-btn-${school._id}" style="width:100%; padding:5px 8px; background:#059669; color:white; border:none; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer;">
                  🛡️ View Removal Photos &amp; Audit Details &rarr;
                </button>
              </div>
            ` : ''}
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: popupContent,
        });

        schoolMarker.addListener("click", () => {
          if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
          infoWindow.open(map, schoolMarker);
          activeInfoWindowRef.current = infoWindow;
          zoomToSchool(school);
          if (hasViolation) {
            setSelectedReportModal(schoolReports[0]);
          } else if (isRestoredSafe && schoolResolvedReports[0]) {
            setTimeout(() => {
              const sBtn = document.getElementById(`view-school-res-btn-${school._id}`);
              if (sBtn) {
                sBtn.onclick = () => setSelectedReportModal({ ...schoolResolvedReports[0], isResolvedModal: true });
              }
            }, 100);
          }
        });

        googleMarkersRef.current.push(schoolMarker);

        // 3. Plot Reported Food Stall Markers
        if (hasViolation) {
          schoolReports.forEach((report) => {
            if (!report.location?.coordinates) return;
            const stallLng = report.location.coordinates[0];
            const stallLat = report.location.coordinates[1];

            const stallIconSvg = `
              <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
                <circle cx="17" cy="17" r="15" fill="#e02a60" stroke="#ffffff" stroke-width="3"/>
                <text x="17" y="22" font-size="16" text-anchor="middle">🏪</text>
              </svg>`;

            const stallMarker = new window.google.maps.Marker({
              position: { lat: stallLat, lng: stallLng },
              map: map,
              title: report.shopName,
              icon: {
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(stallIconSvg),
                scaledSize: new window.google.maps.Size(34, 34),
                anchor: new window.google.maps.Point(17, 17),
              },
            });

            const stallPopupContent = `
              <div style="padding:8px; font-family: system-ui, sans-serif; max-width:220px; color:#0f172a;">
                <span style="background:#be123c; color:white; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; text-transform:uppercase;">Illegal Stall inside 50m</span>
                <h4 style="margin:4px 0 2px 0; font-size:13px; font-weight:800;">${report.shopName}</h4>
                <p style="margin:0 0 6px 0; font-size:11px; color:#475569;">${report.distanceFromSchoolMeters}m from ${school.name}</p>
              </div>
            `;

            const stallInfoWindow = new window.google.maps.InfoWindow({
              content: stallPopupContent,
            });

            stallMarker.addListener("click", () => {
              if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
              stallInfoWindow.open(map, stallMarker);
              activeInfoWindowRef.current = stallInfoWindow;
              setSelectedReportModal(report);
            });

            googleMarkersRef.current.push(stallMarker);

            // Connector Line from School to Stall
            const line = new window.google.maps.Polyline({
              path: [
                { lat, lng },
                { lat: stallLat, lng: stallLng },
              ],
              geodesic: true,
              strokeColor: "#F43676",
              strokeOpacity: 0.8,
              strokeWeight: 2.5,
              map: map,
            });
            googleLinesRef.current.push(line);
          });
        }

        // 4. Plot Confirmed Removed Stall Markers directly on the map
        if (showResolvedOnMap && hasResolved) {
          schoolResolvedReports.forEach((report) => {
            if (!report.location?.coordinates) return;
            plottedResolvedReportIds.add(String(report._id));
            const resLng = report.location.coordinates[0];
            const resLat = report.location.coordinates[1];

            const resStallIconSvg = `
              <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
                <circle cx="17" cy="17" r="15" fill="#059669" stroke="#ffffff" stroke-width="3"/>
                <text x="17" y="22" font-size="16" text-anchor="middle">✅</text>
              </svg>`;

            const resStallMarker = new window.google.maps.Marker({
              position: { lat: resLat, lng: resLng },
              map: map,
              title: `Removed Stall: ${report.shopName}`,
              icon: {
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(resStallIconSvg),
                scaledSize: new window.google.maps.Size(34, 34),
                anchor: new window.google.maps.Point(17, 17),
              },
            });

            const resStallPopup = `
              <div style="padding:10px; font-family: system-ui, sans-serif; max-width:260px; color:#0f172a;">
                <span style="background:#059669; color:white; font-size:9px; font-weight:800; padding:2px 8px; border-radius:999px; text-transform:uppercase; display:inline-block; margin-bottom:4px;">
                  ✅ Stall Removed &bull; Zone Safe
                </span>
                <h4 style="margin:2px 0 2px 0; font-size:13px; font-weight:800; text-decoration:line-through; color:#475569;">
                  ${report.shopName}
                </h4>
                <p style="margin:0 0 4px 0; font-size:11px; color:#065f46; font-weight:700;">
                  Removed from 50m gate of ${school.name} (${report.distanceFromSchoolMeters}m away)
                </p>
                <div style="font-size:10px; color:#334155; background:#f0fdf4; padding:6px 8px; border-radius:8px; border:1px solid #bbf7d0; margin-bottom:6px;">
                  <strong>Action Resolution:</strong> ${report.resolutionNote || 'Stall removed/permanently closed.'}
                </div>
                ${report.images && report.images.length > 0 ? `
                  <button id="view-res-btn-${report._id}" style="width:100%; padding:6px; background:#059669; color:white; border:none; border-radius:8px; font-size:10px; font-weight:800; cursor:pointer;">
                    📸 View Removal Evidence (${report.images.length} photos)
                  </button>
                ` : ''}
              </div>
            `;

            const resStallInfoWindow = new window.google.maps.InfoWindow({
              content: resStallPopup,
            });

            resStallMarker.addListener("click", () => {
              if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
              resStallInfoWindow.open(map, resStallMarker);
              activeInfoWindowRef.current = resStallInfoWindow;
              setTimeout(() => {
                const btn = document.getElementById(`view-res-btn-${report._id}`);
                if (btn) {
                  btn.onclick = () => setSelectedReportModal({ ...report, isResolvedModal: true });
                }
              }, 100);
            });

            googleMarkersRef.current.push(resStallMarker);

            // Dashed connector line for removed stall
            const line = new window.google.maps.Polyline({
              path: [
                { lat, lng },
                { lat: resLat, lng: resLng },
              ],
              geodesic: true,
              strokeColor: "#059669",
              strokeOpacity: 0.8,
              strokeWeight: 2.5,
              strokePattern: [10, 5],
              map: map,
            });
            googleLinesRef.current.push(line);
          });
        }
      });

      // 5. Also plot any remaining resolved stalls not directly mapped in schools loop
      if (showResolvedOnMap) {
        resolvedReports.forEach((report) => {
          if (plottedResolvedReportIds.has(String(report._id))) return;
          if (!report.location?.coordinates) return;
          const resLng = report.location.coordinates[0];
          const resLat = report.location.coordinates[1];

          const resStallIconSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="15" fill="#059669" stroke="#ffffff" stroke-width="3"/>
              <text x="17" y="22" font-size="16" text-anchor="middle">✅</text>
            </svg>`;

          const resStallMarker = new window.google.maps.Marker({
            position: { lat: resLat, lng: resLng },
            map: map,
            title: `Removed Stall: ${report.shopName}`,
            icon: {
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(resStallIconSvg),
              scaledSize: new window.google.maps.Size(34, 34),
              anchor: new window.google.maps.Point(17, 17),
            },
          });

          const schoolName = report.schoolId?.name || "Nearby School";
          const resStallPopup = `
            <div style="padding:10px; font-family: system-ui, sans-serif; max-width:260px; color:#0f172a;">
              <span style="background:#059669; color:white; font-size:9px; font-weight:800; padding:2px 8px; border-radius:999px; text-transform:uppercase; display:inline-block; margin-bottom:4px;">
                ✅ Stall Removed &bull; Zone Safe
              </span>
              <h4 style="margin:2px 0 2px 0; font-size:13px; font-weight:800; text-decoration:line-through; color:#475569;">
                ${report.shopName}
              </h4>
              <p style="margin:0 0 4px 0; font-size:11px; color:#065f46; font-weight:700;">
                Removed near ${schoolName} (${report.distanceFromSchoolMeters}m away)
              </p>
              <div style="font-size:10px; color:#334155; background:#f0fdf4; padding:6px 8px; border-radius:8px; border:1px solid #bbf7d0; margin-bottom:6px;">
                <strong>Action Resolution:</strong> ${report.resolutionNote || 'Stall removed/permanently closed.'}
              </div>
              ${report.images && report.images.length > 0 ? `
                <button id="view-res-btn-${report._id}" style="width:100%; padding:6px; background:#059669; color:white; border:none; border-radius:8px; font-size:10px; font-weight:800; cursor:pointer;">
                  📸 View Removal Evidence (${report.images.length} photos)
                </button>
              ` : ''}
            </div>
          `;

          const resStallInfoWindow = new window.google.maps.InfoWindow({
            content: resStallPopup,
          });

          resStallMarker.addListener("click", () => {
            if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
            resStallInfoWindow.open(map, resStallMarker);
            activeInfoWindowRef.current = resStallInfoWindow;
            setTimeout(() => {
              const btn = document.getElementById(`view-res-btn-${report._id}`);
              if (btn) {
                btn.onclick = () => setSelectedReportModal({ ...report, isResolvedModal: true });
              }
            }, 100);
          });

          googleMarkersRef.current.push(resStallMarker);
        });
      }
    } catch (err) {
      console.warn("Google Maps rendering exception:", err);
    }
  }, [mapLoaded, selectedCity, schools, approvedReports, resolvedReports, showResolvedOnMap, mapStyle, is3DView, activeMainTab]);

  // When activeMainTab switches to 'map', ensure Google Maps triggers resize to render tiles immediately without blank canvas
  useEffect(() => {
    if (activeMainTab === "map" && mapInstanceRef.current && window.google?.maps) {
      const timer = setTimeout(() => {
        window.google.maps.event.trigger(mapInstanceRef.current, "resize");
        const center = mapInstanceRef.current.getCenter();
        if (center) {
          mapInstanceRef.current.panTo(center);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeMainTab]);

  // Compute school stats
  const violatedSchoolsCount = schools.filter((s) =>
    approvedReports.some(
      (r) =>
        (r.schoolId?._id && String(r.schoolId._id) === String(s._id)) ||
        (r.schoolId && String(r.schoolId) === String(s._id)) ||
        (r.schoolId?.name && s.name && r.schoolId.name.trim().toLowerCase() === s.name.trim().toLowerCase())
    )
  ).length;

  const restoredSchoolsCount = schools.filter((s) => {
    const hasViolation = approvedReports.some(
      (r) =>
        (r.schoolId?._id && String(r.schoolId._id) === String(s._id)) ||
        (r.schoolId && String(r.schoolId) === String(s._id)) ||
        (r.schoolId?.name && s.name && r.schoolId.name.trim().toLowerCase() === s.name.trim().toLowerCase())
    );
    const hasResolved = resolvedReports.some(
      (r) =>
        (r.schoolId?._id && String(r.schoolId._id) === String(s._id)) ||
        (r.schoolId && String(r.schoolId) === String(s._id)) ||
        (r.schoolId?.name && s.name && r.schoolId.name.trim().toLowerCase() === s.name.trim().toLowerCase())
    );
    return !hasViolation && hasResolved;
  }).length;

  const cleanSchoolsCount = schools.length - violatedSchoolsCount;

  // Filter schools based on search query & status filter
  const filteredSchools = schools.filter((s) => {
    const schoolResolvedStalls = resolvedReports.filter(
      (r) =>
        (r.schoolId?._id && String(r.schoolId._id) === String(s._id)) ||
        (r.schoolId && String(r.schoolId) === String(s._id)) ||
        (r.schoolId?.name && s.name && r.schoolId.name.trim().toLowerCase() === s.name.trim().toLowerCase())
    );
    const matchesStallName = searchQuery && schoolResolvedStalls.some(
      (r) => (r.shopName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesSearch =
      !searchQuery ||
      matchesStallName ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.city && s.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const hasViolation = approvedReports.some(
      (r) =>
        (r.schoolId?._id && String(r.schoolId._id) === String(s._id)) ||
        (r.schoolId && String(r.schoolId) === String(s._id)) ||
        (r.schoolId?.name && s.name && r.schoolId.name.trim().toLowerCase() === s.name.trim().toLowerCase())
    );
    const hasResolved = schoolResolvedStalls.length > 0;

    if (statusFilter === "violated") return matchesSearch && hasViolation;
    if (statusFilter === "clear") return matchesSearch && !hasViolation && !hasResolved;
    if (statusFilter === "restored") return matchesSearch && hasResolved;
    return matchesSearch;
  });

  const handleViewReportOnMap = (report) => {
    setActiveMainTab("map");
    setTimeout(() => {
      if (mapInstanceRef.current && window.google?.maps) {
        window.google.maps.event.trigger(mapInstanceRef.current, "resize");
        const lat = report.location?.coordinates?.[1];
        const lng = report.location?.coordinates?.[0];
        if (lat && lng) {
          const pos = new window.google.maps.LatLng(lat, lng);
          mapInstanceRef.current.panTo(pos);
          mapInstanceRef.current.setZoom(19);
          setSelectedReportModal(report);
        }
      }
    }, 60);
  };

  const handleOpenGrievance = () => {
    if (!canReport) {
      if (onScrollToSign) {
        onScrollToSign();
      } else {
        const el = document.getElementById("sign-petition-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (onOpenReportModal) {
      onOpenReportModal();
    } else {
      setIsInternalReportModalOpen(true);
    }
  };

  // Double-click anywhere in 360° Street View to drop pin and show small report button
  useEffect(() => {
    const container = mapRef.current;
    if (!container || !isStreetViewActive) return;

    const handleDblClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const sv = mapInstanceRef.current?.getStreetView();
      const pos = sv?.getPosition();
      const pov = sv?.getPov() || { heading: 0, pitch: 0, zoom: 1 };
      const camLat = pos ? pos.lat() : streetViewPos?.lat || MAHARASHTRA_CENTER[0];
      const camLng = pos ? pos.lng() : streetViewPos?.lng || MAHARASHTRA_CENTER[1];

      // Calculate heading of the clicked spot on screen
      const zoom = sv?.getZoom() || 1;
      const fov = 90 / Math.pow(2, Math.max(0, zoom - 1));
      const relX = (clickX - rect.width / 2) / (rect.width / 2);
      const clickHeading = (pov.heading + relX * (fov / 2) + 360) % 360;

      // Project ~15m forward along the clicked heading
      const headingRad = (clickHeading * Math.PI) / 180;
      const dMeters = 15;
      const R = 6378137;
      const dLat = ((dMeters * Math.cos(headingRad)) / R) * (180 / Math.PI);
      const dLng = ((dMeters * Math.sin(headingRad)) / (R * Math.cos((camLat * Math.PI) / 180))) * (180 / Math.PI);
      const pinLat = Number((camLat + dLat).toFixed(6));
      const pinLng = Number((camLng + dLng).toFixed(6));

      // Find nearest school to this pin
      let nearestSchool = null;
      let minDistance = Infinity;
      schools.forEach((s) => {
        if (s.location?.coordinates && Array.isArray(s.location.coordinates)) {
          const sLng = s.location.coordinates[0];
          const sLat = s.location.coordinates[1];
          const dist = calculateDistanceInMeters(sLat, sLng, pinLat, pinLng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestSchool = s;
          }
        }
      });

      setStreetViewPin({
        x: clickX,
        y: clickY,
        lat: pinLat,
        lng: pinLng,
        heading: Math.round(clickHeading),
        nearestSchool,
        distanceToSchool: minDistance !== Infinity ? minDistance : null,
        isInside50m: minDistance <= 50,
      });
    };

    container.addEventListener("dblclick", handleDblClick, true);
    return () => {
      container.removeEventListener("dblclick", handleDblClick, true);
    };
  }, [isStreetViewActive, schools, streetViewPos]);

  const handleReportPinnedStall = () => {
    if (!streetViewPin) return;

    if (!canReport) {
      if (onScrollToSign) {
        onScrollToSign();
      } else {
        const el = document.getElementById("sign-petition-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const nearest = streetViewPin.nearestSchool;
    const dist = streetViewPin.distanceToSchool;

    const prefill = {
      latitude: streetViewPin.lat,
      longitude: streetViewPin.lng,
      city: selectedCity || nearest?.city || "Maharashtra",
      landmark: `Spotted in 360° Street View (Heading ${streetViewPin.heading}°)`,
      school: nearest,
      schoolId: nearest?._id,
      shopName: "",
      description: nearest
        ? `Reported illegal food stall spotted in 360° Street View near ${nearest.name} (~${dist}m away).`
        : `Reported illegal food stall spotted in 360° Street View.`,
    };

    setInternalReportPrefill(prefill);
    setStreetViewPin(null);

    if (onOpenReportModal) {
      onOpenReportModal(prefill);
    } else {
      setIsInternalReportModalOpen(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-lg text-gray-900 border border-pink-100/90 space-y-6">
      {/* ACTIVE PETITION BADGE (If applicable) */}
      {displayPetitionTitle && (
        <div className="bg-pink-50/40 border border-pink-200/80 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-black text-[10px] uppercase tracking-wider shrink-0">
              Petition
            </span>
            <span className="font-bold text-gray-800 truncate">
              {displayPetitionTitle}
            </span>
          </div>
          <span className="text-[11px] text-[#F43676] font-semibold shrink-0">
            50m Zone Vigilance Active
          </span>
        </div>
      )}

      {/* 2. SLEEK MINIMALIST HERO BANNER (Pink & White Website Theme) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#d81b60] via-[#F43676] to-[#e02a60] text-white p-6 sm:p-8 shadow-md">
        {/* Soft atmospheric ambient circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3.5">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs border border-white/30">
            <FaShieldAlt className="text-xs text-white" />
            <span>50m School Buffer Vigilance</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Safe Food, Safe Schools, Safe Maharashtra
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-pink-50 font-normal leading-relaxed">
            Report fast/junk food stalls, pan shops, or tobacco vendors operating within 50 metres of school gates. Automated geofencing alerts local authorities for prompt action.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleOpenGrievance}
              className="px-5 py-2.5 rounded-xl bg-white text-[#d81b60] hover:bg-pink-50 font-extrabold text-xs sm:text-sm shadow-md shadow-pink-900/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <FaStore className="text-xs text-[#d81b60]" />
              <span>+ Report Food Stall</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab(activeMainTab === "complaints" ? "map" : "complaints")}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm border border-white/40 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FaSearch className="text-xs text-white" />
              <span>{activeMainTab === "complaints" ? "🗺️ View Interactive Map" : "🔍 Track Reported Stalls"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. HOW IT WORKS 3-STEP GUIDE (Pink & White Theme) */}
      <div className="space-y-3 pt-1">
        <div className="text-center space-y-0.5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900">How it works</h3>
          <p className="text-[11px] text-gray-500">Three simple steps &bull; it takes about two minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Step 1 */}
          <div className="bg-pink-50/30 p-4 rounded-2xl border border-pink-100 space-y-2 relative">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 text-xs">Describe it</h4>
              <p className="text-[11px] text-gray-500 leading-normal">
                Type or speak what happened &bull; in Marathi, Hindi or English using your microphone.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-pink-50/30 p-4 rounded-2xl border border-pink-100 space-y-2 relative">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 text-xs">AI & Geofence reviews it</h4>
              <p className="text-[11px] text-gray-500 leading-normal">
                Automated GPS testing verifies if the stall is within the prohibited 50m school zone.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-pink-50/30 p-4 rounded-2xl border border-pink-100 space-y-2 relative">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 text-xs">Officer acts</h4>
              <p className="text-[11px] text-gray-500 leading-normal">
                Notice reaches the designated Food Safety Officer to inspect and enforce stall removal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN VIEW NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMainTab("map")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === "map"
                ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-md shadow-pink-500/20"
                : "bg-pink-50 text-gray-700 hover:bg-pink-100 hover:text-[#F43676]"
            }`}
          >
            <span>🗺️ Buffer Zone Map & Schools</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("complaints")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === "complaints"
                ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-md shadow-pink-500/20"
                : "bg-pink-50 text-gray-700 hover:bg-pink-100 hover:text-[#F43676]"
            }`}
          >
            <span>📋 My Reported Stalls</span>
          </button>

        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddSchoolModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-pink-200 hover:bg-pink-50 text-[#F43676] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FaSchool className="text-[#F43676] text-xs" />
            <span>+ Request Missing School</span>
          </button>
        </div>
      </div>

      {/* 5. TAB 1: CITIZEN COMPLAINTS DASHBOARD VIEW */}
      <div className={activeMainTab === "complaints" ? "block" : "hidden"}>
        <UserGrievancesDashboard
          onOpenReportModal={handleOpenGrievance}
          onViewOnMap={handleViewReportOnMap}
          embedded={true}
        />
      </div>

      {/* 6. TAB 2: INTERACTIVE MAP & SCHOOL BUFFER MONITOR (DIRECT MAP VIEW) */}
      <div className={activeMainTab === "map" ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "hidden"}>
          {/* LEFT COLUMN: Map Canvas & Toolbar */}
          <div className="lg:col-span-7 space-y-3 lg:sticky lg:top-20">
            {/* Google Maps Places Autocomplete Search Bar */}
            <div className="relative w-full z-40">
              <div className="relative flex items-center bg-white rounded-2xl shadow-xs border-2 border-pink-200 p-1.5 focus-within:border-[#F43676] focus-within:ring-4 focus-within:ring-pink-100 transition-all">
                <FaSearch className="ml-3 text-[#F43676] text-sm shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search any district, place, school, street or landmark on Google Maps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-2.5 pr-4 py-2 bg-transparent outline-none text-gray-900 font-extrabold placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Map Controls Toolbar: Standard, Satellite, 360° Street View & Legend */}
            <div className="bg-gray-50/90 p-3 rounded-2xl border border-gray-200/80 flex flex-wrap items-center justify-between gap-2.5 text-[11px]">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <FaInfoCircle className="text-[#F43676]" /> Legend:
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-gray-600 font-medium text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block border border-white"></span>
                    <span>School</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F43676] inline-block border border-white"></span>
                    <span>Violation</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-[10px]">🏪</span>
                    <span>Stall</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full border-2 border-dashed border-[#F43676] bg-pink-100/50 inline-block"></span>
                    <span>50m Zone</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-white"></span>
                    <span>Safe Zone</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-[10px]">✅</span>
                    <span>Removed</span>
                  </span>
                </div>
              </div>

              {/* View Switchers */}
              <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-pink-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setShowResolvedOnMap(!showResolvedOnMap)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                    showResolvedOnMap
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                  title="Toggle plotting of confirmed removed stalls"
                >
                  <FaShieldAlt className="text-xs" />
                  <span>{showResolvedOnMap ? "Hide Removed" : "Show Removed Stalls"}</span>
                  {resolvedReports.length > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[9px] font-black">
                      {resolvedReports.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleMapStyle("street")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                    mapStyle === "street" && !is3DView
                      ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-xs"
                      : "text-gray-600 hover:bg-pink-50 hover:text-[#F43676]"
                  }`}
                >
                  <span>🗺️</span> Standard
                </button>

                <button
                  type="button"
                  onClick={() => toggleMapStyle("satellite")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                    mapStyle === "satellite"
                      ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-xs"
                      : "text-gray-600 hover:bg-pink-50 hover:text-[#F43676]"
                  }`}
                >
                  <span>🛰️</span> Satellite
                </button>

                <button
                  type="button"
                  onClick={toggleStreetView}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                    isStreetViewActive
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-amber-50 hover:text-amber-600"
                  }`}
                >
                  <FaCamera className="text-xs" />
                  <span>{isStreetViewActive ? "Close 360°" : "360° View"}</span>
                </button>
              </div>
            </div>

            {/* Interactive Google Map Canvas Container */}
            <div className="relative z-0 isolate rounded-2xl overflow-hidden border border-pink-200 shadow-md bg-pink-50/20 h-[480px] lg:h-[580px]">
              {/* Floating Quick Map View Controls */}
              <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md p-1 rounded-xl border-2 border-pink-300 shadow-lg flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleMapStyle("street")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    mapStyle === "street" && !is3DView
                      ? "bg-[#F43676] text-white shadow-xs"
                      : "text-gray-700 hover:bg-pink-50 hover:text-[#F43676]"
                  }`}
                >
                  <span>🗺️</span> 2D
                </button>

                <button
                  type="button"
                  onClick={toggleStreetView}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    isStreetViewActive
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  }`}
                >
                  <FaCamera className="text-xs" />
                  <span>360°</span>
                </button>
              </div>

              {/* 360° Double-Click Dropped Pin & Small Report Button */}
              {isStreetViewActive && streetViewPin && (
                <div
                  className="absolute z-40 -translate-x-1/2 -translate-y-full pointer-events-auto select-none"
                  style={{ left: streetViewPin.x, top: streetViewPin.y }}
                >
                  {/* Small Compact Report Card */}
                  <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-pink-200 shadow-xl min-w-[180px] max-w-[240px] text-xs space-y-1.5 mb-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between gap-1 border-b border-gray-100 pb-1">
                      <span className="font-extrabold text-gray-900 text-[11px] truncate flex items-center gap-1">
                        <span className="text-[#F43676]">📍</span>
                        <span>Spotted Stall</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setStreetViewPin(null)}
                        className="text-gray-400 hover:text-gray-700 text-xs p-0.5 cursor-pointer"
                        title="Remove Pin"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    </div>

                    {streetViewPin.nearestSchool && (
                      <div className="text-[10px] text-gray-600 truncate">
                        <span>Near: </span>
                        <strong className="text-gray-800">{streetViewPin.nearestSchool.name}</strong>
                        {streetViewPin.distanceToSchool !== null && (
                          <span className={streetViewPin.isInside50m ? " text-rose-600 font-bold block" : " text-gray-500 font-medium block"}>
                            {streetViewPin.isInside50m ? `🚨 ${streetViewPin.distanceToSchool}m from Gate` : `${streetViewPin.distanceToSchool}m to School`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Small Report Button */}
                    <button
                      type="button"
                      onClick={handleReportPinnedStall}
                      className="w-full py-1.5 px-3 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white font-black text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <FaStore className="text-[10px]" />
                      <span>Report This Stall</span>
                    </button>
                  </div>

                  {/* Teardrop Pin Marker pointing to spot */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#F43676] text-white flex items-center justify-center text-xs shadow-md border-2 border-white animate-bounce">
                      📍
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#F43676] rounded-full -mt-0.5" />
                  </div>
                </div>
              )}

              {/* Discreet double-click hint when in 360° View */}
              {isStreetViewActive && !streetViewPin && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <div className="bg-black/65 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1 rounded-full border border-white/20 shadow-md flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Double-click on any stall to drop a pin &amp; report</span>
                  </div>
                </div>
              )}

              {/* Floating Action Banner for Searched Location */}
              {searchedLocation && (
                <div className="absolute bottom-12 left-3 right-3 sm:left-auto sm:right-3 max-w-md z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-pink-300 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">📍</span>
                      <p className="font-extrabold text-gray-900 text-xs truncate">
                        {searchedLocation.title}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate font-medium">
                      {searchedLocation.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasSigned) {
                        if (onScrollToSign) {
                          onScrollToSign();
                        } else {
                          const el = document.getElementById("sign-petition-section");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                        return;
                      }
                      setAddSchoolPrefill({
                        schoolName: searchedLocation.title,
                        city: searchedLocation.city || selectedCity || "",
                        address: searchedLocation.subtitle,
                        latitude: searchedLocation.lat,
                        longitude: searchedLocation.lng,
                      });
                      setIsAddSchoolModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-3 py-2 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FaPlusCircle className="text-xs" />
                    <span>Request 50m School Zone</span>
                  </button>
                </div>
              )}

              {/* Map Status Tag */}
              <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-pink-200 text-[10px] font-black text-gray-800 flex items-center gap-1.5 shadow-md">
                <FaLayerGroup className="text-[#F43676] text-xs" />
                <span>
                  {selectedCity
                    ? `${selectedCity} District (${filteredSchools.length} Schools Mapped)`
                    : `Maharashtra State (${filteredSchools.length} Schools Mapped)`}
                </span>
              </div>

              {/* Google Map Element */}
              <div
                ref={mapRef}
                id="google-map-canvas"
                className="w-full h-full bg-slate-100 rounded-2xl"
              />

              {/* Fallback Overlay if SDK load is pending */}
              {!mapLoaded && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-gray-700 p-4 text-center">
                  <FaSpinner className="animate-spin text-3xl text-[#F43676] mb-2" />
                  <p className="text-xs font-bold">Auto-populating District Schools from Google Maps with 50m Geofences...</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Stats, District Selector & Monitored School Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-rose-50/70 p-2.5 rounded-2xl border border-rose-200 text-center space-y-0.5">
                <span className="text-lg sm:text-xl font-black text-rose-600">{approvedReports.length}</span>
                <span className="block text-[9px] font-bold text-rose-800 flex items-center justify-center gap-1">
                  <FaExclamationTriangle className="text-rose-500" /> Active Violations
                </span>
              </div>

              <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-200 text-center space-y-0.5">
                <span className="text-lg sm:text-xl font-black text-emerald-700">{resolvedReports.length}</span>
                <span className="block text-[9px] font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <FaCheckCircle className="text-emerald-600" /> Stalls Removed
                </span>
              </div>

              <div className="bg-teal-50/60 p-2.5 rounded-2xl border border-teal-200 text-center space-y-0.5">
                <span className="text-lg sm:text-xl font-black text-teal-700">{cleanSchoolsCount}</span>
                <span className="block text-[9px] font-bold text-teal-800 flex items-center justify-center gap-1">
                  <FaShieldAlt className="text-teal-600" /> Safe Schools
                </span>
              </div>

              <div className="bg-pink-50/50 p-2.5 rounded-2xl border border-pink-100 text-center space-y-0.5">
                <span className="text-lg sm:text-xl font-black text-gray-900">{schools.length}</span>
                <span className="block text-[9px] font-bold text-gray-600 flex items-center justify-center gap-1">
                  <FaSchool className="text-[#F43676]" /> Mapped Schools
                </span>
              </div>
            </div>

            {/* District Selection Pills */}
            <div className="bg-pink-50/50 p-3.5 rounded-2xl border border-pink-100/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <FaCity className="text-[#F43676]" /> Select District:
                </span>
                <span className="text-[10px] font-bold text-[#F43676] uppercase">
                  {selectedCity ? selectedCity : "All Maharashtra"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedCity("")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                      selectedCity.toLowerCase() === city.toLowerCase()
                        ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-md shadow-pink-500/20 font-extrabold"
                        : "bg-white text-gray-700 hover:text-[#F43676] hover:bg-pink-50 border border-gray-200/80"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* School Status Filter Tabs & Header */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-2 pt-1">
              <h3 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                <FaSchool className="text-[#F43676]" />
                <span>Schools ({filteredSchools.length})</span>
              </h3>
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: `All (${schools.length})` },
                  { id: "violated", label: `🚨 Violations (${violatedSchoolsCount})` },
                  { id: "restored", label: `✅ Restored Safe (${resolvedReports.length})` },
                  { id: "clear", label: `🛡️ Clean (${cleanSchoolsCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      statusFilter === tab.id
                        ? tab.id === "restored"
                          ? "bg-emerald-600 text-white font-black shadow-xs"
                          : tab.id === "violated"
                          ? "bg-rose-600 text-white font-black shadow-xs"
                          : "bg-[#F43676] text-white font-black shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-[#F43676]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable List of School Cards */}
            {filteredSchools.length === 0 ? (
              <div className="bg-pink-50/40 p-6 rounded-2xl border border-pink-200/80 text-center space-y-2">
                <p className="text-xs text-gray-600 font-bold">No schools found matching search criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSelectedCity("");
                  }}
                  className="text-[11px] font-extrabold text-[#F43676] hover:underline cursor-pointer"
                >
                  Reset Filters & Search
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredSchools.map((school) => {
                  const schoolReports = approvedReports.filter(
                    (r) =>
                      (r.schoolId?._id && String(r.schoolId._id) === String(school._id)) ||
                      (r.schoolId && String(r.schoolId) === String(school._id)) ||
                      (r.schoolId?.name && school.name && r.schoolId.name.trim().toLowerCase() === school.name.trim().toLowerCase())
                  );
                  const hasViolation = schoolReports.length > 0;
                  const schoolResolvedReports = resolvedReports.filter(
                    (r) =>
                      (r.schoolId?._id && String(r.schoolId._id) === String(school._id)) ||
                      (r.schoolId && String(r.schoolId) === String(school._id)) ||
                      (r.schoolId?.name && school.name && r.schoolId.name.trim().toLowerCase() === school.name.trim().toLowerCase())
                  );
                  const hasResolved = schoolResolvedReports.length > 0;
                  const isRestoredSafe = !hasViolation && hasResolved;

                  return (
                    <div
                      key={school._id}
                      onClick={() => zoomToSchool(school)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                        hasViolation
                          ? "bg-gradient-to-br from-pink-50/90 via-white to-pink-50/40 border-pink-300 shadow-xs hover:border-pink-400"
                          : isRestoredSafe
                          ? "bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border-emerald-300 shadow-xs hover:border-emerald-400"
                          : "bg-white border-gray-200/80 hover:border-pink-200 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              hasViolation
                                ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-xs"
                                : isRestoredSafe
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            <FaSchool className="text-sm" />
                          </div>

                          <div>
                            <h4 className="font-extrabold text-gray-900 text-xs leading-snug">
                              {school.name}
                            </h4>
                            <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1 font-medium">
                              <FaMapMarkerAlt className="text-[#F43676] text-[9px]" />
                              <span>{school.city} &bull; {school.address || "Maharashtra"}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {hasViolation ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[9px] inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                              <span>{schoolReports.length} Violation</span>
                            </span>
                          ) : isRestoredSafe ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px] inline-flex items-center gap-1">
                              <span>🛡️ Zone Safe</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px]">
                              Protected Zone
                            </span>
                          )}
                        </div>
                      </div>

                      {hasViolation && (
                        <div className="mt-2 pt-2 border-t border-pink-100/80 space-y-1.5">
                          <p className="text-[10px] text-gray-700 font-bold flex items-center justify-between">
                            <span>Reported: {schoolReports[0].shopName}</span>
                            <span className="text-[9px] font-extrabold bg-[#F43676] px-1.5 py-0.5 rounded-full text-white">
                              {schoolReports[0].distanceFromSchoolMeters}m Away
                            </span>
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReportModal(schoolReports[0]);
                            }}
                            className="w-full text-[11px] font-bold bg-pink-50 hover:bg-pink-100 text-[#F43676] py-1.5 rounded-xl border border-pink-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>View Verified Photos &amp; Evidence</span>
                            <FaChevronRight className="text-[9px]" />
                          </button>
                        </div>
                      )}

                      {isRestoredSafe && (
                        <div className="mt-2 pt-2 border-t border-emerald-100/90 space-y-1.5">
                          <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100 text-[10px] space-y-0.5">
                            <div className="font-extrabold text-emerald-900 flex items-center justify-between">
                              <span className="truncate">
                                ✅ Removed: <s className="text-gray-500 font-semibold">{schoolResolvedReports[0].shopName}</s>
                              </span>
                              <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-md shrink-0">
                                {schoolResolvedReports[0].distanceFromSchoolMeters}m Away
                              </span>
                            </div>
                            <p className="text-emerald-700 font-medium italic text-[10px]">
                              &ldquo;{schoolResolvedReports[0].resolutionNote || "Stall removed / closed. School zone safe."}&rdquo;
                            </p>
                          </div>
                          {schoolResolvedReports[0].images && schoolResolvedReports[0].images.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReportModal({
                                  ...schoolResolvedReports[0],
                                  isResolvedModal: true,
                                });
                              }}
                              className="w-full text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>View Removal Photos &amp; Resolution Audit</span>
                              <FaChevronRight className="text-[9px]" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* Report Modal Popup for Evidence / Resolution Details */}
      {selectedReportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border border-pink-100 rounded-3xl max-w-lg w-full p-6 text-gray-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                {selectedReportModal.isResolvedModal || selectedReportModal.status === "resolved" ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
                    ✅ Stall Removed &bull; Zone Safe
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase">
                    🚨 Active Violation
                  </span>
                )}
                <h3 className="font-extrabold text-base text-gray-900">
                  {selectedReportModal.isResolvedModal || selectedReportModal.status === "resolved" ? (
                    <span className="line-through text-gray-500">{selectedReportModal.shopName}</span>
                  ) : (
                    selectedReportModal.shopName
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-pink-50 hover:text-[#F43676] flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`${
                selectedReportModal.isResolvedModal || selectedReportModal.status === "resolved"
                  ? "bg-emerald-50/60 border-emerald-100"
                  : "bg-pink-50/50 border-pink-100"
              } p-3 rounded-2xl border space-y-1`}>
                <p className="font-bold text-gray-900">
                  School: {selectedReportModal.schoolId?.name || "Target School"}
                </p>
                <p className="text-gray-600 font-medium">
                  Distance: <strong className={selectedReportModal.isResolvedModal || selectedReportModal.status === "resolved" ? "text-emerald-700" : "text-[#F43676]"}>
                    {selectedReportModal.distanceFromSchoolMeters} meters
                  </strong> from school entrance {selectedReportModal.isResolvedModal || selectedReportModal.status === "resolved" ? "(Cleared from 50m zone)" : "(Inside prohibited 50m zone)"}.
                </p>
                {selectedReportModal.resolutionNote && (
                  <p className="text-emerald-800 font-semibold bg-emerald-100/70 p-2 rounded-xl border border-emerald-200 mt-1">
                    🛡️ Action Resolution: &ldquo;{selectedReportModal.resolutionNote}&rdquo;
                  </p>
                )}
                <p className="text-gray-500 text-[11px]">
                  City: {selectedReportModal.city || selectedReportModal.schoolId?.city || "Maharashtra"}
                </p>
              </div>

              {/* Photo Evidence Section */}
              {(() => {
                const reportImages = (
                  Array.isArray(selectedReportModal.images) && selectedReportModal.images.length > 0
                    ? selectedReportModal.images
                    : selectedReportModal.imageUrl
                    ? [selectedReportModal.imageUrl]
                    : selectedReportModal.image
                    ? [selectedReportModal.image]
                    : []
                ).filter(Boolean);

                if (reportImages.length === 0) {
                  return (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-3 text-center text-gray-400 text-[11px] font-medium">
                      📷 No photo evidence uploaded with this report
                    </div>
                  );
                }

                const activeImg = reportImages[activeReportImageIndex] || reportImages[0];
                const activeSrc = activeImg.startsWith("http")
                  ? activeImg
                  : `${backendUrl}/${activeImg.replace(/^\//, "")}`;

                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-700 flex items-center gap-1">
                        <span>📸 Photo Evidence</span>
                        <span className="text-[10px] text-[#F43676] font-extrabold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                          {reportImages.length} {reportImages.length === 1 ? "Photo" : "Photos"}
                        </span>
                      </p>
                      {reportImages.length > 1 && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          Click thumbnail to switch
                        </span>
                      )}
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xs max-h-60 bg-gray-900/5 flex items-center justify-center relative group">
                      <img
                        src={activeSrc}
                        alt={selectedReportModal.shopName}
                        className="w-full max-h-60 object-contain rounded-2xl bg-black/5"
                      />
                      <a
                        href={activeSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2.5 right-2.5 bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 transition-opacity opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                      >
                        <FaEye className="text-[10px]" />
                        <span>View Original</span>
                      </a>
                    </div>

                    {reportImages.length > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
                        {reportImages.map((img, idx) => {
                          const thumbSrc = img.startsWith("http")
                            ? img
                            : `${backendUrl}/${img.replace(/^\//, "")}`;
                          const isSelected = (activeReportImageIndex || 0) === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveReportImageIndex(idx)}
                              className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                                isSelected
                                  ? "border-[#F43676] ring-2 ring-pink-200"
                                  : "border-gray-200 hover:border-pink-300 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={thumbSrc}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {selectedReportModal.description && (
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
                  <p className="font-bold text-gray-700 mb-0.5">Report Description:</p>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {selectedReportModal.description}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                {!(selectedReportModal.isResolvedModal || selectedReportModal.status === "resolved") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        setSelectedReportModal(null);
                        const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
                        const loginUrl = currentPath ? `/login?redirect=${encodeURIComponent(currentPath)}` : "/login";
                        router.push(loginUrl);
                        return;
                      }
                      const reportToDefend = selectedReportModal;
                      setSelectedReportModal(null);
                      setDefendModalReport(reportToDefend);
                    }}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-pink-50 hover:text-[#F43676] text-gray-700 font-extrabold rounded-xl transition-colors text-center text-xs cursor-pointer border border-transparent hover:border-pink-200 flex items-center justify-center gap-1.5"
                  >
                    <FaShieldAlt className="text-sm text-[#F43676]" />
                    <span>Stall Owner Dispute / Defend</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedReportModal(null)}
                  className={`px-5 py-2.5 ${
                    selectedReportModal.isResolvedModal || selectedReportModal.status === "resolved"
                      ? "w-full bg-emerald-600 hover:bg-emerald-700"
                      : "bg-[#F43676] hover:bg-[#e02a60]"
                  } text-white font-extrabold rounded-xl transition-colors cursor-pointer`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Internal Stall Report Modal Fallback */}
      {isInternalReportModalOpen && (
        <SubmitStallReportModal
          petitionId={petitionId}
          isOpen={isInternalReportModalOpen}
          initialData={internalReportPrefill}
          onClose={() => {
            setIsInternalReportModalOpen(false);
            setInternalReportPrefill(null);
          }}
          onSuccess={() => {
            setIsInternalReportModalOpen(false);
            setInternalReportPrefill(null);
            setActiveMainTab("complaints");
          }}
        />
      )}

      {/* Add Missing City / School Request Modal */}
      <AddSchoolModal
        isOpen={isAddSchoolModalOpen}
        onClose={() => {
          setIsAddSchoolModalOpen(false);
          setAddSchoolPrefill(null);
        }}
        petitionId={petitionId}
        initialData={addSchoolPrefill}
        onSuccess={() => {
          setIsAddSchoolModalOpen(false);
          setAddSchoolPrefill(null);
          const fetchRefreshedSchools = async () => {
            try {
              const res = await fetch(
                `${backendUrl}/api/stall-reports/schools${
                  selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : ""
                }`
              );
              if (res.ok) {
                const sData = await res.json();
                setDbSchools(sData.schools || []);
              }
            } catch (err) {
              console.error("Error refreshing schools:", err);
            }
          };
          fetchRefreshedSchools();
        }}
      />

      {/* Stall Dispute Modal */}
      {defendModalReport && (
        <DefendStallModal
          isOpen={true}
          report={defendModalReport}
          onClose={() => setDefendModalReport(null)}
          onSuccess={() => setDefendModalReport(null)}
        />
      )}
    </div>
  );
}
