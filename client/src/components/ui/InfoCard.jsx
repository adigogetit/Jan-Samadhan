/**
 * InfoCard — Card with left border-l-4 color stripe and tracking label.
 *
 * Usage:
 *   <InfoCard label="Category" value="Water & Sanitation" color="green" />
 *   <InfoCard label="Priority" value="High" color="orange" />
 */

const COLOR_MAP = {
  green: "border-l-[#2E7D5B]",
  dark: "border-l-[#18352A]",
  orange: "border-l-[#E5A72F]",
  red: "border-l-[#D9534F]",
  gray: "border-l-[#789087]",
};

export default function InfoCard({ label, value, icon, color = "green", children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[#E1EEE7] border-l-4 bg-white p-4 shadow-[0_4px_18px_rgba(24,53,42,0.04)] ${COLOR_MAP[color] || COLOR_MAP.green} ${className}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#789087]">
        {label}
      </p>

      <div className="mt-1.5 flex items-center gap-2">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF7F0] text-sm text-[#2E7D5B]">
            {icon}
          </span>
        )}

        {value && (
          <p className="text-sm font-extrabold text-[#244238]">
            {value}
          </p>
        )}
      </div>

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

