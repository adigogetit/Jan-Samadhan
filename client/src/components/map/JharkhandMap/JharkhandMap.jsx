import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    MapContainer,
    TileLayer,
    GeoJSON,
    ZoomControl,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import jharkhandGeoJSONRaw from "../../../assets/maps/jharkhand.geojson?raw";

// ============================================================
// DISTRICT NAME NORMALIZER
// ============================================================

const normalizeDistrict = (name = "") => {
    return name
        .toString()
        .trim()
        .toLowerCase()
        .replace(/district/g, "")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ");
};

// ============================================================
// GET DISTRICT NAME FROM GEOJSON
// ============================================================

const getDistrictName = (feature) => {
    const properties = feature?.properties || {};

    return (
        properties.Dist_Name ||
        properties.dist_name ||
        properties.district ||
        properties.DISTRICT ||
        properties.District ||
        properties.dtname ||
        properties.DT_NAME ||
        properties.NAME_2 ||
        properties.name ||
        properties.NAME ||
        "Unknown District"
    );
};

// ============================================================
// MAP COMPONENT
// ============================================================

const JharkhandMap = ({
    districts = [],
    selectedDistrict = "",
    onDistrictSelect,
    statusFilter = "All",
}) => {
    const [mapReady, setMapReady] = useState(false);

    const jharkhandGeoJSON = useMemo(() => {
        try {
            return JSON.parse(jharkhandGeoJSONRaw || "{}");
        } catch (error) {
            console.error("Invalid Jharkhand GeoJSON:", error);
            return { type: "FeatureCollection", features: [] };
        }
    }, []);

    // ----------------------------------------------------------
    // DISTRICT LOOKUP
    // ----------------------------------------------------------

    const districtLookup = useMemo(() => {
        const lookup = {};

        districts.forEach((district) => {
            if (!district?.district) {
                return;
            }

            lookup[normalizeDistrict(district.district)] =
                district;
        });

        return lookup;
    }, [districts]);

    // ----------------------------------------------------------
    // MAP READY
    // ----------------------------------------------------------

    useEffect(() => {
        if (jharkhandGeoJSON) {
            setMapReady(true);
        }
    }, []);

    // ----------------------------------------------------------
    // GET DISTRICT DATA
    // ----------------------------------------------------------

    const getDistrictData = (name) => {
        return (
            districtLookup[normalizeDistrict(name)] ||
            null
        );
    };

    // ----------------------------------------------------------
    // GET FILTERED COUNT
    // ----------------------------------------------------------

    const getFilteredCount = (data) => {
        if (!data) {
            return 0;
        }

        switch (statusFilter) {
            case "Pending":
                return data.pending || 0;

            case "Under Review":
                return data.underReview || 0;

            case "Validated":
                return data.validated || 0;

            case "In Progress":
                return data.inProgress || 0;

            case "Resolved":
                return data.resolved || 0;

            default:
                return data.total || 0;
        }
    };

    // ----------------------------------------------------------
    // GET MAX COUNT
    // ----------------------------------------------------------

    const maxCount = useMemo(() => {
        if (!districts.length) {
            return 1;
        }

        return Math.max(
            ...districts.map((district) =>
                getFilteredCount(district)
            ),
            1
        );
    }, [districts, statusFilter]);

    // ----------------------------------------------------------
    // COLOR SCALE
    // ----------------------------------------------------------

    const getDistrictColor = (count) => {
        if (count <= 0) {
            return "#E8F1F7";
        }

        const ratio = count / maxCount;

        if (ratio <= 0.2) {
            return "#C5DDEA";
        }

        if (ratio <= 0.4) {
            return "#8DB8D0";
        }

        if (ratio <= 0.6) {
            return "#4D91B8";
        }

        if (ratio <= 0.8) {
            return "#2F82AD";
        }

        return "#2477B5";
    };

    // ----------------------------------------------------------
    // FEATURE STYLE
    // ----------------------------------------------------------

    const styleFeature = (feature) => {
        const districtName =
            getDistrictName(feature);

        const data =
            getDistrictData(districtName);

        const count =
            getFilteredCount(data);

        const isSelected =
            selectedDistrict &&
            normalizeDistrict(selectedDistrict) ===
            normalizeDistrict(districtName);

        return {
            fillColor: getDistrictColor(count),
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: isSelected
                ? "#172B3A"
                : "#FFFFFF",
            fillOpacity: isSelected ? 0.92 : 0.78,
        };
    };

    // ----------------------------------------------------------
    // FEATURE EVENTS
    // ----------------------------------------------------------

    const onEachFeature = (feature, layer) => {
        const districtName =
            getDistrictName(feature);

        const data =
            getDistrictData(districtName);

        const count =
            getFilteredCount(data);

        const total =
            data?.total || 0;

        const resolved =
            data?.resolved || 0;

        const resolutionRate =
            data?.resolutionRate || 0;

        layer.bindTooltip(
            `
        <div style="
          min-width: 190px;
          font-family: Inter, Arial, sans-serif;
        ">
          <div style="
            font-weight: 700;
            font-size: 14px;
            color: #172B3A;
            margin-bottom: 7px;
          ">
            ${districtName}
          </div>

          <div style="
            font-size: 12px;
            color: #64748B;
            margin-bottom: 4px;
          ">
            ${statusFilter === "All"
                ? "Total Problems"
                : statusFilter
            }:
            <strong style="color:#172B3A">
              ${count}
            </strong>
          </div>

          <div style="
            font-size: 12px;
            color: #64748B;
            margin-bottom: 4px;
          ">
            Total:
            <strong style="color:#172B3A">
              ${total}
            </strong>
          </div>

          <div style="
            font-size: 12px;
            color: #64748B;
          ">
            Resolution:
            <strong style="color:#2477B5">
              ${resolutionRate}%
            </strong>
          </div>
        </div>
      `,
            {
                sticky: true,
                direction: "top",
            }
        );

        layer.on({
            click: () => {
                if (onDistrictSelect) {
                    onDistrictSelect(districtName);
                }
            },

            mouseover: (event) => {
                const target = event.target;

                target.setStyle({
                    weight: 3,
                    color: "#172B3A",
                    fillOpacity: 0.95,
                });

                target.bringToFront();
            },

            mouseout: (event) => {
                const target = event.target;

                target.setStyle(
                    styleFeature(feature)
                );
            },
        });
    };

    // ----------------------------------------------------------
    // LOADING
    // ----------------------------------------------------------

    if (!mapReady) {
        return (
            <div className="w-full h-[560px] rounded-2xl bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-slate-300 border-t-[#2477B5] rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-sm text-slate-600">
                        Loading Jharkhand GIS map...
                    </p>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------
    // MAP
    // ----------------------------------------------------------

    return (
        <div className="relative w-full h-[560px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">

            <MapContainer
                center={[23.61, 85.28]}
                zoom={7}
                minZoom={6}
                maxZoom={10}
                scrollWheelZoom={true}
                zoomControl={false}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <GeoJSON
                    key={`${statusFilter}-${selectedDistrict}`}
                    data={jharkhandGeoJSON}
                    style={styleFeature}
                    onEachFeature={onEachFeature}
                />

                <ZoomControl position="bottomright" />
            </MapContainer>

            {/* MAP HEADER */}

            <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-md px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2477B5]">
                    Jharkhand GIS
                </p>

                <p className="text-sm font-semibold text-[#172B3A]">
                    Civic Problem Intelligence
                </p>
            </div>

            {/* MAP INSTRUCTION */}

            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-md px-3 py-2">
                <p className="text-[11px] text-slate-500">
                    Click a district to explore
                </p>
            </div>

            {/* LEGEND */}

            <div className="absolute bottom-5 left-5 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-md p-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                    {statusFilter === "All"
                        ? "Problem Density"
                        : statusFilter}
                </p>

                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">
                        Low
                    </span>

                    <span className="w-5 h-3 rounded-sm bg-[#E8F1F7]" />
                    <span className="w-5 h-3 rounded-sm bg-[#C5DDEA]" />
                    <span className="w-5 h-3 rounded-sm bg-[#8DB8D0]" />
                    <span className="w-5 h-3 rounded-sm bg-[#4D91B8]" />
                    <span className="w-5 h-3 rounded-sm bg-[#2477B5]" />

                    <span className="text-[10px] text-slate-500">
                        High
                    </span>
                </div>
            </div>
        </div>
    );
};

export default JharkhandMap;