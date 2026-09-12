import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Plus,
  RefreshCw,
  MapPin,
  CalendarDays,
} from "lucide-react";
import api from "../../services/api";

import StatusBadge from "../../components/ui/StatusBadge";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import AlertBanner from "../../components/ui/AlertBanner";

const filters = [
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
        setError(response.data?.message || "Unable to load problems.");
      }
    } catch (err) {
      console.error("Fetch problems error:", err);
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

  const filteredProblems =
    activeFilter === "All"
      ? problems
      : problems.filter((problem) => problem.status === activeFilter);

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <PageHeader
          eyebrow="Citizen Portal"
          title="My Reported Problems"
          description="View and track the status of all grievances you have submitted"
          backPath="/citizen/dashboard"
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

        {/* FILTER BAR */}
        <div className="mb-6 rounded-[22px] border border-[#DDEDE4] bg-white p-3 shadow-[0_4px_18px_rgba(24,53,42,0.03)]">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {filters.map((filter) => {
              const active = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${active
                      ? "bg-[#2E7D5B] text-white shadow-sm"
                      : "bg-[#F2F8F4] text-[#5D7469] hover:bg-[#EAF7F0] hover:text-[#2E7D5B]"
                    }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <LoadingState cards={3} />
        ) : filteredProblems.length === 0 ? (
          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-10">
            <EmptyState
              icon={<FileText size={32} />}
              title="No problems found"
              description={
                activeFilter === "All"
                  ? "You have not submitted any problems yet."
                  : `No problems currently marked as "${activeFilter}".`
              }
              actionLabel={
                activeFilter === "All"
                  ? "Report Problem"
                  : "View All Problems"
              }
              onAction={() => {
                if (activeFilter === "All") {
                  navigate("/citizen/submit-problem");
                } else {
                  setActiveFilter("All");
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                onClick={() => navigate(`/citizen/problems/${problem._id}`)}
                className="group flex cursor-pointer flex-col gap-4 rounded-[22px] border border-[#DDEDE4] border-l-4 border-l-[#2E7D5B] bg-white p-5 shadow-[0_4px_18px_rgba(24,53,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,53,42,0.08)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-lg bg-[#F0F9F3] px-2.5 py-1 text-[11px] font-bold text-[#246748]">
                      {problem.category || "General"}
                    </span>
                    <StatusBadge status={problem.status || "Pending"} size="sm" />
                    <StatusBadge
                      status={problem.priority || "Medium"}
                      variant="priority"
                      size="sm"
                    />
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
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2E7D5B] transition group-hover:underline">
                    View Tracking
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