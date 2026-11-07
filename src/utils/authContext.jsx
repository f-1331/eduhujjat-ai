import React, { createContext, useContext, useState, useEffect } from 'react';

const OWNER_USERNAME = 'fayzbek1331';

export const DEFAULT_PRICES = {
  daily: 5000,       // 5,000 so'm / kun
  weekly: 25000,     // 25,000 so'm / hafta
  monthly: 70000,    // 70,000 so'm / oy
  unlimited: 290000  // 290,000 so'm / cheksiz
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Telegram orqali kirgan foydalanuvchi
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        return window.Telegram.WebApp.initDataUnsafe.user;
      }
    } catch (e) {
      // ignore
    }
    return {
      id: 1331777,
      username: 'fayzbek1331',
      first_name: 'Fayzbek',
      last_name: 'Owner'
    };
  });

  // Owner ekanligini aniqlash (@fayzbek1331)
  const isActualOwner = currentUser?.username?.toLowerCase() === OWNER_USERNAME.toLowerCase();

  // Role Simulator (Owner xohlasa o'zini USER, INSPECTOR, ADMIN yoki OWNER rejimida ko'ra oladi)
  const [activeRole, setActiveRole] = useState(() => {
    return isActualOwner ? 'OWNER' : 'USER';
  });

  // Narxlar davomiyligi va holati
  const [prices, setPrices] = useState(() => {
    const saved = localStorage.getItem('eduhujjat_prices');
    return saved ? JSON.parse(saved) : DEFAULT_PRICES;
  });

  // Adminlar ro'yxati
  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('eduhujjat_admins');
    return saved ? JSON.parse(saved) : [
      { id: 1, username: 'maktab_admin', name: 'Alisher Qodirov', role: 'ADMIN', addedAt: '2026-02-01', permissions: ['approve_users', 'view_reports'] },
      { id: 2, username: 'toshkent_inspektor', name: 'Zarina Rustamova', role: 'INSPECTOR', addedAt: '2026-02-05', permissions: ['view_only', 'audit'] }
    ];
  });

  // Foydalanuvchilar ro'yxati va ularning ruxsatlari
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('eduhujjat_users');
    return saved ? JSON.parse(saved) : [
      { id: 98124, name: 'Malika Karimova', username: 'malika_k', status: 'ACTIVE', plan: 'monthly', expiresAt: '2026-03-10', registeredAt: '2026-02-10' },
      { id: 45123, name: 'Jasur Boboyev', username: 'jasur_teacher', status: 'PENDING', plan: 'none', expiresAt: null, registeredAt: '2026-02-14' },
      { id: 89012, name: 'Sardor Xolmatov', username: 'sardor_edu', status: 'ACTIVE', plan: 'weekly', expiresAt: '2026-02-21', registeredAt: '2026-02-14' },
      { id: 33412, name: 'Laylo Usmonova', username: 'laylo_u', status: 'BLOCKED', plan: 'none', expiresAt: null, registeredAt: '2026-01-20' },
      { id: 1331777, name: 'Fayzbek (Owner)', username: 'fayzbek1331', status: 'ACTIVE', plan: 'unlimited', expiresAt: '2099-12-31', registeredAt: '2026-01-01' }
    ];
  });

  // Foydalanuvchining shaxsiy statusi (simulyatsiyaga bog'liq)
  const [userAccessStatus, setUserAccessStatus] = useState(() => {
    if (isActualOwner) return 'ACTIVE';
    return 'PENDING'; // Yangi kirgan odam uchun boshida yopiq!
  });

  // Mahalliy saqlash
  useEffect(() => {
    localStorage.setItem('eduhujjat_prices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_users', JSON.stringify(usersList));
  }, [usersList]);

  // Admin qo'shish
  const addAdmin = (newAdmin) => {
    setAdmins(prev => [...prev, { ...newAdmin, id: Date.now(), addedAt: new Date().toISOString().split('T')[0] }]);
  };

  // Adminni o'chirish
  const removeAdmin = (adminId) => {
    setAdmins(prev => prev.filter(a => a.id !== adminId));
  };

  // Narxlarni yangilash
  const updatePrices = (newPrices) => {
    setPrices(newPrices);
  };

  // Foydalanuvchiga ruxsat berish
  const approveUser = (userId, planType = 'monthly') => {
    const daysToAdd = planType === 'daily' ? 1 : planType === 'weekly' ? 7 : planType === 'monthly' ? 30 : 3650;
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + daysToAdd);

    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'ACTIVE',
          plan: planType,
          expiresAt: expDate.toISOString().split('T')[0]
        };
      }
      return u;
    }));

    if (currentUser?.id === userId) {
      setUserAccessStatus('ACTIVE');
    }
  };

  // Foydalanuvchini bloklash
  const blockUser = (userId) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: 'BLOCKED' } : u));
    if (currentUser?.id === userId) {
      setUserAccessStatus('BLOCKED');
    }
  };

  // Ruxsatni tekshirish
  const hasAccess = () => {
    if (activeRole === 'OWNER' || activeRole === 'ADMIN' || activeRole === 'INSPECTOR') return true;
    return userAccessStatus === 'ACTIVE';
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isActualOwner,
      activeRole,
      setActiveRole,
      userAccessStatus,
      setUserAccessStatus,
      prices,
      updatePrices,
      admins,
      addAdmin,
      removeAdmin,
      usersList,
      approveUser,
      blockUser,
      hasAccess,
      OWNER_USERNAME
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
