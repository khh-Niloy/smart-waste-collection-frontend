import { api } from '@/lib/api';
import { StatisticsOverview } from '@/types/domain';

export interface PublicSummary {
  totalReports: number;
  resolvedReports: number;
  activeCrews: number;
  resolutionRate: number;
}

export const statisticsService = {
  async getPublicSummary(): Promise<PublicSummary> {
    const { data } = await api.get<PublicSummary>('/statistics/public-summary');
    return data;
  },

  async getOverview(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<StatisticsOverview> {
    const cleaned: Record<string, string> = {};
    if (params?.startDate) cleaned.startDate = params.startDate;
    if (params?.endDate) cleaned.endDate = params.endDate;
    const { data } = await api.get<StatisticsOverview>('/statistics/overview', {
      params: cleaned,
    });
    return data;
  },
};

