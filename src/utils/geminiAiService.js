// src/utils/geminiAiService.js - Haqiqiy Google Gemini AI Integratsiyasi
// O'zbekiston davlat ta'lim standartlari (DTS) bo'yicha cheksiz, professional pedagogik materiallar

import fs from 'fs';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash'
];

function getApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    if (typeof process !== 'undefined' && fs.existsSync && fs.existsSync('.env')) {
      const content = fs.readFileSync('.env', 'utf8');
      const match = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
      if (match) return match[1].trim();
    }
  } catch (e) {}
  return '';
}

/**
 * LaTeX va matematik belgilarni oddiy, o'qishga qulay o'zbekcha formatga tozalash
 */
export function cleanLatexAndFormat(text) {
  if (!text) return "";
  let clean = String(text);

  // 1. Aralash kasrlar: 3\frac{2}{5} -> 3 butun 2/5
  clean = clean.replace(/(\d+)\s*\\(?:d|t)?frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '$1 butun $2/$3');

  // 2. Oddiy kasrlar: \frac{a}{b} -> a/b
  clean = clean.replace(/\\(?:d|t)?frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '$1/$2');
  // Ichma-ich kasrlar uchun ikkinchi bor tekshirish
  clean = clean.replace(/\\(?:d|t)?frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '$1/$2');

  // 3. Matematik amallar
  clean = clean.replace(/\\cdot/g, '·');
  clean = clean.replace(/\\times/g, '×');
  clean = clean.replace(/\\div/g, ':');

  // 4. Ildizlar va darajalar
  clean = clean.replace(/\\sqrt\s*\{([^{}]+)\}/g, '√($1)');
  clean = clean.replace(/\\sqrt/g, '√');
  clean = clean.replace(/\^\{2\}/g, '²');
  clean = clean.replace(/\^\{3\}/g, '³');
  clean = clean.replace(/\^2\b/g, '²');
  clean = clean.replace(/\^3\b/g, '³');

  // 5. Belgilar va harflar
  clean = clean.replace(/\\pi/g, 'π');
  clean = clean.replace(/\\approx/g, '≈');
  clean = clean.replace(/\\neq/g, '≠');
  clean = clean.replace(/\\leq/g, '≤');
  clean = clean.replace(/\\geq/g, '≥');
  clean = clean.replace(/\\pm/g, '±');
  clean = clean.replace(/\\degree/g, '°');
  clean = clean.replace(/\\circ/g, '°');
  clean = clean.replace(/\\infty/g, '∞');

  // 6. LaTeX bloklari va dollar belgilarini olib tashlash
  clean = clean.replace(/\\\[([\s\S]*?)\\\]/g, '$1');
  clean = clean.replace(/\\\(([\s\S]*?)\\\)/g, '$1');
  clean = clean.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  clean = clean.replace(/\$([^\$\n]+)\$/g, '$1');
  clean = clean.replace(/\$/g, '');

  // 7. Maxsus LaTeX matn buyruqlari
  clean = clean.replace(/\\text\s*\{([^{}]+)\}/g, '$1');
  clean = clean.replace(/\\mathrm\s*\{([^{}]+)\}/g, '$1');
  clean = clean.replace(/\\mathbf\s*\{([^{}]+)\}/g, '$1');

  // 8. Ortiqcha probellarni tozalash
  clean = clean.replace(/[ \t]{2,}/g, ' ');

  return clean.trim();
}

/**
 * Universal Gemini API chaqiruvi (Avtomatik model almashish va xatoliklarni bartaraf etish bilan)
 */
export async function callGemini(prompt, systemInstruction = "") {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY mavjud emas");
  }

  const formattingRule = 
    "\n\nQAT'IY QOIDA: Hech qachon LaTeX yoki dollar belgilaridan ($...$, \\frac{}{}) foydalanmang! " +
    "Matematik amallar va kasrlarni oddiy o'zbek tili va klaviatura formatida yozing: masalan 7/12, 3 butun 2/5, 31/7, a*b, x - 5/13 = 6/13. " +
    "Dollar belgisi ($) mutlaqo ishlatilmasin!";

  const finalInstruction = (systemInstruction || "") + formattingRule;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (finalInstruction) {
    payload.systemInstruction = {
      parts: [{ text: finalInstruction }]
    };
  }

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000)
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const rawText = data.candidates[0].content.parts[0].text;
        return cleanLatexAndFormat(rawText);
      }
    } catch (e) {
      // Keyingi modelga o'tish
    }
  }

  throw new Error("Barcha Gemini AI modellari band. Qayta urinib ko'ring.");
}

/**
 * 1. HAQIQIY SUN'IY INTELLEKT TEST GENERATORI (10 yoki 15 TALIK)
 */
/**
 * 1. CHEGARADAN CHIQUVCHI MUKAMMAL TEST GENERATORI (10 yoki 15 TALIK)
 * Bloom taksonomiyasi bo'yicha 3 darajali, to'liq ilmiy isboti bilan
 */
export async function generateAITestWithGemini(topic, count = 10) {
  const systemInstruction = 
    "Siz O'zbekiston Respublikasi Maktabgacha va Maktab Ta'limi Vazirligi hamda Milliy Baholash Markazining bosh ekspert-metodisti va xalqaro olimpiada hakamisiz. " +
    "Siz tuzadigan testlar qolipdan chiqqan, yuksak ilmiy saviyadagi, mantiqiy va chuqur o'ylantiradigan durdona testlar bo'lishi shart. " +
    "Savollar 3 ta tafakkur darajasiga ajratilsin: 1) Bilish va tushunish, 2) Amaliy qo'llash va hisoblash, 3) Yuqori tahlil va muammoli sintez (Olimpiada darajasi). " +
    "Javob variantlari (A, B, C, D) jiddiy, professional tuzilsin. Hech qachon 'barchasi to'g'ri' yoki jo'n variantlar bo'lmasin. " +
    "Matematik formulalar va kasrlarni oddiy tushunarli matn formatida yozing (masalan: 7/12, x^2, H2SO4), dollar ($) yoki LaTeX ishlatmang! " +
    "Test oxirida har bir savolning to'g'ri javobi nima uchun aynan shu ekani darslik va ilmiy qonuniyatlar bilan to'liq asoslab berilsin.";

  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Ushbu mavzu bo'yicha roppa-rosa ${count} ta yuqori darajadagi, qolipdan chiqqan 4 variantli (A, B, C, D) nazorat test savoli tuzib ber.\n\n` +
    `TUZILISH VA TALABLAR:\n` +
    `📌 Sarlavha: 🎲 CHUQURLASHTIRILGAN NAZORAT TESTLARI (${count} TALIK)\n` +
    `Mavzu: "${topic}" | DTS va Xalqaro Standartlar Asosida\n\n` +
    `🟢 I DARAJA: BAZAVIY BILIM VA KONSEPTUAL TUSHUNISH (1-4-savollar)\n` +
    `🟡 II DARAJA: AMALIY QO'LLASH VA TAHLIL (5-8-savollar)\n` +
    `🔴 III DARAJA: YUQORI MANTIQ VA CHUQUR SINTEZ (9-${count}-savollar - Olimpiada darajasi)\n\n` +
    `Har bir savol aniq raqamlangan bo'lsin: 1., 2., ... ${count}.\n` +
    `Variantlar: A), B), C), D).\n\n` +
    `Oxirida qat'iy ravishda:\n` +
    `🔑 JAVOBLAR KALITI VA ILMIY ISBOTLAR:\n` +
    `Har bir to'g'ri javob uchun 1-2 jumlalik ilmiy dalil, qonuniyat yoki darslik sahifasiga oid asos yozilsin.\n` +
    `Sof, ravon, mukammal o'zbek adabiy tilida bo'lsin.`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 2. 45 DAQIQALIK INTEGRATSIYALASHGAN INNOVATSION DARS ISHLANMASI (KONSPEKT)
 * Vazirlikning eng yangi 2026-yilgi zamonaviy pedagogik mezonlari asosida
 */
export async function generateAILessonPlanWithGemini(topic) {
  const systemInstruction = 
    "Siz O'zbekistonning eng ilg'or xalqaro toifadagi ustoz-metodistisiz. Dars ishlanmalaringiz shunchaki qog'oz emas, balki jonli dars jarayonini har bir daqiqasigacha to'liq modellashtiruvchi professional san'at asaridir. " +
    "Darsda zamonaviy interaktiv metodlar (FSMU, Aqliy hujum, Klaster, Sinkveyn, B/BX/B), o'qituvchining jonli nutqi, o'quvchilar reaksiyasi, doska rejasi va aniq baholash rubrikasi bo'lishi shart.";

  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Ushbu mavzu bo'yicha namunaviy, mukammal va har bir daqiqasi hisoblangan 45 daqiqalik dars ishlanmasi (texnologik xarita va konspekt) tayyorlab ber.\n\n` +
    `QAT'IY STRUKTURA:\n` +
    `1. METADATA: Fan nomi, sinfi, darsning turi (Yangi bilim beruvchi / Amaliy / Noan'anaviy), shakli, qo'llaniladigan zamonaviy metodlar, jihozlar va AKT vositalari;\n` +
    `2. KOMPETENSIYAVIY MAQSADLAR: Tayanch kompetensiyalar (Axborot bilan ishlash, o'zini rivojlantirish) va Fanga oid xususiy kompetensiyalar;\n` +
    `3. 45 DAQIQALIK DARS BOSQICHLARI (Daqiqama-daqiqa xronometraj bilan):\n` +
    `   • 1-bosqich: Tashkiliy qism (3 min) — Salomlashish, davomat, psixologik ijobiy muhit;\n` +
    `   • 2-bosqich: O'tilgan mavzuni mustahkamlash (7 min) — 5 ta blits-savol, o'qituvchi va o'quvchi dialogi;\n` +
    `   • 3-bosqich: Yangi mavzu bayoni (20 min) — 3 ta reja punkti, chuqur ilmiy asos, o'qituvchining jonli nutqi, taqdimot va DOSKA REJASI (Doskaga nimalar yozilishi);\n` +
    `   • 4-bosqich: Yangi mavzuni mustahkamlash va amaliy faoliyat (10 min) — Kichik guruhlarda ishlash, FSMU yoki krossvord tahlili;\n` +
    `   • 5-bosqich: Darsni yakunlash va baholash (3 min) — Kriteriyali baholash (5, 4, 3 ball rubrikasi);\n` +
    `   • 6-bosqich: Tabaqalashtirilgan uyga vazifa (2 min) — A (standart), B (mantiqiy-ijodiy), C (tadqiqot/loyiha);\n` +
    `4. O'QITUVCHINING SHAXSIY METODIK XULOSASI.`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 3. YUQORI YURIDIK MAQOMDAGI RASMIY MAKTAB BUYRUG'I
 */
export async function generateAIOfficialOrderWithGemini(topic) {
  const systemInstruction = 
    "Siz O'zbekiston Respublikasi Maktabgacha va maktab ta'limi vazirligi tizimidagi bosh yurist va devonxona mudirisiz. " +
    "Siz yozgan har bir buyruq 'Ta'lim to'g'risida'gi Qonun, yangi tahrirdagi Mehnat Kodeksi va Vazirlar Mahkamasi qarorlariga 100% huquqiy mos, qat'iy va rasmiy davlat tilida bo'lishi shart.";

  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Ushbu masala yuzasidan ta'lim muassasasi rahbari (direktor) nomidan to'liq yuridik kuchga ega rasmiy buyruq loyihasini tayyorlab ber.\n\n` +
    `TUZILMA:\n` +
    `• Rasmiy sarlavha, muassasa nomi, sana va buyruq raqami;\n` +
    `• Preambula (Qonuniy asoslar, me'yoriy hujjatlar va buyruqning maqsadi);\n` +
    `• 'BUYURAMAN:' qismida 5 ta aniq, ijro etuvchi shaxslari va muddatlari belgilangan qat'iy bandlar;\n` +
    `• Nazorat mas'ullari va ijro intizomi;\n` +
    `• Imzo, muhr o'rni va kelishuv rekvizitlari.`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 4. PEDAGOGIK KENGASHNING RASMIY BAYONNOMASI (PROTOKOL)
 */
export async function generateAIProtocolWithGemini(topic) {
  const systemInstruction = "Siz O'zbekiston umumta'lim maktabi pedagogik kengashi bosh kotibisiz. Rasmiy bayonnomalarni davlat ish yuritish standarti bo'yicha mukammal tuzasiz.";
  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Ushbu masala bo'yicha Pedagogik kengashning to'liq rasmiy bayonnomasini yozib ber.\n` +
    `Tuzilma: Qatnashuvchilar soni, rais va kotib, Kun tartibi, Eshitildi (ma'ruza tezislari), So'zga chiqdilar (3 nafar pedagog fikri), QAROR QILINDI (4 ta ijroiy band), Ovoz berish natijalari, Imzolar.`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 5. O'QUVCHIGA PEDAGOGIK-PSIXOLOGIK RASMIY TAVSIFNOMA (XARAKTERISTIKA)
 */
export async function generateAIStudentReferenceWithGemini(studentName) {
  const systemInstruction = "Siz oliy toifali maktab amaliyotchi psixologi va tajribali sinf rahbarsiz. O'quvchilarga xolis, chuqur, shaxsiy fazilatlari va intellektual salohiyatini ochib beruvchi mukammal tavsifnoma yozasiz.";
  const prompt = 
    `O'quvchi: "${studentName}"\n` +
    `Vazifa: Mazkur o'quvchi uchun nufuzli olimpiada, oliygohga tavsiya, stipendiya yoki rasmiy tashkilotga taqdim etish uchun chuqur pedagogik-psixologik tavsifnoma tayyorlab ber.\n` +
    `Tuzilma: O'quvchining akademik o'zlashtirishi, ijtimoiy faolligi, yetakchilik va xarakter xususiyatlari, qiziqishlari va maktab jamoasining rasmiy tavsiyasi.`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 6. GAMMA & GENSPARK DARAJASIDAGI CHUQUR VA BETAKROR SLAYD KARTOCHKALARI
 */
export async function generateAIGammaCardsWithGemini(topic, options = {}) {
  const {
    authorName = "SmartOffice EduAI",
    detailLevel = "medium", // 'short' | 'medium' | 'detailed'
    slideCount = null,
    includeImages = true
  } = (typeof options === 'string' ? { authorName: options } : options);

  const slideCountNum = parseInt(slideCount, 10);
  let countGuideline = "";
  if (slideCountNum && slideCountNum > 0) {
    countGuideline = `\nQAT'IY SLAYD SONI: Aynan ${slideCountNum} ta slayd kartochkasi bo'lsin (1-slayd "hero" titul, keyingi ${Math.max(1, slideCountNum - 2)} ta slayd mavzuni bosqichma-bosqich yorituvchi xilma-xil layoutdagi slaydlar, oxirgi ${slideCountNum}-slayd "conclusion" xulosa slaydi).`;
  }

  let detailGuideline = "MA'LUMOT HAJMI: O'RTACHA (Standart darslik va metodik me'yorda, tushunarli va balanslangan tushuntirishlar bilan).";
  if (detailLevel === 'short') {
    detailGuideline = "MA'LUMOT HAJMI: QISQA VA LO'NDA (Har bir slaydda 2-3 ta qisqa, yorqin tezislar va kalit faktlar. Uzoq paragraflar yozma, lo'nda va vizual bo'lsin).";
  } else if (detailLevel === 'detailed') {
    detailGuideline = "MA'LUMOT HAJMI: TO'LIQ VA KENGAYTIRILGAN (Chuqur ilmiy ma'lumotlar, aniq raqamlar, kengaytirilgan tushuntirishlar va har bir slayd uchun ma'ruzachining batafsil nutqi (speakerNotes) bilan to'liq ma'ruza konspekti darajasida).";
  }

  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Taqdimotchi / Muallif: "${authorName}"\n` +
    `${countGuideline}\n` +
    `${detailGuideline}\n\n` +
    `Vazifa: Ushbu mavzuni to'liq, chuqur va professional yorituvchi ZAMONAVIY, XILMA-XIL va BETAKROR slayd kartochkalarini tuzib ber.\n` +
    `QAT'IY TALABLAR (Gamma.app va Genspark darajasida):\n` +
    `1. BIR XIL SHABLON TAKRORLANMASIN! Har bir slayd mavzuning ichki mantiqiga mos xilma-xil layout va elementlar joylashuviga ega bo'lsin.\n` +
    `2. Matnlar mavzuning haqiqiy ilmiy terminlari, aniq raqamlari, misollari va darslikka xos faktlar bilan boyitilsin.\n` +
    `3. 1-slayd "hero" bo'lib, uning muallif qismida "${authorName}" ko'rsatilsin.\n` +
    `4. Hech qanday LaTeX yoki dollar ($) belgisidan foydalanmang! Kasrlarni 7/12, darajalarni x^2 yoki oddiy harflar bilan yozing.\n` +
    `5. Quyidagi boy slayd turlaridan mavzuga eng moslarini tanlab, xilma-xil ketma-ketlikda foydalaning:\n` +
    `   - "hero": Kirish titul slaydi (badge, title, subtitle, presenter: "${authorName}", speakerNotes)\n` +
    `   - "concept": Fundamental ta'rif yoki asosiy qonuniyat (title, badge, mainConcept, explanation, bullets: ["..."], speakerNotes)\n` +
    `   - "split_image": Chapda rasm, o'ngda tahlil (title, badge, imageKeyword: "english topic photo keyword", explanation, bullets: ["..."], speakerNotes)\n` +
    `   - "grid4": 2x2 to'rtta tarkibiy qism/funktsiya (title, subtitle, items: [{title, desc}, {title, desc}, {title, desc}, {title, desc}], speakerNotes)\n` +
    `   - "bento_3": Bento box uslubi (1 ta katta asosiy blok va 2 ta kichik kartochka) (title, mainBlock: {title, desc}, sideCards: [{title, desc}, {title, desc}], speakerNotes)\n` +
    `   - "split": Qiyosiy yoki funksional tahlil (title, leftTitle, leftBullets: ["..."], rightTitle, rightBullets: ["..."], speakerNotes)\n` +
    `   - "pillars": 3 ta ustun/yo'nalish (title, subtitle, cards: [{num: "01", title, desc}, {num: "02", title, desc}, {num: "03", title, desc}], speakerNotes)\n` +
    `   - "stats": Raqamlar, parametrlar va statistik ma'lumotlar (title, stats: [{value, label, desc}, ...], speakerNotes)\n` +
    `   - "timeline": Jarayon ketma-ketligi yoki bosqichlar (title, steps: [{step: "1-BOSQICH", title, desc}, ...], speakerNotes)\n` +
    `   - "quiz_slide": Interaktiv nazorat/munozara savoli (title, question, options: ["A) ...", "B) ...", "C) ...", "D) ..."], answer, speakerNotes)\n` +
    `   - "conclusion": Xulosa va amaliy saboqlar (title, quote, takeaways: ["...", "..."], speakerNotes)\n\n` +
    `Faqat quyidagi JSON massiv formatida javob qaytar (boshqa hech qanday so'z yoki belgi yozma):\n` +
    `[ { "type": "...", ... } ]`;

  try {
    const raw = await callGemini(
      prompt, 
      "Siz dunyo darajasidagi AI taqdimot dizaynerisiz (Gamma va Genspark uslubida). Siz faqat toza va valid JSON array qaytarasiz. LaTeX va dollar belgisi taqiqlangan."
    );
    const jsonMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Har bir matnni LaTeX qoldiqlaridan tozalash
        const sanitizeText = (val) => {
          if (typeof val === 'string') return cleanLatexAndFormat(val);
          if (Array.isArray(val)) return val.map(sanitizeText);
          if (val && typeof val === 'object') {
            const res = {};
            for (const k of Object.keys(val)) {
              res[k] = sanitizeText(val[k]);
            }
            return res;
          }
          return val;
        };
        return sanitizeText(parsed);
      }
    }
  } catch(e) {
    // fallback quyida
  }
  return null;
}
