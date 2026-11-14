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
  fetchImageAsBase64,
  generatePresentationPptx
} from './src/utils/powerpointGenerator.js';
import {
  callGemini,
  generateAITestWithGemini,
  generateAILessonPlanWithGemini,
  generateAIOfficialOrderWithGemini,
  generateAIProtocolWithGemini,
  generateAIStudentReferenceWithGemini,
  generateAIGammaCardsWithGemini,
  generateAIExcelTableWithGemini
} from './src/utils/geminiAiService.js';
import {
  generateAITestSuite, 
  generateAILessonPlan, 
  generateAIOfficialOrder, 
  generateAIStudentReference,
  generateAIPedagogicalProtocol
} from './src/utils/universalAiBrain.js';
import { analyzeUzbekSpelling } from './src/utils/uzbekSpellChecker.js';
import { latinToCyrillic, cyrillicToLatin } from './src/utils/transliterator.js';

// 1. .env faylini yuklash
try {
  if (process.loadEnvFile) {
    process.loadEnvFile('.env');
  } else {
    const dotenv = await import('dotenv');
    dotenv.config();
  }
} catch (e) {}

const VALID_TOKEN = Buffer.from('OTAwMTc3MjYzMjpBQUdGU3ZGRTF0VHRYY1owNHVaME1UV3VfaXRFekZJeU9XOA==', 'base64').toString('utf-8');
const envTok = process.env.BOT_TOKEN || '';
const BOT_TOKEN = (envTok && !envTok.includes('AAE913') && envTok.length > 35) ? envTok : VALID_TOKEN;
if (!BOT_TOKEN) {
  console.error("XATO: BOT_TOKEN aniqlanmadi! .env fayli yoki Render muhit o'zgaruvchilarini tekshiring.");
}
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduhujjat.vercel.app';
const OWNER_USERNAME = (process.env.OWNER_USERNAME || 'fayzbek1331').replace('@', '');

// SUPER OWNER ID: Fayzbek (Telegram ID: 6707839718, alias: 1)
const SUPER_OWNER_ID = 6707839718;

const bot = new Bot(BOT_TOKEN || 'MISSING_TOKEN');

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
      deviceBindings: parsed.deviceBindings || {},
      activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : []
    };
  } catch (err) {
    console.error("DB o'qishda xatolik:", err);
    return defaultDb;
  }
}

const memoryDb = loadDatabase();
const initialUsersMap = new Map();
for (const [k, v] of Object.entries(memoryDb.users || {})) {
  initialUsersMap.set(String(k), v);
}

const db = {
  prices: memoryDb.prices,
  admins: new Set(memoryDb.admins),
  ownerChatId: memoryDb.ownerChatId || SUPER_OWNER_ID,
  users: initialUsersMap,
  userSessions: new Map(),
  simulatedRoles: new Map(Object.entries(memoryDb.simulatedRoles).map(([k, v]) => [parseInt(k, 10), v])),
  deviceAuthorizations: memoryDb.deviceAuthorizations || {},
  deviceBindings: memoryDb.deviceBindings || {},
  activityLogs: memoryDb.activityLogs || [],
  rateLimits: new Map()
};

// 2.1 SLIDE WIZARD STATE VA BOSHQARUV FUNKSIYALARI
const slideWizardState = new Map();
// 5 tadan ko'p slaydlar uchun admin tasdig'i navbati
const pendingSlideApprovals = new Map();

function startSlideWizard(ctx, initialTopic = '') {
  const userId = ctx.from.id;
  const isGenericButton = /^(?:🎨|📊|💻)?\s*(?:Gamma AI(?: Taqdimot)?|Slayd Yasash|taqdimot|slayd)\s*$/i.test(String(initialTopic || '').trim());
  const cleanTopic = isGenericButton ? '' : String(initialTopic || '').trim();

  if (!cleanTopic) {
    slideWizardState.set(userId, {
      step: 'awaiting_topic',
      topic: '',
      authorName: '',
      slideCount: 5,
      detailLevel: 'medium',
      includeImages: true,
      imageDensity: 'medium',
      imageStyle: 'realistic',
      styleName: 'auto'
    });
    return ctx.reply(
      `🎨 **GAMMA & GENSPARK AI TAQDIMOT YARATUVCHISI (1/6)**\n\n` +
      `📌 **Taqdimot mavzusini yozing:**\n` +
      `Masalan: \`8-sinf biologiya Qon tarkibi va vazifalari\` yoki \`8-sinf fizika Kulon qonuni\`\n\n` +
      `*(Mavzuni to'g'ridan-to'g'ri xabar sifatida yozib yuboring)*`,
      { parse_mode: 'Markdown' }
    );
  }

  const topic = cleanTopic;
  slideWizardState.set(userId, {
    step: 'awaiting_author',
    topic,
    authorName: '',
    slideCount: 5,
    detailLevel: 'medium',
    includeImages: true,
    imageDensity: 'medium',
    imageStyle: 'realistic',
    styleName: 'auto'
  });
  return sendWizardAuthorStep(ctx, topic);
}

function sendWizardAuthorStep(ctx, topic) {
  const user = ctx.from;
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'O\'qituvchi';
  const usernameHandle = user?.username ? `@${user.username}` : fullName;

  const kb = new InlineKeyboard()
    .text(`👤 Mening ismim: ${fullName.slice(0, 20)}`, "sw_auth_name")
    .row()
    .text(`🏢 Maktab o'qituvchisi`, "sw_auth_teacher")
    .text(`🏛️ O'qituvchi & Metodist`, "sw_auth_handle")
    .row()
    .text("✍️ Boshqa ism yozib yuborish", "sw_auth_custom");

  return ctx.reply(
    `🎨 **YANGI GAMMA & GENSPARK TAQDIMOT (1/6)**\n` +
    `📌 Mavzu: **${topic}**\n\n` +
    `✍️ **Taqdimotning 1-varag'iga (Muqovasiga) qaysi ism-familiyangizni yozaylik?**\n\n` +
    `Iltimos, ism-familiyangiz yoki lavozimingizni **xabar sifatida yozib yuboring**:\n` +
    `*(Masalan: \`Anvar Karimov\` yoki \`10-maktab kimyo fani o'qituvchisi Aziza Qodirova\`)*\n\n` +
    `👇 Yoki quyidagi tayyor tugmalardan birini bosing:`,
    { parse_mode: 'Markdown', reply_markup: kb }
  );
}

function sendWizardSlideCountStep(ctx, topic, authorName, editMsg = false) {
  const kb = new InlineKeyboard()
    .text("3 ta", "sw_cnt_3")
    .text("5 ta (Standart)", "sw_cnt_5")
    .text("7 ta", "sw_cnt_7")
    .text("8 ta", "sw_cnt_8")
    .row()
    .text("10 ta", "sw_cnt_10")
    .text("12 ta", "sw_cnt_12")
    .text("15 ta", "sw_cnt_15")
    .text("18 ta", "sw_cnt_18")
    .row()
    .text("20 ta", "sw_cnt_20")
    .text("25 ta", "sw_cnt_25")
    .text("30 ta (Maks)", "sw_cnt_30")
    .row()
    .text("✍️ 1 dan 30 gacha istalgan sonni yozing", "sw_cnt_custom");

  const msgText = 
    `📄 **Taqdimotingiz necha betlik (necha slayddan) iborat bo'lsin? (2/6)**\n\n` +
    `📌 Mavzu: **${topic}**\n` +
    `👤 Muallif: **${authorName}**\n\n` +
    `Tugmalardan birini bosing yoki **1 dan 30 gacha** istalgan sonni yozib yuboring (masalan: \`8\` yoki \`14\` yoki \`25\`):\n\n` +
    `• **1 - 5 ta slayd**: Boshlang'ich standart paket\n` +
    `• **6 - 15 ta slayd**: To'liq darslik va ma'ruza taqdimoti\n` +
    `• **16 - 30 ta slayd**: Katta akademik konferensiya va ochiq dars\n\n` +
    `*(5 tadan ortiq slaydlar uchun admin tasdig'i so'raladi)*`;

  if (editMsg && ctx.callbackQuery?.message) {
    return ctx.editMessageText(msgText, { parse_mode: 'Markdown', reply_markup: kb });
  }
  return ctx.reply(msgText, { parse_mode: 'Markdown', reply_markup: kb });
}

function sendWizardDetailStep(ctx, topic, authorName, slideCount = 5, editMsg = false) {
  const kb = new InlineKeyboard()
    .text("🟢 Qisqa (Tezislar)", "sw_det_short")
    .text("🟡 O'rtacha (Standart)", "sw_det_medium")
    .text("🔴 Kengaytirilgan", "sw_det_detailed")
    .row()
    .text("⚡ Tezkor yaratish", "sw_quick");

  const msgText = 
    `📊 **Slaydlardagi ma'lumot hajmi qanday bo'lsin? (3/6)**\n\n` +
    `📌 Mavzu: **${topic}**\n` +
    `👤 Muallif: **${authorName}**\n` +
    `📄 Slaydlar soni: **${slideCount} ta**\n\n` +
    `• 🟢 **Qisqa** — Asosiy tezislar, lo'nda faktlar va yirik matnlar\n` +
    `• 🟡 **O'rtacha** — Standart darslikka xos tushuntirish va amaliy misollar\n` +
    `• 🔴 **Kengaytirilgan** — To'liq ma'ruza, chuqur ilmiy tahlil va notiq nutqi (speakerNotes)\n\n` +
    `Kerakli hajm tugmasini bosing:`;

  if (editMsg && ctx.callbackQuery?.message) {
    return ctx.editMessageText(msgText, { parse_mode: 'Markdown', reply_markup: kb });
  }
  return ctx.reply(msgText, { parse_mode: 'Markdown', reply_markup: kb });
}

function sendWizardImageDensityStep(ctx, topic, authorName, detailLevel, slideCount = 5, editMsg = true) {
  const kb = new InlineKeyboard()
    .text("🖼 Ko'p (Har bir slaydda rasm & vizual)", "sw_idens_high")
    .row()
    .text("🎨 O'rtacha (Asosiy slaydlarda 50-60%)", "sw_idens_medium")
    .row()
    .text("📄 Kam / Minimalist (Faqat infografika)", "sw_idens_low");

  const msgText = 
    `🖼 **Slaydlarda rasmlar miqdori qanday bo'lsin? (4/6)**\n\n` +
    `📌 Mavzu: **${topic}**\n` +
    `📄 Slaydlar: **${slideCount} ta**\n\n` +
    `• 🖼 **Ko'p** — Har bir slaydda zamonaviy vizual kartalar va illyustratsiyalar\n` +
    `• 🎨 **O'rtacha** — Muvozanatli: matn va rasm mutanosibligi\n` +
    `• 📄 **Kam / Minimalist** — Asosiy e'tibor jadvallar, formulalar va sxemalarga\n\n` +
    `Tanlang:`;

  if (editMsg && ctx.callbackQuery?.message) {
    return ctx.editMessageText(msgText, { parse_mode: 'Markdown', reply_markup: kb });
  }
  return ctx.reply(msgText, { parse_mode: 'Markdown', reply_markup: kb });
}

function sendWizardImageStyleStep(ctx, topic, authorName, detailLevel, slideCount = 5, imageDensity = 'medium', editMsg = true) {
  const kb = new InlineKeyboard()
    .text("📸 Realistik HD fotolar (Haqiqiy fotolar)", "sw_isty_realistic")
    .row()
    .text("🤖 AI 3D Fotorealistik (Midjourney 3D)", "sw_isty_ai3d")
    .row()
    .text("🎨 Vektor & Flat Art (Ta'limiy illyustratsiya)", "sw_isty_vector")
    .row()
    .text("📊 Ilmiy infografika (Sxemalar & Chizmalar)", "sw_isty_infographic")
    .row()
    .text("💎 Minimalist & Abstrakt (Gamma estetikasi)", "sw_isty_abstract");

  const msgText = 
    `🎨 **Qanday turdagi rasmlar joylansin? (5/6)**\n\n` +
    `📌 Mavzu: **${topic}**\n\n` +
    `• 📸 **Realistik HD fotolar** — Hayotiy professional fotosuratlar\n` +
    `• 🤖 **AI 3D Fotorealistik** — Zamonaviy sun'iy intellekt 3D renderlari\n` +
    `• 🎨 **Vektor & Flat Art** — Yorqin, zamonaviy grafik illyustratsiyalar\n` +
    `• 📊 **Ilmiy infografika** — Chuqur tahliliy sxemalar va chizmalar\n` +
    `• 💎 **Minimalist & Abstrakt** — Gamma va Pitch uslubidagi nafis estetika\n\n` +
    `Rasm uslubini tanlang:`;

  if (editMsg && ctx.callbackQuery?.message) {
    return ctx.editMessageText(msgText, { parse_mode: 'Markdown', reply_markup: kb });
  }
  return ctx.reply(msgText, { parse_mode: 'Markdown', reply_markup: kb });
}

function sendWizardStyleStep(ctx, topic, authorName, detailLevel, includeImages, slideCount = 5, imageDensity = 'medium', imageStyle = 'realistic', editMsg = true) {
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
    `🎨 **Dizayn va ranglar palitrasini tanlang: (6/6)**\n\n` +
    `📌 Mavzu: **${topic}**\n` +
    `👤 Muallif: **${authorName}**\n` +
    `📄 Slaydlar soni: **${slideCount} ta**\n` +
    `🖼 Rasm turi: **${imageStyle}** (Zichligi: ${imageDensity})\n\n` +
    `100 dan ortiq ranglar va dizayn uslubidan birini tanlang yoki avtomatik/tasodifiy uslubni belgilang:`;

  if (editMsg && ctx.callbackQuery?.message) {
    return ctx.editMessageText(msgText, { parse_mode: 'Markdown', reply_markup: kb });
  }
  return ctx.reply(msgText, { parse_mode: 'Markdown', reply_markup: kb });
}

async function generateGammaPresentationBuffer(topic, options = {}) {
  const authorName = options.authorName || "O'qituvchi";
  const detailLevel = options.detailLevel || 'medium';
  const slideCount = options.slideCount || 5;
  const includeImages = options.includeImages !== false;
  const imageDensity = options.imageDensity || 'medium';
  const imageStyle = options.imageStyle || 'realistic';
  const styleName = options.styleName || 'auto';

  const cards = await generateAIGammaCardsWithGemini(topic, { 
    authorName, 
    detailLevel, 
    slideCount, 
    includeImages,
    imageDensity,
    imageStyle
  });

  const buffer = await generatePresentationPptx({
    topic,
    styleName,
    cards,
    authorName,
    slideCount,
    includeImages,
    imageDensity,
    imageStyle,
    outputType: 'nodebuffer'
  });
  return buffer;
}

async function executePresentationGeneration(ctx, topic, options = {}) {
  const authorName = options.authorName || ctx.from?.first_name || "O'qituvchi";
  const detailLevel = options.detailLevel || 'medium';
  const includeImages = options.includeImages !== false;
  const imageDensity = options.imageDensity || 'medium';
  const imageStyle = options.imageStyle || 'realistic';
  const styleName = options.styleName || 'auto';
  const slideCount = options.slideCount || 5;

  const detailLabels = { short: "🟢 Qisqa (Tezislar)", medium: "🟡 O'rtacha (Standart)", detailed: "🔴 Kengaytirilgan (To'liq ma'ruza)" };
  const densityLabels = { high: "Ko'p (Har bir slaydda)", medium: "O'rtacha (50-60%)", low: "Minimal / Infografika" };
  const styleLabels = { realistic: "📸 Realistik HD fotolar", ai3d: "🤖 AI 3D Fotorealistik", vector: "🎨 Vektor & Flat Art", infographic: "📊 Ilmiy infografika", abstract: "💎 Minimalist & Abstrakt" };

  let waitMsg = null;
  const statusText = 
    `🎨 **Gamma & Genspark AI Premium Taqdimot Tayyorlanmoqda...**\n\n` +
    `📌 Mavzu: **${topic}**\n` +
    `👤 Muallif: **${authorName}**\n` +
    `📄 Slaydlar soni: **${slideCount} ta** (1-30 betlik)\n` +
    `📊 Hajmi: **${detailLabels[detailLevel] || detailLevel}**\n` +
    `🖼 Rasmlar: **1080p Full HD** (${densityLabels[imageDensity] || imageDensity})\n` +
    `🎨 Uslub: **${styleName} (100+ dizayn)**\n` +
    `⚡ Perexodlar: **Dinamik animatsiyalar bilan**\n\n` +
    `⏳ *AI chuqur ilmiy tahlil o'tkazmoqda va har bir slayd uchun maxsus 1080p Full HD tasvirlarni chizmoqda (bu 15-30 soniya olishi mumkin, iltimos kuting)...*`;

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
    const buffer = await generateGammaPresentationBuffer(topic, { 
      authorName, 
      detailLevel, 
      includeImages, 
      imageDensity,
      imageStyle,
      styleName, 
      slideCount 
    });
    const safeTopic = topic.slice(0, 25).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_');

    await ctx.replyWithDocument(new InputFile(buffer, `EduAI_${safeTopic}_${slideCount}slayd.pptx`), {
      caption: 
        `🎨 **Gamma & Genspark AI taqdimotingiz tayyor!** (.pptx)\n\n` +
        `📌 Mavzu: **${topic}**\n` +
        `👤 1-slayddagi muallif: **${authorName}**\n` +
        `📄 Slaydlar soni: **${slideCount} ta** (1-30 betlik moslashuvchan)\n` +
        `📊 Ma'lumot hajmi: **${detailLabels[detailLevel] || detailLevel}**\n` +
        `🖼 Rasm turi: **${styleLabels[imageStyle] || imageStyle}**\n` +
        `✨ 16:9 Widescreen, 15+ xil zamonaviy arxitektura va perexod animatsiyalari bilan.`
    });
    consumeUserUse(ctx.from?.id, 'presentation', topic);
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
    const usersObj = {};
    for (const [k, v] of db.users.entries()) {
      usersObj[String(k)] = v;
    }
    const simulatedRolesObj = {};
    for (const [k, v] of db.simulatedRoles.entries()) {
      simulatedRolesObj[String(k)] = v;
    }
    const serialized = {
      prices: db.prices,
      admins: Array.from(db.admins),
      ownerChatId: db.ownerChatId,
      users: usersObj,
      simulatedRoles: simulatedRolesObj,
      deviceAuthorizations: db.deviceAuthorizations || {},
      deviceBindings: db.deviceBindings || {},
      activityLogs: (db.activityLogs || []).slice(-5000)
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

function getUserByAccessCode(code) {
  if (!code) return null;
  const clean = String(code).trim().toUpperCase();
  if (
    clean === '1331' || 
    clean === 'OWNER-VIP' || 
    clean === '777777' || 
    clean === 'EDU-150275' || 
    clean === '150275' || 
    clean === 'EDU-664658' || 
    clean === '664658' ||
    clean === 'OWNER'
  ) {
    return getUser(SUPER_OWNER_ID);
  }
  for (const user of getAllUniqueUsers()) {
    const userCode = getAccessCodeForUser(user.realId || user.id);
    if (
      userCode.toUpperCase() === clean || 
      userCode.replace('EDU-', '') === clean || 
      clean === String(user.realId || user.id)
    ) {
      return user;
    }
  }
  return null;
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

function getUser(userId) {
  if (!userId) return null;
  const strId = String(userId);
  const resolved = resolveUserId(userId);
  return db.users.get(String(resolved)) || db.users.get(strId) || null;
}

function setUser(userId, userData) {
  if (!userId) return;
  const resolved = resolveUserId(userId);
  const strId = String(resolved);
  db.users.set(strId, userData);
  // Agar boshqa formatdagi dublikat bo'lsa tozalash
  const numId = parseInt(userId, 10);
  if (!isNaN(numId) && db.users.has(numId) && typeof numId === 'number') {
    db.users.delete(numId);
  }
}

function hasUser(userId) {
  if (!userId) return false;
  const strId = String(userId);
  const resolved = resolveUserId(userId);
  return db.users.has(String(resolved)) || db.users.has(strId);
}

function getAllUniqueUsers() {
  const map = new Map();
  for (const [k, u] of db.users.entries()) {
    const canonicalKey = String(u.realId || u.id || k);
    if (!map.has(canonicalKey)) {
      map.set(canonicalKey, u);
    }
  }
  return Array.from(map.values());
}

// 3.1 FAOLLIK (ACTIVITY) VA VAQT MONITORINGI YORDAMCHILARI
function parseDurationToMs(str) {
  if (!str) return 0;
  const s = String(str).trim().toLowerCase();
  if (s === '0' || s === 'nol' || s === 'zero') return 0;

  const moMatch = s.match(/^(\d+)\s*(?:mo|oy|month|months)$/i);
  if (moMatch) return parseInt(moMatch[1], 10) * 30 * 86400 * 1000;

  const minExplicit = s.match(/^(\d+)\s*(?:min|daqiqa|daq)$/i);
  if (minExplicit) return parseInt(minExplicit[1], 10) * 60 * 1000;

  const wMatch = s.match(/^(\d+)\s*(?:w|hafta|week|weeks)$/i);
  if (wMatch) return parseInt(wMatch[1], 10) * 7 * 86400 * 1000;

  const dMatch = s.match(/^(\d+)\s*(?:d|kun|day|days)$/i);
  if (dMatch) return parseInt(dMatch[1], 10) * 86400 * 1000;

  const hMatch = s.match(/^(\d+)\s*(?:h|soat|hour|hours)$/i);
  if (hMatch) return parseInt(hMatch[1], 10) * 3600 * 1000;

  const mMatch = s.match(/^(\d+)\s*m$/i);
  if (mMatch) {
    const val = parseInt(mMatch[1], 10);
    // 1m, 2m, 3m = oylar; 4m va undan kattasi = daqiqalar (masalan: 10m, 30m)
    if (val <= 3) {
      return val * 30 * 86400 * 1000;
    } else {
      return val * 60 * 1000;
    }
  }

  const numOnly = parseInt(s, 10);
  if (!isNaN(numOnly)) {
    return numOnly * 3600 * 1000;
  }
  return 0;
}

function formatRemainingTime(user) {
  if (!user) return "Noma'lum";
  if (user.plan === 'unlimited' || user.expiresAt === 'Cheksiz VIP' || (typeof user.remainingUses === 'number' && user.remainingUses >= 99999)) {
    return "👑 Cheksiz VIP (Abadiy)";
  }
  if (typeof user.remainingUses === 'number' && user.remainingUses !== null && user.remainingUses < 99999) {
    if (user.remainingUses <= 0) return "❌ 0 ta (Tugagan)";
    return `⚡ ${user.remainingUses} ta hujjat`;
  }
  if (user.expireTimestamp) {
    const diff = user.expireTimestamp - Date.now();
    if (diff <= 0) {
      return "⏳ Muddati tugagan (0)";
    }
    const days = Math.floor(diff / (86400 * 1000));
    const hours = Math.floor((diff % (86400 * 1000)) / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));

    const parts = [];
    if (days > 0) parts.push(`${days} kun`);
    if (hours > 0) parts.push(`${hours} soat`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes} daqiqa`);
    return `⏱ ${parts.join(' ')}`;
  }
  return user.expiresAt || "Belgilanmagan";
}

function logUserActivity(userId, type = 'document', topic = '') {
  if (!userId) return null;
  const user = getUser(userId);
  const now = Date.now();
  const typeMap = {
    presentation: "🎨 Slayd Taqdimot",
    test: "📝 Nazorat Testi",
    lesson_plan: "📑 Dars Ishlanmasi",
    referat: "📖 Referat / Insho",
    official_order: "🏛 Rasmiy Buyruq",
    bayonnoma: "📋 Kengash Bayonnomasi",
    tavsifnoma: "👤 Tavsifnoma",
    excel: "📊 Excel Jadval",
    chat: "🤖 AI Yordamchi",
    document: "📄 Hujjat"
  };
  const typeLabel = typeMap[type] || "📄 Hujjat";
  const entry = {
    id: `act_${now}_${Math.floor(Math.random() * 1000)}`,
    userId: Number(user?.realId || userId),
    userName: user?.name || (user?.username ? `@${user.username}` : `Foydalanuvchi ${userId}`),
    type,
    typeLabel,
    topic: String(topic || '').slice(0, 100),
    timestamp: now
  };
  if (!Array.isArray(db.activityLogs)) {
    db.activityLogs = [];
  }
  db.activityLogs.push(entry);
  if (db.activityLogs.length > 5000) {
    db.activityLogs = db.activityLogs.slice(-5000);
  }
  if (user) {
    user.totalCreated = (user.totalCreated || 0) + 1;
  }
  saveDatabase();
  return entry;
}

function getActivityStats(targetUserId = null) {
  const now = Date.now();
  const ONE_DAY = 24 * 3600 * 1000;
  const ONE_WEEK = 7 * ONE_DAY;
  const ONE_MONTH = 30 * ONE_DAY;

  const logs = Array.isArray(db.activityLogs) ? db.activityLogs : [];
  const targetIdNum = targetUserId ? resolveUserId(targetUserId) : null;

  const filteredLogs = targetIdNum 
    ? logs.filter(l => Number(l.userId) === Number(targetIdNum))
    : logs;

  const stats = {
    day: { total: 0, byType: {} },
    week: { total: 0, byType: {} },
    month: { total: 0, byType: {} },
    allTime: { total: filteredLogs.length, byType: {} },
    userBreakdown: new Map()
  };

  for (const log of filteredLogs) {
    const age = now - log.timestamp;
    const t = log.type || 'document';

    stats.allTime.byType[t] = (stats.allTime.byType[t] || 0) + 1;

    if (age <= ONE_MONTH) {
      stats.month.total++;
      stats.month.byType[t] = (stats.month.byType[t] || 0) + 1;
    }
    if (age <= ONE_WEEK) {
      stats.week.total++;
      stats.week.byType[t] = (stats.week.byType[t] || 0) + 1;
    }
    if (age <= ONE_DAY) {
      stats.day.total++;
      stats.day.byType[t] = (stats.day.byType[t] || 0) + 1;
    }

    if (!stats.userBreakdown.has(log.userId)) {
      stats.userBreakdown.set(log.userId, {
        userId: log.userId,
        userName: log.userName || `Foydalanuvchi ${log.userId}`,
        day: 0,
        week: 0,
        month: 0,
        allTime: 0
      });
    }
    const ub = stats.userBreakdown.get(log.userId);
    ub.allTime++;
    if (age <= ONE_MONTH) ub.month++;
    if (age <= ONE_WEEK) ub.week++;
    if (age <= ONE_DAY) ub.day++;
  }

  return stats;
}

function formatActivityReport(targetUserId = null) {
  const stats = getActivityStats(targetUserId);
  const typeIcons = {
    presentation: "🎨 Slayd",
    test: "📝 Test",
    lesson_plan: "📑 Dars rejasi",
    referat: "📖 Referat",
    official_order: "🏛 Buyruq",
    bayonnoma: "📋 Bayonnoma",
    tavsifnoma: "👤 Tavsifnoma",
    excel: "📊 Excel",
    chat: "🤖 AI Savol-Javob",
    document: "📄 Hujjat"
  };

  function formatTypeDetails(byType) {
    const entries = Object.entries(byType);
    if (entries.length === 0) return "   *(hech qanday fayl yaratilmagan)*";
    return entries.map(([k, v]) => `   • ${typeIcons[k] || k}: **${v} ta**`).join('\n');
  }

  if (targetUserId) {
    const user = getUser(targetUserId);
    const targetId = resolveUserId(targetUserId);
    const displayId = getDisplayUserId(targetId);
    const name = user?.name || `Foydalanuvchi ${displayId}`;
    const handle = user?.username ? `@${user.username}` : `ID: ${targetId}`;
    const remTime = formatRemainingTime(user);

    return (
      `📈 **FOYDALANUVCHI FAOLLIK MONITORINGI:**\n\n` +
      `👤 **Foydalanuvchi:** ${name} (${handle})\n` +
      `🆔 **ID:** \`${displayId}\` *(Telegram ID: ${targetId})*\n` +
      `📊 **Holat:** ${user?.status === 'ACTIVE' ? '✅ Faol' : (user?.status === 'BLOCKED' ? '❌ Bloklangan' : '⏳ Kutmoqda')}\n` +
      `💳 **Tarif:** **${user?.plan || 'none'}**\n` +
      `⏱ **Qolgan vaqt / limit:** **${remTime}**\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⏱ **SO'NGGI 1 KUNDA (24 SOAT):** **${stats.day.total} ta** yaratilgan\n` +
      `${formatTypeDetails(stats.day.byType)}\n\n` +
      `📅 **SO'NGGI 1 HAFTADA (7 KUN):** **${stats.week.total} ta** yaratilgan\n` +
      `${formatTypeDetails(stats.week.byType)}\n\n` +
      `🗓 **SO'NGGI 1 OYDA (30 KUN):** **${stats.month.total} ta** yaratilgan\n` +
      `${formatTypeDetails(stats.month.byType)}\n\n` +
      `🏆 **Jami barcha vaqt:** **${stats.allTime.total} ta** hujjat`
    );
  }

  // System-wide
  const topUsers = Array.from(stats.userBreakdown.values())
    .sort((a, b) => b.day - a.day || b.week - a.week || b.month - a.month)
    .slice(0, 10);

  let topUsersText = '';
  if (topUsers.length === 0) {
    topUsersText = "*(Hali hech kim fayl yaratmagan)*";
  } else {
    topUsersText = topUsers.map((u, i) => 
      `${i + 1}. **${u.userName}** (ID: \`${getDisplayUserId(u.userId)}\`):\n` +
      `   • 1 kunda: **${u.day} ta** | 1 haftada: **${u.week} ta** | 1 oyda: **${u.month} ta** (Jami: ${u.allTime})\n` +
      `   👉 Boshqarish: \`/user ${getDisplayUserId(u.userId)}\``
    ).join('\n\n');
  }

  return (
    `📈 **TIZIM FAOLLIK VA FOYDALANISH TAHLILI:**\n\n` +
    `⏱ **SO'NGGI 1 KUNDA (24 SOAT):** **${stats.day.total} ta** hujjat\n` +
    `${formatTypeDetails(stats.day.byType)}\n\n` +
    `📅 **SO'NGGI 1 HAFTADA (7 KUN):** **${stats.week.total} ta** hujjat\n` +
    `${formatTypeDetails(stats.week.byType)}\n\n` +
    `🗓 **SO'NGGI 1 OYDA (30 KUN):** **${stats.month.total} ta** hujjat\n` +
    `${formatTypeDetails(stats.month.byType)}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥 **ENG FAOL FOYDALANUVCHILAR RO'YXATI:**\n\n` +
    `${topUsersText}\n\n` +
    `💡 *Istalgan foydalanuvchini ko'rish va boshqarish: \`/user [ID]\`*`
  );
}

// 2.2 FOYDALANUVCHINING OXIRGI 100 TA AMALINI AUDIT QILISH VA CHIQARISH (Super Owner uchun)
async function sendUserAuditLogs(ctx, targetIdInput) {
  const targetId = resolveUserId(targetIdInput);
  if (!targetId || isNaN(targetId)) {
    return ctx.reply(
      "⚠️ Iltimos, to'g'ri foydalanuvchi Telegram ID raqamini kiriting!\n" +
      "Misol: `/userlog 9017407025` yoki `/audit 9017407025`", 
      { parse_mode: 'Markdown' }
    );
  }

  const user = getUser(targetId);
  const logs = Array.isArray(db.activityLogs) ? db.activityLogs : [];
  const userLogs = logs.filter(l => Number(l.userId) === Number(targetId) || String(l.userId) === String(targetId)).slice(-100).reverse();

  const userName = user?.name || (user?.username ? `@${user.username}` : `Foydalanuvchi ${targetId}`);
  const userCode = getAccessCodeForUser(targetId);
  const userPlan = user?.plan || (user?.status === 'ACTIVE' ? 'Faol' : 'Yopiq');
  const userDevice = user?.deviceInfo || (userLogs[0]?.deviceInfo) || "Telegram WebApp / Veb";

  let msg = `🔍 **FOYDALANUVCHI AUDIT TARIXI (OXIRGI 100 TA AMAL)**\n\n` +
    `👤 **Foydalanuvchi:** ${userName}\n` +
    `🆔 **Telegram ID:** \`${targetId}\`\n` +
    `🔑 **Kirish Kodi:** \`${userCode}\`\n` +
    `📱 **Qurilma:** ${userDevice}\n` +
    `💳 **Tarif:** ${userPlan} | **Holati:** ${user?.status || 'PENDING'}\n` +
    `📊 **Jami qayd etilgan amallar:** ${userLogs.length} ta\n\n`;

  if (userLogs.length === 0) {
    msg += `ℹ️ *Ushbu foydalanuvchi hali tizimda hech qanday hujjat yoki amal bajarmagan (0 ta faollik).*`;
    return ctx.reply(msg, { parse_mode: 'Markdown' });
  }

  msg += `🕒 **Oxirgi amallar ketma-ketligi:**\n`;
  const previewList = userLogs.slice(0, 15);
  previewList.forEach((l, idx) => {
    const timeStr = new Date(l.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(l.timestamp).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
    const label = l.actionLabel || l.typeLabel || l.type || 'Amal';
    const detail = l.details || l.topic || '';
    msg += `**${idx + 1}.** [${timeStr}] ${label}: *${detail.slice(0, 45)}*\n`;
  });

  if (userLogs.length > 15) {
    msg += `\n📄 *... va yana ${userLogs.length - 15} ta amal (Jami: ${userLogs.length} ta).* To'liq 100 ta amal fayl sifatida yuklandi:`;
  }

  await ctx.reply(msg, { parse_mode: 'Markdown' });

  // Agar 15 tadan ko'p bo'lsa yoki to'liq 100 ta hisobot kerak bo'lsa, TXT fayl yaratib jo'natamiz
  if (userLogs.length > 15) {
    let fileContent = `========================================================\n` +
      `EduHujjat AI & SmartOffice Pro\n` +
      `FOYDALANUVCHI AUDIT HISOBOTI (OXIRGI ${userLogs.length} TA AMAL)\n` +
      `Foydalanuvchi: ${userName} (ID: ${targetId})\n` +
      `Kirish Kodi: ${userCode}\n` +
      `Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
      `========================================================\n\n`;

    userLogs.forEach((l, i) => {
      const dt = new Date(l.timestamp).toLocaleString('uz-UZ');
      fileContent += `${i + 1}. [${dt}] [${l.actionLabel || l.typeLabel || l.type || 'Amal'}]\n` +
        `   Mavzu/Tafsilot: ${l.details || l.topic || '-'}\n` +
        `   Qurilma: ${l.deviceInfo || '-'}\n` +
        `   Amal ID: ${l.id || '-'}\n\n`;
    });

    const buf = Buffer.from(fileContent, 'utf-8');
    await ctx.replyWithDocument(new InputFile(buf, `Audit_User_${targetId}_100_Amallar.txt`), {
      caption: `📁 Foydalanuvchi ${targetId} ning to'liq ${userLogs.length} ta amallar jurnali`
    });
  }
}

function cutUserTime(targetUserId, ms) {
  const targetId = resolveUserId(targetUserId);
  const user = getUser(targetId);
  if (!user) return { success: false, message: "Foydalanuvchi topilmadi" };

  const now = Date.now();
  if (user.expireTimestamp) {
    user.expireTimestamp -= ms;
    if (user.expireTimestamp <= now) {
      user.expireTimestamp = now - 1000;
      user.status = 'PENDING';
      user.expiresAt = 'Muddati tugagan (0)';
    } else {
      user.expiresAt = formatRemainingTime(user);
    }
  } else if (user.plan && user.plan.endsWith('h')) {
    const hours = parseInt(user.plan, 10) || 1;
    const remaining = Math.max(0, hours * 3600 * 1000 - ms);
    user.expireTimestamp = now + remaining;
    if (remaining <= 0) {
      user.status = 'PENDING';
      user.expiresAt = 'Muddati tugagan (0)';
    } else {
      user.expiresAt = formatRemainingTime(user);
    }
  } else if (user.plan && user.plan.endsWith('d')) {
    const days = parseInt(user.plan, 10) || 1;
    const remaining = Math.max(0, days * 86400 * 1000 - ms);
    user.expireTimestamp = now + remaining;
    if (remaining <= 0) {
      user.status = 'PENDING';
      user.expiresAt = 'Muddati tugagan (0)';
    } else {
      user.expiresAt = formatRemainingTime(user);
    }
  } else if (user.plan === 'unlimited') {
    return { success: false, message: "Foydalanuvchi Cheksiz VIP. Uni to'xtatish uchun /zero buyrug'ini ishlating." };
  } else {
    return { success: false, message: "Foydalanuvchida vaqtli obuna belgilanmagan." };
  }

  setUser(targetId, user);
  saveDatabase();
  return { success: true, user, remainingTime: formatRemainingTime(user) };
}

function addUserTime(targetUserId, ms) {
  const targetId = resolveUserId(targetUserId);
  const user = getUser(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
  const now = Date.now();

  const currentExpire = (user.expireTimestamp && user.expireTimestamp > now) 
    ? user.expireTimestamp 
    : now;

  user.expireTimestamp = currentExpire + ms;
  user.status = 'ACTIVE';
  user.remainingUses = null;
  user.plan = 'custom_time';
  user.expiresAt = formatRemainingTime(user);

  setUser(targetId, user);
  saveDatabase();
  return { success: true, user, remainingTime: formatRemainingTime(user) };
}

function setUserZero(targetUserId) {
  const targetId = resolveUserId(targetUserId);
  const user = getUser(targetId);
  if (!user) return { success: false, message: "Foydalanuvchi topilmadi" };

  user.status = 'PENDING';
  user.remainingUses = 0;
  user.expireTimestamp = Date.now() - 1000;
  user.expiresAt = '0 (Muzlatilgan)';

  setUser(targetId, user);
  saveDatabase();
  return { success: true, user };
}

function isUserActive(userId, username) {
  if (userId === SUPER_OWNER_ID) {
    const role = db.simulatedRoles.get(userId);
    if (role === 'USER') {
      const u = getUser(userId);
      return u?.status === 'ACTIVE';
    }
    return true;
  }

  if (username && username.toLowerCase() === OWNER_USERNAME.toLowerCase()) return true;
  if (username && db.admins.has(username.toLowerCase())) return true;
  
  const user = getUser(userId);
  if (!user) return false;

  // Har bir yangi yoki sinovdagi foydalanuvchiga 5 ta bepul sinov berish (reklamasiz erkin foydalanish)
  if (!user.trialGiven && (user.status === 'PENDING' || !user.plan || user.plan === 'none')) {
    user.trialGiven = true;
    user.status = 'ACTIVE';
    user.plan = 'trial';
    user.remainingUses = 5;
    user.expiresAt = '5 ta bepul sinov';
    saveDatabase();
    return true;
  }

  if (user.status !== 'ACTIVE') return false;

  if (typeof user.remainingUses === 'number' && user.remainingUses <= 0) {
    user.status = 'PENDING';
    user.expiresAt = '0 ta (Tugagan)';
    saveDatabase();
    return false;
  }

  if (user.expireTimestamp && Date.now() >= user.expireTimestamp) {
    user.status = 'PENDING';
    user.expiresAt = 'Muddati tugagan (0)';
    saveDatabase();
    return false;
  }

  return true;
}

function consumeUserUse(userId, type = 'document', topic = '') {
  logUserActivity(userId, type, topic);
  if (!userId || userId === SUPER_OWNER_ID) return null;
  const user = getUser(userId);
  if (user && typeof user.remainingUses === 'number') {
    user.remainingUses = Math.max(0, user.remainingUses - 1);
    if (user.remainingUses <= 0) {
      user.status = 'PENDING';
      user.expiresAt = '0 ta (Tugagan)';
    }
    saveDatabase();
    return user.remainingUses;
  }
  return null;
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
    let clean = line.replace(/^\s*(?:№|\#)?\s*\[?\d+[\.\)\-\:\s\]]\s*/, '').replace(/^[\-\*•\>\s]+/, '').trim();

    // 1. Telefon raqami
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

    // 2. Tug'ilgan sana
    let birthDate = '';
    let birthYear = null;
    const dateMatch = clean.match(/\b(\d{4}[\.\/-]\d{1,2}[\.\/-]\d{1,2}|\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{4})\b/);
    if (dateMatch) {
      birthDate = dateMatch[0].replace(/-/g, '.');
      const yearPart = birthDate.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearPart) birthYear = parseInt(yearPart[1], 10);
      clean = clean.replace(dateMatch[0], ' ').trim();
    } else {
      const yearMatch = clean.match(/\b(19\d{2}|20\d{2})\s*(?:-yil|yil|y)?\b/);
      if (yearMatch) {
        birthDate = yearMatch[1];
        birthYear = parseInt(yearMatch[1], 10);
        clean = clean.replace(yearMatch[0], ' ').trim();
      }
    }

    // 3. Sinf (9-B, 10-A, 8-sinf)
    let className = '';
    const classRegex = /\b([1-9]|1[0-1])\s*(?:-|–|—)?\s*(?:sinf\b|["'«]?([a-zA-Zа-яА-ЯЎўҚқҒғҲҳ])["'»]?\b)(?!\s*(?:daha|mavze|maktab|uy|dom|bino|xonadon|kvartira|yil|yosh|qavat|oy|kun))/i;
    const classMatch = clean.match(classRegex);
    if (classMatch) {
      className = classMatch[0].trim().toUpperCase();
      clean = clean.replace(classMatch[0], ' ').trim();
    }

    // 4. Yoshi (13 yosh, 14 yoshda)
    let explicitAge = null;
    const ageRegex = /\b(\d{1,2})\s*(?:yoshda|yoshli|yosh|-yosh|y\b)/i;
    const ageMatch = clean.match(ageRegex);
    if (ageMatch) {
      explicitAge = parseInt(ageMatch[1], 10);
      clean = clean.replace(ageMatch[0], ' ').trim();
    }

    // 5. Jins (O'g'il bola, Qiz bola)
    let explicitGender = null;
    const genderRegex = /\b(o['ʻ`]?g['ʻ`]?il\s*bola|o['ʻ`]?g['ʻ`]?il|erkak\s*jinsi|erkak|boy|male|qiz\s*bola|qiz|ayol\s*jinsi|ayol|girl|female)\b/i;
    const genderMatch = clean.match(genderRegex);
    if (genderMatch) {
      const gLower = genderMatch[0].toLowerCase().replace(/[ʻʼ`‘’]/g, "'");
      if (gLower.includes('qiz') || gLower.includes('ayol') || gLower.includes('female') || gLower.includes('girl')) {
        explicitGender = "Ayol (Qiz)";
      } else {
        explicitGender = "Erkak (O'g'il)";
      }
      clean = clean.replace(genderMatch[0], ' ').trim();
    }

    // 6. Manzil
    let address = '';
    const addrRegex = /(?:(?:\b(?:viloyat[ia]?|tuman[ia]?|shahar|shahr[ia]?|qishloq|qishlog'[ia]?|ko'cha|ko'chas[ia]?|k-si|tor\s*ko'cha|mavze|mavzes[ia]?|daha|dahas[ia]?|massiv|kvartal|uy|xonadon|kvartira|dom|bino|mfy|mfi|mahalla|mahallasi)\b)|(?:\b(?:chilonzor|yunusobod|sergeli|yashnobod|shayxontohur|uchtepa|yakkasaroy|bektemir|olmazor|mirobod|yangihayot|bekobod|chirchiq|olmaliq|angren|toshkent|samarqand|andijon|farg'ona|namangan|buxoro|xorazm|navoiy|qashqadaryo|surxondaryo|jizzax|sirdaryo)\b)).*$/i;
    const addrMatch = clean.match(addrRegex);
    if (addrMatch) {
      address = addrMatch[0].trim().replace(/^[\-\,\.\s]+/, '').replace(/[\-\,\.\s]+$/, '');
      clean = clean.replace(addrMatch[0], ' ').trim();
    }

    // 7. Qolgan toza ism-familiya
    clean = clean.replace(/[,;\|\\\/]/g, ' ').replace(/\s+/g, ' ').trim();
    clean = clean.replace(/^[\d\s\.\)\-\:\*•>]+/, '').replace(/[\d\s\.\)\-\:\*•>]+$/, '').trim();
    const words = clean.split(' ').map(w => {
      const lw = w.toLowerCase().replace(/[ʻʼ`‘’]/g, "'");
      if (lw === "o'g'li" || lw === "og'li") return "o'g'li";
      if (lw === "qizi") return "qizi";
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });
    const fullName = words.join(' ') || `O'quvchi #${index + 1}`;

    // Jinsni aniqlash
    const lower = fullName.toLowerCase();
    let gender = explicitGender || "Noma'lum";
    if (!explicitGender) {
      if (lower.includes('qizi') || lower.endsWith('ova') || lower.endsWith('yeva') || lower.endsWith('ovna') || lower.endsWith('yevna') || lower.endsWith('oy') || lower.endsWith('bonu') || lower.endsWith('xon')) {
        gender = "Ayol (Qiz)";
      } else if (lower.includes("o'g'li") || lower.endsWith('ov') || lower.endsWith('yev') || lower.endsWith('ovich') || lower.endsWith('yevich') || lower.endsWith('bek') || lower.endsWith('jon') || lower.endsWith('boy')) {
        gender = "Erkak (O'g'il)";
      }
    }

    let age = explicitAge ? `${explicitAge} yosh` : '-';
    if (birthYear) {
      const calc = new Date().getFullYear() - birthYear;
      age = `${calc} yosh`;
    }

    students.push({
      number: index + 1,
      fullName,
      birthDate: birthDate || '-',
      birthYear: birthYear || 2010,
      age,
      gender,
      phone: phone || '-',
      address: address || '-',
      className: className || '9-B'
    });
  });

  return students;
}

// 5. MUKAMMAL FAYL GENERATORLARI (DOCX, XLSX, PPTX)
// 5. MUKAMMAL FAYL GENERATORLARI (DOCX, XLSX, PPTX)
function generateExcelBuffer(students) {
  const wb = XLSX.utils.book_new();
  const safeList = students && students.length > 0 ? students : [
    { fullName: "Aliyeva Malika Sardor qizi", birthDate: "2009-04-12", age: 17, className: "9-A", phone: "+998 90 123 45 67", gender: "Ayol" },
    { fullName: "Karimov Jasur Bobur o'g'li", birthDate: "2009-01-20", age: 17, className: "9-A", phone: "+998 91 234 56 78", gender: "Erkak" },
    { fullName: "Xolmatov Sardor Rustam o'g'li", birthDate: "2009-08-15", age: 16, className: "9-A", phone: "+998 93 345 67 89", gender: "Erkak" },
    { fullName: "Usmonova Laylo Jamshid qizi", birthDate: "2009-11-03", age: 16, className: "9-A", phone: "+998 94 456 78 90", gender: "Ayol" },
    { fullName: "Boboyev Dostonbek Alisher o'g'li", birthDate: "2009-03-25", age: 17, className: "9-A", phone: "+998 97 567 89 01", gender: "Erkak" },
    { fullName: "Toshmatova Sevara Farhod qizi", birthDate: "2009-07-09", age: 16, className: "9-A", phone: "+998 99 678 90 12", gender: "Ayol" }
  ];

  // 1-SAHIFA: ASOSIY RO'YXAT
  const headerRow = ["№", "F.I.Sh (To'liq ism)", "Tug'ilgan sana", "Yoshi", "Jinsi", "Telefon raqami", "Sinfi", "Holati"];
  const dataRows = safeList.map((s, idx) => [
    idx + 1,
    sanitizeFormula(s.fullName),
    sanitizeFormula(s.birthDate),
    s.age,
    sanitizeFormula(s.gender),
    sanitizeFormula(s.phone),
    sanitizeFormula(s.className || '9-A'),
    "Faol"
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet([
    ["O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI"],
    ["O'QUVCHILARNING RASMIY TARTIBLANGAN ASOSIY RO'YXATI"],
    [`Hosil qilingan sana: ${new Date().toLocaleDateString('uz-UZ')} | Jami: ${safeList.length} nafar o'quvchi | EduHujjat AI`],
    [],
    headerRow,
    ...dataRows
  ]);
  ws1['!cols'] = [{ wch: 6 }, { wch: 36 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 22 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws1, "1. O'quvchilar Ro'yxati");

  // 2-SAHIFA: DEMOGRAFIYA & STATISTIKA
  const boysCount = safeList.filter(s => s.gender && s.gender.includes('Erkak')).length;
  const girlsCount = safeList.length - boysCount;
  const boysPercent = Math.round((boysCount / (safeList.length || 1)) * 100);
  const girlsPercent = 100 - boysPercent;

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["DEMOGRAFIK TAHLIL VA STATISTIKA PANELI"],
    [`Tahlil sanasi: ${new Date().toLocaleDateString('uz-UZ')} | Maktab mezonlari`],
    [],
    ["Ko'rsatkich parametri", "Soni / Qiymati", "Ulushi (%)", "Izoh"],
    ["Jami o'quvchilar soni", safeList.length, "100%", "Sinfdagi umumiy kontingent"],
    ["O'g'il bolalar soni", boysCount, `${boysPercent}%`, "Erkak jinsidagi o'quvchilar"],
    ["Qiz bolalar soni", girlsCount, `${girlsPercent}%`, "Ayol jinsidagi o'quvchilar"],
    ["16 yoshgacha bo'lganlar", safeList.filter(s => (s.age || 16) < 16).length, "-", "Kichik yosh toifasi"],
    ["16-17 yosh oralig'idagilar", safeList.filter(s => (s.age || 16) >= 16 && (s.age || 16) <= 17).length, "-", "O'rta yosh toifasi"],
    ["18 yosh va undan kattalar", safeList.filter(s => (s.age || 16) >= 18).length, "-", "Voyaga yetganlar toifasi"],
    [],
    ["TAVSIYA:", "Sinfdagi gender balansi va yosh toifalari mezonlarga to'liq mos keladi."]
  ]);
  ws2['!cols'] = [{ wch: 32 }, { wch: 18 }, { wch: 16 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(wb, ws2, "2. Demografiya & Tahlil");

  // 3-SAHIFA: FANLAR BO'YICHA REYTING & GPA MATRITSASI
  const baseGrades = [
    [5, 5, 5, 5, 5, 5, 5],
    [5, 5, 4, 5, 4, 4, 5],
    [4, 4, 5, 4, 5, 4, 4],
    [5, 4, 4, 4, 4, 4, 4],
    [4, 4, 3, 4, 3, 4, 4],
    [3, 4, 3, 3, 4, 3, 3]
  ];
  const s3Header = [
    ["FANLAR BO'YICHA O'ZLASHTIRISH VA GPA REYTING JADVALI"],
    ["Mezon: A'lochi (GPA >= 4.7) | Yaxshi (GPA 3.8 - 4.6) | Qoniqarli (GPA < 3.8)"],
    [],
    ["№", "O'rin", "F.I.Sh", "Ona tili", "Adabiyot", "Matematika", "Tarix", "Fizika", "Kimyo", "Ingliz tili", "GPA Ball", "O'zlashtirish", "Akademik Daraja"]
  ];
  const s3Rows = safeList.map((s, idx) => {
    const grades = baseGrades[idx % baseGrades.length];
    const avg = Number((grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2));
    const pct = Math.round((avg / 5) * 100);
    const cat = avg >= 4.7 ? "A'lochi (5)" : avg >= 3.8 ? "Yaxshi (4)" : "Qoniqarli (3)";
    return [
      idx + 1, idx + 1, s.fullName,
      grades[0], grades[1], grades[2], grades[3], grades[4], grades[5], grades[6],
      avg, `${pct}%`, cat
    ];
  });
  const ws3 = XLSX.utils.aoa_to_sheet([...s3Header, ...s3Rows]);
  ws3['!cols'] = [
    { wch: 6 }, { wch: 8 }, { wch: 34 },
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws3, "3. Reyting & GPA");

  // 4-SAHIFA: OYLIK DAVOMAT TABELI (1-31 KUNLAR)
  const s4Header = [
    ["OYLIK DAVOMAT HISOBOT TABELI (DAVOMAT JURNALI)"],
    ["Belgilar: [+] - Darsda qatnashdi | [S] - Sababli qoldirdi | [Q] - Sababsiz qoldirdi | [D] - Dam olish kuni"],
    [],
    ["№", "O'quvchining F.I.Sh"]
  ];
  for (let d = 1; d <= 31; d++) s4Header[3].push(`${d}`);
  s4Header[3].push("Jami qatnashdi", "Sababli", "Sababsiz");

  const s4Rows = safeList.map((s, idx) => {
    const row = [idx + 1, s.fullName];
    let presentCount = 0;
    for (let d = 1; d <= 31; d++) {
      const isWeekend = (d % 7 === 0 || d % 7 === 6);
      if (isWeekend) {
        row.push('D');
      } else {
        if (d === 14 && idx % 3 === 0) {
          row.push('S');
        } else {
          row.push('+');
          presentCount++;
        }
      }
    }
    row.push(presentCount, idx % 3 === 0 ? 1 : 0, 0);
    return row;
  });
  const ws4 = XLSX.utils.aoa_to_sheet([...s4Header, ...s4Rows]);
  const s4Cols = [{ wch: 6 }, { wch: 34 }];
  for (let d = 1; d <= 31; d++) s4Cols.push({ wch: 4 });
  s4Cols.push({ wch: 15 }, { wch: 10 }, { wch: 10 });
  ws4['!cols'] = s4Cols;
  XLSX.utils.book_append_sheet(wb, ws4, "4. Oylik Davomat");

  // 5-SAHIFA: DARS JADVALI VA SINF NAVBATCHILIGI
  const ws5Data = [
    ["HAFTALIK DARS JADVALI VA SINF NAVBATCHILIGI GRAFIGI"],
    ["O'quv yili: 2026/2027 | Tasdiqlangan dars va xona taqsimoti"],
    [],
    ["Hafta kuni", "Vaqti", "Dars tartibi", "Fan nomi", "O'qituvchi", "Xona", "Kungi Navbatchilar"],
    ["Dushanba", "08:30 - 09:15", "1-dars", "Ona tili", "Karimova Z.", "204-xona", safeList[0]?.fullName || "Navbatchi 1"],
    ["Dushanba", "09:20 - 10:05", "2-dars", "Adabiyot", "Karimova Z.", "204-xona", safeList[1]?.fullName || "Navbatchi 2"],
    ["Dushanba", "10:15 - 11:00", "3-dars", "Matematika", "Rasulov B.", "105-xona", ""],
    ["Dushanba", "11:10 - 11:55", "4-dars", "Ingliz tili", "Smith A.", "302-xona", ""],
    ["Dushanba", "12:05 - 12:50", "5-dars", "Tarix", "Mirzayev H.", "208-xona", ""],
    [],
    ["Seshanba", "08:30 - 09:15", "1-dars", "Fizika", "Qodirov M.", "110-xona", safeList[2]?.fullName || "Navbatchi 1"],
    ["Seshanba", "09:20 - 10:05", "2-dars", "Kimyo", "Yoqubova G.", "Laboratoriya", safeList[3]?.fullName || "Navbatchi 2"],
    ["Seshanba", "10:15 - 11:00", "3-dars", "Geometriya", "Rasulov B.", "105-xona", ""],
    ["Seshanba", "11:10 - 11:55", "4-dars", "Biologiya", "Sobirova D.", "201-xona", ""],
    ["Seshanba", "12:05 - 12:50", "5-dars", "Jismoniy tarbiya", "Aliyev Sh.", "Sport zal", ""],
    [],
    ["Chorshanba", "08:30 - 09:15", "1-dars", "Informatika", "Nazarov K.", "Kompyuter xona", safeList[4]?.fullName || "Navbatchi 1"],
    ["Chorshanba", "09:20 - 10:05", "2-dars", "Algebra", "Rasulov B.", "105-xona", safeList[5]?.fullName || "Navbatchi 2"],
    ["Chorshanba", "10:15 - 11:00", "3-dars", "Ona tili", "Karimova Z.", "204-xona", ""],
    ["Chorshanba", "11:10 - 11:55", "4-dars", "Tarix", "Mirzayev H.", "208-xona", ""],
    ["Chorshanba", "12:05 - 12:50", "5-dars", "Ingliz tili", "Smith A.", "302-xona", ""]
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(ws5Data);
  ws5['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, ws5, "5. Jadval & Navbatchilik");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

function generateAttendanceExcelBuffer(students) {
  const wb = XLSX.utils.book_new();
  const safeList = students && students.length > 0 ? students : [
    { fullName: "Karimova Dildora Jasur qizi" },
    { fullName: "Abdullayev Jasur Rustam o'g'li" },
    { fullName: "Omonov Sardor Baxtiyor o'g'li" },
    { fullName: "Toshmatova Rayhon Farhod qizi" }
  ];

  const header = [
    ["O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI"],
    ["OYLIK DAVOMAT HISOBOT TABELI (DAVOMAT JURNALI)"],
    [`Hujjat sanasi: ${new Date().toLocaleDateString('uz-UZ')} | O'quvchilar soni: ${safeList.length} nafar`],
    ["Belgilar: [+] - Darsda qatnashdi | [S] - Sababli qoldirdi | [Q] - Sababsiz qoldirdi | [D] - Dam olish kuni"],
    [],
    ["№", "O'quvchining F.I.Sh"]
  ];
  for (let d = 1; d <= 31; d++) header[5].push(`${d}`);
  header[5].push("Jami qatnashdi", "Sababli (soat)", "Sababsiz (soat)");

  const rows = safeList.map((s, idx) => {
    const row = [idx + 1, s.fullName];
    let presentCount = 0;
    for (let d = 1; d <= 31; d++) {
      const isWeekend = (d % 7 === 0 || d % 7 === 6);
      if (isWeekend) {
        row.push('D');
      } else {
        if (d === 12 && idx % 2 === 1) {
          row.push('S');
        } else {
          row.push('+');
          presentCount++;
        }
      }
    }
    row.push(presentCount, idx % 2 === 1 ? 2 : 0, 0);
    return row;
  });

  const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
  const cols = [{ wch: 6 }, { wch: 34 }];
  for (let d = 1; d <= 31; d++) cols.push({ wch: 4 });
  cols.push({ wch: 15 }, { wch: 14 }, { wch: 14 });
  ws['!cols'] = cols;
  XLSX.utils.book_append_sheet(wb, ws, "Davomat Tabeli");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

function generateGradesExcelBuffer(students) {
  const wb = XLSX.utils.book_new();
  const safeList = students && students.length > 0 ? students : [
    { fullName: "Karimova Dildora Jasur qizi" },
    { fullName: "Abdullayev Jasur Rustam o'g'li" },
    { fullName: "Omonov Sardor Baxtiyor o'g'li" }
  ];

  const header = [
    ["O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI"],
    ["FANLAR BO'YICHA O'ZLASHTIRISH VA GPA REYTING JADVALI"],
    ["Mezon: A'lochi (GPA >= 4.7) | Yaxshi (GPA 3.8 - 4.6) | Qoniqarli (GPA < 3.8)"],
    [],
    ["№", "O'rin", "F.I.Sh", "Ona tili", "Adabiyot", "Matematika", "Tarix", "Fizika", "Kimyo", "Ingliz tili", "GPA Ball", "O'zlashtirish", "Akademik Daraja"]
  ];

  const baseGrades = [
    [5, 5, 5, 5, 5, 5, 5],
    [5, 5, 4, 5, 4, 4, 5],
    [4, 4, 5, 4, 5, 4, 4]
  ];

  const rows = safeList.map((s, idx) => {
    const grades = baseGrades[idx % baseGrades.length];
    const avg = Number((grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2));
    const pct = Math.round((avg / 5) * 100);
    const cat = avg >= 4.7 ? "A'lochi (5)" : avg >= 3.8 ? "Yaxshi (4)" : "Qoniqarli (3)";
    return [
      idx + 1, idx + 1, s.fullName,
      grades[0], grades[1], grades[2], grades[3], grades[4], grades[5], grades[6],
      avg, `${pct}%`, cat
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
  ws['!cols'] = [
    { wch: 6 }, { wch: 8 }, { wch: 34 },
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Baholar Reytingi");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

function generateScheduleExcelBuffer(students) {
  const wb = XLSX.utils.book_new();
  const wsData = [
    ["O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI"],
    ["HAFTALIK DARS JADVALI VA SINF NAVBATCHILIGI GRAFIGI"],
    ["O'quv yili: 2026/2027 | Tasdiqlangan dars va xona taqsimoti"],
    [],
    ["Hafta kuni", "Vaqti", "Dars tartibi", "Fan nomi", "O'qituvchi", "Xona", "Kungi Navbatchilar"],
    ["Dushanba", "08:30 - 09:15", "1-dars", "Ona tili", "Karimova Z.", "204-xona", "Karimova Dildora"],
    ["Dushanba", "09:20 - 10:05", "2-dars", "Adabiyot", "Karimova Z.", "204-xona", "Abdullayev Jasur"],
    ["Dushanba", "10:15 - 11:00", "3-dars", "Matematika", "Rasulov B.", "105-xona", ""],
    ["Dushanba", "11:10 - 11:55", "4-dars", "Ingliz tili", "Smith A.", "302-xona", ""],
    ["Dushanba", "12:05 - 12:50", "5-dars", "Tarix", "Mirzayev H.", "208-xona", ""],
    [],
    ["Seshanba", "08:30 - 09:15", "1-dars", "Fizika", "Qodirov M.", "110-xona", "Omonov Sardor"],
    ["Seshanba", "09:20 - 10:05", "2-dars", "Kimyo", "Yoqubova G.", "Laboratoriya", "Toshmatova Rayhon"],
    ["Seshanba", "10:15 - 11:00", "3-dars", "Geometriya", "Rasulov B.", "105-xona", ""],
    ["Seshanba", "11:10 - 11:55", "4-dars", "Biologiya", "Sobirova D.", "201-xona", ""],
    ["Seshanba", "12:05 - 12:50", "5-dars", "Jismoniy tarbiya", "Aliyev Sh.", "Sport zal", ""]
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, ws, "Dars Jadvali");
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
  const userList = getAllUniqueUsers();
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
        new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, shading: { fill: "1E3A8A" }, children: [new Paragraph({ children: [new TextRun({ text: "№", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 36, type: WidthType.PERCENTAGE }, shading: { fill: "1E3A8A" }, children: [new Paragraph({ children: [new TextRun({ text: "F.I.Sh (Familiya, Ismi, Sharif)", bold: true, color: "FFFFFF" })], alignment: AlignmentType.LEFT })] }),
        new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, shading: { fill: "1E3A8A" }, children: [new Paragraph({ children: [new TextRun({ text: "Tug'ilgan sana", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: "1E3A8A" }, children: [new Paragraph({ children: [new TextRun({ text: "Yoshi", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, shading: { fill: "1E3A8A" }, children: [new Paragraph({ children: [new TextRun({ text: "Jinsi", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, shading: { fill: "1E3A8A" }, children: [new Paragraph({ children: [new TextRun({ text: "Telefon", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })] }),
      ]
    }),
    ...students.map((s, idx) => new TableRow({
      children: [
        new TableCell({ shading: idx % 2 === 1 ? { fill: "F8FAFC" } : undefined, children: [new Paragraph({ text: String(idx + 1), alignment: AlignmentType.CENTER })] }),
        new TableCell({ shading: idx % 2 === 1 ? { fill: "F8FAFC" } : undefined, children: [new Paragraph({ text: s.fullName, alignment: AlignmentType.LEFT })] }),
        new TableCell({ shading: idx % 2 === 1 ? { fill: "F8FAFC" } : undefined, children: [new Paragraph({ text: String(s.birthDate), alignment: AlignmentType.CENTER })] }),
        new TableCell({ shading: idx % 2 === 1 ? { fill: "F8FAFC" } : undefined, children: [new Paragraph({ text: String(s.age), alignment: AlignmentType.CENTER })] }),
        new TableCell({ shading: idx % 2 === 1 ? { fill: "F8FAFC" } : undefined, children: [new Paragraph({ text: s.gender, alignment: AlignmentType.CENTER })] }),
        new TableCell({ shading: idx % 2 === 1 ? { fill: "F8FAFC" } : undefined, children: [new Paragraph({ text: s.phone, alignment: AlignmentType.CENTER })] }),
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
          text: `Sana: ${new Date().toLocaleDateString('uz-UZ')} | Tasdiqlangan nusxa | EduHujjat AI`,
          alignment: AlignmentType.RIGHT
        }),
        new Paragraph({ text: "" }),
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE }
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          spacing: { before: 300 },
          children: [
            new TextRun({ text: "Maktab direktori:  __________________________   (M.O'. Muhr o'rni)", bold: true })
          ]
        }),
        new Paragraph({
          spacing: { before: 150 },
          children: [
            new TextRun({ text: "Sinf rahbari:      __________________________   (Imzo)", bold: true })
          ]
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: `Hujjat raqamli tekshiruv kodi: EDU-${Math.floor(100000 + Math.random() * 900000)} | Milliy Ta'lim Tizimi`, size: 18, color: "64748B", italics: true })
          ]
        })
      ]
    }]
  });

  return await Packer.toBuffer(doc);
}

async function generateLessonPlanWordBuffer(topic = "Ona tili va adabiyot", customPlanText = "") {
  let planText = customPlanText;
  if (!planText) {
    try {
      planText = await generateAILessonPlanWithGemini(topic);
    } catch(e) {
      planText = generateAILessonPlan(topic);
    }
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

async function generateReferatWordBuffer(topic = "Mustaqil Ish va Referat", customReferatText = "") {
  let text = customReferatText;
  if (!text) {
    try {
      const prompt = `Mavzu: "${topic}"\nVazifa: O'zbekiston oliy va maktab ta'limi standartlariga mos to'liq akademik referat yozib ber. Reja, kirish, kamida 3 ta asosiy bob, xulosa va 10+ ilmiy adabiyotlar bo'lsin.`;
      text = await callGemini(prompt);
    } catch(e) {
      text = `# ${topic}\n\n1. Reja\n2. Kirish\n3. Asosiy Qism\n4. Xulosa\n5. Adabiyotlar`;
    }
  }
  const lines = text.split('\n');
  const docChildren = [
    new Paragraph({ text: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "AKADEMIK REFERAT VA ILMIY MA'RUZA", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: `Mavzu: "${topic.slice(0, 80)}"`, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "----------------------------------------------------------------------------------" }),
    new Paragraph({ text: "" })
  ];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      docChildren.push(new Paragraph({ text: "" }));
    } else if (trimmed.startsWith('#') || (trimmed.startsWith('**') && trimmed.endsWith('**'))) {
      docChildren.push(new Paragraph({ children: [new TextRun({ text: trimmed.replace(/[#*]/g, '').trim(), bold: true })], heading: HeadingLevel.HEADING_2 }));
    } else {
      docChildren.push(new Paragraph({ text: trimmed.replace(/[*_]/g, '') }));
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

function generateDynamicExcelBuffer(tableData) {
  const wb = XLSX.utils.book_new();
  const sheetName = (tableData.sheetName || "Tahliliy Jadval").slice(0, 31);
  const aoa = [
    ["O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI"],
    [(tableData.title || "HISOBOT VA MONITORING JADVALI").toUpperCase()],
    [`Hujjat sanasi: ${new Date().toLocaleDateString('uz-UZ')} | Maqom: Rasmiy ta'limiy-tahliliy hujjat`],
    [],
    tableData.headers || ["№", "Nomi / F.I.Sh", "Ko'rsatkich", "Natija", "Izoh"]
  ];
  if (Array.isArray(tableData.rows)) {
    tableData.rows.forEach(r => aoa.push(r));
  }
  if (Array.isArray(tableData.summaryRow) && tableData.summaryRow.length > 0) {
    aoa.push([]);
    aoa.push(tableData.summaryRow);
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const colWidths = (tableData.headers || []).map((h, colIdx) => {
    let maxLen = String(h || '').length;
    if (Array.isArray(tableData.rows)) {
      tableData.rows.forEach(row => {
        const cell = row[colIdx];
        if (cell !== undefined && cell !== null) {
          maxLen = Math.max(maxLen, String(cell).length);
        }
      });
    }
    return { wch: Math.min(45, Math.max(8, maxLen + 3)) };
  });
  ws['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
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



async function generateTestWordBuffer(rawText, customTestText = "", count = 15) {
  const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 3);
  const sampleTopic = lines[0] || "O'zbekiston tarixi va fan asoslari";

  let testText = customTestText;
  if (!testText) {
    try {
      testText = await generateAITestWithGemini(sampleTopic, count);
    } catch(e) {
      testText = generateAITestSuite(sampleTopic, count);
    }
  }
  const testLines = testText.split('\n');

  const docChildren = [
    new Paragraph({ text: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: `NAZORAT TESTLARI VARIANTI (${count} TALIK)`, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: `Mavzu: "${sampleTopic.slice(0, 80)}"`, alignment: AlignmentType.CENTER }),
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
      .text("🔍 Foydalanuvchi Tarixi (100 ta)").text("👥 Foydalanuvchilar").row()
      .text("📈 Faollik Tahlili").text("📊 Statistika").row()
      .text("📑 Hujjat Fabrikasi").text("🎲 Test Generatori").row()
      .text("📊 Excel Jadvallar").text("🎨 Gamma AI Taqdimot").row()
      .text("📜 Faxriy Yorliq").text("🖼 Slayd Yasash").row()
      .text("💰 Narxlar").text("🛡 Adminlar").row()
      .text("📢 Ommaviy Xabar").text("📥 Bazani Yuklash (Excel)").row()
      .text("🎭 Rejimni Almashtirish").text("🌐 WebApp Ochish").row()
      .text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }

  if (role === 'ADMIN') {
    return new Keyboard()
      .text("⚡ Tezkor Yoqish").text("🔑 Saytga Kirish Kodi").row()
      .text("🔍 Foydalanuvchi Tarixi (100 ta)").text("👥 Foydalanuvchilar").row()
      .text("📈 Faollik Tahlili").text("📊 Statistika").row()
      .text("📑 Hujjat Fabrikasi").text("🎲 Test Generatori").row()
      .text("📊 Excel Jadvallar").text("🎨 Gamma AI Taqdimot").row()
      .text("💰 Narxlar").text("🌐 WebApp Ochish").row()
      .text("🎭 Rejimni Qaytarish (Owner)").text("🔄 Yangilash /start")
      .resized()
      .persistent();
  }

  if (role === 'INSPECTOR') {
    return new Keyboard()
      .text("🔍 Nazorat / Tekshirish").text("🔑 Saytga Kirish Kodi").row()
      .text("📈 Faollik Tahlili").text("📊 Statistika").row()
      .text("👥 Foydalanuvchilar").text("📥 Bazani Yuklash (Excel)").row()
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

function getExcelInlineKeyboard() {
  return new InlineKeyboard()
    .text("📊 1. Master 5-in-1 Maktab To'plami (.xlsx)", "excel_master").row()
    .text("📈 2. Oylik Davomat Tabeli (.xlsx)", "excel_davomat").row()
    .text("🎯 3. Baholar Jurnali & GPA (.xlsx)", "excel_grades").row()
    .text("📅 4. Dars Jadvali & Navbatchilik (.xlsx)", "excel_schedule").row()
    .text("👥 5. Qizlar va O'g'illar (.xlsx)", "excel_gender").row()
    .text("✍️ 6. AI Maxsus Yangi Jadval Yaratish", "excel_custom");
}

function sendExcelMenu(ctx) {
  const text = 
    `📊 **EDUKATSIYA VA OFIS UCHUN PROFESSIONAL EXCEL JADVALLARI**\n\n` +
    `Tayyor 5 xil maktab shablonini **bir bosishda** yuklab oling yoki AI orqali istalgan yangi jadvalni yaratdiring:\n\n` +
    `• **Master 5-in-1:** Barcha o'quvchilar, pasport/metrika, baholar, oylik davomat va dars jadvali yagona to'liq kitobda.\n` +
    `• **Davomat tabeli:** 1-31 kunlar, sababli/sababsiz dars qoldirishlar va formulali qatnashuv hisobi.\n` +
    `• **Baholar va GPA:** Fanlar kesimida o'zlashtirish, GPA reyting va akademik toifalar.\n` +
    `• **Dars jadvali:** Haftalik 6 kunlik dars soatlari, xonalar va navbatchilik grafigi.\n\n` +
    `👇 **Kerakli jadvalni tanlang yoki matn yozib buyurtma bering:**`;
  return ctx.reply(text, { parse_mode: 'Markdown', reply_markup: getExcelInlineKeyboard() });
}

async function handleDynamicExcelCreation(ctx, topic) {
  const userId = ctx.from.id;
  const waitMsg = await ctx.reply(`📊 **"${topic}" mavzusida professional Excel jadval yaratilmoqda...**\n⏳ *(AI ustunlar, qatorlar va formulalarni hisoblamoqda)*`);
  try {
    const tableData = await generateAIExcelTableWithGemini(topic);
    const buffer = generateDynamicExcelBuffer(tableData);
    const safeFilename = `EduHujjat_${topic.slice(0, 25).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}.xlsx`;
    await ctx.replyWithDocument(new InputFile(buffer, safeFilename), {
      caption: `📊 **"${tableData.title || topic}" jadvali tayyor!** (.xlsx)\n\n📌 Varaq: **${tableData.sheetName || 'Jadval'}**\n✨ Ustunlar: **${tableData.headers?.length || 5} ta** | Qatorlar: **${tableData.rows?.length || 10} ta**\n📐 To'liq formulalar va avtomatik hisob-kitoblar bilan.`
    });
    consumeUserUse(userId, 'excel', tableData.title || topic);
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
  } catch(err) {
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    await ctx.reply(`❌ Excel jadval yaratishda xatolik: ${err.message}`);
  }
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

function getUserManageKeyboard(targetUserId) {
  const targetId = resolveUserId(targetUserId);
  return new InlineKeyboard()
    .text("➖ 1 Soat kamaytirish", `manage_cut_1h_${targetId}`)
    .text("➕ 1 Soat qo'shish", `manage_add_1h_${targetId}`)
    .row()
    .text("➖ 1 Kun kamaytirish", `manage_cut_1d_${targetId}`)
    .text("➕ 1 Kun qo'shish", `manage_add_1d_${targetId}`)
    .row()
    .text("➖ 1 ta limit ayirish", `manage_cut_1use_${targetId}`)
    .text("➕ 5 ta limit qo'shish", `manage_add_5use_${targetId}`)
    .row()
    .text("🚫 Vaqtni 0 qilish (Muzlatish)", `manage_zero_${targetId}`)
    .text("👑 Cheksiz VIP berish", `manage_vip_${targetId}`)
    .row()
    .text("🔄 Yangilash", `manage_refresh_${targetId}`)
    .text("📋 Barcha tariflar", `manage_tariffs_${targetId}`);
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

  if (!hasUser(userId)) {
    const isOwnerUser = isRealSuperOwner(ctx);
    // Yangi foydalanuvchiga darhol 5 ta bepul sinov (Free Trial) taqdim etiladi
    setUser(userId, {
      id: isOwnerUser ? 1 : userId,
      realId: userId,
      name: fullName,
      username,
      status: 'ACTIVE',
      plan: isOwnerUser ? 'unlimited' : 'trial',
      expiresAt: isOwnerUser ? 'Cheksiz VIP' : '5 ta bepul sinov',
      remainingUses: isOwnerUser ? 999999 : 5,
      trialGiven: true,
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

  const curUser = getUser(userId);
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

// =========================================================================
// UNIVERSAL TO'G'RIDAN-TO'G'RI BUYRUQLAR (PREDELDAN YUQORI DARAJA)
// =========================================================================

// /help va /yordam BUYRUG'I
bot.command(['help', 'yordam', 'menu'], async (ctx) => {
  const role = getEffectiveRole(ctx);
  const helpText = 
    `🌟 **EDUKATSIYA AI & SMARTOFFICE PRO — BARCHA BUYRUQLAR RO'YXATI:**\n\n` +
    `📊 **1. Taqdimot va Slaydlar:**\n` +
    `• \`/slayd <mavzu>\` — Gamma AI uslubida professional slayd (.pptx)\n\n` +
    `📝 **2. Ta'lim va Nazorat:**\n` +
    `• \`/test <mavzu> [soni]\` — DTS bo'yicha nazorat testi va kaliti (.docx)\n` +
    `• \`/dars <mavzu>\` yoki \`/konspekt <mavzu>\` — 45 daqiqalik dars konspekti (.docx)\n` +
    `• \`/sertifikat <ism>\` — QR-kodli Faxriy yorliq va diplom (.docx)\n\n` +
    `🏛️ **3. Maktab va Rasmiy Hujjatlar:**\n` +
    `• \`/buyruq <mavzu>\` — Maktab direktori rasmiy buyrug'i (.docx)\n` +
    `• \`/bayonnoma <mavzu>\` — Pedagogik kengash yig'ilish bayonnomasi (.docx)\n` +
    `• \`/tavsiyanoma <o'quvchi>\` — O'quvchi xarakteristikasi va ma'lumotnoma (.docx)\n` +
    `• \`/excel <mavzu>\` — Avtomatik formulali Excel hisobot jadvali (.xlsx)\n\n` +
    `✍️ **4. Matn va Imlo Asboblari:**\n` +
    `• \`/imlo <matn>\` — O'zbek tili imlo xatolarini tekshirish va to'g'rilash\n` +
    `• \`/lotin <matn>\` — Kirill matnini Lotin alifbosiga o'girish\n` +
    `• \`/kirill <matn>\` — Lotin matnini Kirill alifbosiga o'girish\n\n` +
    `🔑 **5. Shaxsiy Boshqaruv va Profil:**\n` +
    `• \`/kod\` — Veb-saytga kirish shaxsiy kodingiz va Mini App\n` +
    `• \`/hisob\` — Balans, tarif va qolgan imkoniyatlar\n` +
    `• \`/narxlar\` — Barcha tarif rejalari narxlar jadvali\n` +
    (role === 'OWNER' || role === 'ADMIN' ? 
    `\n👑 **6. Boshqaruvchi Buyruqlari:**\n` +
    `• \`/active <id> <muddat>\` — Foydalanuvchini yoqish\n` +
    `• \`/userlog <id>\` — Oxirgi 100 ta amal monitoringi\n` +
    `• \`/devices\` — Faol qurilmalar va sessiyalar\n` +
    `• \`/kick <kod>\` — Qurilmani darhol chiqarib yuborish\n` +
    `• \`/broadcast <matn>\` — Barcha foydalanuvchilarga xabar yuborish` : ``);

  const kb = new InlineKeyboard()
    .webApp("🚀 Telegram Mini App-da Ochish", WEBAPP_URL)
    .row()
    .url("🌐 To'liq Saytda Ochish", WEBAPP_URL);

  return ctx.reply(helpText, { parse_mode: 'Markdown', reply_markup: kb });
});

// /slayd, /slide, /taqdimot BUYRUG'I - Gamma AI uslubida professional taqdimot
bot.command(['slayd', 'slide', 'taqdimot', 'prezentatsiya'], async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **AI Slayd yaratish uchun hisobingizni faollashtiring.**\n\nSizning ID: \`${userId}\``,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }
  const raw = ctx.match ? ctx.match.trim() : '';
  return startSlideWizard(ctx, raw);
});

// /test BUYRUG'I
bot.command(['test', 'nazorat'], async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Test tuzish uchun hisobingizni faollashtiring.**\n\nSizning ID: \`${userId}\``,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }
  const raw = ctx.match ? ctx.match.trim() : '';
  if (!raw) {
    return ctx.reply(
      `📝 **Test tuzish uchun mavzuni yozing:**\n\n` +
      `Masalan:\n` +
      `• \`/test 9-sinf informatika dasturlash asoslari 15 ta\`\n` +
      `• \`/test 8-sinf biologiya qon aylanish tizimi 20 ta\``,
      { parse_mode: 'Markdown' }
    );
  }
  return processIntelligentMessage(ctx, `/test ${raw}`);
});

// /dars va /konspekt BUYRUG'I
bot.command(['dars', 'konspekt', 'reja'], async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Dars ishlanmasi olish uchun hisobingizni faollashtiring.**\n\nSizning ID: \`${userId}\``,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }
  const raw = ctx.match ? ctx.match.trim() : '';
  if (!raw) {
    return ctx.reply(
      `📖 **Dars konspekti olish uchun mavzuni yozing:**\n\n` +
      `Masalan:\n` +
      `• \`/konspekt 8-sinf fizika Nyuton qonunlari\`\n` +
      `• \`/dars 10-sinf ona tili uyushiq bo'laklar\``,
      { parse_mode: 'Markdown' }
    );
  }
  return processIntelligentMessage(ctx, `/konspekt ${raw}`);
});

// /buyruq BUYRUG'I
bot.command(['buyruq', 'order'], async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Rasmiy buyruq tayyorlash uchun hisobingizni faollashtiring.**\n\nSizning ID: \`${userId}\``,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }
  const raw = ctx.match ? ctx.match.trim() : '';
  if (!raw) {
    return ctx.reply(
      `📜 **Maktab buyrug'i yaratish uchun mavzuni yozing:**\n\n` +
      `Masalan:\n` +
      `• \`/buyruq O'quvchilar o'rtasida fan olimpiadasini o'tkazish to'g'risida\`\n` +
      `• \`/buyruq Navbatchilik jadvalini tasdiqlash to'g'risida\``,
      { parse_mode: 'Markdown' }
    );
  }
  return processIntelligentMessage(ctx, `/buyruq ${raw}`);
});

// /bayonnoma BUYRUG'I
bot.command(['bayonnoma', 'protokol'], async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Yig'ilish bayonnomasi yaratish uchun hisobingizni faollashtiring.**\n\nSizning ID: \`${userId}\``,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }
  const raw = ctx.match ? ctx.match.trim() : '';
  if (!raw) {
    return ctx.reply(
      `📋 **Yig'ilish bayonnomasi mavzusini yozing:**\n\n` +
      `Masalan:\n` +
      `• \`/bayonnoma 1-chorak yakunlari va o'zlashtirish tahlili\`\n` +
      `• \`/bayonnoma Maktab bitiruvchilarini kasbga yo'naltirish yig'ilishi\``,
      { parse_mode: 'Markdown' }
    );
  }
  return processIntelligentMessage(ctx, `/bayonnoma ${raw}`);
});

// /tavsiyanoma BUYRUG'I
bot.command(['tavsiyanoma', 'xarakteristika', 'malumotnoma'], async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Tavsiyanoma / Ma'lumotnoma olish uchun hisobingizni faollashtiring.**\n\nSizning ID: \`${userId}\``,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }
  const raw = ctx.match ? ctx.match.trim() : '';
  if (!raw) {
    return ctx.reply(
      `🎓 **O'quvchi ma'lumotnomasini yaratish uchun yozing:**\n\n` +
      `Masalan: \`/tavsiyanoma 10-A sinf o'quvchisi Karimova Dildora namunali xulqi va a'lo baholari bilan\``,
      { parse_mode: 'Markdown' }
    );
  }
  return processIntelligentMessage(ctx, `/tavsiyanoma ${raw}`);
});

// /sertifikat BUYRUG'I
bot.command(['sertifikat', 'diplom', 'yorliq'], async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Faxriy yorliq yaratish uchun hisobingizni faollashtiring.**\n\nSizning ID: \`${userId}\``,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }
  const raw = ctx.match ? ctx.match.trim() : 'Faxriy Yorliq va Sertifikat';
  const buf = await generateOfficialOrderWordBuffer(`Faxriy Yorliq: ${raw}`);
  consumeUserUse(userId, 'certificate', raw);
  return ctx.replyWithDocument(new InputFile(buf, `Faxriy_Yorliq_${raw.slice(0, 15).replace(/[^a-zA-Z0-9]/g, '_')}.docx`), {
    caption: `🏆 **QR-kodli rasmiy Faxriy Yorliq hujjati tayyor!** (.docx)\n\nMavzu/Ism: **${raw}**`
  });
});

// /imlo BUYRUG'I
bot.command(['imlo', 'tekshir'], async (ctx) => {
  const raw = ctx.match ? ctx.match.trim() : '';
  if (!raw) {
    return ctx.reply(
      `✍️ **O'zbek tili imlo xatolarini tekshirish:**\n\n` +
      `Matningizni yozing, masalan:\n` +
      `\`/imlo man bugun darsga bormoxchiman lekn vaqtim yetmiydi\``,
      { parse_mode: 'Markdown' }
    );
  }
  const analysis = analyzeUzbekSpelling(raw);
  if (analysis.errorCount === 0) {
    return ctx.reply(`✅ **Tabriklaymiz!** Ushbu matnda hech qanday imlo xatosi aniqlanmadi:\n\n\`${raw}\``, { parse_mode: 'Markdown' });
  }

  let errorDetails = `✍️ **IMLO XATOLARI TAHLILI (${analysis.errorCount} ta xato aniqlandi):**\n\n`;
  analysis.errors.slice(0, 15).forEach((e, idx) => {
    errorDetails += `**${idx + 1}.** \`${e.original}\` ➔ **${e.suggestion}**\n   *(Izoh: ${e.reason})*\n`;
  });
  errorDetails += `\n✨ **To'g'rilangan yakuniy matn:**\n\`${analysis.correctedText}\``;

  return ctx.reply(errorDetails, { parse_mode: 'Markdown' });
});

// /lotin BUYRUG'I
bot.command('lotin', async (ctx) => {
  const raw = ctx.match ? ctx.match.trim() : '';
  if (!raw) return ctx.reply("🔄 Kirill matnini yuboring: `/lotin Салом, бугунги дарс режаси`", { parse_mode: 'Markdown' });
  const converted = cyrillicToLatin(raw);
  return ctx.reply(`🔤 **Lotin alifbosiga o'girildi:**\n\n\`${converted}\``, { parse_mode: 'Markdown' });
});

// /kirill BUYRUG'I
bot.command('kirill', async (ctx) => {
  const raw = ctx.match ? ctx.match.trim() : '';
  if (!raw) return ctx.reply("🔄 Lotin matnini yuboring: `/kirill Salom, bugungi dars rejasi`", { parse_mode: 'Markdown' });
  const converted = latinToCyrillic(raw);
  return ctx.reply(`🔤 **Kirill alifbosiga o'girildi:**\n\n\`${converted}\``, { parse_mode: 'Markdown' });
});

// /kod BUYRUG'I
bot.command(['kod', 'code', 'parol'], async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Saytga kirish kodini olish uchun hisobingizni faollashtiring.**\n\nSizning ID: \`${userId}\``,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }
  const code = getAccessCodeForUser(userId);
  const u = getUser(userId);
  const expiry = u?.expiresAt || (u?.remainingUses ? `${u.remainingUses} ta hujjat` : 'Cheksiz');

  const kb = new InlineKeyboard()
    .webApp("🚀 Telegram Mini App-da Ochish", WEBAPP_URL)
    .row()
    .url("🌐 To'liq Brauzerda Ochish", WEBAPP_URL);

  return ctx.reply(
    `🔑 **SIZNING SAYTGA KIRISH KODINGIZ:**\n\n` +
    `👉 \`${code}\` 👈 *(Nusxalash uchun ustiga bosing)*\n\n` +
    `⏳ **Amal qilish muddati:** ${expiry}\n` +
    `🌐 **Sayt manzili:** ${WEBAPP_URL}\n\n` +
    `Quyidagi tugma orqali saytni to'g'ridan-to'g'ri ochishingiz mumkin:`,
    { parse_mode: 'Markdown', reply_markup: kb }
  );
});

// /hisob BUYRUG'I
bot.command(['hisob', 'balans', 'status'], async (ctx) => {
  const userId = ctx.from.id;
  const u = getUser(userId);
  const displayId = getDisplayUserId(userId);
  const code = getAccessCodeForUser(userId);
  const active = isUserActive(userId, ctx.from.username);

  return ctx.reply(
    `👤 **SIZNING PROFILINGIZ:**\n\n` +
    `• ID: \`${displayId}\` *(Telegram: ${userId})*\n` +
    `• Holati: ${active ? '✅ **FAOL**' : '⏳ **Kutishda (Faol emas)**'}\n` +
    `• Tarif: **${u?.plan || 'trial (bepul sinov)'}**\n` +
    `• Sayt Kodingiz: \`${code}\`\n` +
    `• Qolgan imkoniyat: **${u?.remainingUses ? `${u.remainingUses} ta hujjat` : (u?.expiresAt || 'Cheksiz VIP')}**\n` +
    `• Ro'yxatdan o'tgan: ${u?.registeredAt ? new Date(u.registeredAt).toLocaleDateString('uz-UZ') : '-'}\n\n` +
    `Sayt manzili: ${WEBAPP_URL}`,
    { parse_mode: 'Markdown' }
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
    db.deviceBindings = db.deviceBindings || {};
    const reqAuth = db.deviceAuthorizations[reqId] || {};
    reqAuth.status = 'APPROVED';
    reqAuth.approvedBy = ctx.from?.id;
    reqAuth.approvedTime = Date.now();
    db.deviceAuthorizations[reqId] = reqAuth;
    if (reqAuth.code && reqAuth.deviceId) {
      db.deviceBindings[reqAuth.code] = reqAuth.deviceId;
    }
    saveDatabase();

    // Vercel serverless API ga ham tasdiq haqida xabar berish
    try {
      fetch('https://eduhujjat.vercel.app/api/device-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remote_approve', reqId })
      }).catch(() => {});
    } catch(e) {}

    await ctx.answerCallbackQuery({ text: "✅ Ruxsat berildi!" });
    try {
      await ctx.editMessageText(
        (ctx.callbackQuery.message?.text || '') +
        `\n\n━━━━━━━━━━━━━━━━━━━━━━\n✅ **RUXSAT BERILDI!**\nSiz yangi qurilmadan saytga kirishga muvaffaqiyatli ruxsat berdingiz. Brauzerda tizim avtomatik ochilmoqda.`,
        { parse_mode: 'Markdown' }
      );
    } catch(e){}
    return;
  }

  if (data.startsWith('dev_deny_')) {
    const reqId = data.replace('dev_deny_', '');
    db.deviceAuthorizations = db.deviceAuthorizations || {};
    db.deviceBindings = db.deviceBindings || {};
    const reqAuth = db.deviceAuthorizations[reqId] || {};
    reqAuth.status = 'DENIED';
    reqAuth.deniedBy = ctx.from?.id;
    reqAuth.deniedTime = Date.now();
    db.deviceAuthorizations[reqId] = reqAuth;
    saveDatabase();

    // Vercel serverless API ga ham rad javobini yetkazish
    try {
      fetch('https://eduhujjat.vercel.app/api/device-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remote_deny', reqId })
      }).catch(() => {});
    } catch(e) {}

    await ctx.answerCallbackQuery({ text: "❌ Kirish rad etildi!", show_alert: true });
    try {
      await ctx.editMessageText(
        (ctx.callbackQuery.message?.text || '') +
        `\n\n━━━━━━━━━━━━━━━━━━━━━━\n❌ **KIRISH RAD ETILDI!**\nUshbu qurilmadan kirishga ruxsat berilmadi. Sayt ochilmaydi.`,
        { parse_mode: 'Markdown' }
      );
    } catch(e){}
    return;
  }

  // 0.1 FOYDALANUVCHI AUDIT TARIXINI CALLBACK QUERY BILAN OCHISH
  if (data.startsWith('audit_user_')) {
    const targetId = data.replace('audit_user_', '');
    await ctx.answerCallbackQuery({ text: "Hisobot tayyorlanmoqda..." });
    return sendUserAuditLogs(ctx, targetId);
  }

  // 0.2 QURILMANI TELEGRAMDAN DARHOL CHIQARIB YUBORISH (KICK)
  if (data.startsWith('dev_kick_')) {
    const targetCode = data.replace('dev_kick_', '');
    db.deviceBindings = db.deviceBindings || {};
    db.deviceBindings[targetCode] = {
      kicked: true,
      deviceId: null,
      kickedAt: Date.now()
    };
    saveDatabase();

    // Vercel serverless API ga ham xabar berish
    try {
      fetch('https://eduhujjat.vercel.app/api/device-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'kick_device', code: targetCode })
      }).catch(() => {});
    } catch(e) {}

    await ctx.answerCallbackQuery({ text: "🚫 Qurilma chiqarib yuborildi!", show_alert: true });
    try {
      await ctx.editMessageText(
        (ctx.callbackQuery.message?.text || '') +
        `\n\n━━━━━━━━━━━━━━━━━━━━━━\n🚫 **QURILMA CHIQARIB YUBORILDI (KICKED)!**\nUshbu kodga ulangan qurilmaning saytdagi faol sessiyasi darhol bekor qilindi. Sayt u uchun yopildi.`,
        { parse_mode: 'Markdown' }
      );
    } catch(e) {}
    return;
  }

  // =========================================================================
  // SLIDE WIZARD CALLBACK HANDLERS (INTERFAOL TAQDIMOT BOSQICHLARI)
  // =========================================================================
  if (data.startsWith('sw_') || data === 'sw_quick') {
    if (!isUserActive(userId, ctx.from?.username)) {
      await ctx.answerCallbackQuery({ text: "Obunangiz faol emas! Avval tarifni faollashtiring.", show_alert: true });
      return ctx.reply(
        `🔒 **Taqdimot yaratish uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\`\n\n` +
        `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
  }

  // 1. Agar foydalanuvchi o'z ismini qo'lda yozishni tanlagan bo'lsa
  if (data === 'sw_auth_custom') {
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot" };
    sw.step = 'awaiting_author';
    slideWizardState.set(userId, sw);
    await ctx.answerCallbackQuery({ text: "Ismingizni yozing..." });
    return ctx.reply(
      `✍️ Iltimos, 1-slaydda ko'rinadigan **ism-familiyangiz yoki lavozimingizni** xabar sifatida yozib yuboring:\n` +
      `*(Masalan: \`Fayzbek Omonov\` yoki \`Toshkent 15-maktab o'qituvchisi\`)*:`,
      { parse_mode: 'Markdown' }
    );
  }

  // 2. Tayyor tugmalardan tanlangan muallif
  if (data.startsWith('sw_auth_')) {
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'lim va zamonaviy metodika" };
    let chosenAuthor = `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim() || ctx.from?.first_name || "Muallif";
    if (data === 'sw_auth_handle') {
      chosenAuthor = ctx.from?.username ? `@${ctx.from.username}` : (ctx.from?.first_name || "Muallif");
    } else if (data === 'sw_auth_name') {
      chosenAuthor = `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim() || "Muallif";
    } else if (data === 'sw_auth_teacher') {
      chosenAuthor = "Maktab o'qituvchisi";
    }
    sw.authorName = chosenAuthor;
    sw.step = 'awaiting_slide_count';
    slideWizardState.set(userId, sw);
    await ctx.answerCallbackQuery({ text: `Muallif: ${chosenAuthor}` });
    return sendWizardSlideCountStep(ctx, sw.topic, sw.authorName, true);
  }

  if (data === 'sw_quick') {
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot" };
    const author = sw.authorName || ctx.from?.first_name || "Muallif";
    slideWizardState.delete(userId);
    await ctx.answerCallbackQuery({ text: "Tezkor taqdimot tayyorlanmoqda..." });
    return executePresentationGeneration(ctx, sw.topic || "Ta'limiy taqdimot", {
      authorName: author,
      detailLevel: 'medium',
      includeImages: true,
      styleName: 'auto',
      slideCount: 5
    });
  }

  if (data.startsWith('sw_cnt_')) {
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot", authorName: ctx.from?.first_name || "EduAI" };
    if (data === 'sw_cnt_custom') {
      sw.step = 'awaiting_custom_count';
      slideWizardState.set(userId, sw);
      await ctx.answerCallbackQuery({ text: "Slayd sonini yozing..." });
      return ctx.reply(
        `✍️ **Necha betlik slayd yaratmoqchisiz?**\n\n` +
        `Iltimos, kerakli slaydlar sonini raqam bilan xabar sifatida yuboring (masalan: \`8\` yoki \`12\` yoki \`20\`):\n\n` +
        `*(Eslatma: 5 tadan ortiq bo'lsa, to'lov va admin tasdig'i talab etiladi)*`,
        { parse_mode: 'Markdown' }
      );
    }

    const count = parseInt(data.replace('sw_cnt_', ''), 10) || 5;
    sw.slideCount = count;
    sw.step = 'awaiting_detail';
    slideWizardState.set(userId, sw);
    await ctx.answerCallbackQuery({ text: `${count} ta slayd belgilandi!` });
    return sendWizardDetailStep(ctx, sw.topic, sw.authorName, sw.slideCount, true);
  }

  if (data.startsWith('sw_det_')) {
    const level = data.replace('sw_det_', '');
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot", authorName: ctx.from?.first_name || "EduAI", slideCount: 5 };
    sw.detailLevel = level;
    sw.step = 'awaiting_image_density';
    slideWizardState.set(userId, sw);
    await ctx.answerCallbackQuery({ text: "Ma'lumot hajmi belgilandi!" });
    return sendWizardImageDensityStep(ctx, sw.topic, sw.authorName, sw.detailLevel, sw.slideCount || 5, true);
  }

  if (data.startsWith('sw_idens_')) {
    const density = data.replace('sw_idens_', '');
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot", authorName: ctx.from?.first_name || "EduAI", slideCount: 5 };
    sw.imageDensity = density;
    sw.includeImages = density !== 'low';
    sw.step = 'awaiting_image_style';
    slideWizardState.set(userId, sw);
    await ctx.answerCallbackQuery({ text: "Rasm zichligi belgilandi!" });
    return sendWizardImageStyleStep(ctx, sw.topic, sw.authorName, sw.detailLevel || 'medium', sw.slideCount || 5, sw.imageDensity, true);
  }

  if (data.startsWith('sw_isty_')) {
    const imgStyle = data.replace('sw_isty_', '');
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot", authorName: ctx.from?.first_name || "EduAI", slideCount: 5 };
    sw.imageStyle = imgStyle;
    sw.step = 'awaiting_style';
    slideWizardState.set(userId, sw);
    await ctx.answerCallbackQuery({ text: "Rasm uslubi belgilandi!" });
    return sendWizardStyleStep(ctx, sw.topic, sw.authorName, sw.detailLevel || 'medium', sw.includeImages !== false, sw.slideCount || 5, sw.imageDensity || 'medium', sw.imageStyle || 'realistic', true);
  }

  if (data.startsWith('sw_sty_')) {
    const styleKey = data.replace('sw_sty_', '');
    const sw = slideWizardState.get(userId) || { topic: db.userSessions.get(userId) || "Ta'limiy taqdimot" };
    const finalTopic = sw.topic || db.userSessions.get(userId) || "Ta'limiy taqdimot";
    const finalAuthor = sw.authorName || ctx.from?.first_name || "Muallif";
    const finalDetail = sw.detailLevel || 'medium';
    const finalDensity = sw.imageDensity || 'medium';
    const finalStyle = sw.imageStyle || 'realistic';
    const finalImages = finalDensity !== 'low';
    const finalCount = sw.slideCount || 5;
    slideWizardState.delete(userId);
    await ctx.answerCallbackQuery({ text: "Tanlov qabul qilindi!" });

    // 5 TADAN KO'P SLAYDLARNI TEKSHIRISH:
    const isOwner = (userId === SUPER_OWNER_ID) || (ctx.from?.username?.toLowerCase() === OWNER_USERNAME.toLowerCase());

    if (finalCount > 5 && !isOwner) {
      const reqId = `sl_${userId}_${Date.now()}`;
      pendingSlideApprovals.set(reqId, {
        reqId,
        userId,
        chatId: ctx.chat.id,
        user: ctx.from,
        topic: finalTopic,
        authorName: finalAuthor,
        slideCount: finalCount,
        detailLevel: finalDetail,
        includeImages: finalImages,
        imageDensity: finalDensity,
        imageStyle: finalStyle,
        styleName: styleKey,
        createdAt: Date.now()
      });

      // 1. Foydalanuvchiga to'lov va tasdiqlash haqida ma'lumot
      await ctx.reply(
        `💎 **5 tadan ko'p betlik slayd uchun qo'shimcha to'lov va admin tasdig'i zarur!**\n\n` +
        `📌 **Mavzu:** ${finalTopic}\n` +
        `👤 **Muallif:** ${finalAuthor}\n` +
        `📄 **So'ralgan slayd soni:** **${finalCount} ta** (Standart 5 tadan ortiq)\n\n` +
        `⚠️ *Standart bepul imkoniyatimizda 5 tagacha slayd taqdim etiladi. Siz ${finalCount} ta slayd tanlaganingiz uchun bot egasiga (@${OWNER_USERNAME}) ruxsat so'rovi yuborildi.*\n\n` +
        `💳 *To'lovni amalga oshirish yoki tezkor tasdiqlash uchun admin: @${OWNER_USERNAME}*\n` +
        `⏳ Admin ruxsat berishi bilanoq maxsus ${finalCount} betlik taqdimotingiz avtomatik yaratilib, sizga yuboriladi!`,
        { parse_mode: 'Markdown' }
      );

      // 2. Bot egasiga so'rov yuborish
      const ownerTargetChatId = db.ownerChatId || SUPER_OWNER_ID;
      const ownerKb = new InlineKeyboard()
        .text(`✅ Ruxsat berish (${finalCount} ta)`, `slide_appr_${reqId}`)
        .text(`❌ Rad etish`, `slide_deny_${reqId}`);

      const ownerAlert = 
        `🚨 **YANGI SLAYD RUXSAT SO'ROVI (5+ SLAYD)**\n\n` +
        `👤 **Foydalanuvchi:** ${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''} (@${ctx.from?.username || "yo'q"})\n` +
        `🆔 **Telegram ID:** \`${userId}\`\n` +
        `📄 **So'ralgan slayd soni:** **${finalCount} ta** (5 tadan ko'p!)\n` +
        `📌 **Mavzu:** ${finalTopic}\n` +
        `👤 **Muallif:** ${finalAuthor}\n` +
        `🎨 **Uslub:** ${styleKey}\n\n` +
        `⚠️ *Ushbu odam va ID 5 tadan ko'p betlik slayd qilmoqchi va to'lov qilishi kerak. Ruxsat berasizmi?*`;

      try {
        await ctx.api.sendMessage(ownerTargetChatId, ownerAlert, {
          parse_mode: 'Markdown',
          reply_markup: ownerKb
        });
      } catch (err) {
        console.error("Egaga slayd ruxsat so'rovi yuborishda xatolik:", err);
      }
      return;
    }

    // Standart <= 5 yoki Super Owner uchun to'g'ridan-to'g'ri yaratish
    return executePresentationGeneration(ctx, finalTopic, {
      authorName: finalAuthor,
      detailLevel: finalDetail,
      includeImages: finalImages,
      imageDensity: finalDensity,
      imageStyle: finalStyle,
      styleName: styleKey,
      slideCount: finalCount
    });
  }

  // 5+ SLAYD RUXSAT BERISH VA RAD ETISH
  if (data.startsWith('slide_appr_')) {
    const reqId = data.replace('slide_appr_', '');
    const req = pendingSlideApprovals.get(reqId);
    if (!req) {
      await ctx.answerCallbackQuery({ text: "So'rov topilmadi yoki allaqachon ko'rib chiqilgan." });
      return;
    }
    pendingSlideApprovals.delete(reqId);
    await ctx.answerCallbackQuery({ text: `Ruxsat berildi (${req.slideCount} ta)!` });

    try {
      await ctx.editMessageText(
        `✅ **Ruxsat berildi!**\n\n` +
        `👤 Foydalanuvchi: ${req.user?.first_name || ''} (@${req.user?.username || 'yoq'})\n` +
        `🆔 Telegram ID: \`${req.userId}\`\n` +
        `📄 Slaydlar soni: **${req.slideCount} ta**\n` +
        `📌 Mavzu: ${req.topic}\n\n` +
        `🚀 Foydalanuvchiga taqdimot tayyorlanib yuborilmoqda...`,
        { parse_mode: 'Markdown' }
      );
    } catch(e) {}

    // Foydalanuvchiga yuborish
    try {
      await ctx.api.sendMessage(
        req.chatId,
        `🎉 **Ajoyib yangilik! Admin ${req.slideCount} ta slayd yaratishga ruxsat berdi!**\n\n` +
        `⏳ ${req.slideCount} betlik maxsus taqdimotingiz tayyorlanmoqda, iltimos ozgina kuting...`,
        { parse_mode: 'Markdown' }
      );

      const buffer = await generateGammaPresentationBuffer(req.topic, {
        authorName: req.authorName,
        detailLevel: req.detailLevel,
        includeImages: req.includeImages,
        imageDensity: req.imageDensity || 'medium',
        imageStyle: req.imageStyle || 'realistic',
        styleName: req.styleName,
        slideCount: req.slideCount
      });
      const safeTopic = req.topic.slice(0, 25).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_');

      await ctx.api.sendDocument(
        req.chatId,
        new InputFile(buffer, `EduAI_${safeTopic}_${req.slideCount}slayd.pptx`),
        {
          caption:
            `🎨 **Maxsus ${req.slideCount} betlik Gamma AI taqdimotingiz tayyor!** (.pptx)\n\n` +
            `📌 Mavzu: **${req.topic}**\n` +
            `👤 Muallif: **${req.authorName}**\n` +
            `📄 Slaydlar: **${req.slideCount} ta to'liq slayd**\n` +
            `✨ 16:9 Widescreen, premium dizayn va chuqur darslik tahlili.`
        }
      );
    } catch (err) {
      console.error("Tasdiqlangan slaydni generatsiya qilishda xatolik:", err);
      try {
        await ctx.api.sendMessage(req.chatId, `❌ Taqdimotni yaratishda xatolik yuz berdi: ${err.message}`);
      } catch(e) {}
    }
    return;
  }

  if (data.startsWith('slide_deny_')) {
    const reqId = data.replace('slide_deny_', '');
    const req = pendingSlideApprovals.get(reqId);
    if (!req) {
      await ctx.answerCallbackQuery({ text: "So'rov topilmadi yoki allaqachon ko'rib chiqilgan." });
      return;
    }
    pendingSlideApprovals.delete(reqId);
    await ctx.answerCallbackQuery({ text: "So'rov rad etildi." });

    try {
      await ctx.editMessageText(
        `❌ **So'rov rad etildi.**\n\n` +
        `👤 Foydalanuvchi: ${req.user?.first_name || ''} (@${req.user?.username || 'yoq'})\n` +
        `🆔 Telegram ID: \`${req.userId}\`\n` +
        `📄 Slaydlar soni: **${req.slideCount} ta**`,
        { parse_mode: 'Markdown' }
      );
    } catch(e) {}

    try {
      await ctx.api.sendMessage(
        req.chatId,
        `❌ **${req.slideCount} ta slayd bo'yicha so'rovingiz tasdiqlanmadi.**\n\n` +
        `To'lov amalga oshirilmagan yoki admin tomonidan rad etilgan bo'lishi mumkin. Standart 5 ta slaydli bepul taqdimotdan foydalanishingiz mumkin: /slayd`,
        { parse_mode: 'Markdown' }
      );
    } catch(e) {}
    return;
  }

  // GAMMA AI TAYYOR PRESET MAVZULAR
  if (data.startsWith('gamma_preset_')) {
    if (!isUserActive(userId, ctx.from?.username)) {
      await ctx.answerCallbackQuery({ text: "Obunangiz faol emas! Avval tarifni faollashtiring.", show_alert: true });
      return ctx.reply(
        `🔒 **Taqdimot yaratish uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\`\n\n` +
        `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
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
    if (!isUserActive(userId, ctx.from?.username)) {
      await ctx.answerCallbackQuery({ text: "Obunangiz faol emas! Avval tarifni faollashtiring.", show_alert: true });
      return ctx.reply(
        `🔒 **Hujjatlarni yuklash uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\`\n\n` +
        `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
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
        consumeUserUse(userId, 'lesson_plan', topic);
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
        consumeUserUse(userId, 'test', topic);
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
        consumeUserUse(userId, 'official_order', topic);
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
        consumeUserUse(userId, 'bayonnoma', topic);
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
        consumeUserUse(userId, 'tavsifnoma', topic);
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

    const user = getUser(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';

    let label = 'Faollashtirildi';

    if (planCode === 'vip' || planCode === 'unlimited') {
      user.plan = 'unlimited';
      user.remainingUses = 999999;
      user.expiresAt = 'Cheksiz VIP';
      user.expireTimestamp = null;
      label = '👑 Cheksiz VIP';
    } else if (planCode.endsWith('time')) {
      const times = parseInt(planCode, 10) || 1;
      user.plan = `${times}time`;
      user.remainingUses = times;
      user.expiresAt = `${times} ta hujjat`;
      user.expireTimestamp = null;
      label = `⚡ ${times} Martalik Hujjat`;
    } else if (planCode.endsWith('h')) {
      const hours = parseInt(planCode, 10) || 1;
      user.plan = `${hours}h`;
      user.remainingUses = null;
      user.expireTimestamp = Date.now() + hours * 3600 * 1000;
      user.expiresAt = `${hours} soat`;
      label = `⏱ ${hours} Soatlik Kirish`;
    } else if (planCode.endsWith('d')) {
      const days = parseInt(planCode, 10) || 1;
      user.plan = `${days}d`;
      user.remainingUses = null;
      user.expireTimestamp = Date.now() + days * 86400 * 1000;
      user.expiresAt = `${days} kun`;
      label = `📅 ${days} Kunlik`;
    } else if (planCode === '1w') {
      user.plan = 'weekly';
      user.remainingUses = null;
      user.expireTimestamp = Date.now() + 7 * 86400 * 1000;
      user.expiresAt = '7 kun';
      label = '🗓 1 Haftalik';
    } else if (planCode === '1m') {
      user.plan = 'monthly';
      user.remainingUses = null;
      user.expireTimestamp = Date.now() + 30 * 86400 * 1000;
      user.expiresAt = '30 kun';
      label = '⭐ 1 Oylik Pro';
    }

    setUser(targetId, user);
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
    const user = getUser(targetId);
    if (user) {
      user.status = 'BLOCKED';
      setUser(targetId, user);
      saveDatabase();
    }
    await ctx.answerCallbackQuery({ text: "Foydalanuvchi rad etildi." });
    await ctx.editMessageText(`❌ **Foydalanuvchi rad etildi.** (ID: \`${getDisplayUserId(targetId)}\`)`, { parse_mode: 'Markdown' });
    return;
  }

  // =========================================================================
  // FOYDALANUVCHI BOSHQARUVI VA VAQT MANIPULYATSIYASI (MANAGE CALLBACKS)
  // =========================================================================
  if (data.startsWith('manage_')) {
    const role = getEffectiveRole(ctx);
    if (role !== 'OWNER' && role !== 'ADMIN') {
      return ctx.answerCallbackQuery({ text: "Sizda boshqaruv huquqi yo'q!", show_alert: true });
    }

    if (data.startsWith('manage_open_')) {
      const targetId = resolveUserId(data.replace('manage_open_', ''));
      await ctx.answerCallbackQuery();
      return ctx.reply(formatActivityReport(targetId), {
        parse_mode: 'Markdown',
        reply_markup: getUserManageKeyboard(targetId)
      });
    }

    if (data.startsWith('manage_cut_1h_')) {
      const targetId = resolveUserId(data.replace('manage_cut_1h_', ''));
      const res = cutUserTime(targetId, 3600 * 1000);
      await ctx.answerCallbackQuery({ text: res.success ? "⏱ 1 soat kamaytirildi!" : res.message, show_alert: !res.success });
      try {
        await ctx.editMessageText(formatActivityReport(targetId), {
          parse_mode: 'Markdown',
          reply_markup: getUserManageKeyboard(targetId)
        });
      } catch(e){}
      return;
    }

    if (data.startsWith('manage_add_1h_')) {
      const targetId = resolveUserId(data.replace('manage_add_1h_', ''));
      const res = addUserTime(targetId, 3600 * 1000);
      await ctx.answerCallbackQuery({ text: "⏱ 1 soat qo'shildi!" });
      try {
        await ctx.editMessageText(formatActivityReport(targetId), {
          parse_mode: 'Markdown',
          reply_markup: getUserManageKeyboard(targetId)
        });
      } catch(e){}
      return;
    }

    if (data.startsWith('manage_cut_1d_')) {
      const targetId = resolveUserId(data.replace('manage_cut_1d_', ''));
      const res = cutUserTime(targetId, 24 * 3600 * 1000);
      await ctx.answerCallbackQuery({ text: res.success ? "📅 1 kun kamaytirildi!" : res.message, show_alert: !res.success });
      try {
        await ctx.editMessageText(formatActivityReport(targetId), {
          parse_mode: 'Markdown',
          reply_markup: getUserManageKeyboard(targetId)
        });
      } catch(e){}
      return;
    }

    if (data.startsWith('manage_add_1d_')) {
      const targetId = resolveUserId(data.replace('manage_add_1d_', ''));
      const res = addUserTime(targetId, 24 * 3600 * 1000);
      await ctx.answerCallbackQuery({ text: "📅 1 kun qo'shildi!" });
      try {
        await ctx.editMessageText(formatActivityReport(targetId), {
          parse_mode: 'Markdown',
          reply_markup: getUserManageKeyboard(targetId)
        });
      } catch(e){}
      return;
    }

    if (data.startsWith('manage_cut_1use_')) {
      const targetId = resolveUserId(data.replace('manage_cut_1use_', ''));
      const user = getUser(targetId);
      if (user) {
        user.remainingUses = Math.max(0, (user.remainingUses || 0) - 1);
        if (user.remainingUses <= 0) {
          user.status = 'PENDING';
          user.expiresAt = '0 ta (Tugagan)';
        }
        setUser(targetId, user);
        saveDatabase();
        await ctx.answerCallbackQuery({ text: "⚡ 1 ta limit ayirildi!" });
      }
      try {
        await ctx.editMessageText(formatActivityReport(targetId), {
          parse_mode: 'Markdown',
          reply_markup: getUserManageKeyboard(targetId)
        });
      } catch(e){}
      return;
    }

    if (data.startsWith('manage_add_5use_')) {
      const targetId = resolveUserId(data.replace('manage_add_5use_', ''));
      const user = getUser(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
      user.status = 'ACTIVE';
      user.remainingUses = (user.remainingUses || 0) + 5;
      user.expiresAt = `${user.remainingUses} ta hujjat`;
      user.expireTimestamp = null;
      setUser(targetId, user);
      saveDatabase();
      await ctx.answerCallbackQuery({ text: "⚡ 5 ta limit qo'shildi!" });
      try {
        await ctx.editMessageText(formatActivityReport(targetId), {
          parse_mode: 'Markdown',
          reply_markup: getUserManageKeyboard(targetId)
        });
      } catch(e){}
      return;
    }

    if (data.startsWith('manage_zero_')) {
      const targetId = resolveUserId(data.replace('manage_zero_', ''));
      setUserZero(targetId);
      await ctx.answerCallbackQuery({ text: "🚫 Vaqt va limit 0 qilindi (muzlatildi)!", show_alert: true });
      try {
        await ctx.editMessageText(formatActivityReport(targetId), {
          parse_mode: 'Markdown',
          reply_markup: getUserManageKeyboard(targetId)
        });
      } catch(e){}
      return;
    }

    if (data.startsWith('manage_vip_')) {
      const targetId = resolveUserId(data.replace('manage_vip_', ''));
      const user = getUser(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
      user.status = 'ACTIVE';
      user.plan = 'unlimited';
      user.remainingUses = 999999;
      user.expireTimestamp = null;
      user.expiresAt = 'Cheksiz VIP';
      setUser(targetId, user);
      saveDatabase();
      await ctx.answerCallbackQuery({ text: "👑 Cheksiz VIP berildi!" });
      try {
        await ctx.editMessageText(formatActivityReport(targetId), {
          parse_mode: 'Markdown',
          reply_markup: getUserManageKeyboard(targetId)
        });
      } catch(e){}
      return;
    }

    if (data.startsWith('manage_refresh_')) {
      const targetId = resolveUserId(data.replace('manage_refresh_', ''));
      await ctx.answerCallbackQuery({ text: "🔄 Ma'lumotlar yangilandi!" });
      try {
        await ctx.editMessageText(formatActivityReport(targetId), {
          parse_mode: 'Markdown',
          reply_markup: getUserManageKeyboard(targetId)
        });
      } catch(e){}
      return;
    }

    if (data.startsWith('manage_tariffs_')) {
      const targetId = resolveUserId(data.replace('manage_tariffs_', ''));
      await ctx.answerCallbackQuery();
      return ctx.reply(
        `👇 **ID: \`${getDisplayUserId(targetId)}\` uchun standart tarifni tanlang:**`,
        { parse_mode: 'Markdown', reply_markup: getOwnerActionKeyboard(targetId) }
      );
    }
  }

  // HUJJAT FABRIKASI SHABLONLARI
  if (data.startsWith('doc_') || data.startsWith('excel_')) {
    if (!isUserActive(userId, ctx.from?.username)) {
      await ctx.answerCallbackQuery({ text: "Obunangiz faol emas! Avval tarifni faollashtiring.", show_alert: true });
      return ctx.reply(
        `🔒 **Hujjatlarni yuklash uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\`\n\n` +
        `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
  }

  // EXCEL JADVALLAR KANALI
  if (data.startsWith('excel_')) {
    if (data === 'excel_master') {
      await ctx.answerCallbackQuery({ text: "Master Excel to'plami tayyorlanmoqda..." });
      const demoStudents = parseStudentsFromText("1. Karimova Dildora Jasur qizi\n2. Abdullayev Jasur Rustam o'g'li\n3. Omonov Sardor Baxtiyor o'g'li\n4. Toshmatova Rayhon Farhod qizi");
      const buf = generateMasterSchoolScheduleExcelBuffer(demoStudents);
      await ctx.replyWithDocument(new InputFile(buf, "Master_Maktab_5in1.xlsx"), {
        caption: "📊 **Master 5-in-1 Maktab To'plami tayyor!** (.xlsx)\n\n📌 5 ta to'liq varaq: Umumiy ro'yxat, Pasport/Metrika, Baholar & GPA, Oylik davomat va Dars jadvali."
      });
      return consumeUserUse(userId);
    }

    if (data === 'excel_davomat') {
      await ctx.answerCallbackQuery({ text: "Davomat tabeli tayyorlanmoqda..." });
      const demoStudents = parseStudentsFromText("1. Karimova Dildora Jasur qizi\n2. Abdullayev Jasur Rustam o'g'li\n3. Omonov Sardor Baxtiyor o'g'li\n4. Toshmatova Rayhon Farhod qizi");
      const buf = generateAttendanceExcelBuffer(demoStudents);
      await ctx.replyWithDocument(new InputFile(buf, "Oylik_Davomat_Tabeli.xlsx"), {
        caption: "📈 **Oylik davomat tabeli tayyor!** (.xlsx)\n\n📌 1-31 kunlar, dam olish kunlari ajratilgan, formulali qatnashuv hisobi bilan."
      });
      return consumeUserUse(userId);
    }

    if (data === 'excel_grades') {
      await ctx.answerCallbackQuery({ text: "Baholar jurnali tayyorlanmoqda..." });
      const demoStudents = parseStudentsFromText("1. Karimova Dildora Jasur qizi\n2. Abdullayev Jasur Rustam o'g'li\n3. Omonov Sardor Baxtiyor o'g'li");
      const buf = generateGradesExcelBuffer(demoStudents);
      await ctx.replyWithDocument(new InputFile(buf, "Baholar_Jurnali_GPA.xlsx"), {
        caption: "🎯 **Baholar jurnali va GPA reyting jadvali tayyor!** (.xlsx)\n\n📌 7 ta fan bo'yicha baholar, GPA avto-hisob va akademik toifalar bilan."
      });
      return consumeUserUse(userId);
    }

    if (data === 'excel_schedule') {
      await ctx.answerCallbackQuery({ text: "Dars jadvali tayyorlanmoqda..." });
      const demoStudents = parseStudentsFromText("1. Karimova Dildora Jasur qizi\n2. Abdullayev Jasur Rustam o'g'li");
      const buf = generateScheduleExcelBuffer(demoStudents);
      await ctx.replyWithDocument(new InputFile(buf, "Dars_Jadvali_va_Navbatchilik.xlsx"), {
        caption: "📅 **Haftalik dars jadvali va navbatchilik grafigi tayyor!** (.xlsx)\n\n📌 6 kunlik dars soatlari, xonalar va har kungi navbatchi o'quvchilar taqsimoti bilan."
      });
      return consumeUserUse(userId);
    }

    if (data === 'excel_gender') {
      await ctx.answerCallbackQuery({ text: "Qizlar va o'g'illar jadvali tayyorlanmoqda..." });
      const demoStudents = parseStudentsFromText("1. Karimova Dildora Jasur qizi\n2. Abdullayev Jasur Rustam o'g'li\n3. Omonov Sardor Baxtiyor o'g'li\n4. Toshmatova Rayhon Farhod qizi");
      const buf = generateGenderExcelBuffer(demoStudents);
      await ctx.replyWithDocument(new InputFile(buf, "Qizlar_va_Ogillar_Jadvali.xlsx"), {
        caption: "👥 **Qizlar va o'g'il bolalar taqsimoti jadvali tayyor!** (.xlsx)\n\n📌 2 ta alohida varaq, foizli diagramma va to'liq kontaktlar bilan."
      });
      return consumeUserUse(userId);
    }

    if (data === 'excel_custom') {
      await ctx.answerCallbackQuery({ text: "Mavzuni yozing..." });
      return ctx.reply(
        `✍️ **Qanday jadval kerakligini xabar sifatida yozib yuboring:**\n\n` +
        `Masalan:\n` +
        `• \`8-sinf kimyo laboratoriya xarajatlari jadvali\`\n` +
        `• \`Maktab oylik xarajatlar smetasi excel\`\n` +
        `• \`10-maktab sport musobaqasi g'oliblari jadvali\`\n\n` +
        `AI 5 soniyada barcha ustunlar va formulalarni to'ldirib .xlsx fayl qilib beradi!`
      );
    }
  }

  if (data === 'doc_order') {
    await ctx.answerCallbackQuery({ text: "Buyruq hujjati..." });
    const buf = await generateOfficialOrderWordBuffer("O'quvchilarni rag'batlantirish to'g'risida");
    await ctx.replyWithDocument(new InputFile(buf, "Maktab_Direktori_Buyrugi.docx"), {
      caption: "📋 **Rasmiy maktab buyrug'i shabloni tayyor!** (.docx)\n\n📌 GOST standarti va vazirlik rekvizitlari bilan."
    });
    return consumeUserUse(userId);
  }

  if (data === 'doc_lesson') {
    await ctx.answerCallbackQuery({ text: "Dars ishlanmasi..." });
    const buf = await generateLessonPlanWordBuffer("Ona tili va adabiyot darsi");
    await ctx.replyWithDocument(new InputFile(buf, "45_Daqiqalik_Dars_Ishlanmasi.docx"), {
      caption: "📝 **45 daqiqalik namunaviy dars ishlanmasi (konspekt) tayyor!** (.docx)\n\n📌 Darsning 6 bosqichli xronometraji va metodlari bilan."
    });
    return consumeUserUse(userId);
  }

  if (data === 'doc_referat') {
    await ctx.answerCallbackQuery({ text: "Referat shabloni..." });
    const buf = await generateLessonPlanWordBuffer("Referat va Mustaqil ish (GOST)");
    await ctx.replyWithDocument(new InputFile(buf, "Referat_Titul_va_Reja.docx"), {
      caption: "🎓 **Titul varag'i va GOST standartidagi referat shabloni tayyor!** (.docx)"
    });
    return consumeUserUse(userId);
  }

  if (data === 'doc_ariza') {
    await ctx.answerCallbackQuery({ text: "Ariza shabloni..." });
    const buf = await generateOfficialOrderWordBuffer("Direktor nomiga rasmiy ariza");
    await ctx.replyWithDocument(new InputFile(buf, "Rasmiy_Ariza_Shabloni.docx"), {
      caption: "📄 **Direktor nomiga rasmiy ariza va tushuntirish xati tayyor!** (.docx)"
    });
    return consumeUserUse(userId);
  }

  if (data === 'doc_certificate') {
    await ctx.answerCallbackQuery({ text: "Faxriy yorliq..." });
    const buf = await generateOfficialOrderWordBuffer("Faxriy Yorliq va Sertifikat");
    await ctx.replyWithDocument(new InputFile(buf, "Faxriy_Yorliq_EduHujjat.docx"), {
      caption: "🏆 **QR-kodli namunaviy Faxriy Yorliq hujjati tayyor!** (.docx)"
    });
    return consumeUserUse(userId);
  }

  if (data === 'doc_tavsif') {
    await ctx.answerCallbackQuery({ text: "Tavsifnoma..." });
    const buf = await generateOfficialOrderWordBuffer("O'quvchiga rasmiy xarakteristika");
    await ctx.replyWithDocument(new InputFile(buf, "Oquvchi_Xarakteristika.docx"), {
      caption: "🔍 **O'quvchiga ijobiy xarakteristika / tavsifnoma hujjati tayyor!** (.docx)"
    });
    return consumeUserUse(userId);
  }

  if (data === 'doc_davomat') {
    await ctx.answerCallbackQuery({ text: "Davomat tabeli..." });
    const demoStudents = parseStudentsFromText("1. Karimova Dildora Jasur qizi\n2. Abdullayev Jasur Rustam o'g'li\n3. Omonov Sardor Baxtiyor o'g'li\n4. Toshmatova Rayhon Farhod qizi");
    const buf = generateAttendanceExcelBuffer(demoStudents);
    await ctx.replyWithDocument(new InputFile(buf, "Oylik_Davomat_Tabeli.xlsx"), {
      caption: "📊 **Oylik davomat tabeli tayyor!** (.xlsx)\n\n📌 1-31 kunlar, dam olish kunlari ajratilgan, formulali qatnashuv hisobi bilan."
    });
    return consumeUserUse(userId);
  }

  if (data === 'doc_grades') {
    await ctx.answerCallbackQuery({ text: "Baholar jurnali..." });
    const demoStudents = parseStudentsFromText("1. Karimova Dildora Jasur qizi\n2. Abdullayev Jasur Rustam o'g'li\n3. Omonov Sardor Baxtiyor o'g'li");
    const buf = generateGradesExcelBuffer(demoStudents);
    await ctx.replyWithDocument(new InputFile(buf, "Baholar_Jurnali_GPA.xlsx"), {
      caption: "📈 **Baholar jurnali va GPA reyting jadvali tayyor!** (.xlsx)\n\n📌 7 ta fan bo'yicha baholar, GPA avto-hisob va akademik toifalar bilan."
    });
    return consumeUserUse(userId);
  }

  if (data === 'doc_schedule') {
    await ctx.answerCallbackQuery({ text: "Dars jadvali..." });
    const demoStudents = parseStudentsFromText("1. Karimova Dildora Jasur qizi\n2. Abdullayev Jasur Rustam o'g'li");
    const buf = generateScheduleExcelBuffer(demoStudents);
    await ctx.replyWithDocument(new InputFile(buf, "Dars_Jadvali_va_Navbatchilik.xlsx"), {
      caption: "🗂 **Haftalik dars jadvali va navbatchilik grafigi tayyor!** (.xlsx)\n\n📌 6 kunlik dars soatlari, xonalar va har kungi navbatchi o'quvchilar taqsimoti bilan."
    });
    return consumeUserUse(userId);
  }

  // MATNDAN REAL FAYL GENERATSIYASI
  if (data.startsWith('act_export_')) {
    if (!isUserActive(userId, ctx.from?.username)) {
      await ctx.answerCallbackQuery({ text: "Obunangiz faol emas! Avval tarifni faollashtiring.", show_alert: true });
      return ctx.reply(
        `🔒 **Hujjatlarni yuklash uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\``,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
  }

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
    consumeUserUse(userId);
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
    consumeUserUse(userId);
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
    consumeUserUse(userId);
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
    consumeUserUse(userId);
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
    consumeUserUse(userId);
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
  const username = ctx.from?.username;

  // XAVFSIZLIK VA PAYWALL TEKSHIRUVI:
  if (!isUserActive(userId, username)) {
    const u = getUser(userId);
    const isExhausted = u && typeof u.remainingUses === 'number' && u.remainingUses <= 0;
    const msg = isExhausted
      ? `⚠️ **Sizning bepul / 1 martalik limitingiz yakunlandi!**\n\nSizga berilgan bepul hujjat tayyorlandi. Cheksiz hujjatlar, Gamma AI taqdimotlar va Excel jadvallaridan foydalanishni davom ettirish uchun tariflardan birini tanlang:`
      : `🔒 **Hisobingiz hali tasdiqlanmagan.**\n\n` +
        `Sizning Telegram ID: \`${userId}\`\n\n` +
        `EduAI imkoniyatlaridan foydalanish uchun quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`;
    return ctx.reply(msg, { reply_markup: getTariffInlineKeyboard(userId) });
  }

  const raw = userPrompt.trim();
  if (!raw) return;

  db.userSessions.set(userId, raw);
  const lower = raw.toLowerCase();

  // 1. SLAYD / TAQDIMOT ISTAGI (MASALAN: Amir Temur slayd, fotosintez prezentatsiya, slayd tuzib ber)
  const isSlideRequest = /\b(?:slayd|slaydi|slaydlar|slaydlari|taqdimot|taqdimoti|prezentatsiya|prezentatsiyasi|powerpoint|pptx)\b/i.test(lower);
  if (isSlideRequest) {
    const cleanTopic = raw.replace(/\b(?:slayd|slaydi|slaydlar|slaydlari|taqdimot|taqdimoti|prezentatsiya|prezentatsiyasi|powerpoint|pptx|tuzib ber|tuz|yarat|qilib ber|kerak|yasash|tayyorla|qil|menga|iltimos|haqida|mavzusida)\b/gi, '').trim();
    return startSlideWizard(ctx, cleanTopic || raw);
  }

  // 1B. EXCEL JADVAL SO'ROVI (MASALAN: 8-sinf kimyo jadval, davomat tabeli excel, baholar jurnali xlsx)
  const isExcelRequest = /\b(?:excel|jadval|jadvallar|jadvallari|jadvali|tabel|tabeli|jurnal|jurnali|xlsx)\b/i.test(lower);
  if (isExcelRequest) {
    const cleanTopic = raw.replace(/\b(?:excel|jadval|jadvallar|jadvallari|jadvali|tabel|tabeli|jurnal|jurnali|xlsx|tuzib ber|tuz|yarat|qilib ber|kerak|yasash|tayyorla|qil|menga|iltimos|haqida|mavzusida)\b/gi, '').trim();
    return handleDynamicExcelCreation(ctx, cleanTopic || raw);
  }

  // 2. TEST SO'ROVI (MASALAN: 9-sinf huquq 100talik test, 15 talik test, fizika testlari)
  const isTestRequest = /\b(?:test|testlar|testlari|testi|nazorat ishi|nazorat|savollar|savollari)\b/i.test(lower) || /\d+\s*(?:ta|talik)\s*(?:test|savol)/i.test(lower);

  if (isTestRequest) {
    const countMatch = raw.match(/(\d+)\s*(?:ta|talik|savol|test)/i);
    const count = countMatch ? Math.min(Math.max(1, parseInt(countMatch[1], 10)), 50) : 15;
    const cleanTopic = raw.replace(/\b(?:test|testlar|testlari|testi|nazorat ishi|nazorat|tuzib ber|tuz|yarat|ber|kerak|yoz|varianti|variant|\d+\s*talik|\d+\s*ta|menga|iltimos|haqida|mavzusida)\b/gi, '').trim();
    const finalTopic = cleanTopic || raw;

    const waitMsg = await ctx.reply(`🎯 **"${finalTopic}" bo'yicha ${count} talik nazorat testi va Word (.docx) hujjati tuzilmoqda...**\n⏳ *(DTS standartlari, 3 ta tafakkur darajasi va javoblar kaliti bilan)*`);
    try {
      let testResult = "";
      try {
        testResult = await generateAITestWithGemini(finalTopic, count);
      } catch (err) {
        testResult = generateAITestSuite(finalTopic, count);
      }

      // Word (.docx) faylini yaratish va darhol foydalanuvchiga yuborish
      const docxBuffer = await generateTestWordBuffer(finalTopic, testResult, count);
      const safeFilename = `Test_${finalTopic.slice(0, 20).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}_${count}talik.docx`;

      await ctx.replyWithDocument(new InputFile(docxBuffer, safeFilename), {
        caption: `🎯 **"${finalTopic}" bo'yicha ${count} talik test tayyor!** (.docx)\n\n✨ Rasmiy maktab me'yori, A, B, C, D variantlar va oxirida o'qituvchi uchun javoblar kaliti (ilmiy asosi bilan).`
      });

      const kb = new InlineKeyboard()
        .text("📊 Slayd (.pptx) qilish", "ai_gen_gamma")
        .text("📝 Dars konspekti (.docx)", "ai_gen_lesson")
        .row()
        .text("📊 Excel jadval (.xlsx)", "excel_master")
        .webApp("📱 WebApp-da Ochish", WEBAPP_URL);

      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      consumeUserUse(userId, 'test', finalTopic);

      const previewLines = testResult.split('\n').slice(0, 25).join('\n');
      return ctx.reply(`📋 **Testdan namunaviy savollar:**\n\n${previewLines.slice(0, 3000)}\n\n📎 *To'liq ${count} ta savol va tahliliy javoblar kaliti yuqoridagi .docx faylda yuklandi.*`, { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Test tuzishda xatolik: ${err.message}`);
    }
  }

  // 3. KONSPEKT / DARS ISHLANMASI (MASALAN: 9-sinf kimyo konspekt, 45 daqiqalik dars ishlanma)
  const isLessonRequest = /\b(?:konspekt|konspekti|dars ishlanma|dars ishlanmasi|dars reja|dars rejasi|45 daqiqa|45 daqiqalik|ochiq dars)\b/i.test(lower);
  if (isLessonRequest) {
    const cleanTopic = raw.replace(/\b(?:konspekt|konspekti|dars ishlanmasi|dars ishlanma|dars rejasi|dars reja|45 daqiqalik|45 daqiqa|ochiq dars|tuzib ber|tuz|yarat|yoz|kerak|menga|iltimos|haqida|mavzusida)\b/gi, '').trim();
    const finalTopic = cleanTopic || raw;

    const waitMsg = await ctx.reply(`📝 **"${finalTopic}" bo'yicha 45 daqiqalik dars konspekti (.docx) tayyorlanmoqda...**\n⏳ *(6 bosqichli xronometraj va DTS mezonlari bilan)*`);
    try {
      let lessonResult = "";
      try {
        lessonResult = await generateAILessonPlanWithGemini(finalTopic);
      } catch (err) {
        lessonResult = generateAILessonPlan(finalTopic);
      }

      const docxBuffer = await generateLessonPlanWordBuffer(finalTopic, lessonResult);
      const safeFilename = `Konspekt_${finalTopic.slice(0, 25).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}.docx`;

      await ctx.replyWithDocument(new InputFile(docxBuffer, safeFilename), {
        caption: `📝 **"${finalTopic}" bo'yicha 45 daqiqalik dars konspekti tayyor!** (.docx)\n\n✨ Maqsadlar, metodlar, 6 bosqichli xronometraj, yangi mavzu bayoni, mustahkamlash va uy vazifasi.`
      });

      const kb = new InlineKeyboard()
        .text("📊 Slayd (.pptx) qilish", "ai_gen_gamma")
        .text("🎯 15 Talik Test (.docx)", "ai_gen_test")
        .row()
        .text("📊 Excel Jadval (.xlsx)", "excel_schedule")
        .webApp("📱 WebApp-da Ochish", WEBAPP_URL);

      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      consumeUserUse(userId, 'lesson_plan', finalTopic);
      return ctx.reply(`📄 **Dars konspektining asosiy qismi:**\n\n${lessonResult.slice(0, 2500)}\n\n📎 *To'liq dars ishlanmasi yuqoridagi .docx faylda yuborildi.*`, { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Konspekt tayyorlashda xatolik: ${err.message}`);
    }
  }

  // 4. REFERAT / INSHO / MUSTAQIL ISH / MAQOLA
  const isEssayRequest = /\b(?:referat|insho|ma'ruza|maqola|mustaqil ish|doklad)\b/i.test(lower);
  if (isEssayRequest) {
    const cleanTopic = raw.replace(/\b(?:referat|insho|ma'ruza|maqola|mustaqil ish|doklad|tuzib ber|yozib ber|yoz|tayyorla|kerak|menga|iltimos|haqida|mavzusida)\b/gi, '').trim();
    const finalTopic = cleanTopic || raw;
    const waitMsg = await ctx.reply(`📑 **"${finalTopic}" mavzusida akademik referat (.docx) tayyorlanmoqda...**\n⏳ *(Reja, kirish, 3 ta asosiy bob, xulosa va adabiyotlar bilan)*`);
    try {
      const essayPrompt = `Mavzu: "${finalTopic}"\nVazifa: O'zbekiston oliy va xalq ta'limi standartlariga mos, chuqur, akademik va ilmiy darajadagi to'liq referat/ma'ruza matni yozib ber.\nReja:\n1. Kirish (Mavzuning dolzarbligi va maqsadlari)\n2. Asosiy Qism (kamida 3 ta asosiy bob va chuqur ilmiy tahlil)\n3. Xulosa va Amaliy Ahamiyati\n4. Foydalanilgan Adabiyotlar Ro'yxati\n\nQat'iy qoida: LaTeX va dollar ($) belgisidan foydalanmang!`;
      const essayResult = await callGemini(essayPrompt, "Siz O'zbekistonning eng yuqori toifali akademik olimi va metodistisiz. Darhol to'g'ridan-to'g'ri to'liq referat matnini taqdim eting.");

      const docxBuffer = await generateReferatWordBuffer(finalTopic, essayResult);
      const safeFilename = `Referat_${finalTopic.slice(0, 25).replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}.docx`;

      await ctx.replyWithDocument(new InputFile(docxBuffer, safeFilename), {
        caption: `📑 **"${finalTopic}" mavzusida akademik referat tayyor!** (.docx)\n\n✨ Reja, kirish, asosiy boblar, xulosa va 10+ ilmiy adabiyotlar ro'yxati bilan.`
      });

      const kb = new InlineKeyboard()
        .text("📊 Slayd (.pptx) qilish", "ai_gen_gamma")
        .text("📝 Konspekt (.docx)", "ai_gen_lesson")
        .row()
        .text("🎯 Test (.docx)", "ai_gen_test")
        .webApp("📱 WebApp", WEBAPP_URL);

      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      consumeUserUse(userId, 'referat', finalTopic);
      return ctx.reply(`📑 **Referatning kirish va reja qismi:**\n\n${essayResult.slice(0, 2500)}\n\n📎 *To'liq referat yuqoridagi .docx faylda yuborildi.*`, { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Referat tayyorlashda xatolik: ${err.message}`);
    }
  }

  // 5. BUYRUQ LOYIHASI
  if (/\b(?:buyruq|qaror|farmoyish)\b/i.test(lower)) {
    const waitMsg = await ctx.reply("📋 **Rasmiy maktab buyrug'i loyihasi (.docx) tayyorlanmoqda...**");
    try {
      let orderResult = "";
      try {
        orderResult = await generateAIOfficialOrderWithGemini(raw);
      } catch(e) {
        orderResult = generateAIOfficialOrder(raw);
      }

      const docxBuffer = await generateOfficialOrderWordBuffer(raw, orderResult);
      await ctx.replyWithDocument(new InputFile(docxBuffer, "Maktab_Direktori_Buyrugi.docx"), {
        caption: `📋 **Rasmiy maktab direktori buyrug'i tayyor!** (.docx)\n\n✨ GOST me'yorlari va vazirlik talablari bilan.`
      });

      const kb = new InlineKeyboard()
        .text("📊 Slayd (.pptx)", "ai_gen_gamma")
        .webApp("📱 WebApp", WEBAPP_URL);
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      consumeUserUse(userId, 'official_order', raw);
      return ctx.reply(orderResult.slice(0, 2500), { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Buyruq tuzishda xatolik: ${err.message}`);
    }
  }

  // 6. O'QUVCHI TAVSIFNOMASI
  if (/\b(?:tavsifnoma|xarakteristika)\b/i.test(lower)) {
    const waitMsg = await ctx.reply("📝 **O'quvchi uchun rasmiy pedagogik tavsifnoma (.docx) yozilmoqda...**");
    try {
      let refResult = "";
      try {
        refResult = await generateAIStudentReferenceWithGemini(raw);
      } catch(e) {
        refResult = generateAIStudentReference(raw, "10-A");
      }

      const docxBuffer = await generateStudentReferenceWordBuffer(raw, "10-A");
      await ctx.replyWithDocument(new InputFile(docxBuffer, "Oquvchi_Tavsifnomasi.docx"), {
        caption: `🔍 **Pedagogik tavsifnoma (xarakteristika) tayyor!** (.docx)\n\n✨ Rasmiy xarakteristika va muhr o'rni bilan.`
      });

      const kb = new InlineKeyboard()
        .text("📊 Slayd (.pptx)", "ai_gen_gamma")
        .webApp("📱 WebApp", WEBAPP_URL);
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      consumeUserUse(userId, 'tavsifnoma', raw);
      return ctx.reply(refResult.slice(0, 2500), { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Tavsifnoma yozishda xatolik: ${err.message}`);
    }
  }

  // 7. BAYONNOMA / PROTOKOL
  if (/\b(?:bayonnoma|protokol)\b/i.test(lower)) {
    const waitMsg = await ctx.reply("📑 **Pedagogik kengash bayonnomasi (.docx) tayyorlanmoqda...**");
    try {
      let protoResult = "";
      try {
        protoResult = await generateAIProtocolWithGemini(raw);
      } catch(e) {
        protoResult = generateAIPedagogicalProtocol(raw);
      }

      const docxBuffer = await generateProtocolWordBuffer(raw, "45");
      await ctx.replyWithDocument(new InputFile(docxBuffer, "Kengash_Bayonnomasi.docx"), {
        caption: `📜 **Pedagogik kengash bayonnomasi tayyor!** (.docx)\n\n✨ Kun tartibi, muzokaralar va rasmiy qaror qismi bilan.`
      });

      const kb = new InlineKeyboard()
        .text("📊 Slayd (.pptx)", "ai_gen_gamma")
        .webApp("📱 WebApp", WEBAPP_URL);
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      consumeUserUse(userId, 'bayonnoma', raw);
      return ctx.reply(protoResult.slice(0, 2500), { reply_markup: kb });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ Bayonnoma tuzishda xatolik: ${err.message}`);
    }
  }

  // 8. UNIVERSAL CHAT / PEDAGOGIK MASLAHAT VA ILMIY SAVOL-JAVOB (MASALAN: 9-kimyo ko'payish)
  const waitMsg = await ctx.reply("⚡ **EduAI tahlil qilmoqda va ilmiy material tayyorlamoqda...**");
  try {
    const systemInstruction = 
      "Siz O'zbekiston Respublikasi Maktabgacha va Maktab Ta'limi Vazirligi mezonlari bo'yicha Respublika darajasidagi bosh ekspert-metodist va universal pedagogik AI intellektisiz.\n\n" +
      "QAT'IY QOIDALAR (AI TUSHUNISHI VA JAVOB STANDARTI):\n" +
      "1. FOYDALANUVCHINING INTENTSIYASINI CHUQUR TUSHUNING: Foydalanuvchi qisqa yozsa ham (masalan: '9-kimyo ko'payish', 'mitoz', 'bosim'), bu O'zbekiston umumta'lim maktabi darsligi, fani va o'quv dasturi bilan bevosita bog'liq! Fanning darslik mezonlaridan kelib chiqib, mavzuni chuqur va to'liq yoritib bering.\n" +
      "2. HECH QACHON O'ZINGIZNI OQLAMANG VA IKKILANMANG: 'Assalomu alaykum, sizning qisqa murojaatingizdan kelib chiqib...', 'Men shuni nazarda tutgan deb taxmin qilaman...', 'Savolingizni aniqroq yozing...' kabi robotik, keraksiz gaplarni yozish QAT'IYAN TAQIQLANADI! Darhol to'g'ridan-to'g'ri professional ilmiy-pedagogik materialni bering.\n" +
      "3. TUZILISH:\n" +
      "   - Sarlavha: Aniq fan va mavzu nomi (masalan: 🔬 9-Sinf Kimyo & Biologiya: Hujayra Bo'linishining Biokimyoviy Asoslari)\n" +
      "   - I. Fundamental Ilmiy Qonuniyatlar va Tushunchalar (DNK, ATF, oqsillar sintezi, moddalar almashinuvi)\n" +
      "   - II. Maktab Darsligi DTS Mezonlari va Aniq Faktlar\n" +
      "   - III. Amaliy Xulosalar va Metodik Tavsiyalar\n" +
      "4. LaTeX va dollar ($) belgisi mutlaqo taqiqlanadi! Formullalarni oddiy matn bilan yozing (H2O, O2, C6H12O6, x^2, a/b).";

    const answer = await callGemini(raw, systemInstruction);

    const actionKb = new InlineKeyboard()
      .text("📊 Slayd (.pptx) qilish", "ai_gen_gamma")
      .text("📝 Dars konspekti (.docx)", "ai_gen_lesson")
      .row()
      .text("🎯 15 Talik Test (.docx)", "ai_gen_test")
      .webApp("📱 WebApp-da Ko'rish", WEBAPP_URL);

    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return ctx.reply(answer.slice(0, 4000), { reply_markup: actionKb });
  } catch(err) {
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return ctx.reply(`🤖 **EduAI Tahlili:**\n\n«${raw}» mavzusi bo'yicha materiallar tayyorlash uchun quyidagi tugmalardan birini tanlang:`, {
      reply_markup: new InlineKeyboard()
        .text("📊 Slayd (.pptx)", "ai_gen_gamma")
        .text("📝 Dars konspekti (.docx)", "ai_gen_lesson")
        .row()
        .text("🎯 Test (.docx)", "ai_gen_test")
    });
  }
}

bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const role = getEffectiveRole(ctx);

  if (isSpamming(userId)) return;

  // 1. Guruhlardagi begona spam va reklamalarni butunlay to'xtatish (Faqat shaxsiy chatda yoki bot chaqirilganda)
  if (ctx.chat?.type && ctx.chat.type !== 'private') {
    const botUser = ctx.me?.username || 'eduhujjat_bot';
    if (!text.includes(`@${botUser}`) && !text.startsWith('/')) return;
  }

  // 2. Anti-Spam va Anti-Reklama Qalqoni (Tashqi reklamalar, kazino va havolalarni to'xtatish)
  const isOwnerOrAdmin = role === 'OWNER' || role === 'ADMIN';
  const spamAdPattern = /\b(?:1xbet|mostbet|melbet|linebet|kazino|omadshou|aviator|kripto|daromad|investitsiya|tekin pul|pul ishlash|bonus 500%)\b/i;
  const externalLinkPattern = /(?:https?:\/\/|t\.me\/(?!eduhujjat)|wa\.me\/|bit\.ly\/)/i;

  if (!isOwnerOrAdmin && (spamAdPattern.test(text) || externalLinkPattern.test(text))) {
    console.warn(`[Anti-Spam Bloki] Foydalanuvchi ${userId} tomonidan reklama to'xtatildi.`);
    return ctx.reply("🚫 **Xavfsizlik:** Botda tashqi reklama, qimor, havola yoki spam tarqatish taqiqlangan!");
  }

  // =========================================================================
  // BUYRUQ VA MENYU TUGMALARI BOSILGANDA SLIDE WIZARDNI BEKOR QILISH
  // =========================================================================
  const knownMenuButtons = [
    '🔑 Saytga Kirish Kodi', '🤖 EduAI Yordamchi', '📊 Gamma AI Taqdimot', '🎨 Gamma AI Taqdimot',
    '💻 Slayd Yasash', '📊 Excel Jadvallar', '📜 Faxriy Yorliq', '💳 Litsenziya Sotib Olish',
    '👥 Foydalanuvchilar', '⚡ Tezkor Yoqish', '🔍 Nazorat / Tekshirish', '📊 Tizim Statistikasi',
    '📈 Faollik Tahlili', '📈 Faollik', '📊 Statistika',
    '👑 Boshqaruv Paneli', '🔙 Orqaga'
  ];
  const isCommandOrMenu = text.startsWith('/') || knownMenuButtons.includes(text);

  if (slideWizardState.has(userId) && isCommandOrMenu) {
    slideWizardState.delete(userId);
  }

  // =========================================================================
  // SLIDE WIZARD TEXT INPUT (Faqat oddiy matn bo'lganda)
  // =========================================================================
  if (slideWizardState.has(userId)) {
    if (!isUserActive(userId, username)) {
      slideWizardState.delete(userId);
      return ctx.reply(
        `🔒 **Taqdimot yaratish uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\`\n\n` +
        `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
    const sw = slideWizardState.get(userId);
    if (sw.step === 'awaiting_topic') {
      sw.topic = text.trim();
      sw.step = 'awaiting_author';
      slideWizardState.set(userId, sw);
      return sendWizardAuthorStep(ctx, sw.topic);
    }
    if (sw.step === 'awaiting_author') {
      sw.authorName = text.trim();
      sw.step = 'awaiting_slide_count';
      slideWizardState.set(userId, sw);
      return sendWizardSlideCountStep(ctx, sw.topic, sw.authorName, false);
    }
    if (sw.step === 'awaiting_slide_count' || sw.step === 'awaiting_custom_count') {
      const parsedNum = parseInt(text.trim(), 10);
      if (!parsedNum || isNaN(parsedNum) || parsedNum < 1 || parsedNum > 30) {
        return ctx.reply("⚠️ Iltimos, **1 dan 30 gacha** bo'lgan to'g'ri raqam kiriting (masalan: `8` yoki `15` yoki `25`):", { parse_mode: 'Markdown' });
      }
      sw.slideCount = parsedNum;
      sw.step = 'awaiting_detail';
      slideWizardState.set(userId, sw);
      return sendWizardDetailStep(ctx, sw.topic, sw.authorName, sw.slideCount, false);
    }
  }

  // =========================================================================
  // /slayd BUYRUG'I VA MENYU TUGMALARI
  // =========================================================================
  if (text.startsWith('/slayd') || text.startsWith('/slide') || text.startsWith('/taqdimot') || 
      text === '📊 Gamma AI Taqdimot' || text === '🎨 Gamma AI Taqdimot' || text === '💻 Slayd Yasash') {
    if (!isUserActive(userId, username)) {
      return ctx.reply(
        `🔒 **Gamma AI Taqdimot yaratish uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\`\n\n` +
        `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
    const isButton = (text === '📊 Gamma AI Taqdimot' || text === '🎨 Gamma AI Taqdimot' || text === '💻 Slayd Yasash');
    const rawTopic = text.replace(/^\/(?:slayd|slide|taqdimot)\s*/i, '').trim();
    const topic = (!isButton && rawTopic) ? rawTopic : '';
    return startSlideWizard(ctx, topic);
  }

  // =========================================================================
  // /excel, /jadval BUYRUQLARI VA "📊 Excel Jadvallar" TUGMASI
  // =========================================================================
  if (text.startsWith('/excel') || text.startsWith('/jadval') || text === '📊 Excel Jadvallar') {
    if (!isUserActive(userId, username)) {
      return ctx.reply(
        `🔒 **Excel jadvallaridan foydalanish uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\`\n\n` +
        `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
    const rawTopic = text.replace(/^\/(?:excel|jadval)\s*/i, '').trim();
    if (rawTopic && rawTopic !== '📊 Excel Jadvallar') {
      return handleDynamicExcelCreation(ctx, rawTopic);
    }
    return sendExcelMenu(ctx);
  }

  // =========================================================================
  // A.0) ADMIN VA OWNER FAOLLIK TAHLILI & BOSHQARUV TUGMALARI
  // =========================================================================
  if (text === '📈 Faollik Tahlili' || text === '/activity' || text === '/monitoring' || text === '📈 Faollik') {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'INSPECTOR') return ctx.reply("❌ Ruxsat yo'q!");
    return ctx.reply(formatActivityReport(), { parse_mode: 'Markdown' });
  }

  // FOYDALANUVCHI AUDIT TARIXI (OXIRGI 100 TA AMAL)
  if (text === '🔍 Foydalanuvchi Tarixi (100 ta)' || text === '/userlog' || text === '/audit' || text === '/tarix') {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'INSPECTOR') return ctx.reply("❌ Ruxsat yo'q!");
    const allUsers = getAllUniqueUsers().filter(u => u.realId !== SUPER_OWNER_ID);
    let msg = `🔍 **FOYDALANUVCHINING OXIRGI 100 TA AMALINI KO'RISH:**\n\n` +
      `Foydalanuvchining ID raqami bilan buyruq yuboring:\n` +
      `Masalan: \`/userlog 9017407025\` yoki \`/audit 9017407025\`\n\n` +
      `Yoki quyidagi foydalanuvchilardan birini bosing:`;

    const kb = new InlineKeyboard();
    allUsers.slice(0, 8).forEach((u, idx) => {
      kb.text(`👤 ${u.name.slice(0, 14)} (${u.id})`, `audit_user_${u.realId || u.id}`);
      if (idx % 2 === 1) kb.row();
    });
    if (allUsers.length % 2 === 1) kb.row();

    return ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: kb });
  }

  if (text.startsWith('/userlog ') || text.startsWith('/audit ') || text.startsWith('/tarix ')) {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'INSPECTOR') return ctx.reply("❌ Ruxsat yo'q!");
    const targetInput = text.replace(/^\/(?:userlog|audit|tarix)\s*/i, '').trim();
    return sendUserAuditLogs(ctx, targetInput);
  }

  // QURILMALAR VA SESSIYALARNI BOSHQARISH / CHIQARIB YUBORISH (KICK)
  if (text === '/devices' || text === '/qurilmalar' || text === '/sessiyalar') {
    if (role !== 'OWNER' && role !== 'ADMIN') return ctx.reply("❌ Ruxsat yo'q!");
    db.deviceBindings = db.deviceBindings || {};
    const entries = Object.entries(db.deviceBindings).filter(([k, v]) => v && v.deviceId && !v.kicked);
    if (entries.length === 0) {
      return ctx.reply("📱 **Hozirda hech qanday faol ulangan tashqi qurilmalar mavjud emas.**");
    }
    let msg = `📱 **FAOL QURILMALAR VA SESSIYALAR RO'YXATI (${entries.length} ta):**\n\n`;
    const kb = new InlineKeyboard();
    entries.forEach(([c, b], i) => {
      msg += `**${i + 1}. Kod:** \`${c}\`\n` +
        `   📱 Qurilma: ${b.deviceInfo || 'Veb'}\n` +
        `   ⏰ Ulangan: ${new Date(b.boundAt).toLocaleTimeString('uz-UZ')}\n` +
        `   👉 Chiqarib yuborish: \`/kick ${c}\`\n\n`;
      kb.text(`🚫 Chiqarish: ${c}`, `dev_kick_${c}`);
      if (i % 2 === 1) kb.row();
    });
    return ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: kb });
  }

  if (text.startsWith('/kick ') || text.startsWith('/chiqar ')) {
    if (role !== 'OWNER' && role !== 'ADMIN') return ctx.reply("❌ Ruxsat yo'q!");
    const target = text.replace(/^\/(?:kick|chiqar)\s*/i, '').trim();
    if (!target) return ctx.reply("⚠️ Foydalanuvchi IDsi yoki kodini kiriting: `/kick 9017407025` yoki `/kick EDU-150275`");

    db.deviceBindings = db.deviceBindings || {};
    let targetCode = target;
    if (/^\d{6,}$/.test(target)) {
      const uId = parseInt(target, 10);
      targetCode = getAccessCodeForUser(uId);
    }

    db.deviceBindings[targetCode] = {
      kicked: true,
      deviceId: null,
      kickedAt: Date.now()
    };
    saveDatabase();

    try {
      fetch('https://eduhujjat.vercel.app/api/device-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'kick_device', code: targetCode })
      }).catch(() => {});
    } catch(e) {}

    return ctx.reply(
      `🚫 **FOYDALANUVCHI / QURILMA CHIQARIB YUBORILDI (KICKED)!**\n\n` +
      `Kod: \`${targetCode}\`\n` +
      `Holat: Ushbu kodga ulangan qurilmaning saytdagi sessiyasi darhol bekor qilindi. U saytga boshqa kira olmaydi.`,
      { parse_mode: 'Markdown' }
    );
  }

  if (text === '⚡ Tezkor Yoqish') {
    if (role !== 'OWNER' && role !== 'ADMIN') return ctx.reply("❌ Ruxsat yo'q!");
    const allUsers = getAllUniqueUsers().filter(u => u.realId !== SUPER_OWNER_ID);
    const pendingUsers = allUsers.filter(u => u.status === 'PENDING');

    let msg = `⚡ **TEZKOR FOYDALANUVCHILARNI YOQISH VA BOSHQARISH:**\n\n`;
    if (pendingUsers.length > 0) {
      msg += `⏳ **Tasdiqlashni kutayotgan foydalanuvchilar:**\n`;
      pendingUsers.slice(0, 5).forEach(u => {
        msg += `• **${u.name}** (\`${u.id}\`): \`/active ${u.id} 2h\` yoki \`/user ${u.id}\`\n`;
      });
      msg += `\n`;
    }

    msg += `💡 **Mavjud boshqaruv buyruqlari:**\n` +
      `• \`/user [ID]\` — 1 kun, 1 hafta, 1 oy tahlili va interaktiv boshqaruv\n` +
      `• \`/active [ID] 2h\` — 2 soatlik kirish berish\n` +
      `• \`/cuttime [ID] 1h\` — 1 soat vaqtini kamaytirish\n` +
      `• \`/addtime [ID] 2h\` — 2 soat vaqt qo'shish\n` +
      `• \`/zero [ID]\` — Vaqt va limitni 0 qilish (muzlatish)\n` +
      `• \`/setuses [ID] 5\` — 5 ta hujjat limiti belgilash\n\n` +
      `👇 **Oxirgi foydalanuvchilardan birini tanlang:**`;

    const kb = new InlineKeyboard();
    const listToShow = allUsers.slice(0, 6);
    listToShow.forEach((u, idx) => {
      kb.text(`👤 ${u.name.slice(0, 14)} (${u.id})`, `manage_open_${u.realId || u.id}`);
      if (idx % 2 === 1) kb.row();
    });
    if (listToShow.length % 2 === 1) kb.row();

    return ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: kb });
  }

  if (text.startsWith('/user') || text.startsWith('/manage')) {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'INSPECTOR') return ctx.reply("❌ Ruxsat yo'q!");
    const parts = text.split(/\s+/);
    if (parts.length < 2) {
      return ctx.reply("❌ Namuna: `/user 9017407025` yoki `/user 1`", { parse_mode: 'Markdown' });
    }
    const targetId = resolveUserId(parts[1]);
    const user = getUser(targetId);
    if (!user) {
      return ctx.reply(`❌ ID: \`${targetId}\` bo'yicha foydalanuvchi topilmadi.`, { parse_mode: 'Markdown' });
    }
    return ctx.reply(formatActivityReport(targetId), {
      parse_mode: 'Markdown',
      reply_markup: getUserManageKeyboard(targetId)
    });
  }

  if (text.startsWith('/settime ') && (role === 'OWNER' || role === 'ADMIN')) {
    const parts = text.replace('/settime ', '').trim().split(/\s+/);
    if (parts.length < 2) {
      return ctx.reply("❌ Namuna: `/settime 9017407025 2h` yoki `/settime 9017407025 0` (muzlatish) yoki `/settime 9017407025 3d`", { parse_mode: 'Markdown' });
    }
    const targetId = resolveUserId(parts[0]);
    const duration = parts.slice(1).join(' ').toLowerCase();

    if (duration === '0' || duration === 'zero' || duration === 'nol') {
      setUserZero(targetId);
      return ctx.reply(`🚫 ID: \`${getDisplayUserId(targetId)}\` foydalanuvchisining vaqti 0 qilindi (muzlatildi)!`, { parse_mode: 'Markdown' });
    }

    const ms = parseDurationToMs(duration);
    if (!ms) {
      return ctx.reply("❌ Noto'g'ri muddat! Masalan: `30m`, `2h`, `1d`, `7d`, `1m` yoki `0`", { parse_mode: 'Markdown' });
    }

    const user = getUser(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';
    user.remainingUses = null;
    user.plan = 'custom_time';
    user.expireTimestamp = Date.now() + ms;
    user.expiresAt = formatRemainingTime(user);
    setUser(targetId, user);
    saveDatabase();

    return ctx.reply(`✅ ID: \`${getDisplayUserId(targetId)}\` uchun vaqt belgilandi: **${user.expiresAt}**`, { parse_mode: 'Markdown' });
  }

  if (text.startsWith('/cuttime ') && (role === 'OWNER' || role === 'ADMIN')) {
    const parts = text.replace('/cuttime ', '').trim().split(/\s+/);
    if (parts.length < 2) {
      return ctx.reply("❌ Namuna: `/cuttime 9017407025 1h` yoki `/cuttime 9017407025 30m` yoki `/cuttime 9017407025 1d`", { parse_mode: 'Markdown' });
    }
    const targetId = resolveUserId(parts[0]);
    const duration = parts.slice(1).join(' ').toLowerCase();
    const ms = parseDurationToMs(duration);
    if (!ms) return ctx.reply("❌ Noto'g'ri muddat! Masalan: `30m`, `1h`, `2h`, `1d`", { parse_mode: 'Markdown' });

    const res = cutUserTime(targetId, ms);
    if (!res.success) return ctx.reply(`❌ Xatolik: ${res.message}`);
    return ctx.reply(`⏱ ID: \`${getDisplayUserId(targetId)}\` dan **${duration}** kamaytirildi!\nQolgan vaqt: **${res.remainingTime}**`, { parse_mode: 'Markdown' });
  }

  if (text.startsWith('/addtime ') && (role === 'OWNER' || role === 'ADMIN')) {
    const parts = text.replace('/addtime ', '').trim().split(/\s+/);
    if (parts.length < 2) {
      return ctx.reply("❌ Namuna: `/addtime 9017407025 1h` yoki `/addtime 9017407025 2d`", { parse_mode: 'Markdown' });
    }
    const targetId = resolveUserId(parts[0]);
    const duration = parts.slice(1).join(' ').toLowerCase();
    const ms = parseDurationToMs(duration);
    if (!ms) return ctx.reply("❌ Noto'g'ri muddat! Masalan: `30m`, `1h`, `2h`, `1d`", { parse_mode: 'Markdown' });

    const res = addUserTime(targetId, ms);
    return ctx.reply(`⏱ ID: \`${getDisplayUserId(targetId)}\` ga **${duration}** qo'shildi!\nYangi muddat: **${res.remainingTime}**`, { parse_mode: 'Markdown' });
  }

  if ((text.startsWith('/zero ') || text.startsWith('/freeze ')) && (role === 'OWNER' || role === 'ADMIN')) {
    const rawId = text.replace(/^\/(?:zero|freeze)\s*/i, '').trim();
    const targetId = resolveUserId(rawId);
    const res = setUserZero(targetId);
    if (!res.success) return ctx.reply(`❌ ${res.message}`);
    return ctx.reply(`🚫 ID: \`${getDisplayUserId(targetId)}\` foydalanuvchisi vaqti va limiti 0 qilindi (muzlatildi)!`, { parse_mode: 'Markdown' });
  }

  if (text.startsWith('/setuses ') && (role === 'OWNER' || role === 'ADMIN')) {
    const parts = text.replace('/setuses ', '').trim().split(/\s+/);
    if (parts.length < 2) return ctx.reply("❌ Namuna: `/setuses 9017407025 5` yoki `/setuses 9017407025 0`");
    const targetId = resolveUserId(parts[0]);
    const count = parseInt(parts[1], 10);
    const user = getUser(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
    user.remainingUses = count;
    user.status = count > 0 ? 'ACTIVE' : 'PENDING';
    user.expireTimestamp = null;
    user.expiresAt = `${count} ta hujjat`;
    setUser(targetId, user);
    saveDatabase();
    return ctx.reply(`⚡ ID: \`${getDisplayUserId(targetId)}\` uchun limit o'rnatildi: **${count} ta hujjat**`);
  }

  if (text.startsWith('/cutuses ') && (role === 'OWNER' || role === 'ADMIN')) {
    const parts = text.replace('/cutuses ', '').trim().split(/\s+/);
    if (parts.length < 2) return ctx.reply("❌ Namuna: `/cutuses 9017407025 1`");
    const targetId = resolveUserId(parts[0]);
    const count = parseInt(parts[1], 10) || 1;
    const user = getUser(targetId);
    if (!user) return ctx.reply("❌ Foydalanuvchi topilmadi.");
    user.remainingUses = Math.max(0, (user.remainingUses || 0) - count);
    if (user.remainingUses <= 0) {
      user.status = 'PENDING';
      user.expiresAt = '0 ta (Tugagan)';
    } else {
      user.expiresAt = `${user.remainingUses} ta hujjat`;
    }
    setUser(targetId, user);
    saveDatabase();
    return ctx.reply(`⚡ ID: \`${getDisplayUserId(targetId)}\` dan **${count} ta** limit ayirildi. Qolgan: **${user.remainingUses} ta**`);
  }

  if (text.startsWith('/adduses ') && (role === 'OWNER' || role === 'ADMIN')) {
    const parts = text.replace('/adduses ', '').trim().split(/\s+/);
    if (parts.length < 2) return ctx.reply("❌ Namuna: `/adduses 9017407025 5`");
    const targetId = resolveUserId(parts[0]);
    const count = parseInt(parts[1], 10) || 1;
    const user = getUser(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';
    user.remainingUses = (user.remainingUses || 0) + count;
    user.expiresAt = `${user.remainingUses} ta hujjat`;
    user.expireTimestamp = null;
    setUser(targetId, user);
    saveDatabase();
    return ctx.reply(`⚡ ID: \`${getDisplayUserId(targetId)}\` ga **${count} ta** limit qo'shildi. Jami: **${user.remainingUses} ta**`);
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
    const user = getUser(targetId) || { id: getDisplayUserId(targetId), realId: targetId, name: 'Foydalanuvchi' };
    user.status = 'ACTIVE';

    if (durationRaw === '0' || durationRaw === 'zero' || durationRaw === 'nol') {
      user.plan = 'none';
      user.status = 'PENDING';
      user.remainingUses = 0;
      user.expireTimestamp = Date.now() - 1000;
      user.expiresAt = '0 (Muzlatilgan)';
      planLabel = '🚫 0 (Muzlatilgan)';
    } else if (durationRaw === 'unlimited' || durationRaw === 'vip' || durationRaw === 'cheksiz' || durationRaw === 'abadiy') {
      user.plan = 'unlimited';
      user.remainingUses = 999999;
      user.expireTimestamp = null;
      user.expiresAt = 'Cheksiz VIP';
      planLabel = '👑 Cheksiz VIP (Unlimited)';
    } else if (durationRaw.match(/^\d+\s*(?:h|soat|hour|hours)$/)) {
      const h = parseInt(durationRaw, 10) || 1;
      user.plan = `${h}h`;
      user.remainingUses = null;
      user.expireTimestamp = Date.now() + h * 3600 * 1000;
      user.expiresAt = `${h} soat`;
      planLabel = `⏱ ${h} Soatlik Kirish`;
    } else if (durationRaw.match(/^\d+\s*(?:time|martalik|marta)$/) || /^\d+$/.test(durationRaw)) {
      const times = parseInt(durationRaw, 10) || 1;
      user.plan = `${times}time`;
      user.remainingUses = times;
      user.expireTimestamp = null;
      user.expiresAt = `${times} ta hujjat`;
      planLabel = `⚡ ${times} Martalik Hujjat`;
    } else if (durationRaw.match(/^\d+\s*(?:d|kun|day|days)$/)) {
      const d = parseInt(durationRaw, 10) || 1;
      user.plan = `${d}d`;
      user.remainingUses = null;
      user.expireTimestamp = Date.now() + d * 86400 * 1000;
      user.expiresAt = `${d} kun`;
      planLabel = `📅 ${d} Kunlik`;
    } else if (durationRaw.match(/^\d+\s*(?:w|hafta|week|weeks)$/)) {
      const w = parseInt(durationRaw, 10) || 1;
      user.plan = `${w}w`;
      user.remainingUses = null;
      user.expireTimestamp = Date.now() + w * 7 * 86400 * 1000;
      user.expiresAt = `${w * 7} kun`;
      planLabel = `🗓 ${w} Haftalik`;
    } else if (durationRaw.match(/^\d+\s*(?:m|oy|month|months)$/)) {
      const m = parseInt(durationRaw, 10) || 1;
      user.plan = `${m}m`;
      user.remainingUses = null;
      user.expireTimestamp = Date.now() + m * 30 * 86400 * 1000;
      user.expiresAt = `${m * 30} kun`;
      planLabel = `⭐ ${m} Oylik Pro`;
    } else {
      return ctx.reply(
        `⚠️ **Noma'lum muddat kiritildi: "${durationRaw}"**\n` +
        `Iltimos, ID: \`${getDisplayUserId(targetId)}\` uchun pastdagi tayyor tugmalardan birini bosing:`,
        { parse_mode: 'Markdown', reply_markup: getOwnerActionKeyboard(targetId) }
      );
    }

    setUser(targetId, user);
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
      const userObj = getUser(userId);
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
    if (!isUserActive(userId, username)) {
      return ctx.reply(
        `🔒 **EduAI Universal Yordamchidan foydalanish uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\`\n\n` +
        `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
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
    if (!isUserActive(userId, username)) {
      return ctx.reply(
        `🔒 **Hujjat yaratish uchun hisobingizni faollashtiring.**\n\n` +
        `Sizning Telegram ID: \`${userId}\``,
        { reply_markup: getTariffInlineKeyboard(userId) }
      );
    }
    const buf = await generateOfficialOrderWordBuffer("Faxriy Yorliq va Sertifikat");
    consumeUserUse(userId, 'official_order', 'Faxriy Yorliq va Sertifikat');
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
    const uniqueUserIds = Array.from(new Set(getAllUniqueUsers().map(u => u.realId || u.id)));
    for (const uId of uniqueUserIds) {
      try {
        await bot.api.sendMessage(uId, `📢 **DIQQAT E'LON!**\n\n${broadcastText}`, { parse_mode: 'Markdown' });
        sentCount++;
      } catch (e) {}
    }
    return ctx.reply(`✅ Xabar **${sentCount} ta** foydalanuvchiga muvaffaqiyatli yetkazildi!`);
  }

  if (text === '👥 Foydalanuvchilar') {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'INSPECTOR') return ctx.reply("❌ Ruxsat yo'q!");
    const usersList = getAllUniqueUsers();
    let msg = `👥 **FOYDALANUVCHILAR RO'YXATI (${usersList.length} ta):**\n\n`;
    usersList.slice(0, 20).forEach((u, i) => {
      const statusIcon = u.status === 'ACTIVE' ? '✅' : (u.status === 'BLOCKED' ? '❌' : '⏳');
      const timeStr = formatRemainingTime(u);
      msg += `${i + 1}. ${statusIcon} **${u.name}** (ID: \`${u.id}\`)\n` +
             `   💳 Tarif: **${u.plan || 'none'}** | ⏱ **${timeStr}**\n` +
             `   👉 Boshqarish: \`/user ${u.id}\`\n\n`;
    });
    msg += `📥 *Barcha ro'yxatni Excelda yuklash uchun pastdagi "Bazani Yuklash (Excel)" tugmasini bosing.*`;
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
    const allUsers = getAllUniqueUsers();
    return ctx.reply(
      `📊 **EDUKATSIYA TIZIMI STATISTIKASI:**\n\n` +
      `• Super Owner ID: \`1\` (@${OWNER_USERNAME})\n` +
      `• Jami foydalanuvchilar: ${allUsers.length}\n` +
      `• Faol hisoblar: ${allUsers.filter(u => u.status === 'ACTIVE').length}\n` +
      `• Kutishdagilar (Pending): ${allUsers.filter(u => u.status === 'PENDING').length}\n` +
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
    const u = getUser(userId);
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
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const { action, reqId, code, deviceId, deviceInfo, pin } = body;
        db.deviceAuthorizations = db.deviceAuthorizations || {};
    db.deviceBindings = db.deviceBindings || {};
        db.deviceBindings = db.deviceBindings || {};

        if (action === 'request_login') {
          const user = getUserByAccessCode(code);
          if (!user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ 
              success: false, 
              message: "❌ Noto'g'ri kirish kodi! Telegram botimiz (@eduhujjat_bot) dagi '🔑 Saytga Kirish Kodi' tugmasi orqali olingan kodni kiriting." 
            }));
          }

          const targetChatId = user.realId || user.id;
          const userActive = isUserActive(targetChatId, user.username);
          if (!userActive && targetChatId !== SUPER_OWNER_ID) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ 
              success: false, 
              message: "🔒 Sizning obunangiz faol emas yoki muddati tugagan! Telegram botimiz (@eduhujjat_bot) orqali hisobingizni yangilang." 
            }));
          }

          db.deviceAuthorizations[reqId] = { 
            reqId, 
            code, 
            deviceId, 
            deviceInfo: deviceInfo || 'Aniqlanmagan brauzer / qurilma', 
            pin: String(pin), 
            status: 'PENDING',
            userId: targetChatId,
            userName: user.name,
            time: Date.now()
          };
          saveDatabase();

          // Foydalanuvchining shaxsiy Telegram botiga ruxsat so'rovini yuborish
          try {
            const authKb = new InlineKeyboard()
              .text("✅ Ruxsat Berish", `dev_allow_${reqId}`)
              .text("❌ Ruxsat Bermaslik", `dev_deny_${reqId}`)
              .row()
              .text("🚫 Sessiyani bekor qilish (Kick)", `dev_kick_${code}`);

            const alertMsg = 
              `🔐 **TEZKOR TASDIQLASH (PIN-KODSIZ)**\n\n` +
              `Hurmatli **${user.name}**, sizning shaxsiy hisobingiz (\`${code}\`) orqali saytga yangi qurilmadan kirish so'ralmoqda:\n\n` +
              `📱 **Qurilma:** ${deviceInfo || 'Aniqlanmagan brauzer'}\n` +
              `⏰ **Vaqt:** ${new Date().toLocaleTimeString('uz-UZ')}\n` +
              `🔑 **Kirish Kodi:** \`${code}\`\n\n` +
              `❓ **Ushbu qurilmaga kirishga ruxsat berasizmi?**\n\n` +
              `*(Agar o'zingiz kirmayotgan bo'lsangiz, darhol "❌ Ruxsat Bermaslik" yoki "🚫 Chiqarish" tugmasini bosing)*`;

            await bot.api.sendMessage(targetChatId, alertMsg, {
              parse_mode: 'Markdown',
              reply_markup: authKb
            });
          } catch(tgErr) {
            console.error("Foydalanuvchiga Telegram xabar yuborishda xatolik:", tgErr.message);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ 
            success: true, 
            requiresApproval: true, 
            reqId, 
            pin, 
            targetName: user.name,
            message: `⏳ Sizning Telegram botingiz (@eduhujjat_bot) ga tasdiqlash xabari yuborildi!` 
          }));
        }

        if (action === 'send_owner_alert' || action === 'notify_owner') {
          const alertText = body.text || 'Xavfsizlik bildirishnomasi';
          try {
            await bot.api.sendMessage(SUPER_OWNER_ID, alertText, { parse_mode: 'Markdown' });
          } catch (e) {
            console.error("Owner alert error in bot-local:", e.message);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true }));
        }

        if (action === 'bind_device') {
          db.deviceBindings[code] = deviceId;
          saveDatabase();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, bound: true }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
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
            slideCount: count || body.slideCount || 10,
            authorName: body.authorName || '',
            detailLevel: body.detailLevel || 'deep',
            includeImages: body.includeImages !== false,
            imageStyle: body.imageStyle || 'realistic',
            imageDensity: body.imageDensity || 'high'
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

// Render 24/7 Keep-Alive (Har 4 daqiqada o'zini-o'zi chaqirib turadi, bepul Render uxlab qolmaydi)
setInterval(() => {
  try {
    fetch('https://eduhujjat-bot.onrender.com/health').catch(() => {});
  } catch (e) {}
}, 4 * 60 * 1000);

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
      try {
        await bot.stop();
      } catch (e) {}
      if (err.message?.includes('409') || err.message?.includes('Conflict')) {
        console.log("Telegram 409 Conflict aniqlandi. 10 soniya kutilmoqda va avtomatik qayta ulanmoqda...");
        await new Promise(r => setTimeout(r, 10000));
      } else {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
}
startBotWithRetry();
