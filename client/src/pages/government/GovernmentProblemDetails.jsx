import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const STATUS_OPTIONS = [
  "Pending",
  "Under Review",
  "Validated",
  "In Progress",
  "Resolved",
  "Rejected",
  "Duplicate",
];

const PRIORITY_OPTIONS = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const DEPARTMENT_OPTIONS = [
  "Agriculture",
  "Road & Transport",
  "Water Supply",
  "Electricity",
  "Health",
  "Education",
  "Environment",
  "Municipal Corporation",
  "Police",
  "Other",
];

/*
 * Department controls the category in the backend.
 * Category is NOT shown separately in the Government UI.
 */
const DEPARTMENT_CATEGORY_MAP = {
  Agriculture: "Agriculture",
  "Road & Transport": "Road & Transport",
  "Water Supply": "Water Supply",
  Electricity: "Electricity",
  Health: "Health",
  Education: "Education",
  Environment: "Environment",
  "Municipal Corporation": "Municipal Corporation",
  Police: "Police",
  Other: "Other",
};

const getCategoryFromDepartment = (department) => {
  return DEPARTMENT_CATEGORY_MAP[department] || "Other";
};

const getStatusClass = (status) => {
  const styles = {
    Pending: "bg-slate-100 text-slate-700",
    "Under Review": "bg-amber-50 text-amber-700",
    Validated: "bg-blue-50 text-blue-700",
    "In Progress": "bg-indigo-50 text-indigo-700",
    Resolved: "bg-emerald-50 text-emerald-700",
    Rejected: "bg-red-50 text-red-700",
    Duplicate: "bg-purple-50 text-purple-700",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
};

const getPriorityClass = (priority) => {
  const styles = {
    Low: "bg-slate-100 text-slate-600",
    Medium: "bg-blue-50 text-blue-700",
    High: "bg-orange-50 text-orange-700",
    Critical: "bg-red-50 text-red-700",
  };

  return styles[priority] || "bg-slate-100 text-slate-700";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRelativeTime = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const diff = Date.now() - parsed.getTime();

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const formatActivityAction = (action = "") => {
  const labels = {
    PROBLEM_REPORTED: "Problem Reported",
    DEPARTMENT_AUTO_ASSIGNED: "Department Auto Assigned",
    DEPARTMENT_CORRECTED: "Department Corrected",
    STATUS_CHANGED: "Status Changed",
    VALIDATION_STATUS_CHANGED: "Validation Status Changed",
    PRIORITY_CHANGED: "Priority Changed",
    PROBLEM_UPDATED: "Problem Updated",
  };

  if (labels[action]) {
    return labels[action];
  }

  return (
    action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Activity"
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 break-words text-[14px] font-medium text-slate-700">
      {value || "—"}
    </p>
  </div>
);

const SectionTitle = ({ title, count }) => (
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-[16px] font-semibold text-[#172B3A]">
      {title}
    </h2>

    {count !== undefined && (
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-500">
        {count}
      </span>
    )}
  </div>
);

export default function GovernmentProblemDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [problem, setProblem] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * SAVED VALUES
   * These represent what is currently stored in the backend.
   */
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [department, setDepartment] = useState("");

  /*
   * TEMPORARY DEPARTMENT
   *
   * This is only changed when the dropdown changes.
   * It does NOT update the complaint until Save Changes.
   */
  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [selectedMedia, setSelectedMedia] = useState(null);

  // ==========================================================
  // FETCH PROBLEM
  // ==========================================================

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/problems/${id}`);

      const data = response.data.problem || response.data;

      setProblem(data);

      setStatus(data.status || "Pending");
      setPriority(data.priority || "Medium");

      const savedDepartment =
        data.governmentDepartment || "";

      /*
       * Saved department is used for both:
       *
       * department
       * selectedDepartment
       *
       * so the dropdown starts with the actual
       * saved value.
       */
      setDepartment(savedDepartment);
      setSelectedDepartment(savedDepartment);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to load complaint details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  // ==========================================================
  // UPDATE PROBLEM
  // ==========================================================

  const updateProblem = async (updates) => {
    try {
      setSaving(true);
      setError("");

      const response = await api.patch(
        `/problems/${id}/government`,
        updates
      );

      const updated =
        response.data.problem || response.data;

      /*
       * Update the actual saved problem only
       * after backend successfully responds.
       */
      setProblem(updated);

      setStatus(updated.status || status);
      setPriority(updated.priority || priority);

      const savedDepartment =
        updated.governmentDepartment || "";

      setDepartment(savedDepartment);
      setSelectedDepartment(savedDepartment);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to update complaint."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // VALIDATION STATUS
  // ==========================================================

  const getValidationStatus = (currentStatus) => {
    const validationMap = {
      Validated: "Validated",
      Rejected: "Rejected",
      Duplicate: "Duplicate",
    };

    return validationMap[currentStatus];
  };

  // ==========================================================
  // SAVE CHANGES
  // ==========================================================

  const handleSave = async () => {
    /*
     * Category is calculated ONLY when Save is clicked.
     *
     * Example:
     *
     * selectedDepartment = Health
     * category = Health
     *
     * Nothing changes in the complaint before this function.
     */
    const newCategory =
      getCategoryFromDepartment(
        selectedDepartment
      );

    const validationStatus =
      getValidationStatus(status);

    await updateProblem({
      status,
      priority,

      governmentDepartment:
        selectedDepartment,

      category: newCategory,

      ...(validationStatus
        ? {
            validationStatus,
          }
        : {}),
    });
  };

  // ==========================================================
  // QUICK ACTIONS
  // ==========================================================

  const handleQuickAction = (action) => {
    /*
     * IMPORTANT:
     *
     * Quick actions use the SAVED department,
     * not selectedDepartment.
     *
     * Therefore, if Government selects "Health"
     * but does not click Save, then clicks Validate,
     * the department will NOT accidentally become Health.
     */

    const savedCategory =
      getCategoryFromDepartment(department);

    if (action === "validate") {
      setStatus("Validated");

      updateProblem({
        status: "Validated",
        validationStatus: "Validated",
        priority,

        governmentDepartment: department,
        category: savedCategory,
      });
    }

    if (action === "reject") {
      setStatus("Rejected");

      updateProblem({
        status: "Rejected",
        validationStatus: "Rejected",
        priority,

        governmentDepartment: department,
        category: savedCategory,
      });
    }

    if (action === "duplicate") {
      setStatus("Duplicate");

      updateProblem({
        status: "Duplicate",
        validationStatus: "Duplicate",
        priority,

        governmentDepartment: department,
        category: savedCategory,
      });
    }
  };

  // ==========================================================
  // DEPARTMENT CHANGE
  // ==========================================================

  const handleDepartmentChange = (newDepartment) => {
    /*
     * ONLY change temporary dropdown value.
     *
     * DO NOT:
     * - change problem
     * - change department
     * - change category
     * - call API
     *
     * Everything is committed only by Save Changes.
     */
    setSelectedDepartment(newDepartment);

    setError("");
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <p className="text-[14px] text-slate-500">
          Loading complaint...
        </p>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!problem) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-9">
        <div className="rounded-xl border border-red-100 bg-red-50 p-6">
          <p className="text-[14px] font-medium text-red-700">
            {error || "Complaint not found."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-[#2477B5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1d659b]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const activity = Array.isArray(problem.activity)
    ? problem.activity
    : Array.isArray(problem.activities)
    ? problem.activities
    : [];

  const sortedActivity = [...activity].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  const media = Array.isArray(problem.media)
    ? problem.media
    : Array.isArray(problem.attachments)
    ? problem.attachments
    : [];

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-5 py-6">

        {/* ==================================================
            TOP BAR
        ================================================== */}

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              ←
            </button>

            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
                Government Dashboard
              </p>

              <h1 className="mt-0.5 text-[20px] font-bold text-[#172B3A]">
                Complaint Details
              </h1>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <span
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${getStatusClass(
                status
              )}`}
            >
              {status}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${getPriorityClass(
                priority
              )}`}
            >
              {priority}
            </span>

          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-[13px] font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ==================================================
            HEADER CARD
        ================================================== */}

        <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Complaint
                  </span>

                </div>

                <h2 className="mt-3 text-[22px] font-bold leading-tight text-[#172B3A]">
                  {problem.title ||
                    problem.subject ||
                    "Untitled Complaint"}
                </h2>

                {problem.description && (
                  <p className="mt-2 max-w-4xl text-[14px] leading-6 text-slate-500">
                    {problem.description}
                  </p>
                )}

              </div>

              <div className="shrink-0 text-left lg:text-right">

                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Complaint ID
                </p>

                <p className="mt-1 break-all text-[13px] font-semibold text-slate-700">
                  {problem._id ||
                    problem.id ||
                    "—"}
                </p>

                <p className="mt-2 text-[11px] text-slate-400">
                  Reported{" "}
                  {getRelativeTime(
                    problem.createdAt ||
                      problem.reportedAt
                  )}
                </p>

              </div>

            </div>

          </div>

          <div className="grid gap-5 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              label="Department"
              value={department}
            />

            <InfoItem
              label="Reported On"
              value={formatDate(
                problem.createdAt ||
                  problem.reportedAt
              )}
            />

            <InfoItem
              label="Last Updated"
              value={formatDate(
                problem.updatedAt
              )}
            />

          </div>

        </section>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">

          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div className="space-y-5">

            {/* COMPLAINT INFORMATION */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <SectionTitle title="Complaint Information" />

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                <InfoItem
                  label="Department"
                  value={department}
                />

                <InfoItem
                  label="Status"
                  value={status}
                />

                <InfoItem
                  label="Priority"
                  value={priority}
                />

                <InfoItem
                  label="Reported By"
                  value={
                    problem.reportedBy?.name ||
                    problem.citizen?.name ||
                    problem.user?.name ||
                    problem.createdBy?.name
                  }
                />

                <InfoItem
                  label="Contact"
                  value={
                    problem.reportedBy?.phone ||
                    problem.citizen?.phone ||
                    problem.user?.phone
                  }
                />

              </div>

            </section>

            {/* DESCRIPTION */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <SectionTitle title="Problem Description" />

              <div className="rounded-lg bg-slate-50 p-4">

                <p className="whitespace-pre-wrap text-[14px] leading-7 text-slate-600">
                  {problem.description ||
                    "No description provided."}
                </p>

              </div>

            </section>

            {/* EVIDENCE */}

            {media.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <SectionTitle
                  title="Evidence"
                  count={media.length}
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

                  {media.map((item, index) => (

                    <button
                      key={
                        item._id ||
                        item.id ||
                        index
                      }
                      onClick={() =>
                        setSelectedMedia(index)
                      }
                      className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                    >

                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={`Evidence ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="h-full w-full object-cover"
                        />
                      )}

                      {item.type === "video" && (
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                          VIDEO
                        </span>
                      )}

                    </button>

                  ))}

                </div>

              </section>
            )}

            {/* LOCATION */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <SectionTitle title="Location" />

              <div className="grid gap-5 md:grid-cols-3">

                <div className="md:col-span-3">

                  <InfoItem
                    label="Address"
                    value={
                      problem.location?.address
                    }
                  />

                </div>

                <InfoItem
                  label="Latitude"
                  value={
                    problem.location?.latitude
                  }
                />

                <InfoItem
                  label="Longitude"
                  value={
                    problem.location?.longitude
                  }
                />

              </div>

            </section>

          </div>

          {/* ==================================================
              GOVERNMENT ACTIONS
          ================================================== */}

          <div>

            <section className="sticky top-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <SectionTitle title="Government Actions" />

              <div className="space-y-4">

                {/* ==================================================
                    DEPARTMENT
                    ================================================== */}

                <div>

                  <label className="mb-1.5 block text-[13px] font-medium text-slate-500">
                    Department
                  </label>

                  <select
                    value={selectedDepartment}
                    onChange={(e) =>
                      handleDepartmentChange(
                        e.target.value
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-[#2477B5] focus:ring-1 focus:ring-[#2477B5]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >

                    <option value="">
                      Select department
                    </option>

                    {DEPARTMENT_OPTIONS.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>

                  {selectedDepartment !== department && (
                    <p className="mt-1.5 text-[11px] font-medium text-amber-600">
                      Unsaved department change
                    </p>
                  )}

                </div>

                {/* ==================================================
                    STATUS
                    ================================================== */}

                <div>

                  <label className="mb-1.5 block text-[13px] font-medium text-slate-500">
                    Complaint Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-[#2477B5] focus:ring-1 focus:ring-[#2477B5]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >

                    {STATUS_OPTIONS.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* ==================================================
                    PRIORITY
                    ================================================== */}

                <div>

                  <label className="mb-1.5 block text-[13px] font-medium text-slate-500">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-[#2477B5] focus:ring-1 focus:ring-[#2477B5]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >

                    {PRIORITY_OPTIONS.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* ==================================================
                    SAVE CHANGES
                    ================================================== */}

                <button
                  onClick={handleSave}
                  disabled={
                    saving ||
                    !selectedDepartment
                  }
                  className="w-full rounded-lg bg-[#2477B5] px-3.5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1d659b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                {/* ==================================================
                    QUICK ACTIONS
                    ================================================== */}

                <div className="border-t border-slate-100 pt-4">

                  <p className="mb-2.5 text-[13px] font-medium text-slate-400">
                    Quick Actions
                  </p>

                  <div className="grid grid-cols-3 gap-2.5">

                    <button
                      onClick={() =>
                        handleQuickAction(
                          "validate"
                        )
                      }
                      disabled={saving}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2.5 text-[12px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      Validate
                    </button>

                    <button
                      onClick={() =>
                        handleQuickAction(
                          "reject"
                        )
                      }
                      disabled={saving}
                      className="rounded-lg border border-red-200 bg-red-50 px-2 py-2.5 text-[12px] font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() =>
                        handleQuickAction(
                          "duplicate"
                        )
                      }
                      disabled={saving}
                      className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-2.5 text-[12px] font-semibold text-purple-700 transition hover:bg-purple-100 disabled:opacity-50"
                    >
                      Duplicate
                    </button>

                  </div>

                </div>

              </div>

            </section>

          </div>
        </div>

        {/* ==================================================
            ACTIVITY TIMELINE
        ================================================== */}

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>

              <h2 className="text-[16px] font-semibold text-[#172B3A]">
                Activity Timeline
              </h2>

              <p className="mt-1 text-[13px] text-slate-400">
                Complete history of this complaint
              </p>

            </div>

            <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-slate-100 px-3">

              <span className="text-[13px] font-semibold text-slate-600">
                {activity.length}
              </span>

            </div>

          </div>

          <div className="h-[420px] overflow-y-auto px-6 py-6">

            {sortedActivity.length === 0 ? (

              <div className="flex h-full items-center justify-center">

                <p className="text-[14px] text-slate-400">
                  No activity recorded yet.
                </p>

              </div>

            ) : (

              <div className="relative ml-1">

                <div className="absolute bottom-3 left-[9px] top-3 w-px bg-slate-200" />

                <div className="space-y-8">

                  {sortedActivity.map(
                    (item, index) => (

                      <div
                        key={
                          item._id ||
                          item.id ||
                          `${item.action}-${item.createdAt}-${index}`
                        }
                        className="relative pl-9"
                      >

                        <div className="absolute left-0 top-0.5 z-10 flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 border-[#2477B5] bg-white">

                          <div className="h-1.5 w-1.5 rounded-full bg-[#2477B5]" />

                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="text-[14px] font-semibold text-slate-700">
                                  {formatActivityAction(
                                    item.action
                                  )}
                                </h3>

                                {item.performedBy?.name && (
                                  <>
                                    <span className="text-slate-300">
                                      •
                                    </span>

                                    <span className="text-[12px] text-slate-400">
                                      {
                                        item
                                          .performedBy
                                          .name
                                      }
                                    </span>
                                  </>
                                )}

                              </div>

                              <p className="mt-1.5 max-w-4xl text-[13px] leading-6 text-slate-500">
                                {item.description ||
                                  "No additional details."}
                              </p>

                            </div>

                            <span className="shrink-0 text-[11px] font-medium text-slate-400">
                              {getRelativeTime(
                                item.createdAt
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </div>

        </section>

        {/* ==================================================
            MEDIA MODAL
        ================================================== */}

        {selectedMedia !== null &&
          media[selectedMedia] && (

            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
              onClick={() =>
                setSelectedMedia(null)
              }
            >

              <div
                className="relative flex h-[75vh] w-[75vw] max-w-6xl items-center justify-center rounded-xl bg-black"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                <button
                  onClick={() =>
                    setSelectedMedia(null)
                  }
                  className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm text-white hover:bg-white/20"
                >
                  ✕
                </button>

                {media[selectedMedia].type ===
                "image" ? (

                  <img
                    src={
                      media[selectedMedia]
                        .url
                    }
                    alt="Evidence"
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />

                ) : (

                  <video
                    src={
                      media[selectedMedia]
                        .url
                    }
                    controls
                    autoPlay
                    className="max-h-full max-w-full rounded-lg"
                  />

                )}

                {media.length > 1 && (
                  <>

                    <button
                      onClick={() =>
                        setSelectedMedia(
                          (
                            selectedMedia -
                            1 +
                            media.length
                          ) % media.length
                        )
                      }
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
                    >
                      ‹
                    </button>

                    <button
                      onClick={() =>
                        setSelectedMedia(
                          (
                            selectedMedia +
                            1
                          ) % media.length
                        )
                      }
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
                    >
                      ›
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3.5 py-1.5 text-[12px] text-white">
                      {selectedMedia + 1} /{" "}
                      {media.length}
                    </div>

                  </>
                )}

              </div>

            </div>

          )}

      </div>
    </div>
  );
}