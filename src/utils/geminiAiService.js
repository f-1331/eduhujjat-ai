// src/utils/geminiAiService.js - Haqiqiy Google Gemini AI Integratsiyasi
// O'zbekiston davlat ta'lim standartlari (DTS) bo'yicha cheksiz, professional pedagogik materiallar

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash'
];

function getApiKey() {
  return process.env.GEMINI_API_KEY || '';
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
        body: JSON.stringify(payload)
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
export async function generateAITestWithGemini(topic, count = 10) {
  const systemInstruction = 
    "Siz O'zbekiston Respublikasi Maktabgacha va Maktab Ta'limi Vazirligi uchun eng tajribali ekspert-metodist va fan o'qituvchisisiz. " +
    "Siz faqat aniq faktlar, to'g'ri ilmiy terminologiya va Davlat Ta'lim Standartlari (DTS) asosida mukammal testlar tuzasiz. " +
    "Savollar takrorlanmasin, javob variantlari (A, B, C, D) bir tekis tasodifiy taqsimlansin (faqat A bo'lib qolmasin). " +
    "Matematik formulalar va kasrlarni aslo LaTeX yoki dollar belgisi ($...$) bilan yozmang, oddiy 7/12, 3 butun 2/5 ko'rinishida yozing! " +
    "Test oxirida aniq javoblar kalitini va qisqa ilmiy tushuntirishlarni keltiring.";

  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Ushbu mavzu bo'yicha roppa-rosa ${count} ta 4 variantli (A, B, C, D) nazorat test savoli tuzib ber.\n` +
    `Talablar:\n` +
    `1. Sarlavha: 🎲 NAZORAT TESTLARI (${count} TALIK)\n` +
    `2. Har bir savol raqamlangan bo'lsin: 1., 2., ... ${count}.\n` +
    `3. Variantlar: A), B), C), D).\n` +
    `4. Oxirida "🔑 JAVOBLAR KALITI VA IZOHLAR:" bo'limida har bir savolning to'g'ri javobi va 1 qatorlik sababi yozilsin.\n` +
    `5. Kasrlar va formulalar oddiy klaviatura belgilarida bo'lsin: 7/12, 3 butun 2/5. Dollar ($) yoki LaTeX ishlatilmasin!\n` +
    `6. Javob sof, ravon o'zbek adabiy tilida bo'lsin.`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 2. HAQIQIY 45 DAQIQALIK INTEGRATSIYALASHGAN DARS ISHLANMASI (KONSPEKT)
 */
export async function generateAILessonPlanWithGemini(topic) {
  const systemInstruction = 
    "Siz O'zbekistonning ilg'or amaliyotchi o'qituvchisisiz. 45 daqiqalik dars ishlanmalarini yangi pedagogik texnologiyalar (FSMU, Aqliy hujum, Klaster, Sinkveyn) asosida to'liq xronometraj bilan yozasiz. " +
    "Matematik ifodalar va kasrlarni oddiy tushunarli formatda yozing (masalan 7/12, 3 butun 2/5), aslo dollar yoki LaTeX ishlatmang!";

  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Ushbu mavzu bo'yicha umumiy o'rta ta'lim maktabi uchun to'liq 45 daqiqalik namunaviy dars ishlanmasi (konspekt) rejasini tuzib ber.\n` +
    `Tuzilma:\n` +
    `• Dars mavzusi, sinfi, dars turi, jihozlar, metodlar;\n` +
    `• I. Dars maqsadlari (Ta'limiy, Tarbiyaviy, Rivojlantiruvchi);\n` +
    `• II. 6 bosqichli xronometraj:\n` +
    `  1. Tashkiliy qism (3 daqiqa);\n` +
    `  2. O'tilgan mavzuni so'rash va blits-savollar (7 daqiqa);\n` +
    `  3. Yangi mavzu bayoni — 3 ta aniq reja va doska yozuvi (20 daqiqa);\n` +
    `  4. Yangi mavzuni mustahkamlash va amaliy mashqlar (10 daqiqa);\n` +
    `  5. Darsni yakunlash va baholash mezonlari (3 daqiqa);\n` +
    `  6. Uyga vazifa va ko'rsatmalar (2 daqiqa).`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 3. RASMIY MAKTAB DIREKTORI BUYRUG'I
 */
export async function generateAIOfficialOrderWithGemini(topic) {
  const systemInstruction = 
    "Siz O'zbekiston ta'lim tizimidagi yurist va devonxona rahbarisiz. Rasmiy buyruqlarni O'zbekiston Respublikasining 'Ta'lim to'g'risida'gi Qonuni va vazirlik me'yorlariga binoan yozasiz.";

  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Ushbu masala bo'yicha maktab direktori nomidan to'liq yuridik asoslangan rasmiy maktab buyrug'i loyihasini tayyorlab ber.\n` +
    `Tuzilma: Maktab rekvizitlari, buyruq raqami va sanasi, preambula (qonuniy asos), BUYURAMAN qismida 4 ta aniq topshiriq va mas'ul shaxslar, imzo o'rni.`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 4. PEDAGOGIK KENGASH BAYONNOMASI (PROTOKOL)
 */
export async function generateAIProtocolWithGemini(topic) {
  const systemInstruction = "Siz maktab pedagogik kengashi kotibisiz. Rasmiy bayonnomalarni davlat ish yuritish standarti bo'yicha tuzasiz.";
  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Pedagogik kengashning to'liq rasmiy bayonnomasini yozib ber. (Kun tartibi, Eshitildi ma'ruzasi, Muzokaralarda qatnashuvchilar fikri, Qat'iy qaror qismi, Imzolar).`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 5. O'QUVCHIGA RASMIY TAVSIFNOMA (XARAKTERISTIKA)
 */
export async function generateAIStudentReferenceWithGemini(studentName) {
  const systemInstruction = "Siz tajribali sinf rahbari va psixologsiz. O'quvchilarga chuqur pedagogik tavsifnomalar yozasiz.";
  const prompt = 
    `O'quvchi: "${studentName}"\n` +
    `Vazifa: Mazkur o'quvchi uchun fan olimpiadasida qatnashish, stipendiya yoki boshqa rasmiy idoraga taqdim etish uchun ijobiy va to'liq pedagogik tavsifnoma (xarakteristika) yozib ber.`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 6. GAMMA & GENSPARK UCHUN HAQIQIY KOD VA AI BILAN TUZILGAN DINAMIK SLAYDLAR
 * Har bir mavzu uchun mutlaqo yangi, takrorlanmas, 15+ xil layoutli va moslashtirilgan taqdimot
 */
export async function generateAIGammaCardsWithGemini(topic, options = {}) {
  const {
    authorName = "SmartOffice EduAI",
    detailLevel = "medium", // 'short' | 'medium' | 'detailed'
    includeImages = true
  } = (typeof options === 'string' ? { authorName: options } : options);

  let detailGuideline = "MA'LUMOT HAJMI: O'RTACHA (Standart darslik va metodik me'yorda, 6-7 ta slayd, tushunarli va balanslangan tushuntirishlar bilan).";
  if (detailLevel === 'short') {
    detailGuideline = "MA'LUMOT HAJMI: QISQA VA LO'NDA (5-6 ta slayd. Har bir slaydda 2-3 ta qisqa, yorqin tezislar va kalit faktlar. Uzoq paragraflar yozma, lo'nda va vizual bo'lsin).";
  } else if (detailLevel === 'detailed') {
    detailGuideline = "MA'LUMOT HAJMI: TO'LIQ VA KENGAYTIRILGAN (7-9 ta slayd. Chuqur ilmiy ma'lumotlar, aniq raqamlar, kengaytirilgan tushuntirishlar va har bir slayd uchun ma'ruzachining batafsil nutqi (speakerNotes) bilan to'liq ma'ruza konspekti darajasida).";
  }

  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Taqdimotchi / Muallif: "${authorName}"\n` +
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
