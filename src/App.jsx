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
import DocumentEditorModule from './components/DocumentEditorModule';
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
  UserCog,
  FileEdit,
  User,
  ChevronDown,
  Smartphone,
  ShieldCheck,
  AlertOctagon,
  Palette,
  Check
} from 'lucide-react';

function MainAppContent() {
  const [lang, setLang] = useState('uz');
  const [activeModule, setActiveModule] = useState('ai'); // Default to AI module!
  const [showThemePicker, setShowThemePicker] = useState(false);

  const { currentTheme, themeId, setThemeId, darkMode, setDarkMode, themes } = useTheme();
  const { 
    currentUser, 
    activeRole, 
    setActiveRole, 
    isActualOwner, 
    hasAccess, 
    accessCodeInfo,
    logoutCode,
    kickCurrentDevice,
    deviceInfo,
    OWNER_USERNAME,
    SUPER_OWNER_ID
  } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const effectiveUserId = currentUser?.id || accessCodeInfo?.userId || (isActualOwner ? SUPER_OWNER_ID : null);
  const effectiveUsername = currentUser?.username || accessCodeInfo?.username || (isActualOwner ? OWNER_USERNAME : null);
  const effectiveName = currentUser?.first_name 
    ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim()
    : (accessCodeInfo?.name || (isActualOwner ? "Fayzbek (Super Owner)" : (effectiveUserId ? `Foydalanuvchi #${effectiveUserId}` : "Mehmon")));

  const t = translations[lang] || translations.uz;
  const isAccessible = hasAccess();

  // Telegram Mini App kengaytirish va to'liq ekranga moslash
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      }
    } catch (e) {}
  }, []);

  const navItems = [
    { id: 'ai', label: "🤖 EduAI Yordamchi", icon: Bot, color: 'text-indigo-400 font-bold' },
    { id: 'doc_editor', label: "⚡ AI Fayl & Hujjat Tahrirchisi", icon: FileEdit, color: 'text-purple-500 font-bold' },
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
    <div className={`min-h-screen ${darkMode ? currentTheme.bgDark : currentTheme.bgLight} text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
      {/* Yuqori Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${darkMode ? currentTheme.headerDark : currentTheme.headerLight} border-b shadow-sm`} style={{ borderBottomColor: 'var(--border-color)' }}>
        {/* Dynamic theme accent line at the very top */}
        <div className="h-1 w-full shrink-0" style={{ background: 'var(--primary-gradient)' }} />
        
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1 sm:gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-lg sm:text-xl shrink-0">
              E
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-transparent">
                  EduHujjat
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase hidden xs:inline-block">
                  {activeRole}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                SmartOffice & EduAI Pro • Owner: @{OWNER_USERNAME}
              </p>
            </div>
          </div>

          {/* O'ng tomon sozlamalar va Telegram Profil Boshqaruvi */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Telegram Akkaunt & Foydalanuvchi ID Badge */}
            {isAccessible && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500/50 transition cursor-pointer text-left shadow-sm"
                  title="Telegram Profil va Sessiya Boshqaruvi"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                    {effectiveUsername ? effectiveUsername[0].toUpperCase() : (effectiveName ? effectiveName[0].toUpperCase() : 'U')}
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[80px] sm:max-w-[120px]">
                        {effectiveUsername ? `@${effectiveUsername}` : effectiveName}
                      </span>
                      {isActualOwner && (
                        <span className="text-[8px] px-1 py-0.2 bg-amber-400 text-slate-950 font-black rounded hidden xs:inline-block">
                          OWNER
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      ID: <strong className="text-indigo-500 dark:text-indigo-400">{effectiveUserId || '—'}</strong>
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu / Owner Boshqaruv Popover */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-20px)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md">
                        {effectiveUsername ? effectiveUsername[0].toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {effectiveName}
                        </div>
                        <div className="text-xs text-sky-500 font-medium">
                          {effectiveUsername ? `@${effectiveUsername}` : 'Telegram profil'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Telegram ID:</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-indigo-500">
                            {effectiveUserId || 'Noma\'lum'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-emerald-500" /> Faol Kod:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {accessCodeInfo?.code || '1331 (Master)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-slate-400" /> Qurilma:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                          {deviceInfo}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-sky-500" /> Holat:</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                          Avtorizatsiyadan o'tgan
                        </span>
                      </div>

                      {/* Dizayn Mavzusi */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200"><Palette className="w-3.5 h-3.5 text-indigo-500" /> Mavzu:</span>
                        <select
                          value={themeId}
                          onChange={(e) => setThemeId(e.target.value)}
                          className="bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-1.5 border-2 border-slate-300 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[150px] truncate"
                        >
                          {Object.values(themes).map(th => (
                            <option key={th.id} value={th.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1">{th.emoji} {th.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Til Tanlash */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-sky-500" /> Til:</span>
                        <select
                          value={lang}
                          onChange={(e) => setLang(e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 border-none focus:outline-none cursor-pointer"
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

                      {/* Owner uchun Role almashtirish */}
                      {isActualOwner && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><UserCog className="w-3.5 h-3.5 text-amber-500" /> Rol:</span>
                          <select
                            value={activeRole}
                            onChange={(e) => setActiveRole(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 border-none focus:outline-none cursor-pointer"
                          >
                            <option value="OWNER">👑 Owner</option>
                            <option value="ADMIN">🛡️ Admin</option>
                            <option value="INSPECTOR">🔍 Tekshiruvchi</option>
                            <option value="USER">👤 Oddiy (Yopiq)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Owner yoki Admin Boshqaruv Tugmalari */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      {isActualOwner && (
                        <>
                          <button
                            onClick={() => {
                              setActiveModule('admin_panel');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs transition"
                          >
                            <Crown className="w-4 h-4" />
                            <span>👑 Boshqaruv Markazi (Super Panel)</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveModule('admin_panel');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-bold text-xs transition"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>🔍 Foydalanuvchi Audit Tarixi (100 ta)</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          if (confirm("Ushbu qurilma sessiyasi darhol bekor qilinsinmi (Kick)?")) {
                            await kickCurrentDevice();
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold text-xs transition"
                      >
                        <AlertOctagon className="w-4 h-4" />
                        <span>🚫 Ushbu Qurilmani Chiqarish (Kick)</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logoutCode();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>🔒 Sessiyadan Chiqish</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chiqish tugmasi (Katta ekranlar uchun) */}
            {isAccessible && (
              <button
                onClick={logoutCode}
                className="hidden sm:flex px-2 sm:px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold items-center gap-1 transition"
                title="Kodni bekor qilish / Boshqa kod kiritish"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Chiqish</span>
              </button>
            )}

            {/* Role Simulator (Katta ekranlar uchun) */}
            {isActualOwner && (
              <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
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

            {/* Rangli Mavzular (Visual Theme Picker - Telefon va Katta Ekranlar) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowThemePicker(!showThemePicker);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/95 border-2 shadow-sm text-xs font-bold text-slate-900 dark:text-slate-100 transition cursor-pointer hover:shadow-md"
                style={{ borderColor: 'var(--border-color)' }}
                title="Dizayn va Rang Mavzusini Tanlash"
              >
                <span className="text-sm shrink-0">{currentTheme.emoji}</span>
                {/* 2-rangli gradient ko'rinishi */}
                <div 
                  className="w-5 h-2.5 sm:w-6 sm:h-3 rounded-full border border-black/20 shadow-inner shrink-0" 
                  style={{ background: `linear-gradient(135deg, ${currentTheme.colors?.[0] || '#6366f1'}, ${currentTheme.colors?.[1] || '#38bdf8'})` }} 
                />
                <span className="hidden md:inline max-w-[110px] truncate font-extrabold">{currentTheme.name}</span>
                <span className="text-[10px] font-black uppercase px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hidden sm:inline">
                  Mavzu
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showThemePicker ? 'rotate-180' : ''}`} />
              </button>

              {showThemePicker && (
                <div 
                  className="absolute right-0 mt-2 w-72 sm:w-84 rounded-2xl bg-white dark:bg-slate-900 border-2 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 max-h-[82vh] overflow-y-auto"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--primary-gradient)' }}>
                        <Palette className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          Dizayn Mavzulari ({Object.keys(themes).length} ta)
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Ranglar va kontrastni almashtirish
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Tezkor Dark / Light almashtirish tugmasi */}
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                        title="Yorug'lik / Qorong'ulik rejimini almashtirish"
                      >
                        {darkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-slate-600" />}
                        <span>{darkMode ? "Dark" : "Light"}</span>
                      </button>

                      <button
                        onClick={() => setShowThemePicker(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {Object.values(themes).map(th => {
                      const isSelected = themeId === th.id;
                      return (
                        <button
                          key={th.id}
                          onClick={() => {
                            setThemeId(th.id);
                            setShowThemePicker(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between border-2 cursor-pointer ${
                            isSelected
                              ? 'bg-slate-50 dark:bg-slate-800/80 shadow-md ring-2 ring-indigo-500/30 font-black'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          }`}
                          style={{
                            borderColor: isSelected ? 'var(--border-color)' : (darkMode ? '#334155' : '#cbd5e1')
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Katta va aniq 2-rangli gradient palitrasi */}
                            <div 
                              className="w-8 h-8 rounded-xl shadow-md border-2 border-white dark:border-slate-800 flex items-center justify-center text-sm shrink-0"
                              style={{ background: `linear-gradient(135deg, ${th.colors?.[0] || '#6366f1'}, ${th.colors?.[1] || '#38bdf8'})` }}
                            >
                              <span>{th.emoji}</span>
                            </div>

                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                {th.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                                  style={{ backgroundColor: th.colors?.[0] }}
                                />
                                <span 
                                  className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                                  style={{ backgroundColor: th.colors?.[1] }}
                                />
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                  {th.colors?.[0]}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: 'var(--primary-gradient)' }}>
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Til (Katta ekranlar uchun) */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-none focus:outline-none pr-1 cursor-pointer"
              >
                <option value="uz">O'zbek (Lotin)</option>
                <option value="uz_cyrl">Ўзбек (Кирилл)</option>
                <option value="kaa">Qaraqalpaqsha</option>
                <option value="kz">Қазақsha</option>
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
                  style={isActive ? { background: 'var(--primary-gradient)', boxShadow: '0 4px 14px 0 var(--active-glow)' } : {}}
                  className={`px-3 sm:px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'text-white scale-105 transition-transform font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
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
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 w-full max-w-full">
        {!isAccessible ? (
          <PaywallGate />
        ) : (
          <>
            {activeModule === 'admin_panel' && <AdminSuperPanel />}
            {activeModule === 'ai' && <EduAIModule />}
            {activeModule === 'doc_editor' && <DocumentEditorModule t={t} lang={lang} />}
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
