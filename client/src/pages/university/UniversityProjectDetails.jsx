import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const PROJECT_STATUSES = [
  "Planning",
  "Development",
  "Testing",
  "Pilot",
  "Deployment",
  "Completed",
  "Cancelled",
];

const PROGRESS_STATUSES = [
  "Planning",
  "Development",
  "Testing",
  "Pilot",
  "Deployment",
  "Completed",
];

const statusStyles = {
  Planning: "bg-slate-100 text-slate-700",
  Development: "bg-blue-100 text-blue-700",
  Testing: "bg-amber-100 text-amber-700",
  Pilot: "bg-purple-100 text-purple-700",
  Deployment: "bg-cyan-100 text-cyan-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
};

const formatDate = (date) => {
  if (!date) return "Not set";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not set";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getUserName = (user) => {
  if (!user) return "Not assigned";

  return (
    user.name ||
    user.fullName ||
    user.email ||
    "Unknown"
  );
};

export default function UniversityProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamMessage, setTeamMessage] = useState("");
  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [interestActionLoading, setInterestActionLoading] = useState(null);
  const [interestMessage, setInterestMessage] = useState("");
  const [interestError, setInterestError] = useState("");

  // ============================================================
  // FETCH PROJECT
  // ============================================================

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/university/projects/${id}`
      );

      const fetchedProject =
        response.data?.project || response.data;

      setProject(fetchedProject);
      setSelectedStatus(fetchedProject?.status || "");
    } catch (err) {
      console.error(
        "Failed to load project:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load project details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchInterests();
  }, [id]);

  const fetchInterests = async () => {
    try {
      setLoadingInterests(true);
      const response = await api.get(`/university/projects/${id}/interests`);
      if (response.data?.success) {
        setInterests(response.data.interests || []);
      }
    } catch (err) {
      console.error("Failed to load project interests:", err);
    } finally {
      setLoadingInterests(false);
    }
  };

  const handleAcceptInterest = async (interestId) => {
    try {
      setInterestActionLoading(interestId);
      setInterestError("");
      setInterestMessage("");

      const response = await api.patch(`/university/interests/${interestId}/accept`);
      if (response.data?.success) {
        setInterestMessage("Industry partnership accepted successfully!");
        if (response.data.project) {
          setProject(response.data.project);
        } else {
          await fetchProject();
        }
        await fetchInterests();
      } else {
        setInterestError(response.data?.message || "Failed to accept partnership.");
      }
    } catch (err) {
      console.error("Accept interest error:", err);
      setInterestError(
        err.response?.data?.message || "Unable to accept partnership request."
      );
    } finally {
      setInterestActionLoading(null);
    }
  };

  const handleRejectInterest = async (interestId) => {
    try {
      setInterestActionLoading(interestId);
      setInterestError("");
      setInterestMessage("");

      const response = await api.patch(`/university/interests/${interestId}/reject`);
      if (response.data?.success) {
        setInterestMessage("Partnership request rejected.");
        if (response.data.project) {
          setProject(response.data.project);
        } else {
          await fetchProject();
        }
        await fetchInterests();
      } else {
        setInterestError(response.data?.message || "Failed to reject partnership.");
      }
    } catch (err) {
      console.error("Reject interest error:", err);
      setInterestError(
        err.response?.data?.message || "Unable to reject partnership request."
      );
    } finally {
      setInterestActionLoading(null);
    }
  };

  // ============================================================
  // UPDATE PROJECT STATUS
  // ============================================================

  const handleStatusUpdate = async () => {
    if (!project?._id) {
      return;
    }

    if (!selectedStatus) {
      setStatusError(
        "Please select a project status."
      );
      return;
    }

    if (selectedStatus === project.status) {
      setStatusError(
        "Please select a different status."
      );
      return;
    }

    try {
      setUpdatingStatus(true);
      setStatusMessage("");
      setStatusError("");

      const response = await api.patch(
        `/university/projects/${project._id}/status`,
        {
          status: selectedStatus,
        }
      );

      const updatedProject =
        response.data?.project;

      if (updatedProject) {
        setProject(updatedProject);
        setSelectedStatus(
          updatedProject.status
        );
      } else {
        await fetchProject();
      }

      setStatusMessage(
        "Project status updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update project status:",
        err
      );

      setStatusError(
        err.response?.data?.message ||
        "Unable to update project status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateProjectFromResponse = async (response) => {
    const updatedProject = response.data?.project;
    if (updatedProject) setProject(updatedProject);
    else await fetchProject();
  };

  const openFacultyPicker = async () => {
    try {
      setTeamLoading(true); setTeamError(""); setTeamMessage("");
      const response = await api.get("/university/projects/faculty");
      setFaculty(response.data?.faculty || []);
      setSelectedFacultyId(project?.facultyLead?._id || "");
      setShowFacultyPicker(true);
    } catch (err) {
      setTeamError(err.response?.data?.message || "Unable to load eligible faculty.");
    } finally { setTeamLoading(false); }
  };

  const saveFaculty = async () => {
    if (!selectedFacultyId) { setTeamError("Please select a faculty lead."); return; }
    try {
      setTeamLoading(true); setTeamError("");
      const response = await api.patch(`/university/projects/${project._id}/faculty`, { facultyId: selectedFacultyId });
      await updateProjectFromResponse(response);
      setShowFacultyPicker(false); setTeamMessage("Faculty lead updated successfully.");
    } catch (err) { setTeamError(err.response?.data?.message || "Unable to update faculty lead."); }
    finally { setTeamLoading(false); }
  };

  const removeFaculty = async () => {
    try {
      setTeamLoading(true); setTeamError("");
      const response = await api.delete(`/university/projects/${project._id}/faculty`);
      await updateProjectFromResponse(response);
      setTeamMessage("Faculty lead removed successfully.");
    } catch (err) { setTeamError(err.response?.data?.message || "Unable to remove faculty lead."); }
    finally { setTeamLoading(false); }
  };

  const openStudentPicker = async () => {
    try {
      setTeamLoading(true); setTeamError(""); setTeamMessage("");
      const response = await api.get("/university/projects/students");
      const assignedIds = new Set((project.students || []).map((student) => student._id));
      setStudents((response.data?.students || []).filter((student) => !assignedIds.has(student._id)));
      setSelectedStudentIds([]); setShowStudentPicker(true);
    } catch (err) { setTeamError(err.response?.data?.message || "Unable to load eligible students."); }
    finally { setTeamLoading(false); }
  };

  const saveStudents = async () => {
    if (!selectedStudentIds.length) { setTeamError("Select at least one student."); return; }
    try {
      setTeamLoading(true); setTeamError("");
      const response = await api.patch(`/university/projects/${project._id}/students`, { studentIds: selectedStudentIds });
      await updateProjectFromResponse(response);
      setShowStudentPicker(false); setTeamMessage("Students assigned successfully.");
    } catch (err) { setTeamError(err.response?.data?.message || "Unable to assign students."); }
    finally { setTeamLoading(false); }
  };

  const removeStudent = async (studentId) => {
    try {
      setTeamLoading(true); setTeamError("");
      const response = await api.delete(`/university/projects/${project._id}/students/${studentId}`);
      await updateProjectFromResponse(response);
      setTeamMessage("Student removed successfully.");
    } catch (err) { setTeamError(err.response?.data?.message || "Unable to remove student."); }
    finally { setTeamLoading(false); }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1F6F8B] rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() =>
              navigate("/university/projects")
            }
            className="mb-6 text-[#1F6F8B] hover:underline"
          >
            ← Back to Projects
          </button>

          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <div className="text-4xl mb-3">
              ⚠️
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Project not found
            </h2>

            <p className="text-slate-500 mt-2">
              {error ||
                "The requested project could not be found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const problem = project.problem;

  const statusClass =
    statusStyles[project.status] ||
    "bg-slate-100 text-slate-700";

  const currentProgressIndex =
    PROGRESS_STATUSES.indexOf(
      project.status
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="bg-[#172B3A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() =>
              navigate("/university/projects")
            }
            className="text-slate-300 hover:text-white mb-5 text-sm"
          >
            ← Back to Projects
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                >
                  {project.status}
                </span>

                {project.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200">
                    {project.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold">
                {project.title}
              </h1>

              <p className="text-slate-300 mt-2 max-w-3xl">
                {project.description}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl px-5 py-4 min-w-[180px]">
              <p className="text-xs text-slate-300 uppercase tracking-wide">
                Project Status
              </p>

              <p className="text-xl font-bold mt-1">
                {project.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ====================================================
              LEFT COLUMN
          ==================================================== */}

          <div className="lg:col-span-2 space-y-6">

            {/* --------------------------------------------------
                CHANGE STATUS
            -------------------------------------------------- */}

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Manage Project Status
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Update the current stage of this university project.
                  </p>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold self-start ${statusStyles[
                    project.status
                  ] ||
                    "bg-slate-100 text-slate-700"
                    }`}
                >
                  Current: {project.status}
                </span>
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <select
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(
                      event.target.value
                    );
                    setStatusMessage("");
                    setStatusError("");
                  }}
                  disabled={updatingStatus}
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6F8B]/20 focus:border-[#1F6F8B] disabled:bg-slate-100"
                >
                  {PROJECT_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={
                    updatingStatus ||
                    selectedStatus ===
                    project.status
                  }
                  className="md:w-48 px-5 py-3 rounded-xl bg-[#1F6F8B] text-white font-semibold text-sm hover:bg-[#185d76] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus
                    ? "Updating..."
                    : "Update Status"}
                </button>
              </div>

              {/* Status messages */}

              {statusMessage && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-medium text-emerald-700">
                    ✓ {statusMessage}
                  </p>
                </div>
              )}

              {statusError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">
                    {statusError}
                  </p>
                </div>
              )}

              {/* Workflow information */}

              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Project Workflow
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {PROGRESS_STATUSES.map(
                    (status, index) => {
                      const isCurrent =
                        project.status ===
                        status;

                      const isCompleted =
                        currentProgressIndex >=
                        index;

                      return (
                        <React.Fragment
                          key={status}
                        >
                          <div
                            className={`px-3 py-2 rounded-lg text-xs font-semibold ${isCurrent
                              ? "bg-[#1F6F8B] text-white"
                              : isCompleted
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-400"
                              }`}
                          >
                            {isCompleted &&
                              !isCurrent
                              ? "✓ "
                              : ""}
                            {status}
                          </div>

                          {index <
                            PROGRESS_STATUSES.length -
                            1 && (
                              <span className="text-slate-300">
                                →
                              </span>
                            )}
                        </React.Fragment>
                      );
                    }
                  )}
                </div>

                {project.status ===
                  "Cancelled" && (
                    <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
                      <p className="text-sm text-red-700">
                        This project has been cancelled.
                      </p>
                    </div>
                  )}
              </div>

              {showFacultyPicker && <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-slate-800">Select Faculty Lead</h3>
                  <select value={selectedFacultyId} onChange={(event) => setSelectedFacultyId(event.target.value)} className="w-full mt-4 border border-slate-300 rounded-xl px-3 py-3">
                    <option value="">Choose eligible faculty</option>
                    {faculty.map((member) => <option key={member._id} value={member._id}>{member.name} — {member.email}{member.department ? ` (${member.department})` : ""}</option>)}
                  </select>
                  {!faculty.length && <p className="mt-3 text-sm text-slate-500">No eligible faculty members are available.</p>}
                  <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setShowFacultyPicker(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button type="button" onClick={saveFaculty} disabled={teamLoading || !selectedFacultyId} className="px-4 py-2 rounded-xl bg-[#1F6F8B] text-sm font-semibold text-white disabled:opacity-50">{teamLoading ? "Saving..." : "Save"}</button></div>
                </div>
              </div>}

              {showStudentPicker && <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-slate-800">Add Students</h3><p className="text-sm text-slate-500 mt-1">Choose one or more students to add to this project.</p>
                  <div className="mt-4 max-h-72 overflow-y-auto space-y-2">{students.map((student) => <label key={student._id} className="flex gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer"><input type="checkbox" checked={selectedStudentIds.includes(student._id)} onChange={() => setSelectedStudentIds((selected) => selected.includes(student._id) ? selected.filter((studentId) => studentId !== student._id) : [...selected, student._id])} /><span><span className="block font-medium text-slate-800">{student.name}</span><span className="block text-sm text-slate-500">{student.email}{student.department ? ` · ${student.department}` : ""}</span></span></label>)}</div>
                  {!students.length && <p className="mt-3 text-sm text-slate-500">All eligible students are already assigned, or none are available.</p>}
                  <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setShowStudentPicker(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button type="button" onClick={saveStudents} disabled={teamLoading || !selectedStudentIds.length} className="px-4 py-2 rounded-xl bg-[#1F6F8B] text-sm font-semibold text-white disabled:opacity-50">{teamLoading ? "Saving..." : "Add Selected"}</button></div>
                </div>
              </div>}
            </section>

            {/* --------------------------------------------------
                PROJECT OVERVIEW
            -------------------------------------------------- */}

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-5">
                Project Overview
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Objective
                  </h3>

                  <p className="text-slate-700 leading-7">
                    {project.objective ||
                      "No objective provided."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Proposed Solution
                  </h3>

                  <p className="text-slate-700 leading-7">
                    {project.proposedSolution ||
                      "No proposed solution provided."}
                  </p>
                </div>
              </div>
            </section>

            {/* --------------------------------------------------
                SOURCE PROBLEM
            -------------------------------------------------- */}

            {problem && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <h2 className="text-xl font-bold text-slate-800">
                    Source Problem
                  </h2>

                  {problem._id && (
                    <Link
                      to={`/university/problems/${problem._id}`}
                      className="text-sm font-semibold text-[#1F6F8B] hover:underline"
                    >
                      View Problem →
                    </Link>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-800 text-lg">
                    {problem.title}
                  </h3>

                  <p className="text-slate-600 mt-2 leading-6">
                    {problem.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                    <div>
                      <p className="text-xs text-slate-500">
                        Category
                      </p>

                      <p className="font-medium text-slate-800 mt-1">
                        {problem.category ||
                          project.category ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        District
                      </p>

                      <p className="font-medium text-slate-800 mt-1">
                        {problem.district ||
                          project.district ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Status
                      </p>

                      <p className="font-medium text-slate-800 mt-1">
                        {problem.status ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* --------------------------------------------------
                PROJECT TEAM
            -------------------------------------------------- */}

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-5">
                Project Team
              </h2>

              {teamMessage && <p className="mb-4 text-sm text-emerald-700">{teamMessage}</p>}
              {teamError && <p className="mb-4 text-sm text-red-700">{teamError}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Faculty */}

                <div className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1F6F8B]/10 flex items-center justify-center text-[#1F6F8B]">
                      🎓
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Faculty Lead
                      </p>

                      <p className="font-semibold text-slate-800">
                        {getUserName(
                          project.facultyLead
                        )}
                      </p>

                      {project.facultyLead && <>
                        <p className="text-sm text-slate-600 mt-1">{project.facultyLead.email}</p>
                        <p className="text-xs text-slate-500">{project.facultyLead.department || "Department not set"}</p>
                      </>}

                      <div className="flex gap-3 mt-3">
                        <button type="button" onClick={openFacultyPicker} disabled={teamLoading} className="text-sm font-semibold text-[#1F6F8B] hover:underline disabled:opacity-50">{project.facultyLead ? "Change Faculty" : "Assign Faculty"}</button>
                        {project.facultyLead && <button type="button" onClick={removeFaculty} disabled={teamLoading} className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50">Remove</button>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Students */}

                <div className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      👥
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Students
                      </p>

                      <p className="font-semibold text-slate-800">
                        {project.students?.length ||
                          0}{" "}
                        students
                      </p>

                      <button type="button" onClick={openStudentPicker} disabled={teamLoading} className="text-sm font-semibold text-[#1F6F8B] hover:underline mt-3 disabled:opacity-50">Add Students</button>
                    </div>
                  </div>

                  {project.students?.length ? <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">{project.students.map((student) => <div key={student._id} className="flex justify-between gap-3"><div><p className="text-sm font-medium text-slate-800">{getUserName(student)}</p><p className="text-xs text-slate-600">{student.email}</p><p className="text-xs text-slate-500">{student.department || "Department not set"}</p></div><button type="button" onClick={() => removeStudent(student._id)} disabled={teamLoading} className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">Remove</button></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No students assigned yet.</p>}
                </div>

                {/* Industry */}

                <div className="border border-slate-200 rounded-xl p-5 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                      🏢
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Industry Partner
                      </p>

                      <p className="font-semibold text-slate-800">
                        {getUserName(
                          project.industryPartner
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* --------------------------------------------------
                INDUSTRY / INVESTOR INTERESTS (Requirement 9)
            -------------------------------------------------- */}

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Industry / Investor Interests
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    External industry partnership requests, mentorship, and support proposals for this project.
                  </p>
                </div>

                {project.industryPartner && (
                  <span className="self-start sm:self-auto rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-xs font-semibold">
                    Partner Assigned
                  </span>
                )}
              </div>

              {interestMessage && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                  {interestMessage}
                </div>
              )}

              {interestError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
                  {interestError}
                </div>
              )}

              {/* Current Partner Card if Assigned */}
              {project.industryPartner ? (
                <div className="mb-6 rounded-2xl bg-purple-50/70 border border-purple-200 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
                    Official Industry Partner
                  </p>
                  <p className="text-base font-bold text-slate-800">
                    {getUserName(project.industryPartner)}
                  </p>
                  {project.industryPartner?.email && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      {project.industryPartner.email}
                    </p>
                  )}
                  {project.industryPartner?.department && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {project.industryPartner.department}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-6 rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-500">
                  No official industry partner has been assigned yet. Review incoming proposals below to collaborate.
                </div>
              )}

              {/* Incoming Interest Proposals */}
              <h3 className="text-sm font-bold text-slate-800 mb-3">
                Incoming Partnership Requests ({interests.length})
              </h3>

              {loadingInterests ? (
                <p className="text-xs text-slate-500 py-3">Loading partnership requests...</p>
              ) : interests.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center border rounded-xl border-dashed border-slate-200">
                  No external industry or investor interest requests submitted yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {interests.map((item) => {
                    const isActing = interestActionLoading === item._id;
                    const investor = item.investor || {};

                    return (
                      <div
                        key={item._id}
                        className="rounded-xl border border-slate-200 p-4 text-xs transition hover:border-slate-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-800 text-sm">
                                {item.organizationName || investor.name || "Industry Representative"}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${item.status === "Accepted"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : item.status === "Pending"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : item.status === "Rejected"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                              >
                                {item.status}
                              </span>
                              <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 text-[10px] font-medium">
                                {item.supportType}
                              </span>
                            </div>

                            {investor.email && (
                              <p className="text-slate-500 text-[11px]">{investor.email}</p>
                            )}
                          </div>

                          {/* Accept and Reject Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {item.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={() => handleAcceptInterest(item._id)}
                                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
                                >
                                  {isActing ? "Accepting..." : "Accept"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={() => handleRejectInterest(item._id)}
                                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
                                >
                                  {isActing ? "Rejecting..." : "Reject"}
                                </button>
                              </>
                            )}

                            {item.status === "Accepted" && (
                              <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                                ✓ Accepted Partner
                              </span>
                            )}

                            {item.status === "Rejected" && (
                              <span className="text-red-600 font-semibold text-xs">
                                Rejected
                              </span>
                            )}

                            {item.status === "Withdrawn" && (
                              <span className="text-slate-400 font-semibold text-xs">
                                Withdrawn by Investor
                              </span>
                            )}
                          </div>
                        </div>

                        {item.message && (
                          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-slate-700 border border-slate-100">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">
                              Message:
                            </p>
                            <p className="whitespace-pre-line leading-relaxed">{item.message}</p>
                          </div>
                        )}

                        <div className="mt-2 text-[10px] text-slate-400">
                          Submitted on {formatDate(item.createdAt)}
                          {item.respondedAt && ` · Responded on ${formatDate(item.respondedAt)}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* --------------------------------------------------
                ACTIVITY TIMELINE
            -------------------------------------------------- */}

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Project Timeline
              </h2>

              {project.activityTimeline?.length ? (
                <div className="space-y-5">
                  {[...project.activityTimeline]
                    .reverse()
                    .map(
                      (
                        activity,
                        index,
                        activities
                      ) => (
                        <div
                          key={
                            activity._id ||
                            index
                          }
                          className="flex gap-4"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-[#1F6F8B] mt-1.5" />

                            {index !==
                              activities.length -
                              1 && (
                                <div className="w-px flex-1 bg-slate-200 mt-2" />
                              )}
                          </div>

                          <div className="pb-3">
                            <p className="font-semibold text-slate-800">
                              {activity.action ||
                                activity.status ||
                                "Project update"}
                            </p>

                            {activity.description && (
                              <p className="text-slate-600 mt-1">
                                {
                                  activity.description
                                }
                              </p>
                            )}

                            {activity.note && (
                              <p className="text-slate-600 mt-1">
                                {activity.note}
                              </p>
                            )}

                            <p className="text-xs text-slate-400 mt-2">
                              {formatDate(
                                activity.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No project activity recorded yet.
                </div>
              )}
            </section>
          </div>

          {/* ====================================================
              RIGHT COLUMN
          ==================================================== */}

          <aside className="space-y-6">

            {/* --------------------------------------------------
                PROJECT INFORMATION
            -------------------------------------------------- */}

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">
                Project Information
              </h2>

              <div className="space-y-5">

                <div>
                  <p className="text-xs text-slate-500">
                    Category
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {project.category ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    District
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {project.district ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Start Date
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {formatDate(
                      project.startDate
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Expected Completion
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {formatDate(
                      project.expectedCompletionDate
                    )}
                  </p>
                </div>

                {project.completedAt && (
                  <div>
                    <p className="text-xs text-slate-500">
                      Completed On
                    </p>

                    <p className="font-medium text-emerald-700 mt-1">
                      {formatDate(
                        project.completedAt
                      )}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* --------------------------------------------------
                STATUS PROGRESS
            -------------------------------------------------- */}

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">
                Project Progress
              </h2>

              <div className="space-y-3">
                {PROGRESS_STATUSES.map(
                  (step, index) => {
                    const completed =
                      project.status !==
                      "Cancelled" &&
                      index <=
                      currentProgressIndex;

                    const current =
                      project.status ===
                      step;

                    return (
                      <div
                        key={step}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${current
                            ? "bg-[#1F6F8B] text-white"
                            : completed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                            }`}
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        <span
                          className={`text-sm ${current
                            ? "font-bold text-[#1F6F8B]"
                            : completed
                              ? "font-semibold text-slate-800"
                              : "text-slate-400"
                            }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              {project.status ===
                "Cancelled" && (
                  <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm font-semibold text-red-700">
                      Project Cancelled
                    </p>

                    <p className="text-xs text-red-600 mt-1">
                      This project is no longer active.
                    </p>
                  </div>
                )}
            </section>

            {/* --------------------------------------------------
                QUICK ACTIONS
            -------------------------------------------------- */}

            <section className="bg-[#172B3A] rounded-2xl p-6 text-white">
              <h2 className="text-lg font-bold">
                University Actions
              </h2>

              <p className="text-sm text-slate-300 mt-2">
                Manage this project and continue building the solution.
              </p>

              <Link
                to="/university/projects"
                className="block text-center mt-5 bg-white text-[#172B3A] font-semibold rounded-xl px-4 py-3 hover:bg-slate-100 transition"
              >
                View All Projects
              </Link>

              {problem?._id && (
                <Link
                  to={`/university/problems/${problem._id}`}
                  className="block text-center mt-3 border border-white/20 text-white font-semibold rounded-xl px-4 py-3 hover:bg-white/10 transition"
                >
                  View Source Problem
                </Link>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
