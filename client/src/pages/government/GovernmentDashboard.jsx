import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// ============================================================
// STATUS CONFIG
// ============================================================

const statusConfig = {
  Pending: {
    label: "Pending",
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  "Under Review": {
    label: "Under Review",
    icon: FileText,
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  Validated: {
    label: "Validated",
    icon: ShieldCheck,
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  "In Progress": {
    label: "In Progress",
    icon: TrendingUp,
    className:
      "bg-cyan-50 text-cyan-700 border-cyan-200",
  },

  Resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className:
      "bg-green-50 text-green-700 border-green-200",
  },

  Rejected: {
    label: "Rejected",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  Duplicate: {
    label: "Duplicate",
    icon: AlertCircle,
    className:
      "bg-slate-100 text-slate-600 border-slate-200",
  },
};

// ============================================================
// PRIORITY STYLES
// ============================================================

const priorityStyles = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-red-50 text-red-700",
};

// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function GovernmentDashboard() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // FETCH PROBLEMS
  // ==========================================================

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/problems");

      if (response.data?.success) {
        setProblems(
          response.data.problems || []
        );
      } else {
        setError(
          response.data?.message ||
            "Unable to load government dashboard."
        );
      }
    } catch (err) {
      console.error(
        "Government dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // ==========================================================
  // COMPLAINT STATUS COUNTS
  // ==========================================================

  const getCount = (status) =>
    problems.filter(
      (problem) =>
        problem.status === status
    ).length;

  const totalComplaints =
    problems.length;

  const pendingCount =
    getCount("Pending");

  const underReviewCount =
    getCount("Under Review");

  const inProgressCount =
    getCount("In Progress");

  const resolvedCount =
    getCount("Resolved");

  const rejectedCount =
    getCount("Rejected");

  // ==========================================================
  // PRIORITY COUNTS
  // ==========================================================

  const criticalCount =
    problems.filter(
      (problem) =>
        problem.priority === "Critical"
    ).length;

  const highPriorityCount =
    problems.filter(
      (problem) =>
        problem.priority === "High"
    ).length;

  // ==========================================================
  // RESOLUTION RATE
  // ==========================================================

  const resolutionRate =
    totalComplaints > 0
      ? Math.round(
          (resolvedCount /
            totalComplaints) *
            100
        )
      : 0;

  // ==========================================================
  // RECENT PROBLEMS
  // ==========================================================

  const recentProblems = [...problems]
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )
    .slice(0, 12);

  // ==========================================================
  // MAIN STAT CARDS
  // ==========================================================

  const statCards = [
    {
      title: "Total Complaints",
      value: totalComplaints,
      icon: FileText,
      iconClass:
        "bg-blue-50 text-[#2477B5]",
    },

    {
      title: "Pending",
      value: pendingCount,
      icon: Clock3,
      iconClass:
        "bg-amber-50 text-amber-600",
    },

    {
      title: "Under Review",
      value: underReviewCount,
      icon: AlertCircle,
      iconClass:
        "bg-indigo-50 text-indigo-600",
    },

    {
      title: "In Progress",
      value: inProgressCount,
      icon: TrendingUp,
      iconClass:
        "bg-cyan-50 text-cyan-600",
    },

    {
      title: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      iconClass:
        "bg-green-50 text-green-600",
    },

    {
      title: "Rejected",
      value: rejectedCount,
      icon: XCircle,
      iconClass:
        "bg-red-50 text-red-600",
    },
  ];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <RefreshCw
              size={18}
              className="animate-spin"
            />

            Loading government dashboard...
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={21}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <h2 className="font-semibold text-red-700">
                  Dashboard could not be loaded
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchProblems}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#2477B5] p-2.5 text-white">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#172B3A]">
                  Government Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor and manage citizen
                  grievances across
                  Jharkhand.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchProblems}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#2477B5] hover:text-[#2477B5]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* ====================================================
            MAIN STATISTICS
        ==================================================== */}

        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-xl p-2.5 ${card.iconClass}`}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <p className="mt-4 text-xs font-medium text-slate-400">
                  {card.title}
                </p>

                <p className="mt-1 text-2xl font-bold text-[#172B3A]">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* ====================================================
            PRIORITY + RESOLUTION
        ==================================================== */}

        <div className="mb-7 grid gap-6 lg:grid-cols-2">

          {/* PRIORITY ALERTS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                <AlertCircle size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-[#172B3A]">
                  Priority Alerts
                </h2>

                <p className="text-xs text-slate-400">
                  Complaints needing attention
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/government/problems?priority=Critical"
                  )
                }
                className="rounded-xl bg-red-50 p-4 text-left transition hover:bg-red-100"
              >
                <p className="text-xs text-red-500">
                  Critical
                </p>

                <p className="mt-1 text-2xl font-bold text-red-700">
                  {criticalCount}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/government/problems?priority=High"
                  )
                }
                className="rounded-xl bg-orange-50 p-4 text-left transition hover:bg-orange-100"
              >
                <p className="text-xs text-orange-500">
                  High
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-700">
                  {highPriorityCount}
                </p>
              </button>

            </div>
          </div>

          {/* RESOLUTION RATE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-2.5 text-green-600">
                <BarChart3 size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-[#172B3A]">
                  Resolution Rate
                </h2>

                <p className="text-xs text-slate-400">
                  Overall grievance resolution
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-[#172B3A]">
                  {resolutionRate}%
                </span>

                <span className="text-xs text-slate-400">
                  {resolvedCount} resolved
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${resolutionRate}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Based on all complaints currently
                available in the system.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ==================================================
              RECENT COMPLAINTS
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-semibold text-[#172B3A]">
                  Recent Complaints
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest citizen reports
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/government/problems"
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2477B5] hover:underline"
              >
                View All
                <ArrowRight size={14} />
              </button>
            </div>

            {/* SCROLLABLE COMPLAINT LIST */}

            <div
              className="h-[430px] overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor:
                  "#cbd5e1 transparent",
              }}
            >
              {recentProblems.length > 0 ? (
                <div className="divide-y divide-slate-100">

                  {recentProblems.map(
                    (problem) => {
                      const status =
                        statusConfig[
                          problem.status
                        ] ||
                        statusConfig.Pending;

                      const StatusIcon =
                        status.icon;

                      return (
                        <button
                          key={problem._id}
                          type="button"
                          onClick={() =>
                            navigate(
                              `/government/problems/${problem._id}`
                            )
                          }
                          className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50"
                        >

                          {/* ICON */}

                          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2477B5] sm:flex">
                            <FileText size={18} />
                          </div>

                          {/* MAIN INFO */}

                          <div className="min-w-0 flex-1">

                            {/* TITLE + STATUS */}

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="min-w-0 truncate text-sm font-semibold text-slate-700">
                                {problem.title ||
                                  "Untitled Complaint"}
                              </h3>

                              <span
                                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <StatusIcon
                                    size={11}
                                  />

                                  {status.label}
                                </span>
                              </span>

                            </div>

                            {/* META */}

                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">

                              <span>
                                {problem.district ||
                                  "Unknown District"}
                              </span>

                              <span>
                                {problem.category ||
                                  "Other"}
                              </span>

                              <span>
                                {formatDate(
                                  problem.createdAt
                                )}
                              </span>

                            </div>

                            {/* DEPARTMENT */}

                            {problem.governmentDepartment && (
                              <div className="mt-2">
                                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#2477B5]">
                                  Department:{" "}
                                  {
                                    problem.governmentDepartment
                                  }
                                </span>
                              </div>
                            )}

                          </div>

                          {/* PRIORITY */}

                          <div className="hidden shrink-0 text-right sm:block">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                priorityStyles[
                                  problem.priority
                                ] ||
                                priorityStyles.Medium
                              }`}
                            >
                              {problem.priority ||
                                "Medium"}
                            </span>

                            <p className="mt-1 text-[10px] text-slate-400">
                              Priority
                            </p>
                          </div>

                          {/* ARROW */}

                          <ArrowRight
                            size={17}
                            className="shrink-0 text-slate-300"
                          />

                        </button>
                      );
                    }
                  )}

                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-10 text-center">
                  <FileText
                    size={30}
                    className="text-slate-300"
                  />

                  <p className="mt-3 text-sm text-slate-400">
                    No complaints available.
                  </p>
                </div>
              )}
            </div>

          </section>

          {/* ==================================================
              DISTRICT OVERVIEW
          ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-[#172B3A]">
                District Overview
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Complaints by district
              </p>
            </div>

            <div className="p-5">
              {(() => {
                const districtCounts =
                  problems.reduce(
                    (acc, problem) => {
                      const district =
                        problem.district ||
                        "Unknown";

                      acc[district] =
                        (acc[district] ||
                          0) + 1;

                      return acc;
                    },
                    {}
                  );

                const topDistricts =
                  Object.entries(
                    districtCounts
                  )
                    .sort(
                      (a, b) =>
                        b[1] - a[1]
                    )
                    .slice(0, 5);

                return topDistricts.length >
                  0 ? (
                  <div className="space-y-5">

                    {topDistricts.map(
                      ([
                        district,
                        count,
                      ]) => {
                        const percentage =
                          problems.length >
                          0
                            ? Math.round(
                                (count /
                                  problems.length) *
                                  100
                              )
                            : 0;

                        return (
                          <button
                            key={district}
                            type="button"
                            onClick={() =>
                              navigate(
                                `/government/problems?district=${encodeURIComponent(
                                  district
                                )}`
                              )
                            }
                            className="block w-full text-left"
                          >
                            <div className="mb-2 flex items-center justify-between">

                              <span className="text-sm font-medium text-slate-700">
                                {district}
                              </span>

                              <span className="text-xs font-semibold text-slate-500">
                                {count}
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-[#2477B5] transition-all"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>
                ) : (
                  <div className="py-10 text-center">

                    <BarChart3
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      No district data yet.
                    </p>

                  </div>
                );
              })()}
            </div>

          </section>

        </div>

      </div>
    </div>
  );
}