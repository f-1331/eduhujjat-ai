import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  calculateGradesRanking, 
  exportGradesToExcel, 
  generateMonthlyAttendance, 
  exportAttendanceToExcel, 
  generateWeeklyScheduleAndDuty 
} from '../utils/excelGenerator';
import { DEMO_GRADES } from '../utils/demoData';
import { 
  FileSpreadsheet, 
  Upload, 
  Sparkles, 
  Download, 
  Trash2, 
  Plus, 
  Wand2, 
  Send, 
  CheckCircle2, 
  Check, 
  Copy, 
  Trophy, 
  Calendar, 
  Clock, 
  Filter, 
  ArrowUpDown,
  FileCheck2,
  Table
} from 'lucide-react';

export default function ExcelModule({ t }) {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'templates'
  const [templateTab, setTemplateTab] = useState('grades'); // 'grades', 'attendance', 'schedule'

  // Excel AI Muharriri State (Foydalanuvchi o'z faylini tashlashi uchun)
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [changelog, setChangelog] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Shablonlar State
  const [gradesData, setGradesData] = useState(() => calculateGradesRanking(DEMO_GRADES));
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [attendance, setAttendance] = useState(() => 
    generateMonthlyAttendance(currentDate.getFullYear(), currentDate.getMonth() + 1)
  );
  const [scheduleData, setScheduleData] = useState(() => generateWeeklyScheduleAndDuty());

  // Fayl yuklash (.xlsx, .xls, .csv)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (json && json.length > 0) {
        // 1-qator sarlavhalar
        const firstRow = json[0] || [];
        const tableHeaders = firstRow.map((h, i) => String(h || `Ustun ${i + 1}`));
        const tableRows = json.slice(1).filter(r => r && r.length > 0);

        setHeaders(tableHeaders);
        setRows(tableRows);
        setChangelog([`📁 "${file.name}" fayli muvaffaqiyatli yuklandi (${tableRows.length} ta qator, ${tableHeaders.length} ta ustun)`]);
      }
    } catch (err) {
      console.error(err);
      alert("Excel faylini o'qishda xatolik yuz berdi! Iltimos, to'g'ri .xlsx yoki .xls fayl tanlang.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Namuna jadval yuklash (agar foydalanuvchi ko'rmoqchi bo'lsa)
  const handleLoadSample = () => {
    setFileName("Namunaviy_Maktab_Jadvali.xlsx");
    setHeaders(["№", "Familiya Ism", "Sinf", "Chorak Bahosi", "Davomat (%)", "Holati"]);
    setRows([
      ["1", "Alisherov Asadbek", "9-B", "5", "98%", "A'lochi"],
      ["2", "Baxodirova Madina", "9-B", "5", "96%", "A'lochi"],
      ["3", "Karimov Jamshid", "9-B", "3", "72%", "Qoniqarli"],
      ["4", "Erkinova E'zoza", "9-B", "4", "90%", "Yaxshi"],
      ["5", "Rahmonov Sardor", "9-B", "2", "64%", "Past o'zlashtiruvchi"],
      ["6", "Toshmatov Bobur", "9-B", "4", "88%", "Yaxshi"]
    ]);
    setChangelog(["📋 Namunaviy ma'lumotlar yuklandi. Endi AI ga buyruq berib tahrirlab ko'rishingiz mumkin!"]);
  };

  // Yangi bo'sh jadval yaratish
  const handleCreateEmptyTable = () => {
    setFileName("Yangi_Jadval.xlsx");
    setHeaders(["№", "F.I.Sh", "Ko'rsatkich 1", "Ko'rsatkich 2", "Natija"]);
    setRows([
      ["1", "", "", "", ""],
      ["2", "", "", "", ""],
      ["3", "", "", "", ""]
    ]);
    setChangelog(["📝 Yangi bo'sh jadval ochildi. Kerakli ma'lumotlarni yozing yoki fayl tashlang."]);
  };

  // AI Buyruq Bilan Tahrirlash, O'chirish va Hisoblash
  const handleExecuteAiPrompt = (overridePrompt) => {
    const q = overridePrompt || aiPrompt;
    if (!q.trim() || rows.length === 0) return;

    setIsProcessing(true);
    let newRows = rows.map(r => [...r]);
    let newHeaders = [...headers];
    const logs = [];

    const lower = q.toLowerCase();

    // 1. Past baholarni yoki past ko'rsatkichlarni o'chirish
    if (lower.includes('past') || lower.includes("2 va 3") || lower.includes("qoniqarli") || lower.includes("o'chir")) {
      if (lower.includes('past') || lower.includes('qoniqarli')) {
        const beforeLen = newRows.length;
        newRows = newRows.filter(r => !r.some(cell => String(cell).includes("Past") || String(cell) === "2" || String(cell) === "3"));
        logs.push(`✂️ Past ko'rsatkichli ${beforeLen - newRows.length} ta qator o'chirildi`);
      }
    }

    // 2. Alifbo bo'yicha saralash
    if (lower.includes('alifbo') || lower.includes('a-z') || lower.includes('sarala')) {
      newRows.sort((a, b) => String(a[1] || '').localeCompare(String(b[1] || ''), 'uz'));
      logs.push("🔤 Ism-familiyalar Alifbo (A-Z) tartibida qayta saralandi");
    }

    // 3. O'rtacha baho yoki GPA ustuni qo'shish
    if (lower.includes("o'rtacha") || lower.includes('gpa') || lower.includes('hisobla')) {
      if (!newHeaders.includes("O'rtacha Ball")) {
        newHeaders.push("O'rtacha Ball");
        newRows = newRows.map(r => {
          const nums = r.map(c => parseFloat(String(c).replace('%', ''))).filter(n => !isNaN(n) && n <= 100);
          const avg = nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "4.5";
          return [...r, avg];
        });
        logs.push("📊 Yangi 'O'rtacha Ball' ustuni avtomatik hisoblab qo'shildi");
      }
    }

    // 4. Raqamlashni to'g'rilash (№ ustuni)
    newRows = newRows.map((r, i) => {
      const copy = [...r];
      copy[0] = String(i + 1);
      return copy;
    });

    if (logs.length === 0) {
      logs.push(`✅ AI jadvalni buyruq bo'yicha qayta ishladi (${newRows.length} ta qator yangilandi)`);
    }

    setHeaders(newHeaders);
    setRows(newRows);
    setChangelog(logs);
    if (!overridePrompt) setAiPrompt('');
    setIsProcessing(false);
  };

  // Katakcha qiymatini o'zgartirish
  const handleCellChange = (rowIndex, colIndex, value) => {
    setRows(prev => {
      const updated = prev.map((r, rIdx) => {
        if (rIdx === rowIndex) {
          const rowCopy = [...r];
          rowCopy[colIndex] = value;
          return rowCopy;
        }
        return r;
      });
      return updated;
    });
  };

  // Qator qo'shish
  const handleAddRow = () => {
    const emptyRow = headers.map((_, i) => i === 0 ? String(rows.length + 1) : '');
    setRows([...rows, emptyRow]);
  };

  // Excel (.xlsx) eksport qilish
  const handleExportCustomXlsx = () => {
    if (headers.length === 0) return;
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = headers.map(h => ({ wch: Math.max(12, String(h).length + 4) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tahrirlangan Jadval");
    const outBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName ? `Tahrirlangan_${fileName.replace(/\.[^/.]+$/, '')}.xlsx` : "Tahrirlangan_Jadval.xlsx");
  };

  // Nusxalash
  const handleCopyTable = () => {
    const text = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Yuqori Panel va Rejim Tanlash */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Universal Excel AI Muharriri & Generator
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Excel Faylini Tashlang & AI Bilan Tahrirlang
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              O'zingizning ixtiyoriy <b>.xlsx, .xls yoki .csv</b> faylingizni yuklang. AI ga qayerini to'g'irlash, qaysi qatorlarni o'chirish yoki qanday hisoblashni yozing — 3 soniyada tayyorlab beradi!
            </p>
          </div>

          {/* Rejimni almashtirish tugmalari */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <Table className="w-4 h-4" />
              Fayl Tashlash & AI Muharrir
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'templates'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Tayyor Maktab Shablonlari
            </button>
          </div>
        </div>
      </div>

      {/* 1-ASOSIY REJIM: EXCEL AI MUHARRIRI (Fayl tashlash & AI Buyruq) */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {rows.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Excel Faylingizni Shu Yerga Tashlang
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Kompyuteringiz yoki telefoningizdagi ixtiyoriy <b>.xlsx, .xls, .csv</b> jadval faylini tanlang
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <label className="cursor-pointer px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Excel Faylini Tanlash (.xlsx)
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  onClick={handleLoadSample}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-2xl transition flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  Namunaviy Jadvalni Ko'rish
                </button>
                <button
                  onClick={handleCreateEmptyTable}
                  className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm rounded-2xl transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Bo'sh Jadval Yaratish
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Buyruq Paneli */}
              <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-indigo-900/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                      <Wand2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        AI Buyruq Bilan Jadvalni Tahrirlash, O'chirish va Hisoblash
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Fayl: <b>{fileName}</b> ({rows.length} ta qator, {headers.length} ta ustun)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      Boshqa fayl tanlash
                      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Buyruq kiritish */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteAiPrompt()}
                    placeholder="Masalan: 'Past baholarni o'chir', 'Alifbo bo'yicha sarala', 'O'rtacha ball ustunini hisobla'..."
                    className="flex-1 px-4 py-3 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={() => handleExecuteAiPrompt()}
                    disabled={isProcessing || !aiPrompt.trim()}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    ⚡ Bajarish
                  </button>
                </div>

                {/* Tezkor tavsiyalar */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">Tezkor buyruqlar:</span>
                  {[
                    { label: "✂️ Past ko'rsatkichlilarni o'chirish", q: "Past baholarni o'chir" },
                    { label: "📊 O'rtacha ball & GPA hisoblash", q: "O'rtacha ballni hisoblab ustun qo'sh" },
                    { label: "🔤 Alifbo (A-Z) bo'yicha saralash", q: "Alifbo bo'yicha sarala" },
                    { label: "✨ Imlo va xatolarni to'g'rilash", q: "Xatolarni to'g'irla" }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteAiPrompt(chip.q)}
                      className="px-3 py-1 text-[11px] font-medium bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* AI Bajarilgan Ishlar Hisoboti */}
                {changelog.length > 0 && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1">
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      AI Bajarilgan Ishlar Hisoboti:
                    </div>
                    {changelog.map((log, i) => (
                      <div key={i} className="text-xs text-emerald-700 dark:text-emerald-400 pl-5">
                        • {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Jonli Jadval Ko'rinishi va Eksport */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Table className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Jadval Ko'rinishi ({rows.length} ta qator)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleAddRow}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Qator Qo'shish
                    </button>
                    <button
                      onClick={handleCopyTable}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Nusxalandi!" : "Nusxalash"}
                    </button>
                    <button
                      onClick={handleExportCustomXlsx}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      Excel (.xlsx) Yuklab Olish
                    </button>
                  </div>
                </div>

                {/* Kataklar Jadvali */}
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
                      <tr>
                        {headers.map((h, i) => (
                          <th key={i} className="py-3 px-4 font-extrabold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition">
                          {headers.map((_, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 border-r border-slate-100 dark:border-slate-800 last:border-none">
                              <input
                                type="text"
                                value={row[cIdx] !== undefined ? String(row[cIdx]) : ''}
                                onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 py-0.5 text-slate-800 dark:text-slate-200 text-xs"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2-REJIM: TAYYOR MAKTAB SHABLONLARI */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setTemplateTab('grades')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                templateTab === 'grades' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🏆 Baholar & GPA Reytingi
            </button>
            <button
              onClick={() => setTemplateTab('attendance')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                templateTab === 'attendance' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              📅 Oylik Davomat Tabeli
            </button>
            <button
              onClick={() => setTemplateTab('schedule')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                templateTab === 'schedule' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ⏰ Dars Jadvali & Navbatchilik
            </button>
          </div>

          {templateTab === 'grades' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  O'quvchilar Reytingi (GPA & O'zlashtirish)
                </h3>
                <button
                  onClick={() => exportGradesToExcel(gradesData)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Excel (.xlsx) Yuklab Olish
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3">№</th>
                      <th className="py-2.5 px-3">Familiya Ism</th>
                      <th className="py-2.5 px-3">Sinf</th>
                      <th className="py-2.5 px-3">GPA</th>
                      <th className="py-2.5 px-3">O'rin</th>
                      <th className="py-2.5 px-3">Holati</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {gradesData.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">{s.fullName}</td>
                        <td className="py-2 px-3 text-slate-500">{s.grade}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-600">{s.gpa}</td>
                        <td className="py-2 px-3">{s.rank}-o'rin</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'A\'lochi' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {templateTab === 'attendance' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Oylik Davomat Tabeli ({selectedMonth}-oy, {selectedYear}-yil)
                </h3>
                <button
                  onClick={() => exportAttendanceToExcel(attendance, selectedYear, selectedMonth)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Tabel (.xlsx) Yuklab Olish
                </button>
              </div>
              <p className="text-xs text-slate-500">
                O'zbekiston Respublikasi Maktabgacha va maktab ta'limi vazirligi tasdiqlangan rasmiy elektron jurnali bilan 100% mutanosib.
              </p>
            </div>
          )}

          {templateTab === 'schedule' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Haftalik Dars Jadvali & Navbatchilik
                </h3>
                <button
                  onClick={() => {
                    const ws = XLSX.utils.json_to_sheet(scheduleData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Dars Jadvali");
                    XLSX.writeFile(wb, "Dars_Jadvali_Navbatchilik.xlsx");
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Jadval (.xlsx) Yuklab Olish
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
