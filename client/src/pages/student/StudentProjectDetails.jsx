import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Users,
  AlertCircle,
  FileText,
  Target,
  Lightbulb,
  ShieldCheck,
  History,
  XCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const LIFECYCLE_STEPS = [
  "Planning",
  "Development",
  "Testing",
  "Pilot",
  "Deployment",
  "Completed",
];

const statusStyles = {
  Planning: "bg-slate-100 text-slate-700 border-slate-200",
  Development: "bg-blue-50 text-blue-700 border-blue-200",
  Testing: "bg-amber-50 text-amber-700 border-amber-200",
  Pilot: "bg-purple-50 text-purple-700 border-purple-200",
  Deployment: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

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

const formatDateTime = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function StudentProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const [accepting, setAccepting] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState("");
  const [acceptError, setAcceptError] = useState("");

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");
      setIsUnauthorized(false);

      const response = await api.get(`/student/projects/${id}`);

      if (response.data?.success) {
        setProject(response.data.project);
      } else {
        setError(response.data?.message || "Failed to load project details.");
      }
    } catch (err) {
      console.error("Failed to load project:", err);
      if (err.response?.status === 403) {
        setIsUnauthorized(true);
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load project details. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async () => {
    try {
      setAccepting(true);
      setAcceptError("");
      setAcceptSuccess("");

      const response = await api.post(`/student/projects/${id}/accept`);

      if (response.data?.success) {
        setAcceptSuccess("Project assignment accepted successfully!");
        if (response.data.project) {
          setProject(response.data.project);
        } else {
          await fetchProject();
        }
      } else {
        setAcceptError(
          response.data?.message || "Failed to accept assignment."
        );
      }
    } catch (err) {
      console.error("Accept assignment error:", err);
      setAcceptError(
        err.response?.data?.message ||
          "Unable to accept project assignment. Please try again."
      );
    } finally {
      setAccepting(false);
    }
  };

  const hasAccepted = () => {
    if (!user?._id || !Array.isArray(project?.acceptedStudents)) return false;
    return project.acceptedStudents.some(
      (s) => (s._id || s).toString() === user._id.toString()
    );
  };

  const isStudentAccepted = (studentId) => {
    if (!Array.isArray(project?.acceptedStudents)) return false;
    return project.acceptedStudents.some(
      (s) => (s._id || s).toString() === studentId.toString()
    );
  };

  // 403 Access Denied State
  if (isUnauthorized) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6 md:p-12">
        <div className="mx-auto max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <XCircle size={36} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#172B3A]">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            You are not assigned to this project. Student access is strictly limited to projects where your university has explicitly enrolled your student account.
          </p>
          <Link
            to="/student/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#172B3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#23445A]"
          >
            <ArrowLeft size={16} /> Return to My Projects
          </Link>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6 md:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-32 rounded-2xl bg-white p-6" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 rounded-2xl bg-white lg:col-span-2" />
            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !project) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6 md:p-12">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle size={36} className="mx-auto text-amber-500" />
          <h2 className="mt-3 text-lg font-bold text-[#172B3A]">
            Project Unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error || "Project could not be found."}
          </p>
          <Link
            to="/student/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#172B3A] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#23445A]"
          >
            <ArrowLeft size={14} /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const problem = project.problem || {};
  const currentStatusIndex = LIFECYCLE_STEPS.indexOf(project.status);
  const isCancelled = project.status === "Cancelled";
  const myAcceptanceStatus = hasAccepted();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            TOP NAVIGATION & BREADCRUMB
        ====================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/student/projects"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={14} /> Back to My Projects
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                statusStyles[project.status] || "bg-slate-100 text-slate-700"
              }`}
            >
              Status: {project.status}
            </span>

            {myAcceptanceStatus ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={13} /> Assignment Accepted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Clock size={13} /> Assignment Pending
              </span>
            )}
          </div>
        </div>

        {/* =====================================================
            ASSIGNMENT ACKNOWLEDGEMENT CALL-TO-ACTION BANNER
        ====================================================== */}
        {!myAcceptanceStatus && (
          <div className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-amber-800">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-amber-900">
                    Action Required: Accept Project Assignment
                  </h2>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed max-w-2xl">
                    Your university administration has assigned you as a student team member on this project.
                    Please review the project details below and click accept to confirm your participation.
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={handleAcceptAssignment}
                  disabled={accepting}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-700 disabled:opacity-50"
                >
                  {accepting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Accept Assignment
                    </>
                  )}
                </button>
              </div>
            </div>

            {acceptError && (
              <p className="mt-3 text-xs font-medium text-red-600">
                {acceptError}
              </p>
            )}
          </div>
        )}

        {acceptSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            {acceptSuccess}
          </div>
        )}

        {/* =====================================================
            PROJECT HERO / HEADER
        ====================================================== */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {project.category || problem.category || "General"}
                </span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {project.district || problem.district || "Jharkhand"}
                </span>
                <span className="text-xs text-slate-400">
                  Created {formatDate(project.createdAt)}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-[#172B3A] md:text-3xl">
                {project.title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <Building2 size={14} className="text-slate-400" />
                <span className="font-semibold text-slate-700">
                  {project.university?.name || "Assigned University"}
                </span>
                {project.university?.department && (
                  <span>· {project.university.department}</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Project Description
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Objective & Proposed Solution */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {project.objective && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Target size={14} className="text-[#1F6F8B]" />
                  <span>Objective</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {project.objective}
                </p>
              </div>
            )}

            {project.proposedSolution && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>Proposed Solution</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {project.proposedSolution}
                </p>
              </div>
            )}
          </div>

          {/* Dates Row */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3 text-xs">
            <div>
              <p className="text-slate-400">Start Date</p>
              <p className="mt-1 font-semibold text-slate-700">
                {formatDate(project.startDate || project.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Expected Completion</p>
              <p className="mt-1 font-semibold text-slate-700">
                {formatDate(project.expectedCompletionDate)}
              </p>
            </div>
            {project.completedAt && (
              <div>
                <p className="text-slate-400">Completed Date</p>
                <p className="mt-1 font-semibold text-emerald-700">
                  {formatDate(project.completedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            PROJECT LIFECYCLE PROGRESSION DISPLAY (Requirement 6)
        ====================================================== */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#172B3A]">
                Project Lifecycle & Progression
              </h2>
              <p className="text-xs text-slate-500">
                Monitored by University Administration · Current stage: <strong className="text-slate-700">{project.status}</strong>
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
              <Info size={12} /> Student View Mode (Read Only)
            </div>
          </div>

          {isCancelled ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <XCircle size={32} className="mx-auto text-red-500" />
              <h3 className="mt-2 text-base font-bold text-red-800">
                Project Cancelled
              </h3>
              <p className="mt-1 text-xs text-red-600">
                This project has been cancelled by the university administration.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              {/* Stepper for Desktop & Mobile */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const isCurrent = step === project.status;
                  const isPassed = currentStatusIndex > idx;

                  return (
                    <div
                      key={step}
                      className={`relative flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                        isCurrent
                          ? "border-[#1F6F8B] bg-blue-50/50 shadow-sm ring-2 ring-[#1F6F8B]/20"
                          : isPassed
                          ? "border-emerald-200 bg-emerald-50/30"
                          : "border-slate-200 bg-slate-50/50 opacity-60"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          isCurrent
                            ? "bg-[#1F6F8B] text-white animate-pulse"
                            : isPassed
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>

                      <p
                        className={`mt-2 text-xs font-bold ${
                          isCurrent
                            ? "text-[#1F6F8B]"
                            : isPassed
                            ? "text-emerald-800"
                            : "text-slate-600"
                        }`}
                      >
                        {step}
                      </p>

                      <span className="mt-1 text-[10px] text-slate-400">
                        {isCurrent ? "In Progress" : isPassed ? "Done" : "Upcoming"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            TWO-COLUMN SECTION: PROBLEM & TEAM
        ====================================================== */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left Column (2 cols): Source Problem */}
          <div className="space-y-6 lg:col-span-2">
            {/* Source Problem Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#1F6F8B]" />
                  <h2 className="text-base font-bold text-[#172B3A]">
                    Source Civic Problem
                  </h2>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                  {problem.priority || "Medium"} Priority
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <h3 className="text-lg font-bold text-[#172B3A]">
                  {problem.title || "Problem information unavailable"}
                </h3>

                <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                  {problem.description || "No further details available."}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs sm:grid-cols-3">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <p className="font-semibold text-slate-700">{problem.category || "Other"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">District:</span>
                    <p className="font-semibold text-slate-700">{problem.district || "Jharkhand"}</p>
                  </div>
                  {problem.block && (
                    <div>
                      <span className="text-slate-400">Block:</span>
                      <p className="font-semibold text-slate-700">{problem.block}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Validation Status:</span>
                    <p className="font-semibold text-emerald-700">
                      {problem.validationStatus || "Validated"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline (Requirement 7) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <History size={18} className="text-[#1F6F8B]" />
                <h2 className="text-base font-bold text-[#172B3A]">
                  Activity Timeline
                </h2>
              </div>

              {Array.isArray(project.activityTimeline) &&
              project.activityTimeline.length > 0 ? (
                <div className="mt-6 flow-root">
                  <ul className="-mb-8">
                    {project.activityTimeline.map((item, idx) => {
                      const isLast =
                        idx === project.activityTimeline.length - 1;

                      return (
                        <li key={item._id || idx}>
                          <div className="relative pb-8">
                            {!isLast && (
                              <span
                                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex items-start space-x-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 ring-4 ring-white">
                                <History size={14} />
                              </div>
                              <div className="min-w-0 flex-1 pt-0.5">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <p className="text-xs font-bold text-[#172B3A]">
                                    {item.action}
                                  </p>
                                  <span className="text-[11px] text-slate-400">
                                    {formatDateTime(item.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-600">
                                  {item.description}
                                </p>
                                {item.performedBy && (
                                  <p className="mt-1 text-[11px] text-slate-400">
                                    By: {item.performedBy.name || item.performedBy.email} (
                                    {item.performedBy.role || "User"})
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-500">
                  No activity recorded yet.
                </p>
              )}
            </div>
          </div>

          {/* Right Column (1 col): Faculty Lead & Team */}
          <div className="space-y-6">

            {/* Faculty Lead Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <UserCheck size={18} className="text-[#1F6F8B]" />
                <h2 className="text-base font-bold text-[#172B3A]">
                  Faculty Lead
                </h2>
              </div>

              {project.facultyLead ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 font-bold text-[#1F6F8B]">
                      {project.facultyLead.name?.charAt(0)?.toUpperCase() || "F"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#172B3A]">
                        {project.facultyLead.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {project.facultyLead.email}
                      </p>
                    </div>
                  </div>

                  {project.facultyLead.department && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                      <span className="text-slate-400">Department: </span>
                      <span className="font-semibold text-slate-700">
                        {project.facultyLead.department}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs text-slate-500">
                    Faculty lead has not been assigned yet.
                  </p>
                </div>
              )}
            </div>

            {/* Student Team Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#1F6F8B]" />
                  <h2 className="text-base font-bold text-[#172B3A]">
                    Student Team
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {Array.isArray(project.students) ? project.students.length : 0}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {Array.isArray(project.students) &&
                project.students.length > 0 ? (
                  project.students.map((student) => {
                    const isMe =
                      (student._id || student).toString() ===
                      user?._id?.toString();
                    const accepted = isStudentAccepted(student._id || student);

                    return (
                      <div
                        key={student._id || student}
                        className={`flex items-start justify-between rounded-2xl border p-3 text-xs transition ${
                          isMe
                            ? "border-[#1F6F8B]/40 bg-blue-50/40"
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-[#172B3A]">
                              {student.name || "Student"}
                            </p>
                            {isMe && (
                              <span className="rounded bg-[#172B3A] px-1.5 py-0.2 text-[10px] font-bold text-white">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {student.email}
                          </p>
                          {student.department && (
                            <p className="text-[10px] text-slate-400">
                              {student.department}
                            </p>
                          )}
                        </div>

                        <div>
                          {accepted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                              <CheckCircle2 size={10} /> Accepted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              <Clock size={10} /> Assigned
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No students currently assigned.
                  </p>
                )}
              </div>

              <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400 text-center">
                Team assignment is managed by University Administrators.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
