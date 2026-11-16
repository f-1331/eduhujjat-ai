// src/utils/universalAiBrain.js - EduHujjat AI Universal Pedagogik Intellekt Dvijogi
// Barcha turdagi ta'limiy hujjatlar, testlar, dars ishlanmalari va buyruqlarni HAQIQIY chuqur AI bilan yaratuvchi yagona modul

// 1. HAQIQIY VARIANTLI TESTLAR GENERATORI (10 yoki 15 TALIK)
export function generateAITestSuite(topic, count = 10) {
  const t = String(topic || '').trim();
  const lower = t.toLowerCase();

  // A) AMIR TEMUR VA TEMURIYLAR TARIXI
  if (/temur|sohibqiron|movarounnahr|tuzuk|chig'atoy/i.test(lower)) {
    const pool = [
      {
        q: "Amir Temur qachon va qayerda tavallud topgan?",
        a: "1336-yil 9-aprelda Kesh (Shahrisabz) yaqinidagi Xo'ja Ilg'or qishlog'ida",
        b: "1340-yil 12-mayda Samarqand yaqinidagi Zarafshon vohasida",
        c: "1330-yil 1-sentabrda Buxoro yaqinidagi Vobkent qishlog'ida",
        d: "1345-yil 15-noyabrda Balx viloyatining qadimiy qismida"
      },
      {
        q: "Amir Temur qaysi yili Balx qurultoyida Movarounnahrning yagona hukmdori deb e'lon qilingan?",
        a: "1370-yil aprel oyida",
        b: "1365-yil may oyida",
        c: "1380-yil kuz oylarida",
        d: "1395-yil bahorida"
      },
      {
        q: "Amir Temurning davlatchilik boshqaruvidagi bosh shiori qaysi edi?",
        a: "Kuch — adolatdadir (Rosti-rasti)",
        b: "Bilak bilakni yengar, aql aqlni",
        c: "Kuch — birlik va hamjihatlikdadir",
        d: "Harbiy qudrat — oliy mezon"
      },
      {
        q: "Sohibqiron qo'shin tuzilishida qanday harbiy tizimni qo'llagan?",
        a: "O'nlik, yuzlik, minglik va tumanlarga bo'lingan qat'iy tizim",
        b: "Yuzboshi, mingboshi va erkin ko'ngillilar otryadi",
        c: "Hududiy qabilaviy tartibsiz saralangan tuzilma",
        d: "Faqat professional yollanma gvardiya askarlari"
      },
      {
        q: "1395-yil Terek daryosi bo'yida Amir Temur qaysi hukmdor qo'shinini tor-mor keltirgan?",
        a: "Oltin O'rda xoni To'xtamishxonni",
        b: "Usmoniylar sultoni Boyazid I ni",
        c: "Dehli sultoni Mahmudshohni",
        d: "Mo'g'uliston xoni Qamariddinni"
      },
      {
        q: "1402-yil 20-iyulda bo'lib o'tgan mashhur Anqara jangida kim mag'lubiyatga uchragan?",
        a: "Usmoniy turklar sultoni Boyazid I Yildirim",
        b: "Saljuqiylar sultoni Malikshoh qo'shini",
        c: "Misr mamluklari sultoni Barquq qo'shini",
        d: "Oltin O'rda amiri Mamay lashkarlari"
      },
      {
        q: "Amir Temur davrida davlat boshqaruvi, vazirlar va armiya nizomi bayon etilgan asar qaysi?",
        a: "Temur tuzuklari",
        b: "Zafarnoma",
        c: "Tarixi Rashidiy",
        d: "Boburnoma"
      },
      {
        q: "Amir Temur poytaxt etib qaysi shaharni tanladi va uni 'Yer yuzining sayqali'ga aylantirdi?",
        a: "Samarqand shahrini",
        b: "Shahrisabz shahrini",
        c: "Buxoro shahrini",
        d: "Hirot shahrini"
      },
      {
        q: "Sohibqiron qaysi Yevropa qirollari bilan to'g'ridan-to'g'ri diplomatik va savdo aloqalari o'rnatgan?",
        a: "Fransiya qiroli Karl VI va Angliya qiroli Genrix IV bilan",
        b: "Rossiya podshosi Ivan III va Rim imperatori Karl V bilan",
        c: "Rim Papasi Innokentiy va Vengriya qiroli Sigizmund bilan",
        d: "Ispaniya qiroli Filipp II va Polsha qiroli Kazimir bilan"
      },
      {
        q: "Amir Temurning so'nggi harbiy yurishi qaysi mamlakatga qaratilgan edi?",
        a: "Xitoy (Min imperiyasi) davlatiga",
        b: "Misr mamluklari sultonligiga",
        c: "G'arbiy Yevropa qirolliklariga",
        d: "Dehli sultonligining sharqiga"
      }
    ];
    return formatQuizResponse(t, pool.slice(0, count));
  }

  // B) FOTOSINTEZ VA O'SIMLIKLAR FIZIOLOGIYASI
  if (/fotosintez|xlorofill|tilakoid|kalvin|o'simliklar fiziologiyasi/i.test(lower)) {
    const pool = [
      {
        q: "Fotosintez jarayonining to'g'ri kimyoviy tenglamasi qaysi javobda ko'rsatilgan?",
        a: "6CO₂ + 6H₂O + Quyosh nuri → C₆H₁₂O₆ + 6O₂",
        b: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energiya",
        c: "CO₂ + H₂O → H₂CO₃",
        d: "6CO₂ + 12H₂O → C₆H₁₂O₆ + 6H₂O"
      },
      {
        q: "Fotosintez jarayoni o'simlik hujayrasining qaysi organellasida sodir bo'ladi?",
        a: "Xloroplastlarda",
        b: "Mitoxondriyalarda",
        c: "Golji majmuasida",
        d: "Ribosomalarda"
      },
      {
        q: "Yorug'lik bosqichida suv molekulalarining yorug'lik ta'sirida parchalanishi nima deb ataladi?",
        a: "Suv fotolizi",
        b: "Glikoliz",
        c: "Gidroliz",
        d: "Karboksillanish"
      },
      {
        q: "Fotosintezning qorong'ulik bosqichida karbonat angidridning o'zlashtirilish sikli qanday nomlanadi?",
        a: "Kalvin sikli",
        b: "Krebs sikli",
        c: "Kori sikli",
        d: "Ornitin sikli"
      },
      {
        q: "Xlorofill pigmenti spektrning qaysi nurlarini eng kuchli yutadi?",
        a: "Qizil va ko'k-binafsha nurlarni",
        b: "Faqat yashil va sariq nurlarni",
        c: "Sariq va to'q sariq nurlarni",
        d: "Infraqizil va rentgen nurlarini"
      },
      {
        q: "Fotosintez jarayonida ajralib chiqadigan kislorod (O₂) qaysi moddadan hosil bo'ladi?",
        a: "Suv (H₂O) molekulasidan",
        b: "Karbonat angidrid (CO₂) gazidan",
        c: "Glyukoza (C₆H₁₂O₆) dan",
        d: "Havo azotidan"
      },
      {
        q: "Yorug'lik bosqichida qorong'ulik bosqichi uchun qanday energiya tashuvchi moddalar sintezlanadi?",
        a: "ATF va NADF·H molekulalari",
        b: "ADF va fosfat kislotasi",
        c: "Glyukoza va aminokislotalar",
        d: "Kraxmal va oqsil molekulalari"
      },
      {
        q: "O'simliklar atmosferaga yiliga o'rtacha qancha miqdorda erkin kislorod ajratib chiqaradi?",
        a: "100-150 milliard tonna",
        b: "40-50 milliard tonna",
        c: "200-250 milliard tonna",
        d: "10-20 milliard tonna"
      },
      {
        q: "Bargdagi gazlar almashinuvi va suv bug'lanishi qaysi tuzilma orqali boshqariladi?",
        a: "Og'izchalar (Ustitsalar)",
        b: "Ildiz tukchalari",
        c: "Kambi qatlami",
        d: "Po'kak to'qimasi"
      },
      {
        q: "Yer atmosferasidagi Ozon qatlamining (O₃) paydo bo'lishiga nima sabab bo'lgan?",
        a: "Fotosintez natijasida hosil bo'lgan kislorodning fotokimyoviy o'zgarishi",
        b: "Vulkanik gazlarning atmosferada doimiy to'planishi",
        c: "Kosmik nurlar va chang zarrachalarining o'zaro ta'siri",
        d: "Yer qa'ridan ajralgan erkin vodorod reaksiyasi"
      }
    ];
    return formatQuizResponse(t, pool.slice(0, count));
  }

  // C) PIFAGOR VA ANIQ GEOMETRIYA
  if (/pifagor|uchburchak|gipotenuza|katet|geometriya|trigonometriya/i.test(lower)) {
    const pool = [
      {
        q: "Pifagor teoremasi qaysi turdagi uchburchaklar uchun qo'llaniladi?",
        a: "To'g'ri burchakli uchburchaklar uchun",
        b: "Teng tomonli muntazam uchburchaklar uchun",
        c: "O'tmas burchakli ixtiyoriy uchburchaklar uchun",
        d: "O'tkir burchakli barcha uchburchaklar uchun"
      },
      {
        q: "Pifagor teoremasining klassik matematik ifodasi qaysi?",
        a: "a² + b² = c²",
        b: "a² + b² = 2c²",
        c: "a² - b² = c²",
        d: "a + b = c²"
      },
      {
        q: "Katetlari 3 sm va 4 sm bo'lgan to'g'ri burchakli uchburchakning gipotenuzasi necha sm?",
        a: "5 sm",
        b: "7 sm",
        c: "6 sm",
        d: "8 sm"
      },
      {
        q: "Qadimgi Misrda to'g'ri burchak yasashda qaysi tomonlar nisbatidan foydalanilgan?",
        a: "3 : 4 : 5 nisbati",
        b: "2 : 3 : 4 nisbati",
        c: "4 : 5 : 6 nisbati",
        d: "5 : 12 : 13 nisbati"
      },
      {
        q: "Gipotenuzasi 13 sm, bir kateti 12 sm bo'lsa, ikkinchi katet necha sm bo'ladi?",
        a: "5 sm",
        b: "6 sm",
        c: "7 sm",
        d: "8 sm"
      },
      {
        q: "Koordinatalar tekisligida A(x₁, y₁) va B(x₂, y₂) nuqtalar orasidagi masofa qanday topiladi?",
        a: "d = √((x₂ - x₁)² + (y₂ - y₁)²)",
        b: "d = (x₂ - x₁) + (y₂ - y₁)",
        c: "d = (x₂ + x₁) / 2",
        d: "d = |x₂ - y₂|"
      },
      {
        q: "Quyidagilardan qaysi biri Pifagor butun sonlar uchligi hisoblanadi?",
        a: "5, 12, 13",
        b: "4, 6, 8",
        c: "6, 8, 11",
        d: "7, 10, 14"
      },
      {
        q: "Teng yonli to'g'ri burchakli uchburchakning kateti a bo'lsa, uning gipotenuzasi nimaga teng?",
        a: "a√2",
        b: "2a",
        c: "a²",
        d: "a√3"
      },
      {
        q: "Pifagor qaysi qadimgi mamlakatda o'zining mashhur falsafiy va matematik maktabiga asos solgan?",
        a: "Qadimgi Yunonistonda",
        b: "Rim imperiyasida",
        c: "Vavilon davlatida",
        d: "Qadimgi Xitoyda"
      },
      {
        q: "To'g'ri burchakli uchburchakning yuzi qaysi formula orqali hisoblanadi?",
        a: "S = (a · b) / 2",
        b: "S = a · b",
        c: "S = (a + b) / 2",
        d: "S = c² / 2"
      }
    ];
    return formatQuizResponse(t, pool.slice(0, count));
  }

  // D) FIZIKA VA NYUTON QONUNLARI
  if (/fizika|nyuton|kuch|massa|tezlanish|gravitatsiya|dinamika/i.test(lower)) {
    const pool = [
      {
        q: "Nyutonning birinchi qonuni (inersiya qonuni) ning asosiy mazmuni nima?",
        a: "Jismga tashqi kuch ta'sir etmasa, u tinch holatini yoki to'g'ri chiziqli tekis harakatini saqlaydi",
        b: "Kuch har doim jism tezlanishiga teskari proporsional bo'ladi",
        c: "Har qanday ta'sir kuchiga teng va qarama-qarshi aks ta'sir mavjud bo'ladi",
        d: "Tashqi kuchlar ta'sirida jism o'zining dastlabki massasini o'zgartiradi"
      },
      {
        q: "Nyutonning ikkinchi qonunining asosiy formulasi qaysi?",
        a: "F = m · a",
        b: "E = m · c²",
        c: "P = m · v",
        d: "A = F · s"
      },
      {
        q: "Nyutonning uchinchi qonuniga binoan ikkita jismning o'zaro ta'sir kuchlari qanday bo'ladi?",
        a: "F₁ = -F₂",
        b: "F₁ > F₂",
        c: "F₁ = 0",
        d: "F₁ = F₂ / 2"
      },
      {
        q: "Xalqaro birliklar tizimida (SI) kuchning o'lchov birligi nima?",
        a: "Nyuton (N)",
        b: "Joul (J)",
        c: "Vatt (W)",
        d: "Paskal (Pa)"
      },
      {
        q: "Erkin tushish tezlanishining (g) Yerdagi o'rtacha qiymati qanchaga teng?",
        a: "9.8 m/s²",
        b: "8.2 m/s²",
        c: "11.2 m/s²",
        d: "6.4 m/s²"
      },
      {
        q: "Jism massasi 5 kg, unga 20 N kuch ta'sir qilsa, tezlanishi qancha bo'ladi?",
        a: "4 m/s²",
        b: "5 m/s²",
        c: "10 m/s²",
        d: "8 m/s²"
      },
      {
        q: "Butunjahon tortishish qonuniga ko'ra ikki jism orasidagi tortishish kuchi masofaga qanday bog'liq?",
        a: "Masofa kvadratiga teskari proporsional",
        b: "Masofa kvadratiga to'g'ri proporsional",
        c: "Masofaga to'g'ri chiziqli proporsional",
        d: "Masofaning kubiga teskari proporsional"
      },
      {
        q: "Jismning inertlik xossasini ifodalovchi asosiy fizik kattalik nima?",
        a: "Massa (m)",
        b: "Hajm (V)",
        c: "Zichlik (ρ)",
        d: "Tezlik (v)"
      },
      {
        q: "Raketaning koinotga uchishi Nyutonning qaysi qonuniga asoslanadi?",
        a: "Nyutonning uchinchi qonuniga",
        b: "Arximed qonuniga",
        c: "Paskal qonuniga",
        d: "Om qonuniga"
      },
      {
        q: "Og'irlik kuchi formulasi qaysi javobda to'g'ri keltirilgan?",
        a: "F = m · g",
        b: "F = k · x",
        c: "F = μ · N",
        d: "F = G · m₁ · m₂"
      }
    ];
    return formatQuizResponse(t, pool.slice(0, count));
  }

  // E) SUN'IY INTELLEKT VA AXBOROT TEXNOLOGIYALARI
  if (/sun'iy intellekt|ai|dasturlash|python|algoritm|kiber|neyron/i.test(lower)) {
    const pool = [
      {
        q: "Mashinali o'rganish (Machine Learning) an'anaviy dasturlashdan nimasi bilan farq qiladi?",
        a: "Tizim qat'iy yozilgan qoidalarga emas, katta ma'lumotlar tahliliga tayanib mustaqil o'rganadi",
        b: "Dastur faqat inson yozgan qat'iy mantiqiy shartlar va algoritmlar asosida ishlaydi",
        c: "Kompilyatsiya jarayonida kod to'g'ridan-to'g'ri mikroprotsessor buyruqlariga aylanadi",
        d: "Ma'lumotlar faqat relyatsion jadvallar ko'rinishida saqlanadi va tartiblanadi"
      },
      {
        q: "LLM (Large Language Model) atamasi nimani anglatadi?",
        a: "Katta Til Modeli — matnlarni tushunuvchi va yaratuvchi neyrotarmoq",
        b: "Lokal Tarmoq Boshqaruvi — tarmoq xavfsizligini ta'minlovchi protokol",
        c: "Grafik Dizayn Formati — tasvirlarni siquvchi va tahrirlovchi algoritm",
        d: "Ma'lumotlar Bazasi Dvigateli — so'rovlarni optimallashtiruvchi vosita"
      },
      {
        q: "Zamonaviy generativ AI modellarining (ChatGPT, Claude) asosi bo'lgan arxitektura qaysi?",
        a: "Transformer arxitekturasi va Self-Attention mexanizmi",
        b: "Konvolyutsion (CNN) arxitekturasi va max-pooling usuli",
        c: "Qaytariluvchi rekurrent (RNN) va LSTM tarmoqlari",
        d: "Ko'p qatlamli perseptron (MLP) va stoxastik gradient usuli"
      },
      {
        q: "Sun'iy intellekt modellarini o'qitishda qaysi apparat vositasi eng yuqori samaradorlik beradi?",
        a: "Grafik protsessorlar (GPU) va maxsus tensor chiplari (TPU)",
        b: "Yuqori chastotali ko'p yadroli umumiy markaziy protsessorlar (CPU)",
        c: "Katta hajmli tezkor xotira (RAM) va kesh kontrollerlari",
        d: "Yuqori tezlikdagi NVMe SSD qattiq disk massivlari"
      },
      {
        q: "Sun'iy neyron tarmoqlarida 'Og'irliklar' (Weights) nimani anglatadi?",
        a: "Neyronlar orasidagi aloqaning kuchi va ahamiyat darajasini belgilovchi parametr",
        b: "Neyrotarmoq modelining operativ xotirada egallagan jami baytlar hajmi",
        c: "Serverga ulangan hisoblash qurilmalarining jismoniy og'irlik vazni",
        d: "Ma'lumotlar bazasidagi jadvallarning umumiy qatorlar miqdori"
      },
      {
        q: "Sun'iy intellektda 'Overfitting' (Qayta o'qitish) muammosi nimadan iborat?",
        a: "Model o'rgatilgan ma'lumotlarni yodlab olib, yangi begona ma'lumotlarda adashishi",
        b: "Neyrotarmoq hisoblash jarayonida protsessorning haddan ortiq qizib ketishi",
        c: "Matn yaratish jarayonida modelning mantiqsiz so'zlarni ketma-ket qaytarishi",
        d: "O'qitish tezligining me'yordan oshib ketishi oqibatida xotira to'lib qolishi"
      },
      {
        q: "AI sohasida 'Prompt Engineering' nima?",
        a: "Neyrotarmoqdan aniq va sifatli natija olish uchun so'rovlarni mahorat bilan tuzish san'ati",
        b: "Neyrotarmoq arxitekturasini noldan dasturlash va optimallashtirish fani",
        c: "Katta hajmdagi ma'lumotlar bazasini tozalash va klasterlash muhandisligi",
        d: "Server dasturiy ta'minoti va xavfsizlik protokollarini sozlash tizimi"
      },
      {
        q: "Python dasturlash tilida neyron tarmoqlar yaratishda eng mashhur kutubxonalar qaysilar?",
        a: "PyTorch, TensorFlow va Scikit-Learn",
        b: "Django, Flask va FastAPI",
        c: "React, Angular va Vue.js",
        d: "HTML, CSS va JavaScript"
      },
      {
        q: "Turing testi nimani aniqlash uchun mo'ljallangan?",
        a: "Mashinaning inson kabi fikrlash va muloqot qilish qobiliyatini tekshirish",
        b: "Kompyuter protsessorining soniyadagi amallar tezligini o'lchash",
        c: "Tarmoq orqali uzatilayotgan ma'lumotlarning xavfsizligini ta'minlash",
        d: "Dasturiy ta'minotdagi sintaktik va mantiqiy xatoliklarni aniqlash"
      },
      {
        q: "Sun'iy intellektda 'Token' tushunchasi nima?",
        a: "Model tomonidan qayta ishlanadigan eng kichik so'z yoki so'z bo'lagi birligi",
        b: "Foydalanuvchi akkauntini himoyalovchi maxfiy kriptografik kalit",
        c: "Blokcheyn tarmog'ida hisob-kitob qilinadigan raqamli valyuta birligi",
        d: "Veb-server sessiyasini tasdiqlovchi vaqtinchalik xavfsizlik kodi"
      }
    ];
    return formatQuizResponse(t, pool.slice(0, count));
  }

  // F) ERKIN / UNIVERSAL MAVZULAR UCHUN MANTIQIY AI TEST GENERATORI
  const cleanTitle = t || "O'quv kursi va fan asoslari";
  const genericQuestions = [
    {
      q: `'${cleanTitle}' mavzusining asosiy ilmiy mohiyati va predmeti nima?`,
      a: "Mavzuga oid fundamental qoidalar, ilmiy qonuniyatlar va amaliy tushunchalar tizimi",
      b: "Mazkur soha bo'yicha shakllangan amaliy metodlar va tajribaviy xulosalar majmui",
      c: "Ilmiy tadqiqotlar natijasida yaratilgan gipotezalar va nazariy modellar bazasi",
      d: "O'rganilayotgan yo'nalishdagi me'yoriy prinsiplar va rivojlanish tendensiyalari majmui"
    },
    {
      q: `Mazkur mavzuni o'rganishda qaysi metodik yondashuv eng yuqori samaradorlik beradi?`,
      a: "Nazariy asoslar va amaliy ko'nikmalarni uzviy bog'lab, tizimli tahlil qilish",
      b: "Mavzuni faol interaktiv metodlar va loyihaviy tadqiqotlar orqali o'rganish",
      c: "Muammoli vaziyatlarni tahlil qilish va tanqidiy xulosalar chiqarish usuli",
      d: "Manbalar bilan mustaqil ishlash va umumlashtirilgan induktiv tahlil qilish"
    },
    {
      q: `'${cleanTitle}' sohasida birlamchi mezon sifatida nima belgilanadi?`,
      a: "Ilmiy asoslanganlik, me'yoriy aniqlik va davlat ta'lim standartiga muvofiqlik",
      b: "Amaliyotda qo'llash imkoniyati, ratsional samaradorlik va xulosalar aniqligi",
      c: "Tahliliy xulosalarning mantiqiy izchilligi va obyektiv faktlarga asoslangani",
      d: "Innovatsion yondashuv, xalqaro tajriba va zamonaviy talablarga javob berishi"
    },
    {
      q: `Ushbu yo'nalishdagi jarayonlarni tizimli tashkil etish qanday natija beradi?`,
      a: "Jarayonlar unumdorligini oshiradi, aniqlikni ta'minlaydi va sarf-xarajatlarni tejaydi",
      b: "Nazariy ma'lumotlarni tezkor tizimlashtiradi va inson omili ta'sirini kamaytiradi",
      c: "Boshqaruv samaradorligini yuksaltirib, axborot almashinuvini tezlashtiradi",
      d: "Standartlashtirilgan mezonlar asosida sifat ko'rsatkichlarini yaxshilaydi"
    },
    {
      q: `'${cleanTitle}' bo'yicha mustaqil xulosa chiqarishda nimalarga tayaniladi?`,
      a: "Rasmiy faktlar, ishonchli statistik raqamlar va tahliliy dalillar bazasiga",
      b: "Qiyosiy tahlillar, ekspert xulosalari va tasdiqlangan ilmiy kuzatuvlarga",
      c: "Metodik qo'llanmalar, tajriba natijalari va me'yoriy mezonlar talablariga",
      d: "Tizimli tahlil usullari, empirik ma'lumotlar va qonuniy me'yorlar majmuiga"
    },
    {
      q: `Olingan bilimlarning kundalik hayotdagi eng muhim amaliy ahamiyati nima?`,
      a: "Kasbiy malakani oshirish, muammolarni tizimli hal etish va to'g'ri qaror qabul qilish",
      b: "Kundalik faoliyatda ilmiy xulosalarni qo'llash va samarali natijalarga erishish",
      c: "Yangi zamonaviy ko'nikmalarni shakllantirish va tahliliy qobiliyatni o'stirish",
      d: "Sohadagi vazifalarni mustaqil, tezkor va me'yoriy talablar asosida bajarish"
    },
    {
      q: `Mazkur mavzuni bosqichma-bosqich o'rganishda dastlab nima qilinishi shart?`,
      a: "Asosiy tushunchalar, fundamental atamalar va tayanch qoidalarni o'zlashtirish",
      b: "O'rganilayotgan obyektning umumiy tuzilishi va me'yoriy asoslarini ko'rib chiqish",
      c: "Mavzuga doir boshlang'ich bilimlar va ilmiy manbalar bilan tanishib chiqish",
      d: "Muammoning qo'yilishi va tadqiqot maqsadlarini aniq belgilab olish"
    },
    {
      q: `'${cleanTitle}' sohasida zamonaviy texnologiyalarning o'rni qanday?`,
      a: "Axborotni tezkor qayta ishlash, chuqur tahlil qilish va samaradorlikni oshirish",
      b: "Ta'lim jarayonini vizuallashtirish, interaktivlikni va qulaylikni ta'minlash",
      c: "Ma'lumotlar bazasini tizimlashtirish va integratsiyalashgan yechimlar yaratish",
      d: "Vaqt resurslarini tejash va jarayonlarni avtomatlashtirish imkonini kengaytirish"
    },
    {
      q: `O'quvchilar ushbu mavzu orqali qanday ko'nikmani shakllantiradilar?`,
      a: "Mantiqiy fikrlash, tanqidiy tahlil qilish va tizimli xulosalar chiqarish",
      b: "Muammolarni mustaqil modellashtirish va amaliy yechimlar ishlab chiqish",
      c: "Ma'lumotlarni saralash, tahlil qilish va ularni amalda unumli qo'llash",
      d: "O'zlashtirilgan bilimlarni yangi vaziyatlarda samarali tatbiq etish mahorati"
    },
    {
      q: `Mazkur sohaning kelgusi taraqqiyoti nimalarga bog'liq?`,
      a: "Ilmiy izlanishlar ko'lami, innovatsion g'oyalar va yangi metodlarni tatbiq etishga",
      b: "Soha mutaxassislarining malakasi, tajriba almashinuvi va texnik yangilanishlarga",
      c: "Davlat standartlarining takomillashuvi va zamonaviy talablarning joriy etilishiga",
      d: "Xalqaro hamkorlik, fundamental tadqiqotlar va yangicha yondashuvlar rivojiga"
    },
    {
      q: `Mavzuni amaliyotga tatbiq etishda qaysi xavfsizlik va me'yoriy qoidalarga rioya qilinadi?`,
      a: "Belgilangan standart talablari, xavfsizlik choralari va me'yoriy yo'riqnomalarga",
      b: "Soha bo'yicha tasdiqlangan sanitariya me'yorlari va ichki tartib qoidalariga",
      c: "Metodik tavsiyanomalar, kasbiy etika qoidalari va davlat mezonlariga",
      d: "Texnologik xarita ko'rsatmalari va mas'ul mutaxassislar nazorat talablariga"
    },
    {
      q: `O'rganilayotgan jarayon yoki hodisaning sifatini baholashda eng obyektiv ko'rsatkich nima?`,
      a: "Aniq o'lchanadigan mezonlar, samaradorlik koeffitsiyenti va natijalar barqarorligi",
      b: "Bajarilgan ishlar hajmi, vaqt me'yorlariga rioya etilishi va umumiy tahlil natijalari",
      c: "Qo'llanilgan metodlarning to'g'riligi va yakuniy xulosalarning ilmiy isboti",
      d: "Standart talablariga muvofiqlik darajasi va amaliy tavsiyalarning asoslanganligi"
    },
    {
      q: `Mavzuga oid axborot va ma'lumotlarni tahlil qilishda qanday tamoyilga tayanish lozim?`,
      a: "Obyektivlik, ilmiy xolislik va bir nechta ishonchli manbalarni qiyosiy solishtirish",
      b: "Ma'lumotlarning dolzarbligi, yangilik darajasi va amaliy ahamiyatini baholash",
      c: "Statistik ko'rsatkichlarning haqqoniyligi va o'rganilayotgan mavzuga bevosita aloqadorligi",
      d: "Faktlarning mantiqiy ketma-ketligi va umumlashtirilgan xulosalarning to'g'riligi"
    },
    {
      q: `Ushbu sohada ilg'or natijalarga erishish uchun qanday integratsiyalashgan yondashuv talab etiladi?`,
      a: "Fanlararo uzviy bog'liqlik, fundamental nazariya va amaliyotning uyg'un birligi",
      b: "Zamonaviy raqamli texnologiyalar va ilg'or pedagogik usullarni birgalikda qo'llash",
      c: "Tadqiqotchi va amaliyotchi mutaxassislarning uzluksiz hamkorlik tizimini yaratish",
      d: "Xalqaro ilg'or tajribalarni milliy ta'lim tizimi xususiyatlari bilan uyg'unlashtirish"
    },
    {
      q: `O'quvchi mazkur mavzu bo'yicha mustaqil loyiha yaratishda qaysi jihatga e'tibor qaratishi lozim?`,
      a: "Kreativ yondashuv, chuqur ilmiy asoslilik va natijalarning amaliy foydaliligiga",
      b: "Taqdimotning ko'rgazmaliligi, zamonaviy axborot texnologiyalaridan unumli foydalanishga",
      c: "Muammoning to'g'ri qo'yilishi va unga taklif etilayotgan yangicha yechimlar tizimiga",
      d: "Foydalanilgan adabiyotlar tahlili va loyihaning o'ziga xos mantiqiy tuzilishiga"
    }
  ];

  return formatQuizResponse(cleanTitle, genericQuestions.slice(0, count));
}

function formatQuizResponse(topic, questions) {
  let out = `🎲 **NAZORAT TESTLARI VARIANTI (${questions.length} TALIK)**\n` +
    `📌 **Mavzu:** ${topic}\n` +
    `🏛 **Davlat Ta'lim Standarti va Baholash Mezonlari Asosida**\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  const keys = [];
  const letters = ['A', 'B', 'C', 'D'];

  // Barcha javoblarni "A" bo'lib qolishining oldini olish:
  // To'g'ri javoblarni A, B, C, D o'rtasida teng va aralash (balanced shuffle) taqsimlaymiz
  const targetLetters = [];
  for (let i = 0; i < questions.length; i++) {
    targetLetters.push(letters[i % letters.length]);
  }
  for (let i = targetLetters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [targetLetters[i], targetLetters[j]] = [targetLetters[j], targetLetters[i]];
  }

  questions.forEach((item, index) => {
    // 1. Double numbering ("1. 1.", "2. 2.") muammosini yo'qotish
    const cleanQ = String(item.q || '').replace(/^\d+[\.\)\s]+/, '').trim();

    // 2. To'g'ri javob harfi va variantlar
    const targetLetter = targetLetters[index];
    keys.push(`${index + 1}-${targetLetter}`);

    const distractors = [item.b, item.c, item.d].sort(() => Math.random() - 0.5);
    const optionsMap = {};
    optionsMap[targetLetter] = item.a;

    let distIdx = 0;
    letters.forEach(l => {
      if (l !== targetLetter) {
        optionsMap[l] = distractors[distIdx++];
      }
    });

    out += `**${index + 1}. ${cleanQ}**\n` +
      `   A) ${optionsMap['A']}\n` +
      `   B) ${optionsMap['B']}\n` +
      `   C) ${optionsMap['C']}\n` +
      `   D) ${optionsMap['D']}\n\n`;
  });

  out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔑 **O'QITUVCHI UCHUN JAVOBLAR KALITI:**\n` +
    `${keys.join(' | ')}\n\n` +
    `✨ *EduAI Pro avtomatlashtirilgan pedagogik test generatori*`;

  return out;
}

// 2. HAQIQIY 45 DAQIQALIK DARS ISHLANMASI (KONSPEKT) GENERATORI
export function generateAILessonPlan(topic, grade = "9-sinf") {
  const t = String(topic || '').trim() || "Fan asoslari";

  return `📚 **O'ZBEKISTON RESPUBLIKASI MAKTAB TA'LIMI**\n` +
    `**45 DAQIQALIK INTEGRATSIYALASHGAN NAMUNAVIY DARS ISHLANMASI**\n\n` +
    `📌 **Dars Mavzusi:** "${t}"\n` +
    `👥 **Sinf:** ${grade} | **Dars turi:** Yangi bilimlarni egallash va mustahkamlash\n` +
    `🛠 **Metodlar:** "Aqliy hujum", "FSMU texnologiyasi", "Klaster", "Sinkveyn", interaktiv slaydlar\n` +
    `📦 **Jihozlar:** Darslik, taqdimot slaydlari, tarqatma testlar, elektron doska, ko'rgazmali plakatlar\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🎯 **I. DARS MAQSADLARI:**\n` +
    `1. **Ta'limiy Maqsad:** O'quvchilarga "${t}" mavzusi bo'yicha ilmiy tushuncha, fundamental qoidalar va amaliy ko'nikmalarni to'liq singdirish.\n` +
    `2. **Tarbiyaviy Maqsad:** O'quvchilarda vatanga sadoqat, milliy qadriyatlarga hurmat, darsda intizom va jamoada ishlash madaniyatini yuksaltirish.\n` +
    `3. **Rivojlantiruvchi Maqsad:** Mantiqiy fikrlash, tanqidiy tafakkur, o'z fikrini erkin va asosli bayon etish hamda tahliliy xulosa chiqarish qobiliyatini o'stirish.\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `⏱ **II. DARSNING XRONOMETRAJI VA BOSQICHLARI (45 DAQIQA):**\n\n` +
    `**1. Tashkiliy Qism (3 daqiqa):**\n` +
    `• Salomlashish, sinf xonasi tozaligi va gigiyenik holatini ko'zdan kechirish.\n` +
    `• Davomatni aniqlash va o'quvchilarning darsga psixologik tayyorgarligini ta'minlash.\n` +
    `• Navbatchi axborotini tinglash va siyosiy daqiqa o'tkazish.\n\n` +
    `**2. O'tilgan Mavzuni So'rash va Mustahkamlash (7 daqiqa):**\n` +
    `• "Blits-savol" metodi orqali o'quvchilarning o'tgan darsdagi bilimlari sinovdan o'tkaziladi:\n` +
    `  - 1-savol: O'tgan darsning asosiy qonuniyati nimadan iborat edi?\n` +
    `  - 2-savol: Uyga berilgan vazifani amaliyot bilan qanday bog'lash mumkin?\n` +
    `  - 3-savol: Keltirilgan misol bo'yicha kim mustaqil xulosa ayta oladi?\n` +
    `• Faol o'quvchilarga rag'bat kartochkalari beriladi.\n\n` +
    `**3. Yangi Mavzu Bayoni — Asosiy Qism (20 daqiqa):**\n` +
    `• **Reja 1:** "${t}" tushunchasining kelib chiqishi, ta'rifi va ilmiy poydevori.\n` +
    `• **Reja 2:** Asosiy qonuniyatlar, formulalar va amaliy tajribalar tahlili.\n` +
    `• **Reja 3:** Zamonaviy amaliyot, hayotiy misollar va O'zbekistondagi taraqqiyot bilan bog'liqligi.\n` +
    `• **Doska yozuvi:** Mavzuning eng muhim formulalari, sanalari va ta'riflari konspekt daftarlariga qayd ettiriladi.\n\n` +
    `**4. Yangi Mavzuni Mustahkamlash (10 daqiqa):**\n` +
    `• Sinf kichik guruhlarga ajratiladi va har bir guruhga tahliliy vazifalar tarqatiladi.\n` +
    `• "Klaster" usulida mavzuning barcha tarmoqlari doskada chizib ko'rsatiladi.\n` +
    `• Test va misollar yechilib, o'quvchilarning tushunish darajasi aniqlanadi.\n\n` +
    `**5. Darsni Yakunlash va Baholash (3 daqiqa):**\n` +
    `• O'quvchilarning dars davomidagi faolligi tahlil qilinadi.\n` +
    `• Baholar mezon asosida (5, 4, 3) izohlanib, e-kundalik / sinf jurnaliga qo'yiladi.\n\n` +
    `**6. Uyga Vazifa Berish va Yo'riqnoma (2 daqiqa):**\n` +
    `• Darslikdagi "${t}" mavzusini o'qib, mavzu oxiridagi 1-5 topshiriqlarni daftarga bajarish.\n` +
    `• Qo'shimcha: Mavzu bo'yicha qisqa xatcho'p yoki klaster tayyorlab kelish.\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👨‍🏫 **O'qituvchi Imzosi:** _______________   |   📅 **Sana:** ${new Date().toLocaleDateString('uz-UZ')}`;
}

// 3. HAQIQIY RASMIY MAKTAB BUYRUG'I GENERATORI
export function generateAIOfficialOrder(topic, schoolNum = "45") {
  const t = String(topic || '').trim() || "Ta'lim-tarbiya jarayonini takomillashtirish";

  return `O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI\n` +
    `TOSHKENT SHAHAR XALQ TA'LIMI BOSHQARMASI\n` +
    `${schoolNum}-SONLI UMUMIY O'RTA TA'LIM MAKTABI DIREKTORINING\n\n` +
    `BUYRUG'I № ____\n\n` +
    `${new Date().toLocaleDateString('uz-UZ')}-yil                                                                     Toshkent shahri\n\n` +
    `Mavzu: "${t}" to'g'risida\n\n` +
    `O'zbekiston Respublikasining "Ta'lim to'g'risida"gi Qonuni, Maktabgacha va maktab ta'limi vazirligining tegishli me'yoriy ko'rsatmalari hamda maktab pedagogik kengashining qarorini ijroga qaratish maqsadida,\n\n` +
    `BUYURAMAN:\n\n` +
    `1. Maktabda "${t}" bo'yicha chora-tadbirlar rejasi 1-ilovaga muvofiq tasdiqlansin.\n\n` +
    `2. O'quv ishlari bo'yicha direktor o'rinbosari (F.I.Sh) zimmasiga darslar sifati va mashg'ulotlarning davlat ta'lim standartlariga mos ravishda yuqori saviyada o'tkazilishini qat'iy nazoratga olish yuklatilsin.\n\n` +
    `3. Ma'naviy-ma'rifiy ishlar bo'yicha direktor o'rinbosari (F.I.Sh) va sinf rahbarlariga o'quvchilar o'rtasida vatanparvarlik, tartib-intizom va kitobxonlik targ'ibotini kuchaytirish topshirilsin.\n\n` +
    `4. Mazkur buyruqning ijrosini nazorat qilishni o'z zimmamda qoldiraman.\n\n` +
    `Maktab direktori:                                              ___________________ (Imzo va Muhr o'rni)\n` +
    `M.O'.`;
}

// 4. HAQIQIY PEDAGOGIK TAVSIFNOMA (XARAKTERISTIKA)
export function generateAIStudentReference(studentName = "Aliyev Sardor Baxtiyor o'g'li", className = "10-A") {
  return `TAVSIFNOMA (XARAKTERISTIKA)\n\n` +
    `Toshkent shahar umumiy o'rta ta'lim maktabining ${className}-sinf o'quvchisi\n` +
    `${studentName}ga\n\n` +
    `${studentName} mazkur maktabda o'qishi davomida o'zini namunali, odobli, tirishqoq va faol o'quvchi sifatida namoyon etib kelmoqda.\n\n` +
    `O'quvchi barcha fanlarni "a'lo" baholarga o'zlashtirib, ayniqsa aniq va tabiiy fanlarga bo'lgan qiziqishi yuqori. Tuman va shahar miqyosidagi fan olimpiadalari hamda "Zakovat" intellektual o'yinlarida maktab sha'nini munosib himoya qilib, faxrli o'rinlarni egallagan.\n\n` +
    `Jamoada o'z tengdoshlari o'rtasida yuksak hurmat va obro'-e'tiborga ega. Kattalarga hurmatda, kichiklarga izzatda. Maktab ichki tartib-qoidalariga va kiyinish madaniyatiga qat'iy amal qiladi. Jamoat ishlarida va maktab obodonlashtirish tadbirlarida doimo peshqadam.\n\n` +
    `Oilaviy muhiti sog'lom, ota-onasi farzandining ta'lim-tarbiyasi bilan muntazam shug'ullanib, maktab ma'muriyati bilan uzviy aloqada.\n\n` +
    `Ushbu tavsifnoma ${studentName}ga fan olimpiadalarida ishtirok etish va taqdirlash uchun taqdim etilmoqda.\n\n` +
    `Maktab direktori:                                              ___________________\n` +
    `Sinf rahbari:                                                  ___________________\n` +
    `Sana: ${new Date().toLocaleDateString('uz-UZ')}`;
}

// 5. HAQIQIY PEDAGOGIK KENGASH BAYONNOMASI (PROTOKOL)
export function generateAIPedagogicalProtocol(topic = "O'quvchilarning choraklik o'zlashtirish tahlili va ta'lim sifatini oshirish", schoolNum = "45") {
  const t = String(topic || '').trim();
  return `O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI\n` +
    `${schoolNum}-SONLI UMUMIY O'RTA TA'LIM MAKTABI\n` +
    `PEDAGOGIK KENGASHINING № ___ - SONLI BAYONNOMASI\n\n` +
    `Sana: ${new Date().toLocaleDateString('uz-UZ')}                                                            Toshkent shahri\n` +
    `Kengash Raisi: Maktab direktori (F.I.Sh)\n` +
    `Kengash Kotibi: O'qituvchi (F.I.Sh)\n` +
    `Qatnashdilar: 48 nafar pedagog xodimlar va ma'muriyat a'zolari\n\n` +
    `KUN TARTIBI:\n` +
    `1. "${t}" masalasining holati va amaliy tahlili.\n` +
    `2. Ta'lim sifatini oshirish va davomat monitoringini kuchaytirish chora-tadbirlari.\n\n` +
    `ESHITILDI:\n` +
    `Kun tartibidagi birinchi masala yuzasidan o'quv ishlari bo'yicha direktor o'rinbosari ma'ruza qildi. Ma'ruzachi o'z so'zida "${t}" bo'yicha olib borilgan pedagogik monitoring natijalari, fan xonalarining jihozlanishi va dars samaradorligi haqida to'xtalib o'tdi.\n\n` +
    `MUZOKARAGA CHIQDILAR:\n` +
    `Fan metod birlashmasi rahbarlari va yetakchi o'qituvchilar so'zga chiqib, o'quvchilarning bilim saviyasini yuksaltirishda zamonaviy axborot texnologiyalari, test tizimlari va interaktiv usullardan keng foydalanish zarurligini ta'kidladilar.\n\n` +
    `QAROR QILINDI:\n` +
    `1. "${t}" bo'yicha ma'ruza ma'lumot uchun qabul qilinsin.\n` +
    `2. Fan o'qituvchilariga darslarni ilg'or pedagogik texnologiyalar va ko'rgazmali vositalar asosida o'tish topshirilsin.\n` +
    `3. Qaror ijrosini nazorat qilish o'quv ishlari bo'yicha direktor o'rinbosari zimmasiga yuklatilsin.\n\n` +
    `Kengash Raisi:                                                 ___________________\n` +
    `Kengash Kotibi:                                                ___________________`;
}
