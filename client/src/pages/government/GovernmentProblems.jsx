import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";

const statuses = [
  "All",
  "Pending",
  "Under Review",
  "Validated",
  "In Progress",
  "Resolved",
  "Rejected",
  "Duplicate",
];

const priorities = [
  "All",
  "Low",
  "Medium",
  "High",
  "Critical",
];

const departments = [
  "All",
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

const statusStyles = {
  Pending:
    "bg-amber-50 text-amber-700 border-amber-200",

  "Under Review":
    "bg-blue-50 text-blue-700 border-blue-200",

  Validated:
    "bg-indigo-50 text-indigo-700 border-indigo-200",

  "In Progress":
    "bg-cyan-50 text-cyan-700 border-cyan-200",

  Resolved:
    "bg-green-50 text-green-700 border-green-200",

  Rejected:
    "bg-red-50 text-red-700 border-red-200",

  Duplicate:
    "bg-slate-100 text-slate-600 border-slate-200",
};

const priorityStyles = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-red-50 text-red-700",
};

const statusIcons = {
  Pending: AlertCircle,
  "Under Review": FileText,
  Validated: ShieldCheck,
  "In Progress": RefreshCw,
  Resolved: CheckCircle2,
  Rejected: XCircle,
  Duplicate: X,
};

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GovernmentProblems() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [status, setStatus] = useState(
    searchParams.get("status") || "All"
  );

  const [priority, setPriority] = useState(
    searchParams.get("priority") || "All"
  );

  /*
   * Department is now the single routing/filter field.
   *
   * Category is intentionally removed from this page
   * because category is controlled by the saved department.
   */
  const [department, setDepartment] = useState(
    searchParams.get("department") || "All"
  );

  const [district, setDistrict] = useState(
    searchParams.get("district") || "All"
  );

  // ==========================================================
  // BUILD API PARAMETERS
  // ==========================================================

  const buildParams = () => {
    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (status !== "All") {
      params.status = status;
    }

    if (priority !== "All") {
      params.priority = priority;
    }

    if (department !== "All") {
      params.department = department;
    }

    if (district !== "All") {
      params.district = district;
    }

    return params;
  };

  // ==========================================================
  // FETCH COMPLAINTS
  // ==========================================================

  const fetchProblems = async (customParams) => {
    try {
      setLoading(true);
      setError("");

      const params =
        customParams || buildParams();

      const response = await api.get("/problems", {
        params,
      });

      if (response.data?.success) {
        setProblems(
          response.data.problems || []
        );
      } else {
        setError(
          response.data?.message ||
            "Failed to load complaints."
        );
      }
    } catch (err) {
      console.error(
        "Government problems error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD WHEN FILTERS CHANGE
  // ==========================================================

  useEffect(() => {
    fetchProblems();
  }, [
    status,
    priority,
    department,
    district,
  ]);

  // ==========================================================
  // UPDATE URL
  // ==========================================================

  const updateUrl = (overrides = {}) => {
    const params = {
      ...buildParams(),
      ...overrides,
    };

    Object.keys(params).forEach((key) => {
      if (
        params[key] === "All" ||
        params[key] === "" ||
        params[key] === undefined
      ) {
        delete params[key];
      }
    });

    setSearchParams(params);
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = () => {
    const params = buildParams();

    updateUrl();

    fetchProblems(params);
  };

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");
    setStatus("All");
    setPriority("All");
    setDepartment("All");
    setDistrict("All");

    setSearchParams({});
  };

  // ==========================================================
  // DISTRICTS
  // ==========================================================

  const districts = useMemo(() => {
    const values = problems
      .map((problem) => problem.district)
      .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ].sort();
  }, [problems]);

  // ==========================================================
  // ACTIVE FILTER COUNT
  // ==========================================================

  const activeFilterCount = [
    status !== "All",
    priority !== "All",
    department !== "All",
    district !== "All",
  ].filter(Boolean).length;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() =>
              navigate("/government/dashboard")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#2477B5]"
          >
            <ArrowLeft size={17} />

            Government Dashboard
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h1 className="text-2xl font-bold text-[#172B3A]">
                Complaints Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review and manage citizen grievances
                by government department.
              </p>

            </div>

            <button
              type="button"
              onClick={() => fetchProblems()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-[#2477B5] hover:text-[#2477B5]"
            >
              <RefreshCw size={16} />

              Refresh
            </button>

          </div>
        </div>

        {/* ==================================================
            SEARCH + FILTERS
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row">

            {/* SEARCH */}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-1 gap-2"
            >

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search complaints..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#2477B5] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#2477B5] px-5 text-sm font-semibold text-white transition hover:bg-[#1d6498]"
              >
                Search
              </button>

            </form>

            {/* COUNT */}

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <Filter size={17} />

              <span>
                {problems.length} complaints
              </span>

              {activeFilterCount > 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-[#2477B5]">
                  {activeFilterCount} filters
                </span>
              )}

            </div>

          </div>

          {/* ==================================================
              FILTER GRID
          ================================================== */}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {/* STATUS */}

            <select
              value={status}
              onChange={(e) => {
                const value = e.target.value;

                setStatus(value);

                updateUrl({
                  status:
                    value === "All"
                      ? undefined
                      : value,
                });
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#2477B5]"
            >

              {statuses.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  Status: {item}
                </option>
              ))}

            </select>

            {/* DEPARTMENT */}

            <select
              value={department}
              onChange={(e) => {
                const value = e.target.value;

                setDepartment(value);

                updateUrl({
                  department:
                    value === "All"
                      ? undefined
                      : value,
                });
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#2477B5]"
            >

              {departments.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  Department: {item}
                </option>
              ))}

            </select>

            {/* PRIORITY */}

            <select
              value={priority}
              onChange={(e) => {
                const value = e.target.value;

                setPriority(value);

                updateUrl({
                  priority:
                    value === "All"
                      ? undefined
                      : value,
                });
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#2477B5]"
            >

              {priorities.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  Priority: {item}
                </option>
              ))}

            </select>

            {/* DISTRICT */}

            <select
              value={district}
              onChange={(e) => {
                const value = e.target.value;

                setDistrict(value);

                updateUrl({
                  district:
                    value === "All"
                      ? undefined
                      : value,
                });
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#2477B5]"
            >

              {districts.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  District: {item}
                </option>
              ))}

            </select>

          </div>

          {/* CLEAR FILTERS */}

          {(activeFilterCount > 0 ||
            search) && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
            >
              <X size={14} />

              Clear all filters
            </button>
          )}

        </section>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-center gap-3">

              <AlertCircle
                size={20}
                className="text-red-600"
              />

              <div>

                <p className="font-semibold text-red-700">
                  Unable to load complaints
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (

          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">

            <div className="flex items-center gap-3 text-sm text-slate-500">

              <RefreshCw
                size={18}
                className="animate-spin"
              />

              Loading complaints...

            </div>

          </div>

        ) : problems.length === 0 ? (

          /* ==================================================
              EMPTY
          ================================================== */

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">

              <FileText size={26} />

            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#172B3A]">
              No complaints found
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-[#2477B5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d6498]"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* ==================================================
              COMPLAINT LIST
          ================================================== */

          <div className="space-y-4">

            {problems.map((problem) => {

              const StatusIcon =
                statusIcons[problem.status] ||
                AlertCircle;

              return (

                <button
                  key={problem._id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/government/problems/${problem._id}`
                    )
                  }
                  className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#2477B5] hover:shadow-md md:p-6"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                    {/* ==================================================
                        ICON
                    ================================================== */}

                    <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2477B5] sm:flex">

                      <FileText size={24} />

                    </div>

                    {/* ==================================================
                        CONTENT
                    ================================================== */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-base font-bold text-[#172B3A] group-hover:text-[#2477B5]">
                          {problem.title ||
                            "Untitled Complaint"}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                            statusStyles[
                              problem.status
                            ] ||
                            statusStyles.Pending
                          }`}
                        >

                          <StatusIcon size={11} />

                          {problem.status ||
                            "Pending"}

                        </span>

                      </div>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {problem.description ||
                          "No description provided."}
                      </p>

                      {/* ==================================================
                          META
                      ================================================== */}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">

                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={13} />

                          {problem.district ||
                            "Unknown District"}

                          {problem.block
                            ? ` • ${problem.block}`
                            : ""}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} />

                          {formatDate(
                            problem.createdAt
                          )}
                        </span>

                        {problem.reportedBy
                          ?.name && (
                          <span>
                            Citizen:{" "}
                            {
                              problem
                                .reportedBy
                                .name
                            }
                          </span>
                        )}

                      </div>

                      {/* ==================================================
                          DEPARTMENT
                      ================================================== */}

                      <div className="mt-4">

                        {problem.governmentDepartment ? (

                          <div className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">

                            <span className="text-[11px] font-medium text-slate-500">
                              Department:
                            </span>

                            <span className="text-xs font-semibold text-[#2477B5]">
                              {
                                problem.governmentDepartment
                              }
                            </span>

                          </div>

                        ) : (

                          <span className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-400">
                            Department not assigned
                          </span>

                        )}

                      </div>

                    </div>

                    {/* ==================================================
                        RIGHT SIDE
                    ================================================== */}

                    <div className="flex items-center justify-between gap-5 border-t border-slate-100 pt-4 lg:w-44 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">

                      <div className="text-left lg:text-right">

                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Priority
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            priorityStyles[
                              problem.priority
                            ] ||
                            priorityStyles.Medium
                          }`}
                        >
                          {problem.priority ||
                            "Medium"}
                        </span>

                      </div>

                      <ArrowRight
                        size={20}
                        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2477B5]"
                      />

                    </div>

                  </div>

                </button>

              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}