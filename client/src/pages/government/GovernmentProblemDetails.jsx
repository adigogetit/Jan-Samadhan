import { useEffect, useMemo, useState } from "react";
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
|--------------------------------------------------------------------------
| DEPARTMENT -> CATEGORY
|--------------------------------------------------------------------------
| Category is controlled by the saved government department.
| Category is NOT shown as a separate government control.
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
  return (
    DEPARTMENT_CATEGORY_MAP[department] ||
    "Other"
  );
};

/*
|--------------------------------------------------------------------------
| MEDIA HELPERS
|--------------------------------------------------------------------------
*/

const getMediaUrl = (item) => {
  if (!item) return "";

  /*
   * Backend may directly return a string URL.
   */
  if (typeof item === "string") {
    return resolveMediaUrl(item);
  }

  /*
   * Support different common backend field names.
   */
  const rawUrl =
    item.url ||
    item.secure_url ||
    item.secureUrl ||
    item.fileUrl ||
    item.fileURL ||
    item.file_url ||
    item.path ||
    item.src ||
    item.location ||
    item.mediaUrl ||
    item.mediaURL ||
    "";

  return resolveMediaUrl(rawUrl);
};

const resolveMediaUrl = (rawUrl) => {
  if (!rawUrl) return "";

  const value = String(rawUrl).trim();

  if (!value) return "";

  /*
   * Already a complete URL.
   */
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  /*
   * If backend returns something like:
   *
   * /uploads/photo.jpg
   *
   * use the API server's origin instead of
   * the React/Vite frontend origin.
   */
  if (value.startsWith("/")) {
    try {
      const baseUrl =
        api?.defaults?.baseURL ||
        window.location.origin;

      const apiOrigin = new URL(baseUrl).origin;

      return `${apiOrigin}${value}`;
    } catch {
      return value;
    }
  }

  /*
   * If backend returns:
   *
   * uploads/photo.jpg
   */
  try {
    const baseUrl =
      api?.defaults?.baseURL ||
      window.location.origin;

    return new URL(
      value,
      baseUrl.endsWith("/")
        ? baseUrl
        : `${baseUrl}/`
    ).toString();
  } catch {
    return value;
  }
};

const getMediaType = (item) => {
  if (!item) return "";

  /*
   * Direct string URL.
   */
  if (typeof item === "string") {
    return getTypeFromUrl(item);
  }

  const rawType = String(
    item.type ||
    item.mimeType ||
    item.mime_type ||
    item.contentType ||
    item.content_type ||
    item.mediaType ||
    item.media_type ||
    ""
  ).toLowerCase();

  /*
   * MIME types:
   *
   * image/jpeg
   * image/png
   * video/mp4
   */
  if (
    rawType.startsWith("image/") ||
    rawType === "image"
  ) {
    return "image";
  }

  if (
    rawType.startsWith("video/") ||
    rawType === "video"
  ) {
    return "video";
  }

  /*
   * Fallback to URL extension.
   */
  return getTypeFromUrl(getMediaUrl(item));
};

const getTypeFromUrl = (url) => {
  if (!url) return "";

  const cleanUrl = String(url)
    .toLowerCase()
    .split("?")[0]
    .split("#")[0];

  if (
    /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/i.test(
      cleanUrl
    )
  ) {
    return "image";
  }

  if (
    /\.(mp4|webm|mov|avi|mkv|m4v|ogg)$/i.test(
      cleanUrl
    )
  ) {
    return "video";
  }

  return "";
};

const normalizeMedia = (problem) => {
  if (!problem) return [];

  const sources = [];

  /*
   * Standard media array.
   */
  if (Array.isArray(problem.media)) {
    sources.push(...problem.media);
  }

  /*
   * Attachments array.
   */
  if (Array.isArray(problem.attachments)) {
    sources.push(...problem.attachments);
  }

  /*
   * Separate image array.
   */
  if (Array.isArray(problem.images)) {
    sources.push(
      ...problem.images.map((item) => {
        if (typeof item === "string") {
          return {
            url: item,
            type: "image",
          };
        }

        return {
          ...item,
          type:
            item.type ||
            item.mimeType ||
            "image",
        };
      })
    );
  }

  /*
   * Separate video array.
   */
  if (Array.isArray(problem.videos)) {
    sources.push(
      ...problem.videos.map((item) => {
        if (typeof item === "string") {
          return {
            url: item,
            type: "video",
          };
        }

        return {
          ...item,
          type:
            item.type ||
            item.mimeType ||
            "video",
        };
      })
    );
  }

  /*
   * Evidence array.
   */
  if (Array.isArray(problem.evidence)) {
    sources.push(...problem.evidence);
  }

  /*
   * Some APIs return a single evidence/media object.
   */
  if (
    problem.media &&
    !Array.isArray(problem.media) &&
    typeof problem.media === "object"
  ) {
    sources.push(problem.media);
  }

  const normalized = sources
    .map((item, index) => {
      const url = getMediaUrl(item);
      const type = getMediaType(item);

      return {
        id:
          item?._id ||
          item?.id ||
          `media-${index}`,
        url,
        type,
        original: item,
      };
    })
    .filter((item) => item.url);

  /*
   * Remove duplicate URLs.
   */
  return normalized.filter(
    (item, index, array) =>
      array.findIndex(
        (other) => other.url === item.url
      ) === index
  );
};

/*
|--------------------------------------------------------------------------
| STATUS / PRIORITY
|--------------------------------------------------------------------------
*/

const getStatusClass = (status) => {
  const styles = {
    Pending: "bg-[#FFF6E5] text-[#A46308] border border-[#F6D99D]",
    "Under Review": "bg-[#FFF6E5] text-[#A46308] border border-[#F6D99D]",
    Validated: "bg-[#EAF7F0] text-[#246748] border border-[#CBE8D7]",
    "In Progress": "bg-[#EAF7F0] text-[#246748] border border-[#CBE8D7]",
    Resolved: "bg-[#EAF7F0] text-[#246748] border border-[#CBE8D7]",
    Rejected: "bg-[#FFF0F0] text-[#B42318] border border-[#F3C5C5]",
    Duplicate: "bg-[#F3F7F5] text-[#5C7067] border border-[#DDE8E2]",
  };

  return (
    styles[status] ||
    "bg-[#F3F7F5] text-[#5C7067] border border-[#DDE8E2]"
  );
};

const getPriorityClass = (priority) => {
  const styles = {
    Low: "bg-[#F3F7F5] text-[#5C7067] border border-[#DDE8E2]",
    Medium: "bg-[#EAF7F0] text-[#246748] border border-[#CBE8D7]",
    High: "bg-[#FFF6E5] text-[#A46308] border border-[#F6D99D]",
    Critical: "bg-[#FFF0F0] text-[#B42318] border border-[#F3C5C5]",
  };

  return (
    styles[priority] ||
    "bg-[#F3F7F5] text-[#5C7067] border border-[#DDE8E2]"
  );
};

/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

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

  const minutes = Math.floor(
    diff / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
};

/*
|--------------------------------------------------------------------------
| ACTIVITY
|--------------------------------------------------------------------------
*/

const formatActivityAction = (
  action = ""
) => {
  const labels = {
    PROBLEM_REPORTED:
      "Problem Reported",

    DEPARTMENT_AUTO_ASSIGNED:
      "Department Auto Assigned",

    DEPARTMENT_CORRECTED:
      "Department Corrected",

    STATUS_CHANGED:
      "Status Changed",

    VALIDATION_STATUS_CHANGED:
      "Validation Status Changed",

    PRIORITY_CHANGED:
      "Priority Changed",

    PROBLEM_UPDATED:
      "Problem Updated",
  };

  if (labels[action]) {
    return labels[action];
  }

  return (
    action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      ) ||
    "Activity"
  );
};

/*
|--------------------------------------------------------------------------
| SMALL UI COMPONENTS
|--------------------------------------------------------------------------
*/

const InfoItem = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 break-words text-[14px] font-medium text-slate-700">
      {value || "—"}
    </p>
  </div>
);

const SectionTitle = ({
  title,
  count,
}) => (
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-[16px] font-semibold text-[#18352A]">
      {title}
    </h2>

    {count !== undefined && (
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-500">
        {count}
      </span>
    )}
  </div>
);

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function GovernmentProblemDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [problem, setProblem] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * SAVED VALUES
   */

  const [status, setStatus] =
    useState("");

  const [priority, setPriority] =
    useState("");

  const [department, setDepartment] =
    useState("");

  /*
   * TEMPORARY DEPARTMENT
   *
   * This changes when dropdown changes.
   *
   * It DOES NOT change the actual complaint
   * until Save Changes is clicked.
   */

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState("");

  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [aiNotice, setAiNotice] = useState("");

  const handleRerunAI = async () => {
    try {
      setAnalyzing(true);
      setAiNotice("");
      const res = await api.post(`/problems/${id}/analyze`);
      if (res.data?.success && res.data.problem) {
        setProblem(res.data.problem);
        setAiNotice("AI analysis and university matches successfully updated!");
      }
    } catch (err) {
      console.error("Re-run AI error:", err);
      setError(
        err?.response?.data?.message ||
        "Unable to run AI analysis. Please ensure the university matching service is running on port 8001."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | FETCH PROBLEM
   |--------------------------------------------------------------------------
   */

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/problems/${id}`
      );

      const data =
        response.data?.problem ||
        response.data;

      setProblem(data);

      setStatus(
        data.status || "Pending"
      );

      setPriority(
        data.priority || "Medium"
      );

      const savedDepartment =
        data.governmentDepartment ||
        "";

      setDepartment(
        savedDepartment
      );

      setSelectedDepartment(
        savedDepartment
      );
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

  /*
   |--------------------------------------------------------------------------
   | UPDATE PROBLEM
   |--------------------------------------------------------------------------
   */

  const updateProblem = async (
    updates
  ) => {
    try {
      setSaving(true);
      setError("");

      const response =
        await api.patch(
          `/problems/${id}/government`,
          updates
        );

      const updated =
        response.data?.problem ||
        response.data;

      setProblem(updated);

      setStatus(
        updated.status || status
      );

      setPriority(
        updated.priority || priority
      );

      const savedDepartment =
        updated.governmentDepartment ||
        "";

      setDepartment(
        savedDepartment
      );

      setSelectedDepartment(
        savedDepartment
      );
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

  /*
   |--------------------------------------------------------------------------
   | VALIDATION STATUS
   |--------------------------------------------------------------------------
   */

  const getValidationStatus = (
    currentStatus
  ) => {
    const validationMap = {
      Validated: "Validated",
      Rejected: "Rejected",
      Duplicate: "Duplicate",
    };

    return validationMap[
      currentStatus
    ];
  };

  /*
   |--------------------------------------------------------------------------
   | SAVE CHANGES
   |--------------------------------------------------------------------------
   |
   | Category is calculated ONLY here.
   |
   | Example:
   |
   | Current saved department:
   | Environment
   |
   | Government selects:
   | Health
   |
   | Before Save:
   | Backend = Environment
   |
   | After Save:
   | Department = Health
   | Category = Health
   |
   */

  const handleSave = async () => {
    if (!selectedDepartment) {
      setError(
        "Please select a department."
      );

      return;
    }

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

  /*
   |--------------------------------------------------------------------------
   | QUICK ACTIONS
   |--------------------------------------------------------------------------
   |
   | Quick actions always use SAVED department.
   |
   | Therefore an unsaved department selection
   | will not accidentally be saved.
   |
   */

  const handleQuickAction = (
    action
  ) => {
    const savedCategory =
      getCategoryFromDepartment(
        department
      );

    if (action === "validate") {
      setStatus("Validated");

      updateProblem({
        status: "Validated",
        validationStatus:
          "Validated",
        priority,

        governmentDepartment:
          department,

        category: savedCategory,
      });
    }

    if (action === "reject") {
      setStatus("Rejected");

      updateProblem({
        status: "Rejected",
        validationStatus:
          "Rejected",
        priority,

        governmentDepartment:
          department,

        category: savedCategory,
      });
    }

    if (action === "duplicate") {
      setStatus("Duplicate");

      updateProblem({
        status: "Duplicate",
        validationStatus:
          "Duplicate",
        priority,

        governmentDepartment:
          department,

        category: savedCategory,
      });
    }
  };

  /*
   |--------------------------------------------------------------------------
   | DEPARTMENT CHANGE
   |--------------------------------------------------------------------------
   |
   | ONLY update temporary dropdown.
   |
   | No API call.
   | No problem update.
   | No category update.
   */

  const handleDepartmentChange = (
    newDepartment
  ) => {
    setSelectedDepartment(
      newDepartment
    );

    setError("");
  };

  /*
   |--------------------------------------------------------------------------
   | NORMALIZED MEDIA
   |--------------------------------------------------------------------------
   */

  const media = useMemo(() => {
    return normalizeMedia(problem);
  }, [problem]);

  /*
   |--------------------------------------------------------------------------
   | LOADING
   |--------------------------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-slate-500">
            Loading complaint...
          </p>
        </div>
      </div>
    );
  }

  /*
   |--------------------------------------------------------------------------
   | NOT FOUND
   |--------------------------------------------------------------------------
   */

  if (!problem) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-9">
        <div className="rounded-xl border border-red-100 bg-red-50 p-6">
          <p className="text-[14px] font-medium text-red-700">
            {error ||
              "Complaint not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mt-4 rounded-lg bg-[#2E7D5B] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1d659b]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /*
   |--------------------------------------------------------------------------
   | ACTIVITY
   |--------------------------------------------------------------------------
   */

  const activity = Array.isArray(
    problem.activity
  )
    ? problem.activity
    : Array.isArray(
      problem.activities
    )
      ? problem.activities
      : [];

  const sortedActivity = [
    ...activity,
  ].sort(
    (a, b) =>
      new Date(
        b.createdAt || 0
      ) -
      new Date(
        a.createdAt || 0
      )
  );

  /*
   |--------------------------------------------------------------------------
   | MAIN UI
   |--------------------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#F7FBF8]">
      <div className="mx-auto max-w-7xl px-5 py-6">

        {/* ==================================================
            TOP BAR
        ================================================== */}

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              ←
            </button>

            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
                Government Dashboard
              </p>

              <h1 className="mt-0.5 text-[20px] font-bold text-[#18352A]">
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

                <h2 className="mt-3 text-[22px] font-bold leading-tight text-[#18352A]">
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

            {/* ==================================================
                COMPLAINT INFORMATION
            ================================================== */}

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
                    problem.reportedBy
                      ?.name ||
                    problem.citizen
                      ?.name ||
                    problem.user?.name ||
                    problem.createdBy
                      ?.name
                  }
                />

                <InfoItem
                  label="Contact"
                  value={
                    problem.reportedBy
                      ?.phone ||
                    problem.citizen
                      ?.phone ||
                    problem.user?.phone
                  }
                />

              </div>

            </section>

            {/* ==================================================
                PROBLEM DESCRIPTION
            ================================================== */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <SectionTitle title="Problem Description" />

              <div className="rounded-lg bg-slate-50 p-4">

                <p className="whitespace-pre-wrap text-[14px] leading-7 text-slate-600">
                  {problem.description ||
                    "No description provided."}
                </p>

              </div>

            </section>

            {/* ==================================================
                PHOTOS & VIDEOS
            ================================================== */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <SectionTitle
                title="Photos & Videos"
                count={media.length}
              />

              {media.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                    📷
                  </div>

                  <p className="mt-3 text-[14px] font-medium text-slate-500">
                    No photos or videos available
                  </p>

                  <p className="mt-1 text-[12px] text-slate-400">
                    No media was returned with this complaint.
                  </p>

                </div>

              ) : (

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                  {media.map(
                    (item, index) => (

                      <button
                        key={
                          item.id ||
                          `media-${index}`
                        }
                        type="button"
                        onClick={() =>
                          setSelectedMedia(
                            index
                          )
                        }
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                      >

                        {/* IMAGE */}

                        {item.type ===
                          "image" ? (

                          <img
                            src={item.url}
                            alt={`Complaint evidence ${index + 1
                              }`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            onError={(
                              event
                            ) => {
                              console.error(
                                "Image failed to load:",
                                item.url
                              );

                              event.currentTarget.style.display =
                                "none";
                            }}
                          />

                        ) : item.type ===
                          "video" ? (

                          /* VIDEO */

                          <div className="relative h-full w-full">

                            <video
                              src={item.url}
                              muted
                              playsInline
                              preload="metadata"
                              className="h-full w-full object-cover"
                              onError={() =>
                                console.error(
                                  "Video failed to load:",
                                  item.url
                                )
                              }
                            />

                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">

                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-lg text-white shadow-lg">
                                ▶
                              </div>

                            </div>

                            <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
                              VIDEO
                            </span>

                          </div>

                        ) : (

                          /* UNKNOWN FILE */

                          <div className="flex h-full w-full items-center justify-center bg-slate-100">

                            <div className="text-center">

                              <div className="text-2xl">
                                📎
                              </div>

                              <p className="mt-2 text-[11px] text-slate-500">
                                Open File
                              </p>

                            </div>

                          </div>

                        )}

                        {/* HOVER */}

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition group-hover:opacity-100">

                          <p className="text-left text-[11px] font-medium text-white">
                            {item.type ===
                              "video"
                              ? "Open video"
                              : "Open photo"}
                          </p>

                        </div>

                      </button>

                    )
                  )}

                </div>

              )}

            </section>

            {/* ==================================================
                LOCATION
            ================================================== */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <SectionTitle title="Location" />

              <div className="grid gap-5 md:grid-cols-3">

                <div className="md:col-span-3">

                  <InfoItem
                    label="Address"
                    value={
                      problem.location
                        ?.address
                    }
                  />

                </div>

                <InfoItem
                  label="Latitude"
                  value={
                    problem.location
                      ?.latitude
                  }
                />

                <InfoItem
                  label="Longitude"
                  value={
                    problem.location
                      ?.longitude
                  }
                />

              </div>

            </section>


            {/* ==================================================
                RECOMMENDED UNIVERSITIES & HEIs (Module 3)
            ================================================== */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h2 className="text-[17px] font-bold text-[#18352A]">
                    Recommended Universities & Institutions (HEIs)
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Ranked against 25 Higher Education Institutions using multi-criteria domain, research, and capability matching.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {problem.aiAnalysis?.universityMatches?.length > 0 && (
                    <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-xs font-bold">
                      {problem.aiAnalysis.universityMatches.length} Matches Found
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleRerunAI}
                    disabled={analyzing}
                    className="rounded-lg bg-[#18352A] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#2E7D5B] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {analyzing ? "Analyzing..." : "Re-run AI Analysis"}
                  </button>
                </div>
              </div>

              {/* Case 1: Government Routing Bypass */}
              {(problem.aiAnalysis?.routingType || problem.aiAnalysis?.structuredProblem?.classification?.routingType) === "GOVERNMENT" ? (
                <div className="rounded-xl bg-blue-50/60 border border-blue-200 p-5 text-center">
                  <div className="text-3xl mb-2">🏛️</div>
                  <h3 className="font-bold text-blue-900 text-sm">
                    Municipal / Public Service Routing
                  </h3>
                  <p className="mt-1 text-xs text-blue-700 max-w-lg mx-auto leading-relaxed">
                    This problem is classified as routine municipal or civic infrastructure responsibility. University innovation matching is bypassed per state policy so public works departments can resolve directly.
                  </p>
                </div>
              ) : !problem.aiAnalysis?.universityMatches || problem.aiAnalysis.universityMatches.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="text-3xl mb-2">🏫</div>
                  <h3 className="font-bold text-slate-700 text-sm">
                    No University Matches Calculated Yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Click "Re-run AI Analysis" above to evaluate this problem against the 25 Higher Education Institutions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {problem.aiAnalysis.universityMatches.map((match, index) => {
                    const rank = match.rank || index + 1;
                    const score = match.totalMatchScore || match.overallScore || 0;
                    const breakdown = match.scoreBreakdown || {};
                    const matchedDomains = match.matchedElements?.matchedDomains || [];
                    const matchedResearch = match.matchedElements?.matchedResearch || [];
                    const matchedSkills = match.matchedElements?.matchedSkills || [];

                    return (
                      <div
                        key={match.id || index}
                        className="rounded-xl border border-slate-200 p-4 transition hover:border-[#2E7D5B]/40 hover:shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#18352A] text-xs font-black text-white">
                              #{rank}
                            </span>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-800">
                                  {match.name}
                                </h3>
                                {match.type && (
                                  <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600">
                                    {match.type}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {match.city}{match.state ? `, ${match.state}` : ""}
                              </p>
                              {match.email && (
                                <p className="mt-1 text-xs font-medium text-[#2E7D5B]">
                                  University login: {match.email}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-right">
                              <span className="text-sm font-black text-emerald-800">
                                {score}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600">
                                {" "}/ 100 Match
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Multi-Factor Score Breakdown */}
                        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                          <div>
                            <p className="text-slate-400 font-semibold uppercase">Domain Align</p>
                            <p className="font-bold text-slate-800 mt-0.5">
                              {breakdown.domainAlignment !== undefined ? `${breakdown.domainAlignment}/35` : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-semibold uppercase">Research Match</p>
                            <p className="font-bold text-slate-800 mt-0.5">
                              {breakdown.researchMatch !== undefined ? `${breakdown.researchMatch}/25` : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-semibold uppercase">Skill Overlap</p>
                            <p className="font-bold text-slate-800 mt-0.5">
                              {breakdown.skillOverlap !== undefined ? `${breakdown.skillOverlap}/15` : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-semibold uppercase">Capabilities</p>
                            <p className="font-bold text-slate-800 mt-0.5">
                              {breakdown.capabilityScore !== undefined ? `${breakdown.capabilityScore}/15` : "—"}
                            </p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-slate-400 font-semibold uppercase">Regional Bonus</p>
                            <p className="font-bold text-slate-800 mt-0.5">
                              {breakdown.regionalAffinity !== undefined ? `+${breakdown.regionalAffinity}` : "—"}
                            </p>
                          </div>
                        </div>

                        {/* Matching Elements */}
                        {(matchedDomains.length > 0 || matchedResearch.length > 0 || matchedSkills.length > 0) && (
                          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[11px] font-bold text-slate-500 mr-1">
                              Why Matched:
                            </span>
                            {matchedDomains.map((d, i) => (
                              <span key={i} className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-medium border border-blue-100">
                                ✓ {d}
                              </span>
                            ))}
                            {matchedResearch.map((r, i) => (
                              <span key={i} className="rounded bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-medium border border-purple-100">
                                ✓ Research: {r}
                              </span>
                            ))}
                            {matchedSkills.map((s, i) => (
                              <span key={i} className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-medium border border-emerald-100">
                                ✓ Skill: {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {match.prototypeNotes && (
                          <p className="mt-2.5 text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                            💡 {match.prototypeNotes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

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
                    value={
                      selectedDepartment
                    }
                    onChange={(e) =>
                      handleDepartmentChange(
                        e.target.value
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
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

                  {selectedDepartment !==
                    department && (
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
                      setStatus(
                        e.target.value
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                      setPriority(
                        e.target.value
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                    SAVE
                ================================================== */}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    saving ||
                    !selectedDepartment
                  }
                  className="w-full rounded-lg bg-[#2E7D5B] px-3.5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1d659b] disabled:cursor-not-allowed disabled:opacity-60"
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
                      type="button"
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
                      type="button"
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
                      type="button"
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

              <h2 className="text-[16px] font-semibold text-[#18352A]">
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

            {sortedActivity.length ===
              0 ? (

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

                        <div className="absolute left-0 top-0.5 z-10 flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 border-[#2E7D5B] bg-white">

                          <div className="h-1.5 w-1.5 rounded-full bg-[#2E7D5B]" />

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

                                {item
                                  .performedBy
                                  ?.name && (
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() =>
                setSelectedMedia(null)
              }
            >

              <div
                className="relative flex h-[85vh] w-full max-w-6xl items-center justify-center"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedMedia(null)
                  }
                  className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg text-white backdrop-blur transition hover:bg-white/20"
                >
                  ✕
                </button>

                {/* IMAGE */}

                {media[selectedMedia]
                  .type === "image" && (

                    <img
                      src={
                        media[
                          selectedMedia
                        ].url
                      }
                      alt="Complaint evidence"
                      className="max-h-full max-w-full rounded-xl object-contain"
                    />
                  )}

                {/* VIDEO */}

                {media[selectedMedia]
                  .type === "video" && (

                    <video
                      src={
                        media[
                          selectedMedia
                        ].url
                      }
                      controls
                      autoPlay
                      playsInline
                      className="max-h-full max-w-full rounded-xl"
                    />
                  )}

                {/* UNKNOWN */}

                {!["image", "video"].includes(
                  media[selectedMedia].type
                ) && (

                    <div className="rounded-xl bg-white p-8 text-center">

                      <div className="text-3xl">
                        📎
                      </div>

                      <p className="mt-3 text-sm text-slate-600">
                        Unable to preview this file.
                      </p>

                      <a
                        href={
                          media[
                            selectedMedia
                          ].url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block rounded-lg bg-[#2E7D5B] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Open File
                      </a>

                    </div>
                  )}

                {/* PREVIOUS */}

                {media.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMedia(
                        (selectedMedia -
                          1 +
                          media.length) %
                        media.length
                      )
                    }
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20"
                  >
                    ‹
                  </button>
                )}

                {/* NEXT */}

                {media.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMedia(
                        (selectedMedia +
                          1) %
                        media.length
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20"
                  >
                    ›
                  </button>
                )}

                {/* COUNTER */}

                {media.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white">
                    {selectedMedia + 1}{" "}
                    / {media.length}
                  </div>
                )}

              </div>

            </div>

          )}

      </div>
    </div>
  );
}
