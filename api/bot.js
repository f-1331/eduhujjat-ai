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
    daily: 5000,
    weekly: 25000,
    monthly: 70000,
    unlimited: 290000
  },
  admins: new Set(['fayzbek1331']),
  ownerChatId: null,
  users: new Map(), // userId => { id, name, username, status: 'PENDING' | 'ACTIVE' | 'BLOCKED', plan, expiresAt }
  userSessions: new Map() // userId => oxirgi matn
};

// Yordamchi tekshiruvlar
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
  return user?.status === 'ACTIVE';
}

// 1. /start buyrug'i
bot.command('start', async (ctx) => {
  const user = ctx.from;
  const userId = user.id;
  const username = user.username || '';
  const fullName = `${user.first_name} ${user.last_name || ''}`.trim();

  // Agar Owner bo'lsa chat_id ni eslab qolamiz
  if (isOwner(ctx)) {
    db.ownerChatId = ctx.chat.id;
  }

  // Foydalanuvchini bazaga qo'shish yoki olish
  if (!db.users.has(userId)) {
    db.users.set(userId, {
      id: userId,
      name: fullName,
      username,
      status: isOwner(ctx) ? 'ACTIVE' : 'PENDING',
      plan: isOwner(ctx) ? 'unlimited' : 'none',
      registeredAt: new Date().toISOString()
    });

    // Agar yangi odam kirsa va u Owner bo'lmasa -> OWNER ga DARHOL xabar boradi!
    if (!isOwner(ctx) && db.ownerChatId) {
      try {
        const approveKeyboard = new InlineKeyboard()
          .text("✅ 1 Kun ruxsat", `approve_${userId}_daily`)
          .text("📅 1 Hafta", `approve_${userId}_weekly`)
          .row()
          .text("⭐ 1 Oy ruxsat", `approve_${userId}_monthly`)
          .text("👑 Cheksiz VIP", `approve_${userId}_unlimited`)
          .row()
          .text("❌ Rad etish / Bloklash", `block_${userId}`);

        await bot.api.sendMessage(
          db.ownerChatId,
          `🔔 **YANGI FOYDALANUVCHI RO'YXATDAN O'TDI!**\n\n` +
          `👤 **Ismi:** ${fullName}\n` +
          `🆔 **Telegram ID:** \`${userId}\`\n` +
          `🔗 **Username:** @${username || 'mavjud emas'}\n\n` +
          `Ushbu foydalanuvchiga qanday ruxsat berasiz?`,
          { parse_mode: 'Markdown', reply_markup: approveKeyboard }
        );
      } catch (err) {
        console.error("Ownerga xabar yuborishda xatolik:", err);
      }
    }
  }

  // A) AGAR OWNER BO'LSA:
  if (isOwner(ctx)) {
    const ownerKeyboard = new InlineKeyboard()
      .webApp("🚀 EduHujjat WebApp (Owner)", WEBAPP_URL)
      .row()
      .text("👥 Foydalanuvchilar arizalari", "owner_pending_users")
      .text("💰 Narxlarni boshqarish", "owner_prices")
      .row()
      .text("🛡 Adminlar boshqaruvi", "owner_admins")
      .text("📊 Umumiy Statistika", "owner_stats")
      .row()
      .text("📢 Ommaviy xabar yuborish", "owner_broadcast");

    return ctx.reply(
      `👑 **HURMATLI BOSHQARUVCHI (OWNER) @${OWNER_USERNAME}!**\n\n` +
      `Siz **EduHujjat AI** tizimining mutlaq boshqaruvchisiz. Barcha funksiyalar sizning to'liq nazoratingizda!\n\n` +
      `📌 **Sizning imkoniyatlaringiz:**\n` +
      `• Narxlarni xohlagan vaqt o'zgartirish;\n` +
      `• Yangi foydalanuvchilarga ruxsat berish / bloklash;\n` +
      `• Adminlar tayinlash va ularni o'chirish;\n` +
      `• WebApp-da o'zingizni har qanday rolda (Oddiy user, tekshiruvchi, admin) sinab ko'rish.`,
      { parse_mode: 'Markdown', reply_markup: ownerKeyboard }
    );
  }

  // B) AGAR ODDIY FOYDALANUVCHI VA HALI RUXSAT BERILMAGAN BO'LSA (YOPIQ TIZIM):
  if (!isUserActive(userId, username)) {
    const paywallKeyboard = new InlineKeyboard()
      .url(`💬 Boshqaruvchi bilan bog'lanish`, `https://t.me/${OWNER_USERNAME}`)
      .row()
      .webApp("🔒 WebApp tariflarini ko'rish", WEBAPP_URL);

    return ctx.reply(
      `🔒 **HURMATLI FOYDALANUVCHI!**\n\n` +
      `EduHujjat AI — maktablar, o'qituvchilar va ofis xodimlari uchun yopiq professional tizimdir.\n\n` +
      `📌 **Sizning arizangiz qabul qilindi va tasdiqlash uchun boshqaruvchiga (@${OWNER_USERNAME}) yuborildi.**\n\n` +
      `💳 **Rasmiy obuna tariflari:**\n` +
      `• 1 Kunlik (Sinov): \`${db.prices.daily.toLocaleString()} so'm\`\n` +
      `• 1 Haftalik: \`${db.prices.weekly.toLocaleString()} so'm\`\n` +
      `• 1 Oylik Pro (Tavsiya): \`${db.prices.monthly.toLocaleString()} so'm\`\n` +
      `• Cheksiz VIP: \`${db.prices.unlimited.toLocaleString()} so'm\`\n\n` +
      `To'lovni amalga oshirish va darhol ruxsat olish uchun quyidagi tugma orqali boshqaruvchiga yozing:`,
      { parse_mode: 'Markdown', reply_markup: paywallKeyboard }
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
    .text("🖼 Slayd yasash", "act_export_pptx")
    .row()
    .text("❓ 15 talik Test", "act_export_test")
    .text("🔄 Lotin-Kirill", "act_translit");

  await ctx.reply(
    `✅ **XUSH KELIBSIZ, ${fullName}!**\n\n` +
    `Sizning hisobingiz faol! Tartibsiz ro'yxat matnini yoki Word/Excel faylini tashlang, tizim avtomatik qayta ishlaydi.`,
    { parse_mode: 'Markdown', reply_markup: activeKeyboard }
  );
});

// 2. Owner uchun boshqaruv buyruqlari
bot.command('prices', async (ctx) => {
  if (!isOwner(ctx)) return;
  await ctx.reply(
    `💰 **AMALDAGI OBUNA NARXLARI:**\n\n` +
    `1. Kunlik: \`${db.prices.daily.toLocaleString()} so'm\`\n` +
    `2. Haftalik: \`${db.prices.weekly.toLocaleString()} so'm\`\n` +
    `3. Oylik: \`${db.prices.monthly.toLocaleString()} so'm\`\n` +
    `4. Cheksiz VIP: \`${db.prices.unlimited.toLocaleString()} so'm\`\n\n` +
    `Narxlarni o'zgartirish uchun WebApp Boshqaruv Markazidan foydalaning.`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('stats', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const total = db.users.size;
  let active = 0;
  db.users.forEach(u => { if (u.status === 'ACTIVE') active++; });

  await ctx.reply(
    `📊 **EDTIOR & EDUHUJJAT TIZIM STATISTIKASI:**\n\n` +
    `👥 Jami foydalanuvchilar: ${total} ta\n` +
    `✅ Faol ruxsatga egalar: ${active} ta\n` +
    `⏳ Kutilayotganlar: ${total - active} ta\n` +
    `🛡 Adminlar soni: ${db.admins.size} ta\n` +
    `👑 Boshqaruvchi: @${OWNER_USERNAME}`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('addadmin', async (ctx) => {
  if (!isOwner(ctx)) return;
  const parts = ctx.message.text.split(' ');
  if (parts.length < 2) {
    return ctx.reply("Foydalanish: `/addadmin username` (masalan: `/addadmin ali_admin`)", { parse_mode: 'Markdown' });
  }
  const newAdmin = parts[1].replace('@', '').toLowerCase().trim();
  db.admins.add(newAdmin);
  await ctx.reply(`✅ **@${newAdmin} muvaffaqiyatli ADMIN qilib tayinlandi!**`);
});

bot.command('removeadmin', async (ctx) => {
  if (!isOwner(ctx)) return;
  const parts = ctx.message.text.split(' ');
  if (parts.length < 2) {
    return ctx.reply("Foydalanish: `/removeadmin username`", { parse_mode: 'Markdown' });
  }
  const remAdmin = parts[1].replace('@', '').toLowerCase().trim();
  db.admins.delete(remAdmin);
  await ctx.reply(`🗑 **@${remAdmin} adminlar safidan chiqarildi.**`);
});

// 3. Callback Queries (Owner ruxsat berish tugmalari)
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;

  // Owner ruxsat berish amallari: approve_{userId}_{plan}
  if (data.startsWith('approve_')) {
    if (!isAdmin(ctx)) {
      return ctx.answerCallbackQuery({ text: "Sizda bunday huquq yo'q!", show_alert: true });
    }
    const [_, targetIdStr, plan] = data.split('_');
    const targetId = parseInt(targetIdStr, 10);

    const user = db.users.get(targetId);
    if (user) {
      user.status = 'ACTIVE';
      user.plan = plan;
      db.users.set(targetId, user);
    }

    await ctx.answerCallbackQuery({ text: `Foydalanuvchiga ${plan} ruxsat berildi!` });
    await ctx.editMessageText(
      `✅ **FOYDALANUVCHIGA RUXSAT BERILDI!**\n\n` +
      `👤 ID: \`${targetId}\`\n` +
      `Tarif: **${plan.toUpperCase()}**\n` +
      `Tasdiqlovchi: @${ctx.from?.username || 'admin'}`,
      { parse_mode: 'Markdown' }
    );

    // Foydalanuvchining o'ziga xushxabar yuborish
    try {
      await bot.api.sendMessage(
        targetId,
        `🎉 **TABRIKLAYMIZ! SIZGA RUXSAT BERILDI!**\n\n` +
        `Boshqaruvchi hisobingizni tasdiqladi. Endi siz botdan va WebApp'dan to'liq foydalanishingiz mumkin!`,
        {
          reply_markup: new InlineKeyboard().webApp("🚀 EduHujjat WebApp-ni ochish", WEBAPP_URL)
        }
      );
    } catch (e) {
      console.log("Foydalanuvchiga yetib bormadi:", e);
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
    await ctx.answerCallbackQuery({ text: "Foydalanuvchi bloklandi!" });
    await ctx.editMessageText(`❌ **Foydalanuvchi bloklandi.** (ID: \`${targetId}\`)`, { parse_mode: 'Markdown' });
    return;
  }

  // Oddiy hujjat generatsiya qilish tugmalari (agar ruxsat bo'lsa)
  const userId = ctx.from.id;
  const username = ctx.from.username;
  if (!isUserActive(userId, username)) {
    return ctx.answerCallbackQuery({
      text: `Hisobingiz tasdiqlanmagan. Iltimos @${OWNER_USERNAME} ga murojaat qiling!`,
      show_alert: true
    });
  }

  await ctx.answerCallbackQuery({ text: "Hujjat tayyorlanmoqda..." });
  // Hujjat generatsiya logikasi...
});

// 4. Matn qabul qilish (Faqat ruxsat berilganlar uchun)
bot.on('message:text', async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;

  if (!isUserActive(userId, username)) {
    return ctx.reply(
      `🔒 **Hisobingiz tasdiqlanmagan.**\n` +
      `Iltimos, avval boshqaruvchi (@${OWNER_USERNAME}) dan ruxsat oling!`,
      {
        reply_markup: new InlineKeyboard().url(`💬 @${OWNER_USERNAME} ga yozish`, `https://t.me/${OWNER_USERNAME}`)
      }
    );
  }

  const text = ctx.message.text;
  db.userSessions.set(userId, text);

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
