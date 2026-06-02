import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
    toggle: () => void;
    set: (mode: ThemeMode) => void;
}

const applyDom = (mode: ThemeMode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
}

export const useThemeStore = create<ThemeState>()(
    devtools(
        persist
        (
            (set, get) => ({
                mode: 'light',
                toggle: ()  => {
                    const next: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
                    applyDom(next);
                    set({ mode: next });
                },
                set: (mode) => {
                    applyDom(mode);
                    set({ mode });
                },
            }),
            {
                name: 'employee-manager:theme',
                partialize: (s) => ({ mode: s.mode }), // don't persist actions
                onRehydrateStorage: () => (state) => {
                    // Apply the DOM class right after rehydration.
                    if (state) applyDom(state.mode);
                },
            }
        ),
        {
            name: 'ThemeStore',
        } 
    ),
);