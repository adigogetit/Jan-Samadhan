import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

const roleConfig = {
  citizen: {
    label: "Citizen",
    dashboard: "/citizen/dashboard",
    links: [
      { label: "Dashboard", path: "/citizen/dashboard" },
      { label: "My Problems", path: "/citizen/problems" },
      { label: "Report Problem", path: "/citizen/submit-problem" },
    ],
  },

  government: {
    label: "Government",
    dashboard: "/government/dashboard",
    links: [
      { label: "Dashboard", path: "/government/dashboard" },
      { label: "Problems", path: "/government/problems" },
      { label: "Projects", path: "/government/projects" },
    ],
  },

  university: {
    label: "University",
    dashboard: "/university/dashboard",
    links: [
      { label: "Dashboard", path: "/university/dashboard" },
      { label: "Problems", path: "/university/problems" },
      { label: "Projects", path: "/university/projects" },
    ],
  },

  student: {
    label: "Student",
    dashboard: "/student/dashboard",
    links: [
      { label: "Dashboard", path: "/student/dashboard" },
      { label: "Projects", path: "/student/projects" },
      { label: "My Work", path: "/student/work" },
    ],
  },

  investor: {
    label: "Investor",
    dashboard: "/investor/dashboard",
    links: [
      { label: "Dashboard", path: "/investor/dashboard" },
      { label: "Projects", path: "/investor/projects" },
      { label: "Interests", path: "/investor/interests" },
    ],
  },

  admin: {
    label: "Admin",
    dashboard: "/admin/dashboard",
    links: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Users", path: "/admin/users" },
      { label: "System", path: "/admin/system" },
    ],
  },
};

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const config = roleConfig[user?.role] || {
    label: "User",
    dashboard: "/",
    links: [],
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);

    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  const handleNavigation = (path) => {
    setMobileOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  const isActive = (path) => {
    if (path === config.dashboard) {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#2477B5] text-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LEFT */}
        <div className="flex items-center gap-6">

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNavigation(config.dashboard)}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
              <span className="text-lg font-bold text-[#2477B5]">
                J
              </span>
            </div>

            <div className="hidden text-left sm:block">
              <div className="text-base font-bold leading-none">
                JAN-SAMADHAN
              </div>

              <div className="mt-1 text-xs text-white/75">
                {config.label} Portal
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {config.links.map((link) => {
              const active = isActive(link.path);

              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => handleNavigation(link.path)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.path === config.dashboard && (
                    <LayoutDashboard
                      size={15}
                      className="mr-2 inline"
                    />
                  )}

                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-lg p-2.5 transition hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-white/10 sm:pr-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <User
                  size={18}
                  className="text-[#2477B5]"
                />
              </div>

              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold leading-tight">
                  {user?.name || "User"}
                </p>

                <p className="text-xs capitalize text-white/70">
                  {config.label}
                </p>
              </div>

              <ChevronDown
                size={16}
                className="hidden sm:block"
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white text-[#172B3A] shadow-lg">

                <div className="border-b border-[#E2E8F0] px-4 py-3">
                  <p className="truncate font-semibold">
                    {user?.name || "User"}
                  </p>

                  <p className="mt-1 truncate text-xs text-[#64748B]">
                    {user?.email || ""}
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-[#2477B5]/10 px-2 py-1 text-xs font-medium capitalize text-[#2477B5]">
                    {user?.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleNavigation(config.dashboard)
                  }
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-50"
                >
                  <LayoutDashboard size={17} />
                  Dashboard
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 border-t border-[#E2E8F0] px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-white/15 px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {config.links.map((link) => {
              const active = isActive(link.path);

              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => handleNavigation(link.path)}
                  className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;