import { apiFetch } from '@/lib/api';
import { Role } from '@/types/api';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export const authService = {
  login: async (credentials: any): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: () => {
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
  },

  getCurrentUser: async () => {
    return apiFetch('/api/v1/auth/me');
  },

  register: async (data: any) => {
    return apiFetch('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
