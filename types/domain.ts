export type WasteCategory =
  | 'OVERFLOWING_GARBAGE_BIN'
  | 'ILLEGAL_WASTE_DUMPING'
  | 'MISSED_WASTE_COLLECTION'
  | 'HAZARDOUS_WASTE'
  | 'OTHER';

export type ReportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type ReportStatus =
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface CollectionTeam {
  _id: string;
  teamName: string;
  contactPerson: string;
  phone: string;
  serviceArea: string;
  isActive: boolean;
  assignedReportCount?: number;
  activeWorkloadCount?: number;
  resolvedReportCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionTeamDetail extends CollectionTeam {
  assignedReports: Array<{
    _id: string;
    reportCode: string;
    category: WasteCategory;
    priority: ReportPriority;
    status: ReportStatus;
    address: string;
    createdAt: string;
    resolvedAt?: string | null;
  }>;
}

export interface StatusHistoryEntry {
  _id: string;
  reportId: string;
  previousStatus: ReportStatus | null;
  newStatus: ReportStatus;
  changedById:
    | {
        _id: string;
        fullName: string;
        role: string;
      }
    | string;
  note: string;
  createdAt: string;
}

export interface PriorityHistoryEntry {
  previousPriority: ReportPriority;
  newPriority: ReportPriority;
  reason: string;
  changedById:
    | {
        _id: string;
        fullName: string;
        role: string;
      }
    | string;
  changedAt: string;
}

export interface WasteReport {
  _id: string;
  reportCode: string;
  citizenId:
    | {
        _id: string;
        fullName: string;
        email: string;
        phone?: string;
      }
    | string;
  category: WasteCategory;
  description: string;
  address: string;
  street?: string;
  area?: string;
  city?: string;
  ward?: string;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string | null;
  photoPreviewUrl?: string | null;
  priority: ReportPriority;
  priorityReason: string;
  matchedRule?: string | null;
  priorityOverrideReason?: string | null;
  priorityOverriddenById?:
    | {
        _id: string;
        fullName: string;
        role: string;
      }
    | string
    | null;
  priorityOverriddenAt?: string | null;
  priorityHistory?: PriorityHistoryEntry[];
  status: ReportStatus;
  assignedTeamId?: CollectionTeam | string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory?: StatusHistoryEntry[];
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CitizenSummary {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  recentReports: WasteReport[];
}

export interface StatisticsOverview {
  summary: {
    totalReports: number;
    submittedReports: number;
    acknowledgedReports: number;
    assignedReports: number;
    inProgressReports: number;
    resolvedReports: number;
    rejectedReports: number;
    pendingReports: number;
    urgentHighReports: number;
    activeTeamsCount: number;
  };
  byCategory: Array<{ category: WasteCategory; count: number }>;
  byStatus: Array<{ status: ReportStatus; count: number }>;
  byPriority: Array<{ priority: ReportPriority; count: number }>;
  monthlyTrends: Array<{ month: string; total: number; resolved: number }>;
  teamWorkload: Array<{
    teamId: string;
    teamName: string;
    serviceArea: string;
    isActive: boolean;
    assignedCount: number;
    inProgressCount: number;
    resolvedCount: number;
    totalAssigned: number;
  }>;
  resolutionStats: {
    resolvedCount: number;
    resolutionRate: number;
    averageResolutionHours: number;
  };
}

export interface MapReportMarker {
  id: string;
  reportCode: string;
  category: WasteCategory;
  priority: ReportPriority;
  status: ReportStatus;
  address: string;
  area?: string;
  ward?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

