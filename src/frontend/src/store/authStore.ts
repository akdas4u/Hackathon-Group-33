import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, LoginResponse } from '../types';

/**
 * There is no profile/HR endpoint in this hackathon backend — full name,
 * department, and timezone are demo-only fields seeded client-side and
 * editable in Settings > Profile. They never leave the browser.
 */
export interface UserProfile {
  readonly fullName: string;
  readonly department: string;
  readonly timezone: string;
}

const DEMO_DISPLAY_NAMES: Record<string, { fullName: string; department: string }> = {
  'coordinator@demo.io': { fullName: 'Riley Coordinator', department: 'Release Engineering' },
  'manager@demo.io': { fullName: 'Morgan Manager', department: 'Release Engineering' },
  'qalead@demo.io': { fullName: 'Quinn Lead', department: 'Quality Assurance' },
  'devops@demo.io': { fullName: 'Devon Ops', department: 'DevOps' },
  'admin@demo.io': { fullName: 'Alex Admin', department: 'IT Administration' },
};

function deriveDefaultProfile(user: AuthUser): UserProfile {
  const known = DEMO_DISPLAY_NAMES[user.username];
  return {
    fullName: known?.fullName ?? user.username,
    department: known?.department ?? 'Release Engineering',
    timezone: 'Europe/Dublin (GMT+1)',
  };
}

/** Matches Jwt:ExpiryMinutes in appsettings.Development.json — keep in sync. */
export const JWT_EXPIRY_MINUTES = 60;

export interface AuthState {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly user: AuthUser | null;
  readonly profile: UserProfile | null;
  readonly loginTimestamp: number | null;
  readonly login: (response: LoginResponse) => void;
  readonly setAccessToken: (accessToken: string) => void;
  readonly logout: () => void;
  readonly hasPermission: (permission: string) => boolean;
  readonly updateProfile: (patch: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      profile: null,
      loginTimestamp: null,

      login: (response: LoginResponse) =>
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
          profile: deriveDefaultProfile(response.user),
          loginTimestamp: Date.now(),
        }),

      setAccessToken: (accessToken: string) => set({ accessToken }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          profile: null,
          loginTimestamp: null,
        }),

      hasPermission: (permission: string) =>
        get().user?.permissions.includes(permission) ?? false,

      updateProfile: (patch: Partial<UserProfile>) =>
        set((state) => (state.profile ? { profile: { ...state.profile, ...patch } } : state)),
    }),
    {
      // Functions are dropped by JSON.stringify automatically; only the
      // serializable auth fields below actually persist to localStorage.
      name: 'release-readiness-auth',
    },
  ),
);
