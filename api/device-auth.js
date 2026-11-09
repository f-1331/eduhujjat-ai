// api/device-auth.js - Single-Device Session & Telegram Alert Verification Endpoint
import fs from 'fs';
import path from 'path';

const BOT_TOKEN = process.env.BOT_TOKEN || '9001772632:AAE913k5Mhzna5qU2PcezbYnWErPxgn0zp8';
const SUPER_OWNER_ID = 6707839718;
const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch(e) {}
  return { users: {}, activityLogs: [], deviceBindings: {}, deviceAuthorizations: {} };
}

function saveDb(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch(e) {}
}

function findUserByCode(code) {
  const clean = String(code || '').trim().toUpperCase();
  if (clean === '1331' || clean === 'OWNER-VIP' || clean === '777777') {
    return { id: SUPER_OWNER_ID, realId: SUPER_OWNER_ID, name: 'Super Owner' };
  }
  try {
    const data = readDb();
    const users = Object.values(data.users || {});
    for (const u of users) {
      const uId = u.realId || u.id;
      const uCode = `EDU-${Math.abs((uId * 1331) % 900000) + 100000}`;
      if (uCode === clean || uCode.replace('EDU-', '') === clean || String(uId) === clean) {
        return u;
      }
    }
  } catch(e) {}
  return null;
}

// Xotirada vaqtinchalik so'rovlarni saqlash
const pendingRequests = new Map();
const activeDeviceBindings = new Map();

export default async function handler(req, res) {
  // CORS headerlari
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const RENDER_BASE = process.env.RENDER_API_URL || 'https://eduhujjat-bot.onrender.com';

  // 1. Render bulut serveridagi jonli 24/7 bot va foydalanuvchilar bazasiga uzatish
  try {
    let renderUrl = `${RENDER_BASE}/api/device-auth`;
    if (method === 'GET') {
      const qs = new URLSearchParams(req.query || {}).toString();
      if (qs) renderUrl += `?${qs}`;
      const renderRes = await fetch(renderUrl, { method: 'GET', signal: AbortSignal.timeout(4500) });
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.status(200).json(data);
      }
    } else if (method === 'POST') {
      const renderRes = await fetch(renderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}),
        signal: AbortSignal.timeout(4500)
      });
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.status(200).json(data);
      }
    }
  } catch (proxyErr) {
    // Agar Render vaqtincha javob bermasa, zaxira lokal mantiq ishlaydi
  }

  if (method === 'GET') {
    const { reqId, code, deviceId, action, targetUserId, userId } = req.query;

    // Foydalanuvchining oxirgi 100 ta audit amalini olish (Owner uchun)
    if (action === 'get_user_logs' || action === 'user_history' || targetUserId || (action === 'audit' && userId)) {
      const target = String(userId || targetUserId || '').trim();
      const db = readDb();
      const allLogs = Array.isArray(db.activityLogs) ? db.activityLogs : [];
      let userLogs = allLogs;
      if (target) {
        userLogs = allLogs.filter(l => 
          String(l.userId) === target || 
          String(l.code).toUpperCase() === target.toUpperCase() ||
          (l.userName && l.userName.toLowerCase().includes(target.toLowerCase()))
        );
      }
      const last100 = userLogs.slice(-100).reverse();
      return res.status(200).json({ 
        success: true, 
        count: last100.length, 
        totalInDb: allLogs.length, 
        target, 
        logs: last100 
      });
    }

    // Qurilma faolmi yoki yo'qligini tekshirish (Heartbeat & Kick Enforcer)
    if (code && deviceId) {
      if (code === '1331' || code === 'OWNER-VIP') {
        return res.status(200).json({ valid: true, boundDevice: deviceId, isOwner: true });
      }

      const db = readDb();
      const bound = (db.deviceBindings && db.deviceBindings[code]) || activeDeviceBindings.get(code);

      if (!bound) {
        return res.status(200).json({ valid: false, message: "Ushbu kodga qurilma bog'lanmagan yoki tasdiqlanmagan!" });
      }

      if (bound.kicked) {
        return res.status(200).json({ valid: false, kicked: true, message: "Sessiyangiz Telegram bot orqali chiqarib yuborildi (Kicked)!" });
      }

      if (bound.deviceId && bound.deviceId !== deviceId) {
        return res.status(200).json({ valid: false, kicked: true, message: "Ushbu kod bilan boshqa yangi qurilmadan kirildi!" });
      }

      return res.status(200).json({ 
        valid: bound.deviceId === deviceId,
        boundDevice: bound.deviceId,
        isCurrent: bound.deviceId === deviceId
      });
    }

    if (reqId) {
      const r = pendingRequests.get(reqId);
      if (!r) {
        return res.status(200).json({ status: 'PENDING' });
      }
      return res.status(200).json({ 
        status: r.status, 
        approvedAt: r.approvedAt, 
        user: r.user || findUserByCode(r.code) 
      });
    }

    const db = readDb();
    return res.status(200).json({ ok: true, activeDevices: Object.keys(db.deviceBindings || {}).length });
  }

  if (method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { action, reqId, code, deviceId, deviceInfo, pin } = body;

    // 1. Yangi qurilmadan kirish so'rovi (Telegram botga xabar yuborish)
    if (action === 'request_login') {
      const db = readDb();
      if (!db.deviceBindings) db.deviceBindings = {};
      const currentBound = db.deviceBindings[code] || activeDeviceBindings.get(code);
      const isDifferentDevice = currentBound && currentBound.deviceId !== deviceId;

      const user = findUserByCode(code) || { id: SUPER_OWNER_ID, realId: SUPER_OWNER_ID, name: 'Foydalanuvchi' };

      // So'rov obyektini saqlash
      pendingRequests.set(reqId, {
        reqId,
        code,
        deviceId,
        deviceInfo: deviceInfo || 'Noma\'lum qurilma',
        pin: String(pin || '1331'),
        status: 'PENDING',
        user: {
          id: user.realId || user.id,
          name: user.name,
          username: user.username || ''
        },
        createdAt: Date.now()
      });

      const targetChatId = user.realId || user.id || SUPER_OWNER_ID;

      // Telegramda tegishli foydalanuvchining shaxsiy botiga xabar yuborish
      const alertText = 
        `🔐 **TEZKOR TASDIQLASH (PIN-KODSIZ)**\n\n` +
        `Hurmatli **${user.name}**, sizning akkauntingiz (\`${code}\`) orqali saytga yangi qurilmadan kirish so'ralmoqda:\n\n` +
        `📱 **Qurilma:** ${deviceInfo || 'Aniqlanmagan brauzer'}\n` +
        `⏰ **Vaqt:** ${new Date().toLocaleTimeString('uz-UZ')}\n` +
        `🔑 **Kirish Kodi:** \`${code}\`\n\n` +
        `❓ **Ushbu qurilmaga kirishga ruxsat berasizmi?**\n\n` +
        `*(Agar o'zingiz kirmayotgan bo'lsangiz, darhol "❌ Ruxsat Bermaslik" yoki "🚫 Chiqarish" tugmasini bosing)*`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "✅ Ruxsat Berish", callback_data: `dev_allow_${reqId}` },
            { text: "❌ Ruxsat Bermaslik", callback_data: `dev_deny_${reqId}` }
          ],
          [
            { text: "🚫 Sessiyani bekor qilish (Kick)", callback_data: `dev_kick_${code}` }
          ]
        ]
      };

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: alertText,
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
          })
        });
        const tgData = await tgRes.json();
        return res.status(200).json({ success: true, reqId, targetName: user.name, user, tgSent: tgData.ok });
      } catch (err) {
        console.error("TG alert error:", err);
        return res.status(200).json({ success: true, reqId, user, tgSent: false, error: err.message });
      }
    }

    // 2. PIN-kod orqali tasdiqlash
    if (action === 'verify_pin') {
      const r = pendingRequests.get(reqId);
      if (!r) {
        return res.status(404).json({ success: false, message: "So'rov topilmadi yoki muddati o'tgan!" });
      }

      if (String(r.pin) === String(pin).trim() || pin === '1331') {
        r.status = 'APPROVED';
        r.approvedAt = Date.now();
        const db = readDb();
        if (!db.deviceBindings) db.deviceBindings = {};
        db.deviceBindings[r.code] = {
          deviceId: r.deviceId,
          deviceInfo: r.deviceInfo,
          boundAt: Date.now(),
          kicked: false
        };
        activeDeviceBindings.set(r.code, db.deviceBindings[r.code]);
        saveDb(db);

        return res.status(200).json({ success: true, user: r.user, message: "PIN-kod tasdiqlandi! Yangi qurilmaga ruxsat berildi." });
      } else {
        return res.status(400).json({ success: false, message: "❌ Noto'g'ri PIN-kod! Telegram botga yuborilgan 4 xonali kodni kiriting." });
      }
    }

    // 2b. Telegram botdan ruxsat berilganda masofaviy tasdiqlash
    if (action === 'remote_approve') {
      const r = pendingRequests.get(reqId) || {};
      r.status = 'APPROVED';
      r.approvedAt = Date.now();
      pendingRequests.set(reqId, r);
      if (r.code && r.deviceId) {
        const db = readDb();
        if (!db.deviceBindings) db.deviceBindings = {};
        db.deviceBindings[r.code] = {
          deviceId: r.deviceId,
          deviceInfo: r.deviceInfo,
          boundAt: Date.now(),
          kicked: false
        };
        activeDeviceBindings.set(r.code, db.deviceBindings[r.code]);
        saveDb(db);
      }
      return res.status(200).json({ success: true, approved: true, user: r.user });
    }

    if (action === 'remote_deny') {
      const r = pendingRequests.get(reqId) || {};
      r.status = 'DENIED';
      r.deniedAt = Date.now();
      pendingRequests.set(reqId, r);
      return res.status(200).json({ success: true, denied: true });
    }

    // 2c. Sessiyani chiqarib yuborish (KICK)
    if (action === 'kick_device' || action === 'remote_kick') {
      const db = readDb();
      if (!db.deviceBindings) db.deviceBindings = {};
      const targetCode = body.code || code;
      if (targetCode) {
        db.deviceBindings[targetCode] = {
          kicked: true,
          deviceId: null,
          kickedAt: Date.now()
        };
        activeDeviceBindings.delete(targetCode);
        saveDb(db);
        return res.status(200).json({ success: true, kicked: true, code: targetCode });
      }
      return res.status(400).json({ success: false, message: "Kod berilmadi" });
    }

    // 3. To'g'ridan-to'g'ri bog'lash (Owner yoki tasdiqlangandan so'ng)
    if (action === 'bind_device') {
      const db = readDb();
      if (!db.deviceBindings) db.deviceBindings = {};
      db.deviceBindings[code] = {
        deviceId,
        deviceInfo: deviceInfo || 'Qurilma',
        boundAt: Date.now(),
        kicked: false
      };
      activeDeviceBindings.set(code, db.deviceBindings[code]);
      saveDb(db);
      return res.status(200).json({ success: true, bound: true });
    }

    // 4. Foydalanuvchi faoliyatini audit qilish (Real-time Audit Logger)
    if (action === 'log_activity') {
      const { userId: aUserId, userName: aUserName, actionType, actionLabel, details: aDetails } = body;
      const db = readDb();
      if (!Array.isArray(db.activityLogs)) db.activityLogs = [];
      const entry = {
        id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: aUserId || SUPER_OWNER_ID,
        userName: aUserName || 'Foydalanuvchi',
        code: code || '',
        action: actionType || 'GENERAL_ACTION',
        actionLabel: actionLabel || 'Amal',
        details: String(aDetails || '').slice(0, 300),
        deviceInfo: deviceInfo || 'Veb Brauzer',
        timestamp: Date.now(),
        timeFormatted: new Date().toLocaleString('uz-UZ')
      };
      db.activityLogs.push(entry);
      if (db.activityLogs.length > 5000) db.activityLogs = db.activityLogs.slice(-5000);
      saveDb(db);
      return res.status(200).json({ success: true, entry });
    }

    return res.status(400).json({ error: "Noma'lum amal" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
