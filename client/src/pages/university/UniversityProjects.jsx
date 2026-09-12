import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  FolderKanban,
  GraduationCap,
  Plus,
  RefreshCw,
  User,
  Users,
} from "lucide-react";
import api from "../../services/api";

import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import AlertBanner from "../../components/ui/AlertBanner";

export default function UniversityProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/university/projects");

      if (response.data?.success) {
        setProjects(response.data.projects || []);
      } else {
        setProjects([]);
        setError(
          response.data?.message || "Projects could not be loaded."
        );
      }
    } catch (err) {
      console.error("University projects error:", err);
      setError(
        err.response?.data?.message || "Failed to load university projects."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <PageHeader
          eyebrow="Institutional R&D Hub"
          title="University Innovation Projects"
          description="Track prototype development, assigned faculty advisors, and student teams for accepted civic problems."
          backPath="/university/dashboard"
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

          <Link
            to="/university/problems"
            className="flex items-center gap-2 rounded-xl bg-[#2E7D5B] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(46,125,91,0.18)] transition hover:bg-[#246748]"
          >
            <span>Accept New Problem</span>
            <ArrowRight size={14} />
          </Link>
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

        {/* PROJECTS CONTENT */}
        {loading ? (
          <LoadingState cards={3} />
        ) : projects.length === 0 ? (
          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-10">
            <EmptyState
              icon={<FolderKanban size={32} />}
              title="No active innovation projects"
              description="Your university has not accepted any civic problems yet. Browse validated problems to accept one and initiate a project."
              actionLabel="Browse Validated Problems"
              onAction={() => window.location.assign("/university/problems")}
            />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const studentCount = project.students?.length || 0;
              const facultyName =
                project.facultyLead?.name ||
                project.facultyLead?.email ||
                "Unassigned";

              return (
                <div
                  key={project._id}
                  className="group flex flex-col justify-between rounded-[24px] border border-[#DDEDE4] border-l-4 border-l-[#2E7D5B] bg-white p-5 shadow-[0_4px_18px_rgba(24,53,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,53,42,0.08)]"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-[#F0F9F3] px-2.5 py-1 text-[11px] font-bold text-[#246748]">
                        Project
                      </span>
                      <StatusBadge status={project.status || "Planning"} size="sm" />
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

                    {/* Team Meta Chips */}
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                      <span className="flex items-center gap-1 rounded-lg bg-[#F2F8F4] px-2.5 py-1 font-semibold text-[#4D6459]">
                        <User size={12} className="text-[#2E7D5B]" />
                        Lead: {facultyName}
                      </span>

                      <span className="flex items-center gap-1 rounded-lg bg-[#F2F8F4] px-2.5 py-1 font-semibold text-[#4D6459]">
                        <Users size={12} className="text-[#2E7D5B]" />
                        {studentCount} Student{studentCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 border-t border-[#EDF4F0] pt-3.5">
                    <Link
                      to={`/university/projects/${project._id}`}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2E7D5B] py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#246748]"
                    >
                      <span>Manage Project</span>
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