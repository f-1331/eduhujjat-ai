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

    const type = card.type || (index === 0 ? 'hero' : 'concept');

    // 1. HERO SLAYDI
    if (type === 'hero' || (index === 0 && type !== 'split' && type !== 'pillars')) {
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 0.85, w: 8.4, h: 4.6,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1.5 },
        rectRadius: 0.15
      });

      slide.addShape(pres.ShapeType.rect, {
        x: 1.2, y: 1.25, w: 3.5, h: 0.42,
        fill: { color: style.bg },
        line: { color: style.accent, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(card.badge || "GAMMA AI TAQDIMOT", {
        x: 1.2, y: 1.25, w: 3.5, h: 0.42,
        fontSize: 11, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
      });

      slide.addText((card.title || topic).toUpperCase(), {
        x: 1.2, y: 1.85, w: 7.6, h: 1.6,
        fontSize: 28, bold: true, color: style.text, fontFace: 'Arial'
      });

      slide.addText(card.subtitle || `Zamonaviy ta'lim va tahliliy taqdimot`, {
        x: 1.2, y: 3.65, w: 7.6, h: 1.1,
        fontSize: 15, color: style.subtext, fontFace: 'Arial'
      });

      slide.addText(`Taqdimotchi: ${authorName}`, {
        x: 1.2, y: 4.85, w: 7.6, h: 0.35,
        fontSize: 10.5, italic: true, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 2. CONCEPT / ASOSIY QOIDA SLAYDI
    else if (type === 'concept') {
      slide.addText(card.title || "Asosiy Tushuncha", {
        x: 0.8, y: 0.65, w: 8.4, h: 0.5,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      // Markaziy Asosiy Ta'rif Bloki
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 1.25, w: 8.4, h: 1.85,
        fill: { color: style.cardBg },
        line: { color: style.accent, width: 1.5 },
        rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.rect, {
        x: 1.1, y: 1.45, w: 2.8, h: 0.35,
        fill: { color: style.bg },
        line: { color: style.accent, width: 1 },
        rectRadius: 0.06
      });
      slide.addText(card.badge || "FUNDAMENTAL QOIDA", {
        x: 1.1, y: 1.45, w: 2.8, h: 0.35,
        fontSize: 9.5, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
      });
      slide.addText(card.mainConcept || card.title, {
        x: 1.1, y: 1.9, w: 7.8, h: 1.05,
        fontSize: 14.5, bold: true, color: style.text, fontFace: 'Arial'
      });

      // Pastki 2 ta tahliliy kartochka
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 3.25, w: 4.05, h: 2.15,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1 },
        rectRadius: 0.1
      });
      slide.addText("📌 Ilmiy Sharh:", {
        x: 1.0, y: 3.4, w: 3.65, h: 0.35,
        fontSize: 12, bold: true, color: style.accent, fontFace: 'Arial'
      });
      slide.addText(card.explanation || "Mavzuga oid chuqur nazariy va amaliy ma'lumotlar.", {
        x: 1.0, y: 3.8, w: 3.65, h: 1.45,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.rect, {
        x: 5.15, y: 3.25, w: 4.05, h: 2.15,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1 },
        rectRadius: 0.1
      });
      slide.addText("✓ Muhim Asoslar:", {
        x: 5.35, y: 3.4, w: 3.65, h: 0.35,
        fontSize: 12, bold: true, color: style.accent2, fontFace: 'Arial'
      });
      const bulletsText = (card.bullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(bulletsText || "• Fundamental ta'limiy tamoyillar", {
        x: 5.35, y: 3.8, w: 3.65, h: 1.45,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 3. GRID4 (2x2 KARTALAR)
    else if (type === 'grid4') {
      slide.addText(card.title || "Tarkibiy Qismlar va Tuzilma", {
        x: 0.8, y: 0.65, w: 8.4, h: 0.45,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(card.subtitle || "Asosiy elementlar tahlili", {
        x: 0.8, y: 1.1, w: 8.4, h: 0.3,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      const items = (card.items || []).slice(0, 4);
      const coords = [
        { x: 0.8, y: 1.45 },
        { x: 5.15, y: 1.45 },
        { x: 0.8, y: 3.5 },
        { x: 5.15, y: 3.5 }
      ];
      coords.forEach((pos, idx) => {
        const item = items[idx] || { title: `Element ${idx + 1}`, desc: "Batafsil ma'lumot" };
        slide.addShape(pres.ShapeType.rect, {
          x: pos.x, y: pos.y, w: 4.05, h: 1.9,
          fill: { color: style.cardBg },
          line: { color: idx % 2 === 0 ? style.accent : style.accent2, width: 1 },
          rectRadius: 0.1
        });
        slide.addText(item.title, {
          x: pos.x + 0.25, y: pos.y + 0.2, w: 3.55, h: 0.4,
          fontSize: 13, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(item.desc, {
          x: pos.x + 0.25, y: pos.y + 0.65, w: 3.55, h: 1.1,
          fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 4. SPLIT COMPARISON SLAYDI (2 USTUN)
    else if (type === 'split') {
      slide.addText(card.title || "Qiyosiy va Funksional Tahlil", {
        x: 0.8, y: 0.65, w: 8.4, h: 0.5,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      // Chap Ustun
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 1.25, w: 4.05, h: 4.15,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1 },
        rectRadius: 0.12
      });
      slide.addText(card.leftTitle || "📌 1-Yo'nalish", {
        x: 1.05, y: 1.45, w: 3.55, h: 0.45,
        fontSize: 14, bold: true, color: style.accent, fontFace: 'Arial'
      });

      const leftText = (card.leftBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(leftText || "• Tahliliy ma'lumotlar", {
        x: 1.05, y: 2.0, w: 3.55, h: 3.25,
        fontSize: 11.5, color: style.subtext, fontFace: 'Arial'
      });

      // O'ng Ustun
      slide.addShape(pres.ShapeType.rect, {
        x: 5.15, y: 1.25, w: 4.05, h: 4.15,
        fill: { color: style.cardBg },
        line: { color: style.accent2, width: 1 },
        rectRadius: 0.12
      });
      slide.addText(card.rightTitle || "💡 2-Yo'nalish", {
        x: 5.4, y: 1.45, w: 3.55, h: 0.45,
        fontSize: 14, bold: true, color: style.accent2, fontFace: 'Arial'
      });

      const rightText = (card.rightBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(rightText || "• Tahliliy ma'lumotlar", {
        x: 5.4, y: 2.0, w: 3.55, h: 3.25,
        fontSize: 11.5, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 5. 3 TA USTUN (PILLARS GRID)
    else if (type === 'pillars') {
      slide.addText(card.title || "Asosiy Ustunlar va Tamoyillar", {
        x: 0.8, y: 0.65, w: 8.4, h: 0.45,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(card.subtitle || "", {
        x: 0.8, y: 1.1, w: 8.4, h: 0.3,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      const pillars = (card.cards || []).slice(0, 3);
      pillars.forEach((c, idx) => {
        const xPos = 0.8 + (idx * 2.9);
        slide.addShape(pres.ShapeType.rect, {
          x: xPos, y: 1.45, w: 2.65, h: 3.95,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.12
        });

        slide.addText(c.num || `0${idx + 1}`, {
          x: xPos + 0.25, y: 1.65, w: 2.15, h: 0.5,
          fontSize: 26, bold: true, color: style.accent, fontFace: 'Arial'
        });

        slide.addText(c.title, {
          x: xPos + 0.25, y: 2.25, w: 2.15, h: 0.55,
          fontSize: 14, bold: true, color: style.text, fontFace: 'Arial'
        });

        slide.addText(c.desc, {
          x: xPos + 0.25, y: 2.85, w: 2.15, h: 2.4,
          fontSize: 11, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 6. STATS / METRIKA
    else if (type === 'stats' || type === 'deep_dive') {
      slide.addText(card.title || "Asosiy Parametrlar va Statistik Faktlar", {
        x: 0.8, y: 0.65, w: 8.4, h: 0.5,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      if (card.stats && Array.isArray(card.stats) && card.stats.length > 0) {
        const statsList = card.stats.slice(0, 3);
        statsList.forEach((st, idx) => {
          const xPos = 0.8 + (idx * 2.9);
          slide.addShape(pres.ShapeType.rect, {
            x: xPos, y: 1.35, w: 2.65, h: 4.05,
            fill: { color: style.cardBg },
            line: { color: style.accent, width: 1.2 },
            rectRadius: 0.12
          });
          slide.addText(st.value, {
            x: xPos + 0.2, y: 1.7, w: 2.25, h: 0.8,
            fontSize: 32, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
          });
          slide.addText(st.label, {
            x: xPos + 0.2, y: 2.6, w: 2.25, h: 0.55,
            fontSize: 13, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
          });
          slide.addText(st.desc || "", {
            x: xPos + 0.2, y: 3.25, w: 2.25, h: 1.95,
            fontSize: 11, color: style.subtext, align: 'center', fontFace: 'Arial'
          });
        });
      } else {
        slide.addShape(pres.ShapeType.rect, {
          x: 0.8, y: 1.25, w: 3.2, h: 4.15,
          fill: { color: style.cardBg },
          line: { color: style.accent, width: 1.5 },
          rectRadius: 0.12
        });
        slide.addText(card.metricValue || "98.5%", {
          x: 1.0, y: 2.0, w: 2.8, h: 1.0,
          fontSize: 44, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
        });
        slide.addText(card.metricLabel || "Samaradorlik Ko'rsatkichi", {
          x: 1.0, y: 3.2, w: 2.8, h: 0.7,
          fontSize: 13, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
        });

        slide.addShape(pres.ShapeType.rect, {
          x: 4.3, y: 1.25, w: 4.9, h: 4.15,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.12
        });
        slide.addText("🔍 Tahliliy Faktlar va Natijalar:", {
          x: 4.55, y: 1.55, w: 4.4, h: 0.45,
          fontSize: 14, bold: true, color: style.text, fontFace: 'Arial'
        });
        const bulletsText = (card.bullets || []).map(b => `✓  ${b}`).join("\n\n");
        slide.addText(bulletsText || "✓ Tizimli tahlil ma'lumotlari", {
          x: 4.55, y: 2.15, w: 4.4, h: 3.0,
          fontSize: 11.5, color: style.subtext, fontFace: 'Arial'
        });
      }
    }

    // 7. TIMELINE / ROADMAP
    else if (type === 'timeline' || type === 'roadmap') {
      slide.addText(card.title || "Jarayon Ketma-Ketligi va Bosqichlar", {
        x: 0.8, y: 0.65, w: 8.4, h: 0.5,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      const steps = (card.steps || []).slice(0, 3);
      steps.forEach((st, idx) => {
        const yPos = 1.35 + (idx * 1.3);
        slide.addShape(pres.ShapeType.rect, {
          x: 0.8, y: yPos, w: 8.4, h: 1.15,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.1
        });

        slide.addShape(pres.ShapeType.rect, {
          x: 1.05, y: yPos + 0.2, w: 1.8, h: 0.35,
          fill: { color: style.bg },
          line: { color: style.accent, width: 1 },
          rectRadius: 0.06
        });
        slide.addText(st.step || `${idx + 1}-BOSQICH`, {
          x: 1.05, y: yPos + 0.2, w: 1.8, h: 0.35,
          fontSize: 10, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
        });

        slide.addText(st.title, {
          x: 3.05, y: yPos + 0.2, w: 5.9, h: 0.35,
          fontSize: 13, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(st.desc || st.text || "", {
          x: 3.05, y: yPos + 0.55, w: 5.9, h: 0.5,
          fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 8. QUIZ SLIDE (INTERAKTIV BILIMNI SINASH)
    else if (type === 'quiz_slide') {
      slide.addText(card.title || "Interaktiv Bilimni Sinash", {
        x: 0.8, y: 0.6, w: 8.4, h: 0.45,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 1.15, w: 8.4, h: 1.05,
        fill: { color: style.cardBg },
        line: { color: style.accent, width: 1.5 },
        rectRadius: 0.1
      });
      slide.addText(card.question || "Mavzuga oid muhim savol?", {
        x: 1.05, y: 1.25, w: 7.9, h: 0.85,
        fontSize: 13.5, bold: true, color: style.text, fontFace: 'Arial'
      });

      const options = (card.options || []).slice(0, 4);
      const optCoords = [
        { x: 0.8, y: 2.35 },
        { x: 5.15, y: 2.35 },
        { x: 0.8, y: 3.25 },
        { x: 5.15, y: 3.25 }
      ];
      optCoords.forEach((pos, idx) => {
        slide.addShape(pres.ShapeType.rect, {
          x: pos.x, y: pos.y, w: 4.05, h: 0.78,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.08
        });
        slide.addText(options[idx] || `Variant ${idx + 1}`, {
          x: pos.x + 0.2, y: pos.y + 0.15, w: 3.65, h: 0.5,
          fontSize: 11, color: style.text, fontFace: 'Arial'
        });
      });

      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 4.15, w: 8.4, h: 1.25,
        fill: { color: style.cardBg },
        line: { color: style.accent2, width: 1.2 },
        rectRadius: 0.1
      });
      slide.addText("🔑 O'qituvchi Kaliti va Ilmiy Sharh:", {
        x: 1.05, y: 4.25, w: 7.9, h: 0.35,
        fontSize: 11, bold: true, color: style.accent2, fontFace: 'Arial'
      });
      slide.addText(card.answer || "To'g'ri javob tahlili", {
        x: 1.05, y: 4.6, w: 7.9, h: 0.7,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 9. CONCLUSION / XULOSA
    else {
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 0.85, w: 8.4, h: 4.6,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1.5 },
        rectRadius: 0.15
      });

      slide.addText(card.title || "Yakuniy Xulosa va Natijalar", {
        x: 1.2, y: 1.15, w: 7.6, h: 0.55,
        fontSize: 22, bold: true, color: style.accent, fontFace: 'Arial'
      });

      if (card.quote) {
        slide.addShape(pres.ShapeType.rect, {
          x: 1.2, y: 1.85, w: 7.6, h: 1.0,
          fill: { color: style.bg },
          line: { color: style.accent2, width: 1 },
          rectRadius: 0.08
        });
        slide.addText(`"${card.quote}"`, {
          x: 1.4, y: 1.95, w: 7.2, h: 0.8,
          fontSize: 12.5, italic: true, color: style.text, align: 'center', fontFace: 'Arial'
        });
      }

      const takeawaysText = (card.takeaways || []).map(t => `★  ${t}`).join("\n\n");
      slide.addText(takeawaysText || "★ Mavzuning muhim ta'limiy xulosalari", {
        x: 1.2, y: 3.0, w: 7.6, h: 2.2,
        fontSize: 12, color: style.subtext, fontFace: 'Arial'
      });
    }
  });

  return await pres.writeFile({ fileName: filename });
}
