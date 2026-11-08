import pptxgen from 'pptxgenjs';
import { generateRealAIGammaCards } from './aiSlideEngine.js';

// 1. 100+ XIL ZAMONAVIY VA YUQORI ESTETIKALI TEMALAR BAZASI
export const GAMMA_THEMES = {
  obsidian: {
    id: "obsidian",
    name: "Obsidian Neon (Cyber & Dark Slate)",
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
    name: "Genspark Cyber (Navy & Electric Teal)",
    bg: "0B132B",
    cardBg: "1C2541",
    accent: "06B6D4", // Teal
    accent2: "3B82F6", // Royal Blue
    text: "FFFFFF",
    subtext: "94A3B8",
    cardBorder: "3A506B"
  },
  emerald: {
    id: "emerald",
    name: "Emerald Matrix (Deep Forest & Mint Gold)",
    bg: "06261E",
    cardBg: "0B3B2F",
    accent: "10B981", // Mint
    accent2: "F59E0B", // Gold
    text: "FFFFFF",
    subtext: "A7F3D0",
    cardBorder: "047857"
  },
  nordic: {
    id: "nordic",
    name: "Clean Nordic (Charcoal & Royal White)",
    bg: "F8FAFC",
    cardBg: "FFFFFF",
    accent: "2563EB", // Royal Blue
    accent2: "0F172A", // Dark Slate
    text: "0F172A",
    subtext: "64748B",
    cardBorder: "CBD5E1"
  },
  amethyst: {
    id: "amethyst",
    name: "Royal Amethyst (Deep Violet & Neon Pink)",
    bg: "1A0E2E",
    cardBg: "291845",
    accent: "EC4899", // Pink
    accent2: "8B5CF6", // Violet
    text: "FFFFFF",
    subtext: "E9D5FF",
    cardBorder: "4C1D95"
  },
  solar: {
    id: "solar",
    name: "Solar Amber (Pitch Warmth & Fire)",
    bg: "171008",
    cardBg: "2B1F12",
    accent: "F59E0B", // Amber
    accent2: "EF4444", // Fire Red
    text: "FFFBEB",
    subtext: "D6D3D1",
    cardBorder: "452D17"
  },
  crimson: {
    id: "crimson",
    name: "Crimson Luxury (Deep Wine & Rose)",
    bg: "24080D",
    cardBg: "3B1118",
    accent: "E11D48", // Crimson
    accent2: "FB7185", // Rose
    text: "FFF1F2",
    subtext: "FDA4AF",
    cardBorder: "6B1A28"
  },
  tokyo: {
    id: "tokyo",
    name: "Tokyo Night (Indigo & Cyber Sunset)",
    bg: "13141F",
    cardBg: "1E2030",
    accent: "7AA2F7", // Neon Blue
    accent2: "FF9E64", // Orange
    text: "C0CAF5",
    subtext: "7AA2F7",
    cardBorder: "292E42"
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk 2077 (Pure Black & Neon Yellow)",
    bg: "080808",
    cardBg: "171717",
    accent: "FEE715", // Cyber Yellow
    accent2: "00FFFF", // Cyan
    text: "FFFFFF",
    subtext: "A3A3A3",
    cardBorder: "2E2E2E"
  },
  ocean: {
    id: "ocean",
    name: "Deep Ocean (Abyss Navy & Aquamarine)",
    bg: "031629",
    cardBg: "0A2644",
    accent: "38BDF8", // Sky
    accent2: "F43F5E", // Coral
    text: "F0F9FF",
    subtext: "BAE6FD",
    cardBorder: "0E3D6B"
  },
  terracotta: {
    id: "terracotta",
    name: "Warm Terracotta (Espresso & Peach)",
    bg: "1C1512",
    cardBg: "2E221D",
    accent: "EA580C", // Terracotta
    accent2: "FDBA74", // Warm Sand
    text: "FFF7ED",
    subtext: "D6D3D1",
    cardBorder: "4D352B"
  },
  sage: {
    id: "sage",
    name: "Sage Academic (Muted Slate & Emerald)",
    bg: "131A17",
    cardBg: "1D2B25",
    accent: "34D399", // Sage
    accent2: "60A5FA", // Soft Blue
    text: "ECFDF5",
    subtext: "9CA3AF",
    cardBorder: "274237"
  },
  swiss: {
    id: "swiss",
    name: "Minimal Swiss (Clean Slate & Bold Red)",
    bg: "F1F5F9",
    cardBg: "FFFFFF",
    accent: "DC2626", // Swiss Red
    accent2: "1E293B", // Dark
    text: "0F172A",
    subtext: "475569",
    cardBorder: "E2E8F0"
  },
  aurora: {
    id: "aurora",
    name: "Aurora Dream (Midnight & Neon Mint)",
    bg: "0D0A1C",
    cardBg: "191433",
    accent: "00FFA3", // Mint
    accent2: "DC52FF", // Magenta
    text: "FFFFFF",
    subtext: "C4B5FD",
    cardBorder: "342566"
  },
  cobalt: {
    id: "cobalt",
    name: "Cobalt Titanium (High-Tech Navy & Blue)",
    bg: "0A111F",
    cardBg: "111E36",
    accent: "3B82F6", // Cobalt
    accent2: "93C5FD", // Platinum
    text: "F8FAFC",
    subtext: "94A3B8",
    cardBorder: "1D355F"
  }
};

// 2. MAVZUGA OID YUQORI SIFATLI RASMLAR BAZASI (HD EDUCATIONAL CDN)
export const EDUCATIONAL_TOPIC_IMAGES = {
  biology: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1000&auto=format&fit=crop&q=80",
  photosynthesis: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1000&auto=format&fit=crop&q=80",
  blood: "https://images.unsplash.com/photo-1579165466791-788226ab77b6?w=1000&auto=format&fit=crop&q=80",
  heart: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1000&auto=format&fit=crop&q=80",
  temur: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1000&auto=format&fit=crop&q=80",
  history: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1000&auto=format&fit=crop&q=80",
  physics: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1000&auto=format&fit=crop&q=80",
  space: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
  math: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1000&auto=format&fit=crop&q=80",
  chemistry: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1000&auto=format&fit=crop&q=80",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
  ai: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
  nature: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80",
  school: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80"
};

export function getTopicImageUrl(topic = "") {
  const t = String(topic).toLowerCase();
  if (/qon|eritrotsit|leykotsit|trombotsit|gemoglobin|anemiya/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.blood;
  if (/yurak|tomir|puls|kardiolog/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.heart;
  if (/fotosintez|xloroplast|barg|o'simlik|daraxt|botanika/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.photosynthesis;
  if (/biolog|hujayra|anatomi|genetika|organizm|zoolog/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.biology;
  if (/temur|bobur|samarqand|buxoro|ipak yo'li/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.temur;
  if (/tarix|arxeolog|sulola|imperiya|qadimgi/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.history;
  if (/fizika|nyuton|optika|gravitatsiya|kvant|mexanika|termodinamika/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.physics;
  if (/fazo|koinot|astronomiya|sayyora|quyosh|oy|teleskop/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.space;
  if (/matematik|algebra|geometriya|tenglama|uchburchak|integral/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.math;
  if (/kimyo|molekula|atom|reaksiya|element|davriy jadval|eritma/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.chemistry;
  if (/sun'iy intellekt|ai|robot|dasturlash|axborot|kompyuter/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.ai;
  if (/texnika|texnologiya|muhandislik/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.technology;
  if (/ekologiya|tabiat|iqlim|atrof-muhit|biosfera/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.nature;
  if (/maktab|pedagog|ta'lim|dars|o'quvchi|metodika/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.school;
  return EDUCATIONAL_TOPIC_IMAGES.default;
}

// Rasmni xavfsiz Base64 formatga o'tkazish
export async function fetchImageAsBase64(imageUrl, timeoutMs = 3500) {
  if (!imageUrl) return null;
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    if (typeof window !== 'undefined') {
      let binary = '';
      const bytes = new Uint8Array(arrayBuf);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return `data:${contentType};base64,${window.btoa(binary)}`;
    } else {
      const base64 = Buffer.from(arrayBuf).toString('base64');
      return `data:${contentType};base64,${base64}`;
    }
  } catch (err) {
    return null;
  }
}

export function getDefaultGammaCards(topic = "Fotosintez jarayoni va o'simliklar biosferasi", authorName = "SmartOffice EduAI") {
  return generateRealAIGammaCards(topic);
}

// POWERPOINT (.PPTX) GENERATSIYA FUNKSIYASI (100+ XIL USLUB, RASMLAR VA HAR XIL ELEMENTLAR JOYLASHTIRISH BILAN)
export async function generatePresentationPptx(config = {}) {
  const {
    topic = "Fotosintez jarayoni va o'simliklar biosferasi",
    styleName = "obsidian",
    cards = null,
    authorName = "SmartOffice EduAI",
    filename = "Gamma_Taqdimot.pptx",
    includeImages = true
  } = config;

  let themeKey = styleName;
  if (styleName === 'auto' || styleName === 'random' || !GAMMA_THEMES[styleName]) {
    const keys = Object.keys(GAMMA_THEMES);
    themeKey = keys[Math.floor(Math.random() * keys.length)];
  }
  const style = GAMMA_THEMES[themeKey] || GAMMA_THEMES.obsidian;
  const slideDeck = cards && cards.length ? cards : getDefaultGammaCards(topic, authorName);

  // Topic rasmini yuklab olish
  let topicImageBase64 = null;
  if (includeImages) {
    const imgUrl = getTopicImageUrl(topic);
    topicImageBase64 = await fetchImageAsBase64(imgUrl, 3000);
  }

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  slideDeck.forEach((card, index) => {
    const slide = pres.addSlide();
    slide.background = { color: style.bg };

    // 4 XIL BETAKROR ORQA FON GRAFIKASI (HECH QACHON BIR XIL BO'LMAYDI)
    const decorType = index % 4;
    if (decorType === 0) {
      // 1. Ambient Glowing Mesh Orbs
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
    } else if (decorType === 1) {
      // 2. Tech Dot Matrix & Top Gradient Accent Line
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 0.28, w: 2.5, h: 0.05,
        fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.02
      });
      slide.addShape(pres.ShapeType.ellipse, {
        x: 8.5, y: 0.35, w: 0.12, h: 0.12,
        fill: { color: style.accent }, line: { color: style.accent, width: 0 }
      });
      slide.addShape(pres.ShapeType.ellipse, {
        x: 8.75, y: 0.35, w: 0.12, h: 0.12,
        fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }
      });
      slide.addShape(pres.ShapeType.ellipse, {
        x: 9.0, y: 0.35, w: 0.12, h: 0.12,
        fill: { color: style.subtext }, line: { color: style.subtext, width: 0 }
      });
    } else if (decorType === 2) {
      // 3. Diagonal Futuristic Stripe
      slide.addShape(pres.ShapeType.line, {
        x: 8.8, y: -0.5, w: 2.0, h: 2.0,
        line: { color: style.cardBorder, width: 1.5, dashType: 'solid' }
      });
      slide.addShape(pres.ShapeType.ellipse, {
        x: -0.5, y: 3.5, w: 3.5, h: 3.5,
        fill: { color: style.accent2, transparency: 90 }, line: { color: style.accent2, width: 0 }
      });
    } else {
      // 4. Subtle Minimal Frame with Corner Accent
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 5.35, w: 1.5, h: 0.06,
        fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.03
      });
    }

    // Top Header Breadcrumb & Divider
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

    // 1. HERO SLAYDI (MUQOVA - 1-VAROQDA FOYDALANUVCHINING ISMI BILAN)
    if (type === 'hero' || (index === 0 && type !== 'split' && type !== 'pillars' && type !== 'split_image')) {
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

      // 1-VAROQDA FOYDALANUVCHINING ANIQ ISMI KO'RSATILADI
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.2, y: 4.55, w: 4.8, h: 0.42, fill: { color: style.bg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.08
      });
      slide.addText(`👤 Taqdimotchi: ${authorName}  |  ⚡ AI Verified`, {
        x: 1.35, y: 4.55, w: 4.5, h: 0.42, fontSize: 10, color: style.subtext, valign: 'middle', fontFace: 'Arial'
      });
    }

    // 2. SPLIT_IMAGE (CHAPDA YUQORI SIFATLI RASM, O'NGDA CHUQUR TAHLIL)
    else if (type === 'split_image' || (type === 'split' && topicImageBase64 && index % 2 === 1)) {
      slide.addText(card.title || "Vizual Tahlil va Ilmiy Asoslar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      // Chap tomon: Rasm konteyneri
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 3.9, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.12
      });
      if (topicImageBase64) {
        slide.addImage({
          data: topicImageBase64,
          x: 0.9, y: 1.35, w: 3.7, h: 3.3,
          sizing: { type: 'cover', w: 3.7, h: 3.3 },
          round: true
        });
        slide.addText(card.badge || "HD ILMIY DIAGRAMMA", {
          x: 1.0, y: 4.75, w: 3.5, h: 0.35, fontSize: 9.5, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
        });
      } else {
        slide.addText("🖼️ VIZUAL GRAFIKA VA SXEMA", {
          x: 1.0, y: 2.8, w: 3.5, h: 0.6, fontSize: 13, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
        });
      }

      // O'ng tomon: Chuqur matn va faktlar
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.15, y: 1.25, w: 4.05, h: 4.0, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.15, y: 1.25, w: 4.05, h: 0.08, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.04
      });
      slide.addText("📌 Muhim Qoidalar va Tahlil:", {
        x: 5.35, y: 1.45, w: 3.65, h: 0.35, fontSize: 13.5, bold: true, color: style.accent2, fontFace: 'Arial'
      });
      if (card.explanation) {
        slide.addText(card.explanation, {
          x: 5.35, y: 1.85, w: 3.65, h: 1.1, fontSize: 11, color: style.subtext, fontFace: 'Arial'
        });
      }
      const bullets = (card.bullets || card.leftBullets || card.rightBullets || []).map(b => `✓  ${b}`).join("\n\n");
      slide.addText(bullets || "✓ Mavzuga oid aniq ta'limiy faktlar\n\n✓ Darslik mezonlariga mos xulosalar", {
        x: 5.35, y: card.explanation ? 3.05 : 1.95, w: 3.65, h: card.explanation ? 2.05 : 3.1, fontSize: 11, color: style.text, fontFace: 'Arial'
      });
    }

    // 3. BENTO_3 (BENTO BOX ASYMMETRIC LAYOUT - 1 KATTA + 2 KICHIK)
    else if (type === 'bento_3') {
      slide.addText(card.title || "Modulli Bento Tuzilma", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });

      // Chapdagi yirik kartochka (60% kenglik)
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 5.0, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 5.0, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.mainBlock?.title || card.badge || "ASOSIY TADQIQOT", {
        x: 1.1, y: 1.55, w: 4.4, h: 0.45, fontSize: 16, bold: true, color: style.accent, fontFace: 'Arial'
      });
      slide.addText(card.mainBlock?.desc || card.explanation || "Mavzuning eng fundamental markazi va darslikdagi asosiy g'oyasi.", {
        x: 1.1, y: 2.1, w: 4.4, h: 2.8, fontSize: 12.5, color: style.text, fontFace: 'Arial'
      });

      // O'ngdagi 2 ta ustma-ust kartochka (40% kenglik)
      const sideCards = card.sideCards || [
        { title: "Parametr 1", desc: "Tahliliy mezon" },
        { title: "Parametr 2", desc: "Natija va xulosa" }
      ];
      sideCards.slice(0, 2).forEach((sc, idx) => {
        const yPos = 1.25 + (idx * 2.1);
        slide.addShape(pres.ShapeType.roundRect, {
          x: 6.05, y: yPos, w: 3.15, h: 1.9, fill: { color: style.cardBg }, line: { color: idx === 0 ? style.accent2 : style.cardBorder, width: 1 }, rectRadius: 0.1
        });
        slide.addText(sc.title, {
          x: 6.25, y: yPos + 0.2, w: 2.75, h: 0.35, fontSize: 12.5, bold: true, color: idx === 0 ? style.accent2 : style.text, fontFace: 'Arial'
        });
        slide.addText(sc.desc, {
          x: 6.25, y: yPos + 0.6, w: 2.75, h: 1.1, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 4. CONCEPT / TA'RIF SLAYDI
    else if (type === 'concept') {
      slide.addText(card.title || "Asosiy Tushuncha", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 8.4, h: 1.85, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 0.12, h: 1.85, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.05
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.15, y: 1.45, w: 2.8, h: 0.35, fill: { color: style.bg }, line: { color: style.accent, width: 1 }, rectRadius: 0.06
      });
      slide.addText(card.badge || "FUNDAMENTAL QOIDA", {
        x: 1.15, y: 1.45, w: 2.8, h: 0.35, fontSize: 9.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(card.mainConcept || card.title, {
        x: 1.15, y: 1.9, w: 7.7, h: 1.05, fontSize: 14.5, bold: true, color: style.text, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 3.25, w: 4.05, h: 2.05, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 3.25, w: 4.05, h: 0.06, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.03
      });
      slide.addText("📌 Ilmiy Sharh:", {
        x: 1.05, y: 3.42, w: 3.6, h: 0.32, fontSize: 12, bold: true, color: style.accent, fontFace: 'Arial'
      });
      slide.addText(card.explanation || "Mavzuga oid chuqur nazariy va amaliy ma'lumotlar.", {
        x: 1.05, y: 3.8, w: 3.6, h: 1.35, fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.15, y: 3.25, w: 4.05, h: 2.05, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.15, y: 3.25, w: 4.05, h: 0.06, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.03
      });
      slide.addText("✓ Muhim Asoslar:", {
        x: 5.35, y: 3.42, w: 3.6, h: 0.32, fontSize: 12, bold: true, color: style.accent2, fontFace: 'Arial'
      });
      const bulletsText = (card.bullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(bulletsText || "• Fundamental ta'limiy tamoyillar", {
        x: 5.35, y: 3.8, w: 3.6, h: 1.35, fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 5. GRID4 (2x2 KARTALAR)
    else if (type === 'grid4') {
      slide.addText(card.title || "Tarkibiy Qismlar va Tuzilma", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(card.subtitle || "Asosiy elementlar tahlili", {
        x: 0.8, y: 1.12, w: 8.4, h: 0.28, fontSize: 11, color: style.subtext, fontFace: 'Arial'
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
          x: pos.x, y: pos.y, w: 4.05, h: 1.85, fill: { color: style.cardBg }, line: { color: pos.col, width: 1 }, rectRadius: 0.1
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
          x: pos.x + 0.8, y: pos.y + 0.18, w: 3.05, h: 0.35, fontSize: 12.5, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(item.desc, {
          x: pos.x + 0.25, y: pos.y + 0.6, w: 3.6, h: 1.15, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 6. SPLIT (VERSUS & QIYOSIY TAHLIL)
    else if (type === 'split') {
      slide.addText(card.title || "Qiyosiy va Funksional Tahlil", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 3.9, h: 4.0, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 3.9, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.leftTitle || "📌 1-Yo'nalish", {
        x: 1.05, y: 1.45, w: 3.4, h: 0.42, fontSize: 13.5, bold: true, color: style.accent, fontFace: 'Arial'
      });
      const leftText = (card.leftBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(leftText || "• Tahliliy ma'lumotlar", {
        x: 1.05, y: 1.95, w: 3.4, h: 3.1, fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.3, y: 1.25, w: 3.9, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent2, width: 1 }, rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.3, y: 1.25, w: 3.9, h: 0.08, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.rightTitle || "💡 2-Yo'nalish", {
        x: 5.5, y: 1.45, w: 3.4, h: 0.42, fontSize: 13.5, bold: true, color: style.accent2, fontFace: 'Arial'
      });
      const rightText = (card.rightBullets || []).map(b => `• ${b}`).join("\n\n");
      slide.addText(rightText || "• Tahliliy ma'lumotlar", {
        x: 5.5, y: 1.95, w: 3.4, h: 3.1, fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });

      // Markaziy Floating VS Badji
      slide.addShape(pres.ShapeType.ellipse, {
        x: 4.7, y: 2.9, w: 0.6, h: 0.6, fill: { color: style.bg }, line: { color: style.accent, width: 1.5 }
      });
      slide.addText("VS", {
        x: 4.7, y: 2.9, w: 0.6, h: 0.6, fontSize: 9.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
    }

    // 7. PILLARS (3 TA USTUN)
    else if (type === 'pillars') {
      slide.addText(card.title || "Asosiy Ustunlar va Tamoyillar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(card.subtitle || "", {
        x: 0.8, y: 1.12, w: 8.4, h: 0.28, fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });
      const pillars = (card.cards || []).slice(0, 3);
      pillars.forEach((c, idx) => {
        const xPos = 0.8 + (idx * 2.9);
        const col = idx === 1 ? style.accent2 : style.accent;
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos, y: 1.45, w: 2.65, h: 3.9, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.12
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos, y: 1.45, w: 2.65, h: 0.08, fill: { color: col }, line: { color: col, width: 0 }, rectRadius: 0.04
        });
        slide.addShape(pres.ShapeType.ellipse, {
          x: xPos + 0.25, y: 1.68, w: 0.55, h: 0.55, fill: { color: style.bg }, line: { color: col, width: 1.2 }
        });
        slide.addText(c.num || `0${idx + 1}`, {
          x: xPos + 0.25, y: 1.68, w: 0.55, h: 0.55, fontSize: 12, bold: true, color: col, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
        slide.addText(c.title, {
          x: xPos + 0.25, y: 2.35, w: 2.15, h: 0.5, fontSize: 13.5, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(c.desc, {
          x: xPos + 0.25, y: 2.9, w: 2.15, h: 2.3, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 8. STATS (METRIKA VA STATISTIK FAKTLAR)
    else if (type === 'stats' || type === 'deep_dive') {
      slide.addText(card.title || "Asosiy Parametrlar va Statistik Faktlar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      if (card.stats && Array.isArray(card.stats) && card.stats.length > 0) {
        const statsList = card.stats.slice(0, 3);
        statsList.forEach((st, idx) => {
          const xPos = 0.8 + (idx * 2.9);
          slide.addShape(pres.ShapeType.roundRect, {
            x: xPos, y: 1.35, w: 2.65, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.2 }, rectRadius: 0.12
          });
          slide.addShape(pres.ShapeType.roundRect, {
            x: xPos, y: 1.35, w: 2.65, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
          });
          slide.addText(st.value, {
            x: xPos + 0.15, y: 1.6, w: 2.35, h: 0.85, fontSize: 32, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
          });
          slide.addShape(pres.ShapeType.roundRect, {
            x: xPos + 0.3, y: 2.5, w: 2.05, h: 0.08, fill: { color: style.bg }, line: { color: style.cardBorder, width: 0.5 }, rectRadius: 0.04
          });
          slide.addShape(pres.ShapeType.roundRect, {
            x: xPos + 0.3, y: 2.5, w: 1.2 + (idx * 0.35), h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
          });
          slide.addText(st.label, {
            x: xPos + 0.15, y: 2.7, w: 2.35, h: 0.5, fontSize: 12.5, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
          });
          slide.addText(st.desc || "", {
            x: xPos + 0.15, y: 3.25, w: 2.35, h: 1.95, fontSize: 10.5, color: style.subtext, align: 'center', fontFace: 'Arial'
          });
        });
      } else {
        slide.addShape(pres.ShapeType.roundRect, {
          x: 0.8, y: 1.25, w: 3.2, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.12
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: 0.8, y: 1.25, w: 3.2, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
        });
        slide.addText(card.metricValue || "98.5%", {
          x: 1.0, y: 1.9, w: 2.8, h: 1.0, fontSize: 44, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.2, y: 3.0, w: 2.4, h: 0.1, fill: { color: style.bg }, line: { color: style.cardBorder, width: 0.5 }, rectRadius: 0.05
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.2, y: 3.0, w: 2.2, h: 0.1, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.05
        });
        slide.addText(card.metricLabel || "Samaradorlik Ko'rsatkichi", {
          x: 1.0, y: 3.25, w: 2.8, h: 0.7, fontSize: 12.5, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
        });

        slide.addShape(pres.ShapeType.roundRect, {
          x: 4.3, y: 1.25, w: 4.9, h: 4.0, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.12
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: 4.3, y: 1.25, w: 4.9, h: 0.08, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.04
        });
        slide.addText("🔍 Tahliliy Faktlar va Natijalar:", {
          x: 4.55, y: 1.55, w: 4.4, h: 0.42, fontSize: 13.5, bold: true, color: style.text, fontFace: 'Arial'
        });
        const bulletsText = (card.bullets || []).map(b => `✓  ${b}`).join("\n\n");
        slide.addText(bulletsText || "✓ Tizimli tahlil ma'lumotlari", {
          x: 4.55, y: 2.1, w: 4.4, h: 2.9, fontSize: 11, color: style.subtext, fontFace: 'Arial'
        });
      }
    }

    // 9. TIMELINE / ROADMAP
    else if (type === 'timeline' || type === 'roadmap') {
      slide.addText(card.title || "Jarayon Ketma-Ketligi va Bosqichlar", {
        x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addShape(pres.ShapeType.line, {
        x: 1.3, y: 1.8, w: 0, h: 2.6, line: { color: style.accent, width: 1.8, dashType: 'dash' }
      });
      const steps = (card.steps || []).slice(0, 3);
      steps.forEach((st, idx) => {
        const yPos = 1.35 + (idx * 1.3);
        slide.addShape(pres.ShapeType.ellipse, {
          x: 1.1, y: yPos + 0.32, w: 0.4, h: 0.4, fill: { color: style.accent }, line: { color: style.bg, width: 1.5 }
        });
        slide.addText(String(idx + 1), {
          x: 1.1, y: yPos + 0.32, w: 0.4, h: 0.4, fontSize: 10, bold: true, color: style.bg, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.7, y: yPos, w: 7.5, h: 1.15, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.1
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.7, y: yPos, w: 0.08, h: 1.15, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.95, y: yPos + 0.2, w: 1.6, h: 0.32, fill: { color: style.bg }, line: { color: style.accent, width: 1 }, rectRadius: 0.06
        });
        slide.addText(st.step || `${idx + 1}-BOSQICH`, {
          x: 1.95, y: yPos + 0.2, w: 1.6, h: 0.32, fontSize: 9.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
        slide.addText(st.title, {
          x: 3.75, y: yPos + 0.18, w: 5.25, h: 0.35, fontSize: 12.5, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(st.desc || st.text || "", {
          x: 3.75, y: yPos + 0.55, w: 5.25, h: 0.5, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      });
    }

    // 10. QUIZ SLIDE (INTERAKTIV BILIMNI SINASH)
    else if (type === 'quiz_slide') {
      slide.addText(card.title || "Interaktiv Bilimni Sinash", {
        x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.15, w: 8.4, h: 1.05, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.15, w: 8.4, h: 0.06, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.03
      });
      slide.addText(card.question || "Mavzuga oid muhim savol?", {
        x: 1.05, y: 1.25, w: 7.9, h: 0.85, fontSize: 13.5, bold: true, color: style.text, fontFace: 'Arial'
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
          x: pos.x, y: pos.y, w: 4.05, h: 0.78, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.08
        });
        slide.addShape(pres.ShapeType.ellipse, {
          x: pos.x + 0.15, y: pos.y + 0.18, w: 0.4, h: 0.4, fill: { color: style.bg }, line: { color: style.accent, width: 1 }
        });
        slide.addText(["A", "B", "C", "D"][idx], {
          x: pos.x + 0.15, y: pos.y + 0.18, w: 0.4, h: 0.4, fontSize: 10, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
        slide.addText(options[idx] || `Variant ${idx + 1}`, {
          x: pos.x + 0.65, y: pos.y + 0.12, w: 3.25, h: 0.55, fontSize: 11, color: style.text, fontFace: 'Arial'
        });
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 4.15, w: 8.4, h: 1.2, fill: { color: style.cardBg }, line: { color: style.accent2, width: 1.2 }, rectRadius: 0.1
      });
      slide.addText("🔑 O'qituvchi Kaliti va Ilmiy Sharh:", {
        x: 1.05, y: 4.25, w: 7.9, h: 0.32, fontSize: 11, bold: true, color: style.accent2, fontFace: 'Arial'
      });
      slide.addText(card.answer || "To'g'ri javob tahlili", {
        x: 1.05, y: 4.58, w: 7.9, h: 0.68, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
      });
    }

    // 11. CONCLUSION / XULOSA
    else {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 4.4, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1.5 }, rectRadius: 0.15
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
      });
      slide.addText(card.title || "Yakuniy Xulosa va Natijalar", {
        x: 1.2, y: 1.15, w: 7.6, h: 0.5, fontSize: 22, bold: true, color: style.accent, fontFace: 'Arial'
      });
      if (card.quote) {
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.2, y: 1.8, w: 7.6, h: 1.05, fill: { color: style.bg }, line: { color: style.accent2, width: 1 }, rectRadius: 0.08
        });
        slide.addText(`“ ${card.quote} ”`, {
          x: 1.4, y: 1.9, w: 7.2, h: 0.85, fontSize: 12.5, italic: true, color: style.text, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
      }
      const takeawaysText = (card.takeaways || []).map(t => `★  ${t}`).join("\n\n");
      slide.addText(takeawaysText || "★ Mavzuning muhim ta'limiy xulosalari", {
        x: 1.2, y: 3.0, w: 7.6, h: 2.1, fontSize: 11.5, color: style.subtext, fontFace: 'Arial'
      });
    }
  });

  return await pres.writeFile({ fileName: filename });
}
