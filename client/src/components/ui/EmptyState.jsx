/**
 * EmptyState — Beautiful empty state with icon, explanation, and optional action.
 *
 * Usage:
 *   <EmptyState
 *     icon={<FileX size={28} />}
 *     title="No Problems Found"
 *     description="You haven't reported any problems yet."
 *     actionLabel="Report a Problem"
 *     onAction={() => navigate("/citizen/submit-problem")}
 *   />
 */

export default function EmptyState({ icon, title, description, actionLabel, onAction, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {icon && (
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EAF7F0] text-[#2E7D5B]">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-extrabold text-[#18352A]">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#667A70]">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-[#2E7D5B] px-5 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(46,125,91,0.18)] transition hover:bg-[#246748]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

