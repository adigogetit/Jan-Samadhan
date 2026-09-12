/**
 * AlertBanner — Success / Error / Warning alert banners.
 *
 * Usage:
 *   <AlertBanner type="success" message="Problem submitted successfully!" />
 *   <AlertBanner type="error" message="Failed to load data." onRetry={() => refetch()} />
 */

import { AlertCircle, CheckCircle, AlertTriangle, X } from "lucide-react";

const STYLES = {
  success: {
    wrapper: "border-[#CBE8D7] bg-[#EAF7F0] text-[#246748]",
    icon: <CheckCircle size={18} />,
  },
  error: {
    wrapper: "border-red-200 bg-red-50 text-red-700",
    icon: <AlertCircle size={18} />,
  },
  warning: {
    wrapper: "border-[#F6D99D] bg-[#FFF6E5] text-[#A46308]",
    icon: <AlertTriangle size={18} />,
  },
};

export default function AlertBanner({ type = "error", message, onRetry, onDismiss, className = "" }) {
  const s = STYLES[type] || STYLES.error;

  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${s.wrapper} ${className}`}>
      <span className="mt-0.5 shrink-0">{s.icon}</span>

      <p className="flex-1">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 text-xs font-bold underline underline-offset-2"
        >
          Retry
        </button>
      )}

      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

