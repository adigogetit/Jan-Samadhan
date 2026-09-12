import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building2,
  UserCheck,
  Users,
  AlertCircle,
  FileText,
  Target,
  Lightbulb,
  Handshake,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  Send,
  X,
  ShieldAlert,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SUPPORT_TYPES = [
  "Mentorship",
  "Technical Support",
  "Industry Collaboration",
  "Resources",
  "Funding Interest",
  "Pilot Support",
  "Other",
];

const statusStyles = {
  Planning: "bg-[#F3F7F5] text-[#5C7067] border border-[#DDE8E2]",
  Development: "bg-[#EAF7F0] text-[#246748] border border-[#CBE8D7]",
  Testing: "bg-[#FFF6E5] text-[#A46308] border border-[#F6D99D]",
  Pilot: "bg-[#EAF7F0] text-[#246748] border border-[#CBE8D7]",
  Deployment: "bg-[#EAF7F0] text-[#246748] border border-[#CBE8D7]",
  Completed: "bg-[#EAF7F0] text-[#246748] border border-[#CBE8D7]",
  Cancelled: "bg-[#FFF0F0] text-[#B42318] border border-[#F3C5C5]",
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

export default function InvestorProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [userInterest, setUserInterest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: user?.department || user?.name || "",
    supportType: "Industry Collaboration",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/investor/projects/${id}`);

      if (response.data?.success) {
        setProject(response.data.project);
        setUserInterest(response.data.userInterest || null);
      } else {
        setError(response.data?.message || "Failed to load project details.");
      }
    } catch (err) {
      console.error("Failed to load investor project:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load project details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInterestSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      const response = await api.post(`/investor/projects/${id}/interest`, {
        organizationName: formData.organizationName.trim(),
        supportType: formData.supportType,
        message: formData.message.trim(),
      });

      if (response.data?.success) {
        setSubmitSuccess("Your interest request has been sent to the university!");
        setUserInterest(response.data.interest);
        setShowModal(false);
      } else {
        setSubmitError(response.data?.message || "Failed to submit interest.");
      }
    } catch (err) {
      console.error("Submit interest error:", err);
      setSubmitError(
        err.response?.data?.message ||
        "Unable to submit interest. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F7FBF8] p-6 md:p-8">
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

  if (error || !project) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F7FBF8] p-6 md:p-12">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle size={36} className="mx-auto text-amber-500" />
          <h2 className="mt-3 text-lg font-bold text-[#18352A]">
            Project Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error || "The requested project could not be found."}
          </p>
          <Link
            to="/investor/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#18352A] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#23445A]"
          >
            <ArrowLeft size={14} /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const problem = project.problem || {};

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7FBF8] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            TOP NAVIGATION & BREADCRUMB
        ====================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/investor/projects"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-[#F7FBF8]"
          >
            <ArrowLeft size={14} /> Back to Projects
          </Link>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[project.status] || "bg-slate-100 text-slate-700"
                }`}
            >
              Status: {project.status}
            </span>

            {/* Express Interest / Status Badge in Header */}
            {userInterest?.status === "Pending" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                <Clock size={13} /> Interest Request Pending
              </span>
            ) : userInterest?.status === "Accepted" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <CheckCircle2 size={13} /> Accepted Industry Partner
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2E7D5B] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#185a70]"
              >
                <Handshake size={14} /> Express Interest
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            USER INTEREST STATUS BANNER
        ====================================================== */}
        {userInterest && (
          <div
            className={`rounded-3xl border p-5 ${userInterest.status === "Accepted"
                ? "border-emerald-300 bg-emerald-50/70 text-emerald-900"
                : userInterest.status === "Pending"
                  ? "border-amber-300 bg-amber-50/70 text-amber-900"
                  : userInterest.status === "Rejected"
                    ? "border-red-300 bg-red-50/70 text-red-900"
                    : "border-slate-300 bg-slate-100 text-slate-700"
              }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {userInterest.status === "Accepted" && (
                  <CheckCircle2 size={22} className="text-emerald-600" />
                )}
                {userInterest.status === "Pending" && (
                  <Clock size={22} className="text-amber-600" />
                )}
                {userInterest.status === "Rejected" && (
                  <XCircle size={22} className="text-red-600" />
                )}
                <div>
                  <p className="text-sm font-bold">
                    Partnership Request Status: {userInterest.status}
                  </p>
                  <p className="text-xs opacity-90">
                    Support Type: <strong>{userInterest.supportType}</strong> · Submitted on {formatDate(userInterest.createdAt)}
                  </p>
                </div>
              </div>

              <Link
                to="/investor/interests"
                className="self-start text-xs font-semibold underline hover:opacity-80"
              >
                View all my interests →
              </Link>
            </div>

            {userInterest.message && (
              <div className="mt-3 border-t border-current/10 pt-2 text-xs opacity-90">
                <span className="font-semibold">Your Message: </span>
                {userInterest.message}
              </div>
            )}
          </div>
        )}

        {submitSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            {submitSuccess}
          </div>
        )}

        {/* =====================================================
            PROJECT OVERVIEW CARD
        ====================================================== */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {project.category || problem.category || "General"}
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {project.district || problem.district || "Jharkhand"}
              </span>
              <span className="text-xs text-slate-400">
                Started {formatDate(project.startDate || project.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#18352A] md:text-3xl">
              {project.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <Building2 size={14} className="text-slate-400" />
              <span className="font-semibold text-slate-700">
                {project.university?.name || "University"}
              </span>
              {project.university?.district && (
                <span>({project.university.district})</span>
              )}
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
              <div className="rounded-2xl border border-slate-100 bg-[#F7FBF8] p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Target size={14} className="text-[#2E7D5B]" />
                  <span>Objective</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {project.objective}
                </p>
              </div>
            )}

            {project.proposedSolution && (
              <div className="rounded-2xl border border-slate-100 bg-[#F7FBF8] p-4">
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

          {/* Dates */}
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
            <div>
              <p className="text-slate-400">Lifecycle Status</p>
              <p className="mt-1 font-semibold text-slate-700">
                {project.status}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            TWO COLUMNS: PROBLEM & TEAM / PARTNERSHIP
        ====================================================== */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left Column (2 cols): Source Civic Problem */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#2E7D5B]" />
                  <h2 className="text-base font-bold text-[#18352A]">
                    Source Civic Problem
                  </h2>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                  {problem.priority || "Medium"} Priority
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <h3 className="text-lg font-bold text-[#18352A]">
                  {problem.title || "Civic Grievance Title"}
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
                  <div>
                    <span className="text-slate-400">Problem Status:</span>
                    <p className="font-semibold text-emerald-700">
                      {problem.status || "Validated"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 col): Team & Partner */}
          <div className="space-y-6">

            {/* University & Faculty */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 size={18} className="text-[#2E7D5B]" />
                <h2 className="text-base font-bold text-[#18352A]">
                  University & Faculty
                </h2>
              </div>

              <div>
                <p className="text-xs text-slate-400">Institution</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {project.university?.name || "Assigned University"}
                </p>
                {project.university?.department && (
                  <p className="text-xs text-slate-500">{project.university.department}</p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400">Faculty Lead</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {project.facultyLead?.name || "Not assigned yet"}
                </p>
                {project.facultyLead?.department && (
                  <p className="text-xs text-slate-500">{project.facultyLead.department}</p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Users size={14} className="text-slate-400" />
                  <span>Student Innovators:</span>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {project.studentsCount || 0} Students
                </span>
              </div>
            </div>

            {/* Industry Partner Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase size={18} className="text-purple-600" />
                <h2 className="text-base font-bold text-[#18352A]">
                  Industry Partner
                </h2>
              </div>

              {project.industryPartner ? (
                <div className="mt-4 rounded-2xl bg-purple-50 p-4 border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                    <CheckCircle2 size={16} className="text-purple-700" />
                    <span>{project.industryPartner.name}</span>
                  </div>
                  {project.industryPartner.department && (
                    <p className="text-xs text-purple-700 mt-1">
                      {project.industryPartner.department}
                    </p>
                  )}
                  <p className="text-[11px] text-purple-600 mt-2">
                    Official Industry Collaborator for this project.
                  </p>
                </div>
              ) : (
                <div className="mt-4 text-center py-4">
                  <p className="text-xs text-slate-500">
                    No industry partner has been assigned yet.
                  </p>
                  {!userInterest && (
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:underline"
                    >
                      <Handshake size={14} /> Be the first to express interest
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* =====================================================
            EXPRESS INTEREST MODAL
        ====================================================== */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-[#18352A]">
                  <Handshake size={20} className="text-[#2E7D5B]" />
                  <h3 className="text-lg font-bold">Express Partnership Interest</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleInterestSubmit} className="mt-4 space-y-4">
                {/* Organization Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Organization / Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) =>
                      setFormData({ ...formData, organizationName: e.target.value })
                    }
                    placeholder="e.g. Tata Steel CSR, Tech Mahindra Labs, Local NGO..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F7FBF8] px-3.5 py-2 text-xs text-slate-800 focus:border-[#2E7D5B] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Support Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Collaboration / Support Type
                  </label>
                  <select
                    value={formData.supportType}
                    onChange={(e) =>
                      setFormData({ ...formData, supportType: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F7FBF8] px-3.5 py-2 text-xs text-slate-800 focus:border-[#2E7D5B] focus:bg-white focus:outline-none"
                  >
                    {SUPPORT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Partnership Message / Proposal
                  </label>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Describe how your organization would like to support or collaborate with this student team..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F7FBF8] p-3 text-xs text-slate-800 focus:border-[#2E7D5B] focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    {formData.message.length}/2000 characters
                  </span>
                </div>

                <div className="rounded-xl bg-[#F7FBF8] p-3 text-[11px] text-slate-500 flex items-start gap-2">
                  <ShieldAlert size={14} className="mt-0.5 text-slate-400 flex-shrink-0" />
                  <span>
                    This is an MVP collaboration channel. Real financial transactions or monetary transfers are not processed on this platform.
                  </span>
                </div>

                {submitError && (
                  <p className="text-xs font-medium text-red-600">
                    {submitError}
                  </p>
                )}

                <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F7FBF8]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#18352A] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#23445A] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Submit Interest Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
