import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar/Navbar.jsx";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;