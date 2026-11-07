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

    // 1. GAMMA & GENSPARK ULTRA-MODERN AMBIENT MESH GLOW (ORQA FONDA YORITISH AULASI)
    slide.addShape(pres.ShapeType.ellipse, {
      x: -1.2, y: -1.0, w: 4.8, h: 4.8,
      fill: { color: style.accent, transparency: 86 },
      line: { color: style.accent, width: 0 }
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 6.8, y: 2.8, w: 4.6, h: 4.6,
      fill: { color: style.accent2, transparency: 88 },
      line: { color: style.accent2, width: 0 }
    });

    // 2. YUQORI VA PASTKI ZAMONAVIY DEKORATIV CHIZIQLAR VA BADGE
    slide.addShape(pres.ShapeType.line, {
      x: 0.8, y: 0.62, w: 8.4, h: 0,
      line: { color: style.cardBorder, width: 0.75, dashType: 'solid' }
    });
    slide.addText(`SMARTOFFICE & EDUAI PRO  •  GAMMA ENGINE  •  SLAYD ${index + 1}/${slideDeck.length}`, {
      x: 0.8, y: 0.32, w: 8.4, h: 0.28, fontSize: 9.5, color: style.subtext, bold: true, fontFace: 'Arial'
    });

    if (card.speakerNotes) {
      slide.addNotes(card.speakerNotes);
    }

    const type = card.type || (index === 0 ? 'hero' : 'concept');

    // 1. HERO SLAYDI
    if (type === 'hero' || (index === 0 && type !== 'split' && type !== 'pillars')) {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 4.4,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1.5 },
        rectRadius: 0.15
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.2, y: 1.25, w: 3.5, h: 0.42,
        fill: { color: style.bg },
        line: { color: style.accent, width: 1.2 },
        rectRadius: 0.08
      });
      slide.addText(card.badge || "GAMMA AI TAQDIMOT", {
        x: 1.2, y: 1.25, w: 3.5, h: 0.42,
        fontSize: 11, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
      });

      slide.addText((card.title || topic).toUpperCase(), {
        x: 1.2, y: 1.85, w: 7.6, h: 1.5,
        fontSize: 28, bold: true, color: style.text, fontFace: 'Arial'
      });

      slide.addText(card.subtitle || `Zamonaviy ta'lim va tahliliy taqdimot`, {
        x: 1.2, y: 3.45, w: 7.6, h: 1.0,
        fontSize: 14.5, color: style.subtext, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.2, y: 4.55, w: 4.6, h: 0.42, fill: { color: style.bg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.08
      });
      slide.addText(`👤 Taqdimotchi: ${authorName}  |  ⚡ AI Verified`, {
        x: 1.35, y: 4.55, w: 4.3, h: 0.42,
        fontSize: 10, italic: true, color: style.subtext, fontFace: 'Arial', valign: 'middle'
      });
    }

    // 2. CONCEPT / ASOSIY QOIDA SLAYDI
    else if (type === 'concept') {
      slide.addText(card.title || "Asosiy Tushuncha", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 8.4, h: 1.85,
        fill: { color: style.cardBg },
        line: { color: style.accent, width: 1.5 },
        rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 0.12, h: 1.85, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.05
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.15, y: 1.45, w: 2.8, h: 0.35,
        fill: { color: style.bg },
        line: { color: style.accent, width: 1 },
        rectRadius: 0.06
      });
      slide.addText(card.badge || "FUNDAMENTAL QOIDA", {
        x: 1.15, y: 1.45, w: 2.8, h: 0.35,
        fontSize: 9.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(card.mainConcept || card.title, {
        x: 1.15, y: 1.9, w: 7.7, h: 1.05,
        fontSize: 14.5, bold: true, color: style.text, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 3.25, w: 4.05, h: 2.05,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1 },
        rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 3.25, w: 4.05, h: 0.06, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.03
      });
      slide.addText("📌 Ilmiy Sharh:", {
        x: 1.05, y: 3.42, w: 3.6, h: 0.32,
        fontSize: 12, bold: true, color: style.accent, fontFace: 'Arial'
      });
      slide.addText(card.explanation || "Mavzuga oid chuqur nazariy va amaliy ma'lumotlar.", {
        x: 1.05, y: 3.8, w: 3.6, h: 1.35,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.15, y: 3.25, w: 4.05, h: 2.05,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1 },
        rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.15, y: 3.25, w: 4.05, h: 0.06, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.03
      });
      slide.addText("✓ Muhim Asoslar:", {
        x: 5.35, y: 3.42, w: 3.6, h: 0.32,
        fontSize: 12, bold: true, color: style.accent2, fontFace: 'Arial'
      });
      const bulletsText = (card.bullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(bulletsText || "• Fundamental ta'limiy tamoyillar", {
        x: 5.35, y: 3.8, w: 3.6, h: 1.35,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 3. GRID4 (2x2 KARTALAR)
    else if (type === 'grid4') {
      slide.addText(card.title || "Tarkibiy Qismlar va Tuzilma", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.45,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(card.subtitle || "Asosiy elementlar tahlili", {
        x: 0.8, y: 1.12, w: 8.4, h: 0.28,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      const items = (card.items || []).slice(0, 4);
      const coords = [
        { x: 0.8, y: 1.45, col: style.accent, tag: "01" },
        { x: 5.15, y: 1.45, col: style.accent2, tag: "02" },
        { x: 0.8, y: 3.45, col: style.accent2, tag: "03" },
        { x: 5.15, y: 3.45, col: style.accent, tag: "04" }
      ];
      coords.forEach((pos, idx) => {
        const item = items[idx] || { title: `Element ${idx + 1}`, desc: "Batafsil ma'lumot" };
        slide.addShape(pres.ShapeType.roundRect, {
          x: pos.x, y: pos.y, w: 4.05, h: 1.85,
          fill: { color: style.cardBg },
          line: { color: pos.col, width: 1 },
          rectRadius: 0.1
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: pos.x, y: pos.y, w: 4.05, h: 0.06, fill: { color: pos.col }, line: { color: pos.col, width: 0 }, rectRadius: 0.03
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: pos.x + 0.2, y: pos.y + 0.18, w: 0.5, h: 0.32, fill: { color: style.bg }, line: { color: pos.col, width: 1 }, rectRadius: 0.05
        });
        slide.addText(pos.tag, {
          x: pos.x + 0.2, y: pos.y + 0.18, w: 0.5, h: 0.32, fontSize: 9.5, bold: true, color: pos.col, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
        slide.addText(item.title, {
          x: pos.x + 0.8, y: pos.y + 0.18, w: 3.05, h: 0.35,
          fontSize: 12.5, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(item.desc, {
          x: pos.x + 0.25, y: pos.y + 0.6, w: 3.6, h: 1.15,
          fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 4. SPLIT COMPARISON SLAYDI (2 USTUN & VERSUS)
    else if (type === 'split') {
      slide.addText(card.title || "Qiyosiy va Funksional Tahlil", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 3.9, h: 4.0,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1 },
        rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 3.9, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.leftTitle || "📌 1-Yo'nalish", {
        x: 1.05, y: 1.45, w: 3.4, h: 0.42,
        fontSize: 13.5, bold: true, color: style.accent, fontFace: 'Arial'
      });
      const leftText = (card.leftBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(leftText || "• Tahliliy ma'lumotlar", {
        x: 1.05, y: 1.95, w: 3.4, h: 3.1,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.3, y: 1.25, w: 3.9, h: 4.0,
        fill: { color: style.cardBg },
        line: { color: style.accent2, width: 1 },
        rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.3, y: 1.25, w: 3.9, h: 0.08, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.rightTitle || "💡 2-Yo'nalish", {
        x: 5.5, y: 1.45, w: 3.4, h: 0.42,
        fontSize: 13.5, bold: true, color: style.accent2, fontFace: 'Arial'
      });
      const rightText = (card.rightBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(rightText || "• Tahliliy ma'lumotlar", {
        x: 5.5, y: 1.95, w: 3.4, h: 3.1,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.ellipse, {
        x: 4.7, y: 2.9, w: 0.6, h: 0.6, fill: { color: style.bg }, line: { color: style.accent, width: 1.5 }
      });
      slide.addText("VS", {
        x: 4.7, y: 2.9, w: 0.6, h: 0.6, fontSize: 9.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
    }

    // 5. 3 TA USTUN (PILLARS GRID)
    else if (type === 'pillars') {
      slide.addText(card.title || "Asosiy Ustunlar va Tamoyillar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.45,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(card.subtitle || "", {
        x: 0.8, y: 1.12, w: 8.4, h: 0.28,
        fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      const pillars = (card.cards || []).slice(0, 3);
      pillars.forEach((c, idx) => {
        const xPos = 0.8 + (idx * 2.9);
        const col = idx === 1 ? style.accent2 : style.accent;
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos, y: 1.45, w: 2.65, h: 3.9,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.12
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos, y: 1.45, w: 2.65, h: 0.08, fill: { color: col }, line: { color: col, width: 0 }, rectRadius: 0.04
        });
        slide.addShape(pres.ShapeType.ellipse, {
          x: xPos + 0.25, y: 1.68, w: 0.55, h: 0.55, fill: { color: style.bg }, line: { color: col, width: 1.2 }
        });
        slide.addText(c.num || `0${idx + 1}`, {
          x: xPos + 0.25, y: 1.68, w: 0.55, h: 0.55,
          fontSize: 12, bold: true, color: col, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
        slide.addText(c.title, {
          x: xPos + 0.25, y: 2.35, w: 2.15, h: 0.5,
          fontSize: 13.5, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(c.desc, {
          x: xPos + 0.25, y: 2.9, w: 2.15, h: 2.3,
          fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 6. STATS / METRIKA (PROGRESS BARS BILAN)
    else if (type === 'stats' || type === 'deep_dive') {
      slide.addText(card.title || "Asosiy Parametrlar va Statistik Faktlar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      if (card.stats && Array.isArray(card.stats) && card.stats.length > 0) {
        const statsList = card.stats.slice(0, 3);
        statsList.forEach((st, idx) => {
          const xPos = 0.8 + (idx * 2.9);
          slide.addShape(pres.ShapeType.roundRect, {
            x: xPos, y: 1.35, w: 2.65, h: 4.0,
            fill: { color: style.cardBg },
            line: { color: style.accent, width: 1.2 },
            rectRadius: 0.12
          });
          slide.addShape(pres.ShapeType.roundRect, {
            x: xPos, y: 1.35, w: 2.65, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
          });
          slide.addText(st.value, {
            x: xPos + 0.15, y: 1.6, w: 2.35, h: 0.85,
            fontSize: 32, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
          });
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos + 0.3, y: 2.5, w: 2.05, h: 0.08, fill: { color: style.bg }, line: { color: style.cardBorder, width: 0.5 }, rectRadius: 0.04
          });
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos + 0.3, y: 2.5, w: 1.2 + (idx * 0.35), h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
          });
          slide.addText(st.label, {
            x: xPos + 0.15, y: 2.7, w: 2.35, h: 0.5,
            fontSize: 12.5, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
          });
          slide.addText(st.desc || "", {
            x: xPos + 0.15, y: 3.25, w: 2.35, h: 1.95,
            fontSize: 10.5, color: style.subtext, align: 'center', fontFace: 'Arial'
          });
        });
      } else {
        slide.addShape(pres.ShapeType.roundRect, {
          x: 0.8, y: 1.25, w: 3.2, h: 4.0,
          fill: { color: style.cardBg },
          line: { color: style.accent, width: 1.5 },
          rectRadius: 0.12
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 1.25, w: 3.2, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
        });
        slide.addText(card.metricValue || "98.5%", {
          x: 1.0, y: 1.9, w: 2.8, h: 1.0,
          fontSize: 44, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.2, y: 3.0, w: 2.4, h: 0.1, fill: { color: style.bg }, line: { color: style.cardBorder, width: 0.5 }, rectRadius: 0.05
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.2, y: 3.0, w: 2.2, h: 0.1, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.05
        });
        slide.addText(card.metricLabel || "Samaradorlik Ko'rsatkichi", {
          x: 1.0, y: 3.25, w: 2.8, h: 0.7,
          fontSize: 12.5, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
        });

        slide.addShape(pptx.ShapeType.roundRect, {
          x: 4.3, y: 1.25, w: 4.9, h: 4.0,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.12
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 4.3, y: 1.25, w: 4.9, h: 0.08, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.04
        });
        slide.addText("🔍 Tahliliy Faktlar va Natijalar:", {
          x: 4.55, y: 1.55, w: 4.4, h: 0.42,
          fontSize: 13.5, bold: true, color: style.text, fontFace: 'Arial'
        });
        const bulletsText = (card.bullets || []).map(b => `✓  ${b}`).join("\n\n");
        slide.addText(bulletsText || "✓ Tizimli tahlil ma'lumotlari", {
          x: 4.55, y: 2.1, w: 4.4, h: 2.9,
          fontSize: 11, color: style.subtext, fontFace: 'Arial'
        });
      }
    }

    // 7. TIMELINE / ROADMAP
    else if (type === 'timeline' || type === 'roadmap') {
      slide.addText(card.title || "Jarayon Ketma-Ketligi va Bosqichlar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.line, {
        x: 1.3, y: 1.8, w: 0, h: 2.6,
        line: { color: style.accent, width: 1.8, dashType: 'dash' }
      });
      const steps = (card.steps || []).slice(0, 3);
      steps.forEach((st, idx) => {
        const yPos = 1.35 + (idx * 1.3);
        slide.addShape(pres.ShapeType.ellipse, {
          x: 1.1, y: yPos + 0.32, w: 0.4, h: 0.4, fill: { color: style.accent }, line: { color: style.bg, width: 1.5 }
        });
        slide.addText(String(idx + 1), {
          x: 1.1, y: yPos + 0.32, w: 0.4, h: 0.4,
          fontSize: 10, bold: true, color: style.bg, align: 'center', valign: 'middle', fontFace: 'Arial'
        });

        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.7, y: yPos, w: 7.5, h: 1.15,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.1
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.7, y: yPos, w: 0.08, h: 1.15, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.95, y: yPos + 0.2, w: 1.6, h: 0.32,
          fill: { color: style.bg },
          line: { color: style.accent, width: 1 },
          rectRadius: 0.06
        });
        slide.addText(st.step || `${idx + 1}-BOSQICH`, {
          x: 1.95, y: yPos + 0.2, w: 1.6, h: 0.32,
          fontSize: 9.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
        });

        slide.addText(st.title, {
          x: 3.75, y: yPos + 0.18, w: 5.25, h: 0.35,
          fontSize: 12.5, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(st.desc || st.text || "", {
          x: 3.75, y: yPos + 0.55, w: 5.25, h: 0.5,
          fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 8. QUIZ SLIDE (INTERAKTIV BILIMNI SINASH)
    else if (type === 'quiz_slide') {
      slide.addText(card.title || "Interaktiv Bilimni Sinash", {
        x: 0.8, y: 0.65, w: 8.4, h: 0.45,
        fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.15, w: 8.4, h: 1.05,
        fill: { color: style.cardBg },
        line: { color: style.accent, width: 1.5 },
        rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.15, w: 8.4, h: 0.06, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.03
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
        slide.addShape(pres.ShapeType.roundRect, {
          x: pos.x, y: pos.y, w: 4.05, h: 0.78,
          fill: { color: style.cardBg },
          line: { color: style.cardBorder, width: 1 },
          rectRadius: 0.08
        });
        slide.addShape(pres.ShapeType.ellipse, {
          x: pos.x + 0.15, y: pos.y + 0.18, w: 0.4, h: 0.4, fill: { color: style.bg }, line: { color: style.accent, width: 1 }
        });
        slide.addText(["A", "B", "C", "D"][idx], {
          x: pos.x + 0.15, y: pos.y + 0.18, w: 0.4, h: 0.4,
          fontSize: 10, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
        slide.addText(options[idx] || `Variant ${idx + 1}`, {
          x: pos.x + 0.65, y: pos.y + 0.12, w: 3.25, h: 0.55,
          fontSize: 11, color: style.text, fontFace: 'Arial'
        });
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 4.15, w: 8.4, h: 1.2,
        fill: { color: style.cardBg },
        line: { color: style.accent2, width: 1.2 },
        rectRadius: 0.1
      });
      slide.addText("🔑 O'qituvchi Kaliti va Ilmiy Sharh:", {
        x: 1.05, y: 4.25, w: 7.9, h: 0.32,
        fontSize: 11, bold: true, color: style.accent2, fontFace: 'Arial'
      });
      slide.addText(card.answer || "To'g'ri javob tahlili", {
        x: 1.05, y: 4.58, w: 7.9, h: 0.68,
        fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 9. CONCLUSION / XULOSA
    else {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 4.4,
        fill: { color: style.cardBg },
        line: { color: style.cardBorder, width: 1.5 },
        rectRadius: 0.15
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
      });

      slide.addText(card.title || "Yakuniy Xulosa va Natijalar", {
        x: 1.2, y: 1.15, w: 7.6, h: 0.5,
        fontSize: 22, bold: true, color: style.accent, fontFace: 'Arial'
      });

      if (card.quote) {
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.2, y: 1.8, w: 7.6, h: 1.05,
          fill: { color: style.bg },
          line: { color: style.accent2, width: 1 },
          rectRadius: 0.08
        });
        slide.addText(`“ ${card.quote} ”`, {
          x: 1.4, y: 1.9, w: 7.2, h: 0.85,
          fontSize: 12.5, italic: true, color: style.text, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
      }

      const takeawaysText = (card.takeaways || []).map(t => `★  ${t}`).join("\n\n");
      slide.addText(takeawaysText || "★ Mavzuning muhim ta'limiy xulosalari", {
        x: 1.2, y: 3.0, w: 7.6, h: 2.1,
        fontSize: 11.5, color: style.subtext, fontFace: 'Arial'
      });
    }
  });

  return await pres.writeFile({ fileName: filename });
}
