/**
 * Sidebar — Left navigation sidebar for authenticated pages.
 * Uses the same roleConfig data structure as the existing Navbar.
 */

import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Building2,
  FolderKanban,
  GraduationCap,
  TrendingUp,
  Heart,
  Shield,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

/* ─── icon map per link label ─── */
const ICON_MAP = {
  Dashboard: LayoutDashboard,
  "My Problems": FileText,
  "Report Problem": PlusCircle,
  Problems: FileText,
  Projects: FolderKanban,
  "My Projects": FolderKanban,
  "My Interests": Heart,
  Users: Users,
  System: Settings,
};

/* ─── role nav config (same data from old Navbar) ─── */
const roleConfig = {
  citizen: {
    label: "Citizen Portal",
    short: "Citizen",
    dashboard: "/citizen/dashboard",
    links: [
      { label: "Dashboard", path: "/citizen/dashboard" },
      { label: "My Problems", path: "/citizen/problems" },
      { label: "Report Problem", path: "/citizen/submit-problem" },
    ],
  },
  government: {
    label: "Government Portal",
    short: "Government",
    dashboard: "/government/dashboard",
    links: [
      { label: "Dashboard", path: "/government/dashboard" },
      { label: "Problems", path: "/government/problems" },
    ],
  },
  university: {
    label: "University Portal",
    short: "University",
    dashboard: "/university/dashboard",
    links: [
      { label: "Dashboard", path: "/university/dashboard" },
      { label: "Problems", path: "/university/problems" },
      { label: "Projects", path: "/university/projects" },
    ],
  },
  student: {
    label: "Student Portal",
    short: "Student",
    dashboard: "/student/dashboard",
    links: [
      { label: "Dashboard", path: "/student/dashboard" },
      { label: "My Projects", path: "/student/projects" },
    ],
  },
  investor: {
    label: "Investor Portal",
    short: "Investor",
    dashboard: "/investor/dashboard",
    links: [
      { label: "Dashboard", path: "/investor/dashboard" },
      { label: "Projects", path: "/investor/projects" },
      { label: "My Interests", path: "/investor/interests" },
    ],
  },
  admin: {
    label: "Admin Portal",
    short: "Admin",
    dashboard: "/admin/dashboard",
    links: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Users", path: "/admin/users" },
      { label: "System", path: "/admin/system" },
    ],
  },
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const config = roleConfig[user?.role] || {
    label: "Portal",
    short: "User",
    dashboard: "/",
    links: [],
  };

  const isActive = (path) => {
    if (path === config.dashboard) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[210px] flex-col border-r border-[#DDEDE4] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* ── Brand ── */}
        <div className="flex h-16 items-center justify-between border-b border-[#DDEDE4] px-5">
          <button
            type="button"
            onClick={() => handleNav(config.dashboard)}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7F0]">
              <span className="text-lg font-black text-[#2E7D5B]">J</span>
            </div>

            <div className="text-left">
              <div className="text-sm font-extrabold tracking-tight text-[#18352A]">
                JAN-SAMADHAN
              </div>
              <div className="text-[10px] font-semibold text-[#789087]">
                {config.short} Portal
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#789087] transition hover:bg-[#F2F8F4] lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A0B0A8]">
            Navigation
          </p>

          <div className="space-y-1">
            {config.links.map((link) => {
              const active = isActive(link.path);
              const Icon = ICON_MAP[link.label] || FileText;

              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => handleNav(link.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active
                      ? "bg-[#EAF7F0] text-[#2E7D5B]"
                      : "text-[#5D7469] hover:bg-[#F7FBF8] hover:text-[#18352A]"
                    }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-[#2E7D5B] text-white" : "bg-[#F2F8F4] text-[#789087]"
                      }`}
                  >
                    <Icon size={16} />
                  </span>

                  {link.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── User / Logout ── */}
        <div className="border-t border-[#DDEDE4] p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF7F0]">
              <span className="text-sm font-bold text-[#2E7D5B]">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-[#18352A]">
                {user?.name || "User"}
              </p>
              <p className="truncate text-[11px] text-[#789087]">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <LogOut size={16} />
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

