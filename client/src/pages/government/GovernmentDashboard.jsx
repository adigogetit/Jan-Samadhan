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
  AlertTriangle,
  Building2,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import StatusBadge from "../../components/ui/StatusBadge";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import AlertBanner from "../../components/ui/AlertBanner";
import LoadingState from "../../components/ui/LoadingState";

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GovernmentDashboard() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/problems");

      if (response.data?.success) {
        setProblems(response.data.problems || []);
      } else {
        setError(
          response.data?.message || "Unable to load government dashboard."
        );
      }
    } catch (err) {
      console.error("Government dashboard error:", err);
      setError(
        err.response?.data?.message || "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const totalComplaints = problems.length;

  const getCount = (status) =>
    problems.filter((problem) => problem.status === status).length;

  const pendingCount = getCount("Pending");
  const underReviewCount = getCount("Under Review");
  const inProgressCount = getCount("In Progress");
  const resolvedCount = getCount("Resolved");
  const rejectedCount = getCount("Rejected");
  const validatedCount = getCount("Validated");

  const criticalCount = problems.filter(
    (problem) => problem.priority === "Critical"
  ).length;

  const highCount = problems.filter(
    (problem) => problem.priority === "High"
  ).length;

  const resolutionRate = totalComplaints
    ? Math.round((resolvedCount / totalComplaints) * 100)
    : 0;

  // District statistics
  const districtCounts = problems.reduce((acc, problem) => {
    const district = problem.district || "Unassigned";
    acc[district] = (acc[district] || 0) + 1;
    return acc;
  }, {});

  const topDistricts = Object.entries(districtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recentComplaints = [...problems]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <PageHeader
          eyebrow="State Administration Command Center"
          title="Government Dashboard"
          description="Real-time monitoring of citizen grievances, AI classification, and inter-departmental action"
        >
          <button
            type="button"
            onClick={fetchProblems}
            className="flex items-center gap-2 rounded-xl border border-[#DDEDE4] bg-white px-3.5 py-2.5 text-xs font-bold text-[#5D7469] transition hover:bg-[#F2F8F4] hover:text-[#2E7D5B]"
            title="Refresh Dashboard"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/government/problems")}
            className="flex items-center gap-2 rounded-xl bg-[#2E7D5B] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(46,125,91,0.18)] transition hover:bg-[#246748]"
          >
            <span>Manage Problems</span>
            <ArrowRight size={14} />
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

        {/* KPI CARDS (6 columns) */}
        <div className="mb-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            icon={<FileText size={18} />}
            label="Total Filed"
            value={totalComplaints}
            color="green"
            onClick={() => navigate("/government/problems")}
          />
          <StatCard
            icon={<Clock3 size={18} />}
            label="Pending Review"
            value={pendingCount}
            color="orange"
            onClick={() => navigate("/government/problems?status=Pending")}
          />
          <StatCard
            icon={<ShieldCheck size={18} />}
            label="Validated"
            value={validatedCount}
            color="green"
            onClick={() => navigate("/government/problems?status=Validated")}
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="In Progress"
            value={inProgressCount + underReviewCount}
            color="green"
            onClick={() => navigate("/government/problems?status=In Progress")}
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Resolved"
            value={resolvedCount}
            color="green"
            onClick={() => navigate("/government/problems?status=Resolved")}
          />
          <StatCard
            icon={<XCircle size={18} />}
            label="Rejected"
            value={rejectedCount}
            color="red"
            onClick={() => navigate("/government/problems?status=Rejected")}
          />
        </div>

        {/* ANALYTICAL ROW (Priority alerts + Resolution rate) */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Priority Escalations Card */}
          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E5A72F]">
                  Immediate Attention Required
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-[#18352A]">
                  Priority Escalations
                </h2>
              </div>
              <span className="rounded-full bg-[#FFF6E5] px-3 py-1 text-xs font-bold text-[#A46308]">
                {criticalCount + highCount} Escalated
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => navigate("/government/problems?priority=Critical")}
                className="group cursor-pointer rounded-2xl border border-red-200 bg-red-50/60 p-4.5 transition hover:bg-red-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                    Critical Priority
                  </span>
                  <AlertCircle size={18} className="text-red-600" />
                </div>
                <p className="mt-3 text-3xl font-black text-red-800">
                  {criticalCount}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-red-600 group-hover:underline">
                  Filter critical grievances →
                </p>
              </div>

              <div
                onClick={() => navigate("/government/problems?priority=High")}
                className="group cursor-pointer rounded-2xl border border-[#F6D99D] bg-[#FFF6E5]/70 p-4.5 transition hover:bg-[#FFF6E5]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A46308] uppercase tracking-wider">
                    High Priority
                  </span>
                  <AlertTriangle size={18} className="text-[#E5A72F]" />
                </div>
                <p className="mt-3 text-3xl font-black text-[#8A4F00]">
                  {highCount}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#A46308] group-hover:underline">
                  Filter high grievances →
                </p>
              </div>
            </div>
          </div>

          {/* Resolution Rate Card */}
          <div className="flex flex-col justify-between rounded-[26px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2E7D5B]">
                    Performance Metrics
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#18352A]">
                    Overall Resolution Efficiency
                  </h2>
                </div>
                <span className="rounded-full bg-[#EAF7F0] px-3 py-1 text-xs font-bold text-[#246748]">
                  State Average
                </span>
              </div>

              <div className="mt-5 flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-[#DDF1E5] bg-[#EAF7F0]">
                  <span className="text-2xl font-black text-[#2E7D5B]">
                    {resolutionRate}%
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-extrabold text-[#18352A]">
                    {resolvedCount} of {totalComplaints} Problems Resolved
                  </p>
                  <p className="mt-1 text-xs text-[#667A70]">
                    Reflects grievances verified and marked as solved across all 24 administrative districts.
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5F2EA]">
                <div
                  className="h-full rounded-full bg-[#2E7D5B] transition-all duration-700"
                  style={{ width: `${Math.min(resolutionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN SECTION: Recent Complaints + District Breakdown */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Complaints (2 cols) */}
          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)] lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#18352A]">
                  Recent Civic Complaints
                </h2>
                <p className="text-xs text-[#789087]">
                  Latest submissions requiring government action
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/government/problems")}
                className="text-xs font-bold text-[#2E7D5B] hover:underline"
              >
                View all ({totalComplaints}) →
              </button>
            </div>

            {loading ? (
              <LoadingState cards={2} />
            ) : recentComplaints.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#789087]">
                No grievances registered in the system yet.
              </p>
            ) : (
              <div className="divide-y divide-[#EDF4F0] overflow-hidden">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    onClick={() => navigate(`/government/problems/${complaint._id}`)}
                    className="group flex cursor-pointer items-center justify-between py-3.5 transition hover:bg-[#F7FBF8] -mx-2 px-2 rounded-xl"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={complaint.status || "Pending"} size="sm" />
                        <StatusBadge
                          status={complaint.priority || "Medium"}
                          variant="priority"
                          size="sm"
                        />
                        {complaint.governmentDepartment && (
                          <span className="rounded bg-[#FAFDFB] border border-[#DDEDE4] px-2 py-0.5 text-[10px] font-bold text-[#4D6459]">
                            {complaint.governmentDepartment}
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 truncate text-sm font-bold text-[#18352A] transition group-hover:text-[#2E7D5B]">
                        {complaint.title}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#789087]">
                        {complaint.district || "Jharkhand"} • {formatDate(complaint.createdAt)}
                      </p>
                    </div>

                    <ArrowRight
                      size={15}
                      className="shrink-0 text-[#A0B0A8] transition group-hover:translate-x-1 group-hover:text-[#2E7D5B]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* District Breakdown (1 col) */}
          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
            <div className="mb-4">
              <h2 className="text-base font-extrabold text-[#18352A]">
                Top Affected Districts
              </h2>
              <p className="text-xs text-[#789087]">
                Concentration of citizen grievances
              </p>
            </div>

            {topDistricts.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#789087]">
                No district data available.
              </p>
            ) : (
              <div className="space-y-4">
                {topDistricts.map(([district, count]) => {
                  const percentage = totalComplaints
                    ? Math.round((count / totalComplaints) * 100)
                    : 0;

                  return (
                    <div
                      key={district}
                      onClick={() =>
                        navigate(`/government/problems?district=${district}`)
                      }
                      className="group cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[#18352A]">
                        <span className="flex items-center gap-1.5 transition group-hover:text-[#2E7D5B]">
                          <MapPin size={13} className="text-[#2E7D5B]" />
                          {district}
                        </span>
                        <span className="text-[#789087]">
                          {count} ({percentage}%)
                        </span>
                      </div>

                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E5F2EA]">
                        <div
                          className="h-full rounded-full bg-[#2E7D5B] transition-all"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}