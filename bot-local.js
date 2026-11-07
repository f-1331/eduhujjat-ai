// bot-local.js - Ko'p tilli, ko'p muddatli (2h, 3h, 2time, 5time...) va TUGMALI boshqaruv
import { Bot, InlineKeyboard, InputFile } from 'grammy';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import pptxgen from 'pptxgenjs';

const BOT_TOKEN = '9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk';
const WEBAPP_URL = 'https://eduhujjat.vercel.app';
const OWNER_USERNAME = 'fayzbek1331';

const bot = new Bot(BOT_TOKEN);

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
  userSessions: new Map()
};

function isOwner(ctx) {
  const username = ctx.from?.username?.toLowerCase();
  return username === OWNER_USERNAME.toLowerCase();
}

function isAdmin(ctx) {
  const username = ctx.from?.username?.toLowerCase();
  if (!username) return false;
  return isOwner(ctx) || db.admins.has(username);
}

function isUserActive(userId, username) {
  if (username && username.toLowerCase() === OWNER_USERNAME.toLowerCase()) return true;
  if (username && db.admins.has(username.toLowerCase())) return true;
  const user = db.users.get(userId);
  if (!user || user.status !== 'ACTIVE') return false;

  // Agar martalik rejim bo'lsa
  if (typeof user.remainingUses === 'number' && user.remainingUses <= 0) {
    user.status = 'PENDING';
    return false;
  }
  return true;
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

// 1. /start buyrug'i
bot.command('start', async (ctx) => {
  const user = ctx.from;
  const userId = user.id;
  const username = user.username || '';
  const fullName = `${user.first_name} ${user.last_name || ''}`.trim();

  if (isOwner(ctx)) {
    db.ownerChatId = ctx.chat.id;
  }

  if (!db.users.has(userId)) {
    db.users.set(userId, {
      id: userId,
      name: fullName,
      username,
      status: isOwner(ctx) ? 'ACTIVE' : 'PENDING',
      plan: isOwner(ctx) ? 'unlimited' : 'none',
      expiresAt: null,
      remainingUses: null,
      registeredAt: new Date().toISOString()
    });
  }

  // A) OWNER:
  if (isOwner(ctx)) {
    const ownerKeyboard = new InlineKeyboard()
      .webApp("🚀 EduHujjat WebApp (Owner)", WEBAPP_URL)
      .row()
      .text("💰 Barcha Narxlar", "owner_prices")
      .text("📊 Statistika", "owner_stats")
      .row()
      .text("🛡 Adminlar ro'yxati", "owner_admins")
      .text("⚡ Tezkor Yoqish Yo'riqnomasi", "owner_help");

    return ctx.reply(
      `👑 **ASSALOMU ALAYKUM SUPER OWNER @${OWNER_USERNAME}!**\n\n` +
      `Siz **EduHujjat AI** tizimining mutlaq boshqaruvchisiz.\n\n` +
      `🔘 **Endi hech qanday murakkab buyruq yozish SHART EMAS!**\n` +
      `• Har bir yangi odam to'lov so'raganda sizga **tayyor tugmalar** chiqadi: \`[⚡ 1 Martalik]\`, \`[⚡ 2 Martalik]\`, \`[⏱ 1 Soat]\`, \`[⏱ 2 Soat]\`, \`[📅 1 Kun]\`, \`[⭐ 1 Oy]\`.\n` +
      `• Shunchaki kerakli tugmani bosing — o'sha odamda bir zumda yonadi!\n\n` +
      `✍️ **Agar matn bilan yozishni xohlasangiz istalgan sonni yozing:**\n` +
      `• \`/active ${userId} 2h\` yoki \`${userId} 2soat\` ➡️ (2 soatga yoqadi)\n` +
      `• \`/active ${userId} 3h\` yoki \`${userId} 3soat\` ➡️ (3 soatga yoqadi)\n` +
      `• \`/active ${userId} 2time\` yoki \`${userId} 2martalik\` ➡️ (2 ta hujjatga yoqadi)\n` +
      `• \`/active ${userId} 5time\` ➡️ (5 ta hujjatga yoqadi)\n` +
      `• \`/active ${userId} 1m\` ➡️ (1 oyga yoqadi)`,
      { parse_mode: 'Markdown', reply_markup: ownerKeyboard }
    );
  }

  // B) ODDIY FOYDALANUVCHI (YOPIQ):
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **ASSALOMU ALAYKUM, ${fullName}!**\n\n` +
      `**"EduHujjat AI"** — Maktablar, talabalar va ofis xodimlari uchun yopiq professional hujjat tizimi.\n\n` +
      `Sizning Telegram ID: \`${userId}\`\n\n` +
      `👇 **Kerakli tarif tugmasini bosing:** Ma'lumotlaringiz va narx avtomatik tarzda boshqaruvchiga (@${OWNER_USERNAME}) yuboriladi va to'lovdan so'ng hisobingiz darhol yoqib beriladi:`,
      { parse_mode: 'Markdown', reply_markup: getTariffInlineKeyboard(userId) }
    );
  }

  // C) FAOL FOYDALANUVCHI:
  const activeKeyboard = new InlineKeyboard()
    .webApp("🚀 EduHujjat WebApp-ni ochish", WEBAPP_URL)
    .row()
    .text("🔤 Alifbo saralash", "act_sort_az")
    .text("📊 Excel jadval", "act_export_xlsx")
    .row()
    .text("📝 Word jadval", "act_export_docx")
    .text("🖼 Slayd (.pptx)", "act_export_pptx")
    .row()
    .text("❓ Test (.docx)", "act_export_test")
    .text("🔄 Lotin-Kirill", "act_translit");

  const curUser = db.users.get(userId);
  const remainingInfo = curUser?.remainingUses ? `(Qolgan imkoniyat: ${curUser.remainingUses} ta)` : '';

  await ctx.reply(
    `✅ **XUSH KELIBSIZ, ${fullName}!**\n\n` +
    `Sizning hisobingiz faol! ${remainingInfo}\nHujjat matnini yoki Word/Excel faylini tashlang, tizim avtomatik tayyorlab beradi.`,
    { parse_mode: 'Markdown', reply_markup: activeKeyboard }
  );
});

// 2. Tugmalar bosilganda
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;

  // Foydalanuvchi tarif tanlaganda: buy_{plan}_{userId}
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

    // Foydalanuvchiga to'lov tugmasi
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
    if (!isAdmin(ctx)) {
      return ctx.answerCallbackQuery({ text: "Sizda bunday huquq yo'q!", show_alert: true });
    }
    const [_, targetIdStr, planCode] = data.split('_');
    const targetId = parseInt(targetIdStr, 10);

    const user = db.users.get(targetId) || { id: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';

    let label = 'Faollashtirildi';

    // 1time, 2time, 5time
    if (planCode.endsWith('time')) {
      const times = parseInt(planCode, 10) || 1;
      user.plan = `${times}time`;
      user.remainingUses = times;
      user.expiresAt = `${times} ta hujjat`;
      label = `${times} Martalik Hujjat`;
    }
    // 1h, 2h, 3h, 6h
    else if (planCode.endsWith('h')) {
      const hours = parseInt(planCode, 10) || 1;
      user.plan = `${hours}h`;
      user.remainingUses = null;
      user.expiresAt = `${hours} soat`;
      label = `${hours} Soatlik Kirish`;
    }
    // 1d, 3d
    else if (planCode.endsWith('d')) {
      const days = parseInt(planCode, 10) || 1;
      user.plan = `${days}d`;
      user.remainingUses = null;
      user.expiresAt = `${days} kun`;
      label = `${days} Kunlik`;
    }
    // 1w
    else if (planCode === '1w') {
      user.plan = 'weekly';
      user.remainingUses = null;
      user.expiresAt = '7 kun';
      label = '1 Haftalik';
    }
    // 1m
    else if (planCode === '1m') {
      user.plan = 'monthly';
      user.remainingUses = null;
      user.expiresAt = '30 kun';
      label = '1 Oylik Pro';
    }
    // vip
    else if (planCode === 'vip') {
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
      await bot.api.sendMessage(
        targetId,
        `🎉 **HISOBINGIZ FOALLASHTIRILDI!**\n\n` +
        `Boshqaruvchi hisobingizni tasdiqladi. Sizga **${label}** imkoniyati berildi!\n` +
        `Endi bot va WebApp'dan erkin foydalanishingiz mumkin!`,
        {
          reply_markup: new InlineKeyboard().webApp("🚀 EduHujjat WebApp-ni ochish", WEBAPP_URL)
        }
      );
    } catch (e) {
      console.log(e);
    }
    return;
  }

  // Bloklash
  if (data.startsWith('block_')) {
    if (!isAdmin(ctx)) return;
    const targetId = parseInt(data.replace('block_', ''), 10);
    const user = db.users.get(targetId);
    if (user) {
      user.status = 'BLOCKED';
    }
    await ctx.answerCallbackQuery({ text: "Foydalanuvchi rad etildi." });
    await ctx.editMessageText(`❌ **Foydalanuvchi rad etildi.** (ID: \`${targetId}\`)`, { parse_mode: 'Markdown' });
    return;
  }

  if (data === 'owner_help') {
    return ctx.reply(
      `⚡ **OWNER YOQISH QOIDALARI:**\n\n` +
      `1. **Tugmalar orqali:** Yangi foydalanuvchi to'lov so'raganda xabar ostida barcha tugmalar chiqadi.\n` +
      `2. **Istalgan muddatni yozish orqali:**\n` +
      `• \`/active ID 2h\` yoki \`/activate ID 2h\` (2 soat)\n` +
      `• \`/active ID 3h\` yoki \`/activate ID 5h\` (3 yoki 5 soat)\n` +
      `• \`/active ID 2time\` (2 ta hujjat)\n` +
      `• \`/active ID 5time\` (5 ta hujjat)\n` +
      `• \`ID 2soat\` yoki \`ID 2martalik\`\n` +
      `Hammasi avtomatik ishlaydi!`,
      { parse_mode: 'Markdown' }
    );
  }
});

// 3. AQLLI PARSER: /active yoki /activate ID 2h, 3h, 2time, 5time, 1d, 1m...
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const username = ctx.from.username;

  // Agar Owner yoki Admin bo'lsa:
  if (isAdmin(ctx)) {
    // Regex: /active ID 2h, /activate ID 2time, ID 2soat, ID 3martalik...
    const match = text.match(/^(?:\/(?:active|activate|grant)\s+)?(\d{6,12})\s+(\d+)\s*(h|soat|time|martalik|d|kun|w|hafta|m|oy)$/i);
    if (match) {
      const targetId = parseInt(match[1], 10);
      const count = parseInt(match[2], 10) || 1;
      const unit = match[3].toLowerCase();

      let planLabel = '';
      const user = db.users.get(targetId) || { id: targetId, name: 'Foydalanuvchi' };
      user.status = 'ACTIVE';

      // Soatlik: h, soat
      if (unit === 'h' || unit === 'soat') {
        user.plan = `${count}h`;
        user.remainingUses = null;
        user.expiresAt = `${count} soat`;
        planLabel = `${count} Soatlik Kirish`;
      }
      // Martalik: time, martalik
      else if (unit === 'time' || unit === 'martalik') {
        user.plan = `${count}time`;
        user.remainingUses = count;
        user.expiresAt = `${count} ta hujjat`;
        planLabel = `${count} Martalik Hujjat`;
      }
      // Kunlik: d, kun
      else if (unit === 'd' || unit === 'kun') {
        user.plan = `${count}d`;
        user.remainingUses = null;
        user.expiresAt = `${count} kun`;
        planLabel = `${count} Kunlik`;
      }
      // Haftalik: w, hafta
      else if (unit === 'w' || unit === 'hafta') {
        user.plan = `${count}w`;
        user.remainingUses = null;
        user.expiresAt = `${count * 7} kun`;
        planLabel = `${count} Haftalik`;
      }
      // Oylik: m, oy
      else if (unit === 'm' || unit === 'oy') {
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
        await bot.api.sendMessage(
          targetId,
          `🎉 **HISOBINGIZ FAOLLASHTIRILDI!**\n\n` +
          `Boshqaruvchi (@${OWNER_USERNAME}) sizga **${planLabel}** imkoniyatini taqdim etdi.\n` +
          `Endi bot va WebApp siz uchun to'liq ochiq!`,
          {
            reply_markup: new InlineKeyboard().webApp("🚀 EduHujjat WebApp-ni ochish", WEBAPP_URL)
          }
        );
      } catch (e) {
        // user blocked
      }
      return;
    }
  }

  // Agar oddiy foydalanuvchi va ruxsati bo'lmasa -> Blokka tushadi
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Hisobingiz hali tasdiqlanmagan.**\n\n` +
      `Sizning ID: \`${userId}\`\n\n` +
      `Quyidagi tugmalardan birini tanlab, boshqaruvchiga to'lov qiling:`,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }

  // Agar ruxsati bo'lsa:
  db.userSessions.set(userId, text);

  // Agar martalik bo'lsa bittaga kamaytirish
  const currentUserObj = db.users.get(userId);
  if (currentUserObj && typeof currentUserObj.remainingUses === 'number') {
    currentUserObj.remainingUses -= 1;
  }

  const actionKeyboard = new InlineKeyboard()
    .text("🔤 Alifbo saralash", "act_sort_az")
    .text("📅 Tug'ilgan yili", "act_sort_year")
    .row()
    .text("📊 Excel jadval", "act_export_xlsx")
    .text("📝 Word jadval", "act_export_docx")
    .row()
    .text("🖼 Slayd (.pptx)", "act_export_pptx")
    .text("❓ Test (.docx)", "act_export_test")
    .row()
    .webApp("🌐 WebApp-da to'liq ochish", WEBAPP_URL);

  await ctx.reply(
    `📄 **Matn qabul qilindi!** (${text.length} ta belgi)\nQuyidagi amallardan birini tanlang:`,
    { reply_markup: actionKeyboard }
  );
});

console.log("EduHujjat Pro Bot yangilandi va ishga tushdi...");
bot.start();
