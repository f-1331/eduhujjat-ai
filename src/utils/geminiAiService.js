// src/utils/geminiAiService.js - Haqiqiy Google Gemini AI Integratsiyasi
// O'zbekiston davlat ta'lim standartlari (DTS) bo'yicha cheksiz, professional pedagogik materiallar

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

function getApiKey() {
  return process.env.GEMINI_API_KEY || '';
}

/**
 * Universal Gemini API chaqiruvi (Avtomatik model almashish va xatoliklarni bartaraf etish bilan)
 */
export async function callGemini(prompt, systemInstruction = "") {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY mavjud emas");
  }

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
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
        return data.candidates[0].content.parts[0].text;
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
    "Test oxirida aniq javoblar kalitini va qisqa ilmiy tushuntirishlarni keltiring.";

  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Ushbu mavzu bo'yicha roppa-rosa ${count} ta 4 variantli (A, B, C, D) nazorat test savoli tuzib ber.\n` +
    `Talablar:\n` +
    `1. Sarlavha: 🎲 NAZORAT TESTLARI (${count} TALIK)\n` +
    `2. Har bir savol raqamlangan bo'lsin: 1., 2., ... ${count}.\n` +
    `3. Variantlar: A), B), C), D).\n` +
    `4. Oxirida "🔑 JAVOBLAR KALITI VA IZOHLAR:" bo'limida har bir savolning to'g'ri javobi va 1 qatorlik sababi yozilsin.\n` +
    `5. Javob sof, ravon o'zbek adabiy tilida bo'lsin.`;

  return await callGemini(prompt, systemInstruction);
}

/**
 * 2. HAQIQIY 45 DAQIQALIK INTEGRATSIYALASHGAN DARS ISHLANMASI (KONSPEKT)
 */
export async function generateAILessonPlanWithGemini(topic) {
  const systemInstruction = 
    "Siz O'zbekistonning ilg'or amaliyotchi o'qituvchisisiz. 45 daqiqalik dars ishlanmalarini yangi pedagogik texnologiyalar (FSMU, Aqliy hujum, Klaster, Sinkveyn) asosida to'liq xronometraj bilan yozasiz.";

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
 * 6. GAMMA & GENSPARK UCHUN KARTALASHTIRILGAN SLAYDLARNI AI BILAN YARATISH
 */
export async function generateAIGammaCardsWithGemini(topic) {
  const prompt = 
    `Mavzu: "${topic}"\n` +
    `Vazifa: Ushbu mavzu bo'yicha Gamma.app va Genspark uslubida 6 ta zamonaviy, chuqur slayd kartochkalarini JSON formatida tayyorlab ber.\n` +
    `Faqat quyidagi JSON formatida javob qaytar (boshqa hech qanday so'z yozma):\n` +
    `[\n` +
    `  {\n` +
    `    "type": "hero",\n` +
    `    "badge": "GAMMA AI TAQDIMOT",\n` +
    `    "title": "Slayd sarlavhasi",\n` +
    `    "subtitle": "Qisqa ilmiy sharh",\n` +
    `    "speakerNotes": "Ma'ruzachi nutqi matni"\n` +
    `  },\n` +
    `  {\n` +
    `    "type": "split",\n` +
    `    "title": "Qiyosiy Tahlil",\n` +
    `    "leftTitle": "Oldingi holat",\n` +
    `    "leftBullets": ["fakt 1", "fakt 2", "fakt 3"],\n` +
    `    "rightTitle": "Yangi yutuqlar",\n` +
    `    "rightBullets": ["fakt 1", "fakt 2", "fakt 3"],\n` +
    `    "speakerNotes": "Ma'ruzachi nutqi"\n` +
    `  },\n` +
    `  {\n` +
    `    "type": "pillars",\n` +
    `    "title": "3 Asosiy Yo'nalish",\n` +
    `    "subtitle": "Tizimli yondashuv",\n` +
    `    "cards": [\n` +
    `      {"num": "01", "title": "Yo'nalish 1", "desc": "Tahliliy izoh"},\n` +
    `      {"num": "02", "title": "Yo'nalish 2", "desc": "Tahliliy izoh"},\n` +
    `      {"num": "03", "title": "Yo'nalish 3", "desc": "Tahliliy izoh"}\n` +
    `    ],\n` +
    `    "speakerNotes": "Nutq matni"\n` +
    `  },\n` +
    `  {\n` +
    `    "type": "deep_dive",\n` +
    `    "title": "Chuqur Tahlil va Metrika",\n` +
    `    "metricValue": "98.5%",\n` +
    `    "metricLabel": "Samaradorlik",\n` +
    `    "bullets": ["Muhim fakt 1", "Muhim fakt 2", "Muhim fakt 3"],\n` +
    `    "speakerNotes": "Nutq matni"\n` +
    `  },\n` +
    `  {\n` +
    `    "type": "roadmap",\n` +
    `    "title": "Amaliy Bosqichlar",\n` +
    `    "steps": [\n` +
    `      {"step": "1-BOSQICH", "title": "Poydevor", "text": "Boshlang'ich tadqiqot"},\n` +
    `      {"step": "2-BOSQICH", "title": "Ijro", "text": "Amaliyotga tatbiq etish"},\n` +
    `      {"step": "3-BOSQICH", "title": "Natija", "text": "Baholash va monitoring"}\n` +
    `    ],\n` +
    `    "speakerNotes": "Nutq matni"\n` +
    `  },\n` +
    `  {\n` +
    `    "type": "conclusion",\n` +
    `    "title": "Xulosa va Istiqbol",\n` +
    `    "quote": "Ilmiy xulosa iqtibosi",\n` +
    `    "takeaways": ["Asosiy xulosa 1", "Asosiy xulosa 2", "Asosiy xulosa 3"],\n` +
    `    "speakerNotes": "Yakuniy nutq"\n` +
    `  }\n` +
    `]`;

  try {
    const raw = await callGemini(prompt, "Siz faqat valid JSON array qaytaruvchi AI taqdimot generatorsiz.");
    const jsonMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch(e) {
    // fallback
  }
  return null;
}
