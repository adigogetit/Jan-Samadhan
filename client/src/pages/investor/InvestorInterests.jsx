import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Handshake,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  Filter,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  Trash2,
} from "lucide-react";
import api from "../../services/api";

const STATUS_FILTERS = ["All", "Pending", "Accepted", "Rejected", "Withdrawn"];

const getStatusBadge = (status) => {
  switch (status) {
    case "Pending":
      return "bg-[#FFF6E5] text-[#A46308] border-[#F6D99D]";
    case "Accepted":
      return "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]";
    case "Rejected":
      return "bg-[#FFF0F0] text-[#B42318] border-[#F3C5C5]";
    case "Withdrawn":
      return "bg-[#F3F7F5] text-[#5C7067] border-[#DDE8E2]";
    default:
      return "bg-[#F3F7F5] text-[#5C7067] border-[#DDE8E2]";
  }
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

export default function InvestorInterests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "All";

  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    loadInterests();
  }, [selectedStatus]);

  const loadInterests = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (selectedStatus && selectedStatus !== "All") {
        params.status = selectedStatus;
      }

      const response = await api.get("/investor/interests", { params });

      if (response.data?.success) {
        setInterests(response.data.interests || []);
      } else {
        setInterests([]);
        setError(response.data?.message || "Failed to load your interests.");
      }
    } catch (err) {
      console.error("Failed to load investor interests:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load partnership interests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (interestId) => {
    if (!window.confirm("Are you sure you want to withdraw this partnership interest request?")) {
      return;
    }

    try {
      setActionLoadingId(interestId);
      setActionMessage("");

      const response = await api.patch(`/investor/interests/${interestId}/withdraw`);

      if (response.data?.success) {
        setActionMessage("Partnership interest request withdrawn successfully.");
        await loadInterests();
      } else {
        setError(response.data?.message || "Failed to withdraw request.");
      }
    } catch (err) {
      console.error("Withdraw interest error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to withdraw request. Please try again."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFilterChange = (status) => {
    setSelectedStatus(status);
    if (status === "All") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", status);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7FBF8] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#18352A] md:text-3xl">
                My Partnership Interests
              </h1>
              {!loading && (
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {interests.length}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Track your expressions of interest, review university responses, and manage collaboration requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/investor/projects"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#18352A] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#23445A]"
            >
              Browse Projects <ArrowRight size={14} />
            </Link>
            <button
              onClick={loadInterests}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-[#F7FBF8]"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* =====================================================
            FILTER PILLS
        ====================================================== */}
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">
            <Filter size={12} /> Status:
          </span>
          {STATUS_FILTERS.map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${isActive
                    ? "bg-[#18352A] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* =====================================================
            NOTIFICATIONS / ALERTS
        ====================================================== */}
        {actionMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            {actionMessage}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={20} className="text-red-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* =====================================================
            INTERESTS LIST
        ====================================================== */}
        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex justify-between">
                  <div className="h-5 w-32 rounded bg-slate-200" />
                  <div className="h-5 w-24 rounded-full bg-slate-200" />
                </div>
                <div className="mt-4 h-6 w-1/2 rounded bg-slate-200" />
                <div className="mt-3 h-12 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : interests.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Handshake size={32} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#18352A]">
              {selectedStatus !== "All"
                ? `No ${selectedStatus} Interest Requests`
                : "No Partnership Requests Yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {selectedStatus !== "All"
                ? `You have no interest requests currently marked as ${selectedStatus}.`
                : "Browse active university civic innovation projects and express interest in mentorship, technical partnership, or support."}
            </p>
            <Link
              to="/investor/projects"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#18352A] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#23445A]"
            >
              Explore Available Projects <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {interests.map((item) => {
              const proj = item.project || {};
              const isWithdrawing = actionLoadingId === item._id;

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      {/* Status & Support Type */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>

                        <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-xs font-semibold">
                          {item.supportType}
                        </span>

                        {item.organizationName && (
                          <span className="text-xs text-slate-500 font-medium">
                            as <strong>{item.organizationName}</strong>
                          </span>
                        )}
                      </div>

                      {/* Project Title */}
                      <h2 className="text-lg font-bold text-[#18352A] pt-1">
                        <Link
                          to={`/investor/projects/${proj._id}`}
                          className="hover:text-[#2E7D5B] hover:underline"
                        >
                          {proj.title || "Project details unavailable"}
                        </Link>
                      </h2>

                      {/* University Info */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{proj.university?.name || "University"}</span>
                        {proj.university?.district && (
                          <span>({proj.university.district})</span>
                        )}
                        {proj.category && (
                          <>
                            <span>·</span>
                            <span>{proj.category}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions & Dates */}
                    <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                      <div className="text-[11px] text-slate-400">
                        Submitted on {formatDate(item.createdAt)}
                      </div>

                      {item.respondedAt && (
                        <div className="text-[11px] text-slate-500">
                          Responded on {formatDate(item.respondedAt)}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          to={`/investor/projects/${proj._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2E7D5B] hover:underline"
                        >
                          View Project <ArrowRight size={12} />
                        </Link>

                        {item.status === "Pending" && (
                          <button
                            type="button"
                            onClick={() => handleWithdraw(item._id)}
                            disabled={isWithdrawing}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            {isWithdrawing ? (
                              "Withdrawing..."
                            ) : (
                              <>
                                <Trash2 size={12} /> Withdraw
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message Quote */}
                  {item.message && (
                    <div className="mt-4 rounded-xl bg-[#F7FBF8] p-3 text-xs text-slate-700 border border-slate-100">
                      <p className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider mb-1">
                        Proposal / Message:
                      </p>
                      <p className="whitespace-pre-line leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
