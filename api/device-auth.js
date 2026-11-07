// api/device-auth.js - Single-Device Session & Telegram Alert Verification Endpoint
const BOT_TOKEN = process.env.BOT_TOKEN || '9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk';
const SUPER_OWNER_ID = 6707839718;

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

      // Telegram Super Ownerga xabar yuborish
      const alertText = 
        `🚨 **XAVFSIZLIK OGOHLANTIRISHI: Yangi qurilmadan kirishga urinish!**\n\n` +
        `🔑 **Kirish Kodi:** \`${code}\`\n` +
        `📱 **Yangi Qurilma:** ${deviceInfo || 'Aniqlanmagan brauzer'}\n` +
        `⏰ **Vaqt:** ${new Date().toLocaleTimeString('uz-UZ')}\n` +
        `🔢 **Tezkor PIN-kod:** \`${pin}\`\n\n` +
        `⚠️ **DIQQAT:** Qoidaga ko'ra, bitta kod bilan faqat **1 ta qurilma** ishlay oladi!\n` +
        `Agar ruxsat bersangiz, oldingi qurilma sessiyasi avtomatik bekor qilinadi.`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "✅ Ruxsat berish (Eskisini chiqarish)", callback_data: `dev_allow_${reqId}` },
            { text: "❌ Rad etish", callback_data: `dev_deny_${reqId}` }
          ]
        ]
      };

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: SUPER_OWNER_ID,
            text: alertText,
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
          })
        });
        const tgData = await tgRes.json();
        return res.status(200).json({ success: true, reqId, tgSent: tgData.ok });
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
