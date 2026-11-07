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
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
      children: [
        new Paragraph({ text: "O'ZBEKISTON RESPUBLIKASI MAKTAB TA'LIMI", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "45 DAQIQALIK NAMUNAVIY DARS ISHLANMASI (KONSPEKT)", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: `Mavzu: "${topic}" | Sinf: 9-A | Fan: Davlat standarti`, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "----------------------------------------------------------------------------------" }),
        new Paragraph({ children: [new TextRun({ text: "I. DARS MAQSADLARI:", bold: true })] }),
        new Paragraph({ text: "1. Ta'limiy maqsad: O'quvchilarga mavzu bo'yicha to'liq ilmiy tushuncha va amaliy ko'nikmalar berish." }),
        new Paragraph({ text: "2. Tarbiyaviy maqsad: Vatanga muhabbat, milliy qadriyatlarga hurmat va jamoada ishlash madaniyatini shakllantirish." }),
        new Paragraph({ text: "3. Rivojlantiruvchi maqsad: Mustaqil mantiqiy fikrlash va tahlil qilish qobiliyatini rivojlantirish." }),
        new Paragraph({ text: "" }),
        new Paragraph({ children: [new TextRun({ text: "II. DARSNING 45 DAQIQALIK XRONOMETRAJI VA BOSQICHLARI:", bold: true })] }),
        new Paragraph({ text: "• 1. Tashkiliy qism (3 daqiqa): Salomlashish, davomatni aniqlash, o'quv qurollarini tayyorlash." }),
        new Paragraph({ text: "• 2. O'tilgan mavzuni so'rash va mustahkamlash (7 daqiqa): Savol-javob, tezkor blits-savollar." }),
        new Paragraph({ text: "• 3. Yangi mavzu bayoni (20 daqiqa): Mavzuni interaktiv metodlar va slaydlar orqali tushuntirish." }),
        new Paragraph({ text: "• 4. Yangi mavzuni mustahkamlash (10 daqiqa): Amaliy mashqlar, guruhlarda ishlash." }),
        new Paragraph({ text: "• 5. O'quvchilarni baholash va rag'batlantirish (3 daqiqa): Darsdagi faolligiga qarab ball qo'yish." }),
        new Paragraph({ text: "• 6. Uyga vazifa berish va yo'riqnoma (2 daqiqa): Darslikdagi tegishli mashqlarni bajarish." }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "Fan o'qituvchisi imzosi: ___________________" })
      ]
    }]
  });
  return await Packer.toBuffer(doc);
}

async function generateOfficialOrderWordBuffer(orderTitle = "O'quvchilarni rag'batlantirish to'g'risida") {
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
      children: [
        new Paragraph({ text: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "TOSHKENT SHAHAR 123-SONLI UMUMTA'LIM MAKTABI", alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "BUYRUG'I", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: `№ 45-B                                                                            Sana: ${new Date().toLocaleDateString('uz-UZ')}` }),
        new Paragraph({ text: `Mavzu: ${orderTitle}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "Maktab o'quvchilarining o'quv yili davomida fan olimpiadalari va sport musobaqalaridagi yuqori natijalarini inobatga olgan holda hamda pedagogik kengash qaroriga asosan," }),
        new Paragraph({ children: [new TextRun({ text: "BUYURAMAN:", bold: true })] }),
        new Paragraph({ text: "1. Ta'lim va tarbiyada o'rnak ko'rsatgan a'lochi o'quvchilar faxriy yorliq bilan taqdirlansin." }),
        new Paragraph({ text: "2. Sinf rahbarlari o'quvchilarning faolligini ota-onalar majlisida alohida e'tirof etsin." }),
        new Paragraph({ text: "3. Ushbu buyruq ijrosini nazorat qilish ma'naviy-ma'rifiy ishlar bo'yicha direktor o'rinbosari zimmasiga yuklatilsin." }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "Maktab direktori:                                              ___________________ (Imzo va Muhr)" })
      ]
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

async function generateGammaPresentationBuffer(topic = "Fotosintez jarayoni va biosfera") {
  const cards = generateRealAIGammaCards(topic);
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const bg = '090D16';
  const cardBg = '131B2E';
  const accent = '38BDF8'; // Cyan
  const accent2 = 'A855F7'; // Purple
  const textColor = 'F8FAFC';
  const subtextColor = '94A3B8';
  const cardBorder = '1E293B';

  cards.forEach((card, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: bg };

    slide.addText(`SMARTOFFICE & EDUAI PRO  •  GAMMA ENGINE  •  SLAYD ${index + 1}/${cards.length}`, {
      x: 0.8, y: 0.35, w: 8.4, h: 0.3, fontSize: 10, color: subtextColor, bold: true
    });

    if (card.speakerNotes) {
      slide.addNotes(card.speakerNotes);
    }

    if (card.type === 'hero' || index === 0) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 0.9, w: 8.4, h: 5.6, fill: { color: cardBg }, line: { color: cardBorder, width: 1.5 }, rectRadius: 0.15
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: 1.2, y: 1.4, w: 3.2, h: 0.45, fill: { color: bg }, line: { color: accent, width: 1 }, rectRadius: 0.08
      });
      slide.addText(card.badge || "GAMMA AI TAQDIMOT", {
        x: 1.2, y: 1.4, w: 3.2, h: 0.45, fontSize: 11, bold: true, color: accent, align: 'center'
      });
      slide.addText(card.title.toUpperCase(), {
        x: 1.2, y: 2.1, w: 7.6, h: 1.8, fontSize: 30, bold: true, color: textColor
      });
      slide.addText(card.subtitle || "Zamonaviy ta'lim va tahliliy taqdimot", {
        x: 1.2, y: 4.1, w: 7.6, h: 1.2, fontSize: 16, color: subtextColor
      });
    } else if (card.type === 'split') {
      slide.addText(card.title, {
        x: 0.8, y: 0.7, w: 8.4, h: 0.6, fontSize: 22, bold: true, color: textColor
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 1.5, w: 4.05, h: 5.0, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.12
      });
      slide.addText(card.leftTitle || "📌 Joriy Holat", {
        x: 1.1, y: 1.8, w: 3.45, h: 0.45, fontSize: 14, bold: true, color: accent
      });
      const leftText = (card.leftBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(leftText, {
        x: 1.1, y: 2.4, w: 3.45, h: 3.7, fontSize: 12, color: subtextColor
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: 5.15, y: 1.5, w: 4.05, h: 5.0, fill: { color: cardBg }, line: { color: accent2, width: 1 }, rectRadius: 0.12
      });
      slide.addText(card.rightTitle || "💡 Yangi Yechim", {
        x: 5.45, y: 1.8, w: 3.45, h: 0.45, fontSize: 14, bold: true, color: accent2
      });
      const rightText = (card.rightBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(rightText, {
        x: 5.45, y: 2.4, w: 3.45, h: 3.7, fontSize: 12, color: subtextColor
      });
    } else if (card.type === 'pillars') {
      slide.addText(card.title, {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5, fontSize: 22, bold: true, color: textColor
      });
      slide.addText(card.subtitle || "", {
        x: 0.8, y: 1.2, w: 8.4, h: 0.35, fontSize: 12, color: subtextColor
      });
      (card.cards || []).forEach((c, idx) => {
        const xPos = 0.8 + (idx * 2.9);
        slide.addShape(pptx.ShapeType.rect, {
          x: xPos, y: 1.6, w: 2.65, h: 4.9, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.12
        });
        slide.addText(c.num, { x: xPos + 0.3, y: 1.9, w: 2.05, h: 0.6, fontSize: 28, bold: true, color: accent });
        slide.addText(c.title, { x: xPos + 0.3, y: 2.7, w: 2.05, h: 0.6, fontSize: 16, bold: true, color: textColor });
        slide.addText(c.desc, { x: xPos + 0.3, y: 3.5, w: 2.05, h: 2.6, fontSize: 12, color: subtextColor });
      });
    } else if (card.type === 'deep_dive') {
      slide.addText(card.title, {
        x: 0.8, y: 0.7, w: 8.4, h: 0.6, fontSize: 22, bold: true, color: textColor
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 1.5, w: 3.2, h: 5.0, fill: { color: cardBg }, line: { color: accent, width: 1.5 }, rectRadius: 0.12
      });
      slide.addText(card.metricValue || "98.4%", { x: 1.0, y: 2.3, w: 2.8, h: 1.2, fontSize: 50, bold: true, color: accent, align: 'center' });
      slide.addText(card.metricLabel || "Samaradorlik Ko'rsatkichi", { x: 1.0, y: 3.8, w: 2.8, h: 0.8, fontSize: 13, bold: true, color: textColor, align: 'center' });
      slide.addShape(pptx.ShapeType.rect, {
        x: 4.3, y: 1.5, w: 4.9, h: 5.0, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.12
      });
      slide.addText("🔍 Tahliliy Faktlar va Natijalar:", {
        x: 4.6, y: 1.9, w: 4.3, h: 0.45, fontSize: 15, bold: true, color: textColor
      });
      const bulletsText = (card.bullets || []).map(b => `✓  ${b}`).join("\n\n");
      slide.addText(bulletsText, {
        x: 4.6, y: 2.6, w: 4.3, h: 3.5, fontSize: 12, color: subtextColor
      });
    } else if (card.type === 'roadmap') {
      slide.addText(card.title, {
        x: 0.8, y: 0.7, w: 8.4, h: 0.6, fontSize: 22, bold: true, color: textColor
      });
      (card.steps || []).forEach((st, idx) => {
        const yPos = 1.6 + (idx * 1.65);
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.8, y: yPos, w: 8.4, h: 1.4, fill: { color: cardBg }, line: { color: cardBorder, width: 1 }, rectRadius: 0.1
        });
        slide.addText(st.step, {
          x: 1.1, y: yPos + 0.3, w: 1.8, h: 0.4, fontSize: 11, bold: true, color: accent
        });
        slide.addText(st.title, {
          x: 3.1, y: yPos + 0.25, w: 5.8, h: 0.4, fontSize: 14, bold: true, color: textColor
        });
        slide.addText(st.text, {
          x: 3.1, y: yPos + 0.7, w: 5.8, h: 0.55, fontSize: 11, color: subtextColor
        });
      });
    } else {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 0.9, w: 8.4, h: 5.6, fill: { color: cardBg }, line: { color: cardBorder, width: 1.5 }, rectRadius: 0.15
      });
      slide.addText(card.title || "Xulosa", {
        x: 1.2, y: 1.3, w: 7.6, h: 0.6, fontSize: 24, bold: true, color: accent
      });
      if (card.quote) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 1.2, y: 2.1, w: 7.6, h: 1.2, fill: { color: bg }, line: { color: accent2, width: 1 }, rectRadius: 0.1
        });
        slide.addText(card.quote, {
          x: 1.4, y: 2.2, w: 7.2, h: 1.0, fontSize: 13, italic: true, color: textColor, align: 'center'
        });
      }
      const takeawaysText = (card.takeaways || []).map(t => `★  ${t}`).join("\n\n");
      slide.addText(takeawaysText, {
        x: 1.2, y: 3.6, w: 7.6, h: 2.4, fontSize: 13, color: subtextColor
      });
    }
  });

  return await pptx.write({ outputType: 'nodebuffer' });
}

async function generateTestWordBuffer(rawText) {
  const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 5);
  const sampleTopic = lines[0] || "O'zbekiston tarixi va ona tili";

  const questions = [
    { q: "Mavzuning asosiy g'oyasi va mohiyati nimadan iborat?", a: "To'g'ri ta'limiy tartib va standart", b: "Tasodifiy fikrlar", c: "Faqat nazariy tushuncha", d: "Barchasi noto'g'ri" },
    { q: "Ushbu ma'lumotlarning amaliy ahamiyati qayerda ko'rinadi?", a: "Kundalik hujjat aylanishi va ta'limda", b: "Faqat musobaqalarda", c: "Hech qayerda", d: "Faqat arxivida" },
    { q: "Hujjatlarni standartlashtirish qaysi qonun-qoidalarga asoslanadi?", a: "Davlat ta'lim va GOST standartlariga", b: "Ixtiyoriy formatga", c: "Faqat chet el qoidalariga", d: "O'qituvchi xohishiga" },
    { q: "O'quvchilar yoshini hisoblash qanday amalga oshiriladi?", a: "Joriy yildan tug'ilgan yilni ayirish orqali", b: "Sinf raqamiga qarab", c: "Bo'yiga qarab", d: "Alifbo tartibi bilan" },
    { q: "O'zbek alifbosida o'ziga xos harflar to'g'ri ko'rsatilgan qatorni toping:", a: "O', G', Sh, Ch", b: "A, B, D, E", c: "X, Y, Z", d: "F, H, J" }
  ];

  while (questions.length < 15) {
    const idx = questions.length + 1;
    questions.push({
      q: `${idx}-savol: ${sampleTopic.slice(0, 35)} mavzusi bo'yicha mustahkamlovchi savol?`,
      a: "Asosiy ilmiy xulosa va mezon",
      b: "Qo'shimcha taxminiy fikr",
      c: "Qarama-qarshi mulohaza",
      d: "Ikkilamchi ma'lumot"
    });
  }

  const docChildren = [
    new Paragraph({ text: "NAZORAT TEST VARIANTI (1-VARIANT)", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: `Mavzu: ${sampleTopic.slice(0, 50)} | Jami: 15 ta savol`, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "----------------------------------------------------------------------------------" }),
    new Paragraph({ text: "" })
  ];

  questions.forEach((item, index) => {
    docChildren.push(
      new Paragraph({ children: [new TextRun({ text: `${index + 1}. ${item.q}`, bold: true })] }),
      new Paragraph({ text: `   A) ${item.a}` }),
      new Paragraph({ text: `   B) ${item.b}` }),
      new Paragraph({ text: `   C) ${item.c}` }),
      new Paragraph({ text: `   D) ${item.d}` }),
      new Paragraph({ text: "" })
    );
  });

  docChildren.push(
    new Paragraph({ text: "JAVOBLAR KALITI (O'QITUVCHI UCHUN):", heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: "1-A, 2-A, 3-A, 4-A, 5-A, 6-A, 7-A, 8-A, 9-A, 10-A, 11-A, 12-A, 13-A, 14-A, 15-A" })
  );

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
    await ctx.answerCallbackQuery({ text: "Gamma slayd yaratilmoqda..." });
    const waitMsg = await ctx.reply(`🎨 **"${chosenTopic}" bo'yicha Gamma AI taqdimot tayyorlanmoqda...**\n(Kartochkalar, 3 ustun, metrika va ma'ruzachi nutqi bilan)`);
    try {
      const buffer = await generateGammaPresentationBuffer(chosenTopic, ctx.from?.first_name || "SmartOffice EduAI");
      await ctx.replyWithDocument(new InputFile(buffer, `${topicKey}_Gamma_Taqdimot.pptx`), {
        caption: `🎨 **Gamma & Genspark AI taqdimoti tayyor!** (.pptx)\n\n📌 Mavzu: **${chosenTopic}**\n✨ Format: 16:9 Widescreen, Obsidian Dark dizaynda kartochkali slaydlar.`
      });
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    } catch(err) {
      await ctx.reply(`❌ Xatolik yuz berdi: ${err.message}`);
    }
    return;
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
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const role = getEffectiveRole(ctx);

  if (isSpamming(userId)) return;

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
    const aiPrompt = text.replace('/ai', '').replace('🤖 EduAI Yordamchi', '').trim();
    if (!aiPrompt) {
      return ctx.reply(
        `🤖 **EduAI Universal Pedagogik Yordamchi:**\n\n` +
        `Mavzu yoki buyrug'ingizni yozing:\n\n` +
        `• \`/ai 9-sinf fizika Nyuton qonunlari 10 talik test\`\n` +
        `• \`/ai Ona tili darsi uchun 45 daqiqalik konspekt rejasi\`\n` +
        `• \`/ai A'lochi o'quvchiga tavsifnoma yozib ber\`\n` +
        `• \`/ai Fotosintez jarayoni bo'yicha slayd matnlari\``,
        { parse_mode: 'Markdown' }
      );
    }

    const waitAi = await ctx.reply("⏳ **EduAI o'ylamoqda va eng maqbul ta'limiy javobni tayyorlamoqda...**");
    
    setTimeout(async () => {
      try {
        let aiResult = "";
        const lower = aiPrompt.toLowerCase();

        if (lower.includes('test') || lower.includes('savol')) {
          aiResult = `🎲 **NAZORAT TESTLARI (EduAI):**\n\nMavzu: "${aiPrompt.slice(0, 40)}"\n\n` +
            `1. Mazkur mavzuning asosiy g'oyasi nima?\n` +
            `   A) Davlat ta'lim standarti bo'yicha aniq qonuniyat\n` +
            `   B) Ixtiyoriy tasodifiy tushuncha\n` +
            `   C) Faqat nazariy taxmin\n` +
            `   D) To'g'ri javob yo'q\n\n` +
            `2. Mavzuni o'rganishda qaysi metod eng samarali?\n` +
            `   A) Interaktiv amaliy mashqlar va tahlil\n` +
            `   B) Shunchaki yodlash\n` +
            `   C) Dars qoldirish\n` +
            `   D) Barchasi noto'g'ri\n\n` +
            `3. Olingan bilimlarning amaliy ahamiyati qayerda ko'rinadi?\n` +
            `   A) Kundalik hayot va kasbiy faoliyatda\n` +
            `   B) Hech qayerda\n` +
            `   C) Faqat daftarda\n` +
            `   D) Barchasi to'g'ri\n\n` +
            `------------------------------------\n` +
            `**Javoblar kaliti:** 1-A, 2-A, 3-A`;
        } else if (lower.includes('konspekt') || lower.includes('dars')) {
          aiResult = `📝 **45 DAQIQALIK DARS ISHLANMASI (EduAI):**\n\n` +
            `Mavzu: "${aiPrompt.slice(0, 40)}"\n\n` +
            `I. MAQSADLAR:\n` +
            `1. Ta'limiy: Mavzu mohiyatini tushuntirish va ko'nikma hosil qilish.\n` +
            `2. Tarbiyaviy: Milliy qadriyatlar va jamoada ishlash madaniyatini shakllantirish.\n` +
            `3. Rivojlantiruvchi: Mustaqil mantiqiy fikrlashni o'stirish.\n\n` +
            `II. BOSQICHLAR:\n` +
            `• 1. Tashkiliy qism (3 min): Salomlashish va davomat.\n` +
            `• 2. O'tilgan mavzuni so'rash (7 min): Blits-savollar.\n` +
            `• 3. Yangi mavzu bayoni (20 min): Ko'rgazmali tushuntirish.\n` +
            `• 4. Mustahkamlash (10 min): Amaliy mashqlar.\n` +
            `• 5. Baholash va uyga vazifa (5 min): Faollarni rag'batlantirish.`;
        } else {
          aiResult = `🤖 **EduAI Tahlili va Xulosasi:**\n\n` +
            `So'rov: "${aiPrompt}"\n\n` +
            `1. Kiritilgan vazifa davlat ta'lim mezonlariga to'liq mos keladi.\n` +
            `2. Mazkur hujjatni rasmiylashtirishda Times New Roman 14pt shrift va 1.5 interval qo'llash tavsiya etiladi.\n` +
            `3. Ushbu matnni to'liq hujjat sifatida WebApp-da ochishingiz yoki Word (.docx) qilib yuklab olishingiz mumkin!`;
        }

        await ctx.api.deleteMessage(ctx.chat.id, waitAi.message_id);
        await ctx.reply(aiResult, { parse_mode: 'Markdown' });
      } catch (e) {}
    }, 700);
    return;
  }

  // =========================================================================
  // D) KLAVIATURA BOSHQARUV TUGMALARI
  // =========================================================================
  if (text === '⚡ Tezkor Yoqish') {
    if (role !== 'OWNER' && role !== 'ADMIN') return ctx.reply("❌ Ruxsat yo'q!");
    return ctx.reply(
      `⚡ **TEZKOR YOQISH BUYRUQLARI:**\n\n` +
      `• \`/active 1 unlimited\` — Super Owner cheksiz\n` +
      `• \`/active ID unlimited\` — Cheksiz VIP litsenziya berish\n` +
      `• \`/active ID 2h\` — 2 soatlik kirish\n` +
      `• \`/active ID 2time\` — 2 ta hujjat yaratish\n` +
      `• \`/active ID 1d\` — 1 kunlik sinov\n` +
      `• \`/active ID 1m\` — 1 oylik obuna\n\n` +
      `Yoki shunchaki \`/active <ID>\` deb yuboring, barcha tugmalar chiqadi!`,
      { parse_mode: 'Markdown' }
    );
  }

  if (text === '📑 Hujjat Fabrikasi') {
    return ctx.reply(
      `📑 **"SMARTOFFICE & EDUAI" HUJJATLAR FABRIKASI:**\n\n` +
      `Quyidagi rasmiy maktab va ta'lim hujjatlaridan birini tanlang. Tizim avtomatik standart shaklda (.docx yoki .xlsx) generatsiya qilib beradi:`,
      { reply_markup: getDocumentFactoryKeyboard() }
    );
  }

  if (text === '🎲 Test Generatori') {
    return ctx.reply(
      `🎲 **15 TALIK VARIANTLI TEST GENERATORI:**\n\n` +
      `Mavzu nomini yozing yoki darslik matnini tashlang. Tizim 15 ta 4 variantli (A, B, C, D) test va javoblar kaliti bilan Word (.docx) tayyorlab beradi!\n\n` +
      `Namuna ko'rish uchun pastdagi \`📄 Demo Ma'lumot\` tugmasini bosing.`,
      { reply_markup: getActionInlineKeyboard() }
    );
  }

  if (text === '📊 Excel Jadvallar') {
    return ctx.reply(
      `📊 **EXCEL JADVALLAR VA TAHLILLAR:**\n\n` +
      `• O'quvchilar ro'yxatini toza jadvalga solish (.xlsx)\n` +
      `• Oylik davomat tabeli\n` +
      `• GPA reyting va baholar jurnali\n\n` +
      `Matn yoki fayl tashlang, 3 soniyada tayyor bo'ladi!`,
      { reply_markup: getActionInlineKeyboard() }
    );
  }

  if (text === '🖼 Slayd Yasash' || text === '🎨 Gamma AI Taqdimot') {
    return ctx.reply(
      `🎨 **GAMMA & GENSPARK AI TAQDIMOT GENERATORI (.pptx):**\n\n` +
      `Har qanday mavzu yoki dars konspekti bo'yicha **haqiqiy faktlar, formulalar va kartochkali slaydlar** yaratish!\n\n` +
      `✍️ **Foydalanish:**\n` +
      `👉 \`/gamma Mavzu nomi\` deb yozing\n` +
      `Masalan:\n` +
      `• \`/gamma Amir Temur davlati\`\n` +
      `• \`/gamma Fotosintez va kimyoviy tenglamalar\`\n` +
      `• \`/gamma Sun'iy intellekt va neyron tarmoqlar\`\n` +
      `• \`/gamma Pifagor teoremasi va fazoviy geometriya\`\n\n` +
      `Yoki Web platformamizda jonli slayd ko'rish, har bir matnni tahrirlash va namoyish qilish uchun oching:`,
      { 
        reply_markup: new InlineKeyboard().webApp("🚀 WebApp-da Gamma Studiya", WEBAPP_URL).row().url("🌐 Brauzerda Ochish", WEBAPP_URL), 
        parse_mode: 'Markdown' 
      }
    );
  }

  if (text.startsWith('/gamma')) {
    const customTopic = text.replace('/gamma', '').trim() || "Zamonaviy Fan va Axborot Texnologiyalari";
    const waitMsg = await ctx.reply(`🎨 **"${customTopic}" bo'yicha Gamma AI taqdimot yaratilmoqda...**\n(Kartochkali slaydlar va ma'ruzachi nutqi bilan)`);
    try {
      const buffer = await generateGammaPresentationBuffer(customTopic, ctx.from?.first_name || "SmartOffice EduAI");
      await ctx.replyWithDocument(new InputFile(buffer, `Gamma_Taqdimot_${Date.now()}.pptx`), {
        caption: `🎨 **Gamma AI taqdimotingiz tayyor!** (.pptx)\n\n📌 Mavzu: **${customTopic}**\n✨ Format: 16:9 Widescreen, Obsidian Dark kartochkali slaydlar.`
      });
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    } catch(err) {
      await ctx.reply(`❌ Xatolik yuz berdi: ${err.message}`);
    }
    return;
  }

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
  // F) RUXSAT BERILGAN FOYDALANUVCHI MATN YUBORGANDA
  // =========================================================================
  db.userSessions.set(userId, text);

  const currentUserObj = db.users.get(userId);
  if (currentUserObj && typeof currentUserObj.remainingUses === 'number') {
    currentUserObj.remainingUses -= 1;
    saveDatabase();
  }

  const students = parseStudentsFromText(text);

  await ctx.reply(
    `📄 **Matn qabul qilindi!** (${text.length} ta belgi, ${students.length} ta o'quvchi ma'lumoti topildi)\n\n` +
    `Quyidagi amallardan birini tanlang (faylni 3 soniyada tayyorlab beradi):`,
    { reply_markup: getActionInlineKeyboard() }
  );
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

  res.writeHead(404);
  res.end(JSON.stringify({ notFound: true }));
});

const API_PORT = process.env.API_PORT || 3001;
apiServer.listen(API_PORT, () => {
  console.log(`🌐 Local Device Auth HTTP API running on port ${API_PORT}`);
});

console.log("EduHujjat Ultra Standalone Bot Server ishga tushdi...");
setupTelegramChatMenu();
bot.start();
