import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

// Apply immediately on module load to prevent flash
(() => {
  try {
    const raw = localStorage.getItem('hr-theme');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.isDark) applyTheme(true);
    }
  } catch { /* ignore */ }
})();

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () =>
        set((s) => {
          const next = !s.isDark;
          applyTheme(next);
          return { isDark: next };
        }),
    }),
    {
      name: 'hr-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.isDark);
      },
    },
  ),
);
