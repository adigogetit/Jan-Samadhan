import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  FolderKanban,
  GraduationCap,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";

export default function UniversityDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    validatedProblems: 0,
    recommendedProblems: 0,
    acceptedProblems: 0,
    projects: 0,
    activeProjects: 0,
  });

  const [problems, setProblems] = useState([]);
  const [recommendedProblems, setRecommendedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUniversityData();
  }, []);

  const loadUniversityData = async () => {
    try {
      setLoading(true);

      const response = await api.get("/university/dashboard");

      if (response.data?.success) {
        setStats(response.data.stats || stats);
        setProblems(response.data.problems || []);
        setRecommendedProblems(response.data.recommendedProblems || []);
      }
    } catch (error) {
      console.error("University dashboard error:", error);
      setProblems([]);
      setRecommendedProblems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <PageHeader
          eyebrow="Higher Education Institution Portal"
          title={`Welcome, ${user?.name || "University"}`}
          description="Discover civic problems matched to your university's domain expertise, faculty research, and student innovation capabilities."
        >
          <button
            type="button"
            onClick={loadUniversityData}
            className="flex items-center gap-2 rounded-xl border border-[#DDEDE4] bg-white px-3.5 py-2.5 text-xs font-bold text-[#5D7469] transition hover:bg-[#F2F8F4] hover:text-[#2E7D5B]"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/university/problems")}
            className="flex items-center gap-2 rounded-xl bg-[#2E7D5B] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(46,125,91,0.18)] transition hover:bg-[#246748]"
          >
            <span>Browse Problems</span>
            <ArrowRight size={14} />
          </button>
        </PageHeader>

        {/* STATS (5 columns) */}
        <div className="mb-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            icon={<Target size={18} />}
            label="AI Recommended"
            value={stats.recommendedProblems}
            color="green"
            onClick={() => navigate("/university/problems?recommended=true")}
          />
          <StatCard
            icon={<FileText size={18} />}
            label="Validated Problems"
            value={stats.validatedProblems}
            color="green"
            onClick={() => navigate("/university/problems")}
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Accepted Problems"
            value={stats.acceptedProblems}
            color="green"
            onClick={() => navigate("/university/projects")}
          />
          <StatCard
            icon={<FolderKanban size={18} />}
            label="Innovation Projects"
            value={stats.projects}
            color="green"
            onClick={() => navigate("/university/projects")}
          />
          <StatCard
            icon={<GraduationCap size={18} />}
            label="Active Projects"
            value={stats.activeProjects}
            color="green"
            onClick={() => navigate("/university/projects")}
          />
        </div>

        {/* AI RECOMMENDED SECTION */}
        <div className="mb-8 rounded-[28px] border border-[#DDEDE4] bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
          {/* Section banner header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#EDF4F0] pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF7F0] text-[#2E7D5B]">
                  <Sparkles size={16} />
                </div>
                <h2 className="text-lg font-extrabold text-[#18352A]">
                  AI Recommended Problems for Your Institution
                </h2>
                <span className="rounded-full bg-[#EAF7F0] border border-[#CBE8D7] text-[#246748] px-2.5 py-0.5 text-[11px] font-bold">
                  Smart Match Engine
                </span>
              </div>
              <p className="mt-1.5 text-xs text-[#667A70]">
                Problems matched by our deterministic matching engine specifically aligning with your NIRF profile, research centers, and departmental skills.
              </p>
            </div>

            <Link
              to="/university/problems?recommended=true"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D5B] hover:underline self-start sm:self-auto"
            >
              View All Recommendations
              <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <LoadingState cards={3} />
          ) : recommendedProblems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DDEDE4] bg-[#FAFDFB] p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF7F0] text-[#2E7D5B]">
                <Target size={24} />
              </div>
              <p className="text-sm font-extrabold text-[#18352A]">
                No direct institutional recommendations at this time
              </p>
              <p className="mt-1 text-xs text-[#667A70]">
                Validated civic problems in Jharkhand will automatically appear here once evaluated by the AI pipeline.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedProblems.slice(0, 3).map((problem) => {
                const matchScore =
                  problem.aiMatch?.totalMatchScore ||
                  problem.aiAnalysis?.universityMatches?.[0]?.totalMatchScore ||
                  85;

                return (
                  <div
                    key={problem._id}
                    onClick={() => navigate(`/university/problems/${problem._id}`)}
                    className="group flex cursor-pointer flex-col justify-between rounded-[22px] border border-[#DDEDE4] bg-[#FAFDFB] p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_30px_rgba(24,53,42,0.08)]"
                  >
                    <div>
                      {/* Category & Score chip */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-[#EAF7F0] px-2.5 py-1 text-[11px] font-bold text-[#246748]">
                          {problem.category || "Civic Innovation"}
                        </span>

                        <span className="rounded-full bg-[#EAF7F0] border border-[#CBE8D7] px-2.5 py-0.5 text-xs font-black text-[#2E7D5B]">
                          ★ {Math.round(matchScore)}/100
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-extrabold text-[#18352A] transition group-hover:text-[#2E7D5B] line-clamp-1">
                        {problem.title}
                      </h3>

                      <p className="mt-1.5 text-xs leading-5 text-[#667A70] line-clamp-2">
                        {problem.description}
                      </p>

                      {/* Matching reason tags */}
                      {problem.aiMatch?.reasons?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {problem.aiMatch.reasons.slice(0, 2).map((reason, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-white border border-[#DDEDE4] px-2 py-0.5 text-[10px] font-semibold text-[#5D7469] line-clamp-1"
                            >
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#EDF4F0] pt-3 text-[11px] text-[#789087]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#2E7D5B]" />
                        {problem.district || "Jharkhand"}
                      </span>

                      <span className="font-bold text-[#2E7D5B] group-hover:underline inline-flex items-center gap-1">
                        Inspect
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LOWER SECTION: All Validated Problems (2 cols) + Quick Actions (1 col) */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Validated Problems */}
          <div className="rounded-[28px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)] lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#18352A]">
                  All Validated Problems
                </h2>
                <p className="text-xs text-[#789087]">
                  Civic problems verified by government departments and ready for solution prototyping
                </p>
              </div>

              <Link
                to="/university/problems"
                className="text-xs font-bold text-[#2E7D5B] hover:underline"
              >
                View all ({problems.length}) →
              </Link>
            </div>

            {loading ? (
              <LoadingState cards={2} />
            ) : problems.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#789087]">
                No validated problems available for prototyping at this time.
              </p>
            ) : (
              <div className="divide-y divide-[#EDF4F0]">
                {problems.slice(0, 5).map((problem) => (
                  <div
                    key={problem._id}
                    onClick={() => navigate(`/university/problems/${problem._id}`)}
                    className="group flex cursor-pointer items-center justify-between py-3.5 -mx-2 px-2 rounded-xl transition hover:bg-[#F7FBF8]"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={problem.status || "Validated"} size="sm" />
                        <StatusBadge
                          status={problem.priority || "Medium"}
                          variant="priority"
                          size="sm"
                        />
                        {problem.category && (
                          <span className="rounded bg-[#FAFDFB] border border-[#DDEDE4] px-2 py-0.5 text-[10px] font-bold text-[#4D6459]">
                            {problem.category}
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 truncate text-sm font-bold text-[#18352A] transition group-hover:text-[#2E7D5B]">
                        {problem.title}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#789087]">
                        {problem.district || "Jharkhand"} • ID: {problem._id.slice(-6)}
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

          {/* Quick Actions Panel */}
          <div className="rounded-[28px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
            <h2 className="text-base font-extrabold text-[#18352A]">
              Quick Actions
            </h2>
            <p className="text-xs text-[#789087] mb-5">
              Institutional workflows and project management
            </p>

            <div className="space-y-3">
              <Link
                to="/university/problems"
                className="group flex items-center justify-between rounded-2xl border border-[#DDEDE4] bg-[#FAFDFB] p-4 transition hover:border-[#2E7D5B] hover:bg-[#F0F9F3]"
              >
                <div>
                  <p className="text-xs font-extrabold text-[#18352A] group-hover:text-[#2E7D5B]">
                    Browse Validated Problems
                  </p>
                  <p className="text-[11px] text-[#789087] mt-0.5">
                    Explore civic needs across Jharkhand
                  </p>
                </div>
                <ArrowRight size={15} className="text-[#A0B0A8] group-hover:text-[#2E7D5B] group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                to="/university/projects"
                className="group flex items-center justify-between rounded-2xl border border-[#DDEDE4] bg-[#FAFDFB] p-4 transition hover:border-[#2E7D5B] hover:bg-[#F0F9F3]"
              >
                <div>
                  <p className="text-xs font-extrabold text-[#18352A] group-hover:text-[#2E7D5B]">
                    Manage Innovation Projects
                  </p>
                  <p className="text-[11px] text-[#789087] mt-0.5">
                    Track student prototypes and faculty teams
                  </p>
                </div>
                <ArrowRight size={15} className="text-[#A0B0A8] group-hover:text-[#2E7D5B] group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
