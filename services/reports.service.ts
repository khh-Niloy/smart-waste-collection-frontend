import { api } from '@/lib/api';
import {
  CitizenSummary,
  PaginatedResponse,
  ReportPriority,
  ReportStatus,
  WasteCategory,
  WasteReport,
} from '@/types/domain';

export interface CreateReportPayload {
  category: WasteCategory;
  description: string;
  address: string;
  street?: string;
  area?: string;
  city?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
}

export interface QueryReportsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: WasteCategory | '';
  status?: ReportStatus | '';
  priority?: ReportPriority | '';
  assignedTeamId?: string;
  serviceArea?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

function cleanParams(params: QueryReportsParams): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      cleaned[k] = v as string | number;
    }
  }
  return cleaned;
}

export const reportsService = {
  async create(payload: CreateReportPayload): Promise<WasteReport> {
    const { data } = await api.post<WasteReport>('/reports', payload);
    return data;
  },

  async getMySummary(): Promise<CitizenSummary> {
    const { data } = await api.get<CitizenSummary>('/reports/my-summary');
    return data;
  },

  async getMyReports(
    params: QueryReportsParams = {},
  ): Promise<PaginatedResponse<WasteReport>> {
    const { data } = await api.get<PaginatedResponse<WasteReport>>(
      '/reports/my',
      { params: cleanParams(params) },
    );
    return data;
  },

  async getAllForAdmin(
    params: QueryReportsParams = {},
  ): Promise<PaginatedResponse<WasteReport>> {
    const { data } = await api.get<PaginatedResponse<WasteReport>>('/reports', {
      params: cleanParams(params),
    });
    return data;
  },

  async getById(id: string): Promise<WasteReport> {
    const { data } = await api.get<WasteReport>(`/reports/${id}`);
    return data;
  },

  async updateStatus(
    id: string,
    payload: { status: ReportStatus; note?: string },
  ): Promise<WasteReport> {
    const { data } = await api.patch<WasteReport>(
      `/reports/${id}/status`,
      payload,
    );
    return data;
  },

  async assignTeam(
    id: string,
    payload: { teamId: string; note?: string },
  ): Promise<WasteReport> {
    const { data } = await api.patch<WasteReport>(
      `/reports/${id}/assign-team`,
      payload,
    );
    return data;
  },

  async overridePriority(
    id: string,
    payload: { priority: ReportPriority; reason: string },
  ): Promise<WasteReport> {
    const { data } = await api.patch<WasteReport>(
      `/reports/${id}/priority`,
      payload,
    );
    return data;
  },
};
