import { api } from '@/lib/api';
import { LoginPayload, RegisterPayload, User } from '@/types/auth';

export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/auth/register', payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<User> {
    const { data } = await api.post<User>('/auth/login', payload);
    return data;
  },

  async logout(): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/logout');
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async listUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },
};

