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

function getAccessCodeForUser(userId) {
  if (userId === SUPER_OWNER_ID) return "1331";
  const num = Math.abs((userId * 1331) % 900000) + 100000;
  return `EDU-${num}`;
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
      .text("⚡ Tezkor Yoqish").text("🔑 Saytga Kirish Kodi").row()
      .text("🤖 EduAI Yordamchi").text("👥 Foydalanuvchilar").row()
      .text("📑 Hujjat Fabrikasi").text("🎲 Test Generatori").row()
      .text("📊 Excel Jadvallar").text("🖼 Slayd Yasash").row()
      .text("💰 Narxlar").text("🛡 Adminlar").row()
      .text("📢 Ommaviy Xabar").text("📥 Bazani Yuklash (Excel)").row()
      .text("🎭 Rejimni Almashtirish").text("📊 Statistika").row()
      .text("🌐 WebApp Ochish").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }
  if (isRegisteredActive) {
    return new Keyboard()
      .text("🔑 Saytga Kirish Kodi").text("🤖 EduAI Yordamchi").row()
      .text("📑 Hujjat Fabrikasi").text("📄 Demo Ma'lumot").row()
      .text("🌐 WebApp Ochish").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }
  return new Keyboard()
    .text("🔑 Saytga Kirish Kodi").text("💳 Litsenziya Sotib Olish").row()
    .text("💰 Narxlar va Tariflar").text("ℹ️ Bot Qoidalari").row()
    .text("🌐 WebApp Ochish").text("🔄 Yangilash /start")
    .resized()
    .persistent();
}

bot.command('start', async (ctx) => {
  const user = ctx.from;
  const userId = user.id;
  const isOwner = isRealSuperOwner(ctx);

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
  const active = isUserActive(userId, user.username);
  const kb = getReplyKeyboardForRole(role, active);

  if (isOwner) {
    return ctx.reply(
      `👑 **ASSALOMU ALAYKUM SUPER OWNER @${OWNER_USERNAME}!**\n\n` +
      `Sizning tizimdagi ID: \`1\` *(Telegram ID: ${userId})*\n` +
      `🔑 **Saytga kirish master kodingiz:** \`1331\`\n` +
      `🌐 **Web platforma:** ${WEBAPP_URL}`,
      { parse_mode: 'Markdown', reply_markup: kb }
    );
  }

  return ctx.reply(`🔒 **EduHujjat AI Tizimiga xush kelibsiz!**`, { reply_markup: kb });
});

bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const role = getEffectiveRole(ctx);

  if (text === '🔑 Saytga Kirish Kodi' || text === '/code' || text === '/getcode') {
    if (isUserActive(userId, username)) {
      const code = getAccessCodeForUser(userId);
      return ctx.reply(
        `🔑 **SIZNING SAYTGA KIRISH KODINGIZ:**\n\n` +
        `\`${code}\`\n\n` +
        `🌐 **Sayt manzili:** ${WEBAPP_URL}`,
        { 
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard().webApp("🚀 WebApp-da Ochish", WEBAPP_URL).row().url("🌐 Brauzerda Ochish", WEBAPP_URL)
        }
      );
    } else {
      return ctx.reply(`🔒 **Sizda faol obuna mavjud emas!** Avval to'lov qiling va tasdiqlangandan so'ng kirish kodini olasiz.`);
    }
  }

  if (text === '🤖 EduAI Yordamchi' || text.startsWith('/ai')) {
    return ctx.reply(`🤖 **EduAI Yordamchi faol!** Savolingizni \`/ai mavzu\` ko'rinishida yuboring.`);
  }

  if (text === '🌐 WebApp Ochish') {
    return ctx.reply("Web platformaga kiring:", {
      reply_markup: new InlineKeyboard().webApp("🚀 WebApp-da Ochish", WEBAPP_URL).row().url("🌐 Brauzerda Ochish", WEBAPP_URL)
    });
  }

  return ctx.reply(`📄 Matn qabul qilindi! (${text.length} ta belgi)`);
});

export default webhookCallback(bot, 'http');
