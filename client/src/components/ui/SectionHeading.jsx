/**
 * SectionHeading — Eyebrow + Title + Description pattern.
 *
 * Usage:  <SectionHeading eyebrow="Overview" title="Problem Details" description="..." />
 */

export default function SectionHeading({ eyebrow, title, description, className = "", children }) {
  return (
    <div className={`mb-5 ${className}`}>
      {eyebrow && (
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2E7D5B]">
          {eyebrow}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-[#18352A] sm:text-2xl">
          {title}
        </h2>

        {children}
      </div>

      {description && (
        <p className="mt-1.5 text-sm leading-6 text-[#667A70]">
          {description}
        </p>
      )}
    </div>
  );
}

