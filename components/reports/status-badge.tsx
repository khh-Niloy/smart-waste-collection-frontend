'use client';

import { PRIORITY_META, STATUS_META } from '@/lib/formatters';
import { ReportPriority, ReportStatus } from '@/types/domain';

export function StatusBadge({ status }: { status: ReportStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.04em] ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ReportPriority }) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.04em] ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
