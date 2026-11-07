import React from 'react';
import { useAuth } from '../utils/authContext';
import { useTheme } from '../utils/themeContext';
import { Lock, ShieldAlert, Sparkles, Send, CheckCircle2, Clock } from 'lucide-react';

export default function PaywallGate() {
  const { prices, currentUser, OWNER_USERNAME, userAccessStatus, approveUser } = useAuth();
  const { currentTheme } = useTheme();

  const tgLink = `https://t.me/${OWNER_USERNAME}?text=${encodeURIComponent(
    `Assalomu alaykum! Men EduHujjat AI tizimidan to'liq foydalanish uchun obuna bo'lmoqchiman.\nIsmim: ${currentUser?.first_name || 'Foydalanuvchi'}\nID: ${currentUser?.id || 'Noma\'lum'}\nUsername: @${currentUser?.username || 'yo\'q'}`
  )}`;

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Yuqori neon bezak */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />

        {/* Qulf ikonkasi */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 shadow-inner animate-pulse">
          <Lock className="w-10 h-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-3">
          <Clock className="w-3.5 h-3.5" />
          Ruxsat kutilmoqda (Yopiq tizim)
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          Tizimdan foydalanish uchun ruxsat talab qilinadi
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
          Assalomu alaykum, <b>{currentUser?.first_name || 'Foydalanuvchi'}</b>! EduHujjat AI — maktablar, o'qituvchilar va muassasalar uchun professional yopiq tizim. Sizning hisobingiz administrator tomonidan tasdiqlanishi kerak.
        </p>

        {/* Tariflar jadvali */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
          {/* Kunlik */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-amber-400 transition">
            <div className="text-xs font-semibold text-slate-500 uppercase">1 Kunlik Test</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {prices.daily.toLocaleString()} <span className="text-xs font-normal text-slate-400">so'm</span>
            </div>
            <ul className="text-[11px] text-slate-500 mt-3 space-y-1">
              <li>✓ Barcha Word/Excel vositalari</li>
              <li>✓ 1 kun to'liq foydalanish</li>
            </ul>
          </div>

          {/* Haftalik */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 transition">
            <div className="text-xs font-semibold text-indigo-500 uppercase">1 Haftalik</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {prices.weekly.toLocaleString()} <span className="text-xs font-normal text-slate-400">so'm</span>
            </div>
            <ul className="text-[11px] text-slate-500 mt-3 space-y-1">
              <li>✓ Barcha modullar + Slaydlar</li>
              <li>✓ 7 kunlik cheksiz kirish</li>
            </ul>
          </div>

          {/* Oylik (Tavsiya) */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border-2 border-indigo-500 relative">
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-600 text-white">
              Tavsiya
            </span>
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">1 Oylik Pro</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {prices.monthly.toLocaleString()} <span className="text-xs font-normal text-slate-400">so'm</span>
            </div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 mt-3 space-y-1">
              <li>✓ 30 kun to'liq erkinlik</li>
              <li>✓ Prioritet yordam & QR-kodlar</li>
            </ul>
          </div>
        </div>

        {/* Ownerga murojaat qilish tugmasi */}
        <div className="space-y-3">
          <a
            href={tgLink}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-700 hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition"
          >
            <Send className="w-4 h-4" />
            Boshqaruvchi (@{OWNER_USERNAME}) ga ruxsat so'rab yozish
          </a>

          <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            To'lov qilinganidan so'ng ruxsat 1 daqiqa ichida faollashtiriladi.
          </div>
        </div>
      </div>
    </div>
  );
}
