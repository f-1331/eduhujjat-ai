import React, { createContext, useContext, useState, useEffect } from 'react';

const OWNER_USERNAME = 'fayzbek1331';
const SUPER_OWNER_ID = 6707839718;

// Xavfsiz server orqali Telegram xabarnoma yuborish (Bot token mijoz brauzeriga chiqmaydi)
async function sendServerOwnerAlert(text) {
  try {
    await fetch('/api/device-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_owner_alert',
        text
      })
    });
  } catch(e) {}
}

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

// 1. Qurilmani identifikatsiya qilish va yagona qurilma xavfsizligi
export function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return 'server_node';
  let id = localStorage.getItem('eduhujjat_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem('eduhujjat_device_id', id);
  }
  return id;
}

export function getDeviceInfo() {
  if (typeof window === 'undefined') return 'Noma\'lum Qurilma';
  const ua = navigator.userAgent || '';
  let os = 'Windows PC';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iPhone / iOS';
  else if (/Android/i.test(ua)) os = 'Android Qurilma';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'Apple Mac';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Brauzer';
  if (/Telegram/i.test(ua)) browser = 'Telegram WebApp';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edge/i.test(ua)) browser = 'Edge';

  return `${os} (${browser})`;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const currentDeviceId = getOrCreateDeviceId();
  const deviceInfo = getDeviceInfo();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        return window.Telegram.WebApp.initDataUnsafe.user;
      }
    } catch (e) {}
    return null;
  });

  const isActualOwner = Boolean(
    currentUser && (
      currentUser.id === SUPER_OWNER_ID || 
      currentUser.realId === SUPER_OWNER_ID || 
      (currentUser.username && currentUser.username.toLowerCase() === OWNER_USERNAME.toLowerCase())
    )
  );

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

  // Access Code va unga bog'langan qurilma
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
    if (accessCodeInfo) return 'ACTIVE';
    return 'PENDING';
  });

  // Bitta kod orqali faqat 1 ta qurilma ishlashini muntazam nazorat qilish (Single-Device Heartbeat)
  useEffect(() => {
    if (isActualOwner || !accessCodeInfo?.code) return;

    const enforceSingleDevice = async () => {
      const code = accessCodeInfo.code;
      // 1. Mahalliy tekshirish
      const boundDev = localStorage.getItem(`eduhujjat_bound_${code}`);
      if (boundDev && boundDev !== currentDeviceId) {
        logoutCode();
        alert("⚠️ DIQQAT: Ushbu kirish kodi bilan boshqa yangi qurilmadan tizimga kirildi!\n\nQoidaga ko'ra, bitta kod orqali bir vaqtda faqat 1 ta qurilma ishlashi mumkin. Joriy qurilmadagi sessiyangiz bekor qilindi.");
        return;
      }

      // 2. Server / API tekshirish (agar server mavjud bo'lsa)
      try {
        const res = await fetch(`/api/device-auth?code=${encodeURIComponent(code)}&deviceId=${encodeURIComponent(currentDeviceId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.valid === false) {
            logoutCode();
            alert(data.message || "⚠️ DIQQAT: Sizning kodingiz bilan boshqa yangi qurilmadan kirildi yoki sessiyangiz Telegram orqali chiqarib yuborildi!\n\nSessiyangiz tugatildi.");
          }
        }
      } catch (e) {}

      // 3. Muddati tugaganini tekshirish
      if (accessCodeInfo.expiresAtTimestamp && Date.now() > accessCodeInfo.expiresAtTimestamp) {
        logoutCode();
        alert("⚠️ Diqqat: Sizning obuna va kirish kodingiz muddati tugadi! Iltimos, Telegram botimizdan yangilang.");
      }
    };

    const timer = setInterval(enforceSingleDevice, 4000);
    return () => clearInterval(timer);
  }, [accessCodeInfo, currentDeviceId, isActualOwner]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_prices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('eduhujjat_users', JSON.stringify(usersList));
  }, [usersList]);

  // YANGI QURILMADAN KIRISH VA TASDIQLASH TIZIMI (Single-Device Access Flow)
  const requestDeviceAccess = async (inputCode) => {
    const clean = String(inputCode).trim().toUpperCase();

    // 1. MASTER OWNER KODLARI (Tezkor kirish va bildirishnoma)
    if (clean === '1331' || clean === 'OWNER-VIP' || clean === '777777') {
      const info = {
        code: clean,
        deviceId: currentDeviceId,
        deviceInfo,
        plan: 'unlimited',
        name: 'Fayzbek (Super Owner)',
        userId: SUPER_OWNER_ID,
        username: OWNER_USERNAME,
        role: 'OWNER',
        expiresAtTimestamp: null,
        enteredAt: new Date().toISOString()
      };
      localStorage.setItem('eduhujjat_active_code', JSON.stringify(info));
      localStorage.setItem(`eduhujjat_bound_${clean}`, currentDeviceId);
      setAccessCodeInfo(info);
      setUserAccessStatus('ACTIVE');

      // Super Ownerga xavfsizlik bildirishnomasi (xavfsiz server orqali)
      sendServerOwnerAlert(
        `👑 **SUPER OWNER KIRISHI:**\n\nSiz yangi qurilmadan (\`${deviceInfo}\`) Master VIP kod orqali saytga kirdingiz.\n⏰ Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}`
      );

      return { success: true, instant: true, message: "👑 Master VIP kod qabul qilindi! Cheksiz tizimga xush kelibsiz." };
    }

    // 2. ODDIY VA FOYDALANUVCHI KODLARI (EDU-XXXXXX)
    if (clean.startsWith('EDU-') || /^\d{6}$/.test(clean)) {
      let serverUser = null;
      let isServerApproved = false;
      try {
        const checkResp = await fetch(`/api/device-auth?code=${encodeURIComponent(clean)}&deviceId=${encodeURIComponent(currentDeviceId)}`);
        if (checkResp.ok) {
          const cData = await checkResp.json();
          if (cData && cData.valid && cData.isCurrent) {
            isServerApproved = true;
          }
        }
      } catch(e) {}

      // Agar serverda ushbu qurilma tasdiqlangan bo'lsa
      if (isServerApproved) {
        const oneDayLater = Date.now() + 24 * 60 * 60 * 1000;
        const info = {
          code: clean,
          deviceId: currentDeviceId,
          deviceInfo,
          plan: 'daily',
          name: 'Faol Litsenziat',
          userId: clean.replace('EDU-', ''),
          username: '',
          expiresAtTimestamp: oneDayLater,
          enteredAt: new Date().toISOString()
        };
        localStorage.setItem('eduhujjat_active_code', JSON.stringify(info));
        setAccessCodeInfo(info);
        setUserAccessStatus('ACTIVE');
        return { success: true, instant: true, message: "✅ Xush kelibsiz! Ushbu qurilma tasdiqlangan." };
      }

      // YANGI QURILMA: Foydalanuvchining shaxsiy Telegram botiga ruxsat so'rovi yuboriladi
      const pin = String(Math.floor(1000 + Math.random() * 9000));
      const reqId = 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);

      try {
        const resp = await fetch('/api/device-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'request_login',
            reqId,
            code: clean,
            deviceId: currentDeviceId,
            deviceInfo,
            pin
          })
        });
        const data = await resp.json();
        if (data && data.success === false && data.message) {
          return { success: false, message: data.message };
        }
        serverUser = data?.user;
      } catch(e) {
        console.error("Device auth request error:", e);
      }

      return {
        success: false,
        requiresApproval: true,
        reqId,
        pin,
        code: clean,
        user: serverUser,
        deviceInfo,
        message: "⏳ Yangi qurilma aniqlandi! Sizning Telegram botingiz (@eduhujjat_bot) ga tasdiqlash xabari yuborildi."
      };
    }

    return { 
      success: false, 
      message: "❌ Noto'g'ri kod! Kodni Telegram botimiz (@eduhujjat_bot) dan '🔑 Saytga Kirish Kodi' tugmasi orqali oling." 
    };
  };

  // PIN-kod orqali tasdiqlash
  const approveDeviceByPin = (reqData, enteredPin) => {
    if (!reqData || !enteredPin) return { success: false, message: "PIN-kod kiritilmadi!" };

    if (String(reqData.pin).trim() === String(enteredPin).trim() || enteredPin === '1331') {
      const oneDayLater = Date.now() + 24 * 60 * 60 * 1000;
      const info = {
        code: reqData.code,
        deviceId: currentDeviceId,
        deviceInfo,
        plan: 'daily',
        name: reqData.user?.name || 'Faol Litsenziat',
        userId: reqData.user?.id || reqData.code.replace('EDU-', ''),
        username: reqData.user?.username || '',
        expiresAtTimestamp: oneDayLater,
        enteredAt: new Date().toISOString()
      };

      // Oldingi qurilmani bekor qilib, ushbu qurilmaga bog'lash
      localStorage.setItem(`eduhujjat_bound_${reqData.code}`, currentDeviceId);
      localStorage.setItem('eduhujjat_active_code', JSON.stringify(info));
      setAccessCodeInfo(info);
      setUserAccessStatus('ACTIVE');

      // Serverless API ga ham xabar berish
      try {
        fetch('/api/device-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'bind_device',
            code: reqData.code,
            deviceId: currentDeviceId,
            deviceInfo
          })
        });
      } catch(e) {}

      // Telegramda ham tasdiqlanganini e'lon qilish (xavfsiz server orqali)
      sendServerOwnerAlert(
        `✅ **QURILMA TASDIQLANDI!**\n\nKod: \`${reqData.code}\`\nYangi Qurilma: ${deviceInfo}\nSana: ${new Date().toLocaleTimeString('uz-UZ')}\nOldingi qurilma sessiyasi bekor qilindi.`
      );

      return { success: true, message: "✅ Yangi qurilma muvaffaqiyatli tasdiqlandi! Tizimga xush kelibsiz." };
    }

    return { success: false, message: "❌ Noto'g'ri PIN-kod! Telegram botga yuborilgan 4 xonali kodni kiriting." };
  };

  // Botdagi [✅ Ruxsat berish] tugmasi bosilganini tekshirish (Polling)
  const checkRemoteApproval = async (reqId, code) => {
    try {
      const res = await fetch(`/api/device-auth?reqId=${encodeURIComponent(reqId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'APPROVED') {
          const oneDayLater = Date.now() + 24 * 60 * 60 * 1000;
          const info = {
            code,
            deviceId: currentDeviceId,
            deviceInfo,
            plan: 'daily',
            name: data.user?.name || 'Faol Litsenziat',
            userId: data.user?.id || code.replace('EDU-', ''),
            username: data.user?.username || '',
            expiresAtTimestamp: oneDayLater,
            enteredAt: new Date().toISOString()
          };
          localStorage.setItem(`eduhujjat_bound_${code}`, currentDeviceId);
          localStorage.setItem('eduhujjat_active_code', JSON.stringify(info));
          setAccessCodeInfo(info);
          setUserAccessStatus('ACTIVE');
          return { approved: true, status: 'APPROVED' };
        } else if (data.status === 'DENIED') {
          return { denied: true, status: 'DENIED' };
        }
      }
    } catch(e) {}
    return { pending: true };
  };

  // Qurilmani chiqarib yuborish (Kick Current Device)
  const kickCurrentDevice = async () => {
    if (!accessCodeInfo?.code) return;
    try {
      await fetch('/api/device-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'kick_device', code: accessCodeInfo.code })
      });
    } catch(e) {}
    logoutCode();
  };

  const logoutCode = () => {
    localStorage.removeItem('eduhujjat_active_code');
    setAccessCodeInfo(null);
    setUserAccessStatus('PENDING');
  };

  // Har bir foydalanuvchi amalini real-time audit qilish (Audit Logger)
  const logActivity = (actionType, actionLabel, details) => {
    try {
      const activeCode = accessCodeInfo?.code || localStorage.getItem('eduhujjat_active_code');
      let code = '';
      let userName = currentUser?.first_name || 'Veb Foydalanuvchi';
      let userId = currentUser?.id || SUPER_OWNER_ID;
      if (activeCode) {
        if (typeof activeCode === 'string' && activeCode.startsWith('{')) {
          try {
            const parsed = JSON.parse(activeCode);
            code = parsed.code || '';
            userName = parsed.name || userName;
            userId = parsed.userId || parsed.code || userId;
          } catch(e) {}
        } else if (typeof activeCode === 'string') {
          code = activeCode;
        }
      }
      const entry = {
        id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: String(userId),
        userName,
        code,
        action: actionType,
        actionLabel,
        details: String(details || '').slice(0, 300),
        deviceInfo,
        timestamp: Date.now(),
        timeFormatted: new Date().toLocaleString('uz-UZ')
      };

      // 1. Mahalliy xotiraga saqlash
      const saved = localStorage.getItem('eduhujjat_recent_activities');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(entry);
      localStorage.setItem('eduhujjat_recent_activities', JSON.stringify(list.slice(0, 500)));

      // 2. Serverless bazaga uzatish
      fetch('/api/device-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_activity',
          userId: String(userId),
          userName,
          code,
          actionType,
          actionLabel,
          details,
          deviceInfo
        })
      }).catch(() => {});
    } catch(e) {}
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
    // Saytga kirish uchun faol litsenziya kodi yoki Master kod (1331) bo'lishi shart!
    if (accessCodeInfo?.code && userAccessStatus === 'ACTIVE') return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentDeviceId,
      deviceInfo,
      activeRole,
      setActiveRole,
      isActualOwner,
      userAccessStatus,
      prices,
      admins,
      usersList,
      accessCodeInfo,
      requestDeviceAccess,
      approveDeviceByPin,
      checkRemoteApproval,
      logoutCode,
      kickCurrentDevice,
      logActivity,
      addAdmin,
      removeAdmin,
      updatePrices,
      approveUser,
      blockUser,
      hasAccess,
      OWNER_USERNAME,
      SUPER_OWNER_ID
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
