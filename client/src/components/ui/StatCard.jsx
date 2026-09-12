/**
 * StatCard — KPI statistic card for dashboards.
 *
 * Usage:  <StatCard icon={<FileText />} label="Total Problems" value={42} color="green" />
 */

const COLOR_MAP = {
  green: {
    iconBg: "bg-[#EAF7F0]",
    iconText: "text-[#2E7D5B]",
    valueBg: "",
  },
  orange: {
    iconBg: "bg-[#FFF6E5]",
    iconText: "text-[#A46308]",
    valueBg: "",
  },
  red: {
    iconBg: "bg-[#FFF0F0]",
    iconText: "text-[#B42318]",
    valueBg: "",
  },
  gray: {
    iconBg: "bg-[#F3F7F5]",
    iconText: "text-[#5C7067]",
    valueBg: "",
  },
};

export default function StatCard({ icon, label, value, color = "green", onClick, className = "" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.green;

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={`rounded-[22px] border border-[#DDEDE4] bg-white p-5 shadow-[0_4px_18px_rgba(24,53,42,0.04)] transition hover:shadow-[0_8px_30px_rgba(24,53,42,0.07)] ${onClick ? "cursor-pointer text-left" : ""} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.iconBg} ${c.iconText}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-black tracking-tight text-[#18352A]">
          {value ?? "—"}
        </p>

        <p className="mt-1 text-xs font-semibold text-[#789087]">
          {label}
        </p>
      </div>
    </Wrapper>
  );
}

