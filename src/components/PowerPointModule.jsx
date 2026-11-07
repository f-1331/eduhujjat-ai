import React, { useState, useEffect } from 'react';
import { 
  GAMMA_THEMES, 
  getDefaultGammaCards, 
  generatePresentationPptx 
} from '../utils/powerpointGenerator';
import { 
  Presentation, 
  Sparkles, 
  Download, 
  Palette, 
  Layers,
  FileText,
  Play,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  RotateCcw,
  Volume2,
  Lightbulb,
  TrendingUp,
  Award,
  Milestone
} from 'lucide-react';

export default function PowerPointModule({ t }) {
  const [topic, setTopic] = useState("Fotosintez jarayoni va o'simliklar biosferasi");
  const [authorName, setAuthorName] = useState("SmartOffice EduAI");
  const [themeKey, setThemeKey] = useState("obsidian");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [cards, setCards] = useState(() => getDefaultGammaCards("Fotosintez jarayoni va o'simliklar biosferasi", "SmartOffice EduAI"));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  const activeTheme = GAMMA_THEMES[themeKey] || GAMMA_THEMES.obsidian;

  // Mavzu o'zgarganda kartalarni yangilash
  const handleApplyTopic = (newTopic) => {
    setTopic(newTopic);
    const newCards = getDefaultGammaCards(newTopic, authorName);
    setCards(newCards);
    setActiveSlideIndex(0);
  };

  // PowerPoint (.pptx) yuklab olish
  const handleExportPptx = async () => {
    setIsGenerating(true);
    try {
      const cleanName = topic.slice(0, 30).replace(/[^a-zA-Z0-9А-Яа-яЎўҒғҚқҲҳ]/g, '_');
      await generatePresentationPptx({
        topic,
        styleName: themeKey,
        cards,
        authorName,
        filename: `${cleanName}_Gamma_Taqdimot.pptx`
      });
    } catch (err) {
      console.error(err);
      alert("Taqdimotni eksport qilishda xatolik yuz berdi!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Klaviaturada strelkalar orqali slaydni almashtirish (Taqdimot rejimi)
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

  const currentCard = cards[activeSlideIndex] || cards[0];

  // Tezkor Genspark mavzulari (Genspark Prompt Chips)
  const quickTopics = [
    { title: "Fotosintez va Biosfera", icon: "🧬", prompt: "Fotosintez jarayoni va o'simliklar biosferasi" },
    { title: "Amir Temur Saltanati", icon: "🏛", prompt: "Amir Temur davlati va harbiy strategiyasi" },
    { title: "Sun'iy Intellekt 2026", icon: "🤖", prompt: "Sun'iy Intellekt va Raqamli Ta'lim 2026" },
    { title: "Pifagor Teoremasi", icon: "📐", prompt: "Pifagor teoremasi va fazoviy geometriya" },
    { title: "Maktab Monitoringi", icon: "📊", prompt: "Zamonaviy Maktab Monitoringi va Raqamli Davomat" },
    { title: "Yashil Energetika", icon: "🌿", prompt: "Iqlim o'zgarishi va qayta tiklanuvchi energiya" }
  ];

  return (
    <div className="space-y-6">
      {/* 1. GAMMA HEADER & HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950">
                Gamma & Genspark 2.0 AI Engine
              </span>
              <span className="text-xs text-sky-300 font-mono">16:9 Widescreen PPTX</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Presentation className="w-7 h-7 text-sky-400" />
              Gamma AI Taqdimot Studiyasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Gamma.app va Genspark uslubidagi kartochkali zamonaviy taqdimotlar, jonli namoyish rejimi va professional PowerPoint (.pptx) eksporti.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              Namoyish Rejimi (Gamma Mode)
            </button>
            <button
              onClick={handleExportPptx}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Sparkles className="w-4 h-4 animate-spin text-slate-950" /> : <Download className="w-4 h-4 text-slate-950" />}
              {isGenerating ? "Tayyorlanmoqda..." : "PPTX Yuklash"}
            </button>
          </div>
        </div>

        {/* Tezkor Mavzular (Chips) */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0">
            ⚡ Tayyor AI Mavzular:
          </span>
          {quickTopics.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyTopic(item.prompt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
                topic === item.prompt
                  ? 'bg-sky-400 text-slate-950 font-bold shadow-md'
                  : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. ASOSIY BOSHQARUV VA GAMMA KANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHAP PANEL: SOZLAMALAR VA TEMALAR (4 ustun) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Mavzu kiritish */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                🎯 Taqdimot Mavzusi (Topic):
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Mavzuni kiriting..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                👤 Ma'ruzachi / Muallif:
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              onClick={() => handleApplyTopic(topic)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-500" />
              Slaydlarni Yangidan Generatsiya Qilish
            </button>
          </div>

          {/* Gamma Temalari */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-500" />
              Gamma AI Rang Mavzulari:
            </label>
            <div className="space-y-2">
              {Object.values(GAMMA_THEMES).map((th) => (
                <button
                  key={th.id}
                  onClick={() => setThemeKey(th.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    themeKey === th.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: `#${th.bg}` }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `#${th.accent}` }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {th.name.split('(')[0].trim()}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {th.name.includes('(') ? th.name.split('(')[1].replace(')', '') : ''}
                      </div>
                    </div>
                  </div>
                  {themeKey === th.id && <Check className="w-4 h-4 text-sky-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* O'NG PANEL: INTERAKTIV GAMMA SLAYD KANVASI (8 ustun) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Slaydlar tanlov paneli (Slide Tabs) */}
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
                  <span>{c.badge ? c.badge.split(' ')[0] : `Slayd ${idx + 1}`}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActiveSlideIndex(prev => Math.max(prev - 1, 0))}
                disabled={activeSlideIndex === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold px-2 text-slate-600 dark:text-slate-400">
                {activeSlideIndex + 1}/{cards.length}
              </span>
              <button
                onClick={() => setActiveSlideIndex(prev => Math.min(prev + 1, cards.length - 1))}
                disabled={activeSlideIndex === cards.length - 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* JONLI GAMMA SLAYD DISPLAY (Widescreen 16:9 Canvas) */}
          <div 
            className="w-full aspect-video rounded-3xl p-6 sm:p-10 shadow-2xl relative flex flex-col justify-between border transition-all duration-300 overflow-hidden"
            style={{ 
              backgroundColor: `#${activeTheme.bg}`,
              borderColor: `#${activeTheme.cardBorder}`
            }}
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider opacity-70" style={{ color: `#${activeTheme.subtext}` }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `#${activeTheme.accent}` }} />
                <span>SMARTOFFICE & EDUAI PRO  •  GAMMA ENGINE</span>
              </div>
              <span>SLAYD {activeSlideIndex + 1} / {cards.length}</span>
            </div>

            {/* Slayd kontenti (Turiga qarab) */}
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
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border"
                    style={{ 
                      color: `#${activeTheme.accent}`, 
                      borderColor: `#${activeTheme.accent}`,
                      backgroundColor: `#${activeTheme.bg}`
                    }}
                  >
                    {currentCard.badge || "GAMMA AI TAQDIMOT"}
                  </span>
                  <h1 
                    className="text-2xl sm:text-4xl font-extrabold tracking-tight"
                    style={{ color: `#${activeTheme.text}` }}
                  >
                    {currentCard.title}
                  </h1>
                  <p 
                    className="text-xs sm:text-sm max-w-xl"
                    style={{ color: `#${activeTheme.subtext}` }}
                  >
                    {currentCard.subtitle}
                  </p>
                  <div 
                    className="pt-3 border-t text-xs font-semibold flex items-center justify-between"
                    style={{ borderColor: `#${activeTheme.cardBorder}`, color: `#${activeTheme.accent}` }}
                  >
                    <span>👤 Taqdimotchi: {currentCard.author || authorName}</span>
                    <span className="opacity-75">O'zbekiston Ta'lim Tizimi</span>
                  </div>
                </div>
              )}

              {/* 2. SPLIT COMPARISON (2 USTUN) */}
              {currentCard.type === 'split' && (
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: `#${activeTheme.text}` }}>
                    {currentCard.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      className="p-5 rounded-2xl border space-y-2 shadow"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                    >
                      <h4 className="text-xs sm:text-sm font-bold" style={{ color: `#${activeTheme.accent}` }}>
                        {currentCard.leftTitle}
                      </h4>
                      <ul className="text-[11px] sm:text-xs space-y-1.5 list-disc list-inside" style={{ color: `#${activeTheme.subtext}` }}>
                        {(currentCard.leftBullets || []).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>

                    <div 
                      className="p-5 rounded-2xl border space-y-2 shadow"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent2}` }}
                    >
                      <h4 className="text-xs sm:text-sm font-bold" style={{ color: `#${activeTheme.accent2}` }}>
                        {currentCard.rightTitle}
                      </h4>
                      <ul className="text-[11px] sm:text-xs space-y-1.5 list-disc list-inside" style={{ color: `#${activeTheme.subtext}` }}>
                        {(currentCard.rightBullets || []).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 3 TA USTUN (PILLARS GRID) */}
              {currentCard.type === 'pillars' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: `#${activeTheme.text}` }}>
                      {currentCard.title}
                    </h2>
                    <p className="text-xs" style={{ color: `#${activeTheme.subtext}` }}>
                      {currentCard.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(currentCard.cards || []).map((c, i) => (
                      <div 
                        key={i}
                        className="p-4 rounded-2xl border space-y-2 shadow flex flex-col justify-between"
                        style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                      >
                        <span className="text-xl font-black" style={{ color: `#${activeTheme.accent}` }}>
                          {c.num}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold" style={{ color: `#${activeTheme.text}` }}>
                          {c.title}
                        </h4>
                        <p className="text-[11px] line-clamp-3" style={{ color: `#${activeTheme.subtext}` }}>
                          {c.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. CHUQUR TAHLIL VA METRIKA */}
              {currentCard.type === 'deep_dive' && (
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: `#${activeTheme.text}` }}>
                    {currentCard.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div 
                      className="sm:col-span-4 p-5 rounded-2xl border text-center flex flex-col items-center justify-center shadow"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.accent}` }}
                    >
                      <span className="text-3xl sm:text-5xl font-black" style={{ color: `#${activeTheme.accent}` }}>
                        {currentCard.metricValue}
                      </span>
                      <p className="text-xs font-bold mt-2" style={{ color: `#${activeTheme.text}` }}>
                        {currentCard.metricLabel}
                      </p>
                    </div>

                    <div 
                      className="sm:col-span-8 p-5 rounded-2xl border space-y-2 shadow"
                      style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                    >
                      <h4 className="text-xs sm:text-sm font-bold" style={{ color: `#${activeTheme.text}` }}>
                        🔍 Tahliliy Xulosalar:
                      </h4>
                      <div className="space-y-1.5 text-[11px] sm:text-xs" style={{ color: `#${activeTheme.subtext}` }}>
                        {(currentCard.bullets || []).map((b, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span style={{ color: `#${activeTheme.accent}` }}>✓</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. ROADMAP / TIMELINE */}
              {currentCard.type === 'roadmap' && (
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: `#${activeTheme.text}` }}>
                    {currentCard.title}
                  </h2>
                  <div className="space-y-2">
                    {(currentCard.steps || []).map((st, i) => (
                      <div 
                        key={i}
                        className="p-3.5 rounded-xl border flex items-center gap-4 shadow"
                        style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                      >
                        <span 
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 border"
                          style={{ 
                            color: `#${activeTheme.accent}`, 
                            borderColor: `#${activeTheme.accent}`,
                            backgroundColor: `#${activeTheme.bg}`
                          }}
                        >
                          {st.step}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold" style={{ color: `#${activeTheme.text}` }}>
                            {st.title}
                          </h4>
                          <p className="text-[10px] sm:text-[11px]" style={{ color: `#${activeTheme.subtext}` }}>
                            {st.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. XULOSA */}
              {currentCard.type === 'summary' && (
                <div 
                  className="p-6 sm:p-8 rounded-2xl border space-y-4 shadow-xl"
                  style={{ backgroundColor: `#${activeTheme.cardBg}`, borderColor: `#${activeTheme.cardBorder}` }}
                >
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: `#${activeTheme.accent}` }}>
                    {currentCard.title}
                  </h2>
                  {currentCard.quote && (
                    <div 
                      className="p-3.5 rounded-xl border italic text-xs sm:text-sm text-center"
                      style={{ 
                        backgroundColor: `#${activeTheme.bg}`, 
                        borderColor: `#${activeTheme.accent2}`,
                        color: `#${activeTheme.text}`
                      }}
                    >
                      {currentCard.quote}
                    </div>
                  )}
                  <div className="space-y-1.5 text-xs" style={{ color: `#${activeTheme.subtext}` }}>
                    {(currentCard.takeaways || []).map((tk, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span style={{ color: `#${activeTheme.accent}` }}>★</span>
                        <span>{tk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div 
              className="flex items-center justify-between text-[10px] opacity-60 border-t pt-2"
              style={{ borderColor: `#${activeTheme.cardBorder}`, color: `#${activeTheme.subtext}` }}
            >
              <span>16:9 HD Slayd Dek</span>
              <span>Gamma & Genspark Presentation Standard</span>
            </div>
          </div>

          {/* Ma'ruzachi Nutqi (Speaker Notes Drawer) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                Ma'ruzachi Nutqi (Speaker Notes — Taqdimot vaqtida aytiladigan gaplar):
              </div>
              <button 
                onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                className="text-xs text-sky-500 hover:underline font-semibold"
              >
                {showSpeakerNotes ? "Yashirish" : "Ko'rsatish"}
              </button>
            </div>

            {showSpeakerNotes && (
              <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                "{currentCard.speakerNotes || "Hurmatli tinglovchilar! Ushbu slaydda asosiy tushunchalar bilan tanishamiz."}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. TO'LIQ EKRANLI JONLI NAMOYISH REJIMI (FULLSCREEN GAMMA MODE) */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200"
          style={{ backgroundColor: `#${activeTheme.bg}`, color: `#${activeTheme.text}` }}
        >
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
            {/* 1. HERO SLAYDI */}
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
                <div className="pt-6 border-t text-sm font-bold" style={{ borderColor: `#${activeTheme.cardBorder}`, color: `#${activeTheme.accent}` }}>
                  👤 Taqdimotchi: {currentCard.author || authorName}
                </div>
              </div>
            )}

            {/* 2. SPLIT COMPARISON */}
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

            {/* 3. 3 TA USTUN (PILLARS) */}
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

            {/* 4. CHUQUR TAHLIL */}
            {currentCard.type === 'deep_dive' && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: `#${activeTheme.text}` }}>
                  {currentCard.title}
                </h2>
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
                      🔍 Tizimli Tahlil va Natijalar:
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
              </div>
            )}

            {/* 5. ROADMAP */}
            {currentCard.type === 'roadmap' && (
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
                          {st.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. SUMMARY */}
            {currentCard.type === 'summary' && (
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
                    {currentCard.quote}
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

          {/* Pastki Navigatsiya */}
          <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: `#${activeTheme.cardBorder}` }}>
            <button
              onClick={() => setActiveSlideIndex(prev => Math.max(prev - 1, 0))}
              disabled={activeSlideIndex === 0}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-30 transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Oldingi Slayd
            </button>

            {/* Slide Dots */}
            <div className="flex items-center gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlideIndex(i)}
                  className={`w-3 h-3 rounded-full transition ${
                    activeSlideIndex === i ? 'scale-125' : 'opacity-40'
                  }`}
                  style={{ backgroundColor: activeSlideIndex === i ? `#${activeTheme.accent}` : '#ffffff' }}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveSlideIndex(prev => Math.min(prev + 1, cards.length - 1))}
              disabled={activeSlideIndex === cards.length - 1}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-30 transition flex items-center gap-1.5"
            >
              Keyingi Slayd
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
