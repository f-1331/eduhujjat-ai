import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  indigo: {
    id: 'indigo',
    name: 'Indigo Sapphire',
    primary: 'indigo',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-950',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-slate-900',
    primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-900',
    ring: 'focus:ring-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    primary: 'emerald',
    bgLight: 'bg-emerald-50/40',
    bgDark: 'dark:bg-slate-950',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-slate-900',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900',
    ring: 'focus:ring-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  },
  rose: {
    id: 'rose',
    name: 'Sunset Rose',
    primary: 'rose',
    bgLight: 'bg-rose-50/30',
    bgDark: 'dark:bg-slate-950',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-slate-900',
    primaryBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
    accentText: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-900',
    ring: 'focus:ring-rose-500',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon 2077',
    primary: 'cyan',
    bgLight: 'bg-slate-100',
    bgDark: 'dark:bg-[#070913]',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-[#0e1322]',
    primaryBtn: 'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 hover:opacity-90 text-white font-bold',
    accentText: 'text-cyan-500 dark:text-cyan-400',
    border: 'border-cyan-500/40',
    ring: 'focus:ring-cyan-500',
    badge: 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
  },
  navy: {
    id: 'navy',
    name: 'Royal Navy & Gold',
    primary: 'amber',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-[#070f26]',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-[#0b173d]',
    primaryBtn: 'bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black',
    accentText: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-400/40',
    ring: 'focus:ring-amber-500',
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
  },
  amethyst: {
    id: 'amethyst',
    name: 'Dark Amethyst',
    primary: 'purple',
    bgLight: 'bg-purple-50/30',
    bgDark: 'dark:bg-[#0d071a]',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-[#170e2e]',
    primaryBtn: 'bg-purple-600 hover:bg-purple-700 text-white font-bold',
    accentText: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-800',
    ring: 'focus:ring-purple-500',
    badge: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
  },
  ruby: {
    id: 'ruby',
    name: 'Crimson Ruby',
    primary: 'red',
    bgLight: 'bg-red-50/20',
    bgDark: 'dark:bg-[#120507]',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-[#200a0d]',
    primaryBtn: 'bg-red-600 hover:bg-red-700 text-white font-bold',
    accentText: 'text-red-600 dark:text-red-400',
    border: 'border-red-300 dark:border-red-900',
    ring: 'focus:ring-red-500',
    badge: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300'
  },
  frost: {
    id: 'frost',
    name: 'Nordic Frost',
    primary: 'sky',
    bgLight: 'bg-sky-50/40',
    bgDark: 'dark:bg-[#07131e]',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-[#0d2135]',
    primaryBtn: 'bg-sky-500 hover:bg-sky-600 text-white font-bold',
    accentText: 'text-sky-500 dark:text-sky-400',
    border: 'border-sky-300 dark:border-sky-800',
    ring: 'focus:ring-sky-500',
    badge: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300'
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo Midnight',
    primary: 'pink',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-[#0b0c16]',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-[#151728]',
    primaryBtn: 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold',
    accentText: 'text-pink-500 dark:text-pink-400',
    border: 'border-pink-500/30',
    ring: 'focus:ring-pink-500',
    badge: 'bg-pink-950 text-pink-300 border border-pink-500/40'
  },
  minimal: {
    id: 'minimal',
    name: 'Clean Minimal Slate',
    primary: 'slate',
    bgLight: 'bg-slate-100',
    bgDark: 'dark:bg-[#111318]',
    cardLight: 'bg-white',
    cardDark: 'dark:bg-[#1b1e24]',
    primaryBtn: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold',
    accentText: 'text-slate-900 dark:text-slate-100',
    border: 'border-slate-300 dark:border-slate-700',
    ring: 'focus:ring-slate-500',
    badge: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('eduhujjat_theme') || 'indigo');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('eduhujjat_dark') === 'true');

  useEffect(() => {
    localStorage.setItem('eduhujjat_theme', themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_dark', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const currentTheme = THEMES[themeId] || THEMES.indigo;

  return (
    <ThemeContext.Provider value={{ currentTheme, themeId, setThemeId, darkMode, setDarkMode, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
