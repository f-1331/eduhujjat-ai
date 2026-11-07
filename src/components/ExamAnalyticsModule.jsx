import React, { useState } from 'react';
import { BarChart3, PieChart, Sparkles, AlertTriangle, CheckCircle, TrendingUp, Download } from 'lucide-react';

export default function ExamAnalyticsModule() {
  const [examData, setExamData] = useState([
    { questionId: 1, topic: "O'zbekiston mustaqilligi tarixi", correctCount: 28, totalStudents: 30, percent: 93, difficulty: "Oson" },
    { questionId: 2, topic: "Amir Temur tuzuklari va harbiy yurishlari", correctCount: 22, totalStudents: 30, percent: 73, difficulty: "O'rtacha" },
    { questionId: 3, topic: "Alisher Navoiy 'Xamsa' dostonlari tahlili", correctCount: 14, totalStudents: 30, percent: 46, difficulty: "Qiyin" },
    { questionId: 4, topic: "Kimyoviy elementlar davriy qonuniyati", correctCount: 25, totalStudents: 30, percent: 83, difficulty: "Oson" },
    { questionId: 5, topic: "Kvadrat tenglamalar va Viyet teoremasi", correctCount: 11, totalStudents: 30, percent: 36, difficulty: "O'ta qiyin" },
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-sky-500" />
              Imtihon va Test Natijalari Diagnostikasi
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Savollar tahlili (Item Analysis), qiyinlik darajalari va o'quvchilar bo'shliqlarini aniqlash
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Savollar Kesimida O'zlashtirish Diagrammasi
          </h3>

          <div className="space-y-4 pt-2">
            {examData.map((item) => (
              <div key={item.questionId} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.questionId}-savol: {item.topic}
                  </span>
                  <span className="font-mono text-slate-500">
                    {item.correctCount}/{item.totalStudents} ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.percent >= 80 ? 'bg-emerald-500' :
                      item.percent >= 60 ? 'bg-sky-500' :
                      item.percent >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className={`font-semibold ${
                    item.difficulty === 'Oson' ? 'text-emerald-600' :
                    item.difficulty === 'O\'rtacha' ? 'text-sky-600' :
                    item.difficulty === 'Qiyin' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    Darajasi: {item.difficulty}
                  </span>
                  <span className="text-slate-400">
                    {item.percent < 50 ? '⚠️ Qayta o\'tish tavsiya etiladi' : '✓ Yetarli'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pedagogik Xulosa */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Pedagogik Diagnostika Xulosasi
            </h3>

            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-300 mb-3">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Aniqlangan Bo'shliqlar:
              </div>
              5-savol (Kvadrat tenglamalar) va 3-savol (Navoiy dostonlari) bo'yicha o'zlashtirish 50% dan past.
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p><b>Tavsiya:</b></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Ushbu mavzular bo'yicha qo'shimcha amaliy dars tashkil etish;</li>
                <li>Dars boshida 5 daqiqalik blits-mashg'ulotlar o'tkazish;</li>
                <li>O'quvchilarga interaktiv kartochkalar tarqatish.</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <div className="text-xs text-slate-500 text-center">
              Umumiy o'rtacha sinf samaradorligi: <b className="text-emerald-600 text-sm">66.8%</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
