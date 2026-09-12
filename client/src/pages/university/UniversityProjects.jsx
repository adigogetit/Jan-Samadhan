import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function UniversityProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/university/projects"
      );

      if (response.data?.success) {
        setProjects(response.data.projects || []);
      } else {
        setProjects([]);
        setError(
          response.data?.message ||
            "Projects could not be loaded."
        );
      }
    } catch (err) {
      console.error(
        "University projects error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load university projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Planning":
        return "bg-slate-100 text-slate-700";

      case "Development":
        return "bg-blue-50 text-blue-700";

      case "Testing":
        return "bg-purple-50 text-purple-700";

      case "Pilot":
        return "bg-orange-50 text-orange-700";

      case "Deployment":
        return "bg-cyan-50 text-cyan-700";

      case "Completed":
        return "bg-green-50 text-green-700";

      case "Cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6 md:p-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-[#172B3A] md:text-3xl">
              University Projects
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage projects created from accepted civic
              problems.
            </p>
          </div>

          <Link
            to="/university/problems"
            className="inline-flex w-fit items-center rounded-xl bg-[#172B3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23445A]"
          >
            View Validated Problems
          </Link>

        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {!error && projects.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <span className="text-2xl">📁</span>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#172B3A]">
              No projects yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Accept a validated problem and convert it into
              a project to start working on civic solutions.
            </p>

            <Link
              to="/university/problems"
              className="mt-6 inline-flex rounded-xl bg-[#1F6F8B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#185a70]"
            >
              Explore Validated Problems
            </Link>

          </div>
        )}

        {/* =====================================================
            PROJECT GRID
        ====================================================== */}

        {projects.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {projects.map((project) => {

              const problem =
                project.problem || {};

              return (
                <Link
                  key={project._id}
                  to={`/university/projects/${project._id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                >

                  {/* Status */}

                  <div className="flex items-start justify-between gap-3">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        project.status
                      )}`}
                    >
                      {project.status || "Planning"}
                    </span>

                    <span className="text-xs text-slate-400">
                      {project.createdAt
                        ? new Date(
                            project.createdAt
                          ).toLocaleDateString()
                        : ""}
                    </span>

                  </div>

                  {/* Title */}

                  <h2 className="mt-5 line-clamp-2 text-lg font-bold text-[#172B3A] group-hover:text-[#1F6F8B]">
                    {project.title}
                  </h2>

                  {/* Description */}

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {project.description ||
                      "No project description available."}
                  </p>

                  {/* Original problem */}

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Source Problem
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-700">
                      {problem.title ||
                        "Problem information unavailable"}
                    </p>

                  </div>

                  {/* Meta */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div>
                      <p className="text-xs text-slate-400">
                        Category
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {project.category ||
                          problem.category ||
                          "Other"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        District
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {project.district ||
                          problem.district ||
                          "Not specified"}
                      </p>
                    </div>

                  </div>

                  {/* Faculty */}

                  <div className="mt-5 border-t border-slate-100 pt-4">

                    <p className="text-xs text-slate-400">
                      Faculty Lead
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {project.facultyLead?.name ||
                        "Not assigned"}
                    </p>

                  </div>

                  {/* Footer */}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                    <span className="text-xs text-slate-400">
                      {Array.isArray(project.students)
                        ? `${project.students.length} Student${
                            project.students.length === 1
                              ? ""
                              : "s"
                          }`
                        : "0 Students"}
                    </span>

                    <span className="text-sm font-semibold text-[#1F6F8B]">
                      View Project →
                    </span>

                  </div>

                </Link>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default UniversityProjects;