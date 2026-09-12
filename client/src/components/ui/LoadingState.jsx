/**
 * LoadingState — Green-tinted skeleton pulse loader.
 *
 * Usage:  <LoadingState />
 *         <LoadingState cards={3} />
 */

export default function LoadingState({ cards = 4, className = "" }) {
  return (
    <div className={`animate-pulse space-y-6 ${className}`}>
      {/* KPI row skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-[22px] border border-[#DDEDE4] bg-white p-5">
            <div className="h-11 w-11 rounded-xl bg-[#EDF6F0]" />
            <div className="mt-3 h-7 w-16 rounded-lg bg-[#DDEDE4]" />
            <div className="mt-2 h-4 w-24 rounded bg-[#E5F2EA]" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-6">
        <div className="h-5 w-40 rounded bg-[#DDEDE4]" />
        <div className="mt-4 space-y-3">
          <div className="h-20 rounded-2xl bg-[#EDF6F0]" />
          <div className="h-20 rounded-2xl bg-[#EDF6F0]" />
          <div className="h-20 rounded-2xl bg-[#EDF6F0]" />
        </div>
      </div>
    </div>
  );
}

