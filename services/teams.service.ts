import { api } from '@/lib/api';
import { CollectionTeam, CollectionTeamDetail } from '@/types/domain';

export interface CreateTeamPayload {
  teamName: string;
  contactPerson: string;
  phone: string;
  serviceArea: string;
}

export type UpdateTeamPayload = Partial<CreateTeamPayload>;

export const teamsService = {
  async list(params?: {
    isActive?: 'true' | 'false';
    search?: string;
    serviceArea?: string;
  }): Promise<CollectionTeam[]> {
    const { data } = await api.get<CollectionTeam[]>('/teams', { params });
    return data;
  },

  async getById(id: string): Promise<CollectionTeamDetail> {
    const { data } = await api.get<CollectionTeamDetail>(`/teams/${id}`);
    return data;
  },

  async create(payload: CreateTeamPayload): Promise<CollectionTeam> {
    const { data } = await api.post<CollectionTeam>('/teams', payload);
    return data;
  },

  async update(id: string, payload: UpdateTeamPayload): Promise<CollectionTeamDetail> {
    const { data } = await api.patch<CollectionTeamDetail>(`/teams/${id}`, payload);
    return data;
  },

  async updateStatus(
    id: string,
    isActive: boolean,
  ): Promise<CollectionTeamDetail> {
    const { data } = await api.patch<CollectionTeamDetail>(
      `/teams/${id}/status`,
      { isActive },
    );
    return data;
  },
};

