import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const StatCard = ({ title, value, subtitle }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <p className="mt-2 text-3xl font-bold text-[#172B3A]">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
  </div>
);

function UniversityDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    validatedProblems: 0,
    acceptedProblems: 0,
    projects: 0,
    activeProjects: 0,
  });

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUniversityData();
  }, []);

  const loadUniversityData = async () => {
    try {
      setLoading(true);

      const response = await api.get("/university/dashboard");

      if (response.data?.success) {
        setStats(response.data.stats || stats);
        setProblems(response.data.problems || []);
      }
    } catch (error) {
      console.error("University dashboard error:", error);

      // Keep dashboard usable even before backend endpoint is added.
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#64748B]">
            University Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#172B3A] md:text-3xl">
            Welcome, {user?.name || "University"}
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Discover validated civic problems and turn them into
            innovation projects.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Validated Problems"
            value={stats.validatedProblems}
            subtitle="Available for university action"
          />

          <StatCard
            title="Accepted Problems"
            value={stats.acceptedProblems}
            subtitle="Problems accepted by university"
          />

          <StatCard
            title="Projects"
            value={stats.projects}
            subtitle="University innovation projects"
          />

          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            subtitle="Currently in progress"
          />
        </div>

        {/* Main section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Validated problems */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-semibold text-[#172B3A]">
                  Validated Problems
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Problems approved by government and ready for university
                  evaluation.
                </p>
              </div>

              <Link
                to="/university/problems"
                className="text-sm font-semibold text-[#1F6F8B] hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading problems...
                </div>
              ) : problems.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                    📋
                  </div>

                  <h3 className="mt-4 font-semibold text-[#172B3A]">
                    No validated problems yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Government-validated civic problems will appear here
                    when they become available.
                  </p>
                </div>
              ) : (
                problems.slice(0, 5).map((problem) => (
                  <Link
                    key={problem._id}
                    to={`/university/problems/${problem._id}`}
                    className="block p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row">
                      <div>
                        <h3 className="font-semibold text-[#172B3A]">
                          {problem.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {problem.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {problem.category || "Other"}
                          </span>

                          {problem.district && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                              {problem.district}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="self-start text-sm font-medium text-[#1F6F8B]">
                        Review →
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#172B3A]">
              Quick Actions
            </h2>

            <div className="mt-4 space-y-3">

              <Link
                to="/university/problems"
                className="block rounded-xl border border-slate-200 p-4 transition hover:border-[#1F6F8B] hover:bg-slate-50"
              >
                <p className="font-semibold text-[#172B3A]">
                  Browse Problems
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Explore government-validated civic problems.
                </p>
              </Link>

              <Link
                to="/university/projects"
                className="block rounded-xl border border-slate-200 p-4 transition hover:border-[#1F6F8B] hover:bg-slate-50"
              >
                <p className="font-semibold text-[#172B3A]">
                  My Projects
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Manage projects created by your university.
                </p>
              </Link>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UniversityDashboard;
