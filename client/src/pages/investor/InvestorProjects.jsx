import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FolderGit2,
  Search,
  Filter,
  Building2,
  Users,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  X,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";

const CATEGORIES = [
  "All",
  "Roads & Transport",
  "Water & Sanitation",
  "Electricity",
  "Healthcare",
  "Education",
  "Agriculture",
  "Environment",
  "Public Safety",
  "Waste Management",
  "Other",
];

const STATUSES = [
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

export default function InvestorProjects() {
  const [searchParams, setSearchParams] = useSearchParams();

  const isSupportedOnly = searchParams.get("supported") === "true";
  const initialCategory = searchParams.get("category") || "All";
  const initialStatus = searchParams.get("status") || "All";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, [selectedCategory, selectedStatus, isSupportedOnly]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (selectedCategory && selectedCategory !== "All") {
        params.category = selectedCategory;
      }
      if (selectedStatus && selectedStatus !== "All") {
        params.status = selectedStatus;
      }
      if (isSupportedOnly) {
        params.supported = "true";
      }
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await api.get("/investor/projects", { params });

      if (response.data?.success) {
        setProjects(response.data.projects || []);
      } else {
        setProjects([]);
        setError(response.data?.message || "Failed to load projects.");
      }
    } catch (err) {
      console.error("Failed to load investor projects:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProjects();
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSearchTerm("");
    setSearchParams({});
  };

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
                {isSupportedOnly ? "My Supported Projects" : "Explore Civic Projects"}
              </h1>
              {!loading && (
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {projects.length}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {isSupportedOnly
                ? "Projects where your organization is an accepted industry partner."
                : "Browse active university solutions open for external partnership, mentorship, and support."}
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
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
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
              placeholder="Search by project title, category, district, or university..."
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

          {/* Filter Selects & Pills */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
              <Filter size={12} /> Filters:
            </span>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-[#1F6F8B] focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-[#1F6F8B] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {STATUSES.filter((s) => s !== "All").map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {(selectedCategory !== "All" || selectedStatus !== "All" || searchTerm || isSupportedOnly) && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6F8B] hover:underline ml-auto"
              >
                Clear all filters
              </button>
            )}
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
            PROJECTS GRID
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
        ) : projects.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FolderGit2 size={32} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#172B3A]">
              No Projects Found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {searchTerm || selectedCategory !== "All" || selectedStatus !== "All"
                ? "No projects match your current filter criteria. Try adjusting your search or filters."
                : "There are currently no projects listed for external partnership."}
            </p>
            {(searchTerm || selectedCategory !== "All" || selectedStatus !== "All" || isSupportedOnly) && (
              <button
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#172B3A] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#23445A]"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const problem = project.problem || {};

              return (
                <div
                  key={project._id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    {/* Category & Status Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                          project.status
                        )}`}
                      >
                        {project.status || "Planning"}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {project.category || problem.category || "General"}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="mt-4 line-clamp-2 text-base font-bold text-[#172B3A]">
                      {project.title}
                    </h2>

                    {/* Description */}
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">
                      {project.description || "No description provided."}
                    </p>

                    {/* Metadata Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-slate-400">District</p>
                        <p className="mt-0.5 font-medium text-slate-700 truncate">
                          {project.district || problem.district || "Jharkhand"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">University</p>
                        <p className="mt-0.5 font-medium text-slate-700 truncate">
                          {project.university?.name || "University"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Faculty Lead</p>
                        <p className="mt-0.5 font-medium text-slate-700 truncate">
                          {project.facultyLead?.name || "Not assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Team Size</p>
                        <p className="mt-0.5 font-medium text-slate-700">
                          {project.studentsCount} Student{project.studentsCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    {/* Timeline dates */}
                    <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="text-slate-400">Expected Completion:</span>
                      <span className="font-medium text-slate-600">
                        {formatDate(project.expectedCompletionDate)}
                      </span>
                    </div>

                    {/* Industry Partner Badge if assigned */}
                    {project.industryPartner && (
                      <div className="mt-3 rounded-xl bg-purple-50 p-2 text-xs text-purple-800 border border-purple-200 flex items-center gap-1.5">
                        <Briefcase size={12} />
                        <span>Partner: <strong>{project.industryPartner.name}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Open for support
                    </span>

                    <Link
                      to={`/investor/projects/${project._id}`}
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
