// api/device-auth.js - Single-Device Session & Telegram Alert Verification Endpoint
import fs from 'fs';
import path from 'path';

const BOT_TOKEN = process.env.BOT_TOKEN || '9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk';
const SUPER_OWNER_ID = 6707839718;

function findUserByCode(code) {
  const clean = String(code || '').trim().toUpperCase();
  if (clean === '1331' || clean === 'OWNER-VIP' || clean === '777777') {
    return { id: SUPER_OWNER_ID, realId: SUPER_OWNER_ID, name: 'Super Owner' };
  }
  try {
    const dbPath = path.join(process.cwd(), 'data', 'database.json');
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const users = Object.values(data.users || {});
      for (const u of users) {
        const uId = u.realId || u.id;
        const uCode = `EDU-${Math.abs((uId * 1331) % 900000) + 100000}`;
        if (uCode === clean || uCode.replace('EDU-', '') === clean || String(uId) === clean) {
          return u;
        }
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

  if (method === 'GET') {
    const { reqId, code, deviceId } = req.query;

    // Qurilma faolmi yoki yo'qligini tekshirish (Heartbeat)
    if (code && deviceId) {
      const bound = activeDeviceBindings.get(code);
      if (!bound) {
        return res.status(200).json({ valid: true, boundDevice: deviceId });
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
      return res.status(200).json({ status: r.status, approvedAt: r.approvedAt });
    }

    return res.status(200).json({ ok: true, activeDevices: activeDeviceBindings.size });
  }

  if (method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { action, reqId, code, deviceId, deviceInfo, pin } = body;

    // 1. Yangi qurilmadan kirish so'rovi (Telegram botga xabar yuborish)
    if (action === 'request_login') {
      const currentBound = activeDeviceBindings.get(code);
      const isDifferentDevice = currentBound && currentBound.deviceId !== deviceId;

      // So'rov obyektini saqlash
      pendingRequests.set(reqId, {
        reqId,
        code,
        deviceId,
        deviceInfo: deviceInfo || 'Noma\'lum qurilma',
        pin: String(pin),
        status: 'PENDING',
        createdAt: Date.now()
      });

      const user = findUserByCode(code) || { id: SUPER_OWNER_ID, realId: SUPER_OWNER_ID, name: 'Foydalanuvchi' };
      const targetChatId = user.realId || user.id || SUPER_OWNER_ID;

      // Telegramda tegishli foydalanuvchining shaxsiy botiga xabar yuborish
      const alertText = 
        `🚨 **XAVFSIZLIK: YANGI QURILMADAN KIRISHGA URINISH!**\n\n` +
        `Hurmatli **${user.name}**, sizning kodingiz (\`${code}\`) orqali saytga yangi qurilmadan kirilmoqda:\n\n` +
        `📱 **Qurilma:** ${deviceInfo || 'Aniqlanmagan brauzer'}\n` +
        `⏰ **Vaqt:** ${new Date().toLocaleTimeString('uz-UZ')}\n` +
        `🔑 **Kirish Kodi:** \`${code}\`\n` +
        `🔢 **Tasdiqlash PIN-kodi:** \`${pin}\`\n\n` +
        `❓ **Shu qurilmadan kirilmoqda, ruxsat berasizmi?**\n\n` +
        `*(Agar o'zingiz kirmayotgan bo'lsangiz, darhol "❌ Yo'q, rad etish" tugmasini bosing)*`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "✅ Ha, ruxsat berish", callback_data: `dev_allow_${reqId}` },
            { text: "❌ Yo'q, rad etish", callback_data: `dev_deny_${reqId}` }
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
        return res.status(200).json({ success: true, reqId, targetName: user.name, tgSent: tgData.ok });
      } catch (err) {
        console.error("TG alert error:", err);
        return res.status(200).json({ success: true, reqId, tgSent: false, error: err.message });
      }
    }

    // 2. PIN-kod orqali tasdiqlash
    if (action === 'verify_pin') {
      const r = pendingRequests.get(reqId);
      if (!r) {
        return res.status(404).json({ success: false, message: "So'rov topilmadi yoki muddati o'tgan!" });
      }

      if (String(r.pin) === String(pin).trim()) {
        r.status = 'APPROVED';
        r.approvedAt = Date.now();
        // Yangi qurilmani bog'lash (oldingisi bekor bo'ladi)
        activeDeviceBindings.set(r.code, {
          deviceId: r.deviceId,
          deviceInfo: r.deviceInfo,
          boundAt: Date.now()
        });

        return res.status(200).json({ success: true, message: "PIN-kod tasdiqlandi! Yangi qurilmaga ruxsat berildi." });
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
        activeDeviceBindings.set(r.code, {
          deviceId: r.deviceId,
          deviceInfo: r.deviceInfo,
          boundAt: Date.now()
        });
      }
      return res.status(200).json({ success: true, approved: true });
    }

    if (action === 'remote_deny') {
      const r = pendingRequests.get(reqId) || {};
      r.status = 'DENIED';
      r.deniedAt = Date.now();
      pendingRequests.set(reqId, r);
      return res.status(200).json({ success: true, denied: true });
    }

    // 3. To'g'ridan-to'g'ri bog'lash (Owner yoki tasdiqlangandan so'ng)
    if (action === 'bind_device') {
      activeDeviceBindings.set(code, {
        deviceId,
        deviceInfo: deviceInfo || 'Qurilma',
        boundAt: Date.now()
      });
      return res.status(200).json({ success: true, bound: true });
    }

    return res.status(400).json({ error: "Noma'lum amal" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
