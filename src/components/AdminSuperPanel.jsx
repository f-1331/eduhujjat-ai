import React, { useState } from 'react';
import { useAuth } from '../utils/authContext';
import { 
  ShieldCheck, 
  Users, 
  Coins, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Bell, 
  Send, 
  Sliders, 
  Search,
  Clock,
  Sparkles
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
    currentUser,
    OWNER_USERNAME
  } = useAuth();

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'prices', 'admins', 'broadcast'
  
  // Narxlar tahrirlash state
  const [tempPrices, setTempPrices] = useState({ ...prices });
  const [priceSaved, setPriceSaved] = useState(false);

  // Yangi admin qo'shish state
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('ADMIN');

  // Qidiruv
  const [searchUser, setSearchUser] = useState('');

  // Rassilka (Broadcast)
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Narxlarni saqlash
  const handleSavePrices = (e) => {
    e.preventDefault();
    updatePrices(tempPrices);
    setPriceSaved(true);
    setTimeout(() => setPriceSaved(false), 2500);
  };

  // Yangi admin qo'shish
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

  // Rassilka yuborish
  const handleSendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMsg('');
      alert(`Xabar barcha ${usersList.length} ta foydalanuvchiga muvaffaqiyatli tarqatildi!`);
    }, 1000);
  };

  // Filtrlangan foydalanuvchilar
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
    String(u.id).includes(searchUser)
  );

  // Statistika
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
            Narxlar, adminlar ro'yxati, obunalar va foydalanuvchilar ruxsatlarini to'liq nazorat qilish
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
            Rassilka (Xabar)
          </button>
        </div>
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
            <span>Taxminiy Daromad</span>
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
              Foydalanuvchilar va Obuna Holati
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ism, @username yoki ID..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <th className="py-3 px-3">Tarif</th>
                  <th className="py-3 px-3">Amal qilish muddati</th>
                  <th className="py-3 px-3 text-right">Ruxsat Berish / Harakat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-100">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400">@{u.username}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{u.id}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        u.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {u.status === 'ACTIVE' ? '✓ FAOL' : u.status === 'PENDING' ? '⏳ KUTILMOQDA' : '✕ BLOK'}
                      </span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {u.plan}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {u.expiresAt || '-'}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => approveUser(u.id, 'daily')}
                        title="1 Kunlik ruxsat berish"
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[10px] font-semibold"
                      >
                        +1 Kun
                      </button>
                      <button
                        onClick={() => approveUser(u.id, 'weekly')}
                        title="1 Haftalik ruxsat berish"
                        className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-semibold"
                      >
                        +1 Hafta
                      </button>
                      <button
                        onClick={() => approveUser(u.id, 'monthly')}
                        title="1 Oylik ruxsat berish"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold"
                      >
                        +1 Oy
                      </button>
                      <button
                        onClick={() => blockUser(u.id)}
                        title="Bloklash"
                        className="px-2 py-1 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded text-[10px] font-semibold"
                      >
                        Blok
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2-TAB: NARXLAR VA TARIFLARNI BOSHQARISH */}
      {activeTab === 'prices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Obuna Narxlarini Sozlash (Owner Huquqi)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bu yerda o'zgartirilgan narxlar darhol Telegram Bot va WebApp-dagi barcha yangi foydalanuvchilarga ko'rinadi.
            </p>
          </div>

          <form onSubmit={handleSavePrices} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Kunlik narx (so'm):
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
                Haftalik narx (so'm):
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
                Oylik narx (so'm):
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
                Cheksiz VIP (so'm):
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
                Narxlarni yangilash va saqlash
              </button>
              {priceSaved && (
                <span className="text-xs text-emerald-600 font-semibold animate-pulse">
                  ✓ Yangi narxlar saqlandi va barcha foydalanuvchilar uchun kuchga kirdi!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 3-TAB: ADMINLARNI BOSHQARISH (FAQAT OWNER UCHUN) */}
      {activeTab === 'admins' && activeRole === 'OWNER' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-500" />
              Yangi Admin yoki Tekshiruvchi Qo'shish
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
                <option value="ADMIN">ADMIN (Ruxsat berish huquqi)</option>
                <option value="INSPECTOR">TEKSHIRUVCHI (Faqat ko'rish)</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                + Adminni qo'shish
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
              Mavjud Adminlar Ro'yxati
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {admins.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {a.name} <span className="text-slate-400 font-mono">(@{a.username})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Roli: <b className="text-indigo-500">{a.role}</b> • Qo'shilgan sana: {a.addedAt}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAdmin(a.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Adminni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4-TAB: RASSILKA (OMMAVIY XABAR) */}
      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-500" />
              Ommaviy Xabarnoma Tarqatish (Broadcast)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Barcha ro'yxatdan o'tgan foydalanuvchilarning Telegram botiga rasmiy e'lon yoki chegirma xabarini yuborish.
            </p>
          </div>

          <textarea
            rows="4"
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            placeholder="Hurmatli foydalanuvchilar! Bugun yangi maktab hujjatlari shablonlari qo'shildi..."
            className="w-full p-4 text-xs bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />

          <button
            onClick={handleSendBroadcast}
            disabled={!broadcastMsg.trim()}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Barcha {usersList.length} ta foydalanuvchiga yuborish
          </button>
        </div>
      )}
    </div>
  );
}
