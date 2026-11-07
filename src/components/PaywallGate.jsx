import React, { useState } from 'react';
import { useAuth } from '../utils/authContext';
import { Lock, Zap, Clock, Calendar, CheckCircle2, Send, ShieldAlert, Sparkles, Check } from 'lucide-react';

export default function PaywallGate() {
  const { prices, currentUser, OWNER_USERNAME } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('hourly'); // 'oneTime', 'hourly', 'daily', 'weekly', 'monthly', 'unlimited'

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

  // Avtomatik to'lov xabari havolasi
  const paymentMessage = `Assalomu alaykum @${OWNER_USERNAME}! Men EduHujjat AI tizimidan to'lov qilmoqchiman:\n\n` +
    `👤 Ismim: ${currentUser?.first_name || 'Foydalanuvchi'} ${currentUser?.last_name || ''}\n` +
    `🆔 Mening Telegram ID: ${currentUser?.id || 'Noma\'lum'}\n` +
    `🔗 Username: @${currentUser?.username || 'yo\'q'}\n` +
    `💳 Tanlagan tarifim: ${currentSelected.name} (${currentSelected.period})\n` +
    `💰 To'lov summasi: ${currentSelected.price.toLocaleString()} so'm\n\n` +
    `Iltimos, to'lov kartangizni yuborsangiz va to'lovdan so'ng hisobimni faollashtirib bersangiz!`;

  const tgDirectLink = `https://t.me/${OWNER_USERNAME}?text=${encodeURIComponent(paymentMessage)}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-emerald-500 via-indigo-500 to-amber-500" />

        {/* Sarlavha */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-2">
            Yopiq Tizim • Faqat Tasdiqlangan Foydalanuvchilar Uchun
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Tarifni tanlang va Boshqaruvchiga yozing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Mablag'ingizga mos tarifni tanlang. Tugmani bosganingizda profilingiz ID si va narx avtomatik tarzda boshqaruvchi (<b>@{OWNER_USERNAME}</b>) ga tayyor xabar bo'lib yuboriladi!
          </p>
        </div>

        {/* 6 ta Tarif Kartochkalari */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {plans.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlan === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
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
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {p.name}
                  </h4>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {p.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">so'm</span>
                  </div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                    {p.period}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold">
                  <span>{isSelected ? "Tanlandi ✓" : "Tanlash"}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Avtomatik Yuborish Bloki */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-xs text-slate-500">Tanlangan tarif:</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {currentSelected.name} — <span className="text-indigo-600 dark:text-indigo-400">{currentSelected.price.toLocaleString()} so'm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Sizning ID: <code className="font-mono font-bold text-slate-700 dark:text-slate-200">{currentUser?.id || '1331777'}</code> (avtomatik biriktirilgan)
            </div>
          </div>

          <a
            href={tgDirectLink}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            @{OWNER_USERNAME} ga To'lov uchun yuborish
          </a>
        </div>
      </div>
    </div>
  );
}
