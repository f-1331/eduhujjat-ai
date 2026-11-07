import React, { useState } from 'react';
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
  Trophy, 
  Calendar, 
  Clock, 
  Sparkles, 
  Download,
  BarChart3
} from 'lucide-react';

export default function ExcelModule({ t }) {
  const [activeTab, setActiveTab] = useState('grades'); // 'grades', 'attendance', 'schedule'
  
  // Baholar va Reyting state
  const [gradesData, setGradesData] = useState(() => calculateGradesRanking(DEMO_GRADES));
  
  // Davomat state
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [attendance, setAttendance] = useState(() => 
    generateMonthlyAttendance(currentDate.getFullYear(), currentDate.getMonth() + 1)
  );

  // Jadval va Navbatchilik state
  const [scheduleData, setScheduleData] = useState(() => generateWeeklyScheduleAndDuty());

  // Davomatni yangilash
  const handleUpdateAttendance = (y, m) => {
    setSelectedYear(y);
    setSelectedMonth(m);
    setAttendance(generateMonthlyAttendance(y, m));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
              {t.excel.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.excel.sub}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'grades' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.excel.gradesTab}
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'attendance' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.excel.attendanceTab}
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'schedule' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.excel.scheduleTab}
            </button>
          </div>
        </div>
      </div>

      {/* 1-TAB: BAHOLAR VA REYTING */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <Trophy className="w-5 h-5 text-amber-500" />
              O'quvchilar Reytingi (GPA & O'zlashtirish)
            </div>
            <button
              onClick={() => exportGradesToExcel(gradesData)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              {t.common.exportExcel}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="py-3 px-4 w-12 text-center">O'rni</th>
                    <th className="py-3 px-4">O'quvchi F.I.Sh</th>
                    <th className="py-3 px-4 text-center">Ona tili</th>
                    <th className="py-3 px-4 text-center">Matematika</th>
                    <th className="py-3 px-4 text-center">Fizika</th>
                    <th className="py-3 px-4 text-center">Tarix</th>
                    <th className="py-3 px-4 text-center">Ingliz tili</th>
                    <th className="py-3 px-4 text-center font-bold text-emerald-600">GPA (O'rtacha)</th>
                    <th className="py-3 px-4 text-center">O'zlashtirish %</th>
                    <th className="py-3 px-4 text-center">Darajasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {gradesData.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          s.rank === 1 ? 'bg-amber-100 text-amber-700 font-extrabold' :
                          s.rank === 2 ? 'bg-slate-200 text-slate-700' :
                          s.rank === 3 ? 'bg-amber-50 text-amber-900' : 'text-slate-500'
                        }`}>
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                      <td className="py-3 px-4 text-center font-semibold">{s.subjects?.onaTili}</td>
                      <td className="py-3 px-4 text-center font-semibold">{s.subjects?.matematika}</td>
                      <td className="py-3 px-4 text-center font-semibold">{s.subjects?.fizika}</td>
                      <td className="py-3 px-4 text-center font-semibold">{s.subjects?.tarix}</td>
                      <td className="py-3 px-4 text-center font-semibold">{s.subjects?.inglizTili}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 text-sm">{s.gpa}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="w-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full ${s.percent >= 90 ? 'bg-emerald-500' : s.percent >= 75 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                            style={{ width: `${s.percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{s.percent}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.category.includes("A'lochi") ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          s.category.includes("Yaxshi") ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {s.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2-TAB: DAVOMAT TABELI */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => handleUpdateAttendance(selectedYear, parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-slate-100 border-none focus:ring-2 focus:ring-indigo-500"
                >
                  {["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"].map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => handleUpdateAttendance(parseInt(e.target.value, 10), selectedMonth)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-slate-100 border-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}-yil</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => exportAttendanceToExcel(attendance)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Tabelni Excelda yuklash
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="py-2.5 px-3 text-left w-36">F.I.Sh</th>
                    {attendance.days.map((d) => (
                      <th 
                        key={d.day} 
                        className={`py-1.5 px-1 min-w-[24px] ${d.isWeekend ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-bold' : ''}`}
                      >
                        <div>{d.day}</div>
                        <div className="text-[9px] opacity-70">{d.dayName}</div>
                      </th>
                    ))}
                    <th className="py-2.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 font-bold">Jami</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendance.rows.map((row) => (
                    <tr key={row["№"]} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 text-left font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {row["O'quvchi F.I.Sh"]}
                      </td>
                      {attendance.days.map((d) => (
                        <td 
                          key={d.day} 
                          className={`py-2 px-1 ${d.isWeekend ? 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 font-bold' : 'text-slate-600'}`}
                        >
                          {row[`${d.day}`]}
                        </td>
                      ))}
                      <td className="py-2 px-2 font-bold text-emerald-600">{row["Jami qatnashgan"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3-TAB: DARS JADVALI VA NAVBATCHILIK */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduleData.schedule.map((item, idx) => (
              <div key={item.day} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    {item.day}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-semibold">
                    Navbatchi: {scheduleData.dutySchedule[idx]?.duty1}
                  </span>
                </div>
                <div className="space-y-2">
                  {item.lessons.map((les, lIdx) => (
                    <div key={lIdx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">{lIdx + 1}.</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{les.subject}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{les.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
