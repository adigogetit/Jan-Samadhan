import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FolderGit2,
  Search,
  Building2,
  Users,
  Calendar,
  ArrowRight,
  RefreshCw,
  FileText,
  Briefcase,
} from "lucide-react";
import api from "../../services/api";

import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import AlertBanner from "../../components/ui/AlertBanner";

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
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (isSupportedOnly) {
        params.supported = "true";
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
        "Unable to load projects. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProjects();
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    if (status === "All") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", status);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <PageHeader
          eyebrow="Industry & Investor Portal"
          title="Browse Innovation Projects"
          description="Explore high-impact civic technology and research prototypes developed by universities across Jharkhand."
          backPath="/investor/dashboard"
          backLabel="Back to Dashboard"
        >
          <button
            type="button"
            onClick={loadProjects}
            className="flex items-center gap-2 rounded-xl border border-[#DDEDE4] bg-white px-3.5 py-2.5 text-xs font-bold text-[#5D7469] transition hover:bg-[#F2F8F4] hover:text-[#2E7D5B]"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </PageHeader>

        {/* ERROR */}
        {error && (
          <div className="mb-6">
            <AlertBanner
              type="error"
              message={error}
              onRetry={loadProjects}
              onDismiss={() => setError("")}
            />
          </div>
        )}

        {/* FILTERS CARD */}
        <div className="mb-8 rounded-[26px] border border-[#DDEDE4] bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#789087]"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects by title, description or keywords..."
                  className="h-11 w-full rounded-xl border border-[#D7E8DE] bg-[#F7FBF8] pl-10 pr-4 text-xs font-medium text-[#18352A] outline-none transition placeholder:text-[#A0B0A8] focus:border-[#2E7D5B] focus:bg-white focus:ring-4 focus:ring-[#EAF7F0]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-11 rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3.5 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="h-11 rounded-xl bg-[#2E7D5B] px-6 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(46,125,91,0.18)] transition hover:bg-[#246748]"
              >
                Search
              </button>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {STATUSES.map((status) => {
                const active = selectedStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusFilter(status)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${active
                        ? "bg-[#2E7D5B] text-white shadow-sm"
                        : "bg-[#F2F8F4] text-[#5D7469] hover:bg-[#EAF7F0] hover:text-[#2E7D5B]"
                      }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </form>
        </div>

        {/* RESULTS SUMMARY */}
        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-xs font-bold text-[#789087]">
            Showing <strong className="text-[#18352A]">{projects.length}</strong> innovation project{projects.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* PROJECTS GRID */}
        {loading ? (
          <LoadingState cards={3} />
        ) : projects.length === 0 ? (
          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-10">
            <EmptyState
              icon={<FolderGit2 size={32} />}
              title="No projects match your filter"
              description="Try selecting a different domain category or clearing your search term."
              actionLabel="Reset All Filters"
              onAction={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedStatus("All");
                setSearchParams({});
                loadProjects();
              }}
            />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const universityName =
                project.university?.name ||
                project.university?.institutionName ||
                "Academic Institution";

              return (
                <div
                  key={project._id}
                  className="group flex flex-col justify-between rounded-[24px] border border-[#DDEDE4] border-l-4 border-l-[#2E7D5B] bg-white p-5 shadow-[0_4px_18px_rgba(24,53,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,53,42,0.08)]"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-[#F0F9F3] px-2.5 py-1 text-[11px] font-bold text-[#246748]">
                        {project.problem?.category || "Civic Innovation"}
                      </span>
                      <StatusBadge status={project.status || "Development"} size="sm" />
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 text-base font-extrabold text-[#18352A] transition group-hover:text-[#2E7D5B] line-clamp-1">
                      {project.title}
                    </h3>

                    {/* Problem reference */}
                    {project.problem?.title && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#789087] truncate">
                        <FileText size={12} className="shrink-0 text-[#2E7D5B]" />
                        <span>Problem: {project.problem.title}</span>
                      </p>
                    )}

                    {/* Description */}
                    <p className="mt-2 text-xs leading-5 text-[#667A70] line-clamp-2">
                      {project.description || "No project description provided."}
                    </p>

                    {/* University & Team Chips */}
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                      <span className="flex items-center gap-1 rounded-lg bg-[#F2F8F4] px-2.5 py-1 font-semibold text-[#4D6459]">
                        <Building2 size={12} className="text-[#2E7D5B]" />
                        {universityName}
                      </span>

                      <span className="flex items-center gap-1 rounded-lg bg-[#F2F8F4] px-2.5 py-1 font-semibold text-[#4D6459]">
                        <Users size={12} className="text-[#2E7D5B]" />
                        {project.students?.length || 0} Innovators
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 border-t border-[#EDF4F0] pt-3.5">
                    <Link
                      to={`/investor/projects/${project._id}`}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2E7D5B] py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#246748]"
                    >
                      <span>Explore & Support</span>
                      <ArrowRight size={13} />
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
