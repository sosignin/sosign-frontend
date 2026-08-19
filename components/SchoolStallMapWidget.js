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
} from "react-icons/fa";

import AddSchoolModal from "./AddSchoolModal";
import DefendStallModal from "./DefendStallModal";

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

export default function SchoolStallMapWidget({
  petitionId,
  petitionTitle,
  onOpenReportModal,
  hasSigned = true,
  onScrollToSign,
}) {
  const [displayPetitionTitle, setDisplayPetitionTitle] = useState(petitionTitle || "");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [approvedReports, setApprovedReports] = useState([]);
  
  // School states (DB schools + Google Places auto-populated schools)
  const [dbSchools, setDbSchools] = useState([]);
  const [googlePlacesSchools, setGooglePlacesSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReportModal, setSelectedReportModal] = useState(null);
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

  // Combine DB schools & Google Places schools (deduplicating by normalized name)
  const schools = useMemo(() => {
    const mapByName = new Map();

    // 1. Add DB schools first (retains violation linking)
    dbSchools.forEach((s) => {
      const key = s.name.toLowerCase().trim();
      mapByName.set(key, s);
    });

    // 2. Add Google Places schools for missing schools
    googlePlacesSchools.forEach((s) => {
      const key = s.name.toLowerCase().trim();
      if (!mapByName.has(key)) {
        mapByName.set(key, s);
      }
    });

    return Array.from(mapByName.values());
  }, [dbSchools, googlePlacesSchools]);

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

    const map = mapInstanceRef.current;
    const service = new window.google.maps.places.PlacesService(map);

    const center = getCityCenter(selectedCity);
    const searchLocation = new window.google.maps.LatLng(center[0], center[1]);
    const queryStr = selectedCity ? `schools in ${selectedCity}, Maharashtra` : "schools in Maharashtra";

    const request = {
      query: queryStr,
      location: searchLocation,
      radius: selectedCity ? 12000 : 35000,
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
            city: selectedCity || "Maharashtra",
            location: {
              coordinates: [lng, lat],
            },
            isGooglePlace: true,
          };
        });
        setGooglePlacesSchools(gSchools);
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
      streetView.setVisible(true);
    } else {
      streetView.setVisible(false);
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
        if (!selectedCity && sortedCities.length > 0) {
          setSelectedCity(sortedCities[0]);
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCities(MAHARASHTRA_DISTRICTS.map((d) => d.name));
      }
    };

    fetchCities();
  }, [backendUrl, selectedCity]);

  // Fetch DB Schools & Reports for selected city
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
          setDbSchools(Array.from(uniqueSchoolsMap.values()));
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
      if (!mapInstanceRef.current) {
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

        // Listen for native Street View visibility changes
        const sv = mapInstanceRef.current.getStreetView();
        sv.addListener("visible_changed", () => {
          setIsStreetViewActive(sv.getVisible());
        });
      } else {
        mapInstanceRef.current.panTo(centerObj);
        mapInstanceRef.current.setZoom(targetZoom);
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

      // Plot All Schools (DB + Google Maps) with 50m Radius Geofences
      schools.forEach((school) => {
        if (!school.location?.coordinates) return;
        const lng = school.location.coordinates[0];
        const lat = school.location.coordinates[1];

        const schoolReports = approvedReports.filter(
          (r) => r.schoolId?._id === school._id || r.schoolId === school._id
        );
        const hasViolation = schoolReports.length > 0;

        // 1. 50m Radius Geofence Circle around School
        const circle = new window.google.maps.Circle({
          strokeColor: hasViolation ? "#F43676" : "#10b981",
          strokeOpacity: 0.9,
          strokeWeight: hasViolation ? 2.5 : 1.5,
          fillColor: hasViolation ? "#F43676" : "#10b981",
          fillOpacity: hasViolation ? 0.25 : 0.12,
          map: map,
          center: { lat, lng },
          radius: 50, // Exact 50 Meters Radius!
        });
        googleCirclesRef.current.push(circle);

        // 2. Custom SVG School Marker Pin
        const schoolIconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
            <circle cx="19" cy="19" r="17" fill="${hasViolation ? "#F43676" : "#3B82F6"}" stroke="#ffffff" stroke-width="3"/>
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

        const popupContent = `
          <div style="padding:8px; font-family: system-ui, sans-serif; max-width:240px; color:#0f172a;">
            <span style="background:${hasViolation ? "#ffe4e6" : "#d1fae5"}; color:${hasViolation ? "#be123c" : "#065f46"}; font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px; text-transform:uppercase; display:inline-block; margin-bottom:6px;">
              ${hasViolation ? "🚨 50m Violation Detected" : "🛡️ Clean School Zone"}
            </span>
            <h3 style="margin:0 0 4px 0; font-size:14px; font-weight:800; color:#0f172a; line-height:1.3;">${school.name}</h3>
            <p style="margin:0 0 6px 0; font-size:11px; color:#64748b;">${school.address || school.city}</p>
            <div style="font-size:11px; font-weight:700; color:#F43676; background:#fff1f2; padding:6px; border-radius:8px; border:1px solid #fecdd3;">
              Strict 50m Buffer Zone Active
            </div>
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
      });
    } catch (err) {
      console.warn("Google Maps rendering exception:", err);
    }
  }, [mapLoaded, selectedCity, schools, approvedReports, mapStyle, is3DView]);

  // Compute school stats
  const violatedSchoolsCount = schools.filter((s) =>
    approvedReports.some((r) => r.schoolId?._id === s._id || r.schoolId === s._id)
  ).length;

  const cleanSchoolsCount = schools.length - violatedSchoolsCount;

  // Filter schools based on search query & status filter
  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.city && s.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const hasViolation = approvedReports.some(
      (r) => r.schoolId?._id === s._id || r.schoolId === s._id
    );

    if (statusFilter === "violated") return matchesSearch && hasViolation;
    if (statusFilter === "clear") return matchesSearch && !hasViolation;
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl text-gray-900 border border-pink-100/90 space-y-6">
      {/* PETITION TITLE BANNER AT THE TOP OF MAP SECTION */}
      {displayPetitionTitle && (
        <div className="bg-gradient-to-r from-pink-500/10 via-pink-50/90 to-purple-50 p-3.5 sm:p-4 rounded-2xl border-2 border-pink-200/90 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-black text-xs uppercase tracking-wider shadow-xs shrink-0 flex items-center gap-1.5">
              <FaBullhorn className="text-xs" /> Active Petition
            </span>
            <h1 className="text-base sm:text-lg font-black text-gray-900 leading-snug truncate">
              {displayPetitionTitle}
            </h1>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-pink-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-[#F43676] text-xs font-extrabold mb-2 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F43676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F43676]"></span>
            </span>
            Official Google Maps 3D & 360° Street View Monitor &bull;
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <FaShieldAlt className="text-[#F43676]" /> Maharashtra District & School Buffer Zone Map
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Monitoring all 36 Districts of Maharashtra with Google Maps Places live school detection & 50m radius geofences.
          </p>
        </div>

        <div className="relative shrink-0">
          {!hasSigned ? (
            <div className="relative flex flex-wrap items-center gap-2">
              {/* Blurred Action Buttons */}
              <div className="flex items-center gap-2 filter blur-[3px] opacity-45 pointer-events-none select-none">
                <button
                  tabIndex={-1}
                  className="px-4 py-2.5 rounded-2xl bg-white text-[#F43676] font-bold text-xs border border-pink-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  <FaSchool className="text-sm text-[#F43676]" />
                  <span>+ Request Missing City / School</span>
                </button>

                <button
                  tabIndex={-1}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 border border-pink-400/30"
                >
                  <FaStore className="text-sm" />
                  <span>Report Junk Food Stall</span>
                </button>
              </div>

              {/* Overlay Call-To-Action Button */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <button
                  type="button"
                  onClick={() => {
                    if (onScrollToSign) {
                      onScrollToSign();
                    } else {
                      const el = document.getElementById("sign-petition-section");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] hover:to-[#c41e50] text-white font-extrabold text-xs shadow-xl shadow-pink-500/30 transition-all flex items-center justify-center gap-2 border-2 border-white cursor-pointer hover:scale-105"
                >
                  <span className="text-sm">✍️</span>
                  <span>Sign This Petition to Report</span>
                </button>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* MAIN HORIZONTAL SPLIT GRID (Left Panel = Interactive Map, Right Panel = Details/Controls/Schools) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDE PANEL (Interactive Map View, Official Google Maps Autocomplete Search & Toolbar) */}
        <div className="lg:col-span-7 space-y-3 lg:sticky lg:top-20">

          {/* OFFICIAL NATIVE GOOGLE MAPS PLACES AUTOCOMPLETE SEARCH BAR */}
          <div className="relative w-full z-40">
            <div className="relative flex items-center bg-white rounded-2xl shadow-md border-2 border-pink-300 p-1.5 focus-within:border-[#F43676] focus-within:ring-4 focus-within:ring-pink-100 transition-all">
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

          {/* Map Controls Toolbar: Standard, Satellite, 3D View, 360° Street View */}
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
              </div>
            </div>

            {/* GOOGLE MAP VIEW SWITCHER TOOLBAR (2D, 3D, Satellite, 360° Street View) */}
            <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-pink-200 shadow-xs">
              <button
                type="button"
                onClick={() => toggleMapStyle("street")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
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
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                  mapStyle === "satellite"
                    ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-xs"
                    : "text-gray-600 hover:bg-pink-50 hover:text-[#F43676]"
                }`}
              >
                <span>🛰️</span> Satellite
              </button>

              {/* 3D View Button Commented Out
              <button
                type="button"
                onClick={toggle3DView}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                  is3DView
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                <FaCube className="text-xs" />
                <span>{is3DView ? "3D Active" : "3D View"}</span>
              </button>
              */}

              <button
                type="button"
                onClick={toggleStreetView}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
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
            
            {/* FLOATING QUICK MAP VIEW CONTROLS OVER MAP TOP RIGHT */}
            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md p-1 rounded-xl border-2 border-pink-300 shadow-lg flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleMapStyle("street")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                  mapStyle === "street" && !is3DView
                    ? "bg-[#F43676] text-white shadow-xs"
                    : "text-gray-700 hover:bg-pink-50 hover:text-[#F43676]"
                }`}
              >
                <span>🗺️</span> 2D
              </button>

              {/* 3D View Overlay Button Commented Out
              <button
                type="button"
                onClick={toggle3DView}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                  is3DView
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                <FaCube className="text-xs" />
                <span>3D</span>
              </button>
              */}

              <button
                type="button"
                onClick={toggleStreetView}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                  isStreetViewActive
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                }`}
              >
                <FaCamera className="text-xs" />
                <span>360°</span>
              </button>
            </div>

            {/* FLOATING ACTION BANNER FOR SEARCHED LOCATION TO REQUEST 50m ZONE */}
            {searchedLocation && (
              <div className="absolute bottom-12 left-3 right-3 sm:left-auto sm:right-3 max-w-md z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-pink-300 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs animate-in fade-in slide-in-from-bottom duration-300">
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
                  className="w-full sm:w-auto px-3 py-2 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
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

          {/* 4-Step Citizen Action Guide */}
          <div className="bg-pink-50/30 p-3.5 rounded-2xl border border-pink-100 space-y-2">
            <h4 className="text-[11px] font-extrabold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <FaBullhorn className="text-[#F43676]" /> How You Can Protect School Zones (4 Steps)
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-white p-2.5 rounded-xl border border-pink-100/80 space-y-0.5">
                <span className="text-[9px] font-black bg-pink-100 text-[#F43676] px-1.5 py-0.2 rounded-full">Step 1</span>
                <p className="font-bold text-gray-900 text-[11px]">Select District</p>
                <p className="text-[10px] text-gray-500 leading-tight">Pick any of 36 Maharashtra districts.</p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-pink-100/80 space-y-0.5">
                <span className="text-[9px] font-black bg-pink-100 text-[#F43676] px-1.5 py-0.2 rounded-full">Step 2</span>
                <p className="font-bold text-gray-900 text-[11px]">Inspect 50m Zone</p>
                <p className="text-[10px] text-gray-500 leading-tight">Inspect auto 50m geofence buffer.</p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-pink-100/80 space-y-0.5">
                <span className="text-[9px] font-black bg-pink-100 text-[#F43676] px-1.5 py-0.2 rounded-full">Step 3</span>
                <p className="font-bold text-gray-900 text-[11px]">Submit Evidence</p>
                <p className="text-[10px] text-gray-500 leading-tight">Click &apos;Report Junk Food Stall&apos; with photos.</p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-pink-100/80 space-y-0.5">
                <span className="text-[9px] font-black bg-pink-100 text-[#F43676] px-1.5 py-0.2 rounded-full">Step 4</span>
                <p className="font-bold text-gray-900 text-[11px]">Legal Enforcement</p>
                <p className="text-[10px] text-gray-500 leading-tight">Admin verifies & files notice to authority.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE PANEL (Info, District Selector, Search, Stats, & Monitored School Cards) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Campaign Purpose & Motive Box */}
          <div className="bg-gradient-to-r from-pink-50/80 via-white to-pink-50/40 p-4 rounded-2xl border border-pink-100/90 text-xs text-gray-700 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-pink-950 font-black text-xs">
                <FaBullhorn className="text-[#F43676] text-sm" />
                <span>Campaign Objective</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#F43676] font-extrabold text-[10px] uppercase">
                50m Buffer Zone
              </span>
            </div>
            <p className="leading-relaxed text-gray-600 font-medium text-[11px]">
              Selling junk food or tobacco within <strong>50m of school entrances</strong> is illegal under COTPA & FSSAI rules. Inspect schools, monitor geofences, and submit evidence.
            </p>
          </div>

          {/* Campaign Stat Metric Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-pink-50/40 p-3 rounded-2xl border border-pink-100 text-center space-y-0.5">
              <span className="text-xl font-black text-gray-900">{schools.length}</span>
              <span className="block text-[10px] font-bold text-gray-600 flex items-center justify-center gap-1">
                <FaSchool className="text-[#F43676]" /> Monitored Schools
              </span>
            </div>

            <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-200 text-center space-y-0.5">
              <span className="text-xl font-black text-rose-600">{approvedReports.length}</span>
              <span className="block text-[10px] font-bold text-rose-800 flex items-center justify-center gap-1">
                <FaExclamationTriangle className="text-rose-500" /> Active 50m Violations
              </span>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200 text-center space-y-0.5">
              <span className="text-xl font-black text-emerald-700">{cleanSchoolsCount}</span>
              <span className="block text-[10px] font-bold text-emerald-800 flex items-center justify-center gap-1">
                <FaCheckCircle className="text-emerald-600" /> Safe School Zones
              </span>
            </div>

            <div className="bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100 text-center space-y-0.5">
              <span className="text-xl font-black text-indigo-900">36</span>
              <span className="block text-[10px] font-bold text-indigo-700 flex items-center justify-center gap-1">
                <FaCity className="text-indigo-500" /> Districts Covered
              </span>
            </div>
          </div>

          {/* District Selection Pills */}
          <div className="bg-pink-50/50 p-3.5 rounded-2xl border border-pink-100/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-gray-700">
              <span className="flex items-center gap-1.5">
                <FaCity className="text-[#F43676]" /> Select District / City:
              </span>
              <span className="text-[10px] font-bold text-pink-600 uppercase">
                {selectedCity ? selectedCity : "All Maharashtra"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCity("")}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
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
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all capitalize ${
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
                { id: "violated", label: "🚨 Violations" },
                { id: "clear", label: "🛡️ Safe" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    statusFilter === tab.id
                      ? "bg-[#F43676] text-white font-extrabold shadow-xs"
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
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSelectedCity("");
                }}
                className="text-[11px] font-extrabold text-[#F43676] hover:underline"
              >
                Reset Filters & Search
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredSchools.map((school) => {
                const schoolReports = approvedReports.filter(
                  (r) => r.schoolId?._id === school._id || r.schoolId === school._id
                );
                const hasViolation = schoolReports.length > 0;

                return (
                  <div
                    key={school._id}
                    onClick={() => zoomToSchool(school)}
                    className={`relative p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer group hover:border-pink-300 hover:shadow-md ${
                      hasViolation
                        ? "bg-gradient-to-br from-pink-50/90 via-white to-pink-50/40 border-pink-300 shadow-xs"
                        : "bg-white border-gray-200/80 hover:border-pink-200 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="relative mt-0.5 shrink-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              hasViolation
                                ? "bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white shadow-xs"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            <FaSchool className="text-sm" />
                          </div>
                          {hasViolation && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F43676] opacity-90"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F43676] border border-white"></span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-extrabold text-gray-900 text-xs leading-snug">
                            {school.name}
                          </h4>
                          <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1 font-medium">
                            <FaMapMarkerAlt className="text-[#F43676] text-[9px]" />
                            <span>{school.city} • {school.address || "Maharashtra"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {hasViolation ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[9px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                            <span>{schoolReports.length} Violation</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px]">
                            Protected Zone
                          </span>
                        )}
                      </div>
                    </div>

                    {hasViolation && (
                      <div className="mt-2.5 pt-2 border-t border-pink-100/80 space-y-1.5">
                        <p className="text-[10px] text-gray-700 font-bold flex items-center justify-between">
                          <span>Reported Stall: {schoolReports[0].shopName}</span>
                          <span className="text-[9px] font-extrabold bg-[#F43676] px-1.5 py-0.5 rounded-full text-white">
                            {schoolReports[0].distanceFromSchoolMeters}m Away
                          </span>
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportModal(schoolReports[0]);
                          }}
                          className="w-full text-[11px] font-bold bg-pink-50 hover:bg-pink-100 text-[#F43676] py-1.5 rounded-xl border border-pink-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <span>View Verified Photos & Evidence</span>
                          <FaChevronRight className="text-[9px]" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Report Modal Popup for Evidence */}
      {selectedReportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border border-pink-100 rounded-3xl max-w-lg w-full p-6 text-gray-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase">
                  🚨 Active Violation
                </span>
                <h3 className="font-extrabold text-base text-gray-900">
                  {selectedReportModal.shopName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-pink-50 hover:text-[#F43676] flex items-center justify-center text-gray-500 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-100 space-y-1">
                <p className="font-extrabold text-gray-900">
                  School: {selectedReportModal.schoolId?.name || "Target School"}
                </p>
                <p className="text-gray-600 font-medium">
                  Reported Distance: <strong className="text-[#F43676]">{selectedReportModal.distanceFromSchoolMeters} meters</strong> from school entrance (Inside prohibited 50m zone).
                </p>
                <p className="text-gray-500 text-[11px]">
                  City: {selectedReportModal.city || selectedReportModal.schoolId?.city || "Maharashtra"}
                </p>
              </div>

              {selectedReportModal.imageUrl && (
                <div className="space-y-1">
                  <p className="font-bold text-gray-700">Photo Evidence:</p>
                  <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xs max-h-56 bg-gray-50 flex items-center justify-center">
                    <img
                      src={
                        selectedReportModal.imageUrl.startsWith("http")
                          ? selectedReportModal.imageUrl
                          : `${backendUrl}/${selectedReportModal.imageUrl.replace(/^\//, "")}`
                      }
                      alt={selectedReportModal.shopName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {selectedReportModal.description && (
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
                  <p className="font-bold text-gray-700 mb-0.5">Report Description:</p>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {selectedReportModal.description}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setDefendModalReport(selectedReportModal);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl transition-colors text-center text-xs"
                >
                  🛡️ Stall Owner Dispute / Defend
                </button>
                <button
                  onClick={() => setSelectedReportModal(null)}
                  className="px-5 py-2.5 bg-[#F43676] text-white font-extrabold rounded-xl hover:bg-[#e02a60] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
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
          // Refetch schools
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
          report={defendModalReport}
          onClose={() => setDefendModalReport(null)}
        />
      )}
    </div>
  );
}
