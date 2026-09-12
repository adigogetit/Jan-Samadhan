import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FolderGit2,
  Handshake,
  ArrowRight,
  Sparkles,
  Users,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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

const StatCard = ({ title, value, subtitle, icon: Icon, color, linkTo }) => {
  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-[#172B3A]">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      {linkTo && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#1F6F8B] opacity-0 transition group-hover:opacity-100">
          View details <ArrowRight size={12} />
        </div>
      )}
    </div>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
};

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
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HERO BANNER
        ====================================================== */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-[#172B3A] via-[#1F4056] to-[#1F6F8B] p-6 text-white shadow-md md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles size={14} className="text-amber-300" />
                <span>Industry & Investor Collaboration Hub</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold md:text-3xl">
                Welcome, {user?.name || "Industry Partner"}!
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Discover university-driven civic innovation projects across Jharkhand.
                Partner with student innovators and academic researchers through mentorship,
                technical collaboration, and pilot support.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/investor/projects"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#172B3A] shadow-sm transition hover:bg-slate-100"
              >
                <Search size={16} />
                Browse Projects
              </Link>
              <Link
                to="/investor/interests"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <Handshake size={16} />
                My Interests
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR BANNER
        ====================================================== */}
        {error && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={loadDashboard}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-200"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ====================================================== */}
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Partnership Portfolio
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Available Projects"
              value={stats.availableProjects}
              subtitle="Open for industry collaboration"
              icon={FolderGit2}
              color="bg-blue-50 text-blue-600"
              linkTo="/investor/projects"
            />
            <StatCard
              title="My Interested Projects"
              value={stats.myInterestedProjects}
              subtitle="Projects you have expressed interest in"
              icon={Handshake}
              color="bg-purple-50 text-purple-600"
              linkTo="/investor/interests"
            />
            <StatCard
              title="Pending Requests"
              value={stats.pendingRequests}
              subtitle="Under review by university"
              icon={Clock}
              color="bg-amber-50 text-amber-600"
              linkTo="/investor/interests?status=Pending"
            />
            <StatCard
              title="Accepted Partnerships"
              value={stats.acceptedPartnerships}
              subtitle="Approved by universities"
              icon={CheckCircle2}
              color="bg-emerald-50 text-emerald-600"
              linkTo="/investor/interests?status=Accepted"
            />
            <StatCard
              title="Supported Projects"
              value={stats.supportedProjects}
              subtitle="Active industry partner roles"
              icon={Briefcase}
              color="bg-cyan-50 text-cyan-600"
              linkTo="/investor/projects?supported=true"
            />
          </div>
        </div>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Actions
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <button
              onClick={() => navigate("/investor/projects")}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1F6F8B] hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Search size={20} />
                </div>
                <div>
                  <p className="font-semibold text-[#172B3A]">Browse Projects</p>
                  <p className="text-xs text-slate-500">Explore civic innovations</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </button>

            <button
              onClick={() => navigate("/investor/interests")}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1F6F8B] hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Handshake size={20} />
                </div>
                <div>
                  <p className="font-semibold text-[#172B3A]">My Interests</p>
                  <p className="text-xs text-slate-500">Track submitted requests</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </button>

            <button
              onClick={() => navigate("/investor/projects?supported=true")}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1F6F8B] hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="font-semibold text-[#172B3A]">Supported Projects</p>
                  <p className="text-xs text-slate-500">Active partnerships</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* =====================================================
            AVAILABLE PROJECTS FOR PARTNERSHIP
        ====================================================== */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#172B3A]">
                Available Projects for Collaboration
              </h2>
              <p className="text-xs text-slate-500">
                Civic solutions seeking mentorship, technical collaboration, and industry partnership
              </p>
            </div>
            {recentProjects.length > 0 && (
              <Link
                to="/investor/projects"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#1F6F8B] hover:underline"
              >
                View all ({stats.availableProjects}) <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="h-5 w-24 rounded-full bg-slate-200" />
                  <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
                  <div className="mt-3 h-16 rounded bg-slate-100" />
                  <div className="mt-4 h-4 w-1/2 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FolderGit2 size={32} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#172B3A]">
                No Projects Available Yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                There are currently no active university projects available for external industry interest. Check back soon as universities create new civic projects.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => {
                const problem = project.problem || {};

                return (
                  <div
                    key={project._id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      {/* Category & Status */}
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
                      <h3 className="mt-4 line-clamp-2 text-base font-bold text-[#172B3A]">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">
                        {project.description || "No project description provided."}
                      </p>

                      {/* Details Meta */}
                      <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">District:</span>
                          <span className="font-medium text-slate-700">
                            {project.district || problem.district || "Jharkhand"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">University:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[160px]">
                            {project.university?.name || "University"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Faculty Lead:</span>
                          <span className="font-medium text-slate-700">
                            {project.facultyLead?.name || "Not assigned"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Student Team:</span>
                          <span className="font-medium text-slate-700">
                            {project.studentsCount} Student{project.studentsCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View Project Button */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <Link
                        to={`/investor/projects/${project._id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#172B3A] py-2.5 text-xs font-semibold text-white transition hover:bg-[#23445A]"
                      >
                        View Project <ArrowRight size={14} />
                      </Link>
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
