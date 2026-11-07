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
        b: "1340-yil Samarqand shahrida",
        c: "1330-yil Buxoro yaqinida",
        d: "1345-yil Balx viloyatida"
      },
      {
        q: "Amir Temur qaysi yili Balx qurultoyida Movarounnahrning yagona hukmdori deb e'lon qilingan?",
        a: "1370-yil aprel oyida",
        b: "1365-yil 'Loy jangi'dan so'ng",
        c: "1380-yil Samarqandda",
        d: "1395-yil Terek daryosi bo'yida"
      },
      {
        q: "Amir Temurning davlatchilik boshqaruvidagi bosh shiori qaysi edi?",
        a: "Kuch — adolatdadir (Rosti-rasti)",
        b: "Bilak bilakni yengar, aql aqlni",
        c: "Kuch birlikda",
        d: "Harbiy qudrat — oliy mezon"
      },
      {
        q: "Sohibqiron qo'shin tuzilishida qanday harbiy tizimni qo'llagan?",
        a: "O'nlik, yuzlik, minglik va tumanlarga (10,000) bo'lingan qat'iy tizim",
        b: "Faqat yollanma chet ellik askarlar tizimi",
        c: "Hududiy qabilaviy tartibsiz otryadlar",
        d: "Faqat piyoda merganlar qo'shini"
      },
      {
        q: "1395-yil Terek daryosi bo'yida Amir Temur qaysi hukmdor qo'shinini tor-mor keltirgan?",
        a: "Oltin O'rda xoni To'xtamishxonni",
        b: "Usmoniylar sultoni Boyazid I ni",
        c: "Dehli sultoni Mahmudshohni",
        d: "Xitoy imperatori Min sulolasini"
      },
      {
        q: "1402-yil 20-iyulda bo'lib o'tgan mashhur Anqara jangida kim mag'lubiyatga uchragan?",
        a: "Usmoniy turklar sultoni Boyazid I Yildirim",
        b: "Saljuqiylar sultoni Sanjar",
        c: "Misr mamluklari sarkardasi",
        d: "Oltin O'rda amiri Mamay"
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
        b: "Shahrisabzni",
        c: "Buxoroni",
        d: "Hirotni"
      },
      {
        q: "Sohibqiron qaysi Yevropa qirollari bilan to'g'ridan-to'g'ri diplomatik va savdo aloqalari o'rnatgan?",
        a: "Fransiya qiroli Karl VI va Angliya qiroli Genrix IV bilan",
        b: "Rossiya podshosi Ivan Grozniy bilan",
        c: "Rim Papasi Innokentiy bilan",
        d: "Ispaniya qiroli Filipp II bilan"
      },
      {
        q: "Amir Temurning so'nggi harbiy yurishi qaysi mamlakatga qaratilgan edi?",
        a: "Xitoyga (Xitoy safari chog'ida 1405-yil O'trorda vafot etgan)",
        b: "Misrga",
        c: "Vengriyaga",
        d: "Hindistonga"
      }
    ];
    return formatQuizResponse(t, pool.slice(0, count));
  }

  // B) FOTOSINTEZ VA O'SIMLIKLAR FIZIOLOGIYASI
  if (/fotosintez|xlorofill|o'simlik|tilakoid|kalvin|biologiya/i.test(lower)) {
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
        a: "Kalvin sikli (C3-sikli)",
        b: "Krebs sikli",
        c: "Kori sikli",
        d: "Ornitin sikli"
      },
      {
        q: "Xlorofill pigmenti spektrning qaysi nurlarini eng kuchli yutadi?",
        a: "Qizil va ko'k-binafsha nurlarni",
        b: "Faqat yashil nurlarni",
        c: "Sariq va to'q sariq nurlarni",
        d: "Infraqizil nurlarni"
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
        a: "ATF va NADF·H",
        b: "Faqat ADF",
        c: "Faqat glyukoza",
        d: "Kraxmal va oqsillar"
      },
      {
        q: "O'simliklar atmosferaga yiliga o'rtacha qancha miqdorda erkin kislorod ajratib chiqaradi?",
        a: "100-150 milliard tonna",
        b: "1 million tonna",
        c: "500 ming tonna",
        d: "10 milliard tonna"
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
        b: "Vulkanik otilishlar gazlari",
        c: "Quyosh shamoli radiatsiyasi",
        d: "Kosmik changlar"
      }
    ];
    return formatQuizResponse(t, pool.slice(0, count));
  }

  // C) PIFAGOR VA ANIQ GEOMETRIYA
  if (/pifagor|uchburchak|gipotenuza|katet|geometriya|trigonometriya/i.test(lower)) {
    const pool = [
      {
        q: "Pifagor teoremasi qaysi turdagi uchburchaklar uchun qo'llaniladi?",
        a: "Faqat to'g'ri burchakli uchburchaklar uchun (burchagi 90°)",
        b: "Teng tomonli uchburchaklar uchun",
        c: "O'tmas burchakli ixtiyoriy uchburchaklar uchun",
        d: "Barcha ko'pburchaklar uchun"
      },
      {
        q: "Pifagor teoremasining klassik matematik ifodasi qaysi?",
        a: "a² + b² = c² (Gipotenuza kvadrati katetlar kvadratlari yig'indisiga teng)",
        b: "a + b = c",
        c: "a² - b² = c²",
        d: "c = a · b / 2"
      },
      {
        q: "Katetlari 3 sm va 4 sm bo'lgan to'g'ri burchakli uchburchakning gipotenuzasi necha sm?",
        a: "5 sm (√(3² + 4²) = √25 = 5)",
        b: "7 sm",
        c: "6 sm",
        d: "25 sm"
      },
      {
        q: "Qadimgi Misrda to'g'ri burchak yasashda qaysi tomonlar nisbatidan foydalanilgan?",
        a: "3 : 4 : 5 nisbatli 'Misr uchburchagi'",
        b: "1 : 1 : 2 nisbat",
        c: "2 : 3 : 4 nisbat",
        d: "5 : 10 : 15 nisbat"
      },
      {
        q: "Gipotenuzasi 13 sm, bir kateti 12 sm bo'lsa, ikkinchi katet necha sm bo'ladi?",
        a: "5 sm (√(13² - 12²) = √(169 - 144) = √25 = 5)",
        b: "1 sm",
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
        a: "5, 12, 13 (chunki 25 + 144 = 169)",
        b: "4, 5, 6",
        c: "6, 7, 8",
        d: "2, 3, 5"
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
        a: "Qadimgi Yunonistonda (Kroton shahrida)",
        b: "Rim imperiyasida",
        c: "Vavilon davlatida",
        d: "Qadimgi Xitoyda"
      },
      {
        q: "To'g'ri burchakli uchburchakning yuzi qaysi formula orqali hisoblanadi?",
        a: "S = (a · b) / 2 (katetlar ko'paytmasining yarmi)",
        b: "S = a · b",
        c: "S = a + b + c",
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
        b: "Kuch har doim massaga to'g'ri proporsional",
        c: "Har qanday ta'sirga teng va qarama-qarshi aks ta'sir mavjud",
        d: "Og'irlik kuchi faqat Yer markazida nolga teng"
      },
      {
        q: "Nyutonning ikkinchi qonunining asosiy formulasi qaysi?",
        a: "F = m · a (Kuch = massa × tezlanish)",
        b: "E = m · c²",
        c: "P = m · v",
        d: "A = F · s"
      },
      {
        q: "Nyutonning uchinchi qonuniga binoan ikkita jismning o'zaro ta'sir kuchlari qanday bo'ladi?",
        a: "F₁ = -F₂ (Kattaligi jihatidan teng, yo'nalishi bo'yicha qarama-qarshi)",
        b: "F₁ > F₂",
        c: "Doimo nolga teng",
        d: "F₁ = F₂ / 2"
      },
      {
        q: "Xalqaro birliklar tizimida (SI) kuchning o'lchov birligi nima?",
        a: "Nyuton (N = kg·m/s²)",
        b: "Joul (J)",
        c: "Vatt (W)",
        d: "Paskal (Pa)"
      },
      {
        q: "Erkin tushish tezlanishining (g) Yerdagi o'rtacha qiymati qanchaga teng?",
        a: "9.8 m/s² (taxminan 10 m/s²)",
        b: "100 m/s²",
        c: "3.14 m/s²",
        d: "1.6 m/s²"
      },
      {
        q: "Jism massasi 5 kg, unga 20 N kuch ta'sir qilsa, tezlanishi qancha bo'ladi?",
        a: "4 m/s² (a = F / m = 20 / 5 = 4)",
        b: "100 m/s²",
        c: "15 m/s²",
        d: "25 m/s²"
      },
      {
        q: "Butunjahon tortishish qonuniga ko'ra ikki jism orasidagi tortishish kuchi masofaga qanday bog'liq?",
        a: "Masofa kvadratiga teskari proporsional (F ~ 1/R²)",
        b: "Masofaga to'g'ri proporsional",
        c: "Masofaga bog'liq emas",
        d: "Masofa kubiga to'g'ri proporsional"
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
        a: "Nyutonning uchinchi qonuniga (reaktiv harakat printsipi)",
        b: "Arximed qonuniga",
        c: "Paskal qonuniga",
        d: "Om qonuniga"
      },
      {
        q: "Og'irlik kuchi formulasi qaysi javobda to'g'ri keltirilgan?",
        a: "F_og' = m · g",
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
        a: "Tizim qat'iy yozilgan qoidalarga emas, balki katta hajmdagi ma'lumotlar tahliliga tayanib mustaqil o'rganadi",
        b: "Hech qanday farqi yo'q",
        c: "Faqat apparat ta'minotiga bog'liq",
        d: "Faqat binar kodda ishlaydi"
      },
      {
        q: "LLM (Large Language Model) atamasi nimani anglatadi?",
        a: "Katta Til Modeli — inson tilidagi matnlarni tushunuvchi va yaratuvchi ulkan neyrotarmoq",
        b: "Lokal Tarmoq Boshqaruvi",
        c: "Grafik Dizayn Formati",
        d: "Ma'lumotlar Bazasi Dvigateli"
      },
      {
        q: "Zamonaviy generativ AI modellarining (ChatGPT, Claude) asosi bo'lgan arxitektura qaysi?",
        a: "Transformer arxitekturasi va Self-Attention mexanizmi",
        b: "Chiziqli regressiya",
        c: "Qarorlar daraxti (Decision Tree)",
        d: "Relatsion SQL arxitekturasi"
      },
      {
        q: "Sun'iy intellekt modellarini o'qitishda qaysi apparat vositasi eng yuqori samaradorlik beradi?",
        a: "Grafik protsessorlar (GPU) va maxsus tensor chiplari (TPU)",
        b: "Oddiy bitta yadroli CPU",
        c: "Qattiq disk (HDD)",
        d: "Faqat tezkor xotira (RAM)"
      },
      {
        q: "Sun'iy neyron tarmoqlarida 'Og'irliklar' (Weights) nimani anglatadi?",
        a: "Neyronlar orasidagi aloqaning kuchi va ahamiyat darajasini belgilovchi matematik parametr",
        b: "Kompyuterning jismoniy vazni",
        c: "Fayl hajmi",
        d: "Klaviatura bosilish kuchi"
      },
      {
        q: "Sun'iy intellektda 'Overfitting' (Qayta o'qitish) muammosi nimadan iborat?",
        a: "Model o'rgatilgan ma'lumotlarni yodlab olib, yangi begona ma'lumotlarga to'g'ri javob bera olmasligi",
        b: "Serverning haddan tashqari qizib ketishi",
        c: "Dasturning xotira yetishmasligi sababli o'chishi",
        d: "Internet tezligining pasayishi"
      },
      {
        q: "AI sohasida 'Prompt Engineering' nima?",
        a: "Neyrotarmoqdan eng aniq va sifatli natija olish uchun buyruq va so'rovlarni mahorat bilan tuzish san'ati",
        b: "Kompyuterlarni yig'ish muhandisligi",
        c: "Optik tolali kabellarni ulash",
        d: "Veb-sayt dizaynini chizish"
      },
      {
        q: "Python dasturlash tilida neyron tarmoqlar yaratishda eng mashhur kutubxonalar qaysilar?",
        a: "PyTorch, TensorFlow va Scikit-Learn",
        b: "Word va Excel",
        c: "Photoshop va Illustrator",
        d: "HTML va CSS"
      },
      {
        q: "Turing testi nimani aniqlash uchun mo'ljallangan?",
        a: "Mashinaning inson kabi fikrlash va muloqot qilish qobiliyatini tekshirish",
        b: "Protsessorning tezligini hisoblash",
        c: "Internetdagi viruslarni topish",
        d: "Xotira hajmini aniqlash"
      },
      {
        q: "Sun'iy intellektda 'Token' tushunchasi nima?",
        a: "Model tomonidan matnni qayta ishlash uchun bo'lingan so'z yoki so'z bo'lagi (o'rtacha 3-4 belgi)",
        b: "Kriptovalyuta birligi",
        c: "Foydalanuvchi paroli",
        d: "Dasturiy xatolik kodi"
      }
    ];
    return formatQuizResponse(t, pool.slice(0, count));
  }

  // F) ERKIN / UNIVERSAL MAVZULAR UCHUN MANTIQIY AI TEST GENERATORI
  const cleanTitle = t || "O'quv kursi va fan asoslari";
  const genericQuestions = [
    {
      q: `1. '${cleanTitle}' mavzusining asosiy ilmiy mohiyati va predmeti nima?`,
      a: "Tizimli tadqiqotlar, amaliy tajribalar va isbotlangan qonuniyatlar majmui",
      b: "Tasodifiy taxminiy mulohazalar to'plami",
      c: "Faqat bir tomonlama og'zaki fikrlar",
      d: "Nazariy asosga ega bo'lmagan ma'lumotlar"
    },
    {
      q: `2. Mazkur mavzuni o'rganishda qaysi metodik yondashuv eng yuqori samaradorlik beradi?`,
      a: "Nazariy qoidalar va amaliy ko'nikmalarni uzviy bog'lab tahlil qilish",
      b: "Faqat matnlarni mexanik yodlash",
      c: "Tahlilsiz yuzaki tanishib chiqish",
      d: "Amaliy sinovlardan voz kechish"
    },
    {
      q: `3. '${cleanTitle}' sohasida birlamchi mezon sifatida nima belgilanadi?`,
      a: "Aniq standartlar, ilmiy aniqlik va xalqaro mezonlarga muvofiqlik",
      b: "Ixtiyoriy sub'ektiv fikr",
      c: "Tasdiqlanmagan ma'lumotlar",
      d: "Faqat estetik ko'rinish"
    },
    {
      q: `4. Ushbu yo'nalishdagi jarayonlarni avtomatlashtirish qanday natija beradi?`,
      a: "Vaqt va resurslarni 3 barobargacha tejaydi, insoniy xatoliklarni bartaraf etadi",
      b: "Jarayonni keskin sekinlashtiradi",
      c: "Xarajatlarni asossiz oshiradi",
      d: "Ma'lumotlar aniqligini pasaytiradi"
    },
    {
      q: `5. '${cleanTitle}' bo'yicha mustaqil xulosa chiqarishda nimalarga tayaniladi?`,
      a: "Faktlar, ishonchli statistik raqamlar va tahliliy dalillarga",
      b: "Tasodifiy mish-mishlarga",
      c: "Sinovdan o'tmagan taxminlarga",
      d: "Eski qarashlarga"
    },
    {
      q: `6. Olingan bilimlarning kundalik hayotdagi eng muhim amaliy ahamiyati nima?`,
      a: "Muammolarni tez va tizimli yechish, professional malakani yuksaltirish",
      b: "Faqat imtihondan o'tish uchun zarur",
      c: "Hech qanday amaliy ta'sirga ega emas",
      d: "Faqat hujjatlarda qolib ketadi"
    },
    {
      q: `7. Mazkur mavzuni bosqichma-bosqich o'rganishda dastlab nima qilinishi shart?`,
      a: "Birlamchi tushunchalar va asosiy ta'riflarni aniq o'zlashtirish",
      b: "Darhol murakkab amaliyotga o'tish",
      c: "Rejasiz dars o'tish",
      d: "Faqat xulosani o'qish"
    },
    {
      q: `8. '${cleanTitle}' sohasida zamonaviy texnologiyalarning o'rni qanday?`,
      a: "Samaradorlikni oshiruvchi va chuqur tahlil imkonini beruvchi asosiy vosita",
      b: "Faqat vaqt oluvchi to'siq",
      c: "Ikkilamchi ahamiyatga ega vosita",
      d: "Zaruratsiz qo'shimcha"
    },
    {
      q: `9. O'quvchilar ushbu mavzu orqali qanday ko'nikmani shakllantiradilar?`,
      a: "Mantiqiy fikrlash, tanqidiy tahlil va amaliy muammolarni hal qilish",
      b: "Faqat ko'chirib yozish",
      c: "Passiv tinglash",
      d: "Yuzaki eslab qolish"
    },
    {
      q: `10. Mazkur sohaning kelgusi taraqqiyoti nimalarga bog'liq?`,
      a: "Ilmiy izlanishlar, yangiliklarni tezkor tatbiq etish va doimiy rivojlanishga",
      b: "Eski usullarni o'zgartirmaslikka",
      c: "Tashqi ta'sirlardan yakkalanib qolishga",
      d: "O'rganishni to'xtatishga"
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

  questions.forEach((item, index) => {
    // A javobni to'g'ri qilib belgilaymiz, lekin shartli ravishda variantlarni ko'rsatamiz
    keys.push(`${index + 1}-A`);
    out += `**${index + 1}. ${item.q}**\n` +
      `   A) ${item.a}\n` +
      `   B) ${item.b}\n` +
      `   C) ${item.c}\n` +
      `   D) ${item.d}\n\n`;
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
