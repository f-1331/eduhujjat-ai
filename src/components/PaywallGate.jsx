import React, { useState } from 'react';
import { useAuth } from '../utils/authContext';
import { Lock, KeyRound, Zap, Clock, Calendar, CheckCircle2, Send, ShieldAlert, Sparkles, Check, ArrowRight, AlertCircle } from 'lucide-react';

export default function PaywallGate() {
  const { prices, currentUser, OWNER_USERNAME, verifyAccessCode } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('hourly');
  const [inputCode, setInputCode] = useState('');
  const [codeMessage, setCodeMessage] = useState(null);

  const plans = [
    {
      id: 'oneTime',
      name: "1 Martalik Hujjat",
      price: prices.oneTime,
      period: "1 ta hujjat uchun",
      badge: "Tezkor",
      icon: Zap,
      color: "border-sky-500",
      desc: "Faqat bitta faylni saralash, slayd yoki Word jadval qilish uchun"
    },
    {
      id: 'hourly',
      name: "1 Soatlik Kirish",
      price: prices.hourly,
      period: "60 daqiqa to'liq erkinlik",
      badge: "Arzon",
      icon: Clock,
      color: "border-emerald-500",
      desc: "1 soat ichida xohlagancha hujjatlar, testlar va taqdimotlar generatsiya qilish"
    },
    {
      id: 'daily',
      name: "1 Kunlik Sinov",
      price: prices.daily,
      period: "24 soat",
      badge: "Mashhur",
      icon: Calendar,
      color: "border-indigo-500",
      desc: "Kun davomida maktab yoki sinf barcha hujjatlarini to'liq tartibga solish"
    },
    {
      id: 'weekly',
      name: "1 Haftalik Obuna",
      price: prices.weekly,
      period: "7 kun",
      badge: "Foydali",
      icon: CheckCircle2,
      color: "border-purple-500",
      desc: "1 hafta davomida barcha dars ishlanmalari, jadvallar va reytinglar"
    },
    {
      id: 'monthly',
      name: "1 Oylik Standart",
      price: prices.monthly,
      period: "30 kun",
      badge: "Tavsiya",
      icon: Sparkles,
      color: "border-amber-500",
      desc: "Bir oylik davomat tabeli, buyruqlar, sertifikatlar va barcha yangi imkoniyatlar"
    },
    {
      id: 'unlimited',
      name: "Cheksiz VIP",
      price: prices.unlimited,
      period: "Cheksiz muddat",
      badge: "Premium",
      icon: ShieldAlert,
      color: "border-rose-500",
      desc: "Doimiy to'liq erkinlik, hech qanday to'lovlarsiz umrbod VIP kirish"
    }
  ];

  const currentSelected = plans.find(p => p.id === selectedPlan) || plans[1];

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = verifyAccessCode(inputCode);
    setCodeMessage(res);
  };

  const paymentMessage = `Assalomu alaykum @${OWNER_USERNAME}! Men EduHujjat AI tizimidan to'lov qilmoqchiman:\n\n` +
    `👤 Ismim: ${currentUser?.first_name || 'Foydalanuvchi'} ${currentUser?.last_name || ''}\n` +
    `🆔 Mening Telegram ID: ${currentUser?.id || 'Noma\'lum'}\n` +
    `🔗 Username: @${currentUser?.username || 'yo\'q'}\n` +
    `💳 Tanlagan tarifim: ${currentSelected.name} (${currentSelected.period})\n` +
    `💰 To'lov summasi: ${currentSelected.price.toLocaleString()} so'm\n\n` +
    `Iltimos, to'lov kartangizni yuborsangiz va to'lovdan so'ng hisobimni faollashtirib bersangiz!`;

  const tgDirectLink = `https://t.me/${OWNER_USERNAME}?text=${encodeURIComponent(paymentMessage)}`;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-emerald-500 via-indigo-500 to-amber-500" />

        {/* 1. KIRISH KODI BLOKI (BOTDAN OLINGAN KODNI KIRITISH) */}
        <div className="bg-gradient-to-r from-indigo-900/90 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-indigo-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
                  Saytga Kirish Kodingiz bormi?
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                    Tezkor Kirish
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Telegram botimiz (@eduhujjat_bot) dagi <b>"🔑 Saytga Kirish Kodi"</b> tugmasidan olingan kodni kiriting
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCodeSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Masalan: EDU-670783 yoki 1331"
              className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              Tekshirish va Kirish
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {codeMessage && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              codeMessage.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              <AlertCircle className="w-4 h-4" />
              {codeMessage.message}
            </div>
          )}
        </div>

        {/* 2. TARIF TANLASH VA BOTGA YOZISH BLOKI */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-2">
              Yopiq Tizim • Litsenziya Olish
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Agar kodingiz bo'lmasa, tarifni tanlang
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kerakli tarifni tanlab, boshqaruvchi (<b>@{OWNER_USERNAME}</b>) ga murojaat qiling va tasdiqlangandan so'ng botdan kirish kodingizni oling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {plans.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                    isSelected
                      ? `${p.color} bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md scale-[1.02]`
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {p.badge}
                      </span>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {p.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">so'm</span>
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                      {p.period}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold">
                    <span>{isSelected ? "Tanlandi ✓" : "Tanlash"}</span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="text-xs text-slate-500">Tanlangan: <b className="text-slate-900 dark:text-white">{currentSelected.name}</b> ({currentSelected.price.toLocaleString()} so'm)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Sizning ID: <code className="font-mono font-bold text-slate-700 dark:text-slate-200">{currentUser?.id || '1'}</code>
              </div>
            </div>

            <a
              href={tgDirectLink}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              @{OWNER_USERNAME} ga To'lov uchun yozish
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
