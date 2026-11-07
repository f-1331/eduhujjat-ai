import pptxgen from 'pptxgenjs';

// GAMMA & GENSPARK ULTRA-MODERN TEMALARI
export const GAMMA_THEMES = {
  obsidian: {
    id: "obsidian",
    name: "Gamma Obsidian (Neon & Dark Slate)",
    bg: "090D16",
    cardBg: "131B2E",
    accent: "38BDF8", // Cyan
    accent2: "A855F7", // Purple
    text: "F8FAFC",
    subtext: "94A3B8",
    cardBorder: "1E293B"
  },
  genspark: {
    id: "genspark",
    name: "Genspark Cyber Sky (Navy & Teal)",
    bg: "0B132B",
    cardBg: "1C2541",
    accent: "06B6D4", // Teal / Cyan
    accent2: "3B82F6", // Electric Blue
    text: "FFFFFF",
    subtext: "94A3B8",
    cardBorder: "3A506B"
  },
  emerald: {
    id: "emerald",
    name: "Emerald Matrix (Deep Forest & Gold)",
    bg: "064E3B",
    cardBg: "065F46",
    accent: "34D399", // Mint
    accent2: "FBBF24", // Gold
    text: "FFFFFF",
    subtext: "D1FAE5",
    cardBorder: "047857"
  },
  nordic: {
    id: "nordic",
    name: "Clean Nordic (Charcoal & Royal White)",
    bg: "F8FAFC",
    cardBg: "FFFFFF",
    accent: "2563EB", // Royal Blue
    accent2: "0F172A", // Dark Charcoal
    text: "0F172A",
    subtext: "64748B",
    cardBorder: "E2E8F0"
  },
  amethyst: {
    id: "amethyst",
    name: "Royal Amethyst (Deep Violet & Magenta)",
    bg: "1E1035",
    cardBg: "2D1B4E",
    accent: "EC4899", // Pink / Magenta
    accent2: "8B5CF6", // Violet
    text: "FFFFFF",
    subtext: "E9D5FF",
    cardBorder: "4C1D95"
  }
};

// GAMMA USLUBIDA TAYYOR 6 TALIK KARTALAR SHABLONI
export function getDefaultGammaCards(topic = "Fotosintez jarayoni va o'simliklar biosferasi", authorName = "SmartOffice EduAI") {
  return [
    {
      id: 1,
      badge: "KIRISH VA SARLAVHA",
      type: "hero",
      title: topic,
      subtitle: `Zamonaviy ta'lim va interaktiv ilmiy tahlil taqdimoti`,
      author: authorName,
      speakerNotes: `Assalomu alaykum! Bugungi taqdimotimiz "${topic}" mavzusiga bag'ishlanadi. Ushbu ma'ruzada biz nazariy tamoyillar, asosiy qonuniyatlar va amaliy ahamiyatni Gamma uslubidagi vizual kartochkalar orqali ko'rib chiqamiz.`
    },
    {
      id: 2,
      badge: "KONTEKST VA MUAMMO",
      type: "split",
      title: "Mavzuning Dolzarbligi va Asosiy Qiyinchiliklar",
      leftTitle: "📌 Hozirgi Holat va Kontekst",
      leftBullets: [
        "Mavzuni an'anaviy yondashuvda tushuntirish samarasizligi",
        "Nazariy bilimlarning amaliyot bilan yetarli bog'lanmaganligi",
        "Axborot oqimi tezlashgan davrda tizimli tahlilga bo'lgan yuqori ehtiyoj"
      ],
      rightTitle: "💡 Yangi Yechim va Imkoniyatlar",
      rightBullets: [
        "Interaktiv raqamli modellar va visual grafiklar joriy etish",
        "Har bir jarayonni bosqichma-bosqich mantiqiy bloklarga ajratish",
        "O'quvchilar va tinglovchilar faolligini 2 barobarga oshirish"
      ],
      speakerNotes: `Ushbu slaydda mavzuning nima sababdan muhimligi va uning zamonaviy ta'limdagi yechimlarini solishtiramiz.`
    },
    {
      id: 3,
      badge: "3 TA ASOSIY USTUN (GENSPARK GRID)",
      type: "pillars",
      title: "Asosiy Ilmiy va Amaliy Tamoyillar",
      subtitle: "3 ta mustahkam tayanch orqali to'liq tushunish",
      cards: [
        {
          num: "01",
          title: "Nazariy Baza",
          desc: "Fundametal qoidalar, ta'riflar va tabiiy qonuniyatlarning o'zaro bog'liqligi."
        },
        {
          num: "02",
          title: "Amaliy Jarayon",
          desc: "Laboratoriya tajribalari, real misollar va sinov natijalarining tahlili."
        },
        {
          num: "03",
          title: "Natija va Xulosa",
          desc: "Samaradorlik ko'rsatkichlari, yangi xulosalar va kelgusi istiqbollar."
        }
      ],
      speakerNotes: `Genspark uslubidagi ushbu 3 ta ustun mavzuni qismlarga bo'lib, har bir nuqtaga e'tibor qaratishga yordam beradi.`
    },
    {
      id: 4,
      badge: "CHUQUR TAHLIL VA METRIKA",
      type: "deep_dive",
      title: "Asosiy Ko'rsatkichlar va Ta'sir Doirasi",
      metricValue: "98.4%",
      metricLabel: "O'zlashtirish va Samaradorlik Ko'rsatkichi",
      bullets: [
        "Tizimli dars va vizual materiallar tufayli diqqatni jamlash davomiyligi oshadi",
        "Murakkab formulalar va qoidalarni eslab qolish darajasi 3 barobarga ortadi",
        "Mustaqil fikrlash va ilmiy tahlil qilish ko'nikmasi shakllanadi"
      ],
      speakerNotes: `Metrikalar orqali o'quv jarayonidagi samaradorlik va amaliy natijalarni ko'rsatamiz.`
    },
    {
      id: 5,
      badge: "YO'L XARITASI VA QADAMLAR",
      type: "roadmap",
      title: "Amalga Oshirish Bosqichlari (Timeline)",
      steps: [
        { step: "1-QADAM", title: "O'rganish & Rejalashtirish", text: "Birlamchi ma'lumotlarni to'plash va maqsadlarni belgilash." },
        { step: "2-QADAM", title: "Sinov & Tajriba", text: "Amaliy mashg'ulotlar va tahliliy tekshiruvlarni o'tkazish." },
        { step: "3-QADAM", title: "Yakunlash & Baholash", text: "Natijalarni umumlashtirish va keyingi rivojlanish rejasi." }
      ],
      speakerNotes: `Mavzuni bosqichma-bosqich o'rganish va hayotga tatbiq etish yo'l xaritasi.`
    },
    {
      id: 6,
      badge: "XULOSA VA CHAQIRIQ",
      type: "summary",
      title: "Xulosa va Asosiy Qoidalar",
      quote: `"Ta'limda eng buyuk muvaffaqiyat — murakkab narsalarni sodda, go'zal va tushunarli qilib ko'rsata olishdir."`,
      takeaways: [
        "Har bir nazariya amaliyot va mustahkam misollar bilan tasdiqlanishi shart",
        "Zamonaviy texnologiyalar o'qitish sifatini yangi bosqichga olib chiqadi",
        "E'tiboringiz va faol ishtirokingiz uchun katta rahmat!"
      ],
      speakerNotes: `Xulosa qismida tinglovchilarga minnatdorchilik bildiramiz va asosiy xulosani ta'kidlaymiz.`
    }
  ];
}

// POWERPOINT (.PPTX) GENERATSIYA FUNKSIYASI
export async function generatePresentationPptx(config = {}) {
  const {
    topic = "Fotosintez jarayoni va o'simliklar biosferasi",
    styleName = "obsidian",
    cards = null,
    authorName = "SmartOffice EduAI",
    filename = "Gamma_Taqdimot.pptx"
  } = config;

  const style = GAMMA_THEMES[styleName] || GAMMA_THEMES.obsidian;
  const slideDeck = cards && cards.length ? cards : getDefaultGammaCards(topic, authorName);

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  slideDeck.forEach((card, index) => {
    const slide = pres.addSlide();
    slide.background = { color: style.bg };

    // Slayd tepasidagi Gamma Badge va Indikator
    slide.addText(`SMARTOFFICE & EDUAI PRO  •  GAMMA ENGINE  •  SLAYD ${index + 1}/${slideDeck.length}`, {
      x: 0.8, y: 0.35, w: 8.4, h: 0.3,
      fontSize: 10, color: style.subtext, fontFace: 'Arial', bold: true
    });

    if (card.speakerNotes) {
      slide.addNotes(card.speakerNotes);
    }

    // 1. HERO SLAYDI
    if (card.type === 'hero' || index === 0) {
      // Markaziy Katta Kartochka
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 0.9, w: 8.4, h: 5.6,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1.5 },
        rectRadius: 0.15
      });

      // Kichik Badge
      slide.addShape(pres.ShapeType.rect, {
        x: 1.2, y: 1.4, w: 3.2, h: 0.45,
        fill: { color: style.bg },
        line: { color: style.accent, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(card.badge || "GAMMA AI TAQDIMOT", {
        x: 1.2, y: 1.4, w: 3.2, h: 0.45,
        fontSize: 11, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
      });

      // Katta Sarlavha
      slide.addText(card.title.toUpperCase(), {
        x: 1.2, y: 2.1, w: 7.6, h: 1.8,
        fontSize: 32, bold: true, color: style.text, fontFace: 'Arial'
      });

      // Subtitle
      slide.addText(card.subtitle || `Zamonaviy ta'lim va tahliliy taqdimot`, {
        x: 1.2, y: 4.1, w: 7.6, h: 0.8,
        fontSize: 15, color: style.subtext, fontFace: 'Arial'
      });

      // Muallif Pilli
      slide.addText(`👤 Taqdimotchi: ${card.author || authorName}  •  O'zbekiston Ta'lim Tizimi`, {
        x: 1.2, y: 5.3, w: 7.6, h: 0.5,
        fontSize: 12, color: style.accent, fontFace: 'Arial', bold: true
      });
    }

    // 2. SPLIT COMPARISON SLAYDI (2 USTUN)
    else if (card.type === 'split') {
      slide.addText(card.title, {
        x: 0.8, y: 0.7, w: 8.4, h: 0.6,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      // Chap Ustun
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 1.5, w: 4.05, h: 5.0,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1 },
        rectRadius: 0.12
      });
      slide.addText(card.leftTitle || "📌 Joriy Holat", {
        x: 1.1, y: 1.8, w: 3.45, h: 0.45,
        fontSize: 14, bold: true, color: style.accent, fontFace: 'Arial'
      });

      const leftText = (card.leftBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(leftText, {
        x: 1.1, y: 2.4, w: 3.45, h: 3.7,
        fontSize: 12, color: style.subtext, fontFace: 'Arial'
      });

      // O'ng Ustun
      slide.addShape(pres.ShapeType.rect, {
        x: 5.15, y: 1.5, w: 4.05, h: 5.0,
        fill: { color: style.cardBg },
        line: { color: style.accent2, width: 1 },
        rectRadius: 0.12
      });
      slide.addText(card.rightTitle || "💡 Yangi Yechim", {
        x: 5.45, y: 1.8, w: 3.45, h: 0.45,
        fontSize: 14, bold: true, color: style.accent2, fontFace: 'Arial'
      });

      const rightText = (card.rightBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(rightText, {
        x: 5.45, y: 2.4, w: 3.45, h: 3.7,
        fontSize: 12, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 3. 3 TA USTUN (PILLARS GRID)
    else if (card.type === 'pillars') {
      slide.addText(card.title, {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(card.subtitle || "", {
        x: 0.8, y: 1.2, w: 8.4, h: 0.35,
        fontSize: 12, color: style.subtext, fontFace: 'Arial'
      });

      const cardsData = card.cards || [
        { num: "01", title: "Tamoyil 1", desc: "Birinchi asosiy tamoyil tavsifi." },
        { num: "02", title: "Tamoyil 2", desc: "Ikkinchi asosiy tamoyil tavsifi." },
        { num: "03", title: "Tamoyil 3", desc: "Uchinchi asosiy tamoyil tavsifi." }
      ];

      cardsData.forEach((c, cIdx) => {
        const xPos = 0.8 + (cIdx * 2.9);
        slide.addShape(pres.ShapeType.rect, {
          x: xPos, y: 1.8, w: 2.65, h: 4.7,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.12
        });

        // Num Pill
        slide.addText(c.num, {
          x: xPos + 0.3, y: 2.1, w: 2.05, h: 0.5,
          fontSize: 24, bold: true, color: style.accent, fontFace: 'Arial'
        });

        slide.addText(c.title, {
          x: xPos + 0.3, y: 2.8, w: 2.05, h: 0.6,
          fontSize: 15, bold: true, color: style.text, fontFace: 'Arial'
        });

        slide.addText(c.desc, {
          x: xPos + 0.3, y: 3.5, w: 2.05, h: 2.6,
          fontSize: 11, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 4. DEEP DIVE VA METRIKA
    else if (card.type === 'deep_dive') {
      slide.addText(card.title, {
        x: 0.8, y: 0.7, w: 8.4, h: 0.6,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      // Metrika Bloki (Chapda)
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 1.5, w: 3.2, h: 5.0,
        fill: { color: style.cardBg },
        line: { color: style.accent, width: 1.5 },
        rectRadius: 0.12
      });

      slide.addText(card.metricValue || "98%", {
        x: 1.0, y: 2.2, w: 2.8, h: 1.2,
        fontSize: 48, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
      });

      slide.addText(card.metricLabel || "Samaradorlik Ko'rsatkichi", {
        x: 1.0, y: 3.6, w: 2.8, h: 1.0,
        fontSize: 13, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
      });

      // O'ng Tomondagi Tahliliy Matnlar
      slide.addShape(pres.ShapeType.rect, {
        x: 4.3, y: 1.5, w: 4.9, h: 5.0,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      slide.addText("🔍 Tizimli Tahlil va Natijalar:", {
        x: 4.6, y: 1.9, w: 4.3, h: 0.45,
        fontSize: 15, bold: true, color: style.text, fontFace: 'Arial'
      });

      const bulletsText = (card.bullets || []).map(b => `✓  ${b}`).join("\n\n");
      slide.addText(bulletsText, {
        x: 4.6, y: 2.5, w: 4.3, h: 3.6,
        fontSize: 12, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 5. ROADMAP / TIMELINE
    else if (card.type === 'roadmap') {
      slide.addText(card.title, {
        x: 0.8, y: 0.7, w: 8.4, h: 0.6,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      const steps = card.steps || [
        { step: "1-BOSQICH", title: "Tayyorgarlik", text: "Reja tuzish va boshlash." },
        { step: "2-BOSQICH", title: "Ijro", text: "Amaliyot va monitoring." },
        { step: "3-BOSQICH", title: "Yakun", text: "Baholash va tahlil." }
      ];

      steps.forEach((st, sIdx) => {
        const yPos = 1.6 + (sIdx * 1.65);
        slide.addShape(pres.ShapeType.rect, {
          x: 0.8, y: yPos, w: 8.4, h: 1.4,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.1
        });

        // Bosqich belgisi
        slide.addShape(pres.ShapeType.rect, {
          x: 1.1, y: yPos + 0.25, w: 1.8, h: 0.45,
          fill: { color: style.bg },
          line: { color: style.accent, width: 1 },
          rectRadius: 0.08
        });
        slide.addText(st.step, {
          x: 1.1, y: yPos + 0.25, w: 1.8, h: 0.45,
          fontSize: 10, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
        });

        // Bosqich nomi va tavsifi
        slide.addText(st.title, {
          x: 3.1, y: yPos + 0.25, w: 5.8, h: 0.4,
          fontSize: 14, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(st.text, {
          x: 3.1, y: yPos + 0.7, w: 5.8, h: 0.55,
          fontSize: 11, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 6. SUMMARY / XULOSA
    else {
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 0.9, w: 8.4, h: 5.6,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1.5 },
        rectRadius: 0.15
      });

      slide.addText(card.title || "Yakuniy Xulosa va Natijalar", {
        x: 1.2, y: 1.3, w: 7.6, h: 0.6,
        fontSize: 24, bold: true, color: style.accent, fontFace: 'Arial'
      });

      if (card.quote) {
        slide.addShape(pres.ShapeType.rect, {
          x: 1.2, y: 2.1, w: 7.6, h: 1.2,
          fill: { color: style.bg },
          line: { color: style.accent2, width: 1 },
          rectRadius: 0.1
        });
        slide.addText(card.quote, {
          x: 1.4, y: 2.2, w: 7.2, h: 1.0,
          fontSize: 12, italic: true, color: style.text, align: 'center', fontFace: 'Arial'
        });
      }

      const takeawaysText = (card.takeaways || []).map(t => `★  ${t}`).join("\n\n");
      slide.addText(takeawaysText, {
        x: 1.2, y: 3.6, w: 7.6, h: 2.4,
        fontSize: 12, color: style.subtext, fontFace: 'Arial'
      });
    }
  });

  return await pres.writeFile({ fileName: filename });
}
