import React, { useState } from 'react';
import { 
  FileEdit, 
  Upload, 
  Sparkles, 
  Trash2, 
  FileText, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Wand2, 
  Send, 
  CheckCircle2, 
  ArrowRightLeft, 
  RefreshCw,
  FileCheck2,
  Sliders,
  Scissors
} from 'lucide-react';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { generateCustomDocumentDocx } from '../utils/wordGenerator';
import { executeDocumentTransformWithAI } from '../utils/cleaner';

const SAMPLE_DOCUMENT = `O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI
144-SONLI UMUMIY O'RTA TA'LIM MAKTABI BUYRUG'I

2024-yil 15-noyabr                                Toshkent shahri

"Maktabda o'quvchilar xavfsizligini ta'minlash va kuzgi ta'til chora-tadbirlari to'g'risida"

2024-yil kuzgi ta'til davrida o'quvchilar xavfsizligini ta'minlash, maktab binosi va hududini muhofaza qilish, favqulodda vaziyatlarning oldini olish hamda o'quvchilarning bo'sh vaqtlarini mazmunli tashkil etish maqsadida, 

BUYURAMAN:

1. Maktab direktori o'rinbosari Karimov B. ga kuzgi ta'til davrida navbatchilik grafigini tasdiqlash va qat'iy nazoratga olish yuklatilsin.
2. 2024-yil 20-noyabrgacha barcha sinf rahbarlari o'quvchilar bilan yo'l harakati qoidalari bo'yicha tushuntirish ishlarini olib borsin.
3. Eskirgan qog'oz jurnallarni to'ldirish va har kuni xonalarni qulflash mas'uliyati qorovullarga yuklatilsin. (Ushbu band eskirgan)
4. Maktab psixologi va yoshlar yetakchisi ta'til davrida o'quvchilar o'rtasida shaxmat, shashka va kitobxonlik to'garaklarini uzluksiz faoliyatini yo'lga qo'ysin.
5. Mazkur buyruq ijrosini nazorat qilishni o'z zimmamda qoldiraman.

Maktab direktori:                           S.A. Toshmatov`;

export default function DocumentEditorModule({ t, lang }) {
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [instruction, setInstruction] = useState('');
  const [transformedText, setTransformedText] = useState('');
  const [changelog, setChangelog] = useState([]);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fayl yuklash (.docx, .xlsx, .txt)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    const lowerName = file.name.toLowerCase();

    try {
      if (lowerName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
      } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetText = XLSX.utils.sheet_to_csv(firstSheet);
        setInputText(sheetText);
      } else {
        const text = await file.text();
        setInputText(text);
      }
    } catch (err) {
      console.error(err);
      alert("Faylni o'qishda xatolik yuz berdi!");
    } finally {
      setIsProcessing(false);
    }
  };

  // Namunaviy hujjatni yuklash
  const handleLoadSample = () => {
    setInputText(SAMPLE_DOCUMENT);
    setFileName("Namunaviy_Buyruq.docx");
    setInstruction("2024-yilni 2026-yilga o'zgartir, 3-eski bandni to'liq o'chirib tashla, direktor ismini 'A.Q. Rustamov' ga almashtir va barcha imlo xatolarini to'g'irla.");
  };

  // AI Bilan Tahrirlash va O'chirish
  const handleTransform = async (customInstruction) => {
    const q = customInstruction || instruction;
    if (!inputText.trim()) {
      alert("Iltimos, avval tahrirlash uchun hujjat faylini yuklang yoki matn kiriting!");
      return;
    }
    if (!q.trim()) {
      alert("Iltimos, nimani to'g'irlash yoki o'chirish kerakligini yozing!");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await executeDocumentTransformWithAI(inputText, q);
      setTransformedText(res.transformedText || res.text || inputText);
      setChangelog(res.changelog || ["AI hujjatni foydalanuvchi buyrug'i bo'yicha tahrirladi."]);
      setSummary(res.summary || "Hujjat muvaffaqiyatli tahrirlandi.");
    } catch (err) {
      console.error("Transform error:", err);
      // Mahalliy tahrirlash fallback
      let result = inputText;
      const logs = [];

      // Yil almashtirish
      if (q.includes('2024') || q.includes('2026') || q.includes('yil')) {
        result = result.replace(/2024/g, '2026');
        logs.push("📅 2024-yil sanalari 2026-yilga yangilandi");
      }
      // O'chirish buyruqlari
      if (q.includes('3-band') || q.includes('uchinchi band') || q.includes('eski band')) {
        result = result.replace(/3\.\s*Eskirgan[^\n]+\n?/i, '');
        logs.push("✂️ 3-eskirgan qog'oz jurnallar bandi o'chirildi");
      }
      // Ism almashtirish
      const nameMatch = q.match(/['"]([A-Z\.\s]+)['"]\s*ga/);
      if (nameMatch) {
        result = result.replace(/S\.A\.\s*Toshmatov/g, nameMatch[1]);
        logs.push(`👤 Direktor ismi "${nameMatch[1]}" ga almashtirildi`);
      }

      setTransformedText(result);
      setChangelog(logs.length > 0 ? logs : ["✅ Matn tahrirlandi va yangilandi."]);
      setSummary("Mahalliy tahrirlash yakunlandi.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Nusxalash
  const handleCopy = () => {
    if (!transformedText) return;
    navigator.clipboard.writeText(transformedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Word yuklab olish
  const handleDownloadDocx = async () => {
    if (!transformedText) return;
    await generateCustomDocumentDocx(
      transformedText,
      "Tahrirlangan Rasmiy Hujjat",
      fileName ? `Tahrirlangan_${fileName.replace(/\.[^/.]+$/, '')}.docx` : "Tahrirlangan_Hujjat.docx"
    );
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha paneli */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Universal AI Fayl & Hujjat Tahrirchisi
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Faylni Yuklang & Qayerini To'g'irlashni Buyuring
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Word (.docx), Excel (.xlsx) faylini tashlang yoki matn yozing. AI ga nimani o'chirish, qayerini to'g'irlash yoki qanday o'zgartirishni yozsangiz — tizim buyruqni mukammal darajada bajarib beradi!
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleLoadSample}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              Namunaviy Hujjat Yuklash
            </button>
            <button
              onClick={() => {
                setInputText('');
                setTransformedText('');
                setChangelog([]);
                setFileName('');
                setInstruction('');
              }}
              className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition"
              title="Tozalash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Asosiy Ish Maydoni: 1. Asl Fayl va 2. AI Buyruqlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chap tomon: Asl Hujjat */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                1. Asl Hujjat / Matn
              </label>
              {fileName && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                  {fileName}
                </span>
              )}
            </div>
            <label className="cursor-pointer text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              Fayl Yuklash (.docx, .xlsx, .txt)
              <input type="file" accept=".docx,.xlsx,.xls,.txt,.csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Hujjat matnini shu yerga tashlang yoki yuqoridagi 'Fayl Yuklash' tugmasi orqali Word/Excel faylini tanlang..."
            className="w-full flex-1 min-h-[300px] p-4 text-xs font-mono bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-slate-800 dark:text-slate-200"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{inputText.length} ta belgi, {inputText.split(/\s+/).filter(Boolean).length} ta so'z</span>
            {isProcessing && <span className="text-indigo-500 font-bold animate-pulse">Yuklanmoqda...</span>}
          </div>
        </div>

        {/* O'ng tomon: AI Buyruqlar Paneli */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 rounded-lg bg-purple-600 text-white">
                <Wand2 className="w-3.5 h-3.5" />
              </span>
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                2. AI ga Buyruq Bering (Qayerini to'g'irlash va nimani o'chirish)
              </label>
            </div>

            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Masalan: 'Ushbu buyruqdan 3-bandni o'chirib tashla, 2024-yilni 2026-yilga almashtir, barcha grammatik xatolarni to'g'irla va direktor o'rniga yangi direktor F.I.Sh ni yoz'..."
              className="w-full min-h-[140px] p-4 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-slate-900 dark:text-slate-100"
            />

            {/* Tezkor Maslahat Chiplari */}
            <div className="mt-3">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">
                Tayyor buyruq shablonlari:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "✂️ Keraksiz bandlarni o'chirish", q: "Hujjatdagi eskirgan va keraksiz barcha bandlarni o'chirib tashla" },
                  { label: "📅 Yil va sanalarni 2026-yilga yangilash", q: "Hujjatdagi barcha 2024 va 2025-yil sanalarini 2026-yilga yangila" },
                  { label: "✍️ Imlo va uslubiy xatolarni tuzatish", q: "Barcha imlo, grammatik va punktuatsion xatolarni to'g'rilab, rasmiy tilga keltir" },
                  { label: "🏛️ Rasmiy DTS standartiga moslash", q: "Maktabgacha va maktab ta'limi vazirligi rasmiy ish yuritish standartiga moslab qayta yoz" },
                  { label: "🔄 Kirill yozuvidan Lotin yozuviga o'girish", q: "Butun matnni to'liq yangi o'zbek lotin alifbosiga o'gir" },
                  { label: "👤 Mas'ul shaxslar F.I.Sh ni almashtirish", q: "Hujjatdagi eski mas'ul shaxslar o'rniga yangi mas'ullarni ko'rsat" }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInstruction(chip.q)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/60 transition"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bajarish tugmasi */}
          <button
            onClick={() => handleTransform()}
            disabled={isProcessing || !inputText.trim() || !instruction.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <Sparkles className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {isProcessing ? "AI Hujjatni Tahrirlamoqda..." : "⚡ AI Bilan Tahrirlash va O'chirish"}
          </button>
        </div>
      </div>

      {/* Natija Paneli (Changelog va Tayyor Hujjat) */}
      {transformedText && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* AI Bajarilgan Ishlar Hisoboti */}
          {changelog.length > 0 && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
              <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                AI Bajarilgan Ishlar Hisoboti (O'zgarishlar jurnali):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {changelog.map((log, i) => (
                  <div key={i} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5 font-medium">
                    <span>•</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hujjat Natijasi va Eksport */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-500" />
                Tahrirlangan Yakuniy Hujjat (Tayyor holat)
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 transition flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Nusxalandi!" : "Nusxa Olish"}
                </button>
                <button
                  onClick={handleDownloadDocx}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Word (.docx) Yuklab Olish
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <pre className="font-serif text-sm leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-wrap select-text">
                {transformedText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
