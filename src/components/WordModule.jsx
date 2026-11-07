import React, { useState } from 'react';
import { 
  generateTestDocx, 
  generateLessonPlanDocx, 
  generateReferatDocx, 
  generateOfficialDocumentDocx 
} from '../utils/wordGenerator';
import { DEMO_TEST_QUESTIONS } from '../utils/demoData';
import { 
  FileText, 
  BookOpen, 
  CheckSquare, 
  GraduationCap, 
  FileCheck, 
  Download, 
  Sparkles 
} from 'lucide-react';

export default function WordModule({ t }) {
  const [activeTab, setActiveTab] = useState('test'); // 'test', 'lesson', 'referat', 'official'
  const [isDownloading, setIsDownloading] = useState(false);

  // 1. Test sozlamalari
  const [testTopic, setTestTopic] = useState("O'zbekiston tarixi va ma'naviyat");
  const [testVariants, setTestVariants] = useState(2);

  // 2. Dars ishlanmasi sozlamalari
  const [lessonInfo, setLessonInfo] = useState({
    subject: "Ona tili va adabiyot",
    topic: "So'z turkumlari va otning ma'no turlari",
    grade: "7-A sinf",
    teacherName: "Xolmatov Alisher",
    date: "2026-yil"
  });

  // 3. Referat sozlamalari
  const [referatInfo, setReferatInfo] = useState({
    institution: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI",
    university: "TOSHKENT SHAHAR PEDAGOGIKA MARKAZI",
    faculty: "Aniq va tabiiy fanlar kafedrasi",
    subject: "Informatika va axborot texnologiyalari",
    topic: "Sun'iy intellekt texnologiyalarining maktab ta'limidagi o'rni",
    student: "Aliyeva Malika",
    teacher: "Dots. Rahimov Sh. K.",
    city: "TOSHKENT - 2026"
  });

  // 4. Rasmiy hujjat sozlamalari
  const [officialType, setOfficialType] = useState('ariza'); // 'ariza', 'tavsifnoma', 'bayonnoma'
  const [officialData, setOfficialData] = useState({
    schoolName: "142-sonli umumiy o'rta ta'lim maktabi",
    directorName: "Sobirov A. M.",
    senderName: "Karimova Z. T. (Ota-ona)",
    studentName: "Karimov Jasur",
    grade: "9-A",
    date: "2026-yil 10-fevral"
  });

  const handleExportTest = async () => {
    setIsDownloading(true);
    try {
      await generateTestDocx(testTopic, DEMO_TEST_QUESTIONS, testVariants, `Nazorat_Testlari_${testTopic.slice(0, 15)}.docx`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportLesson = async () => {
    setIsDownloading(true);
    try {
      await generateLessonPlanDocx(lessonInfo, `Dars_Ishlanmasi_${lessonInfo.subject}.docx`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportReferat = async () => {
    setIsDownloading(true);
    try {
      await generateReferatDocx(referatInfo, `Mustaqil_Ish_${referatInfo.student}.docx`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportOfficial = async () => {
    setIsDownloading(true);
    try {
      await generateOfficialDocumentDocx(officialType, officialData, `${officialType.toUpperCase()}_hujjati.docx`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              {t.word.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.word.sub}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'test' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.word.testTab}
            </button>
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'lesson' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.word.lessonTab}
            </button>
            <button
              onClick={() => setActiveTab('referat')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'referat' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.word.referatTab}
            </button>
            <button
              onClick={() => setActiveTab('official')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'official' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.word.officialTab}
            </button>
          </div>
        </div>
      </div>

      {/* 1-TAB: VARIANTLI TEST GENERATORI */}
      {activeTab === 'test' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              Test Parametrlari
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                Fan va Mavzu nomi:
              </label>
              <input
                type="text"
                value={testTopic}
                onChange={(e) => setTestTopic(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                Variantlar soni (ko'chirishni oldini olish):
              </label>
              <div className="flex gap-2">
                {[2, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setTestVariants(num)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                      testVariants === num
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {num} ta Variant (A, B{num === 4 ? ', C, D' : ''})
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl text-xs text-blue-700 dark:text-blue-300">
              💡 Har bir variantda savollar va A, B, C, D javoblar o'rni avtomatik aralashtiriladi va oxirida o'qituvchi uchun <b>Javoblar Kaliti</b> joylanadi.
            </div>

            <button
              onClick={handleExportTest}
              disabled={isDownloading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Tayyor Testni Word (.docx) yuklash
            </button>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Savollar Namunasi (Jami {DEMO_TEST_QUESTIONS.length} ta savol tayyor):
            </h4>
            <div className="space-y-3">
              {DEMO_TEST_QUESTIONS.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {idx + 1}. {q.question}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={oIdx === 0 ? "font-medium text-emerald-600 dark:text-emerald-400" : ""}>
                        {['A', 'B', 'C', 'D'][oIdx]}) {opt} {oIdx === 0 && "✓"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2-TAB: 45 DAQIQALIK DARS ISHLANMASI */}
      {activeTab === 'lesson' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Namunaviy 45 daqiqalik Dars Ishlanmasi (Konspekt)
              </h3>
              <p className="text-xs text-slate-500 mt-1">Maktabgacha va maktab ta'limi vazirligi andozasida</p>
            </div>
            <button
              onClick={handleExportLesson}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Konspektni Word (.docx) yuklash
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Fan nomi:</label>
              <input
                type="text"
                value={lessonInfo.subject}
                onChange={(e) => setLessonInfo({ ...lessonInfo, subject: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Dars mavzusi:</label>
              <input
                type="text"
                value={lessonInfo.topic}
                onChange={(e) => setLessonInfo({ ...lessonInfo, topic: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Sinf:</label>
              <input
                type="text"
                value={lessonInfo.grade}
                onChange={(e) => setLessonInfo({ ...lessonInfo, grade: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">O'qituvchi F.I.Sh:</label>
              <input
                type="text"
                value={lessonInfo.teacherName}
                onChange={(e) => setLessonInfo({ ...lessonInfo, teacherName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Dars bosqichlari ko'rinishi */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-4 p-3 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              <div>Bosqich</div>
              <div>Vaqt</div>
              <div className="col-span-2">Asosiy mazmuni</div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 p-3 space-y-2">
              <div className="grid grid-cols-4 text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-800 dark:text-slate-200">1. Tashkiliy qism</span>
                <span>3 daqiqa</span>
                <span className="col-span-2">Davomatni aniqlash, o'quv qurollarini tekshirish, psixologik iqlim.</span>
              </div>
              <div className="grid grid-cols-4 text-slate-600 dark:text-slate-400 pt-2">
                <span className="font-medium text-slate-800 dark:text-slate-200">2. O'tilgan mavzuni so'rash</span>
                <span>7 daqiqa</span>
                <span className="col-span-2">Tezkor savol-javob, blits-savollar, uy vazifasini tahlil qilish.</span>
              </div>
              <div className="grid grid-cols-4 text-slate-600 dark:text-slate-400 pt-2">
                <span className="font-medium text-slate-800 dark:text-slate-200">3. Yangi mavzu bayoni</span>
                <span>20 daqiqa</span>
                <span className="col-span-2">Mavzuni slaydlar, ko'rgazmalar va amaliy misollar bilan tushuntirish.</span>
              </div>
              <div className="grid grid-cols-4 text-slate-600 dark:text-slate-400 pt-2">
                <span className="font-medium text-slate-800 dark:text-slate-200">4. Mustahkamlash</span>
                <span>10 daqiqa</span>
                <span className="col-span-2">Interaktiv mashqlar, guruhlarda ishlash, test topshiriqlari.</span>
              </div>
              <div className="grid grid-cols-4 text-slate-600 dark:text-slate-400 pt-2">
                <span className="font-medium text-slate-800 dark:text-slate-200">5. Baholash va vazifa</span>
                <span>5 daqiqa</span>
                <span className="col-span-2">O'quvchilarni rag'batlantirish, uyga vazifa berish va izohlash.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-TAB: GOST STANDARTIDAGI REFERAT */}
      {activeTab === 'referat' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
                GOST Standartidagi Referat va Mustaqil Ish
              </h3>
              <p className="text-xs text-slate-500 mt-1">Times New Roman 14pt, 1.5 interval, Titul, Mundarija, Xulosa va Adabiyotlar</p>
            </div>
            <button
              onClick={handleExportReferat}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Referatni Word (.docx) yuklash
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Muassasa / Maktab / Universitet:</label>
              <input
                type="text"
                value={referatInfo.university}
                onChange={(e) => setReferatInfo({ ...referatInfo, university: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Mavzu:</label>
              <input
                type="text"
                value={referatInfo.topic}
                onChange={(e) => setReferatInfo({ ...referatInfo, topic: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Bajardi (O'quvchi / Talaba):</label>
              <input
                type="text"
                value={referatInfo.student}
                onChange={(e) => setReferatInfo({ ...referatInfo, student: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Qabul qildi (O'qituvchi):</label>
              <input
                type="text"
                value={referatInfo.teacher}
                onChange={(e) => setReferatInfo({ ...referatInfo, teacher: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4-TAB: RASMIY XAT VA ARIZALAR */}
      {activeTab === 'official' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                Rasmiy Maktab Hujjatlari Shablonlari
              </h3>
              <p className="text-xs text-slate-500 mt-1">Ariza, Tavsifnoma (xarakteristika), Majlis bayonnomasi</p>
            </div>
            <button
              onClick={handleExportOfficial}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Hujjatni Word (.docx) yuklash
            </button>
          </div>

          <div className="flex gap-2">
            {[
              { id: 'ariza', name: "Direktor nomiga Ariza" },
              { id: 'tavsifnoma', name: "O'quvchiga Tavsifnoma" },
              { id: 'bayonnoma', name: "Majlis Bayonnomasi" }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setOfficialType(d.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                  officialType === d.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Shablon matni namunasi:
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              {officialType === 'ariza' && (
                <div>
                  <div className="text-right mb-4">
                    Maktab direktori {officialData.directorName} ga<br/>
                    {officialData.senderName} dan
                  </div>
                  <div className="text-center font-bold text-sm my-3">ARIZA</div>
                  <div>
                    Mening farzandim {officialData.studentName}ni oilaviy sharoitimiz sababli dars mashg'ulotlaridan ruxsat berishingizni so'rayman...
                  </div>
                </div>
              )}
              {officialType === 'tavsifnoma' && (
                <div>
                  <div className="text-center font-bold text-sm my-3">TAVSIFNOMA</div>
                  <div>
                    {officialData.schoolName}ning {officialData.grade} sinf o'quvchisi {officialData.studentName}ga: Mazkur o'quvchi maktabda o'qish davrida o'zini namunali xulq-atvorga ega, tirishqoq o'quvchi sifatida namoyon etdi...
                  </div>
                </div>
              )}
              {officialType === 'bayonnoma' && (
                <div>
                  <div className="text-center font-bold text-sm my-3">OTA-ONALAR MAJLISI BAYONNOMASI</div>
                  <div>
                    Kun tartibi: O'quvchilarning choraklik o'zlashtirish ko'rsatkichlari, maktab formasi va darsdan tashqari mashg'ulotlar nazorati to'g'risida...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
