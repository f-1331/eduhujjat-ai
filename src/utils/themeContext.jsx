import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  indigo: {
    id: 'indigo',
    name: 'Indigo Sapphire',
    emoji: '💎',
    colors: ['#4f46e5', '#38bdf8'],
    bgLight: 'bg-gradient-to-br from-indigo-100/90 via-slate-50 to-sky-100/70',
    bgDark: 'dark:bg-slate-950',
    headerLight: 'bg-white/95 border-b-2 border-indigo-500 shadow-sm shadow-indigo-500/10',
    headerDark: 'dark:bg-slate-900/90 dark:border-slate-800',
    cardLight: 'bg-white/95 border border-indigo-200 shadow-sm',
    cardDark: 'dark:bg-slate-900',
    navActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30',
    primaryBtn: 'bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white font-bold',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-300 dark:border-indigo-900',
    ring: 'focus:ring-indigo-500',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    emoji: '🌲',
    colors: ['#059669', '#10b981'],
    bgLight: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-green-100/80',
    bgDark: 'dark:bg-slate-950',
    headerLight: 'bg-white/95 border-b-2 border-emerald-500 shadow-sm shadow-emerald-500/10',
    headerDark: 'dark:bg-slate-900/90 dark:border-slate-800',
    cardLight: 'bg-white/95 border border-emerald-200 shadow-sm',
    cardDark: 'dark:bg-slate-900',
    navActive: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30',
    primaryBtn: 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-900',
    ring: 'focus:ring-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  },
  rose: {
    id: 'rose',
    name: 'Sunset Rose',
    emoji: '🌅',
    colors: ['#e11d48', '#f97316'],
    bgLight: 'bg-gradient-to-br from-rose-100/90 via-orange-50/70 to-pink-100/80',
    bgDark: 'dark:bg-slate-950',
    headerLight: 'bg-white/95 border-b-2 border-rose-500 shadow-sm shadow-rose-500/10',
    headerDark: 'dark:bg-slate-900/90 dark:border-slate-800',
    cardLight: 'bg-white/95 border border-rose-200 shadow-sm',
    cardDark: 'dark:bg-slate-900',
    navActive: 'bg-rose-600 text-white shadow-md shadow-rose-500/30',
    primaryBtn: 'bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 hover:opacity-95 text-white font-bold',
    accentText: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-900',
    ring: 'focus:ring-rose-500',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon 2077',
    emoji: '⚡',
    colors: ['#06b6d4', '#ec4899'],
    bgLight: 'bg-gradient-to-br from-cyan-100/90 via-purple-100/70 to-fuchsia-100/90',
    bgDark: 'dark:bg-[#070913]',
    headerLight: 'bg-white/95 border-b-2 border-cyan-500 shadow-md shadow-cyan-500/20',
    headerDark: 'dark:bg-[#0e1322]/90 dark:border-cyan-500/30',
    cardLight: 'bg-white/95 border-2 border-cyan-300 shadow-sm shadow-cyan-500/10',
    cardDark: 'dark:bg-[#0e1322]',
    navActive: 'bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-pink-600 text-white shadow-md shadow-cyan-500/30',
    primaryBtn: 'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 hover:opacity-90 text-white font-black',
    accentText: 'text-cyan-600 dark:text-cyan-400 font-extrabold',
    border: 'border-cyan-400 dark:border-cyan-500/40',
    ring: 'focus:ring-cyan-500',
    badge: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/50'
  },
  navy: {
    id: 'navy',
    name: 'Royal Navy & Gold',
    emoji: '👑',
    colors: ['#1e3a8a', '#eab308'],
    bgLight: 'bg-gradient-to-br from-amber-100/90 via-sky-50/60 to-blue-100/80',
    bgDark: 'dark:bg-[#070f26]',
    headerLight: 'bg-white/95 border-b-2 border-amber-500 shadow-sm shadow-amber-500/15',
    headerDark: 'dark:bg-[#0b173d]/90 dark:border-amber-400/30',
    cardLight: 'bg-white/95 border-2 border-amber-300 shadow-sm shadow-amber-500/10',
    cardDark: 'dark:bg-[#0b173d]',
    navActive: 'bg-gradient-to-r from-blue-950 to-slate-900 text-amber-300 border border-amber-400 shadow-md shadow-amber-500/20',
    primaryBtn: 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black shadow-md',
    accentText: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-400/60 dark:border-amber-400/40',
    ring: 'focus:ring-amber-500',
    badge: 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
  },
  amethyst: {
    id: 'amethyst',
    name: 'Dark Amethyst',
    emoji: '🔮',
    colors: ['#7c3aed', '#a855f7'],
    bgLight: 'bg-gradient-to-br from-purple-100/90 via-violet-50/70 to-fuchsia-100/80',
    bgDark: 'dark:bg-[#0d071a]',
    headerLight: 'bg-white/95 border-b-2 border-purple-500 shadow-sm shadow-purple-500/10',
    headerDark: 'dark:bg-[#170e2e]/90 dark:border-purple-800',
    cardLight: 'bg-white/95 border border-purple-200 shadow-sm',
    cardDark: 'dark:bg-[#170e2e]',
    navActive: 'bg-purple-600 text-white shadow-md shadow-purple-500/30',
    primaryBtn: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold',
    accentText: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-800',
    ring: 'focus:ring-purple-500',
    badge: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
  },
  ruby: {
    id: 'ruby',
    name: 'Crimson Ruby',
    emoji: '🔴',
    colors: ['#dc2626', '#b91c1c'],
    bgLight: 'bg-gradient-to-br from-red-100/90 via-rose-50/70 to-orange-100/80',
    bgDark: 'dark:bg-[#120507]',
    headerLight: 'bg-white/95 border-b-2 border-red-500 shadow-sm shadow-red-500/10',
    headerDark: 'dark:bg-[#200a0d]/90 dark:border-red-900',
    cardLight: 'bg-white/95 border border-red-200 shadow-sm',
    cardDark: 'dark:bg-[#200a0d]',
    navActive: 'bg-red-600 text-white shadow-md shadow-red-500/30',
    primaryBtn: 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold',
    accentText: 'text-red-600 dark:text-red-400',
    border: 'border-red-300 dark:border-red-900',
    ring: 'focus:ring-red-500',
    badge: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300'
  },
  frost: {
    id: 'frost',
    name: 'Nordic Frost',
    emoji: '❄️',
    colors: ['#0ea5e9', '#38bdf8'],
    bgLight: 'bg-gradient-to-br from-sky-100/95 via-cyan-50/70 to-blue-100/90',
    bgDark: 'dark:bg-[#07131e]',
    headerLight: 'bg-white/95 border-b-2 border-sky-500 shadow-sm shadow-sky-500/10',
    headerDark: 'dark:bg-[#0d2135]/90 dark:border-sky-800',
    cardLight: 'bg-white/95 border border-sky-200 shadow-sm',
    cardDark: 'dark:bg-[#0d2135]',
    navActive: 'bg-sky-600 text-white shadow-md shadow-sky-500/30',
    primaryBtn: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold',
    accentText: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-300 dark:border-sky-800',
    ring: 'focus:ring-sky-500',
    badge: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300'
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo Midnight',
    emoji: '🌸',
    colors: ['#ec4899', '#8b5cf6'],
    bgLight: 'bg-gradient-to-br from-pink-100/90 via-purple-50/70 to-indigo-100/80',
    bgDark: 'dark:bg-[#0b0c16]',
    headerLight: 'bg-white/95 border-b-2 border-pink-500 shadow-sm shadow-pink-500/10',
    headerDark: 'dark:bg-[#151728]/90 dark:border-pink-500/30',
    cardLight: 'bg-white/95 border border-pink-200 shadow-sm',
    cardDark: 'dark:bg-[#151728]',
    navActive: 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-pink-500/30',
    primaryBtn: 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold',
    accentText: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-300 dark:border-pink-500/40',
    ring: 'focus:ring-pink-500',
    badge: 'bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-300 border border-pink-300'
  },
  minimal: {
    id: 'minimal',
    name: 'Clean Minimal Slate',
    emoji: '🖤',
    colors: ['#334155', '#64748b'],
    bgLight: 'bg-gradient-to-br from-slate-200/95 via-zinc-100 to-slate-100',
    bgDark: 'dark:bg-[#111318]',
    headerLight: 'bg-white/95 border-b-2 border-slate-600 shadow-sm',
    headerDark: 'dark:bg-[#1b1e24]/90 dark:border-slate-700',
    cardLight: 'bg-white/95 border border-slate-300 shadow-sm',
    cardDark: 'dark:bg-[#1b1e24]',
    navActive: 'bg-slate-900 text-white shadow-md',
    primaryBtn: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold',
    accentText: 'text-slate-900 dark:text-slate-100',
    border: 'border-slate-400 dark:border-slate-700',
    ring: 'focus:ring-slate-500',
    badge: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('eduhujjat_theme') || 'indigo');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('eduhujjat_dark');
    return saved !== null ? saved === 'true' : true; // Default to dark mode for gorgeous look
  });

  useEffect(() => {
    localStorage.setItem('eduhujjat_theme', themeId);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
      document.body.setAttribute('data-theme', themeId);
    }
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_dark', darkMode);
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, [darkMode]);

  // Initial mount sync
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
      document.body.setAttribute('data-theme', themeId);
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, []);

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
