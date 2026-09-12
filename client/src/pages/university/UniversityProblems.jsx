import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function UniversityProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm font-medium text-[#64748B]">
            University Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#172B3A]">
            Validated Problems
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review civic problems validated by the government.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading problems...
            </div>
          ) : problems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl">📋</div>

              <h2 className="mt-4 font-semibold text-[#172B3A]">
                No validated problems
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                There are currently no government-validated problems
                available for university review.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {problems.map((problem) => (
                <Link
                  key={problem._id}
                  to={`/university/problems/${problem._id}`}
                  className="block p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div className="min-w-0">
                      <h2 className="font-semibold text-[#172B3A]">
                        {problem.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {problem.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {problem.category}
                        </span>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          Validated
                        </span>

                        {problem.district && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                            {problem.district}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-[#1F6F8B]">
                      View Details →
                    </span>

                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default UniversityProblems;

