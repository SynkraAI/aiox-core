import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';

export interface DashboardSettings {
  // Appearance
  theme: Theme;

  // Data
  useMockData: boolean; // Toggle for mock data visualization
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  storiesPath: string;

  // Agent colors
  agentColors: Record<string, string>;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  theme: 'dark',
  useMockData: true, // Demo mode: Use mock data for visualization
  autoRefresh: true,
  refreshInterval: 30,
  storiesPath: 'docs/stories',
  agentColors: {
    dev: '#22c55e',
    qa: '#eab308',
    architect: '#8b5cf6',
    pm: '#3b82f6',
    po: '#f97316',
    analyst: '#06b6d4',
    devops: '#ec4899',
  },
};

interface SettingsState {
  settings: DashboardSettings;

  // Actions
  updateSettings: (updates: Partial<DashboardSettings>) => void;
  setTheme: (theme: Theme) => void;
  setUseMockData: (enabled: boolean) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (seconds: number) => void;
  setStoriesPath: (path: string) => void;
  setAgentColor: (agentId: string, color: string) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),

      setUseMockData: (useMockData) =>
        set((state) => ({
          settings: { ...state.settings, useMockData },
        })),

      setAutoRefresh: (autoRefresh) =>
        set((state) => ({
          settings: { ...state.settings, autoRefresh },
        })),

      setRefreshInterval: (refreshInterval) =>
        set((state) => ({
          settings: { ...state.settings, refreshInterval },
        })),

      setStoriesPath: (storiesPath) =>
        set((state) => ({
          settings: { ...state.settings, storiesPath },
        })),

      setAgentColor: (agentId, color) =>
        set((state) => ({
          settings: {
            ...state.settings,
            agentColors: {
              ...state.settings.agentColors,
              [agentId]: color,
            },
          },
        })),

      resetToDefaults: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'aios-dashboard-settings-v2', // v2: Demo mode enabled by default
    }
  )
);
