import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const filters = [
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
  Duplicate: "bg-slate-100 text-slate-600 border-slate-200",
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

export default function CitizenProblems() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
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
          response.data?.message || "Failed to load your problems."
        );
      }
    } catch (err) {
      console.error("Fetch citizen problems error:", err);

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

  const filteredProblems =
    activeFilter === "All"
      ? problems
      : problems.filter(
          (problem) => problem.status === activeFilter
        );

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#172B3A] md:text-3xl">
              My Problems
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Track the problems you have reported.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/citizen/submit-problem")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2477B5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d659b]"
          >
            <Plus size={18} />
            Report New Problem
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  activeFilter === filter
                    ? "border-[#2477B5] bg-[#2477B5] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#2477B5] hover:text-[#2477B5]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Unable to load problems
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchProblems}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading your problems...
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredProblems.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#2477B5]">
              <FileText size={26} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#172B3A]">
              {activeFilter === "All"
                ? "You haven't reported any problems yet"
                : `No ${activeFilter.toLowerCase()} problems`}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {activeFilter === "All"
                ? "Report a local issue and help your community get it resolved."
                : "Try another status filter to see your reported problems."}
            </p>

            {activeFilter === "All" && (
              <button
                type="button"
                onClick={() =>
                  navigate("/citizen/submit-problem")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2477B5] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d659b]"
              >
                <Plus size={17} />
                Report a Problem
              </button>
            )}
          </div>
        )}

        {/* Problems */}
        {!loading && !error && filteredProblems.length > 0 && (
          <div className="grid gap-5">
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
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md md:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    {/* Main information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
                        >
                          {problem.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}
                        >
                          {problem.priority} Priority
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-semibold text-[#172B3A]">
                        {problem.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {problem.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>
                          Category:{" "}
                          <strong className="font-medium text-slate-700">
                            {problem.category}
                          </strong>
                        </span>

                        <span>
                          District:{" "}
                          <strong className="font-medium text-slate-700">
                            {problem.district}
                          </strong>
                        </span>

                        {problem.block && (
                          <span>
                            Block:{" "}
                            <strong className="font-medium text-slate-700">
                              {problem.block}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date + button */}
                    <div className="flex shrink-0 flex-col gap-3 lg:items-end">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays size={15} />
                        {formatDate(problem.createdAt)}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/citizen/problems/${problem._id}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#2477B5] transition hover:border-[#2477B5] hover:bg-blue-50"
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

        {/* Count */}
        {!loading && !error && problems.length > 0 && (
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            {activeFilter === "All" ? (
              <>
                <CheckCircle2 size={14} />
                Showing {filteredProblems.length} of{" "}
                {problems.length} reported problems
              </>
            ) : (
              <>
                <Clock3 size={14} />
                Showing {filteredProblems.length}{" "}
                {activeFilter.toLowerCase()} problems
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}