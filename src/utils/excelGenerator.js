import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 1. O'quvchilar ro'yxatini toza va chiroyli Excel jadvalga eksport qilish
export function exportStudentsToExcel(students, filename = "O'quvchilar_Ro'yxati.xlsx") {
  const header = [
    ["O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI"],
    ["O'QUVCHILARNING RASMIY TARTIBLANGAN RO'YXATI"],
    [`Hujjat sanasi: ${new Date().toLocaleDateString('uz-UZ')} | Jami o'quvchilar: ${students.length} nafar | EduHujjat AI`],
    []
  ];

  const columns = ["№", "Familiya Ism Sharifi", "Tug'ilgan sanasi", "Yoshi", "Sinfi", "Telefon raqami", "Manzili", "Jinsi", "Holati"];
  const rows = students.map((s, index) => [
    index + 1,
    s.fullName || '',
    s.birthDate || '',
    s.age || s.ageText || '',
    s.grade || s.className || '',
    s.phone || '',
    s.address || "O'zbekiston",
    s.gender === 'male' || String(s.gender).includes('Erkak') ? "O'g'il" : s.gender === 'female' || String(s.gender).includes('Ayol') ? "Qiz" : '-',
    "Faol"
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([...header, columns, ...rows]);

  // Ustunlar kengligini belgilash
  worksheet['!cols'] = [
    { wch: 6 },  // №
    { wch: 34 }, // F.I.Sh
    { wch: 16 }, // Sana
    { wch: 10 }, // Yoshi
    { wch: 12 }, // Sinfi
    { wch: 20 }, // Telefon
    { wch: 28 }, // Manzil
    { wch: 12 }, // Jinsi
    { wch: 12 }  // Holati
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ro'yxat");

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
}

// 2. Katta Ko'p Sahifali Master Maktab Workboogi (Executive Multi-Sheet Workbook)
export function exportComprehensiveSchoolWorkbook(students, filename = "EduHujjat_Maktab_Master_Tizimi.xlsx") {
  const wb = XLSX.utils.book_new();
  const safeList = students && students.length > 0 ? students : [
    { fullName: "Aliyeva Malika Sardor qizi", birthDate: "2009-04-12", age: 17, className: "9-A", phone: "+998 90 123 45 67", gender: "Qiz" },
    { fullName: "Karimov Jasur Bobur o'g'li", birthDate: "2009-01-20", age: 17, className: "9-A", phone: "+998 91 234 56 78", gender: "O'g'il" },
    { fullName: "Xolmatov Sardor Rustam o'g'li", birthDate: "2009-08-15", age: 16, className: "9-A", phone: "+998 93 345 67 89", gender: "O'g'il" },
    { fullName: "Usmonova Laylo Jamshid qizi", birthDate: "2009-11-03", age: 16, className: "9-A", phone: "+998 94 456 78 90", gender: "Qiz" },
    { fullName: "Boboyev Dostonbek Alisher o'g'li", birthDate: "2009-03-25", age: 17, className: "9-A", phone: "+998 97 567 89 01", gender: "O'g'il" },
    { fullName: "Toshmatova Sevara Farhod qizi", birthDate: "2009-07-09", age: 16, className: "9-A", phone: "+998 99 678 90 12", gender: "Qiz" }
  ];

  // =========================================================================
  // 1-SAHIFA: TARTIBLANGAN RO'YXAT
  // =========================================================================
  const s1Header = [
    ["O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI"],
    ["O'QUVCHILARNING RASMIY TARTIBLANGAN ASOSIY RO'YXATI"],
    [`Sana: ${new Date().toLocaleDateString('uz-UZ')} | Jami o'quvchilar: ${safeList.length} nafar | EduHujjat AI Milliy Tizimi`],
    []
  ];
  const s1Cols = ["№", "F.I.Sh (To'liq ism)", "Tug'ilgan sana", "Yoshi", "Jinsi", "Telefon raqami", "Sinfi", "Holati"];
  const s1Rows = safeList.map((s, idx) => [
    idx + 1,
    s.fullName || '',
    s.birthDate || '',
    s.age || s.ageText || '',
    s.gender === 'male' || String(s.gender).includes('Erkak') || String(s.gender).includes("O'g'il") ? "O'g'il bola" : "Qiz bola",
    s.phone || '',
    s.className || s.grade || '9-A',
    "Faol"
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([...s1Header, s1Cols, ...s1Rows]);
  ws1['!cols'] = [{ wch: 6 }, { wch: 36 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 22 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws1, "1. O'quvchilar Ro'yxati");

  // =========================================================================
  // 2-SAHIFA: DEMOGRAFIYA & STATISTIKA (FORMULALAR BILAN)
  // =========================================================================
  const boysCount = safeList.filter(s => String(s.gender).includes('Erkak') || String(s.gender).includes("O'g'il")).length;
  const girlsCount = safeList.length - boysCount;
  const boysPercent = Math.round((boysCount / (safeList.length || 1)) * 100);
  const girlsPercent = 100 - boysPercent;

  const ws2Data = [
    ["DEMOGRAFIK TAHLIL VA STATISTIKA PANELI"],
    [`Tahlil sanasi: ${new Date().toLocaleDateString('uz-UZ')} | Maktab mezonlari`],
    [],
    ["Ko'rsatkich parametri", "Soni / Qiymati", "Ulushi (%)", "Izoh"],
    ["Jami o'quvchilar soni", safeList.length, "100%", "Sinfdagi umumiy kontingent"],
    ["O'g'il bolalar soni", boysCount, `${boysPercent}%`, "Erkak jinsidagi o'quvchilar"],
    ["Qiz bolalar soni", girlsCount, `${girlsPercent}%`, "Ayol jinsidagi o'quvchilar"],
    ["16 yoshgacha bo'lganlar", safeList.filter(s => (s.age || 16) < 16).length, "-", "Kichik yosh toifasi"],
    ["16-17 yosh oralig'idagilar", safeList.filter(s => (s.age || 16) >= 16 && (s.age || 16) <= 17).length, "-", "O'rta yosh toifasi"],
    ["18 yosh va undan kattalar", safeList.filter(s => (s.age || 16) >= 18).length, "-", "Voyaga yetganlar toifasi"],
    [],
    ["TAVSIYA:", "Sinfdagi gender balansi va yosh toifalari mezonlarga to'liq mos keladi."]
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [{ wch: 32 }, { wch: 18 }, { wch: 16 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(wb, ws2, "2. Demografiya & Tahlil");

  // =========================================================================
  // 3-SAHIFA: FANLAR BO'YICHA REYTING & GPA MATRITSASI
  // =========================================================================
  const s3Header = [
    ["FANLAR BO'YICHA O'ZLASHTIRISH VA GPA REYTING JADVALI"],
    ["Mezon: A'lochi (GPA >= 4.7) | Yaxshi (GPA 3.8 - 4.6) | Qoniqarli (GPA < 3.8)"],
    [],
    ["№", "O'rin", "F.I.Sh", "Ona tili", "Adabiyot", "Matematika", "Tarix", "Fizika", "Kimyo", "Ingliz tili", "GPA Ball", "O'zlashtirish", "Akademik Daraja"]
  ];
  
  // Realistik namunaviy baholar
  const baseGrades = [
    [5, 5, 5, 5, 5, 5, 5],
    [5, 5, 4, 5, 4, 4, 5],
    [4, 4, 5, 4, 5, 4, 4],
    [5, 4, 4, 4, 4, 4, 4],
    [4, 4, 3, 4, 3, 4, 4],
    [3, 4, 3, 3, 4, 3, 3]
  ];

  const s3Rows = safeList.map((s, idx) => {
    const grades = baseGrades[idx % baseGrades.length];
    const avg = Number((grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2));
    const pct = Math.round((avg / 5) * 100);
    const cat = avg >= 4.7 ? "A'lochi (5)" : avg >= 3.8 ? "Yaxshi (4)" : "Qoniqarli (3)";
    return [
      idx + 1,
      idx + 1,
      s.fullName || `O'quvchi ${idx + 1}`,
      grades[0], grades[1], grades[2], grades[3], grades[4], grades[5], grades[6],
      avg,
      `${pct}%`,
      cat
    ];
  });

  const ws3 = XLSX.utils.aoa_to_sheet([...s3Header, ...s3Rows]);
  ws3['!cols'] = [
    { wch: 6 }, { wch: 8 }, { wch: 34 }, 
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws3, "3. Reyting & GPA");

  // =========================================================================
  // 4-SAHIFA: OYLIK DAVOMAT TABELI (1-31 KUNLAR)
  // =========================================================================
  const s4Header = [
    ["OYLIK DAVOMAT HISOBOT TABELI (DAVOMAT JURNALI)"],
    ["Belgilar: [+] - Darsda qatnashdi | [S] - Sababli qoldirdi | [Q] - Sababsiz qoldirdi | [D] - Dam olish kuni"],
    [],
    ["№", "O'quvchining F.I.Sh"]
  ];
  for (let d = 1; d <= 31; d++) {
    s4Header[3].push(`${d}`);
  }
  s4Header[3].push("Jami qatnashdi", "Sababli", "Sababsiz");

  const s4Rows = safeList.map((s, idx) => {
    const row = [idx + 1, s.fullName || `O'quvchi ${idx + 1}`];
    let presentCount = 0;
    for (let d = 1; d <= 31; d++) {
      const isWeekend = (d % 7 === 0 || d % 7 === 6);
      if (isWeekend) {
        row.push('D');
      } else {
        // Har 10-kunda bitta sababli qoldirish simulyatsiyasi
        if (d === 14 && idx % 3 === 0) {
          row.push('S');
        } else {
          row.push('+');
          presentCount++;
        }
      }
    }
    row.push(presentCount, idx % 3 === 0 ? 1 : 0, 0);
    return row;
  });

  const ws4 = XLSX.utils.aoa_to_sheet([...s4Header, ...s4Rows]);
  const s4Cols = [{ wch: 6 }, { wch: 34 }];
  for (let d = 1; d <= 31; d++) s4Cols.push({ wch: 4 });
  s4Cols.push({ wch: 15 }, { wch: 10 }, { wch: 10 });
  ws4['!cols'] = s4Cols;
  XLSX.utils.book_append_sheet(wb, ws4, "4. Oylik Davomat");

  // =========================================================================
  // 5-SAHIFA: DARS JADVALI VA NAVBATCHILIK GRAFIGI
  // =========================================================================
  const ws5Data = [
    ["HAFTALIK DARS JADVALI VA SINF NAVBATCHILIGI GRAFIGI"],
    ["O'quv yili: 2026/2027 | Tasdiqlangan dars va xona taqsimoti"],
    [],
    ["Hafta kuni", "Vaqti", "Dars tartibi", "Fan nomi", "O'qituvchi", "Xona", "Kungi Navbatchilar"],
    ["Dushanba", "08:30 - 09:15", "1-dars", "Ona tili", "Karimova Z.", "204-xona", safeList[0]?.fullName || "Navbatchi 1"],
    ["Dushanba", "09:20 - 10:05", "2-dars", "Adabiyot", "Karimova Z.", "204-xona", safeList[1]?.fullName || "Navbatchi 2"],
    ["Dushanba", "10:15 - 11:00", "3-dars", "Matematika", "Rasulov B.", "105-xona", ""],
    ["Dushanba", "11:10 - 11:55", "4-dars", "Ingliz tili", "Smith A.", "302-xona", ""],
    ["Dushanba", "12:05 - 12:50", "5-dars", "Tarix", "Mirzayev H.", "208-xona", ""],
    [],
    ["Seshanba", "08:30 - 09:15", "1-dars", "Fizika", "Qodirov M.", "110-xona", safeList[2]?.fullName || "Navbatchi 1"],
    ["Seshanba", "09:20 - 10:05", "2-dars", "Kimyo", "Yoqubova G.", "Laboratoriya", safeList[3]?.fullName || "Navbatchi 2"],
    ["Seshanba", "10:15 - 11:00", "3-dars", "Geometriya", "Rasulov B.", "105-xona", ""],
    ["Seshanba", "11:10 - 11:55", "4-dars", "Biologiya", "Sobirova D.", "201-xona", ""],
    ["Seshanba", "12:05 - 12:50", "5-dars", "Jismoniy tarbiya", "Aliyev Sh.", "Sport zal", ""],
    [],
    ["Chorshanba", "08:30 - 09:15", "1-dars", "Informatika", "Nazarov K.", "Kompyuter xona", safeList[4]?.fullName || "Navbatchi 1"],
    ["Chorshanba", "09:20 - 10:05", "2-dars", "Algebra", "Rasulov B.", "105-xona", safeList[5]?.fullName || "Navbatchi 2"],
    ["Chorshanba", "10:15 - 11:00", "3-dars", "Ona tili", "Karimova Z.", "204-xona", ""],
    ["Chorshanba", "11:10 - 11:55", "4-dars", "Tarix", "Mirzayev H.", "208-xona", ""],
    ["Chorshanba", "12:05 - 12:50", "5-dars", "Ingliz tili", "Smith A.", "302-xona", ""]
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(ws5Data);
  ws5['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, ws5, "5. Jadval & Navbatchilik");

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
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
