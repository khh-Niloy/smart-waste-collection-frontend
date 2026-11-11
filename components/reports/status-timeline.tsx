'use client';

import { Check, XCircle } from 'lucide-react';
import { formatDateTime, STATUS_META } from '@/lib/formatters';
import { ReportStatus, StatusHistoryEntry } from '@/types/domain';

const STANDARD_STEPS: ReportStatus[] = [
  'SUBMITTED',
  'ACKNOWLEDGED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
];

export function StatusTimeline({
  currentStatus,
  history = [],
}: {
  currentStatus: ReportStatus;
  history?: StatusHistoryEntry[];
}) {
  const isRejected = currentStatus === 'REJECTED';
  const currentStepIdx = STANDARD_STEPS.indexOf(currentStatus);

  const reachedSet = new Set<ReportStatus>(
    history.map((entry) => entry.newStatus),
  );

  return (
    <div className="space-y-6">
      {/* Visual Progression Bar */}
      {isRejected ? (
        <div className="flex items-start gap-3 border-l-2 border-l-[#991b1b] border-[#e7d4d2] border bg-[#fdf6f5] p-4 rounded-sm">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#991b1b]" />
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[#7f1d1d]">
              Report Rejected
            </p>
            <p className="mt-0.5 text-sm text-[#7f1d1d]">
              This complaint was closed as rejected. Review the audit history
              below for the municipal dispatcher&apos;s note.
            </p>
          </div>
        </div>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-5">
          {STANDARD_STEPS.map((step, index) => {
            const isCompleted =
              currentStepIdx > index ||
              (currentStepIdx === index && currentStatus === 'RESOLVED') ||
              (reachedSet.has(step) && currentStepIdx > index);
            const isCurrent = currentStatus === step && step !== 'RESOLVED';

            return (
              <li
                key={step}
                className={`rounded-sm border p-3 ${
                  isCompleted
                    ? 'border-[#133826] bg-[#133826] text-white'
                    : isCurrent
                      ? 'border-[#1b5e3c] bg-[#eef5f0] text-[#133826]'
                      : 'border-[#dddad1] bg-white text-[#8c908a]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em]">
                    0{index + 1}
                  </span>
                  {isCompleted && <Check className="h-3.5 w-3.5" />}
                </div>
                <p className="mt-1.5 text-xs font-semibold">
                  {STATUS_META[step].label}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {/* Chronological Audit Log */}
      <div className="border-t border-[#eceae3] pt-4">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a5f59]">
          Status Audit History
        </p>
        {history.length === 0 ? (
          <p className="text-sm text-[#5a5f59]">No status history recorded.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((entry) => {
              const actor =
                typeof entry.changedById === 'object' && entry.changedById
                  ? `${entry.changedById.fullName} (${entry.changedById.role})`
                  : 'System';
              return (
                <li
                  key={entry._id}
                  className="flex flex-col gap-1 border-l-2 border-[#d1cec4] pl-3.5 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#171a17]">
                        {entry.previousStatus
                          ? `${STATUS_META[entry.previousStatus].label} → ${STATUS_META[entry.newStatus].label}`
                          : STATUS_META[entry.newStatus].label}
                      </span>
                      <span className="text-xs text-[#5a5f59]">by {actor}</span>
                    </div>
                    {entry.note && (
                      <p className="mt-0.5 text-sm text-[#5a5f59]">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <time className="shrink-0 font-mono text-[11px] text-[#8c908a]">
                    {formatDateTime(entry.createdAt)}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

