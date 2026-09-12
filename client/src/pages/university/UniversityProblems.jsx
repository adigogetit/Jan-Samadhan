import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  FileText,
} from "lucide-react";
import api from "../../services/api";

import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";

const CATEGORIES = [
  "All",
  "Agriculture",
  "Water & Sanitation",
  "Roads & Transport",
  "Healthcare",
  "Education",
  "Electricity",
  "Environment",
  "Waste Management",
  "Public Safety",
  "Other",
];

const PRIORITIES = ["All", "Critical", "High", "Medium", "Low"];

export default function UniversityProblems() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRecommended = searchParams.get("recommended") === "true";

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(
    initialRecommended ? "recommended" : "all"
  );
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [district, setDistrict] = useState("All");
  const [minScore, setMinScore] = useState("all");
  const [sortBy, setSortBy] = useState(
    initialRecommended ? "matchScore" : "newest"
  );

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/university/problems");
      if (response.data?.success) {
        setProblems(response.data.problems || []);
      }
    } catch (error) {
      console.error("Failed to load university problems:", error);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const districts = useMemo(() => {
    const set = new Set();
    problems.forEach((p) => {
      if (p.district) set.add(p.district);
    });
    return ["All", ...Array.from(set).sort()];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems
      .filter((p) => {
        const hasMatch = p.aiMatch && p.aiMatch.matchScore > 0;
        if (activeTab === "recommended" && !hasMatch) return false;
        if (activeTab === "other" && hasMatch) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesTitle = (p.title || "").toLowerCase().includes(q);
          const matchesDesc = (p.description || "").toLowerCase().includes(q);
          const matchesDist = (p.district || "").toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesDist) return false;
        }

        if (category !== "All" && p.category !== category) return false;
        if (priority !== "All" && p.priority !== priority) return false;
        if (district !== "All" && p.district !== district) return false;

        if (minScore !== "all") {
          const score = p.aiMatch?.matchScore || 0;
          if (score < parseFloat(minScore)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "matchScore") {
          const scoreA = a.aiMatch?.matchScore || 0;
          const scoreB = b.aiMatch?.matchScore || 0;
          return scoreB - scoreA;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [problems, activeTab, search, category, priority, district, minScore, sortBy]);

  const recommendedCount = problems.filter(
    (p) => p.aiMatch && p.aiMatch.matchScore > 0
  ).length;

  return (
    <div className="min-h-full bg-[#F7FBF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <PageHeader
          eyebrow="Institutional Intelligence"
          title="Validated Civic Problems"
          description="Browse and accept verified civic challenges in Jharkhand. Develop prototypes, run pilots, and engage student researchers."
          backPath="/university/dashboard"
          backLabel="Back to Dashboard"
        >
          <button
            type="button"
            onClick={loadProblems}
            className="flex items-center gap-2 rounded-xl border border-[#DDEDE4] bg-white px-3.5 py-2.5 text-xs font-bold text-[#5D7469] transition hover:bg-[#F2F8F4] hover:text-[#2E7D5B]"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </PageHeader>

        {/* TABS & FILTERS CARD */}
        <div className="mb-8 rounded-[26px] border border-[#DDEDE4] bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#EDF4F0] pb-4 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${activeTab === "all"
                  ? "bg-[#2E7D5B] text-white shadow-sm"
                  : "bg-[#F7FBF8] text-[#5D7469] hover:bg-[#EAF7F0] hover:text-[#2E7D5B]"
                }`}
            >
              All Validated ({problems.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("recommended")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${activeTab === "recommended"
                  ? "bg-[#2E7D5B] text-white shadow-sm"
                  : "bg-[#EAF7F0] text-[#246748] hover:bg-[#DDF1E5]"
                }`}
            >
              <Sparkles size={14} />
              AI Recommended ({recommendedCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("other")}
              className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${activeTab === "other"
                  ? "bg-[#2E7D5B] text-white shadow-sm"
                  : "bg-[#F7FBF8] text-[#5D7469] hover:bg-[#EAF7F0] hover:text-[#2E7D5B]"
                }`}
            >
              Other Validated ({problems.length - recommendedCount})
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#789087]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems by title, description or location..."
                className="h-11 w-full rounded-xl border border-[#D7E8DE] bg-[#F7FBF8] pl-10 pr-4 text-xs font-medium text-[#18352A] outline-none transition placeholder:text-[#A0B0A8] focus:border-[#2E7D5B] focus:bg-white focus:ring-4 focus:ring-[#EAF7F0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1">
                  Min Match Score
                </label>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
                >
                  <option value="all">Any Score</option>
                  <option value="70">70+ (High Fit)</option>
                  <option value="80">80+ (Strong Alignment)</option>
                  <option value="90">90+ (Prime Match)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#D7E8DE] bg-[#FAFDFB] px-3 text-xs font-semibold text-[#18352A] outline-none transition focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0]"
                >
                  <option value="newest">Newest First</option>
                  <option value="matchScore">Highest Match Score</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-xs font-bold text-[#789087]">
            Showing <strong className="text-[#18352A]">{filteredProblems.length}</strong> problems
          </p>
        </div>

        {/* PROBLEMS GRID */}
        {loading ? (
          <LoadingState cards={4} />
        ) : filteredProblems.length === 0 ? (
          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-10">
            <EmptyState
              icon={<Target size={32} />}
              title="No problems match your filters"
              description="Try adjusting your search criteria, clearing the minimum score filter, or viewing 'All Validated' problems."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearch("");
                setCategory("All");
                setPriority("All");
                setDistrict("All");
                setMinScore("all");
                setActiveTab("all");
              }}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map((problem) => {
              const match = problem.aiMatch;

              return (
                <div
                  key={problem._id}
                  className="group flex flex-col justify-between rounded-[24px] border border-[#DDEDE4] bg-white p-5 shadow-[0_4px_18px_rgba(24,53,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,53,42,0.08)]"
                >
                  <div>
                    {/* Header Chips */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-[#F0F9F3] px-2.5 py-1 text-[11px] font-bold text-[#246748]">
                        {problem.category || "General"}
                      </span>

                      {match && match.matchScore > 0 ? (
                        <span className="rounded-full bg-[#EAF7F0] border border-[#CBE8D7] px-2.5 py-0.5 text-xs font-black text-[#2E7D5B]">
                          ★ {Math.round(match.matchScore)}/100
                        </span>
                      ) : (
                        <StatusBadge
                          status={problem.priority || "Medium"}
                          variant="priority"
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 text-base font-extrabold text-[#18352A] transition group-hover:text-[#2E7D5B] line-clamp-1">
                      {problem.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-1.5 text-xs leading-5 text-[#667A70] line-clamp-2">
                      {problem.description}
                    </p>

                    {/* AI Match Reasons */}
                    {match && match.reasons && match.reasons.length > 0 && (
                      <div className="mt-3 rounded-xl border border-[#EDF4F0] bg-[#FAFDFB] p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D5B] mb-1">
                          Institutional Match Factors
                        </p>
                        <ul className="space-y-0.5">
                          {match.reasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="text-[11px] font-medium text-[#4D6459] truncate">
                              ✓ {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 border-t border-[#EDF4F0] pt-3">
                    <div className="flex items-center justify-between text-[11px] text-[#789087]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#2E7D5B]" />
                        {problem.district || "Jharkhand"}
                      </span>

                      <StatusBadge
                        status={problem.status || "Validated"}
                        size="sm"
                      />
                    </div>

                    <Link
                      to={`/university/problems/${problem._id}`}
                      className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7D5B] py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#246748]"
                    >
                      <span>View & Accept Problem</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
