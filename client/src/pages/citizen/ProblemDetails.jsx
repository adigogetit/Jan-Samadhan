import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import api from "../../services/api";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  Validated: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "In Progress": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Resolved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Duplicate: "bg-slate-100 text-slate-600 border-slate-200",
};

const priorityStyles = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-red-50 text-red-700",
};

const statusOrder = [
  "Pending",
  "Under Review",
  "Validated",
  "In Progress",
  "Resolved",
];

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusIndex(status) {
  return statusOrder.indexOf(status);
}

export default function ProblemDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Media modal
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] =
    useState(0);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/problems/${id}`);

      if (response.data?.success) {
        setProblem(response.data.problem);
      } else {
        setError(
          response.data?.message ||
          "Failed to load problem."
        );
      }
    } catch (err) {
      console.error(
        "Fetch problem details error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load problem details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  // ============================================================
  // MEDIA
  // ============================================================

  const mediaItems = [
    ...(problem?.images || []).map((url) => ({
      type: "image",
      url,
    })),

    ...(problem?.videos || []).map((url) => ({
      type: "video",
      url,
    })),
  ];

  const openMedia = (media, index) => {
    setSelectedMedia(media);
    setSelectedMediaIndex(index);
  };

  const closeMedia = () => {
    setSelectedMedia(null);
  };

  const showPreviousMedia = () => {
    if (!mediaItems.length) return;

    const previousIndex =
      selectedMediaIndex === 0
        ? mediaItems.length - 1
        : selectedMediaIndex - 1;

    setSelectedMediaIndex(previousIndex);
    setSelectedMedia(mediaItems[previousIndex]);
  };

  const showNextMedia = () => {
    if (!mediaItems.length) return;

    const nextIndex =
      selectedMediaIndex ===
        mediaItems.length - 1
        ? 0
        : selectedMediaIndex + 1;

    setSelectedMediaIndex(nextIndex);
    setSelectedMedia(mediaItems[nextIndex]);
  };

  // ============================================================
  // ESC KEY
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedMedia) return;

      if (event.key === "Escape") {
        closeMedia();
      }

      if (event.key === "ArrowLeft") {
        showPreviousMedia();
      }

      if (event.key === "ArrowRight") {
        showNextMedia();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedMedia,
    selectedMediaIndex,
    mediaItems.length,
  ]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto flex min-h-[400px] max-w-5xl items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <RefreshCw
              size={18}
              className="animate-spin"
            />

            Loading problem details...
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !problem) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() =>
              navigate("/citizen/problems")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#2477B5]"
          >
            <ArrowLeft size={18} />
            Back to My Problems
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={21}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <h2 className="font-semibold text-red-700">
                  Unable to load problem
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error ||
                    "Problem not found."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchProblem}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusClass =
    statusStyles[problem.status] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  const priorityClass =
    priorityStyles[problem.priority] ||
    "bg-slate-100 text-slate-600";

  const currentStatusIndex =
    getStatusIndex(problem.status);

  return (
    <>
      <div className="min-h-full bg-slate-50 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">

          {/* Back */}
          <button
            type="button"
            onClick={() =>
              navigate("/citizen/problems")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#2477B5]"
          >
            <ArrowLeft size={18} />
            Back to My Problems
          </button>

          {/* Header */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
                  >
                    {problem.status}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}
                  >
                    {problem.priority} Priority
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-bold text-[#172B3A] md:text-3xl">
                  {problem.title}
                </h1>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />

                    Reported{" "}
                    {formatDate(
                      problem.createdAt
                    )}
                  </span>

                  <span>
                    Category:{" "}
                    <strong className="font-medium text-slate-700">
                      {problem.category}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
                <p className="text-xs text-slate-400">
                  Problem ID
                </p>

                <p className="mt-1 max-w-[180px] break-all text-xs font-medium text-slate-600">
                  {problem._id}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">

            {/* ================================================== */}
            {/* MAIN */}
            {/* ================================================== */}

            <div className="space-y-6 lg:col-span-2">

              {/* Description */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-[#2477B5]">
                    <FileText size={20} />
                  </div>

                  <h2 className="text-lg font-semibold text-[#172B3A]">
                    Problem Description
                  </h2>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {problem.description}
                </p>
              </section>

              {/* Location */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-[#2477B5]">
                    <MapPin size={20} />
                  </div>

                  <h2 className="text-lg font-semibold text-[#172B3A]">
                    Location
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">
                      District
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {problem.district ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Block
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {problem.block ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Address / Landmark
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {problem.location
                        ?.address || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Latitude
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {problem.location
                        ?.latitude ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Longitude
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {problem.location
                        ?.longitude ?? "—"}
                    </p>
                  </div>
                </div>
              </section>

              {/* ================================================== */}
              {/* MEDIA */}
              {/* ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#172B3A]">
                    Evidence
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Photos and videos submitted
                    with this problem.
                  </p>
                </div>

                {mediaItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

                    {mediaItems.map(
                      (media, index) => (
                        <button
                          key={`${media.url}-${index}`}
                          type="button"
                          onClick={() =>
                            openMedia(
                              media,
                              index
                            )
                          }
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left focus:outline-none focus:ring-2 focus:ring-[#2477B5]"
                        >
                          {media.type ===
                            "image" ? (
                            <img
                              src={media.url}
                              alt={`Problem evidence ${index + 1
                                }`}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <video
                              src={media.url}
                              muted
                              preload="metadata"
                              className="h-full w-full object-cover"
                            />
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
                            <div className="flex w-full items-center gap-2 px-3 py-3 text-white">
                              {media.type ===
                                "image" ? (
                                <ImageIcon
                                  size={16}
                                />
                              ) : (
                                <Video
                                  size={16}
                                />
                              )}

                              <span className="text-xs font-medium">
                                Click to view
                              </span>
                            </div>
                          </div>

                          {/* Media Type */}
                          <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                            {media.type ===
                              "image"
                              ? "PHOTO"
                              : "VIDEO"}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 px-5 py-10 text-center">
                    <p className="text-sm text-slate-400">
                      No photos or videos were
                      uploaded with this report.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* ================================================== */}
            {/* SIDEBAR */}
            {/* ================================================== */}

            <div className="space-y-6">

              {/* Current status */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[#172B3A]">
                  Current Status
                </h2>

                <div className="mt-5 flex items-center gap-3">
                  <div className="rounded-full bg-blue-50 p-3 text-[#2477B5]">
                    <Clock3 size={20} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Current status
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {problem.status}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-xs text-slate-400">
                    Priority
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {problem.priority}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-xs text-slate-400">
                    Government Department
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {problem.governmentDepartment ||
                      "Not assigned yet"}
                  </p>
                </div>
              </section>

              {/* Timeline */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[#172B3A]">
                  Status Timeline
                </h2>

                <div className="mt-6">
                  {statusOrder.map(
                    (status, index) => {
                      const reached =
                        currentStatusIndex >=
                        index;

                      const isCurrent =
                        problem.status ===
                        status;

                      return (
                        <div
                          key={status}
                          className="relative flex gap-3 pb-6 last:pb-0"
                        >
                          {index <
                            statusOrder.length -
                            1 && (
                              <div
                                className={`absolute left-[11px] top-6 h-full w-px ${reached
                                    ? "bg-[#2477B5]"
                                    : "bg-slate-200"
                                  }`}
                              />
                            )}

                          <div
                            className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${reached
                                ? "border-[#2477B5] bg-[#2477B5] text-white"
                                : "border-slate-200 bg-white text-transparent"
                              }`}
                          >
                            <CheckCircle2
                              size={13}
                            />
                          </div>

                          <div>
                            <p
                              className={`text-sm font-medium ${isCurrent
                                  ? "text-[#2477B5]"
                                  : reached
                                    ? "text-slate-700"
                                    : "text-slate-400"
                                }`}
                            >
                              {status}
                            </p>

                            {isCurrent && (
                              <p className="mt-1 text-xs text-slate-400">
                                Current status
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>

              {/* Dates */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[#172B3A]">
                  Report Information
                </h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Created
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {formatDateTime(
                        problem.createdAt
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {formatDateTime(
                        problem.updatedAt
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Validation
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {problem.validationStatus ||
                        "Pending"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* MEDIA VIEWER MODAL */}
      {/* ====================================================== */}

      {selectedMedia && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeMedia();
            }
          }}
        >
          {/* Previous */}
          {mediaItems.length > 1 && (
            <button
              type="button"
              onClick={showPreviousMedia}
              className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white md:left-8"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Square Viewer */}
          <div className="relative h-[75vh] w-[75vh] max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl bg-black shadow-2xl">

            {/* Close */}
            <button
              type="button"
              onClick={closeMedia}
              className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
            >
              <X size={21} />
            </button>

            {/* Counter */}
            <div className="absolute left-3 top-3 z-30 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              {selectedMediaIndex + 1} /{" "}
              {mediaItems.length}
            </div>

            {/* Image */}
            {selectedMedia.type ===
              "image" && (
                <img
                  src={selectedMedia.url}
                  alt="Problem evidence"
                  className="h-full w-full object-contain"
                />
              )}

            {/* Video */}
            {selectedMedia.type ===
              "video" && (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
              )}
          </div>

          {/* Next */}
          {mediaItems.length > 1 && (
            <button
              type="button"
              onClick={showNextMedia}
              className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white md:right-8"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </>
  );
}