import { ReportPriority, ReportStatus, WasteCategory } from '@/types/domain';

export const CATEGORY_META: Record<
  WasteCategory,
  { label: string; shortLabel: string; description: string }
> = {
  OVERFLOWING_GARBAGE_BIN: {
    label: 'Overflowing Garbage Bin',
    shortLabel: 'Overflowing Bin',
    description:
      'Public bin or container spilling onto street or pedestrian walkway.',
  },
  ILLEGAL_WASTE_DUMPING: {
    label: 'Illegal Waste Dumping',
    shortLabel: 'Illegal Dumping',
    description:
      'Unauthorized dumping of rubble, bulk refuse, or waste bags in open areas.',
  },
  MISSED_WASTE_COLLECTION: {
    label: 'Missed Waste Collection',
    shortLabel: 'Missed Pickup',
    description:
      'Scheduled municipal pickup route skipped or delayed in your block.',
  },
  HAZARDOUS_WASTE: {
    label: 'Hazardous Waste',
    shortLabel: 'Hazardous Waste',
    description:
      'Medical, chemical, sharp, flammable, or toxic material requiring urgent handling.',
  },
  OTHER: {
    label: 'Other Sanitation Issue',
    shortLabel: 'Other',
    description:
      'General sanitation or street cleanliness issue not listed above.',
  },
};

export const STATUS_META: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-[#eceae3] text-[#171a17] border-[#d1cec4]',
  },
  ACKNOWLEDGED: {
    label: 'Acknowledged',
    className: 'bg-[#e8eef3] text-[#1e3a5f] border-[#c4d4e0]',
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-[#f4ecd8] text-[#6d4c0f] border-[#dfd0a8]',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-[#e5f0ea] text-[#133826] border-[#b9d4c4]',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-[#133826] text-white border-[#133826]',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-[#fdf2f2] text-[#7f1d1d] border-[#e7c5c5]',
  },
};

export const PRIORITY_META: Record<
  ReportPriority,
  { label: string; className: string; markerColor: string }
> = {
  URGENT: {
    label: 'Urgent',
    className: 'bg-[#991b1b] text-white border-[#991b1b]',
    markerColor: '#dc2626',
  },
  HIGH: {
    label: 'High',
    className: 'bg-[#fff3e6] text-[#9a3412] border-[#f0caa8]',
    markerColor: '#ea580c',
  },
  NORMAL: {
    label: 'Normal',
    className: 'bg-[#fef9e7] text-[#713f12] border-[#eadb9b]',
    markerColor: '#ca8a04',
  },
  LOW: {
    label: 'Low',
    className: 'bg-[#eef5f0] text-[#1b5e3c] border-[#c7dfd0]',
    markerColor: '#16a34a',
  },
};

export const ALLOWED_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> =
  {
    SUBMITTED: ['ACKNOWLEDGED', 'ASSIGNED', 'REJECTED'],
    ACKNOWLEDGED: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
    ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
    IN_PROGRESS: ['RESOLVED', 'REJECTED'],
    RESOLVED: [],
    REJECTED: [],
  };

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

