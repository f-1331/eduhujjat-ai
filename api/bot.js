// Vercel Serverless Function: api/bot.js
import { Bot, webhookCallback, InlineKeyboard, Keyboard, InputFile } from 'grammy';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import pptxgen from 'pptxgenjs';

const BOT_TOKEN = process.env.BOT_TOKEN || '9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduhujjat.vercel.app';
const OWNER_USERNAME = (process.env.OWNER_USERNAME || 'fayzbek1331').replace('@', '');

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
  userSessions: new Map(),
  simulatedRoles: new Map()
};

function isRealSuperOwner(ctx) {
  const username = ctx.from?.username?.toLowerCase();
  return username === OWNER_USERNAME.toLowerCase();
}

function getEffectiveRole(ctx) {
  const userId = ctx.from?.id;
  const username = ctx.from?.username?.toLowerCase();
  const isRealOwner = username === OWNER_USERNAME.toLowerCase();

  if (isRealOwner && db.simulatedRoles.has(userId)) {
    return db.simulatedRoles.get(userId);
  }

  if (isRealOwner) return 'OWNER';
  if (username && db.admins.has(username)) return 'ADMIN';
  return 'USER';
}

function isUserActive(userId, username) {
  const role = db.simulatedRoles.get(userId);
  if (role === 'USER') {
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

function getReplyKeyboardForRole(role, isRegisteredActive = false) {
  if (role === 'OWNER') {
    return new Keyboard()
      .text("🎭 Rejimni Almashtirish").text("⚡ Tezkor Yoqish").row()
      .text("💰 Narxlar").text("👥 Foydalanuvchilar").row()
      .text("🛡 Adminlar").text("📊 Statistika").row()
      .text("📢 Ommaviy Xabar").text("🌐 WebApp Ochish").row()
      .text("🔄 Yangilash /start")
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

function getTariffInlineKeyboard(userId) {
  return new InlineKeyboard()
    .text(`⚡ 1 Martalik (${db.prices.oneTime.toLocaleString()} so'm)`, `buy_oneTime_${userId}`)
    .text(`⚡ 2 Martalik (${db.prices.twoTime.toLocaleString()} so'm)`, `buy_twoTime_${userId}`)
    .row()
    .text(`⚡ 5 Martalik (${db.prices.fiveTime.toLocaleString()} so'm)`, `buy_fiveTime_${userId}`)
    .text(`⏱ 1 Soatlik (${db.prices.hourly.toLocaleString()} so'm)`, `buy_hourly_${userId}`)
    .row()
    .text(`⏱ 2 Soatlik (${db.prices.twoHours.toLocaleString()} so'm)`, `buy_twoHours_${userId}`)
    .text(`⏱ 3 Soatlik (${db.prices.threeHours.toLocaleString()} so'm)`, `buy_threeHours_${userId}`)
    .row()
    .text(`📅 1 Kunlik (${db.prices.daily.toLocaleString()} so'm)`, `buy_daily_${userId}`)
    .text(`🗓 1 Haftalik (${db.prices.weekly.toLocaleString()} so'm)`, `buy_weekly_${userId}`)
    .row()
    .text(`⭐ 1 Oylik Pro (${db.prices.monthly.toLocaleString()} so'm)`, `buy_monthly_${userId}`)
    .text(`👑 Cheksiz VIP (${db.prices.unlimited.toLocaleString()} so'm)`, `buy_unlimited_${userId}`)
    .row()
    .webApp("🌐 WebApp orqali ochish", WEBAPP_URL);
}

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

function getActionInlineKeyboard() {
  return new InlineKeyboard()
    .text("🔤 Alifbo saralash (A-Z)", "act_sort_az")
    .text("📅 Tug'ilgan yil / Yosh", "act_sort_year")
    .row()
    .text("📊 Excel (.xlsx) yuklash", "act_export_xlsx")
    .text("📝 Word (.docx) yuklash", "act_export_docx")
    .row()
    .text("🖼 Slayd (.pptx) yuklash", "act_export_pptx")
    .text("❓ 15 ta Test (.docx)", "act_export_test")
    .row()
    .text("🔄 Lotin <-> Kirill o'girish", "act_translit")
    .row()
    .webApp("🌐 WebApp-da to'liq ochish", WEBAPP_URL);
}

// /start
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

  if (role === 'OWNER') {
    return ctx.reply(
      `👑 **ASSALOMU ALAYKUM SUPER OWNER @${OWNER_USERNAME}!**\n\n` +
      `Siz **EduHujjat AI & SmartOffice Pro** tizimining mutlaq boshqaruvchisiz.\n\n` +
      `⌨️ **Klaviatura tugmalari faol:** Pastdagi tugmalar orqali to'liq boshqaring.\n` +
      `🎭 **Rejim almashtirish:** O'zingizni *Admin*, *Tekshiruvchi* yoki *Oddiy Foydalanuvchi* sifatida sinab ko'rishingiz mumkin.\n\n` +
      `⚡ **Tezkor Faollashtirish:**\n` +
      `• \`/active ID 2h\` yoki \`${userId} 2soat\`\n` +
      `• \`/active ID 2time\` yoki \`${userId} 2martalik\``,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  if (!active) {
    return ctx.reply(
      `🔒 **ASSALOMU ALAYKUM, ${fullName}!**\n\n` +
      `**"EduHujjat AI"** — Maktablar va ofislar uchun professional hujjatlar platformasi.\n\n` +
      `Sizning Telegram ID: \`${userId}\`\n\n` +
      `👇 **Kerakli tarifni tanlang:**`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    ).then(() => {
      ctx.reply(`👇 **Tariflar:**`, { reply_markup: getTariffInlineKeyboard(userId) });
    });
  }

  return ctx.reply(
    `✅ **XUSH KELIBSIZ, ${fullName}!**\n\n` +
    `Sizning hisobingiz faol! Hujjat matnini yuboring, tizim avtomatik tayyorlab beradi.`,
    { parse_mode: 'Markdown', reply_markup: replyKeyboard }
  );
});

// Matn va buyruqlar
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const role = getEffectiveRole(ctx);

  if (text === '🎭 Rejimni Almashtirish' && isRealSuperOwner(ctx)) {
    return ctx.reply(`🎭 **Rejimni tanlang:**`, { reply_markup: getRoleSwitchKeyboard() });
  }

  if (text === '🎭 Rejimni Qaytarish (Owner)' && isRealSuperOwner(ctx)) {
    db.simulatedRoles.delete(userId);
    return ctx.reply(`👑 **Super Owner rejimiga qaytdingiz!**`, { reply_markup: getReplyKeyboardForRole('OWNER') });
  }

  if (text === '💰 Narxlar' || text === '💰 Narxlar va Tariflar') {
    return ctx.reply(
      `💰 **TARIFLAR JADVALI:**\n\n` +
      `• ⚡ 1 Martalik: \`${db.prices.oneTime.toLocaleString()} so'm\`\n` +
      `• ⏱ 1 Soatlik: \`${db.prices.hourly.toLocaleString()} so'm\`\n` +
      `• 📅 1 Kunlik: \`${db.prices.daily.toLocaleString()} so'm\`\n` +
      `• ⭐ 1 Oylik Pro: \`${db.prices.monthly.toLocaleString()} so'm\`\n` +
      `• 👑 Cheksiz VIP: \`${db.prices.unlimited.toLocaleString()} so'm\``,
      { parse_mode: 'Markdown' }
    );
  }

  if (text === '⚡ Tezkor Yoqish') {
    return ctx.reply("Namuna: `/active ID 2h` yoki `/active ID 2time`", { parse_mode: 'Markdown' });
  }

  if (text === '🌐 WebApp Ochish' || text === '🌐 Mini App-ni Ochish') {
    return ctx.reply("WebApp-ga kiring:", { reply_markup: new InlineKeyboard().webApp("🚀 WebApp", WEBAPP_URL) });
  }

  if (!isUserActive(userId, username)) {
    return ctx.reply(`🔒 **Hisobingiz hali tasdiqlanmagan.**`, { reply_markup: getTariffInlineKeyboard(userId) });
  }

  db.userSessions.set(userId, text);
  return ctx.reply(`📄 **Matn qabul qilindi!** (${text.length} ta belgi)`, { reply_markup: getActionInlineKeyboard() });
});

export default webhookCallback(bot, 'http');
