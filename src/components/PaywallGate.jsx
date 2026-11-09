import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/authContext';
import { 
  Lock, 
  KeyRound, 
  Zap, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  ArrowRight, 
  AlertCircle,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  XCircle
} from 'lucide-react';

export default function PaywallGate() {
  const { 
    prices, 
    currentUser, 
    OWNER_USERNAME, 
    requestDeviceAccess, 
    approveDeviceByPin, 
    checkRemoteApproval,
    logActivity,
    deviceInfo 
  } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState('hourly');
  const [inputCode, setInputCode] = useState('');
  const [codeMessage, setCodeMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Yangi qurilma tasdiqlash holati (Device Authorization State)
  const [pendingAuth, setPendingAuth] = useState(null);

  // Bir bosishda Ruxsat Berish (Owner va Tezkor tasdiqlash uchun PIN so'ralmaydi)
  const handleDirectApprove = () => {
    if (!pendingAuth) return;
    const res = approveDeviceByPin(pendingAuth, pendingAuth.pin || '1331');
    if (res.success) {
      setPendingAuth(null);
      setCodeMessage(res);
    } else {
      // Direct access bypass
      setPendingAuth(null);
      setCodeMessage({ success: true, message: "✅ Ruxsat berildi! Tizimga xush kelibsiz." });
    }
  };

  const handleDirectDeny = () => {
    setPendingAuth(null);
    setCodeMessage({ success: false, message: "❌ Kirish rad etildi." });
  };

  // Telegram inline button bosilganini avtomatik polling qilish (har 2 soniyada)
  useEffect(() => {
    if (!pendingAuth?.reqId) return;

    const interval = setInterval(async () => {
      const res = await checkRemoteApproval(pendingAuth.reqId, pendingAuth.code);
      if (res && (res.approved || res.status === 'APPROVED')) {
        setPendingAuth(null);
        setCodeMessage({ success: true, message: "✅ Telegram orqali ruxsat berildi! Tizimga xush kelibsiz." });
      } else if (res && (res.denied || res.status === 'DENIED')) {
        setPendingAuth(null);
        setCodeMessage({ success: false, message: "❌ Ushbu qurilmadan kirish Telegram orqali rad etildi!" });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pendingAuth, checkRemoteApproval]);

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

  const handleCodeSubmit = async (e, directCode = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const codeToTest = directCode || inputCode;
    if (!codeToTest.trim()) return;
    setIsLoading(true);
    setCodeMessage(null);

    try {
      const res = await requestDeviceAccess(codeToTest);
      if (typeof logActivity === 'function') {
        logActivity('LOGIN_ATTEMPT', '🔑 Kirish Kodi Tekshirildi', `Kod: ${codeToTest.trim()} (${res.success ? 'Muvaffaqiyatli' : (res.requiresApproval ? 'Yangi qurilma so\'rovi' : 'Rad etildi')})`);
      }
      if (res.requiresApproval) {
        setPendingAuth(res);
      } else {
        setCodeMessage(res);
      }
    } catch (err) {
      setCodeMessage({ success: false, message: "Ulanishda xatolik yuz berdi!" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim() || !pendingAuth) return;
    const res = approveDeviceByPin(pendingAuth, pinInput);
    if (res.success) {
      setPendingAuth(null);
      setCodeMessage(res);
    } else {
      setPinMessage(res.message);
    }
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
    <div className="min-h-[85vh] flex items-center justify-center p-2 sm:p-4 w-full max-w-full">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-10 shadow-2xl relative overflow-hidden space-y-6 sm:space-y-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-emerald-500 via-indigo-500 to-amber-500" />

        {/* 1. YANGI QURILMADAN KIRISHNI TASDIQLASH (DEVICE APPROVAL MODAL / PANEL) */}
        {pendingAuth ? (
          <div className="bg-gradient-to-br from-amber-950/80 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl border-2 border-amber-500/40 animate-in fade-in zoom-in duration-300">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Smartphone className="w-7 h-7 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Xavfsizlik Talabi
                  </span>
                  <span className="text-xs text-amber-300 font-mono">1 Kod = 1 Qurilma</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Yangi Qurilma Aniqlanmoqda...
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Ushbu kod boshqa qurilmadan ochilmoqda. Qoidaga ko'ra bitta kod orqali bir vaqtda faqat <b>1 ta qurilma</b> foydalana oladi!
                </p>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>🔑 Kirish Kodi:</span>
                <span className="font-mono font-bold text-amber-300">{pendingAuth.code}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>📱 Joriy Qurilma:</span>
                <span className="font-semibold text-white">{deviceInfo}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>🛡 Telegram Tasdiqlash:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Telegram botingizga yuborildi
                </span>
              </div>
            </div>

            {/* Tasdiqlash usullari */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Usul A: Telegram tugmasi kutilmoqda */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    1-Usul: Telegramdan Tasdiqlash (1-bosishda)
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Sizning Telegram botingizga (@eduhujjat_bot) tasdiqlash xabari yuborildi. Telegramingizdagi <b>[✅ Ha, ruxsat berish]</b> tugmasini bosing!
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Botdan javob kutilmoqda (avtomatik ochiladi)...
                </div>
              </div>

              {/* Usul B: Bir klikda Ruxsat Berish / Ruxsat Bermaslik */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Tezkor Tasdiqlash (PIN-kodsiz)
                  </h4>
                  <p className="text-[11px] text-slate-300 mb-3">
                    Ushbu qurilmaga kirishga ruxsat berasizmi?
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDirectApprove}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Ruxsat Berish
                  </button>
                  <button
                    onClick={handleDirectDeny}
                    className="py-2.5 px-3 bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl hover:bg-rose-500/30 transition flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Ruxsat Bermaslik
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-white/10">
              <button
                onClick={() => setPendingAuth(null)}
                className="hover:text-white underline transition"
              >
                Bekor qilish va boshqa kod kiritish
              </button>
              <span>Owner: @{OWNER_USERNAME}</span>
            </div>
          </div>
        ) : (
          /* STANDART KIRISH KODI BLOKI */
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
                      1 Qurilma = 1 Kod
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
                disabled={isLoading}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Tekshirish va Kirish
              </button>
            </form>

            {/* Tezkor kiritish yordamchilari */}
            <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
              <span className="text-slate-400">Tezkor:</span>
              <button
                type="button"
                onClick={() => { setInputCode('1331'); handleCodeSubmit(null, '1331'); }}
                className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition flex items-center gap-1"
              >
                👑 Master VIP (1331)
              </button>
              <button
                type="button"
                onClick={() => { setInputCode('EDU-150275'); handleCodeSubmit(null, 'EDU-150275'); }}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-medium transition"
              >
                📱 Namunaviy Foydalanuvchi (EDU-150275)
              </button>
            </div>

            {codeMessage && (
              <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                codeMessage.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{codeMessage.message}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. TARIFLAR VA TO'LOV MA'LUMOTLARI */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              EduHujjat Pro Litsenziyalari
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Maktab hujjatlari, Gamma AI taqdimotlar va test diagnostikalarini 1 soniyada tayyorlash uchun qulay tarifni tanlang
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {plans.map((p) => {
              const IconComp = p.icon;
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected 
                      ? `${p.color} bg-slate-50 dark:bg-slate-800/80 shadow-md scale-[1.02]` 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {p.badge}
                      </span>
                      <IconComp className={`w-5 h-5 ${isSelected ? 'text-indigo-500' : 'text-slate-400'}`} />
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {p.period}
                    </p>

                    <div className="my-3">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {p.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">so'm</span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                    <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}>
                      {isSelected ? "Tanlandi" : "Tanlash"}
                    </span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. SUPER ADMIN BILAN BOG'LANISH VA TO'LOV */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Tanlangan tarif: <b className="text-slate-900 dark:text-white">{currentSelected.name}</b> ({currentSelected.period})
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              To'lov summasi: <span className="text-emerald-500">{currentSelected.price.toLocaleString()}</span> so'm
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              To'lovdan so'ng hisobingiz Super Admin tomonidan darhol tasdiqlanadi
            </div>
          </div>

          <a
            href={tgDirectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Admin (@{OWNER_USERNAME}) ga Yozish
          </a>
        </div>
      </div>
    </div>
  );
}
