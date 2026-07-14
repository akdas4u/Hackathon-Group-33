import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STAGE_KEYS } from '../types';

export type Theme = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type EnvironmentFilter = 'Production' | 'Staging' | 'Development' | 'All';

export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
}

/**
 * These toggles are UI-only preferences. There is no backend endpoint for
 * notification delivery in this hackathon build — flipping one changes what
 * this browser remembers, not what any server sends.
 */
export interface NotificationPrefs {
  readonly assessmentComplete: boolean;
  readonly criticalBlockerDetected: boolean;
  readonly decisionChanged: boolean;
  readonly dailySummaryEmail: boolean;
}

/** Also UI-only — the backend has no environment tagging or per-user stage ordering. */
export interface ReleasePrefs {
  readonly defaultEnvironmentFilter: EnvironmentFilter;
  readonly stageOrder: readonly string[];
  readonly pdfIncludeExecutiveSummary: boolean;
  readonly pdfIncludeEvidence: boolean;
  readonly pdfIncludeRemediation: boolean;
}

export interface UiState {
  readonly theme: Theme;
  readonly density: Density;
  readonly sidebarCollapsed: boolean;
  readonly accentColor: string;
  readonly expandedStageId: string | null;
  readonly notificationPrefs: NotificationPrefs;
  readonly releasePrefs: ReleasePrefs;
  readonly toasts: readonly Toast[];

  readonly setTheme: (theme: Theme) => void;
  readonly setDensity: (density: Density) => void;
  readonly toggleSidebar: () => void;
  readonly setAccentColor: (color: string) => void;
  readonly toggleStageExpansion: (id: string) => void;
  readonly setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
  readonly setReleasePref: <K extends keyof ReleasePrefs>(key: K, value: ReleasePrefs[K]) => void;
  readonly reorderStages: (stageKeys: readonly string[]) => void;
  readonly pushToast: (message: string, variant?: ToastVariant) => void;
  readonly dismissToast: (id: string) => void;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  assessmentComplete: true,
  criticalBlockerDetected: true,
  decisionChanged: false,
  dailySummaryEmail: true,
};

const DEFAULT_RELEASE_PREFS: ReleasePrefs = {
  defaultEnvironmentFilter: 'All',
  stageOrder: STAGE_KEYS,
  pdfIncludeExecutiveSummary: true,
  pdfIncludeEvidence: true,
  pdfIncludeRemediation: true,
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      density: 'comfortable',
      sidebarCollapsed: false,
      accentColor: '#00c6c2',
      expandedStageId: null,
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      releasePrefs: DEFAULT_RELEASE_PREFS,
      toasts: [],

      setTheme: (theme: Theme) => set({ theme }),

      setDensity: (density: Density) => set({ density }),

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setAccentColor: (accentColor: string) => set({ accentColor }),

      toggleStageExpansion: (id: string) =>
        set((state) => ({ expandedStageId: state.expandedStageId === id ? null : id })),

      setNotificationPref: (key: keyof NotificationPrefs, value: boolean) =>
        set((state) => ({ notificationPrefs: { ...state.notificationPrefs, [key]: value } })),

      setReleasePref: (key, value) =>
        set((state) => ({ releasePrefs: { ...state.releasePrefs, [key]: value } })),

      reorderStages: (stageKeys: readonly string[]) =>
        set((state) => ({ releasePrefs: { ...state.releasePrefs, stageOrder: stageKeys } })),

      pushToast: (message: string, variant: ToastVariant = 'info') =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, variant },
          ],
        })),

      dismissToast: (id: string) =>
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
    }),
    {
      name: 'release-readiness-ui',
      partialize: (state) => ({
        theme: state.theme,
        density: state.density,
        sidebarCollapsed: state.sidebarCollapsed,
        accentColor: state.accentColor,
        notificationPrefs: state.notificationPrefs,
        releasePrefs: state.releasePrefs,
      }),
    },
  ),
);
