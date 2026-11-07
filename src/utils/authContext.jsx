import React, { createContext, useContext, useState, useEffect } from 'react';

const OWNER_USERNAME = 'fayzbek1331';

export const DEFAULT_PRICES = {
  oneTime: 2000,     // 2,000 so'm / 1 ta hujjat
  hourly: 3000,      // 3,000 so'm / 1 soat
  daily: 5000,       // 5,000 so'm / 1 kun
  weekly: 25000,     // 25,000 so'm / 1 hafta
  monthly: 70000,    // 70,000 so'm / 1 oy
  unlimited: 290000  // 290,000 so'm / cheksiz
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
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

  const isActualOwner = currentUser?.username?.toLowerCase() === OWNER_USERNAME.toLowerCase();

  const [activeRole, setActiveRole] = useState(() => {
    return isActualOwner ? 'OWNER' : 'USER';
  });

  const [prices, setPrices] = useState(() => {
    const saved = localStorage.getItem('eduhujjat_prices');
    return saved ? JSON.parse(saved) : DEFAULT_PRICES;
  });

  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('eduhujjat_admins');
    return saved ? JSON.parse(saved) : [
      { id: 1, username: 'maktab_admin', name: 'Alisher Qodirov', role: 'ADMIN', addedAt: '2026-02-01', permissions: ['approve_users'] },
      { id: 2, username: 'toshkent_inspektor', name: 'Zarina Rustamova', role: 'INSPECTOR', addedAt: '2026-02-05', permissions: ['view_only'] }
    ];
  });

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('eduhujjat_users');
    return saved ? JSON.parse(saved) : [
      { id: 98124, name: 'Malika Karimova', username: 'malika_k', status: 'ACTIVE', plan: 'monthly', expiresAt: '2026-03-10', remainingUses: null, registeredAt: '2026-02-10' },
      { id: 45123, name: 'Jasur Boboyev', username: 'jasur_teacher', status: 'PENDING', plan: 'none', expiresAt: null, remainingUses: 0, registeredAt: '2026-02-14' },
      { id: 89012, name: 'Sardor Xolmatov', username: 'sardor_edu', status: 'ACTIVE', plan: 'hourly', expiresAt: '2026-02-14 23:59', remainingUses: null, registeredAt: '2026-02-14' },
      { id: 77211, name: 'Azizbek Nodirov', username: 'aziz_edu', status: 'ACTIVE', plan: 'oneTime', expiresAt: null, remainingUses: 1, registeredAt: '2026-02-14' },
      { id: 1331777, name: 'Fayzbek (Owner)', username: 'fayzbek1331', status: 'ACTIVE', plan: 'unlimited', expiresAt: '2099-12-31', remainingUses: 999999, registeredAt: '2026-01-01' }
    ];
  });

  const [userAccessStatus, setUserAccessStatus] = useState(() => {
    if (isActualOwner) return 'ACTIVE';
    return 'PENDING';
  });

  useEffect(() => {
    localStorage.setItem('eduhujjat_prices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_users', JSON.stringify(usersList));
  }, [usersList]);

  const addAdmin = (newAdmin) => {
    setAdmins(prev => [...prev, { ...newAdmin, id: Date.now(), addedAt: new Date().toISOString().split('T')[0] }]);
  };

  const removeAdmin = (adminId) => {
    setAdmins(prev => prev.filter(a => a.id !== adminId));
  };

  const updatePrices = (newPrices) => {
    setPrices(newPrices);
  };

  // Foydalanuvchiga ruxsat berish (soatlik, 1 martalik, kunlik, oylik va h.k.)
  const approveUser = (userId, planType = 'monthly') => {
    let expiresAt = null;
    let remainingUses = null;

    const now = new Date();
    if (planType === 'oneTime') {
      remainingUses = 1;
      expiresAt = "1 ta hujjat";
    } else if (planType === 'hourly') {
      now.setHours(now.getHours() + 1);
      expiresAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " gacha (1 soat)";
    } else if (planType === 'daily') {
      now.setDate(now.getDate() + 1);
      expiresAt = now.toISOString().split('T')[0];
    } else if (planType === 'weekly') {
      now.setDate(now.getDate() + 7);
      expiresAt = now.toISOString().split('T')[0];
    } else if (planType === 'monthly') {
      now.setDate(now.getDate() + 30);
      expiresAt = now.toISOString().split('T')[0];
    } else {
      expiresAt = "Cheksiz (VIP)";
    }

    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'ACTIVE',
          plan: planType,
          expiresAt,
          remainingUses
        };
      }
      return u;
    }));

    if (currentUser?.id === userId) {
      setUserAccessStatus('ACTIVE');
    }
  };

  const blockUser = (userId) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: 'BLOCKED' } : u));
    if (currentUser?.id === userId) {
      setUserAccessStatus('BLOCKED');
    }
  };

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
