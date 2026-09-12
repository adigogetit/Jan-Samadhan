import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  RefreshCw,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import StatusBadge from "../../components/ui/StatusBadge";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import AlertBanner from "../../components/ui/AlertBanner";

const statusOptions = [
  "All",
  "Pending",
  "Under Review",
  "Validated",
  "In Progress",
  "Resolved",
  "Rejected",
];

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CitizenDashboard() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
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
        setError(response.data?.message || "Unable to load your problems.");
      }
    } catch (err) {
      console.error("Citizen problems error:", err);
      setError(
        err.response?.data?.message || "Unable to load your problems."
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
      result = result.filter((problem) => problem.status === activeFilter);
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
      pending: problems.filter((p) => p.status === "Pending").length,
      inProgress: problems.filter(
        (p) =>
          p.status === "In Progress" ||
          p.status === "Under Review" ||
          p.status === "Validated"
      ).length,
      resolved: problems.filter((p) => p.status === "Resolved").length,
    };
  }, [problems]);

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <PageHeader
          eyebrow="Citizen Portal"
          title="Citizen Dashboard"
          description="Track your reported civic grievances and monitor community solutions"
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

          <button
            type="button"
            onClick={() => navigate("/citizen/submit-problem")}
            className="flex items-center gap-2 rounded-xl bg-[#2E7D5B] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(46,125,91,0.18)] transition hover:bg-[#246748]"
          >
            <Plus size={16} />
            <span>Report Problem</span>
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

        {/* KPI CARDS */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<FileText size={20} />}
            label="Total Reported"
            value={stats.total}
            color="green"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Pending Review"
            value={stats.pending}
            color="orange"
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            label="In Progress / Review"
            value={stats.inProgress}
            color="green"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Resolved"
            value={stats.resolved}
            color="green"
          />
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="mb-6 rounded-[22px] border border-[#DDEDE4] bg-white p-4 shadow-[0_4px_18px_rgba(24,53,42,0.03)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#789087]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, category, district or keyword..."
                className="h-11 w-full rounded-xl border border-[#D7E8DE] bg-[#F7FBF8] pl-10 pr-4 text-xs font-medium text-[#18352A] outline-none transition placeholder:text-[#A0B0A8] focus:border-[#2E7D5B] focus:bg-white focus:ring-4 focus:ring-[#EAF7F0]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {statusOptions.map((opt) => {
                const active = activeFilter === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setActiveFilter(opt)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${active
                        ? "bg-[#2E7D5B] text-white shadow-sm"
                        : "bg-[#F2F8F4] text-[#5D7469] hover:bg-[#EAF7F0] hover:text-[#2E7D5B]"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PROBLEMS CONTENT */}
        {loading ? (
          <LoadingState cards={4} />
        ) : filteredProblems.length === 0 ? (
          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-10">
            <EmptyState
              icon={<FileText size={32} />}
              title={
                search || activeFilter !== "All"
                  ? "No matching problems found"
                  : "No problems reported yet"
              }
              description={
                search || activeFilter !== "All"
                  ? "Try clearing your search query or selecting a different status filter."
                  : "Be the first to bring a local issue to light. Report a civic grievance to get government and university action."
              }
              actionLabel={
                search || activeFilter !== "All"
                  ? "Clear Filters"
                  : "Report Your First Problem"
              }
              onAction={() => {
                if (search || activeFilter !== "All") {
                  setSearch("");
                  setActiveFilter("All");
                } else {
                  navigate("/citizen/submit-problem");
                }
              }}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                onClick={() => navigate(`/citizen/problems/${problem._id}`)}
                className="group flex cursor-pointer flex-col justify-between rounded-[22px] border border-[#DDEDE4] border-l-4 border-l-[#2E7D5B] bg-white p-5 shadow-[0_4px_18px_rgba(24,53,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,53,42,0.08)]"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-[#F0F9F3] px-2.5 py-1 text-[11px] font-bold text-[#246748]">
                      {problem.category || "General"}
                    </span>
                    <StatusBadge status={problem.status || "Pending"} size="sm" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-base font-extrabold text-[#18352A] transition group-hover:text-[#2E7D5B] line-clamp-1">
                    {problem.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-xs leading-5 text-[#667A70] line-clamp-2">
                    {problem.description}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 border-t border-[#EDF4F0] pt-3">
                  <div className="flex items-center justify-between text-[11px] text-[#789087]">
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-[#2E7D5B]" />
                      <span className="truncate max-w-[120px]">
                        {problem.district || "Jharkhand"}
                      </span>
                    </div>

                    <span>{formatDate(problem.createdAt)}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <StatusBadge
                      status={problem.priority || "Medium"}
                      variant="priority"
                      size="sm"
                    />

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D5B] group-hover:underline">
                      Details
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}