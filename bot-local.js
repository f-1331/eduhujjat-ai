// bot-local.js - Ko'p funksiyali Telegram Bot (Reply Keyboards, Role Switching, Dynamic Billing)
import { Bot, InlineKeyboard, Keyboard, InputFile } from 'grammy';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import pptxgen from 'pptxgenjs';

// .env faylini yuklash (Node 20+ native yoki dotenv)
try {
  if (process.loadEnvFile) {
    process.loadEnvFile('.env');
  } else {
    const dotenv = await import('dotenv');
    dotenv.config();
  }
} catch (e) {
  // .env mavjud bo'lmasa yoki allaqachon yuklangan bo'lsa
}

const BOT_TOKEN = process.env.BOT_TOKEN || '9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduhujjat.vercel.app';
const OWNER_USERNAME = (process.env.OWNER_USERNAME || 'fayzbek1331').replace('@', '');

const bot = new Bot(BOT_TOKEN);

// Ma'lumotlar bazasi (Xotira / Memory DB)
const db = {
  prices: {
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
  },
  admins: new Set(['fayzbek1331']),
  ownerChatId: null,
  users: new Map(),
  userSessions: new Map(),
  // Owner roli simulyatori (Owner o'zini admin, tekshiruvchi yoki oddiy qilib sinab ko'rishi uchun)
  simulatedRoles: new Map() // userId -> 'OWNER' | 'ADMIN' | 'INSPECTOR' | 'USER'
};

// 1. Rollarni aniqlash
function getEffectiveRole(ctx) {
  const userId = ctx.from?.id;
  const username = ctx.from?.username?.toLowerCase();
  const isRealOwner = username === OWNER_USERNAME.toLowerCase();

  // Agar real owner rolini vaqtincha o'zgartirgan bo'lsa
  if (isRealOwner && db.simulatedRoles.has(userId)) {
    return db.simulatedRoles.get(userId);
  }

  if (isRealOwner) return 'OWNER';
  if (username && db.admins.has(username)) return 'ADMIN';
  return 'USER';
}

function isRealSuperOwner(ctx) {
  const username = ctx.from?.username?.toLowerCase();
  return username === OWNER_USERNAME.toLowerCase();
}

function isUserActive(userId, username) {
  const role = db.simulatedRoles.get(userId);
  if (role === 'USER') {
    // Agar Owner o'zini oddiy foydalanuvchi qilib tekshirayotgan bo'lsa
    const u = db.users.get(userId);
    return u?.status === 'ACTIVE';
  }

  if (username && username.toLowerCase() === OWNER_USERNAME.toLowerCase()) return true;
  if (username && db.admins.has(username.toLowerCase())) return true;
  
  const user = db.users.get(userId);
  if (!user || user.status !== 'ACTIVE') return false;

  if (typeof user.remainingUses === 'number' && user.remainingUses <= 0) {
    user.status = 'PENDING';
    return false;
  }
  return true;
}

// 2. KLAVIATURADA TURADIGAN TUGMALAR (REPLY KEYBOARDS)
function getReplyKeyboardForRole(role, isRegisteredActive = false) {
  if (role === 'OWNER') {
    return new Keyboard()
      .text("🎭 Rejimni Almashtirish").text("⚡ Tezkor Yoqish").row()
      .text("💰 Narxlar").text("👥 Foydalanuvchilar").row()
      .text("🛡 Adminlar").text("📊 Statistika").row()
      .text("🌐 WebApp Ochish").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }

  if (role === 'ADMIN') {
    return new Keyboard()
      .text("⚡ Tezkor Yoqish").text("👥 Foydalanuvchilar").row()
      .text("💰 Narxlar").text("📊 Statistika").row()
      .text("🎭 Rejimni Qaytarish (Owner)").text("🌐 WebApp Ochish").row()
      .text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }

  if (role === 'INSPECTOR') {
    return new Keyboard()
      .text("🔍 Nazorat / Tekshirish").text("📊 Statistika").row()
      .text("👥 Foydalanuvchilar").text("🎭 Rejimni Qaytarish (Owner)").row()
      .text("🌐 WebApp Ochish").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }

  // Oddiy Foydalanuvchi:
  if (isRegisteredActive) {
    return new Keyboard()
      .text("📄 Demo Ma'lumot").text("ℹ️ Mening Hisobim").row()
      .text("💳 Muddatni Uzaytirish").text("🌐 WebApp Ochish").row()
      .text("🎭 Rejimni Qaytarish (Owner)").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  } else {
    return new Keyboard()
      .text("💳 Litsenziya Sotib Olish").text("💰 Narxlar va Tariflar").row()
      .text("ℹ️ Bot Qoidalari").text("🌐 WebApp Ochish").row()
      .text("🎭 Rejimni Qaytarish (Owner)").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }
}

// Barcha tariflar tugmalarini hosil qiluvchi klaviatura
function getTariffInlineKeyboard(userId) {
  return new InlineKeyboard()
    .text(`⚡ 1 Martalik (2 000 so'm)`, `buy_oneTime_${userId}`)
    .text(`⚡ 2 Martalik (4 000 so'm)`, `buy_twoTime_${userId}`)
    .row()
    .text(`⚡ 5 Martalik (8 000 so'm)`, `buy_fiveTime_${userId}`)
    .text(`⏱ 1 Soatlik (3 000 so'm)`, `buy_hourly_${userId}`)
    .row()
    .text(`⏱ 2 Soatlik (5 000 so'm)`, `buy_twoHours_${userId}`)
    .text(`⏱ 3 Soatlik (7 000 so'm)`, `buy_threeHours_${userId}`)
    .row()
    .text(`📅 1 Kunlik (5 000 so'm)`, `buy_daily_${userId}`)
    .text(`🗓 1 Haftalik (25 000 so'm)`, `buy_weekly_${userId}`)
    .row()
    .text(`⭐ 1 Oylik Pro (70 000 so'm)`, `buy_monthly_${userId}`)
    .text(`👑 Cheksiz VIP (290 000 so'm)`, `buy_unlimited_${userId}`)
    .row()
    .webApp("🌐 WebApp orqali ochish", WEBAPP_URL);
}

// Owner uchun tezkor yoqish tugmalari
function getOwnerActionKeyboard(targetUserId) {
  return new InlineKeyboard()
    .text(`⚡ 1 Martalik`, `act_${targetUserId}_1time`)
    .text(`⚡ 2 Martalik`, `act_${targetUserId}_2time`)
    .text(`⚡ 5 Martalik`, `act_${targetUserId}_5time`)
    .row()
    .text(`⏱ 1 Soat`, `act_${targetUserId}_1h`)
    .text(`⏱ 2 Soat`, `act_${targetUserId}_2h`)
    .text(`⏱ 3 Soat`, `act_${targetUserId}_3h`)
    .row()
    .text(`📅 1 Kun`, `act_${targetUserId}_1d`)
    .text(`🗓 1 Hafta`, `act_${targetUserId}_1w`)
    .text(`⭐ 1 Oy`, `act_${targetUserId}_1m`)
    .row()
    .text(`👑 Cheksiz VIP`, `act_${targetUserId}_vip`)
    .text(`❌ Rad etish`, `block_${targetUserId}`);
}

// Rejimni o'zgartirish Inline klaviaturasi
function getRoleSwitchKeyboard() {
  return new InlineKeyboard()
    .text("👑 Super Owner Rejimi", "set_role_OWNER")
    .row()
    .text("🛡️ Administrator Rejimi", "set_role_ADMIN")
    .row()
    .text("🔍 Tekshiruvchi (Auditor)", "set_role_INSPECTOR")
    .row()
    .text("👤 Oddiy Foydalanuvchi (Yopiq)", "set_role_USER");
}

// /start buyrug'i
bot.command('start', async (ctx) => {
  const user = ctx.from;
  const userId = user.id;
  const username = user.username || '';
  const fullName = `${user.first_name} ${user.last_name || ''}`.trim();

  if (isRealSuperOwner(ctx)) {
    db.ownerChatId = ctx.chat.id;
  }

  if (!db.users.has(userId)) {
    db.users.set(userId, {
      id: userId,
      name: fullName,
      username,
      status: isRealSuperOwner(ctx) ? 'ACTIVE' : 'PENDING',
      plan: isRealSuperOwner(ctx) ? 'unlimited' : 'none',
      expiresAt: null,
      remainingUses: null,
      registeredAt: new Date().toISOString()
    });
  }

  const role = getEffectiveRole(ctx);
  const active = isUserActive(userId, username);
  const replyKeyboard = getReplyKeyboardForRole(role, active);

  // A) OWNER:
  if (role === 'OWNER') {
    return ctx.reply(
      `👑 **ASSALOMU ALAYKUM SUPER OWNER @${OWNER_USERNAME}!**\n\n` +
      `Siz **EduHujjat AI** tizimining mutlaq boshqaruvchisiz.\n\n` +
      `⌨️ **Klaviatura tugmalari faollashtirildi!** Endi pastdagi barcha tugmalar orqali botni qulay boshqarishingiz mumkin.\n\n` +
      `🎭 **Rejimni sinash:** Istalgan vaqtda pastdagi \`🎭 Rejimni Almashtirish\` tugmasi orqali o'zingizni *Admin*, *Tekshiruvchi* yoki *Oddiy Foydalanuvchi* rejimiga o'tkazib tekshirib ko'rishingiz mumkin!\n\n` +
      `⚡ **Tezkor Yoqish:**\n` +
      `• \`/active ${userId} 2h\` yoki \`${userId} 2soat\`\n` +
      `• \`/active ${userId} 2time\` yoki \`${userId} 2martalik\`\n` +
      `• \`/active ${userId} 1m\` (1 oy)`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  // B) ADMIN:
  if (role === 'ADMIN') {
    return ctx.reply(
      `🛡️ **ASSALOMU ALAYKUM ADMINISTRATOR!**\n\n` +
      `Sizda yangi foydalanuvchilarni faollashtirish, litsenziya berish va foydalanuvchilar holatini ko'rish huquqi bor.\n\n` +
      `👇 Pastdagi klaviatura tugmalaridan foydalaning:`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  // C) TEKSHIRUVCHI (INSPECTOR):
  if (role === 'INSPECTOR') {
    return ctx.reply(
      `🔍 **ASSALOMU ALAYKUM TEKSHIRUVCHI (INSPECTOR)!**\n\n` +
      `Siz auditorlik va nazorat rejimidasiz. Tizim statistikasi va foydalanuvchilar hisobotini ko'rishingiz mumkin.\n\n` +
      `👇 Pastdagi klaviatura tugmalaridan foydalaning:`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  // D) ODDIY FOYDALANUVCHI (YOPIQ):
  if (!active) {
    return ctx.reply(
      `🔒 **ASSALOMU ALAYKUM, ${fullName}!**\n\n` +
      `**"EduHujjat AI"** — Maktablar, talabalar va ofis xodimlari uchun yopiq professional hujjat tizimi.\n\n` +
      `Sizning Telegram ID: \`${userId}\`\n\n` +
      `👇 **Kerakli tarif tugmasini bosing:** Ma'lumotlaringiz va narx avtomatik tarzda boshqaruvchiga (@${OWNER_USERNAME}) yuboriladi va to'lovdan so'ng hisobingiz darhol yoqib beriladi:`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    ).then(() => {
      ctx.reply(`👇 **Tarifni tanlang:**`, { reply_markup: getTariffInlineKeyboard(userId) });
    });
  }

  // E) FAOL FOYDALANUVCHI:
  const curUser = db.users.get(userId);
  const remainingInfo = curUser?.remainingUses ? `(Qolgan imkoniyat: ${curUser.remainingUses} ta)` : '';

  return ctx.reply(
    `✅ **XUSH KELIBSIZ, ${fullName}!**\n\n` +
    `Sizning hisobingiz faol! ${remainingInfo}\nHujjat matnini yoki Word/Excel faylini tashlang, tizim avtomatik tayyorlab beradi.`,
    { parse_mode: 'Markdown', reply_markup: replyKeyboard }
  );
});

// Inline tugmalar bosilganda
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  // Rejimni almashtirish menyusi
  if (data === 'switch_roles') {
    if (!isRealSuperOwner(ctx)) return ctx.answerCallbackQuery({ text: "Faqat Owner uchun!" });
    return ctx.reply("🎭 **Qaysi rejimga o'tmoqchisiz?**", { reply_markup: getRoleSwitchKeyboard() });
  }

  // Rejimni tanlaganda
  if (data.startsWith('set_role_')) {
    if (!isRealSuperOwner(ctx)) return ctx.answerCallbackQuery({ text: "Faqat Owner uchun!" });
    const targetRole = data.replace('set_role_', '');
    db.simulatedRoles.set(userId, targetRole);
    await ctx.answerCallbackQuery({ text: `Rejim: ${targetRole} ga o'tkazildi!` });

    const replyKb = getReplyKeyboardForRole(targetRole, targetRole === 'USER' ? false : true);
    return ctx.reply(
      `🎭 **Siz muvaffaqiyatli [${targetRole}] rejimiga o'tdingiz!**\n\n` +
      `Endi bot va pastdagi klaviatura aynan shu rejimdagidek ishlaydi.\n` +
      `Asosiy rejimga qaytish uchun pastdagi \`🎭 Rejimni Qaytarish (Owner)\` tugmasini bosing.`,
      { parse_mode: 'Markdown', reply_markup: replyKb }
    );
  }

  // Tarif tanlanganda: buy_{plan}_{userId}
  if (data.startsWith('buy_')) {
    const [_, plan, userIdStr] = data.split('_');
    const targetUserId = parseInt(userIdStr, 10);

    const planLabels = {
      oneTime: "1 Martalik Hujjat",
      twoTime: "2 Martalik Hujjat",
      fiveTime: "5 Martalik Hujjat",
      hourly: "1 Soatlik Kirish",
      twoHours: "2 Soatlik Kirish",
      threeHours: "3 Soatlik Kirish",
      daily: "1 Kunlik Sinov",
      weekly: "1 Haftalik Obuna",
      monthly: "1 Oylik Standart",
      unlimited: "Cheksiz VIP"
    };

    const planPrice = db.prices[plan] || 5000;
    const planTitle = planLabels[plan] || plan;
    const userFullName = `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim();
    const userHandle = ctx.from.username ? `@${ctx.from.username}` : 'mavjud emas';

    await ctx.answerCallbackQuery({ text: "So'rov qabul qilindi!" });

    const paymentText = `Assalomu alaykum @${OWNER_USERNAME}!\n` +
      `Men EduHujjat AI tizimidan to'lov qilmoqchiman:\n\n` +
      `👤 Ismim: ${userFullName}\n` +
      `🆔 Telegram ID: ${targetUserId}\n` +
      `🔗 Username: ${userHandle}\n` +
      `💳 Tanlagan tarifim: ${planTitle}\n` +
      `💰 Summa: ${planPrice.toLocaleString()} so'm\n\n` +
      `Iltimos to'lov kartangizni yuborsangiz va hisobimni yoqib bersangiz!`;

    const sendToOwnerLink = `https://t.me/${OWNER_USERNAME}?text=${encodeURIComponent(paymentText)}`;
    const payKeyboard = new InlineKeyboard().url(`💬 @${OWNER_USERNAME} ga to'lov uchun yozish`, sendToOwnerLink);

    await ctx.reply(
      `📩 **TO'LOV SO'ROVI QABUL QILINDI!**\n\n` +
      `Tanlangan tarif: **${planTitle}**\n` +
      `To'lov summasi: \`${planPrice.toLocaleString()} so'm\`\n` +
      `Sizning ID: \`${targetUserId}\`\n\n` +
      `Quyidagi tugmani bosing va boshqaruvchiga to'lovni tasdiqlang:`,
      { parse_mode: 'Markdown', reply_markup: payKeyboard }
    );

    // OWNER ga to'g'ridan-to'g'ri TAYYOR TUGMALAR bilan bildirishnoma!
    if (db.ownerChatId) {
      try {
        await bot.api.sendMessage(
          db.ownerChatId,
          `🔔 **YANGI TO'LOV TALABI!**\n\n` +
          `👤 **Foydalanuvchi:** ${userFullName}\n` +
          `🆔 **Telegram ID:** \`${targetUserId}\`\n` +
          `🔗 **Username:** ${userHandle}\n` +
          `💳 **Tanlagan tarif:** ${planTitle} (\`${planPrice.toLocaleString()} so'm\`)\n\n` +
          `👇 **Hisobni yoqish uchun shunchaki quyidagi tugmalardan birini bosing:**`,
          { parse_mode: 'Markdown', reply_markup: getOwnerActionKeyboard(targetUserId) }
        );
      } catch (e) {
        console.error(e);
      }
    }
    return;
  }

  // Owner tugmani bosib yoqqanda: act_{userId}_{planCode}
  if (data.startsWith('act_')) {
    const role = getEffectiveRole(ctx);
    if (role !== 'OWNER' && role !== 'ADMIN') {
      return ctx.answerCallbackQuery({ text: "Sizda bunday huquq yo'q!", show_alert: true });
    }
    const [_, targetIdStr, planCode] = data.split('_');
    const targetId = parseInt(targetIdStr, 10);

    const user = db.users.get(targetId) || { id: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';

    let label = 'Faollashtirildi';

    if (planCode.endsWith('time')) {
      const times = parseInt(planCode, 10) || 1;
      user.plan = `${times}time`;
      user.remainingUses = times;
      user.expiresAt = `${times} ta hujjat`;
      label = `${times} Martalik Hujjat`;
    } else if (planCode.endsWith('h')) {
      const hours = parseInt(planCode, 10) || 1;
      user.plan = `${hours}h`;
      user.remainingUses = null;
      user.expiresAt = `${hours} soat`;
      label = `${hours} Soatlik Kirish`;
    } else if (planCode.endsWith('d')) {
      const days = parseInt(planCode, 10) || 1;
      user.plan = `${days}d`;
      user.remainingUses = null;
      user.expiresAt = `${days} kun`;
      label = `${days} Kunlik`;
    } else if (planCode === '1w') {
      user.plan = 'weekly';
      user.remainingUses = null;
      user.expiresAt = '7 kun';
      label = '1 Haftalik';
    } else if (planCode === '1m') {
      user.plan = 'monthly';
      user.remainingUses = null;
      user.expiresAt = '30 kun';
      label = '1 Oylik Pro';
    } else if (planCode === 'vip') {
      user.plan = 'unlimited';
      user.remainingUses = 999999;
      user.expiresAt = 'Cheksiz VIP';
      label = 'Cheksiz VIP';
    }

    db.users.set(targetId, user);

    await ctx.answerCallbackQuery({ text: `Hisob ${label} bilan yoqildi!` });
    await ctx.editMessageText(
      `✅ **HISOB MUVOFAQIYATLI YOQILDI!**\n\n` +
      `👤 ID: \`${targetId}\`\n` +
      `💳 Tarif: **${label}**\n` +
      `Tasdiqlovchi: @${ctx.from?.username || 'admin'}`,
      { parse_mode: 'Markdown' }
    );

    try {
      const userReplyKb = getReplyKeyboardForRole('USER', true);
      await bot.api.sendMessage(
        targetId,
        `🎉 **HISOBINGIZ FOALLASHTIRILDI!**\n\n` +
        `Boshqaruvchi hisobingizni tasdiqladi. Sizga **${label}** imkoniyati berildi!\n` +
        `Endi bot va WebApp'dan erkin foydalanishingiz mumkin!`,
        {
          reply_markup: userReplyKb
        }
      );
    } catch (e) {
      console.log(e);
    }
    return;
  }

  // Bloklash
  if (data.startsWith('block_')) {
    const role = getEffectiveRole(ctx);
    if (role !== 'OWNER' && role !== 'ADMIN') return;
    const targetId = parseInt(data.replace('block_', ''), 10);
    const user = db.users.get(targetId);
    if (user) {
      user.status = 'BLOCKED';
    }
    await ctx.answerCallbackQuery({ text: "Foydalanuvchi rad etildi." });
    await ctx.editMessageText(`❌ **Foydalanuvchi rad etildi.** (ID: \`${targetId}\`)`, { parse_mode: 'Markdown' });
    return;
  }
});

// 3. KLAVIATURA TUGMALARI VA MATN BUYRUQLARI
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const role = getEffectiveRole(ctx);

  // A) Klaviatura tugmasi: Rejimni almashtirish
  if (text === '🎭 Rejimni Almashtirish') {
    if (!isRealSuperOwner(ctx)) {
      return ctx.reply("❌ Bu amal faqat Super Owner (@" + OWNER_USERNAME + ") uchun!");
    }
    return ctx.reply(
      `🎭 **Qaysi rejimga o'tishni tanlang:**\n\n` +
      `1. 👑 **Super Owner** — Barcha vakolatlar, adminlar, narxlar va sozlamalar.\n` +
      `2. 🛡️ **Administrator** — Foydalanuvchilarni faollashtirish va monitoring.\n` +
      `3. 🔍 **Tekshiruvchi (Auditor)** — Hisobotlar va tizim tekshiruvi.\n` +
      `4. 👤 **Oddiy Foydalanuvchi** — Yopiq paywall oynasi, narxlar va xarid so'rovini sinash.`,
      { reply_markup: getRoleSwitchKeyboard() }
    );
  }

  // Rejimni qaytarish (Super Ownerga)
  if (text === '🎭 Rejimni Qaytarish (Owner)') {
    if (isRealSuperOwner(ctx)) {
      db.simulatedRoles.delete(userId);
      const ownerKb = getReplyKeyboardForRole('OWNER');
      return ctx.reply(
        `👑 **Asosiy Super Owner rejimiga qaytdingiz!**\nBarcha boshqaruv tugmalari qaytarildi.`,
        { reply_markup: ownerKb }
      );
    }
  }

  // Klaviatura tugmasi: Tezkor Yoqish
  if (text === '⚡ Tezkor Yoqish') {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      return ctx.reply("❌ Sizda bu amalga huquq yo'q!");
    }
    return ctx.reply(
      `⚡ **FOYDALANUVCHINI TEZKOR YOQISH:**\n\n` +
      `Foydalanuvchi ID raqamini va muddatini yozing:\n\n` +
      `• \`/active ID 1time\` (1 ta hujjat)\n` +
      `• \`/active ID 2time\` (2 ta hujjat)\n` +
      `• \`/active ID 2h\` (2 soatlik kirish)\n` +
      `• \`/active ID 3h\` (3 soatlik kirish)\n` +
      `• \`/active ID 1d\` (1 kunlik)\n` +
      `• \`/active ID 1m\` (1 oylik)\n\n` +
      `Yoki qisqartirib: \`ID 2soat\`, \`ID 2martalik\` deb yuboring!`,
      { parse_mode: 'Markdown' }
    );
  }

  // Klaviatura tugmasi: Narxlar
  if (text === '💰 Narxlar' || text === '💰 Narxlar va Tariflar') {
    return ctx.reply(
      `💰 **EDUKATSIYA TIZIMI NARXLAR JADVALI:**\n\n` +
      `• ⚡ 1 Martalik hujjat: \`${db.prices.oneTime.toLocaleString()} so'm\`\n` +
      `• ⚡ 2 Martalik hujjat: \`${db.prices.twoTime.toLocaleString()} so'm\`\n` +
      `• ⚡ 5 Martalik hujjat: \`${db.prices.fiveTime.toLocaleString()} so'm\`\n` +
      `• ⏱ 1 Soatlik to'liq kirish: \`${db.prices.hourly.toLocaleString()} so'm\`\n` +
      `• ⏱ 2 Soatlik to'liq kirish: \`${db.prices.twoHours.toLocaleString()} so'm\`\n` +
      `• ⏱ 3 Soatlik to'liq kirish: \`${db.prices.threeHours.toLocaleString()} so'm\`\n` +
      `• 📅 1 Kunlik to'liq ruxsat: \`${db.prices.daily.toLocaleString()} so'm\`\n` +
      `• 🗓 1 Haftalik cheksiz: \`${db.prices.weekly.toLocaleString()} so'm\`\n` +
      `• ⭐ 1 Oylik Pro tarif: \`${db.prices.monthly.toLocaleString()} so'm\`\n` +
      `• 👑 Cheksiz VIP: \`${db.prices.unlimited.toLocaleString()} so'm\`\n\n` +
      (role === 'OWNER' ? `*(Owner narxlarni bot kodida yoki buyruqlar orqali o'zgartira oladi)*` : ``),
      { parse_mode: 'Markdown' }
    );
  }

  // Klaviatura tugmasi: Foydalanuvchilar
  if (text === '👥 Foydalanuvchilar') {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'INSPECTOR') {
      return ctx.reply("❌ Ruxsat berilmagan!");
    }
    const usersList = Array.from(db.users.values());
    if (usersList.length === 0) {
      return ctx.reply("👥 Hozircha yangi foydalanuvchilar yo'q.");
    }
    let msg = `👥 **FOYDALANUVCHILAR RO'YXATI (${usersList.length} ta):**\n\n`;
    usersList.slice(0, 15).forEach((u, i) => {
      const statusIcon = u.status === 'ACTIVE' ? '✅' : (u.status === 'BLOCKED' ? '❌' : '⏳');
      msg += `${i + 1}. ${statusIcon} ${u.name} (ID: \`${u.id}\`) - ${u.plan || 'none'}\n`;
    });
    return ctx.reply(msg, { parse_mode: 'Markdown' });
  }

  // Klaviatura tugmasi: Adminlar
  if (text === '🛡 Adminlar') {
    if (role !== 'OWNER') return ctx.reply("❌ Faqat Owner uchun!");
    const adminList = Array.from(db.admins).map(a => `@${a}`).join(', ');
    return ctx.reply(
      `🛡️ **ADMINLAR RO'YXATI:**\n\n${adminList}\n\n` +
      `➕ **Admin qo'shish:** \`/addadmin username\`\n` +
      `➖ **Admin o'chirish:** \`/deladmin username\``,
      { parse_mode: 'Markdown' }
    );
  }

  // Admin qo'shish / o'chirish
  if (text.startsWith('/addadmin ') && role === 'OWNER') {
    const newAdmin = text.replace('/addadmin ', '').trim().replace('@', '').toLowerCase();
    db.admins.add(newAdmin);
    return ctx.reply(`✅ @${newAdmin} muvaffaqiyatli admin etib tayinlandi!`);
  }
  if (text.startsWith('/deladmin ') && role === 'OWNER') {
    const delAdmin = text.replace('/deladmin ', '').trim().replace('@', '').toLowerCase();
    db.admins.delete(delAdmin);
    return ctx.reply(`❌ @${delAdmin} adminlikdan chiqarildi!`);
  }

  // Klaviatura tugmasi: Statistika
  if (text === '📊 Statistika' || text === '📊 Tizim Statistikasi') {
    return ctx.reply(
      `📊 **EDUKATSIYA TIZIMI STATISTIKASI:**\n\n` +
      `• Jami foydalanuvchilar: ${db.users.size}\n` +
      `• Faol foydalanuvchilar: ${Array.from(db.users.values()).filter(u => u.status === 'ACTIVE').length}\n` +
      `• Kutishdagilar (Pending): ${Array.from(db.users.values()).filter(u => u.status === 'PENDING').length}\n` +
      `• Adminlar soni: ${db.admins.size}\n` +
      `• WebApp: ${WEBAPP_URL}`,
      { parse_mode: 'Markdown' }
    );
  }

  // Klaviatura tugmasi: WebApp ochish
  if (text === '🌐 WebApp Ochish' || text === '🌐 Mini App-ni Ochish') {
    const webappInline = new InlineKeyboard().webApp("🚀 EduHujjat WebApp-ni Ochish", WEBAPP_URL);
    return ctx.reply("Quyidagi tugma orqali WebApp-ga kiring:", { reply_markup: webappInline });
  }

  // Klaviatura tugmasi: Litsenziya olish
  if (text === '💳 Litsenziya Sotib Olish' || text === '💳 Muddatni Uzaytirish') {
    return ctx.reply(
      `👇 **Kerakli tarifni tanlang:**`,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }

  // Klaviatura tugmasi: Demo ma'lumot
  if (text === "📄 Demo Ma'lumot") {
    const demo = 
      "1. karimova dildora baxtiyor qizi 14.05.2008 +998901234567 10-A\n" +
      "2. abdullayev jasur botir o'g'li 02.11.2007 +998939876543 10-A\n" +
      "3. omonov sardor qobilovich 25.01.2008 +998971112233 10-A\n" +
      "4. toshmatova rayhon alisher qizi 30.08.2008 +998994445566 10-A";
    db.userSessions.set(userId, demo);
    const actionKeyboard = new InlineKeyboard()
      .text("🔤 Alifbo saralash", "act_sort_az")
      .text("📅 Yosh/Tug'ilgan yil", "act_sort_year")
      .row()
      .text("📊 Excel jadval", "act_export_xlsx")
      .text("📝 Word jadval", "act_export_docx")
      .row()
      .text("🖼 Slayd (.pptx)", "act_export_pptx")
      .text("❓ 15 ta Test (.docx)", "act_export_test");
    return ctx.reply(
      `📋 **Demo ro'yxat kiritildi:**\n\n\`${demo}\`\n\nEndi nima qilmoqchisiz?`,
      { parse_mode: 'Markdown', reply_markup: actionKeyboard }
    );
  }

  // B) AQLLI PARSER: /active ID 2h, ID 2soat, ID 2martalik...
  if (role === 'OWNER' || role === 'ADMIN') {
    const match = text.match(/^(?:\/(?:active|activate|grant)\s+)?(\d{6,12})\s+(\d+)\s*(h|soat|time|martalik|d|kun|w|hafta|m|oy)$/i);
    if (match) {
      const targetId = parseInt(match[1], 10);
      const count = parseInt(match[2], 10) || 1;
      const unit = match[3].toLowerCase();

      let planLabel = '';
      const user = db.users.get(targetId) || { id: targetId, name: 'Foydalanuvchi' };
      user.status = 'ACTIVE';

      if (unit === 'h' || unit === 'soat') {
        user.plan = `${count}h`;
        user.remainingUses = null;
        user.expiresAt = `${count} soat`;
        planLabel = `${count} Soatlik Kirish`;
      } else if (unit === 'time' || unit === 'martalik') {
        user.plan = `${count}time`;
        user.remainingUses = count;
        user.expiresAt = `${count} ta hujjat`;
        planLabel = `${count} Martalik Hujjat`;
      } else if (unit === 'd' || unit === 'kun') {
        user.plan = `${count}d`;
        user.remainingUses = null;
        user.expiresAt = `${count} kun`;
        planLabel = `${count} Kunlik`;
      } else if (unit === 'w' || unit === 'hafta') {
        user.plan = `${count}w`;
        user.remainingUses = null;
        user.expiresAt = `${count * 7} kun`;
        planLabel = `${count} Haftalik`;
      } else if (unit === 'm' || unit === 'oy') {
        user.plan = `${count}m`;
        user.remainingUses = null;
        user.expiresAt = `${count * 30} kun`;
        planLabel = `${count} Oylik Pro`;
      }

      db.users.set(targetId, user);

      await ctx.reply(
        `✅ **ID: \`${targetId}\` foydalanuvchisi "${planLabel}" bilan faollashtirildi!**`,
        { parse_mode: 'Markdown' }
      );

      try {
        const userReplyKb = getReplyKeyboardForRole('USER', true);
        await bot.api.sendMessage(
          targetId,
          `🎉 **HISOBINGIZ FAOLLASHTIRILDI!**\n\n` +
          `Boshqaruvchi sizga **${planLabel}** imkoniyatini taqdim etdi.\n` +
          `Endi bot va WebApp siz uchun to'liq ochiq!`,
          {
            reply_markup: userReplyKb
          }
        );
      } catch (e) {}
      return;
    }
  }

  // C) Agar oddiy foydalanuvchi va ruxsati yo'q bo'lsa
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Hisobingiz hali tasdiqlanmagan.**\n\n` +
      `Sizning Telegram ID: \`${userId}\`\n\n` +
      `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }

  // D) Ruxsat berilgan foydalanuvchi matn yuborganda
  db.userSessions.set(userId, text);

  const currentUserObj = db.users.get(userId);
  if (currentUserObj && typeof currentUserObj.remainingUses === 'number') {
    currentUserObj.remainingUses -= 1;
  }

  const actionKeyboard = new InlineKeyboard()
    .text("🔤 Alifbo saralash", "act_sort_az")
    .text("📅 Yosh/Tug'ilgan yil", "act_sort_year")
    .row()
    .text("📊 Excel jadval", "act_export_xlsx")
    .text("📝 Word jadval", "act_export_docx")
    .row()
    .text("🖼 Slayd (.pptx)", "act_export_pptx")
    .text("❓ 15 ta Test (.docx)", "act_export_test")
    .row()
    .webApp("🌐 WebApp-da to'liq ochish", WEBAPP_URL);

  await ctx.reply(
    `📄 **Matn qabul qilindi!** (${text.length} ta belgi)\nQuyidagi amallardan birini tanlang:`,
    { reply_markup: actionKeyboard }
  );
});

console.log("EduHujjat Pro Bot yangilandi va ishga tushdi...");
bot.start();
