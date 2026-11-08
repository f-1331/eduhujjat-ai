import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './utils/themeContext';
import { AuthProvider, useAuth } from './utils/authContext';
import { translations } from './locales/translations';
import CleanerModule from './components/CleanerModule';
import ExcelModule from './components/ExcelModule';
import PowerPointModule from './components/PowerPointModule';
import WordModule from './components/WordModule';
import TextToolsModule from './components/TextToolsModule';
import CertificateModule from './components/CertificateModule';
import OrdersAndContractsModule from './components/OrdersAndContractsModule';
import ExamAnalyticsModule from './components/ExamAnalyticsModule';
import AdminSuperPanel from './components/AdminSuperPanel';
import PaywallGate from './components/PaywallGate';
import EduAIModule from './components/EduAIModule';
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
  FileBadge2,
  BarChart3,
  Bot,
  Crown,
  KeyRound,
  LogOut,
  UserCog
} from 'lucide-react';

function MainAppContent() {
  const [lang, setLang] = useState('uz');
  const [activeModule, setActiveModule] = useState('ai'); // Default to AI module!

  const { currentTheme, themeId, setThemeId, darkMode, setDarkMode, themes } = useTheme();
  const { 
    currentUser, 
    activeRole, 
    setActiveRole, 
    isActualOwner, 
    hasAccess, 
    accessCodeInfo,
    logoutCode,
    OWNER_USERNAME 
  } = useAuth();

  const t = translations[lang] || translations.uz;
  const isAccessible = hasAccess();

  const navItems = [
    { id: 'ai', label: "🤖 EduAI Yordamchi", icon: Bot, color: 'text-indigo-400 font-bold' },
    { id: 'cleaner', label: t.modules.cleaner, icon: Sparkles, color: 'text-indigo-500' },
    { id: 'excel', label: t.modules.excel, icon: FileSpreadsheet, color: 'text-emerald-500' },
    { id: 'powerpoint', label: "🎨 Gamma AI Slayd", icon: Presentation, color: 'text-sky-500 font-bold' },
    { id: 'word', label: t.modules.word, icon: FileText, color: 'text-blue-500' },
    { id: 'orders', label: "Maktab Buyruqlari & Shartnoma", icon: FileBadge2, color: 'text-rose-500' },
    { id: 'analytics', label: "Test Diagnostika & Tahlil", icon: BarChart3, color: 'text-cyan-500' },
    { id: 'textTools', label: t.modules.textTools, icon: Languages, color: 'text-purple-500' },
    { id: 'certificate', label: t.modules.certificate, icon: Award, color: 'text-amber-500' },
  ];

  if (isActualOwner) {
    navItems.unshift({
      id: 'admin_panel',
      label: "👑 Boshqaruv Markazi",
      icon: Crown,
      color: 'text-amber-400 font-bold'
    });
  }

  return (
    <div className={`min-h-screen ${currentTheme.bgLight} ${currentTheme.bgDark} text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
      {/* Yuqori Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${currentTheme.cardLight}/85 ${currentTheme.cardDark}/85 border-b border-slate-200 dark:border-slate-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-xl">
              E
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-transparent">
                  EduHujjat AI
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase">
                  {activeRole}
                </span>
                {accessCodeInfo && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                    Kod: {accessCodeInfo.code}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                SmartOffice & EduAI Pro • Owner: @{OWNER_USERNAME}
              </p>
            </div>
          </div>

          {/* O'ng tomon sozlamalar */}
          <div className="flex items-center gap-2">
            {/* Kod bilan kirgan bo'lsa Chiqish tugmasi */}
            {accessCodeInfo && (
              <button
                onClick={logoutCode}
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1 transition"
                title="Kodni bekor qilish / Chiqish"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chiqish</span>
              </button>
            )}

            {/* Role Simulator */}
            {isActualOwner && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <UserCog className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 border-none focus:outline-none cursor-pointer"
                  title="Rejimni o'zgartirib sinash"
                >
                  <option value="OWNER">👑 Owner</option>
                  <option value="ADMIN">🛡️ Admin</option>
                  <option value="INSPECTOR">🔍 Tekshiruvchi</option>
                  <option value="USER">👤 Oddiy (Yopiq)</option>
                </select>
              </div>
            )}

            {/* Mavzu */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-none focus:outline-none pr-1 cursor-pointer"
                title="Dizayn Mavzusi"
              >
                {Object.values(themes).map(th => (
                  <option key={th.id} value={th.id}>{th.name}</option>
                ))}
              </select>
            </div>

            {/* Til */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-none focus:outline-none pr-1 cursor-pointer"
              >
                <option value="uz">O'zbek (Lotin)</option>
                <option value="uz_cyrl">Ўзбек (Кирилл)</option>
                <option value="kaa">Qaraqalpaqsha</option>
                <option value="kz">Қазақша</option>
                <option value="ru">Русский</option>
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Dark / Light rejim"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Modullar navigatsiya paneli */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Asosiy qism */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAccessible ? (
          <PaywallGate />
        ) : (
          <>
            {activeModule === 'admin_panel' && <AdminSuperPanel />}
            {activeModule === 'ai' && <EduAIModule />}
            {activeModule === 'cleaner' && <CleanerModule t={t} lang={lang} />}
            {activeModule === 'excel' && <ExcelModule t={t} />}
            {activeModule === 'powerpoint' && <PowerPointModule t={t} />}
            {activeModule === 'word' && <WordModule t={t} />}
            {activeModule === 'orders' && <OrdersAndContractsModule />}
            {activeModule === 'analytics' && <ExamAnalyticsModule />}
            {activeModule === 'textTools' && <TextToolsModule t={t} />}
            {activeModule === 'certificate' && <CertificateModule t={t} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduHujjat AI &copy; 2026. Barcha huquqlar himoyalangan.</span>
          <div className="flex items-center gap-3">
            <span className="text-indigo-500 font-semibold">Tizim Egasi (Owner): @{OWNER_USERNAME}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
