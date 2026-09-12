/**
 * Navbar — Now serves as the top Header bar.
 * Navigation links moved to Sidebar.
 * This component provides: hamburger menu, page title, notifications, and profile dropdown.
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Search,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

/* ─── role labels + dashboard paths ─── */
const roleConfig = {
  citizen: { label: "Citizen", dashboard: "/citizen/dashboard" },
  government: { label: "Government", dashboard: "/government/dashboard" },
  university: { label: "University", dashboard: "/university/dashboard" },
  student: { label: "Student", dashboard: "/student/dashboard" },
  investor: { label: "Investor", dashboard: "/investor/dashboard" },
  admin: { label: "Admin", dashboard: "/admin/dashboard" },
};

/* ─── derive page title from path ─── */
function getPageTitle(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";

  const last = segments[segments.length - 1];
  if (last === "dashboard") return "Dashboard";
  if (last === "submit-problem") return "Report Problem";
  if (last === "interests") return "My Interests";

  // If it's an ID segment (e.g. /problems/123), use the second-to-last
  if (segments.length >= 2 && /^[a-f0-9]{24}$/i.test(last)) {
    const parent = segments[segments.length - 2];
    return parent.charAt(0).toUpperCase() + parent.slice(1) + " Details";
  }

  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);

  const config = roleConfig[user?.role] || {
    label: "User",
    dashboard: "/",
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const handleNavigation = (path) => {
    setProfileOpen(false);
    navigate(path);
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#DDEDE4] bg-white px-4 sm:px-6">
      {/* LEFT: Hamburger + Page title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-[#5D7469] transition hover:bg-[#F2F8F4] lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-base font-extrabold tracking-tight text-[#18352A] sm:text-lg">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* RIGHT: Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-[#5D7469] transition hover:bg-[#F2F8F4]"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#2E7D5B]" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#F2F8F4] sm:pr-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF7F0]">
              <span className="text-sm font-bold text-[#2E7D5B]">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold leading-tight text-[#18352A]">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] capitalize text-[#789087]">
                {config.label}
              </p>
            </div>

            <ChevronDown
              size={15}
              className="hidden text-[#789087] sm:block"
            />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-[#DDEDE4] bg-white text-[#18352A] shadow-[0_12px_40px_rgba(24,53,42,0.1)]">
              <div className="border-b border-[#DDEDE4] px-4 py-3">
                <p className="truncate font-semibold text-[#18352A]">
                  {user?.name || "User"}
                </p>
                <p className="mt-1 truncate text-xs text-[#789087]">
                  {user?.email || ""}
                </p>
                <span className="mt-2 inline-block rounded-full bg-[#EAF7F0] px-2.5 py-1 text-xs font-bold capitalize text-[#2E7D5B]">
                  {user?.role}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleNavigation(config.dashboard)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-[#F7FBF8]"
              >
                <LayoutDashboard size={17} className="text-[#789087]" />
                Dashboard
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-[#DDEDE4] px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;