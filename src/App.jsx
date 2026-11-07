import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { translations } from './locales/translations';
import CleanerModule from './components/CleanerModule';
import ExcelModule from './components/ExcelModule';
import PowerPointModule from './components/PowerPointModule';
import WordModule from './components/WordModule';
import TextToolsModule from './components/TextToolsModule';
import CertificateModule from './components/CertificateModule';
import { 
  Sparkles, 
  FileSpreadsheet, 
  Presentation, 
  FileText, 
  Languages, 
  Award, 
  Moon, 
  Sun, 
  Globe, 
  Send,
  User,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('uz'); // 'uz', 'uz_cyrl', 'ru', 'en'
  const [darkMode, setDarkMode] = useState(false);
  const [activeModule, setActiveModule] = useState('cleaner');
  const [tgUser, setTgUser] = useState(null);

  const t = translations[lang] || translations.uz;

  // Telegram WebApp initializatsiyasi
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        WebApp.ready();
        WebApp.expand();
        const user = WebApp.initDataUnsafe?.user;
        if (user) {
          setTgUser(user);
        }
      }
    } catch (e) {
      console.log("Telegram WebApp muhiti emas:", e);
    }
  }, []);

  // Dark mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navItems = [
    { id: 'cleaner', label: t.modules.cleaner, icon: Sparkles, color: 'text-indigo-500' },
    { id: 'excel', label: t.modules.excel, icon: FileSpreadsheet, color: 'text-emerald-500' },
    { id: 'powerpoint', label: t.modules.powerpoint, icon: Presentation, color: 'text-sky-500' },
    { id: 'word', label: t.modules.word, icon: FileText, color: 'text-blue-500' },
    { id: 'textTools', label: t.modules.textTools, icon: Languages, color: 'text-purple-500' },
    { id: 'certificate', label: t.modules.certificate, icon: Award, color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Yuqori Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-xl">
              E
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                  EduHujjat AI
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                SmartOffice & EduAI Platform
              </p>
            </div>
          </div>

          {/* Telegram User (agar WebApp orqali kirgan bo'lsa) */}
          {tgUser && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-sky-50 dark:bg-sky-950/60 rounded-full border border-sky-200 dark:border-sky-800">
              <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                {tgUser.first_name?.[0] || 'U'}
              </div>
              <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                {tgUser.first_name} {tgUser.last_name || ''}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            </div>
          )}

          {/* Sozlamalar: Til va Dark Mode */}
          <div className="flex items-center gap-2.5">
            {/* Til tanlash */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-none focus:outline-none pr-1 cursor-pointer"
              >
                <option value="uz">O'zb (Lotin)</option>
                <option value="uz_cyrl">Ўзб (Кирилл)</option>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Dark mode tugmasi */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Dark / Light rejim"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Modullar navigatsiya paneli (Scrollable tabs) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Asosiy kontent */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeModule === 'cleaner' && <CleanerModule t={t} lang={lang} />}
        {activeModule === 'excel' && <ExcelModule t={t} />}
        {activeModule === 'powerpoint' && <PowerPointModule t={t} />}
        {activeModule === 'word' && <WordModule t={t} />}
        {activeModule === 'textTools' && <TextToolsModule t={t} />}
        {activeModule === 'certificate' && <CertificateModule t={t} />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduHujjat AI &copy; 2026. Maktablar, talabalar va ofis xodimlari uchun.</span>
          <div className="flex items-center gap-3">
            <span className="text-indigo-500 font-semibold">Telegram Bot: @eduhujjat_bot</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
