import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  FolderGit2,
  Handshake,
  ArrowRight,
  Sparkles,
  Users,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import AlertBanner from "../../components/ui/AlertBanner";

export default function InvestorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    availableProjects: 0,
    myInterestedProjects: 0,
    pendingRequests: 0,
    acceptedPartnerships: 0,
    supportedProjects: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/investor/dashboard");

      if (response.data?.success) {
        setStats(
          response.data.stats || {
            availableProjects: 0,
            myInterestedProjects: 0,
            pendingRequests: 0,
            acceptedPartnerships: 0,
            supportedProjects: 0,
          }
        );
        setRecentProjects(response.data.recentProjects || []);
      } else {
        setError(response.data?.message || "Failed to load dashboard data.");
      }
    } catch (err) {
      console.error("Investor dashboard error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load investor dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HERO BANNER */}
        <div className="relative mb-8 overflow-hidden rounded-[28px] border border-[#DDEDE4] bg-gradient-to-br from-[#18352A] via-[#1F4335] to-[#18352A] p-6 text-white shadow-[0_12px_45px_rgba(24,53,42,0.08)] sm:p-8">
          {/* Ambient decorative elements */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#2E7D5B]/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#2E7D5B]/15 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#A0D4B8] backdrop-blur-sm border border-white/10">
                <Sparkles size={13} />
                <span>Industry & Investor Collaboration Hub</span>
              </div>
              <h1 className="mt-3 text-2xl font-black md:text-3xl text-white tracking-tight">
                Welcome, {user?.name || "Industry Partner"}!
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-[#CFE7D8]">
                Discover university-driven civic innovation projects across Jharkhand.
                Partner with student innovators and academic researchers through mentorship,
                technical collaboration, and pilot deployment support.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadDashboard}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                to="/investor/projects"
                className="flex items-center gap-2 rounded-xl bg-[#2E7D5B] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#246748]"
              >
                <span>Browse Projects</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6">
            <AlertBanner
              type="error"
              message={error}
              onRetry={loadDashboard}
              onDismiss={() => setError("")}
            />
          </div>
        )}

        {/* STATS (4 columns) */}
        <div className="mb-8 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <StatCard
            icon={<FolderGit2 size={18} />}
            label="Available for Support"
            value={stats.availableProjects}
            color="green"
            onClick={() => navigate("/investor/projects")}
          />
          <StatCard
            icon={<Briefcase size={18} />}
            label="Expressed Interests"
            value={stats.myInterestedProjects}
            color="green"
            onClick={() => navigate("/investor/interests")}
          />
          <StatCard
            icon={<Clock size={18} />}
            label="Pending Responses"
            value={stats.pendingRequests}
            color="orange"
            onClick={() => navigate("/investor/interests?status=pending")}
          />
          <StatCard
            icon={<Handshake size={18} />}
            label="Active Partnerships"
            value={stats.acceptedPartnerships}
            color="green"
            onClick={() => navigate("/investor/interests?status=accepted")}
          />
        </div>

        {/* FEATURED PROJECTS FOR INDUSTRY */}
        <div className="rounded-[28px] border border-[#DDEDE4] bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#18352A]">
                Featured Innovation Projects
              </h2>
              <p className="text-xs text-[#789087]">
                Civic prototypes ready for industry mentorship, resource grants, or deployment partnerships
              </p>
            </div>

            <Link
              to="/investor/projects"
              className="text-xs font-bold text-[#2E7D5B] hover:underline inline-flex items-center gap-1"
            >
              Explore All Projects
              <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <LoadingState cards={2} />
          ) : recentProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DDEDE4] bg-[#FAFDFB] p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF7F0] text-[#2E7D5B]">
                <FolderGit2 size={24} />
              </div>
              <p className="text-sm font-extrabold text-[#18352A]">
                No active innovation projects listed yet
              </p>
              <p className="mt-1 text-xs text-[#667A70]">
                University teams will list their prototypes here once approved by institutional faculty.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => {
                const universityName =
                  project.university?.name ||
                  project.university?.institutionName ||
                  "Institution";

                return (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/investor/projects/${project._id}`)}
                    className="group flex cursor-pointer flex-col justify-between rounded-[22px] border border-[#DDEDE4] border-l-4 border-l-[#2E7D5B] bg-white p-5 shadow-[0_4px_18px_rgba(24,53,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,53,42,0.08)]"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-[#F0F9F3] px-2.5 py-1 text-[11px] font-bold text-[#246748]">
                          {project.problem?.category || "Civic Tech"}
                        </span>
                        <StatusBadge status={project.status || "Development"} size="sm" />
                      </div>

                      {/* Title */}
                      <h3 className="mt-3 text-base font-extrabold text-[#18352A] transition group-hover:text-[#2E7D5B] line-clamp-1">
                        {project.title}
                      </h3>

                      {/* Problem reference */}
                      {project.problem?.title && (
                        <p className="mt-1 text-xs font-semibold text-[#789087] truncate">
                          Target: {project.problem.title}
                        </p>
                      )}

                      {/* Description */}
                      <p className="mt-2 text-xs leading-5 text-[#667A70] line-clamp-2">
                        {project.description || "No project description provided."}
                      </p>

                      {/* University info */}
                      <div className="mt-4 rounded-xl border border-[#EDF4F0] bg-[#FAFDFB] p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">
                          Host Institution
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-[#18352A] truncate">
                          {universityName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#EDF4F0] pt-3 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#789087]">
                        {project.students?.length || 0} Student Innovators
                      </span>

                      <span className="text-xs font-extrabold text-[#2E7D5B] group-hover:underline inline-flex items-center gap-1">
                        Review Prototype
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
