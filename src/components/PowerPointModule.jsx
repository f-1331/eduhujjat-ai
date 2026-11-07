import React, { useState, useEffect } from 'react';
import { 
  GAMMA_THEMES, 
  generatePresentationPptx 
} from '../utils/powerpointGenerator';
import { generateRealAIGammaCards } from '../utils/aiSlideEngine';
import { 
  Presentation, 
  Sparkles, 
  Download, 
  Palette, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Check, 
  RotateCcw, 
  Volume2, 
  Plus, 
  Trash2, 
  Layout, 
  MoveLeft, 
  MoveRight,
  FileText,
  Wand2,
  CheckCircle2
} from 'lucide-react';

export default function PowerPointModule() {
  const [promptInput, setPromptInput] = useState("Amir Temur davlati va Movarounnahr yuksalishi");
  const [themeKey, setThemeKey] = useState("obsidian");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [cards, setCards] = useState(() => generateRealAIGammaCards("Amir Temur davlati va Movarounnahr yuksalishi"));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  // Tahrirlash rejimi (In-place edit mode)
  const [isEditingMode, setIsEditingMode] = useState(false);

  const activeTheme = GAMMA_THEMES[themeKey] || GAMMA_THEMES.obsidian;
  const currentCard = cards[activeSlideIndex] || cards[0];

  // Haqiqiy AI Generatsiya: kiritilgan mavzu bo'yicha slaydlarni noldan noyob yaratish
  const handleGenerateRealSlides = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);

    let generated = null;
    try {
      const apiEndpoint = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/gemini' : '/api/gemini';
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cards', prompt: promptInput.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result && Array.isArray(data.result) && data.result.length > 0) {
          generated = data.result;
        }
      }
    } catch(e) {
      console.warn("Backend API unavailable for cards, using local generator:", e);
    }

    if (!generated || !Array.isArray(generated) || generated.length === 0) {
      generated = generateRealAIGammaCards(promptInput.trim());
    }

    setCards(generated);
    setActiveSlideIndex(0);
    setIsGenerating(false);
  };

  // PowerPoint (.pptx) yuklab olish
  const handleExportPptx = async () => {
    setIsGenerating(true);
    try {
      const cleanName = (currentCard?.title || promptInput || 'Taqdimot')
        .slice(0, 30)
        .replace(/[^a-zA-Z0-9А-Яа-яЎўҒғҚқҲҳ]/g, '_');

      await generatePresentationPptx({
        topic: promptInput,
        styleName: themeKey,
        cards,
        filename: `${cleanName}_Gamma_AI.pptx`
      });
    } catch (err) {
      console.error(err);
      alert("Taqdimotni eksport qilishda xatolik yuz berdi!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Klaviaturada strelkalar orqali slaydni boshqarish
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullscreen) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setActiveSlideIndex((prev) => Math.min(prev + 1, cards.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, cards.length]);

  // Joriy kartani tahrirlash funksiyalari
  const updateCurrentCard = (fields) => {
    setCards(prev => prev.map((c, i) => i === activeSlideIndex ? { ...c, ...fields } : c));
  };

  // Yangi slayd qo'shish
  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now(),
      type: "split",
      badge: "YANGI BO'LIM",
      title: "Yangi Slayd Mavzusi",
      leftTitle: "📌 Asosiy Tushuncha",
      leftBullets: ["Birinchi muhim fakt yoki ta'rif", "Ikkinchi tahliliy ma'lumot"],
      rightTitle: "💡 Amaliy Yondashuv",
      rightBullets: ["Amaliyotdagi natijalar", "Kelgusi rejalar"],
      speakerNotes: "Ushbu slaydda yangi mavzu yoritiladi."
    };
    const newCards = [...cards];
    newCards.splice(activeSlideIndex + 1, 0, newSlide);
    setCards(newCards);
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  // Slaydni o'chirish
  const handleDeleteSlide = (indexToDelete) => {
    if (cards.length <= 1) {
      alert("Taqdimotda kamida 1 ta slayd qolishi kerak!");
      return;
    }
    const filtered = cards.filter((_, i) => i !== indexToDelete);
    setCards(filtered);
    setActiveSlideIndex(Math.max(0, indexToDelete - 1));
  };

  // Slayd tartibini siljitish
  const handleMoveSlide = (direction) => {
    const targetIdx = direction === 'left' ? activeSlideIndex - 1 : activeSlideIndex + 1;
    if (targetIdx < 0 || targetIdx >= cards.length) return;
    const reordered = [...cards];
    const temp = reordered[activeSlideIndex];
    reordered[activeSlideIndex] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setCards(reordered);
    setActiveSlideIndex(targetIdx);
  };

  // Slayd tuzilish turini (layout) almashtirish
  const handleChangeLayout = (newType) => {
    updateCurrentCard({ type: newType });
  };

  return (
    <div className="space-y-6">
      {/* 1. GAMMA & GENSPARK AI PROMPT BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950">
                  Gamma & Genspark Real AI
                </span>
                <span className="text-xs text-sky-300 font-mono">Haqiqiy Mazmun Generatori</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <Presentation className="w-7 h-7 text-sky-400" />
                AI Taqdimot Generator Studiyasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Ixtiyoriy mavzu, dars konspekti yoki referat matnini kiriting. Har bir slayd shablon emas, aynan shu mavzuga xos <b>haqiqiy faktlar, formulalar va tahlillar</b> bilan yaratiladi!
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsFullscreen(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                Namoyish (Gamma Mode)
              </button>
              <button
                onClick={handleExportPptx}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Sparkles className="w-4 h-4 animate-spin text-slate-950" /> : <Download className="w-4 h-4 text-slate-950" />}
                {isGenerating ? "Yuklanmoqda..." : "PPTX Yuklab Olish"}
              </button>
            </div>
          </div>

          {/* Prompt kiritish va Generatsiya qilish maydoni */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                rows={2}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Mavzuni yozing yoki matn tashlang (Masalan: Amir Temur davlati, Fotosintez va kimyoviy reaksiyalar, Python algoritmlari, Pifagor teoremasi...)"
                className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none font-medium"
              />
              <button
                onClick={handleGenerateRealSlides}
                disabled={isGenerating || !promptInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isGenerating ? <Sparkles className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {isGenerating ? "AI Yaratmoqda..." : "Haqiqiy Slayd Yaratish"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ASOSIY GAMMA STUDIYASI VA KANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHAP PANEL: TEMALAR VA BOSHQARUV (3 ustun) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Rang mavzusi */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-500" />
              Gamma Rang Mavzulari:
            </label>
            <div className="space-y-1.5">
              {Object.values(GAMMA_THEMES).map((th) => (
                <button
                  key={th.id}
                  onClick={() => setThemeKey(th.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    themeKey === th.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-5 h-5 rounded-md border border-white/20 shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: `#${th.bg}` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `#${th.accent}` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {th.name.split('(')[0].trim()}
                    </span>
                  </div>
                  {themeKey === th.id && <Check className="w-3.5 h-3.5 text-sky-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Slayd turi va Layout tanlash */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-sky-500" />
              Slayd Qolipi (Layout):
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { type: 'hero', label: 'Titul (Hero)' },
                { type: 'concept', label: 'Ta\'rif / Qoida' },
                { type: 'grid4', label: '2x2 Kartalar' },
                { type: 'split', label: '2 Ustun' },
                { type: 'pillars', label: '3 Ustun' },
                { type: 'stats', label: 'Raqamlar / Metrika' },
                { type: 'timeline', label: 'Ketma-ketlik' },
                { type: 'quiz_slide', label: 'Interaktiv Savol' },
                { type: 'summary', label: 'Xulosa' }
              ].map((ly) => (
                <button
                  key={ly.type}
                  onClick={() => handleChangeLayout(ly.type)}
                  className={`px-2.5 py-1.5 text-xs rounded-xl border font-medium transition ${
                    currentCard?.type === ly.type
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {ly.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slayd amallari */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
            <button
              onClick={handleAddSlide}
              className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + Yangi Slayd Qo'shish
            </button>
            <button
              onClick={() => handleDeleteSlide(activeSlideIndex)}
              className="w-full py-2 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Ushbu Slaydni O'chirish
            </button>
          </div>
        </div>

        {/* O'NG PANEL: INTERAKTIV SLAYD KANVASI VA MATN TAHRIRLASH (9 ustun) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Slaydlar tanlagichi (Deck Tabs) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1">
              {cards.map((c, idx) => (
                <button
                  key={c.id || idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    activeSlideIndex === idx
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-[10px] opacity-75">{idx + 1}.</span>
                  <span className="truncate max-w-[120px]">{c.title || `Slayd ${idx + 1}`}</span>
                </button>
              ))}
            </div>

            {/* Slayd siljitish va navigatsiya */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleMoveSlide('left')}
                disabled={activeSlideIndex === 0}
                title="Slaydni chapga surish"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              >
                <MoveLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleMoveSlide('right')}
                disabled={activeSlideIndex === cards.length - 1}
                title="Slaydni o'ngga surish"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              >
                <MoveRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold px-1.5 text-slate-600 dark:text-slate-400">
                {activeSlideIndex + 1}/{cards.length}
              </span>
            </div>
          </div>

          {/* HAQIQIY GAMMA SLAYD DISPLAY (Widescreen 16:9 Canvas) */}
          <div 
            className="w-full aspect-video rounded-3xl p-6 sm:p-10 shadow-2xl relative flex flex-col justify-between border transition-all duration-300 overflow-hidden"
            style={{ 
              backgroundColor: `#${activeTheme.bg}`,
              borderColor: `#${activeTheme.cardBorder}`
            }}
          >
            {/* Ambient Background Glowing Orbs (Gamma / Genspark Mesh Effect) */}
            <div 
              className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ backgroundColor: `#${activeTheme.accent}` }}
            />
            <div 
              className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: `#${activeTheme.accent2}` }}
            />
            {/* Subtle Tech Dot Matrix Grid */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />
            {/* Top Bar Indicator (No author clutter) */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider opacity-70" style={{ color: `#${activeTheme.subtext}` }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `#${activeTheme.accent}` }} />
                <span>GAMMA ENGINE  •  SLAYD {activeSlideIndex + 1}/{cards.length}</span>
              </div>
              <span className="uppercase">{currentCard.badge || "AI SLAYD"}</span>
            </div>

            {/* SLAYD KONTENTI: INTERAKTIV TAHRIRLANADIGAN BLOKLAR */}
            <div className="my-auto py-2">
              {/* 1. HERO SLAYDI */}
              {currentCard.type === 'hero' && (
                <div 
                  className="p-6 sm:p-8 rounded-2xl border space-y-4 shadow-xl"
                  style={{ 
                    backgroundColor: `#${activeTheme.cardBg}`,
                    borderColor: `#${activeTheme.cardBorder}`
                  }}
                >
                  <input
                    type="text"
                    value={currentCard.badge || ''}
                    onChange={(e) => updateCurrentCard({ badge: e.target.value })}
                    className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-400"
                    style={{ 
                      color: `#${activeTheme.accent}`, 
                      borderColor: `#${activeTheme.accent}`
                    }}
                  />
                  <textarea
                    rows={2}
                    value={currentCard.title || ''}
                    onChange={(e) => updateCurrentCard({ title: e.target.value })}
                    className="w-full bg-transparent text-2xl sm:text-4xl font-extrabold tracking-tight focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg resize-none"
                    style={{ color: `#${activeTheme.text}` }}
                  />
                  <textarea
                    rows={2}
                    value={currentCard.subtitle || ''}
                    onChange={(e) => updateCurrentCard({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg resize-none"
                    style={{ color: `#${activeTheme.subtext}` }}
                  />
                </div>
              )}

              {/* CONCEPT SLAYDI */}
              {currentCard.type === 'concept' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={currentCard.title || ''}
                    onChange={(e) => updateCurrentCard({ title: e.target.value })}
                    className="w-full bg-transparent text-xl sm:text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg"
                    style={{ color: `#${activeTheme.text}` }}
                  />
                  <div 
                    className="p-5 rounded-2xl border space-y-2 shadow-lg"
                    style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent}` }}
                  >
                    <input
                      type="text"
                      value={currentCard.badge || "FUNDAMENTAL QOIDA"}
                      onChange={(e) => updateCurrentCard({ badge: e.target.value })}
                      className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-400"
                      style={{ color: `#${activeTheme.accent}`, borderColor: `#${activeTheme.accent}` }}
                    />
                    <textarea
                      rows={2}
                      value={currentCard.mainConcept || ''}
                      onChange={(e) => updateCurrentCard({ mainConcept: e.target.value })}
                      className="w-full bg-transparent text-sm sm:text-base font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded resize-none"
                      style={{ color: `#${activeTheme.text}` }}
                      placeholder="Asosiy ta'rif yoki qoida..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      className="p-4 rounded-xl border space-y-2 shadow"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                    >
                      <h4 className="text-xs font-bold" style={{ color: `#${activeTheme.accent}` }}>📌 Ilmiy Sharh:</h4>
                      <textarea
                        rows={3}
                        value={currentCard.explanation || ''}
                        onChange={(e) => updateCurrentCard({ explanation: e.target.value })}
                        className="w-full bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 rounded resize-none"
                        style={{ color: `#${activeTheme.subtext}` }}
                      />
                    </div>
                    <div 
                      className="p-4 rounded-xl border space-y-2 shadow"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                    >
                      <h4 className="text-xs font-bold" style={{ color: `#${activeTheme.accent2}` }}>✓ Muhim Asoslar:</h4>
                      <div className="space-y-1">
                        {(currentCard.bullets || []).map((b, i) => (
                          <input
                            key={i}
                            type="text"
                            value={b}
                            onChange={(e) => {
                              const newB = [...(currentCard.bullets || [])];
                              newB[i] = e.target.value;
                              updateCurrentCard({ bullets: newB });
                            }}
                            className="w-full bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                            style={{ color: `#${activeTheme.subtext}` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GRID4 SLAYDI (2x2 KARTALAR) */}
              {currentCard.type === 'grid4' && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={currentCard.title || ''}
                      onChange={(e) => updateCurrentCard({ title: e.target.value })}
                      className="w-full bg-transparent text-xl sm:text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg"
                      style={{ color: `#${activeTheme.text}` }}
                    />
                    <input
                      type="text"
                      value={currentCard.subtitle || ''}
                      onChange={(e) => updateCurrentCard({ subtitle: e.target.value })}
                      className="w-full bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 rounded mt-1"
                      style={{ color: `#${activeTheme.subtext}` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(currentCard.items || []).slice(0, 4).map((it, i) => (
                      <div 
                        key={i}
                        className="p-3.5 rounded-xl border space-y-1.5 shadow"
                        style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: i % 2 === 0 ? `#${activeTheme.accent}` : `#${activeTheme.accent2}` }}
                      >
                        <input
                          type="text"
                          value={it.title || ''}
                          onChange={(e) => {
                            const newItems = [...(currentCard.items || [])];
                            newItems[i] = { ...newItems[i], title: e.target.value };
                            updateCurrentCard({ items: newItems });
                          }}
                          className="w-full bg-transparent text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                          style={{ color: `#${activeTheme.text}` }}
                        />
                        <textarea
                          rows={2}
                          value={it.desc || ''}
                          onChange={(e) => {
                            const newItems = [...(currentCard.items || [])];
                            newItems[i] = { ...newItems[i], desc: e.target.value };
                            updateCurrentCard({ items: newItems });
                          }}
                          className="w-full bg-transparent text-[11px] focus:outline-none focus:ring-1 focus:ring-sky-400 rounded resize-none"
                          style={{ color: `#${activeTheme.subtext}` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. SPLIT COMPARISON (2 USTUN) */}
              {currentCard.type === 'split' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={currentCard.title || ''}
                    onChange={(e) => updateCurrentCard({ title: e.target.value })}
                    className="w-full bg-transparent text-xl sm:text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg"
                    style={{ color: `#${activeTheme.text}` }}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Chap Ustun */}
                    <div 
                      className="p-5 rounded-2xl border space-y-2.5 shadow"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                    >
                      <input
                        type="text"
                        value={currentCard.leftTitle || ''}
                        onChange={(e) => updateCurrentCard({ leftTitle: e.target.value })}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                        style={{ color: `#${activeTheme.accent}` }}
                      />
                      <div className="space-y-1.5">
                        {(currentCard.leftBullets || []).map((b, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] sm:text-xs" style={{ color: `#${activeTheme.subtext}` }}>
                            <span>•</span>
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => {
                                const newBullets = [...(currentCard.leftBullets || [])];
                                newBullets[i] = e.target.value;
                                updateCurrentCard({ leftBullets: newBullets });
                              }}
                              className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* O'ng Ustun */}
                    <div 
                      className="p-5 rounded-2xl border space-y-2.5 shadow"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent2}` }}
                    >
                      <input
                        type="text"
                        value={currentCard.rightTitle || ''}
                        onChange={(e) => updateCurrentCard({ rightTitle: e.target.value })}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                        style={{ color: `#${activeTheme.accent2}` }}
                      />
                      <div className="space-y-1.5">
                        {(currentCard.rightBullets || []).map((b, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] sm:text-xs" style={{ color: `#${activeTheme.subtext}` }}>
                            <span>•</span>
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => {
                                const newBullets = [...(currentCard.rightBullets || [])];
                                newBullets[i] = e.target.value;
                                updateCurrentCard({ rightBullets: newBullets });
                              }}
                              className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 3 TA USTUN (PILLARS GRID) */}
              {currentCard.type === 'pillars' && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={currentCard.title || ''}
                      onChange={(e) => updateCurrentCard({ title: e.target.value })}
                      className="w-full bg-transparent text-xl sm:text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg"
                      style={{ color: `#${activeTheme.text}` }}
                    />
                    <input
                      type="text"
                      value={currentCard.subtitle || ''}
                      onChange={(e) => updateCurrentCard({ subtitle: e.target.value })}
                      className="w-full bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 rounded mt-1"
                      style={{ color: `#${activeTheme.subtext}` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(currentCard.cards || []).map((c, i) => (
                      <div 
                        key={i}
                        className="p-4 rounded-2xl border space-y-2 shadow"
                        style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                      >
                        <input
                          type="text"
                          value={c.num || `0${i + 1}`}
                          onChange={(e) => {
                            const newCols = [...(currentCard.cards || [])];
                            newCols[i] = { ...newCols[i], num: e.target.value };
                            updateCurrentCard({ cards: newCols });
                          }}
                          className="w-full bg-transparent text-xl font-black focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                          style={{ color: `#${activeTheme.accent}` }}
                        />
                        <input
                          type="text"
                          value={c.title || ''}
                          onChange={(e) => {
                            const newCols = [...(currentCard.cards || [])];
                            newCols[i] = { ...newCols[i], title: e.target.value };
                            updateCurrentCard({ cards: newCols });
                          }}
                          className="w-full bg-transparent text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                          style={{ color: `#${activeTheme.text}` }}
                        />
                        <textarea
                          rows={4}
                          value={c.desc || ''}
                          onChange={(e) => {
                            const newCols = [...(currentCard.cards || [])];
                            newCols[i] = { ...newCols[i], desc: e.target.value };
                            updateCurrentCard({ cards: newCols });
                          }}
                          className="w-full bg-transparent text-[11px] focus:outline-none focus:ring-1 focus:ring-sky-400 rounded resize-none"
                          style={{ color: `#${activeTheme.subtext}` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. CHUQUR TAHLIL VA METRIKA / STATS */}
              {(currentCard.type === 'deep_dive' || currentCard.type === 'stats') && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={currentCard.title || ''}
                    onChange={(e) => updateCurrentCard({ title: e.target.value })}
                    className="w-full bg-transparent text-xl sm:text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg"
                    style={{ color: `#${activeTheme.text}` }}
                  />
                  {currentCard.stats && Array.isArray(currentCard.stats) && currentCard.stats.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentCard.stats.slice(0, 3).map((st, i) => (
                        <div 
                          key={i}
                          className="p-4 rounded-2xl border text-center space-y-1 shadow"
                          style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent}` }}
                        >
                          <input
                            type="text"
                            value={st.value || ''}
                            onChange={(e) => {
                              const newSt = [...currentCard.stats];
                              newSt[i] = { ...newSt[i], value: e.target.value };
                              updateCurrentCard({ stats: newSt });
                            }}
                            className="w-full text-center bg-transparent text-2xl font-black focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                            style={{ color: `#${activeTheme.accent}` }}
                          />
                          <input
                            type="text"
                            value={st.label || ''}
                            onChange={(e) => {
                              const newSt = [...currentCard.stats];
                              newSt[i] = { ...newSt[i], label: e.target.value };
                              updateCurrentCard({ stats: newSt });
                            }}
                            className="w-full text-center bg-transparent text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                            style={{ color: `#${activeTheme.text}` }}
                          />
                          <textarea
                            rows={2}
                            value={st.desc || ''}
                            onChange={(e) => {
                              const newSt = [...currentCard.stats];
                              newSt[i] = { ...newSt[i], desc: e.target.value };
                              updateCurrentCard({ stats: newSt });
                            }}
                            className="w-full text-center bg-transparent text-[10px] focus:outline-none focus:ring-1 focus:ring-sky-400 rounded resize-none"
                            style={{ color: `#${activeTheme.subtext}` }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div 
                        className="sm:col-span-4 p-5 rounded-2xl border text-center flex flex-col items-center justify-center shadow"
                        style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent}` }}
                      >
                        <input
                          type="text"
                          value={currentCard.metricValue || ''}
                          onChange={(e) => updateCurrentCard({ metricValue: e.target.value })}
                          className="w-full text-center bg-transparent text-3xl sm:text-5xl font-black focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                          style={{ color: `#${activeTheme.accent}` }}
                        />
                        <input
                          type="text"
                          value={currentCard.metricLabel || ''}
                          onChange={(e) => updateCurrentCard({ metricLabel: e.target.value })}
                          className="w-full text-center bg-transparent text-xs font-bold mt-2 focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                          style={{ color: `#${activeTheme.text}` }}
                        />
                      </div>

                      <div 
                        className="sm:col-span-8 p-5 rounded-2xl border space-y-2 shadow"
                        style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                      >
                        <h4 className="text-xs sm:text-sm font-bold" style={{ color: `#${activeTheme.text}` }}>
                          🔍 Tahliliy Faktlar va Natijalar:
                        </h4>
                        <div className="space-y-1.5 text-[11px] sm:text-xs" style={{ color: `#${activeTheme.subtext}` }}>
                          {(currentCard.bullets || []).map((b, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span style={{ color: `#${activeTheme.accent}` }}>✓</span>
                              <input
                                type="text"
                                value={b}
                                onChange={(e) => {
                                  const newBullets = [...(currentCard.bullets || [])];
                                  newBullets[i] = e.target.value;
                                  updateCurrentCard({ bullets: newBullets });
                                }}
                                className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. ROADMAP / TIMELINE */}
              {(currentCard.type === 'roadmap' || currentCard.type === 'timeline') && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={currentCard.title || ''}
                    onChange={(e) => updateCurrentCard({ title: e.target.value })}
                    className="w-full bg-transparent text-xl sm:text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg"
                    style={{ color: `#${activeTheme.text}` }}
                  />
                  <div className="space-y-2">
                    {(currentCard.steps || []).map((st, i) => (
                      <div 
                        key={i}
                        className="p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow"
                        style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                      >
                        <input
                          type="text"
                          value={st.step || `${i + 1}-BOSQICH`}
                          onChange={(e) => {
                            const newSteps = [...(currentCard.steps || [])];
                            newSteps[i] = { ...newSteps[i], step: e.target.value };
                            updateCurrentCard({ steps: newSteps });
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-black uppercase border bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-400"
                          style={{ color: `#${activeTheme.accent}`, borderColor: `#${activeTheme.accent}` }}
                        />
                        <div className="flex-1 w-full space-y-1">
                          <input
                            type="text"
                            value={st.title || ''}
                            onChange={(e) => {
                              const newSteps = [...(currentCard.steps || [])];
                              newSteps[i] = { ...newSteps[i], title: e.target.value };
                              updateCurrentCard({ steps: newSteps });
                            }}
                            className="w-full bg-transparent text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                            style={{ color: `#${activeTheme.text}` }}
                          />
                          <input
                            type="text"
                            value={st.desc || st.text || ''}
                            onChange={(e) => {
                              const newSteps = [...(currentCard.steps || [])];
                              newSteps[i] = { ...newSteps[i], desc: e.target.value, text: e.target.value };
                              updateCurrentCard({ steps: newSteps });
                            }}
                            className="w-full bg-transparent text-[11px] focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                            style={{ color: `#${activeTheme.subtext}` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QUIZ SLIDE (INTERAKTIV BILIMNI SINASH) */}
              {currentCard.type === 'quiz_slide' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={currentCard.title || ''}
                    onChange={(e) => updateCurrentCard({ title: e.target.value })}
                    className="w-full bg-transparent text-xl sm:text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg"
                    style={{ color: `#${activeTheme.text}` }}
                  />
                  <div 
                    className="p-4 rounded-2xl border space-y-2 shadow-lg"
                    style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent}` }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `#${activeTheme.accent}` }}>
                      ❓ Interaktiv Savol
                    </span>
                    <textarea
                      rows={2}
                      value={currentCard.question || ''}
                      onChange={(e) => updateCurrentCard({ question: e.target.value })}
                      className="w-full bg-transparent text-sm font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded resize-none"
                      style={{ color: `#${activeTheme.text}` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(currentCard.options || []).slice(0, 4).map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(currentCard.options || [])];
                          newOpts[i] = e.target.value;
                          updateCurrentCard({ options: newOpts });
                        }}
                        className="p-2.5 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-400"
                        style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}`, color: `#${activeTheme.text}` }}
                      />
                    ))}
                  </div>
                  <div 
                    className="p-3.5 rounded-xl border space-y-1 shadow"
                    style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent2}` }}
                  >
                    <span className="text-[10px] font-bold uppercase" style={{ color: `#${activeTheme.accent2}` }}>
                      🔑 Javob Kaliti va Sharh
                    </span>
                    <textarea
                      rows={2}
                      value={currentCard.answer || ''}
                      onChange={(e) => updateCurrentCard({ answer: e.target.value })}
                      className="w-full bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 rounded resize-none"
                      style={{ color: `#${activeTheme.subtext}` }}
                    />
                  </div>
                </div>
              )}

              {/* 6. SUMMARY / CONCLUSION */}
              {(currentCard.type === 'summary' || currentCard.type === 'conclusion') && (
                <div 
                  className="p-6 sm:p-8 rounded-2xl border space-y-4 shadow-xl"
                  style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                >
                  <input
                    type="text"
                    value={currentCard.title || ''}
                    onChange={(e) => updateCurrentCard({ title: e.target.value })}
                    className="w-full bg-transparent text-xl sm:text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg"
                    style={{ color: `#${activeTheme.accent}` }}
                  />
                  {currentCard.quote && (
                    <textarea
                      rows={2}
                      value={currentCard.quote}
                      onChange={(e) => updateCurrentCard({ quote: e.target.value })}
                      className="w-full p-3.5 rounded-xl border italic text-xs sm:text-sm text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none"
                      style={{ 
                        borderColor: `#${activeTheme.accent2}`,
                        color: `#${activeTheme.text}`
                      }}
                    />
                  )}
                  <div className="space-y-1.5 text-xs" style={{ color: `#${activeTheme.subtext}` }}>
                    {(currentCard.takeaways || []).map((tk, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span style={{ color: `#${activeTheme.accent}` }}>★</span>
                        <input
                          type="text"
                          value={tk}
                          onChange={(e) => {
                            const newTakeaways = [...(currentCard.takeaways || [])];
                            newTakeaways[i] = e.target.value;
                            updateCurrentCard({ takeaways: newTakeaways });
                          }}
                          className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer (Clean indicator) */}
            <div 
              className="flex items-center justify-between text-[10px] opacity-60 border-t pt-2"
              style={{ borderColor: `#${activeTheme.cardBorder}`, color: `#${activeTheme.subtext}` }}
            >
              <span>16:9 Widescreen Presentation</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Matnlarni to'g'ridan-to'g'ri bosib tahrirlashingiz mumkin
              </span>
            </div>
          </div>

          {/* Ma'ruzachi Nutqi (Speaker Notes) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                Ma'ruzachi Nutqi (Taqdimotchi aytadigan gaplar):
              </div>
              <button 
                onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                className="text-xs text-sky-500 hover:underline font-semibold"
              >
                {showSpeakerNotes ? "Yashirish" : "Ko'rsatish"}
              </button>
            </div>

            {showSpeakerNotes && (
              <textarea
                rows={2}
                value={currentCard.speakerNotes || ''}
                onChange={(e) => updateCurrentCard({ speakerNotes: e.target.value })}
                className="w-full text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. JONLI FULLSCREEN PRESENTATION REJIMI */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200 overflow-hidden"
          style={{ backgroundColor: `#${activeTheme.bg}`, color: `#${activeTheme.text}` }}
        >
          {/* Ambient Background Glowing Orbs (Gamma / Genspark Mesh Effect) */}
          <div 
            className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ backgroundColor: `#${activeTheme.accent}` }}
          />
          <div 
            className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: `#${activeTheme.accent2}` }}
          />
          {/* Subtle Tech Dot Matrix Grid */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}
          />
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `#${activeTheme.cardBorder}` }}>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: `#${activeTheme.accent}` }} />
              <span className="text-sm font-black tracking-wider uppercase" style={{ color: `#${activeTheme.accent}` }}>
                GAMMA FULLSCREEN PRESENTATION
              </span>
              <span className="text-xs opacity-60">|  Strelkalar (◀ ▶) orqali boshqaring</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold" style={{ color: `#${activeTheme.accent}` }}>
                {activeSlideIndex + 1} / {cards.length}
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 transition"
              >
                Chiqish (Esc)
              </button>
            </div>
          </div>

          {/* Slayd markazi */}
          <div className="max-w-5xl mx-auto w-full my-auto">
            {/* HERO */}
            {currentCard.type === 'hero' && (
              <div 
                className="p-10 rounded-3xl border space-y-6 shadow-2xl"
                style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
              >
                <span 
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border"
                  style={{ color: `#${activeTheme.accent}`, borderColor: `#${activeTheme.accent}`, backgroundColor: `#${activeTheme.bg}` }}
                >
                  {currentCard.badge || "GAMMA AI TAQDIMOT"}
                </span>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight" style={{ color: `#${activeTheme.text}` }}>
                  {currentCard.title}
                </h1>
                <p className="text-base sm:text-xl opacity-80" style={{ color: `#${activeTheme.subtext}` }}>
                  {currentCard.subtitle}
                </p>
              </div>
            )}

            {/* CONCEPT */}
            {currentCard.type === 'concept' && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: `#${activeTheme.text}` }}>
                  {currentCard.title}
                </h2>
                <div 
                  className="p-8 rounded-3xl border space-y-4 shadow-2xl"
                  style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent}` }}
                >
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border"
                    style={{ color: `#${activeTheme.accent}`, borderColor: `#${activeTheme.accent}`, backgroundColor: `#${activeTheme.bg}` }}
                  >
                    {currentCard.badge || "FUNDAMENTAL QOIDA"}
                  </span>
                  <p className="text-xl sm:text-2xl font-bold leading-relaxed" style={{ color: `#${activeTheme.text}` }}>
                    {currentCard.mainConcept}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div 
                    className="p-6 rounded-2xl border space-y-3"
                    style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                  >
                    <h4 className="text-base font-bold" style={{ color: `#${activeTheme.accent}` }}>
                      📌 Ilmiy Sharh:
                    </h4>
                    <p className="text-sm opacity-90 leading-relaxed" style={{ color: `#${activeTheme.subtext}` }}>
                      {currentCard.explanation}
                    </p>
                  </div>
                  <div 
                    className="p-6 rounded-2xl border space-y-3"
                    style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                  >
                    <h4 className="text-base font-bold" style={{ color: `#${activeTheme.accent2}` }}>
                      ✓ Asosiy Qoidalar:
                    </h4>
                    <ul className="text-sm space-y-2 list-disc list-inside opacity-90" style={{ color: `#${activeTheme.subtext}` }}>
                      {(currentCard.bullets || []).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* GRID4 */}
            {currentCard.type === 'grid4' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: `#${activeTheme.text}` }}>
                    {currentCard.title}
                  </h2>
                  {currentCard.subtitle && (
                    <p className="text-sm opacity-80 mt-1" style={{ color: `#${activeTheme.subtext}` }}>
                      {currentCard.subtitle}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {(currentCard.items || []).slice(0, 4).map((it, i) => (
                    <div 
                      key={i}
                      className="p-6 rounded-2xl border space-y-2 shadow-lg"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: i % 2 === 0 ? `#${activeTheme.accent}` : `#${activeTheme.accent2}` }}
                    >
                      <h4 className="text-base font-bold" style={{ color: `#${activeTheme.text}` }}>
                        {it.title}
                      </h4>
                      <p className="text-xs sm:text-sm opacity-85 leading-relaxed" style={{ color: `#${activeTheme.subtext}` }}>
                        {it.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SPLIT */}
            {currentCard.type === 'split' && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: `#${activeTheme.text}` }}>
                  {currentCard.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div 
                    className="p-8 rounded-3xl border space-y-4"
                    style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                  >
                    <h4 className="text-lg font-bold" style={{ color: `#${activeTheme.accent}` }}>
                      {currentCard.leftTitle}
                    </h4>
                    <ul className="text-sm space-y-2 list-disc list-inside opacity-90" style={{ color: `#${activeTheme.subtext}` }}>
                      {(currentCard.leftBullets || []).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div 
                    className="p-8 rounded-3xl border space-y-4"
                    style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent2}` }}
                  >
                    <h4 className="text-lg font-bold" style={{ color: `#${activeTheme.accent2}` }}>
                      {currentCard.rightTitle}
                    </h4>
                    <ul className="text-sm space-y-2 list-disc list-inside opacity-90" style={{ color: `#${activeTheme.subtext}` }}>
                      {(currentCard.rightBullets || []).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* PILLARS */}
            {currentCard.type === 'pillars' && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: `#${activeTheme.text}` }}>
                  {currentCard.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {(currentCard.cards || []).map((c, i) => (
                    <div 
                      key={i}
                      className="p-8 rounded-3xl border space-y-4"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                    >
                      <span className="text-4xl font-black" style={{ color: `#${activeTheme.accent}` }}>
                        {c.num}
                      </span>
                      <h4 className="text-lg font-bold" style={{ color: `#${activeTheme.text}` }}>
                        {c.title}
                      </h4>
                      <p className="text-sm opacity-80" style={{ color: `#${activeTheme.subtext}` }}>
                        {c.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DEEP DIVE / STATS */}
            {(currentCard.type === 'deep_dive' || currentCard.type === 'stats') && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: `#${activeTheme.text}` }}>
                  {currentCard.title}
                </h2>
                {currentCard.stats && Array.isArray(currentCard.stats) && currentCard.stats.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {currentCard.stats.slice(0, 3).map((st, i) => (
                      <div 
                        key={i}
                        className="p-8 rounded-3xl border text-center space-y-3 shadow-xl"
                        style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent}` }}
                      >
                        <span className="text-5xl sm:text-6xl font-black" style={{ color: `#${activeTheme.accent}` }}>
                          {st.value}
                        </span>
                        <h4 className="text-base font-bold" style={{ color: `#${activeTheme.text}` }}>
                          {st.label}
                        </h4>
                        <p className="text-xs sm:text-sm opacity-80" style={{ color: `#${activeTheme.subtext}` }}>
                          {st.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                    <div 
                      className="sm:col-span-5 p-8 rounded-3xl border text-center flex flex-col justify-center items-center"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent}` }}
                    >
                      <span className="text-6xl sm:text-7xl font-black" style={{ color: `#${activeTheme.accent}` }}>
                        {currentCard.metricValue}
                      </span>
                      <p className="text-base font-bold mt-3" style={{ color: `#${activeTheme.text}` }}>
                        {currentCard.metricLabel}
                      </p>
                    </div>
                    <div 
                      className="sm:col-span-7 p-8 rounded-3xl border space-y-4"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                    >
                      <h4 className="text-lg font-bold" style={{ color: `#${activeTheme.text}` }}>
                        🔍 Tahliliy Faktlar va Natijalar:
                      </h4>
                      <div className="space-y-3 text-sm opacity-90" style={{ color: `#${activeTheme.subtext}` }}>
                        {(currentCard.bullets || []).map((b, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span style={{ color: `#${activeTheme.accent}` }}>✓</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ROADMAP / TIMELINE */}
            {(currentCard.type === 'roadmap' || currentCard.type === 'timeline') && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: `#${activeTheme.text}` }}>
                  {currentCard.title}
                </h2>
                <div className="space-y-4">
                  {(currentCard.steps || []).map((st, i) => (
                    <div 
                      key={i}
                      className="p-6 rounded-2xl border flex items-center gap-6"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                    >
                      <span 
                        className="px-4 py-2 rounded-xl text-xs font-black border"
                        style={{ color: `#${activeTheme.accent}`, borderColor: `#${activeTheme.accent}`, backgroundColor: `#${activeTheme.bg}` }}
                      >
                        {st.step}
                      </span>
                      <div>
                        <h4 className="text-base font-bold" style={{ color: `#${activeTheme.text}` }}>
                          {st.title}
                        </h4>
                        <p className="text-xs opacity-80" style={{ color: `#${activeTheme.subtext}` }}>
                          {st.desc || st.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUIZ SLIDE */}
            {currentCard.type === 'quiz_slide' && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: `#${activeTheme.text}` }}>
                  {currentCard.title}
                </h2>
                <div 
                  className="p-8 rounded-3xl border space-y-3 shadow-xl"
                  style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent}` }}
                >
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border"
                    style={{ color: `#${activeTheme.accent}`, borderColor: `#${activeTheme.accent}`, backgroundColor: `#${activeTheme.bg}` }}
                  >
                    ❓ Interaktiv Nazorat Savoli
                  </span>
                  <p className="text-xl sm:text-2xl font-bold leading-relaxed" style={{ color: `#${activeTheme.text}` }}>
                    {currentCard.question}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(currentCard.options || []).slice(0, 4).map((opt, i) => (
                    <div 
                      key={i}
                      className="p-5 rounded-2xl border text-sm font-semibold shadow"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}`, color: `#${activeTheme.text}` }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                {currentCard.answer && (
                  <div 
                    className="p-6 rounded-2xl border space-y-1 shadow"
                    style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent2}` }}
                  >
                    <span className="text-xs font-bold uppercase" style={{ color: `#${activeTheme.accent2}` }}>
                      🔑 O'qituvchi Kaliti va Ilmiy Sharh:
                    </span>
                    <p className="text-sm opacity-90" style={{ color: `#${activeTheme.subtext}` }}>
                      {currentCard.answer}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SUMMARY / CONCLUSION */}
            {(currentCard.type === 'summary' || currentCard.type === 'conclusion') && (
              <div 
                className="p-10 rounded-3xl border space-y-6"
                style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
              >
                <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: `#${activeTheme.accent}` }}>
                  {currentCard.title}
                </h2>
                {currentCard.quote && (
                  <div 
                    className="p-6 rounded-2xl border italic text-base sm:text-lg text-center"
                    style={{ backgroundColor: `#${activeTheme.bg}`, borderColor: `#${activeTheme.accent2}`, color: `#${activeTheme.text}` }}
                  >
                    "{currentCard.quote}"
                  </div>
                )}
                <div className="space-y-3 text-sm opacity-90" style={{ color: `#${activeTheme.subtext}` }}>
                  {(currentCard.takeaways || []).map((tk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span style={{ color: `#${activeTheme.accent}` }}>★</span>
                      <span>{tk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
