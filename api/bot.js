// Vercel Serverless Function: api/bot.js
import { Bot, webhookCallback, InlineKeyboard, Keyboard, InputFile } from 'grammy';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import pptxgen from 'pptxgenjs';

const BOT_TOKEN = process.env.BOT_TOKEN || '9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduhujjat.vercel.app';
const OWNER_USERNAME = (process.env.OWNER_USERNAME || 'fayzbek1331').replace('@', '');
const SUPER_OWNER_ID = 6707839718;

const bot = new Bot(BOT_TOKEN);

const db = {
  prices: {
    oneTime: 2000, twoTime: 4000, fiveTime: 8000,
    hourly: 3000, twoHours: 5000, threeHours: 7000,
    daily: 5000, weekly: 25000, monthly: 70000, unlimited: 290000
  },
  admins: new Set(['fayzbek1331']),
  ownerChatId: SUPER_OWNER_ID,
  users: new Map(),
  userSessions: new Map(),
  simulatedRoles: new Map()
};

function resolveUserId(idInput) {
  const str = String(idInput).trim();
  if (str === '1' || str === String(SUPER_OWNER_ID)) return SUPER_OWNER_ID;
  return parseInt(str, 10);
}

function getDisplayUserId(userId) {
  if (userId === SUPER_OWNER_ID) return 1;
  return userId;
}

function isRealSuperOwner(ctx) {
  const userId = ctx.from?.id;
  const username = ctx.from?.username?.toLowerCase();
  return userId === SUPER_OWNER_ID || username === OWNER_USERNAME.toLowerCase();
}

function getEffectiveRole(ctx) {
  const userId = ctx.from?.id;
  if (isRealSuperOwner(ctx) && db.simulatedRoles.has(userId)) {
    return db.simulatedRoles.get(userId);
  }
  if (isRealSuperOwner(ctx)) return 'OWNER';
  const username = ctx.from?.username?.toLowerCase();
  if (username && db.admins.has(username)) return 'ADMIN';
  return 'USER';
}

function isUserActive(userId, username) {
  if (userId === SUPER_OWNER_ID) {
    const role = db.simulatedRoles.get(userId);
    if (role === 'USER') {
      const u = db.users.get(userId);
      return u?.status === 'ACTIVE';
    }
    return true;
  }
  if (username && username.toLowerCase() === OWNER_USERNAME.toLowerCase()) return true;
  if (username && db.admins.has(username.toLowerCase())) return true;
  const user = db.users.get(userId);
  if (!user || user.status !== 'ACTIVE') return false;
  return true;
}

function getReplyKeyboardForRole(role, isRegisteredActive = false) {
  if (role === 'OWNER') {
    return new Keyboard()
      .text("⚡ Tezkor Yoqish").text("👥 Foydalanuvchilar").row()
      .text("📑 Hujjat Fabrikasi").text("🎲 Test Generatori").row()
      .text("📊 Excel Jadvallar").text("🖼 Slayd Yasash").row()
      .text("📜 Faxriy Yorliq").text("🔀 Qizlar/O'g'illar").row()
      .text("💰 Narxlar").text("🛡 Adminlar").row()
      .text("📢 Ommaviy Xabar").text("📥 Bazani Yuklash (Excel)").row()
      .text("🎭 Rejimni Almashtirish").text("📊 Statistika").row()
      .text("🌐 WebApp Ochish").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }
  return new Keyboard()
    .text("💳 Litsenziya Sotib Olish").text("💰 Narxlar va Tariflar").row()
    .text("ℹ️ Bot Qoidalari").text("🌐 WebApp Ochish").row()
    .text("🔄 Yangilash /start")
    .resized()
    .persistent();
}

function getOwnerActionKeyboard(targetUserId) {
  return new InlineKeyboard()
    .text(`👑 Cheksiz VIP (Unlimited)`, `act_${targetUserId}_vip`)
    .row()
    .text(`⭐ 1 Oylik`, `act_${targetUserId}_1m`)
    .text(`🗓 1 Haftalik`, `act_${targetUserId}_1w`)
    .text(`📅 1 Kunlik`, `act_${targetUserId}_1d`)
    .row()
    .text(`⏱ 3 Soat`, `act_${targetUserId}_3h`)
    .text(`⏱ 2 Soat`, `act_${targetUserId}_2h`)
    .text(`⏱ 1 Soat`, `act_${targetUserId}_1h`)
    .row()
    .text(`⚡ 5 Martalik`, `act_${targetUserId}_5time`)
    .text(`⚡ 2 Martalik`, `act_${targetUserId}_2time`)
    .text(`⚡ 1 Martalik`, `act_${targetUserId}_1time`);
}

bot.command('start', async (ctx) => {
  const user = ctx.from;
  const userId = user.id;
  const isOwner = isRealSuperOwner(ctx);
  const displayId = getDisplayUserId(userId);

  if (!db.users.has(userId)) {
    db.users.set(userId, {
      id: isOwner ? 1 : userId,
      realId: userId,
      name: user.first_name,
      username: user.username,
      status: isOwner ? 'ACTIVE' : 'PENDING',
      plan: isOwner ? 'unlimited' : 'none'
    });
  }

  const role = getEffectiveRole(ctx);
  const kb = getReplyKeyboardForRole(role, isUserActive(userId, user.username));

  if (isOwner) {
    return ctx.reply(
      `👑 **ASSALOMU ALAYKUM SUPER OWNER @${OWNER_USERNAME}!**\n\n` +
      `Sizning tizimdagi ID: \`1\` *(Telegram ID: ${userId})*\n\n` +
      `Pastdagi barcha tugmalar orqali to'liq boshqaring!`,
      { parse_mode: 'Markdown', reply_markup: kb }
    );
  }

  return ctx.reply(`🔒 **EduHujjat AI Tizimiga xush kelibsiz!**`, { reply_markup: kb });
});

bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const role = getEffectiveRole(ctx);

  const lowerText = text.toLowerCase();
  const isActivationCommand = 
    lowerText.startsWith('/active') || 
    lowerText.startsWith('/activate') || 
    lowerText.startsWith('/grant') ||
    (role === 'OWNER' || role === 'ADMIN') && /^(?:\d+|1)\s+(?:unlimited|vip|cheksiz|\d+)/i.test(text);

  if (isActivationCommand) {
    if (role !== 'OWNER' && role !== 'ADMIN') return ctx.reply("Ruxsat yo'q!");
    const cleaned = text.replace(/^\/(?:active|activate|grant)\s*/i, '').trim();
    const parts = cleaned.split(/\s+/);
    const targetIdRaw = parts[0];
    const durationRaw = parts.slice(1).join(' ').toLowerCase();

    const targetId = resolveUserId(targetIdRaw);

    if (!durationRaw) {
      return ctx.reply(
        `👇 **ID: \`${getDisplayUserId(targetId)}\` uchun muddatni tanlang:**`,
        { reply_markup: getOwnerActionKeyboard(targetId) }
      );
    }

    let planLabel = '';
    const user = db.users.get(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';

    if (durationRaw === 'unlimited' || durationRaw === 'vip' || durationRaw === 'cheksiz') {
      user.plan = 'unlimited';
      user.expiresAt = 'Cheksiz VIP';
      planLabel = '👑 Cheksiz VIP (Unlimited)';
    } else {
      user.plan = durationRaw;
      planLabel = durationRaw;
    }

    db.users.set(targetId, user);
    return ctx.reply(`✅ **ID: \`${getDisplayUserId(targetId)}\` ${planLabel} bilan faollashtirildi!**`);
  }

  return ctx.reply(`📄 Matn qabul qilindi! (${text.length} ta belgi)`);
});

export default webhookCallback(bot, 'http');
