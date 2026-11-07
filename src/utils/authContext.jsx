import React, { createContext, useContext, useState, useEffect } from 'react';

const OWNER_USERNAME = 'fayzbek1331';
const SUPER_OWNER_ID = 6707839718;

export const DEFAULT_PRICES = {
  oneTime: 2000,
  twoTime: 4000,
  fiveTime: 8000,
  hourly: 3000,
  twoHours: 5000,
  threeHours: 7000,
  daily: 5000,
  weekly: 25000,
  monthly: 70000,
  unlimited: 290000
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        return window.Telegram.WebApp.initDataUnsafe.user;
      }
    } catch (e) {}
    return {
      id: 1,
      realId: SUPER_OWNER_ID,
      username: 'fayzbek1331',
      first_name: 'Fayzbek',
      last_name: 'Owner'
    };
  });

  const isActualOwner = 
    currentUser?.id === 1 || 
    currentUser?.id === SUPER_OWNER_ID || 
    currentUser?.username?.toLowerCase() === OWNER_USERNAME.toLowerCase();

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
      { id: 1, username: 'fayzbek1331', name: 'Fayzbek (Super Owner)', role: 'OWNER', addedAt: '2026-01-01', permissions: ['all'] },
      { id: 2, username: 'maktab_admin', name: 'Alisher Qodirov', role: 'ADMIN', addedAt: '2026-02-01', permissions: ['approve_users'] }
    ];
  });

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('eduhujjat_users');
    return saved ? JSON.parse(saved) : [
      { id: 1, realId: SUPER_OWNER_ID, name: 'Fayzbek (Super Owner)', username: 'fayzbek1331', status: 'ACTIVE', plan: 'unlimited', expiresAt: 'Cheksiz VIP', remainingUses: 999999, registeredAt: '2026-01-01' }
    ];
  });

  // Access Code bilan kirish holati
  const [accessCodeInfo, setAccessCodeInfo] = useState(() => {
    const saved = localStorage.getItem('eduhujjat_active_code');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAtTimestamp && Date.now() > parsed.expiresAtTimestamp) {
        localStorage.removeItem('eduhujjat_active_code');
        return null;
      }
      return parsed;
    } catch(e) {
      return null;
    }
  });

  const [userAccessStatus, setUserAccessStatus] = useState(() => {
    if (isActualOwner) return 'ACTIVE';
    if (accessCodeInfo) return 'ACTIVE';
    return 'PENDING';
  });

  // Avtomatik muddati tugashini tekshirish (har 15 soniyada)
  useEffect(() => {
    const checkExpiry = () => {
      if (isActualOwner) return;
      if (accessCodeInfo && accessCodeInfo.expiresAtTimestamp) {
        if (Date.now() > accessCodeInfo.expiresAtTimestamp) {
          localStorage.removeItem('eduhujjat_active_code');
          setAccessCodeInfo(null);
          setUserAccessStatus('PENDING');
          alert("⚠️ Diqqat: Sizning obuna va kirish kodingiz muddati tugadi! Iltimos, Telegram botimizdan obunani yangilang.");
        }
      }
    };
    const timer = setInterval(checkExpiry, 15000);
    return () => clearInterval(timer);
  }, [accessCodeInfo, isActualOwner]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_prices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_users', JSON.stringify(usersList));
  }, [usersList]);

  // Kodni tekshirish funksiyasi
  const verifyAccessCode = (inputCode) => {
    const clean = String(inputCode).trim().toUpperCase();

    // Master Owner Kodlari
    if (clean === '1331' || clean === 'OWNER-VIP' || clean === '777777') {
      const info = {
        code: clean,
        plan: 'unlimited',
        name: 'Master VIP Foydalanuvchi',
        expiresAtTimestamp: null,
        enteredAt: new Date().toISOString()
      };
      localStorage.setItem('eduhujjat_active_code', JSON.stringify(info));
      setAccessCodeInfo(info);
      setUserAccessStatus('ACTIVE');
      return { success: true, message: "👑 Master VIP kod qabul qilindi! Cheksiz kirish faollashtirildi." };
    }

    // Bot generatsiya qilgan kodlar (EDU-XXXXXX)
    if (clean.startsWith('EDU-') || /^\d{6}$/.test(clean)) {
      const oneDayLater = Date.now() + 24 * 60 * 60 * 1000;
      const info = {
        code: clean,
        plan: 'daily',
        name: 'Faol Litsenziat',
        expiresAtTimestamp: oneDayLater,
        enteredAt: new Date().toISOString()
      };
      localStorage.setItem('eduhujjat_active_code', JSON.stringify(info));
      setAccessCodeInfo(info);
      setUserAccessStatus('ACTIVE');
      return { success: true, message: "✅ Kod muvaffaqiyatli tasdiqlandi! Tizimga xush kelibsiz." };
    }

    return { success: false, message: "❌ Noto'g'ri kod! Kodni Telegram botimiz (@eduhujjat_bot) dan '🔑 Saytga Kirish Kodi' tugmasi orqali oling." };
  };

  const logoutCode = () => {
    localStorage.removeItem('eduhujjat_active_code');
    setAccessCodeInfo(null);
    if (!isActualOwner) {
      setUserAccessStatus('PENDING');
    }
  };

  const addAdmin = (newAdmin) => {
    setAdmins(prev => [...prev, { ...newAdmin, id: Date.now(), addedAt: new Date().toISOString().split('T')[0] }]);
  };

  const removeAdmin = (adminId) => {
    setAdmins(prev => prev.filter(a => a.id !== adminId));
  };

  const updatePrices = (newPrices) => {
    setPrices(newPrices);
  };

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
        return { ...u, status: 'ACTIVE', plan: planType, expiresAt, remainingUses };
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
      verifyAccessCode,
      logoutCode,
      accessCodeInfo,
      OWNER_USERNAME,
      SUPER_OWNER_ID
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
