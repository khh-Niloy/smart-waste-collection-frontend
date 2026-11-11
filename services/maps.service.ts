import { api } from '@/lib/api';
import {
  MapReportMarker,
  ReportPriority,
  ReportStatus,
  WasteCategory,
} from '@/types/domain';

export const mapsService = {
  async getReportMarkers(params?: {
    status?: ReportStatus | '';
    category?: WasteCategory | '';
    priority?: ReportPriority | '';
  }): Promise<MapReportMarker[]> {
    const cleaned: Record<string, string> = {};
    if (params?.status) cleaned.status = params.status;
    if (params?.category) cleaned.category = params.category;
    if (params?.priority) cleaned.priority = params.priority;

    const { data } = await api.get<MapReportMarker[]>('/maps/reports', {
      params: cleaned,
    });
    return data;
  },
};

