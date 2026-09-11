import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import L from "leaflet";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import api from "../../services/api";

// Leaflet marker fix for Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ============================================================
// DISTRICT → BLOCKS
// ============================================================

const districtBlocks = {
  Ranchi: [
    "Angara",
    "Bero",
    "Burmu",
    "Chanho",
    "Kanke",
    "Khelari",
    "Lapung",
    "Mandar",
    "Nagri",
    "Namkum",
    "Ormanjhi",
    "Ratu",
    "Silli",
    "Sonahatu",
    "Tamar",
  ],

  Bokaro: [
    "Bermo",
    "Chandankiyari",
    "Chas",
    "Gomia",
    "Jaridih",
    "Kasmar",
    "Nawadih",
  ],

  Chatra: [
    "Chatra",
    "Gidhaur",
    "Hunterganj",
    "Itkhori",
    "Kanhachatti",
    "Kunda",
    "Lawalong",
    "Mayurhand",
    "Pathalgada",
    "Pratappur",
    "Simaria",
    "Tandwa",
  ],

  Deoghar: [
    "Deoghar",
    "Devipur",
    "Karon",
    "Madhupur",
    "Mohanpur",
    "Palojori",
    "Sarath",
    "Sarwan",
    "Sonaraithari",
  ],

  Dhanbad: [
    "Baghmara",
    "Baliapur",
    "Dhanbad",
    "Govindpur",
    "Nirsa",
    "Topchanchi",
  ],

  Dumka: [
    "Dumka",
    "Gopikandar",
    "Jama",
    "Jarmundi",
    "Kathikund",
    "Masalia",
    "Ramgarh",
    "Ranishwar",
    "Saraiyahat",
    "Shikaripara",
  ],

  EastSinghbhum: [
    "Baharagora",
    "Boram",
    "Chakulia",
    "Dhalbhumgarh",
    "Dumaria",
    "Ghatshila",
    "Golmuri-Cum-Jugsalai",
    "Gurbandha",
    "Musabani",
    "Patamda",
  ],

  Garhwa: [
    "Bardiha",
    "Bhandaria",
    "Bhawanathpur",
    "Bishunpura",
    "Chinia",
    "Danda",
    "Dandai",
    "Dhura",
    "Garhwa",
    "Kandi",
    "Kharaundhi",
    "Majhiaon",
    "Meral",
    "Nagar Untari",
    "Ramna",
    "Ranka",
  ],

  Giridih: [
    "Bagodar",
    "Bengabad",
    "Birni",
    "Deori",
    "Dhanwar",
    "Dumri",
    "Gandey",
    "Gawan",
    "Giridih",
    "Jamua",
    "Pirtand",
    "Suriya",
  ],

  Godda: [
    "Basantarai",
    "Boarijore",
    "Godda",
    "Mahagama",
    "Meharma",
    "Pathargama",
    "Poreyahat",
    "Sundarpahari",
  ],

  Gumla: [
    "Basia",
    "Bishunpur",
    "Chainpur",
    "Dumri",
    "Gumla",
    "Kamdara",
    "Palkot",
    "Raidih",
    "Sisai",
  ],

  Hazaribagh: [
    "Barkagaon",
    "Barkatha",
    "Bishnugarh",
    "Chalkusa",
    "Chouparan",
    "Churchu",
    "Dadi",
    "Daroo",
    "Hazaribagh",
    "Ichak",
    "Katkamsandi",
    "Katkamdag",
    "Keredari",
    "Padma",
  ],

  Jamtara: [
    "Fatehpur",
    "Jamtara",
    "Karmatanr",
    "Kundhit",
    "Nala",
    "Narayanpur",
  ],

  Khunti: [
    "Arki",
    "Khunti",
    "Karra",
    "Murhu",
    "Rania",
    "Torpa",
  ],

  Koderma: [
    "Chandwara",
    "Domchanch",
    "Jainagar",
    "Koderma",
    "Markacho",
    "Satgawan",
  ],

  Latehar: [
    "Balumath",
    "Barwadih",
    "Chandwa",
    "Garu",
    "Herhanj",
    "Latehar",
    "Mahuadanr",
    "Manika",
  ],

  Lohardaga: [
    "Bhandra",
    "Kisko",
    "Kuru",
    "Lohardaga",
    "Peshrar",
    "Senha",
  ],

  Pakur: [
    "Amrapara",
    "Hiranpur",
    "Litipara",
    "Maheshpur",
    "Pakuria",
    "Pakur",
  ],

  Palamu: [
    "Bishrampur",
    "Chainpur",
    "Chhatarpur",
    "Daltonganj",
    "Haidernagar",
    "Hussainabad",
    "Manatu",
    "Medininagar",
    "Mohammadganj",
    "Nawa Bazar",
    "Nawdiha Bazar",
    "Panki",
    "Pataratu",
    "Pipra",
    "Ramgarh",
    "Satbarwa",
    "Tarhasi",
    "Untari Road",
  ],

  Ramgarh: [
    "Chitarpur",
    "Dulmi",
    "Gola",
    "Mandu",
    "Patratu",
    "Ramgarh",
  ],

  Sahibganj: [
    "Barhait",
    "Borio",
    "Mandro",
    "Pathna",
    "Rajmahal",
    "Sahibganj",
    "Taljhari",
    "Udhwa",
  ],

  SeraikelaKharsawan: [
    "Chandil",
    "Gamarhia",
    "Ichagarh",
    "Kharsawan",
    "Kuchai",
    "Kukru",
    "Nimdih",
    "Rajnagar",
    "Seraikella",
  ],

  Simdega: [
    "Bano",
    "Bansjore",
    "Bolba",
    "Jaldega",
    "Kersai",
    "Kolebira",
    "Kurdeg",
    "Simdega",
    "Thethaitangar",
  ],

  WestSinghbhum: [
    "Anandpur",
    "Bandgaon",
    "Chakradharpur",
    "Chaibasa",
    "Goilkera",
    "Jagannathpur",
    "Jhinkpani",
    "Khuntpani",
    "Kumardungi",
    "Majhgaon",
    "Manjhari",
    "Manoharpur",
    "Noamundi",
    "Sonua",
    "Tantnagar",
  ],
};

const districts = Object.keys(districtBlocks);

// ============================================================
// MAP CENTERS
// ============================================================

const districtCenters = {
  Ranchi: [23.3441, 85.3096],
  Bokaro: [23.6693, 86.1511],
  Chatra: [24.2065, 84.8706],
  Deoghar: [24.4927, 86.6997],
  Dhanbad: [23.7957, 86.4304],
  Dumka: [24.2676, 87.2497],
  EastSinghbhum: [22.8046, 86.2029],
  Garhwa: [24.156, 83.7996],
  Giridih: [24.1855, 86.3005],
  Godda: [24.827, 87.212],
  Gumla: [23.0422, 84.5441],
  Hazaribagh: [23.9966, 85.3691],
  Jamtara: [23.963, 86.801],
  Khunti: [23.076, 85.278],
  Koderma: [24.467, 85.593],
  Latehar: [23.748, 84.499],
  Lohardaga: [23.434, 84.684],
  Pakur: [24.639, 87.842],
  Palamu: [24.03, 84.07],
  Ramgarh: [23.63, 85.56],
  Sahibganj: [25.237, 87.645],
  SeraikelaKharsawan: [22.7, 85.93],
  Simdega: [22.615, 84.505],
  WestSinghbhum: [22.55, 85.8],
};

const blockCenters = {
  Ranchi: {
    Kanke: [23.4346, 85.3206],
    Namkum: [23.3436, 85.3611],
    Ratu: [23.4218, 85.2827],
    Ormanjhi: [23.4715, 85.4624],
    Mandar: [23.3657, 85.1502],
    Nagri: [23.426, 85.293],
    Bero: [23.266, 85.055],
    Silli: [23.337, 85.89],
    Tamar: [23.106, 85.75],
    Angara: [23.55, 85.56],
    Chanho: [23.44, 85.08],
    Lapung: [23.45, 84.95],
    Khelari: [23.65, 84.99],
    Burmu: [23.67, 85.23],
    Sonahatu: [23.25, 85.78],
  },

  Bokaro: {
    Bermo: [23.78, 85.94],
    Chas: [23.64, 86.18],
    Gomia: [23.79, 85.83],
    Jaridih: [23.72, 86.07],
    Kasmar: [23.65, 85.96],
    Nawadih: [23.8, 85.86],
    Chandankiyari: [23.59, 86.65],
  },

  Dhanbad: {
    Dhanbad: [23.7957, 86.4304],
    Baghmara: [23.72, 86.69],
    Baliapur: [23.79, 86.66],
    Govindpur: [23.84, 86.51],
    Nirsa: [23.78, 86.72],
    Topchanchi: [23.9, 86.2],
  },

  Hazaribagh: {
    Hazaribagh: [23.9966, 85.3691],
    Barkagaon: [23.78, 85.22],
    Barkatha: [24.28, 85.34],
    Bishnugarh: [23.99, 85.62],
    Chouparan: [24.38, 84.98],
    Ichak: [24.05, 85.18],
    Katkamsandi: [24.05, 85.26],
    Keredari: [23.82, 85.35],
  },

  Giridih: {
    Giridih: [24.1855, 86.3005],
    Bagodar: [24.25, 85.9],
    Dhanwar: [24.42, 85.98],
    Dumri: [24.0, 86.3],
    Jamua: [24.48, 86.0],
    Gandey: [24.15, 86.4],
  },

  Deoghar: {
    Deoghar: [24.4927, 86.6997],
    Madhupur: [24.27, 86.64],
    Mohanpur: [24.45, 86.75],
    Sarath: [24.35, 86.85],
  },

  Khunti: {
    Khunti: [23.076, 85.278],
    Torpa: [22.98, 85.1],
    Murhu: [23.08, 85.17],
    Karra: [23.15, 85.05],
  },

  Ramgarh: {
    Ramgarh: [23.63, 85.56],
    Mandu: [23.75, 85.5],
    Gola: [23.53, 85.67],
    Patratu: [23.67, 85.29],
  },
};

const DEFAULT_POSITION = [23.3441, 85.3096];

// ============================================================
// MAP COMPONENTS
// ============================================================

function LocationClickHandler({ onLocationChange }) {
  useMapEvents({
    click(event) {
      onLocationChange(
        event.latlng.lat,
        event.latlng.lng,
        true
      );
    },
  });

  return null;
}

function MapController({ position, zoom = 13 }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.flyTo(position, zoom, {
      duration: 1.2,
    });
  }, [position, zoom, map]);

  return null;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function SubmitProblem() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    district: "",
    block: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  const [selectedPosition, setSelectedPosition] = useState(null);
  const [mapZoom, setMapZoom] = useState(10);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [locationError, setLocationError] = useState("");

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ============================================================
  // AVAILABLE BLOCKS
  // ============================================================

  const availableBlocks = useMemo(() => {
    if (!formData.district) {
      return [];
    }

    return districtBlocks[formData.district] || [];
  }, [formData.district]);

  // ============================================================
  // DISPLAY DISTRICT NAME
  // ============================================================

  const displayDistrictName = (district) => {
    return district
      .replace("EastSinghbhum", "East Singhbhum")
      .replace("WestSinghbhum", "West Singhbhum")
      .replace(
        "SeraikelaKharsawan",
        "Seraikela Kharsawan"
      );
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "district") {
      setFormData((prev) => ({
        ...prev,
        district: value,
        block: "",
      }));

      setSelectedPosition(null);
      setLocationError("");

      if (value) {
        const center =
          districtCenters[value] || DEFAULT_POSITION;

        setSelectedPosition(center);
        setMapZoom(10);

        setFormData((prev) => ({
          ...prev,
          district: value,
          block: "",
          latitude: center[0],
          longitude: center[1],
        }));
      }

      return;
    }

    if (name === "block") {
      setFormData((prev) => ({
        ...prev,
        block: value,
      }));

      setLocationError("");

      if (!value || !formData.district) {
        return;
      }

      const district = formData.district;

      const position =
        blockCenters[district]?.[value] ||
        districtCenters[district] ||
        DEFAULT_POSITION;

      setSelectedPosition(position);
      setMapZoom(14);

      setFormData((prev) => ({
        ...prev,
        block: value,
        latitude: position[0],
        longitude: position[1],
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // IMAGE UPLOAD
  // ============================================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 6) {
      alert("You can upload maximum 6 images.");
      e.target.value = "";
      return;
    }

    const newFiles = [...images, ...files];
    setImages(newFiles);

    setImagePreviews(
      newFiles.map((file) => URL.createObjectURL(file))
    );

    e.target.value = "";
  };

  // ============================================================
  // VIDEO UPLOAD
  // ============================================================

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length + videos.length > 2) {
      alert("You can upload maximum 2 videos.");
      e.target.value = "";
      return;
    }

    const newFiles = [...videos, ...files];
    setVideos(newFiles);

    setVideoPreviews(
      newFiles.map((file) => URL.createObjectURL(file))
    );

    e.target.value = "";
  };

  // ============================================================
  // CLEANUP PREVIEWS
  // ============================================================

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) =>
        URL.revokeObjectURL(url)
      );

      videoPreviews.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [imagePreviews, videoPreviews]);

  // ============================================================
  // REVERSE GEOCODING
  // ============================================================

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            format: "jsonv2",
            lat: latitude,
            lon: longitude,
            zoom: 18,
            addressdetails: 1,
          },
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.data?.display_name) {
        setFormData((prev) => ({
          ...prev,
          address: response.data.display_name,
        }));
      }
    } catch (error) {
      console.error(
        "Reverse geocoding failed:",
        error
      );
    }
  };

  // ============================================================
  // UPDATE EXACT LOCATION
  // ============================================================

  const updateLocation = async (
    latitude,
    longitude,
    shouldReverseGeocode = true
  ) => {
    const position = [latitude, longitude];

    setSelectedPosition(position);
    setMapZoom(17);

    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));

    setLocationError("");

    if (shouldReverseGeocode) {
      await reverseGeocode(latitude, longitude);
    }
  };

  // ============================================================
  // CURRENT LOCATION
  // ============================================================

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await updateLocation(
          position.coords.latitude,
          position.coords.longitude,
          true
        );

        setLocationLoading(false);
      },
      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location could not be determined."
          );
        } else if (error.code === 3) {
          setLocationError(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationError(
            "Unable to get your current location."
          );
        }

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = async () => {
    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    setSearchLoading(true);
    setSearchResults([]);
    setLocationError("");

    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            format: "jsonv2",
            q: query,
            limit: 5,
            addressdetails: 1,
          },
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (
        !response.data ||
        response.data.length === 0
      ) {
        setLocationError(
          "No location found. Try a more specific search."
        );
      } else {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error(
        "Location search failed:",
        error
      );

      setLocationError(
        "Location search failed. Please try again."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  // ============================================================
  // SEARCH RESULT
  // ============================================================

  const handleSearchResult = async (result) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    setSearchResults([]);

    setSearchQuery(result.display_name || "");

    await updateLocation(
      latitude,
      longitude,
      false
    );

    setFormData((prev) => ({
      ...prev,
      address: result.display_name || "",
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a problem title.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please describe the problem.");
      return;
    }

    if (!formData.district) {
      alert("Please select a district.");
      return;
    }

    if (!formData.block) {
      alert("Please select a block.");
      return;
    }

    if (!selectedPosition) {
      alert(
        "Please pin the exact problem location on the map."
      );
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("title", formData.title);
      data.append(
        "description",
        formData.description
      );
      data.append("category", "Other");
      data.append("district", formData.district);
      data.append("block", formData.block);

      data.append(
        "location",
        JSON.stringify({
          address: formData.address || "",
          latitude: formData.latitude,
          longitude: formData.longitude,
        })
      );

      // Images
      images.forEach((file) => {
        data.append("media", file);
      });

      // Videos
      videos.forEach((file) => {
        data.append("media", file);
      });

      const response = await api.post(
        "/problems",
        data
      );

      if (response.data?.success) {
        navigate("/citizen/problems");
      }
    } catch (error) {
      console.error(
        "Submit problem error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to report problem. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">
          Report a Problem
        </h1>

        <p className="mt-2 text-text-secondary">
          Help improve your community by
          reporting a problem.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* ================================================== */}
        {/* PROBLEM INFORMATION */}
        {/* ================================================== */}

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text mb-6">
            Problem Information
          </h2>

          <div className="space-y-5">
            {/* Title */}

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Problem Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Large pothole near main road"
                maxLength={150}
                className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Description */}

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the problem in detail..."
                rows={5}
                maxLength={5000}
                className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none"
              />

              <p className="text-xs text-text-secondary mt-1">
                {formData.description.length}
                /5000
              </p>
            </div>

          </div>
        </div>

        {/* ================================================== */}
        {/* LOCATION */}
        {/* ================================================== */}

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text mb-2">
            Problem Location
          </h2>

          <p className="text-sm text-text-secondary mb-6">
            First select your district and
            block. The map will automatically
            move to that area. Then pin the exact
            problem location.
          </p>

          {/* DISTRICT + BLOCK */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* District */}

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                District *
              </label>

              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">
                  Select district
                </option>

                {districts.map((district) => (
                  <option
                    key={district}
                    value={district}
                  >
                    {displayDistrictName(
                      district
                    )}
                  </option>
                ))}
              </select>
            </div>

            {/* Block */}

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Block *
              </label>

              <select
                name="block"
                value={formData.block}
                onChange={handleChange}
                disabled={!formData.district}
                className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {formData.district
                    ? "Select block"
                    : "Select district first"}
                </option>

                {availableBlocks.map((block) => (
                  <option
                    key={block}
                    value={block}
                  >
                    {block}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SELECTED AREA MESSAGE */}

          {formData.district &&
            formData.block && (
              <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  📍 Showing{" "}
                  <strong>
                    {formData.block}
                  </strong>
                  ,{" "}
                  <strong>
                    {displayDistrictName(
                      formData.district
                    )}
                  </strong>
                  .
                </p>

                <p className="text-xs text-blue-700 mt-1">
                  Click on the map to select
                  the exact location of the
                  problem.
                </p>
              </div>
            )}

          {/* SEARCH + CURRENT LOCATION */}

          <div className="mt-5">
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Search road, landmark, village..."
                className="flex-1 px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="button"
                onClick={handleSearch}
                disabled={
                  searchLoading ||
                  !searchQuery.trim()
                }
                className="px-5 py-3 rounded-xl border border-border bg-gray-50 hover:bg-gray-100 disabled:opacity-50 font-medium"
              >
                {searchLoading
                  ? "Searching..."
                  : "Search"}
              </button>

              <button
                type="button"
                onClick={
                  handleCurrentLocation
                }
                disabled={locationLoading}
                className="px-5 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-60"
              >
                {locationLoading
                  ? "Finding..."
                  : "📍 Current Location"}
              </button>
            </div>

            {/* SEARCH RESULTS */}

            {searchResults.length > 0 && (
              <div className="relative z-[1000] mt-2 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
                {searchResults.map(
                  (result, index) => (
                    <button
                      key={`${result.place_id}-${index}`}
                      type="button"
                      onClick={() =>
                        handleSearchResult(
                          result
                        )
                      }
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-border last:border-b-0"
                    >
                      <p className="text-sm text-text">
                        {
                          result.display_name
                        }
                      </p>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* LOCATION ERROR */}

          {locationError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {locationError}
            </div>
          )}

          {/* MAP */}

          <div className="mt-5 rounded-2xl overflow-hidden border border-border">
            <MapContainer
              center={DEFAULT_POSITION}
              zoom={10}
              scrollWheelZoom={true}
              style={{
                height: "450px",
                width: "100%",
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <LocationClickHandler
                onLocationChange={
                  updateLocation
                }
              />

              <MapController
                position={selectedPosition}
                zoom={mapZoom}
              />

              {selectedPosition && (
                <Marker
                  position={selectedPosition}
                  draggable={true}
                  eventHandlers={{
                    dragend: async (event) => {
                      const marker =
                        event.target;

                      const position =
                        marker.getLatLng();

                      await updateLocation(
                        position.lat,
                        position.lng,
                        true
                      );
                    },
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>
                        Problem Location
                      </strong>

                      <br />

                      Drag this pin to
                      adjust the exact
                      location.
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* MAP INSTRUCTION */}

          <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-border">
            <p className="text-sm font-medium text-text">
              📌 Pin the exact location
            </p>

            <p className="text-xs text-text-secondary mt-1">
              Click directly on the map where
              the problem exists. You can also
              drag the pin to fine-tune it.
            </p>
          </div>

          {/* ADDRESS */}

          <div className="mt-5">
            <label className="block text-sm font-medium text-text mb-2">
              Detected Address
            </label>

            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder="Address will appear after selecting the exact location."
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* COORDINATES */}

          {selectedPosition && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-border">
                <p className="text-xs text-text-secondary">
                  Latitude
                </p>

                <p className="font-medium text-text mt-1">
                  {Number(
                    formData.latitude
                  ).toFixed(6)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-border">
                <p className="text-xs text-text-secondary">
                  Longitude
                </p>

                <p className="font-medium text-text mt-1">
                  {Number(
                    formData.longitude
                  ).toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* EVIDENCE */}
        {/* ================================================== */}

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text">
            Evidence
          </h2>

          <p className="text-sm text-text-secondary mt-1 mb-6">
            Add photos or videos showing the
            problem.
          </p>

          {/* PHOTOS */}

          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Photos
            </label>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
              className="w-full border-2 border-dashed border-border rounded-2xl p-8 hover:border-primary hover:bg-blue-50/30 transition cursor-pointer text-center"
            >
              <div className="text-4xl mb-3">
                📷
              </div>

              <p className="font-semibold text-text">
                Click to upload photos
              </p>

              <p className="text-sm text-text-secondary mt-1">
                JPG, PNG or WEBP
              </p>

              <p className="text-xs text-text-secondary mt-2">
                Maximum 6 images
              </p>
            </button>

            {/* PHOTO PREVIEWS */}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">
                {imagePreviews.map(
                  (preview, index) => (
                    <div
                      key={preview}
                      className="relative aspect-video rounded-xl overflow-hidden border border-border bg-gray-100"
                    >
                      <img
                        src={preview}
                        alt={`Problem photo ${index + 1
                          }`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* VIDEOS */}

          <div className="mt-8">
            <label className="block text-sm font-medium text-text mb-3">
              Videos
            </label>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              multiple
              onChange={handleVideoChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                videoInputRef.current?.click()
              }
              className="w-full border-2 border-dashed border-border rounded-2xl p-8 hover:border-primary hover:bg-blue-50/30 transition cursor-pointer text-center"
            >
              <div className="text-4xl mb-3">
                🎥
              </div>

              <p className="font-semibold text-text">
                Click to upload videos
              </p>

              <p className="text-sm text-text-secondary mt-1">
                MP4, MOV or WEBM
              </p>

              <p className="text-xs text-text-secondary mt-2">
                Maximum 2 videos · Maximum 50MB
                each
              </p>
            </button>

            {/* VIDEO PREVIEWS */}

            {videoPreviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {videoPreviews.map(
                  (preview, index) => (
                    <div
                      key={preview}
                      className="rounded-xl overflow-hidden border border-border bg-black"
                    >
                      <video
                        src={preview}
                        controls
                        className="w-full aspect-video"
                      />

                      <div className="bg-gray-900 text-white px-3 py-2 text-xs">
                        Video {index + 1}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* SUBMIT */}
        {/* ================================================== */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-60 transition"
          >
            {loading
              ? "Submitting..."
              : "Report Problem"}
          </button>
        </div>
      </form>
    </div>
  );
}