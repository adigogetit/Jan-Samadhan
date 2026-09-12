import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import LandingPage from "../pages/public/LandingPage.jsx";
import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup.jsx";

import CitizenDashboard from "../pages/citizen/CitizenDashboard.jsx";
import SubmitProblem from "../pages/citizen/SubmitProblem.jsx";
import CitizenProblems from "../pages/citizen/CitizenProblems.jsx";
import ProblemDetails from "../pages/citizen/ProblemDetails.jsx";

import GovernmentDashboard from "../pages/government/GovernmentDashboard.jsx";
import GovernmentProblems from "../pages/government/GovernmentProblems.jsx";
import GovernmentProblemDetails from "../pages/government/GovernmentProblemDetails.jsx";

import UniversityDashboard from "../pages/university/UniversityDashboard.jsx";
import UniversityProblems from "../pages/university/UniversityProblems.jsx";
import UniversityProblemDetails from "../pages/university/UniversityProblemDetails.jsx";
import UniversityProjects from "../pages/university/UniversityProjects.jsx";
import UniversityProjectDetails from "../pages/university/UniversityProjectDetails.jsx";

import StudentDashboard from "../pages/student/StudentDashboard.jsx";
import StudentProjects from "../pages/student/StudentProjects.jsx";
import StudentProjectDetails from "../pages/student/StudentProjectDetails.jsx";
import InvestorDashboard from "../pages/investor/InvestorDashboard.jsx";
import InvestorProjects from "../pages/investor/InvestorProjects.jsx";
import InvestorProjectDetails from "../pages/investor/InvestorProjectDetails.jsx";
import InvestorInterests from "../pages/investor/InvestorInterests.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-[#172B3A]">
          {title}
        </h1>

        <p className="mt-2 text-[#64748B]">
          This page is protected and ready for the full module.
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />


        {/* ================= ALL AUTHENTICATED ROUTES ================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* ================= CITIZEN ================= */}

            <Route element={<RoleRoute allowedRoles={["citizen"]} />}>
              <Route
                path="/citizen/dashboard"
                element={<CitizenDashboard />}
              />

              <Route
                path="/citizen/problems"
                element={<CitizenProblems />}
              />

              <Route
                path="/citizen/problems/:id"
                element={<ProblemDetails />}
              />

              <Route
                path="/citizen/submit-problem"
                element={<SubmitProblem />}
              />
            </Route>


            {/* ================= GOVERNMENT ================= */}

            <Route element={<RoleRoute allowedRoles={["government"]} />}>
              <Route
                path="/government/dashboard"
                element={<GovernmentDashboard />}
              />

              <Route
                path="/government/problems"
                element={<GovernmentProblems />}
              />

              <Route
                path="/government/problems/:id"
                element={<GovernmentProblemDetails />}
              />

              <Route
                path="/government/projects"
                element={
                  <PlaceholderPage title="Government Projects" />
                }
              />
            </Route>


            {/* ================= UNIVERSITY ================= */}

            <Route element={<RoleRoute allowedRoles={["university"]} />}>

              <Route
                path="/university/dashboard"
                element={<UniversityDashboard />}
              />

              <Route
                path="/university/problems"
                element={<UniversityProblems />}
              />

              <Route
                path="/university/problems/:id"
                element={<UniversityProblemDetails />}
              />

              <Route
                path="/university/projects"
                element={<UniversityProjects />}
              />
              <Route
                path="/university/projects/:id"
                element={<UniversityProjectDetails />}
              />

            </Route>


            {/* ================= STUDENT ================= */}

            <Route element={<RoleRoute allowedRoles={["student"]} />}>
              <Route
                path="/student/dashboard"
                element={<StudentDashboard />}
              />

              <Route
                path="/student/projects"
                element={<StudentProjects />}
              />

              <Route
                path="/student/projects/:id"
                element={<StudentProjectDetails />}
              />
            </Route>


            {/* ================= INVESTOR ================= */}

            <Route element={<RoleRoute allowedRoles={["investor"]} />}>
              <Route
                path="/investor/dashboard"
                element={<InvestorDashboard />}
              />

              <Route
                path="/investor/projects"
                element={<InvestorProjects />}
              />

              <Route
                path="/investor/projects/:id"
                element={<InvestorProjectDetails />}
              />

              <Route
                path="/investor/interests"
                element={<InvestorInterests />}
              />
            </Route>


            {/* ================= ADMIN ================= */}

            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/users"
                element={
                  <PlaceholderPage title="User Management" />
                }
              />

              <Route
                path="/admin/system"
                element={
                  <PlaceholderPage title="System Management" />
                }
              />
            </Route>

          </Route>
        </Route>


        {/* ================= FALLBACK ================= */}

        <Route path="*" element={<LandingPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
