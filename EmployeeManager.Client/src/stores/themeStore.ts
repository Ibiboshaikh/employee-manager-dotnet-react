import { create } from "zustand";

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
    toggle: () => void;
    set: (mode: ThemeMode) => void;
}

const initialMode: ThemeMode = typeof window !== 'undefined' 
    && window.localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';

const applyDom = (mode: ThemeMode) => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('theme', mode);
}

export const useThemeStore = create<ThemeState>((set) => ({
    mode: initialMode,
    toggle: () => set((s) => {
        const next: ThemeMode = s.mode === 'light' ? 'dark' : 'light';
        applyDom(next);
        return { mode: next };
    }),
    set: (mode)=>{
        applyDom(mode);
        set({ mode });
    },
}));