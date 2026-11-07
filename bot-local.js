// bot-local.js - "SmartOffice & EduAI Pro" Telegram Bot (Professional Server Engine)
import { Bot, InlineKeyboard, Keyboard, InputFile } from 'grammy';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import pptxgen from 'pptxgenjs';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import https from 'https';

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
    ownerChatId: null,
    users: {},
    simulatedRoles: {}
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      prices: { ...defaultDb.prices, ...(parsed.prices || {}) },
      admins: Array.isArray(parsed.admins) ? parsed.admins : ['fayzbek1331'],
      ownerChatId: parsed.ownerChatId || null,
      users: parsed.users || {},
      simulatedRoles: parsed.simulatedRoles || {}
    };
  } catch (err) {
    console.error("DB o'qishda xatolik, standart baza yuklandi:", err);
    return defaultDb;
  }
}

const memoryDb = loadDatabase();
const db = {
  prices: memoryDb.prices,
  admins: new Set(memoryDb.admins),
  ownerChatId: memoryDb.ownerChatId,
  users: new Map(Object.entries(memoryDb.users).map(([k, v]) => [parseInt(k, 10), v])),
  userSessions: new Map(),
  simulatedRoles: new Map(Object.entries(memoryDb.simulatedRoles).map(([k, v]) => [parseInt(k, 10), v])),
  rateLimits: new Map() // Anti-spam flood control
};

function saveDatabase() {
  try {
    ensureDataDir();
    const serialized = {
      prices: db.prices,
      admins: Array.from(db.admins),
      ownerChatId: db.ownerChatId,
      users: Object.fromEntries(db.users),
      simulatedRoles: Object.fromEntries(db.simulatedRoles)
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(serialized, null, 2), 'utf-8');
  } catch (err) {
    console.error("DB saqlashda xatolik:", err);
  }
}

// 3. XAVFSIZLIK VA FOYDALANUVCHI HUQUQLARI
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
    saveDatabase();
    return false;
  }
  return true;
}

// Anti-spam tekshiruvi (sekundiga 1 ta so'rov)
function isSpamming(userId) {
  const now = Date.now();
  const lastTime = db.rateLimits.get(userId) || 0;
  if (now - lastTime < 700) {
    return true;
  }
  db.rateLimits.set(userId, now);
  return false;
}

// Excel formula injection sanitization
function sanitizeFormula(val) {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (['=', '+', '-', '@', '\t', '\r'].includes(trimmed.charAt(0))) {
    return `'${trimmed}`;
  }
  return trimmed;
}

// 4. PARSER VA TRANSLITERATSIYA UTILLARI
const OZB_LATIN_TO_CYR = {
  "sh": "ш", "Sh": "Ш", "SH": "Ш",
  "ch": "ч", "Ch": "Ч", "CH": "Ч",
  "o'": "ў", "O'": "Ў", "o‘": "ў", "O‘": "Ў", "o`": "ў", "O`": "Ў",
  "g'": "ғ", "G'": "Ғ", "g‘": "ғ", "G‘": "Ғ", "g`": "ғ", "G`": "Ғ",
  "yu": "ю", "Yu": "Ю", "YU": "Ю",
  "ya": "я", "Ya": "Я", "YA": "Я",
  "yo": "ё", "Yo": "Ё", "YO": "Ё",
  "ye": "е", "Ye": "Е", "YE": "Е",
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
  multiKeys.forEach(k => {
    res = res.split(k).join(OZB_LATIN_TO_CYR[k]);
  });
  return res.split('').map(char => OZB_LATIN_TO_CYR[char] || char).join('');
}

function parseStudentsFromText(rawText) {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const students = [];

  lines.forEach((line, index) => {
    // 1. Tartib raqamni tozalash: "1. ", "1)", "[1]"
    let clean = line.replace(/^\s*\[?\d+[\.\)\-\]]\s*/, '').trim();

    // 2. Telefon raqamini ajratish: +998901234567 yoki 998901234567
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

    // 3. Tug'ilgan sanani ajratish (DD.MM.YYYY yoki YYYY)
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

    // 4. Sinfni ajratish: "10-A", "9 B", "11-sinf"
    let className = '';
    const classMatch = clean.match(/\b(\d{1,2})\s*[\-\.]?\s*([A-Za-zА-Яа-яЎўҒғҚқҲҳ])\b/);
    if (classMatch) {
      className = `${classMatch[1]}-${classMatch[2].toUpperCase()}`;
      clean = clean.replace(classMatch[0], ' ').trim();
    }

    // 5. Ism-familiya standartlashtirish
    clean = clean.replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = clean.split(' ').map(w => {
      if (w.toLowerCase() === "o'g'li" || w.toLowerCase() === "og'li") return "o'g'li";
      if (w.toLowerCase() === "qizi") return "qizi";
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });
    const fullName = words.join(' ') || `O'quvchi #${index + 1}`;

    // 6. Jinsini aniqlash
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

// 5. REAL FAYL GENERATORLARI
// A) Excel (.xlsx) Generatori
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
    ["SMARTOFFICE & EDUAI PRO - TARTIBLANGAN RO'YXAT"],
    [`Hosil qilingan sana: ${new Date().toLocaleDateString('uz-UZ')} | Jami: ${students.length} nafar`],
    [],
    headerRow,
    ...dataRows
  ]);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 34 },
    { wch: 16 },
    { wch: 10 },
    { wch: 16 },
    { wch: 22 },
    { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Tartiblangan ro'yxat");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

// B) Word (.docx) Generatori
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

// C) PowerPoint (.pptx) Generatori
async function generatePowerPointBuffer(students, title = "SmartOffice Taqdimoti") {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Sarlavha slaydi
  const slide1 = pptx.addSlide();
  slide1.background = { color: '0F172A' }; // Dark slate
  slide1.addText(title.toUpperCase(), {
    x: 0.8, y: 2.2, w: '85%', fontSize: 32, bold: true, color: '38BDF8', align: 'center'
  });
  slide1.addText("EduHujjat & SmartOffice AI tomonidan avtomatlashtirilgan taqdimot", {
    x: 1.0, y: 3.5, w: '80%', fontSize: 18, color: '94A3B8', align: 'center'
  });
  slide1.addText(`Tayyorlangan sana: ${new Date().toLocaleDateString('uz-UZ')}`, {
    x: 1.0, y: 5.5, w: '80%', fontSize: 14, color: '64748B', align: 'center'
  });

  // Tarkib slaydlari (har bir slaydga 5 tadan o'quvchi kartochkasi)
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

  // Yakuniy slayd
  const lastSlide = pptx.addSlide();
  lastSlide.background = { color: '0F172A' };
  lastSlide.addText("E'TIBORINGIZ UCHUN RAHMAT!", {
    x: 1.0, y: 2.8, w: '80%', fontSize: 32, bold: true, color: '38BDF8', align: 'center'
  });

  return await pptx.write({ outputType: 'nodebuffer' });
}

// D) 15 talik Test Generatori (.docx)
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
    new Paragraph({
      text: "NAZORAT TEST VARIANTI (1-VARIANT)",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      text: `Mavzu: ${sampleTopic.slice(0, 50)} | Jami: 15 ta savol`,
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({ text: "----------------------------------------------------------------------------------" }),
    new Paragraph({ text: "" })
  ];

  questions.forEach((item, index) => {
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: `${index + 1}. ${item.q}`, bold: true })]
      }),
      new Paragraph({ text: `   A) ${item.a}` }),
      new Paragraph({ text: `   B) ${item.b}` }),
      new Paragraph({ text: `   C) ${item.c}` }),
      new Paragraph({ text: `   D) ${item.d}` }),
      new Paragraph({ text: "" })
    );
  });

  // Javoblar kaliti
  docChildren.push(
    new Paragraph({
      text: "JAVOBLAR KALITI (O'QITUVCHI UCHUN):",
      heading: HeadingLevel.HEADING_2
    }),
    new Paragraph({
      text: "1-A, 2-A, 3-A, 4-A, 5-A, 6-A, 7-A, 8-A, 9-A, 10-A, 11-A, 12-A, 13-A, 14-A, 15-A"
    })
  );

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 720 } } },
      children: docChildren
    }]
  });

  return await Packer.toBuffer(doc);
}

// 6. KLAVIATURADA TURADIGAN TUGMALAR (REPLY KEYBOARDS)
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

// Telegramdan faylni Buffer qilib yuklab olish
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

// 7. BOT BUYRUQLARI VA HODISALARI
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
    saveDatabase();
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
      `📁 **Fayl qabul qilish:** Word (.docx), Excel (.xlsx) yoki matn yuboring — bot 3 soniyada tayyorlab beradi!\n\n` +
      `⚡ **Tezkor Faollashtirish:**\n` +
      `• \`/active ID 2h\` yoki \`${userId} 2soat\`\n` +
      `• \`/active ID 2time\` yoki \`${userId} 2martalik\`\n` +
      `• \`/setprice oneTime 3000\` (Narxni o'zgartirish)`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  if (role === 'ADMIN') {
    return ctx.reply(
      `🛡️ **ASSALOMU ALAYKUM ADMINISTRATOR!**\n\n` +
      `Foydalanuvchilarni faollashtirish, muddat berish va statistikani ko'rish huquqiga egasiz.\n` +
      `Pastdagi boshqaruv tugmalaridan foydalaning:`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  if (role === 'INSPECTOR') {
    return ctx.reply(
      `🔍 **ASSALOMU ALAYKUM TEKSHIRUVCHI (AUDITOR)!**\n\n` +
      `Siz tizim statistikasi, arxivlar va foydalanuvchilar holatini tekshirish rejimidasiz.`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    );
  }

  if (!active) {
    return ctx.reply(
      `🔒 **ASSALOMU ALAYKUM, ${fullName}!**\n\n` +
      `**"EduHujjat AI"** — Maktablar, o'qituvchilar va ofislar uchun professional hujjatlar platformasi.\n\n` +
      `Sizning Telegram ID: \`${userId}\`\n\n` +
      `👇 **Kerakli tarifni tanlang:** Ma'lumotlaringiz va narx avtomatik tarzda boshqaruvchiga (@${OWNER_USERNAME}) yuboriladi va to'lovdan so'ng hisobingiz darhol yoqib beriladi:`,
      { parse_mode: 'Markdown', reply_markup: replyKeyboard }
    ).then(() => {
      ctx.reply(`👇 **Tarifni tanlang:**`, { reply_markup: getTariffInlineKeyboard(userId) });
    });
  }

  const curUser = db.users.get(userId);
  const remainingInfo = curUser?.remainingUses ? `(Qolgan imkoniyat: ${curUser.remainingUses} ta)` : '';

  return ctx.reply(
    `✅ **XUSH KELIBSIZ, ${fullName}!**\n\n` +
    `Sizning hisobingiz faol! ${remainingInfo}\n\n` +
    `📎 **Word (.docx), Excel (.xlsx) faylini tashlang yoki matn yozing** — tizim bir necha soniyada qayta ishlab, tayyor faylni qaytaradi!`,
    { parse_mode: 'Markdown', reply_markup: replyKeyboard }
  );
});

// 8. FAYL QABUL QILISH (WORD, EXCEL, TXT)
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

  const waitMsg = await ctx.reply(`⏳ **"${fileName}" fayli qabul qilinmoqda va tahlil qilinmoqda...**`);

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
      return ctx.reply("❌ Noma'lum fayl formati! Iltimos faqat .docx, .xlsx, .csv yoki .txt fayl yuboring.");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
      return ctx.reply("⚠️ Fayl ichida matn topilmadi.");
    }

    db.userSessions.set(userId, extractedText);

    const students = parseStudentsFromText(extractedText);
    await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);

    return ctx.reply(
      `✅ **FAYL MUVAFFAQIYATLI O'QILDI!**\n\n` +
      `📄 Fayl: **${fileName}**\n` +
      `👥 Aniqlangan yozuvlar: **${students.length} nafar**\n\n` +
      `👇 **Qanday formatda qayta ishlab yuklab olmoqchisiz?**`,
      { parse_mode: 'Markdown', reply_markup: getActionInlineKeyboard() }
    );
  } catch (err) {
    console.error("Fayl yuklashda xatolik:", err);
    try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
    return ctx.reply(`❌ Faylni ochishda xatolik yuz berdi: ${err.message}`);
  }
});

// 9. INLINE TUGMALAR VA HODISALAR
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  // A) Rejim almashtirish menyusi
  if (data === 'switch_roles') {
    if (!isRealSuperOwner(ctx)) return ctx.answerCallbackQuery({ text: "Faqat Owner uchun!" });
    return ctx.reply("🎭 **Qaysi rejimga o'tmoqchisiz?**", { reply_markup: getRoleSwitchKeyboard() });
  }

  if (data.startsWith('set_role_')) {
    if (!isRealSuperOwner(ctx)) return ctx.answerCallbackQuery({ text: "Faqat Owner uchun!" });
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

  // B) Xarid tugmalari: buy_{plan}_{userId}
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

  // C) Owner litsenziya berish: act_{userId}_{planCode}
  if (data.startsWith('act_') && !['act_export_xlsx', 'act_export_docx', 'act_export_pptx', 'act_export_test', 'act_sort_az', 'act_sort_year', 'act_translit'].includes(data)) {
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
    saveDatabase();

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
        { reply_markup: userReplyKb }
      );
    } catch (e) {}
    return;
  }

  // D) REAL FAYL GENERATSIYASI VA YUKLAB BERISH (3 SONIYADA)
  const currentText = db.userSessions.get(userId);
  if (!currentText) {
    return ctx.answerCallbackQuery({ text: "Avval matn yoki fayl yuboring!", show_alert: true });
  }

  const students = parseStudentsFromText(currentText);

  // 1. EXCEL (.XLSX)
  if (data === 'act_export_xlsx') {
    await ctx.answerCallbackQuery({ text: "Excel jadval yaratilmoqda..." });
    const progressMsg = await ctx.reply("⏳ **Excel (.xlsx) fayl yaratilmoqda...**");
    try {
      const buffer = generateExcelBuffer(students);
      await ctx.replyWithDocument(new InputFile(buffer, "EduHujjat_Tartiblangan_Jadval.xlsx"), {
        caption: `📊 **Excel jadval tayyor!** (${students.length} nafar o'quvchi ma'lumotlari bilan)`
      });
      await ctx.api.deleteMessage(ctx.chat.id, progressMsg.message_id);
    } catch (e) {
      await ctx.reply("Xatolik yuz berdi: " + e.message);
    }
    return;
  }

  // 2. WORD (.DOCX)
  if (data === 'act_export_docx') {
    await ctx.answerCallbackQuery({ text: "Word hujjat yaratilmoqda..." });
    const progressMsg = await ctx.reply("⏳ **Word (.docx) hujjat yaratilmoqda...**");
    try {
      const buffer = await generateWordBuffer(students);
      await ctx.replyWithDocument(new InputFile(buffer, "EduHujjat_Rasmiy_Royxat.docx"), {
        caption: `📝 **Word hujjat tayyor!** (GOST standarti bo'yicha jadvalli formatda)`
      });
      await ctx.api.deleteMessage(ctx.chat.id, progressMsg.message_id);
    } catch (e) {
      await ctx.reply("Xatolik yuz berdi: " + e.message);
    }
    return;
  }

  // 3. POWERPOINT (.PPTX)
  if (data === 'act_export_pptx') {
    await ctx.answerCallbackQuery({ text: "PowerPoint taqdimot yaratilmoqda..." });
    const progressMsg = await ctx.reply("⏳ **Slaydlar (.pptx) generatsiya qilinmoqda...**");
    try {
      const buffer = await generatePowerPointBuffer(students, "EduHujjat Taqdimot");
      await ctx.replyWithDocument(new InputFile(buffer, "EduHujjat_Taqdimot.pptx"), {
        caption: `🖼 **PowerPoint taqdimot tayyor!** (Zamonaviy slaydlar bilan)`
      });
      await ctx.api.deleteMessage(ctx.chat.id, progressMsg.message_id);
    } catch (e) {
      await ctx.reply("Xatolik yuz berdi: " + e.message);
    }
    return;
  }

  // 4. 15 TALIK TEST (.DOCX)
  if (data === 'act_export_test') {
    await ctx.answerCallbackQuery({ text: "15 talik test tuzilmoqda..." });
    const progressMsg = await ctx.reply("⏳ **15 talik test va javoblar kaliti tuzilmoqda...**");
    try {
      const buffer = await generateTestWordBuffer(currentText);
      await ctx.replyWithDocument(new InputFile(buffer, "EduHujjat_15_Test_va_Kalitlar.docx"), {
        caption: `❓ **15 talik test tayyor!** (Variantlar va to'g'ri javoblar kaliti bilan)`
      });
      await ctx.api.deleteMessage(ctx.chat.id, progressMsg.message_id);
    } catch (e) {
      await ctx.reply("Xatolik yuz berdi: " + e.message);
    }
    return;
  }

  // 5. ALIFBO SARALASH (A-Z)
  if (data === 'act_sort_az') {
    await ctx.answerCallbackQuery({ text: "Alifbo bo'yicha saralandi!" });
    const sorted = [...students].sort((a, b) => a.fullName.localeCompare(b.fullName, 'uz-UZ'));
    let out = `🔤 **ALIFBO BO'YICHA TARTIBLANGAN RO'YXAT (A-Z):**\n\n`;
    sorted.forEach((s, idx) => {
      out += `${idx + 1}. **${s.fullName}** — ${s.birthDate} (${s.age} yosh) | ${s.phone}\n`;
    });
    return ctx.reply(out.slice(0, 4000), { parse_mode: 'Markdown', reply_markup: getActionInlineKeyboard() });
  }

  // 6. YOSH VA TUG'ILGAN YIL BO'YICHA SARALASH
  if (data === 'act_sort_year') {
    await ctx.answerCallbackQuery({ text: "Yosh bo'yicha saralandi!" });
    const sorted = [...students].sort((a, b) => b.birthYear - a.birthYear);
    let out = `📅 **YOSH VA TUG'ILGAN SANA BO'YICHA SARALANGAN:**\n\n`;
    sorted.forEach((s, idx) => {
      out += `${idx + 1}. **${s.fullName}** — ${s.birthDate} (${s.age} yosh) | ${s.gender}\n`;
    });
    return ctx.reply(out.slice(0, 4000), { parse_mode: 'Markdown', reply_markup: getActionInlineKeyboard() });
  }

  // 7. LOTIN <-> KIRILL TRANSLITERATSIYA
  if (data === 'act_translit') {
    await ctx.answerCallbackQuery({ text: "Kirill yozuviga o'girildi!" });
    const cyrillicText = transliterateLatinToCyrillic(currentText);
    return ctx.reply(
      `🔄 **KIRILL YOZUVIGA O'GIRILGAN MATN:**\n\n\`\`\`\n${cyrillicText.slice(0, 3500)}\n\`\`\``,
      { parse_mode: 'Markdown', reply_markup: getActionInlineKeyboard() }
    );
  }
});

// 10. KLAVIATURA TUGMALARI VA MATN BUYRUQLARI
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const role = getEffectiveRole(ctx);

  if (isSpamming(userId)) return;

  // A) Klaviatura: Rejimni almashtirish
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
      saveDatabase();
      const ownerKb = getReplyKeyboardForRole('OWNER');
      return ctx.reply(
        `👑 **Asosiy Super Owner rejimiga qaytdingiz!**\nBarcha boshqaruv tugmalari qaytarildi.`,
        { reply_markup: ownerKb }
      );
    }
  }

  // Klaviatura: Tezkor Yoqish
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

  // Klaviatura: Narxlar
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

  // Narxni o'zgartirish (Owner)
  if (text.startsWith('/setprice ') && role === 'OWNER') {
    const parts = text.split(/\s+/);
    if (parts.length === 3) {
      const planName = parts[1];
      const newPrice = parseInt(parts[2], 10);
      if (newPrice > 0 && db.prices[planName] !== undefined) {
        db.prices[planName] = newPrice;
        saveDatabase();
        return ctx.reply(`✅ **${planName}** tarifi narxi \`${newPrice.toLocaleString()} so'm\` ga o'zgartirildi va saqlandi!`, { parse_mode: 'Markdown' });
      }
    }
    return ctx.reply("❌ Noto'g'ri format! Namuna: `/setprice oneTime 3000` yoki `/setprice monthly 80000`", { parse_mode: 'Markdown' });
  }

  // Ommaviy xabar yuborish (Broadcast)
  if (text === '📢 Ommaviy Xabar' && role === 'OWNER') {
    return ctx.reply(
      `📢 **Barcha foydalanuvchilarga xabar yuborish:**\n\n` +
      `Quyidagi formatda yozing:\n` +
      `\`/broadcast Hurmatli foydalanuvchilar, tizimimizda yangi funksiyalar qo'shildi!\``,
      { parse_mode: 'Markdown' }
    );
  }

  if (text.startsWith('/broadcast ') && role === 'OWNER') {
    const broadcastText = text.replace('/broadcast ', '').trim();
    if (!broadcastText) return ctx.reply("Xabar matnini kiriting!");
    
    let sentCount = 0;
    const users = Array.from(db.users.keys());
    for (const uId of users) {
      try {
        await bot.api.sendMessage(uId, `📢 **DIQQAT E'LON!**\n\n${broadcastText}`, { parse_mode: 'Markdown' });
        sentCount++;
      } catch (e) {}
    }
    return ctx.reply(`✅ Xabar **${sentCount} ta** foydalanuvchiga muvaffaqiyatli yetkazildi!`);
  }

  // Klaviatura: Foydalanuvchilar
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

  // Klaviatura: Adminlar
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

  if (text.startsWith('/addadmin ') && role === 'OWNER') {
    const newAdmin = text.replace('/addadmin ', '').trim().replace('@', '').toLowerCase();
    db.admins.add(newAdmin);
    saveDatabase();
    return ctx.reply(`✅ @${newAdmin} muvaffaqiyatli admin etib tayinlandi!`);
  }
  if (text.startsWith('/deladmin ') && role === 'OWNER') {
    const delAdmin = text.replace('/deladmin ', '').trim().replace('@', '').toLowerCase();
    db.admins.delete(delAdmin);
    saveDatabase();
    return ctx.reply(`❌ @${delAdmin} adminlikdan chiqarildi!`);
  }

  // Klaviatura: Statistika
  if (text === '📊 Statistika' || text === '📊 Tizim Statistikasi') {
    return ctx.reply(
      `📊 **EDUKATSIYA TIZIMI STATISTIKASI:**\n\n` +
      `• Jami foydalanuvchilar: ${db.users.size}\n` +
      `• Faol hisoblar: ${Array.from(db.users.values()).filter(u => u.status === 'ACTIVE').length}\n` +
      `• Kutishdagilar (Pending): ${Array.from(db.users.values()).filter(u => u.status === 'PENDING').length}\n` +
      `• Adminlar: ${db.admins.size}\n` +
      `• Baza holati: Doimiy (data/database.json)\n` +
      `• WebApp: ${WEBAPP_URL}`,
      { parse_mode: 'Markdown' }
    );
  }

  // Klaviatura: WebApp ochish
  if (text === '🌐 WebApp Ochish' || text === '🌐 Mini App-ni Ochish') {
    const webappInline = new InlineKeyboard().webApp("🚀 EduHujjat WebApp-ni Ochish", WEBAPP_URL);
    return ctx.reply("Quyidagi tugma orqali WebApp-ga kiring:", { reply_markup: webappInline });
  }

  // Klaviatura: Litsenziya olish
  if (text === '💳 Litsenziya Sotib Olish' || text === '💳 Muddatni Uzaytirish') {
    return ctx.reply(
      `👇 **Kerakli tarifni tanlang:**`,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }

  // Klaviatura: Demo ma'lumot
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
      saveDatabase();

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
          { reply_markup: userReplyKb }
        );
      } catch (e) {}
      return;
    }
  }

  // C) Ruxsat tekshiruvi
  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Hisobingiz hali tasdiqlanmagan.**\n\n` +
      `Sizning Telegram ID: \`${userId}\`\n\n` +
      `Quyidagi tariflardan birini tanlang va to'lovni tasdiqlang:`,
      { reply_markup: getTariffInlineKeyboard(userId) }
    );
  }

  // D) Foydalanuvchi matn yuborganda
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

console.log("EduHujjat Pro Standalone Bot Server muvaffaqiyatli ishga tushdi...");
bot.start();
