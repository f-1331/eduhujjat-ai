// Vercel Serverless Function: api/bot.js
import { Bot, webhookCallback, InlineKeyboard, Keyboard, InputFile } from 'grammy';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import pptxgen from 'pptxgenjs';
import { 
  callGemini, 
  generateAITestWithGemini, 
  generateAILessonPlanWithGemini, 
  generateAIOfficialOrderWithGemini, 
  generateAIProtocolWithGemini, 
  generateAIStudentReferenceWithGemini, 
  generateAIGammaCardsWithGemini 
} from '../src/utils/geminiAiService.js';
import { generateRealAIGammaCards } from '../src/utils/aiSlideEngine.js';
import { generateAITestSuite, generateAILessonPlan, generateAIOfficialOrder } from '../src/utils/universalAiBrain.js';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduhujjat.vercel.app';
const OWNER_USERNAME = (process.env.OWNER_USERNAME || 'fayzbek1331').replace('@', '');
const SUPER_OWNER_ID = 6707839718;

const bot = BOT_TOKEN ? new Bot(BOT_TOKEN) : null;

bot.catch((err) => {
  console.error("Vercel bot error:", err.message);
});

bot.api.config.use(async (prev, method, payload, signal) => {
  try {
    return await prev(method, payload, signal);
  } catch (err) {
    if (payload && payload.parse_mode && (err.message?.includes('parse') || err.message?.includes('entity'))) {
      const newPayload = { ...payload };
      delete newPayload.parse_mode;
      return await prev(method, newPayload, signal);
    }
    throw err;
  }
});

function getAccessCodeForUser(userId) {
  if (userId === SUPER_OWNER_ID) return "1331";
  const num = Math.abs((userId * 1331) % 900000) + 100000;
  return `EDU-${num}`;
}

bot.command('start', async (ctx) => {
  const userId = ctx.from.id;
  const isOwner = userId === SUPER_OWNER_ID;
  const code = getAccessCodeForUser(userId);

  return ctx.reply(
    `🌟 **Assalomu alaykum! "EduHujjat AI" platformasiga xush kelibsiz!**\n\n` +
    `🔑 **Sizning Saytga Kirish Kodingiz:** \`${code}\`\n\n` +
    `🤖 **Google Gemini AI bilan to'liq jihozlangan imkoniyatlar:**\n` +
    `• \`/ai <mavzu>\` — AI intellektual tahlili va testlar\n` +
    `• \`/test <mavzu>\` — 15 talik test va javoblar kaliti\n` +
    `• \`/dars <mavzu>\` — 45 daqiqalik namunaviy konspekt\n` +
    `• \`/gamma <mavzu>\` — Gamma AI Obsidian Dark slaydlar\n\n` +
    `👇 **Web platformada ochish uchun tugmani bosing:**`,
    {
      reply_markup: new InlineKeyboard()
        .webApp("🚀 Telegram Mini App-da Ochish", WEBAPP_URL)
        .row()
        .url("🌐 To'liq Brauzerda Ochish", WEBAPP_URL)
    }
  );
});

bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;

  if (text === '🔑 Saytga Kirish Kodi' || text === '/code' || text === '/kod') {
    const code = getAccessCodeForUser(userId);
    return ctx.reply(
      `🔑 **SIZNING SAYTGA KIRISH KODINGIZ:**\n\n\`${code}\`\n\n🌐 **Sayt:** ${WEBAPP_URL}`,
      {
        reply_markup: new InlineKeyboard().webApp("🚀 WebApp-da Ochish", WEBAPP_URL)
      }
    );
  }

  if (text.startsWith('/userlog') || text.startsWith('/audit') || text.startsWith('/tarix')) {
    if (userId !== SUPER_OWNER_ID) return ctx.reply("❌ Ruxsat yo'q!");
    const targetInput = text.replace(/^\/(?:userlog|audit|tarix)\s*/i, '').trim();
    if (!targetInput) {
      return ctx.reply("⚠️ Foydalanuvchi ID sini kiriting: `/userlog 9017407025`", { parse_mode: 'Markdown' });
    }
    try {
      const res = await fetch(`https://eduhujjat.vercel.app/api/device-auth?action=get_user_logs&userId=${encodeURIComponent(targetInput)}`);
      if (res.ok) {
        const data = await res.json();
        const logs = data.logs || [];
        if (logs.length === 0) {
          return ctx.reply(`ℹ️ Foydalanuvchi \`${targetInput}\` uchun amallar topilmadi (0 ta).`, { parse_mode: 'Markdown' });
        }
        let msg = `🔍 **FOYDALANUVCHI AUDIT TARIXI (OXIRGI ${logs.length} TA AMAL)**\n\n` +
          `🆔 **ID:** \`${targetInput}\`\n` +
          `📊 **Jami qayd etilgan amallar:** ${logs.length} ta\n\n`;
        logs.slice(0, 15).forEach((l, idx) => {
          msg += `**${idx + 1}.** [${l.timeFormatted || new Date(l.timestamp).toLocaleTimeString('uz-UZ')}] ${l.actionLabel || l.action}: *${(l.details || '').slice(0, 50)}*\n`;
        });
        if (logs.length > 15) {
          msg += `\n📄 *... va yana ${logs.length - 15} ta amal.*`;
        }
        return ctx.reply(msg, { parse_mode: 'Markdown' });
      }
    } catch(e) {
      return ctx.reply(`Xatolik: ${e.message}`);
    }
  }

  // Real Gemini AI /ai va mavzular handleri
  if (text.startsWith('/ai') || text === '🤖 EduAI Yordamchi' || !text.startsWith('/')) {
    const prompt = text.replace(/^\/ai\s*/i, '').replace('🤖 EduAI Yordamchi', '').trim();
    if (!prompt) {
      return ctx.reply("🤖 Savol yoki mavzuni yozing:\nMasalan: `/ai 8-sinf biologiya qon 10talik test`");
    }

    const waitMsg = await ctx.reply("⏳ **EduAI (Google Gemini) o'ylamoqda...**");
    try {
      let aiResult = "";
      const lower = prompt.toLowerCase();

      if (lower.includes('test') || lower.includes('savol')) {
        const countMatch = prompt.match(/(\d+)\s*talik/i);
        const count = countMatch ? parseInt(countMatch[1], 10) : 10;
        try {
          aiResult = await generateAITestWithGemini(prompt, count);
        } catch(e) {
          aiResult = generateAITestSuite(prompt, count);
        }
      } else if (lower.includes('konspekt') || lower.includes('dars') || lower.includes('reja')) {
        try {
          aiResult = await generateAILessonPlanWithGemini(prompt);
        } catch(e) {
          aiResult = generateAILessonPlan(prompt);
        }
      } else {
        try {
          aiResult = await callGemini(
            prompt,
            "Siz O'zbekiston Respublikasi Maktabgacha va Maktab Ta'limi Vazirligi mezonlari bo'yicha eng yuqori toifali pedagogik maslahatchi va metodistsiz. Har qanday ta'limiy savolga professional, to'liq va aniq o'zbek tilida javob bering."
          );
        } catch(e) {
          aiResult = `🤖 **EduAI Tahlili:** «${prompt}»`;
        }
      }

      const inline = new InlineKeyboard()
        .webApp("🚀 WebApp-da Ochish", WEBAPP_URL)
        .url("🌐 Saytda Ko'rish", WEBAPP_URL);

      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(aiResult, { reply_markup: inline });
    } catch(err) {
      try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
      return ctx.reply(`❌ EduAI xatosi: ${err.message}`);
    }
  }
});

export default webhookCallback(bot, 'http');
