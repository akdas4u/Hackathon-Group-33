import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, LoginResponse } from '../types';

export interface AuthState {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly user: AuthUser | null;
  readonly login: (response: LoginResponse) => void;
  readonly setAccessToken: (accessToken: string) => void;
  readonly logout: () => void;
  readonly hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      login: (response: LoginResponse) =>
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
        }),

      setAccessToken: (accessToken: string) => set({ accessToken }),

      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      hasPermission: (permission: string) =>
        get().user?.permissions.includes(permission) ?? false,
    }),
    {
      // Functions are dropped by JSON.stringify automatically; only the
      // serializable auth fields below actually persist to localStorage.
      name: 'release-readiness-auth',
    },
  ),
);
