# EduHujjat AI (SmartOffice & EduAI Pro) 🚀

> Maktablar (o'qituvchilar, o'quvchilar, direktor o'rinbosarlari), talabalar va ofis xodimlari uchun mukammal, ko'p funksiyali Web-platforma, Telegram Mini App (WebApp) va Telegram Bot.

![EduHujjat AI](https://img.shields.io/badge/Status-Production%20Ready-emerald)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)
![Telegram Bot](https://img.shields.io/badge/Telegram-@eduhujjat__bot-blue)

---

## 🌟 Asosiy Modullar va Imkoniyatlar

### 1. 🧹 "Aqlli Saralash va Tozalash" Moduli (Data Cleaner)
- **Aralash ro'yxatni tartiblash**: Matn yoki Word/Excel fayllardan F.I.Sh, tug'ilgan sana, sinf, telefon va manzilni avtomatik ajratib olish (Regex Parsing).
- **Alifbo tartibi (A-Z va Z-A)**: O'zbek tili qoidalariga xos tarzda (`O'`, `G'`, `Sh`, `Ch` harflarini hisobga olgan holda) to'g'ri saralash.
- **Yosh va sana bo'yicha saralash**: Tug'ilgan sana bo'yicha saralash, o'quvchining yoshini avtomatik hisoblash.
- **Dublikatlarni tozalash**: Takrorlangan yozuvlarni bir zumda tozalash.
- **Ism-familiya standartizatsiyasi**: Kichik harflarni to'g'irlash, telefonlarni yagona `+998 (XX) XXX-XX-XX` formatiga keltirish.
- **Jinsni aniqlash**: Ism-sharif qo'shimchalariga qarab o'g'il va qiz bolalarni ajratish hamda statistikasini hisoblash.

### 2. 📊 "Excel Avtomatlashtirish va Hisob-kitob" Moduli
- **Avto-Reyting va Baholar**: GPA, o'zlashtirish foizi (%), "A'lochi (5)", "Yaxshi (4)", "Qoniqarli (3)" toifalarini hisoblab reyting tuzish.
- **Davomat (Tabel) Generatori**: Yil va oy bo'yicha ish va dam olish kunlari ajratilgan haqiqiy Excel (.xlsx) tabeli.
- **Dars jadvali va Navbatchilik**: Haftalik dars jadvali va navbatchilar taqsimoti grafigi.

### 3. 🖼 "PowerPoint Slayd Generator" Moduli
- **Mavzudan Slaydga**: 4 xil zamonaviy dizayn uslubi (Zamonaviy, Akademik, Minimalist, Bolalarbop) bilan `.pptx` taqdimot generatsiyasi.
- **Ma'ruzachi nutqi (Speaker Notes)**: Har bir slayd uchun o'qituvchi doskada nima gapirishi kerakligini tayyorlab berish.
- **Viktorina (Quiz) slaydlari**: Dars yakunida o'quvchilar bilimini sinash slaydlari.

### 4. 📝 "Word va Maktab Hujjatlari Fabrikasi" Moduli
- **Variantli Test Generatori**: Savollar va A, B, C, D variantlari aralashtirilgan 2 yoki 4 xil variant + Javoblar Kaliti bilan rasmiy `.docx` fayl.
- **Dars Ishlanmasi (Konspekt)**: 45 daqiqalik dars rejasi andozasi.
- **GOST Referat va Mustaqil ish**: Times New Roman 14pt, 1.5 interval, Titul, Mundarija, Xulosa va Adabiyotlar ro'yxati.
- **Rasmiy xat va arizalar**: Maktab direktori nomiga ariza, tavsifnoma (xarakteristika), majlis bayonnomasi.

### 5. 🔤 "O'zbek Tili va Universal AI Chat" Moduli
- **Lotin <-> Kirill Transliterator**: To'liq o'zbek qoidalariga mos ikki tomonlama konvertor.
- **Imlo va uslubni to'g'rilash**.
- **Erkin AI Buyruq (Universal Chat)**: Ro'yxat yoki matnga istalgan buyruqni berish imkoniyati.

### 6. 🏆 "Sertifikat va Faxriy Yorliq Generatori" Moduli
- Oltin hoshiyali, rasmiy maktab muhri va haqiqiy **QR-kod** bilan ta'minlangan A4 albom formatdagi Faxriy Yorliqlarni PDF formatda yuklab olish.

---

## 🤖 Telegram Bot & Telegram Mini App (WebApp)

- **Telegram Bot Username**: [@eduhujjat_bot](https://t.me/eduhujjat_bot)
- **Vercel WebApp Manzili**: [https://eduhujjat.vercel.app](https://eduhujjat.vercel.app)
- **Webhook Endpoint**: `https://eduhujjat.vercel.app/api/bot`

### Botga Webhook o'rnatish buyrug'i:
```bash
curl -F "url=https://eduhujjat.vercel.app/api/bot" https://api.telegram.org/bot9001772632:AAEe8hXmKAhWwE7VHK1Vd8FMia6TcqYI0Mk/setWebhook
```

---

## 💻 Mahalliy Ishga Tushirish (Local Development)

```bash
# 1. Repozitoriyni klonlash
git clone https://github.com/USERNAME/eduhujjat-ai.git
cd eduhujjat-ai

# 2. Paketlarni o'rnatish
npm install

# 3. Loyihani ishga tushirish
npm run dev
```
