import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          return { theme: next };
        }),
      initTheme: () =>
        set((state) => {
          document.documentElement.setAttribute('data-theme', state.theme);
          return state;
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
