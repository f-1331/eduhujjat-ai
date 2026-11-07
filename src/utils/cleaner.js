// O'zbek tili uchun alifbo tartibi indekslari
// A, B, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, X, Y, Z, O', G', Sh, Ch
const UZ_ALPHABET_ORDER = [
  'a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z',
  "o'", "g'", "sh", "ch"
];

// O'zbekcha matnni alifboga solishtirish uchun kalit generatsiya qilish
export function getUzbekSortKey(str) {
  if (!str) return '';
  let s = str.toLowerCase()
    .replace(/[ʻʼ`‘’]/g, "'")
    .trim();

  // Birikmalarni bitta maxsus belgiga o'giramiz, shunda saralashda to'g'ri joylashadi
  // Alifboda: z dan keyin o', g', sh, ch
  s = s.replace(/o'/g, '{o_tilde}')
       .replace(/g'/g, '{g_tilde}')
       .replace(/sh/g, '{sh_code}')
       .replace(/ch/g, '{ch_code}');

  return s;
}

export function compareUzbek(a, b) {
  const keyA = getUzbekSortKey(a);
  const keyB = getUzbekSortKey(b);
  return keyA.localeCompare(keyB, 'uz');
}

// Ism-familiyani standartlashtirish: "aliyeva malika anvar qizi" -> "Aliyeva Malika Anvar qizi"
export function formatFullName(rawName) {
  if (!rawName) return '';
  // Ortiqcha probellarni tozalash
  const cleaned = rawName.trim().replace(/\s+/g, ' ');
  const words = cleaned.split(' ');

  const formatted = words.map(w => {
    const lw = w.toLowerCase().replace(/[ʻʼ`‘’]/g, "'");
    if (lw === "o'g'li" || lw === "o`g`li" || lw === "oʻgʻli") return "o'g'li";
    if (lw === "qizi") return "qizi";
    
    // Bosh harfni katta qilish, agar o' yoki g' bilan boshlansa O' yoki G' qilish
    if (lw.startsWith("o'") || lw.startsWith("o`")) {
      return "O'" + lw.slice(2);
    }
    if (lw.startsWith("g'") || lw.startsWith("g`")) {
      return "G'" + lw.slice(2);
    }
    if (lw.startsWith("sh")) {
      return "Sh" + lw.slice(2);
    }
    if (lw.startsWith("ch")) {
      return "Ch" + lw.slice(2);
    }
    return lw.charAt(0).toUpperCase() + lw.slice(1);
  });

  return formatted.join(' ');
}

// Telefon raqamini +998 (XX) XXX-XX-XX formatiga keltirish
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  // Faqat raqamlarni ajratib olish
  const digits = phone.replace(/\D/g, '');
  
  let p = digits;
  if (p.length === 9) {
    p = '998' + p;
  }
  if (p.length === 12 && p.startsWith('998')) {
    const code = p.slice(3, 5);
    const p1 = p.slice(5, 8);
    const p2 = p.slice(8, 10);
    const p3 = p.slice(10, 12);
    return `+998 (${code}) ${p1}-${p2}-${p3}`;
  }
  return phone.trim();
}

// Sanadan yoshni hisoblash (yil, oy, kun)
export function calculateAge(birthDateStr) {
  if (!birthDateStr) return { age: null, text: '' };
  
  // Formatlar: YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY, yoki shunchaki YYYY
  let dateObj = null;
  const dotMatch = birthDateStr.match(/^(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})$/);
  if (dotMatch) {
    const day = parseInt(dotMatch[1], 10);
    const month = parseInt(dotMatch[2], 10) - 1;
    const year = parseInt(dotMatch[3], 10);
    dateObj = new Date(year, month, day);
  } else {
    const isoMatch = birthDateStr.match(/^(\d{4})[\.\/-](\d{1,2})[\.\/-](\d{1,2})$/);
    if (isoMatch) {
      dateObj = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
    } else {
      const yearOnly = birthDateStr.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearOnly) {
        dateObj = new Date(parseInt(yearOnly[1], 10), 0, 1);
      }
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return { age: null, text: '-' };
  }

  const today = new Date();
  let age = today.getFullYear() - dateObj.getFullYear();
  const m = today.getMonth() - dateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateObj.getDate())) {
    age--;
  }
  return { age, text: `${age} yosh` };
}

// Jinsni aniqlash
export function detectGender(fullName) {
  if (!fullName) return 'unknown';
  const name = fullName.toLowerCase();

  // Qizlar uchun
  if (name.includes('qizi') || 
      name.endsWith('ova') || 
      name.endsWith('yeva') || 
      name.endsWith('eva') || 
      name.endsWith('ovna') || 
      name.endsWith('yevna') ||
      name.includes(' ova ') ||
      name.includes(' yeva ')) {
    return 'female';
  }

  // O'g'il bolalar uchun
  if (name.includes("o'g'li") || 
      name.includes("oʻgʻli") || 
      name.includes("o`g`li") || 
      name.endsWith('ov') || 
      name.endsWith('yev') || 
      name.endsWith('ev') || 
      name.endsWith('ovich') || 
      name.endsWith('yevich') ||
      name.includes(' ov ') ||
      name.includes(' yev ')) {
    return 'male';
  }

  return 'unknown';
}

// Matndan o'quvchilarni parsing qilish (har bir qatorni ajratish)
export function parseRawStudentList(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 2);
  const students = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Qator boshidagi raqamlarni (1., 2), -, •) tozalash
    line = line.replace(/^\d+[\.\)\-\:\s]+/, '').replace(/^[\-\*•\>\s]+/, '').trim();

    // 1. Telefon raqamini topish
    const phoneRegex = /(?:\+?998[\s\-]?)?(?:\(?\d{2}\)?[\s\-]?)?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/;
    const phoneMatch = line.match(phoneRegex);
    let phone = '';
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 7) {
      phone = formatPhoneNumber(phoneMatch[0]);
      line = line.replace(phoneMatch[0], ' ');
    }

    // 2. Tug'ilgan sanani topish (DD.MM.YYYY yoki YYYY-MM-DD yoki 2008 yil...)
    const dateRegex = /\b(\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{4}|\d{4}[\.\/-]\d{1,2}[\.\/-]\d{1,2}|\b(?:19|20)\d{2}\s*(?:-yil|yil|y)?)\b/i;
    const dateMatch = line.match(dateRegex);
    let birthDate = '';
    if (dateMatch) {
      birthDate = dateMatch[0].replace(/yil|-yil|y/i, '').trim();
      line = line.replace(dateMatch[0], ' ');
    }

    // 3. Sinfni topish (masalan: 9-A, 10-B, 11 "V", 8-sinf)
    const classRegex = /\b([1-9]|1[0-1])[\s\-]?(?:sinf|["'«]?([a-zA-Zа-яА-ЯЎўҚқҒғҲҳ])["'»]?)?\b/i;
    const classMatch = line.match(classRegex);
    let grade = '';
    if (classMatch && classMatch[0].length < 10) {
      grade = classMatch[0].trim();
      line = line.replace(classMatch[0], ' ');
    }

    // 4. Manzilni topish (agar shahar, tuman, ko'cha, viloyat so'zlari bo'lsa)
    let address = '';
    const addrRegex = /(?:viloyati|tumani|shahri|ko'chasi|qishlog'i|MFI|mahalla).*$/i;
    const addrMatch = line.match(addrRegex);
    if (addrMatch) {
      address = addrMatch[0].trim();
      line = line.replace(addrMatch[0], ' ');
    }

    // 5. Qolgan qismi — Ism-sharif (F.I.Sh)
    // Keraksiz belgilarni tozalaymiz (vergul, tire, ortiqcha probel)
    let rawName = line.replace(/[,;\|\\\/]/g, ' ').replace(/\s+/g, ' ').trim();
    const fullName = formatFullName(rawName);
    const gender = detectGender(fullName);
    const { age, text: ageText } = calculateAge(birthDate);

    if (fullName.length > 1) {
      students.push({
        id: i + 1,
        fullName,
        birthDate: birthDate || '-',
        age: age || '-',
        ageText,
        grade: grade || '-',
        phone: phone || '-',
        address: address || '-',
        gender
      });
    }
  }

  return students;
}

// Ro'yxatni saralash funksiyalari
export function sortStudents(students, sortBy = 'alphabet_az') {
  const arr = [...students];

  switch (sortBy) {
    case 'alphabet_az':
      return arr.sort((a, b) => compareUzbek(a.fullName, b.fullName));
    case 'alphabet_za':
      return arr.sort((a, b) => compareUzbek(b.fullName, a.fullName));
    case 'birth_asc': // Eng kattadan kichikka (yoki eng kichik yoshdan kattaga)
      return arr.sort((a, b) => {
        const valA = typeof a.age === 'number' ? a.age : -1;
        const valB = typeof b.age === 'number' ? b.age : -1;
        return valA - valB;
      });
    case 'birth_desc':
      return arr.sort((a, b) => {
        const valA = typeof a.age === 'number' ? a.age : -1;
        const valB = typeof b.age === 'number' ? b.age : -1;
        return valB - valA;
      });
    case 'grade':
      return arr.sort((a, b) => a.grade.localeCompare(b.grade));
    default:
      return arr;
  }
}

// Dublikatlarni tozalash (F.I.Sh bir xil bo'lganlarni o'chirish)
export function removeDuplicates(students) {
  const seen = new Set();
  const unique = [];
  const removed = [];

  for (const s of students) {
    const key = s.fullName.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) {
      removed.push(s);
    } else {
      seen.add(key);
      unique.push(s);
    }
  }

  return { unique, removed, countRemoved: removed.length };
}

// Statistika (O'g'il/Qiz, umumiy soni)
export function getStudentStats(students) {
  let boys = 0;
  let girls = 0;
  let unknown = 0;

  for (const s of students) {
    if (s.gender === 'male') boys++;
    else if (s.gender === 'female') girls++;
    else unknown++;
  }

  return {
    total: students.length,
    boys,
    girls,
    unknown,
    boysPercent: students.length ? Math.round((boys / students.length) * 100) : 0,
    girlsPercent: students.length ? Math.round((girls / students.length) * 100) : 0
  };
}
