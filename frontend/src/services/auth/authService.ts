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

// Shape returned by the backend
interface BackendLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
  };
}

export const authService = {
  login: async (credentials: any): Promise<LoginResponse> => {
    console.log('Attempting login for:', credentials.email);
    const raw = await apiFetch<BackendLoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log('Login response received:', raw.user.role);

    // Map backend shape → frontend shape
    return {
      token: raw.accessToken,
      user: {
        id: raw.user.id,
        email: raw.user.email,
        role: raw.user.role as Role,
        name: `${raw.user.firstName} ${raw.user.lastName}`,
      },
    };
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
