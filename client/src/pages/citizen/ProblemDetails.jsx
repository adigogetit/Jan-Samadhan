import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
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
  Building,
  ShieldCheck,
  Tag,
} from "lucide-react";
import api from "../../services/api";

import StatusBadge from "../../components/ui/StatusBadge";
import InfoCard from "../../components/ui/InfoCard";
import SectionHeading from "../../components/ui/SectionHeading";
import AlertBanner from "../../components/ui/AlertBanner";
import LoadingState from "../../components/ui/LoadingState";

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
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/problems/${id}`);

      if (response.data?.success) {
        setProblem(response.data.problem);
      } else {
        setError(response.data?.message || "Failed to load problem.");
      }
    } catch (err) {
      console.error("Fetch problem details error:", err);
      setError(
        err.response?.data?.message || "Unable to load problem details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  // Media items
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
      selectedMediaIndex === 0 ? mediaItems.length - 1 : selectedMediaIndex - 1;
    setSelectedMediaIndex(previousIndex);
    setSelectedMedia(mediaItems[previousIndex]);
  };

  const showNextMedia = () => {
    if (!mediaItems.length) return;
    const nextIndex =
      selectedMediaIndex === mediaItems.length - 1 ? 0 : selectedMediaIndex + 1;
    setSelectedMediaIndex(nextIndex);
    setSelectedMedia(mediaItems[nextIndex]);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedMedia) return;
      if (event.key === "Escape") closeMedia();
      if (event.key === "ArrowLeft") showPreviousMedia();
      if (event.key === "ArrowRight") showNextMedia();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMedia, selectedMediaIndex, mediaItems.length]);

  if (loading) {
    return (
      <div className="min-h-full bg-[#F7FBF8] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <LoadingState cards={4} />
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-full bg-[#F7FBF8] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/citizen/problems")}
            className="group mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#5D7469] transition hover:text-[#2E7D5B]"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to My Problems
          </button>

          <AlertBanner
            type="error"
            message={error || "Problem not found."}
            onRetry={fetchProblem}
          />
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(problem.status);

  return (
    <>
      <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/citizen/problems")}
            className="group mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#5D7469] transition hover:text-[#2E7D5B]"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to My Problems
          </button>

          {/* HERO CARD */}
          <div className="relative mb-8 overflow-hidden rounded-[28px] border border-[#DDEDE4] bg-white p-6 sm:p-8 shadow-[0_12px_45px_rgba(24,53,42,0.06)]">
            {/* Top accent stripe */}
            <div className="absolute left-0 right-0 top-0 h-1.5 bg-[#2E7D5B]" />

            {/* Decorative ambient elements */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#EAF7F0]" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#F2FAF5]" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl bg-[#F0F9F3] border border-[#CFE7D8] px-3 py-1 text-xs font-extrabold text-[#246748]">
                  {problem.category || "General"}
                </span>
                <StatusBadge status={problem.status || "Pending"} />
                <StatusBadge
                  status={problem.priority || "Medium"}
                  variant="priority"
                />
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-[#18352A] sm:text-3xl lg:text-4xl">
                {problem.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-semibold text-[#789087]">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-[#2E7D5B]" />
                  Reported {formatDate(problem.createdAt)}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#2E7D5B]" />
                  {problem.district || "Jharkhand"}
                  {problem.block ? `, ${problem.block}` : ""}
                </span>

                <span className="rounded-lg bg-[#F2F8F4] px-2.5 py-1 font-mono text-[11px] text-[#5D7469]">
                  ID: {problem._id}
                </span>
              </div>
            </div>
          </div>

          {/* 2-COLUMN CONTENT LAYOUT */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* MAIN CONTENT (2 cols) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Description */}
              <section className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7F0] text-[#2E7D5B]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#18352A]">
                      Problem Description
                    </h2>
                    <p className="text-xs text-[#789087]">
                      Submitted grievance details
                    </p>
                  </div>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-7 text-[#4D6459]">
                  {problem.description}
                </p>
              </section>

              {/* Geographic Context */}
              <section className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7F0] text-[#2E7D5B]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#18352A]">
                      Location & Jurisdiction
                    </h2>
                    <p className="text-xs text-[#789087]">
                      Regional administrative boundary
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard
                    label="District"
                    value={problem.district || "—"}
                    color="green"
                  />
                  <InfoCard
                    label="Block"
                    value={problem.block || "—"}
                    color="green"
                  />
                  <InfoCard
                    label="Address / Landmark"
                    value={problem.location?.address || "—"}
                    color="dark"
                    className="sm:col-span-2"
                  />
                  {problem.location?.latitude && (
                    <InfoCard
                      label="Latitude"
                      value={problem.location.latitude}
                      color="gray"
                    />
                  )}
                  {problem.location?.longitude && (
                    <InfoCard
                      label="Longitude"
                      value={problem.location.longitude}
                      color="gray"
                    />
                  )}
                </div>
              </section>

              {/* Evidence & Media */}
              <section className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
                <div className="mb-5">
                  <h2 className="text-base font-extrabold text-[#18352A]">
                    Submitted Evidence
                  </h2>
                  <p className="mt-1 text-xs text-[#789087]">
                    Photos and video attachments verifying the civic condition
                  </p>
                </div>

                {mediaItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {mediaItems.map((media, index) => (
                      <button
                        key={`${media.url}-${index}`}
                        type="button"
                        onClick={() => openMedia(media, index)}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-[#DDEDE4] bg-[#F7FBF8] text-left transition hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#EAF7F0]"
                      >
                        {media.type === "image" ? (
                          <img
                            src={media.url}
                            alt={`Problem evidence ${index + 1}`}
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

                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
                          <div className="flex w-full items-center gap-2 px-3 py-2.5 text-white">
                            {media.type === "image" ? (
                              <ImageIcon size={14} />
                            ) : (
                              <Video size={14} />
                            )}
                            <span className="text-[11px] font-bold">
                              View {media.type === "image" ? "Photo" : "Video"}
                            </span>
                          </div>
                        </div>

                        <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase text-white backdrop-blur">
                          {media.type}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#DDEDE4] bg-[#F7FBF8] px-5 py-8 text-center">
                    <p className="text-xs font-semibold text-[#789087]">
                      No photos or videos were attached to this report.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* SIDEBAR (1 col) */}
            <div className="space-y-6">
              {/* Status Timeline */}
              <section className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
                <h2 className="text-base font-extrabold text-[#18352A]">
                  Resolution Lifecycle
                </h2>
                <p className="mt-1 text-xs text-[#789087]">
                  Current stage in grievance pipeline
                </p>

                <div className="mt-6 space-y-4">
                  {statusOrder.map((status, index) => {
                    const reached = currentStatusIndex >= index;
                    const isCurrent = problem.status === status;

                    return (
                      <div
                        key={status}
                        className="relative flex items-start gap-3.5 pb-4 last:pb-0"
                      >
                        {index < statusOrder.length - 1 && (
                          <div
                            className={`absolute left-[13px] top-6 h-full w-0.5 ${reached ? "bg-[#2E7D5B]" : "bg-[#DDEDE4]"
                              }`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${reached
                              ? "border-[#2E7D5B] bg-[#2E7D5B] text-white shadow-sm"
                              : "border-[#DDEDE4] bg-white text-transparent"
                            }`}
                        >
                          <CheckCircle2 size={14} />
                        </div>

                        <div className="pt-0.5">
                          <p
                            className={`text-sm font-extrabold ${isCurrent
                                ? "text-[#2E7D5B]"
                                : reached
                                  ? "text-[#18352A]"
                                  : "text-[#A0B0A8]"
                              }`}
                          >
                            {status}
                          </p>

                          {isCurrent && (
                            <span className="mt-0.5 inline-block rounded-md bg-[#EAF7F0] px-2 py-0.5 text-[10px] font-bold text-[#246748]">
                              Active State
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Administrative Assignment */}
              <section className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
                <h2 className="text-base font-extrabold text-[#18352A]">
                  Administrative Routing
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-[#DDEDE4] bg-[#FAFDFB] p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">
                      Assigned Department
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#18352A]">
                      {problem.governmentDepartment || "Pending assignment"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#DDEDE4] bg-[#FAFDFB] p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">
                      Validation Status
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#18352A]">
                      {problem.validationStatus || "Pending Review"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#DDEDE4] bg-[#FAFDFB] p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">
                      Last Updated
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#667A70]">
                      {formatDateTime(problem.updatedAt)}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* MEDIA LIGHTBOX MODAL */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeMedia();
          }}
        >
          {mediaItems.length > 1 && (
            <button
              type="button"
              onClick={showPreviousMedia}
              className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#18352A] shadow-lg transition hover:bg-white md:left-8"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className="relative h-[75vh] w-[75vh] max-h-[85vh] max-w-[90vw] overflow-hidden rounded-3xl bg-black shadow-2xl">
            <button
              type="button"
              onClick={closeMedia}
              className="absolute right-3.5 top-3.5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="absolute left-3.5 top-3.5 z-30 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              {selectedMediaIndex + 1} / {mediaItems.length}
            </div>

            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Problem evidence"
                className="h-full w-full object-contain"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            )}
          </div>

          {mediaItems.length > 1 && (
            <button
              type="button"
              onClick={showNextMedia}
              className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#18352A] shadow-lg transition hover:bg-white md:right-8"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </>
  );
}