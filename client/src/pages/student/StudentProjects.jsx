import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FolderGit2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  UserCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  X,
  Layers,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_FILTERS = [
  "All",
  "Planning",
  "Development",
  "Testing",
  "Pilot",
  "Deployment",
  "Completed",
];

const getStatusBadge = (status) => {
  switch (status) {
    case "Planning":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "Development":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Testing":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Pilot":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Deployment":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const formatDate = (date) => {
  if (!date) return "Not set";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function StudentProjects() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = searchParams.get("status") || "All";
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, [selectedStatus]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (selectedStatus && selectedStatus !== "All") {
        params.status = selectedStatus;
      }
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await api.get("/student/projects", { params });

      if (response.data?.success) {
        setProjects(response.data.projects || []);
      } else {
        setProjects([]);
        setError(response.data?.message || "Failed to load projects.");
      }
    } catch (err) {
      console.error("Failed to load student projects:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load student projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProjects();
  };

  const handleFilterChange = (status) => {
    setSelectedStatus(status);
    if (status === "All") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", status);
    }
    setSearchParams(searchParams);
  };

  const isAcceptedByMe = (project) => {
    if (!user?._id || !Array.isArray(project?.acceptedStudents)) return false;
    return project.acceptedStudents.some(
      (s) => (s._id || s).toString() === user._id.toString()
    );
  };

  // Client-side search enhancement to instantly filter even before search submit
  const filteredProjects = projects.filter((project) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const titleMatch = project.title?.toLowerCase().includes(term);
    const descMatch = project.description?.toLowerCase().includes(term);
    const problemTitleMatch = project.problem?.title?.toLowerCase().includes(term);
    const categoryMatch = (project.category || project.problem?.category)
      ?.toLowerCase()
      .includes(term);
    const districtMatch = (project.district || project.problem?.district)
      ?.toLowerCase()
      .includes(term);

    return (
      titleMatch ||
      descMatch ||
      problemTitleMatch ||
      categoryMatch ||
      districtMatch
    );
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#172B3A] md:text-3xl">
                My Assigned Projects
              </h1>
              {!loading && (
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {projects.length}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Civic innovation projects assigned to you by your university administration.
            </p>
          </div>

          <button
            onClick={loadProjects}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* =====================================================
            SEARCH & FILTERS
        ====================================================== */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project title, source problem, category, or district..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-24 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1F6F8B] focus:bg-white focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  loadProjects();
                }}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#172B3A] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#23445A]"
            >
              Search
            </button>
          </form>

          {/* Status Filter Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
              <Filter size={12} /> Filter:
            </span>
            {STATUS_FILTERS.map((status) => {
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#172B3A] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            ERROR BANNER
        ====================================================== */}
        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={20} className="text-red-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* =====================================================
            PROJECT LIST / GRID
        ====================================================== */}
        {loading ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex justify-between">
                  <div className="h-5 w-24 rounded-full bg-slate-200" />
                  <div className="h-5 w-20 rounded-full bg-slate-200" />
                </div>
                <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
                <div className="mt-3 h-14 rounded bg-slate-100" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FolderGit2 size={32} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#172B3A]">
              {searchTerm || selectedStatus !== "All"
                ? "No matching projects found"
                : "No Assigned Projects"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {searchTerm || selectedStatus !== "All"
                ? "Try clearing your filters or changing your search terms to see projects."
                : "You have not been assigned to any university innovation projects yet. Check back soon or contact your faculty lead."}
            </p>
            {(searchTerm || selectedStatus !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("All");
                  searchParams.delete("status");
                  setSearchParams(searchParams);
                }}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#172B3A] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#23445A]"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const problem = project.problem || {};
              const accepted = isAcceptedByMe(project);

              return (
                <div
                  key={project._id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    {/* Header: Project status badge & acceptance badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                          project.status
                        )}`}
                      >
                        {project.status || "Planning"}
                      </span>

                      {accepted ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Accepted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                          <Clock size={12} /> Pending Acceptance
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="mt-4 line-clamp-2 text-lg font-bold text-[#172B3A]">
                      {project.title}
                    </h2>

                    {/* Description */}
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">
                      {project.description || "No project description provided."}
                    </p>

                    {/* Source Problem Block */}
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Source Problem
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-700">
                        {problem.title || "Civic Grievance Information"}
                      </p>
                    </div>

                    {/* Meta Fields */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-400">Category</p>
                        <p className="mt-0.5 font-medium text-slate-700 truncate">
                          {project.category || problem.category || "General"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">District</p>
                        <p className="mt-0.5 font-medium text-slate-700 truncate">
                          {project.district || problem.district || "Jharkhand"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">University</p>
                        <p className="mt-0.5 font-medium text-slate-700 truncate">
                          {project.university?.name || "Assigned University"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Faculty Lead</p>
                        <p className="mt-0.5 font-medium text-slate-700 truncate">
                          {project.facultyLead?.name || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Timeline dates */}
                    <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Start Date:</span>
                        <span className="font-medium text-slate-600">
                          {formatDate(project.startDate || project.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Expected Completion:</span>
                        <span className="font-medium text-slate-600">
                          {formatDate(project.expectedCompletionDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Team count & Link */}
                  <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {Array.isArray(project.students)
                        ? `${project.students.length} Student${
                            project.students.length === 1 ? "" : "s"
                          }`
                        : "Team member"}
                    </span>

                    <Link
                      to={`/student/projects/${project._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1F6F8B] hover:text-[#172B3A] transition"
                    >
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
