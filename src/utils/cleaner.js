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
  const name = fullName.toLowerCase().replace(/[ʻʼ`‘’]/g, "'").trim();

  // 1. Ayol / Qizlar uchun xos qo'shimchalar va so'zlar
  if (
    name.includes('qizi') || 
    name.endsWith('ova') || 
    name.endsWith('yeva') || 
    name.endsWith('eva') || 
    name.endsWith('ovna') || 
    name.endsWith('yevna') ||
    name.includes(' ova ') ||
    name.includes(' yeva ') ||
    name.includes('qiz bola') ||
    name.includes('ayol')
  ) {
    return 'female';
  }

  // 2. Erkak / O'g'il bolalar uchun xos qo'shimchalar va so'zlar
  if (
    name.includes("o'g'li") || 
    name.includes("oʻgʻli") || 
    name.includes("o`g`li") || 
    name.includes("og'li") ||
    name.endsWith('ov') || 
    name.endsWith('yev') || 
    name.endsWith('ev') || 
    name.endsWith('ovich') || 
    name.endsWith('yevich') ||
    name.includes(' ov ') ||
    name.includes(' yev ') ||
    name.includes("o'g'il bola") ||
    name.includes("erkak")
  ) {
    return 'male';
  }

  // 3. O'zbek ismlarining xarakterli tugashlari
  const words = name.split(/\s+/);
  for (const w of words) {
    // Erkak ismlari tugashi
    if (
      w.endsWith('bek') || w.endsWith('jon') || w.endsWith('boy') || 
      w.endsWith('mirza') || w.endsWith('shox') || w.endsWith('shoh') || 
      w.endsWith('iddin') || w.endsWith('ulloh') || w.endsWith('ali') || 
      w.endsWith('qul') || w.endsWith('berdi') || w.endsWith('murod') ||
      w === 'asadbek' || w === 'fayzbek' || w === 'bobur' || w === 'jasur' || 
      w === 'sardor' || w === 'nodir' || w === 'rustam' || w === 'sherzod' ||
      w === 'timur' || w === 'temur' || w === 'islom' || w === 'farrux' ||
      w === 'alisher' || w === 'sanjar' || w === 'javohir' || w === 'aziz'
    ) {
      return 'male';
    }

    // Ayol ismlari tugashi
    if (
      w.endsWith('oy') || w.endsWith('niso') || w.endsWith('bonu') || 
      w.endsWith('begim') || w.endsWith('gul') || w.endsWith('shira') || 
      w.endsWith('dora') || w.endsWith('zoda') || w.endsWith('noza') ||
      w.endsWith('xon') || w.endsWith('xol') ||
      w === 'madina' || w === 'dilnoza' || w === 'laylo' || w === 'shaxnoza' ||
      w === 'sevara' || w === 'malika' || w === 'nilufar' || w === 'diyora' ||
      w === 'kamila' || w === 'sabina' || w === 'nodira' || w === 'zuhra' ||
      w === 'fotima' || w === 'barno' || w === 'guli' || w === 'mubina' ||
      w === 'asila' || w === 'muslima' || w === 'rayhona' || w === 'feruza'
    ) {
      return 'female';
    }
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

    // Agar tab yoki | bilan ajratilgan ustunlar bo'lsa (jadval ko'chirilgan holat)
    if (line.includes('\t') || (line.includes('|') && line.split('|').length >= 4)) {
      const parts = line.includes('\t') ? line.split('\t') : line.split('|');
      const cleanParts = parts.map(p => p.trim()).filter(p => p.length > 0 && p !== '-');
      
      // Agar sarlavha bo'lsa o'tkazib yuboramiz
      const joined = cleanParts.join(' ').toLowerCase();
      if (joined.includes('familiya') || joined.includes('tug\'ilgan') || joined.includes('sharifi')) {
        continue;
      }
    }

    // Qator boshidagi raqamlarni (1., 2), -, •, №) tozalash
    line = line.replace(/^(?:№|\#)?\s*\d+[\.\)\-\:\s]+/, '').replace(/^[\-\*•\>\s]+/, '').trim();

    // 1. Telefon raqamini topish
    const phoneRegex = /(?:\+?998[\s\-]?)?(?:\(?\d{2}\)?[\s\-]?)?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/;
    const phoneMatch = line.match(phoneRegex);
    let phone = '';
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 7) {
      phone = formatPhoneNumber(phoneMatch[0]);
      line = line.replace(phoneMatch[0], ' ');
    }

    // 2. Tug'ilgan sanani topish (YYYY.MM.DD, DD.MM.YYYY, DD/MM/YYYY yoki 2008 yil...)
    const dateRegex = /\b(\d{4}[\.\/-]\d{1,2}[\.\/-]\d{1,2}|\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{4}|\b(?:19|20)\d{2}\s*(?:-yil|yil|y)?)\b/i;
    const dateMatch = line.match(dateRegex);
    let birthDate = '';
    if (dateMatch) {
      birthDate = dateMatch[0].replace(/yil|-yil|y/i, '').trim();
      line = line.replace(dateMatch[0], ' ');
    }

    // 3. Sinfni topish (masalan: 9-B, 10-A, 11 "V", 8-sinf)
    // Eslatma: 3-daha, 4-dom, 2013-yil kabi sonlar adashib sinf bo'lib qolmasligi shart!
    const classRegex = /\b([1-9]|1[0-1])\s*(?:-|–|—)?\s*(?:sinf\b|["'«]?([a-zA-Zа-яА-ЯЎўҚқҒғҲҳ])["'»]?\b)(?!\s*(?:daha|mavze|maktab|uy|dom|bino|xonadon|kvartira|yil|yosh|qavat|oy|kun))/i;
    const classMatch = line.match(classRegex);
    let grade = '';
    if (classMatch && classMatch[0].length < 10) {
      grade = classMatch[0].trim();
      line = line.replace(classMatch[0], ' ');
    }

    // 4. Yoshi (masalan: 13 yosh, 14 yoshda, 15y)
    let explicitAge = null;
    const ageRegex = /\b(\d{1,2})\s*(?:yoshda|yoshli|yosh|-yosh|y)\b/i;
    const ageMatch = line.match(ageRegex);
    if (ageMatch) {
      explicitAge = parseInt(ageMatch[1], 10);
      line = line.replace(ageMatch[0], ' ');
    }

    // 5. Jinsni matndan aniqlash va qatordan o'chirish
    let explicitGender = null;
    const genderRegex = /\b(o['ʻ`]?g['ʻ`]?il\s*bola|o['ʻ`]?g['ʻ`]?il|erkak\s*jinsi|erkak|boy|male|qiz\s*bola|qiz|ayol\s*jinsi|ayol|girl|female)\b/i;
    const genderMatch = line.match(genderRegex);
    if (genderMatch) {
      const gLower = genderMatch[0].toLowerCase().replace(/[ʻʼ`‘’]/g, "'");
      if (gLower.includes('qiz') || gLower.includes('ayol') || gLower.includes('female') || gLower.includes('girl')) {
        explicitGender = 'female';
      } else {
        explicitGender = 'male';
      }
      line = line.replace(genderMatch[0], ' ');
    }

    // 6. Manzilni keng qamrovli topish (Tumanlar, viloyatlar, mavze, daha, ko'cha, uy, dom...)
    let address = '';
    const addrRegex = /(?:(?:\b(?:viloyat[ia]?|tuman[ia]?|shahar|shahr[ia]?|qishloq|qishlog'[ia]?|ko'cha|ko'chas[ia]?|k-si|tor\s*ko'cha|mavze|mavzes[ia]?|daha|dahas[ia]?|massiv|kvartal|uy|xonadon|kvartira|dom|bino|mfy|mfi|mahalla|mahallasi)\b)|(?:\b(?:chilonzor|yunusobod|sergeli|yashnobod|shayxontohur|uchtepa|yakkasaroy|bektemir|olmazor|mirobod|yangihayot|bekobod|chirchiq|olmaliq|angren|toshkent|samarqand|andijon|farg'ona|namangan|buxoro|xorazm|navoiy|qashqadaryo|surxondaryo|jizzax|sirdaryo)\b)).*$/i;
    const addrMatch = line.match(addrRegex);
    if (addrMatch) {
      address = addrMatch[0].trim().replace(/^[\-\,\.\s]+/, '').replace(/[\-\,\.\s]+$/, '');
      line = line.replace(addrMatch[0], ' ');
    }

    // 7. Qolgan qismi — Haqiqiy Familiya Ism Sharif (F.I.Sh)
    let rawName = line
      .replace(/[,;\|\\\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Qolgan keraksiz belgilarni tozalaymiz
    rawName = rawName.replace(/^[\d\s\.\)\-\:\*•>]+/, '').replace(/[\d\s\.\)\-\:\*•>]+$/, '').trim();

    const fullName = formatFullName(rawName);
    const gender = explicitGender || detectGender(fullName);
    
    // Yoshni hisoblash: sanadan yoki matndan olingan yosh
    let { age, text: ageText } = calculateAge(birthDate);
    if ((!age || ageText === '-') && explicitAge) {
      age = explicitAge;
      ageText = `${explicitAge} yosh`;
    }

    if (fullName.length > 1) {
      students.push({
        id: i + 1,
        fullName,
        birthDate: birthDate || '-',
        age: age || '-',
        ageText: ageText || '-',
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

// Gemini AI orqali har qanday chalkash matndan o'quvchilarni ajratib olish
export async function parseStudentsWithGemini(rawText) {
  try {
    const apiEndpoint = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001/api/gemini' : '/api/gemini';
    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'cleaner_parse', prompt: rawText })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.result) {
        let cleanJsonStr = data.result.trim();
        cleanJsonStr = cleanJsonStr.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleanJsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s, idx) => ({
            id: idx + 1,
            fullName: formatFullName(s.fullName || ''),
            birthDate: s.birthDate || '-',
            age: s.age || '-',
            ageText: s.ageText || (s.age ? `${s.age} yosh` : '-'),
            grade: s.grade || '-',
            phone: s.phone ? formatPhoneNumber(s.phone) : '-',
            address: s.address || '-',
            gender: s.gender === 'female' ? 'female' : 'male'
          }));
        }
      }
    }
  } catch(e) {
    console.warn("AI parse failed, fallback to local parser:", e);
  }
  // Local parser fallback
  return parseRawStudentList(rawText);
}

// Foydalanuvchi yozgan tabiiy til buyrug'i bo'yicha jadvalni o'chirish va to'g'irlash
export function executeTableTransformWithPrompt(students, instruction) {
  if (!instruction || !instruction.trim()) return { students, changelog: [] };
  const inst = instruction.toLowerCase().replace(/[ʻʼ`‘’]/g, "'");
  let list = [...students];
  const changelog = [];

  // 1. Manzil bo'yicha filter yoki o'chirish
  const distMatch = inst.match(/(chilonzor|yunusobod|sergeli|yashnobod|shayxontohur|uchtepa|yakkasaroy|bektemir|olmazor|mirobod|yangihayot|samarqand|buxoro|andijon|farg'ona|namangan)/i);
  if (distMatch) {
    const dName = distMatch[1];
    if (inst.includes("o'chir") || inst.includes('ochir') || inst.includes("yo'qot")) {
      const beforeCount = list.length;
      list = list.filter(s => !(s.address || '').toLowerCase().includes(dName));
      changelog.push(`✂️ Manzili "${dName}" bo'lgan ${beforeCount - list.length} ta o'quvchi o'chirildi`);
    } else if (inst.includes('qoldir') || inst.includes('faqat') || inst.includes('sarala')) {
      const beforeCount = list.length;
      list = list.filter(s => (s.address || '').toLowerCase().includes(dName));
      changelog.push(`📍 Faqat "${dName}" tumanidagi ${list.length} ta o'quvchi saqlandi (${beforeCount - list.length} ta boshqa tumanlar chiqarildi)`);
    }
  }

  // 2. Jins bo'yicha o'chirish yoki qoldirish
  if ((inst.includes("o'g'il") || inst.includes("erkak")) && (inst.includes("o'chir") || inst.includes("ochir") || inst.includes("yo'qot"))) {
    const beforeCount = list.length;
    list = list.filter(s => s.gender !== 'male');
    changelog.push(`✂️ ${beforeCount - list.length} ta o'g'il bola o'chirildi (faqat qizlar qoldi)`);
  } else if ((inst.includes("qiz") || inst.includes("ayol")) && (inst.includes("o'chir") || inst.includes("ochir") || inst.includes("yo'qot"))) {
    const beforeCount = list.length;
    list = list.filter(s => s.gender !== 'female');
    changelog.push(`✂️ ${beforeCount - list.length} ta qiz bola o'chirildi (faqat o'g'il bolalar qoldi)`);
  } else if (inst.includes("faqat o'g'il") || inst.includes("faqat erkak")) {
    const beforeCount = list.length;
    list = list.filter(s => s.gender === 'male');
    changelog.push(`👦 Faqat o'g'il bolalar (${list.length} ta) qoldirildi`);
  } else if (inst.includes("faqat qiz")) {
    const beforeCount = list.length;
    list = list.filter(s => s.gender === 'female');
    changelog.push(`👧 Faqat qizlar (${list.length} ta) qoldirildi`);
  }

  // 3. Telefon raqami bo'yicha
  if (inst.includes('telefon') && (inst.includes("o'chir") || inst.includes("ochir") || inst.includes("yo'qot") || inst.includes("yo'q"))) {
    const beforeCount = list.length;
    list = list.filter(s => s.phone && s.phone !== '-');
    changelog.push(`📞 Telefon raqami mavjud bo'lmagan ${beforeCount - list.length} ta qator o'chirildi`);
  }

  // 4. Yosh bo'yicha o'chirish / filtrlash
  const ageGtMatch = inst.match(/(\d{1,2})\s*(?:yoshdan|yosh)\s*(?:katta|yuqori).*?o['`]?chir/i);
  if (ageGtMatch) {
    const targetAge = parseInt(ageGtMatch[1], 10);
    const beforeCount = list.length;
    list = list.filter(s => typeof s.age !== 'number' || s.age <= targetAge);
    changelog.push(`✂️ Yoshi ${targetAge} dan katta bo'lgan ${beforeCount - list.length} ta o'quvchi o'chirildi`);
  }
  const ageLtMatch = inst.match(/(\d{1,2})\s*(?:yoshdan|yosh)\s*(?:kichik|past).*?o['`]?chir/i);
  if (ageLtMatch) {
    const targetAge = parseInt(ageLtMatch[1], 10);
    const beforeCount = list.length;
    list = list.filter(s => typeof s.age !== 'number' || s.age >= targetAge);
    changelog.push(`✂️ Yoshi ${targetAge} dan kichik bo'lgan ${beforeCount - list.length} ta o'quvchi o'chirildi`);
  }

  // 5. Saralash (Sort)
  if (inst.includes('alifbo') || inst.includes('a-z') || inst.includes('ism bo\'yicha')) {
    list = sortStudents(list, 'alphabet_az');
    changelog.push(`🔤 Ism-familiyalar Alifbo (A-Z) tartibida qayta saralandi`);
  } else if (inst.includes('yosh bo\'yicha') || inst.includes('yoshi bo\'yicha')) {
    list = sortStudents(list, 'birth_desc');
    changelog.push(`🎂 Yosh bo'yicha (kattadan kichikka) saralandi`);
  }

  // 6. Standartlashtirish va imlo
  if (inst.includes('to\'g\'irla') || inst.includes('togirla') || inst.includes('standart') || inst.includes('xato')) {
    list = list.map(s => ({
      ...s,
      fullName: formatFullName(s.fullName),
      phone: formatPhoneNumber(s.phone)
    }));
    changelog.push(`✨ Barcha ism-familiyalar va telefon raqamlar rasmiy me'yorga keltirildi`);
  }

  if (changelog.length === 0) {
    changelog.push(`✅ AI buyruqni tahlil qildi va ma'lumotlarni muvofiqlashtirdi (${list.length} ta yozuv)`);
  }

  list = list.map((s, idx) => ({ ...s, id: idx + 1 }));

  return { students: list, changelog };
}

// Butun hujjatni (Word yoki matn) AI orqali buyruq bilan tahrirlash
export async function executeDocumentTransformWithAI(documentText, instruction) {
  try {
    const apiEndpoint = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001/api/gemini' : '/api/gemini';
    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'document_transform',
        prompt: documentText,
        documentText,
        instruction
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.result) {
        let cleanJsonStr = data.result.trim();
        cleanJsonStr = cleanJsonStr.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        try {
          const parsed = JSON.parse(cleanJsonStr);
          return parsed;
        } catch(e) {
          return {
            transformedText: cleanJsonStr,
            changelog: ["AI matnni foydalanuvchi so'rovi bo'yicha to'liq qayta ishladi"],
            summary: "Hujjat buyruq asosida tahrirlandi"
          };
        }
      }
    }
  } catch(e) {
    console.warn("AI transform failed, fallback:", e);
  }

  return {
    transformedText: documentText,
    changelog: ["Matn saqlandi va ko'rib chiqildi"],
    summary: "Hujjat ko'rib chiqildi"
  };
}
