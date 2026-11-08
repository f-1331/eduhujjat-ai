// bot-local.js - "SmartOffice & EduAI Pro" Ultra Super-Engine Telegram Bot
import { Bot, InlineKeyboard, Keyboard, InputFile } from 'grammy';
import * as XLSX from 'xlsx';
import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, AlignmentType, BorderStyle, HeadingLevel 
} from 'docx';
import pptxgen from 'pptxgenjs';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { generateRealAIGammaCards } from './src/utils/aiSlideEngine.js';
import { 
  GAMMA_THEMES, 
  getTopicImageUrl, 
  fetchImageAsBase64 
} from './src/utils/powerpointGenerator.js';
import {
  callGemini,
  generateAITestWithGemini,
  generateAILessonPlanWithGemini,
  generateAIOfficialOrderWithGemini,
  generateAIProtocolWithGemini,
  generateAIStudentReferenceWithGemini,
  generateAIGammaCardsWithGemini
} from './src/utils/geminiAiService.js';
import {
  generateAITestSuite, 
  generateAILessonPlan, 
  generateAIOfficialOrder, 
  generateAIStudentReference,
  generateAIPedagogicalProtocol
} from './src/utils/universalAiBrain.js';

// 1. .env faylini yuklash
try {
  if (process.loadEnvFile) {
    process.loadEnvFile('.env');
  } else {
    const dotenv = await import('dotenv');
    dotenv.config();
  }
} catch (e) {}

const BOT_TOKEN = process.env.BOT_TOKEN || '9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduhujjat.vercel.app';
const OWNER_USERNAME = (process.env.OWNER_USERNAME || 'fayzbek1331').replace('@', '');

// SUPER OWNER ID: Fayzbek (Telegram ID: 6707839718, alias: 1)
const SUPER_OWNER_ID = 6707839718;

const bot = new Bot(BOT_TOKEN);

// Global Error Handler - Bot hech qachon to'xtab qolmasligi uchun
bot.catch((err) => {
  console.error("Bot xatolik yuz berdi (bot.catch):", err.message || err);
});

// Telegram API Transformer - Markdown entity xatoliklari va tarmoq uzilishlarini avtomatik tiklash
bot.api.config.use(async (prev, method, payload, signal) => {
  try {
    return await prev(method, payload, signal);
  } catch (err) {
    if (payload && payload.parse_mode && (err.message?.includes('parse') || err.message?.includes('entity') || err.message?.includes("can't find end"))) {
      console.warn(`[Auto-Recover] Telegram entity parse error on ${method}, retrying without parse_mode:`, err.message);
      const newPayload = { ...payload };
      delete newPayload.parse_mode;
      return await prev(method, newPayload, signal);
    }
    if (err.message?.includes('Network request') || err.message?.includes('fetch failed') || err.message?.includes('ETIMEDOUT')) {
      console.warn(`[Auto-Recover] Telegram network glitch on ${method}, retrying in 600ms...`);
      await new Promise(r => setTimeout(r, 600));
      try {
        return await prev(method, payload, signal);
      } catch (retryErr) {
        console.error(`[Retry Failed] ${method}:`, retryErr.message);
      }
    }
    throw err;
  }
});


// 2. DOIMIY MA'LUMOTLAR BAZASI (PERSISTENT JSON DB)
const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

function ensureDataDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadDatabase() {
  ensureDataDir();
  const defaultDb = {
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
    admins: ['fayzbek1331'],
    ownerChatId: SUPER_OWNER_ID,
    users: {
      "6707839718": {
        id: 1,
        realId: SUPER_OWNER_ID,
        name: "Fayzbek (Super Owner)",
        username: "fayzbek1331",
        status: "ACTIVE",
        plan: "unlimited",
        expiresAt: "Cheksiz VIP",
        remainingUses: 999999,
        registeredAt: new Date().toISOString()
      }
    },
    simulatedRoles: {}
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const mergedUsers = { ...defaultDb.users, ...(parsed.users || {}) };
    mergedUsers["6707839718"] = {
      id: 1,
      realId: SUPER_OWNER_ID,
      name: "Fayzbek (Super Owner)",
      username: "fayzbek1331",
      status: "ACTIVE",
      plan: "unlimited",
      expiresAt: "Cheksiz VIP",
      remainingUses: 999999,
      registeredAt: mergedUsers["6707839718"]?.registeredAt || new Date().toISOString()
    };

    return {
      prices: { ...defaultDb.prices, ...(parsed.prices || {}) },
      admins: Array.isArray(parsed.admins) ? parsed.admins : ['fayzbek1331'],
      ownerChatId: parsed.ownerChatId || SUPER_OWNER_ID,
      users: mergedUsers,
      simulatedRoles: parsed.simulatedRoles || {},
      deviceAuthorizations: parsed.deviceAuthorizations || {},
      deviceBindings: parsed.deviceBindings || {}
    };
  } catch (err) {
    console.error("DB o'qishda xatolik:", err);
    return defaultDb;
  }
}

const memoryDb = loadDatabase();
const db = {
  prices: memoryDb.prices,
  admins: new Set(memoryDb.admins),
  ownerChatId: memoryDb.ownerChatId || SUPER_OWNER_ID,
  users: new Map(Object.entries(memoryDb.users).map(([k, v]) => [parseInt(k, 10), v])),
  userSessions: new Map(),
  simulatedRoles: new Map(Object.entries(memoryDb.simulatedRoles).map(([k, v]) => [parseInt(k, 10), v])),
  deviceAuthorizations: memoryDb.deviceAuthorizations || {},
  deviceBindings: memoryDb.deviceBindings || {},
  rateLimits: new Map()
};

// 2.1 SLIDE WIZARD STATE VA BOSHQARUV FUNKSIYALARI
const slideWizardState = new Map();

function startSlideWizard(ctx, initialTopic = '') {
  const userId = ctx.from.id;
  if (!initialTopic || !initialTopic.trim()) {
    slideWizardState.set(userId, {
      step: 'awaiting_topic',
      topic: '',
      authorName: '',
      detailLevel: 'medium',
      includeImages: true,
      styleName: 'auto'
    });
    return ctx.reply(
      `🎨 **GAMMA & GENSPARK AI TAQDIMOT YARATUVCHISI**\n\n` +
      `📌 **Taqdimot mavzusini yozing:**\n` +
      `Masalan: \`8-sinf biologiya Qon tarkibi va vazifalari\` yoki \`Amir Temur davlati\`\n\n` +
      `*(Mavzuni to'g'ridan-to'g'ri xabar sifatida yuboring)*`,
      { parse_mode: 'Markdown' }
    );
  }

  const topic = initialTopic.trim();
  slideWizardState.set(userId, {
    step: 'awaiting_author',
    topic,
    authorName: '',
    detailLevel: 'medium',
    includeImages: true,
    styleName: 'auto'
  });
  return sendWizardAuthorStep(ctx, topic);
}

function sendWizardAuthorStep(ctx, topic) {
  const user = ctx.from;
  const usernameHandle = user?.username ? `@${user.username}` : (user?.first_name || 'Muallif');
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'O\'qituvchi';

  const kb = new InlineKeyboard()
    .text(`👤 ${usernameHandle} deb yozish`, "sw_auth_handle")
    .text(`✍️ ${fullName}`, "sw_auth_name")
    .row()
    .text("🏢 Maktab o'qituvchisi", "sw_auth_teacher")
    .text("⚡ Tezkor yaratish (Standart)", "sw_quick");

  return ctx.reply(
    `🎨 **Yangi Gamma AI Taqdimot (1/4)**\n` +
    `📌 Mavzu: **${topic}**\n\n` +
    `👤 **1-slaydda (Muqovada) taqdimotchi / muallif ismini nima deb yozay?**\n\n` +
    `Quyidagi tugmalardan birini bosing yoki ism-familiyangizni (maktabingizni) to'g'ridan-to'g'ri xabar qilib yozing:\n` +
    `*(Masalan: \`Fayzbek Omonov\` yoki \`10-maktab biologiya fani o'qituvchisi\`)*`,
    { parse_mode: 'Markdown', reply_markup: kb }
  );
}

function sendWizardDetailStep(ctx, topic, authorName, editMsg = false) {
  const kb = new InlineKeyboard()
    .text("🟢 Qisqa (Tezislar)", "sw_det_short")
    .text("🟡 O'rtacha (Standart)", "sw_det_medium")
    .text("🔴 Kengaytirilgan", "sw_det_detailed")
    .row()
    .text("⚡ Tezkor yaratish", "sw_quick");

  const msgText = 
    `📊 **Slaydlardagi ma'lumot hajmi qanday bo'lsin? (2/4)**\n\n` +
    `📌 Mavzu: **${topic}**\n` +
    `👤 Muallif: **${authorName}**\n\n` +
    `• 🟢 **Qisqa** — Asosiy tezislar, lo'nda faktlar va yirik matnlar (5-6 slayd)\n` +
    `• 🟡 **O'rtacha** — Standart taqdimot, darslikka xos tushuntirish va misollar (6-7 slayd)\n` +
    `• 🔴 **Kengaytirilgan** — To'liq ma'ruza, chuqur ilmiy tahlil va notiq nutqi (7-9 slayd)\n\n` +
    `Kerakli hajm tugmasini bosing:`;

  if (editMsg && ctx.callbackQuery?.message) {
    return ctx.editMessageText(msgText, { parse_mode: 'Markdown', reply_markup: kb });
  }
  return ctx.reply(msgText, { parse_mode: 'Markdown', reply_markup: kb });
}

function sendWizardImageStep(ctx, topic, authorName, detailLevel, editMsg = true) {
  const kb = new InlineKeyboard()
    .text("🖼 Ha, HD rasmlar qo'shilsin", "sw_img_yes")
    .row()
    .text("🎨 Minimalist grafik (rasmsiz)", "sw_img_no")
    .row()
    .text("⚡ Tezkor yaratish", "sw_quick");

  const detailLabels = { short: "🟢 Qisqa (Tezislar)", medium: "🟡 O'rtacha (Standart)", detailed: "🔴 Kengaytirilgan" };

  const msgText = 
    `🖼 **Slaydlarga mavzuga oid yuqori sifatli rasmlar qo'shilsinmi? (3/4)**\n\n` +
    `📌 Mavzu: **${topic}**\n` +
    `👤 Muallif: **${authorName}**\n` +
    `📊 Hajm: **${detailLabels[detailLevel] || detailLevel}**\n\n` +
    `Mavzuga mos rang-barang HD illyustratsiyalar, diagrammalar va fotosuratlar slaydlarga joylansinmi?`;

  if (editMsg && ctx.callbackQuery?.message) {
    return ctx.editMessageText(msgText, { parse_mode: 'Markdown', reply_markup: kb });
  }
  return ctx.reply(msgText, { parse_mode: 'Markdown', reply_markup: kb });
}

function sendWizardStyleStep(ctx, topic, authorName, detailLevel, includeImages, editMsg = true) {
  const kb = new InlineKeyboard()
    .text("🎲 Tasodifiy yangi dizayn (100+ xil)", "sw_sty_random")
    .row()
    .text("🌌 Obsidian Neon", "sw_sty_obsidian")
    .text("🌿 Emerald Matrix", "sw_sty_emerald")
    .row()
    .text("💎 Royal Amethyst", "sw_sty_amethyst")
    .text("☀️ Solar Amber", "sw_sty_solar")
    .row()
    .text("❄️ Clean Nordic", "sw_sty_nordic")
    .text("🍷 Crimson Luxury", "sw_sty_crimson")
    .row()
    .text("🌊 Deep Ocean", "sw_sty_ocean")
    .text("⚡ Avtomatik moslashtirish", "sw_sty_auto");

  const msgText = 
    `🎨 **Dizayn va ranglar palitrasini tanlang: (4/4)**\n\n` +
    `📌 Mavzu: **${topic}**\n` +
    `👤 Muallif: **${authorName}**\n` +
    `🖼 Rasmlar: **${includeImages ? 'Ha, kiritiladi' : 'Rasmsiz minimalist'}**\n\n` +
    `100 dan ortiq ranglar va dizayn uslubidan birini tanlang yoki avtomatik/tasodifiy uslubni belgilang:`;

  if (editMsg && ctx.callbackQuery?.message) {
    return ctx.editMessageText(msgText, { parse_mode: 'Markdown', reply_markup: kb });
  }
  return ctx.reply(msgText, { parse_mode: 'Markdown', reply_markup: kb });
}

async function executePresentationGeneration(ctx, topic, options = {}) {
  const authorName = options.authorName || ctx.from?.first_name || "SmartOffice EduAI";
  const detailLevel = options.detailLevel || 'medium';
  const includeImages = options.includeImages !== false;
  const styleName = options.styleName || 'auto';

  const detailLabels = { short: "🟢 Qisqa (Tezislar)", medium: "🟡 O'rtacha (Standart)", detailed: "🔴 Kengaytirilgan (To'liq ma'ruza)" };

  let waitMsg = null;
  const statusText = 
    `🎨 **Gamma & Genspark AI taqdimot tayyorlanmoqda...**\n\n` +
    `📌 Mavzu: **${topic}**\n` +
    `👤 Muallif: **${authorName}**\n` +
    `📊 Hajmi: **${detailLabels[detailLevel] || detailLevel}**\n` +
    `🖼 Rasmlar: **${includeImages ? 'HD rasmlar joylanmoqda' : 'Grafik kartalar'}**\n` +
    `🎨 Uslub: **${styleName} (100+ dizayn)**\n\n` +
    `⏳ *(Gemini AI chuqur tahlil qilmoqda va slaydlar tuzilmoqda...)*`;

  if (ctx.callbackQuery?.message) {
    try {
      await ctx.editMessageText(statusText, { parse_mode: 'Markdown' });
      waitMsg = ctx.callbackQuery.message;
    } catch(e) {
      waitMsg = await ctx.reply(statusText, { parse_mode: 'Markdown' });
    }
  } else {
    waitMsg = await ctx.reply(statusText, { parse_mode: 'Markdown' });
  }

  try {
    const buffer = await generateGammaPresentationBuffer(topic, { authorName, detailLevel, includeImages, styleName });
    const safeTopic = topic.slice(0, 25).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_');

    await ctx.replyWithDocument(new InputFile(buffer, `EduAI_${safeTopic}_Taqdimot.pptx`), {
      caption: 
        `🎨 **Gamma & Genspark AI taqdimotingiz tayyor!** (.pptx)\n\n` +
        `📌 Mavzu: **${topic}**\n` +
        `👤 1-slayddagi muallif: **${authorName}**\n` +
        `📊 Ma'lumot hajmi: **${detailLabels[detailLevel] || detailLevel}**\n` +
        `🖼 Rasmlar: **${includeImages ? 'Mavzuga oid HD rasmlar' : 'Minimalist'}**\n` +
        `✨ 16:9 Widescreen, zamonaviy kartochkali va professional dizayn.`
    });
    if (waitMsg) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    }
  } catch(err) {
    await ctx.reply(`❌ Taqdimot yaratishda xatolik: ${err.message}`);
  }
}

function saveDatabase() {
  try {
    ensureDataDir();
    const serialized = {
      prices: db.prices,
      admins: Array.from(db.admins),
      ownerChatId: db.ownerChatId,
      users: Object.fromEntries(db.users),
      simulatedRoles: Object.fromEntries(db.simulatedRoles),
      deviceAuthorizations: db.deviceAuthorizations || {},
      deviceBindings: db.deviceBindings || {}
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(serialized, null, 2), 'utf-8');
  } catch (err) {
    console.error("DB saqlashda xatolik:", err);
  }
}

// 3. ID MAPPING VA XAVFSIZLIK
function resolveUserId(idInput) {
  const str = String(idInput).trim();
  if (str === '1' || str === String(SUPER_OWNER_ID)) {
    return SUPER_OWNER_ID;
  }
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
  const isRealOwner = isRealSuperOwner(ctx);

  if (isRealOwner && db.simulatedRoles.has(userId)) {
    return db.simulatedRoles.get(userId);
  }

  if (isRealOwner) return 'OWNER';
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

  if (typeof user.remainingUses === 'number' && user.remainingUses <= 0) {
    user.status = 'PENDING';
    saveDatabase();
    return false;
  }
  return true;
}

function isSpamming(userId) {
  const now = Date.now();
  const lastTime = db.rateLimits.get(userId) || 0;
  if (now - lastTime < 500) return true;
  db.rateLimits.set(userId, now);
  return false;
}

function sanitizeFormula(val) {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (['=', '+', '-', '@', '\t', '\r'].includes(trimmed.charAt(0))) {
    return `'${trimmed}`;
  }
  return trimmed;
}

// 4. PARSER VA TRANSLITERATSIYA
const OZB_LATIN_TO_CYR = {
  "sh": "ш", "Sh": "Ш", "SH": "Ш", "ch": "ч", "Ch": "Ч", "CH": "Ч",
  "o'": "ў", "O'": "Ў", "o‘": "ў", "O‘": "Ў", "o`": "ў", "O`": "Ў",
  "g'": "ғ", "G'": "Ғ", "g‘": "ғ", "G‘": "Ғ", "g`": "ғ", "G`": "Ғ",
  "yu": "ю", "Yu": "Ю", "YU": "Ю", "ya": "я", "Ya": "Я", "YA": "Я",
  "yo": "ё", "Yo": "Ё", "YO": "Ё", "ye": "е", "Ye": "Е", "YE": "Е",
  "a": "а", "b": "б", "d": "д", "e": "э", "f": "ф", "g": "г",
  "h": "ҳ", "i": "и", "j": "ж", "k": "к", "l": "л", "m": "м",
  "n": "н", "o": "о", "p": "п", "q": "қ", "r": "р", "s": "с",
  "t": "т", "u": "у", "v": "в", "x": "х", "y": "й", "z": "з",
  "A": "А", "B": "Б", "D": "Д", "E": "Э", "F": "Ф", "G": "Г",
  "H": "Ҳ", "I": "И", "J": "Ж", "K": "К", "L": "Л", "M": "М",
  "N": "Н", "O": "О", "P": "П", "Q": "Қ", "R": "Р", "S": "С",
  "T": "Т", "U": "У", "V": "В", "X": "Х", "Y": "Й", "Z": "З"
};

function transliterateLatinToCyrillic(str) {
  let res = str;
  const multiKeys = ["sh", "Sh", "SH", "ch", "Ch", "CH", "o'", "O'", "o‘", "O‘", "o`", "O`", "g'", "G'", "g‘", "G‘", "g`", "G`", "yu", "Yu", "YU", "ya", "Ya", "YA", "yo", "Yo", "YO", "ye", "Ye", "YE"];
  multiKeys.forEach(k => { res = res.split(k).join(OZB_LATIN_TO_CYR[k]); });
  return res.split('').map(char => OZB_LATIN_TO_CYR[char] || char).join('');
}

function parseStudentsFromText(rawText) {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const students = [];

  lines.forEach((line, index) => {
    let clean = line.replace(/^\s*\[?\d+[\.\)\-\]]\s*/, '').trim();

    let phone = '';
    const phoneMatch = clean.match(/(?:\+?998|8)?[\s\-]?(?:\(?\d{2}\)?|\d{2})[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/);
    if (phoneMatch) {
      const digits = phoneMatch[0].replace(/\D/g, '');
      if (digits.length >= 9) {
        const last9 = digits.slice(-9);
        phone = `+998 (${last9.slice(0, 2)}) ${last9.slice(2, 5)}-${last9.slice(5, 7)}-${last9.slice(7, 9)}`;
      }
      clean = clean.replace(phoneMatch[0], ' ').trim();
    }

    let birthDate = '';
    let birthYear = 2008;
    const dateMatch = clean.match(/\b(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{4})\b/);
    if (dateMatch) {
      birthDate = `${dateMatch[1].padStart(2, '0')}.${dateMatch[2].padStart(2, '0')}.${dateMatch[3]}`;
      birthYear = parseInt(dateMatch[3], 10);
      clean = clean.replace(dateMatch[0], ' ').trim();
    } else {
      const yearMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        birthDate = yearMatch[1];
        birthYear = parseInt(yearMatch[1], 10);
        clean = clean.replace(yearMatch[0], ' ').trim();
      }
    }

    let className = '';
    const classMatch = clean.match(/\b(\d{1,2})\s*[\-\.]?\s*([A-Za-zА-Яа-яЎўҒғҚқҲҳ])\b/);
    if (classMatch) {
      className = `${classMatch[1]}-${classMatch[2].toUpperCase()}`;
      clean = clean.replace(classMatch[0], ' ').trim();
    }

    clean = clean.replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = clean.split(' ').map(w => {
      if (w.toLowerCase() === "o'g'li" || w.toLowerCase() === "og'li") return "o'g'li";
      if (w.toLowerCase() === "qizi") return "qizi";
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });
    const fullName = words.join(' ') || `O'quvchi #${index + 1}`;

    const lower = fullName.toLowerCase();
    let gender = "Noma'lum";
    if (lower.includes('qizi') || lower.endsWith('ova') || lower.endsWith('yeva') || lower.endsWith('ovna') || lower.endsWith('yevna')) {
      gender = "Ayol (Qiz)";
    } else if (lower.includes("o'g'li") || lower.endsWith('ov') || lower.endsWith('yev') || lower.endsWith('ovich') || lower.endsWith('yevich')) {
      gender = "Erkak (O'g'il)";
    }

    const age = birthYear ? (new Date().getFullYear() - birthYear) : '-';

    students.push({
      number: index + 1,
      fullName,
      birthDate: birthDate || '-',
      birthYear,
      age,
      gender,
      phone: phone || '-',
      className: className || '10-A'
    });
  });

  return students;
}

// 5. MUKAMMAL FAYL GENERATORLARI (DOCX, XLSX, PPTX)
function generateExcelBuffer(students) {
  const wb = XLSX.utils.book_new();
  const headerRow = ["№", "F.I.Sh (To'liq ism)", "Tug'ilgan sana", "Yoshi", "Jinsi", "Telefon raqami", "Sinfi"];
  const dataRows = students.map((s, idx) => [
    idx + 1,
    sanitizeFormula(s.fullName),
    sanitizeFormula(s.birthDate),
    s.age,
    sanitizeFormula(s.gender),
    sanitizeFormula(s.phone),
    sanitizeFormula(s.className)
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    ["SMARTOFFICE & EDUAI PRO - TARTIBLANGAN O'QUVCHILAR RO'YXATI"],
    [`Hosil qilingan sana: ${new Date().toLocaleDateString('uz-UZ')} | Jami: ${students.length} nafar o'quvchi`],
    [],
    headerRow,
    ...dataRows
  ]);

  ws['!cols'] = [
    { wch: 6 }, { wch: 34 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 22 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Tartiblangan ro'yxat");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

function generateGenderExcelBuffer(students) {
  const wb = XLSX.utils.book_new();
  const boys = students.filter(s => s.gender.includes('Erkak'));
  const girls = students.filter(s => s.gender.includes('Ayol'));

  const header = ["№", "F.I.Sh", "Tug'ilgan sana", "Yoshi", "Telefon", "Sinfi"];
  const boysRows = boys.map((s, i) => [i + 1, s.fullName, s.birthDate, s.age, s.phone, s.className]);
  const girlsRows = girls.map((s, i) => [i + 1, s.fullName, s.birthDate, s.age, s.phone, s.className]);

  const wsBoys = XLSX.utils.aoa_to_sheet([
    ["O'G'IL BOLALAR RO'YXATI", `Jami: ${boys.length} nafar (${Math.round((boys.length / (students.length || 1)) * 100)}%)`],
    [], header, ...boysRows
  ]);
  const wsGirls = XLSX.utils.aoa_to_sheet([
    ["QIZLAR RO'YXATI", `Jami: ${girls.length} nafar (${Math.round((girls.length / (students.length || 1)) * 100)}%)`],
    [], header, ...girlsRows
  ]);

  wsBoys['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 16 }, { wch: 10 }, { wch: 20 }, { wch: 10 }];
  wsGirls['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 16 }, { wch: 10 }, { wch: 20 }, { wch: 10 }];

  XLSX.utils.book_append_sheet(wb, wsBoys, "O'g'il bolalar");
  XLSX.utils.book_append_sheet(wb, wsGirls, "Qizlar");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

function generateUsersExcelBuffer() {
  const wb = XLSX.utils.book_new();
  const userList = Array.from(db.users.values());
  const header = ["№", "ID", "Real Telegram ID", "F.I.Sh / Nomi", "Username", "Holati", "Tarif", "Muddati", "Ro'yxatdan o'tgan"];
  const rows = userList.map((u, i) => [
    i + 1,
    u.id,
    u.realId || u.id,
    sanitizeFormula(u.name || ''),
    u.username ? `@${u.username}` : 'yo\'q',
    u.status,
    u.plan || 'none',
    u.expiresAt || (u.remainingUses ? `${u.remainingUses} ta` : 'Cheksiz'),
    u.registeredAt || '-'
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    ["EDUKATSIYA TIZIMI - BARCHA FOYDALANUVCHILAR BAZASI"],
    [`Eksport sanasi: ${new Date().toLocaleString('uz-UZ')} | Jami: ${userList.length} ta foydalanuvchi`],
    [],
    header,
    ...rows
  ]);

  ws['!cols'] = [{ wch: 6 }, { wch: 10 }, { wch: 18 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws, "Foydalanuvchilar");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

async function generateWordBuffer(students) {
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "№", alignment: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 36, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "F.I.Sh (Familiya, Ismi, Sharif)", alignment: AlignmentType.LEFT })] }),
        new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Tug'ilgan sana", alignment: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Yoshi", alignment: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Jinsi", alignment: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Telefon", alignment: AlignmentType.CENTER })] }),
      ]
    }),
    ...students.map((s, idx) => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: String(idx + 1), alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: s.fullName, alignment: AlignmentType.LEFT })] }),
        new TableCell({ children: [new Paragraph({ text: String(s.birthDate), alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: String(s.age), alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: s.gender, alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: s.phone, alignment: AlignmentType.CENTER })] }),
      ]
    }))
  ];

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
      children: [
        new Paragraph({
          text: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI",
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: "O'QUVCHILARNING RASMIY TARTIBLANGAN RO'YXATI",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: `Sana: ${new Date().toLocaleDateString('uz-UZ')} | Tasdiqlangan nusxa`,
          alignment: AlignmentType.RIGHT
        }),
        new Paragraph({ text: "" }),
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE }
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          text: "Tuzuvchi: SmartOffice & EduAI Pro tizimi | Mas'ul rahbar imzosi: ___________",
          alignment: AlignmentType.LEFT
        })
      ]
    }]
  });

  return await Packer.toBuffer(doc);
}

async function generateLessonPlanWordBuffer(topic = "Ona tili va adabiyot") {
  let planText = "";
  try {
    planText = await generateAILessonPlanWithGemini(topic);
  } catch(e) {
    planText = generateAILessonPlan(topic);
  }
  const planLines = planText.split('\n');

  const docChildren = [];
  planLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      docChildren.push(new Paragraph({ text: "" }));
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      docChildren.push(new Paragraph({ children: [new TextRun({ text: trimmed.replace(/\*\*/g, ''), bold: true })] }));
    } else if (trimmed.startsWith('📚') || trimmed.startsWith('O\'ZBEKISTON')) {
      docChildren.push(new Paragraph({ text: trimmed.replace(/\*\*/g, ''), alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_2 }));
    } else {
      docChildren.push(new Paragraph({ text: trimmed.replace(/\*\*/g, '') }));
    }
  });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
      children: docChildren
    }]
  });
  return await Packer.toBuffer(doc);
}

async function generateOfficialOrderWordBuffer(orderTitle = "O'quvchilarni rag'batlantirish to'g'risida") {
  let orderText = "";
  try {
    orderText = await generateAIOfficialOrderWithGemini(orderTitle);
  } catch(e) {
    orderText = generateAIOfficialOrder(orderTitle);
  }
  const orderLines = orderText.split('\n');

  const docChildren = [];
  orderLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      docChildren.push(new Paragraph({ text: "" }));
    } else if (idx < 3 || trimmed.includes("BUYRUG'I")) {
      docChildren.push(new Paragraph({ text: trimmed, alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_2 }));
    } else if (trimmed.startsWith("BUYURAMAN:")) {
      docChildren.push(new Paragraph({ children: [new TextRun({ text: "BUYURAMAN:", bold: true })] }));
    } else {
      docChildren.push(new Paragraph({ text: trimmed }));
    }
  });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
      children: docChildren
    }]
  });
  return await Packer.toBuffer(doc);
}

async function generatePowerPointBuffer(students, title = "SmartOffice Taqdimoti") {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const slide1 = pptx.addSlide();
  slide1.background = { color: '0F172A' };
  slide1.addText(title.toUpperCase(), {
    x: 0.8, y: 2.2, w: '85%', fontSize: 32, bold: true, color: '38BDF8', align: 'center'
  });
  slide1.addText("EduHujjat & SmartOffice AI tomonidan avtomatlashtirilgan taqdimot", {
    x: 1.0, y: 3.5, w: '80%', fontSize: 18, color: '94A3B8', align: 'center'
  });
  slide1.addText(`Tayyorlangan sana: ${new Date().toLocaleDateString('uz-UZ')}`, {
    x: 1.0, y: 5.5, w: '80%', fontSize: 14, color: '64748B', align: 'center'
  });

  const chunkSize = 5;
  for (let i = 0; i < Math.min(students.length, 25); i += chunkSize) {
    const chunk = students.slice(i, i + chunkSize);
    const slide = pptx.addSlide();
    slide.background = { color: 'F8FAFC' };

    slide.addText(`O'QUVCHILAR GURUHI (${i + 1} - ${i + chunk.length})`, {
      x: 0.8, y: 0.5, fontSize: 20, bold: true, color: '1E293B'
    });

    chunk.forEach((st, idx) => {
      const topY = 1.3 + (idx * 0.95);
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: topY, w: 8.4, h: 0.8, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
      });
      slide.addText(`${i + idx + 1}. ${st.fullName}`, {
        x: 1.0, y: topY + 0.15, fontSize: 14, bold: true, color: '0F172A'
      });
      slide.addText(`Tug'ilgan sana: ${st.birthDate} (${st.age} yosh) | Jinsi: ${st.gender} | Tel: ${st.phone}`, {
        x: 1.0, y: topY + 0.45, fontSize: 11, color: '64748B'
      });
    });
  }

  const lastSlide = pptx.addSlide();
  lastSlide.background = { color: '0F172A' };
  lastSlide.addText("E'TIBORINGIZ UCHUN RAHMAT!", {
    x: 1.0, y: 2.8, w: '80%', fontSize: 32, bold: true, color: '38BDF8', align: 'center'
  });

  return await pptx.write({ outputType: 'nodebuffer' });
}

function getThemeKeyForTopic(topic = "") {
  const t = String(topic || '').toLowerCase();
  if (/biolog|qon|hujayra|o'simlik|hayvon|anatomi|genetika|ekolog|tibbiyot|salomat|yurak|jigar/i.test(t)) return 'emerald';
  if (/tarix|adabiyot|huquq|falsafa|til|ona tili|ingliz|rus|san'at|madaniyat|geograf|temur|bobur/i.test(t)) return 'solar';
  if (/fizika|astronom|kimyo|energiya|mexanika|atom|kvant|fazo/i.test(t)) return 'amethyst';
  if (/matematik|algebra|geometr|hisob|iqtisod|moliya|biznes|statistika/i.test(t)) return 'genspark';
  if (/texnika|robot|dasturlash|ai|sun'iy/i.test(t)) return 'obsidian';
  return 'obsidian';
}

async function generateGammaPresentationBuffer(topic = "Fotosintez jarayoni va biosfera", options = {}) {
  const authorName = typeof options === 'string' ? options : (options.authorName || "SmartOffice EduAI");
  const detailLevel = options.detailLevel || 'medium';
  const includeImages = options.includeImages !== false;
  const chosenStyle = options.styleName || 'auto';

  let cards = null;
  try {
    cards = await generateAIGammaCardsWithGemini(topic, { authorName, detailLevel, includeImages });
  } catch(e) {}
  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    cards = generateRealAIGammaCards(topic);
  }

  // Uslubni aniqlash
  let theme = null;
  if (chosenStyle === 'random') {
    const keys = Object.keys(GAMMA_THEMES);
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    theme = GAMMA_THEMES[randKey];
  } else if (chosenStyle !== 'auto' && GAMMA_THEMES[chosenStyle]) {
    theme = GAMMA_THEMES[chosenStyle];
  } else {
    const key = getThemeKeyForTopic(topic);
    theme = GAMMA_THEMES[key] || GAMMA_THEMES.obsidian;
  }
  const { bg, cardBg, accent, accent2, text: textColor, subtext: subtextColor, cardBorder } = theme;

  // Rasmni yuklab olish
  let topicImageBase64 = null;
  if (includeImages) {
    try {
      const imgUrl = getTopicImageUrl(topic);
      topicImageBase64 = await fetchImageAsBase64(imgUrl, 3500);
    } catch(e) {}
  }

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  cards.forEach((card, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: bg };

    // 4 XIL BETAKROR ORQA FON GRAFIKASI (HECH QACHON BIR XIL BO'LMAYDI)
    const decorType = index % 4;
    if (decorType === 0) {
      slide.addShape(pptx.ShapeType.ellipse, {
        x: -1.2, y: -1.0, w: 4.8, h: 4.8, fill: { color: accent, transparency: 86 }, line: { color: accent, width: 0 }
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 6.8, y: 2.8, w: 4.6, h: 4.6, fill: { color: accent2, transparency: 88 }, line: { color: accent2, width: 0 }
      });
    } else if (decorType === 1) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 0.28, w: 2.5, h: 0.05, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.02
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 8.5, y: 0.35, w: 0.12, h: 0.12, fill: { color: accent }, line: { color: accent, width: 0 }
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 8.75, y: 0.35, w: 0.12, h: 0.12, fill: { color: accent2 }, line: { color: accent2, width: 0 }
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 9.0, y: 0.35, w: 0.12, h: 0.12, fill: { color: subtextColor }, line: { color: subtextColor, width: 0 }
      });
    } else if (decorType === 2) {
      slide.addShape(pptx.ShapeType.line, {
        x: 8.8, y: -0.5, w: 2.0, h: 2.0, line: { color: cardBorder, width: 1.5, dashType: 'solid' }
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: -0.5, y: 3.5, w: 3.5, h: 3.5, fill: { color: accent2, transparency: 90 }, line: { color: accent2, width: 0 }
      });
    } else {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 5.35, w: 1.5, h: 0.06, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.03
      });
    }

    // Top Header Breadcrumb & Divider
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8, y: 0.62, w: 8.4, h: 0, line: { color: cardBorder, width: 0.75, dashType: 'solid' }
    });
    slide.addText(`SMARTOFFICE & EDUAI PRO  •  GAMMA ENGINE  •  SLAYD ${index + 1}/${cards.length}`, {
      x: 0.8, y: 0.32, w: 8.4, h: 0.28, fontSize: 9.5, color: subtextColor, bold: true
    });

    if (card.speakerNotes) {
      slide.addNotes(card.speakerNotes);
    }

    const type = card.type || (index === 0 ? 'hero' : 'concept');

    // 1. HERO SLAYD (MUQOVA - 1-VAROQDA FOYDALANUVCHINING ISMI)
    if (type === 'hero' || (index === 0 && type !== 'split' && type !== 'pillars' && type !== 'split_image')) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 4.4, fill: { color: cardBg }, line: { color: cardBorder, width: 1.5 }, rectRadius: 0.15
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.04
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.2, y: 1.25, w: 3.5, h: 0.42, fill: { color: bg }, line: { color: accent, width: 1.2 }, rectRadius: 0.08
      });
      slide.addText(card.badge || "GAMMA AI TAQDIMOT", {
        x: 1.2, y: 1.25, w: 3.5, h: 0.42, fontSize: 11, bold: true, color: accent, align: 'center', valign: 'middle'
      });
      slide.addText((card.title || topic).toUpperCase(), {
        x: 1.2, y: 1.85, w: 7.6, h: 1.5, fontSize: 28, bold: true, color: textColor
      });
      slide.addText(card.subtitle || "Zamonaviy ta'lim va tahliliy taqdimot", {
        x: 1.2, y: 3.45, w: 7.6, h: 1.0, fontSize: 14.5, color: subtextColor
      });
      // 1-VAROQDA MUALLIFNING TELEGRAM / TO'LIQ ISMI
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.2, y: 4.55, w: 4.8, h: 0.42, fill: { color: bg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.08
      });
      slide.addText(`👤 Taqdimotchi: ${authorName}  |  ⚡ AI Verified`, {
        x: 1.35, y: 4.55, w: 4.5, h: 0.42, fontSize: 10, color: subtextColor, valign: 'middle'
      });
    }

    // 2. SPLIT_IMAGE (CHAPDA YUQORI SIFATLI RASM, O'NGDA CHUQUR TAHLIL)
    else if (type === 'split_image' || (type === 'split' && topicImageBase64 && index % 2 === 1)) {
      slide.addText(card.title || "Vizual Tahlil va Ilmiy Asoslar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: textColor
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 3.9, h: 4.0, fill: { color: cardBg }, line: { color: accent, width: 1.5 }, rectRadius: 0.12
      });
      if (topicImageBase64) {
        slide.addImage({
          data: topicImageBase64,
          x: 0.9, y: 1.35, w: 3.7, h: 3.3,
          sizing: { type: 'cover', w: 3.7, h: 3.3 },
          round: true
        });
        slide.addText(card.badge || "HD ILMIY DIAGRAMMA", {
          x: 1.0, y: 4.75, w: 3.5, h: 0.35, fontSize: 9.5, bold: true, color: accent, align: 'center'
        });
      } else {
        slide.addText("🖼️ VIZUAL GRAFIKA VA SXEMA", {
          x: 1.0, y: 2.8, w: 3.5, h: 0.6, fontSize: 13, bold: true, color: accent, align: 'center'
        });
      }

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.15, y: 1.25, w: 4.05, h: 4.0, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.12
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.15, y: 1.25, w: 4.05, h: 0.08, fill: { color: accent2 }, line: { color: accent2, width: 0 }, rectRadius: 0.04
      });
      slide.addText("📌 Muhim Qoidalar va Tahlil:", {
        x: 5.35, y: 1.45, w: 3.65, h: 0.35, fontSize: 13.5, bold: true, color: accent2
      });
      if (card.explanation) {
        slide.addText(card.explanation, {
          x: 5.35, y: 1.85, w: 3.65, h: 1.1, fontSize: 11, color: subtextColor
        });
      }
      const bullets = (card.bullets || card.leftBullets || card.rightBullets || []).map(b => `✓  ${b}`).join("\n\n");
      slide.addText(bullets || "✓ Mavzuga oid aniq ta'limiy faktlar\n\n✓ Darslik mezonlariga mos xulosalar", {
        x: 5.35, y: card.explanation ? 3.05 : 1.95, w: 3.65, h: card.explanation ? 2.05 : 3.1, fontSize: 11, color: textColor
      });
    }

    // 3. BENTO_3 (BENTO BOX ASYMMETRIC LAYOUT - 1 KATTA + 2 KICHIK)
    else if (type === 'bento_3') {
      slide.addText(card.title || "Modulli Bento Tuzilma", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: textColor
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 5.0, h: 4.0, fill: { color: cardBg }, line: { color: accent, width: 1.5 }, rectRadius: 0.12
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 5.0, h: 0.08, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.mainBlock?.title || card.badge || "ASOSIY TADQIQOT", {
        x: 1.1, y: 1.55, w: 4.4, h: 0.45, fontSize: 16, bold: true, color: accent
      });
      slide.addText(card.mainBlock?.desc || card.explanation || "Mavzuning eng fundamental markazi va darslikdagi asosiy g'oyasi.", {
        x: 1.1, y: 2.1, w: 4.4, h: 2.8, fontSize: 12.5, color: textColor
      });
      const sideCards = card.sideCards || [
        { title: "Parametr 1", desc: "Tahliliy mezon" },
        { title: "Parametr 2", desc: "Natija va xulosa" }
      ];
      sideCards.slice(0, 2).forEach((sc, idx) => {
        const yPos = 1.25 + (idx * 2.1);
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 6.05, y: yPos, w: 3.15, h: 1.9, fill: { color: cardBg }, line: { color: idx === 0 ? accent2 : cardBorder, width: 1 }, rectRadius: 0.1
        });
        slide.addText(sc.title, {
          x: 6.25, y: yPos + 0.2, w: 2.75, h: 0.35, fontSize: 12.5, bold: true, color: idx === 0 ? accent2 : textColor
        });
        slide.addText(sc.desc, {
          x: 6.25, y: yPos + 0.6, w: 2.75, h: 1.1, fontSize: 10.5, color: subtextColor
        });
      });
    }

    // 4. CONCEPT / TA'RIF SLAYDI
    else if (type === 'concept') {
      slide.addText(card.title || "Asosiy Tushuncha", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: textColor
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 8.4, h: 1.85, fill: { color: cardBg }, line: { color: accent, width: 1.5 }, rectRadius: 0.12
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 0.12, h: 1.85, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.05
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.15, y: 1.45, w: 2.8, h: 0.35, fill: { color: bg }, line: { color: accent, width: 1 }, rectRadius: 0.06
      });
      slide.addText(card.badge || "FUNDAMENTAL QOIDA", {
        x: 1.15, y: 1.45, w: 2.8, h: 0.35, fontSize: 9.5, bold: true, color: accent, align: 'center', valign: 'middle'
      });
      slide.addText(card.mainConcept || card.title, {
        x: 1.15, y: 1.9, w: 7.7, h: 1.05, fontSize: 14.5, bold: true, color: textColor
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 3.25, w: 4.05, h: 2.05, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 3.25, w: 4.05, h: 0.06, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.03
      });
      slide.addText("📌 Ilmiy Sharh:", {
        x: 1.05, y: 3.42, w: 3.6, h: 0.32, fontSize: 12, bold: true, color: accent
      });
      slide.addText(card.explanation || "Mavzuga oid chuqur nazariy va amaliy ma'lumotlar.", {
        x: 1.05, y: 3.8, w: 3.6, h: 1.35, fontSize: 11, color: subtextColor
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.15, y: 3.25, w: 4.05, h: 2.05, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.15, y: 3.25, w: 4.05, h: 0.06, fill: { color: accent2 }, line: { color: accent2, width: 0 }, rectRadius: 0.03
      });
      slide.addText("✓ Muhim Asoslar:", {
        x: 5.35, y: 3.42, w: 3.6, h: 0.32, fontSize: 12, bold: true, color: accent2
      });
      const bulletsText = (card.bullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(bulletsText || "• Fundamental ta'limiy tamoyillar", {
        x: 5.35, y: 3.8, w: 3.6, h: 1.35, fontSize: 11, color: subtextColor
      });
    }

    // 5. GRID4 (2x2 KARTALAR)
    else if (type === 'grid4') {
      slide.addText(card.title || "Tarkibiy Qismlar va Tuzilma", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: textColor
      });
      slide.addText(card.subtitle || "Asosiy elementlar tahlili", {
        x: 0.8, y: 1.12, w: 8.4, h: 0.28, fontSize: 11, color: subtextColor
      });
      const items = (card.items || []).slice(0, 4);
      const coords = [
        { x: 0.8, y: 1.45, col: accent, tag: "01" },
        { x: 5.15, y: 1.45, col: accent2, tag: "02" },
        { x: 0.8, y: 3.45, col: accent2, tag: "03" },
        { x: 5.15, y: 3.45, col: accent, tag: "04" }
      ];
      coords.forEach((pos, idx) => {
        const item = items[idx] || { title: `Element ${idx + 1}`, desc: "Batafsil ma'lumot" };
        slide.addShape(pptx.ShapeType.roundRect, {
          x: pos.x, y: pos.y, w: 4.05, h: 1.85, fill: { color: cardBg }, line: { color: pos.col, width: 1 }, rectRadius: 0.1
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: pos.x, y: pos.y, w: 4.05, h: 0.06, fill: { color: pos.col }, line: { color: pos.col, width: 0 }, rectRadius: 0.03
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: pos.x + 0.2, y: pos.y + 0.18, w: 0.5, h: 0.32, fill: { color: bg }, line: { color: pos.col, width: 1 }, rectRadius: 0.05
        });
        slide.addText(pos.tag, {
          x: pos.x + 0.2, y: pos.y + 0.18, w: 0.5, h: 0.32, fontSize: 9.5, bold: true, color: pos.col, align: 'center', valign: 'middle'
        });
        slide.addText(item.title, {
          x: pos.x + 0.8, y: pos.y + 0.18, w: 3.05, h: 0.35, fontSize: 12.5, bold: true, color: textColor
        });
        slide.addText(item.desc, {
          x: pos.x + 0.25, y: pos.y + 0.6, w: 3.6, h: 1.15, fontSize: 10.5, color: subtextColor
        });
      });
    }

    // 6. SPLIT (VERSUS & QIYOSIY TAHLIL)
    else if (type === 'split') {
      slide.addText(card.title || "Qiyosiy va Funksional Tahlil", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: textColor
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 3.9, h: 4.0, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.12
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 3.9, h: 0.08, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.leftTitle || "📌 1-Yo'nalish", {
        x: 1.05, y: 1.45, w: 3.4, h: 0.42, fontSize: 13.5, bold: true, color: accent
      });
      const leftText = (card.leftBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(leftText || "• Tahliliy ma'lumotlar", {
        x: 1.05, y: 1.95, w: 3.4, h: 3.1, fontSize: 11, color: subtextColor
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.3, y: 1.25, w: 3.9, h: 4.0, fill: { color: cardBg }, line: { color: accent2, width: 1 }, rectRadius: 0.12
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.3, y: 1.25, w: 3.9, h: 0.08, fill: { color: accent2 }, line: { color: accent2, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.rightTitle || "💡 2-Yo'nalish", {
        x: 5.5, y: 1.45, w: 3.4, h: 0.42, fontSize: 13.5, bold: true, color: accent2
      });
      const rightText = (card.rightBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(rightText || "• Tahliliy ma'lumotlar", {
        x: 5.5, y: 1.95, w: 3.4, h: 3.1, fontSize: 11, color: subtextColor
      });

      // Markaziy Floating VS Badji
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 4.7, y: 2.9, w: 0.6, h: 0.6, fill: { color: bg }, line: { color: accent, width: 1.5 }
      });
      slide.addText("VS", {
        x: 4.7, y: 2.9, w: 0.6, h: 0.6, fontSize: 9.5, bold: true, color: accent, align: 'center', valign: 'middle'
      });
    }

    // 7. PILLARS (3 TA USTUN)
    else if (type === 'pillars') {
      slide.addText(card.title || "Asosiy Ustunlar va Tamoyillar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: textColor
      });
      slide.addText(card.subtitle || "", {
        x: 0.8, y: 1.12, w: 8.4, h: 0.28, fontSize: 11, color: subtextColor
      });
      const pillars = (card.cards || []).slice(0, 3);
      pillars.forEach((c, idx) => {
        const xPos = 0.8 + (idx * 2.9);
        const col = idx === 1 ? accent2 : accent;
        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos, y: 1.45, w: 2.65, h: 3.9, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.12
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos, y: 1.45, w: 2.65, h: 0.08, fill: { color: col }, line: { color: col, width: 0 }, rectRadius: 0.04
        });
        slide.addShape(pptx.ShapeType.ellipse, {
          x: xPos + 0.25, y: 1.68, w: 0.55, h: 0.55, fill: { color: bg }, line: { color: col, width: 1.2 }
        });
        slide.addText(c.num || `0${idx + 1}`, {
          x: xPos + 0.25, y: 1.68, w: 0.55, h: 0.55, fontSize: 12, bold: true, color: col, align: 'center', valign: 'middle'
        });
        slide.addText(c.title, {
          x: xPos + 0.25, y: 2.35, w: 2.15, h: 0.5, fontSize: 13.5, bold: true, color: textColor
        });
        slide.addText(c.desc, {
          x: xPos + 0.25, y: 2.9, w: 2.15, h: 2.3, fontSize: 10.5, color: subtextColor
        });
      });
    }

    // 8. STATS (METRIKA VA STATISTIK FAKTLAR)
    else if (type === 'stats' || type === 'deep_dive') {
      slide.addText(card.title || "Asosiy Parametrlar va Statistik Faktlar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: textColor
      });
      if (card.stats && Array.isArray(card.stats) && card.stats.length > 0) {
        const statsList = card.stats.slice(0, 3);
        statsList.forEach((st, idx) => {
          const xPos = 0.8 + (idx * 2.9);
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos, y: 1.35, w: 2.65, h: 4.0, fill: { color: cardBg }, line: { color: accent, width: 1.2 }, rectRadius: 0.12
          });
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos, y: 1.35, w: 2.65, h: 0.08, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.04
          });
          slide.addText(st.value, {
            x: xPos + 0.15, y: 1.6, w: 2.35, h: 0.85, fontSize: 32, bold: true, color: accent, align: 'center'
          });
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos + 0.3, y: 2.5, w: 2.05, h: 0.08, fill: { color: bg }, line: { color: cardBorder, width: 0.5 }, rectRadius: 0.04
          });
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos + 0.3, y: 2.5, w: 1.2 + (idx * 0.35), h: 0.08, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.04
          });
          slide.addText(st.label, {
            x: xPos + 0.15, y: 2.7, w: 2.35, h: 0.5, fontSize: 12.5, bold: true, color: textColor, align: 'center'
          });
          slide.addText(st.desc || "", {
            x: xPos + 0.15, y: 3.25, w: 2.35, h: 1.95, fontSize: 10.5, color: subtextColor, align: 'center'
          });
        });
      } else {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 1.25, w: 3.2, h: 4.0, fill: { color: cardBg }, line: { color: accent, width: 1.5 }, rectRadius: 0.12
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 1.25, w: 3.2, h: 0.08, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.04
        });
        slide.addText(card.metricValue || "98.5%", {
          x: 1.0, y: 1.9, w: 2.8, h: 1.0, fontSize: 44, bold: true, color: accent, align: 'center'
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.2, y: 3.0, w: 2.4, h: 0.1, fill: { color: bg }, line: { color: cardBorder, width: 0.5 }, rectRadius: 0.05
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.2, y: 3.0, w: 2.2, h: 0.1, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.05
        });
        slide.addText(card.metricLabel || "Samaradorlik Ko'rsatkichi", {
          x: 1.0, y: 3.25, w: 2.8, h: 0.7, fontSize: 12.5, bold: true, color: textColor, align: 'center'
        });

        slide.addShape(pptx.ShapeType.roundRect, {
          x: 4.3, y: 1.25, w: 4.9, h: 4.0, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.12
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 4.3, y: 1.25, w: 4.9, h: 0.08, fill: { color: accent2 }, line: { color: accent2, width: 0 }, rectRadius: 0.04
        });
        slide.addText("🔍 Tahliliy Faktlar va Natijalar:", {
          x: 4.55, y: 1.55, w: 4.4, h: 0.42, fontSize: 13.5, bold: true, color: textColor
        });
        const bulletsText = (card.bullets || []).map(b => `✓  ${b}`).join("\n\n");
        slide.addText(bulletsText || "✓ Tizimli tahlil ma'lumotlari", {
          x: 4.55, y: 2.1, w: 4.4, h: 2.9, fontSize: 11, color: subtextColor
        });
      }
    }

    // 9. TIMELINE / ROADMAP
    else if (type === 'timeline' || type === 'roadmap') {
      slide.addText(card.title || "Jarayon Ketma-Ketligi va Bosqichlar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: textColor
      });
      slide.addShape(pptx.ShapeType.line, {
        x: 1.3, y: 1.8, w: 0, h: 2.6, line: { color: accent, width: 1.8, dashType: 'dash' }
      });
      const steps = (card.steps || []).slice(0, 3);
      steps.forEach((st, idx) => {
        const yPos = 1.35 + (idx * 1.3);
        slide.addShape(pptx.ShapeType.ellipse, {
          x: 1.1, y: yPos + 0.32, w: 0.4, h: 0.4, fill: { color: accent }, line: { color: bg, width: 1.5 }
        });
        slide.addText(String(idx + 1), {
          x: 1.1, y: yPos + 0.32, w: 0.4, h: 0.4, fontSize: 10, bold: true, color: bg, align: 'center', valign: 'middle'
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.7, y: yPos, w: 7.5, h: 1.15, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.1
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.7, y: yPos, w: 0.08, h: 1.15, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.04
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.95, y: yPos + 0.2, w: 1.6, h: 0.32, fill: { color: bg }, line: { color: accent, width: 1 }, rectRadius: 0.06
        });
        slide.addText(st.step || `${idx + 1}-BOSQICH`, {
          x: 1.95, y: yPos + 0.2, w: 1.6, h: 0.32, fontSize: 9.5, bold: true, color: accent, align: 'center', valign: 'middle'
        });
        slide.addText(st.title, {
          x: 3.75, y: yPos + 0.18, w: 5.25, h: 0.35, fontSize: 12.5, bold: true, color: textColor
        });
        slide.addText(st.desc || st.text || "", {
          x: 3.75, y: yPos + 0.55, w: 5.25, h: 0.5, fontSize: 10.5, color: subtextColor
        });
      });
    }

    // 10. QUIZ SLIDE (INTERAKTIV BILIMNI SINASH)
    else if (type === 'quiz_slide') {
      slide.addText(card.title || "Interaktiv Bilimni Sinash", {
        x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: textColor
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.15, w: 8.4, h: 1.05, fill: { color: cardBg }, line: { color: accent, width: 1.5 }, rectRadius: 0.1
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.15, w: 8.4, h: 0.06, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.03
      });
      slide.addText(card.question || "Mavzuga oid muhim savol?", {
        x: 1.05, y: 1.25, w: 7.9, h: 0.85, fontSize: 13.5, bold: true, color: textColor
      });
      const options = (card.options || []).slice(0, 4);
      const optCoords = [
        { x: 0.8, y: 2.35 },
        { x: 5.15, y: 2.35 },
        { x: 0.8, y: 3.25 },
        { x: 5.15, y: 3.25 }
      ];
      optCoords.forEach((pos, idx) => {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: pos.x, y: pos.y, w: 4.05, h: 0.78, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.08
        });
        slide.addShape(pptx.ShapeType.ellipse, {
          x: pos.x + 0.15, y: pos.y + 0.18, w: 0.4, h: 0.4, fill: { color: bg }, line: { color: accent, width: 1 }
        });
        slide.addText(["A", "B", "C", "D"][idx], {
          x: pos.x + 0.15, y: pos.y + 0.18, w: 0.4, h: 0.4, fontSize: 10, bold: true, color: accent, align: 'center', valign: 'middle'
        });
        slide.addText(options[idx] || `Variant ${idx + 1}`, {
          x: pos.x + 0.65, y: pos.y + 0.12, w: 3.25, h: 0.55, fontSize: 11, color: textColor
        });
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 4.15, w: 8.4, h: 1.2, fill: { color: cardBg }, line: { color: accent2, width: 1.2 }, rectRadius: 0.1
      });
      slide.addText("🔑 O'qituvchi Kaliti va Ilmiy Sharh:", {
        x: 1.05, y: 4.25, w: 7.9, h: 0.32, fontSize: 11, bold: true, color: accent2
      });
      slide.addText(card.answer || "To'g'ri javob tahlili", {
        x: 1.05, y: 4.58, w: 7.9, h: 0.68, fontSize: 10.5, color: subtextColor
      });
    }

    // 11. CONCLUSION / XULOSA
    else {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 4.4, fill: { color: cardBg }, line: { color: cardBorder, width: 1.5 }, rectRadius: 0.15
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: accent }, line: { color: accent, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.title || "Yakuniy Xulosa va Natijalar", {
        x: 1.2, y: 1.15, w: 7.6, h: 0.5, fontSize: 22, bold: true, color: accent
      });
      if (card.quote) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.2, y: 1.8, w: 7.6, h: 1.05, fill: { color: bg }, line: { color: accent2, width: 1 }, rectRadius: 0.08
        });
        slide.addText(`“ ${card.quote} ”`, {
          x: 1.4, y: 1.9, w: 7.2, h: 0.85, fontSize: 12.5, italic: true, color: textColor, align: 'center', valign: 'middle'
        });
      }
      const takeawaysText = (card.takeaways || []).map(t => `★  ${t}`).join("\n\n");
      slide.addText(takeawaysText || "★ Mavzuning muhim ta'limiy xulosalari", {
        x: 1.2, y: 3.0, w: 7.6, h: 2.1, fontSize: 11.5, color: subtextColor
      });
    }
  });

  return await pptx.write({ outputType: 'nodebuffer' });
}

async function generateTestWordBuffer(rawText) {
  const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 3);
  const sampleTopic = lines[0] || "O'zbekiston tarixi va fan asoslari";

  let testText = "";
  try {
    testText = await generateAITestWithGemini(sampleTopic, 15);
  } catch(e) {
    testText = generateAITestSuite(sampleTopic, 15);
  }
  const testLines = testText.split('\n');

  const docChildren = [
    new Paragraph({ text: "O'ZBEKISTON RESPUBLIKASI MAKTAB TA'LIMI", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "NAZORAT TESTLARI VARIANTI (15 TALIK)", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: `Mavzu: "${sampleTopic.slice(0, 60)}"`, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "----------------------------------------------------------------------------------" }),
    new Paragraph({ text: "" })
  ];

  testLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('━━━━━━━━') || trimmed.startsWith('🎲') || trimmed.startsWith('📌') || trimmed.startsWith('🏛') || trimmed.startsWith('✨')) {
      return;
    }
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      docChildren.push(new Paragraph({ children: [new TextRun({ text: trimmed.replace(/\*\*/g, ''), bold: true })] }));
    } else if (trimmed.startsWith('🔑')) {
      docChildren.push(new Paragraph({ text: "" }));
      docChildren.push(new Paragraph({ children: [new TextRun({ text: trimmed.replace(/\*\*/g, ''), bold: true })], heading: HeadingLevel.HEADING_2 }));
    } else {
      docChildren.push(new Paragraph({ text: trimmed.replace(/\*\*/g, '') }));
    }
  });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
      children: docChildren
    }]
  });

  return await Packer.toBuffer(doc);
}

async function generateStudentReferenceWordBuffer(studentName = "Aliyev Sardor Baxtiyor o'g'li", className = "10-A") {
  let refText = "";
  try {
    refText = await generateAIStudentReferenceWithGemini(studentName);
  } catch(e) {
    refText = generateAIStudentReference(studentName, className);
  }
  const refLines = refText.split('\n');

  const docChildren = [];
  refLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      docChildren.push(new Paragraph({ text: "" }));
    } else if (trimmed.startsWith("TAVSIFNOMA")) {
      docChildren.push(new Paragraph({ text: trimmed, alignment: AlignmentType.CENTER, heading: HeadingLevel.TITLE }));
    } else if (trimmed.startsWith("Toshkent") || trimmed.includes("sinf o'quvchisi")) {
      docChildren.push(new Paragraph({ text: trimmed, alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_2 }));
    } else {
      docChildren.push(new Paragraph({ text: trimmed }));
    }
  });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
      children: docChildren
    }]
  });

  return await Packer.toBuffer(doc);
}


async function generateProtocolWordBuffer(topic = "Ta'lim sifatini oshirish va monitoring", schoolNum = "45") {
  let protoText = "";
  try {
    protoText = await generateAIProtocolWithGemini(topic);
  } catch(e) {
    protoText = generateAIPedagogicalProtocol(topic, schoolNum);
  }
  const protoLines = protoText.split('\n');

  const docChildren = [];
  protoLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      docChildren.push(new Paragraph({ text: "" }));
    } else if (trimmed.includes("BAYONNOMASI") || trimmed.includes("VAZIRLIGI")) {
      docChildren.push(new Paragraph({ text: trimmed, alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_2 }));
    } else if (trimmed.startsWith("KUN TARTIBI:") || trimmed.startsWith("ESHITILDI:") || trimmed.startsWith("MUZOKARAGA CHIQDILAR:") || trimmed.startsWith("QAROR QILINDI:")) {
      docChildren.push(new Paragraph({ children: [new TextRun({ text: trimmed, bold: true })] }));
    } else {
      docChildren.push(new Paragraph({ text: trimmed }));
    }
  });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
      children: docChildren
    }]
  });

  return await Packer.toBuffer(doc);
}

// 6. KLAVIATURADA TURADIGAN SUPER TUGMALAR (REPLY KEYBOARDS)
function getReplyKeyboardForRole(role, isRegisteredActive = false) {
  if (role === 'OWNER') {
    return new Keyboard()
      .text("⚡ Tezkor Yoqish").text("🔑 Saytga Kirish Kodi").row()
      .text("🤖 EduAI Yordamchi").text("👥 Foydalanuvchilar").row()
      .text("📑 Hujjat Fabrikasi").text("🎲 Test Generatori").row()
      .text("📊 Excel Jadvallar").text("🎨 Gamma AI Taqdimot").row()
      .text("📜 Faxriy Yorliq").text("🖼 Slayd Yasash").row()
      .text("💰 Narxlar").text("🛡 Adminlar").row()
      .text("📢 Ommaviy Xabar").text("📥 Bazani Yuklash (Excel)").row()
      .text("🎭 Rejimni Almashtirish").text("📊 Statistika").row()
      .text("🌐 WebApp Ochish").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }

  if (role === 'ADMIN') {
    return new Keyboard()
      .text("⚡ Tezkor Yoqish").text("🔑 Saytga Kirish Kodi").row()
      .text("🤖 EduAI Yordamchi").text("👥 Foydalanuvchilar").row()
      .text("📑 Hujjat Fabrikasi").text("🎲 Test Generatori").row()
      .text("📊 Excel Jadvallar").text("🎨 Gamma AI Taqdimot").row()
      .text("💰 Narxlar").text("📊 Statistika").row()
      .text("🎭 Rejimni Qaytarish (Owner)").text("🌐 WebApp Ochish").row()
      .text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }

  if (role === 'INSPECTOR') {
    return new Keyboard()
      .text("🔍 Nazorat / Tekshirish").text("🔑 Saytga Kirish Kodi").row()
      .text("📊 Statistika").text("👥 Foydalanuvchilar").row()
      .text("📥 Bazani Yuklash (Excel)").text("🎭 Rejimni Qaytarish (Owner)").row()
      .text("🌐 WebApp Ochish").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }

  if (isRegisteredActive) {
    return new Keyboard()
      .text("🔑 Saytga Kirish Kodi").text("🤖 EduAI Yordamchi").row()
      .text("📑 Hujjat Fabrikasi").text("📄 Demo Ma'lumot").row()
      .text("📊 Excel Jadvallar").text("🎨 Gamma AI Taqdimot").row()
      .text("ℹ️ Mening Hisobim").text("💳 Muddatni Uzaytirish").row()
      .text("🎭 Rejimni Qaytarish (Owner)").text("🌐 WebApp Ochish").row()
      .text("🔄 Yangilash /start")
      .resized()
      .persistent();
  } else {
    return new Keyboard()
      .text("🔑 Saytga Kirish Kodi").text("💳 Litsenziya Sotib Olish").row()
      .text("💰 Narxlar va Tariflar").text("ℹ️ Bot Qoidalari").row()
      .text("🎭 Rejimni Qaytarish (Owner)").text("🌐 WebApp Ochish").row()
      .text("🔄 Yangilash /start")
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
    .webApp("🚀 Telegram Mini App", WEBAPP_URL)
    .url("🌐 Brauzerda Ochish", WEBAPP_URL);
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
    .text(`⚡ 1 Martalik`, `act_${targetUserId}_1time`)
    .row()
    .text(`❌ Rad etish / Bloklash`, `block_${targetUserId}`);
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
    .text("🔀 Qizlar / O'g'illar jadvali", "act_export_gender")
    .text("🔄 Lotin <-> Kirill o'girish", "act_translit")
    .row()
    .webApp("🚀 Mini App-da Ochish", WEBAPP_URL)
    .url("🌐 Brauzerda Ochish", WEBAPP_URL);
}

function getDocumentFactoryKeyboard() {
  return new InlineKeyboard()
    .text("📋 Maktab Buyrug'i (.docx)", "doc_order")
    .text("📝 Dars Ishlanmasi (.docx)", "doc_lesson")
    .row()
    .text("🎓 Referat / Titul (.docx)", "doc_referat")
    .text("📄 Rasmiy Ariza (.docx)", "doc_ariza")
    .row()
    .text("🏆 Faxriy Yorliq (.docx)", "doc_certificate")
    .text("🔍 O'quvchi Tavsifnoma (.docx)", "doc_tavsif")
    .row()
    .text("📊 Davomat Tabeli (.xlsx)", "doc_davomat")
    .text("📈 Baholar Jurnali (.xlsx)", "doc_grades")
    .row()
    .text("🗂 Dars Jadvali (.xlsx)", "doc_schedule")
    .text("🎲 2 Variantli Test (.docx)", "act_export_test");
}

function downloadTelegramFile(fileUrl) {
  return new Promise((resolve, reject) => {
    https.get(fileUrl, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// 7. /start BUYRUG'I
bot.command('start', async (ctx) => {
  const user = ctx.from;
  const userId = user.id;
  const username = user.username || '';
  const fullName = `${user.first_name} ${user.last_name || ''}`.trim();

  if (isRealSuperOwner(ctx)) {
    db.ownerChatId = ctx.chat.id;
    saveDatabase();
  }

  if (!db.users.has(userId)) {
    const isOwnerUser = isRealSuperOwner(ctx);
    // Yangi oddiy foydalanuvchi boshida HAR DOIM PENDING (yopiq) bo'ladi
    db.users.set(userId, {
      id: isOwnerUser ? 1 : userId,
      realId: userId,
      name: fullName,
      username,
      status: isOwnerUser ? 'ACTIVE' : 'PENDING',
      plan: isOwnerUser ? 'unlimited' : 'none',
      expiresAt: isOwnerUser ? 'Cheksiz VIP' : null,
      remainingUses: isOwnerUser ? 999999 : null,
      registeredAt: new Date().toISOString()
    });
    saveDatabase();
  }

  const role = getEffectiveRole(ctx);
  const active = isUserActive(userId, username);
  const replyKeyboard = getReplyKeyboardForRole(role, active);
  const displayId = getDisplayUserId(userId);

  if (role === 'OWNER') {
    return ctx.reply(
      `👑 **ASSALOMU ALAYKUM SUPER OWNER @${OWNER_USERNAME}!**\n\n` +
      `Siz **EduHujjat AI & SmartOffice Pro** tizimining mutlaq boshqaruvchisiz.\n` +
      `🆔 **Sizning tizimdagi ID raqamingiz:** \`1\` *(Telegram ID: ${userId})*\n\n` +
      `🔑 **Saytga kirish master kodingiz:** \`1331\`\n` +
      `🌐 **Web platforma:** ${WEBAPP_URL}\n\n` +
      `⌨️ **Klaviatura tugmalari faol:** Pastdagi barcha tugmalar orqali tizimni boshqaring.\n` +
      `💬 **Chap tarafdagi [🌐 WebApp] tugmasi** orqali Mini App-ni 1 marta bosishda ochishingiz mumkin!`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  if (role === 'ADMIN') {
    return ctx.reply(
      `🛡️ **ASSALOMU ALAYKUM ADMINISTRATOR!**\n\n` +
      `Foydalanuvchilarni faollashtirish, litsenziya berish va barcha generatorlardan foydalanish huquqiga egasiz.\n` +
      `Pastdagi barcha boshqaruv tugmalaridan foydalaning:`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  if (role === 'INSPECTOR') {
    return ctx.reply(
      `🔍 **ASSALOMU ALAYKUM TEKSHIRUVCHI (AUDITOR)!**\n\n` +
      `Siz tizim statistikasi, arxivlar va foydalanuvchilar hisobotini tekshirish rejimidasiz.`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  if (!active) {
    return ctx.reply(
      `🔒 **ASSALOMU ALAYKUM, ${fullName}!**\n\n` +
      `**"EduHujjat AI"** — Maktablar, o'qituvchilar va ofislar uchun yopiq professional hujjatlar platformasi.\n\n` +
      `Sizning Telegram ID: \`${userId}\`\n\n` +
      `👇 **Saytga kirish uchun Kod kerak bo'ladi.** Kodni olish uchun quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    ).then(() => {
      ctx.reply(`👇 **Tarifni tanlang:**`, { reply_markup: getTariffInlineKeyboard(userId) });
    });
  }

  const curUser = db.users.get(userId);
  const remainingInfo = curUser?.remainingUses ? `(Qolgan imkoniyat: ${curUser.remainingUses} ta)` : '';
  const accessCode = getAccessCodeForUser(userId);

  return ctx.reply(
    `✅ **XUSH KELIBSIZ, ${fullName}!**\n\n` +
    `Sizning hisobingiz faol! ${remainingInfo}\n` +
    `🔑 **Saytga Kirish Kodingiz:** \`${accessCode}\`\n\n` +
    `📎 **Word (.docx), Excel (.xlsx) faylini tashlang yoki matn yuboring** — tizim 3 soniyada tayyorlab beradi!`,
    { parse_mode: 'Markdown', reply_markup: replyKeyboard }
  );
});

// 8. FAYL QABUL QILISH (WORD, EXCEL, CSV, TXT)
bot.on('message:document', async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const doc = ctx.message.document;
  const fileName = doc.file_name || 'fayl';
  const ext = path.extname(fileName).toLowerCase();

  if (isSpamming(userId)) return;

  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Fayllarni qayta ishlash uchun hisobingizni faollashtiring.**\n` +
      `Sizning ID: \`${userId}\``,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }

  const waitMsg = await ctx.reply(`⏳ **"${fileName}" fayli yuklab olinmoqda va tahlil qilinmoqda...**`);

  try {
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    const fileBuffer = await downloadTelegramFile(fileUrl);

    let extractedText = '';

    if (ext === '.docx') {
      const res = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = res.value;
    } else if (ext === '.xlsx' || ext === '.xls') {
      const wb = XLSX.read(fileBuffer, { type: 'buffer' });
      const firstSheet = wb.SheetNames[0];
      const sheet = wb.Sheets[firstSheet];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      extractedText = rows.map(r => Array.isArray(r) ? r.join(' ') : '').join('\n');
    } else if (ext === '.txt' || ext === '.csv') {
      extractedText = fileBuffer.toString('utf-8');
    } else {
      await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
      return ctx.reply("❌ Noma'lum fayl formati! Faqat .docx, .xlsx, .csv yoki .txt fayl yuboring.");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
      return ctx.reply("⚠️ Fayl ichida matn topilmadi.");
    }

    db.userSessions.set(userId, extractedText);
    const students = parseStudentsFromText(extractedText);
    await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);

    return ctx.reply(
      `✅ **FAYL MUVAFFAQIYATLI QABUL QILINDI!**\n\n` +
      `📄 Fayl: **${fileName}**\n` +
      `👥 Aniqlangan yozuvlar: **${students.length} nafar**\n\n` +
      `👇 **Qaysi formatda tayyorlab yuklab olmoqchisiz?**`,
      { parse_mode: 'Markdown', reply_markup: getActionInlineKeyboard() }
    );
  } catch (err) {
    console.error("Fayl yuklashda xatolik:", err);
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return ctx.reply(`❌ Faylni ochishda xatolik: ${err.message}`);
  }
});

// 9. INLINE TUGMALAR VA HODISALAR
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  // 0. QURILMANI TASDIQLASH (Single-Device Authorization Callback)
  if (data.startsWith('dev_allow_')) {
    const reqId = data.replace('dev_allow_', '');
    db.deviceAuthorizations = db.deviceAuthorizations || {};
    db.deviceAuthorizations[reqId] = { status: 'APPROVED', time: Date.now() };
    saveDatabase();

    await ctx.answerCallbackQuery({ text: "✅ Ruxsat berildi!" });
    try {
      await ctx.editMessageText(
        (ctx.callbackQuery.message?.text || '') +
        `\n\n━━━━━━━━━━━━━━━━━━━━━━\n✅ **RUXSAT BERILDI!**\nAdmin (@${ctx.from?.username || ctx.from?.first_name}) yangi qurilmaga ruxsat berdi. Oldingi qurilma sessiyasi avtomatik bekor qilindi.`,
        { parse_mode: 'Markdown' }
      );
    } catch(e){}
    return;
  }

  if (data.startsWith('dev_deny_')) {
    const reqId = data.replace('dev_deny_', '');
    db.deviceAuthorizations = db.deviceAuthorizations || {};
    db.deviceAuthorizations[reqId] = { status: 'DENIED', time: Date.now() };
    saveDatabase();

    await ctx.answerCallbackQuery({ text: "❌ Kirish rad etildi!", show_alert: true });
    try {
      await ctx.editMessageText(
        (ctx.callbackQuery.message?.text || '') +
        `\n\n━━━━━━━━━━━━━━━━━━━━━━\n❌ **RAD ETILDI!**\nAdmin ushbu yangi qurilmadan kirishni rad etdi.`,
        { parse_mode: 'Markdown' }
      );
    } catch(e){}
    return;
  }

  // =========================================================================
  // SLIDE WIZARD CALLBACK HANDLERS (INTERFAOL TAQDIMOT BOSQICHLARI)
  // =========================================================================
  if (data.startsWith('sw_auth_')) {
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'lim va zamonaviy metodika" };
    let chosenAuthor = "SmartOffice EduAI";
    if (data === 'sw_auth_handle') {
      chosenAuthor = ctx.from?.username ? `@${ctx.from.username}` : (ctx.from?.first_name || "Muallif");
    } else if (data === 'sw_auth_name') {
      chosenAuthor = `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim() || "Muallif";
    } else if (data === 'sw_auth_teacher') {
      chosenAuthor = "Maktab o'qituvchisi";
    }
    sw.authorName = chosenAuthor;
    sw.step = 'awaiting_detail';
    slideWizardState.set(userId, sw);
    await ctx.answerCallbackQuery({ text: `Muallif: ${chosenAuthor}` });
    return sendWizardDetailStep(ctx, sw.topic, sw.authorName, true);
  }

  if (data === 'sw_quick') {
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot" };
    const author = sw.authorName || ctx.from?.first_name || "SmartOffice EduAI";
    slideWizardState.delete(userId);
    await ctx.answerCallbackQuery({ text: "Tezkor taqdimot tayyorlanmoqda..." });
    return executePresentationGeneration(ctx, sw.topic || "Ta'limiy taqdimot", {
      authorName: author,
      detailLevel: 'medium',
      includeImages: true,
      styleName: 'auto'
    });
  }

  if (data.startsWith('sw_det_')) {
    const level = data.replace('sw_det_', '');
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot", authorName: ctx.from?.first_name || "EduAI" };
    sw.detailLevel = level;
    sw.step = 'awaiting_images';
    slideWizardState.set(userId, sw);
    await ctx.answerCallbackQuery({ text: "Ma'lumot hajmi belgilandi!" });
    return sendWizardImageStep(ctx, sw.topic, sw.authorName, sw.detailLevel, true);
  }

  if (data.startsWith('sw_img_')) {
    const withImg = data === 'sw_img_yes';
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot", authorName: ctx.from?.first_name || "EduAI" };
    sw.includeImages = withImg;
    sw.step = 'awaiting_style';
    slideWizardState.set(userId, sw);
    await ctx.answerCallbackQuery({ text: withImg ? "HD rasmlar qo'shiladi!" : "Minimalist tanlandi!" });
    return sendWizardStyleStep(ctx, sw.topic, sw.authorName, sw.detailLevel || 'medium', sw.includeImages, true);
  }

  if (data.startsWith('sw_sty_')) {
    const styleKey = data.replace('sw_sty_', '');
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot" };
    const finalTopic = sw.topic || db.userSessions.get(userId) || "Ta'limiy taqdimot";
    const finalAuthor = sw.authorName || ctx.from?.first_name || "SmartOffice EduAI";
    const finalDetail = sw.detailLevel || 'medium';
    const finalImages = sw.includeImages !== false;
    slideWizardState.delete(userId);
    await ctx.answerCallbackQuery({ text: "Slaydlar yaratilmoqda..." });
    return executePresentationGeneration(ctx, finalTopic, {
      authorName: finalAuthor,
      detailLevel: finalDetail,
      includeImages: finalImages,
      styleName: styleKey
    });
  }

  // GAMMA AI TAYYOR PRESET MAVZULAR
  if (data.startsWith('gamma_preset_')) {
    const topicKey = data.replace('gamma_preset_', '');
    const presetTopics = {
      fotosintez: "Fotosintez jarayoni va o'simliklar biosferasi",
      temur: "Amir Temur davlati va harbiy strategiyasi",
      ai: "Sun'iy Intellekt va Raqamli Ta'lim 2026",
      pifagor: "Pifagor teoremasi va fazoviy geometriya",
      maktab: "Zamonaviy Maktab Monitoringi va Raqamli Davomat"
    };
    const chosenTopic = presetTopics[topicKey] || "Fotosintez jarayoni va biosfera";
    await ctx.answerCallbackQuery({ text: "Mavzu tanlandi!" });
    return startSlideWizard(ctx, chosenTopic);
  }

  // EDUAI DINAMIK MAVZU BO'YICHA FAYL GENERATSIYASI
  if (data.startsWith('ai_gen_')) {
    const action = data.replace('ai_gen_', '');
    const currentText = db.userSessions.get(userId) || "Ta'lim va zamonaviy pedagogika";
    const topic = currentText.split(/\r?\n/)[0].slice(0, 80) || "Ta'lim va zamonaviy pedagogika";

    if (action === 'gamma') {
      await ctx.answerCallbackQuery({ text: "Slayd yaratish bosqichlari boshlandi..." });
      return startSlideWizard(ctx, topic);
    }

    if (action === 'lesson') {
      await ctx.answerCallbackQuery({ text: "Dars konspekti yaratilmoqda..." });
      const waitMsg = await ctx.reply(`📝 **"${topic}" bo'yicha 45 daqiqalik namunaviy dars ishlanmasi tayyorlanmoqda...**`);
      try {
        const buffer = await generateLessonPlanWordBuffer(topic);
        await ctx.replyWithDocument(new InputFile(buffer, `Dars_Konspekti_${topic.slice(0, 20).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}.docx`), {
          caption: `📝 **45 Daqiqalik dars ishlanmasi (konspekt) tayyor!** (.docx)\n\n📌 Mavzu: **${topic}**\n✨ Maqsadlar, 6 bosqichli xronometraj, blits-savollar va uyga vazifa bilan.`
        });
        try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      } catch(err) {
        await ctx.reply(`❌ Xatolik yuz berdi: ${err.message}`);
      }
      return;
    }

    if (action === 'test') {
      await ctx.answerCallbackQuery({ text: "Test tuzilmoqda..." });
      const waitMsg = await ctx.reply(`🎲 **"${topic}" bo'yicha 15 talik nazorat testlari va javoblar kaliti tuzilmoqda...**`);
      try {
        const buffer = await generateTestWordBuffer(topic);
        await ctx.replyWithDocument(new InputFile(buffer, `Test_va_Kalitlar_${topic.slice(0, 20).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}.docx`), {
          caption: `🎲 **15 Talik nazorat testlari va javoblar kaliti tayyor!** (.docx)\n\n📌 Mavzu: **${topic}**\n✨ Variantlar (A, B, C, D) va oxirida o'qituvchi uchun javoblar kaliti.`
        });
        try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      } catch(err) {
        await ctx.reply(`❌ Xatolik yuz berdi: ${err.message}`);
      }
      return;
    }

    if (action === 'order') {
      await ctx.answerCallbackQuery({ text: "Buyruq hujjati yaratilmoqda..." });
      const waitMsg = await ctx.reply(`📋 **"${topic}" bo'yicha rasmiy maktab buyrug'i tayyorlanmoqda...**`);
      try {
        const buffer = await generateOfficialOrderWordBuffer(topic);
        await ctx.replyWithDocument(new InputFile(buffer, `Maktab_Buyrugi_${topic.slice(0, 20).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}.docx`), {
          caption: `📋 **Rasmiy maktab direktori buyrug'i tayyor!** (.docx)\n\n📌 Mavzu: **${topic}**\n✨ Vazirlik me'yorlari va huquqiy asoslari bilan.`
        });
        try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      } catch(err) {
        await ctx.reply(`❌ Xatolik yuz berdi: ${err.message}`);
      }
      return;
    }

    
    if (action === 'proto') {
      await ctx.answerCallbackQuery({ text: "Bayonnoma yaratilmoqda..." });
      const waitMsg = await ctx.reply(`📜 **"${topic}" bo'yicha Pedagogik kengash bayonnomasi tayyorlanmoqda...**`);
      try {
        const buffer = await generateProtocolWordBuffer(topic, "45");
        await ctx.replyWithDocument(new InputFile(buffer, `Bayonnoma_${topic.slice(0, 20).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}.docx`), {
          caption: `📜 **Pedagogik kengash bayonnomasi tayyor!** (.docx)\n\n📌 Mavzu: **${topic}**\n✨ Kun tartibi, muzokaralar va rasmiy qaror qismi bilan.`
        });
        try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      } catch(err) {
        await ctx.reply(`❌ Xatolik yuz berdi: ${err.message}`);
      }
      return;
    }

    if (action === 'tavsif') {
      await ctx.answerCallbackQuery({ text: "Tavsifnoma yaratilmoqda..." });
      const waitMsg = await ctx.reply(`🔍 **"${topic}" bo'yicha namunaviy pedagogik tavsifnoma tayyorlanmoqda...**`);
      try {
        const buffer = await generateStudentReferenceWordBuffer(topic, "10-A");
        await ctx.replyWithDocument(new InputFile(buffer, `Tavsifnoma_${topic.slice(0, 20).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}.docx`), {
          caption: `🔍 **Pedagogik tavsifnoma (xarakteristika) tayyor!** (.docx)\n\n📌 O'quvchi: **${topic}**\n✨ A'lochi va faol o'quvchi uchun rasmiy xarakteristika.`
        });
        try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      } catch(err) {
        await ctx.reply(`❌ Xatolik yuz berdi: ${err.message}`);
      }
      return;
    }
  }

  if (data === 'switch_roles') {
    if (!isRealSuperOwner(ctx)) return ctx.answerCallbackQuery({ text: "Faqat Super Owner uchun!" });
    return ctx.reply("🎭 **Qaysi rejimga o'tmoqchisiz?**", { reply_markup: getRoleSwitchKeyboard() });
  }

  if (data.startsWith('set_role_')) {
    if (!isRealSuperOwner(ctx)) return ctx.answerCallbackQuery({ text: "Faqat Super Owner uchun!" });
    const targetRole = data.replace('set_role_', '');
    db.simulatedRoles.set(userId, targetRole);
    saveDatabase();
    await ctx.answerCallbackQuery({ text: `Rejim: ${targetRole} ga o'tkazildi!` });

    const replyKb = getReplyKeyboardForRole(targetRole, targetRole === 'USER' ? false : true);
    return ctx.reply(
      `🎭 **Siz muvaffaqiyatli [${targetRole}] rejimiga o'tdingiz!**\n\n` +
      `Endi bot va pastdagi klaviatura aynan shu rejimdagidek ishlaydi.\n` +
      `Asosiy rejimga qaytish uchun pastdagi \`🎭 Rejimni Qaytarish (Owner)\` tugmasini bosing.`,
      { parse_mode: 'Markdown', reply_markup: replyKb }
    );
  }

  if (data.startsWith('buy_')) {
    const [_, plan, userIdStr] = data.split('_');
    const targetUserId = parseInt(userIdStr, 10);

    const planLabels = {
      oneTime: "1 Martalik Hujjat", twoTime: "2 Martalik Hujjat", fiveTime: "5 Martalik Hujjat",
      hourly: "1 Soatlik Kirish", twoHours: "2 Soatlik Kirish", threeHours: "3 Soatlik Kirish",
      daily: "1 Kunlik Sinov", weekly: "1 Haftalik Obuna", monthly: "1 Oylik Standart", unlimited: "Cheksiz VIP"
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
      } catch (e) {}
    }
    return;
  }

  const knownActionExport = ['act_export_xlsx', 'act_export_docx', 'act_export_pptx', 'act_export_test', 'act_export_gender', 'act_sort_az', 'act_sort_year', 'act_translit'];
  if (data.startsWith('act_') && !knownActionExport.includes(data)) {
    const role = getEffectiveRole(ctx);
    if (role !== 'OWNER' && role !== 'ADMIN') {
      return ctx.answerCallbackQuery({ text: "Sizda bunday huquq yo'q!", show_alert: true });
    }
    const [_, targetIdStr, planCode] = data.split('_');
    const targetId = resolveUserId(targetIdStr);

    const user = db.users.get(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';

    let label = 'Faollashtirildi';

    if (planCode === 'vip' || planCode === 'unlimited') {
      user.plan = 'unlimited';
      user.remainingUses = 999999;
      user.expiresAt = 'Cheksiz VIP';
      label = '👑 Cheksiz VIP';
    } else if (planCode.endsWith('time')) {
      const times = parseInt(planCode, 10) || 1;
      user.plan = `${times}time`;
      user.remainingUses = times;
      user.expiresAt = `${times} ta hujjat`;
      label = `⚡ ${times} Martalik Hujjat`;
    } else if (planCode.endsWith('h')) {
      const hours = parseInt(planCode, 10) || 1;
      user.plan = `${hours}h`;
      user.remainingUses = null;
      user.expiresAt = `${hours} soat`;
      label = `⏱ ${hours} Soatlik Kirish`;
    } else if (planCode.endsWith('d')) {
      const days = parseInt(planCode, 10) || 1;
      user.plan = `${days}d`;
      user.remainingUses = null;
      user.expiresAt = `${days} kun`;
      label = `📅 ${days} Kunlik`;
    } else if (planCode === '1w') {
      user.plan = 'weekly';
      user.remainingUses = null;
      user.expiresAt = '7 kun';
      label = '🗓 1 Haftalik';
    } else if (planCode === '1m') {
      user.plan = 'monthly';
      user.remainingUses = null;
      user.expiresAt = '30 kun';
      label = '⭐ 1 Oylik Pro';
    }

    db.users.set(targetId, user);
    saveDatabase();

    const code = getAccessCodeForUser(targetId);

    await ctx.answerCallbackQuery({ text: `Hisob ${label} bilan yoqildi!` });
    await ctx.editMessageText(
      `✅ **HISOB MUVOFAQIYATLI YOQILDI!**\n\n` +
      `👤 ID: \`${getDisplayUserId(targetId)}\` *(Telegram ID: ${targetId})*\n` +
      `💳 Tarif: **${label}**\n` +
      `🔑 Kirish Kodi: \`${code}\`\n` +
      `Tasdiqlovchi: @${ctx.from?.username || 'admin'}`,
      { parse_mode: 'Markdown' }
    );

    try {
      const userReplyKb = getReplyKeyboardForRole('USER', true);
      await bot.api.sendMessage(
        targetId,
        `🎉 **HISOBINGIZ FOALLASHTIRILDI!**\n\n` +
        `Boshqaruvchi hisobingizni tasdiqladi. Sizga **${label}** imkoniyati berildi!\n\n` +
        `🔑 **Saytga Kirish Kodingiz:** \`${code}\`\n` +
        `🌐 **Sayt manzili:** ${WEBAPP_URL}\n\n` +
        `Saytga kirib, ushbu kodni kiritsangiz to'liq ochiladi!`,
        { 
          parse_mode: 'Markdown',
          reply_markup: userReplyKb 
        }
      );
    } catch (e) {}
    return;
  }

  if (data.startsWith('block_')) {
    const role = getEffectiveRole(ctx);
    if (role !== 'OWNER' && role !== 'ADMIN') return;
    const targetId = resolveUserId(data.replace('block_', ''));
    const user = db.users.get(targetId);
    if (user) {
      user.status = 'BLOCKED';
      saveDatabase();
    }
    await ctx.answerCallbackQuery({ text: "Foydalanuvchi rad etildi." });
    await ctx.editMessageText(`❌ **Foydalanuvchi rad etildi.** (ID: \`${getDisplayUserId(targetId)}\`)`, { parse_mode: 'Markdown' });
    return;
  }

  // HUJJAT FABRIKASI SHABLONLARI
  if (data === 'doc_order') {
    await ctx.answerCallbackQuery({ text: "Buyruq hujjati..." });
    const buf = await generateOfficialOrderWordBuffer("O'quvchilarni rag'batlantirish to'g'risida");
    return ctx.replyWithDocument(new InputFile(buf, "Maktab_Direktori_Buyrugi.docx"), {
      caption: "📋 **Rasmiy maktab buyrug'i shabloni tayyor!** (.docx)"
    });
  }

  if (data === 'doc_lesson') {
    await ctx.answerCallbackQuery({ text: "Dars ishlanmasi..." });
    const buf = await generateLessonPlanWordBuffer("Ona tili va adabiyot darsi");
    return ctx.replyWithDocument(new InputFile(buf, "45_Daqiqalik_Dars_Ishlanmasi.docx"), {
      caption: "📝 **45 daqiqalik namunaviy dars ishlanmasi (konspekt) tayyor!** (.docx)"
    });
  }

  if (data === 'doc_referat') {
    await ctx.answerCallbackQuery({ text: "Referat shabloni..." });
    const buf = await generateLessonPlanWordBuffer("Referat va Mustaqil ish (GOST)");
    return ctx.replyWithDocument(new InputFile(buf, "Referat_Titul_va_Reja.docx"), {
      caption: "🎓 **Titul varag'i va GOST standartidagi referat shabloni tayyor!** (.docx)"
    });
  }

  if (data === 'doc_ariza') {
    await ctx.answerCallbackQuery({ text: "Ariza shabloni..." });
    const buf = await generateOfficialOrderWordBuffer("Direktor nomiga rasmiy ariza");
    return ctx.replyWithDocument(new InputFile(buf, "Rasmiy_Ariza_Shabloni.docx"), {
      caption: "📄 **Direktor nomiga rasmiy ariza va tushuntirish xati tayyor!** (.docx)"
    });
  }

  if (data === 'doc_certificate') {
    await ctx.answerCallbackQuery({ text: "Faxriy yorliq..." });
    const buf = await generateOfficialOrderWordBuffer("Faxriy Yorliq va Sertifikat");
    return ctx.replyWithDocument(new InputFile(buf, "Faxriy_Yorliq_EduHujjat.docx"), {
      caption: "🏆 **QR-kodli namunaviy Faxriy Yorliq hujjati tayyor!** (.docx)"
    });
  }

  if (data === 'doc_tavsif') {
    await ctx.answerCallbackQuery({ text: "Tavsifnoma..." });
    const buf = await generateOfficialOrderWordBuffer("O'quvchiga rasmiy xarakteristika");
    return ctx.replyWithDocument(new InputFile(buf, "Oquvchi_Xarakteristika.docx"), {
      caption: "🔍 **O'quvchiga ijobiy xarakteristika / tavsifnoma hujjati tayyor!** (.docx)"
    });
  }

  if (data === 'doc_davomat') {
    await ctx.answerCallbackQuery({ text: "Davomat tabeli..." });
    const demoStudents = parseStudentsFromText("1. Karimova Dildora\n2. Abdullayev Jasur\n3. Omonov Sardor\n4. Toshmatova Rayhon");
    const buf = generateExcelBuffer(demoStudents);
    return ctx.replyWithDocument(new InputFile(buf, "Oylik_Davomat_Tabeli.xlsx"), {
      caption: "📊 **Oylik davomat tabeli tayyor!** (.xlsx)"
    });
  }

  if (data === 'doc_grades') {
    await ctx.answerCallbackQuery({ text: "Baholar jurnali..." });
    const demoStudents = parseStudentsFromText("1. Karimova Dildora\n2. Abdullayev Jasur\n3. Omonov Sardor");
    const buf = generateExcelBuffer(demoStudents);
    return ctx.replyWithDocument(new InputFile(buf, "Baholar_Jurnali_GPA.xlsx"), {
      caption: "📈 **Baholar jurnali va GPA reyting jadvali tayyor!** (.xlsx)"
    });
  }

  if (data === 'doc_schedule') {
    await ctx.answerCallbackQuery({ text: "Dars jadvali..." });
    const demoStudents = parseStudentsFromText("1. Karimova Dildora\n2. Abdullayev Jasur");
    const buf = generateExcelBuffer(demoStudents);
    return ctx.replyWithDocument(new InputFile(buf, "Dars_Jadvali_va_Navbatchilik.xlsx"), {
      caption: "🗂 **Haftalik dars jadvali va navbatchilik grafigi tayyor!** (.xlsx)"
    });
  }

  // MATNDAN REAL FAYL GENERATSIYASI
  const currentText = db.userSessions.get(userId);
  if (!currentText) {
    return ctx.answerCallbackQuery({ text: "Avval matn yoki fayl yuboring!", show_alert: true });
  }

  const students = parseStudentsFromText(currentText);

  if (data === 'act_export_xlsx') {
    await ctx.answerCallbackQuery({ text: "Excel jadval yaratilmoqda..." });
    const waitMsg = await ctx.reply("⏳ **Excel (.xlsx) jadval yaratilmoqda...**");
    const buffer = generateExcelBuffer(students);
    await ctx.replyWithDocument(new InputFile(buffer, "EduHujjat_Tartiblangan_Jadval.xlsx"), {
      caption: `📊 **Excel jadval tayyor!** (${students.length} nafar o'quvchi ma'lumotlari bilan)`
    });
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return;
  }

  if (data === 'act_export_gender') {
    await ctx.answerCallbackQuery({ text: "Qizlar va o'g'il bolalar jadvali..." });
    const waitMsg = await ctx.reply("⏳ **Qizlar va o'g'il bolalarga alohida jadvallar tuzilmoqda...**");
    const buffer = generateGenderExcelBuffer(students);
    await ctx.replyWithDocument(new InputFile(buffer, "EduHujjat_Qizlar_va_Ogillar_Jadvali.xlsx"), {
      caption: `🔀 **Qizlar va o'g'il bolalar alohida jadvallarga ajratildi!**`
    });
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return;
  }

  if (data === 'act_export_docx') {
    await ctx.answerCallbackQuery({ text: "Word hujjat yaratilmoqda..." });
    const waitMsg = await ctx.reply("⏳ **Word (.docx) hujjat yaratilmoqda...**");
    const buffer = await generateWordBuffer(students);
    await ctx.replyWithDocument(new InputFile(buffer, "EduHujjat_Rasmiy_Royxat.docx"), {
      caption: `📝 **Word hujjat tayyor!** (GOST standarti bo'yicha jadvalli formatda)`
    });
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return;
  }

  if (data === 'act_export_pptx') {
    await ctx.answerCallbackQuery({ text: "PowerPoint taqdimot yaratilmoqda..." });
    const waitMsg = await ctx.reply("⏳ **Slaydlar (.pptx) generatsiya qilinmoqda...**");
    const buffer = await generatePowerPointBuffer(students, "EduHujjat Taqdimot");
    await ctx.replyWithDocument(new InputFile(buffer, "EduHujjat_Taqdimot.pptx"), {
      caption: `🖼 **PowerPoint taqdimot tayyor!** (Zamonaviy slaydlar bilan)`
    });
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return;
  }

  if (data === 'act_export_test') {
    await ctx.answerCallbackQuery({ text: "Test tuzilmoqda..." });
    const waitMsg = await ctx.reply("⏳ **15 talik test va javoblar kaliti tuzilmoqda...**");
    const buffer = await generateTestWordBuffer(currentText);
    await ctx.replyWithDocument(new InputFile(buffer, "EduHujjat_15_Test_va_Kalitlar.docx"), {
      caption: `❓ **15 talik test tayyor!** (Variantlar va to'g'ri javoblar kaliti bilan)`
    });
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return;
  }

  if (data === 'act_sort_az') {
    await ctx.answerCallbackQuery({ text: "Alifbo bo'yicha saralandi!" });
    const sorted = [...students].sort((a, b) => a.fullName.localeCompare(b.fullName, 'uz-UZ'));
    let out = `🔤 **ALIFBO BO'YICHA TARTIBLANGAN RO'YXAT (A-Z):**\n\n`;
    sorted.forEach((s, idx) => {
      out += `${idx + 1}. **${s.fullName}** — ${s.birthDate} (${s.age} yosh) | ${s.phone}\n`;
    });
    return ctx.reply(out.slice(0, 4000), { parse_mode: 'Markdown', reply_markup: getActionInlineKeyboard() });
  }

  if (data === 'act_sort_year') {
    await ctx.answerCallbackQuery({ text: "Yosh bo'yicha saralandi!" });
    const sorted = [...students].sort((a, b) => b.birthYear - a.birthYear);
    let out = `📅 **YOSH VA TUG'ILGAN SANA BO'YICHA SARALANGAN:**\n\n`;
    sorted.forEach((s, idx) => {
      out += `${idx + 1}. **${s.fullName}** — ${s.birthDate} (${s.age} yosh) | ${s.gender}\n`;
    });
    return ctx.reply(out.slice(0, 4000), { parse_mode: 'Markdown', reply_markup: getActionInlineKeyboard() });
  }

  if (data === 'act_translit') {
    await ctx.answerCallbackQuery({ text: "Kirill yozuviga o'girildi!" });
    const cyrillicText = transliterateLatinToCyrillic(currentText);
    return ctx.reply(
      `🔄 **KIRILL YOZUVIGA O'GIRILGAN MATN:**\n\n\`\`\`\n${cyrillicText.slice(0, 3500)}\n\`\`\``,
      { parse_mode: 'Markdown', reply_markup: getActionInlineKeyboard() }
    );
  }
});

// 10. MATN BUYRUQLARI VA KLAVIATURA BOSILGANDA
// =========================================================================
// UNIVERSAL INTELLIGENT AI ENGINE (ODAM NIMA HOHLAYOTGANINI ANIQ TUSHUNISH)
// =========================================================================
async function processIntelligentMessage(ctx, userPrompt) {
  const userId = ctx.from.id;
  const raw = userPrompt.trim();
  if (!raw) return;

  db.userSessions.set(userId, raw);
  const lower = raw.toLowerCase();

  // 1. SLAYD / TAQDIMOT ISTAGI
  if (/\b(?:slayd|taqdimot|prezentatsiya|powerpoint|pptx)\b/i.test(lower) && /\b(?:tuz|yarat|qilib ber|kerak|yasash|tayyorla|qil)\b/i.test(lower)) {
    const cleanTopic = raw.replace(/\b(?:slayd|taqdimot|prezentatsiya|powerpoint|pptx|tuzib ber|tuz|yarat|qilib ber|kerak|yasash|tayyorla|qil|menga|iltimos)\b/gi, '').trim();
    return startSlideWizard(ctx, cleanTopic || raw);
  }

  // 2. TEST SO'ROVI (MASALAN: 8-sinf biologiya qon 10talik test)
  const isTestRequest = /\b(?:test|savollar varianti|nazorat testi)\b/i.test(lower) && 
    (/\b(?:tuz|yarat|ber|kerak|yoz|variant|talik|dts|savol|sinf)\b/i.test(lower) || /\d+\s*talik/i.test(lower));

  if (isTestRequest) {
    const countMatch = raw.match(/(\d+)\s*(?:ta|talik|savol)/i);
    const count = countMatch ? Math.min(parseInt(countMatch[1], 10), 30) : 10;
    const cleanTopic = raw.replace(/\b(?:test|testlar|tuzib ber|tuz|yarat|ber|kerak|yoz|nazorat|varianti|variant|\d+\s*talik|\d+\s*ta|menga|iltimos)\b/gi, '').trim();
    const finalTopic = cleanTopic || raw;

    const waitMsg = await ctx.reply(`🎲 **"${finalTopic}" bo'yicha ${count} talik nazorat testi va kalitlar tuzilmoqda...**\n⏳ *(DTS standartlari va tasodifiy A,B,C,D variantlar bilan)*`);
    try {
      let testResult = "";
      try {
        testResult = await generateAITestWithGemini(finalTopic, count);
      } catch (err) {
        testResult = generateAITestSuite(finalTopic, count);
      }

      const kb = new InlineKeyboard()
        .text("📥 Testni Word (.docx) yuklash", "ai_gen_test")
        .text("🎨 Slayd (.pptx) qilish", "ai_gen_gamma")
        .row()
        .text("📝 Dars konspekti (.docx)", "ai_gen_lesson")
        .webApp("🚀 WebApp-da Ochish", WEBAPP_URL);

      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(testResult, { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Test tuzishda xatolik: ${err.message}`);
    }
  }

  // 3. KONSPEKT / DARS ISHLANMASI
  const isLessonRequest = /\b(?:konspekt|dars ishlanma|dars ishlanmasi|dars reja|45 daqiqa)\b/i.test(lower);
  if (isLessonRequest) {
    const cleanTopic = raw.replace(/\b(?:konspekt|dars ishlanmasi|dars ishlanma|dars rejasi|dars reja|45 daqiqalik|45 daqiqa|tuzib ber|tuz|yarat|yoz|kerak|menga|iltimos)\b/gi, '').trim();
    const finalTopic = cleanTopic || raw;

    const waitMsg = await ctx.reply(`📝 **"${finalTopic}" bo'yicha 45 daqiqalik dars ishlanmasi (konspekt) tayyorlanmoqda...**\n⏳ *(6 bosqichli xronometraj bilan)*`);
    try {
      let lessonResult = "";
      try {
        lessonResult = await generateAILessonPlanWithGemini(finalTopic);
      } catch (err) {
        lessonResult = generateAILessonPlan(finalTopic);
      }

      const kb = new InlineKeyboard()
        .text("📥 Konspektni Word (.docx) yuklash", "ai_gen_lesson")
        .text("🎨 Slayd (.pptx) qilish", "ai_gen_gamma")
        .row()
        .text("🎲 15 Talik Test (.docx)", "ai_gen_test")
        .webApp("🚀 WebApp-da Ochish", WEBAPP_URL);

      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(lessonResult, { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Konspekt tayyorlashda xatolik: ${err.message}`);
    }
  }

  // 4. BUYRUQ LOYIHASI
  if (/\b(?:buyruq|qaror)\b/i.test(lower) && /\b(?:tuz|yoz|loyihasi|maktab|direktor|ber)\b/i.test(lower)) {
    const waitMsg = await ctx.reply("📋 **Rasmiy maktab buyrug'i loyihasi tayyorlanmoqda...**");
    try {
      let orderResult = "";
      try {
        orderResult = await generateAIOfficialOrderWithGemini(raw);
      } catch(e) {
        orderResult = generateAIOfficialOrder(raw);
      }
      const kb = new InlineKeyboard()
        .text("📥 Buyruqni Word (.docx) yuklash", "ai_gen_order")
        .webApp("🚀 WebApp", WEBAPP_URL);
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(orderResult, { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Buyruq tuzishda xatolik: ${err.message}`);
    }
  }

  // 5. O'QUVCHI TAVSIFNOMASI
  if (/\b(?:tavsifnoma|xarakteristika)\b/i.test(lower)) {
    const waitMsg = await ctx.reply("🔍 **O'quvchi uchun rasmiy pedagogik tavsifnoma yozilmoqda...**");
    try {
      let refResult = "";
      try {
        refResult = await generateAIStudentReferenceWithGemini(raw);
      } catch(e) {
        refResult = generateAIStudentReference(raw, "10-A");
      }
      const kb = new InlineKeyboard()
        .text("📥 Tavsifnomani Word (.docx) yuklash", "ai_gen_tavsif")
        .webApp("🚀 WebApp", WEBAPP_URL);
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(refResult, { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Tavsifnoma yozishda xatolik: ${err.message}`);
    }
  }

  // 6. BAYONNOMA / PROTOKOL
  if (/\b(?:bayonnoma|protokol)\b/i.test(lower)) {
    const waitMsg = await ctx.reply("📜 **Pedagogik kengash bayonnomasi tayyorlanmoqda...**");
    try {
      let protoResult = "";
      try {
        protoResult = await generateAIProtocolWithGemini(raw);
      } catch(e) {
        protoResult = generateAIPedagogicalProtocol(raw);
      }
      const kb = new InlineKeyboard()
        .text("📥 Bayonnomani Word (.docx) yuklash", "ai_gen_proto")
        .webApp("🚀 WebApp", WEBAPP_URL);
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(protoResult, { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Bayonnoma tuzishda xatolik: ${err.message}`);
    }
  }

  // 7. UNIVERSAL CHAT / PEDAGOGIK MASLAHAT VA ILMIY SAVOL-JAVOB
  const waitMsg = await ctx.reply("⏳ **EduAI (Google Gemini) o'ylamoqda va javob tayyorlamoqda...**");
  try {
    const answer = await callGemini(
      raw,
      "Siz O'zbekiston Respublikasi Maktabgacha va Maktab Ta'limi Vazirligi mezonlari bo'yicha eng yuqori toifali pedagogik ekspert, metodist va universal maslahatchisiz. Foydalanuvchining har qanday ta'limiy, metodik yoki fanga oid savoliga aniq, ilmiy asoslangan, tushunarli va chiroyli o'zbek tilida to'liq javob bering. Hech qanday LaTeX yoki dollar ($) belgisidan foydalanmang."
    );

    const actionKb = new InlineKeyboard()
      .text("🎨 Slayd (.pptx) qilish", "ai_gen_gamma")
      .text("📝 Dars konspekti (.docx)", "ai_gen_lesson")
      .row()
      .text("🎲 10 Talik Test (.docx)", "ai_gen_test")
      .webApp("🚀 WebApp-da Ko'rish", WEBAPP_URL);

    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return ctx.reply(answer, { reply_markup: actionKb });
  } catch(err) {
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return ctx.reply(`🤖 **EduAI Tahlili:**\n\n«${raw}» mavzusi bo'yicha materiallar tayyorlash uchun quyidagi tugmalardan birini tanlang:`, {
      reply_markup: new InlineKeyboard()
        .text("🎨 Slayd (.pptx)", "ai_gen_gamma")
        .text("📝 Dars konspekti (.docx)", "ai_gen_lesson")
        .row()
        .text("🎲 Test (.docx)", "ai_gen_test")
    });
  }
}

bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const role = getEffectiveRole(ctx);

  if (isSpamming(userId)) return;

  // =========================================================================
  // SLIDE WIZARD TEXT INPUT (Mavzu yoki muallif ismi kiritilganda)
  // =========================================================================
  if (slideWizardState.has(userId)) {
    const sw = slideWizardState.get(userId);
    if (sw.step === 'awaiting_topic') {
      sw.topic = text.trim();
      sw.step = 'awaiting_author';
      slideWizardState.set(userId, sw);
      return sendWizardAuthorStep(ctx, sw.topic);
    }
    if (sw.step === 'awaiting_author') {
      sw.authorName = text.trim();
      sw.step = 'awaiting_detail';
      slideWizardState.set(userId, sw);
      return sendWizardDetailStep(ctx, sw.topic, sw.authorName, false);
    }
  }

  // =========================================================================
  // /slayd BUYRUG'I VA MENYU TUGMALARI
  // =========================================================================
  if (text.startsWith('/slayd') || text.startsWith('/slide') || text.startsWith('/taqdimot') || text === '📊 Gamma AI Taqdimot' || text === '💻 Slayd Yasash') {
    const rawTopic = text.replace(/^\/(?:slayd|slide|taqdimot)\s*/i, '').trim();
    const topic = rawTopic && rawTopic !== '📊 Gamma AI Taqdimot' && rawTopic !== '💻 Slayd Yasash' 
      ? rawTopic 
      : (db.userSessions.get(userId) || '');
    return startSlideWizard(ctx, topic);
  }

  // =========================================================================
  // A) BARCHA /active BUYRUQLARI
  // =========================================================================
  const lowerText = text.toLowerCase();
  const isActivationCommand = 
    lowerText.startsWith('/active') || 
    lowerText.startsWith('/activate') || 
    lowerText.startsWith('/grant') ||
    (role === 'OWNER' || role === 'ADMIN') && /^(?:\d+|1)\s+(?:unlimited|vip|cheksiz|\d+)/i.test(text);

  if (isActivationCommand) {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      return ctx.reply("❌ Sizda foydalanuvchini faollashtirish huquqi yo'q!");
    }

    const cleaned = text.replace(/^\/(?:active|activate|grant)\s*/i, '').trim();
    const parts = cleaned.split(/\s+/);
    const targetIdRaw = parts[0];
    const durationRaw = parts.slice(1).join(' ').toLowerCase();

    if (!targetIdRaw) {
      return ctx.reply(
        `⚡ **FAOLASHTIRISH BUYRUG'I NAMOZISI:**\n\n` +
        `• \`/active 1 unlimited\` — Super Owner cheksiz\n` +
        `• \`/active ID unlimited\` — Cheksiz VIP\n` +
        `• \`/active ID 2h\` — 2 soatlik kirish\n` +
        `• \`/active ID 2time\` — 2 ta hujjat\n` +
        `• \`/active ID 1d\` — 1 kunlik\n` +
        `• \`/active ID 1m\` — 1 oylik\n\n` +
        `Yoki shunchaki \`/active ID\` deb yozing — **tayyor tugmalar** chiqadi!`,
        { parse_mode: 'Markdown' }
      );
    }

    const targetId = resolveUserId(targetIdRaw);

    if (!durationRaw) {
      return ctx.reply(
        `👇 **ID: \`${getDisplayUserId(targetId)}\` foydalanuvchisi uchun qanday muddat bermoqchisiz?**`,
        { parse_mode: 'Markdown', reply_markup: getOwnerActionKeyboard(targetId) }
      );
    }

    let planLabel = '';
    const user = db.users.get(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';

    if (durationRaw === 'unlimited' || durationRaw === 'vip' || durationRaw === 'cheksiz' || durationRaw === 'abadiy') {
      user.plan = 'unlimited';
      user.remainingUses = 999999;
      user.expiresAt = 'Cheksiz VIP';
      planLabel = '👑 Cheksiz VIP (Unlimited)';
    } else if (durationRaw.match(/^\d+\s*(?:h|soat|hour|hours)$/)) {
      const h = parseInt(durationRaw, 10) || 1;
      user.plan = `${h}h`;
      user.remainingUses = null;
      user.expiresAt = `${h} soat`;
      planLabel = `⏱ ${h} Soatlik Kirish`;
    } else if (durationRaw.match(/^\d+\s*(?:time|martalik|marta)$/) || /^\d+$/.test(durationRaw)) {
      const times = parseInt(durationRaw, 10) || 1;
      user.plan = `${times}time`;
      user.remainingUses = times;
      user.expiresAt = `${times} ta hujjat`;
      planLabel = `⚡ ${times} Martalik Hujjat`;
    } else if (durationRaw.match(/^\d+\s*(?:d|kun|day|days)$/)) {
      const d = parseInt(durationRaw, 10) || 1;
      user.plan = `${d}d`;
      user.remainingUses = null;
      user.expiresAt = `${d} kun`;
      planLabel = `📅 ${d} Kunlik`;
    } else if (durationRaw.match(/^\d+\s*(?:w|hafta|week|weeks)$/)) {
      const w = parseInt(durationRaw, 10) || 1;
      user.plan = `${w}w`;
      user.remainingUses = null;
      user.expiresAt = `${w * 7} kun`;
      planLabel = `🗓 ${w} Haftalik`;
    } else if (durationRaw.match(/^\d+\s*(?:m|oy|month|months)$/)) {
      const m = parseInt(durationRaw, 10) || 1;
      user.plan = `${m}m`;
      user.remainingUses = null;
      user.expiresAt = `${m * 30} kun`;
      planLabel = `⭐ ${m} Oylik Pro`;
    } else {
      return ctx.reply(
        `⚠️ **Noma'lum muddat kiritildi: "${durationRaw}"**\n` +
        `Iltimos, ID: \`${getDisplayUserId(targetId)}\` uchun pastdagi tayyor tugmalardan birini bosing:`,
        { parse_mode: 'Markdown', reply_markup: getOwnerActionKeyboard(targetId) }
      );
    }

    db.users.set(targetId, user);
    saveDatabase();

    const code = getAccessCodeForUser(targetId);

    await ctx.reply(
      `✅ **HISOB MUVOFAQIYATLI YOQILDI!**\n\n` +
      `👤 ID: \`${getDisplayUserId(targetId)}\` *(Telegram ID: ${targetId})*\n` +
      `💳 Tarif: **${planLabel}**\n` +
      `🔑 Saytga Kirish Kodi: \`${code}\`\n` +
      `Tasdiqlovchi: @${ctx.from?.username || 'admin'}`,
      { parse_mode: 'Markdown' }
    );

    try {
      const userReplyKb = getReplyKeyboardForRole('USER', true);
      await bot.api.sendMessage(
        targetId,
        `🎉 **HISOBINGIZ FOALLASHTIRILDI!**\n\n` +
        `Boshqaruvchi hisobingizni tasdiqladi. Sizga **${planLabel}** imkoniyati berildi!\n\n` +
        `🔑 **Saytga Kirish Kodingiz:** \`${code}\`\n` +
        `🌐 **Sayt manzili:** ${WEBAPP_URL}\n\n` +
        `Saytga kirib, ushbu kodni kiritsangiz barcha imkoniyatlar ochiladi!`,
        { 
          parse_mode: 'Markdown',
          reply_markup: userReplyKb 
        }
      );
    } catch (e) {}
    return;
  }

  // =========================================================================
  // B) SAYTGA KIRISH KODI (ACCESS CODE)
  // =========================================================================
  if (text === '🔑 Saytga Kirish Kodi' || text === '/code' || text === '/kod' || text === '/getcode') {
    if (isUserActive(userId, username)) {
      const code = getAccessCodeForUser(userId);
      const userObj = db.users.get(userId);
      const expiryText = userObj?.expiresAt || (userObj?.remainingUses ? `${userObj.remainingUses} ta hujjat` : 'Cheksiz');
      
      const openKb = new InlineKeyboard()
        .webApp("🚀 Telegram Mini App-da Ochish", WEBAPP_URL)
        .row()
        .url("🌐 To'liq Brauzerda Ochish", WEBAPP_URL);

      return ctx.reply(
        `🔑 **SIZNING SAYTGA KIRISH KODINGIZ:**\n\n` +
        `👉 \`${code}\` 👈 *(Nusxalash uchun ustiga bosing)*\n\n` +
        `⏳ **Amal qilish muddati:** ${expiryText}\n` +
        `🌐 **Sayt manzili:** ${WEBAPP_URL}\n\n` +
        `💡 **Qanday ishlatiladi?**\n` +
        `Saytga kirasiz va "Saytga Kirish Kodingiz bormi?" oynasiga ushbu kodni kiritasiz. Tizim bir zumda to'liq ochiladi!`,
        { parse_mode: 'Markdown', reply_markup: openKb }
      );
    } else {
      return ctx.reply(
        `🔒 **SIZDA FAOL OBUNA MAVJUD EMAS!**\n\n` +
        `Saytga kirish kodini olish uchun avval litsenziya sotib oling va boshqaruvchi (@${OWNER_USERNAME}) hisobingizni tasdiqlashi kerak.\n\n` +
        `👇 **Kerakli tarifni tanlang:**`,
        { parse_mode: 'Markdown', reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
  }

  // =========================================================================
  // C) EDUAI YORDAMCHI (BOTDA AI BILAN ISHLASH)
  // =========================================================================
  if (text === '🤖 EduAI Yordamchi' || text.startsWith('/ai')) {
    const aiPrompt = text.replace(/^\/ai\s*/i, '').replace('🤖 EduAI Yordamchi', '').trim();
    if (!aiPrompt) {
      return ctx.reply(
        `🤖 **EduAI Universal Pedagogik Yordamchi:**\n\n` +
        `Istalgan savolingiz yoki buyrug'ingizni yozing:\n\n` +
        `• \`8-sinf biologiya qon 10talik test\`\n` +
        `• \`Ona tili darsi uchun 45 daqiqalik konspekt rejasi\`\n` +
        `• \`Fotosintez jarayoni nima va qanday sodir bo'ladi?\`\n` +
        `• \`Amir Temur saltanati bo'yicha slayd tayyorlab ber\``,
        { parse_mode: 'Markdown' }
      );
    }
    return processIntelligentMessage(ctx, aiPrompt);
  }

  // =========================================================================
  // D) KLAVIATURA BOSHQARUV TUGMALARI
  // =========================================================================
  if (text === '📜 Faxriy Yorliq') {
    const buf = await generateOfficialOrderWordBuffer("Faxriy Yorliq va Sertifikat");
    return ctx.replyWithDocument(new InputFile(buf, "Faxriy_Yorliq_EduHujjat.docx"), {
      caption: "🏆 **QR-kodli namunaviy Faxriy Yorliq hujjati tayyor!** (.docx)"
    });
  }

  if (text === '📥 Bazani Yuklash (Excel)') {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'INSPECTOR') return ctx.reply("❌ Ruxsat yo'q!");
    const buf = generateUsersExcelBuffer();
    return ctx.replyWithDocument(new InputFile(buf, `EduHujjat_Foydalanuvchilar_Bazasi_${new Date().toLocaleDateString('uz-UZ')}.xlsx`), {
      caption: `📥 **Barcha foydalanuvchilar bazasi tayyor!** (${db.users.size} ta foydalanuvchi)`
    });
  }

  if (text === '🎭 Rejimni Almashtirish') {
    if (!isRealSuperOwner(ctx)) return ctx.reply("❌ Faqat Super Owner (@" + OWNER_USERNAME + ") uchun!");
    return ctx.reply(
      `🎭 **Qaysi rejimga o'tishni tanlang:**\n\n` +
      `1. 👑 **Super Owner** — Cheksiz boshqaruv, adminlar, narxlar va barcha buyruqlar.\n` +
      `2. 🛡️ **Administrator** — Foydalanuvchilarni faollashtirish va monitoring.\n` +
      `3. 🔍 **Tekshiruvchi (Auditor)** — Hisobotlar va ma'lumotlar bazasi eksporti.\n` +
      `4. 👤 **Oddiy Foydalanuvchi** — Yopiq paywall oynasi va xaridni sinash.`,
      { reply_markup: getRoleSwitchKeyboard() }
    );
  }

  if (text === '🎭 Rejimni Qaytarish (Owner)') {
    if (isRealSuperOwner(ctx)) {
      db.simulatedRoles.delete(userId);
      saveDatabase();
      return ctx.reply(`👑 **Asosiy Super Owner rejimiga qaytdingiz!**`, { reply_markup: getReplyKeyboardForRole('OWNER') });
    }
  }

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
      (role === 'OWNER' ? `*(Owner narxlarni \`/setprice <tarif> <narx>\` orqali o'zgartira oladi)*` : ``),
      { parse_mode: 'Markdown' }
    );
  }

  if (text.startsWith('/setprice ') && role === 'OWNER') {
    const parts = text.split(/\s+/);
    if (parts.length === 3) {
      const planName = parts[1];
      const newPrice = parseInt(parts[2], 10);
      if (newPrice > 0 && db.prices[planName] !== undefined) {
        db.prices[planName] = newPrice;
        saveDatabase();
        return ctx.reply(`✅ **${planName}** narxi \`${newPrice.toLocaleString()} so'm\` ga o'zgartirildi!`, { parse_mode: 'Markdown' });
      }
    }
    return ctx.reply("❌ Namuna: `/setprice oneTime 3000` yoki `/setprice monthly 80000`", { parse_mode: 'Markdown' });
  }

  if (text === '📢 Ommaviy Xabar' && role === 'OWNER') {
    return ctx.reply(
      `📢 **Ommaviy xabar yuborish uchun quyidagicha yozing:**\n\n` +
      `\`/broadcast Hurmatli foydalanuvchilar, tizimga yangi EduAI funksiyalari qo'shildi!\``,
      { parse_mode: 'Markdown' }
    );
  }

  if (text.startsWith('/broadcast ') && role === 'OWNER') {
    const broadcastText = text.replace('/broadcast ', '').trim();
    let sentCount = 0;
    for (const uId of db.users.keys()) {
      try {
        await bot.api.sendMessage(uId, `📢 **DIQQAT E'LON!**\n\n${broadcastText}`, { parse_mode: 'Markdown' });
        sentCount++;
      } catch (e) {}
    }
    return ctx.reply(`✅ Xabar **${sentCount} ta** foydalanuvchiga muvaffaqiyatli yetkazildi!`);
  }

  if (text === '👥 Foydalanuvchilar') {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'INSPECTOR') return ctx.reply("❌ Ruxsat yo'q!");
    const usersList = Array.from(db.users.values());
    let msg = `👥 **FOYDALANUVCHILAR RO'YXATI (${usersList.length} ta):**\n\n`;
    usersList.slice(0, 15).forEach((u, i) => {
      const statusIcon = u.status === 'ACTIVE' ? '✅' : (u.status === 'BLOCKED' ? '❌' : '⏳');
      msg += `${i + 1}. ${statusIcon} ${u.name} (ID: \`${u.id}\`) - ${u.plan || 'none'}\n`;
    });
    msg += `\n📥 *Barcha ro'yxatni Excelda yuklash uchun pastdagi "Bazani Yuklash (Excel)" tugmasini bosing.*`;
    return ctx.reply(msg, { parse_mode: 'Markdown' });
  }

  if (text === '🛡 Adminlar') {
    if (role !== 'OWNER') return ctx.reply("❌ Faqat Super Owner uchun!");
    const adminList = Array.from(db.admins).map(a => `@${a}`).join(', ');
    return ctx.reply(
      `🛡️ **ADMINLAR RO'YXATI:**\n\n${adminList}\n\n` +
      `➕ **Qo'shish:** \`/addadmin username\`\n` +
      `➖ **O'chirish:** \`/deladmin username\``,
      { parse_mode: 'Markdown' }
    );
  }

  if (text.startsWith('/addadmin ') && role === 'OWNER') {
    const newAdmin = text.replace('/addadmin ', '').trim().replace('@', '').toLowerCase();
    db.admins.add(newAdmin);
    saveDatabase();
    return ctx.reply(`✅ @${newAdmin} admin etib tayinlandi!`);
  }

  if (text.startsWith('/deladmin ') && role === 'OWNER') {
    const delAdmin = text.replace('/deladmin ', '').trim().replace('@', '').toLowerCase();
    db.admins.delete(delAdmin);
    saveDatabase();
    return ctx.reply(`❌ @${delAdmin} adminlikdan chiqarildi!`);
  }

  if (text === '📊 Statistika' || text === '📊 Tizim Statistikasi') {
    return ctx.reply(
      `📊 **EDUKATSIYA TIZIMI STATISTIKASI:**\n\n` +
      `• Super Owner ID: \`1\` (@${OWNER_USERNAME})\n` +
      `• Jami foydalanuvchilar: ${db.users.size}\n` +
      `• Faol hisoblar: ${Array.from(db.users.values()).filter(u => u.status === 'ACTIVE').length}\n` +
      `• Kutishdagilar (Pending): ${Array.from(db.users.values()).filter(u => u.status === 'PENDING').length}\n` +
      `• Adminlar soni: ${db.admins.size}\n` +
      `• Doimiy Baza: \`data/database.json\` (Faol)\n` +
      `• WebApp: ${WEBAPP_URL}`,
      { parse_mode: 'Markdown' }
    );
  }

  if (text === '🌐 WebApp Ochish' || text === '🌐 Mini App-ni Ochish') {
    const code = getAccessCodeForUser(userId);
    const webappInline = new InlineKeyboard()
      .webApp("🚀 Telegram Mini App-da Ochish", WEBAPP_URL)
      .row()
      .url("🌐 To'liq Brauzerda Ochish", WEBAPP_URL);

    return ctx.reply(
      `🌐 **"EduHujjat AI" Web Platformasi:**\n\n` +
      (isUserActive(userId, username) ? `🔑 **Sizning Saytga Kirish Kodingiz:** \`${code}\`\n\n` : `🔒 *Eslatma: Saytga kirish uchun faol litsenziya kodi talab qilinadi.*\n\n`) +
      `Quyidagi tugmalardan birini tanlang:`,
      { parse_mode: 'Markdown', reply_markup: webappInline }
    );
  }

  if (text === '💳 Litsenziya Sotib Olish' || text === '💳 Muddatni Uzaytirish') {
    return ctx.reply(`👇 **Tarifni tanlang:**`, { reply_markup: getTariffInlineKeyboard(userId) });
  }

  if (text === "📄 Demo Ma'lumot") {
    const demo = 
      "1. karimova dildora baxtiyor qizi 14.05.2008 +998901234567 10-A\n" +
      "2. abdullayev jasur botir o'g'li 02.11.2007 +998939876543 10-A\n" +
      "3. omonov sardor qobilovich 25.01.2008 +998971112233 10-A\n" +
      "4. toshmatova rayhon alisher qizi 30.08.2008 +998994445566 10-A\n" +
      "5. yusupov bobur anvarovich 18.09.2007 +998912223344 10-A";
    db.userSessions.set(userId, demo);
    return ctx.reply(
      `📋 **Demo ro'yxat kiritildi (5 nafar o'quvchi):**\n\n\`${demo}\`\n\nQuyidagi amallardan birini tanlang:`,
      { parse_mode: 'Markdown', reply_markup: getActionInlineKeyboard() }
    );
  }

  if (text === 'ℹ️ Mening Hisobim') {
    const u = db.users.get(userId);
    const displayId = getDisplayUserId(userId);
    const code = getAccessCodeForUser(userId);
    return ctx.reply(
      `👤 **HISOBINGIZ MA'LUMOTLARI:**\n\n` +
      `• ID: \`${displayId}\`\n` +
      `• Holati: **${u?.status || 'Noma\'lum'}**\n` +
      `• Tarif: **${u?.plan || 'none'}**\n` +
      `• Kirish Kodi: \`${code}\`\n` +
      `• Qolgan imkoniyat: ${u?.remainingUses ? `${u.remainingUses} ta hujjat` : (u?.expiresAt || 'Cheksiz')}\n` +
      `• Ro'yxatdan o'tgan: ${u?.registeredAt || '-'}`,
      { parse_mode: 'Markdown' }
    );
  }

  // =========================================================================
  // E) AGAR ODDIY FOYDALANUVCHI VA RUXSATI YO'Q BO'LSA
  // =========================================================================
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Hisobingiz hali tasdiqlanmagan.**\n\n` +
      `Sizning Telegram ID: \`${userId}\`\n\n` +
      `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }

  // =========================================================================
  // F) RUXSAT BERILGAN FOYDALANUVCHI MATN YUBORGANDA (INTELLIGENT AI ROUTER)
  // =========================================================================
  db.userSessions.set(userId, text);

  const currentUserObj = db.users.get(userId);
  if (currentUserObj && typeof currentUserObj.remainingUses === 'number') {
    currentUserObj.remainingUses -= 1;
    saveDatabase();
  }

  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const students = parseStudentsFromText(text);

  // Haqiqiy o'quvchilar ro'yxati ekanligini tekshirish mezonlari:
  const hasRealStudentData = students.length >= 2 && students.some(s => 
    s.birthDate !== '-' || s.phone !== '-' || s.className !== '10-A' || /ov\b|ova\b|yev\b|yeva\b|qizi\b|o'g'li\b/i.test(s.fullName)
  );
  const isNumberedList = rawLines.length >= 3 && rawLines.filter(l => /^\d+[\.\)\-]/i.test(l)).length >= 2;
  const isStudentList = hasRealStudentData || isNumberedList;

  if (isStudentList) {
    return ctx.reply(
      `📊 **O'quvchilar ro'yxati qabul qilindi!** (${students.length} nafar o'quvchi aniqlandi)\n\n` +
      `Quyidagi amallardan birini tanlang (faylni 3 soniyada tayyorlab beradi):`,
      { reply_markup: getActionInlineKeyboard() }
    );
  } else {
    // Foydalanuvchi yozgan istalgan ta'limiy xabar / savol / buyruqni AI orqali to'g'ridan-to'g'ri tushunish
    return processIntelligentMessage(ctx, text.trim());
  }
});

// Telegram pastki chap burchagidagi "🌐 WebApp" tugmasini o'rnatish
async function setupTelegramChatMenu() {
  try {
    await bot.api.setChatMenuButton({
      menu_button: {
        type: 'web_app',
        text: '🌐 WebApp',
        web_app: { url: WEBAPP_URL }
      }
    });
    console.log("Chat Menu Button (pastki chapdagi WebApp tugmasi) o'rnatildi!");
  } catch (e) {
    console.log("Menu button sozlash:", e.message);
  }
}

// =========================================================================
// 10. LOCAL DEVICE AUTH HTTP API (PORT 3001)
// =========================================================================
const apiServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const host = req.headers.host || 'localhost:3001';
  const url = new URL(req.url, `http://${host}`);

  if (url.pathname === '/api/device-auth' && req.method === 'GET') {
    const reqId = url.searchParams.get('reqId');
    const code = url.searchParams.get('code');
    const deviceId = url.searchParams.get('deviceId');

    db.deviceAuthorizations = db.deviceAuthorizations || {};
    db.deviceBindings = db.deviceBindings || {};

    if (code && deviceId) {
      const bound = db.deviceBindings[code];
      if (!bound) {
        return res.end(JSON.stringify({ valid: true, boundDevice: deviceId }));
      }
      return res.end(JSON.stringify({ valid: bound === deviceId, boundDevice: bound }));
    }

    if (reqId) {
      const auth = db.deviceAuthorizations[reqId];
      return res.end(JSON.stringify({ status: auth?.status || 'PENDING' }));
    }
    return res.end(JSON.stringify({ ok: true }));
  }

  if (url.pathname === '/api/device-auth' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const { action, reqId, code, deviceId, pin } = body;
        db.deviceAuthorizations = db.deviceAuthorizations || {};
        db.deviceBindings = db.deviceBindings || {};

        if (action === 'request_login') {
          db.deviceAuthorizations[reqId] = { reqId, code, deviceId, pin, status: 'PENDING' };
          saveDatabase();
          return res.end(JSON.stringify({ success: true, reqId }));
        }

        if (action === 'bind_device') {
          db.deviceBindings[code] = deviceId;
          saveDatabase();
          return res.end(JSON.stringify({ success: true, bound: true }));
        }

        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }


  if (url.pathname === '/api/gemini' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const { type, prompt, count } = body;
        if (!prompt) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Prompt talab qilinadi' }));
        }

        let result = '';
        if (type === 'test') {
          result = await generateAITestWithGemini(prompt, count || 10);
        } else if (type === 'lesson') {
          result = await generateAILessonPlanWithGemini(prompt);
        } else if (type === 'order') {
          result = await generateAIOfficialOrderWithGemini(prompt);
        } else if (type === 'protocol') {
          result = await generateAIProtocolWithGemini(prompt);
        } else if (type === 'reference') {
          result = await generateAIStudentReferenceWithGemini(prompt);
        } else if (type === 'cards') {
          result = await generateAIGammaCardsWithGemini(prompt, {
            authorName: body.authorName,
            detailLevel: body.detailLevel,
            includeImages: body.includeImages !== false
          });
        } else {
          result = await callGemini(
            prompt,
            "Siz O'zbekiston Respublikasi Maktabgacha va Maktab Ta'limi Vazirligi mezonlari bo'yicha eng yuqori toifali pedagogik ekspert va metodistsiz. Har qanday ta'limiy, metodik savollarga to'liq, ilmiy va tushunarli o'zbek tilida javob bering."
          );
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, result }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Render & Cloud Health Check
  if (url.pathname === '/' || url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ 
      status: 'ok', 
      service: 'EduHujjat Ultra Bot & Gemini API', 
      time: new Date().toISOString() 
    }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ notFound: true }));
});

const API_PORT = process.env.PORT || process.env.API_PORT || 3001;
apiServer.listen(API_PORT, () => {
  console.log(`🌐 Local Device Auth HTTP API running on port ${API_PORT}`);
});

async function startBotWithRetry() {
  while (true) {
    try {
      console.log("EduHujjat Ultra Standalone Bot Server ishga tushdi...");
      try { await setupTelegramChatMenu(); } catch (e) {}
      await bot.start({
        drop_pending_updates: true,
        onStart: (botInfo) => {
          console.log(`🤖 Bot @${botInfo.username} muvaffaqiyatli ishga tushdi va xabarlarni qabul qilmoqda!`);
        }
      });
    } catch (err) {
      console.error("Bot polling error:", err.message);
      if (err.message?.includes('409') || err.message?.includes('Conflict')) {
        console.log("Telegram 409 Conflict aniqlandi. 5 soniya kutilmoqda va avtomatik qayta ulanmoqda...");
        await new Promise(r => setTimeout(r, 5000));
      } else {
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
}
startBotWithRetry();
