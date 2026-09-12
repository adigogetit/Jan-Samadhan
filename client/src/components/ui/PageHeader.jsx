/**
 * PageHeader — Consistent page header with back button, eyebrow, title, description, and actions.
 *
 * Usage:
 *   <PageHeader
 *     eyebrow="Citizen Portal"
 *     title="My Problems"
 *     description="Track all your reported problems"
 *     backPath="/citizen/dashboard"
 *   >
 *     <button>Action</button>
 *   </PageHeader>
 */

import { useNavigate } from "react-router-dom";

export default function PageHeader({ eyebrow, title, description, backPath, backLabel, children, className = "" }) {
  const navigate = useNavigate();

  return (
    <div className={`mb-6 ${className}`}>
      {backPath && (
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="group mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#5D7469] transition hover:text-[#2E7D5B]"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          {backLabel || "Back"}
        </button>
      )}

      {eyebrow && (
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2E7D5B]">
          {eyebrow}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#18352A] sm:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-1.5 text-sm leading-6 text-[#667A70]">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

