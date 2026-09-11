import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import JharkhandMap from "../../components/map/JharkhandMap/JharkhandMap";
import DistrictCard from "../../components/map/DistrictCard/DistrictCard";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (date) => {
  if (!date) return "Unknown date";

  try {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "Unknown date";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "Resolved":
      return "bg-green-50 text-green-700 border-green-200";

    case "In Progress":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "Under Review":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "Validated":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200";

    case "Duplicate":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const getPriorityClass = (priority) => {
  switch (priority) {
    case "Critical":
      return "text-red-600";

    case "High":
      return "text-orange-600";

    case "Medium":
      return "text-amber-600";

    default:
      return "text-slate-500";
  }
};

// ============================================================
// LANDING PAGE
// ============================================================

const LandingPage = () => {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedDistrict, setSelectedDistrict] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ----------------------------------------------------------
  // FETCH PUBLIC DATA
  // ----------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadPublicData = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/problems/public"
          );

        if (cancelled) return;

        if (!response.data?.success) {
          throw new Error(
            "Unable to load civic data."
          );
        }

        setData(response.data);
      } catch (err) {
        console.error(
          "Landing page data error:",
          err
        );

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load JAN-SAMADHAN civic data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPublicData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const stats = data?.stats || {
    total: 0,
    pending: 0,
    underReview: 0,
    validated: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    duplicate: 0,
    active: 0,
    resolutionRate: 0,
  };

  const districts =
    data?.districts || [];

  const categories =
    data?.categories || [];

  const recentProblems =
    data?.recentProblems || [];

  // ----------------------------------------------------------
  // FILTERED RECENT PROBLEMS
  // ----------------------------------------------------------

  const filteredProblems = useMemo(() => {
    let result = [...recentProblems];

    if (
      statusFilter &&
      statusFilter !== "All"
    ) {
      result = result.filter(
        (problem) =>
          problem.status ===
          statusFilter
      );
    }

    if (
      categoryFilter &&
      categoryFilter !== "All"
    ) {
      result = result.filter(
        (problem) =>
          problem.category ===
          categoryFilter
      );
    }

    if (selectedDistrict) {
      result = result.filter(
        (problem) =>
          problem.district ===
          selectedDistrict
      );
    }

    if (searchQuery.trim()) {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      result = result.filter(
        (problem) =>
          problem.title
            ?.toLowerCase()
            .includes(query) ||
          problem.district
            ?.toLowerCase()
            .includes(query) ||
          problem.category
            ?.toLowerCase()
            .includes(query)
      );
    }

    return result;
  }, [
    recentProblems,
    statusFilter,
    categoryFilter,
    selectedDistrict,
    searchQuery,
  ]);

  // ----------------------------------------------------------
  // SELECTED DISTRICT
  // ----------------------------------------------------------

  const selectedDistrictData =
    useMemo(() => {
      if (!selectedDistrict) {
        return null;
      }

      return (
        districts.find(
          (district) =>
            district.district ===
            selectedDistrict
        ) || null
      );
    }, [
      districts,
      selectedDistrict,
    ]);

  // ----------------------------------------------------------
  // TOP DISTRICTS
  // ----------------------------------------------------------

  const topDistricts =
    useMemo(() => {
      return [...districts]
        .sort(
          (a, b) =>
            (b.total || 0) -
            (a.total || 0)
        )
        .slice(0, 8);
    }, [districts]);

  // ----------------------------------------------------------
  // TOP CATEGORIES
  // ----------------------------------------------------------

  const topCategories =
    useMemo(() => {
      return [...categories]
        .sort(
          (a, b) =>
            (b.count || 0) -
            (a.count || 0)
        )
        .slice(0, 8);
    }, [categories]);

  // ----------------------------------------------------------
  // STATUS FILTERS
  // ----------------------------------------------------------

  const statusFilters = [
    "All",
    "Pending",
    "Under Review",
    "Validated",
    "In Progress",
    "Resolved",
  ];

  // ----------------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------------

  const scrollTo = (id) => {
    const element =
      document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setMobileMenuOpen(false);
  };

  // ----------------------------------------------------------
  // RESET FILTERS
  // ----------------------------------------------------------

  const resetFilters = () => {
    setSelectedDistrict("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setSearchQuery("");
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2477B5] rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-slate-600">
            Loading Jharkhand civic intelligence...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto text-2xl">
            !
          </div>

          <h1 className="text-xl font-bold text-[#172B3A] mt-4">
            Civic data unavailable
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 px-5 py-2.5 rounded-lg bg-[#2477B5] text-white text-sm font-semibold hover:bg-[#1d659b] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#172B3A]">
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-[2000] bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8">
          <div className="h-[72px] flex items-center justify-between">
            {/* LOGO */}

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2477B5] text-white flex items-center justify-center font-bold">
                JS
              </div>

              <div className="text-left">
                <p className="font-bold text-lg leading-none">
                  JAN-SAMADHAN
                </p>

                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 mt-1">
                  Jharkhand Civic Intelligence
                </p>
              </div>
            </button>

            {/* DESKTOP NAV */}

            <nav className="hidden md:flex items-center gap-7">
              <button
                onClick={() =>
                  scrollTo("explore")
                }
                className="text-sm text-slate-600 hover:text-[#2477B5]"
              >
                Explore
              </button>

              <button
                onClick={() =>
                  scrollTo("problems")
                }
                className="text-sm text-slate-600 hover:text-[#2477B5]"
              >
                Problems
              </button>

              <button
                onClick={() =>
                  scrollTo("how-it-works")
                }
                className="text-sm text-slate-600 hover:text-[#2477B5]"
              >
                How It Works
              </button>

              <button
                onClick={() =>
                  scrollTo("about")
                }
                className="text-sm text-slate-600 hover:text-[#2477B5]"
              >
                About
              </button>
            </nav>

            {/* ACTIONS */}

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() =>
                  navigate("/login")
                }
                className="px-4 py-2.5 text-sm font-semibold text-[#172B3A] hover:text-[#2477B5]"
              >
                Login
              </button>

              <button
                onClick={() =>
                  navigate("/login")
                }
                className="px-5 py-2.5 rounded-lg bg-[#2477B5] text-white text-sm font-semibold hover:bg-[#1d659b] transition"
              >
                Report a Problem
              </button>
            </div>

            {/* MOBILE */}

            <button
              onClick={() =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
              }
              className="md:hidden w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-xl"
            >
              {mobileMenuOpen
                ? "×"
                : "☰"}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 py-4 space-y-2">
              <button
                onClick={() =>
                  scrollTo("explore")
                }
                className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
              >
                Explore
              </button>

              <button
                onClick={() =>
                  scrollTo("problems")
                }
                className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
              >
                Problems
              </button>

              <button
                onClick={() =>
                  scrollTo("how-it-works")
                }
                className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
              >
                How It Works
              </button>

              <button
                onClick={() =>
                  navigate("/login")
                }
                className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#2477B5]/5" />

          <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-[#2477B5]/5" />
        </div>

        <div className="relative max-w-[1500px] mx-auto px-5 sm:px-8 py-20 lg:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2477B5]/5 border border-[#2477B5]/10 text-[#2477B5] text-xs font-semibold uppercase tracking-[0.12em]">
              Jharkhand Civic Intelligence
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              See the problem.
              <br />
              <span className="text-[#2477B5]">
                Track the action.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl">
              JAN-SAMADHAN connects citizens,
              government and institutions through
              a transparent civic problem reporting
              and resolution system for Jharkhand.
            </p>

            {/* SEARCH */}

            <div className="mt-8 max-w-2xl">
              <div className="flex items-center bg-white border border-slate-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#2477B5]/20 focus-within:border-[#2477B5] overflow-hidden">
                <span className="pl-4 text-slate-400">
                  ⌕
                </span>

                <input
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search problems, districts or categories..."
                  className="flex-1 px-3 py-4 outline-none text-sm text-[#172B3A]"
                />

                {searchQuery && (
                  <button
                    onClick={() =>
                      setSearchQuery("")
                    }
                    className="px-4 text-slate-400 hover:text-slate-700"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  navigate("/login")
                }
                className="px-6 py-3 rounded-lg bg-[#2477B5] text-white font-semibold text-sm hover:bg-[#1d659b] transition"
              >
                Report a Problem
              </button>

              <button
                onClick={() =>
                  scrollTo("explore")
                }
                className="px-6 py-3 rounded-lg bg-white border border-slate-300 text-[#172B3A] font-semibold text-sm hover:border-[#2477B5] hover:text-[#2477B5] transition"
              >
                Explore Jharkhand
              </button>
            </div>
          </div>

          {/* HERO STATS */}

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-5 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
            <div className="bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Problems
              </p>

              <p className="text-3xl font-bold mt-2">
                {stats.total}
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs text-slate-500">
                Pending
              </p>

              <p className="text-3xl font-bold mt-2 text-amber-600">
                {stats.pending}
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs text-slate-500">
                Active
              </p>

              <p className="text-3xl font-bold mt-2 text-[#2477B5]">
                {stats.active}
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs text-slate-500">
                Resolved
              </p>

              <p className="text-3xl font-bold mt-2 text-green-600">
                {stats.resolved}
              </p>
            </div>

            <div className="bg-white p-5 col-span-2 lg:col-span-1">
              <p className="text-xs text-slate-500">
                Resolution Rate
              </p>

              <p className="text-3xl font-bold mt-2">
                {stats.resolutionRate}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          EXPLORE / GIS
      ====================================================== */}

      <section
        id="explore"
        className="max-w-[1500px] mx-auto px-5 sm:px-8 py-20"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2477B5]">
              Explore Jharkhand
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold mt-2">
              Civic problems across the state
            </h2>

            <p className="text-slate-500 mt-3 max-w-2xl">
              Explore district-level civic activity
              and understand where problems are being
              reported and how they are progressing.
            </p>
          </div>

          {selectedDistrict && (
            <button
              onClick={() =>
                setSelectedDistrict("")
              }
              className="self-start lg:self-auto px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold hover:border-[#2477B5] hover:text-[#2477B5]"
            >
              Clear District
            </button>
          )}
        </div>

        {/* STATUS FILTERS */}

        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map(
            (status) => (
              <button
                key={status}
                onClick={() =>
                  setStatusFilter(
                    status
                  )
                }
                className={`px-4 py-2 rounded-lg border text-xs font-semibold transition ${
                  statusFilter ===
                  status
                    ? "bg-[#2477B5] border-[#2477B5] text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-[#2477B5] hover:text-[#2477B5]"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* MAP */}

          <JharkhandMap
            districts={districts}
            selectedDistrict={
              selectedDistrict
            }
            onDistrictSelect={
              setSelectedDistrict
            }
            statusFilter={
              statusFilter
            }
          />

          {/* DISTRICT CARD */}

          <DistrictCard
            district={
              selectedDistrictData
            }
            onClose={() =>
              setSelectedDistrict("")
            }
          />
        </div>
      </section>

      {/* ======================================================
          DISTRICT OVERVIEW
      ====================================================== */}

      <section className="bg-white border-y border-slate-200">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 py-20">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2477B5]">
              District Intelligence
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Where are problems being reported?
            </h2>

            <p className="text-slate-500 mt-3">
              District rankings are calculated from
              live complaint data.
            </p>
          </div>

          {topDistricts.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <p className="text-slate-500">
                No district data available yet.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topDistricts.map(
                (district) => (
                  <button
                    key={
                      district.district
                    }
                    onClick={() => {
                      setSelectedDistrict(
                        district.district
                      );

                      scrollTo(
                        "explore"
                      );
                    }}
                    className="text-left bg-[#F7FAFC] border border-slate-200 rounded-xl p-5 hover:border-[#2477B5] hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {district.district}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {district.resolutionRate ||
                            0}
                          % resolution
                        </p>
                      </div>

                      <span className="text-xl font-bold text-[#2477B5]">
                        {district.total ||
                          0}
                      </span>
                    </div>

                    <div className="mt-4 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-[#2477B5] rounded-full"
                        style={{
                          width: `${Math.min(
                            district.resolutionRate ||
                              0,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-[11px] text-slate-500">
                      <span>
                        Active{" "}
                        {(district.pending ||
                          0) +
                          (district.underReview ||
                            0) +
                          (district.validated ||
                            0) +
                          (district.inProgress ||
                            0)}
                      </span>

                      <span>
                        Resolved{" "}
                        {district.resolved ||
                          0}
                      </span>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 sm:px-8 py-20">
        <div className="flex items-end justify-between gap-5 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2477B5]">
              Civic Categories
            </p>

            <h2 className="text-3xl font-bold mt-2">
              What citizens are reporting
            </h2>
          </div>

          {categoryFilter !==
            "All" && (
            <button
              onClick={() =>
                setCategoryFilter(
                  "All"
                )
              }
              className="text-sm text-[#2477B5] font-semibold"
            >
              Clear filter
            </button>
          )}
        </div>

        {topCategories.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <p className="text-slate-500">
              No category data available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {topCategories.map(
              (item) => {
                const isActive =
                  categoryFilter ===
                  item.category;

                const percentage =
                  stats.total > 0
                    ? (
                        (item.count /
                          stats.total) *
                        100
                      ).toFixed(1)
                    : 0;

                return (
                  <button
                    key={
                      item.category
                    }
                    onClick={() =>
                      setCategoryFilter(
                        isActive
                          ? "All"
                          : item.category
                      )
                    }
                    className={`text-left rounded-xl p-5 border transition ${
                      isActive
                        ? "border-[#2477B5] bg-[#2477B5]/5"
                        : "border-slate-200 bg-white hover:border-[#2477B5]"
                    }`}
                  >
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-sm">
                        {item.category}
                      </span>

                      <span className="text-lg font-bold text-[#2477B5]">
                        {item.count}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      {percentage}% of
                      reported problems
                    </p>

                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2477B5] rounded-full"
                        style={{
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* ======================================================
          RECENT PROBLEMS
      ====================================================== */}

      <section
        id="problems"
        className="bg-white border-y border-slate-200"
      >
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 py-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2477B5]">
                Public Problem Feed
              </p>

              <h2 className="text-3xl font-bold mt-2">
                Recently reported problems
              </h2>

              <p className="text-slate-500 mt-3">
                A public view of recently reported
                civic issues across Jharkhand.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {categoryFilter !==
                "All" && (
                <span className="px-3 py-1.5 rounded-full bg-[#2477B5]/5 text-[#2477B5] text-xs font-semibold">
                  {categoryFilter}
                </span>
              )}

              {selectedDistrict && (
                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  {selectedDistrict}
                </span>
              )}
            </div>
          </div>

          {filteredProblems.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <p className="font-semibold text-[#172B3A]">
                No matching public problems
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Try changing your filters.
              </p>

              <button
                onClick={
                  resetFilters
                }
                className="mt-4 text-sm font-semibold text-[#2477B5]"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProblems.map(
                (problem) => (
                  <article
                    key={
                      problem._id
                    }
                    className="rounded-xl border border-slate-200 bg-[#F7FAFC] p-5 hover:border-[#2477B5]/40 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-semibold ${getStatusClass(
                          problem.status
                        )}`}
                      >
                        {problem.status ||
                          "Pending"}
                      </span>

                      <span
                        className={`text-[10px] font-semibold ${getPriorityClass(
                          problem.priority
                        )}`}
                      >
                        {problem.priority ||
                          "Medium"}
                      </span>
                    </div>

                    <h3 className="font-bold mt-4 line-clamp-2">
                      {problem.title}
                    </h3>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          District
                        </span>

                        <span className="font-medium text-slate-700">
                          {problem.district ||
                            "—"}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs gap-4">
                        <span className="text-slate-500">
                          Category
                        </span>

                        <span className="font-medium text-slate-700 text-right">
                          {problem.category ||
                            "—"}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          Reported
                        </span>

                        <span className="font-medium text-slate-700">
                          {formatDate(
                            problem.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"
        className="max-w-[1500px] mx-auto px-5 sm:px-8 py-20"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2477B5]">
            How JAN-SAMADHAN Works
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold mt-2">
            From citizen observation to
            measurable resolution
          </h2>

          <p className="text-slate-500 mt-4 leading-relaxed">
            Every reported problem follows a
            transparent journey from submission to
            government action and resolution.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              number: "01",
              title: "Report",
              description:
                "A citizen reports a local problem with its category and location.",
            },
            {
              number: "02",
              title: "Smart Routing",
              description:
                "The selected problem category automatically routes the complaint to the relevant government department.",
            },
            {
              number: "03",
              title: "Government Action",
              description:
                "Government reviews, validates and works on the reported problem.",
            },
            {
              number: "04",
              title: "Resolution",
              description:
                "The complaint progresses through its status journey until it is resolved or appropriately closed.",
            },
          ].map(
            (step) => (
              <div
                key={step.number}
                className="bg-white border border-slate-200 rounded-xl p-6"
              >
                <span className="text-xs font-bold text-[#2477B5]">
                  {step.number}
                </span>

                <h3 className="text-lg font-bold mt-4">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mt-2">
                  {step.description}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* ======================================================
          STATE PERFORMANCE
      ====================================================== */}

      <section className="bg-[#172B3A] text-white">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 py-20">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                State Performance
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold mt-3">
                Turning civic problems into
                measurable action.
              </h2>

              <p className="text-slate-300 mt-5 leading-relaxed max-w-xl">
                JAN-SAMADHAN creates a transparent
                public view of the problems citizens
                report and the progress made toward
                resolving them.
              </p>

              <button
                onClick={() =>
                  scrollTo("explore")
                }
                className="mt-7 px-5 py-3 rounded-lg bg-white text-[#172B3A] text-sm font-semibold hover:bg-slate-100"
              >
                Explore the map
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <p className="text-sm text-slate-400">
                  Total Reported
                </p>

                <p className="text-4xl font-bold mt-2">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <p className="text-sm text-slate-400">
                  Active
                </p>

                <p className="text-4xl font-bold mt-2">
                  {stats.active}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <p className="text-sm text-slate-400">
                  Resolved
                </p>

                <p className="text-4xl font-bold mt-2">
                  {stats.resolved}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <p className="text-sm text-slate-400">
                  Resolution Rate
                </p>

                <p className="text-4xl font-bold mt-2">
                  {stats.resolutionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          ABOUT
      ====================================================== */}

      <section
        id="about"
        className="max-w-[1500px] mx-auto px-5 sm:px-8 py-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2477B5]">
              About JAN-SAMADHAN
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold mt-3">
              A civic intelligence layer for
              Jharkhand
            </h2>
          </div>

          <div className="text-slate-500 leading-relaxed space-y-4">
            <p>
              Citizens are often the first people to
              identify problems in their communities.
              JAN-SAMADHAN provides a structured way
              to report those problems and make their
              progress visible.
            </p>

            <p>
              Government departments receive
              categorized complaints and can move them
              through a defined resolution workflow.
            </p>

            <p>
              The public portal turns this activity
              into a transparent state-level view of
              civic challenges and progress.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          CTA
      ====================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 sm:px-8 pb-20">
        <div className="rounded-2xl bg-[#2477B5] text-white p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
              Your voice matters
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold mt-2">
              See a problem? Report it.
            </h2>

            <p className="text-blue-100 mt-3 max-w-xl">
              Help make local problems visible and
              contribute to a more responsive Jharkhand.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/login")
            }
            className="shrink-0 px-6 py-3.5 rounded-lg bg-white text-[#2477B5] font-bold text-sm hover:bg-blue-50 transition"
          >
            Report a Problem
          </button>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="font-bold">
                JAN-SAMADHAN
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Jharkhand Civic Intelligence Platform
              </p>
            </div>

            <div className="flex flex-wrap gap-5 text-xs text-slate-500">
              <button
                onClick={() =>
                  scrollTo("explore")
                }
                className="hover:text-[#2477B5]"
              >
                Explore
              </button>

              <button
                onClick={() =>
                  scrollTo("problems")
                }
                className="hover:text-[#2477B5]"
              >
                Problems
              </button>

              <button
                onClick={() =>
                  scrollTo("about")
                }
                className="hover:text-[#2477B5]"
              >
                About
              </button>

              <button
                onClick={() =>
                  navigate("/login")
                }
                className="hover:text-[#2477B5]"
              >
                Login
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400">
            JAN-SAMADHAN · Civic problem reporting
            and resolution platform
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;