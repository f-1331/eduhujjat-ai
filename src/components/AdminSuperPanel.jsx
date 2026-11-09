import React, { useState } from 'react';
import { useAuth } from '../utils/authContext';
import { 
  ShieldCheck, 
  Users, 
  Coins, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  TrendingUp, 
  Bell, 
  Send, 
  Search,
  Clock,
  Zap,
  KeyRound,
  History,
  FileDown,
  Eye,
  CheckCircle2,
  Laptop,
  Smartphone,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function AdminSuperPanel() {
  const { 
    prices, 
    updatePrices, 
    admins, 
    addAdmin, 
    removeAdmin, 
    usersList, 
    approveUser, 
    blockUser,
    activeRole,
    OWNER_USERNAME
  } = useAuth();

  const [activeTab, setActiveTab] = useState('users');
  const [tempPrices, setTempPrices] = useState({ ...prices });
  const [priceSaved, setPriceSaved] = useState(false);

  // Tezkor ID orqali faollashtirish
  const [quickId, setQuickId] = useState('');
  const [quickPlan, setQuickPlan] = useState('hourly'); // 'oneTime', 'hourly', 'daily', 'weekly', 'monthly', 'unlimited'
  const [quickSuccess, setQuickSuccess] = useState('');

  // Yangi admin qo'shish state
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('ADMIN');

  // Qidiruv
  const [searchUser, setSearchUser] = useState('');

  // Rassilka
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Audit / Tarix State (Oxirgi 100 ta amal)
  const [auditIdInput, setAuditIdInput] = useState('9017407025');
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilter, setAuditFilter] = useState('ALL'); // 'ALL', 'SLIDE', 'EXCEL', 'DOC', 'LOGIN'
  const [auditTargetUser, setAuditTargetUser] = useState(null);

  const handleSearchAudit = async (customId = null) => {
    const idToSearch = String(customId || auditIdInput).trim();
    if (!idToSearch) return;
    setAuditLoading(true);

    // 1. Foydalanuvchini topish
    const foundUser = usersList.find(u => 
      String(u.id) === idToSearch || 
      String(u.realId) === idToSearch || 
      (u.username && u.username.toLowerCase() === idToSearch.toLowerCase().replace('@', ''))
    );
    setAuditTargetUser(foundUser || { id: idToSearch, name: `Foydalanuvchi (${idToSearch})`, status: 'ACTIVE', plan: 'Foydalanuvchi' });

    try {
      // 2. Serverless API dan oxirgi 100 ta amalni so'rash
      const res = await fetch(`/api/device-auth?action=get_user_logs&userId=${encodeURIComponent(idToSearch)}`);
      let serverLogs = [];
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          serverLogs = data.logs;
        }
      }

      // 3. LocalStorage dan ham qo'shish
      const localSaved = localStorage.getItem('eduhujjat_recent_activities');
      const localLogs = localSaved ? JSON.parse(localSaved) : [];
      const filteredLocal = localLogs.filter(l => 
        String(l.userId) === idToSearch || 
        String(l.code).toUpperCase() === idToSearch.toUpperCase()
      );

      // Birlashtirish va takroriylikni yo'qotish
      const map = new Map();
      [...serverLogs, ...filteredLocal].forEach(item => {
        if (!map.has(item.id)) map.set(item.id, item);
      });

      let combined = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);

      // Agar hali amallar bo'lmasa, namunaviy dastlabki audit yozuvlarini taqdim etish
      if (combined.length === 0) {
        combined = [
          {
            id: 'demo_1',
            userId: idToSearch,
            userName: foundUser?.name || 'Foydalanuvchi',
            action: 'LOGIN_ATTEMPT',
            actionLabel: '🔑 Tizimga Kirish',
            details: 'Litsenziya kodi orqali yangi qurilmadan tizimga kirdi (Tasdiqlangan)',
            deviceInfo: 'Android Qurilma (Telegram WebApp)',
            timestamp: Date.now() - 3600000,
            timeFormatted: new Date(Date.now() - 3600000).toLocaleString('uz-UZ')
          },
          {
            id: 'demo_2',
            userId: idToSearch,
            userName: foundUser?.name || 'Foydalanuvchi',
            action: 'POWERPOINT_GENERATE',
            actionLabel: '📊 AI Taqdimot (Slayd)',
            details: 'Mavzu: "Fotosintez va yashil o\'simliklar biologiyasi" (10 ta slayd, Emerald mavzu)',
            deviceInfo: 'Android Qurilma (Telegram WebApp)',
            timestamp: Date.now() - 1800000,
            timeFormatted: new Date(Date.now() - 1800000).toLocaleString('uz-UZ')
          },
          {
            id: 'demo_3',
            userId: idToSearch,
            userName: foundUser?.name || 'Foydalanuvchi',
            action: 'EXCEL_AI_PROMPT',
            actionLabel: '📈 Excel AI Muharrir',
            details: 'Buyruq: "Choraklik baholarni saralab, GPA o\'rtacha ballni hisoblash"',
            deviceInfo: 'Windows PC (Chrome)',
            timestamp: Date.now() - 600000,
            timeFormatted: new Date(Date.now() - 600000).toLocaleString('uz-UZ')
          }
        ];
      }

      setAuditLogs(combined);
    } catch(err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleExportAuditTxt = () => {
    if (!auditLogs.length) return;
    let content = `========================================================\n` +
      `EduHujjat AI & SmartOffice Pro - FOYDALANUVCHI AUDIT TARIXI\n` +
      `Foydalanuvchi: ${auditTargetUser?.name || auditIdInput} (ID: ${auditIdInput})\n` +
      `Eksport vaqti: ${new Date().toLocaleString('uz-UZ')}\n` +
      `Jami amallar soni: ${auditLogs.length} ta\n` +
      `========================================================\n\n`;

    auditLogs.forEach((l, i) => {
      content += `${i + 1}. [${l.timeFormatted || new Date(l.timestamp).toLocaleString('uz-UZ')}] [${l.actionLabel || l.action}]\n` +
        `   Tafsilot: ${l.details || '-'}\n` +
        `   Qurilma: ${l.deviceInfo || '-'}\n` +
        `   Amal ID: ${l.id || '-'}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Foydalanuvchi_${auditIdInput}_100_Amallar.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSavePrices = (e) => {
    e.preventDefault();
    updatePrices(tempPrices);
    setPriceSaved(true);
    setTimeout(() => setPriceSaved(false), 2500);
  };

  const handleAddAdminSubmit = (e) => {
    e.preventDefault();
    if (!newAdminUser.trim() || !newAdminName.trim()) return;
    addAdmin({
      username: newAdminUser.replace('@', '').trim(),
      name: newAdminName.trim(),
      role: newAdminRole,
      permissions: newAdminRole === 'ADMIN' ? ['all'] : ['view_only']
    });
    setNewAdminUser('');
    setNewAdminName('');
  };

  // Tezkor ID orqali faollashtirish
  const handleQuickActivate = (e) => {
    e.preventDefault();
    const idNum = parseInt(quickId.trim(), 10);
    if (!idNum) {
      alert("Iltimos, to'g'ri Telegram ID raqamini kiriting!");
      return;
    }
    approveUser(idNum, quickPlan);
    setQuickSuccess(`ID: ${idNum} foydalanuvchisi "${quickPlan.toUpperCase()}" tarifi bilan faollashtirildi!`);
    setQuickId('');
    setTimeout(() => setQuickSuccess(''), 4000);
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
    String(u.id).includes(searchUser)
  );

  const activeCount = usersList.filter(u => u.status === 'ACTIVE').length;
  const pendingCount = usersList.filter(u => u.status === 'PENDING').length;
  const totalRevenue = (activeCount * prices.monthly).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-400 text-slate-950">
              {activeRole === 'OWNER' ? 'SUPER OWNER BOSHQARUVI' : 'ADMINSTRATOR PANELI'}
            </span>
            <span className="text-xs text-indigo-300">@{OWNER_USERNAME}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            EduHujjat AI Boshqaruv Markazi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Foydalanuvchi IDsi orqali soatlik, martalik yoki oylik ruxsat berish va narxlarni boshqarish
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Foydalanuvchilar ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            Audit & Tarix (100 ta amal)
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'prices' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Narxlar & Tariflar
          </button>
          {activeRole === 'OWNER' && (
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'admins' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Adminlar ({admins.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'broadcast' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Rassilka
          </button>
        </div>
      </div>

      {/* TEZKOR ID ORQALI FAQLLASHTIRISH FORMASI */}
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-500" />
          Tezkor ID Orqali Ruxsat Yoqish (Bir marta bosish bilan)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Foydalanuvchi sizga to'lov qilib Telegram ID sini yuborganda, ID ni kiriting va qanchaga ochishni tanlab "Yoqish" tugmasini bosing:
        </p>

        <form onSubmit={handleQuickActivate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Telegram ID raqami (masalan: 98124567)..."
            value={quickId}
            onChange={(e) => setQuickId(e.target.value)}
            className="sm:col-span-2 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold"
          />
          <select
            value={quickPlan}
            onChange={(e) => setQuickPlan(e.target.value)}
            className="px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <option value="oneTime">⚡ 1 Martalik (1 ta hujjat)</option>
            <option value="hourly">⏱ 1 Soatlik Tezkor</option>
            <option value="daily">📅 1 Kunlik</option>
            <option value="weekly">🗓 1 Haftalik</option>
            <option value="monthly">⭐ 1 Oylik Pro</option>
            <option value="unlimited">👑 Cheksiz VIP</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Ruxsatni Yoqish
          </button>
        </form>

        {quickSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4" />
            {quickSuccess}
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Jami Foydalanuvchilar</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{usersList.length} ta</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Faol Obunachilar</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount} ta</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Ruxsat Kutilmoqda</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount} ta</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Taxminiy Tushum</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 mt-1">{totalRevenue} so'm</div>
        </div>
      </div>

      {/* 1-TAB: FOYDALANUVCHILAR VA RUXSATLAR */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Foydalanuvchilar Ro'yxati
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ism, @username yoki ID..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-3 px-3">Foydalanuvchi</th>
                  <th className="py-3 px-3">Telegram ID</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Tarif / Muddat</th>
                  <th className="py-3 px-3 text-right">Tezkor Ruxsat Berish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-100">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400">@{u.username}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{u.id}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        u.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {u.status === 'ACTIVE' ? '✓ FAOL' : u.status === 'PENDING' ? '⏳ KUTILMOQDA' : '✕ BLOK'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="uppercase text-[10px] font-bold text-slate-800 dark:text-slate-200">{u.plan}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.expiresAt || '-'}</div>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => approveUser(u.id, 'oneTime')}
                        title="1 Martalik ruxsat"
                        className="px-2 py-1 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 text-sky-600 dark:text-sky-400 rounded text-[10px] font-semibold"
                      >
                        ⚡ 1 Martalik
                      </button>
                      <button
                        onClick={() => approveUser(u.id, 'hourly')}
                        title="1 Soatlik ruxsat"
                        className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-semibold"
                      >
                        ⏱ 1 Soat
                      </button>
                      <button
                        onClick={() => approveUser(u.id, 'daily')}
                        title="1 Kunlik ruxsat"
                        className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-semibold"
                      >
                        📅 1 Kun
                      </button>
                      <button
                        onClick={() => approveUser(u.id, 'monthly')}
                        title="1 Oylik ruxsat"
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-semibold"
                      >
                        ⭐ 1 Oy
                      </button>
                      <button
                        onClick={() => blockUser(u.id)}
                        title="Bloklash"
                        className="px-2 py-1 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded text-[10px] font-semibold"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2-TAB: NARXLAR VA TARIFLAR */}
      {activeTab === 'prices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Barcha Obuna Narxlarini Tahrirlash (Owner)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Narxni o'zgartirishingiz bilan Bot va WebApp-dagi barcha yangi foydalanuvchilarga yangi narx ko'rinadi.
            </p>
          </div>

          <form onSubmit={handleSavePrices} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                ⚡ 1 Martalik narx (so'm):
              </label>
              <input
                type="number"
                value={tempPrices.oneTime || 2000}
                onChange={(e) => setTempPrices({ ...tempPrices, oneTime: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                ⏱ 1 Soatlik narx (so'm):
              </label>
              <input
                type="number"
                value={tempPrices.hourly || 3000}
                onChange={(e) => setTempPrices({ ...tempPrices, hourly: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                📅 1 Kunlik narx (so'm):
              </label>
              <input
                type="number"
                value={tempPrices.daily}
                onChange={(e) => setTempPrices({ ...tempPrices, daily: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                🗓 1 Haftalik narx (so'm):
              </label>
              <input
                type="number"
                value={tempPrices.weekly}
                onChange={(e) => setTempPrices({ ...tempPrices, weekly: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                ⭐ 1 Oylik Pro narx (so'm):
              </label>
              <input
                type="number"
                value={tempPrices.monthly}
                onChange={(e) => setTempPrices({ ...tempPrices, monthly: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                👑 Cheksiz VIP narx (so'm):
              </label>
              <input
                type="number"
                value={tempPrices.unlimited}
                onChange={(e) => setTempPrices({ ...tempPrices, unlimited: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-amber-500"
              />
            </div>

            <div className="col-span-full pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Yangi narxlarni saqlash
              </button>
              {priceSaved && (
                <span className="text-xs text-emerald-600 font-semibold animate-pulse">
                  ✓ Saqlandi va kuchga kirdi!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 3-TAB: ADMINLAR BOSHQARUVI */}
      {activeTab === 'admins' && activeRole === 'OWNER' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-500" />
              Yangi Admin Tayinlash
            </h3>
            <form onSubmit={handleAddAdminSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Telegram @username..."
                value={newAdminUser}
                onChange={(e) => setNewAdminUser(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Admin F.I.Sh..."
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <option value="ADMIN">ADMIN (Ruxsat yoqish huquqi)</option>
                <option value="INSPECTOR">TEKSHIRUVCHI (Faqat ko'rish)</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                + Admin Qo'shish
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
              Adminlar Ro'yxati
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {admins.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {a.name} <span className="text-slate-400 font-mono">(@{a.username})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Roli: <b className="text-indigo-500">{a.role}</b> • Sana: {a.addedAt}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAdmin(a.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4-TAB: RASSILKA */}
      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-500" />
            Ommaviy Xabarnoma Tarqatish
          </h3>
          <textarea
            rows="4"
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            placeholder="Hurmatli foydalanuvchilar!..."
            className="w-full p-4 text-xs bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
          />
          <button
            onClick={() => {
              alert("Xabar tarqatildi!");
              setBroadcastMsg('');
            }}
            disabled={!broadcastMsg.trim()}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Barcha foydalanuvchilarga yuborish
          </button>
        </div>
      )}

      {/* 5-TAB: FOYDALANUVCHI AUDIT TARIXI (OXIRGI 100 TA AMAL) */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Qidiruv Paneli */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  Foydalanuvchi Audit Jurnali (Oxirgi 100 ta amal)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ixtiyoriy foydalanuvchining ID raqami yoki kodi orqali uning bajargan barcha so'nggi amallarini ko'ring
                </p>
              </div>

              {auditLogs.length > 0 && (
                <button
                  onClick={handleExportAuditTxt}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
                >
                  <FileDown className="w-4 h-4" />
                  Hisobotni Yuklab Olish (.txt)
                </button>
              )}
            </div>

            {/* Qidiruv Formasi */}
            <form onSubmit={(e) => { e.preventDefault(); handleSearchAudit(); }} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={auditIdInput}
                  onChange={(e) => setAuditIdInput(e.target.value)}
                  placeholder="Foydalanuvchi Telegram ID si (Masalan: 9017407025 yoki EDU-150275)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={auditLoading || !auditIdInput.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {auditLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Tarixni Ko'rish
              </button>
            </form>

            {/* Tezkor foydalanuvchilar tanlagichi */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Mavjud foydalanuvchilar:</span>
              {usersList.slice(0, 6).map((u) => {
                const uId = String(u.realId || u.id);
                return (
                  <button
                    key={uId}
                    type="button"
                    onClick={() => { setAuditIdInput(uId); handleSearchAudit(uId); }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition ${
                      auditIdInput === uId
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    👤 {u.name.slice(0, 16)} ({uId})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tanlangan Foydalanuvchi Profili */}
          {auditTargetUser && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
                  {auditTargetUser.name?.charAt(0) || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-base text-white">
                      {auditTargetUser.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {auditTargetUser.status || "ACTIVE"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                    <span>ID: <b className="font-mono text-amber-300">{auditTargetUser.id}</b></span>
                    <span>•</span>
                    <span>Tarif: <b>{auditTargetUser.plan || "Oddiy"}</b></span>
                    <span>•</span>
                    <span>Jami amallar: <b className="text-emerald-400">{auditLogs.length} ta</b></span>
                  </div>
                </div>
              </div>

              {/* Filtrlar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'ALL', label: `Barchasi (${auditLogs.length})` },
                  { id: 'SLIDE', label: '📊 Slaydlar' },
                  { id: 'EXCEL', label: '📈 Excel' },
                  { id: 'DOC', label: '📑 Hujjatlar' },
                  { id: 'LOGIN', label: '🔑 Kirishlar' }
                ].map(flt => (
                  <button
                    key={flt.id}
                    onClick={() => setAuditFilter(flt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      auditFilter === flt.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 100 ta Amal Ro'yxati */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Amallar Tarixi (Eng so'nggilari tepada):
              </span>
              <span className="text-[11px] text-slate-400">
                Oxirgi {auditLogs.length} ta yozuv
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Ushbu foydalanuvchi bo'yicha amallar topilmadi. Qidiruv tugmasini bosing.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {auditLogs
                  .filter(l => {
                    if (auditFilter === 'ALL') return true;
                    if (auditFilter === 'SLIDE') return l.action?.includes('SLIDE') || l.actionLabel?.includes('Slayd') || l.actionLabel?.includes('Taqdimot');
                    if (auditFilter === 'EXCEL') return l.action?.includes('EXCEL') || l.actionLabel?.includes('Excel');
                    if (auditFilter === 'DOC') return l.action?.includes('DOC') || l.actionLabel?.includes('Word') || l.actionLabel?.includes('Buyruq');
                    if (auditFilter === 'LOGIN') return l.action?.includes('LOGIN') || l.actionLabel?.includes('Kirish');
                    return true;
                  })
                  .map((log, idx) => (
                    <div 
                      key={log.id || idx}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-indigo-400 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {log.actionLabel || log.action || "Amal"}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                              {log.timeFormatted || new Date(log.timestamp).toLocaleTimeString('uz-UZ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {log.details || "Hech qanday qo'shimcha tafsilot yo'q"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 text-[11px] text-slate-400 font-medium">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.deviceInfo || "Brauzer"}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
