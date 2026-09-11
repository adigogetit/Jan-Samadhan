import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#2477B5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-[#64748B]">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (!allowedRoles.includes(user.role)) {
    const dashboardRoutes = {
      citizen: "/citizen/dashboard",
      government: "/government/dashboard",
      university: "/university/dashboard",
      student: "/student/dashboard",
      investor: "/investor/dashboard",
      admin: "/admin/dashboard",
    };

    return (
      <Navigate
        to={dashboardRoutes[user.role] || "/login"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default RoleRoute;