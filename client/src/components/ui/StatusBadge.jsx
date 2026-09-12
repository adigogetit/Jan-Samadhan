/**
 * StatusBadge — Consistent pill badge with colored dot indicator.
 *
 * Usage:  <StatusBadge status="Validated" />
 *         <StatusBadge status="Pending" size="sm" />
 */

const STATUS_STYLES = {
  // Green statuses
  Validated: "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]",
  Accepted: "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]",
  Resolved: "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]",
  Completed: "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]",
  Active: "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]",
  Approved: "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]",
  "In Progress": "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]",

  // Orange/yellow statuses
  Pending: "bg-[#FFF6E5] text-[#A46308] border-[#F6D99D]",
  "Under Review": "bg-[#FFF6E5] text-[#A46308] border-[#F6D99D]",
  Processing: "bg-[#FFF6E5] text-[#A46308] border-[#F6D99D]",

  // Red statuses
  Rejected: "bg-[#FFF0F0] text-[#B42318] border-[#F3C5C5]",
  Failed: "bg-[#FFF0F0] text-[#B42318] border-[#F3C5C5]",
  Critical: "bg-[#FFF0F0] text-[#B42318] border-[#F3C5C5]",
  Cancelled: "bg-[#FFF0F0] text-[#B42318] border-[#F3C5C5]",

  // Gray statuses
  Duplicate: "bg-[#F3F7F5] text-[#5C7067] border-[#DDE8E2]",
  Draft: "bg-[#F3F7F5] text-[#5C7067] border-[#DDE8E2]",
  Closed: "bg-[#F3F7F5] text-[#5C7067] border-[#DDE8E2]",
};

// Priority-specific styles
const PRIORITY_STYLES = {
  Low: "bg-[#F3F7F5] text-[#5C7067] border-[#DDE8E2]",
  Medium: "bg-[#EAF7F0] text-[#246748] border-[#CBE8D7]",
  High: "bg-[#FFF6E5] text-[#A46308] border-[#F6D99D]",
  Critical: "bg-[#FFF0F0] text-[#B42318] border-[#F3C5C5]",
};

export default function StatusBadge({ status, variant, size = "md", className = "" }) {
  const styles = variant === "priority"
    ? (PRIORITY_STYLES[status] || PRIORITY_STYLES.Medium)
    : (STATUS_STYLES[status] || "bg-[#F3F7F5] text-[#5C7067] border-[#DDE8E2]");

  const sizeClass = size === "sm"
    ? "px-2 py-0.5 text-[10px]"
    : "px-3 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${sizeClass} ${styles} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

