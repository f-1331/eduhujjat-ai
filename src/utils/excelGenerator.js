import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// O'quvchilar ro'yxatini toza Excel jadvalga eksport qilish
export function exportStudentsToExcel(students, filename = "O'quvchilar_Ro'yxati.xlsx") {
  const data = students.map((s, index) => ({
    "№": index + 1,
    "Familiya Ism Sharifi": s.fullName,
    "Tug'ilgan sanasi": s.birthDate || '',
    "Yoshi": s.ageText || '',
    "Sinfi": s.grade || '',
    "Telefon raqami": s.phone || '',
    "Manzili": s.address || '',
    "Jinsi": s.gender === 'male' ? "O'g'il" : s.gender === 'female' ? "Qiz" : '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Ustunlar kengligini belgilash
  worksheet['!cols'] = [
    { wch: 5 },  // №
    { wch: 32 }, // F.I.Sh
    { wch: 16 }, // Sana
    { wch: 10 }, // Yoshi
    { wch: 10 }, // Sinfi
    { wch: 20 }, // Telefon
    { wch: 30 }, // Manzil
    { wch: 10 }  // Jinsi
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ro'yxat");

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
}

// Avto-Reyting va Baholar hisobi
export function calculateGradesRanking(studentsWithGrades) {
  const ranked = studentsWithGrades.map((student, idx) => {
    const subjects = student.subjects || {};
    const values = Object.values(subjects).map(v => Number(v) || 0);
    const count = values.length;
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const gpa = count > 0 ? Number((sum / count).toFixed(2)) : 0;
    const percent = count > 0 ? Math.round((gpa / 5) * 100) : 0;

    let category = "Qoniqarli (3)";
    if (gpa >= 4.7) {
      category = "A'lochi (5)";
    } else if (gpa >= 3.8) {
      category = "Yaxshi (4)";
    }

    return {
      ...student,
      gpa,
      percent,
      category
    };
  });

  // GPA bo'yicha saralash (eng yuqoridan pastga)
  ranked.sort((a, b) => b.gpa - a.gpa);

  // O'rinlarni belgilash
  return ranked.map((s, index) => ({
    ...s,
    rank: index + 1
  }));
}

// Reyting va baholar jadvalini Excelga eksport qilish
export function exportGradesToExcel(rankedData, filename = "O'quvchilar_Reyting_Baholar.xlsx") {
  const data = rankedData.map(item => {
    const row = {
      "O'rni": item.rank,
      "F.I.Sh": item.name,
      ...item.subjects,
      "O'rtacha Ball (GPA)": item.gpa,
      "O'zlashtirish (%)": `${item.percent}%`,
      "Darajasi": item.category
    };
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Baholar Reytingi");

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
}

// Oylik Davomat (Tabel) Generatori
export function generateMonthlyAttendance(year, month, studentNames = []) {
  // month: 1-12
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dayOfWeek = date.getDay(); // 0 - Yakshanba, 6 - Shanba
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    days.push({
      day: d,
      dayName: ['Ya', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha'][dayOfWeek],
      isWeekend
    });
  }

  const defaultNames = studentNames.length > 0 ? studentNames : [
    "Aliyeva Malika", "Karimov Jasur", "Xolmatov Sardor", "Usmonova Laylo",
    "Boboyev Dostonbek", "Toshmatova Sevara", "G'ulomov Umidjon", "Choriyev Bekzod"
  ];

  const rows = defaultNames.map((name, idx) => {
    const row = {
      "№": idx + 1,
      "O'quvchi F.I.Sh": name
    };
    days.forEach(d => {
      row[`${d.day}`] = d.isWeekend ? 'D' : '+';
    });
    row["Jami qatnashgan"] = days.filter(d => !d.isWeekend).length;
    row["Sababli"] = 0;
    row["Sababsiz"] = 0;
    return row;
  });

  return { days, rows, year, month };
}

export function exportAttendanceToExcel(tabelData, filename = "Oylik_Davomat_Tabeli.xlsx") {
  const worksheet = XLSX.utils.json_to_sheet(tabelData.rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Tabel_${tabelData.month}_${tabelData.year}`);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
}

// Dars jadvali va Navbatchilik grafigi generatori
export function generateWeeklyScheduleAndDuty(studentNames = []) {
  const weekDays = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  const periods = [
    { time: "08:30 - 09:15", name: "1-dars" },
    { time: "09:20 - 10:05", name: "2-dars" },
    { time: "10:15 - 11:00", name: "3-dars" },
    { time: "11:10 - 11:55", name: "4-dars" },
    { time: "12:05 - 12:50", name: "5-dars" },
    { time: "12:55 - 13:40", name: "6-dars" }
  ];

  const subjectsPool = [
    "Ona tili", "Adabiyot", "Matematika", "Algebra", "Geometriya", 
    "Fizika", "Kimyo", "Biologiya", "Tarix", "Ingliz tili", "Informatika", "Jismoniy tarbiya"
  ];

  const schedule = weekDays.map((day, dIdx) => {
    return {
      day,
      lessons: periods.map((p, pIdx) => ({
        period: p.name,
        time: p.time,
        subject: subjectsPool[(dIdx * 2 + pIdx) % subjectsPool.length]
      }))
    };
  });

  // Navbatchilar taqsimoti (har kunga 2 tadan o'quvchi)
  const pool = studentNames.length >= 6 ? studentNames : [
    "Aliyeva Malika", "Karimov Jasur", "Xolmatov Sardor", "Usmonova Laylo",
    "Boboyev Dostonbek", "Toshmatova Sevara", "G'ulomov Umid", "Choriyev Bekzod",
    "O'ktamov Aziz", "Qodirova Zarnigor", "Jo'rayev Eldor", "Rahimova Madina"
  ];

  const dutySchedule = weekDays.map((day, idx) => ({
    day,
    duty1: pool[(idx * 2) % pool.length] || '-',
    duty2: pool[(idx * 2 + 1) % pool.length] || '-'
  }));

  return { schedule, dutySchedule };
}
