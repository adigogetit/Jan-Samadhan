import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until /api/auth/me finishes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FBF8]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#2E7D5B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-[#667A70] text-sm font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Logged in
  return <Outlet />;
}

export default ProtectedRoute;