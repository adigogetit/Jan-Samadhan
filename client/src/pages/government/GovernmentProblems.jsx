import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
  Building2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";

import StatusBadge from "../../components/ui/StatusBadge";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import AlertBanner from "../../components/ui/AlertBanner";

const statuses = [
  "All",
  "Pending",
  "Under Review",
  "Validated",
  "In Progress",
  "Resolved",
  "Rejected",
  "Duplicate",
];

const priorities = ["All", "Low", "Medium", "High", "Critical"];

const departments = [
  "All",
  "Agriculture",
  "Road & Transport",
  "Water Supply",
  "Electricity",
  "Health",
  "Education",
  "Environment",
  "Municipal Corporation",
  "Police",
  "Other",
];

function formatDate(date) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GovernmentProblems() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [priority, setPriority] = useState(searchParams.get("priority") || "All");
  const [department, setDepartment] = useState(searchParams.get("department") || "All");
  const [district, setDistrict] = useState(searchParams.get("district") || "All");

  const updateUrl = (nextFilters) => {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value && value !== "All") params.set(key, value);
    });
    setSearchParams(params);
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status !== "All") params.status = status;
      if (priority !== "All") params.priority = priority;
      if (department !== "All") params.department = department;
      if (district !== "All") params.district = district;

      const response = await api.get("/problems", { params });

      if (response.data?.success) {
        setProblems(response.data.problems || []);
      } else {
        setError(response.data?.message || "Unable to load problems.");
      }
    } catch (err) {
      console.error("Government problems error:", err);
      setError(
        err.response?.data?.message || "Unable to load problems from server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [status, priority, department, district]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrl({ search, status, priority, department, district });
    fetchProblems();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("All");
    setPriority("All");
    setDepartment("All");
    setDistrict("All");
    setSearchParams(new URLSearchParams());
  };

  const distinctDistricts = useMemo(() => {
    const set = new Set();
    problems.forEach((p) => {
      if (p.district) set.add(p.district);
    });
    return ["All", ...Array.from(set).sort()];
  }, [problems]);

  const activeFilterCount = [
    status !== "All",
    priority !== "All",
    department !== "All",
    district !== "All",
    Boolean(search.trim()),
  ].filter(Boolean).length;

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <PageHeader
          eyebrow="Government Administration"
          title="Civic Grievance Management"
          description="Review, validate, assign and track status for civic problems across the state"
          backPath="/government/dashboard"
          backLabel="Back to Dashboard"
        >
          <button
            type="button"
            onClick={fetchProblems}
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
              onRetry={fetchProblems}
              onDismiss={() => setError("")}
            />
          </div>
        )}

        {/* FILTER & SEARCH CARD */}
        <div className="mb-8 rounded-[26px] border border-[#DDEDE4] bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Search row */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#789087]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by complaint title, keywords, landmark..."
                  className="h-11 w-full rounded-xl border border-[#D7E8DE] bg-[#F7FBF8] pl-10 pr-4 text-xs font-medium text-[#18352A] outline-none transition placeholder:text-[#A0B0A8] focus:border-[#2E7D5B] focus:bg-white focus:ring-4 focus:ring-[#EAF7F0]"
                />
              </div>

              <button
                type="submit"
                className="h-11 rounded-xl bg-[#2E7D5B] px-6 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(46,125,91,0.18)] transition hover:bg-[#246748]"
              >
                Search
              </button>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="h-11 rounded-xl border border-[#DDEDE4] bg-white px-4 text-xs font-bold text-[#60756B] transition hover:bg-[#F2F8F4] hover:text-[#D9534F]"
                >
                  Clear ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Dropdown filters grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    updateUrl({ search, status: e.target.value, priority, department, district });
                  }}
                  className="h-10 w-full rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? "All Statuses" : s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    updateUrl({ search, status, priority: e.target.value, department, district });
                  }}
                  className="h-10 w-full rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p === "All" ? "All Priorities" : `${p} Priority`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1.5">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    updateUrl({ search, status, priority, department: e.target.value, district });
                  }}
                  className="h-10 w-full rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d === "All" ? "All Departments" : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1.5">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    updateUrl({ search, status, priority, department, district: e.target.value });
                  }}
                  className="h-10 w-full rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
                >
                  {distinctDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d === "All" ? "All Districts" : d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* RESULTS SUMMARY */}
        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-xs font-bold text-[#789087]">
            Showing <strong className="text-[#18352A]">{problems.length}</strong> complaints
          </p>
        </div>

        {/* PROBLEM LIST */}
        {loading ? (
          <LoadingState cards={4} />
        ) : problems.length === 0 ? (
          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-10">
            <EmptyState
              icon={<FileText size={32} />}
              title="No grievances match your criteria"
              description="Try broadening your search or resetting one of the active filters above."
              actionLabel={activeFilterCount > 0 ? "Clear All Filters" : undefined}
              onAction={handleClearFilters}
            />
          </div>
        ) : (
          <div className="space-y-3.5">
            {problems.map((problem) => (
              <div
                key={problem._id}
                onClick={() => navigate(`/government/problems/${problem._id}`)}
                className="group flex cursor-pointer flex-col gap-4 rounded-[22px] border border-[#DDEDE4] border-l-4 border-l-[#2E7D5B] bg-white p-5 shadow-[0_4px_18px_rgba(24,53,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,53,42,0.08)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={problem.status || "Pending"} size="sm" />
                    <StatusBadge
                      status={problem.priority || "Medium"}
                      variant="priority"
                      size="sm"
                    />
                    {problem.category && (
                      <span className="rounded-lg bg-[#F0F9F3] px-2.5 py-0.5 text-[11px] font-bold text-[#246748]">
                        {problem.category}
                      </span>
                    )}
                    {problem.governmentDepartment && (
                      <span className="rounded-lg bg-[#FAFDFB] border border-[#DDEDE4] px-2.5 py-0.5 text-[11px] font-bold text-[#5D7469]">
                        {problem.governmentDepartment}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-[#18352A] transition group-hover:text-[#2E7D5B] truncate">
                    {problem.title}
                  </h3>

                  <p className="mt-1 text-xs text-[#667A70] line-clamp-2">
                    {problem.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[#789087]">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-[#2E7D5B]" />
                      {problem.district || "Jharkhand"}
                      {problem.block ? `, ${problem.block}` : ""}
                    </span>

                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      {formatDate(problem.createdAt)}
                    </span>

                    {problem.aiAnalysis?.routingType && (
                      <span className="rounded bg-[#EAF7F0] px-2 py-0.5 text-[10px] font-bold uppercase text-[#2E7D5B]">
                        Routing: {problem.aiAnalysis.routingType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2E7D5B] transition group-hover:underline">
                    Inspect & Act
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}