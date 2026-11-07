import pptxgen from 'pptxgenjs';
import { generateRealAIGammaCards } from './aiSlideEngine';

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

// GAMMA USLUBIDA REAL AI KARTALAR GENERATSIYASI
export function getDefaultGammaCards(topic = "Fotosintez jarayoni va o'simliklar biosferasi") {
  return generateRealAIGammaCards(topic);
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
        x: 1.2, y: 4.1, w: 7.6, h: 1.2,
        fontSize: 16, color: style.subtext, fontFace: 'Arial'
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
