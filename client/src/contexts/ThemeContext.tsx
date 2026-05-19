import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ThemePreset {
  id: string;
  name: string;
  accent: string;      // primary accent hex
  accentRgb: string;   // for CSS custom properties
  bg: string;          // body bg
  cardBg: string;      // card background
  gradientA: string;   // radial gradient color A
  gradientB: string;   // radial gradient color B
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'indigo',
    name: 'Indigo Night',
    accent: '#4f46e5',
    accentRgb: '79, 70, 229',
    bg: '#09090b',
    cardBg: 'rgba(24, 24, 27, 0.4)',
    gradientA: 'rgba(79, 70, 229, 0.08)',
    gradientB: 'rgba(236, 72, 153, 0.08)',
  },
  {
    id: 'emerald',
    name: 'Emerald Pulse',
    accent: '#10b981',
    accentRgb: '16, 185, 129',
    bg: '#0a0f0d',
    cardBg: 'rgba(20, 30, 25, 0.4)',
    gradientA: 'rgba(16, 185, 129, 0.1)',
    gradientB: 'rgba(6, 182, 212, 0.08)',
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    accent: '#e11d48',
    accentRgb: '225, 29, 72',
    bg: '#0c0608',
    cardBg: 'rgba(30, 15, 20, 0.4)',
    gradientA: 'rgba(225, 29, 72, 0.08)',
    gradientB: 'rgba(251, 146, 60, 0.06)',
  },
  {
    id: 'cyan',
    name: 'Cyber Frost',
    accent: '#06b6d4',
    accentRgb: '6, 182, 212',
    bg: '#070b0e',
    cardBg: 'rgba(15, 25, 35, 0.4)',
    gradientA: 'rgba(6, 182, 212, 0.1)',
    gradientB: 'rgba(139, 92, 246, 0.06)',
  },
  {
    id: 'amber',
    name: 'Golden Horizon',
    accent: '#f59e0b',
    accentRgb: '245, 158, 11',
    bg: '#0b0900',
    cardBg: 'rgba(30, 25, 10, 0.4)',
    gradientA: 'rgba(245, 158, 11, 0.08)',
    gradientB: 'rgba(239, 68, 68, 0.06)',
  },
  {
    id: 'violet',
    name: 'Nebula Drift',
    accent: '#8b5cf6',
    accentRgb: '139, 92, 246',
    bg: '#080510',
    cardBg: 'rgba(20, 15, 35, 0.4)',
    gradientA: 'rgba(139, 92, 246, 0.1)',
    gradientB: 'rgba(236, 72, 153, 0.08)',
  },
];

interface ThemeContextType {
  currentTheme: ThemePreset;
  setTheme: (id: string) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDOM(theme: ThemePreset, isDark: boolean) {
  const root = document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
    root.style.setProperty('--primary', theme.accent);
    root.style.setProperty('--ring', theme.accent);
    root.style.setProperty('--background', theme.bg);
    root.style.setProperty('--card', theme.cardBg);
    root.style.setProperty('--accent', `rgba(${theme.accentRgb}, 0.2)`);
    document.body.style.backgroundImage = `
      radial-gradient(circle at 15% 50%, ${theme.gradientA}, transparent 25%),
      radial-gradient(circle at 85% 30%, ${theme.gradientB}, transparent 25%)
    `;
    document.body.style.backgroundColor = theme.bg;
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--primary', theme.accent);
    root.style.setProperty('--ring', theme.accent);
    root.style.removeProperty('--background');
    root.style.removeProperty('--card');
    root.style.removeProperty('--accent');
    document.body.style.backgroundImage = `
      radial-gradient(circle at 15% 50%, ${theme.gradientA}, transparent 25%),
      radial-gradient(circle at 85% 30%, ${theme.gradientB}, transparent 25%)
    `;
    document.body.style.backgroundColor = '';
  }

  // Set the CSS color for all accent-colored elements  
  root.style.setProperty('--color-primary', theme.accent);
  root.style.setProperty('--primary-rgb', theme.accentRgb);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [currentTheme, setCurrentTheme] = useState<ThemePreset>(() => {
    const stored = localStorage.getItem('openllm_theme_preset');
    return THEME_PRESETS.find(t => t.id === stored) ?? THEME_PRESETS[0];
  });

  useEffect(() => {
    applyThemeToDOM(currentTheme, isDark);
  }, [currentTheme, isDark]);

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const setTheme = useCallback((id: string) => {
    const theme = THEME_PRESETS.find(t => t.id === id);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('openllm_theme_preset', id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
