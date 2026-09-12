import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function UniversityProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
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

  // ============================================================
  // LOAD PROBLEM
  // ============================================================

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/university/problems/${id}`
      );

      if (response.data?.success) {
        setProblem(response.data.problem);

        setAccepted(
          response.data.acceptedByCurrentUniversity || false
        );

        setAcceptance(
          response.data.acceptance || null
        );
      } else {
        setError("Problem could not be loaded.");
      }
    } catch (err) {
      console.error(
        "University problem details error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load problem details."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ACCEPT PROBLEM
  // ============================================================

  const handleAcceptProblem = async () => {
    try {
      setAccepting(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/university/problems/${id}/accept`,
        {
          note:
            "Accepted by university for further evaluation.",
        }
      );

      if (response.data?.success) {
        setAccepted(true);
        setAcceptance(
          response.data.acceptance || null
        );

        setSuccess(
          "Problem accepted successfully. You can now create a project."
        );
      }
    } catch (err) {
      console.error("Accept problem error:", err);

      if (err.response?.status === 409) {
        setAccepted(true);

        setSuccess(
          err.response?.data?.message ||
            "This problem has already been accepted."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to accept this problem."
        );
      }
    } finally {
      setAccepting(false);
    }
  };

  // ============================================================
  // PROJECT FORM CHANGE
  // ============================================================

  const handleProjectChange = (event) => {
    const { name, value } = event.target;

    setProjectForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // CREATE PROJECT
  // ============================================================

  const handleCreateProject = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!projectForm.title.trim()) {
      setError("Project title is required.");
      return;
    }

    if (!projectForm.description.trim()) {
      setError("Project description is required.");
      return;
    }

    try {
      setCreating(true);

      const response = await api.post(
        "/university/projects",
        {
          problemId: id,
          title: projectForm.title.trim(),
          description: projectForm.description.trim(),
          objective:
            projectForm.objective.trim(),
          proposedSolution:
            projectForm.proposedSolution.trim(),
          expectedCompletionDate:
            projectForm.expectedCompletionDate || null,
        }
      );

      if (response.data?.success) {
        const project =
          response.data.project;

        setSuccess(
          "Project created successfully."
        );

        const projectId =
          project?._id || project?.id;

        if (projectId) {
          navigate(
            `/university/projects/${projectId}`
          );
        } else {
          navigate("/university/projects");
        }
      } else {
        setError(
          response.data?.message ||
            "Project could not be created."
        );
      }
    } catch (err) {
      console.error(
        "Create project error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create project."
      );
    } finally {
      setCreating(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading problem details...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && !problem) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">

          <Link
            to="/university/problems"
            className="text-sm font-medium text-[#1F6F8B] hover:underline"
          >
            ← Back to Problems
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-white p-8">
            <h2 className="font-semibold text-red-700">
              Unable to load problem
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        {/* ======================================================
            BACK
        ======================================================= */}

        <Link
          to="/university/problems"
          className="text-sm font-medium text-[#1F6F8B] hover:underline"
        >
          ← Back to Validated Problems
        </Link>

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div className="min-w-0">

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Government Validated
                </span>

                {accepted && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    University Accepted
                  </span>
                )}

                {problem.priority && (
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                    {problem.priority} Priority
                  </span>
                )}

              </div>

              <h1 className="mt-4 text-2xl font-bold text-[#172B3A] md:text-3xl">
                {problem.title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {problem.description}
              </p>

            </div>

            <div className="shrink-0 rounded-xl bg-slate-50 px-5 py-4">

              <p className="text-xs text-slate-400">
                Problem ID
              </p>

              <p className="mt-1 max-w-[220px] break-all text-xs font-medium text-slate-600">
                {problem._id}
              </p>

            </div>

          </div>
        </div>

        {/* ======================================================
            SUCCESS
        ======================================================= */}

        {success && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              ✓ {success}
            </p>
          </div>
        )}

        {/* ======================================================
            ERROR
        ======================================================= */}

        {error && problem && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ======================================================
            MAIN
        ======================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* ====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-6 lg:col-span-2">

            {/* ==================================================
                PROBLEM INFORMATION
            =================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-semibold text-[#172B3A]">
                Problem Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <InfoItem
                  label="Category"
                  value={
                    problem.category ||
                    "Not specified"
                  }
                />

                <InfoItem
                  label="Priority"
                  value={
                    problem.priority ||
                    "Not specified"
                  }
                />

                <InfoItem
                  label="District"
                  value={
                    problem.district ||
                    "Not specified"
                  }
                />

                <InfoItem
                  label="Block"
                  value={
                    problem.block ||
                    "Not specified"
                  }
                />

                <InfoItem
                  label="Department"
                  value={
                    problem.governmentDepartment ||
                    "Not specified"
                  }
                />

                <InfoItem
                  label="Status"
                  value={
                    problem.status ||
                    "Not specified"
                  }
                />

              </div>

            </section>

            {/* ==================================================
                AI ANALYSIS
            =================================================== */}

            {(problem.aiCategory ||
              problem.aiPriority ||
              problem.aiUrgency ||
              problem.aiMatchedKeywords?.length > 0) && (

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="text-lg font-semibold text-[#172B3A]">
                  AI Analysis
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">

                  {problem.aiCategory && (
                    <InfoItem
                      label="AI Category"
                      value={
                        problem.aiCategory
                      }
                    />
                  )}

                  {problem.aiPriority && (
                    <InfoItem
                      label="AI Priority"
                      value={
                        problem.aiPriority
                      }
                    />
                  )}

                  {problem.aiUrgency !==
                    undefined &&
                    problem.aiUrgency !==
                      null && (
                      <InfoItem
                        label="AI Urgency"
                        value={String(
                          problem.aiUrgency
                        )}
                      />
                    )}

                </div>

                {problem.aiMatchedKeywords
                  ?.length > 0 && (
                  <div className="mt-5">

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Matched Keywords
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">

                      {problem.aiMatchedKeywords.map(
                        (keyword, index) => (
                          <span
                            key={`${keyword}-${index}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                          >
                            {keyword}
                          </span>
                        )
                      )}

                    </div>

                  </div>
                )}

              </section>
            )}

            {/* ==================================================
                LOCATION
            =================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-semibold text-[#172B3A]">
                Location
              </h2>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">

                <p className="text-sm text-slate-600">
                  {problem.location?.address ||
                    "Location details not available."}
                </p>

                {(problem.location?.latitude !==
                  undefined ||
                  problem.location?.lat !==
                    undefined) && (
                  <p className="mt-2 text-xs text-slate-400">
                    Coordinates:{" "}
                    {problem.location.latitude ??
                      problem.location.lat}
                    ,{" "}
                    {problem.location.longitude ??
                      problem.location.lng}
                  </p>
                )}

              </div>

            </section>

          </div>

          {/* ====================================================
              RIGHT
          ===================================================== */}

          <div>

            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-semibold text-[#172B3A]">
                University Action
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Review this validated civic problem and decide
                whether your university wants to take it forward.
              </p>

              {/* Government validation */}

              <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4">

                <p className="text-sm font-semibold text-green-800">
                  ✓ Government Validated
                </p>

                <p className="mt-1 text-xs leading-5 text-green-700">
                  This problem has passed government validation
                  and is available for university evaluation.
                </p>

              </div>

              {/* University acceptance */}

              {accepted ? (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">

                  <p className="text-sm font-semibold text-blue-800">
                    ✓ Problem Accepted
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Your university has accepted this problem.
                  </p>

                  {acceptance?.acceptedAt && (
                    <p className="mt-2 text-xs text-blue-600">
                      Accepted on{" "}
                      {new Date(
                        acceptance.acceptedAt
                      ).toLocaleDateString()}
                    </p>
                  )}

                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAcceptProblem}
                  disabled={accepting}
                  className="mt-5 w-full rounded-xl bg-[#1F6F8B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#185a70] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {accepting
                    ? "Accepting..."
                    : "Accept Problem"}
                </button>
              )}

              {/* =================================================
                  CREATE PROJECT BUTTON
              ================================================== */}

              {accepted && !showProjectForm && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProjectForm(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="mt-4 w-full rounded-xl bg-[#172B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#23445A]"
                >
                  Create Project — Next Step
                </button>
              )}

              {/* =================================================
                  CREATE PROJECT FORM
              ================================================== */}

              {accepted && showProjectForm && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <h3 className="text-base font-semibold text-[#172B3A]">
                    Create Project
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Convert this accepted problem into a university
                    project.
                  </p>

                  <form
                    onSubmit={handleCreateProject}
                    className="mt-5 space-y-4"
                  >

                    {/* Title */}

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Project Title *
                      </label>

                      <input
                        type="text"
                        name="title"
                        value={
                          projectForm.title
                        }
                        onChange={
                          handleProjectChange
                        }
                        maxLength={200}
                        placeholder="Enter project title"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1F6F8B] focus:ring-1 focus:ring-[#1F6F8B]"
                      />
                    </div>

                    {/* Description */}

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Description *
                      </label>

                      <textarea
                        name="description"
                        value={
                          projectForm.description
                        }
                        onChange={
                          handleProjectChange
                        }
                        rows={4}
                        maxLength={5000}
                        placeholder="Describe the project..."
                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1F6F8B] focus:ring-1 focus:ring-[#1F6F8B]"
                      />
                    </div>

                    {/* Objective */}

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Objective
                      </label>

                      <textarea
                        name="objective"
                        value={
                          projectForm.objective
                        }
                        onChange={
                          handleProjectChange
                        }
                        rows={3}
                        maxLength={3000}
                        placeholder="What should this project achieve?"
                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1F6F8B] focus:ring-1 focus:ring-[#1F6F8B]"
                      />
                    </div>

                    {/* Proposed solution */}

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Proposed Solution
                      </label>

                      <textarea
                        name="proposedSolution"
                        value={
                          projectForm.proposedSolution
                        }
                        onChange={
                          handleProjectChange
                        }
                        rows={4}
                        maxLength={5000}
                        placeholder="Explain the proposed solution..."
                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1F6F8B] focus:ring-1 focus:ring-[#1F6F8B]"
                      />
                    </div>

                    {/* Completion date */}

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Expected Completion
                      </label>

                      <input
                        type="date"
                        name="expectedCompletionDate"
                        value={
                          projectForm.expectedCompletionDate
                        }
                        onChange={
                          handleProjectChange
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1F6F8B] focus:ring-1 focus:ring-[#1F6F8B]"
                      />
                    </div>

                    {/* Actions */}

                    <div className="flex gap-2 pt-2">

                      <button
                        type="submit"
                        disabled={creating}
                        className="flex-1 rounded-lg bg-[#172B3A] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#23445A] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {creating
                          ? "Creating..."
                          : "Create Project"}
                      </button>

                      <button
                        type="button"
                        disabled={creating}
                        onClick={() => {
                          setShowProjectForm(false);
                          setError("");
                          setSuccess("");
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                </div>
              )}

              {/* Back */}

              <button
                type="button"
                onClick={() =>
                  navigate("/university/problems")
                }
                className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Back to Problems
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

export default UniversityProblemDetails;