// Vercel Serverless Function: api/bot.js
import { Bot, webhookCallback, InlineKeyboard, InputFile } from 'grammy';
import * as XLSX from 'xlsx';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType 
} from 'docx';
import pptxgen from 'pptxgenjs';

const BOT_TOKEN = process.env.BOT_TOKEN || '9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduhujjat.vercel.app';

const bot = new Bot(BOT_TOKEN);

// Sessiyani xotirada saqlash uchun qisqa kesh (Serverless holatida oxirgi matnlar)
const userSessions = new Map();

// Helper: O'zbekcha transliteratsiya
function latinToCyrillic(str) {
  const map = {
    "o'": "ў", "g'": "ғ", "sh": "ш", "ch": "ч", "yo": "ё", "yu": "ю", "ya": "я",
    "O'": "Ў", "G'": "Ғ", "Sh": "Ш", "Ch": "Ч", "Yo": "Ё", "Yu": "Ю", "Ya": "Я",
    "a": "а", "b": "б", "d": "д", "e": "е", "f": "ф", "g": "г", "h": "ҳ",
    "i": "и", "j": "ж", "k": "к", "l": "л", "m": "м", "n": "н", "o": "о",
    "p": "п", "q": "қ", "r": "р", "s": "с", "t": "т", "u": "у", "v": "в",
    "x": "х", "y": "й", "z": "з",
    "A": "А", "B": "Б", "D": "Д", "E": "Е", "F": "Ф", "G": "Г", "H": "Ҳ",
    "I": "И", "J": "Ж", "K": "К", "L": "Л", "M": "М", "N": "Н", "O": "О",
    "P": "П", "Q": "Қ", "R": "Р", "S": "С", "T": "Т", "U": "У", "V": "В",
    "X": "Х", "Y": "Й", "Z": "З"
  };
  let res = str;
  for (const [k, v] of Object.entries(map)) {
    res = res.split(k).join(v);
  }
  return res;
}

function cyrillicToLatin(str) {
  const map = {
    "ў": "o'", "ғ": "g'", "ш": "sh", "ч": "ch", "ё": "yo", "ю": "yu", "я": "ya",
    "Ў": "O'", "Ғ": "G'", "Ш": "Sh", "Ч": "Ch", "Ё": "Yo", "Ю": "Yu", "Я": "Ya",
    "а": "a", "б": "b", "д": "d", "е": "e", "ф": "f", "г": "g", "ҳ": "h",
    "и": "i", "ж": "j", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
    "п": "p", "қ": "q", "р": "r", "с": "s", "т": "t", "у": "u", "в": "v",
    "х": "x", "й": "y", "з": "z", "э": "e",
    "А": "A", "Б": "B", "Д": "D", "Е": "E", "Ф": "F", "Г": "G", "Ҳ": "H",
    "И": "I", "Ж": "J", "К": "K", "Л": "L", "М": "M", "Н": "N", "О": "O",
    "П": "P", "Қ": "Q", "Р": "R", "С": "S", "Т": "T", "У": "U", "В": "V",
    "Х": "X", "Й": "Y", "З": "Z", "Э": "E"
  };
  let res = str;
  for (const [k, v] of Object.entries(map)) {
    res = res.split(k).join(v);
  }
  return res;
}

// Matndan o'quvchilarni tahlil qilish
function parseStudents(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 2);
  return lines.map((line, idx) => {
    const cleaned = line.replace(/^\d+[\.\)\-\:\s]+/, '').replace(/^[\-\*•\>\s]+/, '').trim();
    // Yilni topish
    const yearMatch = cleaned.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? yearMatch[0] : '';
    // Telefonni topish
    const phoneMatch = cleaned.match(/(?:\+?998[\s\-]?)?(?:\(?\d{2}\)?[\s\-]?)?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/);
    const phone = phoneMatch ? phoneMatch[0] : '';
    // Ism
    let name = cleaned.replace(year, '').replace(phone, '').replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      id: idx + 1,
      name: name || `O'quvchi ${idx + 1}`,
      year: year || '-',
      phone: phone || '-'
    };
  });
}

// 1. /start buyrug'i
bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .webApp("🚀 EduHujjat WebApp-ni ochish", WEBAPP_URL)
    .row()
    .text("🇺🇿 O'zbekcha", "lang_uz")
    .text("🇷🇺 Русский", "lang_ru")
    .text("🇬🇧 English", "lang_en");

  await ctx.reply(
    `👋 **Assalomu alaykum, ${ctx.from?.first_name || 'Hurmatli foydalanuvchi'}!**\n\n` +
    `🤖 **"EduHujjat AI"** — Maktablar, o'qituvchilar, talabalar va ofis xodimlari uchun aqlli hujjat tizimiga xush kelibsiz!\n\n` +
    `📌 **Bot nima qila oladi?**\n` +
    `1. Menga tartibsiz o'quvchilar ro'yxatini yoki matn yuboring.\n` +
    `2. Bir tugma bilan Alifbo bo'yicha saralash, Lotin-Kirill o'girish, Excel (.xlsx), Word (.docx), Slayd (.pptx) yoki Test tuzish imkoniyatlaridan foydalaning!\n\n` +
    `🌐 To'liq interfeysda ishlash uchun quyidagi **"EduHujjat WebApp"** tugmasini bosing:`,
    {
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    }
  );
});

// Inline klaviatura menyusi (Matn qabul qilinganda)
function getActionKeyboard() {
  return new InlineKeyboard()
    .text("🔤 Alifbo bo'yicha saralash (A-Z)", "act_sort_az")
    .row()
    .text("📅 Tug'ilgan yili bo'yicha saralash", "act_sort_year")
    .row()
    .text("🔄 Lotin <-> Kirill o'girish", "act_translit")
    .row()
    .text("📊 Excel (.xlsx) jadval qilish", "act_export_xlsx")
    .row()
    .text("📝 Word (.docx) jadval qilish", "act_export_docx")
    .row()
    .text("🖼 Matndan Slayd (.pptx) yasash", "act_export_pptx")
    .row()
    .text("❓ 15 talik Test (.docx) tuzish", "act_export_test")
    .row()
    .webApp("🌐 WebApp-da to'liq ochish", WEBAPP_URL);
}

// 2. Foydalanuvchi matn yuborganda
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text;
  const userId = ctx.from.id;

  // Xotiraga saqlash
  userSessions.set(userId, text);

  await ctx.reply(
    `📄 **Matn qabul qilindi!** (${text.length} ta belgi)\n\nQanday amalni bajarmoqchisiz? Quyidagi tugmalardan birini tanlang:`,
    {
      reply_markup: getActionKeyboard(),
      parse_mode: 'Markdown'
    }
  );
});

// 3. Callback Query (Tugmalar bosilganda)
bot.on('callback_query:data', async (ctx) => {
  const action = ctx.callbackQuery.data;
  const userId = ctx.from.id;
  const savedText = userSessions.get(userId) || 
    `1. aliyeva malika 2008 9-a 998901234567\n2. karimov jasur 2007 10-b 998919876543\n3. xolmatov sardor 2008 9-a 998935554433\n4. usmonova laylo 2009 8-b 998941112233`;

  await ctx.answerCallbackQuery({ text: "Hujjat tayyorlanmoqda..." });

  try {
    // A) Alifbo bo'yicha saralash
    if (action === 'act_sort_az') {
      const students = parseStudents(savedText);
      students.sort((a, b) => a.name.localeCompare(b.name, 'uz'));
      const formatted = students.map((s, i) => `${i + 1}. ${s.name} | ${s.year} | ${s.phone}`).join('\n');
      await ctx.reply(`🔤 **Alifbo bo'yicha saralangan ro'yxat:**\n\n${formatted}`, { parse_mode: 'Markdown' });
    }

    // B) Tug'ilgan yili bo'yicha saralash
    else if (action === 'act_sort_year') {
      const students = parseStudents(savedText);
      students.sort((a, b) => (parseInt(a.year, 10) || 0) - (parseInt(b.year, 10) || 0));
      const formatted = students.map((s, i) => `${i + 1}. ${s.name} | ${s.year} | ${s.phone}`).join('\n');
      await ctx.reply(`📅 **Tug'ilgan yili bo'yicha saralangan ro'yxat:**\n\n${formatted}`, { parse_mode: 'Markdown' });
    }

    // C) Lotin <-> Kirill
    else if (action === 'act_translit') {
      const isCyrillic = /[\u0400-\u04FF]/.test(savedText);
      const converted = isCyrillic ? cyrillicToLatin(savedText) : latinToCyrillic(savedText);
      const targetScript = isCyrillic ? "Lotin" : "Кирилл";
      await ctx.reply(`🔄 **${targetScript} alifbosiga o'girilgan matn:**\n\n${converted.slice(0, 3500)}`);
    }

    // D) Excel (.xlsx) jadval
    else if (action === 'act_export_xlsx') {
      const students = parseStudents(savedText);
      const data = students.map((s, i) => ({
        "№": i + 1,
        "Familiya Ism Sharifi": s.name,
        "Tug'ilgan yili": s.year,
        "Telefon": s.phone
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ro'yxat");
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      await ctx.replyWithDocument(new InputFile(buffer, "O'quvchilar_Ro'yxati.xlsx"));
    }

    // E) Word (.docx) jadval
    else if (action === 'act_export_docx') {
      const students = parseStudents(savedText);
      const tableRows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ children: [new Paragraph({ text: "№", bold: true })], width: { size: 800, type: WidthType.DXA } }),
            new TableCell({ children: [new Paragraph({ text: "Familiya Ism Sharifi", bold: true })], width: { size: 4500, type: WidthType.DXA } }),
            new TableCell({ children: [new Paragraph({ text: "Yili", bold: true })], width: { size: 1500, type: WidthType.DXA } }),
            new TableCell({ children: [new Paragraph({ text: "Telefon", bold: true })], width: { size: 2500, type: WidthType.DXA } }),
          ]
        }),
        ...students.map((s, i) => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(`${i + 1}`)] }),
            new TableCell({ children: [new Paragraph(s.name)] }),
            new TableCell({ children: [new Paragraph(s.year)] }),
            new TableCell({ children: [new Paragraph(s.phone)] }),
          ]
        }))
      ];

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: "O'QUVCHILAR RO'YXATI", alignment: AlignmentType.CENTER }),
            new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } })
          ]
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      await ctx.replyWithDocument(new InputFile(buffer, "O'quvchilar_Ro'yxati.docx"));
    }

    // F) PowerPoint (.pptx)
    else if (action === 'act_export_pptx') {
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9';

      const s1 = pres.addSlide();
      s1.background = { color: '0F172A' };
      s1.addText("EDUKATSIYA VA TA'LIM TAQDIMOTI", {
        x: 1.0, y: 2.0, w: 8.0, h: 1.5, fontSize: 32, bold: true, color: '38BDF8', align: 'center'
      });
      s1.addText("SmartOffice & EduAI Pro orqali generatsiya qilindi", {
        x: 1.0, y: 3.8, w: 8.0, h: 0.5, fontSize: 14, color: '94A3B8', align: 'center'
      });

      const s2 = pres.addSlide();
      s2.background = { color: '0F172A' };
      s2.addText("ASOSIY MAZMUN VA TEZISLAR", {
        x: 0.8, y: 0.8, w: 8.4, h: 0.8, fontSize: 24, bold: true, color: '38BDF8'
      });
      s2.addText(savedText.slice(0, 300) || "Taqdimot matni tafsilotlari...", {
        x: 0.8, y: 1.8, w: 8.4, h: 3.5, fontSize: 16, color: 'F8FAFC'
      });

      const nodeBuffer = await pres.write({ outputType: 'nodebuffer' });
      await ctx.replyWithDocument(new InputFile(nodeBuffer, "Taqdimot_Slaydlar.pptx"));
    }

    // G) 15 talik Test (.docx)
    else if (action === 'act_export_test') {
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: "NAZORAT TESTLARI (A va B Variantlar)", alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "1. O'zbekiston Respublikasi mustaqilligi qachon e'lon qilingan?\nA) 1991-yil 31-avgust (✓)\nB) 1991-yil 1-sentyabr\nC) 1992-yil 8-dekabr\nD) 1990-yil 24-mart" }),
            new Paragraph({ text: "2. Alisher Navoiy qaysi asarni 'Xamsa'ning birinchi dostoni sifatida yozgan?\nA) Hayrat ul-abror (✓)\nB) Farhod va Shirin\nC) Layli va Majnun\nD) Saddi Iskandariy" }),
            new Paragraph({ text: "JAVOBLAR KALITI: 1-A, 2-A..." })
          ]
        }]
      });
      const buffer = await Packer.toBuffer(doc);
      await ctx.replyWithDocument(new InputFile(buffer, "15_talik_Testlar.docx"));
    }
  } catch (err) {
    console.error("Bot amalida xatolik:", err);
    await ctx.reply("❌ Hujjatni yaratishda xatolik yuz berdi. Iltimos qayta urinib ko'ring yoki WebApp orqali oching.");
  }
});

// Vercel Serverless Function Handler
export default webhookCallback(bot, 'std/http');
