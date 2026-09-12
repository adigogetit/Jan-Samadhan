import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Layers,
  RefreshCw,
  Server,
  Sliders,
  Target,
} from "lucide-react";
import api from "../../services/api";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    try {
      setRefreshing(true);

      const [statsRes, healthRes] = await Promise.allSettled([
        api.get("/ai/stats"),
        api.get("/ai/health"),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data?.success) {
        setStats(statsRes.value.data);
      }

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value.data?.aiService || null);
      }
    } catch (err) {
      console.error("Admin dashboard load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const isOnline = health?.isOnline ?? false;
  const metrics = stats?.metrics || {
    totalProblems: 0,
    analyzedProblems: 0,
    pendingProblems: 0,
    failedProblems: 0,
    problemsWithUniversityRecommendations: 0,
    coveragePercentage: 0,
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F7FBF8] p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <PageHeader
            eyebrow="System Administration"
            title="Platform & AI Operations"
            description="Live monitoring of the JAN-SAMADHAN AI Pipeline & University Matching Subsystems."
          />
          <LoadingState count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7FBF8] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <PageHeader
          eyebrow="System Administration"
          title="Platform & AI Operations"
          description="Live monitoring of the JAN-SAMADHAN AI Pipeline & University Matching Subsystems."
        >
          <button
            type="button"
            onClick={loadMonitoringData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DDEDE4] bg-white px-4 py-2.5 text-xs font-bold text-[#18352A] shadow-sm transition hover:border-[#2E7D5B] hover:bg-[#EAF7F0] hover:text-[#2E7D5B] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#2E7D5B]" : ""}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh Status"}</span>
          </button>
        </PageHeader>

        {/* AI SERVICE HEALTH CARD */}
        <div className="rounded-[24px] border border-[#DDEDE4] bg-white p-6 md:p-7 shadow-[0_4px_24px_rgba(24,53,42,0.04)]">
          <div className="flex flex-col gap-4 border-b border-[#DDEDE4]/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isOnline
                    ? "bg-[#EAF7F0] text-[#2E7D5B]"
                    : "bg-[#FFF0F0] text-[#B42318]"
                  }`}
              >
                {isOnline ? (
                  <Cpu className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-bold text-[#18352A]">
                    Python AI Matching & Analyzer Service
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${isOnline
                        ? "border border-[#CFE7D8] bg-[#EAF7F0] text-[#2E7D5B]"
                        : "border border-[#FECDCA] bg-[#FFF0F0] text-[#B42318]"
                      }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${isOnline ? "animate-pulse bg-[#2E7D5B]" : "bg-[#D92D20]"
                        }`}
                    />
                    {isOnline ? "OPERATIONAL" : "OFFLINE / UNREACHABLE"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#667A70]">
                  {isOnline
                    ? "Service is healthy and responding on localhost:8000."
                    : "Python service is not reachable on port 8000. Start with: python university_matching/api_server.py"}
                </p>
              </div>
            </div>

            {health?.details && (
              <div className="self-start rounded-xl border border-[#DDEDE4] bg-[#F7FBF8] px-3.5 py-2 text-xs text-[#5C7067] sm:self-auto">
                <span className="font-bold text-[#18352A]">Dataset: </span>
                {health.details.dataset || "25 Universities"}
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#DDEDE4] bg-[#F7FBF8] p-4 transition hover:border-[#CFE7D8]">
              <div className="flex items-center gap-2 text-[#2E7D5B]">
                <Activity className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#789087]">
                  API Protocol
                </p>
              </div>
              <p className="mt-2 text-sm font-bold text-[#18352A]">
                REST / JSON Pipeline
              </p>
              <p className="mt-1 text-[11px] text-[#667A70]">
                POST /pipeline, POST /classify
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDEDE4] bg-[#F7FBF8] p-4 transition hover:border-[#CFE7D8]">
              <div className="flex items-center gap-2 text-[#2E7D5B]">
                <Layers className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#789087]">
                  Taxonomy Domains
                </p>
              </div>
              <p className="mt-2 text-sm font-bold text-[#18352A]">
                10 Core Sectors
              </p>
              <p className="mt-1 text-[11px] text-[#667A70]">
                Agriculture, Water, Mining, Health, etc.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDEDE4] bg-[#F7FBF8] p-4 transition hover:border-[#CFE7D8]">
              <div className="flex items-center gap-2 text-[#2E7D5B]">
                <Sliders className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#789087]">
                  Priority Engine
                </p>
              </div>
              <p className="mt-2 text-sm font-bold text-[#18352A]">
                Deterministic (0–100)
              </p>
              <p className="mt-1 text-[11px] text-[#667A70]">
                Severity, Urgency, Pop, Geo, Recurrence
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDEDE4] bg-[#F7FBF8] p-4 transition hover:border-[#CFE7D8]">
              <div className="flex items-center gap-2 text-[#2E7D5B]">
                <Database className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#789087]">
                  HEI Database
                </p>
              </div>
              <p className="mt-2 text-sm font-bold text-[#18352A]">
                25 Higher Ed Institutions
              </p>
              <p className="mt-1 text-[11px] text-[#667A70]">
                15 Jharkhand + 10 National HEIs
              </p>
            </div>
          </div>
        </div>

        {/* METRICS SECTION */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-black tracking-tight text-[#18352A]">
              AI Analysis & University Recommendation Metrics
            </h2>
            <p className="mt-0.5 text-xs text-[#667A70]">
              Real-time counts aggregated across all citizen grievances in the database.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Completed AI Analyses"
              value={metrics.analyzedProblems}
              color="green"
            />
            <StatCard
              icon={<Target className="h-5 w-5" />}
              label="HEI Matches Generated"
              value={metrics.problemsWithUniversityRecommendations}
              color="green"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Queued for Analysis"
              value={metrics.pendingProblems}
              color="orange"
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5" />}
              label="Failed Analyses"
              value={metrics.failedProblems}
              color="red"
            />
          </div>
        </div>

        {/* COVERAGE PROGRESS */}
        <div className="rounded-[24px] border border-[#DDEDE4] bg-white p-6 md:p-7 shadow-[0_4px_24px_rgba(24,53,42,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-[#18352A]">
                Overall AI Coverage
              </p>
              <p className="mt-0.5 text-xs text-[#667A70]">
                Percentage of registered citizen grievances analyzed by the AI engine.
              </p>
            </div>
            <span className="text-2xl font-black text-[#2E7D5B]">
              {metrics.coveragePercentage}%
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-[#EAF7F0]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2E7D5B] to-[#3BA879] transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, metrics.coveragePercentage))}%`,
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[#789087]">
            <span>
              {metrics.analyzedProblems} analyzed of {metrics.totalProblems} total grievances
            </span>
            <span>
              {metrics.totalProblems - metrics.analyzedProblems} remaining
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
