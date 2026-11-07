import React, { useState } from 'react';
import { 
  parseRawStudentList, 
  sortStudents, 
  removeDuplicates, 
  formatFullName, 
  formatPhoneNumber,
  getStudentStats 
} from '../utils/cleaner';
import { exportStudentsToExcel } from '../utils/excelGenerator';
import { generateStudentListDocx } from '../utils/wordGenerator';
import { DEMO_RAW_TEXT } from '../utils/demoData';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { 
  Upload, 
  Sparkles, 
  Trash2, 
  FileSpreadsheet, 
  FileText, 
  Copy, 
  Check, 
  Users, 
  UserCheck, 
  ArrowUpDown,
  Filter
} from 'lucide-react';

export default function CleanerModule({ t, lang }) {
  const [inputText, setInputText] = useState('');
  const [students, setStudents] = useState([]);
  const [genderFilter, setGenderFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Namuna ma'lumotlarni yuklash
  const handleLoadDemo = () => {
    setInputText(DEMO_RAW_TEXT);
    const parsed = parseRawStudentList(DEMO_RAW_TEXT);
    setStudents(parsed);
    setStats(getStudentStats(parsed));
  };

  // Matn kiritilganda parsing qilish
  const handleParse = (text) => {
    const parsed = parseRawStudentList(text);
    setStudents(parsed);
    setStats(getStudentStats(parsed));
  };

  // Saralash
  const handleSort = (type) => {
    const sorted = sortStudents(students, type);
    setStudents(sorted);
  };

  // Dublikatlarni tozalash
  const handleRemoveDuplicates = () => {
    const { unique, countRemoved } = removeDuplicates(students);
    setStudents(unique);
    setStats(getStudentStats(unique));
    alert(`${countRemoved} ta dublikat o'chirildi!`);
  };

  // Standartlashtirish
  const handleStandardize = () => {
    const standardized = students.map(s => ({
      ...s,
      fullName: formatFullName(s.fullName),
      phone: formatPhoneNumber(s.phone)
    }));
    setStudents(standardized);
  };

  // Fayl yuklash (Word .docx yoki Excel .xlsx)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
        handleParse(result.value);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetText = XLSX.utils.sheet_to_csv(firstSheet);
        setInputText(sheetText);
        handleParse(sheetText);
      } else {
        const text = await file.text();
        setInputText(text);
        handleParse(text);
      }
    } catch (err) {
      console.error(err);
      alert("Faylni o'qishda xatolik yuz berdi!");
    } finally {
      setIsProcessing(false);
    }
  };

  // Nusxalash
  const handleCopy = () => {
    const textData = students.map((s, idx) => 
      `${idx + 1}. ${s.fullName} | ${s.birthDate} | ${s.ageText} | ${s.grade} | ${s.phone}`
    ).join('\n');
    navigator.clipboard.writeText(textData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtrlangan o'quvchilar
  const filteredStudents = students.filter(s => {
    if (genderFilter === 'boys') return s.gender === 'male';
    if (genderFilter === 'girls') return s.gender === 'female';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              {t.cleaner.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.cleaner.sub}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleLoadDemo}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-medium text-sm rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              {t.common.demoData}
            </button>
            <button
              onClick={() => { setInputText(''); setStudents([]); setStats(null); }}
              className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Input / Drag-Drop Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tartibsiz Ro'yxat (Matn yoki Fayl)
            </label>
            <label className="cursor-pointer text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              {t.common.chooseFile} (.docx, .xlsx)
              <input type="file" accept=".docx,.xlsx,.xls,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              handleParse(e.target.value);
            }}
            placeholder="O'quvchilar ro'yxatini shu yerga tashlang yoki namunani ko'rish uchun yuqoridagi tugmani bosing..."
            className="w-full flex-1 min-h-[260px] p-4 text-sm font-mono bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 resize-none"
          />

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>{students.length} ta yozuv aniqlandi</span>
            {isProcessing && <span className="text-indigo-500 animate-pulse">{t.common.loading}</span>}
          </div>
        </div>

        {/* Toolbar & Filter Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              Aqlli Filtrlash va Saralash
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
              <button
                onClick={() => handleSort('alphabet_az')}
                className="p-2.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                {t.cleaner.sortAZ}
              </button>
              <button
                onClick={() => handleSort('alphabet_za')}
                className="p-2.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                {t.cleaner.sortZA}
              </button>
              <button
                onClick={() => handleSort('birth_asc')}
                className="p-2.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition text-slate-800 dark:text-slate-200"
              >
                {t.cleaner.sortAgeAsc}
              </button>
              <button
                onClick={() => handleSort('birth_desc')}
                className="p-2.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition text-slate-800 dark:text-slate-200"
              >
                {t.cleaner.sortAgeDesc}
              </button>
              <button
                onClick={handleRemoveDuplicates}
                className="p-2.5 text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl transition"
              >
                {t.cleaner.cleanDuplicates}
              </button>
              <button
                onClick={handleStandardize}
                className="p-2.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl transition"
              >
                {t.cleaner.standardize}
              </button>
            </div>

            {/* Jins bo'yicha filter */}
            <div className="mb-5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                Jins bo'yicha ajratish:
              </label>
              <div className="flex gap-2">
                {['all', 'boys', 'girls'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                      genderFilter === g
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {g === 'all' ? t.cleaner.all : g === 'boys' ? t.cleaner.onlyBoys : t.cleaner.onlyGirls}
                  </button>
                ))}
              </div>
            </div>

            {/* Statistika kartasi */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                  <div className="text-xs text-slate-500">{t.common.total}</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{stats.total}</div>
                </div>
                <div className="text-center border-x border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-blue-500">{t.common.boys}</div>
                  <div className="text-lg font-bold text-blue-600">{stats.boys} ({stats.boysPercent}%)</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-pink-500">{t.common.girls}</div>
                  <div className="text-lg font-bold text-pink-600">{stats.girls} ({stats.girlsPercent}%)</div>
                </div>
              </div>
            )}
          </div>

          {/* Eksport tugmalari */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleCopy}
              disabled={students.length === 0}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-200 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t.common.copied : t.common.copy}
            </button>
            <button
              onClick={() => exportStudentsToExcel(filteredStudents)}
              disabled={students.length === 0}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {t.common.exportExcel}
            </button>
            <button
              onClick={() => generateStudentListDocx(filteredStudents)}
              disabled={students.length === 0}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              {t.common.exportWord}
            </button>
          </div>
        </div>
      </div>

      {/* Jonli tahrirlash (Live Preview) Jadvali */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-indigo-500" />
            Jadval Ko'rinishi (Jonli Natija - {filteredStudents.length} ta o'quvchi)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-3 px-4 w-12 text-center">№</th>
                <th className="py-3 px-4">Familiya Ism Sharifi</th>
                <th className="py-3 px-4">Tug'ilgan sana</th>
                <th className="py-3 px-4 text-center">Yoshi</th>
                <th className="py-3 px-4 text-center">Sinfi</th>
                <th className="py-3 px-4">Telefon raqami</th>
                <th className="py-3 px-4">Manzili</th>
                <th className="py-3 px-4 text-center">Jinsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Ma'lumot mavjud emas. Yuqorida matn kiriting yoki "Namuna ko'rish" tugmasini bosing.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">{s.fullName}</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono">{s.birthDate}</td>
                    <td className="py-2.5 px-4 text-center text-slate-600 dark:text-slate-400">{s.ageText}</td>
                    <td className="py-2.5 px-4 text-center font-semibold text-indigo-600 dark:text-indigo-400">{s.grade}</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono">{s.phone}</td>
                    <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate">{s.address}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        s.gender === 'male'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : s.gender === 'female'
                          ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.gender === 'male' ? "O'g'il" : s.gender === 'female' ? "Qiz" : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
