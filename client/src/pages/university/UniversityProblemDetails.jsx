import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const PRIMARY = "#2E7D5B";
const DARK = "#18352A";

function Spinner({ size = "h-5 w-5" }) {
  return (
    <span
      className={`inline-block ${size} animate-spin rounded-full border-2 border-[#CFE9DA] border-t-[#2E7D5B]`}
    />
  );
}

function StatusBadge({ children, tone = "green" }) {
  const styles = {
    green: "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]",
    orange: "bg-[#FFF6E5] text-[#A46308] border-[#F6D99D]",
    red: "bg-[#FFF0F0] text-[#B42318] border-[#F3C5C5]",
    gray: "bg-[#F3F7F5] text-[#5C7067] border-[#DDE8E2]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function Alert({ type = "success", children }) {
  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-[#CBE8D7] bg-[#EAF7F0] text-[#246748]";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles}`}>
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#2E7D5B]">
          {eyebrow}
        </p>
      )}

      <h2 className="text-xl font-extrabold tracking-tight text-[#18352A] sm:text-2xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#667A70]">
          {description}
        </p>
      )}
    </div>
  );
}

function InfoCard({ label, value, accent = "green", className = "" }) {
  const accentStyles = {
    green: "border-l-[#2E7D5B]",
    dark: "border-l-[#18352A]",
    orange: "border-l-[#E5A72F]",
    red: "border-l-[#D9534F]",
  };

  return (
    <div
      className={`rounded-2xl border border-[#E1EEE7] border-l-4 bg-white p-4 shadow-[0_4px_18px_rgba(24,53,42,0.04)] ${
        accentStyles[accent] || accentStyles.green
      } ${className}`}
    >
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#789087]">
        {label}
      </p>
      <p className="break-words text-sm font-bold leading-6 text-[#244238]">
        {value || "Not specified"}
      </p>
    </div>
  );
}

function ScoreItem({ label, value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[#60756B]">{label}</span>
        <span className="text-xs font-extrabold text-[#2E7D5B]">
          {safeValue}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#E5F2EA]">
        <div
          className="h-full rounded-full bg-[#2E7D5B] transition-all duration-700"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function TagSection({ title, items, emptyText = "Not specified" }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#71867C]">
        {title}
      </p>

      {items?.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-xl border border-[#CFE7D8] bg-[#F0F9F3] px-3 py-1.5 text-xs font-semibold text-[#246748]"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#84958D]">{emptyText}</p>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  rows,
}) {
  const common =
    "mt-2 w-full rounded-xl border border-[#D7E8DE] bg-white px-4 py-3 text-sm text-[#18352A] outline-none transition placeholder:text-[#A0B0A8] focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]";

  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#526A5E]">
        {label}
        {required && <span className="ml-1 text-[#2E7D5B]">*</span>}
      </span>

      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${common} resize-none`}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={common}
          required={required}
        />
      )}
    </label>
  );
}

function LoadingCard() {
  return (
    <div className="min-h-screen bg-[#F7FBF8] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-6 h-5 w-32 rounded bg-[#DDEDE4]" />

        <div className="rounded-3xl border border-[#E1EEE7] bg-white p-6 sm:p-8">
          <div className="h-5 w-40 rounded bg-[#E5F2EA]" />
          <div className="mt-5 h-9 w-3/4 rounded bg-[#E5F2EA]" />
          <div className="mt-4 h-4 w-full rounded bg-[#EDF6F0]" />
          <div className="mt-2 h-4 w-5/6 rounded bg-[#EDF6F0]" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="h-[600px] rounded-3xl bg-white" />
          <div className="h-[500px] rounded-3xl bg-white" />
        </div>
      </div>
    </div>
  );
}

export default function UniversityProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [aiMatch, setAiMatch] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [acceptance, setAcceptance] = useState(null);

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    objective: "",
    proposedSolution: "",
    expectedCompletionDate: "",
  });

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/university/problems/${id}`);
      const data = response.data;

      setProblem(data.problem);
      setAiMatch(data.aiMatch);
      setAccepted(data.accepted);
      setAcceptance(data.acceptance);
    } catch (err) {
      console.error("Error fetching problem:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load this problem. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setError("");
      setSuccess("");

      const response = await api.post(`/university/problems/${id}/accept`);

      setAccepted(true);
      setAcceptance(response.data.acceptance);

      setSuccess("Problem accepted successfully. You can now create a project.");
    } catch (err) {
      console.error("Error accepting problem:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to accept this problem. Please try again."
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await api.post("/university/projects", {
        problemId: id,
        ...projectForm,
      });

      setSuccess("Project created successfully.");

      const projectId = response.data?.project?._id || response.data?.project?.id;

      if (projectId) {
        navigate(`/university/projects/${projectId}`);
      } else {
        navigate("/university/projects");
      }
    } catch (err) {
      console.error("Error creating project:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to create the project. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const updateProjectForm = (field, value) => {
    setProjectForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return <LoadingCard />;
  }

  if (error && !problem) {
    return (
      <div className="min-h-screen bg-[#F7FBF8] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => navigate("/university/problems")}
            className="mb-6 text-sm font-bold text-[#2E7D5B] transition hover:text-[#18352A]"
          >
            ← Back to Problems
          </button>

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-[0_10px_40px_rgba(24,53,42,0.06)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              !
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-[#18352A]">
              Unable to load problem
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#71867C]">
              {error}
            </p>

            <button
              onClick={fetchProblem}
              className="mt-6 rounded-xl bg-[#2E7D5B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#246748]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const matchScore =
    Number(aiMatch?.matchScore ?? aiMatch?.score ?? 0) || 0;

  const scoreBreakdown = aiMatch?.scoreBreakdown || {};

  return (
    <div className="min-h-screen bg-[#F7FBF8] text-[#18352A]">
      {/* Top green accent */}
      <div className="h-1.5 bg-[#2E7D5B]" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate("/university/problems")}
          className="group mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#5D7469] transition hover:text-[#2E7D5B]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>
          Back to Problems
        </button>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] border border-[#DDEDE4] bg-white shadow-[0_12px_45px_rgba(24,53,42,0.06)]">
          <div className="absolute right-[-70px] top-[-90px] h-56 w-56 rounded-full bg-[#EAF7F0]" />
          <div className="absolute bottom-[-100px] left-[-70px] h-52 w-52 rounded-full bg-[#F2FAF5]" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-4xl">
                <div className="mb-4 flex flex-wrap gap-2">
                  <StatusBadge tone="green">
                    Government Validated
                  </StatusBadge>

                  {accepted && (
                    <StatusBadge tone="green">
                      University Accepted
                    </StatusBadge>
                  )}

                  {problem?.priority && (
                    <StatusBadge
                      tone={
                        String(problem.priority).toLowerCase() === "high"
                          ? "orange"
                          : "green"
                      }
                    >
                      {problem.priority} Priority
                    </StatusBadge>
                  )}
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2E7D5B]">
                  Civic Problem
                </p>

                <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-[#18352A] sm:text-4xl lg:text-[42px]">
                  {problem?.title || "Untitled Problem"}
                </h1>

                <p className="mt-5 max-w-4xl text-sm leading-7 text-[#62786D] sm:text-base">
                  {problem?.description || "No description available."}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#789087]">
                  <span className="rounded-lg bg-[#F2F8F4] px-3 py-2">
                    Problem ID:{" "}
                    <span className="font-extrabold text-[#2E7D5B]">
                      {problem?._id || problem?.id || id}
                    </span>
                  </span>
                </div>
              </div>

              <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#EAF7F0] lg:flex">
                <span className="text-3xl text-[#2E7D5B]">✓</span>
              </div>
            </div>
          </div>
        </section>

        {/* Alerts */}
        {(success || error) && (
          <div className="mt-6 space-y-3">
            {success && <Alert type="success">{success}</Alert>}
            {error && <Alert type="error">{error}</Alert>}
          </div>
        )}

        {/* Main Layout */}
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Problem Information */}
            <section className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)] sm:p-8">
              <SectionHeading
                eyebrow="Problem Overview"
                title="Problem Information"
                description="Key information submitted and validated for this civic problem."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  label="Category"
                  value={problem?.category}
                  accent="green"
                />

                <InfoCard
                  label="Department"
                  value={problem?.department}
                  accent="dark"
                />

                <InfoCard
                  label="Priority"
                  value={problem?.priority}
                  accent={
                    String(problem?.priority).toLowerCase() === "high"
                      ? "orange"
                      : "green"
                  }
                />

                <InfoCard
                  label="Status"
                  value={problem?.status}
                  accent="green"
                />

                {problem?.submittedBy && (
                  <InfoCard
                    label="Submitted By"
                    value={
                      typeof problem.submittedBy === "object"
                        ? problem.submittedBy.name ||
                          problem.submittedBy.email ||
                          "Citizen"
                        : problem.submittedBy
                    }
                    accent="green"
                  />
                )}

                {problem?.createdAt && (
                  <InfoCard
                    label="Reported On"
                    value={new Date(problem.createdAt).toLocaleDateString()}
                    accent="green"
                  />
                )}
              </div>
            </section>

            {/* AI Match */}
            {aiMatch && (
              <section className="overflow-hidden rounded-[26px] border border-[#CFE7D8] bg-white shadow-[0_8px_30px_rgba(24,53,42,0.05)]">
                <div className="border-b border-[#DDEDE4] bg-gradient-to-r from-[#EAF7F0] via-white to-[#F5FBF7] p-6 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E7D5B]">
                        AI Matching
                      </p>

                      <h2 className="mt-1 text-xl font-extrabold text-[#18352A] sm:text-2xl">
                        Why this problem matches your university
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667A70]">
                        The matching engine evaluated the problem against your
                        university profile, expertise, research areas and
                        technical capabilities.
                      </p>
                    </div>

                    <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-[#DDF1E5] bg-white shadow-sm">
                      <span className="text-3xl font-black text-[#2E7D5B]">
                        {Math.round(matchScore)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">
                        Match Score
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 p-6 sm:p-8">
                  {aiMatch?.matchingReasons?.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#71867C]">
                        Matching Reasons
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {aiMatch.matchingReasons.map((reason, index) => (
                          <div
                            key={index}
                            className="flex gap-3 rounded-2xl border border-[#E0EEE6] bg-[#FAFDFB] p-4"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF7F0] text-xs font-black text-[#2E7D5B]">
                              ✓
                            </span>

                            <p className="text-sm leading-6 text-[#4D6459]">
                              {reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(scoreBreakdown).length > 0 && (
                    <div>
                      <p className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-[#71867C]">
                        Match Score Breakdown
                      </p>

                      <div className="grid gap-5 sm:grid-cols-2">
                        {Object.entries(scoreBreakdown).map(
                          ([label, value]) => (
                            <ScoreItem
                              key={label}
                              label={label
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (s) => s.toUpperCase())}
                              value={value}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {aiMatch?.prototypeNotes && (
                    <div className="rounded-2xl border border-[#CFE7D8] bg-[#F0F9F3] p-5">
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#2E7D5B]">
                        Prototype / Research Direction
                      </p>

                      <p className="text-sm leading-7 text-[#466054]">
                        {aiMatch.prototypeNotes}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* AI Technical Analysis */}
            {(aiMatch?.routingType ||
              aiMatch?.aiDomain ||
              aiMatch?.sla ||
              aiMatch?.actionDirective ||
              aiMatch?.researchAreas?.length ||
              aiMatch?.requiredSkills?.length ||
              aiMatch?.technologies?.length) && (
              <section className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)] sm:p-8">
                <SectionHeading
                  eyebrow="Intelligence Layer"
                  title="AI Analysis & Technical Requirements"
                  description="System-generated analysis to help the university understand the technical direction of the problem."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  {aiMatch?.routingType && (
                    <InfoCard
                      label="Routing Type"
                      value={aiMatch.routingType}
                    />
                  )}

                  {aiMatch?.aiDomain && (
                    <InfoCard
                      label="AI Domain"
                      value={aiMatch.aiDomain}
                    />
                  )}

                  {aiMatch?.priority && (
                    <InfoCard
                      label="AI Priority"
                      value={aiMatch.priority}
                    />
                  )}

                  {aiMatch?.sla && (
                    <InfoCard label="SLA" value={aiMatch.sla} />
                  )}

                  {aiMatch?.actionDirective && (
                    <InfoCard
                      label="Action Directive"
                      value={aiMatch.actionDirective}
                      className="sm:col-span-2"
                    />
                  )}
                </div>

                <div className="mt-7 grid gap-7 border-t border-[#E5EEE9] pt-7">
                  <TagSection
                    title="Research Areas"
                    items={aiMatch?.researchAreas}
                  />

                  <TagSection
                    title="Required Skills"
                    items={aiMatch?.requiredSkills}
                  />

                  <TagSection
                    title="Technologies"
                    items={aiMatch?.technologies}
                  />
                </div>
              </section>
            )}

            {/* Location */}
            {problem?.location && (
              <section className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)] sm:p-8">
                <SectionHeading
                  eyebrow="Geographic Context"
                  title="Location"
                />

                <div className="rounded-2xl border border-[#CFE7D8] bg-[#F0F9F3] p-5">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                      📍
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#244238]">
                        {typeof problem.location === "string"
                          ? problem.location
                          : problem.location.address ||
                            problem.location.village ||
                            problem.location.district ||
                            "Location available"}
                      </p>

                      {typeof problem.location === "object" && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {problem.location.district && (
                            <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[#60756B]">
                              District: {problem.location.district}
                            </span>
                          )}

                          {problem.location.state && (
                            <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[#60756B]">
                              State: {problem.location.state}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT ACTION PANEL */}
          <aside className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-[26px] border border-[#CFE7D8] bg-white shadow-[0_12px_40px_rgba(24,53,42,0.08)]">
              <div className="h-1.5 bg-[#2E7D5B]" />

              <div className="p-5 sm:p-6">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E7D5B]">
                    University Workspace
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-[#18352A]">
                    Decision Center
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#71867C]">
                    Review the validated problem, accept it, and turn it into
                    a university-led project.
                  </p>
                </div>

                {/* Validation */}
                <div className="rounded-2xl border border-[#CFE7D8] bg-[#F0F9F3] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-[#2E7D5B] shadow-sm">
                      ✓
                    </div>

                    <div>
                      <p className="text-sm font-extrabold text-[#244238]">
                        Government Validated
                      </p>
                      <p className="mt-0.5 text-xs text-[#71867C]">
                        This problem is ready for university review.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="my-6 h-px bg-[#E5EEE9]" />

                {!accepted ? (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm font-extrabold text-[#244238]">
                        Accept this problem
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#71867C]">
                        Accepting indicates that your university is willing to
                        take ownership of exploring a solution.
                      </p>
                    </div>

                    <button
                      onClick={handleAccept}
                      disabled={accepting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7D5B] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(46,125,91,0.18)] transition hover:bg-[#246748] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {accepting ? (
                        <>
                          <Spinner size="h-4 w-4" />
                          Accepting...
                        </>
                      ) : (
                        <>✓ Accept Problem</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#CBE8D7] bg-[#EAF7F0] p-4">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#2E7D5B]">
                        ✓
                      </div>

                      <div>
                        <p className="text-sm font-extrabold text-[#246748]">
                          Problem Accepted
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#60756B]">
                          Your university has accepted this problem and can
                          now create a project.
                        </p>

                        {acceptance?.acceptedAt && (
                          <p className="mt-2 text-[11px] font-semibold text-[#789087]">
                            Accepted on{" "}
                            {new Date(
                              acceptance.acceptedAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Create project */}
                {accepted && (
                  <div className="mt-5">
                    {!showProjectForm ? (
                      <button
                        onClick={() => setShowProjectForm(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2E7D5B] bg-white px-5 py-3.5 text-sm font-extrabold text-[#2E7D5B] transition hover:bg-[#EAF7F0]"
                      >
                        + Create University Project
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-[#D8E9DF] bg-[#F8FCF9] p-4">
                        <div className="mb-5">
                          <p className="text-sm font-extrabold text-[#244238]">
                            Create Project
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#71867C]">
                            Define how your university plans to work on this
                            problem.
                          </p>
                        </div>

                        <form
                          onSubmit={handleCreateProject}
                          className="space-y-4"
                        >
                          <FormField
                            label="Project Title"
                            value={projectForm.title}
                            onChange={(e) =>
                              updateProjectForm("title", e.target.value)
                            }
                            placeholder="Enter project title"
                            required
                          />

                          <FormField
                            label="Description"
                            value={projectForm.description}
                            onChange={(e) =>
                              updateProjectForm(
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe the project..."
                            rows={4}
                            required
                          />

                          <FormField
                            label="Objective"
                            value={projectForm.objective}
                            onChange={(e) =>
                              updateProjectForm("objective", e.target.value)
                            }
                            placeholder="What should this project achieve?"
                            rows={3}
                          />

                          <FormField
                            label="Proposed Solution"
                            value={projectForm.proposedSolution}
                            onChange={(e) =>
                              updateProjectForm(
                                "proposedSolution",
                                e.target.value
                              )
                            }
                            placeholder="Describe the proposed approach..."
                            rows={4}
                          />

                          <FormField
                            label="Expected Completion Date"
                            value={projectForm.expectedCompletionDate}
                            onChange={(e) =>
                              updateProjectForm(
                                "expectedCompletionDate",
                                e.target.value
                              )
                            }
                            type="date"
                          />

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowProjectForm(false)}
                              className="rounded-xl border border-[#D7E8DE] bg-white px-4 py-3 text-sm font-bold text-[#60756B] transition hover:bg-[#F2F8F4]"
                            >
                              Cancel
                            </button>

                            <button
                              type="submit"
                              disabled={creating}
                              className="flex items-center justify-center gap-2 rounded-xl bg-[#2E7D5B] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#246748] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {creating ? (
                                <>
                                  <Spinner size="h-4 w-4" />
                                  Creating...
                                </>
                              ) : (
                                "Create Project"
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => navigate("/university/problems")}
                  className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold text-[#71867C] transition hover:bg-[#F2F8F4] hover:text-[#2E7D5B]"
                >
                  ← Back to All Problems
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}