// Lotin <-> Kirill to'liq transliteratsiya qoidalari (O'zbek tili uchun)
const latinToCyrillicMap = {
  "G'": "Ғ", "g'": "ғ", "G`": "Ғ", "g`": "ғ", "G’": "Ғ", "g’": "ғ", "G‘": "Ғ", "g‘": "ғ",
  "O'": "Ў", "o'": "ў", "O`": "Ў", "o`": "ў", "O’": "Ў", "o’": "ў", "O‘": "Ў", "o‘": "ў",
  "Sh": "Ш", "sh": "ш", "SH": "Ш",
  "Ch": "Ч", "ch": "ч", "CH": "Ч",
  "Yo": "Ё", "yo": "ё", "YO": "Ё",
  "Yu": "Ю", "yu": "ю", "YU": "Ю",
  "Ya": "Я", "ya": "я", "YA": "Я",
  "Ye": "Е", "ye": "е", "YE": "Е",
  "A": "А", "a": "а",
  "B": "Б", "b": "б",
  "D": "Д", "d": "д",
  "E": "Э", "e": "е",
  "F": "Ф", "f": "ф",
  "G": "Г", "g": "г",
  "H": "Ҳ", "h": "ҳ",
  "I": "И", "i": "и",
  "J": "Ж", "j": "ж",
  "K": "К", "k": "к",
  "L": "Л", "l": "л",
  "M": "М", "m": "м",
  "N": "Н", "n": "н",
  "O": "О", "o": "о",
  "P": "П", "p": "п",
  "Q": "Қ", "q": "қ",
  "R": "Р", "r": "р",
  "S": "С", "s": "с",
  "T": "Т", "t": "т",
  "U": "У", "u": "у",
  "V": "В", "v": "в",
  "X": "Х", "x": "х",
  "Y": "Й", "y": "й",
  "Z": "З", "z": "з",
  "'": "ъ", "`": "ъ", "’": "ъ", "‘": "ъ"
};

const cyrillicToLatinMap = {
  "Ғ": "G'", "ғ": "g'",
  "Ў": "O'", "ў": "o'",
  "Ш": "Sh", "ш": "sh",
  "Ч": "Ch", "ч": "ch",
  "Ё": "Yo", "ё": "yo",
  "Ю": "Yu", "ю": "yu",
  "Я": "Ya", "ya": "ya",
  "Е": "E", "е": "e",
  "Э": "E", "э": "e",
  "Ц": "Ts", "ц": "ts",
  "Щ": "Sh", "щ": "sh",
  "А": "A", "а": "a",
  "Б": "B", "б": "b",
  "В": "V", "в": "v",
  "Г": "G", "г": "g",
  "Д": "D", "д": "d",
  "Ж": "J", "ж": "j",
  "З": "Z", "з": "z",
  "И": "I", "и": "i",
  "Й": "Y", "й": "y",
  "К": "K", "к": "k",
  "Қ": "Q", "қ": "q",
  "Л": "L", "л": "l",
  "М": "M", "м": "m",
  "Н": "N", "н": "n",
  "О": "O", "о": "o",
  "П": "P", "п": "p",
  "Р": "R", "р": "r",
  "С": "S", "с": "s",
  "Т": "T", "т": "t",
  "У": "U", "у": "u",
  "Ф": "F", "ф": "f",
  "Х": "X", "х": "x",
  "Ҳ": "H", "ҳ": "h",
  "Ъ": "'", "ъ": "'",
  "Ь": "", "ь": ""
};

export function latinToCyrillic(text) {
  if (!text || typeof text !== 'string') return text || '';
  
  // So'z boshidagi E -> Э, unlidan keyingi E -> Е, undoshdan keyingi E -> Е qoidalari
  let result = text;

  // Ikki belgili birikmalarni oldin almashtiramiz
  const compoundKeys = ["G'", "g'", "G`", "g`", "G’", "g’", "G‘", "g‘",
                        "O'", "o'", "O`", "o`", "O’", "o’", "O‘", "o‘",
                        "Sh", "sh", "SH", "Ch", "ch", "CH",
                        "Yo", "yo", "YO", "Yu", "yu", "YU", "Ya", "ya", "YA", "Ye", "ye", "YE"];

  for (const k of compoundKeys) {
    const reg = new RegExp(k, 'g');
    result = result.replace(reg, latinToCyrillicMap[k]);
  }

  // So'z boshidagi E ni Э ga o'girish
  result = result.replace(/(^|[\s\(\[\{,\.\?!;:])E/g, '$1Э');
  result = result.replace(/(^|[\s\(\[\{,\.\?!;:])e/g, '$1э');

  // Bir belgili harflar
  return result.split('').map(char => latinToCyrillicMap[char] || char).join('');
}

export function cyrillicToLatin(text) {
  if (!text || typeof text !== 'string') return text || '';
  
  // So'z boshidagi Е -> Ye, unlidan keyingi Е -> Ye
  let result = text;
  result = result.replace(/(^|[\s\(\[\{,\.\?!;:])Е/g, '$1Ye');
  result = result.replace(/(^|[\s\(\[\{,\.\?!;:])е/g, '$1ye');
  result = result.replace(/([аеёиоуэюяАЕЁИОУЭЮЯ])Е/g, '$1Ye');
  result = result.replace(/([аеёиоуэюяАЕЁИОУЭЮЯ])е/g, '$1ye');

  // Qolgan harflarni almashtirish
  return result.split('').map(char => {
    if (Object.prototype.hasOwnProperty.call(cyrillicToLatinMap, char)) {
      return cyrillicToLatinMap[char];
    }
    return char;
  }).join('');
}

export function detectScript(text) {
  if (!text) return 'latin';
  const cyrillicChars = text.match(/[\u0400-\u04FF]/g) || [];
  const latinChars = text.match(/[a-zA-Z]/g) || [];
  return cyrillicChars.length > latinChars.length ? 'cyrillic' : 'latin';
}
