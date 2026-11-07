import React, { useState } from 'react';
import { generatePresentationPptx } from '../utils/powerpointGenerator';
import { 
  Presentation, 
  Sparkles, 
  Download, 
  Palette, 
  HelpCircle, 
  Mic, 
  Layers,
  FileText
} from 'lucide-react';

export default function PowerPointModule({ t }) {
  const [topic, setTopic] = useState("Fotosintez jarayoni va o'simliklar dunyosi");
  const [slidesCount, setSlidesCount] = useState(6);
  const [styleName, setStyleName] = useState('modern');
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [authorName, setAuthorName] = useState("SmartOffice EduAI");
  const [isGenerating, setIsGenerating] = useState(false);

  // Slayd generatsiyasi
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generatePresentationPptx({
        topic,
        styleName,
        slidesCount,
        includeSpeakerNotes,
        includeQuiz,
        authorName,
        filename: `${topic.slice(0, 30).replace(/\s+/g, '_')}_Taqdimot.pptx`
      });
    } catch (err) {
      console.error(err);
      alert("Taqdimotni yaratishda xatolik yuz berdi!");
    } finally {
      setIsGenerating(false);
    }
  };

  const styleOptions = [
    { id: 'modern', name: 'Zamonaviy (Dark & Sky)', color: 'bg-slate-900 border-sky-500' },
    { id: 'academic', name: 'Akademik (Navy & Gold)', color: 'bg-blue-950 border-amber-500' },
    { id: 'minimalist', name: 'Minimalist (Clean White)', color: 'bg-slate-100 border-slate-900' },
    { id: 'kids', name: 'Bolalarbop (Emerald & Pink)', color: 'bg-emerald-900 border-amber-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Presentation className="w-6 h-6 text-sky-500" />
              {t.powerpoint.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.powerpoint.sub}
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sozlamalar ustuni */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              {t.powerpoint.topicLabel}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: Amir Temur davlati, Fotosintez, AI..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Muallif / Taqdimotchi:
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.powerpoint.slideCountLabel}
              </label>
              <span className="text-xs font-bold text-sky-600">{slidesCount} ta slayd</span>
            </div>
            <input
              type="range"
              min="4"
              max="15"
              value={slidesCount}
              onChange={(e) => setSlidesCount(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              {t.powerpoint.styleLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {styleOptions.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStyleName(st.id)}
                  className={`p-2.5 text-xs font-medium rounded-xl border text-left transition flex items-center gap-2 ${
                    styleName === st.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${st.color} border`} />
                  <span className="truncate">{st.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSpeakerNotes}
                onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                className="rounded text-sky-500 focus:ring-sky-500"
              />
              <Mic className="w-3.5 h-3.5 text-indigo-500" />
              {t.powerpoint.speakerNotes}
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeQuiz}
                onChange={(e) => setIncludeQuiz(e.target.checked)}
                className="rounded text-sky-500 focus:ring-sky-500"
              />
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              {t.powerpoint.quizInclude}
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isGenerating ? t.common.loading : t.powerpoint.generateBtn}
          </button>
        </div>

        {/* Jonli slayd ko'rinishi (Live Preview) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500" />
                Slayd Maketi Ko'rinishi (Live Preview)
              </h3>
              <span className="text-xs px-2.5 py-1 bg-sky-50 dark:bg-sky-950 text-sky-600 rounded-lg font-mono">
                16:9 HD Slayd
              </span>
            </div>

            {/* Simulated Slide Canvas */}
            <div className={`aspect-video w-full rounded-2xl p-8 flex flex-col justify-between shadow-inner transition-colors duration-300 ${
              styleName === 'modern' ? 'bg-slate-900 text-white' :
              styleName === 'academic' ? 'bg-blue-950 text-white' :
              styleName === 'kids' ? 'bg-emerald-900 text-white' :
              'bg-slate-100 text-slate-900 border border-slate-300'
            }`}>
              <div className="flex items-center justify-between opacity-80 text-xs">
                <span>SMARTOFFICE & EDUAI PRO</span>
                <span>SLAYD 1 / {slidesCount}</span>
              </div>

              <div className="text-center my-auto space-y-3">
                <h1 className={`text-2xl md:text-4xl font-extrabold tracking-tight ${
                  styleName === 'modern' ? 'text-sky-400' :
                  styleName === 'academic' ? 'text-amber-400' :
                  styleName === 'kids' ? 'text-amber-300' : 'text-slate-900'
                }`}>
                  {topic.toUpperCase()}
                </h1>
                <p className="text-xs md:text-sm opacity-80 max-w-lg mx-auto">
                  Taqdimotchi: {authorName} • Zamonaviy ta'lim va ofis texnologiyalari
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] opacity-60 border-t border-white/10 pt-3">
                <span>16:9 Widescreen</span>
                <span>O'zbekiston Ta'lim Tizimi</span>
              </div>
            </div>

            {/* Speaker Notes Preview */}
            {includeSpeakerNotes && (
              <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <Mic className="w-3.5 h-3.5 text-indigo-500" />
                  Ma'ruzachi nutqi (Speaker Notes namunasi):
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  "Assalomu alaykum, hurmatli tinglovchilar va qatnashchilar! Bugungi taqdimotimiz mavzusi: '{topic}'. Ushbu taqdimot davomida biz asosiy tushunchalar va amaliy ahamiyat bilan tanishamiz..."
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
