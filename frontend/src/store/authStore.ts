import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '@/types/api';

interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

/**
 * Zustand store for managing authentication state.
 * Persists to localStorage to maintain session across refreshes.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'uims-auth',
    }
  )
);
