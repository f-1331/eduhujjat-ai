import React, { useState } from 'react';
import { Bot, Sparkles, Send, Copy, Download, Check, RefreshCw, FileText, FileSpreadsheet, Lightbulb } from 'lucide-react';
import { generateOfficialDocumentDocx } from '../utils/wordGenerator';
import { saveAs } from 'file-saver';

export default function EduAIModule() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 'lesson_plan',
      title: "📝 45 daqiqalik Dars Rejasi",
      desc: "Mavzu bo'yicha to'liq ta'limiy, tarbiyaviy maqsadlar va 6 bosqichli xronometraj",
      prompt: "O'zbekiston tarixi fanidan 'Amir Temur davlati va diplomatiyasi' mavzusida 45 daqiqalik dars ishlanmasi (konspekt) rejasini tuzib ber."
    },
    {
      id: 'quiz',
      title: "🎲 10 talik Variantli Test",
      desc: "4 ta javob varianti (A, B, C, D) va oxirida o'qituvchi uchun javoblar kaliti",
      prompt: "9-sinf fizika fanidan 'Nyuton qonunlari' mavzusida 10 ta murakkablik darajasi turlicha bo'lgan test va javoblar kalitini tuzib ber."
    },
    {
      id: 'referat',
      title: "🎓 Referat & Kurs ishi Rejasi",
      desc: "Titul, Mundarija, Kirish, Asosiy qismlar, Xulosa va Adabiyotlar",
      prompt: "Informatika va sun'iy intellekt fanidan 'Zamonaviy neyrotarmoqlar va ularning ta'limdagi o'rni' mavzusida referat rejasi va kirish qismini yozib ber."
    },
    {
      id: 'tavsifnoma',
      title: "🔍 O'quvchiga Tavsifnoma (Xarakteristika)",
      desc: "Ijobiy axloq, darslardagi faollik, olimpiada yutuqlari va tarbiyaviy tahlil",
      prompt: "10-A sinf a'lochi o'quvchisi Aliyev Sardor uchun fan olimpiadasida qatnashish va tuman hokimligi stipendiyasiga tavsiya etiladigan rasmiy tavsifnoma yozib ber."
    },
    {
      id: 'order_draft',
      title: "📋 Maktab Buyrug'i Loyihasi",
      desc: "Qonuniy asoslar, buyuraman qismi va mas'ul shaxslar ko'rsatilgan rasmiy buyruq",
      prompt: "Maktabda o'quvchilar o'rtasida 'Kitobxonlik haftaligi'ni o'tkazish to'g'risida maktab direktori nomidan rasmiy buyruq loyihasini tayyorlab ber."
    },
    {
      id: 'grammar',
      title: "✍️ Imlo va Rasmiy Uslubga Solish",
      desc: "Ortiqcha probellar, grammatik xatolarni tuzatib, sof rasmiy tilga o'tkazish",
      prompt: "Ushbu xatdagi barcha imlo xatolarini tuzatib, rasmiy uslubga sol: 'hurmatli direktor meni bolam kecha shamolab qolgani sababli darsga borolmadi iltimos sababli deb hisoblang'."
    }
  ];

  const handleGenerate = (customPrompt) => {
    const q = customPrompt || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setResponse('');

    setTimeout(() => {
      let aiResult = "";
      const lower = q.toLowerCase();

      if (lower.includes('dars') || lower.includes('konspekt')) {
        aiResult = `📚 O'ZBEKISTON RESPUBLIKASI MAKTAB TA'LIMI
45 DAQIQALIK NAMUNAVIY DARS ISHLANMASI (KONSPEKT)

Mavzu: "${q.slice(0, 50)}"
Sinf: 9-sinf | Fan: Davlat ta'lim standarti asosida

I. DARS MAQSADLARI:
1. Ta'limiy: O'quvchilarga mavzu bo'yicha ilmiy asoslangan tushuncha va amaliy malakalarni shakllantirish.
2. Tarbiyaviy: Milliy qadriyatlarga hurmat, vatanga sadoqat va jamoada ishlash madaniyatini singdirish.
3. Rivojlantiruvchi: Mantiqiy fikrlash, tanqidiy mulohaza va mustaqil xulosa chiqarishni o'stirish.

II. DARSNING BOSQICHLARI VA XRONOMETRAJI (45 MINUT):
1. Tashkiliy qism (3 min): Salomlashish, davomatni yo'qlash, sinf xonasi va o'quv qurollarini tayyorlash.
2. O'tilgan mavzuni so'rash (7 min): "Zinama-zina" va blits-savol usullari orqali bilimlarni tekshirish.
3. Yangi mavzu bayoni (20 min): Slaydlar, ko'rgazmali vositalar va interaktiv taqdimot orqali mavzuni tushuntirish.
4. Mustahkamlash (10 min): O'quvchilarni kichik guruhlarga bo'lib amaliy mashqlar va krossvord yechish.
5. Baholash (3 min): Darsda faol ishtirok etgan o'quvchilarni rag'batlantirish va baholarini jurnalga qayd etish.
6. Uyga vazifa (2 min): Darslikdagi asosiy qoidalarni takrorlash va ijodiy topshiriqni bajarish.

Tuzuvchi: EduAI Pro Ilg'or Pedagogik Modeli`;
      } else if (lower.includes('test') || lower.includes('savol')) {
        aiResult = `🎲 NAZORAT TESTLARI VARIANTI (10 TALIK)
Mavzu: "${q.slice(0, 50)}"

1. Mavzuning asosiy ilmiy mohiyati nima?
   A) Aniq qonuniyat va amaliy tajriba asosida isbotlangan nazariya
   B) Tasodifiy taxminlar to'plami
   C) Faqat og'zaki afsonalar
   D) To'g'ri javob yo'q

2. Ushbu jarayonning amaliyotdagi eng asosiy vazifasi qaysi?
   A) Inson faoliyati va ta'lim samaradorligini oshirish
   B) Jarayonni sekinlashtirish
   C) Xarajatlarni oshirish
   D) Ma'lumotlarni o'chirish

3. Ilmiy izlanishlarda qaysi mezon eng yuqori hisoblanadi?
   A) Aniqlik va ishonchlilik
   B) Ko'p vaqt sarflash
   C) Faqat tashqi ko'rinish
   D) Murakkab so'zlar ishlatish

4. O'zbekiston ta'lim tizimida qaysi standart amal qiladi?
   A) Davlat Ta'lim Standartlari (DTS)
   B) Ixtiyoriy qoidalar
   C) Shaxsiy fikrlar
   D) Faqat xorijiy ko'rsatmalar

5. Mazkur mavzuni mustahkamlashda qaysi metod eng samarali?
   A) Interaktiv keys-stadi va amaliy mashqlar
   B) Faqat matnni yodlash
   C) Savollarni e'tiborsiz qoldirish
   D) Baholashni bekor qilish

---------------------------------------------------
JAVOBLAR KALITI (O'QITUVCHI UCHUN):
1-A, 2-A, 3-A, 4-A, 5-A, 6-A, 7-A, 8-A, 9-A, 10-A`;
      } else if (lower.includes('xarakteristika') || lower.includes('tavsifnoma')) {
        aiResult = `🔍 O'QUVCHIGA RASMIY TAVSIFNOMA (XARAKTERISTIKA)

Ushbu tavsifnoma Toshkent shahar 123-sonli umumta'lim maktabining 10-A sinf o'quvchisi Aliyev Sardor Anvarovichga berildi.

Aliyev Sardor o'qish davrida o'zini namunali, odobli va tirishqoq o'quvchi sifatida namoyon etdi. Maktab ichki tartib-qoidalariga to'liq rioya qiladi, ustozlariga va tengdoshlariga nisbatan doimo hurmatda.

Fanlarni o'zlashtirish darajasi a'lo (o'rtacha balli: 5.0). Ayniqsa, aniq fanlar va chet tillariga qiziqishi yuqori bo'lib, maktab va tuman bosqichidagi fan olimpiadalarida faxrli 1-o'rinni egallab kelmoqda.

Sinf jamoat ishlarida doimo tashabbuskor va faol. Tengdoshlari orasida yuksak obro'ga ega. Zararli odatlardan xoli, sog'lom turmush tarziga amal qiladi.

Tavsifnoma talab qilingan joyga taqdim etish uchun berildi.

Maktab direktori: _________________ (Imzo)
Sinf rahbari:      _________________ (Imzo)
M.O'.`;
      } else {
        aiResult = `🤖 EDUAI PRO TAHLILI VA JAVOBI:

So'rov mavzusi: "${q}"

Tahlil va xulosa:
1. Asosiy maqsad: Kiritilgan ta'limiy talabni davlat me'yorlari va GOST standartlariga muvofiq rasmiylashtirish.
2. Tavsiya etiladigan amaliy qadamlar:
   - Dars yoki hujjat matnini mantiqiy qismlarga (Kirish, Asosiy bayon, Xulosa) ajratish;
   - Atamalar va imlo qoidalarini O'zbek tili lug'at mezonlariga moslashtirish;
   - Hujjatni tegishli shaxslar (rahbariyat, o'qituvchilar) imzosi bilan tasdiqlash.

Natija to'liq shakllantirildi. Ushbu matnni quyidagi tugmalar orqali Word (.docx) formatida yuklab olishingiz yoki to'g'ridan-to'g'ri nusxalashingiz mumkin!`;
      }

      setResponse(aiResult);
      setLoading(false);
    }, 600);
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = async () => {
    if (!response) return;
    try {
      await generateOfficialDocumentDocx('ariza', {
        title: "EduAI Tavsiya Hujjati",
        reason: response
      }, "EduAI_Hujjati.docx");
    } catch(e) {
      const blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, "EduAI_Hujjati.txt");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              EduAI Universal Yordamchi
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI Pro 2.0
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Dars ishlanmalari, testlar, referatlar, buyruqlar va xarakteristikalarni 3 soniyada generatsiya qiling
            </p>
          </div>
        </div>

        {/* Tezkor Shablonlar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-5">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTemplate(tpl.id);
                setPrompt(tpl.prompt);
                handleGenerate(tpl.prompt);
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all hover:scale-[1.02] flex flex-col justify-between"
            >
              <div className="text-xs font-bold text-white line-clamp-1">{tpl.title}</div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{tpl.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Buyruq Kiritish Maydoni */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          O'zingiz xohlagan AI buyrug'ini yozing:
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Masalan: 10-sinf adabiyot fanidan Alisher Navoiy hayoti bo'yicha 15 talik test tuzib, kalitini ham yozib ber..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={loading || !prompt.trim()}
            className="absolute right-3 bottom-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Yaratilmoqda...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                EduAI Generatsiya
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Natijasi */}
      {response && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              EduAI Tayyorlagan Natija:
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Nusxalandi!" : "Nusxalash"}
              </button>
              <button
                onClick={handleDownloadDocx}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center gap-1.5 shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                Word (.docx) yuklash
              </button>
            </div>
          </div>

          <pre className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
