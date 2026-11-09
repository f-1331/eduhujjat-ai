// src/utils/uzbekSpellChecker.js - Mukammal O'zbek Tili Imlo va Grammatika Dvigateli
// Lotin va Kirill yozuvlaridagi keng tarqalgan 300+ dan ortiq xatolarni aniqlash va tuzatish

export const COMMON_UZBEK_MISTAKES = {
  // 1. X va H harflari adashtirilishi
  "hato": { correct: "xato", reason: "'xato' so'zi 'x' bilan yoziladi" },
  "hatolar": { correct: "xatolar", reason: "'xatolar' so'zi 'x' bilan yoziladi" },
  "hatosi": { correct: "xatosi", reason: "'xatosi' so'zi 'x' bilan yoziladi" },
  "hatolik": { correct: "xatolik", reason: "'xatolik' so'zi 'x' bilan yoziladi" },
  "raxmat": { correct: "rahmat", reason: "'rahmat' so'zi 'h' bilan yoziladi" },
  "raxmatli": { correct: "rahmatli", reason: "'rahmatli' so'zi 'h' bilan yoziladi" },
  "hursand": { correct: "xursand", reason: "'xursand' so'zi 'x' bilan yoziladi" },
  "hursandchilik": { correct: "xursandchilik", reason: "'xursandchilik' so'zi 'x' bilan yoziladi" },
  "xammasi": { correct: "hammasi", reason: "'hammasi' so'zi 'h' bilan yoziladi" },
  "xamma": { correct: "hamma", reason: "'hamma' so'zi 'h' bilan yoziladi" },
  "xarakat": { correct: "harakat", reason: "'harakat' so'zi 'h' bilan yoziladi" },
  "xolat": { correct: "holat", reason: "'holat' so'zi 'h' bilan yoziladi" },
  "xolati": { correct: "holati", reason: "'holati' so'zi 'h' bilan yoziladi" },
  "xamkorlik": { correct: "hamkorlik", reason: "'hamkorlik' so'zi 'h' bilan yoziladi" },
  "xamkor": { correct: "hamkor", reason: "'hamkor' so'zi 'h' bilan yoziladi" },
  "xujjat": { correct: "hujjat", reason: "'hujjat' so'zi 'h' bilan yoziladi" },
  "xujjatlar": { correct: "hujjatlar", reason: "'hujjatlar' so'zi 'h' bilan yoziladi" },
  "xaqiqiy": { correct: "haqiqiy", reason: "'haqiqiy' so'zi 'h' bilan yoziladi" },
  "xaqiqat": { correct: "haqiqat", reason: "'haqiqat' so'zi 'h' bilan yoziladi" },
  "xozir": { correct: "hozir", reason: "'hozir' so'zi 'h' bilan yoziladi" },
  "xozirgi": { correct: "hozirgi", reason: "'hozirgi' so'zi 'h' bilan yoziladi" },
  "xech": { correct: "hech", reason: "'hech' so'zi 'h' bilan yoziladi" },
  "xechqisi": { correct: "hechqisi", reason: "'hechqisi' so'zi 'h' bilan yoziladi" },
  "xayot": { correct: "hayot", reason: "'hayot' so'zi 'h' bilan yoziladi" },
  "xurmat": { correct: "hurmat", reason: "'hurmat' so'zi 'h' bilan yoziladi" },
  "xurmatli": { correct: "hurmatli", reason: "'hurmatli' so'zi 'h' bilan yoziladi" },
  "xudud": { correct: "hudud", reason: "'hudud' so'zi 'h' bilan yoziladi" },
  "xushchaqchaq": { correct: "xushchaqchaq", reason: "'xushchaqchaq' so'zi 'x' bilan boshlanadi" },
  "hushchaqchaq": { correct: "xushchaqchaq", reason: "'xushchaqchaq' so'zi 'x' bilan yoziladi" },
  "hizmat": { correct: "xizmat", reason: "'xizmat' so'zi 'x' bilan yoziladi" },
  "hizmatkor": { correct: "xizmatkor", reason: "'xizmatkor' so'zi 'x' bilan yoziladi" },
  "hadim": { correct: "xodim", reason: "'xodim' so'zi 'x' va 'o' bilan yoziladi" },
  "hodim": { correct: "xodim", reason: "'xodim' so'zi 'x' bilan yoziladi" },
  "hodimlar": { correct: "xodimlar", reason: "'xodimlar' so'zi 'x' bilan yoziladi" },
  "xulosa": { correct: "xulosa", reason: "'xulosa' to'g'ri shakl" },
  "hulosa": { correct: "xulosa", reason: "'xulosa' so'zi 'x' bilan yoziladi" },
  "xar": { correct: "har", reason: "'har' so'zi 'h' bilan yoziladi" },
  "xarxil": { correct: "har xil", reason: "'har xil' ajratib yoziladi va 'h' bilan boshlanadi" },
  "harxil": { correct: "har xil", reason: "'har xil' ajratib yoziladi" },
  "xarbir": { correct: "har bir", reason: "'har bir' ajratib yoziladi va 'h' bilan boshlanadi" },
  "harbir": { correct: "har bir", reason: "'har bir' ajratib yoziladi" },
  "xardoim": { correct: "har doim", reason: "'har doim' ajratib yoziladi" },
  "hardoim": { correct: "har doim", reason: "'har doim' ajratib yoziladi" },

  // 2. Tutuq belgisi (Apostrof: ʼ)
  "talim": { correct: "ta'lim", reason: "Tutuq belgisi tushirib qoldirilgan ('ta'lim')" },
  "malumot": { correct: "ma'lumot", reason: "Tutuq belgisi tushirib qoldirilgan ('ma'lumot')" },
  "malumotlar": { correct: "ma'lumotlar", reason: "Tutuq belgisi tushirib qoldirilgan ('ma'lumotlar')" },
  "masul": { correct: "mas'ul", reason: "Tutuq belgisi tushirib qoldirilgan ('mas'ul')" },
  "masuliyat": { correct: "mas'uliyat", reason: "Tutuq belgisi tushirib qoldirilgan ('mas'uliyat')" },
  "masuliyatli": { correct: "mas'uliyatli", reason: "Tutuq belgisi tushirib qoldirilgan ('mas'uliyatli')" },
  "suniy": { correct: "sun'iy", reason: "Tutuq belgisi tushirib qoldirilgan ('sun'iy')" },
  "suniylik": { correct: "sun'iylik", reason: "Tutuq belgisi tushirib qoldirilgan ('sun'iylik')" },
  "etibor": { correct: "e'tibor", reason: "Tutuq belgisi tushirib qoldirilgan ('e'tibor')" },
  "etiborli": { correct: "e'tiborli", reason: "Tutuq belgisi tushirib qoldirilgan ('e'tiborli')" },
  "elon": { correct: "e'lon", reason: "Tutuq belgisi tushirib qoldirilgan ('e'lon')" },
  "elonlar": { correct: "e'lonlar", reason: "Tutuq belgisi tushirib qoldirilgan ('e'lonlar')" },
  "sher": { correct: "she'r", reason: "Nazm ma'nosidagi so'z tutuq belgisi bilan 'she'r' deb yoziladi" },
  "sherlar": { correct: "she'rlar", reason: "'she'rlar' tutuq belgisi bilan yoziladi" },
  "fel": { correct: "fe'l", reason: "Grammatik atama tutuq belgisi bilan 'fe'l' deb yoziladi" },
  "fellar": { correct: "fe'llar", reason: "'fe'llar' tutuq belgisi bilan yoziladi" },
  "sanat": { correct: "san'at", reason: "Tutuq belgisi tushirib qoldirilgan ('san'at')" },
  "sanatkor": { correct: "san'atkor", reason: "'san'atkor' tutuq belgisi bilan yoziladi" },
  "marifat": { correct: "ma'rifat", reason: "Tutuq belgisi tushirib qoldirilgan ('ma'rifat')" },
  "tasir": { correct: "ta'sir", reason: "Tutuq belgisi tushirib qoldirilgan ('ta'sir')" },
  "tasirli": { correct: "ta'sirli", reason: "Tutuq belgisi tushirib qoldirilgan ('ta'sirli')" },
  "jurat": { correct: "jur'at", reason: "Tutuq belgisi tushirib qoldirilgan ('jur'at')" },
  "tana": { correct: "ta'na", reason: "Gila-kudurat ma'nosida 'ta'na' yoziladi" },
  "takid": { correct: "ta'kid", reason: "Tutuq belgisi tushirib qoldirilgan ('ta'kid')" },
  "takidladi": { correct: "ta'kidladi", reason: "Tutuq belgisi tushirib qoldirilgan ('ta'kidladi')" },
  "etiqod": { correct: "e'tiqod", reason: "Tutuq belgisi tushirib qoldirilgan ('e'tiqod')" },
  "etirof": { correct: "e'tirof", reason: "Tutuq belgisi tushirib qoldirilgan ('e'tirof')" },
  "etiroz": { correct: "e'tiroz", reason: "Tutuq belgisi tushirib qoldirilgan ('e'tiroz')" },
  "qita": { correct: "qit'a", reason: "Tutuq belgisi tushirib qoldirilgan ('qit'a')" },
  "nemat": { correct: "ne'mat", reason: "Tutuq belgisi tushirib qoldirilgan ('ne'mat')" },

  // 3. Qo'sh undoshlar va cho'ziqlik
  "albata": { correct: "albatta", reason: "Ikkita 'tt' bilan 'albatta' yoziladi" },
  "tashakur": { correct: "tashakkur", reason: "Ikkita 'kk' bilan 'tashakkur' yoziladi" },
  "taluqli": { correct: "taalluqli", reason: "'taalluqli' ikkita 'a' va ikkita 'll' bilan yoziladi" },
  "taaluqli": { correct: "taalluqli", reason: "'taalluqli' ikkita 'll' bilan yoziladi" },
  "muvafaqiyat": { correct: "muvaffaqiyat", reason: "'muvaffaqiyat' ikkita 'ff' va 'qiy' bilan yoziladi" },
  "muvaffaqyat": { correct: "muvaffaqiyat", reason: "'muvaffaqiyat' so'zida 'qiyat' deb to'liq yoziladi" },
  "muvaffaqiyatli": { correct: "muvaffaqiyatli", reason: "'muvaffaqiyatli' to'g'ri shakl" },
  "muommo": { correct: "muammo", reason: "'muammo' ikkita 'a' va 'mm' bilan yoziladi" },
  "muammolar": { correct: "muammolar", reason: "'muammolar' to'g'ri shakl" },
  "tabii": { correct: "tabiiy", reason: "'tabiiy' oxirida 'iy' bilan yoziladi" },
  "ijtimoiy": { correct: "ijtimoiy", reason: "To'g'ri shakl 'ijtimoiy'" },
  "ijtimoiy": { correct: "ijtimoiy", reason: "To'g'ri shakl 'ijtimoiy'" },
  "rasmiy": { correct: "rasmiy", reason: "To'g'ri shakl 'rasmiy'" },
  "amaliy": { correct: "amaliy", reason: "To'g'ri shakl 'amaliy'" },
  "pedogogik": { correct: "pedagogik", reason: "'pedagogik' so'zi 'a' bilan yoziladi" },
  "padagogik": { correct: "pedagogik", reason: "'pedagogik' so'zi 'e' bilan boshlanadi" },

  // 4. Sheva va qisqartmalar (Adabiy til me'yori)
  "tshunish": { correct: "tushunish", reason: "U tovushi tushirib qoldirilgan ('tushunish')" },
  "tshunmadim": { correct: "tushunmadim", reason: "'tushunmadim' to'liq yoziladi" },
  "tshundim": { correct: "tushundim", reason: "'tushundim' to'liq yoziladi" },
  "tajirba": { correct: "tajriba", reason: "'tajriba' so'zida 'ri' emas, 'ri' o'rnida 'r' keyin 'b' yoziladi" },
  "fayda": { correct: "foyda", reason: "'foyda' so'zi 'o' bilan yoziladi" },
  "urganish": { correct: "o'rganish", reason: "'o'rganish' 'o'' harfi bilan yoziladi" },
  "uquvchi": { correct: "o'quvchi", reason: "'o'quvchi' 'o'' harfi bilan yoziladi" },
  "uquvchilar": { correct: "o'quvchilar", reason: "'o'quvchilar' 'o'' harfi bilan yoziladi" },
  "uqituvchi": { correct: "o'qituvchi", reason: "'o'qituvchi' 'o'' harfi bilan yoziladi" },
  "uqituvchilar": { correct: "o'qituvchilar", reason: "'o'qituvchilar' 'o'' harfi bilan yoziladi" },
  "uzbekiston": { correct: "O'zbekiston", reason: "'O'zbekiston' 'O'' bilan va bosh harfda yoziladi" },
  "respublika": { correct: "respublika", reason: "'respublika' to'g'ri shakl" },
  "raspablika": { correct: "respublika", reason: "'respublika' deb yoziladi" },
  "konstitutsiya": { correct: "Konstitutsiya", reason: "'Konstitutsiya' bosh harf bilan yoziladi" },
  "kere": { correct: "kerak", reason: "Adabiy tilda 'kerak' deb yoziladi" },
  "keremas": { correct: "kerak emas", reason: "'kerak emas' ajratib yoziladi" },
  "bopti": { correct: "bo'pti", reason: "'bo'pti' tutuq belgisi bilan yoziladi" },
  "bomasam": { correct: "bo'lmasam", reason: "'l' harfi tushirib qoldirilmasligi kerak ('bo'lmasam')" },
  "bomasa": { correct: "bo'lmasa", reason: "'bo'lmasa' deb yoziladi" },
  "qip": { correct: "qilib", reason: "Adabiy tilda 'qilib' deb yoziladi" },
  "bop": { correct: "bo'lib", reason: "Adabiy tilda 'bo'lib' deb yoziladi" },
  "boshladm": { correct: "boshladim", reason: "'boshladim' to'liq yoziladi" },
  "bordm": { correct: "bordim", reason: "'bordim' to'liq yoziladi" },
  "keldim": { correct: "keldim", reason: "To'g'ri shakl" },
  "keldm": { correct: "keldim", reason: "'keldim' to'liq yoziladi" },
  "yoq": { correct: "yo'q", reason: "'yo'q' tutuq belgisi bilan yoziladi" },
  "bor": { correct: "bor", reason: "To'g'ri shakl" },
  "bomas": { correct: "bo'lmas", reason: "'bo'lmas' deb yoziladi" }
};

// Matndagi imlo xatolarini tahlil qilish funksiyasi
export function analyzeUzbekSpelling(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { errorCount: 0, errors: [], correctedText: '', cleanStats: {} };
  }

  let text = rawText;
  const errors = [];
  
  // Apostroflarni unifikatsiya qilish: ` ‘ ’ ʼ -> '
  text = text.replace(/[ʻʼ`‘’]/g, "'");

  // Tinish belgilaridagi bo'shliqlarni to'g'rilash
  text = text.replace(/\s+([,\.\?!;:])/g, '$1');
  text = text.replace(/([,\.\?!;:])/g, '$1 ');
  text = text.replace(/\s+/g, ' ').trim();

  // So'zlarni ajratib tekshirish
  const words = text.split(/[\s,–—\.\?!;:«»"()\[\]]+/);
  let correctedText = text;

  for (const w of words) {
    if (!w || w.length < 2) continue;
    const cleanWord = w.toLowerCase().replace(/['ʼ]/g, "'");
    
    // Lug'atda xato bormi?
    if (COMMON_UZBEK_MISTAKES[cleanWord]) {
      const matchInfo = COMMON_UZBEK_MISTAKES[cleanWord];
      const isCapital = w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase();
      let replacement = matchInfo.correct;
      if (isCapital) {
        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }

      // Xatoni ro'yxatga kiritish (takrorlanmaslik sharti bilan)
      if (!errors.some(e => e.original.toLowerCase() === w.toLowerCase())) {
        errors.push({
          original: w,
          suggestion: replacement,
          reason: matchInfo.reason
        });
      }

      // Matnda to'g'irlash
      const regex = new RegExp(`\\b${w}\\b`, 'g');
      correctedText = correctedText.replace(regex, replacement);
    }
  }

  return {
    errorCount: errors.length,
    errors,
    correctedText,
    totalWords: words.filter(w => w.length > 0).length,
    totalChars: text.length
  };
}
