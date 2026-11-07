// Vercel Serverless Function: api/bot.js
import { Bot, webhookCallback, InlineKeyboard, InputFile } from 'grammy';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import pptxgen from 'pptxgenjs';

const BOT_TOKEN = process.env.BOT_TOKEN || '9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduhujjat.vercel.app';
const OWNER_USERNAME = 'fayzbek1331';

const bot = new Bot(BOT_TOKEN);

// Serverless holatida global xotira / kesh
const db = {
  prices: {
    oneTime: 2000,
    hourly: 3000,
    daily: 5000,
    weekly: 25000,
    monthly: 70000,
    unlimited: 290000
  },
  admins: new Set(['fayzbek1331']),
  ownerChatId: null,
  users: new Map(), // userId => { id, name, username, status, plan, expiresAt, remainingUses }
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

  // 1 martalik rejim tekshiruvi
  if (user.plan === 'oneTime' && user.remainingUses <= 0) {
    user.status = 'PENDING';
    return false;
  }
  return true;
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

  // A) AGAR OWNER BO'LSA:
  if (isOwner(ctx)) {
    const ownerKeyboard = new InlineKeyboard()
      .webApp("🚀 EduHujjat WebApp (Owner)", WEBAPP_URL)
      .row()
      .text("💰 Narxlar ro'yxati", "owner_prices")
      .text("📊 Tizim Statistikasi", "owner_stats")
      .row()
      .text("🛡 Adminlar ro'yxati", "owner_admins");

    return ctx.reply(
      `👑 **ASSALOMU ALAYKUM SUPER OWNER @${OWNER_USERNAME}!**\n\n` +
      `Siz **EduHujjat AI** tizimining mutlaq egasisiz. Barcha tizim to'liq nazoratingizda!\n\n` +
      `⚡ **Foydalanuvchilarni yoqish qoidalari:**\n` +
      `1. Botga shunchaki yozing: \`/activate <ID> <muddat>\`\n` +
      `   • \`/activate 123456789 1h\` ➡️ (1 soatga ochish)\n` +
      `   • \`/activate 123456789 1time\` ➡️ (1 martalik ochish)\n` +
      `   • \`/activate 123456789 1day\` ➡️ (1 kunga ochish)\n` +
      `   • \`/activate 123456789 1month\` ➡️ (1 oyga ochish)\n` +
      `   • Yoki shunchaki matn yuboring: \`123456789 1soat\` yoki \`123456789 1m\`\n` +
      `2. Foydalanuvchi to'lov so'raganda sizga avtomatik inline tugmali xabar keladi, 1 ta tugma bilan yoqa olasiz!`,
      { parse_mode: 'Markdown', reply_markup: ownerKeyboard }
    );
  }

  // B) AGAR ODDIY FOYDALANUVCHI VA HALI RUXSAT BERILMAGAN BO'LSA (YOPIQ TIZIM):
  if (!isUserActive(userId, username)) {
    const tariffKeyboard = new InlineKeyboard()
      .text(`⚡ 1 Martalik (${db.prices.oneTime.toLocaleString()} so'm)`, `buy_oneTime_${userId}`)
      .text(`⏱ 1 Soatlik (${db.prices.hourly.toLocaleString()} so'm)`, `buy_hourly_${userId}`)
      .row()
      .text(`📅 1 Kunlik (${db.prices.daily.toLocaleString()} so'm)`, `buy_daily_${userId}`)
      .text(`🗓 1 Haftalik (${db.prices.weekly.toLocaleString()} so'm)`, `buy_weekly_${userId}`)
      .row()
      .text(`⭐ 1 Oylik Pro (${db.prices.monthly.toLocaleString()} so'm)`, `buy_monthly_${userId}`)
      .text(`👑 VIP (${db.prices.unlimited.toLocaleString()} so'm)`, `buy_unlimited_${userId}`)
      .row()
      .webApp("🔒 WebApp orqali ko'rish", WEBAPP_URL);

    return ctx.reply(
      `🔒 **ASSALOMU ALAYKUM, ${fullName}!**\n\n` +
      `**"EduHujjat AI"** — Maktablar, talabalar va ofis xodimlari uchun yopiq professional hujjat tizimi.\n\n` +
      `Sizning Telegram ID: \`${userId}\`\n\n` +
      `💡 **Kerakli tarifni tanlang:** Tugmani bosishingiz bilan ma'lumotlaringiz va narx avtomatik tarzda boshqaruvchiga (@${OWNER_USERNAME}) yuboriladi va to'lovdan so'ng hisobingiz darhol yoqib beriladi!`,
      { parse_mode: 'Markdown', reply_markup: tariffKeyboard }
    );
  }

  // C) AGAR FOYDALANUVCHI TASDIQLANGAN BO'LSA:
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

  await ctx.reply(
    `✅ **XUSH KELIBSIZ, ${fullName}!**\n\n` +
    `Sizning hisobingiz faol! Hujjat matnini yoki Word/Excel faylini tashlang, tizim avtomatik tayyorlab beradi.`,
    { parse_mode: 'Markdown', reply_markup: activeKeyboard }
  );
});

// 2. FOYDALANUVCHI TARIFNI TANLAGANDA (BUY_...)
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;

  // Foydalanuvchi tarif tanladi: buy_{plan}_{userId}
  if (data.startsWith('buy_')) {
    const [_, plan, userIdStr] = data.split('_');
    const targetUserId = parseInt(userIdStr, 10);
    const planNames = {
      oneTime: "1 Martalik Hujjat",
      hourly: "1 Soatlik Tezkor",
      daily: "1 Kunlik Sinov",
      weekly: "1 Haftalik",
      monthly: "1 Oylik Pro",
      unlimited: "Cheksiz VIP"
    };
    const planPrice = db.prices[plan] || 5000;
    const planTitle = planNames[plan] || plan;

    const userFullName = `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim();
    const userHandle = ctx.from.username ? `@${ctx.from.username}` : 'mavjud emas';

    await ctx.answerCallbackQuery({ text: "So'rov boshqaruvchiga yuborildi!" });

    // 1. Foydalanuvchiga to'lov yo'riqnomasi va Owner bilan to'g'ridan-to'g'ri chat ochish
    const paymentText = `Assalomu alaykum @${OWNER_USERNAME}!\n` +
      `Men EduHujjat AI tizimidan to'lov qilmoqchiman:\n` +
      `👤 Ismim: ${userFullName}\n` +
      `🆔 Mening Telegram ID: ${targetUserId}\n` +
      `🔗 Username: ${userHandle}\n` +
      `💳 Tanlagan tarifim: ${planTitle}\n` +
      `💰 Summa: ${planPrice.toLocaleString()} so'm\n\n` +
      `Iltimos to'lov kartangizni yuborsangiz va hisobimni yoqib bersangiz!`;

    const sendToOwnerLink = `https://t.me/${OWNER_USERNAME}?text=${encodeURIComponent(paymentText)}`;

    const payKeyboard = new InlineKeyboard()
      .url(`💬 @${OWNER_USERNAME} ga to'lov uchun yozish`, sendToOwnerLink);

    await ctx.reply(
      `📩 **TO'LOV SO'ROVI QABUL QILINDI!**\n\n` +
      `Siz **${planTitle}** tarifini tanladingiz.\n` +
      `To'lov summasi: \`${planPrice.toLocaleString()} so'm\`\n` +
      `Sizning ID: \`${targetUserId}\`\n\n` +
      `Quyidagi tugmani bosing va boshqaruvchiga to'lovni tasdiqlang:`,
      { parse_mode: 'Markdown', reply_markup: payKeyboard }
    );

    // 2. OWNER ga DARHOL to'liq avtomatik inline tugmali xabar boradi!
    if (db.ownerChatId) {
      const ownerApproveKeyboard = new InlineKeyboard()
        .text(`⚡ 1 Martalik yoqish`, `activate_${targetUserId}_oneTime`)
        .text(`⏱ 1 Soatlik yoqish`, `activate_${targetUserId}_hourly`)
        .row()
        .text(`📅 1 Kunlik yoqish`, `activate_${targetUserId}_daily`)
        .text(`⭐ 1 Oylik yoqish`, `activate_${targetUserId}_monthly`)
        .row()
        .text(`👑 VIP yoqish`, `activate_${targetUserId}_unlimited`)
        .text(`❌ Rad etish`, `block_${targetUserId}`);

      try {
        await bot.api.sendMessage(
          db.ownerChatId,
          `🔔 **YANGI TO'LOV TALABI VA FOYDALANUVCHI!**\n\n` +
          `👤 **Ismi:** ${userFullName}\n` +
          `🆔 **Telegram ID:** \`${targetUserId}\`\n` +
          `🔗 **Username:** ${userHandle}\n` +
          `💳 **Tanlangan tarif:** ${planTitle} (\`${planPrice.toLocaleString()} so'm\`)\n\n` +
          `👇 **Hisobni yoqish uchun quyidagi tugmalardan birini bosing:**`,
          { parse_mode: 'Markdown', reply_markup: ownerApproveKeyboard }
        );
      } catch (e) {
        console.error("Ownerga yuborishda xatolik:", e);
      }
    }
    return;
  }

  // Owner tugmani bosganda yoqish: activate_{userId}_{plan}
  if (data.startsWith('activate_')) {
    if (!isAdmin(ctx)) {
      return ctx.answerCallbackQuery({ text: "Sizda bunday huquq yo'q!", show_alert: true });
    }
    const [_, targetIdStr, plan] = data.split('_');
    const targetId = parseInt(targetIdStr, 10);

    const user = db.users.get(targetId) || { id: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';
    user.plan = plan;

    if (plan === 'oneTime') {
      user.remainingUses = 1;
      user.expiresAt = "1 ta hujjat";
    } else if (plan === 'hourly') {
      user.expiresAt = "1 soat davomida";
    } else if (plan === 'daily') {
      user.expiresAt = "1 kun";
    } else if (plan === 'monthly') {
      user.expiresAt = "30 kun";
    } else {
      user.expiresAt = "Cheksiz VIP";
    }

    db.users.set(targetId, user);

    await ctx.answerCallbackQuery({ text: `Hisob ${plan} tarifida faollashtirildi!` });
    await ctx.editMessageText(
      `✅ **HISOB MUVOFAQIYATLI YOQILDI!**\n\n` +
      `👤 ID: \`${targetId}\`\n` +
      `💳 Tarif: **${plan.toUpperCase()}**\n` +
      `Tasdiqlovchi: @${ctx.from?.username || 'admin'}`,
      { parse_mode: 'Markdown' }
    );

    // Foydalanuvchiga quvonchli xabar boradi
    try {
      await bot.api.sendMessage(
        targetId,
        `🎉 **HISOBINGIZ FOALLASHTIRILDI!**\n\n` +
        `Boshqaruvchi sizga **${plan.toUpperCase()}** tarifida to'liq ruxsat berdi.\n` +
        `Endi bot va WebApp'dan erkin foydalanishingiz mumkin!`,
        {
          reply_markup: new InlineKeyboard().webApp("🚀 EduHujjat WebApp-ni ochish", WEBAPP_URL)
        }
      );
    } catch (e) {
      console.log("Foydalanuvchiga yuborib bo'lmadi:", e);
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
});

// 3. OWNER / ADMIN MATNLI BUYRUQLAR BILAN FOYDALANUVCHINI YOQISHI
// Masalan: "/activate 123456789 1h" yoki shunchaki "123456789 1h" yoki "123456789 1time"
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const username = ctx.from.username;

  // Agar Owner yoki Admin bo'lsa va ID bilan muddat yozsa:
  if (isAdmin(ctx)) {
    // Regex: masalan "/activate 98124567 1h" yoki "98124567 1h" yoki "98124567 1soat"
    const match = text.match(/^(?:\/activate\s+|\/grant\s+)?(\d{6,12})\s+(1time|1martalik|1h|1soat|1day|1kun|1week|1hafta|1m|1month|1oy|vip)$/i);
    if (match) {
      const targetId = parseInt(match[1], 10);
      const rawPlan = match[2].toLowerCase();

      let plan = 'monthly';
      let planLabel = '1 Oylik Pro';

      if (rawPlan === '1time' || rawPlan === '1martalik') {
        plan = 'oneTime';
        planLabel = '1 Martalik Hujjat';
      } else if (rawPlan === '1h' || rawPlan === '1soat') {
        plan = 'hourly';
        planLabel = '1 Soatlik Tezkor';
      } else if (rawPlan === '1day' || rawPlan === '1kun') {
        plan = 'daily';
        planLabel = '1 Kunlik';
      } else if (rawPlan === '1week' || rawPlan === '1hafta') {
        plan = 'weekly';
        planLabel = '1 Haftalik';
      } else if (rawPlan === 'vip') {
        plan = 'unlimited';
        planLabel = 'Cheksiz VIP';
      }

      const user = db.users.get(targetId) || { id: targetId, name: 'Foydalanuvchi' };
      user.status = 'ACTIVE';
      user.plan = plan;
      if (plan === 'oneTime') user.remainingUses = 1;
      db.users.set(targetId, user);

      await ctx.reply(
        `✅ **ID: \`${targetId}\` foydalanuvchisi "${planLabel}" tarifi bilan faollashtirildi!**`,
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
        // user blocked bot
      }
      return;
    }
  }

  // Agar oddiy foydalanuvchi va ruxsati bo'lmasa -> Blokka tushadi
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Hisobingiz hali tasdiqlanmagan.**\n\n` +
      `Sizning ID: \`${userId}\`\n` +
      `Iltimos, to'lov uchun boshqaruvchi (@${OWNER_USERNAME}) ga yozing!`,
      {
        reply_markup: new InlineKeyboard().url(`💬 @${OWNER_USERNAME} ga yozish`, `https://t.me/${OWNER_USERNAME}`)
      }
    );
  }

  // Agar ruxsati bo'lsa -> Oddiy ishlaydi
  db.userSessions.set(userId, text);

  // Agar 1 martalik bo'lsa foydalanish sonini kamaytirish
  const currentUserObj = db.users.get(userId);
  if (currentUserObj && currentUserObj.plan === 'oneTime') {
    currentUserObj.remainingUses = (currentUserObj.remainingUses || 1) - 1;
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

export default webhookCallback(bot, 'std/http');
