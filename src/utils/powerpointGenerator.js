import pptxgen from 'pptxgenjs';

// Dizayn mavzulari ranglari
const STYLES = {
  modern: {
    name: "Zamonaviy",
    bg: "0F172A", // Dark Slate
    cardBg: "1E293B",
    accent: "38BDF8", // Sky Blue
    accent2: "818CF8", // Indigo
    text: "F8FAFC",
    subtext: "94A3B8"
  },
  academic: {
    name: "Akademik",
    bg: "1E3A8A", // Deep Navy
    cardBg: "172554",
    accent: "F59E0B", // Gold / Amber
    accent2: "E0E7FF",
    text: "FFFFFF",
    subtext: "CBD5E1"
  },
  minimalist: {
    name: "Minimalist",
    bg: "FFFFFF", // Clean White
    cardBg: "F1F5F9",
    accent: "0F172A", // Slate Dark
    accent2: "2563EB", // Royal Blue
    text: "0F172A",
    subtext: "64748B"
  },
  kids: {
    name: "Bolalarbop",
    bg: "047857", // Emerald Green
    cardBg: "065F46",
    accent: "FBBF24", // Yellow
    accent2: "F472B6", // Pink
    text: "FFFFFF",
    subtext: "D1FAE5"
  }
};

export async function generatePresentationPptx(config = {}) {
  const {
    topic = "Fotosintez jarayoni va o'simliklar hayoti",
    styleName = "modern",
    slidesCount = 6,
    includeSpeakerNotes = true,
    includeQuiz = true,
    authorName = "SmartOffice EduAI",
    filename = "Taqdimot_Slaydlar.pptx"
  } = config;

  const style = STYLES[styleName] || STYLES.modern;
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  // Slayd 1: Titul Slaydi
  const slide1 = pres.addSlide();
  slide1.background = { color: style.bg };

  slide1.addText(topic.toUpperCase(), {
    x: 1.0,
    y: 2.0,
    w: 8.0,
    h: 1.8,
    fontSize: 34,
    bold: true,
    color: style.accent,
    align: 'center',
    fontFace: 'Arial'
  });

  slide1.addText(`Taqdimotchi: ${authorName} | SmartOffice & EduAI Pro`, {
    x: 1.0,
    y: 4.2,
    w: 8.0,
    h: 0.6,
    fontSize: 16,
    color: style.subtext,
    align: 'center',
    fontFace: 'Arial'
  });

  if (includeSpeakerNotes) {
    slide1.addNotes(`Assalomu alaykum, hurmatli tinglovchilar va qatnashchilar! Bugungi taqdimotimiz mavzusi: "${topic}". Ushbu taqdimot davomida biz asosiy tushunchalar, qonuniyatlar va amaliy ahamiyat bilan tanishamiz.`);
  }

  // Slayd 2: Reja (Mundarija)
  const slide2 = pres.addSlide();
  slide2.background = { color: style.bg };
  slide2.addText("REJA VA ASOSIY BO'LIMLAR", {
    x: 0.8, y: 0.6, w: 8.4, h: 0.8,
    fontSize: 26, bold: true, color: style.accent, fontFace: 'Arial'
  });

  const planItems = [
    "1. Kirish: Mavzuning dolzarbligi va maqsadlari",
    "2. Asosiy nazariy tamoyillar va qoidalar",
    "3. Amaliy tajriba va tahliliy natijalar",
    "4. Fanlararo bog'liqlik va zamonaviy qo'llanilishi",
    "5. Xulosa va kelajakdagi istiqbollar"
  ];

  planItems.forEach((item, idx) => {
    slide2.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.6 + idx * 0.85, w: 8.4, h: 0.65,
      fill: { color: style.cardBg },
      line: { color: style.accent, width: 1 }
    });
    slide2.addText(item, {
      x: 1.1, y: 1.6 + idx * 0.85, w: 8.0, h: 0.65,
      fontSize: 16, color: style.text, fontFace: 'Arial', valign: 'middle'
    });
  });

  if (includeSpeakerNotes) {
    slide2.addNotes("Dastlab mavzumizning asosiy rejalari bilan tanishib olamiz. Har bir bo'lim bir-biri bilan mantiqiy bog'langan holda bayon etiladi.");
  }

  // Slayd 3 - Slayd (slidesCount-2): Asosiy mavzu slaydlari
  const contents = [
    {
      title: "1-BO'LIM: NAZARIY ASOSLAR",
      points: [
        "Mavzuning poydevorini tashkil etuvchi asosiy qonuniyatlar.",
        "Xalqaro ilmiy tadqiqotlar va mahalliy tajribalarning uyg'unligi.",
        "Muhim parametrlar va ko'rsatkichlarning o'zaro nisbati."
      ],
      notes: "Ushbu slaydda nazariy qismga alohida to'xtalamiz. Tinglovchilar e'tiborini asosiy tamoyillarga qaratish zarur."
    },
    {
      title: "2-BO'LIM: AMALIY JARAYONLAR",
      points: [
        "Tajriba va sinov jarayonlarining bosqichma-bosqich bajarilishi.",
        "Kutilmagan omillarning ta'siri va ularni bartaraf etish usullari.",
        "Samaradorlik ko'rsatkichining 25-30% ga oshishi."
      ],
      notes: "Amaliyot har doim nazariyaning to'g'riligini tasdiqlaydi. Mana bu yerda tajriba natijalari ko'rsatilgan."
    },
    {
      title: "3-BO'LIM: ILG'OR YONDASHUVLAR",
      points: [
        "Raqamli texnologiyalar va sun'iy intellekt vositalaridan foydalanish.",
        "Resurslarni tejash va vaqt unumdorligini oshirish mexanizmlari.",
        "Xavfsizlik va barqarorlik talablariga to'liq muvofiqlik."
      ],
      notes: "Zamonaviy vositalar ish jarayonini qanchalik tezlashtirishi mumkinligini ushbu bo'limda ko'rishimiz mumkin."
    }
  ];

  const dynamicCount = Math.min(slidesCount - (includeQuiz ? 3 : 2), contents.length);

  for (let i = 0; i < dynamicCount; i++) {
    const item = contents[i];
    const s = pres.addSlide();
    s.background = { color: style.bg };

    s.addText(item.title, {
      x: 0.8, y: 0.6, w: 8.4, h: 0.8,
      fontSize: 26, bold: true, color: style.accent, fontFace: 'Arial'
    });

    item.points.forEach((pt, pIdx) => {
      s.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.6 + pIdx * 1.3, w: 8.4, h: 1.05,
        fill: { color: style.cardBg },
        line: { color: style.accent, width: 1 },
        rectRadius: 0.1
      });
      s.addText(`•  ${pt}`, {
        x: 1.1, y: 1.6 + pIdx * 1.3, w: 8.0, h: 1.05,
        fontSize: 16, color: style.text, fontFace: 'Arial', valign: 'middle'
      });
    });

    if (includeSpeakerNotes) {
      s.addNotes(item.notes);
    }
  }

  // Agar viktorina (Quiz) kiritilgan bo'lsa
  if (includeQuiz) {
    const quizSlide = pres.addSlide();
    quizSlide.background = { color: style.bg };
    quizSlide.addText("VIKTORINA VA MUSTAHKAMLASH (QUIZ)", {
      x: 0.8, y: 0.6, w: 8.4, h: 0.8,
      fontSize: 24, bold: true, color: style.accent, fontFace: 'Arial'
    });

    quizSlide.addText(`Savol: "${topic}" doirasidagi eng muhim jarayon qaysi javobda to'g'ri ko'rsatilgan?`, {
      x: 0.8, y: 1.5, w: 8.4, h: 0.8,
      fontSize: 18, color: style.text, bold: true, fontFace: 'Arial'
    });

    const options = [
      "A) Barcha jarayonlarning uyg'un va tizimli kechishi (To'g'ri javob)",
      "B) Faqat tashqi omillarga bog'liq bo'lishi",
      "C) Bir martalik samara berishi",
      "D) Hech qanday nazariy asosga ega emasligi"
    ];

    options.forEach((opt, oIdx) => {
      quizSlide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 2.4 + oIdx * 0.75, w: 8.4, h: 0.6,
        fill: { color: oIdx === 0 ? style.accent2 : style.cardBg },
        line: { color: style.accent, width: 1 }
      });
      quizSlide.addText(opt, {
        x: 1.1, y: 2.4 + oIdx * 0.75, w: 8.0, h: 0.6,
        fontSize: 15, color: oIdx === 0 ? (style.bg === 'FFFFFF' ? 'FFFFFF' : '0F172A') : style.text,
        fontFace: 'Arial', valign: 'middle', bold: oIdx === 0
      });
    });

    if (includeSpeakerNotes) {
      quizSlide.addNotes("Dars oxirida o'quvchilar bilan blits-so'rov o'tkazamiz. To'g'ri javob A varianti hisoblanadi.");
    }
  }

  // Yakuniy Slayd
  const endSlide = pres.addSlide();
  endSlide.background = { color: style.bg };
  endSlide.addText("E'TIBORINGIZ UCHUN RAHMAT!", {
    x: 1.0, y: 2.2, w: 8.0, h: 1.0,
    fontSize: 34, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
  });
  endSlide.addText("Savollar va mulohazalar uchun minnatdormiz.", {
    x: 1.0, y: 3.3, w: 8.0, h: 0.6,
    fontSize: 18, color: style.subtext, align: 'center', fontFace: 'Arial'
  });

  if (includeSpeakerNotes) {
    endSlide.addNotes("Mavzu yuzasidan qandaydir savollaringiz yoki takliflaringiz bo'lsa, mamnuniyat bilan javob berishga tayyorman.");
  }

  await pres.writeFile({ fileName: filename });
}
