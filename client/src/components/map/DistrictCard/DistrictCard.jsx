import React from "react";

// ============================================================
// DISTRICT CARD
// ============================================================

const DistrictCard = ({ district, onClose }) => {
  // ----------------------------------------------------------
  // EMPTY STATE
  // ----------------------------------------------------------

  if (!district) {
    return (
      <div className="h-full min-h-[560px] rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto text-2xl">
            🗺️
          </div>

          <h3 className="font-bold text-[#172B3A] mt-4">
            Select a district
          </h3>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Click any district on the Jharkhand map to view
            its civic problem statistics.
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // SAFE VALUES
  // ----------------------------------------------------------

  const total = Number(district.total || 0);
  const pending = Number(district.pending || 0);
  const underReview = Number(district.underReview || 0);
  const validated = Number(district.validated || 0);
  const inProgress = Number(district.inProgress || 0);
  const resolved = Number(district.resolved || 0);
  const rejected = Number(district.rejected || 0);
  const duplicate = Number(district.duplicate || 0);

  const resolutionRate = Math.min(
    Math.max(Number(district.resolutionRate || 0), 0),
    100
  );

  const active =
    pending +
    underReview +
    validated +
    inProgress;

  // ----------------------------------------------------------
  // STATUS CARD
  // ----------------------------------------------------------

  const StatusCard = ({
    label,
    value,
    wrapperClass,
    labelClass,
    valueClass,
  }) => (
    <div className={`rounded-xl p-3.5 ${wrapperClass}`}>
      <p className={`text-xs font-medium ${labelClass}`}>
        {label}
      </p>

      <p className={`text-xl font-bold mt-1 ${valueClass}`}>
        {value}
      </p>
    </div>
  );

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="h-full min-h-[560px] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2477B5]">
            District Overview
          </p>

          <h3 className="text-xl font-bold text-[#172B3A] mt-1">
            {district.district}
          </h3>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close district overview"
            className="w-8 h-8 shrink-0 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xl transition"
          >
            ×
          </button>
        )}
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="p-5 overflow-y-auto dashboard-scroll">

        {/* TOTAL */}

        <div className="rounded-xl bg-[#2477B5]/5 border border-[#2477B5]/10 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">
                Total Reported Problems
              </p>

              <p className="text-3xl font-bold text-[#172B3A] mt-1">
                {total}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">
                Resolution
              </p>

              <p className="text-lg font-bold text-[#2477B5] mt-1">
                {resolutionRate}%
              </p>
            </div>
          </div>
        </div>

        {/* STATUS GRID */}

        <div className="grid grid-cols-2 gap-3 mt-4">

          <StatusCard
            label="Pending"
            value={pending}
            wrapperClass="bg-amber-50"
            labelClass="text-amber-700"
            valueClass="text-amber-900"
          />

          <StatusCard
            label="Under Review"
            value={underReview}
            wrapperClass="bg-blue-50"
            labelClass="text-blue-700"
            valueClass="text-blue-900"
          />

          <StatusCard
            label="Validated"
            value={validated}
            wrapperClass="bg-purple-50"
            labelClass="text-purple-700"
            valueClass="text-purple-900"
          />

          <StatusCard
            label="In Progress"
            value={inProgress}
            wrapperClass="bg-indigo-50"
            labelClass="text-indigo-700"
            valueClass="text-indigo-900"
          />

          <StatusCard
            label="Resolved"
            value={resolved}
            wrapperClass="bg-green-50"
            labelClass="text-green-700"
            valueClass="text-green-900"
          />

          <StatusCard
            label="Active"
            value={active}
            wrapperClass="bg-slate-100"
            labelClass="text-slate-600"
            valueClass="text-slate-800"
          />
        </div>

        {/* RESOLUTION RATE */}

        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              Resolution Rate
            </span>

            <span className="text-sm font-bold text-[#172B3A]">
              {resolutionRate}%
            </span>
          </div>

          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2477B5] rounded-full transition-all duration-500"
              style={{
                width: `${resolutionRate}%`,
              }}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            {resolved} of {total} reported problems resolved
          </p>
        </div>

        {/* OTHER STATUSES */}

        {(rejected > 0 || duplicate > 0) && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">
              Other Outcomes
            </p>

            <div className="grid grid-cols-2 gap-3">

              {rejected > 0 && (
                <div className="rounded-xl bg-red-50 p-3">
                  <p className="text-xs text-red-700">
                    Rejected
                  </p>

                  <p className="text-lg font-bold text-red-900 mt-1">
                    {rejected}
                  </p>
                </div>
              )}

              {duplicate > 0 && (
                <div className="rounded-xl bg-slate-100 p-3">
                  <p className="text-xs text-slate-600">
                    Duplicate
                  </p>

                  <p className="text-lg font-bold text-slate-800 mt-1">
                    {duplicate}
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* SUMMARY */}

        <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Currently Active
            </span>

            <span className="font-bold text-[#172B3A]">
              {active}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-slate-500">
              Resolved
            </span>

            <span className="font-bold text-green-700">
              {resolved}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DistrictCard;