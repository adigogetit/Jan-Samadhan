import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

const statusOptions = [
  "All",
  "Pending",
  "Under Review",
  "Validated",
  "In Progress",
  "Resolved",
  "Rejected",
];

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  Validated: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "In Progress": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Resolved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

const priorityStyles = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-red-50 text-red-700",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CitizenProblems() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/problems/my");

      if (response.data?.success) {
        setProblems(response.data.problems || []);
      } else {
        setError(
          response.data?.message || "Unable to load your problems."
        );
      }
    } catch (err) {
      console.error("Citizen problems error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load your problems."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const filteredProblems = useMemo(() => {
    let result = [...problems];

    if (activeFilter !== "All") {
      result = result.filter(
        (problem) => problem.status === activeFilter
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((problem) => {
        return (
          problem.title?.toLowerCase().includes(query) ||
          problem.description?.toLowerCase().includes(query) ||
          problem.category?.toLowerCase().includes(query) ||
          problem.district?.toLowerCase().includes(query) ||
          problem.block?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [problems, activeFilter, search]);

  const stats = useMemo(() => {
    return {
      total: problems.length,

      pending: problems.filter(
        (problem) => problem.status === "Pending"
      ).length,

      inProgress: problems.filter(
        (problem) =>
          problem.status === "In Progress" ||
          problem.status === "Under Review" ||
          problem.status === "Validated"
      ).length,

      resolved: problems.filter(
        (problem) => problem.status === "Resolved"
      ).length,
    };
  }, [problems]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              Citizen Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-text">
              My Problems
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Track the problems you have reported and their progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/citizen/submit-problem")
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus size={18} />
            Report New Problem
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your problems..."
              className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-medium text-text hover:border-primary sm:w-auto"
            >
              <Filter size={17} />
              {activeFilter === "All"
                ? "Filter"
                : activeFilter}
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setActiveFilter(status);
                      setFilterOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${activeFilter === status
                        ? "bg-[#F1F7FB] font-semibold text-primary"
                        : "text-text"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Problems"
            value={stats.total}
          />

          <StatCard
            label="Pending"
            value={stats.pending}
          />

          <StatCard
            label="In Progress"
            value={stats.inProgress}
          />

          <StatCard
            label="Resolved"
            value={stats.resolved}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div className="flex-1">
                <h2 className="font-semibold text-red-700">
                  Unable to load problems
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchProblems}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100"
                >
                  <RefreshCw size={15} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-border bg-white p-12 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-primary"
            />

            <p className="mt-4 text-sm text-text-secondary">
              Loading your problems...
            </p>
          </div>
        )}

        {/* PROBLEMS */}
        {!loading && !error && filteredProblems.length > 0 && (
          <div className="mt-8 space-y-4">
            {filteredProblems.map((problem) => {
              const statusClass =
                statusStyles[problem.status] ||
                "bg-slate-100 text-slate-600 border-slate-200";

              const priorityClass =
                priorityStyles[problem.priority] ||
                "bg-slate-100 text-slate-600";

              return (
                <div
                  key={problem._id}
                  className="rounded-2xl border border-border bg-white p-5 transition hover:shadow-md md:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    {/* PROBLEM INFO */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
                        >
                          {problem.status || "Pending"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}
                        >
                          {problem.priority || "Medium"} Priority
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-semibold text-text">
                        {problem.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">
                        {problem.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
                        <span>
                          Category:{" "}
                          <strong className="font-medium text-text">
                            {problem.category || "—"}
                          </strong>
                        </span>

                        <span>
                          District:{" "}
                          <strong className="font-medium text-text">
                            {problem.district || "—"}
                          </strong>
                        </span>

                        {problem.block && (
                          <span>
                            Block:{" "}
                            <strong className="font-medium text-text">
                              {problem.block}
                            </strong>
                          </span>
                        )}

                        <span>
                          Reported:{" "}
                          <strong className="font-medium text-text">
                            {formatDate(problem.createdAt)}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="flex shrink-0 lg:items-end">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/citizen/problems/${problem._id}`
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-primary hover:border-primary hover:bg-[#F1F7FB]"
                      >
                        View Details
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          filteredProblems.length === 0 && (
            <div className="mt-8 rounded-2xl border border-border bg-white p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F7FB]">
                {search || activeFilter !== "All" ? (
                  <Search
                    size={25}
                    className="text-primary"
                  />
                ) : (
                  <MapPin
                    size={25}
                    className="text-primary"
                  />
                )}
              </div>

              <h2 className="mt-5 text-xl font-semibold text-text">
                {search || activeFilter !== "All"
                  ? "No matching problems"
                  : "No problems reported yet"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
                {search || activeFilter !== "All"
                  ? "Try changing your search or filter to find your reported problems."
                  : "When you report a civic problem, it will appear here so you can track its status from submission to resolution."}
              </p>

              {!search && activeFilter === "All" && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/citizen/submit-problem")
                  }
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
                >
                  <Plus size={18} />
                  Report Your First Problem
                </button>
              )}

              {(search || activeFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("All");
                  }}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold text-text hover:border-primary"
                >
                  Clear Search & Filter
                </button>
              )}
            </div>
          )}

        {/* RESULT COUNT */}
        {!loading &&
          !error &&
          problems.length > 0 && (
            <p className="mt-5 text-xs text-text-secondary">
              Showing {filteredProblems.length} of{" "}
              {problems.length} reported problems
            </p>
          )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <p className="text-sm text-text-secondary">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-text">
        {value}
      </p>
    </div>
  );
}

export default CitizenProblems;