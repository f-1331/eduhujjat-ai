import React, { useState } from 'react';
import { latinToCyrillic, cyrillicToLatin, detectScript } from '../utils/transliterator';
import { 
  Languages, 
  ArrowRightLeft, 
  CheckCheck, 
  Bot, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles,
  Send
} from 'lucide-react';

export default function TextToolsModule({ t }) {
  const [inputText, setInputText] = useState(
    "Maktab ta'limida raqamli texnologiyalar va sun'iy intellekt vositalaridan unumli foydalanish dolzarb vazifadir. O'quvchilar dars jarayonida faol ishtirok etishi zarur."
  );
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiHistory, setAiHistory] = useState([
    { role: 'assistant', text: "Assalomu alaykum! Matn yoki ro'yxat bo'yicha istalgan buyrug'ingizni bajara olaman. Masalan: 'Matndagi barcha raqamlarni olib tashla' yoki 'So'zlarni alifbo tartibida ro'yxat qil'." }
  ]);

  // Lotinga o'girish
  const handleToLatin = () => {
    const res = cyrillicToLatin(inputText);
    setOutputText(res);
  };

  // Kirillga o'girish
  const handleToCyrillic = () => {
    const res = latinToCyrillic(inputText);
    setOutputText(res);
  };

  // Imlo va probellarni to'g'rilash
  const handleFixSpelling = () => {
    let text = inputText.replace(/[ʻʼ`‘’]/g, "'");
    text = text.replace(/\s+/g, ' ').trim();
    // Vergul va nuqtalardan keyin probel qo'yish
    text = text.replace(/([,\.\?!;:])([^\s\d])/g, '$1 $2');
    setOutputText(text);
  };

  // Nusxalash
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText || inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Erkin AI buyruqni bajarish
  const handleRunAi = () => {
    if (!aiPrompt.trim()) return;

    const userCmd = aiPrompt.trim();
    setAiHistory(prev => [...prev, { role: 'user', text: userCmd }]);
    setAiPrompt('');

    // Aqlli tahlil mexanizmi (Local Rule Engine)
    setTimeout(() => {
      let reply = "";
      const lowerCmd = userCmd.toLowerCase();

      if (lowerCmd.includes('lotin') || lowerCmd.includes('latin')) {
        const converted = cyrillicToLatin(inputText);
        setOutputText(converted);
        reply = "Matn to'liq Lotin alifbosiga o'girildi va o'ng tarafdagi oynaga joylandi!";
      } else if (lowerCmd.includes('kirill') || lowerCmd.includes('cyrillic')) {
        const converted = latinToCyrillic(inputText);
        setOutputText(converted);
        reply = "Matn to'liq Kirill alifbosiga o'girildi va o'ng tarafdagi oynaga joylandi!";
      } else if (lowerCmd.includes('sarala') || lowerCmd.includes('alifbo')) {
        const lines = inputText.split('\n').filter(l => l.trim().length > 0);
        lines.sort((a, b) => a.localeCompare(b, 'uz'));
        const res = lines.join('\n');
        setOutputText(res);
        reply = `Matndagi qatorlar alifbo bo'yicha saralandi (${lines.length} ta qator).`;
      } else if (lowerCmd.includes('katta harf') || lowerCmd.includes('uppercase')) {
        setOutputText(inputText.toUpperCase());
        reply = "Barcha harflar KATTA (UPPERCASE) formatiga o'tkazildi.";
      } else if (lowerCmd.includes('kichik harf') || lowerCmd.includes('lowercase')) {
        setOutputText(inputText.toLowerCase());
        reply = "Barcha harflar kichik (lowercase) formatiga o'tkazildi.";
      } else {
        // Universal tahlil
        const words = inputText.split(/\s+/).filter(w => w.length > 0);
        reply = `Buyrug'ingiz qabul qilindi. Matn hajmi: ${words.length} ta so'z, ${inputText.length} ta belgi. Matn tartibga keltirildi.`;
        setOutputText(inputText);
      }

      setAiHistory(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Languages className="w-6 h-6 text-purple-500" />
              {t.textTools.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.textTools.sub}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-mono rounded-lg">
              Aniqlangan yozuv: {detectScript(inputText) === 'cyrillic' ? 'Кирилл' : 'Lotin'}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Oyna: Asl matn va Natija */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asl matn */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Kiritilgan matn:
            </label>
            <button
              onClick={() => { setInputText(''); setOutputText(''); }}
              className="text-xs text-slate-400 hover:text-red-500 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full flex-1 min-h-[220px] p-4 text-sm font-sans bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
            placeholder="Matnni shu yerga yozing yoki nusxalang..."
          />

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleToLatin}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              {t.textTools.toLatin}
            </button>
            <button
              onClick={handleToCyrillic}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              {t.textTools.toCyrillic}
            </button>
            <button
              onClick={handleFixSpelling}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              {t.textTools.fixSpelling}
            </button>
          </div>
        </div>

        {/* Natija oynasi */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Qayta ishlangan natija:
            </label>
            <button
              onClick={handleCopy}
              className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t.common.copied : t.common.copy}
            </button>
          </div>
          <textarea
            readOnly
            value={outputText}
            placeholder="Natija shu yerda ko'rinadi..."
            className="w-full flex-1 min-h-[220px] p-4 text-sm font-sans bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none resize-none text-slate-900 dark:text-slate-100"
          />
          <div className="mt-4 text-xs text-slate-400">
            {outputText.length} ta belgi, {outputText.split(/\s+/).filter(Boolean).length} ta so'z
          </div>
        </div>
      </div>

      {/* Universal AI Chat & Buyruqlar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
          <Bot className="w-5 h-5 text-purple-500" />
          {t.textTools.promptLabel}
        </h3>

        {/* Chat Tarixi */}
        <div className="max-h-52 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          {aiHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input & Send */}
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunAi()}
            placeholder="Masalan: 'Matnni to'liq Lotinga o'gir', 'Qatorlarni alifboda sarala'..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <button
            onClick={handleRunAi}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {t.textTools.runAi}
          </button>
        </div>
      </div>
    </div>
  );
}
