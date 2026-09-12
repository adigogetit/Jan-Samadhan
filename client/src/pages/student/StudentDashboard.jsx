import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  FolderGit2,
  Activity,
  CheckCircle2,
  FlaskConical,
  Building2,
  UserCheck,
  Clock,
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

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    testingProjects: 0,
    pilotProjects: 0,
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

      const response = await api.get("/student/dashboard");

      if (response.data?.success) {
        setStats(
          response.data.stats || {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            testingProjects: 0,
            pilotProjects: 0,
          }
        );
        setRecentProjects(response.data.recentProjects || []);
      } else {
        setError(response.data?.message || "Failed to load student dashboard.");
      }
    } catch (err) {
      console.error("Student dashboard error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load student dashboard. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const isAcceptedByMe = (project) => {
    if (!user?._id || !Array.isArray(project?.acceptedStudents)) return false;
    return project.acceptedStudents.some(
      (s) => (s._id || s).toString() === user._id.toString()
    );
  };

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HERO BANNER */}
        <div className="relative mb-8 overflow-hidden rounded-[28px] border border-[#DDEDE4] bg-gradient-to-br from-[#18352A] via-[#1F4335] to-[#18352A] p-6 text-white shadow-[0_12px_45px_rgba(24,53,42,0.08)] sm:p-8">
          {/* Decorative ambient elements */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#2E7D5B]/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#2E7D5B]/15 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#A0D4B8] backdrop-blur-sm border border-white/10">
                <Sparkles size={13} />
                <span>Student Innovation Workspace</span>
              </div>
              <h1 className="mt-3 text-2xl font-black md:text-3xl text-white tracking-tight">
                Welcome back, {user?.name || "Student Innovator"}!
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-[#CFE7D8]">
                Collaborate with faculty leads, build prototypes for accepted civic problems, and document real-world impact across Jharkhand.
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
                to="/student/projects"
                className="flex items-center gap-2 rounded-xl bg-[#2E7D5B] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#246748]"
              >
                <span>My Projects</span>
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
            label="Assigned Projects"
            value={stats.totalProjects}
            color="green"
            onClick={() => navigate("/student/projects")}
          />
          <StatCard
            icon={<Activity size={18} />}
            label="In Progress / Active"
            value={stats.activeProjects}
            color="green"
            onClick={() => navigate("/student/projects")}
          />
          <StatCard
            icon={<FlaskConical size={18} />}
            label="Testing Phase"
            value={stats.testingProjects}
            color="orange"
            onClick={() => navigate("/student/projects")}
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Completed"
            value={stats.completedProjects}
            color="green"
            onClick={() => navigate("/student/projects")}
          />
        </div>

        {/* RECENT ASSIGNED PROJECTS */}
        <div className="rounded-[28px] border border-[#DDEDE4] bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#18352A]">
                Recent Assigned Projects
              </h2>
              <p className="text-xs text-[#789087]">
                Civic innovation initiatives you are currently assigned to
              </p>
            </div>

            <Link
              to="/student/projects"
              className="text-xs font-bold text-[#2E7D5B] hover:underline inline-flex items-center gap-1"
            >
              View All Projects
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
                No projects assigned to you yet
              </p>
              <p className="mt-1 text-xs text-[#667A70]">
                When your university faculty assigns you to an innovation project, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => {
                const accepted = isAcceptedByMe(project);
                const facultyName =
                  project.facultyLead?.name ||
                  project.facultyLead?.email ||
                  "Faculty Lead Unassigned";

                return (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/student/projects/${project._id}`)}
                    className="group flex cursor-pointer flex-col justify-between rounded-[22px] border border-[#DDEDE4] border-l-4 border-l-[#2E7D5B] bg-white p-5 shadow-[0_4px_18px_rgba(24,53,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,53,42,0.08)]"
                  >
                    <div>
                      {/* Status row */}
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={project.status || "Planning"} size="sm" />

                        {accepted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7F0] border border-[#CBE8D7] px-2.5 py-0.5 text-[10px] font-bold text-[#246748]">
                            <UserCheck size={11} />
                            Accepted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6E5] border border-[#F6D99D] px-2.5 py-0.5 text-[10px] font-bold text-[#A46308]">
                            <Clock size={11} />
                            Invitation Pending
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mt-3 text-base font-extrabold text-[#18352A] transition group-hover:text-[#2E7D5B] line-clamp-1">
                        {project.title}
                      </h3>

                      {/* Problem tag */}
                      {project.problem?.title && (
                        <p className="mt-1 text-xs font-semibold text-[#789087] truncate">
                          Problem: {project.problem.title}
                        </p>
                      )}

                      {/* Description */}
                      <p className="mt-2 text-xs leading-5 text-[#667A70] line-clamp-2">
                        {project.description || "No project description provided."}
                      </p>

                      {/* Faculty info */}
                      <div className="mt-4 rounded-xl border border-[#EDF4F0] bg-[#FAFDFB] p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">
                          Faculty Mentor
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-[#18352A] truncate">
                          {facultyName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#EDF4F0] pt-3 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#789087]">
                        {project.students?.length || 1} Team Member{(project.students?.length || 1) === 1 ? "" : "s"}
                      </span>

                      <span className="text-xs font-extrabold text-[#2E7D5B] group-hover:underline inline-flex items-center gap-1">
                        Open Project
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
