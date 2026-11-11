import { api } from '@/lib/api';
import { StatisticsOverview } from '@/types/domain';

export const statisticsService = {
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

